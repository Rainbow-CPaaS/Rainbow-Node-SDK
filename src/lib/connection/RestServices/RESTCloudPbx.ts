'use strict';

import {addParamToUrl, addPropertyToObj, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";
import {HuntingGroup} from "../../common/models/RainbowVoiceCloudPBX.js";

const LOG_ID = "REST/CPBX - ";

/**
 * Handles all REST API calls related to Rainbow Voice Cloud PBX provisioning.
 */
@logEntryExit(LOG_ID)
class RESTCloudPbx extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTCloudPbx'; }
    getClassName() { return RESTCloudPbx.getClassName(); }
    static getAccessorName() { return 'restcloudpbx'; }
    getAccessorName() { return RESTCloudPbx.getAccessorName(); }

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

    //region Rainbow Voice Communication Platform Provisioning
    // Server doc : https://hub.openrainbow.com/api/ngcpprovisioning/index.html#tag/Cloudpbx

    //region CloudPBX

    getCloudPbxById(systemId) {
        // https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/569d0ef3ef7816921f7e94fa
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPbxById) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId;

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPbxById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPbxById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPbxById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPbxById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPbxById) error : ", err);
                return reject(err);
            });
        });
    }

    updateCloudPBX(systemId, barringOptions_permissions: string, barringOptions_restrictions: string, callForwardOptions_externalCallForward: string, customSipHeader_1: string, customSipHeader_2: string, emergencyOptions_callAuthorizationWithSoftPhone: boolean, emergencyOptions_emergencyGroupActivated: boolean, externalTrunkId: string, language: string, name: string, numberingDigits: number, numberingPrefix: number, outgoingPrefix: number, routeInternalCallsToPeer: boolean) {
        // PUT https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateCloudPBX) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId;
            that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBX) REST url : ", url);
            let params = {
                "barringOptions":
                        {
                            "permissions": barringOptions_permissions,
                            "restrictions": barringOptions_restrictions
                        },
                "callForwardOptions":
                        {
                            "externalCallForward": callForwardOptions_externalCallForward
                        },
                "customSipHeader_1": customSipHeader_1,
                "customSipHeader_2": customSipHeader_2,
                "emergencyOptions":
                        {
                            "callAuthorizationWithSoftPhone": emergencyOptions_callAuthorizationWithSoftPhone,
                            "emergencyGroupActivated": emergencyOptions_emergencyGroupActivated
                        },
                "externalTrunkId": externalTrunkId,
                "language": language,
                "name": name,
                "numberingDigits": numberingDigits,
                "numberingPrefix": numberingPrefix,
                "outgoingPrefix": outgoingPrefix,
                "routeInternalCallsToPeer": routeInternalCallsToPeer
            };

            that.http.put(url, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCloudPBX) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBX) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCloudPBX) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCloudPBX) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCloudPBX(systemId: string): Promise<{ status: string }> {
        // DELETE https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/569d0ef3ef7816921f7e94fa
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteCloudPBX) entry`);
        return new Promise(function (resolve, reject) {
            if (!systemId) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteCloudPBX) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(deleteCloudPBX) No ldapId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteCloudPBX) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteCloudPBX) REST result : " + json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteCloudPBX) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCloudPBX) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    getCloudPbxs(limit: number, offset: number, sortField: string, sortOrder: number, companyId: string, bpId: string) {
        // https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPbxs) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", "" + limit);
            addParamToUrl(urlParamsTab, "offset", "" + offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", "" + sortOrder);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "bpId", bpId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPbxs) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPbxs) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPbxs) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPbxs) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPbxs) error : ", err);
                return reject(err);
            });
        });
    }

    createACloudPBX(bpId: string, companyId: string, customSipHeader_1: string, customSipHeader_2: string, externalTrunkId: string, language: string, name: string, noReplyDelay: number, numberingDigits: number, numberingPrefix: number, outgoingPrefix: number, routeInternalCallsToPeer: boolean, siteId: string) {
        // POST https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createACloudPBX) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs";
            that._logger.log(that.INTERNAL, LOG_ID + "(createACloudPBX) REST url : ", url);
            let param = {
                bpId, companyId, customSipHeader_1, customSipHeader_2, externalTrunkId, language, name,
                noReplyDelay, numberingDigits, numberingPrefix, outgoingPrefix, routeInternalCallsToPeer, siteId
            };

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(createACloudPBX) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createACloudPBX) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createACloudPBX) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createACloudPBX) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXCLIPolicyForOutboundCalls(systemId: string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/cli-options
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPBXCLIPolicyForOutboundCalls) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/cli-options";

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXCLIPolicyForOutboundCalls) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXCLIPolicyForOutboundCalls) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXCLIPolicyForOutboundCalls) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXCLIPolicyForOutboundCalls) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXCLIPolicyForOutboundCalls) error : ", err);
                return reject(err);
            });
        });
    }

    updateCloudPBXCLIOptionsConfiguration(systemId: string, policy: string) {
        // PUT https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/cli-options
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateCloudPBXCLIOptionsConfiguration) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/cli-options";
            that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) REST url : ", url);
            let params = { policy };

            that.http.put(url, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCloudPBXCLIOptionsConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCloudPBXCLIOptionsConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXlanguages(systemId: string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/languages
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPBXlanguages) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/languages";

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXlanguages) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXlanguages) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXlanguages) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXlanguages) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXlanguages) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXDeviceModels(systemId: string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/devicemodels
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPBXDeviceModels) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devicemodels";

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXDeviceModels) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXDeviceModels) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXDeviceModels) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXDeviceModels) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXDeviceModels) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXTrafficBarringOptions(systemId: string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/barring-options
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPBXTrafficBarringOptions) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/barring-options";

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXTrafficBarringOptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXTrafficBarringOptions) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXTrafficBarringOptions) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXTrafficBarringOptions) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXTrafficBarringOptions) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXEmergencyNumbersAndEmergencyOptions(systemId: string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/emergency-numbers
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPBXEmergencyNumbersAndEmergencyOptions) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/barring-options";

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXEmergencyNumbersAndEmergencyOptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXEmergencyNumbersAndEmergencyOptions) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXEmergencyNumbersAndEmergencyOptions) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXEmergencyNumbersAndEmergencyOptions) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXEmergencyNumbersAndEmergencyOptions) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion CloudPBX

    //region Companies Cloudpbx Groups (Rainbow Voice)

    createCloudPBXGroup(_companyId: string, huntingGroup: HuntingGroup, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-PostCloudPbxGroup
        // URL POST /api/rainbow/admin/v1.0/companies/:companyId/groups
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createCloudPBXGroup) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups";
            let data: any = huntingGroup;

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createCloudPBXGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createCloudPBXGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createCloudPBXGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createCloudPBXGroup) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCloudPBXGroup(_companyId: string, groupId: string, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-DeleteCloudPbxGroup
        // DELETE /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteCloudPBXGroup) entry`);
        return new Promise((resolve, reject) => {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups/" + groupId;
            that.http.delete(url, that.getRequestHeader()).then((response) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteCloudPBXGroup) (" + companyId + ", " + groupId + ") -- success");
                resolve(response);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(deleteCloudPBXGroup) (" + companyId + ", " + groupId + ") -- failure -- ");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCloudPBXGroup) (" + companyId + ", " + groupId + ") -- failure -- ", err.message);
                return reject(err);
            });
        });
    }

    getCloudPBXGroup(_companyId: string, groupId: string, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-GetCloudPbxGroup
        // GET /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPBXGroup) entry`);
        return new Promise((resolve, reject) => {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups/" + groupId;

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXGroup) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXGroup) error : ", err);
                return reject(err);
            });
        });
    }

    getAllCloudPBXGroups(_companyId?: string, sortField?: string, name?: string, shortNumber?: string, externalNumber?: string, memberId?: string, type?: string, limit?: number, offset?: number, sortOrder?: number, defaultCompanyId?: string) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-GetAllCloudPbxGroup
        // GET /api/rainbow/admin/v1.0/companies/:companyId/groups
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllCloudPBXGroups) entry`);
        return new Promise((resolve, reject) => {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "shortNumber", shortNumber);
            addParamToUrl(urlParamsTab, "externalNumber", externalNumber);
            addParamToUrl(urlParamsTab, "memberId", memberId);
            addParamToUrl(urlParamsTab, "type", type);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllCloudPBXGroups) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllCloudPBXGroups) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllCloudPBXGroups) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllCloudPBXGroups) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllCloudPBXGroups) error : ", err);
                return reject(err);
            });
        });
    }

    getMembersOfCloudPBXGroups(_companyId?: string, limit?: number, offset?: number, sortField?: string, sortOrder?: number, displayName?: string, internalNumber?: string, defaultCompanyId?: string) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-GetAllCloudPbxGroupMembers
        // GET /api/rainbow/admin/v1.0/companies/:companyId/group-members
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getMembersOfCloudPBXGroups) entry`);
        return new Promise((resolve, reject) => {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups-members";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "displayName", displayName);
            addParamToUrl(urlParamsTab, "internalNumber", internalNumber);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getMembersOfCloudPBXGroups) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getMembersOfCloudPBXGroups) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getMembersOfCloudPBXGroups) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getMembersOfCloudPBXGroups) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getMembersOfCloudPBXGroups) error : ", err);
                return reject(err);
            });
        });
    }

    updateCloudPBXGroup(_companyId?: string, groupId?: string, name?: string, policy?: "serial" | "parallel" | "circular", timeout?: number, externalNumberId?: string, isEmptyAllowed?: boolean, isDDIUpdateByManagerAllowed?: boolean,
                        members?: {
                            memberId: string,
                            roles?: ("manager" | "agent" | "leader" | "assistant")[],
                            status?: "active" | "idle"
                        }[], defaultCompanyId?: string) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-PutCloudPbxGroup
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateCloudPBXGroup) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups/" + groupId;
            let data: any = {};
            addPropertyToObj(data, "name", name, false);
            addPropertyToObj(data, "policy", policy, false);
            addPropertyToObj(data, "timeout", timeout, false);
            addPropertyToObj(data, "externalNumberId", externalNumberId, false);
            addPropertyToObj(data, "isEmptyAllowed", isEmptyAllowed, false);
            addPropertyToObj(data, "isDDIUpdateByManagerAllowed", isDDIUpdateByManagerAllowed, false);
            addPropertyToObj(data, "members", members, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCloudPBXGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBXGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCloudPBXGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCloudPBXGroup) error : ", err);
                return reject(err);
            });
        });
    }

    updateCloudPBXHuntingGroupAnalyticsConfiguration(_companyId?: string, groupId?: string, isManagersAllowedToSeeMembersAnalytics?: boolean, defaultCompanyId?: string) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-PutAnalyticsCloudPbxGroup
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId/analytic-settings
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateCloudPBXHuntingGroupAnalyticsConfiguration) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups/" + groupId;
            let data: any = {};
            addPropertyToObj(data, "isManagersAllowedToSeeMembersAnalytics", isManagersAllowedToSeeMembersAnalytics, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCloudPBXHuntingGroupAnalyticsConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBXHuntingGroupAnalyticsConfiguration) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCloudPBXHuntingGroupAnalyticsConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCloudPBXHuntingGroupAnalyticsConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    updateCloudPBXHuntingGroupRecordingConfiguration(_companyId?: string, groupId?: string, recordingProfile?: string, defaultCompanyId?: string) {
        // API https://api.openrainbow.org/admin/#api-companies_cloudpbx_groups-PutRecordingCloudPbxGroup
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/groups/:groupId/recordings
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateCloudPBXHuntingGroupRecordingConfiguration) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/groups/" + groupId + "/recordings";
            let data: any = {};
            addPropertyToObj(data, "recordingProfile", recordingProfile, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCloudPBXHuntingGroupRecordingConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBXHuntingGroupRecordingConfiguration) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCloudPBXHuntingGroupRecordingConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCloudPBXHuntingGroupRecordingConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Companies Cloudpbx Groups (Rainbow Voice)

    //region Cloudpbx Devices

    CreateCloudPBXSIPDevice(systemId: string, description: string, deviceTypeId: string, macAddress: string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(CreateCloudPBXSIPDevice) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices";
            that._logger.log(that.INTERNAL, LOG_ID + "(CreateCloudPBXSIPDevice) REST url : ", url);
            let param = {description, deviceTypeId, macAddress};

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(CreateCloudPBXSIPDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(CreateCloudPBXSIPDevice) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(CreateCloudPBXSIPDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(CreateCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    factoryResetCloudPBXSIPDevice(systemId: string, deviceId: string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/reset
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(factoryResetCloudPBXSIPDevice) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId + "/reset";
            that._logger.log(that.INTERNAL, LOG_ID + "(factoryResetCloudPBXSIPDevice) REST url : ", url);
            let param = {};

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(factoryResetCloudPBXSIPDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(factoryResetCloudPBXSIPDevice) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(factoryResetCloudPBXSIPDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(factoryResetCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXSIPDeviceById(systemId: string, deviceId: string) {
        // GET  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPBXSIPDeviceById) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId;

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSIPDeviceById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXSIPDeviceById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSIPDeviceById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXSIPDeviceById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXSIPDeviceById) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCloudPBXSIPDevice(systemId: string, deviceId: string) {
        // DELETE  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteCloudPBXSIPDevice) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteCloudPBXSIPDevice) (" + systemId + ", " + deviceId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteCloudPBXSIPDevice) (" + systemId + ", " + deviceId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCloudPBXSIPDevice) (" + systemId + ", " + deviceId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    updateCloudPBXSIPDevice(systemId: string, description: string, deviceId: string, macAddress: string) {
        // PUT  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateCloudPBXSIPDevice) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBXSIPDevice) systemId : ", systemId + ", deviceTypeId : ", deviceId);
            let data = { description, macAddress };
            that.http.put("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCloudPBXSIPDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCloudPBXSIPDevice) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCloudPBXSIPDevice) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getAllCloudPBXSIPDevice(systemId: string, limit: number = 100, offset: number, sortField: string, sortOrder: number = 1, assigned: boolean, phoneNumberId: string) {
        // GET  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllCloudPBXSIPDevice) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "assigned", assigned + "");
            addParamToUrl(urlParamsTab, "phoneNumberId", phoneNumberId);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllCloudPBXSIPDevice) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllCloudPBXSIPDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllCloudPBXSIPDevice) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllCloudPBXSIPDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXSIPRegistrationsInformationDevice(systemId: string, deviceId: string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/registrations/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPBXSIPRegistrationsInformationDevice) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId + "/registrations";

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXSIPRegistrationsInformationDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXSIPRegistrationsInformationDevice) error : ", err);
                return reject(err);
            });
        });
    }

    grantCloudPBXAccessToDebugSession(systemId: string, deviceId: string, duration: string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/debug
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(grantCloudPBXAccessToDebugSession) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId + "/debug";
            that._logger.log(that.INTERNAL, LOG_ID + "(grantCloudPBXAccessToDebugSession) REST url : ", url);
            let param = {duration};

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(grantCloudPBXAccessToDebugSession) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(grantCloudPBXAccessToDebugSession) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(grantCloudPBXAccessToDebugSession) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(grantCloudPBXAccessToDebugSession) error : ", err);
                return reject(err);
            });
        });
    }

    revokeCloudPBXAccessFromDebugSession(systemId: string, deviceId: string) {
        // DELETE  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/debug
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(revokeCloudPBXAccessFromDebugSession) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId + "/debug", that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(revokeCloudPBXAccessFromDebugSession) (" + systemId + ", " + deviceId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(revokeCloudPBXAccessFromDebugSession) (" + systemId + ", " + deviceId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(revokeCloudPBXAccessFromDebugSession) (" + systemId + ", " + deviceId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    rebootCloudPBXSIPDevice(systemId: string, deviceId: string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/reboot
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(rebootCloudPBXSIPDevice) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId + "/reboot";
            that._logger.log(that.INTERNAL, LOG_ID + "(rebootCloudPBXSIPDevice) REST url : ", url);
            let param = {};

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(rebootCloudPBXSIPDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(rebootCloudPBXSIPDevice) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(rebootCloudPBXSIPDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(rebootCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Cloudpbx Devices

    //region Cloudpbx Subscribers

    getCloudPBXSubscriber(systemId: string, phoneNumberId: string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPBXSubscriber) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId;

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSubscriber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXSubscriber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSubscriber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXSubscriber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXSubscriber) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCloudPBXSubscriber(systemId: string, phoneNumberId: string) {
        // DELETE  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteCloudPBXSubscriber) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteCloudPBXSubscriber) (" + systemId + ", " + phoneNumberId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteCloudPBXSubscriber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCloudPBXSubscriber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    createCloudPBXSubscriberRainbowUser(systemId: string, login: string, password: string, shortNumber: string, userId: string) {
        // POST https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createCloudPBXSubscriberRainbowUser) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers";
            that._logger.log(that.INTERNAL, LOG_ID + "(createCloudPBXSubscriberRainbowUser) REST url : ", url);
            let param = { login, password, shortNumber, userId };

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(createCloudPBXSubscriberRainbowUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createCloudPBXSubscriberRainbowUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createCloudPBXSubscriberRainbowUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createCloudPBXSubscriberRainbowUser) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXSIPdeviceAssignedSubscriber(systemId: string, phoneNumberId: string, deviceId: string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/devices/{deviceId}
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPBXSIPdeviceAssignedSubscriber) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/devices/" + deviceId;

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXSIPdeviceAssignedSubscriber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXSIPdeviceAssignedSubscriber) error : ", err);
                return reject(err);
            });
        });
    }

    removeCloudPBXAssociationSubscriberAndSIPdevice(systemId: string, phoneNumberId: string, deviceId: string) {
        // DELETE https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/devices/{deviceId}
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(removeCloudPBXAssociationSubscriberAndSIPdevice) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete(" /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/devices/" + deviceId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(removeCloudPBXAssociationSubscriberAndSIPdevice) (" + systemId + ", " + phoneNumberId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(removeCloudPBXAssociationSubscriberAndSIPdevice) (" + systemId + ", " + phoneNumberId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(removeCloudPBXAssociationSubscriberAndSIPdevice) (" + systemId + ", " + phoneNumberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getCloudPBXAllSIPdevicesAssignedSubscriber(systemId: string, limit: number = 100, offset: number, sortField: string, sortOrder: number = 1, phoneNumberId: string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/devices/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPBXAllSIPdevicesAssignedSubscriber) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/devices";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXAllSIPdevicesAssignedSubscriber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXAllSIPdevicesAssignedSubscriber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXAllSIPdevicesAssignedSubscriber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXAllSIPdevicesAssignedSubscriber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXAllSIPdevicesAssignedSubscriber) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXInfoAllRegisteredSIPdevicesSubscriber(systemId: string, phoneNumberId: string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/registrations/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/registrations";

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) error : ", err);
                return reject(err);
            });
        });
    }

    assignCloudPBXSIPDeviceToSubscriber(systemId: string, phoneNumberId: string, deviceId: string, macAddress: string) {
        // POST https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/devices
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(assignCloudPBXSIPDeviceToSubscriber) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) systemId : ", systemId + ", deviceTypeId : ", deviceId);
            let data = { deviceId, macAddress };
            that.http.post("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/devices", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(assignCloudPBXSIPDeviceToSubscriber) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(assignCloudPBXSIPDeviceToSubscriber) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXSubscriberCLIOptions(systemId: string, phoneNumberId: string) {
        // GET  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/cli-options
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPBXSubscriberCLIOptions) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/cli-options";

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSubscriberCLIOptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXSubscriberCLIOptions) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXSubscriberCLIOptions) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXSubscriberCLIOptions) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXSubscriberCLIOptions) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Cloudpbx Subscribers

    //region Cloudpbx Phone Numbers

    getCloudPBXUnassignedInternalPhonenumbers(systemId: string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/free
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCloudPBXUnassignedInternalPhonenumbers) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/free";

            that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCloudPBXUnassignedInternalPhonenumbers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCloudPBXUnassignedInternalPhonenumbers) error : ", err);
                return reject(err);
            });
        });
    }

    listCloudPBXDDINumbersAssociated(systemId: string, limit: number = 100, offset: number, sortField: string = "number", sortOrder: number = 1, isAssignedToUser: boolean, isAssignedToGroup: boolean, isAssignedToIVR: boolean, isAssignedToAutoAttendant: boolean, isAssigned: boolean) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(listCloudPBXDDINumbersAssociated) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "isAssignedToUser", isAssignedToUser + "");
            addParamToUrl(urlParamsTab, "isAssignedToGroup", isAssignedToGroup + "");
            addParamToUrl(urlParamsTab, "isAssignedToIVR", isAssignedToIVR + "");
            addParamToUrl(urlParamsTab, "isAssignedToAutoAttendant", isAssignedToAutoAttendant + "");
            addParamToUrl(urlParamsTab, "limit", isAssigned + "");
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(listCloudPBXDDINumbersAssociated) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(listCloudPBXDDINumbersAssociated) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(listCloudPBXDDINumbersAssociated) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(listCloudPBXDDINumbersAssociated) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(listCloudPBXDDINumbersAssociated) error : ", err);
                return reject(err);
            });
        });
    }

    createCloudPBXDDINumber(systemId: string, number: string) {
        // POST https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createCloudPBXDDINumber) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(createCloudPBXDDINumber) systemId : ", systemId + ", number : ", number);
            let data = { number };
            that.http.post("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createCloudPBXDDINumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createCloudPBXDDINumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createCloudPBXDDINumber) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createCloudPBXDDINumber) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCloudPBXDDINumber(systemId: string, phoneNumberId: string) {
        // DELETE https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi/{phoneNumberId}
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteCloudPBXDDINumber) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi/" + phoneNumberId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(deleteCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(deleteCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    associateCloudPBXDDINumber(systemId: string, phoneNumberId: string, userId: string) {
        // POST https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi/{phoneNumberId}/users/{userId}
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(associateCloudPBXDDINumber) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(associateCloudPBXDDINumber) systemId : ", systemId + ", phoneNumberId : ", phoneNumberId, ", userId : ", userId);
            let data = {};
            that.http.post("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi/" + phoneNumberId + "/users/" + userId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(associateCloudPBXDDINumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(associateCloudPBXDDINumber) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(associateCloudPBXDDINumber) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(associateCloudPBXDDINumber) error : ", err);
                return reject(err);
            });
        });
    }

    disassociateCloudPBXDDINumber(systemId: string, phoneNumberId: string, userId: string) {
        // DELETE https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi/{phoneNumberId}/users/{userId}
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(disassociateCloudPBXDDINumber) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi/" + phoneNumberId + "/users/" + userId, that.getRequestHeader())
                    .then((response) => {
                        that._logger.log(that.DEBUG, LOG_ID + "(disassociateCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ", " + userId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID, "(disassociateCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ", " + userId + ") -- failure -- ");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(disassociateCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    setCloudPBXDDIAsdefault(systemId: string, phoneNumberId: string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi/{phoneNumberId}/default
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(setCloudPBXDDIAsdefault) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(setCloudPBXDDIAsdefault) systemId : ", systemId + ", phoneNumberId : ", phoneNumberId);
            let data = {};
            that.http.post("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi/" + phoneNumberId + "/default", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setCloudPBXDDIAsdefault) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setCloudPBXDDIAsdefault) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setCloudPBXDDIAsdefault) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setCloudPBXDDIAsdefault) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Cloudpbx Phone Numbers

    //region Cloudpbx SIP Trunk

    retrieveExternalSIPTrunkById(externalTrunkId: string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/external-trunks/{externalTrunkId}
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveExternalSIPTrunkById) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/external-trunks/" + externalTrunkId;

            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveExternalSIPTrunkById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveExternalSIPTrunkById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveExternalSIPTrunkById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveExternalSIPTrunkById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveExternalSIPTrunkById) error : ", err);
                return reject(err);
            });
        });
    }

    retrievelistExternalSIPTrunks(rvcpInstanceId: string, status: string, trunkType: string) {
        // GET  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/external-trunks/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrievelistExternalSIPTrunks) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/rvcpprovisioning/v1.0/external-trunks";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "rvcpInstanceId", rvcpInstanceId);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "trunkType", trunkType);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(retrievelistExternalSIPTrunks) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrievelistExternalSIPTrunks) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrievelistExternalSIPTrunks) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrievelistExternalSIPTrunks) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrievelistExternalSIPTrunks) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Cloudpbx SIP Trunk

    //endregion Rainbow Voice Communication Platform Provisioning

}

module.exports = {'RESTCloudPbx': RESTCloudPbx};
export {RESTCloudPbx as RESTCloudPbx};
