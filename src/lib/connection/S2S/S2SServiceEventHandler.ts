"use strict";

import {InvitationEventHandler} from "../XMPPServiceHandler/invitationEventHandler";

export {};


import {XMPPUTils} from "../../common/XMPPUtils";

import {logEntryExit} from "../../common/Utils";
import {rejects} from "assert";
import {RESTService} from "../RESTService";
import {ContactsService} from "../../services/ContactsService";
import {Logger} from "../../common/Logger";
import EventEmitter = NodeJS.EventEmitter;
import {Contact} from "../../common/models/Contact";
import {Conversation} from "../../common/models/Conversation";
import {ConversationsService} from "../../services/ConversationsService";
import {Bubble} from "../../common/models/Bubble";
import {BubblesService} from "../../services/BubblesService";
import {Core} from "../../Core";

const util = require('util');

const xml = require("@xmpp/xml");

const LOG_ID = "S2S/HNDL - ";

const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";

@logEntryExit(LOG_ID)
class S2SServiceEventHandler {
    private _logger: Logger;
    private _eventEmitter: EventEmitter;
    private _rest: RESTService;
    private callbackAbsolutePath: any;
    private _contacts: ContactsService;
    private _bulles: BubblesService;
    private jid_im: any;
    private jid_password: any;
    private userId: any;
    private fullJid: any;
    private jid_tel: any;
    private jid: any;
    private xmppUtils: XMPPUTils;
    private _conversations: ConversationsService;
    private shouldSendReadReceipt: boolean;

    constructor(_im, _application, _eventEmitter, _logger, _hostCallback) {
        this._logger = _logger;
        this._eventEmitter = _eventEmitter;
        this.shouldSendReadReceipt = _im.sendReadReceipt;
        this.callbackAbsolutePath = _hostCallback;
        this.xmppUtils = XMPPUTils.getXMPPUtils();

    }

    setAccount(account) {
        let that = this;
        that.jid_im = account.jid_im;
        that.jid_tel = account.jid_tel;
        that.jid_password = account.jid_password;
        that.userId = account.id;
        that.jid = account.jid_im;
    }

    handleS2SEvent(event) {
        let that = this;

        if (event === undefined) {
            return;
        }

        let body = event.body;
        let methodHttp = event.method;
        let baseUrl = event.baseUrl;
        let originalUrl = event.originalUrl;
        let requestedPath = originalUrl;

        that._logger.log("internal", LOG_ID + "(handleS2SEvent) *************************************************");
        that._logger.log("internal", LOG_ID + "(handleS2SEvent) received an S2S EVENT : ");
        that._logger.log("internal", LOG_ID + "(handleS2SEvent) METHOD : ", methodHttp);
        that._logger.log("internal", LOG_ID + "(handleS2SEvent) BASELURL : ", baseUrl);
        that._logger.log("internal", LOG_ID + "(handleS2SEvent) ORIGINALURL : ", originalUrl);
        that._logger.log("internal", LOG_ID + "(handleS2SEvent) EVENT BODY : ", that._logger.colors.events(body));
        that._logger.log("internal", LOG_ID + "(handleS2SEvent) *************************************************");

        if (String.prototype.toUpperCase.call(methodHttp + "") != "POST") {
            that._logger.log("error", LOG_ID + "(handleS2SEvent) Don't manage this request - Invalid HttpVerb - HttpVerb:[", methodHttp, "] - Path:[host : ", event.headers.host, ", path : ", requestedPath, "]");
            return false;
        }
        if (that.callbackAbsolutePath && that.callbackAbsolutePath.indexOf(event.headers.host) == -1) {
            that._logger.log("error", LOG_ID + "(handleS2SEvent) Don't manage this request - Invalid path - HttpVerb:[", methodHttp, "] - Path:[host : ", event.headers.host, ", path : ", requestedPath, "]");
            return false;
        }

        if (requestedPath === "/connection") {
            // that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParseConnectionCallback(content)");
            return that.ParseConnectionCallback(body);
        } else if (requestedPath === "/presence") {
            // that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParsePresenceCallback(content)");
            return that.ParsePresenceCallback(body);
        } else if (requestedPath === "/chat-state") {
            // that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParseChatStateCallback(content)");
            return that.ParseChatStateCallback(body);
        } else if (requestedPath === "/receipt") {
            //that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParseReceiptCallback(content)");
            return that.ParseReceiptCallback(body);
        } else if (requestedPath === "/all-receipt") {
            //that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParseAllReceiptCallback(content)");
            return that.ParseAllReceiptCallback(body);
        } else if (requestedPath === "/conversation") {
            //that.logger.log("internal", LOG_ID + "(handleS2SEvent) TODO: return ParseConversationCallback(content)");
            return that.ParseConversationCallback(body);
        } else if (requestedPath === "/room-invite") {
            //that.logger.log("internal", LOG_ID + "(handleS2SEvent) TODO: return ParseRoomInviteCallback(content)");
            return that.ParseRoomInviteCallback(body);
        } else if (requestedPath === "/room-member") {
            //that.logger.log("internal", LOG_ID + "(handleS2SEvent) TODO: return ParseRoomMemberCallback(content)");
            return that.ParseRoomMemberCallback(body);
        } else if (requestedPath === "/room-state") {
            // that._logger.log("internal", LOG_ID + "(handleS2SEvent) TODO: return ParseRoomStateCallback(content)");
            return that.ParseRoomStateCallback(body);
        } else if (requestedPath === "/message") {
            // that.logger.log("internal", LOG_ID + "(handleS2SEvent) TODO: return ParseMessageCallback(content)");
            return that.ParseMessageCallback(body);
        } else if (requestedPath === "/all-deleted") {
            // that._logger.log("internal", LOG_ID + "(handleS2SEvent) TODO: return ParseAlldeletedCallback(content)");
            /*
            { timestamp: '2020-02-21T13:50:38.919508Z',
  id: 'ee564d90-54b0-11ea-85d9-00505628611e',
  'all-deleted':
   { with: '5c1a3df51490a30213b9d9e2',
     conversation_id: '1553006776830736' } }
             */
            return that.ParseAlldeletedCallback(body);
        } else if (requestedPath === "/error") {
            // that._logger.log("error", LOG_ID + "(handleS2SEvent) TODO: return ParseErrorCallback(content)");
            return that.ParseErrorCallback(body);
        }

        that._logger.log("internal", LOG_ID + "(handleS2SEvent) Don't manage this request - Unknown path - HttpVerb:[", methodHttp, "] - Path:[host : ", event.headers.host, ", path : ", requestedPath, "]");
        return false;
    }

    ParseConnectionCallback(event): boolean {
        let that = this;
        that._logger.log("internal", LOG_ID + "(ParseConnectionCallback) Content:[", event, "]");

        if (event && event.connection && event.connection.state === "ready") {
            that._eventEmitter.emit("evt_internal_ons2sready", event);
            //await that.sendS2SPresence({});
        }
        return false;
    }

    async ParsePresenceCallback(event): Promise<boolean> {
        let that = this;
        that._logger.log("internal", LOG_ID + "(ParsePresenceCallback) Content:[", event, "]");
        let presence = event.presence;
        if (event && presence) {

            let from = event.presence.from;
            if (from) {
                let contact: Contact = await that._contacts.getContactById(from, false);
                if (contact != null) {
                    let show = presence.show;
                    let status = presence.status;
                    let resource = presence.resource;
                    //DateTime date = jObject.GetValue("timestamp").ToObject<DateTime>();

                    if (!show) {
                        show = "online";
                    }

                    // PresenceInfo presenceInfo = Util.GetPresenceInfo((contact.Jid_im == contacts.GetCurrentContactJid()), show, status);
                    // s2sClient.PresenceInfoReceived(new PresenceInfoEventArgs(contact.Jid_im, resource, date, presenceInfo));



                    that._logger.log("internal", LOG_ID + "(ParsePresenceCallback) logguedin user's jid : ", that.jid_im, ", jid of the from presence : ", contact.jid_im);

                    if (that.jid_im === contact.jid_im) {
                        let eventInfo = {
                            "fulljid": contact.jid_im + "/" + resource,
                            "jid": contact.jid_im,
                            "resource": resource,
                            "status": show,
                            "message": status,
                            "type": that.xmppUtils.isFromTelJid(resource) ?
                                "phone" :
                                that.xmppUtils.isFromMobile(resource) ?
                                    "mobile" :
                                    that.xmppUtils.isFromNode(resource) ?
                                        "node" :
                                        that.xmppUtils.isFromS2S(resource) ?
                                            "s2s" : "desktopOrWeb"
                        };
                        that._eventEmitter.emit("evt_internal_presencechanged", eventInfo);
                    } else {
                        let evtParam =  {
                            fulljid: from,
                            jid: contact.jid_im, //xmppUtils.getBareJIDFromFullJID(from),
                            resource: resource, //xmppUtils.getResourceFromFullJID(from),
                            value: {
                                priority: 5,
                                show: show || "",
                                delay: 0,
                                status: status || "",
                                type: that.xmppUtils.isFromTelJid(resource) ?
                                    "phone" :
                                    that.xmppUtils.isFromMobile(resource) ?
                                        "mobile" :
                                        that.xmppUtils.isFromNode(resource) ?
                                            "node" :
                                            that.xmppUtils.isFromS2S(resource) ?
                                                "s2s" : "desktopOrWeb"
                            }
                        };
                        that._eventEmitter.emit("evt_internal_onrosterpresence", evtParam);
                    }
                    return true;
                } else {
                    that._logger.log("internal", LOG_ID + "(ParsePresenceCallback) Impossible to get Contact using from field:[", from, "]",);
                }
            } else {
                that._logger.log("warn", LOG_ID + "(ParsePresenceCallback) Impossible to get 'from' property from info provided:[", event, "]");
            }
        } else {
            that._logger.log("error", LOG_ID + "(ParsePresenceCallback) Impossible to get Presence object using from info provided:[", event, "]");
        }

        return false;
    }

    async ParseChatStateCallback(content) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(ParseChatStateCallback)  Content:[", content, "]");

        let chatstate = content.chatstate;
        if (content && chatstate) {

            let peer = chatstate.peer;
            if (peer) {
                let contact: Contact = await that._contacts.getContactById(peer, false);
                if (contact != null) {

                    let conversationId = chatstate.conversation_id;
                    let state = chatstate.state;
                    let conversation = that._conversations.getConversationByDbId(conversationId);

                    let chatstateEvent = {
                        type: "s2s",
                        fromJid: contact.jid_im,
                        //resource: resource,
                        chatstate: state,
                        conversation
                    };
                    that._logger.log("internal", LOG_ID + "(ParseChatStateCallback) event to raise : ", chatstateEvent);
                    that._eventEmitter.emit("evt_internal_chatstate", chatstateEvent);
                    // s2sClient.ChatStateReceived(new UserTypingEventArgs(conversationId, contact.Jid_im, (state == "composing")));
                }
            }

            return true;
        }
        return false;
    }

    async ParseReceiptCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log("internal", LOG_ID + "(ParseReceiptCallback)  Content:[", content, "]");

        let receipt = content.receipt;
        if (content && receipt) {

            let msg_id = receipt.msg_id;
            if (msg_id) {
                let date = content.timestamp;
                let evt = receipt.event;
                let entity = receipt.entity;
                let conversation_id = receipt.conversation_id;

                /*
                let receiptType;

                if (entity == "server")
                    receiptType = "ServerReceived";
                else {
                    if (evt == "received") {
                        receiptType = "ClientReceived";
                        if (this.shouldSendReadReceipt) {
                            await that._rest.markMessageAsRead(conversation_id, msg_id);
                        }
                    } else
                        receiptType = "ClientRead";

                }

                //s2sClient.NewMessageDeliveryReceived(new MessageDeliveryReceivedEventArgs(msgId, receiptType, date));
                // */
                let receiptEvent = {
                    event: evt,
                    entity: entity,
                    //type: messageType,
                    id: msg_id,
                    //fromJid: fromJid,
                    //resource: resource
                    conversation_id
                };
                that._logger.log("info", LOG_ID + "(ParseReceiptCallback) message - receipt received");
                that._eventEmitter.emit("evt_internal_onreceipt", receiptEvent);

                return true;
            }
            return false;
        }
    }

    ParseAllReceiptCallback(content): boolean {
        let that = this;
        that._logger.log("internal", LOG_ID + "(ParseAllReceiptCallback)  Content:[", content, "]");

        let allreceipt = content["all-receipt"];
        if (content && allreceipt) {

            let typeread = allreceipt.id; // type of all : all-received / all-sent
            if (typeread) {
                let date = content.timestamp;
                let conversationId = allreceipt.conversation_id;
                let conversation = that._conversations.getConversationByDbId(conversationId);

                switch (typeread) {
                    case "all-received": // messages for this conversation have been acknowledged
                        conversation.missedCounter = 0;
                        that._eventEmitter.emit("evt_internal_conversationupdated", conversation);
                        break;
                    case "all-sent": // messages for this conversation have been read
                        // Not take into account : conversation.ackReadAllMessages();
                        break;
                    default:
                        that._logger.log("error", LOG_ID + "(ParseAllReceiptCallback) error - unknown read type : ", typeread);
                        break;
                }

                that._logger.log("info", LOG_ID + "(ParseAllReceiptCallback) message - all-receipt received");
                return true;
            }
            return false;
        }
    }

    async ParseConversationCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log("internal", LOG_ID + "(ParseConversationCallback)  Content:[", content, "]");
        let conversationObj = content["conversation"];
        if (content && conversationObj) {

            let conversationId = conversationObj.id;
            if (conversationId) {
                let date = content.timestamp;
                let action = conversationObj.action;
                let peer = conversationObj.peer;
                let conversationId = conversationObj.id;
                if (conversationObj.type !== 'room') {
                    let contact: Contact = await that._contacts.getContactById(peer, false);
                    let conversation: Conversation = await that._conversations.getOrCreateOneToOneConversation(contact.jid_im, conversationId);

                    switch (action) {
                        case "create":
                            conversation.dbId = conversationId;
                            conversation.lastModification = conversationObj.lastMessageDate;
                            conversation.missedCounter = parseInt(conversationObj.unreadMessageNumber, 10) || 0;
                            conversation.isFavorite = (conversationObj.isFavorite === "true");
                            //this._conversations.orderConversations();
                            //$rootScope.$broadcast("ON_CONVERSATIONS_UPDATED_EVENT");
                            // Send conversations update event
                            that._eventEmitter.emit("evt_internal_conversationupdated", conversation);
                            break;
                        case "delete":
                            if (! conversation) {
                                that._logger.log("info", LOG_ID + "(ParseConversationCallback) message - conversation received for delete but unknown, conversationId : ", conversationId);
                                conversation = new Conversation(conversationId);
                            }
                            this._conversations.removeConversation(conversation);
                            break;
                        case "update":
                            conversation.isFavorite = (conversationObj.isFavorite === "true");
                            //this._conversations.orderConversations();
                            // Send conversations update event
                            that._eventEmitter.emit("evt_internal_conversationupdated", conversation);
                            //$rootScope.$broadcast("ON_CONVERSATIONS_UPDATED_EVENT");
                            break;
                        default:
                            that._logger.log("error", LOG_ID + "(ParseAllReceiptCallback) error - unknown action type : ", action);
                            break;
                    }
                }
                if (conversationObj.type == 'room') {
                    /*
                     { timestamp: '2020-02-24T16:59:57.248369Z',
  id: '6d73faec-5726-11ea-83d2-00505628611e',
  conversation:
   { type: 'room',
     peer: '5e53fdc87cdc6514d72ed7e6',
     mute: false,
     id: '1582563596572184',
     action: 'create' } }
     { timestamp: '2020-02-26T10:38:41.264211Z',
  id: '0f3a674a-5884-11ea-889e-00505628611e',
  conversation:
   { type: 'room',
     peer: '5e553d747cdc6514d72ee15a',
     id: '1582644598393532',
     action: 'delete' } }
                     */
                    //let contact: Bubble = await that._conversations.getConversationByBubbleId(peer);
                    let bubbleId = peer;
                    let bubble = await that._bulles.getBubbleById(bubbleId) ;
                    let conversation: Conversation = await that._conversations.getBubbleConversation(bubble.jid);
                    that._logger.log("info", LOG_ID + "(ParseConversationCallback) message - conversation conversation : ", conversation);

                    switch (action) {
                        case "create":
                            conversation.dbId = conversationId;
                            conversation.lastModification = conversationObj.lastMessageDate;
                            conversation.missedCounter = parseInt(conversationObj.unreadMessageNumber, 10) || 0;
                            conversation.isFavorite = (conversationObj.isFavorite === "true");
                            //this._conversations.orderConversations();
                            //$rootScope.$broadcast("ON_CONVERSATIONS_UPDATED_EVENT");
                            // Send conversations update event
                            that._eventEmitter.emit("evt_internal_conversationupdated", conversation);
                            break;
                        case "delete":
                            if (! conversation) {
                                that._logger.log("info", LOG_ID + "(ParseConversationCallback) message - conversation received for delete but unknown, conversationId : ", conversationId);
                                conversation = new Conversation(conversationId);
                            }
                            this._conversations.removeConversation(conversation);
                            break;
                        case "update":
                            conversation.isFavorite = (conversationObj.isFavorite === "true");
                            //this._conversations.orderConversations();
                            // Send conversations update event
                            that._eventEmitter.emit("evt_internal_conversationupdated", conversation);
                            //$rootScope.$broadcast("ON_CONVERSATIONS_UPDATED_EVENT");
                            break;
                        default:
                            that._logger.log("error", LOG_ID + "(ParseAllReceiptCallback) error - unknown action type : ", action);
                            break;
                    }
                }
                that._logger.log("info", LOG_ID + "(ParseConversationCallback) message - conversation received");
                return true;
            }
            return false;
        }
    }

    async ParseMessageCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log("internal", LOG_ID + "(ParseMessageCallback)  Content:[", content, "]");
        let messageObj = content["message"];
        if (content && messageObj) {

            let conversationId = messageObj.conversation_id;
            if (conversationId) {
                let date = content.timestamp;
                let datetime = messageObj.datetime;
                let from = messageObj.from;
                let contact: Contact = await that._contacts.getContactById(from, false);
                let conversation: Conversation = await that._conversations.getOrCreateOneToOneConversation(contact.jid_im, conversationId);
                let lang = messageObj.lang;
                let msgId = messageObj.id;
                let body = messageObj.body;
                let resource = undefined;
                let toJid = undefined;
                let oob = undefined;
                let messageType = undefined;
                let isGroup = messageObj["is_group"];
                let fromBubbleJid = null;
                let fromBubbleUserJid = null;

                let alternativeContent = undefined;
                let subject = messageObj.subject;
                if (messageObj.content) {
                    alternativeContent = [];
                    alternativeContent.push({
                        "message": messageObj.content.data,
                        "type": messageObj.content.type
                    });
                }

                if (isGroup) {
                    //that._conversations.get
                    //fromBubbleJid = ;
                    //fromBubbleUserJid = ;
                }

                let data = {
                    "fromJid": contact.jid_im,
                    "resource": resource,
                    "toJid": toJid,
                    "type": messageType,
                    subject,
                    "content": body,
                    "alternativeContent": alternativeContent,
                    "id": msgId,
                    lang,
                    "cc": false,
                    "cctype": "",
                    "isEvent": false,
                    oob,
                    "date": datetime,
                    fromBubbleJid,
                    fromBubbleUserJid,
                    "event": null,
                    "eventJid": null,
                    "originalMessageReplaced": null,
                    "attention" : undefined,
                    conversation: undefined
                };

                /*if (!body) {
                    that.logger.log("debug", LOG_ID + "(_onMessageReceived) with no message text, so ignore it!");
                    return false;
                } // */

                data.conversation = conversation;
                data.conversation.addMessage(data);
                /*if (data.conversation.messages.length === 0 || !data.conversation.messages.find((elmt) => { if (elmt.id === data.id) { return elmt; } })) {
                    data.conversation.messages.push(data);
                } // */
                if (this.shouldSendReadReceipt) {
                    await that._rest.markMessageAsRead(conversationId, msgId);
                }
                that._eventEmitter.emit("evt_internal_onmessagereceived", data);
                that._eventEmitter.emit("evt_internal_conversationupdated", conversation);

                that._logger.log("info", LOG_ID + "(ParseMessageCallback) message - conversation received");
                return true;
            }
            return false;
        }
    }

    async ParseRoomInviteCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log("internal", LOG_ID + "(ParseRoomInviteCallback)  Content:", content, "");

        let roomInvite = content["room-invite"];
        if (content && roomInvite) {

            let roomId = roomInvite.id;
            if (roomId) {
                that._logger.log("info", LOG_ID + "(ParseRoomInviteCallback) roomId : ", roomId);
                let date = content.timestamp;
               /* let byUserId = roomInvite.by;
                that._logger.log("info", LOG_ID + "(ParseRoomInviteCallback) before getBubbleById.");
                let bubble: Bubble = <Bubble> await that._bulles.getBubbleById(roomId).catch((err)=> {
                    that._logger.log("info", LOG_ID + "(ParseRoomInviteCallback) failed to getBubbleById : ", err);

                }); // */
               let invitation = {
                   bubbleId : roomId
               };
                /*let contact: Contact = await that._contacts.getContactById(byUserId, false);
                let invitationdetails = {
                    bulle:bubble,
                    invitedByContact: contact
                }; */
                that._logger.log("info", LOG_ID + "(ParseRoomInviteCallback) message - room-invite received");
                //that._eventEmitter.emit("evt_internal_invitationdetailsreceived", bubble);
                that._eventEmitter.emit("evt_internal_invitationreceived", invitation);

                return true;
            }
            return false;
        }
    }

 async ParseRoomMemberCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log("internal", LOG_ID + "(ParseRoomMemberCallback)  Content:[", content, "]");

        let roomMember = content["room-member"];
        if (content && roomMember) {

            let roomId = roomMember.id;
            if (roomId) {
                let date = content.timestamp;
                let status = roomMember.status;
                let bubble: Bubble = await that._bulles.getBubbleById(roomId);
                // that._logger.log("info", LOG_ID + "(ParseRoomMemberCallback) message - room-member received");
                // that._eventEmitter.emit("evt_internal_invitationdetailsreceived", bubble);

                that._eventEmitter.emit("evt_internal_ownaffiliationchanged", {
                    "bubbleId": bubble.id,
                    "bubbleJid": bubble.jid,
                    "userJid": that.jid_im,
                    "status": status,
                });



                /*switch (status) {
                    case "accepted":
                        that._eventEmitter.emit("evt_internal_ownaffiliationchanged", {
                            "bubbleId": bubble.id,
                            "bubbleJid": bubble.jid,
                            "userJid": that.jid_im,
                            "status": status,
                        });
                        //that._eventEmitter.emit("evt_internal_ownaffiliationdetailschanged", bubble);
                        break;
                    case "invited":
                        that._logger.log("info", LOG_ID + "(ParseRoomMemberCallback) message - room-member invited");
                        break;
                    default:
                        that._logger.log("error", LOG_ID + "(ParseRoomMemberCallback) error - unknown status type : ", status);
                        break;
                } // */

                return true;
            }
            return false;
        }
    }

    async ParseRoomStateCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log("internal", LOG_ID + "(ParseRoomStateCallback)  Content:[", content, "]");
        /*
               { timestamp: '2020-02-25T15:29:58.976567Z',
        'room-state': { id: '5e553d747cdc6514d72ee15a', event: 'available' },
        id: '9665d516-57e3-11ea-8fb4-00505628611e' }
               */

        let roomstate = content["room-state"];
        if (content && roomstate) {

            let roomId = roomstate.id;
            if (roomId) {
                let eventType = roomstate.event;
                /*
                                      { timestamp: '2020-02-26T10:38:41.466598Z',
                'room-state': { id: '5e553d747cdc6514d72ee15a', event: 'deleted' },
                id: '0f3a674a-5884-11ea-889e-00505628611e' }
                                       */
                //let conversation: Conversation = await that._conversations.getConversationByBubbleId(bubbleId);
                let bubble = await that._bulles.getBubbleById(roomId);

                that._eventEmitter.emit("evt_internal_ownaffiliationchanged", {
                    "bubbleId": bubble.id,
                    "bubbleJid": bubble.jid,
                    "userJid": that.jid_im,
                    "status": eventType,
                });


                /* switch (eventType) {
                    case "xxx":
                        //that.eventEmitter.emit("evt_internal_ownaffiliationdetailschanged", bubble);
                        break;
                    case "deleted":
                        that._logger.log("info", LOG_ID + "(ParseRoomStateCallback) message - room-state deleted");

                        that._eventEmitter.emit("evt_internal_ownaffiliationchanged", {
                            "bubbleId": bubble.id,
                            "bubbleJid": bubble.jid,
                            "userJid": that.jid_im,
                            "status": eventType,
                        });
                        break;
                    default:
                        that._logger.log("error", LOG_ID + "(ParseRoomMemberCallback) error - unknown eventType type : ", eventType);
                        break;
                }
                // */
                return true;
            }
            return false;
        }
    }

    async ParseAlldeletedCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log("internal", LOG_ID + "(ParseAlldeletedCallback)  Content:[", content, "]");
        /*
        { timestamp: '2020-02-21T13:50:38.919508Z',
    id: 'ee564d90-54b0-11ea-85d9-00505628611e',
    'all-deleted':
    { with: '5c1a3df51490a30213b9d9e2',
    conversation_id: '1553006776830736' } }
         */
        let roomstate = content["all-deleted"];
        if (content && roomstate) {

            let conversationId = roomstate.conversation_id;
            if (conversationId) {
                let withId = roomstate.with;
                let conversation: Conversation = await that._conversations.getOrCreateOneToOneConversation(withId, conversationId);
                that._logger.log("info", LOG_ID + "(ParseAlldeletedCallback) message - all-deleted received");
                that._eventEmitter.emit("evt_internal_allmessagedremovedfromconversationreceived", conversation);
                return true;
            }
            return false;
        }
    }

    async ParseErrorCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log("internal", LOG_ID + "(ParseErrorCallback)  Content:[", content, "]");

        let error = content["error"];
        if (content && error) {
            return false;
        }
    }


    start(_core: Core) {
        return new Promise((resolve, reject) => {
            let that = this;
            that._contacts = _core.contacts;
            that._bulles = _core.bubbles;
            that._conversations = _core.conversations;
            that._rest = _core._rest;
            resolve();
        });
    }
}


export {S2SServiceEventHandler};
module.exports.S2SServiceEventHandler = S2SServiceEventHandler;
