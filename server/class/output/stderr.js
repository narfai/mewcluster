'use strict';

var ro_util = require('util');
var ro_os = require('os');

module.exports = function(s_name, s_target, s_message, h_data){
    var s_line = ro_util.format('%s::%s %s %s %s', s_name, s_target, s_message, Object.keys(h_data).length? ro_util.inspect(h_data): '', ro_os.EOL);
    process.stderr.write(s_line);
};