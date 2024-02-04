export default (route: OriginalRoute) => {
    const routeString = route.route
    const routeCat = routeString.split(' ')
    const final: FormattedRouteItem[] = []
    const routeCollection = route.route_info

    //添加机场和SID
    final.push(route.route_info[0])
    final.push({
        ident: 'SID',
        type: 'sid'
    })

    //确定最新所在航路的航路点数组下标为lastIndex
    let lastIndex = 0
    for (let i = 0; i < routeCollection.length; i++){
        const d = routeCollection[i]
        if (d.type === 'airport') continue
        if (routeCat.includes(d.ident)){
            //是航段起始航路点
            //如果是第一段，则此时lastIndex为0，不需要更新前一段的航线。否则追加上一段的航线
            const index = routeCat.findIndex(i => i === d.ident)
            if (lastIndex && lastIndex !== -1){
                final.push({
                    ident: routeCat[lastIndex + 1],
                    type: 'awy'
                })
            }
            final.push(d)
            lastIndex = index
        }else{
            // 追加航路点前先追加航路信息，下标为i + 1
            final.push({
                ident: routeCat[lastIndex + 1],
                type: 'awy'
            })
            final.push(d)
        }
    }

    // 追加进场和机场信息
    final.push({
        ident: 'STAR',
        type: 'star'
    })
    final.push(routeCollection[routeCollection.length - 1])

    return final
}