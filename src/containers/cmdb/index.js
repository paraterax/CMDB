import React, { Component } from 'react'
import topology from './topology'

import tplRender from './jsx/index.jsx'

class Cmdb extends Component {

	render() {
		return tplRender.bind(this)();
	}

}

export const TopologyPage = topology

export default Cmdb