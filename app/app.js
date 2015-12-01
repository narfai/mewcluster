'use strict';

//TODO implement in order : requirejs loading, socket.io, grunt watchers & other conveniences, r.js
var ro_q = require('q');
var rf_merge = require('merge');

function TestingApp(h_server){
    /*
     h_server.emitter {
        on_clear:function(f_callback)
        send_panic:function(s_message),
        send_heartbeat:function,
        send_exit:function,
     }
     var MyTestingAppNotifier = h_server.notifier_factory('app', function(OUTPUTS){
        return {
            info:[OUTPUTS.STDOUT],
            error:[OUTPUTS.FILE, OUTPUTS.STDERR],
            debug:[OUTPUTS.FILE, OUTPUTS.STDERR]
        };
     });
     MyTestingAppNotifier.info = function(s_message, h_data)
     MyTestingAppNotifier.error = function(s_message, h_data)
     MyTestingAppNotifier.debug = function(s_message, h_data)
     */
}
TestingApp.__proto__.get_static = function(s_path, h_context, Wrapper){//TODO create a real static router
    var o_defer = ro_q.defer();
    if(typeof h_context === 'undefined'){
        h_context = {};
    }
    var o_content;
    try {
        switch (s_path) {
            case '/':
                o_content = new Wrapper('overlay.html.jade', rf_merge(h_context, {
                    content: 'hello world',
                    title: 'hello world'
                }));
                o_content.set_engine(Wrapper.ENGINE.JADE);
                break;
            case '/loader.js':
                o_content = new Wrapper('loader.js', rf_merge(h_context), 'application/javascript');
                break;
            default:
                o_content = new Wrapper('overlay.html.jade', rf_merge(h_context, {
                    content: '404 - Not found',
                    title: '404 - Not found'
                }));
                o_content.set_engine(Wrapper.ENGINE.JADE);
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