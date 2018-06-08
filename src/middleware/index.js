import httpApi from './api_http_dev'
import exception_handler from 'libs/common/middleware/exception_handler'
import globalConfirm from 'libs/common/middleware/global_confirm'
import globalProgress from 'libs/common/middleware/global_progress'
import Auth from 'libs/common/middleware/auth'
import AuthExtra from './auth_extra'
import errCodeMap from '../constants/error_code_map'

import indexedDB from './api_indexed_db'

export default [
    httpApi,
    AuthExtra,
    globalConfirm,
    globalProgress,
    exception_handler(errCodeMap),
]