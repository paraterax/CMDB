
let LOGO_IMAGE = 'images/logo.png'
let WS_BASEPATH = '';
let SERVICE_BASEPATH = "";
if (typeof globalConfig == 'object') {
	SERVICE_BASEPATH = globalConfig.SERVICE_BASEPATH || SERVICE_BASEPATH;
	WS_BASEPATH = globalConfig.WS_BASEPATH || WS_BASEPATH;
}

if (process.env.NODE_ENV !== 'production') {
	SERVICE_BASEPATH = "http://paradata.paratera.com"
	WS_BASEPATH = "ws://paradata.paratera.com:8888/ws"
}

let CALL_API_INDEXED_DB = 'CALL_API_INDEXED_DB'
let ES_BASEPATH = `${SERVICE_BASEPATH}/es`
let GRAFANA_PATH = `${SERVICE_BASEPATH}/grafana_web/dashboard/db/`
let CMDB_BASEPATH=`${SERVICE_BASEPATH}/nrelation/api/cmdb`
let CMDB_PATH_OTHER=`${SERVICE_BASEPATH}/nrelation/api`
let XMONITOR_BASEPATH =`${SERVICE_BASEPATH}/xmonitor/api`
let AS_BASEPATH = `${SERVICE_BASEPATH}/as`
let IMG_BASEPATH = `${SERVICE_BASEPATH}/html/cmdb/images/flowMap/`

export {
	LOGO_IMAGE,
	SERVICE_BASEPATH,
	CMDB_BASEPATH,
	CMDB_PATH_OTHER,
	XMONITOR_BASEPATH,
	AS_BASEPATH,
	CALL_API_INDEXED_DB,
	IMG_BASEPATH,

	ES_BASEPATH,
	GRAFANA_PATH,
	WS_BASEPATH
}

