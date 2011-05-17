/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */


/*********
 * 账单
 * 
  , user_name  : String 下订单的用户
  , goods_id   : ObjectId 对应的商品id
  , goods_title: String 商品名称 (记录多一个字段吧，mongodb没有联合查询)
  , price      : Number 进货价 (由于可能每次的进货价、售价不一样，所以账单这里需要记录)
  , value      : Number 售价
  , quantity   : Number 购买的数量
  , created_at : Date
  , updated_at : Date
*/

var db = require('./baseModel').db,
    userModel = require('./user'),
    kutil = require('../util/kutil'),
    collectionName = 'bills';

var Bill = db.collection(collectionName);
    
db.bind(collectionName, {
    /************
     * 获取账单列表
     */
    getBills: function(page, pagesize, fn){
        var pagesize = Number(pagesize),
            page = Number(page);
        page = (isNaN(page) || page < 1) ? 1 : page;
        pagesize = (isNaN(pagesize) || pagesize < 5) ? 5 : pagesize;
        this.find().skip((page-1)*pagesize).limit(pagesize).sort('created_at', -1).toArray(function(err, bills){
            fn && fn(err, bills);
        });
    }
  , getUserBills: function(user_name, cond, fn){
        cond = cond || {};
        cond.user_name = user_name;
        this.find(cond).sort('created_at', -1).toArray(function(err, bills){
            fn && fn(err, bills);
        });
    }
    /*****
     * 获取订单统计数据
     * @param dateStart {Date}
     * @param dateEnd {Date}
     */
  , getCount: function(dateStart, dateEnd, fn){
        var m = function(){
            var r = {quantity: this.quantity, bills: 1};
                r.price = this.price * this.quantity;
                r.value = this.value * this.quantity;
            emit({ds:dateStart, de:dateEnd}, r);
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
        
        var cond = {scope:{dateStart:dateStart, dateEnd:dateEnd}, out: {replace: (dateStart && dateStart.getTime()) + '_' + (dateEnd && dateEnd.getTime()) + '_bills_count'}}, created_at = null;
        if(dateStart){
            created_at = {};
            created_at['$gte'] = dateStart;
        }
        if(dateEnd){
            created_at = created_at || {};
            created_at['$lte'] = dateEnd;
        }
        if(created_at){
            cond.query = {created_at: created_at};
        }

        this.mapReduce(m, r, 
            cond,
            function(err, col){
                if(err){
                    fn && fn(err, null);
                }else{
                    col.find().toArray(function(err, results){
                        fn && fn(err, results && results.length && results[0]);
                    });
                }
            }
        );
    }
});

module.exports = Bill;
