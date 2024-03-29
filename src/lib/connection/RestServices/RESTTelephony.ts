'use strict';



import {addParamToUrl, logEntryExit} from "../../common/Utils";

const ErrorCase = require('../../common/ErrorManager');
const util = require('util');
const LOG_ID = "REST/TEL - ";

@logEntryExit(LOG_ID)
class RESTTelephony {
	public http: any;
	public logger: any;
	public _logger: any;
	public evtEmitter: any;

    static getClassName(){ return 'RESTTelephony'; }
    getClassName(){ return RESTTelephony.getClassName(); }

    constructor(evtEmitter, logger) {
        let that = this;
        that.evtEmitter = evtEmitter;
        that.logger = logger;

    }

    start(http) {
        return new Promise( (resolve)=> {
            let that = this;
            that.http = http;
            resolve(undefined);
        }) ;
    }

    stop() {
        return new Promise( (resolve)=> {
            let that = this;
            resolve(undefined);
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
                that.logger.log("debug", LOG_ID + "(makeCall) successfull");
                that.logger.log("debug", LOG_ID + "(makeCall) REST conversation created");
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
                    that.logger.log("debug", LOG_ID + "(releasecall) successfull");
                    that.logger.log("debug", LOG_ID + "(releasecall) REST conversation released");
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
                    that.logger.log("debug", LOG_ID + "(makeConsultationCall) successfull");
                    that.logger.log("debug", LOG_ID + "(makeConsultationCall) REST conversation consulted");
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
                    that.logger.log("debug", LOG_ID + "(answerCall) successfull");
                    that.logger.log("debug", LOG_ID + "(answerCall) REST conversation consulted");
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
                    that.logger.log("debug", LOG_ID + "(holdCall) successfull");
                    that.logger.log("debug", LOG_ID + "(holdCall) REST conversation consulted");
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
                    that.logger.log("debug", LOG_ID + "(retrieveCall) successfull");
                    that.logger.log("debug", LOG_ID + "(retrieveCall) REST conversation consulted");
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
                    that.logger.log("debug", LOG_ID + "(deflectCallToVM) successfull");
                    that.logger.log("debug", LOG_ID + "(deflectCallToVM) REST conversation consulted");
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
                    that.logger.log("debug", LOG_ID + "(deflectCall) successfull");
                    that.logger.log("debug", LOG_ID + "(deflectCall) REST conversation consulted");
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
                    that.logger.log("debug", LOG_ID + "(transfertCall) successfull");
                    that.logger.log("debug", LOG_ID + "(transfertCall) REST conversation consulted");
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
                    that.logger.log("debug", LOG_ID + "(conferenceCall) successfull");
                    that.logger.log("debug", LOG_ID + "(conferenceCall) REST conversation consulted");
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
                that.logger.log("debug", LOG_ID + "(forwardToDevice) successfull");
                that.logger.log("debug", LOG_ID + "(forwardToDevice) REST conversation consulted");
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
                that.logger.log("debug", LOG_ID + "(getForwardStatus) successfull");
                that.logger.log("debug", LOG_ID + "(getForwardStatus) REST conversation consulted");
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
                that.logger.log("debug", LOG_ID + "(sendDtmf) successfull");
                that.logger.log("debug", LOG_ID + "(sendDtmf) REST conversation consulted");
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
                that.logger.log("debug", LOG_ID + "(getNomadicStatus) successfull");
                that.logger.log("debug", LOG_ID + "(getNomadicStatus) REST conversation consulted");
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
                that.logger.log("debug", LOG_ID + "(nomadicLogin) successfull");
                that.logger.log("debug", LOG_ID + "(nomadicLogin) REST nomadic login succeed");
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
                that.logger.log("debug", LOG_ID + "(login) successfull");
                that.logger.log("debug", LOG_ID + "(login) REST conversation created");
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
                that.logger.log("debug", LOG_ID + "(logoff) successfull");
                that.logger.log("debug", LOG_ID + "(logoff) REST conversation created");
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
                that.logger.log("debug", LOG_ID + "(withdrawal) successfull");
                that.logger.log("debug", LOG_ID + "(withdrawal) REST conversation created");
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
                that.logger.log("debug", LOG_ID + "(wrapup) successfull");
                that.logger.log("debug", LOG_ID + "(wrapup) REST conversation created");
                that.logger.log("internal", LOG_ID + "(wrapup) REST conversation created : ", json);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(wrapup) error");
                that.logger.log("internalerror", LOG_ID, "(wrapup) error : ", err);
                return reject(err);
            });
        });
    }
    
    // region Voice Messages
    
    deleteAllMyVoiceMessagesFromPbx (postHeader) {
        // DELETE /api/rainbow/telephony/v1.0/voicemessages/all
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_all_user's_messages_delete
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(deleteAllMyVoiceMessagesFromPbx) REST .");

            that.http.delete("/api/rainbow/telephony/v1.0/voicemessages/all"  , postHeader, undefined).then((json) => {
                that.logger.log("debug", LOG_ID + "(deleteAllMyVoiceMessagesFromPbx) successfull");
                that.logger.log("internal", LOG_ID + "(deleteAllMyVoiceMessagesFromPbx) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteAllMyVoiceMessagesFromPbx) error");
                that.logger.log("internalerror", LOG_ID, "(deleteAllMyVoiceMessagesFromPbx) error : ", err);
                return reject(err);
            });
        });

    }
    
    deleteAVoiceMessageFromPbx (postHeader, messageId) {
        // DELETE /api/rainbow/telephony/v1.0/voicemessages/:messageId
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_message_delete
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(deleteAVoiceMessageFromPbx) REST messageId : ", messageId);

            that.http.delete("/api/rainbow/telephony/v1.0/voicemessages/" + messageId  , postHeader, undefined).then((json) => {
                that.logger.log("debug", LOG_ID + "(deleteAVoiceMessageFromPbx) successfull");
                that.logger.log("internal", LOG_ID + "(deleteAVoiceMessageFromPbx) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteAVoiceMessageFromPbx) error");
                that.logger.log("internalerror", LOG_ID, "(deleteAVoiceMessageFromPbx) error : ", err);
                return reject(err);
            });
        });
    }
    
    getAVoiceMessageFromPbx (requestHeader, messageId : string, messageDate : string, messageFrom : string) {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_message_read 
        // GET /api/rainbow/telephony/v1.0/voicemessages/:messageId
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(getAVoiceMessageFromPbx) REST messageId : ", messageId);

            let url: string = "/api/rainbow/telephony/v1.0/voicemessages/" + messageId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "messageDate", messageDate);
            addParamToUrl(urlParamsTab, "messageFrom", messageFrom);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getAVoiceMessageFromPbx) REST url : ", url);

            that.http.get(url, requestHeader, undefined).then((json) => {
                that.logger.log("debug", LOG_ID + "(getAVoiceMessageFromPbx) successfull");
                that.logger.log("internal", LOG_ID + "(getAVoiceMessageFromPbx) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAVoiceMessageFromPbx) error");
                that.logger.log("internalerror", LOG_ID, "(getAVoiceMessageFromPbx) error : ", err);
                return reject(err);
            });
        });
    }
    
    getDetailedListOfVoiceMessages (requestHeader) {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_messages_list 
        // GET /api/rainbow/telephony/v1.0/voicemessages
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(getDetailedListOfVoiceMessages) REST .");

            let url: string = "/api/rainbow/telephony/v1.0/voicemessages";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getDetailedListOfVoiceMessages) REST url : ", url);

            that.http.get(url, requestHeader, undefined).then((json) => {
                that.logger.log("debug", LOG_ID + "(getDetailedListOfVoiceMessages) successfull");
                that.logger.log("internal", LOG_ID + "(getDetailedListOfVoiceMessages) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getDetailedListOfVoiceMessages) error");
                that.logger.log("internalerror", LOG_ID, "(getDetailedListOfVoiceMessages) error : ", err);
                return reject(err);
            });
        });
    }
    
    getNumbersOfVoiceMessages (requestHeader) {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_messages_counters
        // GET /api/rainbow/telephony/v1.0/voicemessages/counters
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(getNumbersOfVoiceMessages) REST .");

            let url: string = "/api/rainbow/telephony/v1.0/voicemessages/counters";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getNumbersOfVoiceMessages) REST url : ", url);

            that.http.get(url, requestHeader, undefined).then((json) => {
                that.logger.log("debug", LOG_ID + "(getNumbersOfVoiceMessages) successfull");
                that.logger.log("internal", LOG_ID + "(getNumbersOfVoiceMessages) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getNumbersOfVoiceMessages) error");
                that.logger.log("internalerror", LOG_ID, "(getNumbersOfVoiceMessages) error : ", err);
                return reject(err);
            });
        });       
    }

    // endregion Voice Messages
    
}

let restService = null;

export {RESTTelephony};
module.exports.RESTTelephony = RESTTelephony;
