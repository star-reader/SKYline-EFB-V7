import type mapboxgl from "mapbox-gl";

export default (map: mapboxgl.Map) => {
    if (!map) return
    map.on('mouseover','efb-airports',() => {
        map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseover','efb-vors',() => {
        map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseover','efb-ndbs',() => {
        map.getCanvas().style.cursor = 'pointer'
    })
    // map.on('mouseover','efb-airways-label',() => {
    //     map.getCanvas().style.cursor = 'pointer'
    // })
    map.on('mouseover','efb-waypoints',() => {
        map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseover','efb-waypoints-terminal',() => {
        map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseover','amm-taxiway-1-label',() => {
        map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseover','amm-taxiway-2-label',() => {
        map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseover','amm-taxiway-3-label',() => {
        map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseover','amm-taxiway-4-label',() => {
        map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave','efb-airports',() => {
        map.getCanvas().style.cursor = ''
    })
    map.on('mouseleave','efb-vors',() => {
        map.getCanvas().style.cursor = ''
    })
    map.on('mouseleave','efb-ndbs',() => {
        map.getCanvas().style.cursor = ''
    })
    // map.on('mouseleave','efb-airways-label',() => {
    //     map.getCanvas().style.cursor = ''
    // })
    map.on('mouseleave','efb-waypoints',() => {
        map.getCanvas().style.cursor = ''
    })
    map.on('mouseleave','efb-waypoints-terminal',() => {
        map.getCanvas().style.cursor = ''
    })
    map.on('mouseleave','amm-taxiway-1-label',() => {
        map.getCanvas().style.cursor = ''
    })
    map.on('mouseleave','amm-taxiway-2-label',() => {
        map.getCanvas().style.cursor = ''
    })
    map.on('mouseleave','amm-taxiway-3-label',() => {
        map.getCanvas().style.cursor = ''
    })
    map.on('mouseleave','amm-taxiway-4-label',() => {
        map.getCanvas().style.cursor = ''
    })
}