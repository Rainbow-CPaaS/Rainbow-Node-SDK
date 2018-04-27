"use strict";

const ErrorCase = require("../common/Error");
//const Conversation = require("../common/models/Conversation");
//const Call = require("../common/models/Call");

const moment = require("moment");

const Deferred = require("../common/Utils").Deferred;
const Call = require("../common/models/Call");
const VoiceMail = require("../common/models/VoiceMail");

const PubSub = require("pubsub-js");
const TelephonyEventHandler = require("../connection/XMPPServiceHandler/telephonyEventHandler");

const LOG_ID = "TELEPHONY - ";

/**
 * @class
 * @beta
 * @name Conversations
 * @description
 *       This module manages conversations. A contact is defined by a set of public information (name, firstname, avatar...) and a set of private information.<br>
 *       Using this module, you can get access to your network contacts or search for Rainbow contacts.
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Get the network contacts (roster) <br>
 *      - Get and search contacts by Id, JID or loginEmail <br>
 */
class Telephony {

    constructor(_eventEmitter, _logger) {
        this._xmpp = null;
        this._rest = null;
        this._contacts = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
        this.calls = [];
        this.voiceMail = null;//VoiceMail.createVoiceMail();
        this.userJidTel = "TOBEFILLED";//authService.jidTel;

    }

    start(_xmpp, _rest, _contacts, _bubbles, _profiles) {
        let that = this;
        this.telephonyHandlerToken = [];
        this.telephonyHistoryHandlerToken = [];
        this._logger.log("debug", LOG_ID + "(start) _entering_");
        this.voiceMail = VoiceMail.createVoiceMail(_profiles);

        return new Promise((resolve, reject) => {
            try {
                that._xmpp = _xmpp;
                that._rest = _rest;
                that._contacts = _contacts;
                that._bubbles = _bubbles;
                that._profiles = _profiles;

                that._attachHandlers();

                this
                    ._logger
                    .log("debug", LOG_ID + "(start) _exiting_");
                resolve();

            } catch (err) {
                that
                    ._logger
                    .log("error", LOG_ID + "(start) _exiting_");
                reject();
            }
        });
    }

    stop() {
        let that = this;
        this
            ._logger
            .log("debug", LOG_ID + "(stop) _entering_");

        return new Promise((resolve, reject) => {
            try {
                that._xmpp = null;
                that._rest = null;

                delete that.telephonyEventHandler;
                that.telephonyEventHandler = null;
                that
                    .telephonyHandlerToken
                    .forEach((token) => PubSub.unsubscribe(token));
                that.telephonyHandlerToken = [];

                that
                    .telephonyHistoryHandlerToken
                    .forEach((token) => PubSub.unsubscribe(token));
                that.telephonyHistoryHandlerToken = [];

                that
                    ._logger
                    .log("debug", LOG_ID + "(stop) _exiting_");
                resolve();
            } catch (err) {
                that
                    ._logger
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
        ];
    }

    getOrCreateCall(status, connectionId, contact) {
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
            call = Call.create(status, null, Call.Type.PHONE, contact);
            call.setConnectionId(connectionId);
            that.calls[callId] = call;
        }
        return call;
    }

    /////////
    getVoiceMessageCounter() {
        let that = this;
        return new Promise((resolve, reject) => {

            //reject not allowed operations
            if (!that.voiceMailFeatureEnabled) {
                var profileError = new Error("getVoiceMessageCounter failure - Not Allowed");
                profileError.status = profileError.errorDetailsCode = "403";
                that._logger.log("error", LOG_ID + "(getVoiceMessageCounter) " + profileError.message);
                reject(profileError);
            }

            // Create the iq request
            //var iq = $iq({type: "get", to: that.userJidTel + "/phone"})
            //    .c("callservice", {xmlns: CALLSERVICE_NS})
            //    .c("messaging");

            that._xmpp.voiceMessageQuery(that.userJidTel).then(function (data) {
                console.error(data);
                resolve(data);
            })
                .catch(function (error) {
                    var errorMessage = "getVoiceMessageCounter failure : " + error.message;
                    that._logger.log("error", LOG_ID + "(getVoiceMessageCounter) " + errorMessage);
                    reject.reject(new Error(errorMessage));
                });

            /*
            // Send "get messaging" iq
            xmppService.sendIQ(iq)
                .then(function (data) {
                    console.error(data);
                    resolve();
                })
                .catch(function (error) {
                    var errorMessage = "getVoiceMessageCounter failure : " + error.message;
                    that._logger.log("error", LOG_ID + "(getVoiceMessageCounter) " + errorMessage);
                    reject.reject(new Error(errorMessage));
                });
            // */
        });
    }

    /*********************************************************/
    /**                   CALL HANDLERS                     **/

    /*********************************************************/
    getCallToHangOut() {
        let that = this;
        var calls = that.getCalls();
        if (!calls || calls.length === 0) {
            return null;
        }
        var callStatus = calls[0].status;
        if (calls.length === 1 || (callStatus === Call.Status.DIALING || callStatus === Call.Status.ACTIVE || callStatus === Call.Status.PUT_ON_HOLD)) {
            return calls[0];
        }
        return calls[1];
    }

    getActiveCall() {
        let that = this;
        var activeCall = null;
        Object.keys(that.calls || []).forEach(function (key) {
            var call = that.calls[key];
            if (call.status === Call.Status.ACTIVE) {
                activeCall = call;
            }
        });
        return activeCall;
    }

    getCalls() {
        let that = this;
        var calls = [];
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

    getActiveCallsForContact(contact) {
        let that = this;
        var calls = [];
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
    makeCall(contact, phoneNumber) {
        let that = this;
        var activeCall = that.getActiveCall();

        if (that.makingCall) {
            $log.warn("[telephonyService] makeCall failure - makeCall already making a call");
            return $q.reject();
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

    makeSimpleCall(contact, phoneNumber) {
        let that = this;
        return $q(function (resolve, reject) {
            $log.info("[telephonyService] makeSimpleCall to " + (contact ? contact.displayName : phoneNumber));

            //reject not allowed operations
            if (!that.isBasicCallAllowed) {
                var profileError = new Error("makeSimpleCall failure - Not Allowed");
                profileError.status = profileError.errorDetailsCode = "403";
                $log.error("[telephonyService] " + profileError.message);

                // Release makingCall flag
                that.makingCall = false;
                reject(profileError);
            }

            var phoneInfo = that.getPhoneInfo(contact, phoneNumber);
            $http({
                method: "POST",
                url: that.portalURL + "calls",
                headers: that.getRequestHeader(),
                data: {
                    calleeExtNumber: phoneInfo.longNumber,
                    calleeIntNumber: phoneInfo.internalNumber,
                    calleeShortNumber: phoneInfo.shortNumber,
                    calleePbxId: phoneInfo.pbxId,
                    calleeDisplayName: contact.displayName
                },
            }).then(
                function success(response) {
                    $log.info("[telephonyService] makeSimpleCall success : " + anonymizePhoneNumber(phoneNumber) + " Call (" + call + ")");
                    // Create the call object
                    var call = Call.create(Call.Status.DIALING, null, Call.Type.PHONE, contact);
                    call.setConnectionId(response.data.data.callId);
                    that.calls[call.id] = call;

                    // Release makinCall flag
                    that.makingCall = false;

                    // Indicate whether it is a call to own voicemail
                    call.setIsVm(phoneNumber === that.voicemailNumber);

                    // Send call update event
                    $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    resolve(call.id);
                },
                function failure(response) {
                    var call = Call.create(Call.Status.ERROR, null, Call.Type.PHONE, contact);
                    call.errorMessage = "invalidPhoneNumber";
                    that.calls[call.contact.id] = call;
                    call.autoClear = $interval(function () {
                        service.clearCall(call);
                    }, 5000, 1);

                    // Release makinCall flag
                    that.makingCall = false;

                    // Send call update event
                    $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    var error = errorHelperService.handleError(response);
                    reject(error);
                    $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "makeCall"));
                });
        });
    }

    makeConsultationCall(contact, phoneNumber, callId) {
        let that = this;
        return $q(function (resolve, reject) {

            //reject not allowed operations
            if (!that.isSecondCallAllowed) {
                var profileError = new Error("makeConsultationCall failure - Not Allowed");
                profileError.status = profileError.errorDetailsCode = "403";
                $log.error("[telephonyService] " + profileError.message);

                // Release makingCall flag
                that.makingCall = false;
                reject(profileError);
            }

            var phoneInfo = service.getPhoneInfo(contact, phoneNumber);
            $http({
                method: "POST",
                url: service.portalURL + "calls/" + encodeURIComponent(callId) + "/consultation",
                headers: authService.getRequestHeader(),
                data: {
                    calleeExtNumber: phoneInfo.longNumber,
                    calleeIntNumber: phoneInfo.internalNumber,
                    calleeShortNumber: phoneInfo.shortNumber,
                    calleePbxId: phoneInfo.pbxId,
                    calleeDisplayName: contact.displayName
                },
            }).then(
                function success(response) {
                    $log.info("[telephonyService] makeConsultationCall success : " + anonymizePhoneNumber(phoneNumber) + " Call (" + call + ")");
                    // Create the call object
                    var call = Call.create(Call.Status.DIALING, null, Call.Type.PHONE, contact);
                    call.setConnectionId(response.data.data.callId);
                    that.calls[call.id] = call;

                    // Release makinCall flag
                    that.makingCall = false;

                    // Indicate whether it is a call to own voicemail
                    call.setIsVm(phoneNumber === service.voicemailNumber);

                    // Send call update event
                    $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    resolve(call.id);
                },
                function failure(response) {
                    var call = Call.create(Call.Status.ERROR, null, Call.Type.PHONE, contact);
                    call.errorMessage = "invalidPhoneNumber";
                    that.calls[call.contact.id] = call;
                    call.autoClear = $interval(function () {
                        service.clearCall(call);
                    }, 5000, 1);

                    // Release makinCall flag
                    that.makingCall = false;

                    // Send call update event
                    $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                    var error = errorHelperService.handleError(response);
                    reject(error);
                    $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "makeConsultationCall"));
                });
        });
    }

    /**
     * MAKE CALL BY PHONE NUMBER
     * Used by SDK (public)
     * Warning when modifying this method
     */
    makeCallByPhoneNumber(phoneNumber) {
        let that = this;
        return $q(function (resolve, reject) {

            $log.info("[telephonyService] makeCallByPhoneNumber : " + anonymizePhoneNumber(phoneNumber));

            if (contactService.userContact.phonePro === phoneNumber || contactService.userContact.phoneProCan === phoneNumber || contactService.userContact.phonePbx === phoneNumber) {
                var errorMessage = "makeCallByPhoneNumber failure: impossible to call its own phone number";
                $log.error("[telephonyService] " + errorMessage);
                reject(new Error(errorMessage));
            }
            var myContact = null;
            contactService.getOrCreateContact(null, phoneNumber)
                .then(function (contact) {
                    myContact = contact;
                    return that.makeCall(contact, phoneNumber);
                })
                .then(function () {
                    resolve();
                })
                .catch(function (error) {
                    var _errorMessage = "makeCallByPhoneNumber failure " + (error ? error.message : "");
                    $log.error("[telephonyService] - callService - " + _errorMessage);

                    var call = Call.create(Call.Status.ERROR, null, Call.Type.PHONE, myContact);
                    call.errorMessage = "invalidPhoneNumber";
                    that.calls[call.contact.id] = call;
                    call.autoClear = $interval(function () {
                        service.clearCall(call);
                    }, 5000, 1);
                    $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);

                    reject(new Error(_errorMessage));
                });
        });
    }


    /* TO DO */

    /*		service.makeCallWithMobile = function(mobileRessource, phoneNumber) {

                var defer = $q.defer();

                if (contactService.userContact.mobilePro === phoneNumber || contactService.userContact.mobilePerso === phoneNumber) {
                    var errorMessage = "makeCallWithMobile failure: impossible to call its own mobile phone number";
                    $log.error("[telephonyService] " + errorMessage);
                    defer.reject(new Error(errorMessage));
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
                        $log.error("[telephonyService] - callService - " + errorMessageMobile);
                        defer.reject(new Error(errorMessageMobile));
                    });

                // Return the promise
                return defer.promise;
            };
    */

    getPhoneInfo(contact, phoneNumber) {
        let that = this;

        var longNumber = phoneNumber;
        var shortNumber = "";
        var internalNumber = "";//#29475
        var pbxId = "";
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

    getErrorMessage(data, actionLabel) {
        let that = this;
        var errorMessage = actionLabel + " failure : ";

        if (angular.element(data).attr("type") === "error") {

            var error = angular.element(data).find("error");
            if (error) {
                var errorType = error.attr("type");
                var errorCode = error.attr("code");
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

                $log.error("[telephonyService] " + errorMessage);

            }
            else {
                errorMessage += "Unknown error";
            }

            return errorMessage;
        }
        return null;
    }

    /*************************************************************/
    /*                    RELEASE CALL STUFF                     */

    /*************************************************************/

    /**
     * RELEASE CALL
     * Used by SDK (public)
     * Warning when modifying this method
     */
    releaseCall(call) {
        let that = this;
        return $q(function (resolve, reject) {
            $log.info("[telephonyService] releaseCall " + call.id);

            //reject not allowed operations
            if (!service.isBasicCallAllowed) {
                var profileError = new Error("releaseCall failure - Not Allowed");
                profileError.status = profileError.errorDetailsCode = "403";
                $log.error("[telephonyService] " + profileError.message);
                reject(profileError);
            }

            // Update the call status
//				call.setStatus(Call.Status.RELEASING); //#29721 Do not release before server response!
//				$rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);

            $http({
                method: "DELETE",
                url: service.portalURL + "calls/" + encodeURIComponent(call.connectionId),
                headers: authService.getRequestHeader()
            }).then(
                function success() {
                    // Update call status
                    call.setStatus(Call.Status.UNKNOWN);
                    call.startDate = null;
                    call.vm = false;
                    $log.info("[telephonyService] releaseCall " + call.id + " - success : ");

                    // Send call update event
                    $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);

                    // Clean the call array
                    // service.calls = []; //// MCO OULALALALA
                    delete service.calls[call.id];

                    resolve(call);
                },
                function failure(response) {
                    var error = errorHelperService.handleError(response);
                    reject(error);
                    $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "releaseCall"));
                });
        });
    }

    /*************************************************************/
    /*                     ANSWER CALL STUFF                     */

    /*************************************************************/

    /**
     * ANSWER CALL
     * Used by SDK (public)
     * Warning when modifying this method
     */
    answerCall(call) {
        let that = this;
        return $q(function (resolve, reject) {
            $log.info("[telephonyService] answerCall : " + anonymizePhoneNumber(call.contact.phone) + "(" + call.contact.displayNameForLog() + ")");

            // First hold the current active call
            var activeCall = service.getActiveCall();

            //reject not allowed operations
            if (!service.isBasicCallAllowed) {
                var profileError = new Error("answerCall failure - Not Allowed");
                profileError.status = profileError.errorDetailsCode = "403";
                $log.error("[telephonyService] " + profileError.message);
                reject(profileError);
            }

            if (call.status === Call.Status.QUEUED_INCOMMING && activeCall) {
                service.holdCall(activeCall)
                    .then(function () {
                        return service.answerCall(call);
                    })
                    .then(function (thecall) {
                        resolve(thecall);
                    })
                    .catch(function (error) {
                        var errorMessage = "answerCall failure : " + error.message;
                        $log.error("[telephonyService] - callService -  " + errorMessage);
                        reject(new Error(errorMessage));
                    });
            }
            else {
                $http({
                    method: "PUT",
                    url: service.portalURL + "calls/" + encodeURIComponent(call.connectionId) + "/answer",
                    headers: authService.getRequestHeader()
                }).then(
                    function success(response) {
                        // Update call status
                        call.setConnectionId(response.data.data.callId);
                        call.setStatus(Call.Status.ACTIVE);
                        $log.info("[telephonyService] answerCall success : " + anonymizePhoneNumber(call.contact.phone) + " Call (" + call + ")");

                        // Send call update event
                        $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
                        resolve(call);
                    },
                    function failure(response) {
                        var error = errorHelperService.handleError(response);
                        reject(error);
                        $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "answerCall"));
                    });
            }
        });
    }

    /*************************************************************/
    /*                      HOLD CALL STUFF                      */

    /*************************************************************/

    /**
     * HOLD CALL
     * Used by SDK (public)
     * Warning when modifying this method
     */
    holdCall(call) {
        let that = this;
        return $q(function (resolve, reject) {
            // Ignore call already hold
            if (!call || call.status === Call.Status.HOLD) {
                resolve(call);
            }

            //reject not allowed operations
            if (!service.isSecondCallAllowed) {
                var profileError = new Error("holdCall failure - Not Allowed");
                profileError.status = profileError.errorDetailsCode = "403";
                $log.error("[telephonyService] " + profileError.message);
                reject(profileError);
            }

            $http({
                method: "PUT",
                url: service.portalURL + "calls/" + encodeURIComponent(call.connectionId) + "/hold",
                headers: authService.getRequestHeader()
            }).then(
                function success(response) {
                    $log.info("[telephonyService] holdCall success : " + anonymizePhoneNumber(call.contact.phone) + " Call (" + call + ")");
                    // Update call status
                    call.setConnectionId(response.data.data.callId);
                    call.setStatus(Call.Status.HOLD);

                    // Send call update event
                    $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);

                    resolve(call);
                },
                function failure(response) {
                    var error = errorHelperService.handleError(response);
                    reject(error);
                    $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "holdCall"));
                });
        });
    }

    /*************************************************************/
    /*                     RETRIEVE CALL STUFF                     */

    /*************************************************************/

    /**
     * RETRIEVE
     * Used by SDK (public)
     * Warning when modifying this method
     */
    retrieveCall(call) {
        let that = this;
        return $q(function (resolve, reject) {
            $log.info("[telephonyService] retrieveCall : " + call.contact.displayNameForLog());

            //reject not allowed operations
            if (!service.isSecondCallAllowed) {
                var profileError = new Error("retrieveCall failure - Not Allowed");
                profileError.status = profileError.errorDetailsCode = "403";
                $log.error("[telephonyService] " + profileError.message);
                reject(profileError);
            }

            // First hold the current active call
            var activeCall = service.getActiveCall();

            if (activeCall) {
                service.holdCall(activeCall)
                    .then(function () {
                        return service.retrieveCall(call);
                    })
                    .then(function (thecall) {
                        resolve(thecall);
                    })
                    .catch(function (error) {
                        var errorMessage = "retrieveCall failure : " + error.message;
                        $log.error("[telephonyService] - callService -  " + errorMessage);
                        reject(new Error(errorMessage));
                    });
            }
            else {
                $http({
                    method: "PUT",
                    url: service.portalURL + "calls/" + encodeURIComponent(call.connectionId) + "/retrieve",
                    headers: authService.getRequestHeader()
                }).then(
                    function success(response) {
                        $log.info("[telephonyService] retrieveCall success : " + anonymizePhoneNumber(call.contact.phone) + " Call (" + call + ")");
                        // Update call status
                        call.setConnectionId(response.data.data.callId);
                        call.setStatus(Call.Status.ACTIVE);

                        // Send call update event
                        $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);

                        resolve();
                    },
                    function failure(response) {
                        var error = errorHelperService.handleError(response);
                        reject(error);
                        $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "retrieveCall"));
                    });
            }
        });
    }

    /*************************************************************/
    /*                     DEFLECT CALL STUFF                    */

    /*************************************************************/

    /**
     * DEFLECT TO VM
     * Used by SDK (public)
     * Warning when modifying this method
     */
    deflectCallToVM(call) {
        let that = this;
        return $q(function (resolve, reject) {
            // Ignore wrong request
            if (!call) {
                resolve(call);
            }

            //reject not allowed operations
            if (!service.isVMDeflectCallAllowed) {
                var profileError = new Error("deflectCall failure - Not Allowed");
                profileError.status = profileError.errorDetailsCode = "403";
                $log.error("[telephonyService] " + profileError.message);
                reject(profileError);
            }

            $log.info("[telephonyService] deflectCallToVM " + call.contact.displayNameForLog());

            $http({
                method: "PUT",
                url: service.portalURL + "calls/" + encodeURIComponent(call.connectionId) + "/deflect",
                headers: authService.getRequestHeader(),
                data: {
                    calleeExtNumber: "",
                    calleeIntNumber: service.voicemailNumber,
                    calleeShortNumber: service.voicemailNumber,
                    calleePbxId: service.pbxId
                }
            }).then(
                function success() {
                    $log.info("[telephonyService] deflectCall success");
                    resolve();
                },
                function failure(response) {
                    var error = errorHelperService.handleError(response);
                    reject(error);
                    $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "deflectCallToVM"));
                });
        });
    }

    /*************************************************************/
    /*                   TRANSFERT CALL STUFF                    */

    /*************************************************************/
    transfertCall(activeCall, heldCall) {
        let that = this;
        return $q(function (resolve, reject) {
            // Ignore wrong request
            if (!activeCall || !heldCall) {
                resolve();
            }

            //reject not allowed operations
            if (!service.isTransferAllowed) {
                var profileError = new Error("transferCall failure - Not Allowed");
                profileError.status = profileError.errorDetailsCode = "403";
                $log.error("[telephonyService] " + profileError.message);
                reject(profileError);
            }

            $log.info("[telephonyService] transfertCall held(" + heldCall.contact.displayName + ") to active(" + activeCall.contact.displayName + ")");

            $http({
                method: "PUT",
                url: service.portalURL + "calls/" + encodeURIComponent(activeCall.connectionId) + "/transfer/" + encodeURIComponent(heldCall.connectionId),
                headers: authService.getRequestHeader()
            }).then(
                function success() {
                    $log.info("[telephonyService] transferCall success");
                    resolve();
                },
                function failure(response) {
                    var error = errorHelperService.handleError(response);
                    reject(error);
                    $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "transfertCall"));
                });
        });
    }

    /*************************************************************/
    /* MAKE CONFERENCE CALL STUFF                                */

    /*************************************************************/
    conferenceCall(activeCall, heldCall) {
        let that = this;

        return $q(function (resolve, reject) {
            // Ignore wrong request
            if (!activeCall || !heldCall) {
                resolve();
            }

            //reject not allowed operations
            if (!service.isConferenceAllowed) {
                var profileError = new Error("conferenceCall failure - Not Allowed");
                profileError.status = profileError.errorDetailsCode = "403";
                $log.error("[telephonyService] " + profileError.message);
                reject(profileError);
            }

            $log.info("[telephonyService] conferenceCall " + activeCall.contact.displayName + " and " + heldCall.contact.displayName);

            $http({
                method: "PUT",
                url: service.portalURL + "calls/" + encodeURIComponent(activeCall.connectionId) + "/conference/" + encodeURIComponent(heldCall.connectionId),
                headers: authService.getRequestHeader()
            }).then(
                function success() {
                    $log.info("[telephonyService] conferenceCall success");
                    resolve();
                },
                function failure(response) {
                    var error = errorHelperService.handleError(response);
                    reject(error);
                    $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "conferenceCall"));
                });
        });
    }

    /*************************************************************/
    /* FORWARD CALL STUFF               		                 */

    /*************************************************************/

    forwardToDevice(phoneNumber) {
        let that = this;
        return $q(function (resolve, reject) {
            $log.info("[telephonyService] forwardToDevice : " + phoneNumber);

            if (contactService.userContact.phonePro === phoneNumber || contactService.userContact.phoneProCan === phoneNumber || contactService.userContact.phonePbx === phoneNumber) {
                var errorMessage = "forwardToDevice failure: impossible to forward its own phone number";
                $log.error("[telephonyService] " + errorMessage);
                reject(new Error(errorMessage));
            }
            contactService.getOrCreateContact(null, phoneNumber)
                .then(function (contact) {
                    var phoneInfo = service.getPhoneInfo(contact, phoneNumber);
                    $http({
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
                    }).then(
                        function success() {
                            // TODO: subscribe somehow to ON_CALL_FORWARDED_EVENT is order to know that foward is applied
                            resolve();
                        },
                        function failure(response) {
                            var error = errorHelperService.handleError(response);
                            reject(error);
                            $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "forwardToDevice"));
                        });
                });
        });
    }

    forwardToVoicemail() {
        let that = this;
        return $q(function (resolve, reject) {

            if (!service.voiceMailFeatureEnabled) {
                var profileError = new Error("forwardToVoicemail failure - voicemail feature not enabled");
                profileError.status = profileError.errorDetailsCode = "404";
                $log.error("[telephonyService] " + profileError.message);
                reject(profileError);
            }

            $http({
                method: "PUT",
                url: service.portalURL + "forward",
                headers: authService.getRequestHeader(),
                data: {
                    calleeExtNumber: "",
                    calleeIntNumber: service.voicemailNumber,
                    calleePbxId: service.pbxId
                }
            }).then(
                function success() {
                    // TODO: subscribe somehow to ON_CALL_FORWARDED_EVENT is order to know that foward is applied
                    resolve();
                },
                function failure(response) {
                    var error = errorHelperService.handleError(response);
                    reject(error);
                    $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "forwardToVoicemail"));
                });
        });
    }

    cancelForward() {
        let that = this;
        return $q(function (resolve, reject) {
            if (contactService.userContact.phonePbx) {
                $http({
                    method: "PUT",
                    url: service.portalURL + "forward",
                    headers: authService.getRequestHeader(),
                    data: {
                        calleeExtNumber: "",
                        calleeIntNumber: "CANCELFORWARD",
                        calleePbxId: service.pbxId
                    }
                }).then(
                    function success() {
                        $log.info("[telephonyService] cancelForward success");
                        resolve();
                    },
                    function failure(response) {
                        var error = errorHelperService.handleError(response);
                        reject(error);
                        $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "cancelForward"));
                    });
            }
            else {
                reject();
            }
        });
    }

    getForwardStatus() {
        let that = this;
        return $q(function (resolve, reject) {
            if (contactService.userContact && contactService.userContact.phonePbx) {
                $http({
                    method: "GET",
                    url: service.portalURL + "forward",
                    headers: authService.getRequestHeader()
                }).then(
                    function success() {
                        // Nothing much to do here, the real call forward status will arrive by XMPP (see ON_CALL_FORWARDED_EVENT)
                        resolve();
                    },
                    function failure(response) {
                        var error = errorHelperService.handleError(response);
                        reject(error);
                        $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "getForwardStatus"));
                    });
            }
            else {
                reject();
            }
        });
    }

    /*************************************************************/
    /* DTMF             		                 				*/

    /*************************************************************/
    sendDtmf(connectionId, dtmf) {
        let that = this;
        return $q(function (resolve, reject) {

            var callId = Call.getIdFromConnectionId(connectionId);
            var deviceId = Call.getDeviceIdFromConnectionId(connectionId);
            if (callId && deviceId && dtmf) {
                $http({
                    method: "PUT",
                    url: service.portalURL + "calls/" + callId + "%23" + deviceId + "/dtmf",
                    headers: authService.getRequestHeader(),
                    data: {
                        callId: connectionId,
                        dtmf: dtmf
                    }
                }).then(
                    function success() {
                        resolve();
                    },
                    function failure(response) {
                        var error = errorHelperService.handleError(response);
                        reject(error);
                        $log.error("[telephonyService] " + errorHelperService.getErrorFullMessage(response, "sendDtmf"));
                    });
            } else {
                reject();
            }
        });
    }

    clearCall(call) {
        let that = this;
        call.setStatus(Call.Status.UNKNOWN);
        // $rootScope.$broadcast("ON_CALL_UPDATED_EVENT", call);
        that._logger.log("debug", LOG_ID + "(clearCall) send rainbow_oncallupdated ", call);
        that._eventEmitter.emit("rainbow_oncallupdated", call);

        if (call.contact) {
            delete that.calls[call.contact.id];
        }
        if (call.getCurrentCalled()) {
            call.setCurrentCalled(null);
        }
    }

    startAsPhoneNumber(phoneNumber) {
        var cleanPhoneNumber = phoneNumber.trim().split(".").join("");
        var pattern1 = /^(\+|\d|#|\*|\(|\)|\.|-|\s|\/)*$/;
        var match = cleanPhoneNumber.match(pattern1);
        if (!match) {
            return false;
        }
        return (match[0] === cleanPhoneNumber);
    }


}

module.exports = Telephony;