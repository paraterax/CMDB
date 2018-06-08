/**
 * 登录后的框架界面
 */
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { alert as _alert, hideProgress } from 'libs/common/actions/app'
import * as loginActions from 'app/actions/login';


import tplRender from './index.jsx';

var _singleInstance;
class Logined extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
         this.props.hideProgress()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    render() {
        return tplRender.call(this);
    }

    getPermissionRoleList(){
        return this.state.permissionRoleList
    }

    loginOut(){
        window.localStorage.clear()
        location.href="#/login"
        this.props.loginActions.loginOut()
    }

    /*更新左侧菜单*/
    onCollapseChange() {
        this.setState({
            collapse: !this.state.collapse,
            menuSliderMode: this.state.collapse ? 'inline' : 'vertical'
        });
    }

    //界面宽度小于768的时候，最小化侧栏菜单
    handleResize() {
        if (window.innerWidth < 768) {
            this.setState({
                collapse: true,
                menuSliderMode: 'vertical'
            });
        } else {
            this.setState({
                collapse: false,
                menuSliderMode: 'inline'
            });
        }
    }
}

function mapStateToProps(state) {
    return {
        loginUser: state.loginUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        loginActions:bindActionCreators(loginActions,dispatch),
        hideProgress: bindActionCreators(hideProgress, dispatch),
		alert: bindActionCreators(_alert, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Logined)