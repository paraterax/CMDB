import * as ActionTypes from '../constants/config'

/**
 * 初始化用户配置
 * @param {object} config 配置对象
 */
export const init = (username, config) => ({
    type: ActionTypes.CONFIG_INIT,
    data: [username, config]
});

/**
 * 加载用户配置
 * @param {object} config 配置对象
 */
export const load = username => ({
    type: ActionTypes.CONFIG_LOAD,
    data: [username]
});

/**
 * 保存用户配置
 * @param {object} config 配置对象
 */
export const save = (username, config) => ({
    type: ActionTypes.CONFIG_SAVE,
    data: [username, config]
});

/**
 * 重置为默认配置
 */
export const reset = username => ({
    type: ActionTypes.CONFIG_RESET,
    data: [username]
});