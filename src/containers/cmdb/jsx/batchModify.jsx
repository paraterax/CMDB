import React from 'react'
import { Select } from 'antd'
import nodeForm from '../nodeForm'

const Option = Select.Option

export function setEditNodeInfo(key,e){
    let {
        batchNodes
    } = this.state
    if(key == 'tags'){
        batchNodes[key] = e
    }else{
        batchNodes[key] = e.target.value
    }   
    this.setState({
        batchNodes
    })
}
function valid(){
    //预留数据校验    
    return true
}
export default function render(){
    let {
        stgy ,	//是	策略id
        des ,   //否	节点描述
        gid ,	   //否	节点组ID
        tags    //否	标签,最多三个,逗号隔开
    } = this.state.batchNodes
    const {tagList,typeList,groupList} = this.props
    let nodeTypeList = this.getNodeTypeList()

    return <div className="editNode">
        <form className="form-horizontal">
            <div className="wrap-container" style={{padding:'10px'}}>  
                <div className="form-group">
                    <label  className="col-sm-3 control-label">节点组:</label>
                    <div className="col-sm-7">
                        <select className='form-control' value={gid}  onChange={setEditNodeInfo.bind(this,'gid')}>
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
                    <label  className="col-sm-3 control-label" style={{paddingLeft:"0"}}>依赖故障传导类型:</label>
                    <div className="col-sm-7">
                        <select className='form-control' value={stgy}  onChange={setEditNodeInfo.bind(this,'stgy')}>
                            <option value="0">任意传导</option>
                            <option value="1">全部传导</option>
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label  className="col-sm-3 control-label">节点描述:</label>
                    <div className="col-sm-7">
                        <textarea  className='form-control'  placeholder="节点描述" value={des} onChange={setEditNodeInfo.bind(this,'des')}>
                        </textarea>
                    </div>
                </div>
                <div className="form-group">
                    <label  className="col-sm-3 control-label">节点标签信息:</label>
                    <div className="col-sm-7">
                        {tagList&&tagList.length>0?<Select showSearch
                            style={{ width: "100%" }}
                            multiple
                            optionFilterProp="children"
                            notFoundContent="无法找到" 
                            onChange={setEditNodeInfo.bind(this,'tags') }
                        >
                            {tagList.map((tag, i) =>
                                <Option key={i} value={tag['tagId']}>{tag['tagName']}</Option>
                            ) }                                  				
                        </Select>:<select className='form-control'></select>}
                    </div>
                </div>
            </div>            
        </form>
    </div>
}