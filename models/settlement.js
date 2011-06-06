/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*********
 * 结算记录
 * 
  , operator   : String 操作者
  , created_at : Date
*/

var db = require('./baseModel').db,
    userModel = require('./user'),
    collectionName = 'settlement';

var Settlement = db.collection(collectionName);
    
db.bind(collectionName, {
    /************
     * 获取付款记录列表
     */
    getSettlements: function(page, pagesize, fn){
        var pagesize = Number(pagesize),
            page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 5) ? 5 : pagesize;
        this.find().skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, payments){
            fn && fn(err, payments);
        });
    }
});

module.exports = Settlement;
