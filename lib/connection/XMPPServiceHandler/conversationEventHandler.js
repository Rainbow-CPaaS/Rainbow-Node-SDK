"use strict";

const XMPPUtils = require("../../common/XMPPUtils");
const GenericHandler = require("./genericHandler");
const Conversation = require("../../common/models/Conversation");

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
            var content = "";
            var lang = "";
            var alternativeContent = [];
            var subject = "";
            var event = "";
            var eventJid = "";
            var hasATextMessage = false;
            var oob = null;
            var messageType = stanza.attrs.type;

            var fromJid = XMPPUtils.getBareJIDFromFullJID(stanza.attrs.from);
            var resource = XMPPUtils.getResourceFromFullJID(stanza.attrs.from);
            var toJid = stanza.attrs.to;
            var id = stanza.attrs.id;
            var children = stanza.children;
            children.forEach((node) => {
                switch (node.getName()) {
                    case "sent":
                        if (node.attrs.xmlns === "urn:xmpp:carbons:2") {
                            that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - CC message 'sent' received");
                            var forwarded = node.children[0];
                            if (forwarded && forwarded.getName() === "forwarded") {
                                var message = forwarded.children[0];
                                if (message && message.getName() === "message") {
                                    fromJid = XMPPUtils.getBareJIDFromFullJID(message.attrs.from);
                                    resource = XMPPUtils.getResourceFromFullJID(message.attrs.from);
                                    toJid = message.attrs.to;
                                    id = message.attrs.id;
                                    var childs = message.children;
                                    if (childs) {
                                        childs.forEach((nodeChild) => {
                                            if (nodeChild.getName() === "body") {
                                                that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - CC message 'sent' of type chat received ");

                                                var data = {
                                                    "fromJid": fromJid,
                                                    "resource": resource,
                                                    "toJid": toJid,
                                                    "type": messageType,
                                                    "content": nodeChild.getText(),
                                                    "id": id,
                                                    "lang": nodeChild.attrs["xml:lang"],
                                                    "cc": true,
                                                    "cctype": "sent",
                                                    "isEvent": false
                                                };

                                                that.eventEmitter.emit("rainbow_onmessagereceived", data);

                                            }
                                        });
                                    }
                                }
                            }
                        }
                        break;
                    case "received": 
                        if (node.attrs.xmlns === "urn:xmpp:carbons:2") {
                            that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - CC message 'sent' received");
                            var forwarded = node.children[0];
                            if (forwarded && forwarded.getName() === "forwarded") {
                                var message = forwarded.children[0];
                                if (message && message.getName() === "message") {
                                    fromJid = XMPPUtils.getBareJIDFromFullJID(message.attrs.from);
                                    resource = XMPPUtils.getResourceFromFullJID(message.attrs.from);
                                    toJid = message.attrs.to;
                                    id = message.attrs.id;
                                    var childs = message.children;
                                    if (childs) {
                                        childs.forEach(function (nodeChild) {
                                            if (nodeChild.getName() === "body") {
                                                that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - CC message 'sent' of type chat received ");

                                                var data = {
                                                    "fromJid": fromJid,
                                                    "resource": resource,
                                                    "toJid": toJid,
                                                    "type": messageType,
                                                    "content": nodeChild.getText(),
                                                    "id": id,
                                                    "lang": nodeChild.attrs["xml:lang"],
                                                    "cc": true,
                                                    "cctype": "sent",
                                                    "isEvent": false
                                                };

                                                that.eventEmitter.emit("rainbow_onmessagereceived", data);

                                            }
                                        });
                                    }
                                }
                            }
                        }
                        else {
                            var receipt = {
                                event: node.attrs.event,
                                entity: node.attrs.entity,
                                type: messageType,
                                id: node.attrs.id,
                                fromJid: fromJid,
                                resource: resource
                            };
                            that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - receipt received");
                            that.eventEmitter.emit("rainbow_onreceipt", receipt);
                        }
                        break;
                    case "active":
                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - someone is active");
                        break;
                    case "inactive":
                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - someone is inactive");
                        break;
                    case "composing":
                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - someone is writing");
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
                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - content", "***");
                        if (node.attrs["xml:lang"]) { // in <body>
                            lang = node.attrs["xml:lang"];
                        } else if (node.parent.attrs["xml:lang"]) { // in <message>
                            lang = node.parent.attrs["xml:lang"];
                        } else {
                            lang = "en";
                        }
                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - lang", lang);
                        hasATextMessage = true;
                        break;
                    case "content":
                        alternativeContent.push( {
                            "message": node.getText(),
                            "type": node.getAttr("type")
                        });
                        break;
                    case "request":
                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - asked for receipt");
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
                            
                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) answered - send receipt 'received'", stanzaReceived.root().toString());
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
                            that.logger.log("info", LOG_ID + "(handleXMPPConnection) answered - send receipt 'read'", stanzaRead.root().toString());
                            that.xmppClient.send(stanzaRead);
                        }
                        break;
                    case "recording":
                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - recording message");
                        // TODO
                        break;
                    case "x":
                        {
                            let xmlns = node.attrs.xmlns;
                            switch ( xmlns) {
                               case "jabber:x:conference": {
                                    let invitation = {
                                        event: "invitation",
                                        bubbleId: node.attrs.thread,
                                        bubbleJid: node.attrs.jid,
                                        fromJid: fromJid,
                                        resource: resource
                                    };
                                    that.logger.log("info", LOG_ID + "(handleXMPPConnection) invitation received");
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
                                    that.logger.log("info", LOG_ID + "(handleXMPPConnection) oob received");
                                    break;
                                }
                                default:
                                    break;
                            }
                            break;
                        }
                    default:
                        that.logger.log("error", LOG_ID + "(handleXMPPConnection) unmanaged chat message node " + node.getName());
                        break;
                }
            });

            var fromBubbleJid = "";
            var fromBubbleUserJid = "";
            if (stanza.attrs.type === TYPE_GROUPCHAT) {
                fromBubbleJid = XMPPUtils.getBareJIDFromFullJID(stanza.attrs.from);
                fromBubbleUserJid = XMPPUtils.getResourceFromFullJID(stanza.attrs.from);
                resource = XMPPUtils.getResourceFromFullJID(fromBubbleUserJid);
            }

            if (hasATextMessage && ((messageType === TYPE_GROUPCHAT && fromBubbleUserJid !== that.fullJid) || (messageType === TYPE_CHAT && fromJid !== that.fullJid))) {
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - chat message received");

                var data = {
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
                    "oob": oob
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

                let conversation = that.conversationService.getConversationById(conversationId);
                if ( !conversation) {
                    let cs = this.conversationService;
                    let createPromise = conversationId.startsWith("room_") ? cs.getBubbleConversation(conversationId) : cs.getOrCreateOneToOneConversation(conversationId);
                    createPromise.then((conv) => {
                        data.conversation = conv;
                        that.eventEmitter.emit("rainbow_onmessagereceived", data);
                    });
                } else {
                    data.conversation = conversation;
                    that.eventEmitter.emit("rainbow_onmessagereceived", data);
                }
            }
        };

        this.onRoomAdminMessageReceived = (msg, stanza) => {};

        this.onFileMessageReceived = (msg, stanza) => {};

        this.onWebRTCMessageReceived = (msg, stanza) => {
            // No treatment, dedicated to Call Log later
        };

        this.onManagementMessageReceived = (msg, stanza) => {
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
                    default:
                        that.logger.log("error", LOG_ID + "(handleXMPPConnection) unmanaged management message node " + node.getName());   
                        break;
                }
            });
        };

        this.onRoomManagementMessageReceived = (node) => {
            if (node.attrs.xmlns === "jabber:iq:configuration") {

                // Affiliation changed (my own or for a member)
                if (node.attrs.status) {
                    if (node.attrs.userjid === XMPPUtils.getBareJIDFromFullJID(that.fullJid)) {
                        that.logger.log("debug", LOG_ID + "(handleXMPPConnection) bubble management received for own.");
                        that.eventEmitter.emit("rainbow_ownaffiliationchanged", {
                            "bubbleId": node.attrs.roomid,
                            "bubbleJid": node.attrs.roomjid,
                            "userJid": node.attrs.userjid,
                            "status": node.attrs.status,
                        });
                    } else {
                        that.logger.log("debug", LOG_ID + "(handleXMPPConnection) bubble affiliation received");
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
                    that.logger.log("debug", LOG_ID + "(handleXMPPConnection) bubble custom-data changed");
                    that.eventEmitter.emit("rainbow_customdatachanged", {
                        "bubbleId": node.attrs.roomid,
                        "bubbleJid": node.attrs.roomjid,
                        "customData": node.attrs.customData
                    });
                }
                // Topic changed
                else if (node.attrs.topic) {
                    that.logger.log("debug", LOG_ID + "(handleXMPPConnection) bubble topic changed");
                    that.eventEmitter.emit("rainbow_topicchanged", {
                        "bubbleId": node.attrs.roomid,
                        "bubbleJid": node.attrs.roomjid,
                        "topic": node.attrs.topic
                    });
                }
                // Name changed
                else if (node.attrs.name) {
                    that.logger.log("debug", LOG_ID + "(handleXMPPConnection) bubble name changed");
                    that.eventEmitter.emit("rainbow_namechanged", {
                        "bubbleId": node.attrs.roomid,
                        "bubbleJid": node.attrs.roomjid,
                        "name": node.attrs.name
                    });
                }
            }
        };

        this.onUserSettingsManagementMessageReceived = (node ) => {
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                switch (node.attrs.action) {
                    case "update":
                        that.logger.log("debug", LOG_ID + "(handleXMPPConnection) usersettings updated");
                        that.eventEmitter.emit("rainbow_usersettingschanged");
                        break;
                    default:
                        break;
                }                                    
            }
        };

        this.onUserInviteManagementMessageReceived = (node ) => {
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                switch (node.attrs.action) {
                    case "create":
                        if (node.attrs.type === "received" && node.attrs.status === "pending") {
                            that
                                .logger
                                .log("debug", LOG_ID + "(handleXMPPConnection) user invite received");
                            that
                                .eventEmitter
                                .emit("rainbow_userinvitereceived", {invitationId: node.attrs.id});
                        }
                        break;
                    case "update":
                        if (node.attrs.type === "sent" && node.attrs.status === "canceled") {
                            that
                                .logger
                                .log("debug", LOG_ID + "(handleXMPPConnection) user invite canceled");
                            that
                                .eventEmitter
                                .emit("rainbow_userinvitecanceled", {invitationId: node.attrs.id});
                        } else if (node.attrs.type === "sent" && node.attrs.status === "accepted") {
                            that
                                .logger
                                .log("debug", LOG_ID + "(handleXMPPConnection) user invite accepted");
                            that
                                .eventEmitter
                                .emit("rainbow_userinviteaccepted", {invitationId: node.attrs.id});
                        }
                        break;
                    default:
                        break;
                }
            }
        };

        this.onGroupManagementMessageReceived = (node) => {
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                var action = node.attrs.action;
                var scope = node.attrs.scope;

                if (action === "create" && scope === "group") {
                    that
                        .logger
                        .log("debug", LOG_ID + "(handleXMPPConnection) group created");
                    that
                        .eventEmitter
                        .emit("rainbow_groupcreated", {"groupId": node.attrs.id});
                } else if (action === "create" && scope === "user" && node.attrs.userId) {
                    that
                        .logger
                        .log("debug", LOG_ID + "(handleXMPPConnection) user added in group");
                    that
                        .eventEmitter
                        .emit("rainbow_useraddedingroup", {
                            "groupId": node.attrs.id,
                            "userId": node.attrs.userId
                        });
                } else if (action === "delete" && scope === "group") {
                    that
                        .logger
                        .log("debug", LOG_ID + "(handleXMPPConnection) group deleted");
                    that
                        .eventEmitter
                        .emit("rainbow_groupdeleted", {"groupId": node.attrs.id});
                } else if (action === "delete" && scope === "user" && node.attrs.userId) {
                    that
                        .logger
                        .log("debug", LOG_ID + "(handleXMPPConnection) user removed from group");
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
                            .log("debug", LOG_ID + "(handleXMPPConnection) group updated");
                        that
                            .eventEmitter
                            .emit("rainbow_groupupdated", {"groupId": node.attrs.id});
                    }
                }
            }
        };

        this.onConversationManagementMessageReceived = (node) => {
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                var action = node.attrs.action;

                if (action === "delete") {
                    that
                        .logger
                        .log("debug", LOG_ID + "(handleXMPPConnection) conversation deleted");
                        let conversation = that.conversationService.getConversationById(node.attrs.id);
                        if ( conversation ) {
                            that.conversationService.removeConversation(conversation);
                        }
                }
            }
        };

        this.onMuteManagementMessageReceived = (node) => {
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                that
                    .logger
                    .log("debug", LOG_ID + "(handleXMPPConnection) conversation muted");
                that
                    .eventEmitter
                    .emit("rainbow_conversationupdated", {"conversationId": node.attrs.conversation});
            }
        };

        this.onUnmuteManagementMessageReceived = (node) => {
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                that
                    .logger
                    .log("debug", LOG_ID + "(handleXMPPConnection) conversation unmuted");
                that
                    .eventEmitter
                    .emit("rainbow_conversationupdated", {"conversationId": node.attrs.conversation});
            }
        };

        this.onReceiptMessageReceived = (msg, stanza) => {};

        this.onErrorMessageReceived = (msg, stanza) => {
            that.logger.log("error", LOG_ID + "(handleXMPPConnection) something goes wrong...");
        };

        this.onHeadlineMessageReceived = (msg, stanza) => {
            that.logger.log("info", LOG_ID + "(handleXMPPConnection) channel message received");

            let eventNode = stanza.children[0];
            let items = eventNode.children[0];
            let item = items.children[0];
            let entry = item.children[0];
            
            let message = {
                "messageId": item.attrs.id,
                "channelId": entry.attrs.channelId,
                "fromJid": entry.attrs.from,
                "message": entry.getChild("message").getText() || "",
                "title": entry.getChild("title").getText() ||  "",
                "url": entry.getChild("url").getText() ||  "",
                "date": new Date(entry.attrs.timestamp)
            };

            that.eventEmitter.emit("rainbow_onchannelmessagereceived", message);
        };

        this.onCloseMessageReceived = (msg, stanza) => {

        };
    }
}

module.exports = ConversationEventHandler;