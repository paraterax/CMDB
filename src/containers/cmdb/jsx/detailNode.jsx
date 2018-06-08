import React from 'react'
import { Select } from 'antd'
import detailNodeForm from '../detailNodeForm'

const Option = Select.Option

export default function render() {
    let {
        nn,	//是	节点名称
        type,	//是	节点类型
        stgy,	//是	策略id
        nid,     //	否	若有nid则更新节点，若无则新建
        des,   //否	节点描述
        gid,	   //否	节点组ID
        pos,   //否	节点位置信息，JSON
        tgid,   //否	标签,最多三个,逗号隔开
        logo,   //否	logo
        opt = {},
        tags,
        normalInfo,
        esInfo
    } = this.state.editNode
    const { tagList, groupList } = this.props
    const { editNodeAble } = this.state
    let nodeTypeList = this.getNodeTypeList()
    return <div className="editNode">
        <form className="form-horizontal detailNode_form">
            <div className="wrap-container" style={{ padding: '10px' }}>
                <div className="row">
                    <div className="col-md-12 col-sm-12 rule_div" style={{ padding: "15px" }}>
                        <div className="warnRuleTitle">基本信息</div>
                        {
                            this.state.editNode.normalInfo == undefined || (this.state.editNode.normalInfo != undefined && this.state.editNode.normalInfo.loading) ?
                                <div className="none_alarmInfo" style={{ border: "none" }}>
                                    正在加载.....
                                </div> :
                                <div style={{ marginTop: "10px" }}>
                                    <div className="col-sm-6 form-group">
                                        <label className="control-label">节点名称：</label>
                                        <div className=" control-label textLeft">{normalInfo.nn}</div>
                                    </div>
                                    <div className="col-sm-6 form-group">
                                        <label className="control-label">节点类型：</label>
                                        <div className=" control-label textLeft">
                                            {
                                                nodeTypeList.map(item => {
                                                    if (item.key == normalInfo.type) {
                                                        return item.value
                                                    }
                                                })
                                            }
                                        </div>
                                    </div>
                                    <div className="col-sm-6 form-group">
                                        <label className="control-label">节点组：</label>
                                        <div className=" control-label textLeft">
                                            {
                                                normalInfo.gid
                                            }
                                        </div>
                                    </div>
                                    <div className="col-sm-6 form-group">
                                        <label className="control-label" style={{ paddingLeft: "0" }}>依赖故障传导类型：</label>
                                        <div className=" control-label textLeft">{normalInfo.stgy}</div>
                                    </div>
                                    <div className="col-sm-6 form-group">
                                        <label className="control-label">节点描述：</label>
                                        <div className=" control-label textLeft">{normalInfo.des == "" || normalInfo.des == null ? "----" : normalInfo.des}</div>
                                    </div>
                                    <div className="col-sm-6 form-group">
                                        <label className="control-label">节点标签信息：</label>
                                        <div className=" control-label textLeft">{normalInfo.tags}</div>
                                    </div>
                                    {detailNodeForm.call(this, normalInfo.type, {
                                        readOnly: !editNodeAble,
                                        values: normalInfo.opt
                                    })}
                                </div>
                        }
                    </div>
                    <div className="col-md-12 col-sm-12 rule_div" style={{ padding: "15px" }}>
                        <div className="warnRuleTitle">ES 信息</div>
                        {
                            this.state.editNode.esInfo == undefined || (this.state.editNode.esInfo != undefined && this.state.editNode.esInfo.loading) ?
                                <div className="none_alarmInfo" style={{ border: "none" }}>
                                    正在加载.....
                                </div> :
                                this.state.editNode.esInfo.loading == undefined ?
                                    <div style={{ marginTop: "10px" }}>
                                        {
                                            Object.keys(this.state.editNode.esInfo).map(key => {
                                                return <div className="form-group" key={key}>
                                                    <label className="control-label">{key}：</label>
                                                    <div className="control-label textLeft">{this.state.editNode.esInfo[key]}</div>
                                                </div>
                                            })
                                        }
                                    </div>
                                    : <div className="none_alarmInfo" style={{ border: "none" }}>
                                        {
                                            this.state.editNode.esInfo.errorInfo != undefined ?
                                                this.state.editNode.esInfo.errorInfo : "暂无ES信息"
                                        }
                                    </div>
                        }
                    </div>
                </div>
            </div>
        </form>
    </div>
}