'use strict';

function IpHashEngine(i_max, f_spawn) {
    var self = this;
    self.worker_pool = [];
    self.max = i_max;
    self.spawn = f_spawn;
}

IpHashEngine.prototype._spawn = function(i_index){
    var self = this;
    self.worker_pool[i_index] = this.spawn();

};
IpHashEngine.prototype.init = function(){
    for(var i = 0; i < this.max; i++){
        this._spawn(i);
    }
};
IpHashEngine.prototype.clear = function(){
    this.worker_pool = {};
    this.count = 0;
};

function remove_ipv6(s_ip){
    var a_match = s_ip.match(/\d+$/);
    if(typeof a_match[0] === 'undefined'){
        throw new Error('Invalid ip', s_ip);
    }
    return a_match[0];
}

IpHashEngine.prototype.get_worker = function(s_ip){
    var s = '';
    for (var i = 0, _len = s_ip.length; i < _len; i++) {
        if (s_ip[i] !== '.') {
            s += s_ip[i];
        }
    }
    s = remove_ipv6(s);
    var i_index = Number(s) % this.max;

    return this.worker_pool[i_index];
};

module.exports = IpHashEngine;