import { useEffect, useState } from "react"
import pubsub from 'pubsub-js'

export default () => {

    const [isShow, setIsShow] = useState(false)

    useEffect(() => {
        pubsub.subscribe('add-pinboard',() => setIsShow(true))
        pubsub.subscribe('clear-pinboard',() => setIsShow(false))
    })

    return (
        <div role='divider' className="relative w-full h-[53px]" 
        style={{display: isShow ? 'block' : 'none'}}></div>
    )
}