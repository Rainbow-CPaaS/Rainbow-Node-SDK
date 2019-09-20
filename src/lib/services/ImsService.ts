"use strict";
export {};

import {XMPPService} from "../connection/XMPPService";
import {ErrorManager} from "../common/ErrorManager";
import {Conversation} from "../common/models/Conversation";
import {shortnameToUnicode,} from "../common/Emoji";
import {XMPPUTils} from "../common/XMPPUtils";
import {until} from "../common/Utils";
import {isStarted} from "../common/Utils";

const LOG_ID = "IM/SVCE - ";

@isStarted()
/**
 * @class
 * @name IMService
 * @description
 *      This module manages Instant Messages. It allows to send messages to a user or a bubble.
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Send a message to a user <br>
 *      - Send a message to a bubble <br>
 *      - Mark a message as read <br>
 */
class IMService {
	public xmpp: XMPPService;
	public _conversations: any;
	public logger: any;
	public _eventEmitter: any;
	public pendingMessages: any;
	public _bulles: any;
    private imOptions: any;
    public _fileStorage: any;
    public ready: boolean = false;
    private readonly _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    constructor(_eventEmitter, _logger, _imOptions, _startConfig) {
        this._startConfig = _startConfig;
        this.xmpp = null;
        this._conversations = null;
        this.logger = _logger;
        this._eventEmitter = _eventEmitter;
        this.pendingMessages = {};
        this.imOptions = _imOptions;

        this._eventEmitter.on("evt_internal_onreceipt", this._onmessageReceipt.bind(this));
        this.ready = false;


    }

    start(_xmpp, __conversations, __bubbles, _filestorage) {

        let that = this;

        this.logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.xmpp = _xmpp;
                that._conversations = __conversations;
                that._bulles = __bubbles;
                that._fileStorage = _filestorage;
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                that.ready = true;
                resolve();

            } catch (err) {
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                reject(err);
            }
        });
    }

    stop() {
        let that = this;

        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.xmpp = null;
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                that.ready = false;
                resolve();

            } catch (err) {
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject(err);
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
     * @memberof IMService
     * @async
     * @return {Promise<Conversation, ErrorManager>}
     * @fulfil {Conversation, ErrorManager} Return the conversation updated with the list of messages requested or an error (reject) if there is no more messages to retrieve
     * @category async
     */
    getMessagesFromConversation(conversation, intNbMessage) {
        if (!conversation) {
            return Promise.reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'conversation' is missing or null"}));
        }

        intNbMessage = intNbMessage
            ? Math.min(intNbMessage, 100)
            : 30;
        return this
            ._conversations
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
     * @memberof IMService
     * @return {Message} The message if found or null
     */
    async getMessageFromConversationById(conversation, strMessageId) {
        let that = this;

        if (!conversation) {
            return Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'conversation' is missing or null"});
        }

        if (!strMessageId) {
            return Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessageId' is missing or empty"});
        }

        that.logger.log("internal", LOG_ID + "(getMessageFromConversationById) conversation : ", conversation, ", strMessageId : ", strMessageId);

        let message = conversation.getMessageById(strMessageId);

        // Add FileDescriptor if needed
        if (message && message.oob && message.oob.url) {
            message.shortFileDescriptor = await that._fileStorage.getFileDescriptorById(message.oob.url.substring(message.oob.url.lastIndexOf("/") + 1));
        }
        return message;
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
     * @memberof IMService
     * @return {Message} The message if found or null
     */
    async getMessageFromBubbleById(bubble, strMessageId) {
        let that = this;

        if (!bubble) {
            return Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'bubble' is missing or null"});
        }

        if (!strMessageId) {
            return Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessageId' is missing or empty"});
        }

        let conversation = await that._conversations.getConversationByBubbleId(bubble.id);

        if (!conversation) {
            return Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'bubble' don't have a conversation"});
        }

        if (conversation.type !== Conversation.Type.ROOM) {
            return Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'conversation' is not a bubble conversation"});
        }

        that.logger.log("internal", LOG_ID + "(getMessageFromBubbleById) conversation : ", conversation, ", strMessageId : ", strMessageId);

        let message =  conversation.getMessageById(strMessageId);

        if (message && message.oob && message.oob.url) {
            message.shortFileDescriptor = await that._fileStorage.getFileDescriptorById(message.oob.url.substring(message.oob.url.lastIndexOf("/") + 1));
        }

        return message;
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
     * @memberof IMService
     * @async
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    sendMessageToConversation(conversation, message, lang, content, subject) {
        let that = this;
        this.logger.log("debug", LOG_ID + "(sendMessageToConversation) _entering_");

        if (!conversation) {
            this.logger.log("warn", LOG_ID + "(sendMessageToContact) bad or empty 'conversation' parameter.");
            this.logger.log("internalerror", LOG_ID + "(sendMessageToContact) bad or empty 'conversation' parameter : ", conversation);
            return Promise.reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'conversation' is missing or null"}));
        }

        if (!message) {
            this.logger.log("warn", LOG_ID + "(sendMessageToContact) bad or empty 'message' parameter.");
            this.logger.log("internalerror", LOG_ID + "(sendMessageToContact) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'message' is missing or null"}));
        }

        if (message.length > that.imOptions.messageMaxLength) {
            return Promise.reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that.imOptions.messageMaxLength + " characters"}));
        }

        let msgSent = conversation.type === Conversation.Type.ONE_TO_ONE ? this
                .sendMessageToJid(message, conversation.id, lang, content, subject) :
            this
                .sendMessageToBubbleJid(message, conversation.id, lang, content, subject);
        return msgSent.then((messageSent) => {
            this._conversations.storePendingMessage(conversation, messageSent);
            //conversation.messages.push(messageSent);
            //this.conversations.getServerConversations();
            return messageSent;
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
     * @memberof IMService
     * @async
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    sendMessageToContact(message, contact, lang, content, subject) {
        this.logger.log("debug", LOG_ID + "(sendMessageToContact) _entering_");

        if (!contact || !contact.jid_im) {
            this.logger.log("warn", LOG_ID + "(sendMessageToContact) bad or empty 'contact' parameter.");
            this.logger.log("internalerror", LOG_ID + "(sendMessageToContact) bad or empty 'contact' parameter : ", contact);
            return Promise.reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'contact' is missing or null"}));
        }

        return this.sendMessageToJid(message, contact.jid_im, lang, content, subject);
    }

    /**
     * @private
     * @description
     *      Store the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent.
     *      It allow to give back the status of the sending process.
     * @param conversation
     * @param message
     */
    /*storePendingMessage(message) {
        this.pendingMessages[message.id] = {
//            conversation: conversation,
            message: message
        };
    } // */

    /**
     * @private
     * @description
     *      delete the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent.
     *      It allow to give back the status of the sending process.
     * @param message
     */
    /* removePendingMessage(message) {
        delete this.pendingMessages[message.id];
    } // */

    _onmessageReceipt(receipt) {
        let that = this;
        return;
        /*if (this.pendingMessages[receipt.id]) {
            let messagePending = this.pendingMessages[receipt.id].message;
            that.logger.log("warn", LOG_ID + "(_onmessageReceipt) the pending message received from server, so remove from pending", messagePending);
            this.removePendingMessage(messagePending);
        }
        that.logger.log("warn", LOG_ID + "(_onmessageReceipt) the pending messages : ", that.pendingMessages);
        // */
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
     * @memberof IMService
     * @async
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} - the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    async sendMessageToJid(message, jid, lang, content, subject) {
        let that = this;
        if (!lang) {
            lang = "en";
        }

        this.logger.log("debug", LOG_ID + "(sendMessageToJid) _entering_");

        if (!message) {
            this.logger.log("warn", LOG_ID + "(sendMessageToJid) bad or empty 'message' parameter.");
            this.logger.log("internalerror", LOG_ID + "(sendMessageToJid) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'message' parameter"}));
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > that.imOptions.messageMaxLength) {
            this.logger.log("warn", LOG_ID + "(sendMessageToJid) message not sent. The content is too long (" + messageSize + ")", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that.imOptions.messageMaxLength + " characters"}));
        }

        if (!jid) {
            this.logger.log("warn", LOG_ID + "(sendMessageToJid) bad or empty 'jid' parameter", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'jid' parameter"}));
        }

        let messageUnicode = shortnameToUnicode(message);

        jid = XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(jid);

        let messageSent = await this.xmpp.sendChatMessage(messageUnicode, jid, lang, content, subject, undefined);

        /*
        this.storePendingMessage(messageSent);
        await utils.until(() => {
               return this.pendingMessages[messageSent.id] === undefined;
            }
            , "Wait for the send chat message to be received by server", 30000);
        this.removePendingMessage(messageSent);
        this.logger.log("debug", LOG_ID + "(sendMessageToJid) _exiting_");
        // */
        return messageSent;
    }

    /**
     * @public
     * @method sendMessageToJidAnswer
     * @instance
     * @description
     *  Send a reply to a one-2-one message to a contact identified by his Jid
     * @param {String} message The message to send
     * @param {String} jid The contact Jid
     * @param {String} [lang=en] The content language used
     * @param {Object} [content] Allow to send alternative text base content
     * @param {String} [content.type=text/markdown] The content message type
     * @param {String} [content.message] The content message body
     * @param {String} [subject] The message subject
     * @param {String} [answeredMsg] The message answered
     * @memberof IMService
     * @async
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} - the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    async sendMessageToJidAnswer(message, jid, lang, content, subject, answeredMsg) {
        let that = this;
        if (!lang) {
            lang = "en";
        }

        that.logger.log("debug", LOG_ID + "(sendMessageToJidAnswer) _entering_");

        if (!message) {
            this.logger.log("warn", LOG_ID + "(sendMessageToJidAnswer) bad or empty 'message' parameter.");
            this.logger.log("internalerror", LOG_ID + "(sendMessageToJidAnswer) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'message' parameter"}));
        }

        let typofansweredMsg = answeredMsg instanceof Object ;
        if (!typofansweredMsg && answeredMsg !== null ) {
            that.logger.log("warn", LOG_ID + "(sendMessageToJidAnswer) bad  'answeredMsg' parameter.");
            that.logger.log("internalerror", LOG_ID + "(sendMessageToJidAnswer) bad  'answeredMsg' parameter : ", answeredMsg);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad 'answeredMsg' parameter"}));
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > that.imOptions.messageMaxLength) {
            that.logger.log("warn", LOG_ID + "(sendMessageToJidAnswer) message not sent. The content is too long (" + messageSize + ")", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that.imOptions.messageMaxLength + " characters"}));
        }

        if (!jid) {
            that.logger.log("warn", LOG_ID + "(sendMessageToJidAnswer) bad or empty 'jid' parameter", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'jid' parameter"}));
        }

        let messageUnicode = shortnameToUnicode(message);

        jid = XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(jid);

        let messageSent = await this.xmpp.sendChatMessage(messageUnicode, jid, lang, content, subject, answeredMsg);

        /*
        this.storePendingMessage(messageSent);
        await utils.until(() => {
               return this.pendingMessages[messageSent.id] === undefined;
            }
            , "Wait for the send chat message to be received by server", 30000);
        this.removePendingMessage(messageSent);
        this.logger.log("debug", LOG_ID + "(sendMessageToJid) _exiting_");
        // */
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
     * @memberof IMService
     * @async
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    sendMessageToBubble(message, bubble, lang, content, subject) {
        this.logger.log("debug", LOG_ID + "(sendMessageToBubble) _entering_");

        if (!bubble || !bubble.jid) {
            this.logger.log("warn", LOG_ID + "(sendMessageToBubble) bad or empty 'bubble' parameter.");
            this.logger.log("internalerror", LOG_ID + "(sendMessageToBubble) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'bubble' parameter"}));
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
     * @memberof IMService
     * @async
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    async sendMessageToBubbleJid(message, jid, lang, content, subject) {
        let that = this;
        if (!lang) {
            lang = "en";
        }
        that.logger.log("debug", LOG_ID + "(sendMessageToBubble) _entering_");

        if (!message) {
            that.logger.log("warn", LOG_ID + "(sendMessageToBubble) bad or empty 'message' parameter.");
            that.logger.log("internalerror", LOG_ID + "(sendMessageToBubble) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'message' parameter"}));
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > that.imOptions.messageMaxLength) {
            that.logger.log("warn", LOG_ID + "(sendMessageToJid) message not sent. The content is too long (" + messageSize + ")", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that.imOptions.messageMaxLength + " characters"}));
        }

        if (!jid) {
            that.logger.log("debug", LOG_ID + "(sendMessageToBubble) bad or empty 'jid' parameter", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'jid' parameter"}));
        }

        let messageUnicode = shortnameToUnicode(message);

        jid = XMPPUTils.getXMPPUtils().getRoomJIDFromFullJID(jid);

        let bubble = await that._bulles.getBubbleByJid(jid);
        that.logger.log("internal", LOG_ID + "(sendMessageToBubble) getBubbleByJid ", bubble);
        if (bubble.isActive) {
            let messageSent = that.xmpp.sendChatMessageToBubble(messageUnicode, jid, lang, content, subject, undefined);
            that.logger.log("debug", LOG_ID + "(sendMessageToBubble) _exiting_");
            return messageSent;
        } else {
            try {
                that.logger.log("debug", LOG_ID + "(sendMessageToBubble) bubble is not active, so resume it before send the message.");
                that.logger.log("internal", LOG_ID + "(sendMessageToBubble) bubble is not active, so resume it before send the message. bubble : ", bubble);
                await that.xmpp.sendInitialBubblePresence(bubble.jid);
                //that.logger.log("debug", LOG_ID + "(sendMessageToBubble) sendInitialBubblePresence succeed ");
                await until(() => {
                    return bubble.isActive === true;
                }, "Wait for the Bubble " + bubble.jid + " to be active");
                //that.logger.log("debug", LOG_ID + "(sendMessageToBubble) until succeed, so the bubble is now active, send the message.");
                let messageSent = that.xmpp.sendChatMessageToBubble(messageUnicode, jid, lang, content, subject, undefined);
                that.logger.log("debug", LOG_ID + "(sendMessageToBubble) _exiting_");
                return messageSent;
            } catch (err) {
                that.logger.log("debug", LOG_ID + "(sendMessageToBubble) _exiting_");
                return Promise.reject({message: "The sending message process failed!", error: err});
            }
        }
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
     * @param {String} [answeredMsg] The message answered
     * @memberof IMService
     * @async
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    async sendMessageToBubbleJidAnswer(message, jid, lang, content, subject, answeredMsg) {
        let that = this;
        if (!lang) {
            lang = "en";
        }
        that.logger.log("debug", LOG_ID + "(sendMessageToBubbleJidAnswer) _entering_");
        if (!message) {
            that.logger.log("warn", LOG_ID + "(sendMessageToBubbleJidAnswer) bad or empty 'message' parameter.");
            that.logger.log("internalerror", LOG_ID + "(sendMessageToBubbleJidAnswer) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'message' parameter"}));
        }
        let typofansweredMsg = answeredMsg instanceof Object ;
        if (!typofansweredMsg && answeredMsg !== null ) {
            that.logger.log("warn", LOG_ID + "(sendMessageToBubbleJidAnswer) bad  'answeredMsg' parameter.");
            that.logger.log("internalerror", LOG_ID + "(sendMessageToBubbleJidAnswer) bad  'answeredMsg' parameter : ", answeredMsg);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad 'answeredMsg' parameter"}));
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > that.imOptions.messageMaxLength) {
            that.logger.log("warn", LOG_ID + "(sendMessageToBubbleJidAnswer) message not sent. The content is too long (" + messageSize + ")", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that.imOptions.messageMaxLength + " characters"}));
        }

        if (!jid) {
            that.logger.log("debug", LOG_ID + "(sendMessageToBubbleJidAnswer) bad or empty 'jid' parameter", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'jid' parameter"}));
        }

        let messageUnicode = shortnameToUnicode(message);

        jid = XMPPUTils.getXMPPUtils().getRoomJIDFromFullJID(jid);

        let bubble = await that._bulles.getBubbleByJid(jid);
        that.logger.log("internal", LOG_ID + "(sendMessageToBubbleJidAnswer) getBubbleByJid ", bubble);
        if (bubble.isActive) {
            let messageSent = that.xmpp.sendChatMessageToBubble(messageUnicode, jid, lang, content, subject, answeredMsg);
            that.logger.log("debug", LOG_ID + "(sendMessageToBubbleJidAnswer) _exiting_");
            return messageSent;
        } else {
            try {
                that.logger.log("debug", LOG_ID + "(sendMessageToBubbleJidAnswer) bubble is not active, so resume it before send the message.");
                that.logger.log("internal", LOG_ID + "(sendMessageToBubbleJidAnswer) bubble is not active, so resume it before send the message. bubble : ", bubble);
                await that.xmpp.sendInitialBubblePresence(bubble.jid);
                //that.logger.log("debug", LOG_ID + "(sendMessageToBubble) sendInitialBubblePresence succeed ");
                await until(() => {
                    return bubble.isActive === true;
                }, "Wait for the Bubble " + bubble.jid + " to be active");
                //that.logger.log("debug", LOG_ID + "(sendMessageToBubble) until succeed, so the bubble is now active, send the message.");
                let messageSent = that.xmpp.sendChatMessageToBubble(messageUnicode, jid, lang, content, subject, answeredMsg);
                that.logger.log("debug", LOG_ID + "(sendMessageToBubbleJidAnswer) _exiting_");
                return messageSent;
            } catch (err) {
                that.logger.log("debug", LOG_ID + "(sendMessageToBubbleJidAnswer) _exiting_");
                return Promise.reject({message: "The sending message process failed!", error: err});
            }
        }
    }

    /**
     * @public
     * @method
     * @instance IMService
     * @description
     *    Switch the "is typing" state in a bubble/room<br>
     * @param {Bubble} bubble The destination bubble
     * @param {boolean} status The status, true for setting "is Typing", false to remove it
     * @return {Object} Return a promise with no parameter when succeed.
     */
    sendIsTypingStateInBubble(bubble, status) {
        let that = this;
        return new Promise(async (resolve,reject) => {
            if (!bubble) {
                reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'bubble' is missing or null"}));
            }
            /* else if (!status) {
                reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'status' is missing or null"}));
            } // */
            else {
                if (!bubble.jid) {
                    reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'bubble': this bubble isn't a valid one"}));
                } else {
                    that.logger.log("internal",  LOG_ID + "sendIsTypingStateInBubble - bubble : ", bubble, "status : ", status);

                    that._conversations.getBubbleConversation(bubble.jid).then(async function (conversation) {
                        if (!conversation) {
                            reject(Object.assign( ErrorManager.getErrorManager().OTHERERROR("ERRORNOTFOUND", "ERRORNOTFOUND"), {msg: "No 'conversation' found for this bubble"}));
                        }
                        else {
                            await that.xmpp.sendIsTypingState(conversation, status) ;
                            //conversationService.sendIsTypingState(conversation, status);
                            resolve();
                        }
                    }).catch((err)=>{
                        reject(Object.assign( ErrorManager.getErrorManager().OTHERERROR("ERRORNOTFOUND", "ERRORNOTFOUND"), {msg: "No 'conversation' found for this bubble : " + err}));
                    });
                }
            }

        }) ;
    } // */

    /**
     * @public
     * @method
     * @instance IMService
     * @description
     *    Switch the "is typing" state in a conversation<br>
     * @param {Conversation} conversation The conversation recipient
     * @param {boolean} status The status, true for setting "is Typing", false to remove it
     * @return Return a promise with no parameter when succeed
     */
    sendIsTypingStateInConversation(conversation, status) {
        let that = this;
        return new Promise(async (resolve, reject) => {
            if (!conversation) {
                reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'conversation' is missing or null"}));
            }
            /* else if (!status) {
                reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'status' is missing or null"}));
            } // */
            else {
                conversation = conversation.id ? that._conversations.getConversationById(conversation.id) : null;
                if (!conversation) {
                    reject(Object.assign( ErrorManager.getErrorManager().OTHERERROR("ERRORNOTFOUND", "ERRORNOTFOUND"), {msg: "Parameter 'conversation': this conversation doesn't exist"}));
                } else {
                    await that.xmpp.sendIsTypingState(conversation, status);
                    resolve();
                }
            }
        });
    }


    /**
     * @public
     * @method markMessageAsRead
     * @instance
     * @description
     *  Send a 'read' receipt to the recipient
     * @param {Message} messageReceived The message received to mark as read
     * @memberof IMService
     * @async
     * @return {Promise}
     * @fulfil {} return nothing in case of success or an ErrorManager Object depending the result
     * @category async
     */
    markMessageAsRead(messageReceived) {

        this.logger.log("debug", LOG_ID + "(markMessageAsRead) _entering_");
        
        if (!messageReceived) {
            this.logger.log("warn", LOG_ID + "(markMessageAsRead) bad or empty 'messageReceived' parameter");
            return Promise.reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'messageReceived' parameter"}));
        }

        if (messageReceived.isEvent) {
            this.logger.log("warn", LOG_ID + "(markMessageAsRead) No receipt for 'event' message");
            return ErrorManager.getErrorManager().OK;
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
     * @memberof IMService
     * @async
     * @return {Promise}
     * @fulfil {} return nothing in case of success or an ErrorManager Object depending the result
     * @category async
     */
    enableCarbon() {
        let that = this;

        this.logger.log("debug", LOG_ID + "(enableCarbon) _entering_");

        return new Promise((resolve) => {
            that._eventEmitter.once("rainbow_oncarbonactivated", function fn_oncarbonactivated() {
                that.logger.log("info", LOG_ID + "(enableCarbon) XEP-280 Message Carbon activated");
                that.logger.log("debug", LOG_ID + "(enableCarbon) - _exiting_");
                that._eventEmitter.removeListener("rainbow_oncarbonactivated", fn_oncarbonactivated);
                resolve();
            });
            that.xmpp.enableCarbon();
        });
    }


    
}

module.exports.IMService = IMService;
export {IMService};