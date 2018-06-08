const os = require('os');
const URL = require('url');
const path = require('path');
const EventEmitter = require('events');
const util = require('util');
const pfs = require('../../utils/pfs');
const createWriteStream  = require('fs').createWriteStream;
const httpApiProxy = require('./http_api_proxy');

var reg = new RegExp('attachment; filename="([\S ]+)"');
function guessFilename(url, headers) {
    reg.exec(headers.get('content-disposition'));
    return RegExp.$1 || path.basename(URL.parse(url).pathname) || 'unkown';
}

/** 创建下载目录 */
function mkdir(filePath) {
    if (typeof filePath == 'string') {
        var dirpath = path.dirname(filePath);
        return pfs.ensureFile(dirpath).then(() => dirpath);
    } else {
        return pfs.mkdtemp(path.join(os.tmpdir(), 'paradownload-'));
    }
}

class Downloader extends EventEmitter {
    constructor(url, filePath) {
        super();

        var myEmitter = this;
        httpApiProxy({
            url: url,
            method: 'get',
            acceptType: 'stream'
        })
        .then(response => {
            const fileSize = response.headers.get('content-length');
            var fileName = guessFilename(url, response.headers);
            mkdir(filePath).then(dirpath => {
                const temFilePath = path.join(dirpath, `${fileName}.tmp`);
                const out = createWriteStream(temFilePath);
                var loadedSize = 0;

                if (typeof filePath != 'string') {
                    filePath = path.join(dirpath, fileName);
                }

                myEmitter.emit('response', filePath, fileSize);

                out.once('finish', () => {
                    pfs.rename(temFilePath, filePath).then(() => myEmitter.emit('done', filePath));
                });

                response.body.once('error', err => myEmitter.emit('error', err));
                response.body.pipe(out);

                response.body.on('data', chunk => {
                    loadedSize += chunk.length;
                    myEmitter.emit('progress', loadedSize, fileSize);
                });
            });
        })
        .catch(err => myEmitter.emit('error', err));
    }
}
/**
 * 下载
 * @param {string} url 下载目标文件url
 * @param {string} filePath 保存的文件路径
 * @return {Promise}
 */
module.exports = Downloader;