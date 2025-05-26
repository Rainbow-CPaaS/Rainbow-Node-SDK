"use strict";
import {ConversationsService} from "./ConversationsService";
import {ErrorManager} from "../common/ErrorManager";
import {Conversation, PEERTYPE} from "../common/models/Conversation";
import {shortnameToUnicode,} from "../common/Emoji";
import {XMPPUTils} from "../common/XMPPUtils";
import {addPropertyToObj, isDefined, isStarted, logEntryExit} from "../common/Utils";
import {Logger} from "../common/Logger";
import {EventEmitter} from "events";
import {BubblesService} from "./BubblesService";
import {Core} from "../Core";
import {PresenceService} from "./PresenceService";
import {GenericService} from "./GenericService";
import {Message} from "../common/models/Message";
import {CHATSTATE} from "./S2SService.js";
import {DataStoreType} from "../config/config.js";

const Element = require('ltx').Element;

export {};

const LOG_ID = "IM/SVCE - ";
const API_ID = "API_CALL - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name ImsService
 * @version SDKVERSION
 * @public
 * @description
 *      This module manages Instant Messages. It allows to send messages to a user or a bubble. <br>
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Send a message to a user <br>
 *      - Send a message to a bubble <br>
 *      - Mark a message as read <br>
 */
class ImsService extends GenericService{
    private _conversations: ConversationsService;
    private _pendingMessages: any;
    private _bulles: BubblesService;
    private _imOptions: any;
    private _fileStorage: any;
    private _presence: PresenceService;

    static getClassName(){ return 'ImsService'; }
    getClassName(){ return ImsService.getClassName(); }

    static getAccessorName(){ return 'ims'; }
    getAccessorName(){ return ImsService.getAccessorName(); }

    constructor(_core:Core, _eventEmitter : EventEmitter, _logger : Logger, _imOptions : any, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(_logger, LOG_ID, _eventEmitter);
        this.setLogLevels(this);
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

        this._core = _core;

        this._eventEmitter.on("evt_internal_onreceipt", this._onmessageReceipt.bind(this));
    }

    start(_options) { // , _xmpp : XMPPService, _s2s: S2SService, _rest: RESTService, __conversations : ConversationsService, __bubbles : BubblesService, _filestorage : FileStorageService
        let that = this;
        that.initStartDate();
        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = that._core._xmpp;
                that._rest = that._core._rest;
                that._options = _options;
                that._s2s = that._core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                that._conversations = that._core.conversations;
                that._bulles = that._core.bubbles;
                that._fileStorage = that._core.fileStorage;
                that._presence = that._core.presence;
                that.setStarted ();
                resolve(undefined);
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
                that.setStopped ();
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        });
    }

    async init (enableCarbonBool : boolean, useRestAtStartup : boolean) {
        let that = this;
        if (enableCarbonBool) {
            await that.enableCarbon().then((result) => {
                that.setInitialized();
            }).catch(() => {
                that.setInitialized();
            });
        } else {
            await that.disableCarbon().then((result) => {
                that.setInitialized();
            }).catch(() => {
                that.setInitialized();
            });
        }
    }

    //region Ims MANAGEMENT

    /**
     * @private
     * @method enableCarbon
     * @instance
     * @description
     *      Enable message carbon XEP-0280 <br>
     * @async
     * @category Ims MANAGEMENT
     * @return {Promise}
     * @fulfil {} return nothing in case of success or an ErrorManager Object depending the result
    
     */
    enableCarbon() {
        let that = this;
        return new Promise((resolve) => {
            if (this._useXMPP) {
                that._eventEmitter.once("rainbow_oncarbonactivated", function fn_oncarbonactivated() {
                    that._logger.log(that.INFO, LOG_ID + "(enableCarbon) XEP-280 Message Carbon activated");
                    that._eventEmitter.removeListener("rainbow_oncarbonactivated", fn_oncarbonactivated);
                    resolve(undefined);
                });
                return that._xmpp.enableCarbon();
            } else
            if (this._useS2S){
                resolve(undefined);
            } else {
                resolve(undefined);
            }
        });
    }

    /**
     * @private
     * @method disableCarbon
     * @instance
     * @description
     *      Disable message carbon XEP-0280 <br>
     * @async
     * @category Ims MANAGEMENT
     * @return {Promise}
     * @fulfil {} return nothing in case of success or an ErrorManager Object depending the result
    
     */
    disableCarbon() {
        let that = this;
        return new Promise((resolve) => {
            if (this._useXMPP) {
                that._eventEmitter.once("rainbow_oncarbondisabled", function fn_oncarbondesactivated() {
                    that._logger.log(that.INFO, LOG_ID + "(disableCarbon) XEP-280 Message Carbon desactivated");
                    that._eventEmitter.removeListener("rainbow_oncarbondisabled", fn_oncarbondesactivated);
                    resolve(undefined);
                });
                return that._xmpp.disableCarbon();
            } else
            if (this._useS2S){
                resolve(undefined);
            } else {
                resolve(undefined);
            }
        });
    }

    //endregion Ims MANAGEMENT
    
    //region Ims MESSAGES
    
    /**
     * @public
     * @nodered true
     * @since 1.39
     * @method getMessagesFromConversation
     * @instance
     * @description
     *    <b>(beta)</b> Retrieve the list of messages from a conversation <br>
     *    Calling several times this method will load older message from the history (pagination) <br>
     * @param {Conversation} conversation The conversation
     * @param {Number} intNbMessage The number of messages to retrieve. Optional. Default value is 30. Maximum value is 100
     * @async
     * @category Ims MESSAGES
     * @return {Promise<Conversation, ErrorManager>}
     * @fulfil {Conversation, ErrorManager} Return the conversation updated with the list of messages requested or an error (reject) if there is no more messages to retrieve
    
     */
    async getMessagesFromConversation(conversation: Conversation, intNbMessage: number = 30): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getMessagesFromConversation) is conversation defined : ", isDefined(conversation));
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
     * @nodered true
     * @since 1.39
     * @method getMessageFromConversationById
     * @instance
     * @async
     * @category Ims MESSAGES
     * @description
     *    <b>(beta)</b> Retrieve a specific message in a conversation using its id <br>
     * @param {Conversation} conversation The conversation where to search for the message
     * @param {String} strMessageId The message id
     * @return {Message} The message if found or null
     */
    async getMessageFromConversationById(conversation, strMessageId) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getMessageFromConversationById) is conversation defined : ", isDefined(conversation));

        if (!conversation) {
            return Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'conversation' is missing or null"});
        }

        if (!strMessageId) {
            return Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessageId' is missing or empty"});
        }

        that._logger.log(that.INTERNAL, LOG_ID + "(getMessageFromConversationById) conversation : ", conversation, ", strMessageId : ", strMessageId);

        let message = conversation.getMessageById(strMessageId);

        // Add FileDescriptor if needed
        if (message && message.oob && message.oob.url) {
            message.shortFileDescriptor = await that._fileStorage.getFileDescriptorById(message.oob.url.substring(message.oob.url.lastIndexOf("/") + 1));
        }
        return message;
    }

    /**
     * @public
     * @nodered true
     * @since 1.39
     * @method getMessageFromBubbleById
     * @instance
     * @async
     * @category Ims MESSAGES
     * @description
     *    Retrieve a specific message in a bubble using its id <br>
     * @param {Bubble} bubble The bubble where to search for the message
     * @param {String} strMessageId The message id
     * @return {Message} The message if found or null
     */
    async getMessageFromBubbleById(bubble, strMessageId) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getMessageFromBubbleById) is conversation defined : ", isDefined(bubble));

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

        that._logger.log(that.INTERNAL, LOG_ID + "(getMessageFromBubbleById) conversation : ", conversation, ", strMessageId : ", strMessageId);

        let message =  conversation.getMessageById(strMessageId);

        if (message && message.oob && message.oob.url) {
            let fileDescriptorId = message.oob.url.substring(message.oob.url.lastIndexOf("/") + 1);
            that._logger.log(that.INTERNAL, LOG_ID + "(getMessageFromBubbleById) oob url defined so build shortFileDescriptor :", fileDescriptorId);
            message.shortFileDescriptor = await that._fileStorage.getFileDescriptorById(fileDescriptorId);
        }

        return message;
    }

    /**
     * @public
     * @nodered true
     * @method markMessageAsRead
     * @instance
     * @description
     *  Send a 'read' receipt to the recipient <br>
     * @param {Message} messageReceived The message received to mark as read
     * @async
     * @category Ims MESSAGES
     * @return {Promise}
     * @fulfil {} return nothing in case of success or an ErrorManager Object depending the result
    
     */
    async markMessageAsRead(messageReceived) {
        let that =this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(markMessageAsRead) is messageReceived defined : ", isDefined(messageReceived));
        if (!messageReceived) {
            that._logger.log(that.WARN, LOG_ID + "(markMessageAsRead) bad or empty 'messageReceived' parameter");
            return Promise.reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'messageReceived' parameter"}));
        }

        if (messageReceived.isEvent) {
            that._logger.log(that.WARN, LOG_ID + "(markMessageAsRead) No receipt for 'event' message");
            return ErrorManager.getErrorManager().OK;
        }

        that._logger.log(that.INTERNAL, LOG_ID + "(markMessageAsRead) 'messageReceived' parameter : ", messageReceived);

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
     * @public
     * @nodered true
     * @since 1.39
     * @method sendMessageToConversation
     * @instance
     * @async
     * @category Ims MESSAGES
     * @description
     *    <b>(beta)</b> Send a instant message to a conversation<br>
     *    This method works for sending messages to a one-to-one conversation or to a bubble conversation <br>
     * @param {Conversation} conversation The conversation recipient
     * @param {String} message The message to send
     * @param {String} [lang=en] The content language used
     * @param {Object} [content] Allow to send alternative text base content
     * @param {String} [content.type=text/markdown] The content message type
     * @param {String} [content.message] The content message body
     * @param {String} [subject] The message subject
     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
     * @param {DataStoreType} p_messagesDataStore  used to override the general of SDK's parameter "messagesDataStore". default value `undefined` to use the general value.</br>
     * DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.</br>
     * DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).</br>
     * DataStoreType.StoreTwinSide The messages are fully stored.</br>
     * DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.</br>
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve

     */
    async sendMessageToConversation(conversation : Conversation, message: string, lang: string, content :any, subject : string, urgency: string = null, p_messagesDataStore: DataStoreType = undefined) :Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendMessageToConversation) is conversation defined : ", isDefined(conversation), " is message defined : ", isDefined(message));
        if (!conversation) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToConversation) bad or empty 'conversation' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(sendMessageToConversation) bad or empty 'conversation' parameter : ", conversation);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'conversation' is missing or null"}));
        }

        /*if (!message) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToContact) bad or empty 'message' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(sendMessageToContact) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'message' is missing or null"}));
        } // */

        if (message && message.length > that._imOptions.messageMaxLength) {
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that._imOptions.messageMaxLength + " characters"}));
        }

        let msgSent : any = undefined; //Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: " sent message failed."}));
        if (this._useXMPP) {
            msgSent = conversation.type === Conversation.Type.ONE_TO_ONE ? this.sendMessageToJid(message, conversation.id, lang, content, subject, urgency, p_messagesDataStore) : this.sendMessageToBubbleJid(message, conversation.id, lang, content, subject, undefined, urgency, p_messagesDataStore);
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
                    "contents": content,
                    // [
                    // {
                    //     "type": "text/markdown",
                    //     "data": "## Hello Bob"
                    // }
                    // ],
                    "body": message,
                    urgency
                }
            };

            if (!conversation.dbId) {
                conversation = await this._conversations.createServerConversation(conversation);
                that._logger.log(that.INTERNAL, LOG_ID + "(sendMessageToConversation) conversation : ", conversation);
            }

            msgSent = this._s2s.sendMessageInConversation(conversation.dbId, msg);
        }

        return msgSent.then((messageSent) => {
            if (!messageSent.from && !messageSent.fromJid) {
                messageSent.from = that._rest.loggedInUser.jid_im;
            }
            this._conversations.storePendingMessage(conversation, messageSent);
            that._logger.log(that.INTERNAL, LOG_ID + "(sendMessageToConversation) stored PendingMessage : ", messageSent);
            //conversation.messages.push(messageSent);
            //this.conversations.getServerConversations();
            return messageSent;
        });

    }

    /**
     * @public
     * @nodered true
     * @method sendMessageToContact
     * @instance
     * @async
     * @category Ims MESSAGES
     * @description
     *  Send a one-2-one message to a contact <br>
     * @param {String} message The message to send
     * @param {Contact} contact The contact (should have at least a jid_im property)
     * @param {String} [lang=en] The content language used
     * @param {Object} [content] Allow to send alternative text base content
     * @param {String} [content.type=text/markdown] The content message type
     * @param {String} [content.message] The content message body
     * @param {String} [subject] The message subject
     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
     * @param {DataStoreType} p_messagesDataStore  used to override the general of SDK's parameter "messagesDataStore". default value `undefined` to use the general value.</br>
     * DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.</br>
     * DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).</br>
     * DataStoreType.StoreTwinSide The messages are fully stored.</br>
     * DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.</br>
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve

     */
    async sendMessageToContact(message, contact, lang, content, subject, urgency: string = null, p_messagesDataStore: DataStoreType = undefined) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendMessageToContact) is contact defined : ", isDefined(contact), " is message defined : ", isDefined(message));
        if (!contact || !contact.jid_im) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToContact) bad or empty 'contact' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(sendMessageToContact) bad or empty 'contact' parameter : ", contact);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'contact' is missing or null"}));
        }

        //return this.sendMessageToJid(message, contact.jid_im, lang, content, subject, urgency);

        let conversation = await that._conversations.openConversationForContact(contact);
        //that._logger.log(that.DEBUG, "MAIN - testSendMultipleMessages - message to be sent in conversation : ", conversation);
        return that.sendMessageToConversation(conversation, message, lang, content, subject, urgency, p_messagesDataStore);
    }

    /**
     * @private
     * @description
     *      Store the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent. <br>
     *      It allow to give back the status of the sending process. <br>
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
     *      delete the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent. <br>
     *      It allow to give back the status of the sending process. <br>
     * @param message
     */
    /* removePendingMessage(message) {
        delete this._pendingMessages[message.id];
    } // */

    /**
     * @public
     * @nodered true
     * @method sendMessageToJid
     * @instance
     * @async
     * @category Ims MESSAGES
     * @description
     *  Send a one-2-one message to a contact identified by his Jid <br>
     * @param {String} message The message to send
     * @param {String} jid The contact Jid
     * @param {String} [lang=en] The content language used
     * @param {Object} [content] Allow to send alternative text base content
     * @param {String} [content.type=text/markdown] The content message type
     * @param {String} [content.message] The content message body
     * @param {String} [subject] The message subject
     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
     * @param {DataStoreType} p_messagesDataStore  used to override the general of SDK's parameter "messagesDataStore". default value `undefined` to use the general value.</br>
     * DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.</br>
     * DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).</br>
     * DataStoreType.StoreTwinSide The messages are fully stored.</br>
     * DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.</br>
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} - the message sent, or null in case of error, as parameter of the resolve
     */
    async sendMessageToJid(message, jid, lang, content, subject, urgency: string = null,  p_messagesDataStore: DataStoreType = undefined) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendMessageToContact) is jid defined : ", isDefined(jid), " is message defined : ", isDefined(message));
        if (!lang) {
            lang = "en";
        }
        /* if (!message) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToJid) bad or empty 'message' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(sendMessageToJid) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'message' parameter"}));
        } // */ 

        // Check size of the message
        let messageSize = message?message.length:0;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        
        if (messageSize > that._imOptions.messageMaxLength) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToJid) message not sent. The content is too long (" + messageSize + ")", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that._imOptions.messageMaxLength + " characters"}));
        }
        // */

        if (!jid) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToJid) bad or empty 'jid' parameter", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'jid' parameter"}));
        }

        let messageUnicode = message === "" ? "" : (message?shortnameToUnicode(message):undefined);

        jid = XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(jid);

        let messageSent : any = undefined;

        if (this._useXMPP) {
            messageSent = Promise.resolve(this._xmpp.sendChatMessage(messageUnicode, jid, lang, content, subject, undefined, urgency, p_messagesDataStore));
        } else {
            messageSent = Promise.reject("only supported in xmpp mode");
        }

        return messageSent.then(async (messageSent) => {
            if (!messageSent.from && !messageSent.fromJid) {
                messageSent.from = that._rest.loggedInUser.jid_im;
            }

            let conversation = undefined;
            let peer:{peer : any, type: PEERTYPE }  = await that._core.contacts.getPeerByJid(jid);
            if (peer.type === PEERTYPE.USER) {
                conversation = await that._conversations.openConversationForContact(peer.peer);
            }
            if (peer.type === PEERTYPE.ROOM) {
                conversation = await that._conversations.openConversationForBubble(peer.peer);
            }

            if (conversation) {
                this._conversations.storePendingMessage(conversation, messageSent);
                that._logger.log(that.INTERNAL, LOG_ID + "(sendMessageToConversation) stored PendingMessage : ", messageSent);
                //conversation.messages.push(messageSent);
                //this.conversations.getServerConversations();
            }
            return messageSent;
        });

        /*
        this.storePendingMessage(messageSent);
        await utils.until(() => {
               return this._pendingMessages[messageSent.id] === undefined;
            }
            , "Wait for the send chat message to be received by server", 30000);
        this.removePendingMessage(messageSent);
        that._logger.log(that.DEBUG, LOG_ID + "(sendMessageToJid) _exiting_");
        // */
        //return messageSent;
    }

    /**
     * @public
     * @nodered true
     * @method sendMessageToJidAnswer
     * @instance
     * @async
     * @category Ims MESSAGES
     * @description
     *  Send a reply to a one-2-one message to a contact identified by his Jid <br>
     * @param {String} message The message to send
     * @param {String} jid The contact Jid
     * @param {String} [lang=en] The content language used
     * @param {Object} [content] Allow to send alternative text base content
     * @param {String} [content.type=text/markdown] The content message type
     * @param {String} [content.message] The content message body
     * @param {String} [subject] The message subject
     * @param {String} [answeredMsg] The message answered
     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
     * @param {DataStoreType} p_messagesDataStore  used to override the general of SDK's parameter "messagesDataStore". default value `undefined` to use the general value.</br>
     * DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.</br>
     * DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).</br>
     * DataStoreType.StoreTwinSide The messages are fully stored.</br>
     * DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.</br>
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} - the message sent, or null in case of error, as parameter of the resolve

     */
    async sendMessageToJidAnswer(message, jid, lang, content, subject, answeredMsg, urgency: string = null, p_messagesDataStore: DataStoreType = undefined) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendMessageToJidAnswer) is jid defined : ", isDefined(jid), " is message defined : ", isDefined(message));
        if (!lang) {
            lang = "en";
        }

        if (!message) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToJidAnswer) bad or empty 'message' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(sendMessageToJidAnswer) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'message' parameter"}));
        }

        let typofansweredMsg = answeredMsg instanceof Object ;
        if (!typofansweredMsg && answeredMsg !== null ) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToJidAnswer) bad 'answeredMsg' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(sendMessageToJidAnswer) bad 'answeredMsg' parameter : ", answeredMsg);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad 'answeredMsg' parameter"}));
        } else {
            if (answeredMsg?.datastoretypeOfMsg === DataStoreType.NoStore || answeredMsg?.datastoretypeOfMsg === DataStoreType.NoPermanentStore) {
                that._logger.log(that.WARN, LOG_ID + "(sendMessageToJidAnswer) bad 'answeredMsg' parameter. Can not answer a message with a datastoretypeOfMsg set to not store message.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(sendMessageToJidAnswer) bad 'answeredMsg' parameter : Can not answer a message with a datastoretypeOfMsg set to not store message.");
                return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Can not answer a message with a datastoretypeOfMsg set to not store message : " + answeredMsg.datastoretypeOfMsg}));
            }
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > that._imOptions.messageMaxLength) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToJidAnswer) message not sent. The content is too long (" + messageSize + ")", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that._imOptions.messageMaxLength + " characters"}));
        }

        if (!jid) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToJidAnswer) bad or empty 'jid' parameter", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'jid' parameter"}));
        }

        let messageUnicode = shortnameToUnicode(message);

        jid = XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(jid);

        let messageSent = Promise.resolve(this._xmpp.sendChatMessage(messageUnicode, jid, lang, content, subject, answeredMsg, urgency, p_messagesDataStore));

        /*
        this.storePendingMessage(messageSent);
        await utils.until(() => {
               return this._pendingMessages[messageSent.id] === undefined;
            }
            , "Wait for the send chat message to be received by server", 30000);
        this.removePendingMessage(messageSent);
        that._logger.log(that.DEBUG, LOG_ID + "(sendMessageToJid) _exiting_");
        // */
        return messageSent;
    }

    /**
     * @public
     * @nodered true
     * @method sendMessageToJidAcknowledged
     * @instance
     * @async
     * @category Ims MESSAGES
     * @description
     *  Send an Acknowledged reply to an urgent message (one to one, or bubble) <br>
     * @param {Message} message The message to acknoledge 
     * @param {string} lang the lang used to acknowledged the message.
     * @param {string} ackLabel the label used to acknowledged the message.
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} - the message 
     */
    async sendMessageToJidAcknowledged(message : Message, lang : string = "EN", ackLabel : string = "Acknowledged", attention, p_messagesDataStore: DataStoreType) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendMessageToJidAcknowledged) is lang defined : ", isDefined(lang), " is message defined : ", isDefined(message));
        if ( message && message.urgency === "high" ) {
            if (message.fromBubbleJid ) {
                return that.sendMessageToBubbleJidAnswer(ackLabel, message.fromJid, lang, null, ackLabel, message,attention,"std", p_messagesDataStore).then((result) => {
                    that._logger.log(that.DEBUG, "(sendMessageToJidAcknowledged) - Acknowledged sent result : ", result);
                });
            }  else {
                return that.sendMessageToJidAnswer(ackLabel, message.fromJid, lang, null, ackLabel, message, "std", p_messagesDataStore).then((result) => {
                    that._logger.log(that.DEBUG, "(sendMessageToJidAcknowledged) - Acknowledged sent result : ", result);
                });
            } // */
        }
    }

    /**
     * @public
     * @nodered true
     * @method sendMessageToJidIgnored
     * @instance
     * @async
     * @category Ims MESSAGES
     * @description
     *  Send an Ignored reply to an urgent message (one to one, or bubble) <br>
     * @param {Message} message The message to Ignored
     * @param {string} lang the lang used to ignore the message.
     * @param {string} ignLabel the label used to ignore the message.
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} - the message 
     */
    async sendMessageToJidIgnored(message : Message, lang : string = "EN", ignLabel : string = "Ignored", p_messagesDataStore: DataStoreType) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendMessageToJidIgnored) is lang defined : ", isDefined(lang), " is message defined : ", isDefined(message));
        if ( message && message.urgency === "high" ) {
            if (message.fromBubbleJid ) {
                return that.sendMessageToBubbleJidAnswer(ignLabel, message.fromJid, lang, null, ignLabel, message,undefined,"std", p_messagesDataStore).then((result) => {
                    that._logger.log(that.DEBUG, "(sendMessageToJidIgnored) - Ignored sent result : ", result);
                });
            }  else {
                return that.sendMessageToJidAnswer(ignLabel, message.fromJid, lang, null, ignLabel, message, "std", p_messagesDataStore).then((result) => {
                    that._logger.log(that.DEBUG, "(sendMessageToJidIgnored) - Ignored sent result : ", result);
                });
            } // */
        }
    }

    /**
     * @public
     * @nodered true
     * @method sendMessageToBubble
     * @instance
     * @async
     * @category Ims MESSAGES
     * @description
     *  Send a message to a bubble <br>
     * @param {String} message The message to send
     * @param {Bubble} bubble The bubble (should at least have a jid property)
     * @param {String} [lang=en] The content language used
     * @param {Object} [content] Allow to send alternative text base content
     * @param {String} [content.type=text/markdown] The content message type
     * @param {String} [content.message] The content message body
     * @param {String} [subject] The message subject
     * @param {array} mentions array containing a list of JID of contact to mention or a string containing a single JID of the contact.
     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     */
    async sendMessageToBubble(message, bubble, lang, content, subject, mentions, urgency: string = null, p_messagesDataStore: DataStoreType) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendMessageToBubble) is bubble defined : ", isDefined(bubble), " is message defined : ", isDefined(message));
        if (!bubble || !bubble.jid) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToBubble) bad or empty 'bubble' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(sendMessageToBubble) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'bubble' parameter"}));
        }

        return this.sendMessageToBubbleJid(message, bubble.jid, lang, content, subject, mentions, urgency, p_messagesDataStore);
    }

    /**
     * @public
     * @nodered true
     * @method sendMessageToBubbleJid
     * @instance
     * @async
     * @category Ims MESSAGES
     * @description
     *  Send a message to a bubble identified by its JID <br>
     * @param {String} message The message to send
     * @param {String} jid The bubble JID
     * @param {String} [lang=en] The content language used
     * @param {Object} [content] Allow to send alternative text base content
     * @param {String} [content.type=text/markdown] The content message type
     * @param {String} [content.message] The content message body
     * @param {String} [subject] The message subject
     * @param {array|string} mentions array containing a list of JID of contact to mention or a string containing a sigle JID of the contact.
     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
     * @param {DataStoreType} p_messagesDataStore  used to override the general of SDK's parameter "messagesDataStore". default value `undefined` to use the general value.</br>
     * DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.</br>
     * DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).</br>
     * DataStoreType.StoreTwinSide The messages are fully stored.</br>
     * DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.</br>
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     */
    async sendMessageToBubbleJid(message : string, jid: string, lang: string, content: any, subject: string, mentions : Array<any> | string = null, urgency: string = null, p_messagesDataStore: DataStoreType = undefined) : Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendMessageToBubbleJid) is jid defined : ", isDefined(jid), " is message defined : ", isDefined(message));
        if (!lang) {
            lang = "en";
        }
        if (!message) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToBubbleJid) bad or empty 'message' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(sendMessageToBubbleJid) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'message' parameter"}));
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > that._imOptions.messageMaxLength) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToBubbleJid) message not sent. The content is too long (" + messageSize + ")", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that._imOptions.messageMaxLength + " characters"}));
        }

        if (!jid) {
            that._logger.log(that.DEBUG, LOG_ID + "(sendMessageToBubbleJid) bad or empty 'jid' parameter", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'jid' parameter"}));
        }

        let messageUnicode = shortnameToUnicode(message);

        jid = XMPPUTils.getXMPPUtils().getRoomJIDFromFullJID(jid);

        let bubble = await that._bulles.getBubbleByJid(jid);
        that._logger.log(that.INTERNAL, LOG_ID + "(sendMessageToBubbleJid) getBubbleByJid ", bubble);
        if (bubble.isActive ) {
            let messageSent1 = that._xmpp.sendChatMessageToBubble(messageUnicode, jid, lang, content, subject, undefined, mentions, urgency, p_messagesDataStore);
            return messageSent1;
        } else {
            try {
                that._logger.log(that.DEBUG, LOG_ID + "(sendMessageToBubbleJid) bubble is not active, so resume it before send the message.");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendMessageToBubbleJid) bubble is not active, so resume it before send the message. bubble : ", bubble);
                await that._presence.sendInitialBubblePresence(bubble);
                //that._logger.log(that.DEBUG, LOG_ID + "(sendMessageToBubbleJid) sendInitialBubblePresence succeed ");
                /*
                await until(() => {
                    return bubble.isActive === true;
                }, "Wait for the Bubble " + bubble.jid + " to be active");
                // */
                //that._logger.log(that.DEBUG, LOG_ID + "(sendMessageToBubbleJid) until succeed, so the bubble is now active, send the message.");
                let messageSent = that._xmpp.sendChatMessageToBubble(messageUnicode, jid, lang, content, subject, undefined, mentions, urgency, p_messagesDataStore);
                return messageSent;
            } catch (err) {
                return Promise.reject({message: "The sending message process failed!", error: err});
            }
        }
    }

    /**
     * @public
     * @nodered true
     * @method sendMessageToBubbleJidAnswer
     * @async
     * @category Ims MESSAGES
     * @instance
     * @description
     *  Send a message to a bubble identified by its JID <br>
     * @param {String} message The message to send
     * @param {String} jid The bubble JID
     * @param {String} [lang=en] The content language used
     * @param {Object} [content] Allow to send alternative text base content
     * @param {String} [content.type=text/markdown] The content message type
     * @param {String} [content.message] The content message body
     * @param {String} [subject] The message subject
     * @param {String} [answeredMsg] The message answered
     * @param {array} mentions array containing a list of JID of contact to mention or a string containing a sigle JID of the contact.
     * @param {string} urgency The urgence of the message. Value can be :   'high' Urgent message, 'middle' important message, 'low' information message, "std' or null standard message
     * @param {DataStoreType} p_messagesDataStore  used to override the general of SDK's parameter "messagesDataStore". default value `undefined` to use the general value.</br>
     * DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.</br>
     * DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).</br>
     * DataStoreType.StoreTwinSide The messages are fully stored.</br>
     * DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.</br>
     * @return {Promise<Message, ErrorManager>}
     * @fulfil {Message} the message sent, or null in case of error, as parameter of the resolve
     */
    async sendMessageToBubbleJidAnswer(message, jid, lang, content, subject, answeredMsg, mentions, urgency: string = null, p_messagesDataStore: DataStoreType = undefined) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendMessageToBubbleJidAnswer) is jid defined : ", isDefined(jid), " is message defined : ", isDefined(message));
        if (!lang) {
            lang = "en";
        }
        if (!message) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToBubbleJidAnswer) bad or empty 'message' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(sendMessageToBubbleJidAnswer) bad or empty 'message' parameter : ", message);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'message' parameter"}));
        }
        let typofansweredMsg = answeredMsg instanceof Object ;
        if (!typofansweredMsg && answeredMsg !== null ) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToBubbleJidAnswer) bad  'answeredMsg' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(sendMessageToBubbleJidAnswer) bad  'answeredMsg' parameter : ", answeredMsg);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad 'answeredMsg' parameter"}));
        } else {
            if (answeredMsg?.datastoretypeOfMsg === DataStoreType.NoStore || answeredMsg?.datastoretypeOfMsg === DataStoreType.NoPermanentStore) {
                that._logger.log(that.WARN, LOG_ID + "(sendMessageToBubbleJidAnswer) bad 'answeredMsg' parameter. Can not answer a message with a datastoretypeOfMsg set to not store message.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(sendMessageToBubbleJidAnswer) bad 'answeredMsg' parameter : Can not answer a message with a datastoretypeOfMsg set to not store message.");
                return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Can not answer a message with a datastoretypeOfMsg set to not store message : " + answeredMsg.datastoretypeOfMsg}));
            }
        }

        // Check size of the message
        let messageSize = message.length;
        if (content && content.message && typeof content.message === "string") {
            messageSize += content.message.length;
        }
        if (messageSize > that._imOptions.messageMaxLength) {
            that._logger.log(that.WARN, LOG_ID + "(sendMessageToBubbleJidAnswer) message not sent. The content is too long (" + messageSize + ")", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'strMessage' should be lower than " + that._imOptions.messageMaxLength + " characters"}));
        }

        if (!jid) {
            that._logger.log(that.DEBUG, LOG_ID + "(sendMessageToBubbleJidAnswer) bad or empty 'jid' parameter", jid);
            return Promise.reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Bad or empty 'jid' parameter"}));
        }

        let messageUnicode = shortnameToUnicode(message);

        jid = XMPPUTils.getXMPPUtils().getRoomJIDFromFullJID(jid);

        let bubble = await that._bulles.getBubbleByJid(jid);
        that._logger.log(that.INTERNAL, LOG_ID + "(sendMessageToBubbleJidAnswer) getBubbleByJid ", bubble);
        if (bubble.isActive) {
            let messageSent = that._xmpp.sendChatMessageToBubble(messageUnicode, jid, lang, content, subject, answeredMsg, mentions, urgency, p_messagesDataStore);
            return messageSent;
        } else {
            try {
                that._logger.log(that.DEBUG, LOG_ID + "(sendMessageToBubbleJidAnswer) bubble is not active, so resume it before send the message.");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendMessageToBubbleJidAnswer) bubble is not active, so resume it before send the message. bubble : ", bubble);
                await that._presence.sendInitialBubblePresence(bubble);
                //that._logger.log(that.DEBUG, LOG_ID + "(sendMessageToBubbleJidAnswer) sendInitialBubblePresence succeed ");
                /*
                await until(() => {
                    return bubble.isActive === true;
                }, "Wait for the Bubble " + bubble.jid + " to be active");
                 */
                //that._logger.log(that.DEBUG, LOG_ID + "(sendMessageToBubbleJidAnswer) until succeed, so the bubble is now active, send the message.");
                let messageSent = that._xmpp.sendChatMessageToBubble(messageUnicode, jid, lang, content, subject, answeredMsg, mentions, urgency, p_messagesDataStore);
                return messageSent;
            } catch (err) {
                return Promise.reject({message: "The sending message process failed!", error: err});
            }
        }
    }

    /**
     * @public
     * @nodered true
     * @since 2.21.0
     * @method retrieveXMPPMessagesByListOfMessageIds
     * @category Ims MESSAGES
     * @instance
     * @description
     *   This API allow user to retrieve it's ims by list of message Ids, peer and peer type <br> 
     *       If message cannot be retrieved response will return status not found. <br>
     * @return {Promise<any>} The result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object\[\] | list of retrieved message |
     * | msgId | String | xmpp id of the message |
     * | peer | String | peer jid with which message has been exchanged |
     * | status optionnel | String | request status<br><br>* unchanged: When XMPP server message copy has the same hash,<br>* not_found: When message was not found, |
     * | xml optionnel | String | message content if message has been successfully retrieved (not present if message was status unchanged) |
     * | hash optionnel | String | message hash if message has been successfully retrieved (not present if message was status unchanged) |
     * | timestamp optionnel | String | message timestamp if message has been successfully retrieved (not present if message was status unchanged) |
     *
     * @param {Array<any>} ims     list of object that contains the following: </BR>
     * [{ </BR>
     * **peer** : string jid with which message has been exchanged </BR>
     * **msgId** : string xmpp message id of the message to retrieve </BR>
     * **hash** optionnel : string md5 hash of the message to retrieve If hash is specified response will return status unchanged if XMPP message copy has the same hash Client should use hash whenever possible to reduce response size </BR>
     * **type** : string Conversation type: </BR>
     * - user: User to user, </BR>
     * - room: User to room, </BR>
     * - bot: User to bot </BR>
     * Possibles values : "user", "room", "bot" </BR>
     * }] </BR>
     * 
     */
    retrieveXMPPMessagesByListOfMessageIds(ims : Array<any>) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(retrieveXMPPMessagesByListOfMessageIds) is ims defined : ", isDefined(ims));
        return new Promise((resolve, reject) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveXMPPMessagesByListOfMessageIds) ims : ", ims);

            if (!ims) {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveXMPPMessagesByListOfMessageIds) bad or empty 'ims' parameter : ", ims);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.retrieveXMPPMessagesByListOfMessageIds(ims).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveXMPPMessagesByListOfMessageIds) result from server : ", result);
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    //region Pin list

    /**
     * @public
     * @nodered true
     * @since 2.33.0
     * @method addPinWithPeerId
     * @category Ims MESSAGES Pin list
     * @instance
     * @description
     *   This API can be used to add a pin in user's Pins list with peerId.<br>
     *   This API can only be used by user himself<br>
     *
     * @param {string} peerId peerId unique identifier</BR>
     * @param {PEERTYPE} types type of peer id Valeurs autorisées : rooms, users
     * @param {Object} body Pin List Object.
     *
     * @return {Promise<any>} The result
     *
     *
     * | Champ            | Type   | Description                                  |
     * |-----------------|--------|----------------------------------------------|
     * | `peerId`        | String | Id of the conversation's peer.              |
     * | `peerJid`       | String | Jid of the conversation's peer.             |
     * | `conversationJid` | String | Jid of the conversation's peer.          |
     * | `messageId`     | String | XMPP message Id.                            |
     * | `messageTimestamp` | Number | Timestamp of the message.               |
     * | `text`          | String | Pin's text.                                 |
     * | `fileInfo` *(optionnel)* | Object | File information.              |
     * | `creationDate` *(optionnel)* | Number | Creation date in ms since Unix epoch. |
     * |  id 	                  | String | Pin's Id                       |
     *
     *
     */
    addPinWithPeerId(peerId: string, types : PEERTYPE, body : any): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(addPinWithPeerId) is peerId defined : ", isDefined(peerId));
        return new Promise((resolve, reject) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(addPinWithPeerId) peerId : ", peerId);

            if (!peerId) {
                that._logger.log(that.DEBUG, LOG_ID + "(addPinWithPeerId) bad or empty 'peerId' parameter : ", peerId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!types) {
                that._logger.log(that.DEBUG, LOG_ID + "(addPinWithPeerId) bad or empty 'types' parameter : ", types);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!body) {
                that._logger.log(that.DEBUG, LOG_ID + "(addPinWithPeerId) bad or empty 'body' parameter : ", body);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.addPinWithPeerId(peerId, types, body ).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(addPinWithPeerId) result from server : ", result);
                return resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    };

    /**
     * @public
     * @nodered true
     * @since 2.33.0
     * @method getPinWithPeerIdById
     * @category Ims MESSAGES Pin list
     * @instance
     * @description
     *   This API can be used to get a pin in user's Pins list by peerId and pinId.<br>
     *   This API can only be used by user himself<br>
     *
     * @param {PEERTYPE} types type of peer id Valeurs autorisées : rooms, users
     * @param {string} peerId peerId unique identifier</BR>
     * @param {string} pinId id of Pin.
     *
     * @return {Promise<any>} The result
     *
     *
     * | Champ            | Type   | Description                                  |
     * |-----------------|--------|----------------------------------------------|
     * | `peerId`        | String | Id of the conversation's peer.              |
     * | `peerJid`       | String | Jid of the conversation's peer.             |
     * | `conversationJid` | String | Jid of the conversation's peer.          |
     * | `messageId`     | String | XMPP message Id.                            |
     * | `messageTimestamp` | Number | Timestamp of the message.               |
     * | `text`          | String | Pin's text.                                 |
     * | `fileInfo` *(optionnel)* | Object | File information.              |
     * | `creationDate` *(optionnel)* | Number | Creation date in ms since Unix epoch. |
     * |  id 	                  | String | Pin's Id                       |
     *
     *
     */
    getPinWithPeerIdById (types: PEERTYPE, peerId: string, pinId: string) : Promise<any> {
            let that = this;
            that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getPinWithPeerIdById) is peerId defined : ", isDefined(peerId));
            return new Promise((resolve, reject) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(getPinWithPeerIdById) peerId : ", peerId);

                if (!peerId) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getPinWithPeerIdById) bad or empty 'peerId' parameter : ", peerId);
                    return reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!types) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getPinWithPeerIdById) bad or empty 'types' parameter : ", types);
                    return reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!pinId) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getPinWithPeerIdById) bad or empty 'pinId' parameter : ", pinId);
                    return reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.getPinWithPeerIdById(types, peerId, pinId ).then(async (result) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(getPinWithPeerIdById) result from server : ", result);
                    return resolve(result);
                }).catch((err) => {
                    return reject(err);
                });
            });
        }

    /**
     * @public
     * @nodered true
     * @since 2.33.0
     * @method getAllPinsWithPeerId
     * @category Ims MESSAGES Pin list
     * @instance
     * @description
     *   This API can be used to get all pin in user's Pins list by peerId.<br>
     *   This API can only be used by user himself<br>
     *
     * @param {PEERTYPE} types type of peer id Valeurs autorisées : rooms, users
     * @param {string} peerId peerId unique identifier</BR>
     *
     * @return {Promise<any>} The result
     *
     * Array of pin Object : </BR>
     *
     * | Champ            | Type   | Description                                  |
     * |-----------------|--------|----------------------------------------------|
     * | `peerId`        | String | Id of the conversation's peer.              |
     * | `peerJid`       | String | Jid of the conversation's peer.             |
     * | `conversationJid` | String | Jid of the conversation's peer.          |
     * | `messageId`     | String | XMPP message Id.                            |
     * | `messageTimestamp` | Number | Timestamp of the message.               |
     * | `text`          | String | Pin's text.                                 |
     * | `fileInfo` *(optionnel)* | Object | File information.              |
     * | `creationDate` *(optionnel)* | Number | Creation date in ms since Unix epoch. |
     * |  id 	                  | String | Pin's Id                       |
     *
     *
     */
    getAllPinsWithPeerId (types:PEERTYPE, peerId:string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllPinsWithPeerId) is peerId defined : ", isDefined(peerId));
        return new Promise((resolve, reject) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllPinsWithPeerId) peerId : ", peerId);

            if (!peerId) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllPinsWithPeerId) bad or empty 'peerId' parameter : ", peerId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!types) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllPinsWithPeerId) bad or empty 'types' parameter : ", types);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.getAllPinsWithPeerId(types, peerId ).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllPinsWithPeerId) result from server : ", result);
                return resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @since 2.33.0
     * @method removefromWithPeerIdAndPinId
     * @category Ims MESSAGES Pin list
     * @instance
     * @description
     *   This API can be used to remove a pin in user's Pins list by peerId and pinId.<br>
     *   This API can only be used by user himself<br>
     *
     * @param {PEERTYPE} types type of peer id Valeurs autorisées : rooms, users
     * @param {string} peerId peerId unique identifier</BR>
     * @param {string} pinId id of Pin.
     *
     * @return {Promise<any>} The result
     *
     * Array of : </BR>
     *
     * | Champ            | Type   | Description                                  |
     * |-----------------|--------|----------------------------------------------|
     * | status 	     | String | deletion status.              |
     *
     *
     */
    removefromWithPeerIdAndPinId (types: PEERTYPE, peerId: string, pinId: string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(removefromWithPeerIdAndPinId) is peerId defined : ", isDefined(peerId));
        return new Promise((resolve, reject) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(removefromWithPeerIdAndPinId) peerId : ", peerId);

            if (!peerId) {
                that._logger.log(that.DEBUG, LOG_ID + "(removefromWithPeerIdAndPinId) bad or empty 'peerId' parameter : ", peerId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!types) {
                that._logger.log(that.DEBUG, LOG_ID + "(removefromWithPeerIdAndPinId) bad or empty 'types' parameter : ", types);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.removefromWithPeerIdAndPinId(types, peerId, pinId ).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(removefromWithPeerIdAndPinId) result from server : ", result);
                return resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @since 2.33.0
     * @method updatePinWithPeerId
     * @category Ims MESSAGES Pin list
     * @instance
     * @description
     *   This API can be used to add a pin in user's Pins list with peerId.<br>
     *   This API can only be used by user himself<br>
     *
     * @param {string} peerId peerId unique identifier</BR>
     * @param {PEERTYPE} types type of peer id Valeurs autorisées : rooms, users
     * @param {string} pinId id of Pin.
     * @param {Object} body Pin List Object.
     *
     * @return {Promise<any>} The result
     *
     *
     * | Champ            | Type   | Description                                  |
     * |-----------------|--------|----------------------------------------------|
     * | `peerId`        | String | Id of the conversation's peer.              |
     * | `peerJid`       | String | Jid of the conversation's peer.             |
     * | `conversationJid` | String | Jid of the conversation's peer.          |
     * | `messageId`     | String | XMPP message Id.                            |
     * | `messageTimestamp` | Number | Timestamp of the message.               |
     * | `text`          | String | Pin's text.                                 |
     * | `fileInfo` *(optionnel)* | Object | File information.              |
     * | `creationDate` *(optionnel)* | Number | Creation date in ms since Unix epoch. |
     * |  id 	                  | String | Pin's Id                       |
     *
     *
     */
    updatePinWithPeerId (peerId?: string, types ?: PEERTYPE, pinId? : string, body ?: any): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(updatePinWithPeerId) is peerId defined : ", isDefined(peerId));
        return new Promise((resolve, reject) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(updatePinWithPeerId) peerId : ", peerId);

            if (!peerId) {
                that._logger.log(that.DEBUG, LOG_ID + "(updatePinWithPeerId) bad or empty 'peerId' parameter : ", peerId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!types) {
                that._logger.log(that.DEBUG, LOG_ID + "(updatePinWithPeerId) bad or empty 'types' parameter : ", types);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!body) {
                that._logger.log(that.DEBUG, LOG_ID + "(updatePinWithPeerId) bad or empty 'body' parameter : ", body);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.updatePinWithPeerId(peerId, types, pinId, body ).then(async (result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(updatePinWithPeerId) result from server : ", result);
                return resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    //endregion Pin list

    //endregion Ims MESSAGES

    //region Events
    
    _onmessageReceipt(receipt) {
        let that = this;
        return;
        /*if (this._pendingMessages[receipt.id]) {
            let messagePending = this._pendingMessages[receipt.id].message;
            that._logger.log(that.WARN, LOG_ID + "(_onmessageReceipt) the pending message received from server, so remove from pending", messagePending);
            this.removePendingMessage(messagePending);
        }
        that._logger.log(that.WARN, LOG_ID + "(_onmessageReceipt) the pending messages : ", that._pendingMessages);
        // */
    }

    //endregion Events

    //region Ims TYPING
    
    /**
     * @public
     * @nodered true
     * @method sendIsTypingStateInBubble
     * @async
     * @category Ims TYPING
     * @instance 
     * @description
     *    Switch the "is typing" state in a bubble/room<br> <br>
     * @param {Bubble} bubble The destination bubble
     * @param {boolean} status The status, true for setting "is Typing", false to remove it
     * @return {Object} Return a promise with no parameter when succeed.
     */
    async sendIsTypingStateInBubble(bubble, status, p_messagesDataStore: DataStoreType) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendIsTypingStateInBubble) is bubble defined : ", isDefined(bubble), " is status defined : ", isDefined(status));
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
                    that._logger.log(that.INTERNAL,  LOG_ID + "sendIsTypingStateInBubble - bubble : ", bubble, "status : ", status);

                    that._conversations.getBubbleConversation(bubble.jid, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined).then(async function (conversation) {
                        if (!conversation) {
                            return reject(Object.assign( ErrorManager.getErrorManager().OTHERERROR("ERRORNOTFOUND", "ERRORNOTFOUND"), {msg: "No 'conversation' found for this bubble"}));
                        }
                        else {
                            await that._xmpp.sendIsTypingState(conversation, status, p_messagesDataStore) ;
                            //conversationService.sendIsTypingState(conversation, status);
                            resolve(undefined);
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
     * @nodered true
     * @method sendIsTypingStateInConversation
     * @instance
     * @async
     * @category Ims TYPING
     * @description
     *    Switch the "is typing" state in a conversation<br>
     * @param {Conversation} conversation The conversation recipient
     * @param {boolean} status The status, true for setting "is Typing", false to remove it
     * @param {DataStoreType} p_messagesDataStore  used to override the general of SDK's parameter "messagesDataStore". default value `undefined` to use the general value.</br>
     * DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.</br>
     * DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).</br>
     * DataStoreType.StoreTwinSide The messages are fully stored.</br>
     * DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.</br>
     * @return Return a promise with no parameter when succeed
     */
    async sendIsTypingStateInConversation(conversation : Conversation, status: boolean, p_messagesDataStore: DataStoreType = undefined) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendIsTypingStateInConversation) is conversation defined : ", isDefined(conversation), " is status defined : ", isDefined(status));
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
                    if (that._useXMPP) {
                        await that._xmpp.sendIsTypingState(conversation, status, p_messagesDataStore);
                        resolve(undefined);
                    } else if (that._useS2S) {
                        let state: CHATSTATE = CHATSTATE.COMPOSING;
                        if (!status) {
                            state = CHATSTATE.ACTIVE;
                        }
                        await that._rest.sendS2SChatState(conversation.dbId, state);
                        resolve(undefined);
                    }
                }
            }
        });
    }

    //endregion Ims TYPING

    //region Ims Application Messages

    /**
     * @public
     * @nodered true
     * @method sendApplicationMessageContactJid
     * @instance
     * @async
     * @category Ims Application Messages
     * @description
     * Sends a message to a Contact Jid that is ignored in the UCaaS app's message stream
     * (e.g., in Rainbow Web Client, Desktop, Android, or iOS).
     * Useful for bots to communicate with other bots in the same conversation
     * without involving other users via the default application.
     *
     * Note: If a peer send the same kind of message, then the SDK receive the `rainbow_onrainbowcpaasreceived` event. It is Fired when a `rainbow-cpaas` event is receveid for a private data exchange.
     * @param jid - The Contact Jid to which the message is sent
     * @param xmlElements - List of XML elements to create
     * @param {DataStoreType} p_messagesDataStore  used to override the general of SDK's parameter "messagesDataStore". default value `undefined` to use the general value.</br>
     * DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.</br>
     * DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).</br>
     * DataStoreType.StoreTwinSide The messages are fully stored.</br>
     * DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.</br>
     * @return {Promise<any>} - that resolves on success
     *
     *
     * exemple:
     *
     * ```
     *
     *  const Element = require('ltx').Element;
     *  let contactEmailToSearch = "xxx@xxx.com";
     *  // Retrieve a contact by its id
     *  let contact = await rainbowSDK.contacts.getContactByLoginEmail(contactEmailToSearch);
     *  // Retrieve the associated conversation
     *  let conversation = await rainbowSDK.conversations.openConversationForContact(contact);
     *  let now = new Date().getTime();
     *  let xmlElements = new Element('instance', {'xmlns': 'tests:rainbownodesdk', 'id': now });
     *  xmlElements.cnode(new Element('displayName').t("My displayName"));
     *  xmlElements.cnode(new Element('description').t("My description"));
     *  // Send message
     *  let msgSent = await rainbowSDK.im.sendApplicationMessageContactJid(contact.jid, xmlElements);
     *
     * ```
     *
     */
    async sendApplicationMessageContactJid(jid: any, xmlElements: Element, p_messagesDataStore: DataStoreType = undefined): Promise<boolean> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendApplicationMessageContactJid) is conversation defined : ", isDefined(jid), " is xmlElements defined : ", isDefined(xmlElements));
        return new Promise(async (resolve, reject) => {
            let type = "chat";
            // const TYPE_CHAT = "chat";
            // const TYPE_GROUPCHAT = "groupchat";
            if (!isDefined(xmlElements)) {
                return reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'xmlElements' is missing or null"}));
            }

            if (!isDefined(jid)) {
                return reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'jid' is missing or null"}));
            }

            try {
                const result = await that._xmpp.sendApplicationMessageAsync(jid, type, xmlElements, p_messagesDataStore);
                return resolve(result);
            } catch (error) {
                return reject( error);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method sendApplicationMessageBubbleJid
     * @instance
     * @async
     * @category Ims Application Messages
     * @description
     * Sends a message to a Bubble Jid that is ignored in the UCaaS app's message stream
     * (e.g., in Rainbow Web Client, Desktop, Android, or iOS).
     * Useful for bots to communicate with other bots in the same conversation
     * without involving other users via the default application.
     *
     * @param {any} jid - The Bubble Jid to which the message is sent
     * @param {Element} xmlElements - List of XML elements to create
     * @param {DataStoreType} p_messagesDataStore  used to override the general of SDK's parameter "messagesDataStore". default value `undefined` to use the general value.</br>
     * DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.</br>
     * DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).</br>
     * DataStoreType.StoreTwinSide The messages are fully stored.</br>
     * DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.</br>
     * @return {Promise<any>} - that resolves on success
     *
     *
     *
     */
    async sendApplicationMessageBubbleJid(jid: any, xmlElements: Element, p_messagesDataStore: DataStoreType = undefined): Promise<boolean> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendApplicationMessageBubbleJid) is conversation defined : ", isDefined(jid), " is xmlElements defined : ", isDefined(xmlElements));
        return new Promise(async (resolve, reject) => {
            let type = "groupchat";
            // const TYPE_CHAT = "chat";
            // const TYPE_GROUPCHAT = "groupchat";

            if (!isDefined(xmlElements)) {
                return reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'xmlElements' is missing or null"}));
            }

            if (!isDefined(jid)) {
                return reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'jid' is missing or null"}));
            }

            try {
                const result = await that._xmpp.sendApplicationMessageAsync(jid, type, xmlElements, p_messagesDataStore);
                return resolve(result);
            } catch (error) {
                return reject( error);
            }
        });
    }

    //endregion Ims Application Messages

    //region Voicemail

    /**
     * @public
     * @nodered true
     * @method sendVoicemailTranscriptionMessage
     * @instance
     * @async
     * @category Voicemail
     * @description
     * Sends a message to a contact Jid to add a voice message in the list.
     *
     * @param {string} to - The Jid to which the message is sent
     * @param {any} transcriptInfo : { jid : string, date : string, duration : number, url : string, transcript : string} = { jid : undefined, date : new Date().toISOString(), duration : 0, url : undefined, transcript : undefined} - informations of the voice mail.
     * @param {DataStoreType} p_messagesDataStore  used to override the general of SDK's parameter "messagesDataStore". default value `undefined` to use the general value.</br>
     * DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.</br>
     * DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).</br>
     * DataStoreType.StoreTwinSide The messages are fully stored.</br>
     * DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.</br>
     * @return {Promise<any>} - that resolves on success
     *
     *
     *
     */
    async sendVoicemailTranscriptionMessage(to : string, transcriptInfo : { jid : string, date : string, duration : number, fileDescId: string, fromNumber: string, transcript : string} = { jid : undefined, date : new Date().toISOString(), duration : 0, fileDescId: undefined, fromNumber: undefined, transcript : undefined}, p_messagesDataStore: DataStoreType ) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendApplicationMessageBubbleJid) is transcriptInfo.fileDescId defined : ", isDefined(transcriptInfo?.fileDescId), " is transcriptInfo.transcript defined : ", isDefined(transcriptInfo?.transcript));
        return new Promise(async (resolve, reject) => {
            let type = "groupchat";
            // const TYPE_CHAT = "chat";
            // const TYPE_GROUPCHAT = "groupchat";

            if (!isDefined(to)) {
                to = that._xmpp.jid;
            }

            if (!isDefined(transcriptInfo.jid)) {
                to = that._xmpp.jid;
            }

            if (!isDefined(transcriptInfo.duration)) {
                return reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'duration' is missing or null"}));
            }

            if (!isDefined(transcriptInfo.fileDescId)) {
                return reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'fileDescId' is missing or null"}));
            }

            if (!isDefined(transcriptInfo.fromNumber)) {
                return reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'fromNumber' is missing or null"}));
            }

            if (!isDefined(transcriptInfo.transcript)) {
                return reject(Object.assign(ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'transcript' is missing or null"}));
            }

            try {
                const result = await that._xmpp.sendVoicemailTranscriptionMessage(to, transcriptInfo, p_messagesDataStore);
                return resolve(result);
            } catch (error) {
                return reject( error);
            }
        });

    }

    //endregion Voicemail

}

module.exports.ImsService = ImsService;
export {ImsService};
