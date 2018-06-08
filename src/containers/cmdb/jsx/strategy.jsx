import React from 'react'
import moment from 'moment'

function transStdOut(str) {
    if (str != null && str.indexOf(">") > -1) {
        var arr = str.split(">");
        var stdout = "";
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].indexOf("<") > -1) {
                var s = arr[i].substring(0, arr[i].indexOf("<"))
                stdout += s
            }
        }
        return stdout
    } else {
        return str
    }
}

export default function render() {
    let {
        defaultText,
        result
    } = this.state.alarmInfo
    return <div className="status">
        {defaultText == "" ?
            <form className="form-horizontal" style={{ padding: "20px 0" }}>
                <table className="faultTable">
                    <colgroup>
                        <col className="time" />
                        <col className="node" />
                        <col className="fault" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th><p>时间</p></th>
                            <th><p>故障信息</p></th>
                            <th><p>溯源</p></th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.map((item, i) => {
                            return <tr className="faultRow" key={i}>
                                <td>
                                    <p>{moment(item.alarmTimeStamp).format("YYYY-MM-DD HH:mm:ss")}</p>
                                </td>
                                <td>
                                    <p>{item.message}</p>
                                </td>
                                <td>
                                    <p>{transStdOut.call(this, item.analyzeResult)}</p>
                                </td>
                            </tr>
                        })
                        }
                    </tbody>
                </table>
            </form>
            :
            <div className="none_alarmInfo">
                {defaultText}
            </div>
        }
    </div>
}