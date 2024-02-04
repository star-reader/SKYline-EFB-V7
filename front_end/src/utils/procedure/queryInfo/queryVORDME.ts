import axios from 'axios'
import apiUrl from '../../../config/api/apiUrl'
import createHeader from '../../createHeader'

export default async (ident: string): Promise<QueryNavaid[]> => {
    return new Promise((res, rej) => {
        axios.post(apiUrl.enrouteQuery,{"type": "navaid","ident": ident},
        {'headers': createHeader()}).then(r => {
            if (r.data.code === 200){
                res(r.data.data)
            }else{
                rej()
            }
        }).catch(() => rej())
    })
}