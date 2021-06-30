'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService";

const ErrorCase = require('../../common/ErrorManager');
const util = require('util');
const LOG_ID = "REST/CONFV2 - ";

@logEntryExit(LOG_ID)
class RESTConferenceV2 extends GenericRESTService{
    public http: any;
    public logger: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() {
        return 'RESTConferenceV2';
    }

    getClassName() {
        return RESTConferenceV2.getClassName();
    }

    constructor(evtEmitter, logger) {
        super( );

        let that = this;
        that.evtEmitter = evtEmitter;
        that.logger = logger;

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

// conference v2
    addPSTNParticipantToConference(roomId : string, participantPhoneNumber : string, country : string) {
        // post /api/rainbow/conference/v1.0/rooms/:roomId/add
        let that = this;
        const data = {
            participantPhoneNumber,
            country
        };

        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/conference/v1.0/rooms/" + roomId + "/add", that.getPostHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(inviteContactToBubble) successfull");
                that.logger.log("internal", LOG_ID + "(inviteContactToBubble) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(inviteContactToBubble) error");
                that.logger.log("internalerror", LOG_ID, "(inviteContactToBubble) error : ", err);
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

            that.logger.log("internal", LOG_ID + "(snapshotConference) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(snapshotConference) successfull");
                that.logger.log("internal", LOG_ID + "(snapshotConference) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(snapshotConference) error");
                that.logger.log("internalerror", LOG_ID, "(snapshotConference) error : ", err);
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

            that.logger.log("internal", LOG_ID + "(delegateConference) REST url : ", url);
            let data = undefined;

            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {  
                that.logger.log("info", LOG_ID + "(delegateConference) successfull");
                that.logger.log("internal", LOG_ID + "(delegateConference) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(delegateConference) error");
                that.logger.log("internalerror", LOG_ID, "(delegateConference) error : ", err);
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
                that.logger.log("info", LOG_ID + "(removeTagFromAllDirectoryEntries) (" + roomId + ") -- success");
                resolve(response);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(removeTagFromAllDirectoryEntries) (" + roomId + ") -- failure -- ");
                that.logger.log("internalerror", LOG_ID, "(removeTagFromAllDirectoryEntries) (" + roomId + ") -- failure -- ", err.message);
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
                that.logger.log("info", LOG_ID + "(disconnectParticipantFromConference) (" + roomId + ") -- success");
                resolve(response);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(disconnectParticipantFromConference) (" + roomId + ") -- failure -- ");
                that.logger.log("internalerror", LOG_ID, "(disconnectParticipantFromConference) (" + roomId + ") -- failure -- ", err.message);
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

            that.logger.log("internal", LOG_ID + "(getTalkingTimeForAllPparticipantsInConference) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getTalkingTimeForAllPparticipantsInConference) successfull");
                that.logger.log("internal", LOG_ID + "(getTalkingTimeForAllPparticipantsInConference) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getTalkingTimeForAllPparticipantsInConference) error");
                that.logger.log("internalerror", LOG_ID, "(getTalkingTimeForAllPparticipantsInConference) error : ", err);
                return reject(err);
            });
        });
    }
    
    joinConference(roomId : string, mediaType : string, participantPhoneNumber : string, country : string, dc : Array<string>, mute: boolean, microphone : boolean ) {
        // post /api/rainbow/conference/v1.0/rooms/:roomId/join
        let that = this;
        const data = {
            mediaType, 
            participantPhoneNumber, 
            country,
            dc,
            mute, 
            microphone
        };

        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/conference/v1.0/rooms/" + roomId + "/join", that.getPostHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(inviteContactToBubble) successfull");
                that.logger.log("internal", LOG_ID + "(inviteContactToBubble) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(inviteContactToBubble) error");
                that.logger.log("internalerror", LOG_ID, "(inviteContactToBubble) error : ", err);
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

            that.logger.log("internal", LOG_ID + "(pauseRecording) REST url : ", url);
            let data = undefined;

            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(pauseRecording) successfull");
                that.logger.log("internal", LOG_ID + "(pauseRecording) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(pauseRecording) error");
                that.logger.log("internalerror", LOG_ID, "(pauseRecording) error : ", err);
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

            that.logger.log("internal", LOG_ID + "(resumeRecording) REST url : ", url);
            let data = undefined;

            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(resumeRecording) successfull");
                that.logger.log("internal", LOG_ID + "(resumeRecording) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(resumeRecording) error");
                that.logger.log("internalerror", LOG_ID, "(resumeRecording) error : ", err);
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

            that.logger.log("internal", LOG_ID + "(startRecording) REST url : ", url);
            let data = undefined;

            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(startRecording) successfull");
                that.logger.log("internal", LOG_ID + "(startRecording) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(startRecording) error");
                that.logger.log("internalerror", LOG_ID, "(startRecording) error : ", err);
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

            that.logger.log("internal", LOG_ID + "(stopRecording) REST url : ", url);
            let data = undefined;

            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(stopRecording) successfull");
                that.logger.log("internal", LOG_ID + "(stopRecording) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(stopRecording) error");
                that.logger.log("internalerror", LOG_ID, "(stopRecording) error : ", err);
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

            that.logger.log("internal", LOG_ID + "(rejectAVideoConference) REST url : ", url);
            let data = undefined;

            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(rejectAVideoConference) successfull");
                that.logger.log("internal", LOG_ID + "(rejectAVideoConference) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(rejectAVideoConference) error");
                that.logger.log("internalerror", LOG_ID, "(rejectAVideoConference) error : ", err);
                return reject(err);
            });
        });
    }

//Start a PSTN, WebRTC conference or a webinar in a room  () {
    startConferenceOrWebinarInARoom(roomId : string) {
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

            let data = undefined;
            that.logger.log("internal", LOG_ID + "(startConferenceOrWebinarInARoom) args : ", data);
            that.http.post(url, that.getPostHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(startConferenceOrWebinarInARoom) successfull");
                that.logger.log("internal", LOG_ID + "(startConferenceOrWebinarInARoom) REST leave bubble : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(startConferenceOrWebinarInARoom) error.");
                that.logger.log("internalerror", LOG_ID, "(startConferenceOrWebinarInARoom) error : ", err);
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
                        that.logger.log("info", LOG_ID + "(stopConferenceOrWebinar) (" + roomId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(stopConferenceOrWebinar) (" + roomId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(stopConferenceOrWebinar) (" + roomId + ") -- failure -- ", err.message);
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
                that.logger.log("info", LOG_ID + "(inviteContactToBubble) successfull");
                that.logger.log("internal", LOG_ID + "(inviteContactToBubble) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(inviteContactToBubble) error");
                that.logger.log("internalerror", LOG_ID, "(inviteContactToBubble) error : ", err);
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
                that.logger.log("info", LOG_ID + "(updatePSTNParticipantParameters) successfull");
                that.logger.log("internal", LOG_ID + "(updatePSTNParticipantParameters) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updatePSTNParticipantParameters) error");
                that.logger.log("internalerror", LOG_ID, "(updatePSTNParticipantParameters) error : ", err);
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
                that.logger.log("info", LOG_ID + "(updateConferenceParameters) successfull");
                that.logger.log("internal", LOG_ID + "(updateConferenceParameters) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateConferenceParameters) error");
                that.logger.log("internalerror", LOG_ID, "(updateConferenceParameters) error : ", err);
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
                that.logger.log("info", LOG_ID + "(updateConferenceParameters) successfull");
                that.logger.log("internal", LOG_ID + "(updateConferenceParameters) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateConferenceParameters) error");
                that.logger.log("internalerror", LOG_ID, "(updateConferenceParameters) error : ", err);
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
                that.logger.log("info", LOG_ID + "(allowTalkWebinar) successfull");
                that.logger.log("internal", LOG_ID + "(allowTalkWebinar) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(allowTalkWebinar) error");
                that.logger.log("internalerror", LOG_ID, "(allowTalkWebinar) error : ", err);
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
                that.logger.log("info", LOG_ID + "(disableTalkWebinar) successfull");
                that.logger.log("internal", LOG_ID + "(disableTalkWebinar) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(disableTalkWebinar) error");
                that.logger.log("internalerror", LOG_ID, "(disableTalkWebinar) error : ", err);
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
                that.logger.log("info", LOG_ID + "(lowerHandWebinar) successfull");
                that.logger.log("internal", LOG_ID + "(lowerHandWebinar) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(lowerHandWebinar) error");
                that.logger.log("internalerror", LOG_ID, "(lowerHandWebinar) error : ", err);
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
                that.logger.log("info", LOG_ID + "(raiseHandWebinar) successfull");
                that.logger.log("internal", LOG_ID + "(raiseHandWebinar) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(raiseHandWebinar) error");
                that.logger.log("internalerror", LOG_ID, "(raiseHandWebinar) error : ", err);
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
                that.logger.log("info", LOG_ID + "(stageDescriptionWebinar) successfull");
                that.logger.log("internal", LOG_ID + "(stageDescriptionWebinar) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(stageDescriptionWebinar) error");
                that.logger.log("internalerror", LOG_ID, "(stageDescriptionWebinar) error : ", err);
                return reject(err);
            });
        });
    }

// */

}

let restService = null;

export {RESTConferenceV2};
module.exports.RESTConferenceV2 = RESTConferenceV2;



