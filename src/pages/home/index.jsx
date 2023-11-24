import { useEffect, useRef, useState } from "react"
import Header from "@/layout/Header"
import InfoSide from "@/layout/InfoSide"
import Card from "@/components/Card"
import Tips from "@/components/Tips"
import Tasks from "@/components/Tasks"
import Message from "@/components/Message"
import init from "@/js/temp"

export default function Home (){
    const containerRef = useRef(null)
    const [modelMethods, setModelMethods] = useState({})

    function handleClick (e){
        modelMethods.handleRootClick(e)
    }

    useEffect(() => {
        const container = containerRef.current
        if (container) {
            const result = init(container)
            setModelMethods(() => ({ ...result }))

            function handleKeyUp (e){
                switch (e.key) {
                    case "s":
                        return result.handleSelection()
                    case "p":
                        return result.handlePolyData()
                    case " ":
                        return result.handleClose()
                    case "Delete":
                        return result.handleDelete()
                    case "Escape":
                        return result.handleEscape()
                    default:
                        return
                }
            }

            document.addEventListener("keyup", handleKeyUp)
        }
    }, [])

    return (
        <>
            <Header modelMethods={modelMethods}/>
            <div className="w-full h-[calc(100vh-80px)] relative flex justify-between overflow-hidden">
                <div className="relative">
                    <Tasks/>
                    <div id="container" ref={containerRef} onClick={handleClick}
                         className="w-[calc(100vw-384px)] h-full relative"
                    >

                    </div>
                    <Message/>
                </div>
                <Card/>
                <Tips/>
                <InfoSide/>
            </div>
        </>
    )
}
