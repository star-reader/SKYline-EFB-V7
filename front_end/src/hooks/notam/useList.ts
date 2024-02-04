export const getNOTAMList = (): NOTAMListStore[] => {
    const d = localStorage.getItem('notam')
    if (!d){
        localStorage.setItem('notam', JSON.stringify([]))
    }
    return d ? JSON.parse(d) : []
}

export const appendNOTAM = (notam: NOTAMListStore) => {
    const d = localStorage.getItem('notam')
    let data: NOTAMListStore[] = d ? JSON.parse(d) : []
    data = data.filter(i => i.icao !== notam.icao)
    data.unshift(notam)
    localStorage.setItem('notam', JSON.stringify(data))
}

export const deleteNOTAM = (notam: NOTAMListStore) => {
    const d = localStorage.getItem('notam')
    let data: NOTAMListStore[] = d ? JSON.parse(d) : []
    data = data.filter(i => i.id !== notam.id)
    localStorage.setItem('notam', JSON.stringify(data))
    return data
}