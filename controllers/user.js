/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var config = require('../config'),
    CAS = require('cas'),
    cas = new CAS({base_url: config.CAS_BASE_URL, service: config.CAS_SERVER_URL}),
    
    userModel = require('../models/user'),
    userAuthFilter = require('../filters/auth').userAuthFilter,
    crypto = require('crypto');

exports.login = function(fnNext){
    if(this.req.user){
        return fnNext( this.ar.redirect('/') );
    }
    var cas_service = 'http://' + this.req.headers.host + config.CAS_SERVER_URL + '?return_url=' + (this.req.get.return_url || '/');
    fnNext( this.ar.redirect( cas.getLoginUrl(cas_service) ) );
};

exports.pay_type_post = function(fnNext){
    var _t = this, pt = _t.req.post.pay_type, r = {success: false};
    if(!pt || ['cash', 'wage'].indexOf(pt) < 0){
        r.error = '参数错误';
        return fnNext( _t.ar.json(r) );
    }
    userModel.updateById(_t.req.user._id.toString(), {'$set': {payment_type: pt}}, {safe:true}, function(err, counts){
        if(err || !counts){
            r.error = '操作数据库失败';
        }else{
            r.success = true;
        }
        fnNext( _t.ar.json(r) );
    });
};
exports.pay_type_post.filters = [userAuthFilter];

/************
 * KSSO登录
 */
exports.ksso_login = function(fnNext){
    if(this.req.user){
        return fnNext( this.ar.redirect('/') );
    }
    
    var ticket = this.req.get.ticket;
    if(ticket){
        var _t = this, 
            cas_service = 'http://' + this.req.headers.host + config.CAS_SERVER_URL + '?return_url=' + (this.req.get.return_url || '/');
        cas.validate(cas_service, ticket, function(err, status, username) {
            if(status===true && username){
                userModel.getByName(username, function(err, user){
                    if(!err && user){
                        _doLogin(_t, user, fnNext);
                    }else{
                        user = {'name': username, 'name_lower': username.toLowerCase() };
                        user.created_at = user.updated_at = new Date(); //(new Date()).format('yyyy-MM-dd hh:mm:ss');
                        userModel.insert(user, {safe:true}, 
                            function(err, user){
                                if(!err && user && user.length){
                                    _doLogin(_t, user[0], fnNext);
                                }else{
                                    return fnNext( _t.ar.redirect('/') );
                                }
                            }
                        );
                    }
                });
            }else{
                return fnNext( _t.ar.redirect('/') );
            }
        });
    }else{
        return fnNext( this.ar.redirect('/') );
    }
};

function _doLogin(_t, user, fnNext){
    var cookieOptions = {path: '/'}, tNow = Date.now(), expires = tNow + 48 * 60 * 60 * 1000;
    
    var ticket = crypto.createHash('md5').update(user.name_lower + tNow).digest("hex") + '_' + expires;
    _t.res.cookies.set('_nut', ticket, cookieOptions);
    userModel.updateById(user._id.toString(), {$set: {'last_login': new Date()}, $addToSet: {'tickets': ticket} }, function(err, _user){
        fnNext( _t.ar.redirect(_t.req.get.return_url || '/') );
        userModel.delExpireTickets(user._id.toString());
    });
};

/************
 * 退出
 */
exports.logout = function(fnNext){
    if(this.req.user){
        userModel.updateById(this.req.user._id.toString(), 
            {$pull: {'tickets': this.req.cookies.ttest} });
            
        userModel.delExpireTickets(this.req.user._id.toString());
    }
    this.res.cookies.clear('_nut', {path:'/'});
    fnNext( this.ar.redirect('/') );
};



