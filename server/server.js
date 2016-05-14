'use strict';

//TODO create simple server Object and pack it into a usable library
//as (new Server).run(App);
//Have to handle clustering (both Master and Worker)
var ro_cluster = require('cluster');

//Have to handle balancing (both Master and Worker)
var ro_balancer = require('./class/Balancer');

var rh_config_from_app = require('../app/cluster.json');

var rf_merge = require('merge');

const APP_PATH = "../app";

if(ro_cluster.isMaster) {
//This code should be executed only once on a Master process

    //Check Docker ENV
    if (typeof process.env.REDIS_PORT_6379_TCP_ADDR === 'undefined') {
        throw new Error('Invalid redis env');
    }

    if (typeof process.env.REDIS_PORT_6379_TCP_PORT === 'undefined') {
        throw new Error('Invalid redis env');
    }

    //TODO implement optionnal docker env for overriding application config
    var h_default_config = {
        port:8080,
        engine:ro_balancer.ENGINE.SINGLE,
        timeout:5000,
        engine_conf:{
            max:2,
            respawn:true
        }
    };

    //Proxy listen for TCP requests
    ro_balancer.listen(rf_merge(h_default_config, rh_config_from_app.balancer));

} else {
//This code should be executed from one to many times on a Worker process

    //Have to handle HTTP
    const ro_http = require('http');

    //Have to handle absctract sockets
    const rf_socket_io = require('socket.io');

    //Needed to get per-user session through redis
    const rf_socket_io_redis = require('socket.io-redis');

    //Have to parse some urls
    const ro_url = require('url');

    //promise!
    const ro_q = require('q');

    //Get app notifier factory
    var rf_get_notifier = require('./class/Notifier');

    var oc_notifier = rf_get_notifier('server', function(OUTPUTS){
        return {
            info:[OUTPUTS.FILE,OUTPUTS.STDOUT],
            warning:[OUTPUTS.FILE,OUTPUTS.STDOUT],
            debug:[OUTPUTS.FILE,OUTPUTS.STDOUT]
        };
    });

    if(typeof rh_config_from_app.server !== 'undefined' && typeof rh_config_from_app.server.reload !== 'undefined' && rh_config_from_app.reload){
      oc_notifier.info('#' + process.pid + 'unload ' + APP_PATH + '/app' + ' from require cache ');
      //Reload application
      delete require.cache[require.resolve(APP_PATH+'/app')];
    }
    //Our application
    const App = require(APP_PATH+'/app');

    //Need to handle http contents
    const HttpContent = require('./class/HttpContent');

    //Get App Emitter
    var o_app_emitter = ro_balancer.get_app_emitter();




    //Triggered instead killing process
    process.on('uncaughtException', function (o_error) {
        //Let Master handle Worker error (it may restart it if needed)
        o_app_emitter.send_panic(o_error);
    });

    //TODO Grab SIGTERM for calling on_close on loaded Apps THEN exiting


    //Create HTTP server
    var o_internal_server = ro_http.createServer(function (o_req, o_res) {
        var o_defer = ro_q.defer();
        var s_path = ro_url.parse(o_req.url).pathname;
        oc_notifier.debug('#' + process.pid + 'server path : '+ s_path +' request url : ' + o_req.url);
        o_app_emitter.send_heartbeat();
        var data = {
            method: '',
            value: ''
        };
        oc_notifier.debug('#' + process.pid + ' get ' + o_req.method + 'request');
        switch (o_req.method){
            case 'POST':
                data.method = 'POST';
                o_req.on('data', function (d) {
                    data.value += d;
                });
                o_req.on('end', function () {
                    o_defer.resolve(data);
                });
                break;
            case 'GET':
            default:
                data.method = 'GET';
                o_defer.resolve(data);
                break;
        }

        o_defer.promise.then(function(h_request_data){
            //Static http request handling by application
            //App have to send it bootload html + js code before having two-way communications
            App.get_static(s_path, {pid: process.pid, requestData:h_request_data}, HttpContent) //Have to return a promise
                .then(function (o_content) { //Split HttpContent object
                    return [o_content.render(APP_PATH + rh_config_from_app.httpcontent.render_path), o_content.get_code(), o_content.get_type()];
                })
                .spread(function (s_content, i_code, s_type) { //Send HttpContent to client
                    o_res.writeHead(i_code, {//TODO Allow headers to be dynamic by adding headers hash to HttpContent.headers
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
        }).done();
    }).listen(0, 'localhost');

    //Bind abstract socket to http server
    var o_io = rf_socket_io(o_internal_server);

    //Bind redis socket per-user session
    o_io.adapter(rf_socket_io_redis({
        host: process.env.REDIS_PORT_6379_TCP_ADDR,
        port: process.env.REDIS_PORT_6379_TCP_PORT
    }));

    //Instanciate our application. Have to be before "bind_internal" allow app listeners to be triggered before server one's in event queue
    new App({
        emitter :o_app_emitter,
        notifier_factory: rf_get_notifier,
        io:o_io
    });

    //Allow balancer to relay TCP connexions to our internal server
    ro_balancer.bind_internal(o_internal_server, o_app_emitter);
}
