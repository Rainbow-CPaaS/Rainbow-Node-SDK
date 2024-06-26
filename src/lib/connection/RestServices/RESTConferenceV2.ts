'use strict';

import {addParamToUrl, logEntryExit, stackTrace} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService";
import {HTTPService} from "../HttpService.js";

const ErrorCase = require('../../common/ErrorManager');
const util = require('util');
const LOG_ID = "REST/CONFV2 - ";

@logEntryExit(LOG_ID)
class RESTConferenceV2 extends GenericRESTService {
    public http: HTTPService;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() {
        return 'RESTConferenceV2';
    }

    getClassName() {
        return RESTConferenceV2.getClassName();
    }

    static getAccessorName(){ return 'restconferencev2'; }
    getAccessorName(){ return RESTConferenceV2.getAccessorName(); }

    constructor(evtEmitter, _logger) {
        super(_logger, LOG_ID);
        this.setLogLevels(this);
        let that = this;

        that.evtEmitter = evtEmitter;
        that._logger = _logger;
    }

    start(http : HTTPService) {
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

// conference v2
    addPSTNParticipantToConference(roomId : string, participantPhoneNumber : string, country : string) {
        // post /api/rainbow/conference/v1.0/rooms/:roomId/add
        let that = this;
        const data = {
            participantPhoneNumber,
            country
        };

        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/conference/v1.0/rooms/" + roomId + "/add", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addPSTNParticipantToConference) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addPSTNParticipantToConference) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addPSTNParticipantToConference) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addPSTNParticipantToConference) error : ", err);
                return reject(err);
            });
        });
    }

    snapshotConference(roomId : string, limit : number = 100,  offset : number = 0) {
        // GET  https://openrainbow.com/api/rainbow/conference/v1.0/rooms/:roomId/snapshot
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/conference/v1.0/rooms/" + roomId + "/snapshot" ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(snapshotConference) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(snapshotConference) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(snapshotConference) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(snapshotConference) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(snapshotConference) error : ", err);
                return reject(err);
            });
        });
    }
    
    delegateConference(roomId : string, userId : string) {
        // PUT  https://openrainbow.com/api/rainbow/conference/v1.0/rooms/:roomId/users/:userId/delegate
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/conference/v1.0/rooms/" + roomId + "/users/" + userId + "/delegate" ;
            // addParamToUrl([url], "companyId", companyId);
            // url = url[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(delegateConference) REST url : ", url);
            let data = undefined;

            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {  
                that._logger.log(that.DEBUG, LOG_ID + "(delegateConference) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(delegateConference) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(delegateConference) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(delegateConference) error : ", err);
                return reject(err);
            });
        });
    }

    disconnectPSTNParticipantFromConference (roomId : string) {
        // DELETE https://openrainbow.com/api/rainbow/conference/v1.0/rooms/:roomId/phone-numbers
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/conference/v1.0/rooms/" + roomId + "/phone-numbers";
            /*
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];
            // */

            that.http.delete(url, that.getRequestHeader()).then((response) => {
                that._logger.log(that.DEBUG, LOG_ID + "(removeTagFromAllDirectoryEntries) (" + roomId + ") -- success");
                resolve(response);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(removeTagFromAllDirectoryEntries) (" + roomId + ") -- failure -- ");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(removeTagFromAllDirectoryEntries) (" + roomId + ") -- failure -- ", err.message);
                return reject(err);
            });
        });
    }

    disconnectParticipantFromConference (roomId : string, userId : string) {
        // DELETE https://openrainbow.com/api/rainbow/conference/v1.0/rooms/:roomId/users/:userId
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/conference/v1.0/rooms/" + roomId + "/users/" + userId;
            /*
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];
            // */

            that.http.delete(url, that.getRequestHeader()).then((response) => {
                that._logger.log(that.DEBUG, LOG_ID + "(disconnectParticipantFromConference) (" + roomId + ") -- success");
                resolve(response);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(disconnectParticipantFromConference) (" + roomId + ") -- failure -- ");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(disconnectParticipantFromConference) (" + roomId + ") -- failure -- ", err.message);
                return reject(err);
            });
        });
    }

    getTalkingTimeForAllPparticipantsInConference(roomId : string, limit : number = 100,  offset : number = 0) {
        // GET  https://openrainbow.com/api/rainbow/conference/v1.0/rooms/:roomId/talking-time
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/conference/v1.0/rooms/" + roomId + "/talking-time" ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getTalkingTimeForAllPparticipantsInConference) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTalkingTimeForAllPparticipantsInConference) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTalkingTimeForAllPparticipantsInConference) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getTalkingTimeForAllPparticipantsInConference) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getTalkingTimeForAllPparticipantsInConference) error : ", err);
                return reject(err);
            });
        });
    }
    
    joinConference(roomId: string, participantPhoneNumber: string = undefined, country: string = undefined, deskphone : boolean = false, dc: Array<string> = undefined, mute: boolean = false, microphone: boolean = false, media : Array<string> = undefined, resourceId : string  = undefined) {
        // API https://api.openrainbow.org/conference/#api-conference_v2-joinConferenceV2
        // POST /api/rainbow/conference/v1.0/rooms/:roomId/join 
        let that = this;
        const data : any = {};
        if (participantPhoneNumber != undefined) {
            data.participantPhoneNumber = participantPhoneNumber;
        }
        if (country != undefined) {
            data.country = country;
        }
        if (deskphone != undefined) {
            data.deskphone = deskphone;
        }
        if (dc != undefined) {
            data.dc = dc;
        }
        if (mute != undefined) {
            data.mute = mute;
        }
        if (microphone != undefined) {
            data.microphone = microphone;
        }
        if (media != undefined) {
            data.media = media;
        }
        //let args = Array.prototype.slice.call(arguments, 1);
        let args = arguments;
        let options = {
            showHidden  : false,
            depth : 3,
            colors : true,
            maxArrayLength : 3
        };
        that._logger.log(that.DEBUG, LOG_ID + "(joinConference) arguments : ", util.inspect(args, options));
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/conference/v1.0/rooms/" + roomId + "/join", that.getPostHeader(), JSON.stringify(data), undefined).then(function (json) {
            //that.http.post("/api/rainbow/conference/v1.0/rooms/" + roomId + "/join", that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(joinConference) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(joinConference) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(joinConference) error : ", err);
                that._logger.log(that.INTERNALERROR, LOG_ID, "(joinConference) error : ", err);
                return reject(err);
            });
        });
    }

    pauseRecording(roomId : string) {
        // PUT  https://openrainbow.com/api/rainbow/conference/v1.0/rooms/:roomId/pause-recording
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/conference/v1.0/rooms/" + roomId + "/pause-recording" ;
            // addParamToUrl([url], "companyId", companyId);
            // url = url[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(pauseRecording) REST url : ", url);
            let data = undefined;

            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(pauseRecording) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(pauseRecording) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(pauseRecording) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(pauseRecording) error : ", err);
                return reject(err);
            });
        });
    }

    resumeRecording(roomId : string) {
        // PUT  https://openrainbow.com/api/rainbow/conference/v1.0/rooms/:roomId/resume-recording
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/conference/v1.0/rooms/" + roomId + "/resume-recording" ;
            // addParamToUrl([url], "companyId", companyId);
            // url = url[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(resumeRecording) REST url : ", url);
            let data = undefined;

            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(resumeRecording) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(resumeRecording) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(resumeRecording) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(resumeRecording) error : ", err);
                return reject(err);
            });
        });
    }

    startRecording(roomId : string) {
        // PUT  https://openrainbow.com/api/rainbow/conference/v1.0/rooms/:roomId/start-recording
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/conference/v1.0/rooms/" + roomId + "/start-recording" ;
            // addParamToUrl([url], "companyId", companyId);
            // url = url[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(startRecording) REST url : ", url);
            let data = undefined;

            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(startRecording) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(startRecording) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(startRecording) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(startRecording) error : ", err);
                return reject(err);
            });
        });
    }

    stopRecording(roomId : string) {
        // PUT  https://openrainbow.com/api/rainbow/conference/v1.0/rooms/:roomId/stop-recording
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/conference/v1.0/rooms/" + roomId + "/stop-recording" ;
            // addParamToUrl([url], "companyId", companyId);
            // url = url[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(stopRecording) REST url : ", url);
            let data = undefined;

            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(stopRecording) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(stopRecording) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(stopRecording) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(stopRecording) error : ", err);
                return reject(err);
            });
        });
    }

    rejectAVideoConference(roomId : string) {
        // PUT  https://openrainbow.com/api/rainbow/conference/v1.0/rooms/:roomId/reject
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/conference/v1.0/rooms/" + roomId + "/reject" ;
            // addParamToUrl([url], "companyId", companyId);
            // url = url[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(rejectAVideoConference) REST url : ", url);
            let data = undefined;

            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(rejectAVideoConference) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(rejectAVideoConference) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(rejectAVideoConference) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(rejectAVideoConference) error : ", err);
                return reject(err);
            });
        });
    }

//Start a PSTN, WebRTC conference or a webinar in a room  () {
    startConferenceOrWebinarInARoom(roomId : string, services  : any = undefined) {
        // API https://api.openrainbow.org/conference/#api-conference_v2-startConferenceV2
        // POST  https://openrainbow.com/api/rainbow/conference/v1.0/rooms/:roomId/start
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/conference/v1.0/rooms/" + roomId + "/start";
            /*let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "label", label);
            url = urlParamsTab[0];
            // */

            //let data = undefined;
            /* let data =
                    {
                        "services": [
                            "video-compositor"
                        ]
                    }; 
            // */
            that._logger.log(that.INTERNAL, LOG_ID + "(startConferenceOrWebinarInARoom) services : ", services );
            that.http.post(url, that.getRequestHeader(), services, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(startConferenceOrWebinarInARoom) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(startConferenceOrWebinarInARoom) REST leave bubble : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(startConferenceOrWebinarInARoom) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(startConferenceOrWebinarInARoom) error : ", err);
                return reject(err);
            });
        });
    }

    stopConferenceOrWebinar(roomId : string) {
        // DELETE https://openrainbow.com/api/rainbow/conference/v1.0/rooms/:roomId/stop     
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/conference/v1.0/rooms/" + roomId + "/stop";
            /*let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "tag", tag);
            url = urlParamsTab[0];
            // */

            that.http.delete(url, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(stopConferenceOrWebinar) (" + roomId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(stopConferenceOrWebinar) (" + roomId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(stopConferenceOrWebinar) (" + roomId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    subscribeForParticipantVideoStream(roomId : string, userId : string, media : string = "video", subStreamLevel : number = 0, dynamicFeed : boolean = false ) {
        // put /api/rainbow/conference/v1.0/rooms/:roomId/users/:userId/subscribe
        let that = this;
        const data = {
            media, 
            subStreamLevel, 
            dynamicFeed
        };

        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/conference/v1.0/rooms/" + roomId + "/users/" + userId + "/subscribe", that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(inviteContactToBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(inviteContactToBubble) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(inviteContactToBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(inviteContactToBubble) error : ", err);
                return reject(err);
            });
        });
    }

    updatePSTNParticipantParameters(roomId : string, phoneNumber : string, option : string = "unmute") {
        // put /api/rainbow/conference/v1.0/rooms/:roomId/phone-numbers
        let that = this;
        const data = {
            phoneNumber, 
            option
        };

        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/conference/v1.0/rooms/" + roomId + "/phone-numbers", that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updatePSTNParticipantParameters) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updatePSTNParticipantParameters) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updatePSTNParticipantParameters) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updatePSTNParticipantParameters) error : ", err);
                return reject(err);
            });
        });
    }
    
    updateConferenceParameters(roomId : string, option : string = "unmute") {
        // put /api/rainbow/conference/v1.0/rooms/:roomId/update
        let that = this;
        const data = {
            option
        };

        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/conference/v1.0/rooms/" + roomId + "/update", that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateConferenceParameters) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateConferenceParameters) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateConferenceParameters) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateConferenceParameters) error : ", err);
                return reject(err);
            });
        });
    }

    updateParticipantParameters(roomId : string, userId : string, option : string, media : string, bitRate : number, subStreamLevel : number, publisherId : string ) {
        // put /api/rainbow/conference/v1.0/rooms/:roomId/users/:userId
        let that = this;
        const data = {
            option
        };

        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/conference/v1.0/rooms/" + roomId + "/users/" + userId, that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateConferenceParameters) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateConferenceParameters) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateConferenceParameters) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateConferenceParameters) error : ", err);
                return reject(err);
            });
        });
    }

    allowTalkWebinar(roomId : string, userId : string) {
        // put /api/rainbow/conference/v1.0/rooms/:roomId/users/:userId/allow-talk
        let that = this;
        const data = undefined;

        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/conference/v1.0/rooms/" + roomId+ "/users/" + userId + "/allow-talk", that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(allowTalkWebinar) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(allowTalkWebinar) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(allowTalkWebinar) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(allowTalkWebinar) error : ", err);
                return reject(err);
            });
        });
    }

    disableTalkWebinar(roomId : string, userId : string) {
        // put /api/rainbow/conference/v1.0/rooms/:roomId/users/:userId/disable-talk
        let that = this;
        const data = undefined;

        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/conference/v1.0/rooms/" + roomId+ "/users/" + userId + "/disable-talk", that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(disableTalkWebinar) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(disableTalkWebinar) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(disableTalkWebinar) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(disableTalkWebinar) error : ", err);
                return reject(err);
            });
        });
    }
    
    lowerHandWebinar(roomId : string) {
        // put /api/rainbow/conference/v1.0/rooms/:roomId/lowerhand
        let that = this;
        const data = undefined;

        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/conference/v1.0/rooms/" + roomId + "/lowerhand", that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(lowerHandWebinar) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(lowerHandWebinar) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(lowerHandWebinar) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(lowerHandWebinar) error : ", err);
                return reject(err);
            });
        });
    }

    raiseHandWebinar(roomId : string) {
        // put /api/rainbow/conference/v1.0/rooms/:roomId/raisehand
        let that = this;
        const data = undefined;

        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/conference/v1.0/rooms/" + roomId + "/raisehand", that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(raiseHandWebinar) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(raiseHandWebinar) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(raiseHandWebinar) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(raiseHandWebinar) error : ", err);
                return reject(err);
            });
        });
    }
    
    stageDescriptionWebinar(roomId : string, userId : string, type : string, properties : Array<string>) {
        // put /api/rainbow/conference/v1.0/rooms/:roomId/stage
        let that = this;
        const data = undefined;

        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/conference/v1.0/rooms/" + roomId + "/stage", that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(stageDescriptionWebinar) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(stageDescriptionWebinar) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(stageDescriptionWebinar) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(stageDescriptionWebinar) error : ", err);
                return reject(err);
            });
        });
    }

// */

}

let restService = null;

export {RESTConferenceV2};
module.exports.RESTConferenceV2 = RESTConferenceV2;



