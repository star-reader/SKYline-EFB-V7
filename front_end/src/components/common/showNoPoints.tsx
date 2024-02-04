import { useEffect, useState } from 'react'
import pubsub from 'pubsub-js'

export default () => {
    const [isShow, setIsShow] = useState(false)

    useEffect(() => {
        pubsub.subscribe('no-point',() => {
            setIsShow(true)
            setTimeout(() => setIsShow(false), 10000)
        })
    })
    return (
        <>
        {
            isShow &&
            <div className="fixed top-[90px] w-[400px] z-[80] h-[26px] bg-red-500 rounded no-point-alert text-white text-[14px]
            leading-[26px] pl-[14px] pr-[14px]">
                当前积分不足，仅可查看部分区域的航路图和机场图
            </div>
        }
        </>
    )
}