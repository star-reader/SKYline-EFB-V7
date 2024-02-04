import { useEffect, useState } from "react"
import pubsub from 'pubsub-js'
import { Result, Input, Skeleton , Tabs } from "antd"
import type { TabsProps } from 'antd'
import axios from 'axios'
import PhoneDrag from "../common/PhoneDrag"
import apiUrl from "../../config/api/apiUrl"
import createHeader from "../../utils/createHeader"
import getUTCString from "../../utils/getUTCString"
import getRandom from "../../utils/getRandom"
import { appendAirport, deleteAirport, getAirportList } from "../../hooks/airport/useList"
import JeppesenChartsList from "./jeppesenChartsList"
import AIPChartList from './aipChartsList'
import Communication from './communication'
import Runway from './runway'
import LocationFormat from "../../utils/LocationFormat"
import Divider from "../common/Divider"
import { Delete } from "@icon-park/react"

const { Search } = Input

export default () => {
    const WINDOW = 'airport-panel'
    const [editMode, setEditMode] = useState(false)
    const [isShow, setIsShow] = useState(false)
    const [isHide, setIsHide] = useState(false)
    const [isMax, setIsMax] = useState(false)
    const [phone, setPhone] = useState(false)
    const [list, setList] = useState<AirportListStore[]>(getAirportList())
    const [detail, setDetail] = useState(false)
    const [loading, setLoading] = useState(false)
    const [fail, setFail] = useState(false)
    const [arptInfo, setArptInfo] = useState<QueryAirport>({
        'icao': '',
        'elevation': 0,
        'location': {'latitude':0, 'longtitude':0},
        'name': '',
        'speed_limit': 0,
        'speed_limit_altitude':0,
        'transition_altitude': 0,
        'transition_level': 0
    })

    const items: TabsProps['items'] = [
        {
          key: '1',
          label: `基础信息`,
          children: (
            <div className="relative base-1">
                <div className="relative m-2 text-white text-[16px] select-none">
                    <div className="relative ml-4">机场ICAO:  {arptInfo.icao}</div>
                </div>
                <div className="relative m-2 text-white text-[16px] select-none">
                    <div className="relative ml-4">机场名称:  {arptInfo.name}</div>
                </div>
                <div className="relative m-2 text-white text-[16px] select-none">
                    <div className="relative ml-4">机场坐标:  {LocationFormat(arptInfo.location.latitude, arptInfo.location.longtitude)}</div>
                </div>
                <div className="relative m-2 text-white text-[16px] select-none">
                    <div className="relative ml-4">机场标高:  {arptInfo.elevation}ft</div>
                </div>
                <div className="relative m-2 text-white text-[16px] select-none">
                    <div className="relative ml-4">过渡高度:  {arptInfo.transition_altitude}ft</div>
                </div>
                <div className="relative m-2 text-white text-[16px] select-none">
                    <div className="relative ml-4">过渡高度层:  {arptInfo.transition_level}ft</div>
                </div>
                <div className="relative m-2 text-white text-[16px] select-none">
                    <div className="relative ml-4">机场速度限制:  {arptInfo.speed_limit}knots</div>
                </div>
                <div className="relative m-2 text-white text-[16px] select-none">
                    <div className="relative ml-4">速度限制高度:  {arptInfo.speed_limit_altitude}ft</div>
                </div>
            </div>
          ),
        },
        {
          key: '2',
          label: `航图(Jeppesen)`,
          children: <JeppesenChartsList />,
        },
        {
          key: '3',
          label: `航图(AIP)`,
          children: <AIPChartList />,
        },
        {
          key: '4',
          label: `跑道`,
          children: <Runway />,
        },
        {
          key: '5',
          label: `频率`,
          children: <Communication />,
        }
    ];

    useEffect(() => {
        pubsub.subscribe('click-airport', (_,data: number) => {
            if (!data){
                setIsHide(true)
            }else{
                setIsShow(true)
                setIsHide(false)
                pubsub.publish('open-window', WINDOW)
                //pubsub.publish('handle-airport-info', 1)
            }
        })
        pubsub.subscribe('airport-panel-drag-up',() => {
            setIsMax(true)
        })
    
        pubsub.subscribe('airport-panel-drag-down',() => {
            setIsMax(false)
        })
        pubsub.subscribe('open-window',(_,data: string) => {
            if (data === WINDOW) return
            const width = document.body.scrollWidth
            if (width <= 700){
            setIsShow(false)
            }
        })
        pubsub.subscribe('open-common-window',(_,data: string) => {
            if (data === WINDOW) return
            setIsHide(true)
        })
        pubsub.subscribe('start-searching',() => {
            setIsHide(true)
        })
        pubsub.subscribe('request-detail-airport',(_,data: string) => {
            setIsShow(true)
            setIsHide(false)
            handleSearch(data)
        })
    },[])

    const handleClose = () => {
        if (detail){
            setDetail(false)
            setList(getAirportList())
        }else{
            setIsShow(false)
            //pubsub.publish('weather-close',1)
            pubsub.publish('common-close',2)
        }
        
    }

    const onChange = (key: string) => {
        if (key === '2'){
            setTimeout(() => {
                pubsub.publish('handle-airport-info',arptInfo.icao)
            }, 500);
            
        }
        if (key === '3'){
            setTimeout(() => {
                pubsub.publish('handle-airport-aip',arptInfo.icao)
            }, 500)
        }
        if (key === '4'){
            setTimeout(() => {
                pubsub.publish('handle-airport-runway',arptInfo.icao)
            }, 500)
        }
        if (key === '5'){
            setTimeout(() => {
                pubsub.publish('handle-airport-communication',arptInfo.icao)
            }, 500)
        }
    }

    const handleSearch = (value: string) => {
        setDetail(true)
        setLoading(true)
        //setLoadingCharts(true)
        
        axios.get(`${apiUrl.airport}?icao=${value.toUpperCase()}`,{
            'headers': createHeader()
        }).then(res => {
            setLoading(false)
            if (res.data.code === 200){
                setFail(false)
                setArptInfo(res.data.data)
                const info: AirportListStore = {
                    'id': getRandom(16),
                    'icao': value.toUpperCase(),
                    'name': res.data.data.name,
                    'date': getUTCString(),
                }
                appendAirport(info)
            }else{
                setFail(true)
            }
        }).catch(() => {
            setLoading(false)
            setFail(true)
        })
    }

    const handleDelete = (d: AirportListStore, e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()
        const nList = deleteAirport(d)
        setList(nList)
    }

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
          <div className={`common-panel z-[22] absolute left-[50px] w-80 top-[50px] 
              bottom-0 rounded-r-md bg-[#2f4565] ani-show-common-panel phone:w-full phone:left-0 duration-300 ${editMode ? 'edit-mode' : 'placeholder-overview'}`}
              zoom-max={phone ? isMax ? 'true' : '' : ''}
              style={{
                'top': phone ? isMax ? '50px' : '' : '',
                'height': phone ? isMax ? 'calc(100% - 100px)' : '' : '',
                'display': isHide ? 'none' : 'block'
              }}
              >
                  <PhoneDrag id={WINDOW} />
                  <div className="relative text-[19px] text-white text-center w-full 
                  select-none phone:mt-[-30px] mb-[12px]">
                    {detail ? '机场详细资料' : '机场列表'}
                  </div>
                  <div onClick={handleClose} className="absolute top-[4px] right-[16px] w-[60px] mt-[4px]
                        text-[#66a5f7] text-[18px] select-none rounded text-center leading-[20px] 
                        cursor-pointer duration-200 hover:text-[#6084d9] phone:mt-[5px]">&lt;&nbsp;返回
                    </div>
                    {
                        !detail &&
                        <div onClick={() => setEditMode(!editMode)} className={`absolute top-[4px] left-[15px] mt-[4px] h-[20px]
                            text-[13px] rounded text-white select-none
                            text-center leading-[20px] align-middle
                            cursor-pointer phone:mt-[5px] pb-[2px] pl-[6px] pr-[6px] ${editMode ? 'edit-mode-exit' : 'edit-mode-enable'}`}>{editMode ? '退出编辑' : '编辑列表'}
                        </div>
                    }
                      <Search placeholder="搜索机场ICAO" onSearch={handleSearch} />
                      <div className="relative common-window-height w-full overflow-x-hidden overflow-y-auto">
                        {
                            detail ? 
                            loading ?
                            <Skeleton active paragraph={{ rows: 10 }} /> :
                            fail ?
                            <Result
                              status="warning"
                              title="机场信息加载失败，请重试"
                            /> :
                            <div className="relative h-[100%]">
                                {/* // ! 在这里展示详情机场信息，主体是一个tab，包括基本信息、航图列表(jeppesen)、航图列表(aip)、程序预览等内容
                                // ! 数据state: arptInfo chartList  aipList procedure */}
                                    <Tabs items={items} centered onChange={onChange} />
                            </div>
                            :
                            list.length ? 
                            <>{
                                list.map(d => {
                                    return (
                                        <div key={d.id} onClick={() => handleSearch(d.icao)} className="editable-element relative flex justify-between items-center left-0 w-full 
                                            mt-1 duration-200 cursor-pointer select-none hover:bg-[#3a5170]">
                                            <div className="ml-[40px]">
                                                <div className="relative mt-3 text-white font-bold text-[20px]">{d.icao}</div>
                                                <div className="relative mt-0 text-gray-400 text-[15px]">{d.date}</div>
                                            </div>
                                            <div className="relative w-[60px]"></div>
                                            <div onClick={e => handleDelete(d, e)} className="absolute w-[40px] right-0 h-full rounded bg-[#49678d] remove-button hidden justify-center items-center">
                                                <Delete theme="outline" size="25" fill="#ffffff" style={{'opacity': '0.6'}}/>
                                            </div>
                                        </div>
                                    )
                            })}
                            <Divider />
                            </>
                             :
                          (
                            <Result
                              status="warning"
                              title="暂无机场搜索记录"
                            />
                          )
                        }
                      </div>
              </div>
        } </>
    )
}