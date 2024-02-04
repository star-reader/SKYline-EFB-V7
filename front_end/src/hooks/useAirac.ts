import axios from "axios"
import apiUrl from "../config/api/apiUrl"

export default (): Promise<any> => {
    return new Promise((res, rej) => {
        axios.get(apiUrl.airac).then(r => {
            return res(r.data)
        }).catch(() => rej())
    })
}