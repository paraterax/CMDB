import React from 'react'
import { Link } from 'react-router'
import classNames from 'classnames'
import {LOGO_IMAGE} from 'app/constants/api'

export default function render() {
    const { loginUser } = this.props
    const { menuCollapseIn, menuSysOpen, menuProfileOpen } = this.state;
    const menuCollapseCls = classNames({
        'navbar-collapse': true,
        'collapse': true,
        'in': menuCollapseIn
    });
    const menuSysCls = classNames({
        'dropdown': true,
        'open': menuSysOpen
    });
    const menuProfileCls = classNames({
        'dropdown': true,
        'open': menuProfileOpen
    });

    return (
        <nav className="navbar navbar-default" id="header">
            <div className="container-fluid">
                <div className="navbar-header">
                    <button type="button" className="navbar-toggle"
                        onClick={()=> this.setState({ menuCollapseIn: !menuCollapseIn })}>
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                    <a className="navbar-brand" href="javascript:;"><img src={LOGO_IMAGE}/></a>
                </div>

                <div className={menuCollapseCls}>
                    <ul className="nav navbar-nav navbar-right">
                        <li>
                            <a href="javascript:;">
                                <span className="glyphicon glyphicon-off" onClick={this.handleLogoutClick.bind(this)}></span> 退出
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}