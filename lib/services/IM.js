"use strict";

var Error = require("../common/Error");

const LOG_ID = "IM - ";

/**
 * @class
 * @name IM
 * @description
 *      This module manages Instant Messages. It allows to send messages to a user or a bubble.
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Send a message to a user <br>
 *      - Send a message to a bubble <br>
 *      - Mark a message as read <br>
 */
class IM {

    constructor(_eventEmitter, _logger) {
        this.xmpp = null;
        this.logger = _logger;
        this.eventEmitter = _eventEmitter;
    }

    start(_xmpp) {

        var that = this;

        this.logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.xmpp = _xmpp;
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();

            } catch (err) {
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                reject();
            }
        });
    }

    stop() {
        var that = this;

        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.xmpp = null;
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve();

            } catch (err) {
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject();
            }
        });
    }

    /**
     * @public
     * @method sendMessageToContact
     * @instance
     * @description
     *  Send a one-2-one message to a contact
     * @param {String} message The message to send
     * @param {Contact} contact The contact (should have at least a jid_im property)
     * @param {String} [lang=en] The content language used
     * @param {Object} [content] Allow to send alternative text base content
     * @param {String} [content.type=text/markdown] The content message type
     * @param {String} [content.message] The content message body
     * @param {String} [subject] The message subject
     * @memberof IM
     * @return {Object} The message sent
     */
    sendMessageToContact(message, contact, lang, content, subject) {
        this.logger.log("debug", LOG_ID + "(sendMessageToContact) _entering_");

        if (!contact || !contact.jid_im) {
            this.logger.log("warn", LOG_ID + "(sendMessageToContact) bad or empty 'contact' parameter", contact);
            return Error.BAD_REQUEST;
        }

        return this.sendMessageToJid(message, contact.jid_im, lang, content, subject);
    }

    /**
     * @public
     * @method sendMessageToJid
     * @instance
     * @description
     *  Send a one-2-one message to a contact identified by his Jid
     * @param {String} message The message to send
     * @param {String} jid The contact Jid
     * @param {String} [lang=en] The content language used
     * @param {Object} [content] Allow to send alternative text base content
     * @param {String} [content.type=text/markdown] The content message type
     * @param {String} [content.message] The content message body
     * @param {String} [subject] The message subject
     * @memberof IM
     * @return {Object} The message sent
     */
    sendMessageToJid(message, jid, lang, content, subject) {
        if ( !lang) {
            lang = "en";
        }

        this.logger.log("debug", LOG_ID + "(sendMessageToJid) _entering_");

        if (!message) {
            this.logger.log("warn", LOG_ID + "(sendMessageToJid) bad or empty 'message' parameter", message);
            return Error.BAD_REQUEST;
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > 1024) {
            this.logger.log("warn", LOG_ID + "(sendMessageToJid) message not sent. The content is too long (" + messageSize + ")", jid);
            return Error.BAD_REQUEST;
        }

        if (!jid) {
            this.logger.log("warn", LOG_ID + "(sendMessageToJid) bad or empty 'jid' parameter", jid);
            return Error.BAD_REQUEST;
        }
        
        var messageSent = this.xmpp.sendChatMessage(message, jid, lang, content, subject);
        this.logger.log("debug", LOG_ID + "(sendMessageToJid) _exiting_");
        return messageSent;
    }

    /**
     * @public
     * @method sendMessageToBubble
     * @instance
     * @description
     *  Send a message to a bubble
     * @param {String} message The message to send
     * @param {Bubble} bubble The bubble (should at least have a jid property)
     * @param {String} [lang=en] The content language used
     * @param {Object} [content] Allow to send alternative text base content
     * @param {String} [content.type=text/markdown] The content message type
     * @param {String} [content.message] The content message body
     * @param {String} [subject] The message subject
     * @memberof IM
     * @return {Object} The message sent
     */
    sendMessageToBubble(message, bubble, lang, content, subject) {
        this.logger.log("debug", LOG_ID + "(sendMessageToBubble) _entering_");

        if (!bubble || !bubble.jid) {
            this.logger.log("warn", LOG_ID + "(sendMessageToBubble) bad or empty 'bubble' parameter", bubble);
            return Error.BAD_REQUEST;
        }

        return this.sendMessageToBubbleJid(message, bubble.jid, lang, content, subject);
    }

    /**
     * @public
     * @method sendMessageToBubbleJid
     * @instance
     * @description
     *  Send a message to a bubble identified by its JID
     * @param {String} message The message to send
     * @param {String} jid The bubble JID
     * @param {String} [lang=en] The content language used
     * @param {Object} [content] Allow to send alternative text base content
     * @param {String} [content.type=text/markdown] The content message type
     * @param {String} [content.message] The content message body
     * @param {String} [subject] The message subject
     * @memberof IM
     * @return {Object} The message sent
     */
    sendMessageToBubbleJid(message, jid, lang, content, subject) {
        if ( !lang) {
            lang = "en";
        }
        this.logger.log("debug", LOG_ID + "(sendMessageToBubble) _entering_");

        if (!message) {
            this.logger.log("warn", LOG_ID + "(sendMessageToBubble) bad or empty 'message' parameter", message);
            return Error.BAD_REQUEST;
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > 1024) {
            this.logger.log("warn", LOG_ID + "(sendMessageToJid) message not sent. The content is too long (" + messageSize + ")", jid);
            return Error.BAD_REQUEST;
        }

        if (!jid) {
            this.logger.log("debug", LOG_ID + "(sendMessageToBubble) bad or empty 'jid' parameter", jid);
            return Error.BAD_REQUEST;
        }
        
        var messageSent = this.xmpp.sendChatMessageToBubble(message, jid, lang, content, subject);
        this.logger.log("debug", LOG_ID + "(sendMessageToBubble) _exiting_");
        return messageSent;
    }

    /**
     * @public
     * @method markMessageAsRead
     * @instance
     * @description
     *  Send a 'read' receipt to the recipient
     * @param {Message} messageReceived The message received to mark as read
     * @memberof IM
     * @return {Object} A SDK OK or Error Object depending the result
     */
    markMessageAsRead(messageReceived) {

        this.logger.log("debug", LOG_ID + "(markMessageAsRead) _entering_");
        
        if (!messageReceived) {
            this.logger.log("warn", LOG_ID + "(markMessageAsRead) bad or empty 'messageReceived' parameter");
            return Error.BAD_REQUEST;
        }

        if (messageReceived.isEvent) {
            this.logger.log("warn", LOG_ID + "(markMessageAsRead) No receipt for 'event' message");
            return Error.OK;
        }

        this.xmpp.markMessageAsRead(messageReceived);
        this.logger.log("debug", LOG_ID + "(markMessageAsRead) _exiting_");
        return Error.OK;
    }

    /**
     * @private
     * @method enableCarbon
     * @instance
     * @description
     *      Enable message carbon XEP-0280
     * @return {Promise} A promise containing the result
     * @memberof IM
     */
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
    
}

module.exports = IM;