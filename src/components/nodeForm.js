var nodeTpls = {
    //服务器类:
    host : {
        icon: "images/flowMap/node.png",
        level: 1,
        title: "服务器节点",
        params: {
            cid:{
                label:"所属集群",
                type:"select",
                defaultValue:null,
                readOnly:null
            },
            ip:{
                label:"IP地址",
                type:"text", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            }
        }
    },
    //业务节点-mysql
    /**
     * 
     * IP、端口、用户名、密码、安装目录
     */
    mysql : {
        icon: "images/flowMap/mysql.png",
        level: 1,
        title: "业务节点-MySql",
        params: {
             cid:{
                label:"所属集群",
                type:"select",
                defaultValue:null,
                readOnly:null
            },
            hid:{
                label:"所属服务器节点",
                type:"select",
                defaultValue:null,
                readOnly:null
            },
            ip:{
                label:"IP地址",
                type:"select", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            port:{
                label:"端口",
                type:"text", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            mysql_path:{
                label:"安装路径",
                type:"text", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            user:{
                label:"用户名",
                type:"text", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            password:{
                label:"密码",
                type:"password", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            }
        }
    },
    //业务节点-tomcat
    tomcat : {
        icon: "images/flowMap/tomcat.png",
        level: 1,
        title: "业务节点-Tomcat",
        params: {
            cid:{
                label:"所属集群",
                type:"select",
                defaultValue:null,
                readOnly:null
            },
            hid:{
                label:"所属服务器节点",
                type:"select",
                defaultValue:null,
                readOnly:null
            },
            ip:{
                label:"IP地址",
                type:"select", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            port:{
                label:"端口",
                type:"text", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            tomcat_path:{
                label:"安装路径",
                type:"text", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            user:{
                label:"用户名",
                type:"text", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            password:{
                label:"密码",
                type:"password", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            }
        }
    },
    //进程服务器类:
    linuxprocess : {
        icon: "images/flowMap/jcfwl.png",
        level: 1,
        title: "业务节点-进程类",
        params: {
            cid:{
                label:"所属集群",
                type:"select",
                defaultValue:null,
                readOnly:null
            },
            hid:{
                label:"所属服务器节点",
                type:"select",
                defaultValue:null,
                readOnly:null
            },
            ip:{
                label:"IP地址",
                type:"select", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            process_name:{
                label:"进程名称",
                type:"text", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            port:{
                label:"端口号",
                type:"text", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            }
        }
    },
    //虚拟节点
    virtual : {
        icon: "images/flowMap/node.png",
        level: 1,
        title: '虚拟节点',
        params:{
            thumbnail: {
                label: "上传图标",
                type: 'imgUpload',
                defaultValue: null,
                readOnly: null
            }
        }
    },
    //网络交换机:
    networkswitch : {
        icon: "images/flowMap/wljhj.png",
        level: 1,
        title: '交换机',
        params:{
            nip:{
                label:"管理IP",
                type:"text", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            cid:{
                label:"所属集群",
                type:"select", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            hid:{
                label:"所属服务器节点",
                type:"select", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            ip:{
                label:"服务器节点IP地址",
                type:"select", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            }
        }
    },
    //oracle
    oracle : {
        icon: "images/flowMap/oracle.png",
        level: 1,
        title: "oracle节点",
        params: {
            cid:{
                label:"所属集群",
                type:"select",
                defaultValue:null,
                readOnly:null
            },
            hid:{
                label:"所属服务器节点",
                type:"select",
                defaultValue:null,
                readOnly:null
            },
            ip:{
                label:"IP地址",
                type:"select", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            port:{
                label:"端口",
                type:"text", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            user:{
                label:"用户名",
                type:"text", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
            password:{
                label:"密码",
                type:"password", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            },
        }
    },
    //soft
    soft : {
        icon: "images/flowMap/soft.png",
        level: 1,
        title: "soft节点",
        params: {
            cid:{
                label:"所属集群",
                type:"select",
                defaultValue:null,
                readOnly:null
            },
            ip:{
                label:"IP地址",
                type:"text", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            }
        }
    },
    //jss
    jss : {
        icon: "images/flowMap/jss.png",
        level: 1,
        title: "jss节点",
        params: {
             cid:{
                label:"所属集群",
                type:"select",
                defaultValue:null,
                readOnly:null
            },
            ip:{
                label:"IP地址",
                type:"text", //text  select checkbox  imgUpload
                defaultValue:null,
                readOnly:null
            }
        }
    },
    //unsize
    unsize : {
        icon: "images/flowMap/unsize.png",
        level: 1,
        title: "unsize节点",
        params: {
             cid:{
                label:"所属集群",
                type:"select",
                defaultValue:null,
                readOnly:null
            },
        }
    },
    //ms
    ms : {
        icon: "images/flowMap/ms.png",
        level: 1,
        title: "ms节点",
        params: {
             cid:{
                label:"所属集群",
                type:"select",
                defaultValue:null,
                readOnly:null
            },
        }
    },
    //adf
    adf : {
        icon: "images/flowMap/adf.png",
        level: 1,
        title: "adf节点",
        params: {
             cid:{
                label:"所属集群",
                type:"select",
                defaultValue:null,
                readOnly:null
            },
        }
    },
    //lsf
    lsf : {
        icon: "images/flowMap/lsf.png",
        level: 1,
        title: "lsf节点",
        params: {
             cid:{
                label:"所属集群",
                type:"select",
                defaultValue:null,
                readOnly:null
            }
        }
    }
}

