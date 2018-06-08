"use strict";
/**
 * 异常处理中间件模块
 */
import 'libs/utils/console'
import { alert } from 'libs/common/actions/app'
import { CALL_API_HTTP_FAIL } from 'libs/common/constants/api_http'
import { QUERY, LOGOUT } from 'libs/common/constants/login'

export default exceptionCallback => {
    return store => next => action => {
        return next(action)
    }
}