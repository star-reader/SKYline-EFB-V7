import axios from 'axios'
import pubsub from 'pubsub-js'
import apiUrl from '../config/api/apiUrl'
import createHeader from './createHeader'
import { dataEncrypt } from './crypto'

export default () => {
    axios.get(apiUrl.points,{'headers': createHeader()}).then(res => {
        if (res.data.code === 200 && res.data.points){
            localStorage.setItem('points', dataEncrypt(`${res.data.points}`))
            if (res.data.points <= 0){
                pubsub.publish('no-point',1)
            }else{
                pubsub.publish('have-point', res.data.points)
            }
        }else{
            pubsub.publish('no-point',1)
            localStorage.setItem('points', dataEncrypt(`0`))
        }
    }).catch(() => {
        pubsub.publish('no-point',1)
        localStorage.setItem('points', dataEncrypt(`0`))
    }
)
}