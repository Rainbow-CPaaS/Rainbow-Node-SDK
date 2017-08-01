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

        process.on("unhandledRejection", (err, p) => {
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

    /**
     * @public
     * @method startCLI
     * @description
     *      Start the SDK with CLI
     */
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

    /**
     * @public
     * @method siginCLI
     * @description
     *      Sign in with CLI
     */
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

    /**
     * @public
     * @property events
     * @description
     *    Get access to the Events service
     */    
    get events() {
        return this._core.events;
    }

    /**
     * @public
     * @property fileServer
     * @description
     *    Get access to the File Server service
     */
    get fileServer() {
        return this._core.fileServer;
    }

    /**
     * @public
     * @admin
     * @description
     *    Get access to the Admin service
     */    
    get admin() {
        return this._core.admin;
    }

    /**
     * @private
     * @property rest
     * @description
     *    Get access to the REST service
     */
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

    /**
     * @public
     * @property version
     * @description
     *      Return the version of the SDK
     */
    get version() {
        return this._core.version;
    }

}

module.exports = NodeSDK;