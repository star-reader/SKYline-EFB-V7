import { fs} from '@tauri-apps/api'
import pubsub from 'pubsub-js'
import { appLocalDataDir } from '@tauri-apps/api/path'

export default async (d: EnrouteDataEnc) => {
    try {
        const localDataPath = await appLocalDataDir()
        const shpFolderPath = `${localDataPath}shp\\enroute`
        await fs.createDir(shpFolderPath, { recursive: true })
        try {
            const airportsPath = `${shpFolderPath}\\airports.db`
            const airwaysPath = `${shpFolderPath}\\airways.db`
            const firPath = `${shpFolderPath}\\fir.db`
            const gridPath = `${shpFolderPath}\\grid.db`
            const ndbsPath = `${shpFolderPath}\\ndbs.db`
            const vorsPath = `${shpFolderPath}\\vors.db`
            const waypointsPath = `${shpFolderPath}\\waypoints.db`
            const airacPath = `${shpFolderPath}\\airac.json`
            await Promise.all([
                fs.writeTextFile(airportsPath, d.airports),
                fs.writeTextFile(airwaysPath, d.airways),
                fs.writeTextFile(firPath, d.firs),
                fs.writeTextFile(gridPath, d.grid),
                fs.writeTextFile(ndbsPath, d.ndbs),
                fs.writeTextFile(vorsPath, d.vors),
                fs.writeTextFile(waypointsPath, d.waypoints),
                fs.writeTextFile(airacPath, d.airac ? d.airac : '')
            ])
            return pubsub.publish('save-shp-success',1)
        } catch (error) {
            console.error(error)
            return pubsub.publish('save-shp-fail')
        }
    } catch (error) {
        return pubsub.publish('save-shp-fail')
    }
}