"use strict";

const LOG_ID = 'IM - ';

class IM {

    constructor(_logger) {
        this.xmpp = null;
        this.logger = _logger;
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

    stop() {
        this.logger.log("debug", LOG_ID + "(stop) _entering_");
        this.logger.log("debug", LOG_ID + "(stop) _exiting_");
    }
}

module.exports = IM;