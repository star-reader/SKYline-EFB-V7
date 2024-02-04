import { useState , useEffect } from 'react'
import { Skeleton, Tooltip } from 'antd'
import { Deeplink, DividingLine, Edit, LightHouse, LinkCloud , RadarTwo, 
        Road, ShareOne, Speed, TargetTwo, ThermometerOne, Wind } from '@icon-park/react'
import axios from 'axios'
import pubsub from 'pubsub-js'
import RunwaySelection from './runwaySelection'
import ProcedureSelection from './procedureSelection'
import AppSelection from './appSelection'
import apiUrl from '../../config/api/apiUrl'
import createHeader from '../../utils/createHeader'
import formatAPPs from '../../utils/formatAPPs'
import useMainRouteLayer from '../../hooks/flight/useMainRouteLayer'
import ShowBeta from '../common/showBeta'
import formatMetarToShow from '../../utils/formatMetarToShow'
import FlightBrief from './flightBrief'
import OwnshipBrief from '../Ownship/brief'
import NavlinkBrief from '../Ownship/navlinkBrief'
import Divider from '../common/Divider'
import usetGeojson from '../../utils/procedure/drawOnMap/usetGeojson'
import getSegments from '../../utils/procedure/getSegments'

interface Props {
    data: LoadFlight
}


export default ({data}: Props) => {

    const [depInfo, setDepInfo] = useState<QueryAirport | undefined | 1>()
    const [arrInfo, setArrInfo] = useState<QueryAirport | undefined | 1>()
    const [depWx, setDepWx] = useState<ParsedWeather | undefined | 1>()
    const [arrWx, setArrWx] = useState<ParsedWeather | undefined | 1>()
    const [depWxOriginal, setDepWxOriginal] = useState<any>()
    const [arrWxOriginal, setArrWxOriginal] = useState<any>()
    const [depRwySelection, setDepRwySelection] = useState<Runway[] | undefined | 1>()
    const [arrRwySelection, setArrRwySelection] = useState<Runway[] | undefined | 1>()
    const [depProSelection, setDepProSelection] = useState<SIDSTARS[] | undefined | 1>()
    const [arrProSelection, setArrProSelection] = useState<SIDSTARS[] | undefined | 1>()
    const [appProSelection, setAppProSelection] = useState<APPS[] | undefined | 1>()

    // 以下是已经选择的程序
    const [depRwy, setDepRwy] = useState<Runway | undefined>()
    const [arrRwy, setArrRwy] = useState<Runway | undefined>()
    const [depPro, setDepPro] = useState<SIDSTARS | undefined>()
    const [arrPro, setArrPro] = useState<SIDSTARS | undefined>()
    const [appPro, setAppPro] = useState<APPS | undefined>()

    const [ownship, setOwnship] = useState<TrafficData | null>(null)
    const [navlink, setNavlink] = useState<NavLink | null>(null)

    let tempArrPoint: number[] = []
    let tempDepRwy: Runway | undefined
    let tempArrRwy: Runway | undefined

    useEffect(() => {
        const updateInfo = () => {
            clearValue()
            axios.get(`${apiUrl.airport}?icao=${data?.OFP.general.departure}`,{'headers': createHeader()}).then(res => {
                if (res.data.code === 200) return setDepInfo(res.data.data)
                return setDepInfo(1)
            }).catch(() => setDepInfo(1))
            axios.get(`${apiUrl.airport}?icao=${data?.OFP.general.arrival}`,{'headers': createHeader()}).then(res => {
                if (res.data.code === 200) return setArrInfo(res.data.data)
                return setArrInfo(1)
            }).catch(() => setArrInfo(1))
            axios.get(`${apiUrl.weather}?icao=${data?.OFP.general.departure}`,{'headers': createHeader()}).then(res => {
                if (res.data.code === 200){
                    const weather = res.data.data
                    setDepWxOriginal(weather.airport_info)
                    const d = formatMetarToShow(weather.airport_info, weather.metar)
                    return setDepWx(d)
                }
                return setDepWx(1)
            }).catch(() => setDepWx(1))
            axios.get(`${apiUrl.weather}?icao=${data?.OFP.general.arrival}`,{'headers': createHeader()}).then(res => {
                if (res.data.code === 200){
                    const weather = res.data.data
                    setArrWxOriginal(weather.airport_info)
                    const d = formatMetarToShow(weather.airport_info, weather.metar)
                    return setArrWx(d)
                }
                return setArrWx(1)
            }).catch(() => setArrWx(1))
            axios.get(`${apiUrl.runways}?icao=${data?.OFP.general.departure}`,{'headers': createHeader()}).then(res => {
                if (res.data.code === 200) return setDepRwySelection(res.data.data)
                return setDepRwySelection(1)
            }).catch(() => setDepRwySelection(1))
            axios.get(`${apiUrl.runways}?icao=${data?.OFP.general.arrival}`,{'headers': createHeader()}).then(res => {
                if (res.data.code === 200) return setArrRwySelection(res.data.data)
                return setArrRwySelection(1)
            }).catch(() => setArrRwySelection(1))
            axios.get(`${apiUrl.procedure}?icao=${data?.OFP.general.departure}&type=SID`,{'headers': createHeader()}).then(res => {
                if (res.data.code === 200) return setDepProSelection(res.data.data)
                return setDepProSelection(1)
            }).catch(() => setDepProSelection(1))
            axios.get(`${apiUrl.procedure}?icao=${data?.OFP.general.arrival}&type=STAR`,{'headers': createHeader()}).then(res => {
                if (res.data.code === 200) return setArrProSelection(res.data.data)
                return setArrProSelection(1)
            }).catch(() => setArrProSelection(1))
            axios.get(`${apiUrl.procedure}?icao=${data?.OFP.general.arrival}&type=STAR`,{'headers': createHeader()}).then(res => {
                if (res.data.code === 200) return setArrProSelection(res.data.data)
                return setArrProSelection(1)
            }).catch(() => setArrProSelection(1))

            // 初始化，绘制地图
            useMainRouteLayer(data.route)
        }

        const clearValue = () => {
            setDepInfo(undefined)
            setArrInfo(undefined)
            setDepWx(undefined)
            setArrWx(undefined)
        }

        pubsub.subscribeOnce('display-flight-over',() => {
            clearValue()
            updateInfo()
        })

        pubsub.subscribe('select-runway-dep',(_,data: Runway) => {
            setDepRwy(data)
            tempDepRwy = data
        })

        pubsub.subscribe('select-procedure-sid',(_,data2: SIDSTARS) => {
            setDepPro(data2)
            if (!tempDepRwy) return
            const depPoint = data.route.route_info[1]
            pubsub.publish('draw-sid',usetGeojson(
                getSegments(data2.segments, [
                    tempDepRwy?.location[1], tempDepRwy?.location[0]
                ], depPoint.coordinate), 
                'sid'))
        })
        pubsub.subscribe('select-runway-arr',(_,r: Runway) => {
            setArrRwy(r)
            tempArrRwy = r
            axios.get(`${apiUrl.apps}?icao=${data?.OFP.general.arrival}&runway=${r.ident}`,{'headers': createHeader()}).then(res => {
                if (res.data.code !== 200) return setAppProSelection(1)
                return setAppProSelection(res.data.data)
            }).catch(() => setAppProSelection(1))
        })

        pubsub.subscribe('select-procedure-star',(_,data1: SIDSTARS) => {
            setArrPro(data1)
            const arrPoint = data.route.route_info[data.route.route_info.length - 2]
            const segments = getSegments(data1.segments,arrPoint.coordinate,[])
            tempArrPoint = segments[segments.length -1].length ? segments[segments.length -1] : segments[segments.length -2]
            pubsub.publish('draw-star',usetGeojson(segments, 'star'))
            // pubsub.publish('draw-star',JSON.parse(data.geojson))
        })

        pubsub.subscribe('select-procedure-app',(_,data1: APPS) => {
            setAppPro(data1)
            if (!tempArrRwy) return
            const appPoint = tempArrPoint ? tempArrPoint : data.route.route_info[data.route.route_info.length - 2].coordinate
            pubsub.publish('draw-app',usetGeojson(getSegments(data1.segments, appPoint, 
                [tempArrRwy.location[1], tempArrRwy.location[0]], 'app'
            ), 'app'))
            // pubsub.publish('draw-app',JSON.parse(data.geojson))
        })

        pubsub.subscribe('ownship-data',(_,data: TrafficData | null) => {
            setOwnship(data)
        })
        pubsub.subscribe('navlink-data',(_,data: NavLink | null) => {
            setNavlink(data)
        })

    },[])

    const handleChangeRunway = (type: 'dep' | 'arr') => {
        pubsub.publish('start-runway-selection', type)
    }

    const handleChangeProcedure = (type: 'sid' | 'star') => {
        pubsub.publish('start-procedure-selection', type)
    }

    const handleChangeApp = () => {
        pubsub.publish('start-app-selection', 1)
    }

    const openAirport = (icao: string) => {
        pubsub.publish('request-detail-airport', icao)
    }

    const locateAirport = (runway: Runway) => {
        pubsub.publish('goto-zoom-runway', runway)
    }

    return (
        <>{
            data &&
            <div className="relative w-full overflow-x-hidden overflow-y-auto flight-window-height">
                <div className="relative h-[30px] text-white text-[20px] text-center">
                    {data.OFP.general.departure} - {data.OFP.general.arrival}
                </div>
                <div className="relative w-full h-[25px] flex justify-around items-center text-black select-none flight-link-status">
                    <div className="connected h-[24px] w-[120px] leading-[25px] text-center pl-[6px] pr-[6px] rounded-[12px]">航班同步</div>
                    <div className={`${ownship || navlink ? 'connected' : 'disconnected'} h-[24px] w-[120px] leading-[25px] text-center pl-[6px] pr-[6px] rounded-[12px]`}>
                        {ownship || navlink ? '已连接' : '未连接'}Ownship
                    </div>
                </div>
                <div className="relative flight-main-panel-border mt-[20px] text-white">
                    <div className="relative text-[15px] select-none font-bold">计划飞行航路</div>
                    <div className="relative mt-1 bg-[#2b4f6e] rounded p-2 text-[14px]">
                        {data.route.route}
                    </div>
                </div>
                <div className="relative flight-main-panel-border mt-[20px] text-white">
                    <div className="relative text-[15px] select-none font-bold">起飞机场信息</div>
                    <div className="relative mt-1 bg-[#2b4f6e] rounded p-2 select-none">
                        <span style={{'color': 'rgb(39,164,250)', 'fontWeight': 'bold', fontSize: '18px'}}>{data.OFP.general.departure}</span> <br />
                        {
                            depInfo ? 
                            depInfo !== 1 && (
                                <>
                                    <span style={{fontSize: '12px', 'color': '#9da9ad'}}>{depInfo.name}</span>
                                    <Deeplink onClick={() => openAirport(depInfo.icao)} theme="outline" size="28" fill="#C0C0C0"
                                    style={{position:'absolute', right:'10px', top: '10px', cursor: 'pointer'}}/>
                                </>
                            )
                            :
                            <Skeleton active paragraph={{'rows': 1}} />
                        }
                        {
                            depWx ? 
                            depWx !== 1 && (
                                <>
                                 <div className="relative weather-pill-info w-full mt-2 text-[15px] text-white flex flex-wrap justify-around items-center select-none">
                                    <Tooltip placement="top" title="修正海压">
                                        <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#31a8a8]">
                                            <Speed theme="outline" size="14" fill="#ffffff"/> {depWx.qnh}
                                        </div>
                                    </Tooltip>
                                    <Tooltip placement="top" title="风信息">
                                        <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#be36a1]">
                                            <Wind theme="outline" size="14" style={{'display': 'inline-block'}} fill="#ffffff"/> {depWx.wind}
                                        </div>
                                    </Tooltip>
                                    <Tooltip placement="bottom" title="天气信息">
                                        <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#2eca36]">
                                            <LinkCloud theme="outline" size="14" fill="#ffffff"/> {depWx.type}
                                        </div>
                                    </Tooltip>
                                    <Tooltip placement="bottom" title="温度/露点">
                                        <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#d1aa3d]">
                                            <ThermometerOne theme="outline" size="14" fill="#ffffff"/> {depWx.temp}
                                        </div>
                                    </Tooltip>
                                </div>
                                </>
                            )
                            :
                            <Skeleton active paragraph={{'rows': 1}} />
                        }
                    </div>
                    {/* 起飞机场跑道和程序选择页面 */}
                    <div className="relative text-[15px] mt-1 font-bold select-none">起飞机场程序</div>
                    <div className='relative mt-1 bg-[#2b4f6e] rounded p-2'>
                        <div className="relative text-[14px] select-none">离场跑道</div>
                        {
                            depRwySelection ? 
                            depRwySelection !== 1 &&
                            <>
                                {/* 查看是否有已经选择的跑道，如有就显示跑道信息（文字&胶囊）， 否则就显示请选择字样，右侧有下拉选择框，这里面有跑道名称和一些基础信息， 下面的程序也同理 */}
                                {
                                    <>
                                    <div className="relative w-full mt-1 h-[40px] text-white flex justify-between">
                                        <div className="relative text-[20px] font-bold select-none"
                                        style={{color: depRwy ? `white` : `rgb(252,113,63)`}}>{
                                            depRwy ? depRwy.ident : `${depRwySelection.length}条可用`
                                        }</div>
                                        <div className="action flex">
                                            <Edit theme="outline" size="28" fill="#C0C0C0" onClick={() => handleChangeRunway('dep')} style={{cursor: 'pointer'}}/>
                                            {
                                                depRwy &&
                                                <TargetTwo onClick={() => locateAirport(depRwy)} theme="outline" size="28" fill="#C0C0C0" style={{cursor: 'pointer'}}/>
                                            }
                                        </div>
                                        {
                                            //@ts-ignore
                                            <RunwaySelection runways={depRwySelection} selectionType='dep' metarInfo={depWxOriginal} />
                                        }
                                    </div>
                                    {
                                        depRwy && 
                                        <div className="relative weather-pill-info w-full text-[15px] text-white flex flex-wrap justify-around items-center select-none">
                                            <Tooltip placement="top" title="跑道磁航向">
                                                <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#db563e]">
                                                    <RadarTwo theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}} /> {depRwy.heading.toFixed()}°
                                                </div>
                                            </Tooltip>
                                            <Tooltip placement="top" title="跑道宽度">
                                                <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#3cbd3c]">
                                                    <Road theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}} /> {depRwy.width}ft
                                                </div>
                                            </Tooltip>
                                            <Tooltip placement="top" title="跑道长度">
                                                <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#da6834]">
                                                    <DividingLine theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}} /> {depRwy.length}ft
                                                </div>
                                            </Tooltip>
                                        </div>
                                    }
                                    
                                    </>
                                }
                            </>
                            :
                            <Skeleton active paragraph={{'rows': 1}} />
                        }
                        {   <>
                            {
                                depRwy &&
                                <>
                                    <div className="relative text-[14px] mt-1 select-none">离场程序<ShowBeta text='beta' content='选择和在地图上显示进离场程序在目前版本下还是beta功能，航路绘制可能会有错误，结果仅作参考，未来更新会逐渐完善' /></div>
                                {
                                    depProSelection ? 
                                        depProSelection !== 1 && 
                                        <>
                                            {
                                                <>
                                                <div className="relative w-full mt-1 h-[40px] text-white flex justify-between">
                                                    <div className="relative text-[20px] font-bold select-none"
                                                    style={{color: depPro ? `rgb(0,255,255)` : `rgb(252,113,63)`}}>{
                                                        depPro ? depPro.ident : `${depProSelection.length}个程序可用`
                                                    }</div>
                                                    <div className="action flex">
                                                        <Edit theme="outline" size="28" fill="#C0C0C0" onClick={() => handleChangeProcedure('sid')} style={{cursor: 'pointer'}}/>
                                                    </div>
                                                    {
                                                        //@ts-ignore
                                                        <ProcedureSelection procedure={depProSelection} selectionType='sid' route={data.route.route_info} runway={depRwy} />
                                                    }
                                                </div>
                                                {
                                                    depPro && 
                                                    <div className="relative weather-pill-info w-full text-[15px] text-white flex flex-wrap justify-around items-center select-none">
                                                        <Tooltip placement="bottom" title="起飞机场">
                                                            <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#3069b3]">
                                                                <LightHouse theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}} /> {depPro.airport}
                                                            </div>
                                                        </Tooltip>
                                                        <Tooltip placement="bottom" title="离场程序">
                                                            <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#36c264]">
                                                                <ShareOne theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}}/> {depPro.ident}
                                                            </div>
                                                        </Tooltip>
                                                        <Tooltip placement="bottom" title="适用跑道/离场过渡点">
                                                            <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#bb3583]">
                                                                <Road theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}} /> {depPro.transition}
                                                            </div>
                                                        </Tooltip>
                                                    </div>
                                                }
                                                
                                                </>
                                            }
                                        </>
                                    :
                                    <Skeleton active paragraph={{'rows': 1}} />
                                }
                                </>
                            }
                            </>
                        }
                    </div>

                    <div className="relative text-[15px] mt-2 select-none font-bold">落地机场信息</div>
                    <div className="relative mt-1 bg-[#2b4f6e] rounded p-2 select-none">
                        <span style={{'color': 'rgb(39,164,250)', 'fontWeight': 'bold', fontSize: '18px'}}>{data.OFP.general.arrival}</span> <br />
                        {
                            arrInfo ? 
                            arrInfo !== 1 && (
                                <>
                                    <span style={{fontSize: '12px', 'color': '#9da9ad'}}>{arrInfo.name}</span>
                                    <Deeplink onClick={() => openAirport(arrInfo.icao)} theme="outline" size="28" fill="#C0C0C0"
                                    style={{position:'absolute', right:'10px', top: '10px', cursor: 'pointer'}}/>
                                </>
                            )
                            :
                            <Skeleton active paragraph={{'rows': 1}} />
                        }
                        {
                            arrWx ? 
                            arrWx !== 1 && (
                                <>
                                 <div className="relative weather-pill-info w-full mt-2 text-[15px] text-white flex flex-wrap justify-around items-center select-none">
                                    <Tooltip placement="top" title="修正海压">
                                        <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#31a8a8]">
                                            <Speed theme="outline" size="14" fill="#ffffff"/> {arrWx.qnh}
                                        </div>
                                    </Tooltip>
                                    <Tooltip placement="top" title="风信息">
                                        <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#be36a1]">
                                            <Wind theme="outline" size="14" style={{'display': 'inline-block'}} fill="#ffffff"/> {arrWx.wind}
                                        </div>
                                    </Tooltip>
                                    <Tooltip placement="bottom" title="天气信息">
                                        <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#2eca36]">
                                            <LinkCloud theme="outline" size="14" fill="#ffffff"/> {arrWx.type}
                                        </div>
                                    </Tooltip>
                                    <Tooltip placement="bottom" title="温度/露点">
                                        <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#d1aa3d]">
                                            <ThermometerOne theme="outline" size="14" fill="#ffffff"/> {arrWx.temp}
                                        </div>
                                    </Tooltip>
                                </div>
                                </>
                            )
                            :
                            <Skeleton active paragraph={{'rows': 1}} />
                        }
                    </div>

                    {/* 降落机场跑道和程序选择页面 */}
                    <div className="relative text-[15px] mt-1 font-bold select-none">落地机场程序</div>
                    <div className='relative mt-1 bg-[#2b4f6e] rounded p-2'>
                        <div className="relative text-[14px] select-none">落地跑道</div>
                        {
                            arrRwySelection ? 
                            arrRwySelection !== 1 &&
                            // todo: 修复APP名称显示、修正顶部航路显示、在地图上绘制航路
                            <>
                                {
                                    <>
                                    <div className="relative w-full mt-1 h-[40px] text-white flex justify-between">
                                        <div className="relative text-[20px] font-bold select-none"
                                        style={{color: arrRwy ? `white` : `rgb(252,113,63)`}}>{
                                            arrRwy ? arrRwy.ident : `${arrRwySelection.length}条可用`
                                        }</div>
                                        <div className="action flex">
                                            <Edit theme="outline" size="28" fill="#C0C0C0" onClick={() => handleChangeRunway('arr')} style={{cursor: 'pointer'}}/>
                                            {
                                                arrRwy &&
                                                <TargetTwo onClick={() => locateAirport(arrRwy)} theme="outline" size="28" fill="#C0C0C0" style={{cursor: 'pointer'}}/>
                                            }
                                        </div>
                                        {
                                            //@ts-ignore
                                            <RunwaySelection runways={arrRwySelection} selectionType='arr' metarInfo={arrWxOriginal} />
                                        }
                                    </div>
                                    {
                                        arrRwy && 
                                        <div className="relative weather-pill-info w-full text-[15px] text-white flex flex-wrap justify-around items-center select-none">
                                            <Tooltip placement="top" title="跑道磁航向">
                                                <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#db563e]">
                                                    <RadarTwo theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}} /> {arrRwy.heading.toFixed()}°
                                                </div>
                                            </Tooltip>
                                            <Tooltip placement="top" title="跑道宽度">
                                                <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#3cbd3c]">
                                                    <Road theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}} /> {arrRwy.width}ft
                                                </div>
                                            </Tooltip>
                                            <Tooltip placement="top" title="跑道长度">
                                                <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#da6834]">
                                                    <DividingLine theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}} /> {arrRwy.length}ft
                                                </div>
                                            </Tooltip>
                                        </div>
                                    }
                                    
                                    </>
                                }
                            </>
                            :
                            <Skeleton active paragraph={{'rows': 1}} />
                        }
                        {arrRwy &&
                           <>
                                <div className="relative text-[14px] mt-1 select-none">进场程序<ShowBeta text='beta' content='选择和在地图上显示进离场程序在目前版本下还是beta功能，航路绘制可能会有错误，结果仅作参考，未来更新会逐渐完善' /></div>
                                {
                                    arrProSelection ? 
                                        arrProSelection !== 1 && 
                                        <>
                                            {
                                                <>
                                                <div className="relative w-full mt-1 h-[40px] text-white flex justify-between">
                                                    <div className="relative text-[20px] font-bold select-none"
                                                    style={{color: arrPro ? `rgb(255,127,80)` : `rgb(252,113,63)`}}>{
                                                        arrPro ? arrPro.ident : `${arrProSelection.length}个程序可用`
                                                    }</div>
                                                    <div className="action flex">
                                                        {/* 这里改，事件和组件都改 */}
                                                        <Edit theme="outline" size="28" fill="#C0C0C0" onClick={() => handleChangeProcedure('star')} style={{cursor: 'pointer'}}/>
                                                    </div>
                                                    {
                                                        //@ts-ignore
                                                        <ProcedureSelection procedure={arrProSelection} selectionType='star' route={data.route.route_info} runway={arrRwy} />
                                                    }
                                                </div>
                                                {
                                                    arrPro && 
                                                    <div className="relative weather-pill-info w-full text-[15px] text-white flex flex-wrap justify-around items-center select-none">
                                                        <Tooltip placement="top" title="落地机场">
                                                            <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#3069b3]">
                                                                <LightHouse theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}} /> {arrPro.airport}
                                                            </div>
                                                        </Tooltip>
                                                        <Tooltip placement="top" title="进场程序">
                                                            <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#36c264]">
                                                                <ShareOne theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}}/> {arrPro.ident}
                                                            </div>
                                                        </Tooltip>
                                                        <Tooltip placement="top" title="落地跑道/进场过渡点">
                                                            <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#bb3583]">
                                                                <Road theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}} /> {arrPro.transition}
                                                            </div>
                                                        </Tooltip>
                                                        
                                                    </div>
                                                }
                                                
                                                </>
                                            }
                                        </>
                                    :
                                    <Skeleton active paragraph={{'rows': 1}} />
                                }
                            </>
                        }
                        {   arrRwy &&
                            <>
                                <div className="relative text-[14px] mt-1 select-none">进近程序<ShowBeta text='beta' content='选择和在地图上显示进离场程序在目前版本下还是beta功能，航路绘制可能会有错误，结果仅作参考，未来更新会逐渐完善' /></div>
                                {
                                    appProSelection ? 
                                        appProSelection !== 1 && 
                                        <>
                                            {
                                                <>
                                                <div className="relative w-full mt-1 h-[40px] text-white flex justify-between">
                                                    <div className="relative text-[20px] font-bold select-none"
                                                    style={{color: appProSelection ? `rgb(	255,105,180)` : `rgb(252,113,63)`}}>{
                                                        appPro ? formatAPPs(appPro.procedure, arrRwy.ident) : `${appProSelection.length}个程序可用`
                                                    }</div>
                                                    <div className="action flex">
                                                        <Edit theme="outline" size="28" fill="#C0C0C0" onClick={handleChangeApp} style={{cursor: 'pointer'}}/>
                                                    </div>
                                                    {
                                                        //@ts-ignore
                                                        <AppSelection procedure={appProSelection} runway={arrRwy.ident} />
                                                    }
                                                </div>
                                                {
                                                    appPro && 
                                                    <div className="relative weather-pill-info w-full text-[15px] text-white flex flex-wrap justify-around items-center select-none">
                                                        <Tooltip placement="bottom" title="落地机场">
                                                            <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#3069b3]">
                                                                <LightHouse theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}} /> {appPro.airport}
                                                            </div>
                                                        </Tooltip>
                                                        <Tooltip placement="bottom" title="进近程序">
                                                            <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#36c264]">
                                                                <ShareOne theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}}/> {appPro.ident}
                                                            </div>
                                                        </Tooltip>
                                                        <Tooltip placement="bottom" title="过渡点">
                                                            <div className="relative m-1 p-[8px] pt-0 rounded-[8px] leading-[22px] h-[22px] bg-[#bb3583]">
                                                                <Road theme="outline" size="14" fill="#ffffff" style={{'display': 'inline-block'}} /> {appPro.transition}
                                                            </div>
                                                        </Tooltip>
                                                    </div>
                                                }
                                                
                                                </>
                                            }
                                        </>
                                    :
                                    <Skeleton active paragraph={{'rows': 1}} />
                                }
                            </>
                        }
                    </div>
                </div>
                <div className="relative flight-main-panel-border mt-[20px] text-white">
                    <div className="relative text-[15px] select-none font-bold">签派信息概览</div>
                    <div className="relative mt-1 bg-[#2b4f6e] rounded p-2 text-[14px]">
                        <FlightBrief ofp={data.OFP} />
                    </div>
                </div>
                {
                    (ownship || navlink) && 
                    <div className="relative flight-main-panel-border mt-[20px] text-white">
                        <div className="relative text-[15px] select-none font-bold">航班实时状态</div>
                        <div className="relative mt-1 bg-[#2b4f6e] rounded p-2 text-[14px]">
                            {
                                ownship && 
                                <OwnshipBrief d={ownship} />
                            }
                            {
                                !ownship && navlink && 
                                <NavlinkBrief d={navlink} />
                            }
                        </div>
                        <div className="relative m-4"></div>
                    </div>
                }
                <div className="relative flight-main-panel-border mt-[20px] text-white">
                    <div className="relative text-[15px] select-none font-bold">航班资讯信息
                        <ShowBeta text='Coming soon' content='可以实时展示距离目的地的距离、周围最佳备降场信息、飞行情报区信息、周边NOTAM和其他信息等' />
                    </div>
                    <div className="relative mt-1 bg-[#2b4f6e] rounded p-2 text-[14px]">
                        
                    </div>
                    <div className="relative m-4"></div>
                </div>
            <Divider />
            </div>
        }
        </>
    )
}