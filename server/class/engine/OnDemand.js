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

const ro_cluster = require('cluster');
const rf_merge = require('merge');

function OnDemandEngine(f_spawn, h_conf) {
    var self = this,
        h_default_conf = {
            max:50,
            respawn:false
        };

    self.spawn = f_spawn;
    self.conf = (typeof h_conf !== 'undefined')? rf_merge(h_default_conf, h_conf) : h_default_conf;

    self.worker_by_ip = {};
    self.count = 0;
}


OnDemandEngine.prototype.init = function(){

};

OnDemandEngine.prototype.get_worker = function(s_ip){
    var self = this;
    if(typeof self.worker_by_ip[s_ip] === 'undefined'){
        if(self.count < self.conf.max) {
            var o_worker = self.spawn(),
                i_worker_id = o_worker.id;

            self.count++;
            self.worker_by_ip[s_ip] = i_worker_id;

            o_worker.on('exit', function(o_worker){
                if(o_worker.suicide && (self.conf.respawn === true)) {
                    self.worker_by_ip[s_ip] = self.spawn();
                } else {
                    delete self.worker_by_ip[s_ip];
                    self.count--;
                }
            });
            return o_worker;
        } else {
            throw new Error('Too much workers');
        }
    } else {
        return ro_cluster.workers[self.worker_by_ip];
    }
};

module.exports = OnDemandEngine;
