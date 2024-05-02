"use strict";
import {ContactsService} from "./ContactsService";

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {Conversation} from "../common/models/Conversation";
import {Call} from "../common/models/Call";
import * as moment from 'moment';
import {Deferred, isDefined, logEntryExit} from "../common/Utils";
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
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import {PresenceService} from "./PresenceService";
import {Message} from "../common/models/Message";
import {Bubble} from "../common/models/Bubble";
import {GenericService} from "./GenericService";

const LOG_ID = "CONVERSATIONS/SVCE - ";
const API_ID = "API_CALL - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name ConversationsService
 * @version SDKVERSION
 * @public
 * @description
 * This module is the basic module for handling conversations in Rainbow. In Rainbow, conversations are the way to get in touch with someone or something (i.e. a Rainbow contact, a external phone number, a connected thing, ...) so a conversation is the "long tail" of communication between you and someone or something else like a bubble. <br>
 * A Rainbow conversation by default supports sending and receiving Instant Messages with a single recipient (one-to-one conversation) or with several persons (bubble). Using the FileStorage service, you can share files in conversations. <br>
 * <br>
 * The main methods and events proposed in that service allow to: <br>
 *   - Create or close a Rainbow conversation (one-to-one of bubble), <br>
 *   - Get all conversations or get a conversation by Id, bubbleID or bubbleJid <br>
 *   - Retrieve all information linked to that conversation, <br>
 * <br>
 *   */
class ConversationsService extends GenericService {
    private _contactsService: ContactsService;
    private _fileStorageService: FileStorageService;
    private _fileServerService: FileServerService;
    private _presenceService: PresenceService;
    private pendingMessages: any;
    private _conversationEventHandler: ConversationEventHandler;
    private _conversationHandlerToken: any;
    private _conversationHistoryHandlerToken: any;
    public conversations: any; // { jid : Conversation }
    private _conversationServiceEventHandler: any;
    private _bubblesService: BubblesService;
        public activeConversation: any;
        public inCallConversations: any;
        public idleConversations: any;
        public involvedContactIds: any;
        public involvedRoomIds: any;
        public waitingBotConversations: any;
        public botServiceReady: any;
    private _conversationHistoryHandler: ConversationHistoryHandler;
    private conversationsRetrievedFormat: string = "small";
    private nbMaxConversations: number;
    private autoLoadConversations: boolean;
    private autoLoadConversationHistory: boolean;
    private storeMessagesInConversation: boolean;

    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    static getClassName(){ return 'ConversationsService'; }
    getClassName(){ return ConversationsService.getClassName(); }

    static getAccessorName(){ return 'conversations'; }
    getAccessorName(){ return ConversationsService.getAccessorName(); }

    constructor(_core:Core, _eventEmitter : EventEmitter, _logger : Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }, _conversationsRetrievedFormat : string, _nbMaxConversations : number,_autoLoadConversations: boolean, _autoLoadConversationHistory: boolean) {
        super(_logger, LOG_ID);
        this.setLogLevels(this);
        this._startConfig = _startConfig;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._contactsService = null;
        this._fileStorageService = null;
        this._fileServerService = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;

        this._core = _core;

        this.pendingMessages = {};
        this._conversationEventHandler = null;
        this._conversationHandlerToken = [];
        this._conversationHistoryHandlerToken = [];
        this.conversationsRetrievedFormat = _conversationsRetrievedFormat;
        this.nbMaxConversations = _nbMaxConversations;
        this.autoLoadConversations = _autoLoadConversations;
        this.autoLoadConversationHistory = _autoLoadConversationHistory;

        //that._eventEmitter.removeListener("evt_internal_onreceipt", that._onReceipt.bind(that));
        this._eventEmitter.on("evt_internal_onreceipt", this._onReceipt.bind(this));

    }

    start(_options) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService, _contacts : ContactsService, _bubbles : BubblesService, _fileStorageService : FileStorageService, _fileServerService : FileServerService
        let that = this;
        that.initStartDate();
        that._conversationHandlerToken = [];
        that._conversationHistoryHandlerToken= [];
        return new Promise((resolve, reject) => {
            try {
                that._xmpp = that._core._xmpp;
                that._rest = that._core._rest;
                that._options = _options;
                that.storeMessagesInConversation = _options._imOptions.storeMessagesInConversation;
                that._s2s = that._core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                that._contactsService = that._core.contacts;
                that._bubblesService = that._core.bubbles;
                that._fileStorageService = that._core.fileStorage;
                that._fileServerService = that._core.fileServer;
                that._presenceService = that._core.presence;

                that.activeConversation = null;
                that.conversations = {};

                that.inCallConversations = [];
                that.idleConversations = [];
                that.involvedContactIds = [];
                that.involvedRoomIds = [];

                //all conversations with Bots
                that.waitingBotConversations = [];
                that.botServiceReady = false;


                that.attachHandlers();

                that.setStarted ();
                resolve(undefined);

            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(start) !!! Catch error.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(start) !!! Catch error : ", err);
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
                that.setStopped ();
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        });
    }

    async init (useRestAtStartup : boolean) {
        let that = this;
        that.setInitialized();
    }
    
    attachHandlers() {
        let that = this;
        that._conversationEventHandler = new ConversationEventHandler(that._xmpp, that, that.storeMessagesInConversation, that._fileStorageService, that._fileServerService, that._bubblesService, that._contactsService, that._presenceService);
        that._conversationHandlerToken = [
            //PubSub.subscribe( that._xmpp.hash + "." + that._conversationEventHandler.MESSAGE, that._conversationEventHandler.onMessageReceived.bind(that._conversationEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationEventHandler.MESSAGE_CHAT, that._conversationEventHandler.onChatMessageReceived.bind(that._conversationEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationEventHandler.MESSAGE_GROUPCHAT, that._conversationEventHandler.onChatMessageReceived.bind(that._conversationEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationEventHandler.MESSAGE_WEBRTC, that._conversationEventHandler.onWebRTCMessageReceived.bind(that._conversationEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationEventHandler.MESSAGE_MANAGEMENT, that._conversationEventHandler.onManagementMessageReceived.bind(that._conversationEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationEventHandler.MESSAGE_ERROR, that._conversationEventHandler.onErrorMessageReceived.bind(that._conversationEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationEventHandler.MESSAGE_CLOSE, that._conversationEventHandler.onCloseMessageReceived.bind(that._conversationEventHandler))
        ];

        that._conversationHistoryHandler = new ConversationHistoryHandler(that._xmpp, that, that._contactsService, that._options);
        that._conversationHistoryHandlerToken = [
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationHistoryHandler.MESSAGE_MAM, that._conversationHistoryHandler.onMamMessageReceived.bind(that._conversationHistoryHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that._conversationHistoryHandler.FIN_MAM, that._conversationHistoryHandler.onMamMessageReceived.bind(that._conversationHistoryHandler))
        ];
    }

    async _onReceipt(receipt) {
        let that = this;
        let messageInfo = this.pendingMessages[receipt.id];
        if (messageInfo && messageInfo.message) {
            let data = messageInfo.message;
            let conversation = messageInfo.conversation;

            let message: Message = await Message.create(
                    null,
                    null,
                    data.id,
                    data.type,
                    data.date,
                    data.fromJid,
                    Message.Side.RIGHT,
                    data.status,
                    Message.ReceiptStatus.NONE,
                    !!data.isMarkdown,
                    data.subject,
                    data.geoloc,
                    data.voiceMessage,
                    data.alternativeContent,
                    data.attention,
                    data.mentions,
                    data.urgency,
                    data.urgencyAck,
                    data.urgencyHandler,
                    //data.translatedText,
                    //data.isMerged,
                    data.historyIndex,
                    //data.showCorrectedMessages,
                    //data.replaceMsgs,
                    data.attachedMsgId,
                    data.attachIndex,
                    data.attachNumber,
                    data.resource,
                    data.toJid,
                    data.content,
                    data.lang,
                    data.cc,
                    data.cctype,
                    data.isEvent,
                    data.event,
                    data.oob,
                    data.fromBubbleJid,
                    data.fromBubbleUserJid,
                    data.answeredMsg,
                    data.answeredMsgId,
                    data.answeredMsgDate,
                    data.answeredMsgStamp,
                    data.eventJid,
                    data.originalMessageReplaced,
                    data.confOwnerId,
                    data.confOwnerDisplayName,
                    data.confOwnerJid,
                    data.isForwarded,
                    data.forwardedMsg
            );
            //that._logger.log(that.INTERNAL, LOG_ID + "(_onReceipt) with data Message : ", data);
            message.updateMessage(data);
            //that._logger.log(that.INTERNAL, LOG_ID + "(_onReceipt) with data updated Message : ", data);


            that._logger.log(that.DEBUG, LOG_ID + "(_onReceipt) Receive server ack (" + conversation.id + ", " + message.id + ")");
            that._logger.log(that.INTERNAL, LOG_ID + "(_onReceipt) Receive server ack (" + conversation.id + ", " + message.id + ") : ", conversation);
            //message.setReceiptStatus(Message.ReceiptStatus.SENT);
            if (conversation && conversation.id) {
                conversation = await that.getConversationById(conversation.id);
                that._logger.log(that.DEBUG, LOG_ID + "(_onReceipt) getConversationById conversation received.");
                // that._logger.log(that.INTERNAL, LOG_ID + "(_onReceipt) getConversationById method result : ", conversation);
                if (conversation) {
                    message.conversation = conversation;
                    if (conversation.addOrUpdateMessage) {
                        that._logger.log(that.DEBUG, LOG_ID + "(_onReceipt) conversation.addOrUpdateMessage.");
                        that._logger.log(that.INTERNAL, LOG_ID + "(_onReceipt) conversation.addOrUpdateMessage : ", message);
                        if (that.storeMessagesInConversation) {
                            conversation.addOrUpdateMessage(message);
                        }
                        that.removePendingMessage(message);
                        //delete this.pendingMessages[message.id];
                        // Send event
                        that._eventEmitter.emit("evt_internal_conversationupdated", conversation);
                        //that._logger.log(that.INTERNAL, LOG_ID + "(_onReceipt) after sent evt_internal_conversationupdated, conversations : ", that.getConversations());
                    } else {
                        that._logger.log(that.ERROR, LOG_ID + "(_onReceipt) Error addMessage method not defined in Conversation, so message not added to conversation (" + conversation.id, ") : ", conversation);
                    }
                } else {
                    that._logger.log(that.DEBUG, LOG_ID + "(_onReceipt) conversation unknown can not store the pending message to conversation : ", conversation);
                    // that._logger.log(that.INTERNAL, LOG_ID + "(_onReceipt) conversation unknown can not store the pending message to conversation : ", conversation);
                }
            } else {
                that._logger.log(that.DEBUG, LOG_ID + "(_onReceipt) conversation not saved with pending message.");
                that._logger.log(that.INTERNAL, LOG_ID + "(_onReceipt) conversation not saved with pending message : ", conversation);
            }
        } else {
            that._logger.log(that.DEBUG, LOG_ID + "(_onReceipt) Receive server ack message not found.");
            that._logger.log(that.INTERNAL, LOG_ID + "(_onReceipt) Receive server ack message not found : ", messageInfo);
        }
    }

    sortFunction (aa, bb) {
        let aLast = aa.lastModification;
        let aCreation = aa.creationDate;
        let bLast = bb.lastModification;
        let bCreation = bb.creationDate;

        let aDate: any;
        let bDate: any;

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
     * Get a pstn conference <br>
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
            resolve(undefined);
        });
    }

    /**
     * @private
     * @method
     * @instance
     * @description
     * Update a pstn conference <br>
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

    //region MESSAGES
    /*********************************************************/
    /**                   MESSAGES STUFF                    **/
    /*********************************************************/

    /**
     * @public
     * @nodered true
     * @method ackAllMessages
     * @instance
     * @category MESSAGES
     * @description
     *    Mark all unread messages in the conversation as read. <br>
     * @param {string} conversationDbId ID of the conversation (dbId field)
     * @param {boolean} maskRead if true Im won't be shown as read on peer conversation side. Default value : : false
     * @async
     * @return {Promise<Conversation[]>}
     * @fulfil {Conversation[]} - Array of Conversation object
     * @category async
     */
    ackAllMessages(conversationDbId, maskRead : boolean = false) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAll) is conversationDbId defined : ", isDefined(conversationDbId));
        return this._rest.ackAllMessages(conversationDbId, maskRead );
    }

    resetHistoryPageForConversation(conversation : Conversation) {
        let that = this;
        if (!conversation) {
            that._logger.log(that.DEBUG, LOG_ID + "(resetHistoryPageForConversation) undefined conversation.id so no reset done.");
            return;
        }
        that._logger.log(that.DEBUG, LOG_ID + "(resetHistoryPageForConversation) id : ", conversation.id, ", dbid : ", conversation.dbId);
        conversation.resetHistory();
    }

    /**
     * @public
     * @method getHistoryPage
     * @instance
     * @category MESSAGES
     * @description
     *    Retrieve the remote history of a specific conversation. <br>
     * @param {Conversation} conversation Conversation to retrieve
     * @param {number} size Maximum number of element to retrieve
     * @async
     * @return {Promise<Conversation[]>}
     * @fulfil {Conversation[]} - Array of Conversation object
     * @category async
     */
    async getHistoryPage(conversation : Conversation, size: number = 30) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getHistoryPage) conversation.id : ", conversation?.id);

        // if  conversation.historyDefered is already exist, then a getHistory is yet running, wait before calling it.
        if (conversation.historyDefered && conversation.historyDefered.promise) {
            that._logger.log(that.DEBUG, LOG_ID + "(getHistoryPage) conversation.historyDefered already defined, wait for end promise's treatment.");
            await conversation.historyDefered.promise;
            that._logger.log(that.DEBUG, LOG_ID + "(getHistoryPage) conversation.historyDefered already defined, promise's treatment Ended.");
        }

        // Avoid to call several time the same request
        if (conversation.currentHistoryId && conversation.currentHistoryId === conversation.historyIndex) {
            that._logger.log(that.DEBUG, LOG_ID + "(getHistoryPage) (", conversation.id, ", ", size, ", ", conversation.historyIndex, ") already asked");
            return Promise.resolve(undefined);
        }
        conversation.currentHistoryId = conversation.historyIndex;

        that._logger.log(that.DEBUG, LOG_ID + "(getHistoryPage) (", conversation.id, ", ", size, ", ", conversation.historyIndex, ")");

        // Create the defered object
        let defered = conversation.historyDefered = new Deferred();

        // Do nothing for userContact
        if (that._contactsService.isUserContact(conversation.contact)) {
            defered.reject();
            return defered.promise;
        }

        if (conversation.historyComplete) {
            that._logger.log(that.DEBUG, LOG_ID + "(getHistoryPage) (" + conversation.id + ") : already complete");
            defered.resolve(conversation);
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
        } else {
            that.resetHistoryPageForConversation(conversation);
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
     * @public
     * @nodered true
     * @method loadConversationHistory
     * @instance
     * @category MESSAGES
     * @description
     *    Retrieve the remote history of a specific conversation. <br>
     * @param {Conversation} conversation Conversation to retrieve
     * @param {string} pageSize number of message in each page to retrieve messages. 
     * @async
     * @return {Promise<Conversation[]>}
     * @fulfil {Conversation[]} - Array of Conversation object
     * @category async
     */
    loadConversationHistory(conversation, pageSize : number = 30) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(loadConversationHistory) conversation.id : ", conversation?.id);
        that.resetHistoryPageForConversation(conversation);

        /*
        function getConversationHistory(conversation, _pageSize) {
            that._logger.log("debug", "(loadConversationHistory) - getConversationHistory");
            return that.getHistoryPage(conversation, _pageSize).then((conversationUpdated) => {
                that._logger.log("debug", "(loadConversationHistory) - getConversationHistory getHistoryPage");

                let result = conversationUpdated.historyComplete ? conversationUpdated:getConversationHistory(conversationUpdated, pageSize);
                that._logger.log("debug", "(loadConversationHistory) - getConversationHistory getHistoryPage result : ", result);
                return result;
            });
        }
        // */

        async function getConversationHistory(conversation: Conversation, pageSize: number): Promise<Conversation> {

            let currentConversation = conversation;
            while (! currentConversation.historyComplete) {
                that._logger.log("debug", "(loadConversationHistory) - getConversationHistory");

                await that.getHistoryPage(currentConversation, pageSize).then((conversationUpdated) => {
                    that._logger.log("debug", "(loadConversationHistory) - getConversationHistory getHistoryPage completed");
                    currentConversation = conversationUpdated;
                }).catch((err) => {
                    that._logger.log("debug", "(loadConversationHistory) - getHistoryPage CATCH Error : ", err);
                });
            }

            return Promise.resolve(currentConversation);
        }

        return getConversationHistory(conversation, pageSize);
    }

    /**
     * @public
     * @nodered true
     * @method loadConversationHistoryAsync
     * @instance
     * @category MESSAGES
     * @description
     *    Retrieve the remote history of a specific conversation asynchronously. The result only said that the request has succesfully started (or not).
     *    </br>The result of the loading process is sent with the event `rainbow_onloadConversationHistoryCompleted`<br>
     * @param {Conversation} conversation Conversation to retrieve
     * @param {string} pageSize number of message in each page to retrieve messages.
     * @async
     * @return {Promise<{code:number,label:string}>}
     * @category async
     */
    loadConversationHistoryAsync(conversation: Conversation, pageSize: number = 30): Promise<{code:number,label:string}> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(loadConversationHistoryAsync) conversation.id : ", conversation?.id);
        that.resetHistoryPageForConversation(conversation);
        that.loadConversationHistory(conversation, pageSize).then((conversationUpdated: any) => {
            that._logger.log(that.DEBUG, "(loadConversationHistoryAsync) loadConversationHistory done.");
            //that._logger.log(that.INTERNAL, "(loadConversationHistoryAsync) loadConversationHistory conversationUpdated : ", conversationUpdated);
            return conversationUpdated;
        }).then((conversationHistoryUpdated: any) => {
            that._logger.log(that.INFO, "(loadConversationHistoryAsync) loadConversationHistory done.");
            // raise rainbow_onloadConversationHistoryCompleted
            this._eventEmitter.emit("evt_internal_loadConversationHistoryCompleted", conversationHistoryUpdated);
            return Promise.reject({code:-1, label:"load failed."});
        }).catch((error: any)=>{
            that._logger.log(that.ERROR, "(loadConversationHistoryAsync) loadConversationHistory Failed : ", error);
            this._eventEmitter.emit("evt_internal_loadConversationHistoryFailed", error);
        });
        return Promise.resolve({code:1, label:"load started, you should wait for conversation rainbow_onloadConversationHistoryCompleted for load result."});
    }

    /**
     * @private
     * @method loadEveryConversationsHistory
     * @instance
     * @category MESSAGES
     * @description
     *    Retrieve the remote history of a specific conversation. <br>
     * @param {Conversation} conversation Conversation to retrieve
     * @param {string} pageSize number of message in each page to retrieve messages. 
     * @async
     * @return {Promise<Conversation[]>}
     * @fulfil {Conversation[]} - Array of Conversation object
     * @category async
     */
    loadEveryConversationsHistory( pageSize : number = 30) {
        let that = this;
        let nbConversations = that.conversations?that.conversations.length:0 ;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(loadEveryConversationsHistory) .");

        for (let variableKey in that.conversations){
            if (that.conversations.hasOwnProperty(variableKey)){
                let conversation =  that.conversations[variableKey];
                //that.openConversationForContact(conversation).then(async function (conversationOpenned) {
                    //logger.log("debug", "MAIN - testloadConversationHistory - openConversationForContact, conversation : ", conversation);
                    let conversationOpenned = conversation;
                    that._logger.log(that.DEBUG, "MAIN - testloadConversationHistory - openConversationForContact, conversation.messages.length : ", conversationOpenned.messages.length);
                    that.loadConversationHistory(conversationOpenned, pageSize).then((conversationLoadedHistory) => {
                        that._logger.log(that.DEBUG, "(loadEveryConversationsHistory) loadConversationHistory result : ", conversationLoadedHistory.messages.length);
                    }, (err) => {
                        that._logger.log(that.DEBUG, "(loadEveryConversationsHistory) loadConversationHistory error : ", err);
                    });
                //});
            }
        }
    }

    /**
     *
     * @public
     * @nodered true
     * @method getOneMessageFromConversationId
     * @instance
     * @category MESSAGES
     * @description
     *    To retrieve ONE message archived on server exchanged in a conversation based on the specified message Id and the timestamp <br>
     * <br>
     *    Time stamp is mandatory - the search is performed using it. <br>
     *    Once results are returned, we look for a message with the message id specified. <br>
     * @param {string} conversationId : Id of the conversation
     * @param {string} messageId : Id of the message
     * @param {string} stamp : Time stamp. Time stamp is mandatory - the search is performed using it.
     * @async
     * @return {Promise<any>}
     */
    getOneMessageFromConversationId(conversationId:string, messageId : string, stamp:string) : Promise<Message> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getOneMessageFromConversationId) conversationId : ", conversationId);
        return new Promise(async (resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(getOneMessageFromConversationId) conversationId : ", conversationId, ", messageId : ", messageId);
            let conversation = that.getConversationById(conversationId);
            that._logger.log(that.DEBUG, LOG_ID + "(getOneMessageFromConversationId) conversation found, conversation.id: ", conversation.id);
            if (conversation) {
                let msg = conversation.getMessageById(messageId);
                if (msg != null) {
                    return resolve(msg);
                } else {
                    if (that._useS2S) {
                        that._logger.log(that.DEBUG, LOG_ID + "(getOneMessageFromConversationId) S2S is used, so can not retrieve message from server, it can only be used in XMPP Event Mode context.");
                        return reject();
                    }

                    /*
                    MessagesPool
                    pool = new MessagesPool(conversation.Id, conversation.Jid_im, currentContactJid);
// */
                    let conversationUpdated = await that.searchMessageArchivedFromServer(conversation, messageId, stamp) ;
                    let message = conversationUpdated.getMessageById(messageId);
                    resolve (message);
                    // */
                }
            } else {
                that._logger.log(that.DEBUG, LOG_ID + "(getOneMessageFromConversationId) No conversation found with this conversation ID : ", conversationId);
                return reject(undefined);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method getTheNumberOfHitsOfASubstringInAllUsersconversations
     * @instance
     * @category CONVERSATIONS
     * @async
     * @since 2.21.0
     * @return {Object} The result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | jid | String | the JID of the peer (P2P, BOT or ROOM) |
     * | count | Integer | The number of hits |
     *
     * @description
     *          This API can be used to search a text substring in all conversations for a given user from recent to old messages. </br>
     *          For technical reasons, the same limit value applies on all peer to peer conversations but also on all room conversations. </br>
     *          This API can only be used by user himself (i.e. userId of logged-in user). </br>
     * @param {string} userId User unique identifier
     * @param {string} substring Text to search
     * @param {number} limit Max number of matching messages count (expect up to 2x limit counts since the limit applies both to P2P and Room messages). Default value : : 100
     * @param {boolean} webinar Include webinars (excluded by default). Default value : : false
     */
    async getTheNumberOfHitsOfASubstringInAllUsersconversations (userId: string, substring : string, limit : number = 100, webinar : boolean = true) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) userId : ", userId);

        //that._logger.log(that.INTERNAL, LOG_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) parameters : userId : ", userId);

        return new Promise(function (resolve, reject) {
            try {
                let meId = userId ? userId : that._rest.account.id;

                if (!substring) {
                    that._logger.log(that.ERROR, LOG_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) bad or empty 'substring' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }
                that._rest.getTheNumberOfHitsOfASubstringInAllUsersconversations(meId, substring, limit, webinar).then((result : any) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) Successfully result : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) Error when updating informations.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) Error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     *
     * @public
     * @nodered true
     * @method getContactsMessagesFromConversationId
     * @instance
     * @category MESSAGES
     * @description
     *    To retrieve messages exchanged by contacts in a conversation. The result is the messages without event type. <br>
     * @param {string} conversationId : Id of the conversation
     * @async
     * @return {Promise<any>}
     */
    async getContactsMessagesFromConversationId(conversationId:string) : Promise<Message> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getContactsMessagesFromConversationId) conversationId : ", conversationId);

        if (!conversationId) {
            that._logger.log(that.DEBUG, LOG_ID + "(getContactsMessagesFromConversationId) bad or empty 'conversationId' parameter : ", conversationId);
            return null;
        }

        let conversation = that.getConversationById(conversationId);
        if (!conversation) {
            return null;
        }
        that._logger.log(that.DEBUG, LOG_ID + "(getContactsMessagesFromConversationId) conversation found, conversation.id: ", conversation.id);

        if (!conversation.messages) {
            that._logger.log(that.DEBUG, LOG_ID + "(getContactsMessagesFromConversationId) 'conversation.messages' undefined!");
            return null;
        }

        if (conversation.historyComplete == false) {
            that._logger.log(that.INFO, LOG_ID + "(getContactsMessagesFromConversationId) 'conversation.messages' empty, load the history !");
            await that.loadConversationHistory(conversation);
            if (!conversation.messages) {
                that._logger.log(that.WARN, LOG_ID + "(getContactsMessagesFromConversationId) after load history 'conversation.messages' undefined!");
                return null;
            }
        }

        return conversation.messages.filter((msg) => {
            return !msg.isEvent ;   
        });
    }

    async searchMessageArchivedFromServer(conversation: Conversation, messageId: string, stamp: string) {
        let that = this;
        /*
        // Avoid to call several time the same request
        if (conversation.currentHistoryId && conversation.currentHistoryId === conversation.historyIndex) {
            that._logger.log(that.DEBUG, LOG_ID + "[conversationServiceHistory] getHistoryPage(", conversation.id, ", ", size, ", ", conversation.historyIndex, ") already asked");
            return Promise.resolve(undefined);
        }
        conversation.currentHistoryId = conversation.historyIndex;
        // */
        that._logger.log(that.DEBUG, LOG_ID + "(searchMessageArchivedFromServer) conversationId : ", conversation.id, ", messageId", messageId, ", stamp : ", stamp, ")");

        if (conversation.historyDefered && conversation.historyDefered.promise) {
            that._logger.log(that.DEBUG, LOG_ID + "(searchMessageArchivedFromServer) conversation.historyDefered already defined, wait for end promise's treatment.");
            await conversation.historyDefered.promise;
            that._logger.log(that.DEBUG, LOG_ID + "(searchMessageArchivedFromServer) conversation.historyDefered already defined, promise's treatment Ended.");
        }
        // Create the defered object
        let defered = conversation.historyDefered = new Deferred();
        // Do nothing for userContact
        if (that._contactsService.isUserContact(conversation.contact)) {
            defered.reject();
            return defered.promise;
        }
        /*
          if (conversation.historyComplete) {
              that._logger.log(that.DEBUG, LOG_ID + "getHistoryPage(" + conversation.id + ") : already complete");
              defered.reject();
              return defered.promise;
          }
          // */
        let mamRequest = {
            "queryid": conversation.id,
            "with": conversation.id,
            "start": new Date(parseInt(stamp) - 300).toISOString(),
            "end": new Date(parseInt(stamp) + 300).toISOString()
        };
        if (conversation.historyIndex !== -1) {
            //mamRequest.before = conversation.historyIndex;
        }
        // Request for history messages for the room chat
        if (conversation.bubble) {
            mamRequest = {
                "queryid": conversation.id,
                "with": that._xmpp.jid_im,
                "start": new Date(parseInt(stamp) - 300).toISOString(),
                "end": new Date(parseInt(stamp) + 300).toISOString()
            };
            if (conversation.historyIndex !== -1) {
//                mamRequest.before = conversation.historyIndex;
            }
            that._xmpp.mamQueryMuc(conversation.id, conversation.bubble.jid, mamRequest);
        } else {
            // Request for history messages for the conversation
            that._xmpp.mamQuery(conversation.id, mamRequest);
        } // */

        return defered.promise;
    }

    /**
     * @private
     * @method sendFSMessage
     * @instance
     * @category MESSAGES
     * @description
     *   Send an file sharing message <br>
     */
    sendFSMessage(conversation, file, data) {
        //let message = conversation.sendFSMessage(file, data);
        //Conversation.prototype.sendFSMessage = function(file, data) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log(that.INFO, LOG_ID + "sendFSMessage");

            // Add message in messages array
            let fileExtension = file.name.split(".").pop();
            //let fileMimeType = file.type;
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
                                that._logger.log(that.DEBUG, LOG_ID + "uploadAFileByChunk success");
                               // resolve(fileDescriptor);
                                return Promise.resolve(fileDesc);
                            },
                            function errorCallback(error) {
                                that._logger.log(that.ERROR, LOG_ID + "uploadAFileByChunk error.");
                                that._logger.log(that.INTERNALERROR, LOG_ID + "uploadAFileByChunk error : ", error);

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
                        that._logger.log(that.ERROR, LOG_ID + "createFileDescriptor error");
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
     * @nodered true
     * @method sendExistingMessage
     * @instance
     * @category MESSAGES
     * @description
     *    Send a message to this conversation <br>
     * @return {Message} The message sent
     * @param {Conversation} conversation
     * @param {string} message
     * @param {any} fileDescriptor
     */
     sendExistingFSMessage(conversation : Conversation, message : string, fileDescriptor : any) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendExistingFSMessage) conversation.id : ", conversation?.id);
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
     * @category MESSAGES
     * @description
     *   Send an existing file sharing message <br>
     */
/*
    sendEFSMessage(conversation: Conversation, fileDescriptor, data) {
        let message = conversation.sendEFSMessage(fileDescriptor, data);
        this.storePendingMessage(conversation, message);
        return message;
    }
*/

    /**
     * @private
     * @method
     * @instance
     * @category MESSAGES
     * @description
     *    Send a instant message to a conversation <br>
     *    This method works for sending messages to a one-to-one conversation or to a bubble conversation<br>
     * @param {Conversation} conversation The conversation to clean
     * @param {string} data Test message to send
     * @param answeredMsg
     */
/*
    sendChatMessage(conversation : Conversation, data : string, answeredMsg) {
        let message = conversation.sendChatMessage(data, answeredMsg);
        this.storePendingMessage(conversation, message);
        return message;
    }
*/

    /**
     * SEND CORRECTED MESSAGE
     */
    /**
     * @public
     * @nodered true
     * @method sendCorrectedChatMessage
     * @category MESSAGES
     * @instance
     * @description
     *    Send a corrected message to a conversation <br>
     *    This method works for sending messages to a one-to-one conversation or to a bubble conversation<br>
     *    The new message has the property originalMessageReplaced which spot on original message // Warning this is a circular depend. <br>
     *    The original message has the property replacedByMessage  which spot on the new message // Warning this is a circular depend. <br>
     *    Note: only the last sent message on the conversation can be changed. The connected user must be the sender of the original message. <br>
     * @param {Conversation} conversation
     * @param {string} data The message string corrected
     * @param {string} origMsgId The id of the original corrected message.
     * @param {Object} [content] Allow to send alternative text base content
     * @param {String} [content.type=text/markdown] The content message type
     * @param {String} [content.message] The content message body
     * @returns {Promise<string>} message the message new correction message sent. Throw an error if the send fails.
     */
    async sendCorrectedChatMessage(conversation : Conversation, data : string, origMsgId : string, content : { message : string, type : string } = null) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendCorrectedChatMessage) conversation.id : ", conversation?.id);

        if (!conversation) {
            that._logger.log(that.ERROR, LOG_ID + "(sendCorrectedChatMessage) bad or empty 'conversation' parameter");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(sendCorrectedChatMessage) bad or empty 'conversation' parameter : ", conversation);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        /*
        if (data==undefined) {
            that._logger.log(that.ERROR, LOG_ID + "(sendCorrectedChatMessage) bad or empty 'data' parameter");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(sendCorrectedChatMessage) bad or empty 'data' parameter : ", data);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }//*/
        if (!origMsgId) {
            that._logger.log(that.ERROR, LOG_ID + "(sendCorrectedChatMessage) bad or empty 'origMsgId' parameter");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(sendCorrectedChatMessage) bad or empty 'origMsgId' parameter : ", origMsgId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        that._logger.log(that.INTERNAL, LOG_ID + "(sendCorrectedChatMessage) _entering_ conversation.id : ", conversation.id, ", data : \'", data,  "\', origMsgId : ", origMsgId, " content : ", content);

        let originalMessage = conversation.getMessageById(origMsgId);
        that._logger.log(that.INFO, LOG_ID + "(sendCorrectedChatMessage) originalMessage : ", originalMessage);
        if (originalMessage) {
            let originalMessageFrom = originalMessage.fromJid || originalMessage.from;
            if (originalMessageFrom!==that._rest.loggedInUser.jid_im) {
                that._logger.log(that.ERROR, LOG_ID + "(sendCorrectedChatMessage) forbidden Action - only sent messages can be modified");
                throw ErrorManager.getErrorManager().OTHERERROR("(sendCorrectedChatMessage) forbidden Action - only sent messages can be modified", "(sendCorrectedChatMessage) forbidden Action - only sent messages can be modified");
            }

            /* 
            let lastEditableMsg = conversation.getlastEditableMsg();

            if (lastEditableMsg.id!==originalMessage.id) {
                that._logger.log(that.ERROR, LOG_ID + "(sendCorrectedChatMessage) forbidden Action - only last sent message can be modified");
                throw ErrorManager.getErrorManager().OTHERERROR("(sendCorrectedChatMessage) forbidden Action - only last sent message can be modified", "(sendCorrectedChatMessage) forbidden Action - only last sent message can be modified");
            }
            // */

            let messageUnicode = data==="" ? "":(data ? shortnameToUnicode(data):undefined);

            try {
                let sentMessageId = await that._xmpp.sendCorrectedChatMessage(conversation, originalMessage, messageUnicode, origMsgId, originalMessage.lang, content);
                let newMsg = Object.assign({}, originalMessage);
                newMsg.id = sentMessageId;
                newMsg.content = messageUnicode;
                newMsg.date = new Date();
                newMsg.alternativeContent = content;
                newMsg.originalMessageReplaced = originalMessage; // Warning this is a circular depend.
                originalMessage.replacedByMessage = newMsg; // Warning this is a circular depend.
                that._logger.log(that.INTERNAL, LOG_ID + "(sendCorrectedChatMessage) id : ", sentMessageId, ", This is a replace msg, so set newMsg.originalMessageReplaced.replacedByMessage : ", newMsg.originalMessageReplaced.replacedByMessage);
                this.pendingMessages[sentMessageId] = {conversation: conversation, message: newMsg};
                return newMsg;
            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "sendCorrectedChatMessage error");
                let error = ErrorManager.getErrorManager().OTHERERROR(err.message, "(sendCorrectedChatMessage) error while sending corrected message : " + err);
                // @ts-ignore
                error.newMessageText = data;
                // @ts-ignore
                error.originaleMessageId = origMsgId;
                throw  error;
            }
        } else {
            that._logger.log(that.WARN, LOG_ID + "(sendCorrectedChatMessage) error the original message was not found in conversation : ", conversation);
            let error = ErrorManager.getErrorManager().OTHERERROR("sendCorrectedChatMessage error the original message was not found.", "sendCorrectedChatMessage error the original message was not found.");
            // @ts-ignore
            error.newMessageText = data;
            // @ts-ignore
            error.originaleMessageId = origMsgId;
            throw  error;
        }
    }

    /**
     * @public
     * @since 1.58
     * @nodered true
     * @method deleteMessage
     * @category MESSAGES
     * @instance
     * @async
     * @description
     *    Delete a message by sending an empty string in a correctedMessage <br>
     * @param {Conversation} conversation The conversation object
     * @param {string} messageId The id of the message to be deleted
     * @return {Message} - message object with updated replaceMsgs property
     */
    async deleteMessage (conversation : Conversation, messageId : string) : Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteMessage) conversation.id : ", conversation?.id, ", messageId : ", messageId);

        if (!conversation) {
            that._logger.log(that.ERROR, LOG_ID + "(deleteMessage) Parameter 'conversation' is missing or null");
            throw ErrorManager.getErrorManager().BAD_REQUEST();
        }

        if (!messageId) {
            that._logger.log(that.ERROR, LOG_ID + "(deleteMessage) Parameter 'messageId' is missing or empty");
            throw ErrorManager.getErrorManager().BAD_REQUEST();
        }

        let messageOrig = conversation.getMessageById(messageId);
        await that.sendCorrectedChatMessage(conversation, "", messageId);
        return messageOrig;
    }

    /**
     *
     * @public
     * @since 1.67.0
     * @nodered true
     * @method deleteAllMessageInOneToOneConversation
     * @category MESSAGES
     * @instance
     * @async
     * @description
     *   Delete all messages for the connected user on a one to one conversation. <br>
     * @param {Conversation} conversation The conversation object
     * @return {Message} - message object with updated replaceMsgs property
     */
    deleteAllMessageInOneToOneConversation (conversation : Conversation) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteAllMessageInOneToOneConversation) conversation.id : ", conversation?.id);

        if (!conversation) {
            that._logger.log(that.ERROR, LOG_ID + "(deleteAllMessageInOne2OneConversation) bad or empty 'conversation' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteAllMessageInOne2OneConversation) bad or empty 'conversation' parameter : ", conversation);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let conversationObj = that.getConversationById(conversation.id);

        if (conversationObj.type !== Conversation.Type.ONE_TO_ONE) {
            that._logger.log(that.ERROR, LOG_ID + "(deleteAllMessageInOne2OneConversation) bad or empty 'conversation.type' parameter.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteAllMessageInOne2OneConversation) bad or empty 'conversation.type' parameter : ", conversationObj);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return that._xmpp.deleteAllMessageInOneToOneConversation(conversationObj.id);
    }

    /**
     * @private
     * @category MESSAGES
     * @description
     *      Store the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent. <br>
     *      It allow to give back the status of the sending process. <br>
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
     * @category MESSAGES
     * @description
     *      delete the message in a pending list. This pending list is used to wait the "_onReceipt" event from server when a message is sent. <br>
     *      It allow to give back the status of the sending process. <br>
     * @param message
     */
    removePendingMessage(message) {
        delete this.pendingMessages[message.id];
    }

    /**
     * @public
     * @nodered true
     * @method removeAllMessages
     * @category MESSAGES
     * @instance
     * @description
     *    Cleanup a conversation by removing all previous messages<br>
     *    This method returns a promise <br>
     * @param {Conversation} conversation The conversation to clean
     * @async
     * @return {Promise}
     * @fulfil {} Return nothing in case success
     * @category async
     */
    removeAllMessages(conversation : Conversation) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(removeAllMessages) conversation.id : ", conversation?.id);

        return new Promise((resolve) => {
            if (!conversation) {
                that._logger.log(that.ERROR, LOG_ID + "(removeAllMessages) bad or empty 'conversation' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(removeAllMessages) bad or empty 'conversation' parameter : ", conversation);
                return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            that._logger.log(that.INFO, LOG_ID + "(removeAllMessage) _entering_ " + conversation.id);

            // Id must be filled by lower layer
            let mamRequest = {
                //"queryid": mamRequestId,
                "with": conversation.id,
                "onComplete": function(result) {
                    that._logger.log(that.INTERNAL, LOG_ID + " removeAllMessage " + conversation.id, ", result : ", result);
                    // FIXME : handle error message (ask Andreï)
                    resolve(result);
                }
            };

            that.pendingMessages = {};

            that._xmpp.mamDelete( mamRequest);

/*
            let mamRequest = {
                "deleteid": "remove_" + conversation.id,
                "with": conversation.id,
                "before": moment().add(1, 'minutes')
                    .utc()
                    .format("YYYY-MM-DDTHH:mm:ss") + "Z",
                "onComplete": function (result) {
                    that._logger.log(that.DEBUG, LOG_ID + " removeAllMessage " + conversation.id, ", result : ", result);
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
     * @nodered true
     * @method removeMessagesFromConversation
     * @category MESSAGES
     * @instance
     * @description
     *    Remove a specific range of message in a conversation<br>
     *    This method returns a promise <br>
     * @param {Conversation} conversation The conversation to clean
     * @param {Date} date The date since when the message should be deleted.
     * @param {number} number max number of messages to delete.
     * @async
     * @return {Promise}
     * @fulfil {} Return nothing in case success
     * @category async
     */
    removeMessagesFromConversation(conversation : Conversation, date : Date, number : number) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(removeMessagesFromConversation) conversation.id : ", conversation?.id, " removing number : " + number + " messages after :" + date);

        return new Promise((resolve) => {
            // that._logger.log(that.INFO, LOG_ID + " removeMessagesFromConversation " + conversation.id);
            // that._logger.log(that.INFO, LOG_ID + " removing " + number + " messages after " + date);

            let mamRequest = {
                "deleteid": "remove_" + conversation.id,
                "with": conversation.id,
                "start": moment(date).format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ"),
                "max": number,
                "onComplete": () => {
                    that
                        ._logger
                        .log("info", LOG_ID + " MAM Message deleted !!!");
                    resolve(undefined);
                }
            };

            that.pendingMessages = Object.fromEntries(Object.entries(that.pendingMessages).filter(([key, messagePending ] : [string, Message]) => { if (messagePending.date > date) { return false; } }));
            
            //that.pendingMessages = that.pendingMessages.filter((messagePending) => { if (messagePending.date > date) { return false; } });

            // Request for history messages
            that._xmpp.mamDelete(mamRequest);
            //that._xmpp.mamDelete(conversation.id, mamRequest);
        });
    }

    /**
     * @public
     * @nodered true
     * @method sendIsTypingState
     * @category MESSAGES
     * @instance
     * @description
     *    Switch the "is typing" state in a conversation<br>
     * @param {Conversation} conversation The conversation recipient
     * @param {boolean} status The status, true for setting "is Typing", false to remove it
     * @return a promise with no success parameter
     */
    sendIsTypingState(conversation : Conversation, status : boolean) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendIsTypingState) conversation.id : ", conversation?.id, " status : ", status);

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
                    resolve(that._xmpp.sendIsTypingState(conversation, status));
                }
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method updateConversationBookmark
     * @instance
     * @category MESSAGES
     * @async
     * @since 2.21.0
     * @return {Object} The result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | status | String | Status message. |
     * | data | Object\[\] | No data (empty Array) |
     * 
     * @description
     *          This API can be used to set or replace a bookmarked message in a conversation. This API can only be used by user himself. </br>
     * @param {string} userId User unique identifier.
     * @param {string} conversationId conversation unique identifier (the dbId property in Conversation).
     * @param {string} messageId message unique identifier.
     */
    updateConversationBookmark (userId : string, conversationId : string, messageId : string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(updateConversationBookmark) conversationId : ", conversationId, " userId : ", userId, ", messageId : ", messageId);

        //that._logger.log(that.INTERNAL, LOG_ID + "(updateConversationBookmark) parameters : userId : ", userId);

        return new Promise(function (resolve, reject) {
            try {
                let meId = userId ? userId : that._rest.account.id;

                if (!conversationId) {
                    that._logger.log(that.ERROR, LOG_ID + "(updateConversationBookmark) bad or empty 'conversationId' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                if (!messageId) {
                    that._logger.log(that.ERROR, LOG_ID + "(updateConversationBookmark) bad or empty 'messageId' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.updateConversationBookmark(meId, conversationId, messageId).then((result : any) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(updateConversationBookmark) Successfully result : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(updateConversationBookmark) Error when updating informations.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(updateConversationBookmark) Error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(updateConversationBookmark) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method deleteConversationBookmark
     * @instance
     * @category MESSAGES
     * @async
     * @since 2.21.0
     * @return {Object} The result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | status | String | Status message. |
     * | data | Object\[\] | No data (empty Array) |
     * 
     * @description
     *          This API can be used to set or replace a bookmarked message in a conversation. This API can only be used by user himself. </br>
     * @param {string} userId User unique identifier.
     * @param {string} conversationId conversation unique identifier (the dbId property in Conversation).
     */
    deleteConversationBookmark (userId : string, conversationId : string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteConversationBookmark) conversationId : ", conversationId, " userId : ", userId);
    //    that._logger.log(that.INTERNAL, LOG_ID + "(deleteConversationBookmark) parameters : userId : ", userId);

        return new Promise(function (resolve, reject) {
            try {
                let meId = userId ? userId : that._rest.account.id;

                if (!conversationId) {
                    that._logger.log(that.ERROR, LOG_ID + "(deleteConversationBookmark) bad or empty 'conversationId' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.deleteConversationBookmark(meId, conversationId).then((result : any) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteConversationBookmark) Successfully result : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(deleteConversationBookmark) Error when updating informations.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteConversationBookmark) Error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteConversationBookmark) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method showAllMatchingMessagesForAPeer
     * @since 2.21.0
     * @instance
     * @category MESSAGES
     * @description
     * This API can be used to return all matching messages for one specific peer. This API can only be used by user himself. <br>
     * @return {Promise<any>} An object of the result
     *
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | timestamp | Integer | Message timestamp in microseconds |
     * | msgId | String | The message ID |
     *
     * @param {string} userId User unique identifier
     * @param {string} substring Text to search
     * @param {string} peer Peer JID
     * @param {boolean} isRoom Is the peer a room ?
     * @param {number} limit Max number of matching messages references. Default value : : 20
     */    
    showAllMatchingMessagesForAPeer (userId : string, substring : string, peer : string, isRoom : boolean = undefined, limit : number = 20) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(showAllMatchingMessagesForAPeer) substring : ", substring, " userId : ", userId);

        //that._logger.log(that.INTERNAL, LOG_ID + "(showAllMatchingMessagesForAPeer) parameters : userId : ", userId);

        return new Promise(function (resolve, reject) {
            try {
                let meId = userId ? userId : that._rest.account.id;

                if (!substring) {
                    that._logger.log(that.ERROR, LOG_ID + "(showAllMatchingMessagesForAPeer) bad or empty 'substring' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                if (!peer) {
                    that._logger.log(that.ERROR, LOG_ID + "(showAllMatchingMessagesForAPeer) bad or empty 'peer' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.showAllMatchingMessagesForAPeer(meId, substring, peer, isRoom, limit).then((result : any) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(showAllMatchingMessagesForAPeer) Successfully result : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(showAllMatchingMessagesForAPeer) Error when updating informations.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(showAllMatchingMessagesForAPeer) Error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(showAllMatchingMessagesForAPeer) error : ", err);
                return reject(err);
            }
        });       
    }
    
// endregion MESSAGES
    
//region CONVERSATIONS
    
        /**
     * @public
         * @nodered true
         * @method getAllConversations
     * @category CONVERSATIONS
     * @instance
     * @description
     *    Allow to get the list of existing conversations (p2p and bubbles) <br>
     * @return {Conversation[]} An array of Conversation object
     */
    getAllConversations() {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getAllConversations) .");
        return that.getConversations();
    };

    /**
     * @private
     * @method
     * @category CONVERSATIONS
     * @instance
     * @description
     *      Get all conversation <br>
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
     * @nodered true
     * @method openConversationForContact
     * @category CONVERSATIONS
     * @instance
     * @description
     *    Open a conversation to a contact <br>
     *    Create a new one if the conversation doesn't exist or reopen a closed conversation<br>
     *    This method returns a promise <br>
     * @param {Contact} contact The contact involved in the conversation
     * @return {Conversation} The conversation (created or retrieved) or null in case of error
     */
    openConversationForContact (contact : Contact): Promise<Conversation> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(openConversationForContact) contact : ", contact);

        return new Promise(function (resolve, __reject) {

            if (!contact) {
                return __reject({
                    code: ErrorManager.getErrorManager().BAD_REQUEST,
                    label: "Parameter 'contact' is missing or null"
                });
            } else {
                that._logger.log(that.INFO, LOG_ID + " :: Try to create of get a conversation.");
                that._logger.log(that.INTERNAL, LOG_ID + " :: Try to create of get a conversation with " + contact.lastName + " " + contact.firstName);


                that.getOrCreateOneToOneConversation(contact.jid).then(async function (conversation: any) {
                    that._logger.log(that.INFO, LOG_ID + "  :: Conversation retrieved or created " + conversation.id);
                    if (!conversation.dbId) {
                        conversation = await that.createServerConversation(conversation);
                        that._logger.log(that.INTERNAL, LOG_ID + "(openConversationForContact) conversation : ", conversation);
                    }

                    resolve(conversation);
                }).catch(function (result) {
                    that._logger.log(that.ERROR, LOG_ID + "(openConversationForContact) Error.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(openConversationForContact) Error : ", result);
                    return __reject(result);
                });
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method openConversationForBubble
     * @since 1.65
     * @category CONVERSATIONS
     * @instance
     * @description
     *    Open a conversation to a bubble <br>
     *    Create a new one if the conversation doesn't exist or reopen a closed conversation<br>
     *    This method returns a promise <br>
     * @param {Bubble} bubble The bubble involved in this conversation
     * @return {Promise<Conversation>} The conversation (created or retrieved) or null in case of error
     */
    openConversationForBubble(bubble : Bubble) : Promise<Conversation>{
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(openConversationForBubble) bubble.id : ", bubble?.id);

        return new Promise(function (resolve, __reject) {

            if (!bubble) {
                return __reject({
                    code: ErrorManager.getErrorManager().BAD_REQUEST,
                    label: "Parameter 'bubble' is missing or null"
                });
            } else {
                that._logger.log(that.INFO, LOG_ID + "(openConversationForBubble), Try to create of get a conversation for bubble.");
                that._logger.log(that.INTERNAL, LOG_ID + "(openConversationForBubble), Try to create of get a conversation with bubble : ", bubble);

                that.getBubbleConversation(bubble.jid,undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined).then(function (conversation) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(openConversationForBubble), Conversation retrieved or created, conversation : ", conversation);
                    resolve(conversation)
                }).catch(function (result) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(openConversationForBubble) Error : ", result);
                    __reject(result);
                });
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method getS2SServerConversation
     * @since 1.65
     * @category CONVERSATIONS
     * @instance
     * @description
     *    get a conversation from id on S2S API Server.<br>
     *    This method returns a promise <br>
     * @param {string} conversationId The id of the conversation to find.
     * @return {Conversation} The conversation (created or retrieved) or null in case of error
     */
    getS2SServerConversation(conversationId : string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getS2SServerConversation) conversationId : ", conversationId);

        return new Promise(function (resolve, __reject) {

            if (!conversationId) {
                return __reject({
                    code: ErrorManager.getErrorManager().BAD_REQUEST,
                    label: "Parameter 'conversationId' is missing or null"
                });
            } else {
                that._logger.log(that.INFO, LOG_ID + "(getS2SServerConversation), Try to create of get a conversation for bubble.");
                that._logger.log(that.INTERNAL, LOG_ID + "(getS2SServerConversation), Try to create of get a conversation with bubble : ", conversationId);

                that.getS2SServerConversation(conversationId).then(function (conversationInfos) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(getS2SServerConversation), Conversation retrieved or created, conversation : ", conversationInfos);
                    /*that._logger.log(that.INFO, LOG_ID + "[Conversation] Create bubble conversation (" + bubble.jid + ")");

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
                    that._logger.log(that.INTERNAL, LOG_ID + "(getS2SServerConversation) Error : ", result);
                    __reject(result);
                });
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method deleteServerConversation
     * @category CONVERSATIONS
     * @instance
     * @description
     *    Allow to delete a conversation on server (p2p and bubbles) <br>
     * @param {string} conversationId of the conversation (id field)
     * @return {Promise}
     */
    deleteServerConversation(conversationId : string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(deleteServerConversation) conversationId : ", conversationId);
        //that._logger.log(that.INFO, LOG_ID + "deleteServerConversation conversationId : ", conversationId);

        // Ignore conversation without dbId
        if (!conversationId) { return Promise.resolve(undefined); }

        return that._rest.deleteServerConversation(conversationId).then( (result ) => {
            // TODO ? that.orderConversations();
            return Promise.resolve(result);
        }).catch( (err) => {
            that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteServerConversation) err : ", err);
            // Check particular case where we are trying to remove an already removed conversation
            if (err.errorDetailsCode === 404002 || err.error.errorDetailsCode === 404002 ) {
                that._logger.log(that.INFO, LOG_ID + "deleteServerConversation success: " + conversationId);
                return Promise.resolve(undefined);
            }

            let errorMessage = "deleteServerConversation failure: " + err.error ? err.error.errorDetails : err.errorDetails;
            that._logger.log(that.WARN, LOG_ID + "Error.");
            that._logger.log(that.INTERNALERROR, LOG_ID + "Error : ", errorMessage);
            return Promise.reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));

        });
    }

    /**
     * @private
     * @method
     * @category CONVERSATIONS
     * @instance
     * @description
     *    Allow to mute notification in a conversations (p2p and bubbles) <br>
     *    When a conversation is muted/unmuted, all user's resources will receive the notification <br>
     * @param {string} conversationId ID of the conversation (dbId field)
     * @param {Boolean} mute mutation state
     * @return {Promise}
     */
    updateServerConversation(conversationId, mute) {

        // Ignore conversation without dbId
        if (!conversationId) { return Promise.resolve(undefined); }

        return this._rest.updateServerConversation(conversationId, mute);
    }

    /**
     * @public
     * @nodered true
     * @method sendConversationByEmail
     * @category CONVERSATIONS
     * @instance
     * @description
     *    Allow to get the specified conversation as mail attachment to the login email of the current user (p2p and bubbles) <br>
     *    can be used to backup a conversation between a rainbow user and another one, or between a user and a room, <br>
     *    The backup of the conversation is restricted to a number of days before now. By default the limit is 30 days. <br>
     * @param {string} conversationDbId ID of the conversation (dbId field)
     * @param {Array<string>} emails Allows to send the backup to users from an emails list.</BR> When one email matchs with a Rainbow user loginEmail, the mail sent is localized using this user's language.
     * @param {string} lang Language of the email notification if user language value is not available (for no Rainbow users). Default value : : en
     * @async
     * @return {Promise<Conversation[]>}
     * @fulfil {Conversation[]} - Array of Conversation object
     * @category async
     */
    sendConversationByEmail(conversationDbId, emails : Array<string> = undefined, lang : string = "en"  ) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(sendConversationByEmail) conversationDbId : ", conversationDbId);
        return this._rest.sendConversationByEmail(conversationDbId, emails, lang);
    }

    /**
     * @private
     * @method
     * @category CONVERSATIONS
     * @instance
     */
    async getOrCreateOneToOneConversation(conversationId, conversationDbId?, lastModification?, lastMessageText?, missedIMCounter?, muted?, creationDate?) : Promise<Conversation>{
        let that = this;
        return new Promise((resolve, reject) => {

            // Fetch the conversation
            let conv = that.getConversationById(conversationId);
            if (conv) {
                conv.preload = true;
                that._logger.log(that.INFO, LOG_ID + "getOrCreateOneToOneConversation, getConversationById found the conversation : " + conversationId + " " + conversationDbId + " " + missedIMCounter);
                resolve(conv);
                return;
            }

            that._logger.log(that.INFO, LOG_ID + "getOrCreateOneToOneConversation " + conversationId + " " + conversationDbId + " " + missedIMCounter);


            // No conversation found, then create it
            that._contactsService.getOrCreateContact(conversationId,undefined) /* Get or create the conversation*/ .then( (contact) => {
                that._logger.log(that.INFO, LOG_ID + "[Conversation] Create one to one conversation for contact.id : (" + contact.id + ")");

                let  conversation = Conversation.createOneToOneConversation(contact, that._logger);
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
                    that._logger.log(that.ERROR, LOG_ID + "(getOrCreateOneToOneConversation) Error : ", error );
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(getOrCreateOneToOneConversation) Error : ", errorMessage);

                    return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                });
        });
    }
    
    /**
     * @public
     * @nodered true
     * @method getConversationById
     * @category CONVERSATIONS
     * @instance
     * @description
     *      Get a p2p conversation by id <br>
     * @param {string} conversationId Conversation id of the conversation to clean
     * @return {Conversation} The conversation to retrieve
     */
    getConversationById(conversationId : string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getConversationById) conversationId : ", conversationId);
        //that._logger.log(that.DEBUG, LOG_ID + " (getConversationById) conversationId : ", conversationId);
        if (!this.conversations) {
            return null;
        }
        let conv =  this.conversations[conversationId];
        that._logger.log(that.INTERNAL, LOG_ID + " (getConversationById) conversation by id, id of conversation found : ", conv ? conv.id : "");
        if (!conv) {
            conv = that.getConversationByDbId(conversationId);
            that._logger.log(that.INTERNAL, LOG_ID + " (getConversationById) conversation not found by id, so searched by dbId result : ", conv);
        } 
        return conv;
    }

    /**
     * @public
     * @nodered true
     * @method getConversationByDbId
     * @category CONVERSATIONS
     * @instance
     * @description
     *      Get a conversation by db id <br>
     * @param {string} dbId db id of the conversation to retrieve
     * @return {Conversation} The conversation to retrieve
     */
    getConversationByDbId(dbId : string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getConversationByDbId) dbId : ", dbId);

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
     * @public
     * @nodered true
     * @method getConversationByBubbleId
     * @category CONVERSATIONS
     * @instance
     * @description
     *      Get a bubble conversation by bubble id <br>
     * @param {string} bubbleId Bubble id of the conversation to retrieve
     * @return {Conversation} The conversation to retrieve
     */
    async getConversationByBubbleId(bubbleId : string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getConversationByBubbleId) bubbleId : ", bubbleId);
//        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getConversationByBubbleId) bubbleId : ", bubbleId);

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
     * @public
     * @nodered true
     * @method getConversationByBubbleJid
     * @category CONVERSATIONS
     * @instance
     * @description
     *      Get a bubble conversation by bubble id <br>
     * @param {string} bubbleJid Bubble jid of the conversation to retrieve
     * @return {Conversation} The conversation to retrieve
     */
    getConversationByBubbleJid(bubbleJid : string) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getConversationByBubbleJid) bubbleJid : ", bubbleJid);
        //that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getConversationByBubbleJid) bubbleJid : ", bubbleJid);

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
     * @nodered true
     * @method getBubbleConversation
     * @category CONVERSATIONS
     * @instance
     * @description
     *    Get a conversation associated to a bubble (using the bubble ID to retrieve it) <br>
     * @param {string} bubbleJid JID of the bubble (dbId field)
     * @param {string} conversationDbId
     * @param {Date} lastModification
     * @param {string} lastMessageText
     * @param {number} missedIMCounter
     * @param {boolean} noError
     * @param {boolean} muted
     * @param {Date} creationDate
     * @param {string} lastMessageSender
     * @async
     * @return {Promise<Conversation>}
     * @fulfil {Conversation} - Conversation object or null if not found
     * @category async
     */
    getBubbleConversation(bubbleJid : string, conversationDbId? : string, lastModification? : Date, lastMessageText? : string, missedIMCounter? : number, noError? : boolean, muted? : boolean, creationDate? : Date, lastMessageSender? : string) : Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getBubbleConversation) bubbleJid : ", bubbleJid, ", conversationDbId : ", conversationDbId);
        // that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(getBubbleConversation) bubbleJid : ", bubbleJid);

        //that._logger.log(that.INTERNAL, LOG_ID + "getBubbleConversation bubbleJib : ", bubbleJid);

        // Fetch the conversation in memory
        let conversationResult = that.getConversationById(conversationDbId);
        if (conversationResult) {
            conversationResult.preload = true;
            that._logger.log(that.INTERNAL, LOG_ID + "(getBubbleConversation) conversation found by Id : ", conversationDbId, " : conversation : ", conversationResult);
            return Promise.resolve(conversationResult);
        }

        let conversation = that.getConversationByBubbleJid(bubbleJid);
        if (conversation) {
            conversation.preload = true;
            that._logger.log(that.INTERNAL, LOG_ID + "(getBubbleConversation) conversation found by BubbleJid : ", bubbleJid, " : conversation : ", conversation);
            return Promise.resolve(conversation);
        }
        // No conversation found, then create it
        return new Promise((resolve, reject) => {

            // Get the associated bubble
            that._bubblesService.getBubbleByJid(bubbleJid).then((bubble) => {
                if (!bubble) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getBubbleConversation) (" + bubbleJid + ") failure : no such bubble");

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
                    resolve(undefined);
                } else {
                    that._logger.log(that.INFO, LOG_ID + "[Conversation] Create bubble conversation (" + bubble.jid + ")");

                    conversation = Conversation.createBubbleConversation(bubble, that._logger);
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
                                that._presenceService.sendInitialBubblePresenceSync(bubble).catch((errOfSent) => {
                                    that._logger.log(that.WARN, LOG_ID + "(getBubbleConversation) Error while sendInitialBubblePresenceSync : ", errOfSent);
                                });
                            }
                            // Send conversations update event
                            that._eventEmitter.emit("evt_internal_conversationupdated", __conversation);
                            resolve(__conversation);
                        }).catch(async function (error) {
                            let errorMessage = "(getBubbleConversation) (" + bubbleJid + ") failure : " + error.message;
                            that._logger.log(that.ERROR, LOG_ID + "Error.");
                            that._logger.log(that.INTERNALERROR, LOG_ID + "Error : ", errorMessage);
                            await that.deleteServerConversation(conversationDbId);
                            if (noError) {
                                resolve(undefined);
                            } else {
                                return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
                            }
                        });
                    }
                }
            }).catch(async (error) => {
                let errorMessage = "(getBubbleConversation) (" + bubbleJid + ") failure : " + error.message;
                that._logger.log(that.ERROR, LOG_ID + "Error.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "Error : ", errorMessage);
                await that.deleteServerConversation(conversationDbId);
                if (noError) {
                    resolve(undefined);
                } else {
                    return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
                }
            });

        });
    }

    /**
     * @public
     * @nodered true
     * @method closeConversation
     * @category CONVERSATIONS
     * @instance
     * @description
     *    Close a conversation <br>
     *    This method returns a promise <br>
     * @param {Conversation} conversation The conversation to close
     * @async
     * @return {Promise}
     * @fulfil {} Return nothing in case success
     * @category async
     */
    closeConversation(conversation : Conversation) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(closeConversation) conversation.id : ", conversation?.id);

        return new Promise((resolve, reject) => {
            //that._logger.log(that.INFO, LOG_ID + "closeConversation " + conversation.id);

            // Remove this contact from favorite group
            that
                .deleteServerConversation(conversation.dbId)
                .then( () => {
                    that.removeConversation(conversation);
                    resolve(undefined);
                })
                .catch( (error) => {
                    return reject(error);
                });
        });
    }

    /**
     * @private
     * @method
     * @category CONVERSATIONS
     * @instance
     * @description
     *    Remove locally a conversation <br>
     *    This method returns a promise <br>
     * @param {Conversation} conversation The conversation to remove
     */
    removeConversation(conversation : Conversation) {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(removeConversation) conversation.id : ", conversation?.id);
        //that._logger.log(that.INFO, LOG_ID + "remove conversation " + conversation.id);

        if (conversation.videoCall && conversation.videoCall.status !== Call.Status.UNKNOWN) {
            that._logger.log(that.INFO, LOG_ID + "Ignore conversation deletion message for conversation" + conversation.id);
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



    /**
     * @public
     * @nodered true
     * @method cleanConversations
     * @category CONVERSATIONS
     * @instance
     * @async
     * @description
     *    Allow to clean openned conversations. It keep openned the maxConversations last modified conversations. If maxConversations is not defined then keep the last 15 conversations. <br>
     * @return {Promise<any>} the result of the deletion.
     * @category async
     */
    async cleanConversations() {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + API_ID + "(cleanConversations) .");

        return new Promise((resolve,reject) => {
             that._rest.getServerConversations(that.conversationsRetrievedFormat).then(async (conversations: []) => {
                resolve (await that.removeOlderConversations(conversations));
            }).catch((error) => {
                that._logger.log(that.WARN, LOG_ID + "getServerConversations Failed to retrieve conversations for removeOlderConversations : ", error);
                that._logger.log(that.INTERNALERROR, LOG_ID + "getServerConversations Failed to retrieve conversations for removeOlderConversations : ", error);
                // The remove of old conversations is not mandatory, so lets continue the treatment.
            });
        });
    }

    /**
     * @private
     * @method
     * @category CONVERSATIONS
     * @instance
     * @description
     *    Allow to get the list of existing conversations from server (p2p and bubbles) <br>
     * @return {Conversation[]} An array of Conversation object
     */
    getServerConversations() {
        let that = this;

        return new Promise(async (resolve, reject) => {

            await that._rest.getServerConversations(that.conversationsRetrievedFormat).then(async (conversations : []) => {
                await that.removeOlderConversations(conversations);
            }).catch((error) => {
                that._logger.log(that.WARN, LOG_ID + "(getServerConversations) Failed to retrieve conversations for removeOlderConversations : ", error);
                that._logger.log(that.INTERNALERROR, LOG_ID + "(getServerConversations) Failed to retrieve conversations for removeOlderConversations : ", error);
                // The remove of old conversations is not mandatory, so lets continue the treatment.
            });

            that._rest.getServerConversations(that.conversationsRetrievedFormat).then((conversations : []) => {
                // Create conversation promises
                let conversationPromises = [];
                that._logger.log(that.DEBUG, LOG_ID + "(getServerConversations) conversations.length retrieved : ", conversations.length);
                conversations.forEach(function (conversationData : any) {
                    let missedImCounter = parseInt(conversationData.unreadMessageNumber, 10);
                    let conversationPromise: Promise<any>;
                    let muted = (conversationData.mute === true);
                    //that._logger.log(that.DEBUG, LOG_ID + "getServerConversations conversationData retrieved : ", conversationData);
                    if (conversationData.type === "user") {
                        conversationPromise = that.getOrCreateOneToOneConversation(conversationData.jid_im, conversationData.id, conversationData.lastMessageDate, conversationData.lastMessageText, missedImCounter, muted, conversationData.creationDate).catch( (err) => {
                            that._logger.log(that.WARN, LOG_ID + "(getServerConversations) getOrCreateOneToOneConversation warn error : ", err);
                            return err;
                        });
                    } else {
                        conversationPromise = that.getBubbleConversation(conversationData.jid_im, conversationData.id, conversationData.lastMessageDate, conversationData.lastMessageText, missedImCounter, true, muted, conversationData.creationDate, conversationData.lastMessageSender).catch( (err) => {
                            that._logger.log(that.WARN, LOG_ID + "(getServerConversations) getBubbleConversation warn error : ", err);
                            return err;
                        });
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
                        let errorMessage = "(getServerConversations) failure: " + error.message;
                        that._logger.log(that.ERROR, LOG_ID + "error.");
                        that._logger.log(that.INTERNALERROR, LOG_ID + "error : ", errorMessage);
                        return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                    });
            })
                .catch((err) => {
                    let errorMessage = "(getServerConversations) failure: no server response";

                    if (err) {
                        errorMessage = "(getServerConversations) failure: " + JSON.stringify(err);
                    }

                    that._logger.log(that.ERROR, LOG_ID + "(getServerConversations) error : ", err);
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(getServerConversations) error : ", errorMessage);
                    return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage,errorMessage));
                });
        });
    }

    /**
     * @private
     * @method
     * @category CONVERSATIONS
     * @instance
     * @description
     *    Allow to create a conversations on server (p2p and bubbles) <br>
     * @param {Conversation} conversation of the conversation (dbId field)
     * @param {boolean} mute : true if conversation is muted, false otherwise. Default value : false.
     * @return {Conversation} Created conversation object
     */
    createServerConversation(conversation : Conversation, mute : boolean = false ) {
        let that = this;
        // Ignore already stored existing conversation
        if (conversation.dbId) { return Promise.resolve(conversation); }

        // Prepare global variables
        let data = {peerId:null, type: null, mute: null};

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

        data.mute = mute;
        
        return this._rest.createServerConversation( data ).then((result : any)=> {
            that._logger.log(that.INFO, LOG_ID + "createServerConversation success: " + conversation.id);
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
            that._logger.log(that.ERROR, LOG_ID + "" + errorMessage);
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
            that._logger.log(that.DEBUG, LOG_ID + "(removeOlderConversations) -- maxConversations : ", maxConversations);
            if (orderedConversations.length > maxConversations) {
                that._logger.log(that.DEBUG, LOG_ID + "(removeOlderConversations) -- orderedConversations : ", orderedConversations.length);
                let removePromises = [];
                for (let index = maxConversations; index < orderedConversations.length; index++) {
                    let conv = orderedConversations[index];
                    if (conv) {
                        removePromises.push(that.deleteServerConversation(conv.id));
                    } else {
                        that._logger.log(that.DEBUG, LOG_ID + "(removeOlderConversations) -- conversation undefined, so cannot delete it.");
                    }
                }
                Promise.all(removePromises).then((result) => {
                    resolve(result);
                }).catch((err) => {
                    resolve(err);
                });
            } else {
                resolve(undefined);
            }
        });
    };

//endregion CONVERSATION

    //region EVENTS
    /**
     * @private
     */
    async onRoomChangedEvent(__event, bubble, action) {
        let that = this;
        if (bubble) {
            let conversation = this.getConversationById(bubble.jid);
            if (conversation) {
                if (action === "remove") {
                    await this.closeConversation(conversation).catch(err=>{
                        that._logger.log(that.WARN, LOG_ID + "(onRoomChangedEvent) closeConversation error : ", err);
                    });
                } else {
                    conversation.bubble = bubble;
                }
            }
        }
    }

    /**
     * @private
     */
   /* onRoomHistoryChangedEvent(__event, room) {
        if (room) {
            let conversation = this.getConversationById(room.jid);
            if (conversation && conversation.chatRenderer) {
                conversation.reset();
                conversation
                    .chatRenderer
                    .loadMore();
            }
        }
    } // */

    /**
     * @private
     */
/*
    onRoomAdminMessageEvent(__event, roomJid, userJid, type, msgId) {
        that._logger.log(that.INFO, LOG_ID + " onRoomAdminMessageEvent");

        let conversation = this.getConversationById(roomJid);

        if (conversation && (type === "welcome" || type === "conferenceAdd" || type === "conferenceRemove") && conversation.bubble && conversation.bubble.ownerContact) {
            userJid = conversation.bubble.ownerContact.jid;
        }

        let contact = this._contactsService.getContactByJid(userJid, true);

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

*/
    //endregion EVENTS

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

            that._logger.log(that.INFO, LOG_ID + " Re-initialize conversation service");

            // Remove all my conversation
            for (let variableKey in that.conversations){
                if (that.conversations.hasOwnProperty(variableKey)){
                    delete that.conversations[variableKey];
                }
            }
            that.conversations = {};

            if (that.autoLoadConversations) {
                // bot service is ready / TODO ? service.botServiceReady = true; Fetch
                // conversations from server
                that._rest.getServerConversations(that.conversationsRetrievedFormat).then(function () {
                    // TODO ? service.linkAllActiveCallsToConversations();
                    resolve(undefined);
                })
                    .catch(function () {
                        setInterval(() => {
                            that._logger.log(that.INFO, LOG_ID + " getServerConversations failure, try again");
                            that._rest.getServerConversations(that.conversationsRetrievedFormat).then(function () {
                                // TODO ? that.linkAllActiveCallsToConversations();
                            }).catch(err=>{
                                that._logger.log(that.WARN, LOG_ID + "(reinit) getServerConversations error : ", err);
                            });
                        }, 10000);//, 1, true);

                        resolve(undefined);
                    });
            } else {
                return;
            }

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
                let contact : Contact = await that._contactsService.getContactByJid(obj.jid, false);
                if (contact) {
                    await that.getOrCreateOneToOneConversation(contact.jid, null, obj.lastModification, obj.lastMessageText, obj.missedIMCounter, obj.muted, obj.creationDate);
                    that.waitingBotConversations.splice(index, 1);
                }
            });
            that.waitingBotConversations = [];
        }
    }
}

module.exports.ConversationsService = ConversationsService;
export {ConversationsService as ConversationsService};
