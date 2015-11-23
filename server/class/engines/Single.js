'use strict';

var ef_merge = require('merge');

function SingleEngine(f_spawn, h_conf) {
    var self = this;
    self.worker = false;
    var h_default_conf = {
        max:0,
        respawn:true,//TODO
        timeout:0//TODO
    };
    self.conf = (typeof h_conf !== 'undefined')? ef_merge(h_default_conf, h_conf) : h_default_conf;
    self.spawn = f_spawn;
}
SingleEngine.prototype._spawn = function(){
    var self = this,
        o_worker = self.spawn();
    o_worker.on('exit', function(o_worker, i_code, s_status){
        self.worker = false;
    });
    return o_worker;
};
SingleEngine.prototype.init = function(){
    this.worker = this._spawn();
};
SingleEngine.prototype.clear = function(){
    this.worker = false;
};
SingleEngine.prototype.get_worker = function(s_ip){
    if(!this.worker){
        this.worker = this._spawn();
    } else {
        return this.worker;
    }
};

module.exports = SingleEngine;