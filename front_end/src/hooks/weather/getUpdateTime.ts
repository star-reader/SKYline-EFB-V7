export default (info: WeatherInfo) => {
    if (!info.airport_info || !info.metar) {
        return ''
    }
    try {
        return `UTC ${info.airport_info.split('世界时: ')[1].split('; ')[0]}更新`
    } catch (error) {
        return ''
    }
}