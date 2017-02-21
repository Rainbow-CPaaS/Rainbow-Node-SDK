'use strict';

var Loader = require('./lib/Loader');
const EventEmitter = require('events').EventEmitter;

var signinAndRenewToken;

class NodeSDK {

    constructor(options) {
        // private
        var that = this;
        this._evEmitter = new EventEmitter();
        this._loader = new Loader(options, this._evEmitter);

        // public
        this.events = new EventEmitter();

        this._evEmitter.on('rainbow_signinrequired', function() {
            signinAndRenewToken();
        });

        this._evEmitter.on('rainbow_xmppconnected', function() {
            that._loader.sendInitialPresence();
        });

        this._evEmitter.on('rainbow_onmessagereceived', function(json) {
            that.events.emit('rainbow_onmessagereceived', json);
        });

        signinAndRenewToken = () => { 
            that._loader.signin().then(function() {
                that._loader.tokenSurvey();
            }).catch(function() {
                process.exit(-1);
            });
        };
    }

    start() {
        this._loader.start().then(function() {
            signinAndRenewToken();
        });
    }

    stop() {

    }

    

}

module.exports = NodeSDK;