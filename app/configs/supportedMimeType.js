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
define(function() {
	return {
		".html": {
			"mime": "text/html",
			"paths": ["/templates/{{templateName}}/"]
		},
		".css": {
			"mime": "text/css",
			"paths": ["/templates/{{templateName}}/css/"]
		},
		".js": {
			"mime": "application/javascript",
			"paths": ["/templates/{{templateName}}/scripts/", "/scripts/", "../node_modules/"]
		},
		".png": {
			"mime": "image/png",
			"paths": ["/templates/{{templateName}}/images/", "/images/"]
		},
		".gif": {
			"mime": "image/gif",
			"paths": ["/templates/{{templateName}}/images/", "/images/"]
		},
		".jpg": {
			"mime": "image/jpeg",
			"paths": ["/templates/{{templateName}}/images/", "/images/"]
		}
	};
});
