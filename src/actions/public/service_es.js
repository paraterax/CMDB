import { ES_BASEPATH } from 'app/constants/api'
import { CALL_API_HTTP } from 'libs/common/constants/api_http'
import asyncActionCreator from 'libs/utils/asyncActionCreator'
import * as ActionTypes from 'app/constants/public/serviceESActionTypes'

//查询ESInfo
export const getESInfo = asyncActionCreator((action, data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.ES_INFO,
	basepath: ES_BASEPATH,
	endpoint: action,
	method: 'post',
	data: data
}))

//查询mysql的ES信息
export const mySqlESInfo = asyncActionCreator((time, hid) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.MYSQL_ES_INFO,
	basepath: ES_BASEPATH,
	endpoint: '1491-mysqlinfo-' + time + '/_search',
	method: 'post',
	data: {
		"query": {
			"bool": {
				"must": [
					{
						"term": {
							"hid.raw": "1498745359124--1210329211"
						}
					}
				],
				"must_not": [],
				"should": []
			}
		},
		"from": 0,
		"size": 1,
		"sort": [{
			"timestamp": "desc"
		}],
		"aggs": {}
	}
}))

//查询tomcat的ES信息
export const tomcatESInfo = asyncActionCreator((time, hid) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.TOMCAT_ES_INFO,
	basepath: ES_BASEPATH,
	endpoint: '1491-tomcatinfo-' + time + '/_search',
	method: 'post',
	data: {
		"query": {
			"bool": {
				"must": [
					{
						"term": {
							"hid.raw": "1498745233096--115572665"
						}
					}
				],
				"must_not": [],
				"should": []
			}
		},
		"from": 0,
		"size": 1,
		"sort": [{
			"timestamp": "desc"
		}],
		"aggs": {}
	}
}))

//查询host的ES信息
export const hostESInfo = asyncActionCreator((time, hid) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.TOMCAT_ES_INFO,
	basepath: ES_BASEPATH,
	endpoint: '1491-sysinfo-sysinfo-' + time + '/_search',
	method: 'post',
	data: {
		"query": {
			"bool": {
				"must": [
					{
						"term": {
							"hostid.raw": hid
						}
					}
				],
				"must_not": [],
				"should": []
			}
		},
		"from": 0,
		"size": 1,
		"sort": [
			{
				"timestamp": "desc"
			}
		],
		"aggs": {}
	}
}))
