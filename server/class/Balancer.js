'use strict';

var m_cluster = require('cluster');
var m_net = require('net');
var oc_notifier = require('./Notifier')('balancer', function(OUTPUTS){
    return {
        error:[OUTPUTS.FILE, OUTPUTS.STDERR],
        worker:[OUTPUTS.STDOUT, OUTPUTS.EVENT],
        info:[OUTPUTS.FILE,OUTPUTS.STDOUT],
        front:[OUTPUTS.FILE,OUTPUTS.STDOUT],
        internal:[OUTPUTS.FILE,OUTPUTS.STDOUT]
    };
});
//oc_notifier.add_filter('front', function(s_message, h_data){
//    console.log('filter debug', s_message, h_data);
//    h_data = {};
//    return [s_message, h_data];
//});
function Balancer(){
    var self = this;
}
Balancer.__proto__.ENGINE = {
    GROWTH : 1,
    SINGLE : 2,
    ROUNDROBIN : 3,
    IPHASH : 4
};

Balancer.prototype.spawn = function(){
    var self = this,
        o_worker = m_cluster.fork(),
        i_worker_id = o_worker.id;

    oc_notifier.worker('Spawn #'+o_worker.id+'(PID : #'+o_worker.process.pid+')');

    o_worker.on('exit', function(o_worker, i_code, s_signal){
        oc_notifier.worker('#'+i_worker_id+' die with signal');
    });

    return o_worker;
};
/**
 *
 * @param i_engine
 * @param h_engine_conf ({max:0, auto})
 */
Balancer.prototype.load_engine = function(i_engine, h_engine_conf){
    console.log(i_engine);
    var Engine;
    switch(i_engine){
        case Balancer.ENGINE.GROWTH :
            Engine = require('./engines/Growth.js');
            oc_notifier.info('Load GROWTH engine', {'code':Balancer.ENGINE.GROWTH});
            break;
        case Balancer.ENGINE.SINGLE :
            Engine = require('./engines/Single.js');
            oc_notifier.info('Load SINGLE engine', {'code':Balancer.ENGINE.SINGLE});
            break;
        case Balancer.ENGINE.ROUNDROBIN :
            Engine = require('./engines/RoundRobin.js');
            oc_notifier.info('Load ROUNDROBIN engine', {'code':Balancer.ENGINE.ROUNDROBIN});
            break;
        case Balancer.ENGINE.IPHASH :
            Engine = require('./engines/IpHash.js');
            oc_notifier.info('Load IPHASH engine', {'code':Balancer.ENGINE.IPHASH});
            break;
        default:
            throw new Error('Invalid engine : '+i_engine);
    }
    this.engine = new Engine(Balancer.prototype.spawn.bind(this), h_engine_conf);
};
Balancer.prototype.listen = function(i_port){
    var self = this;

    this.engine.init();

    oc_notifier.info('Start front server on port '+i_port);

    //Create front proxy server
    var o_front_server = m_net.createServer(/*{pauseOnConnect: true},*/ function (o_conn) {
        var o_worker = self.engine.get_worker(o_conn.remoteAddress);
        o_worker.send('sticky-session:connection', o_conn);
        oc_notifier.front('Send connection from '+o_conn.remoteAddress+' to worker #'+o_worker.id+' (PID #'+o_worker.process.pid+')');
    });

    o_front_server.on('error', function(o_error){
        oc_notifier.front('Error :'+o_error.toString(), {'err':o_error});
    });

    o_front_server.listen(i_port);
};
Balancer.prototype.bind_internal = function(o_internal_server){
    oc_notifier.internal('Start internal server on worker #'+m_cluster.worker.id+' (PID #'+process.pid+')');

    if(!(o_internal_server instanceof m_net.Server ) ){
        throw new Error('Invalid server');
    }

    o_internal_server.on('error', function(o_error){
        oc_notifier.internal('Error :'+o_error.toString(), {'err':o_error});
    });

    //Relay connexion to internal http server
    process.on('message', function(s_msg, o_conn){
        if (s_msg !== 'sticky-session:connection') {
            return;
        }

        oc_notifier.internal('Relay connection from '+o_conn.remoteAddress+' on worker #'+m_cluster.worker.id+'(PID #'+process.pid+')');
        o_internal_server.emit('connection', o_conn);

        o_conn.resume();
    });
};
var o_balancer = new Balancer();
module.exports = {
    load_engine:o_balancer.load_engine.bind(o_balancer),
    listen:o_balancer.listen.bind(o_balancer),
    bind_internal:o_balancer.bind_internal.bind(o_balancer),
    ENGINE: Balancer.ENGINE
};