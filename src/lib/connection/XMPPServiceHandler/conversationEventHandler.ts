"use strict";
import {RESTService} from "../RESTService";

export {};


import {XMPPUTils} from "../../common/XMPPUtils";
import {ConversationsService} from "../../services/ConversationsService";

const GenericHandler = require("./genericHandler");
import {Conversation} from "../../common/models/Conversation";

const util = require('util');

const xml = require("@xmpp/xml");

const LOG_ID = "XMPP/HNDL/CONV - ";

const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";
import {Element} from "ltx";
import {logEntryExit} from "../../common/Utils";

@logEntryExit(LOG_ID)
class ConversationEventHandler extends GenericHandler {
    public MESSAGE_CHAT: any;
    public MESSAGE_GROUPCHAT: any;
    public MESSAGE_WEBRTC: any;
    public MESSAGE_MANAGEMENT: any;
    public MESSAGE_ERROR: any;
    public MESSAGE_HEADLINE: any;
    public MESSAGE_CLOSE: any;
    public conversationService: ConversationsService;
    public onChatMessageReceived: any;
    public _onMessageReceived: any;
    public eventEmitter: any;
    public onRoomAdminMessageReceived: any;
    public onFileMessageReceived: any;
    public onWebRTCMessageReceived: any;
    public onManagementMessageReceived: any;
    public onRoomManagementMessageReceived: any;
    public onUserSettingsManagementMessageReceived: any;
    public onUserInviteManagementMessageReceived: any;
    public onGroupManagementMessageReceived: any;
    public onConversationManagementMessageReceived: any;
    public onMuteManagementMessageReceived: any;
    public onUnmuteManagementMessageReceived: any;
    public onFileManagementMessageReceived: any;
    public onThumbnailManagementMessageReceived: any;
    public onReceiptMessageReceived: any;
    public onErrorMessageReceived: any;
    public findAttrs: any;
    public findChildren: any;
    public onCloseMessageReceived: any;
    public fileStorageService: any;
    public fileServerService: any;

    constructor(xmppService, conversationService, fileStorageService, fileServerService) {
        super(xmppService);

        this.MESSAGE_CHAT = "jabber:client.message.chat";
        this.MESSAGE_GROUPCHAT = "jabber:client.message.groupchat";
        this.MESSAGE_WEBRTC = "jabber:client.message.webrtc";
        this.MESSAGE_MANAGEMENT = "jabber:client.message.management";
        this.MESSAGE_ERROR = "jabber:client.message.error";
        this.MESSAGE_HEADLINE = "jabber:client.message.headline";
        this.MESSAGE_CLOSE = "jabber:client.message.headline";

        this.conversationService = conversationService;
        this.fileStorageService = fileStorageService;
        this.fileServerService = fileServerService;

        let that = this;

        this.onChatMessageReceived = (msg, stanza) => {
            try {
                that.logger.log("internal", LOG_ID + "(onChatMessageReceived) _entering_ : ", msg, stanza);
                let content = "";
                let lang = "";
                let alternativeContent = [];
                let subject = "";
                let event = "";
                let eventJid = "";
                let hasATextMessage = false;
                let oob = null;
                let messageType = stanza.attrs.type;
                let timestamp = new Date();
                let replaceMessageId = null;
                let attention = false;

                let fromJid = XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(stanza.attrs.from);
                let resource = XMPPUTils.getXMPPUtils().getResourceFromFullJID(stanza.attrs.from);
                let toJid = stanza.attrs.to;
                let id = stanza.attrs.id;
                let children = stanza.children;
                children.forEach((node) => {
                    switch (node.getName()) {
                        case "sent":
                            if (node.attrs.xmlns === "urn:xmpp:carbons:2") {
                                that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - CC message 'sent' received");
                                let forwarded = node.children[0];
                                if (forwarded && forwarded.getName() === "forwarded") {
                                    let message = forwarded.children[0];
                                    if (message && message.getName() === "message") {
                                        fromJid = XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(message.attrs.from);
                                        resource = XMPPUTils.getXMPPUtils().getResourceFromFullJID(message.attrs.from);
                                        toJid = message.attrs.to;
                                        id = message.attrs.id;
                                        let childs = message.children;
                                        if (childs) {
                                            let timestamp = message.getChildren("archived").length &&
                                            message.getChildren("archived")[0] &&
                                            message.getChildren("archived")[0].attrs.stamp ?
                                                new Date(message.getChildren("archived")[0].attrs.stamp) : new Date();

                                            childs.forEach((nodeChild) => {
                                                if (nodeChild.getName() === "body") {
                                                    that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - CC message 'sent' of type chat received ");

                                                    let data = {
                                                        "fromJid": fromJid,
                                                        "resource": resource,
                                                        "toJid": toJid,
                                                        "type": messageType,
                                                        "content": nodeChild.getText(),
                                                        "id": id,
                                                        "lang": nodeChild.attrs["xml:lang"],
                                                        "cc": true,
                                                        "cctype": "sent",
                                                        "isEvent": false,
                                                        "date": timestamp
                                                    };

                                                    let conversationId = data.toJid;

                                                    that._onMessageReceived(conversationId, data);

                                                }
                                            });
                                        }
                                    }
                                }
                            }
                            break;
                        case "received":
                            if (node.attrs.xmlns === "urn:xmpp:carbons:2") {
                                that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - CC message 'sent' received");
                                let forwarded = node.children[0];
                                if (forwarded && forwarded.getName() === "forwarded") {
                                    let message = forwarded.children[0];
                                    if (message && message.getName() === "message") {
                                        fromJid = XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(message.attrs.from);
                                        resource = XMPPUTils.getXMPPUtils().getResourceFromFullJID(message.attrs.from);
                                        toJid = message.attrs.to;
                                        id = message.attrs.id;
                                        let childs = message.children;
                                        if (childs) {
                                            let timestamp = message.getChildren("archived").length &&
                                            message.getChildren("archived")[0] &&
                                            message.getChildren("archived")[0].attrs.stamp ?
                                                new Date(message.getChildren("archived")[0].attrs.stamp) : new Date();

                                            childs.forEach(function (nodeChild) {
                                                if (nodeChild.getName() === "body") {
                                                    that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - CC message 'sent' of type chat received ");

                                                    let data = {
                                                        "fromJid": fromJid,
                                                        "resource": resource,
                                                        "toJid": toJid,
                                                        "type": messageType,
                                                        "content": nodeChild.getText(),
                                                        "id": id,
                                                        "lang": nodeChild.attrs["xml:lang"],
                                                        "cc": true,
                                                        "cctype": "sent",
                                                        "isEvent": false,
                                                        "date": timestamp
                                                    };

                                                    let conversationId = data.fromJid;

                                                    that._onMessageReceived(conversationId, data);
                                                }
                                            });
                                        }
                                    }
                                }
                            } else {
                                let receipt = {
                                    event: node.attrs.event,
                                    entity: node.attrs.entity,
                                    type: messageType,
                                    id: node.attrs.id,
                                    fromJid: fromJid,
                                    resource: resource
                                };
                                that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - receipt received");
                                that.eventEmitter.emit("evt_internal_onreceipt", receipt);
                            }
                            break;
                        case "active":
                        case "inactive":
                        case "composing":
                        case "paused":
                            let chatstate = {
                                type: messageType,
                                fromJid: fromJid,
                                resource: resource,
                                chatstate: node.getName()
                            };
                            that.logger.log("internal", LOG_ID + "(onChatMessageReceived) message - someone is " + node.getName());
                            that.eventEmitter.emit("evt_internal_chatstate", chatstate);
                            break;
                        case "archived":
                            break;
                        case "stanza-id":
                            break;
                        case "subject":
                            subject = node.getText();
                            hasATextMessage = (!(!subject || subject === ''));
                            break;
                        case "event":
                            event = node.attrs.name;
                            eventJid = node.attrs.jid;
                            break;
                        case "body":
                            content = node.getText();
                            that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - content", "***");
                            if (node.attrs["xml:lang"]) { // in <body>
                                lang = node.attrs["xml:lang"];
                            } else if (node.parent.attrs["xml:lang"]) { // in <message>
                                lang = node.parent.attrs["xml:lang"];
                            } else {
                                lang = "en";
                            }
                            that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - lang", lang);
                            hasATextMessage = (!(!content || content === ''));
                            break;
                        case "content":
                            alternativeContent.push({
                                "message": node.getText(),
                                "type": node.getAttr("type")
                            });
                            hasATextMessage = true;
                            break;
                        case "request":
                            that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - asked for receipt");
                            // Acknowledge 'received'
                            let stanzaReceived = xml("message", {
                                    "to": fromJid,
                                    "from": toJid,
                                    "type": messageType
                                }, xml("received", {
                                    "xmlns": "urn:xmpp:receipts",
                                    "event": "received",
                                    "entity": "client",
                                    "id": stanza.attrs.id
                                })
                            );

                            that.logger.log("internal", LOG_ID + "(onChatMessageReceived) answered - send receipt 'received' : ", stanzaReceived.root().toString());
                            that.xmppClient.send(stanzaReceived);

                            //Acknowledge 'read'
                            if (that.xmppService.shouldSendReadReceipt || (messageType === TYPE_GROUPCHAT && XMPPUTils.getXMPPUtils().getResourceFromFullJID(stanza.attrs.from) === that.fullJid)) {

                                let stanzaRead = xml("message", {
                                        "to": fromJid,
                                        "from": toJid,
                                        "type": messageType
                                    }, xml("received", {
                                        "xmlns": "urn:xmpp:receipts",
                                        "event": "read",
                                        "entity": "client",
                                        "id": stanza.attrs.id
                                    })
                                );
                                that.logger.log("internal", LOG_ID + "(onChatMessageReceived) answered - send markAsRead : receipt 'read' : ", stanzaRead.root().toString());
                                that.xmppClient.send(stanzaRead);
                            }
                            break;
                        case "recording":
                            that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - recording message");
                            // TODO
                            break;
                        case "timestamp":
                            timestamp = node.attrs.value ?
                                new Date(node.attrs.value) : new Date();
                            break;
                        case "x": {
                            let xmlns = node.attrs.xmlns;
                            switch (xmlns) {
                                case "jabber:x:bubble:conference":
                                case "jabber:x:conference": {
                                    let invitation = {
                                        event: "invitation",
                                        bubbleId: node.attrs.thread,
                                        bubbleJid: node.attrs.jid,
                                        fromJid: fromJid,
                                        resource: resource
                                    };
                                    that.logger.log("info", LOG_ID + "(onChatMessageReceived) invitation received");
                                    that.eventEmitter.emit("evt_internal_invitationreceived", invitation);
                                }
                                    break;
                                case "jabber:x:oob" : {
                                    oob = {
                                        url: node.getChild("url").getText(),
                                        mime: node.getChild("mime").getText(),
                                        filename: node.getChild("filename").getText(),
                                        filesize: node.getChild("size").getText()
                                    };
                                    that.logger.log("info", LOG_ID + "(onChatMessageReceived) oob received");
                                    break;
                                }
                                default:
                                    break;
                            }
                            break;
                        }
                        case "no-store":
                            break;
                        case "no-permanent-store":
                            break;
                        case "store":
                            break;
                        case "replace": {
                            let replacedId = node.attrs.id;
                            replaceMessageId = replacedId;
                        }
                            break;
                        case "deleted": {
                            let idDeleted = node.attrs.id;
                            let conversationJid = node.attrs.with;
                            if (idDeleted === "all") {
                                let conversation = that.conversationService.getConversationById(conversationJid);
                                if (conversation) {
                                    that.logger.log("info", LOG_ID + "(onChatMessageReceived) conversation with all messages deleted received ", conversation.id);
                                    conversation.reset();
                                    that.eventEmitter.emit("evt_internal_allmessagedremovedfromconversationreceived", conversation);
                                }
                            }
                        }
                            break;
                        case "mark_as_read": {
                            let conversationId = node.find("mark_as_read").attr("with");
                            let conversation = this.conversationService.getConversationById(conversationId);

                            if (conversation) {
                                let typeread = node.find("mark_as_read").attr("id");
                                switch (typeread) {
                                    case "all-received": // messages for this conversation have been acknowledged
                                        conversation.missedCounter = 0;
                                        break;
                                    case "all-sent": // messages for this conversation have been read
                                        // Not take into account : conversation.ackReadAllMessages();
                                        break;
                                    default:
                                        that.logger.log("error", LOG_ID + "(onChatMessageReceived) error - unknown read type : ", typeread);
                                        break;
                                }
                            }
                        }
                            break;
                        case "deleted_call_log":
                            break;
                        case "updated_call_log":
                            break;
                        case "attention":
                            attention = true;
                            break;
                        default:
                            that.logger.log("error", LOG_ID + "(onChatMessageReceived) unmanaged chat message node : ", node.getName());
                            that.logger.log("internalerror", LOG_ID + "(onChatMessageReceived) unmanaged chat message node : ", node.getName(), stanza);
                            break;
                    }
                });

                let fromBubbleJid = "";
                let fromBubbleUserJid = "";
                if (stanza.attrs.type === TYPE_GROUPCHAT) {
                    fromBubbleJid = XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(stanza.attrs.from);
                    fromBubbleUserJid = XMPPUTils.getXMPPUtils().getResourceFromFullJID(stanza.attrs.from);
                    resource = XMPPUTils.getXMPPUtils().getResourceFromFullJID(fromBubbleUserJid);
                }

                if ((messageType === TYPE_GROUPCHAT && fromBubbleUserJid !== that.fullJid) || (messageType === TYPE_CHAT && fromJid !== that.fullJid)) {
                    that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - chat message received");

                    timestamp = stanza.getChildren("archived").length &&
                    stanza.getChildren("archived")[0] &&
                    stanza.getChildren("archived")[0].attrs.stamp ?
                        new Date(stanza.getChildren("archived")[0].attrs.stamp) : new Date();

                    let data = {
                        "fromJid": fromJid,
                        "resource": resource,
                        "toJid": toJid,
                        "type": messageType,
                        "content": content,
                        "alternativeContent": alternativeContent,
                        "id": stanza.attrs.id,
                        "lang": lang,
                        "cc": false,
                        "cctype": "",
                        "isEvent": false,
                        "oob": oob,
                        "date": timestamp,
                        "fromBubbleJid": null,
                        "fromBubbleUserJid": null,
                        "event": null,
                        "eventJid": null,
                        "originalMessageReplaced": null,
                        "attention" : undefined,
                        subject
                    };

                    if (stanza.attrs.type === TYPE_GROUPCHAT) {
                        data.fromBubbleJid = fromBubbleJid;
                        data.fromBubbleUserJid = fromBubbleUserJid;
                        data.fromJid = XMPPUTils.getXMPPUtils().getRoomJIDFromFullJID(stanza.attrs.from);

                        if (event) {
                            data.event = event;
                            data.eventJid = eventJid;
                            data.isEvent = true;
                        }
                        if (attention) {
                            data.attention = attention;
                        }
                    }

                    let outgoingMessage = that.conversationService._contacts.isUserContactJid(fromJid);
                    let conversationId = outgoingMessage ? data.toJid : (stanza.attrs.type === TYPE_GROUPCHAT ? fromBubbleJid : data.fromJid);

                    if (replaceMessageId) {
                        //data.replaceMessageId = replaceMessageId;
                        let conversation = that.conversationService.getConversationById(conversationId);
                        if (conversation) {
                            data.originalMessageReplaced = conversation.getMessageById(replaceMessageId);
                        } else {
                            that.logger.log("warn", LOG_ID + "(onChatMessageReceived) This is a replace msg but no conversation found for the original msg id. So store an empty msg to avoid the lost of information.", replaceMessageId);
                            data.originalMessageReplaced = {};
                            data.originalMessageReplaced.id = replaceMessageId;
                        }
                        data.originalMessageReplaced.replacedByMessage = data;
                    } else {
                        if (!hasATextMessage) {
                            that.logger.log("debug", LOG_ID + "(_onMessageReceived) with no message text, so ignore it! hasATextMessage : ", hasATextMessage);
                            return;
                        }
                        else {
                            that.logger.log("internal", LOG_ID + "(_onMessageReceived) with message : ", data, ", hasATextMessage : ", hasATextMessage);
                        }
                    }

                    this._onMessageReceived(conversationId, data);
                } else {
                    that.logger.log("debug", LOG_ID + "(onChatMessageReceived) We are the sender, so ignore it.");
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onChatMessageReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onChatMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this._onMessageReceived = (conversationId, data) => {
            try {
                that.logger.log("internal", LOG_ID + "(_onMessageReceived) _entering_ : ", conversationId, data);
                let conversation = that.conversationService.getConversationById(conversationId);
                let cs = this.conversationService;
                if (!conversation) {
                    that.logger.log("internal", LOG_ID + "(_onMessageReceived) conversation NOT found in cache by Id : ", conversationId, ", for new message : ", data);
                    let createPromise = conversationId.startsWith("room_") ? cs.getBubbleConversation(conversationId) : cs.getOrCreateOneToOneConversation(conversationId);
                    createPromise.then((conv) => {
                        data.conversation = conv;
                        data.conversation.addMessage(data);
                        /*if (data.conversation.messages.length === 0 || !data.conversation.messages.find((elmt) => { if (elmt.id === data.id) { return elmt; } })) {
                            data.conversation.messages.push(data);
                        } // */
                        this.eventEmitter.emit("evt_internal_onmessagereceived", data);
                        that.eventEmitter.emit("evt_internal_conversationupdated", conv);
                        that.logger.log("internal", LOG_ID + "(_onMessageReceived) cs.getConversations() : ", cs.getConversations());
                    });
                } else {
                    that.logger.log("internal", LOG_ID + "(_onMessageReceived) conversation found in cache by Id : ", conversationId, ", for new message : ", data);
                    data.conversation = conversation;
                    data.conversation.addMessage(data);
                    /*if (data.conversation.messages.length === 0 || !data.conversation.messages.find((elmt) => { if (elmt.id === data.id) { return elmt; } })) {
                        data.conversation.messages.push(data);
                    } // */
                    this.eventEmitter.emit("evt_internal_onmessagereceived", data);
                    that.eventEmitter.emit("evt_internal_conversationupdated", conversation);
                    that.logger.log("internal", LOG_ID + "(_onMessageReceived) cs.getConversations() : ", cs.getConversations());
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(_onMessageReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(_onMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onRoomAdminMessageReceived = (msg, stanza) => {
        };

        this.onFileMessageReceived = (msg, stanza) => {
        };

        this.onWebRTCMessageReceived = (msg, stanza) => {
            // No treatment, dedicated to Call Log later
        };

        this.onManagementMessageReceived = (msg, stanza) => {
            try {
                that.logger.log("internal", LOG_ID + "(onManagementMessageReceived) _entering_ : ", msg, stanza);
                let children = stanza.children;
                children.forEach(function (node) {
                    switch (node.getName()) {
                        case "room":
                            that.onRoomManagementMessageReceived(node);
                            break;
                        case "usersettings":
                            that.onUserSettingsManagementMessageReceived(node);
                            break;
                        case "userinvite":
                            that.onUserInviteManagementMessageReceived(node);
                            break;
                        case "group":
                            that.onGroupManagementMessageReceived(node);
                            break;
                        case "conversation":
                            that.onConversationManagementMessageReceived(node);
                            break;
                        case "mute":
                            that.onMuteManagementMessageReceived(node);
                            break;
                        case "unmute":
                            that.onUnmuteManagementMessageReceived(node);
                            break;
                        case "file":
                            that.onFileManagementMessageReceived(node);
                            break;
                        case "thumbnail":
                            that.onThumbnailManagementMessageReceived(node);
                            break;
                        case "channel-subscription":
                        case "channel":
                            //treated in channelEventHandler::onFavoriteManagementMessageReceived(node);
                            break;
                        case "favorite":
                            // treated in favoriteEventHandler
                            break;
                        default:
                            that.logger.log("error", LOG_ID + "(onManagementMessageReceived) unmanaged management message node " + node.getName());
                            break;
                    }
                });
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onManagementMessageReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onRoomManagementMessageReceived = (node) => {
            try {
                that.logger.log("internal", LOG_ID + "(onRoomManagementMessageReceived) _entering_ : ", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {

                    // Affiliation changed (my own or for a member)
                    if (node.attrs.status) {
                        if (node.attrs.userjid === XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(that.fullJid)) {
                            that.logger.log("debug", LOG_ID + "(onRoomManagementMessageReceived) bubble management received for own.");
                            that.eventEmitter.emit("evt_internal_ownaffiliationchanged", {
                                "bubbleId": node.attrs.roomid,
                                "bubbleJid": node.attrs.roomjid,
                                "userJid": node.attrs.userjid,
                                "status": node.attrs.status,
                            });
                        } else {
                            that.logger.log("debug", LOG_ID + "(onRoomManagementMessageReceived) bubble affiliation received");
                            that.eventEmitter.emit("evt_internal_affiliationchanged", {
                                "bubbleId": node.attrs.roomid,
                                "bubbleJid": node.attrs.roomjid,
                                "userJid": node.attrs.userjid,
                                "status": node.attrs.status,
                            });
                        }
                    }
                    // Custom data changed
                    else if (node.attrs.customData) {
                        that.logger.log("debug", LOG_ID + "(onRoomManagementMessageReceived) bubble custom-data changed");
                        that.eventEmitter.emit("evt_internal_customdatachanged", {
                            "bubbleId": node.attrs.roomid,
                            "bubbleJid": node.attrs.roomjid,
                            "customData": node.attrs.customData
                        });
                    }
                    // Topic changed
                    if (node.attrs.topic) {
                        that.logger.log("debug", LOG_ID + "(onRoomManagementMessageReceived) bubble topic changed");
                        that.eventEmitter.emit("evt_internal_topicchanged", {
                            "bubbleId": node.attrs.roomid,
                            "bubbleJid": node.attrs.roomjid,
                            "topic": node.attrs.topic
                        });
                    }  // Topic changed
                    if (node.attrs.privilege) {
                        that.logger.log("debug", LOG_ID + "(onRoomManagementMessageReceived) bubble privilege changed");
                        that.eventEmitter.emit("evt_internal_privilegechanged", {
                            "bubbleId": node.attrs.roomid,
                            "bubbleJid": node.attrs.roomjid,
                            "userjid": node.attrs.userjid,
                            "privilege": node.attrs.privilege
                        });
                    }
                    // Name changed
                    if (node.attrs.name) {
                        that.logger.log("debug", LOG_ID + "(onRoomManagementMessageReceived) bubble name changed");
                        that.eventEmitter.emit("evt_internal_namechanged", {
                            "bubbleId": node.attrs.roomid,
                            "bubbleJid": node.attrs.roomjid,
                            "name": node.attrs.name
                        });
                    }
                    let lastAvatarUpdateDate = node.attrs.lastAvatarUpdateDate;
                    let avatarElem = node.find("avatar");
                    let avatarType = null;
                    if (avatarElem.length > 0) {
                        if (avatarElem.attr("action") === "delete") { avatarType = "delete"; }
                        else { avatarType = "update"; }
                    }
                    if (lastAvatarUpdateDate || avatarType) {
                        that.logger.log("debug", LOG_ID + "(onRoomManagementMessageReceived) bubble avatar changed");
                        that.eventEmitter.emit("evt_internal_bubbleavatarchanged", {"bubbleId": node.attrs.roomid});
                        /*service.getServerRoom(room.dbId)
                            .then(function(roomToUpdate) {
                                roomToUpdate.updateAvatarInfo();
                                $rootScope.$broadcast(service.ROOM_AVATAR_UPDATE_EVENT, room);
                            }); // */
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onRoomManagementMessageReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onRoomManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onUserSettingsManagementMessageReceived = (node) => {
            try {
                that.logger.log("debug", LOG_ID + "(onUserSettingsManagementMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onUserSettingsManagementMessageReceived) _entering_", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    switch (node.attrs.action) {
                        case "update":
                            that.logger.log("debug", LOG_ID + "(onUserSettingsManagementMessageReceived) usersettings updated");
                            that.eventEmitter.emit("evt_internal_usersettingschanged");
                            break;
                        default:
                            break;
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onUserSettingsManagementMessageReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onUserSettingsManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onUserInviteManagementMessageReceived = (node) => {
            try {
                that.logger.log("debug", LOG_ID + "(onUserInviteManagementMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onUserInviteManagementMessageReceived) _entering_", node);
                /*
                // Know the treatment is done in invitationEventHandler
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    that.logger.log("debug", LOG_ID + "(onUserInviteManagementMessageReceived) xmlns configuration, treat action : ");
                    switch (node.attrs.action) {
                        case "create":
                                that.logger.log("debug", LOG_ID + "(onUserInviteManagementMessageReceived) user invite received");
                                that.eventEmitter.emit("evt_internal_userinvitemngtreceived", {invitationId: node.attrs.id});
                            break;
                        case "update":
                            if (node.attrs.type === "sent" && node.attrs.status === "canceled") {
                                that.logger.log("debug", LOG_ID + "(onUserInviteManagementMessageReceived) user invite canceled");
                                that.eventEmitter.emit("evt_internal_userinvitecanceled", {invitationId: node.attrs.id});
                            } else if (node.attrs.type === "sent" && node.attrs.status === "accepted") {
                                that.logger.log("debug", LOG_ID + "(onUserInviteManagementMessageReceived) user invite accepted");
                                that.eventEmitter.emit("evt_internal_userinviteaccepted", {invitationId: node.attrs.id});
                            }
                            break;
                        default:
                            that.logger.log("debug", LOG_ID + "(onUserInviteManagementMessageReceived) action not reconized, so default switch used to do nothing.");
                            break;
                    }
                } else {
                    that.logger.log("debug", LOG_ID + "(onUserInviteManagementMessageReceived) not xmlns configuration, ignore it : ", node.attrs.xmlns);
                }
                // */
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onUserInviteManagementMessageReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onUserInviteManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onGroupManagementMessageReceived = (node) => {
            try {
                that.logger.log("internal", LOG_ID + "(onGroupManagementMessageReceived) _entering_ : ", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    let action = node.attrs.action;
                    let scope = node.attrs.scope;

                    if (action === "create" && scope === "group") {
                        that.logger.log("debug", LOG_ID + "(onGroupManagementMessageReceived) group created");
                        that.eventEmitter.emit("evt_internal_hdle_groupcreated", {"groupId": node.attrs.id});
                    } else if (action === "create" && scope === "user" && node.attrs.userId) {
                        that.logger.log("debug", LOG_ID + "(onGroupManagementMessageReceived) user added in group");
                        that.eventEmitter.emit("evt_internal_hdle_useraddedingroup", {
                                "groupId": node.attrs.id,
                                "userId": node.attrs.userId
                            });
                    } else if (action === "delete" && scope === "group") {
                        that.logger.log("debug", LOG_ID + "(onGroupManagementMessageReceived) group deleted");
                        that.eventEmitter.emit("evt_internal_hdle_groupdeleted", {"groupId": node.attrs.id});
                    } else if (action === "delete" && scope === "user" && node.attrs.userId) {
                        that.logger.log("debug", LOG_ID + "(onGroupManagementMessageReceived) user removed from group");
                        that.eventEmitter.emit("evt_internal_hdle_userremovedfromgroup", {
                                "groupId": node.attrs.id,
                                "userId": node.attrs.userId
                            });
                    } else if (action === "update" && scope === "group") {
                        if (node.attrs.name || node.attrs.comment || node.attrs.isFavorite) {
                            that.logger.log("debug", LOG_ID + "(onGroupManagementMessageReceived) group updated");
                            that.eventEmitter.emit("evt_internal_hdle_groupupdated", {"groupId": node.attrs.id});
                        }
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onGroupManagementMessageReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onGroupManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onConversationManagementMessageReceived = async (node: Element) => {
            try {
                that.logger.log("internal", LOG_ID + "(onConversationManagementMessageReceived) _entering_ : ", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    let conversationId = node.attrs.id;
                    let conversation = this.conversationService.getConversationById(conversationId);
                    let action = node.attrs.action;
                    that.logger.log("debug", LOG_ID + "(onConversationManagementMessageReceived) action : " + action + ", conversationId : ", conversationId);
                    that.logger.log("internal", LOG_ID + "(onConversationManagementMessageReceived) action : " + action + ", for conversation : ", conversation);

                    if (conversation) {
                        switch (action) {
                            case "create":
//                                conversation.dbId = node.getAttribute("id");
                                conversation.dbId = conversationId;
                                conversation.lastModification = new Date(node.find("lastMessageDate").text());
                                conversation.missedCounter = parseInt(node.find("unreadMessageNumber").text(), 10) || 0;
                                conversation.isFavorite = (node.find("isFavorite").text() === "true");
                                //this.conversationService.orderConversations();
                                //$rootScope.$broadcast("ON_CONVERSATIONS_UPDATED_EVENT");
                                // Send conversations update event
                                that.eventEmitter.emit("evt_internal_conversationupdated", conversation);
                                break;
                            case "delete":
                                this.conversationService.removeConversation(conversation);
                                break;
                            case "update":
                                conversation.isFavorite = (node.find("isFavorite").text() === "true");
                                //this.conversationService.orderConversations();
                                // Send conversations update event
                                that.eventEmitter.emit("evt_internal_conversationupdated", conversation);
                                //$rootScope.$broadcast("ON_CONVERSATIONS_UPDATED_EVENT");
                                break;
                            default:
                                break;
                        }
                    } else {
                        that.logger.log("debug", LOG_ID + "(onConversationManagementMessageReceived) conversation not know in cache action : ", action + ", conversationId : ", conversationId);
                        if (action === "create") {
                            let convId = node.find("peer").text();
                            let peerId = node.find("peerId").text();

                            let convDbId = node.attrs.id;
                            let lastModification = new Date(node.find("lastMessageDate").text());
                            let lastMessageText = node.find("lastMessageText").text();
                            let lastMessageSender = node.find("lastMessageSender").text();
                            let missedIMCounter = parseInt(node.find("unreadMessageNumber").text(), 10) || 0;
                            let muted = node.find("mute").text() === "true";
                            let isFavorite = node.find("isFavorite").text() === "true";
                            let type = node.find("type").text();

                            let conversationGetter = null;
                            if (type === "user") {
                                conversationGetter = await this.conversationService.getOrCreateOneToOneConversation(convId);
                            } else {
                                let bubbleId = convId;
                                that.logger.log("debug", LOG_ID + "(onConversationManagementMessageReceived) create, find conversation, bubbleId : " + bubbleId + ", convDbId : ", convDbId, ", peerId : ", peerId);
                                // conversationGetter = this.conversationService.getConversationByBubbleId(convId);
                                conversationGetter = await this.conversationService.getBubbleConversation(bubbleId, peerId, lastModification, lastMessageText, missedIMCounter, null, muted, new Date(), lastMessageSender);
                            }

                            if (!conversationGetter) {
                                return;
                            }

                            await conversationGetter.then(function (conv) {
                                that.logger.log("debug", LOG_ID + "(onConversationManagementMessageReceived) update conversation (" + conv.id + ")");
                                conv.dbId = convDbId;
                                conv.lastModification = lastModification ? new Date(lastModification) : undefined;
                                conv.lastMessageText = lastMessageText;
                                conv.lastMessageSender = lastMessageSender;
                                conv.muted = muted;
                                conv.isFavorite = isFavorite;
                                conv.preload = true;
                                conv.missedCounter = missedIMCounter;
                                // Send conversations update event
                                that.eventEmitter.emit("evt_internal_conversationupdated", conv);
                                //$rootScope.$broadcast("ON_CONVERSATIONS_UPDATED_EVENT", conv);
                            });
                        }

                        if (action === "delete") {
                            that.logger.log("debug", LOG_ID + "(onConversationManagementMessageReceived) conversation not know in cache deleted : ", conversationId);
                            let conversationUnknown = new Conversation(conversationId);
                            if (conversationUnknown) {
                                that.conversationService.removeConversation(conversationUnknown);
                            }
                        }
                    }

                    // Handle mute/unmute room
                    if (node.find("mute") || node.find("unmute")) {
                        let muteElem = node.find("mute");
                        let mute = false;
                        if (muteElem.length) {
                            if (muteElem.text().length) {
                                mute = (muteElem.text() === "true");
                            } else {
                                mute = true;
                            }
                        }
                        let conversationDbId = node.find("mute").attrs.conversation || node.find("unmute").attrs.conversation;
                        let conversation = this.conversationService.getConversationByDbId(conversationDbId);
                        if (conversation) {
                            that.logger.log("debug", LOG_ID + "(onConversationManagementMessageReceived) : mute is changed to " + mute);
                            conversation.muted = mute;
                        }
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onConversationManagementMessageReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onConversationManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onMuteManagementMessageReceived = (node) => {
            try {
                that.logger.log("internal", LOG_ID + "(onMuteManagementMessageReceived) _entering_ : ", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    that.logger.log("debug", LOG_ID + "(onMuteManagementMessageReceived) conversation muted");
                    let conversationId = node.attrs.conversation;
                    let conversation = that.conversationService.getConversationById(conversationId);
                    if (!conversation) {
                        let cs = this.conversationService;
                        let createPromise = conversationId.startsWith("room_") ? cs.getBubbleConversation(conversationId,undefined, undefined, undefined, undefined,undefined,undefined,undefined,undefined) : cs.getOrCreateOneToOneConversation(conversationId);
                        createPromise.then((conv) => {
                            that.eventEmitter.emit("evt_internal_conversationupdated", conv);
                        });
                    } else {
                        that.eventEmitter.emit("evt_internal_conversationupdated", conversation);
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onMuteManagementMessageReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onMuteManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onUnmuteManagementMessageReceived = (node) => {
            try {
                that.logger.log("internal", LOG_ID + "(onUnmuteManagementMessageReceived) _entering_ : ", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    that.logger.log("debug", LOG_ID + "(onUnmuteManagementMessageReceived) conversation unmuted");
                    let conversationId = node.attrs.conversation;
                    let conversation = that.conversationService.getConversationById(conversationId);
                    if (!conversation) {
                        let cs = this.conversationService;
                        let createPromise = conversationId.startsWith("room_") ? cs.getBubbleConversation(conversationId,undefined, undefined, undefined, undefined,undefined,undefined,undefined,undefined) : cs.getOrCreateOneToOneConversation(conversationId);
                        createPromise.then((conv) => {
                            that.eventEmitter.emit("evt_internal_conversationupdated", conv);
                        });
                    } else {
                        that.eventEmitter.emit("evt_internal_conversationupdated", conversation);
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onUnmuteManagementMessageReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onUnmuteManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onFileManagementMessageReceived = async (node) => {
            try {
                that.logger.log("internal", LOG_ID + "(onFileManagementMessageReceived) _entering_ : ", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    let updateConsumption: boolean = false;
                    switch (node.attrs.action) {
                        case "create": {
                            that.logger.log("debug", LOG_ID + "(onFileManagementMessageReceived) file created");

                            let fileNode = node.children[0];
                            let fileid = fileNode.children[0];
                            //.getText() ||  "";

                            let fileDescriptor = this.fileStorageService.getFileDescriptorById(fileid);
                            if (!fileDescriptor) {
                                updateConsumption = true;
                            }

                            await that.fileStorageService.retrieveAndStoreOneFileDescriptor(fileid, true).then(function (fileDesc) {
                                that.logger.log("debug", LOG_ID + "(onFileManagementMessageReceived) fileDescriptor retrieved");
                                if (!fileDesc.previewBlob) {
                                    that.fileServerService.getBlobThumbnailFromFileDescriptor(fileDesc)
                                        .then(function (blob) {
                                            fileDesc.previewBlob = blob;
                                        });
                                }
                            });
                            that.eventEmitter.emit("evt_internal_filecreated", {'fileid': fileid});
                        }
                            break;
                        case "update": {
                            that.logger.log("debug", LOG_ID + "(onFileManagementMessageReceived) file updated");

                            let fileNode = node.children[0];
                            let fileid = fileNode.children[0];
                            //.getText() ||  "";
                            let fileDescriptor = this.fileStorageService.getFileDescriptorById(fileid);
                            if (!fileDescriptor) {
                                updateConsumption = true;
                            }

                            await that.fileStorageService.retrieveAndStoreOneFileDescriptor(fileid, true).then(function (fileDesc) {
                                that.logger.log("debug", LOG_ID + "(onFileManagementMessageReceived) fileDescriptor retrieved");
                                if (!fileDesc.previewBlob) {
                                    that.fileServerService.getBlobThumbnailFromFileDescriptor(fileDesc)
                                        .then(function (blob) {
                                            fileDesc.previewBlob = blob;
                                        });
                                }
                            });
                            that.eventEmitter.emit("evt_internal_fileupdated", {'fileid': fileid});
                        }
                            break;

                        case "delete": {
                            that.logger.log("debug", LOG_ID + "(onFileManagementMessageReceived) file deleted");

                            let fileNode = node.children[0];
                            let fileid = fileNode.children[0];
                            //.getText() ||  "";
                            let fileDescriptor = this.fileStorageService.getFileDescriptorById(fileid);
                            if (fileDescriptor) {
                                //check if we've deleted one of our own files
                                if (fileDescriptor.ownerId === that.userId && fileDescriptor.state !== "deleted") {
                                    updateConsumption = true;
                                }

                                this.fileStorageService.deleteFileDescriptorFromCache(fileid, true);
                            }

                            that.eventEmitter.emit("evt_internal_filedeleted", {'fileid': fileid});
                        }
                            break;
                        default:
                            break;
                    }
                    if (updateConsumption) {
                        this.fileStorageService.retrieveUserConsumption();
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onFileManagementMessageReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onFileManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onThumbnailManagementMessageReceived = (node) => {
            try {
                that.logger.log("internal", LOG_ID + "(onThumbnailManagementMessageReceived) _entering_ : ", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    switch (node.attrs.action) {
                        case "create": {
                            that.logger.log("debug", LOG_ID + "(onThumbnailManagementMessageReceived) file created");

                            let url = node.getChild('url') ? node.getChild('url').children[0] : '';
                            //let fileId = fileNode.children[0];
                            //.getText() ||  "";
                            let mime = node.getChild('mime') ? node.getChild('mime').children[0] : '';
                            let filename = node.getChild('filename') ? node.getChild('filename').children[0] : '';
                            let size = node.getChild('size') ? node.getChild('size').children[0] : '';
                            let md5sum = node.getChild('md5sum') ? node.getChild('md5sum').children[0] : '';
                            let fileid = node.getChild('fileid') ? node.getChild('fileid').children[0] : '';
                            that.eventEmitter.emit("evt_internal_thumbnailcreated", {
                                'url': url,
                                'mime': mime,
                                'filename': filename,
                                'size': size,
                                'md5sum': md5sum,
                                'fileid': fileid
                            });
                        }
                            break;
                        default:
                            break;
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onThumbnailManagementMessageReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onThumbnailManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onReceiptMessageReceived = (msg, stanza) => {
        };

        this.onErrorMessageReceived = (msg, stanza) => {
            try {

                if (stanza.getChild('no-store') != undefined){
                    that.logger.log("error", LOG_ID + "(onErrorMessageReceived) The 'to' of the message can not received the message");
                    let err = {
                        "id": stanza.attrs.id,
                        "body": stanza.getChild('body').text(),
                        "subject": stanza.getChild('subject').text()
                    };
                    that.logger.log("error", LOG_ID + "(onErrorMessageReceived) no-store message setted...");
                    that.logger.log("internalerror", LOG_ID + "(onErrorMessageReceived) failed to send : ", err);
                    that.eventEmitter.emit("evt_internal_onsendmessagefailed", err);
                } else {
                    that.logger.log("error", LOG_ID + "(onErrorMessageReceived) something goes wrong...");
                    that.logger.log("internalerror", LOG_ID + "(onErrorMessageReceived) something goes wrong... : ", msg, util.inspect(stanza));
                    that.eventEmitter.emit("evt_internal_xmpperror", msg);
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onErrorMessageReceived) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(onErrorMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.findAttrs = () => {

        };

        /*
        this.findChildren = (element) => {
            try {
                that.logger.log("debug", LOG_ID + "(findChildren) _entering_");
                that.logger.log("internal", LOG_ID + "(findChildren) _entering_", element);
                that.logger.log("error", LOG_ID + "(findChildren) findChildren element : ", element, " name : ", element.getName());
                let json = {};
                //let result = null;
                let children = element.children;
                if (children.length > 0) {
                    json[element.getName()] = {};
                    let childrenJson = json[element.getName()];
                    children.forEach((elemt) => {
                        // @ts-ignore
                        if (typeof elemt.children === Array) {
                            that.logger.log("error", LOG_ID + "(findChildren)  children.forEach Array : ", element, ", elemt : ", elemt);
                            childrenJson[elemt.getName()] = elemt.children[0];
                        }
                        that.logger.log("error", LOG_ID + "(findChildren)  children.forEach element : ", element, ", elemt : ", elemt);
                        childrenJson[elemt.getName()] = this.findChildren(elemt);
                    });
                    return json;
                } else {
                    that.logger.log("error", LOG_ID + "(findChildren)  No children element : ", element);
                    return element.getText();
                }
                //return result;
            } catch (err) {
                that.logger.log("error", LOG_ID + "(findChildren) CATCH Error !!! : ", err);
            }
        };

         */

        this.onCloseMessageReceived = (msg, stanza) => {

        };
    }


}

export {ConversationEventHandler};
module.exports.ConversationEventHandler = ConversationEventHandler;
