/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*********
 * 账单
 * 
  , user_name  : String 下订单的用户
  , goods_id   : ObjectId 对应的商品id
  , goods_title: String 商品名称 (记录多一个字段吧，mongodb没有联合查询)
  , price      : Number 进货价 (由于可能每次的进货价、售价不一样，所以账单这里需要记录)
  , value      : Number 售价
  , quantity   : Number 购买的数量
  , created_at : Date
  , updated_at : Date
*/

var db = require('./baseModel').db,
    userModel = require('./user'),
    collectionName = 'bills';

var Bill = db.collection(collectionName);
    
db.bind(collectionName, {
    /************
     * 获取账单列表
     */
    getBills: function(page, pagesize, fn){
        var pagesize = Number(pagesize),
            page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 5) ? 5 : pagesize;
        this.find().skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, bills){
            fn && fn(err, bills);
        });
    }
  , getUserBills: function(user_name, cond, fn){
        cond = cond || {};
        cond.user_name = user_name;
        this.find(cond).sort('created_at', -1).toArray(function(err, bills){
            fn && fn(err, bills);
        });
  }
});

module.exports = Bill;
