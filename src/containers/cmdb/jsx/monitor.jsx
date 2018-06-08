import React from 'react'


export default function render() {
    let {
        url,
        error
    } = this.state.monitor
    return <div className="wrap-container" style={{ height: "550px", paddingTop: "10px" }}>
        {
            url == "" ? <div className="none_alarmInfo" style={{ margin: "20px 10px" }}>
                {error}
            </div> :
                <iframe id="iframe_grafana" name="mainIframe" style={{ width: "100%", height: "100%" }} frameBorder={0}
                    src={url}></iframe>
        }
    </div>
}