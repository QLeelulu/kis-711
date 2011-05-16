/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var goodsModel = require('../models/goods'),
    billModel = require('../models/bills'),
    commentModel = require('../models/comments'),
    userModel = require('../models/user'),
    userAuthFilter = require('../filters/auth').userAuthFilter;

exports.show = function(fnNext){
    var _t = this,
        goodsId = this.routeData.args.param;
    goodsModel.findById(goodsId, function(err, goods){
        if(!goods){
            return fnNext( this.ar.notFound() );
        }else{
            var r = {goods: goods}
            fnNext( _t.ar.view(r) );
        }
    });
};

/************
 * 购买
 */
exports.buy = function(fnNext){
    var _t = this,
        r = {success:true}, 
        valid = false,
        id = this.req.post.id,
        quantity = this.req.post.quantity;
        
    if(id && quantity){
        quantity = Number(quantity);
        if(isNaN(quantity) || quantity < 1){
            r.error = '购买数量错误';
        }else{
            valid = true;
        }
    }else{
        r.error = '参数错误';
    }
    
    if(!valid){
        return fnNext( _t.ar.json(r) );
    }
    
    goodsModel.findById(id, function(err, goods){
        if(!goods){
            r.error = '要购买的商品不存在';
            return fnNext( _t.ar.json(r) );
        }
        if(quantity > goods.stocks){
            r.error = '库存不足';
            return fnNext( _t.ar.json(r) );
        }
        var bill = {
            user_name: _t.req.user.name,
            goods_id: goods._id,
            goods_title: goods.title,
            price: goods.price,
            value: goods.value,
            quantity: quantity
        };
        bill.created_at = bill.updated_at = new Date();
        billModel.insert(bill, 
            function(err, _bill){
                if(err || !_bill || !_bill.length){
                    r.error = '更新数据库失败';
                }else{
                    r.success = true;
                    r.bill = _bill[0];
                    //更新商品信息(库存、销售量等)
                    goodsModel.updateById(id,{
                        '$inc': {'stocks': -quantity, 'sales': quantity},
                        '$addToSet': {'buyers': bill.user_name}
                    });
                    //更新用户的统计信息
                    userModel.updateById(_t.req.user._id.toString(),{
                        '$inc': {
                            'stat_total.price': bill.price*quantity, 
                            'stat_total.value': bill.value*quantity, 
                            'stat_total.bills': 1,
                            'stat_total.quantity': bill.quantity
                        }
                    });
                }
                fnNext( _t.ar.json(r) );
            }
        );
        
    });
};
exports.buy.filters = [userAuthFilter];

/*********
 * 评论列表
 */
exports.comments = function(fnNext){
    var _t = this, goods_id = _t.req.get.goods_id || _t.req.post.goods_id;
    if(goods_id){
        commentModel.getComments(goods_id, function(err,comments){
            fnNext( _t.ar.view({comments: comments}, 'comment/comment_list.html') );
        });
    }else{
        fnNext( _t.ar.raw('参数错误') );
    }
};

/*********
 * 添加评论
 */
exports.comment_post = function(fnNext){
    var _t = this,
        r = {success: false},
        goods_id = _t.req.post.goods_id,
        content = _t.req.post.content;
    if(goods_id && content && content.trim()){
        var comment = {
            user_name: _t.req.user.name,
            goods_id: commentModel.id(goods_id),
            content: content.trim()
        };
        comment.created_at = comment.updated_at = new Date();
        commentModel.insert(comment, 
            function(err, _comment){
                if(err || !_comment || !_comment.length){
                    r.error = '更新数据库失败';
                }else{
                    r.success = true;
                }
                fnNext( _t.ar.json(r) );
            }
        );
    }else{
        r.error = '参数错误';
        fnNext( _t.ar.json(r) );
    }
};
exports.comment_post.filters = [userAuthFilter];

