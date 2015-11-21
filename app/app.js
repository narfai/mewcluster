'use strict';

//TODO implement in order : mithril views, requirejs loading, socket.io, grunt watchers & other conveniences, r.js
var HttpContent = require('./static/entity/HttpContent');
var m_q = require('q');
var m_merge = require('merge');

function TestingApp(){
    console.log('TestingApp loaded');
}
function get_static(s_path, h_context){
    var o_defer = m_q.defer();
    if(typeof h_context === 'undefined'){
        h_context = {};
    }
    var o_content;
    switch(s_path){
        case '/':
            o_content = new HttpContent('overlay.html.jade', m_merge(h_context, {content:'hello world', title:'hello world'}));
            o_content.set_engine(HttpContent.prototype.ENGINE.JADE);
            break;
        case 'loader.js':
            o_content = new HttpContent('loader.js', m_merge(h_context));
            break;
        default:
            o_content = new HttpContent('overlay.html.jade', m_merge(h_context, {content:'404 - Not found', title:'404 - Not found'}), 404);
            o_content.set_engine(HttpContent.prototype.ENGINE.JADE);
            break;
    }
    o_defer.resolve(o_content);
    return o_defer.promise;
}

module.exports = {
    get_static_content:get_static,
    load:function(){
        var o_app = new TestingApp();
    }
};