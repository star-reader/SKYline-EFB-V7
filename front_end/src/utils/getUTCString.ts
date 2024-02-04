export default () => {
    let now = new Date();
    let year = now.getUTCFullYear();
    let month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
    let day = now.getUTCDate().toString().padStart(2, '0');
    let hours = now.getUTCHours().toString().padStart(2, '0');
    let minutes = now.getUTCMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}