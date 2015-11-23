'use strict';
var m_cluster = require('cluster');

function GrowthEngine(i_max, f_spawn) {
    var self = this;
    self.worker_by_ip = {};
    self.max = i_max;
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
        if(self.count < self.max) {
            var o_worker = self.spawn(),
                i_worker_id = o_worker.id;

            self.count++;
            self.worker_by_ip[s_ip] = i_worker_id;

            o_worker.on('exit', function () {
                delete self.worker_by_ip[s_ip];
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