import { CALL_API_HTTP, CALL_API_HTTP_START, CALL_API_HTTP_FAIL } from 'libs/common/constants/api_http'
import {call_api} from './indexedDB/call_api'
export default store => next => action => {
    if (action.type !== CALL_API_HTTP) {
        return next(action)
    }
    let options = {
        endpoint: action.endpoint,
        data: action.data
    }
    
    return call_api(options)
    .catch((response={})=>{
        next({
            response,
            type: 'error'
        })
        return Promise.reject(response);
    })
    .then((response={})=>{
        next({
            response,
            type: action.apiActionType
        })
        return response
    })


}