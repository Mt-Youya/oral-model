import "@kitware/vtk.js/Rendering/Profiles/Geometry"

import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow"
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor"
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper"

import vtkXMLPolyDataReader from "@kitware/vtk.js/IO/XML/XMLPolyDataReader"

import "@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper"

import vtkInteractorStyleManipulator from "@kitware/vtk.js/Interaction/Style/InteractorStyleManipulator"
import Manipulators from "@kitware/vtk.js/Interaction/Manipulators"

import highlightSelectionPoints from "./highlightSelectionPoints"
import vertexSculpture from "./vertexSculpture"

import vtkSTLReader from "@kitware/vtk.js/IO/Geometry/STLReader"
import { STATIC } from "@kitware/vtk.js/IO/Geometry/STLWriter"
import { FormatTypes } from "@kitware/vtk.js/IO/Geometry/STLWriter/Constants"
import ajax from "./ajax"
import PolygonSelection from "./polygon-selection"
import vtkCellPicker from "@kitware/vtk.js/Rendering/Core/CellPicker"
import SelectToothIdx from "./select-tooth-idx"
// import {ScalarMappingTarget} from '@kitware/vtk.js/Common/Core/ScalarsToColors/Constants'
// import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';

// 操作流程：
// 先加载 STL，编辑之后回传后端返回 VTP，然后加载 VTP
export default function init (container) {
    // const app = document.querySelector("#root")

    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({ container })

    const renderer = fullScreenRenderer.getRenderer()
    window.renderer = renderer
    const renderWindow = fullScreenRenderer.getRenderWindow()
    const interactor = renderWindow.getInteractor()
    const apiSpecificRenderWindow = interactor.getView()
    window.apiSpecificRenderWindow = apiSpecificRenderWindow
    const picker = vtkCellPicker.newInstance()
    picker.setTolerance(0)

    let sourceReader1
    let mapper
    let mapper1
    let mapper2
    let actor
    let actor1
    let actor2
    let vertexSculptureFilter1
    let highlightSelectionPointsFilter1

    let sourceReader2
    let mapper2_
    let mapper2_1
    let mapper2_2
    let actor2_
    let actor2_1
    let actor2_2
    let vertexSculptureFilter2
    let highlightSelectionPointsFilter2

    let initialized = false

    function init1 () {
        mapper = vtkMapper.newInstance()
        mapper.setScalarModeToUseCellData()
        mapper.setColorModeToMapScalars()
        const lut = mapper.getLookupTable()
        const values = [55, 54, 53, 52, 51]
        lut.setIndexedLookup(true)
        lut.setNanColor([1.0, 1.0, 1.0, 1.0])
        lut.setAnnotations(values, new Array(values.length).fill(""))
        lut.setTable([
            [0, 128, 128, 255], [0, 255, 255, 255], [117, 79, 199, 255], [199, 189, 34, 255], [199, 194, 174, 255],
        ])
        mapper1 = vtkMapper.newInstance()
        mapper1.setScalarModeToUsePointData() // 不使用模型自带的颜色，通过 actor1 指定纯色

        actor = vtkActor.newInstance() // 面渲染
        actor.setMapper(mapper)
        renderer.addActor(actor)

        actor1 = vtkActor.newInstance() // 线框渲染
        actor1.setMapper(mapper1)
        // actor1.getProperty().setLighting(false)
        actor1.getProperty().setColor(0, .4, 0)
        actor1.getProperty().setRepresentationToWireframe()
        renderer.addActor(actor1)

        vertexSculptureFilter1 = vertexSculpture.newInstance()
        vertexSculptureFilter1.setInputConnection(sourceReader1.getOutputPort())
        mapper.setInputConnection(vertexSculptureFilter1.getOutputPort())
        mapper1.setInputConnection(vertexSculptureFilter1.getOutputPort())

        actor2 = vtkActor.newInstance() // 选中的点
        mapper2 = vtkMapper.newInstance()
        // const polyDataNormalsFilter = vtkPolyDataNormals.newInstance()
        // polyDataNormalsFilter.setInputConnection(vertexSculptureFilter1.getOutputPort())
        highlightSelectionPointsFilter1 = highlightSelectionPoints.newInstance()
        highlightSelectionPointsFilter1.setInputConnection(vertexSculptureFilter1.getOutputPort())
        // highlightSelectionPointsFilter.update()
        mapper2.setInputConnection(highlightSelectionPointsFilter1.getOutputPort())
        actor2.setMapper(mapper2)
        actor2.getProperty().setColor(0, 1, 1)
        actor2.getProperty().setPointSize(6)
        actor2.getProperty().setRepresentationToPoints()
        renderer.addActor(actor2)
    }

    function init2 () {
        mapper2_ = vtkMapper.newInstance()
        mapper2_.setScalarModeToUseCellData()
        mapper2_.setColorModeToMapScalars()
        const lut = mapper2_.getLookupTable()
        const values = [55, 54, 53, 52, 51]
        lut.setIndexedLookup(true)
        lut.setNanColor([1.0, 1.0, 1.0, 1.0])
        lut.setAnnotations(values, new Array(values.length).fill(""))
        lut.setTable([
            [0, 128, 128, 255], [0, 255, 255, 255], [117, 79, 199, 255], [199, 189, 34, 255], [199, 194, 174, 255],
        ])
        mapper2_1 = vtkMapper.newInstance()
        mapper2_1.setScalarModeToUsePointData() // 不使用模型自带的颜色，通过 actor1 指定纯色

        actor2_ = vtkActor.newInstance() // 面渲染
        actor2_.setMapper(mapper2_)
        renderer.addActor(actor2_)

        actor2_1 = vtkActor.newInstance() // 线框渲染
        actor2_1.setMapper(mapper2_1)
        // actor1.getProperty().setLighting(false)
        actor2_1.getProperty().setColor(0, .4, 0)
        actor2_1.getProperty().setRepresentationToWireframe()
        renderer.addActor(actor2_1)

        vertexSculptureFilter2 = vertexSculpture.newInstance()
        vertexSculptureFilter2.setInputConnection(sourceReader2.getOutputPort())
        mapper2_.setInputConnection(vertexSculptureFilter2.getOutputPort())
        mapper2_1.setInputConnection(vertexSculptureFilter2.getOutputPort())

        actor2_2 = vtkActor.newInstance() // 选中的点
        mapper2_2 = vtkMapper.newInstance()
        // const polyDataNormalsFilter = vtkPolyDataNormals.newInstance()
        // polyDataNormalsFilter.setInputConnection(vertexSculptureFilter2.getOutputPort())
        highlightSelectionPointsFilter2 = highlightSelectionPoints.newInstance()
        highlightSelectionPointsFilter2.setInputConnection(vertexSculptureFilter2.getOutputPort())
        // highlightSelectionPointsFilter.update()
        mapper2_2.setInputConnection(highlightSelectionPointsFilter2.getOutputPort())
        actor2_2.setMapper(mapper2_2)
        actor2_2.getProperty().setColor(0, 1, 1)
        actor2_2.getProperty().setPointSize(6)
        actor2_2.getProperty().setRepresentationToPoints()
        renderer.addActor(actor2_2)
    }

    function initScene (readerType) {
        destroyScene()

        sourceReader1 = null
        switch (readerType) {
            case "stl":
                sourceReader1 = vtkSTLReader.newInstance()
                sourceReader2 = vtkSTLReader.newInstance()
                break
            case "vtp":
                sourceReader1 = vtkXMLPolyDataReader.newInstance()
                sourceReader2 = vtkXMLPolyDataReader.newInstance()
                break
        }

        init1()
        init2()

        initialized = true
    }

    function destroyScene () {
        if (!initialized) return

        renderer.removeAllActors()
        const arr1 = [actor, actor1, actor2, mapper, mapper1, mapper2,
            vertexSculptureFilter1, highlightSelectionPointsFilter1, sourceReader1]
        const arr2 = [actor2_, actor2_1, actor2_2, mapper2_, mapper2_1, mapper2_2,
            vertexSculptureFilter2, highlightSelectionPointsFilter2, sourceReader2]
        const arrs = [...arr1, ...arr2]
        arrs.forEach(item => {
            item.delete()
        })
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

    const boxSelector = Manipulators.vtkMouseBoxSelectorManipulator.newInstance({
        button: 1,
    })
    boxSelector.onBoxSelectChange(({ selection }) => {
        const [xmin, xmax, ymin, ymax] = selection
        const height = window.innerHeight
        const left = xmin
        const right = xmax
        const top = height - ymax
        const bottom = height - ymin
        selection = [left, top, right, bottom]
        console.log("Apply selection:", selection)
        highlightSelectionPointsFilter1.setSelectionBox([[xmin, ymin], [xmax, ymax]])
        highlightSelectionPointsFilter2.setSelectionBox([[xmin, ymin], [xmax, ymax]])
        renderWindow.render() // 需要触发强制渲染
    })
    const iStyle = vtkInteractorStyleManipulator.newInstance()
    iStyle.addMouseManipulator(boxSelector)
    const oldInteractorStyle = renderWindow.getInteractor().getInteractorStyle()

    const EnumSelectionMode = {
        none: 0,
        rect: 1,
        polygon: 2,
    }

    let selectionMode = EnumSelectionMode.none
    let boundary = [] // 框选边界，目前支持多边形

    const rootContainer = fullScreenRenderer.getRootContainer()

    rootContainer.addEventListener("keydown", e => {
        if (e.key === "s") {
            if (selectionMode != EnumSelectionMode.none) return
            // 当按下 S 键后，进入矩形框选模式，鼠标点击，拖动会出现选区
            selectionMode = EnumSelectionMode.rect
            renderWindow.getInteractor().setInteractorStyle(iStyle)
        } else if (e.key === "p") {
            if (selectionMode != EnumSelectionMode.none) return
            // 当按下 P 键后，进入多边形框选模式
            selectionMode = EnumSelectionMode.polygon
            oldInteractorStyle.setEnabled(false)
        } else if (e.key === " ") {
            if (selectionMode == EnumSelectionMode.polygon) {
                if (boundary.length < 3) {
                    boundary = []
                    return
                }
                // 自动闭合选区并重绘，然后更新框选的顶点
                drawPolygonSelection(true)
                highlightSelectionPointsFilter1.setSelectionBox(boundary)
                highlightSelectionPointsFilter2.setSelectionBox(boundary)
                renderWindow.render() // 需要触发强制渲染
                boundary = []
            }
        } else if (e.key === "Escape") {
            // 按下 Esc 键，退出选区模式
            switch (selectionMode) {
                case EnumSelectionMode.rect: {
                    renderWindow.getInteractor().setInteractorStyle(oldInteractorStyle)
                    // highlightSelectionPointsFilter.setSelectionBox([])
                }
                    break
                case EnumSelectionMode.polygon: {
                    if (polygonSelection) {
                        polygonSelection.delete()
                        polygonSelection = null
                    }
                    boundary = []
                    oldInteractorStyle.setEnabled(true)
                }
                    break
            }
            selectionMode = EnumSelectionMode.none
        } else if (e.key === "Delete") {
            // 当按下 Del 键后，删除选中的点

            const idxArr = highlightSelectionPointsFilter1.getSelectedPointIndexes()
            highlightSelectionPointsFilter1.setSelectionBox([])
            vertexSculptureFilter1.removePoints(idxArr)

            const idxArr2 = highlightSelectionPointsFilter2.getSelectedPointIndexes()
            highlightSelectionPointsFilter2.setSelectionBox([])
            vertexSculptureFilter2.removePoints(idxArr2)

            renderWindow.render()
            if (selectionMode == EnumSelectionMode.polygon) {
                polygonSelection.delete()
                polygonSelection = null
                boundary = []
            }
        }
    })

    // 选多个点，按空格键框选
    let polygonSelection = null
    rootContainer.addEventListener("click", e => {
        if (selectionMode != EnumSelectionMode.polygon) return
        boundary.push([e.clientX, e.clientY])
        // 重绘多边形选区
        drawPolygonSelection(false)
    })

    // 右键，点选 cell，并弹出牙齿编号列表
    let selectToothIdx = null
    renderWindow.getInteractor().onLeftButtonPress(() => {
        if (selectToothIdx) {
            selectToothIdx.delete()
            selectToothIdx = null
        }
    })
    renderWindow.getInteractor().onRightButtonPress((callData) => {
        if (renderer !== callData.pokedRenderer) {
            return
        }

        const pos = callData.position
        const point = [pos.x, pos.y, 0.0]

        picker.pick(point, renderer)
        if (!picker.getActors().length) {
            return
        }

        const pickedCellId = picker.getCellId()
        const initSelected = 12
        if (selectToothIdx) {
            selectToothIdx.delete()
        }
        const containerHeight = window.innerHeight
        const winPos = [pos.x + 3, 3 + containerHeight - pos.y]
        selectToothIdx = new SelectToothIdx(rootContainer, winPos, initSelected, toothIdx => {
            vertexSculptureFilter.setCellInfo(pickedCellId, toothIdx)
            renderWindow.render()
        })
    })

    function drawPolygonSelection (autoClose) {
        if (!polygonSelection) {
            polygonSelection = new PolygonSelection(rootContainer)
        }
        polygonSelection.update(boundary, autoClose)
    }

    // rootContainer.addEventListener('mousemove', e => {
    //   if (!isSelectionMode) return

    //   points.push([e.clientX, e.clientY])
    // })

    // rootContainer.addEventListener('mouseup', e => {
    //   if (selectionMode != EnumSelectionMode.polygon) return

    //   boundary.push([e.clientX, e.clientY])
    // })

    // 界面逻辑
    const btnLoadStl = document.querySelector(".btn-load-stl")
    const btnGenVtp = document.querySelector(".btn-gen-vtp")
    const btnPostProcess = document.querySelector(".btn-post-proc")
    const btnGetInfo = document.querySelector(".btn-get-info")
    const uiElem = document.querySelector(".ui")
    let fileLoaderElem = document.querySelector(".yayan-file-loader")

    btnLoadStl?.addEventListener("click", function (e) {
        if (!fileLoaderElem) {
            const fileElem = document.createElement("input")
            fileElem.type = "file"
            fileElem.multiple = "multiple"
            fileElem.className = "yayan-file-loader"
            fileElem.style = "width: 1px; height: 1px;position:fixed;left:0;top:0;visibility:hidden;z-index:-1;"
            uiElem.appendChild(fileElem)
            fileElem.addEventListener("change", async function (e) {
                if (!e.target.files?.length) return

                const file = e.target.files[0]
                const file2 = e.target.files[1]
                const ab = await file.arrayBuffer()
                const ab2 = await file2.arrayBuffer()

                initScene("stl")
                sourceReader1.parseAsArrayBuffer(ab)
                sourceReader2.parseAsArrayBuffer(ab2)

                render()

            })
            fileLoaderElem = fileElem
        }
        fileLoaderElem.click()
    })

    btnGenVtp?.addEventListener("click", async function (e) {
        const file = STATIC.writeSTL(vertexSculptureFilter.getCachedPolyData(), FormatTypes.ASCII)
        let vtpFile = ""
        const ratio = window.prompt("请输入消减因子", ".75")
        if (!ratio) {
            return
        }
        try {
            // 上传 STL 文件之后，接口返回一个 vtp 文件链接
            vtpFile = await ajax.post("/api/stl-to-vtp", {
                file,
                ratio: parseFloat(ratio),
            })
        } catch (e) {
            //
        }

        if (!vtpFile?.length) {
            window.alert("处理失败")
            return
        }

        const fileContent = await ajax.get(vtpFile)
        initScene("vtp")
        loadVtp(fileContent)
        render()
    })

    btnPostProcess?.addEventListener("click", async function () {
        let vtpFile = ""
        // 上传 VTP 文件到 OSS

        await ajax.post("/medical-record/rpc/iocs/segmentation", {
            planId: 1,
            vtpUrl: vtpFile,
            type: 1,
        })

        window.alert("操作成功，请稍候 2 分钟")
    })

    btnGetInfo?.addEventListener("click", async function () {
        let vtpFile = ""
        try {
            // 上传 STL 文件之后，接口返回一个 vtp 文件链接
            const res = await ajax.post("/medical-record/rpc/iocs/getToothWidthInfoById", {
                planeId: 1,
            })
            vtpFile = res.data?.resultVtpUrl
        } catch (e) {
            //
        }

        if (!vtpFile?.length) {
            window.alert("文件正在处理中，请稍后重试")
            return
        }

        const fileContent = await ajax.get(vtpFile)
        initScene("vtp")
        loadVtp(fileContent)
        render()
    })

    function loadVtp (txt) {
        const textEncoder = new TextEncoder()
        sourceReader1.parseAsArrayBuffer(textEncoder.encode(txt))
    }

}