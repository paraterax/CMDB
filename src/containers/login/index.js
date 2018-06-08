import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { alert as _alert, confirm as _confirm, hideProgress } from 'libs/common/actions/app'
import * as LoginActions from 'app/actions/login'
import tplRender from './jsx/index.jsx'

import md5 from 'md5'

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            emailValid: true,
            pwdValid: true,
            loading: false,
            windowHeight: window.innerHeight
        }
        this.handleResize = this.handleResize.bind(this)
    }

    componentDidMount() {
        this.props.hideProgress()
        this.isLogin()
       
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize)
    }

    componentDidUpdate(prevProps, prevState) {
        this.props.hideProgress()
    }

    render() {
        return tplRender.bind(this)();
    }

    handleResize() {
        this.setState({windowHeight: window.innerHeight})
    }

    isLogin(){
        this.props.actions.isLogin()
    }

    validateEmail(email) {
        if (email == "") {
            this.props.alert('请输入用户名！');
            this.setState({ emailValid: false });
            return false;
        } else {
            this.setState({ emailValid: true });
            return true;
        }
    }

    validatePwd(pwd) {
        if (pwd == "") {
            this.props.alert('请输入密码！');
            this.setState({ pwdValid: false });
            return false;
        } else {
            this.setState({ pwdValid: true });
            return true;
        }
    }

    validateLoginForm(email, pwd) {
        return this.validateEmail(email) && this.validatePwd(pwd);
    }

    handleSubmit(e) {
        e.preventDefault();
        const { refs } = this;
        var email = refs.emailInput.value
        var pwd = refs.pwdInput.value
        if (!this.validateLoginForm(email, pwd)) {
            return;
        }
        this.setState({
            loading: true
        });
        
        const { actions } = this.props
        let that = this
        actions.login(email, pwd)
        .then(() => this.setState({ loading: false }))
        .catch(() => this.setState({ loading: false }));
    }
}

Login.contextTypes = {
    router: PropTypes.object.isRequired
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(LoginActions, dispatch),
        alert: bindActionCreators(_alert, dispatch),
        hideProgress: bindActionCreators(hideProgress, dispatch)
    }
}

export default connect(null, mapDispatchToProps)(Login)