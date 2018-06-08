import * as dao from './dao'

export function call_api(options){
    
    let { data, endpoint} = options
    let methodName = endpoint.replace(/\//ig,"_")
    return dao[methodName](data)

}