import React from 'react'
import zrender from 'zrender/src/zrender'
import zrUtil from 'zrender/src/core/util'
import Group from 'zrender/src/container/Group'
import PathShape from 'zrender/src/graphic/Path'
import LineShape from 'zrender/src/graphic/shape/Line'
import RectShape from 'zrender/src/graphic/shape/Rect'
import ImageShape from 'zrender/src/graphic/Image'
import TextShape from 'zrender/src/graphic/Text'
import event from 'zrender/src/core/event'
import * as $s from 'app/components/verify'
import faultImg from './images/red.png'
import faultYellowImg from './images/yellow.png'

import { add, sub, multi, divi } from './math'
import { IMG_BASEPATH } from 'app/constants/api'
import tplRender from './jsx/index.js'
import pathTool from 'zrender/src/tool/path'

export default class FlowMap extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            mapWidth: 1000,
            mapHeight: 1000,
            config: this.props.config,//存的是一些配置信息
            checkBtn: "",
            keyword: "", //搜索关键字
            searchIndex: 0,
            dataStr: '', //整张图序列化之后的字符串
            dataStrValid: true,
            activeBtn:"default"
        }

        this.status = {
            selectedGroups: {},
            hoverGroup: null,
            maxIndex: 99,
            minIndex: 1,
            scale: 1,
            maxScale: 5,
            minScale: 0.2,
            locked: false,

            lockGroup: null  //锁屏之前鼠标焦点的位置
        }
        this.selectedSceneGroup = []
        this.rootGroup = null
        this.overlayGroup = null
        this.nodes = {}
        this.arrows = {}
        this.overlayArrows = {}
        this.containers = {}
        this._data = {}

        //默认选择模式（如当前节点已选中则拖动，否则为单选）
        this.SELECT_DEFAULT = 0;
        //单选模式
        this.SELECT_SINGLE = 1;
        //多选模式，添加选中的节点
        this.SELECT_MULTIPLE = 2;
        //取消模式，移除选中的节点
        this.SELECT_CANCEL = 3;
        this.SELECT_ADD = 4;
    }
    componentDidMount() {
        this._initPaper()
        this._initEvents()
        this.paperTop = this.getTop(this.refs.paper)
        this.paperLeft = this.getLeft(this.refs.paper)
        setTimeout(function () {
            this.refreshFillStyle()
        }.bind(this), 100)
    }

    render() {
        return tplRender.bind(this)()
    }

    _initPaper() {
        let _this = this
        this.zr = zrender.init(this.refs.paper)
        this.rootGroup = new Group({
            position: [0, 0]
        });
        this.overlayGroup = new Group({
            position: [0, 0]
        })

        this.data(this.rootGroup, {
            type: "rootGroup"
        })
        this.zr.add(this.rootGroup)
        this.zr.add(this.overlayGroup)

        this.selectBox = new RectShape({
            id: "selectBox_r",
            shape: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            style: {
                fill: 'rgba(127, 127, 255, 0.3)',
                stroke: 'rgba(0, 0, 127, 1)'
            },
            zlevel: 100
        })
    }
    _initEvents() {
        let dStartX,
            dStartY,
            dStartOffX,
            dStartOffY,
            dragging,
            selecting,
            ctrlSelecting,
            rectSelectNodes,
            startPos,
            offsetPos,
            groupOffsetPos,
            eStartX,
            eStartY
            ;

        window.addEventListener("resize", this.refreshFillStyle.bind(this))
        let keydownLock = false; //键盘按下
        let mousedownLock = false;  //鼠标按下
        let keydownTime = 0;
        // //空格键
        document.addEventListener("keydown", (event) => {
            if(event.keyCode == 13){
                event.preventDefault();
            }
            if (event.keyCode == 32 && event.target.tagName != "INPUT") {
                document.getElementById("focus_a").blur();
                keydownTime++;
                if (keydownLock) {
                    event.preventDefault();
                } else {
                    if (mousedownLock) {  //如果鼠标已按下，按住空格一直是锁屏状态
                        this.status.locked = true
                        this.setState({
                            activeBtn: "pan"
                        })
                        if (this.status.hoverGroup != null && this.status.hoverGroup.nodeType == "host") {
                            this.status.lockGroup = this.status.hoverGroup
                        }
                        //清除框选的框
                        //重置flag
                        dragging = true
                        selecting = false
                        ctrlSelecting = false
                        //移除选框
                        this.selectBox.shape.width = 0
                        this.selectBox.shape.height = 0
                        this.selectBox.dirty(true)
                        this.overlayGroup.remove(this.selectBox)
                        this.setActiveNode(this.rootGroup, this.SELECT_SINGLE)
                        //节点绝对位置
                        startPos = []
                        for (let groupId in this.status.selectedGroups) {
                            startPos[groupId] = this.status.selectedGroups[groupId].position.slice()
                        }
                    } else {
                        this.status.locked = !this.status.locked
                        this.setState({
                            activeBtn: this.status.locked ? "pan" : "default"
                        })
                        if (this.props.permission.groupSelected){
                            this.setActiveGroup(this.selectedSceneGroup);
                        }else{
                            if (this.status.locked) {   //如果是锁屏状态的话，记录一下上次的鼠标焦点的
                                if (this.status.hoverGroup != null && this.status.hoverGroup.nodeType == "host") {
                                    this.status.lockGroup = this.status.hoverGroup

                                }
                                this.setActiveNode(this.rootGroup, this.SELECT_SINGLE)
                            } else {
                                if (this.status.hoverGroup === this.rootGroup) {
                                    this.status.hoverGroup = this.status.lockGroup;
                                }
                            }
                        }
                    }
                    keydownLock = true;
                }
            }
            if (event.ctrlKey && window.event.keyCode == 65) {
                if (this.props.permission.cid == ""
                    && this.props.permission.selectedGroup == ""
                    && !this.props.permission.memParam) {
                    event.returnValue = false;
                    for (let key in this.nodes) {
                        this.setActiveNode(this.nodes[key], this.SELECT_MULTIPLE);
                    }
                }
            }
        })
        document.addEventListener("keyup", (event) => {
            if(event.keyCode == 13){
                event.preventDefault();
            }
            if (event.keyCode == 32 && event.target.tagName != "INPUT") {
                //如果键盘松开，鼠标未松开
                if (!mousedownLock && keydownTime != 1) {
                    if (this.status.lockGroup != this.rootGroup) {
                        this.status.hoverGroup = this.status.lockGroup;
                    }
                    this.status.locked = false
                    this.setState({
                        activeBtn: "default"
                    })
                }
                if (!mousedownLock) {  //如果鼠标没有一直按下
                    keydownTime = 0
                }
                keydownLock = false;
            }
        })
        this.refs.paper.addEventListener("mousedown", (e) => {
            if (e.button == 0) {
                mousedownLock = true;
                if (keydownLock) {
                    this.status.locked = true
                    this.setState({
                        activeBtn: "pan"
                    })
                }
                if (this.status.hoverGroup && this.data(this.status.hoverGroup)['type'] == "arrow") return  //线不可拖动
                if (this.status.locked == true) {
                    //锁屏模式，选择背景
                    this.setActiveNode(this.rootGroup, this.SELECT_MULTIPLE)
                } else if (this.props.permission.multiSelected && (e.ctrlKey || this.status.hoverGroup === this.rootGroup)) {
                    //矩形选择
                    selecting = true
                    if (e.ctrlKey) ctrlSelecting = true
                    for (let id in this.status.selectedGroups) {
                        //去除container
                        if (this.data(this.status.selectedGroups[id])['type'] == 'container') {
                            this.setActiveNode(this.status.selectedGroups[id], this.SELECT_CANCEL)
                        }
                    }
                    rectSelectNodes = []
                    //绘制选框
                    this.selectBox.shape.x = e.offsetX
                    this.selectBox.shape.y = e.offsetY
                    this.selectBox.dirty(true)
                    this.overlayGroup.add(this.selectBox)
                    this.zr.refresh()
                } 
                else {
                    //单击选择
                    if (this.status.activeArrow) {
                    } else {
                        if (this.status.hoverGroup && !this.props.permission.groupSelected) {
                            this.setActiveNode(this.status.hoverGroup)
                        }
                    }
                }
                dragging = true

                if (this.status.activeArrow) {
                    this.connectActiveArrow()
                }

                //鼠标位置
                dStartX = e.pageX
                dStartY = e.pageY

                eStartX = e.pageX
                eStartY = e.pageY
                //相对于页面位置
                dStartOffX = e.offsetX
                dStartOffY = e.offsetY

                //节点绝对位置
                startPos = []
                for (let groupId in this.status.selectedGroups) {
                    startPos[groupId] = this.status.selectedGroups[groupId].position.slice()
                }

                //节点相对位置，用于框选
                offsetPos = []
                if (selecting) {
                    for (let nodeId in this.nodes) {
                        offsetPos[nodeId] = this.getNodeOffset(this.nodes[nodeId])
                    }
                }
                //组相对位置，用于框选
                groupOffsetPos = []
                for (let groupId in this.containers) {
                    groupOffsetPos[groupId] = this.getContainerOffset(this.containers[groupId]);
                }
            } else if (e.button == 2) {
                if ($s.getObjectLength(this.status.selectedGroups) <= 1) {
                    if (this.status.hoverGroup) this.setActiveNode(this.status.hoverGroup)
                }
            }

        })

        document.body.addEventListener("mousemove", (e) => {
            if (e.target.localName == "canvas") {
                let { scale } = this.status
                if (dragging && !selecting) {
                    for (let groupId in this.status.selectedGroups) {
                        let dragged = this.status.selectedGroups[groupId]
                        if (this.data(dragged)['type'] == 'rootGroup') {
                            dragged.position = [
                                startPos[groupId][0] + e.pageX - dStartX,
                                startPos[groupId][1] + e.pageY - dStartY
                            ]

                            dragged.movePosition = [
                                e.pageX - dStartX, e.pageY - dStartY
                            ]
                        } else {
                            if (!this.status.locked) {
                                dragged.position = [
                                    startPos[groupId][0] + divi(e.pageX - dStartX, scale),
                                    startPos[groupId][1] + divi(e.pageY - dStartY, scale)
                                ]
                                if (this.data(groupId)['type'] == 'container') {
                                    dragged.childAt(1).eachChild((child) => {
                                        this.refreshArrowsByNode(child)
                                    })
                                } else {
                                    this.refreshArrowsByNode(dragged)
                                }
                            }
                        }
                        dragged.dirty(true)
                        if (dragged.parent && this.data(dragged.parent)['type'] == 'containerContent') {
                            this.refreshContainerReact(dragged.parent.parent)
                        }
                        this.zr.refresh()
                    }
                    this.refreshTraceBackArrow()
                } else if (selecting) {
                    let rootX = this.rootGroup['position'][0]
                    let rootY = this.rootGroup['position'][1]
                    let { NODE_INFO } = this.state.config
                    if (this.props.permission.groupSelected) {
                        this.selectedSceneGroup = [];
                        // 框选组
                        for(let groupId in groupOffsetPos){
                            if(this.data(groupId).type == 'container'
                                && (groupOffsetPos[groupId][0] + rootX + groupOffsetPos[groupId][2]/2 > dStartOffX)
                                == (groupOffsetPos[groupId][0] + rootX + groupOffsetPos[groupId][2]/2 < e.offsetX)

                                && (groupOffsetPos[groupId][1] + rootY + groupOffsetPos[groupId][3]/2 > dStartOffY)
                                == (groupOffsetPos[groupId][1] + rootY + groupOffsetPos[groupId][3]/2 < e.offsetY)
                            ){
                                this.selectedSceneGroup.push(this.containers[groupId]);
                            }
                        }
                        this.setActiveGroup(this.selectedSceneGroup);
                    }else{
                        for (let nodeId in offsetPos) {
                            //选择新节点，使用鼠标确定选框
                            if (nodeId !== this.rootGroup.id && !(nodeId in this.status.selectedGroups)
                                && this.data(nodeId).type == 'node'
                                && (offsetPos[nodeId][0] + rootX + NODE_INFO['width'] / 2 * scale > dStartOffX)
                                == (offsetPos[nodeId][0] + rootX + NODE_INFO['width'] / 2 * scale < e.offsetX)
                                && (offsetPos[nodeId][1] + rootY + NODE_INFO['height'] / 2 * scale > dStartOffY)
                                == (offsetPos[nodeId][1] + rootY + NODE_INFO['height'] / 2 * scale < e.offsetY)
                            ) {
                                if (rectSelectNodes.indexOf(nodeId) == -1) rectSelectNodes.push(nodeId)
                                if (this.nodes[nodeId].childAt(0).style.opacity != "0") {
                                    this.setActiveNode(this.nodes[nodeId], this.SELECT_MULTIPLE)
                                }
                            }
                        }
                    }
                    
                    //刷新矩形选框
                    this.selectBox.shape.width = e.offsetX - dStartOffX
                    this.selectBox.shape.height = e.offsetY - dStartOffY
                    this.selectBox.dirty(true)
                    this.zr.refresh()
                } else if (this.status.activeArrow) {
                    let target = this.status.activeGroup
                    let activeArrowPosition = this.getActiveArrowPosition(e)
                    this.refreshArrow(this.status.activeArrow, activeArrowPosition.start, activeArrowPosition.end)
                }
            }
        })
        let mouseUp = (e) => {
            mousedownLock = false;
            if (!keydownLock && keydownTime != 0) {
                if (this.status.lockGroup != undefined && this.status.lockGroup != this.rootGroup) {
                    this.status.hoverGroup = this.status.lockGroup;
                    this.setActiveNode(this.status.hoverGroup)
                }
                keydownTime = 0
                this.status.locked = false
                this.setState({
                    activeBtn: "default"
                })
            }
            if (dragging) {
                let dragDistance = e.pageX - dStartX + e.pageY - dStartY
                if (dragDistance) {
                    //拖动距离不为0
                    if (!selecting) {
                        for (let i in this.status.selectedGroups) {
                            this.onDragEnd(this.status.selectedGroups[i])
                        }
                    }
                } else if (this.status.hoverGroup) {
                    //拖动距离为0，即单击
                    if (e.ctrlKey || e.metaKey) {
                        if (e.which != 3 && this.status.hoverGroup.id in this.status.selectedGroups) {
                            //Ctrl单击取消已选择的节点
                            this.setActiveNode(this.status.hoverGroup, this.SELECT_CANCEL)
                        } else {
                            // ctrl按键选择多个组
                            if (this.props.permission.groupSelected) {
                                let group = null;
                                group = this.status.activeGroup == undefined ? this.containers[this.status.hoverGroup.pid] : this.status.activeGroup ;
                                this.selectedSceneGroup.push(this.status.activeGroup);
                                this.setActiveGroup(this.selectedSceneGroup);
                            }else{
                                //ctrl按键选择多个节点
                                this.setActiveNode(this.status.hoverGroup, this.SELECT_MULTIPLE)
                            }
                        }
                    } else {
                        // 选择单击组
                        if (this.props.permission.groupSelected) {
                            let group = null;
                            if (this.data(this.status.hoverGroup)['type'] == 'container') {
                                group = this.status.hoverGroup;
                            }
                            if( group != null){
                                this.selectedSceneGroup = [];
                                this.selectedSceneGroup.push(group);
                                this.setActiveGroup(this.selectedSceneGroup);
                            }else{
                                this.setActiveGroup([]);
                            }
                        }else{
                            //选择单一节点
                            this.setActiveNode(this.status.hoverGroup, this.SELECT_SINGLE)
                        }
                    }
                }
            }
            //未锁屏时，不选择rootGroup
            if (this.rootGroup.id in this.status.selectedGroups) {
                this.setActiveNode(this.rootGroup, this.SELECT_CANCEL)
            }
            //重置flag
            dragging = false
            selecting = false
            ctrlSelecting = false
            //移除选框
            this.selectBox.shape.width = 0
            this.selectBox.shape.height = 0
            this.selectBox.dirty(true)

            this.overlayGroup.remove(this.selectBox)
            this.zr.refresh()
        }

        document.body.addEventListener("mouseup", mouseUp)

        this.zr.on("mousedown", (e) => {
            this.status.hoverGroup = this.rootGroup;
            this.setActiveNode(this.status.hoverGroup);
        })
        var browser = window.navigator.userAgent.toLowerCase().indexOf('firefox');
        if (browser != -1) {
            this.refs.paper.addEventListener("DOMMouseScroll", (e) => {
                var oEvent = e || event;
                if (!dragging) {
                    //上下滚轮动作判断
                    if (oEvent.detail > 0) {
                        this.zoomOut()
                    } else {
                        this.zoomIn()
                    }
                }
                e.preventDefault()
            })
        } else {
            this.refs.paper.addEventListener("mousewheel", (e) => {
                if (!dragging) {
                    if (e.wheelDelta > 0) {
                        this.zoomIn()
                    } else if (e.wheelDelta < 0) {
                        this.zoomOut()
                    }
                }
                e.preventDefault()
            })
        }

    }

    add(node) {
        this.rootGroup.add(node)
    }

    refreshFillStyle() {
        let toolbarHeight = this.refs.toolbar ? (this.refs.toolbar.offsetHeight) : 0
        this.setState({
            mapWidth: window.innerWidth
            , mapHeight: window.innerHeight - toolbarHeight
        })

        this.paperTop = this.getTop(this.refs.paper)
        this.paperLeft = this.getLeft(this.refs.paper)
        this.zr && this.zr.resize()
    }

    getNodeOffset(node, position) {
        if (!position) {
            position = [0, 0]
        }
        if (this.data(node)['type'] == 'rootGroup') {
            return position
        } else {
            position[0] += node.position[0] * this.status.scale
            position[1] += node.position[1] * this.status.scale
        }
        return this.getNodeOffset(node.parent, position)
    }

    getContainerOffset(container, position){
        if (!position) {
            position = [0, 0, 0, 0]
        }
        if (this.data(container)['type'] == 'rootGroup') {
            return position
        } else {
            position[0] += (container.position[0] + container.childAt(0).shape.x) * this.status.scale
            position[1] += (container.position[1] + container.childAt(0).shape.y) * this.status.scale
            position[2] += (container.childAt(0).shape.width) * this.status.scale
            position[3] += (container.childAt(0).shape.height) * this.status.scale
        }
        return this.getContainerOffset(container.parent, position)
    }
    //公共方法
    getOffset(node, offset) {
        if (!offset) {
            offset = {};
            offset.top = 0;
            offset.left = 0;
        }
        if (node == document.body) {//当该节点为body节点时，结束递归
            return offset;
        }
        offset.top += node.offsetTop;
        offset.left += node.offsetLeft;
        return this.getOffset(node.offsetParent, offset);//向上累加offset里的值
    }

    getPaperOffset() {
        let toolbarHeight = this.refs.toolbar ? (this.refs.toolbar.offsetHeight) : 0
        let pOffset = this.getOffset(this.refs.paper)
        let pLeft = pOffset.left, pTop = pOffset.top - toolbarHeight
        return {
            pLeft, pTop
        }
    }

    //获取元素的纵坐标
    getTop(e) {
        var offset = e.offsetTop;
        if (e.offsetParent != null) offset += this.getTop(e.offsetParent);
        return offset;
    }

    //获取元素的横坐标
    getLeft(e) {
        var offset = e.offsetLeft;
        if (e.offsetParent != null) offset += this.getLeft(e.offsetParent);
        return offset;
    }

    stopEvent(e) {
        e.returnValue = false;
        e.cancelBubble = true;
        return e
    }

    //获取对象长度
    getMapLength(map) {
        return Object.keys(map).length
    }

    //获取所有跟节点有关联的箭头的id
    findArrowIdsByNode(node) {
        let { id } = node
        let reg = new RegExp("[^\|]*" + id + "[^\|]*", "ig"),
            keysStr = Object.keys(this.arrows).join("|")
        return keysStr.match(reg) || []
    }

    clickToolbarBtnHandle(option) {
        let name = option.name
        let { activeBtn } = this.state
        switch (name) {
            case 'zoomin': this.zoomIn(); break;
            case 'zoomout': this.zoomOut(); break;
            case 'zoomreset': this.zoomReset(); break;
            case 'reset': this.resetPage(); break;
            case 'json': this.setTxtData(); break;
            case 'search': this.searchNode(); break;
        }
        if (option.name != activeBtn) {
            if (activeBtn == 'json' && this.validJson(this.state.dataStr)) {
                this.deserialization(JSON.parse(this.state.dataStr))
            }

            if (option.name == 'pan') {
                this.status.locked = true
            } else if (option.name == "default") {
                this.status.locked = false
            }
            if (option.name == 'pan' || option.name == 'default') {
                this.setState({
                    activeBtn: option.name
                })
            }
        }
    }

    selectToolbarBtnHandle(key) {
        const { activeBtn } = this.refs.toolbar.state
        switch (key) {
            case 'default':
                if (activeBtn == key) {
                    return
                } else {
                    this.enableDrag()
                }
                ; break;
            default:
                this.disableDrag()
                    ; break;
        }
    }

    onFlowMapClickHandle() {
        this.refs.rightMenu.hideMenu();
    }

    rightMenuHandle(e, event) {
        e.preventDefault()
        if (!this.state.config['MENU_TYPES']) {
            return
        }
        if (this.status.locked) {
            return
        }
        let { pLeft, pTop } = this.getPaperOffset()
        const paper = this.refs.paper, rightMenu = this.refs.rightMenu.refs.rightMenu
        let left = e.clientX,
            top = e.clientY
        if (left > paper.offsetWidth + paper.offsetLeft - rightMenu.offsetWidth) {
            left = paper.offsetWidth + paper.offsetLeft - rightMenu.offsetWidth

        }
        if (top > paper.offsetHeight + paper.offsetTop - rightMenu.offsetHeight) {
            top = paper.offsetHeight + paper.offsetTop - rightMenu.offsetHeight
        }
        if (this.status.hoverGroup && this.data(this.status.hoverGroup)['type'] == "node") {
            let node = this.data(this.status.hoverGroup).data
            this.state.config['MENU_TYPES'].map(menu => {
                if (menu.key == "traceBack") {
                    if (node.st == 1 || node.st == 0) {
                        menu.targets.node = false
                    } else {
                        menu.targets.node = true
                    }
                }
            })
        }

        var target = (this.status.hoverGroup && this.data(this.status.hoverGroup)['type']) || "rootGroup";
        if ($s.getObjectLength(this.status.selectedGroups) > 1) {
            target = "nodes"
        }
        this.refs.rightMenu.showMenu({
            left: left - pLeft + window.scrollX + 100
            , top: top - pTop + window.scrollY
            , target: target
        })

    }

    rightMenuClickHandle(index, o, e) {
        const { left, top } = this.refs.rightMenu.state;
        switch (index) {
            case 'addGroup':
                //创建组相关操作
                this.createContainer(o.type, [left - 25, top - 25]); 
                break;
            case 'addNode':
                //创建节点相关操作
                this.createNode(o.type, [left - 25, top - 25]); 
                break;
            case 'addArrow':
                this.addActiveArrow(o);
                 break;
            case 'reset':
                this.resetPage(); 
                break;
            case 'zoomin':
                this.zoomIn(); 
                break;
            case 'zoomout':
                this.zoomOut(); 
                break;
            case 'zoomreset':
                this.zoomReset(); 
                break;
            case 'delete':
                this.deleteHandle(); 
                break;
            case 'rename':
                this.renameHandle(e); 
                break;
            default: ;
        }

        this.zr.handler._lastDownButton = null //右键菜单已经被重写了，防止源码里面对右键的锁定措施
    }

    dataStrChangeHandle(e) {
        let dataStr = e.target.value
        let { dataStrValid } = this.state
        if (this.validJson(dataStr) == false) {
            if (dataStr == "") {
                this.resetPage()
            } else {
                dataStrValid = false
            }

        } else {
            dataStrValid = true
        }

        this.setState({
            dataStr,
            dataStrValid
        })

    }
    validJson(jsonStr) {
        try {
            JSON.parse(jsonStr)
        } catch (e) {
            console.error(e)
            return false
        }
        return true
    }

    addGroup(opt, parent) {
        var group = new Group(Object.assign({
            position: [0, 0],
            style: {}
        }, opt));
        if (parent) {
            parent.add(group)
        } else {
            this.rootGroup.add(group)
        }

        return group
    }

    setGroupZLevel(group, zlevel) {
        group.children().map((c, i) => {
            c.zlevel = zlevel
            c.dirty(0)
        })
        this.zr.refresh()
    }

    addArrow(start = { x: 0, y: 0 }, end = { x: 0, y: 0 }, option) {
        var that = this
        let line = new LineShape({
            shape: {
                x1: start.x,
                y1: start.y,
                x2: end.x,
                y2: end.y
            },
            style: {
                text: (option != undefined && option.text != undefined) ? option.text : "",
                stroke: (option != undefined && option.color != undefined) ? option.color : "#5B5B5B"
            }
        });
        let arrowPath = this.getArrowPath(start, end, 6)
        let path = pathTool.createFromString(arrowPath, {
            style: {
                fill: (option != undefined && option.color != undefined) ? option.color : "#5B5B5B"
            }
        })
        var group = this.addGroup(Object.assign({
            zlevel: 10,
            onmousedown: (e) => {
                this.setActiveNode(group)
                return this.stopEvent(e)
            },
            onmouseover: (e) => {
                this.status.hoverGroup = group
                if ( !this.status.locked &&
                    !that.props.permission.groupSelected
                    && !that.props.permission.nodeOnlySelected
                    && that.props.permission.selectedNode == ""
                ) {
                    group.childAt(0).style.stroke = "rgba(0,0,0,0.5)"
                    group.childAt(1).style.fill = "rgba(0,0,0,0.5)"
                }
            },
            onmouseout: (e) => {
                if (!that.props.permission.looked) {
                    let st = group.st;
                    if (st == 3) {
                        group.childAt(0).style.stroke = "rgba(255,0,0,1)"
                        group.childAt(1).style.fill = "rgba(255,0,0,1)"
                    } else if (st == 2) {
                        group.childAt(0).style.stroke = "rgba(255,128,0,1)"
                        group.childAt(1).style.fill = "rgba(255,128,0,1)"
                    } else if (st == 0 || st == 1) {
                        group.childAt(0).style.stroke = "rgba(0,0,0,0.7)"
                        group.childAt(1).style.fill = "rgba(0,0,0,0.7)"
                    }
                }
                if (this.status.hoverGroup && (this.status.hoverGroup.id == group.id)) {
                    this.status.hoverGroup = null
                }
            }
        }, option))

        this.data(group, {
            type: 'arrow'
        })
        group.add(line)
        group.add(path)
        this.arrows[group.id] = group
        this.rootGroup.add(group)
        return group
    }
    //添加表层箭头，表层不受拖动、缩放影响
    addOverlayArrow(start = { x: 0, y: 0 }, end = { x: 0, y: 0 }, option) {
        let line = new LineShape({
            shape: {
                x1: start.x,
                y1: start.y,
                x2: end.x,
                y2: end.y
            },
            style: {
                text: (option && option.text) ? option.text : "",
                stroke: (option && option.color) ? option.color : "#5B5B5B",
                lineWidth: 3,
                lineDash: [10, 10]
            }
        });
        line.animate('style', true)
            .when(1000, {
                lineDashOffset: -20
            })
            .start();

        let radius = option && option.radius ? option.radius : 6
        let arrowPath = this.getArrowPath(start, end, radius, option && option.arrowPoint ? option.arrowPoint : null)
        let path = pathTool.createFromString(arrowPath, {
            style: {
                fill: (option && option.color) ? option.color : "#5B5B5B"
            }
        })
        var group = this.addGroup(Object.assign({
            zlevel: 10,
        }, option), this.overlayGroup)

        this.data(group, {
            type: 'overlayArrow'
        })

        group.add(line)
        this.overlayArrows[group.id] = group
        return group
    }
    //修改线不可见
    refreshArrowOpacity(arrowId) {
        this.arrows[arrowId].childAt(0).style.opacity = "0";
        this.arrows[arrowId].childAt(1).style.opacity = "0";
    }

    //修改线的颜色
    refreshArrowColor(arrowids) {
        arrowids.map(item => {
            let arrowid = item[0];
            let color = item[1] == "YELLOW" ? "ORANGE" : item[1];
            this.refreshArrowStatus(arrowid, color)
        })
    }
    refreshArrowStatus(arrowId, color, type) {
        let group = this.arrows[arrowId]
        if (group != undefined) {
            let line = group.childAt(0)
            let arrow = group.childAt(1)
            arrow.style.fill = color;
            line.style.stroke = color;
            group.color = color;
            if (color == "ORANGE") {
                group.st = 2;
            } else if (color == "RED") {
                group.st = 3;
            } else {
                group.st = 1;
            }
            line.dirty(true)
            arrow.dirty(true)
            this.zr.refresh()
        }
    }
    //如果是自己引起的故障放一个小图标
    refreshNodeStatusIcon(nodeId, type) {
        let group = this.nodes[nodeId];
        if (group) {
            type = type == undefined ? "add" : type;
            if (type == "add") {
                let img = null;
                if (group.data.st == 2) {
                    img = faultYellowImg;
                } else if (group.data.st == 3) {
                    img = faultImg;
                }
                var faultImageShape = new ImageShape({
                    position: [0, 0],
                    scale: [1, 1],
                    style: {
                        x: 0,
                        y: 0,
                        image: img,
                        width: 20,
                        height: 20,
                        lineWidth: 5,
                        shadowBlur: 0,
                        opacity: "1"
                    },
                    draggable: false,
                    hoverable: false,
                    clickable: false,
                    silent: false
                });
                if (group.childAt(2)) {
                    group.remove(group.childAt(2));
                }
                group.add(faultImageShape);

                if (this.status.selectedGroups[nodeId]) {
                    if (this.status.selectedGroups[nodeId].childAt(2)) {
                        this.status.selectedGroups[nodeId].remove(this.status.selectedGroups[nodeId].childAt(2));
                        this.status.selectedGroups[nodeId].add(faultImageShape)
                    }
                }
                group.childAt(2).zlevel = 99;
                group.dirty(true);
                this.zr.refresh()
            } else {
                if (group.childAt(2)) {
                    group.remove(group.childAt(2));
                    group.dirty(true);
                }
                if (this.status.selectedGroups[nodeId]) {
                    if (this.status.selectedGroups[nodeId].childAt(2)) {
                        this.status.selectedGroups[nodeId].remove(this.status.selectedGroups[nodeId].childAt(2))
                    }
                }
                this.zr.refresh();
            }

        }
    }

    //根据状态修改节点状态
    refreshNodeStatus(nodeId, color) {
        let group = this.nodes[nodeId]
        if (group) {
            let node = group.childAt(0)
            node.style.shadowColor = color;
            node.style.shadowBlur = (group.data.st == 2 || group.data.st == 3) ? 10 : 0;
            node.dirty(true);
            this.zr.refresh()
        }

    }
    refreshArrowsByNode(node) {
        let arrows = this.arrows
        let targetId = node.id

        let arrowIds = this.findArrowIdsByNode(node)
        arrowIds.map((id, index) => {
            this.refreshArrow(arrows[id])
        })
    }

    refreshArrow(group, start, end, option, isPath) {
        let line = group.childAt(0)
        let arrow = group.childAt(1)
        let { scale } = this.status
        let { NODE_INFO } = this.state.config
        let nodeWidth = NODE_INFO['width'],
            nodeHeight = NODE_INFO['height']

        if (start == null || end == null) {
            let ids = group['id'].split("_")
            let startOffset = this.getNodeOffset(this.nodes[ids[1]])
            let endOffset = this.getNodeOffset(this.nodes[ids[2]])

            //交点算法，目前只支持圆形
            let xLen = endOffset[0] - startOffset[0]
            let yLen = endOffset[1] - startOffset[1]
            let zLen = Math.sqrt(Math.pow(yLen, 2) + Math.pow(xLen, 2))

            let xLow = nodeWidth * xLen / zLen / 2
            let yLow = nodeHeight * yLen / zLen / 2

            start = {
                x: divi(startOffset[0], scale) + NODE_INFO['width'] / 2 + xLow,
                y: divi(startOffset[1], scale) + NODE_INFO['height'] / 2 + yLow
            }

            end = {
                x: divi(endOffset[0], scale) + NODE_INFO['width'] / 2 - xLow,
                y: divi(endOffset[1], scale) + NODE_INFO['height'] / 2 - yLow
            }
        }

        line.shape = Object.assign(line.shape, {
            x1: start.x,
            y1: start.y,
            x2: end.x,
            y2: end.y
        })
        if (option) Object.assign(group, option)
        //TODO: 动态修改箭头颜色，参见addOverlayArrow()
        if (isPath == null) {
            let radius = group.radius ? group.radius : 6;
            let arrowPath = this.getArrowPath(start, end, radius, group.arrowPoint ? group.arrowPoint : null);
            let path = pathTool.createFromString(arrowPath);
            arrow['buildPath'] = path['buildPath'];
            arrow.dirty(true)
        }
        line.dirty(true)
        this.zr.refresh()
    }
    //刷新溯源箭头
    refreshTraceBackArrow() {
        let { NODE_INFO } = this.state.config
        Object.keys(this.overlayArrows).map(key => {
            let group = this.overlayArrows[key]
            if (group.fromNode) {
                let startPos = {
                    x: this.getNodeOffset(this.nodes[group.fromNode])[0] + this.rootGroup.position[0] + NODE_INFO['width'] / 2 * this.status.scale,
                    y: this.getNodeOffset(this.nodes[group.fromNode])[1] + this.rootGroup.position[1] + NODE_INFO['height'] / 2 * this.status.scale
                };
                let endPos = {
                    x: group.childAt(0).shape.x2,
                    y: group.childAt(0).shape.y2
                }
                let option = {
                    arrowPoint: {
                        x: endPos.x * group.arrowRatio + startPos.x * (1 - group.arrowRatio),
                        y: endPos.y * group.arrowRatio + startPos.y * (1 - group.arrowRatio),
                    },
                }
                this.refreshArrow(group, startPos, endPos, option, false)
            }
        })
    }

    //取得箭头路径，可选择位于连线中部或顶端
    getArrowPath(leftPoint, rightPoint, radius, arrowPoint) {
        if (!arrowPoint) {
            arrowPoint = rightPoint;
        }
        var area = Math.atan2(leftPoint.y - rightPoint.y, rightPoint.x - leftPoint.x) * (180 / Math.PI);
        var x = arrowPoint.x - radius * Math.cos(area * (Math.PI / 180)),
            y = arrowPoint.y + radius * Math.sin(area * (Math.PI / 180));

        var x1 = x + radius * Math.cos((area + 120) * (Math.PI / 180)),
            y1 = y - radius * Math.sin((area + 120) * (Math.PI / 180)),
            x2 = x + radius * Math.cos((area + 240) * (Math.PI / 180)),
            y2 = y - radius * Math.sin((area + 240) * (Math.PI / 180));

        return 'M ' + arrowPoint.x + ' ' + arrowPoint.y + ' L ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2 + ' L ' + (arrowPoint.x2) + ' ' + (arrowPoint.y2) + ' Z'
    }
    //设置聚焦节点
    setActiveNode(node, mode = this.SELECT_DEFAULT) {
        //忽略不满足选中条件的节点
        let { activeGroup, minIndex, maxIndex } = this.status
        if (mode == this.SELECT_SINGLE || (mode == this.SELECT_DEFAULT && !(node.id in this.status.selectedGroups))) {
            //如果是锁屏, 不清除已选择的节点， 否则移除已选择的节点
            if (!this.status.locked) {
                for (let i in this.status.selectedGroups) {
                    if (this.data(this.status.selectedGroups[i])['type'] == 'node') {
                        if (!this.props.permission.looked) {
                            if ((this.data(this.status.selectedGroups[i]).data.st == 3
                                || this.data(this.status.selectedGroups[i]).data.st == 2)
                            ) {
                                this.status.selectedGroups[i].childAt(0).style.shadowColor = this.data(this.status.selectedGroups[i]).data.st == 3 ? "RED" : "ORANGE"
                                if (this.status.selectedGroups[i].childAt(2)) {
                                    this.status.selectedGroups[i].childAt(2).style.opacity = "1"
                                }
                            } else {
                                this.status.selectedGroups[i].childAt(0).style.shadowBlur = 0
                            }
                        } else {
                            //从paradata页面进入选中后节点颜色改变
                            if (this.status.selectedGroups[i].childAt(0).style.shadowColor != "RED"
                                && this.status.selectedGroups[i].childAt(0).style.shadowColor != "ORANGE"
                                && this.status.selectedGroups[i].childAt(0).style.shadowColor != "YELLOW"
                            ) {
                                this.status.selectedGroups[i].childAt(0).style.shadowBlur = 0
                            }
                        }
                        this.setGroupZLevel(this.status.selectedGroups[i], minIndex)
                    }
                }
                for (let key in this.containers) {
                    this.containers[key].childAt(0).style.shadowBlur = 0
                    this.containers[key].childAt(0).style.shadowOffsetY = 0
                    this.containers[key].childAt(0).style.shadowOffsetX = 0
                }
                this.status.selectedGroups = {}
            }
        }

        if (mode == this.SELECT_CANCEL) {
            //取消选择
            if (this.data(node)['type'] == 'node') {
                if (node.childAt(0).style.shadowColor != "RED"
                    && node.childAt(0).style.shadowColor != "ORANGE"
                    && node.childAt(0).style.shadowColor != "YELLOW") {
                    node.childAt(0).style.shadowBlur = 0
                    node.childAt(0).style.opacity = "1";
                    node.childAt(1).style.opacity = "1";
                }
                this.setGroupZLevel(node, minIndex)
            }
            if (this.data(node)['type'] == 'container') {
                node.childAt(0).style.shadowBlur = 0
                node.childAt(0).style.shadowOffsetY = 0
                node.childAt(0).style.shadowOffsetX = 0
                this.setGroupZLevel(node, minIndex)
            }
            for (let i in this.status.selectedGroups) {
                if (node === this.status.selectedGroups[i]) {
                    delete this.status.selectedGroups[i]
                    break
                }
            }
            if (this.props.permission.filterType != "" || this.props.permission.originType != "") {
                this.props.emit("selectNodes", this.status.selectedGroups)
            }
        } else {
            /***只能选择组 */
            if (this.props.permission.groupSelected) {
                // //选择组
                let group = null;
                if (this.data(node)['type'] == 'container') {
                    group = node;
                } else if (this.data(node)['type'] == 'node') {
                    if (node.pid != "" || node.pid != undefined) {
                        group = this.containers[node.pid];
                    }
                }
                for (let key in this.containers) {
                    this.containers[key].childAt(0).style.shadowBlur = 0
                    this.containers[key].childAt(0).style.shadowOffsetY = 0
                    this.containers[key].childAt(0).style.shadowOffsetX = 0
                    this.setGroupZLevel(this.containers[key], minIndex)
                }
                if(group != null){
                }else{//选择画布
                    if(!(node.id in this.status.selectedGroups)){
                        this.status.selectedGroups[node.id] = node
                    }
                    if(this.status.locked){
                        this.setActiveGroup(this.selectedSceneGroup);
                    }else{
                        this.selectedSceneGroup = [];
                        this.setActiveGroup(this.selectedSceneGroup);
                    }
                }
            } else {                        
                //选择节点
                if (this.data(node)['type'] == 'node') {
                    if ((this.props.permission.filterType == "" ||
                        (this.props.permission.filterType != "" && this.props.permission.filterType == this.data(node)['nodeType'])
                    )
                    ) {
                        node.childAt(0).style.shadowBlur = 10
                        node.childAt(0).style.shadowColor = "blue";
                        if ((this.data(node).data.st == 2 || this.data(node).data.st == 3) && node.childAt(2)) {
                            node.childAt(2).style.opacity = "0"
                        }
                        this.setGroupZLevel(node, maxIndex)

                        this.status.hoverGroup = node
                        this.status.activeGroup = node
                    }
                    if(this.props.permission.selectedNode != ""){
                        node.childAt(0).style.shadowBlur = 10
                        node.childAt(0).style.shadowColor = "blue";
                    }
                } else if (this.data(node)['type'] == 'container') {
                    let group = node;
                    for (let key in this.containers) {
                        this.containers[key].childAt(0).style.shadowBlur = 0
                        this.containers[key].childAt(0).style.shadowOffsetY = 0
                        this.containers[key].childAt(0).style.shadowOffsetX = 0
                    }
                    if (group != null) {
                        group.childAt(0).style.shadowBlur = 8
                        group.childAt(0).style.shadowOffsetY = 3;
                        group.childAt(0).style.shadowOffsetX = 3;
                        this.status.hoverGroup = group;
                        this.status.activeGroup = group;
                    }
                }
                if (!(node.id in this.status.selectedGroups)) {
                    if(this.props.permission.selectedNode == ""){
                        this.status.selectedGroups[node.id] = node
                        this.props.emit("selectNodes", this.status.selectedGroups)
                }
                }
            }
        }
        this.status.hoverGroup = node
        this.status.activeGroup = node
        this.setState({
            selectedGroups: this.status.selectedGroups
        })
    }
    setActiveGroup(groups){
        for(var i=0;i < groups.length; i++){
            let group = groups[i];
            group.childAt(0).style.shadowBlur = 8
            group.childAt(0).style.shadowOffsetY = 3
            group.childAt(0).style.shadowOffsetX = 3
            this.setGroupZLevel(group, this.status.maxIndex);
        }
        this.props.emit("selectGroup", groups)
    }
    //设置连线目标节点
    setArrowTargetNode(node) {
        if (node.id != this.status.activeGroup.id) {
            node.childAt(0).style.shadowBlur = 10
            node.childAt(0).dirty(true)
            this.status.arrowTargetNode = node
        }
    }

    //清空连线目标节点
    resetArrowTargetNode() {
        if (this.status.arrowTargetNode && this.status.arrowTargetNode.id != this.status.activeGroup.id) {
            this.status.arrowTargetNode.childAt(0).style.shadowBlur = 0
            this.status.arrowTargetNode.childAt(0).dirty(true)
            this.status.arrowTargetNode = null
        }
    }

    addNode(type, position, option = {}, parent) {
        var that = this
        let { scale } = this.status
        let rootPosition = this.rootGroup.position
        let { NODE_TYPES, NODE_INFO } = this.state.config

        var group = this.addGroup(Object.assign({
            id: option.id || new Date().getTime(),
            position: [divi(position[0] - rootPosition[0], scale), divi(position[1] - rootPosition[1], scale)],
            zlevel: 1,
            onclick: (e) => {
                group.zlevel = 11
            },
            onmousedown: (e) => {
                if (this.status.arrowTargetNode && this.status.arrowTargetNode.id == group.id) {
                    //连线时候，当作目标节点，只连线，不设为焦点
                    return this.stopEvent(e)
                }
                return this.stopEvent(e)
            },
            onmouseover: (e) => {
                this.status.hoverGroup = group
                if (this.status.activeArrow) {
                    this.setArrowTargetNode(group)
                }
                return this.stopEvent(e)
            },
            onmouseout: (e) => {
                if (this.status.hoverGroup && (this.status.hoverGroup.id == group.id)) {
                    this.status.hoverGroup = null
                }
                this.resetArrowTargetNode()
                return this.stopEvent(e)
            }
        }, option), parent)

        let nodeData = this.data(group, Object.assign({}, option, {
            type: 'node',
            nodeType: type,
            title: option['title'] != null ? option['title'] : NODE_TYPES[type]['title'],
        }))

        var ImageShapeOption = {
            position: [0, 0],
            scale: [1, 1],
            style: {
                x: 0,
                y: 0,
                image: NODE_TYPES[type]['icon'],
                width: NODE_INFO['width'],
                height: NODE_INFO['height'],
                color: '#9F9F9F',
                strokeColor: 'blue',
                lineWidth: 5,
                shadowBlur: 0,
                shadowColor: 'blue',
                opacity: "1"
            },
            draggable: false,
            hoverable: false,
            clickable: false,
            silent: false
        }
        if (type == "virtual") {
            ImageShapeOption.style.image = IMG_BASEPATH + option.data.opt.thumbnail;
        }
        var node = new ImageShape(ImageShapeOption)

        let titleNode = new TextShape({
            style: {
                x: NODE_INFO['width'] / 2,
                y: NODE_INFO['height'] + 15,
                text: nodeData['title'],
                textAlign: 'center',
                font: 'bolder 16px sans-serif'
            }
        })

        group.add(node);
        group.add(titleNode);
        this.nodes[group['id']] = group
        return group
    }
    //创建组的操作
    addContainer(type, position, option = {}) {
        var that = this
        //设置缩放比例
        
        let { scale } = this.status
        let { GROUP_TYPES } = this.state.config
        let rootPosition = this.rootGroup.position
        let containerGroup = this.addGroup(Object.assign({
            position: [divi(position[0] - rootPosition[0], scale), divi(position[1] - rootPosition[1], scale)],
            zlevel: 0,
            onmousedown: (e) => {
                this.setActiveNode(containerGroup)
                return this.stopEvent(e)
            },
            onmouseover: (e) => {
                this.status.hoverGroup = containerGroup
                if (!this.status.locked &&
                    !that.props.permission.groupSelected
                    && !that.props.permission.nodeOnlySelected
                    && !that.props.permission.selectedNode) {
                    e.target.style.shadowColor = "rgba(0,0,0,0.5)"
                    e.target.style.shadowBlur = 10
                }
            },
            onmouseout: (e) => {
                if (!that.props.permission.groupSelected
                    && !that.props.permission.nodeOnlySelected
                    && !that.props.permission.selectedNode) {
                    e.target.style.shadowColor = "rgba(255,0,0,0)"
                    e.target.style.shadowBlur = 0
                }
                if (this.status.hoverGroup && (this.status.hoverGroup.id == containerGroup.id)) {
                    this.status.hoverGroup = null
                }
            }
        }, option))

        let containerData = this.data(containerGroup, Object.assign(option, {
            type: 'container',
            containerType: type,
            title: option.title != null ? option.title : GROUP_TYPES[type]['title']
        }))
        let containerRect
        if (GROUP_TYPES[type]['shape'] == 'image') {
            containerRect = new ImageShape({
                id: containerGroup.id + "_r",
                position: [0, 0],
                style: Object.assign({
                    x: 0,
                    y: 0,
                    width: GROUP_TYPES[type]['width'],
                    height: GROUP_TYPES[type]['height'],
                    image: GROUP_TYPES[type]['image']
                }, GROUP_TYPES[type]['style']),
                zlevel: 0
            })

            this.data(containerRect, {
                type: "image"
            })

        } else {
            containerRect = new RectShape({
                id: containerGroup.id + "_r",
                shape: {
                    x: 0,
                    y: 0,
                    width: GROUP_TYPES[type]['width'],
                    height: GROUP_TYPES[type]['height']
                },
                style: Object.assign({
                    fill: 'rgba(255, 0, 0, 0)',
                    stroke: 'red'
                }, GROUP_TYPES[type]['style']),
                zlevel: 0
            })
            if (option.data.pos != undefined && option.data.pos.color != undefined) {
                containerRect.style.stroke = option.data.pos.color
            }

            if (GROUP_TYPES[type]['animateTime']) {
                containerRect.animate('style', true)
                    .when(GROUP_TYPES[type]['animateTime'], GROUP_TYPES[type]['animateOption'])
                    .start();
            }
        }
        let contentGroup = this.addGroup({
            id: containerGroup.id + "_c",
            position: [0, 0]
        })

        this.data(contentGroup, {
            type: "containerContent"
        })

        let titleContainer = new TextShape({
            style: {
                x: GROUP_TYPES[type]['width'] / 2,
                y: GROUP_TYPES[type]['height'] + 25,
                text: option.title,
                textAlign: 'center',
                font: 'bolder 16px sans-serif'
            }
        })

        containerGroup.add(containerRect)
        containerGroup.add(contentGroup)
        containerGroup.add(titleContainer)
        this.containers[containerGroup.id] = containerGroup
        return containerGroup;
    }

    connectActiveArrow() {
        if (this.status.arrowTargetNode) {
            this.clearData(this.status.activeArrow)
            this.addRelation(this.status.activeGroup, this.status.arrowTargetNode, this.status.activeArrow)
            this.status.activeArrow = null
            this.setActiveNode(this.status.arrowTargetNode)
            this.resetArrowTargetNode()
        } else {
            this.clearData(this.status.activeArrow)
            this.rootGroup.remove(this.status.activeArrow)
            delete this.arrows[this.status.activeArrow.id]
            this.status.activeArrow = null
        }
    }

    addRelation(startNode, endNode, arrow) {
        let newId = "_" + startNode.id + "_" + endNode.id + "_"
        this.arrows[newId] = this.arrows[arrow.id]
        delete this.arrows[arrow.id]
        arrow['id'] = newId
        this.refreshArrow(arrow)

    }

    refreshContainerReact(container) {
        let rect = container.childAt(0),
            content = container.childAt(1),
            title = container.childAt(2);

        //空的容器，不作处理，保持默认形状
        if (content.children().length == 0) {
            return
        }

        let bRect = content.getBoundingRect()
       
        let rx = bRect.x - 25,
            ry = bRect.y - 25,
            rWidth = bRect.width + 45,
            rHeight = bRect.height + 35
        rWidth = rWidth < 200 ? 200 : rWidth;
        rHeight = rHeight < 150 ? 150 : rHeight;
        if (this.data(rect)['type'] == 'image') {
            rect.style = Object.assign(rect.style, {
                x: rx,
                y: ry,
                width: rWidth,
                height: rHeight
            })
        } else {
            rect.shape = Object.assign(bRect, {
                x: rx,
                y: ry,
                width: rWidth,
                height: rHeight
            })
        }
        title.style.x = rx + rWidth / 2
        title.style.y = ry + rHeight + 25
        title.dirty(true)
        rect.dirty(true)
    }

    bindNodeToContainer(container, node) {
        let content = container.childAt(1)
        let { scale } = this.status
        content.add(node)
        let offset = this.getNodeOffset(container);
        node.position = [node.position[0] - offset[0] / scale, node.position[1] - offset[1] / scale]
        this.refreshContainerReact(container);
    }

    unbindNodeToContainer() {

    }

    toImage() {

    }

    data(node, map) {
        let data = this._data,
            id = node['id'] || node
        if (!data[id]) {
            data[id] = {}
        }

        if (map) {
            data[id] = Object.assign({}, data[id], map)
        }

        return data[id]
    }

    clearData(node) {
        let data = this._data,
            id = node['id'] || node
        delete data[id]
    }

    //序列化
    serialize() {
        let nodes = this.nodes,
            arrows = this.arrows,
            containers = this.containers

        let data = {
            position: this.rootGroup.position,
            scale: this.rootGroup.scale
        }

        let nodesData = {}, arrowsData = {}, containersData = {}
        for (let key in nodes) {
            let node = nodes[key]
            let nodeData = this.data(node)
            nodesData[key] = {
                id: node['id'],
                position: node['position']
            }
            this.data(node, {
                pid: this.data(node.parent)['type'] == "containerContent" ? node.parent.parent.id : parent.id
            })
        }
        for (let key in arrows) {
            let arrow = arrows[key]
            arrowsData[key] = {
                id: arrow['id']
            }
        }

        for (let key in containers) {
            let container = containers[key]
            containersData[key] = {
                id: container.id,
                position: container.position,
            }
        }

        data['nodes'] = nodesData
        data['arrows'] = arrowsData
        data['containers'] = containersData
        data['_data'] = this._data

        return data;
    }

    //反序列化
    deserialization(data) {
        const { position, scale, containers, nodes, arrows, _data } = data
        this.resetPage({}, () => {
            for (let key in containers) {
                let container = containers[key]
                let containerData = _data[container['id']]
                this.addContainer(containerData['containerType'], container.position, Object.assign({ id: container.id }
                    , containerData))
            }

            for (let key in nodes) {
                let node = nodes[key]
                let nodeData = _data[node['id']]
                let container = this.containers[nodeData['pid']]
                this.addNode(nodeData['nodeType'], node['position'], Object.assign(
                    { id: node.id }
                    , nodeData), container && container.childAt(1))
            }
            for (let key in this.containers) {

                this.refreshContainerReact(this.containers[key])

            }
            for (let key in arrows) {
                let arrow = arrows[key]
                let arrowData = _data[arrow['id']]
                let ids = arrow.id.split('_')
                let startNode = this.nodes[ids[1]],
                    endNode = this.nodes[ids[2]]

                if (startNode != undefined
                    && startNode.position != undefined
                    && endNode != undefined
                    && endNode.position != undefined) {
                    let arrowGroup = this.addArrow({
                        x: startNode.position[0],
                        y: startNode.position[1]
                    }, {
                            x: endNode.position[0],
                            y: endNode.position[1]
                        }, Object.assign({
                            id: arrow['id'],
                            color: arrow['color'],
                            text: arrow["text"],
                            st: arrow["st"]
                        }, arrowData))

                    this.refreshArrow(arrowGroup)
                }
            }

            this.rootGroup.position = position
            this.rootGroup.scale = scale || [1, 1]
            this.status.scale = scale[0]
        })
    }


    //######################所有工具栏点击操作################################
    //工具栏，清空页面
    resetPage(option = {}, callback) {
        Object.keys(this.nodes).map(key => {
            this.deleteNode(this.nodes[key])
        })
        Object.keys(this.containers).map(key => {
            this.deleteContainer(this.containers[key])
        })
        this.clearData(this.rootGroup)
        this.rootGroup = null

        this.status = {
            selectedGroups: {},
            hoverGroup: null,
            maxIndex: 99,
            minIndex: 1,
            scale: 1,
            maxScale: 5,
            minScale: 0.2,
            locked: false
        }

        this.setState({
            searchIndex: 0
            , dataStr: '' //整张图序列化之后的字符串
            , dataStrValid: true
        }, () => {
            this._initRootGroup({ type: "refresh" })
            callback && callback()
        })

    }

    _initRootGroup(option = {}) {
        this.rootGroup = new Group(Object.assign({
            position: [0, 0]
            , id: new Date().getTime()
        }))

        this.data(this.rootGroup, {
            type: 'rootGroup'
        })
        if (option.type == undefined || option.type != "refresh") {
            this.overlayGroup = new Group(Object.assign({
                position: [0, 0]
                , id: new Date().getTime() + "_overlay"
            }))
            this.zr.add(this.overlayGroup)

        }
        this.zr.add(this.rootGroup)
    }

    //比例操作
    zoom(scale) {
        let { maxScale, minScale } = this.status
        if (scale < minScale || scale > maxScale) {
            return
        }
        this.rootGroup.scale = [scale, scale]
        this.rootGroup.dirty(true)
        this.status.scale = scale
        this.refreshTraceBackArrow()
    }
    //工具栏，放大
    zoomIn() {
        let scale = add(this.status.scale, 0.05)
        this.zoom(scale)
    }

    //工具栏，缩小
    zoomOut() {
        let scale = sub(this.status.scale, 0.05)
        this.zoom(scale)
    }

    //工具栏，正常大小
    zoomReset() {
        let scale = this.status.scale = 1;
        this.zoom(scale);
    }

    //设置搜索关键字
    setKeyWord(e) {
        this.setState({
            keyword: e.target.value,
            searchIndex: 0
        })
    }

    resetNodeStatus() {
        let nodes = this.nodes;
        for (let key in nodes) {
            let node = nodes[key]
            //如果是正常打开cmdb， 恢复为本身状态
            if (!this.props.permission.looked) {
                if (this.data(node).data.st == 2 || this.data(node).data.st == 3) {
                    node.childAt(0).style.shadowBlur = 10;
                    node.childAt(0).style.shadowColor = this.data(node).data.st == 2 ? "ORANGE" : "RED";
                    if (node.childAt(2)) {
                        node.childAt(2).style.opacity = "1"
                    }
                } else {
                    node.childAt(0).style.shadowBlur = 0;
                }
            } else { //如果是其他入口打开cmdb, 全部恢复为正常状态
                node.childAt(0).style.shadowBlur = 0;
            }
            node.children().map((c, i) => {
                c.zlevel = this.status.maxIndex
                c.dirty(0)
            })
            this.zr.refresh()
        }
        this.setActiveNode(this.rootGroup);
    }
    //工具栏，搜索节点
    searchNode() {
        this.status.selectedGroups = {};
        let nodes = this.nodes;
        let { keyword } = this.state
        if (keyword != "") {
            for (let key in nodes) {
                let node = nodes[key]
                let nodeTitle = this.data(node)['title'];
                if (nodeTitle && nodeTitle.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
                    this.setActiveNode(node, this.SELECT_MULTIPLE);
                    this.status.selectedGroups[key] = node;
                }
            }
            if ($s.getObjectLength(this.status.selectedGroups) > 0) {
                this.status.hoverGroup = this.rootGroup;
            } else {
                parent.window.alert("暂无查询结果！");
                this.resetNodeStatus();
            }
        } else { //还原状态
            this.resetNodeStatus();
        }
        this.props.emit("selectNodes", this.status.selectedGroups);
        this.setState({
            selectedGroups: this.status.selectedGroups
        })
        this.zr.refresh()
    }

    lookupNode(node) {
        let offset = this.getNodeOffset(node)
        let rootPosition = this.rootGroup.position
        const { mapWidth, mapHeight } = this.state
        const { scale } = this.status
        let xMove = sub(divi(mapWidth, 2), add(offset[0] + rootPosition[0], node.childAt(0).style.width * scale)),
            yMove = sub(divi(mapHeight, 2), add(offset[1] + rootPosition[1], node.childAt(0).style.height * scale))

        this.rootGroup.position = [add(this.rootGroup.position[0], xMove), add(this.rootGroup.position[1], yMove)]
        this.rootGroup.dirty(true)
    }

    //工具栏，搜索文本框回车搜索
    enterSearch(e) {
        let event = e || window.event;
        if (event.keyCode == 13) {//按下了enter键
            this.searchNode()
            document.getElementById("search-btn").blur(); 
        }
    }

    //工具栏，显示json
    setTxtData() {
        let data = this.serialize()
        this.setState({
            dataStr: JSON.stringify(data, null, 10),
            dataStrValid: true
        })
    }

    //######################所有右键菜单操作################################
    //右键菜单栏，创建节点操作
    createNode(type, position) {
        this.refs.rightMenu.hideMenu()
        setTimeout(() => {
            let title = window.prompt("请输入节点名称:", "新建节点")
            if (title == null) {
                return;
            }
            let node = this.addNode(type, position, {
                title
            })
            let { activeGroup } = this.status
            if (activeGroup && this.data(activeGroup)['type'] == 'container') {
                this.bindNodeToContainer(activeGroup, node)
            }
        }, 100)
    }

    //创建组操作
    createContainer(type, position) {
        this.refs.rightMenu.hideMenu()
        setTimeout(() => {
            let title = window.prompt("请输入组名称:", "新建组")
            if (title == null) {
                return;
            }
            let group = this.addContainer(type, position, {
                title
            })
            let { activeGroup } = this.status
            if (activeGroup && this.data(activeGroup)['type'] == 'container') {
                this.bindNodeToContainer(activeGroup, group)
            }
        }, 100)
    }

    //右键菜单 连接
    addActiveArrow(e) {
        let arrowPosition = this.getActiveArrowPosition(e)
        this.status.activeArrow = this.addArrow(arrowPosition.start, arrowPosition.end)
        return this.status.activeArrow
    }

    //右键菜单，删除
    deleteHandle(e) {
        let { activeGroup } = this.status
        if (this.data(activeGroup)['type'] == 'node') {
            this.deleteNode(activeGroup)
        } else if (this.data(activeGroup)['type'] == 'container') {
            this.deleteContainer(activeGroup)
        }
    }

    deleteNode(node) {
        let arrowIds = this.findArrowIdsByNode(node),
            arrows = this.arrows

        arrowIds.map((id, index) => {
            let arrow = arrows[id]
            arrow.parent.remove(arrow)
            this.clearData(arrow)
            delete arrows[id]
        })

        delete this.nodes[node['id']]
        this.clearData(node)
        node.parent.remove(node)
    }

    deleteContainer(container) {
        let content = container.childAt(1)
        let childs = content.children()
        childs.map((child, index) => {
            this.deleteNode(child)
        })
        delete this.containers[container['id']]
        this.clearData(container)
        container.parent.remove(container)
    }

    getActiveArrowPosition(e) {
        let { NODE_INFO } = this.state.config
        let activeGroup = this.status.activeGroup

        let paperOffset = this.getOffset(this.refs.paper)
        let rootPosition = this.rootGroup.position

        let startPosition = this.getNodeOffset(activeGroup)
        let endPosition = [e.clientX - paperOffset.left - rootPosition[0], e.clientY - paperOffset.top - rootPosition[1]]

        let scale = this.status.scale

        return {
            start: {
                x: divi(startPosition[0], scale) + NODE_INFO['width'] / 2,
                y: divi(startPosition[1], scale) + NODE_INFO['height'] / 2
            },
            end: {
                x: divi(endPosition[0], scale) + (endPosition[0] > startPosition[0] ? -5 : 5),
                y: divi(endPosition[1], scale) + (endPosition[1] > startPosition[1] ? -5 : 5),
            }
        }
    }

    //工具栏方法 重命名
    renameHandle(e) {
        this.refs.rightMenu.hideMenu()
        setTimeout(() => {
            let activeGroup = this.status.activeGroup
            let activeGroupData = this.data(activeGroup)
            let title = window.prompt("请输入新的名字", activeGroupData['title'])
            if (title == null) {
                return
            }
            if (activeGroupData['type'] == 'container') {
                this.renameContainer(activeGroup, title)
            } else if (activeGroupData['type'] == 'node') {
                this.renameNode(activeGroup, title)
            }
        }, 100)
    }

    //给组重命名
    renameContainer(container, title) {
        let titleNode = container.childAt(2)
        titleNode.style.text = title
        this.data(container, {
            title
        })
        titleNode.dirty(true)
    }

    //给节点重命名
    renameNode(node, title) {
        let titleNode = node.childAt(1)
        titleNode.style.text = title
        this.data(node, {
            title
        })
        titleNode.dirty(true)
    }

    //#######################所有监听事件#######################
    //拖拽结束监听事件
    onDragEnd(dragTarget) {
        //有待实现
    }
    updateScale() {
        let scale = sub(this.status.scale, 0.6)
        this.zoom(scale)
    }
}
