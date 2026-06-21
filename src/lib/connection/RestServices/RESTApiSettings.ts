'use strict';

import {logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/APIS - ";

/**
 * Handles all REST API calls related to Rainbow API settings.
 */
@logEntryExit(LOG_ID)
class RESTApiSettings extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTApiSettings'; }
    getClassName() { return RESTApiSettings.getClassName(); }
    static getAccessorName() { return 'restapisettings'; }
    getAccessorName() { return RESTApiSettings.getAccessorName(); }

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

    //region Rainbow APIs Settings

    getApisSettings() {
        // GET  https://api.openrainbow.org/api/rainbow/enduser/v1.0/settings/apis
        // API https://api.openrainbow.org/enduser/#api-settings_apis-getApisSettings
        // GET /api/rainbow/enduser/v1.0/settings/apis
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getApisSettings) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/settings/apis";
            that._logger.log(that.INTERNAL, LOG_ID + "(getApisSettings) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getApisSettings) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getApisSettings) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getApisSettings) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getApisSettings) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow APIs Settings

}

module.exports = {'RESTApiSettings': RESTApiSettings};
export {RESTApiSettings as RESTApiSettings};
