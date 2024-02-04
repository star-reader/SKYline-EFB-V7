import { useEffect, useState } from "react"
import pubsub from 'pubsub-js'
import { CheckOne, Delete, Sandstorm, Snowflake, SunOne, Sunny, Thunderstorm } from "@icon-park/react"
import { Result, Input, Skeleton } from "antd"
import axios from 'axios'
import PhoneDrag from "../common/PhoneDrag"
import { appendWeather, deleteWeather, getWeatherList } from "../../hooks/weather/useList"
import apiUrl from "../../config/api/apiUrl"
import createHeader from "../../utils/createHeader"
import useWeatherType from "../../hooks/weather/useWeatherType"
import getUTCString from "../../utils/getUTCString"
import getRandom from "../../utils/getRandom"
import getUpdateTime from "../../hooks/weather/getUpdateTime"
import Divider from "../common/Divider"

const { Search } = Input

export default () => {
    const WINDOW = 'weather-panel'
    const [editMode, setEditMode] = useState(false)
    const [isShow, setIsShow] = useState(false)
    const [isHide, setIsHide] = useState(false)
    const [isMax, setIsMax] = useState(false)
    const [phone, setPhone] = useState(false)
    const [loading, setLoading] = useState(false)
    const [detail, setDetail] = useState(false)
    const [fail, setFail] = useState(false)
    const [list, setList] = useState<WeatherListStore[]>(getWeatherList())
    const [data, setData] = useState<WeatherInfo>({
        'airport_info': '',
        'forecast_text': '',
        'metar': '',
        'taf':''
    })

    useEffect(() => {
        pubsub.subscribe('click-weather', (_,data: number) => {
            if (!data){
                setIsShow(false)
            }else{
                setIsShow(true)
                setIsHide(false)
                pubsub.publish('open-window', WINDOW)
            }
        })
        pubsub.subscribe('weather-panel-drag-up',() => {
            setIsMax(true)
        })
    
        pubsub.subscribe('weather-panel-drag-down',() => {
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
    },[])

    const handleClose = () => {
        if (detail){
            setDetail(false)
            setList(getWeatherList())
        }else{
            setIsShow(false)
            //pubsub.publish('weather-close',1)
            pubsub.publish('common-close',2)
        }
        
    }

    const handleSearch = (value: string) => {
        setDetail(true)
        setLoading(true)
        axios.get(`${apiUrl.weather}?icao=${value.toUpperCase()}`,{
            'headers': createHeader()
        }).then(res => {
            setLoading(false)
            if (res.data.code === 200){
                setFail(false)
                setData(res.data.data)
                const info: WeatherListStore = {
                    'icao': value.toUpperCase(),
                    'date': getUTCString(),
                    'id': getRandom(16),
                    'weather': useWeatherType(res.data.data.metar)
                }
                appendWeather(info)
            }else{
                setFail(true)
            }
        }).catch(() => {
            setLoading(false)
            setFail(true)
        })
    }

    const handleDelete = (d: WeatherListStore, e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()
        const nList = deleteWeather(d)
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
              style={{
                'top': phone ? isMax ? '50px' : '' : '',
                'height': phone ? isMax ? 'calc(100% - 100px)' : '' : '',
                'display': isHide ? 'none' : 'block'
              }}
              >
                  <PhoneDrag id={WINDOW} />
                  <div className="relative text-[19px] text-white text-center w-full 
                  select-none phone:mt-[-30px] mb-[12px]">
                    {detail ? '机场详细天气资料' : '机场天气信息'}
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
                              title="加载失败，请重试"
                            /> :
                            <div className="relative">
                                <div className="relative mt-2
                                 text-[15px] text-green-400 pl-[15px] h-[20px] leading-[20px] select-none">
                                    <CheckOne theme="filled"
                                    style={{position:'relative',display: 'inline-block',paddingRight:'10px',top:'2px'}} 
                                    size="16" fill="#3acc71"/>
                                    {getUpdateTime(data)}
                                </div>
                                <div className="relative mt-2 pb-1
                                bg-[#456294] text-gray-200 text-[14px] pl-[15px] h-[24px] leading-[20px] select-none">
                                    METAR(例行天气报告)
                                </div>
                                <div className="relative m-2 rounded-md bg-[#364d74] text-white text-[16px] p-3">
                                {data.metar ? data.metar : '暂无'}
                                </div>
                                <div className="relative mt-2 pb-1
                                bg-[#456294] text-gray-200 text-[14px] pl-[15px] h-[24px] leading-[20px] select-none">
                                    TAF(终端机场天气预报)
                                </div>
                                <div className="relative m-2 rounded-md bg-[#364d74] text-white text-[16px] p-3">
                                {data.taf ? data.taf : '暂无'}
                                </div>
                                <div className="relative mt-2 pb-1
                                bg-[#456294] text-gray-200 text-[14px] pl-[15px] h-[24px] leading-[20px] select-none">
                                    METAR解析报文
                                </div>
                                <div className="relative m-2 rounded-md bg-[#364d74] text-white text-[16px] p-3 select-none">
                                {data.airport_info ? data.airport_info : '暂无'}
                                </div>
                            </div>
                            :
                            list.length ? 
                            list.map(d => {
                                return (
                                    <div key={d.id} onClick={() => handleSearch(d.icao)} className="editable-element relative flex justify-between items-center left-0 w-full 
                                        mt-1 duration-200 cursor-pointer select-none hover:bg-[#3a5170]">
                                        <div className="ml-[40px]">
                                            <div className="relative mt-3 text-white font-bold text-[20px]">{d.icao}</div>
                                            <div className="relative mt-0 text-gray-400 text-[15px]">{d.date}</div>
                                        </div>
                                        <div className="relative w-[60px] mr-2">

                                            {
                                                d.weather === 'clear' ?
                                                <SunOne theme="outline" size="24" fill="#ffffff"/> :
                                                d.weather === 'rain' ? 
                                                <Thunderstorm theme="outline" size="28" fill="#ffffff"/> :
                                                d.weather === 'snow' ? 
                                                <Snowflake theme="outline" size="24" fill="#ffffff"/> :
                                                d.weather === 'fog' ? 
                                                <Sandstorm theme="outline" size="24" fill="#ffffff"/> :
                                                <Sunny theme="outline" size="24" fill="#ffffff"/>
                                            }
                                        </div>
                                        <div onClick={e => handleDelete(d, e)} className="absolute w-[40px] right-0 h-full rounded bg-[#49678d] remove-button hidden justify-center items-center">
                                            <Delete theme="outline" size="25" fill="#ffffff" style={{'opacity': '0.6'}}/>
                                        </div>
                                    </div>
                                )
                          }) :
                          (
                            <Result
                              status="warning"
                              title="暂无天气搜索记录"
                            />
                          )
                        }
                      </div>
                  <Divider />
              </div>
        } </>
    )
}