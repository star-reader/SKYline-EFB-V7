interface JWTPayload {
    client_id: string,
    scopes: string[],
    iss: string,
    cid: string,
    auth: string
}

export {
    JWTPayload
}