'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";
import {ErrorManager} from "../../common/ErrorManager";

const LOG_ID = "REST/PURL - ";

/**
 * Handles all REST API calls related to public URLs and guest registration.
 */
@logEntryExit(LOG_ID)
class RESTPublicUrl extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTPublicUrl'; }
    getClassName() { return RESTPublicUrl.getClassName(); }
    static getAccessorName() { return 'restpublicurl'; }
    getAccessorName() { return RESTPublicUrl.getAccessorName(); }

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

    //region Public url

    getABubblePublicLinkAsModerator(bubbleId?: string, emailContent?: boolean, language?: string): Promise<any> {
        // GET /api/rainbow/enduser/v1.0/rooms/:roomId/public-links
        // API https://api.openrainbow.org/enduser/#api-rooms-getRoomIdPublicLinks
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getABubblePublicLinkAsModerator) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/public-links";
            if (bubbleId === undefined) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater bubbleId undefined";
                error.label += "bad request paramater bubbleId undefined";
                error.cause = bubbleId;
                that._logger.log(that.WARN, LOG_ID + `(getABubblePublicLinkAsModerator) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(getABubblePublicLinkAsModerator) bad request paramater bubbleId undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (emailContent != undefined) { addParamToUrl(urlParamsTab, "emailContent", emailContent); }
            if (language != undefined) { addParamToUrl(urlParamsTab, "language", language); }
            url = urlParamsTab[0];

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getABubblePublicLinkAsModerator) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getABubblePublicLinkAsModerator) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getABubblePublicLinkAsModerator) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getABubblePublicLinkAsModerator) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @param {string} userId optional userId filter; falls back to defaultUserId (current user)
     * @param {string} type optional public link type
     * @param {string} roomId optional roomId filter
     * @param {string} defaultUserId injected from RESTService (current user id)
     */
    getAllOpenInviteIdPerRoomOfAUser(userId?: string, type?: string, roomId?: string, defaultUserId?: string): Promise<Array<any>> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllOpenInviteIdPerRoomOfAUser) entry`);
        return new Promise(function (resolve, reject) {
            let userIdFilter = userId ? userId : defaultUserId;
            let requestParam = "";
            if (type) {
                requestParam += (requestParam === "" ? "?" : "+") + "type=" + type;
            }
            if (roomId) {
                requestParam += (requestParam === "" ? "?" : "+") + "roomId=" + roomId;
            }

            that.http.get("/api/rainbow/enduser/v1.0/users/" + userIdFilter + "/public-links" + requestParam, that.getRequestHeader(), requestParam).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllOpenInviteIdPerRoomOfAUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllOpenInviteIdPerRoomOfAUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllOpenInviteIdPerRoomOfAUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllOpenInviteIdPerRoomOfAUser) error : ", err);
                return reject(err);
            });
        });
    }

    generateNewPublicUrl(bubbleId, userId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(generateNewPublicUrl) entry`);
        return new Promise(function (resolve, reject) {
            let param = { "roomId": bubbleId };
            that.http.put("/api/rainbow/enduser/v1.0/users/" + userId + "/public-links/reset", that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(generateNewPublicUrl) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(generateNewPublicUrl) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(generateNewPublicUrl) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(generateNewPublicUrl) error : ", err);
                return reject(err);
            });
        });
    }

    removePublicUrl(bubbleId, userId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(removePublicUrl) entry`);
        return new Promise(function (resolve, reject) {
            let param = { "roomId": bubbleId };
            that.http.put("/api/rainbow/enduser/v1.0/users/" + userId + "/public-links/unbind", that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(removePublicUrl) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(removePublicUrl) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(removePublicUrl) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(removePublicUrl) error : ", err);
                return reject(err);
            });
        });
    }

    createPublicUrl(bubbleId, userId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createPublicUrl) entry`);
        return new Promise(function (resolve, reject) {
            let param = { "roomId": bubbleId };
            that._logger.log(that.INTERNAL, LOG_ID + "(createPublicUrl) REST bubbleId : ", bubbleId, " param : ", param);
            that.http.post("/api/rainbow/enduser/v1.0/users/" + userId + "/public-links/bind", that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(createPublicUrl) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createPublicUrl) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createPublicUrl) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createPublicUrl) error : ", err);
                return reject(err);
            });
        });
    }

    registerGuest(guest: any) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(registerGuest) entry`);
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/enduser/v1.0/users/self-register", that.getRequestHeader(), guest.getUrlParam(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(registerGuest) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(registerGuest) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(registerGuest) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(registerGuest) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Public url

}

module.exports = {'RESTPublicUrl': RESTPublicUrl};
export {RESTPublicUrl as RESTPublicUrl};
