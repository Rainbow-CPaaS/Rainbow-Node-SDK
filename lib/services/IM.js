"use strict";

const LOG_ID = '[IM] ';

class IM {

    constructor(_logger) {
        this.xmpp = null;
        this.logger = _logger;
    }

    start(_xmpp) {
        this.logger.log("info", LOG_ID + "start - begin");
        this.xmpp = _xmpp;
        this.logger.log("info", LOG_ID + "start - begin");
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
        return this.xmpp.sendChatMessage(message, jid);
    }

    stop() {

    }
}

module.exports = IM;