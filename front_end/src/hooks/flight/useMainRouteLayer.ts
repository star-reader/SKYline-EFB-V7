import pubsub from 'pubsub-js'
import fixLng from '../../utils/fixLng'
import useFixLng from '../map/useFixLng'

export default (route: OriginalRoute) => {
    const collection = route.route_info
    const point_geojson: GeoJSON = {
        type: 'FeatureCollection',
        features: []
    }
    const lines: any[] = []
    for (let d of collection){
        if (d.type !== 'airport'){
            lines.push(d.coordinate)
        }
        point_geojson.features.push({
            'type': 'feature',
            'geometry': {
                'type': 'Point',
                'coordinates': d.coordinate
            },
            'properties': {
                ident: d.ident,
                type: d.type
            }
        })
    }
    const line_geojson: GeoJSON = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'feature',
                geometry: {
                    coordinates: fixLng(lines),
                    type: 'LineString'
                },
                'properties':{}
            }
        ]
    }
    const sid_geojson: GeoJSON = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'feature',
                geometry: {
                    coordinates: useFixLng([
                        route.route_info[0].coordinate,
                        route.route_info[1].coordinate
                    ]),
                    type: 'LineString'
                },
                'properties':{
                    'type': 'sid'
                }
            }
        ]
    }
    const star_geojson: GeoJSON = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'feature',
                geometry: {
                    coordinates: useFixLng([
                        route.route_info[route.route_info.length - 2].coordinate,
                        route.route_info[route.route_info.length - 1].coordinate
                    ]),
                    type: 'LineString'
                },
                'properties':{
                    'type': 'star'
                }
            }
        ]
    }
    pubsub.publish('draw-main-route', {
        point_geojson, line_geojson, sid_geojson, star_geojson
    })
    
    return 0
}