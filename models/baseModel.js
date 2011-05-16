/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var mongo = require('mongoskin'),
    config = require('../config'),
    db = mongo.db('{{host}}:{{port}}/{{dbname}}?auto_reconnect'.format({
                host: config.MONGO_HOST,
                port: config.MONGO_PORT,
                dbname: config.MONGO_DB_NAME
            })
        );

exports.mongo = mongo;

exports.db = db;
