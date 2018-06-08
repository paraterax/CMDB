String.prototype.bool = function() { 
    return (/^true$/i).test(this); 
}; 
//判断数组中是否包含某元素
Array.prototype.contains = function (element) { 
	for (var i = 0; i < this.length; i++) { 
		if (this[i] == element) { //如果数组中某个元素和你想要测试的元素对象element相等，则证明数组中包含这个元素，返回true 
			return true; 
		} 
	} 
	return false;
}
//数组去出重复数据
Array.prototype.unique = function() {
	var n = {}, r = []; 
	for ( var i = 0; i < this.length; i++) 
	{
		if (!n[this[i]]) 
		{
			n[this[i]] = true; 
			r[r.length] = this[i];
		}
	}
	return r;
};
//数组删除指定元素
Array.prototype.remove = function(con) {
	for ( var i = 0; i < this.length; i++) 
	{
		if (this[i] == con ) 
		{
			this.splice(i,1);
		}
	}
	return this;
};
//字符串删除空格
function trim(s){
	s = s + "";
	return s.replace(/(^\s*)|(\s*$)/g, "");  
}
export function isMobilePhone(s) {
	return /^(13[0-9]|15[0-9]|18[0-9]|14[0-9])\d{8}$/.test(trim(s));
}

/**
 * 检测是否为固定电话号码格式
 * 
 * @param {String}
 *            s 要检测的字符串
 * @return {boolean} true-是电话号码，false-不是电话号码
 */
export function isPhone(s) {
	return /(^[0-9]{3,4}\-[0-9]{3,8}$)|(^[0-9]{3,8}$)|(^\([0-9]{3,4}\)[0-9]{3,8}$)|(^0{0,1}13[0-9]{9}$)/
			.test(trim(s));
}
export function isIdCardNo(num) {
	num = num.toUpperCase();
	// 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X。
	if (!(/(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num))) {
		// alert('输入的身份证号长度不对，或者号码不符合规定！\n15位号码应全为数字，18位号码末位可以为数字或X。');
		return false;
	}
	// 校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
	// 下面分别分析出生日期和校验位
	var len, re;
	len = num.length;
	if (len == 15) {
		re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
		var arrSplit = num.match(re);

		// 检查生日日期是否正确
		var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3]
				+ '/' + arrSplit[4]);
		var bGoodDay;
		bGoodDay = (dtmBirth.getYear() == Number(arrSplit[2]))
				&& ((dtmBirth.getMonth() + 1) == Number(arrSplit[3]))
				&& (dtmBirth.getDate() == Number(arrSplit[4]));
		if (!bGoodDay) {
			// alert('输入的身份证号里出生日期不对！');
			return false;
		} else {
			// 将15位身份证转成18位
			// 校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
			var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10,
					5, 8, 4, 2);
			var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5',
					'4', '3', '2');
			var nTemp = 0, i;
			num = num.substr(0, 6) + '19' + num.substr(6, num.length - 6);
			for (i = 0; i < 17; i++) {
				nTemp += num.substr(i, 1) * arrInt[i];
			}
			num += arrCh[nTemp % 11];
			return true;
		}
	}
	if (len == 18) {
		re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
		var arrSplit = num.match(re);

		// 检查生日日期是否正确
		var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/"
				+ arrSplit[4]);
		var bGoodDay;
		bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2]))
				&& ((dtmBirth.getMonth() + 1) == Number(arrSplit[3]))
				&& (dtmBirth.getDate() == Number(arrSplit[4]));
		if (!bGoodDay) {
			// alert('输入的身份证号里出生日期不对！');
			return false;
		} else {
			// 检验18位身份证的校验码是否正确。
			// 校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
			var valNum;
			var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10,
					5, 8, 4, 2);
			var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5',
					'4', '3', '2');
			var nTemp = 0, i;
			for (i = 0; i < 17; i++) {
				nTemp += num.substr(i, 1) * arrInt[i];
			}
			valNum = arrCh[nTemp % 11];
			if (valNum != num.substr(17, 1)) {
				return false;
			}
			return true;
		}
	}
	return false;
}
/**
 * 检测字符串是否为数字格式, <b>整数和浮点数都认为是数字格式</b>
 * 
 * @param {String}
 *            s 要检测的字符串
 * @return {boolean} true-字符串代表的是一数字, false-字符串不代表任何数字
 */
export function isNumber(s) {
	var tmp_str = trim(s);
	return /^\-?[0-9]+(\.[0-9]+)?$/.test(tmp_str);
}

/**
 * 检测字符串是否为整型数字格式, <b>整数认为是数字格式</b>
 * 
 * @param {String}
 *            s 要检测的字符串
 * @return {boolean} true-字符串代表的是一整型, false-字符串不代表任何数字
 */

export function isInt(num){
	var reg1 = /^\d+$/;
	return reg1.test(s);
}

/**
 * 检验IP地址格式是否合法
 * 
 * @param {String}
 *            s 代表IP地址的字符串
 * @param {boolean}
 *            isBroadcast 是否认为广播地址（即.0和.255）为合法地址, 缺省为false, 即不允许广播地址
 * @param {boolean}
 *            isMask 是否认为掩码地址为合法，缺省为false
 * @return {boolean} true-是合法的IP地址, false-是非法的IP地址
 */
export function validIP(s, isBroadcast, isMask) {
	if (typeof isBroadcast == "undefined")
		isBroadcast = false;
	if (typeof isMask == "undefined")
		isMask = false;
	if (isMask)
		isBroadcast = true;
	var rule = new RegExp("^(25[0-"
			+ (isMask ? "5" : "4")
			+ "]|2[0-4][0-9]|1[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\\.(25[0-"
			+ (isBroadcast ? "5" : "4")
			+ "]|2[0-4][0-9]|1[0-9]{2}|[1-9]{1}[0-9]{1}|["
			+ (isBroadcast ? "0" : "1") + "-9])$");
	return rule.test(trim(s));
}
//判断Object是否为空
export function isEmptyObject(obj) {  
　　for (var name in obj){
　　　　return false;//返回false，不为空对象
　　}　　
　　return true;//返回true，为空对象
}

//判断object是否都是空值
export function isEmptyValue(obj){
	for(var key in obj){
		if(obj[key] != ""){
			return false
		}
	}
	return true;
}

export function getObjectLength(obj){
	var len = 0;
	for(var key in obj){
		len ++;
	}
	return len
}

//返回数据最好是根据时间排序好的，如果没有排序好的话，调用此方法
export function listSortBy(arr, field, order){
	var refer = [], 
	result=[],
	order = order=='asc'?'asc':'desc', index;
    for(var i = 0; i < arr.length; i++){
        refer[i] = arr[i][field]+'.'+i;
    }
	function sumSort(a,b){
		return a-b;
	};
    refer.sort(sumSort);
    if(order=='desc') refer.reverse();
    for(var i = 0; i< refer.length;i++){
        index = refer[i].split('.')[1];
        result[i] = arr[index];
    }
    return result;
}