import pubsub from 'pubsub-js'
import { dataDecrypt } from '../../utils/crypto'

const getShpFile = async(): Promise<EnrouteData> => {
    return new Promise((resolve, reject) => {
        let result: EnrouteData = {
            airports: [],
            vors: [],
            ndbs: [],
            waypoints: [],
            airways: [],
            firs: [],
            grid: []
        }
        const openReq = indexedDB.open('efbdata', Date.now())
        openReq.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            let transaction: IDBTransaction
            try {
                transaction = db.transaction(['airports', 'vors', 'ndbs', 'waypoints', 'airways', 'firs', 'grid', 'airac'], "readonly")
            } catch (error) {
                pubsub.publish('shp-fetch-err', 1)
                return reject()
            }
            
            const _result: EnrouteDataEnc = {
                airports: '',
                vors: '',
                ndbs: '',
                waypoints: '',
                airways: '',
                firs: '',
                grid: '',
                airac: ''
            }
            const objectStoreNames = Object.keys(_result) as (keyof EnrouteDataEnc)[]
            transaction.onerror = () => {
                pubsub.publish('shp-fetch-err', 1)
                reject("Transaction failed")
            }
            objectStoreNames.forEach(storeName => {
                const store = transaction.objectStore(storeName);
                const getRequest = store.getAll()
                getRequest.onsuccess = (event) => {
                    _result[storeName] = (<IDBRequest>event.target).result as string
                }
                getRequest.onerror = () => {
                    pubsub.publish('shp-fetch-err', 1)
                    reject(`Error reading data from ${storeName}`)
                }
            })

            transaction.oncomplete = () => {
                result.airports = JSON.parse(dataDecrypt(_result.airports[0]))
                result.airways = JSON.parse(dataDecrypt(_result.airways[0]))
                result.firs = JSON.parse(dataDecrypt(_result.firs[0]))
                result.grid = JSON.parse(dataDecrypt(_result.grid[0]))
                result.ndbs = JSON.parse(dataDecrypt(_result.ndbs[0]))
                result.vors = JSON.parse(dataDecrypt(_result.vors[0]))
                result.waypoints = JSON.parse(dataDecrypt(_result.waypoints[0]))
                result.airac = JSON.parse((_result.airac as string)[0])
                resolve(result)
            }
        }

        openReq.onerror = () => {
            pubsub.publish('shp-fetch-err', 1)
            reject("Error opening database")
        };
    })
}

export default async (): Promise<EnrouteData | undefined> => {
    return new Promise((res, rej) => {
        getShpFile().then(result => {
            return res(result)
        }).catch(() => rej())
    })
}