export default () => {
    const width = document.body.clientWidth
    if (width > 700){
        document.getElementById('app')?.setAttribute('device', 'pc')
    }else{
        document.getElementById('app')?.setAttribute('device', 'phone')
    }
}