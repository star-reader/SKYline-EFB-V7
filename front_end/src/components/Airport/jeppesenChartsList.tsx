import { useEffect, useState , memo } from "react"
import pubsub from 'pubsub-js'
import axios from 'axios'
import { Skeleton, Result , Tabs } from 'antd'
import type {TabsProps} from 'antd'
import { Pin } from "@icon-park/react"
import apiUrl from "../../config/api/apiUrl"
import createHeader from "../../utils/createHeader"
import Divider from "../common/Divider"
import getPoints from "../../hooks/user/getPoints"

export default memo(() => {
    const [loading, setLoading] = useState(true)
    const [fail, setFail] = useState(false)
    const [chartList, setChartList] = useState<JeppesenChartList[]>([])

    const haneleClickChart = (data: JeppesenChartList) => {
        const point = getPoints()
        if (!point || point <= 0){
            pubsub.publish('no-point', 1)
            if (!['ZBAA', 'ZBAD', 'ZBTJ'].includes(data.airport_icao)) return
        }
        pubsub.publish('start-loading-chart-url', 1)
        axios.post(apiUrl.jeppesenUrl,data, {'headers': createHeader()}).then(res => {
            if (res.data.code === 200){
                pubsub.publish('chart-url-loaded', {
                    origin: data,
                    url: res.data.data.url
                })
            }
        }).catch(() => {
            
        })
        // 设置点击航图样式
        const els = document.querySelectorAll('.jepp-charts')
        for (let e of els){
            if (e.getAttribute('aria-description') === data.chart_hash_token){
                e.setAttribute('chart-state', 'open')
            }else{
                e.setAttribute('chart-state', 'close')
            }
        }
    }

    const handlePinChart = (data: JeppesenChartList, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation()
        e.preventDefault()
        pubsub.publish('add-pinboard', data)
    }

    const items: TabsProps['items'] = [
        {
          key: '1',
          label: `机场图`,
          children: (
            <>
                {
                    chartList.map(d => {
                        if (d.chart_type !== 'APT') return
                        return (
                            <div key={d.chart_hash_token} onClick={() => haneleClickChart(d)} 
                            aria-description={d.chart_hash_token}
                            className="relative flex justify-between items-center left-0 w-full 
                                mt-1 duration-200 cursor-pointer select-none jepp-charts jepp-charts hover:bg-[#3a5170]">
                                <div className="ml-0 max-w-[70%]">
                                    <div className="relative mt-1 pl-2 text-white text-[14px]">{d.chart_name}</div>
                                    <div className="relative mt-0 pl-2 font-light text-gray-400 text-[13px]">{d.ident}</div>
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
            </>
          )
        },
        {
          key: '2',
          label: `离场图`,
          children: (
            <>
                {
                    chartList.map(d => {
                        if (d.chart_type !== 'DEP') return
                        return (
                            <div key={d.chart_hash_token} onClick={() => haneleClickChart(d)}
                            aria-description={d.chart_hash_token}
                            className="relative flex justify-between items-center left-0 w-full 
                                mt-1 duration-200 cursor-pointer select-none jepp-charts hover:bg-[#3a5170]">
                                <div className="ml-0 max-w-[70%]">
                                    <div className="relative mt-1 pl-2 text-white text-[14px]">{d.chart_name}</div>
                                    <div className="relative mt-0 pl-2 font-light text-gray-400 text-[13px]">{d.ident}</div>
                                </div>
                                <div onClick={(e) => handlePinChart(d, e)}  className="relative w-[15%]">
                                    {
                                        <Pin theme="outline" size="24" fill="#ffffff"/>
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </>
          )
        },
        {
          key: '3',
          label: `进场图`,
          children: (
            <>
                {
                    chartList.map(d => {
                        if (d.chart_type !== 'ARR') return
                        return (
                            <div key={d.chart_hash_token} onClick={() => haneleClickChart(d)} 
                            aria-description={d.chart_hash_token}
                            className="relative flex justify-between items-center left-0 w-full 
                                mt-1 duration-200 cursor-pointer select-none jepp-charts hover:bg-[#3a5170]">
                                <div className="ml-0 max-w-[70%]">
                                    <div className="relative mt-1 pl-2 text-white text-[14px]">{d.chart_name}</div>
                                    <div className="relative mt-0 pl-2 font-light text-gray-400 text-[13px]">{d.ident}</div>
                                </div>
                                <div onClick={(e) => handlePinChart(d, e)}  className="relative w-[15%]">
                                    {
                                        <Pin theme="outline" size="24" fill="#ffffff"/>
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </>
          )
        },
        {
          key: '4',
          label: `进近图`,
          children: (
            <>
                {
                    chartList.map(d => {
                        if (d.chart_type !== 'APP') return
                        return (
                            <div key={d.chart_hash_token} onClick={() => haneleClickChart(d)} 
                            aria-description={d.chart_hash_token}
                            className="relative flex justify-between items-center left-0 w-full 
                                mt-1 duration-200 cursor-pointer select-none jepp-charts hover:bg-[#3a5170]">
                                <div className="ml-0 max-w-[70%]">
                                    <div className="relative mt-1 pl-2 text-white text-[14px]">{d.chart_name}</div>
                                    <div className="relative mt-0 pl-2 font-light text-gray-400 text-[13px]">{d.ident}</div>
                                </div>
                                <div onClick={(e) => handlePinChart(d, e)}  className="relative w-[15%]">
                                    {
                                        <Pin theme="outline" size="24" fill="#ffffff"/>
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </>
          )
        },
        {
          key: '5',
          label: `其他`,
          children: (
            <>
                {
                    chartList.map(d => {
                        if (d.chart_type !== 'OTHER') return
                        return (
                            <div key={d.chart_hash_token} onClick={() => haneleClickChart(d)} 
                            aria-description={d.chart_hash_token}
                            className="relative flex justify-between items-center left-0 w-full 
                                mt-1 duration-200 cursor-pointer select-none jepp-charts hover:bg-[#3a5170]">
                                <div className="ml-0 max-w-[70%]">
                                    <div className="relative mt-1 pl-2 text-white text-[14px]">{d.chart_name}</div>
                                    <div className="relative mt-0 pl-2 font-light text-gray-400 text-[13px]">{d.ident}</div>
                                </div>
                                <div onClick={(e) => handlePinChart(d, e)}  className="relative w-[15%]">
                                    {
                                        <Pin theme="outline" size="24" fill="#ffffff"/>
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </>
          )
        },
      ];

    useEffect(() => {
        pubsub.subscribeOnce('handle-airport-info', (_,icao: string) => {
            setLoading(true)
            axios.get(`${apiUrl.jeppesenCharts}?icao=${icao}`,{'headers': createHeader()}).then(res => {
                if (res.data.code === 200){
                    setLoading(false)
                    setFail(false)
                    setChartList(res.data.data)
                }else{
                    setLoading(false)
                    setFail(true)
                }
            }).catch(() => {
                setLoading(false)
                setFail(true)
            })
        })
    },[])

    return (/*  */
        <div className="relative overflow-y-auto w-full search-calc-height jeppesen-chart-panel">
            {
                loading ? <Skeleton active paragraph={{'rows': 10}} /> :
                fail ? <Result
                    status="warning"
                    title="加载失败，请重试"
                /> :
                <div className="chart-list relative">
                    <Tabs defaultActiveKey="1" items={items} tabPosition='left' />
                    <Divider />
                </div>
            }
        </div>
    )
})