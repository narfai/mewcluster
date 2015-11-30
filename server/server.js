'use strict';

//Have to handle clustering (both Master and Worker)
var m_cluster = require('cluster');

//Have to handle balancing (both Master and Worker)
var m_balancer = require('./class/Balancer');

//Have to handle notification and logging (both Master and Worker)
var oc_notifier = require('./class/Notifier')('app', function(OUTPUTS){
    return {
        info:[OUTPUTS.STDOUT],
        error:[OUTPUTS.FILE, OUTPUTS.STDERR],
        debug:[OUTPUTS.FILE, OUTPUTS.STDERR]
    };
});

if(m_cluster.isMaster) {
//This code should be executed only once on a Master process

    //Check Docker ENV
    if (typeof process.env.REDIS_PORT_6379_TCP_ADDR === 'undefined') {
        throw new Error('Invalid redis env');
    }

    if (typeof process.env.REDIS_PORT_6379_TCP_PORT === 'undefined') {
        throw new Error('Invalid redis env');
    }

    //Proxy listen for TCP requests
    m_balancer.listen({
        port:8080,
        engine:m_balancer.ENGINE.IPHASH,
        timeout:5000,
        engine_conf:{
            max:2,
            respawn:false
        }
    });

} else {
//This code should be executed from one to many times on a Worker process

    //Have to handle HTTP
    var m_http = require('http');

    //Have to handle absctract sockets
    var m_socket_io = require('socket.io');

    //Needed to get per-user session through redis
    var m_socket_io_redis = require('socket.io-redis');

    //Have to parse some urls
    var m_url = require('url');

    //Our application
    var App = require('../app/app');

    //Get App Emitter
    var o_app_emitter = m_balancer.get_app_emitter();

    //Triggered instead killing process
    process.on('uncaughtException', function (o_error) {
        //Let Master handle Worker error (it may restart it if needed)
        o_app_emitter.send_panic(o_error);
    });


    //Create HTTP server
    var o_internal_server = m_http.createServer(function (o_req, o_res) {
        var s_path = m_url.parse(o_req.url).pathname;
        oc_notifier.debug('Handle http internal request : %s (PID #%s)', s_path, process.pid);

        o_app_emitter.send_heartbeat();

        //Static http request handling by application
        //App have to send it bootload html + js code before having two-way communications
        App.get_static(s_path, {pid: process.pid}) //Have to return a promise
            .then(function (o_content) { //Split HttpContent object
                return [o_content.render(), o_content.get_code(), o_content.get_type()];
            })
            .spread(function (s_content, i_code, s_type) { //Send HttpContent to client
                o_res.writeHead(i_code, {
                    'Content-Type': s_type,
                    'Content-Length': s_content.length
                });
                o_res.write(s_content);
                o_res.end();
            }).catch(function(o_error) { //On any error or reject, send 500 error
                o_res.writeHead(500);
                o_res.write(o_error.toString());
                o_res.end();
            });
    }).listen(0, 'localhost');

    //Bind abstract socket to http server
    var o_io = m_socket_io(o_internal_server);

    //Bind redis socket per-user session
    o_io.adapter(m_socket_io_redis({
        host: process.env.REDIS_PORT_6379_TCP_ADDR,
        port: process.env.REDIS_PORT_6379_TCP_PORT
    }));

    //Instanciate our application. Have to be before "bind_internal" allow app listeners to be triggered before server one's in event queue
    var o_app = new App(o_app_emitter, oc_notifier);

    //Allow balancer to relay TCP connexions to our internal server
    m_balancer.bind_internal(o_internal_server, o_app_emitter);
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