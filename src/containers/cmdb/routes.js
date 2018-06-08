export default {
	path: 'cmdb',
	indexRoute: {
		onEnter: (nextState, replace) => {
			replace('/cmdb/topology');
		}
	},
	childRoutes: [
		{
			path: 'topology',
			getComponent(location, cb) {
				require.ensure([], (require) => {
					cb(null, require('./index').TopologyPage)
				})
			}
		}
	],
	getComponent(location, cb) {
		require.ensure([], (require) => {
			cb(null, require('./index')['default'])
		})
	}
}