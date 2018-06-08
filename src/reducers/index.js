import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import { loadingProgress, alert, confirm } from 'libs/common/reducers/app'
import loginUser from 'libs/common/reducers/login'

import {
    cmdbListGroup,
    cmdbAllData,
    cmdbTagList,
    cmdbTypeList,
    cmdbGroupList,
    cmdbNodeList,
    listCluster
} from './public/serviceCmdb'
import {
    fieldList,
    expressionList
} from './public/serviceXmonitor'

const rootReducer = combineReducers({
    routing: routerReducer,
    loadingProgress,
    alert,
    confirm,
    loginUser,
    
    serviceCmdb:combineReducers({
        cmdbListGroup,
        cmdbAllData,
        cmdbTagList,
        cmdbTypeList,
        cmdbGroupList,
        cmdbNodeList,
        listCluster
    }),

    serviceXmonitor:combineReducers({
        fieldList,
        expressionList
    })
    
})

export default rootReducer