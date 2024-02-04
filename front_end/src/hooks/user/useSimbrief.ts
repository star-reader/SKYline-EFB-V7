export const getSimbriefUser = () => {
    return localStorage.getItem('simbrief')
}

export const setSimbriefUser = (username: string) => {
    localStorage.setItem('simbrief', username)
    return 0
}