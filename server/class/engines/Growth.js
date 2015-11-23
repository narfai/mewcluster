'use strict';
var m_cluster = require('cluster');

var ef_merge = require('merge');
function GrowthEngine(f_spawn, h_conf) {
    var self = this;
    self.worker_by_ip = {};
    var h_default_conf = {
        max:50,
        respawn:false,
        timeout:240
    };
    self.conf = (typeof h_conf !== 'undefined')? ef_merge(h_default_conf, h_conf) : h_default_conf;
    self.count = 0;
    self.spawn = f_spawn;
}

GrowthEngine.prototype.init = function(){

};
GrowthEngine.prototype.clear = function(){
    this.worker_by_ip = {};
    this.count = 0;
};

GrowthEngine.prototype.get_worker = function(s_ip){
    var self = this;
    if(typeof self.worker_by_ip[s_ip] === 'undefined'){
        if(self.count < self.conf.max) {
            var o_worker = self.spawn(),
                i_worker_id = o_worker.id;

            self.count++;
            self.worker_by_ip[s_ip] = i_worker_id;

            o_worker.on('exit', function () {
                if(self.conf.autorespawn) {
                    delete self.worker_by_ip[s_ip];
                } else {
                    self.worker_by_ip[s_ip] = self.spawn();
                }
            });
            return o_worker;
        } else {
            throw new Error('Too much workers');
        }
    } else {
        return m_cluster.workers[self.worker_by_ip];
    }
};

module.exports = GrowthEngine;