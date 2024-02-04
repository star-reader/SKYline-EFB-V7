import { Result, Skeleton, message } from "antd"
import { useEffect, useState, memo } from "react"
import pubsub from 'pubsub-js'
import axios from 'axios'
import { Pin } from "@icon-park/react"
import apiUrl from "../../config/api/apiUrl"
import createHeader from "../../utils/createHeader"
import Divider from "../common/Divider"
import getPoints from "../../hooks/user/getPoints"

export default memo(() => {
    const [loading, setLoading] = useState(true)
    const [fail, setFail] = useState(false)
    const [aipList, setAipList] = useState<AIPChartList[]>([])

    const haneleClickChart = (data: AIPChartList) => {
        const point = getPoints()
        if (!point || point <= 0){
            pubsub.publish('no-point', 1)
            if (!data.display_name.includes('ZBAA') || !data.display_name.includes('ZBAD') || !data.display_name.includes('ZBTJ')) return
        }
        pubsub.publish('start-loading-chart-url', 1)
        axios.post(apiUrl.aipUrl,data, {'headers': createHeader()}).then(res => {
            if (res.data.code === 200){
                pubsub.publish('chart-url-loaded', {
                    origin: data,
                    url: res.data.data.url
                })
            }
        }).catch(() => {
            message.error('航图加载失败')
        })
        // 设置点击航图样式
        const els = document.querySelectorAll('.aip-charts')
        for (let e of els){
            if (e.getAttribute('aria-description') === data.token){
                e.setAttribute('chart-state', 'open')
            }else{
                e.setAttribute('chart-state', 'close')
            }
        }
    }

    const handlePinChart = (data: AIPChartList, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation()
        e.preventDefault()
        pubsub.publish('add-pinboard', data)
    }

    useEffect(() => {
        pubsub.subscribeOnce('handle-airport-aip', (_,icao: string) => {
            setLoading(true)
            setFail(false)
            axios.get(`${apiUrl.aipCharts}?icao=${icao}`,{'headers':createHeader()}).then(res => {
                if (res.data.code === 200){
                    setLoading(false)
                    setFail(false)
                    setAipList(res.data.data)
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
                fail || !aipList.length ? <Result
                    status="warning"
                    title="加载失败，可能当期机场不支持AIP航图哦~"
                    subTitle="目前AIP仅可用于中国大陆地区的机场，其他国家的AIP会在后续更新中逐步添加"
                /> :
                <div className="chart-list relative">
                    {
                        aipList.map(d => {
                            return (
                                <div key={d.token} onClick={() => haneleClickChart(d)} 
                                aria-description={d.token}
                                className="relative flex justify-between items-center left-0 w-full 
                                    mt-1 duration-200 cursor-pointer select-none aip-charts hover:bg-[#3a5170]">
                                    <div className="ml-0 max-w-[70%]">
                                        <div className="relative mt-1 pl-2 text-white text-[14px]">{d.display_name}</div>
                                        <div className="relative mt-0 pl-2 font-light text-gray-400 text-[13px]">AIP</div>
                                    </div>
                                    <div onClick={(e) => handlePinChart(d, e)} className="relative w-[15%]">
                                        {
                                            <Pin theme="outline" size="24" fill="#ffffff"/>
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                    <Divider />
                </div>
            }
        </div>
    )
})