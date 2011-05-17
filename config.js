/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

exports.DEBUG = true;

exports.projectDir = __dirname;

exports.staticFileDir = 'static';

/*******
 * CAS
 */
exports.CAS_BASE_URL = 'https://sso.s.kingsoft.net/cas';
exports.CAS_SERVER_URL = '/user/ksso_login';

/*******
 * DATABASE
 */
exports.MONGO_HOST = 'localhost';
exports.MONGO_PORT = 27017;
exports.MONGO_DB_NAME = 'kis-711';
exports.MONGO_DB_USER = 'root';
exports.MONGO_DB_PWD = '123456';

exports.middlewares = [
    'cookie',
    'multipart',
    'initUserInfo',
];

exports.init = function(){
    this.route.static('^/favicon.ico');
    this.route.static('^/static/(.*)');
    
    
	this.route.map(
        'idRoute',
        '/{controller}/{action}/{id}/',
        {controller:'home', action:'index'},
        {id:'\\d+'}
    );
    
    this.route.map(
        'default',
        '/{controller}/{action}/{param}',
        {controller:'home', action:'index', param: null}
    );
};