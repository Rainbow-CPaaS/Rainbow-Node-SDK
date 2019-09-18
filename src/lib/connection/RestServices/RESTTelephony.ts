'use strict';



const ErrorCase = require('../../common/ErrorManager');
const util = require('util');
const LOG_ID = "REST/TEL - ";

class RESTTelephony {
	public http: any;
	public logger: any;
	public _logger: any;
	public evtEmitter: any;

    constructor(evtEmitter, logger) {
        let that = this;
        that.evtEmitter = evtEmitter;
        that.logger = logger;

    }

    start(http) {
        return new Promise( (resolve)=> {
            let that = this;
            that.http = http;
            resolve();
        }) ;
    }

    makeCall(requestHeader, contact, phoneInfo) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(makeCall) _entering_");
            let data = {
                //data: {
                "calleeExtNumber": phoneInfo.longNumber,
                "calleeIntNumber": phoneInfo.internalNumber,
                "calleeShortNumber": phoneInfo.shortNumber,
                "calleePbxId": phoneInfo.pbxId,
                "calleeDisplayName": contact.displayName,
                "correlatorData":phoneInfo.correlatorData?phoneInfo.correlatorData:" "
                //}
            };


            that.http.post("/api/rainbow/telephony/v1.0/calls", requestHeader, data).then((json) => {
                that.logger.log("info", LOG_ID + "(makeCall) successfull");
                that.logger.log("info", LOG_ID + "(makeCall) REST conversation created");
                that.logger.log("internal", LOG_ID + "(makeCall) REST conversation created : ", json.data);
                that.logger.log("debug", LOG_ID + "(makeCall) _exiting_");
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(makeCall) error");
                that.logger.log("internalerror", LOG_ID, "(makeCall) error : ", err);
                that.logger.log("debug", LOG_ID + "(makeCall) _exiting_");
                reject(err);
            });
        });
    }

    releaseCall(requestHeader, call) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(releasecall) _entering_");
            if (call.connectionId) {
                let data = encodeURIComponent(call.connectionId);


                that.http.delete("/api/rainbow/telephony/v1.0/calls/" + data, requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(releasecall) successfull");
                    that.logger.log("info", LOG_ID + "(releasecall) REST conversation released");
                    that.logger.log("internal", LOG_ID + "(releasecall) REST conversation released : ", json.data);
                    that.logger.log("debug", LOG_ID + "(releasecall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(releasecall) error.");
                    that.logger.log("internalerror", LOG_ID, "(releasecall) error : ", err);
                    that.logger.log("debug", LOG_ID + "(releasecall) _exiting_");
                    reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not release call', 'no connectionId found in call ', util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(releaseCall) Catch Error !!! ");
                that._logger.log("internalerror", LOG_ID + "(releaseCall) Catch Error !!! Error : ", error);
                that.logger.log("debug", LOG_ID + "(releasecall) _exiting_");
                reject(error);
            }
        });
    }

    makeConsultationCall(requestHeader, callId, contact, phoneInfo) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(makeConsultationCall) _entering_");
            if (callId) {
                let data = {
                    "calleeExtNumber": phoneInfo.longNumber,
                    "calleeIntNumber": phoneInfo.internalNumber,
                    "calleeShortNumber": phoneInfo.shortNumber,
                    "calleePbxId": phoneInfo.pbxId,
                    "calleeDisplayName": contact.displayName,
                    "correlatorData":phoneInfo.correlatorData?phoneInfo.correlatorData:" "
                };

                that.http.post("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(callId) + '/consultation', requestHeader, data).then((json) => {
                    that.logger.log("info", LOG_ID + "(makeConsultationCall) successfull");
                    that.logger.log("info", LOG_ID + "(makeConsultationCall) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(makeConsultationCall) REST conversation consulted : ", json.data);
                    that.logger.log("debug", LOG_ID + "(makeConsultationCall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(makeConsultationCall) error");
                    that.logger.log("internalerror", LOG_ID, "(makeConsultationCall) error : ", err);
                    that.logger.log("debug", LOG_ID + "(makeConsultationCall) _exiting_");
                    reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not makeConsultationCall call', 'makeConsultationCall for callId ' + callId);// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(makeConsultationCall) ", error);
                that.logger.log("debug", LOG_ID + "(makeConsultationCall) _exiting_");
                reject(error);
            }
        });
    }

    answerCall(requestHeader, call) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(answerCall) _entering_");
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/answer', requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(answerCall) successfull");
                    that.logger.log("info", LOG_ID + "(answerCall) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(answerCall) REST conversation consulted : ", json.data);
                    that.logger.log("debug", LOG_ID + "(answerCall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(answerCall) error");
                    that.logger.log("internalerror", LOG_ID, "(answerCall) error : ", err);
                    that.logger.log("debug", LOG_ID + "(answerCall) _exiting_");
                    reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not answerCall call', 'answerCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(answerCall) ");
                that._logger.log("internalerror", LOG_ID + "(answerCall) : ", error);
                that.logger.log("debug", LOG_ID + "(answerCall) _exiting_");
                reject(error);
            }
        });
    }

    holdCall(requestHeader, call) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(holdCall) _entering_");
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/hold', requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(holdCall) successfull");
                    that.logger.log("info", LOG_ID + "(holdCall) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(holdCall) REST conversation consulted : ", json.data);
                    that.logger.log("debug", LOG_ID + "(holdCall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(holdCall) error");
                    that.logger.log("internalerror", LOG_ID, "(holdCall) error : ", err);
                    that.logger.log("debug", LOG_ID + "(holdCall) _exiting_");
                    reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not holdCall call', 'holdCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(answerCall) ");
                that._logger.log("internalerror", LOG_ID + "(answerCall) ", error);
                that.logger.log("debug", LOG_ID + "(holdCall) _exiting_");
                reject(error);
            }
        });
    }

    retrieveCall(requestHeader, call) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(retrieveCall) _entering_");
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/retrieve', requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(retrieveCall) successfull");
                    that.logger.log("info", LOG_ID + "(retrieveCall) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(retrieveCall) REST conversation consulted : ", json.data);
                    that.logger.log("debug", LOG_ID + "(retrieveCall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(retrieveCall) error");
                    that.logger.log("internal", LOG_ID, "(retrieveCall) error : ", err);
                    that.logger.log("debug", LOG_ID + "(retrieveCall) _exiting_");
                    reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not retrieveCall call', 'retrieveCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(retrieveCall) ");
                that._logger.log("internalerror", LOG_ID + "(retrieveCall) : ", error);
                that.logger.log("debug", LOG_ID + "(retrieveCall) _exiting_");
                reject(error);
            }
        });
    }

    deflectCallToVM(requestHeader, call, VMInfos) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(deflectCallToVM) _entering_");
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/deflect', requestHeader, VMInfos).then((json) => {
                    that.logger.log("info", LOG_ID + "(deflectCallToVM) successfull");
                    that.logger.log("info", LOG_ID + "(deflectCallToVM) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(deflectCallToVM) REST conversation consulted : ", json.data);
                    that.logger.log("debug", LOG_ID + "(deflectCallToVM) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(deflectCallToVM) error");
                    that.logger.log("internalerror", LOG_ID, "(deflectCallToVM) error : ", err);
                    that.logger.log("debug", LOG_ID + "(deflectCallToVM) _exiting_");
                    reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not deflectCallToVM call', 'deflectCallToVM for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(deflectCallToVM) ");
                that._logger.log("internalerror", LOG_ID + "(deflectCallToVM) : ", error);
                that.logger.log("debug", LOG_ID + "(deflectCallToVM) _exiting_");
                reject(error);
            }
        });
    }

    deflectCall(requestHeader, call, VMInfos) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(deflectCall) _entering_");
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/deflect', requestHeader, VMInfos).then((json) => {
                    that.logger.log("info", LOG_ID + "(deflectCall) successfull");
                    that.logger.log("info", LOG_ID + "(deflectCall) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(deflectCall) REST conversation consulted : ", json.data);
                    that.logger.log("debug", LOG_ID + "(deflectCall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(deflectCall) error");
                    that.logger.log("internalerror", LOG_ID, "(deflectCall) error : ", err);
                    that.logger.log("debug", LOG_ID + "(deflectCall) _exiting_");
                    reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not deflectCall call', 'deflectCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(deflectCall) ");
                that._logger.log("internalerror", LOG_ID + "(deflectCall) : ", error);
                that.logger.log("debug", LOG_ID + "(deflectCall) _exiting_");
                reject(error);
            }
        });
    }

    transfertCall(requestHeader, activeCall, heldCall) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(transfertCall) _entering_");
            if (activeCall && heldCall) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(activeCall.connectionId) + '/transfer/' + encodeURIComponent(heldCall.connectionId), requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(transfertCall) successfull");
                    that.logger.log("info", LOG_ID + "(transfertCall) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(transfertCall) REST conversation consulted : ", json.data);
                    that.logger.log("debug", LOG_ID + "(transfertCall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(transfertCall) error");
                    that.logger.log("internalerror", LOG_ID, "(transfertCall) error : ", err);
                    that.logger.log("debug", LOG_ID + "(transfertCall) _exiting_");
                    reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not transfertCall call', 'transfertCall for call ' + util.inspect(activeCall) + util.inspect(heldCall));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(transfertCall) ");
                that._logger.log("internalerror", LOG_ID + "(transfertCall) : ", error);
                that.logger.log("debug", LOG_ID + "(transfertCall) _exiting_");
                reject(error);
            }
        });
    }

    conferenceCall(requestHeader, activeCall, heldCall) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(conferenceCall) _entering_");
            if (activeCall && heldCall) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(activeCall.connectionId) + '/conference/' + encodeURIComponent(heldCall.connectionId), requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(conferenceCall) successfull");
                    that.logger.log("info", LOG_ID + "(conferenceCall) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(conferenceCall) REST conversation consulted : ", json.data);
                    that.logger.log("debug", LOG_ID + "(conferenceCall) _exiting_");
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(conferenceCall) error");
                    that.logger.log("internalerror", LOG_ID, "(conferenceCall) error : ", err);
                    that.logger.log("debug", LOG_ID + "(conferenceCall) _exiting_");
                    reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not conferenceCall call', 'conferenceCall for call ' + util.inspect(activeCall) + util.inspect(heldCall));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(conferenceCall) ");
                that._logger.log("internalerror", LOG_ID + "(conferenceCall) : ", error);
                that.logger.log("debug", LOG_ID + "(conferenceCall) _exiting_");
                reject(error);
            }
        });
    }

    forwardToDevice(requestHeader, contact, phoneInfo) {
        let that = this;
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
                that.logger.log("info", LOG_ID + "(forwardToDevice) REST conversation consulted");
                that.logger.log("internal", LOG_ID + "(forwardToDevice) REST conversation consulted : ", json.data);
                that.logger.log("debug", LOG_ID + "(forwardToDevice) _exiting_");
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(forwardToDevice) error");
                that.logger.log("internalerror", LOG_ID, "(forwardToDevice) error : ", err);
                that.logger.log("debug", LOG_ID + "(forwardToDevice) _exiting_");
                reject(err);
            });
        });
    }

    getForwardStatus(requestHeader) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(getForwardStatus) _entering_");
            that.http.get("/api/rainbow/telephony/v1.0/forward", requestHeader).then((json) => {
                that.logger.log("info", LOG_ID + "(getForwardStatus) successfull");
                that.logger.log("info", LOG_ID + "(getForwardStatus) REST conversation consulted");
                that.logger.log("internal", LOG_ID + "(getForwardStatus) REST conversation consulted : ", json.data);
                that.logger.log("debug", LOG_ID + "(getForwardStatus) _exiting_");
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(getForwardStatus) error");
                that.logger.log("internalerror", LOG_ID, "(getForwardStatus) error : ", err);
                that.logger.log("debug", LOG_ID + "(getForwardStatus) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method sendDtmf
     * @description
     *      send dtmf to the remote party
     * @param requestHeader
     * @param callId
     * @param deviceId
     * @param data
     */
    sendDtmf(requestHeader, callId, deviceId, data) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(sendDtmf) _entering_");
            that.http.post("/api/rainbow/telephony/v1.0/calls/" + callId + "%23" + deviceId + "/dtmf", requestHeader, data).then((json) => {
                that.logger.log("info", LOG_ID + "(sendDtmf) successfull");
                that.logger.log("info", LOG_ID + "(sendDtmf) REST conversation consulted");
                that.logger.log("internal", LOG_ID + "(sendDtmf) REST conversation consulted : ", json.data);
                that.logger.log("debug", LOG_ID + "(sendDtmf) _exiting_");
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(sendDtmf) error");
                that.logger.log("internalerror", LOG_ID, "(sendDtmf) error : ", err);
                that.logger.log("debug", LOG_ID + "(sendDtmf) _exiting_");
                reject(err);
            });
        });
    }


    getNomadicStatus(requestHeader) {
        let that = this;
        return new Promise(function (resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getNomadicStatus) _entering_");
            that.http.get("/api/rainbow/telephony/v1.0/nomadic", requestHeader).then((json) => {
                that.logger.log("info", LOG_ID + "(getNomadicStatus) successfull");
                that.logger.log("info", LOG_ID + "(getNomadicStatus) REST conversation consulted");
                that.logger.log("internal", LOG_ID + "(getNomadicStatus) REST conversation consulted : ", json.data);
                that.logger.log("debug", LOG_ID + "(getNomadicStatus) _exiting_");
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(getNomadicStatus) error");
                that.logger.log("internalerror", LOG_ID, "(getNomadicStatus) error : ", err);
                that.logger.log("debug", LOG_ID + "(getNomadicStatus) _exiting_");
                reject(err);
            });
        });
    }

    nomadicLogin(requestHeader, data) {
        let that = this;
        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(nomadicLogin) _entering_");
            that.http.put("/api/rainbow/telephony/v1.0/nomadic/login", requestHeader, data).then((json) => {
                that.logger.log("info", LOG_ID + "(nomadicLogin) successfull");
                that.logger.log("info", LOG_ID + "(nomadicLogin) REST nomadic login succeed");
                that.logger.log("internal", LOG_ID + "(nomadicLogin) REST nomadic login succeed : ", json.data);
                that.logger.log("debug", LOG_ID + "(nomadicLogin) _exiting_");
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(nomadicLogin) error");
                that.logger.log("internalerror", LOG_ID, "(nomadicLogin) error : ", err);
                that.logger.log("debug", LOG_ID + "(nomadicLogin) _exiting_");
                reject(err);
            });
        });
    }
};

let restService = null;

function getRESTTelephony(evtEmitter, logger) {
    restService = restService ? restService : new RESTTelephony(evtEmitter, logger);

    return restService;
}

export {RESTTelephony};
module.exports.RESTTelephony = getRESTTelephony;