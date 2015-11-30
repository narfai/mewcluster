'use strict';

var ef_merge = require('merge');

function SingleEngine(f_spawn, h_conf) {
    var self = this,
        h_default_conf = {
            max:0,
            respawn:true
        };

    self.spawn = f_spawn;
    self.conf = (typeof h_conf !== 'undefined')? ef_merge(h_default_conf, h_conf) : h_default_conf;

    self.worker = false;
}
SingleEngine.prototype._spawn = function(){
    var self = this,
        o_worker = self.spawn();

    o_worker.on('exit', function(o_worker){
        if(o_worker.suicide && (self.conf.respawn === true)) {
            self.worker = self._spawn();
        } else {
            self.worker = false;
        }
    });

    return o_worker;
};
SingleEngine.prototype.init = function(){
    this.worker = this._spawn();
};
SingleEngine.prototype.get_worker = function(s_ip){
    if(!this.worker || this.worker.isDead()){
        this.worker = this._spawn();
    }
    if(!this.worker.isConnected()){
        throw new Error('Worker #'+this.worker.id+' is disconnected !');
    }
    return this.worker;
};

module.exports = SingleEngine;