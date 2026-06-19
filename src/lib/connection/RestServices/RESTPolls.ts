'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";
import {ErrorManager} from "../../common/ErrorManager";

const LOG_ID = "REST/POLLS - ";

/**
 * Handles all REST API calls related to Rainbow Bubble Polls.
 */
@logEntryExit(LOG_ID)
class RESTPolls extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTPolls'; }
    getClassName() { return RESTPolls.getClassName(); }
    static getAccessorName() { return 'restpolls'; }
    getAccessorName() { return RESTPolls.getAccessorName(); }

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

    //region Rainbow Bubbles Polls

    createBubblePoll(roomId: string, title: string, questions: Array<{ text: string, multipleChoice: boolean, answers: Array<{ text: string }> }>, anonymous: boolean = false, duration: number = 0) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createBubblePoll) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = {};

            if (roomId) {
                data.roomId = roomId;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'roomId' parameter";
                error.label += "bad or empty 'roomId' parameter";
                error.cause = roomId;
                that._logger.log(that.WARN, LOG_ID + `(createBubblePoll) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createBubblePoll) bad or empty 'roomId' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (title) {
                data.title = title;
            }

            if (questions) {
                data.questions = questions;
            }

            if (anonymous != undefined) {
                data.anonymous = anonymous;
            }

            if (duration != undefined) {
                data.duration = duration;
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(createBubblePoll) args : ", data);
            that.http.post("/api/rainbow/enduser/v1.0/polls", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createBubblePoll) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createBubblePoll) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    deleteBubblePoll(pollId) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteBubblePoll) entry`);
        return new Promise(function (resolve, reject) {
            if (!pollId) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "No pollId provided";
                error.label += "No pollId provided";
                error.cause = pollId;
                that._logger.log(that.WARN, LOG_ID + `(deleteBubblePoll) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(deleteBubblePoll) No pollId provided : `, error.cause, ", error : ", error);
                return reject(error);
            } else {
                that.http.delete("/api/rainbow/enduser/v1.0/polls/" + pollId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteBubblePoll) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteBubblePoll) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteBubblePoll) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteBubblePoll) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    getBubblePoll(pollId: string, format: string = "small") {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getBubblePoll) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/polls/" + pollId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getBubblePoll) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getBubblePoll) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubblePoll) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBubblePoll) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    getBubblePollsByBubble(roomId: string, format: string = "small", limit: number = 100, offset: number) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getBubblePollsByBubble) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/polls";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "roomId", roomId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getBubblePollsByBubble) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getBubblePollsByBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubblePollsByBubble) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBubblePollsByBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBubblePollsByBubble) error : ", err);
                return reject(err);
            });
        });
    }

    publishBubblePoll(pollId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(publishBubblePoll) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = {};

            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId + "/publish", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(publishBubblePoll) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(publishBubblePoll) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(publishBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(publishBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    terminateBubblePoll(pollId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(terminateBubblePoll) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = {};

            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId + "/terminate", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(terminateBubblePoll) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(terminateBubblePoll) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(terminateBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(terminateBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    unpublishBubblePoll(pollId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(unpublishBubblePoll) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = {};

            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId + "/unpublish", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(unpublishBubblePoll) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(unpublishBubblePoll) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(unpublishBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(unpublishBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    updateBubblePoll(pollId: string, roomId: string, title: string, questions: Array<{ text: string, multipleChoice: boolean, answers: Array<{ text: string }> }>, anonymous: boolean, duration: number) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateBubblePoll) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = {};

            if (pollId) {
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'pollId' parameter";
                error.label += "bad or empty 'pollId' parameter";
                error.cause = pollId;
                that._logger.log(that.WARN, LOG_ID + `(updateBubblePoll) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(updateBubblePoll) bad or empty 'pollId' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (roomId) {
                data.roomId = roomId;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'roomId' parameter";
                error.label += "bad or empty 'roomId' parameter";
                error.cause = roomId;
                that._logger.log(that.WARN, LOG_ID + `(updateBubblePoll) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(updateBubblePoll) bad or empty 'roomId' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (title) {
                data.title = title;
            }

            if (questions) {
                data.questions = questions;
            }

            if (anonymous != undefined) {
                data.anonymous = anonymous;
            }

            if (duration) {
                data.duration = duration;
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(updateBubblePoll) args : ", data);
            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateBubblePoll) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateBubblePoll) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    votesForBubblePoll(pollId: string, votes: Array<{ question: number, answers: Array<number> }>) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(votesForBubblePoll) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = {
                votes
            };

            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId + "/vote", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(votesForBubblePoll) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(votesForBubblePoll) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(votesForBubblePoll) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(votesForBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Bubbles Polls

}

module.exports = {'RESTPolls': RESTPolls};
export {RESTPolls as RESTPolls};
