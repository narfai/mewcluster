'use strict';
var http = require('http');

module.exports = function(){
    http.createServer(function(req, res){
        console.log('%s %s', req.method, req.url);
        var body = 'Hello World';
        res.writeHead(200, { 'Content-Length': body.length });
        res.end(body);
    }).listen(8000);
};