import React from 'react'
function setEditNodeInfo(key,e){
    let {
        relationInfo
    } = this.state
    relationInfo[key] = e.target.value    
    this.setState({
        relationInfo
    })
}

export default function render(){
    let {
        e
    } = this.state.relationInfo

    return  <form className="form-horizontal">
                <div className="wrap-container" style={{padding:'10px'}}>   
                    <div className="form-group">
                        <label  className="col-sm-4 control-label">关联关系描述:</label>
                        <div className="col-sm-7">
                            <input type="text" className='form-control' placeholder="关系描述" value={e} onChange={setEditNodeInfo.bind(this,'e')}/>
                        </div>
                    </div>
                </div>
            </form>
}