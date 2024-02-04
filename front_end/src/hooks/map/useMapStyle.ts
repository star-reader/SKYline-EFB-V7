import useFixLng from "./useFixLng"
import apiUrl from "../../config/api/apiUrl"
import mapboxgl, { type Map } from "mapbox-gl"
// mport { createDir, BaseDirectory } from '@tauri-apps/api/fs
import axios from 'axios'
import pubsub from 'pubsub-js'
import createHeader from '../..//utils/createHeader'

//图片资源
import terminalImg from '../../assets/terminal.png'
import trafficImg from '../../assets/traffic.png'
import wpt from '../../assets/navdata/waypoint/wpt.png'
import wpt_pt1 from '../../assets/navdata/waypoint/wpt-pt1.png'
import vor from '../../assets/navdata/vor/vor.png'
import vor_com from '../../assets/navdata/vor/vor-com.png'
import ndb from '../../assets/navdata/ndb/ndb-wpt.png'
import apt from '../../assets/navdata/airport/apt.png'
import awy from '../../assets/navdata/airway/basic-sdf.png'
import awy2 from '../../assets/navdata/airway/basic-short-sdf.png'
import { getStyle } from "./useEnrouteMap"
import useAirac from "../useAirac"
//import useGetShpFile from "../tauri/useGetShpFile"
import { dataDecrypt } from "../../utils/crypto"
import useGetShpDB from "../indexedDB/useGetShpDB"
import useClearLayer from "./useClearLayer"

// @ts-ignore
const isTauri = window.__TAURI__ ? true : false

const imgSet = [{ name: 'wpt.terminal', img: wpt }, { name: 'wpt', img: wpt_pt1 },
{ name: 'vor', img: vor }, { name: 'vor.com', img: vor_com }, { name: 'ndb', img: ndb },
{ name: 'apt', img: apt }, { name: 'terminal', img: terminalImg },{ name: 'awy', img: awy },
{name: 'awy.short', img: awy2},{name: 'traffic', img: trafficImg}]

const initMapStyle = (map: Map) => {
    if (!map) {
        return
    }
    let layers = map.getStyle().layers
    map.setPaintProperty('land', 'background-color', '#F5F5F5')  //ifrh，ifrl
    //map.setPaintProperty('land', 'background-color', 'rgb(198, 234, 182)')  //vor
    //map.setPaintProperty('water', 'fill-color', 'rgb(158,206,250)')
    //map.setPaintProperty('water-depth', 'fill-color', 'rgb(158,206,250)')
    map.setPaintProperty('water', 'fill-color', 'rgb(111,203,255)')
    map.setPaintProperty('water-depth', 'fill-color', 'rgb(111,203,255)')
    for (let i in layers) {
        let d = layers[i]
        if (!d.id.includes('land') && !d.id.includes('water')) {
            map.setLayoutProperty(d.id, 'visibility', 'none')
        }
    }
    map.setLayoutProperty('waterway-label', 'visibility', 'none')
    map.setLayoutProperty('water-line-label', 'visibility', 'none')
    map.setLayoutProperty('water-point-label', 'visibility', 'none')
    map.setLayoutProperty('landcover', 'visibility', 'none')
    map.setLayoutProperty('landuse', 'visibility', 'none')
    map.setLayoutProperty('wetland', 'visibility', 'none')
    map.setLayoutProperty('wetland-pattern', 'visibility', 'none')
    map.setLayerZoomRange('landcover', 0, 16)
    map.setPaintProperty('landcover','fill-opacity', 0.8)
}

const addSKYlineMarker = async (map: Map): Promise<void> => {
    return new Promise((res, _) => {
        let count = 0
        for (let i of imgSet) {
            map.loadImage(i.img, (_, img) => {
                if (!img) return
                map.addImage(i.name, img, {
                    'pixelRatio': 1,
                    'sdf': true
                })
                count++
                if (count === imgSet.length) {
                    res()
                }
            })
        }
    })

}

const downloadData = async (needDecry?: boolean): Promise<EnrouteDataEnc> => {
    let loadedNum = 0
    let loadedSize = 0
    let allSize = 20.5
    const ALLNUM = 7

    return new Promise(async (reso, rej) => {
    const airac: AIRAC = await useAirac()
    let result: EnrouteDataEnc = {
        airports: '',
        vors: '',
        ndbs: '',
        waypoints: '',
        airways: '',
        firs: '',
        grid: '',
        airac: JSON.stringify(airac)
    }
    axios.get(`${apiUrl.enroute.airports}?airac=${airac.cycle}`, { 'headers': createHeader() }).then(res => {
        loadedNum++
        loadedSize += 0.705
        result.airports = needDecry ? JSON.parse(dataDecrypt(res.data)) : res.data
        pubsub.publish('enroute-data-load', parseInt(((loadedSize / allSize) * 100).toFixed()))
        if (loadedNum === ALLNUM) {
            reso(result)
        }
    }).catch(() => {
        rej()
    })
    axios.get(`${apiUrl.enroute.airways}?airac=${airac.cycle}`, { 'headers': createHeader() }).then(res => {
        loadedNum++
        loadedSize += 4.72
        result.airways = needDecry ? JSON.parse(dataDecrypt(res.data)) : res.data
        pubsub.publish('enroute-data-load', parseInt(((loadedSize / allSize) * 100).toFixed()))
        if (loadedNum === ALLNUM) {
            reso(result)
        }
    }).catch(() => {
        rej()
    })
    if (airac.critical.includes('firs') || airac.critical.includes('fir')){
        axios.get(`${apiUrl.enroute.firs}?airac=${airac.cycle}`, { 'headers': createHeader() }).then(res => {
            loadedNum++
            loadedSize += 0.97
            result.firs = needDecry ? JSON.parse(dataDecrypt(res.data)) : res.data
            pubsub.publish('enroute-data-load', parseInt(((loadedSize / allSize) * 100).toFixed()))
            if (loadedNum === ALLNUM) {
                reso(result)
            }
        }).catch(() => {
            rej()
        })
    }else{
        loadedNum++
        loadedSize += 0.97
        pubsub.publish('enroute-data-load', parseInt(((loadedSize / allSize) * 100).toFixed()))
    }
    
    axios.get(`${apiUrl.enroute.ndbs}?airac=${airac.cycle}`, { 'headers': createHeader() }).then(res => {
        loadedNum++
        loadedSize += 0.172
        result.ndbs = needDecry ? JSON.parse(dataDecrypt(res.data)) : res.data
        pubsub.publish('enroute-data-load', parseInt(((loadedSize / allSize) * 100).toFixed()))
        if (loadedNum === ALLNUM) {
            reso(result)
        }
    }).catch(() => {
        rej()
    })
    axios.get(`${apiUrl.enroute.vors}?airac=${airac.cycle}`, { 'headers': createHeader() }).then(res => {
        loadedNum++
        loadedSize += 0.224
        result.vors = needDecry ? JSON.parse(dataDecrypt(res.data)) : res.data
        pubsub.publish('enroute-data-load', parseInt(((loadedSize / allSize) * 100).toFixed()))
        if (loadedNum === ALLNUM) {
            reso(result)
        }
    }).catch(() => {
        rej()
    })
    axios.get(`${apiUrl.enroute.waypoints}?airac=${airac.cycle}`, { 'headers': createHeader() }).then(res => {
        loadedNum++
        loadedSize += 7.98
        result.waypoints = needDecry ? JSON.parse(dataDecrypt(res.data)) : res.data
        pubsub.publish('enroute-data-load', parseInt(((loadedSize / allSize) * 100).toFixed()))
        if (loadedNum === ALLNUM) {
            reso(result)
        }
    }).catch(() => {
        rej()
    })
    if (airac.critical.includes('grid')){
        axios.get(`${apiUrl.enroute.grid}?airac=${airac.cycle}`, { 'headers': createHeader() }).then(res => {
            loadedNum++
            loadedSize += 5.2
            result.grid = needDecry ? JSON.parse(dataDecrypt(res.data)) : res.data
            pubsub.publish('enroute-data-load', parseInt(((loadedSize / allSize) * 100).toFixed()))
            if (loadedNum === ALLNUM) {
                reso(result)
            }
        }).catch(() => {
            rej()
        })
    }else{
        loadedNum++
        loadedSize += 5.2
        pubsub.publish('enroute-data-load', parseInt(((loadedSize / allSize) * 100).toFixed()))
    }
   
})
}

const addSKYKlineData = (_map?: Map): Promise<EnrouteData> => {
    // 对于tauri来说，进入后检测文件夹是否存在并读取内容。如果文件夹不存在或文件读取失败则触发shp-fetch-err事件并跳转打开数据管理器。如果成功就直接加载。
    return new Promise(async (res, rej) => {
        useGetShpDB().then(r => {
            if (r) return res(r)
            rej()
        }).catch(() => rej())
        // if (isTauri){
        //     useGetShpFile().then(r => {
        //         if (r) return res(r)
        //         // 在这里触发的航路图enroute-data-error事件
        //         rej()
        //     }).catch(() => rej())
        // }else{
        //     useGetShpDB().then(r => {
        //         if (r) return res(r)
        //         rej()
        //     }).catch(() => rej())
            //如果是web，弹窗让用户选择航路图数据位置，直接加载即可
            //! 如果是web，检测IndexedDB是否有数据，有就加载，加载失败或文件夹不存在就触发shp-fetch-err打开数据管理界面
            // pubsub.publish('picker-start', 1)
            // if ('showDirectoryPicker' in window) {
            //   } else {
            //      pubsub.publish('no-picker-api-available', 1)
            //      return rej()
            //   }
        //}
    })
}

const addSKYlineLayer = (map: Map, enrouteData: EnrouteData) => {
    map.addSource('amm',{
        'type': 'vector',
        'tiles': ['https://api.skylineflyleague.cn/efb/mapbox-enroute-beta/amm/{z}/{x}/{y}'],
        'maxzoom': 15,
        'minzoom': 12,
        "format": "pbf",
    })
    map.addSource('dem',{
        "type": "raster-dem",
        "tiles": [
            "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
        ],
        "minzoom": 0,
        "maxzoom": 16,
        "tileSize": 256,
        "encoding": "terrarium"
    })
    // 卫星图信息
    map.addLayer({
        id: 'sate',
        type: 'raster',
        source: {
            'type': 'raster',
            'tiles': [`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`],
            'tileSize':256,
            'maxzoom': 14
        },
        layout:{
            visibility: 'none'
        }
    },'land-structure-line')
    
    //添加机场信息
    map.addSource('airports', {
        type: "geojson",
        data: enrouteData.airports as any
    })
    map.addSource('vors', {
        type: "geojson",
        data: enrouteData.vors as any
    })
    map.addSource('ndbs', {
        type: "geojson",
        data: enrouteData.ndbs as any
    })
    map.addSource('waypoints', {
        type: "geojson",
        data: enrouteData.waypoints as any
    })
    //航路
    map.addSource('airways', {
        type: "geojson",
        data: enrouteData.airways as any
    })
    //加载航路图label
    map.addSource('airways-label', {
        type: 'geojson',
        data: enrouteData.airways  as any
    })
    map.addSource('firs',{
        type: 'geojson',
        data: enrouteData.firs
    })
    map.addSource('mora',{
        type: 'geojson',
        data: enrouteData.grid
    })
    //source加载完成，开始加载图层信息
    //map.setLayoutProperty('hillshade', 'visibility', 'visible')
    //顺序： ndb awy awy-label wpt vor apt
    //NDB
    map.addLayer({
        id: 'efb-ndbs',
        type: "symbol",
        source: 'ndbs',
        minzoom: 4.8,
        layout: {
            'icon-rotation-alignment': "map",
            'icon-image': 'ndb',
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            'icon-size': {
                "base": 0.5,
                "stops": [
                    [
                        4.6,
                        0.15
                    ],
                    [
                        5,
                        0.2
                    ],
                    [
                        7,
                        0.25
                    ],
                    [
                        8.5,
                        0.3
                    ]
                ]
            },
            "text-size": {
                "base": 0.5,
                "stops": [
                    [
                        5,
                        0
                    ],
                    [
                        5.2,
                        0
                    ],
                    [
                        5.4,
                        0
                    ],
                    [
                        5.5,
                        12.5
                    ],
                    [
                        7,
                        13.5
                    ],
                    [
                        10,
                        14.5
                    ]
                ]
            },
            "text-padding": 1,
            "text-justify": "center",
            "text-radial-offset": 0.65,
            "text-field":[
                'step',
                ['zoom'],
                ['get', 'ident'],
                8.5, 
                [
                    "format",
                    [
                        "get",
                        "ident"
                    ],
                    {
                        "font-scale": 0.88
                    },
                    "\n",
                    {},
                    [
                        "get",
                        "name"
                    ],
                    {
                        "font-scale": 1
                    },
                    "\n",
                    {},
                    [
                        "get",
                        "frequency"
                    ],
                    {
                        "font-scale": 0.84
                    }
                ]
            ],
        },
        paint:{
            "text-color": "#3CB371",
            "icon-color": "#32CD32",
            'text-halo-color': '#fff',
            'text-halo-width': 1
        }
    })
    //航路
    map.addLayer({
        id: 'efb-airways',
        type: 'line',
        source: 'airways',
        minzoom: 5.3,
        layout:{
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint:{
            'line-color': '#4682B4',
            'line-width': {
                "base": 0.5,
                "stops": [
                    [
                        5,
                        0.3
                    ],
                    [
                        5.5,
                        0.35
                    ],
                    [
                        5.8,
                        0.4
                    ],
                    [
                        6,
                        0.42
                    ],
                    [
                        8,
                        0.65
                    ],
                    [
                        10,
                        0.75
                    ]
                ]
            }
        },
        filter: [
            "!=",
            ['get','type'],
            'L'
        ]
    })
    map.addLayer({
        id: 'efb-airways-label',
        type: 'symbol',
        source: 'airways-label',
        minzoom: 7,
        layout:{
            "text-rotate": ['get','fixed_heading'],
            "icon-rotate": ['+', ['get','heading'], 90],
            "text-field":['get','ident'],
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            'text-size': {
                "base": 0.5,
                "stops": [
                    [
                        7,
                        11
                    ],
                    [
                        7.4,
                        12
                    ],
                    [
                        9.5,
                        13.5
                    ],
                    [
                        10,
                        14
                    ]
                ]
            },
            "text-max-width": 20,
            "text-offset": [
                0,
                0
            ],
            'icon-offset':[
                0,0
            ],
            'icon-image':[
                'case',
                ['<=', ['get','name_length'], 4],
                'awy.short',
                'awy'
            ],
            'icon-size': {
                "base": 0.5,
                "stops": [
                    [
                        7,
                        1.25
                    ],
                    [
                        7.4,
                        1.65
                    ],
                    [
                        8,
                        1.75
                    ],
                    [
                        8.8,
                        1.8
                    ],
                    [
                        9.5,
                        1.9
                    ],
                    [
                        10,
                        2.1
                    ]
                ]
            },
            'icon-anchor':'center',
            "text-line-height": 1.3,
            'icon-padding': 0,
            'text-padding': 0
        },
        paint:{
            'text-color': '#fff',
            'icon-color': [
                'case',
                ['==', ['get','type'], 'B'],
                '#1E90FF',
                '#FFA500'
            ],
        },
        filter: [
            "!=",
            ['get','type'],
            'L'
        ]
    })
    //航路点
    map.addLayer({
        id: 'efb-waypoints',
        type: "symbol",
        source: 'waypoints',
        minzoom: 6.5,
        layout: {
            'icon-image': 'wpt',
            'text-font': ['Ubuntu Regular', 'Arial Unicode MS Regular'],
            'icon-size': {
                "base": 0.5,
                "stops": [
                    [
                        6,
                        0.2
                    ],
                    [
                        6.4,
                        0.25
                    ],
                    [
                        7,
                        0.36
                    ],
                    [
                        8.5,
                        0.45
                    ]
                ]
            },
            "text-size": {
                "base": 0.5,
                "stops": [
                    [
                        6.5,
                        10.5
                    ],
                    [
                        7,
                        11.35
                    ],
                    [
                        7.3,
                        12.5
                    ],
                    [
                        8.4,
                        13.5
                    ],
                    [
                        11,
                        14
                    ],
                    [
                        13,
                        14.5
                    ],
                ]
            },
            "text-justify": "center",
            "text-radial-offset": 0.8,
            "text-padding": 0.8,
            "text-field":['get','ident']
        },
        paint:{
            "text-color": 'rgb(41,74,117)',
            'icon-color': 'rgb(41,74,117)',
            'text-halo-color': '#fff',
            'text-halo-width': 1
        },
        filter: [
            "==",
            ['get','type'],
            'enroute'
        ]
    })
    map.addLayer({
        id: 'efb-waypoints-terminal',
        type: "symbol",
        source: 'waypoints',
        minzoom: 10,
        layout: {
            'icon-image': 'wpt.terminal',
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            'icon-size': 0.45,
            "text-size": {
                "base": 0.5,
                "stops": [
                    [
                        10,
                        11
                    ],
                    [
                        11,
                        12
                    ],
                    [
                        13,
                        13
                    ],
                ]
            },
            "text-justify": "center",
            "text-radial-offset": 0.5,
            "text-field":['get','ident']
        },
        paint:{
            "text-color": '#000',
            'icon-color': 'rgb(41,74,117)',
            'text-halo-color': '#fff',
            'text-halo-width': 1
        },
        filter: [
            "==",
            ['get','type'],
            'terminal'
        ]
    })
    //VOR
    map.addLayer({
        id: 'efb-vors',
        type: "symbol",
        source: 'vors',
        minzoom: 4.6,
        layout: {
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            'icon-image': {
                "base": 0.5,
                "stops": [
                    [
                        5,
                        'vor'
                    ],
                    [
                        9,
                        'vor.com'
                    ]
                ]
            },
            "icon-size": {
                "base": 0.5,
                "stops": [
                [
                    4,
                    0.1
                ],
                [
                    4.6,
                    0.15
                ],
                [
                    5,
                    0.3
                ],
                [
                    7,
                    0.5
                ],
                [
                    12,
                    0.6
                ]
            ]
            },
            'text-size': {
                "base": 0.5,
                "stops": [
                [
                    4,
                    0
                ],
                [
                    4.5,
                    0
                ],
                [
                    4.9,
                    0
                ],
                [
                    5,
                    11
                ],
                [
                    6,
                    12
                ],
                [
                    8,
                    13.5
                ],
                [
                    10,
                    14.5
                ],
                [
                    10.5,
                    15
                ],
            ]
            },
            "text-padding": [
            'interpolate',
            ['exponential', 0.5],
            ['zoom'],
                5,
                1,
                7,
                1,
                8.5,
                2,
                9,
                11,
                10,
                12
            ],
            "text-justify": "center",
            "text-radial-offset": 0.75,
            "text-field":[
                'step',
                ['zoom'],
                ['get', 'ident'],
                8, 
                [
                    "format",
                    [
                        "get",
                        "ident"
                    ],
                    {
                        "font-scale": 0.88
                    },
                    "\n",
                    {},
                    [
                        "get",
                        "name"
                    ],
                    {
                        "font-scale": 1
                    },
                    "\n",
                    {},
                    [
                        "get",
                        "frequency"
                    ],
                    {
                        "font-scale": 0.75
                    }
                ]
            ],
        },
        paint:{
            "text-color": "rgb(41,74,117)",
            "icon-color": "rgb(41,74,117)",
            'text-halo-color': '#fff',
            'text-halo-width': 1
        }
    })
    //机场
    map.addLayer({
        id: 'efb-airports',
        type: "symbol",
        source: 'airports',
        minzoom: 2.5,
        layout: {
            'icon-image': 'apt',
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            'icon-size': {
                "base": 0.5,
                "stops": [
                    [
                        3,
                        0.25
                    ],
                    [
                        3,
                        0.3
                    ],
                    [
                        4,
                        0.35
                    ],
                    [
                        4.4,
                        0.48
                    ],
                    [
                        7,
                        0.58
                    ]
                ]
            },
            "text-size": {
                "base": 0.5,
                "stops": [
                    [
                        3,
                        0
                    ],
                    [
                        4,
                        0
                    ],
                    [
                        4.9,
                        0
                    ],
                    [
                        5,
                        11.5
                    ],
                    [
                        7,
                        13
                    ],
                    [
                        8.4,
                        13.2
                    ],
                    [
                        8.8,
                        13.5
                    ],
                    [
                        10,
                        14.2
                    ],
                    [
                        12,
                        14.5
                    ]
                ]
            },
            "text-variable-anchor": [
                "top",
                "bottom",
                "top-left",
                "top-right",
                "left",
                "right",
                "bottom-left",
                "bottom",
                "bottom-right"
            ],
            "text-field":[
                'step',
                ['zoom'],
                ['get', 'icao'],
                8, 
                [
                    "format",
                [
                    "get",
                    "icao"
                ],
                {
                    "font-scale": 0.9
                },
                "\n",
                {},
                [
                    "get",
                    "name"
                ],
                {
                    "font-scale": 1
                },
                "\n",
                {},
                [
                    "get",
                    "elevation"
                ],
                {
                    "font-scale": 0.9
                }
            ]
            ],
        },
        paint:{
            "text-color": "#32CD32",
            'icon-color': '#32CD32',
            'text-halo-color': '#fff',
            'text-halo-width': 0.5
        }
    })
    //FIRS
    map.addLayer({
        id: 'efb-firs',
        type: 'line',
        source: 'firs',
        layout:{
            "line-join": "round",
            "line-cap": "square"
        },
        paint:{
            "line-dasharray": [
                "step",
                [
                    "zoom"
                ],
                [
                    "literal",
                    [
                        2,
                        0
                    ]
                ],
                3,
                [
                    "literal",
                    [
                        2,
                        2,
                        6,
                        2
                    ]
                ]
            ],
            "line-width": [
                "interpolate",
                [
                    "linear"
                ],
                [
                    "zoom"
                ],
                0,
                0.25,
                1,
                0.4,
                5,
                0.75,
                6,
                1.5
            ],
            "line-color": "#00BFFF"
        }
    })
    //MORA
    map.addLayer({
        id: 'mora',
        type: 'symbol',
        source: 'mora',
        minzoom: 5.8,
        maxzoom: 12,
        layout:{
            'text-field': ['get', 'data'],
            'text-font': ['Nunito Sans Bold Italic'],
            "text-size": {
                "base": 2,
                "stops": [
                    [
                        6,
                        20
                    ],
                    [
                        7,
                        25
                    ],
                    [
                        8,
                        30
                    ]
                ]
            }
        },
        paint:{
            "text-opacity": {
                "base": 2,
                "stops": [
                    [
                        5.8,
                        0.1
                    ],
                    [
                        6,
                        0.2
                    ],
                    [
                        6.2,
                        0.3
                    ],
                    [
                        6.6,
                        1
                    ],
                    [
                        10,
                        1
                    ],
                    [
                        10.4,
                        1
                    ],
                    [
                        10.8,
                        0.2
                    ]
                ]
            },
            "text-color": [
                "case",
                [
                    "<",
                    [
                        "get",
                        "data"
                    ],
                    100
                ],
                "rgb(0,160,233)",
                "rgb(245,108,108)"
            ],
            "text-halo-color": "#f5f5f5",
            "text-halo-width": 1.4
        }
    },'efb-waypoints')
    //开始添加机场AMM图层信息
    //机场背景
    map.addLayer({
        id: 'amm-airport',
        type: 'fill',
        source: 'amm',
        'source-layer': 'airport',
        paint:{
            'fill-color': '#90EE90',
            'fill-opacity': [
                'interpolate',
                ['exponential', 0.1],
                ['zoom'],
                    12,
                    0.15,
                    12.3,
                    0.3,
                    12.5,
                    0.32,
                    12.6,
                    0.35,
                    12.8,
                    0.38,
                    13,
                    0.4
                ]
        }
    })
    //简易机场
    map.addLayer({
        id: 'amm-airstrip',
        type: 'fill',
        source: 'amm',
        'source-layer': 'airstrip',
        paint:{
            'fill-color': '#ADD8E6'
        }
    })
    //直升机场
    map.addLayer({
        id: 'amm-helipad',
        type: 'fill',
        source: 'amm',
        'source-layer': 'helipad',
        paint:{
            'fill-color': '#ADD8E6'
        }
    })
    //滑行道
    map.addLayer({
        id: 'amm-taxiway-1',
        type: 'line',
        source: 'amm',
        'source-layer': 'taxiway1',
        layout:{
            'line-cap': 'butt',
            'line-join': 'round',
        },
        paint:{
            'line-color': '#F5F5F5',
            'line-width': {
                "base": 0.5,
                "stops": [
                    [
                        12,
                        1.6
                    ],
                    [
                        13,
                        3.2
                    ],
                    [
                        14,
                        7
                    ],
                    [
                        14.5,
                        11.5
                    ],
                    [
                        15,
                        16
                    ],
                    [
                        16,
                        30
                    ]
            ]
            }
        }
    })
    map.addLayer({
        id: 'amm-taxiway-2',
        type: 'line',
        source: 'amm',
        'source-layer': 'taxiway2',
        layout:{
            'line-cap': 'butt',
            'line-join': 'round',
        },
        paint:{
            'line-color': '#F5F5F5',
            'line-width': {
                "base": 0.5,
                "stops": [
                    [
                        12,
                        1.6
                    ],
                    [
                        13,
                        3.2
                    ],
                    [
                        14,
                        7
                    ],
                    [
                        14.5,
                        11.5
                    ],
                    [
                        15,
                        16
                    ],
                    [
                        16,
                        30
                    ]
            ]
            }
        }
    })
    map.addLayer({
        id: 'amm-taxiway-3',
        type: 'line',
        source: 'amm',
        'source-layer': 'taxiway3',
        layout:{
            'line-cap': 'butt',
            'line-join': 'round',
        },
        paint:{
            'line-color': '#F5F5F5',
            'line-width': {
                "base": 0.5,
                "stops": [
                    [
                        12,
                        1.6
                    ],
                    [
                        13,
                        3.2
                    ],
                    [
                        14,
                        7
                    ],
                    [
                        14.5,
                        11.5
                    ],
                    [
                        15,
                        16
                    ],
                    [
                        16,
                        30
                    ]
            ]
            }
        }
    })
    map.addLayer({
        id: 'amm-taxiway-4',
        type: 'line',
        source: 'amm',
        'source-layer': 'taxiway4',
        layout:{
            'line-cap': 'butt',
            'line-join': 'round',
        },
        paint:{
            'line-color': '#F5F5F5',
            'line-width': {
                "base": 0.5,
                "stops": [
                    [
                        12,
                        1.6
                    ],
                    [
                        13,
                        3.2
                    ],
                    [
                        14,
                        7
                    ],
                    [
                        14.5,
                        11.5
                    ],
                    [
                        15,
                        16
                    ],
                    [
                        16,
                        30
                    ]
            ]
            }
        }
    })
    //机坪
    map.addLayer({
        id: 'amm-apron',
        type: 'fill',
        source: 'amm',
        'source-layer': 'apron',
        paint:{
            'fill-color': '#F5F5F5'
        }
    })
    //滑行道标线
    map.addLayer({
        id: 'amm-taxiway-1-line',
        type: 'line',
        source: 'amm',
        'source-layer': 'taxiway1',
        minzoom: 13.1,
        layout:{
            'line-cap': 'butt',
            'line-join': 'round',
        },
        paint:{
            'line-color': '#FFD700',
            'line-width': {
                "base": 0.5,
                "stops": [
                [
                    13,
                    0.9
                ],
                [
                    13.3,
                    1.1
                ],
                [
                    13.7,
                    1.25
                ],
                [
                    14.3,
                    1.35
                ]
                ]
            }
        }
    })
    map.addLayer({
        id: 'amm-taxiway-2-line',
        type: 'line',
        source: 'amm',
        'source-layer': 'taxiway2',
        minzoom: 13.1,
        layout:{
            'line-cap': 'butt',
            'line-join': 'round',
        },
        paint:{
            'line-color': '#FFD700',
            'line-width': {
                "base": 0.5,
                "stops": [
                [
                    13,
                    0.9
                ],
                [
                    13.3,
                    1.1
                ],
                [
                    13.7,
                    1.25
                ],
                [
                    14.3,
                    1.35
                ]
                ]
            }
        }
    })
    map.addLayer({
        id: 'amm-taxiway-3-line',
        type: 'line',
        source: 'amm',
        'source-layer': 'taxiway3',
        minzoom: 13.1,
        layout:{
            'line-cap': 'butt',
            'line-join': 'round',
        },
        paint:{
            'line-color': '#FFD700',
            'line-width': {
                "base": 0.5,
                "stops": [
                [
                    13,
                    0.9
                ],
                [
                    13.3,
                    1.1
                ],
                [
                    13.7,
                    1.25
                ],
                [
                    14.3,
                    1.35
                ]
                ]
            }
        }
    })
    map.addLayer({
        id: 'amm-taxiway-4-line',
        type: 'line',
        source: 'amm',
        'source-layer': 'taxiway4',
        minzoom: 13.1,
        layout:{
            'line-cap': 'butt',
            'line-join': 'round',
        },
        paint:{
            'line-color': '#FFD700',
            'line-width': {
                "base": 0.5,
                "stops": [
                [
                    13,
                    0.9
                ],
                [
                    13.3,
                    1.1
                ],
                [
                    13.7,
                    1.25
                ],
                [
                    14.3,
                    1.35
                ]
                ]
            }
        }
    })
    //滑行道标牌
    map.addLayer({
        id: 'amm-taxiway-1-label',
        type: 'symbol',
        source: 'amm',
        'source-layer': 'taxiway1',
        layout:{
            'text-field': ['get', 'ref'],
            "symbol-placement": "line",
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            "text-size": {
                "base": 0.5,
                "stops": [
                    [
                        12,
                        12
                    ],
                    [
                        12.5,
                        12.5
                    ],
                    [
                        13,
                        14
                    ],
                    [
                        14,
                        15
                    ],
                    [
                        15,
                        16
                    ]
            ]
            },
            "text-max-angle": 10,
            "text-rotation-alignment": "viewport"
        },
        paint:{
            "text-halo-color": "rgb(253,215,13)",
            "text-color": "#010101",
            "text-halo-width": 5
        }
    })
    map.addLayer({
        id: 'amm-taxiway-2-label',
        type: 'symbol',
        source: 'amm',
        'source-layer': 'taxiway2',
        layout:{
            'text-field': ['get', 'ref'],
            "symbol-placement": "line",
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            "text-size": {
                "base": 0.5,
                "stops": [
                    [
                        12,
                        12
                    ],
                    [
                        12.5,
                        12.5
                    ],
                    [
                        13,
                        14
                    ],
                    [
                        14,
                        15
                    ],
                    [
                        15,
                        16
                    ]
            ]
            },
            "text-max-angle": 10,
            "text-rotation-alignment": "viewport"
        },
        paint:{
            "text-halo-color": "rgb(253,215,13)",
            "text-color": "#010101",
            "text-halo-width": 5
        }
    })
    map.addLayer({
        id: 'amm-taxiway-3-label',
        type: 'symbol',
        source: 'amm',
        'source-layer': 'taxiway3',
        layout:{
            'text-field': ['get', 'ref'],
            "symbol-placement": "line",
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            "text-size": {
                "base": 0.5,
                "stops": [
                    [
                        12,
                        12
                    ],
                    [
                        12.5,
                        12.5
                    ],
                    [
                        13,
                        14
                    ],
                    [
                        14,
                        15
                    ],
                    [
                        15,
                        16
                    ]
            ]
            },
            "text-max-angle": 10,
            "text-rotation-alignment": "viewport"
        },
        paint:{
            "text-halo-color": "rgb(253,215,13)",
            "text-color": "#010101",
            "text-halo-width": 5
        }
    })
    map.addLayer({
        id: 'amm-taxiway-4-label',
        type: 'symbol',
        source: 'amm',
        'source-layer': 'taxiway4',
        layout:{
            'text-field': ['get', 'ref'],
            "symbol-placement": "line",
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            "text-size": {
                "base": 0.5,
                "stops": [
                    [
                        12,
                        12
                    ],
                    [
                        12.5,
                        12.5
                    ],
                    [
                        13,
                        14
                    ],
                    [
                        14,
                        15
                    ],
                    [
                        15,
                        16
                    ]
            ]
            },
            "text-max-angle": 10,
            "text-rotation-alignment": "viewport"
        },
        paint:{
            "text-halo-color": "rgb(253,215,13)",
            "text-color": "#010101",
            "text-halo-width": 5
        }
    })
    //跑道
    map.addLayer({
        id: 'amm-runway',
        type: 'line',
        source: 'amm',
        'source-layer': 'runway',
        layout:{
            'line-cap': 'butt',
            'line-join': 'miter',
        },
        paint:{
            'line-color': '#696969',
            'line-width': {
                "base": 0.5,
                "stops": [
                [
                    12,
                    6
                ],
                [
                    13,
                    8
                ],
                [
                    14,
                    12
                ],
                [
                    14.6,
                    16
                ],
                [
                    15,
                    28
                ],
                [
                    16,
                    30
                ]
            ]
            }
        }
    })
    //航站楼
    map.addLayer({
        id: 'amm-terminal-3d',
        type: 'fill-extrusion',
        source: 'amm',
        'source-layer': 'terminal',
        paint:{
            "fill-extrusion-height": 40,
            "fill-extrusion-opacity": 1
        }
    })
    map.addLayer({
        id: 'amm-terminal-base',
        type: 'fill-extrusion',
        source: 'amm',
        'source-layer': 'terminal',
        paint:{
            "fill-extrusion-height": 40,
            'fill-extrusion-base': 40,
            "fill-extrusion-color": '#4682B4',
            "fill-extrusion-opacity": 1
        }
    })
    //停机位线条和标牌
    map.addLayer({
        id: 'amm-park-line',
        type: 'line',
        source: 'amm',
        minzoom: 13.1,
        'source-layer': 'parkingposition',
        paint:{
            'line-width': {
                "base": 0.5,
                "stops": [
                [
                    13,
                    0.9
                ],
                [
                    13.3,
                    1.1
                ],
                [
                    13.7,
                    1.25
                ],
                [
                    14.3,
                    1.35
                ]
                ]
            },
            'line-color': '#FFD700'
        }
    })
    map.addLayer({
        id: 'amm-park-line-2',
        type: 'line',
        source: 'amm',
        minzoom: 13.1,
        'source-layer': 'holdingposition',
        paint:{
            'line-width': {
                "base": 0.5,
                "stops": [
                [
                    13,
                    0.9
                ],
                [
                    13.3,
                    1.1
                ],
                [
                    13.7,
                    1.25
                ],
                [
                    14.3,
                    1.35
                ]
                ]
            },
            'line-color': '#FFD700'
        }
    })
    //停机位
    map.addLayer({
        id: 'amm-park-label',
        type: 'symbol',
        source: 'amm',
        minzoom: 14,
        'source-layer': 'parkingposition',
        layout:{
            'text-field': ['get','ref'],
            "symbol-placement": "line",
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            "text-size": {
                "base": 0.5,
                "stops": [
                    [
                        14,
                        14
                    ],
                    [
                        15,
                        14.5
                    ]
            ]
            },
            "text-max-angle": 10,
        },
        paint:{
            'text-color': '#000',
            'text-halo-color': '#fff',
            'text-halo-width': 2,
            'text-halo-blur': 4
        }
    })
     //gate
    map.addLayer({
        id: 'amm-gate',
        type: 'symbol',
        source: 'amm',
        'source-layer': 'gate',
        minzoom: 14,
        layout:{
            'text-field': ['get', 'ref'],
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            'text-size':{
                "base": 0.5,
                "stops": [
                    [
                        14,
                        14
                    ],
                    [
                        15,
                        14.5
                    ]
            ]
            }
        },
        paint:{
            'text-color': '#000',
            'text-halo-color': '#fff',
            'text-halo-width': 2,
            'text-halo-blur': 5
        }
    })
}

const getMapTheme = () => {
    const h = localStorage.getItem('theme')
    if (!h){
        localStorage.setItem('theme', 'light')
    }
    const theme = h ? h : 'light'
    document.getElementById('root')?.setAttribute('theme' , theme)
    return theme
}

const changeMapTheme = (theme: 'light' | 'dark', map: mapboxgl.Map) => {
    if (!map) return
    useClearLayer('aip', map)
    map.addLayer({
        id: 'aip',
        type: 'raster',
        source: {
            'type': 'raster',
            'tiles': [`${apiUrl.enroute.tilemap}/${getMapTheme()}/{z}/{x}/{y}`],
            'tileSize':256,
            'maxzoom': 9
        },
        layout:{
            visibility: 'none'
        }
    },'sate')
    const style = getStyle()
    if (style.includes('aip')){
        map.setLayoutProperty('aip', 'visibility', 'visible')
    }else{
        map.setLayoutProperty('aip', 'visibility', 'none')
    }
    if (theme === 'light'){
        //基础
        if (style.includes('terrain')){
            map.setPaintProperty('land', 'background-color', 'rgb(198, 234, 182)')
        }else{
            map.setPaintProperty('land', 'background-color', '#fff')
        }
        
        map.setPaintProperty('water', 'fill-color', 'rgb(111,203,255)')
        map.setPaintProperty('water-depth', 'fill-color', 'rgb(111,203,255)')
        map.setPaintProperty('landcover', 'fill-opacity', 0.8)
        map.setFog({
            "range": [
                1,
                20
            ],
            "color": [
                "interpolate",
                [
                    "linear"
                ],
                [
                    "zoom"
                ],
                4,
                "hsl(200, 100%, 100%)",
                6,
                "hsl(200, 50%, 90%)"
            ],
            "high-color": [
                "interpolate",
                [
                    "linear"
                ],
                [
                    "zoom"
                ],
                4,
                "hsl(200, 100%, 60%)",
                6,
                "hsl(310, 60%, 80%)"
            ],
            "space-color": [
                "interpolate",
                [
                    "exponential",
                    1.2
                ],
                [
                    "zoom"
                ],
                4,
                "hsl(205, 10%, 10%)",
                6,
                "hsl(205, 60%, 50%)"
            ],
            "horizon-blend": [
                "interpolate",
                [
                    "exponential",
                    1.2
                ],
                [
                    "zoom"
                ],
                4,
                0.01,
                6,
                0.1
            ],
            "star-intensity": [
                "interpolate",
                [
                    "exponential",
                    1.2
                ],
                [
                    "zoom"
                ],
                4,
                0.2,
                6,
                0
            ]
        } as mapboxgl.Fog)
        //导航数据
        map.setPaintProperty('efb-airports', 'text-halo-color', '#fff')
        map.setPaintProperty('efb-vors', 'text-halo-color', '#fff')
        map.setPaintProperty('efb-vors', 'text-color', 'rgb(41,74,117)')
        map.setPaintProperty('efb-vors', 'icon-color', 'rgb(41,74,117)')
        map.setPaintProperty('efb-ndbs', 'text-halo-color', '#fff')
        map.setPaintProperty('efb-waypoints', 'text-halo-color', '#fff')
        map.setPaintProperty('efb-waypoints-terminal', 'text-halo-color', '#fff')
        map.setPaintProperty('efb-waypoints', 'icon-color', 'rgb(41,74,117)')
        map.setPaintProperty('efb-waypoints-terminal', 'icon-color', 'rgb(41,74,117)')
        map.setPaintProperty('efb-waypoints', 'text-color', 'rgb(41,74,117)')
        map.setPaintProperty('efb-waypoints-terminal', 'text-color', '#000')
        map.setPaintProperty('efb-airways', 'line-color', '#4682B4')
        map.setPaintProperty('efb-firs', 'line-color', '#00BFFF')
        map.setPaintProperty('efb-airways-label', 'icon-color', [
            "case",
            [
                "==",
                [
                    "get",
                    "type"
                ],
                "B"
            ],
            "#1E90FF",
            "#FFA500"
        ])
        //AMM
        map.setPaintProperty('amm-taxiway-1', 'line-color', '#F5F5F5')
        map.setPaintProperty('amm-taxiway-2', 'line-color', '#F5F5F5')
        map.setPaintProperty('amm-taxiway-3', 'line-color', '#F5F5F5')
        map.setPaintProperty('amm-taxiway-4', 'line-color', '#F5F5F5')
        map.setPaintProperty('amm-apron', 'fill-color', '#F5F5F5')
        map.setPaintProperty('amm-runway', 'line-color', '#696969')
        map.setPaintProperty('amm-terminal-base', 'fill-extrusion-color', '#4682B4')
        map.setPaintProperty('amm-airport', 'fill-color', '#90EE90')
        //公路数据
        map.setPaintProperty('road-label', 'text-color', 'hsl(0,0%, 0%)')
        map.setPaintProperty('road-label', 'text-halo-color', [
            "match",
            [
                "get",
                "class"
            ],
            [
                "motorway",
                "trunk"
            ],
            "hsla(60, 25%, 100%, 0.75)",
            "hsl(60, 25%, 100%)"
        ])
        map.setPaintProperty('road-label', 'text-halo-width', 1)
        map.setPaintProperty('bridge-primary', 'line-color', 'hsl(0, 0%, 95%)')
        map.setPaintProperty('bridge-secondary-tertiary', 'line-color', 'hsl(0, 0%, 95%)')
        map.setPaintProperty('bridge-construction', 'line-color', 'hsl(0, 0%, 95%)')
        map.setPaintProperty('bridge-street-low', 'line-color', 'hsl(0, 0%, 95%)')
        map.setPaintProperty('bridge-street', 'line-color', 'hsl(0, 0%, 95%)')
        map.setPaintProperty('bridge-minor', 'line-color', 'hsl(0, 0%, 95%)')
        map.setPaintProperty('road-primary', 'line-color', 'hsl(0, 0%, 95%)')
        map.setPaintProperty('road-secondary-tertiary', 'line-color', 'hsl(0, 0%, 95%)')
        map.setPaintProperty('road-construction', 'line-color', 'hsl(0, 0%, 95%)')
        map.setPaintProperty('road-street-low', 'line-color', 'hsl(0, 0%, 95%)')
        map.setPaintProperty('road-street', 'line-color', 'hsl(0, 0%, 95%)')
        map.setPaintProperty('road-minor', 'line-color', 'hsl(0, 0%, 95%)')
        map.setPaintProperty('road-motorway-trunk', 'line-color', [
            "step",
            [
                "zoom"
            ],
            [
                "match",
                [
                    "get",
                    "class"
                ],
                "motorway",
                "hsl(15, 88%, 69%)",
                "trunk",
                "hsl(35, 81%, 59%)",
                "hsl(60, 18%, 85%)"
            ],
            9,
            [
                "match",
                [
                    "get",
                    "class"
                ],
                "motorway",
                "hsl(15, 100%, 75%)",
                "hsl(35, 89%, 75%)"
            ]
        ])
        map.setPaintProperty('bridge-motorway-trunk', 'line-color', [
            "step",
            [
                "zoom"
            ],
            [
                "match",
                [
                    "get",
                    "class"
                ],
                "motorway",
                "hsl(15, 88%, 69%)",
                "trunk",
                "hsl(35, 81%, 59%)",
                "hsl(60, 18%, 85%)"
            ],
            9,
            [
                "match",
                [
                    "get",
                    "class"
                ],
                "motorway",
                "hsl(15, 100%, 75%)",
                "hsl(35, 89%, 75%)"
            ]
        ])
        //MORA
        map.setPaintProperty('mora', 'text-halo-color', '#f5f5f5')
        map.setPaintProperty('mora', 'text-color', [
            "case",
            [
                "<",
                [
                    "get",
                    "data"
                ],
                100
            ],
            "rgb(0,160,233)",
            "rgb(245,108,108)"
        ])
        //动态数据
        if (map.getLayer('enroute-query-line')){
            map.setPaintProperty('enroute-query-line', 'line-color', '#7B68EE')
        }
        if (map.getLayer('enroute-search-circle')){
            map.setPaintProperty('enroute-search-circle', 'circle-color', '#FF69B4')
        }
        if (map.getLayer('query-airways')){
            map.setPaintProperty('query-airways', 'line-color', '#EE82EE')
        }
        if (map.getLayer('custom-waypoint')){
            map.setPaintProperty('custom-waypoint', 'text-halo-color', '#fff')
            map.setPaintProperty('custom-waypoint', 'icon-color', 'rgb(41,74,117)')
            map.setPaintProperty('custom-waypoint', 'text-color', 'rgb(41,74,117)')
        }
        if (map.getLayer('custom-vor')){
            map.setPaintProperty('custom-vor', 'text-halo-color', '#fff')
            map.setPaintProperty('custom-vor', 'text-color', 'rgb(41,74,117)')
            map.setPaintProperty('custom-vor', 'icon-color', 'rgb(41,74,117)')
        }
        if (map.getLayer('custom-ndb')){
            map.setPaintProperty('custom-ndb', 'text-halo-color', '#fff')
        }
    }else{
        //基础
        map.setPaintProperty('land', 'background-color', '#000')
        map.setPaintProperty('water', 'fill-color', 'rgb(17, 31, 65)')
        map.setPaintProperty('water-depth', 'fill-color', 'rgb(17, 31, 65)')
        map.setPaintProperty('landcover', 'fill-opacity', 0.16)
        map.setFog({
            "range": [
                0.5,
                20
            ],
            "color": [
                "interpolate",
                [
                    "linear"
                ],
                [
                    "zoom"
                ],
                4,
                "hsl(200, 100%, 100%)",
                6,
                "hsl(200, 50%, 90%)"
            ],
            "high-color": "rgb(20, 49, 118)",
            "space-color": [
                "interpolate",
                ["linear"],
                ["zoom"],
                4,
                "#010b19",
                7,
                "rgb(24, 31, 37)"
              ],
            "horizon-blend": [
                "interpolate",
                [
                    "exponential",
                    1.2
                ],
                [
                    "zoom"
                ],
                4,
                0.01,
                6,
                0.018
            ],
            "star-intensity": [
                "interpolate",
                [
                    "exponential",
                    1.2
                ],
                [
                    "zoom"
                ],
                2,
                0.3,
                4,
                0.2,
                6,
                0.2
            ]
        } as mapboxgl.Fog)
        //导航数据
        map.setPaintProperty('efb-airports', 'text-halo-color', '#000000')
        map.setPaintProperty('efb-vors', 'text-halo-color', '#000000')
        map.setPaintProperty('efb-vors', 'text-color', '#87CEEB')
        map.setPaintProperty('efb-vors', 'icon-color', '#87CEEB')
        map.setPaintProperty('efb-ndbs', 'text-halo-color', '#000000')
        map.setPaintProperty('efb-waypoints', 'text-halo-color', '#000000')
        map.setPaintProperty('efb-waypoints-terminal', 'text-halo-color', '#000000')
        map.setPaintProperty('efb-waypoints', 'icon-color', '#87CEEB')
        map.setPaintProperty('efb-waypoints-terminal', 'icon-color', '#87CEEB')
        map.setPaintProperty('efb-waypoints', 'text-color', '#f5f5f5')
        map.setPaintProperty('efb-waypoints-terminal', 'text-color', '#f5f5f5')
        map.setPaintProperty('efb-airways', 'line-color', '#ADD8E6')
        map.setPaintProperty('efb-firs', 'line-color', '#6495ED')
        map.setPaintProperty('efb-airways-label', 'icon-color', [
            'case',
            ['==', ['get','type'], 'B'],
            'rgb(34, 97, 174)',
            '#CD853F'
        ])
        //AMM
        map.setPaintProperty('amm-taxiway-1', 'line-color', '#808080')
        map.setPaintProperty('amm-taxiway-2', 'line-color', '#808080')
        map.setPaintProperty('amm-taxiway-3', 'line-color', '#808080')
        map.setPaintProperty('amm-taxiway-4', 'line-color', '#808080')
        map.setPaintProperty('amm-apron', 'fill-color', '#696969')
        map.setPaintProperty('amm-runway', 'line-color', 'rgb(70,70,70)')
        map.setPaintProperty('amm-terminal-base', 'fill-extrusion-color', '#778899')
        map.setPaintProperty('amm-airport', 'fill-color', '#2E8B57')
        //公路数据
        map.setPaintProperty('road-label', 'text-color', '#DCDCDC')
        map.setPaintProperty('road-label', 'text-halo-color', '#DCDCDC')
        map.setPaintProperty('road-label', 'text-halo-width', 0)
        map.setPaintProperty('bridge-primary', 'line-color', '#808080')
        map.setPaintProperty('bridge-secondary-tertiary', 'line-color', '#696969')
        map.setPaintProperty('bridge-construction', 'line-color', '#808080')
        map.setPaintProperty('bridge-street-low', 'line-color', '#696969')
        map.setPaintProperty('bridge-street', 'line-color', '#696969')
        map.setPaintProperty('bridge-minor', 'line-color', '#696969')
        map.setPaintProperty('road-primary', 'line-color', '#808080')
        map.setPaintProperty('road-secondary-tertiary', 'line-color', '#696969')
        map.setPaintProperty('road-construction', 'line-color', '#808080')
        map.setPaintProperty('road-street-low', 'line-color', '#696969')
        map.setPaintProperty('road-street', 'line-color', '#696969')
        map.setPaintProperty('road-minor', 'line-color', '#696969')
        map.setPaintProperty('road-motorway-trunk', 'line-color', [
            "step",
            [
                "zoom"
            ],
            [
                "match",
                [
                    "get",
                    "class"
                ],
                "motorway",
                "hsl(15, 50%, 55%)",
                "trunk",
                "rgb(165, 109, 30)",
                "#696969"
            ],
            9,
            [
                "match",
                [
                    "get",
                    "class"
                ],
                "motorway",
                "hsl(15, 50%, 55%)",
                "rgb(165, 100, 30)"
            ]
        ])
        map.setPaintProperty('bridge-motorway-trunk', 'line-color', [
            "step",
            [
                "zoom"
            ],
            [
                "match",
                [
                    "get",
                    "class"
                ],
                "motorway",
                "hsl(15, 50%, 55%)",
                "trunk",
                "rgb(165, 109, 30)",
                "#696969"
            ],
            9,
            [
                "match",
                [
                    "get",
                    "class"
                ],
                "motorway",
                "hsl(15, 50%, 55%)",
                "rgb(165, 100, 30)"
            ]
        ])
        //MORA
        map.setPaintProperty('mora', 'text-halo-color', '#000')
        map.setPaintProperty('mora', 'text-color', [
            "case",
            [
                "<",
                [
                    "get",
                    "data"
                ],
                100
            ],
            "rgb(8, 128, 183)",
            "rgb(202, 96, 96)"
        ])
        //动态数据
        if (map.getLayer('enroute-query-line')){
            map.setPaintProperty('enroute-query-line', 'line-color', '#40E0D0')
        }
        if (map.getLayer('enroute-search-circle')){
            map.setPaintProperty('enroute-search-circle', 'circle-color', '#FFD700')
        }
        if (map.getLayer('query-airways')){
            map.setPaintProperty('query-airways', 'line-color', '#3ad59a')
        }
        if (map.getLayer('custom-waypoint')){
            map.setPaintProperty('custom-waypoint', 'text-halo-color', '#000000')
            map.setPaintProperty('custom-waypoint', 'icon-color', '#87CEEB')
            map.setPaintProperty('custom-waypoint', 'text-color', '#f5f5f5')
        }
        if (map.getLayer('custom-vor')){
            map.setPaintProperty('custom-vor', 'text-halo-color', '#000000')
            map.setPaintProperty('custom-vor', 'text-color', '#87CEEB')
            map.setPaintProperty('custom-vor', 'icon-color', '#87CEEB')
        }
        if (map.getLayer('custom-ndb')){
            map.setPaintProperty('custom-ndb', 'text-halo-color', '#000000')
        }
    }
}

export {
    initMapStyle,
    addSKYlineMarker,
    addSKYKlineData,
    addSKYlineLayer,
    changeMapTheme,
    getMapTheme,
    downloadData
}