import React, { Component, PropTypes  } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as cookie from 'cookie'
import * as LoginActions from 'app/actions/login'
import tpl4Admin from './admin.jsx'
import tpl4Normal from './normal_role.jsx'

class Header extends Component {
    constructor(props) {
        super(props)

        this.state = {
            menuCollapseIn: false,
            menuSysOpen: false,
            menuProfileOpen: false
        }

        this.handleBodyClick = this.handleBodyClick.bind(this)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleBodyClick)
    }

    render() {
        const { loginUser, actions } = this.props
        return tpl4Admin.call(this)
    }

    menuSysClickHandle(e) {
        this.setState({
            menuSysOpen: !this.state.menuSysOpen,
            menuProfileOpen: false
        })
        document.removeEventListener('click', this.handleBodyClick)
        document.addEventListener('click', this.handleBodyClick)
    }

    menuProfileClickHandle(e) {
        this.setState({
            menuProfileOpen: !this.state.menuProfileOpen,
            menuSysOpen: false
        })
        document.removeEventListener('click', this.handleBodyClick)
        document.addEventListener('click', this.handleBodyClick)
    }

    handleBodyClick() {
        const { menuSysOpen, menuProfileOpen } = this.state
        if (menuSysOpen || menuProfileOpen) {
            this.setState({
                menuSysOpen: false,
                menuProfileOpen: false
            })
        }
    }

    handleLogoutClick() {
        const { router } = this.context
        const { actions } = this.props
        actions.logout()
        .then(()=>{
            localStorage.removeItem("PARA_ATOKEN")
            localStorage.removeItem("loginUser")
            router.push('/login')
        })
    }
}

Header.contextTypes = {
    router: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    return {
        loginUser: state.loginUser
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(LoginActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)

/**
 * 老portal注销登录
 */
function logoutFromOld() {
    let PARAMON_BASEPATH = 'https://oits.paratera.com/PARAMON_WEB'
    if (process.env.NODE_ENV !== 'production') {
        PARAMON_BASEPATH = '/mock_data/PARAMON_WEB'
    }
    return fetch(PARAMON_BASEPATH+'/exit-USER', {
        method: 'post',
        credentials: 'include'
    })
}