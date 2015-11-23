'use strict';
var m_cluster = require('cluster');

function GrowthEngine(i_max) {
    var self = this;
    self.worker_by_ip = {};
    self.max = i_max;
    self.count = 0;
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
            var o_worker = m_cluster.fork(),
                i_worker_id = o_worker.id;
            self.count++;
            console.log('Create new worker #', o_worker.process.pid);

            self.worker_by_ip[s_ip] = i_worker_id;
            o_worker.on('exit', function (o_worker, i_code, i_signal) {
                console.log('The worker #', i_worker_id, ' which handle ', s_ip, ' die');
                delete self.worker_by_ip[s_ip];
            });
            return o_worker;
        } else {
            throw new Error('Too much workers');
        }
    } else {
        console.log('Giving request from ', s_ip, ' to living worker #', h_worker_ips[s_ip]);
        return m_cluster.workers[self.worker_by_ip];
    }
};

module.exports = GrowthEngine;