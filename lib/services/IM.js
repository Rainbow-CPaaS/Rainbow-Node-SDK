"use strict";

var Error = require("../common/Error");

const LOG_ID = "IM - ";

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
     * @param {String} message The message to send
     * @param {String} jid The recipient JID
     * @return {Object} The message sent
     */
    sendMessageToJid(message, jid) {

        this.logger.log("debug", LOG_ID + "(sendMessageToJid) _entering_");

        if (!message) {
            this.logger.log("warn", LOG_ID + "(sendMessageToJid) bad or empty 'message' parameter", message);
            return Error.BAD_REQUEST;
        }

        if (!jid) {
            this.logger.log("warn", LOG_ID + "(sendMessageToJid) bad or empty 'jid' parameter", jid);
            return Error.BAD_REQUEST;
        }
        
        var messageSent = this.xmpp.sendChatMessage(message, jid);
        this.logger.log("debug", LOG_ID + "(sendMessageToJid) _exiting_");
        return messageSent;
    }

    /**
     * @public
     * @method sendMessageToBubbleJid
     * @description
     *  Send a message to a bubble identified by its JID
     * @param {String} message The message to send
     * @param {String} jid The bubble JID
     * @return {Object} The message sent
     */
    sendMessageToBubbleJid(message, jid) {
        this.logger.log("debug", LOG_ID + "(sendMessageToBubble) _entering_");

        if (!message) {
            this.logger.log("warn", LOG_ID + "(sendMessageToBubble) bad or empty 'message' parameter", message);
            return Error.BAD_REQUEST;
        }

        if (!jid) {
            this.logger.log("debug", LOG_ID + "(sendMessageToBubble) bad or empty 'jid' parameter", jid);
            return Error.BAD_REQUEST;
        }
        
        var messageSent = this.xmpp.sendChatMessageToBubble(message, jid);
        this.logger.log("debug", LOG_ID + "(sendMessageToBubble) _exiting_");
        return messageSent;
    }

    /**
     * @public
     * @method markMessageAsRead
     * @description
     *  Send a 'read' receipt to the recipient
     * @param {Object} messageReceived The message received to mark as read
     * @return {null}
     */
    markMessageAsRead(messageReceived) {

        this.logger.log("debug", LOG_ID + "(markMessageAsRead) _entering_");
        
        if (!messageReceived) {
            this.logger.log("warn", LOG_ID + "(markMessageAsRead) bad or empty 'messageReceived' parameter", messageReceived);
            return Error.BAD_REQUEST;
        }

        this.xmpp.markMessageAsRead(messageReceived);
        this.logger.log("debug", LOG_ID + "(markMessageAsRead) _exiting_");
        return Error.OK;
    }

    enableCarbon() {
        var that = this;

        this.logger.log("debug", LOG_ID + "(enableCarbon) _entering_");

        return new Promise((resolve) => {
            that.eventEmitter.once("rainbow_oncarbonactivated", function() {
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