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

'use strict';

var requirejs = require('requirejs');

requirejs.config({
	nodeRequire: require,
	baseUrl: __dirname,
	paths: {
		proto: 'proto.umd.js'
	}
});

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define(['proto', './baseApp'], function (Proto, ehBassApp) {
	var MoofeeApp = Proto(ehBassApp, function(superclass){
		this.name = 'MoofeeApp';
		this.init = function (h_server) {
			superclass.call(this, h_server, function(socket){
				//socket protocol extention here
			});
		};
	});
	
	return MoofeeApp;
});
