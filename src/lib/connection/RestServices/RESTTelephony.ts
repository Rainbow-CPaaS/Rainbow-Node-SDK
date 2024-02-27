'use strict';



import {addParamToUrl, logEntryExit, stackTrace} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const ErrorCase = require('../../common/ErrorManager');
const util = require('util');
const LOG_ID = "REST/TEL - ";

@logEntryExit(LOG_ID)
class RESTTelephony extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() {
        return 'RESTTelephony';
    }

    getClassName() {
        return RESTTelephony.getClassName();
    }

    static getAccessorName() {
        return 'resttelephony';
    }

    getAccessorName() {
        return RESTTelephony.getAccessorName();
    }

    constructor(evtEmitter, _logger) {
        super(_logger, LOG_ID);
        this.setLogLevels(this);
        let that = this;

        that.evtEmitter = evtEmitter;
        that._logger = _logger;
    }

    start(http) {
        return new Promise((resolve) => {
            let that = this;
            that.http = http;
            resolve(undefined);
        });
    }

    stop() {
        return new Promise((resolve) => {
            let that = this;
            resolve(undefined);
        });
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
                "correlatorData": phoneInfo.correlatorData ? phoneInfo.correlatorData:" "
                //}
            };


            that.http.post("/api/rainbow/telephony/v1.0/calls", requestHeader, data).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(makeCall) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(makeCall) REST conversation created");
                that._logger.log(that.INTERNAL, LOG_ID + "(makeCall) REST conversation created : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(makeCall) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(makeCall) error : ", err);
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
                    that._logger.log(that.DEBUG, LOG_ID + "(releasecall) successfull");
                    that._logger.log(that.DEBUG, LOG_ID + "(releasecall) REST conversation released");
                    that._logger.log(that.INTERNAL, LOG_ID + "(releasecall) REST conversation released : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(releasecall) error.");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(releasecall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not release call', 'no connectionId found in call ', util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log(that.ERROR, LOG_ID + "(releaseCall) Catch Error !!! ");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(releaseCall) Catch Error !!! Error : ", error);
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
                    "correlatorData": phoneInfo.correlatorData ? phoneInfo.correlatorData:" "
                };

                that.http.post("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(callId) + '/consultation', requestHeader, data).then((json) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(makeConsultationCall) successfull");
                    that._logger.log(that.DEBUG, LOG_ID + "(makeConsultationCall) REST conversation consulted");
                    that._logger.log(that.INTERNAL, LOG_ID + "(makeConsultationCall) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(makeConsultationCall) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(makeConsultationCall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not makeConsultationCall call', 'makeConsultationCall for callId ' + callId);// errorHelperService.handleError(response);
                that._logger.log(that.ERROR, LOG_ID + "(makeConsultationCall) ", error);
                return reject(error);
            }
        });
    }

    answerCall(requestHeader, call) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/answer', requestHeader).then((json) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(answerCall) successfull");
                    that._logger.log(that.DEBUG, LOG_ID + "(answerCall) REST conversation consulted");
                    that._logger.log(that.INTERNAL, LOG_ID + "(answerCall) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(answerCall) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(answerCall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not answerCall call', 'answerCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log(that.ERROR, LOG_ID + "(answerCall) ");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(answerCall) : ", error);
                return reject(error);
            }
        });
    }

    holdCall(requestHeader, call) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/hold', requestHeader).then((json) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(holdCall) successfull");
                    that._logger.log(that.DEBUG, LOG_ID + "(holdCall) REST conversation consulted");
                    that._logger.log(that.INTERNAL, LOG_ID + "(holdCall) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(holdCall) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(holdCall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not holdCall call', 'holdCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log(that.ERROR, LOG_ID + "(answerCall) ");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(answerCall) ", error);
                return reject(error);
            }
        });
    }

    retrieveCall(requestHeader, call) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/retrieve', requestHeader).then((json) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(retrieveCall) successfull");
                    that._logger.log(that.DEBUG, LOG_ID + "(retrieveCall) REST conversation consulted");
                    that._logger.log(that.INTERNAL, LOG_ID + "(retrieveCall) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(retrieveCall) error");
                    that._logger.log(that.INTERNAL, LOG_ID, "(retrieveCall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not retrieveCall call', 'retrieveCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log(that.ERROR, LOG_ID + "(retrieveCall) ");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(retrieveCall) : ", error);
                return reject(error);
            }
        });
    }

    deflectCallToVM(requestHeader, call, VMInfos) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/deflect', requestHeader, VMInfos).then((json) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(deflectCallToVM) successfull");
                    that._logger.log(that.DEBUG, LOG_ID + "(deflectCallToVM) REST conversation consulted");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deflectCallToVM) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(deflectCallToVM) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deflectCallToVM) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not deflectCallToVM call', 'deflectCallToVM for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log(that.ERROR, LOG_ID + "(deflectCallToVM) ");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(deflectCallToVM) : ", error);
                return reject(error);
            }
        });
    }

    deflectCall(requestHeader, call, VMInfos) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (call) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(call.connectionId) + '/deflect', requestHeader, VMInfos).then((json) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(deflectCall) successfull");
                    that._logger.log(that.DEBUG, LOG_ID + "(deflectCall) REST conversation consulted");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deflectCall) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(deflectCall) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deflectCall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not deflectCall call', 'deflectCall for call ' + util.inspect(call));// errorHelperService.handleError(response);
                that._logger.log(that.ERROR, LOG_ID + "(deflectCall) ");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(deflectCall) : ", error);
                return reject(error);
            }
        });
    }

    transfertCall(requestHeader, activeCall, heldCall) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (activeCall && heldCall) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(activeCall.connectionId) + '/transfer/' + encodeURIComponent(heldCall.connectionId), requestHeader).then((json) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(transfertCall) successfull");
                    that._logger.log(that.DEBUG, LOG_ID + "(transfertCall) REST conversation consulted");
                    that._logger.log(that.INTERNAL, LOG_ID + "(transfertCall) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(transfertCall) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(transfertCall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not transfertCall call', 'transfertCall for call ' + util.inspect(activeCall) + util.inspect(heldCall));// errorHelperService.handleError(response);
                that._logger.log(that.ERROR, LOG_ID + "(transfertCall) ");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(transfertCall) : ", error);
                return reject(error);
            }
        });
    }

    conferenceCall(requestHeader, activeCall, heldCall) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (activeCall && heldCall) {
                that.http.put("/api/rainbow/telephony/v1.0/calls/" + encodeURIComponent(activeCall.connectionId) + '/conference/' + encodeURIComponent(heldCall.connectionId), requestHeader).then((json) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(conferenceCall) successfull");
                    that._logger.log(that.DEBUG, LOG_ID + "(conferenceCall) REST conversation consulted");
                    that._logger.log(that.INTERNAL, LOG_ID + "(conferenceCall) REST conversation consulted : ", json.data);
                    resolve(json.data);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(conferenceCall) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(conferenceCall) error : ", err);
                    return reject(err);
                });
            } else {
                let error = ErrorCase.OTHERERROR('can not conferenceCall call', 'conferenceCall for call ' + util.inspect(activeCall) + util.inspect(heldCall));// errorHelperService.handleError(response);
                that._logger.log(that.ERROR, LOG_ID + "(conferenceCall) ");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(conferenceCall) : ", error);
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
                that._logger.log(that.DEBUG, LOG_ID + "(forwardToDevice) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(forwardToDevice) REST conversation consulted");
                that._logger.log(that.INTERNAL, LOG_ID + "(forwardToDevice) REST conversation consulted : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(forwardToDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(forwardToDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getForwardStatus(requestHeader) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/telephony/v1.0/forward", requestHeader).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getForwardStatus) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(getForwardStatus) REST conversation consulted");
                that._logger.log(that.INTERNAL, LOG_ID + "(getForwardStatus) REST conversation consulted : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(getForwardStatus) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getForwardStatus) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(sendDtmf) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(sendDtmf) REST conversation consulted");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendDtmf) REST conversation consulted : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(sendDtmf) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendDtmf) error : ", err);
                return reject(err);
            });
        });
    }


    getNomadicStatus(requestHeader) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/telephony/v1.0/nomadic", requestHeader).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getNomadicStatus) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(getNomadicStatus) REST conversation consulted");
                that._logger.log(that.INTERNAL, LOG_ID + "(getNomadicStatus) REST conversation consulted : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(getNomadicStatus) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getNomadicStatus) error : ", err);
                return reject(err);
            });
        });
    }

    nomadicLogin(requestHeader, data) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.put("/api/rainbow/telephony/v1.0/nomadic/login", requestHeader, data).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(nomadicLogin) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(nomadicLogin) REST nomadic login succeed");
                that._logger.log(that.INTERNAL, LOG_ID + "(nomadicLogin) REST nomadic login succeed : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(nomadicLogin) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(nomadicLogin) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(login) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(login) REST conversation created");
                that._logger.log(that.INTERNAL, LOG_ID + "(login) REST conversation created : ", json);
                resolve(json.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(login) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(login) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(logoff) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(logoff) REST conversation created");
                that._logger.log(that.INTERNAL, LOG_ID + "(logoff) REST conversation created : ", json);
                resolve(json.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(logoff) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(logoff) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(withdrawal) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(withdrawal) REST conversation created");
                that._logger.log(that.INTERNAL, LOG_ID + "(withdrawal) REST conversation created : ", json);
                resolve(json.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(withdrawal) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(withdrawal) error : ", err);
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
                that._logger.log(that.DEBUG, LOG_ID + "(wrapup) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(wrapup) REST conversation created");
                that._logger.log(that.INTERNAL, LOG_ID + "(wrapup) REST conversation created : ", json);
                resolve(json.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(wrapup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(wrapup) error : ", err);
                return reject(err);
            });
        });
    }

    // region Voice Messages

    deleteAllMyVoiceMessagesFromPbx(postHeader) {
        // DELETE /api/rainbow/telephony/v1.0/voicemessages/all
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_all_user's_messages_delete
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(deleteAllMyVoiceMessagesFromPbx) REST .");

            that.http.delete("/api/rainbow/telephony/v1.0/voicemessages/all", postHeader, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAllMyVoiceMessagesFromPbx) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAllMyVoiceMessagesFromPbx) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAllMyVoiceMessagesFromPbx) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAllMyVoiceMessagesFromPbx) error : ", err);
                return reject(err);
            });
        });

    }

    deleteAVoiceMessageFromPbx(postHeader, messageId) {
        // DELETE /api/rainbow/telephony/v1.0/voicemessages/:messageId
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_message_delete
        let that = this;
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(deleteAVoiceMessageFromPbx) REST messageId : ", messageId);

            that.http.delete("/api/rainbow/telephony/v1.0/voicemessages/" + messageId, postHeader, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAVoiceMessageFromPbx) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAVoiceMessageFromPbx) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAVoiceMessageFromPbx) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAVoiceMessageFromPbx) error : ", err);
                return reject(err);
            });
        });
    }

    getAVoiceMessageFromPbx(requestHeader, messageId: string, messageDate: string, messageFrom: string) {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_message_read 
        // GET /api/rainbow/telephony/v1.0/voicemessages/:messageId
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAVoiceMessageFromPbx) REST messageId : ", messageId);

            let url: string = "/api/rainbow/telephony/v1.0/voicemessages/" + messageId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "messageDate", messageDate);
            addParamToUrl(urlParamsTab, "messageFrom", messageFrom);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAVoiceMessageFromPbx) REST url : ", url);

            that.http.get(url, requestHeader, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAVoiceMessageFromPbx) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAVoiceMessageFromPbx) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAVoiceMessageFromPbx) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAVoiceMessageFromPbx) error : ", err);
                return reject(err);
            });
        });
    }

    getDetailedListOfVoiceMessages(requestHeader) {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_messages_list 
        // GET /api/rainbow/telephony/v1.0/voicemessages
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getDetailedListOfVoiceMessages) REST .");

            let url: string = "/api/rainbow/telephony/v1.0/voicemessages";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getDetailedListOfVoiceMessages) REST url : ", url);

            that.http.get(url, requestHeader, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getDetailedListOfVoiceMessages) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDetailedListOfVoiceMessages) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDetailedListOfVoiceMessages) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDetailedListOfVoiceMessages) error : ", err);
                return reject(err);
            });
        });
    }

    getNumbersOfVoiceMessages(requestHeader) {
        // API https://api.openrainbow.org/telephony/#api-telephony-Voice_messages_counters
        // GET /api/rainbow/telephony/v1.0/voicemessages/counters
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getNumbersOfVoiceMessages) REST .");

            let url: string = "/api/rainbow/telephony/v1.0/voicemessages/counters";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getNumbersOfVoiceMessages) REST url : ", url);

            that.http.get(url, requestHeader, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getNumbersOfVoiceMessages) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getNumbersOfVoiceMessages) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getNumbersOfVoiceMessages) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getNumbersOfVoiceMessages) error : ", err);
                return reject(err);
            });
        });
    }

    // endregion Voice Messages

}

let restService = null;

export {RESTTelephony};
module.exports.RESTTelephony = RESTTelephony;
