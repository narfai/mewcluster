'use strict';
/*
Variables naming convention



Class : camelcase
*/
//TODO implement in order : requirejs loading, socket.io, grunt watchers & other conveniences, r.js
var HttpContent = require('./static/entity/HttpContent');
var ro_q = require('q');
var rf_merge = require('merge');

function TestingApp(o_server_events, oc_notifier){
    //setInterval(function(){
    //    oc_notifier.debug('App heartbeat');
    //    o_server_events.send_heartbeat();
    //}, 1500);
}
TestingApp.__proto__.get_static = function(s_path, h_context){//TODO create a real static router
    var o_defer = ro_q.defer();
    if(typeof h_context === 'undefined'){
        h_context = {};
    }
    var o_content;
    try {
        switch (s_path) {
            case '/':
                o_content = new HttpContent('overlay.html.jade', rf_merge(h_context, {
                    content: 'hello world',
                    title: 'hello world'
                }));
                o_content.set_engine(HttpContent.ENGINE.JADE);
                break;
            case '/loader.js':
                o_content = new HttpContent('loader.js', rf_merge(h_context), 'application/javascript');
                break;
            default:
                o_content = new HttpContent('overlay.html.jade', rf_merge(h_context, {
                    content: 'Oh nooooon ! 404 - Not found',
                    title: '404 - Not found'
                }));
                o_content.set_engine(HttpContent.ENGINE.JADE);
                o_content.set_code(404);
                break;
        }
        o_defer.resolve(o_content);
    } catch(o_err){
        o_defer.reject(o_err);
    }

    return o_defer.promise;
};

module.exports = TestingApp;