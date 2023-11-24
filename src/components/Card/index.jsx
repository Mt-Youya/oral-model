import { useState } from "react"
import { Eye, EyeClose } from "@/assets/icons"

export default function Card (){
    const [viewIdx, setViewIdx] = useState(0)
    const [modelIdx, setModelIdx] = useState(0)

    const views = ["正面视图", "颌面视图", "舌侧视图"]

    const [models, setModels] = useState([
        { text: "高,实在是高!", active: true, flag: 0 },
        { text: "高,实在是高!", active: false, flag: 1 },
    ])

    function handleEyeClick (e, idx){
        e.stopPropagation()
        const target = [...models]
        target[idx].active = !target[idx].active
        setModels(target)
    }

    return (
        <div id="card" className="w-1/6 shadow-xl absolute bg-[#FDFDFD] top-10 left-10 rounded-md">
            <div className="p-4">
                <h2 className="text-left mb-4 text-lg font-bold text-[#6C6C6C]"> 视图角度 </h2>
                <ul id="viewer-tabs" className="flex flex-1 gap-2.5 h-full">
                    {views.map((view, index) => (
                        <li className={`bg-transparent rounded-md p-2 text-[#${viewIdx === index ? "2381FE" : "808C99"}] text-base cursor-pointer aria-selected:bg-[#E5F4FF] transition-colors duration-500`}
                            aria-selected={viewIdx === index} role="listitem" onClick={() => setViewIdx(index)}
                            key={view}
                        >
                            {view}
                        </li>
                    ))}
                </ul>
            </div>

            <hr className="w-full h-0.5 bg-[#DAE7FF]"/>

            <div className="pb-4">
                <h2 className="text-left p-4 text-lg font-bold text-[#6C6C6C]"> 牙列 </h2>
                <ul id="modelInfo-wrapper">
                    {models.map(({ text, active, flag }, index) => (
                        <li className="relative w-full aria-selected:bg-[#E5F4FF] aria-selected:border-[#2381FE] py-2.5 p-5 flex border-l-4 border-transparent border-solid cursor-pointer overflow-hidden mb-1 transition-colors duration-500"
                            aria-selected={modelIdx === index} role="listitem" onClick={() => setModelIdx(index)}
                            key={text + index}
                        >
                            <img src={active ? Eye : EyeClose} className="w-5 h-5 text-[#909090]"
                                 onClick={(e) => handleEyeClick(e, index)}
                            />
                            &emsp;{text}
                            <span
                                className={`absolute -right-10 top-1 py-1 w-28 scale-75 rotate-45 ${!!flag ? "bg-[#2381FE]" : "bg-[#646466]"} origin-center text-white text-xs`}
                            >
                                {flag ? "已" : "未"}删减
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

    )
}