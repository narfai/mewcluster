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

requirejs.config({
	nodeRequire: require,
	paths: {
		//proto: '/proto/dist/proto.umd.js',
		io: 'socket.io/socket.io'
	}
});

requirejs(['webClient'], function (eh_WebClient) {
	//adding some event to our app
	eh_WebClient.addSocketEvent('message', function(data){
		console.log(data);
	});
	eh_WebClient.addSocketEvent('connected', function(){
		eh_WebClient.emit('pages', {name:"home"});
		document.getElementById('loadingScreen').classList.add('hide');
		document.body.classList.remove('isLoading');
	});
	//start asking thing to server by saying him "hello"
	eh_WebClient.emit('hello', true);
});

