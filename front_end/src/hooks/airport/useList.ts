export const getAirportList = (): AirportListStore[] => {
    const d = localStorage.getItem('airports')
    if (!d){
        localStorage.setItem('airports', JSON.stringify([]))
    }
    return d ? JSON.parse(d) : []
}

export const appendAirport = (airport: AirportListStore) => {
    const d = localStorage.getItem('airports')
    let data: AirportListStore[] = d ? JSON.parse(d) : []
    data = data.filter(i => i.icao !== airport.icao)
    data.unshift(airport)
    localStorage.setItem('airports', JSON.stringify(data))
}

export const deleteAirport = (airport: AirportListStore) => {
    const d = localStorage.getItem('airports')
    let data: AirportListStore[] = d ? JSON.parse(d) : []
    data = data.filter(i => i.id !== airport.id)
    localStorage.setItem('airports', JSON.stringify(data))
    return data
}