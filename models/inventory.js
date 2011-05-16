/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*********
 * 库存（包括进货、损耗）
 * 
  , user_name  : 操作者
  , goods_id   : ObjectId 对应的商品id
  , goods_title: String 商品名称 (记录多一个字段吧，mongodb没有联合查询)
  , type       : Number 1:进货， 0:损耗
  , price      : Number 进货价(或者是损耗时计算的单价) (由于可能每次的进货价、售价不一样，所以账单这里需要记录)
  , quantity   : Number 进货（或者损耗）的数量
  , created_at : Date
  , updated_at : Date
*/

var db = require('./baseModel').db,
    userModel = require('./user'),
    collectionName = 'inventory';

var Bill = db.collection(collectionName);
    
db.bind(collectionName, {
    /************
     * 获取库存列表
     */
    getInventories: function(page, pagesize, fn){
        var pagesize = Number(pagesize),
            page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 5) ? 5 : pagesize;
        this.find().skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, inventories){
            fn && fn(err, inventories);
        });
    }
    /******
     * 
     * @param goods_id {String}
     */
  , getGoodsInventories: function(goods_id, fn){
        this.find({goods_id: this.id(goods_id)}).sort('created_at', -1).toArray(function(err, inventories){
            fn && fn(err, inventories);
        });
  }
});

module.exports = Bill;
