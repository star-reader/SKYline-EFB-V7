export default (metar: string) => {
    if (metar.includes(' RA ') || metar.includes(' SHRA ') ||
    metar.includes(' -RA ') || metar.includes(' +RA ') || 
    metar.includes(' -SHRA ') || metar.includes(' +SHRA ')){
        return 'rain'
    }
    if (metar.includes(' SN ') || metar.includes(' SHSN ') ||
    metar.includes(' -SN ') || metar.includes(' +SN ') || 
    metar.includes(' -SHSN ') || metar.includes(' +SHSN ')){
        return 'snow'
    }
    if (metar.includes(' BR ') || metar.includes(' FG ') ||
    metar.includes(' -BR ') || metar.includes(' +BR ') || 
    metar.includes(' -FG ') || metar.includes(' +FG ')){
        return 'fog'
    }
    if (metar.includes('CAVOK')){
        return 'clear'
    }
    return 'other'
}