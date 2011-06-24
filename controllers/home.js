/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var paymentModel = require('../models/payment'),
    goodsModel = require('../models/goods');

exports.index = function(fnNext){
    var _t = this,
        r = {};
        pagesize = 50,
        page = this.routeData.args.id || 1;
        
    var combo = new Combo(function(){
        fnNext( _t.ar.view(r) );
    });
    
    combo.add();
    goodsModel.getSalingGoods(page, pagesize, function(err, goods){
        r.goods = goods;
        combo.finishOne();
    });
    
    combo.add();
    goodsModel.find({'stocks':{$gt: 0}, 'recommend':true, 'on_sale':true }).limit(4).sort('created_at', -1).toArray(function(err, goods){
        r.re_goods = goods;
        combo.finishOne();
    });
    
    if(this.req.user){
        combo.add();
        paymentModel.find({
                payer:_t.req.user.name, 
                payment_type:'cash',
                has_payed: {$ne: true}
            }).count(function(err, count){
                r.needCashPay = count;
                combo.finishOne();
            }
        );
    }
};
