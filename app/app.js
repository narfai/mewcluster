'use strict';
/*
Naming convention

Primitive :
s : string
i : float
f : function
ff : higher-order function
b : bool

Objects :
o : object
h : simple hash object
a : simple array object
op : promise object
oc : object created by new()
oi : interface object

Extend :
<O><P> : O as object def, P as primitive def, ex : "as_" is an array object which handle mainly strings
e<D> : D as any prefix, vars loaded by "require"

Class : camelcase
*/
//TODO implement in order : requirejs loading, socket.io, grunt watchers & other conveniences, r.js
var HttpContent = require('./static/entity/HttpContent');
var m_q = require('q');
var m_merge = require('merge');
var m_redis = require('redis');

function TestingApp(){
    console.log('TestingApp loaded on worker #'+process.pid);
}
var get_static = function(s_path, h_context){//TODO create a real static router
    var o_defer = m_q.defer();
    if(typeof h_context === 'undefined'){
        h_context = {};
    }
    var o_content;
    switch(s_path){
        case '/':
            o_content = new HttpContent('overlay.html.jade', m_merge(h_context, {content:'hello world', title:'hello world'}));
            o_content.set_engine(HttpContent.ENGINE.JADE);
            break;
        case '/loader.js':
            o_content = new HttpContent('loader.js', m_merge(h_context), 'application/javascript');
            break;
        default:
            o_content = new HttpContent('overlay.html.jade', m_merge(h_context, {content:'404 - Not found', title:'404 - Not found'}));
            o_content.set_engine(HttpContent.ENGINE.JADE);
            o_content.set_code(404);
            break;
    }
    o_defer.resolve(o_content);
    return o_defer.promise;
};
//console.log(process.env);
//var s_redis_ip = process.env.REDIS_PORT_6379_TCP_ADDR;
//var i_redis_port = process.env.REDIS_PORT_6379_TCP_PORT;
//
//var o_redis_client = m_redis.createClient(i_redis_port, s_redis_ip);
//
//o_redis_client.on('error', function(s_err){
//    console.log('Redis['+s_redis_ip+':'+i_redis_port+'] error : ' + s_err);
//});

module.exports = {
    get_static : get_static,
    init:function(o_io){

    }
};