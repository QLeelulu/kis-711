/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

Date.prototype.format = function(format)
{
	var o = {
		"M+" : this.getMonth()+1, //month
		"d+" : this.getDate(),    //day
		"h+" : this.getHours(),   //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth()+3)/3), //quarter
		"S" : this.getMilliseconds() //millisecond
	};
	if(/(y+)/.test(format)) {
		format=format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	}

	for(var k in o) {
		if(new RegExp("("+ k +")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
		}
	}
	return format;
};

/**
 * 格式化字符串 from tbra
 * eg:
 * 	formatText('{0}天有{1}个小时', [1, 24]) 
 *  or
 *  formatText('{{day}}天有{{hour}}个小时', {day:1, hour:24}}
 * @param {Object} msg
 * @param {Object} values
 */
function formatText(msg, values, filter) {
    var pattern = /\{\{([\w\s\.\(\)"',-\[\]]+)?\}\}/g;
    return msg.replace(pattern, function(match, key) {
    	var value = values[key] || eval('(values.' +key+')');
        return (typeof o == "function") ? filter(value, key) : value;
    });	
};

// 让所有字符串拥有模板格式化
String.prototype.format = function(data) {
	return formatText(this, data);
};

/************
 * 并行执行，并确认最终回调
 * var combo = new Combo(function(){
 *      console.log('finished');
 * });
 * combo.add();
 * db.find(function(){
 *      combo.finishOne();
 * });
 */
function Combo(callback) {
  this.callback = callback;
  this.items = 0;
}

Combo.prototype = {
  add: function () {
    this.items++;
  },
  finishOne: function () {
    this.items--;
    this.check();
  },
  check: function(){
      if (this.items == 0) {
        this.callback.apply(this);
      }
  }
};
global.Combo = Combo;