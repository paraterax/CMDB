import React from "react"
import FlowMap from '../flowMap'
import tplRender from "./jsx/index.jsx"
import * as $s from 'app/components/verify'
export default class PDMap extends FlowMap {
    constructor(props) {
        super(props)
        this.unUsedList = {}
        this.searchResult = {}
        this.dragTarget = null
        this.mouseDownX = null
        this.mouseDownY = null
        // this.containers = {}
        this.mouseUpBool = 0;
    }

    componentDidMount() {
        super.componentDidMount()
    }

    render() {
        return tplRender.call(this)
    }
    nodeListDown(e) {
        this.mouseUpBool = 0;
        var that = this;
        if (!this.props.permission.looked) {
            if (document.getElementById("nodeList") != undefined) {
                var event = e || window.event;
                var target = event.target || event.srcElement
                target = target.tagName == "IMG" ? target.parentNode : target;
                target = target.tagName == "DIV" ? target.parentNode : target;
                if (target.tagName == "LI") {
                    that.dragTarget = target;
                    that.mouseDownX = event.pageX;
                    that.mouseDownY = event.pageY;
                }
            }
        }
    }
    nodeListUp(e) {
        this.mouseUpBool = 1;
    }
    nodeListLeave(e) {
        var event = e || window.event;
        if (this.mouseUpBool == 0) {
            if (!this.props.permission.looked) {
                if (this.dragTarget != null) {
                    this.props.emit("dragNodeHandle", this.dragTarget.id, event.pageX - this.mouseDownX, event.pageY - this.mouseDownY);
                    this.dragTarget = null;
                }
            }
        }
    }

    //移动所有的节点到右侧画布
    moveAllNode() {
        this.props.emit("moveUnusedNode", this.searchResult)
    }
    //搜索
    searchUnUseList(e) {
        var value = e.target.value;
        let searchResult = {}

        if (value != "") {
            Object.keys(this.unUsedList).map((key) => {
                if ((this.unUsedList[key].nn).toLowerCase().indexOf(value.toLowerCase()) > -1) {
                    searchResult[key] = this.unUsedList[key]
                }
            });
        } else {
            searchResult = this.unUsedList

        }
        this.setState({
            searchResult: searchResult
        })
        this.searchResult = searchResult

    }

    updateUnUsedList(data) {
        this.unUsedList = data
        this.searchResult = data
        this.setState({
            unUsedList: data,
            searchResult: data
        })
    }
    // 鼠标脱离画布随意滚动
    nodeSeparate(e) {
        let { scale } = this.status
    }
    //设置通知数目
    setNotificationCount(count, delta = false) {
        this.setState({
            notificationCount: delta ? this.state.notificationCount + count : count
        })
    }

    refreshFillStyle() {
        this.setState({
            mapWidth: this.props.permission.looked ? window.innerWidth : window.innerWidth - 100 - 52
            , mapHeight: this.props.permission.looked ? window.innerHeight : window.innerHeight - 40
        });
        this.paperTop = this.getTop(this.refs.paper)
        this.paperLeft = this.getLeft(this.refs.paper)
        this.zr && this.zr.resize()

    }
    clickToolbarBtnHandle(option) {
        var name = option.name;
        var that = this;
        switch (name) {
            case 'save':
                this.saveMapToDB();
                break;
            case "high":
                this.props.emit("openHighSearchModal");
                break;
            case "refresh":
                this.props.emit("resetPDMap");
                break;
            case "batch_add":  //批量添加组
                this.props.emit("batchAdd", this.status.selectedGroups);
                break;
            case "batch_modify":  //批量修改共有属性
                this.props.emit("batchModify", this.status.selectedGroups);
                break;
            case "batch_remove":   //批量删除节点
                this.props.emit("batchRemove", this.status.selectedGroups);
                break;
            case 'notifications':
                this.props.emit("viewNotifications");
                break;
        }

        super.clickToolbarBtnHandle(option)
    }

    rightMenuClickHandle(index, o, e) {
        const { left, top } = this.refs.rightMenu.state

        let activeGroup = this.status.activeGroup
        let activeGroupData = this.data(activeGroup)

        switch (index) {
            case 'editNode':  //编辑
                if (activeGroupData['type'] == 'node') {
                    this.props.emit("openEditNodeMenu", this.status.activeGroup);  //编辑节点
                } else {
                    this.props.emit("openEditGroupMenu", this.status.activeGroup);   //编辑组
                }
                ; break
            case "delNode"://删除
                if (activeGroupData['type'] == 'node') {
                    this.props.emit("openDelNodeMenu", this.status.activeGroup);  //删除节点
                } else {
                    this.props.emit("openDelGroupMenu", this.status.activeGroup);  //删除组
                }
                ; break;
            case "nodeDetail":
                this.props.emit("openDetailNode", this.status.activeGroup, 0);  //节点详情
                break;
            case "nodeDetailWarn":
                this.props.emit("openDetailNode", this.status.activeGroup, 2);  //故障规则
                break;
            case "nodeDetailWarnInfo":
                this.props.emit("openDetailNode", this.status.activeGroup, 1);  //故障信息
                break;
            case "delArrow":  //删除连接
                this.props.emit("openDeleteArrow", this.status.activeGroup);  //删除连接
                ; break;
            case "editArrow": //编辑连接描述
                this.props.emit("openEditArrow", this.status.activeGroup);
                ; break;
            case "traceBack": //一鍵追溯
                this.props.emit("openTraceBack", this.status.activeGroup);
                ; break;
            case "monitor": //监控信息
                this.props.emit("openMonitor", this.status.activeGroup);
                ; break;
            case "batch_modify"://批量修改
                this.props.emit("batchModify", this.status.selectedGroups);
                break;
            case "batch_remove"://批量删除
                this.props.emit("batchRemove", this.status.selectedGroups);
                break;
            case "batch_add": //批量添加组
                this.props.emit("batchAdd", this.status.selectedGroups);
                break;
        }
        super.rightMenuClickHandle(index, o, e)
    }

    createNode(type, position) {
        this.props.emit("openEditNodeMenu", null, position);  //新建节点
    }

    createContainer(type, position) {
        this.props.emit("openEditGroupMenu", null, position);   //新建组
    }

    connectActiveArrow() {
        this.props.emit("openAddArrowConfirm")
    }
    //工具栏方法

    //将整张图保存到后台
    saveMapToDB() {
        this.props.emit("savePDMap")
    }

    onDragEnd(target) {
        this.props.emit("savePDDragTarget", target)
    }

    onFlowMapClickHandle() {
        this.refs.rightMenu.hideMenu();
    }
    //修改场景时组的回显
    updateSceneGroup(groupId,logoFlag){
        var group;
        for(var i=0;i<groupId.length;i++){
            if(groupId[i] in this.containers){
                this.selectedSceneGroup.push(this.containers[groupId[i]]);
            }
        }
        group = this.selectedSceneGroup;
        for(var i=0;i<group.length;i++){
            group[i].childAt(0).style.shadowBlur = 8
            group[i].childAt(0).style.shadowOffsetY = 3
            group[i].childAt(0).style.shadowOffsetX = 3
            this.setGroupZLevel(group[i], this.status.maxIndex);
        }
        this.props.emit("selectGroup", group,logoFlag)
    }
    //回显group
    updateGroup(groupId, greyed) {
        let { maxIndex } = this.status
        let group = this.containers[groupId];
        if (group != null) {
            group.childAt(0).style.shadowBlur = 10;
            this.status.hoverGroup = group
            this.status.activeGroup = group
            this.props.emit("selectGroup", this.status.activeGroup)
        }
        //将其他组内的节点和关联关系置灰
        if (greyed) {
            let groupArrows = {};
            for (let key in this.containers) {
                if (key != groupId) {
                    this.containers[key].childAt(0).style.opacity = "0";
                    this.containers[key].childAt(this.containers[key]._children.length - 1).style.opacity = "0";
                }
            }
            for (let key in this.nodes) {
                let node = this.nodes[key]
                if (node.pid != groupId) {
                    node.childAt(0).style.opacity = "0";
                    node.childAt(1).style.opacity = "0";
                    let child = node.data['c'] || [];
                    child.map(cid => {
                        let arid = "_" + key + "_" + cid + 　"_";
                        groupArrows[arid] = "";
                    })
                } else {
                    let nodeData = node.data;
                    let child = nodeData['c'] || [];
                    child.map((cid, i) => {
                        let cNode = this.nodes[cid]
                        if (cNode.pid != groupId) {
                            let aid = "_" + key + "_" + cid + "_";
                            groupArrows[aid] = "";
                        }
                    })
                }
            }
            for (let key in this.arrows) {
                if (groupArrows[key] != undefined) {
                    this.refreshArrowOpacity(key);
                }
            }
            this.zr.refresh();
        }
    }
    //根据类型筛选
    updateNodeByFilterType(nodeType, greyed) {
        let nodeArrows = {}

        let groups = {};
        for (let key in this.nodes) {
            let node = this.nodes[key];
            if (node.nodeType != nodeType) {
                let child = node.data['c'] || [];
                child.map(cid => {
                    let arid = "_" + key + "_" + cid + 　"_";
                    nodeArrows[arid] = "";
                })

                let parent = node.data['p'] || [];
                parent.map(pid => {
                    let arid = "_" + pid + "_" + key + 　"_";
                    nodeArrows[arid] = "";
                })
                node.childAt(0).style.opacity = "0";
                node.childAt(1).style.opacity = "0";
            } else {
                if (this.nodes[key].pid != "") groups[this.nodes[key].pid] = ""
            }
        }
        for (let key in this.arrows) {
            if (nodeArrows[key] != undefined) {
                this.refreshArrowOpacity(key);
            }
        }
        //将没有节点显示的组隐藏掉
        for (let key in this.containers) {
            if (groups[key] == undefined) {
                this.containers[key].childAt(0).style.opacity = "0";
                this.containers[key].childAt(1).style.opacity = "0";
                this.containers[key].childAt(2).style.opacity = "0";
            }
        }
        this.zr.refresh()
    }

    //回显已应用的节点
    updateNodes(nodes) {
        let nids = nodes;
        let { maxIndex } = this.status;
        nids.map(nid => {
            let node = this.nodes[nid]
            if (node != null) {
                node.childAt(0).style.shadowBlur = 10
                this.setGroupZLevel(node, maxIndex);
                this.status.hoverGroup = node
                this.status.activeGroup = node
                this.status.selectedGroups[nid] = node
            }
        })
        this.props.emit("selectNodes", this.status.selectedGroups);
    }
    //查看某一个节点的拓扑关系
    updateRelationNodes(nid) {
        let node = this.nodes[nid];
        if(node != null){
            node.childAt(0).style.shadowBlur = 10       
        }
        this.zr.refresh();
    }

    //只能选择组，没有节点的组不显示,组外的节点不显示
    updateNodeByGroup() {
        let gidArr = {};
        for (let key in this.nodes) {
            let node = this.nodes[key];
            gidArr[node.data.gid] = "";
            // 组外节点隐藏
            if (node.pid == "" || node.pid == undefined || node.pid == null) {
                this.nodes[key].childAt(0).style.opacity = "0";
                this.nodes[key].childAt(1).style.opacity = "0";
                let parent = node.data['p'] || [];
                parent.map(pid => {
                    let arid = "_" + pid + "_" + key + 　"_";
                    this.refreshArrowOpacity(arid);
                })
                let child = node.data['c'] || [];
                child.map(cid => {
                    let arid = "_" + key + "_" + cid + "_";
                    this.refreshArrowOpacity(arid);
                })

            }
        }
        // 空组隐藏
        for (let key in this.containers) {
            if (gidArr[key] == undefined) {
                this.containers[key].childAt(0).style.opacity = "0";
                this.containers[key].childAt(1).style.opacity = "0";
                this.containers[key].childAt(2).style.opacity = "0";
            }
        }
        this.zr.refresh();
    }

    //根据节点id集合，显示某些节点
    updateFilterSelectedNodes(nids) {
        let { minIndex } = this.status;
        let differenceNodes = Object.assign({}, this.nodes);
        let nodeArrows = {};
        let groups = {};
        for (let i = 0; i < nids.length; i++) {
            if (differenceNodes[nids[i]]) {
                if (differenceNodes[nids[i]].pid != "") groups[differenceNodes[nids[i]].pid] = ""
                delete differenceNodes[nids[i]];
            }
        }
        Object.keys(differenceNodes).map(key => {
            let node = this.nodes[key]
            if (node != null) {
                node.childAt(0).style.opacity = "0";
                node.childAt(1).style.opacity = "0";
                let child = node.data['c'] || [];
                child.map(cid => {
                    let arid = "_" + key + "_" + cid + 　"_";
                    nodeArrows[arid] = "";
                })

                let parent = node.data['p'] || [];
                parent.map(pid => {
                    let arid = "_" + pid + "_" + key + 　"_";
                    nodeArrows[arid] = "";
                })
            }
        });

        for (let key in this.arrows) {
            if (nodeArrows[key] != undefined) {
                this.refreshArrowOpacity(key);
            }
        }
        for (let key in this.containers) {
            if (groups[key] == undefined) {
                this.containers[key].childAt(0).style.opacity = "0";
                this.containers[key].childAt(1).style.opacity = "0";
                this.containers[key].childAt(2).style.opacity = "0";
            }
        }
        this.zr.refresh()
    }


    //根据集群id，显示该集群下的所有节点
    updateNodesByCid(cid) {
        let allNodes = Object.assign({}, this.nodes);
        let cnids = []
        Object.keys(allNodes).map(key => {
            let node = allNodes[key].data
            if (node.opt != undefined && node.opt.cid != undefined && node.opt.cid == cid) {
                cnids.push(key)
            }
        })
        this.updateFilterSelectedNodes(cnids)
    }
}