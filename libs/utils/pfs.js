/**
 * 封装fs和fs-extra的方法为promise版
 */
'use strict';

import fs from 'fs';
import fsExtra from 'fs-extra';

function nfcall(fn, ...args) {
    return new Promise((c, e) => fn(...args, (err, result) => err ? e(err) : c(result)));
}

var fsMethodsArr = [
    'access',
    'appendFile',
    'chmod',
    'chown',
    'close',
    'fchmod',
    'fchown',
    'fdatasync',
    'fstat',
    'fsync',
    'ftruncate',
    'futimes',
    'lchmod',
    'lchown',
    'link',
    'lstat',
    'mkdir',
    'mkdtemp',
    'open',
    'read',
    'readdir',
    'readFile',
    'readlink',
    'realpath',
    'rename',
    'rmdir',
    'stat',
    'symlink',
    'truncate',
    'unlink',
    'utimes',
    'write',
    'writeFile',
];

var fsExtraMethodsArr = [
    "copy",
    "emptyDir",
    "ensureFile",
    "ensureDir",
    "ensureLink",
    "ensureSymlink",
    "mkdirs",
    "move",
    "outputFile",
    "outputJson",
    "readJson",
    "remove",
    "writeJson",
];

var pfs = {};
fsMethodsArr.forEach(methodName => {
    pfs[methodName] = nfcall.bind(null, fs[methodName]);
});

fsExtraMethodsArr.forEach(methodName => {
    pfs[methodName] = nfcall.bind(null, fsExtra[methodName]);
});

export default pfs;