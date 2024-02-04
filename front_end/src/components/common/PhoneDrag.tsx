import pubsub from 'pubsub-js'
import { useDragHandler } from "../../hooks/usePhoneMove"

interface Props {
    id: string
}

export default ({id}: Props) => {

    const handleDragUp = () => {
        pubsub.publish(`${id}-drag-up`,1)
    }
    
    const handleDragDown = () => {
        pubsub.publish(`${id}-drag-down`,1)
    }

    const divRef = useDragHandler(handleDragUp, handleDragDown)
    return (
        // <div className="relative mt-[10px] mb-[5px] w-[50%] left-[25%] h-[12px]
        //      bg-slate-500 rounded cursor-move hidden phone:block" ref={divRef}></div>
        <div className="relative top-0 left-0 w-full mt-0 mb-0 h-[50px] hidden phone:block" ref={divRef}>
            <div className="relative top-[8px] mt-[4px] h-[8px] ml-[25%] w-[50%]
            bg-slate-500 rounded cursor-move"></div>
        </div>
    )
}