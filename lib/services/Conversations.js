"use strict";

const Error = require("../common/Error");
const Conversation = require("../common/models/Conversation");
const moment = require("moment");

const PubSub = require("pubsub-js");
const ConversationEventHandler = require("../connection/XMPPServiceHandler/conversationEventHandler");
const ConversationHistoryHandler = require("../connection/XMPPServiceHandler/conversationHistoryHandler");

const LOG_ID = "CONVERSATIONS - ";

/**
 * @class
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

                that.pendingMessages = {};
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

    attachHandlers() {
        let that = this;
        that.conversationEventHandler = new ConversationEventHandler(that._xmpp);
        that.conversationHandlerToken = [
            PubSub.subscribe(that.conversationEventHandler.MESSAGE_CHAT, that.conversationEventHandler.onChatMessageReceived),
            PubSub.subscribe(that.conversationEventHandler.MESSAGE_GROUPCHAT, that.conversationEventHandler.onChatMessageReceived),
            PubSub.subscribe(that.conversationEventHandler.MESSAGE_MANAGEMENT, that.conversationEventHandler.onManagementMessageReceived),
            PubSub.subscribe(that.conversationEventHandler.MESSAGE_ERROR, that.conversationEventHandler.onErrorMessageReceived),
            PubSub.subscribe(that.conversationEventHandler.MESSAGE_HEADLINE, that.conversationEventHandler.onHeadlineMessageReceived),
            PubSub.subscribe(that.conversationEventHandler.MESSAGE_CLOSE, that.conversationEventHandler.onCloseMessageReceived)
        ];

        that.conversationHistoryHandler = new ConversationHistoryHandler(that._xmpp, this);
        that.conversationHistoryHandlerToken = [
            PubSub.subscribe(that.conversationHistoryHandler.MESSAGE_MAM, that.conversationHistoryHandler.onMamMessageReceived),
            PubSub.subscribe(that.conversationHistoryHandler.IQ_MAM, that.conversationHistoryHandler.onMamMessageReceived)
        ];
    }

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
                                conversationPromise = that.getRoomConversation(conversationData.jid_im, conversationData.id, conversationData.lastMessageDate, conversationData.lastMessageText, missedImCounter, true, muted, conversationData.creationDate, conversationData.lastMessageSender);
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

    createServerConversation(conversation) {
        let that = this;
        // Ignore already stored existing conversation
        if (conversation.dbId) { return Promise.resolve(conversation); }

        // Prepare global variables
        var data = {};

        // Handle one to one conversation
        if (conversation.type === Conversation.Type.ONE_TO_ONE) {
            // Ignore conversation with user without dbId
            if (!conversation.contact.dbId) { return Promise.resolve(conversation); }

            // Fill conversation request data
            data.peerId = conversation.contact.dbId;
            data.type = "user";
        }

        else if (conversation.type === Conversation.Type.BOT) {
            conversation.type = Conversation.Type.ONE_TO_ONE;

            // Ignore conversation with user without dbId
            if (!conversation.contact.dbId) { return Promise.resolve(conversation); }

            // Fill conversation request data
            data.peerId = conversation.contact.dbId;
            data.type = "bot";
        }

        // Handle room conversation
        else {
            // Fill conversation request data
            data.peerId = conversation.room.dbId;
            data.type = "room";
        }

        if (conversation.room && conversation.room.avatar) {
            var avatarRoom = conversation.room.avatar;
        }

        return this._rest.createServerConversation( data )
        .then((result)=> {
            that
            ._logger
            .log("info", LOG_ID + "[conversationService] createServerConversation success: " + conversation.id);
                conversation.dbId = result.data.id;
                conversation.lastModification = result.data.lastMessageDate ? new Date(result.data.lastMessageDate) : undefined;
                conversation.creationDate = result.data.creationDate ? new Date(result.data.creationDate) : new Date();
                conversation.missedCounter = parseInt(result.data.unreadMessageNumber, 10);
                if (avatarRoom) {
                    conversation.room.avatar = avatarRoom;
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
            else {
                var errorMessage = "deleteServerConversation failure: " + err.errorDetails;
                that
            ._logger
            .log("warn", LOG_ID + "[conversationService] " + errorMessage);
                return Promise.reject(new Error(errorMessage));
            }
        });
    }

    //Update conversation
    updateServerConversation(conversationId, mute) {

        // Ignore conversation without dbId
        if (!conversationId) { return Promise.resolve(); }

        return this._rest.updateServerConversation(conversationId, mute);
    }

    ackAllMessages(conversationDbId) {
        return this._rest.ackAllMessages(conversationDbId);
    }

    getHistoryPage(conversation, size) {
        let that = this;

        return new Promise((resolve, reject) => {

            // Avoid to call several time the same request
            if (conversation.currentHistoryId && conversation.currentHistoryId === conversation.historyIndex) {
                that
                    ._logger
                    .log("debug", LOG_ID + "[conversationServiceHistory] getHistoryPage(" + conversation.id + ", " + size + ", " + conversation.historyIndex + ") already asked");
                return resolve();
            }
            conversation.currentHistoryId = conversation.historyIndex;

            that
                ._logger
                .log("debug", LOG_ID + "[conversationServiceHistory] getHistoryPage(" + conversation.id + ", " + size + ", " + conversation.historyIndex + ")");

            // Create the defered object
            var defered = conversation.historyDefered = Promise;

            // Do nothing for userContact
            if (that._contacts.isUserContact(conversation.contact)) {
                defered.reject();
                return defered;
            }

            if (conversation.historyComplete) {
                that
                    ._logger
                    .log("debug", LOG_ID + "[conversationService] getHistoryPage(" + conversation.id + ") : already complete");
                defered.reject();
                return defered;
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
            if (conversation.room) {
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
                    .mamQueryMuc(conversation.id, conversation.room.jid, mamRequest);
            } else {
                // Request for history messages for the conversation
                that
                    ._xmpp
                    .mamQuery(conversation.id, mamRequest);
            }

        });
    }

    /**
     * GET OR CREATE A CONVERSATION
     * Used by SDK (public)
     * Warning when modifying this method
     */
    getOrCreateOneToOneConversation(conversationId, conversationDbId, lastModification, lastMessageText, missedIMCounter, muted, creationDate) {
        let that = this;
        return new Promise((resolve, reject) => {
            that
                ._logger
                .log("info", LOG_ID + "[conversationService] getOrCreateOneToOneConversation " + conversationId + " " + conversationDbId + " " + missedIMCounter);

            // Fetch the conversation
            var conv = that.getConversationById(conversationId);
            if (conv) {
                conv.preload = true;
                return resolve(conv);
            }

            // No conversation found, then create it
            that
                ._contacts
                .getOrCreateContact(conversationId)
                // Get or create the conversation
                .then( (contact) => {
                    var conversation = Conversation.createOneToOneConversation(contact);
                    conversation.lastModification = lastModification
                        ? new Date(lastModification)
                        : undefined;
                    conversation.lastMessageText = lastMessageText;
                    conversation.muted = muted;
                    conversation.creationDate = creationDate
                        ? new Date(creationDate)
                        : new Date();
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

    getRoomConversation(roomJid, conversationDbId, lastModification, lastMessageText, missedIMCounter, noError, muted, creationDate, lastMessageSender) {
        let that = this;

        that
            ._logger
            .log("info", LOG_ID + "[conversationService] getRoomConversation " + roomJid);

        // Fetch the conversation
        var conversation = that.getConversationById(roomJid);
        if (conversation) {
            conversation.preload = true;
            return Promise.resolve(conversation);
        }

        // No conversation found, then create it
        return new Promise((resolve, reject) => {

            // Get the associated room
            var room = that._bubbles.getBubbleByJid(roomJid);
            if (!room) {
                that
                    ._logger
                    .log("error", LOG_ID + "[conversationService] getRoomConversation (" + roomJid + ") failure : no such room");

                var obj = {
                    jid: roomJid,
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
                conversation = Conversation.createRoomConversation(room);
                conversation.dbId = conversationDbId;
                conversation.lastModification = lastModification
                    ? new Date(lastModification)
                    : undefined;
                conversation.lastMessageText = lastMessageText;
                conversation.muted = muted;
                conversation.creationDate = creationDate
                    ? new Date(creationDate)
                    : new Date();
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
                            if (room) {
                                roomService.sendInitialRoomPresence(room);
                            }
                            // Send conversations update event
                            that._eventEmitter.emit("rainbow_onconversationupdated", __conversation);
                            resolve(__conversation);
                        })
                        .catch(function (error) {
                            var errorMessage = "getRoomConversation (" + roomJid + ") failure : " + error.message;
                            that
                                ._logger
                                .log.error("[conversationService] " + errorMessage);
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

    getRoomConferences(conversation) {
        let that = this;

        return new Promise((resolve) => {
            var confEndpoints = conversation.room.confEndpoints;
            if (confEndpoints) {
                confEndpoints.forEach(function(confEndpoint) {
                    if (confEndpoint.mediaType === "pstnAudio") {
                        var conferenceSession = pstnConferenceService.getConferenceSessionById(confEndpoint.confEndpointId);
                        if (conferenceSession) {
                            conversation.pstnConferenceSession = conferenceSession;
                        }
                    }
                });
            }
            resolve();
        });
    };
    
    updateRoomConferences() {
        let that = this;

        var conversations = that.getConversations();
        conversations.forEach(function(conversation) {
            if (conversation.room && conversation.room.confEndpoints) {
                var conferenceSession = pstnConferenceService.getConferenceSessionById(conversation.room.getPstnConfEndpointId());
                if (conferenceSession) {
                    conversation.pstnConferenceSession = conferenceSession;
                } else {
                    conversation.pstnConferenceSession = null;
                }
            } else {
                // A room conversation without confEndpoint should not have a conferenceSession attached
                conversation.pstnConferenceSession = null;
            }
        });
    };


    /*********************************************************/
    /**                   MESSAGES STUFF                    **/
    /*********************************************************/

    /**
     * SEND FS MESSAGE
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
     * SEND Existing FS MESSAGE (with File already shared)
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
     * SEND CHAT MESSAGE
     * Used by SDK (public)
     * Warning when modifying this method
     */
    sendChatMessage(conversation, data) {
        let message = conversation.sendChatMessage(data);
        this.pendingMessages[message.id] = {
            conversation: conversation,
            message: message
        };
        return message;
    }

    removeAllMessages(conversation) {
        let that = this;
        return new Promise((resolve, reject) => {
            that
                ._logger
                .log("info", LOG_ID + "[conversationService] removeAllMessage " + conversation.id);

            var mamRequest = {
                "deleteid": "remove_" + conversation.id,
                "with": conversation.id,
                "before": moment()
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
     * CLOSE CONVERSATION
     * Used by SDK (public)
     * Warning when modifying this method
     */
    closeConversation(conversation) {
        let that = this;
        return new Promise((resolve, reject) => {
            that
                ._logger
                .log("info", LOG_ID + "[conversationService] closeConversation " + conversation.id);

            // Remove this contact from favorite group
            this
                .deleteServerConversation(conversation.dbId)
                .then(() => {
                    that.removeConversation(conversation);
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    /**
     * GET CONVERSATION BY ID
     * Used by SDK (public)
     * Warning when modifying this method
     */
    getConversationById(conversationId) {
        if (!this.conversations) {
            return null;
        }
        return this.conversations[conversationId];
    }

    /**
     * GET CONVERSATION BY ROOM ID
     * Used by SDK (public)
     * Warning when modifying this method
     */
    getConversationByRoomDbId(roomDbId) {
        if (this.conversations) {
            for (var key in this.conversations) {
                if (this.conversations.hasOwnProperty(key) && this.conversations[key].room && this.conversations[key].room.dbId === roomDbId) {
                    return this.conversations[key];
                }
            }
        }
        return null;
    }

    /**
     * GET ALL CONVERSATIONS
     * Used by SDK (public)
     * Warning when modifying this method
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

    onRoomChangedEvent(__event, room, action) {
        if (room) {
            var conversation = this.getConversationById(room.jid);
            if (conversation) {
                if (action === "remove") {
                    this.closeConversation(conversation);
                } else {
                    conversation.room = room;
                }
            }
        }
    }

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

    onRoomAdminMessageEvent(__event, roomJid, userJid, type, msgId) {
        this
            ._logger
            .log("info", LOG_ID + "[conversationService] onRoomAdminMessageEvent");

        var conversation = this.getConversationById(roomJid);

        if (conversation && (type === "welcome" || type === "conferenceAdd" || type === "conferenceRemove") && conversation.room && conversation.room.ownerContact) {
            userJid = conversation.room.ownerContact.jid;
        }

        var contact = this
            ._contacts
            .getContactByJid(userJid);

        if (conversation && contact) {
            // If invitation msg and I'm not the owner
            if (!conversation.room.owner && type === "invitation") {
                return;
            }
            if (conversation.room && conversation.room.isMeetingRoom()) {
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
					var contact = contactService.getContactByJid(obj.jid);
					if (contact) {
						that.getOrCreateOneToOneConversation(contact.jid, null, obj.lastModification, obj.lastMessageText, obj.missedIMCounter, obj.muted, obj.creationDate);
						that.waitingBotConversations.splice(index, 1);
					}
				});
				that.waitingBotConversations = [];
			}
		};
}

module.exports = Conversations;