import { useEffect, useState } from 'react';
import { Airplane, Halo, HexagonOne, Navigation, ShareOne, Triangle } from '@icon-park/react';
import axios from 'axios'
import { Tabs , Result, Skeleton } from 'antd';
import type { TabsProps } from 'antd';
import pubsub from 'pubsub-js'
import PhoneDrag from '../common/PhoneDrag';
import apiUrl from '../../config/api/apiUrl';
import createHeader from '../../utils/createHeader';
import useEnrouteSearch from '../../hooks/search/useEnrouteSearch';
import Divider from '../common/Divider';

export default () => {
    const WINDOW = 'search-panel'
    const [isShow, setIsShow] = useState(false)
    const [isMax, setIsMax] = useState(false)
    const [phone, setPhone] = useState(false)
    const [title, setTitle] = useState('')
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<SearchResult>({
      airports:[],
      vors:[],
      ndbs:[],
      otherNavids:[],
      airways:[],
      waypoints:[]
    })

    const items: TabsProps['items'] = [
        {
          key: '1',
          label: `机场`,
          children: (
            <div className="relative overflow-y-auto w-full search-calc-height">
              {
                data.airports.length ? data.airports.map(d => {
                  return (
                    <div key={d.icao} onClick={() => useEnrouteSearch('airport', d)} className="flex justify-around items-center flex-nowrap h-[45px] 
                        w-full pb-1 mb-1 cursor-pointer duration-200 hover:bg-[#3e5378]">
                        <div className="relative w-[12%] left-0 ml-[12px]"><Airplane theme="outline" size="28" fill="#ffffff"/></div>
                        <div className="relative w-[75%] ml-[15px] pt-[5px] leading-[14px]">
                            <div className="relative text-[14px] top-[4px] text-white">{d.name}</div>
                            <div className="relative mt-2 top-[-2px] text-[13px] text-gray-400">{d.icao}</div>
                        </div>
                    </div>
                  )
                }) : (
                  <Result
                    status="warning"
                    title="无机场搜索结果"
                  />
                )
              }
            </div>
          )
        },
        {
          key: '2',
          label: `VOR`,
          children: (
            <div className="relative overflow-y-auto w-full search-calc-height">
              {
                data.vors.length ? data.vors.map(d => {
                  return (
                    <div onClick={() => useEnrouteSearch('navaid', d)} key={`${d.location.latitude}-${d.ident}`} className="flex justify-around items-center flex-nowrap h-[45px] 
                        w-full pb-1 mb-1 cursor-pointer duration-200 hover:bg-[#3e5378]">
                        <div className="relative w-[12%] left-0 ml-[12px]"><HexagonOne theme="outline" size="28" fill="#ffffff"/></div>
                        <div className="relative w-[75%] ml-[15px] pt-[5px] leading-[14px]">
                            <div className="relative text-[14px] top-[4px] text-white">{d.name}</div>
                            <div className="relative mt-2 top-[-2px] text-[13px] text-gray-400">{d.ident}</div>
                        </div>
                    </div>
                  )
                }) : (
                  <Result
                    status="warning"
                    title="无VOR搜索结果"
                  />
                )
              }
            </div>
          )
        },
        {
          key: '3',
          label: `NDB`,
          children: (
            <div className="relative overflow-y-auto w-full search-calc-height">
              {
                data.ndbs.length ? data.ndbs.map(d => {
                  return (
                    <div onClick={() => useEnrouteSearch('navaid', d)} key={`${d.location.latitude}-${d.ident}`} className="flex justify-around items-center flex-nowrap h-[45px] 
                        w-full pb-1 mb-1 cursor-pointer duration-200 hover:bg-[#3e5378]">
                        <div className="relative w-[12%] left-0 ml-[12px]"><Halo theme="outline" size="28" fill="#ffffff"/></div>
                        <div className="relative w-[75%] ml-[15px] pt-[5px] leading-[14px]">
                            <div className="relative text-[14px] top-[4px] text-white">{d.name}</div>
                            <div className="relative mt-2 top-[-2px] text-[13px] text-gray-400">{d.ident}</div>
                        </div>
                    </div>
                  )
                }) : (
                  <Result
                    status="warning"
                    title="无NDB搜索结果"
                  />
                )
              }
            </div>
          )
        },
        {
          key: '4',
          label: `其他导航台`,
          children: (
            <div className="relative overflow-y-auto w-full search-calc-height">
              {
                data.otherNavids.length ? data.otherNavids.map(d => {
                  return (
                    <div onClick={() => useEnrouteSearch('navaid', d)} key={`${d.location.latitude}-${d.ident}`} className="flex justify-around items-center flex-nowrap h-[45px] 
                        w-full pb-1 mb-1 cursor-pointer duration-200 hover:bg-[#3e5378]">
                        <div className="relative w-[12%] left-0 ml-[12px]"><Navigation theme="outline" size="28" fill="#ffffff"/></div>
                        <div className="relative w-[75%] ml-[15px] pt-[5px] leading-[14px]">
                            <div className="relative text-[14px] top-[4px] text-white">{d.name}</div>
                            <div className="relative mt-2 top-[-2px] text-[13px] text-gray-400">{d.ident}</div>
                        </div>
                    </div>
                  )
                }) : (
                  <Result
                    status="warning"
                    title="无导航台搜索结果"
                  />
                )
              }
            </div>
          )
        },
        {
            key: '5',
            label: `航路`,
            children: (
              <div className="relative overflow-y-auto w-full search-calc-height">
                {
                  data.airways.length ? data.airways.map(d => {
                    return (
                      <div onClick={() => useEnrouteSearch('airway', d)} key={d.start} className="flex justify-around items-center flex-nowrap h-[45px] 
                          w-full pb-1 mb-1 cursor-pointer duration-200 hover:bg-[#3e5378]">
                          <div className="relative w-[12%] left-0 ml-[12px]"><ShareOne theme="outline" size="28" fill="#ffffff"/></div>
                          <div className="relative w-[75%] ml-[15px] pt-[5px] leading-[14px]">
                              <div className="relative text-[14px] top-[4px] text-white">{d.ident}</div>
                              <div className="relative mt-2 top-[-2px] text-[13px] text-gray-400">{d.start} - {d.end}</div>
                          </div>
                      </div>
                    )
                  }) : (
                    <Result
                      status="warning"
                      title="无航路搜索结果"
                    />
                  )
                }
              </div>
            )
        },
        {
          key: '6',
          label: `航路点`,
          children: (
            <div className="relative overflow-y-auto w-full search-calc-height">
              {
                data.waypoints.length ? data.waypoints.map(d => {
                  return (
                    <div onClick={() => useEnrouteSearch('waypoint', d)} key={`${d.location.latitude}-${d.ident}`} className="flex justify-around items-center flex-nowrap h-[45px] 
                        w-full pb-1 mb-1 cursor-pointer duration-200 hover:bg-[#3e5378]">
                        <div className="relative w-[12%] left-0 ml-[12px]"><Triangle theme="outline" size="28" fill="#ffffff"/></div>
                        <div className="relative w-[75%] ml-[15px] pt-[5px] leading-[14px]">
                            <div className="relative text-[14px] top-[4px] text-white">{d.ident}</div>
                            <div className="relative mt-2 top-[-2px] text-[13px] text-gray-400">航路点</div>
                        </div>
                    </div>
                  )
                }) : (
                  <Result
                    status="warning"
                    title="无航路点搜索结果"
                  />
                )
              }
            </div>
          )
        },
        
    ]

    const handleClose = () => {
        setIsShow(false)
        pubsub.publish('search-close',1)
    }

    useEffect(() => {
        pubsub.subscribe('search-panel-drag-up',() => {
          setIsMax(true)
        })

        pubsub.subscribe('search-panel-drag-down',() => {
          setIsMax(false)
        })

        pubsub.subscribe('start-searching',(_, value: string) => {
            setIsShow(true)
            setLoading(true)
            pubsub.publish('open-window',WINDOW)
            setTitle(value)
            axios.get(`${apiUrl.search}?t=${value}`,{'headers': createHeader()}).then(res => {
                if (res.data.code === 200){
                      setData(res.data.data)
                      setLoading(false)
                }
            })
        })

        pubsub.subscribe('open-window',(_,data: string) => {
          if (data === WINDOW) return
          // ! 在这里更改common-window打开的事件，后续记得更新
          if (data.includes('notam') || data.includes('weather') || data.includes('airport') ||
          data.includes('flight') || data.includes('checklist')){
            return setIsShow(false)
          }
            const width = document.body.scrollWidth
            if (width <= 700){
              setIsShow(false)
            }
        })
    },[])

    useEffect(() => {
        const setWidth = () => {
            const width = document.body.scrollWidth
            width > 700 ? setPhone(false) : setPhone(true)
        }

        setWidth()
        addEventListener('resize', setWidth)
    },[])

    return (
        <>{
          isShow &&
          <div className="search-panel z-[22] absolute left-[50px] w-80 top-[50px] 
              bottom-0 rounded-r-md bg-[#2f4565] ani-show-panel phone:w-full phone:left-0 duration-300"
              style={{
                'top': phone ? isMax ? '50px' : '' : '',
                'height': phone ? isMax ? 'calc(100% - 100px)' : '' : ''
              }}
              >
                  <PhoneDrag id="search-panel" />
                  <div className="relative text-[19px] text-white text-center w-full 
                  select-none phone:mt-[-25px]">{title}的搜索结果</div>
                  <div onClick={handleClose} className="absolute top-[4px] right-[16px] w-[60px] mt-[5px]
                                text-[#66a5f7] text-[18px] select-none rounded text-center leading-[20px] 
                                cursor-pointer duration-200 hover:text-[#6084d9]">&lt;&nbsp;返回</div>
                  {
                      loading ? <Skeleton active paragraph={{'rows': 10}} /> : <Tabs defaultActiveKey="1" centered items={items} />
                  }
                  <Divider />
              </div>
        } </>
    )
}