export default (form: FieldType) => {
    //高度 数字or FL
    if (form.altitude && form.altitude.toLowerCase().includes('fl')){
        let alt = form.altitude.toLowerCase().replace('fl', '')
        //@ts-ignore
        form.altitude = parseInt(alt)
    }

    if (form.costIndex){
        form.costIndex = parseInt(form.costIndex as any as string)
    }

    if (form.load){
        form.load = parseInt(form.load as any as string)
    }

    if (form.passenger){
        form.passenger = parseInt(form.passenger as any as string)
    }

    if (form.reserve_fuel){
        form.reserve_fuel = parseInt(form.reserve_fuel as any as string)
    }
    return form
}