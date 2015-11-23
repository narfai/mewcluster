'use strict';

var ef_merge = require('merge');

function IpHashEngine(f_spawn, h_conf) {
    var self = this;
    self.worker_pool = [];
    var h_default_conf = {
        max:5,
        respawn:true,//TODO
        timeout:0//TODO
    };
    self.conf = (typeof h_conf !== 'undefined')? ef_merge(h_default_conf, h_conf) : h_default_conf;
    self.spawn = f_spawn;
}

IpHashEngine.prototype._spawn = function(i_index){
    var self = this;
    self.worker_pool[i_index] = this.spawn();
    //TODO respawn & timout

};
IpHashEngine.prototype.init = function(){
    for(var i = 0; i < this.conf.max; i++){
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
    var i_index = Number(s) % this.conf.max;

    return this.worker_pool[i_index];
};

module.exports = IpHashEngine;