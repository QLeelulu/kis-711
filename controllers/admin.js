/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */
 
var adminAuthFilter = require('../filters/auth').adminAuthFilter;

exports.filters = [adminAuthFilter]

exports.index = function(fnNext){
    fnNext( this.ar.view() );
};

_addActions(require('./admin_goods'));
_addActions(require('./admin_users'));
_addActions(require('./admin_inventory'));

function _addActions(actions){
    for(var k in actions){
        exports[k] = actions[k];
    }
};