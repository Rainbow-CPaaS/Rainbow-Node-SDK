"use strict";
import {XMPPService, NameSpacesLabels} from "../XMPPService";
import {XMPPUTils} from "../../common/XMPPUtils";
import {getJsonFromXML, logEntryExit} from "../../common/Utils";
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
    public IQ_GET: any;
    public IQ_SET: any;
    public IQ_RESULT: any;
    public IQ_ERROR: any;
        // public onPresenceReceived: any;
        private _contacts : ContactsService;
        private _xmpp : XMPPService;

    static getClassName(){ return 'PresenceEventHandler'; }
    getClassName(){ return PresenceEventHandler.getClassName(); }

    static getAccessorName(){ return 'presenceevent'; }
    getAccessorName(){ return PresenceEventHandler.getAccessorName(); }

    constructor(xmppService : XMPPService, contacts: ContactsService) {
        super( xmppService);
        
        this._xmpp = xmppService;

        this.PRESENCE = "jabber:client.presence";
        this.IQ_GET = "jabber:client.iq.get";
        this.IQ_SET = "jabber:client.iq.set";
        this.IQ_RESULT = "jabber:client.iq.result";
        this.IQ_ERROR = "jabber:client.iq.error";

        this._contacts = contacts;

    }

    async onPresenceReceived (msg, stanzaTab) {
        let that = this;
        let stanza = stanzaTab[0];
        let prettyStanza = stanzaTab[1];
        let jsonStanza = stanzaTab[2];

        let xmppUtils = XMPPUTils.getXMPPUtils();

        try {
            //that._logger.log(that.INTERNAL, LOG_ID + "(onPresenceReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
            that._logger.log(that.DEBUG, LOG_ID + "(onPresenceReceived) _entering_ : ", msg, prettyStanza);
            //that._logger.log(that.INTERNAL, LOG_ID + "(onPresenceReceived) msg : ", msg, "stanza : ", stanza);
            let from = stanza.attrs.from;

            const fromJid = stanza.attr("from");
            const fromBareJid = XMPPUTils.getXMPPUtils().getBareJidFromJid(fromJid);
            const x = stanza.find("x");
            const namespace = x.attr("xmlns");
            let applyMsTeamsPresence = false;
            let applyCalendarPresence = false;

            // Ignore muc presence
            if (namespace && namespace.indexOf(NameSpacesLabels.MucNameSpace) === 0) {
                that._logger.log(that.INTERNAL, LOG_ID + "(onPresenceReceived) ignore Muc Name Space.");
                return true; 
            }

            if (stanza.find("applyMsTeamsPresence").length != 0) {
                applyMsTeamsPresence = true;
            }

            if (stanza.find("applyCalendarPresence").length != 0) {
                applyCalendarPresence = true;
            }

            if (from === that.fullJid || xmppUtils.getBareJIDFromFullJID(from) === xmppUtils.getBareJIDFromFullJID(that.fullJid)) {
                // My presence changes (coming from me or another resource)
                let show = PresenceShow.Online;
                if (stanza.attrs.type === "unavailable") {
                    show = PresenceShow.Offline;
                } else {
                    if (stanza.getChild("show")) {
                        show = stanza.getChild("show").text();
                    } else {
                        that._logger.log(that.INTERNAL, LOG_ID + "(onPresenceReceived) <show> node can not be found in stanza!");
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
                let typeResource =  xmppUtils.isFromPresenceJid(from) ? "presence" : xmppUtils.isFromCalendarJid(from) ? "calendar" : xmppUtils.isFromTelJid(from) ?
                        "phone" :
                        xmppUtils.isFromMobile(from) ?
                                "mobile" :
                                xmppUtils.isFromNode(from) ?
                                        "node" :
                                        "desktopOrWeb";
                
                let data = {
                    "fulljid": from,
                    "jid": xmppUtils.getBareJIDFromFullJID(from),
                    //contact,
                    "resource": xmppUtils.getResourceFromFullJID(from),
                    //"status": show,
                    //"message": status,
                    value: {
                        "show": show,
                        "status": status,
                        //"applyCalendarPresence": undefined,
                        //"applyMsTeamsPresence": undefined,
                        delay,
                        until, // The validity date of the calendar presence.
                        "type": typeResource
                    }
                };
                if (typeResource === "calendar" ) {
                    // @ts-ignore
                    data.value.applyCalendarPresence = applyCalendarPresence;
                }
                if (typeResource === "presence" ) {
                    // @ts-ignore
                    data.value.applyMsTeamsPresence = applyMsTeamsPresence;
                }
                
                that.eventEmitter.emit("evt_internal_presencechanged", data);
            } else if (from.includes("room_")) {
                // Presence in bubble
                let presence = stanza.attrs.type;
                let status = undefined;
                let description = undefined;
                let children = stanza.children;
                children.forEach(function (node) {
                    switch (node.getName()) {
                        case "x":
                            let items = node.children;
                            items.forEach((item) => {
                                that._logger.log(that.INTERNAL, LOG_ID + "(onPresenceReceived) My presence (node or other resources) in the room changes x child name : ", item.getName());
                                switch (item.getName()) {
                                    case "item":
                                        //that._logger.log(that.INTERNAL, LOG_ID + "(onPresenceReceived) My presence (node or other resources) in the room changes item ", item);
                                        let childrenReason = item.getChild("reason");
                                        if (childrenReason) {
                                            description = childrenReason.children[0];
                                        }

                                        break;
                                    case "status":
                                        //that._logger.log(that.INTERNAL, LOG_ID + "(onPresenceReceived) status item", item);
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
                                                that._logger.log(that.INTERNAL, LOG_ID + "(onPresenceReceived) default - status not treated : ", item.attrs.code);
                                                status = item.attrs.code;
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
                let status = ""
                let discover = false;
                let until = "";
                if (stanza.attrs.type==="unavailable") {
                    show = PresenceShow.Offline; //"unavailable";
                } else {
                    let children = stanza.children;
                    children.forEach(function (node) {
                        if (node && typeof node!=="string") {
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
                                case "discover":
                                    discover = true;
                                    break;
                                case "actor":
                                    if (node.attrs && (node.attrs.xmlns==="jabber:iq:configuration")) {
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

                let typeResource = xmppUtils.isFromPresenceJid(from) ? "presence":xmppUtils.isFromCalendarJid(from) ? "calendar":xmppUtils.isFromTelJid(from) ?
                        "phone":
                        xmppUtils.isFromMobile(from) ?
                                "mobile":
                                xmppUtils.isFromNode(from) ?
                                        "node":
                                        "desktopOrWeb";
                let evtParam = {
                    fulljid: from,
                    jid: xmppUtils.getBareJIDFromFullJID(from),
                    resource: xmppUtils.getResourceFromFullJID(from),
                    value: {
                        priority,
                        //show: show || "",
                     //   "applyCalendarPresence": undefined,
                       // "applyMsTeamsPresence": undefined,
                        delay,
                        //status: status || "",
                        until, // The validity date of the calendar presence. 
                        show,
                        status,
                        "type": typeResource
                    }
                };
                if (typeResource==="calendar") {
                    // @ts-ignore
                    evtParam.value.applyCalendarPresence = applyCalendarPresence;
                }
                if (typeResource==="presence") {
                    // @ts-ignore
                    evtParam.value.applyMsTeamsPresence = applyMsTeamsPresence;
                }
                that.eventEmitter.emit("evt_internal_onrosterpresence", evtParam);

            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onPresenceReceived) CATCH ErrorManager !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onPresenceReceived) CATCH ErrorManager !!! : ", err);
        }
    };

    onIqGetSetReceived (msg, stanzaTab) {
        let that = this;
        let stanza = stanzaTab[0];
        let prettyStanza = stanzaTab[1];
        let jsonStanza = stanzaTab[2];

        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) _entering_ : ", msg, prettyStanza);
            let jsonStanzaIq = jsonStanza?.iq;
            Object.entries(jsonStanzaIq).forEach(async ([key, value] : any) => // : [key, value]
            {
                //if (jsonStanza.hasOwnProperty(key)) {
                if (key==="events" && jsonStanzaIq["events"]?.$attrs?.xmlns==="urn:xmpp:calendar:0") {
                    that._logger.log(that.DEBUG, LOG_ID + "(onIqGetSetReceived) found a property 'events' in jsonStanza. ");
                    await that._onIqEventsReceived(msg, stanzaTab);
                    return;
                }
                //}
                if (key==="autoreply" && jsonStanzaIq["autoreply"]?.$attrs?.xmlns==="urn:xmpp:calendar:0") {
                    that._logger.log(that.DEBUG, LOG_ID + "(onIqGetSetReceived) found a property 'autoreply' in jsonStanza. ");
                    await that._onIqAutoreplyReceived(msg, stanzaTab);
                    return;
                }
            });

            // that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) _entering_ : ", msg, prettyStanza);
            // let children = stanza.children;
            // children.forEach((node) => {
            //     switch (node.getName()) {
            //         case "events":
            //             //that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) query : ", msg, stanza);
            //             that._onIqEventsReceived(stanza, node);
            //             break;
            //         case "req":
            //             //that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) query : ", msg, stanza);
            //             //that._onIqGetSetReqReceived(stanza, node);
            //             break;
            //         case "query":
            //             // treatement in iqEventHandler
            //             break;
            //         case "ping":
            //             // treatement in iqEventHandler
            //             break;
            //         /*case "default":
            //             that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) default : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
            //             that._logger.log(that.WARN, LOG_ID + "(onIqGetSetReceived) not managed - 'stanza'", node.getName());
            //             break; // */
            //         default:
            //             that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) _entering_ : ", msg, prettyStanza);
            //             that._logger.log(that.WARN, LOG_ID + "(onIqGetSetReceived) child not managed for iq - 'stanza' name : ", node.getName());
            //             that._logger.log(that.INTERNAL, LOG_ID + "(onIqGetSetReceived) child not managed for iq - 'stanza' name : ", node.getName(), ",stanza : ",  "\n", prettyStanza, " node : ", node);
            //
            //     }
            // });
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onIqGetSetReceived) CATCH ErrorManager !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onIqGetSetReceived) CATCH ErrorManager !!! : ", err);
        }
    };

    async _onIqEventsReceived(msg, stanzaTab) {
        let that = this;
        let stanza: any = stanzaTab[0];
        let prettyStanza: any = stanzaTab[1];
        let jsonStanza: any = stanzaTab[2];

        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(_onIqEventsReceived) _entering_ jsonStanza : ", jsonStanza);
            //that._logger.log(that.DEBUG, LOG_ID + "(_onIqEventsReceived) found a property 'events' in jsonStanza. ");
            let jsonStanzaIq = jsonStanza?.iq;
            let id = jsonStanzaIq.$attrs.id;
            let from = jsonStanzaIq.$attrs.from;
            let jsonStanzaIqEvents = jsonStanzaIq["events"];
            let events= {
                "id": id,
                "from" : from,
                "email": jsonStanzaIqEvents?.$attrs?.email,
                "startDate":jsonStanzaIqEvents?.startDate,
                "endDate":jsonStanzaIqEvents?.endDate
            };

            that.eventEmitter.emit("evt_internal_EWSgeteventsreceived", events);
        } catch (error) {
            return true;
        }
    }

    async _onIqAutoreplyReceived(msg, stanzaTab) {
        let that = this;
        let stanza: any = stanzaTab[0];
        let prettyStanza: any = stanzaTab[1];
        let jsonStanza: any = stanzaTab[2];

        try {
            that._logger.log(that.INTERNAL, LOG_ID + "(_onIqAutoreplyReceived) _entering_ jsonStanza : ", jsonStanza);
            //that._logger.log(that.DEBUG, LOG_ID + "(_onIqEventsReceived) found a property 'events' in jsonStanza. ");
            let jsonStanzaIq = jsonStanza?.iq;
            let id = jsonStanzaIq.$attrs.id;
            let from = jsonStanzaIq.$attrs.from;
            let jsonStanzaIqAutoreply = jsonStanzaIq["autoreply"];
            let events= {
                "id": id,
                "from" : from,
                "email": jsonStanzaIqAutoreply?.$attrs?.email,
            };

            that.eventEmitter.emit("evt_internal_EWSgetautoreplyreceived", events);
        } catch (error) {
            return true;
        }
    }


}

module.exports.PresenceEventHandler = PresenceEventHandler;
export {PresenceEventHandler};
