/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*********
 * 账单
 * 
  , user_name  : String 评论的用户
  , goods_id   : ObjectId 对应的商品id
  , content    : String 评论内容
  , created_at : Date
  , updated_at : Date
*/

var db = require('./baseModel').db,
    collectionName = 'comments';

var Comment = db.collection(collectionName);
    
db.bind(collectionName, {
    /************
     * 获取评论列表
     * @param goods_id {String}
     */
    getComments: function(goods_id, fn){
        this.find({goods_id: this.id(goods_id)}).sort('created_at', 1).toArray(function(err, comments){
            fn && fn(err, comments);
        });
    }
    /*****
     * 这个可以提到基类中去的. =。=！懒啊
     */
  , getByPage: function(page, pagesize, fn){
        var pagesize = Number(pagesize),
            page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 5) ? 5 : pagesize;
        this.find().skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, comments){
            fn && fn(err, comments);
        });
    }
});

module.exports = Comment;
