var cluster = require('cluster');

function Worker(){
    var self = this;
}

Worker.prototype.spawn = function(){
    cluster.fork();
};

module.exports = Worker;