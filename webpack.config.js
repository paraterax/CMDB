var fsExtra = require('fs-extra')
var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin');

var projectRootPath = __dirname;

try {
    fsExtra.removeSync('dist');
    console.log('* clean dist')
	fsExtra.copySync('src/images', 'dist/images');
    console.log('* copy success "images/');
    fsExtra.copySync('src/components/config.js', 'dist/config.js');
    console.log('* copy src/components/config', 'config')
    fsExtra.copySync('src/components/nodeForm.js', 'dist/nodeForm.js');
    console.log('* copy src/components/nodeForm', 'nodeForm')
    fsExtra.copySync('src/components/wsUtil.js', 'dist/wsUtil.js');
    console.log('* copy src/components/wsUtil', 'wsUtil')
} catch (error) {
	console.warn('*--  copy files fail, any path error ?')
}

module.exports = {
    entry: {
        app: './src/index',
        vendor: ['babel-polyfill', 'react', 'react-dom', 'redux',
            'react-redux', 'react-router', 'react-router-redux','isomorphic-fetch']
    },
    resolve: {
        alias: {
            app: path.join(projectRootPath, 'src'),
            libs: path.join(projectRootPath, 'libs'),
            'i18n': path.join(projectRootPath, 'i18n')
        }
    },
    output: {
        path: path.join(projectRootPath, 'dist/static'),
        filename: 'bundle.js',
        publicPath: './static/',
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: '../index.html',
            template: path.resolve(projectRootPath, './src/index.html'),
            inject: false
        }),
        // ignore dev config
        new webpack.IgnorePlugin(/\.\/dev/, /\/config$/),

        // set global vars
        new webpack.DefinePlugin({
            'process.env': {
                // Useful to reduce the size of client-side libraries, e.g. react
                NODE_ENV: JSON.stringify('production')
            }
        }),

        // optimizations
        new webpack.HotModuleReplacementPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap:false,
            compress: {
                warnings: false
            }
        })
    ],
    module: {
        loaders: [
            { test: /\.css/, loader: 'style!css' },
            { test: /\.less$/, loader: 'style!css!less' },
            { test: /\.(js|jsx)$/, loaders: [ 'babel' ], exclude: /node_modules/, include: projectRootPath },
            { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' },
            { test: /\.(png|jpg|gif)$/, loader: 'url?limit=10000' }
        ]
    },
    babel: {
        "presets": ["es2015", "react"],
        "plugins": [["import", [{ "libraryName": "antd"}]]]
    }
}