import React from 'react'
import classNames from 'classnames'

function getSelectNodesLength(){
	let count = 0;
	Object.keys(this.status.selectedGroups).map((key)=>{
		let selectObj = this.status.selectedGroups[key];
		if(this.data(selectObj)['type'] == "node"){
			count ++;
		}
	})
	return count;
}
export default function render() {
	const { activeBtn, notificationCount, config } = this.state
	const toolbarTypes = config['TOOLBAR_TYPES']
	return (
		<div>
			{
				this.props.permission.looked ?
					this.props.permission.dragged
						? ""
						:
						<div className='toolbar' ref="toolbar">
							{
								toolbarTypes.map((group, i) => {
									return <ul key={i} className={group[0].alignRight ? 'btns-group btns-group-right' : 'btns-group'} style={{ marginLeft: "20px" }}>
										{
											group.map((item, j) => {
												if (item.name == 'pan' || item.name == "default") {
													return <li key={j} className={classNames({ btn: true, active: activeBtn == item.name })} onClick={this.clickToolbarBtnHandle.bind(this, item)} title={item.title}>
														<i className={"ico icon-" + item.name}></i>
													</li>
												} else if (item.name == 'search') {
													return <div key={j}>
														<input id="search-btn" className='btn' type='text' placeholder="搜索关键字" value={this.state.keyword} onChange={this.setKeyWord.bind(this)} onKeyDown={this.enterSearch.bind(this)} />
														<li className='btn' onClick={this.clickToolbarBtnHandle.bind(this, item)} title={item.title}>
															<i className="ico icon-search" ></i>
														</li>
													</div>
												}
											})
										}
									</ul>
								})
							}
						</div>
					:
					<div className='toolbar' ref="toolbar">
						{toolbarTypes.map((group, i) => {
							return <ul key={i} className={group[0].alignRight ? 'btns-group btns-group-right' : 'btns-group'}
								style={{ border: group.length > 0 && group[0].name == "batch_add" ? "none" : "" }}>
								{
									group.map((item, j) => {
										if (item.name == 'search') {
											return <div key={j}>
												<input id="search-btn" className='btn' type="text" placeholder="搜索关键字" value={this.state.keyword} onChange={this.setKeyWord.bind(this)} onKeyDown={this.enterSearch.bind(this)} />
												<li className='btn' onClick={this.clickToolbarBtnHandle.bind(this, item)} title={item.title}><i className="ico icon-search" ></i>
												</li>
											</div>
										} else if (item.name == 'high') {
											return <li key={j} className="btn btn-primary btn-high" title={item.title} onClick={this.clickToolbarBtnHandle.bind(this, item)}>高级检索</li>
										} else if (item.name == 'notifications') {
											return <li key={j} className={"btn btn-notifications"} onClick={this.clickToolbarBtnHandle.bind(this, item)} title={item.title}>
												<div className={notificationCount > 0 ? "notification-badge notification-badge-activated" : "notification-badge"}>
													<span>{notificationCount > 99 ? "99+" : notificationCount}</span>
												</div>
												<i className={"ico toolbar-" + item.name}></i>
											</li>

										} else if (item.checkBtn) {
											return <li key={j} className={classNames({ btn: true, active: activeBtn == item.name })} title={item.title} onClick={this.clickToolbarBtnHandle.bind(this, item)}>
												<i className={"ico icon-" + item.name}></i>
											</li>
										} else if (item.name.indexOf("batch") > -1) {
											return getSelectNodesLength.call(this) <= 1 ?
												"" :

												item.name == "batch_add" ?
													<li key={j} className='btn btn-batch-add' onClick={this.clickToolbarBtnHandle.bind(this, item)} title={item.title}>
														<i className="icon-add"></i>添加组
													</li> :
													item.name == "batch_modify" ?
														<li key={j} className='btn' onClick={this.clickToolbarBtnHandle.bind(this, item)} title={item.title}>
															<i className="ico icon-batch-edit"></i>
														</li> :

														item.name == "batch_remove" ?
															<li key={j} className='btn' onClick={this.clickToolbarBtnHandle.bind(this, item)} title={item.title}>
																<i className="ico icon-batch-delete"></i>
															</li> : ""
										} else if (item.name == "refresh") {
											return <li key={j} className='btn' onClick={this.clickToolbarBtnHandle.bind(this, item)} title={item.title}>
												<i className={"ico fa fa-refresh"}></i></li>
										} else {
											return <li key={j} className='btn' onClick={this.clickToolbarBtnHandle.bind(this, item)} title={item.title}>
												<i className={"ico icon-" + item.name}></i></li>
										}
									})
								}
							</ul>
						})
						}
					</div>
			}
		</div>
	)
}