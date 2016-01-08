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

function IpHashEngine(f_spawn, h_conf) {
    var self = this,
        h_default_conf = {
            max:5,
            respawn:true
        };

    self.spawn = f_spawn;
    self.conf = (typeof h_conf !== 'undefined')? rf_merge(h_default_conf, h_conf) : h_default_conf;

    self.worker_pool = [];
}

IpHashEngine.prototype._spawn = function(i_index){
    var self = this,
        o_worker = this.spawn();

    o_worker.on('exit', function(o_worker){
        if(o_worker.suicide && (self.conf.respawn === true)) {
            self._spawn(i_index);
        } else {
            self.worker_pool.slice(i_index, 1);
        }
    });

    self.worker_pool[i_index] = o_worker;
    return o_worker;
};
IpHashEngine.prototype.init = function(){
    for(var i = 0; i < this.conf.max; i++){
        this._spawn(i);
    }
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
    console.log('give worker ',i_index, this.worker_pool[i_index].isDead());

    if(typeof this.worker_pool[i_index] === 'undefined' || this.worker_pool[i_index].isDead()){
        return this._spawn(i_index);
    }
    if(!this.worker_pool[i_index].isConnected()){
        throw new Error('Worker #'+this.worker_pool[i_index].id+' is disconnected');
    }
    return this.worker_pool[i_index];
};

module.exports = IpHashEngine;
