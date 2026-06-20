'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/SYST - ";

/**
 * Handles all REST API calls related to systems, PCG PBXs, and phone number management.
 */
@logEntryExit(LOG_ID)
class RESTSystems extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTSystems'; }
    getClassName() { return RESTSystems.getClassName(); }
    static getAccessorName() { return 'restsystems'; }
    getAccessorName() { return RESTSystems.getAccessorName(); }

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

    //region systems

    createSystem(name: string, pbxId: string = undefined, pbxLdapId: string = undefined, siteId: string, type: string, country: string, version ?: string,
                 serverPingTimeout ?: number, pbxMainBundlePrefix ?: Array<string>, usePbxMainBundlePrefix ?: boolean, pbxNumberingTranslator ?: Array<any>,
                 pbxNationalPrefix ?: string, pbxInternationalPrefix ?: string, searchResultOrder ?: Array<string>, activationCode ?: string, isCentrex ?: boolean,
                 isShared ?: boolean, bpId ?: string, isOxoManaged ?: boolean) {
        // API https://api.openrainbow.org/admin/#api-systems-PostSystems
        // POST /api/rainbow/admin/v1.0/systems
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createSystem) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(createSystem) name : ", name + ", pbxId : ", pbxId);
            let data: any = { name };
            if (pbxId) data.pbxId = pbxId;
            if (pbxLdapId) data.pbxLdapId = pbxLdapId;
            if (siteId) data.siteId = siteId;
            if (type) data.type = type;
            if (country) data.country = country;
            if (version) data.version = version;
            if (serverPingTimeout) data.serverPingTimeout = serverPingTimeout;
            if (pbxMainBundlePrefix) data.pbxMainBundlePrefix = pbxMainBundlePrefix;
            if (usePbxMainBundlePrefix) data.usePbxMainBundlePrefix = usePbxMainBundlePrefix;
            if (pbxNumberingTranslator) data.pbxNumberingTranslator = pbxNumberingTranslator;
            if (pbxNationalPrefix) data.pbxNationalPrefix = pbxNationalPrefix;
            if (pbxInternationalPrefix) data.pbxInternationalPrefix = pbxInternationalPrefix;
            if (searchResultOrder) data.searchResultOrder = searchResultOrder;
            if (activationCode) data.activationCode = activationCode;
            if (isCentrex) data.isCentrex = isCentrex;
            if (isShared) data.isShared = isShared;
            if (bpId) data.bpId = bpId;
            if (isOxoManaged) data.isOxoManaged = isOxoManaged;
            that.http.post("/api/rainbow/admin/v1.0/systems", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createSystem) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createSystem) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createSystem) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createSystem) error : ", err);
                return reject(err);
            });
        });
    }

    deleteSystem(systemId: string) {
        // API https://api.openrainbow.org/admin/#api-systems-DeleteSystems
        // DELETE /api/rainbow/admin/v1.0/systems/:systemId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteSystem) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/admin/v1.0/systems/" + systemId, that.getRequestHeader())
                .then((response) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteSystem) (" + systemId + ") -- success");
                    resolve(response);
                })
                .catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteSystem) (" + systemId + ") -- failure");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteSystem) (" + systemId + ") -- failure : ", err.message);
                    return reject(err);
                });
        });
    }

    getSystemConnectionState(systemId: string, format: string = "small", connectionHistory?: boolean) {
        // API https://api.openrainbow.org/admin/#api-systems-GetSystemsConnectionState
        // GET /api/rainbow/admin/v1.0/systems/:systemId/state
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getSystemConnectionState) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/systems/" + systemId + "/state";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "connectionHistory", connectionHistory);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getSystemConnectionState) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getSystemConnectionState) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getSystemConnectionState) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getSystemConnectionState) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getSystemConnectionState) error : ", err);
                return reject(err);
            });
        });
    }

    getSystemDataByPbxId(pbxId: string, connectionHistory?: boolean) {
        // API https://api.openrainbow.org/admin/#api-systems-GetSystemsIdByPbxId
        // GET /api/rainbow/admin/v1.0/systems/pbxid/:pbxId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getSystemDataByPbxId) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/systems/pbxid/" + pbxId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "connectionHistory", connectionHistory);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getSystemDataByPbxId) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getSystemDataByPbxId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getSystemDataByPbxId) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getSystemDataByPbxId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getSystemDataByPbxId) error : ", err);
                return reject(err);
            });
        });
    }

    getSystemData(systemId: string, connectionHistory?: boolean) {
        // API https://api.openrainbow.org/admin/#api-systems-GetSystemsId
        // GET /api/rainbow/admin/v1.0/systems/:systemId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getSystemData) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/systems/" + systemId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "connectionHistory", connectionHistory);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getSystemData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getSystemData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getSystemData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getSystemData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getSystemData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllSystems(connectionHistory ?: boolean, format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "pbxId", sortOrder: number = 1,
                  name ?: string, type ?: string, status ?: string, siteId ?: string, companyId ?: string, bpId ?: string, isShared ?: boolean, isCentrex ?: boolean,
                  isSharedOrCentrex ?: boolean, isOxoManaged ?: boolean, fromCreationDate ?: string, toCreationDate ?: string) {
        // API https://api.openrainbow.org/admin/#api-systems-GetSystems
        // GET /api/rainbow/admin/v1.0/systems
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllSystems) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/systems";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "connectionHistory", connectionHistory);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "type", type);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "siteId", siteId);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "bpId", bpId);
            addParamToUrl(urlParamsTab, "isShared", isShared);
            addParamToUrl(urlParamsTab, "isCentrex", isCentrex);
            addParamToUrl(urlParamsTab, "isSharedOrCentrex", isSharedOrCentrex);
            addParamToUrl(urlParamsTab, "isOxoManaged", isOxoManaged);
            addParamToUrl(urlParamsTab, "fromCreationDate", fromCreationDate);
            addParamToUrl(urlParamsTab, "toCreationDate", toCreationDate);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllSystems) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllSystems) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllSystems) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllSystems) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllSystems) error : ", err);
                return reject(err);
            });
        });
    }

    getListOfCountriesAllowedForSystems() {
        // GET /api/rainbow/admin/v1.0/systems/countries
        // API https://api.openrainbow.org/admin/#api-systems-GetSystemsCountries
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getListOfCountriesAllowedForSystems) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/systems/countries";
            that._logger.log(that.INTERNAL, LOG_ID + "(getListOfCountriesAllowedForSystems) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getListOfCountriesAllowedForSystems) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getListOfCountriesAllowedForSystems) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getListOfCountriesAllowedForSystems) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getListOfCountriesAllowedForSystems) error : ", err);
                return reject(err);
            });
        });
    }

    updateSystem(systemId: string, name ?: string, siteId ?: string, pbxLdapId ?: string, type ?: string, country ?: string, version ?: string,
                 serverPingTimeout: number = 100, pbxMainBundlePrefix ?: string, usePbxMainBundlePrefix ?: boolean, pbxNumberingTranslator ?: Array<any>, pbxNationalPrefix ?: string, pbxInternationalPrefix ?: string, searchResultOrder ?: Array<string>,
                 isShared ?: boolean, bpId ?: string) {
        // API https://api.openrainbow.org/admin/#api-systems-PutSystems
        // PUT /api/rainbow/admin/v1.0/systems/:systemId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateSystem) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/admin/v1.0/systems/" + systemId;
            let data: any = {};
            if (name) data.name = name;
            if (siteId) data.siteId = siteId;
            if (pbxLdapId) data.pbxLdapId = pbxLdapId;
            if (type) data.type = type;
            if (country) data.country = country;
            if (version) data.version = version;
            if (serverPingTimeout) data.serverPingTimeout = serverPingTimeout;
            if (pbxMainBundlePrefix) data.pbxMainBundlePrefix = pbxMainBundlePrefix;
            if (usePbxMainBundlePrefix) data.usePbxMainBundlePrefix = usePbxMainBundlePrefix;
            if (pbxNumberingTranslator) data.pbxNumberingTranslator = pbxNumberingTranslator;
            if (pbxNationalPrefix) data.pbxNationalPrefix = pbxNationalPrefix;
            if (pbxInternationalPrefix) data.pbxInternationalPrefix = pbxInternationalPrefix;
            if (searchResultOrder) data.searchResultOrder = searchResultOrder;
            if (isShared) data.isShared = isShared;
            if (bpId) data.bpId = bpId;

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateSystem) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateSystem) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateSystem) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateSystem) error : ", err);
                return reject(err);
            });
        });
    }

    // systems phone numbers
    getASystemPhoneNumber(systemId: string, phoneNumberId: string) {
        // GET /api/rainbow/admin/v1.0/systems/:systemId/phone-numbers/:phoneNumberId
        // API https://api.openrainbow.org/admin/#api-systems_phone_numbers-GetSystemPhoneNumbersId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getASystemPhoneNumber) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/systems/" + systemId + "/phone-numbers/" + phoneNumberId;
            that._logger.log(that.INTERNAL, LOG_ID + "(getASystemPhoneNumber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getASystemPhoneNumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getASystemPhoneNumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getASystemPhoneNumber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getASystemPhoneNumber) error : ", err);
                return reject(err);
            });
        });
    }

    getAllSystemPhoneNumbers(systemId: string, shortNumber?: string, internalNumber ?: string, pbxUserId ?: string, companyPrefix?: string, isMonitored ?: boolean, name ?: string, deviceName ?: string, isAssignedToUser ?: boolean, format: string = "small", limit: number = 100, offset ?: number, sortField: string = "shortNumber", sortOrder: number = 1) {
        // GET /api/rainbow/admin/v1.0/systems/:systemId/phone-numbers
        // API https://api.openrainbow.org/admin/#api-systems_phone_numbers-GetSystemPhoneNumbers
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllSystemPhoneNumbers) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/systems/" + systemId + "/phone-numbers";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "shortNumber", shortNumber);
            addParamToUrl(urlParamsTab, "internalNumber", internalNumber);
            addParamToUrl(urlParamsTab, "pbxUserId", pbxUserId);
            addParamToUrl(urlParamsTab, "companyPrefix", companyPrefix);
            addParamToUrl(urlParamsTab, "isMonitored", isMonitored);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "deviceName", deviceName);
            addParamToUrl(urlParamsTab, "isAssignedToUser", isAssignedToUser);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllSystemPhoneNumbers) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllSystemPhoneNumbers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllSystemPhoneNumbers) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllSystemPhoneNumbers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllSystemPhoneNumbers) error : ", err);
                return reject(err);
            });
        });
    }

    updateASystemPhoneNumber(systemId: string, phoneNumberId: string, isMonitored ?: boolean, userId ?: string, internalNumber ?: string,
                             number ?: string, type ?: string, deviceType ?: string, firstName ?: string, lastName ?: string, deviceName ?: string, isVisibleByOthers ?: boolean) {
        // API https://api.openrainbow.org/admin/#api-systems_phone_numbers-PutSystemPhoneNumbers
        // PUT /api/rainbow/admin/v1.0/systems/:systemId/phone-numbers/:phoneNumberId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateASystemPhoneNumber) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/admin/v1.0/systems/" + systemId + "/phone-numbers/" + phoneNumberId;
            let data: any = {};
            if (isMonitored) data.isMonitored = isMonitored;
            if (userId) data.userId = userId;
            if (internalNumber) data.internalNumber = internalNumber;
            if (number) data.number = number;
            if (type) data.type = type;
            if (deviceType) data.deviceType = deviceType;
            if (firstName) data.firstName = firstName;
            if (lastName) data.lastName = lastName;
            if (deviceName) data.deviceName = deviceName;
            if (isVisibleByOthers) data.isVisibleByOthers = isVisibleByOthers;

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateASystemPhoneNumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateASystemPhoneNumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateASystemPhoneNumber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateASystemPhoneNumber) error : ", err);
                return reject(err);
            });
        });
    }

    //region pcg pbxs

    getPbxData(pbxId: string) {
        // GET /api/rainbow/pcg/v1.0/pbxs/:pbxId
        // API https://api.openrainbow.org/admin/#api-pcg_pbxs-GetPbxId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getPbxData) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/pcg/v1.0/pbxs";
            that._logger.log(that.INTERNAL, LOG_ID + "(getPbxData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getPbxData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getPbxData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getPbxData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getPbxData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllPbxs(format: string = "small", sortField: string = "id", limit: number = 100, offset: number = 0, sortOrder: number = 1, name: string = undefined, type: string = undefined, status: string = undefined, siteId: string = undefined, companyId: string = undefined,
               bpId: string = undefined, isShared: boolean = undefined, isCentrex: boolean = undefined, isSharedOrCentrex: boolean = undefined, isOxoManaged: boolean = undefined, fromCreationDate: string = undefined, toCreationDate: string = undefined) {
        // GET /api/rainbow/pcg/v1.0/pbxs
        // API https://api.openrainbow.org/admin/#api-pcg_pbxs-GetPbxs
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllPbxs) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/pcg/v1.0/pbxs";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "type", type);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "siteId", siteId);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "bpId", bpId);
            addParamToUrl(urlParamsTab, "isShared", isShared);
            addParamToUrl(urlParamsTab, "isCentrex", isCentrex);
            addParamToUrl(urlParamsTab, "isSharedOrCentrex", isSharedOrCentrex);
            addParamToUrl(urlParamsTab, "isOxoManaged", isOxoManaged);
            addParamToUrl(urlParamsTab, "fromCreationDate", fromCreationDate);
            addParamToUrl(urlParamsTab, "toCreationDate", toCreationDate);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllPbxs) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllPbxs) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllPbxs) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllPbxs) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllPbxs) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion pcg pbxs

    //region pcg pbxs phone numbers

    createPbxPhoneNumber(pbxId: string, shortNumber: string, voiceMailNumber: string, pbxUserId: string, companyPrefix: string, internalNumber: string, type: string, deviceType: string, firstName: string, lastName: string, deviceName: string) {
        // POST https://openrainbow.com/api/rainbow/pcg/v1.0/pbxs/:pbxId/phone-numbers
        // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-PostPcgPbxPhoneNb
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createPbxPhoneNumber) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = {};
            if (shortNumber) data.shortNumber = shortNumber;
            if (voiceMailNumber) data.voiceMailNumber = voiceMailNumber;
            if (pbxUserId) data.pbxUserId = pbxUserId;
            if (companyPrefix) data.companyPrefix = companyPrefix;
            if (internalNumber) data.internalNumber = internalNumber;
            if (type) data.type = type;
            if (deviceType) data.deviceType = deviceType;
            if (firstName) data.firstName = firstName;
            if (lastName) data.lastName = lastName;
            if (deviceName) data.deviceName = deviceName;
            that._logger.log(that.INTERNAL, LOG_ID + "(createPbxPhoneNumber) args : ", data);
            that.http.post("/api/rainbow/pcg/v1.0/pbxs/" + pbxId + "/phone-numbers", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createPbxPhoneNumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createPbxPhoneNumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createPbxPhoneNumber) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createPbxPhoneNumber) error : ", err);
                return reject(err);
            });
        });
    }

    deletePbxPhoneNumber(pbxId: string, shortNumber: string) {
        // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-DeletePcgPbxPhoneNbShortNb
        // DELETE https://openrainbow.com/api/rainbow/pcg/v1.0/pbxs/:pbxId/phone-numbers/short-number/:shortNumber
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deletePbxPhoneNumber) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/pcg/v1.0/pbxs/" + pbxId + "/phone-numbers/short-number/" + shortNumber, that.getRequestHeader())
                .then((response) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(deletePbxPhoneNumber) (" + pbxId + ", " + shortNumber + ") -- success");
                    resolve(response);
                })
                .catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(deletePbxPhoneNumber) (" + pbxId + ", " + shortNumber + ") -- failure");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deletePbxPhoneNumber) (" + pbxId + ", " + shortNumber + ") -- failure : ", err.message);
                    return reject(err);
                });
        });
    }

    getPbxPhoneNumber(pbxId: string, shortNumber: string) {
        // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-GetPcgPbxPhoneNbShortNb
        // GET https://openrainbow.com/api/rainbow/pcg/v1.0/pbxs/:pbxId/phone-numbers/short-number/:shortNumber
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getPbxPhoneNumber) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/pcg/v1.0/pbxs/" + pbxId + "/phone-numbers/short-number/" + shortNumber;
            that._logger.log(that.INTERNAL, LOG_ID + "(getPbxPhoneNumber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getPbxPhoneNumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getPbxPhoneNumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getPbxPhoneNumber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getPbxPhoneNumber) error : ", err);
                return reject(err);
            });
        });
    }

    getAllPbxPhoneNumbers(pbxId: string, format: string = "small", shortNumber: string, internalNumber: string, pbxUserId: string,
                          companyPrefix: string, isMonitored: boolean, name: string, nameOrShortNumber: string, deviceName: string,
                          isAssignedToUser: boolean, limit: number = 100, offset: number, sortField: string = "shortNumber", sortOrder: number = 1) {
        // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-GetPcgPbxPhoneNb
        // GET https://openrainbow.com/api/rainbow/pcg/v1.0/pbxs/:pbxId/phone-numbers
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllPbxPhoneNumbers) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/pcg/v1.0/pbxs/" + pbxId + "/phone-numbers";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "shortNumber", shortNumber);
            addParamToUrl(urlParamsTab, "internalNumber", internalNumber);
            addParamToUrl(urlParamsTab, "pbxUserId", pbxUserId);
            addParamToUrl(urlParamsTab, "companyPrefix", companyPrefix);
            addParamToUrl(urlParamsTab, "isMonitored", isMonitored);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "nameOrShortNumber", nameOrShortNumber);
            addParamToUrl(urlParamsTab, "deviceName", deviceName);
            addParamToUrl(urlParamsTab, "isAssignedToUser", isAssignedToUser);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllPbxPhoneNumbers) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllPbxPhoneNumbers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllPbxPhoneNumbers) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllPbxPhoneNumbers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllPbxPhoneNumbers) error : ", err);
                return reject(err);
            });
        });
    }

    updatepbxPhoneNumber(pbxId: string, shortNumber: string, voiceMailNumber: string, pbxUserId: string, companyPrefix: string, companyName: string, internalNumber: string, type: string, deviceType: string, firstName: string, lastName: string, deviceName: string) {
        // API https://api.openrainbow.org/admin/#api-pcg_pbxs_phone_numbers-PutPcgPbxPhoneNbShortNb
        // PUT https://openrainbow.com/api/rainbow/pcg/v1.0/pbxs/:pbxId/phone-numbers/short-number/:shortNumber
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updatepbxPhoneNumber) entry`);
        let data: any = {};
        if (shortNumber) data.shortNumber = shortNumber;
        if (voiceMailNumber) data.voiceMailNumber = voiceMailNumber;
        if (pbxUserId) data.pbxUserId = pbxUserId;
        if (companyPrefix) data.companyPrefix = companyPrefix;
        if (companyName) data.companyName = companyName;
        if (internalNumber) data.internalNumber = internalNumber;
        if (type) data.type = type;
        if (deviceType) data.deviceType = deviceType;
        if (firstName) data.firstName = firstName;
        if (lastName) data.lastName = lastName;
        if (deviceName) data.deviceName = deviceName;

        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updatepbxPhoneNumber) REST data params : ", data);
            that.http.put("/api/rainbow/pcg/v1.0/pbxs/" + pbxId + "/phone-numbers/short-number/" + shortNumber, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updatepbxPhoneNumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updatepbxPhoneNumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updatepbxPhoneNumber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updatepbxPhoneNumber) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion pcg pbxs phone numbers

    //endregion systems

}

module.exports = {'RESTSystems': RESTSystems};
export {RESTSystems as RESTSystems};
