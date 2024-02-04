import { useState , useEffect } from 'react'
import { Switch } from 'antd'
import pubsub from 'pubsub-js'
import isShowOwnshipData from '../../hooks/ownship/useStatus'
import LocationFormat from '../../utils/LocationFormat'

export default () => {

    const [isShow, setIsShow] = useState(false)
    const [connected, setConnected] = useState(isShowOwnshipData('ownship'))
    const [data, setData] = useState<TrafficData>()
    const [navlink, setNavlink] = useState<NavLink>()
    const [time, setTime] = useState<string>('')
    let show = false

    useEffect(() => {
        pubsub.subscribe('ownship-data',(_,data: TrafficData | null) => {
            if (!data) return setConnected(false)
            setConnected(true)
            setData(data)
            setTime(new Date().toString())
        })
        pubsub.subscribe('navlink-data',(_,data: NavLink | null) => {
            if (!data) return setConnected(false)
            setConnected(true)
            setNavlink(data)
            setTime(new Date().toString())
        })
        pubsub.subscribe('click-ownship-panel',() => {
            setIsShow(!show)
            show = !show
        })
    }, [])


    const handleChnageTraffic = (isShow: boolean) => {
        localStorage.setItem('traffic', isShow ? 'true' : 'false')
    }

    const handleChangeOwnship = (isShow: boolean) => {
        localStorage.setItem('ownship', isShow ? 'true' : 'false')
    }

    const handleChangeTrack = (isShow: boolean) => {
        localStorage.setItem('tracker', isShow ? 'true' : 'false')
    }

    return (
            <div className="fixed left-[150px] top-[50px] w-[280px] rounded-lg bg-[rgb(38,70,97)] select-none z-[40] ownship-panel
            duration-300 h-[385px] overflow-x-hidden overflow-y-auto phone:left-0 phone:w-full phone:h-[200px]"
            style={{display: isShow ? 'block' : 'none', height: connected && data ? '385px' : connected && navlink ? '355px' : '180px'}}>
                <div className="relative w-full mt-2 text-white  text-center text-[17px] font-bold">Ownship信息
                    {/* <ShowBeta text="note" content="在未来的更新中，Ownship功能将被更高级的Navlink取代" /> */}
                </div>
                <div className="relative m-2 text-[15px] flex justify-around items-center">
                    <div className="relative text-gray-300">连接状态</div>
                    <div className="relative" style={{color: connected ? 'rgb(17,200,109)' : 'orangered'}}>{connected ? '已' : '未'}连接</div>
                </div>
                <div className="relative m-2 text-[15px] flex justify-around items-center">
                    <div className="relative text-gray-300">开启Ownship</div>
                    <div className="relative">
                        <Switch onChange={handleChangeOwnship} checkedChildren="开启" unCheckedChildren="关闭" 
                        defaultChecked={isShowOwnshipData('ownship')} />
                    </div>
                </div>
                <div className="relative m-2 text-[15px] flex justify-around items-center">
                    <div className="relative text-gray-300">显示服务器交通</div>
                    <div className="relative">
                        <Switch onChange={handleChnageTraffic} checkedChildren="开启" unCheckedChildren="关闭" 
                        defaultChecked={isShowOwnshipData('traffic')} />
                    </div>
                </div>
                <div className="relative m-2 text-[15px] flex justify-around items-center">
                    <div className="relative text-gray-300">自动跟踪航班</div>
                    <div className="relative">
                        <Switch onChange={handleChangeTrack} checkedChildren="开启" unCheckedChildren="关闭" 
                        defaultChecked={isShowOwnshipData('tracker', 'false')} />
                    </div>
                </div>
                {
                    connected && data && time &&
                    <>
                        <div className="relative m-2 text-[15px] flex justify-around items-center">
                            <div className="relative text-gray-300">数据同步方式/数据流</div>
                            <div className="relative text-white">GPS / TCP</div>
                        </div>
                        <div className="relative m-2 text-[15px] flex justify-around items-center">
                            <div className="relative text-gray-300">机型</div>
                            <div className="relative text-white">{data.aircraft}</div>
                        </div>
                        <div className="relative m-2 text-[15px] flex justify-around items-center">
                            <div className="relative text-gray-300">同步位置</div>
                            <div className="relative text-white">{data.lnglat && data.lnglat[1] ? LocationFormat(data.lnglat[1], data.lnglat[0]) : ''}</div>
                        </div>
                        <div className="relative m-2 text-[15px] flex justify-around items-center">
                            <div className="relative text-gray-300">高度</div>
                            <div className="relative text-white">{data.altitude} ft</div>
                        </div>
                        <div className="relative m-2 text-[15px] flex justify-around items-center">
                            <div className="relative text-gray-300">应答机</div>
                            <div className="relative text-white">{data.squawk}</div>
                        </div>
                        <div className="relative m-2 text-[15px] flex justify-around items-center">
                            <div className="relative text-gray-300">地速</div>
                            <div className="relative text-white">{data.speed} knot</div>
                        </div>
                        <div className="relative m-2 text-[15px] flex justify-around items-center">
                            <div className="relative text-gray-300">同步时间</div>
                            <div className="relative text-white">{time.split(' GMT')[0]}</div>
                        </div>
                    </>
                }
                {
                    connected && !data && navlink &&
                    <>
                        <div className="relative m-2 text-[15px] flex justify-around items-center">
                            <div className="relative text-gray-300">数据同步方式/数据流</div>
                            <div className="relative text-white">GPS / TCP</div>
                        </div>
                        <div className="relative m-2 text-[15px] flex justify-around items-center">
                            <div className="relative text-gray-300">同步位置</div>
                            <div className="relative text-white">{navlink.latitude && navlink.longitude ? LocationFormat(
                                navlink.latitude, navlink.longitude
                            ) : ''}</div>
                        </div>
                        <div className="relative m-2 text-[15px] flex justify-around items-center">
                            <div className="relative text-gray-300">高度</div>
                            <div className="relative text-white">{navlink.altitude} ft</div>
                        </div>
                        <div className="relative m-2 text-[15px] flex justify-around items-center">
                            <div className="relative text-gray-300">应答机</div>
                            <div className="relative text-white">{navlink.transponder}</div>
                        </div>
                        <div className="relative m-2 text-[15px] flex justify-around items-center">
                            <div className="relative text-gray-300">地速</div>
                            <div className="relative text-white">{navlink.groundspeed} knot</div>
                        </div>
                        <div className="relative m-2 text-[15px] flex justify-around items-center">
                            <div className="relative text-gray-300">同步时间</div>
                            <div className="relative text-white">{time.split(' GMT')[0]}</div>
                        </div>
                    </>
                }
            </div>
    )
}   