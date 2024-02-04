import type mapboxgl from "mapbox-gl"
import axios from 'axios'
import pubsub from 'pubsub-js'
import apiUrl from '../../config/api/apiUrl'
import createHeader from '../../utils/createHeader'
import formatLocation from '../../utils/LocationFormat'
import getResult from "../../utils/enrouteSearch/getResult"
const selectAbleQuery = [
    'efb-airports', 'efb-vors' , 'efb-ndbs' ,
    'efb-waypoints' , 'efb-waypoints-terminal' , 'amm-taxiway-1-label' ,
    'amm-taxiway-2-label' , 'amm-taxiway-3-label' , 'amm-taxiway-4-label'
]

//检索：从上向下依次检索，一旦检索到符合的，就停止向下继续检索，否则继续检索
export default (querys: mapboxgl.MapboxGeoJSONFeature[]) => {
    for (let item of querys){
        if (selectAbleQuery.includes(item.layer.id)){
            pubsub.publish('start-enroute-query',1)
            //在这里处理数据
            if (item.layer.id === 'efb-airports'){
                axios.post(apiUrl.enrouteQuery,{
                    'type': 'airport',
                    'ident': (<any>item.properties).icao
                }, {'headers': createHeader()}).then(res => {
                    if (res.data.code === 200){
                        //成功
                        const d: QueryAirport = res.data.data
                        const result = getResult('airport', d)
                        pubsub.publish('enroute-query-success',{
                            'type': 'airport',
                            'data': result,
                            coord: [d.location.longtitude, d.location.latitude],
                            ident: d.icao
                        })
                    }
                })
            }else if (item.layer.id === 'efb-vors' || item.layer.id === 'efb-ndbs'){
                axios.post(apiUrl.enrouteQuery,{
                    type: 'navaid',
                    ident: (<any>item.properties).ident
                },{'headers': createHeader()}).then(res => {
                    if (res.data.code === 200){
                        //成功
                        const ori: QueryNavaid[] = res.data.data
                        const targetCoord = (<any>item.geometry).coordinates
                        for (let d of ori){
                            if (
                                Math.abs(targetCoord[0] - d.location.longtitude) < 0.5 &&
                                Math.abs(targetCoord[1] - d.location.latitude) < 0.5
                            ){
                                const result = getResult('navaid', d)
                                pubsub.publish('enroute-query-success',{
                                    'type': 'navaid',
                                    'data': result,
                                    coord: [d.location.longtitude, d.location.latitude],
                                    ident: d.ident
                                })
                                break
                            }
                        }
                    }
                })
            }else if (item.layer.id === 'efb-waypoints' || item.layer.id === 'efb-waypoints-terminal'){
                //无需ajax，本地获取地图数据即可
                const ident = (<any>item.properties).ident
                const coord = (<any>item.geometry).coordinates
                const result = [
                    {key: '类型', value: '航路点'},
                    {key: '航路点名称', value: ident},
                    {key: '坐标', value: formatLocation(coord[1], coord[0])},
                ]
                pubsub.publish('enroute-query-success',{
                    'type': 'waypoint',
                    'data': result,
                    coord,
                    ident
                })
            }else if (item.layer.id.includes('amm-taxiway')){
                //也是本地地图数据获取
                const name = (<any>item.properties).ref
                const coord = (<any>item.geometry).coordinates
                const result = [
                    {key: '类型', value: '滑行道'},
                    {key: '滑行道名称', value: name}
                ]
                pubsub.publish('enroute-query-success',{
                    'type': 'taxiway',
                    'data': result,
                    coord,
                    ident: name
                })
            }
            break
        }
    }
}