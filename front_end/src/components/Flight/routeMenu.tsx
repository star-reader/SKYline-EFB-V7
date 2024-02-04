import { useState , useEffect } from 'react'
import { Filter, Halo, LocalTwo, SendOne, ShareOne, TargetTwo } from '@icon-park/react'
import pubsub from 'pubsub-js'
import getRandom from '../../utils/getRandom'
import formatRoutePills from '../../utils/formatRoutePills'

export default () => {
    const [data, setData] = useState<LoadFlight | undefined>()
    const [viewLeft, setViewLeft] = useState(false)
    const [phone, setPhone] = useState(false)

    // 设置左侧按钮的effect影响
    useEffect(() => {
        pubsub.subscribe('detail-flight-load',(_, d: LoadFlight) => {
            setData(d)
        })
        pubsub.subscribe('click-flight', (_,view: number) => {
            // viewleft  0的时候不显示左侧，此时为true，即true的时候不显示左侧面板
            if (!view){
                setViewLeft(true)
            }else{
                setViewLeft(false)
            }
        })
        pubsub.subscribe('click-notam', (_,view: number) => {
            if (!view){
                setViewLeft(true)
            }else{
                setViewLeft(false)
            }
        })
        pubsub.subscribe('click-weather', (_,view: number) => {
            if (!view){
                setViewLeft(true)
            }else{
                setViewLeft(false)
            }
        })
        pubsub.subscribe('click-airport', (_,view: number) => {
            if (!view){
                setViewLeft(true)
            }else{
                setViewLeft(false)
            }
        })
        pubsub.subscribe('click-setting', (_,view: number) => {
            if (!view){
                setViewLeft(true)
            }else{
                setViewLeft(false)
            }
        })
        pubsub.subscribe('click-docs', (_,view: number) => {
            if (!view){
                setViewLeft(true)
            }else{
                setViewLeft(false)
            }
        })
    
        pubsub.subscribe('unload-flight',() => setData(undefined))
    
        pubsub.subscribe('common-close', () => setViewLeft(true))
    },[])

    useEffect(() => {
        const setWidth = () => {
            const width = document.body.scrollWidth
            width > 700 ? setPhone(false) : setPhone(true)
        }
        setWidth()
        addEventListener('resize', setWidth)
    },[])

    const handleClick = (type: 'point' | 'airway' | 'sidstar', data: any) => {
        if (type === 'sidstar') return
        if (type === 'point'){
            // const {lat, lng} = data
            pubsub.publish('click-pill-point', data)
        }
    }

    return (
        <>{
            data && 
            <div className="fixed top-[50px] width-calc-left right-0 h-[40px]
            rounded-b-md bg-[#2d4364] z-[15] phone:left-0 pb-[3px] duration-300 route-top-menu select-none"
            style={{animation: 'topDrop 0.4s', overflowY: 'hidden', overflowX: 'auto'
            , display: 'flex', flexWrap: 'nowrap', alignItems: 'center',
            left: (viewLeft && !phone) ? '50px' : 'calc(20rem + 50px)'}}>
                {
                    formatRoutePills(data.route).map(d => {
                        return (
                            <div key={getRandom(16)} className={`relative m-[3px] rounded-[10px] cursor-pointer h-[20px]
                            flex items-center
                            text-[#fff] text-[13px] text-center ${d.type}`}
                            style={{padding: '0 10px'}} onClick={() => handleClick(
                                    d.type === 'sid' || d.type === 'star' ? 'sidstar' : d.type === 'awy' ? 'airway' : 'point'
                                , d.coordinate)}>
                                {
                                    d.type === 'airport' && <SendOne theme="outline" size="14" fill="#ffffff" style={{marginRight: '3px'}} />
                                }
                                {
                                    d.type === 'sid' && <Filter theme="outline" size="14" fill="#ffffff" style={{marginRight: '3px'}} />
                                }
                                {
                                    d.type === 'star' && <Filter theme="outline" size="14" fill="#ffffff" style={{marginRight: '3px'}} />
                                }
                                {
                                    d.type === 'awy' && <ShareOne theme="outline" size="14" fill="#ffffff" style={{marginRight: '3px'}} />
                                }
                                {
                                    d.type === 'waypoint' && <LocalTwo theme="outline" size="14" fill="#ffffff" style={{marginRight: '3px'}} />
                                }
                                {
                                    d.type === 'vor' && <TargetTwo theme="outline" size="14" fill="#ffffff" style={{marginRight: '3px'}} />
                                }
                                {
                                    d.type === 'ndb' && <Halo theme="outline" size="14" fill="#ffffff" style={{marginRight: '3px'}} />
                                }
                                {d.ident}
                            </div>
                        )
                    })
                }
            </div>
        }
        </>
    )
}