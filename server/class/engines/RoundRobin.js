'use strict';

var ef_merge = require('merge');

function RoundRobin(f_spawn, h_conf) {
    var self = this;
    self.worker_pool = [];
    var h_default_conf = {
        max:5,
        respawn:true,
        timeout:false//TODO
    };
    self.conf = (typeof h_conf !== 'undefined')? ef_merge(h_default_conf, h_conf) : h_default_conf;
    self.current = 0;
    self.spawn = f_spawn;
}
RoundRobin.prototype._spawn = function(i_index){
    var self = this,
        o_worker = this.spawn();
    this.worker_pool[i_index] = o_worker;
    o_worker.on('exit', function(o_worker, i_code, s_status){
        if(self.respawn) {
            self.spawn(i_index);
        }
    });
};
RoundRobin.prototype.init = function(){
    for(var i = 0; i < this.conf.max; i++){
        this._spawn(i);
    }
};
RoundRobin.prototype.clear = function(){
    this.worker_pool = [];
    this.current = 0;
};
RoundRobin.prototype.get_worker = function(s_ip){
    if(this.current === this.conf.max ){
        this.current = 0;
    }
    var index = this.current;
    this.current++;
    return this.worker_pool[index];
};

module.exports = RoundRobin;