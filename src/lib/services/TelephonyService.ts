"use strict";
import {RESTService} from "../connection/RESTService";

export {};

import {XMPPService} from "../connection/XMPPService";

import {ErrorManager} from "../common/ErrorManager";
//const Conversation = require("../common/models/Conversation");
//const Call = require("../common/models/Call");

const moment = require("moment");

const Deferred = require("../common/Utils").Deferred;
const Call = require("../common/models/Call");
const VoiceMail = require("../common/models/VoiceMail");

const utils = require("../common/Utils");

const PubSub = require("pubsub-js");
const TelephonyEventHandler = require("../connection/XMPPServiceHandler/telephonyEventHandler");

import { XMPPUTils } from "../common/XMPPUtils";

const LOG_ID = "TELEPHONY - ";

/**
 * @module
 * @name Telephony
 * @public
 * @description
 *      This services manages PBX phone calls in a conversation. so it manages PBX calls between your PABX associated phone and a recipient's phone. If you don't have this service activated for your Rainbow user, all these methods will return an error when called. <br/><br>
 *      The main methods and events proposed in that service allow to: <br>
 *      - Know if this service is activated or not for the connected user, <br/>
 *      - Know the version of the agent (deployed on the PBX) that monitors your line, <br>
 *      - Handle the basic telephony services: Make a call, take a call, hold a call, retrieve a call and release a call,<br/>
 *      - Listen to the call state change <br><br>
 *      Depending the agent version deployed, some services can return an error (unavailable service) when called
 *
 */
class Telephony {
	public _xmpp: XMPPService;
	public _rest: RESTService;
	public _contacts: any;
	public _eventEmitter: any;
	public logger: any;
	public calls: any;
	public voiceMail: any;
	public userJidTel: any;
	public started: any;
	public agentStatus: any;
	public voicemailNumber: any;
	public pbxId: any;
	public forwardObject: any;
	public nomadicObject: any;
	public nomadicAnswerNotTakedIntoAccount: any;
	public isBasicCallAllowed: any;
	public isSecondCallAllowed: any;
	public isTransferAllowed: any;
	public isConferenceAllowed: any;
	public isVMDeflectCallAllowed: any;
	public voiceMailFeatureEnabled: any;
	public isForwardEnabled: any;
	public isNomadicEnabled: any;
	public telephonyHandlerToken: any;
	public telephonyHistoryHandlerToken: any;
	public startDate: any;
	public _bubbles: any;
	public _profiles: any;
	public telephonyEventHandler: any;
	public makingCall: any;
	public starting: any;
	public stats: any;

    constructor(_eventEmitter, logger) {
        this._xmpp = null;
        this._rest = null;
        this._contacts = null;
        this._eventEmitter = _eventEmitter;
        this.logger = logger;
        this.calls = [];
        this.voiceMail = null;//VoiceMail.createVoiceMail();
        this.userJidTel = "TOBEFILLED";//authService.jidTel;
        this.started = false;
        this.agentStatus = {};

        this.voicemailNumber = null;
        this.pbxId = null;

        this.forwardObject = {};
        this.nomadicObject = {};
        this.nomadicAnswerNotTakedIntoAccount = false;
        this.isBasicCallAllowed = false;
        this.isSecondCallAllowed = false;
        this.isTransferAllowed = false;
        this.isConferenceAllowed = false;
        this.isVMDeflectCallAllowed = false;
        this.voiceMailFeatureEnabled = false;
        this.isForwardEnabled = false;
        this.isNomadicEnabled = false;

    }

    start(_xmpp : XMPPService, _rest : RESTService, _contacts, _bubbles, _profiles) {
        let that = this;
        this.telephonyHandlerToken = [];
        this.telephonyHistoryHandlerToken = [];
        this.logger.log("debug", LOG_ID + "(start) _entering_");
        this.voiceMail = VoiceMail.createVoiceMail(_profiles);
        that.startDate = new Date();

        return new Promise((resolve, reject) => {
            try {
                that._xmpp = _xmpp;
                that._rest = _rest;
                that._contacts = _contacts;
                that._bubbles = _bubbles;
                that._profiles = _profiles;


                that._attachHandlers();

                this
                    .logger
                    .log("debug", LOG_ID + "(start) _exiting_");
                resolve();

            } catch (err) {
                that
                    .logger
                    .log("error", LOG_ID + "(start) Catch ErrorManager !!! ", err.message);
                reject();
            }
        });
    }

    stop() {
        let that = this;
        this
            .logger
            .log("debug", LOG_ID + "(stop) _entering_");

        return new Promise((resolve, reject) => {
            try {
                that._xmpp = null;
                that._rest = null;

                delete that.telephonyEventHandler;
                that.telephonyEventHandler = null;
                that.telephonyHandlerToken.forEach((token) => PubSub.unsubscribe(token));
                that.telephonyHandlerToken = [];

                that.telephonyHistoryHandlerToken.forEach((token) => PubSub.unsubscribe(token));
                that.telephonyHistoryHandlerToken = [];

                that
                    .logger
                    .log("debug", LOG_ID + "(stop) _exiting_");
                resolve();
            } catch (err) {
                that
                    .logger
                    .log("error", LOG_ID + "(stop) _exiting_");
                reject(err);
            }
        });
    }

    _attachHandlers() {
        let that = this;
        that.telephonyEventHandler = new TelephonyEventHandler(that._xmpp, that, that._contacts, that._profiles);
        that.telephonyHandlerToken = [
            PubSub.subscribe(that._xmpp.hash + "." + that.telephonyEventHandler.MESSAGE, that.telephonyEventHandler.onMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that.telephonyEventHandler.IQ_RESULT, that.telephonyEventHandler.onIqResultReceived )
        ];
    }

    init() {
        return new Promise((resolve, reject) => {
            let that = this;
            that.calls = [];

            //that.started = false;
            that.agentStatus = {phoneApi: "disconnected", xmppAgent: "stopped", agentVersion: "unknown"};
            that.voicemailNumber = that._contacts.userContact.voicemailNumber;
            that.pbxId = that._contacts.userContact.pbxId;
            that.makingCall = false;
            that.starting = false;
            //that.voiceMail = VoiceMail.create();

            that.forwardObject = {};
            that.nomadicObject = {};
            that.nomadicAnswerNotTakedIntoAccount = false;


            that.isBasicCallAllowed = that._profiles.isFeatureEnabled(that._profiles.getFeaturesEnum().TELEPHONY_BASIC_CALL);
            that.isSecondCallAllowed = that._profiles.isFeatureEnabled(that._profiles.getFeaturesEnum().TELEPHONY_SECOND_CALL);
            that.isTransferAllowed = that._profiles.isFeatureEnabled(that._profiles.getFeaturesEnum().TELEPHONY_TRANSFER_CALL);
            that.isConferenceAllowed = that._profiles.isFeatureEnabled(that._profiles.getFeaturesEnum().TELEPHONY_CONFERENCE_CALL);
            that.isVMDeflectCallAllowed = that._profiles.isFeatureEnabled(that._profiles.getFeaturesEnum().TELEPHONY_DEFLECT_CALL);
            that.voiceMailFeatureEnabled = that._profiles.isFeatureEnabled(that._profiles.getFeaturesEnum().TELEPHONY_VOICE_MAIL);
            that.isForwardEnabled = that._profiles.isFeatureEnabled(that._profiles.getFeaturesEnum().TELEPHONY_CALL_FORWARD);
            that.isNomadicEnabled = that._profiles.isFeatureEnabled(that._profiles.getFeaturesEnum().TELEPHONY_NOMADIC);

            // Store the user jid tel
            //that.userJidTel = authService.jidTel;
            that.userJidTel = that._rest.loggedInUser.jid_tel;

            that._eventEmitter.on("rainbow_onpresencechanged", that.onTelPresenceChange.bind(that));
//        that._eventEmitter.on("rainbow_onpbxagentstatusreceived", that.onPbxAgentStatusChange.bind(that));

            that.started = false;
            that._xmpp.getAgentStatus().then((data) => {
                that.logger.log("info", LOG_ID + "[init] getAgentStatus  -- ", data);
                resolve();
            });
        });
    }


    /* onPbxAgentStatusChange(data) {
        let that = this;
        that.agentStatus = data;
    } // */

    /**
     * @private
     * @method onTelPresenceChange
     * @instance
     * @memberof Presence
     * @description
     *      Method called when receiving an update on user presence
     */
    onTelPresenceChange (__event, attr?) {
        let that = this;
        if (that._contacts.isTelJid(__event.fulljid)) {
            if (that._contacts.getRessourceFromJid(__event.fulljid) !== "phone") { return true; }
            let jid_im = that._contacts.getImJid(__event.fulljid);
            if (!jid_im) { return true; }

            let status = __event.status;

            if (that._contacts.isUserContactJid(jid_im)) {

                // Receive unavailable status
                if (status === "unavailable" || status === "offline" || status === "") {
                    that.logger.log("info", LOG_ID + "[onTelPresenceChange] received my telephony presence -- " + status);
                    that.started = false;
                    that.calls = [];
                    that.logger.log("debug", LOG_ID + "(onTelPresenceChange) send rainbow_ontelephonystatuschanged ", "stopped");
                    that._eventEmitter.emit("rainbow_ontelephonystatuschanged", "stopped");
                    //$rootScope.$broadcast("ON_TELEPHONY_STATUS_CHANGED_EVENT", "stopped");

                    that.logger.log("info", LOG_ID + "[onTelPresenceChange] === STOPPED ===");
                }

                // Service is not started, try to fetch agent status
                else if (!that.started && !that.starting) {
                    that.logger.log("info", LOG_ID + "[onTelPresenceChange] received my telephony presence -- " + status);
                    that.starting = true;
                    that.getAgentStatus()
                        .then(function() {
                            // that.attachHandlers();
                            return that.getTelephonyState(false);
                        })
                        .then(function() {
                            if (that.isNomadicEnabled) {
                                that.getNomadicStatus()
                                    .then(function() {
                                        if (that.nomadicObject.featureActivated && that.nomadicObject.modeActivated && !that.nomadicObject.makeCallInitiatorIsMain) {
                                            return that.getTelephonyState(true);
                                        }
                                        //return Promise.resolve();
                                    });
                            }
                            //return Promise.resolve();
                        })
                        .then(function() {
                            if (that.isForwardEnabled) {
                                return that.getForwardStatus();
                            }
                            //return Promise.resolve();
                        })
                        .then(function() {
                            // @ts-ignore
                            let startDuration = Math.round(new Date() - that.startDate);
                            that.stats.push({ service: "telephonyService", startDuration: startDuration });
                            that.logger.log("info", LOG_ID + "[onTelPresenceChange] === STARTED (" + startDuration + " ms) ===");
                            that.started = true;
                            that.starting = false;
                            that.logger.log("debug", LOG_ID + "(onTelPresenceChange) send rainbow_ontelephonystatuschanged ", "started");
                            that._eventEmitter.emit("rainbow_ontelephonystatuschanged", "started");
                            //$rootScope.$broadcast("ON_TELEPHONY_STATUS_CHANGED_EVENT", "started");
                        })
                        .catch(function(error) {
                            that.starting = false;
                            that.logger.log("error", LOG_ID + "[onTelPresenceChange] receive telephony presence but no agent response - " + error.message);
                        });
                }
            }
        }
        return true;
    }

    /**
     * @public
     * @method isTelephonyAvailable
     * @instance
     * @description
     *    Check if the telephony service can be used or not (if the connected user has a phone monitored by a PBX)
     * @return {boolean} Return true if the telephony service is configured
     */
    isTelephonyAvailable() {
        return this.started;
    }

    /**
     * @public
     * @method getAgentVersion
     * @instance
     * @description
     *    Get the associated PBX agent version
     * @return {string} Return the version of the agent or "unknown"
     */
    getAgentVersion() {
        let that = this;
        return that.agentStatus.agentVersion || "unknown";
    }

    /**
     * @public
     * @method getXMPPAgentStatus
     * @instance
     * @description
     *    Get the status of the XMPP connection to the PBX Agent
     * @return {string} Return the status of the connections to the agent or "unknown"
     */
    getXMPPAgentStatus() {
        let that = this;
        return that.agentStatus.xmppAgent || "unknown";
    }

    /**
     * @public
     * @method getPhoneAPIStatus
     * @instance
     * @description
     *    Get the status of the Phone API status for the PBX Agent
     * @return {string} Return the Phone API status for to this Agent or "unknown"
     */
    getPhoneAPIStatus() {
        let that = this;
        return that.agentStatus.phoneApi || "unknown";
    }

    getAgentStatus() {
        let that = this;
        //return that.agentStatus;
        return that._xmpp.getAgentStatus().then((data) => {
            that.logger.log("info", LOG_ID + "[getAgentStatus] -- " + data);
            that.agentStatus = data;
        }); // */
    }

    /**
     * @private
     * @method getTelephonyState
     * @param second
     */
    getTelephonyState(second) {
        let that = this;

        return new Promise((resolve, reject) => {
            that._xmpp.getTelephonyState(second).then((data : any) => {
                let existingCalls = data;

                if (existingCalls && existingCalls.length > 0) {
// Traverse existing call
                    let getCallPromises = [];
                    existingCalls.forEach((child : any) => {
                        getCallPromises.push(that.createCallFromConnectionElem(child));
                    });

// Send all getContactPromise
                    Promise.all(getCallPromises)
                        .then(function () {
                            that.logger.log("debug", LOG_ID + "getTelephonyState -- success");
                            resolve();
                        })
                        .catch(function (error) {
                            that.logger.log("error", LOG_ID + "getTelephonyState -- failure -- " + error.message);
                            reject(error);
                        });
                }

                //return data;
            });
        });
    }

    /**
     * @private
     * @param connectionElemObj
     */
    private createCallFromConnectionElem (connectionElemObj) {
        let that = this;
        return new Promise((resolve, reject) => {

            // Extract information
            //let connectionElem = angular.element(connectionElemObj);
            let connectionElem = connectionElemObj;
            let jid = connectionElem.attr("endpointIm");
            let phoneNumber = connectionElem.attr("endpointTel");
            let connectionId = connectionElem.attr("callId");
            let endpointLci = connectionElem.attr("endpointLci");
            let lci = connectionElem.attr("lci");
            let participantsElem = XMPPUTils.getXMPPUtils().findChild(connectionElem, "participants");// connectionElem.find("participant");
            let identityElem = XMPPUTils.getXMPPUtils().findChild(connectionElem, "identity");
            let identityFirstName = identityElem.attr("firstName");
            let identityLastName = identityElem.attr("lastName");
            let firstName = "";
            let lastName = "";

            if (!jid && !phoneNumber) { phoneNumber = "****"; }

            //manage name resolution
            if (that._profiles.isFeatureEnabled(that._profiles.getFeaturesEnum().TELEPHONY_PHONE_BOOK)) {
                //find Xnames, here for simple call only
                if (participantsElem.length === 0 && identityLastName && identityLastName.length) {
                    lastName = identityLastName;
                    if (identityFirstName && identityFirstName.length) {
                        firstName = identityFirstName;
                    }
                    that.logger.log("debug", LOG_ID + " createCallFromConnectionElem - name resolution for: " + connectionId + " for phoneNumber:" + utils.anonymizePhoneNumber(phoneNumber) +
                        " with firstname : " + firstName.slice(0, 1) + "***");
                }
            }

            // Ignore useless info
            if (lci === "LCI_INITIATED") { resolve(); }

            //service.getSnapshotCall(connectionId);

            // Define getParticipants promise
            let getParticipants = function() {
                if (participantsElem.children.length === 0) {
                    return that._contacts.getOrCreateContact(jid, phoneNumber);
                }
                return that.getParticipantsFromParticipantsElem(participantsElem);
            };

            // Call the promise
            getParticipants()
                .then(function(response) {

                    // Extract call status
                    let callStatus = Call.Status.ACTIVE;
                    if (lci === "LCI_HELD" && endpointLci === "LCI_CONNECTED") { callStatus = Call.Status.HOLD; }
                    if (lci === "LCI_CONNECTED" && endpointLci === "LCI_HELD") { callStatus = Call.Status.PUT_ON_HOLD; }
                    if (lci === "LCI_CONNECTED" && endpointLci === "LCI_QUEUED") { callStatus = Call.Status.QUEUED_OUTGOING; }
                    if (lci === "LCI_QUEUED" && endpointLci === "LCI_CONNECTED") { callStatus = Call.Status.QUEUED_INCOMING; }

                    // Create the call object
                    let call = null;
                    let deviceType = connectionElem.find("deviceType");
                    if (participantsElem.children.length === 0) {
                        if (response && response.temp && lastName !== "") {
                            response.updateName(firstName, lastName);
                        }
                        call = that.getOrCreateCall(callStatus, connectionId,deviceType, response );
                        that.logger.log("debug", LOG_ID + " createCallFromConnectionElem - create call for user: " + response.id + " with callId: " + connectionId + " " + lci);
                    }
                    else {
                        call = that.getOrCreateCall(callStatus, connectionId, deviceType, null );
                        call.setParticipants(response);
                        call.isConference = true;
                        that.logger.log("debug", LOG_ID + " createCallFromConnectionElem - create conference call with callId: " + connectionId + " " + lci);
                    }
                    call.relevantEquipmentId = Call.getDeviceIdFromConnectionId(connectionId);

                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    // Send call update event
                    that.logger.log("debug", LOG_ID + "(createCallFromConnectionElem) send rainbow_oncallupdated ", call);
                    that._eventEmitter.emit("rainbow_oncallupdated", call);

                    resolve(call);
                })
                .catch(function(error) {
                    that.logger.log("error", LOG_ID + " createCallFromConnectionElem - failure - " + error.message);
                    reject(error);
                });
        });
    };

    /**
     * @private
     * @method getParticipantsFromParticipantsElem
     * @param participants
     */
    getParticipantsFromParticipantsElem (participants) {
        let that =this;
        return new Promise(function(resolve, reject) {
            let confParticipants = [];

            // Create getParticipantPromise
            let participantPromises = [];

            participants.each(function(elemt) {
                let participantElem = elemt;
                let endpointTel = participantElem.find("endpointTel").text();
                let endpointIm = participantElem.find("endpointIm").text();
                if (!(endpointIm && that._contacts.isUserContactJid(endpointIm))) {
                    participantPromises.push(new Promise(function(resolvePromise, rejectPromise) {
                        if (!endpointIm && !endpointTel) { endpointTel = "****"; }
                        that._contacts.getOrCreateContact(endpointIm, endpointTel)
                            .then(function(contact) { confParticipants.push(contact); resolvePromise(); })
                            .catch(function(error) { rejectPromise(error); });
                    }));
                }
            });

            // Get participants asynchronously
            Promise.all(participantPromises).then(
                function success() { resolve(confParticipants); },
                function failure(error) { reject(error); }
            );
        });
    };

    /**
     * @private
     * @method getOrCreateCall
     * @param status
     * @param connectionId
     * @param deviceType
     * @param contact
     */
    getOrCreateCall(status, connectionId, deviceType, contact?) {
        let that = this;

        // Extract callid from connectionid
        let callId = Call.getIdFromConnectionId(connectionId);

        // Get eventual existing call
        let call = that.calls[callId];
        if (call) {
            call.setConnectionId(connectionId);
            call.startDate = new Date();
        }
        else {
            call = Call.create(status, null, Call.Type.PHONE, contact, deviceType);
            call.setConnectionId(connectionId);
            that.calls[callId] = call;
        }
        return call;
    }

    /**
     * @public
     * @method getVoiceMessageCounter
     * @description
     *      Get the number of voice message
     * @return {Promise<integer>} Return resolved promise if succeed with the number of messages, and a rejected else.
     */
    getVoiceMessageCounter() {
        let that = this;
        return new Promise((resolve, reject) => {

            //reject not allowed operations
            if (!that.voiceMailFeatureEnabled) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "getVoiceMessageCounter failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that.logger.log("error", LOG_ID + "(getVoiceMessageCounter) " + profileError.message);
                reject(profileError);
            }

            that._xmpp.voiceMessageQuery(that.userJidTel).then(function (data) {
                console.error(data);
                resolve(data);
            })
                .catch(function (error) {
                    let errorMessage = "getVoiceMessageCounter failure : " + error.message;
                    that.logger.log("error", LOG_ID + "(getVoiceMessageCounter) " + errorMessage);
                    reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
                });
        });
    }

    /*********************************************************/
    /**                   CALL HANDLERS                     **/

    /*********************************************************/
    /**
     * @public
     * @method getCallToHangOut
     * @description
     *      Get the call which can be hang out
     * @return {Call} The call with the ability to be hang out.
     */
    getCallToHangOut() {
        let that = this;
        let calls = that.getCalls();
        if (!calls || calls.length === 0) {
            return null;
        }
        let callStatus = calls[0].status;
        if (calls.length === 1 || (callStatus === Call.Status.DIALING || callStatus === Call.Status.ACTIVE || callStatus === Call.Status.PUT_ON_HOLD)) {
            return calls[0];
        }
        return calls[1];
    }

    /**
     * @public
     * @method getActiveCall
     * @description
     *      get the active call
     * @return {Call} The active call
     */
    getActiveCall() {
        let that = this;
        let activeCall = null;
        Object.keys(that.calls || []).forEach(function (key) {
            let call = that.calls[key];
            if (call.status === Call.Status.ACTIVE) {
                activeCall = call;
            }
        });
        return activeCall;
    }

    /**
     * @public
     * @method getCalls
     * @description
     *      get the calls
     * @return {Call} The active call
     */
    getCalls() {
        let that = this;
        let calls = [];
        Object.keys(that.calls || []).forEach(function (key) {
            if (
                that.calls[key].status === Call.Status.DIALING ||
                that.calls[key].status === Call.Status.RINGING_OUTGOING ||
                that.calls[key].status === Call.Status.QUEUED_OUTGOING ||
                that.calls[key].status === Call.Status.ACTIVE ||
                that.calls[key].status === Call.Status.HOLD ||
                that.calls[key].status === Call.Status.PUT_ON_HOLD ||
                that.calls[key].status === Call.Status.ERROR) {
                calls.push(that.calls[key]);
            }
        });
        return calls;
    }

    /**
     * @public
     * @method getActiveCall
     * @param {Contact} contact The contact with an active call with us.
     * @description
     *      get the active call for a contact
     * @return {Call} The active call
     */
    getActiveCallsForContact(contact) {
        let that = this;
        let calls = [];
        if (contact && contact.jid) {
            Object.keys(that.calls || []).forEach(function (key) {
                if (
                    (that.calls[key].contact && that.calls[key].contact.jid === contact.jid) &&
                    (that.calls[key].status === Call.Status.DIALING ||
                        that.calls[key].status === Call.Status.RINGING_OUTGOING ||
                        that.calls[key].status === Call.Status.ACTIVE ||
                        that.calls[key].status === Call.Status.HOLD ||
                        that.calls[key].status === Call.Status.PUT_ON_HOLD)) {
                    calls.push(that.calls[key]);
                }
            });
        }
        return calls;
    }

    /*************************************************************/
    /*                    MAKE CALL STUFF                        */

    /*************************************************************/
    /**
     * @public
     * @method makeCall
     * @instance
     * @description
     *    Call a number <br/>
     *    Contacts and numbers are allowed
     *    Return a promise
     * @param {Contact} contact - contact object that you want to call
     * @param {String} phoneNumber The number to call
     * @return {Promise<Call>} Return a promise with the call created
     */
    makeCall(contact, phoneNumber) {
        let that = this;
        let activeCall = that.getActiveCall();

        if (that.makingCall) {
            that.logger.log("debug", LOG_ID + "(makeCall) makeCall failure - makeCall already making a call");
            return Promise.reject();
        }

        // Set makingCall flag
        that.makingCall = true;

        // Handle simpleCall
        if (!activeCall) {
            return that.makeSimpleCall(contact, phoneNumber);
        }

        // Handle consultationCall
        return that.makeConsultationCall(contact, phoneNumber, activeCall.connectionId);
    }

    /**
     * @private
     * @method makeSimpleCall
     * @param contact
     * @param phoneNumber
     */
    private makeSimpleCall(contact, phoneNumber) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.logger.log("debug", LOG_ID + "(makeSimpleCall) to " + (contact ? contact.displayName : phoneNumber));

            //reject not allowed operations
            if (!that.isBasicCallAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "makeSimpleCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that.logger.log("error", LOG_ID + "()[telephonyService] " + profileError.message);

                // Release makingCall flag
                that.makingCall = false;
                reject(profileError);
            }

            let phoneInfo = that.getPhoneInfo(contact, phoneNumber);
            that._rest.makeCall(contact, phoneInfo).then(
                function success(response) {
                    // Create the call object
                    let call = Call.create(Call.Status.DIALING, null, Call.Type.PHONE, contact);
                    call.setConnectionId(response.callId);
                    that.calls[call.id] = call;
                    that.logger.log("debug", LOG_ID + "(makeSimpleCall) success : " + utils.anonymizePhoneNumber(phoneNumber) + " Call (" + call + ")");

                    // Release makinCall flag
                    that.makingCall = false;

                    // Indicate whether it is a call to own voicemail
                    call.setIsVm(phoneNumber === that.voicemailNumber);

                    // Send call update event
                    that.logger.log("debug", LOG_ID + "(makeSimpleCall) send rainbow_oncallupdated ", call);
                    that._eventEmitter.emit("rainbow_oncallupdated", call);
                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    resolve(call.id);
                },
                function failure(response) {
                    let call = Call.create(Call.Status.ERROR, null, Call.Type.PHONE, contact);
                    call.errorMessage = "invalidPhoneNumber";
                    that.calls[call.contact.id] = call;
                    // call.autoClear = $interval(function () {
                    that.clearCall(call);
                    //}, 5000, 1);

                    // Release makinCall flag
                    that.makingCall = false;

                    // Send call update event
                    that.logger.log("debug", LOG_ID + "(makeSimpleCall) send rainbow_oncallupdated ", call);
                    that._eventEmitter.emit("rainbow_oncallupdated", call);
                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                    reject(error);
                    that.logger.log("error", LOG_ID + "(makeSimpleCall) ", error);
                });
        });
    }

    /**
     * @private
     * @method makeConsultationCall
     * @param contact
     * @param phoneNumber
     * @param callId
     */
    private makeConsultationCall(contact, phoneNumber, callId) {
        let that = this;
        return new Promise((resolve, reject) => {

            //reject not allowed operations
            if (!that.isSecondCallAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "makeConsultationCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that.logger.log("error", LOG_ID + "(makeConsultationCall) " + profileError.message);

                // Release makingCall flag
                that.makingCall = false;
                reject(profileError);
            }

            let phoneInfo = that.getPhoneInfo(contact, phoneNumber);
            that._rest.makeConsultationCall(callId, contact, phoneInfo).then(
                function success(response) {
                    // Create the call object
                    let call = Call.create(Call.Status.DIALING, null, Call.Type.PHONE, contact);
                    call.setConnectionId(response.data.data.callId);
                    that.calls[call.id] = call;
                    that.logger.log("debug", LOG_ID + "(makeConsultationCall) makeConsultationCall success : " + utils.anonymizePhoneNumber(phoneNumber) + " Call (" + call + ")");

                    // Release makinCall flag
                    that.makingCall = false;

                    // Indicate whether it is a call to own voicemail
                    call.setIsVm(phoneNumber === that.voicemailNumber);

                    // Send call update event
                    that.logger.log("debug", LOG_ID + "(makeConsultationCall) send rainbow_oncallupdated ", call);
                    that._eventEmitter.emit("rainbow_oncallupdated", call);
                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    resolve(call.id);
                },
                function failure(response) {
                    let call = Call.create(Call.Status.ERROR, null, Call.Type.PHONE, contact);
                    call.errorMessage = "invalidPhoneNumber";
                    that.calls[call.contact.id] = call;
                    //call.autoClear = $interval(function () {
                        this.clearCall(call);
                    //}, 5000, 1);

                    // Release makinCall flag
                    that.makingCall = false;

                    // Send call update event
                    that.logger.log("debug", LOG_ID + "(makeConsultationCall) send rainbow_oncallupdated ", call);
                    that._eventEmitter.emit("rainbow_oncallupdated", call);
                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                    reject(error);
                    that.logger.log("error", LOG_ID + "(makeConsultationCall) ", error);
                });
        });
    }

    /**
     * @public
     * @method makeCall
     * @instance
     * @description
     *    Call a number <br/>
     *    Return a promise
     * @param {String} phoneNumber The number to call
     * @return {Promise<Call>} Return a promise with the call created
     */
    makeCallByPhoneNumber(phoneNumber) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(makeCallByPhoneNumber) : " + utils.anonymizePhoneNumber(phoneNumber));

            if (that._contacts.userContact.phonePro === phoneNumber || that._contacts.userContact.phoneProCan === phoneNumber || that._contacts.userContact.phonePbx === phoneNumber) {
                let errorMessage = "makeCallByPhoneNumber) failure: impossible to call its own phone number";
                that.logger.log("debug", LOG_ID + "(makeCallByPhoneNumber) " + errorMessage);
                reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
            }
            let myContact = null;
            that._contacts.getOrCreateContact(null, phoneNumber)
                .then(function (contact) {
                    myContact = contact;
                    return that.makeCall(contact, phoneNumber);
                })
                .then(function () {
                    resolve();
                })
                .catch(function (error) {
                    let _errorMessage = "makeCallByPhoneNumber failure " + (error ? error.message : "");
                    that.logger.log("debug", LOG_ID + "(makeCallByPhoneNumber) - " + _errorMessage);

                    let call = Call.create(Call.Status.ERROR, null, Call.Type.PHONE, myContact);
                    call.errorMessage = "invalidPhoneNumber";
                    that.calls[call.contact.id] = call;
                    that.clearCall(call);
                    that.logger.log("debug", LOG_ID + "(makeCallByPhoneNumber) send rainbow_oncallupdated ", call);
                    that._eventEmitter.emit("rainbow_oncallupdated", call);

//                    $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);

                    reject(ErrorManager.getErrorManager().OTHERERROR(call.errorMessage, _errorMessage));
                });
        });
    }


    /* TO DO */

    /*		service.makeCallWithMobile = function(mobileRessource, phoneNumber) {

                var defer = $q.defer();

                if (contactService.userContact.mobilePro === phoneNumber || contactService.userContact.mobilePerso === phoneNumber) {
                    var errorMessage = "makeCallWithMobile failure: impossible to call its own mobile phone number";
                    that.logger.log("error", LOG_ID + "()[telephonyService] " + errorMessage);
                    defer.reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage));
                    return defer.promise;
                }

                // Forge request IQ
                var makeMobileCallMsg = $iq({ type: "set", to: mobileRessource })
                    .c("call", { xmlns: "urn:xmpp:call", phoneNumber: phoneNumber, directCall: false });

                xmppService.sendIQ(makeMobileCallMsg)
                    .then(function() {
                        defer.resolve();
                    })
                    .catch(function(error) {
                        var errorMessageMobile = "makeCallWithMobile failure : " + error.message;
                        that.logger.log("error", LOG_ID + "()[telephonyService] - callService - " + errorMessageMobile);
                        defer.reject(ErrorManager.getErrorManager().OTHERERROR(errorMessageMobile));
                    });

                // Return the promise
                return defer.promise;
            };
    */

    /**
     * @private
     * @method getPhoneInfo
     * @param contact
     * @param phoneNumber
     */
    private getPhoneInfo(contact, phoneNumber) {
        let that = this;

        let longNumber = phoneNumber;
        let shortNumber = "";
        let internalNumber = "";//#29475
        let pbxId = "";
        if (contact) {
            if (phoneNumber === contact.phonePro || phoneNumber === contact.phoneProCan) {
                longNumber = contact.phoneProCan ? contact.phoneProCan : "";
                //if (!longNumber && contact.phonePro) { longNumber = contact.phonePro; }
                shortNumber = contact.phonePbx;
                pbxId = contact.pbxId;
                internalNumber = contact.phoneInternalNumber;//#29475
            }
            else if (phoneNumber === contact.phonePbx) {
                longNumber = "";
                shortNumber = contact.phonePbx;
                pbxId = contact.pbxId;
                internalNumber = contact.phoneInternalNumber;//#29475
            }
        }
        return {longNumber: longNumber, shortNumber: shortNumber, pbxId: pbxId, internalNumber: internalNumber};//#29475
    }

    /*getErrorMessage(data, actionLabel) {
        let that = this;
        let errorMessage = actionLabel + " failure : ";

        if (angular.element(data).attr("type") === "error") {

            let error = angular.element(data).find("error");
            if (error) {
                let errorType = error.attr("type");
                let errorCode = error.attr("code");
                if (errorType) {
                    errorMessage += (errorType + " : ");

                    if (errorType === "modify") {
                        errorMessage += error.find("text").text();
                    }
                }
                if (errorCode) {
                    if (errorCode === "503") {
                        errorMessage += "Agent error : service unavailable";
                    }
                }

                that.logger.log("error", LOG_ID + "()[telephonyService] " + errorMessage);

            }
            else {
                errorMessage += "Unknown error";
            }

            return errorMessage;
        }
        return null;
    } // */

    /*************************************************************/
    /*                    RELEASE CALL STUFF                     */

    /*************************************************************/

    /**
     * @public
     * @method releaseCall
     * @instance
     * @description
     *    Release a call <br/>
     *    Return a promise
     * @param {Call} call The call to release
     * @return {Promise<Call>} Return a promise with the call released
     */
    releaseCall(call) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(releaseCall) call " + call.id);

            //reject not allowed operations
            if (!that.isBasicCallAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "releaseCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that.logger.log("error", LOG_ID + "(releaseCall) " + profileError.message);
                reject(profileError);
            }


            that._rest.releaseCall(call).then(
                function success() {
                    // Update call status
                    call.setStatus(Call.Status.UNKNOWN);
                    call.startDate = null;
                    call.vm = false;
                    that.logger.log("debug", LOG_ID + "(releaseCall) releaseCall " + call.id + " - success : ");

                    // Send call update event
                    that.logger.log("debug", LOG_ID + "(releaseCall) send rainbow_oncallupdated ", call);
                    that._eventEmitter.emit("rainbow_oncallupdated", call);
                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);

                    // Clean the call array
                    // service.calls = []; //// MCO OULALALALA
                    delete that.calls[call.id];

                    resolve(call);
                },
                function failure(response) {
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                    reject(error);
                    that.logger.log("error", LOG_ID + "(releaseCall) ", error);
                });
        });
    }

    /*************************************************************/
    /*                     ANSWER CALL STUFF                     */

    /*************************************************************/

    /**
     * @public
     * @method answerCall
     * @instance
     * @description
     *    Answer a call <br/>
     *    Return a promise
     * @param {Call} call The call to answer
     * @return {Promise<Call>} Return a promise with the answered call.
     */
     answerCall(call) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.logger.log("debug", LOG_ID + "()[telephonyService] answerCall : " + utils.anonymizePhoneNumber(call.contact.phone) + "(" + call.contact.displayNameForLog() + ")");

            // First hold the current active call
            let activeCall = that.getActiveCall();

            //reject not allowed operations
            if (!that.isBasicCallAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "answerCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that.logger.log("error", LOG_ID + "()[telephonyService] " + profileError.message);
                reject(profileError);
            }

            if (call.status === Call.Status.QUEUED_INCOMING && activeCall) {
                that.holdCall(activeCall)
                    .then(function () {
                        return that.answerCall(call);
                    })
                    .then(function (thecall) {
                        resolve(thecall);
                    })
                    .catch(function (error) {
                        let errorMessage = "answerCall failure : " + error.message;
                        that.logger.log("error", LOG_ID + "() - callService -  " + errorMessage);
                        reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
                    });
            }
            else {
               that._rest.answerCall(call).then(
                    function success(response) {
                        // Update call status
                        call.setConnectionId(response.callId);
                        call.setStatus(Call.Status.ACTIVE);
                        that.logger.log("debug", LOG_ID + "(answerCall) answerCall success : " + utils.anonymizePhoneNumber(call.contact.phone) + " Call (" + call + ")");

                        // Send call update event
                        that.logger.log("debug", LOG_ID + "(answerCall) send rainbow_oncallupdated ", call);
                        that._eventEmitter.emit("rainbow_oncallupdated", call);
                        //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                        resolve(call);
                    },
                    function failure(response) {
                        // Send call update event
                        that.logger.log("debug", LOG_ID + "(answerCall) send rainbow_oncallupdated ", call);
                        that._eventEmitter.emit("rainbow_oncallupdated", call);
                        //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                        let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                        reject(error);
                        that.logger.log("error", LOG_ID + "(answerCall) ", error);                    });
            }
        });
    }

    /*************************************************************/
    /*                      HOLD CALL STUFF                      */

    /*************************************************************/

    /**
     * @public
     * @method holdCall
     * @instance
     * @description
     *    Hold a call <br/>
     *    Return a promise
     * @param {Call} call The call to hold
     * @return {Call} Return a promise with the held call.
     */
    holdCall(call) {
        let that = this;
        return new Promise(function (resolve, reject) {
            // Ignore call already hold
            if (!call || call.status === Call.Status.HOLD) {
                resolve(call);
            }

            //reject not allowed operations
            if (!that.isSecondCallAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "holdCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that.logger.log("error", LOG_ID + "(holdCall)[telephonyService] " + profileError.message);
                reject(profileError);
            }

            /* $http({
                method: "PUT",
                url: service.portalURL + "calls/" + encodeURIComponent(call.connectionId) + "/hold",
                headers: authService.getRequestHeader()
            }) // */
            that._rest.holdCall(call).then(
                function success(response) {
                    that.logger.log("debug", LOG_ID + "(holdCall) holdCall success : " + utils.anonymizePhoneNumber(call.contact.phone) + " Call (" + call + ")");
                    // Update call status
                    call.setConnectionId(response.data.data.callId);
                    call.setStatus(Call.Status.HOLD);

                    // Send call update event
                    that.logger.log("debug", LOG_ID + "(holdCall) send rainbow_oncallupdated ", call);
                    that._eventEmitter.emit("rainbow_oncallupdated", call);
                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    resolve(call);
                },
                function failure(response) {
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                    reject(error);
                    that.logger.log("error", LOG_ID + "(holdCall) ", error);
        });
        });
    }

    /*************************************************************/
    /*                     RETRIEVE CALL STUFF                     */

    /*************************************************************/

    /**
     * @public
     * @method retrieveCall
     * @instance
     * @description
     *    Retrieve a call <br/>
     *    Return a promise
     * @param {Call} call The call to retrieve
     * @return {Promise<Call>} Return a promise with the call retrieved
     */
    retrieveCall(call) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(retrieveCall) retrieveCall : " + call.contact.displayNameForLog());

            //reject not allowed operations
            if (!that.isSecondCallAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "retrieveCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that.logger.log("error", LOG_ID + "(retrieveCall) " + profileError.message);
                reject(profileError);
            }

            // First hold the current active call
            let activeCall = that.getActiveCall();

            if (activeCall) {
                that.holdCall(activeCall)
                    .then(function () {
                        return that.retrieveCall(call);
                    })
                    .then(function (thecall) {
                        resolve(thecall);
                    })
                    .catch(function (error) {
                        let errorMessage = "retrieveCall failure : " + error.message;
                        that.logger.log("error", LOG_ID + "(retrieveCall) - callService -  " + errorMessage);
                        reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
                    });
            }
            else {
                /*$http({
                    method: "PUT",
                    url: service.portalURL + "calls/" + encodeURIComponent(call.connectionId) + "/retrieve",
                    headers: authService.getRequestHeader()
                })// */
                 that._rest.retrieveCall(call).then(
                    function success(response) {
                        that.logger.log("debug", LOG_ID + "(retrieveCall) retrieveCall success : " + utils.anonymizePhoneNumber(call.contact.phone) + " Call (" + call + ")");
                        // Update call status
                        call.setConnectionId(response.data.data.callId);
                        call.setStatus(Call.Status.ACTIVE);

                        // Send call update event
                        that.logger.log("debug", LOG_ID + "(retrieveCall) send rainbow_oncallupdated ", call);
                        that._eventEmitter.emit("rainbow_oncallupdated", call);
                        //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                        resolve();
                    },
                    function failure(response) {
                        let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                        reject(error);
                        that.logger.log("error", LOG_ID + "(retrieveCall) ", error);
                    });
            }
        });
    }

    /*************************************************************/
    /*                     DEFLECT CALL STUFF                    */

    /*************************************************************/

    /**
     * @public
     * @method deflectCallToVM
     * @instance
     * @description
     *    Deflect a call to the voice mail <br/>
     *    Return a promise
     * @param {Call} call The call to deflect
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    deflectCallToVM(call) {
        let that = this;
        return new Promise((resolve, reject) => {
            // Ignore wrong request
            if (!call) {
                resolve(call);
            }

            //reject not allowed operations
            if (!that.isVMDeflectCallAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "deflectCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that.logger.log("error", LOG_ID + "()[telephonyService] " + profileError.message);
                reject(profileError);
            }

            that.logger.log("debug", LOG_ID + "(deflectCallToVM) deflectCallToVM " + call.contact.displayNameForLog());

            /*$http({
                method: "PUT",
                url: service.portalURL + "calls/" + encodeURIComponent(call.connectionId) + "/deflect",
                headers: authService.getRequestHeader(),
                data: {
                    calleeExtNumber: "",
                    calleeIntNumber: service.voicemailNumber,
                    calleeShortNumber: service.voicemailNumber,
                    calleePbxId: service.pbxId
                }
            }) // */
            let data = {
                calleeExtNumber: "",
                calleeIntNumber: that.voicemailNumber,
                calleeShortNumber: that.voicemailNumber,
                calleePbxId: that.pbxId
            };
            that._rest.deflectCallToVM(call, data) .then(
                function success() {
                    that.logger.log("debug", LOG_ID + "(deflectCallToVM) deflectCall success");
                    resolve();
                },
                function failure(response) {
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                    reject(error);
                    that.logger.log("error", LOG_ID + "(deflectCallToVM) ", error);                });
        });
    }

    /*************************************************************/
    /*                     DEFLECT CALL STUFF                    */

    /*************************************************************/

    /**
     * @public
     * @method deflectCall
     * @instance
     * @description
     *    Deflect a call to an other telephone number<br/>
     *    Return a promise
     * @param {Call} call The call to deflect
     * @param {Object} callee The callee phone number informations where the call shopuld be deflecte'd.
     * @param {string} callee.calleeExtNumber : The phone number where the call is deflected, the format could be anything the user can type, it will be transformed in E164 format.,
     * @param {string} callee.calleeIntNumber : Internal number if available,
     * @param {string} callee.calleePbxId : The pbx id if available,
     * @param {string} [callee.calleeShortNumber] : Short number,
     * @param {string} [callee.calleeDisplayName] : The displayed name,
     * @param {string} [callee.calleeCountry] : The contry whe the call will be deflected.
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    deflectCall(call, callee) {
        let that = this;
        return new Promise((resolve, reject) => {
            // Ignore wrong request
            if (!call || !callee) {
                resolve();
            }

            that.logger.log("debug", LOG_ID + "(deflectCall) deflectCall " + call.contact.displayNameForLog());

            let data = {
                "calleeExtNumber": callee.calleeExtNumber,
                "calleeIntNumber": callee.calleeIntNumber,
                "calleePbxId": callee.calleePbxId,
                "calleeShortNumber": callee.calleeShortNumber,
                "calleeDisplayName": callee.calleeDisplayName,
                "calleeCountry": callee.calleeCountry
            };

            that._rest.deflectCall(call, data) .then(
                function success() {
                    that.logger.log("debug", LOG_ID + "(deflectCall) deflectCall success");
                    resolve();
                },
                function failure(response) {
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                    reject(error);
                    that.logger.log("error", LOG_ID + "(deflectCall) ", error);                });
        });
    }

    /*************************************************************/
    /*                   TRANSFERT CALL STUFF                    */

    /*************************************************************/
    /**
     * @public
     * @method transfertCall
     * @instance
     * @description
     *    Transfer a held call to the active call <br/>
     *    User should have transfer rights <br/>
     *    Return a promise
     * @param {Call} activeCall The active call
     * @param {Call} heldCall The held call to transfer to the activeCall
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    transfertCall(activeCall, heldCall) {
        let that = this;
        return new Promise((resolve, reject) => {
            // Ignore wrong request
            if (!activeCall || !heldCall) {
                resolve();
            }

            //reject not allowed operations
            if (!that.isTransferAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "transferCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that.logger.log("error", LOG_ID + "(transfertCall) " + profileError.message);
                reject(profileError);
            }

            that.logger.log("debug", LOG_ID + "(transfertCall) transfertCall held(" + heldCall.contact.displayName + ") to active(" + activeCall.contact.displayName + ")");

            /*$http({
                method: "PUT",
                url: service.portalURL + "calls/" + encodeURIComponent(activeCall.connectionId) + "/transfer/" + encodeURIComponent(heldCall.connectionId),
                headers: authService.getRequestHeader()
            })
                // */
            that._rest.transfertCall(activeCall, heldCall).then(
                function success() {
                    that.logger.log("debug", LOG_ID + "(transfertCall) transferCall success");
                    // Release makinCall flag
                    that.makingCall = false;
                    that.clearCall(activeCall);
                    that.clearCall(heldCall);
                    resolve();
                },
                function failure(response) {
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                    reject(error);
                    that.logger.log("error", LOG_ID + "(transfertCall) ", error);
                });
        });
    }

    /*************************************************************/
    /* MAKE CONFERENCE CALL STUFF                                */

    /*************************************************************/
    /**
     * @public
     * @method conferenceCall
     * @instance
     * @description
     *    Create a conference with a held call and the active call <br/>
     *    User should have conference rights <br/>
     *    Return a promise
     * @param {Call} activeCall The active call
     * @param {Call} heldCall The held call to transfer to the activeCall
     * @return {Promise} Return a resolved promise .
     */
    conferenceCall(activeCall, heldCall) {
        let that = this;

        return new Promise((resolve, reject) => {
            // Ignore wrong request
            if (!activeCall || !heldCall) {
                resolve();
            }

            //reject not allowed operations
            if (!that.isConferenceAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "conferenceCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that.logger.log("error", LOG_ID + "(conferenceCall) " + profileError.message);
                reject(profileError);
            }

            that.logger.log("debug", LOG_ID + "(conferenceCall) conferenceCall " + activeCall.contact.displayName + " and " + heldCall.contact.displayName);

            /* $http({
                method: "PUT",
                url: service.portalURL + "calls/" + encodeURIComponent(activeCall.connectionId) + "/conference/" + encodeURIComponent(heldCall.connectionId),
                headers: authService.getRequestHeader()
            }) // */
            that._rest.conferenceCall(activeCall, heldCall).then(
                function success() {
                    that.logger.log("debug", LOG_ID + "(conferenceCall) conferenceCall success");
                    resolve();
                },
                function failure(response) {
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                    reject(error);
                    that.logger.log("error", LOG_ID + "(conferenceCall) ", error);
                });
        });
    }

    /*************************************************************/
    /* FORWARD CALL STUFF               		                 */

    /*************************************************************/
    /**
     * @public
     * @method forwardToDevice
     * @instance
     * @description
     *    Activate the forward to a number <br/>
     *    Return a promise
     * @param {String} phoneNumber The number to call
     * @return {Promise} Return a promise resolved.
    */
    forwardToDevice(phoneNumber) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(forwardToDevice) forwardToDevice : " + phoneNumber);

            if (that._contacts.userContact.phonePro === phoneNumber || that._contacts.userContact.phoneProCan === phoneNumber || that._contacts.userContact.phonePbx === phoneNumber) {
                let errorMessage = "forwardToDevice failure: impossible to forward its own phone number";
                that.logger.log("error", LOG_ID + "(forwardToDevice) " + errorMessage);
                reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
            }
            that._contacts.getOrCreateContact(null, phoneNumber)
                .then(function (contact) {
                    let phoneInfo = that.getPhoneInfo(contact, phoneNumber);
                    /*$http({
                        method: "PUT",
                        url: service.portalURL + "forward",
                        headers: authService.getRequestHeader(),
                        data: {
                            calleeExtNumber: phoneInfo.longNumber,
                            calleeIntNumber: phoneInfo.internalNumber,
                            calleeShortNumber: phoneInfo.shortNumber,
                            calleePbxId: phoneInfo.pbxId,
                            calleeDisplayName: contact.displayName
                        }
                    }) // */
                        that._rest.forwardToDevice(contact, phoneInfo).then(
                        function success() {
                            // TODO: subscribe somehow to ON_CALL_FORWARDED_EVENT is order to know that foward is applied
                            resolve();
                        },
                        function failure(response) {
                            let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                            reject(error);
                            that.logger.log("error", LOG_ID + "(forwardToDevice) ", error);
                        });
                });
        });
    }

    /**
     * @public
     * @method forwardToVoicemail
     * @instance
     * @description
     *    Activate the forward to VM <br/>
     *    Return a promise
     * @return {Promise} Return a promise resolved.

     */
    forwardToVoicemail() {
        let that = this;
        return new Promise((resolve, reject) => {

            if (!that.voiceMailFeatureEnabled) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "forwardToVoicemail failure - voicemail feature not enabled");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "404";
                // @ts-ignore
                that.logger.log("error", LOG_ID + "(forwardToVoicemail) " + profileError.message);
                reject(profileError);
            }

            /*$http({
                method: "PUT",
                url: service.portalURL + "forward",
                headers: authService.getRequestHeader(),
                data: {
                    calleeExtNumber: "",
                    calleeIntNumber: service.voicemailNumber,
                    calleePbxId: service.pbxId
                }
            })
            // */
            let phoneInfo = {
                longNumber: "",
                internalNumber: that.voicemailNumber,
                pbxId: that.pbxId
            };
            that._rest.forwardToDevice({}, phoneInfo).then(
                function success() {
                    // TODO: subscribe somehow to ON_CALL_FORWARDED_EVENT is order to know that foward is applied
                    resolve();
                },
                function failure(response) {
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                    reject(error);
                    that.logger.log("error", LOG_ID + "(forwardToVoicemail) ", error);
                });
        });
    }

    /**
     * @public
     * @method cancelForward
     * @instance
     * @description
     *    Cancel the forward <br/>
     *    Return a promise
     * @return {Promise<Call>} Return a promise with the canceled forward call.
     */
    cancelForward() {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (that._contacts.userContact.phonePbx) {
                /* $http({
                    method: "PUT",
                    url: service.portalURL + "forward",
                    headers: authService.getRequestHeader(),
                    data: {
                        calleeExtNumber: "",
                        calleeIntNumber: "CANCELFORWARD",
                        calleePbxId: service.pbxId
                    }
                }) // */
                let phoneInfo = {
                    longNumber: "",
                    internalNumber: "CANCELFORWARD",
                    pbxId: that.pbxId
                };
                that._rest.forwardToDevice({}, phoneInfo).then(
                    function success() {
                        that.logger.log("debug", LOG_ID + "(cancelForward) cancelForward success");
                        resolve();
                    },
                    function failure(response) {
                        let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                        reject(error);
                        that.logger.log("error", LOG_ID + "(cancelForward) ", error);
                    });
            }
            else {
                reject();
            }
        });
    }

    getForwardStatus() {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (that._contacts.userContact && that._contacts.userContact.phonePbx) {
                /*$http({
                    method: "GET",
                    url: service.portalURL + "forward",
                    headers: authService.getRequestHeader()
                }) // */
                that._rest.getForwardStatus().then(
                    function success() {
                        // Nothing much to do here, the real call forward status will arrive by XMPP (see ON_CALL_FORWARDED_EVENT)
                        resolve();
                    },
                    function failure(response) {
                        let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                        reject(error);
                        that.logger.log("error", LOG_ID + "(getForwardStatus) ", error);
                    });
            }
            else {
                reject();
            }
        });
    }

    /*************************************************************/
    /* NOMADIC CALL STUFF               		                 */
    /*************************************************************/

    nomadicLogin (phoneNumber, NotTakeIntoAccount?) {
        let that = this;
        return new Promise(function(resolve, reject) {

            //reject not allowed operations
            if (!that.isNomadicEnabled || !that.nomadicObject.featureActivated) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "nomadicLogin failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that.logger.log("error", LOG_ID + "[telephonyService] " + profileError.message);
                reject(profileError);
            }

            if (that._contacts.userContact.phonePro === phoneNumber || that._contacts.userContact.phoneProCan === phoneNumber || that._contacts.userContact.phonePbx === phoneNumber) {
                let errorMessage = "nomadicLogin failure: impossible to use its own phone number like nomadic phone";
                that.logger.log("error", LOG_ID + "[telephonyService] " + errorMessage);
                reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
            }

            that.logger.log("info", LOG_ID + "[telephonyService] nomadicLogin : " + phoneNumber);
            NotTakeIntoAccount = NotTakeIntoAccount || false;
            that.nomadicAnswerNotTakedIntoAccount = NotTakeIntoAccount;

            that._contacts.getOrCreateContact(null, phoneNumber)
                .then(function(contact) {
                    let phoneInfo = that.getPhoneInfo(contact, phoneNumber);
                    /*$http({
                        method: "PUT",
                        url: that.portalURL + "nomadic/login",
                        headers: authService.getRequestHeader(),
                        data: {
                            destinationExtNumber: phoneInfo.longNumber,
                            destinationIntNumber: phoneInfo.internalNumber,
                            destinationShortNumber: phoneInfo.shortNumber,
                            destinationPbxId: phoneInfo.pbxId,
                            destinationDisplayName: contact.displayName,
                            destinationCountry: contact.country
                        }
                    })// */
                    let data = {
                            destinationExtNumber: phoneInfo.longNumber,
                            destinationIntNumber: phoneInfo.internalNumber,
                            destinationShortNumber: phoneInfo.shortNumber,
                            destinationPbxId: phoneInfo.pbxId,
                            destinationDisplayName: contact.displayName,
                            destinationCountry: contact.country
                    };
                    that._rest.nomadicLogin(data).then(
                        function success() {
                            //service.forwardToDevice(phoneNumberReceived);
                            // TODO: subscribe somehow to ON_NOMADIC_EVENT is order to know that foward is applied
                            that.logger.log("info", LOG_ID + "[telephonyService] nomadicLogin success");
                            //service.isMakeCallInitiatorIsMain = false;
                            resolve("success");
                        },
                        function failure(response) {
                            let errorMessage = "nomadicLogin failure, nomadicDevice: " + response.message;
                            that.logger.log("error", LOG_ID + "[telephonyService] " + errorMessage);
                            reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));

                        });
                });
        });
    };
/*
    nomadicLoginOnOfficePhone () {
        return $q(function(resolve, reject) {

            //reject not allowed operations
            if (!service.isNomadicEnabled || !service.nomadicObject.featureActivated) {
                var profileError = ErrorManager.getErrorManager().OTHERERROR("nomadicLoginOnOfficePhone failure - Not Allowed");
                profileError.status = profileError.errorDetailsCode = "403";
                $log.error("[telephonyService] " + profileError.message);
                reject(profileError);
            }

            $log.info("[telephonyService] nomadicLoginOnOfficePhone");

            $http({
                method: "PUT",
                url: service.portalURL + "nomadic/login",
                headers: authService.getRequestHeader()
            }).then(
                function success() {
                    //service.cancelForward();
                    // TODO: subscribe somehow to ON_NOMADIC_EVENT is order to know that foward is applied
                    $log.info("[telephonyService] nomadicLoginOnOfficePhone success");
                    //service.isMakeCallInitiatorIsMain = true;
                    resolve();
                },
                function failure(response) {
                    var error = errorHelperService.handleError(response);
                    reject(error);
                    $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "nomadicDevice"));
                });
        });
    };

    nomadicLogout () {
        let that = this;
        return new Promise(function(resolve, reject) {

            //reject not allowed operations
            if (!that.isNomadicEnabled || !that.nomadicObject.featureActivated) {
                var profileError = ErrorManager.getErrorManager().OTHERERROR("nomadicLogout failure - Not Allowed");
                profileError.status = profileError.errorDetailsCode = "403";
                $log.error("[telephonyService] " + profileError.message);
                reject(profileError);
            }

            $log.info("[telephonyService] nomadicLogout");

            $http({
                method: "PUT",
                url: service.portalURL + "nomadic/logout",
                headers: authService.getRequestHeader()
            }).then(
                function success() {
                    //service.cancelForward();
                    // TODO: subscribe somehow to ON_NOMADIC_EVENT is order to know that foward is applied
                    $log.info("[telephonyService] nomadicLogout success");
                    //service.isMakeCallInitiatorIsMain = true;
                    resolve();
                },
                function failure(response) {
                    var error = errorHelperService.handleError(response);
                    reject(error);
                    $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "nomadicDevice"));
                });
        });
    };
// */
    getNomadicStatus () {
        let that = this;
        return new Promise(function(resolve, reject) {

            //reject not allowed operations
            if (!that.isNomadicEnabled) {
                let error = ErrorManager.getErrorManager().CUSTOMERROR("403", "getNomadicStatus failure - Not Allowed", "getNomadicStatus failure - Not Allowed");// errorHelperService.handleError(response);
                reject(error);
                that.logger.log("error", LOG_ID + "(getNomadicStatus) ", error);
            }

            if (that._contacts.userContact && that._contacts.userContact.phonePbx) {
                that._rest.getNomadicStatus().then(
                    function success(response) {
                        that.logger.log("info", LOG_ID + "[telephonyService] nomadicStatus success");
                        that.updateNomadicData(response);
                        resolve();
                    },
                    function failure(response) {
                        let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                        that.logger.log("error", LOG_ID + "(getNomadicStatus) ", error);
                        reject(error);
                    });
            } else {
                //let error = ErrorManager.getErrorManager().ERROR();// errorHelperService.handleError(response);
                let error = ErrorManager.getErrorManager().OTHERERROR("ERROR", "(getNomadicStatus) user logged in pbx info not filled!");
                //error.msg += "(getNomadicStatus) user logged in pbx info not filled!";
                that.logger.log("error", LOG_ID + "(getNomadicStatus) user logged in pbx info not filled!", error);
                reject(error);
            }
        });
    };
/*
    service.setNomadicState = function() {
        return $q(function(resolve, reject) {

            $log.info("[telephonyService] setNomadicState");

            $http({
                method: "PUT",
                url: service.portalURL + "nomadic/state",
                headers: authService.getRequestHeader(),
                data: {
                    makeCallInitiatorIsMain: "true"
                }
            }).then(
                function success() {
                    $log.info("[telephonyService] setNomadicState success");
                    resolve();
                },
                function failure(response) {
                    var error = errorHelperService.handleError(response);
                    reject(error);
                    $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "setNomadicState"));
                });
        });
    };
*/
    /**
     * @private
      * @param response
     */
   updateNomadicData (response) {
       let that = this;
       that.logger.log("info", LOG_ID + "[telephonyService] updateNomadicData destination:" + response.destination + " featureActivated:" + response.featureActivated + " makeCallInitiatorIsMain:" + response.makeCallInitiatorIsMain + " modeActivated:" + response.modeActivated);

        that.nomadicObject.featureActivated = response.featureActivated === "true";
        that.nomadicObject.modeActivated = response.modeActivated === "true";
        that.nomadicObject.destination = response.destination;
        that.nomadicObject.makeCallInitiatorIsMain = response.makeCallInitiatorIsMain === "true";

        if (!that.nomadicAnswerNotTakedIntoAccount) {
            //$rootScope.$broadcast("ON_CALL_NOMADIC_EVENT", service.nomadicObject);
            that.logger.log("debug", LOG_ID + "[telephonyService] updateNomadicData send rainbow_onnomadicstatusevent ", that.nomadicObject);
            that._eventEmitter.emit("rainbow_onnomadicstatusevent", that.nomadicObject);
        }
        that.nomadicAnswerNotTakedIntoAccount = false;

        // By default if mobilepro or mobileperso exist, then add it on destination
        /*if (service.nomadicObject.featureActivated && (service.nomadicObject.destination === "" || service.nomadicObject.destination === undefined) && (contactService.userContact.mobileProCan || contactService.userContact.mobilePerso)) {
            var defaultNumber = contactService.userContact.mobileProCan ? contactService.userContact.mobileProCan : contactService.userContact.mobilePerso;
            service.nomadicLogin(defaultNumber)
                .then(function() {
                    service.nomadicLoginOnOfficePhone();
                });
        }*/

        // By default, in monodevice, if mobilepro or mobileperso exist, then add it on destination
        if (that._contacts.userContact.isVirtualTerm && that.nomadicObject.featureActivated && (that.nomadicObject.destination === "" || that.nomadicObject.destination === undefined) && (that._contacts.userContact.mobileProCan || that._contacts.userContact.mobilePerso)) {
            var defaultNumber = that._contacts.userContact.mobileProCan ? that._contacts.userContact.mobileProCan : that._contacts.userContact.mobilePerso;
            that.nomadicLogin(defaultNumber);
        }
    }

    getNomadicObject() {
        return this.nomadicObject;
    }

    getNomadicDestination() {
        return this.nomadicObject.destination;
    }


    /*************************************************************/
    /* DTMF             		                 				*/

    /*************************************************************/
    /**
     * @public
     * @method sendDtmf
     * @description
     *      send dtmf to the remote party
     * @param {string} connectionId
     * @param {string} dtmf
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    sendDtmf(connectionId, dtmf) {
        let that = this;
        return new Promise((resolve, reject) => {

            let callId = Call.getIdFromConnectionId(connectionId);
            let deviceId = Call.getDeviceIdFromConnectionId(connectionId);
            if (callId && deviceId && dtmf) {
                /* $http({
                    method: "PUT",
                    url: service.portalURL + "calls/" + callId + "%23" + deviceId + "/dtmf",
                    headers: authService.getRequestHeader(),
                    data: {
                        callId: connectionId,
                        dtmf: dtmf
                    }
                }) // */
                let data = {
                    callId: connectionId,
                    dtmf: dtmf
                };
                that._rest.sendDtmf(callId, deviceId, data)
                    .then(
                    function success() {
                        resolve();
                    },
                    function failure(response) {
                        let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details);// errorHelperService.handleError(response);
                        reject(error);
                        that.logger.log("error", LOG_ID + "(sendDtmf) ", error);
                    });
            } else {
                reject();
            }
        });
    }

    /**
     * @private
     * @method clearCall
     * @param Call call the call to reset.
     * @return nothing.
     */
    private clearCall(call) {
        let that = this;
        call.setStatus(Call.Status.UNKNOWN);
        // $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
        that.logger.log("debug", LOG_ID + "(clearCall) send rainbow_oncallupdated ", call);
        that._eventEmitter.emit("rainbow_oncallupdated", call);

        if (call.contact) {
            delete that.calls[call.contact.id];
        }
        if (call.getCurrentCalled()) {
            call.setCurrentCalled(null);
        }
    }

    private startAsPhoneNumber(phoneNumber) {
        let cleanPhoneNumber = phoneNumber.trim().split(".").join("");
        let pattern1 = /^(\+|\d|#|\*|\(|\)|\.|-|\s|\/)*$/;
        let match = cleanPhoneNumber.match(pattern1);
        if (!match) {
            return false;
        }
        return (match[0] === cleanPhoneNumber);
    }


}

module.exports = Telephony;