export const getWeatherList = (): WeatherListStore[] => {
    const d = localStorage.getItem('weather')
    if (!d){
        localStorage.setItem('weather', JSON.stringify([]))
    }
    return d ? JSON.parse(d) : []
}

export const appendWeather = (weather: WeatherListStore) => {
    const d = localStorage.getItem('weather')
    let data: WeatherListStore[] = d ? JSON.parse(d) : []
    data = data.filter(i => i.icao !== weather.icao)
    data.unshift(weather)
    localStorage.setItem('weather', JSON.stringify(data))
}

export const deleteWeather = (airport: WeatherListStore) => {
    const d = localStorage.getItem('weather')
    let data: WeatherListStore[] = d ? JSON.parse(d) : []
    data = data.filter(i => i.id !== airport.id)
    localStorage.setItem('weather', JSON.stringify(data))
    return data
}