let indexedDB 


export function getIndexedDB(){
    if(indexedDB == null){
       indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    }
    if(indexedDB == null){
        alert("浏览器不支持indexedDB")
    }
    return indexedDB
}

export function openDB(name,version,option={}){
    let db = null
    const request = getIndexedDB().open(name, version)
    request.onerror = function(event){
        console.log("打开DB失败", event);
        option.onerror&&option.onerror(event)
    }
    request.onupgradeneeded   = function(event){
        console.log(`数据库版本更新到：${version}`);
        db = event.target.result;

        option.onupgradeneeded&&option.onupgradeneeded(event)
        
    };
    request.onsuccess  = function(event){
        console.log("打开DB成功", event);
        db = event.target.result;
        option.onsuccess&&option.onsuccess(event)
    }

    return db
}

export function add(db, storeName, data){
    var transaction=db.transaction(storeName,'readwrite'); 
    var store=transaction.objectStore(storeName); 
    
    return new Promise((resolve,reject)=>{
        let request = store.put(data)
        request.onsuccess = ()=>{
            resolve({code: "success"})
        }
        request.onerror = (e)=>{
            reject({code: "error"})
            console.error("调用indexedDBUtil->add方法失败", event);
        }
    })
}

export function find(db, storeName, data={}){
    var transaction=db.transaction(storeName,'readwrite'); 
    var store=transaction.objectStore(storeName); 
    if(JSON.stringify(data) == '{}'){
        return new Promise((resolve,reject)=>{
            let request = store.getAll()
            request.onsuccess = (e)=>{
                resolve(e.target.result)
            }
            request.onerror = (e)=>{
                reject({code: "error"})
                console.error("调用indexedDBUtil->find方法失败", event);
            }
        })
    }else if(data['keyPath'] !== null){
        return new Promise((resolve,reject)=>{
            let request = store.get(data['keyPath'])
            request.onsuccess = (e)=>{
                resolve(e.target.result)
            }
            request.onerror = (e)=>{
                reject({code: "error"})
                console.error("调用indexedDBUtil->find方法失败", event);
            }
        })
    }
}