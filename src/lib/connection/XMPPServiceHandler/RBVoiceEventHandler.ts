"use strict";
import {XMPPService} from "../XMPPService";
import {XMPPUTils} from "../../common/XMPPUtils";
//const Conversation = require("../../common/models/Conversation");
//const Call = require("../../common/models/Call");
import {Call} from "../../common/models/Call";
import {getJsonFromXML, logEntryExit} from "../../common/Utils";
//const config = require("../../config/config");
import {config} from "../../config/config";
import {GenericHandler} from "./GenericHandler";
import { Core } from "../../Core";
import {RBVoiceService} from "../../services/RBVoiceService.js";
import {ProfilesService} from "../../services/ProfilesService.js";
import {ContactsService} from "../../services/ContactsService.js";

export {};


const Utils = require("../../common/Utils");

const xml = require("@xmpp/xml");
const PromiseQueue = require("../../common/promiseQueue");

const prettydata = require("../pretty-data").pd;

const LOG_ID = "XMPP/HNDL/RBVOICE - ";

@logEntryExit(LOG_ID)
class RBVoiceEventHandler extends GenericHandler {
        public MESSAGE: any;
        public MESSAGE_MANAGEMENT: any;
        public MESSAGE_ERROR: any;
        public MESSAGE_HEADLINE: any;
        public IQ_RESULT: any;
        public IQ_ERROR: any;
        private _core : Core;
        public rbVoiceService: RBVoiceService;
        public contactsService: ContactsService;
        public promiseQueue: any;
        public _profilesService: ProfilesService;
    public xmppUtils: XMPPUTils;        

    static getClassName(){ return 'RBVoiceEventHandler'; }
    getClassName(){ return RBVoiceEventHandler.getClassName(); }

    static getAccessorName(){ return 'rbvoiceevent'; }
    getAccessorName(){ return RBVoiceEventHandler.getAccessorName(); }

    constructor(xmppService : XMPPService, core: Core) {
        super(xmppService);

        let that = this;
        this.MESSAGE = "jabber:client.message";
        this.IQ_RESULT = "jabber:client.iq.result";
        this.IQ_ERROR = "jabber:client.iq.error";

        this.MESSAGE_MANAGEMENT = "jabber:client.message.management";
        this.MESSAGE_ERROR = "jabber:client.message.error";
        this.MESSAGE_HEADLINE = "jabber:client.message.headline";

        /*
        this.MESSAGE_GROUPCHAT = "jabber:client.message.groupchat";
        this.MESSAGE_WEBRTC = "jabber:client.message.webrtc";
        this.MESSAGE_MANAGEMENT = "jabber:client.message.management";
        this.MESSAGE_ERROR = "jabber:client.message.error";
        this.MESSAGE_HEADLINE = "jabber:client.message.headline";
        this.MESSAGE_CLOSE = "jabber:client.message.headline";
        // */
        this.xmppUtils = XMPPUTils.getXMPPUtils();

        this._core = core;
        this.contactsService = core.contacts;
        this._profilesService = core.profiles;
        this.promiseQueue = PromiseQueue.createPromiseQueue(that._logger);
    }

    onIqResultReceived (msg, stanza) {
        let that = this;
        let children = stanza.children;
        children.forEach((node) => {
            switch (node.getName()) {
                case "default":
                    //that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection, onIqResultReceived) not managed - 'stanza'", node.getName());
                    break;
                default:
                //that
                //  .logger
                //.log("warn", LOG_ID + "(handleXMPPConnection, onIqResultReceived) child not managed for iq - 'stanza'", node.getName());
            }
        });
    };

    onErrorMessageReceived (msg, stanza) {
        let that = this;

        try {
            if (stanza.getChild('no-store') != undefined){
                // // Treated in conversation handler that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) The 'to' of the message can not received the message");
            } else {
                //that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) something goes wrong...");
                that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) something goes wrong... : ", msg, "\n", stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
                that.eventEmitter.emit("evt_internal_xmpperror", msg);
            }
        } catch (err) {
            // that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) CATCH Error !!! ");
            that._logger.log(that.ERROR, LOG_ID + "(onErrorMessageReceived) CATCH Error !!! : ", err);
        }
    };

    async onMessageReceived(msg, stanza) {
        let that = this;

        that._logger.log(that.INTERNAL, LOG_ID + "(onMessageReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()):stanza);
        try {
            let stanzaElem = stanza;
            //let that = this;

            let xmlNodeStr = stanza ? stanza.toString():"<xml></xml>";
            let reqObj = await getJsonFromXML(xmlNodeStr);
            that._logger.log(that.DEBUG, LOG_ID + "(onMessageReceived) reqObj : ", reqObj);

            // Ignore "Offline" message
            let delay = stanzaElem.getChild("delay");
            if (delay && delay.text()==="Offline Storage") {
                return true;
            }

            let from = stanza.attrs.from;
            let to = stanza.attrs.to;

        } catch (error) {
            // that._logger.log(that.ERROR, LOG_ID + "(onMessageReceived) CATCH Error !!! -- failure -- ");
            that._logger.log(that.ERROR, LOG_ID + "(onMessageReceived) CATCH Error !!! -- failure -- : ", error);
            //return true;
        }

        that._logger.log(that.DEBUG, LOG_ID + "(onMessageReceived) _exiting_");
        return true;
    }

    async onManagementMessageReceived(msg, stanza) {
        let that = this;

        that._logger.log(that.INTERNAL, LOG_ID + "(onManagementMessageReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()):stanza);
        try {
            let stanzaElem = stanza;
            //let that = this;

            let xmlNodeStr = stanza ? stanza.toString():"<xml></xml>";
            let reqObj = await getJsonFromXML(xmlNodeStr);
            that._logger.log(that.DEBUG, LOG_ID + "(onManagementMessageReceived) reqObj : ", reqObj);

            // Ignore "Offline" message
            let delay = stanzaElem.getChild("delay");
            if (delay && delay.text()==="Offline Storage") {
                return true;
            }

            let from = stanza.attrs.from;
            let to = stanza.attrs.to;

        } catch (error) {
            // that._logger.log(that.ERROR, LOG_ID + "(onManagementMessageReceived) CATCH Error !!! -- failure -- ");
            that._logger.log(that.ERROR, LOG_ID + "(onManagementMessageReceived) CATCH Error !!! -- failure -- : ", error);
            //return true;
        }

        that._logger.log(that.DEBUG, LOG_ID + "(onManagementMessageReceived) _exiting_");
        return true;
    }
    
    async onHeadlineMessageReceived(msg, stanza) {
        let that = this;

        that._logger.log(that.INTERNAL, LOG_ID + "(onHeadlineMessageReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()):stanza);
        try {
            let stanzaElem = stanza;
            //let that = this;
            let xmlNodeStr = stanza ? stanza.toString():"<xml></xml>";
            let stanzaObj = await getJsonFromXML(xmlNodeStr);
            that._logger.log(that.DEBUG, LOG_ID + "(onHeadlineMessageReceived) stanzaObj : ", stanzaObj);

            if (stanzaObj && stanzaObj.message) {
                let from = stanzaObj.message.$attrs.from;
                let to = stanzaObj.message.$attrs.to;
                if (stanzaObj.message.telephony && stanzaObj.message.telephony.event) {
                    let evtParam = stanzaObj.message.telephony.event;

                    that.eventEmitter.emit("evt_internal_rbvoiceevent", evtParam);
                }
            }
            
        } catch (error) {
            // that._logger.log(that.ERROR, LOG_ID + "(onHeadlineMessageReceived) CATCH Error !!! -- failure -- ");
            that._logger.log(that.ERROR, LOG_ID + "(onHeadlineMessageReceived) CATCH Error !!! -- failure -- : ", error);
            //return true;
        }

        that._logger.log(that.DEBUG, LOG_ID + "(onHeadlineMessageReceived) _exiting_");
        return true;
    }
    
}

module.exports.RBVoiceEventHandler = RBVoiceEventHandler;
export {RBVoiceEventHandler};
