import { fs} from '@tauri-apps/api'
import { appLocalDataDir } from '@tauri-apps/api/path'

const getAiracFile = async () => {
    try {
      const localDataPath = await appLocalDataDir()
      const shpFolderPath = `${localDataPath}shp\\enroute`
      await fs.createDir(shpFolderPath, { recursive: true })
      try {
        const airacPath = `${shpFolderPath}\\airac.json`
        const [airac] = await Promise.all([
          fs.readTextFile(airacPath)
        ])
        // 读取成功
        return JSON.parse(airac)
      } catch (error) {
        return
      }
    } catch (error) {
        return
    }
}

export default async (): Promise<AIRAC | undefined> => {
    return new Promise((res, rej) => {
        getAiracFile().then(result => {
            return res(result)
        }).catch(() => rej())
    })
}