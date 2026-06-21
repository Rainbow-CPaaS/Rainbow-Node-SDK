'use strict';

import {addParamToUrl, addPropertyIfNotAlreadyExistToObj, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/CAL - ";

/**
 * Handles all REST API calls related to Calendar, MS Teams Presence, and Calendar Provider notification.
 */
@logEntryExit(LOG_ID)
class RESTCalendar extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTCalendar'; }
    getClassName() { return RESTCalendar.getClassName(); }
    static getAccessorName() { return 'restcalendar'; }
    getAccessorName() { return RESTCalendar.getAccessorName(); }

    constructor(_core, evtEmitter, _logger) {
        super(_core, _logger, LOG_ID);
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
            resolve(undefined);
        });
    }

    //region calendar

    getCalendarState() {
        // GET /api/rainbow/calendar/v1.0
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCalendarState) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(getCalendarState) REST params : ", params);

            that.http.get("/api/rainbow/calendar/v1.0", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCalendarState) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCalendarState) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCalendarState) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCalendarState) error : ", err);
                return reject(err);
            });
        });
    }

    getCalendarStates(users: Array<string> = [undefined]) {
        // POST /api/rainbow/calendar/v1.0/states
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCalendarStates) entry`);
        let params = { users };

        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/calendar/v1.0/states", that.getRequestHeader(), params, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCalendarStates) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCalendarStates) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCalendarStates) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCalendarStates) error : ", err);
                return reject(err);
            });
        });
    }

    setCalendarRegister(type?: string, redirect?: boolean, callbackUrl?: string) {
        // POST /api/rainbow/calendar/v1.0/register
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(setCalendarRegister) entry`);
        let params = {
            type,
            redirect,
            callback: callbackUrl
        };

        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/calendar/v1.0/register", that.getRequestHeader(), params, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setCalendarRegister) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setCalendarRegister) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setCalendarRegister) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setCalendarRegister) error : ", err);
                return reject(err);
            });
        });
    }

    getCalendarAutomaticReplyStatus(userid?: string) {
        // GET /api/rainbow/calendar/v1.0
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCalendarAutomaticReplyStatus) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/calendar/v1.0/automatic_reply";
            if (userid) {
                url += "?userid =" + userid;
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(getCalendarAutomaticReplyStatus) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCalendarAutomaticReplyStatus) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCalendarAutomaticReplyStatus) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCalendarAutomaticReplyStatus) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCalendarAutomaticReplyStatus) error : ", err);
                return reject(err);
            });
        });
    }

    // @deprecated
    enableOrNotCalendar(disable: boolean) {
        // PATCH /api/rainbow/calendar/v1.0
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(enableOrNotCalendar) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = { disable };

            that._logger.log(that.INTERNAL, LOG_ID + "(enableOrNotCalendar) REST params : ", params);

            that.http.patch("/api/rainbow/calendar/v1.0", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(enableOrNotCalendar) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(enableOrNotCalendar) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(enableOrNotCalendar) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(enableOrNotCalendar) error : ", err);
                return reject(err);
            });
        });
    }

    controlCalendarOrIgnoreAnEntry(disable?: boolean, ignore?: string) {
        // API https://api.openrainbow.org/calendar/#api-Calendar-ControlCalendar
        // PUT /api/rainbow/calendar/v1.0/control
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(controlCalendarOrIgnoreAnEntry) entry`);
        return new Promise(function (resolve, reject) {
            let urlParams = "/api/rainbow/calendar/v1.0/control";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(urlParams);
            addParamToUrl(urlParamsTab, "disable", disable);
            addParamToUrl(urlParamsTab, "ignore", ignore);
            urlParams = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(controlCalendarOrIgnoreAnEntry) REST url : ", urlParams);

            let params = {};

            that.http.put(urlParams, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(controlCalendarOrIgnoreAnEntry) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(controlCalendarOrIgnoreAnEntry) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(controlCalendarOrIgnoreAnEntry) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(controlCalendarOrIgnoreAnEntry) error : ", err);
                return reject(err);
            });
        });
    }

    unregisterCalendar() {
        // API https://api.openrainbow.org/calendar/#api-Calendar-UnregisterCalendar
        // DELETE /api/rainbow/calendar/v1.0
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(unregisterCalendar) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(unregisterCalendar) REST ");

            that.http.delete("/api/rainbow/calendar/v1.0", that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(unregisterCalendar) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(unregisterCalendar) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(unregisterCalendar) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(unregisterCalendar) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion calendar

    //region MSTeams

    controlMsteamsPresence(disable?: boolean, ignore?: string) {
        // API https://api.openrainbow.org/msteamspresence/#api-msteamspresence-ControlPresence
        // PUT /api/rainbow/msteamspresence/v1.0/control
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(controlMsteamsPresence) entry`);
        return new Promise(function (resolve, reject) {
            let urlParams = "/api/rainbow/msteamspresence/v1.0/control";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(urlParams);
            addParamToUrl(urlParamsTab, "disable", disable);
            addParamToUrl(urlParamsTab, "ignore", ignore);
            urlParams = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(controlMsteamsPresence) REST url : ", urlParams);

            let params = {};

            that.http.put(urlParams, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(controlMsteamsPresence) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(controlMsteamsPresence) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(controlMsteamsPresence) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(controlMsteamsPresence) error : ", err);
                return reject(err);
            });
        });
    }

    getMsteamsPresenceState(userId: string) {
        // API https://api.openrainbow.org/msteamspresence/#api-msteamspresence-GetPresence
        // GET /api/rainbow/msteamspresence/v1.0
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getMsteamsPresenceState) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/msteamspresence/v1.0";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "userid", userId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getMsteamsPresenceState) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getMsteamsPresenceState) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getMsteamsPresenceState) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getMsteamsPresenceState) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getMsteamsPresenceState) error : ", err);
                return reject(err);
            });
        });
    }

    getMsteamsPresenceStates(users: Array<string> = []) {
        // API : https://api.openrainbow.org/msteamspresence/#api-msteamspresence-GetPresences
        // POST /api/rainbow/msteamspresence/v1.0/states
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getMsteamsPresenceStates) entry`);
        let urlParams = "/api/rainbow/msteamspresence/v1.0/states";
        let data = {users};

        return new Promise(function (resolve, reject) {
            that.http.post(urlParams, that.getRequestHeader(""), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getMsteamsPresenceStates) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getMsteamsPresenceStates) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getMsteamsPresenceStates) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getMsteamsPresenceStates) error : ", err);
                return reject(err);
            });
        });
    }

    registerMsteamsPresenceSharing(redirect?: boolean, callback?: string) {
        // API : https://api.openrainbow.org/msteamspresence/#api-msteamspresence-registerPresence
        // POST /api/rainbow/msteamspresence/v1.0/register
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(registerMsteamsPresenceSharing) entry`);
        let urlParams = "/api/rainbow/msteamspresence/v1.0/register";
        let data = {redirect, callback};

        return new Promise(function (resolve, reject) {
            that.http.post(urlParams, that.getRequestHeader(""), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(registerMsteamsPresenceSharing) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(registerMsteamsPresenceSharing) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(registerMsteamsPresenceSharing) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(registerMsteamsPresenceSharing) error : ", err);
                return reject(err);
            });
        });
    }

    unregisterMsteamsPresenceSharing() {
        // API https://api.openrainbow.org/msteamspresence/#api-msteamspresence-unregisterPresence
        // DELETE /api/rainbow/msteamspresence/v1.0
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(unregisterMsteamsPresenceSharing) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(unregisterMsteamsPresenceSharing) REST.");

            that.http.delete("/api/rainbow/msteamspresence/v1.0", that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(unregisterMsteamsPresenceSharing) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(unregisterMsteamsPresenceSharing) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(unregisterMsteamsPresenceSharing) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(unregisterMsteamsPresenceSharing) error : ", err);
                return reject(err);
            });
        });
    }

    activateMsteamsPresence() {
        // API : https://api.openrainbow.org/msteamspresence/#api-msteamspresence-activatePresence
        // POST /api/rainbow/msteamspresence/v1.0/activate
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(activateMsteamsPresence) entry`);
        let urlParams = "/api/rainbow/msteamspresence/v1.0/activate";
        let data = {};

        return new Promise(function (resolve, reject) {
            that.http.post(urlParams, that.getRequestHeader(""), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(activateMsteamsPresence) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(activateMsteamsPresence) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(activateMsteamsPresence) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(activateMsteamsPresence) error : ", err);
                return reject(err);
            });
        });
    }

    deactivateMsteamsPresence() {
        // API https://api.openrainbow.org/msteamspresence/#api-msteamspresence-deactivatePresence
        // DELETE /api/rainbow/msteamspresence/v1.0/activate
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deactivateMsteamsPresence) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(deactivateMsteamsPresence) REST.");

            that.http.delete("/api/rainbow/msteamspresence/v1.0/activate", that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deactivateMsteamsPresence) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deactivateMsteamsPresence) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deactivateMsteamsPresence) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deactivateMsteamsPresence) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion MSTeams

    //region Presence Synchronize CPE Exchange Calendar [AD/LDAP]
    // RQRAINB-12269 VBR

    /**
     * Notifies the calendar provider of user IDs.
     * @param {Array<string>} ids - User IDs to notify.
     * @param {any} headers - Extra request headers.
     * @param {boolean} forceNotify - Force notification flag.
     * @param {string} userId - Injected from RESTService (current user ID).
     * @param {any} httpOptions - Injected from RESTService (http connection options).
     * @param {string} companyId - Injected from RESTService (current user company ID).
     * @returns {Promise<any>}
     */
    notifyCalendarProvider(ids: Array<string>, headers: any = {}, forceNotify: boolean = undefined,
                           userId: string, httpOptions: any, companyId: string) {
        // POST /api/rainbow/calendarprovider/v1.0/notify
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(notifyCalendarProvider) entry`);

        return new Promise(function (resolve, reject) {
            let serverURL = httpOptions?.protocol + "://" + httpOptions?.host + ":" + httpOptions?.port;
            let url: string = serverURL + "/api/rainbow/calendarprovider/v1.0/notify";
            let urlParamsTab: Array<string> = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "force", forceNotify, false);
            url = urlParamsTab[0];

            let defaultHeaders = that.getDefaultHeader();
            Object.entries(defaultHeaders).forEach(([key, value]) => {
                addPropertyIfNotAlreadyExistToObj(headers, key, value, true);
            });
            addPropertyIfNotAlreadyExistToObj(headers, "Content-Type", 'application/json', true);
            addPropertyIfNotAlreadyExistToObj(headers, "X-Rainbow-EWS-connector", 'dummy', true);

            let body = JSON.stringify({"value": ids});

            that.http.postUrlRaw(url, headers, body).then((res) => {
                let json = res?.body;
                that._logger.log(that.DEBUG, LOG_ID + "(notifyCalendarProvider) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(notifyCalendarProvider) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(notifyCalendarProvider) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(notifyCalendarProvider) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Presence Synchronize CPE Exchange Calendar [AD/LDAP]

}

module.exports = {'RESTCalendar': RESTCalendar};
export {RESTCalendar as RESTCalendar};
