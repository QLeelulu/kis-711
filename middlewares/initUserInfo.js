/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var User = require('../models/user');
    

exports.beginMvcHandler = function(ctx, fnNext){
    var ticket = ctx.req.cookies._nut;
    if(ticket){
        User.getByTicket(ticket,function(err, user){
            if(!err){
                ctx.req.user = user;
            }
            return fnNext();
        });
    }else{
        return fnNext();
    }
};

