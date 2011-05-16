/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var inventoryModel = require('../models/inventory');

exports.inventory = function(fnNext){
    var _t = this,
        where = {},
        ds = _t.req.get.ds,
        de = _t.req.get.de;
        
    if(ds){
        where.created_at = {};
        where.created_at['$gte'] = new Date(ds);
    }
    if(de){
        where.created_at = where.created_at || {};
        var _de = new Date(de);
        //因为是凌晨零点，所以需要增加一天
        _de.setDate(_de.getDate()+1);
        where.created_at['$lte'] = _de;
    }
    inventoryModel.find(where).sort('created_at', -1).toArray(function(err, invs){
        fnNext( _t.ar.view({'inventories': invs, 'dateStart':ds, 'dateEnd':de}) );
    });
};

