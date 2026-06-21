'use strict';

import {logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/SETT - ";

/**
 * Handles all REST API calls related to user settings.
 */
@logEntryExit(LOG_ID)
class RESTSettings extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTSettings'; }
    getClassName() { return RESTSettings.getClassName(); }
    static getAccessorName() { return 'restsettings'; }
    getAccessorName() { return RESTSettings.getAccessorName(); }

    constructor(_core, evtEmitter, _logger) {
        super(_core, _logger, LOG_ID);
        this.setLogLevels(this);
        this._logger = _logger;
    }

    start(http) {
        return new Promise((resolve) => {
            this.http = http;
            resolve(undefined);
        });
    }

    stop() {
        return new Promise((resolve) => { resolve(undefined); });
    }

    //region Settings

    getUserSettings(accountId: string) {
        // GET /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getUserSettings) entry`);
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + accountId + "/settings", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getUserSettings) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getUserSettings) REST result : ", json);
                resolve(json?.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(getUserSettings) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getUserSettings) error : ", err);
                return reject(err);
            });
        });
    }

    updateUserSettings(accountId: string, settings) {
        // PUT /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateUserSettings) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + accountId + "/settings", that.getRequestHeader(), settings, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateUserSettings) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateUserSettings) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateUserSettings) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateUserSettings) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Settings

}

module.exports = {'RESTSettings': RESTSettings};
export {RESTSettings as RESTSettings};
