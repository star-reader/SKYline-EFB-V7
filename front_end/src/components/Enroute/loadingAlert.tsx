import { Progress } from "antd"
import pubsub from 'pubsub-js'
import { useEffect, useState } from "react"

export default () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [hover, setHover] = useState(false)
    const [percent, setPercent] = useState<number>(0)

    useEffect(() => {
        //pubsub
        pubsub.subscribe('start-loading-enroute-manually',() => {
            setLoading(true)
            setHover(true)
        })
        pubsub.subscribe('enroute-data-no-error',() => {
            setHover(false)
            setError(false)
            setTimeout(() => {
                setLoading(false)
            }, 800);
        })
        pubsub.subscribe('enroute-data-error',() => {
            setHover(true)
            setError(true)
            setLoading(false)
        })
        pubsub.subscribe('enroute-data-load',(_, data: number) => {
            setPercent(data)
        })
    },[])
    
    return (
        <>
        {
            loading && <div>
                { hover && <div className="fixed left-0 top-0 w-full h-full z-[2] bg-[#253547] select-none"></div> }
                    <div className="absolute w-[300px] h-[100px] z-[50] t-calc-50-minus-50px-2 
                    bg-[#223958] left-calc-50-minus-150px rounded-md ani-[loading-alert]-4">
                        <div className="relative w-full text-center text-white text-[20px] mt-3 select-none">下载航路图数据中</div>
                        <div className="relative w-[80%] left-[10%] mt-[10px]">
                            {
                                error ? <span className="text=[17px] text-center text-red-500 select-none">数据加载失败，请重试</span> : 
                                <Progress percent={percent} showInfo={false} size={[240, 10]} 
                                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
                            }
                        </div>
                    </div>
            </div>

        }
        </>
    )
}