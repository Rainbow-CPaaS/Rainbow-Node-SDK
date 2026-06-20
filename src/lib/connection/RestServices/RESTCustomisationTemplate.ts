'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/CTPL - ";

/**
 * Handles all REST API calls related to customisation templates.
 */
@logEntryExit(LOG_ID)
class RESTCustomisationTemplate extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTCustomisationTemplate'; }
    getClassName() { return RESTCustomisationTemplate.getClassName(); }
    static getAccessorName() { return 'restcustomisationtemplate'; }
    getAccessorName() { return RESTCustomisationTemplate.getAccessorName(); }

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

    //region Customisation Template

    applyCustomisationTemplates(name: string, companyId: string, userId: string) {
        // API https://api.openrainbow.org/admin/#api-customisation_template-ApplyCompanyTemplate
        // URL POST /api/rainbow/admin/v1.0/customisations/templates/apply
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(applyCustomisationTemplates) entry`);
        return new Promise(function (resolve, reject) {
            let data = { name, companyId, userId };
            that.http.post("/api/rainbow/admin/v1.0/customisations/templates/apply", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(applyCustomisationTemplates) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(applyCustomisationTemplates) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(applyCustomisationTemplates) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(applyCustomisationTemplates) error : ", err);
                return reject(err);
            });
        });
    }

    createCustomisationTemplate(name: string, ownedByCompany: string, visibleBy: Array<string>, instantMessagesCustomisation: string, useGifCustomisation: string,
                                fileSharingCustomisation: string, fileStorageCustomisation: string, phoneMeetingCustomisation: string, useDialOutCustomisation: string, useChannelCustomisation: string, useRoomCustomisation: string,
                                useScreenSharingCustomisation: string, useWebRTCAudioCustomisation: string, useWebRTCVideoCustomisation: string, recordingConversationCustomisation: string, overridePresenceCustomisation: string,
                                userProfileCustomisation: string, userTitleNameCustomisation: string, changeTelephonyCustomisation: string, changeSettingsCustomisation: string, fileCopyCustomisation: string,
                                fileTransferCustomisation: string, forbidFileOwnerChangeCustomisation: string, readReceiptsCustomisation: string, useSpeakingTimeStatistics: string) {
        // API https://api.openrainbow.org/admin/#api-customisation_template-CreateCompanyTemplate
        // URL POST /api/rainbow/admin/v1.0/customisations/templates
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createCustomisationTemplate) entry`);
        return new Promise(function (resolve, reject) {
            let data = {
                ownedByCompany, visibleBy, instantMessagesCustomisation, useGifCustomisation, fileSharingCustomisation,
                fileStorageCustomisation, phoneMeetingCustomisation, useDialOutCustomisation, useChannelCustomisation,
                useRoomCustomisation, useWebRTCAudioCustomisation, useWebRTCVideoCustomisation, recordingConversationCustomisation,
                overridePresenceCustomisation, userProfileCustomisation, userTitleNameCustomisation, changeTelephonyCustomisation,
                changeSettingsCustomisation, name, fileCopyCustomisation, fileTransferCustomisation, forbidFileOwnerChangeCustomisation,
                useScreenSharingCustomisation, readReceiptsCustomisation, useSpeakingTimeStatistics
            };
            that.http.post("/api/rainbow/admin/v1.0/customisations/templates", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createCustomisationTemplate) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(createCustomisationTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createCustomisationTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createCustomisationTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCustomisationTemplate(templateId) {
        // API https://api.openrainbow.org/admin/#api-customisation_template-DeleteCompanyTemplate
        // URL delete /api/rainbow/admin/v1.0/customisations/templates/:templateId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteCustomisationTemplate) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.DEBUG, LOG_ID + "(deleteCustomisationTemplate) templateId", templateId);
            that.http.delete('/api/rainbow/admin/v1.0/customisations/templates/' + templateId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteCustomisationTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteCustomisationTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteCustomisationTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCustomisationTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    getAllAvailableCustomisationTemplates(companyId: string = undefined, format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number = 1) {
        // API https://api.openrainbow.org/admin/#api-customisation_template-GetCustomisationTemplateAll
        // URL get /api/rainbow/admin/v1.0/customisations/templates
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllAvailableCustomisationTemplates) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/customisations/templates";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllAvailableCustomisationTemplates) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllAvailableCustomisationTemplates) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllAvailableCustomisationTemplates) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllAvailableCustomisationTemplates) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllAvailableCustomisationTemplates) error : ", err);
                return reject(err);
            });
        });
    }

    getRequestedCustomisationTemplate(templateId: string = undefined) {
        // API https://api.openrainbow.org/admin/#api-customisation_template-GetCompanyTemplate
        // URL get /api/rainbow/admin/v1.0/customisations/templates/:templateId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getRequestedCustomisationTemplate) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/customisations/templates/" + templateId;
            that._logger.log(that.INTERNAL, LOG_ID + "(getRequestedCustomisationTemplate) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getRequestedCustomisationTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getRequestedCustomisationTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getRequestedCustomisationTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getRequestedCustomisationTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    updateCustomisationTemplate(templateId: string, name: string, visibleBy: string[],
                                instantMessagesCustomisation: string = "enabled", useGifCustomisation: string = "enabled", fileSharingCustomisation: string = "enabled", fileStorageCustomisation: string = "enabled", phoneMeetingCustomisation: string = "enabled",
                                useDialOutCustomisation: string = "enabled", useChannelCustomisation: string = "enabled", useRoomCustomisation: string = "enabled", useScreenSharingCustomisation: string = "enabled", useWebRTCAudioCustomisation: string = "enabled",
                                useWebRTCVideoCustomisation: string = "enabled", recordingConversationCustomisation: string = "enabled", overridePresenceCustomisation: string = "enabled", userProfileCustomisation: string = "enabled",
                                userTitleNameCustomisation: string = "enabled", changeTelephonyCustomisation: string = "enabled", changeSettingsCustomisation: string = "enabled", fileCopyCustomisation: string = "enabled",
                                fileTransferCustomisation: string = "enabled", forbidFileOwnerChangeCustomisation: string = "enabled", readReceiptsCustomisation: string = "enabled", useSpeakingTimeStatistics: string = "enabled") {
        // API https://api.openrainbow.org/admin/#api-customisation_template-UpdateCompanyTemplate
        // URL PUT /api/rainbow/admin/v1.0/customisations/templates/:templateId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateCustomisationTemplate) entry`);
        return new Promise(function (resolve, reject) {
            let data = {
                name, visibleBy, instantMessagesCustomisation, useGifCustomisation, fileSharingCustomisation,
                fileStorageCustomisation, phoneMeetingCustomisation, useDialOutCustomisation, useChannelCustomisation,
                useRoomCustomisation, useScreenSharingCustomisation, useWebRTCAudioCustomisation, useWebRTCVideoCustomisation,
                recordingConversationCustomisation, overridePresenceCustomisation, userProfileCustomisation, userTitleNameCustomisation,
                changeTelephonyCustomisation, changeSettingsCustomisation, fileCopyCustomisation, fileTransferCustomisation,
                forbidFileOwnerChangeCustomisation, readReceiptsCustomisation, useSpeakingTimeStatistics
            };
            that.http.put("/api/rainbow/admin/v1.0/customisations/templates/" + templateId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCustomisationTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCustomisationTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCustomisationTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCustomisationTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Customisation Template

}

module.exports = {'RESTCustomisationTemplate': RESTCustomisationTemplate};
export {RESTCustomisationTemplate as RESTCustomisationTemplate};
