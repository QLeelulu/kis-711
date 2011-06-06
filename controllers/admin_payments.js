/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var paymentModel = require('../models/payment');

exports.payments = function(fnNext){
    var _t = this,
        pagesize = 50,
        page = this.routeData.args.id || 1;
    paymentModel.getByPage(page, pagesize, function(err, comments){
        fnNext( _t.ar.view({'payments': payments}) );
    });
};

exports.settlement_post = function(fnNext){
    var _t = this,
        pagesize = 50,
        page = this.routeData.args.id || 1;
    paymentModel.getByPage(page, pagesize, function(err, comments){
        fnNext( _t.ar.view({'payments': payments}) );
    });
};
