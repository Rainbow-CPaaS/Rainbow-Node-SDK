"use strict";
import {XMPPService, NameSpacesLabels} from "../XMPPService";
import {XMPPUTils} from "../../common/XMPPUtils";
import {logEntryExit} from "../../common/Utils";
import {PresenceLevel, PresenceRainbow, PresenceShow, PresenceStatus} from "../../common/models/PresenceRainbow";
import {Contact} from "../../common/models/Contact";
import {ContactsService} from "../../services/ContactsService";
import {GenericHandler} from "./GenericHandler";

export {};

const xml = require("@xmpp/xml");

const prettydata = require("../pretty-data").pd;

const LOG_ID = "XMPP/HNDL/PRES - ";

@logEntryExit(LOG_ID)
class PresenceEventHandler extends GenericHandler {
	public PRESENCE: any;
	// public onPresenceReceived: any;
	private _contacts : ContactsService;
	private _xmpp : XMPPService;

    static getClassName(){ return 'PresenceEventHandler'; }
    getClassName(){ return PresenceEventHandler.getClassName(); }

    constructor(xmppService : XMPPService, contacts: ContactsService) {
        super( xmppService);
        
        this._xmpp = xmppService;

        this.PRESENCE = "jabber:client.presence";

        this._contacts = contacts;

    }

    async onPresenceReceived (msg, stanza) {
        let that = this;
        let xmppUtils = XMPPUTils.getXMPPUtils();

        try {
            that.logger.log("internal", LOG_ID + "(onPresenceReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
            let from = stanza.attrs.from;

            const fromJid = stanza.attr("from");
            const fromBareJid = XMPPUTils.getXMPPUtils().getBareJidFromJid(fromJid);
            const x = stanza.find("x");
            const namespace = x.attr("xmlns");

            // Ignore muc presence
            if (namespace && namespace.indexOf(NameSpacesLabels.MucNameSpace) === 0) { return true; }

            if (from === that.fullJid || xmppUtils.getBareJIDFromFullJID(from) === xmppUtils.getBareJIDFromFullJID(that.fullJid)) {
                // My presence changes (coming from me or another resource)
                let show = PresenceShow.Online;
                if (stanza.attrs.type === "unavailable") {
                    show = PresenceShow.Offline;
                } else {
                    if (stanza.getChild("show")) {
                        show = stanza.getChild("show").text();
                    } else {
                        that.logger.log("internal", LOG_ID + "(onPresenceReceived) <show> node can not be found in stanza!");
                    }
                }
                let status = stanza.getChild("status") ? stanza.getChild("status").text() : "";
                let until = stanza.getChild("until") ? stanza.getChild("until").text() : "";
                let delay = stanza.attrs.stamp ? stanza.attrs.stamp : "";

                let isContactInformationChanged = false;
                let children = stanza.children;
                children.forEach(function (node) {
                    if (node && typeof node !== "string") {
                        switch (node.getName()) {                            
                            case "status":
                                status = node.getText() || "";
                                break;
                            case "actor":
                                if (node.attrs && (node.attrs.xmlns === "jabber:iq:configuration")) {
                                    // Contact updated
                                    if (node.parent && node.parent.getChild("x") &&
                                            (node.parent.getChild("x").getChild("data") || node.parent.getChild("x").getChild("avatar"))) {
                                        // Either avatar or user vcard changed
                                        isContactInformationChanged = true;
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                    }
                });
                
                if (isContactInformationChanged) {
                    that.eventEmitter.emit("evt_internal_oncontactinformationchanged", xmppUtils.getBareJIDFromFullJID(from));
                }
                //let contact: Contact = await that._contacts.getContactByJid(from, false);
                let typeResource =  xmppUtils.isFromCalendarJid(from) ? "calendar" : xmppUtils.isFromTelJid(from) ?
                        "phone" :
                        xmppUtils.isFromMobile(from) ?
                                "mobile" :
                                xmppUtils.isFromNode(from) ?
                                        "node" :
                                        "desktopOrWeb"
                
                that.eventEmitter.emit("evt_internal_presencechanged", {
                    "fulljid": from,
                    "jid": xmppUtils.getBareJIDFromFullJID(from),
                    //contact,
                    "resource": xmppUtils.getResourceFromFullJID(from),
                    //"status": show,
                    //"message": status,
                    value: {
                        "show": show,
                        "status": status,
                        delay,
                        until, // The validity date of the calendar presence.
                        "type": typeResource
                    }
                });
            } else if (from.includes("room_")) {

                let presence = stanza.attrs.type;
                let status = undefined;
                let description = undefined;
                let children = stanza.children;
                children.forEach(function (node) {
                    switch (node.getName()) {
                        case "x":
                            let items = node.children;
                            items.forEach((item) => {
                                that.logger.log("internal", LOG_ID + "(onPresenceReceived) My presence (node or other resources) in the room changes x child name : ", item.getName());
                                switch (item.getName()) {
                                    case "item":
                                        //that.logger.log("internal", LOG_ID + "(onPresenceReceived) My presence (node or other resources) in the room changes item ", item);
                                        let childrenReason = item.getChild("reason");
                                        if (childrenReason) {
                                            description = childrenReason.children[0];
                                        }

                                        break;
                                    case "status":
                                        //that.logger.log("internal", LOG_ID + "(onPresenceReceived) status item", item);
                                        switch (item.attrs.code) {
                                            case "332":
                                                status = "disconnected" ; // from room because of a system shutdown
                                                break;
                                            case "338":
                                                status = "deactivated";
                                                break;
                                            case "339":
                                                status = "resumed";
                                                break;
                                            default:
                                                that.logger.log("internal", LOG_ID + "(onPresenceReceived) default - status not treated : ", item.attrs.code);
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
                let priority = 5;
                let show = "";
                let delay = "";
                let status = "";
                let until = "";
                if (stanza.attrs.type === "unavailable") {
                    show = PresenceShow.Offline; //"unavailable";
                } else {
                    let children = stanza.children;
                    children.forEach(function (node) {
                        if (node && typeof node !== "string") {
                            switch (node.getName()) {
                                case "priority":
                                    priority = node.getText() || 5;
                                    break;
                                case "show":
                                    show = node.getText() || "online";
                                    break;
                                case "until":
                                    until = node.getText() || "";
                                    break;
                                case "delay":
                                    delay = node.attrs.stamp || "";
                                    break;
                                case "status":
                                    status = node.getText() || "";
                                    break;
                                case "actor":
                                    if (node.attrs && (node.attrs.xmlns === "jabber:iq:configuration")) {
                                        // Contact updated
                                        if (node.parent && node.parent.getChild("x") &&
                                            (node.parent.getChild("x").getChild("data") || node.parent.getChild("x").getChild("avatar"))) {
                                            // Either avatar or user vcard changed
                                            that.eventEmitter.emit("evt_internal_onrostercontactinformationchanged", xmppUtils.getBareJIDFromFullJID(from));
                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    });
                }

                let typeResource =  xmppUtils.isFromCalendarJid(from) ? "calendar" : xmppUtils.isFromTelJid(from) ?
                        "phone" :
                        xmppUtils.isFromMobile(from) ?
                                "mobile" :
                                xmppUtils.isFromNode(from) ?
                                        "node" :
                                        "desktopOrWeb"
                let evtParam = {
                    fulljid: from,
                    jid: xmppUtils.getBareJIDFromFullJID(from),
                    resource: xmppUtils.getResourceFromFullJID(from),
                    value: {
                        priority,
                        //show: show || "",
                        delay,
                        //status: status || "",
                        until, // The validity date of the calendar presence. 
                        show,
                        status,
                        "type":typeResource
                    }
                };
                that.eventEmitter.emit("evt_internal_onrosterpresence", evtParam);
            }
        } catch (err) {
            that.logger.log("error", LOG_ID + "(onPresenceReceived) CATCH ErrorManager !!! ");
            that.logger.log("internalerror", LOG_ID + "(onPresenceReceived) CATCH ErrorManager !!! : ", err);
        }
    };

}

module.exports.PresenceEventHandler = PresenceEventHandler;
export {PresenceEventHandler};
