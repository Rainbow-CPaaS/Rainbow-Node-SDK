'use strict';

var Loader = require('./lib/Loader');
const EventEmitter = require('events').EventEmitter;

var signinAndRenewToken;

class NodeSDK {

    constructor(options) {
        var that = this;
        this.eventEmitter = new EventEmitter();
        this.loader = new Loader(options, this.eventEmitter);

        this.eventEmitter.on('rainbow_signinrequired', function() {
            signinAndRenewToken();
        });

        signinAndRenewToken = () => { 
            that.loader.signin().then(function() {
                return that.loader.tokenSurvey();
            }).catch(function() {
                process.exit(-1);
            });
        };
    }

    start() {
        this.loader.start().then(function() {
            signinAndRenewToken();
        });
    }

    stop() {

    }

}

module.exports = NodeSDK;