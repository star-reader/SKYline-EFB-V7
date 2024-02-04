import axios from 'axios'
import pubsub from 'pubsub-js'
import apiUrl from '../../config/api/apiUrl'
import getUserData from '../../utils/auth/getUserData'
import createHeader from '../../utils/createHeader'

const isOwnshipOn = () => {
    const d = localStorage.getItem('ownship')
    if (!d){
        localStorage.setItem('ownship', 'true')
        return true
    }else{
        return d === 'true'
    }
}

const isShowTraffic = () => {
    const d = localStorage.getItem('traffic')
    if (!d){
        localStorage.setItem('traffic', 'false')
        return false
    }else{
        return d === 'true'
    }
}

const getNavlinkData = async (): Promise<NavLink | null> => {
    return new Promise((resolve) => {
        axios.get(apiUrl.navLink,{'headers': createHeader()}).then(res => {
            if (res.data.data){
                resolve(res.data.data)
            }
            resolve(null)
        })
    })
}

export default () => {
    setInterval(() => {
        if (!isOwnshipOn() && !isShowTraffic()) {
            pubsub.publish('server-traffic-data', null)
            pubsub.publish('ownship-data', null)
            return
        }
        axios.get(apiUrl.ownship).then(async res => {
            const data: any[] = res.data.pilotList
            const cid = getUserData()?.Username
            const pilot = data.filter(i => i.cid === cid)

            if (isShowTraffic()){
                //! 修复Ownship飞机与交通网络重复的问题
                pubsub.publish('server-traffic-data', data.filter(i => i.cid !== cid))
            }else{
                pubsub.publish('server-traffic-data', null)
            }
            
            if (isOwnshipOn()){
                if (pilot.length){
                    pubsub.publish('ownship-data', pilot[0])
                }else{
                    // 新增Navlink
                    const d = await getNavlinkData()
                    if (!d){
                        pubsub.publish('navlink-data', null)
                    }else{
                        pubsub.publish('navlink-data', d)
                    }
                }
            }else{
                pubsub.publish('ownship-data', null)
            }
        }).catch(() => {})
    }, 2400)
}