/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*
    title      : String
  , user_name  : String 添加商品的用户
  , price      : Number 进货价
  , value      : Number 售价
  , stocks     : Number 库存
  , sales      : Number 销售量
  , des        : String 商品描述
  , image_name : String 图片名称
  , recommend  : Boolen 是否推荐
  , created_at : Date
  , updated_at : Date
  , updated_historys: [{},{}] 修改的历史记录
*/

var db = require('./baseModel').db,
    userModel = require('./user'),
    collectionName = 'goods';

var Goods = db.collection(collectionName);
    
db.bind(collectionName, {
    /************
     * 获取商品列表
     */
    getGoods: function(page, pagesize, fn){
        var pagesize = Number(pagesize),
            page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 5) ? 5 : pagesize;
        this.find().skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, goods){
            fn && fn(err, goods);
        });
    }
  , /************
     * 获取正在出售的商品列表
     */
    getSalingGoods: function(page, pagesize, fn){
        var pagesize = Number(pagesize),
            page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 5) ? 5 : pagesize;
        this.find({ 'stocks':{$gt: 0}, 'on_sale': true }).skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, goods){
            fn && fn(err, goods);
        });
    }
});

module.exports = Goods;
