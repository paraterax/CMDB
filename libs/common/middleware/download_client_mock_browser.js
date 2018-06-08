/**
 * client版模拟浏览器下载行为的下载中间件。依赖download_client中间件
 * 会弹出一个另存为选择框，让用户选择保存的文件路径。
 */
'use strict'

import { DOWNLOAD as CONST_DOWNLOAD } from 'libs/common/constants/api_http'
import { DOWNLOAD as CONST_DOWNLOAD_LOCAL } from 'libs/common/constants/api_local';
import pfs from 'libs/utils/pfs';
import { spawn } from 'child_process';

export default store => next => action => {
    if (action.type !== CONST_DOWNLOAD && action.type !== CONST_DOWNLOAD_LOCAL) {
        return next(action);
    }

    let { url, fileName } = action

    if (typeof url !== 'string') {
        throw new Error('Specify a string url.')
    }

    var fileInput = document.getElementById('file_input_for_download');
    if (fileInput) {
        document.body.removeChild(fileInput)
    }

    fileInput = document.createElement('input')
    fileInput.id = 'file_input_for_download';
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('nwsaveas', fileName);
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    return new Promise((resolve, reject) => {
        fileInput.oncancel = function() {
            reject();
        };
        fileInput.onchange = function(e) {
            action.dest = e.target.value;
            next(action).then(resolve).catch(reject);
        };
        fileInput.click();
    });
}