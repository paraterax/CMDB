/**
 * config接口的服务
 */
"use strict";

import { CONFIG_INIT, CONFIG_LOAD, CONFIG_SAVE, CONFIG_RESET } from '../constants/config';
import cache from '../../utils/cache';

var defaultConfig;
export default store => next => action => {
    if ([CONFIG_INIT, CONFIG_LOAD, CONFIG_SAVE, CONFIG_RESET].indexOf(action.type) == -1) {
        return next(action);
    }

    let { data } = action;

    if (!Array.isArray(data)) {
        throw new Error('Expected data to be array');
    }

    var username = data[0];
    var config = data[1];
    var key = username + '/config';

    return new Promise((resolve, reject) => {
        switch(action.type) {
            case CONFIG_INIT:
                defaultConfig = cache.get('defaultConfig');
                if (!defaultConfig) {
                    defaultConfig = Object.assign({}, config);
                    cache.set('defaultConfig', defaultConfig);
                }
                if (localStorage.getItem(key) === null) {
                    localStorage.setItem(key, JSON.stringify(config));
                    cache.set('config', Object.assign({}, config));
                } else {
                    try {
                        config = JSON.parse(localStorage.getItem(key))
                    } catch (err) { }

                    config = Object.assign({}, defaultConfig, config);
                    cache.set('config', config);
                }
                break;

            case CONFIG_SAVE:
                localStorage.setItem(key, JSON.stringify(config));

                config = Object.assign({}, defaultConfig, config);
                cache.set('config', config);
                break;

            case CONFIG_LOAD:
                try {
                    config = JSON.parse(localStorage.getItem(key))
                } catch (err) { }

                config = Object.assign({}, defaultConfig, config);
                cache.set('config', config);
                break;

            case CONFIG_RESET:
                localStorage.removeItem(key);

                config = Object.assign({}, defaultConfig);
                cache.set('config', config);
                break;
        }

        next({
            type: action.type,
            response: cache.get('config')
        });

        resolve(cache.get('config'));
    });
}