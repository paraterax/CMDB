import React from 'react'
import classNames from 'classnames'
import detailNode from '../detailNode'
import strategy from '../strategy'
import warnRule from '../warnRule'
import monitor from '../monitor'
export default function render(){
    let { activeTab } =this.state
    return <div className="status">
            <div className="tabs">
                <div className="lineLink"></div>
                <div className={classNames({"tab": true, "active":activeTab==0, "borderLeft":activeTab != 0, "borderRightNone": activeTab == 1})} onClick={this.setActiveTab.bind(this, 0)} >详情</div>
                <div className={classNames({"tab": true, "active":activeTab==1, "borderLeftNone":activeTab == 0, "borderRightNone": activeTab == 2})} onClick={this.setActiveTab.bind(this, 1)}>故障信息</div>
                <div className={classNames({"tab": true, "active":activeTab==2,"borderLeftNone":activeTab == 1,"borderRightNone": activeTab == 3})} onClick={this.setActiveTab.bind(this, 2)}>规则</div>
                <div className={classNames({"tab": true, "active":activeTab==3, "borderLeftNone":activeTab == 2})} onClick={this.setActiveTab.bind(this, 3)}>监控</div>  
                <div className="lineLink"></div>
            </div>   
            {activeTab==0 && detailNode.call(this)}
            {activeTab==1 && strategy.call(this)}
            {activeTab==2 && warnRule.call(this)}
            {activeTab==3 && monitor.call(this)}
        </div>
}