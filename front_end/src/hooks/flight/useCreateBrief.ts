import axios from 'axios'
import apiUrl from '../../config/api/apiUrl'
import { dataDecrypt } from '../../utils/crypto'
import formatRoute from '../../utils/FormatRoute'
import createHeader from '../../utils/createHeader'
import getUserData from '../../utils/auth/getUserData'
import getUTCString from '../../utils/getUTCString'

export default async (originalRoute: OriginalRoute, form: FieldType, simbrief?:any): Promise<OFP> => {
    return new Promise(async (res, rej) => {
        try {
            if (simbrief){
                const d = simbrief
                try {
                    const ofp: OFP = {
                        'airport': {
                            'dep': [d.origin.pos_long, d.origin.pos_lat],
                            'arr': [d.destination.pos_long, d.destination.pos_lat]
                        },
                        'alternate': {
                            'fuel': 'null',
                            'via': 'null'
                        },
                        'dispatcher': {
                            'cid': 'SKYline',
                            'tel': "+1126354762"
                        },
                        'general': {
                            'air_dist' : d.general.air_distance,
                            'aircraft': d.aircraft.icaocode,
                            'aircraft_reg': d.aircraft.reg,
                            'arrival': d.destination.icao_code,
                            'ci': d.general.costindex,
                            'date': getUTCString(),
                            'departure': d.origin.icao_code,
                            'flightNumber': d.general.icao_airline + d.general.flight_number,
                            'ground_dist': d.general.gc_distance,
                            'utcTime': getUTCString()
                        },
                        'plannedFuel': {
                            'ALTN': d.fuel.alternate_burn,
                            'block_fuel': d.fuel.plan_ramp,
                            'cost_15_min': 0,
                            'extra': d.fuel.extra,
                            'finnal_rev': d.fuel.reserve,
                            'minimum_take_off': d.weights.max_tow,
                            'trip': d.fuel.enroute_burn
                        },
                        'route': originalRoute.route,
                        'weight': {
                            'ZFW': d.weights.est_zfw,
                            'cargo': d.weights.cargo,
                            'fuel': d.fuel.plan_ramp,
                            'landing_max_weight': d.weights.max_ldw,
                            'passenger_number': d.weights.pax_count_actual,
                            'payload': d.weights.payload,
                            'take_off_weight': d.weights.est_tow
                        }
                    }
                    return res(ofp)
                } catch (error) {
                    console.log(`simbrief error !${error}`)
                    return rej()
                }
            }
            else{
                const _data = (await axios.get(apiUrl.aircraftConfig,{'headers': createHeader()})).data
                const ac_data = JSON.parse(dataDecrypt(_data.config))
                let route = ''
                if (form.selfRoute){
                    //有自定义航路
                    route = `${form.departure.toUpperCase()} SID ${formatRoute(originalRoute.route)} STAR ${form.arrival.toUpperCase()}`
                }else{
                    //计算自定义航路
                    // route = await useCalcRoute(form.departure.toUpperCase(),
                    //     form.destination.toUpperCase(), 'h'
                    // )
                }
                const route_distance: number = originalRoute.distance
                //获取日期信息
                const d = new Date()
                const date = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`
                const time = `${d.getUTCHours()}${d.getMinutes()}`
                //计算所需油量
                const targetAc = ac_data.find((i: any) => i.type === form.aircraft)
                let fuel = parseFloat(targetAc.init) + parseFloat(targetAc.each)*route_distance
                if (!form.costIndex){
                    form.costIndex = getRandom(30, 60)
                }
                form.costIndex > 50 ? fuel += (form.costIndex - 50) * 2 : fuel -= (50 - form.costIndex) * 2
                //备用燃油
                if (!form.reserve_fuel){
                    form.reserve_fuel = getRandom(15, 35)
                }
                if (form.reserve_fuel > 100){
                    form.reserve_fuel = 100
                }
                const rev = (form.reserve_fuel / 2) * 98.33
                //payload = passenger + cargo
                if (!form.passenger){
                    form.passenger = getRandom(70, 140)
                }
                if (!form.load){
                    form.load = getRandom(0,4)
                }
                if (form.load > 5){
                    form.load = 5.45
                }
                const payload = (form.passenger * 65 + form.load * 1000)
                //ZWF = ACWeight + payload
                const zwf_weight = parseInt(targetAc.weight) + payload

                return res({
                    'general':{
                        'air_dist' : Math.floor(route_distance),
                        'aircraft': form.aircraft,
                        'aircraft_reg': 'SKY-001',
                        'arrival': form.arrival.toUpperCase(),
                        'ci': form.costIndex,
                        'date': date,
                        'departure': form.departure.toUpperCase(),
                        'flightNumber': form.callsign.toUpperCase(),
                        'ground_dist': Math.floor(route_distance) + 12,
                        'utcTime': time
                    },
                    'dispatcher':{
                        // @ts-ignore
                        'cid': getUserData()?.Username,
                        'tel': '+86 11451409'
                    },
                    'alternate':{
                        'fuel': 'null',
                        'via': 'null'
                    },
                    'plannedFuel':{
                        'ALTN': rev / 2,
                        'block_fuel': Math.ceil(fuel + rev),
                        'cost_15_min': 1800,
                        'extra': 0,
                        'finnal_rev': Math.ceil(rev),
                        'minimum_take_off': targetAc.maxtk,
                        'trip': Math.ceil(fuel)
                    },
                    route,
                    'weight':{
                        'ZFW': zwf_weight,
                        'cargo': form.load,
                        'fuel': Math.ceil(fuel + rev),
                        'landing_max_weight': targetAc.maxld,
                        'passenger_number': form.passenger,
                        'payload': payload,
                        'take_off_weight': targetAc.maxtk
                    },
                    'airport':{
                        // @ts-ignore
                        'dep': originalRoute.route_info[0].coordinate,
                        // @ts-ignore
                        'arr':originalRoute.route_info[
                            originalRoute.route_info.length -1
                        ].coordinate,
                        airport:{
                            dep: form.departure.toUpperCase(),
                            arr: form.arrival.toUpperCase()
                        }
                    }
                })
            }
        } catch (error) {
            return rej(error)
        }
    })
}

function getRandom(min: number, max: number){
    return Math.floor(Math.random() * (max - min) ) + min
}