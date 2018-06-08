import * as ActionTypes from 'app/constants/public/serviceXmonitorActionTypes'

export function fieldList(state = [], action) {
	switch (action.type) {
		case ActionTypes.FIELD_LIST:
			return action.response
		default:
			return state
	}
}

export function expressionList(state = [], action) {
	switch (action.type) {
		case ActionTypes.EXPRESSION_LIST:
			return action.response
		default:
			return state
	}
}