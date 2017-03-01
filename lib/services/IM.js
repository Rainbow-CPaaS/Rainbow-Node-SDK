"use strict";

const LOG_ID = 'IM - ';

class IM {

    constructor(_eventEmitter, _logger) {
        this.xmpp = null;
        this.logger = _logger;
        this.eventEmitter = _eventEmitter;
    }

    start(_xmpp) {
        this.logger.log("debug", LOG_ID + "(start) _entering_");
        this.xmpp = _xmpp;
        this.logger.log("debug", LOG_ID + "(start) _exiting_");
    }

    /**
     * @public
     * @method sendMessageToJid
     * @description
     *  Send a one-2-one message to a recipient identified by his JID
     * @param {String} message The message to sendChatMessage
     * @param {String} jid The recipient JID
     * @return {Object} Containing the unique identifier of the message
     */
    sendMessageToJid(message, jid) {
        this.logger.log("debug", LOG_ID + "(sendMessageToJid) _entering_");
        var messageSent = this.xmpp.sendChatMessage(message, jid);
        this.logger.log("debug", LOG_ID + "(sendMessageToJid) _exiting_");
        return messageSent;
    }

    enableCarbon() {
        var that = this;

        this.logger.log("debug", LOG_ID + "(enableCarbon) _entering_");

        return new Promise(function(resolve, reject) {
            that.eventEmitter.once('rainbow_oncarbonactivated', function() {
                that.logger.log("info", LOG_ID + "(enableCarbon) XEP-280 Message Carbon activated");
                that.logger.log("debug", LOG_ID + "(enableCarbon) - _exiting_");
                resolve();
            });
            that.xmpp.enableCarbon();
        });
    }

    stop() {
        this.logger.log("debug", LOG_ID + "(stop) _entering_");
        this.logger.log("debug", LOG_ID + "(stop) _exiting_");
    }
}

module.exports = IM;