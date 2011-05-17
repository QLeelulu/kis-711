/**
 * @author QLeelulu@gmail.com
 * @blog http://qleelulu.cnblogs.com
 */

var mongo = require('mongoskin'),
    config = require('../config'),
    db = mongo.db('{{username}}:{{password}}@{{host}}:{{port}}/{{dbname}}?auto_reconnect'.format({
                host: config.MONGO_HOST,
                port: config.MONGO_PORT,
                dbname: config.MONGO_DB_NAME,
                username: config.MONGO_DB_USER, 
                password: config.MONGO_DB_PWD
            }),
            function(err){
                if(err){
                    console.log(err);
                }
            }
        );

exports.mongo = mongo;

exports.db = db;
