"use strict";

const Error = require("../common/Error");
const Conversation = require("./../common/models/Conversation");
const emoji = require("../common/Emoji");
const xmpputils = require("../common/XMPPUtils");

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
        this.conversations = null;
        this.logger = _logger;
        this.eventEmitter = _eventEmitter;
    }

    start(_xmpp, _conversations) {

        var that = this;

        this.logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.xmpp = _xmpp;
                that.conversations = _conversations;
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
     * @beta
     * @since 1.39
     * @method
     * @instance
     * @description
     *    <b>(beta)</b> Retrieve the list of messages from a conversation <br/>
     *    Calling several times this method will load older message from the history (pagination) <br/>
     * @param {Conversation} conversation The conversation
     * @param {Number} intNbMessage The number of messages to retrieve. Optional. Default value is 30. Maximum value is 100
     * @memberof IM
     * @async
     * @return {Promise<Conversation, Error>}
     * @fulfil {Conversation, Error} Return the conversation updated with the list of messages requested or an error (reject) if there is no more messages to retrieve
     * @category async
     */
    getMessagesFromConversation(conversation, intNbMessage) {
        if (!conversation) {
            return Promise.reject(Object.assign( Error.BAD_REQUEST, {msg: "Parameter 'conversation' is missing or null"}));
        }

        intNbMessage = intNbMessage
            ? Math.min(intNbMessage, 100)
            : 30;
        return this
            .conversations
            .getHistoryPage(conversation, intNbMessage);

    }

    /**
     * @public
     * @beta
     * @since 1.39
     * @method
     * @instance
     * @description
     *    <b>(beta)</b> Retrieve a specific message in a conversation using its id <br/>
     * @param {Conversation} conversation The conversation where to search for the message
     * @param {String} strMessageId The message id
     * @memberof IM
     * @return {Message} The message if found or null
     */
    getMessageFromConversationById(conversation, strMessageId) {

        if (!conversation) {
            return Object.assign( Error.BAD_REQUEST, {msg: "Parameter 'conversation' is missing or null"});
        }

        if (!strMessageId) {
            return Object.assign( Error.BAD_REQUEST, {msg: "Parameter 'strMessageId' is missing or empty"});
        }

        return conversation.getMessageById(strMessageId);
    }

    /**
     * @public
     * @beta
     * @since 1.39
     * @method
     * @instance
     * @description
     *    Retrieve a specific message in a bubble using its id <br/>
     * @param {Bubble} bubble The bubble where to search for the message
     * @param {String} strMessageId The message id
     * @memberof IM
     * @return {Message} The message if found or null
     */
    getMessageFromBubbleById(bubble, strMessageId) {
        let that = this;

        if (!bubble) {
            return Object.assign( Error.BAD_REQUEST, {msg: "Parameter 'bubble' is missing or null"});
        }

        if (!strMessageId) {
            return Object.assign( Error.BAD_REQUEST, {msg: "Parameter 'strMessageId' is missing or empty"});
        }

        var conversation = that
            .conversations
            .getConversationByBubbleId(bubble.id);

        if (!conversation) {
            return Object.assign( Error.BAD_REQUEST, {msg: "Parameter 'bubble' don't have a conversation"});
        }

        if (conversation.type !== Conversation.Type.BUBBLE) {
            return Object.assign( Error.BAD_REQUEST, {msg: "Parameter 'conversation' is not a bubble conversation"});
        }

        return conversation.getMessageById(strMessageId);
    }

    /**
     * @public
     * @beta
     * @since 1.39
     * @method
     * @instance
     * @description
     *    <b>(beta)</b> Send a instant message to a conversation<br>
     *    This method works for sending messages to a one-to-one conversation or to a bubble conversation
     * @param {Conversation} conversation The conversation recipient
     * @param {String} message The message to send
     * @param {String} [lang=en] The content language used
     * @param {Object} [content] Allow to send alternative text base content
     * @param {String} [content.type=text/markdown] The content message type
     * @param {String} [content.message] The content message body
     * @param {String} [subject] The message subject
     * @memberof IM
     * @async
     * @return {Promise<Message, Error>} 
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    sendMessageToConversation(conversation, message, lang, content, subject) {

        this.logger.log("debug", LOG_ID + "(sendMessageToConversation) _entering_");

        if (!conversation) {
            this.logger.log("warn", LOG_ID + "(sendMessageToContact) bad or empty 'conversation' parameter", conversation);
            return Promise.reject(Object.assign( Error.BAD_REQUEST, {msg: "Parameter 'conversation' is missing or null"}));
        }

        if (!message) {
            this.logger.log("warn", LOG_ID + "(sendMessageToContact) bad or empty 'message' parameter", message);
            return Promise.reject(Object.assign( Error.BAD_REQUEST, {msg: "Parameter 'message' is missing or null"}));
        }

        if (message.length > 1024) {
            return Promise.reject(Object.assign( Error.BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than 1024 characters"}));
        }

        return conversation.type === Conversation.Type.ONE_TO_ONE ? this
            .sendMessageToJid(message, conversation.id, lang, content, subject) :
            this
            .sendMessageToBubbleJid(message, conversation.id, lang, content, subject);
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
     * @async
     * @return {Promise<Message, Error>} 
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    sendMessageToContact(message, contact, lang, content, subject) {
        this.logger.log("debug", LOG_ID + "(sendMessageToContact) _entering_");

        if (!contact || !contact.jid_im) {
            this.logger.log("warn", LOG_ID + "(sendMessageToContact) bad or empty 'contact' parameter", contact);
            return Promise.reject(Object.assign( Error.BAD_REQUEST, {msg: "Parameter 'contact' is missing or null"}));
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
     * @async
     * @return {Promise<Message, Error>}
     * @fulfil {Message} - the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    sendMessageToJid(message, jid, lang, content, subject) {
        if ( !lang) {
            lang = "en";
        }

        this.logger.log("debug", LOG_ID + "(sendMessageToJid) _entering_");

        if (!message) {
            this.logger.log("warn", LOG_ID + "(sendMessageToJid) bad or empty 'message' parameter", message);
            return Promise.reject(Object.assign( Error.BAD_REQUEST, {msg: "Bad or empty 'message' parameter"}));
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > 1024) {
            this.logger.log("warn", LOG_ID + "(sendMessageToJid) message not sent. The content is too long (" + messageSize + ")", jid);
            return Promise.reject(Object.assign( Error.BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than 1024 characters"}));
        }

        if (!jid) {
            this.logger.log("warn", LOG_ID + "(sendMessageToJid) bad or empty 'jid' parameter", jid);
            return Promise.reject(Object.assign( Error.BAD_REQUEST, {msg: "Bad or empty 'jid' parameter"}));
        }

        let messageUnicode = emoji.shortnameToUnicode(message);

        jid = xmpputils.getBareJIDFromFullJID(jid);

        var messageSent = this.xmpp.sendChatMessage(messageUnicode, jid, lang, content, subject);
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
     * @async
     * @return {Promise<Message, Error>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    sendMessageToBubble(message, bubble, lang, content, subject) {
        this.logger.log("debug", LOG_ID + "(sendMessageToBubble) _entering_");

        if (!bubble || !bubble.jid) {
            this.logger.log("warn", LOG_ID + "(sendMessageToBubble) bad or empty 'bubble' parameter", bubble);
            return Promise.reject(Object.assign( Error.BAD_REQUEST, {msg: "Bad or empty 'bubble' parameter"}));
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
     * @async
     * @return {Promise<Message, Error>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    sendMessageToBubbleJid(message, jid, lang, content, subject) {
        if ( !lang) {
            lang = "en";
        }
        this.logger.log("debug", LOG_ID + "(sendMessageToBubble) _entering_");

        if (!message) {
            this.logger.log("warn", LOG_ID + "(sendMessageToBubble) bad or empty 'message' parameter", message);
            return Promise.reject(Object.assign( Error.BAD_REQUEST, {msg: "Bad or empty 'message' parameter"}));
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > 1024) {
            this.logger.log("warn", LOG_ID + "(sendMessageToJid) message not sent. The content is too long (" + messageSize + ")", jid);
            return Promise.reject(Object.assign( Error.BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than 1024 characters"}));
        }

        if (!jid) {
            this.logger.log("debug", LOG_ID + "(sendMessageToBubble) bad or empty 'jid' parameter", jid);
            return Promise.reject(Object.assign( Error.BAD_REQUEST, {msg: "Bad or empty 'jid' parameter"}));
        }

        let messageUnicode = emoji.shortnameToUnicode(message);

        jid = xmpputils.getRoomJIDFromFullJID(jid);

        var messageSent = this.xmpp.sendChatMessageToBubble(messageUnicode, jid, lang, content, subject);
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
     * @async
     * @return {Promise}
     * @fulfil {} return nothing in case of success or an Error Object depending the result
     * @category async
     */
    markMessageAsRead(messageReceived) {

        this.logger.log("debug", LOG_ID + "(markMessageAsRead) _entering_");
        
        if (!messageReceived) {
            this.logger.log("warn", LOG_ID + "(markMessageAsRead) bad or empty 'messageReceived' parameter");
            return Promise.reject(Object.assign( Error.BAD_REQUEST, {msg: "Bad or empty 'messageReceived' parameter"}));
        }

        if (messageReceived.isEvent) {
            this.logger.log("warn", LOG_ID + "(markMessageAsRead) No receipt for 'event' message");
            return Error.OK;
        }

        this.logger.log("debug", LOG_ID + "(markMessageAsRead) _exiting_");
        
        return this.xmpp.markMessageAsRead(messageReceived);
    }

    /**
     * @private
     * @method enableCarbon
     * @instance
     * @description
     *      Enable message carbon XEP-0280
     * @memberof IM
     * @async
     * @return {Promise}
     * @fulfil {} return nothing in case of success or an Error Object depending the result
     * @category async
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