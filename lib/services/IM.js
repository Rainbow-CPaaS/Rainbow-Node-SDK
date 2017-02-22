"use strict";

const LOG_ID = '[IM] ';

class IM {

    constructor() {
        this.xmpp = null;
    }

    start(_xmpp) {
        this.xmpp = _xmpp;
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