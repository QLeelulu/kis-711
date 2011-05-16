/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

require.paths.unshift('refLib');
require.paths.unshift('./');

require('./util/monkey_patching');
global.n2Mvc = require('../n2Mvc');

var config = require('./config');

n2Mvc.server.createServer(config);
