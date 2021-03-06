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

var ro_os = require('os');
var ro_fs = require('fs');
var ro_util = require('util');
var ro_path = require('path');

const LOG_DIR = '../../logs/';

module.exports = function(s_name, s_target, s_message, h_data){
    var oc_date = new Date(),
        s_file_date = ro_util.format('_%s_%s_%s', oc_date.getFullYear(), oc_date.getMonth()-1, oc_date.getDate()),
        s_file_name = ro_util.format('%s%s%s.log', LOG_DIR, s_name.toLocaleLowerCase(), s_file_date),

        s_log_date = ro_util.format('%s:%s:%s', oc_date.getHours(), oc_date.getMinutes(), oc_date.getSeconds()),
        s_log_line = ro_util.format('[%s][%s][%s][%s]%s', s_log_date, s_target, s_message, Object.keys(h_data).length? ro_util.inspect(h_data): '', ro_os.EOL);
    ro_fs.appendFile(ro_path.resolve(__dirname, s_file_name), s_log_line, 'utf8');
};
