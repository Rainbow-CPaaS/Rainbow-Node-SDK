'use strict';

var Core = require('./lib/Core');
var Error = require('./lib/common/Error');

class NodeSDK {

    constructor(options) {
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
            that._core.signin(false).then(function(token) {
                resolve(token);
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

    get events() {
        return this._core.events;
    }

}

module.exports = NodeSDK;