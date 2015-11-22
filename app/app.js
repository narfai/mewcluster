'use strict';

//TODO implement in order : mithril views, requirejs loading, socket.io, grunt watchers & other conveniences, r.js
var HttpContent = require('./static/entity/HttpContent');
var m_q = require('q');
var m_merge = require('merge');
/*
Pour le pblm de la seo, il faut maintenir des entitées redis de résumé SEO qui seront appellé par le moteur statique pour chaque page.
Le reste sera loadé dynamiquement et aura son propre worker
regarder le module sticky-session pour router les workers correctement : https://github.com/indutny/sticky-session
*/
function TestingApp(){
    console.log('TestingApp loaded');
}
TestingApp.prototype.get_static = function(s_path, h_context){
    var o_defer = m_q.defer();
    if(typeof h_context === 'undefined'){
        h_context = {};
    }
    var o_content;
    switch(s_path){
        case '/':
            o_content = new HttpContent('overlay.html.jade', m_merge(h_context, {content:'hello world', title:'hello world'}));
            o_content.set_engine(HttpContent.prototype.ENGINE.JADE);
            break;
        case '/loader.js':
            o_content = new HttpContent('loader.js', m_merge(h_context), 'application/javascript');
            break;
        default:
            o_content = new HttpContent('overlay.html.jade', m_merge(h_context, {content:'404 - Not found', title:'404 - Not found'}));
            o_content.set_engine(HttpContent.prototype.ENGINE.JADE);
            o_content.set_code(404);
            break;
    }
    o_defer.resolve(o_content);
    return o_defer.promise;
};

module.exports = TestingApp;