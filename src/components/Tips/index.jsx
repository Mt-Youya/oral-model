import { Close } from "@/assets/icons"
import { useRef } from "react"

export default function Tips (){
    const tipsRef = useRef(null)

    function handleRemove (){
        tipsRef.current.classList.toggle("translate-y-96")
        const timer = setTimeout(() => {
            tipsRef.current?.remove()
            clearTimeout(timer)
        }, 300)
    }

    return (
        <div id="tips" className="absolute bottom-4 left-4 w-56 h-16 bg-[#b7b6b3] rounded-lg shadow-blue-200 transition-transform"
             ref={tipsRef}>
            <div className="relative px-6 py-2.5 text-white">
                <p>
                    为了更精确的计算齿宽 <br/>
                    建议精确删除多余牙龈
                </p>
                <img src={Close} className="absolute top-2 right-2 w-5 h-5 cursor-pointer" onClick={handleRemove}/>
            </div>
        </div>
    )
}
