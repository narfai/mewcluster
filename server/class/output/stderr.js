'use strict';

/*Copyright 2016 François Cadeillan

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/

var ro_util = require('util');
var ro_os = require('os');

module.exports = function(s_name, s_target, s_message, h_data){
    var s_line = ro_util.format('%s::%s %s %s %s', s_name, s_target, s_message, Object.keys(h_data).length? ro_util.inspect(h_data): '', ro_os.EOL);
    process.stderr.write(s_line);
};
