'use strict';

const ro_cluster = require('cluster');
const rf_merge = require('merge');

function OnDemandEngine(f_spawn, h_conf) {
    var self = this,
        h_default_conf = {
            max:50,
            respawn:false
        };

    self.spawn = f_spawn;
    self.conf = (typeof h_conf !== 'undefined')? rf_merge(h_default_conf, h_conf) : h_default_conf;

    self.worker_by_ip = {};
    self.count = 0;
}


OnDemandEngine.prototype.init = function(){

};

OnDemandEngine.prototype.get_worker = function(s_ip){
    var self = this;
    if(typeof self.worker_by_ip[s_ip] === 'undefined'){
        if(self.count < self.conf.max) {
            var o_worker = self.spawn(),
                i_worker_id = o_worker.id;

            self.count++;
            self.worker_by_ip[s_ip] = i_worker_id;

            o_worker.on('exit', function(o_worker){
                if(o_worker.suicide && (self.conf.respawn === true)) {
                    self.worker_by_ip[s_ip] = self.spawn();
                } else {
                    delete self.worker_by_ip[s_ip];
                    self.count--;
                }
            });
            return o_worker;
        } else {
            throw new Error('Too much workers');
        }
    } else {
        return ro_cluster.workers[self.worker_by_ip];
    }
};

module.exports = OnDemandEngine;