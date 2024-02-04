import { fs} from '@tauri-apps/api'
import { appLocalDataDir } from '@tauri-apps/api/path'
import pubsub from 'pubsub-js'
import { dataDecrypt } from '../../utils/crypto'

const getShpFile = async () => {
    let result: EnrouteData = {
        airports: [],
        vors: [],
        ndbs: [],
        waypoints: [],
        airways: [],
        firs: [],
        grid: []
    }
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
        const [airports, airways, fir, grid, ndbs, vors, waypoints, airac] = await Promise.all([
          fs.readTextFile(airportsPath),
          fs.readTextFile(airwaysPath),
          fs.readTextFile(firPath),
          fs.readTextFile(gridPath),
          fs.readTextFile(ndbsPath),
          fs.readTextFile(vorsPath),
          fs.readTextFile(waypointsPath),
          fs.readTextFile(airacPath)
        ])
  
        // 读取成功
        result.airports = JSON.parse(dataDecrypt(airports))
        result.airways = JSON.parse(dataDecrypt(airways))
        result.firs = JSON.parse(dataDecrypt(fir))
        result.grid = JSON.parse(dataDecrypt(grid))
        result.ndbs = JSON.parse(dataDecrypt(ndbs))
        result.vors = JSON.parse(dataDecrypt(vors))
        result.waypoints = JSON.parse(dataDecrypt(waypoints))
        result.airac = JSON.parse(airac)
        return result
      } catch (error) {
        pubsub.publish('shp-fetch-err', 1)
      }
    } catch (error) {
        pubsub.publish('shp-fetch-err', 1)
    }
  }

export default async (): Promise<EnrouteData | undefined> => {
    return new Promise((res, rej) => {
        getShpFile().then(result => {
            return res(result)
        }).catch(() => rej())
    })
}