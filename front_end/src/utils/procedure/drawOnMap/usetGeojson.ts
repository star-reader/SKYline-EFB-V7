import useFixLng from "../../../hooks/map/useFixLng"

export default (coordinates: number[][], type: 'sid' | 'star' | 'app' | 'final') => {
    const geojson: GeoJSON = {
        type: 'FeatureCollection',
        features: []
    }
    geojson.features.push({
        type: 'feature',
        geometry: {
            coordinates: useFixLng(coordinates),
            type: 'LineString'
        },
        'properties':{
            type
        }
    })
    return geojson
}