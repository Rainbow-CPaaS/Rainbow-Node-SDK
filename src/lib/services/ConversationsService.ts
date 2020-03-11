"use strict";
import {ContactsService} from "./ContactsService";

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {Conversation} from "../common/models/Conversation";
import {Call} from "../common/models/Call";
import * as moment from "moment";
import {Deferred, logEntryExit} from "../common/Utils";
import * as PubSub from "pubsub-js";
import {ConversationEventHandler} from "../connection/XMPPServiceHandler/conversationEventHandler";
import {ConversationHistoryHandler} from "../connection/XMPPServiceHandler/conversationHistoryHandler";
import {shortnameToUnicode} from "../common/Emoji";
import {FileViewerElementFactory as fileViewerElementFactory} from "../common/models/FileViewer";
import {isStarted} from "../common/Utils";
import {BubblesService} from "./BubblesService";
import {FileStorageService} from "./FileStorageService";
import {FileServerService} from "./FileServerService";
import {Logger} from "../common/Logger";
import {EventEmitter} from "events";
import {Contact} from "../common/models/Contact";
import {rejects} from "assert";
import {error} from "winston";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import {PresenceService} from "./PresenceService";

const LOG_ID = "CONVERSATIONS/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name Conversations
 * @version SDKVERSION
 * @public
 * @description
 * This module is the basic module for handling conversations in Rainbow. In Rainbow, conversations are the way to get in touch with someone or something (i.e. a Rainbow contact, a external phone number, a connected thing, ...) so a conversation is the "long tail" of communication between you and someone or something else like a bubble.
 * A Rainbow conversation by default supports sending and receiving Instant Messages with a single recipient (one-to-one conversation) or with several persons (bubble). Using the FileStorage service, you can share files in conversations.
 *
 * The main methods and events proposed in that service allow to:
 *   - Create or close a Rainbow conversation (one-to-one of bubble),
 *   - Get all conversations or get a conversation by Id, bubbleID or bubbleJid
 *   - Retrieve all information linked to that conversation,
 *
 *   */
class Conversations {
    private _xmpp: XMPPService;
    private _rest: RESTService;
    private _options: any;
    private _s2s: S2SService;
    private _useXMPP: any;
    private _useS2S: any;
    _contacts: ContactsService;
    private _fileStorageService: FileStorageService;
    private _fileServerService: FileServerService;
    private _presence: PresenceService;
    private _eventEmitter: EventEmitter;
    private _logger: Logger;
    private pendingMessages: any;
    private _conversationEventHandler: ConversationEventHandler;
    private _conversationHandlerToken: any;
    private _conversationHistoryHandlerToken: any;
    public conversations: any;
    private _conversationServiceEventHandler: any;
    private _bubbles: any;
	public activeConversation: any;
	public inCallConversations: any;
	public idleConversations: any;
	public involvedContactIds: any;
	public involvedRoomIds: any;
	public waitingBotConversations: any;
	public botServiceReady: any;
    private _conversationHistoryHandler: ConversationHistoryHandler;
    private chatRenderer: any;
    public ready: boolean = false;
    private readonly _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    private conversationsRetrievedFormat: string = "small";
    private nbMaxConversations: any;
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    constructor(_eventEmitter : EventEmitter, _logger : Logger, _startConfig, _conversationsRetrievedFormat, _nbMaxConversations) {
        this._startConfig = _startConfig;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._contacts = null;
        this._fileStorageService = null;
        this._fileServerService = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
        this.pendingMessages = {};
        this._conversationEventHandler = null;
        this._conversationHandlerToken = [];
        this._conversationHistoryHandlerToken = [];
        this.conversationsRetrievedFormat = _conversationsRetrievedFormat;
        this.nbMaxConversations = _nbMaxConversations;

        //that._eventEmitter.removeListener("evt_internal_onreceipt", that._onReceipt.bind(that));
        this.ready = false;

        this._eventEmitter.on("evt_internal_onreceipt", this._onReceipt.bind(this));

    }

    start(_options, _core : Core) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService, _contacts : ContactsService, _bubbles : BubblesService, _fileStorageService : FileStorageService, _fileServerService : FileServerService
        let that = this;
        that._conversationHandlerToken = [];
        that._conversationHistoryHandlerToken= [];
        return new Promise((resolve, reject) => {
            try {
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;
                that._options = _options;
                that._s2s = _core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                that._contacts = _core.contacts;
                that._bubbles = _core.bubbles;
                that._fileStorageService = _core.fileStorage;
                that._fileServerService = _core.fileServer;
                that._presence = _core.presence;

                that.activeConversation = null;
                that.conversations = [];

                that.inCallConversations = [];
                that.idleConversations = [];
                that.involvedContactIds = [];
                that.involvedRoomIds = [];

                //all conversations with Bots
                that.waitingBotConversations = [];
                that.botServiceReady = false;


                that.attachHandlers();

                this.ready = true;
                resolve();

            } catch (err) {
                that._logger.log("error", LOG_ID + "(start) !!! Catch error.");
                that._logger.log("internalerror", LOG_ID + "(start) !!! Catch error : ", err);
                return reject(err);
            }
        });
    }

    stop() {
        let that = this;
        return new Promise((resolve, reject) => {
            try {
                that._xmpp = null;
                that._rest = null;

                delete that._conversationEventHandler;
                that._conversationEventHandler = null;
                if (that._conversationHandlerToken) {
                    that._conversationHandlerToken.forEach((token) => PubSub.unsubscribe(token));
                }
                that._conversationHandlerToken = [];

                if (that._conversationHistoryHandlerToken) {
                    that._conversationHistoryHandlerToken.forEach((token) => PubSub.unsubscribe(token));
                }
                that._conversationHistoryHandlerToken = [];

                //that._eventEmitter.removeListener("evt_internal_onreceipt", that._onReceipt.bind(that));
                this.ready = false;

                resolve();
            } catch (err) {
                return reject(err);
            }
        });
    }

    attachHandlers() {
        let that = this;
        that._conversationEventHandler = new ConversationEventHandler(that._xmpp, that, that._fileStorageService, that._fileServerService);
        that._conversationHandlerToken = [
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationEventHandler.MESSAGE_CHAT, that._conversationEventHandler.onChatMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationEventHandler.MESSAGE_GROUPCHAT, that._conversationEventHandler.onChatMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationEventHandler.MESSAGE_WEBRTC, that._conversationEventHandler.onWebRTCMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationEventHandler.MESSAGE_MANAGEMENT, that._conversationEventHandler.onManagementMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationEventHandler.MESSAGE_ERROR, that._conversationEventHandler.onErrorMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationEventHandler.MESSAGE_CLOSE, that._conversationEventHandler.onCloseMessageReceived)
        ];

        that._conversationHistoryHandler = new ConversationHistoryHandler(that._xmpp, this);
        that._conversationHistoryHandlerToken = [
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationHistoryHandler.MESSAGE_MAM, that._conversationHistoryHandler.onMamMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationHistoryHandler.FIN_MAM, that._conversationHistoryHandler.onMamMessageReceived)
        ];
    }

    _onReceipt(receipt) {
        let that = this;
        let messageInfo = this.pendingMessages[receipt.id];
        if (messageInfo && messageInfo.message) {
            let message = messageInfo.message;
            let conversation = messageInfo.conversation;

            that._logger.log("debug", LOG_ID + "[conversationService] Receive server ack (" + conversation.id + ", " + message.id + ")");
            //message.setReceiptStatus(Message.ReceiptStatus.SENT);
            conversation.addMessage(message);
            that.removePendingMessage(message);
            //delete this.pendingMessages[message.id];
            // Send event
            that._eventEmitter.emit("evt_internal_conversationupdated", conversation);
        }
    }

    /**
     * @private
     * @method
     * @instance
     * @description
     *    Allow to get the list of existing conversations from server (p2p and bubbles)
     * @return {Conversation[]} An array of Conversation object
     */
    getServerConversations() {
        let that = this;

        return new Promise(async (resolve, reject) => {

            await that._rest.getServerConversations(that.conversationsRetrievedFormat).then(async (conversations : []) => {
                await that.removeOlderConversations(conversations);
            }).catch((error) => {
                that._logger.log("warn", LOG_ID + "getServerConversations Failed to retrieve conversations for removeOlderConversations : ", error);
                that._logger.log("internalerror", LOG_ID + "getServerConversations Failed to retrieve conversations for removeOlderConversations : ", error);
                // The remove of old conversations is not mandatory, so lets continue the treatment.
            });

            that._rest.getServerConversations(that.conversationsRetrievedFormat).then((conversations : []) => {
                    // Create conversation promises
                    let conversationPromises = [];
                    that._logger.log("debug", LOG_ID + "getServerConversations conversations.length retrieved : ", conversations.length);
                    conversations.forEach(function (conversationData : any) {
                            let missedImCounter = parseInt(conversationData.unreadMessageNumber, 10);
                            let conversationPromise = null;
                            let muted = (conversationData.mute === true);
                            //that._logger.log("debug", LOG_ID + "getServerConversations conversationData retrieved : ", conversationData);
                            if (conversationData.type === "user") {
                                conversationPromise = that.getOrCreateOneToOneConversation(conversationData.jid_im, conversationData.id, conversationData.lastMessageDate, conversationData.lastMessageText, missedImCounter, muted, conversationData.creationDate);
                            } else {
                                conversationPromise = that.getBubbleConversation(conversationData.jid_im, conversationData.id, conversationData.lastMessageDate, conversationData.lastMessageText, missedImCounter, true, muted, conversationData.creationDate, conversationData.lastMessageSender);
                            } // */
                            conversationPromises.push(conversationPromise);
                        });

                    // Resolve all promises
                    return Promise
                        .all(conversationPromises)
                         /*.then(async (result) => {
                             await that.removeOlderConversations();
                             return result;
                         }) // */
                        .then((conversationsResult) => {
                            //that.orderConversations();
                            resolve(conversationsResult);
                        })
                        .catch((error) => {
                            let errorMessage = "getServerConversations failure: " + error.message;
                            that._logger.log("error", LOG_ID + "error.");
                            that._logger.log("internalerror", LOG_ID + "error : ", errorMessage);
                            return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                        });
                })
                .catch((err) => {
                    let errorMessage = "getServerConversations failure: no server response";

                    if (err) {
                        errorMessage = "getServerConversations failure: " + JSON.stringify(err);
                    }

                    that._logger.log("error", LOG_ID + "error.");
                    that._logger.log("internalerror", LOG_ID + "error : ", errorMessage);
                    return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                });
        });
    }

    /**
     * @private
     * @method
     * @instance
     * @description
     *    Allow to create a conversations on server (p2p and bubbles)
     * @param {String} conversation of the conversation (dbId field)
     * @return {Conversation} Created conversation object
     */
    createServerConversation(conversation) {
        let that = this;
        // Ignore already stored existing conversation
        if (conversation.dbId) { return Promise.resolve(conversation); }

        // Prepare global variables
        let data = {peerId:null, type: null};

        // Handle one to one conversation
        if (conversation.type === Conversation.Type.ONE_TO_ONE) {
            // Ignore conversation with user without dbId
            if (!conversation.contact.id) { return Promise.resolve(conversation); }

            // Fill conversation request data
            data.peerId = conversation.contact.id;
            data.type = "user";
        }

        else if (conversation.type === Conversation.Type.BOT) {
            conversation.type = Conversation.Type.ONE_TO_ONE;

            // Ignore conversation with user without dbId
            if (!conversation.contact.id) { return Promise.resolve(conversation); }

            // Fill conversation request data
            data.peerId = conversation.contact.id;
            data.type = "bot";
        }

        // Handle bubble conversation
        else {
            // Fill conversation request data
            data.peerId = conversation.bubble.id;
            data.type = "room";
        }

        if (conversation.bubble && conversation.bubble.avatar) {
            let avatarRoom = conversation.bubble.avatar;
        }

        return this._rest.createServerConversation( data ).then((result : any)=> {
            that._logger.log("info", LOG_ID + "createServerConversation success: " + conversation.id);
                conversation.dbId = result.id;
                conversation.lastModification = result.lastMessageDate ? new Date(result.lastMessageDate) : undefined;
                conversation.creationDate = result.creationDate ? new Date(result.creationDate) : new Date();
                conversation.missedCounter = parseInt(result.unreadMessageNumber, 10);
               /* if (avatarRoom) {
                    conversation.bubble.avatar = avatarRoom;
                } */
                // TODO ? that.orderConversations();
                return Promise.resolve(conversation);
        }).catch( (err) => {
            let errorMessage = "createServerConversation failure: " + err.errorDetails;
            that._logger.log("error", LOG_ID + "" + errorMessage);
                return Promise.reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
        });
    } // */

    removeOlderConversations (conversations? : [] ) {
        let that = this;
        return new Promise((resolve,reject) => {
            // if (!authService.fromSDK) {
            let maxConversations = that.nbMaxConversations;
            //add protection when the local storage does not work correctly ...
            if (!maxConversations || maxConversations < 15) {
                that.nbMaxConversations = 15;
                maxConversations = 15;
            }

            let orderedConversations = conversations? conversations.sort(that.sortFunction) : that.getConversations().sort(that.sortFunction);
            that._logger.log("debug", LOG_ID + "(removeOlderConversations) -- maxConversations : ", maxConversations);
            if (orderedConversations.length > maxConversations) {
                that._logger.log("debug", LOG_ID + "(removeOlderConversations) -- orderedConversations : ", orderedConversations.length);
                let removePromises = [];
                for (let index = maxConversations; index < orderedConversations.length; index++) {
                    let conv = orderedConversations[index];
                    if (conv) {
                        removePromises.push(that.deleteServerConversation(conv.id));
                    } else {
                        that._logger.log("debug", LOG_ID + "(removeOlderConversations) -- conversation undefined, so cannot delete it.");
                    }
                }
                Promise.all(removePromises).then((result) => {
                    resolve(result);
                }).catch((err) => {
                    resolve(err);
                });
            } else {
                resolve();
            }
        });
    };

    sortFunction (aa, bb) {
        let aLast = aa.lastModification;
        let aCreation = aa.creationDate;
        let bLast = bb.lastModification;
        let bCreation = bb.creationDate;

        let aDate = aCreation;
        let bDate = bCreation;

        //get the most recent of the creation date or the last message date
        if (!aLast && aCreation) {
            aDate = aCreation;
        } else {
            aDate = aLast;
        }

        if (!bLast && bCreation) {
            bDate = bCreation;
        } else {
            bDate = bLast;
        }

        return (bDate - aDate);
    };

   /* formatDate (date){
        return moment(date).utc().format("YYYY-MM-DDTHH:mm:ss") + "Z";
    }; // */

    /**
     * @private
     * @method
     * @instance
     * @description
     *    Allow to delete a conversation on server (p2p and bubbles)
     * @param {String} conversationId of the conversation (id field)
     * @return {Promise}
     */
    deleteServerConversation(conversationId) {
        let that = this;

        that._logger.log("info", LOG_ID + "deleteServerConversation conversationId : ", conversationId);

        // Ignore conversation without dbId
        if (!conversationId) { return Promise.resolve(); }

        return that._rest.deleteServerConversation(conversationId).then( (result ) => {
            // TODO ? that.orderConversations();
            return Promise.resolve(result);
        }).catch( (err) => {
            that._logger.log("internalerror", LOG_ID + "(deleteServerConversation) err : ", err);
            // Check particular case where we are trying to remove an already removed conversation
            if (err.errorDetailsCode === 404002 || err.error.errorDetailsCode === 404002 ) {
                that._logger.log("info", LOG_ID + "deleteServerConversation success: " + conversationId);
                return Promise.resolve();
            }

            let errorMessage = "deleteServerConversation failure: " + err.error ? err.error.errorDetails : err.errorDetails;
            that._logger.log("warn", LOG_ID + "Error.");
            that._logger.log("internalerror", LOG_ID + "Error : ", errorMessage);
            return Promise.reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));

        });
    }

    /**
     * @private
     * @method
     * @instance
     * @description
     *    Allow to mute notification in a conversations (p2p and bubbles)
     *    When a conversation is muted/unmuted, all user's resources will receive the notification
     * @param {String} ID of the conversation (dbId field)
     * @param {Boolean} mute mutation state
     * @return {Promise}
     */
    updateServerConversation(conversationId, mute) {

        // Ignore conversation without dbId
        if (!conversationId) { return Promise.resolve(); }

        return this._rest.updateServerConversation(conversationId, mute);
    }

    /**
     * @public
     * @method sendConversationByEmail
     * @instance
     * @description
     *    Allow to get the specified conversation as mail attachment to the login email of the current user (p2p and bubbles)
     *    can be used to backup a conversation between a rainbow user and another one, or between a user and a room,
     *    The backup of the conversation is restricted to a number of days before now. By default the limit is 30 days.
     * @param {String} ID of the conversation (dbId field)
     * @async
     * @return {Promise<Conversation[]>}
     * @fulfil {Conversation[]} - Array of Conversation object
     * @category async
     */
    sendConversationByEmail(conversationDbId) {
        return this._rest.sendConversationByEmail(conversationDbId);
    }

    /**
     * @public
     * @method ackAllMessages
     * @instance
     * @description
     *    Mark all unread messages in the conversation as read.
     * @param {String} ID of the conversation (dbId field)
     * @async
     * @return {Promise<Conversation[]>}
     * @fulfil {Conversation[]} - Array of Conversation object
     * @category async
     */
    ackAllMessages(conversationDbId) {
        return this._rest.ackAllMessages(conversationDbId);
    }


    /**
     * @public
     * @method getHistoryPage
     * @instance
     * @description
     *    Retrieve the remote history of a specific conversation.
     * @param {Conversation} conversation Conversation to retrieve
     * @param {number} size Maximum number of element to retrieve
     * @async
     * @return {Promise<Conversation[]>}
     * @fulfil {Conversation[]} - Array of Conversation object
     * @category async
     */
    getHistoryPage(conversation, size) {
        let that = this;

        // Avoid to call several time the same request
        if (conversation.currentHistoryId && conversation.currentHistoryId === conversation.historyIndex) {
            that._logger.log("debug", LOG_ID + "[conversationServiceHistory] getHistoryPage(", conversation.id, ", ", size, ", ", conversation.historyIndex, ") already asked");
            return Promise.resolve();
        }
        conversation.currentHistoryId = conversation.historyIndex;

        that._logger.log("debug", LOG_ID + "[conversationServiceHistory] getHistoryPage(", conversation.id, ", ", size, ", ", conversation.historyIndex, ")");

        // Create the defered object
        let defered = conversation.historyDefered = new Deferred();

        // Do nothing for userContact
        if (that._contacts.isUserContact(conversation.contact)) {
            defered.reject();
            return defered.promise;
        }

        if (conversation.historyComplete) {
            that._logger.log("debug", LOG_ID + "getHistoryPage(" + conversation.id + ") : already complete");
            defered.reject();
            return defered.promise;
        }

        let mamRequest = {
            "queryid": conversation.id,
            "with": conversation.id,
            "max": size,
            "before": ""
        };

        if (conversation.historyIndex !== -1) {
            mamRequest.before = conversation.historyIndex;
        }

        // Request for history messages for the room chat
        if (conversation.bubble) {
            mamRequest = {
                "queryid": conversation.id,
                "with": that._xmpp.jid_im,
                "max": size,
                "before": ""
            };

            if (conversation.historyIndex !== -1) {
                mamRequest.before = conversation.historyIndex;
            }

            that._xmpp.mamQueryMuc(conversation.id, conversation.bubble.jid, mamRequest);
        } else {
            // Request for history messages for the conversation
            that._xmpp.mamQuery(conversation.id, mamRequest);
        }

        return defered.promise;
    }

    /**
     * @private
     * @method
     * @instance
     */
    async getOrCreateOneToOneConversation(conversationId, conversationDbId?, lastModification?, lastMessageText?, missedIMCounter?, muted?, creationDate?) : Promise<Conversation>{
        let that = this;
        return new Promise((resolve, reject) => {

            // Fetch the conversation
            let conv = that.getConversationById(conversationId);
            if (conv) {
                conv.preload = true;
                return resolve(conv);
            }

            that._logger.log("info", LOG_ID + "getOrCreateOneToOneConversation " + conversationId + " " + conversationDbId + " " + missedIMCounter);


            // No conversation found, then create it
            that._contacts.getOrCreateContact(conversationId,undefined) /* Get or create the conversation*/ .then( (contact) => {
                    that._logger.log("info", LOG_ID + "[Conversation] Create one to one conversation (" + contact.id + ")");

                    let  conversation = Conversation.createOneToOneConversation(contact);
                    conversation.lastModification = lastModification ? new Date(lastModification) : undefined;
                    conversation.lastMessageText = lastMessageText;
                    conversation.muted = muted;
                    conversation.creationDate = creationDate ? new Date(creationDate) : new Date();
                    conversation.preload = false;
                    // TODO ? that.computeCapabilitiesForContact(contact);
                    conversation.dbId = conversationDbId;
                    conversation.missedCounter = missedIMCounter ? missedIMCounter : 0;
                    that.conversations[contact.jid_im] = conversation;
                    return Promise.resolve(conversation);
                    //return that.createServerConversation(conversation);
                })
                .then( (conversation) => {
                    // TODO ? $rootScope.$broadcast("ON_CONVERSATIONS_UPDATED_EVENT", conversation);
                    resolve(conversation);
                })
                .catch( (error) => {
                    let errorMessage = "getOrCreateOneToOneConversation " + conversationId + " failure " + error.message;
                    that._logger.log("error", LOG_ID + "Error." );
                    that._logger.log("internalerror", LOG_ID + "Error : ", errorMessage);

                    return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                });
        });
    }

    /**
     * @public
     * @method getBubbleConversation
     * @instance
     * @description
     *    Get a conversation associated to a bubble (using the bubble ID to retrieve it)
     * @param {String} bubbleJid JID of the bubble (dbId field)
     * @param conversationDbId
     * @param lastModification
     * @param lastMessageText
     * @param missedIMCounter
     * @param noError
     * @param muted
     * @param creationDate
     * @param lastMessageSender
     * @async
     * @return {Promise<Conversation>}
     * @fulfil {Conversation} - Conversation object or null if not found
     * @category async
     */
    getBubbleConversation(bubbleJid, conversationDbId?, lastModification?, lastMessageText?, missedIMCounter?, noError?, muted?, creationDate?, lastMessageSender?) : Promise<any> {
        let that = this;

        that._logger.log("internal", LOG_ID + "getBubbleConversation bubbleJib : ", bubbleJid);

        // Fetch the conversation in memory
        let conversationResult = that.getConversationById(conversationDbId);
        if (conversationResult) {
            conversationResult.preload = true;
            that._logger.log("internal", LOG_ID + "(getBubbleConversation) conversation found by Id : ", conversationDbId, " : conversation : ", conversationResult);
            return Promise.resolve(conversationResult);
        }

        let conversation = that.getConversationByBubbleJid(bubbleJid);
        if (conversation) {
            conversation.preload = true;
            that._logger.log("internal", LOG_ID + "(getBubbleConversation) conversation found by BubbleJid : ", bubbleJid, " : conversation : ", conversationResult);
            return Promise.resolve(conversation);
        }
        // No conversation found, then create it
        return new Promise((resolve, reject) => {

            // Get the associated bubble
            that._bubbles.getBubbleByJid(bubbleJid).then((bubble) => {
                if (!bubble) {
                    that._logger.log("debug", LOG_ID + "getBubbleConversation (" + bubbleJid + ") failure : no such bubble");

                    let obj = {
                        jid: bubbleJid,
                        conversationDbId: conversationDbId,
                        lastModification: lastModification,
                        lastMessageText: lastMessageText,
                        missedIMCounter: missedIMCounter,
                        muted: muted,
                        creationDate: creationDate
                    };

                    that.waitingBotConversations.push(obj);
                    that.unlockWaitingBotConversations();
                    resolve();
                } else {
                    that._logger.log("info", LOG_ID + "[Conversation] Create bubble conversation (" + bubble.jid + ")");

                    conversation = Conversation.createBubbleConversation(bubble);
                    conversation.dbId = conversationDbId;
                    conversation.lastModification = lastModification ? new Date(lastModification) : undefined;
                    conversation.lastMessageText = lastMessageText;
                    conversation.muted = muted;
                    conversation.creationDate = creationDate ? new Date(creationDate) : new Date();
                    conversation.preload = false;
                    conversation.lastMessageSender = lastMessageSender;
                    if (missedIMCounter) {
                        conversation.missedCounter = missedIMCounter;
                    }
                    that.conversations[conversation.id] = conversation;

                    if (conversationDbId) {
                        that.getRoomConferences(conversation).then(function () {
                                    that._eventEmitter.emit("evt_internal_conversationupdated", conversation);
                                    resolve(conversation);
                                } // Create server side if necessary
                            );
                    } else {
                        // that.createServerConversation(conversation)
                        Promise.resolve(conversation).then(function (__conversation) {
                                if (bubble) {
                                    that._presence.sendInitialBubblePresence(bubble);
                                }
                                // Send conversations update event
                                that._eventEmitter.emit("evt_internal_conversationupdated", __conversation);
                                resolve(__conversation);
                            }).catch(async function (error) {
                                let errorMessage = "getBubbleConversation (" + bubbleJid + ") failure : " + error.message;
                                that._logger.log("error", LOG_ID + "Error.");
                                that._logger.log("internalerror", LOG_ID + "Error : ", errorMessage);
                                await that.deleteServerConversation(conversationDbId);
                                if (noError) {
                                    resolve();
                                } else {
                                    return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
                                }
                            });
                    }
                }
            }).catch(async (error) => {
                let errorMessage = "getBubbleConversation (" + bubbleJid + ") failure : " + error.message;
                that._logger.log("error", LOG_ID + "Error.");
                that._logger.log("internalerror", LOG_ID + "Error : ", errorMessage);
                await that.deleteServerConversation(conversationDbId);
                if (noError) {
                    resolve();
                } else {
                    return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
                }
            });

        });
    }

    /**
     * @public
     * @method sendIsTypingState
     * @instance Conversations
     * @description
     *    Switch the "is typing" state in a conversation<br>
     * @param {Conversation} conversation The conversation recipient
     * @param {boolean} status The status, true for setting "is Typing", false to remove it
     * @return a promise with no success parameter
     */
    sendIsTypingState(conversation, status) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (!conversation) {
                return reject(Object.assign( ErrorManager.getErrorManager().BAD_REQUEST, {msg: "Parameter 'conversation' is missing or null"}));
            }
            /* else if (!status) {
                reject(Object.assign( ErrorManager.BAD_REQUEST, {msg: "Parameter 'status' is missing or null"}));
            } // */
            else {
                conversation = conversation.id ? that.getConversationById(conversation.id) : null;
                if (!conversation) {
                    return reject(Object.assign(  ErrorManager.getErrorManager().OTHERERROR("ERRORNOTFOUND", "Parameter \'conversation\': this conversation doesn\'t exist"), {msg: "Parameter 'conversation': this conversation doesn't exist"}));
                } else {
                    that._xmpp.sendIsTypingState(conversation, status);
                    resolve();
                }
            }
        });
    }


    /**
     * @private
     * @method
     * @instance
     * @description
     * Get a pstn conference
     */
    getRoomConferences(conversation) {
        let that = this;

        return new Promise((resolve) => {
            let confEndpoints = conversation.bubble.confEndpoints;
            if (confEndpoints) {
                confEndpoints.forEach(function(confEndpoint) {
                    if (confEndpoint.mediaType === "pstnAudio") {
                        // TODO later
                        // let conferenceSession = pstnConferenceService.getConferenceSessionById(confEndpoint.confEndpointId);
                        // if (conferenceSession) {
                        //     conversation.pstnConferenceSession = conferenceSession;
                        // }
                    }
                });
            }
            resolve();
        });
    }

    /**
     * @private
     * @method
     * @instance
     * @description
     * Update a pstn conference
     */
    updateRoomConferences() {
        let that = this;

        let conversations = that.getConversations();
        conversations.forEach(function(conversation) {
            if (conversation.bubble && conversation.bubble.confEndpoints) {
                // TODO Later
                // let conferenceSession = pstnConferenceService.getConferenceSessionById(conversation.bubble.getPstnConfEndpointId());
                // if (conferenceSession) {
                //     conversation.pstnConferenceSession = conferenceSession;
                // } else {
                //     conversation.pstnConferenceSession = null;
                // }
            } else {
                // A room conversation without confEndpoint should not have a conferenceSession attached
                conversation.pstnConferenceSession = null;
            }
        });
    }

    /**
     * @public
     * @method closeConversation
     * @instance
     * @description
     *    Close a conversation <br/>
     *    This method returns a promise
     * @param {Conversation} conversation The conversation to close
     * @async
     * @return {Promise}
     * @fulfil {} Return nothing in case success
     * @category async
     */
    closeConversation(conversation) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("info", LOG_ID + "closeConversation " + conversation.id);

            // Remove this contact from favorite group
            that
                .deleteServerConversation(conversation.dbId)
                .then( () => {
                    that.removeConversation(conversation);
                    resolve();
                })
                .catch( (error) => {
                    return reject(error);
                });
        });
    }

    /**
     * @private
     * @method
     * @instance
     * @description
     *    Remove locally a conversation <br/>
     *    This method returns a promise
     * @param {Conversation} conversation The conversation to remove
     */
    removeConversation(conversation) {
        let that = this;
        that._logger.log("info", LOG_ID + "remove conversation " + conversation.id);

        if (conversation.videoCall && conversation.videoCall.status !== Call.Status.UNKNOWN) {
            that._logger.log("info", LOG_ID + "Ignore conversation deletion message for conversation" + conversation.id);
            return;
        }

        delete that.conversations[conversation.id];
       /* that.orderConversations();
        let conversations = that.getOrderedConversations();

        if (that.activeConversation && !(conversations.idle.indexOf(service.activeConversation) >= 0)) {
            if (conversations.idle.length > 0) {
                that.setActiveConversation(conversations.idle.first());
            } else if (conversations.inCall.length > 0) {
                service.setActiveConversation(conversations.inCall.first());
            } else {
                service.setActiveConversation(null);
            }
        }*/

        // To avoid leak
        if (conversation.contact) {
            conversation.contact.conversation = null;
            conversation.contact = null;
        }

        that._eventEmitter.emit("evt_internal_conversationdeleted", { "conversationId": conversation.id});

        //conversation = null;
    }


    /*********************************************************/
    /**                   MESSAGES STUFF                    **/
    /*********************************************************/

    /**
     * @private
     * @method sendFSMessage
     * @instance
     * @description
     *   Send an file sharing message
     */
    sendFSMessage(conversation, file, data) {
        //let message = conversation.sendFSMessage(file, data);
        //Conversation.prototype.sendFSMessage = function(file, data) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("info", LOG_ID + "sendFSMessage");

            // Add message in messages array
            let fileExtension = file.name.split(".").pop();
            let fileMimeType = file.type;
            let viewers = [];
            //let message = typeof (data) === "object" ? data : undefined;
            let message = data;
            let currentFileDescriptor;

            if (conversation.type === Conversation.Type.ONE_TO_ONE) {
                viewers.push(fileViewerElementFactory(conversation.contact.id, "user", undefined,  undefined));
                /*viewers = fileViewerFactory([{
                    "viewerId": this.contact.dbId,
                    "type": "user"
                }]); // */
            } else {
                viewers.push(fileViewerElementFactory(conversation.bubble.id, "room", undefined,  undefined)) ;
                /*viewers = fileViewerFactory([{
                    "viewerId": this.room.dbId,
                    "type": "room"
                }]); // */
            }

            that._fileStorageService.createFileDescriptor(file.name, fileExtension, file.size, viewers).then(function (fileDescriptor: any) {
                    currentFileDescriptor = fileDescriptor;
                    fileDescriptor.fileToSend = file;
                    if (fileDescriptor.isImage()) {
                        // let URLObj = $window.URL || $window.webkitURL;
                        // fileDescriptor.previewBlob = URLObj.createObjectURL(file);
                        if (file.preview) {
                            fileDescriptor.previewBlob = file.preview;
                        }
                    }
                  /*  if (!message) {
                        message = that.addFSMessage(fileDescriptor.id, fileMimeType, data, "uploading");
                    }
                    message.fileId = fileDescriptor.id;
                    message.fileName = fileDescriptor.fileName;
                    // */

                    // Upload file
                    fileDescriptor.state = "uploading";
                    /*if (that.chatRenderer) {
                        that.chatRenderer.updateFileTransferState(message, fileDescriptor);
                    } */

                     return that._fileServerService.uploadAFileByChunk(fileDescriptor, file.path /*, message , function (msg, fileDesc) {
                        if (that.chatRenderer) {
                            that.chatRenderer.updateFileTransferState(msg, fileDesc);
                        }
                    } */)
                        .then(function successCallback(fileDesc) {
                                that._logger.log("debug", LOG_ID + "uploadAFileByChunk success");
                                if (that.chatRenderer) {
                                    that.chatRenderer.updateFileTransferState(message, fileDesc);
                                }
                               // resolve(fileDescriptor);
                                return Promise.resolve(fileDesc);
                            },
                            function errorCallback(error) {
                                that._logger.log("error", LOG_ID + "uploadAFileByChunk error.");
                                that._logger.log("internalerror", LOG_ID + "uploadAFileByChunk error : ", error);

                                //do we need to delete the file descriptor from the server if error ??
                                that._fileStorageService.deleteFileDescriptor(currentFileDescriptor.id);

                                // .then(function() {
                                // let msgKey = error.translatedMessage ? error.translatedMessage : "Unable to share file";
                                // $rootScope.$broadcast("ON_SHOW_INFO_MESSAGE", { type: "error", messageKey: msgKey });

                                // currentFileDescriptor.state = "uploadError";

                                // message.receiptStatus = Message.ReceiptStatus.ERROR;
                                // message.fileErrorMsg = msgKey;
                                // that.updateMessage(message);
                                // });

                               // let msgKey = error.translatedMessage ? error.translatedMessage : "Unable to share file";
                                //$rootScope.$broadcast("ON_SHOW_INFO_MESSAGE", {type: "error", messageKey: msgKey});

                                currentFileDescriptor.state = "uploadError";

                                //message.receiptStatus = Message.ReceiptStatus.ERROR;
                                //message.fileErrorMsg = msgKey;
                                //that.updateMessage(message);

                                return Promise.reject(error);
                            });
                })
                .then(function successCallback(fileDescriptorResult) {
                        fileDescriptorResult.state = "uploaded";
                        fileDescriptorResult.chunkPerformed = 0;
                        fileDescriptorResult.chunkTotalNumber = 0;
                        let messagefs = that.sendExistingFSMessage(conversation, message, fileDescriptorResult);
                        that.storePendingMessage(conversation, messagefs);
                        resolve(messagefs);
                    },
                    function errorCallback(error) {
                        that._logger.log("error", LOG_ID + "createFileDescriptor error");
                        return reject(error);
                    });


            //};


            /*
            todo: VBR What is this pendingMessages list coming from WebSDK ? Is it necessary for node SDK ?
            this.pendingMessages[message.id] = {
                conversation: conversation,
                message: message
            };
            // */
        });
    }

    /**
     * @public
     * @method sendExistingMessage
     * @instance
     * @param {string} data The text message to send
     * @description
     *    Send a message to this conversation
     * @return {Message} The message sent
     */
     sendExistingFSMessage(conversation, message, fileDescriptor) {

         let that = this;
        //conversation.sendAckReadMessages();
        let unicodeData = message ;

        if (!message) {
            return null;
        }

        let lang = 'en';

        if (conversation.type === Conversation.Type.ONE_TO_ONE) {
            let to = conversation.contact.jid;
            return that._xmpp.sendChatExistingFSMessage(unicodeData, to, lang, fileDescriptor);
        } else {
            let to = conversation.bubble.jid;
            return that._xmpp.sendChatExistingFSMessageToBubble(unicodeData, to, lang, fileDescriptor);
        }
    }

    /**
     * @private
     * @method
     * @instance
     * @description
     *   Send an existing file sharing message
     */
    sendEFSMessage(conversation, fileDescriptor, data) {
        let message = conversation.sendEFSMessage(fileDescriptor, data);
        this.storePendingMessage(conversation, message);
        return message;
    }

    /**
     * @private
     * @method
     * @instance
     * @description
     *    Send a instant message to a conversation
     *    This method works for sending messages to a one-to-one conversation or to a bubble conversation<br/>
     * @param {Conversation} conversation The conversation to clean
     * @param {String} data Test message to send
     */
    sendChatMessage(conversation, data, answeredMsg) {
        let message = conversation.sendChatMessage(data, answeredMsg);
        this.storePendingMessage(conversation, message);
        return message;
    }

    /**
     * SEND CORRECTED MESSAGE
     */
    /**
     * @public
     * @method sendCorrectedChatMessage
     * @instance
     * @description
     *    Send a corrected message to a conversation
     *    This method works for sending messages to a one-to-one conversation or to a bubble conversation<br/>
     *    The new message has the property originalMessageReplaced which spot on original message // Warning this is a circular depend.
     *    The original message has the property replacedByMessage  which spot on the new message // Warning this is a circular depend.
     *    Note: only the last sent message on the conversation can be changed. The connected user must be the sender of the original message.
     * @param conversation
     * @param data
     * @param origMsgId
     * @returns {Promise<String>} message the message new correction message sent. Throw an error if the send fails.
     */
    async sendCorrectedChatMessage(conversation, data, origMsgId) {
        let that = this;

        if (!conversation) {
            this._logger.log("error", LOG_ID + "(sendCorrectedChatMessage) bad or empty 'conversation' parameter");
            this._logger.log("internalerror", LOG_ID + "(sendCorrectedChatMessage) bad or empty 'conversation' parameter : ", conversation);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (data == undefined || data == null) {
            this._logger.log("error", LOG_ID + "(sendCorrectedChatMessage) bad or empty 'data' parameter");
            this._logger.log("internalerror", LOG_ID + "(sendCorrectedChatMessage) bad or empty 'data' parameter : ", data);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!origMsgId) {
            this._logger.log("error", LOG_ID + "(sendCorrectedChatMessage) bad or empty 'origMsgId' parameter");
            this._logger.log("internalerror", LOG_ID + "(sendCorrectedChatMessage) bad or empty 'origMsgId' parameter : ", origMsgId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        that._logger.log("internal", LOG_ID + "(sendCorrectedChatMessage) _entering_ conversation.id : ", conversation.id, ", data : ", data,  "origMsgId : ", origMsgId);

        let originalMessage = conversation.getMessageById(origMsgId);
        let originalMessageFrom = originalMessage.fromJid || originalMessage.from;
        if (originalMessageFrom !== that._rest.loggedInUser.jid_im) {
            that._logger.log("error", LOG_ID + "(sendCorrectedChatMessage) forbidden Action - only sent messages can be modified");
            throw ErrorManager.getErrorManager().OTHERERROR("(sendCorrectedChatMessage) forbidden Action - only sent messages can be modified","(sendCorrectedChatMessage) forbidden Action - only sent messages can be modified");
        }

        let lastEditableMsg = conversation.getlastEditableMsg();

        if (lastEditableMsg.id !== originalMessage.id) {
            that._logger.log("error", LOG_ID + "(sendCorrectedChatMessage) forbidden Action - only last sent message can be modified");
            throw ErrorManager.getErrorManager().OTHERERROR("(sendCorrectedChatMessage) forbidden Action - only last sent message can be modified","(sendCorrectedChatMessage) forbidden Action - only last sent message can be modified");
        }

        let messageUnicode = shortnameToUnicode(data);

        try {
            let sentMessageId = await that._xmpp.sendCorrectedChatMessage(conversation, originalMessage, messageUnicode, origMsgId, originalMessage.lang );
            let newMsg = Object.assign({}, originalMessage);
            newMsg.id = sentMessageId;
            newMsg.content = messageUnicode;
            newMsg.date = new Date();
            newMsg.originalMessageReplaced = originalMessage; // Warning this is a circular depend.
            originalMessage.replacedByMessage = newMsg; // Warning this is a circular depend.
            this.pendingMessages[sentMessageId] = {conversation: conversation, message: newMsg};
            return newMsg;
        } catch (err) {
            that._logger.log("error", LOG_ID + "createFileDescriptor error");
            let error = ErrorManager.getErrorManager().OTHERERROR(err.message,"(sendCorrectedChatMessage) error while sending corrected message : " + err );
            // @ts-ignore
            error.newMessageText = data;
            // @ts-ignore
            error.originaleMessageId = origMsgId;
            throw  error ;
        }
    }

    /**
     * @public
     * @since 1.58
     * @method deleteMessage
     * @instance
     * @async
     * @description
     *    Delete a message by sending an empty string in a correctedMessage
     * @param {Conversation} conversation The conversation object
     * @param {String} messageId The id of the message to be deleted
     * @return {Message} - message object with updated replaceMsgs property
     */
    async deleteMessage (conversation, messageId) : Promise<any> {
        let that = this;

        if (!conversation) {
            that._logger.log("error", LOG_ID + "(deleteMessage) Parameter 'conversation' is missing or null");
            throw ErrorManager.getErrorManager().BAD_REQUEST();
        }

        if (!messageId) {
            that._logger.log("error", LOG_ID + "(deleteMessage) Parameter 'messageId' is missing or empty");
            throw ErrorManager.getErrorManager().BAD_REQUEST();
        }

        let messageOrig = conversation.getMessageById(messageId);

        let correctedMsg = await that.sendCorrectedChatMessage(conversation, "", messageId);

        return messageOrig;
    }

    /**
     *
     * @public
     * @since 1.67.0
     * @method deleteAllMessageInOneToOneConversation
     * @instance
     * @async
     * @description
     *   Delete all messages for the connected user on a one to one conversation.
     * @param {Conversation} conversation The conversation object
     * @return {Message} - message object with updated replaceMsgs property
     */
    deleteAllMessageInOneToOneConversation (conversation) {
        let that = this;
        if (!conversation) {
            this._logger.log("error", LOG_ID + "(deleteAllMessageInOne2OneConversation) bad or empty 'conversation' parameter.");
            this._logger.log("internalerror", LOG_ID + "(deleteAllMessageInOne2OneConversation) bad or empty 'conversation' parameter : ", conversation);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let conversationObj = that.getConversationById(conversation.id);

        if (conversationObj.type !== Conversation.Type.ONE_TO_ONE) {
            this._logger.log("error", LOG_ID + "(deleteAllMessageInOne2OneConversation) bad or empty 'conversation.type' parameter.");
            this._logger.log("internalerror", LOG_ID + "(deleteAllMessageInOne2OneConversation) bad or empty 'conversation.type' parameter : ", conversationObj);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return that._xmpp.deleteAllMessageInOneToOneConversation(conversationObj.id);
    }

    /**
     * @private
     * @description
     *      Store the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent.
     *      It allow to give back the status of the sending process.
     * @param conversation
     * @param message
     */
    storePendingMessage(conversation, message) {
        this.pendingMessages[message.id] = {
            conversation: conversation,
            message: message
        };
    }

    /**
     * @private
     * @description
     *      delete the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent.
     *      It allow to give back the status of the sending process.
     * @param message
     */
    removePendingMessage(message) {
        delete this.pendingMessages[message.id];
    }

    /**
     * @public
     * @method removeAllMessages
     * @instance
     * @description
     *    Cleanup a conversation by removing all previous messages<br/>
     *    This method returns a promise
     * @param {Conversation} conversation The conversation to clean
     * @async
     * @return {Promise}
     * @fulfil {} Return nothing in case success
     * @category async
     */
    removeAllMessages(conversation) {
        let that = this;
        return new Promise((resolve) => {
            if (!conversation) {
                this._logger.log("error", LOG_ID + "(removeAllMessages) bad or empty 'conversation' parameter.");
                this._logger.log("internalerror", LOG_ID + "(removeAllMessages) bad or empty 'conversation' parameter : ", conversation);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            that._logger.log("info", LOG_ID + "(removeAllMessage) _entering_ " + conversation.id);

            // Id must be filled by lower layer
            let mamRequest = {
                //"queryid": mamRequestId,
                "with": conversation.id,
                "onComplete": function(result) {
                    that._logger.log("internal", LOG_ID + " removeAllMessage " + conversation.id, ", result : ", result);
                    // FIXME : handle error message (ask Andreï)
                    resolve(result);
                }
            };

            that.pendingMessages = [];

            that._xmpp.mamDelete( mamRequest);

/*
            let mamRequest = {
                "deleteid": "remove_" + conversation.id,
                "with": conversation.id,
                "before": moment().add(1, 'minutes')
                    .utc()
                    .format("YYYY-MM-DDTHH:mm:ss") + "Z",
                "onComplete": function (result) {
                    that._logger.log("debug", LOG_ID + " removeAllMessage " + conversation.id, ", result : ", result);
                    // FIXME : handle error message (ask Andreï)
                    resolve(result);
                }
            };

            that.pendingMessages = [];

            // Request for history messages
            that._xmpp.mamDelete(conversation.id, mamRequest);
            // */
        });
    }

    /**
     * @public
     * @method removeMessagesFromConversation
     * @instance
     * @description
     *    Remove a specific range of message in a conversation<br/>
     *    This method returns a promise
     * @param {Conversation} conversation The conversation to clean
     * @async
     * @return {Promise}
     * @fulfil {} Return nothing in case success
     * @category async
     */
    removeMessagesFromConversation(conversation, date, number) {
        let that = this;
        return new Promise((resolve) => {
            that._logger.log("info", LOG_ID + " removeMessagesFromConversation " + conversation.id);
            that._logger.log("info", LOG_ID + " removing " + number + " messages after " + date);

            let mamRequest = {
                "deleteid": "remove_" + conversation.id,
                "with": conversation.id,
                "start": moment(date).format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ"),
                "max": number,
                "onComplete": () => {
                    that
                        ._logger
                        .log("info", LOG_ID + " MAM Message deleted !!!");
                    resolve();
                }
            };

            that.pendingMessages = that.pendingMessages.filter((messagePending) => { if (messagePending.date > date) { return false; } });

            // Request for history messages
            that._xmpp.mamDelete(mamRequest);
            //that._xmpp.mamDelete(conversation.id, mamRequest);
        });
    }

    /**
     * @public
     * @method getConversationById
     * @instance
     * @description
     *      Get a p2p conversation by id
     * @param {String} conversationId Conversation id of the conversation to clean
     * @return {Conversation} The conversation to retrieve
     */
    getConversationById(conversationId) {
        let that = this;
        that._logger.log("debug", LOG_ID + " (getConversationById) conversationId : ", conversationId);
        if (!this.conversations) {
            return null;
        }
        that._logger.log("internal", LOG_ID + " (getConversationById) conversation : ", this.conversations[conversationId]);
        return this.conversations[conversationId];
    }

    /**
     * @private
     * @method
     * @instance
     * @description
     *      Get a conversation by db id
     * @param {String} dbId db id of the conversation to retrieve
     * @return {Conversation} The conversation to retrieve
     */
    getConversationByDbId(dbId) {
        let that = this;
        if (that.conversations) {
            for (let key in that.conversations) {
                if (that.conversations.hasOwnProperty(key) && that.conversations[key].dbId === dbId) {
                    return that.conversations[key];
                }
            }
        }
        return null;
    };

    /**
     * @private
     * @method
     * @instance
     * @description
     *      Get a bubble conversation by bubble id
     * @param {String} bubbleId Bubble id of the conversation to retrieve
     * @return {Conversation} The conversation to retrieve
     */
    async getConversationByBubbleId(bubbleId) {
        if (this.conversations) {
            for (let key in this.conversations) {
                if (this.conversations.hasOwnProperty(key) && this.conversations[key].bubble && this.conversations[key].bubble.id === bubbleId) {
                    return this.conversations[key];
                }
            }
        }
        return null;
    }

    /**
     * @private
     * @method
     * @instance
     * @description
     *      Get a bubble conversation by bubble id
     * @param {String} bubbleJid Bubble jid of the conversation to retrieve
     * @return {Conversation} The conversation to retrieve
     */
    getConversationByBubbleJid(bubbleJid) {
        if (this.conversations) {
            for (let key in this.conversations) {
                if (this.conversations.hasOwnProperty(key) && this.conversations[key].bubble && this.conversations[key].bubble.jid === bubbleJid) {
                    return this.conversations[key];
                }
            }
        }
        return null;
    }

    /**
     * @public
     * @method getAllConversations
     * @instance
     * @description
     *    Allow to get the list of existing conversations (p2p and bubbles)
     * @return {Conversation[]} An array of Conversation object
     */
    getAllConversations() {
        let that = this;
        return that.getConversations();
    };

    /**
     * @private
     * @method
     * @instance
     * @description
     *      Get all conversation
     * @return {Conversation[]} The conversation list to retrieve
     */
    getConversations() {
        let conversationArray = [];
        for (let key in this.conversations) {
            if (this.conversations.hasOwnProperty(key)) {
                conversationArray.push(this.conversations[key]);
            }
        }
        return conversationArray;
    }

    /**
     * @public
     * @method openConversationForContact
     * @instance
     * @description
     *    Open a conversation to a contact <br/>
     *    Create a new one if the conversation doesn't exist or reopen a closed conversation<br/>
     *    This method returns a promise
     * @param {Contact} contact The contact involved in the conversation
     * @return {Conversation} The conversation (created or retrieved) or null in case of error
     */
    openConversationForContact (contact): Promise<Conversation> {
        let that = this;
        return new Promise(function (resolve, __reject) {

            if (!contact) {
                return __reject({
                    code: ErrorManager.getErrorManager().BAD_REQUEST,
                    label: "Parameter 'contact' is missing or null"
                });
            } else {
                that._logger.log("info", LOG_ID + " :: Try to create of get a conversation.");
                that._logger.log("internal", LOG_ID + " :: Try to create of get a conversation with " + contact.lastName + " " + contact.firstName);


                that.getOrCreateOneToOneConversation(contact.jid).then(function (conversation: any) {
                        that._logger.log("info", LOG_ID + "  :: Conversation retrieved or created " + conversation.id);
                        resolve(conversation);
                    }).catch(function (result) {
                    that._logger.log("error", LOG_ID + "[openConversationForContact] Error.");
                    that._logger.log("internalerror", LOG_ID + "[openConversationForContact] Error : ", result);
                    return __reject(result);
                });
            }
        });
    }

    /**
     * @public
     * @method openConversationForBubble
     * @since 1.65
     * @instance
     * @description
     *    Open a conversation to a bubble <br/>
     *    Create a new one if the conversation doesn't exist or reopen a closed conversation<br/>
     *    This method returns a promise
     * @param {Bubble} bubble The bubble involved in this conversation
     * @return {Conversation} The conversation (created or retrieved) or null in case of error
     */
    openConversationForBubble(bubble) {
        let that = this;
        return new Promise(function (resolve, __reject) {

            if (!bubble) {
                return __reject({
                    code: ErrorManager.getErrorManager().BAD_REQUEST,
                    label: "Parameter 'bubble' is missing or null"
                });
            } else {
                that._logger.log("info", LOG_ID + "(openConversationForBubble), Try to create of get a conversation for bubble.");
                that._logger.log("internal", LOG_ID + "(openConversationForBubble), Try to create of get a conversation with bubble : ", bubble);

                that.getBubbleConversation(bubble.jid,undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined).then(function (conversation) {
                    that._logger.log("internal", LOG_ID + "(openConversationForBubble), Conversation retrieved or created, conversation : ", conversation);
                    resolve(conversation)
                }).catch(function (result) {
                    that._logger.log("internal", LOG_ID + "(openConversationForBubble) Error : ", result);
                    __reject(result);
                });
            }
        });
    }

    /**
     * @private
     * @method getS2SServerConversation
     * @since 1.65
     * @instance
     * @description
     *    get a conversation from id on S2S API Server.<br/>
     *    This method returns a promise
     * @param {string} conversationId The id of the conversation to find.
     * @return {Conversation} The conversation (created or retrieved) or null in case of error
     */
    getS2SServerConversation(conversationId) {
        let that = this;
        return new Promise(function (resolve, __reject) {

            if (!conversationId) {
                return __reject({
                    code: ErrorManager.getErrorManager().BAD_REQUEST,
                    label: "Parameter 'conversationId' is missing or null"
                });
            } else {
                that._logger.log("info", LOG_ID + "(getS2SServerConversation), Try to create of get a conversation for bubble.");
                that._logger.log("internal", LOG_ID + "(getS2SServerConversation), Try to create of get a conversation with bubble : ", conversationId);

                that.getS2SServerConversation(conversationId).then(function (conversationInfos) {
                    that._logger.log("internal", LOG_ID + "(getS2SServerConversation), Conversation retrieved or created, conversation : ", conversationInfos);
                    /*that._logger.log("info", LOG_ID + "[Conversation] Create bubble conversation (" + bubble.jid + ")");

                    let conversation = Conversation.createBubbleConversation(bubble);
                    conversation.dbId = conversationId;
                    conversation.lastModification = undefined;
                    conversation.lastMessageText = undefined;
                    conversation.muted = false;
                    conversation.creationDate = new Date();
                    conversation.preload = false;
                    conversation.lastMessageSender = undefined;
                    conversation.missedCounter = 0;
                    that.conversations[conversation.id] = conversation;
                    resolve(conversation)

                     */

                    resolve(conversationInfos)
                }).catch(function (result) {
                    that._logger.log("internal", LOG_ID + "(getS2SServerConversation) Error : ", result);
                    __reject(result);
                });
            }
        });
    }

    /**
     * @private
     */
    async onRoomChangedEvent(__event, bubble, action) {
        if (bubble) {
            let conversation = this.getConversationById(bubble.jid);
            if (conversation) {
                if (action === "remove") {
                    await this.closeConversation(conversation);
                } else {
                    conversation.bubble = bubble;
                }
            }
        }
    }

    /**
     * @private
     */
    onRoomHistoryChangedEvent(__event, room) {
        if (room) {
            let conversation = this.getConversationById(room.jid);
            if (conversation && conversation.chatRenderer) {
                conversation.reset();
                conversation
                    .chatRenderer
                    .loadMore();
            }
        }
    }

    /**
     * @private
     */
    onRoomAdminMessageEvent(__event, roomJid, userJid, type, msgId) {
        this._logger.log("info", LOG_ID + " onRoomAdminMessageEvent");

        let conversation = this.getConversationById(roomJid);

        if (conversation && (type === "welcome" || type === "conferenceAdd" || type === "conferenceRemove") && conversation.bubble && conversation.bubble.ownerContact) {
            userJid = conversation.bubble.ownerContact.jid;
        }

        let contact = this._contacts.getContactByJid(userJid);

        if (conversation && contact) {
            // If invitation msg and I'm not the owner
            if (!conversation.bubble.owner && type === "invitation") {
                return;
            }
            if (conversation.bubble && conversation.bubble.isMeetingBubble()) {
                return;
            }
            this._conversationServiceEventHandler.onRoomAdminMessageReceived(conversation, contact, type, msgId);
        }
    }

    /*********************************************************************/
    /** Remove the conversation history                                 **/
    /*********************************************************************/
    /**
     * @private
     *
     */
    reinit() {
        let that = this;
        return new Promise((resolve) => {

            that._logger.log("info", LOG_ID + " Re-initialize conversation service");

            // Remove all my conversation
            delete that.conversations;
            that.conversations = [];

            // bot service is ready / TODO ? service.botServiceReady = true; Fetch
            // conversations from server
            that._rest.getServerConversations(that.conversationsRetrievedFormat).then(function () {
                    // TODO ? service.linkAllActiveCallsToConversations();
                    resolve();
                })
                .catch(function () {
                    setInterval(() => {
                        that._logger.log("info", LOG_ID + " getServerConversations failure, try again");
                        that._rest.getServerConversations(that.conversationsRetrievedFormat).then(function () {
                                // TODO ? that.linkAllActiveCallsToConversations();
                            });
                    }, 10000, 1, true);

                    resolve();
                });
        });
    }


    /*********************************************************************/
    /** BOT SERVICE IS RUNNING, CREATE ALL BOT CONVERSATIONS            **/
    /*********************************************************************/
    unlockWaitingBotConversations (isBotServiceReady?) {
        let that = this;

        if (isBotServiceReady) {
            that.botServiceReady = true;
        }
        if (that.botServiceReady) {
            //stop infinite loop in case of error
            that.botServiceReady = false;
            that.waitingBotConversations.forEach(async function(obj, index) {
                let contact : Contact = await that._contacts.getContactByJid(obj.jid);
                if (contact) {
                    await that.getOrCreateOneToOneConversation(contact.jid, null, obj.lastModification, obj.lastMessageText, obj.missedIMCounter, obj.muted, obj.creationDate);
                    that.waitingBotConversations.splice(index, 1);
                }
            });
            that.waitingBotConversations = [];
        }
    }
}

module.exports.ConversationsService = Conversations;
export {Conversations as ConversationsService};
