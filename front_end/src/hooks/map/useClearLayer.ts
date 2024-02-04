import type mapboxgl from "mapbox-gl";

export default (layer: string, map: mapboxgl.Map) => {
    if (!map) return
    if (map.getLayer(layer)){
        map.removeLayer(layer)
    }
    if (map.getSource(layer)){
        map.removeSource(layer)
    }
}