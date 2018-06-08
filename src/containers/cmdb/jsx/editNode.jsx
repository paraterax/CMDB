import React from 'react'
import { Select } from 'antd'
import classNames from 'classnames'
import nodeForm from '../nodeForm'

const Option = Select.Option
export function setEditNodeInfo(key,e){
    let {
        editNodeAble,
        editNode,
        validTps,
    } = this.state;
    if(key == "nn" && e.target.value != ""){
        this.setState({
            nodeNameValid: true
        })
    }
    if(key == "type" && e.target.value != ""){
        this.setState({
            nodeTypeValid: true
        })
        editNode.opt = {}
        let tpls = nodeTpls[e.target.value].params;
        Object.keys(tpls).map(key=>{
            editNode.opt[key] = ""
        })
        validTps = {}
    }
    if(key == 'tags'){
        editNode[key] = e;
    }else{
        editNode[key] = e.target.value
    }
    this.setState({
        editNode,
        validTps
    })
}


function changeNodeFormHandle(key, e){
    let {
        editNode
    } = this.state;
   
    if(key == "thumbnail"){
        editNode.opt[key] = e.target.files[0];
    }else{
        if(key == "cid" || key == "hid" || (key == "ip" && editNode.type != "host" && editNode.type != "networkswith" && editNode.type != "jss" 
        && editNode.type != "soft")){
            editNode.opt[key] = e;
        }else{
            editNode.opt[key] = e.target.value;
        }
         
        if(editNode.type != "host"){
            if(key == "cid"){
                editNode.opt.hid = ""
                editNode.opt.ip = ""
                if(editNode.opt[key] == ""){
                    this.setState({
                        clusterHostList: [],
                        hostIpList: []
                    })
                    if( editNode.opt.hid != undefined ) editNode.opt.hid = ""
                    if( editNode.opt.ip != undefined ) editNode.opt.ip = ""
                }else{
                    Promise.all([
                        this.getHostListByCid(editNode.opt[key])
                    ]).then(()=>{
                        if( editNode.opt.hid != undefined ) editNode.opt.hid = ""
                        if( editNode.opt.ip != undefined ) editNode.opt.ip = ""
                    })
                }
                
               
            }else if(key == "hid"){
                if(editNode.opt[key] == ""){
                    this.setState({
                        hostIpList: []
                    })
                    if( editNode.opt.ip != undefined ) editNode.opt.ip = ""
                }else{
                    editNode.opt.ip = ""
                     Promise.all([
                        this.getIpListByHid(editNode.opt[key])
                    ]).then(()=>{
                        if( editNode.opt.ip != undefined ) editNode.opt.ip = ""
                    })
                }
               
            }
        }
        
    }
    this.setState({
        editNode
    })
}

export default function render(){
    let {
        nn ,	//是	节点名称
        type ,	//是	节点类型
        stgy ,	//是	策略id
        nid ,     //	否	若有nid则更新节点，若无则新建
        des ,   //否	节点描述
        gid ,	   //否	节点组ID
        pos ,   //否	节点位置信息，JSON
        tgid ,   //否	标签,最多三个,逗号隔开
        logo ,   //否	logo
        opt = {},
        tags,
        auto
    } = this.state.editNode;
    const {tagList,groupList,clusterList} = this.props
    const {
        editNodeAble, 
        updateNodeAble,
        clusterHostList
    } = this.state;
    let nodeNameCls =  classNames({
		'form-group': true,
		'has-error': !this.state.nodeNameValid
	});
    let nodeTypeCls =  classNames({
		'form-group': true,
		'has-error': !this.state.nodeTypeValid
	});
    let nodeTypeList = this.getNodeTypeList()

    return <div className="editNode">
        <form className="form-horizontal">
            <div className="wrap-container" style={{padding:'10px'}}>   

                <div className={nodeNameCls}>
                    <label  className="col-sm-3 control-label">节点名称：</label>
                    <div className="col-sm-7">
                        <input type="text" className='form-control' disabled={auto ? true : !editNodeAble} placeholder="节点名称" value={nn} onChange={setEditNodeInfo.bind(this,'nn')}/>
                    </div>
                    <label className="col-sm-2 control-label prompt-label">*</label>
                </div>
                 
                <div className={nodeTypeCls}>
                    <label  className="col-sm-3 control-label">节点类型：</label>
                    <div className="col-sm-7">
                        <select className='form-control'  disabled={updateNodeAble ? true : false} value={type}  onChange={setEditNodeInfo.bind(this,'type')}>
                            <option value="" >--请选择--</option>
                            {
                                nodeTypeList.map((item,index)=>{
                                    return <option key={index} value={item['key']}>{item['value']}</option>
                                })
                            }
                        </select>
                    </div>
                    <label className="col-sm-2 control-label prompt-label">*</label>

                </div>

                <div className="form-group">
                    <label  className="col-sm-3 control-label">节点组：</label>
                    <div className="col-sm-7">
                        <select className='form-control' disabled={!editNodeAble} value={gid}  onChange={setEditNodeInfo.bind(this,'gid')}>
                            <option value="" >--请选择--</option>
                            {
                                groupList.map((group,index)=>{
                                    return <option key={index} value={group['gid']} >{group['gn']}</option>
                                })
                            }
                             
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label  className="col-sm-3 control-label" style={{paddingLeft:"0"}}>依赖故障传导类型：</label>
                    <div className="col-sm-7">
                        <select className='form-control' disabled={!editNodeAble} value={stgy}  onChange={setEditNodeInfo.bind(this,'stgy')}>
                            <option value="0">任意传导</option>
                            <option value="1">全部传导</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label  className="col-sm-3 control-label">节点描述：</label>
                    <div className="col-sm-7">
                        <textarea  className='form-control'  disabled={!editNodeAble} placeholder="节点描述" value={des} onChange={setEditNodeInfo.bind(this,'des')}>

                        </textarea>
                    </div>
                </div>

                <div className="form-group">
                    <label  className="col-sm-3 control-label">节点标签信息：</label>
                    <div className="col-sm-7">
                        {tagList&&tagList.length>0?<Select showSearch
                            style={{ width: "100%" }}
                            defaultValue={tags}
                            multiple
                            optionFilterProp="children"
                            notFoundContent="无法找到" 
                            disabled={!editNodeAble}
                            onChange={setEditNodeInfo.bind(this,'tags') }
                        >
                            {tagList.map((tag, i) =>
                                <Option key={i} value={tag['tagId']}>{tag['tagName']}</Option>
                            ) }
                                  				
                        </Select>:<select className='form-control'></select>}

                    </div>
                </div>
                {nodeForm.call(this,type,{
                    readOnly:!editNodeAble,
                    changeHandle: changeNodeFormHandle.bind(this),
                    values:opt
                })}
            </div>
            
        </form>
    </div>
}