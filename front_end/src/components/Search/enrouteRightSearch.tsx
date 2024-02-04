import { Airplane, Halo, Triangle, HexagonOne, Navigation } from '@icon-park/react';
import { Tabs , Result , Skeleton } from 'antd';
import type { TabsProps } from 'antd';
import pubsub from 'pubsub-js'
import { useEffect, useState } from 'react';
import LocationFormat from '../../utils/LocationFormat';
import useDraggable from '../../hooks/useDraggable'
import useEnrouteSearch from '../../hooks/search/useEnrouteSearch'
import CreateCustomWaypoint from '../User/customWaypoint'


export default () => {
  const WINDOW = 'enroute-right-search'
  const [isShow, setIsShow ] = useState(false)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState([0,0])
  const [data, setData] = useState<EnrouteSearch>({
    airports:[],
    vors:[],
    ndbs:[],
    otherNavids:[],
    waypoints:[]
  })
  const { pos, ref } = useDraggable({ x: 400, y: 400 })

    const items: TabsProps['items'] = [
        {
          key: '1',
          label: `机场`,
          children: (
            <div className="relative h-[160px] overflow-y-auto w-full">
              {
                data.airports.length ? data.airports.map(d => {
                  return (
                    <div key={d.icao} onClick={() => useEnrouteSearch('airport', d)} className="flex justify-around items-center flex-nowrap h-[45px] 
                    w-full pb-1 mb-1 cursor-pointer duration-200 hover:bg-[#3e5378]">
                    <div className="relative w-[12%] left-0 ml-[12px]"><Airplane theme="outline" size="28" fill="#ffffff"/></div>
                    <div className="relative w-[75%] ml-[15px] pt-[5px] leading-[14px]">
                        <div className="relative text-[14px] top-[4px] text-white">{ d.name }</div>
                        <div className="relative mt-2 top-[-2px] text-[13px] text-gray-400">{d.icao}</div>
                    </div>
                </div>
                  )
                }) : (
                  <Result
                    status="warning"
                    title="当期区域无机场搜索结果"
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
            <div className="relative h-[160px] overflow-y-auto  w-full">
              {
                data.vors.length ? data.vors.map(d => {
                  return (
                    <div key={d.ident} onClick={() => useEnrouteSearch('navaid', d)} className="flex justify-around items-center flex-nowrap h-[45px] 
                    w-full pb-1 mb-1 cursor-pointer duration-200 hover:bg-[#3e5378]">
                    <div className="relative w-[12%] left-0 ml-[12px]"><HexagonOne theme="outline" size="28" fill="#ffffff"/></div>
                    <div className="relative w-[75%] ml-[15px] pt-[5px] leading-[14px]">
                        <div className="relative text-[14px] top-[4px] text-white">{ d.name }</div>
                        <div className="relative mt-2 top-[-2px] text-[13px] text-gray-400">{d.ident}</div>
                    </div>
                </div>
                  )
                }) : (
                  <Result
                    status="warning"
                    title="当期区域无VOR搜索结果"
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
            <div className="relative h-[160px] overflow-y-auto  w-full">
              {
                data.ndbs.length ? data.ndbs.map(d => {
                  return (
                    <div key={d.ident}  onClick={() => useEnrouteSearch('navaid', d)} className="flex justify-around items-center flex-nowrap h-[45px]
                     w-full pb-1 mb-1 cursor-pointer duration-200 hover:bg-[#3e5378]">
                    <div className="relative w-[12%] left-0 ml-[12px]"><Halo theme="outline" size="28" fill="#ffffff"/></div>
                    <div className="relative w-[75%] ml-[15px] pt-[5px] leading-[14px]">
                        <div className="relative text-[14px] top-[4px] text-white">{ d.name }</div>
                        <div className="relative mt-2 top-[-2px] text-[13px] text-gray-400">{d.ident}</div>
                    </div>
                </div>
                  )
                }) : (
                  <Result
                    status="warning"
                    title="当期区域无NDB搜索结果"
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
            <div className="relative h-[160px] overflow-y-auto  w-full">
              {
                data.otherNavids.length ? data.otherNavids.map(d => {
                  return (
                    <div key={d.ident} onClick={() => useEnrouteSearch('navaid', d)} className="flex justify-around items-center flex-nowrap h-[45px]
                    w-full pb-1 mb-1 cursor-pointer duration-200 hover:bg-[#3e5378]">
                    <div className="relative w-[12%] left-0 ml-[12px]"><Navigation theme="outline" size="28" fill="#ffffff"/></div>
                    <div className="relative w-[75%] ml-[15px] pt-[5px] leading-[14px]">
                        <div className="relative text-[14px] top-[4px] text-white">{ d.name }</div>
                        <div className="relative mt-2 top-[-2px] text-[13px] text-gray-400">{d.ident} - {d.type}</div>
                    </div>
                </div>
                  )
                }) : (
                  <Result
                    status="warning"
                    title="当期区域无导航台搜索结果"
                  />
                )
              }
              
            </div>
          )
        },
        {
          key: '5',
          label: `航路点`,
          children: (
            <div className="relative h-[160px] overflow-y-auto  w-full">
              {
                data.waypoints.length ? data.waypoints.map(d => {
                  return (
                    <div key={d.ident} onClick={() => useEnrouteSearch('waypoint', d)} className="flex justify-around items-center flex-nowrap h-[45px]
                    w-full pb-1 mb-1 cursor-pointer duration-200 hover:bg-[#3e5378]">
                    <div className="relative w-[12%] left-0 ml-[12px]"><Triangle theme="outline" size="28" fill="#ffffff"/></div>
                    <div className="relative w-[75%] ml-[15px] pt-[5px] leading-[14px]">
                        <div className="relative text-[14px] top-[2px] text-white">{ d.ident }</div>
                        <div className="relative mt-2 top-[-2px] text-[13px] text-gray-400">航路点</div>
                    </div>
                </div>
                  )
                }) : (
                  <Result
                    status="warning"
                    title="当期区域无航路点搜索结果"
                  />
                )
              }
              
            </div>
          )
        },
    ]

    const handleClose = () => {
        pubsub.publish('enroute-search-close',1)
        setIsShow(false)
    }

    const addCustomWaypoint = () => {
        pubsub.publish('show-custom-waypoint-panel', 1)
    }

    useEffect(() => {
        pubsub.subscribe('enroute-search-start',() => {
            setIsShow(true)
            setLoading(true)
            pubsub.publish('open-window',WINDOW)
        })
        pubsub.subscribe('enroute-search-data',(_,data) => {
            const d:{location: number[], data: EnrouteSearch} = data
            setLocation(d.location)
            setData(d.data)
            setIsShow(true)
            setLoading(false)
        })

        pubsub.subscribe('open-window',(_,data: string) => {
          if (data === WINDOW) return
            const width = document.body.scrollWidth
            if (width <= 700){
                setIsShow(false)
            }
        })
    },[])

    return (
        <>{
            isShow &&
            <div className="enroute-search absolute w-[320px] h-[260px] 
            z-[20] right-0 top-[440px] rounded-md mr-[60px] bg-[#2f475e] select-none
            phone:w-full phone:left-0 t-calc-full-minus-310px ani-show-buttom-win"
            ref={ref}
            style={{
              left: document.body.scrollWidth > 700 ? `${pos.x}px` : '',
              top: document.body.scrollWidth > 700 ? `${pos.y}px` : '',
            }}>
                <div className="relative w-full h-[24px] leading-[24px] text-center mb-1 
                cursor-move text-white text-[17px] phone:cursor-default">航路图的搜索结果</div>
                <div onClick={handleClose} className="absolute top-[4px] right-[16px] w-[60px] mt-[5px]
                                text-[#66a5f7] text-[18px] select-none rounded text-center leading-[20px] 
                                cursor-pointer duration-200 hover:text-[#6084d9]">&lt;&nbsp;返回</div>
                <div className="relative w-full h-[20px] mt-[-5px] leading-[20px] text-center text-white text-[14px]">
                  {LocationFormat(location[1], location[0])}</div>
                  <div className="relative w-full h-[18px] mt-[2px] text-center flex justify-center">
                      <div className="relative w-[160px] h-[25px] leading-[25px] rounded
                      text-center text-white text-[14px] cursor-pointer bg-[#395e81]" onClick={addCustomWaypoint}>在此处添加自定义航点</div>
                  </div>
                  <CreateCustomWaypoint location={location} />
                {
                  loading ? 
                  <Skeleton active paragraph={{'rows': 5}} />
                  :
                  <Tabs defaultActiveKey="1" centered items={items} />
                }
            </div>
        }
            
        </>
    )
}