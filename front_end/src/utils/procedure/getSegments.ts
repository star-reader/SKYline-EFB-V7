import { dataDecrypt } from "../crypto"

/**根据程序生成坐标序列 */
export default (proc: string[], startPoint: number[], endPoint: number[], type?: string) => {
    const coords: number[][] = []
    if (startPoint && type !== 'app'){
        coords.push(startPoint)
    }
    for (let i = 0; i < proc.length; i++){
        let d = dataDecrypt(proc[i]).split(',')  // csv格式因为编码问题最后一行的/n可以省略
        let latitude = 0
        let longitude = 0
        try {
            if (d[8]) latitude = parseFloat(d[8])
            if (d[9]) longitude = parseFloat(d[9])
        } catch (error) {
            continue
        }
        if (latitude && longitude && Math.abs(latitude - startPoint[0]) < 1 && Math.abs(longitude - startPoint[0]) < 1){
            coords.push([longitude, latitude])
        }
    }
    if (endPoint){
        coords.push(endPoint)
    }
    return coords
}