import React from 'react'
import classNames from 'classnames'
import { Button, Popover } from 'antd'
import { SketchPicker } from 'react-color';
//设置选择类型
function setGroupType(type, index){
    let editGroup = this.state.editGroup
    editGroup.pos.type = type
    this.setState({
        editGroup
    })
}
function setEditGroupInfo(key,e){
    let editGroup = this.state.editGroup    
    if(key == "gn" && e.target.value != ""){
        this.setState({
            groupNameValid: true
        })
    }
    if(key == "type" && e.target.value != ""){
        this.setState({
            groupTypeValid: true
        })
    }
    if(key == "type"){
        editGroup.pos.type = e.target.value
    }else{
        editGroup[key] = e.target.value;
    }
    this.setState({
        editGroup
    })
}
function handleVisibleChange(visible){
    this.setState({
        colorVisible: visible
    })
}
function handleColorChange(color){
    const {editGroup} = this.state;
    editGroup.pos.color = color.hex;
    this.setState({
        editGroup: editGroup
    })
}
export default function render(){
    let {
        gn,
        pos,
        des,
        gid
    } = this.state.editGroup
    
    const {editGroupAble} = this.state
    let groupTypeList = this.getGroupTypeList()    
    let gnCls =  classNames({
		'form-group': true,
		'has-error': !this.state.groupNameValid
	});
    let groupTypeCls =  classNames({
		'form-group': true,
		'has-error': !this.state.groupTypeValid
    });
    
    return <div className="addGroup">
        <form className="form-horizontal">
            <div className="wrap-container" style={{padding:'10px'}}>   
                <div className={gnCls}>
                    <label  className="col-sm-3 control-label">组名称：</label>
                    <div className="col-sm-7">
                        <input type="text" className='form-control' placeholder="组名称" value={gn}  onChange={setEditGroupInfo.bind(this,'gn')}/>
                    </div>
                    <label className="col-sm-2 control-label prompt-label">*</label>
                </div>
                <div className={groupTypeCls}>
                    <label  className="col-sm-3 control-label">组类型：</label>
                    <div className="col-sm-7">                         
                        <Popover 
                                className = "color_popover"
                                content={<SketchPicker 
                                            color={ this.state.editGroup.pos.color}
                                            onChangeComplete={ handleColorChange.bind(this) }
                                            ></SketchPicker>}
                                trigger="click"
                                visible={this.state.colorVisible}
                                onVisibleChange={handleVisibleChange.bind(this)} 
                                placement = "rightTop"
                            >
                            <div className="group_type_span_color"> <i style={{background:this.state.editGroup.pos.color}}></i></div>
                        </Popover>
                    </div>
                </div>
                <div className="form-group">
                    <label  className="col-sm-3 control-label">组描述：</label>
                    <div className="col-sm-7">
                        <textarea  className='form-control' placeholder="组描述" value={des}  onChange={setEditGroupInfo.bind(this,'des')}>
                        </textarea>
                    </div>
                </div>
            </div>
        </form>
    </div>
}