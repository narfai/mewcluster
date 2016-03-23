'use strict';

/* Copyright 2016 François Cadeillan

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/

//TODO implement in order : requirejs loading, socket.io, grunt watchers & other conveniences, r.js
var ro_q = require('q');
var rf_merge = require('merge');

function TestingApp(h_server){
  var MyTestingAppNotifier = h_server.notifier_factory('app', function(OUTPUTS){
     return {
         info:[OUTPUTS.STDOUT],
    /*     error:[OUTPUTS.FILE, OUTPUTS.STDERR],
         debug:[OUTPUTS.FILE, OUTPUTS.STDERR]*/
     };
  });
    h_server.io.on('connection', function(socket){
      MyTestingAppNotifier.info('a user connected');
      socket.on('message', function(msg){
        console.log('message: ' + msg);
        io.emit('message', 'coin');
      });
      socket.on('disconnect', function(){
          MyTestingAppNotifier.info('a user disconnected');
      });
    });
    /*
     h_server.emitter {
        on_clear:function(f_callback)
        send_panic:function(s_message),
        send_heartbeat:function,
        send_exit:function,
     }

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
