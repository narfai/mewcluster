'use strict';

var cluster = require('cluster');
var app = require('../app/app');
var cpu_count = require('os').cpus().length;

if (cluster.isMaster)  {
    for (var i = 0; i < cpu_count; i++){
        cluster.fork();
    }
    cluster.on('exit', function(worker, code, signal){
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    app();
}
//console.log(cluster);
//cluster(app)
//  .use(cluster.logger('logs'))
//  .use(cluster.stats())
//  .use(cluster.pidfiles('pids'))
//  .use(cluster.cli())
//  .use(cluster.repl(8888))
//  .listen(3000);
