'use strict';

/*Copyright 2016 François Cadeillan

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/

//Need to handle clustering
const ro_cluster = require('cluster');

//Need to create tcp server
const ro_net = require('net');

//Need to merge some hash
const rf_merge = require('merge');

//Need to create event emitter
const EventEmitter = require('events');

//Create and configure balancer notifier
var oc_notifier = require('./Notifier')('balancer', function(OUTPUTS){
    return {
        info:[OUTPUTS.FILE,OUTPUTS.STDOUT],
        warning:[OUTPUTS.FILE,OUTPUTS.STDOUT],
        worker_debug:[OUTPUTS.STDOUT, OUTPUTS.EVENT],
        master_debug:[OUTPUTS.STDOUT, OUTPUTS.EVENT],
        worker_error:[OUTPUTS.FILE, OUTPUTS.STDERR],
        master_error:[OUTPUTS.FILE, OUTPUTS.STDERR]
    };
});
//As you can see, we can play with notification channel filtering
var clear_dump = function(s_message, h_data){
    h_data = {};
    return [s_message, h_data];
};
oc_notifier.add_filter('worker_debug', clear_dump);
oc_notifier.add_filter('master_debug', clear_dump);

/**
 * Balancer is class which have an instance into each process
 * It is intended to manage a cluster of workers with user-selected engine
 * @constructor
 */
function Balancer(){
    var self = this;
    self.default_conf = {
        port:8080,
        timeout:120000,
        engine:Balancer.ENGINE.SINGLE,
        engine_conf:{}
    };
    self.timeout = self.default_conf.timeout;
    self.timeouts = {};
}

/**
 * Static engine definition
 */
Balancer.__proto__.ENGINE = {
    ONDEMAND : 1,
    SINGLE : 2,
    ROUNDROBIN : 3,
    IPHASH : 4
};
Balancer.prototype.set_worker_timeout = function(o_worker){
    if(ro_cluster.isMaster) {
        var self = this;
        if (self.timeout !== 0) {
            if (typeof self.timeouts[o_worker.id] !== 'undefined') {
                clearTimeout(self.timeouts[o_worker.id]);
            }
            self.timeouts[o_worker.id] = setTimeout(function () {
                oc_notifier.master_debug('Worker #' + o_worker.id + ' has reached his timeout');
                self.exit(o_worker);
            }, this.timeout);
        }
    }
};
/**
 * This function is given to engine for abstract spawning.
 * There should not be any other fork() that this one
 * Specific to Master process
 * @return Worker
 */
Balancer.prototype.spawn = function(){
    if(ro_cluster.isMaster) {
        var self = this;

        //Fork current process (Execution entry of new thread should be server.js)
        var o_worker = ro_cluster.fork();

        o_worker.on('online', function(){
            self.set_worker_timeout(o_worker);
            oc_notifier.worker_debug('Worker #' + o_worker.id + ' is online (PID : #' + o_worker.process.pid + ')');
        });

        o_worker.on('exit', function(i_status, i_code){
            oc_notifier.worker_debug('Worker #' + o_worker.id + ' die (PID : #' + o_worker.process.pid + ')')
        });


        //Happen after this specific worker has send a message
        o_worker.on('message', function(s_message){
            switch(s_message){
                case 'heartbeat':
                    self.heartbeat(o_worker);
                    break;
                case 'panic':
                    self.panic(o_worker);
                    break;
            }
        });

        return o_worker;
    }
};
/**
 * Preload engine
 * Specific to Master process
 * @param i_engine
 * @param h_engine_conf ({max:0, auto})
 */
Balancer.prototype.load_engine = function(i_engine, h_engine_conf){
    if(ro_cluster.isMaster) {
        var Engine;
        switch (i_engine) {
            case Balancer.ENGINE.ONDEMAND :
                Engine = require('./engine/OnDemand.js');
                oc_notifier.master_debug('Load ONDEMAND engine', {'code': Balancer.ENGINE.ONDEMAND});//TODO on event
                break;
            case Balancer.ENGINE.SINGLE :
                Engine = require('./engine/Single.js');
                oc_notifier.master_debug('Load SINGLE engine', {'code': Balancer.ENGINE.SINGLE});//TODO on event
                break;
            case Balancer.ENGINE.ROUNDROBIN :
                Engine = require('./engine/RoundRobin.js');
                oc_notifier.master_debug('Load ROUNDROBIN engine', {'code': Balancer.ENGINE.ROUNDROBIN});//TODO on event
                break;
            case Balancer.ENGINE.IPHASH :
                Engine = require('./engine/IpHash.js');
                oc_notifier.master_debug('Load IPHASH engine', {'code': Balancer.ENGINE.IPHASH});//TODO on event
                break;
            default:
                throw new Error('Invalid engine : ' + i_engine);
        }
        //Create new engine which is able to spawn (and respawn) workers
        this.engine = new Engine(Balancer.prototype.spawn.bind(this), h_engine_conf);

        //Init engine
        this.engine.init();
    }
};
/**
 * Run cluster load-balancing system listen on specified tcp port
 * Specific to Master process
 * @param {Hash}h_conf
 */
Balancer.prototype.listen = function(h_conf){
    if(ro_cluster.isMaster) {
        var self = this;

    //Initialization

        //Allow configuration override
        h_conf = (typeof h_conf === 'undefined')? self.default_conf : rf_merge(self.default_conf, h_conf);

        //Store timeout for later
        this.timeout = h_conf.timeout;

        //Load selected engine with it's configuration
        self.load_engine(h_conf.engine, h_conf.engine_conf);

    //Create front TCP proxy server

        //pauseOnConnect option avoid data loss while relaying TCP connection
        var o_front_server = ro_net.createServer({pauseOnConnect: true}, function (o_conn) {
            try {
                //Get worker from balance engine
                var o_worker = self.engine.get_worker(o_conn.remoteAddress);

                //Give it a TCP connection through IPC channel
                o_worker.send('sticky-session:connection', o_conn);

                oc_notifier.master_debug('Send connection from ' + o_conn.remoteAddress + ' to worker #' + o_worker.id + ' (PID #' + o_worker.process.pid + ')');
            } catch(o_error){
                oc_notifier.master_debug('Skip request due to error : '+o_error.toString(), {error:o_error, conn:o_conn});

                //Destroy TCP connection on error
                o_conn.destroy();
            }
        });

    //Bindings

        o_front_server.on('error', function (o_error) {
            oc_notifier.master_debug('Error :' + o_error.toString(), {'err': o_error});
        });

        ro_cluster.on('listening', function(o_worker, o_conn) {
            oc_notifier.worker_debug('#'+o_worker.id+'(PID #'+o_worker.process.pid+') listen to ' + o_conn.address + ':' + o_conn.port, {conn:o_conn});
        });

    //Listen

        o_front_server.listen(h_conf.port);
    }
};
/**
 * Relay TCP connections to specified worker private servers
 * Specific to Worker
 * @params {Server}o_internal_server, {Object}o_app_emitter
 */
Balancer.prototype.bind_internal = function(o_internal_server, o_app_emitter){
    if(ro_cluster.isWorker) {

        //Check given object validity
        if (!(o_internal_server instanceof ro_net.Server )) {
            throw new Error('Invalid server');
        }

        o_internal_server.on('error', function (o_error) {
            oc_notifier.worker_error('Error :' + o_error.toString(), {'err': o_error});
        });


        o_app_emitter.on_clear(function(){
            o_internal_server.close(function(){
                oc_notifier.worker_debug('Proper close internal server on worker # :' + ro_cluster.worker.id + ' (PID #' + process.pid + ')');
            });
        });

        //Listen for Master process IPC messages
        process.on('message', function (s_msg, o_conn) {
            if (s_msg !== 'sticky-session:connection') {
                return;
            }

            //Relay connexion to internal http server
            oc_notifier.master_debug('Relay connection from ' + o_conn.remoteAddress + ' on worker #' + ro_cluster.worker.id + '(PID #' + process.pid + ')');
            o_internal_server.emit('connection', o_conn);

            //Resume paused connection
            o_conn.resume();
        });
    }
};
/**
 * Give to server script an app_emitter which allow app to hearbeat, panic or exit
 * @returns {EventEmitter}
 */
Balancer.prototype.get_app_emitter = function(){
    if(ro_cluster.isWorker) {
        var self = this;

        var o_emitter = new EventEmitter();

        //Relay Worker to Master messages
        o_emitter.addListener('heartbeat', function(){
            self.heartbeat(ro_cluster.worker);
        });
        o_emitter.addListener('panic', function(){
            self.panic(ro_cluster.worker);
        });

        //Internal event
        o_emitter.addListener('exit', function(){

            //Exit at the end of event queue
            o_emitter.addListener('clear', function(){
                self.exit(ro_cluster.worker);
            });

            //Call all clear listener and exit
            o_emitter.emit('clear');
        });

        //Relay Master to Worker messages
        ro_cluster.worker.on('message', function(s_message){
            if(s_message !== 'exit') return;
            o_emitter.emit('exit');
        });

        return {
            on_clear:function(f_callback){
                o_emitter.addListener('clear', f_callback)
            },
            send_heartbeat:function(){
                o_emitter.emit('heartbeat');
            },
            send_panic:function(o_error){
                o_emitter.emit('panic', o_error);
            },
            send_exit:function(){
                o_emitter.emit('exit');
            }
        };
    }
};
/**
 * Heartbeat refresh worker timeout if any
 * If a worker timeout reach it's end, "exit" will be called on that worker
 * @param {Worker}o_worker
 */
Balancer.prototype.heartbeat = function(o_worker){
    if(ro_cluster.isWorker){
        oc_notifier.worker_debug('Worker #'+o_worker.id+' PID(#'+o_worker.process.pid+') send heartbeat to master');
        o_worker.send('heartbeat');
    } else {
        this.set_worker_timeout(o_worker);
    }
};
/**
 * Panic try to clear resources for you before killing worker process
 * Call panic mean your worker crash with undefined state
 * @params {Worker}o_worker, {Error}o_error
 */
Balancer.prototype.panic = function(o_worker, o_error){
    if(ro_cluster.isWorker){
        oc_notifier.worker_error('Worker #'+o_worker.id+' PID(#'+o_worker.process.pid+') send panic due to fatal error : ' + o_error.toString(), {error:o_error});
        if(o_worker.isConnected) {

            //Let master handle panic
            o_worker.send('panic');
        } else {
            process.exit(1);
        }
    } else {

        //Kill it
        o_worker.kill();
    }
};
/**
 * Exit close properly your app or worker
 * /!\ Calling exit function means you have to clear all resources on clear event
 * /!\ An "exited" worker will never re-spawn automatically but another worker may spawn on demand after this one was exited
 * @param {Worker}o_worker
 */
Balancer.prototype.exit = function(o_worker){
    if(ro_cluster.isWorker){
        oc_notifier.worker_debug('Worker #'+o_worker.id+' PID(#'+o_worker.process.pid+') send exit');
        if(o_worker.isConnected) {
            o_worker.disconnect();
        }
        process.exit(0);
    } else {

        //Tell worker to exit
        o_worker.send('exit');
    }
};

var o_balancer = new Balancer();
module.exports = {
    listen:o_balancer.listen.bind(o_balancer),
    bind_internal:o_balancer.bind_internal.bind(o_balancer),
    get_app_emitter:o_balancer.get_app_emitter.bind(o_balancer),
    ENGINE: Balancer.ENGINE
};
