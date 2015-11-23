'use strict';

function SingleEngine(i_max, f_spawn) {
    var self = this;
    self.worker = false;
    self.spawn = f_spawn;
}
SingleEngine.prototype._spawn = function(){
    var self = this,
        o_worker = self.spawn();
    o_worker.on('exit', function(o_worker, i_code, s_status){
        self.worker = false;
    });
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