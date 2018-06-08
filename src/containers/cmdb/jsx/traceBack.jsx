import React from 'react';
import classNames from 'classnames';
import { DraggableCore } from 'react-draggable';
import moment from 'moment';

function handleDrag(e, ui) {
  this.props.emit("putTraceBackToFront", this.props.item.target);
  this.props.emit("moveTraceBackWindow", this.props.item.target, ui.deltaX, ui.deltaY);
}
function objectLength(obj) {
  var len = 0
  for (var key in obj) {
    len++;
  }
  return len
}
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
  const { item } = this.props
  const { show, top, left } = this.state
  let closing = false
  return (
    <DraggableCore onDrag={handleDrag.bind(this)}>
      <div style={{ left: item.left, top: item.top, zIndex: item.zIndex == undefined ? 90 : item.zIndex }} className="traceBack"
        onClick={() => { if (!closing) this.props.emit("putTraceBackToFront", this.props.item.target); }} id={"traceBack_" + this.props.item.target}>
        <div id="closeButton">
          <div className="icon" onClick={() => {
            closing = true;
            this.props.emit("closeTraceBackById", this.props.item.target);
          }} />
        </div>

        <div id="nodeInfo">
          <div className="traceBackTitle" style={{ marginTop: "20px" }}>
            <div className="traceBackTitleSpan">自身故障</div>
          </div>
          <table className="faultTable">
            <colgroup>
              <col className="time" />
              <col className="node" />
              <col className="fault" />
            </colgroup>
            <thead>
              <tr>
                <th><p>时间</p></th>
                <th><p>故障</p></th>
                <th><p>溯源</p></th>
              </tr>
            </thead>
            <tbody>
              <tr className="faultRow" >
                <td>
                  <p>{item.texts[item.target].alarmTimeStamp || "----"}</p>
                </td>
                <td>
                  <p>{item.texts[item.target].faultError || "----"}</p>
                </td>
                <td>
                  <p>{transStdOut(item.texts[item.target].analyzeResult) || "----"}</p>
                </td>
              </tr>
            </tbody>
          </table>
          {
            objectLength(item.texts) <= 1 ?
              "" :
              <div>
                <div className="traceBackTitle">
                  <div className="traceBackTitleSpan">传导故障</div>
                </div>
                <table id="faultTable" className="faultTable">
                  <colgroup>
                    <col className="time" />
                    <col className="node" />
                    <col className="fault" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th><p>时间</p></th>
                      <th><p>节点</p></th>
                      <th><p>故障原因</p></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      Object.keys(item.texts).map((key, i) => {
                        return key == item.target ?
                          "" :
                          (
                            <tr className="faultRow" key={key}
                              onClick={() => { this.props.emit("openTraceBackById", key) }}>
                              <td>
                                <p>{item.texts[key].alarmTimeStamp}</p>
                              </td>
                              <td>
                                <p>{item.texts[key].nodeName}</p>
                              </td>
                              <td style={{ color: item.texts[key].state == 1 ? "#f00" : "" }}>
                                <p>{item.texts[key].stdError}</p>
                              </td>
                            </tr>
                          )
                      })
                    }
                  </tbody>
                </table>
              </div>
          }
        </div>
      </div>
    </DraggableCore>
  )
}
