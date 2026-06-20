'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/CLVR - ";

/**
 * Handles all REST API calls related to client version management.
 */
@logEntryExit(LOG_ID)
class RESTClientsVersions extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTClientsVersions'; }
    getClassName() { return RESTClientsVersions.getClassName(); }
    static getAccessorName() { return 'restclientsversions'; }
    getAccessorName() { return RESTClientsVersions.getAccessorName(); }

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

    //region Clients Versions

    createAClientVersion(id: string, version: string) {
        // POST  https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions
        // API https://api.openrainbow.org/admin/#api-clients_versions-PostClientsVersions
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createAClientVersion) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(createAClientVersion) id : ", id, ", version : ", version);
            let data = { id, version };
            that.http.post("/api/rainbow/admin/v1.0/clientsversions", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createAClientVersion) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createAClientVersion) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createAClientVersion) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createAClientVersion) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAClientVersion(clientId: string) {
        // DELETE https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions/:clientId
        // API https://api.openrainbow.org/admin/#api-clients_versions-DeleteClientsVersions
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteAClientVersion) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/admin/v1.0/clientsversions/" + clientId, that.getRequestHeader())
                .then((response) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteAClientVersion) (" + clientId + ") -- success");
                    resolve(response);
                })
                .catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteAClientVersion) (" + clientId + ") -- failure");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAClientVersion) (" + clientId + ") -- failure : ", err.message);
                    return reject(err);
                });
        });
    }

    getAClientVersionData(clientId: string) {
        // GET  https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions/:clientId
        // API https://api.openrainbow.org/admin/#api-clients_versions-GetClientsVersionsId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAClientVersionData) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/clientsversions/" + clientId;
            that._logger.log(that.INTERNAL, LOG_ID + "(getAClientVersionData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAClientVersionData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAClientVersionData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAClientVersionData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAClientVersionData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllClientsVersions(name?: string, typeClient?: string, limit: number = 100, offset?: number, sortField: string = "name", sortOrder: number = 1) {
        // GET  https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions
        // API https://api.openrainbow.org/admin/#api-clients_versions-GetClientsversions
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllClientsVersions) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/clientsversions";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (name) addParamToUrl(urlParamsTab, "name", name + "");
            if (typeClient) addParamToUrl(urlParamsTab, "type", typeClient + "");
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllClientsVersions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllClientsVersions) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllClientsVersions) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllClientsVersions) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllClientsVersions) error : ", err);
                return reject(err);
            });
        });
    }

    updateAClientVersion(clientId: string, version: string) {
        // PUT  https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions/:clientId
        // API https://api.openrainbow.org/admin/#api-clients_versions-PutClientsVersions
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateAClientVersion) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateAClientVersion) clientId : ", clientId + ", version : ", version);
            let data = { version };
            that.http.put("/api/rainbow/admin/v1.0/clientsversions/" + clientId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateAClientVersion) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateAClientVersion) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateAClientVersion) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateAClientVersion) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Clients Versions

}

module.exports = {'RESTClientsVersions': RESTClientsVersions};
export {RESTClientsVersions as RESTClientsVersions};
