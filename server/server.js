'use strict';

var m_cluster = require('cluster');
var m_http = require('http');
var m_net = require('net');
var m_socket_io = require('socket.io');
var m_url = require('url');

//var m_q = require('q');
//var m_redis = require('redis');

var App = require('../app/app');

//if(typeof process.env.REDIS_PORT_6379_TCP_ADDR === 'undefined') {
//    throw new Error('Invalid redis env');
//}
//
//if(typeof process.env.REDIS_PORT_6379_TCP_PORT === 'undefined') {
//    throw new Error('Invalid redis env');
//}
//console.log(process.env);
//var s_redis_ip = process.env.REDIS_PORT_6379_TCP_ADDR;
//var i_redis_port = process.env.REDIS_PORT_6379_TCP_PORT;
//
//var o_redis_client = m_redis.createClient(i_redis_port, s_redis_ip);
//
//o_redis_client.on('error', function(s_err){
//    console.log('Redis['+s_redis_ip+':'+i_redis_port+'] error : ' + s_err);
//});
//App.get_static_content(s_path, {pid:internal_pid})
//    .then(function(o_content){
//        return [o_content.render(), o_content.get_code()];
//    })
//    .spread(function(s_content, i_code){
//        o_res.writeHead(i_code);
//        o_res.write(s_content);
//        o_res.end();
//    }).fail(function(s_reason){
//        o_res.writeHead(500);
//        o_res.write(s_reason);
//        o_res.end();
//    });

if (m_cluster.isMaster)  {
    var i_internal_pid = 1;
    var i_worker_max = 100;

    var a_worker_pool = [];
    var h_worker_ips = {};



    var get_worker = function(s_ip){
        if(typeof h_worker_ips[s_ip] === 'undefined'){
            if(a_worker_pool.length < i_worker_max) {
                var i_worker_pid = i_internal_pid++;

                console.log('Create new worker : ', i_worker_pid);
                h_worker_ips[s_ip] = i_worker_pid;
                a_worker_pool[i_worker_pid] = m_cluster.fork();

                a_worker_pool[i_worker_pid].on('exit', function (o_worker, i_code, i_signal) {
                    console.log('The worker #', i_worker_pid, ' which handle ', s_ip, ' die');
                    a_worker_pool.splice(h_worker_ips[s_ip], 1);
                    delete h_worker_ips[s_ip];

                });
                return a_worker_pool[i_worker_pid];
            } else {
                throw new Error('Too much workers');
            }
        } else {
            console.log('Giving request from ', s_ip, ' to living worker #', i_internal_pid);
            return a_worker_pool[h_worker_ips[s_ip]];
        }
    };

    m_net.createServer({ pauseOnConnect: true }, function(o_req, o_res){
        console.log('Get front request from ', o_req.remoteAddress);

        var worker = get_worker(o_req.remoteAddress);
        worker.send('sticky-session:connection', o_req)
    }).listen(8080);
} else {
    //TODO worker exit on timeout or disconnect
    var o_app = new App();
    var o_internal_server = m_http.createServer(function(o_req, o_res){
        var s_path = m_url.parse(o_req.url).pathname;
        console.log('Handle internal request : ', s_path);

        o_app.get_static(s_path, {pid:process.pid})
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

    process.on('message', function(message, connection){
        if (message !== 'sticky-session:connection') {
            return;
        }
        o_internal_server.emit('connection', connection);
        connection.resume();
    });
}

