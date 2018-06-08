import React from 'react'
import { CMDB_BASEPATH } from 'app/constants/api'
import { Input, Icon } from 'antd'
import { IMG_BASEPATH } from 'app/constants/api'

function getClusterNameByCid(cid) {
    let clusterName = cid;
    this.props.clusterList.map((cluster, i) => {
        if (clusterName == cluster['clusterId']) {
            clusterName = cluster['clusterName'];
            return;
        }
    })
    return clusterName
}
function getHostNameByHid(hid) {
    let hostName = hid;
    this.state.clusterHostList.map((host, i) => {
        if (hostName == host["nid"]) {
            if (host["nn"] != undefined && host["nn"] != null && host["nn"] != "") {
                hostName = host['nn']
            } else {
                hostName = "";
            }
            return;
        }
    })
    return hostName
}
function renderFormInput(key, tpl, options) {
    let { readOnly, values, changeHandle } = options
    if (tpl.type == "imgUpload") {
        return <div className="col-sm-6 form-group" key={key} >
            <label className="control-label">{tpl['label']}：</label>
            <div className="">
                <div id="img_div" style={{ float: "left", display: "inline-block", marginLeft: readOnly ? "" : "20px" }}>
                    {
                        values[key] == "" ?
                            "" :
                            <img src={IMG_BASEPATH+values[key]} width='35' height='35' />
                    }
                </div>

            </div>
        </div>
    } else {
        if (key == "cid") {
            return <div className="col-sm-6 form-group" key={key} >
                <label className="control-label">{tpl['label']}：</label>
                <div className=" control-label textLeft">
                    {getClusterNameByCid.call(this, values[key])}
                </div>
            </div>
        } else if (key == "hid") {
            return <div className="col-sm-6 form-group" key={key} >
                <label className="control-label">{tpl['label']}：</label>
                <div className=" control-label textLeft">
                    {getHostNameByHid.call(this, values[key])}
                </div>
            </div>
        } else {
            return <div className="col-sm-6 form-group" key={key} >
                <label className="control-label">{tpl['label']}：</label>
                <div className=" control-label textLeft">
                    {values[key] || tpl['defaultValue'] || "----"}
                </div>
            </div>
        }
    }
}
function renderForm(tpls, options) {
    let list = [];
    for (let key in tpls) {
        let tpl = tpls[key]
        list.push(renderFormInput.call(this, key, tpl, options))
    }
    return list
}

export default function render(type, options) {
    let tpls = nodeTpls[type].params || {}
    return <div className="nodeForm">
        {renderForm.call(this, tpls, options)}
    </div>
}