import { useEffect , memo } from "react"
import mapboxgl, { LngLatBoundsLike } from "mapbox-gl"
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import axios from "axios"
import pubsub from 'pubsub-js'
import token from "../../config/map/token"
import { addSKYlineMarker, initMapStyle, addSKYKlineData, addSKYlineLayer, 
        changeMapTheme, getMapTheme } from '../../hooks/map/useMapStyle'
import addGridLayer from "../../utils/addGridLayer"
import { setStyleByItem, triggerRepaintStyle } from "../../hooks/map/useEnrouteMap"
import useMouse from "../../hooks/map/useMouse"
import useClearLayer from "../../hooks/map/useClearLayer"
import FilterBar from "./filterBar"
import useEnrouteQuery from "../../hooks/search/useEnrouteQuery"
import EnrouteQuery from "../Search/enrouteQuery"
import apiUrl from "../../config/api/apiUrl"
import createHeader from "../../utils/createHeader"
import EnrouteRightSearch from "../Search/enrouteRightSearch"
import isShowOwnshipData from '../../hooks/ownship/useStatus'
import SelectEnrouteData from "../User/selectEnrouteData"
import useWaypointLayer from "../../hooks/user/useWaypointLayer"

export default memo(() => {
    //@ts-ignore
    let map: mapboxgl.Map
    let marker: mapboxgl.Marker

    /**mapbox固定大小转为可变化的坐标格式*/
    const metersToPixelsAtMaxZoom = (meters: number, latitude: number): number => {
      return meters / 0.075 / Math.cos(latitude * Math.PI / 180)
    }

    useEffect(() => {
        const initMap = () => {
            if (map) return
            mapboxgl.accessToken = token
            map = new mapboxgl.Map({
                container: 'enroute-map',
                center: [101.2, 19.4],
                zoom: 2.12,
                style: 'mapbox://styles/mapbox/outdoors-v12',
                projection: 'globe' as any as mapboxgl.Projection
            })
            map.setMaxZoom(15.8)
            map.addControl(new mapboxgl.AttributionControl({
              compact: false,
              customAttribution: 'SKYline EFB | 仅限模拟飞行使用 | 禁止用于实际飞行'
            }))
            map.addControl(
              new mapboxgl.ScaleControl({ unit: "metric" }),
              "bottom-right",
            )
            map.addControl(
              new mapboxgl.ScaleControl({ unit: "nautical" }),
              "bottom-right",
            )
            map.addControl(new mapboxgl.NavigationControl({
              'visualizePitch': true
            }), "top-right")
            let language = new MapboxLanguage({ defaultLanguage: "zh-Hans" })//设置汉语
            map.addControl(language)
            const zoom: string | null = localStorage.getItem('map-zoom')
            const center: string | null = localStorage.getItem('map-center')
            if (zoom) {
                map.setZoom(parseFloat(zoom))
            } else {
                localStorage.setItem('map-zoom', map.getZoom().toString())
            }
            if (center) {
                let lng: number = parseFloat(center.split('LngLat(')[1].split(',')[0].trim())
                let lat: number = parseFloat(center.split(',')[1].split(')')[0].trim())
                map.setCenter([lng, lat])
            } else {
                localStorage.setItem('map-center', map.getCenter().toString())
            }
            bindMapEventListener()
        }

        const bindMapEventListener = () => {
            map.on('zoomend', () => {
                localStorage.setItem('map-zoom', map.getZoom().toString())
                localStorage.setItem('map-center', map.getCenter().toString())
              })
              map.on('dragend', () => {
                localStorage.setItem('map-center', map.getCenter().toString())
              })
              map.on('style.load', async () => {
                initMapStyle(map)
                map.addSource('mapbox-dem', {
                  'type': 'raster-dem',
                  'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                  'tileSize': 512,
                  'maxzoom': 14
                })
                map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1 })
                await addSKYlineMarker(map)
                try {
                  let enrouteData = await addSKYKlineData(map)
                  pubsub.publish('enroute-data-no-error',1)
                  addSKYlineLayer(map, enrouteData)
                  useWaypointLayer()
                  addGridLayer(map)
                  triggerRepaintStyle(map)
                  useMouse(map)
                } catch (e) {
                  pubsub.publish('enroute-data-error',1)
                  //isShowLoadAlert.value = true
                  //isErrorLoaded.value = true
                  //isShowProgress.value = false
                }
              })
              map.on('click', (e) => {
                useEnrouteQuery(map.queryRenderedFeatures(e.point))
              })
              map.on('contextmenu',(e) => {
                //右键搜索
                enrouteSearch(e.lngLat.lat, e.lngLat.lng)
              })
        }

        const enrouteSearch = (lat: number, lng: number) => {
          //展示地图右键时跟随map-view移动的图
            if (!lat || !lng) return
            if (map.isMoving() || map.isRotating()) return
            useClearLayer('enroute-search-circle', map)
            if (map.getSource('enroute-search-circle')){
              map.removeSource('enroute-search-circle')
            }
            map.addSource('enroute-search-circle',{
              'type': 'geojson',
              data: {
                'type': 'FeatureCollection',
                'features': [{
                  'type': 'Feature',
                  'properties': {},
                  'geometry': {
                    'coordinates': [lng, lat],
                    'type': 'Point'
                  }
                }]
              }
            })
            map.addLayer({
                id: 'enroute-search-circle',
                type: 'circle',
                source: 'enroute-search-circle',
                paint:{
                  "circle-color": `${getMapTheme() === 'night' ? '#FFD700' : '#FF69B4'}`,
                  "circle-opacity":0.35,
                  "circle-radius": {
                      stops: [
                      [0, 0],
                      [20, metersToPixelsAtMaxZoom(20000,lat)]],
                      base: 2
                  },
                  "circle-stroke-color":`${getMapTheme() === 'night' ? '#FFD700' : '#FF69B4'}`,
                  "circle-stroke-opacity":0.8,
                  "circle-stroke-width":2,
                  "circle-translate-anchor":"map",
                  "circle-pitch-alignment": "map"
                }
            })
            pubsub.publish('enroute-search-start',1)
            axios.get(`${apiUrl.enrouteSearch}?lat=${lat}&lng=${lng}`,{'headers': createHeader()}).then(res => {
                if (res.data.code !== 200) return
                pubsub.publish('enroute-search-data',{
                  location: [lng, lat],
                  data: res.data.data
                })
            })
        }

        initMap()
    })

    useEffect(() => {
        pubsub.publish('start-loading-enroute',1)
        pubsub.subscribe('change-enroute-style',(_, data: string) => {
          setStyleByItem(data, map)
        })
        pubsub.subscribe('request-repaint-map',() => {
          triggerRepaintStyle(map)
        })
        pubsub.subscribe('change-enroute-preset',() => {
          triggerRepaintStyle(map)
        })
        pubsub.subscribe('change-theme',(_,data: string) => {
           changeMapTheme(data as 'light' | 'dark', map)
        })
        pubsub.subscribe('enroute-query-success',(_,data: QueryPubsubEvent) => {
          try {
            marker.remove()
          } catch (error) {
            
          }
          useClearLayer('query-airways', map)
          if (map.getSource('query-airways')){
            map.removeSource('query-airways')
          }
          if (data.type === 'taxiway'){
            //绘制滑行道图案
              if (!map.getSource('enroute-query-line')){
                map.addSource('enroute-query-line',{
                  'type': 'geojson',
                  data : {
                    'type': 'FeatureCollection',
                    'features': [{
                      'type': 'Feature',
                      'properties': {},
                      'geometry': {
                        'type': 'LineString',
                        coordinates: data.coord
                      }
                    }]
                  }
                })
                map.addLayer({
                id: 'enroute-query-line',
                type: 'line',
                minzoom: 12,
                source:'enroute-query-line',
                paint:{
                  "line-color": getMapTheme() === 'night' ? '#40E0D0' : '#7B68EE',
                  'line-opacity': 0.6,
                  'line-width': {
                    "base": 0.5,
                    "stops": [
                        [
                          12,
                         3
                        ],
                        [
                          13,
                          4
                        ],
                        [
                          14,
                          6
                        ]
                    ]
                }
                }
              })
            }else{
              let a: any = map.getSource('enroute-query-line')
              a.setData({
                'type': 'FeatureCollection',
                'features': [{
                  'type': 'Feature',
                  'properties': {},
                  'geometry': {
                    'type': 'LineString',
                    coordinates: data.coord
                  }
                }]
              })
            }
          }else{
            //图标
            marker = new mapboxgl.Marker({
                draggable: false
            }).setLngLat(data.coord).addTo(map)
            map.flyTo({center: data.coord})
          }
        })
        pubsub.subscribe('enroute-query-end',() => {
          useClearLayer('enroute-query-line', map)
          if (map.getSource('enroute-query-line')){
              map.removeSource('enroute-query-line')
          }
          try {
            marker.remove()
          } catch (error) {
            
          }
        })
        pubsub.subscribe('enroute-search-close',() => {
            useClearLayer('enroute-search-circle', map)
            if (map.getSource('enroute-search-circle')){
              map.removeSource('enroute-search-circle')
            }
        })
        pubsub.subscribe('open-window',(_,data: string) => {
          
          const width = document.body.scrollWidth
          if (width <= 700){
            if (data !== 'enroute-query'){
              try {
                marker.remove()
              } catch (error) {
                
              }
            }
            if (data !== 'enroute-right-search'){
                useClearLayer('enroute-search-circle', map)
                if (map.getSource('enroute-search-circle')){
                  map.removeSource('enroute-search-circle')
                }
            }
            
          }
        })
        pubsub.subscribe('enroute-airway-success',(_,data) => {
            useClearLayer('query-airways', map)
            if (map.getSource('query-airways')){
              map.removeSource('query-airways')
            }
            map.addSource('query-airways',{
              'type': 'geojson',
                data
            })
            map.addLayer({
              id: 'query-airways',
              type: 'line',
              source:'query-airways',
              layout:{
                'line-cap':'round',
                'line-join': 'round'
              },
              'paint': {
                'line-color': getMapTheme() === 'light' ? '#EE82EE' : '#3ad59a',
                'line-opacity': 0.75,
                'line-width': {
                  "base": 0.5,
                  "stops": [
                      [
                        2,
                        1.6
                      ],
                      [
                        5,
                        4
                      ],
                      [
                        8.5,
                        5.5
                      ],
                      [
                        9.2,
                        6
                      ]
                  ]
              },

              }
            })
            const w = data.features[0].geometry.coordinates
            const bbox = [w[0], w[w.length -1]] as LngLatBoundsLike
            map.fitBounds(bbox,{
              padding: {top: 60, bottom:60, left: 60, right: 50}
            })
        })
        pubsub.subscribe('search-close',() => {
          useClearLayer('query-airways', map)
            if (map.getSource('query-airways')){
              map.removeSource('query-airways')
            }
        })
        pubsub.subscribe('draw-main-route',(_,data: any) => {
            useClearLayer('main-route-line', map)
            useClearLayer('main-route-label', map)
            useClearLayer('main-route-point', map)
            useClearLayer('sid-line', map)
            useClearLayer('star-line', map)
            map.addSource('main-route-line',{
              'type': 'geojson',
              data: data.line_geojson
            })
            map.addSource('sid-line',{
              'type': 'geojson',
              data: data.sid_geojson
            })
            map.addSource('star-line',{
              'type': 'geojson',
              data: data.star_geojson
            })
            map.addSource('main-route-point',{
              'type': 'geojson',
              data: data.point_geojson
            })
            map.addSource('main-route-label',{
              'type': 'geojson',
              data: data.point_geojson
            })
            map.addLayer({
                'id': 'main-route-point',
                'type': 'circle',
                'source': 'main-route-point',
                'paint':{
                    'circle-color':[
                      'case',
                      ['==', ['get', 'type'], 'airport'],
                      '#e75e0f',
                      ['==', ['get', 'type'], 'vor'],
                      'rgb(104,195,63)',
                      ['==', ['get', 'type'], 'ndb'],
                      '#1dbe7b',
                      ['==', ['get', 'type'], 'waypoint'],
                      'rgb(101,167,230)',
                      'rgb(101,167,230)',
                    ],
                    'circle-opacity': 0.6,
                    'circle-radius': {
                      "base": 0.2,
                      "stops": [
                      [
                          2,
                          6
                      ],
                      [
                          4,
                          8
                      ],
                      [
                          8,
                          10
                      ],
                      [
                          11,
                          12
                      ]
                  ]
                  },
                },
            })
            map.addLayer({
              id: 'main-route-label',
              type: 'symbol',
              source: 'main-route-label',
              paint:{
                "text-color": "#fff",
                'text-halo-color': [
                  'case',
                  ['==', ['get', 'type'], 'airport'],
                  '#e75e0f',
                  ['==', ['get', 'type'], 'vor'],
                  'rgb(104,195,63)',
                  ['==', ['get', 'type'], 'ndb'],
                  '#1dbe7b',
                  ['==', ['get', 'type'], 'waypoint'],
                  'rgb(101,167,230)',
                  'rgb(101,167,230)',
                ],
                'text-halo-width': 4
              },
              layout:{
                'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
                "text-size": {
                  "base": 0.5,
                  "stops": [
                      [
                        3,
                        11.5
                      ],
                      [
                          7,
                          12
                      ],
                      [
                          8.4,
                          12.2
                      ],
                      [
                          8.8,
                          12.5
                      ],
                      [
                          10,
                          13.2
                      ],
                      [
                          12,
                          13.5
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
                "text-padding": 3,
                "text-justify": "center",
                "text-radial-offset": 0.7,
                "text-field":['get', 'ident'],
              }
            })
            map.addLayer({
              id: 'sid-line',
              type: 'line',
              source: 'sid-line',
              layout:{
                'line-cap': 'round',
                'line-join': 'round'
              },
              paint:{
                'line-color': '#FF6347',
                'line-width': {
                    "base": 0.5,
                    "stops": [
                        [
                            1,
                            4.5,
                        ],
                        [
                            3,
                            7,
                        ],
                        [
                            5,
                            7.8,
                        ],
                        [
                            8,
                            8.6
                        ],
                        [
                            10,
                            9.5
                        ]
                    ]
                },
                'line-opacity': 0.5,
                'line-dasharray': [1, 1.5]
              }
            })
            map.addLayer({
              id: 'star-line',
              type: 'line',
              source: 'star-line',
              layout:{
                'line-cap': 'round',
                'line-join': 'round'
              },
              paint:{
                'line-color': '#FF00FF',
                'line-width': {
                    "base": 0.5,
                    "stops": [
                        [
                            1,
                            4.5,
                        ],
                        [
                            3,
                            7,
                        ],
                        [
                            5,
                            7.8,
                        ],
                        [
                            8,
                            8.6
                        ],
                        [
                            10,
                            9.5
                        ]
                    ]
                },
                'line-opacity': 0.5,
                'line-dasharray': [1, 1.5]
              }
            })
            map.addLayer({
              id: 'main-route-line',
              type: 'line',
              source: 'main-route-line',
              layout:{
                'line-cap': 'round',
                'line-join': 'round'
              },
              paint:{
                'line-color': '#00FFFF',
                'line-width': {
                    "base": 0.5,
                    "stops": [
                        [
                            1,
                            4.5,
                        ],
                        [
                            3,
                            7,
                        ],
                        [
                            5,
                            7.8,
                        ],
                        [
                            8,
                            8.6
                        ],
                        [
                            10,
                            9.5
                        ]
                    ]
                },
                'line-opacity': 0.5
              }
            })
        })
        pubsub.subscribe('draw-sid', (_,data: any) => {
            useClearLayer('sid-line', map)
            map.addSource('sid-line',{
              type: 'geojson',
              data
            })
            map.addLayer({
              id: 'sid-line',
              type: 'line',
              source: 'sid-line',
              layout:{
                'line-cap': 'round',
                'line-join': 'round'
              },
              paint:{
                'line-color': '#FF69B4',
                'line-width': {
                    "base": 0.5,
                    "stops": [
                        [
                            1,
                            4.5,
                        ],
                        [
                            3,
                            7,
                        ],
                        [
                            5,
                            7.8,
                        ],
                        [
                            8,
                            8.6
                        ],
                        [
                            10,
                            9.5
                        ]
                    ]
                },
                'line-opacity': 0.5
              }
            })
        })
        pubsub.subscribe('draw-star', (_,data: any) => {
            useClearLayer('star-line', map)
            map.addSource('star-line',{
              type: 'geojson',
              data
            })
            map.addLayer({
              id: 'star-line',
              type: 'line',
              source: 'star-line',
              layout:{
                'line-cap': 'round',
                'line-join': 'round'
              },
              paint:{
                'line-color': 'rgb(104,195,63)',
                'line-width': {
                    "base": 0.5,
                    "stops": [
                        [
                            1,
                            4.5,
                        ],
                        [
                            3,
                            7,
                        ],
                        [
                            5,
                            7.8,
                        ],
                        [
                            8,
                            8.6
                        ],
                        [
                            10,
                            9.5
                        ]
                    ]
                },
                'line-opacity': 0.5
              }
            })
        })
        pubsub.subscribe('draw-app', (_,data: any) => {
            useClearLayer('app-line', map)
            map.addSource('app-line',{
              type: 'geojson',
              data
            })
            map.addLayer({
              id: 'app-line',
              type: 'line',
              source: 'app-line',
              layout:{
                'line-cap': 'round',
                'line-join': 'round'
              },
              paint:{
                'line-color': [
                  'case',
                  ['==', ['get', 'type'], 'app'],
                  '#1E90FF',
                  'rgb(104,195,63)'
                ],
                'line-width': {
                    "base": 0.5,
                    "stops": [
                        [
                            1,
                            4.5,
                        ],
                        [
                            3,
                            7,
                        ],
                        [
                            5,
                            7.8,
                        ],
                        [
                            8,
                            8.6
                        ],
                        [
                            10,
                            9.5
                        ]
                    ]
                },
                'line-opacity': 0.5
              }
            })
        })
        pubsub.subscribe('unload-flight',() => {
          useClearLayer('main-route-line', map)
          useClearLayer('main-route-label', map)
          useClearLayer('main-route-point', map)
          useClearLayer('main-route-sidstar', map)
          useClearLayer('sid-line', map)
          useClearLayer('star-line', map)
          useClearLayer('app-line', map)
        })
        pubsub.subscribe('goto-zoom-runway',(_,runway: Runway) => {
            map.flyTo({
              zoom: 15.6,
              center: [runway.location[1], runway.location[0]]
            })
        })

        //绘制ownship信息
        pubsub.subscribe('ownship-data',(_, data: TrafficData | null) => {
            if (!data) return useClearLayer('ownship-data', map)
            const geojson: GeoJSON = {
                type: 'FeatureCollection',
                features: [{
                    type: 'feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': data.lnglat
                    },
                    'properties': {
                      ...data
                    }
                }]
            }
            const s: any = map.getSource('ownship-data')
            if (s){
              return s.setData(geojson)
            }
            map.addSource('ownship-data', {
              type: 'geojson',
              data: geojson as any
            })
            map.addLayer({
              'id': 'ownship-data',
              'type': 'symbol',
              'source': 'ownship-data',
              'layout':{
                  'icon-allow-overlap': true,
                  'icon-anchor': 'center',
                  'icon-ignore-placement': true,
                  'icon-rotate': ['get','heading'],
                  'icon-image': 'traffic',
                  'icon-rotation-alignment': 'map',
                  'icon-size': [
                          'interpolate',
                          ['exponential', 0.5],
                          ['zoom'],
                          2,
                          0.4,
                          5,
                          0.55,
                          8,
                          0.62,
                          12,
                          0.65,
                          15,
                          0.7
                  ]
              },
              'paint': {
                'icon-color': 'rgb(243,57,57)'
              }
            })
          if (isShowOwnshipData('tracker', 'false')){
              map.setCenter(data.lnglat as mapboxgl.LngLatLike)
              map.setBearing(data.heading)
          }
        })
        pubsub.subscribe('navlink-data',(_, data: NavLink | null) => {
          if (!data) return useClearLayer('ownship-data', map)
          const geojson: GeoJSON = {
              type: 'FeatureCollection',
              features: [{
                  type: 'feature',
                  'geometry': {
                      'type': 'Point',
                      'coordinates': [
                        data.longitude,
                        data.latitude
                      ]
                  },
                  'properties': {
                    ...data
                  }
              }]
          }
          const s: any = map.getSource('ownship-data')
          if (s){
            return s.setData(geojson)
          }
          map.addSource('ownship-data', {
            type: 'geojson',
            data: geojson as any
          })
          map.addLayer({
            'id': 'ownship-data',
            'type': 'symbol',
            'source': 'ownship-data',
            'layout':{
                'icon-allow-overlap': true,
                'icon-anchor': 'center',
                'icon-ignore-placement': true,
                'icon-rotate': ['get','heading'],
                'icon-image': 'traffic',
                'icon-rotation-alignment': 'map',
                'icon-size': [
                        'interpolate',
                        ['exponential', 0.5],
                        ['zoom'],
                        2,
                        0.4,
                        5,
                        0.55,
                        8,
                        0.62,
                        12,
                        0.65,
                        15,
                        0.7
                ]
            },
            'paint': {
              'icon-color': 'rgb(243,57,57)'
            }
        })
        if (isShowOwnshipData('tracker', 'false')){
            map.setCenter([data.longitude, data.latitude] as mapboxgl.LngLatLike)
            map.setBearing(data.heading)
        }
      })
        pubsub.subscribe('server-traffic-data',(_, data: TrafficData[] | null) => {
            if (!data) return useClearLayer('server-traffic-data', map)
            const geojson: GeoJSON = {
                type: 'FeatureCollection',
                features: []
            }
            for (let d of data){
              geojson.features.push({
                type: 'feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': d.lnglat
                },
                'properties': {
                  ...d
                }
            }
            )
            }
            const s: any = map.getSource('server-traffic-data')
            if (s){
              return s.setData(geojson)
            }
            map.addSource('server-traffic-data', {
              type: 'geojson',
              data: geojson as any
            })
            map.addLayer({
              'id': 'server-traffic-data',
              'type': 'symbol',
              'source': 'server-traffic-data',
              'layout': {
                'icon-allow-overlap': true,
                'icon-anchor': 'center',
                'icon-ignore-placement': true,
                'text-allow-overlap': true,
                'text-ignore-placement': true,
                'icon-rotation-alignment': 'map',
                'icon-rotate': ['get','heading'],
                'icon-image': 'traffic',
                'icon-size': [
                    'interpolate',
                    ['exponential', 0.5],
                    ['zoom'],
                    2,
                    0.36,
                    5,
                    0.52,
                    8,
                    0.6,
                    12,
                    0.62,
                    15,
                    0.66
                ],
                'text-field':['get','callsign'],
                "text-radial-offset": 1.4,
                "text-justify": "auto",
                "text-variable-anchor": [
                    "bottom",
                    "right",
                    "left",
                    "top",
                    "bottom-right",
                    "bottom-left",
                    "top-right",
                    "top-left"
                ],
                
                "text-padding": 8,
                "text-line-height": 0.2,
                'text-size': [
                    'interpolate',
                    ['exponential', 0.5],
                    ['zoom'],
                    2,
                    11,
                    5,
                    12.4,
                    8,
                    12.5,
                    12,
                    13.5
                ]
            },
            'paint':{
                'text-color': 'rgb(42,242,255)',
                'icon-color': 'rgb(26,198,254)' 
            }
          })
        })

        pubsub.subscribe('weather-radar', () => {
            useClearLayer('weather-radar', map)
            axios.get(apiUrl.weatherRadar).then(res => {
              let nowcast: any[] = res.data.radar.nowcast
              let path = nowcast.reverse()[0].path
              let url = `${res.data.host}${path}/256/{z}/{x}/{y}/6/1_1.png`
              map.addSource('weather-radar', {
                  'type': 'raster',
                  'tiles': [url],
                  'tileSize':256
              })
              map.addLayer({
                  'id': 'weather-radar',
                  'type': 'raster',
                  'source': 'weather-radar',
                  'paint':{
                      'raster-opacity': 0.34
                  }
              })
          })
        })
        pubsub.subscribe('cancel-weather-radar', () => {
          useClearLayer('weather-radar', map)
        })
        pubsub.subscribe('click-pill-point',(_,data) => {
          try {
            marker.remove()
          } catch (error) {
            
          }
          marker = new mapboxgl.Marker({
              draggable: false
          }).setLngLat(data).addTo(map)
          map.flyTo({center: data})
        })
        pubsub.subscribe('no-point',() => {
          map.setCenter([115.74198733971065, 38.7])
          map.setZoom(7.8)
          const bounds = map.getBounds()
          map.setMaxBounds(bounds)
        })
        pubsub.subscribe('have-point',() => {
          map.setMaxBounds(undefined)
        })
        pubsub.subscribe('shp-loaded-main',(_,enrouteData: EnrouteData) => {
          addSKYlineLayer(map, enrouteData)
          useWaypointLayer()
          addGridLayer(map)
          triggerRepaintStyle(map)
          useMouse(map)
        })

    }, [])


    return (
      <>
        <div id="enroute-map" className="fixed left-0 top-0 w-full h-full z-0"></div>
        {/* <LoadingAlert /> */}
        <SelectEnrouteData />
        <FilterBar />
        <EnrouteQuery />
        <EnrouteRightSearch />
      </>
    )
})
