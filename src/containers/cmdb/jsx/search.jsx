import React from 'react'
import { Select } from 'antd'
const Option = Select.Option
export function setNewNodeInfo(key,e){
    let searchParams = this.state.searchParams
    searchParams[key] = e.target.value
    this.setState({
        searchParams
    })
}

export default function render(){
    let {
        gid ,   //组id,多个用逗号隔开
        nid,    //节点id,多个用逗号隔开
        tgid, //标签id,多个用逗号隔开
        type, //类型,多个用逗号隔开
        st,
        nn,
        auto
    } = this.state.searchParams
    const {tagList,groupList} = this.props
    let nodeTypeList = this.getNodeTypeList()

    return <div className="search">
        <form className="form-horizontal">
            <div className="wrap-container" style={{padding:'10px'}}>      
                <div className="form-group">
                    <label  className="col-sm-3 control-label">组名:</label>
                    <div className="col-sm-7">
                        <select className='form-control' onChange={setNewNodeInfo.bind(this,'gid')}>
                            <option value="" >--全部--</option>
                            {
                                groupList.map((group,index)=>{
                                    return <option key={index} value={group['gid']} >{group['gn']}</option>
                                })
                            }
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label  className="col-sm-3 control-label">节点名称:</label>
                    <div className="col-sm-7">
                        <input type="text" className='form-control' placeholder="节点名称模糊查询"  onChange={setNewNodeInfo.bind(this,'nn')}/>
                    </div>
                </div>
                 <div className="form-group">
                    <label  className="col-sm-3 control-label">是否自动发现:</label>
                    <div className="col-sm-7">
                        <select className='form-control' onChange={setNewNodeInfo.bind(this,'auto')}>
                            <option value="" >--全部--</option>
                            <option value="true" >--是--</option>
                            <option value="false" >--否--</option>
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label  className="col-sm-3 control-label">标签:</label>
                    <div className="col-sm-7">
                           <select className='form-control' onChange={setNewNodeInfo.bind(this,'tgid')}>
                            <option value="" >--全部--</option>
                             {tagList.map((tag, i) =>
                                <option key={i} value={tag['tagId']}>{tag['tagName']}</option>
                            ) }
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label  className="col-sm-3 control-label">类型:</label>
                    <div className="col-sm-7">
                         <select className='form-control' onChange={setNewNodeInfo.bind(this,'type')}>
                            <option value="" >--全部--</option>
                            {
                                nodeTypeList.map((item,index)=>{
                                    return <option key={index} value={item['key']}>{item['value']}</option>
                                })
                            }
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label  className="col-sm-3 control-label">状态:</label>
                    <div className="col-sm-7">
                        <select className='form-control'  onChange={setNewNodeInfo.bind(this,'st')}>
                            <option value="" >--全部--</option>
                            <option key="0" value="UNCHECKED">未检查</option>
                            <option key="1" value="GREEN">正常</option>
                            <option key="2" value="YELLOW">一般故障</option>
                            <option key="3" value="RED">严重故障</option>
                        </select>
                    </div>
                </div>                
            </div>
        </form>
    </div>
}