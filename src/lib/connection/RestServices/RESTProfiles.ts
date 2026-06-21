'use strict';

import {logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/PROF - ";

/**
 * Handles all REST API calls related to user profiles and third-party access.
 */
@logEntryExit(LOG_ID)
class RESTProfiles extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTProfiles'; }
    getClassName() { return RESTProfiles.getClassName(); }
    static getAccessorName() { return 'restprofiles'; }
    getAccessorName() { return RESTProfiles.getAccessorName(); }

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

    //region Profiles

    async getServerProfiles(accountId: string) {
        // GET /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getServerProfiles) entry`);
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + accountId + "/profiles", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getServerProfiles) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getServerProfiles) REST result : ", json, " profiles");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getServerProfiles) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getServerProfiles) error : ", err);
                return reject(err);
            });
        });
    }

    getServerProfilesFeatures(accountId: string) {
        // GET /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getServerProfilesFeatures) entry`);
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + accountId + "/profiles/features", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getServerProfilesFeatures) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getServerProfilesFeatures) REST result : " + JSON.stringify(json) + " profiles features");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getServerProfilesFeatures) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getServerProfilesFeatures) error : ", err);
                return reject(err);
            });
        });
    }

    async getThirdPartyApps() {
        // GET /api/rainbow/authentication/v1.0/oauth/tokens?format=medium
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getThirdPartyApps) entry`);
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/authentication/v1.0/oauth/tokens?format=medium", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getThirdPartyApps) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getThirdPartyApps) REST result : ", json, " ThirdPartyApps.");
                resolve((json && json.data) ? json?.data : []);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getThirdPartyApps) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getThirdPartyApps) error : ", err);
                return reject(err);
            });
        });
    }

    async revokeThirdPartyAccess(tokenId) {
        // DELETE /api/rainbow/authentication/v1.0/oauth/tokens/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(revokeThirdPartyAccess) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/authentication/v1.0/oauth/tokens/" + tokenId, that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(revokeThirdPartyAccess) (" + tokenId + ") -- success");
                resolve((json && json.data) ? json?.data : []);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(revokeThirdPartyAccess) (" + tokenId + ") -- failure");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(revokeThirdPartyAccess) (" + tokenId + ") -- failure : ", err.message);
                return reject(err);
            });
        });
    }

    //endregion Profiles

}

module.exports = {'RESTProfiles': RESTProfiles};
export {RESTProfiles as RESTProfiles};
