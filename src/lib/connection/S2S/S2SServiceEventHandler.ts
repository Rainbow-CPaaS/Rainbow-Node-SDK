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

const util = require('util');

const xml = require("@xmpp/xml");

const LOG_ID = "S2S/HNDL - ";

const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";

@logEntryExit(LOG_ID)
class S2SServiceEventHandler {
    private logger: Logger;
    private eventEmitter: EventEmitter;
    private rest: RESTService;
    private callbackAbsolutePath: any;
    _contacts: ContactsService;
    jid_im: any;
    jid_password: any;
    userId: any;
    fullJid: any;
    jid_tel: any;
    jid: any;
    private xmppUtils: XMPPUTils;

    constructor(_rest, _im, _application, _eventEmitter, _logger, _hostCallback) {
        this.logger = _logger;
        this.eventEmitter = _eventEmitter;
        this.rest = _rest;
        this.callbackAbsolutePath = _hostCallback;
        this.xmppUtils = XMPPUTils.getXMPPUtils();

    }

    setAccount (account) {
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

        that.logger.log("internal", LOG_ID + "(handleS2SEvent) *************************************************");
        that.logger.log("internal", LOG_ID + "(handleS2SEvent) received an event: ");
        that.logger.log("internal", LOG_ID + "(handleS2SEvent) METHOD : ", methodHttp);
        that.logger.log("internal", LOG_ID + "(handleS2SEvent) BASELURL : ", baseUrl);
        that.logger.log("internal", LOG_ID + "(handleS2SEvent) ORIGINALURL : ", originalUrl);
        that.logger.log("internal", LOG_ID + "(handleS2SEvent) BODY : ", that.logger.colors.events(body));
        that.logger.log("internal", LOG_ID + "(handleS2SEvent) *************************************************");

        if (String.prototype.toUpperCase.call(methodHttp + "") != "POST") {
            that.logger.log("error", LOG_ID + "(handleS2SEvent) Don't manage this request - Invalid HttpVerb - HttpVerb:[", methodHttp, "] - Path:[host : ", event.headers.host, ", path : ", requestedPath, "]");
            return false;
        }
        if (that.callbackAbsolutePath && that.callbackAbsolutePath.indexOf(event.headers.host) == -1) {
            that.logger.log("error", LOG_ID + "(handleS2SEvent) Don't manage this request - Invalid path - HttpVerb:[", methodHttp, "] - Path:[host : ", event.headers.host, ", path : ", requestedPath, "]");
            return false;
        }

        if (requestedPath === "/connection") {
            that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParseConnectionCallback(content)");
            return that.ParseConnectionCallback(body);
        } else if (requestedPath === "/presence") {
            that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParsePresenceCallback(content)");
            return that.ParsePresenceCallback(body);
        } else if (requestedPath === "/chat-state") {
            that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParseChatStateCallback(content)");
        } else if (requestedPath === "/receipt") {
            that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParseReceitpCallback(content)");
        } else if (requestedPath === "/all-receipt") {
            that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParseAllReceitpCallback(content)");
        } else if (requestedPath === "/conversation") {
            that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParseConversationCallback(content)");
        } else if (requestedPath === "/room-invite") {
            that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParseRoomInviteCallback(content)");
        } else if (requestedPath === "/room-member") {
            that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParseRoomMemberCallback(content)");
        } else if (requestedPath === "/room-state") {
            that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParseRoomStateCallback(content)");
        } else if (requestedPath === "/message") {
            that.logger.log("internal", LOG_ID + "(handleS2SEvent) return ParseMessageCallback(content)");
        } else if (requestedPath === "/error") {
            that.logger.log("error", LOG_ID + "(handleS2SEvent) return ParseErrorCallback(content)");
        }

        that.logger.log("internal", LOG_ID + "(handleS2SEvent) Don't manage this request - Unknown path - HttpVerb:[", methodHttp, "] - Path:[host : ", event.headers.host, ", path : ", requestedPath, "]");
        return false;
    }

    ParseConnectionCallback(event): boolean {
        let that = this;
        that.logger.log("internal", LOG_ID + "(ParseConnectionCallback) Content:[", event, "]");

        if (event && event.connection && event.connection.state === "ready") {
            that.eventEmitter.emit("evt_internal_ons2sready", event);
            //await that.sendS2SPresence({});
        }
        return false;
    }

    async ParsePresenceCallback(event): Promise<boolean> {
        let that = this;
        that.logger.log("internal", LOG_ID + "(ParsePresenceCallback) Content:[", event, "]");
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

                    if (that.jid_im === contact.jid_im) {
                        that.eventEmitter.emit("evt_internal_presencechanged", eventInfo);
                    } else {
                        that.eventEmitter.emit("evt_internal_onrosterpresencechanged", eventInfo);
                    }

                    return true;
                } else
                    that.logger.log("internal", LOG_ID + "(ParsePresenceCallback) Impossible to get Contact using from field:[", from, "]",);
            } else
                that.logger.log("warn", LOG_ID + "(ParsePresenceCallback) Impossible to get 'from' property from info provided:[", event, "]");
        } else {
            that.logger.log("error", LOG_ID + "(ParsePresenceCallback) Impossible to get Presence object using from info provided:[", event, "]");
        }

        return false;
    }


    start(_contacts: any) {
        return new Promise((resolve,reject) => {
            let that = this;
            that._contacts = _contacts;
            resolve();
        });
    }
}


export {S2SServiceEventHandler};
module.exports.S2SServiceEventHandler = S2SServiceEventHandler;
