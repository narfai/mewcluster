'use strict';

const util = require('util');
const EventEmitter = require('events');

function Notifier(s_name, h_targets){
    EventEmitter.call(this);
    this.name = s_name;
    this.targets = h_targets;
    this.filters = {};
}
util.inherits(Notifier, EventEmitter);

Notifier.__proto__.OUTPUT = {
    FILE : 1,
    STDOUT : 2,
    STDERR : 3,
    EVENT : 4
};

function apply_filters(af_filters, s_message, h_data){
    for(var i = 0; i < af_filters.length; i++){
        var a_tuple = af_filters[i](s_message, h_data);
        s_message = a_tuple[0];
        h_data = a_tuple[1];
    }
    return [s_message, h_data];
}
Notifier.prototype.notify = function(s_target, s_message, h_data){
    if(typeof h_data === 'undefined'){
        h_data = {};
    }
    if(typeof this.targets[s_target] === 'undefined'){
        throw new Error('Invalid target : ', s_target);
    }
    if(typeof this.filters[s_target] !== 'undefined') {
        var a_tuple = apply_filters(this.filters[s_target], s_message, h_data);
        s_message = a_tuple[0];
        h_data = a_tuple[1];
    }
    for(var i = 0; i < this.targets[s_target].length; i++){
        switch (this.targets[s_target][i]){
            case Notifier.OUTPUT.FILE:
                require('./output/file.js')(this.name, s_target, s_message, h_data);
                break;
            case Notifier.OUTPUT.STDOUT:
                require('./output/stdout.js')(this.name, s_target, s_message, h_data);
                break;
            case Notifier.OUTPUT.STDERR:
                require('./output/stderr.js')(this.name, s_target, s_message, h_data);
                break;
            case Notifier.OUTPUT.EVENT:
                this.emit(s_target, s_message, h_data);
                break;
            default:
                throw new Error('Invalid output');
        }
    }
};
Notifier.prototype.add_filter = function(s_target, f_filter) {
    if(typeof this.filters[s_target] === 'undefined'){
        this.filters[s_target] = [];
    }
    this.filters[s_target].push(f_filter);
};


var h_notifiers = {};
module.exports = function(s_name, f_init_conf){
    if(typeof h_notifiers[s_name] === 'undefined'){
        var h_conf = f_init_conf(Notifier.OUTPUT);
        var oc_notifier = new Notifier(s_name, h_conf);
        for(var s_target in h_conf){
            if(h_conf.hasOwnProperty(s_target)){
                if(!oc_notifier.hasOwnProperty(s_target)) {
                    if(typeof oc_notifier[s_target] === 'undefined') {
                        oc_notifier[s_target] = oc_notifier.notify.bind(oc_notifier, s_target);
                    } else {
                        throw new Error('Invalid target '+s_target );
                    }
                }
            }
        }
        h_notifiers[s_name] = oc_notifier;
    }
    return h_notifiers[s_name];
};