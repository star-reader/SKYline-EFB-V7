export default () => {
    const token = localStorage.getItem('access_token')
    return {
        'authorization': 'Bearer ' + token
    }
}