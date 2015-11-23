var util = require('util');
var os = require('os');

module.exports = function(s_name, s_target, s_message, h_data){
    var s_line = util.format('%s::%s %s %s %s', s_name, s_target, s_message, util.inspect(h_data), os.EOL);
    process.stderr.write(s_line);
};