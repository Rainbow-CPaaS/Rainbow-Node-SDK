"use strict";

const LOG_ID = 'PRES - ';

class Presence {

    constructor(_eventEmitter, _logger) {
        this.xmpp = null;
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;
    }

    start(_xmpp) {
        this.logger.log("debug", LOG_ID + "(start) _entering_");
        this.xmpp = _xmpp;
        this.logger.log("debug", LOG_ID + "(start) _exiting_");
    }

    /**
     * @public
     * @method sendInitialPresence
     * @description
     *  Send the initial presence (online)
     */
    sendInitialPresence() {

        var that = this;

        this.logger.log("debug", LOG_ID + "(sendInitialPresence) _entering_");

        return new Promise(function(resolve, reject) {
            that.eventEmitter.once('rainbow_onpresencechanged', function(presence) {
                that.logger.log("info", LOG_ID + "(sendInitialPresence) received", presence);
                that.logger.log("debug", LOG_ID + "(sendInitialPresence) - _exiting_");
                resolve();
            });
            that.xmpp.sendInitialPresence();
        });
    }

    stop() {
        this.logger.log("debug", LOG_ID + "(stop) _entering_");
        this.logger.log("debug", LOG_ID + "(stop) _exiting_");
    }
}

module.exports = Presence;