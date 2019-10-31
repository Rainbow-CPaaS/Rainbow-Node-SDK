"use strict";
import {XMPPService} from "../XMPPService";
import {logEntryExit} from "../../common/Utils";




const GenericHandler = require("./genericHandler");
const xml = require("@xmpp/xml");
const packageVersion = require("../../../package");

const LOG_ID = "XMPP/HNDL/IQ - ";

@logEntryExit(LOG_ID)
class IQEventHandler extends GenericHandler {
	public IQ_GET: any;
	public IQ_SET: any;
	public IQ_RESULT: any;
	public IQ_ERROR: any;
	public onIqGetReceived: any;
	public onIqResultReceived: any;
	public _onIqGetPingReceived: any;
	public _onIqGetQueryReceived: any;
	public _onIqGetPbxAgentStatusReceived: any;

    constructor(xmppService : XMPPService) {
        super( xmppService);

        this.IQ_GET = "jabber:client.iq.get";
        this.IQ_SET = "jabber:client.iq.set";
        this.IQ_RESULT = "jabber:client.iq.result";
        this.IQ_ERROR = "jabber:client.iq.error";

        let that = this;

        this.onIqGetReceived = (msg, stanza) => {
            try {
                let children = stanza.children;
                children.forEach((node) => {
                    switch (node.getName()) {
                        case "query":
                            that.logger.log("internal", LOG_ID + "(onIqGetReceived) _entering_ : ", msg, stanza);
                            that._onIqGetQueryReceived(stanza, node);
                            break;
                        case "ping":
                            that._onIqGetPingReceived(stanza, node);
                            break;
                        case "default":
                            that.logger.log("internal", LOG_ID + "(onIqGetReceived) _entering_ : ", msg, stanza);
                            that.logger.log("warn", LOG_ID + "(handleXMPPConnection) onIqGetReceived - not managed - 'stanza'", node.getName());
                            break;
                        default:
                            that.logger.log("internal", LOG_ID + "(onIqGetReceived) _entering_ : ", msg, stanza);
                            that.logger.log("warn", LOG_ID + "(handleXMPPConnection) onIqGetReceived - child not managed for iq - 'stanza'", node.getName());
                            that.logger.log("internal", LOG_ID + "(handleXMPPConnection) onIqGetReceived - child not managed for iq - 'stanza'", node.getName(), "stanza : ", stanza, " node : ", node);

                    }
                });
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onPresenceReceived) CATCH ErrorManager !!! ");
                that.logger.log("internalerror", LOG_ID + "(onPresenceReceived) CATCH ErrorManager !!! : ", err);
            }
        };

        this.onIqResultReceived = (msg, stanza) => {
            try {
                that.logger.log("internal", LOG_ID + "(onIqResultReceived) _entering_", msg, stanza);
                let children = stanza.children;
                children.forEach((node) => {
                    switch (node.getName()) {
                        case "query":
                            that._onIqGetQueryReceived(stanza, node);
                            break;
                        case "bind":
                            that.logger.log("info", LOG_ID + "(onIqResultReceived)  - 'stanza'", node.getName());
                            break;
                        case "pbxagentstatus":
                            // The treatment is in telephonyEventHandler
                            //that._onIqGetPbxAgentStatusReceived(stanza, node);
                            break;
                        case "deleted":
                            // One treatment is in calllogEventHandler
                            break;
                        case "default":
                            that.logger.log("warn", LOG_ID + "(onIqResultReceived) - not managed - 'stanza'", node.getName());
                            break;
                        default:
                            that.logger.log("warn", LOG_ID + "(onIqResultReceived) - child not managed for iq - 'stanza'", node.getName());
                            that.logger.log("internal", LOG_ID + "(onIqResultReceived) - child not managed for iq - 'stanza'", node.getName(), "stanza : ", stanza, " node : ", node);
                    }
                });
                if (stanza.attrs.id === "enable_xmpp_carbon") {
                    that.eventEmitter.emit("rainbow_oncarbonactivated");
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(onIqResultReceived) CATCH ErrorManager !!! ");
                that.logger.log("internalerror", LOG_ID + "(onIqResultReceived) CATCH ErrorManager !!! : ", err);
            }
        };

        // Private methods
        that._onIqGetPbxAgentStatusReceived = (stanza, node) => {
            let pbxagentstatus = {
                "phoneapi" : "",
                "xmppagent" : "",
                "version" : ""
            };

            var subchildren = node.children;
            subchildren.forEach(function (item) {
                let typeItem = typeof item;
                if (typeof item === "object") {
                    let itemName = item.getName();
                    if (itemName) {
                        pbxagentstatus[itemName] = item.text();
                    }
                }
            });

            that.logger.log("info", LOG_ID + "(handleXMPPConnection) _onIqGetPbxAgentStatusReceived - 'pbxagentstatus'", pbxagentstatus.toString());
            that.eventEmitter.emit("rainbow_onpbxagentstatusreceived_xmpp", pbxagentstatus);
        };

        this._onIqGetPingReceived = (stanza, node) => {
            try {
               // that.logger.log("debug", LOG_ID + "(_onIqGetPingReceived) _entering_");
                //that.logger.log("internal", LOG_ID + "(_onIqGetPingReceived) _entering_", stanza, node);
                let stanzaResponse = xml("iq", {
                    "to": stanza.attrs.from,
                    "id": stanza.attrs.id,
                    "xmlns": stanza.getNS(),
                    "type": "result"
                });
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) send ping answer - 'stanza' for Rainbow Node SDK version : ", that.logger.colors.magenta(packageVersion.version));
//        .log("info", LOG_ID + "(handleXMPPConnection) answered - 'stanza'", stanzaResponse.toString(), " for Rainbow Node SDK version : ", packageVersion.version);
                that.xmppClient.send(stanzaResponse);
            } catch (err) {
                that.logger.log("error", LOG_ID + "(_onIqGetPingReceived) CATCH ErrorManager !!! ");
                that.logger.log("internalerror", LOG_ID + "(_onIqGetPingReceived) CATCH ErrorManager !!! : ", err);
            }

        };

        this._onIqGetQueryReceived = (stanza, node) => {
            try {
                that.logger.log("internal", LOG_ID + "(_onIqGetQueryReceived) _entering_ : ", stanza, node);
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
                    that.logger.log("info", LOG_ID + "(handleXMPPConnection) XMPP Rosters received length : ", contacts.length);
                    that.eventEmitter.emit("evt_internal_onrosters", contacts);
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(_onIqGetQueryReceived) CATCH ErrorManager !!! ");
                that.logger.log("internalerror", LOG_ID + "(_onIqGetQueryReceived) CATCH ErrorManager !!! : ", err);
            }
        };
    }
}

module.exports.IQEventHandler = IQEventHandler;
export {IQEventHandler};
