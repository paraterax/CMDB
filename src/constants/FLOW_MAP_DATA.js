import para from 'app/images/flowMap/para.png'
import cloudImage from 'app/images/flowMap/cloud_bk.png'
export const MENU_TYPES = [
    //画布右键菜单
    { key: "addGroup", title: "新建组", targets: { node: false, rootGroup: true, container: false, arrow: false } }
    , { key: "addNode", title: "新建节点", targets: { node: false, rootGroup: true, container: true, arrow: false } }

    //连接线右键菜单
    , { key: "delArrow", title: "删除连接", targets: { node: false, rootGroup: false, container: false, arrow: true } }
    , { key: "editArrow", title: "编辑关联描述", targets: { node: false, rootGroup: false, container: false, arrow: true } }

    //节点右键菜单
    , { key: "addArrow", title: "连接", targets: { node: true, rootGroup: false, container: false, arrow: false } }
    , { key: "editNode", title: "编辑", targets: { node: true, rootGroup: false, container: true, arrow: false } },
    , { key: "delNode", title: "删除", targets: { node: true, rootGroup: false, container: true, arrow: false } },
    , { key: "nodeDetail", title: "详情", targets: { node: true, rootGroup: false, container: false, arrow: false } }
    , { key: "traceBack", title: "溯源", targets: { node: true, rootGroup: false, container: false, arrow: false } },
    //多节点右键菜单
    { key: "batch_modify", title: "批量修改", targets: { node: false, rootGroup: false, container: false, arrow: false, nodes: true } },
    { key: "batch_remove", title: "批量删除", targets: { node: false, rootGroup: false, container: false, arrow: false, nodes: true } },
    { key: "batch_add", title: "添加组", targets: { node: false, rootGroup: false, container: false, arrow: false, nodes: true } },
]


export const TOOLBAR_TYPES = [
    [
        { name: 'default', checkBtn: true, title: "选中" }
        , { name: 'pan', checkBtn: true, title: "锁屏" }
    ], 
    [
        { name: 'zoomin', title: "放大" }
        , { name: 'zoomout', title: "缩小" }
        , { name: 'zoomreset', title: "重置" }
    ], 
    [
        { name: 'search', title: "搜索" }
    ], 
    [
        { name: "refresh", title: "刷新" }
    ],
    [
        { name: "high", title: "高级检索" }
    ],
    [
        { name: "batch_modify", title: "批量修改" },
    ],
    [
        { name: "batch_remove", title: "批量删除" },
    ],
    [
        { name: "batch_add", title: "添加组" },
    ]
]
export const NODE_TYPES = {}
for(var key in nodeTpls){
    NODE_TYPES[key] = {
        icon: nodeTpls[key].icon,
        level:nodeTpls[key].level, 
        title: nodeTpls[key].title
    }
}
export const GROUP_TYPES = {
    group1: {
        title: '组一',
        width: 200,
        height: 100,
        shape: "",
        style: {
            lineWidth: 3,
            lineDash: [10, 10],
            stroke: "#00a0e9"
        },
        animateTime: 1000,
        animateOption: {
            lineDashOffset: -20
        }
    },
    group2: {
        title: '组二',
        width: 200,
        height: 100,
        shape: "",

        style: {
            lineWidth: 5,
            lineDash: [10, 10],
            stroke: "#8c77d6"
        },
        animateTime: 1000,
        animateOption: {
            lineDashOffset: -20
        }
    },
    group3: {
        title: '组三',
        width: 200,
        height: 100,
        shape: "",
        style: {
            lineWidth: 5,
            lineDash: [10, 10],
            stroke: "#f29b76"
        },
        animateTime: 1000,
        animateOption: {
            lineDashOffset: -20
        }
    }
    , group4: {
        title: '组四',
        width: 200,
        height: 100,
        shape: "",
        style: {
            lineWidth: 3,
            lineDash: [10, 10],
            stroke: "#5cb85c"
        },
        animateTime: 1000,
        animateOption: {
            lineDashOffset: -20
        }
    },
    group5: {
        title: '组五',
        width: 200,
        height: 100,
        shape: "",

        style: {
            lineWidth: 5,
            lineDash: [10, 10],
            stroke: "#d9534f"
        },
        animateTime: 1000,
        animateOption: {
            lineDashOffset: -20
        }
    },
    group6: {
        title: '组六',
        width: 200,
        height: 100,
        shape: "",
        style: {
            lineWidth: 5,
            lineDash: [10, 10],
            stroke: "#31708f"
        },
        animateTime: 1000,
        animateOption: {
            lineDashOffset: -20
        }
    }
}

export const NODE_TYPES_LENGTH = 4

export const NODE_INFO = {
    width: 45
    , height: 50
}

export let MAP_DATA = {
    nodes: {

    }
    , arrow: {

    }
}