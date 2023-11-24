import macro from '@kitware/vtk.js/macro';
import vtkPoints from '@kitware/vtk.js/Common/Core/Points';
import vtkCellArray from '@kitware/vtk.js/Common/Core/CellArray';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import vtkCoordinate from '@kitware/vtk.js/Rendering/Core/Coordinate';
import { BBox, isPointInPolygonV2 as isPointInPolygon } from './geometry';

// 如果是多边形选区的话，先找到多边形的BBox，再判断这些顶点是否再多边形中
function highlightSelectionPoints(publicAPI, model) {
  model.classHierarchy.push('highlightSelectionPoints');

  let selectedPointIndexes = []

  publicAPI.requestData = (inData, outData) => {
    if (!inData[0]) return
    
    const input = inData[0]
    if (!input.getCells()) {
      input.buildLinks();
    }
    const output = vtkPolyData.newInstance();
    outData[0] = output;

    if (!model.selectionBox?.length) return
    console.log('model.selectionBox = ', model.selectionBox)
    let selectionBox = model.selectionBox
    const containerHeight = window.innerHeight // TODO: 获取 RenderWindow.topContainer.Height
    // selectionBox 的原点在左下角
    if (selectionBox.length > 2) {
      const [[xmin, ymin], [xmax, ymax]] = BBox(selectionBox)
      console.log('bbox = ', [xmin, ymin, xmax, ymax])
      selectionBox = [[xmin, containerHeight - ymax], [xmax, containerHeight - ymin]]
      console.log('new selectionBox = ', selectionBox)
    }
    const selectedPoints = vtkPoints.newInstance();
    selectedPointIndexes = [];
    const cellArray = vtkCellArray.newInstance();
    const [p1, p2] = selectionBox
    const hardwareSelector = window.apiSpecificRenderWindow.getSelector();
    hardwareSelector.setRenderer(window.renderer);
    // 如果用 FIELD_ASSOCIATION_POINTS 模式，有 bug
    // hardwareSelector.setFieldAssociation(FieldAssociations.FIELD_ASSOCIATION_POINTS)
    hardwareSelector.setCaptureZValues(true)
    hardwareSelector.setArea(...p1, ...p2)

    const boundary = model.selectionBox.length == 2  ? [[p1[0], containerHeight - p2[1]], [p2[0], containerHeight - p1[1]]] : model.selectionBox

    const selectionNodes = hardwareSelector.select()
    if (selectionNodes?.length) {
      selectionNodes.forEach(selectNode => {
        // const selectNode = selectionNodes[0]
        const cellList = selectNode.getSelectionList() || [];
        cellList.forEach(attributeID => {
          const cellPoints = input.getCellPoints(attributeID)
          const pointIds = cellPoints.cellPointIds || [];
          pointIds.forEach(pointId => {
            const point = input.getPoints().getPoint(pointId)
            const coord = vtkCoordinate.newInstance({
              value: point,
              renderer: window.renderer
            })
            const pointInViewport = coord.getComputedLocalDisplayValue()
            if (isPointInPolygon(boundary, pointInViewport)) {
              selectedPointIndexes.push(pointId)
              const pointIndex = selectedPoints.insertNextPoint(...point);
              cellArray.insertNextCell([pointIndex]);
            }
          })
        })
      })

    }

    output.setPoints(selectedPoints);
    output.setVerts(cellArray);
  }

  publicAPI.getSelectedPointIndexes = () => {
    const res = [...selectedPointIndexes]
    selectedPointIndexes = []
    return res
  }
}

const DEFAULT_VALUES = {
  selectionBox: null, // [p1, p2, ... pn]
}

function extend(publicAPI, model) {
  let initialValues = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  Object.assign(model, DEFAULT_VALUES, initialValues);
  macro.obj(publicAPI, model);

  macro.algo(publicAPI, model, 1, 1);
  macro.setGet(publicAPI, model, ['selectionBox'])
  macro.get(publicAPI, model, ['selectedPointIndexes'])
  highlightSelectionPoints(publicAPI, model);
}

const newInstance = macro.newInstance(extend, 'highlightSelectionPoints');

const highlightSelectionPoints$1 = {
  newInstance,
  extend,
}

export {highlightSelectionPoints$1 as default, extend, newInstance}