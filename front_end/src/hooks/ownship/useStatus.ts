const isShowOwnshipData = (data: 'traffic' | 'ownship' | 'tracker', defaultStatus?: string) => {
    const d = localStorage.getItem(data)
    if (!d){
        localStorage.setItem(data, defaultStatus ? defaultStatus : 'true')
        return defaultStatus
    }else{
        return d === 'true'
    }
}

export default isShowOwnshipData