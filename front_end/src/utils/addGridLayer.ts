import type mapboxgl from "mapbox-gl";

export default (map: mapboxgl.Map) => {
    //生成两种geojson，一个是小缩放，一个是大比例缩放
    const gridGeoJSON1: any = {
        type: 'FeatureCollection',
        features: []
    }
    const gridGeoJSON2: any = {
        type: 'FeatureCollection',
        features: []
    }
    for (let lng = -180; lng <= 180; lng += 10) {
        gridGeoJSON1.features.push({
            type: 'Feature',
            geometry: {
            type: 'LineString',
            coordinates: [[lng, -90], [lng, 90]]
            }
        });
    }
    for (let lng = -180; lng <= 180; lng += 1) {
        gridGeoJSON2.features.push({
            type: 'Feature',
            geometry: {
            type: 'LineString',
            coordinates: [[lng, -90], [lng, 90]]
            }
        });
    }

    for (let lat = -90; lat <= 90; lat += 10) {
        gridGeoJSON1.features.push({
            type: 'Feature',
            geometry: {
            type: 'LineString',
            coordinates: [[-180, lat], [180, lat]]
            }
        });
    }
    for (let lat = -90; lat <= 90; lat += 1) {
        gridGeoJSON2.features.push({
            type: 'Feature',
            geometry: {
            type: 'LineString',
            coordinates: [[-180, lat], [180, lat]]
            }
        });
    }

    map.addSource('grid-1',{
        type: 'geojson',
        data: gridGeoJSON1
    })
    map.addSource('grid-2',{
        type: 'geojson',
        data: gridGeoJSON2
    })

    map.addLayer({
        id: 'grid-lines-1',
        type: 'line',
        maxzoom: 5.5,
        source: 'grid-1',
        paint: {
          'line-color': '#32CD32',
          'line-width': [
            "interpolate",
            [
                "linear"
            ],
            [
                "zoom"
            ],
            0,
            0.1,
            2,
            0.3,
            3,
            0.4,
            5,
            0.5,
            5.5,
            0.55,
        ]
        }
    }, 'efb-ndbs')
    map.addLayer({
        id: 'grid-lines-2',
        type: 'line',
        minzoom: 5.5,
        source: 'grid-2',
        paint: {
          'line-color': '#32CD32',
          'line-width': [
            "interpolate",
            [
                "linear"
            ],
            [
                "zoom"
            ],
            5.5,
            0.55,
            6,
            0.6,
            7,
            0.7,
            10,
            0.85
        ]
        }
    }, 'efb-ndbs')
      
}