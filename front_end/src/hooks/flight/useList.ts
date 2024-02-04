import axios from 'axios'
import apiUrl from '../../config/api/apiUrl'
import createHeader from '../../utils/createHeader'

export const getFlightList = async (isRefresh?: string): Promise<FieldType[]> => {
    return new Promise((res, rej) => {
        axios.get(`${apiUrl.getFlights}${isRefresh ? `?loadRequire=true` : ``}`,{'headers': createHeader()}).then(r => {
            if (r.data.code !== 200) return rej()
            res(r.data.data)
        }).catch(() => rej())
    })
}

export const appendFlight = async (flight: FieldType) => {
    let d = await getFlightList('ss')
    let data = d.find(i => i.id && i.id === flight.id)
    if (data) return 
    let data2 = d.find(i => i.aircraft === flight.aircraft && i.callsign === flight.callsign && i.departure === flight.departure && i.arrival === flight.arrival)
    if (data2) return
    axios.post(apiUrl.updateFlights,{'flights':flight}, {'headers': createHeader()})
}