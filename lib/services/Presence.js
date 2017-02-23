"use strict";

const LOG_ID = '[Presence] ';

class Presence {

    constructor(_eventEmitter) {
        this.xmpp = null;
        this.eventEmitter = _eventEmitter;
    }

    start(_xmpp) {
        this.xmpp = _xmpp;
    }

    /**
     * @public
     * @method sendInitialPresence
     * @description
     *  Send the initial presence (online)
     */
    sendInitialPresence() {

        var that = this;

        return new Promise(function(resolve, reject) {
            that.eventEmitter.once('rainbow_onpresencechanged', function() {
                resolve();
            });
            that.xmpp.sendInitialPresence();
        });

        
    }

    stop() {

    }
}

module.exports = Presence;