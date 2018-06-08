"use strict";
/**
 * 登录后的一些额外处理。
 */
import callApi from 'libs/utils/call_api';
import { CALL_API_HTTP, CALL_API_HTTP_START, CALL_API_HTTP_FAIL } from 'libs/common/constants/api_http';
import {LOGIN } from 'libs/common/constants/login';
import {IS_LOGIN } from 'app/constants/loginActionTypes';
import { alert as _alert } from 'libs/common/actions/app'
import { AS_BASEPATH } from '../constants/api';

export default store => next => action => {
    if (action.type == LOGIN) {
        var response = action.response;
        var dispatch = store.dispatch;
        if(response.ret){
            localStorage.setItem("loginUser", JSON.stringify(response));
            localStorage.setItem("PARA_ATOKEN", response.atoken);
            location.hash = '#/cmdb/topology';
        }else{
            dispatch(_alert("用户名或密码错误，请重新输入！","warning"));
        }
    }else if(action.type == IS_LOGIN){
        const {PARA_ATOKEN,loginUser} = window.localStorage
        if(PARA_ATOKEN&&loginUser&&loginUser!=''&&loginUser!=''){
            try{
            let user=JSON.parse(loginUser)
            location.hash = '#/cmdb/topology';
            }catch(e){
                 
            }
        }
    }

    return next(action);
}