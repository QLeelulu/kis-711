/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var goodsModel = require('../models/goods'),
    billModel = require('../models/bills'),
    userAuthFilter = require('../filters/auth').userAuthFilter;

// controller级别的filter
exports.filters = [userAuthFilter];

/********
 * 查看订单
 */
exports.show = function(fnNext){
    var _t = this,
        billId = this.routeData.args.param;
    billModel.findById(billId, function(err, bill){
        if(!bill || bill.user_name.toLowerCase() != _t.req.user.name.toLowerCase()){
            return fnNext( this.ar.notFound() );
        }else{
            var r = {bill: bill};
            fnNext( _t.ar.view(r) );
        }
    });
};

/************
 * 我的订单列表
 */
exports.my = function(fnNext){
    var _t = this;
    billModel.find({user_name:_t.req.user.name}).sort('created_at', -1).toArray(function(err, bills){
        fnNext( _t.ar.view({'bills': bills}) );
    });
};

/************
 * 购买成功
 */
exports.buy_success = function(fnNext){
    var _t = this, r = {},
        billId = this.routeData.args.param;
    billModel.findById(billId, function(err, bill){
        if(bill && bill.user_name.toLowerCase() == _t.req.user.name.toLowerCase()){
            r = {bill: bill};
        }
        fnNext( _t.ar.view(r) );
    });
};
