/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    kutil = require('../util/kutil'),
    billModel = require('../models/bills'),
    userModel = require('../models/user');

/******
 * 人数应该不会很多吧，直接不分页了
 */
exports.users = function(fnNext){
    var _t = this,
        r = {},
        pagesize = 50,
        page = this.routeData.args.id || 1;
    
    var combo = new Combo(function(){
        if(r.bills && r.bills.length){
            var billDict = {}, bill = null, user = null;
            for(var i=0, l=r.bills.length; i<l; i++){
                var bill = r.bills[i];
                billDict[bill._id.toLowerCase()] = bill.value;
            }
            for(var i=0, l=r.users.length; i<l; i++){
                user = r.users[i];
                user.bills_total = billDict[user.name.toLowerCase()];
            }
        }
        fnNext( _t.ar.view({'users': r.users, 'dateStart':_t.req.get.ds, 'dateEnd':_t.req.get.de}) );
    });
    
    combo.add();
    userModel.find().sort('name_lower', 1).toArray(function(err, users){
        var userNames = [], user = null;
        r.users = users;
        combo.finishOne();
    });
    
    combo.add();
    _getUsersWithBillInfo(_t.req.get, function(err, bills){
        r.bills = bills;
        combo.finishOne();
    });
    
    /*
    var combo = new Combo(function(){
        if(r.users && r.bills){
            var billDict = {}, bill = null, user = null;
            for(var i=0, l=r.bills.length; i<l; i++){
                var bill = r.bills[i];
                billDict[bill.user_name.toLowerCase()] = bill;
            }
            for(var i=0, l=r.users.length; i<l; i++){
                user = r.users[i];
                user.stat_total = billDict[user.name.toLowerCase()];
            }
        }
        fnNext( _t.ar.view(r) );
    });
    
    combo.add();
    billModel.group(
        ['user_name'],
        {},
        {'price':0, 'value':0, 'quantity':0, 'bills':0},
        function(obj, prev){
            prev.price += (obj.price * obj.quantity);
            prev.value += (obj.value * obj.quantity);
            prev.quantity += obj.quantity;
            prev.bills += 1;
        },
        true,
        function(err, results){
            r.bills = results;
            combo.finishOne();            
        }
    );
    
    combo.add();
    //userModel.getUsers(page, pagesize, function(err, users){
    userModel.find().sort('name', 1).toArray(function(err, users){
        var userNames = [], user = null;
        //fnNext( _t.ar.view({'users': users}) );
        r.users = users;
        combo.finishOne();
        
//        for(var i=0, l=users.length; i<l; i++){
//            user = users[i];
//            user.total_price = 0;
//            user.total_value = 0;
//            user.total_quantity = 0;
//            user.total_bill = 0;
//            userNames.push(users[i].name);
//        }
//        billModel.find({user_name:{$in: userNames}}).toArray(function(err, bills){
//            if(!err && bills && bills.length){
//                var userDict = {}, bill = null;
//                for(var i=0, l=users.length; i<l; i++){
//                    userDict[users[i].name.toLowerCase()] = users[i];
//                }
//                for(var i=0, len=bills.length; i<len; i++){
//                    bill = bills[i];
//                    user = userDict[ bill.user_name.toLowerCase() ];
//                    user.total_price += bill.price;
//                    user.total_value += bill.value;
//                    user.total_quantity += bill.quantity;
//                    user.total_bill++;
//                }
//            }
//            fnNext( _t.ar.view({'users': users}) );
//        });
        
    });
    */
};

function _getUsersWithBillInfo(param, fn){
    
    var m = function(){
        var r = {quantity: this.quantity, bills: 1};
            r.price = this.price * this.quantity;
            r.value = this.value * this.quantity;
        emit(this.user_name, r);
    };
    var r = function(k, vals){
        var val = null, d = {price:0, value:0, quantity:0, bills:0};
        for(var i = vals.length-1; i >=0; i--){
            val = vals[i];
            d.price += val.price;
            d.value += val.value;
            d.quantity += val.quantity;
            d.bills += val.bills;
        }
        return d;
    };
    
    var cond = {'out': {replace: 'user_with_bills_count'}},
        created_at = kutil.getDateRangeCond(param.ds, param.de);
    if(created_at){
        cond.query = {created_at: created_at};
    }
    
    billModel.mapReduce(m, r, 
        cond,
        function(err, col){
            if(err){
                fn && fn(err, null);
            }else{
                col.find().toArray(function(err, results){
                    fn && fn(err, results);
                });
            }
        }
    );
    
    /*
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
            console.dir(err);
            console.dir(results);
        }
    );
    */
}

/********
 * 查看用户的详细信息
 */
exports.user_detail = function(fnNext){
    var _t = this,
        userId = this.routeData.args.param;
    userModel.findById(userId, function(err, user){
        if(err || !user){
            return fnNext( _t.ar.view() );
        }
        var ds = _t.req.get.ds,
            de = _t.req.get.de,
            r = {user: user, dateStart: ds, dateEnd: de};
        user.total_price = 0;
        user.total_value = 0;
        user.total_quantity = 0;
        user.total_bill = 0;
        
        var cond = {}, created_at = kutil.getDateRangeCond(ds, de);
        if(created_at){
            cond.created_at = created_at;
        }

        billModel.getUserBills(user.name, cond, function(err, bills){
            if(!err && bills && bills.length){
                var bill = null;
                for(var i=0, len=bills.length; i<len; i++){
                    bill = bills[i];
                    user.total_price += (bill.price * bill.quantity);
                    user.total_value += (bill.value * bill.quantity);
                    user.total_quantity += bill.quantity;
                    user.total_bill++;
                }
            }
            r.bills = bills;
            fnNext( _t.ar.view(r) );
        });
    });
};

/*******
 * 管理员管理
 */
exports.admin_users = function(fnNext){
    var _t = this;
    userModel.find({isAdmin:true}).toArray(function(err, users){
        fnNext( _t.ar.view({'users': users}) );
    });
};

/*******
 * 添加管理员
 */
exports.admin_user_add = function(fnNext){
    var _t = this, username = _t.req.post.username, r = {success:false};
    if(!username){
        r.error = '参数错误';
        return fnNext( _t.ar.json(r) );
    }
    
    userModel.getByName(username, function(err, user){
        if(err || !user){
            r.error = (err && err.message) || '用户不存在';
            return fnNext( _t.ar.json(r) );
        }
        userModel.updateById(user._id.toString(), {$set:{isAdmin:true}}, {safe:true}, function(err, counts){
            if(err || !counts){
                r.error = '更新数据库失败';
            }else{
                r.success = true;
            }
            return fnNext( _t.ar.json(r) );
        });
    });
};

/*******
 * 取消管理员
 */
exports.admin_user_remove = function(fnNext){
    var _t = this, user_id = _t.req.post.user_id, r = {success:false};
    if(!user_id){
        r.error = '参数错误';
        return fnNext( _t.ar.json(r) );
    }
    userModel.updateById(user_id, {$set:{isAdmin:false}}, {safe:true}, function(err, counts){
        if(err || !counts){
            r.error = '更新数据库失败'; //err.message;
        }else{
            r.success = true;
        }
        return fnNext( _t.ar.json(r) );
    });
};
