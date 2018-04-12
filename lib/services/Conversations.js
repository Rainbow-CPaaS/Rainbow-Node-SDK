"use strict";

const ErrorCase = require("../common/Error");
const Conversation = require("../common/models/Conversation");
const Call = require("../common/models/Call");

const moment = require("moment");

const Deferred = require("../common/Utils").Deferred;

const PubSub = require("pubsub-js");
const ConversationEventHandler = require("../connection/XMPPServiceHandler/conversationEventHandler");
const ConversationHistoryHandler = require("../connection/XMPPServiceHandler/conversationHistoryHandler");

const LOG_ID = "CONVERSATIONS - ";

/**
 * @class
 * @beta
 * @name Conversations
 * @description
 *       This module manages conversations. A contact is defined by a set of public information (name, firstname, avatar...) and a set of private information.<br>
 *       Using this module, you can get access to your network contacts or search for Rainbow contacts.
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Get the network contacts (roster) <br>
 *      - Get and search contacts by Id, JID or loginEmail <br>
 */
class Conversations {

    constructor(_eventEmitter, _logger) {
        this._xmpp = null;
        this._rest = null;
        this._contacts = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
    }

    start(_xmpp, _rest, _contacts, _bubbles) {
        let that = this;
        this.conversationHandlerToken = [];
        this.conversationHistoryHandlerToken= [];
        this
            ._logger
            .log("debug", LOG_ID + "(start) _entering_");

        return new Promise((resolve, reject) => {
            try {
                that._xmpp = _xmpp;
                that._rest = _rest;
                that._contacts = _contacts;
                that._bubbles = _bubbles;

                that.activeConversation = null;
                that.conversations = [];

                that.inCallConversations = [];
                that.idleConversations = [];
                that.involvedContactIds = [];
                that.involvedRoomIds = [];

                //all conversations with Bots
                that.waitingBotConversations = [];
                that.botServiceReady = false;

                that._attachHandlers();

                this
                    ._logger
                    .log("debug", LOG_ID + "(start) _exiting_");
                resolve();

            } catch (err) {
                that
                    ._logger
                    .log("error", LOG_ID + "(start) _exiting_");
                reject();
            }
        });
    }

    stop() {
        let that = this;
        this
            ._logger
            .log("debug", LOG_ID + "(stop) _entering_");

        return new Promise((resolve) => {
            try {
                that._xmpp = null;
                that._rest = null;

                delete that.conversationEventHandler;
                that.conversationEventHandler = null;
                that
                    .conversationHandlerToken
                    .forEach((token) => PubSub.unsubscribe(token));
                that.conversationHandlerToken = [];

                that
                    .conversationHistoryHandlerToken
                    .forEach((token) => PubSub.unsubscribe(token));
                that.conversationHistoryHandlerToken = [];

                that
                    ._logger
                    .log("debug", LOG_ID + "(stop) _exiting_");
                resolve();
            } catch (err) {
                that
                    ._logger
                    .log("debug", LOG_ID + "(stop) _exiting_");
                reject(err);
            }
        });
    }

    _attachHandlers() {
        let that = this;
        that.conversationEventHandler = new ConversationEventHandler(that._xmpp, that);
        that.conversationHandlerToken = [
            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_CHAT, that.conversationEventHandler.onChatMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_GROUPCHAT, that.conversationEventHandler.onChatMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_WEBRTC, that.conversationEventHandler.onWebRTCMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_MANAGEMENT, that.conversationEventHandler.onManagementMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_ERROR, that.conversationEventHandler.onErrorMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_HEADLINE, that.conversationEventHandler.onHeadlineMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_CLOSE, that.conversationEventHandler.onCloseMessageReceived)
        ];

        that.conversationHistoryHandler = new ConversationHistoryHandler(that._xmpp, this);
        that.conversationHistoryHandlerToken = [
            PubSub.subscribe( that._xmpp.hash + "." + that.conversationHistoryHandler.MESSAGE_MAM, that.conversationHistoryHandler.onMamMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that.conversationHistoryHandler.FIN_MAM, that.conversationHistoryHandler.onMamMessageReceived)
        ];
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

        return new Promise((resolve, reject) => {
            that
                ._rest
                .getServerConversations()
                .then((conversations) => {
                    // Create conversation promises
                    var conversationPromises = [];
                    conversations
                        .forEach(function (conversationData) {
                            var missedImCounter = parseInt(conversationData.unreadMessageNumber, 10);
                            var conversationPromise = null;
                            var muted = (conversationData.mute === true);

                            if (conversationData.type === "user") {
                                conversationPromise = that.getOrCreateOneToOneConversation(conversationData.jid_im, conversationData.id, conversationData.lastMessageDate, conversationData.lastMessageText, missedImCounter, muted, conversationData.creationDate);
                            } else {
                                conversationPromise = that.getBubbleConversation(conversationData.jid_im, conversationData.id, conversationData.lastMessageDate, conversationData.lastMessageText, missedImCounter, true, muted, conversationData.creationDate, conversationData.lastMessageSender);
                            }
                            conversationPromises.push(conversationPromise);
                        });

                    // Resolve all promises
                    Promise
                        .all(conversationPromises)
                        // .then(() => {
                        //     return that.removeOlderConversations();
                        // })
                        .then(() => {
                            //that.orderConversations();
                            resolve();
                        })
                        .catch((error) => {
                            var errorMessage = "getServerConversations failure: " + error.message;
                            that
                                ._logger
                                .log("error", LOG_ID + "[conversationService] " + errorMessage);
                            reject(new Error(errorMessage));
                        });
                })
                .catch((err) => {
                    var errorMessage = "getServerConversations failure: no server response";

                    if (err) {
                        errorMessage = "getServerConversations failure: " + JSON.stringify(err);
                    }

                    that
                        ._logger
                        .log("error", LOG_ID + "[conversationService] " + errorMessage);
                    reject(new Error(errorMessage));
                });
        });
    }

    /**
     * @private
     * @method
     * @instance
     * @description
     *    Allow to create a conversations on server (p2p and bubbles)
     * @param {String} ID of the conversation (dbId field)
     * @return {Conversation} Created conversation object
     */
    createServerConversation(conversation) {
        let that = this;
        // Ignore already stored existing conversation
        if (conversation.dbId) { return Promise.resolve(conversation); }

        // Prepare global variables
        var data = {};

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
            var avatarRoom = conversation.bubble.avatar;
        }

        return this._rest.createServerConversation( data )
        .then((result)=> {
            that
            ._logger
            .log("info", LOG_ID + "[conversationService] createServerConversation success: " + conversation.id);
                conversation.dbId = result.id;
                conversation.lastModification = result.lastMessageDate ? new Date(result.lastMessageDate) : undefined;
                conversation.creationDate = result.creationDate ? new Date(result.creationDate) : new Date();
                conversation.missedCounter = parseInt(result.unreadMessageNumber, 10);
                if (avatarRoom) {
                    conversation.bubble.avatar = avatarRoom;
                }
                // TODO ? that.orderConversations();
                return Promise.resolve(conversation);
        }).catch( (err) => {
            var errorMessage = "createServerConversation failure: " + err.errorDetails;
            that
            ._logger
            .log("error", LOG_ID + "[conversationService] " + errorMessage);
                return Promise.reject(new Error(errorMessage));
        });
    }

    /**
     * @private
     * @method
     * @instance
     * @description
     *    Allow to create a conversations on server (p2p and bubbles)
     * @param {String} ID of the conversation (dbId field)
     * @return {Promise}
     */
    deleteServerConversation(conversationId) {
        let that = this;

        // Ignore conversation without dbId
        if (!conversationId) { return Promise.resolve(); }

        return that._rest.deleteServerConversation(conversationId).then( (result ) => {
            // TODO ? that.orderConversations();
            return Promise.resolve();
        }).catch( (err) => {
            // Check particular case where we are trying to remove an already removed conversation
            if (err.errorDetailsCode === 404002) {
                that
            ._logger
            .log("info", LOG_ID + "[conversationService] deleteServerConversation success: " + conversationId);
                return Promise.resolve();
            }
            
            let errorMessage = "deleteServerConversation failure: " + err.errorDetails;
            that
                ._logger
                .log("warn", LOG_ID + "[conversationService] " + errorMessage);
            return Promise.reject(new Error(errorMessage));
       
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
     * @beta
     * @method
     * @instance
     * @description
     *    Allow to get the specified conversation as mail attachment to the login email of the current user (p2p and bubbles)
     *    can be used to backup a conversation between a rainbow user and another one, or between a user and a room,
     *    The backup of the conversation is restricted to a number of days before now. By default the limit is 30 days.
     * @param {String} ID of the conversation (dbId field)
     * @return {Conversation[]} An array of Conversation object
     */
    sendConversationByEmail(conversationDbId) {
        return this._rest.sendConversationByEmail(conversationDbId);
    }

    /**
     * @public
     * @beta
     * @method
     * @instance
     * @description
     *    Mark all unread messages in the conversation as read.
     * @param {String} ID of the conversation (dbId field)
     * @return {Conversation[]} An array of Conversation object
     */
    ackAllMessages(conversationDbId) {
        return this._rest.ackAllMessages(conversationDbId);
    }

    /**
     * @public
     * @beta
     * @method
     * @instance
     * @description
     *    Retrieve the remote history of a specific conversation.
     * @param {Conversation} conversation Conversation to retrieve
     * @param {number} size Maximum number of element to retrieve
     * @return {Conversation[]} A Promise of an array of Conversation object
     */
    getHistoryPage(conversation, size) {
        let that = this;

        // Avoid to call several time the same request
        if (conversation.currentHistoryId && conversation.currentHistoryId === conversation.historyIndex) {
            that
                ._logger
                .log("debug", LOG_ID + "[conversationServiceHistory] getHistoryPage(" + conversation.id + ", " + size + ", " + conversation.historyIndex + ") already asked");
            return Promise.resolve();
        }
        conversation.currentHistoryId = conversation.historyIndex;

        that
            ._logger
            .log("debug", LOG_ID + "[conversationServiceHistory] getHistoryPage(" + conversation.id + ", " + size + ", " + conversation.historyIndex + ")");

        // Create the defered object
        var defered = conversation.historyDefered = new Deferred();

        // Do nothing for userContact
        if (that._contacts.isUserContact(conversation.contact)) {
            defered.reject();
            return defered.promise;
        }

        if (conversation.historyComplete) {
            that
                ._logger
                .log("debug", LOG_ID + "[conversationService] getHistoryPage(" + conversation.id + ") : already complete");
            defered.reject();
            return defered.promise;
        }

        var mamRequest = {
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

            that
                ._xmpp
                .mamQueryMuc(conversation.id, conversation.bubble.jid, mamRequest);
        } else {
            // Request for history messages for the conversation
            that
                ._xmpp
                .mamQuery(conversation.id, mamRequest);
        }

        return defered.promise;
    }

    /**
     * @private
     * @beta
     * @method
     * @instance
     */
    getOrCreateOneToOneConversation(conversationId, conversationDbId, lastModification, lastMessageText, missedIMCounter, muted, creationDate) {
        let that = this;
        return new Promise((resolve, reject) => {
            
            // Fetch the conversation
            var conv = that.getConversationById(conversationId);
            if (conv) {
                conv.preload = true;
                return resolve(conv);
            }

            that
                ._logger
                .log("info", LOG_ID + "[conversationService] getOrCreateOneToOneConversation " + conversationId + " " + conversationDbId + " " + missedIMCounter);


            // No conversation found, then create it
            that
                ._contacts
                .getOrCreateContact(conversationId)
                // Get or create the conversation
                .then( (contact) => {
                    that._logger.log("info", LOG_ID + "[Conversation] Create one to one conversation (" + contact.id + ")");

                    var conversation = Conversation.createOneToOneConversation(contact);
                    conversation.lastModification = lastModification ?
                        new Date(lastModification) :
                        undefined;
                    conversation.lastMessageText = lastMessageText;
                    conversation.muted = muted;
                    conversation.creationDate = creationDate ?
                        new Date(creationDate) :
                        new Date();
                    conversation.preload = false;
                    // TODO ? that.computeCapabilitiesForContact(contact);
                    conversation.dbId = conversationDbId;
                    if (missedIMCounter) {
                        conversation.missedCounter = missedIMCounter;
                    }
                    that.conversations[contact.jid_im] = conversation;
                    return that.createServerConversation(conversation);
                })
                .then( (conversation) => {
                    // TODO ? $rootScope.$broadcast("ON_CONVERSATIONS_UPDATED_EVENT", conversation);
                    resolve(conversation);
                })
                .catch( (error) => {
                    var errorMessage = "getOrCreateOneToOneConversation " + conversationId + " failure " + error.message;
                    that
                        ._logger
                        .log("error", LOG_ID + "[conversationService] " + errorMessage);

                    resolve(new Error(errorMessage));
                });
        });
    }

    /**
     * @public
     * @method
     * @instance
     * @description
     *    Get a conversation associated to a bubble (using the bubble ID to retrieve it)
     * @param {String} strBubbleId ID of the bubble (dbId field)
     * @return {Conversation} A conversation object or null if not found
     */
    getBubbleConversation(bubbleJid, conversationDbId, lastModification, lastMessageText, missedIMCounter, noError, muted, creationDate, lastMessageSender) {
        let that = this;

        that
            ._logger
            .log("info", LOG_ID + "[conversationService] getBubbleConversation " + bubbleJid);

        // Fetch the conversation
        var conversation = that.getConversationById(bubbleJid);
        if (conversation) {
            conversation.preload = true;
            return Promise.resolve(conversation);
        }

        // No conversation found, then create it
        return new Promise((resolve, reject) => {

            // Get the associated bubble
            var bubble = that._bubbles.getBubbleByJid(bubbleJid);
            if (!bubble) {
                that
                    ._logger
                    .log("error", LOG_ID + "[conversationService] getBubbleConversation (" + bubbleJid + ") failure : no such bubble");

                var obj = {
                    jid: bubbleJid,
                    conversationDbId: conversationDbId,
                    lastModification: lastModification,
                    lastMessageText: lastMessageText,
                    missedIMCounter: missedIMCounter,
                    muted: muted,
                    creationDate: creationDate
                };

                that
                    .waitingBotConversations
                    .push(obj);
                that.unlockWaitingBotConversations();
                resolve();
            } else {
                that
                    ._logger
                    .log("info", LOG_ID + "[Conversation] Create bubble conversation (" + bubble.jid + ")");

                conversation = Conversation.createBubbleConversation(bubble);
                conversation.dbId = conversationDbId;
                conversation.lastModification = lastModification ?
                    new Date(lastModification) :
                    undefined;
                conversation.lastMessageText = lastMessageText;
                conversation.muted = muted;
                conversation.creationDate = creationDate ?
                    new Date(creationDate) :
                    new Date();
                conversation.preload = false;
                conversation.lastMessageSender = lastMessageSender;
                if (missedIMCounter) {
                    conversation.missedCounter = missedIMCounter;
                }
                that.conversations[conversation.id] = conversation;

                if (conversationDbId) {
                    that
                        .getRoomConferences(conversation)
                        .then(function () {
                            that._eventEmitter.emit("rainbow_onconversationupdated", conversation);
                            resolve(conversation);
                        } // Create server side if necessary
                        );
                } else {
                    that
                        .createServerConversation(conversation)
                        .then(function (__conversation) {
                            if (bubble) {
                                that._bubbles._sendInitialBubblePresence(bubble);
                            }
                            // Send conversations update event
                            that._eventEmitter.emit("rainbow_onconversationupdated", __conversation);
                            resolve(__conversation);
                        })
                        .catch(function (error) {
                            var errorMessage = "getBubbleConversation (" + bubbleJid + ") failure : " + error.message;
                            that
                                ._logger
                                .log("error", LOG_ID + "[conversationService] " + errorMessage);
                            that.deleteServerConversation(conversationDbId);
                            if (noError) {
                                resolve();
                            } else {
                                reject(new Error(errorMessage));
                            }
                        });
                }
            }

        });
    }

    /**
     * @private
     * @beta
     * @method
     * @instance
     * @description
     * Get a pstn conference
     */
    getRoomConferences(conversation) {
        let that = this;

        return new Promise((resolve) => {
            var confEndpoints = conversation.bubble.confEndpoints;
            if (confEndpoints) {
                confEndpoints.forEach(function(confEndpoint) {
                    if (confEndpoint.mediaType === "pstnAudio") {
                        // TODO later
                        // var conferenceSession = pstnConferenceService.getConferenceSessionById(confEndpoint.confEndpointId);
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
     * @beta
     * @method
     * @instance
     * @description
     * Update a pstn conference
     */
    updateRoomConferences() {
        let that = this;

        var conversations = that.getConversations();
        conversations.forEach(function(conversation) {
            if (conversation.bubble && conversation.bubble.confEndpoints) {
                // TODO Later
                // var conferenceSession = pstnConferenceService.getConferenceSessionById(conversation.bubble.getPstnConfEndpointId());
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
     * @beta
     * @method
     * @instance
     * @description
     *    Close a conversation <br/>
     *    This method returns a promise
     * @param {Conversation} conversation The conversation to close
     */
    closeConversation(conversation) {
        let that = this;
        return new Promise((resolve, reject) => {
            that
                ._logger
                .log("info", LOG_ID + "[conversationService] closeConversation " + conversation.id);

            // Remove this contact from favorite group
            that
                .deleteServerConversation(conversation.dbId)
                .then( () => {
                    that.removeConversation(conversation);
                    resolve();
                })
                .catch( (error) => {
                    reject(error);
                });
        });
    }

    /**
     * @private
     * @beta
     * @method
     * @instance
     * @description
     *    Remove locally a conversation <br/>
     *    This method returns a promise
     * @param {Conversation} conversation The conversation to remove
     */
    removeConversation(conversation) {
        let that = this;
        that
            ._logger
            .log("info", LOG_ID + "[conversationService] remove conversation " + conversation.id);

        if (conversation.videoCall && conversation.videoCall.status !== Call.Status.UNKNOWN) {
            that
            ._logger
            .log("info", LOG_ID + "[conversationService] Ignore conversation deletion message for conversation" + conversation.id);
            return;
        }

        delete that.conversations[conversation.id];
       /* that.orderConversations();
        var conversations = that.getOrderedConversations();

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

        that._eventEmitter.emit("rainbow_onconversationremoved", { "conversationId": conversation.id});

        //conversation = null;
    }


    /*********************************************************/
    /**                   MESSAGES STUFF                    **/
    /*********************************************************/

    /**
     * @private
     * @beta
     * @method
     * @instance
     * @description
     *   Send an file sharing message
     */
    sendFSMessage(conversation, file, data) {
        let message = conversation.sendFSMessage(file, data);
        this.pendingMessages[message.id] = {
            conversation: conversation,
            message: message
        };
        return message;
    }

    /**
     * @private
     * @beta
     * @method
     * @instance
     * @description
     *   Send an existing file sharing message
     */
    sendEFSMessage(conversation, fileDescriptor, data) {
        let message = conversation.sendEFSMessage(fileDescriptor, data);
        this.pendingMessages[message.id] = {
            conversation: conversation,
            message: message
        };
        return message;
    }

    /**
     * @private
     * @beta
     * @method
     * @instance
     * @description
     *    Send a instant message to a conversation
     *    This method works for sending messages to a one-to-one conversation or to a bubble conversation<br/>
     * @param {Conversation} conversation The conversation to clean
     * @param {String} data Test message to send
     */
    sendChatMessage(conversation, data) {
        let message = conversation.sendChatMessage(data);
        this.pendingMessages[message.id] = {
            conversation: conversation,
            message: message
        };
        return message;
    }

    /**
     * @public
     * @beta
     * @method
     * @instance
     * @description
     *    Cleanup a conversation by removing all previous messages<br/>
     *    This method returns a promise
     * @param {Conversation} conversation The conversation to clean
     */
    removeAllMessages(conversation) {
        let that = this;
        return new Promise((resolve, reject) => {
            that
                ._logger
                .log("info", LOG_ID + "[conversationService] removeAllMessage " + conversation.id);

            var mamRequest = {
                "deleteid": "remove_" + conversation.id,
                "with": conversation.id,
                "before": moment().add(1, 'minutes')
                    .utc()
                    .format("YYYY-MM-DDTHH:mm:ss") + "Z",
                "onComplete": function () {
                    // FIXME : handle error message (ask Andreï)
                    resolve();
                }
            };

            // Request for history messages
            that
                ._xmpp
                .mamDelete(conversation.id, mamRequest);
        });
    }

    /**
     * @public
     * @beta
     * @method
     * @instance
     * @description
     *    Remove a specific range of message in a conversation<br/>
     *    This method returns a promise
     * @param {Conversation} conversation The conversation to clean
     */
    removeMessagesFromConversation(conversation, date, number) {
        let that = this;
        return new Promise((resolve, reject) => {
            that
                ._logger
                .log("info", LOG_ID + "[conversationService] removeMessagesFromConversation " + conversation.id);
            that
                ._logger
                .log("info", LOG_ID + "[conversationService] removing " + number + " messages after " + date);

            var mamRequest = {
                "deleteid": "remove_" + conversation.id,
                "with": conversation.id,
                "start": moment(date).format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ"),
                "max": number,
                "onComplete": () => {
                    that
                        ._logger
                        .log("info", LOG_ID + "[conversationService] MAM Message deleted !!!");
                    resolve();
                }
            };

            // Request for history messages
            that
                ._xmpp
                .mamDelete(conversation.id, mamRequest);
        });
    }

    /**
     * @public
     * @beta
     * @method
     * @instance
     * @description
     *      Get a p2p conversation by id
     * @param {String} conversationId Conversation id of the conversation to clean
     * @return {Conversation} The conversation to retrieve
     */
    getConversationById(conversationId) {
        if (!this.conversations) {
            return null;
        }
        return this.conversations[conversationId];
    }

    /**
     * @private
     * @beta
     * @method
     * @instance
     * @description
     *      Get a bubble conversation by bubble id
     * @param {String} bubbleId Bubble id if the conversation to retrieve
     * @return {Conversation} The conversation to retrieve
     */
    getConversationByBubbleId(bubbleId) {
        if (this.conversations) {
            for (var key in this.conversations) {
                if (this.conversations.hasOwnProperty(key) && this.conversations[key].bubble && this.conversations[key].bubble.id === bubbleId) {
                    return this.conversations[key];
                }
            }
        }
        return null;
    }

    /**
     * @private
     * @beta
     * @method
     * @instance
     * @description
     *      Get all conversation
     * @return {Conversation[]} The conversation list to retrieve
     */
    getConversations() {
        let conversationArray = [];
        for (var key in this.conversations) {
            if (this.conversations.hasOwnProperty(key)) {
                conversationArray.push(this.conversations[key]);
            }
        }
        return conversationArray;
    }

    /**
     * @private
     */
    onRoomChangedEvent(__event, bubble, action) {
        if (bubble) {
            var conversation = this.getConversationById(bubble.jid);
            if (conversation) {
                if (action === "remove") {
                    this.closeConversation(conversation);
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
            var conversation = this.getConversationById(room.jid);
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
        this
            ._logger
            .log("info", LOG_ID + "[conversationService] onRoomAdminMessageEvent");

        var conversation = this.getConversationById(roomJid);

        if (conversation && (type === "welcome" || type === "conferenceAdd" || type === "conferenceRemove") && conversation.bubble && conversation.bubble.ownerContact) {
            userJid = conversation.bubble.ownerContact.jid;
        }

        var contact = this
            ._contacts
            .getContactByJid(userJid);

        if (conversation && contact) {
            // If invitation msg and I'm not the owner
            if (!conversation.bubble.owner && type === "invitation") {
                return;
            }
            if (conversation.bubble && conversation.bubble.isMeetingBubble()) {
                return;
            }
            this
                .conversationServiceEventHandler
                .onRoomAdminMessageReceived(conversation, contact, type, msgId);
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
        return new Promise((resolve, reject) => {

            that
                ._logger
                .log("info", LOG_ID + "[conversationService] Re-initialize conversation service");

            // Remove all my conversation
            delete that.conversations;
            that.conversations = [];

            // bot service is ready / TODO ? service.botServiceReady = true; Fetch
            // conversations from server
            that
                ._rest
                .getServerConversations()
                .then(function () {
                    // TODO ? service.linkAllActiveCallsToConversations();
                    resolve();
                })
                .catch(function () {
                    setInterval(() => {
                        that
                            ._logger
                            .log("info", LOG_ID + "[conversationService] getServerConversations failure, try again");
                        that
                            ._rest
                            .getServerConversations()
                            .then(function () {
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
    unlockWaitingBotConversations (isBotServiceReady) {
        let that = this;

        if (isBotServiceReady) {
            that.botServiceReady = true;
        }
        if (that.botServiceReady) {
            //stop infinite loop in case of error
            that.botServiceReady = false;
            that.waitingBotConversations.forEach(function(obj, index) {
                var contact = that._contacts.getContactByJid(obj.jid);
                if (contact) {
                    that.getOrCreateOneToOneConversation(contact.jid, null, obj.lastModification, obj.lastMessageText, obj.missedIMCounter, obj.muted, obj.creationDate);
                    that.waitingBotConversations.splice(index, 1);
                }
            });
            that.waitingBotConversations = [];
        }
    }
}

module.exports = Conversations;