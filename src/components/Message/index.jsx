import { Success } from "@/assets/icons"
import { useEffect, useRef, useState } from "react"

export default function Message (){
    const [remove, setRemove] = useState(false)

    const messageRef = useRef(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setRemove(true)
            const timer2 = setTimeout(() => {
                clearTimeout(timer)
                messageRef.current.remove()
                clearTimeout(timer2)
            }, 2000)
        }, 300)
    }, [])

    return (
        <div id="message" ref={messageRef}
             className={`absolute top-0 left-1/2 transition-all ${remove ? "opacity-100 translate-y-24" : "opacity-0"}`}
        >
            <div className="relative px-4 py-2.5 flex gap-2.5 bg-[#b7b6b3] rounded-lg z-50 text-white">
                <img src={Success} className="w-5 h-5"/>
                删减完成!
            </div>
        </div>
    )
}
