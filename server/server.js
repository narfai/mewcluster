'use strict';

var m_cluster = require('cluster');
var m_http = require('http');
var m_url = require('url');
var m_q = require('q');

var m_events = require('events');
var m_redis = require('redis');

var App = require('../app/app');
var cpu_count = require('os').cpus().length;

if(typeof process.env.REDIS_PORT_6379_TCP_ADDR === 'undefined') {
    throw new Error('Invalid redis env');
}

if(typeof process.env.REDIS_PORT_6379_TCP_PORT === 'undefined') {
    throw new Error('Invalid redis env');
}
//console.log(process.env);
//var s_redis_ip = process.env.REDIS_PORT_6379_TCP_ADDR;
//var i_redis_port = process.env.REDIS_PORT_6379_TCP_PORT;
//
//var o_redis_client = m_redis.createClient(i_redis_port, s_redis_ip);
//
//o_redis_client.on('error', function(s_err){
//    console.log('Redis['+s_redis_ip+':'+i_redis_port+'] error : ' + s_err);
//});

var internal_pid = 1;
if (m_cluster.isMaster)  {
    m_http.createServer(function(o_req, o_res){

        var s_path = m_url.parse(o_req.url).pathname;
        console.log('Handle request : %s %s as path %s', o_req.method, o_req.url, s_path);

        App.get_static_content(s_path, {pid:internal_pid})
        .then(function(o_content){
            var o_def = m_q.defer();
                o_def.resolve(o_content.get_code());
            return [o_content.render(), o_def.promise];
        })
        .spread(function(s_content, i_code){
            o_res.writeHead(i_code);
            o_res.write(s_content);
            o_res.end();
        }).fail(function(s_reason){
            o_res.writeHead(404);
            o_res.write(s_reason);
            o_res.end();
        });

        //m_cluster.fork();

        internal_pid++;
    }).listen(8080);

    m_cluster.on('exit', function(worker, code, signal){
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    console.log('load app');
    App.load();
}

