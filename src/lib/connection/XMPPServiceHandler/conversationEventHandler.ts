"use strict";
import {xu} from "../../common/XMPPUtils";
import {ConversationsService} from "../../services/ConversationsService";
import {Conversation} from "../../common/models/Conversation";
import {Element} from "ltx";
import {logEntryExit} from "../../common/Utils";
import {FileStorageService} from "../../services/FileStorageService";
import {FileServerService} from "../../services/FileServerService";
import {Bubble} from "../../common/models/Bubble";
import {BubblesService} from "../../services/BubblesService";
import {ContactsService} from "../../services/ContactsService";
import {Message} from "../../common/models/Message";
import {GeoLoc} from "../../common/models/GeoLoc";
import {GenericHandler} from "./GenericHandler";

export {};


//const GenericHandler = require("./GenericHandler");

const util = require('util');

const xml = require("@xmpp/xml");

const prettydata = require("../pretty-data").pd;

const LOG_ID = "XMPP/HNDL/EVENT/CONV - ";

const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";

@logEntryExit(LOG_ID)
class ConversationEventHandler extends GenericHandler {
    public MESSAGE_CHAT: any;
    public MESSAGE_GROUPCHAT: any;
    public MESSAGE_WEBRTC: any;
    public MESSAGE_MANAGEMENT: any;
    public MESSAGE_ERROR: any;
    public MESSAGE_HEADLINE: any;
    public MESSAGE_CLOSE: any;
    private _conversationService: ConversationsService;
    public findAttrs: any;
    public findChildren: any;
    private _fileStorageService: FileStorageService;
    private _fileServerService: FileServerService;
    private _bubbleService: BubblesService;
    private _contactsService : ContactsService;

    static getClassName(){ return 'ConversationEventHandler'; }
    getClassName(){ return ConversationEventHandler.getClassName(); }

    constructor(xmppService, conversationService, fileStorageService, fileServerService, bubbleService, contactsService) {
        super(xmppService);

        this.MESSAGE_CHAT = "jabber:client.message.chat";
        this.MESSAGE_GROUPCHAT = "jabber:client.message.groupchat";
        this.MESSAGE_WEBRTC = "jabber:client.message.webrtc";
        this.MESSAGE_MANAGEMENT = "jabber:client.message.management";
        this.MESSAGE_ERROR = "jabber:client.message.error";
        this.MESSAGE_HEADLINE = "jabber:client.message.headline";
        this.MESSAGE_CLOSE = "jabber:client.message.headline";

        this._conversationService = conversationService;
        this._fileStorageService = fileStorageService;
        this._fileServerService = fileServerService;
        this._bubbleService = bubbleService;
        this._contactsService = contactsService;

        let that = this;

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

    }

    async onChatMessageReceived (msg, stanza: Element) {
        let that = this;
        try {
            that.logger.log("internal", LOG_ID + "(onChatMessageReceived) _entering_ : ", msg, "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
            let content = "";
            let lang = "";
            let alternativeContent : Array<{ "message": string, "type": string }> = [];
            let subject = "";
            let event = undefined;
            let eventJid = "";
            let hasATextMessage = false;
            let oob = null;
            let geoloc = null;
            let messageType = stanza.attrs.type;
            let timestamp = new Date();
            let replaceMessageId = null;
            let attention = false;
            let confOwnerId = null;
            let confOwnerDisplayName = null;
            let confOwnerJid = null;
            let conference = false;
            let conferencebubbleId = undefined;
            let conferencebubbleJid = undefined;
            let answeredMsgId = undefined;
            let answeredMsgStamp = undefined;
            let answeredMsgDate = undefined;
            let urgency = "std";
            let urgencyAck : boolean = false;
            let urgencyHandler : any = undefined;
            let voiceMessage = undefined;
            let isForwarded : boolean = false;
            let forwardedMsg : any = undefined;
            let historyIndex : string;
            let attachedMsgId : string;
            let attachIndex : number;
            let attachNumber : number;

            let fromJid = xu.getBareJIDFromFullJID(stanza.attrs.from);
            let resource = xu.getResourceFromFullJID(stanza.attrs.from);
            let toJid = stanza.attrs.to;
            let id = stanza.attrs.id;
            let children = stanza.children;

            let mentions = [];
            
            voiceMessage = stanza.find("voicemessage").text();
            historyIndex = id;
            children.forEach((node) => {
                switch (node.getName()) {
                    case "sent":
                        if (node.attrs.xmlns === "urn:xmpp:carbons:2") {
                            that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - CC message 'sent' received");
                            let forwarded = node.children[0];
                            if (forwarded && forwarded.getName() === "forwarded") {
                                let message = forwarded.children[0];
                                if (message && message.getName() === "message") {
                                    fromJid = xu.getBareJIDFromFullJID(message.attrs.from);
                                    resource = xu.getResourceFromFullJID(message.attrs.from);
                                    toJid = message.attrs.to;
                                    id = message.attrs.id;
                                    let childs = message.children;
                                    if (childs) {
                                        let timestamp = message.getChildren("archived").length &&
                                        message.getChildren("archived")[0] &&
                                        message.getChildren("archived")[0].attrs.stamp ?
                                            new Date(message.getChildren("archived")[0].attrs.stamp) : new Date();

                                        let answeredMsgId = stanza.find("answeredMsg").text();
                                        let answeredMsgStamp = undefined;
                                        let answeredMsgDate = undefined;
                                        if (answeredMsgId) {
                                            answeredMsgStamp = stanza.find("answeredMsg").attrs["stamp"];
                                            answeredMsgDate = answeredMsgStamp ? new Date(parseInt(answeredMsgStamp)).toISOString() : undefined;
                                        }
                                        that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - CC message  answeredMsgId : ", answeredMsgId, ", answeredMsgStamp : ", answeredMsgStamp, ", answeredMsgDate : ", answeredMsgDate);

                                        childs.forEach(async (nodeChild) => {
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
                                                    "date": timestamp,
                                                    "answeredMsg": undefined,
                                                    "answeredMsgId": answeredMsgId,
                                                    "answeredMsgDate": answeredMsgDate,
                                                    "answeredMsgStamp": answeredMsgStamp
                                                };

                                                let conversationId = data.toJid;

                                                if (answeredMsgId) {
                                                    //that.logger.log("debug", LOG_ID + "(_onMessageReceived) with answeredMsg message, answeredMsgId : ", answeredMsgId, ", conversation.id: ", conversation.id);
                                                    if (conversationId) {
                                                        data.answeredMsg = await that._conversationService.getOneMessageFromConversationId(conversationId, answeredMsgId, answeredMsgStamp); //conversation.getMessageById(answeredMsgId);
                                                    }
                                                }

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
                                    fromJid = xu.getBareJIDFromFullJID(message.attrs.from);
                                    resource = xu.getResourceFromFullJID(message.attrs.from);
                                    toJid = message.attrs.to;
                                    id = message.attrs.id;
                                    let childs = message.children;
                                    if (childs) {
                                        let timestamp = message.getChildren("archived").length &&
                                        message.getChildren("archived")[0] &&
                                        message.getChildren("archived")[0].attrs.stamp ?
                                            new Date(message.getChildren("archived")[0].attrs.stamp) : new Date();

                                        let answeredMsgId = stanza.find("answeredMsg").text();
                                        let answeredMsgStamp = undefined;
                                        let answeredMsgDate = undefined;
                                        if (answeredMsgId) {
                                            answeredMsgStamp = stanza.find("answeredMsg").attrs["stamp"];
                                            answeredMsgDate = answeredMsgStamp ? new Date(parseInt(answeredMsgStamp)).toISOString() : undefined;
                                        }
                                        that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - CC message  answeredMsgId : ", answeredMsgId, ", answeredMsgStamp : ", answeredMsgStamp, ", answeredMsgDate : ", answeredMsgDate);

                                        childs.forEach(async function (nodeChild) {
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
                                                    "date": timestamp,
                                                    "answeredMsg": undefined,
                                                    "answeredMsgId": answeredMsgId,
                                                    "answeredMsgDate": answeredMsgDate,
                                                    "answeredMsgStamp": answeredMsgStamp
                                                };

                                                let conversationId = data.fromJid;

                                                if (answeredMsgId) {
                                                    //that.logger.log("debug", LOG_ID + "(_onMessageReceived) with answeredMsg message, answeredMsgId : ", answeredMsgId, ", conversation.id: ", conversation.id);
                                                    if (conversationId) {
                                                        data.answeredMsg = await that._conversationService.getOneMessageFromConversationId(conversationId, answeredMsgId, answeredMsgStamp); //conversation.getMessageById(answeredMsgId);
                                                    }
                                                }

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
                        that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - content : ", "***");
                        if (node.attrs["xml:lang"]) { // in <body>
                            lang = node.attrs["xml:lang"];
                        } else if (node.parent.attrs["xml:lang"]) { // in <message>
                            lang = node.parent.attrs["xml:lang"];
                        } else {
                            lang = "en";
                        }
                        that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - lang : ", lang);
                        hasATextMessage = (!(!content || content === ''));
                        break;
                    case "answeredMsg":
                        answeredMsgId = node.getText();
                        answeredMsgStamp = node.attrs["stamp"];
                        answeredMsgDate = answeredMsgStamp ? new Date(parseInt(answeredMsgStamp) ).toISOString() : undefined;
                        that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - answeredMsgId : ", answeredMsgId, ", answeredMsgStamp : ", answeredMsgStamp, ", answeredMsgDate : ", answeredMsgDate);
                        break;
                    case "content":
                        alternativeContent.push({
                            "message": node.getText(),
                            "type": node.getAttr("type")
                        });
                        hasATextMessage = true;
                        break;
                    case "attach-to":
                        if (node.attrs.xmlns === "urn:xmpp:message-attaching:1") {
                            attachedMsgId = node.attrs.id;
                        } else {
                            that.logger.log("warn", LOG_ID + "(onChatMessageReceived) message - unknown attachedMsgId : ", attachedMsgId);
                        }
                        break;
                    case "forwarded":
                        if (node.attrs.xmlns === "urn:xmpp:forward:0") {
                            isForwarded = true;
                            let msg = node.getChild("message");
                            forwardedMsg = {
                                "origMsgId" : msg.attrs.id,
                                "fromJid": msg.attrs.from,                                
                                "to" : msg.attrs.to, 
                                "type" : msg.attrs.type,
                                "body" : msg.getChild("body").text(),
                                "lang" : msg.getChild("body").attrs["xml:lang"]
                            };
                            that.logger.log("internal", LOG_ID + "(onChatMessageReceived) message - forwardedMsg : ", forwardedMsg);
                        }
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
                        if (that.xmppService.shouldSendReadReceipt || (messageType === TYPE_GROUPCHAT && xu.getResourceFromFullJID(stanza.attrs.from) === that.fullJid)) {

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
                                conference = true;
                                conferencebubbleId = node.attrs.thread;
                                conferencebubbleJid = node.attrs.jid;
                                that.logger.log("info", LOG_ID + "(onChatMessageReceived) conference received");
                            }
                                break;
                            case "jabber:x:oob" : {
                                attachIndex = node.attrs.index;
                                attachNumber = node.attrs.count;
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
                    case "y": {
                        let xmlns = node.attrs.xmlns;
                        switch (xmlns) {
                            case "jabber:y:owner":
                                confOwnerId = node.attrs.userid;
                                confOwnerDisplayName = node.attrs.displayname;
                                confOwnerJid = node.attrs.jid;
                                that.logger.log("info", LOG_ID + "(onChatMessageReceived) y owner received, y : ", node, ": confOwnerId : ", confOwnerId, ", confOwnerDisplayName : ", confOwnerDisplayName, " confOwnerJid : ", confOwnerJid);
                                break;
                            default:
                                that.logger.log("info", LOG_ID + "(onChatMessageReceived) y received");
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
                    case "geoloc": {
                        let datum = node.find("datum").text();
                        let lat = node.find("lat").text();
                        let lon = node.find("lon").text();
                        let altitude = node.find("altitude").text();
                        geoloc = {
                            datum,
                            "latitude": lat,
                            "longitude": lon,
                            "altitude": altitude
                        };
                    }
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
                            let conversation = that._conversationService.getConversationById(conversationJid);
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
                        let conversation = this._conversationService.getConversationById(conversationId);

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
                    case "mention": {
                            // stanzaData.mentions = [];
                            const mentionJidElem = node.find("jid");
                            if (Array.isArray(mentionJidElem)) {
                                mentionJidElem.forEach((content) => {

                                    const mention = {};
                                    mention['jid'] = content.text();
                                    mention['pos'] = parseInt(content.attr("pos"), 10);
                                    mention['size'] = parseInt(content.attr("size"), 10);

                                    if (mention['jid'] && mention['size']) {
                                        mentions.push(mention);
                                    }
                                    that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - mention : ", mention);
                                });
                            } else {
                                const mention = {};
                                mention['jid'] = mentionJidElem.text();
                                mention['pos'] = parseInt(mentionJidElem.attr("pos"), 10);
                                mention['size'] = parseInt(mentionJidElem.attr("size"), 10);

                                if (mention['jid'] && mention['size']) {
                                    mentions.push(mention);
                                }
                                that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - mention : ", mention);
                            }
                        }
                        break;
                    case "headers": {
                        const headersElem = node.find("headers");
                        if (headersElem && headersElem.length > 0) {
                            const urgencyElem = headersElem.find("header");
                            if (urgencyElem.length===1) {
                                if (urgencyElem.attrs.name=='Urgency') {
                                    urgency = urgencyElem.text();
                                }
                            } else {
                                for (let i = 0; i < urgencyElem.length; i++) {
                                    if (urgencyElem[i].attrs.name=='Urgency') {
                                        urgency = urgencyElem.text();
                                    }
                                }
                            }
                            urgencyAck = true;
                        }
                    }
                        break;
                    default:
                        that.logger.log("error", LOG_ID + "(onChatMessageReceived) unmanaged chat message node : ", node.getName());
                        that.logger.log("internalerror", LOG_ID + "(onChatMessageReceived) unmanaged chat message node : ", node.getName(), "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
                        break;
                }
            });

            switch (event) {
                case "invitation": {
                    let invitation = {
                        event: "invitation",
                        bubbleId: conferencebubbleId,
                        bubbleJid: conferencebubbleJid,
                        fromJid: fromJid,
                        resource: resource
                    };
                    that.logger.log("info", LOG_ID + "(onChatMessageReceived) conference invitation received");
                    that.eventEmitter.emit("evt_internal_invitationreceived", invitation);
                }
                    break;
                case "conferenceAdd": {
                    that.logger.log("info", LOG_ID + "(onChatMessageReceived) conference start received");
                    let bubble = await that._bubbleService.getBubbleByJid(conferencebubbleJid, true);
                    that.eventEmitter.emit("evt_internal_bubbleconferencestartedreceived", bubble);
                }
                    break;
                case "conferenceRemove":
                    that.logger.log("info", LOG_ID + "(onChatMessageReceived) conference stop received");
                    let bubble = await that._bubbleService.getBubbleByJid(conferencebubbleJid, true);
                    that.eventEmitter.emit("evt_internal_bubbleconferencestoppedreceived", bubble);
                    break;
                default:
                    that.logger.log("internal", LOG_ID + "(onChatMessageReceived) no treatment of event ", msg, " : ",  "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza, " so default."); //, this.eventEmitter
            }

            let fromBubbleJid = "";
            let fromBubbleUserJid = "";
            if (stanza.attrs.type === TYPE_GROUPCHAT) {
                fromBubbleJid = xu.getBareJIDFromFullJID(stanza.attrs.from);
                fromBubbleUserJid = xu.getResourceFromFullJID(stanza.attrs.from);
                resource = xu.getResourceFromFullJID(fromBubbleUserJid);
            }

            if ((messageType === TYPE_GROUPCHAT && fromBubbleUserJid !== that.fullJid) || (messageType === TYPE_CHAT && fromJid !== that.fullJid)) {
                that.logger.log("info", LOG_ID + "(onChatMessageReceived) message - chat message received");

                timestamp = stanza.getChildren("archived").length &&
                stanza.getChildren("archived")[0] &&
                stanza.getChildren("archived")[0].attrs.stamp ?
                        new Date(stanza.getChildren("archived")[0].attrs.stamp):new Date();

                //Message.create(stanza.attrs.id,timestamp,fromJid,)

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
                    "geoloc": geoloc,
                    "voiceMessage": voiceMessage,
                    "date": timestamp,
                    "fromBubbleJid": null,
                    "fromBubbleUserJid": null,
                    "event": null,
                    "eventJid": null,
                    "originalMessageReplaced": null,
                    "attention": undefined,
                    subject,
                    "confOwnerId": undefined,
                    "confOwnerDisplayName": undefined,
                    "confOwnerJid": undefined,
                    "answeredMsg": undefined,
                    "answeredMsgId": answeredMsgId,
                    "answeredMsgDate": answeredMsgDate,
                    "answeredMsgStamp": answeredMsgStamp,
                    urgency,
                    urgencyAck,
                    urgencyHandler,
                    "isMarkdown": false,
                    mentions,
                    isForwarded,
                    forwardedMsg,
                    historyIndex,
                    attachedMsgId,
                    attachIndex,
                    attachNumber,
                };

                if (stanza.attrs.type===TYPE_GROUPCHAT) {
                    data.fromBubbleJid = fromBubbleJid;
                    data.fromBubbleUserJid = fromBubbleUserJid;
                    data.fromJid = xu.getRoomJIDFromFullJID(stanza.attrs.from);

                    if (event) {
                        data.event = event;
                        data.eventJid = eventJid;
                        data.isEvent = true;
                    }
                    if (attention) {
                        data.attention = attention;
                    }

                    if (mentions.length > 0) {
                        data.mentions = mentions;
                    }
                    if (confOwnerId) {
                        data.confOwnerId = confOwnerId;
                    }
                    if (confOwnerDisplayName) {
                        data.confOwnerDisplayName = confOwnerDisplayName;
                    }
                    if (confOwnerJid) {
                        data.confOwnerJid = confOwnerJid;
                    }

                }

                let outgoingMessage = that._contactsService.isUserContactJid(fromJid);
                let conversationId = outgoingMessage ? data.toJid:(stanza.attrs.type===TYPE_GROUPCHAT ? fromBubbleJid:data.fromJid);

                if (answeredMsgId) {

                    let conversation = that._conversationService.getConversationById(conversationId);
                    that.logger.log("debug", LOG_ID + "(onChatMessageReceived) with answeredMsg message, answeredMsgId : ", answeredMsgId, ", conversation.id: ", conversation.id);
                    if (conversation) {
                        data.answeredMsg = await that._conversationService.getOneMessageFromConversationId(conversation.id, answeredMsgId, answeredMsgStamp); //conversation.getMessageById(answeredMsgId);
                    }
                }

                if (replaceMessageId) {
                    //data.replaceMessageId = replaceMessageId;
                    let conversation = that._conversationService.getConversationById(conversationId);
                    if (conversation) {
                        data.originalMessageReplaced = conversation.getMessageById(replaceMessageId);
                    } else {
                        that.logger.log("warn", LOG_ID + "(onChatMessageReceived) This is a replace msg but no conversation found for the original msg id. So store an empty msg to avoid the lost of information.", replaceMessageId);
                        data.originalMessageReplaced = {};
                        data.originalMessageReplaced.id = replaceMessageId;
                    }
                    data.originalMessageReplaced.replacedByMessage = data;
                } else {
                    if (!hasATextMessage && !isForwarded) {
                        that.logger.log("debug", LOG_ID + "(_onMessageReceived) with no message text, so ignore it! hasATextMessage : ", hasATextMessage);
                        return;
                    } else {
                        that.logger.log("internal", LOG_ID + "(_onMessageReceived) with message : ", data, ", hasATextMessage : ", hasATextMessage);
                    }
                }

                data.isMarkdown = false;
                if (data.alternativeContent && data.alternativeContent.length > 0) {
                    data.isMarkdown = (data.alternativeContent[0]).type==="text/markdown";
                }
                ;

                //let dataMessage : Message = await Message.create(data.id, data.type, data.date, data.fromJid, data.side, data.content, null, data.answeredMsg, data.answererdMsgId,data.answeredMsgDate, data.answeredMsgStamp, data.);
                //let dataMessage : Message = await Message.create(data.id, data.type, data.date, data.fromJid, Message.Side.LEFT, data.content, null, data.answeredMsg, data.answeredMsgId,data.answeredMsgDate, data.answeredMsgStamp, data.isMarkdown, data.subject, data.attention, data.geoloc, data.alternativeContent);
                let dataMessage: Message = await Message.create(
                        null,
                        null, 
                        data.id,
                        data.type,
                        data.date,
                        data.fromJid,
                        Message.Side.LEFT,                        
                        null,
                        Message.ReceiptStatus.NONE,
                        data.isMarkdown, 
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
                that.logger.log("internal", LOG_ID + "(_onMessageReceived) with dataMessage Message : ", dataMessage);
                dataMessage.updateMessage(data);
                that.logger.log("internal", LOG_ID + "(_onMessageReceived) with dataMessage updated Message : ", dataMessage);

                that._onMessageReceived(conversationId, dataMessage);
                //that._onMessageReceived(conversationId, data);
            } else {
                that.logger.log("debug", LOG_ID + "(onChatMessageReceived) We are the sender, so ignore it.");
                that.logger.log("internal", LOG_ID + "(onChatMessageReceived) We are the sender, so ignore it : ", "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza );
            }
        } catch (err) {
            that.logger.log("error", LOG_ID + "(onChatMessageReceived) CATCH Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(onChatMessageReceived) CATCH Error !!! : ", err);
        }
    };

    async _onMessageReceived (conversationId, data) {
        let that = this;
        try {
            that.logger.log("internal", LOG_ID + "(_onMessageReceived) _entering_ : ", conversationId, data);
            let conversation = that._conversationService.getConversationById(conversationId);
            let cs = this._conversationService;
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
                if (data.event === "conferenceAdd") {
                    that.logger.log("internal", LOG_ID + "(_onMessageReceived) conversation found in cache by Id : ", conversationId, ", for new message : ", data, ", but needed to be updated because event conferenceAdd on bubble received.");
                    conversation.bubble = await that._bubbleService.getBubbleByJid(conversationId, true);
                }

                // data.conversation =  conversationId.startsWith("room_") ? await cs.getBubbleConversation(conversationId) : await cs.getOrCreateOneToOneConversation(conversationId);
                // data.conversation.addMessage(data);
                // that.logger.log("internal", LOG_ID + "(_onMessageReceived) conversation found in cache by Id : ", conversationId, ", for new message : ", data, ", but needed to be updated because event conferenceAdd on bubble received." );
                // */
                that.logger.log("internal", LOG_ID + "(_onMessageReceived) conversation found in cache by Id : ", conversationId, ", for new message : ", data);
                data.conversation = conversation;
                data.conversation.addMessage(data);
                /*if (data.conversation.messages.length === 0 || !data.conversation.messages.find((elmt) => { if (elmt.id === data.id) { return elmt; } })) {
                    data.conversation.messages.push(data);
                } // */
                that.eventEmitter.emit("evt_internal_onmessagereceived", data);
                that.eventEmitter.emit("evt_internal_conversationupdated", conversation);
                that.logger.log("internal", LOG_ID + "(_onMessageReceived) cs.getConversations() : ", cs.getConversations());
            }
        } catch (err) {
            that.logger.log("error", LOG_ID + "(_onMessageReceived) CATCH Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(_onMessageReceived) CATCH Error !!! : ", err);
        }
    }

    onRoomAdminMessageReceived (msg, stanza) {
    }

    onFileMessageReceived (msg, stanza) {
    }

    onWebRTCMessageReceived (msg, stanza) {
        // No treatment, dedicated to Call Log later
    }

    onManagementMessageReceived (msg, stanza) {
        let that = this;
        try {
            that.logger.log("internal", LOG_ID + "(onManagementMessageReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
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
                    case "userinvite":
                        // treated also in conversationEventHandler
                        // treated also in invitationEventHandler
                        break;
                    case "openinvite":
                        // treated in invitationEventHandler
                        break;
                    case "favorite":
                        // treated in favoriteEventHandler
                        break;
                    case "notification":
                        // treated in alertEventHandler
                        break;
                    case "roomscontainer":
                        that.onRoomsContainerManagementMessageReceived(node);
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

    onRoomManagementMessageReceived (node) {
        let that = this;
        try {
            that.logger.log("internal", LOG_ID + "(onRoomManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
            if (node.attrs.xmlns === "jabber:iq:configuration") {

                // Affiliation changed (my own or for a member)
                if (node.attrs.status) {
                    if (node.attrs.userjid === xu.getBareJIDFromFullJID(that.fullJid)) {
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

    onUserSettingsManagementMessageReceived (node) {
        let that = this;
        try {
            that.logger.log("debug", LOG_ID + "(onUserSettingsManagementMessageReceived) _entering_");
            that.logger.log("internal", LOG_ID + "(onUserSettingsManagementMessageReceived) _entering_", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
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

    onUserInviteManagementMessageReceived (node) {
        let that = this;
        try {
            that.logger.log("debug", LOG_ID + "(onUserInviteManagementMessageReceived) _entering_");
            that.logger.log("internal", LOG_ID + "(onUserInviteManagementMessageReceived) _entering_", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
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

    onGroupManagementMessageReceived (node) {
        let that = this;
        try {
            that.logger.log("internal", LOG_ID + "(onGroupManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
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

    async onConversationManagementMessageReceived (node: Element) {
        let that = this;
        try {
            that.logger.log("internal", LOG_ID + "(onConversationManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                let conversationId = node.attrs.id;
                let conversation = this._conversationService.getConversationById(conversationId);
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
                            this._conversationService.removeConversation(conversation);
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
                        let convId = xu.getBareJIDFromFullJID(node.find("peer").text());
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
                            that.logger.log("debug", LOG_ID + "(onConversationManagementMessageReceived) create, find conversation, user. convDbId : ", convDbId, ", peerId : ", peerId);
                            conversationGetter = this._conversationService.getOrCreateOneToOneConversation(convId);
                        } else {
                            let bubbleId = convId;
                            that.logger.log("debug", LOG_ID + "(onConversationManagementMessageReceived) create, find conversation, bubbleId : " + bubbleId + ", convDbId : ", convDbId, ", peerId : ", peerId);
                            // conversationGetter = this.conversationService.getConversationByBubbleId(convId);
                            conversationGetter = this._conversationService.getBubbleConversation(bubbleId, peerId, lastModification, lastMessageText, missedIMCounter, null, muted, new Date(), lastMessageSender);
                        }

                        if (!conversationGetter) {
                            return;
                        }

                        await conversationGetter.then(function (conv) {
                            if (!conv) {
                                that.logger.log("internal", LOG_ID + "(onConversationManagementMessageReceived) conversation not found! will not raise event.");
                                return;
                            }
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
                            that._conversationService.removeConversation(conversationUnknown);
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
                    let conversation = this._conversationService.getConversationByDbId(conversationDbId);
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

    onMuteManagementMessageReceived (node) {
        let that = this;
        try {
            that.logger.log("internal", LOG_ID + "(onMuteManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                that.logger.log("debug", LOG_ID + "(onMuteManagementMessageReceived) conversation muted");
                let conversationId = node.attrs.conversation;
                let conversation = that._conversationService.getConversationById(conversationId);
                if (!conversation) {
                    let cs = this._conversationService;
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

    onUnmuteManagementMessageReceived (node) {
        let that = this;
        try {
            that.logger.log("internal", LOG_ID + "(onUnmuteManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                that.logger.log("debug", LOG_ID + "(onUnmuteManagementMessageReceived) conversation unmuted");
                let conversationId = node.attrs.conversation;
                let conversation = that._conversationService.getConversationById(conversationId);
                if (!conversation) {
                    let cs = this._conversationService;
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

    async onFileManagementMessageReceived (node) {
        let that = this;
        try {
            that.logger.log("internal", LOG_ID + "(onFileManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
            if (node.attrs.xmlns === "jabber:iq:configuration") {
                let updateConsumption: boolean = false;
                switch (node.attrs.action) {
                    case "create": {
                        that.logger.log("debug", LOG_ID + "(onFileManagementMessageReceived) file created");

                        let fileNode = node.children[0];
                        let fileid = fileNode.children[0];
                        //.getText() ||  "";

                        let fileDescriptor = this._fileStorageService.getFileDescriptorById(fileid);
                        if (!fileDescriptor) {
                            updateConsumption = true;
                        }

                        await that._fileStorageService.retrieveAndStoreOneFileDescriptor(fileid, true).then(function (fileDesc) {
                            that.logger.log("debug", LOG_ID + "(onFileManagementMessageReceived) fileDescriptor retrieved");
                            if (!fileDesc.previewBlob) {
                                that._fileServerService.getBlobThumbnailFromFileDescriptor(fileDesc)
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
                        let fileDescriptor = this._fileStorageService.getFileDescriptorById(fileid);
                        if (!fileDescriptor) {
                            updateConsumption = true;
                        }

                        await that._fileStorageService.retrieveAndStoreOneFileDescriptor(fileid, true).then(function (fileDesc) {
                            that.logger.log("debug", LOG_ID + "(onFileManagementMessageReceived) fileDescriptor retrieved");
                            if (!fileDesc.previewBlob) {
                                that._fileServerService.getBlobThumbnailFromFileDescriptor(fileDesc)
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
                        let fileDescriptor = this._fileStorageService.getFileDescriptorById(fileid);
                        if (fileDescriptor) {
                            //check if we've deleted one of our own files
                            if (fileDescriptor.ownerId === that.userId && fileDescriptor.state !== "deleted") {
                                updateConsumption = true;
                            }

                            this._fileStorageService.deleteFileDescriptorFromCache(fileid, true);
                        }

                        that.eventEmitter.emit("evt_internal_filedeleted", {'fileid': fileid});
                    }
                        break;
                    default:
                        break;
                }
                if (updateConsumption) {
                    this._fileStorageService.retrieveUserConsumption();
                }
            }
        } catch (err) {
            that.logger.log("error", LOG_ID + "(onFileManagementMessageReceived) CATCH Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(onFileManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };

    onThumbnailManagementMessageReceived (node) {
        let that = this;
        try {
            that.logger.log("internal", LOG_ID + "(onThumbnailManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()) : node);
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

    async onRoomsContainerManagementMessageReceived(node) {
        let that = this;
        try {
            that.logger.log("internal", LOG_ID + "(onRoomsContainerManagementMessageReceived) _entering_ : ", "\n", node.root ? prettydata.xml(node.root().toString()):node);
            let xmlNodeStr = node ? node.toString():"<xml></xml>";
            let jsonNode = await that.getJsonFromXML(xmlNodeStr);
            that.logger.log("debug", LOG_ID + "(onRoomsContainerManagementMessageReceived) JSON : ", jsonNode);
            let roomscontainer = jsonNode["roomscontainer"];
            that.logger.log("debug", LOG_ID + "(onRoomsContainerManagementMessageReceived) roomscontainer : ", roomscontainer);
            let containerId = roomscontainer["$attrs"]["containerid"];
            let containerName = roomscontainer.$attrs.name;
            let containerDescription = roomscontainer.$attrs.description?roomscontainer.$attrs.description:"";
            let bubblesIdAdded = roomscontainer["added"]? roomscontainer["added"].roomid : undefined;
            let bubblesIdRemoved = roomscontainer["removed"]? roomscontainer["removed"].roomid : undefined;

            
            
            if (roomscontainer.$attrs.xmlns==="jabber:iq:configuration") {
                let action = roomscontainer.$attrs.action;
                that.logger.log("debug", LOG_ID + "(onRoomsContainerManagementMessageReceived) action.");
                that.eventEmitter.emit("evt_internal_roomscontainer", {action, containerName, containerId, containerDescription, bubblesIdAdded, bubblesIdRemoved});
                /*
                switch (roomscontainer.$attrs.action) {
                    case "create": {
                        that.logger.log("debug", LOG_ID + "(onRoomsContainerManagementMessageReceived) create action.");
                        that.eventEmitter.emit("evt_internal_bubblescontainercreated", {containerName, containerId, bubblesIdAdded, bubblesIdRemoved});
                    }
                        break;
                    case "update": {
                        that.logger.log("debug", LOG_ID + "(onRoomsContainerManagementMessageReceived) update action.");
                        that.eventEmitter.emit("evt_internal_bubblescontainerupdated",  {containerName, containerId, bubblesIdAdded, bubblesIdRemoved});
                    }
                        break;
                    case "delete": {
                        that.logger.log("debug", LOG_ID + "(onRoomsContainerManagementMessageReceived) delete action.");
                        that.eventEmitter.emit("evt_internal_bubblescontainerdeleted", {containerName, containerId, bubblesIdAdded, bubblesIdRemoved});
                    }
                        break;
                    default: {
                        that.logger.log("debug", LOG_ID + "(onRoomsContainerManagementMessageReceived) unknown action.");
                    }
                        break;
                }
                // */
            } // */
            /*
            if (node.attrs.xmlns==="jabber:iq:configuration") {
                switch (node.attrs.action) {
                    case "create": {
                        that.logger.log("debug", LOG_ID + "(onRoomsContainerManagementMessageReceived) create action.");
                        let add = node.getChild('added');
                        let removed = node.getChild('removed');
                        that.eventEmitter.emit("evt_internal_bubblescontainercreated", {});
                    }
                        break;
                    case "update": {
                        that.logger.log("debug", LOG_ID + "(onRoomsContainerManagementMessageReceived) update action.");
                        that.eventEmitter.emit("evt_internal_bubblescontainerupdated", {});
                    }
                        break;
                    case "delete": {
                        that.logger.log("debug", LOG_ID + "(onRoomsContainerManagementMessageReceived) delete action.");
                        that.eventEmitter.emit("evt_internal_bubblescontainerdeleted", {});
                    }
                        break;
                    default: {
                        that.logger.log("debug", LOG_ID + "(onRoomsContainerManagementMessageReceived) unknown action.");
                    }
                        break;
                }
            } // */
        } catch (err) {
            that.logger.log("error", LOG_ID + "(onRoomsContainerManagementMessageReceived) CATCH Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(onRoomsContainerManagementMessageReceived) CATCH Error !!! : ", err);
        }
    };

    onReceiptMessageReceived (msg, stanza){
    }

    onErrorMessageReceived (msg, stanza) {
        let that = this;
        try {

            if (stanza.getChild('no-store') != undefined){
                that.logger.log("error", LOG_ID + "(onErrorMessageReceived) The message could not be delivered.");
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
                that.logger.log("internalerror", LOG_ID + "(onErrorMessageReceived) something goes wrong... : ", msg, "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
                that.eventEmitter.emit("evt_internal_xmpperror", msg);
            }
        } catch (err) {
            that.logger.log("error", LOG_ID + "(onErrorMessageReceived) CATCH Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(onErrorMessageReceived) CATCH Error !!! : ", err);
        }
    }

    onCloseMessageReceived (msg, stanza) {

    }

}

export {ConversationEventHandler};
module.exports.ConversationEventHandler = ConversationEventHandler;
