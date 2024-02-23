"use strict";
import {logEntryExit} from "../common/Utils";

export {};

import {RESTService} from "../connection/RESTService";
import {XMPPService} from "../connection/XMPPService";
import {ErrorManager} from "../common/ErrorManager";
import {Call} from "../common/models/Call";
import * as VoiceMail from "../common/models/VoiceMail";
import * as utils from "../common/Utils";
import * as PubSub from "pubsub-js";
import { XMPPUTils } from "../common/XMPPUtils";
import {isStarted} from "../common/Utils";
import {TelephonyEventHandler} from "../connection/XMPPServiceHandler/telephonyEventHandler";
import {ContactsService} from "./ContactsService";
import {BubblesService} from "./BubblesService";
import {ProfilesService} from "./ProfilesService";
import {EventEmitter} from "events";
import {Logger} from "../common/Logger";
import {error} from "winston";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import {GenericService} from "./GenericService";

const LOG_ID = "TELEPHONY/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name TelephonyService
 * @version SDKVERSION
 * @public
 * @description
 *      This services manages PBX phone calls in a conversation. so it manages PBX calls between your PABX associated phone and a recipient's phone. If you don't have this service activated for your Rainbow user, all these methods will return an error when called. <br><br>
 *      The main methods and events proposed in that service allow to: <br>
 *      - Know if this service is activated or not for the connected user, <br>
 *      - Know the version of the agent (deployed on the PBX) that monitors your line, <br>
 *      - Handle the basic telephony services: Make a call, take a call, hold a call, retrieve a call and release a call,<br>
 *      - Listen to the call state change <br><br>
 *      Depending the agent version deployed, some services can return an error (unavailable service) when called <br>
 *
 */
class TelephonyService extends GenericService {
    private _contacts: ContactsService;
    private _bubbles: BubblesService;
    private _profiles: ProfilesService;
    private _calls: any;
    private voiceMail: any;
    private userJidTel: any;
    private agentStatus: any;
    private voicemailNumber: any;
    private pbxId: any;
    private forwardObject: any;
    private nomadicObject: any;
    private nomadicAnswerNotTakedIntoAccount: any;
    private isBasicCallAllowed: any;
    private isSecondCallAllowed: any;
    private isTransferAllowed: any;
    private isConferenceAllowed: any;
    private isVMDeflectCallAllowed: any;
    private voiceMailFeatureEnabled: any;
    private isForwardEnabled: any;
    private isNomadicEnabled: any;
    private telephonyHandlerToken: any;
    private telephonyHistoryHandlerToken: any;
    private _telephonyEventHandler: any;
    private makingCall: any;
    private starting: any;
    private stats: any;

    static getClassName(){ return 'TelephonyService'; }
    getClassName(){ return TelephonyService.getClassName(); }

    constructor(_eventEmitter : EventEmitter, logger : Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(logger, LOG_ID);
        let that = this;
        this._startConfig = _startConfig;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._contacts = null;
        this._eventEmitter = _eventEmitter;
        this._logger = logger;
        this._calls = [];
        this.voiceMail = null;//VoiceMail.createVoiceMail();
        this.userJidTel = "TOBEFILLED";//authService.jidTel;
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

        that._eventEmitter.on("evt_internal_presencechanged", that.onTelPresenceChange.bind(that));
        that._eventEmitter.on("evt_internal_callupdated", that.onCallUpdated.bind(that));

//        that._eventEmitter.on("rainbow_onpbxagentstatusreceived", that.onPbxAgentStatusChange.bind(that));

    }

    start(_options, _core : Core) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService, _contacts : ContactsService, _bubbles : BubblesService, _profiles : ProfilesService
        let that = this;
        this.telephonyHandlerToken = [];
        this.telephonyHistoryHandlerToken = [];
        this.voiceMail = VoiceMail.createVoiceMail(_core._profiles);

        return new Promise((resolve, reject) => {
            try {
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;
                that._options = _options;
                that._s2s = _core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                that._contacts = _core.contacts;
                that._bubbles = _core.bubbles;
                that._profiles = _core.profiles;


                that.attachHandlers();

                that.setStarted();
                resolve(undefined);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(start) Catch ErrorManager !!! ");
                that._logger.log("internalerror", LOG_ID + "(start) Catch ErrorManager !!! : ", err.message);
                return reject();
            }
        });
    }

    stop() {
        let that = this;

        return new Promise((resolve, reject) => {
            try {
                that._xmpp = null;
                that._rest = null;

                delete that._telephonyEventHandler;
                that._telephonyEventHandler = null;
                if (that.telephonyHandlerToken) {
                    that.telephonyHandlerToken.forEach((token) => PubSub.unsubscribe(token));
                }
                that.telephonyHandlerToken = [];

                if (that.telephonyHistoryHandlerToken) {
                    that.telephonyHistoryHandlerToken.forEach((token) => PubSub.unsubscribe(token));
                }
                that.telephonyHistoryHandlerToken = [];

                that.setStopped ();
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        });
    }

    attachHandlers() {
        let that = this;
        that._telephonyEventHandler = new TelephonyEventHandler(that._xmpp, that, that._contacts, that._profiles);
        that.telephonyHandlerToken = [
            PubSub.subscribe(that._xmpp.hash + "." + that._telephonyEventHandler.MESSAGE, that._telephonyEventHandler.onMessageReceived.bind(that._telephonyEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that._telephonyEventHandler.IQ_RESULT, that._telephonyEventHandler.onIqResultReceived.bind(that._telephonyEventHandler) )
        ];
    }

    init(useRestAtStartup : boolean) {
        return new Promise(async (resolve, reject) => {
            let that = this;
            that._calls = [];

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

            if (useRestAtStartup) {

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
                that.userJidTel = that._rest.loggedInUser ? that._rest.loggedInUser.jid_tel:"";

                try {
                    await that._xmpp.getAgentStatus().then((data) => {
                        that._logger.log("info", LOG_ID + "[init] getAgentStatus  -- ", data);
                        that.setInitialized();
                        //resolve(undefined);
                    });
                } catch (err) {
                    that._logger.log("warn", LOG_ID + "[init] getAgentStatus failed : ", err);
                    that.setInitialized();
                    //resolve(undefined);
                }
                //resolve(undefined);
            } else {
                that.setInitialized();
                //resolve(undefined);
            }
            resolve(undefined);
        });
    }


    //region Events
    /* onPbxAgentStatusChange(data) {
        let that = this;
        that.agentStatus = data;
    } // */

    /**
     * @private
     * @method onTelPresenceChange
     * @instance
     * @description
     *      Method called when receiving an update on user presence <br>
     */
    onTelPresenceChange (__event, attr?) {
        let that = this;
        if (that._contacts.isTelJid(__event.fulljid)) {
            if (that._contacts.getRessourceFromJid(__event.fulljid) !== "phone") { return true; }
            let jid_im = that._contacts.getImJid(__event.fulljid);
            if (!jid_im) { return true; }

            let status = __event.presence;

            if (that._contacts.isUserContactJid(jid_im)) {

                // Receive unavailable status
                if (status === "unavailable" || status === "offline" || status === "") {
                    that._logger.log("debug", LOG_ID + "[onTelPresenceChange] received my telephony presence -- " + status);
                    that._started = false;
                    that._calls = [];
                    that._logger.log("debug", LOG_ID + "(onTelPresenceChange) send evt_internal_telephonystatuschanged ", "stopped");
                    that._eventEmitter.emit("evt_internal_telephonystatuschanged", "stopped");
                    //$rootScope.$broadcast("ON_TELEPHONY_STATUS_CHANGED_EVENT", "stopped");

                    that._logger.log("debug", LOG_ID + "[onTelPresenceChange] === STOPPED ===");
                }

                // Service is not started, try to fetch agent status
                else if (!that._started && !that.starting) {
                    that._logger.log("debug", LOG_ID + "[onTelPresenceChange] received my telephony presence -- " + status);
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
                                        //return Promise.resolve(undefined);
                                    });
                            }
                            //return Promise.resolve(undefined);
                        })
                        .then(function() {
                            if (that.isForwardEnabled) {
                                return that.getForwardStatus();
                            }
                            //return Promise.resolve(undefined);
                        })
                        .then(function() {
                            // @ts-ignore
                            let startDuration = Math.round(new Date() - that.startDate);
                           // that.stats.push({ service: "telephonyService", startDuration: startDuration });
                            that._logger.log("debug", LOG_ID + "[onTelPresenceChange] === STARTED (" + startDuration + " ms) ===");
                            that._started = true;
                            that.starting = false;
                            that._logger.log("debug", LOG_ID + "(onTelPresenceChange) send evt_internal_telephonystatuschanged ", "started");
                            that._eventEmitter.emit("evt_internal_telephonystatuschanged", "started");
                            //$rootScope.$broadcast("ON_TELEPHONY_STATUS_CHANGED_EVENT", "started");
                        })
                        .catch(function(err) {
                            that.starting = false;
                            that._logger.log("warn", LOG_ID + "[onTelPresenceChange] receive telephony presence but no agent response - error : ", err );
                            //that._logger.log("internalerror", LOG_ID + "[onTelPresenceChange] receive telephony presence but no agent response - : " + error.message);
                        });
                }
            }
        }
        return true;
    }

    /**
     * @private
     * @method onCallUpdated
     * @instance
     * @description
     *      Method called when receiving an update on a call <br>
     */
    onCallUpdated (callInfo : Call) {
        let that = this;
        let status = callInfo.status;

        if (!status || !callInfo.id) return ;

        /*
        switch (status.key) {
            case Call.Status.UNKNOWN:
                // Delete ended call call
                if (callInfo.cause === "NORMALCLEARING") {
                    that._logger.log("debug", LOG_ID + "(onCallUpdated) clearing the call : ", callInfo.id);
                    delete this._calls[callInfo.id];
                } else {
                    that._logger.log("debug", LOG_ID + "(onCallUpdated) Not a normal stop of call, so clearing the call : ", callInfo.id);
                    delete this._calls[callInfo.id];
                }
                break;
            case Call.Status.DIALING:
            case Call.Status.QUEUED_OUTGOING:
            case Call.Status.ACTIVE:
            case Call.Status.RELEASING:
            case Call.Status.ANSWERING:
            case Call.Status.PUT_ON_HOLD:
            case Call.Status.CONNECTING:
            case Call.Status.RINGING_OUTGOING:
            case Call.Status.QUEUED_INCOMING:
            case Call.Status.ERROR:
            case Call.Status.HOLD:
            case Call.Status.RINGING_INCOMING:
                if ( that._calls[callInfo.id] ) {
                    that._calls[callInfo.id].updateCall(callInfo);
                }
                break;
            default:
                break;
        }

         */
    }

    //endregion Events
    
    //region Telephony MANAGEMENT

    /**
     * @public
     * @method isTelephonyAvailable
     * @category Telephony MANAGEMENT
     * @instance
     * @description
     *    Check if the telephony service can be used or not (if the connected user has a phone monitored by a PBX) <br>
     * @return {boolean} Return true if the telephony service is configured
     */
    isTelephonyAvailable() {
        return this._started;
    }

    /**
     * @public
     * @nodered true
     * @method getAgentVersion
     * @instance
     * @category Telephony MANAGEMENT
     * @description
     *    Get the associated PBX agent version <br>
     * @return {string} Return the version of the agent or "unknown"
     */
    getAgentVersion() {
        let that = this;
        return that.agentStatus.agentVersion || "unknown";
    }

    /**
     * @public
     * @nodered true
     * @method getXMPPAgentStatus
     * @instance
     * @category Telephony MANAGEMENT
     * @description
     *    Get the status of the XMPP connection to the PBX Agent <br>
     * @return {string} Return the status of the connections to the agent or "unknown"
     */
    getXMPPAgentStatus() {
        let that = this;
        return that.agentStatus.xmppAgent || "unknown";
    }

    /**
     * @public
     * @nodered true
     * @method getPhoneAPIStatus
     * @instance
     * @category Telephony MANAGEMENT
     * @description
     *    Get the status of the Phone API status for the PBX Agent <br>
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
            that._logger.log("debug", LOG_ID + "[getAgentStatus] -- ", data);
            that.agentStatus = data;
            return data;
        }); // */
    }

    /**
     * @private
     * @method getTelephonyState
     * @instance
     * @category Telephony MANAGEMENT
     * @param second
     */
    getTelephonyState(second) {
        let that = this;

        return new Promise((resolve, reject) => {
            that._xmpp.getTelephonyState(second).then((data : any) => {
                let existingCalls = data;

                if (existingCalls && that.getTabSize(existingCalls) > 0) {
// Traverse existing call
                    let getCallPromises = [];
                    existingCalls.forEach((child : any) => {
                        getCallPromises.push(that.createCallFromConnectionElem(child));
                    });

// Send all getContactPromise
                    Promise.all(getCallPromises)
                        .then(function () {
                            that._logger.log("debug", LOG_ID + "getTelephonyState -- success");
                            resolve(undefined);
                        })
                        .catch(function (error) {
                            that._logger.log("error", LOG_ID + "getTelephonyState -- failure -- " );
                            that._logger.log("internalerror", LOG_ID + "getTelephonyState -- failure -- : ", error.message);
                            return reject(error);
                        });
                }

                //return data;
            });
        });
    }

    /**
     *
     /**
     * @public
     * @nodered true
     * @method getMediaPillarInfo
     * @instance
     * @category Telephony MANAGEMENT
     * @description
     *   This API allows user to retrieve the Jabber id of the Media Pillar linked to the system he belongs, or Media Pillar user to retrieve the Jabber id credentials and data of the Media Pillar he belongs. <br>
     * @async
     * @return {Promise<any>}
     * @category async
     */
     public getMediaPillarInfo() : Promise<any>{
        let that = this;

        return new Promise(function (resolve, reject) {

            if (!that._profiles.isFeatureEnabled(that._profiles.getFeaturesEnum().TELEPHONY_WEBRTC_PSTN_CALLING))
            {
                that._logger.log("error", LOG_ID + "(getMediaPillarInfo) MediaPillar is NOT allowed");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST) ;
            }

            that._logger.log("debug", LOG_ID + "(getMediaPillarInfo) MediaPillar is allowed");

            that._rest.getMediaPillarInfo().then(function (json) {
                that._logger.log("debug", LOG_ID + "(getMediaPillarInfo) retrieve successfull");
                let jid_im = json["jid_im"];
                let prefix = json["prefix"];
                let rainbowPhoneNumber = json["rainbowPhoneNumber"];
                let mediaPillarInfo;

                if ((prefix != null) && (rainbowPhoneNumber != null))
                {
                    mediaPillarInfo = {};
                    mediaPillarInfo.Jid = (jid_im.IndexOf("/") > 0) ? jid_im : jid_im + "/mediapillar";
                    mediaPillarInfo.Prefix = prefix;
                    mediaPillarInfo.RainbowPhoneNumber = rainbowPhoneNumber;
                    mediaPillarInfo.RemoteExtension = prefix + rainbowPhoneNumber;

                    that._logger.log("debug", LOG_ID + "(getMediaPillarInfo) mediaPillarInfo : ", mediaPillarInfo);
                }
                resolve(mediaPillarInfo);

            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getMediaPillarInfo) error.");
                that._logger.log("internalerror", LOG_ID + "(getMediaPillarInfo) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Telephony MANAGEMENT

    //region Telephony CALL

    /**
     * @private
     * @category Telephony CALL
     * @instance
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
                    that._logger.log("internal", LOG_ID + " createCallFromConnectionElem - name resolution for: " + connectionId + " for phoneNumber:" + utils.anonymizePhoneNumber(phoneNumber) +
                        " with firstname : " + firstName.slice(0, 1) + "***");
                }
            }

            // Ignore useless info
            if (lci === "LCI_INITIATED") { resolve(undefined); }

            //service.getSnapshotCall(connectionId);

            // Define getParticipants promise
            let getParticipants = function() {
                if (participantsElem.children.length === 0) {
                    return that._contacts.getOrCreateContact(jid, phoneNumber);
                }
                return that.getParticipantsFromParticipantsElem(participantsElem);
            };

            // Call the promise
            getParticipants().then(function(response : any) {

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
                        that._logger.log("internal", LOG_ID + " createCallFromConnectionElem - create call for user: " + response.id + " with callId: " + connectionId + " " + lci);
                    }
                    else {
                        call = that.getOrCreateCall(callStatus, connectionId, deviceType, null );
                        call.setParticipants(response);
                        call.isConference = true;
                        that._logger.log("internal", LOG_ID + " createCallFromConnectionElem - create conference call with callId: " + connectionId + " " + lci);
                    }
                    call.relevantEquipmentId = Call.getDeviceIdFromConnectionId(connectionId);

                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    // Send call update event
                    //that._logger.log("internal", LOG_ID + "(createCallFromConnectionElem) send evt_internal_callupdated ", call);
                    that._eventEmitter.emit("evt_internal_callupdated", call);

                    resolve(call);
                })
                .catch(function(error) {
                    that._logger.log("error", LOG_ID + " createCallFromConnectionElem - failure - " );
                    that._logger.log("internalerror", LOG_ID + " createCallFromConnectionElem - failure - : ", error.message);
                    return reject(error);
                });
        });
    };

    /**
     * @private
     * @category Telephony CALL
     * @instance
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
                            .then(function(contact) { confParticipants.push(contact); resolvePromise(undefined); })
                            .catch(function(error) { rejectPromise(error); });
                    }));
                }
            });

            // Get participants asynchronously
            Promise.all(participantPromises).then(
                function success() { resolve(confParticipants); },
                function failure(error) { return reject(error); }
            );
        });
    };

    /**
     * @public
     * @nodered true
     * @method getVoiceMessageCounter
     * @async 
     * @category Telephony CALL
     * @instance
     * @description
     *      Get the number of voice message <br>
     * @return {Promise<integer>} Return resolved promise if succeed with the number of messages, and a rejected else.
     */
    async getVoiceMessageCounter() {
        let that = this;
        return new Promise((resolve, reject) => {

            //reject not allowed operations
            if (!that.voiceMailFeatureEnabled) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "getVoiceMessageCounter failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that._logger.log("error", LOG_ID + "(getVoiceMessageCounter) Error." );
                that._logger.log("internalerror", LOG_ID + "(getVoiceMessageCounter) error : ", profileError.msg);
                return reject(profileError);
            }

            that._xmpp.voiceMessageQuery(that.userJidTel).then(function (data) {
                console.error(data);
                resolve(data);
            })
                .catch(function (error) {
                    let errorMessage = "getVoiceMessageCounter failure : " + error.message;
                    that._logger.log("error", LOG_ID + "(getVoiceMessageCounter) Error." );
                    that._logger.log("internalerror", LOG_ID + "(getVoiceMessageCounter) Error : ", errorMessage);
                    return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
                });
        });
    }

    /*********************************************************/
    /**                   CALL HANDLERS                     **/

    /*********************************************************/
    /**
     * @public
     * @nodered true
     * @method getCallToHangOut
     * @category Telephony CALL
     * @instance
     * @description
     *      Get the call which can be hang out <br>
     * @return {Call} The call with the ability to be hang out.
     */
    getCallToHangOut() {
        let that = this;
        let calls = that.getActiveCalls();
        if (!calls || that.getTabSize(calls) === 0) {
            return null;
        }
        let callStatus = calls[0].status;
        if (that.getTabSize(calls) === 1 || (callStatus === Call.Status.DIALING || callStatus === Call.Status.ACTIVE || callStatus === Call.Status.PUT_ON_HOLD)) {
            return calls[0];
        }
        return calls[1];
    }

    /**
     * @public
     * @nodered true
     * @method getActiveCall
     * @category Telephony CALL
     * @instance
     * @description
     *      get the active call <br>
     * @return {Call} The active call
     */
    getActiveCall() {
        let that = this;
        let activeCall = null;
        Object.keys(that._calls || []).forEach(function (key) {
            let call = that._calls[key];
            if (call.status === Call.Status.ACTIVE) {
                activeCall = call;
            }
        });
        return activeCall;
    }

    /**
     * @public
     * @nodered true
     * @method getActiveCalls
     * @category Telephony CALL
     * @instance
     * @description
     *      get active calls <br>
     * @return {Call} The active call
     */
    getActiveCalls() {
        let that = this;
        let calls = [];
        Object.keys(that._calls || []).forEach(function (key) {
            if (
                that._calls[key].status === Call.Status.DIALING ||
                that._calls[key].status === Call.Status.RINGING_OUTGOING ||
                that._calls[key].status === Call.Status.QUEUED_OUTGOING ||
                that._calls[key].status === Call.Status.ACTIVE ||
                that._calls[key].status === Call.Status.HOLD ||
                that._calls[key].status === Call.Status.PUT_ON_HOLD ||
                that._calls[key].status === Call.Status.ERROR) {
                calls.push(that._calls[key]);
            }
        });
        return calls;
    }

    /**
     * @public
     * @nodered true
     * @method getCalls
     * @category Telephony CALL
     * @instance
     * @description
     *      get calls <br>
     * @return {Call} The calls
     */
    getCalls() {
        let that = this;
        let calls = [];
        Object.keys(that._calls || []).forEach(function (key) {
                calls.push(that._calls[key]);
        });
        return calls;
    }

    /**
     * @public
     * @nodered true
     * @method getCallsSize
     * @category Telephony CALL
     * @instance
     * @description
     *      get calls tab size. Warning do not use length on the getCalls method result because it is the last index id +1 <br>
     * @return {Call} The calls tab size
     */
    getCallsSize() {
        return this.getTabSize(this.getCalls());
    }

    /**
     * @private
     * @category Telephony CALL
     * @instance
     * @param {Array} tab The tab which need to be sized
     */
    getTabSize(tab){
        return Object.keys(tab).length;
    }

    /**
     * @public
     * @nodered true
     * @method getActiveCall
     * @param {Contact} contact The contact with an active call with us.
     * @category Telephony CALL
     * @instance
     * @description
     *      get the active call for a contact <br>
     * @return {Call} The active call
     */
    getActiveCallsForContact(contact) {
        let that = this;
        let calls = [];
        if (contact && contact.jid) {
            Object.keys(that._calls || []).forEach(function (key) {
                if (
                    (that._calls[key].contact && that._calls[key].contact.jid === contact.jid) &&
                    (that._calls[key].status === Call.Status.DIALING ||
                        that._calls[key].status === Call.Status.RINGING_OUTGOING ||
                        that._calls[key].status === Call.Status.ACTIVE ||
                        that._calls[key].status === Call.Status.HOLD ||
                        that._calls[key].status === Call.Status.PUT_ON_HOLD)) {
                    calls.push(that._calls[key]);
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
     * @nodered true
     * @method makeCall
     * @instance
     * @async
     * @category Telephony CALL
     * @description
     *    Call a number <br>
     *    Contacts and numbers are allowed <br>
     *    Return a promise <br>
     * @param {Contact} contact - contact object that you want to call
     * @param {String} phoneNumber The number to call
     * @param {String} correlatorData contains User-to-User information to be sent out as a SIP header via underlying PBX trunk for a given call
     * @return {Promise<Call>} Return a promise with the call created
     */
    async makeCall(contact, phoneNumber, correlatorData) {
        let that = this;
        let activeCall = that.getActiveCall();

        if (that.makingCall && !that.isSecondCallAllowed) {
            that._logger.log("debug", LOG_ID + "(makeCall) makeCall failure - makeCall already making a call, is second call allowed ? ", that.isSecondCallAllowed);
            return Promise.reject();
        }

        if (!contact) {
            contact = {};
        }

        // Set makingCall flag
        that.makingCall = true;

        // Handle simpleCall
        if (!activeCall) {
            return that.makeSimpleCall(contact, phoneNumber, correlatorData);
        }

        // Handle consultationCall
        return that.makeConsultationCall(contact, phoneNumber, activeCall.connectionId, correlatorData);
    }

    /**
     * @private
     * @method makeSimpleCall
     * @async
     * @category Telephony CALL
     * @instance
     * @param contact
     * @param phoneNumber
     * @param correlatorData contains User-to-User information to be sent out as a SIP header via underlying PBX trunk for a given call
     */
    private async makeSimpleCall(contact, phoneNumber, correlatorData) : Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("internal", LOG_ID + "(makeSimpleCall) to " + (contact ? contact.displayName : phoneNumber));

            //reject not allowed operations
            if (!that.isBasicCallAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "makeSimpleCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that._logger.log("internalerror", LOG_ID + "(makeSimpleCall) Error.");
                that._logger.log("error", LOG_ID + "(makeSimpleCall) Error : ", profileError.msg);

                // Release makingCall flag
                that.makingCall = false;
                return reject(profileError);
            }

            let phoneInfo = that.getPhoneInfo(contact, phoneNumber, correlatorData);
            that._rest.makeCall(contact, phoneInfo).then(
                function success(response : any) {
                    // Create the call object
                    let callInfos = {
                        status: Call.Status.DIALING,
                        id: Call.getIdFromConnectionId(response.callId),
                        type: Call.Type.PHONE,
                        contact,
                        deviceType: undefined,
                        connectionId: response.callId
                    };
                    //let call = Call.CallFactory()(callInfos);
                    //let call = Call.create(Call.Status.DIALING, null, Call.Type.PHONE, contact, undefined);
                    //call.setConnectionId(response.callId);

                    // Release makinCall flag
                    that.makingCall = false;

                    let call = that.addOrUpdateCallToCache(callInfos);

                    // Indicate whether it is a call to own voicemail
                    call.setIsVm(phoneNumber === that.voicemailNumber);

                    that._logger.log("internal", LOG_ID + "(makeSimpleCall) success : " + utils.anonymizePhoneNumber(phoneNumber) + " Call (" + call + ")");

                    // Send call update event
                    /* TREATED BY EVENTS
                    that._logger.log("debug", LOG_ID + "(makeSimpleCall) send evt_internal_callupdated ", call);
                    that._eventEmitter.emit("evt_internal_callupdated", call);
                     */
                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    resolve(call);
                },
                async (response) => {
                    that._logger.log("internal", LOG_ID + "(makeSimpleCall) failed : ", response);
                    //let call = Call.create(Call.Status.ERROR, null, Call.Type.PHONE, contact, undefined);

                    let id = 0;
                    if (contact && contact.id) {
                        id = contact.id;
                    } else {
                        let min = Math.ceil(1);
                        let max = Math.floor(9999);
                        id = 9999 +  Math.floor(Math.random() * (max - min +1)) + min;
                    }
                    let callInfos = {
                        status: Call.Status.ERROR,
                        id: id + "",
                        type: Call.Type.PHONE,
                        contact,
                        deviceType: undefined,
                        connectionId: id + "#00",
                        cause : "error"
                    };
                    //let call = Call.CallFactory()(callInfos);
                    //call.cause = "error";
                    //that._calls[call.contact.id] = call;
                    //this._calls.push(call);
                    let call = this.addOrUpdateCallToCache(callInfos);

                    that._logger.log("error", LOG_ID + "(makeSimpleCall) that._calls.length : ", that._calls.length);
                    // call.autoClear = $interval(function () {
                    await that.clearCall(call);
                    //}, 5000, 1);

                    // Release makinCall flag
                    that.makingCall = false;

                    // Send call update event
                    //that._logger.log("internal", LOG_ID + "(makeSimpleCall) send evt_internal_callupdated ", call);
                    that._eventEmitter.emit("evt_internal_callupdated", call);
                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                    return reject(error);
                    //that._logger.log("error", LOG_ID + "(makeSimpleCall) Error.");
                    //that._logger.log("internalerror", LOG_ID + "(makeSimpleCall) Error : ", error);
                });
        });
    }

    /**
     * @private
     * @method makeConsultationCall
     * @category Telephony CALL
     * @instance
     * @param contact
     * @param phoneNumber
     * @param {String} correlatorData contains User-to-User information to be sent out as a SIP header via underlying PBX trunk for a given call
     * @param callId
     */
    private async makeConsultationCall(contact, phoneNumber, callId, correlatorData ) {
        let that = this;
        return new Promise((resolve, reject) => {

            //reject not allowed operations
            if (!that.isSecondCallAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "makeConsultationCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that._logger.log("error", LOG_ID + "(makeConsultationCall) Error." );
                that._logger.log("internalerror", LOG_ID + "(makeConsultationCall) Error : ", profileError.msg);

                // Release makingCall flag
                that.makingCall = false;
                return reject(profileError);
            }

            let phoneInfo = that.getPhoneInfo(contact, phoneNumber, correlatorData);
            that._rest.makeConsultationCall(callId, contact, phoneInfo).then(
                function success(response : any) {
                    // Create the call object
                    //let call = Call.create(Call.Status.DIALING, null, Call.Type.PHONE, contact, undefined);
                    let callInfos = {
                        status : Call.Status.DIALING,
                        id:"",
                        type : Call.Type.PHONE,
                        contact,
                        deviceType : undefined,
                    } ;
                    if (response && response.data && response.data.data) {
                        callInfos.id = Call.getIdFromConnectionId(response.data.data.callId);
                    } else {
                        that._logger.log("internal", LOG_ID + "(makeConsultationCall) makeConsultationCall response.data.data empty, can not find callId, get it directly in response : ", response);
                        callInfos.id = Call.getIdFromConnectionId(response.callId);
                    }

                    //let call = Call.CallFactory()(callInfos);
                    //call.setConnectionId(response.data.data.callId);
                    //that._calls[call.id] = call;
                    //this._calls.push(call);
                    let call = that.addOrUpdateCallToCache(callInfos);
                    that._logger.log("internal", LOG_ID + "(makeConsultationCall) makeConsultationCall success : " + utils.anonymizePhoneNumber(phoneNumber) + " Call (" + call + ")");

                    // Release makinCall flag
                    that.makingCall = false;

                    // Indicate whether it is a call to own voicemail
                    call.setIsVm(phoneNumber === that.voicemailNumber);

                    // Send call update event
                    /* TREATED BY EVENTS
                    that._logger.log("debug", LOG_ID + "(makeConsultationCall) send evt_internal_callupdated ", call);
                    that._eventEmitter.emit("evt_internal_callupdated", call);
                     */
                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    resolve(call.id);
                },
                async function failure(response) {
                    //let call = Call.create(Call.Status.ERROR, null, Call.Type.PHONE, contact, undefined);
                    let callInfos = {
                        status : Call.Status.ERROR,
                        id: contact.id + "",
                        type : Call.Type.PHONE,
                        contact,
                        deviceType : undefined,
                        connectionId: contact.id + "#00",
                        cause : "error"
                    } ;
                    //let call = Call.CallFactory()(callInfos);
                    //call.cause = "error";
                    //that._calls[call.contact.id] = call;
                    //this._calls.push(call);

                    let call = that.addOrUpdateCallToCache(callInfos);

                    //call.autoClear = $interval(function () {
                    await that.clearCall(call);
                    //}, 5000, 1);

                    // Release makinCall flag
                    that.makingCall = false;

                    // Send call update event
                    //that._logger.log("debug", LOG_ID + "(makeConsultationCall) send evt_internal_callupdated ", call);
                    that._eventEmitter.emit("evt_internal_callupdated", call);
                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                    return reject(error);
                    //that._logger.log("error", LOG_ID + "(makeConsultationCall) Error");
                    //that._logger.log("internalerror", LOG_ID + "(makeConsultationCall) Error : ", error);
                });
        });
    }

    /**
     * @public
     * @nodered true
     * @method makeCall
     * @async
     * @category Telephony CALL
     * @instance
     * @description
     *    Call a number <br>
     *    Return a promise <br>
     * @param {String} phoneNumber The number to call
     * @param {String} correlatorData contains User-to-User information to be sent out as a SIP header via underlying PBX trunk for a given call
     * @return {Promise<Call>} Return a promise with the call created
     */
    async makeCallByPhoneNumber(phoneNumber, correlatorData) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("internal", LOG_ID + "(makeCallByPhoneNumber) calling : " + utils.anonymizePhoneNumber(phoneNumber));
            if (that._contacts.userContact.phonePro === phoneNumber || that._contacts.userContact.phoneProCan === phoneNumber || that._contacts.userContact.phonePbx === phoneNumber) {
                let errorMessage = "makeCallByPhoneNumber) failure: impossible to call its own phone number";
                that._logger.log("error", LOG_ID + "(makeCallByPhoneNumber) Error.");
                that._logger.log("internalerror", LOG_ID + "(makeCallByPhoneNumber) Error : ", errorMessage);
                return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
            }
            let myContact = null;
            that._contacts.getOrCreateContact(null, phoneNumber)
                .then( (contact) => {
                    myContact = contact;
                    return that.makeCall(contact, phoneNumber, correlatorData);
                })
                .then( (data) => {
                    that._logger.log("internal", LOG_ID + "(makeCallByPhoneNumber) after makeCall resolve result : ", data);
                    resolve(data);
                })
                .catch( (error) => {
                    that._logger.log("error", LOG_ID + "(makeCallByPhoneNumber) Error.");
                    that._logger.log("internalerror", LOG_ID + "(makeCallByPhoneNumber) Error : ", error);
                    return reject(error);
                   /* let _errorMessage = "makeCallByPhoneNumber failure " + (error ? error.message : "");
                    that._logger.log("error", LOG_ID + "(makeCallByPhoneNumber) - Error." );
                    that._logger.log("internalerror", LOG_ID + "(makeCallByPhoneNumber) - Error : ", _errorMessage);

//                    let call = Call.create(Call.Status.ERROR, null, Call.Type.PHONE, myContact, undefined);
                    let callInfos = {status : Call.Status.ERROR, id : undefined, type : Call.Type.PHONE, contact : myContact, deviceType : undefined} ;
                    let call = Call.CallFactory()(callInfos);
                    call.cause = "invalidPhoneNumber";
                    that._calls[call.contact.id] = call;
                    await that.clearCall(call);
                    //that._logger.log("internal", LOG_ID + "(makeCallByPhoneNumber) send evt_internal_callupdated ", call);
                    that._eventEmitter.emit("evt_internal_callupdated", call);

//                    $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);

                    reject(ErrorManager.getErrorManager().OTHERERROR(call.cause, _errorMessage)); // */
                });
        });
    }


    /* TO DO */

    /*		service.makeCallWithMobile = function(mobileRessource, phoneNumber) {

                let defer = $q.defer();

                if (contactService.userContact.mobilePro === phoneNumber || contactService.userContact.mobilePerso === phoneNumber) {
                    let errorMessage = "makeCallWithMobile failure: impossible to call its own mobile phone number";
                    that._logger.log("error", LOG_ID + "(makeCallWithMobile) " + errorMessage);
                    defer.reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage));
                    return defer.promise;
                }

                // Forge request IQ
                let makeMobileCallMsg = $iq({ type: "set", to: mobileRessource })
                    .c("call", { xmlns: "urn:xmpp:call", phoneNumber: phoneNumber, directCall: false });

                xmppService.sendIQ(makeMobileCallMsg)
                    .then(function() {
                        defer.resolve(undefined);
                    })
                    .catch(function(error) {
                        let errorMessageMobile = "makeCallWithMobile failure : " + error.message;
                        that._logger.log("error", LOG_ID + "(makeCallWithMobile) - callService - " + errorMessageMobile);
                        defer.reject(ErrorManager.getErrorManager().OTHERERROR(errorMessageMobile));
                    });

                // Return the promise
                return defer.promise;
            };
    */

    /**
     * @private
     * @method getPhoneInfo
     * @category Telephony CALL
     * @instance
     * @param contact
     * @param phoneNumber
     * @param correlatorData contains User-to-User information to be sent out as a SIP header via underlying PBX trunk for a given call
     */
    private getPhoneInfo(contact, phoneNumber, correlatorData) {
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
        return {longNumber: longNumber, shortNumber: shortNumber, pbxId: pbxId, internalNumber: internalNumber, correlatorData: correlatorData};//#29475
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

                that._logger.log("error", LOG_ID + "(makeCallWithMobile) " + errorMessage);

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
     * @nodered true
     * @method releaseCall
     * @async
     * @category Telephony CALL
     * @instance
     * @description
     *    Release a call <br>
     *    Return a promise <br>
     * @param {Call} call The call to release
     * @return {Promise<Call>} Return a promise with the call released
     */
    async releaseCall(call) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log("internal", LOG_ID + "(releaseCall) call : ", call);
            that._logger.log("debug", LOG_ID + "(releaseCall) call id : ", call.id);

            //reject not allowed operations
            if (!that.isBasicCallAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "releaseCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that._logger.log("error", LOG_ID + "(releaseCall) Error : ", profileError );
                that._logger.log("internalerror", LOG_ID + "(releaseCall) Error : ", profileError);
                return reject(profileError);
            }


            that._rest.releaseCall(call).then(
                async () => {
                    // Update call status
                    that._logger.log("debug", LOG_ID + "(releaseCall) releaseCall " + call.id + " - success");

                    // SHOULD BE TREATED BY EVENTS. But server dos not send the event if it is the end of a conference
                    call.setStatus(Call.Status.UNKNOWN);
                    call.startDate = null;
                    call.vm = false;

                    // Send call update event
                    //that._logger.log("internal", LOG_ID + "(releaseCall) send evt_internal_callupdated ", call);
                    that._eventEmitter.emit("evt_internal_callupdated", call);
                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);

                    // Clean the call array
                    // service.calls = []; //// MCO OULALALALA
                    //delete that.calls[call.id];
                    // Keep the delete of released Call because the server do not raise the end call event on one participant of an OXE conference.
                    await that.removeCallFromCache(call.id);
                   // */

                    resolve(call);
                },
                (response) => {
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                    that._logger.log("error", LOG_ID + "(releaseCall) Error.");
                    that._logger.log("internalerror", LOG_ID + "(releaseCall) Error : ", error, ", response : ", response);
                    return reject(error);
                });
        });
    }

    /*************************************************************/
    /*                     ANSWER CALL STUFF                     */

    /*************************************************************/

    /**
     * @public
     * @nodered true
     * @method answerCall
     * @async
     * @category Telephony CALL
     * @instance
     * @description
     *    Answer a call <br>
     *    Return a promise <br>
     * @param {Call} call The call to answer
     * @return {Promise<Call>} Return a promise with the answered call.
     */
     async answerCall(call) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (call.contact) {
                that._logger.log("internal", LOG_ID + "(answerCall) : " + utils.anonymizePhoneNumber(call.contact.phone) + "(" + call.contact.displayNameForLog() + ")");
            } else {
                that._logger.log("internal", LOG_ID + "(answerCall) : ", call);
            }

            // First hold the current active call
            let activeCall = that.getActiveCall();

            //reject not allowed operations
            if (!that.isBasicCallAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "answerCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that._logger.log("error", LOG_ID + "(answerCall) Error." );
                that._logger.log("internalerror", LOG_ID + "(answerCall) Error : ", profileError.msg);
                return reject(profileError);
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
                        that._logger.log("error", LOG_ID + "(answerCall) - callService - Error" );
                        that._logger.log("internalerror", LOG_ID + "(answerCall) - callService - Error : ", errorMessage);
                        return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
                    });
            }
            else {
               that._rest.answerCall(call).then(
                    function success(response : any) {
                        // Update call status
                        call.setConnectionId(response.callId);
                        call.setStatus(Call.Status.ACTIVE);
                        that._logger.log("internal", LOG_ID + "(answerCall) answerCall success : " + utils.anonymizePhoneNumber(call.contact.phone) + " Call (" + call + ")");

                        /* TREATED BY EVENTS
                            // Send call update event
                            that._logger.log("debug", LOG_ID + "(answerCall) send evt_internal_callupdated ", call);
                            that._eventEmitter.emit("evt_internal_callupdated", call);
                            //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);

                         */
                            resolve(call);
                        },
                        function failure(response) {
                            // Send call update event
                            //that._logger.log("internal", LOG_ID + "(answerCall) send evt_internal_callupdated ", call);
                            that._eventEmitter.emit("evt_internal_callupdated", call);
                            //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                            let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                            that._logger.log("error", LOG_ID + "(answerCall) Error.");
                            that._logger.log("internalerror", LOG_ID + "(answerCall) Error : ", error);
                            return reject(error);
                    });
                }
            });
        }

        /*************************************************************/
    /*                      HOLD CALL STUFF                      */

    /*************************************************************/

    /**
     * @public
     * @nodered true
     * @method holdCall
     * @category Telephony CALL
     * @instance
     * @description
     *    Hold a call <br>
     *    Return a promise <br>
     * @param {Call} call The call to hold
     * @return {Call} Return a promise with the held call.
     */
    async holdCall(call) {
        let that = this;
        return new Promise(function (resolve, reject) {
            // Ignore call already hold
            if (!call || call.status === Call.Status.HOLD) {
                return resolve(call);
            }

            //reject not allowed operations
            if (!that.isSecondCallAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "holdCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that._logger.log("error", LOG_ID + "(holdCall) Error.");
                that._logger.log("internalerror", LOG_ID + "(holdCall) ", profileError.msg);
                return reject(profileError);
            }

            /* $http({
                method: "PUT",
                url: service.portalURL + "calls/" + encodeURIComponent(call.connectionId) + "/hold",
                headers: authService.getRequestHeader()
            }) // */
            that._rest.holdCall(call).then(
                function success(response : any) {
                    that._logger.log("debug", LOG_ID + "(holdCall) holdCall success.");
                    that._logger.log("internal", LOG_ID + "(holdCall) holdCall success : " + utils.anonymizePhoneNumber(call.contact.phone) + " Call (" + call + "), response : ", response);
                    // Update call status
                    if (response && response.data && response.data.data) {
                        call.setConnectionId(response.data.data.callId);
                    } else {
                        that._logger.log("internal", LOG_ID + "(holdCall) holdCall response.data.data empty, can not find callId, get it directly in response : ", response);
                        call.setConnectionId(response.callId);
                    }
                    call.setStatus(Call.Status.HOLD);

                    /* TREATED BY EVENTS
                    // Send call update event
                    that._logger.log("debug", LOG_ID + "(holdCall) send evt_internal_callupdated ", call);
                    that._eventEmitter.emit("evt_internal_callupdated", call);
                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                     */
                    resolve(call);
                },
                function failure(response) {
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                    reject(error);
                    that._logger.log("error", LOG_ID + "(holdCall) Error.");
                    that._logger.log("internalerror", LOG_ID + "(holdCall) Error : ", error);
        });
        });
    }

    /*************************************************************/
    /*                     RETRIEVE CALL STUFF                     */

    /*************************************************************/

    /**
     * @public
     * @nodered true
     * @method retrieveCall
     * @async
     * @category Telephony CALL
     * @instance
     * @description
     *    Retrieve a call <br>
     *    Return a promise <br>
     * @param {Call} call The call to retrieve
     * @return {Promise<Call>} Return a promise with the call retrieved
     */
    async retrieveCall(call) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log("internal", LOG_ID + "(retrieveCall) retrieveCall : " + call.contact.displayNameForLog());

            //reject not allowed operations
            if (!that.isSecondCallAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "retrieveCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that._logger.log("error", LOG_ID + "(retrieveCall) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveCall) Error : ", profileError.msg);
                return reject(profileError);
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
                        that._logger.log("error", LOG_ID + "(retrieveCall) - callService -  Error." );
                        that._logger.log("internalerror", LOG_ID + "(retrieveCall) - callService - Error : ", errorMessage);
                        return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
                    });
            }
            else {
                /*$http({
                    method: "PUT",
                    url: service.portalURL + "calls/" + encodeURIComponent(call.connectionId) + "/retrieve",
                    headers: authService.getRequestHeader()
                })// */
                 that._rest.retrieveCall(call).then(
                    function success(response : any) {
                        that._logger.log("internal", LOG_ID + "(retrieveCall) retrieveCall success : " + utils.anonymizePhoneNumber(call.contact.phone) + " Call (" + call + ")");
                        // Update call status
                        if (response && response.data && response.data.data) {
                            call.setConnectionId(response.data.data.callId);
                        } else {
                            that._logger.log("internal", LOG_ID + "(retrieveCall) retrieveCall response.data.data empty, can not find callId, get it directly in response : ", response);
                            call.setConnectionId(response.callId);
                        }
                        call.setStatus(Call.Status.ACTIVE);

                        /* TREATED BY EVENTS
                            // Send call update event
                            that._logger.log("debug", LOG_ID + "(retrieveCall) send evt_internal_callupdated ", call);
                            that._eventEmitter.emit("evt_internal_callupdated", call);
                            //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);

                         */
                            resolve(undefined);
                        },
                        function failure(response) {
                            let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                            that._logger.log("error", LOG_ID + "(retrieveCall) Error.");
                            that._logger.log("internalerror", LOG_ID + "(retrieveCall) Error : ", error);
                            return reject(error);
                        });
                }
            });
        }

        /*************************************************************/
    /*                     DEFLECT CALL STUFF                    */

    /*************************************************************/

    /**
     * @public
     * @nodered true
     * @method deflectCallToVM
     * @async
     * @category Telephony CALL
     * @instance
     * @description
     *    Deflect a call to the voice mail <br>
     *    Return a promise <br>
     * @param {Call} call The call to deflect
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    async deflectCallToVM(call) {
        let that = this;
        return new Promise((resolve, reject) => {
            // Ignore wrong request
            if (!call) {
                return resolve(call);
            }

            //reject not allowed operations
            if (!that.isVMDeflectCallAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "deflectCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that._logger.log("error", LOG_ID + "(deflectCallToVM) Error." );
                that._logger.log("internalerror", LOG_ID + "(deflectCallToVM) Error : " + profileError.msg);
                return reject(profileError);
            }

            that._logger.log("internal", LOG_ID + "(deflectCallToVM) deflectCallToVM ", call.contact.displayNameForLog());

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

//            that._logger.log("debug", LOG_ID + "(deflectCallToVM) data : ", data, ", connectedUser : ", that._contacts.getConnectedUser());
            
            that._rest.deflectCallToVM(call, data) .then(
                function success() {
                    that._logger.log("debug", LOG_ID + "(deflectCallToVM) deflectCall success");
                    resolve(undefined);
                },
                function failure(response) {
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                    that._logger.log("error", LOG_ID + "(deflectCallToVM) Error.");
                    that._logger.log("internalerror", LOG_ID + "(deflectCallToVM) Error : ", error);
                    return reject(error);
                });
        });
    }

    /*************************************************************/
    /*                     DEFLECT CALL STUFF                    */

    /*************************************************************/

    /**
     * @public
     * @nodered true
     * @method deflectCall
     * @async
     * @category Telephony CALL
     * @instance
     * @description
     *    Deflect a call to an other telephone number<br>
     *    Return a promise <br>
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
    async deflectCall(call, callee) {
        let that = this;
        return new Promise((resolve, reject) => {
            // Ignore wrong request
            if (!call || !callee) {
                resolve(undefined);
            }

            that._logger.log("internal", LOG_ID + "(deflectCall) deflectCall " + call.contact.displayNameForLog());

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
                    that._logger.log("debug", LOG_ID + "(deflectCall) deflectCall success");
                    resolve(undefined);
                },
                function failure(response) {
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                    that._logger.log("error", LOG_ID + "(deflectCall) Error. ");
                    that._logger.log("internalerror", LOG_ID + "(deflectCall) Error : ", error);
                    return reject(error);
                });
        });
    }

    /*************************************************************/
    /*                   TRANSFERT CALL STUFF                    */

    /*************************************************************/
    /**
     * @public
     * @nodered true
     * @method transfertCall
     * @async
     * @category Telephony CALL
     * @instance
     * @description
     *    Transfer a held call to the active call <br>
     *    User should have transfer rights <br>
     *    Return a promise <br>
     * @param {Call} activeCall The active call
     * @param {Call} heldCall The held call to transfer to the activeCall
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    async transfertCall(activeCall, heldCall) {
        let that = this;
        return new Promise((resolve, reject) => {
            // Ignore wrong request
            if (!activeCall || !heldCall) {
                return resolve(undefined);
            }

            //reject not allowed operations
            if (!that.isTransferAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "transferCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that._logger.log("error", LOG_ID + "(transfertCall) Error." );
                that._logger.log("internalerror", LOG_ID + "(transfertCall) Error : " + profileError.msg);
                return reject(profileError);
            }

            that._logger.log("internal", LOG_ID + "(transfertCall) transfertCall held(" + heldCall.contact.displayName + ") to active(" + activeCall.contact.displayName + ")");

            /*$http({
                method: "PUT",
                url: service.portalURL + "calls/" + encodeURIComponent(activeCall.connectionId) + "/transfer/" + encodeURIComponent(heldCall.connectionId),
                headers: authService.getRequestHeader()
            })
                // */
            that._rest.transfertCall(activeCall, heldCall).then(
                async function success() {
                    that._logger.log("debug", LOG_ID + "(transfertCall) transferCall success");
                    // Release makinCall flag
                    that.makingCall = false;
                    await that.clearCall(activeCall);
                    await that.clearCall(heldCall);
                    resolve(undefined);
                },
                function failure(response) {
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                    that._logger.log("error", LOG_ID + "(transfertCall) Error.");
                    that._logger.log("internalerror", LOG_ID + "(transfertCall) Error : ", error);
                    return reject(error);
                });
        });
    }

    /*************************************************************/
    /* MAKE CONFERENCE CALL STUFF                                */
    /*************************************************************/
    /**
     * @public
     * @nodered true
     * @method conferenceCall
     * @async
     * @category Telephony CALL
     * @instance
     * @description
     *    Create a conference with a held call and the active call <br>
     *    User should have conference rights <br>
     *    Return a promise <br>
     * @param {Call} activeCall The active call
     * @param {Call} heldCall The held call to transfer to the activeCall
     * @return {Promise} Return a resolved promise .
     */
    async conferenceCall(activeCall, heldCall) {
        let that = this;

        return new Promise((resolve, reject) => {
            // Ignore wrong request
            if (!activeCall || !heldCall) {
                return resolve(undefined);
            }

            //reject not allowed operations
            if (!that.isConferenceAllowed) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "conferenceCall failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that._logger.log("error", LOG_ID + "(conferenceCall) Error." );
                that._logger.log("internalerror", LOG_ID + "(conferenceCall) Error : " + profileError.msg);
                return reject(profileError);
            }

            if (activeCall && activeCall.contact && heldCall && heldCall.contact) {
                that._logger.log("internal", LOG_ID + "(conferenceCall) conferenceCall " + activeCall.contact.displayName + " and " + heldCall.contact.displayName);
            }
            that._logger.log("internal", LOG_ID + "(conferenceCall) conferenceCall activeCall : ", activeCall, ",\n\n(conferenceCall) conferenceCall heldCall : ", heldCall);

            /* $http({
                method: "PUT",
                url: service.portalURL + "calls/" + encodeURIComponent(activeCall.connectionId) + "/conference/" + encodeURIComponent(heldCall.connectionId),
                headers: authService.getRequestHeader()
            }) // */
            that._rest.conferenceCall(activeCall, heldCall).then(
                function success() {
                    that._logger.log("debug", LOG_ID + "(conferenceCall) conferenceCall success");
                    resolve(undefined);
                },
                function failure(response) {
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                    return reject(error);
                    that._logger.log("error", LOG_ID + "(conferenceCall) error.");
                    that._logger.log("internalerror", LOG_ID + "(conferenceCall) Error : ", error);
                });
        });
    }

    /*************************************************************/
    /* FORWARD CALL STUFF               		                 */

    /*************************************************************/
    /**
     * @public
     * @nodered true
     * @method forwardToDevice
     * @async
     * @category Telephony CALL
     * @instance
     * @description
     *    Activate the forward to a number <br>
     *    Return a promise <br>
     * @param {String} phoneNumber The number to call
     * @return {Promise} Return a promise resolved.
    */
    async forwardToDevice(phoneNumber) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log("internal", LOG_ID + "(forwardToDevice) forwardToDevice : " + phoneNumber);

            if (that._contacts.userContact.phonePro === phoneNumber || that._contacts.userContact.phoneProCan === phoneNumber || that._contacts.userContact.phonePbx === phoneNumber) {
                let errorMessage = "forwardToDevice failure: impossible to forward its own phone number";
                that._logger.log("error", LOG_ID + "(forwardToDevice) Error." );
                that._logger.log("internalerror", LOG_ID + "(forwardToDevice) Error : ", errorMessage);
                return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
            }
            that._contacts.getOrCreateContact(null, phoneNumber)
                .then(function (contact) {
                    let phoneInfo = that.getPhoneInfo(contact, phoneNumber, undefined);
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
                            resolve(undefined);
                        },
                        function failure(response) {
                            let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                            return reject(error);
                            that._logger.log("error", LOG_ID + "(forwardToDevice) Error.");
                            that._logger.log("internalerror", LOG_ID + "(forwardToDevice) Error : ", error);
                        });
                });
        });
    }

    /**
     * @public
     * @nodered true
     * @method forwardToVoicemail
     * @async
     * @category Telephony CALL
     * @instance
     * @description
     *    Activate the forward to VM <br>
     *    Return a promise <br>
     * @return {Promise} Return a promise resolved.
     */
    async forwardToVoicemail() {
        let that = this;
        return new Promise((resolve, reject) => {

            if (!that.voiceMailFeatureEnabled) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "forwardToVoicemail failure - voicemail feature not enabled");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "404";
                // @ts-ignore
                that._logger.log("error", LOG_ID + "(forwardToVoicemail) Error.");
                that._logger.log("internalerror", LOG_ID + "(forwardToVoicemail) Error : ", profileError.msg);
                return reject(profileError);
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
                    resolve(undefined);
                },
                function failure(response) {
                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                    that._logger.log("error", LOG_ID + "(forwardToVoicemail) Error.");
                    that._logger.log("internalerror", LOG_ID + "(forwardToVoicemail) Error : ", error);
                    return reject(error);
                });
        });
    }

    /**
     * @public
     * @nodered true
     * @method cancelForward
     * @async
     * @category Telephony CALL
     * @instance
     * @description
     *    Cancel the forward <br>
     *    Return a promise <br>
     * @return {Promise<Call>} Return a promise with the canceled forward call.
     */
    async cancelForward() {
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
                        that._logger.log("debug", LOG_ID + "(cancelForward) cancelForward success");
                        resolve(undefined);
                    },
                    function failure(response) {
                        let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                        that._logger.log("error", LOG_ID + "(cancelForward) Error.");
                        that._logger.log("internalerror", LOG_ID + "(cancelForward) Error : ", error);
                        return reject(error);
                    });
            }
            else {
                return reject();
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
                        resolve(undefined);
                    },
                    function failure(response) {
                        let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                        that._logger.log("error", LOG_ID + "(getForwardStatus) error.");
                        that._logger.log("internalerror", LOG_ID + "(getForwardStatus) Error : ", error);
                        return reject(error);
                    });
            }
            else {
                return reject();
            }
        });
    }

    /*************************************************************/
    /* DTMF             		                 				*/
    /*************************************************************/
    /**
     * @public
     * @nodered true
     * @method sendDtmf
     * @async
     * @category Telephony CALL
     * @instance
     * @description
     *      send dtmf to the remote party <br>
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
                                    resolve(undefined);
                                },
                                function failure(response) {
                                    let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                                    that._logger.log("error", LOG_ID + "(sendDtmf) Error.");
                                    that._logger.log("internalerror", LOG_ID + "(sendDtmf) Error : ", error);
                                    return reject(error);
                                });
            } else {
                return reject();
            }
        });
    }

    /**
     * @private
     * @method clearCall
     * @category Telephony CALL
     * @instance
     * @param Call call the call to reset.
     * @return nothing.
     */
    private async clearCall(call) {
        let that = this;
        call.setStatus(Call.Status.UNKNOWN);
        /* TREATED BY EVENTS

// $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
that._logger.log("debug", LOG_ID + "(clearCall) send evt_internal_callupdated ", call);
that._eventEmitter.emit("evt_internal_callupdated", call);
*/
        //if (call.contact) {
        //delete that.calls[call.contact.id];
        //}
        let callIdToDelete = Call.getIdFromConnectionId(call.connectionId);
        //delete that._calls[callIdToDelete];
        await that.removeCallFromCache(callIdToDelete);
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

    /**
     * @private
     * @method getOrCreateCall
     * @category Telephony CALL
     * @instance
     * @param status
     * @param connectionId
     * @param deviceType
     * @param contact
     */
    getOrCreateCall(status, connectionId, deviceType, contact?) {
        let that = this;

        // Extract callid from connectionid
        let callId = Call.getIdFromConnectionId(connectionId);
        that._logger.log("debug", LOG_ID + "(getOrCreateCall) callId ", callId);
        let callInfos = {"status" : status, "id" : callId, "connectionId" : connectionId, "type" : Call.Type.PHONE, "contact" : contact, "deviceType" : deviceType} ;
        that._logger.log("internal", LOG_ID + "(getOrCreateCall) callInfos : ", callInfos);
        if (!callId) {
            let call = Call.CallFactory()(callInfos);
            call.setConnectionId(connectionId);
            that._logger.log("internal", LOG_ID + "(getOrCreateCall) no callId found, so return a call which is not stored in calls tab. call : ", call);
            return call;
        }

        let call = that.addOrUpdateCallToCache(callInfos);
        /*

        // Get eventual existing call
        let call = that.getCallFromCache(callId);
        if (call) {
            call.setConnectionId(connectionId);
            call.startDate = new Date();
        }
        else {
            //call = Call.create(status, null, Call.Type.PHONE, contact, deviceType);
            let callInfos = {status, id : undefined, type : Call.Type.PHONE, contact, deviceType} ;
            call = that.addOrUpdateCallToCache(callInfos);

         */
        /*call = Call.CallFactory()(callInfos);
        call.setConnectionId(connectionId);
        that._calls[callId] = call;

         */
        //}
        return call;
    }

    /**
     * @private
     * @category Telephony CALL
     * @instance
     * @param callId
     * @description
     *      GET A CALL FROM CACHE <br>
     */
    private getCallFromCache(callId: string): Call {
        let that = this;
        let callFound = null;
        that._logger.log("internal", LOG_ID + "(getCallFromCache) search id : ", callId);
        if (!callId) return callFound;
        let iter = 0;
        if (that._calls) {
            let callFoundindex = that._calls.findIndex((call) => {
                iter++;
                if (!call) {
                    // Warning : do not uncomment these line because when an error happens for a big number it is stored in that._calls at the indice of the called number
                    // So the size of the tab is egal this big number. And then freeze the SDK when iter the tab.
                    //this._logger.log("error", LOG_ID + "(getCallFromCache) !!! A call is undefined in the cache.");
                    //this._logger.log("internalerror", LOG_ID + "(getCallFromCache) !!! A call is undefined in the cache : ", call);
                } else {
                    return call.id === callId;
                }
            });
            that._logger.log("internal", LOG_ID + "(getCallFromCache) that._calls findIndex iter : ", iter);
            if (callFoundindex != -1) {
                that._logger.log("internal", LOG_ID + "(getCallFromCache) call found : ", that._calls[callFoundindex], " with id : ", callId);
                return that._calls[callFoundindex];
            }
        }
        that._logger.log("internal", LOG_ID + "(getCallFromCache) call found : ", callFound, " with id : ", callId);
        return callFound ;
    }

    public addOrUpdateCallToCache(call: any): Call {
        let callObj : Call = Call.CallFactory()(call);
        let callFoundindex = this._calls.findIndex((callIter) => {
            return callIter.id === call.id;
        });
        if (callFoundindex != -1) {
            this._logger.log("internal", LOG_ID + "(addOrUpdateCallToCache) update in cache with call : ", call, ", at callFoundindex : ", callFoundindex);
            //this._channels.splice(callFoundindex,1,callObj);
            //channelCached = callObj;
            this._logger.log("internal", LOG_ID + "(addOrUpdateCallToCache) in update this.calls : ", this._calls);
            this._calls[callFoundindex].updateCall(call);
            callObj = this._calls[callFoundindex];
        } else {
            this._logger.log("internal", LOG_ID + "(addOrUpdateCallToCache) add in cache callObj : ", callObj);
            this._calls.push(callObj);
        }
        return callObj;
    }

    private removeCallFromCache(callId: string): Promise<Call> {
        let that = this;
        this._logger.log("debug", LOG_ID + "(removeCallFromCache) should remove callId : ", callId);
        return new Promise((resolve, reject) => {
            // Get the channel to remove
            let callToRemove = this.getCallFromCache(callId);
            if (callToRemove) {
                // Remove from channels
                let callIdToRemove = callToRemove.id;

                this._logger.log("internal", LOG_ID + "(removeCallFromCache) remove from cache callIdToRemove : ", callIdToRemove);
                this._calls = this._calls.filter(function (call) {
                    return !(call.id === callIdToRemove);
                });

                resolve(callToRemove);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method logon
     * @async
     * @category Telephony CALL
     * @instance
     * @param {String} endpointTel The endpoint device phone number.
     * @param {String} agentId optionnel CCD Agent identifier (agent device number).
     * @param {String} password optionnel Password or authorization code.
     * @param {String} groupId optionnel CCD Agent's group number
     * @description
     *      This api allows an CCD Agent to logon into the CCD system. <br>
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    logon(endpointTel, agentId, password, groupId) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (!endpointTel) {
                that._logger.log("warn", LOG_ID + "(logon) bad or empty 'endpointTel' parameter");
                that._logger.log("internalerror", LOG_ID + "(logon) bad or empty 'endpointTel' parameter", endpointTel);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            that._rest.logon(endpointTel, agentId, password, groupId).then(
                    function success() {
                        resolve(undefined);
                    },
                    function failure(response) {
                        let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                        that._logger.log("error", LOG_ID + "(logon) Error.");
                        that._logger.log("internalerror", LOG_ID + "(logon) Error : ", error);
                        return reject(error);
                    });
        });
    }

    /**
     * @public
     * @nodered true
     * @method logoff
     * @async
     * @category Telephony CALL
     * @instance
     * @param {String} endpointTel The endpoint device phone number.
     * @param {String} agentId optionnel CCD Agent identifier (agent device number).
     * @param {String} password optionnel Password or authorization code.
     * @param {String} groupId optionnel CCD Agent's group number
     * @description
     *      This api allows an CCD Agent logoff logon from the CCD system. <br>
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    logoff(endpointTel, agentId, password, groupId) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (!endpointTel) {
                that._logger.log("warn", LOG_ID + "(logoff) bad or empty 'endpointTel' parameter");
                that._logger.log("internalerror", LOG_ID + "(logoff) bad or empty 'endpointTel' parameter", endpointTel);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            that._rest.logoff(endpointTel, agentId, password, groupId).then(
                    function success() {
                        resolve(undefined);
                    },
                    function failure(response) {
                        let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                        that._logger.log("error", LOG_ID + "(logoff) Error.");
                        that._logger.log("internalerror", LOG_ID + "(logoff) Error : ", error);
                        return reject(error);
                    });
        });
    }

    /**
     * @public
     * @nodered true
     * @method withdrawal
     * @async
     * @category Telephony CALL
     * @instance
     * @param {String} agentId optionnel CCD Agent identifier (agent device number).
     * @param {String} groupId optionnel CCD Agent's group number
     * @param {String} status optionnel Used to deactivate the withdrawal state. Values: 'on', 'off'; 'on' is optional.
     * @description
     *      This api allows an CCD Agent to change to the state 'Not Ready' on the CCD system. When the parameter 'status' is passed and has the value 'off', the state is changed to 'Ready' <br>
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    withdrawal(agentId, groupId, status) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (!agentId) {
                that._logger.log("warn", LOG_ID + "(withdrawal) bad or empty 'agentId' parameter");
                that._logger.log("internalerror", LOG_ID + "(withdrawal) bad or empty 'agentId' parameter", agentId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            if (!groupId) {
                that._logger.log("warn", LOG_ID + "(withdrawal) bad or empty 'groupId' parameter");
                that._logger.log("internalerror", LOG_ID + "(withdrawal) bad or empty 'groupId' parameter", groupId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            that._rest.withdrawal(agentId, groupId, status).then(
                    function success() {
                        resolve(undefined);
                    },
                    function failure(response) {
                        let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                        that._logger.log("error", LOG_ID + "(withdrawal) Error.");
                        that._logger.log("internalerror", LOG_ID + "(withdrawal) Error : ", error);
                        return reject(error);
                    });
        });
    }

    /**
     * @public
     * @nodered true
     * @method wrapup
     * @async
     * @category Telephony CALL
     * @instance
     * @param {String} agentId CCD Agent identifier (agent device number).
     * @param {String} groupId CCD Agent's group number
     * @param {String} password optionnel Password or authorization code.
     * @param {String} status optionnel Used to deactivate the WrapUp state. Values: 'on', 'off'; 'on' is optional.
     * @description
     *      This api allows an CCD Agent to change to the state Working After Call in the CCD system. When the parameter 'status' is passed and has the value 'off', the state is changed to 'Ready'. <br>
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    wrapup(agentId, groupId, password, status) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (!agentId) {
                that._logger.log("warn", LOG_ID + "(wrapup) bad or empty 'agentId' parameter");
                that._logger.log("internalerror", LOG_ID + "(wrapup) bad or empty 'agentId' parameter", agentId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            if (!agentId) {
                that._logger.log("warn", LOG_ID + "(wrapup) bad or empty 'agentId' parameter");
                that._logger.log("internalerror", LOG_ID + "(wrapup) bad or empty 'agentId' parameter", agentId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            that._rest.wrapup(agentId, groupId, password, status).then(
                    function success() {
                        resolve(undefined);
                    },
                    function failure(response) {
                        let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                        that._logger.log("error", LOG_ID + "(wrapup) Error.");
                        that._logger.log("internalerror", LOG_ID + "(wrapup) Error : ", error);
                        return reject(error);
                    });
        });
    }



    /*
        login(endpointTel, agentId, password, groupId) {
        let that = this;
        return that.restTelephony.login(that.getRequestHeader(), endpointTel, agentId, password, groupId);
    }

    logoff(endpointTel, agentId, password, groupId) {
        let that = this;
        return that.restTelephony.logoff(that.getRequestHeader(), endpointTel, agentId, password, groupId);
    }

    withdrawal(agentId, groupId, status) {
        let that = this;
        return that.restTelephony.withdrawal(that.getRequestHeader(), agentId, groupId, status);
    }

    wrapup( agentId, password, groupId, status) {
        let that = this;
        return that.restTelephony.wrapup(that.getRequestHeader(), agentId, password, groupId, status);
    }

     */

    //endregion Telephony CALL

    //region Telephony NOMADIC

    /*************************************************************/
    /* NOMADIC CALL STUFF               		                 */
    /*************************************************************/

    async nomadicLogin (phoneNumber, NotTakeIntoAccount?) {
        let that = this;
        return new Promise(function(resolve, reject) {

            //reject not allowed operations
            if (!that.isNomadicEnabled || !that.nomadicObject.featureActivated) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("NOT_ALLOWED", "nomadicLogin failure - Not Allowed");
                // @ts-ignore
                profileError.status = profileError.errorDetailsCode = "403";
                // @ts-ignore
                that._logger.log("error", LOG_ID + "(nomadicLogin) Error." );
                that._logger.log("internalerror", LOG_ID + "(nomadicLogin) Error : " + profileError.msg);
                return reject(profileError);
            }

            if (that._contacts.userContact.phonePro === phoneNumber || that._contacts.userContact.phoneProCan === phoneNumber || that._contacts.userContact.phonePbx === phoneNumber) {
                let errorMessage = "nomadicLogin failure: impossible to use its own phone number like nomadic phone";
                that._logger.log("error", LOG_ID + "(nomadicLogin) Error." );
                that._logger.log("internalerror", LOG_ID + "(nomadicLogin) Error : ", errorMessage);
                return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));
            }

            that._logger.log("internal", LOG_ID + "(nomadicLogin) phoneNumber : " + phoneNumber);
            NotTakeIntoAccount = NotTakeIntoAccount || false;
            that.nomadicAnswerNotTakedIntoAccount = NotTakeIntoAccount;

            that._contacts.getOrCreateContact(null, phoneNumber)
                .then(function(contact) {
                    let phoneInfo = that.getPhoneInfo(contact, phoneNumber, undefined);
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
                            that._logger.log("debug", LOG_ID + "(nomadicLogin) nomadicLogin success");
                            //service.isMakeCallInitiatorIsMain = false;
                            resolve("success");
                        },
                        function failure(response) {
                            let errorMessage = "nomadicLogin failure, nomadicDevice: " + response.message;
                            that._logger.log("error", LOG_ID + "(nomadicLogin) Error.");
                            that._logger.log("internalerror", LOG_ID + "(nomadicLogin) Error : " + errorMessage);
                            return reject(ErrorManager.getErrorManager().OTHERERROR(errorMessage, errorMessage));

                        });
                });
        });
    };
/*
    nomadicLoginOnOfficePhone () {
        return $q(function(resolve, reject) {

            //reject not allowed operations
            if (!service.isNomadicEnabled || !service.nomadicObject.featureActivated) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("nomadicLoginOnOfficePhone failure - Not Allowed");
                profileError.status = profileError.errorDetailsCode = "403";
                $log.error("(nomadicLoginOnOfficePhone) " + profileError.message);
                reject(profileError);
            }

            $log.info("(nomadicLoginOnOfficePhone) nomadicLoginOnOfficePhone");

            $http({
                method: "PUT",
                url: service.portalURL + "nomadic/login",
                headers: authService.getRequestHeader()
            }).then(
                function success() {
                    //service.cancelForward();
                    // TODO: subscribe somehow to ON_NOMADIC_EVENT is order to know that foward is applied
                    $log.info("(nomadicLoginOnOfficePhone) nomadicLoginOnOfficePhone success");
                    //service.isMakeCallInitiatorIsMain = true;
                    resolve(undefined);
                },
                function failure(response) {
                    let error = errorHelperService.handleError(response);
                    reject(error);
                    $log.error("(nomadicLoginOnOfficePhone) " + errorHelperService.getErrorFullMessage(response, "nomadicDevice"));
                });
        });
    };

    nomadicLogout () {
        let that = this;
        return new Promise(function(resolve, reject) {

            //reject not allowed operations
            if (!that.isNomadicEnabled || !that.nomadicObject.featureActivated) {
                let profileError = ErrorManager.getErrorManager().OTHERERROR("nomadicLogout failure - Not Allowed");
                profileError.status = profileError.errorDetailsCode = "403";
                $log.error("(nomadicLogout) " + profileError.message);
                reject(profileError);
            }

            $log.info("(nomadicLogout) nomadicLogout");

            $http({
                method: "PUT",
                url: service.portalURL + "nomadic/logout",
                headers: authService.getRequestHeader()
            }).then(
                function success() {
                    //service.cancelForward();
                    // TODO: subscribe somehow to ON_NOMADIC_EVENT is order to know that foward is applied
                    $log.info("(nomadicLogout) nomadicLogout success");
                    //service.isMakeCallInitiatorIsMain = true;
                    resolve(undefined);
                },
                function failure(response) {
                    let error = errorHelperService.handleError(response);
                    reject(error);
                    $log.error("(nomadicLogout) " + errorHelperService.getErrorFullMessage(response, "nomadicDevice"));
                });
        });
    };
// */
    /**
     * @public
     * @nodered true
     * @method getNomadicStatus
     * @async
     * @category Telephony NOMADIC
     * @instance
     * @description
     *      This api allows to get the nomadic status. <br>
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    async getNomadicStatus () {
        let that = this;
        return new Promise(function(resolve, reject) {

            //reject not allowed operations
            if (!that.isNomadicEnabled) {
                let error = ErrorManager.getErrorManager().CUSTOMERROR("403", "getNomadicStatus failure - Not Allowed", "getNomadicStatus failure - Not Allowed", undefined);// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(getNomadicStatus) Error.");
                that._logger.log("internalerror", LOG_ID + "(getNomadicStatus) Error : ", error);
                return reject(error);
            }

            if (that._contacts.userContact && that._contacts.userContact.phonePbx) {
                that._rest.getNomadicStatus().then(
                    function success(response) {
                        that._logger.log("debug", LOG_ID + "(getNomadicStatus) nomadicStatus success");
                        that.updateNomadicData(response);
                        resolve(undefined);
                    },
                    function failure(response) {
                        let error = ErrorManager.getErrorManager().CUSTOMERROR(response.code, response.msg, response.details, response);// errorHelperService.handleError(response);
                        that._logger.log("error", LOG_ID + "(getNomadicStatus) Error");
                        that._logger.log("internalerror", LOG_ID + "(getNomadicStatus) Error : ", error);
                        return reject(error);
                    });
            } else {
                //let error = ErrorManager.getErrorManager().ERROR();// errorHelperService.handleError(response);
                let error = ErrorManager.getErrorManager().OTHERERROR("ERROR", "(getNomadicStatus) user logged in pbx info not filled!");
                //error.msg += "(getNomadicStatus) user logged in pbx info not filled!";
                that._logger.log("error", LOG_ID + "(getNomadicStatus) user logged in pbx info not filled!");
                that._logger.log("internalerror", LOG_ID + "(getNomadicStatus) user logged in pbx info not filled! Error : ", error);
                return reject(error);
            }
        });
    };
/*
    service.setNomadicState = function() {
        return $q(function(resolve, reject) {

            $log.info("(setNomadicState) setNomadicState");

            $http({
                method: "PUT",
                url: service.portalURL + "nomadic/state",
                headers: authService.getRequestHeader(),
                data: {
                    makeCallInitiatorIsMain: "true"
                }
            }).then(
                function success() {
                    $log.info(" setNomadicState success");
                    resolve(undefined);
                },
                function failure(response) {
                    let error = errorHelperService.handleError(response);
                    reject(error);
                    $log.error(" " + errorHelperService.getErrorFullMessage(response, "setNomadicState"));
                });
        });
    };
*/
    /**
     * @private
      * @param response
     */
   async updateNomadicData (response) {
       let that = this;
       that._logger.log("internal", LOG_ID + "(updateNomadicData) destination:" + response.destination + " featureActivated:" + response.featureActivated + " makeCallInitiatorIsMain:" + response.makeCallInitiatorIsMain + " modeActivated:" + response.modeActivated);

        that.nomadicObject.featureActivated = response.featureActivated === "true";
        that.nomadicObject.modeActivated = response.modeActivated === "true";
        that.nomadicObject.destination = response.destination;
        that.nomadicObject.makeCallInitiatorIsMain = response.makeCallInitiatorIsMain === "true";

        if (!that.nomadicAnswerNotTakedIntoAccount) {
            //$rootScope.$broadcast("ON_CALL_NOMADIC_EVENT", service.nomadicObject);
            //that._logger.log("internal", LOG_ID + "(updateNomadicData) send evt_internal_nomadicstatusevent ", that.nomadicObject);
            that._eventEmitter.emit("evt_internal_nomadicstatusevent", that.nomadicObject);
        }
        that.nomadicAnswerNotTakedIntoAccount = false;

        // By default if mobilepro or mobileperso exist, then add it on destination
        /*if (service.nomadicObject.featureActivated && (service.nomadicObject.destination === "" || service.nomadicObject.destination === undefined) && (contactService.userContact.mobileProCan || contactService.userContact.mobilePerso)) {
            let defaultNumber = contactService.userContact.mobileProCan ? contactService.userContact.mobileProCan : contactService.userContact.mobilePerso;
            service.nomadicLogin(defaultNumber)
                .then(function() {
                    service.nomadicLoginOnOfficePhone();
                });
        }*/

        // By default, in monodevice, if mobilepro or mobileperso exist, then add it on destination
        if (that._contacts.userContact.isVirtualTerm && that.nomadicObject.featureActivated && (that.nomadicObject.destination === "" || that.nomadicObject.destination === undefined) && (that._contacts.userContact.mobileProCan || that._contacts.userContact.mobilePerso)) {
            let defaultNumber = that._contacts.userContact.mobileProCan ? that._contacts.userContact.mobileProCan : that._contacts.userContact.mobilePerso;
            await that.nomadicLogin(defaultNumber);
        }
    }

    getNomadicObject() {
        return this.nomadicObject;
    }

    getNomadicDestination() {
        return this.nomadicObject.destination;
    }

    //endregion Telephony NOMADIC

    // region Telephony Voice Messages

    /**
     * @public
     * @nodered true
     * @method deleteAllMyVoiceMessagesFromPbx
     * @async
     * @category Telephony Voice Messages
     * @instance
     * @description
     *      This api allows to Delete all user's present (read and unread) voice messages from the Pbx. <br>
     *      This command is to be used to remove all read and unread messages for one user, on the pbx side, it has no effect on the file storage side. <br>
     *      Do not use this API command to delete the voice messages file from the file storage. <br>
     *
     *  return :
     *
     *  | Champ | Type | Description |
     *  | --- | --- | --- |
     *  | status | String |     |
     *
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    deleteAllMyVoiceMessagesFromPbx () {
        // DELETE /api/rainbow/telephony/v1.0/voicemessages/all
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_all_user's_messages_delete
        let that = this;
        return that._rest.deleteAllMyVoiceMessagesFromPbx();
    }

    /**
     * @public
     * @nodered true
     * @method deleteAVoiceMessageFromPbx
     * @async
     * @category Telephony Voice Messages
     * @instance
     * @param {string} messageId The message Id
     * @description
     *      This api allows to Delete a voice message from the Pbx, using it's unique identifier (messageId), which is the one given in the messages list. <br>
     *      This command is to be used to remove the message on the pbx side; it has no effect on the file storage side. <br>
     *      Do not use this API command to delete the voice message file from the file storage. <br>
     * 
     *  return :
     *          
     *  | Champ | Type | Description |
     *  | --- | --- | --- |
     *  | status | String |     |
     *  
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    deleteAVoiceMessageFromPbx (messageId : string) {
        // DELETE /api/rainbow/telephony/v1.0/voicemessages/:messageId
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_message_delete
        let that = this;
        return that._rest.deleteAVoiceMessageFromPbx(messageId);
    }

    /**
     * @public
     * @nodered true
     * @method getAVoiceMessageFromPbx
     * @async
     * @category Telephony Voice Messages
     * @instance
     * @param {string} messageId The message Id
     * @param {string} messageDate The date in ISO 8601 format, used form : YYYY-MM-DDTHH:MM:SSTZ
     * @param {string} messageFrom The message sender phone number (can an external number in E164 form or an internal short).
     * @description
     *      This api allows to Get a voice message from the Pbx, using it's unique identifier (messageId), which is the one given in the messages list. <br>
     *      But, in order to build a proper file name, we also need the message's creation date (ISO 8601) and the distant user's phone number. <br>
     *      Initialy all voice messages are stored in the pbx, therefore they have to be transfered to Rainbow server before being given to the asking client. <br>
     *      The positive acknowledged of this request only signifies that the pbx has accepted the download request. The client will be informed further once the message is available on file storage server. In the case the file transfer should fail, the client will also be informed.. <br>
     *
     *  parameters: <br>
     *   * messageDate : mandatory, date in ISO 8601 format, used form : YYYY-MM-DDTHH:MM:SSTZ. <br>
     *   * messageFrom : the message sender phone number (can an external number in E164 form or an internal short). <br>
     *
     *  return :
     *
     *  | Champ | Type | Description |
     *  | --- | --- | --- |
     *  | status | String |     |
     *  | resultCode | String | Pbx result code |
     *
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    getAVoiceMessageFromPbx (messageId : string, messageDate : string, messageFrom : string) {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_message_read 
        // GET /api/rainbow/telephony/v1.0/voicemessages/:messageId
        let that = this;
        return that._rest.getAVoiceMessageFromPbx( messageId , messageDate, messageFrom);
    }

    /**
     * @public
     * @nodered true
     * @method getDetailedListOfVoiceMessages
     * @async
     * @category Telephony Voice Messages
     * @instance
     * @description
     *      This api allows to Get the detailed list of all available voice messages. <br>
     *      For a user, which has a voice mail box, it is possible to get the detailed list of it's messages. <br>
     *      A voice message can be : <br>
     *   * a message recorded by a calling party which couldn't reach the user, <br>
     *   * a conversation recorded by the user itself. <br>
     *
     *  return :
     *
     *  | Champ | Type | Description |
     *  | --- | --- | --- |
     *  | status | String |     |
     *  | data | Object |     |
     *  | voicemessages | Object |     |
     *  | voiceMessageList | Object\[\] | Table of message descriptor. |
     *  | id  | String | Message unique id. |
     *  | unread | String | Message state, false for already read, true elsewhere. |
     *  | length | String | Message length is seconds. |
     *  | date | Date-Time | Message date in ISO 8601 (usual form : YYYY-MM-DDTHH:MM:SSTZ). |
     *  | from | String | Message sender's number. |
     *  | jid | String | Message sender's jid. |
     *  | callable | String | Message sender can be called back or not. |
     *  | identity | Object | Message sender names. |
     *  | displayName | String | Message sender's display name. |
     *  | firstName | String | Message sender's first name. |
     *  | lastName | String | Message sender's last name. |
     *
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    getDetailedListOfVoiceMessages () {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_messages_list 
        // GET /api/rainbow/telephony/v1.0/voicemessages
        let that = this;
        return that._rest.getDetailedListOfVoiceMessages();
    }

    /**
     * @public
     * @nodered true
     * @method getNumbersOfVoiceMessages
     * @async
     * @category Telephony Voice Messages
     * @instance
     * @description
     *      This api allows to Get voice messages counters, total and unlistened. <br>
     *      For a user, which has a voice mail box, it is possible to get the number of not yet listened message (aka unread messages). <br>
     *      When possible the total number of messages is also given. <br>
     *      Some VoiceMail units only gives if the users has or not one or more messages in his box, the number of them is unknown. <br>
     *
     *
     *  return :
     *
     *  | Champ | Type | Description |
     *  | --- | --- | --- |
     *  | status | String |     |
     *  | data | Object |     |
     *  | voicemessages | Object |     |
     *  | unread | Number | Number of unlistened messages |
     *  | total | Number | Total number of voice messages |
     *  | present optionnel | Boolean | Pbx doesn't know how much messages a user has, only that one or more are present |
     *          
     * @return {Promise} Return resolved promise if succeed, and a rejected else.
     */
    getNumbersOfVoiceMessages () {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_messages_counters
        // GET /api/rainbow/telephony/v1.0/voicemessages/counters
        let that = this;
        return that._rest.getNumbersOfVoiceMessages();
    }

    // endregion Telephony Voice Messages
    
}

module.exports.TelephonyService = TelephonyService;
export {TelephonyService as TelephonyService};
