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

define(['proto', 'pages/APages', 'modules/helloWorld'], function(Proto, APages, ehHelloWorld) {
	var Home = Proto(APages, function (superclass){
		this.name = 'admin/Home';
		this.init = function(o_client, o_server){
			superclass.init.call(this, o_client, o_server);
			o_hello = new ehHelloWorld(o_client, o_server);
			this.o_client.emit('redraw', {
				value:"<b id='hello'>"+o_hello.pageExec()+"<br />dynamicly load in page admin/Home</b><br /><a href='#' id='ask'>click here to ask</a>",
				initScript: "fadminhome"
			});
		};
	});

	return Home;
});
