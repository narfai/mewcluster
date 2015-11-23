'use strict';

function RoundRobin(i_max, f_spawn) {
    var self = this;
    self.worker_pool = [];
    self.max = i_max;
    self.current = 0;
    self.spawn = f_spawn;
}
RoundRobin.prototype.init = function(){
    for(var i = 0; i < this.max; i++){
        this.worker_pool.push(this.spawn());
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