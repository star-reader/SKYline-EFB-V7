export default (type: string) => {
    switch (type) {
        case 'airport':
            return '机场'
        case 'navaid':
            return '导航台'
        case 'waypoint':
            return '航路点'
        case 'taxiway':
            return '滑行道'
    
        default:
            return ''
    }
}