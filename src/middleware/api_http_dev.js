"use strict";
import callApi from './call_api'
import { CALL_API_HTTP, CALL_API_HTTP_START, CALL_API_HTTP_FAIL } from 'libs/common/constants/api_http'
import { LOGIN } from 'app/constants/loginActionTypes'

export default store => next => action => {
    if (action.type !== CALL_API_HTTP) {
        return next(action)
    }

    let {
        apiActionType,
        basepath = '/',
        endpoint,
        method = 'GET',
        data,
        contentType = "json",
        acceptType = "json",
        acceptTypeOnError = 'json',
        headers,
        connectMode
    } = action
    if (typeof endpoint !== 'string') {
        throw new Error('Specify a string endpoint URL.')
    }
    if (!['object', 'undefined', 'string'].includes(typeof data)) {
        throw new Error('Expected data to be object')
    }

    next(Object.assign(action, { type: CALL_API_HTTP_START }))

    //是否是服务端未捕获的错误
    let options = {
        url: basepath + "/" + endpoint,
        method,
        contentType,
        acceptType: 'text',
        acceptTypeOnError,
        data,
        headers: headers || {},
        connectMode
    }
    if(localStorage.getItem("PARA_ATOKEN") != undefined 
        && localStorage.getItem("PARA_ATOKEN") != null
        && localStorage.getItem("PARA_ATOKEN") != "" ){
            options.headers["PARA_ATOKEN"] = localStorage.getItem("PARA_ATOKEN")
        }

        if(connectMode == "websocket"){
            options.url = "/cmdb/" + endpoint
        }

        return callApi(options)
        .catch(e => {
            next({
                type: CALL_API_HTTP_FAIL,
                apiActionType: apiActionType,
                error: e
            })
            return Promise.reject(e);
        })
        .then(response => {
            if (acceptType == 'json') {
                try {
                    response = JSON.parse(response);
                } catch (error) {}
            }
            next({
                response,
                type: apiActionType
            })
            return response
        })
   
}