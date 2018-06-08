import * as ActionTypes from 'app/constants/public/serviceCmdbActionTypes'
import * as $s from 'app/components/verify'

export function cmdbListGroup(state = [], action) {
	switch (action.type) {
		case ActionTypes.LIST_GROUP:
			return action.response
		default:
			return state
	}
}

export function cmdbAllData(state = [], action) {
	switch (action.type) {
		case ActionTypes.ALL_DATA:
			return action.response
		default:
			return state
	}
}

export function cmdbTagList(state = [], action) {
	switch (action.type) {
		case ActionTypes.TAG_LIST:
			return action.response.tgs
		default:
			return state
	}
}

export function cmdbTypeList(state = [], action) {
	switch (action.type) {
		case ActionTypes.TYPE_LIST:
			return action.response
		default:
			return state
	}
}

export function cmdbGroupList(state = [], action) {
	switch (action.type) {
		case ActionTypes.GROUP_LIST:
			return $s.isEmptyObject(action.response) ? [] : action.response.groups
		default:
			return state
	}
}

export function cmdbNodeList(state = [], action) {
	switch (action.type) {
		case ActionTypes.NODE_LIST:
			return action.response.nodes
		default:
			return state
	}
}
export function listCluster(state = [], action) {
	switch (action.type) {
		case ActionTypes.LIST_CLUSTER:
			return action.response
		default:
			return state
	}
}
