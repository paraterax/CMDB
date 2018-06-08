import { XMONITOR_BASEPATH, CALL_API_INDEXED_DB } from 'app/constants/api'
import { CALL_API_HTTP } from 'libs/common/constants/api_http'
import asyncActionCreator from 'libs/utils/asyncActionCreator'
import * as ActionTypes from 'app/constants/public/serviceXmonitorActionTypes'

//根据节点查询告警规则
export const findRuleByNid = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.WARN_RULE_NODE,
	basepath: XMONITOR_BASEPATH,
	contentType: "form",
	endpoint: 'warning/rule/find/node',
	method: 'post',
	data: data
}))

//获取所有告警规则
export const findRuleList = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.WARN_RULE_LIST,
	basepath: XMONITOR_BASEPATH,
	endpoint: 'warning/rule/page/list/tag',
	method: 'post',
	data: {
		page_no: 0,
		page_size: 10000
	}
}))

//绑定规则
export const saveRule = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.SAVE_RULE,
	basepath: XMONITOR_BASEPATH,
	endpoint: 'warning/rule/pair/save',
	method: 'post',
	data: data
}))

//根据节点id查询故障信息
export const alarmByNid = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.ALARM_LIST_BY_NODE,
	basepath: XMONITOR_BASEPATH,
	endpoint: 'alarm/with/analyze/list/by/node',
	contentType: "form",
	method: 'post',
	data: data
}))

//根据tag查询告警规则
export const findRuleByTag = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.FIND_RULE_TAG,
	basepath: XMONITOR_BASEPATH,
	endpoint: 'warning/rule/find/tag',
	contentType: "form",
	method: 'post',
	data: data
}))

//根据节点id解绑故障规则
export const unbindRule = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.UN_BIND_RULE,
	basepath: XMONITOR_BASEPATH,
	endpoint: 'warning/rule/node/unbind',
	contentType: "form",
	method: 'post',
	data: data
}))

//根据故障规则id获取规则信息
export const findRuleById = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.FIND_RULE_BY_ID,
	basepath: XMONITOR_BASEPATH,
	endpoint: 'warning/rule/find',
	contentType: "form",
	method: 'post',
	data: data
}))

//绑定故障规则
export const bindRule = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.BIND_RULE,
	basepath: XMONITOR_BASEPATH,
	endpoint: 'warning/rule/node/bind',
	contentType: "form",
	method: 'post',
	data: data
}))

//根据节点类型获取规则
export const getRuleListByType = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.RULE_LIST_BY_TYPE,
	basepath: XMONITOR_BASEPATH,
	endpoint: 'warning/rule/list/by/type',
	contentType: "form",
	method: 'post',
	data: data
}));

//单个节点绑定
export const bindNodes = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.BIND_NODES,
	basepath: XMONITOR_BASEPATH,
	endpoint: 'warning/rule/bind/nodes',
	method: 'post',
	data: data
}));

export const fieldList = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.FIELD_LIST,
	basepath: XMONITOR_BASEPATH,
	endpoint: 'warning/rule/field/list',
	method: 'post',
	data: data
}));

export const expressionList = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.EXPRESSION_LIST,
	basepath: XMONITOR_BASEPATH,
	endpoint: 'warning/rule/expression/list',
	method: 'post',
	data: data
}));


export const unbindNode = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.UNBIND_NODE,
	basepath: XMONITOR_BASEPATH,
	endpoint: 'warning/rule/unbind/with/node',
	method: 'post',
	contentType: "form",
	data: data
}));
//根据节点id查询自己的硬件故障信息
export const assetInfoByNid = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.ASSET_INFO_NODE,
	basepath: XMONITOR_BASEPATH,
	endpoint: 'alarm/nasset/by/node',
	contentType: "form",
	method: 'post',
	data: data
}))
export const assetInfoByNids = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.ASSET_INFO_NODES,
	basepath: XMONITOR_BASEPATH,
	endpoint: '/alarm/with/analyze/list/by/node',
	contentType: "form",
	method: 'post',
	data: data
}))

