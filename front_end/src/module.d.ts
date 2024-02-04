declare module '*.json'
declare module '*.js'

// declare namespace JSX {
//     interface IntrinsicElements {
//         [elemName: string]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
//     }
// }
  

type UserInter = 'ifrh' | 'ifrl' | 'vfr' | 'world-map' | 'world-satellite'

type EnrouteData =  {
    airports: any[][],
    vors: any[][],
    ndbs: any[][],
    waypoints: any[][],
    airways: any[][],
    firs: any,
    grid: any,
    airac?: string
}

type EnrouteDataEnc = {
    airports: string,
    vors: string,
    ndbs: string,
    waypoints: string,
    airways: string,
    firs: string,
    grid: string,
    airac?: string
}

type GeoJSONItem =  {
    type: string,
    properties: any,
    geometry: {
        "type": string,
        "coordinates": any[]
    }
}
type GeoJSON = {
    type: string,
    features: GeoJSONItem[]
}

//航路图右键搜索内容，匹配数据库
type QueryAirport = {
    "name": string,
    "icao": string,
    "location": {
        "latitude": number,
        "longtitude": number
    },
    "elevation": number,
    "transition_altitude": number,
    "transition_level": number,
    "speed_limit": number,
    "speed_limit_altitude": number
}

type QueryNavaid = {
    "name": string,
    "ident": string,
    "type": string,
    "location": {
        "latitude": number,
        "longtitude": number
    },
    "usage"?: string,
    "elevation"?: number,
    "magnetic_var"?: number,
    "range"?: number
}

type QueryWaypoint = {
    "name": string,
    "ident": string,
    "location": {
        "latitude": number,
        "longtitude": number
    }
}

type QueryTaxiway = {
    "name": string,
    "coordinates": number[]
}

type QueryAirway = {
    'ident': string,
    'lnglats': number[][],
    'start': string,
    'end': string
}

type QueryPubsubEvent = {
    type: 'airport' | 'navaid' | 'waypoint' | 'taxiway',
    data: {"key": string, "value": any}[],
    coord: any,
    ident: string
}

type EnrouteSearch = {
    airports: QueryAirport[],
    vors: QueryNavaid[],
    ndbs: QueryNavaid[],
    waypoints: QueryWaypoint[],
    otherNavids: QueryNavaid[]
}

type SearchResult = {
    airports: QueryAirport[],
    vors: QueryNavaid[],
    ndbs: QueryNavaid[],
    waypoints: QueryWaypoint[],
    otherNavids: QueryNavaid[],
    airways: QueryAirway[]
}

type WeatherListStore = {
    id: string;
    icao: string,
    date: string,
    weather: 'clear' | 'rain' | 'snow' | 'fog' | 'other'
}

type WeatherInfo = {
    airport_info: string,
    forecast_text: string,
    metar: string,
    taf: string
}

type NOTAMListStore = {
    id: string,
    icao: string,
    date: string
}

type NOTAMInfo = {
    id: string,
    title: string,
    data: string,
    created_at: string,
    effective_at: string,
    expire_at: string
}

type FlightListStore = {
    id: string,
    callsign: string,
    departure: string,
    arrival: string,
    date: string
}

type AirportListStore = {
    id: string,
    icao: string,
    name: string,
    date: string
}

type JeppesenChartList = {
    airport_icao: string,
    chart_id: number,
    ident: string,
    chart_hash_token: string,
    chart_name: string,
    chart_type: string,
    airport_chart_id: number
}

type AIPChartList = {
    display_name: string,
    file_id: number,
    token: string
}

type CommunicationList = {
    type: string,
    frequency: string,
    usage: string,
    callsign: string,
    display_coord: [number, number]
}

type OriginalRouteItem = {
    ident: string,
    coordinate: number[],
    type: string
}

/** 从服务器获取的航路格式 */
type OriginalRoute =  {
    route: string,
    route_info: OriginalRouteItem[],
    distance: number
}

/** OFP数据 */
type OFP = {
    'general':{
        'air_dist' : number,
        'aircraft': string,
        'aircraft_reg': string,
        'arrival': string,
        'ci': number,
        'date': string,
        'departure': string,
        'flightNumber': string,
        'ground_dist': number,
        'utcTime': string
    },
    'dispatcher':{
        'cid': string,
        'tel': string
    },
    'alternate':{
        'fuel': string,
        'via': string
    },
    'plannedFuel':{
        'ALTN': number,
        'block_fuel': number,
        'cost_15_min': string | number,
        'extra': number,
        'finnal_rev': number,
        'minimum_take_off': number,
        'trip': number
    },
    'route':string,
    'weight':{
        'ZFW': number,
        'cargo': number,
        'fuel': number,
        'landing_max_weight': number,
        'passenger_number': number,
        'payload': number,
        'take_off_weight': number
    },
    'airport':{
        'dep':[
            number, number
        ],
        'arr':[
            number, number
        ],
        'airport'?:{
            'dep': string,
            'arr': string
        }
    }
}

type FieldType = {
    id?: string,
    date?: string,
    callsign: string;
    departure: string;
    arrival: string;
    aircraft: string;
    departureTime?: string;
    costIndex?: number;
    altitude?: string;
    passenger?: number;
    load?: number;
    selfRoute?: string;
    reserve_fuel?: number,
    simbrief?: any
}

type CustomWaypointForm = {
    ident: string,
    type: string,
    frequency?: string,
    name?: string
}

interface LoadFlight {
    OFP: OFP,
    route: OriginalRoute,
    procedure: {
        departure: SIDSTARS,
        arrival: SIDSTARS,
        approach: APPS
    }
}

type SIDSTARS = {
    type: 'SID' | 'STAR',
    airport: string,
    ident: string,
    procedure: string,
    transition: string,
    runway:string,
    endPoint: string,
    segments: string[]
}

type APPS = {
    airport: string,
    ident: string,
    procedure: string,
    runway: string,
    transition: string,
    segments: string[],
    final_segments: string[]
}

type Runway = {
    ident: string,
    heading: number,
    length: number,
    width: number,
    location: [number, number],
    elevation: number
}

type FormattedRouteItem = {
    ident: string,
    coordinate?: number[],
    type: string
}

type ParsedWeather = {
    qnh: string,
    wind: string,
    type: string,
    temp: string
}

type TrafficData = {
    "callsign": string,
    "aircraft": string,
    "altitude": number,
    "cid": string,
    "heading": number,
    "squawk": number,
    "speed": number,
    "lnglat": number[],
    "departure": string,
    "arrival": string
}

type LoginForm = {
    username: string,
    password: string,
    time: number | string
}

type UserData = {
    "Username": string,
    "Email": string,
    "Level": number,
    "AuthorizeType": string,
    "AuthContent": string,
    "AuthSubString":string,
    "QQ": number,
    "Introduce": string,
    "Pilottime": number,
    "Lastflight": string,
    "ATCTIME": number,
    "LastATC": string,
    "IsVerified": boolean,
    "AllowedNotify": boolean
}

type RunwayList = {
    ident: string,
    heading: number,
    location: number[],
    length: number,
    width: number,
    elevation: number
}

type SimbriefForm = {
    username: string
}

type AIRAC = {
    "id": string,
    "cycle": string,
    "cycle_display": string,
    "cycle_parse": number,
    "update_info": string,
    "charts_available": string[],
    "enroute_available": string,
    "critical": string[],
    "effective": string,
    "expire": string
}

type NavLink = {
	"altitude": number,
	"bank": number,
	"groundspeed": number,
	"heading": number,
	"latitude": number,
	"longitude": number,
	"pitch": number,
	"time": number,
	"transponder": "2000"
}

type Coordinate = {
    latitude: number;
    longitude: number;
}

type WindComponents = {
    headWind: number | 'var',
    crossWind: number | 'var'
}