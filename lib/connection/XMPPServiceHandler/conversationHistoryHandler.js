"use strict";

const moment = require("moment");
var momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);

const XMPPUtils = require("../../common/XMPPUtils");
const GenericHandler = require("./genericHandler");
const xml = require("@xmpp/xml");
const Message = require("../../common/models/Message");

const LOG_ID = "XMPP/HNDL - ";

class ConversationHistoryHandler  extends GenericHandler {

    constructor(xmppService, conversationService) {
        super( xmppService);

        this.MESSAGE_MAM = "urn:xmpp:mam:1.result";
        this.FIN_MAM = "urn:xmpp:mam:1.fin";

        this.conversationService = conversationService;

        let that = this;

        this.onMamMessageReceived = function(msg, stanza) {
			try {
                // Get queryId and deleteId
                let queryId = stanza.getChild("result") ? stanza.getChild("result").getAttr("queryid") : null;
				if (!queryId) {
					queryId = stanza.getChild("fin") ? stanza.getChild("fin").getAttr("queryid") : null;
				}

				// jidTel are used for callLog
				if (queryId && queryId.indexOf("tel_") !== 0 && that.onHistoryMessageReceived) {
					that.onHistoryMessageReceived(msg, stanza);
				}

				// jidIm are used for history
				else if (that.callLogHandler) {
					that.callLogHandler(stanza);
				}

				return true;
			} catch (error) {
				return true;
			}

		};

        this.onHistoryMessageReceived = (msg, stanza) => {
            // Handle response
            try {
                var conversation = null;

                var queryId = stanza.getChild("result") ? stanza.getChild("result").getAttr("queryid") : null;
                if (queryId) {

                    // Get associated conversation
                    conversation = this.conversationService.getConversationById(queryId);
                    if (conversation) {

                        // Extract info
                        let stanzaForwarded = stanza.getChild("result").getChild("forwarded");
                        let stanzaMessage = stanzaForwarded.getChild("message");

                        if (stanzaMessage.getChild("call_log")) {
                            return this.onWebrtcHistoryMessageReceived(stanza, conversation);
                        }

                        var brutJid = stanzaMessage.getAttr("from");

                        // Extract fromJid
                        var fromJid;
                        var roomEvent = false;
                        if (brutJid.indexOf("room_") === 0) { fromJid = brutJid.split("/")[1]; }
                        else { fromJid = XMPPUtils.getBareJIDFromFullJID(brutJid); }

                        if (!fromJid && stanzaMessage.getChild("event")) {
                            roomEvent = stanzaMessage.getChild("event").attr("name");
                            fromJid = stanzaMessage.getChild("event").attr("jid");

                            if (roomEvent === "welcome" && conversation.bubble && conversation.bubble.creator) {
                                let ownerContact = conversation.bubble.users.find( (user) => conversation.bubble.creator === user.userId )
                                fromJid = ownerContact ? ownerContact.jid_im : "";
                            }
                        }

                        if (!fromJid) {
                            that.logger.log("warn", LOG_ID + "[conversationService] onHistoryMessageReceived - Receive message without valid fromJid information");
                            return true;
                        }

                        if ( !conversation.pendingPromise ) {
                            conversation.pendingPromise = [];
                        }
                        
                        let promise = new Promise( (resolve) => {
                            conversationService._contacts.getContactByJid(fromJid)
                                .then( (from) => {
                                    resolve(from);
                                }).catch( () => {
                                    resolve(null);
                                });
                        }).then( (from) => {
                                var type = stanzaMessage.getAttr("type");
                                var messageId = stanzaMessage.getAttr("id");
                                var date = new Date(stanzaForwarded.getChild("delay").getAttr("stamp"));
                                var body = stanzaMessage.getChild("body").text();
                                var ack = stanzaMessage.getChild("ack");
                                var oob = stanzaMessage.getChild("x", "jabber:x:oob");
                                var conference = stanzaMessage.getChild("x", "jabber:x:audioconference");
                                var content = stanzaMessage.getChild("content", "urn:xmpp:content");

                                if (!from) {
                                    that.logger.log("warn", LOG_ID + "[Conversation] onHistoryMessageReceived missing contact for jid : " + fromJid + ", ignore message");
                                    //create basic contact
                                    from = that.conversationService._contacts.createEmptyContactContact(fromJid);
                                }

                                if (roomEvent) {
                                    that.logger.log("info", LOG_ID + "[Conversation] (" + conversation.id + ") add Room admin event message " + roomEvent);
                                    type = "admin";

                                    // Ignore meeting events
                                    if (conversation.bubble && conversation.bubble.isMeetingBubble()) {
                                        if (roomEvent === "welcome" ||
                                            roomEvent === "conferenceAdd" ||
                                            roomEvent === "conferenceRemove" ||
                                            roomEvent === "invitation") {
                                            return true;
                                        }
                                    }

                                    if ((roomEvent === "conferenceAdd" || roomEvent === "conferenceRemove") && conversation.bubble && conversation.bubble.creator) {
                                        let ownerContact = conversation.bubble.users.find( (user) => conversation.bubble.creator === user.userId )
                                        from = ownerContact;
                                    }
                                }

                                let message = conversation.getMessageById(messageId);
                                if (!message) { message = conversation.historyMessages.find((item) => { return item.id === messageId; }); }
                                if (message) {
                                    that.logger.log("info", LOG_ID + "[Conversation] (" + conversation.id + ") try to add an already stored message with id " + message.id);
                                }
                                else {
                                    // Create new message 
                                    var side = that.conversationService._contacts.isUserContact(from) ? Message.Side.RIGHT : Message.Side.LEFT;
                                    switch (type) {
                                        case "webrtc":
                                            message = Message.createWebRTCMessage(messageId, date, from, side, body, false);
                                            break;
                                        case "admin":
                                            message = Message.createBubbleAdminMessage(messageId, date, from, roomEvent);
                                            break;
                                        default:
                                            if (oob && oob.children.length) {
                                                let url = oob.getChild("url").text();
                                                let mime = oob.getChild("mime").text();
                                                let filename = oob.getChild("filename").text();
                                                let filesize = oob.getChild("size").text();
                                                let fileId = Message.extractFileIdFromUrl(url);

                                                // TODO later - let fileDescriptor = fileStorageService.getFileDescriptorById(fileId);
                                                
                                                let shortFileDescriptor = {
                                                    id: fileId,
                                                    url: url,
                                                    mime: mime,
                                                    filename: filename,
                                                    filesize: filesize,
                                                    previewBlob: null,
                                                    // TODO later - status: ( fileDescriptor )?fileDescriptor.state:"deleted"
                                                };

                                                message = Message.createFileSharingMessage(messageId, date, from, side, body, false, shortFileDescriptor);
                                                
                                            } else {
                                                var isMarkdown = content && content.getAttr("type") === "text/markdown";
                                                body = isMarkdown ? content.text() : body;
                                                message = Message.create(messageId, date, from, side, body, false, isMarkdown);
                                            }
                                            break;
                                    }
                                    // console.error("message "+ JSON.stringify(message.date));
                                    message.receiptStatus = ack.getAttr("read") === "true" ? 5 : (ack.getAttr("received") === "true" ? 4 : 3);

                                    // if (conversation.bubble) {
                                    // 	message.receiptStatus = 3;
                                    // }

                                    conversation.historyMessages.push(message);
                                    return Promise.resolve();
                                }
                        });
                        conversation.pendingPromise.push(promise);
                    }
                }

                else {
                    // Get associated conversation
                    queryId = stanza.getChild("fin").getAttr("queryid");
                    conversation = this.conversationService.getConversationById(queryId);
                    if (conversation) {

                        if ( conversation.pendingPromise ) {
                            Promise.all( conversation.pendingPromise ).then( () => {

                            // Extract info
                            conversation.historyComplete = stanza.getChild("fin").getAttr("complete") === "true";
                            var historyIndex = stanza.getChild("fin").getChild("set").getChild("first") ?
                            stanza.getChild("fin").getChild("set").getChild("first").text() : -1;

                            // Handle very particular case of historyIndex == -1
                            if (conversation.historyIndex === -1) {
                                conversation.messages.unshift.apply(conversation.messages, conversation.historyMessages);

                                if (conversation.chatRenderer) {
                                    conversation.chatRenderer.prependMessages(conversation.messages, conversation.bubble);
                                }
                            }

                            // Classic case
                            else {
                                conversation.messages.unshift.apply(conversation.messages, conversation.historyMessages);

                                if (conversation.chatRenderer) {
                                    conversation.chatRenderer.prependMessages(conversation.historyMessages, conversation.bubble);
                                }
                            }

                            conversation.historyIndex = historyIndex;
                            conversation.historyMessages = [];
                            if (conversation.messages && conversation.messages.length > 0) {
                                conversation.lastMessageText = conversation.messages[conversation.messages.length - 1].data;
                            }
                            else {
                                // conversation.lastModification = conversation.historyIndex === "" ? new Date() : new Date(0);
                                conversation.lastMessageText = "";
                            }

                            // this.conversationService.orderConversations();

                            // $rootScope.$broadcast("ON_CONVERSATIONS_UPDATED_EVENT");
                                conversation.messages.sort( ( msg1, msg2 ) => new Date(msg1.date) - new Date(msg2.date) );
                                conversation.historyDefered.resolve(conversation);
                                delete conversation.pendingPromise;
                            });
                        } else {
                                conversation.messages.sort( ( msg1, msg2 ) => new Date(msg1.date) - new Date(msg2.date) );
                                conversation.historyDefered.resolve(conversation);
                        }
                        
                    }
                }

                return true;
            } catch (error) {
                that.logger.log("error", LOG_ID + "[Conversation] onHistoryMessageReceived error : " + error);
                return true;
            }
        };

        this.onWebrtcHistoryMessageReceived = (stanza, conversation) => {
            let that = this;
            try {
                var stanzaMessage = stanza.getChild("result").getChild("forwarded").getChild("message");
                let messageId = stanzaMessage.getAttr("id");
                let stanzaMessageCallLog = stanzaMessage.getChild("call_log");
                var callerJid = stanzaMessageCallLog.getChild("caller").text();
                var state = stanzaMessageCallLog.getChild("state").text();
                var duration = 0;

                if (stanzaMessageCallLog.getChild("duration")) {
                    duration = stanzaMessageCallLog.getChild("duration").text();
                    duration = parseInt(duration, 10);
                }

                if (duration > 0) {
                    duration = "(" + moment.duration(duration, "ms").format("h[H] mm[m] ss[s]") + ")";
                } else {
                    duration = 0;
                }

                var date = stanzaMessageCallLog.getChild("date").text();

                if (date) {
                    date = new Date(date);
                }
                else {
                    date = new Date(stanza.getChild("result").getChild("forwarded").getChild("delay").attr("stamp"));
                }

                var body = "";
                if (state === "missed") {
                    body = "missedCall||" + date;
                } else if (state === "answered") {
                    body = "activeCallMsg||" + date + "||" + duration;
                }

                var message = conversation.getMessageById(messageId);
                if (!message) { message = conversation.historyMessages.find(function(item) { return item.id === messageId; }); }

                if (message) {
                    that.logger.log("info", LOG_ID + "[Conversation] (" + conversation.id + ") try to add an already stored message with id " + message.id);
                }
                else {
                    if ( !conversation.pendingPromise ) {
                        conversation.pendingPromise = [];
                    }
                    
                    let promise = new Promise( (resolve) => {
                        conversationService._contacts.getContactByJid(callerJid)
                            .then( (from) => {
                                resolve(from);
                            }).catch( () => {
                                resolve(null);
                            });
                    }).then( (from) => {
                        // Create new message 
                        if (!from) {
                            that.logger.log("warn", LOG_ID + "[Conversation] onWebrtcHistoryMessageReceived missing contact for jid : " + callerJid + ", ignore message");
                            //create basic contact
                            from = that.conversationService._contacts.createEmptyContactContact(callerJid);
                        }

                        var side = that.conversationService._contacts.isUserContact(from) ? Message.Side.RIGHT : Message.Side.LEFT;

                        message = Message.createWebRTCMessage(messageId, date, from, side, body, false);

                        var ack = stanzaMessage.getChild('ack');
                        if (ack) {
                            message.receiptStatus = ack.getAttr("read") === "true" ? 5 : (ack.getAttr("received") === "true" ? 4 : 3);
                        }

                        conversation.historyMessages.push(message);
                        return Promise.resolve();                                
                    });
                    conversation.pendingPromise.push(promise);
                }

                return true;
            } catch (error) {
                console.error(error);
                return true;
            }
        };
    }
}

module.exports = ConversationHistoryHandler;
