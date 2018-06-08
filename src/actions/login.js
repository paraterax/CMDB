import { CALL_API_HTTP } from 'libs/common/constants/api_http'
import { AS_BASEPATH } from '../constants/api'
import * as ActionTypes from '../constants/loginActionTypes'
import asyncActionCreator from 'libs/utils/asyncActionCreator'

/**
 * 判断是否已经登陆
 * @param {string} email 用户名
 * @param {string} pwd 密码
 */
export const isLogin = asyncActionCreator(() => {
    return {
        type: ActionTypes.IS_LOGIN,
        apiActionType: ActionTypes.IS_LOGIN,        
    }
})

export const login = asyncActionCreator((userName, password) => {
    return {
        type: CALL_API_HTTP,
        apiActionType: ActionTypes.LOGIN,
        basepath: AS_BASEPATH,
        endpoint: 'user/login',
        method: 'POST',
        contentType: 'form',
        data: {
            userName: userName,
            password: password,
        }
    }
})

/**
 * 向userService登出
 */
export const logout = asyncActionCreator(() => ({
    type: CALL_API_HTTP,
    apiActionType: ActionTypes.LOGOUT,
    basepath: AS_BASEPATH,
    endpoint: 'user/logout'
}))


/****
 * 获取token信息
 */
export const token = asyncActionCreator((cluster, where, user_id) => ({
    type: CALL_API_HTTP,
    apiActionType: ActionTypes.TOKEN,
    basepath: AS_BASEPATH,
    endpoint: 'token',
    method: 'POST',
    contentType: 'form',
    acceptType: 'token',
    data: {
        cluster: cluster, // 	是 	指明想获取哪个cluster的token
        where:  where,    // 	否 	可选参数有'COOKIE'，'HEADER'，表明想要在response的哪个部位接受token.'不填'或'其它'则在body中返回token
        user_id: user_id 	
    }
}))