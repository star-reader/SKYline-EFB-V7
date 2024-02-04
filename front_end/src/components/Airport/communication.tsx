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
    const [comList, setComList] = useState<CommunicationList[]>([])

    useEffect(() => {
        pubsub.subscribeOnce('handle-airport-communication', (_,icao: string) => {
            setLoading(true)
            setFail(false)
            axios.get(`${apiUrl.airportCom}?icao=${icao}`,{'headers':createHeader()}).then(res => {
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
                                <div key={getRandom(10)}
                                className="relative m-2 rounded-md bg-[#345476] p-3">
                                    <div className="relative text-[15px] leading-[18px] text-white font-semibold select-none">
                                        {d.callsign}
                                    </div>
                                    <div className="relative text-[14px] leading-[18px] text-white">
                                        类型: {d.type}
                                    </div>
                                    <div className="relative text-[14px] leading-[18px] text-white">
                                        频率: {d.frequency}
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