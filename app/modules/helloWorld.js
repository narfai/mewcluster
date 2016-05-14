/*
 * Copyright 2016 Kevin de Carvalho
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define(['proto', 'modules/AModules'], function(Proto, AModules) {
	var HelloWorld = Proto(AModules, function(superclass){
		this.name = 'HelloWorld';
		this.init = function (o_client, o_server){
			superclass.init.call(this, o_client, o_server);
			//init module data here
			this.s_toDisplay = "Hello world!"
		};

		this.socketExec = function(){
			//emit a message to all connected client
			this.o_server.emit('message', 'someone have load helloworld');
			//emit a message to the related client
			this.o_client.emit('redrawId', {id: "hello", value:this.s_toDisplay});
			//this.o_client.broadcast.emit(...) to send to all client execpt related one to o_client
		};

		this.pageExec = function(){
			this.o_server.emit('message', 'someone have load helloworld');
			return this.s_toDisplay;
		};
	});
	
	return HelloWorld;
});
