var fs = require('fs')
var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var webpackHotMiddleware = require('webpack-hot-middleware')
var config = require('./webpack.dev.config')

var express = require('express')
var app = express()
var port = 3030

var compiler = webpack(config)
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }))
app.use(webpackHotMiddleware(compiler))

app.use("/config.js", express.static("src/components/config.js"))
app.use("/nodeForm.js", express.static("src/components/nodeForm.js"))
app.use("/wsUtil.js", express.static("src/components/wsUtil.js"))
app.use('/images', express.static('src/images'))

//兼容老版，有些配置开发basepath配置为 '/mock_data的情况'
function crossMiddleware(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', req.get('origin') || null);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE');
    res.setHeader('Access-Control-Expose-Headers', 'PARA_TOKEN,PARA_MTOKEN,x-requested-with');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Range');
}
app.use('/mock_data', function(req, res) {
    crossMiddleware(req, res);
    var url = req.url.split('?')[0];
    res.setHeader('Content-Type', 'application/json');
    fs.readFile(__dirname + '/mock_data' + url + '.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(404).end();
            return;
        };
        res.json(JSON.parse(data))
    });
})

app.use(function(req, res) {
    res.sendFile(__dirname + '/src/index.html')
})

app.listen(port, function(error) {
    if (error) {
        console.error(error)
    } else {
        console.info("==> Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
    }
})