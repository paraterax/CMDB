import React from 'react'
import classNames from 'classnames'

function getNodeTypes(nodeTypes){
        const {menuHandle} = this.props
        let nodeTypeMenu = []
        for(let t in nodeTypes){
            let node=nodeTypes[t]
            node.type=t
            nodeTypeMenu.push(<li key={t} onClick={menuHandle.bind(this,'addNode',node)}>{node['title']}</li>)
        }
        return nodeTypeMenu
}

function getGroupTypes(groupTypes){
    const {menuHandle} = this.props
    let groupTypeMenu = []
    for(let t in groupTypes){
        let node=groupTypes[t]
        node.type=t
        groupTypeMenu.push(<li key={t} onClick={menuHandle.bind(this,'addGroup',node)}>{node['title']}</li>)
    }
    return groupTypeMenu
}

export default function render(){
    const {show, top, left, indexItem, target}=this.state
    const {nodeTypes, menuTypes, groupTypes, menuHandle}=this.props
    return (
        show?<ul ref="rightMenu" className={classNames({'rightMenu':true,'active':show})} style={{left:left,top:top}} onContextMenu={this.rightMenuHandle.bind(this)}>
            {
                menuTypes.map((item,i)=>{
                    if(item.targets && (item.targets[target]==null||item.targets[target]==false)){
                        return;
                    }
                    return <li key={i} onClick={menuHandle.bind(this,item.key)} onMouseOver={this.menuItemActiveHandle.bind(this,item.key)}>{item.title}</li>
                })
            }
        </ul>:<div ref="rightMenu"  style={{left:left,top:top}} className={classNames({'rightMenu':true,'active':show})}></div>
    )
}