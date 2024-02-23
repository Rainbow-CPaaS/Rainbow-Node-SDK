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

export {};


const Utils = require("../../common/Utils");
const NameUpdatePrio = require("../../common/models/Contact").NameUpdatePrio;

const xml = require("@xmpp/xml");
const PromiseQueue = require("../../common/promiseQueue");

const prettydata = require("../pretty-data").pd;

const LOG_ID = "XMPP/HNDL/TEL - ";

/*********************************************************************/
/** PRIVATE CONSTRUCTOR                                             **/
/*********************************************************************/
const CallFailureLabels = {
    "DESTNOTOBTAINABLE": "outOfService",
    "DONOTDISTURB": "dnd",
    "TRUNKSBUSY": "trunksbusy"
};

@logEntryExit(LOG_ID)
class TelephonyEventHandler extends GenericHandler {
	public MESSAGE: any;
	public IQ_RESULT: any;
	public IQ_ERROR: any;
	public telephonyService: any;
	public contactService: any;
	public promiseQueue: any;
	public _profiles: any;
    public xmppUtils: XMPPUTils;
	/*public onIqResultReceived: any;
	public onIqGetPbxAgentStatusReceived: any;
	public onMessageReceived: any;
    public onInitiatedEvent: any;
    public onOriginatedEvent: any;
	public getCall: any;
	public onDeliveredEvent: any;
	public onEstablishedEvent: any;
	public onRetrieveCallEvent: any;
	public onClearCallEvent: any;
	public onHeldEvent: any;
	public onQueuedEvent: any;
	public onDivertedEvent: any;
	public onTransferEvent: any;
	public getOrCreateCall: any;
	public onConferenceEvent: any;
	public onVoiceMessageEvent: any;
	public onUpDateCallEvent: any;
	public onFailCallEvent: any;
	public onCallForwardedEvent: any;
	public onNomadicStatusEvent: any;
	public createConferenceCall: any;

	 */

    static getClassName(){ return 'TelephonyEventHandler'; }
    getClassName(){ return TelephonyEventHandler.getClassName(); }

    constructor(xmppService : XMPPService, telephonyService, contactService, profileService) {
        super(xmppService);

        let that = this;
        this.MESSAGE = "jabber:client.message";
        this.IQ_RESULT = "jabber:client.iq.result";
        this.IQ_ERROR = "jabber:client.iq.error";

        /*this.MESSAGE_GROUPCHAT = "jabber:client.message.groupchat";
        this.MESSAGE_WEBRTC = "jabber:client.message.webrtc";
        this.MESSAGE_MANAGEMENT = "jabber:client.message.management";
        this.MESSAGE_ERROR = "jabber:client.message.error";
        this.MESSAGE_HEADLINE = "jabber:client.message.headline";
        this.MESSAGE_CLOSE = "jabber:client.message.headline";
        */
        this.xmppUtils = XMPPUTils.getXMPPUtils();

        this.telephonyService = telephonyService;
        this.contactService = contactService;

        this.promiseQueue = PromiseQueue.createPromiseQueue(that.logger);
        this._profiles = profileService;

    }

    onIqResultReceived (msg, stanza) {
        let that = this;
        let children = stanza.children;
        children.forEach((node) => {
            switch (node.getName()) {
                case "pbxagentstatus":
                    that.onIqGetPbxAgentStatusReceived(stanza, node);
                    break;
                case "default":
                    //that.logger.log("warn", LOG_ID + "(handleXMPPConnection, onIqResultReceived) not managed - 'stanza'", node.getName());
                    break;
                default:
                //that
                //  .logger
                //.log("warn", LOG_ID + "(handleXMPPConnection, onIqResultReceived) child not managed for iq - 'stanza'", node.getName());
            }
        });
    };

    // Private methods
    onIqGetPbxAgentStatusReceived (stanza, node) {
        let that = this;

        let pbxagentstatus = {
            "phoneapi" : "",
            "xmppagent" : "",
            "version" : ""
        };

        let subchildren = node.children;
        subchildren.forEach(function (item) {
            if (typeof item === "object") {
                let itemName = item.getName();
                if (itemName) {
                    pbxagentstatus[itemName] = item.text();
                }
            }
        });

        if (pbxagentstatus.version) {
            let phoneApi = pbxagentstatus.phoneapi;
            let xmppAgent = pbxagentstatus.xmppagent;
            let agentVersion = pbxagentstatus.version;
            let agentStatus = { "phoneApi": phoneApi, "xmppAgent": xmppAgent, "agentVersion": agentVersion };
            that.logger.log("debug", LOG_ID + "(onIqGetPbxAgentStatusReceived)  - send rainbow_onpbxagentstatusreceived 'agentStatus'", agentStatus);
            that.eventEmitter.emit("rainbow_onpbxagentstatusreceived", agentStatus);
        }
    };


    onMessageReceived (msg, stanza) {
        let that = this;

        that.logger.log("internal", LOG_ID + "(onMessageReceived) _entering_ : ", msg, stanza.root ? prettydata.xml(stanza.root().toString()) : stanza);
        try {
            let stanzaElem = stanza;
            //let that = this;

            // Ignore "Offline" message
            let delay = stanzaElem.getChild("delay");
            if (delay && delay.text() === "Offline Storage") {
                return true;
            }

            let from = stanza.attrs.from;
            let to = stanza.attrs.to;

            // Treat WEBRTC Events
            let actionElmPropose = stanzaElem.getChild("propose");
            if (actionElmPropose !== undefined) {
                this.onProposeMessageReceived(actionElmPropose, from);
                return true;
            }

            let actionElmRetract = stanzaElem.getChild("retract");
            if (actionElmRetract !== undefined) {
                this.onRetractMessageReceived(actionElmRetract, from);
                return true;
            }

            let actionElmAccept = stanzaElem.getChild("accept");
            if (actionElmAccept !== undefined) {
                this.onAcceptMessageReceived(actionElmAccept, from);
                return true;
            }

            // Treat Telephony (3PCC) Events
            let actionElm = stanzaElem.getChild("callservice");
            if (actionElm === undefined) {
                return true;
            }
            let actionElem = null;
            let actionElemName = null;
            for (let i = 0; i < actionElm.children.length; i++) {
                if (!actionElemName) {
                    if (actionElm.children[i].name) {
                        actionElemName = actionElm.children[i].name.toLowerCase();
                        actionElem = actionElm.children[i];
                    }
                }
            }
            if (actionElemName) {
                that.logger.log("debug", LOG_ID + "(onMessageReceived) ", that.logger.colors.debug("-- event -- ", actionElemName));
                // Handle the event
                switch (actionElemName) {
                    case "initiated" :
                        this.promiseQueue.add(function () {
                            return that.onInitiatedEvent(actionElem);
                        });
                        break; // */
                    case "originated":
                        this.promiseQueue.add(function () {
                            return that.onOriginatedEvent(actionElem);
                        });
                        break; // */
                    case "delivered":
                        this.promiseQueue.add(function () {
                            return that.onDeliveredEvent(actionElem);
                        });
                        break;
                    case "established":
                        this.promiseQueue.add(function () {
                            return that.onEstablishedEvent(actionElem);
                        });
                        break;

                    case "retrievecall":
                        this.promiseQueue.add(function () {
                            return that.onRetrieveCallEvent(actionElem);
                        });
                        break;
                    case "queued":
                        this.promiseQueue.add(function () {
                            return that.onQueuedEvent(actionElem);
                        });
                        break;
                    case "holdcall":
                    case "held":
                        this.promiseQueue.add(function () {
                            return that.onHeldEvent(actionElem);
                        });
                        break; // OLD SYNTAX TO BE REMOVED
                    case "diverted":
                        this.promiseQueue.add(function () {
                            return that.onDivertedEvent(actionElem);
                        });
                        break;
                    case "transfercall":
                    case "transferred":
                        this.promiseQueue.add(function () {
                            return that.onTransferEvent(actionElem);
                        });
                        break; // OLD SYNTAX TO BE REMOVED
                    case "conferenced":
                        this.promiseQueue.add(function () {
                            return that.onConferenceEvent(actionElem);
                        });
                        break;
                    case "connectioncleared":
                        this.promiseQueue.add(function () {
                            return that.onClearCallEvent(actionElem);
                        });
                        break;
                    case "failed":
                        this.promiseQueue.add(function () {
                            return that.onFailCallEvent(actionElem);
                        });
                        break;
                    case "messaging":
                        this.promiseQueue.add(function () {
                            return that.onVoiceMessageEvent(actionElem);
                        });
                        break;
                    case "updatecall":
                        this.promiseQueue.add(function () {
                            return that.onUpDateCallEvent(actionElem);
                        });
                        break;
                    case "forwarded":
                        this.promiseQueue.add(function () {
                            return that.onCallForwardedEvent(actionElem);
                        });
                        break;
                    case "nomadicstatus":
                        this.promiseQueue.add(function () {
                            return that.onNomadicStatusEvent(actionElem);
                        });
                        break; 
                    case "voicemessages":
                        this.promiseQueue.add(function () {
                            return that.onVoiceMessagesEvent(actionElem);
                        });
                        break;
                    // */
                    default:
                        that.logger.log("internal", LOG_ID + "(onMessageReceived) untreated actionElemName : ", actionElemName);
                }
                // */
                return true;
            } else {
                that.logger.log("error", LOG_ID + "(onMessageReceived) -- failure -- no name found in callservice children.");
                that.logger.log("internalerror", LOG_ID + "(onMessageReceived) -- failure -- no name found in callservice children : ", stanzaElem);
            }
        }
        catch (error) {
            that.logger.log("error", LOG_ID + "(onMessageReceived) CATCH Error !!! -- failure -- ");
            that.logger.log("internalerror", LOG_ID + "(onMessageReceived) CATCH Error !!! -- failure -- : ", error);
            //return true;
        }

        that.logger.log("debug", LOG_ID + "(onMessageReceived) _exiting_");
        return true;
    };

    async onProposeMessageReceived (node, from) {
        let that = this;
        /*
        stanza : <message 
  xmlns='jabber:client' xml:lang='en' to='29b4874d1a4b48c9be13c559da4efe3e@openrainbow.net' from='adcf613d42984a79a7bebccc80c2b65e@openrainbow.net/web_win_2.100.8_B753ZT1i' id='web_225e5b25-56e2-4bec-ad24-9c56863bae1f'>
  <propose displayname='vincent00 berder00' id='web_aae57a25-b08f-48f3-9c17-343711f21dc8' 
    xmlns='urn:xmpp:jingle-message:0'>
    <description media='audio' 
      xmlns='urn:xmpp:jingle:apps:rtp:1'/>
      <unifiedplan 
        xmlns='urn:xmpp:jingle:apps:jsep:1'/>
      </propose>
    </message>
         */

        that.logger.log("internal", LOG_ID + "(onProposeMessageReceived) node - ", node);
        let id = ( node.attrs ) ? node.attrs.id : undefined;
        let descriptionElm = node.getChild("description");
        let description : { media : string, xmlns : string } = { media : undefined, xmlns : undefined };
        description.media = ( descriptionElm && descriptionElm.attrs ) ? descriptionElm.attrs.media : undefined;
        description.xmlns = ( descriptionElm && descriptionElm.attrs ) ? descriptionElm.attrs.xmlns : undefined;
        let resource = that.xmppUtils.getResourceFromFullJID(from);
        let unifiedplanElm = node.getChild("unifiedplan");
        let unifiedplan : { xmlns : string } = { xmlns : undefined };
        unifiedplan.xmlns = ( unifiedplanElm && unifiedplanElm.attrs ) ? unifiedplanElm.attrs.xmlns : undefined;
        let xmlns = ( node && node.attrs ) ? node.attrs.xmlns : undefined;

        let contact = await that.contactService.getContactByJid(from, true);
        that.eventEmitter.emit("evt_internal_propose", {contact, resource, xmlns, description, unifiedplan, id });
    };

    async onRetractMessageReceived (node, from) {
        /*
        stanza : <message 
  xmlns='jabber:client' xml:lang='en' to='29b4874d1a4b48c9be13c559da4efe3e@openrainbow.net' from='adcf613d42984a79a7bebccc80c2b65e@openrainbow.net/web_win_2.100.8_B753ZT1i' id='web_8f8b799f-5b40-419f-b735-69af7b8a9b48'>
  <retract displayname='vincent00 berder00' id='web_aae57a25-b08f-48f3-9c17-343711f21dc8' 
    xmlns='urn:xmpp:jingle-message:0'/>
  </message>
         */
        let that = this;

        that.logger.log("internal", LOG_ID + "(onRetractMessageReceived) node - ", node);
        let id = ( node.attrs ) ? node.attrs.id : undefined;
        let resource = that.xmppUtils.getResourceFromFullJID(from);
        let xmlns = ( node && node.attrs ) ? node.attrs.xmlns : undefined;

        let contact = await that.contactService.getContactByJid(from, true);
        that.eventEmitter.emit("evt_internal_retract", {contact, resource, xmlns, id });
    };

    async onAcceptMessageReceived (node, from) {
        /*
        stanza : <message 
  xmlns='jabber:client' xml:lang='en' to='29b4874d1a4b48c9be13c559da4efe3e@openrainbow.net' from='29b4874d1a4b48c9be13c559da4efe3e@openrainbow.net/web_win_2.100.9_LqVU9olu' id='web_c0c98083-94e1-40a9-a5ab-7df2d08d8342'>
  <accept 
    xmlns='urn:xmpp:jingle-message:0' id='web_807f5001-e339-43c1-8818-d07abe75ebcb'/>
  </message>
         */
        let that = this;

        that.logger.log("internal", LOG_ID + "(onAcceptMessageReceived) node - ", node);
        let id = ( node.attrs ) ? node.attrs.id : undefined;
        let resource = that.xmppUtils.getResourceFromFullJID(from);
        let xmlns = ( node && node.attrs ) ? node.attrs.xmlns : undefined;

        let contact = await that.contactService.getContactByJid(from, true);
        that.eventEmitter.emit("evt_internal_accept", {contact, resource, xmlns, id });
    };

    /*********************************************************************/
    /** INITIATED CALL STUFF                                           **/
    /*********************************************************************/
    onInitiatedEvent (initiatedElem) {
        let that = this;

        that.logger.log("internal", LOG_ID + "(onInitiatedEvent) _entering_ : ", initiatedElem);
        return that.getCall(initiatedElem)
            .then(function (call : Call) {
                try {
                    /*if (call.status === Call.Status.QUEUED_INCOMING) {
                        return Promise.resolve(undefined);
                    } // */

                    let deviceState = initiatedElem.attr("deviceState");
                    //let devicetype = initiatedElem.attr("devicetype");
                    //let callId = initiatedElem.attr("callId");
                    if (deviceState && deviceState === "LCI_INITIATED") {
                        call.setStatus(Call.Status.DIALING );
                        // Update call info
                        //that.logger.log("internal", LOG_ID + "(updateCallContact) send evt_internal_callupdated ", call);
                        that.eventEmitter.emit("evt_internal_callupdated", call);
                    }
                    return Promise.resolve(undefined);
                }
                catch (error) {
                    let errorMessage = "onInitiatedEvent -- " + error.message;
                    that.logger.log("error", LOG_ID + "(onInitiatedEvent) Catch Error !!! " );
                    that.logger.log("error", LOG_ID + "(onInitiatedEvent) Catch Error !!! : ", errorMessage);
                    return Promise.reject(new Error(errorMessage));
                }
            });
        // */
    };


    /*********************************************************************/
    /** ORIGINATED CALL STUFF                                           **/
    /*********************************************************************/
    onOriginatedEvent (originatedElem) {
        let that = this;
        that.logger.log("debug", LOG_ID + "(onOriginatedEvent) _entering_ : ", originatedElem);
        return that.getCall(originatedElem)
            .then(function (call) {
                try {
                    let jid = originatedElem.attr("endpointIm");
                    let phoneNumber = originatedElem.attr("endpointTel");
                    let currentCalled = {
                        contactPhoneNumber: "",
                        contact: call.contact,
                        participantsPhoneNumbers: null,
                        participants: null
                    };

                    // PCG has some info
                    if (jid || phoneNumber) {
                        currentCalled.contactPhoneNumber = (phoneNumber ? phoneNumber : "");
                    }

                    // Unknown user
                    else if (call.contact && call.contact.temp) {
                        currentCalled.contactPhoneNumber = call.contact._id;//that is the only current known phoneNumber
                    }

                    call.setCurrentCalled(currentCalled);

                    /*let deviceState = call.deviceState;
                    //let devicetype = initiatedElem.attr("devicetype");
                    //let callId = initiatedElem.attr("callId");
                    if (deviceState && deviceState === "LCI_CONNECTED") {
                        call.setStatus(Call.Status.DIALING );
                        // Update call info
                        that.logger.log("debug", LOG_ID + "(updateCallContact) send evt_internal_callupdated ", call);
                        that.eventEmitter.emit("evt_internal_callupdated", call);
                    } */

                    return Promise.resolve(undefined);
                }
                catch (error) {
                    let errorMessage = "onOriginatedEvent -- " + error.message;
                    that.logger.log("error", LOG_ID + "(onOriginatedEvent) Catch Error !!! " );
                    that.logger.log("internalerror", LOG_ID + "(onOriginatedEvent) Catch Error !!! : ", errorMessage);
                    return Promise.reject(new Error(errorMessage));
                }
            });
        // */
    };


    /*********************************************************************/
    /** DELIVERED STUFF                                                 **/
    /*********************************************************************/
    onDeliveredEvent  (deliveredElem) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onDeliveredEvent) _entering_ : ", deliveredElem);
        //let that = this;
        return that.getCall(deliveredElem).then(function (call) {
            try {
                if (call.status === Call.Status.QUEUED_INCOMING) {
                    return Promise.resolve(undefined);
                }

                let type = deliveredElem.attr("type");
                let jid = deliveredElem.attr("endpointIm");
                let phoneNumber = deliveredElem.attr("endpointTel");

                // Update call info
                call.setStatus((type === "outgoing") ? Call.Status.RINGING_OUTGOING : Call.Status.RINGING_INCOMING);
                call.startDate = null;
                call.vm = false;

                that.logger.log("internal", LOG_ID + "(onDeliveredEvent) call : ", call);

                // Update contact info if necessary
                return that.updateCallContact(jid, phoneNumber, "delivered", call);
            }
            catch (error) {
                let errorMessage = "onDeliveredEvent -- " + error.message;
                that.logger.log("error", LOG_ID + "(onDeliveredEvent) Catch Error !!! " );
                that.logger.log("internalerror", LOG_ID + "(onDeliveredEvent) Catch Error !!! : ", errorMessage);
                return Promise.reject(new Error(errorMessage));
            }
        }); // */
    };


    /*********************************************************************/
    /** ESTABLISHED STUFF                                               **/
    /*********************************************************************/
    onEstablishedEvent (establishedElem) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onEstablishedEvent) _entering_ : ", establishedElem);
        //let that = this;
        return that.getCall(establishedElem).then(function (call) {
            try {
                let jid = establishedElem.attr("endpointIm");
                let phoneNumber = establishedElem.attr("endpointTel");

                // Call already exists and IS NOT a conference, update contact info if necessary
                if (call.contact && call.contact._id) {
                    call.setStatus(Call.Status.ACTIVE);

                    // Update contact info as necessary
                    return that.updateCallContact(jid, phoneNumber, "established", call);
                }
                // Call already exists and IS a conference, update contact info if necessary
                else if (call.participants && call.participants.length > 0) {
                    //recover former matching contact from participants
                    let contactRecovered = null;
                    for (let i = 0; (i < call.participants.length && !contactRecovered); i++) {
                        if (call.participants[i].id === jid) {
                            contactRecovered = call.participants[i];
                        }
                        else if (call.currentCalled.participantsPhoneNumbers &&
                            call.currentCalled.participantsPhoneNumbers.length > 0 &&
                            call.currentCalled.participantsPhoneNumbers[i] === phoneNumber) {
                            contactRecovered = call.participants[i];
                        }
                    }
                    //clean former conf struct & update contact
                    call.participants = [];
                    call.isConference = false;
                    let currentCalled = call.getCurrentCalled();
                    if (contactRecovered) {
                        call.setContact(contactRecovered);
                        call.setStatus(Call.Status.ACTIVE);
                        currentCalled = {contactPhoneNumber: phoneNumber, contact: contactRecovered};
                        call.setCurrentCalled(currentCalled);
                        //that.logger.log("internal", LOG_ID + "(onEstablishedEvent) send evt_internal_callupdated ", call);
                        that.eventEmitter.emit("evt_internal_callupdated", call);
                        //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    }
                    else { // no matching contact strange but go ahead ...
                        if (!jid && !phoneNumber) {
                            phoneNumber = "****";
                        }
                        return that.contactService.getOrCreateContact(jid, phoneNumber)
                            .then(function (contact) {
                                call.setContact(contact);
                                call.setStatus(Call.Status.ACTIVE);
                                currentCalled = {contactPhoneNumber: phoneNumber, contact: contact};
                                call.setCurrentCalled(currentCalled);
//                                    $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                                //that.logger.log("internal", LOG_ID + "(onEstablishedEvent) send evt_internal_callupdated ", call);
                                that.eventEmitter.emit("evt_internal_callupdated", call);

                                return Promise.resolve(undefined);
                            });
                    }
                } else {
                    that.logger.log("debug", LOG_ID + "(onEstablishedEvent) Neither contact, nor participant found!" );
                }
                return Promise.resolve(undefined);
            }
            catch (error) {
                let errorMessage = "onEstablishedEvent -- " + error.message;
                that.logger.log("error", LOG_ID + "(onEstablishedEvent) Catch Error!!! " );
                that.logger.log("internalerror", LOG_ID + "(onEstablishedEvent) Catch Error!!! : ", errorMessage);
                return Promise.reject(new Error(errorMessage));
            }
        }); // */
    };

    /*********************************************************************/
    /** RETRIEVE CALL STUFF                                             **/
    /*********************************************************************/
    onRetrieveCallEvent (retrieveElem) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onRetrieveCallEvent) _entering_ : ", retrieveElem);
        return that.getCall(retrieveElem).then(function (call) {
            call.setStatus(Call.Status.ACTIVE);
            //that.logger.log("internal", LOG_ID + "(onRetrieveCallEvent) send evt_internal_callupdated ", call);
            that.eventEmitter.emit("evt_internal_callupdated", call);
            //    $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
        });
        // */
    };

    /*********************************************************************/
    /** CLEAR CALL STUFF                                                **/
    /*********************************************************************/
    onClearCallEvent (clearElem) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onClearCallEvent) _entering_ : ", clearElem);
        //let that = this;
        return that.getCall(clearElem).then(async (call) => {
            if (call.status !== Call.Status.ERROR) {
                call.setStatus(Call.Status.UNKNOWN);
                let cause = clearElem.attr("cause");
                let deviceState = clearElem.attr("deviceState");
                call.cause = cause;
                call.deviceState = deviceState;
                //that.logger.log("internal", LOG_ID + "(onClearCallEvent) send evt_internal_callupdated ", call);
                that.eventEmitter.emit("evt_internal_callupdated", call);
                await that.telephonyService.clearCall(call);

                //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
            }
        }); // */
    };

    /*********************************************************************/
    /** HOLD CALL STUFF                                                 **/
    /*********************************************************************/
    onHeldEvent (heldElem) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onHeldEvent) _entering_ : ", heldElem);
        return that.getCall(heldElem).then(function (call) {
            try {
                let connectionId = heldElem.attr("callId");
                if (!connectionId) {
                    connectionId = heldElem.attr("heldCallId");
                } // TODO: WHY and WHEN
                let callDeviceId = Call.getDeviceIdFromConnectionId(call.connectionId);
                let holdDeviceId = Call.getDeviceIdFromConnectionId(connectionId);
                if (callDeviceId === holdDeviceId) {
                    call.setStatus(Call.Status.HOLD);
                }

                // Same callId but different equipmentId (We receive equipment id of user who put us in held)
                else {
                    call.setStatus(Call.Status.PUT_ON_HOLD);
                }
                //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                //that.logger.log("internal", LOG_ID + "(onHeldEvent) send evt_internal_callupdated ", call);
                that.eventEmitter.emit("evt_internal_callupdated", call);

                return Promise.resolve(undefined);
            }
            catch (error) {
                let errorMessage = "onHeldEvent -- " + error.message;
                that.logger.log("error", LOG_ID + "(onHeldEvent) Catch Error!!! " );
                that.logger.log("internalerror", LOG_ID + "(onHeldEvent) Catch Error!!! : ", errorMessage);
                return Promise.reject(new Error(errorMessage));
            }
        }); // */
    };

    /*********************************************************************/
    /** QUEUED STUFF                                                    **/
    /*********************************************************************/
    onQueuedEvent (queuedElem) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onQueuedEvent) _entering_ : ", queuedElem);
        //let that = this;
        let cause = queuedElem.attr("cause");

        if (cause === "PARK") {
            that.logger.log("warn", LOG_ID + "(onQueuedEvent) - ignore PARK cause");
            return Promise.resolve(undefined);
        }
        if (cause === "NEWCALL") {
            that.logger.log("warn", LOG_ID + "(onQueuedEvent) - ignore NEWCALL cause");
            return Promise.resolve(undefined);
        }

        return that.getCall(queuedElem).then(function (call) {
            try {
                let type = queuedElem.attr("type");
                let jid = queuedElem.attr("endpointIm");
                let phoneNumber = queuedElem.attr("endpointTel");

                let status = (type === "outgoing") ? Call.Status.QUEUED_OUTGOING : Call.Status.QUEUED_INCOMING;
                call.setStatus(status);
                call.startDate = null;
                call.vm = false;

                // Update contact info if necessary
                return that.updateCallContact(jid, phoneNumber, "queued", call);
            }
            catch (error) {
                let errorMessage = "onQueuedEvent -- " + error.message;
                that.logger.log("error", LOG_ID + "(onHeldEvent) Catch Error!!! " );
                that.logger.log("internalerror", LOG_ID + "(onHeldEvent) Catch Error!!! : ", errorMessage);
                return Promise.reject(new Error(errorMessage));
            }
        });
        // */
    };

    /*********************************************************************/
    /** DIVERTED STUFF                                                  **/
    /*********************************************************************/
    async onDivertedEvent  (divertedElem) {
    let that = this;
        that.logger.log("internal", LOG_ID + "(onDivertedEvent) _entering_ : ", divertedElem);
        let oldConnectionId = divertedElem.attr("oldCallId");
        let oldCallId = Call.getIdFromConnectionId(oldConnectionId);
        let call = that.telephonyService.getCallFromCache(oldCallId);
        if (!call) {
            that.logger.log("warn", LOG_ID + "(onDivertedEvent) - receive divertedEvent on unknown call --- ignored");
            return Promise.resolve(undefined);
        }
        await that.telephonyService.clearCall(call);
//            $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
        //that.logger.log("internal", LOG_ID + "(onDivertedEvent) send evt_internal_callupdated ", call);
        that.eventEmitter.emit("evt_internal_callupdated", call);

        return Promise.resolve(undefined);
        // */
    };


    /*********************************************************************/
    /** TRANSFER STUFF                                                  **/
    /*********************************************************************/
    async onTransferEvent (transferElem) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onTransferEvent) _entering_ : ", transferElem);
        // let that = this;
        // Extract transfert call parameters
        let activeConnectionId = transferElem.attr("activeCallId");
        let heldConnectionId = transferElem.attr("heldCallId");
        let newConnectionId = transferElem.attr("newCallId");

        // Get active call
        let activeCallId = Call.getIdFromConnectionId(activeConnectionId);
        let activeCall = that.telephonyService.getCallFromCache(activeCallId);

        if (heldConnectionId) {
            that.logger.log("debug", LOG_ID + "(onTransferEvent) heldconnectionId found ", heldConnectionId);

            // Get the held call
            let heldCallId = Call.getIdFromConnectionId(heldConnectionId);
            let heldCall = that.telephonyService.getCallFromCache(heldCallId);

            // Release both calls (active and held)
            if (heldCall) {
                heldCall.setStatus(Call.Status.UNKNOWN);
                //that.logger.log("internal", LOG_ID + "(onTransferEvent) send evt_internal_callupdated ", heldCall);
                that.eventEmitter.emit("evt_internal_callupdated", heldCall);
                await that.telephonyService.clearCall(heldCall);

            } else {
                that.logger.log("debug", LOG_ID + "(onTransferEvent) no  heldCall found");
            }
            if (activeCall) {
                activeCall.setStatus(Call.Status.UNKNOWN);
                //that.logger.log("internal", LOG_ID + "(onTransferEvent) send evt_internal_callupdated ", activeCall);
                that.eventEmitter.emit("evt_internal_callupdated", activeCall);
                await that.telephonyService.clearCall(activeCall);
            } else {
                that.logger.log("debug", LOG_ID + "(onTransferEvent) no activeCall found");
            }

            // $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", heldCall);
            // $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", activeCall);
        }

        if (newConnectionId) {
            that.logger.log("debug", LOG_ID + "(onTransferEvent) newConnectionId found ", newConnectionId);
            let jid = transferElem.attr("newEndpointIm");
            let phoneNumber = transferElem.attr("newEndpointTel");
            let deviceState = transferElem.attr("deviceState");
            if (!deviceState) {
                deviceState = transferElem.attr("deviceStatus");
            } // TO BE REMOVED

            if (activeCall) {
                // Release current call
                activeCall.setStatus(Call.Status.UNKNOWN);
                //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", activeCall);
                //that.logger.log("internal", LOG_ID + "(onTransferEvent) send evt_internal_callupdated ", activeCall);
                that.eventEmitter.emit("evt_internal_callupdated", activeCall);
                await that.telephonyService.clearCall(activeCall);
            } else {
                that.logger.log("debug", LOG_ID + "(onTransferEvent) no activeCall found");
            }
            if (!jid && !phoneNumber) {//secret identity
                phoneNumber = "****";
            }
            let deviceType = transferElem.find("deviceType");
            return that.getOrCreateCall(newConnectionId, jid, deviceType, phoneNumber)
                .then(function (newCall) {
                    let globalCallId = transferElem.attr("globalCallId");
                    if (globalCallId) {
                        newCall.setGlobalCallId(globalCallId);
                    }
                    let correlatorData = transferElem.attr("correlatorData");
                    if (correlatorData) {
                        newCall.correlatorData = correlatorData;
                    }
                    if (deviceState && deviceState === "LCI_ALERTING") {
                        newCall.setStatus(Call.Status.RINGING_INCOMING);
                    }
                    else {
                        newCall.setStatus(Call.Status.ACTIVE);
                    }
                    // Update contact info if necessary
                    return that.updateCallContact(jid, phoneNumber, "transfercall", newCall);
                });
        } else {
            return Promise.resolve(undefined);
        }
        // */
    };


    /*********************************************************************/
    /** CONFERENCE STUFF                                                **/
    /*********************************************************************/
    onConferenceEvent (conferencedElem) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onConferenceEvent) _entering_ : ", conferencedElem);

        //let that = this;

        // Get connectionsIds
        let primaryOldConnectionId = conferencedElem.getChild("primaryOldCallId") ? conferencedElem.getChild("primaryOldCallId").getText() : "";
        let secondaryOldConnectionId = conferencedElem.getChild("secondaryOldCallId") ? conferencedElem.getChild("secondaryOldCallId").getText() : "";
        let newConnectionId = conferencedElem.getChild("newCallId") ? conferencedElem.getChild("newCallId").getText() : "";
        that.logger.log("debug", LOG_ID + "(onConferenceEvent) primaryOldConnectionId - ", primaryOldConnectionId);
        that.logger.log("debug", LOG_ID + "(onConferenceEvent) secondaryOldConnectionId - ", secondaryOldConnectionId);
        that.logger.log("debug", LOG_ID + "(onConferenceEvent) newConnectionId - ", newConnectionId);

        // Extract callIds
        let primaryOldCallId = Call.getIdFromConnectionId(primaryOldConnectionId);
        let secondaryOldCallId = Call.getIdFromConnectionId(secondaryOldConnectionId);
        that.logger.log("debug", LOG_ID + "(onConferenceEvent) primaryOldCallId - ", primaryOldCallId);
        that.logger.log("debug", LOG_ID + "(onConferenceEvent) secondaryOldCallId - ", secondaryOldCallId);

        // Get current calls
        let primaryOldCall = that.telephonyService.getCallFromCache(primaryOldCallId);
        let secondaryOldCall = that.telephonyService.getCallFromCache(secondaryOldCallId);

        // Prepare participant promises
        let confParticipants = [];
        let participantPromises = [];
        let confParticipantsPhoneNumbers = [];
        let confContactsInfos = [];

        let participantsElmt = conferencedElem.getChild("participants");
        that.logger.log("internal", LOG_ID + "(onConferenceEvent) participantsElmt - ", participantsElmt);
        let participantElmts = participantsElmt.getChildren("participant");
        that.logger.log("internal", LOG_ID + "(onConferenceEvent) participantElmts - ", participantElmts);
        participantElmts.forEach(function (participantElem) {
            //let participantElem = angular.element(this);
            let endpointTel = participantElem.find("endpointTel").getText();
            that.logger.log("debug", LOG_ID + "(onConferenceEvent) endpointTel - ", endpointTel);
            let endpointIm = participantElem.find("endpointIm").getText();
            that.logger.log("debug", LOG_ID + "(onConferenceEvent) endpointIm - ", endpointIm);
            let callId = participantElem.find("callId").getText();
            that.logger.log("debug", LOG_ID + "(onConferenceEvent) callId - ", callId);
            let role = participantElem.find("role").getText();
            that.logger.log("debug", LOG_ID + "(onConferenceEvent) role - ", role);

            let contactInfos = {
                endpointTel : endpointTel,
                endpointIm : endpointIm,
                callId : callId,
                role : role
            };

            confContactsInfos.push(contactInfos);

            if (!(endpointIm && that.contactService.isUserContactJid(endpointIm))) {
                participantPromises.push(new Promise(function (resolve, reject) {
                    if (!endpointIm && !endpointTel) {
                        endpointTel = "****";
                    }
                    //if no endpointIm try to extract contact info from primary or secondary calls
                    if (!endpointIm && primaryOldCall && primaryOldCall.contact &&
                        primaryOldCall.currentCalled.contactPhoneNumber === endpointTel) {
                        confParticipants.push(primaryOldCall.contact);
                        confParticipantsPhoneNumbers.push(endpointTel);
                        resolve(undefined);
                    }
                    else if (!endpointIm && secondaryOldCall && secondaryOldCall.contact &&
                        secondaryOldCall.currentCalled.contactPhoneNumber === endpointTel) {
                        confParticipants.push(secondaryOldCall.contact);
                        confParticipantsPhoneNumbers.push(endpointTel);
                        resolve(undefined);
                    }
                    else {
                        that.contactService.getOrCreateContact(endpointIm, endpointTel)
                            .then(function (contact) {
                                //manage Outlook Call Party identification
                                /*  let centralizedService = $injector.get("centralizedService");
                                  centralizedService.outlook.updateContactFromOutlookInfos(contact, endpointTel)
                                      .then(
                                          function successCallback(updateStatus) {
                                              if (updateStatus) {
                                                  that.logger.log("debug", LOG_ID + " on conferenced, update from outlook for contact :" + contact.displayNameMD5);
                                                  //that.makeUpdateContact(call, contact, phoneNumber, actionElemName);
                                              } else {
                                                  that.logger.log("debug", LOG_ID + "on conferenced, no update from outlook for contact :" + contact.displayNameMD5);
                                              }
                                          },
                                          function errorCallback() {
                                              that.logger.log("debug", LOG_ID + "on conferenced, no Outlook search available");
                                          }
                                      )
                                      .finally(function () {
                                      */
                                confParticipants.push(contact);
                                confParticipantsPhoneNumbers.push(endpointTel);
                                resolve(undefined);
                                //});
                            })
                            .catch(function (error) {
                                that.logger.log("debug", LOG_ID + "(onConferenceEvent) Impossible to get contact - " );
                                that.logger.log("internaldebug", LOG_ID + "(onConferenceEvent) Impossible to get contact - : ", error.message);
                                reject();
                            });
                    }
                }));
            }
        });

        // Get participants asynchronously
        return Promise.all(participantPromises)
            .then(async () => {
                // Release previous calls
                if (primaryOldCall) {
                    primaryOldCall.setStatus(Call.Status.UNKNOWN);
                    that.logger.log("internal", LOG_ID + "(onConferenceEvent) release primaryOldCall - ", primaryOldCall);
                    primaryOldCall.setStatus(Call.Status.UNKNOWN);
                    //let cause = clearElem.attr("cause");
                    //let deviceState = clearElem.attr("deviceState");
                    //call.cause = cause;
                    //call.deviceState = deviceState;
                    //that.logger.log("internal", LOG_ID + "(onConferenceEvent) send evt_internal_callupdated ", primaryOldCall);
                    that.eventEmitter.emit("evt_internal_callupdated", primaryOldCall);
                    await that.telephonyService.clearCall(primaryOldCall);
                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", primaryOldCall);
                }
                if (secondaryOldCall) {
                    secondaryOldCall.setStatus(Call.Status.UNKNOWN);
                    that.logger.log("internal", LOG_ID + "(onConferenceEvent) release secondaryOldCall - ", secondaryOldCall);
                    secondaryOldCall.setStatus(Call.Status.UNKNOWN);
                    //let cause = clearElem.attr("cause");
                    //let deviceState = clearElem.attr("deviceState");
                    //call.cause = cause;
                    //call.deviceState = deviceState;
                    //that.logger.log("internal", LOG_ID + "(onConferenceEvent) send evt_internal_callupdated ", secondaryOldCall);
                    that.eventEmitter.emit("evt_internal_callupdated", secondaryOldCall);
                    await that.telephonyService.clearCall(secondaryOldCall);
                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", secondaryOldCall);
                }
                // Create the new conference call
                let newConferenceCall = await that.createConferenceCall(newConnectionId, confParticipants);
                //update currentcalled structure
                let currentCalled = newConferenceCall.getCurrentCalled();
                currentCalled.participants = confParticipants;
                currentCalled.participantsPhoneNumbers = confParticipantsPhoneNumbers;
                newConferenceCall.setCurrentCalled(currentCalled);
                newConferenceCall.setStatus(Call.Status.ACTIVE);
                newConferenceCall.setDeviceType(undefined);
                that.logger.log("internal", LOG_ID + "(onConferenceEvent) create newConferenceCall - " , newConferenceCall);
                that.logger.log("internal", LOG_ID + "(onConferenceEvent) create newConferenceCall - stored :" , that.telephonyService.getCallFromCache(newConferenceCall.id));
                //that.logger.log("internal", LOG_ID + "(onConferenceEvent) send evt_internal_callupdated ", newConferenceCall);
                let conferenceInfos = {
                    primaryOldCall : primaryOldCall,
                    secondaryOldCall : secondaryOldCall,
                    newConferenceCall : newConferenceCall,
                    participants : confContactsInfos
                };
                that.eventEmitter.emit("evt_internal_conferenced", conferenceInfos);
                that.eventEmitter.emit("evt_internal_callupdated", newConferenceCall);
                //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", newConferenceCall);
            });
        // */
    };

    /*********************************************************************/
    /** VOICE MESSAGE STUFF                                            **/
    /*********************************************************************/
    onVoiceMessageEvent (messagingElem) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onVoiceMessageEvent) _entering_ : ", messagingElem);

        // Ignore forbidden requests
        if (!that._profiles.isFeatureEnabled(that._profiles.getFeaturesEnum().TELEPHONY_VOICE_MAIL)) {
            that.logger.log("debug", LOG_ID + "(onVoiceMessageEvent) feature not enabled => IGNORED event");
            return Promise.resolve(undefined);
        }

        // Look for a voiceMessageCounter child
        let voiceMessageCounterValue = messagingElem.getChild("voiceMessageCounter").text();
        if (voiceMessageCounterValue) {
            let ct = Number(voiceMessageCounterValue);
            if (Number.isInteger(ct) && (ct >= 0)) {
                that.telephonyService.voiceMail.setVMCounter(ct);
                that.telephonyService.voiceMail.setVMFlag((ct > 0));
                that.telephonyService.voiceMail.setInfoMsg("");
                //$rootScope.$broadcast("ON_VOICE_MESSAGE_UPDATE_EVENT", ct);
                //that.logger.log("internal", LOG_ID + "(onVoiceMessageEvent) send evt_internal_voicemessageupdated ", ct);
                that.eventEmitter.emit("evt_internal_voicemessageupdated", ct);

            }
        }

        // No voiceMessageCounter child look for voiceMessageWaiting child
        let voiceMessageWaitingValue = "";
        let voiceMessageWaiting = XMPPUTils.getXMPPUtils().findChild( messagingElem, "voiceMessageWaiting");
        if (voiceMessageWaiting) {
            voiceMessageWaitingValue = voiceMessageWaiting.text();
            if (voiceMessageWaitingValue === "changed") {
                return that.telephonyService.getVoiceMessageCounter();
            }
        }

        return Promise.resolve(undefined);
        // */
    };

    /*********************************************************************/
    /** UPDATECALL STUFF                                                **/
    /*********************************************************************/
    onUpDateCallEvent (updatecallElem) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onUpDateCallEvent) _entering_ : ", updatecallElem);

        return that.getCall(updatecallElem).then(function (call) {

            let jid = updatecallElem.attr("endpointIm");
            let phoneNumber = updatecallElem.attr("endpointTel");
            let firstName = "";
            let lastName = "";
            let identity = updatecallElem.getChild("identity");
            let identityFirstName = identity.attr("firstName");
            let identityLastName = updatecallElem.getChild("identity").attr("lastName");
            let identityDisplayName = updatecallElem.getChild("identity").attr("displayName");
            let contactUpdateDone = false;

            if (!config.permitSearchFromPhoneBook) { // <--- allow to permit search even if not the good profile
                //check if phonebook is allowed by profile else no result
                if (!that._profiles.isFeatureEnabled(that._profiles.getFeaturesEnum().TELEPHONY_PHONE_BOOK)) {
                    that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) xnames not allowed for the user profile => IGNORED event");
                    return Promise.resolve(undefined);
                }
            }
            //find Xnames from directories
            if (identityLastName && identityLastName.length) {
                lastName = identityLastName;
                if (identityFirstName && identityFirstName.length) {
                    firstName = identityFirstName;
                }
                that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) received for call ", call.id, " for phoneNumber:", Utils.anonymizePhoneNumber(phoneNumber), " with name : ", firstName.slice(0, 1), "***");
            } else {
                if (identityDisplayName && identityDisplayName.length && identityDisplayName !== phoneNumber) {
                    lastName = identityDisplayName; //Workaround last resort, only displayName is available, hack is to use it as lastName
                    that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) only displayName available");
                } else {
                    that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) xnames not available => IGNORED event");
                    return Promise.resolve(undefined);
                }
            }
            //debug+
            //if (!call.currentCalled.contactPhoneNumber || call.currentCalled.contactPhoneNumber === "") {
            //  $log.debug("[TelephonyServiceEventHandler] onUpDateCallEvent  call.currentCalled.contactPhoneNumber EMPTY !!!");
            //  $log.debug("[TelephonyServiceEventHandler] for call " + call.id + " conf = " + call.isConference);
            //}
            //debug-
            // update contact as necessary
            return that.contactService.getOrCreateContact(jid, phoneNumber)
                .then(function (contact) {
                    if (contact.temp) { //not a rainbow user
                        contact.updateName(firstName, lastName);
                        if (call.contact && call.contact._id) {	//not a conf
                            let currentCalled = {contactPhoneNumber: phoneNumber, contact: contact};
                            if (call.contact._id !== contact._id || call.contact.displayName === phoneNumber || call.contact.getNameUpdatePrio() === NameUpdatePrio.OUTLOOK_UPDATE_PRIO) {
                                contact.setNameUpdatePrio(NameUpdatePrio.SERVER_UPDATE_PRIO);//flag as server prio
                                call.setContact(contact);
                                call.setCurrentCalled(currentCalled);
                                contactUpdateDone = true;
                                that.logger.log("internal", LOG_ID + "(onUpDateCallEvent) xnames updated for ", phoneNumber, "with contact : ", contact.displayNameMD5);
                            }
                        } else if (call.participants && call.participants.length > 0) {
                            let currentCalled = call.getCurrentCalled();
                            for (let i = 0; i < call.participants.length; i++) {
                                if (call.participants[i].temp) {
                                    if (call.participants[i].phoneProCan && call.participants[i].phoneProCan === phoneNumber) {//concerned participant
                                        that.logger.log("internal", LOG_ID + "(onUpDateCallEvent) temp participant ", call.participants[i].displayNameMD5, " updated with : ", contact.displayNameMD5);
                                        call.participants[i] = contact;
                                        call.participants[i].setNameUpdatePrio(NameUpdatePrio.SERVER_UPDATE_PRIO);//flag as server prio
                                        currentCalled.participantsPhoneNumbers[i] = phoneNumber;
                                        currentCalled.participants[i] = contact;
                                        contactUpdateDone = true;
                                    }
                                }
                                else {//former participant is a rainbow user I don't know what to do !!!???
                                    that.logger.log("internal", LOG_ID + "(onUpDateCallEvent) STRANGE former participant was a rainbow: " , call.participants[i].displayNameMD5);
                                }
                            }
                            call.setCurrentCalled(currentCalled);
                        }
                    } else { //rainbow contact found
                        if (call.contact && call.contact._id) {	//not a conf
                            let currentCalled = {contactPhoneNumber: phoneNumber, contact: contact};
                            if (call.contact._id !== contact._id) {//update call.contact if not the good one
                                //workaround+ Because of msg crossing pb udate old temp contact before to set the new one
                                if (call.contact.temp) {
                                    call.contact.updateName(firstName, lastName);
                                    call.contact.setNameUpdatePrio(NameUpdatePrio.SERVER_UPDATE_PRIO);//flag as server prio
                                }
                                //workaround-
                                call.setContact(contact);
                                call.setCurrentCalled(currentCalled);
                                contactUpdateDone = true;
                                that.logger.log("internal", LOG_ID + "(onUpDateCallEvent) call update with rainbow contact : ", contact.displayNameMD5);
                            }
                        } else if (call.participants && call.participants.length > 0) {
                            let currentCalled = call.getCurrentCalled();
                            for (let i = 0; i < call.participants.length; i++) {
                                if (call.participants[i].temp) {
                                    if (call.participants[i].phoneProCan && call.participants[i].phoneProCan === phoneNumber) {//concerned participant
                                        that.logger.log("internal", LOG_ID + "(onUpDateCallEvent) temp participant ", call.participants[i].displayNameMD5, " updated with : ", contact.displayNameMD5);
                                        call.participants[i] = contact;
                                        call.setParticipants(call.participants);//to force an update of the avatars
                                        currentCalled.participantsPhoneNumbers[i] = phoneNumber;
                                        currentCalled.participants[i] = contact;
                                        contactUpdateDone = true;
                                    }
                                }
                                else {//if former participant is the same rainbow user nothing to do except store phoneNumber and participant in call
                                    if (call.participants[i].jid === jid) {//concerned participant
                                        //call.participants[i] = contact;
                                        currentCalled.participantsPhoneNumbers[i] = phoneNumber;
                                        currentCalled.participants[i] = call.participants[i];
                                        contactUpdateDone = true;//??
                                        that.logger.log("internal", LOG_ID + "(onUpDateCallEvent)rainbow participant ", call.participants[i].displayNameMD5, " updated with the same : ", contact.displayNameMD5);
                                    }
                                    else {//not the  good participant nothing to do
                                        that.logger.log("internal", LOG_ID + "(onUpDateCallEvent) other participant not updated : ", call.participants[i].displayNameMD5, " vs ", contact.displayNameMD5);
                                    }
                                }
                            }
                            call.setCurrentCalled(currentCalled);
                        }
                    }

                    if (contactUpdateDone) {
                        //that.logger.log("internal", LOG_ID + "(onUpDateCallEvent) send evt_internal_callupdated ", call);
                        that.eventEmitter.emit("evt_internal_callupdated", call);

                        /*//CR #28178 : workaround : delay event to avoid notification RBNotification mess !!
                        // with telescoping with incoming call popup
                        $interval(function () {
                            $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                        }, 300, 1);
                        // */
                    }
                    else {
                        that.logger.log("debug", LOG_ID + "(onUpDateCallEvent), no update needed for call : ", call.id);
                    }
                });
        });
        // */
    };

    /*********************************************************************/
    /** FAILURE STUFF                                                   **/
    /*********************************************************************/
    onFailCallEvent (failedElem) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onFailCallEvent) _entering_ : ", failedElem);
        let cause = failedElem.attr("cause");
        //let that = this;
        return that.getCall(failedElem).then(async function (call) {
            call.setStatus(Call.Status.ERROR);
            call.errorMessage = CallFailureLabels[cause];
            //call.autoClear = $interval(function () {
            await that.telephonyService.clearCall(call);
            //}, 5000, 1);
            if (!call.errorMessage) {
                call.errorMessage = cause;
            }
            //that.logger.log("internal", LOG_ID + "(onFailCallEvent) send evt_internal_callupdated ", call);
            that.eventEmitter.emit("evt_internal_callupdated", call);

            //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
        });
        // */
    };

    /*********************************************************************/
    /** FORWARD CALL STUFF                                              **/
    /*********************************************************************/
    onCallForwardedEvent (forwardElem) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onCallForwardedEvent) _entering_ : ", forwardElem);
        let call = {
            "forwardType": forwardElem.attr("forwardType"),
            "forwardTo": forwardElem.attr("forwardTo")
        };
        //that.logger.log("internal", LOG_ID + "(onCallForwardedEvent) send evt_internal_callforwarded ", call);
        that.eventEmitter.emit("evt_internal_callforwarded", call);
        return Promise.resolve(undefined);
        /* $rootScope.$broadcast("ON_CALL_FORWARDED_EVENT", {
             "forwardType": forwardElem.attr("forwardType"),
             "forwardTo": forwardElem.attr("forwardTo")
         });
         return $q.when();
         // */
    };

    /*
<message xmlns="jabber:client" xml:lang="en" to="38db98d2907a4c4095742a237b84557c@vberder-all-in-one-dev-1.opentouch.cloud/node_ztapimhe" from="tel_38db98d2907a4c4095742a237b84557c@vberder-all-in-one-dev-1.opentouch.cloud/phone">
<callservice xmlns="urn:xmpp:pbxagent:callservice:1" xmlns:ns7="urn:xmpp:pbxagent:callservice:1">
<nomadicStatus destination="23031" featureActivated="true" makeCallInitiatorIsMain="false" modeActivated="true"/>
     */
    /*********************************************************************/
    /** NOMADIC STATUS STUFF                                              **/
    /*********************************************************************/
    onNomadicStatusEvent (eventElem) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onNomadicStatusEvent) _entering_ : ", eventElem);

        let nomadicstate = {
            "featureActivated": eventElem.attr("featureActivated"),
            "modeActivated": eventElem.attr("modeActivated"),
            "destination": eventElem.attr("destination"),
            "makeCallInitiatorIsMain": eventElem.attr("makeCallInitiatorIsMain")
        };

        that.telephonyService.updateNomadicData(nomadicstate);
        //that.logger.log("debug", LOG_ID + "(onFailCallEvent) send onNomadicStatusEvent ", call);
        //that.eventEmitter.emit("onNomadicStatusEvent", call);
        return Promise.resolve(undefined);
        /* $rootScope.$broadcast("ON_CALL_FORWARDED_EVENT", {
             "forwardType": forwardElem.attr("forwardType"),
             "forwardTo": forwardElem.attr("forwardTo")
         });
         return $q.when();
         // */
    };

    /*********************************************************************/
    /** VOICE MESSAGES
     /*********************************************************************/
    async onVoiceMessagesEvent(eventElem) {
        let that = this;
        /*
        <message 
  xmlns="jabber:client" xml:lang="en" to="a9b77288b939470b8da4611cc2af1ed1@openrainbow.com" from="tel_a9b77288b939470b8da4611cc2af1ed1@openrainbow.com/phone" type="headline" id="974771">
  <callservice 
    xmlns="urn:xmpp:pbxagent:callservice:1">
    <voiceMessages>
      <voiceMessagesCounters unreadVoiceMessages="0"/>
    </voiceMessages>
  </callservice>
</message>
         */
        //that.logger.log("internal", LOG_ID + "(onVoiceMessagesEvent) _entering_ : ", eventElem);

        let infos : any = {};

        that.logger.log("internal", LOG_ID + "(onRoomsContainerManagementMessageReceived) _entering_ : ", "\n", eventElem.root ? prettydata.xml(eventElem.root().toString()):eventElem);
        let xmlNodeStr = eventElem ? eventElem.toString():"<xml></xml>";
        let jsonNode = await getJsonFromXML(xmlNodeStr);
        that.logger.log("debug", LOG_ID + "(onVoiceMessagesEvent) JSON : ", jsonNode);
        infos.voiceMessagesCounters = jsonNode["voiceMessages"]?jsonNode["voiceMessages"]["voiceMessagesCounters"]?jsonNode["voiceMessages"]["voiceMessagesCounters"]['$attrs']:undefined:undefined;

        /* let nomadicstate = {
            "featureActivated": eventElem.attr("featureActivated"),
            "modeActivated": eventElem.attr("modeActivated"),
            "destination": eventElem.attr("destination"),
            "makeCallInitiatorIsMain": eventElem.attr("makeCallInitiatorIsMain")
        }; // */

//        that.telephonyService.updateNomadicData(nomadicstate);
        //that.logger.log("debug", LOG_ID + "(onFailCallEvent) send onNomadicStatusEvent ", call);
        that.eventEmitter.emit("evt_internal_voicemessagesinfo", infos);
    };
    
    /*********************************************************************/
    /** PRIVATE UTILITY METHODS                                         **/
    /*********************************************************************/
    async getCall (elem) {
        let that = this;
        let jid = elem.getAttr("endpointIm");
        let phoneNumber = elem.getAttr("endpointTel");
        let connectionId = elem.getAttr("callId");
        let deviceType = elem.getAttr("deviceType");
        let cause = elem.attr("cause");
        let deviceState = elem.attr("deviceState");
        let type = elem.attr("type");
        let globalCallId = elem.attr("globalCallId");
        let correlatorData = elem.attr("correlatorData");

        if (!connectionId) {
            connectionId = elem.getAttr("heldCallId");
        } // TODO: WHY and WHEN
        that.logger.log("debug", LOG_ID + "(getCall)  - ", jid, " - ", Utils.anonymizePhoneNumber(phoneNumber), " - ", connectionId);
        that.logger.log("internal", LOG_ID + "(getCall) jid : ", jid, ", phoneNumber : ", phoneNumber, ", connectionId : ", connectionId, ", deviceType : ", deviceType);
        let callObj : Call = await that.getOrCreateCall(connectionId, jid, deviceType, phoneNumber);
        let updatedinformations: { connectionId?: string,
            jid?: string,
            deviceType?: string,
            phoneNumber?: string,
            cause? : string,
            deviceState? : string,
            type? : string,
            globalCallId?: string,
            correlatorData?: string
        } = {};
        if (connectionId != null) {
            updatedinformations.connectionId = connectionId;
        }
        if (jid != null) {
            updatedinformations.jid = jid;
        }
        if (deviceType != null) {
            updatedinformations.deviceType = deviceType;
        }
        if (phoneNumber != null) {
            updatedinformations.phoneNumber = phoneNumber;
        }
        if (cause != null) {
            updatedinformations.cause = cause;
        }
        if (deviceState != null) {
            updatedinformations.deviceState = deviceState;
        }
        if (type != null) {
            updatedinformations.cause = type;
        }

        if (globalCallId != null) {
            updatedinformations.globalCallId = globalCallId;
        }

        if (correlatorData != null) {
            updatedinformations.correlatorData = correlatorData;
        }

        callObj.updateCall(updatedinformations);
        // */
        return callObj;
    };

    getOrCreateCall (connectionId, jid, deviceType, phoneNumber ) : Promise<Call> {
        let that = this;
        // let that = this;
        let callId = Call.getIdFromConnectionId(connectionId);
        let call = that.telephonyService.getCallFromCache(callId);
        if (call) {
            return Promise.resolve(call);
        }
        return new Promise(function (resolve) {
            if (jid || phoneNumber) {
                that.contactService.getOrCreateContact(jid, phoneNumber).then(function (contact) {
                    resolve(that.telephonyService.getOrCreateCall(Call.Status.UNKNOWN, connectionId, deviceType, contact));
                });
            }
            else {
                resolve(that.telephonyService.getOrCreateCall(Call.Status.UNKNOWN, connectionId, deviceType, null));
            }
        });
        // */
    };

    async createConferenceCall (connectionId, participants) {
        let that = this;

        let conferenceCall = await that.getOrCreateCall(connectionId, undefined, undefined, undefined);
        that.logger.log("internal", LOG_ID + "(createConferenceCall) conferenceCall : ", conferenceCall);

        conferenceCall.isConference = true;
        conferenceCall.setParticipants(participants);

        //that.telephonyService.addOrUpdateCallToCache(conferenceCall)
        that.logger.log("debug", LOG_ID + "(createConferenceCall) conferenceCall stored : ", that.telephonyService.getCallFromCache(conferenceCall.id));

        return conferenceCall;

        /*
        // Create and configure the conference call
        let conferenceCall = Call.create(Call.Status.UNKNOWN, null, Call.Type.PHONE);
        conferenceCall.setConnectionId(connectionId);
        conferenceCall.isConference = true;
        conferenceCall.setParticipants(participants);
        this.telephonyService._calls[conferenceCall.id] = conferenceCall;
        return conferenceCall;
        // */
    };

    /*********************************************************************/
    /** CALL UPDATE STUFF                                               **/
    /*********************************************************************/

    /**
     * Method analyzeContactChange
     * Analyse if a setContact has to be done following situation
     * @public
     * @param jid [required] jid from PCG
     * @param phoneNumber [required] phone number from PCG
     * @param call [required] the call to update
     * @returns object:{ updateContactToBeDone : boolean, searchOutlookToBeDone :boolean}
     *  updateContactToBeDone true if the contact has to be updated in the call (by setContact)
     *  searchOutlookToBeDone true if an outlook search has to be performed to resolve call identity
     * @memberof TelephonyServiceEventHandler
     */
    analyzeContactChange (jid, phoneNumber, call) {

        let updateContact = false;

        if (!jid && !phoneNumber) { //nothing could be analysed then updated
            return null;
        }
        // One2One Call (not a conference) only call.contact is impacted
        if (!call.isConference) {

            // No contact... Whatever situation set contact
            if (!call.contact) {
                return {updateContactToBeDone: true};
                //return { updateContactToBeDone: true, searchOutlookToBeDone: false };  //OUTLOOK NOT YET DELIVERED
            }

            // PCG known the distant as a rainbow user (no outlook search is necessary)
            if (jid !== "") {
                // Only change if not the same from previous call setting
                if (call.contact._id !== jid) {
                    updateContact = true;
                }
            }
            // No jid available
            else {
                // call.contact not known as rainbow user, contact._id contain former phoneNumber
                if (call.contact.temp) {
                    if ((call.contact._id !== phoneNumber) //called change
                    ) {
                        updateContact = true;
                    }
                    else if (call.contact.displayName === phoneNumber) {//no change but name not known
                        updateContact = false;
                        //searchOutlook = false; //OUTLOOK NOT YET DELIVERED
                    }
                }
                // call.contact known as rainbow user update only if phoneNumber change (except ringing empty case)
                else if (call.getCurrentCalled().contactPhoneNumber !== "" && phoneNumber !== "") {
                    if (call.getCurrentCalled().contactPhoneNumber !== phoneNumber) {
                        updateContact = true;
                    }
                }
            }
            return (updateContact ) ? {
                updateContactToBeDone: updateContact,
            } : null;
        }
    }


    /**
     * Method updateCallContact
     * @public
     * @param jid [required] jid from PCG
     * @param phoneNumber [required] phone number from PCG
     * @param actionElemName [required] name of the action event
     * @param call [required] the call to update
     * @returns {ng.IPromise<{}>} status promise
     * @memberof TelephonyServiceEventHandler
     */
    updateCallContact (jid, phoneNumber, actionElemName, call) {
        let that = this;

        try {
            // Determine if the contact has to be updated from event information
            let updateAnalyse = that.analyzeContactChange(jid, phoneNumber, call);
            // Whatever the contact change, for simple call, after analyse, update at least the call current phoneNumber
            if (!call.isConference && phoneNumber !== "") {
                call.setCurrentCalledContactNumber(phoneNumber);
            }
            if (updateAnalyse) {
                return that.contactService.getOrCreateContact(jid, phoneNumber)
                    .then(function (contact) {
                        that.logger.log("internal", LOG_ID + "(updateCallContact)  on ", actionElemName, ", update contact :", contact.displayNameMD5);
                            that.makeUpdateContact(call, contact, phoneNumber, actionElemName);
                            return Promise.resolve(undefined);
                    });
            } else {
                //that.logger.log("internal", LOG_ID + "(updateCallContact) send evt_internal_callupdated ", call);
                that.eventEmitter.emit("evt_internal_callupdated", call);
                //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                return Promise.resolve(undefined);
            }
        }
        catch (error) {
            let errorMessage = "updateCallContact -- " + error.message;
            that.logger.log("error", LOG_ID + "(updateCallContact) Catch Error !!! ");
            that.logger.log("internalerror", LOG_ID + "(updateCallContact) Catch Error !!! : ", errorMessage);
            return Promise.reject(new Error(errorMessage));
        }
    }

    makeUpdateContact (call, contact, phoneNumber, actionElemName) {
        let that = this;
        call.setContact(contact);
        let currentCalled = {contactPhoneNumber: phoneNumber, contact: contact};
        call.setCurrentCalled(currentCalled);

        //that.logger.log("internal", LOG_ID + "(makeUpdateContact) send evt_internal_callupdated ", call);
        that.eventEmitter.emit("evt_internal_callupdated", call);


       /* if (actionElemName === "delivered" && call.status === Call.Status.RINGING_INCOMING) {
            //CR #28178 : workaround : delay event to avoid notification RBNotification mess !!
            // with telescoping with incoming call popup
            $interval(function () {
                $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
            }, 300, 1);
        }
        else {
            //$interval(function() { $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call); }, 300, 1);
            $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
        }
        // */
    }


}

module.exports.TelephonyEventHandler = TelephonyEventHandler;
export {TelephonyEventHandler};
