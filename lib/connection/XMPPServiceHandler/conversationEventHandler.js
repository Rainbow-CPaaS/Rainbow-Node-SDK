"use strict";

const XMPPUtils = require("../../common/XMPPUtils");
const GenericHandler = require("./genericHandler");
const Conversation = require("../../common/models/Conversation");
const util = require('util');

const xml = require("@xmpp/xml");

const LOG_ID = "XMPP/HNDL - ";

const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";

class ConversationEventHandler extends GenericHandler {

    constructor(xmppService, conversationService) {
        super( xmppService);

        this.MESSAGE_CHAT = "jabber:client.message.chat";
        this.MESSAGE_GROUPCHAT = "jabber:client.message.groupchat";
        this.MESSAGE_WEBRTC = "jabber:client.message.webrtc";
        this.MESSAGE_MANAGEMENT = "jabber:client.message.management";
        this.MESSAGE_ERROR = "jabber:client.message.error";
        this.MESSAGE_HEADLINE = "jabber:client.message.headline";
        this.MESSAGE_CLOSE = "jabber:client.message.headline";
        
        this.conversationService = conversationService;

        let that = this;

        this.onChatMessageReceived = (msg, stanza) => {
            try {
                that.logger.log("debug", LOG_ID + "(onChatMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onChatMessageReceived) _entering_", msg, stanza);
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

                let fromJid = XMPPUtils.getBareJIDFromFullJID(stanza.attrs.from);
                let resource = XMPPUtils.getResourceFromFullJID(stanza.attrs.from);
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
                                        fromJid = XMPPUtils.getBareJIDFromFullJID(message.attrs.from);
                                        resource = XMPPUtils.getResourceFromFullJID(message.attrs.from);
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
                                        fromJid = XMPPUtils.getBareJIDFromFullJID(message.attrs.from);
                                        resource = XMPPUtils.getResourceFromFullJID(message.attrs.from);
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
                                that.eventEmitter.emit("rainbow_onreceipt", receipt);
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
                            that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - someone is " + node.getName());
                            that.eventEmitter.emit("rainbow_onchatstate", chatstate);
                            break;
                        case "archived":
                            break;
                        case "stanza-id":
                            break;
                        case "subject":
                            subject = node.getText();
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
                            hasATextMessage = true;
                            break;
                        case "content":
                            alternativeContent.push({
                                "message": node.getText(),
                                "type": node.getAttr("type")
                            });
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

                            that.logger.log("info", LOG_ID + "(onChatMessageReceived) answered - send receipt 'received'", stanzaReceived.root().toString());
                            that.xmppClient.send(stanzaReceived);

                            //Acknowledge 'read'
                            if (that.shouldSendReadReceipt || (messageType === TYPE_GROUPCHAT && XMPPUtils.getResourceFromFullJID(stanza.attrs.from) === that.fullJid)) {

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
                                that.logger.log("info", LOG_ID + "(onChatMessageReceived) answered - send receipt 'read'", stanzaRead.root().toString());
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
                                    that.eventEmitter.emit("rainbow_invitationreceived", invitation);
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
                                    that.eventEmitter.emit("rainbow_allmessagedremovedfromconversationreceived", conversation);
                                }
                            }
                        }
                            break;
                        default:
                            that.logger.log("error", LOG_ID + "(onChatMessageReceived) unmanaged chat message node ", node.getName(), stanza);
                            break;
                    }
                });

                let fromBubbleJid = "";
                let fromBubbleUserJid = "";
                if (stanza.attrs.type === TYPE_GROUPCHAT) {
                    fromBubbleJid = XMPPUtils.getBareJIDFromFullJID(stanza.attrs.from);
                    fromBubbleUserJid = XMPPUtils.getResourceFromFullJID(stanza.attrs.from);
                    resource = XMPPUtils.getResourceFromFullJID(fromBubbleUserJid);
                }

                if (!hasATextMessage) {
                    that.logger.log("debug", LOG_ID + "(_onMessageReceived) with no message text, so ignore it!");
                    return;
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
                        "date": timestamp
                    };

                    if (stanza.attrs.type === TYPE_GROUPCHAT) {
                        data.fromBubbleJid = fromBubbleJid;
                        data.fromBubbleUserJid = fromBubbleUserJid;
                        data.fromJid = XMPPUtils.getRoomJIDFromFullJID(stanza.attrs.from);

                        if (event) {
                            data.event = event;
                            data.eventJid = eventJid;
                            data.isEvent = true;
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
                    }


                    this._onMessageReceived(conversationId, data);
                } else {
                    that.logger.log("debug", LOG_ID + "(onChatMessageReceived) We are the sender, so ignore it.");
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onChatMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this._onMessageReceived = ( conversationId, data) => {
            try {
                that.logger.log("debug", LOG_ID + "(_onMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(_onMessageReceived) _entering_", conversationId, data);
                let conversation = that.conversationService.getConversationById(conversationId);
                if (!conversation) {
                    let cs = this.conversationService;
                    let createPromise = conversationId.startsWith("room_") ? cs.getBubbleConversation(conversationId) : cs.getOrCreateOneToOneConversation(conversationId);
                    createPromise.then((conv) => {
                        data.conversation = conv;
                        data.conversation.addMessage(data);
                        /*if (data.conversation.messages.length === 0 || !data.conversation.messages.find((elmt) => { if (elmt.id === data.id) { return elmt; } })) {
                            data.conversation.messages.push(data);
                        } // */
                        this.eventEmitter.emit("rainbow_onmessagereceived", data);
                        that.eventEmitter.emit("rainbow_onconversationupdated", {"conversationId": conversation.id});
                    });
                } else {
                    data.conversation = conversation;
                    data.conversation.addMessage(data);
                    /*if (data.conversation.messages.length === 0 || !data.conversation.messages.find((elmt) => { if (elmt.id === data.id) { return elmt; } })) {
                        data.conversation.messages.push(data);
                    } // */
                    this.eventEmitter.emit("rainbow_onmessagereceived", data);
                    that.eventEmitter.emit("rainbow_onconversationupdated", {"conversationId": conversation.id});
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(_onMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onRoomAdminMessageReceived = (msg, stanza) => {};

        this.onFileMessageReceived = (msg, stanza) => {};

        this.onWebRTCMessageReceived = (msg, stanza) => {
            // No treatment, dedicated to Call Log later
        };

        this.onManagementMessageReceived = (msg, stanza) => {
            try {
                that.logger.log("debug", LOG_ID + "(onManagementMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onManagementMessageReceived) _entering_", msg, stanza);
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
                        case "channel":
                            that.onChannelManagementMessageReceived(node);
                            break;
                        default:
                            that.logger.log("error", LOG_ID + "(onManagementMessageReceived) unmanaged management message node " + node.getName());
                            break;
                    }
                });
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onRoomManagementMessageReceived = (node) => {
            try {
                that.logger.log("debug", LOG_ID + "(onRoomManagementMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onRoomManagementMessageReceived) _entering_", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {

                    // Affiliation changed (my own or for a member)
                    if (node.attrs.status) {
                        if (node.attrs.userjid === XMPPUtils.getBareJIDFromFullJID(that.fullJid)) {
                            that.logger.log("debug", LOG_ID + "(onRoomManagementMessageReceived) bubble management received for own.");
                            that.eventEmitter.emit("rainbow_ownaffiliationchanged", {
                                "bubbleId": node.attrs.roomid,
                                "bubbleJid": node.attrs.roomjid,
                                "userJid": node.attrs.userjid,
                                "status": node.attrs.status,
                            });
                        } else {
                            that.logger.log("debug", LOG_ID + "(onRoomManagementMessageReceived) bubble affiliation received");
                            that.eventEmitter.emit("rainbow_affiliationchanged", {
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
                        that.eventEmitter.emit("rainbow_customdatachanged", {
                            "bubbleId": node.attrs.roomid,
                            "bubbleJid": node.attrs.roomjid,
                            "customData": node.attrs.customData
                        });
                    }
                    // Topic changed
                    if (node.attrs.topic) {
                        that.logger.log("debug", LOG_ID + "(onRoomManagementMessageReceived) bubble topic changed");
                        that.eventEmitter.emit("rainbow_topicchanged", {
                            "bubbleId": node.attrs.roomid,
                            "bubbleJid": node.attrs.roomjid,
                            "topic": node.attrs.topic
                        });
                    }
                    // Name changed
                    if (node.attrs.name) {
                        that.logger.log("debug", LOG_ID + "(onRoomManagementMessageReceived) bubble name changed");
                        that.eventEmitter.emit("rainbow_namechanged", {
                            "bubbleId": node.attrs.roomid,
                            "bubbleJid": node.attrs.roomjid,
                            "name": node.attrs.name
                        });
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onRoomManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onUserSettingsManagementMessageReceived = (node ) => {
            try {
                that.logger.log("debug", LOG_ID + "(onUserSettingsManagementMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onUserSettingsManagementMessageReceived) _entering_", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    switch (node.attrs.action) {
                        case "update":
                            that.logger.log("debug", LOG_ID + "(onUserSettingsManagementMessageReceived) usersettings updated");
                            that.eventEmitter.emit("rainbow_usersettingschanged");
                            break;
                        default:
                            break;
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onUserSettingsManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onUserInviteManagementMessageReceived = (node ) => {
            try {
                that.logger.log("debug", LOG_ID + "(onUserInviteManagementMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onUserInviteManagementMessageReceived) _entering_", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    switch (node.attrs.action) {
                        case "create":
                            if (node.attrs.type === "received" && node.attrs.status === "pending") {
                                that
                                    .logger
                                    .log("debug", LOG_ID + "(onUserInviteManagementMessageReceived) user invite received");
                                that
                                    .eventEmitter
                                    .emit("rainbow_userinvitereceived", {invitationId: node.attrs.id});
                            }
                            break;
                        case "update":
                            if (node.attrs.type === "sent" && node.attrs.status === "canceled") {
                                that
                                    .logger
                                    .log("debug", LOG_ID + "(onUserInviteManagementMessageReceived) user invite canceled");
                                that
                                    .eventEmitter
                                    .emit("rainbow_userinvitecanceled", {invitationId: node.attrs.id});
                            } else if (node.attrs.type === "sent" && node.attrs.status === "accepted") {
                                that
                                    .logger
                                    .log("debug", LOG_ID + "(onUserInviteManagementMessageReceived) user invite accepted");
                                that
                                    .eventEmitter
                                    .emit("rainbow_userinviteaccepted", {invitationId: node.attrs.id});
                            }
                            break;
                        default:
                            break;
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onUserInviteManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onGroupManagementMessageReceived = (node) => {
            try {
                that.logger.log("debug", LOG_ID + "(onGroupManagementMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onGroupManagementMessageReceived) _entering_", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    let action = node.attrs.action;
                    let scope = node.attrs.scope;

                    if (action === "create" && scope === "group") {
                        that
                            .logger
                            .log("debug", LOG_ID + "(onGroupManagementMessageReceived) group created");
                        that
                            .eventEmitter
                            .emit("rainbow_groupcreated", {"groupId": node.attrs.id});
                    } else if (action === "create" && scope === "user" && node.attrs.userId) {
                        that
                            .logger
                            .log("debug", LOG_ID + "(onGroupManagementMessageReceived) user added in group");
                        that
                            .eventEmitter
                            .emit("rainbow_useraddedingroup", {
                                "groupId": node.attrs.id,
                                "userId": node.attrs.userId
                            });
                    } else if (action === "delete" && scope === "group") {
                        that
                            .logger
                            .log("debug", LOG_ID + "(onGroupManagementMessageReceived) group deleted");
                        that
                            .eventEmitter
                            .emit("rainbow_groupdeleted", {"groupId": node.attrs.id});
                    } else if (action === "delete" && scope === "user" && node.attrs.userId) {
                        that
                            .logger
                            .log("debug", LOG_ID + "(onGroupManagementMessageReceived) user removed from group");
                        that
                            .eventEmitter
                            .emit("rainbow_userremovedfromgroup", {
                                "groupId": node.attrs.id,
                                "userId": node.attrs.userId
                            });
                    } else if (action === "update" && scope === "group") {
                        if (node.attrs.name || node.attrs.comment || node.attrs.isFavorite) {
                            that
                                .logger
                                .log("debug", LOG_ID + "(onGroupManagementMessageReceived) group updated");
                            that
                                .eventEmitter
                                .emit("rainbow_groupupdated", {"groupId": node.attrs.id});
                        }
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onGroupManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onConversationManagementMessageReceived = (node) => {
            try {
                that.logger.log("debug", LOG_ID + "(onConversationManagementMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onConversationManagementMessageReceived) _entering_", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    let action = node.attrs.action;

                    if (action === "delete") {
                        that
                            .logger
                            .log("debug", LOG_ID + "(onConversationManagementMessageReceived) conversation deleted");
                        let conversation = that.conversationService.getConversationById(node.attrs.id);
                        if (conversation) {
                            that.conversationService.removeConversation(conversation);
                        }
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onConversationManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onMuteManagementMessageReceived = (node) => {
            try {
                that.logger.log("debug", LOG_ID + "(onMuteManagementMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onMuteManagementMessageReceived) _entering_", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    that
                        .logger
                        .log("debug", LOG_ID + "(onMuteManagementMessageReceived) conversation muted");
                    that
                        .eventEmitter
                        .emit("rainbow_conversationupdated", {"conversationId": node.attrs.conversation});
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onMuteManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onUnmuteManagementMessageReceived = (node) => {
            try {
                that.logger.log("debug", LOG_ID + "(onUnmuteManagementMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onUnmuteManagementMessageReceived) _entering_", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    that
                        .logger
                        .log("debug", LOG_ID + "(onUnmuteManagementMessageReceived) conversation unmuted");
                    that
                        .eventEmitter
                        .emit("rainbow_conversationupdated", {"conversationId": node.attrs.conversation});
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onUnmuteManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onFileManagementMessageReceived = (node) => {
            try {
                that.logger.log("debug", LOG_ID + "(onFileManagementMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onFileManagementMessageReceived) _entering_", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    switch (node.attrs.action) {
                        case "create": {
                            that.logger.log("debug", LOG_ID + "(onFileManagementMessageReceived) file created");

                            let fileNode = node.children[0];
                            let fileid = fileNode.children[0];
                            //.getText() ||  "";

                            that.eventEmitter.emit("rainbow_filecreated", {'fileid': fileid});
                        }
                            break;
                        case "update": {
                            that.logger.log("debug", LOG_ID + "(onFileManagementMessageReceived) file updated");

                            let fileNode = node.children[0];
                            let fileid = fileNode.children[0];
                            //.getText() ||  "";

                            that.eventEmitter.emit("rainbow_fileupdated", {'fileid': fileid});
                        }
                            break;

                        case "delete": {
                            that.logger.log("debug", LOG_ID + "(onFileManagementMessageReceived) file deleted");

                            let fileNode = node.children[0];
                            let fileid = fileNode.children[0];
                            //.getText() ||  "";

                            that.eventEmitter.emit("rainbow_filedeleted", {'fileid': fileid});
                        }
                            break;
                        default:
                            break;
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onFileManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onThumbnailManagementMessageReceived = (node) => {
            try {
                that.logger.log("debug", LOG_ID + "(onThumbnailManagementMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onThumbnailManagementMessageReceived) _entering_", node);
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
                            that.eventEmitter.emit("rainbow_thumbnailcreated", {
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
                that.logger.log("error", LOG_ID + "(onThumbnailManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onChannelManagementMessageReceived = (node) => {
            try {
                that.logger.log("debug", LOG_ID + "(onChannelManagementMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onChannelManagementMessageReceived) _entering_", node);
                if (node.attrs.xmlns === "jabber:iq:configuration") {
                    switch (node.attrs.action) {
                        case "add": {
                            that.logger.log("debug", LOG_ID + "(onChannelManagementMessageReceived) channel created");
                            let channelid = node.attrs.channelid;
                            that.eventEmitter.emit("rainbow_channelcreated", {'id': channelid});
                        }
                            break;
                        case "delete": {
                            that.logger.log("debug", LOG_ID + "(onChannelManagementMessageReceived) channel deleted");
                            let channelid = node.attrs.channelid;
                            that.eventEmitter.emit("rainbow_channeldeleted", {'id': channelid});
                        }
                            break;
                        case "update": {
                            that.logger.log("debug", LOG_ID + "(onChannelManagementMessageReceived) channel updated");
                            let channelid = node.attrs.channelid;

                            //let json = XMPPUtils.getJson(node);
                            //let json = {};
                            //json = that.findChildren(node);

                            that.eventEmitter.emit("rainbow_channelupdated", {'id': channelid}); //, 'obj' : json
                        }
                            break;

                        default: {
                            let channelid = node.attrs.channelid;
                            that.logger.log("info", LOG_ID + "(onChannelManagementMessageReceived) channel management event unknown : " + node.attrs.action + " for channel " + channelid);
                        }
                            break;
                    }
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onChannelManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };


        this.onReceiptMessageReceived = (msg, stanza) => {};

        this.onErrorMessageReceived = (msg, stanza) => {
            try {
                that.logger.log("debug", LOG_ID + "(onErrorMessageReceived) _entering_");
                that.logger.log("error", LOG_ID + "(onErrorMessageReceived) something goes wrong...", msg, stanza);
                that.eventEmitter.emit("rainbow_onerror", msg);
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onChannelManagementMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.findAttrs = () => {

        };

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

        this.onHeadlineMessageReceived = (msg, stanza) => {
            try {
                that.logger.log("debug", LOG_ID + "(onHeadlineMessageReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onHeadlineMessageReceived) _entering_", msg, stanza);
                that.logger.log("info", LOG_ID + "(onHeadlineMessageReceived) channel message received");

                that.logger.log("info", LOG_ID + "(onHeadlineMessageReceived) channel message received");

                let eventNode = stanza.children[0];
                if (!eventNode) {
                    that.logger.log("error", LOG_ID + "(onHeadlineMessageReceived) ERROR in onHeadlineMessageReceived eventNode is empty");
                    that.logger.log("internal", LOG_ID + ", stanza: " + stanza);
                    that.logger.log("internal", LOG_ID + util.inspect(stanza));
                    return;
                }
                let items = eventNode.children[0];
                if (!items) {
                    that.logger.log("error", LOG_ID + "(onHeadlineMessageReceived) ERROR in onHeadlineMessageReceived items is empty");
                    that.logger.log("internal", LOG_ID + util.inspect(eventNode));
                    that.logger.log("internal", LOG_ID + ", stanza: " + stanza);
                    return;
                }
                let item = items.children[0];
                if (!item) {
                    that.logger.log("error", LOG_ID + "(onHeadlineMessageReceived) ERROR in onHeadlineMessageReceived item is empty");
                    that.logger.log("internal", LOG_ID + util.inspect(items));
                    that.logger.log("internal", LOG_ID + ", stanza: " + stanza);
                    return;
                }
                let entry = item.children[0];
                if (!entry) {
                    that.logger.log("debug", LOG_ID + "(onHeadlineMessageReceived) onHeadlineMessageReceived entry is empty");
                    that.logger.log("internal", LOG_ID + util.inspect(item));
                    that.logger.log("internal", LOG_ID + ", stanza: " + stanza);
                    //return;
                }

                switch (item.name) {
                    case "retract": {
                        let messageId = item.attrs ? item.attrs.id || null : null;
                        if (messageId === null) {
                            that.logger.log("error", LOG_ID + "(onHeadlineMessageReceived) channel retract received, but id is empty. So ignored.");
                        } else {
                            let message = {};
                            message.messageId = item.attrs.id;
                            that.logger.log("debug", LOG_ID + "(onHeadlineMessageReceived) channel retract received, for messageId " + message.messageId);
                            that.eventEmitter.emit("rainbow_onchannelmessagedeletedreceived", message);
                        }
                    }
                        break;
                    case "item": {
                        if (entry) {

                            let message = {
                                "messageId": item.attrs.id,
                                "channelId": entry.attrs.channelId,
                                "fromJid": entry.attrs.from,
                                "message": entry.getChild("message") ? entry.getChild("message").getText() || "" : "",
                                "title": entry.getChild("title") ? entry.getChild("title").getText() || "" : "",
                                "url": entry.getChild("url") ? entry.getChild("url").getText() || "" : "",
                                "date": new Date(entry.attrs.timestamp),
                                "images": new Array()
                            };
                            let images = entry.getChildren("images");
                            if (Array.isArray(images)) {
                                images.forEach((image) => {
                                    //that.logger.log("info", LOG_ID + "(handleXMPPConnection) channel entry images.", image);
                                    let id = image.getChild("id") ? image.getChild("id").getText() || null : null;
                                    if (id === null) {
                                        that.logger.log("error", LOG_ID + "(onHeadlineMessageReceived) channel image entry received, but image id empty. So ignored.");
                                    } else {
                                        message.images.push(id);
                                    }
                                });
                            }

                            that.eventEmitter.emit("rainbow_onchannelmessagereceived", message);
                        } else {
                            that.logger.log("error", LOG_ID + "(onHeadlineMessageReceived) channel entry received, but empty. It can not be parsed, so ignored.", stanza);
                        }
                    }
                        break;
                    default: {
                        that.logger.log("debug", LOG_ID + "(onHeadlineMessageReceived) channel unknown event " + item.name + " received");
                    }
                        break;

                } // */
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onHeadlineMessageReceived) CATCH Error !!! : ", err);
            }
        };

        this.onCloseMessageReceived = (msg, stanza) => {

        };
    }
}

module.exports = ConversationEventHandler;