'use strict';

import {addParamToUrl, addPropertyToObj, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/COMP - ";

/**
 * Handles all REST API calls related to company management.
 */
@logEntryExit(LOG_ID)
class RESTCompany extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTCompany'; }
    getClassName() { return RESTCompany.getClassName(); }
    static getAccessorName() { return 'restcompany'; }
    getAccessorName() { return RESTCompany.getAccessorName(); }

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

    //region Company

    //region Company Management

    getAllCompanies(format: string = "small", sortField: string = "name", bpId: string = undefined, catalogId: string = undefined, offerId: string = undefined, offerCanBeSold: boolean = undefined, externalReference: string = undefined, externalReference2: string = undefined, salesforceAccountId: string = undefined, selectedAppCustomisationTemplate: string = undefined, selectedThemeObj: boolean = undefined, offerGroupName: string = undefined, limit: number = 100, offset: number = 0, sortOrder: number = 1, name: string = undefined, status: string = undefined, visibility: string = undefined, organisationId: string = undefined, isBP: boolean = undefined, hasBP: boolean = undefined, bpType: string = undefined, accountRoles?: any) {
        // API https://api.openrainbow.org/admin/#api-companies-GetCompanies
        // URL get /api/rainbow/admin/v1.0/companies
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllCompanies) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.DEBUG, LOG_ID + "(getAllCompanies) that.account.roles : ", accountRoles);

            let url: string = "/api/rainbow/admin/v1.0/companies";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "bpId", bpId);
            addParamToUrl(urlParamsTab, "catalogId", catalogId);
            addParamToUrl(urlParamsTab, "offerId", offerId);
            addParamToUrl(urlParamsTab, "offerCanBeSold", offerCanBeSold);
            addParamToUrl(urlParamsTab, "externalReference", externalReference);
            addParamToUrl(urlParamsTab, "externalReference2", externalReference2);
            addParamToUrl(urlParamsTab, "salesforceAccountId", salesforceAccountId);
            addParamToUrl(urlParamsTab, "selectedAppCustomisationTemplate", selectedAppCustomisationTemplate);
            addParamToUrl(urlParamsTab, "selectedThemeObj", selectedThemeObj);
            addParamToUrl(urlParamsTab, "offerGroupName", offerGroupName);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "visibility", visibility);
            addParamToUrl(urlParamsTab, "organisationId", organisationId);
            addParamToUrl(urlParamsTab, "isBP", isBP);
            addParamToUrl(urlParamsTab, "hasBP", hasBP);
            addParamToUrl(urlParamsTab, "bpType", bpType);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllCompanies) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllCompanies) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllCompanies) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllCompanies) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllCompanies) error : ", err);
                return reject(err);
            });
            that._logger.log(that.DEBUG, LOG_ID + "(getAllCompanies) after sending the request");
        });
    }

    createCompany(name, country, state, offerType) {
        // API https://api.openrainbow.org/admin/#api-companies-PostCompanies
        // URL post /api/rainbow/admin/v1.0/companies
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createCompany) entry`);
        return new Promise(function (resolve, reject) {
            let countryObj = {
                name: name,
                country: "Fr",
                state: null,
                offerType: "freemium"
            };

            if (country) {
                countryObj.country = country;
            }
            if (state) {
                countryObj.state = state;
            }
            if (offerType) {
                countryObj.offerType = offerType
            }

            that.http.post('/api/rainbow/admin/v1.0/companies', that.getRequestHeader(), countryObj, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createCompany) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createCompany) REST result : ", json);
                if (json && json.data) {
                    resolve(json?.data);
                } else {
                    resolve(json);
                }
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createCompany) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createCompany) error : ", err);
                return reject(err);
            });
        });
    }

    getCompany(companyId) {
        // API https://api.openrainbow.org/admin/#api-companies-GetCompaniesId
        // URL get /api/rainbow/admin/v1.0/companies/:companyId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCompany) entry`);
        return new Promise(function (resolve, reject) {
            that.http.get('/api/rainbow/admin/v1.0/companies/' + companyId, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCompany) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCompany) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCompany) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCompany) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCompany(companyId) {
        // API https://api.openrainbow.org/admin/#api-companies-DeleteCompanies
        // URL delete /api/rainbow/admin/v1.0/companies/:companyId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteCompany) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.DEBUG, LOG_ID + "(deleteCompany) companyId", companyId);
            that.http.delete('/api/rainbow/admin/v1.0/companies/' + companyId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteCompany) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteCompany) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteCompany) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCompany) error : ", err);
                return reject(err);
            });
        });
    }

    getCompanyInfos(companyId, format: string = "full", selectedThemeObj: boolean = false, name: string, status: string, visibility: string, organisationId: string, isBP: boolean, hasBP: boolean, bpType: string) {
        // API https://api.openrainbow.org/enduser/#api-companies-getCompanyById
        // URL get /api/rainbow/enduser/v1.0/companies/:companyId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCompanyInfos) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = '/api/rainbow/enduser/v1.0/companies/' + companyId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "selectedThemeObj", selectedThemeObj);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "visibility", visibility);
            addParamToUrl(urlParamsTab, "organisationId", organisationId);
            addParamToUrl(urlParamsTab, "isBP", isBP);
            addParamToUrl(urlParamsTab, "hasBP", hasBP);
            addParamToUrl(urlParamsTab, "bpType", bpType);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyInfos) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCompanyInfos) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyInfos) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCompanyInfos) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCompanyInfos) error : ", err);
                return reject(err);
            });
        });
    }

    getCompaniesBPBusinessType() {
        // API https://api.openrainbow.org/admin/#api-companies-GetCompaniesBpBusinessType
        // URL get /api/rainbow/admin/v1.0/companies/bpbusinesstypes
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCompaniesBPBusinessType) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/companies/bpbusinesstypes";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCompaniesBPBusinessType) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCompaniesBPBusinessType) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCompaniesBPBusinessType) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCompaniesBPBusinessType) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCompaniesBPBusinessType) error : ", err);
                return reject(err);
            });
        });
    }

    getCompanyAppFeatureCustomisation(_companyId: string, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies-GetCompanyAppFeatureCustomisation
        // URL get /api/rainbow/admin/v1.0/companies/:companyId/app-feature-customisation
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCompanyAppFeatureCustomisation) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url: string = "/api/rainbow/admin/v1.0/companies/" + companyId + "/app-feature-customisation";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyAppFeatureCustomisation) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCompanyAppFeatureCustomisation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyAppFeatureCustomisation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCompanyAppFeatureCustomisation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCompanyAppFeatureCustomisation) error : ", err);
                return reject(err);
            });
        });
    }

    getCompanyServiceDescriptionFile(_companyId: string, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies-GetCompaniesServiceDescription
        // URL get /api/rainbow/admin/v1.0/companies/:companyId/service-description
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCompanyServiceDescriptionFile) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url: string = "/api/rainbow/admin/v1.0/companies/" + companyId + "/app-feature-customisation";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyServiceDescriptionFile) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCompanyServiceDescriptionFile) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyServiceDescriptionFile) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCompanyServiceDescriptionFile) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCompanyServiceDescriptionFile) error : ", err);
                return reject(err);
            });
        });
    }

    getDefaultCompanyData(format: string, selectedThemeObj: boolean) {
        // API https://api.openrainbow.org/admin/#api-companies-GetDefaultCompany
        // URL get /api/rainbow/admin/v1.0/companies/default
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getDefaultCompanyData) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/companies/default";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "selectedThemeObj", selectedThemeObj);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getDefaultCompanyData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getDefaultCompanyData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDefaultCompanyData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDefaultCompanyData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDefaultCompanyData) error : ", err);
                return reject(err);
            });
        });
    }

    setCompanyAppFeatureCustomisation(_companyId: string, appFeaturesCustomisation: any, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies-SetCompanyFeatureCustomisation
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/app-feature-customisation
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(setCompanyAppFeatureCustomisation) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/app-feature-customisation";
            let data: any = appFeaturesCustomisation;

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setCompanyAppFeatureCustomisation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setCompanyAppFeatureCustomisation) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setCompanyAppFeatureCustomisation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setCompanyAppFeatureCustomisation) error : ", err);
                return reject(err);
            });
        });
    }

    updateCompany(_companyId: string, selectedThemeObj: boolean, name: string, country: string = "FRA", street: string, city: string, state: string, postalCode: string, offerType: string = "freemium",
        currency: string, status: string, visibility: string = "private", visibleBy: string[], adminEmail: string, supportEmail: string, supportUrlFAQ: string, companyContactId: string, disableCCareAdminAccess: boolean,
        disableCCareAdminAccessCustomers: boolean, disableCCareAdminAccessResellers: boolean, autoAcceptUserInvitations: boolean = true, autoAddToUserNetwork: boolean = false, contentPolicyLifeTime: boolean,
        documentGracePeriod: boolean, userSelfRegisterAllowedDomains: string[], slogan: string, description: string, size: string = "self-employed", economicActivityClassification: string, website: string,
        giphyEnabled: boolean, catalogId: string, adminCanSetCustomData: boolean, customData: any, bpId: string, adminHasRightToUpdateSubscriptions: boolean, adminAllowedUpdateSubscriptionsOps: string, isBP: boolean,
        bpType: string, bpBusinessModel: string, bpApplicantNumber: string, bpCRDid: string, bpHasRightToSell: boolean, bpHasRightToConnect: boolean, bpHasRightForBYOT: boolean, preferredSipLoadBalancerId: string,
        bpIsContractAccepted: boolean, externalReference: string, externalReference2: string, salesforceAccountId: string, avatarShape: string, isCentrex: boolean, companyCallNumber: string, superadminComment: string,
        bpBusinessType: string[], billingModel: string, allowUsersSelectTheme: boolean, allowUsersSelectPublicTheme: boolean, selectedTheme: any, mobilePermanentConnectionMode: boolean,
        alertNotificationReception: string, alertNotificationSending: string, useDialOutCustomisation: string, allowDeviceFirmwareSelection: boolean, selectedDeviceFirmware: string, cloudPbxVoicemailToEmail: string,
        businessData: any, defaultLicenseGroup: string, defaultOptionsGroups: string[], selectedThemeCustomers: any, allowTeamsToDesktopSso: boolean = true, cloudPbxRecordingInboundOnly?: boolean,
        supervisionGroupMaxSize?: number, supervisionGroupMaxNumber?: number, supervisionGroupMaxUsers?: number,
        timezone?: string, sendPrepaidSubscriptionsNotification?: boolean, ddiReadOnly?: boolean, allowPhoneNumbersVisibility?: boolean, csEmailList?: string[], seEmailList?: string[], csmEmailList?: string[],
        kamEmailList?: string[], businessSpecific?: string, adminServiceNotificationsLevel?: string, defaultCompanyId?: string): Promise<any> {
        // API https://api.openrainbow.org/admin/#api-companies-PutCompanies
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateCompany) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "selectedThemeObj", selectedThemeObj);
            url = urlParamsTab[0];

            let data: any = {};
            addPropertyToObj(data, "name", name, false);
            addPropertyToObj(data, "country", country, false);
            addPropertyToObj(data, "street", street, false);
            addPropertyToObj(data, "city", city, false);
            addPropertyToObj(data, "state", state, false);
            addPropertyToObj(data, "postalCode", postalCode, false);
            addPropertyToObj(data, "offerType", offerType, false);
            addPropertyToObj(data, "currency", currency, false);
            addPropertyToObj(data, "status", status, false);
            addPropertyToObj(data, "visibility", visibility, false);
            addPropertyToObj(data, "visibleBy", visibleBy, false);
            addPropertyToObj(data, "adminEmail", adminEmail, false);
            addPropertyToObj(data, "supportEmail", supportEmail, false);
            addPropertyToObj(data, "supportUrlFAQ", supportUrlFAQ, false);
            addPropertyToObj(data, "companyContactId", companyContactId, false);
            addPropertyToObj(data, "disableCCareAdminAccess", disableCCareAdminAccess, false);
            addPropertyToObj(data, "disableCCareAdminAccessCustomers", disableCCareAdminAccessCustomers, false);
            addPropertyToObj(data, "disableCCareAdminAccessResellers", disableCCareAdminAccessResellers, false);
            addPropertyToObj(data, "autoAcceptUserInvitations", autoAcceptUserInvitations, false);
            addPropertyToObj(data, "autoAddToUserNetwork", autoAddToUserNetwork, false);
            addPropertyToObj(data, "contentPolicyLifeTime", contentPolicyLifeTime, false);
            addPropertyToObj(data, "documentGracePeriod", documentGracePeriod, false);
            addPropertyToObj(data, "userSelfRegisterAllowedDomains", userSelfRegisterAllowedDomains, false);
            addPropertyToObj(data, "slogan", slogan, false);
            addPropertyToObj(data, "description", description, false);
            addPropertyToObj(data, "size", size, false);
            addPropertyToObj(data, "economicActivityClassification", economicActivityClassification, false);
            addPropertyToObj(data, "website", website, false);
            addPropertyToObj(data, "giphyEnabled", giphyEnabled, false);
            addPropertyToObj(data, "catalogId", catalogId, false);
            addPropertyToObj(data, "adminCanSetCustomData", adminCanSetCustomData, false);
            addPropertyToObj(data, "customData", customData, false);
            addPropertyToObj(data, "bpId", bpId, false);
            addPropertyToObj(data, "adminHasRightToUpdateSubscriptions", adminHasRightToUpdateSubscriptions, false);
            addPropertyToObj(data, "adminAllowedUpdateSubscriptionsOps", adminAllowedUpdateSubscriptionsOps, false);
            addPropertyToObj(data, "isBP", isBP, false);
            addPropertyToObj(data, "bpType", bpType, false);
            addPropertyToObj(data, "bpBusinessModel", bpBusinessModel, false);
            addPropertyToObj(data, "bpApplicantNumber", bpApplicantNumber, false);
            addPropertyToObj(data, "bpCRDid", bpCRDid, false);
            addPropertyToObj(data, "bpHasRightToSell", bpHasRightToSell, false);
            addPropertyToObj(data, "bpHasRightToConnect", bpHasRightToConnect, false);
            addPropertyToObj(data, "bpHasRightForBYOT", bpHasRightForBYOT, false);
            addPropertyToObj(data, "preferredSipLoadBalancerId", preferredSipLoadBalancerId, false);
            addPropertyToObj(data, "bpIsContractAccepted", bpIsContractAccepted, false);
            addPropertyToObj(data, "externalReference", externalReference, false);
            addPropertyToObj(data, "externalReference2", externalReference2, false);
            addPropertyToObj(data, "salesforceAccountId", salesforceAccountId, false);
            addPropertyToObj(data, "avatarShape", avatarShape, false);
            addPropertyToObj(data, "isCentrex", isCentrex, false);
            addPropertyToObj(data, "companyCallNumber", companyCallNumber, false);
            addPropertyToObj(data, "superadminComment", superadminComment, false);
            addPropertyToObj(data, "bpBusinessType", bpBusinessType, false);
            addPropertyToObj(data, "billingModel", billingModel, false);
            addPropertyToObj(data, "allowUsersSelectTheme", allowUsersSelectTheme, false);
            addPropertyToObj(data, "allowUsersSelectPublicTheme", allowUsersSelectPublicTheme, false);
            addPropertyToObj(data, "selectedTheme", selectedTheme, false);
            addPropertyToObj(data, "mobilePermanentConnectionMode", mobilePermanentConnectionMode, false);
            addPropertyToObj(data, "alertNotificationReception", alertNotificationReception, false);
            addPropertyToObj(data, "alertNotificationSending", alertNotificationSending, false);
            addPropertyToObj(data, "useDialOutCustomisation", useDialOutCustomisation, false);
            addPropertyToObj(data, "allowDeviceFirmwareSelection", allowDeviceFirmwareSelection, false);
            addPropertyToObj(data, "selectedDeviceFirmware", selectedDeviceFirmware, false);
            addPropertyToObj(data, "cloudPbxVoicemailToEmail", cloudPbxVoicemailToEmail, false);
            addPropertyToObj(data, "businessData", businessData, false);
            addPropertyToObj(data, "defaultLicenseGroup", defaultLicenseGroup, false);
            addPropertyToObj(data, "defaultOptionsGroups", defaultOptionsGroups, false);
            addPropertyToObj(data, "selectedThemeCustomers", selectedThemeCustomers, false);
            addPropertyToObj(data, "allowTeamsToDesktopSso", allowTeamsToDesktopSso, false);
            addPropertyToObj(data, "cloudPbxRecordingInboundOnly", cloudPbxRecordingInboundOnly, false);
            addPropertyToObj(data, "supervisionGroupMaxSize", supervisionGroupMaxSize, false);
            addPropertyToObj(data, "supervisionGroupMaxNumber", supervisionGroupMaxNumber, false);
            addPropertyToObj(data, "supervisionGroupMaxUsers", supervisionGroupMaxUsers, false);
            addPropertyToObj(data, "timezone", timezone, false);
            addPropertyToObj(data, "sendPrepaidSubscriptionsNotification", sendPrepaidSubscriptionsNotification, false);
            addPropertyToObj(data, "ddiReadOnly", ddiReadOnly, false);
            addPropertyToObj(data, "allowPhoneNumbersVisibility", allowPhoneNumbersVisibility, false);
            addPropertyToObj(data, "csEmailList", csEmailList, false);
            addPropertyToObj(data, "seEmailList", seEmailList, false);
            addPropertyToObj(data, "csmEmailList", csmEmailList, false);
            addPropertyToObj(data, "kamEmailList", kamEmailList, false);
            addPropertyToObj(data, "businessSpecific", businessSpecific, false);
            addPropertyToObj(data, "adminServiceNotificationsLevel", adminServiceNotificationsLevel, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCompany) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCompany) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCompany) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCompany) error : ", err);
                return reject(err);
            });
        });
    }

    updateCompanyByObj(_companyId: string, selectedThemeObj: boolean, companyInfoToUpdate: any, defaultCompanyId: string): Promise<any> {
        // API https://api.openrainbow.org/admin/#api-companies-PutCompanies
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateCompanyByObj) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "selectedThemeObj", selectedThemeObj);
            url = urlParamsTab[0];

            let data: any = {};

            Object.getOwnPropertyNames(companyInfoToUpdate).forEach(
                (val, idx, array) => {
                    addPropertyToObj(data, val, companyInfoToUpdate[val], false);
                });

            that._logger.log(that.DEBUG, LOG_ID + "(updateCompanyByObj) data : ", data);

            that.http.put(url, that.getRequestHeader(), companyInfoToUpdate, undefined, 0, 0).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateCompanyByObj) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateCompanyByObj) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateCompanyByObj) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCompanyByObj) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Company Management

    //region Companies RainbowMFA Settings

    createRainbowMultifactorAuthenticationServerConfiguration(_companyId: string, enabledForAllCompanyUsers: boolean, mfaName: string, mfaType: string, mfaPolicy: string, rememberDaysApplication: string, mfaCanBeDisabled: boolean, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-PostCompanyRainbowMFASettings
        // URL POST /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createRainbowMultifactorAuthenticationServerConfiguration) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/settings/rainbowmfa";
            let data: any = {};
            addPropertyToObj(data, "enabledForAllCompanyUsers", enabledForAllCompanyUsers, false);
            addPropertyToObj(data, "mfaName", mfaName, false);
            addPropertyToObj(data, "mfaType", mfaType, false);
            addPropertyToObj(data, "mfaPolicy", mfaPolicy, false);
            addPropertyToObj(data, "rememberDaysApplication", rememberDaysApplication, false);
            addPropertyToObj(data, "mfaCanBeDisabled", mfaCanBeDisabled, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createRainbowMultifactorAuthenticationServerConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createRainbowMultifactorAuthenticationServerConfiguration) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createRainbowMultifactorAuthenticationServerConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createRainbowMultifactorAuthenticationServerConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    deleteRainbowMultifactorConfiguration(_companyId: string, mfaId: string, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-DeleteCompanyRainbowMFASettings
        // URL delete /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa/:mfaId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteRainbowMultifactorConfiguration) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/settings/rainbowmfa/" + mfaId;
            that._logger.log(that.DEBUG, LOG_ID + "(deleteRainbowMultifactorConfiguration) companyId", companyId);
            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteRainbowMultifactorConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteRainbowMultifactorConfiguration) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteRainbowMultifactorConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteRainbowMultifactorConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    getRainbowMultifactorConfiguration(_companyId: string, mfaId: string, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-GetCompanyRainbowMFASettings
        // URL get /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa/:mfaId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getRainbowMultifactorConfiguration) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/settings/rainbowmfa/" + mfaId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getRainbowMultifactorConfiguration) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getRainbowMultifactorConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getRainbowMultifactorConfiguration) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getRainbowMultifactorConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getRainbowMultifactorConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    getAllRainbowMultifactorConfiguration(_companyId: string, format: string = "medium", defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-GetAllCompanyRainbowMFASettings
        // URL get /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllRainbowMultifactorConfiguration) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/settings/rainbowmfa";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllRainbowMultifactorConfiguration) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllRainbowMultifactorConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllRainbowMultifactorConfiguration) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllRainbowMultifactorConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllRainbowMultifactorConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    updateRainbowMultifactorAuthenticationConfiguration(_companyId: string, mfaId: string, enabledForAllCompanyUsers: boolean, mfaName: string, mfaType: string, mfaPolicy: string, rememberDaysApplication: string, mfaCanBeDisabled: boolean, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_RainbowMFA_settings-PutCompanyRainbowMFASettings
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/settings/rainbowmfa/:mfaId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateRainbowMultifactorAuthenticationConfiguration) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/settings/rainbowmfa/" + mfaId;
            let data: any = {};
            addPropertyToObj(data, "enabledForAllCompanyUsers", enabledForAllCompanyUsers, false);
            addPropertyToObj(data, "mfaName", mfaName, false);
            addPropertyToObj(data, "mfaType", mfaType, false);
            addPropertyToObj(data, "mfaPolicy", mfaPolicy, false);
            addPropertyToObj(data, "rememberDaysApplication", rememberDaysApplication, false);
            addPropertyToObj(data, "mfaCanBeDisabled", mfaCanBeDisabled, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateRainbowMultifactorAuthenticationConfiguration) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateRainbowMultifactorAuthenticationConfiguration) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateRainbowMultifactorAuthenticationConfiguration) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateRainbowMultifactorAuthenticationConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Companies RainbowMFA Settings

    //region Company join companies links

    createAJoinCompanyLink(_companyId: string, description: string = undefined, isEnabled: boolean = true, expirationDate: string = undefined, maxNumberUsers: number = undefined, defaultCompanyId?: string) {
        // API https://api.openrainbow.org/admin/#api-join_companies_links-PostJoinCompaniesLinks
        // URL POST /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createAJoinCompanyLink) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/join-companies/links";
            let data: any = {};
            addPropertyToObj(data, "description", description, false);
            addPropertyToObj(data, "isEnabled", isEnabled, false);
            addPropertyToObj(data, "expirationDate", expirationDate, false);
            addPropertyToObj(data, "maxNumberUsers", maxNumberUsers, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createAJoinCompanyLink) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createAJoinCompanyLink) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createAJoinCompanyLink) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createAJoinCompanyLink) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAJoinCompanyLink(_companyId: string, joinCompanyLinkId: string, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-join_companies_links-DeleteJoinCompaniesLinksById
        // URL delete /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links/:joinCompanyLinkId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteAJoinCompanyLink) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            that._logger.log(that.DEBUG, LOG_ID + "(deleteAJoinCompanyLink) companyId", companyId);
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/join-companies/links/" + joinCompanyLinkId;
            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAJoinCompanyLink) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAJoinCompanyLink) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAJoinCompanyLink) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAJoinCompanyLink) error : ", err);
                return reject(err);
            });
        });
    }

    getAJoinCompanyLink(companyId: string, joinCompanyLinkId: string) {
        // API https://api.openrainbow.org/admin/#api-join_companies_links-GetJoinCompaniesLinksById
        // URL get /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links/:joinCompanyLinkId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAJoinCompanyLink) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = '/api/rainbow/admin/v1.0/companies/" + companyId + "/join-companies/links/" + joinCompanyLinkId';
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAJoinCompanyLink) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAJoinCompanyLink) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAJoinCompanyLink) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAJoinCompanyLink) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAJoinCompanyLink) error : ", err);
                return reject(err);
            });
        });
    }

    getAllJoinCompanyLinks(_companyId, format: string = "small", createdByAdminId: string = undefined, isEnabled: boolean = undefined, fromExpirationDate: string = undefined, toExpirationDate: string = undefined,
        fromNbUsersRegistered: string = undefined, toNbUsersRegistered: string = undefined, limit: number = 100, offset: number = 0, sortField: string = undefined, sortOrder: number = 1, defaultCompanyId?: string) {
        // API https://api.openrainbow.org/admin/#api-join_companies_links-GetJoinCompaniesLinks
        // URL get /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllJoinCompanyLinks) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url: string = "/api/rainbow/admin/v1.0/companies/" + companyId + "/join-companies/links";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "createdByAdminId", createdByAdminId);
            addParamToUrl(urlParamsTab, "isEnabled", isEnabled);
            addParamToUrl(urlParamsTab, "fromExpirationDate", fromExpirationDate);
            addParamToUrl(urlParamsTab, "toExpirationDate", toExpirationDate);
            addParamToUrl(urlParamsTab, "fromNbUsersRegistered", fromNbUsersRegistered);
            addParamToUrl(urlParamsTab, "toNbUsersRegistered", toNbUsersRegistered);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllJoinCompanyLinks) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllJoinCompanyLinks) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllJoinCompanyLinks) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllJoinCompanyLinks) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllJoinCompanyLinks) error : ", err);
                return reject(err);
            });
        });
    }

    updateAJoinCompanyLink(_companyId: string, joinCompanyLinkId: string, description: string, isEnabled: boolean = true,
        expirationDate: string, maxNumberUsers: number, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-join_companies_links-PutJoinCompaniesLinks
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links/:joinCompanyLinkId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateAJoinCompanyLink) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/join-companies/links";
            let data: any = {};
            addPropertyToObj(data, "description", description, false);
            addPropertyToObj(data, "isEnabled", isEnabled, false);
            addPropertyToObj(data, "expirationDate", expirationDate, false);
            addPropertyToObj(data, "maxNumberUsers", maxNumberUsers, false);

            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateAJoinCompanyLink) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateAJoinCompanyLink) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateAJoinCompanyLink) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateAJoinCompanyLink) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Company join companies links

    //region Company from end user portal

    createCompanyFromDefault(name, visibility: string = "public", country?: string, state?: string, slogan?: string, description?: string, size?: string, economicActivityClassification?: string, website?: string, avatarShape?: string, giphyEnabled?: boolean) {
        // API https://api.openrainbow.org/enduser/#api-companies-createCompany
        // URL post /api/rainbow/enduser/v1.0/companies
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createCompanyFromDefault) entry`);
        return new Promise(function (resolve, reject) {
            let countryObj: any = {
                name: name,
                country: "Fr",
                state: null,
            };

            if (visibility) {
                countryObj.visibility = visibility;
            }
            if (country) {
                countryObj.country = country;
            }
            if (state) {
                countryObj.state = state;
            }
            if (slogan) {
                countryObj.slogan = slogan
            }
            if (description) {
                countryObj.description = description
            }
            if (size) {
                countryObj.size = size
            }
            if (economicActivityClassification) {
                countryObj.economicActivityClassification = economicActivityClassification
            }
            if (website) {
                countryObj.website = website
            }
            if (avatarShape) {
                countryObj.avatarShape = avatarShape
            }
            if (giphyEnabled) {
                countryObj.slogan = giphyEnabled
            }

            that.http.post('/api/rainbow/enduser/v1.0/companies', that.getRequestHeader(), countryObj, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createCompanyFromDefault) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createCompanyFromDefault) REST result : ", json);
                if (json && json.data) {
                    resolve(json?.data);
                } else {
                    resolve(json);
                }
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createCompanyFromDefault) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createCompanyFromDefault) error : ", err);
                return reject(err);
            });
        });
    }

    getAllCompaniesVisibleByUser(format: string = "small", sortField: string = "name", limit: number = 100, offset: number = 0, sortOrder: number = 1, name?: string, status?: string, visibility?: string, organisationId?: string, isBP?: boolean, hasBP?: boolean, bpType?: string) {
        // API https://api.openrainbow.org/enduser/#api-companies-getCompanies
        // URL get /api/rainbow/enduser/v1.0/companies
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllCompaniesVisibleByUser) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = '/api/rainbow/enduser/v1.0/companies';
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "visibility", visibility);
            addParamToUrl(urlParamsTab, "organisationId", organisationId);
            addParamToUrl(urlParamsTab, "isBP", isBP);
            addParamToUrl(urlParamsTab, "hasBP", hasBP);
            addParamToUrl(urlParamsTab, "bpType", bpType);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllCompaniesVisibleByUser) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllCompaniesVisibleByUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllCompaniesVisibleByUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllCompaniesVisibleByUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllCompaniesVisibleByUser) error : ", err);
                return reject(err);
            });
        });
    }

    getCompanyAdministrators(companyId: string, format: string = "small", limit: number = 100, offset: number = 0) {
        // API https://api.openrainbow.org/enduser/#api-companies-getCompanyAdministrators
        // URL get /api/rainbow/enduser/v1.0/companies/:companyId/administrators
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCompanyAdministrators) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = '/api/rainbow/enduser/v1.0/companies/' + companyId + '/administrators';
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyAdministrators) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCompanyAdministrators) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyAdministrators) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCompanyAdministrators) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCompanyAdministrators) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Company from end user portal

    //region Company visibility

    setVisibilityForCompany(companyId, visibleByCompanyId) {
        // API https://api.openrainbow.org/admin/#api-companies_visibility-PostCompaniesVisibility
        // URL post /api/rainbow/admin/v1.0/companies/:companyId/visible-by/:otherCompanyId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(setVisibilityForCompany) entry`);
        return new Promise(function (resolve, reject) {
            that.http.post('/api/rainbow/admin/v1.0/companies/' + companyId + "/visible-by/" + visibleByCompanyId, that.getRequestHeader(), undefined, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setVisibilityForCompany) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setVisibilityForCompany) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setVisibilityForCompany) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setVisibilityForCompany) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Company visibility

    //region Company join company invitations

    acceptJoinCompanyInvitation(invitationId: string, userId: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_invitations-acceptJoinCompanyInvitation
        // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/invitations/:invitationId/accept
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(acceptJoinCompanyInvitation) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/join-companies/invitations/" + invitationId + "/accept";
            let data = {};

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(acceptJoinCompanyInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(acceptJoinCompanyInvitation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(acceptJoinCompanyInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(acceptJoinCompanyInvitation) error : ", err);
                return reject(err);
            });
        });
    }

    declineJoinCompanyInvitation(invitationId: string, userId: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_invitations-declineJoinCompanyInvitation
        // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/invitations/:invitationId/decline
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(declineJoinCompanyInvitation) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/join-companies/invitations/" + invitationId + "/decline";
            let data = {};

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(declineJoinCompanyInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(declineJoinCompanyInvitation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(declineJoinCompanyInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(declineJoinCompanyInvitation) error : ", err);
                return reject(err);
            });
        });
    }

    getJoinCompanyInvitation(invitationId: string, userId: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_invitations-getJoinCompanyInvitationById
        // URL get /api/rainbow/enduser/v1.0/users/:userId/join-companies/invitations/:invitationId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getJoinCompanyInvitation) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/join-companies/invitations/" + invitationId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getJoinCompanyInvitation) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getJoinCompanyInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getJoinCompanyInvitation) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getJoinCompanyInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getJoinCompanyInvitation) error : ", err);
                return reject(err);
            });
        });
    }

    getAllJoinCompanyInvitations(sortField: string = "lastNotificationDate", status: string, format: string = "small", limit: number = 100, offset: number = 0, sortOrder: number = 1, userId: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_invitations-getJoinCompanyInvitations
        // URL get /api/rainbow/enduser/v1.0/users/:userId/join-companies/invitations
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllJoinCompanyInvitations) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/join-companies/invitations";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllJoinCompanyInvitations) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllJoinCompanyInvitations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllJoinCompanyInvitations) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllJoinCompanyInvitations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllJoinCompanyInvitations) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Company join company invitations

    //region Company join company requests

    cancelJoinCompanyRequest(joinCompanyRequestId: string, userId: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_requests-cancelJoinCompanyRequest
        // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests/:joinCompanyRequestId/cancel
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(cancelJoinCompanyRequest) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/join-companies/requests/" + joinCompanyRequestId + "/cancel";
            let data = {};

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(cancelJoinCompanyRequest) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(cancelJoinCompanyRequest) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(cancelJoinCompanyRequest) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(cancelJoinCompanyRequest) error : ", err);
                return reject(err);
            });
        });
    }

    getJoinCompanyRequest(joinCompanyRequestId: string, userId: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_requests-getJoinCompanyRequestById
        // URL get /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests/:joinCompanyRequestId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getJoinCompanyRequest) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/join-companies/requests/" + joinCompanyRequestId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getJoinCompanyRequest) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getJoinCompanyRequest) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getJoinCompanyRequest) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getJoinCompanyRequest) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getJoinCompanyRequest) error : ", err);
                return reject(err);
            });
        });
    }

    getAllJoinCompanyRequests(sortField: string = "lastNotificationDate", status: string, format: string = "small", limit: number = 100, offset: number = 0, sortOrder: number = 1, userId: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_requests-getJoinCompanyRequests
        // URL get /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllJoinCompanyRequests) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/join-companies/requests";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllJoinCompanyRequests) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllJoinCompanyRequests) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllJoinCompanyRequests) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllJoinCompanyRequests) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllJoinCompanyRequests) error : ", err);
                return reject(err);
            });
        });
    }

    resendJoinCompanyRequest(joinCompanyRequestId: string, userId: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_requests-resendJoinCompanyRequest
        // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests/:joinCompanyRequestId/re-send
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(resendJoinCompanyRequest) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/join-companies/requests/" + joinCompanyRequestId + "/re-send";
            let data = {};

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(resendJoinCompanyRequest) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(resendJoinCompanyRequest) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(resendJoinCompanyRequest) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(resendJoinCompanyRequest) error : ", err);
                return reject(err);
            });
        });
    }

    requestToJoinCompany(requestedCompanyId?: string, requestedCompanyAdminId?: string, requestedCompanyLinkId?: string, lang: string = "en", userId?: string) {
        // API https://api.openrainbow.org/enduser/#api-join_company_requests-sendJoinCompanyRequest
        // URL POST /api/rainbow/enduser/v1.0/users/:userId/join-companies/requests
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(requestToJoinCompany) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/join-companies/requests/";
            let data: any = {};
            addPropertyToObj(data, "requestedCompanyId", requestedCompanyId, false);
            addPropertyToObj(data, "requestedCompanyAdminId", requestedCompanyAdminId, false);
            addPropertyToObj(data, "requestedCompanyLinkId", requestedCompanyLinkId, false);
            addPropertyToObj(data, "lang", lang, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(requestToJoinCompany) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(requestToJoinCompany) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(requestToJoinCompany) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(requestToJoinCompany) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Company join company requests

    //region Companies Customization Emails

    getEmailTemplatesDocumentation(format: string) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-GetCompanyCustomizationEmailsDocumentation
        // URL GET /api/rainbow/admin/v1.0/companies/customizations/emails
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getEmailTemplatesDocumentation) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/companies/customizations/emails";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getEmailTemplatesDocumentation) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getEmailTemplatesDocumentation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getEmailTemplatesDocumentation) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getEmailTemplatesDocumentation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getEmailTemplatesDocumentation) error : ", err);
                return reject(err);
            });
        });
    }

    initiateEmailTemplate(_companyId: string, templateName: string, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-CreateCompanyCustomizationEmails
        // URL POST /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(initiateEmailTemplate) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails";
            let data: any = {};
            addPropertyToObj(data, "templateName", templateName, false);

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(initiateEmailTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(initiateEmailTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(initiateEmailTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(initiateEmailTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    updateSubjectPartTemplate(_companyId: string, templateName: string, body: any, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-UpdateCompanyCustomizationEmailsSubject
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/:templateName/subject
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateSubjectPartTemplate) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails/" + templateName + "/subject";
            let data: any = body;

            that.http.put(url, that.getRequestHeader(), data, 'text/plain; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateSubjectPartTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateSubjectPartTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateSubjectPartTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateSubjectPartTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    updateMjmlFormatPartTemplate(_companyId: string, templateName: string, body: any, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-UpdateCompanyCustomizationEmailsMjml
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/:templateName/mjml-format
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateMjmlFormatPartTemplate) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails/" + templateName + "/mjml-format";
            let data: any = body;

            that.http.put(url, that.getRequestHeader(), data, 'text/plain; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateMjmlFormatPartTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateMjmlFormatPartTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateMjmlFormatPartTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateMjmlFormatPartTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    updateTextFormatFormatPartTemplate(_companyId: string, templateName: string, body: any, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-UpdateCompanyCustomizationEmailsText
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/:templateName/text-format
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateTextFormatFormatPartTemplate) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails/" + templateName + "/text-format";
            let data: any = body;

            that.http.put(url, that.getRequestHeader(), data, 'text/plain; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateTextFormatFormatPartTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateTextFormatFormatPartTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateTextFormatFormatPartTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateTextFormatFormatPartTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    getEmailTemplatesByCompanyId(_companyId: string, templateName: string, format: any, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-GetCompanyCustomizationEmails
        // URL get /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getEmailTemplatesByCompanyId) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url: string = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "templateName", templateName);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getEmailTemplatesByCompanyId) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getEmailTemplatesByCompanyId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getEmailTemplatesByCompanyId) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getEmailTemplatesByCompanyId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getEmailTemplatesByCompanyId) error : ", err);
                return reject(err);
            });
        });
    }

    deleteEmailTemplate(_companyId: string, templateName: string, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-DeleteOneCompanyCustomizationEmail
        // URL delete /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/:templateName
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteEmailTemplate) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails/" + templateName;
            that._logger.log(that.DEBUG, LOG_ID + "(deleteEmailTemplate) url", url);

            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteEmailTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteEmailTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteEmailTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteEmailTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAvailableEmailTemplatesBycompanyId(_companyId: string, templateName: string, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-DeleteCompanyCustomizationEmails
        // URL delete /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/all
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteAvailableEmailTemplatesBycompanyId) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails/all";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "templateName", templateName);
            url = urlParamsTab[0];
            that._logger.log(that.DEBUG, LOG_ID + "(deleteAvailableEmailTemplatesBycompanyId) url", url);

            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAvailableEmailTemplatesBycompanyId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAvailableEmailTemplatesBycompanyId) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAvailableEmailTemplatesBycompanyId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAvailableEmailTemplatesBycompanyId) error : ", err);
                return reject(err);
            });
        });
    }

    testEmailTemplateRendering(_companyId: string, body: any, defaultCompanyId: string): Promise<any> {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-PostCompanyCustomizationEmailsRendering
        // URL POST /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/rendering
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(testEmailTemplateRendering) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails/rendering";
            let data: any = body;

            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(testEmailTemplateRendering) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(testEmailTemplateRendering) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(testEmailTemplateRendering) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(testEmailTemplateRendering) error : ", err);
                return reject(err);
            });
        });
    }

    activateDesactivateEmailTemplate(_companyId: string, templateName: string, isActive, defaultCompanyId: string) {
        // API https://api.openrainbow.org/admin/#api-companies_customization_emails-ActivateOneCompanyCustomizationEmail
        // URL PUT /api/rainbow/admin/v1.0/companies/:companyId/customizations/emails/activation
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(activateDesactivateEmailTemplate) entry`);
        return new Promise(function (resolve, reject) {
            let companyId = _companyId ? _companyId : defaultCompanyId;
            let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/customizations/emails/activation";
            let data: any = {};
            addPropertyToObj(data, "isActive", isActive, false);
            addPropertyToObj(data, "templateName", templateName, false);

            that.http.put(url, that.getRequestHeader(), data, 'text/plain; charset=utf-8').then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(activateDesactivateEmailTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(activateDesactivateEmailTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(activateDesactivateEmailTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(activateDesactivateEmailTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Companies Customization Emails

    //endregion Company

}

module.exports = {'RESTCompany': RESTCompany};
export {RESTCompany as RESTCompany};
