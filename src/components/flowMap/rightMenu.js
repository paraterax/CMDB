import React from 'react'
import tplRender from './jsx/rightMenu.js'

export default class RightMenu extends React.Component{
	
	constructor(props){
		super(props)
		
		this.state={
			show:false
		   ,left:0
		   ,top:0
		   ,indexItem:0
		   ,target:null  //右键作用目标的_type值
		}
	}
	
	render(){
		return tplRender.bind(this)()
	}
	
	rightMenuHandle(e){
    	e.preventDefault()
    }
	
	menuItemActiveHandle(indexItem){
		this.setState({
			indexItem
		})
	}

	showMenu(opts,callback){
		this.setState(Object.assign({
			show:true
		   ,indexItem:0
		},opts),()=>{
			callback&&callback()
		})
	}
	
	hideMenu(callback){
		this.setState({
			show:false
		   ,indexItem:0
		},()=>{
			callback&&callback()
		})
	}
}
