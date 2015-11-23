'use strict';

var m_cluster = require('cluster');
var m_net = require('net');

function Balancer(i_engine, i_max){ //TODO log
    var self = this;
    self.max = (typeof i_max === 'undefined')? 100 : i_max;
    self.engine = self.load_engine(i_engine);

    self.server_init = function(){ console.log('empty server init on pid #'+process.pid); };
}
Balancer.__proto__.ENGINE = {
    GROWTH : 1,
    SINGLE : 2,
    ROUNDROBIN : 3,
    IPHASH : 4
};

Balancer.prototype.set_server = function(f_server_init){
    this.server_init = f_server_init;
};
Balancer.prototype.stop = function(){};
Balancer.prototype.start = function(){};
Balancer.prototype.restart = function(){};
Balancer.prototype.kill = function(){};
Balancer.prototype.scale = function(){};
Balancer.prototype.load_engine = function(i_engine){
    var Engine;
    switch(i_engine){
        case Balancer.ENGINE.GROWTH :
            Engine = require('./engines/Growth.js');
            break;
        case Balancer.ENGINE.SINGLE :
            Engine = require('./engines/Single.js');
            break;
        case Balancer.ENGINE.ROUNDROBIN :
            Engine = require('./engines/RoundRobin.js');
            break;
        case Balancer.ENGINE.IPHASH :
            Engine = require('./engines/IpHash.js');
            break;
        default:
            throw new Error('Invalid engine : ', i_engine);
    }
    return new Engine(this.max);
};
Balancer.prototype.listen = function(i_port){
    var self = this;

    if (m_cluster.isMaster) {
        self.engine.init();

        //Create front proxy server
        m_net.createServer({pauseOnConnect: true}, function (o_conn) {
            console.log('Balancer : Get front request from ', o_conn.remoteAddress);
            var o_worker = self.engine.get_worker(o_conn.remoteAddress);
            o_worker.send('sticky-session:connection', o_conn)
        }).listen(i_port);
    } else {
        var o_internal_server = this.server_init();

        //Relay connexion to internal http server
        process.on('message', function(s_msg, o_conn){
            if (s_msg !== 'sticky-session:connection') {
                return;
            }
            o_internal_server.emit('connection', o_conn);
            o_conn.resume();
        });
    }
};
module.exports = {
    createServer: function(i_engine, i_max){
        var o_balancer = new Balancer(i_engine, i_max);

        return {
            set_server:o_balancer.set_server.bind(o_balancer),
            listen:o_balancer.listen.bind(o_balancer),
            start:o_balancer.start.bind(o_balancer),
            stop:o_balancer.stop.bind(o_balancer),
            restart:o_balancer.restart.bind(o_balancer),
            kill:o_balancer.kill.bind(o_balancer),
            scale:o_balancer.scale.bind(o_balancer)
        };
    },
    ENGINE: Balancer.ENGINE
};