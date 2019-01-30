"use strict";

const XMPPUtils = require("../../common/XMPPUtils");
const GenericHandler = require("./genericHandler");
const xml = require("@xmpp/xml");
const packageVersion = require("../../../package");

const LOG_ID = "XMPP/HNDL - ";

class IQEventHandler extends GenericHandler {

    constructor(xmppService) {
        super( xmppService);

        this.IQ_GET = "jabber:client.iq.get";
        this.IQ_SET = "jabber:client.iq.set";
        this.IQ_RESULT = "jabber:client.iq.result";

        let that = this;

        this.onIqGetReceived = (msg, stanza) => {
            try {
                that.logger.log("debug", LOG_ID + "(onIqGetReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onIqGetReceived) _entering_", msg, stanza);
                let children = stanza.children;
                children.forEach((node) => {
                    switch (node.getName()) {
                        case "query":
                            that._onIqGetQueryReceived(stanza, node);
                            break;
                        case "ping":
                            that._onIqGetPingReceived(stanza, node);
                            break;
                        case "default":
                            that.logger.log("warn", LOG_ID + "(handleXMPPConnection) onIqGetReceived - not managed - 'stanza'", node.getName());
                            break;
                        default:
                            that.logger.log("warn", LOG_ID + "(handleXMPPConnection) onIqGetReceived - child not managed for iq - 'stanza'", node.getName());
                            that.logger.log("internal", LOG_ID + "(handleXMPPConnection) onIqGetReceived - child not managed for iq - 'stanza'", node.getName(), "stanza : ", stanza, " node : ", node);

                    }
                });
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onPresenceReceived) CATCH Error !!! : ", err);
            }
        };

        this.onIqResultReceived = (msg, stanza) => {
            try {
                that.logger.log("debug", LOG_ID + "(onIqResultReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(onIqResultReceived) _entering_", msg, stanza);
                let children = stanza.children;
                children.forEach((node) => {
                    switch (node.getName()) {
                        case "query":
                            that._onIqGetQueryReceived(stanza, node);
                            break;
                        case "bind":
                            that.logger.log("info", LOG_ID + "(handleXMPPConnection) onIqResultReceived - 'stanza'", node.getName());
                            break;
                        case "default":
                            that.logger.log("warn", LOG_ID + "(handleXMPPConnection) onIqResultReceived - not managed - 'stanza'", node.getName());
                            break;
                        default:
                            that.logger.log("warn", LOG_ID + "(handleXMPPConnection) onIqResultReceived - child not managed for iq - 'stanza'", node.getName());
                            that.logger.log("internal", LOG_ID + "(handleXMPPConnection) onIqResultReceived - child not managed for iq - 'stanza'", node.getName(), "stanza : ", stanza, " node : ", node);
                    }
                });
                if (stanza.attrs.id === "enable_xmpp_carbon") {
                    that.eventEmitter.emit("rainbow_oncarbonactivated");
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onPresenceReceived) CATCH Error !!! : ", err);
            }
        };

        // Private methods

        this._onIqGetPingReceived = (stanza, node) => {
            try {
                that.logger.log("debug", LOG_ID + "(_onIqGetPingReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(_onIqGetPingReceived) _entering_", stanza, node);
                let stanzaResponse = xml("iq", {
                    "to": stanza.attrs.from,
                    "id": stanza.attrs.id,
                    "xmlns": stanza.getNS(),
                    "type": "result"
                });
                that
                    .logger
                    .log("info", LOG_ID + "(handleXMPPConnection) send ping answer - 'stanza' for Rainbow Node SDK version : ", packageVersion.version);
//        .log("info", LOG_ID + "(handleXMPPConnection) answered - 'stanza'", stanzaResponse.toString(), " for Rainbow Node SDK version : ", packageVersion.version);
                that
                    .xmppClient
                    .send(stanzaResponse);
            } catch (err) {
                that.logger.log("error", LOG_ID + "(_onIqGetPingReceived) CATCH Error !!! : ", err);
            }

        };

        this._onIqGetQueryReceived = (stanza, node) => {
            try {
                that.logger.log("debug", LOG_ID + "(_onIqGetQueryReceived) _entering_");
                that.logger.log("internal", LOG_ID + "(_onIqGetQueryReceived) _entering_", stanza, node);
                if (node.attrs.xmlns === "jabber:iq:roster") {
                    let contacts = [];
                    let subchildren = node.children;
                    subchildren.forEach(function (item) {
                        if (item.attrs.jid.substr(0, 3) !== "tel") {
                            contacts.push({
                                jid: item.attrs.jid,
                                subscription: item.attrs.subscription,
                                ask: item.attrs.ask || ""
                            });
                        }
                    });
                    that
                        .logger
                        .log("info", LOG_ID + "(handleXMPPConnection) XMPP Rosters received", contacts.length);
                    that
                        .eventEmitter
                        .emit("rainbow_onrosters", contacts);
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(_onIqGetQueryReceived) CATCH Error !!! : ", err);
            }
        };
    }
}

module.exports = IQEventHandler;
