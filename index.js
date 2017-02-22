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

        /**
         * Public API
         * @public
         * @param {Object} events The events manager (Node.js EventEmitter)
         * @description
         *  Use this param to subscribe to events coming from the SDK
         * 
         */
        this.events = new EventEmitter();

        this._evEmitter.on('rainbow_signinrequired', function() {
            signinAndRenewToken();
        });

        this._evEmitter.on('rainbow_xmppconnected', function() {
            that._loader.sendInitialPresence();
            that.events.emit('rainbow_onconnected');
        });

        this._evEmitter.on('rainbow_onmessagereceived', function(json) {
            that.events.emit('rainbow_onmessagereceived', json);
        });

        this._evEmitter.on('rainbow_onxmpperror', function(err) {
            that.events.emit('rainbow_onerror', err);
        });

        signinAndRenewToken = () => { 
            that._loader.signin().then(function() {
                that._loader.tokenSurvey();
            }).catch(function(err) {
                that.events.emit('rainbow_onerror', err);
            });
        };
    }

    /**
     * @public
     * @method start
     * @description
     *    Start the SDK
     */
    start() {
        this._loader.start().then(function() {
            signinAndRenewToken();
        });
    }

    /**
     * @public
     * @method stop
     * @description
     *    Stop the SDK
     */
    stop() {

    }

    /**
     * @public
     * @method sendAMessage
     * @description
     *    Send a message to a Rainbow user
     */
    sendAMessage(jid, message) {
        this._loader.xmpp.sendMessage(jid, message);
    }
}

module.exports = NodeSDK;