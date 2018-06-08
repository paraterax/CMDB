import React, { Component, PropTypes  } from 'react'
import { connect } from 'react-redux'
import tplRender from './jsx/traceBack.jsx'

class TraceBack extends Component {
	
	constructor(props){
		super(props)
		
		this.state={
			show:false
		   ,left:0
		   ,top:0
		}
	}
	componentDidMount() {
		

	}
	render(){
		return tplRender.bind(this)()
	}
}

export default connect(null, null)(TraceBack)

