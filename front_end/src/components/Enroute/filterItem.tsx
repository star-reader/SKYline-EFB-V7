import { ReactNode , useEffect, useState } from "react"
import { Tooltip } from 'antd'
import pubsub from 'pubsub-js'
import { isActived } from "../../hooks/map/useEnrouteMap"

interface Props {
    children: ReactNode,
    content: string,
    data: string
}

export default ({children, content, data}: Props) => {

    const [isActive, setIsActive] = useState(isActived(data))

    const handleChange = () => {
        pubsub.publish('change-enroute-style', data)
        setIsActive(!isActive)
    }

    useEffect(() => {
        pubsub.subscribe('change-enroute-preset',() => {
            setIsActive(isActived(data))
        })
    },[])

    return (
        <>
            <Tooltip placement="left" title={content}>
                <div onClick={handleChange} 
                className={`filter-item flex w-full h-[36px]
                 m-[2px] rounded-sm justify-center items-center ${isActive ? 'active' : ''}`}>
                    {children}
                </div>
            </Tooltip>
        </>
    )
}