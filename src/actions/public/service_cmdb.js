import { CMDB_BASEPATH, CMDB_PATH_OTHER, CALL_API_INDEXED_DB } from 'app/constants/api'
import { CALL_API_HTTP } from 'libs/common/constants/api_http'
import asyncActionCreator from 'libs/utils/asyncActionCreator'
import * as ActionTypes from 'app/constants/public/serviceCmdbActionTypes'

//验证ip
export const ipCheck = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.IP_CHECK,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/ip/check',
	method: 'post',
	data: data

}))

//添加节点
export const addNode = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.ADD_NODE,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/save',
	method: 'post',
	data: data

}))

//添加节点与节点之间的依赖关系
export const addNodeRelation = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_RELATION_ADD,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/relation/add',
	method: 'post',
	data: data
}))

//添加组
export const addGroup = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.ADD_GROUP,
	basepath: CMDB_BASEPATH,
	endpoint: 'group/save',
	method: 'post',
	data: data
}))

//节点组列表
export const listGroup = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.LIST_GROUP,
	basepath: CMDB_BASEPATH,
	endpoint: 'group/list',
	method: 'post',
	data: data,
	connectMode: "websocket"
}))

// 选择集群列表
export const listCluster = asyncActionCreator(() => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.LIST_CLUSTER,
	basepath: CMDB_PATH_OTHER,
	endpoint: 'cluster/info',
	method: 'post'
}))

// 根据ip获取cid、hid
export const getCid = asyncActionCreator((ip) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.LIST_CID,
	basepath: CMDB_PATH_OTHER,
	endpoint: 'nasset/cluster/byip',
	method: 'post',
	contentType: "form",
	data: {
		ip: ip //ip
	}
}))

//通过id查询节点详情
export const nodeDetail = asyncActionCreator((nid) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_DETAIL,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/detail',
	method: 'post',
	data: {
		nid
	}
}))
//通过id查询组的详细信息 ???
export const groupDetail = asyncActionCreator((gid) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.GROUP_DETAIL,
	basepath: CMDB_BASEPATH,
	endpoint: 'group/detail',
	method: 'post',
	data: {
		gid
	}
}))

//获取所有标签列表
export const tagList = asyncActionCreator(() => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.TAG_LIST,
	basepath: CMDB_BASEPATH,
	endpoint: 'tag/list',
	method: 'post',
	connectMode: "websocket"
}))

//获取所有节点类型
export const typeList = asyncActionCreator(() => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.TYPE_LIST,
	basepath: CMDB_BASEPATH,
	endpoint: 'type/list',
	method: 'post',
	connectMode: "websocket"

}))

//获取所有节点组的列表
export const groupList = asyncActionCreator(() => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.GROUP_LIST,
	basepath: CMDB_BASEPATH,
	endpoint: 'group/list',
	method: 'post'

}))



//7.按条件查询节点和节点组的信息  该方法的地址待定
export const getAllData = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.ALL_DATA,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/query',
	method: 'post',
	data: data
}))


//获取所有节点的列表
export const nodeList = asyncActionCreator(() => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_LIST,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/query',
	method: 'post',
	data: {},
	connectMode: "websocket"

}))

// 9.移动节点，并保存单个节点.
export const saveNodeData = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_MOVE,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/move',
	method: 'post',
	data: data
	, connectMode: "websocket"

}));
//移动组
export const saveGroupData = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.GROUP_MOVE,
	basepath: CMDB_BASEPATH,
	endpoint: 'group/move',
	method: 'post',
	data: data,
	connectMode: "websocket"

}));

//删除节点组
export const delGroup = asyncActionCreator((gid) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.DELETE_GROUP,
	basepath: CMDB_BASEPATH,
	endpoint: 'group/del',
	method: 'post',
	data: {
		gid: gid
	},
	connectMode: "websocket"

}));

//删除节点
export const delNode = asyncActionCreator((nid) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.DELETE_NODE,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/del',
	method: 'post',
	data: {
		nid: nid
	},
	connectMode: "websocket"

}));

//删除关联关系
export const delNodeRelation = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_RELATION_DELETE,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/relation/del',
	method: 'post',
	data: data
}))
//修改关联关系
export const updateNodeRelation = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_RELATION_UPDATE,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/relation/update',
	method: 'post',
	data: data,
	connectMode: "websocket"
}))
//查询关联关系名称
export const findNodeRelation = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_RELATION_GET,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/relation/get',
	method: 'post',
	data: data,
	connectMode: "websocket"

}))

//根据节点查询所有的子节点
export const nodeSubtree = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_SUBTREE,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/topology',
	method: 'post',
	data: data
}))

//根据节点查询所有的父节点
export const nodeParents = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_PARENTS,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/parents',
	method: 'post',
	data: data
}))

//根据节点id查找故障传导路径
export const nodeFault = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_FAULT,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/query/fault',
	method: 'post',
	data: data
}))


//上传节点图标
export const uploadIcon = asyncActionCreator((name, data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.UPLOAD_USER_ICON,
	basepath: CMDB_BASEPATH,
	endpoint: 'thumbnail/save',
	contentType: "body",
	method: 'post',
	acceptType: 'stream',
	headers: {
		name: name
	},
	data: data
}))

//清除位置信息
export const clearNode = asyncActionCreator((nid) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_CLEAR,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/clear',
	method: 'post',
	data: {
		nid: nid
	},
	connectMode: "websocket"

}));
//设置无效节点
export const disableNode = asyncActionCreator((nid) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_DISABLE,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/disable',
	method: 'post',
	data: {
		nid: nid
	},
	connectMode: "websocket"
}));

//组和节点关联关系
export const updateNodeGroup = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_GROUP_UPDATE,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/group/update',
	method: 'post',
	data: data,
	connectMode: "websocket"
}));
//批量修改
export const batchModify = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_BATCH_MODIFY,
	basepath: CMDB_BASEPATH,
	endpoint: 'update',
	method: 'post',
	data: data
}));

//批量删除
export const batchRemove = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_BATCH_REMOVE,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/batch/delete',
	method: 'post',
	data: data
}));

//ESInfo 确认入库
export const infoConfirm = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.NODE_INFO_CONFIRM,
	basepath: CMDB_BASEPATH,
	endpoint: 'node/info/confirm',
	method: 'post',
	data: data
}));

//关闭websocket
export const closeWS = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.CLOSE_WEBSOCKET,
	basepath: CMDB_BASEPATH,
	endpoint: 'inner/websocket/clean/self',
	method: 'GET',
	data: data
}));

//查询集群下所有服务器列表
export const getHostListByCid = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.CLUSTER_HOST_LIST,
	basepath: CMDB_BASEPATH,
	endpoint: 'nodes/query/byclusterid',
	method: 'post',
	contentType: "form",
	data: data
}));

//查询服务器的所有IP列表
export const getIpListByHid = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.HOST_IP_LIST,
	basepath: CMDB_BASEPATH,
	endpoint: 'nodeIp/query/nodeid',
	method: 'post',
	contentType: "form",

	data: data
}));

//查询服务器的所有IP列表
export const enableNodeList = asyncActionCreator(() => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.ENABLE_NODE_LIST,
	basepath: CMDB_BASEPATH,
	endpoint: 'nodes/enable/query',
	method: 'post'
}));
// 获取节点硬件影响的故障信息
export const hardWareInfoByNid = asyncActionCreator((data) => ({
	type: CALL_API_HTTP,
	apiActionType: ActionTypes.HARD_INFO_NODE,
	basepath: CMDB_PATH_OTHER,
	contentType: "form",
	endpoint: 'alarm/node/details',
	method: 'post',
	data: data
}))
