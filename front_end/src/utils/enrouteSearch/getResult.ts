import formatLocation from '../LocationFormat'

export default (type: 'airport' | 'navaid' | 'waypoint', data: any) => {
    switch (type) {
        case 'airport':
            {const d: QueryAirport = data
            const result = [
                {'key': '类型', 'value': '机场'},
                {'key': 'ICAO', 'value': d.icao},
                {'key': '机场名称', 'value': d.name},
                {'key': '坐标', 'value': formatLocation(d.location.latitude, d.location.longtitude)},
                {'key': '标高', 'value': `${d.elevation}ft/${(d.elevation * 0.3048).toFixed()}m`},
                {'key': '过渡高度','value': `${d.transition_altitude}ft`},
                {'key': '过渡高度层','value': `${d.transition_level}}ft`},
                {'key': '机场速度限制','value': `${d.speed_limit}}knots`},
                {'key': '速度限制高度', 'value': `${d.speed_limit_altitude}ft`}
            ]
            return result}
        case 'navaid':
            {const d: QueryNavaid = data
            const result = [
                {key: '类型', value: d.type},
                {key: '名称', value: d.name},
                {key: '识别码', value: d.ident},
                {key: '坐标', value: formatLocation(d.location.latitude, d.location.longtitude)}
            ]
            if (d.elevation){
                result.push(
                    {key: '导航台标高', value: `${d.elevation}ft/${(d.elevation * 0.3048).toFixed()}m`}
                )
            }
            if (d.magnetic_var){
                result.push(
                    {key: '导航台磁差', value: d.magnetic_var > 0 ? `${d.magnetic_var}°E` : `${d.magnetic_var}°W`}
                )
            }
            if (d.range){
                result.push(
                    {key: '范围', value: d.range.toString()}
                )
            }
            return result}
        case 'waypoint':
            const d: QueryWaypoint = data
            const result = [
                {key: '类型', value: '航路点'},
                {key: '航路点名称', value: d.ident},
                {key: '坐标', value: formatLocation(d.location.latitude, d.location.longtitude)},
            ]
            return result
    
        default:
            break;
    }
}
