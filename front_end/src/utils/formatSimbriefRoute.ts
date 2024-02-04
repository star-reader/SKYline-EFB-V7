export default (route: string) => {
    return route.replace('SID DCT', 'SID').replace('DCT STAR', 'STAR').replace(/^DCT /, '').replace(/ DCT$/, '')
}