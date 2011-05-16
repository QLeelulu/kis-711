/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

exports.userAuthFilter = {
    onControllerExecuting: function(ctx, fnNext){
        if(ctx.req.user){
            fnNext();
        }else{
            // node.js 的 headers 的 名称 全部为 小写
            if(ctx.req.headers['x-requested-with'] == 'XMLHttpRequest'){
                fnNext( ctx.ar.json({success:false, need_login:true }) );
            }else{
                fnNext( ctx.ar.redirect('/user/login?return_url='+ ctx.req.url) );
            }
        }
    }
};

exports.adminAuthFilter = {
    onControllerExecuting: function(ctx, fnNext){
        if(ctx.req.user && ctx.req.user.isAdmin){
            fnNext();
        }else if(ctx.req.user){
            if(ctx.req.headers['x-requested-with'] == 'XMLHttpRequest'){
                fnNext( ctx.ar.json({success:false, error:'没有权限'}) );
            }else{
                fnNext( ctx.ar.raw('没有权限') );
            }
        }else{
            if(ctx.req.headers['x-requested-with'] == 'XMLHttpRequest'){
                fnNext( ctx.ar.json({success:false, need_login:true }) );
            }else{
                fnNext( ctx.ar.redirect('/user/login?return_url='+ ctx.req.url) );
            }
        }
    }
};

