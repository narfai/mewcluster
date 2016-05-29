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

var ro_fs = require('fs');
var ro_jade = require('jade');
var ro_hogan = require('hogan');
var ro_q = require('q');
var ro_path = require('path');

function HttpContent(s_name, h_context, s_type){
    var self = this;
    self.context = h_context;
    self.name = s_name;

    self.code = 200;
    self.encoding = 'utf8';
    self.engine = HttpContent.ENGINE.FS;

    self.type = (typeof s_type === 'undefined')? 'text/html' : s_type;
}

//Engine static definition
HttpContent.__proto__.ENGINE = {
    FS:1,
    JADE:2,
    HOGAN:3
};

HttpContent.prototype.set_engine = function(i_engine){
    this.engine = i_engine;
};
HttpContent.prototype.set_code = function(i_code){
    this.code = i_code;
};
HttpContent.prototype.set_encoding = function(s_encoding){
    this.encoding = s_encoding;
};
HttpContent.prototype.get_code = function(){
    return this.code;
};
HttpContent.prototype.get_type = function(){
    return this.type;
};

HttpContent.prototype.render = function(s_content_dir){ //TODO make multi purpose renderer module
    var self = this;
    var s_content_path = ro_path.resolve(__dirname + '/../../../' + s_content_dir + '/' + self.name);
    var o_defer = ro_q.defer();
    ro_fs.stat(s_content_path, function(err, stats){
        if(err){
            o_defer.reject(err);
        } else if(!stats.isFile()){
            o_defer.reject('Specified path is not a file');
        } else {
            if (self.engine === HttpContent.ENGINE.FS) {
                ro_fs.readFile(s_content_path, function (err, data) {
                    if (err) {
                        o_defer.reject(err);
                    } else {
                        o_defer.resolve(data);
                    }
                });
            } else if (self.engine === HttpContent.ENGINE.JADE) {
                var f_compiled_content = ro_jade.compileFile(s_content_path, {
                    cache:true
                });
                o_defer.resolve(f_compiled_content(self.context));
            } else if (self.engine === HttpContent.ENGINE.HOGAN) {
                ro_fs.readFile(s_content_path, self.encoding, function (err, data) {
                    if (err) {
                        o_defer.reject(err);
                    } else {
                        var o_compiled_content = ro_hogan.compile(data);
                        o_defer.resolve(o_compiled_content.render(self.context));
                    }
                });
            } else {
                o_defer.reject('Invalid engine');
            }
        }
    });
    return o_defer.promise;
};

module.exports = HttpContent;
