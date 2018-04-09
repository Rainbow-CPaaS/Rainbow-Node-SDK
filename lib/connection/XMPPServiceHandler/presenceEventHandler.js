"use strict";

const XMPPUtils = require("../../common/XMPPUtils");
const GenericHandler = require("./genericHandler");
const xml = require("@xmpp/xml");

const LOG_ID = "XMPP/HNDL - ";

class PresenceEventHandler extends GenericHandler {

    constructor(xmppService) {
        super( xmppService);

        this.PRESENCE = "jabber:client.presence";

        let that = this;

        this.onPresenceReceived = (msg, stanza) => {

            var from = stanza.attrs.from;
            if (from === that.fullJid || XMPPUtils.getBareJIDFromFullJID(from) === XMPPUtils.getBareJIDFromFullJID(that.fullJid)) {
                // My presence changes (coming from me or another resource)
                that
                    .eventEmitter
                    .emit("rainbow_onpresencechanged", {
                        fulljid: from,
                        jid: XMPPUtils.getBareJIDFromFullJID(from),
                        resource: XMPPUtils.getResourceFromFullJID(from),
                        show: stanza.attrs.show || "online",
                        status: stanza.attrs.status || "",
                        type: XMPPUtils.isFromTelJid(from) ?
                            "phone" :
                            XMPPUtils.isFromMobile(from) ?
                                "mobile" :
                                XMPPUtils.isFromNode(from) ?
                                    "node" :
                                    "desktopOrWeb"
                    });
            } else if (from.includes("room_")) {

                var children = stanza.children;
                children.forEach(function (node) {
                    switch (node.getName()) {
                        case "x":
                            var items = node.children;
                            items.forEach(function (item) {
                                switch (item.getName()) {
                                    case "item":
                                        break;
                                    case "status":
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

                // A presence in a room changes
                var fullJid = XMPPUtils.getResourceFromFullJID(from);
                if (XMPPUtils.getBareJIDFromFullJID(fullJid) === XMPPUtils.getBareJIDFromFullJID(that.fullJid)) {
                    // My presence (node or other resources) in the room changes
                    that
                        .eventEmitter
                        .emit("rainbow_onbubblepresencechanged", {
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
                }

            } else {
                // Presence of a contact changes
                var priority = 5;
                var show = "";
                var delay = "";
                var status = "";
                if (stanza.attrs.type === "unavailable") {
                    show = "unavailable";
                } else {
                    var children = stanza.children;
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
        };
    }
}

module.exports = PresenceEventHandler;
