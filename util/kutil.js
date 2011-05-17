/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

/********
 * 获取时间范围的Mongodb查询筛选条件
 * @param dateStart {String} date format string
 * @param dateEnd {String} date format string
 */
exports.getDateRangeCond = function(dateStart, dateEnd){
    var where = {};
    if(dateStart){
        where.created_at = {};
        where.created_at['$gte'] = new Date(dateStart);
    }
    if(dateEnd){
        where.created_at = where.created_at || {};
        var _de = new Date(dateEnd);
        //因为是凌晨零点，所以需要增加一天
        _de.setDate(_de.getDate()+1);
        where.created_at['$lte'] = _de;
    }
    return where.created_at;
};