'use strict';

var Core = require('./lib/Core');
var Error = require('./lib/common/Error');

class NodeSDK {

    constructor(options) {
        this._core = new Core(options);

        process.on("uncaughtException", (err) => {
            console.log(">>> Uncaught exception", err);
        });

        process.on("warning", (err) => {
            console.log(">>> Warning", err);
        });

        process.on("unhandledRejection", (err) => {
            console.log(">>> Unhandled rejection", err);
        });
    }

    /**
     * @public
     * @method start
     * @description
     *    Start the SDK
     */
    start() {
        var that = this;
        return new Promise(function(resolve, reject) {
            that._core.start().then(function() {
                var success = Error.OK;
                that.events.emit('rainbow_onstarted', success);
                return that._core.signin(false);
            }).then(function() {
                resolve();
            }).catch(function(err) {
                var error = Error.UNAUTHORIZED;
                error.details = err;
                that.events.emit('rainbow_onconnectionerror', error);
                reject();
            });
        });
    }

    startCLI() {
        var that = this;
        return new Promise(function(resolve, reject) {
            that._core.start().then(function() {
                var success = Error.OK;
                that.events.emit('rainbow_onstarted', success);
                resolve();
            }).catch(function(err) {
                var error = Error.UNAUTHORIZED;
                error.details = err;
                that.events.emit('rainbow_onconnectionerror', error);
                reject();
            });
        });
    }

    signinCLI() {
        var that = this;
        return new Promise(function(resolve, reject) {
            that._core.signin(false).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                var error = Error.UNAUTHORIZED;
                error.details = err;
                that.events.emit('rainbow_onconnectionerror', error);
                reject();
            });
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
     * @property im
     * @description
     *    Get access to the IM service
     */
    get im() {
        return this._core.im;
    }

    /**
     * @public
     * @property contacts
     * @description
     *    Get access to the Contacts service
     */
    get contacts() {
        return this._core.contacts;
    }

    /**
     * @public
     * @property presence
     * @description
     *    Get access to the Presence service
     */
    get presence() {
        return this._core.presence;
    }

    /**
     * @public
     * @property bubbles
     * @description
     *    Get access to the Bubbles service
     */
    get bubbles() {
        return this._core.bubbles;
    }

    get events() {
        return this._core.events;
    }

    get rest() {
        return this._core.rest;
    }

}

module.exports = NodeSDK;