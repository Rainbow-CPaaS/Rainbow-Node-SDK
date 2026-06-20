'use strict';

import {logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/CONF - ";

/**
 * Handles all REST API calls related to v1 conference provisioning.
 */
@logEntryExit(LOG_ID)
class RESTConference extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTConference'; }
    getClassName() { return RESTConference.getClassName(); }
    static getAccessorName() { return 'restconference'; }
    getAccessorName() { return RESTConference.getAccessorName(); }

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

    //region Conference

    retrieveAllConferences(scheduled, userId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveAllConferences) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/confprovisioning/v1.0/conferences?";
            if (scheduled != undefined) {
                url += "scheduled=" + scheduled;
            }
            url += "&format=full&userId=" + userId;

            that.http.get(url, that.getRequestHeader(), {}).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveAllConferences) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllConferences) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveAllConferences) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveAllConferences) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @param {string} mediaType mediaType of conference to retrieve. Default: "webrtc"
     * @param {string} userId current user id
     */
    retrieveWebConferences(mediaType: string = "webrtc", userId: string): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveWebConferences) entry`);
        return new Promise((resolve, reject) => {
            let urlQueryParameters = "?format=full&userId=" + userId;
            if (mediaType) { urlQueryParameters += "&mediaType=" + mediaType; }

            that.http.get("/api/rainbow/confprovisioning/v1.0/conferences" + urlQueryParameters, that.getRequestHeader(), undefined)
                .then((response) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(retrieveWebConferences) successfully");
                    that._logger.log(that.INTERNAL, LOG_ID + "(retrieveWebConferences) REST result : ", response);
                    resolve(response.data);
                },
                (response) => {
                    let msg = response.data ? response.data.errorDetails : response.data;
                    let errorMessage = "(retrieveWebConferences) failure: " + msg;
                    that._logger.log(that.ERROR, LOG_ID + "(retrieveWebConferences) error : " + errorMessage);
                    reject(new Error(errorMessage));
                });
        });
    }

    //endregion Conference

}

module.exports = {'RESTConference': RESTConference};
export {RESTConference as RESTConference};
