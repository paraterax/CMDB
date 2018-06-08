import React from 'react'
import { Select } from 'antd'
const Option = Select.Option

export function setEditNodeInfo(key,value){
    let {
        batchAddGroup
    } = this.state
    batchAddGroup[key] = value
    
    this.setState({
        batchAddGroup
    })
}
function valid(){
    //预留数据校验
    return true
}
export default function render(){
    let {
        gid
    } = this.state.batchAddGroup
    const {groupList} = this.props

    return <div className="editNode">
        <form className="form-horizontal">
            <div className="wrap-container" style={{padding:'10px'}}> 
                <div className="form-group">
                    <label  className="col-sm-3 control-label">节点组:</label>
                    <div className="col-sm-7">
                        <Select style={{width:"100%"}} defaultValue={gid} value={gid}  
                        showSearch
                        mode="combobox" 
                        filterOption={false}
                        placeholder="请选择组"
                        onChange={setEditNodeInfo.bind(this,'gid')}>
                            {
                                groupList.map((group,index)=>{
                                    return <Option key={index} value={group['gn']} >{group['gn']}</Option>
                                })
                            }                             
                        </Select>
                    </div>
                </div>
            </div>        
        </form>
    </div>
}