"use strict";
export {};


const XMPPUtils = require("../../common/XMPPUtils");
const GenericHandler = require("./genericHandler");
const xml = require("@xmpp/xml");

const LOG_ID = "XMPP/HNDL - ";

class PresenceEventHandler extends GenericHandler {
	public PRESENCE: any;
	public onPresenceReceived: any;

    constructor(xmppService) {
        super( xmppService);

        this.PRESENCE = "jabber:client.presence";

        let that = this;

        this.onPresenceReceived = (msg, stanza) => {
            try {
                that.logger.log("debug", LOG_ID + "(onPresenceReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onPresenceReceived) _entering_", msg, stanza);
                let from = stanza.attrs.from;
                if (from === that.fullJid || XMPPUtils.getBareJIDFromFullJID(from) === XMPPUtils.getBareJIDFromFullJID(that.fullJid)) {
                    // My presence changes (coming from me or another resource)
                    let show = stanza.getChild("show") ? stanza.getChild("show").text() : "online";
                    let status = stanza.getChild("status") ? stanza.getChild("status").text() : "";

                    that
                        .eventEmitter
                        .emit("rainbow_onpresencechanged", {
                            "fulljid": from,
                            "jid": XMPPUtils.getBareJIDFromFullJID(from),
                            "resource": XMPPUtils.getResourceFromFullJID(from),
                            "status": show,
                            "message": status,
                            "type": XMPPUtils.isFromTelJid(from) ?
                                "phone" :
                                XMPPUtils.isFromMobile(from) ?
                                    "mobile" :
                                    XMPPUtils.isFromNode(from) ?
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
                    that
                        .eventEmitter
                        .emit("rainbow_private_onbubblepresencechanged", {
                            fulljid: from,
                            jid: XMPPUtils.getBareJIDFromFullJID(from),
                            resource: XMPPUtils.getResourceFromFullJID(from),
                            presence: presence,
                            statusCode: status,
                            description: description
                        });

                    /*
                    // A presence in a room changes
                    let fullJid = XMPPUtils.getResourceFromFullJID(from);
                    if (XMPPUtils.getBareJIDFromFullJID(fullJid) === XMPPUtils.getBareJIDFromFullJID(that.fullJid)) {


                        // My presence (node or other resources) in the room changes
                        that
                            .eventEmitter
                            .emit("rainbow_private_onbubblepresencechanged", {
                                fulljid: from,
                                jid: XMPPUtils.getBareJIDFromFullJID(from),
                                resource: XMPPUtils.getResourceFromFullJID(from)
                            });
                    } else {
                        // Presence of a participants of the room changes
                        that
                            .eventEmitter
                            .emit("rainbow_onbubblerosterpresencechanged", {
                                fulljid: from,
                                jid: XMPPUtils.getBareJIDFromFullJID(from),
                                resource: XMPPUtils.getResourceFromFullJID(from)
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
                                                that
                                                    .eventEmitter
                                                    .emit("rainbow_onrostercontactinformationchanged", XMPPUtils.getBareJIDFromFullJID(from));
                                            }
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            }
                        });
                    }

                    that
                        .eventEmitter
                        .emit("rainbow_onrosterpresence", {
                            fulljid: from,
                            jid: XMPPUtils.getBareJIDFromFullJID(from),
                            resource: XMPPUtils.getResourceFromFullJID(from),
                            value: {
                                priority: priority,
                                show: show || "",
                                delay: delay,
                                status: status || "",
                                type: XMPPUtils.isFromTelJid(from) ?
                                    "phone" :
                                    XMPPUtils.isFromMobile(from) ?
                                        "mobile" :
                                        XMPPUtils.isFromNode(from) ?
                                            "node" :
                                            "desktopOrWeb"
                            }
                        });
                }
                that.logger.log("debug", LOG_ID + "(onPresenceReceived) _exiting_");
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onPresenceReceived) CATCH ErrorManager !!! : ", err);
            }
        };
    }
}

module.exports = PresenceEventHandler;
