import React from 'react'
import { Transfer } from 'antd';

function handleChange(targetKeys){
    let {
        nodeGroup
    } = this.state
}
export default function render(){
    let {
        ruleMockData,
        ruleTarget
    } = this.state.warnRule
    return <div className="status">
            <form className="form-horizontal">
                <div className="wrap-container" style={{padding:'10px'}}>   
                    <div className="form-group">
                        <label  className="col-sm-2 control-label">关联节点:</label>
                        <div className="col-sm-7">
                            <Transfer
                                dataSource={ruleMockData}
                                targetKeys={ruleTarget}
                                render={item => item.title}
                                onChange={handleChange.bind(this)}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
}