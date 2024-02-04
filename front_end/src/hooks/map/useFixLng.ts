export default function(line: number[][]) {
    // for (let i = 0; i < line.length -1; i++){
    //     const startLng = line[i][0]
    //     const endLng = line[i + 1][0]

    //     if (endLng - startLng >= 180) {
    //         line[i + 1][0] -= 360
    //     } else if (endLng - startLng <= -180) {
    //         line[i + 1][0] += 360
    //     }
    // }
    // return line
    if (!line || !line[0] || !line[0][0]){
        return []
    }
    let lstLonDiff = [];
    for (let i = 0; i < line.length - 1; i++) {
        let detLon = line[i + 1][0] - line[i][0];
        //如果超过180度
        if (Math.abs(detLon) > 180) {
            //from east to west
            if (detLon > 0) {
                detLon -= 360;
            }
            //from west to east
            else {
                detLon += 360;
            }
        }
        lstLonDiff.push(detLon);
    }
    //如果起始点是负半球，整体向右移动360度,如果是正半球，就保持不动
    if (line[0][0] < 0)
        line[0][0] += 360;
    for (let i = 0; i < line.length - 1; i++) {
        //从上一个点上加上经差，把航线内存数据，重新赋值
        line[i + 1][0] = line[i][0] + lstLonDiff[i];
    }
    return line as number[][]
}