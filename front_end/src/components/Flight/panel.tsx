import { useEffect, useState , memo } from "react"
import { Button , Popconfirm, message } from 'antd'
import { Result } from "antd"
import axios from 'axios'
import pubsub from 'pubsub-js'
import PhoneDrag from "../common/PhoneDrag"
import LeftFlightPanel from './leftFlightPanel'
import NewFlight from "./newFlight"
import LoadingPanel from "./loadingPanel"
import { appendFlight, getFlightList } from "../../hooks/flight/useList"
import useLoadOFP from "../../hooks/flight/useLoadOFP"
import apiUrl from "../../config/api/apiUrl"
import createHeader from "../../utils/createHeader"
import Divider from "../common/Divider"
import { getSimbriefUser } from "../../hooks/user/useSimbrief"
import getUTCString from "../../utils/getUTCString"
import getRandom from "../../utils/getRandom"
import getUserData from "../../utils/auth/getUserData"
import getAircraftICAO from "../../utils/getAircraftICAO"
import { Delete } from "@icon-park/react"
import formatSimbriefRoute from "../../utils/formatSimbriefRoute"
import formatSimbriefOFP from "../../utils/formatSimbriefOFP"
import FormatRoute from "../../utils/FormatRoute"
// import FormatRoute from "../../utils/FormatRoute"

export default memo(() => {
    const [messageApi] = message.useMessage()
    const WINDOW = 'flight-panel'
    const [isShow, setIsShow] = useState(false)
    const [isHide, setIsHide] = useState(false)
    const [isMax, setIsMax] = useState(false)
    const [phone, setPhone] = useState(false)
    const [list, setList] = useState<FieldType[]>([])
    const [detail, setDetail] = useState(false)
    const [fail, setFail] = useState(false)
    const [data, setData] = useState<LoadFlight>()
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        const fetchList = async () => {
            setList(await getFlightList())
        }
        fetchList()

        const getTempFlight = () => {
            axios.get(apiUrl.getTempFlight, {'headers': createHeader()}).then(res => {
                if (res.data.code === 200 && res.data.data){
                    //显示数据
                    setIsShow(true)
                    pubsub.publish('load-temp-flight', res.data.data)
                }
            })
        }
        getTempFlight()
    },[])

    useEffect(() => {
        pubsub.subscribe('click-flight', (_,data: number) => {
            if (!data){
                //setIsShow(false)
                setIsHide(true)
            }else{
                setIsShow(true)
                setIsHide(false)
                pubsub.publish('open-window', WINDOW)
            }
        })
        pubsub.subscribe('flight-panel-drag-up',() => {
            setIsMax(true)
        })
    
        pubsub.subscribe('flight-panel-drag-down',() => {
            setIsMax(false)
        })
        pubsub.subscribe('open-window',(_,data: string) => {
            if (data === WINDOW) return
            const width = document.body.scrollWidth
            if (width <= 700){
                //setIsShow(false)
                setIsHide(true)
            }
        })
        pubsub.subscribe('open-common-window',(_,data: string) => {
            if (data === WINDOW) return
            setIsHide(true)
        })
        //追加航班记录的触发事件
        pubsub.subscribe('append-flight-list', (_, data: FieldType) => {
            data.departure = data.departure.toUpperCase()
            data.arrival = data.arrival.toUpperCase()
            data.callsign = data.callsign.toUpperCase()
            appendFlight(data)
        })

        //LoadFlight为要显示的数据和类型。收到后即可显示航班详细页面
        pubsub.subscribe('detail-flight-load',(_, data: LoadFlight) => {
            setDetail(true)
            setData(data)
            setTimeout(() => {
                pubsub.publish('display-flight-over')
            }, 400);
        })

        pubsub.subscribe('load-flight-failed',() => {
            setDetail(true)
            setFail(true)
        })
    },[])

    const handleClose = async () => {
        if (detail){
            setDetail(false)
            setList(await getFlightList())
        }else{
            setIsShow(false)
            //! 刚才删除的
            pubsub.publish('common-close',1)
        }
    }

    const handleUnload = () => {
        setDetail(false)
        pubsub.publish('unload-flight', 1)
        axios.post(apiUrl.deleteTempFlight,{}, {'headers': createHeader()})
    }

    const haneldClick = (item: 'new' | 'simbrief' | 'server') => {
        // id如果是32就是系统创建的，39就是simbrief的
        switch (item) {
            case 'new':
                pubsub.publish('create-new-flight-panel', 1)
                break;
            case 'simbrief':
                const user = getSimbriefUser()
                if (!user){
                    return message.error('尚未绑定Simbrief账号！')
                }
                axios.get(`${apiUrl.simbrief}?username=${user}&json=1`).then(res => {
                    const d = res.data
                    //#region 
                    // const field: FieldType = {
                    //     'aircraft': d.aircraft.icaocode,
                    //     'altitude': d.general.initial_altitude,
                    //     'arrival': d.destination.icao_code,
                    //     'callsign': d.general.icao_airline + d.general.flight_number,
                    //     'costIndex': d.general.costindex,
                    //     'date': getUTCString(),
                    //     'departure': d.origin.icao_code,
                    //     'id': getRandom(39),
                    //     'selfRoute': d.general.route
                    // }
                    // const route = d.general.route
                    // // 这里信息不全，如果后期需要拓展ofp的话需要额外补充
                    // const ofp: OFP = {
                    //     'airport': {
                    //         'dep': [d.origin.pos_long, d.origin.pos_lat],
                    //         'arr': [d.destination.pos_long, d.destination.pos_lat]
                    //     },
                    //     'alternate': {
                    //         'fuel': 'null',
                    //         'via': 'null'
                    //     },
                    //     'dispatcher': {
                    //         'cid': 'SKYline',
                    //         'tel': "+1126354762"
                    //     },
                    //     'general': {
                    //         'air_dist' : d.general.air_distance,
                    //         'aircraft': d.aircraft.icaocode,
                    //         'aircraft_reg': d.aircraft.reg,
                    //         'arrival': d.destination.icao_code,
                    //         'ci': d.general.costindex,
                    //         'date': getUTCString(),
                    //         'departure': d.origin.icao_code,
                    //         'flightNumber': d.general.icao_airline + d.general.flight_number,
                    //         'ground_dist': d.general.gc_distance,
                    //         'utcTime': getUTCString()
                    //     },
                    //     'plannedFuel': {
                    //         'ALTN': d.fuel.alternate_burn,
                    //         'block_fuel': d.fuel.plan_ramp,
                    //         'cost_15_min': 0,
                    //         'extra': d.fuel.extra,
                    //         'finnal_rev': d.fuel.reserve,
                    //         'minimum_take_off': d.weights.max_tow,
                    //         'trip': d.fuel.enroute_burn
                    //     },
                    //     'route': route,
                    //     'weight': {
                    //         'ZFW': d.weights.est_zfw,
                    //         'cargo': d.weights.cargo,
                    //         'fuel': d.fuel.plan_ramp,
                    //         'landing_max_weight': d.weights.max_ldw,
                    //         'passenger_number': d.weights.pax_count_actual,
                    //         'payload': d.weights.payload,
                    //         'take_off_weight': d.weights.est_tow
                    //     }
                    // }
                    // const r: any[] = d.navlog.fix
                    // let node: OriginalRouteItem[] = []
                    // for (let i of r){
                    //     if (i.type === 'wpt'){
                    //         node.push({
                    //             'ident': i.ident,
                    //             'coordinate': [i.pos_long, i.pos_lat],
                    //             'type': 'waypoint'
                    //         })
                    //     }else if (i.type === 'vor'){
                    //         node.push({
                    //             'ident': i.ident,
                    //             'coordinate': [i.pos_long, i.pos_lat],
                    //             'type': 'vor'
                    //         })
                    //     }else if (i.type === 'ndb'){
                    //         node.push({
                    //             'ident': i.ident,
                    //             'coordinate': [i.pos_long, i.pos_lat],
                    //             'type': 'ndb'
                    //         })
                    //     }else if (i.type === 'ltlg'){
                    //         continue
                    //     }else{
                    //         node.push({
                    //             'ident': i.ident,
                    //             'coordinate': [i.pos_long, i.pos_lat],
                    //             'type': 'waypoint'
                    //         })
                    //     }
                    // }
                    // pubsub.publish('append-flight-list', field)
                    // axios.post(apiUrl.uploadTempFlight, {'flight': field}, {'headers': createHeader()})
                    // return pubsub.publish('detail-flight-load',{
                    //     'OFP': ofp,
                    //     route : {
                    //         route,
                    //         route_info: node,
                    //         distance: d.general.air_distance
                    //     }
                    // })
                    //#endregion
                    const field: FieldType = {
                        'aircraft': d.aircraft.icaocode,
                        'altitude': d.general.initial_altitude,
                        'arrival': d.destination.icao_code,
                        'callsign': d.general.icao_airline + d.general.flight_number,
                        'costIndex': d.general.costindex,
                        'date': getUTCString(),
                        'departure': d.origin.icao_code,
                        'id': getRandom(39),
                        'selfRoute': formatSimbriefRoute(d.general.route),
                        'simbrief': formatSimbriefOFP(d)
                    }
                    pubsub.publish('start-loading-flight', 1)
                    axios.post(apiUrl.uploadTempFlight,{'flight': field},{'headers': createHeader()}).then(r => {
                        if (r.data.code !== 200){
                            message.error('航班数据云同步失败')
                        }
                    }).catch(() => {
                        message.error('航班数据云同步失败')
                    })
                    try {
                        useLoadOFP(field, d)
                    } catch (error) {
                        pubsub.publish('load-flight-failed',0)
                    }
                }).catch(() => message.error('获取simbrief数据失败！'))
                break
            case 'server':
                const username = getUserData()?.Username
                if (!username) return messageApi.error('获取数据失败！')
                axios.get(`${apiUrl.ownship}?from=efb-loader`).then(res => {
                    for (let d of res.data.pilotList){
                        if (d.cid === username){
                            const field: FieldType = {
                                'aircraft': getAircraftICAO(d.aircraft),
                                'arrival': d.arrival,
                                'callsign': d.callsign,
                                'departure': d.departure,
                                'id': getRandom(32),
                                'date': getUTCString(),
                                // !等有人联飞就修复这个selfRoute
                                'selfRoute': FormatRoute(d.route)
                            }
                            pubsub.publish('start-loading-flight', 1)
                            axios.post(apiUrl.uploadTempFlight,{'flight': field},{'headers': createHeader()}).then(r => {
                                if (r.data.code !== 200){
                                    message.error('航班数据云同步失败')
                                }
                            }).catch(() => {
                                messageApi.open({
                                    type: 'error',
                                    content: '航班数据云同步失败',
                                })
                            })
                            try {
                                useLoadOFP(field)
                            } catch (error) {
                                pubsub.publish('load-flight-failed',0)
                            }
                        }
                    }
                })
                break
            default:
                break;
        }
    }

    const haneldOpenAirport = (d: FieldType) => {
        pubsub.publish('start-loading-flight', 1)
        axios.post(apiUrl.uploadTempFlight,{'flight': d},{'headers': createHeader()}).then(r => {
            if (r.data.code !== 200){
                message.error('航班数据云同步失败')
            }
        }).catch(() => {
            message.error('航班数据云同步失败')
        })
        useLoadOFP(d)
    }

    const handleDeleteFlight = (d: FieldType, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation()
        e.preventDefault()
        axios.post(apiUrl.deleteFlights,{'flight': d},{'headers': createHeader()}).then(async res => {
            if (res.data.code === 200){
                const l = (await axios.get(apiUrl.getFlights, {'headers': createHeader()})).data.data
                setList(l)
                return message.success('航班删除成功')
            }
            return message.error('航班删除失败')
        }).catch(() => message.error('航班删除失败'))
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
        <>
        <NewFlight />
        {
            // @ts-ignore
            <LoadingPanel />
        }
        {
            isShow &&
            <div className={`common-panel z-[22] absolute left-[50px] w-80 top-[50px] 
            bottom-0 rounded-r-md bg-[#2f4565] ani-show-common-panel phone:w-full phone:left-0 duration-300 ${editMode ? 'edit-mode' : 'placeholder-overview'}`}
                style={{
                    'top': phone ? isMax ? '50px' : '' : '',
                    'height': phone ? isMax ? 'calc(100% - 100px)' : '' : '',
                    'display': isHide ? 'none' : 'block'
                  }}>
                <PhoneDrag id={WINDOW} />
                  <div className="relative text-[19px] text-white text-center w-full 
                  select-none phone:mt-[-30px] mb-[12px]">
                    {detail ? data?.OFP.general.flightNumber : '签派航班列表'}
                  </div>
                  {
                    (detail && !fail) ? 
                    <Popconfirm
                        placement="bottomRight"
                        title='是否取消加载航班？'
                        okText="是"
                        cancelText="否"
                        onConfirm={handleUnload}
                    >
                        <div className="absolute top-[4px] right-[10px] mt-[4px] 
                            text-[14px] bg-[#e26e4b] rounded text-white select-none
                             text-center hover:bg-[#bd5d40] leading-[20px] 
                            cursor-pointer duration-200 phone:mt-[5px] pt-[2px] pb-[2px] pl-[6px] pr-[6px]">取消加载
                        </div>
                    </Popconfirm>
                    :
                        <>
                            <div onClick={handleClose} className="absolute top-[4px] right-[10px] mt-[4px]  h-[20px]
                                text-[13px] bg-orange-500 rounded text-white select-none
                                text-center hover:bg-orange-600 leading-[20px] align-middle
                                cursor-pointer phone:mt-[8px] pl-[6px] pr-[6px]">&lt;&nbsp;返回
                            </div>
                            <div onClick={() => setEditMode(!editMode)} className={`absolute top-[4px] left-[15px] mt-[4px] h-[20px]
                                text-[13px] rounded text-white select-none
                                text-center leading-[20px] align-middle
                                cursor-pointer phone:mt-[5px] pb-[2px] pl-[6px] pr-[6px] ${editMode ? 'edit-mode-exit' : 'edit-mode-enable'}`}>{editMode ? '退出编辑' : '编辑航班'}
                            </div>
                        </>
                  }
                  
                    {
                        detail ?
                        fail ?
                        <Result
                            status="warning"
                            title="加载失败，请重试"
                        /> :
                        data && 
                        // 加载成功的具体航班数据页面
                        <div className="detail-flight loading-success" style={{position: 'relative', left: '0', width :'100%', height:'100%', zIndex: '16'}}>
                            <LeftFlightPanel data={data} />
                        </div>
                        :
                        <>
                        {/* // 操作按钮和列表页面 */}
                        <div className="relative flex justify-around w-full h-[35px] mt-2 mb-2 flight-action">
                            <div><Button type="primary" 
                            onClick={() => haneldClick('new')}>新建计划</Button></div>
                            <div><Button type="primary"
                            onClick={() => haneldClick('server')}>从联飞服务器导入</Button></div>
                            <div><Button type="primary"
                            onClick={() => haneldClick('simbrief')}>从Simbrief导入</Button></div>
                        </div>
                        <div className="relative common-window-height w-full overflow-x-hidden overflow-y-auto">
                        {
                            list.length ? 
                                list.map(d => {
                                    return (
                                        <div key={d.id} className="editable-element relative flex justify-between items-center left-0 w-full 
                                            mt-1 duration-200 cursor-pointer select-none hover:bg-[#3a5170]"
                                            onClick={() => haneldOpenAirport(d)}>
                                            <div className="ml-[20px]">
                                                <div className="relative mt-3 text-white font-bold text-[18px]">{d.callsign}</div>
                                                <div className="relative text-white text-[15px]">{d.departure} - {d.arrival}</div>
                                                <div className="relative mt-0 text-gray-400 text-[14px]">{d.aircraft}  {d.date}</div>
                                            </div>
                                            <div className="relative w-[60px]">
                                            </div>
                                            <div onClick={e => handleDeleteFlight(d, e)} className="absolute w-[40px] right-0 h-full rounded bg-[#49678d] remove-button hidden justify-center items-center">
                                                <Delete theme="outline" size="25" fill="#ffffff" style={{'opacity': '0.6'}}/>
                                            </div>
                                        </div>
                                    )
                            }) :
                            (
                                <Result
                                status="warning"
                                title="暂无航班签派记录"
                                />
                            )
                          }
                          <Divider />
                          </div>
                        </>
                    }
            </div>
        }
        </>
    )
})