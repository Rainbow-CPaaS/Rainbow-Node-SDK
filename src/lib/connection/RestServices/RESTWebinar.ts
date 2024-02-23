'use strict';

import {addParamToUrl, cleanEmptyMembersFromObject, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService";

const ErrorCase = require('../../common/ErrorManager');
const util = require('util');
const LOG_ID = "REST/WEBINAR - ";

@logEntryExit(LOG_ID)
class RESTWebinar extends GenericRESTService{
    public http: any;
    public logger: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() {
        return 'RESTWebinar';
    }

    getClassName() {
        return RESTWebinar.getClassName();
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

    //region Webinar

    createWebinar(name : string,
                  subject : string,
                  waitingRoomStartDate: Date,
                  webinarStartDate : Date,
                  webinarEndDate : Date,
                  reminderDates : Array<Date>,
                  timeZone : string,
                  register : boolean,
                  approvalRegistrationMethod : string,
                  passwordNeeded : boolean,
                  isOrganizer : boolean,
                  waitingRoomMultimediaURL : Array<string>,
                  stageBackground : string,
                  chatOption : string ) {
        // POST  https://openrainbow.com/api/rainbow/webinar/v1.0/webinars
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/webinar/v1.0/webinars";
            /*let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "label", label);
            url = urlParamsTab[0];
            // */

            let data = {name,
                subject,
                waitingRoomStartDate,
                webinarStartDate,
                webinarEndDate,
                reminderDates,
                timeZone,
                register,
                approvalRegistrationMethod,
                passwordNeeded,
                isOrganizer,
                waitingRoomMultimediaURL,
                stageBackground,
                chatOption};
            cleanEmptyMembersFromObject(data);
            that.logger.log("internal", LOG_ID + "(createWebinar) args : ", data);
            that.http.post(url, that.getPostHeader(), JSON.stringify(data), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(createWebinar) successfull");
                that.logger.log("internal", LOG_ID + "(createWebinar) REST leave bubble : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createWebinar) error.");
                that.logger.log("internalerror", LOG_ID, "(createWebinar) error : ", err);
                return reject(err);
            });
        });
        
    }
    
    updateWebinar(webinarId : string,
                  name : string,
                  subject : string,
                  waitingRoomStartDate: Date,
                  webinarStartDate : Date,
                  webinarEndDate : Date,
                  reminderDates : Array<Date>,
                  timeZone : string,
                  register : boolean,
                  approvalRegistrationMethod : string,
                  passwordNeeded : boolean,
                  isOrganizer : boolean,
                  waitingRoomMultimediaURL : Array<string>,
                  stageBackground : string,
                  chatOption : string) {
        // PUT  https://openrainbow.com/api/rainbow/webinar/v1.0/webinars/:webinarId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/webinar/v1.0/webinars/" + webinarId;
            /*let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "label", label);
            url = urlParamsTab[0];
            // */

            let data = {name,
                subject,
                waitingRoomStartDate,
                webinarStartDate,
                webinarEndDate,
                reminderDates,
                timeZone,
                register,
                approvalRegistrationMethod,
                passwordNeeded,
                isOrganizer,
                waitingRoomMultimediaURL,
                stageBackground,
                chatOption};
            cleanEmptyMembersFromObject(data);
            if (Array.isArray(reminderDates) && reminderDates.length == 0 ) {
                delete data["reminderDates"];
            }
            that.logger.log("internal", LOG_ID + "(createWebinar) args : ", data);
            that.http.put(url, that.getPostHeader(), JSON.stringify(data), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(createWebinar) successfull");
                that.logger.log("internal", LOG_ID + "(createWebinar) REST leave bubble : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createWebinar) error.");
                that.logger.log("internalerror", LOG_ID, "(createWebinar) error : ", err);
                return reject(err);
            });
        });
    }
    
    getWebinarData(webinarId : string ) {
        // GET  https://openrainbow.com/api/rainbow/webinar/v1.0/webinars/:webinarId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/webinar/v1.0/webinars/" + webinarId ;
            /*let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "role", role );
            url = urlParamsTab[0];
            // */

            that.logger.log("internal", LOG_ID + "(getWebinarData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("debug", LOG_ID + "(getWebinarData) successfull");
                that.logger.log("internal", LOG_ID + "(getWebinarData) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getWebinarData) error");
                that.logger.log("internalerror", LOG_ID, "(getWebinarData) error : ", err);
                return reject(err);
            });
        });
    }
    
    getWebinarsData(role  : string) {
        // GET  https://openrainbow.com/api/rainbow/webinar/v1.0/webinars
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/webinar/v1.0/webinars/" ;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "role", role );
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getWebinarsData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("debug", LOG_ID + "(getWebinarsData) successfull");
                that.logger.log("internal", LOG_ID + "(getWebinarsData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getWebinarsData) error");
                that.logger.log("internalerror", LOG_ID, "(getWebinarsData) error : ", err);
                return reject(err);
            });
        });
    }
    
    warnWebinarModerators(webinarId : string) {
        // PUT  https://openrainbow.com/api/rainbow/webinar/v1.0/webinars/:webinarId/warn-moderators
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/webinar/v1.0/webinars/" + webinarId + "/warn-moderators";
            /*let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "label", label);
            url = urlParamsTab[0];
            // */

            let data = undefined;
            that.logger.log("internal", LOG_ID + "(warnWebinarModerators) args : ", data);
            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(warnWebinarModerators) successfull");
                that.logger.log("internal", LOG_ID + "(warnWebinarModerators) REST leave bubble : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(warnWebinarModerators) error.");
                that.logger.log("internalerror", LOG_ID, "(warnWebinarModerators) error : ", err);
                return reject(err);
            });
        });
    }
    
    publishAWebinarEvent(webinarId : string) {
        // PUT  https://openrainbow.com/api/rainbow/webinar/v1.0/webinars/:webinarId/publish
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/webinar/v1.0/webinars/" + webinarId + "/publish";
            /*let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "label", label);
            url = urlParamsTab[0];
            // */

            let data = undefined;
            that.logger.log("internal", LOG_ID + "(publishAWebinarEvent) args : ", data);
            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(publishAWebinarEvent) successfull");
                that.logger.log("internal", LOG_ID + "(publishAWebinarEvent) REST leave bubble : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(publishAWebinarEvent) error.");
                that.logger.log("internalerror", LOG_ID, "(publishAWebinarEvent) error : ", err);
                return reject(err);
            });
        });
    }
    
    deleteWebinar(webinarId : string) {
        // DELETE https://openrainbow.com/api/rainbow/webinar/v1.0/webinars/:webinarId     
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/webinar/v1.0/webinars/" + webinarId;
            /*let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "tag", tag);
            url = urlParamsTab[0];
            // */

            that.http.delete(url, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("debug", LOG_ID + "(deleteWebinar) (" + webinarId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(deleteWebinar) (" + webinarId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(deleteWebinar) (" + webinarId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }
    
    //endregion Webinar
// */

}

let restService = null;

export {RESTWebinar};
module.exports.RESTWebinar = RESTWebinar;



