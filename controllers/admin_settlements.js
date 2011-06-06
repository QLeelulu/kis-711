/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var billModel = require('../models/bills'),
    userModel = require('../models/user'),
    paymentModel = require('../models/payment'),
    settlementModel = require('../models/settlement');

exports.settlements = function(fnNext){
    var _t = this,
        pagesize = 50,
        page = this.routeData.args.id || 1;
    settlementModel.getSettlements(page, pagesize, function(err, settlements){
        fnNext( _t.ar.view({'settlements': settlements}) );
    });
};

/**********
 * 查看某次结算的详细信息
 */
exports.settlement_show = function(fnNext){
    var _t = this,
        r = {ptype: _t.req.get.ptype},
        settlementId = _t.routeData.args.param;
        
    if(settlementId){
        var combo = new Combo(function(){
            if(_t.req.get.print == 'true'){
                fnNext( _t.ar.view(r, 'admin/settlement_show_print.html') );
            }else{
                fnNext( _t.ar.view(r) );
            }
        });
        
        combo.add();
        settlementModel.findById(settlementId, function(err, settlement){
            r.settlement = settlement;
            combo.finishOne();
        });
        
        var where = { settlement_id: paymentModel.id(settlementId)};
        if(r.ptype){
            where.payment_type = r.ptype;
        }
        
        combo.add();
        paymentModel.find( where )
            .sort('payer_lower', 1)
            .toArray(function(err, payments){
                r.payments = payments;
                combo.finishOne();
            });
    }else{
        fnNext( _t.ar.view(r) );
    }
};

/********
 * 确认收款
 */
exports.settlement_pay_post = function(fnNext){
    var _t = this,
        r = {'success':false},
        paymentId = _t.req.post.payment_id;
    if(paymentId){
        paymentModel.updateById(paymentId, {'$set': {has_payed: true, receiver:_t.req.user.name} }, {safe:true}, 
            function(err, pay){
                if(err || !pay){
                    r.error = '更新数据库失败';
                }else{
                    r.success = true;
                    r.receiver = _t.req.user.name;
                }
                fnNext( _t.ar.json(r) );
            }
        );
    }else{
        r.error = '参数错误';
        fnNext( _t.ar.json(r) );
    }
};

/********
 * 生成结算记录
 */
exports.settlement_add_post = function(fnNext){
    var _t = this, 
        r = {'success':false}, 
        now = new Date(),
        slt = {
            operator: this.req.user.name,
            created_at: now
        };
    
    settlementModel.insert(slt, {safe: true}, function(err, _slt){
        if(err || !_slt || !_slt.length){
            r.error = '更新数据库失败';
            fnNext( _t.ar.json(r) );
        }else{
            r.success = true;
            r.settlement = _slt[0];
            buildUsersSettlement(r.settlement._id, function(_r){
                r.success = _r.success;
                r.error = _r.error;
                fnNext( _t.ar.json(r) );
            });
        }
    });
};

/********
 * 生成每个用户需要结算的金额并且插入一条记录
 */
function buildUsersSettlement(settlementId, fn){
    var _t = this,
        data = {},
        r = {success:false};
        
    var combo = new Combo(function(){
        if(data.users && data.bills && data.payments){
            var combo2 = new Combo(function(){
                r.success = true;
                fn(r);
            });
            
            for(var i=0, l=data.users.length; i<l; i++){
                var user = data.users[i],
                    tvalue = data.bills[user.name_lower] ? data.bills[user.name_lower].tvalue : 0,
                    payed = data.payments[user.name_lower] ? data.payments[user.name_lower].tmoney : 0,
                    needPay = Math.round(tvalue - payed);
                //console.log(needPay);
                if(needPay > 0 ){
                    var now = new Date(),
                        pay = {
                            settlement_id: settlementId,
                            payer: user.name,
                            payer_lower: user.name.toLowerCase(),
                            money: needPay,
                            payment_type: user.payment_type || 'wage', //默认从工资扣
                            created_at: now,
                            updated_at: now
                        };
                    combo2.add();
                    paymentModel.insert(pay, {safe: true}, function(err, _pay){
                        combo2.finishOne();
                    });
                }
            }
            
            combo2.check();
            
        }else{
            fn(r);
        }
    });
    
    //所有用户
    combo.add();
    userModel.find().sort('name_lower', 1).toArray(function(err, users){
        data.users = users;
        combo.finishOne();
    });
    
    //用户的所有订单和总消费
    combo.add();
    billModel.group(
        ['user_name'],
        {},
        {'tprice':0, 'tvalue':0, 'tquantity':0, 'tbill':0},
        function(obj, prev){
            prev.tprice += (obj.price * obj.quantity);
            prev.tvalue += (obj.value * obj.quantity);
            prev.tquantity += obj.quantity;
            prev.tbill += 1;
        },
        true,
        function(err, results){
            if(!err && results && results.length){
                data.bills = {};
                for(var i=0, l=results.length; i<l; i++){
                    data.bills[ results[i].user_name.toLowerCase() ] = results[i];
                }
            }
            combo.finishOne();
            //console.dir(err);
            //console.dir(results);
        }
    );
    
    //用户的付款总数
    combo.add();
    paymentModel.group(
        ['payer'],
        {},
        {'tmoney':0, 'tcount':0},
        function(obj, prev){
            prev.tmoney += obj.money;
            prev.tcount += 1;
        },
        true,
        function(err, results){
            data.payments = {};
            if(!err && results && results.length){
                for(var i=0, l=results.length; i<l; i++){
                    data.payments[ results[i].payer.toLowerCase() ] = results[i];
                }
            }
            combo.finishOne();
            //console.dir(err);
            //console.dir(results);
        }
    );
};
