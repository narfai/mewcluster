'use strict';

/*Copyright 2016 François Cadeillan

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/

var rf_merge = require('merge');

function SingleEngine(f_spawn, h_conf) {
    var self = this,
        h_default_conf = {
            max:0,
            respawn:true
        };

    self.spawn = f_spawn;
    self.conf = (typeof h_conf !== 'undefined')? rf_merge(h_default_conf, h_conf) : h_default_conf;

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
