export default (aircraft: string) => {
    let d = aircraft.split('/')
    return d.length === 1 ? aircraft : d[1]
}