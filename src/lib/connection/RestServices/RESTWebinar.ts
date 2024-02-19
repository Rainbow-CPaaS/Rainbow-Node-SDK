'use strict';

import {addParamToUrl, cleanEmptyMembersFromObject, logEntryExit, stackTrace} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService";
import {LevelInterface} from "../../common/LevelInterface.js";

const ErrorCase = require('../../common/ErrorManager');
const util = require('util');
const LOG_ID = "REST/WEBINAR - ";

@logEntryExit(LOG_ID)
class RESTWebinar extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() {
        return 'RESTWebinar';
    }

    getClassName() {
        return RESTWebinar.getClassName();
    }

    constructor(evtEmitter, _logger) {
        super(_logger, LOG_ID);
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
            that._logger.log(that.INTERNAL, LOG_ID + "(createWebinar) args : ", data);
            that.http.post(url, that.getPostHeader(), JSON.stringify(data), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createWebinar) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createWebinar) REST leave bubble : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createWebinar) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createWebinar) error : ", err);
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
            that._logger.log(that.INTERNAL, LOG_ID + "(createWebinar) args : ", data);
            that.http.put(url, that.getPostHeader(), JSON.stringify(data), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createWebinar) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createWebinar) REST leave bubble : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createWebinar) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createWebinar) error : ", err);
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

            that._logger.log(that.INTERNAL, LOG_ID + "(getWebinarData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getWebinarData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getWebinarData) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getWebinarData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getWebinarData) error : ", err);
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

            that._logger.log(that.INTERNAL, LOG_ID + "(getWebinarsData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getWebinarsData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getWebinarsData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getWebinarsData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getWebinarsData) error : ", err);
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
            that._logger.log(that.INTERNAL, LOG_ID + "(warnWebinarModerators) args : ", data);
            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(warnWebinarModerators) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(warnWebinarModerators) REST leave bubble : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(warnWebinarModerators) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(warnWebinarModerators) error : ", err);
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
            that._logger.log(that.INTERNAL, LOG_ID + "(publishAWebinarEvent) args : ", data);
            that.http.put(url, that.getPostHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(publishAWebinarEvent) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(publishAWebinarEvent) REST leave bubble : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(publishAWebinarEvent) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(publishAWebinarEvent) error : ", err);
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
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteWebinar) (" + webinarId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteWebinar) (" + webinarId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteWebinar) (" + webinarId + ") -- failure -- ", err.message);
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



