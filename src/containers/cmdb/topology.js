import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { IMG_BASEPATH, GRAFANA_PATH, WS_BASEPATH, CMDB_BASEPATH } from 'app/constants/api'
import { alert as _alert, confirm as _confirm, hideProgress } from 'libs/common/actions/app'
import * as serviceCmdbActions from 'app/actions/public/service_cmdb'
import * as serviceXmonitorActions from 'app/actions/public/service_xmonitor'
import * as serviceESActions from 'app/actions/public/service_es'

import { add, sub, multi, divi } from 'app/components/flowMap/math'
import { GROUP_TYPES } from 'app/constants/FLOW_MAP_DATA'
import moment from 'moment'
import * as $s from 'app/components/verify'
import * as PDMapData from 'app/constants/FLOW_MAP_DATA'
import tplRender from './jsx/topology.jsx'

class Topology extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            activeNode: null,
            tabWidth: 500,
            tabShow: false,
            resizing: false,
            editNodeAble: false, //节点是否允许编辑
            editGroupAble: false, //组是否允许编辑
            updateNodeAble: false,
            editNode: {
                auto: false,
                des: "",
                gid: "",
                logo: "",
                nn: "",
                opt: {},
                pos: {},
                st: 0,
                stgy: 0,
                type: "",
                used: true,
                nid: "",
            },
            editGroup: {
                gn: '', //是	组名称
                pos: {}, //是	json,组位置
                des: ''
            },
            colorVisible: false,
            searchParams: {
                gid: "", //组id,多个用逗号隔开
                nid: "", //节点id,多个用逗号隔开
                tgid: "", //标签id,多个用逗号隔开
                type: "", //类型,多个用逗号隔开
                st: "",
                auto: "",
                nn: ""
            },
            //关系描述
            relationInfo: {
                p: "",
                c: "",
                e: ""
            },
            //故障规则
            warnRule: {
                nid: "",
                nodeRuleList: {},
                unNodeRuleList: {}
            },
            //故障信息
            alarmInfo: {
                defaultText: "",
                result: []
            },
            //溯源
            traceBackNodes: {}, //一键追溯节点
            //监控
            monitor: {
                url: ""
            },
            batchNodes: {
                stgy: 0, //是	策略id
                des: "", //否	节点描述
                gid: "", //否	节点组ID
                tags: "" //否	标签,最多三个,逗号隔开
            },
            batchAddGroup: {
                gid: ""
            },
            modalTitle: "",
            modalView: "",
            modalType: "",
            modalVisible: false,
            loadingStatus: false,

            //验证
            groupNameValid: true,
            groupTypeValid: true,
            nodeNameValid: true,
            nodeTypeValid: true,

            clusterHostList: [],
            hostIpList: [],
            validTps: {},
        }
        this.timeout = null;
        this.logoFlag = "";
        this.status = ["#aaa", "GREEN", "ORANGE", "RED"]
        this.statusColor = ["transparent", "transparent", "ORANGE", "RED"],
        this.linuxProcessEsInfo =  null
            
            //通知
        this.notifications = []
            //权限
            //接收从已应用规则打开应用传回的节点信息
        var selectedNodes;
        var length = 0;
        //增加限定条件
        this.permission = {
            looked: this.useLocationParams("origin") == "paradata" ? true : false, //只可查看，不显示有右键菜单和上部的功能菜单，允许拖拽，不允许多选
            groupSelected: this.useLocationParams("groupSelected") != "" ? this.useLocationParams("groupSelected").bool() : false, //只可以选择组
            nodeSelected: this.useLocationParams("nodeSelected") != "" ? this.useLocationParams("nodeSelected").bool() : false, //只可以选择节点
            multiSelected: this.useLocationParams("multiSelected") != "" ? this.useLocationParams("multiSelected").bool() : true, //是否支持多选，默认支持多选节点，要显示上方锁屏按钮
            greyed: this.useLocationParams("greyed") != "" ? this.useLocationParams("greyed").bool() : false, //是否置灰其他节点
            nodeOnlySelected: this.useLocationParams("nodeOnlySelected") != "" ? this.useLocationParams("nodeOnlySelected").bool() : false,
            filterType: this.useLocationParams("filterType") != "" ? this.useLocationParams("filterType") : "", //绑定规则应用节点，根据类型过滤
            selectedNodes: [], //绑定规则已应用节点回显，节点选中状态
            selectedGroup: this.useLocationParams("selectedGroup") != "" ? this.useLocationParams("selectedGroup") : "", //场景已选择的组回显，组选中状态

            selectedNode: this.useLocationParams("selectedNode") != "" ? this.useLocationParams("selectedNode") : "", //故障信息，根据某一个节点查看该节点的拓扑关系

            dragged: this.useLocationParams("dragged") != "" ? this.useLocationParams("dragged").bool() : false, //不显示上方锁屏按钮

            originType: this.useLocationParams("originType") != "" ? this.useLocationParams("originType") : "", //来源是集群
            filterSelectedNodes: this.useLocationParams("filterSelectedNodes") != "" ? this.useLocationParams("filterSelectedNodes").split(",") : [], //根据某些节点过滤

            cid: this.useLocationParams("cid") != "" ? this.useLocationParams("cid") : "",
            //场景管理中查看自己的拓扑
            sceneLooked: this.useLocationParams("sceneLooked") != "" ? this.useLocationParams("sceneLooked").bool() : false,
            // 规则管理、集群管理、场景管理查看自己的拓扑需要的参数
            queryNeeded: this.useLocationParams("queryNeeded") != "" ? this.useLocationParams("queryNeeded").bool() : false,
            //故障信息和场景管理选择组需要的参数
            memParam: this.useLocationParams("memParam") != "" ? this.useLocationParams("memParam").bool() : false
        }
        let this_ = this
        window.addEventListener('message', function(event) {
            this_.permission.selectedNodes = event.data;
        }, false);

        //溯源箭头
        this.traceBackArrows = []
        //pdMap到页面边缘的距离
        this.mapPos = [99, 37]
        this.ws_user = "";
    }

    componentDidMount() {
        this.props.hideProgress();
        // 仅握手后可收取通知
        this.ws_user = "root_cmdb_" + new Date().getTime();
        WS.init({
            url: WS_BASEPATH,
            data: { "ptl": "push", "auth": this.ws_user },
            timeout: 30000,
            success: ()=>{
                if (!this.permission.looked) {
                    WS.subscribe("alarm", (data) => {
                        this.refreshAlarm(data);
                    })
                }
                this.refreshPDMap();
            },
            error: ()=>{

            }
        });
        window.addEventListener("resize", this.resizeFun.bind(this))
    }
    refreshAlarm(msg) {
        let data = msg.t_data;
        console.log("cmdb推送过来的data", data)
        let nodes = this.refs.pdMap.nodes;
        for (let nid in data) {
            if (nodes[nid] && data[nid].length > 0) {
                let sortData = $s.listSortBy(data[nid], "time", "desc");
                let item = sortData[0];
                let node = nodes[nid].data;
                node.st = item.stp;
                this.refs.pdMap.refreshNodeStatus(nid, this.statusColor[item.stp]);
                if (item.sts == 2 || item.sts == 3) {
                    node.wn[this.statusColor[item.stp]] = item.msg;
                    this.refs.pdMap.refreshNodeStatusIcon(nid, "add")
                } else {
                    this.refs.pdMap.refreshNodeStatusIcon(nid, "remove")
                }
                let childs = node["c"] || [];
                let parents = node["p"] || [];

                if (parents.length > 0) {
                    let arrowids = [];
                    parents.map((p_nid, i) => {
                        if (nodes[p_nid]) {
                            let pnode = nodes[p_nid].data;
                            let p_st = pnode.st;
                            if (data[p_nid]) {
                                let p_item = $s.listSortBy(data[p_nid], "time", "desc")[0];
                                p_st = p_item.stp;
                            }
                            let color = "#5B5B5B";
                            let aid = `_${nid}_${p_nid}_`;
                            if ((p_st == 2 || p_st == 3) && (node.st == 2 || node.st == 3)) {
                                color = this.statusColor[node.st];
                            }
                            arrowids.push([aid, color])
                        }
                    });
                    if (arrowids.length > 0) {
                        this.refs.pdMap.refreshArrowColor(arrowids)
                    }
                }

                if (childs.length > 0) {
                    let arrowids = [];
                    let stgy_flag = true;
                    if (node.stgy == 1) { //如果是全传导，并且有子节点
                        childs.map((c_nid, i) => {
                            if (nodes[c_nid]) {
                                let cnode = nodes[c_nid].data;
                                let c_st = cnode.st;
                                if (data[c_nid]) {
                                    let c_item = $s.listSortBy(data[c_nid], "time", "desc")[0];
                                    c_st = c_item.stp;
                                }
                                cnode.st = c_st;
                                if (c_st != 2 && c_st != 3) {
                                    stgy_flag = false;
                                }
                            }
                        })
                    }
                    childs.map((c_nid, i) => {
                        if (nodes[c_nid]) {
                            let cnode = nodes[c_nid].data;
                            let c_st = cnode.st;
                            let color = "#5B5B5B";
                            let aid = `_${c_nid}_${nid}_`;

                            if ((node.st == 2 || node.st == 3) && (c_st == 2 || c_st == 3) && stgy_flag) {
                                color = this.statusColor[c_st];
                            }
                            arrowids.push([aid, color])
                        }
                    })
                    if (arrowids.length > 0) {
                        this.refs.pdMap.refreshArrowColor(arrowids)
                    }
                }
            }
        }
    }
    componentWillUpdate(prevProps, prevState) {
        this.props.hideProgress()
    }

    render() {
        return tplRender.bind(this)()
    }
    resizeFun() {
        if (!this.permission.looked) {
            document.getElementById("topology").style.height = (document.body.clientHeight - 50) + "px"
        } else {
            document.getElementById("topology").style.height = "100%"
        }
    }
    //获取地址栏参数
    useLocationParams(module) {
        var url = window.location.href;
        var search = url.substring(url.indexOf("?"), url.length);
        var strs = search.substr(1).split("&");
        var value = "";
        for (var i = 0; i < strs.length; i++) {
            var str = strs[i].split("=");
            if (str[0] === module) {
                value = str[1];
                break;
            }
        }
        return value;
    }
    updatePDMap(allData, nid, gn) {
        Object.keys(allData.groups).map(key => { //新建组回显
            allData.groups[key].type = allData.groups[key].pos.type
            if (gn == allData.groups[key].gn) {
                this.permission.selectedGroup = key
                this.refs.pdMap.updateGroup(this.permission.selectedGroup)
            }
        })
        var nodeStatus = {}
        Object.keys(allData.nodes).map((key) => {
            let node = allData.nodes[key];
            if (nid != "" && nid == node.nid) { //新建节点回显
                this.permission.selectedNodes[0] = key
                this.refs.pdMap.updateNodes(this.permission.selectedNodes)
            }
            if (node.st != 0 && node.st != 1) {
                var arrowids = [];
                let childs = node["c"];
                if (childs.length > 0) {
                    let arrowids = [];
                    let stgy_flag = true;
                    if (node.stgy == 1) { //如果是全传导，并且有子节点
                        childs.map((c_nid, i) => {
                            if (allData.nodes[c_nid]) {
                                let cnode = allData.nodes[c_nid];
                                let c_st = cnode.st;
                                if (c_st != 2 && c_st != 3) {
                                    stgy_flag = false;
                                }
                            }
                        })
                    }
                    childs.map((c_nid, i) => {
                        if (allData.nodes[c_nid]) {
                            let cnode = allData.nodes[c_nid];
                            let c_st = cnode.st;
                            let color = "#5B5B5B";
                            let arrowid = "_" + c_nid + "_" + key + "_";
                            if ((node.st == 2 || node.st == 3) && (c_st == 2 || c_st == 3) && stgy_flag) {
                                color = this.statusColor[c_st];
                            }
                            arrowids.push([arrowid, color])
                        }
                    })
                    if (arrowids.length > 0) {
                        this.refs.pdMap.refreshArrowColor(arrowids)
                    }
                }
                this.refs.pdMap.refreshNodeStatus(key, this.status[allData.nodes[key].st]);

                //查询是否是自己的故障
                if (Object.keys(node.wn).length > 0) {
                    let wn_flag = false;
                    Object.keys(node.wn).map(wn_key => {
                        let wn_item = node.wn[wn_key];
                        if (wn_item.length > 0) {
                            wn_flag = true;
                            return;
                        }
                    })
                    if (wn_flag) {
                        this.refs.pdMap.refreshNodeStatusIcon(key)
                    }
                }
            }
        });

        //判断打开的溯源框的节点是否存在,如果不存在，将溯源窗口关闭
        //如果存在，需要更新溯源的内容
        Object.keys(this.state.traceBackNodes).map(key => {
            if (this.refs.pdMap.nodes[key] == undefined || this.refs.pdMap.nodes[key].data.st == 0 || this.refs.pdMap.nodes[key].data.st == 1) {
                this.closeTraceBackById(key)
            } else {
                this.openTraceBackById(key, "refresh")
            }
        })
    }

    getAllData(searchParams) {
        if (searchParams != null) {
            //业务拓扑中进入CMDB
            if (!this.permission.looked) {
                return this.props.serviceCmdbActions.getAllData(searchParams)
                .then((allData) => {
                    this.setState({
                        topologyData: allData
                    })
                })
            } else {
                //从规则管理进入CMDB || 从集群管理进入CMDB || 场景管理中查看自己的拓扑
                if (this.permission.filterType != "" ||
                    this.permission.cid != "" ||
                    (this.permission.sceneLooked && this.permission.selectedGroup != "")) {
                    return this.props.serviceCmdbActions.getAllData(searchParams)
                    .then((allData) => {
                        this.setState({
                            topologyData: allData
                        })
                    })
                }
                // 从场景管理选择组进入CMDB
                if (this.permission.groupSelected) {
                    //调用新接口
                    return this.props.serviceCmdbActions.listGroup(searchParams)
                    .then((allData) => {
                        this.setState({
                            topologyData: allData
                        })
                    })
                }
                //从故障信息进入CMDB
                if (this.permission.selectedNode != "") {
                    // 调用新接口
                    return this.props.serviceCmdbActions.nodeSubtree(searchParams)
                    .then((allData) => {
                        this.setState({
                            topologyData: allData
                        })
                    })
                }
            }
        }
    }
    //数据显示代码优化
    refreshPDMap(nid, gn) {
        var this_ = this;
        let searchParams = {};
        let searchParam = this.state.searchParams;
        searchParam.nn = searchParam.nn.trim();
        searchParams = searchParam;
        this.refs.pdMap.status.locked = false
        this.refs.pdMap.setState({
            activeBtn: "default"
        })
        //业务拓扑中进入CMDB
        if (!this.permission.looked) {
            Promise.all([
                this.getAllData(searchParams)
            ]).then(() => {
                let allData = this.state.topologyData;
                if (allData.groups != undefined && $s.isEmptyObject(allData.groups) &&
                    allData.nodes != undefined && $s.isEmptyObject(allData.nodes)) {
                    parent.window.alert("暂无查询结果！");
                } else {
                    //拿到所有符合条件的数据绘制拓扑图
                    this.setPDMapData(allData);
                    this.updatePDMap(allData, nid, gn);
                }
            })
        } else {
            this.refs.pdMap.updateScale();
            if (this.permission.queryNeeded) { //其他入口进入CMDB
                //从规则管理进入CMDB
                if (this.permission.filterType != "") {
                    searchParams.type = this.permission.filterType;
                }
                //从集群管理进入CMDB
                if (this.permission.cid != "") {
                    searchParams.cid = this.permission.cid;
                }
                // 场景管理中查看自己的拓扑
                if (this.permission.sceneLooked && this.permission.selectedGroup != "") {
                    searchParams.gid = this.permission.selectedGroup;
                    this.refs.pdMap.status.locked = true
                    this.refs.pdMap.setState({
                        activeBtn: "pan"
                    })
                }
                Promise.all([
                    this.getAllData(searchParams)
                ]).then(() => {
                    let topologyData = this.state.topologyData;
                    //拿到所有符合条件的数据绘制拓扑图
                    this.setPDMapData(topologyData);
                    // 回显已应用的节点
                    if (this.permission.filterType != "" && this.permission.selectedNodes != "") {
                        this.refs.pdMap.updateNodes(this.permission.selectedNodes)
                    }
                })

            } else if (this.permission.memParam) {
                // 从场景管理选择组进入CMDB
                if (this.permission.groupSelected) {
                    searchParams = {
                        // "isScene": false,
                        "isGraph": true
                    }
                }
                //从故障信息进入CMDB
                if (this.permission.selectedNode != "") {
                    // 调用新接口
                    let nid = this.permission.selectedNode;
                    searchParams = { nid: nid }                
                }
                Promise.all([
                    this.getAllData(searchParams)
                ]).then(() => {
                    let topologyData = this.state.topologyData;
                    //拿到所有符合条件的数据绘制拓扑图
                    this.setPDMapData(topologyData);
                    if(this.permission.selectedNode != ""){
                        this.refs.pdMap.updateRelationNodes(this.permission.selectedNode);
                    }
                    if (this.permission.groupSelected && this.permission.selectedGroup != ""){
                        var groupId = this.permission.selectedGroup.split(",");
                        this.refs.pdMap.updateSceneGroup(groupId, this.useLocationParams("logoFlag"))
                    }
                })
            }
        }
    }

    setPDMapData(dbData) {
        let data = Object.assign({
            "position": [
                this.refs.pdMap.rootGroup.position[0],
                this.refs.pdMap.rootGroup.position[1]
            ],
            "scale": [
                this.refs.pdMap.status.scale,
                this.refs.pdMap.status.scale
            ]
        }, this.transDBtoPDMap(dbData))
        this.refs.pdMap.deserialization(data);
        if ($s.isEmptyValue(this.state.searchParams)) {
            this.refs.pdMap.updateUnUsedList(data.unUsedNodes)
        } else {
            this.refs.pdMap.updateUnUsedList("")
        }
    }
    //将图形json转换成数据库json
    transPDMapToDB(mData) {
        let dbData = {},
            dbNodes = {},
            dbGroups = {}
        let { nodes, containers, arrows, _data } = mData
        for (let key in nodes) {
            let node = nodes[key]
            let nodeData = _data[node['id']]
            let dbNode = {
                gid: nodeData['pid'],
                nid: node['id'],
                nn: nodeData['title'],
                pos: {
                    x: node['position'][0],
                    y: node['position'][1]
                },
                tgid: nodeData['data']['tgid'],
                type: nodeData['nodeType'],
                c: []
            }
            dbNodes[key] = Object.assign({}, nodeData['data'], dbNode)
        }

        for (let key in containers) {
            let group = containers[key]
            let groupData = _data[group['id']]
            let dbGroup = {
                gid: group['id'],
                gn: groupData['title'],
                pos: {
                    x: group['position'][0],
                    y: group['position'][1]
                },
                type: groupData['containerType']
            }
            dbGroups[key] = Object.assign({}, groupData['data'], dbGroup)
        }

        for (let key in arrows) {
            let arrow = arrows[key]
            let ids = key.split("_")
            dbNodes[ids[1]]['c'].push(ids[2])
        }

        return { nodes: dbNodes, groups: dbGroups }
    }
    //将数据库json转换成图形json
    transDBtoPDMap(dbData) {
        let { pdMap } = this.refs
        let position = [0, 0];
        let scale = [
            this.refs.pdMap.status.scale,
            this.refs.pdMap.status.scale
        ];
        let mapWidth = pdMap.state.mapWidth;
        let mapHeight = pdMap.state.mapHeight;
        let tempArrayX = [];
        let tempArray = {};
        var minNumX = 0;
        var minNumY = 0;
        let { nodes, groups } = dbData
        let mData = {},
            mNodes = {},
            mArrows = {},
            mGroups = {},
            unUsedNodes = {}
        var that = this
        for (let key in nodes) {
            let node = nodes[key]
            let nid = node['nid']
            if (node["pos"] != undefined && node["pos"]["x"] != undefined) {
                let filterNodeType = this.permission.filterType;
                let nNode = {
                    "id": nid,
                    "position": [
                        node['pos'] != undefined ? node['pos']['x'] : Math.round(Math.random() * 500),
                        node['pos'] != undefined ? node['pos']['y'] : Math.round(Math.random() * 500)
                    ]
                }
                mData[nid] = {
                    "title": node['nn'],
                    "pid": node['gid'],
                    "nodeType": node['type'],
                    "data": node
                }
                let child = node['p'] || []
                let echild = node['e'] || []
                child.map((cid, i) => {
                    let aid = `_${nid}_${cid}_`;
                    let st = 0;
                    let color = "#5B5B5B";
                    mArrows[aid] = {
                        id: aid,
                        color: color,
                        text: echild[i] == null ? "" : echild[i],
                        st: st
                    }
                })
                if ((filterNodeType != "" && node['type'] == filterNodeType) || filterNodeType == "") {
                    mNodes[nid] = nNode
                }
            } else {
                let nNode = {
                    "id": nid,
                    "nn": node["nn"],
                    "type": node["type"],
                    "opt": node["opt"]
                }
                unUsedNodes[nid] = nNode
            }
        }
        for (let key in groups) {
            let group = groups[key]
            if (group["pos"] != undefined && group["pos"]["x"] != undefined) {
                let nGroup = {
                    "id": group['gid'],
                    "position": [
                        group['pos']['x'],
                        group['pos']['y']
                    ],
                }
                mData[group['gid']] = {
                    "title": group['gn'],
                    "containerType": group['pos']['type'],
                    "data": group
                }
                mGroups[group['gid']] = nGroup
                tempArrayX.push(group['pos']['x']);
                tempArray[group['pos']['x']] = group['pos']['y']
            }
        }
        if (groups != null && groups != undefined && !$s.isEmptyObject(groups)) {

            if (this.permission.sceneLooked && this.permission.selectedGroup != "" ||
                this.permission.cid != "" ||
                this.permission.selectedNode != "" ||
                this.permission.filterType != "") {
                minNumX = Math.min.apply(Math, tempArrayX);
                minNumY = tempArray[minNumX];
                position = [0, 0];
            }
        }
        return {
            position: position,
            scale: scale,
            unUsedNodes: unUsedNodes,
            nodes: mNodes,
            containers: mGroups,
            arrows: mArrows,
            _data: mData
        }
    }

    resizeTabContentHandle(e) {
        const { resizing } = this.state
        if (resizing) {
            let tabWidth = document.body.offsetWidth - e.pageX - 20
            if (tabWidth <= 100) {
                return
            }
            this.setState({
                tabWidth
            })
        }
    }
    hasTag(data, tag) {
        let flag = true;
        data.map(item => {
            if ("!" + item.key == tag || item.key == "!" + tag) {
                flag = false
                return;
            }
        })
        return flag;
    }
    hasTargetTag(data, tag) {
        let flag = true;
        data.map(item => {
            if ("!" + item == tag || item == "!" + tag) {
                flag = false
                return;
            }
        })
        return flag;
    }
    getExpressionValue (value,unit){
		var expressionValue = value;
		if(unit == null) return parseFloat(expressionValue).toFixed(2)
		if(unit.indexOf("KB") != -1){
			expressionValue = value / 1024;
		}
		if(unit.indexOf("MB") != -1){
			expressionValue = value / (1024*1024)
		}
		if(unit.indexOf("GB") != -1){
			expressionValue = value / (1024*1024*1024)
		}
		if (unit.indexOf("KW") != -1) {
			expressionValue = value / 1000;   
		}
		return parseFloat(expressionValue).toFixed(2)
	}
    //根据节点查询自己的故障信息
    getAlarmInfo(nodeId) {
            let nodeFault = []
            let counter = 0;
            Promise.all([
                this.props.serviceXmonitorActions.assetInfoByNid({ node_id: nodeId })
                .then((response) => {
                    if (response.length == 0) {
                        counter++;
                    } else {
                        for (var i = 0; i < response.length; i++) {
                            var item = response[i];
                            var analyzeResult = "";
                            let displayUnit =item.displayUnit == null ? "" : item.displayUnit;
                            let expressionValue = this.getExpressionValue(item.alarmValue,item.displayUnit);
                            let threshold = this.getExpressionValue(item.threshold,item.displayUnit);
                            var message = item.message !=undefined ? item.message : moment(item.firstAlarm).format("YYYY-MM-DD HH:mm:ss") + " -- " + "节点" + item.nodeName + " -- " + 
                                                item.beginning + item.condition + threshold + displayUnit + "( " + expressionValue + displayUnit + " )" + "产生告警";
                            if (item.analyzeResult) {
                                analyzeResult = item.analyzeResult;
                            } else {
                                analyzeResult = "";
                            }
                            var node = {
                                alarmTimeStamp: item.firstAlarm,
                                message: message,
                                analyzeResult: analyzeResult
                            }
                            nodeFault.push(node)
                        }
                    }
                })
            ]).then(() => {
                Promise.all([
                    this.props.serviceCmdbActions.hardWareInfoByNid({ host_ids: nodeId })
                    .then((res) => {
                        if (res.length == 0) {
                            counter++;
                        } else {
                            for (var j = 0; j < res.length; j++) {
                                var item = res[j];
                                var analyzeResult = "";
                                let displayUnit =item.displayUnit == null ? "" : item.displayUnit;
                                let expressionValue = this.getExpressionValue(item.alarmValue,item.displayUnit);
                                let threshold = this.getExpressionValue(item.threshold,item.displayUnit);
                                var message = item.message != undefined ? item.message : moment(item.firstAlarm).format("YYYY-MM-DD HH:mm:ss") + " -- " + "节点" + item.nodeName + " -- " + 
                                                item.beginning + item.condition + threshold +displayUnit + "( " + expressionValue + displayUnit + " )" + "产生告警";
                                var node = {
                                    alarmTimeStamp: item.firstAlarm,
                                    message: message,
                                    analyzeResult: ""
                                }
                                nodeFault.push(node)
                            }
                        }
                        if (counter == 2) {
                            this.setState({
                                alarmInfo: {
                                    defaultText: "该节点暂无故障信息！",
                                    res: []
                                }
                            })
                        } else {
                            this.setState({
                                alarmInfo: {
                                    defaultText: "",
                                    result: nodeFault
                                }
                            })

                        }
                    })
                ])
            })
        }
        //获取节点未绑定的规则列表
    getUnRuleList(arr1, arr2) {
        var temp = []; //临时数组1
        var tempArray = []; //临时数组2
        var tempArray1 = [];
        for (var i = 0; i < arr2.length; i++) {
            temp[arr2[i].tag] = true; //巧妙地方：把数组B的值当成临时数组1的键并赋值为真
        }
        for (var i = 0; i < arr1.length; i++) {
            if (!temp[arr1[i].tag]) {
                tempArray.push(arr1[i]); //巧妙地方：同时把数组A的值当成临时数组1的键并判断是否为真，如果不为真说明没重复，就合并到一个新数组里，这样就可以得到一个全新并无重复的数组
            } else {
                tempArray1.push(arr1[i]);
            }
        }
        return { unList: tempArray, list: tempArray1 }
    }
    setActiveTab(active) {
        const { activeNode } = this.state
        switch (active) {
            case 0: //节点详情
                Promise.all([
                    this.props.serviceCmdbActions.tagList(),
                    this.props.serviceCmdbActions.groupList()
                ]).then((results) => {
                    this.getEditNode(activeNode.id, activeNode.nodeType)
                })
                break;
            case 1: //故障信息
                this.getAlarmInfo(activeNode.id);
                break;
            case 2: //故障规则
                let node_type = activeNode.nodeType;
                let nid = activeNode.id;
                this.props.serviceXmonitorActions.getRuleListByType({
                    node_type: node_type
                }).then((res) => {
                    let nodeRuleList = {},
                        unNodeRuleList = {};
                    res.map(item => {
                        let nodeIds = [];
                        if (item.nodeId != null) {
                            item["nodeId"].map((node) => {
                                nodeIds.push(node.nodeId);
                            })
                        }
                        if (nodeIds.contains(nid)) {
                            nodeRuleList[item.id] = item;
                        } else {
                            unNodeRuleList[item.id] = item;
                        }
                    });
                    this.setState({
                        warnRule: {
                            nid: activeNode.id,
                            nodeType: activeNode.data['type'],
                            nodeAuto: activeNode.data['auto'],
                            nodeRuleList: nodeRuleList,
                            unNodeRuleList: unNodeRuleList
                        }
                    })
                });
                break;
            case 3: //监控信息
                let nodeType = activeNode.nodeType;
                let nodeName = activeNode.title;
                let url = "";
                if (activeNode.nodeType == "virtual" || activeNode.nodeType == "networkswitch") {
                    this.setState({
                        monitor: {
                            url: "",
                            error: "该节点为" + (activeNode.nodeType == "virtual" ? "虚拟" : "交换机") + "节点，暂无监控信息！"
                        }
                    })
                } else {
                    if (activeNode.nodeType == 'host' && !activeNode.data['auto']) {
                        this.setState({
                            monitor: {
                                url: "",
                                error: "该节点为手动创建的服务器节点，暂无监控信息！"
                            }
                        })
                    } else {

                        let hid = activeNode.data.opt.hid
                        if (hid == "") {
                            url = "";
                            this.setState({
                                monitor: {
                                    url: "",
                                    error: "该节点没有找到对应的服务器节点，暂无监控信息！"
                                }
                            })
                        } else {
                            var hostName = this.state.topologyData.nodes[hid].nn;
                            var errorNews = "";
                            if (activeNode.nodeType == "mysql") {
                                url = GRAFANA_PATH + 'paradata_mysql?origin=paradata&fromMem=yes&orgId=1&from=now-3h&to=now&var-hostname=' + hostName;
                            } else if (activeNode.nodeType == "tomcat") {
                                url = GRAFANA_PATH + 'paradata_tomcat?origin=paradata&fromMem=yes&orgId=1&from=now-3h&to=now&var-hostname=' + hostName;
                            } else if (activeNode.nodeType == "host") {
                                url = GRAFANA_PATH + 'paradata_host?origin=paradata&fromMem=yes&orgId=1&var-hostname=' + hostName;
                            } else if (activeNode.nodeType == "linuxprocess") {
                                if(this.linuxProcessEsInfo.hits != undefined && this.linuxProcessEsInfo.hits.hits != undefined
                                && this.linuxProcessEsInfo.hits.hits.length > 0 && this.linuxProcessEsInfo.hits.hits[0]._source != undefined
                                ){
                                    url = GRAFANA_PATH + 'patadata_linux_new?origin=paradata&fromMem=yes&orgId=1&var-hostname=' + hostName;
                                }else{
                                    url =  "";
                                    errorNews = "该进程节点暂无监控信息！"
                                }

                            }
                            this.setState({
                                monitor: {
                                    url: url,
                                    error: errorNews
                                }
                            })
                        }
                    }
                }
                break;
        }
        this.setState({
            activeTab: active
        })
    }
    //获取节点详情
    getEditNode(id, type) {
        this.setState({
            editNode: {
                normalInfo: {
                    loading: true
                },
                esInfo: {
                    loading: true
                }
            }
        })
        this.props.serviceCmdbActions.nodeDetail(id)
        .then((data) => {
            if (data.opt != undefined && data.opt.cid != undefined) {
                this.getHostListByCid(data.opt.cid)
            }
            let groupName = "----";
            this.props.groupList.map(group => {
                if (group.gid == data.gid) {
                    groupName = group.gn;
                }
            })
            let stgyName = "----";
            switch (data.stgy) {
                case 0:
                    stgyName = "任意传导";
                    break;
                case 1:
                    stgyName = "全部传导";
                    break;
            }

            let tags = [];
            if (data.tgid != "" && data.tgid != null) {
                data.tgid.map(item => {
                    this.props.tagList.map(item1 => {
                        if (item == item1.tagId) {
                            tags.push(item1.tagName)
                        }
                    })
                })
            }

            data.gid = groupName;
            data.stgy = stgyName;
            data.tags = tags.length == 0 ? "----" : tags.join("、")
            this.setState({
                editNode: {
                    normalInfo: data
                }
            })

            if (type != undefined && type != "virtual") {
                let clusterId = data.opt.cid;
                if (clusterId == "") {
                    parent.window.alert("该节点没有对应的服务器节点！");
                    this.setState({
                        editNode: {
                            normalInfo: data,
                            esInfo: {
                                loading: false
                            }
                        }
                    })
                    return;
                }
                //查询ES信息
                let time = moment().format("YYYYMMDD")
                let es_action = "";
                let es_data = es_data = {
                    "query": {
                        "bool": {
                            "must": [{
                                "term": {}
                            }],
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
                switch (type) {
                    case "mysql":
                        es_action = clusterId + '-mysqlinfo-' + time + '/_search';
                        es_data["query"]["bool"]["must"] = [{
                                "term": {
                                    "hid.raw": id
                                }
                            },
                            {
                                "term": {
                                    "ip": data.opt.ip
                                }
                            },
                            {
                                "term": {
                                    "mysql_user.raw": data.opt.user
                                }
                            },
                            {
                                "term": {
                                    "mysql_password.raw": data.opt.password
                                }
                            },
                            {
                                "term": {
                                    "mysql_port": data.opt.port
                                }
                            }
                        ]
                        break;
                    case "tomcat":
                        es_action = clusterId + '-tomcatinfo-' + time + '/_search';
                        es_data["query"]["bool"]["must"] = [{
                                "term": {
                                    "ip": data.opt.ip
                                }
                            },
                            {
                                "term": {
                                    "tomcat_port": data.opt.port
                                }
                            },
                            {
                                "term": {
                                    "tomcat_user.raw": data.opt.user
                                }
                            },
                            {
                                "term": {
                                    "tomcat_password.raw": data.opt.password
                                }
                            },
                            {
                                "term": {
                                    "tomcat_dir.raw": data.opt.tomcat_path
                                }
                            },
                            {
                                "term": {
                                    "hid.raw": id
                                }
                            }
                        ]
                        break;
                    case "host":
                        es_action = clusterId + '-sysinfo-' + time + '/_search'
                        es_data["query"]["bool"]["must"][0]["term"] = {
                            "hostid.raw": id
                        }
                        break;
                    case "linuxprocess":
                        es_action = clusterId + '-linuxprocessinfo-' + time + '/_search';
                        es_data["query"]["bool"]["must"] = [{
                                "term": {
                                    "hid.raw": id
                                }
                            },
                            {
                                "term": {
                                    "ip": data.opt.ip
                                }
                            },
                            {
                                "term": {
                                    "process_name.raw": data.opt.process_name
                                }
                            }
                        ]
                        break;
                    case "networkswitch":
                        es_action = clusterId + '-networkswitchinfo-' + time + '/_search'
                        es_data["query"]["bool"]["must"][0]["term"] = {
                            "hid.raw": id
                        }
                        break;
                }
                if (es_action != "") {
                    this.props.serviceESActions.getESInfo(es_action, es_data)
                    .then(res => {
                        this.linuxProcessEsInfo = res;
                        if (res.hits != undefined &&
                            res.hits.hits != undefined &&
                            res.hits.hits.length > 0 &&
                            res.hits.hits[0]._source != undefined
                        ) {
                            let esInfo = res.hits.hits[0]._source;
                            let newESInfo = {}
                            for (let key in esInfo) {
                                if (key != "cluster" &&
                                    key != "ip" &&
                                    key != "mysql_host" &&
                                    key != "hostname" &&
                                    key != "mysql_port" &&
                                    key != "id" &&
                                    key != "stderr" &&
                                    key != "hid" &&
                                    key != "hostid"
                                ) {
                                    if (key == "timestamp") {
                                        newESInfo[key] = moment(esInfo[key]).format("YYYY-MM-DD HH:mm:ss")
                                    } else {
                                        if(typeof esInfo[key] == "object"){
                                            newESInfo[key] = JSON.stringify(esInfo[key]);
                                        }else{
                                            newESInfo[key] = esInfo[key];
                                        }
                                    }
                                }
                            }
                            this.setState({
                                editNode: {
                                    normalInfo: data,
                                    esInfo: newESInfo
                                }
                            })
                        } else {
                            this.setState({
                                editNode: {
                                    normalInfo: data,
                                    esInfo: {
                                        loading: false
                                    }
                                }
                            })
                        }
                    })
                    .catch(() => {
                        this.setState({
                            editNode: {
                                normalInfo: data,
                                esInfo: {
                                    loading: false,
                                    errorInfo: "加载ES信息失败"

                                }
                            }
                        })
                    })

                } else {
                    this.setState({
                        editNode: {
                            normalInfo: data,
                            esInfo: {
                                loading: false
                            }
                        }
                    })
                }
            } else {
                this.setState({
                    editNode: {
                        normalInfo: data,
                        esInfo: {
                            loading: false
                        }
                    }
                })
            }
        })
        .catch(() => {
            parent.window.alert('获取编辑节点失败！')
        })
    }
    setFormValue(key, e) {
        let o = {}
        if (key == 'resizing') {
            if (this.state.resizing == e) {
                return
            }
            o[key] = e
        } else if (key == 'editNodeAble' || key == 'editGroupAble') {
            o[key] = e
        }
        this.setState(o)
    }

    //删除连接
    openDeleteArrow(arrow) {
        parent.window.confirm("确定要删除连接吗？", () => {
            var pcids = arrow.id.split("_");
            this.props.serviceCmdbActions.delNodeRelation({
                p: pcids[2],
                c: pcids[1]
            })
            .then(() => {
                parent.window.alert("删除成功！");
                this.refreshPDMap();
            })
        })
    }
    //创建连接
    openAddArrowConfirm() {
        let { pdMap } = this.refs
        if (pdMap.status.arrowTargetNode) {
            let c = pdMap.status.activeGroup.id,
                p = pdMap.status.arrowTargetNode.id,
                id, e
            if (pdMap.arrows["_" + p + "_" + c + "_"] == undefined) {
                if (p != c) {
                    pdMap.addRelation(pdMap.status.activeGroup, pdMap.status.arrowTargetNode, pdMap.status.activeArrow);
                    //调用创建连接的接口
                    this.props.serviceCmdbActions.addNodeRelation({
                        p,
                        c,
                    }).then(() => {
                        this.refreshPDMap();
                    })
                }

            } else {
                pdMap.rootGroup.remove(pdMap.status.activeArrow);
                delete pdMap.arrows[pdMap.status.activeArrow.id];
                pdMap.status.activeArrow = null;
            }
        } else {
            pdMap.rootGroup.remove(pdMap.status.activeArrow);
            delete pdMap.arrows[pdMap.status.activeArrow.id];
            pdMap.status.activeArrow = null;
        }

    }
    openEditGroupMenu(group, position) {
        if (group == null) { //新建组
            let { editGroup } = this.state
            editGroup.pos = {
                x: position[0],
                y: position[1],
                color: "#00a0e9",
                type: "group1"
            }
            this.setState({
                modalTitle: "新建节点组",
                modalType: "editGroup",
                modalVisible: true,
                editGroup: editGroup
            });
        } else { //修改组
            this.props.serviceCmdbActions.groupDetail(group.id)
            .then((data) => {
                if (data.pos.color == undefined) {
                    data.pos.color = GROUP_TYPES[data.pos.type].style.stroke
                }
                this.setState({
                    modalTitle: "修改节点组：" + group.title,
                    modalType: "editGroup",
                    modalVisible: true,
                    editGroup: data
                });
            })
            .catch(() => {
                parent.window.alert("获取编辑组失败！")
            })
        }
    }
    //新建节点和编辑节点通用一个
    openEditNodeMenu(node, position) {
        Promise.all([
            this.props.serviceCmdbActions.tagList(),
            this.props.serviceCmdbActions.groupList(),
            this.props.serviceCmdbActions.listCluster()
        ]).then((results) => {
            if (node == null) {
                let { editNode } = this.state,
                    pdMap = this.refs.pdMap
                editNode['tags'] = []
                editNode.pos = {
                    x: position[0],
                    y: position[1]
                }

                let activeGroup = this.refs.pdMap.status.activeGroup;
                let activeGroupData = this.refs.pdMap.data(activeGroup)
                let groupId = activeGroup && activeGroupData['type'] == 'container' ? activeGroup.id : ""
                editNode['gid'] = groupId

                this.setState({
                    editNodeAble: true,
                    updateNodeAble: false,
                    modalTitle: "新建节点",
                    modalType: "editNode",
                    modalVisible: true,
                    editNode: editNode
                });
            } else {
                this.props.serviceCmdbActions.nodeDetail(node.id)
                .then((data) => {
                    data['tags'] = (data['tgid'] == "" || data['tgid'] == null) ? [] : data['tgid']
                    if (data['opt'].other != undefined) {
                        Object.keys(data['opt'].other).map((key) => {
                            data['opt'][key] = data['opt'].other[key];
                        });
                        delete data['opt'].other
                    }
                    if (data['opt'].type) {
                        delete data['opt'].type
                    }

                    if ((data.type == "mysql" || data.type == "tomcat" || data.type == "linuxprocess" || data.type == "networkswitch") && data.opt.cid != undefined) {
                        let cid = data.opt.cid;
                        let hid = data.opt.hid;
                        if (hid == undefined || hid == "") data['opt'].ip = ""
                        Promise.all([
                            this.getHostListByCid(cid),
                            this.getIpListByHid(hid)
                        ]).then(() => {
                            let {clusterHostList} = this.state;
                            var clusterFlag = false;
                            for (var i = 0; i < clusterHostList.length; i++) {
                                if (hid == clusterHostList[i].nid) {
                                   clusterFlag = true;
                                }
                            }
                            if(clusterFlag){
                                this.setState({
                                    editNodeAble: true,
                                    updateNodeAble: true,
                                    modalTitle: "修改节点：" + node.title,
                                    modalType: "editNode",
                                    modalVisible: true,
                                    editNode: data
                                });
                            }else{
                                data['opt'].hid = "";
                                data['opt'].ip = "";
                                this.setState({
                                    editNodeAble: true,
                                    updateNodeAble: true,
                                    modalTitle: "修改节点：" + node.title,
                                    modalType: "editNode",
                                    modalVisible: true,
                                    editNode: data
                                });
                            }
                        })
                    } else {
                        this.setState({
                            editNodeAble: true,
                            updateNodeAble: true,
                            modalTitle: "修改节点：" + node.title,
                            modalType: "editNode",
                            modalVisible: true,
                            editNode: data
                        });
                    }
                })
            }
        })
    }
        //编辑关联关系
    openEditArrow(arrow) {
        var pcids = arrow.id.split("_");
        let relationInfo = {
            p: pcids[1],
            c: pcids[2],
            e: arrow.text
        }
        this.setState({
            modalTitle: "编辑关联描述信息",
            modalType: "relation",
            modalVisible: true,
            relationInfo: relationInfo
        });
    }

    //获取节点类型
    getNodeTypeList() {
        let { NODE_TYPES } = PDMapData
        let list = []
        for (let key in NODE_TYPES) {
            let o = {
                key,
                value: NODE_TYPES[key]['title']
            }
            list.push(o)
        }
        return list
    }
    //获取组类型
    getGroupTypeList() {
        let { GROUP_TYPES } = PDMapData
        let list = []
        for (let key in GROUP_TYPES) {
            let o = {
                key,
                value: GROUP_TYPES[key]['title'],
                color: GROUP_TYPES[key]['style'].stroke
            }
            list.push(o)
        }
        return list
    }
    //保存整张图
    savePDMap() {}
    //未使用节点拖拽
    dragNodeHandle(id, x, y) {
        x = x < 0 ? 0 : x;
        y = y < 0 ? 0 : y;
        var postdata = {
            nid: id,
            pos: {
                x: x,
                y: y
            }
        }
        this.props.serviceCmdbActions.saveNodeData(postdata)
        .then(() => {
            this.refreshPDMap();
        })
    }
    //保存单个节点拖拽
    savePDDragTarget(target) {
        let { NODE_TYPES } = PDMapData
        if (this.permission.looked) return
        if (NODE_TYPES[target.nodeType]) { //移动单个节点
            var postdata = {
                nid: target.id,
                pos: {
                    x: target['position'][0],
                    y: target['position'][1]
                }
            }
            this.props.serviceCmdbActions.saveNodeData(postdata);
        } else if (target.containerType && target.containerType.indexOf("group") > -1) { //移动单个组
            var postdata = {
                gid: target.id,
                pos: {
                    type: target.containerType,
                    x: target['position'][0],
                    y: target['position'][1]
                }
            }
            if (target.data.pos != undefined && target.data.pos.color != undefined) {
                postdata.pos.color = target.data.pos.color
            }

            this.props.serviceCmdbActions.saveGroupData(postdata)

        } else { //移动整个画布
            var moveX = target['movePosition'][0];
            var moveY = target['movePosition'][1];
            let data = this.transPDMapToDB(this.refs.pdMap.serialize())
            const { nodes, groups } = data;
            let postData = {
                nodes: [],
                groups: []
            }
            for (var key in nodes) {
                let node = Object.assign({}, nodes[key])
                node.pos.x += moveX;
                node.pos.y += moveY;
                if (node["c"] != undefined) {
                    delete node["c"]
                    delete node["e"]
                    delete node["p"]
                }
                postData.nodes.push(node)
            }
            for (var key in groups) {
                let group = Object.assign({}, groups[key])
                group.pos.x += moveX;
                group.pos.y += moveY;
                postData.groups.push(group)
            }
        }
    }
    receiveFromPDMap(func, ...args) {
        this[func].apply(this, args)
    }
    receiveFromTraceBack(func, ...args) {
        this[func].apply(this, args)
    }

    //删除节点
    openDelNodeMenu(node) {
        parent.window.confirm("确定要删除节点" + node.title + "吗？", () => {
            let list = [];
            list.push(node.id);
            this.batchRemoveFun({
                list
            })
        });
    }
    batchRemoveFun(options) {
        this.setState({
            loadingStatus: true
        })
        this.props.serviceCmdbActions.batchRemove(options)
        .then((res) => {
            if (res.success) {
                this.setState({
                    loadingStatus: false
                })
                parent.window.alert("删除成功！");
                this.refreshPDMap();
            }
        })
        .catch(() => {
            this.setState({
                loadingStatus: false
            })
            parent.window.alert("删除失败！");
        })
    }
        //删除组
    openDelGroupMenu(group) {
        parent.window.confirm("确定要删除节点组" + group.title + "吗？", () => {
            this.setState({
                loadingStatus: true
            })
            this.props.serviceCmdbActions.delGroup(group.id)
            .then(() => {
                this.setState({
                    loadingStatus: false
                })
                parent.window.alert("删除成功！");
                this.refreshPDMap();
            })
            .catch(() => {
                this.setState({
                    loadingStatus: false
                })
                parent.window.alert("删除失败！");
            })
        });
    }
    //节点详情
    openDetailNode(node, active) {
        this.setState({
            editNodeAble: false,
            modalTitle: "节点详情：" + node.title,
            modalType: "nodeDetail",
            modalVisible: true,
            activeNode: node
        })

        setTimeout(() => {
            this.setActiveTab(active)
        }, 10)
    }

    //修改节点信息
    updateNode(editNode) {
        var postObj = {
            auto: editNode.auto,
            des: editNode.des,
            gid: editNode.gid,
            nn: editNode.nn, //资产名称
            opt: editNode.opt,
            pos: editNode.pos,
            st: editNode.st,
            stgy: editNode.stgy,
            type: editNode.type,
            used: editNode.used,
            cid: editNode.opt.cid,
            tgid: editNode['tags'] ? editNode['tags'] : editNode['tgid'],
        }
        let text = "";
        if (editNode.nid == undefined || editNode.nid == "") {
            text = "添加";
        } else {
            postObj.nid = editNode.nid
            text = "修改";
        }
        this.setState({
            loadingStatus: true
        })
        this.props.serviceCmdbActions.addNode(postObj)
        .then((res) => {
            this.setState({
                modalTitle: "",
                modalType: '',
                modalVisible: false,
                loadingStatus: false
            });
            parent.window.alert(text + "成功！");
            this.refreshPDMap(res.nid);
            this.resetEditNode();
        })
        .catch((res) => {
            this.setState({
                loadingStatus: false
            })
            if (res.code == "11002") {
                parent.window.alert("节点名称重复，请重新输入！");
            } else if (res.code == "11018") {
                parent.window.alert("IP地址重复，请重新填写！");
            } else if (res.code == "11022") {
                parent.window.alert("业务节点端口重复，请重新填写！");
            } else if (res.code == "11024") {
                parent.window.alert("管理IP重复，请重新填写！");
            } else if (res.code == "11006") {
                parent.window.alert("IP地址不能为空，请重新选择！");
            } else {
                parent.window.alert(text + "失败！");
            }
        })
    }
        //验证节点
    validNodeName(nodeName) {
        if (nodeName == null || nodeName == "") {
            parent.window.alert('请输入节点名称');
            this.setState({ nodeNameValid: false });
            return false;
        } else {
            this.setState({ nodeNameValid: true });
            return true;
        }
    }
    validNodeType(nodeType) {
        if (nodeType == null || nodeType == "") {
            parent.window.alert('请选择节点类型');
            this.setState({ nodeTypeValid: false });
            return false;
        } else {
            this.setState({ nodeTypeValid: true });
            return true;
        }
    }
    validNodeIp(ip) {
        if (ip == null || ip == "") {
            return 1;
        } else {
            if (!$s.validIP(ip)) {
                return 2;
            } else {
                return 0;
            }
        }
    }
    validCluster(cluster) {
        if (cluster == null || cluster == "") {
            return false;
        } else {
            return true;
        }
    }
    validPort(port) {
        if ($s.isNumber(port)) {
            return 1;
        } else {
            return 2;
        }
    }
    //modal确定事件
    editNodeFun() { //修改节点
        let that = this
        let editNode = this.state.editNode;
        let { opt, type } = editNode;
        editNode.nn = editNode.nn.trim();
        if (this.validNodeName(editNode.nn) &&
            this.validNodeType(type)
        ) {
            if (type == "virtual") {
                if (opt["thumbnail"] == undefined || opt["thumbnail"] == "" || opt["thumbnail"] == null) {
                    parent.window.alert("请选择图标！");
                    return;
                } else {
                    let file = opt["thumbnail"];                    
                    if (file.name == undefined) {
                        this.updateNode(editNode)
                    } else {
                        var xhr;
                        var timestamp = new Date().getTime();
                        var fileName = file.name.split(".")[0] + timestamp + "." + file.name.split(".")[1]
                        if (window.ActiveXObject) {
                            xhr = new ActiveXObject("Microsoft.XMLHTTP");
                        } else {
                            xhr = new XMLHttpRequest();
                        }
                        xhr.open("POST", CMDB_BASEPATH + "/thumbnail/save?name=" + fileName);
                        xhr.setRequestHeader('PARA_ATOKEN', localStorage.getItem("PARA_ATOKEN"));
                        xhr.send(file);
                        xhr.onreadystatechange = function() {
                            if (xhr.readyState == 4) {
                                if (xhr.status == 200) {
                                    var result = JSON.parse(xhr.responseText)
                                    if (result.success) {
                                        opt["thumbnail"] = fileName;
                                        editNode.opt = opt;
                                        that.updateNode(editNode)
                                    } else {
                                        parent.window.alert("图片上传失败！")
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (type == "host") { //服务器节点不验证ipCheck接口
                let validClusterFlag = this.validCluster(editNode.opt.cid)
                let validIpFlag = this.validNodeIp(editNode.opt.ip);
                if (validClusterFlag && validIpFlag == 0) {
                    this.updateNode(editNode)
                } else {
                    let validTps = {}
                    if (!validClusterFlag) {
                        validTps.cid = false
                    }
                    if (validIpFlag == 1 || validIpFlag == 2) {
                        validTps.ip = false
                    }
                    this.setState({
                        validTps: validTps
                    });
                    if ((validIpFlag == 1 && validClusterFlag) || !validClusterFlag) {
                        parent.window.alert("请将信息补全再提交！");
                        return false;
                    }
                    if (validIpFlag == 2) {
                        parent.window.alert('请输入正确的IP地址！');
                        return false;
                    }
                }
            } else {
                let optValid = 1;
                let validIpFlag = 0;
                let validTps = {};
                let tpls = nodeTpls[type].params;
                Object.keys(tpls).map(opt_key => {
                    if (editNode.opt[opt_key] == "" || editNode.opt[opt_key] == undefined) {
                        optValid = 0;
                        validTps[opt_key] = false
                    }
                    if (type != "networkswitch" && opt_key == "port" && editNode.opt.port != "") {
                        optValid = this.validPort(editNode.opt.port);
                    }
                    if (type == "networkswitch") {
                        validIpFlag = this.validNodeIp(editNode.opt.nip);
                        optValid = (validIpFlag == 1 || validIpFlag == 2) ? 0 : 1
                    }
                })
                if (optValid === 1) {
                    this.updateNode(editNode);
                } else if (optValid === 2) {
                    parent.window.alert("端口请输入数字！");
                } else if (optValid === 0) {
                    this.setState({
                        validTps: validTps
                    })
                    parent.window.alert("请将信息补全再提交！");
                } else {
                    parent.window.alert('请输入正确的IP地址！');
                }
            }
        }
    }
    //验证组别
    validGroupName(groupName) {
        if (groupName == null || groupName == "") {
            parent.window.alert('请输入节点组名称');
            this.setState({ groupNameValid: false });
            return false;
        } else {
            this.setState({ groupNameValid: true });
            return true;
        }
    }
    //修改组别
    editGroupFun() {
        let editGroup = this.state.editGroup
        editGroup.gn = editGroup.gn.trim();
        if (this.validGroupName(editGroup.gn)) {
            this.setState({
                loadingStatus: true
            })
            let text = editGroup.gid != undefined && editGroup.gid != "" ? "修改" : "添加";
            this.props.serviceCmdbActions.addGroup(editGroup)
            .then(() => {
                this.setState({
                    modalTitle: "",
                    modalType: '',
                    modalVisible: false,
                    loadingStatus: false
                });
                parent.window.alert(text + "成功！");
                this.resetEditGroup();
                this.refreshPDMap("", editGroup.gn);
            })
            .catch((response) => {
                this.setState({
                    loadingStatus: false
                })
                if (response.code) {
                    parent.window.alert(text + "失败，组名已存在，请重新填写！");
                } else {
                    parent.window.alert(text + "修改失败！");
                }
            })
        }
    }
    //高级检索
    search() {
        this.setState({
            loadingStatus: true
        })
        this.refreshPDMap();
        this.setState({
            modalTitle: "",
            modalType: '',
            modalVisible: false,
            loadingStatus: false
        })
    }

    //绑定故障规则
    bindWarnRule() {
        this.setState({
            loadingStatus: true
        })
        let { nid, nodeRuleList, unNodeRuleList } = this.state.warnRule;
        let tags = [];
        nodeRuleList.map(item => {
            let tag = item.tag;
            let tag1 = tag.indexOf("!") == 0 ? tag.substring(1, tag.length) : "!" + tag;
            tags.push(tag, tag1)
        })
        this.props.serviceXmonitorActions.bindRule({
            node_id: nid,
            tags: tags
        })
        .then(res => {
            if (res.success) {
                this.setState({
                    modalTitle: "",
                    modalView: "",
                    modalVisible: false,
                    warnRule: {
                        nid: "",
                        nodeRuleList: [],
                        unNodeRuleList: []
                    },
                    loadingStatus: false

                })
                parent.window.alert("绑定成功!");
            }
        })
    }
    //保存关联关系描述
    updateRelation() {
        const { relationInfo } = this.state;
        this.props.serviceCmdbActions.updateNodeRelation(relationInfo)
        .then((res) => {
            if (res.success) {
                this.setState({
                    modalTitle: "",
                    modalView: "",
                    modalVisible: false,
                    loadingStatus: false
                });
                parent.window.alert('保存成功！');
                this.refreshPDMap();
            } else {
                this.setState({
                    loadingStatus: false
                });
                parent.window.alert('保存失败！');
            }
        })
    }
    //一键追溯
    openTraceBack(node) {
        this.openTraceBackById(node.id)
    }
    // 根据nodeid追溯
    openTraceBackById(nodeId, type) {
        var that = this;
        var nqsArr = [];
        let counter = 0;
        let nodesInfo = [];
        let nodeOwnedFault = [];
        let alarmView = [];
        const { pdMap } = this.refs;
        Promise.all([
            this.props.serviceCmdbActions.nodeFault({ nid: nodeId })
            .then(res => {
                var tempArr = [];
                var fpths = res.fpth;
                if (fpths.length > 0) {
                    fpths.map(item => {
                        if (item.nq.length > 0) {
                            let nqs = item.nq;
                            nqs.map(nq => {
                                tempArr.push(nq)
                            })
                        }
                    })
                }
                for (var i = 0; i < tempArr.length; i++) {
                    if (nqsArr.indexOf(tempArr[i]) == -1) {
                        nqsArr.push(tempArr[i]);
                    }
                }
                if (nqsArr.length > 0) {
                    Promise.all([
                        this.props.serviceXmonitorActions.assetInfoByNids({ node_id: nqsArr.join(",") })
                        .then(response => {
                            if (response.length == 0) {
                                counter++;
                            } else {
                                for (var j = 0; j < response.length; j++) {
                                    let message = response[j].message;
                                    let displayUnit =response[j].displayUnit == null ? "" : response[j].displayUnit;
                                    let expressionValue = this.getExpressionValue(response[j].alarmValue,response[j].displayUnit);
                                    let threshold = this.getExpressionValue(response[j].threshold,response[j].displayUnit);
                                    let faultError = response[j].message != undefined ? response[j].message :  moment(response[j].firstAlarm).format("YYYY-MM-DD HH:mm:ss") + " -- 节点 " + response[j].nodeName + " -- " + 
                                                     response[j].beginning + response[j].condition + threshold + displayUnit + "( " + expressionValue + displayUnit + " )" + "产生告警";
                                    let nodeInfo = {
                                        nodeId: response[j].nodeId,
                                        nodeName: response[j].nodeName,
                                        alarmTimeStamp: moment(response[j].firstAlarm).format("YYYY-MM-DD HH:mm:ss"),
                                        analyzeResult: response[j].analyzeResult,
                                        stdError: response[j].message != undefined ? response[j].message : moment(response[j].firstAlarm).format("YYYY-MM-DD HH:mm:ss") + " -- " + 
                                                  response[j].nodeName + " -- " + response[j].beginning + response[j].condition + threshold +displayUnit + "( " + expressionValue + displayUnit + " )" + "产生告警",
                                        faultError: faultError
                                    }
                                    if(nodeId == response[j].nodeId){
                                        nodeOwnedFault.push(nodeInfo);
                                    }else{
                                        nodesInfo.push(nodeInfo)
                                    }
                                }
                            }
                        })
                    ])
                    .then(() => {
                        Promise.all([
                            this.props.serviceCmdbActions.hardWareInfoByNid({ host_ids: nqsArr.join(",") })
                            .then(res => {
                                if (res.length == 0) {
                                    counter++;
                                } else {
                                    for (var k = 0; k < res.length; k++) {
                                        let node = {
                                            nodeId: res[k].hostId,
                                            nodeName: res[k].nodeName,
                                            alarmTimeStamp: moment(res[k].firstAlarm).format("YYYY-MM-DD HH:mm:ss"),
                                            analyzeResult: "",
                                            stdError: res[k].message,
                                            faultError: res[k].message
                                        }
                                        if(nodeId == res[k].hostId){
                                            nodeOwnedFault.push(node)
                                        }else{
                                            nodesInfo.push(node);   
                                        }
                                    }
                                }
                                if (counter == 2) {
                                    nodeOwnedFault[0] = {
                                        alarmTimeStamp: "",
                                        faultError: "",
                                        analyzeResult: ""  
                                    }
                                    nodesInfo[0] = {
                                        alarmTimeStamp: "",
                                        faultError: "",
                                        analyzeResult: ""
                                    }
                                } else {
                                    nodesInfo.map(item =>{
                                        let pdNode = this.refs.pdMap.nodes[item.nodeId];
                                        let undefinedPdNodeId = null;
                                        let position = [];
                                        let title = "";
                                        if (pdNode == undefined) {
                                            undefinedPdNodeId = item.nodeId;
                                            this.props.serviceCmdbActions.nodeDetail(undefinedPdNodeId)
                                                .then(res => {
                                                    title = res.nn;
                                                    position[0] = res.pos.x * pdMap.status.scale;
                                                    position[1] = res.pos.y * pdMap.status.scale;
                                                })
                                        } else {
                                            title = pdNode.title;
                                            position = this.refs.pdMap.getNodeOffset(pdNode)
                                        }
                                        alarmView.push(item);
                                    })
                                    if(nodeOwnedFault.length > 0){
                                        alarmView.push(nodeOwnedFault[0])
                                    }
                                }
                            })
                        ])
                    })
                }
            })
        ])
        .then(() => {
            setTimeout(() => {
                const { traceBackNodes } = this.state;
                const { pdMap } = this.refs;
                const { NODE_INFO } = this.refs.pdMap.state.config
                let pdNode = pdMap.nodes[nodeId];
                let position = [
                    pdMap.getNodeOffset(pdNode)[0] + pdMap.rootGroup.position[0],
                    pdMap.getNodeOffset(pdNode)[1] + pdMap.rootGroup.position[1]
                ];
                let texts = {}
                alarmView.map(item => {
                    if (item.nodeId != nodeId) {
                        item.state = 1;
                    } else {
                        item.state = 0;
                    }
                    texts[item.nodeId] = item
                })

                //如果没有节点发生故障，仅显示自己的节点
                if (texts[nodeId] == undefined) {
                    texts[nodeId] = {
                        alarmTimeStamp: "",
                        faultError: "",
                        analyzeResult: ""
                    }
                }
                let tbNode = {
                    target: nodeId,
                    texts: texts
                }
                if (type == undefined) { //如果溯源窗口存在，不重新计算位置
                    if (position[0] + 500 + NODE_INFO['width'] >= pdMap.state.mapWidth) {
                        tbNode.left = position[0] - 500 + this.mapPos[0] + 200;
                    } else {
                        tbNode.left = position[0] + this.mapPos[0] + NODE_INFO['width'] / 2 * pdMap.status.scale + 200;
                    }
                    if (position[1] + 300 + NODE_INFO['height'] >= pdMap.state.mapHeight) {
                        tbNode.top = position[1] - 300 + this.mapPos[1];
                    } else {
                        tbNode.top = position[1] + this.mapPos[1] + NODE_INFO['height'] / 2 * pdMap.status.scale;
                    }
                    let maxLeft = document.body.clientWidth - 500 - 15;
                    let maxTop = document.body.clientHeight - 300 - 50;
                    tbNode.left = tbNode.left < 0 ? 0 : tbNode.left;
                    tbNode.left = tbNode.left > maxLeft ? maxLeft : tbNode.left;
                    tbNode.top = tbNode.top < 0 ? 0 : tbNode.top;
                    tbNode.top = tbNode.top > maxTop ? maxTop : tbNode.top;
                }
                let currentNode = traceBackNodes[nodeId];
                if (currentNode) {
                    Object.assign(currentNode, tbNode);
                } else {
                    traceBackNodes[tbNode.target] = tbNode;
                }
                /****为了让是自己的故障弹框显示在最上面 */
                Object.keys(traceBackNodes).map(id => {
                    if (traceBackNodes[id].zIndex) traceBackNodes[id].zIndex = 90;
                })
                tbNode.zIndex = 1000;
                if (type == undefined) { //如果溯源窗口存在，不重新画线
                    //设置节点到框的箭头
                    let pdNodeForTraceBack = {
                        left: position[0] + NODE_INFO['width'] / 2 * pdMap.status.scale,
                        top: position[1] + NODE_INFO['height'] / 2 * pdMap.status.scale,
                        texts: {},
                        target: 'self'
                    }
                    this.addOverlayArrowToTraceBacks(pdNodeForTraceBack, tbNode, 0.25, true)
                        //设置框之间的箭头
                    Object.keys(traceBackNodes).map(id => {
                        if (Object.keys(traceBackNodes[id].texts).find(key => traceBackNodes[id].target != nodeId && key == nodeId)) {
                            this.addOverlayArrowToTraceBacks(traceBackNodes[id], tbNode, 0.54)
                        }
                        if (Object.keys(tbNode.texts).find(key => key != nodeId && key == traceBackNodes[id].target)) {
                            this.addOverlayArrowToTraceBacks(tbNode, traceBackNodes[id], 0.54)
                        }
                    })
                }
                this.setState({
                    traceBackNodes: traceBackNodes
                })
            }, 1000)
        })
    }
    //添加悬浮的溯源箭头，arrowRatio为箭头在连线上的位置，以距起点的比例表示
    addOverlayArrowToTraceBacks(start, end, arrowRatio = 0, fromNode = false) {
        let tbWidth = tbNode => 500;
        let tbHeight = tbNode => { let height = 207 + Object.keys(tbNode.texts).length * 29; return (height > 300 ? 300 : height) };
        let startPos;
        if (fromNode) {
            startPos = {
                x: start.left,
                y: start.top
            };
        } else {
            startPos = {
                x: start.left + tbWidth(start) / 2 - this.mapPos[0],
                y: start.top + tbHeight(start) / 2 - this.mapPos[1]
            };
        }
        let endPos = {
            x: end.left + tbWidth(end) / 2 - this.mapPos[0],
            y: end.top + tbHeight(end) / 2 - this.mapPos[1]
        };
        let oldArrow = this.traceBackArrows.find(arrow => arrow.origin == start.target && arrow.target == end.target)
        let option = {
            color: "#f00",
            arrowPoint: {
                x: endPos.x * arrowRatio + startPos.x * (1 - arrowRatio),
                y: endPos.y * arrowRatio + startPos.y * (1 - arrowRatio),
            },
            radius: 6,
            fromNode: fromNode ? end.target : null,
            arrowRatio: arrowRatio
        }

        if (oldArrow) {
            this.refs.pdMap.refreshArrow(this.refs.pdMap.overlayArrows[oldArrow.id], startPos, endPos, option, false)
            Object.assign(oldArrow, {
                startPos: startPos,
                endPos: endPos
            })
        } else {
            let newArrow = this.refs.pdMap.addOverlayArrow(startPos, endPos, option);
            this.traceBackArrows.push({
                id: newArrow.id,
                origin: start.target,
                target: end.target,
                startPos: startPos,
                endPos: endPos,
                arrowRatio: arrowRatio
            })
        }
    }
    //关闭某一节点的溯源框
    closeTraceBackById(id) {
        const { traceBackNodes } = this.state
        if (traceBackNodes[id]) {
            delete traceBackNodes[id]
            let toDelete = []
            this.traceBackArrows.map((tbArrow, i) => {
                if (tbArrow.origin == id || tbArrow.target == id) {
                    if (this.refs.pdMap.overlayArrows[tbArrow.id]) {
                        this.refs.pdMap.overlayGroup.remove(this.refs.pdMap.overlayArrows[tbArrow.id])
                        delete this.refs.pdMap.overlayArrows[tbArrow.id]
                        toDelete.push(tbArrow.id)
                    }
                }
            })
            for (let i = 0; i < toDelete.length; i++) {
                let arrowToDelete = this.traceBackArrows.find(arrow => arrow.id == toDelete[i])
                if (arrowToDelete) this.traceBackArrows.splice(this.traceBackArrows.indexOf(arrowToDelete), 1)
            }
            this.setState({
                traceBackNodes: traceBackNodes
            })

        } else {
            console.error("closeTraceBackById() 错误: 未找到追溯节点")
        }
    }
    //将溯源框置顶
    putTraceBackToFront(id) {
        const { traceBackNodes } = this.state
        if (traceBackNodes[id]) {
            Object.values(traceBackNodes).map(item => {
                if (item.zIndex) item.zIndex = 90
            })
            traceBackNodes[id].zIndex = 1000;
            this.setState({
                traceBackNodes: traceBackNodes
            })
        } else {
            console.error("putTraceBackToFront() 错误: 未找到追溯节点")
        }
    }
    //拖拽溯源框，移动其位置
    moveTraceBackWindow(id, deltaX, deltaY) {
        const { traceBackNodes } = this.state
        const { pdMap } = this.refs
        const { NODE_INFO } = this.refs.pdMap.state.config
        if (traceBackNodes[id]) {
            let oldLeft = traceBackNodes[id].left
            let oldTop = traceBackNodes[id].top
            traceBackNodes[id].left += deltaX
            traceBackNodes[id].top += deltaY

            let maxLeft = document.body.clientWidth - 500 - 15;
            let maxTop = document.body.clientHeight - document.getElementById("traceBack_" + id).offsetHeight - 50;
            traceBackNodes[id].left = traceBackNodes[id].left < 0 ? 0 : traceBackNodes[id].left;
            traceBackNodes[id].left = traceBackNodes[id].left > maxLeft ? maxLeft : traceBackNodes[id].left;
            traceBackNodes[id].top = traceBackNodes[id].top < 0 ? 0 : traceBackNodes[id].top;
            traceBackNodes[id].top = traceBackNodes[id].top > maxTop ? maxTop : traceBackNodes[id].top;

            this.traceBackArrows.map((tbArrow, i) => {
                if (tbArrow.origin == id || tbArrow.target == id) {
                    if (this.refs.pdMap.overlayArrows[tbArrow.id]) {
                        if (tbArrow.origin == id) {
                            tbArrow.startPos.x += traceBackNodes[id].left - oldLeft
                            tbArrow.startPos.y += traceBackNodes[id].top - oldTop
                        }
                        if (tbArrow.origin == 'self') {
                            let pdNode = pdMap.nodes[tbArrow.target]
                            tbArrow.startPos.x = pdMap.getNodeOffset(pdNode)[0] + pdMap.rootGroup.position[0] + NODE_INFO['width'] / 2 * pdMap.status.scale
                            tbArrow.startPos.y = pdMap.getNodeOffset(pdNode)[1] + pdMap.rootGroup.position[1] + NODE_INFO['height'] / 2 * pdMap.status.scale
                        }
                        if (tbArrow.target == id) {
                            tbArrow.endPos.x += traceBackNodes[id].left - oldLeft
                            tbArrow.endPos.y += traceBackNodes[id].top - oldTop
                        }
                        let option = {
                            arrowPoint: {
                                x: tbArrow.endPos.x * tbArrow.arrowRatio + tbArrow.startPos.x * (1 - tbArrow.arrowRatio),
                                y: tbArrow.endPos.y * tbArrow.arrowRatio + tbArrow.startPos.y * (1 - tbArrow.arrowRatio),
                            },
                        }
                        this.refs.pdMap.refreshArrow(this.refs.pdMap.overlayArrows[tbArrow.id], tbArrow.startPos, tbArrow.endPos, option, false)
                    }
                }
            })
            this.setState({
                traceBackNodes: traceBackNodes
            })
        } else {
            console.error("resetTraceBackWindow() 错误: 未找到追溯节点")
        }
    }
    //监控信息
    openMonitor(node) {
        let nodeType = node.nodeType;
        let nodeName = node.title;
        let url = "";
        if (node.nodeType == "virtual") {
            parent.window.alert('虚拟节点暂无监控信息！');
        } else {
            if (node.nodeType == "mysql") {
                url = 'paradata_mysql?orgId=1&from=now-3h&to=now';
            } else if (node.nodeType == "tomcat") {
                url = 'paradata_tomcat?orgId=1&from=now-3h&to=now';
            } else if (node.nodeType == "host") {
                url = 'paradata_node?orgId=1&var-hostname=' + nodeName;
            } else if (node.nodeType == "linuxProcess") {
                url = 'paradata_proc?orgId=1';
            }
            this.setState({
                modalTitle: "监控信息",
                modalVisible: true,
                modalType: "monitor",
                monitor: {
                    url: url
                }
            })
        }
    }
    closeTraceBack() {
        this.setState({
            traceBackNodes: {}
        })
    }
    okModal() {
        this.setState({
            loadingStatus: true
        })
        const { modalType } = this.state
        switch (modalType) {
            case "editGroup":
                this.editGroupFun(); //新建，修改组
                break;
            case "editNode":
                this.editNodeFun(); //新建，修改节点
                break;
            case "highSearch":
                this.search(); //高级检索
                break;
            case "relation": //关联关系描述
                this.updateRelation();
                break;
            case "batchModify": //批量修改
                this.batchModifyFun();
                break;
            case "batchAdd": //批量修改
                this.batchAddFun();
                break;
        }

    }

    //重置节点字段
    resetEditNode() {
        this.setState({
            editNode: {
                auto: false,
                des: "",
                gid: "",
                logo: "",
                nn: "",
                opt: {},
                pos: {},
                st: 0,
                stgy: 0,
                type: "",
                used: true,
                nid: "",
            },
            nodeNameValid: true,
            nodeTypeValid: true,
            clusterHostList: [],
            hostIpList: [],
            validTps: {}
        })
    }
    //重置组别字段
    resetEditGroup() {
        this.setState({
            editGroup: {
                gn: '', //是	组名称
                pos: {}, //是	json,组位置
                des: ''
            },
            groupNameValid: true,
            groupTypeValid: true
        })
    }
    resetHighsearch() {
        this.setState({
            searchParams: {
                gid: "", //组id,多个用逗号隔开
                nid: "", //节点id,多个用逗号隔开
                tgid: "", //标签id,多个用逗号隔开
                type: "", //类型,多个用逗号隔开
                st: "",
                auto: "",
                nn: ""
            }
        })
    }
    resetRelation() {
        this.setState({
            relationInfo: {
                p: "",
                c: "",
                e: ""
            }
        })
    }
    resetBatchAdd() {
        this.setState({
            batchNodes: {
                stgy: 0, //是	策略id
                des: "", //否	节点描述
                gid: "", //否	节点组ID
                tags: "" //否	标签,最多三个,逗号隔开
            }
        })
    }
    resetBatchModify() {
        this.setState({
            batchAddGroup: {
                gid: ""
            }
        })
    }
    //关闭模态框
    cancelModal() {
        this.setState({
            modalType: "",
            modalTitle: "",
            modalVisible: false
        })
        const { modalType, activeTab } = this.state
        switch (modalType) {
            case "editGroup":
                this.resetEditGroup(); //新建，修改组
                break;
            case "editNode":
                this.resetEditNode(); //新建，修改节点
                break;
            case "nodeDetail":
                this.resetEditNode();
                this.setState({
                    alarmInfo: {
                        defaultText: "",
                        result: []
                    }
                    //监控
                    ,
                    monitor: {
                        url: ""
                    },
                    warnRule: {
                        nid: "",
                        nodeRuleList: [],
                        unNodeRuleList: []
                    }
                })
                break;
            case "highSearch":
                this.resetHighsearch();
                break;
            case "relation": //关联关系描述
                this.resetRelation();
                break;
            case "batchAdd":
                this.resetBatchAdd();
                break;
            case "batchModify":
                this.resetBatchModify();
                break;
        }

    }
    //重置画布
    resetPDMap() {
        this.refs.pdMap.state.keyword = ""
        Promise.all([
                this.resetHighsearch()
            ])
            .then(() => {
                this.refreshPDMap();
            })
    }
    //高级
    openHighSearchModal() {
        Promise.all([
            this.props.serviceCmdbActions.tagList(),
            this.props.serviceCmdbActions.groupList(),
        ]).then(() => {
            this.setState({
                modalTitle: "高级检索",
                modalVisible: true,
                modalType: "highSearch"
            })
        })
    }
    //工具栏，查看通知
    viewNotifications() {
        for (let i in this.notifications) {
            console.log(this.notifications[i].title + ": " + this.notifications[i].content)
        }
        this.notifications = []
        this.refs.pdMap.setNotificationCount(0);
    }


    //liutt add向源头发送选中group的消息
    selectGroup(group,logoFlag) {
        if (this.useLocationParams("origin") == "paradata") { //判断源头是paradata
            let groupLogo = [];
            let groupId = [];
            let groupName = [];
            let realLogo = "";
            for( var i=0;i<group.length;i++ ){
                if (groupId.indexOf(group[i].id) == -1){
                    groupId.push(group[i].id);
                } 
                if (groupName.indexOf(group[i].title) == -1){
                    groupName.push(group[i].title);
                } 
                Object.keys(this.state.topologyData.nodes).map((key) => {
                    let item = this.state.topologyData.nodes[key];
                    if (item.gid == group[i].id && item.opt != undefined && item.opt.type != undefined && item.opt.type == "virtual") {
                        groupLogo.push(item.opt.thumbnail);
                    }
                });
            }
            if( logoFlag != "" && logoFlag != undefined){
                this.logoFlag = logoFlag;
            }
            if( this.logoFlag != ""){
                for(var i=0;i<groupLogo.length;i++){
                    if( this.logoFlag == groupLogo[i]){
                        realLogo = this.logoFlag;
                    }else{
                        realLogo = groupLogo[0];
                    }
                }
            }else{
                realLogo = groupLogo[0];
            }
            let data = {
                type: "group",
                data: {
                    groupId: groupId,
                    groupName: groupName,
                    logo: realLogo,
                }
            }
            window.parent.postMessage(data, '*');
        }
    }

    //选择的节点向源头发送消息
    selectNodes(nodes) {
        var that = this;
        if (this.useLocationParams("origin") == "paradata") {
            var promise = new Promise(function(resolve, reject) {
                let selectedNodes = [];
                if ($s.isEmptyObject(nodes)) {
                    resolve(selectedNodes)
                } else {
                    Object.keys(nodes).map((key) => {
                        let item = that.props.allData.nodes[key];
                        if (item != undefined) {
                            if (item.opt.hid != "" && item.opt.cid != "") {
                                selectedNodes.push({
                                    nodeId: key,
                                    hostId: item.opt.hid,
                                    cluster: item.opt.cid
                                })
                                resolve(selectedNodes)
                            }      
                        }else{
                            resolve(selectedNodes)
                        }
                    })
                }

            });
            promise.then(res => {
                let data = {
                    type: "nodes",
                    data: res
                }
                window.parent.postMessage(data, '*');
            })
        }
    }

    //批量操作
    batchModifyFun() {
        let { selectedGroups } = this.refs.pdMap.status;
        let { stgy, des, gid, tags } = this.state.batchNodes;
        let batchNodes = []
        Object.keys(selectedGroups).map(key => {
            let nodeMap = Object.assign({}, selectedGroups[key]);
            let node = nodeMap.data;
            node.stgy = stgy == "" ? node.stgy : stgy;
            node.des = des == "" ? node.des : des;
            node.gid = gid == "" ? node.gid : gid;
            node.tgid = tags == "" ? node.tgid : tags
            if (node.opt && node.opt.cid) {
                node.cid = node.opt.cid
            }
            if (node["c"] != undefined) {
                delete node["c"]
                delete node["e"]
                delete node["p"]
            }
            batchNodes.push(node)
        });

        this.setState({
            loadingStatus: true
        })
        this.props.serviceCmdbActions.batchModify({
            nodes: batchNodes
        }).then((res) => {
            if (res.success) {
                this.setState({
                    batchNodes: {
                        type: "", //是	节点类型
                        stgy: 0, //是	策略id
                        des: "", //否	节点描述
                        gid: "", //否	节点组ID
                        tgid: "", //否	标签,最多三个,逗号隔开
                        tags: ""
                    },
                    modalTitle: "",
                    modalType: "",
                    modalVisible: false,
                    loadingStatus: false
                })
                parent.window.alert("批量修改成功！");
                this.refreshPDMap();
            }
        })
        .catch(res => {
            this.setState({
                loadingStatus: false
            })
            parent.window.alert("批量修改失败！");
        })
    }
    batchAddFun() {
        let { selectedGroups } = this.refs.pdMap.status;
        let { gid } = this.state.batchAddGroup;
        let nids = []
        let nodes = []
        Object.keys(selectedGroups).map(key => {
            nids.push(key)
        });
        let group = null;
        this.props.groupList.map(item => {
            if (item.gn == gid) {
                group = item;
            }
        });
        this.setState({
            loadingStatus: true
        })

        if (nids.length > 0) {
            if (group == null) {
                if(this.validGroupName(gid)){
                    this.props.serviceCmdbActions.addGroup({
                        gn: gid,
                        pos: {
                            color: "#00a0e9",
                            type: "group1",
                            x: Math.random() * 100,
                            y: Math.random() * 100
                        },
                        des: ""
                    }).then((res) => {
                        Object.keys(selectedGroups).map(key => {
                            selectedGroups[key].data.gid = res.gid;
                            if (selectedGroups[key].data.opt && selectedGroups[key].data.opt.cid) {
                                selectedGroups[key].data.cid = selectedGroups[key].data.opt.cid
                            }
                            nodes.push(selectedGroups[key].data);
                        });
                        this.props.serviceCmdbActions.batchModify({
                            nodes: nodes
                        }).then((res) => {
                            if (res.success) {
                                this.setState({
                                    batchAddGroup: {
                                        gid: ""
                                    },
                                    modalTitle: "",
                                    modalType: "",
                                    modalVisible: false,
    
                                    loadingStatus: false
                                })
                                parent.window.alert("批量添加组成功！");
                                this.refreshPDMap();
                            }
                        })
                    })
                    .catch(res => {
                        this.setState({
                            loadingStatus: false
                        })
                        if (res.code == "11002") {
                            parent.window.alert("批量添加组失败，组名已存在！");
                        } else {
                            parent.window.alert("批量添加组失败！");
                        }
                    })
                }
            } else {
                Object.keys(selectedGroups).map(key => {
                    selectedGroups[key].data.gid = group.gid;
                    if (selectedGroups[key].data.opt && selectedGroups[key].data.opt.cid) {
                        selectedGroups[key].data.cid = selectedGroups[key].data.opt.cid
                    }
                    nodes.push(selectedGroups[key].data);
                });
                this.props.serviceCmdbActions.batchModify({
                    nodes: nodes
                }).then((res) => {
                    if (res.success) {
                        this.setState({
                            batchAddGroup: {
                                gid: ""
                            },
                            modalTitle: "",
                            modalType: "",
                            modalVisible: false,
                            loadingStatus: false
                        })

                        parent.window.alert("批量添加组成功！");
                        this.refreshPDMap();
                    }
                })
                .catch(res => {
                    this.setState({
                        loadingStatus: false
                    })
                    parent.window.alert("批量添加组失败！");
                })
            }
        } else {
            this.setState({
                modalTitle: "",
                modalType: "",
                modalVisible: false,
                loadingStatus: false
            })
        }
    }
    batchAdd(selectedNodes) {
        Promise.all([
            this.props.serviceCmdbActions.groupList()
        ]).then(() => {
            this.setState({
                modalTitle: "批量添加组",
                modalType: "batchAdd",
                modalVisible: true
            })
        })
    }
    batchModify(selectedNodes) {
        Promise.all([
            this.props.serviceCmdbActions.tagList(),
            this.props.serviceCmdbActions.groupList()
        ]).then(() => {
            this.setState({
                modalTitle: "批量修改",
                modalType: "batchModify",
                modalVisible: true
            })
        })
    }
    batchRemove(selectedNodes) {
        let list = [];
        let unautolist = [];
        Object.keys(selectedNodes).map(key => {
            let node = selectedNodes[key];
            list.push(node.id)
        })

        if (list.length > 0) {
            parent.window.confirm("确定要删除已选定节点吗？", () => {
                this.batchRemoveFun({
                    list
                });
            });
        } else {
            parent.window.alert("请至少选择一个节点进行操作！")
        }

    }

    //根据ip地址查找集群cid，服务器hid
    getHostIdByIp(node) {
        var that = this
        return new Promise(function(resolve, reject) {
            let ip = node.opt != undefined && node.opt.ip != undefined ? node.opt.ip : "";
            if (node.opt != undefined && node.opt.cid != undefined && node.type == "host") {
                let obj = {}
                obj.hid = node.nid
                obj.cid = node.opt.cid;
                resolve(obj)
            } else {
                if (ip != "") {
                    that.props.serviceCmdbActions.getCid(ip)
                    .then((res) => {
                        resolve(res);
                    })
                    .catch(res => {
                        resolve({
                            hid: "",
                            cid: ""
                        });
                    })
                }
            }
        });
    }
    //绑定规则 
    bindRule(item, key, type) {
        this.setState({
            loadingStatus: true
        })
        let node = this.state.activeNode.data;
        let { nodeRuleList, unNodeRuleList } = this.state.warnRule
        let postData = {
            ruleId: key,
            addNodes: [],
            deleteNodes: []
        }
        let postObj = {
            cluster: node.opt.cid,
            nodeId: node.nid,
            hostId: node.opt.hid
        }
        if (postObj.hostId == undefined || postObj.hostId == "" || postObj.cluster == "") {
            parent.window.alert("该业务节点没有对应的服务器节点！")
            return;
        }
        if (type == "unbind") {
            postData.addNodes.push(postObj);
        } else if (type == "bind") {
            postData.deleteNodes.push(postObj);
        }
        // this.props.serviceXmonitorActions.bindNodes(postData)
        // .then((res) => {
        //     if (res.success) {
        //         if (type == "unbind") {
        //             nodeRuleList[key] = item;
        //             delete unNodeRuleList[key];
        //         } else if (type == "bind") {
        //             unNodeRuleList[key] = item;
        //             delete nodeRuleList[key]
        //         }
        //         this.setState({
        //             loadingStatus: false,
        //             warnRule: {
        //                 nodeRuleList,
        //                 unNodeRuleList
        //             }
        //         })
        //     }
        // });
    }

    //移动所有未应用的节点到右侧画布
    moveUnusedNode(nodes) {
        let scale = this.refs.pdMap.status.scale;
        let i = 0;
        let size = 15;
        let startX = 0;
        let startY = 0;
        let speedX = 105;
        let speedY = 80;
        let oldX = 0;
        let data = [];
        Object.keys(nodes).map((key) => {
            let node = nodes[key];
            document.getElementById("node_span_width").innerHTML = node.nn;
            document.getElementById("node_span_width").style.opacity = 0
            let width = document.getElementById("node_span_width").offsetWidth + 30; //node.nn.length * 10 * scale
            let x = 0;
            if (i % size == 0) {
                x = (startX + speedX) * (i % size) + 150;
                oldX = x;
            } else {
                x = oldX + width;
                oldX = x;
            }
            let y = (startY + speedY) * Math.floor(i / size) + 50;
            node.pos = {
                x: x,
                y: y
            }
            node.nid = key;
            if (node.opt && node.opt.cid) {
                node.cid = node.opt.cid;
            }
            i++;
            data.push(node);
        });
        this.props.serviceCmdbActions.batchModify({
            nodes: data
        }).then(() => {
            this.refreshPDMap();
        })
    }

    //esInfo确认入库
    nodeInfoConfirm(nid, type) {
        parent.window.confirm("确认将该节点信息入库吗？", function() {
            this.props.serviceCmdbActions.infoConfirm({
                    node_id: nid,
                    node_type: type
                })
                .then(() => {
                    this.resetEditNode();
                    this.setState({
                        modalTitle: "",
                        modalType: "",
                        modalVisible: false,

                        alarmInfo: {
                            defaultText: "",
                            result: []
                        }
                        //监控
                        ,
                        monitor: {
                            url: ""
                        },
                        warnRule: {
                            nid: "",
                            nodeRuleList: [],
                            unNodeRuleList: []
                        }
                    })
                })
        });
    }
    //根据集群获取集群下的所有服务器节点
    getHostListByCid(cid) {
        if (cid == undefined || cid == "") {
            this.setState({
                clusterHostList: [],
                hostIpList: []
            })
        } else {
            return this.props.serviceCmdbActions.getHostListByCid({
                cid: cid
            }).then(res => {
                this.setState({
                    clusterHostList: res
                })
                
            })
        }
    }
    // 根据服务器的hid获取该服务器下的所有IP列表
    getIpListByHid(nid) {
        if (nid == undefined || nid == "") {
            this.setState({
                hostIpList: []
            })
        } else {
            let { clusterHostList } = this.state;
            for (var i = 0; i < clusterHostList.length; i++) {
                if (nid == clusterHostList[i].nid) {
                    this.setState({
                        hostIpList: [clusterHostList[i].opt.ip]
                    })
                }
            }
        }
    }
}

Topology.contextTypes = {
    router: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        allData: state.serviceCmdb.cmdbAllData,
        tagList: state.serviceCmdb.cmdbTagList,
        typeList: state.serviceCmdb.cmdbTypeList,
        groupList: state.serviceCmdb.cmdbGroupList,
        nodeList: state.serviceCmdb.cmdbNodeList,
        fieldList: state.serviceXmonitor.fieldList,
        expressionList: state.serviceXmonitor.expressionList,
        clusterList: state.serviceCmdb.listCluster
    }
}

function mapDispatchToProps(dispatch) {
    return {
        serviceCmdbActions: bindActionCreators(serviceCmdbActions, dispatch),
        serviceXmonitorActions: bindActionCreators(serviceXmonitorActions, dispatch),
        serviceESActions: bindActionCreators(serviceESActions, dispatch),
        hideProgress: bindActionCreators(hideProgress, dispatch),
        alert: bindActionCreators(_alert, dispatch),
        confirm: bindActionCreators(_confirm, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Topology)