'use strict';

import {addParamToUrl, addPropertyToObj, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";
import {ErrorManager} from "../../common/ErrorManager";

const LOG_ID = "REST/AUTH - ";

/**
 * Handles all REST API calls related to API keys and multifactor authentication.
 */
@logEntryExit(LOG_ID)
class RESTAuth extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTAuth'; }
    getClassName() { return RESTAuth.getClassName(); }
    static getAccessorName() { return 'restauth'; }
    getAccessorName() { return RESTAuth.getAccessorName(); }

    constructor(_core, evtEmitter, _logger) {
        super(_core, _logger, LOG_ID);
        this.setLogLevels(this);
        let that = this;
        that.evtEmitter = evtEmitter;
        that._logger = _logger;
    }

    start(http) {
        return new Promise((resolve) => {
            let that = this;
            that.http = http;
            resolve(undefined);
        });
    }

    stop() {
        return new Promise((resolve) => {
            resolve(undefined);
        });
    }

    //region apikeys rainbow authentication

    deleteApiKey(apiKeyId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteApiKey) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/authentication/v1.0/apikeys/" + apiKeyId;
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteApiKey) REST url : ", url);
            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteApiKey) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteApiKey) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteApiKey) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteApiKey) error : ", err);
                return reject(err);
            });
        });
    }

    generateApiKey(scope: Array<string> = ["all"], description: string = "", isActive: boolean = true, expirationDate?: string): Promise<[any]> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(generateApiKey) entry`);
        return new Promise(async function (resolve, reject) {
            let url = "/api/rainbow/authentication/v1.0/apikeys";

            let body: any = {};
            addPropertyToObj(body, "scope", scope, false);
            addPropertyToObj(body, "description", description, false);
            addPropertyToObj(body, "isActive", isActive, false);
            addPropertyToObj(body, "expirationDate", expirationDate, false);

            await that.http.post(url, that.getRequestHeader(), body, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(generateApiKey) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(generateApiKey) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(generateApiKey) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(generateApiKey) error : ", err);
                return reject(err);
            });
        });
    }

    getAllApiKey(isActive: boolean = undefined, fromCreationDate: string = undefined, toCreationDate: string = undefined, limit: number = 100, offset: number = 0, sortField: string = "creationDate", sortOrder: number = -1, format: string = "small", userId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllApiKey) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/authentication/v1.0/apikeys";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "isActive", isActive, false);
            addParamToUrl(urlParamsTab, "fromCreationDate", fromCreationDate, false);
            addParamToUrl(urlParamsTab, "toCreationDate", toCreationDate, false);
            addParamToUrl(urlParamsTab, "limit", limit, false);
            addParamToUrl(urlParamsTab, "offset", offset, false);
            addParamToUrl(urlParamsTab, "sortField", sortField, false);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder, false);
            addParamToUrl(urlParamsTab, "format", format, false);
            addParamToUrl(urlParamsTab, "userId", userId, false);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllApiKey) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllApiKey) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllApiKey) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllApiKey) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllApiKey) error : ", err);
                return reject(err);
            });
        });
    }

    getApiKey(apiKeyId: string = undefined) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getApiKey) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/authentication/v1.0/apikeys/" + apiKeyId;

            that._logger.log(that.INTERNAL, LOG_ID + "(getApiKey) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getApiKey) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getApiKey) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getApiKey) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getApiKey) error : ", err);
                return reject(err);
            });
        });
    }

    getCurrentApiKey(apiKeyId: string = undefined) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCurrentApiKey) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/authentication/v1.0/apikeys/current";

            that._logger.log(that.INTERNAL, LOG_ID + "(getCurrentApiKey) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCurrentApiKey) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCurrentApiKey) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCurrentApiKey) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCurrentApiKey) error : ", err);
                return reject(err);
            });
        });
    }

    updateApiKey(apiKeyId: string, description: string, isActive: boolean, expirationDate: string = undefined) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateApiKey) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/authentication/v1.0/apikeys/" + apiKeyId;

            let body: any = {};
            addPropertyToObj(body, "description", description, false);
            addPropertyToObj(body, "isActive", isActive, false);
            addPropertyToObj(body, "expirationDate", expirationDate, false);

            that._logger.log(that.INTERNAL, LOG_ID + "(updateApiKey) args : ", body);
            that.http.put(url, that.getRequestHeader(), body, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateApiKey) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateApiKey) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateApiKey) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateApiKey) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion apikeys rainbow authentication

    //region multifactor rainbow authentication

    deleteTrustedApplication(accountId: string, appId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteTrustedApplication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + accountId + "/mfa/trusted/" + appId;
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteTrustedApplication) REST url : ", url);
            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteTrustedApplication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteTrustedApplication) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteTrustedApplication) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteTrustedApplication) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAllTrustedApplications(accountId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteAllTrustedApplications) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + accountId + "/mfa/trusted";
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteAllTrustedApplications) REST url : ", url);
            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAllTrustedApplications) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAllTrustedApplications) REST result : ", json?.data);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAllTrustedApplications) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAllTrustedApplications) error : ", err);
                return reject(err);
            });
        });
    }

    disableMultifactorAuthentication(accountId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(disableMultifactorAuthentication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + accountId + "/mfa";
            that._logger.log(that.INTERNAL, LOG_ID + "(disableMultifactorAuthentication) REST url : ", url);
            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(disableMultifactorAuthentication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(disableMultifactorAuthentication) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(disableMultifactorAuthentication) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(disableMultifactorAuthentication) error : ", err);
                return reject(err);
            });
        });
    }

    enableMultifactorAuthentication(accountId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(enableMultifactorAuthentication) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = {};
            let url = "/api/rainbow/enduser/v1.0/users/" + accountId + "/mfa";
            that._logger.log(that.INTERNAL, LOG_ID + "(enableMultifactorAuthentication) REST url : ", url);
            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(enableMultifactorAuthentication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(enableMultifactorAuthentication) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(enableMultifactorAuthentication) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(enableMultifactorAuthentication) error : ", err);
                return reject(err);
            });
        });
    }

    getMultifactorInformation(accountId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getMultifactorInformation) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/users/" + accountId + "/mfa";

            that._logger.log(that.INTERNAL, LOG_ID + "(getMultifactorInformation) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getMultifactorInformation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getMultifactorInformation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getMultifactorInformation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getMultifactorInformation) error : ", err);
                return reject(err);
            });
        });
    }

    verifyMultifactorInformation(accountId: string, token) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(verifyMultifactorInformation) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = {};

            if (token) {
                data.token = token;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'token' parameter";
                error.label += "bad or empty 'token' parameter";
                error.cause = token;
                that._logger.log(that.WARN, LOG_ID + `(verifyMultifactorInformation) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(verifyMultifactorInformation) bad or empty 'token' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            let url = "/api/rainbow/enduser/v1.0/users/" + accountId + "/mfa/verify";
            that._logger.log(that.INTERNAL, LOG_ID + "(verifyMultifactorInformation) REST url : ", url);
            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(verifyMultifactorInformation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(verifyMultifactorInformation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(verifyMultifactorInformation) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(verifyMultifactorInformation) error : ", err);
                return reject(err);
            });
        });
    }

    resetRecoveryCodeForMultifactorAuthentication(accountId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(resetRecoveryCodeForMultifactorAuthentication) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + accountId + "/mfa/recovery";
            that._logger.log(that.INTERNAL, LOG_ID + "(resetRecoveryCodeForMultifactorAuthentication) REST url : ", url);
            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(resetRecoveryCodeForMultifactorAuthentication) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(resetRecoveryCodeForMultifactorAuthentication) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(resetRecoveryCodeForMultifactorAuthentication) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(resetRecoveryCodeForMultifactorAuthentication) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion multifactor rainbow authentication

}

module.exports = {'RESTAuth': RESTAuth};
export {RESTAuth as RESTAuth};
