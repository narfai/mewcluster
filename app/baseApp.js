/*
 * Copyright 2016 Kevin de Carvalho
 * Copyright 2016 François Cadeillan
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

var requirejs = require('requirejs');

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define(['q', './configs/webSocketProtocol', './configs/supportedMimeType', 'merge', 'path', 'fs'], function (ro_q, o_protocol, o_type, rf_merge, eh_path, fs) {
	function BaseApp(h_server, onConnectCallback) {
		var self = this;
		self.appNotifier = h_server.notifier_factory('app', function (OUTPUTS) {
			return {
				info: [OUTPUTS.STDOUT],
				error:[OUTPUTS.FILE, OUTPUTS.STDERR],
				debug:[OUTPUTS.FILE, OUTPUTS.STDERR]
			};
		});
		self.h_server = h_server;
		//base socket event
		self.h_server.io.on('connection', function (socket) {
			socket.on('hello', function(data){
				socket.emit('connected', true);
			});
			socket.on('pages', function(data){
				if (data.name in o_protocol['availablePage']) {
					var o_page = (requirejs(o_protocol['availablePage'][data.name]))(socket, self.h_server.io);
				}
			});
			socket.on('modules', function (data) {
				if (data.name in o_protocol['availableModules']) {
					var o_module = (requirejs(o_protocol['availableModules'][data.name]))(socket, self.h_server.io);
					o_module.socketExec();
				}
			});
			socket.on('disconnect', function () {
				self.appNotifier.info('a user disconnected');
			});
			//if a callback is given to exetend socket event
			if(onConnectCallback instanceof Function){
				onConnectCallback(socket);
			}
		});
	}

	//helper function handles path variable remplacement
	function pathReplaceVariable(s_path, h_vars){
		for (var key in h_vars){
			if (h_vars.hasOwnProperty(key))
				s_path = s_path.replace('{{'+key+'}}', h_vars[key]);
		}
		return s_path;
	}

	//helper function handles file verification
	function getFile(filename, extension){
		var i_error = 0;
		var s_return = '';
		if (extension == '')
			return false;
		//does the requested file exist in related path?
		o_type[extension].paths.forEach(function(s_path){
			s_path = pathReplaceVariable(s_path, { templateName: "template1"});
			var s_full_path = __dirname+'/content'+s_path;
			try {
				var o_stat = fs.statSync(s_full_path + filename);
				s_return = s_path + filename;
			}
			catch (err){
				i_error+=1;
			}
		});
		if (i_error == o_type[extension].paths.length)
			throw new Error(filename+': file not found');
		return s_return;
		//throw an error if file not exist or if don't have permission to access this one
	}

	BaseApp.__proto__.get_static = function (s_path, h_context, Wrapper) {//TODO create a real static router
		var o_defer = ro_q.defer();
		if (typeof h_context === 'undefined') {
			h_context = {};
		}
		var o_content;
		//does a file got required??
		var fileName = eh_path.basename(s_path) || '/';
		//get file ext (or "" if there is no extension or no real file pointed by fileName)
		var ext = eh_path.extname(fileName);
		//trying to load an non-handled file type
		if(fileName != '/' && !o_type[ext]){
			o_content = new Wrapper('overlay.html.jade', rf_merge(h_context, {
				content: '404 - Not found',
				title: '404 - Not found'
			}));
			o_content.set_engine(Wrapper.ENGINE.JADE);
			o_content.set_code(404);
			o_defer.resolve(o_content);
		}
		else {
			//try to load asst file
			try{
				var filePath;
				if ((filePath = getFile(s_path, ext)) != false){
					o_content = new Wrapper(filePath, rf_merge(h_context), o_type[ext].mime);
					o_defer.resolve(o_content);
				}
			}
			catch (err){
				console.log("error file not exist", err);
				o_content = new Wrapper('overlay.html.jade', rf_merge(h_context, {
					content: '404 - Not found',
					title: '404 - Not found'
				}));
				o_content.set_engine(Wrapper.ENGINE.JADE);
				o_content.set_code(404);
				o_defer.resolve(o_content);
			}

		}
		try {
			//load static app page
			switch (s_path) {
				case '/':
					o_content = new Wrapper('templates/template1/home.tpl', rf_merge(h_context, {config:{title:"Test"}}));
					o_content.set_engine(Wrapper.ENGINE.HOGAN);
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
		} catch (o_err) {
			o_defer.reject(o_err);
		}

		return o_defer.promise;
	};
	return BaseApp;
});
