// 给出跑道航向、气象报文即可获取跑道侧风（左为正）、顺逆风
type FormattedWind = {
    heading: number | 'var',
    speed: number | 'var'
}

const fromMetarToWind = (info: string): FormattedWind => {
    if (!info){
        return {
            heading: 'var', speed: 'var'
        }
    }
    let isVarWind = info.includes('不定')
    let isNoWind = info.includes('静风')
    let wind_degree
    let wind_speed
    if (isVarWind){
        return {
            heading: 'var', speed: 'var'
        }
    }
    if (isNoWind){
        return {heading: 0, speed: 0}
    }
    wind_degree = info.split('风向')[1].split('度')[0].trim()
    wind_speed = info.split('风速')[1].split('米')[0].split('节')[0].trim()
    return {
        heading: parseInt(wind_degree),
        speed: parseInt(wind_speed)
    }
}

const calculateWindComponents = (windDirection: number, windSpeed: number, course: number): [number, number] => {
    let windDirectionRad = (360 - windDirection + 90) * Math.PI / 180;
    let courseRad = (360 - course + 90) * Math.PI / 180;
    let relativeAngle = windDirectionRad - courseRad;
    let headWindComponent = -windSpeed * Math.cos(relativeAngle);
    let crossWindComponent = -windSpeed * Math.sin(relativeAngle);
    return [headWindComponent, crossWindComponent];
}

export default (runway: Runway, metarInfo: string): WindComponents => {
    const wind = fromMetarToWind(metarInfo)
    if (wind.heading === 'var' || wind.speed === 'var'){
        return {
            headWind: 'var', crossWind: 'var'
        }
    }
    if (wind.heading === 0 && wind.speed === 0){
        return {headWind: 0, crossWind: 0}
    }
    const [head, cross] = calculateWindComponents(wind.heading, wind.speed, runway.heading)
    return {
        headWind: head,
        crossWind: cross
    }
}