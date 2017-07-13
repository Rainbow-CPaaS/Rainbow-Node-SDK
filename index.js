"use strict";

var Core = require("./lib/Core");
var Error = require("./lib/common/Error");

class NodeSDK {

    constructor(options) {
        process.on("uncaughtException", (err) => {
            console.error(err);
        });

        process.on("warning", (err) => {
            console.error(err);
        });

        process.on("unhandledRejection", (err) => {
            console.error(err);
        });

        this._core = new Core(options);
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
                return that._core.signin(false);
            }).then(function() {
                resolve();
            }).catch(function(err) {
                var error = Error.UNAUTHORIZED;
                error.details = err;
                that.events.emit("rainbow_onconnectionerror", error);
                reject();
            });
        });
    }

    startCLI() {
        var that = this;
        return new Promise(function(resolve, reject) {
            that._core.start().then(function() {
                resolve();
            }).catch(function(err) {
                var error = Error.UNAUTHORIZED;
                error.details = err;
                that.events.emit("rainbow_onconnectionerror", error);
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
                that.events.emit("rainbow_onconnectionerror", error);
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
        var that = this;
        return new Promise(function(resolve, reject) {
            that._core.stop().then(function() {
                var success = Error.OK;
                that.events.emit("rainbow_onstopped", success);
                resolve();
            }).catch(function(err) {
                var error = Error.ERROR;
                error.details = err;
                that.events.emit("rainbow_onstopped", error);
                reject();
            });
        });
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

    /**
     * @public
     * @property state
     * @description
     *    Return the state of the SDK (eg: STOPPED, STARTED, CONNECTED, READY, DISCONNECTED, RECONNECTING)
     */  
    get state() {
        return this._core.state;
    }

}

module.exports = NodeSDK;