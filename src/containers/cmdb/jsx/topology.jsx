import React from 'react'
import { Icon, Modal, Button } from 'antd'
import classNames from 'classnames'
import loading from 'app/images/loading.gif'
import search from '../search'
import editGroup from '../editGroup'
import editNode from '../editNode'
import relation from '../relation'
import node from '../node'
import TraceBack from '../traceBack'
import batchModify from '../batchModify'  //批量修改公有属性
import batchAdd from '../batchAdd'
import PDMap from 'app/components/PDMap/index'
import * as PDMapData from 'app/constants/FLOW_MAP_DATA'

export default function render() {
    const {
        activeTab,
        tabWidth,
        addNodeModal,
        addGroupModal, 
        modalTitle, 
        modalVisible, 
        modalView,
        modalType,
        traceBackNodes //溯源
    } = this.state

    return (
        <div className="cmdb" style={{ padding: this.permission.looked ? "0" : "0px 10px 10px 10px" }}>
            <a href="javascript:;" id="focus_a"></a>
            {
                this.permission.looked ? "" : <div className="breadcrumb">CMDB</div>
            }
            <div className="topology" id="topology" ref="topology" style={{ height: (this.permission.looked ? "100%" : document.body.clientHeight - 50) + "px" }} onMouseMove={this.resizeTabContentHandle.bind(this)} onMouseUp={this.setFormValue.bind(this, 'resizing', false)}>
                <PDMap ref="pdMap" unUsedList={this.props.unUsedList} config={PDMapData} emit={this.receiveFromPDMap.bind(this)} permission={this.permission}></PDMap>
                {
                    traceBackNodes.length < 1 ? "" :
                        Object.keys(traceBackNodes).map((id, i) => {
                            return <TraceBack key={i} item={traceBackNodes[id]} emit={this.receiveFromTraceBack.bind(this)}></TraceBack>
                        })
                }
                {
                    modalType == "nodeDetail" ?
                        <Modal
                            className={activeTab == 3 ? "monitorModal" : ""}
                            maskClosable={false}
                            title={modalTitle}
                            visible={modalVisible}
                            onCancel={this.cancelModal.bind(this)}
                            footer={null}
                            container={this}
                            width={800}
                        >
                            {node.call(this)}
                        </Modal>
                        :
                        <Modal
                            maskClosable={false}
                            title={modalTitle}
                            visible={modalVisible}
                            onOk={this.okModal.bind(this)}
                            onCancel={this.cancelModal.bind(this)}
                            container={this}
                            width={650}
                        >
                            {
                                modalType == "editGroup" ? editGroup.call(this) : ""
                            }
                            {
                                modalType == "editNode" ? editNode.call(this) : ""
                            }

                            {
                                modalType == "highSearch" ? search.call(this) : ""
                            }
                            {
                                modalType == "relation" ? relation.call(this) : ""
                            }
                            {
                                modalType == "batchModify" ? batchModify.call(this) : ""
                            }

                            {
                                modalType == "batchAdd" ? batchAdd.call(this) : ""
                            }
                        </Modal>

                }
                <div className="loading_div" style={{ display: this.state.loadingStatus ? "block" : "none" }}>
                    <div className="loading_layer">
                    </div>
                    <div className="loading">
                        <img src={loading} width={50} height={50} />
                    </div>
                </div>
            </div>
            <div id="node_span_width"></div>
        </div>
    )
}