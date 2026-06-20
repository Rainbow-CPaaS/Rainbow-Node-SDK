'use strict';

import {logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/CTRY - ";

/**
 * Handles all REST API calls related to countries data.
 */
@logEntryExit(LOG_ID)
class RESTCountry extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTCountry'; }
    getClassName() { return RESTCountry.getClassName(); }
    static getAccessorName() { return 'restcountry'; }
    getAccessorName() { return RESTCountry.getAccessorName(); }

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

    //region Country

    getListOfCountries() {
        // API https://api.openrainbow.org/enduser/#api-countries-getCountries
        // GET /api/rainbow/enduser/v1.0/countries
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getListOfCountries) entry`);
        return new Promise((resolve, reject) => {
            let url: string = "/api/rainbow/enduser/v1.0/countries";
            that._logger.log(that.INTERNAL, LOG_ID + "(getListOfCountries) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined, "").then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getListOfCountries) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getListOfCountries) REST result : ", JSON.stringify(json));
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getListOfCountries) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getListOfCountries) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Country

}

module.exports = {'RESTCountry': RESTCountry};
export {RESTCountry as RESTCountry};
