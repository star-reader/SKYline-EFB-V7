import pubsub from 'pubsub-js'

export default async (d: EnrouteDataEnc):Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const openReq = indexedDB.open('efbdata', Date.now());

        openReq.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            for (const key in d) {
                if (!db.objectStoreNames.contains(key)) {
                    db.createObjectStore(key);
                }
            }
        }

        openReq.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            const missingObjectStores = Object.keys(d).filter(key => !db.objectStoreNames.contains(key));
            if (missingObjectStores.length > 0) {
                console.error(`Missing object stores: ${missingObjectStores.join(', ')}`);
                return;
            }
            const transaction = db.transaction(Object.keys(d), "readwrite");
            transaction.onerror = () => {
                pubsub.publish('save-shp-fail')
                resolve(false);
            }

            transaction.oncomplete = () => {
                pubsub.publish('save-shp-success',1)
                resolve(true);
            }

            for (const key in d) {
                if (d[key as keyof EnrouteDataEnc]){
                    const store = transaction.objectStore(key);
                    store.put(d[key as keyof EnrouteDataEnc], key);
                }
            }
        }

        openReq.onerror = () => {
            pubsub.publish('save-shp-fail')
            reject(new Error("IndexedDB error: " + openReq.error));
        }
    })
}