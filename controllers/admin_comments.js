/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var commentModel = require('../models/comments');

exports.comments = function(fnNext){
    var _t = this,
        pagesize = 50,
        page = this.routeData.args.id || 1;
    commentModel.getByPage(page, pagesize, function(err, comments){
        fnNext( _t.ar.view({'comments': comments}) );
    });
};
