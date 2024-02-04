//航路图样式（当期预设、是否更改过）、具体显示什么图层
//全部图层  

import type mapboxgl from "mapbox-gl"
import { changeMapTheme, getMapTheme } from "./useMapStyle"

/**
 * 
 * 【地形 VFR】
 * hillshade(自带)
 * 3d (实验性功能)
 * 【导航数据 IFRH IFRL VFR】
 * efb-airports
 * efb-ndbs
 * efb-airways
 * efb-airways-label
 * efb-waypoints
 * efb-vors
 * efb-firs
 * 【导航数据 IFRL VFR】
 * efb-waypoints-terminal
 * 【机场AMM ALL】
 * amm-airport
 * amm-airstrip
 * amm-helipad
 * (amm-taxiway-1 4)
 * (amm-taxiway-1-line 4)
 * (amm-taxiway-1-label 4)
 * amm-runway
 * amm-terminal-3d
 * amm-terminal-base
 * amm-apron
 * amm-park-line
 * amm-park-line-2
 * amm-park-label
 * amm-gate
 * 
 * 【路网 VFR】
 * 来自mapbox图层
 * 
 * 【对应配置数据】
 * airport vor ndb airway waypoint terminal-waypoint amm terrain road
 * 
 */
const presetSelection = {
    'ifrh': 'World IFR High',
    'ifrl': 'World IFR Low',
    'vfr': 'World VFR',
    'sate': 'World Satellite',
    'aip': 'China AIP'
}
const defaultStyle = {
    'ifrh': ['airport', 'vor', 'ndb', 'airway', 'waypoint', 'amm', 'grid'],
    'ifrl': ['airport', 'vor', 'ndb', 'airway', 'waypoint', 'terminal-waypoint', 'amm', 'grid'],
    'vfr': ['airport', 'vor', 'ndb', 'airway', 'waypoint', 'terminal-waypoint', 'amm', 'terrain', 'road', 'grid'],
    'sate': ['3d'],
    'aip': ['amm', 'aip']
}

const getPreset = () => {
    const h = localStorage.getItem('preset')
    if (!h){
        localStorage.setItem('preset' ,'ifrh')
    }
    return h ? presetSelection[h as keyof object] : presetSelection.ifrh
}

const getStyle = (): string[] => {
    const h = localStorage.getItem('style')
    if (!h){
        localStorage.setItem('style', JSON.stringify(defaultStyle.ifrh))
    }
    return h ? JSON.parse(h) : defaultStyle.ifrh
}

const triggerRepaintStyle = (map: mapboxgl.Map) => {
    if (!map) return
    const preset = getPreset()
    if (preset === 'World Satellite'){
        map.setLayoutProperty('sate', 'visibility', 'visible')
        map.setLayoutProperty('land', 'visibility', 'none')
        map.setLayoutProperty('water', 'visibility', 'none')
        map.setLayoutProperty('water-depth', 'visibility', 'none')
        map.setLayoutProperty('landcover', 'visibility', 'none')
    }else{
        map.setLayoutProperty('sate', 'visibility', 'none')
        map.setLayoutProperty('land', 'visibility', 'visible')
        map.setLayoutProperty('water', 'visibility', 'visible')
        map.setLayoutProperty('water-depth', 'visibility', 'visible')
        map.setLayoutProperty('landcover', 'visibility', 'visible')
    }
    const style = getStyle()
    if (style.includes('airport')){
        map.setLayoutProperty('efb-airports', 'visibility', 'visible')
    }else {
        map.setLayoutProperty('efb-airports', 'visibility', 'none')
    }
    if (style.includes('vor')){
        map.setLayoutProperty('efb-vors', 'visibility', 'visible')
    }else {
        map.setLayoutProperty('efb-vors', 'visibility', 'none')
    }
    if (style.includes('ndb')){
        map.setLayoutProperty('efb-ndbs', 'visibility', 'visible')
    }else {
        map.setLayoutProperty('efb-ndbs', 'visibility', 'none')
    }
    if (style.includes('airway')){
        map.setLayoutProperty('efb-airways', 'visibility', 'visible')
        map.setLayoutProperty('efb-firs', 'visibility', 'visible')
        map.setLayoutProperty('efb-airways-label', 'visibility', 'visible')
        if (getPreset() === 'World IFR Low' || getPreset() === 'World VFR'){
            map.setFilter('efb-airways',[
                "!=",
                ['get','type'],
                'LLL'
            ])
            map.setFilter('efb-airways-label',[
                "!=",
                ['get','type'],
                'LLL'
            ])
        }else{
            map.setFilter('efb-airways',[
                "!=",
                ['get','type'],
                'L'
            ])
            map.setFilter('efb-airways-label',[
                "!=",
                ['get','type'],
                'L'
            ])
        }
    }else {
        map.setLayoutProperty('efb-firs', 'visibility', 'none')
        map.setLayoutProperty('efb-airways', 'visibility', 'none')
        map.setLayoutProperty('efb-airways-label', 'visibility', 'none')
    }
    if (style.includes('waypoint')){
        map.setLayoutProperty('efb-waypoints', 'visibility', 'visible')
    }else {
        map.setLayoutProperty('efb-waypoints', 'visibility', 'none')
    }
    if (style.includes('terminal-waypoint')){
        map.setLayoutProperty('efb-waypoints-terminal', 'visibility', 'visible')
    }else {
        map.setLayoutProperty('efb-waypoints-terminal', 'visibility', 'none')
    }
    if (style.includes('terrain')){
        map.setLayoutProperty('hillshade', 'visibility', 'visible')
        map.setLayoutProperty('landcover', 'visibility', 'visible')
        map.setPaintProperty('land', 'background-color', 'rgb(198, 234, 182)')
    }else {
        map.setLayoutProperty('hillshade', 'visibility', 'none')
        map.setLayoutProperty('landcover', 'visibility', 'none')
        map.setPaintProperty('land', 'background-color', '#F5F5F5')
        //map.setPaintProperty('land', 'background-color', 'rgb(198, 234, 182)')
    }
    if (style.includes('road')){
        map.setLayoutProperty('road-label', 'visibility', 'visible')
        map.setLayoutProperty('bridge-motorway-trunk', 'visibility', 'visible')
        map.setLayoutProperty('bridge-primary', 'visibility', 'visible')
        map.setLayoutProperty('bridge-primary-case', 'visibility', 'visible')
        map.setLayoutProperty('bridge-secondary-tertiary', 'visibility', 'visible')
        map.setLayoutProperty('bridge-construction', 'visibility', 'visible')
        map.setLayoutProperty('bridge-street-low', 'visibility', 'visible')
        map.setLayoutProperty('bridge-street', 'visibility', 'visible')
        map.setLayoutProperty('bridge-major-link', 'visibility', 'visible')
        map.setLayoutProperty('bridge-minor-link', 'visibility', 'visible')
        map.setLayoutProperty('bridge-street-case', 'visibility', 'visible')
        map.setLayoutProperty('bridge-minor-case', 'visibility', 'visible')
        map.setLayoutProperty('bridge-minor', 'visibility', 'visible')
        //
        map.setLayoutProperty('road-motorway-trunk', 'visibility', 'visible')
        map.setLayoutProperty('road-primary', 'visibility', 'visible')
        map.setLayoutProperty('road-primary-case', 'visibility', 'visible')
        map.setLayoutProperty('road-secondary-tertiary', 'visibility', 'visible')
        map.setLayoutProperty('road-construction', 'visibility', 'visible')
        map.setLayoutProperty('road-street-low', 'visibility', 'visible')
        map.setLayoutProperty('road-street', 'visibility', 'visible')
        map.setLayoutProperty('road-major-link', 'visibility', 'visible')
        map.setLayoutProperty('road-minor-link', 'visibility', 'visible')
        map.setLayoutProperty('road-street-case', 'visibility', 'visible')
        map.setLayoutProperty('road-minor-case', 'visibility', 'visible')
        map.setLayoutProperty('road-minor', 'visibility', 'visible')
        //
        map.setLayoutProperty('tunnel-major-link', 'visibility', 'visible')
        map.setLayoutProperty('tunnel-primary-case', 'visibility', 'visible')
        map.setLayoutProperty('tunnel-secondary-tertiary-case', 'visibility', 'visible')
        map.setLayoutProperty('tunnel-street-case', 'visibility', 'visible')
        map.setLayoutProperty('tunnel-minor-case', 'visibility', 'visible')
        map.setLayoutProperty('tunnel-minor-link-case', 'visibility', 'visible')
    }else {
        map.setLayoutProperty('road-label', 'visibility', 'none')
        //
        map.setLayoutProperty('bridge-motorway-trunk-2', 'visibility', 'none')
        map.setLayoutProperty('bridge-major-link-2', 'visibility', 'none')
        map.setLayoutProperty('bridge-motorway-trunk-2-case', 'visibility', 'none')
        map.setLayoutProperty('bridge-major-link-2-case', 'visibility', 'none')
        map.setLayoutProperty('bridge-motorway-trunk', 'visibility', 'none')
        map.setLayoutProperty('bridge-primary', 'visibility', 'none')
        map.setLayoutProperty('bridge-primary-case', 'visibility', 'none')
        map.setLayoutProperty('bridge-secondary-tertiary', 'visibility', 'none')
        map.setLayoutProperty('bridge-construction', 'visibility', 'none')
        map.setLayoutProperty('bridge-street-low', 'visibility', 'none')
        map.setLayoutProperty('bridge-street', 'visibility', 'none')
        map.setLayoutProperty('bridge-major-link', 'visibility', 'none')
        map.setLayoutProperty('bridge-minor-link', 'visibility', 'none')
        map.setLayoutProperty('bridge-street-case', 'visibility', 'none')
        map.setLayoutProperty('bridge-minor-case', 'visibility', 'none')
        map.setLayoutProperty('bridge-minor', 'visibility', 'none')
        //
        map.setLayoutProperty('road-motorway-trunk', 'visibility', 'none')
        map.setLayoutProperty('road-primary', 'visibility', 'none')
        map.setLayoutProperty('road-primary-case', 'visibility', 'none')
        map.setLayoutProperty('road-secondary-tertiary', 'visibility', 'none')
        map.setLayoutProperty('road-construction', 'visibility', 'none')
        map.setLayoutProperty('road-street-low', 'visibility', 'none')
        map.setLayoutProperty('road-street', 'visibility', 'none')
        map.setLayoutProperty('road-major-link', 'visibility', 'none')
        map.setLayoutProperty('road-minor-link', 'visibility', 'none')
        map.setLayoutProperty('road-street-case', 'visibility', 'none')
        map.setLayoutProperty('road-minor-case', 'visibility', 'none')
        map.setLayoutProperty('road-minor', 'visibility', 'none')
        //
        map.setLayoutProperty('tunnel-motorway-trunk', 'visibility', 'none')
        map.setLayoutProperty('tunnel-major-link', 'visibility', 'none')
        map.setLayoutProperty('tunnel-primary-case', 'visibility', 'none')
        map.setLayoutProperty('tunnel-secondary-tertiary-case', 'visibility', 'none')
        map.setLayoutProperty('tunnel-street-case', 'visibility', 'none')
        map.setLayoutProperty('tunnel-minor-case', 'visibility', 'none')
        map.setLayoutProperty('tunnel-minor-link-case', 'visibility', 'none')
    }
    if (style.includes('3d')){
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1 })
    }else{
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 0 })
    }
    if (style.includes('amm')){
        map.setLayoutProperty('amm-airport', 'visibility', 'visible')
        map.setLayoutProperty('amm-airstrip', 'visibility', 'visible')
        map.setLayoutProperty('amm-helipad', 'visibility', 'visible')
        map.setLayoutProperty('amm-taxiway-1', 'visibility', 'visible')
        map.setLayoutProperty('amm-taxiway-2', 'visibility', 'visible')
        map.setLayoutProperty('amm-taxiway-3', 'visibility', 'visible')
        map.setLayoutProperty('amm-taxiway-4', 'visibility', 'visible')
        map.setLayoutProperty('amm-taxiway-1-line', 'visibility', 'visible')
        map.setLayoutProperty('amm-taxiway-2-line', 'visibility', 'visible')
        map.setLayoutProperty('amm-taxiway-3-line', 'visibility', 'visible')
        map.setLayoutProperty('amm-taxiway-4-line', 'visibility', 'visible')
        map.setLayoutProperty('amm-taxiway-1-label', 'visibility', 'visible')
        map.setLayoutProperty('amm-taxiway-2-label', 'visibility', 'visible')
        map.setLayoutProperty('amm-taxiway-3-label', 'visibility', 'visible')
        map.setLayoutProperty('amm-taxiway-4-label', 'visibility', 'visible')
        map.setLayoutProperty('amm-runway', 'visibility', 'visible')
        map.setLayoutProperty('amm-terminal-3d', 'visibility', 'visible')
        map.setLayoutProperty('amm-terminal-base', 'visibility', 'visible')
        map.setLayoutProperty('amm-apron', 'visibility', 'visible')
        map.setLayoutProperty('amm-park-line', 'visibility', 'visible')
        map.setLayoutProperty('amm-park-line-2', 'visibility', 'visible')
        map.setLayoutProperty('amm-park-label', 'visibility', 'visible')
        map.setLayoutProperty('amm-gate', 'visibility', 'visible')
    }else{
        map.setLayoutProperty('amm-airport', 'visibility', 'none')
        map.setLayoutProperty('amm-airstrip', 'visibility', 'none')
        map.setLayoutProperty('amm-helipad', 'visibility', 'none')
        map.setLayoutProperty('amm-taxiway-1', 'visibility', 'none')
        map.setLayoutProperty('amm-taxiway-2', 'visibility', 'none')
        map.setLayoutProperty('amm-taxiway-3', 'visibility', 'none')
        map.setLayoutProperty('amm-taxiway-4', 'visibility', 'none')
        map.setLayoutProperty('amm-taxiway-1-line', 'visibility', 'none')
        map.setLayoutProperty('amm-taxiway-2-line', 'visibility', 'none')
        map.setLayoutProperty('amm-taxiway-3-line', 'visibility', 'none')
        map.setLayoutProperty('amm-taxiway-4-line', 'visibility', 'none')
        map.setLayoutProperty('amm-taxiway-1-label', 'visibility', 'none')
        map.setLayoutProperty('amm-taxiway-2-label', 'visibility', 'none')
        map.setLayoutProperty('amm-taxiway-3-label', 'visibility', 'none')
        map.setLayoutProperty('amm-taxiway-4-label', 'visibility', 'none')
        map.setLayoutProperty('amm-runway', 'visibility', 'none')
        map.setLayoutProperty('amm-terminal-3d', 'visibility', 'none')
        map.setLayoutProperty('amm-terminal-base', 'visibility', 'none')
        map.setLayoutProperty('amm-apron', 'visibility', 'none')
        map.setLayoutProperty('amm-park-line', 'visibility', 'none')
        map.setLayoutProperty('amm-park-line-2', 'visibility', 'none')
        map.setLayoutProperty('amm-park-label', 'visibility', 'none')
        map.setLayoutProperty('amm-gate', 'visibility', 'none')
    }
    if (style.includes('grid')){
        map.setLayoutProperty('grid-lines-1', 'visibility', 'visible')
        map.setLayoutProperty('grid-lines-2', 'visibility', 'visible')
        map.setLayoutProperty('mora', 'visibility', 'visible')
    }else{
        map.setLayoutProperty('grid-lines-1', 'visibility', 'none')
        map.setLayoutProperty('grid-lines-2', 'visibility', 'none')
        map.setLayoutProperty('mora', 'visibility', 'none')
    }
    if (map.getLayer('aip')){
        if (style.includes('aip')){
            map.setLayoutProperty('aip', 'visibility', 'visible')
        }else{
            map.setLayoutProperty('aip', 'visibility', 'none')
        }
    }
    changeMapTheme(getMapTheme() === 'night' ? 'dark' : 'light', map)
}

const isActived = (key: string) => {
    const style = getStyle()
    return style.includes(key)
}

const setStyleByItem = (item: string, map: mapboxgl.Map) => {
    const style = getStyle()
    const d = style.find(i => i === item)
    //如果有d，说明需要隐藏显示，否则打开显示
    if (d){
        localStorage.setItem('style', JSON.stringify(style.filter(i => i !== item)))
    }else{
        style.push(item)
        localStorage.setItem('style', JSON.stringify(style))
    }
    //重新绘制地图
    triggerRepaintStyle(map)
}

const getStyleByPreset = (preset: string) => {
    return defaultStyle[preset as keyof object] as string[]
}

const getPresetByPreset = (preset: string) => {
    return presetSelection[preset as keyof object] as string
}

const setStyleByArr = (arr: string[]) => {
    localStorage.setItem('style', JSON.stringify(arr))
}

export {
    getPreset, getStyle, triggerRepaintStyle , isActived , 
    setStyleByItem , getStyleByPreset , setStyleByArr , getPresetByPreset
}