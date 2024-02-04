export default (procedure: string, runway: string) => {
    return procedure.replace(/\d+/g, '') + runway
}