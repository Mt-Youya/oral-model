import { ArrowDown, Avatar } from "@/assets/icons"
import { useState } from "react"

export default function InfoSide () {
    const [patientExpanded, setPatientExpanded] = useState(true)
    const [dataExpanded, setDataExpanded] = useState(false)

    const patientIssues = [
        { label: "牙齿问题", value: "牙齿拥挤 牙齿有间隙" },
        { label: "面型问题", value: "面型凸" },
        { label: "矫治器偏好", value: "隐形矫治器" },
        { label: "其他备注信息", value: "彩色是额是个试试看咔咔咔咔阿" },
    ]

    return (
        <aside id="info-wrapper" className="w-96 h-full bg-[#F9FAFDf1] p-4">
            <section id="patientInfo-container" className="w-full bg-[#FDFDFD] text-left rounded-md">
                <h2 className="flex justify-between text-[#2381FE] text-base font-bold p-4 cursor-pointer select-none"
                    role="heading" id="patientInfo-title" aria-expanded={patientExpanded}
                    onClick={() => setPatientExpanded(prevState => !prevState)}
                >
                    患者信息
                    <img src={ArrowDown}
                         className={`transition-transform duration-150 ${patientExpanded ? "-rotate-90" : ""}`}
                         alt="ArrowDown"/>
                </h2>
                <div id="patientInfo-content" aria-expanded={patientExpanded}
                     className="aria-expanded:max-h-64 max-h-0 overflow-hidden transition-max-h duration-150"
                >
                    <hr className="bg-[#E7E7E7] w-full h-px mb-3"/>

                    <div className=" flex justify-start gap-2.5 px-4">
                        <img src={Avatar} className="w-16 aspect-square"
                             alt="Avatar"/>
                        <p className="flex flex-col gap-2.5"><span className="text-lg font-bold"> 茼蒿 </span> <span> 男 · 43岁 </span>
                        </p>
                    </div>


                    <div className="w-full px-4 py-5">
                        {patientIssues.map(issue => (
                            <h3 className="w-full grid grid-cols-[120px_minmax(220px,_1fr)] mb-2.5" key={issue.value}>
                                <span> {issue.label}： </span>
                                <span> {issue.value} </span>
                            </h3>
                        ))}
                    </div>
                </div>
            </section>

            <br/>

            <section id="data-container" className="w-full bg-[#FDFDFD] text-left rounded-md">
                <h2 className="flex justify-between text-[#2381FE] text-base font-bold p-4 cursor-pointer select-none"
                    role="heading" id="data-title" aria-expanded={dataExpanded}
                    onClick={() => setDataExpanded(prevState => !prevState)}
                >
                    详细数据
                    <img
                        className={`transition-transform duration-150 ${dataExpanded ? "-rotate-90" : ""}`}
                        alt="ArrowDown" src={ArrowDown}
                    />
                </h2>
                <div id="data-content" aria-expanded={dataExpanded}
                     className="aria-expanded:max-h-72 max-h-0 overflow-hidden transition-max-h duration-150"
                >
                    <hr className="bg-[#E7E7E7] w-full h-px mb-3"/>

                    <p className="px-4">上颌牙宽和：<span>100.15mm</span></p>

                    <div className="w-full px-4 py-5">
                        <div className="grid grid-cols-4 border-b border-b-[#F8F8F8] border-solid py-2">
                            <span> 牙号 </span> <span> 宽度 </span> <span> 牙号 </span> <span> 宽度 </span>
                        </div>
                        <div className="grid grid-cols-4 border-b border-b-[#F8F8F8] border-solid py-2">
                            <span> #11 </span> <span> 100 </span> <span> #13 </span> <span> 123 </span>
                        </div>
                        <div className="grid grid-cols-4 border-b border-b-[#F8F8F8] border-solid py-2">
                            <span> #11 </span> <span> 100 </span> <span> #13 </span> <span> 123 </span>
                        </div>
                        <div className="grid grid-cols-4 border-b border-b-[#F8F8F8] border-solid py-2">
                            <span> #11 </span> <span> 100 </span> <span> #13 </span> <span> 123 </span>
                        </div>
                        <div className="grid grid-cols-4 pt-2">
                            <span> #11 </span> <span> 100 </span> <span> #13 </span> <span> 123 </span>
                        </div>
                    </div>
                </div>
            </section>
        </aside>
    )
}
