'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/SITE - ";

/**
 * Handles all REST API calls related to site management.
 */
@logEntryExit(LOG_ID)
class RESTSites extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTSites'; }
    getClassName() { return RESTSites.getClassName(); }
    static getAccessorName() { return 'restsites'; }
    getAccessorName() { return RESTSites.getAccessorName(); }

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

    //region sites

    createASite(name: string, status: string, companyId: string) {
        // POST  https://openrainbow.com/api/rainbow/admin/v1.0/sites
        // POST /api/rainbow/admin/v1.0/sites
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createASite) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(createASite) name : ", name + ", status : ", status, ", companyId : " + companyId);
            let data = { name, status, companyId };
            that.http.post("/api/rainbow/admin/v1.0/sites", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createASite) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createASite) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createASite) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createASite) error : ", err);
                return reject(err);
            });
        });
    }

    deleteSite(siteId: string) {
        // DELETE https://openrainbow.com/api/rainbow/admin/v1.0/sites/{siteId}
        // DELETE /api/rainbow/admin/v1.0/sites/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteSite) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/admin/v1.0/sites/" + siteId, that.getRequestHeader())
                .then((response) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteSite) (" + siteId + ") -- success");
                    resolve(response);
                })
                .catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteSite) (" + siteId + ") -- failure");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteSite) (" + siteId + ") -- failure : ", err.message);
                    return reject(err);
                });
        });
    }

    getSiteData(siteId: string) {
        // GET  https://openrainbow.com/api/rainbow/admin/v1.0/sites/{siteId}
        // GET /api/rainbow/admin/v1.0/sites/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getSiteData) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/sites/" + siteId;
            that._logger.log(that.INTERNAL, LOG_ID + "(getSiteData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getSiteData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getSiteData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getSiteData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getSiteData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllSites(format = "small", limit = 100, offset = 0, sortField = "name", sortOrder: number, name: string, companyId: string) {
        // GET  https://openrainbow.com/api/rainbow/admin/v1.0/sites
        // GET /api/rainbow/admin/v1.0/sites/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllSites) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/sites";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllSites) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllSites) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllSites) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllSites) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllSites) error : ", err);
                return reject(err);
            });
        });
    }

    updateSite(siteId: string, name: string, status: string, companyId: string) {
        // PUT https://openrainbow.com/api/rainbow/admin/v1.0/sites/:siteId
        // PUT /api/rainbow/admin/v1.0/sites/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateSite) entry`);
        let data = { name, status, companyId };
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/admin/v1.0/sites/" + siteId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateSite) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateSite) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateSite) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateSite) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion sites

}

module.exports = {'RESTSites': RESTSites};
export {RESTSites as RESTSites};
