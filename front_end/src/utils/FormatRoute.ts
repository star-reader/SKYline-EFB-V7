import formatRouteStringCoordinates from "./formatRouteStringCoordinates"

export default (route: string) => {
    //匹配数字的正则表达式
    const num_reg = new RegExp("[0-9]")
    let data = route.replace(' SID ',' ').replace(' STAR ',' ').split(' ')
    //检测是否是起飞机场
    {if (data[0].length == 4 && !num_reg.test(data[0])){
        data.splice(0,1)
    }}
    //检测是否为落地机场
    let leng = data.length -1
    {if (data[leng].length == 4 && !num_reg.test(data[leng])){
        data.splice(leng,1)
    }}
    //检测是否为离场程序
    { let checkPoint = data[0].split('')
        if (num_reg.test(data[0]) && !num_reg.test(checkPoint[checkPoint.length-1])){
            data.splice(0,1)
        }}
    //检测是否为进场程序
    {let leng = data.length -1
    let checkPoint = data[leng].split('')
    if (num_reg.test(data[leng]) && !num_reg.test(checkPoint[checkPoint.length-1])){
        data.splice(leng,1)
    }}
    if (data[data.length -1] === 'DCT'){
        data.splice(data.length -1 ,1)
    }
    return data.join(' ')
}