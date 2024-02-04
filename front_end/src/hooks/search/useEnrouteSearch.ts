import pubsub from 'pubsub-js'
import getResult from "../../utils/enrouteSearch/getResult"
import useFixLng from '../map/useFixLng'

export default (type: 'airport' | 'navaid' | 'waypoint' | 'airway', d: any) => {
    //@ts-ignore
    const result = getResult(type, d)
    if (type !== 'airway'){
        pubsub.publish('start-enroute-query',1)
    }
    switch (type) {
        case 'airport':
            pubsub.publish('enroute-query-success',{
                'type': 'airport',
                'data': result,
                coord: [d.location.longtitude, d.location.latitude],
                ident: d.icao
            })
            break;
        case 'navaid':
            pubsub.publish('enroute-query-success',{
                'type': 'navaid',
                'data': result,
                coord: [d.location.longtitude, d.location.latitude],
                ident: d.ident
            })
            break;
        case 'waypoint':
            pubsub.publish('enroute-query-success',{
                'type': 'waypoint',
                'data': result,
                coord: [d.location.longtitude, d.location.latitude],
                ident: d.ident
            })
            break;
        case 'airway':
            //把数据处理成lineString，用data给map
            const geojson: any = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties:{},
                    geometry:{
                        type: 'LineString',
                        coordinates: useFixLng(d.lnglats)
                    }
                }]
            }
            pubsub.publish('enroute-airway-success',geojson)
            break;
        default:
            break;
    }
}