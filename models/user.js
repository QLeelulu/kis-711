/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*
    name : String
  , name_lower  : String 名称的小写格式
  , isAdmin     : Boolen
  , payment_type: String 结算方式 cash:现金结算方式， wage:工资扣
  , stat_total  : Object 用户的购买记录的总的统计
                * {
                *   price: 总价值（按进货价算）
                *   value: 总应付款（按售价算）
                *   bills: 总订单数
                *   quantity: 总商品数
                * }
  , created_at: Date
  , updated_at: Date
  , last_login: Date
  , tickets: [] //用户登录的票据，格式为 md5(email + timestdmp) + '_' + timestamp ,最后一个timestamp用于过期时间判断
*/

var db = require('./baseModel').db,
    collectionName = 'kis_users';

var User = db.collection(collectionName);
    //UserTicket = db.createCollection('user_tickets', {'capped':true, 'size':1024*1000}, function(err, collection){ });

db.bind(collectionName, {
    getUsers: function(page, pagesize, fn){
        var pagesize = Number(pagesize),
            page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 10) ? 10 : pagesize;
        this.find().skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, users){
            fn && fn(err, users);
        });
    }
  , getByName: function(name, fn){
        this.find({name_lower: name.toLowerCase()}, {'tickets': 0}).limit(1).toArray(function(err, user){
            fn(err, user && user[0]);
        });
    }
  , getByTicket: function(ticket, fn){
//        this.findOne({tickets: ticket}, {'tickets': 0}, function(err, user){
//            console.log(user)
//            fn(err, user);
//        });
        this.find({tickets: ticket}, {'tickets': 0}).limit(1).toArray(function(err, user){
            fn(err, user && user[0]);
        });
    }
  /**********
   * 将已经过期的登录票据删除(在登录成功或者退出的时候执行)
   * @param user_id {String}
   */
  , delExpireTickets: function(user_id, fn){
        var _t = this;
        _t.findById(user_id, function(err, user){
            if(!err && user){
                var exTime = null, tNow = Date.now();
                for(var i in user.tickets){
                    exTime = Number(user.tickets[i].split('_')[1]);
                    if(tNow >= exTime){
                        _t.updateById(user_id, {$pull: {'tickets': user.tickets[i]} });
                    }
                }
            }
        });
    }
});

module.exports = User;
