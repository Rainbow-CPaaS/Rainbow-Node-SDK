'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/ADLDAP - ";

/**
 * Handles all REST API calls related to AD/LDAP mass provisioning and LDAP connectors.
 */
@logEntryExit(LOG_ID)
class RESTAdLdap extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTAdLdap'; }
    getClassName() { return RESTAdLdap.getClassName(); }
    static getAccessorName() { return 'restadldap'; }
    getAccessorName() { return RESTAdLdap.getAccessorName(); }

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

    //region AD/LDAP
    //region AD/LDAP Massprovisioning

    checkCSVdata(data?: any, companyId?: string, delimiter?: string, comment: string = "%") {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports/check
        // API : https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-CheckCSV
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(checkCSVdata) entry`);
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports/check";
        let urlParamsTab: string[] = [];
        urlParamsTab.push(urlParams);
        addParamToUrl(urlParamsTab, "companyId", companyId);
        addParamToUrl(urlParamsTab, "delimiter", delimiter);
        addParamToUrl(urlParamsTab, "comment", comment);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), data, 'text/csv; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(checkCSVdata) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(checkCSVdata) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(checkCSVdata) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(checkCSVdata) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAnImportStatusReport(reqId: string) {
        // DELETE /api/rainbow/massprovisioning/v1.0/users/imports/:reqId/details
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-DeleteReport
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteAnImportStatusReport) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(deleteAnImportStatusReport) REST reqId : ", reqId);

            that.http.delete("/api/rainbow/massprovisioning/v1.0/users/imports/" + reqId + "/details", that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAnImportStatusReport) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAnImportStatusReport) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAnImportStatusReport) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAnImportStatusReport) error : ", err);
                return reject(err);
            });
        });
    }

    getAnImportStatusReport(reqId?: string, format: string = "full"): any {
        // GET /api/rainbow/massprovisioning/v1.0/users/imports/:reqId/details
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-GetReport
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAnImportStatusReport) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/imports/" + reqId + "/details";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAnImportStatusReport) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAnImportStatusReport) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAnImportStatusReport) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAnImportStatusReport) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAnImportStatusReport) error : ", err);
                return reject(err);
            });
        });
    }

    getAnImportStatus(companyId?: string): any {
        // GET /api/rainbow/massprovisioning/v1.0/directories/imports/:companyId
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-GetDirectoriesImportStatus
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAnImportStatus) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/directories/imports/" + companyId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAnImportStatus) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAnImportStatus) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAnImportStatus) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAnImportStatus) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAnImportStatus) error : ", err);
                return reject(err);
            });
        });
    }

    getInformationOnImports(companyId?: string, ldapConfigId?: string): any {
        // GET /api/rainbow/massprovisioning/v1.0/users/imports
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-GetImports
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getInformationOnImports) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/imports";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "ldapConfigId", ldapConfigId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getInformationOnImports) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getInformationOnImports) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getInformationOnImports) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getInformationOnImports) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getInformationOnImports) error : ", err);
                return reject(err);
            });
        });
    }

    getResultOfStartedOffice365TenantSynchronizationTask(tenant?: string, format: string = "json"): any {
        // GET /api/rainbow/massprovisioning/v1.0/users/synchronizeTask/:tenant
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-SynchronizeTenantTaskGet
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getResultOfStartedOffice365TenantSynchronizationTask) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/synchronizeTask/" + tenant;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getResultOfStartedOffice365TenantSynchronizationTask) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getResultOfStartedOffice365TenantSynchronizationTask) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getResultOfStartedOffice365TenantSynchronizationTask) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getResultOfStartedOffice365TenantSynchronizationTask) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getResultOfStartedOffice365TenantSynchronizationTask) error : ", err);
                return reject(err);
            });
        });
    }

    importCSVData(data?: any, companyId?: string, label: string = "none", noemails: boolean = true, nostrict: boolean = false, delimiter?: string, comment: string = "%") {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports
        // API : https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-ImportCSV
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(importCSVData) entry`);
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports";
        let urlParamsTab: string[] = [];
        urlParamsTab.push(urlParams);
        addParamToUrl(urlParamsTab, "companyId", companyId);
        addParamToUrl(urlParamsTab, "label", label);
        addParamToUrl(urlParamsTab, "noemails", noemails);
        addParamToUrl(urlParamsTab, "nostrict", nostrict);
        addParamToUrl(urlParamsTab, "delimiter", delimiter);
        addParamToUrl(urlParamsTab, "comment", comment);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), data, 'text/csv; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(importCSVData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(importCSVData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(importCSVData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(importCSVData) error : ", err);
                return reject(err);
            });
        });
    }

    startsAsynchronousGenerationOfOffice365TenantUserListSynchronization(tenant?: string) {
        // POST /api/rainbow/massprovisioning/v1.0/users/synchronizeTask/:tenant
        // API : https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-SynchronizeTenantTaskStart
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) entry`);
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/synchronizeTask/" + tenant;
        let urlParamsTab: string[] = [];
        urlParamsTab.push(urlParams);
        // addParamToUrl(urlParamsTab, "comment", comment);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), {}, 'text/csv; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) error : ", err);
                return reject(err);
            });
        });
    }

    synchronizeOffice365TenantUserList(tenant?: string, format: string = "json"): any {
        // GET /api/rainbow/massprovisioning/v1.0/users/synchronize/:tenant
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-SynchronizeTenant
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(synchronizeOffice365TenantUserList) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/synchronize/" + tenant;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(synchronizeOffice365TenantUserList) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(synchronizeOffice365TenantUserList) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(synchronizeOffice365TenantUserList) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(synchronizeOffice365TenantUserList) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(synchronizeOffice365TenantUserList) error : ", err);
                return reject(err);
            });
        });
    }

    checkCSVDataOfSynchronizationUsingRainbowvoiceMode(data?: any, companyId?: string, delimiter?: string, comment: string = "%") {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports/rainbowvoice/check
        // API : https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-CheckRainbowVoiceCSV
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) entry`);
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports/rainbowvoice/check";
        let urlParamsTab: string[] = [];
        urlParamsTab.push(urlParams);
        addParamToUrl(urlParamsTab, "companyId", companyId);
        addParamToUrl(urlParamsTab, "delimiter", delimiter);
        addParamToUrl(urlParamsTab, "comment", comment);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), data, 'text/csv; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) error : ", err);
                return reject(err);
            });
        });
    }

    updateCommandIdStatus(data?: any, commandId?: string) {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/:commandId/report
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateCommandIdStatus) entry`);
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports/synchronize/" + commandId + "/report";
        let urlParamsTab: string[] = [];
        urlParamsTab.push(urlParams);
        // addParamToUrl(urlParamsTab, "companyId", companyId);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCommandIdStatus) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCommandIdStatus) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCommandIdStatus) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCommandIdStatus) error : ", err);
                return reject(err);
            });
        });
    }

    /*
    POST /api/rainbow/massprovisioning/v1.0/users/imports/synchronize?noemails=true with a file containing users and devices
    Remark: "sync" (and/or "delete") action(s) should be used and all the relevant fields from AD should be systematically provided
    A hidden field "ldap_id" corresponding to the AD objectGUID should be filled
    Mandatory field is loginEmail, isInitialized=true
    // */
    synchronizeUsersAndDeviceswithCSV(CSVTxt?: string, companyId?: string, label: string = undefined, noemails: boolean = true, nostrict: boolean = false, delimiter?: string, comment: string = "%", commandId?: string, ldapConfigId?: string): Promise<{
        reqId: string,
        mode: string,
        status: string,
        userId: string,
        displayName: string,
        label: string,
        startTime: string
    }> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(synchronizeUsersAndDeviceswithCSV) entry`);
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports/synchronize";
        let urlParamsTab: string[] = [];
        urlParamsTab.push(urlParams);
        addParamToUrl(urlParamsTab, "companyId", companyId);
        addParamToUrl(urlParamsTab, "label", label);
        addParamToUrl(urlParamsTab, "noemails", String(noemails));
        addParamToUrl(urlParamsTab, "nostrict", String(nostrict));
        addParamToUrl(urlParamsTab, "delimiter", delimiter);
        addParamToUrl(urlParamsTab, "comment", comment);
        addParamToUrl(urlParamsTab, "commandId", commandId);
        addParamToUrl(urlParamsTab, "ldapConfigId", ldapConfigId);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), CSVTxt, 'text/csv; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(synchronizeUsersAndDeviceswithCSV) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(synchronizeUsersAndDeviceswithCSV) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(synchronizeUsersAndDeviceswithCSV) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(synchronizeUsersAndDeviceswithCSV) error : ", err);
                return reject(err);
            });
        });
    }

    // A template can be retrieved from GET /api/rainbow/massprovisioning/v1.0/users/template?mode=useranddevice
    getCSVTemplate(companyId?: string, mode: string = "useranddevice", comment?: string): any {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCSVTemplate) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/template";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "mode", mode);
            addParamToUrl(urlParamsTab, "comment", comment);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCSVTemplate) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCSVTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCSVTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCSVTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCSVTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    // A file can be checked with POST /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check
    checkCSVforSynchronization(CSVTxt, companyId?: string, delimiter?: string, comment: string = "%", commandId?: string): any {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-CheckSynchronizeCSV
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(checkCSVforSynchronization) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "delimiter", delimiter);
            addParamToUrl(urlParamsTab, "comment", comment);
            addParamToUrl(urlParamsTab, "commandId", commandId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(checkCSVforSynchronization) REST url : ", url);

            that.http.post(url, that.getRequestHeader(""), CSVTxt, 'text/csv; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(checkCSVforSynchronization) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(checkCSVforSynchronization) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(checkCSVforSynchronization) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(checkCSVforSynchronization) error : ", err);
                return reject(err);
            });
        });
    }

    getCheckCSVReport(commandId: string) {
        // GET /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check/:commandId/report
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-GetCheckSynchronizeCSV
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCheckCSVReport) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check/" + commandId + "/report";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            //addParamToUrl(urlParamsTab, "commandId", commandId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCheckCSVReport) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCheckCSVReport) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCheckCSVReport) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCheckCSVReport) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCheckCSVReport) error : ", err);
                return reject(err);
            });
        });
    }

    importRainbowVoiceUsersWithCSVdata(companyId: string, label: string = null, noemails: boolean = true, nostrict: boolean = false, delimiter: string = null, comment: string = "%", csvData: string) {
        // POST  https://openrainbow.com/api/rainbow/massprovisioning/v1.0/users/imports/rainbowvoice
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-RainbowVoiceCSV
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(importRainbowVoiceUsersWithCSVdata) entry`);
        return new Promise(function (resolve, reject) {
            // content-type : text/csv; charset=utf-8
            that._logger.log(that.INTERNAL, LOG_ID + "(importRainbowVoiceUsersWithCSVdata) companyId : ", companyId, ", label : ", label, ", noemails : ", noemails, ", nostrict : ", nostrict, ", delimiter : ", delimiter, ", comment : ", comment);
            let url = "/api/rainbow/massprovisioning/v1.0/users/imports/rainbowvoice";

            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "label", label);
            addParamToUrl(urlParamsTab, "noemails", noemails ? "true":"false");
            addParamToUrl(urlParamsTab, "nostrict", nostrict ? "true":"false");
            addParamToUrl(urlParamsTab, "delimiter", delimiter);
            addParamToUrl(urlParamsTab, "comment", comment);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(importRainbowVoiceUsersWithCSVdata) REST url : ", url);

            that.http.post(url, that.getRequestHeader(""), csvData, 'text/csv; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(importRainbowVoiceUsersWithCSVdata) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(importRainbowVoiceUsersWithCSVdata) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(importRainbowVoiceUsersWithCSVdata) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(importRainbowVoiceUsersWithCSVdata) error : ", err);
                return reject(err);
            });
        });
    }

    /* The users already synchronized can be retrieved in csv format with the following API:
            GET /api/rainbow/massprovisioning/v1.0/users/synchronize?ldap_id=true&&format=csv
    the ldap_id field will allow to compare rainbow users and ldap users
    // */
    retrieveRainbowUserList(companyId?: string, format: string = "csv", ldap_id: boolean = true, ldapConfigId?: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveRainbowUserList) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/users/synchronize";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "ldap_id", String(ldap_id));
            addParamToUrl(urlParamsTab, "ldapConfigId", ldapConfigId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveRainbowUserList) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveRainbowUserList) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveRainbowUserList) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveRainbowUserList) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveRainbowUserList) error : ", err);
                return reject(err);
            });
        });
    }

    checkCSVdataForSynchronizeDirectory(delimiter: string, comment: string, commandId: string, csvData: string) {
        // POST  /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/check
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-CheckSynchronizeCSV
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(checkCSVdataForSynchronizeDirectory) entry`);
        return new Promise(function (resolve, reject) {
            // content-type : text/csv; charset=utf-8
            that._logger.log(that.INTERNAL, LOG_ID + "(checkCSVdataForSynchronizeDirectory) delimiter : ", delimiter, ", comment : ", comment, ", commandId : ", commandId);
            let url = "/api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/check";

            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "delimiter", delimiter);
            addParamToUrl(urlParamsTab, "comment", comment);
            addParamToUrl(urlParamsTab, "commandId", commandId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(checkCSVdataForSynchronizeDirectory) REST url : ", url);

            that.http.post(url, that.getRequestHeader(""), csvData, 'text/csv; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(checkCSVdataForSynchronizeDirectory) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(checkCSVdataForSynchronizeDirectory) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(checkCSVdataForSynchronizeDirectory) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(checkCSVdataForSynchronizeDirectory) error : ", err);
                return reject(err);
            });
        });
    }

    importCSVdataForSynchronizeDirectory(delimiter: string, comment: string, commandId: string, label: string, csvData: string, ldapConfigId?: string) {
        // POST  /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-PostSynchronizeData
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(importCSVdataForSynchronizeDirectory) entry`);
        return new Promise(function (resolve, reject) {
            // content-type : text/csv; charset=utf-8
            that._logger.log(that.INTERNAL, LOG_ID + "(importCSVdataForSynchronizeDirectory) delimiter : ", delimiter, ", comment : ", comment, ", commandId : ", commandId, ", label : ", label);
            let url = "/api/rainbow/massprovisioning/v1.0/directories/imports/synchronize";

            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "delimiter", delimiter);
            addParamToUrl(urlParamsTab, "comment", comment);
            addParamToUrl(urlParamsTab, "commandId", commandId);
            addParamToUrl(urlParamsTab, "label", label);
            addParamToUrl(urlParamsTab, "ldapConfigId", ldapConfigId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(importCSVdataForSynchronizeDirectory) REST url : ", url);

            that.http.post(url, that.getRequestHeader(""), csvData, 'text/csv; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(importCSVdataForSynchronizeDirectory) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(importCSVdataForSynchronizeDirectory) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(importCSVdataForSynchronizeDirectory) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(importCSVdataForSynchronizeDirectory) error : ", err);
                return reject(err);
            });
        });
    }

    getCSVReportByCommandId(commandId: string): any {
        // GET /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/:commandId/report
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-PostSynchronizeCSVCommandReport
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCSVReportByCommandId) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/" + commandId + "/report";

            that._logger.log(that.INTERNAL, LOG_ID + "(getCSVReportByCommandId) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCSVReportByCommandId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCSVReportByCommandId) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCSVReportByCommandId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCSVReportByCommandId) error : ", err);
                return reject(err);
            });
        });
    }

    createCSVReportByCommandId(commandId: string, data: any) {
        // POST  /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/:commandId/report
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-PostSynchronizeCSVCommandReport
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createCSVReportByCommandId) entry`);
        return new Promise(function (resolve, reject) {
            // content-type : text/csv; charset=utf-8
            that._logger.log(that.INTERNAL, LOG_ID + "(createCSVReportByCommandId) commandId : ", commandId);
            let url = "/api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/" + commandId + "/report";

            that._logger.log(that.INTERNAL, LOG_ID + "(createCSVReportByCommandId) REST url : ", url);

            that.http.post(url, that.getRequestHeader(""), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createCSVReportByCommandId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createCSVReportByCommandId) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createCSVReportByCommandId) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createCSVReportByCommandId) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveRainbowEntriesList(companyId: string, format: string, ldap_id: boolean): any {
        // GET /api/rainbow/massprovisioning/v1.0/directories/synchronize/
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-SynchronizeDirectories
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveRainbowEntriesList) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/massprovisioning/v1.0/directories/synchronize";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "ldap_id", ldap_id);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveRainbowEntriesList) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveRainbowEntriesList) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveRainbowEntriesList) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveRainbowEntriesList) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveRainbowEntriesList) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Massprovisioning

    //region LDAP APIs to use:

    ActivateALdapConnectorUser(companyId: string = null): Promise<{ id: string, companyId: string, loginEmail: string, password: string }> {
        // API https://api.openrainbow.org/admin/#api-connectors-PostLdapActivate
        // POST /api/rainbow/admin/v1.0/connectors/ldaps/activate

        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(ActivateALdapConnectorUser) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/activate";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(ActivateALdapConnectorUser) REST url : ", url);
            let CSVTxt = undefined;

            that.http.post(url, that.getRequestHeader(), CSVTxt, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(ActivateALdapConnectorUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(ActivateALdapConnectorUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(ActivateALdapConnectorUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(ActivateALdapConnectorUser) error : ", err);
                return reject(err);
            });
        });
    }

    deleteLdapConnector(ldapId: string): Promise<{ status: string }> {
        // API https://api.openrainbow.org/admin/#api-connectors-DeleteLdap
        // DELETE /api/rainbow/admin/v1.0/connectors/ldaps/:ldapId

        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteLdapConnector) entry`);
        return new Promise(function (resolve, reject) {
            if (!ldapId) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteLdapConnector) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(deleteLdapConnector) No ldapId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/admin/v1.0/connectors/ldaps/" + ldapId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteLdapConnector) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteLdapConnector) REST result : " + json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteLdapConnector) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteLdapConnector) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    retrieveAllLdapConnectorUsersData(companyId?: string, format: string = "small", limit: number = 100, offset: number = undefined, sortField: string = "displayName", sortOrder: number = 1) {
        // API https://api.openrainbow.org/admin/#api-connectors-GetLdap
        // GET /api/rainbow/admin/v1.0/connectors/ldaps

        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveAllLdapConnectorUsersData) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", String(limit));
            addParamToUrl(urlParamsTab, "offset", String(offset));
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", String(sortOrder));
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllLdapConnectorUsersData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveAllLdapConnectorUsersData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllLdapConnectorUsersData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveAllLdapConnectorUsersData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveAllLdapConnectorUsersData) error : ", err);
                return reject(err);
            });
        });
    }

    sendCommandToLdapConnectorUser(ldapId: string, command: string, ldapConfigId: string): Promise<any> {
        // API https://api.openrainbow.org/admin/#api-connectors-CommandLdap
        // POST /api/rainbow/admin/v1.0/connectors/ldaps/:ldapId/command

        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(sendCommandToLdapConnectorUser) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/" + ldapId + "/command";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "ldapConfigId", ldapConfigId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(sendCommandToLdapConnectorUser) REST url : ", url);
            let data = {command};

            that.http.post(url, that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(sendCommandToLdapConnectorUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendCommandToLdapConnectorUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(sendCommandToLdapConnectorUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendCommandToLdapConnectorUser) error : ", err);
                return reject(err);
            });
        });
    }

    createConfigurationForLdapConnector(companyId: string, settings: any, name: string, type: string = "ldap_config") {
        // API https://api.openrainbow.org/admin/#api-connectors-PostLdapConfig
        // POST /api/rainbow/admin/v1.0/connectors/ldaps/config

        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createConfigurationForLdapConnector) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/config";
            that._logger.log(that.INTERNAL, LOG_ID + "(createConfigurationForLdapConnector) REST url : ", url);
            let data: any = {companyId, settings, type};

            if (name) {
                data.name = name;
            }

            that.http.post(url, that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(createConfigurationForLdapConnector) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createConfigurationForLdapConnector) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createConfigurationForLdapConnector) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createConfigurationForLdapConnector) error : ", err);
                return reject(err);
            });
        });
    }

    deleteLdapConnectorConfig(ldapConfigId: string): Promise<{ status: string }> {
        // API https://api.openrainbow.org/admin/#api-connectors-DeleteLdapConfig
        // DELETE /api/rainbow/admin/v1.0/connectors/ldaps/config/:ldapConfigId

        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteLdapConnectorConfig) entry`);
        return new Promise(function (resolve, reject) {
            if (!ldapConfigId) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteLdapConnectorConfig) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(deleteLdapConnectorConfig) No ldapId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/admin/v1.0/connectors/ldaps/config/" + ldapConfigId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteLdapConnectorConfig) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteLdapConnectorConfig) REST result : " + json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteLdapConnectorConfig) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteLdapConnectorConfig) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    retrieveLdapConnectorConfig(companyId: string, p_type?: string) {
        // API https://api.openrainbow.org/admin/#api-connectors-GetLdapConfig
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/config

        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveLdapConnectorConfig) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/config";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "type", p_type);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorConfig) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveLdapConnectorConfig) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorConfig) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveLdapConnectorConfig) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveLdapConnectorConfig) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveLdapConnectorConfigTemplate(type: string = "ldap_template") {
        // API https://api.openrainbow.org/admin/#api-connectors-GetLdapTemplate
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/config/template

        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveLdapConnectorConfigTemplate) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/config/template";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "type", type);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorConfigTemplate) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveLdapConnectorConfigTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorConfigTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveLdapConnectorConfigTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveLdapConnectorConfigTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveLdapConnectorAllConfigTemplates() {
        // API https://api.openrainbow.org/admin/#api-connectors-GetAllLdapTemplate
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/config/templates

        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveLdapConnectorAllConfigTemplates) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/config/templates";

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorAllConfigTemplates) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveLdapConnectorAllConfigTemplates) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorAllConfigTemplates) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveLdapConnectorAllConfigTemplates) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveLdapConnectorAllConfigTemplates) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveLdapConnectorAllConfigs(companyId: string, supportMultiDomain: boolean = false) {
        // API https://api.openrainbow.org/admin/#api-connectors-GetAllLdapConfigs
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/configs

        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveLdapConnectorAllConfigs) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/configs";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "supportMultiDomain", supportMultiDomain);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorAllConfigs) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveLdapConnectorAllConfigs) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLdapConnectorAllConfigs) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveLdapConnectorAllConfigs) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveLdapConnectorAllConfigs) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveLDAPConnectorConfigByLdapConfigId(ldapConfigId: string) {
        // API https://api.openrainbow.org/admin/#api-connectors-GetLdapConfigById
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/config/:ldapConfigId

        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveLDAPConnectorConfigByLdapConfigId) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/config/" + ldapConfigId;

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLDAPConnectorConfigByLdapConfigId) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveLDAPConnectorConfigByLdapConfigId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveLDAPConnectorConfigByLdapConfigId) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveLDAPConnectorConfigByLdapConfigId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveLDAPConnectorConfigByLdapConfigId) error : ", err);
                return reject(err);
            });
        });
    }

    updateConfigurationForLdapConnector(ldapConfigId: string, settings: any, strict: boolean, name: string) {
        // API https://api.openrainbow.org/admin/#api-connectors-PutLdapConfig
        // PUT /api/rainbow/admin/v1.0/connectors/ldaps/config/:ldapConfigId

        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateConfigurationForLdapConnector) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/config/" + ldapConfigId;
            that._logger.log(that.INTERNAL, LOG_ID + "(updateConfigurationForLdapConnector) REST url : ", url);
            let params: any = {strict, settings};
            if (name) {
                params.name = name;
            }

            that.http.put(url, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateConfigurationForLdapConnector) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateConfigurationForLdapConnector) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateConfigurationForLdapConnector) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateConfigurationForLdapConnector) error : ", err);
                return reject(err);
            });
        });
    }

    uploadLdapAvatar(binaryImgFile: string, contentType: string = "", ldapId: string = null) {
        // API https://api.openrainbow.org/admin/#api-connectors-uploadLdapAvatar
        // POST /api/rainbow/admin/v1.0/connectors/ldaps/avatar

        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(uploadLdapAvatar) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/avatar" + (ldapId ? "/" + ldapId : "");
            that._logger.log(that.INTERNAL, LOG_ID + "(uploadLdapAvatar) REST url : ", url);
            let data: any = binaryImgFile;

            that.http.post(url, that.getRequestHeader(), data, contentType).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(uploadLdapAvatar) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(uploadLdapAvatar) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(uploadLdapAvatar) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(uploadLdapAvatar) error : ", err);
                return reject(err);
            });
        });
    }

    deleteLdapAvatar(ldapId: string = null) {
        // API https://api.openrainbow.org/admin/#api-connectors-deleteLdapAvatar
        // DELETE /api/rainbow/admin/v1.0/connectors/ldaps/avatar

        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteLdapAvatar) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/ldaps/avatar" + (ldapId ? "/" + ldapId : "");
            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteLdapAvatar) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteLdapAvatar) REST result : " + json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteLdapAvatar) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteLdapAvatar) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion LDAP APIs to use:

    //endregion AD/LDAP

}

module.exports = {'RESTAdLdap': RESTAdLdap};
export {RESTAdLdap as RESTAdLdap};
