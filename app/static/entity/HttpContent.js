'use strict';

var m_fs = require('fs');
var m_jade = require('jade');
var m_q = require('q');
var m_path = require('path');

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
    JADE:2
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

HttpContent.prototype.render = function(){ //TODO make multi purpose renderer module
    var self = this;
    var s_content_path = m_path.resolve(__dirname, '../content/' + self.name);
    var o_defer = m_q.defer();
    m_fs.stat(s_content_path, function(err, stats){
        if(err){
            o_defer.reject(err);
        } else if(!stats.isFile()){
            o_defer.reject('Specified path is not a file');
        } else {
            if (self.engine === HttpContent.ENGINE.FS) {
                m_fs.readFile(s_content_path, self.encoding, function (err, data) {
                    if (err) {
                        o_defer.reject(err);
                    } else {
                        o_defer.resolve(data);
                    }
                });
            } else if (self.engine === HttpContent.ENGINE.JADE) {
                var f_compiled_content = m_jade.compileFile(s_content_path, {
                    cache:true
                });
                o_defer.resolve(f_compiled_content(self.context));
            } else {
                o_defer.reject('Invalid engine');
            }
        }
    });
    return o_defer.promise;
};

module.exports = HttpContent;