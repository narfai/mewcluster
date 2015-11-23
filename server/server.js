'use strict';

//TODO find a way to restart worker of application if it change
//TODO OR create an app script for developpement purpose
//TODO fucking naming conventions which take care of scope and types


var m_http = require('http');
var m_socket_io = require('socket.io');
var m_socket_io_redis = require('socket.io-redis');
var m_url = require('url');

var m_balancer = require('./class/Balancer');


if(typeof process.env.REDIS_PORT_6379_TCP_ADDR === 'undefined') {
    throw new Error('Invalid redis env');
}

if(typeof process.env.REDIS_PORT_6379_TCP_PORT === 'undefined') {
    throw new Error('Invalid redis env');
}



//var o_balancer = m_balancer.createServer(m_balancer.ENGINE.GROWTH, 100);
//var o_balancer = m_balancer.createServer(m_balancer.ENGINE.ROUNDROBIN, 4);
//var o_balancer = m_balancer.createServer(m_balancer.ENGINE.SINGLE, 0);
var o_balancer = m_balancer.createServer(m_balancer.ENGINE.ROUNDROBIN, 4);


o_balancer.set_server(function(b_reload, f_disconnect){
    if(b_reload) {
        module.unCacheModule('../app/app')
    }

    var App = require('../app/app');

    var o_internal_server = m_http.createServer(function(o_req, o_res){
        var s_path = m_url.parse(o_req.url).pathname;
        console.log('Handle http internal request : %s (PID #%s)', s_path, process.pid);

        App.get_static(s_path, {pid:process.pid})
            .then(function(o_content){
                return [o_content.render(), o_content.get_code(), o_content.get_type()];
            })
            .spread(function(s_content, i_code, s_type){
                o_res.writeHead(i_code, {
                    'Content-Type':s_type,
                    'Content-Length':s_content.length
                });
                o_res.write(s_content);
                o_res.end();
            }).fail(function(s_reason){
                o_res.writeHead(500);
                o_res.write(s_reason);
                o_res.end();
            });
    }).listen(0, 'localhost');

    var o_io = m_socket_io(o_internal_server);
    o_io.adapter(m_socket_io_redis({ host: process.env.REDIS_PORT_6379_TCP_ADDR, port: process.env.REDIS_PORT_6379_TCP_PORT }));

    return o_internal_server;
});
o_balancer.listen(8080);

//process.stdout.write("\x1b[1;1H\x1b[2J");
//process.stdin.setEncoding('utf8');
//
//process.stdin.on('readable', function() {
//    var chunk = process.stdin.read();
//    if (chunk !== null) {
//        process.stdout.write('data: ' + chunk);
//    }
//});
//
//process.stdin.on('end', function() {
//    process.stdout.write('end');
//});
/*
Créer une interface CLI qui permet :
de voir les workers
de voir les logs par onglets
de tuer / relancer un worker

*/