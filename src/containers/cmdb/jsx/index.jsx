import React from 'react'
import Header from 'app/components/header'
import 'app/styles/cmdb.less'
import Layout from 'app/components/layout';

export default function render() {
	return (
		<Layout>
			{this.props.children}
		</Layout>
	)
}