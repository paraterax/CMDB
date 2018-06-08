import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import TopProgress from 'libs/top_progress'
import TopAlert from 'libs/top_alert'
import TopConfirm from 'libs/top_confirm'

import { confirmOK, confirmClose } from 'libs/common/actions/app'
import '../styles/index.less'

class App extends Component {

    componentDidMount() {
    }
    render() {
        const { loadingProgress, alert, confirmProps } = this.props
        return (
            <div style={{"height":"100%"}}>
                <TopAlert {...alert} />
                <TopConfirm {...confirmProps}
                    onOk={this.topConfirmOk.bind(this)}
                    onClose={this.topConfirmClose.bind(this)} />
                {(loadingProgress!=100&&loadingProgress!=0)&&<div className="loadingMask"></div>}
                {(loadingProgress!=100&&loadingProgress!=0)&&<div className="loadingCloud">
                    <span className="anticon anticon-cloud"></span>
                    <div className="content">正在加载...</div>
                </div>}
                <div style={{"height":"100%"}}>{this.props.children}</div>
            </div>
        )
    }

    topConfirmOk() {
        this.props.confirmOK()
    }

    topConfirmClose() {
        this.props.confirmClose()
    }
}

function mapStateToProps(state) {
    return {
        loadingProgress: state.loadingProgress,
        alert: state.alert,
        confirmProps: state.confirm
    }
}

function mapDispatchToProps(dispatch) {
    return {
        confirmOK: bindActionCreators(confirmOK, dispatch),
        confirmClose: bindActionCreators(confirmClose, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)