"use strict";

import {XMPPService} from "../XMPPService";
import {logEntryExit} from "../../common/Utils";
import {GenericHandler} from "./GenericHandler";


const xml = require("@xmpp/xml");
const packageVersion = require("../../../package");

const prettydata = require("../pretty-data").pd;

const LOG_ID = "XMPP/HNDL/IQ - ";

@logEntryExit(LOG_ID)
class IQEventHandler extends GenericHandler {
        public IQ_GET: any;
        public IQ_SET: any;
        public IQ_RESULT: any;
        public IQ_ERROR: any;
        /*public onIqGetReceived: any;
        public onIqResultReceived: any;
        public _onIqGetPingReceived: any;
        public _onIqGetQueryReceived: any;
        public _onIqGetPbxAgentStatusReceived: any;

         */

    static getClassName(){ return 'IQEventHandler'; }
    getClassName(){ return IQEventHandler.getClassName(); }

    static getAccessorName(){ return 'iqevent'; }
    getAccessorName(){ return IQEventHandler.getAccessorName(); }

    constructor(xmppService : XMPPService) {
        super( xmppService);

        this.IQ_GET = "jabber:client.iq.get";
        this.IQ_SET = "jabber:client.iq.set";
        this.IQ_RESULT = "jabber:client.iq.result";
        this.IQ_ERROR = "jabber:client.iq.error";

        let that = this;
    }


    onIqGetSetReceived (msg, stanza) {
        let that = this;
        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
            let children = stanza.children;
            children.forEach((node) => {
                switch (node.getName()) {
                    case "query":
                        that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) query : ", msg, stanza);
                        that._onIqGetQueryReceived(stanza, node);
                        break;
                    case "ping":
                        that._onIqGetPingReceived(stanza, node);
                        break;
                    case "req":
                        // The treatment is in HttpoverxmppEventHandler
                        break;
                    case "resp":
                        // The treatment is in HttpoverxmppEventHandler
                        break;
                    case "default":
                        that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) default : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
                        that._logger.log(that.WARN, LOG_ID + "(onIqGetSetReceived) not managed - 'stanza'", node.getName());
                        break;
                    default:
                        that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
                        that._logger.log(that.WARN, LOG_ID + "(onIqGetSetReceived) child not managed for iq - 'stanza'", node.getName());
                        that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) child not managed for iq - 'stanza' name : ", node.getName(), ",stanza : ",  "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza, " node : ", node);

                }
            });
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onIqGetSetReceived) CATCH ErrorManager !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onIqGetSetReceived) CATCH ErrorManager !!! : ", err);
        }
    };

    onIqResultReceived (msg, stanza) {
        let that = this;

        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onIqResultReceived) _entering_", msg, "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
            let children = stanza.children;
            children.forEach((node) => {
                switch (node.getName()) {
                    case "query":
                        that._onIqGetQueryReceived(stanza, node);
                        break;
                    case "resp":
                        // The treatment is in HttpoverxmppEventHandler
                        break;
                    case "bind":
                        that._logger.log(that.INFO, LOG_ID + "(onIqResultReceived)  - 'stanza' ", node.getName());
                        break;
                    case "pbxagentstatus":
                        // The treatment is in telephonyEventHandler
                        //that._onIqGetPbxAgentStatusReceived(stanza, node);
                        break;
                    case "deleted":
                        // One treatment is in calllogEventHandler
                        break;
                    case "default":
                        that._logger.log(that.WARN, LOG_ID + "(onIqResultReceived) - not managed - 'stanza'", node.getName());
                        break;
                    default:
                        that._logger.log(that.WARN, LOG_ID + "(onIqResultReceived) - child not managed for iq - 'stanza'", node.getName());
                        that._logger.log(that.INTERNAL, LOG_ID + "(onIqResultReceived) - child not managed for iq - 'stanza' name : ", node.getName(), ", stanza : ",  "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza, " node : ", node);
                }
            });
            if (stanza.attrs.id === "enable_xmpp_carbon") {
                that.eventEmitter.emit("rainbow_oncarbonactivated");
            }
            if (stanza.attrs.id === "disable_xmpp_carbon") {
                that.eventEmitter.emit("rainbow_oncarbondisabled");
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onIqResultReceived) CATCH ErrorManager !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onIqResultReceived) CATCH ErrorManager !!! : ", err);
        }
    };

    // Private methods
    _onIqGetPbxAgentStatusReceived (stanza, node) {
        let that = this;

        let pbxagentstatus = {
            "phoneapi" : "",
            "xmppagent" : "",
            "version" : ""
        };

        let subchildren = node.children;
        subchildren.forEach(function (item) {
            let typeItem = typeof item;
            if (typeof item === "object") {
                let itemName = item.getName();
                if (itemName) {
                    pbxagentstatus[itemName] = item.text();
                }
            }
        });

        that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetPbxAgentStatusReceived) (handleXMPPConnection) _onIqGetPbxAgentStatusReceived - 'pbxagentstatus'", pbxagentstatus.toString());
        that.eventEmitter.emit("rainbow_onpbxagentstatusreceived_xmpp", pbxagentstatus);
    };

    _onIqGetPingReceived (stanza, node) {
        let that = this;

        try {
            // that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetPingReceived) _entering_");
            //that._logger.log(that.INTERNAL, LOG_ID + "(_onIqGetPingReceived) _entering_", stanza, node);
            let stanzaResponse = xml("iq", {
                "to": stanza.attrs.from,
                "id": stanza.attrs.id,
                "xmlns": stanza.getNS(),
                "type": "result"
            });
            that._logger.log(that.DEBUG, LOG_ID + "(_onIqGetPingReceived) (handleXMPPConnection) send ping answer - 'stanza' for Rainbow Node SDK version : ", that._logger.colors.magenta(packageVersion.version));
//        .log("info", LOG_ID + "(handleXMPPConnection) answered - 'stanza'", stanzaResponse.toString(), " for Rainbow Node SDK version : ", packageVersion.version);
            that.xmppClient.send(stanzaResponse);
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(_onIqGetPingReceived) (handleXMPPConnection) CATCH ErrorManager !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(_onIqGetPingReceived) (handleXMPPConnection) CATCH ErrorManager !!! : ", err);
        }

    };

    _onIqGetQueryReceived (stanza, node) {
        let that = this;

        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(_onIqGetQueryReceived) _entering_ : ", "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza, "\n", node.root ? prettydata.xml(node.root().toString()) : node);
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
                that._logger.log(that.INFO, LOG_ID + "(_onIqGetQueryReceived) (handleXMPPConnection) XMPP Rosters received length : ", contacts.length);
                that.eventEmitter.emit("evt_internal_onrosters", contacts);
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(_onIqGetQueryReceived) (handleXMPPConnection) CATCH ErrorManager !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(_onIqGetQueryReceived) (handleXMPPConnection) CATCH ErrorManager !!! : ", err);
        }
    };

}

module.exports.IQEventHandler = IQEventHandler;
export {IQEventHandler};
