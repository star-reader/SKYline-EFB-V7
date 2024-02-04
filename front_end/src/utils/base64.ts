const urlizeBase64 = (base64: string) => {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const unUrlizeBase64 = (urlBase64: string) => {
    return urlBase64.replace(/-/g,'+').replace(/_/g, '/')
}

export {
    urlizeBase64, unUrlizeBase64
}