export default (length: number) => {
    const characters = "/ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789_abcdefghijklmnopqrstuvwxyz+"
    let result = ""
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        result += characters.charAt(randomIndex)
    }
    return result
}