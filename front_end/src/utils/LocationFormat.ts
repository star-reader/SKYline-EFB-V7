export default function(lat: number, lng: number): string {
    let lat_fen = Math.abs(lat%1*60)
    let lat_miao = Math.abs(lat_fen%1*60).toFixed(0)
    let lng_fen = Math.abs(lng%1*60)
    let lng_miao = Math.abs(lng_fen%1*60).toFixed(0)
    let lat_pre = lat >= 0 ? 'N' : 'S'
    let lng_pre = lng >=0 ? 'E' : 'W'
    return `${lat_pre}${Math.abs(lat).toFixed(0)}°${lat_fen.toFixed(0)}'${lat_miao}" ${lng_pre}${Math.abs(lng).toFixed(0)}°${lng_fen.toFixed(0)}'${lng_miao}"` 
}