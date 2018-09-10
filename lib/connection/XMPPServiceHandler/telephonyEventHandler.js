"use strict";

const XMPPUtils = require("../../common/XMPPUtils");
const Utils = require("../../common/Utils");
const GenericHandler = require("./genericHandler");
//const Conversation = require("../../common/models/Conversation");
const Call = require("../../common/models/Call");
const NameUpdatePrio = require("../../common/models/Contact").NameUpdatePrio;

const xml = require("@xmpp/xml");
const PromiseQueue = require("../../common/promiseQueue");


const config = require("../../config/config");

const LOG_ID = "XMPP/HNDL/TEL - ";

/*********************************************************************/
/** PRIVATE CONSTRUCTOR                                             **/
/*********************************************************************/
const CallFailureLabels = {
    "DESTNOTOBTAINABLE": "outOfService",
    "DONOTDISTURB": "dnd",
    "TRUNKSBUSY": "trunksbusy"
};

class TelephonyEventHandler extends GenericHandler {

    constructor(xmppService, telephonyService, contactService, profileService) {
        super(xmppService);

        let that = this;
        this.MESSAGE = "jabber:client.message";
        /*this.MESSAGE_GROUPCHAT = "jabber:client.message.groupchat";
        this.MESSAGE_WEBRTC = "jabber:client.message.webrtc";
        this.MESSAGE_MANAGEMENT = "jabber:client.message.management";
        this.MESSAGE_ERROR = "jabber:client.message.error";
        this.MESSAGE_HEADLINE = "jabber:client.message.headline";
        this.MESSAGE_CLOSE = "jabber:client.message.headline";
        */

        this.telephonyService = telephonyService;
        this.contactService = contactService;

        this.promiseQueue = PromiseQueue.createPromiseQueue(that.logger);

        this.onMessageReceived = (msg, stanza) => {
            that.logger.log("debug", LOG_ID + "(onMessageReceived) _entering_", msg, stanza);
            try {
                let stanzaElem = stanza;
                //let that = this;

                // Ignore "Offline" message
                let delay = stanzaElem.getChild("delay");
                if (delay && delay.text() === "Offline Storage") {
                    return true;
                }

                // Extract payload element
                let actionElm = stanzaElem.getChild("callservice");
                if (actionElm === undefined) {
                    return true;
                }
                let actionElem = actionElm.children[0];
                //let tagNames = actionElem.prop("tagName").split(":");
                //let actionElemName = tagNames[tagNames.length - 1].toLowerCase();
                let actionElemName = actionElem.name.toLowerCase();
                that.logger.log("debug", LOG_ID + "(onMessageReceived) " + that.logger.colors.debug("-- event -- " + actionElemName));


                // Handle the event
                switch (actionElemName) {
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
                        // */
                    default:
                        break;
                }
                // */
                return true;
            }
            catch
                (error) {
                that.logger.log("error", LOG_ID + "(onMessageReceived) -- failure -- " + error.message);
                //return true;
            }

            that.logger.log("debug", LOG_ID + "(onMessageReceived) _exiting_");
            return true;
        };

        /*********************************************************************/
        /** ORIGINATED CALL STUFF                                           **/
        /*********************************************************************/
        this.onOriginatedEvent = function (originatedElem) {
            that.logger.log("debug", LOG_ID + "(onOriginatedEvent) _entering_", originatedElem);
            return this.getCall(originatedElem)
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
                        return Promise.resolve();
                    }
                    catch (error) {
                        var errorMessage = "onOriginatedEvent -- " + error.message;
                        that.logger.log("error", LOG_ID + "(onOriginatedEvent) Catch Error !!! " + errorMessage);
                        return Promise.reject(new Error(errorMessage));
                    }
                });
                // */
        };


        /*********************************************************************/
        /** DELIVERED STUFF                                                 **/
        /*********************************************************************/
        this.onDeliveredEvent = function (deliveredElem) {
            that.logger.log("debug", LOG_ID + "(onDeliveredEvent) _entering_", deliveredElem);
            //let that = this;
            return this.getCall(deliveredElem).then(function (call) {
                try {
                    if (call.status === Call.Status.QUEUED_INCOMMING) {
                        return Promise.resolve();
                    }

                    var type = deliveredElem.attr("type");
                    var jid = deliveredElem.attr("endpointIm");
                    var phoneNumber = deliveredElem.attr("endpointTel");

                    // Update call info
                    call.setStatus((type === "outgoing") ? Call.Status.RINGING_OUTGOING : Call.Status.RINGING_INCOMMING);
                    call.startDate = null;
                    call.vm = false;

                    // Update contact info if necessary
                    return that.updateCallContact(jid, phoneNumber, "delivered", call);
                }
                catch (error) {
                    var errorMessage = "onDeliveredEvent -- " + error.message;
                    that.logger.log("error", LOG_ID + "(onDeliveredEvent) Catch Error !!! " + errorMessage);
                    return Promise.reject(new Error(errorMessage));
                }
            }); // */
        };


        /*********************************************************************/
        /** ESTABLISHED STUFF                                               **/
        /*********************************************************************/
        this.onEstablishedEvent = function (establishedElem) {
            that.logger.log("debug", LOG_ID + "(onEstablishedEvent) _entering_", establishedElem);
            //let that = this;
            return this.getCall(establishedElem).then(function (call) {
                try {
                    var jid = establishedElem.attr("endpointIm");
                    var phoneNumber = establishedElem.attr("endpointTel");

                    // Call already exists and IS NOT a conference, update contact info if necessary
                    if (call.contact && call.contact._id) {
                        call.setStatus(Call.Status.ACTIVE);

                        // Update contact info as necessary
                        return that.updateCallContact(jid, phoneNumber, "established", call);
                    }

                    // Call already exists and IS a conference, update contact info if necessary
                    else if (call.participants && call.participants.length > 0) {
                        //recover former matching contact from participants
                        var contactRecovered = null;
                        for (var i = 0; (i < call.participants.length && !contactRecovered); i++) {
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
                        var currentCalled = call.getCurrentCalled();
                        if (contactRecovered) {
                            call.setContact(contactRecovered);
                            call.setStatus(Call.Status.ACTIVE);
                            currentCalled = {contactPhoneNumber: phoneNumber, contact: contactRecovered};
                            call.setCurrentCalled(currentCalled);
                            that.logger.log("debug", LOG_ID + "(onEstablishedEvent) send rainbow_oncallupdated ", call);
                            that.eventEmitter.emit("rainbow_oncallupdated", call);
                            //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                        }
                        else { // no matching contact strange but go ahead ...
                            if (!jid && !phoneNumber) {
                                phoneNumber = "****";
                            }
                            return contactService.getOrCreateContact(jid, phoneNumber)
                                .then(function (contact) {
                                    call.setContact(contact);
                                    call.setStatus(Call.Status.ACTIVE);
                                    currentCalled = {contactPhoneNumber: phoneNumber, contact: contact};
                                    call.setCurrentCalled(currentCalled);
//                                    $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                                    that.logger.log("debug", LOG_ID + "(onEstablishedEvent) send rainbow_oncallupdated ", call);
                                    that.eventEmitter.emit("rainbow_oncallupdated", call);

                                    return Promise.resolve();
                                });
                        }
                    }
                    return Promise.resolve();
                }
                catch (error) {
                    var errorMessage = "onEstablishedEvent -- " + error.message;
                    that.logger.log("error", LOG_ID + "(onEstablishedEvent) Catch Error!!! " + errorMessage);
                    return Promise.reject(new Error(errorMessage));
                }
            }); // */
        };

        /*********************************************************************/
        /** RETRIEVE CALL STUFF                                             **/
        /*********************************************************************/
        this.onRetrieveCallEvent = function (retrieveElem) {
            that.logger.log("debug", LOG_ID + "(onRetrieveCallEvent) _entering_", retrieveElem);
             return this.getCall(retrieveElem).then(function (call) {
                call.setStatus(Call.Status.ACTIVE);
                 that.logger.log("debug", LOG_ID + "(onRetrieveCallEvent) send rainbow_oncallupdated ", call);
                 that.eventEmitter.emit("rainbow_oncallupdated", call);
                 //    $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
            });
            // */
        };

        /*********************************************************************/
        /** CLEAR CALL STUFF                                                **/
        /*********************************************************************/
        this.onClearCallEvent = function (clearElem) {
            that.logger.log("debug", LOG_ID + "(onClearCallEvent) _entering_", clearElem);
            //let that = this;
            return this.getCall(clearElem).then(function (call) {
                if (call.status !== Call.Status.ERROR) {
                    call.setStatus(Call.Status.UNKNOWN);
                    that.telephonyService.clearCall(call);
                    that.logger.log("debug", LOG_ID + "(onClearCallEvent) send rainbow_oncallupdated ", call);
                    that.eventEmitter.emit("rainbow_oncallupdated", call);

                    //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                }
            }); // */
        };

        /*********************************************************************/
        /** HOLD CALL STUFF                                                 **/
        /*********************************************************************/
        this.onHeldEvent = function (heldElem) {
            that.logger.log("debug", LOG_ID + "(onHeldEvent) _entering_", heldElem);
            return this.getCall(heldElem).then(function (call) {
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
                    that.logger.log("debug", LOG_ID + "(onHeldEvent) send rainbow_oncallupdated ", call);
                    that.eventEmitter.emit("rainbow_oncallupdated", call);

                    return Promise.resolve();
                }
                catch (error) {
                    let errorMessage = "onHeldEvent -- " + error.message;
                    that.logger.log("error", LOG_ID + "(onHeldEvent) Catch Error!!! " + errorMessage);
                    return Promise.reject(new Error(errorMessage));
                }
            }); // */
        };

        /*********************************************************************/
        /** QUEUED STUFF                                                    **/
        /*********************************************************************/
        this.onQueuedEvent = function (queuedElem) {
            that.logger.log("debug", LOG_ID + "(onQueuedEvent) _entering_", queuedElem);
            //var that = this;
            let cause = queuedElem.attr("cause");

            if (cause === "PARK") {
                that.logger.log("warn", LOG_ID + "(onQueuedEvent) - ignore PARK cause");
                return Promise.resolve();
            }
            if (cause === "NEWCALL") {
                that.logger.log("warn", LOG_ID + "(onQueuedEvent) - ignore NEWCALL cause");
                return Promise.resolve();
            }

            return this.getCall(queuedElem).then(function (call) {
                try {
                    let type = queuedElem.attr("type");
                    let jid = queuedElem.attr("endpointIm");
                    let phoneNumber = queuedElem.attr("endpointTel");

                    let status = (type === "outgoing") ? Call.Status.QUEUED_OUTGOING : Call.Status.QUEUED_INCOMMING;
                    call.setStatus(status);
                    call.startDate = null;
                    call.vm = false;

                    // Update contact info if necessary
                    return that.updateCallContact(jid, phoneNumber, "queued", call);
                }
                catch (error) {
                    var errorMessage = "onQueuedEvent -- " + error.message;
                    that.logger.log("error", LOG_ID + "(onHeldEvent) Catch Error!!! " + errorMessage);
                    return Promise.reject(new Error(errorMessage));
                }
            });
            // */
        };

        /*********************************************************************/
        /** DIVERTED STUFF                                                  **/
        /*********************************************************************/
        this.onDivertedEvent = function (divertedElem) {
            that.logger.log("debug", LOG_ID + "(onDivertedEvent) _entering_", divertedElem);
            let oldConnectionId = divertedElem.attr("oldCallId");
            let oldCallId = Call.getIdFromConnectionId(oldConnectionId);
            let call = this.telephonyService.calls[oldCallId];
            if (!call) {
                that.logger.log("warn", LOG_ID + "(onDivertedEvent) - receive divertedEvent on unknown call --- ignored");
                return Promise.resolve();
            }
            this.telephonyService.clearCall(call);
//            $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
            that.logger.log("debug", LOG_ID + "(onDivertedEvent) send rainbow_oncallupdated ", call);
            that.eventEmitter.emit("rainbow_oncallupdated", call);

            return Promise.resolve();
            // */
        };


        /*********************************************************************/
        /** TRANSFER STUFF                                                  **/
        /*********************************************************************/
        this.onTransferEvent = function (transferElem) {
            that.logger.log("debug", LOG_ID + "(onTransferEvent) _entering_", transferElem);
            // var that = this;
            // Extract transfert call parameters
            let activeConnectionId = transferElem.attr("activeCallId");
            let heldConnectionId = transferElem.attr("heldCallId");
            let newConnectionId = transferElem.attr("newCallId");

            // Get active call
            let activeCallId = Call.getIdFromConnectionId(activeConnectionId);
            let activeCall = this.telephonyService.calls[activeCallId];

            if (heldConnectionId) {
                // Get the held call
                let heldCallId = Call.getIdFromConnectionId(heldConnectionId);
                let heldCall = this.telephonyService.calls[heldCallId];

                // Release both calls (active and held)
                heldCall.setStatus(Call.Status.UNKNOWN);
                activeCall.setStatus(Call.Status.UNKNOWN);
                that.logger.log("debug", LOG_ID + "(onTransferEvent) send rainbow_oncallupdated ", heldCall);
                that.eventEmitter.emit("rainbow_oncallupdated", heldCall);
                that.logger.log("debug", LOG_ID + "(onTransferEvent) send rainbow_oncallupdated ", activeCall);
                that.eventEmitter.emit("rainbow_oncallupdated", activeCall);

                // $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", heldCall);
                // $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", activeCall);
            }

            if (newConnectionId) {
                var jid = transferElem.attr("newEndpointIm");
                var phoneNumber = transferElem.attr("newEndpointTel");
                var deviceState = transferElem.attr("deviceState");
                if (!deviceState) {
                    deviceState = transferElem.attr("deviceStatus");
                } // TO BE REMOVED

                // Release current call
                activeCall.setStatus(Call.Status.UNKNOWN);
                //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", activeCall);
                that.logger.log("debug", LOG_ID + "(onTransferEvent) send rainbow_oncallupdated ", activeCall);
                that.eventEmitter.emit("rainbow_oncallupdated", activeCall);
                if (!jid && !phoneNumber) {//secret identity
                    phoneNumber = "****";
                }
                return this.getOrCreateCall(newConnectionId, jid, phoneNumber)
                    .then(function (newCall) {
                        if (deviceState && deviceState === "LCI_ALERTING") {
                            newCall.setStatus(Call.Status.RINGING_INCOMMING);
                        }
                        else {
                            newCall.setStatus(Call.Status.ACTIVE);
                        }
                        // Update contact info if necessary
                        return that.updateCallContact(jid, phoneNumber, "transfercall", newCall);
                    });
            } else {
                return Promise.resolve();
            }
            // */
        };


        /*********************************************************************/
        /** CONFERENCE STUFF                                                **/
        /*********************************************************************/
        this.onConferenceEvent = function (conferencedElem) {
            that.logger.log("debug", LOG_ID + "(onConferenceEvent) _entering_", conferencedElem);
/*
            // Store context
            //var that = this;

            // Get connectionsIds
            var primaryOldConnectionId = conferencedElem.getChild("primaryOldCallId").text();
            var secondaryOldConnectionId = conferencedElem.getChild("secondaryOldCallId").text();
            var newConnectionId = conferencedElem.getChild("newCallId").text();

            // Extract callIds
            var primaryOldCallId = Call.getIdFromConnectionId(primaryOldConnectionId);
            var secondaryOldCallId = Call.getIdFromConnectionId(secondaryOldConnectionId);

            // Get current calls
            var primaryOldCall = this.telephonyService.calls[primaryOldCallId];
            var secondaryOldCall = this.telephonyService.calls[secondaryOldCallId];

            // Prepare participant promises
            var confParticipants = [];
            var participantPromises = [];
            var confParticipantsPhoneNumbers = [];

            conferencedElem.getChild("participant").each(function () {
                var participantElem = angular.element(this);
                var endpointTel = participantElem.find("endpointTel").text();
                var endpointIm = participantElem.find("endpointIm").text();

                if (!(endpointIm && contactService.isUserContactJid(endpointIm))) {
                    participantPromises.push($q(function (resolve, reject) {
                        if (!endpointIm && !endpointTel) {
                            endpointTel = "****";
                        }
                        //if no endpointIm try to extract contact info from primary or secondary calls
                        if (!endpointIm && primaryOldCall && primaryOldCall.contact &&
                            primaryOldCall.currentCalled.contactPhoneNumber === endpointTel) {
                            confParticipants.push(primaryOldCall.contact);
                            confParticipantsPhoneNumbers.push(endpointTel);
                            resolve();
                        }
                        else if (!endpointIm && secondaryOldCall && secondaryOldCall.contact &&
                            secondaryOldCall.currentCalled.contactPhoneNumber === endpointTel) {
                            confParticipants.push(secondaryOldCall.contact);
                            confParticipantsPhoneNumbers.push(endpointTel);
                            resolve();
                        }
                        else {
                            contactService.getOrCreateContact(endpointIm, endpointTel)
                                .then(function (contact) {
                                    //manage Outlook Call Party identification
                                    var centralizedService = $injector.get("centralizedService");
                                    centralizedService.outlook.updateContactFromOutlookInfos(contact, endpointTel)
                                        .then(
                                            function successCallback(updateStatus) {
                                                if (updateStatus) {
                                                    $log.debug("[TelephonyServiceEventHandler] on conferenced, update from outlook for contact :" + contact.displayNameMD5);
                                                    //that.makeUpdateContact(call, contact, phoneNumber, actionElemName);
                                                } else {
                                                    $log.debug("[TelephonyServiceEventHandler] on conferenced, no update from outlook for contact :" + contact.displayNameMD5);
                                                }
                                            },
                                            function errorCallback() {
                                                $log.debug("[TelephonyServiceEventHandler] on conferenced, no Outlook search available");
                                            }
                                        )
                                        .finally(function () {
                                            confParticipants.push(contact);
                                            confParticipantsPhoneNumbers.push(endpointTel);
                                            resolve();
                                        });
                                })
                                .catch(function (error) {
                                    $log.error("[TelephonyServiceEventHandler] onConferenceEvent - Impossible to get contact - " + error.message);
                                    reject();
                                });
                        }
                    }));
                }
            });

            // Get participants asynchronously
            return $q.all(participantPromises)
                .then(function () {
                    // Release previous calls
                    if (primaryOldCall) {
                        primaryOldCall.setStatus(Call.Status.UNKNOWN);
                        $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", primaryOldCall);
                    }
                    if (secondaryOldCall) {
                        secondaryOldCall.setStatus(Call.Status.UNKNOWN);
                        $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", secondaryOldCall);
                    }
                    // Create the new conference call
                    var newConferenceCall = that.createConferenceCall(newConnectionId, confParticipants);
                    //update currentcalled structure
                    var currentCalled = newConferenceCall.getCurrentCalled();
                    currentCalled.participants = confParticipants;
                    currentCalled.participantsPhoneNumbers = confParticipantsPhoneNumbers;
                    newConferenceCall.setCurrentCalled(currentCalled);
                    newConferenceCall.setStatus(Call.Status.ACTIVE);
                    $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", newConferenceCall);
                });
             // */
        };

        /*********************************************************************/
        /** VOICE MESSAGE STUFF                                            **/
        /*********************************************************************/
        this.onVoiceMessageEvent = function (messagingElem) {
            that.logger.log("debug", LOG_ID + "(onVoiceMessageEvent) _entering_", messagingElem);

                        // Ignore forbidden requests
                        if (!profileService.isFeatureEnabled(profileService.FeaturesEnum.TELEPHONY_VOICE_MAIL)) {
                            that.logger.log("debug", LOG_ID + "(onVoiceMessageEvent) feature not enabled => IGNORED event");
                            return Promise.resolve();
                        }

                        // Look for a voiceMessageCounter child
                        var voiceMessageCounterValue = messagingElem.getChild("voiceMessageCounter").text();
                        if (voiceMessageCounterValue) {
                            var ct = Number(voiceMessageCounterValue);
                            if (Number.isInteger(ct) && (ct >= 0)) {
                                this.telephonyService.voiceMail.setVMCounter(ct);
                                this.telephonyService.voiceMail.setVMFlag((ct > 0));
                                this.telephonyService.voiceMail.setInfoMsg("");
                                //$rootScope.$broadcast("ON_VOICE_MESSAGE_UPDATE_EVENT", ct);
                                that.logger.log("debug", LOG_ID + "(onVoiceMessageEvent) send rainbow_onvoicemessageupdated ", ct);
                                that.eventEmitter.emit("rainbow_onvoicemessageupdated", ct);

                            }
                        }

                        // No voiceMessageCounter child look for voiceMessageWaiting child
                        var voiceMessageWaitingValue = messagingElem.find("voiceMessageWaiting").text();
                        if (voiceMessageWaitingValue === "changed") {
                            return this.telephonyService.getVoiceMessageCounter();
                        }

                        return Promise.resolve();
                        // */
        };

        /*********************************************************************/
        /** UPDATECALL STUFF                                                **/
        /*********************************************************************/
        this.onUpDateCallEvent = function (updatecallElem) {
            that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) _entering_", updatecallElem);

                        return this.getCall(updatecallElem).then(function (call) {

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
                                if (!profileService.isFeatureEnabled(profileService.FeaturesEnum.TELEPHONY_PHONE_BOOK)) {
                                    that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) xnames not allowed for the user profile => IGNORED event");
                                    return Promise.resolve();
                                }
                            }
                            //find Xnames from directories
                            if (identityLastName && identityLastName.length) {
                                lastName = identityLastName;
                                if (identityFirstName && identityFirstName.length) {
                                    firstName = identityFirstName;
                                }
                                that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) received for call " + call.id + " for phoneNumber:" + Utils.anonymizePhoneNumber(phoneNumber) +
                                    " with name : " + firstName.slice(0, 1) + "***");
                            } else {
                                if (identityDisplayName && identityDisplayName.length && identityDisplayName !== phoneNumber) {
                                    lastName = identityDisplayName; //Workaround last resort, only displayName is available, hack is to use it as lastName
                                    that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) only displayName available");
                                } else {
                                    that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) xnames not available => IGNORED event");
                                    return Promise.resolve();
                                }
                            }
                            //debug+
                            //if (!call.currentCalled.contactPhoneNumber || call.currentCalled.contactPhoneNumber === "") {
                              //  $log.debug("[TelephonyServiceEventHandler] onUpDateCallEvent  call.currentCalled.contactPhoneNumber EMPTY !!!");
                              //  $log.debug("[TelephonyServiceEventHandler] for call " + call.id + " conf = " + call.isConference);
                            //}
                            //debug-
                            // update contact as necessary
                            return contactService.getOrCreateContact(jid, phoneNumber)
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
                                                that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) xnames updated for " + phoneNumber + "with contact : " + contact.displayNameMD5);
                                            }
                                        } else if (call.participants && call.participants.length > 0) {
                                            let currentCalled = call.getCurrentCalled();
                                            for (var i = 0; i < call.participants.length; i++) {
                                                if (call.participants[i].temp) {
                                                    if (call.participants[i].phoneProCan && call.participants[i].phoneProCan === phoneNumber) {//concerned participant
                                                        that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) temp participant " +
                                                            call.participants[i].displayNameMD5 + " updated with : " + contact.displayNameMD5);
                                                        call.participants[i] = contact;
                                                        call.participants[i].setNameUpdatePrio(NameUpdatePrio.SERVER_UPDATE_PRIO);//flag as server prio
                                                        currentCalled.participantsPhoneNumbers[i] = phoneNumber;
                                                        currentCalled.participants[i] = contact;
                                                        contactUpdateDone = true;
                                                    }
                                                }
                                                else {//former participant is a rainbow user I don't know what to do !!!???
                                                    that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) STRANGE former participant was a rainbow: " + call.participants[i].displayNameMD5);
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
                                                that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) call update with rainbow contact : " + contact.displayNameMD5);
                                            }
                                        } else if (call.participants && call.participants.length > 0) {
                                            let currentCalled = call.getCurrentCalled();
                                            for (let i = 0; i < call.participants.length; i++) {
                                                if (call.participants[i].temp) {
                                                    if (call.participants[i].phoneProCan && call.participants[i].phoneProCan === phoneNumber) {//concerned participant
                                                        that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) temp participant " +
                                                            call.participants[i].displayNameMD5 + " updated with : " + contact.displayNameMD5);
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
                                                        that.logger.log("debug", LOG_ID + "(onUpDateCallEvent)rainbow participant " +
                                                            call.participants[i].displayNameMD5 + " updated with the same : " + contact.displayNameMD5);
                                                    }
                                                    else {//not the  good participant nothing to do
                                                        that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) other participant not updated : " +
                                                            call.participants[i].displayNameMD5 + " vs " + contact.displayNameMD5);
                                                    }
                                                }
                                            }
                                            call.setCurrentCalled(currentCalled);
                                        }
                                    }

                                    if (contactUpdateDone) {
                                        that.logger.log("debug", LOG_ID + "(onUpDateCallEvent) send rainbow_oncallupdated ", call);
                                        that.eventEmitter.emit("rainbow_oncallupdated", call);

                                        /*//CR #28178 : workaround : delay event to avoid notification RBNotification mess !!
                                        // with telescoping with incoming call popup
                                        $interval(function () {
                                            $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                                        }, 300, 1);
                                        // */
                                    }
                                    else {
                                        that.logger.log("debug", LOG_ID + "(onUpDateCallEvent), no update needed for call : " + call.id);
                                    }
                                });
                        });
                        // */
        };

        /*********************************************************************/
        /** FAILURE STUFF                                                   **/
        /*********************************************************************/
        this.onFailCallEvent = function (failedElem) {
            that.logger.log("debug", LOG_ID + "(onFailCallEvent) _entering_", failedElem);
            let cause = failedElem.attr("cause");
            //var that = this;
            return this.getCall(failedElem).then(function (call) {
                call.setStatus(Call.Status.ERROR);
                call.errorMessage = CallFailureLabels[cause];
                //call.autoClear = $interval(function () {
                    that.telephonyService.clearCall(call);
                //}, 5000, 1);
                if (!call.errorMessage) {
                    call.errorMessage = cause;
                }
                that.logger.log("debug", LOG_ID + "(onFailCallEvent) send rainbow_oncallupdated ", call);
                that.eventEmitter.emit("rainbow_oncallupdated", call);

                //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
            });
            // */
        };

        /*********************************************************************/
        /** FORWARD CALL STUFF                                              **/
        /*********************************************************************/
        this.onCallForwardedEvent = function (forwardElem) {
            that.logger.log("debug", LOG_ID + "(onCallForwardedEvent) _entering_", forwardElem);
            let call = {
                "forwardType": forwardElem.attr("forwardType"),
                "forwardTo": forwardElem.attr("forwardTo")
            };
            that.logger.log("debug", LOG_ID + "(onFailCallEvent) send rainbow_oncallforwarded ", call);
            that.eventEmitter.emit("rainbow_oncallforwarded", call);
            return Promise.resolve();
            /* $rootScope.$broadcast("ON_CALL_FORWARDED_EVENT", {
                 "forwardType": forwardElem.attr("forwardType"),
                 "forwardTo": forwardElem.attr("forwardTo")
             });
             return $q.when();
             // */
        };


        /*********************************************************************/
        /** PRIVATE UTILITY METHODS                                         **/
        /*********************************************************************/
        this.getCall = function (elem) {
            let jid = elem.attr("endpointIm");
            let phoneNumber = elem.attr("endpointTel");
            let connectionId = elem.attr("callId");
            if (!connectionId) {
                connectionId = elem.attr("heldCallId");
            } // TODO: WHY and WHEN
            that.logger.log("debug", LOG_ID + "(getCall)  - " + jid + " - " + Utils.anonymizePhoneNumber(phoneNumber) + " - " + connectionId);
            return this.getOrCreateCall(connectionId, jid, phoneNumber);
        };

        this.getOrCreateCall = function (connectionId, jid, phoneNumber) {
           // var that = this;
            let callId = Call.getIdFromConnectionId(connectionId);
            let call = this.telephonyService.calls[callId];
            if (call) {
                return Promise.resolve(call);
            }
            return new Promise(function (resolve) {
                if (jid || phoneNumber) {
                    that.contactService.getOrCreateContact(jid, phoneNumber)
                        .then(function (contact) {
                            resolve(that.telephonyService.getOrCreateCall(Call.Status.UNKNOWN, connectionId, contact));
                        });
                }
                else {
                    resolve(that.telephonyService.getOrCreateCall(Call.Status.UNKNOWN, connectionId));
                }
            });
            // */
        };

        this.createConferenceCall = function (connectionId, participants) {
            /*
            // Create and configure the conference call
            var conferenceCall = Call.create(Call.Status.UNKNOWN, null, Call.Type.PHONE);
            conferenceCall.setConnectionId(connectionId);
            conferenceCall.isConference = true;
            conferenceCall.setParticipants(participants);
            this.telephonyService.calls[conferenceCall.id] = conferenceCall;
            return conferenceCall;
            // */
        };
    }

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
        var that = this;

        try {
            // Determine if the contact has to be updated from event information
            var updateAnalyse = that.analyzeContactChange(jid, phoneNumber, call);
            // Whatever the contact change, for simple call, after analyse, update at least the call current phoneNumber
            if (!call.isConference && phoneNumber !== "") {
                call.setCurrentCalledContactNumber(phoneNumber);
            }
            if (updateAnalyse) {
                return that.contactService.getOrCreateContact(jid, phoneNumber)
                    .then(function (contact) {
                        that.logger.log("debug", LOG_ID + "(updateCallContact)  on " + actionElemName + ", update contact :" + contact.displayNameMD5);
                            that.makeUpdateContact(call, contact, phoneNumber, actionElemName);
                            return Promise.resolve();
                    });
            } else {
                that.logger.log("debug", LOG_ID + "(updateCallContact) send rainbow_oncallupdated ", call);
                that.eventEmitter.emit("rainbow_oncallupdated", call);
                //$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                return Promise.resolve();
            }
        }
        catch (error) {
            var errorMessage = "updateCallContact -- " + error.message;
            that.logger.log("error", LOG_ID + "(updateCallContact) Catch Error !!! " + errorMessage);
            return Promise.reject(new Error(errorMessage));
        }
    }

    makeUpdateContact (call, contact, phoneNumber, actionElemName) {
        let that = this;
        call.setContact(contact);
        let currentCalled = {contactPhoneNumber: phoneNumber, contact: contact};
        call.setCurrentCalled(currentCalled);

        that.logger.log("debug", LOG_ID + "(makeUpdateContact) send rainbow_oncallupdated ", call);
        that.eventEmitter.emit("rainbow_oncallupdated", call);


       /* if (actionElemName === "delivered" && call.status === Call.Status.RINGING_INCOMMING) {
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

module.exports = TelephonyEventHandler;