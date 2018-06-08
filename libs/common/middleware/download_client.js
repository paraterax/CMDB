/**
 * client版通用下载中间件。
 * 无界面，如果不传目标路径dest，则会保存在系统临时目录下以"paradownload-"为前缀的目录中
 */
'use strict'

import throttle from 'lodash/throttle';
import { DOWNLOAD as CONST_DOWNLOAD } from 'libs/common/constants/api_http'
import {
    DOWNLOAD as CONST_DOWNLOAD_LOCAL,
    DOWNLOAD_WAIT,
    DOWNLOAD_START,
    DOWNLOAD_PROGRESS,
    DOWNLOAD_PAUSE,
    DOWNLOAD_FAIL,
    DOWNLOAD_SUCCESS } from 'libs/common/constants/api_local';
import Downloader from 'libs/common/client_api_service/download';
import pfs from 'libs/utils/pfs';

var taskId = 0;
export default store => next => action => {
    if (action.type !== CONST_DOWNLOAD && action.type !== CONST_DOWNLOAD_LOCAL) {
        return next(action)
    }

    let { url, dest } = action

    if (typeof url !== 'string') {
        throw new Error('Specify a string url.')
    }

    return new Promise((resolve, reject) => {
        var downloader = new Downloader(url, dest);
        downloader.id = ++taskId;

        //使用throttle方法避免更新进度事件触发的太频繁，导致程序卡
        var onProgress = throttle(function(event) {
            next({type: DOWNLOAD_PROGRESS, id: downloader.id, percent: event.percent, loaded: event.loaded});
        }, 1000);
        next({type: DOWNLOAD_WAIT, id: downloader.id, path: url});

        downloader.on('response', (filePath, fileSize) => {
            next({type: DOWNLOAD_START, id: downloader.id, path: url, dest: filePath, size: fileSize, loaded: 0});
        });
        downloader.on('progress', (loadedSize, fileSize) => {
            onProgress({
                percent: loadedSize/fileSize,
                loaded: loadedSize
            });
        });
        downloader.on('done', filePath => {
            onProgress.cancel();
            next({type: DOWNLOAD_SUCCESS, id: downloader.id, path: url, dest: filePath});
            resolve(filePath);
        });
        downloader.on('error', error => {
            onProgress.cancel();
            next({type: DOWNLOAD_FAIL, id: downloader.id, error, path: url});
            reject(err);
        });
    });
}