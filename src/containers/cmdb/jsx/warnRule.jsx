import React from 'react'
import ReactDOM from 'react-dom';
import { Transfer } from 'antd';

function isEmptyObject(obj) {
    for (var name in obj){
        return false;//返回false，不为空对象
    }
    return true;//返回true，为空对象
}
export default function render(){
    let {
        nodeType,
        nodeAuto,
        nodeRuleList,
        unNodeRuleList
    } = this.state.warnRule
    console.log(nodeRuleList)
    console.log(unNodeRuleList)
    return <div className="status">
            <form className="form-horizontal">
                <div className="wrap-container" style={{padding:'10px'}}>  
                    <div className="row">
                        <div className="col-md-12 col-sm-12 rule_div" id="rule-div">
                            <div className="warnRuleTitle" style={{color:!isEmptyObject(nodeRuleList) ? "#3383d9" : ""}}>已绑定规则</div>
                            {
                                !isEmptyObject(nodeRuleList)? 
                                Object.keys(nodeRuleList).map((key)=>{
                                    let item = nodeRuleList[key]
                                    return <div className="rule_handle col-md-4 col-sm-6" key = {key} onClick={this.bindRule.bind(this, item, key , "bind")}>
                                                    <div className="widget unwidget" id={item.id} type="status">
                                                        <div className="status-icon">
                                                            <i className="icon-bell"></i>
                                                        </div>
                                                        <div className="status-info">
                                                            {item.name}
                                                        </div>
                                                    </div>
                                            </div>
                                }) 
                                :
                                <p>{ nodeType == "host" && !nodeAuto ? "手动创建的服务器节点无法绑定规则"  : "暂无已绑定规则"}</p>
                            }
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12 col-sm-12 rule_div" id="unrule-div">
                            <div className="warnRuleTitle">未绑定规则</div>
                            {
                                !isEmptyObject(unNodeRuleList)? 
                                Object.keys(unNodeRuleList).map((key)=>{
                                let item = unNodeRuleList[key]
                                    return <div className="rule_handle col-md-4 col-sm-6" key = {key} onClick={this.bindRule.bind(this, item, key , "unbind")}>
                                                <div className="widget" id={item.id} type="unstatus">
                                                    <div className="status-icon unstatus-icon">
                                                        <i className="icon-bell"></i>
                                                    </div>
                                                    <div className="status-info">
                                                        {item.name}
                                                    </div>
                                                </div>
                                        </div>
                                }) 
                                :<p>{ nodeType == "host" && !nodeAuto ? "手动创建的服务器节点无法绑定规则"  : "暂无规则"}</p>
                            }
                        </div>
                    </div>                    
                </div>
            </form>
        </div>
}