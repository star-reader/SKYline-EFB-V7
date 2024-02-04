const getAiracFile = (): Promise<AIRAC> => {
    return new Promise((resolve, reject) => {
        const openReq = indexedDB.open('efbdata', Date.now())
        openReq.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            let transaction:IDBTransaction
            try {
                transaction = db.transaction(['airac'], "readonly")
            } catch (error) {
                return reject()
            }
            
            transaction.onerror = () => {
                reject("Transaction failed")
            }

            const store = transaction.objectStore('airac')
            const getRequest = store.get('airac')

            getRequest.onsuccess = (event) => {
                const airacValue = (event.target as IDBRequest).result as string
                resolve(JSON.parse(airacValue))
            }
            getRequest.onerror = () => {
                reject(`Error reading data from airac`);
            }
        }

        openReq.onerror = () => {
            reject("Error opening database");
        }
    })
}

export default async (): Promise<AIRAC | undefined> => {
    return new Promise((res, rej) => {
        getAiracFile().then(result => {
            return res(result)
        }).catch(() => rej())
    })
}