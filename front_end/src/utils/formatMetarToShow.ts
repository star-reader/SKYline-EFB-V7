import useWeatherType from "../hooks/weather/useWeatherType"

export default (info: string, metar: string): ParsedWeather => {
    const qnh = info.split('修正海压')[1].split(';')[0].split('.')[0]
    let isVarWind = info.includes('不定')
    let isNoWind = info.includes('静风')
    let wind_degree
    let wind_speed
    if (!isVarWind){
        wind_degree = info.split('风向')[1].split('度')[0].trim()
        wind_speed = info.split('风速')[1].split('米')[0].split('节')[0].trim()
    }
    const _type = useWeatherType(metar)
    let type
    switch (_type) {
        case 'clear':
            type = 'CAVOK'
            break
        case 'fog':
            type = '有雾'
            break
        case 'rain':
            type = '下雨'
            break
        case 'snow':
            type = '下雪'
            break
        case 'other':
            type = '其他天气'
            break
        default:
            type = '其他天气'
            break
    }
    let temp = info.split('气温')[1].split('摄氏度')[0].replace('零下', '-')
    let temp2 = info.split('露点')[1].split('摄氏度')[0].replace('零下', '-')
    
    return {
        qnh, 
        wind: isVarWind ? '风向不定' : isNoWind ? '静风' : `${wind_degree}° ${wind_speed}m/s`,
        type,
        temp: `${temp}°C / ${temp2}°C`
    }
}