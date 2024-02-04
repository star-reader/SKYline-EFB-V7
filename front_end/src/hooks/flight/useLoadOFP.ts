import pubsub from 'pubsub-js'
import useFindRoute from './useFindRoute'
import useCreateBrief from './useCreateBrief'
import formatOFPType from '../../utils/formatOFPType'
import formatSimbriefRoute from '../../utils/formatSimbriefRoute'

export default async (value: FieldType, simbrief?: any) => {
    try {
        let route = await useFindRoute(value.departure.toUpperCase(), value.arrival.toUpperCase(), 
            simbrief ? formatSimbriefRoute(simbrief.general.route) : value.selfRoute)
        let ofp: OFP
        try {
            ofp = await useCreateBrief(route, formatOFPType(value), simbrief)
            pubsub.publish('append-flight-list', value)
            return pubsub.publish('detail-flight-load',{
                'OFP': ofp,
                route,
                'procedure':{
                    'departure':{
                        airport: '',
                        ident: '',
                        procedure: '',
                        transition: '',
                        geojson: ''
                    },
                    'arrival':{
                        airport: '',
                        ident: '',
                        procedure: '',
                        transition: '',
                        geojson: ''
                    },
                    'approach':{
                        airport: '',
                        ident: '',
                        procedure: '',
                        runway: '',
                        transition: '',
                        geojson: ''
                    }
                }
            })
        } catch (error) {
            // 触发failed加载失败事件3
            pubsub.publish('load-flight-failed',0)
        }
    } catch (error) {
        pubsub.publish('load-flight-failed',0)
    }
}