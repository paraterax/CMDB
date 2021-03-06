import { CALL_API_HTTP, USER_SERVICE_BASEPATH } from '../constants/api_http'
import * as ActionTypes from '../constants/login'
import SparkMD5 from 'spark-md5';

/**
 * 向userService登录
 * @param {string} email 用户名
 * @param {string} pwd 密码
 */
export const login = (email, pwd) => {
    var isPhoneNum = /^1[0-9]{10}$/
    var data = {
        token_type: 'COOKIE',
        cookie_type: 'WAL',
        password: SparkMD5.hash(pwd)
    }
    if (isPhoneNum.test(email)) {
        data.third_party = 'NMPHONE'
        data.phone = email
    } else {
        data.third_party = 'SELF'
        data.email = encodeURIComponent(email)
    }
    return {
        type: CALL_API_HTTP,
        apiActionType: ActionTypes.LOGIN,
        basepath: USER_SERVICE_BASEPATH,
        endpoint: 'login',
        method: 'POST',
        contentType: 'form',
        data: data
    }
}

/**
 * 向userService登出
 */
export const logout = () => ({
    type: CALL_API_HTTP,
    apiActionType: ActionTypes.LOGOUT,
    basepath: USER_SERVICE_BASEPATH,
    endpoint: 'logout',
    data: {
        token_type: 'COOKIE'
    }
})

/**
 * 向userService查询用户
 */
export const query = () => ({
    type: CALL_API_HTTP,
    apiActionType: ActionTypes.QUERY,
    basepath: USER_SERVICE_BASEPATH,
    endpoint: 'query',
    data: {
        token_type: 'COOKIE',
        winfo: true
    }
})