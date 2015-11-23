'use strict';

//TODO find a way to restart worker of application if it change
//TODO OR create an app script for developpement purpose
//TODO fucking naming conventions which take care of scope and types


var m_cluster = require('cluster');
var m_balancer = require('./class/Balancer');

//m_balancer.set_engine(m_balancer.ENGINE.SINGLE);
m_balancer.load_engine(m_balancer.ENGINE.GROWTH, { //Engine overrides
    max:60,
    timeout:500
});
if(m_cluster.isMaster) {
    if (typeof process.env.REDIS_PORT_6379_TCP_ADDR === 'undefined') {
        throw new Error('Invalid redis env');
    }

    if (typeof process.env.REDIS_PORT_6379_TCP_PORT === 'undefined') {
        throw new Error('Invalid redis env');
    }
    console.log('cOIN!!');
    // m_balancer.createServer(m_balancer.ENGINE.GROWTH, 100).listen(8080);
    //m_balancer.createServer(m_balancer.ENGINE.ROUNDROBIN, 30).listen(8080);
    m_balancer.listen(8080);
    //m_balancer.createServer(m_balancer.ENGINE.IpHash, 100).listen(8080);

} else {
    var m_http = require('http');
    var m_socket_io = require('socket.io');
    var m_socket_io_redis = require('socket.io-redis');
    var m_url = require('url');

    var App = require('../app/app');
    //var f_exit = function(){
    //    process.exit(0);
    //};
    //var i_timeout_ms = 200;//240000;
    //var o_timeout = setTimeout(f_exit, i_timeout_ms);
    var o_internal_server = m_http.createServer(function (o_req, o_res) {
        var s_path = m_url.parse(o_req.url).pathname;
        console.log('Handle http internal request : %s (PID #%s)', s_path, process.pid);

        //clearTimeout(o_timeout);
        //o_timeout = setTimeout(f_exit, i_timeout_ms);

        App.get_static(s_path, {pid: process.pid})
            .then(function (o_content) {
                return [o_content.render(), o_content.get_code(), o_content.get_type()];
            })
            .spread(function (s_content, i_code, s_type) {
                o_res.writeHead(i_code, {
                    'Content-Type': s_type,
                    'Content-Length': s_content.length
                });
                o_res.write(s_content);
                o_res.end();
            }).fail(function (s_reason) {
                o_res.writeHead(500);
                o_res.write(s_reason);
                o_res.end();
            });
    }).listen(0, 'localhost');

    var o_io = m_socket_io(o_internal_server);
    o_io.adapter(m_socket_io_redis({
        host: process.env.REDIS_PORT_6379_TCP_ADDR,
        port: process.env.REDIS_PORT_6379_TCP_PORT
    }));

    //o_io.on('connection',function(){
    //    clearTimeout(o_timeout);
    //    o_timeout = setTimeout(f_exit, i_timeout_ms);
    //});
    m_balancer.bind_internal(o_internal_server);
}
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