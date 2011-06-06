/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var billModel = require('../models/bills')
    userModel = require('../models/user'),
    goodsModel = require('../models/goods'),
    adminAuthFilter = require('../filters/auth').adminAuthFilter;

// Controller的验证filter
exports.filters = [adminAuthFilter]

exports.index = function(fnNext){
    var _t = this, r = {}, 
        now = new Date(),
        year = now.getFullYear(),
        month = now.getMonth(),
        day = now.getDate(),
        today = new Date(year, month, day),
        yestoday = new Date(year, month, day-1);
    
    var combo = new Combo(function(){
        fnNext( _t.ar.view(r) );
    });
    
    // 商品种类数量
    combo.add();
    goodsModel.count(function(err, count){
        r.goods_count = count;
        combo.finishOne();
    });
    
    // 商品库存数量
    combo.add();
    goodsModel.group(
        [],
        {},
        {'stocks':0, 'no_stocks':0},
        function(obj, prev){
            prev.stocks += obj.stocks;
            if(obj.stocks < 1){
                prev.no_stocks += 1;
            }
        },
        true,
        function(err, count){
            if(count && count.length){
                r.goods_stocks = count[0].stocks;
                r.goods_no_stocks = count[0].no_stocks;
            }
            combo.finishOne();
        }
    );
    
    //总用户数
    combo.add();
    userModel.count(function(err, count){
        r.users_count = count;
        combo.finishOne();
    });
    
    // 总订单、总售出商品数
    combo.add();
    billModel.getCount(today, null, function(err, count){
        r.today_bills = count.value;
        combo.finishOne();
    });
    // 总订单、总售出商品数
    combo.add();
    billModel.getCount(yestoday, today, function(err, count){
        r.yestoday_bills = count.value;
        combo.finishOne();
    });
    
    
};

_addActions(require('./admin_goods'));
_addActions(require('./admin_users'));
_addActions(require('./admin_inventory'));
_addActions(require('./admin_bills'));
_addActions(require('./admin_comments'));
_addActions(require('./admin_settlements'));

function _addActions(actions){
    for(var k in actions){
        exports[k] = actions[k];
    }
};