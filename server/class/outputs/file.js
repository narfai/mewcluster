var os = require('os');
var fs = require('fs');
var util = require('util');
var path = require('path');

const LOG_DIR = '../../logs/';

module.exports = function(s_name, s_target, s_message, h_data){
    var oc_date = new Date(),
        s_file_date = util.format('_%s_%s_%s', oc_date.getFullYear(), oc_date.getMonth()-1, oc_date.getDate()),
        s_file_name = util.format('%s%s%s.log', LOG_DIR, s_name.toLocaleLowerCase(), s_file_date),

        s_log_date = util.format('%s:%s:%s', oc_date.getHours(), oc_date.getMinutes(), oc_date.getSeconds()),
        s_log_line = util.format('[%s][%s][%s][%s]%s', s_log_date, s_target, s_message, util.inspect(h_data), os.EOL);
    fs.appendFile(path.resolve(__dirname, s_file_name), s_log_line, 'utf8');
};