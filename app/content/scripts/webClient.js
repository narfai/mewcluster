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

define(['io', 'configs/redrawInitScript'], function (io, ehInitScript) {
	function WebClient() {
		var self = this;
		self.socket = io();
		self.addSocketEvent('redraw', redrawPage);
		self.addSocketEvent('redrawId', redrawById);
	}

	function redrawPage(packetData) {
		console.log(packetData);
		document.body.innerHTML = packetData.value;
		ehInitScript[packetData.initScript](this);
	}

	function redrawById(packetData) {
		var elem = document.getElementById(packetData.id);
		elem.innerHTML = packetData.value;
	}

	WebClient.prototype.addSocketEvent = function (type, callback) {
		this.socket.on(type, callback);
	};

	WebClient.prototype.emit = function (type, data) {
		this.socket.emit(type, data);
	};
	return new WebClient();
});
