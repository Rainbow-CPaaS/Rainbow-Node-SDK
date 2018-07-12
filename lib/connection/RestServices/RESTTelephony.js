'use strict'

const ErrorCase = require('../../common/Error');
const util = require('util');
const LOG_ID = "REST/TEL - ";

class RESTService {

    constructor(evtEmitter, logger) {
        let that = this;
        that.evtEmitter = evtEmitter;
        that.logger = logger;

    }

    start(http) {
        let that = this;
        that.http = http;

    }

    makeCall(requestHeader, contact, phoneInfo) {
        var that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(makeCall) _entering_");
            let data = {
                //data: {
                calleeExtNumber: phoneInfo.longNumber,
                calleeIntNumber: phoneInfo.internalNumber,
                calleeShortNumber: phoneInfo.shortNumber,
                calleePbxId: phoneInfo.pbxId,
                calleeDisplayName: contact.displayName
                //}
            };


            that.http.post("/api/rainbow/telephony/v1.0/calls", requestHeader, data).then((json) => {
                that.logger.log("info", LOG_ID + "(makeCall) successfull");
                that.logger.log("info", LOG_ID + "(makeCall) REST conversation created", json.data);
                that.logger.log("debug", LOG_ID + "(makeCall) _exiting_");
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(makeCall) error", err);
                that.logger.log("debug", LOG_ID + "(makeCall) _exiting_");
                reject(err);
            });
        });
    }

    releaseCall(requestHeader, call) {
        var that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(releasecall) _entering_");
            if (call.connectionId) {
                let data = encodeURIComponent(call.connectionId);


                that.http.delete("/api/rainbow/telephony/v1.0/calls/" + data, requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(releasecall) successfull");
                    that.logger.log("info", LOG_ID + "(releasecall) REST conversation released", json.data);
                    that.logger.log("debug", LOG_ID + "(releasecall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(releasecall) error", err);
                    that.logger.log("debug", LOG_ID + "(releasecall) _exiting_");
                    reject(err);
                });
            } else {
                var error = ErrorCase.OTHERERROR('can not release call', 'no connectionId found in call ', util.inspect(call));// errorHelperService.handleError(response);
                reject(error);
                that._logger.log("error", LOG_ID + "(releaseCall) ", error);
            }
        });
    }

    makeConsultationCall(requestHeader, callId, contact, phoneInfo) {
        var that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(makeConsultationCall) _entering_");
            if (callId) {
                let data = {
                    calleeExtNumber: phoneInfo.longNumber,
                    calleeIntNumber: phoneInfo.internalNumber,
                    calleeShortNumber: phoneInfo.shortNumber,
                    calleePbxId: phoneInfo.pbxId,
                    calleeDisplayName: contact.displayName
                };

                that.http.post("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(callId) + '/consultation', requestHeader, data).then((json) => {
                    that.logger.log("info", LOG_ID + "(makeConsultationCall) successfull");
                    that.logger.log("info", LOG_ID + "(makeConsultationCall) REST conversation consulted", json.data);
                    that.logger.log("debug", LOG_ID + "(makeConsultationCall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(makeConsultationCall) error", err);
                    that.logger.log("debug", LOG_ID + "(makeConsultationCall) _exiting_");
                    reject(err);
                });
            } else {
                var error = ErrorCase.OTHERERROR('can not makeConsultationCall call', 'makeConsultationCall for callId ' + callId);// errorHelperService.handleError(response);
                reject(error);
                that._logger.log("error", LOG_ID + "(makeConsultationCall) ", error);
            }
        });
    }

    answerCall(requestHeader, call) {
        var that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(answerCall) _entering_");
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/answer', requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(answerCall) successfull");
                    that.logger.log("info", LOG_ID + "(answerCall) REST conversation consulted", json.data);
                    that.logger.log("debug", LOG_ID + "(answerCall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(answerCall) error", err);
                    that.logger.log("debug", LOG_ID + "(answerCall) _exiting_");
                    reject(err);
                });
            } else {
                var error = ErrorCase.OTHERERROR('can not answerCall call', 'answerCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                reject(error);
                that._logger.log("error", LOG_ID + "(answerCall) ", error);
            }
        });
    }

    holdCall(requestHeader, call) {
        var that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(holdCall) _entering_");
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/hold', requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(holdCall) successfull");
                    that.logger.log("info", LOG_ID + "(holdCall) REST conversation consulted", json.data);
                    that.logger.log("debug", LOG_ID + "(holdCall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(holdCall) error", err);
                    that.logger.log("debug", LOG_ID + "(holdCall) _exiting_");
                    reject(err);
                });
            } else {
                var error = ErrorCase.OTHERERROR('can not holdCall call', 'holdCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                reject(error);
                that._logger.log("error", LOG_ID + "(answerCall) ", error);
            }
        });
    }

    retrieveCall(requestHeader, call) {
        var that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(retrieveCall) _entering_");
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/retrieve', requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(retrieveCall) successfull");
                    that.logger.log("info", LOG_ID + "(retrieveCall) REST conversation consulted", json.data);
                    that.logger.log("debug", LOG_ID + "(retrieveCall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(retrieveCall) error", err);
                    that.logger.log("debug", LOG_ID + "(retrieveCall) _exiting_");
                    reject(err);
                });
            } else {
                var error = ErrorCase.OTHERERROR('can not retrieveCall call', 'retrieveCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                reject(error);
                that._logger.log("error", LOG_ID + "(retrieveCall) ", error);
            }
        });
    }

    deflectCallToVM(requestHeader, call, VMInfos) {
        var that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(deflectCallToVM) _entering_");
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/deflect', requestHeader, VMInfos).then((json) => {
                    that.logger.log("info", LOG_ID + "(deflectCallToVM) successfull");
                    that.logger.log("info", LOG_ID + "(deflectCallToVM) REST conversation consulted", json.data);
                    that.logger.log("debug", LOG_ID + "(deflectCallToVM) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(deflectCallToVM) error", err);
                    that.logger.log("debug", LOG_ID + "(deflectCallToVM) _exiting_");
                    reject(err);
                });
            } else {
                var error = ErrorCase.OTHERERROR('can not deflectCallToVM call', 'deflectCallToVM for call ' + util.inspect(call));// errorHelperService.handleError(response);
                reject(error);
                that._logger.log("error", LOG_ID + "(deflectCallToVM) ", error);
            }
        });
    }

    transfertCall(requestHeader, activeCall, heldCall) {
        var that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(transfertCall) _entering_");
            if (activeCall && heldCall) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(activeCall.connectionId) + '/transfer/' + encodeURIComponent(heldCall.connectionId), requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(transfertCall) successfull");
                    that.logger.log("info", LOG_ID + "(transfertCall) REST conversation consulted", json.data);
                    that.logger.log("debug", LOG_ID + "(transfertCall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(transfertCall) error", err);
                    that.logger.log("debug", LOG_ID + "(transfertCall) _exiting_");
                    reject(err);
                });
            } else {
                var error = ErrorCase.OTHERERROR('can not transfertCall call', 'transfertCall for call ' + util.inspect(activeCall) + util.inspect(heldCall) );// errorHelperService.handleError(response);
                reject(error);
                that._logger.log("error", LOG_ID + "(transfertCall) ", error);
            }
        });
    }

    conferenceCall(requestHeader, activeCall, heldCall) {
        var that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(conferenceCall) _entering_");
            if (activeCall && heldCall) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(activeCall.connectionId) + '/conference/' + encodeURIComponent(heldCall.connectionId), requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(conferenceCall) successfull");
                    that.logger.log("info", LOG_ID + "(conferenceCall) REST conversation consulted", json.data);
                    that.logger.log("debug", LOG_ID + "(conferenceCall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(conferenceCall) error", err);
                    that.logger.log("debug", LOG_ID + "(conferenceCall) _exiting_");
                    reject(err);
                });
            } else {
                var error = ErrorCase.OTHERERROR('can not conferenceCall call', 'conferenceCall for call ' + util.inspect(activeCall) + util.inspect(heldCall));// errorHelperService.handleError(response);
                reject(error);
                that._logger.log("error", LOG_ID + "(conferenceCall) ", error);
            }
        });
    }

    forwardToDevice (requestHeader, contact, phoneInfo) {
        var that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(forwardToDevice) _entering_");
                let data = {
                    calleeExtNumber: phoneInfo.longNumber,
                    calleeIntNumber: phoneInfo.internalNumber,
                    calleeShortNumber: phoneInfo.shortNumber,
                    calleePbxId: phoneInfo.pbxId,
                    calleeDisplayName: contact.displayName
                };

                that.http.post("/api/rainbow/telephony/v1.0/calls/forward", requestHeader, data).then((json) => {
                    that.logger.log("info", LOG_ID + "(forwardToDevice) successfull");
                    that.logger.log("info", LOG_ID + "(forwardToDevice) REST conversation consulted", json.data);
                    that.logger.log("debug", LOG_ID + "(forwardToDevice) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(forwardToDevice) error", err);
                    that.logger.log("debug", LOG_ID + "(forwardToDevice) _exiting_");
                    reject(err);
                });
        });
    }

    getForwardStatus(requestHeader) {
        var that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(getForwardStatus) _entering_");
            that.http.get("/api/rainbow/telephony/v1.0/calls/forward", requestHeader).then((json) => {
                that.logger.log("info", LOG_ID + "(getForwardStatus) successfull");
                that.logger.log("info", LOG_ID + "(getForwardStatus) REST conversation consulted", json.data);
                that.logger.log("debug", LOG_ID + "(getForwardStatus) _exiting_");
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(getForwardStatus) error", err);
                that.logger.log("debug", LOG_ID + "(getForwardStatus) _exiting_");
                reject(err);
            });
        });
    }

    sendDtmf(requestHeader, callId, deviceId, data) {
        var that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(sendDtmf) _entering_");
            that.http.post("/api/rainbow/telephony/v1.0/calls/" + callId + "%23" + deviceId + "/dtmf", requestHeader, data).then((json) => {
                that.logger.log("info", LOG_ID + "(sendDtmf) successfull");
                that.logger.log("info", LOG_ID + "(sendDtmf) REST conversation consulted", json.data);
                that.logger.log("debug", LOG_ID + "(sendDtmf) _exiting_");
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(sendDtmf) error", err);
                that.logger.log("debug", LOG_ID + "(sendDtmf) _exiting_");
                reject(err);
            });
        });
    }

}



let restService = null;

function getRESTService(evtEmitter, logger, http) {
    restService = restService ? restService : new RESTService(evtEmitter, logger, http);

    return restService;
}

module.exports.RESTService = getRESTService;