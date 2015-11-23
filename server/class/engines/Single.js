'use strict';

var m_cluster = require('cluster');

function SingleEngine(i_max) {
    var self = this;
    self.worker = false;
}
SingleEngine.prototype.init = function(){
    this.worker = m_cluster.fork();
};
SingleEngine.prototype.clear = function(){
    this.worker = false;
};
SingleEngine.prototype.get_worker = function(s_ip){
    if(!this.worker){
        this.worker = m_cluster.fork();
    } else {
        return this.worker;
    }
};

module.exports = SingleEngine;