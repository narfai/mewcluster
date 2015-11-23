'use strict';

var m_cluster = require('cluster');

function RoundRobin(i_max) {
    var self = this;
    self.worker_pool = [];
    self.max = i_max;
    self.current = 0;
}
RoundRobin.prototype.init = function(){
    for(var i = 0; i < this.max; i++){
        this.worker_pool.push(m_cluster.fork());
    }
};
RoundRobin.prototype.clear = function(){
    this.worker_pool = [];
    this.current = 0;
};
RoundRobin.prototype.get_worker = function(s_ip){
    if(this.current === this.max ){
        this.current = 0;
    }
    var index = this.current;
    this.current++;
    return this.worker_pool[index];
};

module.exports = RoundRobin;