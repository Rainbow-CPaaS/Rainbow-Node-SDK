"use strict";
import {RESTService} from "../RESTService";

export {};


import {XMPPUTils} from "../../common/XMPPUtils";

import {Conversation} from "../../common/models/Conversation";
import {Channel} from "../../common/models/Channel";
import {logEntryExit} from "../../common/Utils";
import {GenericHandler} from "./GenericHandler";

const util = require('util');

const xml = require("@xmpp/xml");

const prettydata = require("../pretty-data").pd;

const LOG_ID = "XMPP/HNDL/INVT - ";

const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";

@logEntryExit(LOG_ID)
class InvitationEventHandler extends GenericHandler {
    public MESSAGE_CHAT: any;
    public MESSAGE_GROUPCHAT: any;
    public MESSAGE_WEBRTC: any;
    public MESSAGE_MANAGEMENT: any;
    public MESSAGE_ERROR: any;
    public MESSAGE_HEADLINE: any;
    public MESSAGE_CLOSE: any;
    public invitationService: any;

    static getClassName(){ return 'InvitationEventHandler'; }
    getClassName(){ return InvitationEventHandler.getClassName(); }

    constructor(xmppService, invitationService) {
        super(xmppService);

        this.MESSAGE_CHAT = "jabber:client.message.chat";
        this.MESSAGE_GROUPCHAT = "jabber:client.message.groupchat";
        this.MESSAGE_WEBRTC = "jabber:client.message.webrtc";
        this.MESSAGE_MANAGEMENT = "jabber:client.message.management";
        this.MESSAGE_ERROR = "jabber:client.message.error";
        this.MESSAGE_HEADLINE = "jabber:client.message.headline";
        this.MESSAGE_CLOSE = "jabber:client.message.headline";

        this.invitationService = invitationService;


    }

    onManagementMessageReceived (msg, stanza) {
        let that = this;
        try {
            that.logger.log("internal", LOG_ID + "(onManagementMessageReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
            let children = stanza.children;
            children.forEach(function (node) {
                switch (node.getName()) {
                    case "room":
                        // treated in conversationEventHandler
                        break;
                    case "usersettings":
                        // treated in conversationEventHandler
                        break;
                    case "group":
                        // treated in conversationEventHandler
                        break;
                    case "conversation":
                        // treated in conversationEventHandler
                        break;
                    case "mute":
                        // treated in conversationEventHandler
                        break;
                    case "unmute":
                        // treated in conversationEventHandler
                        break;
                    case "file":
                        // treated in conversationEventHandler
                        break;
                    case "thumbnail":
                        // treated in conversationEventHandler
                        break;
                    case "channel-subscription":
                    case "channel":
                    // treated in channelEventHandler
                        break;
                    case "userinvite":
                        // treated  also in conversationEventHandler
                        that.onInvitationManagementMessageReceived(node);
                        break;
                    case "openinvite":
                        that.onOpenInvitationManagementMessageReceived(node);
                        break;
                    case "favorite":
                        // treated in favoriteEventHandler
                        break;
                    case "notification":
                        // treated in alertEventHandler
                        break;
                    case "roomscontainer":
                        // treated in conversationEventHandler
                        break;
                    case "webinar":
                        // treated in webinarEventHandler
                        break;
                    case "poll":
                        // treated in conversationEventHandler
                        break;
                    case "joincompanyinvite":
                        that.onJoinCompanyInviteManagementMessageReceived(node);
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
    }

    /*this.onHeadlineMessageReceived = (msg, stanza) => {
        try {
            that.logger.log("internal", LOG_ID + "(onHeadlineMessageReceived) _entering_ : ", msg, stanza);
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
                        let message = { messageId: null};
                        message.messageId = item.attrs.id;
                        that.logger.log("debug", LOG_ID + "(onHeadlineMessageReceived) channel retract received, for messageId " + message.messageId);
                        that.eventEmitter.emit("evt_internal_channelmessagedeletedreceived", message);
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

                        that.eventEmitter.emit("evt_internal_channelitemreceived", message);
                    } else {
                        that.logger.log("error", LOG_ID + "(onHeadlineMessageReceived) channel entry received, but empty. It can not be parsed, so ignored.");
                        that.logger.log("internalerror", LOG_ID + "(onHeadlineMessageReceived) channel entry received, but empty. It can not be parsed, so ignored. : ", stanza);
                    }
                }
                    break;
                default: {
                    that.logger.log("debug", LOG_ID + "(onHeadlineMessageReceived) channel unknown event " + item.name + " received");
                }
                    break;

            }
        } catch (err) {
            that.logger.log("error", LOG_ID + "(onHeadlineMessageReceived) CATCH Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(onHeadlineMessageReceived) CATCH Error !!! : ", err);
        }
    };// */

    onInvitationManagementMessageReceived (stanza) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onInvitationManagementMessageReceived) stanza : ", "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);

        try {
            let userInviteElem = stanza; //.find("userinvite");
            if (userInviteElem && userInviteElem.attrs) {
                let id = userInviteElem.attrs.id;
                let type = userInviteElem.attrs.type;
                let action = userInviteElem.attrs.action;
                let status = userInviteElem.attrs.status;

                let invitation = {
                    id,
                    type,
                    action,
                    status
                };
                that.eventEmitter.emit("evt_internal_invitationsManagementUpdate", invitation);
                return true;
            } else {
                that.logger.log("error", LOG_ID + "(onInvitationManagementMessageReceived) userInvite empty.");
                that.logger.log("internalerror", LOG_ID + "(onInvitationManagementMessageReceived) userInvite empty : ", stanza);
            }
        } catch (err) {
            that.logger.log("error", LOG_ID + "(onInvitationManagementMessageReceived) CATCH Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(onInvitationManagementMessageReceived) CATCH Error !!! : ", err);
            return true;
        }
    }
    
    onJoinCompanyInviteManagementMessageReceived (stanza) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) stanza : ", "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);

        try {
            let joincompanyinviteElem = stanza; //.find("userinvite");
            if (joincompanyinviteElem && joincompanyinviteElem.attrs) {
                let id = joincompanyinviteElem.attrs.id;
                let type = joincompanyinviteElem.attrs.type;
                let action = joincompanyinviteElem.attrs.action;
                let status = joincompanyinviteElem.attrs.status;

                let invitation = {
                    id,
                    type,
                    action,
                    status
                };
                that.eventEmitter.emit("evt_internal_joinCompanyInvitationManagementUpdate", invitation);
                return true;
            } else {
                that.logger.log("error", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) joincompanyinvite empty.");
                that.logger.log("internalerror", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) joincompanyinvite empty : ", stanza);
            }
        } catch (err) {
            that.logger.log("error", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) CATCH Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(onJoinCompanyInviteManagementMessageReceived) CATCH Error !!! : ", err);
            return true;
        }
    }

    onOpenInvitationManagementMessageReceived (stanza) {
        let that = this;

        that.logger.log("internal", LOG_ID + "(onOpenInvitationManagementMessageReceived) stanza : ", "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
        try {
            let userInviteElem = stanza; //.find("userinvite");
            if (userInviteElem && userInviteElem.attrs) {
                let openinviteid = userInviteElem.find("openinviteid").text();
                let roomid = userInviteElem.find("roomid").text();
                let action = userInviteElem.attrs.action;
                let roomType = userInviteElem.find("roomType").text();
                let invitationURL = userInviteElem.find("invitationURL").text();

                let invitation = {
                    openinviteid,
                    roomid,
                    action,
                    roomType,
                    invitationURL
                };
                that.eventEmitter.emit("evt_internal_openinvitationManagementUpdate", invitation);
                return true;
            } else {
                that.logger.log("error", LOG_ID + "(onOpenInvitationManagementMessageReceived) userInvite empty.");
                that.logger.log("internalerror", LOG_ID + "(onOpenInvitationManagementMessageReceived) userInvite empty : ", stanza);
            }
        } catch (err) {
            that.logger.log("error", LOG_ID + "(onOpenInvitationManagementMessageReceived) CATCH Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(onOpenInvitationManagementMessageReceived) CATCH Error !!! : ", err);
            return true;
        }
    }


    onReceiptMessageReceived (msg, stanza) {
    };

    onErrorMessageReceived (msg, stanza) {
        let that = this;

        try {
            if (stanza.getChild('no-store') != undefined){
                // // Treated in conversation handler that.logger.log("error", LOG_ID + "(onErrorMessageReceived) The 'to' of the message can not received the message");
            } else {
                that.logger.log("error", LOG_ID + "(onErrorMessageReceived) something goes wrong...");
                that.logger.log("internalerror", LOG_ID + "(onErrorMessageReceived) something goes wrong...", msg, "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
                that.eventEmitter.emit("evt_internal_xmpperror", msg);
            }
        } catch (err) {
            that.logger.log("error", LOG_ID + "(onErrorMessageReceived) CATCH Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(onErrorMessageReceived) CATCH Error !!! : ", err);
        }
    }

    findAttrs () {

    }

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

export {InvitationEventHandler};
module.exports.InvitationEventHandler = InvitationEventHandler;
