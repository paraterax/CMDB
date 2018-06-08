import React from 'react'
import App from './containers/App'
import LoginRoute from './containers/login/routes'
import CmdbRoute from './containers/cmdb/routes'


export default {
    path: '/',
    component: App,
    indexRoute: {
        onEnter: (nextState, replace) => replace('/cmdb/topology')
    },
    childRoutes: [
        LoginRoute,
        CmdbRoute
    ]
}