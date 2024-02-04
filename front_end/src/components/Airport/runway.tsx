import { Result, Skeleton } from "antd"
import { useEffect, useState, memo } from "react"
import pubsub from 'pubsub-js'
import axios from 'axios'
import apiUrl from "../../config/api/apiUrl"
import createHeader from "../../utils/createHeader"
import getRandom from "../../utils/getRandom"

export default memo(() => {
    const [loading, setLoading] = useState(true)
    const [fail, setFail] = useState(false)
    const [comList, setComList] = useState<RunwayList[]>([])

    useEffect(() => {
        pubsub.subscribeOnce('handle-airport-runway', (_,icao: string) => {
            setLoading(true)
            setFail(false)
            axios.get(`${apiUrl.runways}?icao=${icao}`,{'headers':createHeader()}).then(res => {
                if (res.data.code === 200){
                    setLoading(false)
                    setFail(false)
                    setComList(res.data.data)
                }else{
                    setLoading(false)
                    setFail(true)
                }
            }).catch(() => {
                setLoading(false)
                setFail(true)
            })
        })
    })

    return (
        <div className="relative overflow-y-auto w-full search-calc-height">
            {
                loading ? <Skeleton active paragraph={{'rows': 10}} /> :
                fail || !comList.length ? <Result
                    status="warning"
                    title="加载失败，未知错误"
                /> :
                <div className="chart-list relative">
                    {
                        comList.map(d => {
                            return (
                                <div key={getRandom(16)} className="relative w-[90%] m-[1px] h-[30px] text-white
                                select-none flex justify-between items-center cursor-pointer hover:bg-[#384a7a]"
                                style={{'transitionDuration': '0.4s'}}>
                                    <div className="relative text-[18px] pl-[25px] font-bold">{d.ident}</div>
                                    <div className='relative flex justify-around text-[16px]'>
                                        <div className="relative rounded bg-[#3cbd3c] pl-[10px] pr-[10px] mr-[10px] h-[18px] leading-[18px]">{d.length}ft</div>
                                        <div className="relative rounded bg-[#da6834] pl-[10px] pr-[10px] h-[18px] leading-[18px]">{d.width}ft</div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            }
        </div>
    )
})