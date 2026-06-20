'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/BDIN - ";

/**
 * Handles all REST API calls related to bubble dial-in phone number management.
 */
@logEntryExit(LOG_ID)
class RESTBubblesDialIn extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTBubblesDialIn'; }
    getClassName() { return RESTBubblesDialIn.getClassName(); }
    static getAccessorName() { return 'restbubblesdialin'; }
    getAccessorName() { return RESTBubblesDialIn.getAccessorName(); }

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

    //region Bubbles - dialIn

    disableDialInForARoom(roomId: string) {
        // API https://api.openrainbow.org/enduser/#api-dialIn-DisableDialIn
        // PUT /api/rainbow/enduser/v1.0/rooms/:roomId/dial-in/disable
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(disableDialInForARoom) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/rooms/" + roomId + "/dial-in/disable";
            that.http.put(url, that.getRequestHeader(), {}, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(disableDialInForARoom) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(disableDialInForARoom) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(disableDialInForARoom) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(disableDialInForARoom) error : ", err);
                return reject(err);
            });
        });
    }

    enableDialInForARoom(roomId: string) {
        // API https://api.openrainbow.org/enduser/#api-dialIn-EnableDialIn
        // PUT /api/rainbow/enduser/v1.0/rooms/:roomId/dial-in/enable
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(enableDialInForARoom) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/rooms/" + roomId + "/dial-in/enable";
            that.http.put(url, that.getRequestHeader(), {}, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(enableDialInForARoom) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(enableDialInForARoom) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(enableDialInForARoom) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(enableDialInForARoom) error : ", err);
                return reject(err);
            });
        });
    }

    resetDialInCodeForARoom(roomId: string) {
        // API https://api.openrainbow.org/enduser/#api-dialIn-ResetDialIn
        // PUT /api/rainbow/enduser/v1.0/rooms/:roomId/dial-in/reset
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(resetDialInCodeForARoom) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/rooms/" + roomId + "/dial-in/reset";
            that.http.put(url, that.getRequestHeader(), {}, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(resetDialInCodeForARoom) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(resetDialInCodeForARoom) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(resetDialInCodeForARoom) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(resetDialInCodeForARoom) error : ", err);
                return reject(err);
            });
        });
    }

    getDialInPhoneNumbersList(shortList: boolean) {
        // API https://api.openrainbow.org/enduser/#api-dial_in_phone_numbers-GetDialInPhoneNumbers
        // GET /api/rainbow/enduser/v1.0/rooms/dial-in/phone-numbers
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getDialInPhoneNumbersList) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/rooms/dial-in/phone-numbers";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "shortList", shortList);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getDialInPhoneNumbersList) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getDialInPhoneNumbersList) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDialInPhoneNumbersList) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDialInPhoneNumbersList) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDialInPhoneNumbersList) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Bubbles - dialIn

}

module.exports = {'RESTBubblesDialIn': RESTBubblesDialIn};
export {RESTBubblesDialIn as RESTBubblesDialIn};
