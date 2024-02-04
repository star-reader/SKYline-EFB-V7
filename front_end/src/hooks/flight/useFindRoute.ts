import axios from 'axios'
import apiUrl from '../../config/api/apiUrl'
import createHeader from '../../utils/createHeader'
import FormatRoute from '../../utils/FormatRoute'

export default (dep: string, arr: string, selfRoute?: string): Promise<OriginalRoute> => {
    return new Promise((res, rej) => {
        const route = selfRoute ? FormatRoute(selfRoute) : ''
        axios.post(selfRoute ? apiUrl.parseSelfRoute : apiUrl.routeFinder, {dep, arr, route},{
            'headers': createHeader()
        }).then(r => {
            if (r.data.code !== 200){
                return rej(null)
            }
            // 数据查询成功
            return res(r.data)
        }).catch(() => {
            return rej(null)
        })
    })
}