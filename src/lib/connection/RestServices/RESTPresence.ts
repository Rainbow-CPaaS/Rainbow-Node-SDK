'use strict';

import {logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/PRES - ";

/**
 * Handles all REST API calls related to user presence information.
 */
@logEntryExit(LOG_ID)
class RESTPresence extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTPresence'; }
    getClassName() { return RESTPresence.getClassName(); }
    static getAccessorName() { return 'restpresence'; }
    getAccessorName() { return RESTPresence.getAccessorName(); }

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

    //region Presence

    /**
     * @description https://api.openrainbow.org/admin/#api-users_presence-admin_users_GetUserPresence
     * @param {string} userId
     */
    getUserPresenceInformation(userId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getUserPresenceInformation) entry`);
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/admin/v1.0/users/" + userId + "/presences", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getUserPresenceInformation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getUserPresenceInformation) REST result : ", json, " user presence.");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getUserPresenceInformation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getUserPresenceInformation) error : ", err);
                return reject(err);
            });
        });
    }

    getMyPresenceInformation() {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getMyPresenceInformation) entry`);
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/me/presences", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getMyPresenceInformation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getMyPresenceInformation) REST result : ", json, " user presence.");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getMyPresenceInformation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getMyPresenceInformation) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Presence

}

module.exports = {'RESTPresence': RESTPresence};
export {RESTPresence as RESTPresence};
