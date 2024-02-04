import mapboxgl from 'mapbox-gl'
import { useEffect, memo } from 'react'
import { useState } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import { Spin } from 'antd'
import pubsub from 'pubsub-js'
import token from "../../config/map/token"
import ActionArea from './actionArea'
import useClearLayer from '../../hooks/map/useClearLayer'
//import { getMapTheme } from '../../hooks/map/useMapStyle'

interface TempCharts {
    data: JeppesenChartList | AIPChartList,
    base64: string,
    bound: mapboxgl.LngLatBoundsLike,
    img: number[]
}

export default memo(() => {
    // const [url, setUrl] = useState('')
    const [isShow, setIsShow] = useState(false)
    const [isBannerOpen, setIsBannerOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    let map: mapboxgl.Map
    let _bound = [[0,0],[2,-2]] as mapboxgl.LngLatBoundsLike
    let d: JeppesenChartList | AIPChartList
    let tempCharts: TempCharts[] = []

    useEffect(() => {
        const initMap = () => {
            if (map) return
            mapboxgl.accessToken = token
            map = new mapboxgl.Map({
                container: 'chart-viewer',
                center: [0,0],
                zoom: 10,
                dragRotate: false,
                touchPitch: false,
                style: {
                    'name':'viewer-bg',
                    'version': 8,
                    'sources':{
                        "dem": {
                            "type": "raster-dem",
                            "tiles": [
                                "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
                            ],
                            "minzoom": 0,
                            "maxzoom": 11,
                            "tileSize": 256,
                            "encoding": "terrarium"
                        }
                    },
                    'layers':[
                            {
                            'id':'viewer-background',
                            'type': 'background',
                            'paint':{
                                //'background-color': getMapTheme() === 'night' ? 'rgb(220,220,220)' : 'rgb(255,255,255)'
                                'background-color': 'rgb(255,255,255)'
                            }
                        }
                    ]
                }
            })
            map.setMaxPitch(0)
        }
        
        const addImage = (url: string) => {
            if (!map) return initMap()
            // @ts-ignore
            const temp: any[] = tempCharts.filter(i => i.data.token ? i.data.token === d.token : i.data.chart_hash_token === d.chart_hash_token)
            if (temp && temp.length){
                const d = temp[0]
                setIsLoading(false)
                return addChartToMap(d.base64, d.bound, d.img)
            }
            let img = new Image()
            img.crossOrigin = "anonymous"
            let width = 0
            let height = 0
            img.onload = () => {
                useClearLayer('charts-main-png', map)
                setIsLoading(false)
                width = img.width
                height = img.height
                const bound = [
                    [0,0],
                    [width/1000, -(height / 1000)]
                ] as mapboxgl.LngLatBoundsLike
                _bound = bound
                map.setMaxZoom(20)
                map.setMinZoom(0)
                //base64
                let canvas = document.createElement("canvas")
                canvas.width = img.naturalWidth
                canvas.height = img.naturalHeight
                //@ts-ignore
                canvas.getContext("2d").drawImage(img, 0, 0)
                let base64 = canvas.toDataURL("image/jpeg", 1.0)
                //临时保存航图
                tempCharts.push({
                    data: d,
                    base64,
                    bound,
                    img: [width, height]
                })
                //添加航图
                addChartToMap(base64, bound, [width, height])
            }
            img.src = url
        }

        const addChartToMap = (base64: string, bound: mapboxgl.LngLatBoundsLike, img: number[]) => {
            const [width, height] = img
            map.addSource('charts-main-png',{
                'type': 'image',
                'url': base64,
                'coordinates': [
                    [0,0],
                    [width / 1000,0],
                    [width/1000, -(height / 1000)],
                    [0,-(height / 1000)]
                ]
            })
            map.addLayer({
                'id': 'charts-main-png',
                'type': 'raster',
                'source': 'charts-main-png',
                'paint': {
                    'raster-opacity': 1,
                    'raster-fade-duration': 0
                }
        
            })
            map.fitBounds(bound,{
                'animate': false
            })
            map.setMaxZoom(map.getZoom() + 2.5)
            map.setMinZoom(map.getZoom() - 0.75)
            //map.setMaxBounds(bound)
        }   

        initMap()
        
        pubsub.subscribe('chart-url-loaded', (_,data: any) => {
            map.resize()
            d = data.origin
            setIsLoading(true)
            return addImage(data.url)
        })
        pubsub.subscribe('start-loading-chart-url',() => {
            setIsShow(true)
            map.resize()
            if (map.getLayer('charts-main-png')){
                map.removeLayer('charts-main-png')
                map.removeSource('charts-main-png')
            }
        })

    },[])

    useEffect(() => {
        pubsub.subscribe('chart-action',(_,data: string) => {
            switch (data) {
                case 'close':
                    setIsShow(false)
                    break
                case 'left':
                    map.setBearing(map.getBearing() + 90)
                    break
                case 'right':
                    map.setBearing(map.getBearing() - 90)
                    break
                case 'center':
                    map.fitBounds(_bound,{
                        'animate': false
                    })
                    break
                case 'pin':
                    if (!d) return
                    pubsub.publish('add-pinboard', d)
                    break
                default:
                    break;
            }
        })
        pubsub.subscribe('click-airport',(_,data: number) => {
            setIsBannerOpen(data ? true: false)
            setTimeout(() => {
                return map && map.resize()
            }, 100);
        })
    }, [])

    return (
        <>
            <div aria-braillelabel={isBannerOpen ? 'open' : 'closed'} style={{
                'display': isShow ? 'block' : 'none'
                }} className="fixed viewer-left-calc-1 top-[50px] right-0 bottom-0 z-[21] bg-[#2c3646]
                phone:bottom-[50px] select-none">
                    {
                        isLoading &&
                        <div className="absolute w-full h-full flex justify-center items-center z-[299]">
                            <Spin tip="航图加载中" indicator={<LoadingOutlined style={{ fontSize: 50, fontWeight: 'bold', textAlign: 'center', zIndex: 300 }} spin />} />
                        </div>
                    }
                <div className="relative left-0 top-0 w-full h-full" id="chart-viewer"></div>
            <ActionArea />
            </div>
        </>
    )
})