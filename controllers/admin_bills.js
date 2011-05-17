/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var billModel = require('../models/bills');

exports.bills = function(fnNext){
    var _t = this,
        pagesize = 50,
        page = this.routeData.args.id || 1;
    billModel.getBills(page, pagesize, function(err, bills){
        fnNext( _t.ar.view({'bills': bills}) );
    });
};
