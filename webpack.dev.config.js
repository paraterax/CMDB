var fs = require('fs')
var path = require('path')
var webpack = require('webpack')

module.exports = {
    devtool: 'eval',
    entry: {
        app: [
            'webpack-hot-middleware/client',
            './src/index.dev'
        ],
        vendor: ['babel-polyfill', 'react', 'react-dom', 'redux',
            'react-redux', 'react-router', 'react-router-redux']
    },
    resolve: {
        alias: {
            app: path.join(__dirname, 'src'),
            libs: path.join(__dirname, 'libs'),
            'i18n': path.join(__dirname, 'i18n')
        }
    },
    output: {
        path: path.join(__dirname, 'dist/static'),
        filename: 'bundle.js',
        publicPath: '/static/',
        sourceMapFilename: '[file].map'
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
    ],
    module: {
        loaders: [
            { test: /\.css/, loader: 'style!css' },
            { test: /\.less$/, loader: 'style!css!less' },
            { test: /\.(js|jsx)$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/, include: __dirname },
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