"use strict";
import {ConversationsService} from "./ConversationsService";

export {};

import {XMPPService} from "../connection/XMPPService";
import {ErrorManager} from "../common/ErrorManager";
import {Conversation} from "../common/models/Conversation";
import {shortnameToUnicode,} from "../common/Emoji";
import {XMPPUTils} from "../common/XMPPUtils";
import {logEntryExit, until} from "../common/Utils";
import {isStarted} from "../common/Utils";
import {Logger} from "../common/Logger";
import EventEmitter = NodeJS.EventEmitter;
import {BubblesService} from "./BubblesService";
import {FileStorageService} from "./FileStorageService";
import {S2SService} from "./S2SService";
import {RESTService} from "../connection/RESTService";
import {Core} from "../Core";
import {PresenceService} from "./PresenceService";

const LOG_ID = "IM/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name IMService
 * @version SDKVERSION
 * @public
 * @description
 *      This module manages Instant Messages. It allows to send messages to a user or a bubble.
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Send a message to a user <br>
 *      - Send a message to a bubble <br>
 *      - Mark a message as read <br>
 */
class IMService {
    private _xmpp: XMPPService;
    private _conversations: ConversationsService;
    private _logger: Logger;
    private _eventEmitter: EventEmitter;
    private _pendingMessages: any;
    private _bulles: any;
    private _imOptions: any;
    private _fileStorage: any;
    public ready: boolean = false;
    private readonly _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    private _rest: RESTService;
    private _presence: PresenceService;
    private _options: any;
    private _s2s: S2SService;
    private _useXMPP: any;
    private _useS2S: any;
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    constructor(_eventEmitter : EventEmitter, _logger : Logger, _imOptions, _startConfig) {
        this._startConfig = _startConfig;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._conversations = null;
        this._logger = _logger;
        this._eventEmitter = _eventEmitter;
        this._pendingMessages = {};
        this._imOptions = _imOptions;

        this._eventEmitter.on("evt_internal_onreceipt", this._onmessageReceipt.bind(this));
        this.ready = false;


    }

    start(_options, _core : Core) { // , _xmpp : XMPPService, _s2s: S2SService, _rest: RESTService, __conversations : ConversationsService, __bubbles : BubblesService, _filestorage : FileStorageService
        let that = this;
        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;
                that._options = _options;
                that._s2s = _core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                that._conversations = _core.conversations;
                that._bulles = _core.bubbles;
                that._fileStorage = _core.fileStorage;
                that._presence = _core.presence;
                that.ready = true;
                resolve();

            } catch (err) {
                return reject(err);
            }
        });
    }

    stop() {
        let that = this;
        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = null;
                that.ready = false;
                resolve();

            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @since 1.39
     * @method getMessagesFromConversation
     * @instance
     * @description
     *    <b>(beta)</b> Retrieve the list of messages from a conversation <br/>
     *    Calling several times this method will load older message from the history (pagination) <br/>
     * @param {Conversation} conversation The conversation
     * @param {Number} intNbMessage The number of messages to retrieve. Optional. Default value is 30. Maximum value is 100
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
     * @since 1.39
     * @method getMessageFromConversationById
     * @instance
     * @description
     *    <b>(beta)</b> Retrieve a specific message in a conversation using its id <br/>
     * @param {Conversation} conversation The conversation where to search for the message
     * @param {String} strMessageId The message id
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

        that._logger.log("internal", LOG_ID + "(getMessageFromConversationById) conversation : ", conversation, ", strMessageId : ", strMessageId);

        let message = conversation.getMessageById(strMessageId);

        // Add FileDescriptor if needed
        if (message && message.oob && message.oob.url) {
            message.shortFileDescriptor = await that._fileStorage.getFileDescriptorById(message.oob.url.substring(message.oob.url.lastIndexOf("/") + 1));
        }
        return message;
    }

    /**
     * @public
     * @since 1.39
     * @method getMessageFromBubbleById
     * @instance
     * @description
     *    Retrieve a specific message in a bubble using its id <br/>
     * @param {Bubble} bubble The bubble where to search for the message
     * @param {String} strMessageId The message id
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

        that._logger.log("internal", LOG_ID + "(getMessageFromBubbleById) conversation : ", conversation, ", strMessageId : ", strMessageId);

        let message =  conversation.getMessageById(strMessageId);

        if (message && message.oob && message.oob.url) {
            let fileDescriptorId = message.oob.url.substring(message.oob.url.lastIndexOf("/") + 1);
            that._logger.log("internal", LOG_ID + "(getMessageFromBubbleById) oob url defined so build shortFileDescriptor :", fileDescriptorId);
            message.shortFileDescriptor = await that._fileStorage.getFileDescriptorById(fileDescriptorId);
        }

        return message;
    }

    /**
     * @public
     * @since 1.39
     * @method sendMessageToConversation
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
     * @async
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    async sendMessageToConversation(conversation, message, lang, content, subject) {
        let that = this;
        if (!conversation) {
            this._logger.log("warn", LOG_ID + "(sendMessageToContact) bad or empty 'conversation' parameter.");
            this._logger.log("internalerror", LOG_ID + "(sendMessageToContact) bad or empty 'conversation' parameter : ", conversation);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'conversation' is missing or null"}));
        }

        if (!message) {
            this._logger.log("warn", LOG_ID + "(sendMessageToContact) bad or empty 'message' parameter.");
            this._logger.log("internalerror", LOG_ID + "(sendMessageToContact) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'message' is missing or null"}));
        }

        if (message.length > that._imOptions.messageMaxLength) {
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that._imOptions.messageMaxLength + " characters"}));
        }

        let msgSent : any = undefined; //Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: " sent message failed."}));
        if (this._useXMPP) {
            msgSent = conversation.type === Conversation.Type.ONE_TO_ONE ? this.sendMessageToJid(message, conversation.id, lang, content, subject) : this.sendMessageToBubbleJid(message, conversation.id, lang, content, subject, undefined);
        }
        if ((this._useS2S)) {
            /*
{
  "message": {
    "subject": "Greeting",
    "lang": "en",
    "contents": [
      {
        "type": "text/markdown",
        "data": "## Hello Bob"
      }
    ],
    "body": "Hello world"
  }
}
             */
            let msg = {
                "message": {
                    "subject": subject,
                    "lang": lang,
                    "contents":
                    content,
                    // [
                    // {
                    //     "type": "text/markdown",
                    //     "data": "## Hello Bob"
                    // }
                    // ],
                    "body": message
                }
            };

            if (!conversation.dbId) {
                conversation = await this._conversations.createServerConversation(conversation);
                this._logger.log("internal", LOG_ID + "(sendMessageToConversation) conversation : ", conversation);
            }

            msgSent = this._s2s.sendMessageInConversation(conversation.dbId, msg);
        }

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
     * @async
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    sendMessageToContact(message, contact, lang, content, subject) {
        if (!contact || !contact.jid_im) {
            this._logger.log("warn", LOG_ID + "(sendMessageToContact) bad or empty 'contact' parameter.");
            this._logger.log("internalerror", LOG_ID + "(sendMessageToContact) bad or empty 'contact' parameter : ", contact);
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
        this._pendingMessages[message.id] = {
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
        delete this._pendingMessages[message.id];
    } // */

    _onmessageReceipt(receipt) {
        let that = this;
        return;
        /*if (this._pendingMessages[receipt.id]) {
            let messagePending = this._pendingMessages[receipt.id].message;
            that._logger.log("warn", LOG_ID + "(_onmessageReceipt) the pending message received from server, so remove from pending", messagePending);
            this.removePendingMessage(messagePending);
        }
        that._logger.log("warn", LOG_ID + "(_onmessageReceipt) the pending messages : ", that._pendingMessages);
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
        if (!message) {
            this._logger.log("warn", LOG_ID + "(sendMessageToJid) bad or empty 'message' parameter.");
            this._logger.log("internalerror", LOG_ID + "(sendMessageToJid) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'message' parameter"}));
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > that._imOptions.messageMaxLength) {
            this._logger.log("warn", LOG_ID + "(sendMessageToJid) message not sent. The content is too long (" + messageSize + ")", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that._imOptions.messageMaxLength + " characters"}));
        }

        if (!jid) {
            this._logger.log("warn", LOG_ID + "(sendMessageToJid) bad or empty 'jid' parameter", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'jid' parameter"}));
        }

        let messageUnicode = shortnameToUnicode(message);

        jid = XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(jid);

        let messageSent : any = Promise.reject();

        if (this._useXMPP) {
             messageSent = await this._xmpp.sendChatMessage(messageUnicode, jid, lang, content, subject, undefined);
        }

        /*
        this.storePendingMessage(messageSent);
        await utils.until(() => {
               return this._pendingMessages[messageSent.id] === undefined;
            }
            , "Wait for the send chat message to be received by server", 30000);
        this.removePendingMessage(messageSent);
        this._logger.log("debug", LOG_ID + "(sendMessageToJid) _exiting_");
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

        if (!message) {
            this._logger.log("warn", LOG_ID + "(sendMessageToJidAnswer) bad or empty 'message' parameter.");
            this._logger.log("internalerror", LOG_ID + "(sendMessageToJidAnswer) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'message' parameter"}));
        }

        let typofansweredMsg = answeredMsg instanceof Object ;
        if (!typofansweredMsg && answeredMsg !== null ) {
            that._logger.log("warn", LOG_ID + "(sendMessageToJidAnswer) bad  'answeredMsg' parameter.");
            that._logger.log("internalerror", LOG_ID + "(sendMessageToJidAnswer) bad  'answeredMsg' parameter : ", answeredMsg);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad 'answeredMsg' parameter"}));
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > that._imOptions.messageMaxLength) {
            that._logger.log("warn", LOG_ID + "(sendMessageToJidAnswer) message not sent. The content is too long (" + messageSize + ")", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that._imOptions.messageMaxLength + " characters"}));
        }

        if (!jid) {
            that._logger.log("warn", LOG_ID + "(sendMessageToJidAnswer) bad or empty 'jid' parameter", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'jid' parameter"}));
        }

        let messageUnicode = shortnameToUnicode(message);

        jid = XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(jid);

        let messageSent = await this._xmpp.sendChatMessage(messageUnicode, jid, lang, content, subject, answeredMsg);

        /*
        this.storePendingMessage(messageSent);
        await utils.until(() => {
               return this._pendingMessages[messageSent.id] === undefined;
            }
            , "Wait for the send chat message to be received by server", 30000);
        this.removePendingMessage(messageSent);
        this._logger.log("debug", LOG_ID + "(sendMessageToJid) _exiting_");
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
     * @param {array} mentions array containing a list of JID of contact to mention or a string containing a sigle JID of the contact.
     * @async
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    sendMessageToBubble(message, bubble, lang, content, subject, mentions) {
        if (!bubble || !bubble.jid) {
            this._logger.log("warn", LOG_ID + "(sendMessageToBubble) bad or empty 'bubble' parameter.");
            this._logger.log("internalerror", LOG_ID + "(sendMessageToBubble) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'bubble' parameter"}));
        }

        return this.sendMessageToBubbleJid(message, bubble.jid, lang, content, subject, mentions);
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
     * @param {array} mentions array containing a list of JID of contact to mention or a string containing a sigle JID of the contact.
     * @async
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    async sendMessageToBubbleJid(message, jid, lang, content, subject, mentions) {
        let that = this;
        if (!lang) {
            lang = "en";
        }
        if (!message) {
            that._logger.log("warn", LOG_ID + "(sendMessageToBubbleJid) bad or empty 'message' parameter.");
            that._logger.log("internalerror", LOG_ID + "(sendMessageToBubbleJid) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'message' parameter"}));
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > that._imOptions.messageMaxLength) {
            that._logger.log("warn", LOG_ID + "(sendMessageToBubbleJid) message not sent. The content is too long (" + messageSize + ")", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that._imOptions.messageMaxLength + " characters"}));
        }

        if (!jid) {
            that._logger.log("debug", LOG_ID + "(sendMessageToBubbleJid) bad or empty 'jid' parameter", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'jid' parameter"}));
        }

        let messageUnicode = shortnameToUnicode(message);

        jid = XMPPUTils.getXMPPUtils().getRoomJIDFromFullJID(jid);

        let bubble = await that._bulles.getBubbleByJid(jid);
        that._logger.log("internal", LOG_ID + "(sendMessageToBubbleJid) getBubbleByJid ", bubble);
        if (bubble.isActive) {
            let messageSent1 = that._xmpp.sendChatMessageToBubble(messageUnicode, jid, lang, content, subject, undefined, mentions);
            return messageSent1;
        } else {
            try {
                that._logger.log("debug", LOG_ID + "(sendMessageToBubbleJid) bubble is not active, so resume it before send the message.");
                that._logger.log("internal", LOG_ID + "(sendMessageToBubbleJid) bubble is not active, so resume it before send the message. bubble : ", bubble);
                await that._presence.sendInitialBubblePresence(bubble.jid);
                //that._logger.log("debug", LOG_ID + "(sendMessageToBubbleJid) sendInitialBubblePresence succeed ");
                await until(() => {
                    return bubble.isActive === true;
                }, "Wait for the Bubble " + bubble.jid + " to be active");
                //that._logger.log("debug", LOG_ID + "(sendMessageToBubbleJid) until succeed, so the bubble is now active, send the message.");
                let messageSent = that._xmpp.sendChatMessageToBubble(messageUnicode, jid, lang, content, subject, undefined, mentions);
                return messageSent;
            } catch (err) {
                return Promise.reject({message: "The sending message process failed!", error: err});
            }
        }
    }

    /**
     * @public
     * @method sendMessageToBubbleJidAnswer
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
     * @param {array} mentions array containing a list of JID of contact to mention or a string containing a sigle JID of the contact.
     * @async
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     * @category async
     */
    async sendMessageToBubbleJidAnswer(message, jid, lang, content, subject, answeredMsg, mentions) {
        let that = this;
        if (!lang) {
            lang = "en";
        }
        if (!message) {
            that._logger.log("warn", LOG_ID + "(sendMessageToBubbleJidAnswer) bad or empty 'message' parameter.");
            that._logger.log("internalerror", LOG_ID + "(sendMessageToBubbleJidAnswer) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'message' parameter"}));
        }
        let typofansweredMsg = answeredMsg instanceof Object ;
        if (!typofansweredMsg && answeredMsg !== null ) {
            that._logger.log("warn", LOG_ID + "(sendMessageToBubbleJidAnswer) bad  'answeredMsg' parameter.");
            that._logger.log("internalerror", LOG_ID + "(sendMessageToBubbleJidAnswer) bad  'answeredMsg' parameter : ", answeredMsg);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad 'answeredMsg' parameter"}));
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > that._imOptions.messageMaxLength) {
            that._logger.log("warn", LOG_ID + "(sendMessageToBubbleJidAnswer) message not sent. The content is too long (" + messageSize + ")", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that._imOptions.messageMaxLength + " characters"}));
        }

        if (!jid) {
            that._logger.log("debug", LOG_ID + "(sendMessageToBubbleJidAnswer) bad or empty 'jid' parameter", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'jid' parameter"}));
        }

        let messageUnicode = shortnameToUnicode(message);

        jid = XMPPUTils.getXMPPUtils().getRoomJIDFromFullJID(jid);

        let bubble = await that._bulles.getBubbleByJid(jid);
        that._logger.log("internal", LOG_ID + "(sendMessageToBubbleJidAnswer) getBubbleByJid ", bubble);
        if (bubble.isActive) {
            let messageSent = that._xmpp.sendChatMessageToBubble(messageUnicode, jid, lang, content, subject, answeredMsg, mentions);
            return messageSent;
        } else {
            try {
                that._logger.log("debug", LOG_ID + "(sendMessageToBubbleJidAnswer) bubble is not active, so resume it before send the message.");
                that._logger.log("internal", LOG_ID + "(sendMessageToBubbleJidAnswer) bubble is not active, so resume it before send the message. bubble : ", bubble);
                await that._xmpp.sendInitialBubblePresence(bubble.jid);
                //that._logger.log("debug", LOG_ID + "(sendMessageToBubbleJidAnswer) sendInitialBubblePresence succeed ");
                await until(() => {
                    return bubble.isActive === true;
                }, "Wait for the Bubble " + bubble.jid + " to be active");
                //that._logger.log("debug", LOG_ID + "(sendMessageToBubbleJidAnswer) until succeed, so the bubble is now active, send the message.");
                let messageSent = that._xmpp.sendChatMessageToBubble(messageUnicode, jid, lang, content, subject, answeredMsg, mentions);
                return messageSent;
            } catch (err) {
                return Promise.reject({message: "The sending message process failed!", error: err});
            }
        }
    }

    /**
     * @public
     * @method sendIsTypingStateInBubble
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
                return reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'bubble' is missing or null"}));
            }
            /* else if (!status) {
                reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'status' is missing or null"}));
            } // */
            else {
                if (!bubble.jid) {
                    return reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'bubble': this bubble isn't a valid one"}));
                } else {
                    that._logger.log("internal",  LOG_ID + "sendIsTypingStateInBubble - bubble : ", bubble, "status : ", status);

                    that._conversations.getBubbleConversation(bubble.jid, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined).then(async function (conversation) {
                        if (!conversation) {
                            return reject(Object.assign( ErrorManager.getErrorManager().OTHERERROR("ERRORNOTFOUND", "ERRORNOTFOUND"), {msg: "No 'conversation' found for this bubble"}));
                        }
                        else {
                            await that._xmpp.sendIsTypingState(conversation, status) ;
                            //conversationService.sendIsTypingState(conversation, status);
                            resolve();
                        }
                    }).catch((err)=>{
                        return reject(Object.assign( ErrorManager.getErrorManager().OTHERERROR("ERRORNOTFOUND", "ERRORNOTFOUND"), {msg: "No 'conversation' found for this bubble : " + err}));
                    });
                }
            }

        }) ;
    } // */

    /**
     * @public
     * @method sendIsTypingStateInConversation
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
                return reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'conversation' is missing or null"}));
            }
            /* else if (!status) {
                reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'status' is missing or null"}));
            } // */
            else {
                conversation = conversation.id ? that._conversations.getConversationById(conversation.id) : null;
                if (!conversation) {
                    return reject(Object.assign( ErrorManager.getErrorManager().OTHERERROR("ERRORNOTFOUND", "ERRORNOTFOUND"), {msg: "Parameter 'conversation': this conversation doesn't exist"}));
                } else {
                    await that._xmpp.sendIsTypingState(conversation, status);
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
     * @async
     * @return {Promise}
     * @fulfil {} return nothing in case of success or an ErrorManager Object depending the result
     * @category async
     */
    markMessageAsRead(messageReceived) {
        if (!messageReceived) {
            this._logger.log("warn", LOG_ID + "(markMessageAsRead) bad or empty 'messageReceived' parameter");
            return Promise.reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'messageReceived' parameter"}));
        }

        if (messageReceived.isEvent) {
            this._logger.log("warn", LOG_ID + "(markMessageAsRead) No receipt for 'event' message");
            return ErrorManager.getErrorManager().OK;
        }

        this._logger.log("internal", LOG_ID + "(markMessageAsRead) 'messageReceived' parameter : ", messageReceived);

        if (this._useXMPP) {
            return this._xmpp.markMessageAsRead(messageReceived);
        }
        if ((this._useS2S)) {
            if (messageReceived.conversation) {
                let conversationId = messageReceived.conversation.dbId ? messageReceived.conversation.dbId : messageReceived.conversation.id;
                let messageId = messageReceived.id;
                return this._rest.markMessageAsRead(conversationId, messageId);
            } else {
                return Promise.reject('No conversation found in message.');
            }
        }
    }

    /**
     * @private
     * @method enableCarbon
     * @instance
     * @description
     *      Enable message carbon XEP-0280
     * @async
     * @return {Promise}
     * @fulfil {} return nothing in case of success or an ErrorManager Object depending the result
     * @category async
     */
    enableCarbon() {
        let that = this;
        return new Promise((resolve) => {
            if (this._useXMPP) {
                that._eventEmitter.once("rainbow_oncarbonactivated", function fn_oncarbonactivated() {
                    that._logger.log("info", LOG_ID + "(enableCarbon) XEP-280 Message Carbon activated");
                    that._eventEmitter.removeListener("rainbow_oncarbonactivated", fn_oncarbonactivated);
                    resolve();
                });
                that._xmpp.enableCarbon();
            } else
            if (this._useS2S){
                resolve();
            } else {
                resolve();
            }
        });
    }



}

module.exports.IMService = IMService;
export {IMService};
