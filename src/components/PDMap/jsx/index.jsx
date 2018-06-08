import React from 'react'
import classNames from 'classnames'
import renderToolBar from '../../flowMap/toolbar'
import RightMenu from '../../flowMap/rightMenu'

import '../../flowMap/style/flowMap.less'
import { isEmptyObject } from 'app/components/verify'
import { Icon } from 'antd'
import { IMG_BASEPATH } from 'app/constants/api'
export default function render() {
    const {
        mapWidth
        , mapHeight
        , nodeMenuHandle
        , toolItemTipX
        , toolItemTipY
        , toolItemTipShow
        , toolItemTipText
        , config
        , activeBtn
        , dataStr
        , dataStrValid
        , unUsedList
        , searchResult //没有位置的节点
        , notificationCount
    } = this.state;
    return (
        <div ref="flowMap" className="flowMap" onClick={this.onFlowMapClickHandle.bind(this)}>
            {renderToolBar.call(this)}
            {
                this.props.permission.looked ? "" :
                    <div className="nodeList" id="nodeList" onMouseDown={this.nodeListDown.bind(this)} onMouseLeave={this.nodeListLeave.bind(this)} onMouseUp={this.nodeListUp.bind(this)}>
                        <div className="nodeList_search">
                            <input type="text" onChange={this.searchUnUseList.bind(this)} placeholder="节点名称" />
                            <i className="ico icon-search"></i>
                        </div>
                        <ul style={{ height: mapHeight - 100 + "px" }}>
                            {
                                isEmptyObject(this.searchResult) ? "" : Object.keys(this.searchResult).map((key) => {
                                    return <li key={key} id={key} className="left_tree">
                                        <div className="node_img">
                                            {nodeTpls[this.searchResult[key].type] != undefined ?<img src={this.searchResult[key].type =="virtual" ? IMG_BASEPATH + this.searchResult[key].opt.thumbnail :  nodeTpls[this.searchResult[key].type].icon} width="40" height="auto"/> : "" }
                                        </div>
                                        <div className="node_label" style={{ lineHeight: "18px", marginTop: "5px",wordBreak: "break-all" }}>{this.searchResult[key].nn}</div>
                                    </li>
                                })
                            }
                        </ul>
                        {
                            isEmptyObject(searchResult) || typeof searchResult == 'string' ? "" :
                                <div className="move-all" onClick={this.moveAllNode.bind(this)} title="全部移动到画布">
                                    <i className="fa fa-caret-right"></i>
                                </div>
                        }
                    </div>
            }

            {
                this.props.permission.looked ?
                    <div ref="paper" className={classNames({ "paper": true, "active": activeBtn !== 'json' })} style={{ width: isEmptyObject(this.unUsedList) ? mapWidth + 100 + 52 : mapWidth, height: mapHeight, marginLeft: this.props.permission.looked ? "0px" : "100px" }}>

                    </div>
                    :
                    <div ref="paper" className={classNames({ "paper": true, "active": activeBtn !== 'json' })} style={{ width: isEmptyObject(this.unUsedList) ? mapWidth + 100 + 52 : mapWidth, height: mapHeight, marginLeft: this.props.permission.looked ? "0px" : "100px" }} onContextMenu={this.rightMenuHandle.bind(this)} >

                    </div>
            }
            <textarea value={dataStr} onChange={this.dataStrChangeHandle.bind(this)} className={classNames({ "json": true, "active": activeBtn == 'json', error: dataStrValid == false })} style={{ width: mapWidth, height: mapHeight }}>
            </textarea>
            {
                this.props.permission.looked ? "" :
                    <div className="pager_right"></div>
            }
            <RightMenu ref="rightMenu" menuHandle={this.rightMenuClickHandle.bind(this)} menuTypes={config.MENU_TYPES} groupTypes={config.GROUP_TYPES} nodeTypes={config.NODE_TYPES} ></RightMenu>
        </div>
    )
}