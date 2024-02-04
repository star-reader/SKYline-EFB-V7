import { useState , useEffect } from 'react'
import pubsub from 'pubsub-js'
import axios from 'axios'
import apiUrl from '../../config/api/apiUrl'
import getRandom from '../../utils/getRandom'
import createHeader from '../../utils/createHeader'

export default () => {
    const [data, setData] = useState<Array<JeppesenChartList | AIPChartList> | undefined>()
    const [viewLeft, setViewLeft] = useState(true)
    const [phone, setPhone] = useState(false)
    let oriData: any[] = []

    useEffect(() => {
        const selfFilter = (d: JeppesenChartList | AIPChartList) => {
            // @ts-ignore  有chart_name说明是jeppesen航图
            if (d.chart_name){
                //筛选时，如果i也是jeppesen则比较chart_id；否则一直返回true
                //@ts-ignore
                return oriData?.filter(i => i.chart_name ? i.chart_hash_token !== d.chart_hash_token : true)
            }else{
                //是aip航图，如果i是aip航图则比较token，否则一直返回true
                //@ts-ignore
                return oriData?.filter(i => i.token ? i.token !== d.token : true)
            }
        }
        pubsub.subscribe('add-pinboard',(_, d: JeppesenChartList | AIPChartList) => {
            setData([...oriData, d])
            oriData.push(d)
            axios.post(apiUrl.uploadPinboard, {'pinboard': oriData},{'headers': createHeader()}).catch(() => {})
        })
        pubsub.subscribe('click-flight', (_,view: number) => {
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
    
        pubsub.subscribe('request-delete-chart',(_,d: JeppesenChartList | AIPChartList) => {
            // @ts-ignore
            const chart = selfFilter(d)
            if (!chart) return
            setData([...chart])
            oriData = [...chart]
            axios.post(apiUrl.uploadPinboard, {'pinboard': chart},{'headers': createHeader()}).catch(() => {})
        })
    
        //pubsub.subscribe('unload-flight',() => setData(undefined))
        pubsub.subscribe('common-close', () => setViewLeft(true))
    },[])

    useEffect(() => {
        const setWidth = () => {
            const width = document.body.scrollWidth
            width > 700 ? setPhone(false) : setPhone(true)
        }

        const getPinboard = () => {
            axios.get(apiUrl.getPinboard,{'headers': createHeader()}).then(res => {
                if (res.data.code !== 200) return
                setData(res.data.data)
                oriData = res.data.data
            })
        }
        setWidth()
        getPinboard()
        addEventListener('resize', setWidth)
    },[])

    const getAirportName = (d: JeppesenChartList | AIPChartList) => {
        if (d.hasOwnProperty('airport_icao')){
            // @ts-ignore
            return d.airport_icao
        }else{
            // @ts-ignore
            return d.display_name.split('-')[0]
        }
    }

    const isSameAirport = (index: number) => {
        // 第一个肯定要显示
        if (!index) return false
        if (!data) return true
        return getAirportName(data[index -1]) === getAirportName(data[index])
    }

    const handleDeleteChart = (d: JeppesenChartList | AIPChartList, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation()
        e.preventDefault()
        pubsub.publish('request-delete-chart', d)
        if (data && data?.length <= 1){
            pubsub.publish('clear-pinboard',1)
        }
    }

    const getChartColor = (d: JeppesenChartList | AIPChartList) => {
        if (!d) return 'rgb(30,144,255)'
        if (d.hasOwnProperty('display_name')){
            return 'rgb(255,215,0)'
        }else{
            const data: JeppesenChartList = d as JeppesenChartList
            switch (data.chart_type) {
                case 'APT':
                    return 'rgb(255,165,0)'
                case 'DEP':
                    return 'rgb(64,224,208)'
                case 'ARR':
                    return 'rgb(255,105,180)'
                case 'APP':
                    return 'rgb(50,205,50)'
                case 'OTHER':
                    return 'rgb(250,128,114)'
                default:
                    return 'rgb(100,149,237)'
            }
        }
    }

    const haneleClickChart = (data: JeppesenChartList | AIPChartList) => {
        pubsub.publish('start-loading-chart-url', 1)
        const url = data.hasOwnProperty('airport_icao') ? apiUrl.jeppesenUrl : apiUrl.aipUrl
        axios.post(url,data, {'headers': createHeader()}).then(res => {
            if (res.data.code === 200){
                pubsub.publish('chart-url-loaded', {
                    origin: data,
                    url: res.data.data.url
                })
            }
        }).catch(() => {
            
        })
    }

    return (
        <>{
            data && data.length && 
            <div className="fixed bottom-0 width-calc-left right-0 h-[53px] flex duration-300 cursor-pointer
            rounded-t-md bg-[#2d4364] z-[22] phone:left-0 phone:bottom-[50px] pb-[3px] pinboard-wrapper select-none"
            style={{animation: 'topDrop 0.4s', overflowY: 'hidden', overflowX: 'auto'
            ,left: (viewLeft && !phone) ? '50px' : 'calc(20rem + 50px)'}}>
                {
                    data.map((d, index) => {
                        return (
                            <div key={getRandom(18)} onClick={() => haneleClickChart(d)} className='relative left-0 top-0 h-full flex items-center'>
                                <div className="relative w-[35px] h-full rounded" style={{'border': '2px solid rgb(6,182,212)',
                                'display': isSameAirport(index) ? 'none' : 'block'}}>
                                    <span className='text-white text-center align-middle' 
                                    style={{display: 'inline-block','transform': 'rotate(-90deg)', 'transformOrigin': '54% 78%'}}>{
                                        getAirportName(d)
                                    }</span>
                                </div>
                                <div className="relative pinboard-item w-[180px] p-1 h-full rounded duration-300
                                bg-[#2d4f75] hover:bg-[#325781] text-[12px] text-white flex justify-between items-center"
                                style={{margin: '0px 2px', borderTop: `5px solid ${getChartColor(d)}`}}>
                                    <div className="relative left-0 max-w-[140px] pt-[2px]">{
                                        // @ts-ignore
                                        d.chart_name ? d.chart_name : d.display_name
                                    }</div>
                                    <div onClick={(e) => handleDeleteChart(d, e)} className="relative w-[30px] h-[30px] rounded-[50%] hidden action-item text-[15px]
                                    bg-[#3c6697] text-red-500 text-center">
                                        <span className='relative top-[4px]'>X</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        }
        </>
    )
}