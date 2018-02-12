"use strict";

const XMPPUtils = require("../../common/XMPPUtils");
const GenericHandler = require("./genericHandler");
const xml = require("@xmpp/xml");

const LOG_ID = "XMPP/HNDL - ";

class ConversationHistoryHandler  extends GenericHandler {

    constructor(xmppService, conversationService) {
        super( xmppService);

        this.MESSAGE_MAM = "urn:xmpp:mam:1.message";
        this.IQ_MAM = "urn:xmpp:mam:1.iq";

        this.conversationService = conversationService;

        let that = this;

        this.onMamMessageReceived = function(msg, stanza) {
			try {
                // Get queryId and deleteId
                let queryId = stanza.getChild("result") ? stanza.getChild("result").getAttr("queryid") : null;
				if (!queryId) {
					queryId = stanza.getChild("fin") ? stanza.getChild("result").getAttr("queryid") : null;
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

                var queryId = stanza.getChild("result").getAttr("queryid");
                if (queryId) {

                    // Get associated conversation
                    conversation = this.conversationService.getConversationById(queryId);
                    if (conversation) {

                        if (stanza.getChild("call_log")) {
                            return this.onWebrtcHistoryMessageReceived(stanza, conversation);
                        }

                        // Extract info
                        let stanzaForwarded = stanza.getChild("result").getChild("forwarded");
                        let stanzaMessage = stanzaForwarded.getChild("message");
                        var brutJid = stanzaMessage.getAttr("from");

                        // Extract fromJid
                        var fromJid;
                        var roomEvent = false;
                        if (brutJid.indexOf("room_") === 0) { fromJid = brutJid.split("/")[1]; }
                        else { fromJid = XMPPUtils.getBareJIDFromFullJID(brutJid); }

                        if (!fromJid && stanzaElem.find("event").length) {
                            roomEvent = stanzaElem.find("event").attr("name");
                            fromJid = stanzaElem.find("event").attr("jid");

                            if (roomEvent === "welcome" && conversation.room && conversation.room.ownerContact) {
                                fromJid = conversation.room.ownerContact.jid;
                            }
                        }

                        if (!fromJid) {
                            that.logger.log("warn", LOG_ID + "[conversationService] onHistoryMessageReceived - Receive message without valid fromJid information");
                            return true;
                        }

                        var from = conversationService._contacts.getContactByJid(fromJid);
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
                            if (conversation.room && conversation.room.isMeetingRoom()) {
                                if (roomEvent === "welcome" ||
                                    roomEvent === "conferenceAdd" ||
                                    roomEvent === "conferenceRemove" ||
                                    roomEvent === "invitation") {
                                    return true;
                                }
                            }

                            if ((roomEvent === "conferenceAdd" || roomEvent === "conferenceRemove") && conversation.room && conversation.room.ownerContact) {
                                from = conversation.room.ownerContact;
                            }
                        }

                        var message = conversation.getMessageById(messageId);
                        if (!message) { message = conversation.historyMessages.find(function(item) { return item.id === messageId; }); }
                        if (message) {
                            that.logger.log("info", LOG_ID + "[Conversation] (" + conversation.id + ") try to add an already stored message with id " + message.id);
                        }
                        else {
                            // Create new message 
                            var side = contactService.isUserContact(from) ? Message.Side.RIGHT : Message.Side.LEFT;
                            switch (type) {
                                case "file":
                                    message = Message.createFileMessage(messageId, date, from, side, body, false);
                                    break;
                                case "webrtc":
                                    message = Message.createWebRTCMessage(messageId, date, from, side, body, false);
                                    break;
                                case "admin":
                                    message = Message.createBubbleAdminMessage(messageId, date, from, roomEvent);
                                    break;
                                default:
                                    if (oob && oob.length) {
                                        var oobElem = $(oob);
                                        var url = oobElem.find("url").text();
                                        var mime = oobElem.find("mime").text();
                                        var filename = oobElem.find("filename").text();
                                        var filesize = oobElem.find("size").text();
                                        var fileId = fileStorageService.extractFileIdFromUrl(url);

                                        var fileDescriptor = fileStorageService.getFileDescriptorById(fileId);
                                        
                                        var shortFileDescriptor = {
                                            id: fileId,
                                            url: url,
                                            mime: mime,
                                            filename: filename,
                                            filesize: filesize,
                                            previewBlob: null,
                                            status: ( fileDescriptor )?fileDescriptor.state:"deleted"
                                        };

                                        message = Message.createFileSharingMessage(messageId, date, from, side, body, false, shortFileDescriptor);
                                        // TODO Later when thumb become available
                                        /*
                                        if (url && shortFileDescriptor.mime && shortFileDescriptor.mime.indexOf("image") === 0) {
                                            fileServerService.getBlobUrlFromUrl(url, shortFileDescriptor.mime, shortFileDescriptor.filesize, shortFileDescriptor.name)
                                                .then(function(blobUrl) {
                                                    shortFileDescriptor.previewBlob = blobUrl;
							                        conversation.updateMessage(message);
                                                });
				                        } 
                                        */
                                    } else if (conference && conference.length) {
                                        var conferenceElem = $(conference);
                                        var subject = conferenceElem.attr("subject");
                                        var confendpointid = conferenceElem.attr("confendpointid");
                                        var jid = conference.attr("jid");
                                        var conferenceDescriptor = {
                                            subject: subject,
                                            confendpointid: confendpointid,
                                            roomjid: jid
                                        };
                                        message = Message.createConferenceMessage(messageId, date, from, side, false, conferenceDescriptor);
                                    } else {
                                        var isMarkdown = content && content.attr("type") === "text/markdown";
                                        body = isMarkdown ? content.text() : body;
                                        message = Message.create(messageId, date, from, side, body, false, isMarkdown);
                                    }
                                    break;
                            }
                            // console.error("message "+ JSON.stringify(message.date));
                            message.receiptStatus = angular.element(ack).attr("read") === "true" ? 5 : (angular.element(ack).attr("received") === "true" ? 4 : 3);

                            // if (conversation.room) {
                            // 	message.receiptStatus = 3;
                            // }

                            conversation.historyMessages.push(message);
                        }
                    }
                }

                else {
                    // Get associated conversation
                    queryId = angular.element(stanza).find("fin").attr("queryid");
                    conversation = this.conversationService.getConversationById(queryId);
                    if (conversation) {

                        // Extract info
                        conversation.historyComplete = angular.element(stanza).find("fin").attr("complete") === "true";
                        var historyIndex = angular.element(stanza).find("fin set first").text();

                        // Handle very particular case of historyIndex == -1
                        if (conversation.historyIndex === -1) {
                            conversation.messages.unshift.apply(conversation.messages, conversation.historyMessages);

                            if (conversation.chatRenderer) {
                                conversation.chatRenderer.prependMessages(conversation.messages, conversation.room);
                            }
                        }

                        // Classic case
                        else {
                            conversation.messages.unshift.apply(conversation.messages, conversation.historyMessages);

                            if (conversation.chatRenderer) {
                                conversation.chatRenderer.prependMessages(conversation.historyMessages, conversation.room);
                            }
                        }

                        conversation.historyIndex = historyIndex;
                        conversation.historyMessages = [];
                        if (angular.isDefined(conversation.messages) && conversation.messages.length > 0) {
                            conversation.lastMessageText = conversation.messages[conversation.messages.length - 1].data;
                        }
                        else {
                            // conversation.lastModification = conversation.historyIndex === "" ? new Date() : new Date(0);
                            conversation.lastMessageText = "";
                        }

                        // this.conversationService.orderConversations();

                        // $rootScope.$broadcast("ON_CONVERSATIONS_UPDATED_EVENT");

                        conversation.historyDefered.resolve(conversation);
                    }
                }

                return true;
            } catch (error) {
                that.logger.log("error", LOG_ID + "[Conversation] onHistoryMessageReceived error : " + error);
                return true;
            }
        };

        this.onWebrtcHistoryMessageReceived = (msg, stanza) => {
            console.log("onWebrtcHistoryMessageReceived");
            try {
                var stanzaElem = $(stanza);
                var messageId = stanzaElem.find("forwarded message").attr("id");
                var callerJid = stanzaElem.find("caller").text();
                var state = stanzaElem.find("state").text();
                var duration = 0;

                if (stanzaElem.find("duration")) {
                    duration = stanzaElem.find("duration").text();
                    duration = parseInt(duration, 10);
                }

                if (duration > 0) {
                    duration = "(" + moment.duration(duration, "ms").format("h[H] mm[m] ss[s]") + ")";
                } else {
                    duration = 0;
                }

                var date = stanzaElem.find("date").text();

                if (date) {
                    date = new Date(date);
                }
                else {
                    date = new Date(stanzaElem.find("forwarded delay").attr("stamp"));
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
                    $log.info("[Conversation] (" + conversation.id + ") try to add an already stored message with id " + message.id);
                }
                else {
                    var from = contactService.getContactByJid(callerJid);
                    // Create new message 

                    if (!from) {
                        $log.warn("[Conversation] onWebrtcHistoryMessageReceived missing contact for jid : " + fromJid + ", ignore message");
                        //create basic contact
                        from = contactService.createEmptyContactContact(fromJid);
                    }

                    var side = contactService.isUserContact(from) ? Message.Side.RIGHT : Message.Side.LEFT;

                    message = Message.createWebRTCMessage(messageId, date, from, side, body, false);

                    var ack = stanzaElem.find("forwarded message ack");
                    if (ack) {
                        message.receiptStatus = angular.element(ack).attr("read") === "true" ? 5 : (angular.element(ack).attr("received") === "true" ? 4 : 3);
                    }

                    conversation.historyMessages.push(message);
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
