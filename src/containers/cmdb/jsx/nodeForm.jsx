import React from 'react'
import {CMDB_BASEPATH,IMG_BASEPATH} from 'app/constants/api'
import { Input, Icon, Select } from 'antd'
import classNames from 'classnames'
const Option = Select.Option;

function nodeIcon(key,options,e){
    let files = e.target.files;
    let reader = new FileReader();
    reader.onload= function () {
        document.getElementById("img_div").innerHTML = "<img src='"+reader.result+"' width='35' height='35'/>";
    }
    if(files.length > 0) {
        reader.readAsDataURL(files[0]);
    }else{
        document.getElementById("img_div").innerHTML = "";
    }
    let { changeHandle } = options
    changeHandle&&changeHandle.call(this,key, e)
}

function iconBtnHandle(){
    document.getElementById("node_icon_file").click();
}

//密码可见不可见
function psdClickHandle(key, e){
    let dom = document.getElementById("cus_"+key);
    let className = e.target.className;
    if(dom.type == "text"){
        dom.type = "password";
        let cls = className.split(" ");
        for(var i = 0 ; i < cls.length;i++){
            if(cls[i] == "active"){
                cls.splice(i,1);
            }
        }
        e.target.className = cls.join(" ")
    }else{
        dom.type = "text";
        e.target.className += " active";
    }
}

function renderFormInput(key, tpl, options){
    let {readOnly, values, changeHandle} = options;
    let readonly=tpl['readOnly'] || readOnly;
    let auto = this.state.editNode.auto;
    let validTps = this.state.validTps;
    let cls =  classNames({
		'form-group': true,
		'has-error': (validTps[key] == undefined  || validTps[key] == true)? false : true
    });
    if(tpl.type == "imgUpload"){
        let realImgSrc = values[key].name == undefined ? <img src={IMG_BASEPATH + values[key]}/> : ""
        return <div className={cls} key={key} >
            <label  className="col-sm-3 control-label">{tpl['label']}：</label>
            <div className="col-sm-7">
                <input type="file" style={{display:"none"}} id="node_icon_file" name="" accept="image/png,image/gif,image/jpg,image/jpeg,image/jp2,image/x-icon" onChange={nodeIcon.bind(this,key, options)} />
                
                <div id="img_div" className="img_div" style={{display:"inline-block"}}>
                   
                    {
                        values[key] == "" ? <p>建议图片尺寸大小200*60</p> : realImgSrc
                    }
                </div>    
            </div>
            <label className="col-sm-2 control-label prompt-label" style={{marginLeft:"-5px"}}>
                <a href="javascript:;" className="add-img-btn" onClick={iconBtnHandle.bind(this)}>
                    <i className="fa icon-choose f-s-20 mr10"></i>
                </a>
            </label>
        </div>
    }else if(tpl.type == "text" ||tpl.type =="password"){
      
        return <div className={cls} key={key} >
            <label  className="col-sm-3 control-label">{tpl['label']}：</label>
                <div className="col-sm-7">    
                    <Input 
                        type={tpl['type']} 
                        id={tpl['type'] == "password" ? "cus_"+key : ""}
                        className='form-control'
                        placeholder={tpl['placeholder']}
                        disabled={(auto && key == 'ip') ? true : readonly}
                        suffix={tpl['type'] == "password" ? <Icon type="eye-o" onClick={psdClickHandle.bind(this, key)}/>:""}
                        value={values[key] || tpl['defaultValue'] || ""}
                        onChange={changeHandle&&changeHandle.bind(this,key)}  
                    />
                </div>
                <label className="col-sm-2 control-label prompt-label">*</label>
        </div>
    }else if(tpl.type=="select"){
        if(key == "cid"){
            return <div className={cls} key={key}>
                    <label className="col-sm-3 control-label">{tpl['label']}：</label>
                    <div className="col-sm-7">
                        <Select showSearch 
                                style={{ width: "100%" }}
                                value={values[key]}
                                optionFilterProp="children"
                                disabled={auto? true:readonly}
                                onChange={changeHandle&&changeHandle.bind(this,key)}
                            >
                            <Option value="">--请选择--</Option>
                            { 
                                this.props.clusterList.map((cluster, i) =>
                                    <Option key={i} value={cluster['clusterId']}>{cluster['clusterName']}</Option>
                                ) 
                            }
                        </Select>
                    </div>
                    <label className="col-sm-2 control-label prompt-label">*</label>
                </div>
        }else if(key == "hid"){
            
            return <div className={cls} key={key}>
                    <label className="col-sm-3 control-label">{tpl['label']}：</label>
                    <div className="col-sm-7">    
                        <Select showSearch 
                                style={{ width: "100%" }}
                                value={values[key] }
                                optionFilterProp="children"
                                disabled={readonly}
                                onChange={changeHandle&&changeHandle.bind(this,key)}
                            >
                            <Option value="">--请选择--</Option>
                            { 
                                this.state.clusterHostList.map((host, i) =>
                                    <Option key={i} value={host['nid']}>{host['nn']}</Option>
                                ) 
                            }
                        </Select>
                    </div>
                    <label className="col-sm-2 control-label prompt-label">*</label>
                </div>
        }else if(key == "ip"){
            return <div className={cls} key={key}>
                    <label className="col-sm-3 control-label">{tpl['label']}：</label>
                    <div className="col-sm-7">
                        <Select showSearch 
                                style={{ width: "100%" }}
                                value={values[key]}
                                optionFilterProp="children"
                                disabled={readonly}
                                onChange={changeHandle&&changeHandle.bind(this,key)}
                            >
                            <Option value="">--请选择--</Option>
                            { 
                                this.state.hostIpList.map((ip, i) =>
                                    <Option key={i} value={ip}>{ip}</Option>
                                ) 
                            }
                        </Select>
                    </div>
                    <label className="col-sm-2 control-label prompt-label">*</label>
                </div>
        }
    }
}

function renderForm(tpls, options){
    let list = [];
    for(let key in tpls){
        let tpl = tpls[key]
        list.push(renderFormInput.call(this, key, tpl, options))
    }
    return list
}

export default function render(type, options){
    let tpls = nodeTpls[type] != undefined ? nodeTpls[type].params|| {} :{}
    return <div className="nodeForm">
        {renderForm.call(this, tpls, options)}
    </div>
}