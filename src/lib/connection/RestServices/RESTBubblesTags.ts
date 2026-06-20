'use strict';

import {logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/BTAG - ";

/**
 * Handles all REST API calls related to bubble tags management.
 */
@logEntryExit(LOG_ID)
class RESTBubblesTags extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTBubblesTags'; }
    getClassName() { return RESTBubblesTags.getClassName(); }
    static getAccessorName() { return 'restbubblestags'; }
    getAccessorName() { return RESTBubblesTags.getAccessorName(); }

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

    //region Bubbles Tags

    retrieveAllBubblesByTags(tags: Array<string>, format: string = "small", nbUsersToKeep: number = 100) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveAllBubblesByTags) entry`);
        return new Promise(function (resolve, reject) {
            let nbTags = tags.length;
            let tagParams = "";
            if (nbTags == 0) {
                let err = { "label": "retrieveAllBubblesByTags : No tags provided for filter the bubbles." };
                that._logger.log(that.ERROR, LOG_ID, "(retrieveAllBubblesByTags) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveAllBubblesByTags) error : ", err);
                return reject(err);
            }
            if (nbTags == 1) {
                tagParams = "tag=" + encodeURI(tags[0]) + "&";
            }
            if (nbTags > 1) {
                for (let id = 0; id < nbTags; id++) {
                    tagParams += "tag" + "=" + encodeURI(tags[id]) + "&";
                }
            }
            if (format) { tagParams += "format" + "=" + encodeURI(format) + "&"; }
            if (format) { tagParams += "nbUsersToKeep" + "=" + nbUsersToKeep + "&"; }

            that.http.get("/api/rainbow/enduser/v1.0/rooms/tags?" + tagParams, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveAllBubblesByTags) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveAllBubblesByTags) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveAllBubblesByTags) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveAllBubblesByTags) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @param {string} roomId
     * @param {Array<any>} tags list of tag objects (tag name, optional color, optional emoji)
     */
    setTagsOnABubble(roomId: string, tags: Array<string>) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(setTagsOnABubble) entry`);
        return new Promise(function (resolve, reject) {
            let params = { "tags": tags };
            that._logger.log(that.INTERNAL, LOG_ID + "(setTagsOnABubble) REST params : ", params);

            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + roomId + "/tags", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(setTagsOnABubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setTagsOnABubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setTagsOnABubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setTagsOnABubble) error : ", err);
                return reject(err);
            });
        });
    }

    deleteTagOnABubble(roomIds: Array<string>, tag: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteTagOnABubble) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = { "tag": tag, "rooms": roomIds };
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteTagOnABubble) REST params : ", params);

            that.http.delete("/api/rainbow/enduser/v1.0/rooms/tags", that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteTagOnABubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteTagOnABubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteTagOnABubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteTagOnABubble) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Bubbles Tags

}

module.exports = {'RESTBubblesTags': RESTBubblesTags};
export {RESTBubblesTags as RESTBubblesTags};
