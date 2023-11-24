import { Move, Pen, Back, Reset, Compare, Cast, Question, Viewer } from "@/assets/icons"
import { memo, useCallback, useEffect, useRef, useState } from "react"

function Header ({ modelMethods }) {

    const {
        handlePolyData,
        handleEscape,
        handleDelete,
        handleSelection,
        handleClose,
        initScene,
    } = modelMethods

    const [tools, setTools] = useState([
        { name: "移动", active: true, icon: Move, key: "move" },
        { name: "钢笔", active: false, icon: Pen, key: "pen" },
        { name: "返回", active: false, icon: Back, key: "back" },
        { name: "重置", active: false, icon: Reset, key: "reset" },
        { name: "上传", active: false, icon: Reset, key: "upload" },
    ])

    const [views, setViews] = useState([
        { name: "对比", active: true, icon: Compare },
        { name: "视图", active: false, icon: Viewer },
    ])

    const inputRef = useRef(null)
    const headerRef = useRef(null)

    function handleViewsClick (idx) {
        const target = [...views]
        for (const targetElement of target) {
            targetElement.active = false
        }
        target[idx].active = true
        setViews(target)
    }

    function handleKeyUp (e) {
        console.log("header")
        switch (e.key) {
            case "s":
                return handleSelection()
            case "p":
                return handlePolyData()
            case " ":
                return handleClose()
            case "Delete":
                return handleDelete()
            case "Escape":
                return handleEscape()
            default:
                return
        }
    }

    function handleToolsClick (idx) {
        const target = [...tools]
        for (const targetElement of target) {
            targetElement.active = false
        }
        target[idx].active = true
        setTools(target)

        switch (idx) {
            case 0:
            case 1:
            case 2:
            case 3:
                return
            case 4:
                handleUpload()
                return
            default:
                return
        }

    }

    function handleUpload () {
        const ipt = inputRef.current
        ipt.click()
        ipt.addEventListener("change", handleUploadChange)
    }

    async function handleUploadChange (e) {
        const fileList = e.target.files

        const filesBuffer = []
        for (const fileListElement of fileList) {
            filesBuffer.push(fileListElement.arrayBuffer())
        }

        const result = await Promise.all(filesBuffer)

        initScene("stl", result)
        return inputRef.current.removeEventListener("change", handleUploadChange)
    }

    useEffect(() => {
        const input = document.createElement("input")
        input.type = "file"
        input.multiple = "multiple"

        inputRef.current = input
        headerRef.current.addEventListener("keyup", handleKeyUp)
    }, [])

    return (
        <header ref={headerRef} id="header" className="w-full h-20 bg-[#333] text-white flex justify-between">
            <nav id="actions" className="w-1/6 h-full">
                <ul className="flex justify-center align-center h-full">
                    {tools.map(({ name, active, icon, key }, index) => (
                        <li className="w-1/4 h-full text-sm flex justify-center flex-col gap-2 items-center cursor-pointer aria-selected:bg-[#2381FE] transition-colors"
                            id={name} key={key} aria-selected={active} role="listitem"
                            onClick={() => handleToolsClick(index)}
                        >
                            <img src={icon}/> {name}
                        </li>
                    ))}
                </ul>
            </nav>

            <nav id="operations" className="w-1/6 h-full">
                <ul className="flex justify-center align-center h-full">
                    {views.map(({ name, active, icon }, index) => (
                        <li className="w-1/4 h-full text-sm flex justify-center flex-col gap-2 items-center cursor-pointer aria-selected:bg-[#2381FE] transition-colors"
                            id={name} key={name} aria-selected={active} role="listitem"
                            onClick={() => handleViewsClick(index)}
                        >
                            <img src={icon}/> {name}
                        </li>
                    ))}
                </ul>
            </nav>

            <nav id="tools" className="w-1/4 h-full flex justify-end items-center gap-4">
                <div
                    className="w-32 h-fit py-2 px-3 text-center flex justify-center items-center gap-2.5 rounded-lg bg-[#4D4D4D]"
                >
                    <img src={Cast}/>
                    删减完成
                </div>
                {/*<div*/}
                {/*    class="w-32 h-fit py-2 px-3 text-center flex justify-center items-center gap-2.5 rounded-lg bg-[#4D4D4D]">*/}
                {/*    <img src={Cast}/>*/}
                {/*    计算齿宽*/}
                {/*</div>*/}
                {/*<div*/}
                {/*    class="w-32 h-fit py-2 px-3 text-center flex justify-center items-center gap-2.5 rounded-lg bg-[#2381FE]">*/}
                {/*    保存*/}
                {/*</div>*/}
                <img src={Question} className="w-4 h-4  mr-10 aspect-square"/>
            </nav>
        </header>

    )
}

export default memo(Header)