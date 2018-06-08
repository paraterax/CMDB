import React from 'react'
import classNames from 'classnames'

import 'app/styles/login.less'
import logoUrl from 'app/images/logo.png'
import loginBgUrl from 'app/images/bg_login.jpg'
import ieLogo from 'app/images/ie.png'
import firefoxLogo from 'app/images/firefox.png'
export default function render() {
    const {
        emailValid,
        pwdValid,
        loading,
        btnLoginText,
        windowHeight
    } = this.state;

    let emailCls = classNames({
        'form-group': true,
        'has-error': !emailValid
    });

    let pwdCls = classNames({
        'form-group': true,
        'has-error': !pwdValid
    });

    return (
        <div className="login" style={{backgroundImage: 'url(' + loginBgUrl + ')', height: windowHeight}}>
            <div className="navbar navbar-default">
                <div className="navbar-header">
                    <a className="navbar-brand" href="#/login"><img src={logoUrl} style={{height: 30}}/></a>
                </div>
            </div>
            <div style={{clear:'both'}}></div>
            <div style={{ transform: 'scale(1)' }} className="login-form-wrap">
                <form className="container login-form" key="a" onSubmit={this.handleSubmit.bind(this)}>
                    <div className="form-group title">登 录</div>
                    <div className={emailCls}>
                        <div className="input-group">
                            <span className="input-group-addon"><span className="glyphicon glyphicon-user"></span></span>
                            <input type="text" className="form-control" placeholder="用户名"
                                id="username"
                                ref="emailInput"
                                autoFocus/>
                        </div>
                    </div>
                    <div className={pwdCls}>
                        <div className="input-group">
                            <span className="input-group-addon"><span className="glyphicon glyphicon-lock"></span></span>
                            <input type="password" className="form-control" placeholder="密码"
                                id="password"
                                ref="pwdInput"/>
                        </div>
                    </div>
                    <div className="form-group">
                        <button type="submit" id="login_btn" className="btn btn-primary btn-block"
                            disabled={loading}>{loading?<i className="anticon anticon-loading"></i>:"登录"}</button>
                    </div>
                    <div className="social-login left">
                        <p className="login_download">
                            建议使用
                            
                            <a className="firefox_a" href="http://www.firefox.com.cn/" target="_blank">
                            <img src={firefoxLogo} width="20" />FireFox浏览器</a>
                            或
                            <a className="ie_a" style={{color:"#fff",textDecoration:"none"}}><img src={ieLogo} width="20" />IE9及以上浏览器</a> 
                            IE9及以上浏览器 进行访问（关闭IE兼容模式）
                        </p>
                    </div>
                </form>    
            </div>
        </div>
    )
}