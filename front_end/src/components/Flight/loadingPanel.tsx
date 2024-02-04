import pubsub from 'pubsub-js'
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react'


export default () => {

    const [isShow, setIsShow] = useState(false)
    const [isFail, setIsFail] = useState(false)

    useEffect(() => {
       pubsub.subscribe('start-loading-flight',() => {
            setIsShow(true)
            setIsFail(false)
       })
       pubsub.subscribe('detail-flight-load',() => {
            setIsShow(false)
       })

       pubsub.subscribe('load-flight-failed',() => {
            setIsFail(true)
            setTimeout(() => {
                setIsShow(false)
            }, 1600);
       })
    },[])

    return (
        isShow && 
        <div className="fixed left-0 right-0 top-0 bottom-0 z-[42]">
            <div className="absolute w-[300px] h-[130px] z-[50] t-calc-50-minus-50px-2 
                    bg-[#223958] left-calc-50-minus-150px rounded-md ani-[loading-alert]-4">
                <LoadingOutlined 
                    style={{ fontSize: 24, display: 'flex', justifyContent: 'center', margin: '15px 0', color: 'rgb(92,120,186)'}}
                spin />
                <div className="relative w-full text-center text-white text-[20px] mt-3 select-none">航路解析中 ...</div>
                <div className="relative w-[80%] left-[10%] mt-[3px]">
                    {
                        isFail && <span className="text=[17px] text-center text-red-500 select-none" onClick={() => setIsShow(false)}>航班创建失败，请点击重试</span>
                    }
                </div>
            </div>
        </div>
    )
}