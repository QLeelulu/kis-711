/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*********
 * 付款记录
 * 
  , settlement_id : ObjectId 结算id，用于标示属于某一次结算
  , payer      : String 付款者
  , payer_lower: String 付款者小写，用于排序
  , receiver   : String 收款者
  , money      : Number 付款金额
  , payment_type: String 结算方式 cash:现金结算方式， wage:工资扣 (这里的值应该用常量的 =。=)
  , has_payed  : Boolen 是否已经付款（或者已经从工资扣）
  , created_at : Date
  , updated_at : Date
*/

var db = require('./baseModel').db,
    userModel = require('./user'),
    collectionName = 'payment';

var Payment = db.collection(collectionName);
    
db.bind(collectionName, {
    /************
     * 获取付款记录列表
     */
    getPayments: function(page, pagesize, fn){
        var pagesize = Number(pagesize),
            page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 5) ? 5 : pagesize;
        this.find().skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, payments){
            fn && fn(err, payments);
        });
    }
    /******
     * 根据结算id获取付款记录列表
     * @param settlement_id {Number}
     */
  , getSettlementPayments: function(settlement_id, fn){
        this.find({settlement_id: settlement_id}).sort('user_name', -1).toArray(function(err, payments){
            fn && fn(err, payments);
        });
    }
});

module.exports = Payment;
