// export const SWFT_URL = 'https://test.swftcoin.com'
const functions = require('firebase-functions');

export const SWFT_defaults: {[key: string]: any} = {
    url: 'https://transfer.swft.pro',
    fee_rate: 0.002,
    source_flag: 'Metaverse',
    developer_id: '',
    user_no: '',
    source_type: 'H5',
    equipment_no: ''
}

export function getSWFTConfig(key: string, defaultValue?: any){
    if (functions.config().swft){
        return functions.config().swft[key] !== undefined ? functions.config().swft[key] : SWFT_defaults[key]
    }
    return SWFT_defaults[key]
}
