'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";
import {ErrorManager} from "../../common/ErrorManager";

const LOG_ID = "REST/BOPI - ";

/**
 * Handles all REST API calls related to bubble open invites.
 */
@logEntryExit(LOG_ID)
class RESTBubbleOpenInvites extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTBubbleOpenInvites'; }
    getClassName() { return RESTBubbleOpenInvites.getClassName(); }
    static getAccessorName() { return 'restbubbleopeninvites'; }
    getAccessorName() { return RESTBubbleOpenInvites.getAccessorName(); }

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

    //region Bubble Open Invites

    checkOpenInviteIdValidity(openInviteId: string) {
        // GET /api/rainbow/enduser/v1.0/rooms/open-invites/validate
        // API https://api.openrainbow.org/enduser/#api-rooms_open_invite-checkRoomInvitationUsingOpenInviteiId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(checkOpenInviteIdValidity) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/rooms/open-invites/validate";
            if (openInviteId === undefined) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater openInviteId undefined";
                error.label += "bad request paramater openInviteId undefined";
                error.cause = openInviteId;
                that._logger.log(that.WARN, LOG_ID + `(checkOpenInviteIdValidity) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(checkOpenInviteIdValidity) bad request paramater openInviteId undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "openInviteId", openInviteId);
            url = urlParamsTab[0];

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(checkOpenInviteIdValidity) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(checkOpenInviteIdValidity) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(checkOpenInviteIdValidity) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(checkOpenInviteIdValidity) error : ", err);
                return reject(err);
            });
        });
    }

    joinBubbleByOpenInviteId(openInviteId: string, roomPassword: string = undefined) {
        // API https://api.openrainbow.org/enduser/#api-rooms_open_invite-sendJoinRoomInvitationUsingOpenInviteiId
        // POST /api/rainbow/enduser/v1.0/rooms/open-invites
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(joinBubbleByOpenInviteId) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = { openInviteId, roomPassword };
            that._logger.log(that.INTERNAL, LOG_ID + "(joinBubbleByOpenInviteId) REST params : ", params);

            that.http.post("/api/rainbow/enduser/v1.0/rooms/open-invites", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(joinBubbleByOpenInviteId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(joinBubbleByOpenInviteId) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(joinBubbleByOpenInviteId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(joinBubbleByOpenInviteId) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Bubble Open Invites

}

module.exports = {'RESTBubbleOpenInvites': RESTBubbleOpenInvites};
export {RESTBubbleOpenInvites as RESTBubbleOpenInvites};
