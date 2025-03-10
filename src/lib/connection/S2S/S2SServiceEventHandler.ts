"use strict";

import {InvitationEventHandler} from "../XMPPServiceHandler/invitationEventHandler";

export {};


import {XMPPUTils} from "../../common/XMPPUtils";

import {logEntryExit, stackTrace} from "../../common/Utils";
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
import {PresenceRainbow} from "../../common/models/PresenceRainbow";
import {LevelLogs} from "../../common/LevelLogs.js";

const util = require('util');

const xml = require("@xmpp/xml");

const LOG_ID = "S2S/HNDL - ";

const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";

@logEntryExit(LOG_ID)
class S2SServiceEventHandler extends LevelLogs{
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
    private storeMessagesInConversation: boolean;
    private maxMessagesStoredInConversation: number;

    static getClassName(){ return 'S2SServiceEventHandler'; }
    getClassName(){ return S2SServiceEventHandler.getClassName(); }

    static getAccessorName(){ return 's2sevent'; }
    getAccessorName(){ return S2SServiceEventHandler.getAccessorName(); }

    constructor(_im, _application, _eventEmitter, _logger, _hostCallback) {
        super();
        this.setLogLevels(this);

        let that = this;

        this._logger = _logger;
        this._eventEmitter = _eventEmitter;
        this.shouldSendReadReceipt = _im.sendReadReceipt;
        this.storeMessagesInConversation = _im.storeMessagesInConversation;
        this.maxMessagesStoredInConversation = _im.maxMessagesStoredInConversation;
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

    handleS2SEvent(event) : {isEventForMe: boolean} {
        let that = this;

        if (event === undefined) {
            return;
        }

        let body = event.body;
        let methodHttp = event.method;
        let baseUrl = event.baseUrl;
        let originalUrl = event.originalUrl;
        let requestedPath = originalUrl;

        that._logger.log(that.HTTP, LOG_ID + "(handleS2SEvent) *************************************************");
        that._logger.log(that.HTTP, LOG_ID + "(handleS2SEvent) received an S2S EVENT : ");
        that._logger.log(that.HTTP, LOG_ID + "(handleS2SEvent) METHOD : ", methodHttp);
        that._logger.log(that.HTTP, LOG_ID + "(handleS2SEvent) BASELURL : ", baseUrl);
        that._logger.log(that.HTTP, LOG_ID + "(handleS2SEvent) ORIGINALURL : ", originalUrl);
        that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) EVENT BODY : ", that._logger.colors.events(body));
        that._logger.log(that.HTTP, LOG_ID + "(handleS2SEvent) *************************************************");

        let userId = body?.userId;
        if (userId !== that._rest?.account?.id ) {
            that._logger.log(that.ERROR, LOG_ID + "(handleS2SEvent) Don't manage this request - the userID: ", userId, " is not the connected one : ", that._rest?.account?.id);
            return {isEventForMe: false};
        }

        if (String.prototype.toUpperCase.call(methodHttp + "") != "POST") {
            that._logger.log(that.ERROR, LOG_ID + "(handleS2SEvent) Don't manage this request - Invalid HttpVerb - HttpVerb:", methodHttp, " - Path:host : ", event.headers.host, ", path : ", requestedPath, ", event : ", event);
            return {isEventForMe: true};
        }
        if (that.callbackAbsolutePath && that.callbackAbsolutePath.indexOf(event.headers.host) == -1) {
            that._logger.log(that.ERROR, LOG_ID + "(handleS2SEvent) Don't manage this request - Invalid path - HttpVerb:", methodHttp, " - Path:host : ", event.headers.host, ", path : ", requestedPath, ", event : ", event);
            return {isEventForMe: true};
        }

        if (requestedPath === "/connection") {
            // that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) return ParseConnectionCallback(content)");
            that.ParseConnectionCallback(body);
        } else if (requestedPath === "/presence") {
            // that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) return ParsePresenceCallback(content)");
            that.ParsePresenceCallback(body);
        } else if (requestedPath === "/user") {
            // that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) return ParseUserCallback(content)");
            that.ParseUserCallback(body);
        } else if (requestedPath === "/chat-state") {
            // that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) return ParseChatStateCallback(content)");
            that.ParseChatStateCallback(body);
        } else if (requestedPath === "/receipt") {
            //that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) return ParseReceiptCallback(content)");
            that.ParseReceiptCallback(body);
        } else if (requestedPath === "/all-receipt") {
            //that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) return ParseAllReceiptCallback(content)");
            that.ParseAllReceiptCallback(body);
        } else if (requestedPath === "/conversation") {
            //that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) TODO: return ParseConversationCallback(content)");
            that.ParseConversationCallback(body);
        } else if (requestedPath === "/room-invite") {
            //that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) TODO: return ParseRoomInviteCallback(content)");
            that.ParseRoomInviteCallback(body);
        } else if (requestedPath === "/room-member") {
            //that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) TODO: return ParseRoomMemberCallback(content)");
            that.ParseRoomMemberCallback(body);
        } else if (requestedPath === "/room-state") {
            // that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) TODO: return ParseRoomStateCallback(content)");
            that.ParseRoomStateCallback(body);
        } else if (requestedPath === "/telephony/rvcp") {
            // that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) TODO: return ParseTelephonyRvcpCallback(content)");
            that.ParseTelephonyRvcpCallback(body);
        } else if (requestedPath === "/telephony/rvcp/presence") {
            // that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) TODO: return ParseTelephonyRvcpPresenceCallback(content)");
            that.ParseTelephonyRvcpPresenceCallback(body);
        } else if (requestedPath === "/telephony/pcg") {
            // that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) TODO: return ParseTelephonyPcgCallback(content)");
            that.ParseTelephonyPcgCallback(body);
        } else if (requestedPath === "/telephony/pcg/presence") {
            // that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) TODO: return ParseTelephonyPcgPresenceCallback(content)");
            that.ParseTelephonyPcgPresenceCallback(body);
        } else if (requestedPath === "/conference") {
            // that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) TODO: return ParseConferenceCallback(content)");
            that.ParseConferenceCallback(body);
        } else if (requestedPath === "/message") {
            // that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) TODO: return ParseMessageCallback(content)");
            that.ParseMessageCallback(body);
        } else if (requestedPath === "/all-deleted") {
            // that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) TODO: return ParseAlldeletedCallback(content)");
            /*
            { timestamp: '2020-02-21T13:50:38.919508Z',
  id: 'ee564d90-54b0-11ea-85d9-00505628611e',
  'all-deleted':
   { with: '5c1a3df51490a30213b9d9e2',
     conversation_id: '1553006776830736' } }
             */
            that.ParseAlldeletedCallback(body);
        } else if (requestedPath === "/error") {
            // that._logger.log(that.ERROR, LOG_ID + "(handleS2SEvent) TODO: return ParseErrorCallback(content)");
            that.ParseErrorCallback(body);
        } else {
            that._logger.log(that.INTERNAL, LOG_ID + "(handleS2SEvent) Don't manage this request - Unknown path - HttpVerb:", methodHttp, " - Path:host : ", event.headers.host, ", path : ", requestedPath, "");
        }
        return {isEventForMe: true};
    }

    ParseConnectionCallback(event): boolean {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseConnectionCallback) Content:", event, "");

        if (event && event.connection && event.connection.state === "ready") {
            that._eventEmitter.emit("evt_internal_ons2sready", event);
            //await that.sendS2SPresence({});
        }
        return false;
    }

    async ParsePresenceCallback(event): Promise<boolean> {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParsePresenceCallback) Content:", event, "");
        let presence = event.presence;
        if (event && presence) {

            let from = event.presence.from;
            if (from) {
                let contact: Contact = await that._contacts.getContactById(from, false);
                if (contact != null) {
                    let show = presence.show ? presence.show : "online";
                    let status = presence.status ? presence.status : "";
                    let resource = presence.resource;
                    //DateTime date = jObject.GetValue("timestamp").ToObject<DateTime>();
                    // PresenceInfo presenceInfo = Util.GetPresenceInfo((contact.Jid_im == contacts.GetCurrentContactJid()), show, status);
                    // s2sClient.PresenceInfoReceived(new PresenceInfoEventArgs(contact.Jid_im, resource, date, presenceInfo));

                    let presenceRainbow = new PresenceRainbow();
                    presenceRainbow.presenceLevel = show;
                    presenceRainbow.presenceStatus = status;

                    that._logger.log(that.INTERNAL, LOG_ID + "(ParsePresenceCallback) logguedin user's jid : ", that.jid_im, ", jid of the from presence : ", contact.jid_im, ", presenceRainbow : ", presenceRainbow);

                    if (that.jid_im === contact.jid_im) {
                        let eventInfo = {
                            "fulljid": contact.jid_im + "/" + resource,
                            "jid": contact.jid_im,
                            "resource": resource,
                            contact,
                            /*"status": show,
                            "message": status,
                            // */
                            "presence" : presenceRainbow.presenceLevel,
                            "status" : presenceRainbow.presenceStatus,
                            "type": that.xmppUtils.isFromCalendarJid(resource) ? "calendar" : that.xmppUtils.isFromTelJid(resource) ?
                                "phone" :
                                that.xmppUtils.isFromMobile(resource) ?
                                    "mobile" :
                                    that.xmppUtils.isFromNode(resource) ?
                                        "node" :
                                        that.xmppUtils.isFromS2S(resource) ?
                                            "s2s" : "desktopOrWeb"
                        };
                        that._eventEmitter.emit("evt_internal_presencechanged", eventInfo);
                    } else if (from.includes("room_")) {
                        // Presence in bubble
                        that._logger.log(that.INTERNAL, LOG_ID + "(ParsePresenceCallback) bubble presence : ", event);
                        /*
                        let presence = stanza.attrs.type;
                        let status = undefined;
                        let description = undefined;
                        let children = stanza.children;
                        children.forEach(function (node) {
                            switch (node.getName()) {
                                case "x":
                                    let items = node.children;
                                    items.forEach((item) => {
                                        that._logger.log(that.INTERNAL, LOG_ID + "(ParsePresenceCallback) My presence (node or other resources) in the room changes x child name : ", item.getName());
                                        switch (item.getName()) {
                                            case "item":
                                                //that._logger.log(that.INTERNAL, LOG_ID + "(ParsePresenceCallback) My presence (node or other resources) in the room changes item ", item);
                                                let childrenReason = item.getChild("reason");
                                                if (childrenReason) {
                                                    description = childrenReason.children[0];
                                                }

                                                break;
                                            case "status":
                                                //that._logger.log(that.INTERNAL, LOG_ID + "(ParsePresenceCallback) status item", item);
                                                switch (item.attrs.code) {
                                                    case "332":
                                                        status = "disconnected"; // from room because of a system shutdown
                                                        break;
                                                    case "338":
                                                        status = "deactivated";
                                                        break;
                                                    case "339":
                                                        status = "resumed";
                                                        break;
                                                    default:
                                                        that._logger.log(that.INTERNAL, LOG_ID + "(ParsePresenceCallback) default - status not treated : ", item.attrs.code);
                                                        status = item.attrs.code;
                                                        break;
                                                }
                                                break;
                                            default:
                                                break;
                                        }
                                    });
                                    break;
                                default:
                                    break;
                            }
                        });

                        // My presence (node or other resources) in the room changes
                that.eventEmitter.emit("evt_internal_onbubblepresencechanged", {
                    fulljid: from,
                    jid: xmppUtils.getBareJIDFromFullJID(from),
                    resource: xmppUtils.getResourceFromFullJID(from),
                    presence: presence,
                    statusCode: status,
                    description: description
                });


                        // */

                        /*
                        // A presence in a room changes
                        let fullJid = xmppUtils.getResourceFromFullJID(from);
                        if (xmppUtils.getBareJIDFromFullJID(fullJid) === xmppUtils.getBareJIDFromFullJID(that.fullJid)) {


                            // My presence (node or other resources) in the room changes
                            that
                                .eventEmitter
                                .emit("evt_internal_onbubblepresencechanged", {
                                    fulljid: from,
                                    jid: xmppUtils.getBareJIDFromFullJID(from),
                                    resource: xmppUtils.getResourceFromFullJID(from)
                                });
                        } else {
                            // Presence of a participants of the room changes
                            that
                                .eventEmitter
                                .emit("rainbow_onbubblerosterpresencechanged", {
                                    fulljid: from,
                                    jid: xmppUtils.getBareJIDFromFullJID(from),
                                    resource: xmppUtils.getResourceFromFullJID(from)
                                });
                        } // */

                    } else {
                        // Presence of a contact changes
                        let evtParam =  {
                            "fulljid": from,
                            "jid": contact.jid_im, //xmppUtils.getBareJIDFromFullJID(from),
                            contact,
                            "resource": resource, //xmppUtils.getResourceFromFullJID(from),
                            "value": {
                                "priority": 5,
                                //show: show || "",
                                "delay": 0,
                                //status: status || "",
                                "show" : presenceRainbow.presenceShow,
                                "status" : presenceRainbow.presenceStatus,
                                "type": that.xmppUtils.isFromCalendarJid(resource) ? "calendar" : that.xmppUtils.isFromTelJid(resource) ?
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
                    that._logger.log(that.INTERNAL, LOG_ID + "(ParsePresenceCallback) Impossible to get Contact using from field:", from, "",);
                }
            } else {
                that._logger.log(that.WARN, LOG_ID + "(ParsePresenceCallback) Impossible to get 'from' property from info provided:", event, "");
            }
        } else {
            that._logger.log(that.ERROR, LOG_ID + "(ParsePresenceCallback) No 'presence' property info provided:", event, "");
        }

        return false;
    }

    async ParseUserCallback(event): Promise<boolean> {
        let that = this;
        /* ORIGINALURL :  /user
// */
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseUserCallback) Content:", event, "");
        let userNetwork = event['user-network'];
        if (event && userNetwork) {
            let contactId = userNetwork.user_id;
            if (contactId) {
                let contact: Contact = await that._contacts.getContactById(contactId, false);
                if (contact != null) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(ParseUserCallback) logguedin user's jid : ", that.jid_im, ", jid of the from 'user-network' : ", contact.jid_im);
                } else {
                    that._logger.log(that.INTERNAL, LOG_ID + "(ParseUserCallback) Impossible to get Contact using contactId field:", contactId, "",);
                }
                let action = userNetwork.action;
                switch (action) {
                    case "added":
                        /*
                        {
                          userId: '67595de122e43f0cd3b8bf8e',
                          'user-network': { user_id: '67595debbc8be8ac955886bf', action: 'added' },
                          timestamp: '2024-12-11T09:42:01.829178Z',
                          id: '1d719dd6-b7a4-11ef-8003-00505628611e'
                        }
                         */
                        /*let evtParam : any = {};
                        evtParam.status = "none";
                        evtParam.action = "create" ;
                        evtParam.status = "auto-accepted";

                        that._eventEmitter.emit("evt_internal_invitationsManagementUpdate", evtParam);
                        // */
                        that._logger.log(that.DEBUG, LOG_ID + "(ParseUserCallback) user-network added userId : ", contactId);
                        break;
                    case "removed":
                        /*
                        {
                          userId: '67595debbc8be8ac955886bf',
                          'user-network': { user_id: '67595de122e43f0cd3b8bf8e', action: 'removed' },
                          timestamp: '2024-12-11T10:18:13.378621Z',
                          id: '932f5fae-b7a4-11ef-a551-00505628611e'
                        }
                         */
                        that._logger.log(that.DEBUG, LOG_ID + "(ParseUserCallback) user-network removed userId : ", contactId);
                        break;
                }
            } else {
                that._logger.log(that.WARN, LOG_ID + "(ParseUserCallback) Impossible to get 'contactId' property from info provided:", event, "");
            }
        } else {
            that._logger.log(that.ERROR, LOG_ID + "(ParseUserCallback) No user-network property info provided:", event, "");
        }

        let userInvite = event['user-invite'];
        if (event && userInvite) {
            let contactId = userInvite.user_id;
            if (contactId) {
                let contact: Contact = await that._contacts.getContactById(contactId, false);
                if (contact != null) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(ParseUserCallback) logguedin user's jid : ", that.jid_im, ", jid of the from 'user-invite' : ", contact.jid_im);
                } else {
                    that._logger.log(that.INTERNAL, LOG_ID + "(ParseUserCallback) Impossible to get Contact using contactId field:", contactId, "",);
                }
                let action = userInvite.action;
                switch (action) {
                    case "create":
                        /*
                        {
                          userId: '67595debbc8be8ac955886bf',
                          'user-invite': {
                            status: 'auto-accepted',
                            id: '67595e695800c00cf3ed86d0',
                            action: 'create'
                          },
                          timestamp: '2024-12-11T09:42:02.138116Z',
                          id: '2166aef4-b7a4-11ef-b5c2-005056012d6f'
                        }
                        // */
                        let evtParam : any = {};
                        evtParam.action = userInvite.action ;
                        evtParam.status = userInvite.status;
                        evtParam.id = userInvite.id;
                        evtParam.type = "received";
                        that._eventEmitter.emit("evt_internal_invitationsManagementUpdate", evtParam);
                        return true;
                        break;
                }
            } else {
                that._logger.log(that.WARN, LOG_ID + "(ParseUserCallback) Impossible to get 'contactId' property from info provided:", event, "");
            }
        } else {
            that._logger.log(that.ERROR, LOG_ID + "(ParseUserCallback) No user-invite property info provided:", event, "");
        }

        return false;
    }

    async ParseChatStateCallback(content) {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseChatStateCallback)  Content:", content, "");

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
                    that._logger.log(that.INTERNAL, LOG_ID + "(ParseChatStateCallback) event to raise : ", chatstateEvent);
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
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseReceiptCallback)  Content:[", content, "]");

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
                that._logger.log(that.DEBUG, LOG_ID + "(ParseReceiptCallback) message - receipt received");
                that._eventEmitter.emit("evt_internal_onreceipt", receiptEvent);

                return true;
            }
            return false;
        }
    }

    ParseAllReceiptCallback(content): boolean {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseAllReceiptCallback)  Content:[", content, "]");

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
                        that._logger.log(that.ERROR, LOG_ID + "(ParseAllReceiptCallback) error - unknown read type : ", typeread);
                        break;
                }

                that._logger.log(that.DEBUG, LOG_ID + "(ParseAllReceiptCallback) message - all-receipt received");
                return true;
            }
            return false;
        }
    }

    async ParseConversationCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseConversationCallback)  Content:[", content, "]");
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
                                that._logger.log(that.DEBUG, LOG_ID + "(ParseConversationCallback) message - conversation received for delete but unknown, conversationId : ", conversationId);
                                conversation = new Conversation(conversationId, that._logger, that.maxMessagesStoredInConversation);
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
                            that._logger.log(that.ERROR, LOG_ID + "(ParseAllReceiptCallback) error - unknown action type : ", action);
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
                    that._logger.log(that.DEBUG, LOG_ID + "(ParseConversationCallback) message - conversation conversation : ", conversation);

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
                                that._logger.log(that.DEBUG, LOG_ID + "(ParseConversationCallback) message - conversation received for delete but unknown, conversationId : ", conversationId);
                                conversation = new Conversation(conversationId, that._logger, that.maxMessagesStoredInConversation);
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
                            that._logger.log(that.ERROR, LOG_ID + "(ParseAllReceiptCallback) error - unknown action type : ", action);
                            break;
                    }
                }
                that._logger.log(that.DEBUG, LOG_ID + "(ParseConversationCallback) message - conversation received");
                return true;
            }
            return false;
        }
    }

    async ParseMessageCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseMessageCallback)  Content:[", content, "]");
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
                let oob = messageObj.attachment;
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
                    that._logger.log(that.DEBUG, LOG_ID + "(_onMessageReceived) with no message text, so ignore it!");
                    return false;
                } // */

                data.conversation = conversation;
                if (that.storeMessagesInConversation) {
                    data.conversation.addOrUpdateMessage(data);
                    /*if (data.conversation.messages.length === 0 || !data.conversation.messages.find((elmt) => { if (elmt.id === data.id) { return elmt; } })) {
                        data.conversation.messages.push(data);
                    } // */
                }
                if (this.shouldSendReadReceipt) {
                    await that._rest.markMessageAsRead(conversationId, msgId);
                }
                that._eventEmitter.emit("evt_internal_onmessagereceived", data);
                that._eventEmitter.emit("evt_internal_conversationupdated", conversation);

                that._logger.log(that.DEBUG, LOG_ID + "(ParseMessageCallback) message - conversation received");
                return true;
            }
            return false;
        }
    }

    async ParseRoomInviteCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseRoomInviteCallback)  Content:", content, "");

        let roomInvite = content["room-invite"];
        if (content && roomInvite) {

            let roomId = roomInvite.id;
            if (roomId) {
                that._logger.log(that.DEBUG, LOG_ID + "(ParseRoomInviteCallback) roomId : ", roomId);
                let date = content.timestamp;
               /* let byUserId = roomInvite.by;
                that._logger.log(that.INFO, LOG_ID + "(ParseRoomInviteCallback) before getBubbleById.");
                let bubble: Bubble = <Bubble> await that._bulles.getBubbleById(roomId).catch((err)=> {
                    that._logger.log(that.INFO, LOG_ID + "(ParseRoomInviteCallback) failed to getBubbleById : ", err);

                }); // */
               let invitation = {
                   bubbleId : roomId
               };
                /*let contact: Contact = await that._contacts.getContactById(byUserId, false);
                let invitationdetails = {
                    bulle:bubble,
                    invitedByContact: contact
                }; */
                that._logger.log(that.DEBUG, LOG_ID + "(ParseRoomInviteCallback) message - room-invite received");
                //that._eventEmitter.emit("evt_internal_invitationdetailsreceived", bubble);
                that._eventEmitter.emit("evt_internal_invitationreceived", invitation);

                return true;
            }
            return false;
        }
    }

 async ParseRoomMemberCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseRoomMemberCallback)  Content:[", content, "]");

        let roomMember = content["room-member"];
        if (content && roomMember) {

            let roomId = roomMember.id;
            if (roomId) {
                let date = content.timestamp;
                let status = roomMember.status;
                let bubble: Bubble = await that._bulles.getBubbleById(roomId);
                // that._logger.log(that.INFO, LOG_ID + "(ParseRoomMemberCallback) message - room-member received");
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
                        that._logger.log(that.INFO, LOG_ID + "(ParseRoomMemberCallback) message - room-member invited");
                        break;
                    default:
                        that._logger.log(that.ERROR, LOG_ID + "(ParseRoomMemberCallback) error - unknown status type : ", status);
                        break;
                } // */

                return true;
            }
            return false;
        }
    }

    async ParseRoomStateCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseRoomStateCallback)  Content:[", content, "]");
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

                that._eventEmitter.emit("evt_internal_onbubblepresencechanged", {
                    fulljid: bubble.jid,
                    jid: bubble.jid,
                    resource: undefined,
                    presence: undefined,
                    statusCode: eventType,
                    description: "s2s event."
                });


                /* switch (eventType) {
                    case "xxx":
                        //that.eventEmitter.emit("evt_internal_ownaffiliationdetailschanged", bubble);
                        break;
                    case "deleted":
                        that._logger.log(that.INFO, LOG_ID + "(ParseRoomStateCallback) message - room-state deleted");

                        that._eventEmitter.emit("evt_internal_ownaffiliationchanged", {
                            "bubbleId": bubble.id,
                            "bubbleJid": bubble.jid,
                            "userJid": that.jid_im,
                            "status": eventType,
                        });
                        break;
                    default:
                        that._logger.log(that.ERROR, LOG_ID + "(ParseRoomMemberCallback) error - unknown eventType type : ", eventType);
                        break;
                }
                // */
                return true;
            }
            return false;
        }
    }

    async ParseTelephonyRvcpCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseTelephonyRvcpCallback)  Content:[", content, "]");
        /*
               { timestamp: '2020-02-25T15:29:58.976567Z',
        'room-state': { id: '5e553d747cdc6514d72ee15a', event: 'available' },
        id: '9665d516-57e3-11ea-8fb4-00505628611e' }
               */

        let eventObj = content["event"];
        if (content && eventObj) {
            /*
            let ts = eventObj.ts;
            let seqNum = eventObj.seqNum;
            let cause = eventObj.cause;
            let calls = eventObj.calls;
            let endpoints = eventObj.endpoints;
            let legs = eventObj.legs;
            let devices = eventObj.devices;

            that._eventEmitter.emit("evt_internal_telephonyrvcp", {
                ts,
                seqNum,
                cause,
                calls,
                endpoints,
                legs,
                devices
            });
            // */
            that._eventEmitter.emit("evt_internal_telephonyrvcp", {
                "event":eventObj
            });
        }
        return true;
    }

    async ParseTelephonyRvcpPresenceCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseTelephonyRvcpPresenceCallback)  Content:[", content, "]");
        /*
               { timestamp: '2020-02-25T15:29:58.976567Z',
        'room-state': { id: '5e553d747cdc6514d72ee15a', event: 'available' },
        id: '9665d516-57e3-11ea-8fb4-00505628611e' }
               */

        let from = content["from"];
        let state = content["state"];
        if (content && from) {

            that._eventEmitter.emit("evt_internal_telephonyrvcppresence", {
                from,
                state
            });
        }
        return true;
    }

    async ParseTelephonyPcgCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseTelephonyPcgCallback)  Content:[", content, "]");
        /*
               { timestamp: '2020-02-25T15:29:58.976567Z',
        'room-state': { id: '5e553d747cdc6514d72ee15a', event: 'available' },
        id: '9665d516-57e3-11ea-8fb4-00505628611e' }
               */

        let event = content["event"];
        let data = content["data"];
        if (content && event) {

            that._eventEmitter.emit("evt_internal_ontelephonypcg", {
                event,
                data
            });
        }
        return true;
    }

   async ParseTelephonyPcgPresenceCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseTelephonyPcgPresenceCallback)  Content:[", content, "]");
        /*
               { timestamp: '2020-02-25T15:29:58.976567Z',
        'room-state': { id: '5e553d747cdc6514d72ee15a', event: 'available' },
        id: '9665d516-57e3-11ea-8fb4-00505628611e' }
               */

        let from = content["from"];
        let state = content["state"];
        if (content && from) {

            that._eventEmitter.emit("evt_internal_ontelephonypcgpresence", {
                from,
                state
            });
        }
        return true;
    }

   async ParseConferenceCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseConferenceCallback)  Content:[", content, "]");
        /*
               { timestamp: '2020-02-25T15:29:58.976567Z',
        'room-state': { id: '5e553d747cdc6514d72ee15a', event: 'available' },
        id: '9665d516-57e3-11ea-8fb4-00505628611e' }
               */

        let event = content["event"];
        if (content && event) {

            that._eventEmitter.emit("evt_internal_onconference", {
                event
            });
        }
        return true;
    }

    async ParseAlldeletedCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseAlldeletedCallback)  Content:[", content, "]");
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
                that._logger.log(that.DEBUG, LOG_ID + "(ParseAlldeletedCallback) message - all-deleted received");
                that._eventEmitter.emit("evt_internal_allmessagedremovedfromconversationreceived", conversation);
                return true;
            }
            return false;
        }
    }

    async ParseErrorCallback(content): Promise<boolean> {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(ParseErrorCallback)  Content:[", content, "]");

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
            resolve(undefined);
        });
    }
}


export {S2SServiceEventHandler};
module.exports.S2SServiceEventHandler = S2SServiceEventHandler;
