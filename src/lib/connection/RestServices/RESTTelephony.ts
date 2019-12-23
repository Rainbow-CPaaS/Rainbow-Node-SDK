'use strict';



import {logEntryExit} from "../../common/Utils";

const ErrorCase = require('../../common/ErrorManager');
const util = require('util');
const LOG_ID = "REST/TEL - ";

@logEntryExit(LOG_ID)
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
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(makeCall) error");
                that.logger.log("internalerror", LOG_ID, "(makeCall) error : ", err);
                return reject(err);
            });
        });
    }

    releaseCall(requestHeader, call) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (call.connectionId) {
                let data = encodeURIComponent(call.connectionId);


                that.http.delete("/api/rainbow/telephony/v1.0/calls/" + data, requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(releasecall) successfull");
                    that.logger.log("info", LOG_ID + "(releasecall) REST conversation released");
                    that.logger.log("internal", LOG_ID + "(releasecall) REST conversation released : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(releasecall) error.");
                    that.logger.log("internalerror", LOG_ID, "(releasecall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not release call', 'no connectionId found in call ', util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(releaseCall) Catch Error !!! ");
                that._logger.log("internalerror", LOG_ID + "(releaseCall) Catch Error !!! Error : ", error);
                return reject(error);
            }
        });
    }

    makeConsultationCall(requestHeader, callId, contact, phoneInfo) {
        let that = this;
        return new Promise((resolve, reject) => {
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
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(makeConsultationCall) error");
                    that.logger.log("internalerror", LOG_ID, "(makeConsultationCall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not makeConsultationCall call', 'makeConsultationCall for callId ' + callId);// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(makeConsultationCall) ", error);
                return reject(error);
            }
        });
    }

    answerCall(requestHeader, call) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/answer', requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(answerCall) successfull");
                    that.logger.log("info", LOG_ID + "(answerCall) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(answerCall) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(answerCall) error");
                    that.logger.log("internalerror", LOG_ID, "(answerCall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not answerCall call', 'answerCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(answerCall) ");
                that._logger.log("internalerror", LOG_ID + "(answerCall) : ", error);
                return reject(error);
            }
        });
    }

    holdCall(requestHeader, call) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/hold', requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(holdCall) successfull");
                    that.logger.log("info", LOG_ID + "(holdCall) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(holdCall) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(holdCall) error");
                    that.logger.log("internalerror", LOG_ID, "(holdCall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not holdCall call', 'holdCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(answerCall) ");
                that._logger.log("internalerror", LOG_ID + "(answerCall) ", error);
                return reject(error);
            }
        });
    }

    retrieveCall(requestHeader, call) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/retrieve', requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(retrieveCall) successfull");
                    that.logger.log("info", LOG_ID + "(retrieveCall) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(retrieveCall) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(retrieveCall) error");
                    that.logger.log("internal", LOG_ID, "(retrieveCall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not retrieveCall call', 'retrieveCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(retrieveCall) ");
                that._logger.log("internalerror", LOG_ID + "(retrieveCall) : ", error);
                return reject(error);
            }
        });
    }

    deflectCallToVM(requestHeader, call, VMInfos) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/deflect', requestHeader, VMInfos).then((json) => {
                    that.logger.log("info", LOG_ID + "(deflectCallToVM) successfull");
                    that.logger.log("info", LOG_ID + "(deflectCallToVM) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(deflectCallToVM) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(deflectCallToVM) error");
                    that.logger.log("internalerror", LOG_ID, "(deflectCallToVM) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not deflectCallToVM call', 'deflectCallToVM for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(deflectCallToVM) ");
                that._logger.log("internalerror", LOG_ID + "(deflectCallToVM) : ", error);
                return reject(error);
            }
        });
    }

    deflectCall(requestHeader, call, VMInfos) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/deflect', requestHeader, VMInfos).then((json) => {
                    that.logger.log("info", LOG_ID + "(deflectCall) successfull");
                    that.logger.log("info", LOG_ID + "(deflectCall) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(deflectCall) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(deflectCall) error");
                    that.logger.log("internalerror", LOG_ID, "(deflectCall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not deflectCall call', 'deflectCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(deflectCall) ");
                that._logger.log("internalerror", LOG_ID + "(deflectCall) : ", error);
                return reject(error);
            }
        });
    }

    transfertCall(requestHeader, activeCall, heldCall) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (activeCall && heldCall) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(activeCall.connectionId) + '/transfer/' + encodeURIComponent(heldCall.connectionId), requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(transfertCall) successfull");
                    that.logger.log("info", LOG_ID + "(transfertCall) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(transfertCall) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(transfertCall) error");
                    that.logger.log("internalerror", LOG_ID, "(transfertCall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not transfertCall call', 'transfertCall for call ' + util.inspect(activeCall) + util.inspect(heldCall));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(transfertCall) ");
                that._logger.log("internalerror", LOG_ID + "(transfertCall) : ", error);
                return reject(error);
            }
        });
    }

    conferenceCall(requestHeader, activeCall, heldCall) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (activeCall && heldCall) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(activeCall.connectionId) + '/conference/' + encodeURIComponent(heldCall.connectionId), requestHeader).then((json) => {
                    that.logger.log("info", LOG_ID + "(conferenceCall) successfull");
                    that.logger.log("info", LOG_ID + "(conferenceCall) REST conversation consulted");
                    that.logger.log("internal", LOG_ID + "(conferenceCall) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID, "(conferenceCall) error");
                    that.logger.log("internalerror", LOG_ID, "(conferenceCall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not conferenceCall call', 'conferenceCall for call ' + util.inspect(activeCall) + util.inspect(heldCall));// errorHelperService.handleError(response);
                that._logger.log("error", LOG_ID + "(conferenceCall) ");
                that._logger.log("internalerror", LOG_ID + "(conferenceCall) : ", error);
                return reject(error);
            }
        });
    }

    forwardToDevice(requestHeader, contact, phoneInfo) {
        let that = this;
        return new Promise((resolve, reject) => {
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
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(forwardToDevice) error");
                that.logger.log("internalerror", LOG_ID, "(forwardToDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getForwardStatus(requestHeader) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/telephony/v1.0/forward", requestHeader).then((json) => {
                that.logger.log("info", LOG_ID + "(getForwardStatus) successfull");
                that.logger.log("info", LOG_ID + "(getForwardStatus) REST conversation consulted");
                that.logger.log("internal", LOG_ID + "(getForwardStatus) REST conversation consulted : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(getForwardStatus) error");
                that.logger.log("internalerror", LOG_ID, "(getForwardStatus) error : ", err);
                return reject(err);
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
            that.http.post("/api/rainbow/telephony/v1.0/calls/" + callId + "%23" + deviceId + "/dtmf", requestHeader, data).then((json) => {
                that.logger.log("info", LOG_ID + "(sendDtmf) successfull");
                that.logger.log("info", LOG_ID + "(sendDtmf) REST conversation consulted");
                that.logger.log("internal", LOG_ID + "(sendDtmf) REST conversation consulted : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(sendDtmf) error");
                that.logger.log("internalerror", LOG_ID, "(sendDtmf) error : ", err);
                return reject(err);
            });
        });
    }


    getNomadicStatus(requestHeader) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/telephony/v1.0/nomadic", requestHeader).then((json) => {
                that.logger.log("info", LOG_ID + "(getNomadicStatus) successfull");
                that.logger.log("info", LOG_ID + "(getNomadicStatus) REST conversation consulted");
                that.logger.log("internal", LOG_ID + "(getNomadicStatus) REST conversation consulted : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(getNomadicStatus) error");
                that.logger.log("internalerror", LOG_ID, "(getNomadicStatus) error : ", err);
                return reject(err);
            });
        });
    }

    nomadicLogin(requestHeader, data) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.put("/api/rainbow/telephony/v1.0/nomadic/login", requestHeader, data).then((json) => {
                that.logger.log("info", LOG_ID + "(nomadicLogin) successfull");
                that.logger.log("info", LOG_ID + "(nomadicLogin) REST nomadic login succeed");
                that.logger.log("internal", LOG_ID + "(nomadicLogin) REST nomadic login succeed : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(nomadicLogin) error");
                that.logger.log("internalerror", LOG_ID, "(nomadicLogin) error : ", err);
                return reject(err);
            });
        });
    }

    logon(requestHeader, endpointTel, agentId, password, groupId) {
        let that = this;
        return new Promise((resolve, reject) => {
            let data = {
                endpointTel,
                agentId,
                password,
                groupId
            };

            that.http.post("/api/rainbow/telephony/v1.0/ccd/logon", requestHeader, data).then((json) => {
                that.logger.log("info", LOG_ID + "(login) successfull");
                that.logger.log("info", LOG_ID + "(login) REST conversation created");
                that.logger.log("internal", LOG_ID + "(login) REST conversation created : ", json);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(login) error");
                that.logger.log("internalerror", LOG_ID, "(login) error : ", err);
                return reject(err);
            });
        });
    }

    logoff(requestHeader, endpointTel, agentId, password, groupId) {
        let that = this;
        return new Promise((resolve, reject) => {
            let data = {
                endpointTel,
                agentId,
                password,
                groupId
            };

            that.http.post("/api/rainbow/telephony/v1.0/ccd/logoff", requestHeader, data).then((json) => {
                that.logger.log("info", LOG_ID + "(logoff) successfull");
                that.logger.log("info", LOG_ID + "(logoff) REST conversation created");
                that.logger.log("internal", LOG_ID + "(logoff) REST conversation created : ", json);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(logoff) error");
                that.logger.log("internalerror", LOG_ID, "(logoff) error : ", err);
                return reject(err);
            });
        });
    }

    withdrawal(requestHeader, agentId, groupId, status) {
        let that = this;
        return new Promise((resolve, reject) => {
            let data = {
                agentId,
                groupId,
                status
            };

            that.http.post("/api/rainbow/telephony/v1.0/ccd/withdrawal", requestHeader, data).then((json) => {
                that.logger.log("info", LOG_ID + "(withdrawal) successfull");
                that.logger.log("info", LOG_ID + "(withdrawal) REST conversation created");
                that.logger.log("internal", LOG_ID + "(withdrawal) REST conversation created : ", json);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(withdrawal) error");
                that.logger.log("internalerror", LOG_ID, "(withdrawal) error : ", err);
                return reject(err);
            });
        });
    }

    wrapup(requestHeader, agentId, groupId, password, status) {
        let that = this;
        return new Promise((resolve, reject) => {
            let data = {
                agentId,
                password,
                groupId,
                status
            };

            that.http.post("/api/rainbow/telephony/v1.0/ccd/wrapup", requestHeader, data).then((json) => {
                that.logger.log("info", LOG_ID + "(wrapup) successfull");
                that.logger.log("info", LOG_ID + "(wrapup) REST conversation created");
                that.logger.log("internal", LOG_ID + "(wrapup) REST conversation created : ", json);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(wrapup) error");
                that.logger.log("internalerror", LOG_ID, "(wrapup) error : ", err);
                return reject(err);
            });
        });
    }
}

let restService = null;

export {RESTTelephony};
module.exports.RESTTelephony = RESTTelephony;
