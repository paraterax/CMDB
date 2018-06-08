import * as dbUtil from './indexedDBUtil'
import data from './bk/nodeGroupBk'

let db;

function getDB(){
    let upgradeneeded = false
    return new Promise((resolve,reject)=>{
        
        if(!db){
            dbUtil.openDB('paraData',1,{
                onupgradeneeded:(e)=>{
                    upgradeneeded = true
                    db = e.target.result;
                    if(!db.objectStoreNames.contains('groups')){
                        db.createObjectStore('groups',{keyPath:"gid",autoIncrement: true});
                        console.log("#####################创建groups表成功#####################")
                    }
                    
                    if(!db.objectStoreNames.contains('nodes')){
                        db.createObjectStore('nodes',{keyPath:"nid",autoIncrement: true});
                        console.log("#####################创建nodes表成功#####################")
                    }

                    if(!db.objectStoreNames.contains('arrows')){
                        db.createObjectStore('arrows',{keyPath:"id",autoIncrement: true})
                        console.log("#####################创建arrows表成功#####################")
                    }
                    if(data){
                        setTimeout(()=>{
                            save_all_data(data)
                            .then(()=>{
                                console.log("#####################恢复数据成功#####################")
                                resolve(db)
                            })
                            .catch(()=>{
                                console.log("#####################恢复数据失败#####################")
                                resolve(db)
                            })
                        },1000)
                    }
                },
                onsuccess:(e)=>{
                    db = e.target.result;
                    if(!upgradeneeded){
                        resolve(db)
                    }
                }

            })
        }else{
            resolve(db)
        }
    })
}

function dbDone(callback){ 
    return new Promise((resolve, reject)=>{
        getDB().then((db)=>{
            callback(db, resolve, reject)
        })
    })
}

//新增组
export function group_save(data){
    return dbDone((db, resolve, reject)=>{
        dbUtil.add(db,'groups',data).then((response)=>{
            resolve(response)
        }).catch((response)=>{
            reject(response)
        })
    })
}


//新增节点
export function node_save(data){
    return dbDone((db, resolve, reject)=>{
        dbUtil.add(db,'nodes',data).then((response)=>{
            resolve(response)
        }).catch((response)=>{
            reject(response)
        })
    })
}

//新增箭头
export function node_relation_add(data){
    return dbDone((db, resolve, reject)=>{
        dbUtil.add(db,'arrows',data).then((response)=>{
            resolve(response)
        }).catch((response)=>{
            reject(response)
        })
    })
}

//查询所有数据
export function all_data(data){
    return dbDone((db, resolve, reject)=>{
        Promise.all([
            dbUtil.find(db,'nodes',data),
            dbUtil.find(db,'arrows',data),
            dbUtil.find(db,'groups',data)
        ]).then((data)=>{
            resolve(transAllData(data))
        }).catch((response)=>{
            reject(response)
        })
    })
}

function transAllData(data){
    let [nodes,arrows,groups] = data
    let nNodes = {}, nGroups = {}
    
    nodes.map((node, i)=>{
        node['c'] = []
        nNodes[node['nid']] = node
    })

    groups.map((group, i)=>{
        nGroups[group['gid']] = group
    })

    arrows.map((arrow, i)=>{
        nNodes[arrow['p']]['c'].push(arrow['c'])
    })
    
    return {
        nodes: nNodes,
        groups: nGroups
    }

}

//把所有数据保存到数据库
export function save_all_data(data){
    let {nodes, groups} = data
    let dbArrows = [], dbNodes = [], dbGroups = []
    for(let key in nodes){
        let p = nodes[key]['nid']
        let cs = nodes[key]['c']||[]
        cs.map((c)=>{
            let id = `_${p}_${c}_`
            dbArrows.push({
                id,
                p,
                c
            })
        })
       delete nodes[key]['c']
       dbNodes.push(nodes[key])
    }

    for(let key in groups){
        dbGroups.push(groups[key])
    }

    return dbDone((db, resolve, reject)=>{
        Promise.all([
            dbArrows.map((arrow)=>{
                dbUtil.add(db,'arrows',arrow)
            })
            .concat(dbNodes.map((node)=>{
                dbUtil.add(db,'nodes',node)
            }))
            .concat(dbGroups.map((group)=>{
                dbUtil.add(db,'groups',group)
            }))
        ]).then((response)=>{
            resolve({code:'success'})
        }).catch((response)=>{
            reject({code:'error'})
        })
    })
}

//获取所有标签列表
export function tag_list(){
    return new Promise((resolve,reject)=>{
        resolve([
            {"tgid": "2c9284b45920674d0159206d8e630001","tgn": "标签一"},
            {"tgid": "2c9284b45920674d0159206d8e630002","tgn": "标签二"},
            {"tgid": "2c9284b45920674d0159206d8e630003","tgn": "标签三"},
            {"tgid": "2c9284b45920674d0159206d8e630004","tgn": "标签四"},
            {"tgid": "2c9284b45920674d0159206d8e630005","tgn": "标签五"}
        ])
    })
}

//获取所有的节点类型列表
export function type_list(){
    return new Promise((resolve,reject)=>{
        resolve([
            "zuzhi",
            "zzuzhi"
        ])
    })
}

//获取所有的节点组
export function group_list(){
    return dbDone((db, resolve, reject)=>{
        dbUtil.find(db,'groups').then((response)=>{
            resolve(response)
        }).catch((response)=>{
            reject(response)
        })
    })
}



//通过id找node
export function node_detail(data){
    return dbDone((db, resolve, reject)=>{
        dbUtil.find(db,'nodes',{keyPath:data['nid']}).then((data)=>{
            resolve(data)
        }).catch((response)=>{
            reject(response)
        })
    })
}


//通过id找container
export function group_detail(data){
    return dbDone((db, resolve, reject)=>{
        dbUtil.find(db,'groups',{keyPath:data['gid']}).then((data)=>{
            resolve(data)
        }).catch((response)=>{
            reject(response)
        })
    })
}


