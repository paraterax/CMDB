//TODO:后续需要设计下
const language = 'zh-cn';
var moment = require('moment')
var locale = require('moment/locale/'+language)
moment.locale(language)
moment.localeData()._week.dow = 0;

export default {}