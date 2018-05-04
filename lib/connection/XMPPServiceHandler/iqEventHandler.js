"use strict";

const XMPPUtils = require("../../common/XMPPUtils");
const GenericHandler = require("./genericHandler");
const xml = require("@xmpp/xml");

const LOG_ID = "XMPP/HNDL - ";

class IQEventHandler extends GenericHandler {

    constructor(xmppService) {
        super( xmppService);

        this.IQ_GET = "jabber:client.iq.get";
        this.IQ_SET = "jabber:client.iq.set";
        this.IQ_RESULT = "jabber:client.iq.result";

        let that = this;

        this.onIqGetReceived = (msg, stanza) => {
            var children = stanza.children;
            children.forEach((node) => {
                switch (node.getName()) {
                    case "query":
                        that._onIqGetQueryReceived(stanza, node);
                        break;
                    case "ping":
                        that._onIqGetPingReceived(stanza, node);
                        break;
                    case "default":
                        that.logger.log("warn", LOG_ID + "(handleXMPPConnection) not managed - 'stanza'", node.getName());
                        break;
                    default:
                        that
                            .logger
                            .log("warn", LOG_ID + "(handleXMPPConnection) child not managed for iq - 'stanza'", node.getName());
                }
            });
        };

        this.onIqResultReceived = (msg, stanza) => {
            var children = stanza.children;
            children.forEach((node) => {
                switch (node.getName()) {
                    case "query":
                        that._onIqGetQueryReceived(stanza, node);
                        break;
                    case "default":
                        that.logger.log("warn", LOG_ID + "(handleXMPPConnection) not managed - 'stanza'", node.getName());
                        break;
                    default:
                        that
                            .logger
                            .log("warn", LOG_ID + "(handleXMPPConnection) child not managed for iq - 'stanza'", node.getName());
                }
            });
            if (stanza.attrs.id === "enable_xmpp_carbon") {
                that.eventEmitter.emit("rainbow_oncarbonactivated");
            }
        };

        // Private methods

        this._onIqGetPingReceived = (stanza, node) => {
            let stanzaResponse = xml("iq", {
                "to": stanza.attrs.from,
                "id": stanza.attrs.id,
                "xmlns": stanza.getNS(),
                "type": "result"
            });
            that
                .logger
                .log("info", LOG_ID + "(handleXMPPConnection) answered - 'stanza'", stanzaResponse.toString());
            that
                .xmppClient
                .send(stanzaResponse);
        };

        this._onIqGetQueryReceived = (stanza, node) => {
            if (node.attrs.xmlns === "jabber:iq:roster") {
                var contacts = [];
                var subchildren = node.children;
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
        };
    }
}

module.exports = IQEventHandler;
