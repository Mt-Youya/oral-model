import "@kitware/vtk.js/Rendering/Profiles/Geometry"
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper"
import { STATIC } from "@kitware/vtk.js/IO/Geometry/STLWriter"
import { FormatTypes } from "@kitware/vtk.js/IO/Geometry/STLWriter/Constants"
import vtkSTLReader from "@kitware/vtk.js/IO/Geometry/STLReader"
import vtkXMLPolyDataReader from "@kitware/vtk.js/IO/XML/XMLPolyDataReader"

import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow"
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor"
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper"
import vtkCellPicker from "@kitware/vtk.js/Rendering/Core/CellPicker"

import vtkInteractorStyleManipulator from "@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator"
import Manipulators from "@kitware/vtk.js/Interaction/Manipulators"

import highlightSelectionPoints from "./highlightSelectionPoints"
import vertexSculpture from "./vertexSculpture"

// import ajax from "./ajax"
// import SelectToothIdx from "./select-tooth-idx"
import PolygonSelection from "./polygon-selection"

// import {ScalarMappingTarget} from '@kitware/vtk.js/Common/Core/ScalarsToColors/Constants'
// import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';

export default (function () {

    const modelsPipeline = []

    const EnumSelectionMode = {
        none: 0,
        rect: 1,
        polygon: 2,
    }

    const boxSelector = Manipulators.vtkMouseBoxSelectorManipulator.newInstance({ button: 1 })
    const iStyle = vtkInteractorStyleManipulator.newInstance()
    const picker = vtkCellPicker.newInstance()
    picker.setTolerance(0)

    let selectionMode = EnumSelectionMode.none
    let boundary = [] // 框选边界，目前支持多边形
    let polygonSelection = null    // 选多个点，按空格键框选

    let initialized = false

    return function init (container) {
        const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({ container })
        const renderer = fullScreenRenderer.getRenderer()
        window.renderer = renderer
        const renderWindow = fullScreenRenderer.getRenderWindow()
        const oldInteractorStyle = renderWindow.getInteractor().getInteractorStyle()
        // const interactor = renderWindow.getInteractor()
        // const apiSpecificRenderWindow = interactor.getView()
        // window.apiSpecificRenderWindow = apiSpecificRenderWindow

        const rootContainer = fullScreenRenderer.getRootContainer()

        function loadModel (readerType) {
            const srcReader = readerType === "stl" ? vtkSTLReader.newInstance() : vtkXMLPolyDataReader.newInstance()
            const mapper = vtkMapper.newInstance()
            mapper.setScalarModeToUseCellData()
            mapper.setColorModeToMapScalars()
            const lut = mapper.getLookupTable()
            const values = [55, 54, 53, 52, 51]
            lut.setIndexedLookup(true)
            lut.setNanColor([1.0, 1.0, 1.0, 1.0])
            lut.setAnnotations(values, new Array(values.length).fill(""))
            lut.setTable([[0, 128, 128, 255], [0, 255, 255, 255], [117, 79, 199, 255], [199, 189, 34, 255], [199, 194, 174, 255]])
            const mapper1 = vtkMapper.newInstance()
            mapper1.setScalarModeToUsePointData() // 不使用模型自带的颜色，通过 actor1 指定纯色

            const actor = vtkActor.newInstance() // 面渲染
            actor.setMapper(mapper)
            // renderer.addActor(actor)

            const actor1 = vtkActor.newInstance() // 线框渲染
            actor1.setMapper(mapper1)
            // actor1.getProperty().setLighting(false)
            actor1.getProperty().setColor(0, .4, 0)
            actor1.getProperty().setRepresentationToWireframe()
            // renderer.addActor(actor1)

            const vertexSculptureFilter = vertexSculpture.newInstance()
            vertexSculptureFilter.setInputConnection(srcReader.getOutputPort())
            mapper.setInputConnection(vertexSculptureFilter.getOutputPort())
            mapper1.setInputConnection(vertexSculptureFilter.getOutputPort())

            const actor2 = vtkActor.newInstance() // 选中的点
            const mapper2 = vtkMapper.newInstance()
            // const polyDataNormalsFilter = vtkPolyDataNormals.newInstance()
            // polyDataNormalsFilter.setInputConnection(vertexSculptureFilter1.getOutputPort())
            const highlightPointFilter = highlightSelectionPoints.newInstance()
            highlightPointFilter.setInputConnection(vertexSculptureFilter.getOutputPort())
            // highlightPointFilter.update()
            mapper2.setInputConnection(highlightPointFilter.getOutputPort())
            actor2.setMapper(mapper2)
            actor2.getProperty().setColor(0, 1, 1)
            actor2.getProperty().setPointSize(6)
            actor2.getProperty().setRepresentationToPoints()
            // renderer.addActor(actor2)

            const actors = [actor, actor1, actor2]
            const mappers = [mapper, mapper1, mapper2]

            return [srcReader, highlightPointFilter, vertexSculptureFilter, actors, mappers]
        }

        function initScene (readerType = "stl", filesBuffer) {
            destroyScene()

            // const srcReaders = []
            switch (readerType) {
                case "stl":
                    for (let i = 0; i < filesBuffer.length; i++) {
                        modelsPipeline[i] = loadModel("stl")
                        const [srcReader, highlightPointFilter, vertexSculptureFilter, actors, mappers] = modelsPipeline[i]

                        srcReader.parseAsArrayBuffer(filesBuffer[i])
                        // srcReaders.push(srcReader)
                        for (const actor of actors) {
                            renderer.addActor(actor)
                        }
                    }
                    break
                case "vtp":
                    for (let srcReader of srcReaders) {
                        srcReader = vtkXMLPolyDataReader.newInstance()
                        loadModel(srcReader)
                    }
                    break
            }

            initialized = true
            return render()
        }

        function destroyScene () {
            if (!initialized) return

            renderer.removeAllActors()
            modelsPipeline.forEach(item => {
                if (Array.isArray(item)) {
                    item.forEach(el => el.delete())
                } else {
                    item.delete()
                }
            })
            modelsPipeline.splice(0, modelsPipeline.length - 1)
            initialized = false
        }

        function render () {
            const camera = renderer.getActiveCamera()
            camera.setViewUp(0, 1, 0)
            camera.setPosition(0, 0, 1)
            camera.setFocalPoint(0, 0, 0)
            renderer.resetCamera()
            renderWindow.render()
        }

        function drawPolygonSelection (autoClose) {
            if (!polygonSelection) {
                polygonSelection = new PolygonSelection(rootContainer)
            }
            polygonSelection.update(boundary, autoClose)
        }

        function handleSelection () {
            if (selectionMode !== EnumSelectionMode.none) return
            // 当按下 S 键后，进入矩形框选模式，鼠标点击，拖动会出现选区
            selectionMode = EnumSelectionMode.rect
            renderWindow.getInteractor().setInteractorStyle(iStyle)
        }

        function handlePolyData () {
            if (selectionMode !== EnumSelectionMode.none) return
            // 当按下 P 键后，进入多边形框选模式
            selectionMode = EnumSelectionMode.polygon
            oldInteractorStyle.setEnabled(false)
        }

        function handleClose () {
            if (selectionMode === EnumSelectionMode.polygon) {
                if (boundary.length < 3) {
                    boundary = []
                    return
                }
                // 自动闭合选区并重绘，然后更新框选的顶点
                drawPolygonSelection(true)
                const highlights = modelsPipeline.map(item => item[1])
                for (const highlight of highlights) {
                    highlight.setSelectionBox(boundary)
                }
                renderWindow.render() // 需要触发强制渲染
                boundary = []
            }
        }

        function handleDelete () {
            // 当按下 Del 键后，删除选中的点

            const highlightPointsFilter = []

            const idxArr = highlightSelectionPointsFilter1.getSelectedPointIndexes()
            highlightSelectionPointsFilter1.setSelectionBox([])
            vertexSculptureFilter1.removePoints(idxArr)

            const idxArr2 = highlightSelectionPointsFilter2.getSelectedPointIndexes()
            highlightSelectionPointsFilter2.setSelectionBox([])
            vertexSculptureFilter2.removePoints(idxArr2)

            renderWindow.render()
            if (selectionMode === EnumSelectionMode.polygon) {
                polygonSelection.delete()
                polygonSelection = null
                boundary = []
            }
        }

        function handleEscape () {
            // 按下 Esc 键，退出选区模式
            switch (selectionMode) {
                case EnumSelectionMode.rect: {
                    renderWindow.getInteractor().setInteractorStyle(oldInteractorStyle)
                    // highlightSelectionPointsFilter.setSelectionBox([])
                    break
                }
                case EnumSelectionMode.polygon: {
                    if (polygonSelection) {
                        polygonSelection.delete()
                        polygonSelection = null
                    }
                    boundary = []
                    oldInteractorStyle.setEnabled(true)
                    break
                }
            }
            selectionMode = EnumSelectionMode.none
        }

        function handleRootClick (e) {
            console.log(selectionMode, EnumSelectionMode.polygon)
            if (selectionMode !== EnumSelectionMode.polygon) return
            boundary.push([e.clientX, e.clientY])
            // 重绘多边形选区
            drawPolygonSelection(false)
        }

        // rootContainer.addEventListener("keyup", e => {
        //     switch (e.key) {
        //         case "s":
        //             return handleSelection()
        //         case "p":
        //             return handlePolyData()
        //         case " ":
        //             return handleClose()
        //         case "Delete":
        //             return handleDelete()
        //         case "Escape":
        //             return handleEscape()
        //         default :
        //             return e.preventDefault()
        //     }
        // })

        // rootContainer.addEventListener("click", e => {
        //     if (selectionMode !== EnumSelectionMode.polygon) return
        //     boundary.push([e.clientX, e.clientY])
        //     // 重绘多边形选区
        //     drawPolygonSelection(false)
        // })

        // // 右键，点选 cell，并弹出牙齿编号列表
        // let selectToothIdx = null
        // renderWindow.getInteractor().onLeftButtonPress(() => {
        //     if (selectToothIdx) {
        //         selectToothIdx.delete()
        //         selectToothIdx = null
        //     }
        // })
        //
        // renderWindow.getInteractor().onRightButtonPress((callData) => {
        //     if (renderer !== callData.pokedRenderer) {
        //         return
        //     }
        //
        //     const pos = callData.position
        //     const point = [pos.x, pos.y, 0.0]
        //
        //     picker.pick(point, renderer)
        //     if (!picker.getActors().length) {
        //         return
        //     }
        //
        //     const pickedCellId = picker.getCellId()
        //     const initSelected = 12
        //     if (selectToothIdx) {
        //         selectToothIdx.delete()
        //     }
        //     const containerHeight = window.innerHeight
        //     const winPos = [pos.x + 3, 3 + containerHeight - pos.y]
        //     selectToothIdx = new SelectToothIdx(rootContainer, winPos, initSelected, toothIdx => {
        //         vertexSculptureFilter.setCellInfo(pickedCellId, toothIdx)
        //         renderWindow.render()
        //     })
        // })

        return {
            handleSelection,
            handleClose,
            handleDelete,
            handleEscape,
            handlePolyData,
            handleRootClick,
            initScene,
            render,
        }
    }
})()