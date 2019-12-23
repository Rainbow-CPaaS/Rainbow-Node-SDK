"use strict";
import {XMPPService} from "../XMPPService";

export {};

import {XMPPUTils} from "../../common/XMPPUtils";
import {logEntryExit} from "../../common/Utils";

const GenericHandler = require("./genericHandler");
const xml = require("@xmpp/xml");

const LOG_ID = "XMPP/HNDL/PRES - ";

@logEntryExit(LOG_ID)
class PresenceEventHandler extends GenericHandler {
	public PRESENCE: any;
	public onPresenceReceived: any;

    constructor(xmppService : XMPPService) {
        super( xmppService);

        this.PRESENCE = "jabber:client.presence";

        let that = this;
        let xmppUtils = XMPPUTils.getXMPPUtils();

        this.onPresenceReceived = (msg, stanza) => {
            try {
                that.logger.log("internal", LOG_ID + "(onPresenceReceived) _entering_ : ", msg, stanza);
                let from = stanza.attrs.from;
                if (from === that.fullJid || xmppUtils.getBareJIDFromFullJID(from) === xmppUtils.getBareJIDFromFullJID(that.fullJid)) {
                    // My presence changes (coming from me or another resource)
                    let show = stanza.getChild("show") ? stanza.getChild("show").text() : "online";
                    let status = stanza.getChild("status") ? stanza.getChild("status").text() : "";

                    that.eventEmitter.emit("evt_internal_presencechanged", {
                            "fulljid": from,
                            "jid": xmppUtils.getBareJIDFromFullJID(from),
                            "resource": xmppUtils.getResourceFromFullJID(from),
                            "status": show,
                            "message": status,
                            "type": xmppUtils.isFromTelJid(from) ?
                                "phone" :
                                xmppUtils.isFromMobile(from) ?
                                    "mobile" :
                                    xmppUtils.isFromNode(from) ?
                                        "node" :
                                        "desktopOrWeb"
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
                                                case "338":
                                                    status = "deactivated";
                                                    break;
                                                case "339":
                                                    status = "resumed";
                                                    break;
                                                default:
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
                    if (stanza.attrs.type === "unavailable") {
                        show = "unavailable";
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


                    let evtParam =  {
                        fulljid: from,
                        jid: xmppUtils.getBareJIDFromFullJID(from),
                        resource: xmppUtils.getResourceFromFullJID(from),
                        value: {
                            priority: priority,
                            show: show || "",
                            delay: delay,
                            status: status || "",
                            type: xmppUtils.isFromTelJid(from) ?
                                "phone" :
                                xmppUtils.isFromMobile(from) ?
                                    "mobile" :
                                    xmppUtils.isFromNode(from) ?
                                        "node" :
                                        "desktopOrWeb"
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
}

module.exports.PresenceEventHandler = PresenceEventHandler;
export {PresenceEventHandler};
