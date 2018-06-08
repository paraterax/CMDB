/**
 * 全局缓存,主要用于本地服务，不方便从store中获取数据。
 * 界面中不推荐使用，界面中推荐使用store存储数据
 */
var cache = {};

module.exports = {
    get: function(key) {
        return cache[key];
    },

    set: function(key, value) {
        cache[key] = value;
    },

    clear: function() {
        cache = {};
    }
};