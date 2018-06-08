import React from 'react'
import classNames from 'classnames'
import renderToolBar from '../toolbar'
import RightMenu from '../rightMenu'
import 'app/styles/icomoon/style.css'
import '../style/flowMap.less'

export default function render( ){
    const {
         mapWidth
        ,mapHeight
        ,nodeMenuHandle
        ,toolItemTipX
        ,toolItemTipY
        ,toolItemTipShow
        ,toolItemTipText
        ,config
        ,activeBtn
        ,dataStr
        ,dataStrValid
        ,notificationCount
    } = this.state
    
    return (
        <div ref="flowMap" className="flowMap" onClick={this.onFlowMapClickHandle.bind(this)}>
            {config['TOOLBAR_TYPES']&&renderToolBar.call(this)}
            <div ref="paper" className={classNames({"paper":true,"active": activeBtn !== 'json'})} style={{width:mapWidth,height:mapHeight}} onContextMenu={this.rightMenuHandle.bind(this)} >
            </div>
            <textarea value={dataStr} onChange={this.dataStrChangeHandle.bind(this)}  className={classNames({"json": true, "active": activeBtn == 'json', error: dataStrValid == false})} 
                style={{width:mapWidth,height:mapHeight}}>
            </textarea>
            <RightMenu ref="rightMenu" menuHandle={this.rightMenuClickHandle.bind(this)} menuTypes={config.MENU_TYPES} groupTypes={config.GROUP_TYPES} nodeTypes={config.NODE_TYPES} ></RightMenu>
        </div>
    )
}