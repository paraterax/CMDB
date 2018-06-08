import React from 'react'
import { Link } from 'react-router'
import classNames from 'classnames'
import {LOGO_IMAGE} from 'app/constants/api'

export default function render() {
    const { loginUser } = this.props
    const { menuProfileOpen } = this.state
    const menuProfileCls = classNames({
        'dropdown': true,
        'open': menuProfileOpen
    })

    return (
        <nav className="navbar navbar-default navbar-normal-role" id="header">
            <div className="container">
                <a className="navbar-brand" href="javascript:;"><img src={LOGO_IMAGE}/></a>
                <ul className="nav navbar-nav navbar-right">
                    <li className={menuProfileCls}>
                        <a href="javascript:;" className="dropdown-toggle"
                            onClick={this.menuProfileClickHandle.bind(this)}>
                            <span className="glyphicon glyphicon-user"></span> {loginUser&&(loginUser.name||loginUser.email)} <span className="caret"></span>
                        </a>
                        <ul className="dropdown-menu">
                            <li><a href="javascript:;" onClick={this.handleLogoutClick.bind(this)}>注销</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </nav>
    )
}