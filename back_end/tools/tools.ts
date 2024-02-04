import navaidsType from '../config/navtype/navaids.json'

const getAccessToken = (req: any): string => {
    try {
        return req.headers.authorization.split(' ')[1]
    } catch (error) {
        return ''
    }
}

const checkPayload = (payload: any, params: string[]) => {
    if (!payload) return false
    for (let i of params){
        if (!payload[i]){
            return false
        }
    }
    return true
}

const isSqlSafe = (value: string) => {
    // 正则表达式用于匹配一些常见的SQL注入关键字和特殊字符
    const sqlInjectionRegExp = /('|--|\/\*|\*\/|;|=|<|>|%)/i;
  
    return !sqlInjectionRegExp.test(value);
}

const getSelectionNavType = (type: number) => {
    switch (type) {
        case 1:
            return 'vors'
        case 2:
            return 'vors'
        case 3:
            return 'otherNavids'
        case 4:
            return 'vors'
        case 5:
            return 'ndbs'
        case 7:
            return 'ndbs'
        case 8:
            return 'otherNavids'
        case 9:
            return 'otherNavids'
    
        default:
            return 'otherNavids'
    }
}

const getEnrouteQuery = (type: 'airport' | 'navaid' | 'waypoint', d: any) => {
    switch (type) {
        case 'airport':
            return {
                ...d
            }
        case 'navaid':
            return {
                ...d,
                type: navaidsType[d.Type],
            }
        case 'waypoint':
            return {
                ...d,
                self: d.self ? [d.self_latitude, d.self_longitude] : null
            }
    
        default:
            return {}
    }
}

const parseRunway = (data: any) => {
    const result: any[] = []
    for (let d of data){
        if (d.ident && d.valid) result.push({...d})
    }
    return result
}

const parseDate = (date: string) => {
    try {
        const month = {
            JAN: '01',
            FEB: '02',
            MAR: '03',
            APR: '04',
            MAY: '05',
            JUN: '06',
            JUL: '07',
            AUG: '08',
            SEP: '09',
            OCT: '10',
            NOV: '11',
            DEC: '12'
          }
        const [day, mon, time, year] = date.trim().split(' ')
        const result = `${year}-${month[mon as keyof object]}-${day} ${time}`
        return result.includes('undefined') ? '' : result.replace(/\n/g,'').replace(/\\n/g,'')
    } catch (error) {
        return ''
    }
        
}

const urlizeBase64 = (base64: string) => {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const unUrlizeBase64 = (urlBase64: string) => {
    return urlBase64.replace(/-/g,'+').replace(/_/g, '/')
}

const getRandomString = (length: number) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789_abcdefghijklmnopqrstuvwxyz"
    let result = ""
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        result += characters.charAt(randomIndex)
    }
    return result
}

const getWptType = (name: string) => {
    const numReg = /\d/g
    if (name.length === 4){
        return 'airport'
    }else if (name.length === 3 && !numReg.test(name)){
        return 'vor'
    }else if (name.length === 2 && !numReg.test(name)){
        return 'ndb'
    }else{
        return 'waypoint'
    }
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const earthRadiusInNauticalMiles = 3440.065;
    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);
    const deltaLat = lat2Rad - lat1Rad;
    const deltaLon = lon2Rad - lon1Rad;
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInNauticalMiles = earthRadiusInNauticalMiles * c;
    return distanceInNauticalMiles;
}

const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
}

const getAppType = (name: string) => {
    return name && name.includes(' RWY ') ? name.slice(0, 4) : name
}



export {
    getAccessToken , checkPayload , isSqlSafe, getSelectionNavType,
    getEnrouteQuery , parseDate , urlizeBase64 , getRandomString,
    unUrlizeBase64 , getWptType , parseRunway , calculateDistance , 
    toRadians , getAppType
}