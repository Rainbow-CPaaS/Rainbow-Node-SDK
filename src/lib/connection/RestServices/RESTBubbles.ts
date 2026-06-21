'use strict';

import {addParamToUrl, addPropertyToObj, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";
import {ErrorManager} from "../../common/ErrorManager";

const LOG_ID = "REST/BUBL - ";

/**
 * Handles all REST API calls related to bubbles (rooms) management.
 */
@logEntryExit(LOG_ID)
class RESTBubbles extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTBubbles'; }
    getClassName() { return RESTBubbles.getClassName(); }
    static getAccessorName() { return 'restbubbles'; }
    getAccessorName() { return RESTBubbles.getAccessorName(); }

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

    //region Bubbles

    createBubble(name: string, description: string, history: any = "all", p_number: number = 0, visibility: string = "private", disableNotifications: boolean = false, autoRegister: string = 'unlock', autoAcceptInvitation: boolean = false, muteUponEntry: boolean = false, playEntryTone: boolean = true) {
        // POST /api/rainbow/enduser/v1.0/rooms
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createBubble) entry`);
        return new Promise(function (resolve, reject) {
            let historyStr = history;
            if (history === true) {
                historyStr = "all";
            } else if (history === false) {
                historyStr = "none";
            }

            let body: any = {
                name: name,
                topic: description,
                history: historyStr
            };
            addPropertyToObj(body, "number", p_number, false);
            addPropertyToObj(body, "visibility", visibility, false);
            addPropertyToObj(body, "disableNotifications", disableNotifications, false);
            addPropertyToObj(body, "autoRegister", autoRegister, false);
            addPropertyToObj(body, "autoAcceptInvitation", autoAcceptInvitation, false);
            addPropertyToObj(body, "muteUponEntry", muteUponEntry, false);
            addPropertyToObj(body, "playEntryTone", playEntryTone, false);

            that.http.post("/api/rainbow/enduser/v1.0/rooms", that.getRequestHeader(), body, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createBubble) error : ", err);
                return reject(err);
            });
        });
    }

    updateRoomData(bubbleId: string, data: any) {
        // API https://api.openrainbow.org/enduser/#api-rooms-updateRoom
        // PUT /api/rainbow/enduser/v1.0/rooms/:roomId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateRoomData) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateRoomData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateRoomData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateRoomData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateRoomData) error : ", err);
                return reject(err);
            });
        });
    }

    setBubbleVisibility(bubbleId, visibility) {
        // PUT /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(setBubbleVisibility) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader(), { visibility: visibility }, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setBubbleVisibility) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleVisibility) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setBubbleVisibility) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setBubbleVisibility) error : ", err);
                return reject(err);
            });
        });
    }

    setBubbleAutoRegister(bubbleId: string, autoRegister: string = "unlock") {
        // PUT /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(setBubbleAutoRegister) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader(), { autoRegister: autoRegister }, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setBubbleAutoRegister) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleAutoRegister) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setBubbleAutoRegister) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setBubbleAutoRegister) error : ", err);
                return reject(err);
            });
        });
    }

    setBubbleTopic(bubbleId, topic) {
        // PUT /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(setBubbleTopic) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader(), { topic: topic }, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setBubbleTopic) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleTopic) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setBubbleTopic) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setBubbleTopic) error : ", err);
                return reject(err);
            });
        });
    }

    setBubbleName(bubbleId, name) {
        // PUT /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(setBubbleName) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader(), { name: name }, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setBubbleName) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleName) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setBubbleName) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setBubbleName) error : ", err);
                return reject(err);
            });
        });
    }

    getBubbleLastActivityDate(bubble) {
        let date: Date;
        if (bubble?.lastActivityDate) {
            date = new Date(bubble?.lastActivityDate);
        } else if (bubble?.creationDate) {
            date = new Date(bubble?.creationDate);
        } else {
            date = new Date(0);
        }
        return date.getTime();
    }

    sortByDate(dateA, dateB) {
        let res = 1;
        if (dateA && dateB) {
            res = dateB - dateA;
        }
        return res;
    }

    getBubbles(accountId: string, format: string = "small", unsubscribed: boolean = false) {
        // API https://api.openrainbow.org/enduser/#api-rooms-getRooms
        // GET /api/rainbow/enduser/v1.0/rooms
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getBubbles) entry`);
        let getSetOfBubbles = (page, max, bubbles) => {
            return new Promise((resolve, reject) => {
                that.http.get("/api/rainbow/enduser/v1.0/rooms?format=" + format + "&unsubscribed=" + unsubscribed + "&offset=" + page + "&limit=" + max + "&userId=" + accountId, that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                    bubbles = bubbles.concat(json?.data);
                    that._logger.log(that.DEBUG, LOG_ID + "(getBubbles) getSetOfBubbles successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getBubbles) REST result : getSetOfBubbles retrieved " + json.data.length + " bubbles, total " + bubbles.length + ", existing " + json.total);
                    resolve({bubbles: bubbles, finished: bubbles.length === json.total});
                }).catch(function (err) {
                    return reject(err);
                });
            });
        };

        let getAllBubbles = function (page, limit, bubbles) {
            return new Promise((resolve, reject) => {
                getSetOfBubbles(page, limit, bubbles).then((json: any) => {
                    if (json.finished) {
                        that._logger.log(that.DEBUG, LOG_ID + "(getAllBubbles) no need to loop again. All bubbles retrieved...");
                        return resolve(json.bubbles);
                    }
                    page += limit;
                    that._logger.log(that.DEBUG, LOG_ID + "(getAllBubbles) need another loop to get more bubbles... [" + json.bubbles.length + "]");
                    getAllBubbles(page, limit, json.bubbles).then((bubbles) => {
                        resolve(bubbles);
                    }).catch((err) => {
                        return reject(err);
                    });
                }).catch((err) => {
                    return reject(err);
                });
            });
        };

        return new Promise(function (resolve, reject) {
            let page = 0;
            let limit = 100;
            getAllBubbles(page, limit, []).then((json: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getBubbles) getAllBubbles successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubbles) getAllBubbles REST result : " + json.length + " bubbles");
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(getBubbles) getAllBubbles error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBubbles) getAllBubbles error : ", err);
                return reject(err);
            });
        });
    }

    getBubble(bubbleId: string, context: string = undefined, format: string = "full", unsubscribed: boolean = true, nbUsersToKeep: number = 100) {
        // API https://api.openrainbow.org/enduser/#api-rooms-getRoomById
        // GET /api/rainbow/enduser/v1.0/rooms/:roomId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getBubble) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/rooms/" + bubbleId;
            if (bubbleId === undefined) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater bubbleId undefined";
                error.label += "bad request paramater bubbleId undefined";
                error.cause = bubbleId;
                that._logger.log(that.WARN, LOG_ID + `(getBubble) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(getBubble) bad request paramater bubbleId undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }
            if (context != undefined) {
                url += "/" + context;
            }
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (format != undefined) { addParamToUrl(urlParamsTab, "format", format); }
            if (unsubscribed != undefined) { addParamToUrl(urlParamsTab, "unsubscribed", unsubscribed); }
            if (nbUsersToKeep != undefined) { addParamToUrl(urlParamsTab, "nbUsersToKeep", nbUsersToKeep); }
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getBubble) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBubble) error : ", err);
                return reject(err);
            });
        });
    }

    getBubbleByJid(bubbleJid: string, format: string = "full", unsubscribed: boolean = true, nbUsersToKeep: number = 100) {
        // API https://api.openrainbow.org/enduser/#api-rooms-getRoomByJid
        // GET /api/rainbow/enduser/v1.0/rooms/jids/:jid
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getBubbleByJid) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/rooms/jids/" + bubbleJid;
            if (bubbleJid === undefined) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater bubbleJid undefined";
                error.label += "bad request paramater bubbleJid undefined";
                error.cause = bubbleJid;
                that._logger.log(that.WARN, LOG_ID + `(getBubbleByJid) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(getBubbleByJid) bad request paramater bubbleJid undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (format != undefined) { addParamToUrl(urlParamsTab, "format", format); }
            if (unsubscribed != undefined) { addParamToUrl(urlParamsTab, "unsubscribed", unsubscribed); }
            if (nbUsersToKeep != undefined) { addParamToUrl(urlParamsTab, "nbUsersToKeep", nbUsersToKeep); }
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getBubble) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getBubbleByJid) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubbleByJid) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBubbleByJid) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBubbleByJid) error : ", err);
                return reject(err);
            });
        });
    }

    getAllBubblesJidsOfAUserIsMemberOf(isActive?: boolean, webinar?: boolean, unsubscribed: boolean = true, limit: number = 100, offset: number = 0, sortField?: string, sortOrder: number = 1) {
        // API https://api.openrainbow.org/enduser/#api-rooms-getRoomJIDs
        // GET /api/rainbow/enduser/v1.0/rooms/jids
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllBubblesJidsOfAUserIsMemberOf) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/rooms/jids";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (isActive != undefined) { addParamToUrl(urlParamsTab, "isActive", isActive); }
            if (webinar != undefined) { addParamToUrl(urlParamsTab, "webinar", webinar); }
            if (unsubscribed != undefined) { addParamToUrl(urlParamsTab, "unsubscribed", unsubscribed); }
            if (limit != undefined) { addParamToUrl(urlParamsTab, "limit", limit); }
            if (offset != undefined) { addParamToUrl(urlParamsTab, "offset", offset); }
            if (sortField != undefined) { addParamToUrl(urlParamsTab, "sortField", sortField); }
            if (sortOrder != undefined) { addParamToUrl(urlParamsTab, "sortOrder", sortOrder); }
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllBubblesJidsOfAUserIsMemberOf) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllBubblesJidsOfAUserIsMemberOf) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllBubblesJidsOfAUserIsMemberOf) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllBubblesJidsOfAUserIsMemberOf) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllBubblesJidsOfAUserIsMemberOf) error : ", err);
                return reject(err);
            });
        });
    }

    getAllBubblesVisibleByTheUser(format: string = "small", userId?: string, status?: string, confId?: string, scheduled?: boolean, hasConf?: boolean, isActive?: boolean, name?: string, sortField?: string, sortOrder: number = 1,
                                  unsubscribed: boolean = false, webinar?: boolean, limit: number = 100, offset: number = 0, nbUsersToKeep: number = 100, creator?: string, context?: string, needIsAlertNotificationEnabled: string = "true", accountId?: string) {
        // API https://api.openrainbow.org/enduser/#api-rooms-getRooms
        // GET /api/rainbow/enduser/v1.0/rooms
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllBubblesVisibleByTheUser) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/rooms";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (userId == undefined) {
                userId = accountId;
            }

            if (format != undefined) { addParamToUrl(urlParamsTab, "format", format); }
            if (userId != undefined) { addParamToUrl(urlParamsTab, "userId", userId); }
            if (status != undefined) { addParamToUrl(urlParamsTab, "status", status); }
            if (confId != undefined) { addParamToUrl(urlParamsTab, "confId", confId); }
            if (scheduled != undefined) { addParamToUrl(urlParamsTab, "scheduled", scheduled); }
            if (hasConf != undefined) { addParamToUrl(urlParamsTab, "hasConf", hasConf); }
            if (isActive != undefined) { addParamToUrl(urlParamsTab, "isActive", isActive); }
            if (name != undefined) { addParamToUrl(urlParamsTab, "name", name); }
            if (sortField != undefined) { addParamToUrl(urlParamsTab, "sortField", sortField); }
            if (sortOrder != undefined) { addParamToUrl(urlParamsTab, "sortOrder", sortOrder); }
            if (unsubscribed != undefined) { addParamToUrl(urlParamsTab, "unsubscribed", unsubscribed); }
            if (webinar != undefined) { addParamToUrl(urlParamsTab, "webinar", webinar); }
            if (limit != undefined) { addParamToUrl(urlParamsTab, "limit", limit); }
            if (offset != undefined) { addParamToUrl(urlParamsTab, "offset", offset); }
            if (nbUsersToKeep != undefined) { addParamToUrl(urlParamsTab, "nbUsersToKeep", nbUsersToKeep); }
            if (creator != undefined) { addParamToUrl(urlParamsTab, "creator", creator); }
            if (context != undefined) { addParamToUrl(urlParamsTab, "context", context); }
            if (needIsAlertNotificationEnabled != undefined) { addParamToUrl(urlParamsTab, "needIsAlertNotificationEnabled", needIsAlertNotificationEnabled); }
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllBubblesVisibleByTheUser) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllBubblesVisibleByTheUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllBubblesVisibleByTheUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllBubblesVisibleByTheUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllBubblesVisibleByTheUser) error : ", err);
                return reject(err);
            });
        });
    }

    getBubblesDataByListOfBubblesIds(bubblesIds: Array<string>, format: string = "small", userId?: string, status?: string, confId?: string, scheduled?: boolean, hasConf?: boolean, sortField?: string, sortOrder: number = 1,
                                     unsubscribed: boolean = false, webinar?: boolean, limit: number = 100, offset: number = 0, nbUsersToKeep: number = 100, context?: string, needIsAlertNotificationEnabled: string = "true") {
        // API https://api.openrainbow.org/enduser/#api-rooms-getRoomsByIds
        // GET /api/rainbow/enduser/v1.0/rooms/ids
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getBubblesDataByListOfBubblesIds) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/rooms/ids";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (format != undefined) { addParamToUrl(urlParamsTab, "format", format); }
            if (userId != undefined) { addParamToUrl(urlParamsTab, "userId", userId); }
            if (status != undefined) { addParamToUrl(urlParamsTab, "status", status); }
            if (confId != undefined) { addParamToUrl(urlParamsTab, "confId", confId); }
            if (scheduled != undefined) { addParamToUrl(urlParamsTab, "scheduled", scheduled); }
            if (hasConf != undefined) { addParamToUrl(urlParamsTab, "hasConf", hasConf); }
            if (sortField != undefined) { addParamToUrl(urlParamsTab, "sortField", sortField); }
            if (sortOrder != undefined) { addParamToUrl(urlParamsTab, "sortOrder", sortOrder); }
            if (unsubscribed != undefined) { addParamToUrl(urlParamsTab, "unsubscribed", unsubscribed); }
            if (webinar != undefined) { addParamToUrl(urlParamsTab, "webinar", webinar); }
            if (limit != undefined) { addParamToUrl(urlParamsTab, "limit", limit); }
            if (offset != undefined) { addParamToUrl(urlParamsTab, "offset", offset); }
            if (nbUsersToKeep != undefined) { addParamToUrl(urlParamsTab, "nbUsersToKeep", nbUsersToKeep); }
            if (context != undefined) { addParamToUrl(urlParamsTab, "context", context); }
            if (needIsAlertNotificationEnabled != undefined) { addParamToUrl(urlParamsTab, "needIsAlertNotificationEnabled", needIsAlertNotificationEnabled); }
            url = urlParamsTab[0];

            let data = { "roomIds": bubblesIds };

            that._logger.log(that.INTERNAL, LOG_ID + "(getBubblesDataByListOfBubblesIds) REST url : ", url);
            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getBubblesDataByListOfBubblesIds) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubblesDataByListOfBubblesIds) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBubblesDataByListOfBubblesIds) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBubblesDataByListOfBubblesIds) error : ", err);
                return reject(err);
            });
        });
    }

    setBubbleCustomData(bubbleId, customData) {
        // PUT /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(setBubbleCustomData) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/custom-data", that.getRequestHeader(), customData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setBubbleCustomData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setBubbleCustomData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setBubbleCustomData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setBubbleCustomData) error : ", err);
                return reject(err);
            });
        });
    }

    inviteContactToBubble(contactId, bubbleId, asModerator, withInvitation, reason) {
        // POST /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(inviteContactToBubble) entry`);
        return new Promise(function (resolve, reject) {
            let privilege = asModerator ? "moderator" : "user";
            let status = withInvitation ? "invited" : "accepted";
            reason = reason || "from moderator";

            that.http.post("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users", that.getRequestHeader(), {
                userId: contactId,
                reason: reason,
                privilege: privilege,
                status: status
            }, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(inviteContactToBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(inviteContactToBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(inviteContactToBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(inviteContactToBubble) error : ", err);
                return reject(err);
            });
        });
    }

    inviteContactsByEmailsToBubble(contactsEmails: Array<string>, bubbleId: string) {
        // API https://api.openrainbow.org/enduser/#api-rooms_invitation-sendUsersJoinRoomInvitation
        // POST /api/rainbow/enduser/v1.0/rooms/:roomId/invitations
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(inviteContactsByEmailsToBubble) entry`);
        const data = {
            scenario: "chat",
            emails: contactsEmails
        };

        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/invitations", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(inviteContactsByEmailsToBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(inviteContactsByEmailsToBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(inviteContactsByEmailsToBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(inviteContactsByEmailsToBubble) error : ", err);
                return reject(err);
            });
        });
    }

    getRoomUsers(bubbleId, options: any = {}) {
        // GET /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getRoomUsers) entry`);
        return new Promise(function (resolve, reject) {
            let filterToApply = "format=medium";
            if (options.format) { filterToApply = "format=" + options.format; }
            if (!options.limit) { options.limit = 100; }
            if (options.page > 0) {
                filterToApply += "&offset=";
                if (options.page > 1) {
                    filterToApply += (options.limit * (options.page - 1));
                } else {
                    filterToApply += 0;
                }
            }
            filterToApply += "&limit=" + Math.min(options.limit, 1000);
            if (options.type) { filterToApply += "&types=" + options.type; }

            that.http.get("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users?" + filterToApply, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getRoomUsers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getRoomUsers) REST result : ", json.total, " users in bubble");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getRoomUsers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getRoomUsers) error : ", err);
                return reject(err);
            });
        });
    }

    promoteContactInBubble(contactId, bubbleId, asModerator) {
        // PUT /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(promoteContactInBubble) entry`);
        return new Promise(function (resolve, reject) {
            let privilege = asModerator ? "moderator" : "user";
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + contactId, that.getRequestHeader(), {privilege: privilege}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(promoteContactInBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(promoteContactInBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(promoteContactInBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(promoteContactInBubble) error : ", err);
                return reject(err);
            });
        });
    }

    changeBubbleOwner(bubbleId, contactId) {
        // PUT /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(changeBubbleOwner) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader(), {"owner": contactId}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(changeBubbleOwner) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(changeBubbleOwner) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(changeBubbleOwner) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(changeBubbleOwner) error : ", err);
                return reject(err);
            });
        });
    }

    archiveBubble(bubbleId) {
        // PUT /api/rainbow/enduser/v1.0/rooms/:roomId/archive
        // API https://api.openrainbow.org/enduser/#api-rooms-updateRoomArchive
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(archiveBubble) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(archiveBubble) bubbleId : ", bubbleId);
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/archive", that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(archiveBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(archiveBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(archiveBubble) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(archiveBubble) error : ", err);
                return reject(err);
            });
        });
    }

    leaveBubble(bubbleId, bubbleStatus, accountId: string) {
        // DELETE /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(leaveBubble) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(leaveBubble) bubbleId : ", bubbleId, ", bubbleStatus : ", bubbleStatus);
            switch (bubbleStatus) {
                case "unsubscribed":
                    that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + accountId, that.getRequestHeader()).then(function (json) {
                        that._logger.log(that.DEBUG, LOG_ID + "(leaveBubble) delete successfull");
                        that._logger.log(that.INTERNAL, LOG_ID + "(leaveBubble) REST result : ", json);
                        resolve(json?.data);
                    }).catch(function (err) {
                        that._logger.log(that.ERROR, LOG_ID, "(leaveBubble) error");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(leaveBubble) error : ", err);
                        return reject(err);
                    });
                    break;
                default:
                    that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + accountId, that.getRequestHeader(), {"status": "unsubscribed"}, undefined).then(function (json) {
                        that._logger.log(that.DEBUG, LOG_ID + "(leaveBubble) unsubscribed successfull");
                        that._logger.log(that.INTERNAL, LOG_ID + "(leaveBubble) REST result : ", json);
                        resolve(json?.data);
                    }).catch(function (err) {
                        that._logger.log(that.ERROR, LOG_ID, "(leaveBubble) error");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(leaveBubble) error : ", err);
                        return reject(err);
                    });
                    break;
            }
        });
    }

    deleteBubble(bubbleId) {
        // API https://api.openrainbow.org/enduser/#api-rooms-deleteRoom
        // DELETE /api/rainbow/enduser/v1.0/rooms/:roomId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteBubble) entry`);
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteBubble) error : ", err);
                return reject(err);
            });
        });
    }

    setRoomHasPassword(roomId, hasPassword: boolean = false) {
        // API https://api.openrainbow.org/enduser/#api-rooms_password_management-activateRoomAccessByPassword
        // POST /api/rainbow/enduser/v1.0/rooms/:roomId/passwords
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(setRoomHasPassword) entry`);
        return new Promise(function (resolve, reject) {
            let data = { hasPassword: hasPassword };
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + roomId + "/passwords", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setRoomHasPassword) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setRoomHasPassword) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setRoomHasPassword) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setRoomHasPassword) error : ", err);
                return reject(err);
            });
        });
    }

    renewRoomPassword(roomId) {
        // API https://api.openrainbow.org/enduser/#api-rooms_password_management-renewPassword
        // PUT /api/rainbow/enduser/v1.0/rooms/:roomId/passwords/reset
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(renewRoomPassword) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + roomId + "/passwords/reset", that.getRequestHeader(), {}).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(renewRoomPassword) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(renewRoomPassword) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(renewRoomPassword) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(renewRoomPassword) error : ", err);
                return reject(err);
            });
        });
    }

    //region rooms lobbies management

    setBubbleLobby(bubbleId: string, hasLobby: boolean) {
        // API PUT /api/rainbow/enduser/v1.0/rooms/:roomId/lobbies
        // PUT /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(setBubbleLobby) entry`);
        return new Promise(function (resolve, reject) {
            let data = { hasLobby: hasLobby };
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/lobbies", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, `${LOG_ID}(setBubbleLobby) successfull`);
                that._logger.log(that.INTERNAL, `${LOG_ID}(setBubbleLobby) REST result : `, json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, `(setBubbleLobby) error`);
                that._logger.log(that.INTERNALERROR, LOG_ID, `(setBubbleLobby) error : `, err);
                return reject(err);
            });
        });
    }

    getBubbleLobby(bubbleId: string) {
        // API GET /api/rainbow/enduser/v1.0/rooms/:roomId/lobbies/pending
        // GET /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getBubbleLobby) entry`);
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/lobbies/pending", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, `${LOG_ID}(getBubbleLobby) successfull`);
                that._logger.log(that.INTERNAL, `${LOG_ID}(getBubbleLobby) REST result : `, json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, `(getBubbleLobby) error`);
                that._logger.log(that.INTERNALERROR, LOG_ID, `(getBubbleLobby) error : `, err);
                return reject(err);
            });
        });
    }

    acceptBubbleLobby(bubbleId: string, scope: string, users: string[] = undefined) {
        // API PUT /api/rainbow/enduser/v1.0/rooms/:roomId/lobbies/accept
        // PUT /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(acceptBubbleLobby) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = { scope };
            if (users !== undefined) { data.users = users; }
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/lobbies/accept", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, `${LOG_ID}(acceptBubbleLobby) successfull`);
                that._logger.log(that.INTERNAL, `${LOG_ID}(acceptBubbleLobby) REST result : `, json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, `(acceptBubbleLobby) error`);
                that._logger.log(that.INTERNALERROR, LOG_ID, `(acceptBubbleLobby) error : `, err);
                return reject(err);
            });
        });
    }

    denyBubbleLobby(bubbleId: string, scope: string, users: string[] = undefined) {
        // API PUT /api/rainbow/enduser/v1.0/rooms/:roomId/lobbies/deny
        // PUT /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(denyBubbleLobby) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = { scope };
            if (users !== undefined) { data.users = users; }
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/lobbies/deny", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, `${LOG_ID}(denyBubbleLobby) successfull`);
                that._logger.log(that.INTERNAL, `${LOG_ID}(denyBubbleLobby) REST result : `, json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, `(denyBubbleLobby) error`);
                that._logger.log(that.INTERNALERROR, LOG_ID, `(denyBubbleLobby) error : `, err);
                return reject(err);
            });
        });
    }

    //endregion rooms lobbies management

    removeInvitationOfContactToBubble(contactId, bubbleId) {
        // DELETE /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(removeInvitationOfContactToBubble) entry`);
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + contactId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(removeInvitationOfContactToBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(removeInvitationOfContactToBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(removeInvitationOfContactToBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(removeInvitationOfContactToBubble) error : ", err);
                return reject(err);
            });
        });
    }

    unsubscribeContactFromBubble(contactId, bubbleId) {
        // PUT /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(unsubscribeContactFromBubble) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + contactId, that.getRequestHeader(), {status: "unsubscribed"}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(unsubscribeContactFromBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(unsubscribeContactFromBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(unsubscribeContactFromBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(unsubscribeContactFromBubble) error : ", err);
                return reject(err);
            });
        });
    }

    acceptInvitationToJoinBubble(bubbleId, accountId: string) {
        // PUT /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(acceptInvitationToJoinBubble) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + accountId, that.getRequestHeader(), {status: "accepted"}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(acceptInvitationToJoinBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(acceptInvitationToJoinBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(acceptInvitationToJoinBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(acceptInvitationToJoinBubble) error : ", err);
                return reject(err);
            });
        });
    }

    declineInvitationToJoinBubble(bubbleId, accountId: string) {
        // PUT /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(declineInvitationToJoinBubble) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + accountId, that.getRequestHeader(), {status: "rejected"}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(declineInvitationToJoinBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(declineInvitationToJoinBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(declineInvitationToJoinBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(declineInvitationToJoinBubble) error : ", err);
                return reject(err);
            });
        });
    }

    deleteUserFromBubble(bubbleId, accountId: string) {
        // DELETE /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteUserFromBubble) entry`);
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + accountId, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteUserFromBubble) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteUserFromBubble) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteUserFromBubble) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteUserFromBubble) error : ", err);
                return reject(err);
            });
        });
    }

    inviteUser(email, _companyId, language, message, accountCompanyId?: string) {
        // POST /api/rainbow/admin/v1.0/companies/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(inviteUser) entry`);
        return new Promise(function (resolve, reject) {
            let user = {
                email: email,
                lang: language,
                customMessage: null
            };
            if (message) { user.customMessage = message; }
            let companyId = _companyId ? _companyId : accountCompanyId;

            that.http.post("/api/rainbow/admin/v1.0/companies/" + companyId + "/join-companies/invitations", that.getRequestHeader(), user, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(inviteUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(inviteUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(inviteUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(inviteUser) error : ", err);
                return reject(err);
            });
        });
    }

    setAvatarRoom(bubbleid, binaryData) {
        // POST /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(setAvatarRoom) entry`);
        return new Promise(function (resolve, reject) {
            let data = binaryData.data;
            that.http.post("/api/rainbow/enduser/v1.0/rooms/" + bubbleid + "/avatar", that.getRequestHeader("application/json"), Buffer.from(data), "image/" + binaryData.type).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setAvatarRoom) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setAvatarRoom) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setAvatarRoom) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setAvatarRoom) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAvatarRoom(roomId) {
        // DELETE /api/rainbow/enduser/v1.0/rooms/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteAvatarRoom) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + roomId + "/avatar", that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAvatarRoom) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAvatarRoom) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAvatarRoom) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAvatarRoom) error : ", err);
                return reject(err);
            });
        });
    }

    getBubblesConsumption() {
        // GET /api/rainbow/enduser/v1.0/rooms/consumption
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getBubblesConsumption) entry`);
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/rooms/consumption", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getBubblesConsumption) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubblesConsumption) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getBubblesConsumption) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getBubblesConsumption) error : ", err);
                return reject(err);
            });
        });
    }

    //region CONTAINERS (Bubble Folder)

    getAllBubblesContainers(name: string = null) {
        // GET /api/rainbow/enduser/v1.0/rooms/containers/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllBubblesContainers) entry`);
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/enduser/v1.0/rooms/containers";
            if (name) { url += "?name=" + name; }
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllBubblesContainers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllBubblesContainers) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllBubblesContainers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllBubblesContainers) error : ", err);
                return reject(err);
            });
        });
    }

    getABubblesContainersById(id: string = null) {
        // GET /api/rainbow/enduser/v1.0/rooms/containers/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getABubblesContainersById) entry`);
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/enduser/v1.0/rooms/containers";
            if (id) { url += "/" + id; }
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getABubblesContainersById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getABubblesContainersById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getABubblesContainersById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getABubblesContainersById) error : ", err);
                return reject(err);
            });
        });
    }

    addBubblesToContainerById(containerId: string, bubbleIds: Array<string>) {
        // PUT /api/rainbow/enduser/v1.0/rooms/containers/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(addBubblesToContainerById) entry`);
        return new Promise(function (resolve, reject) {
            let data = { "rooms": bubbleIds };
            that.http.put("/api/rainbow/enduser/v1.0/rooms/containers/" + containerId + "/add", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addBubblesToContainersById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addBubblesToContainersById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addBubblesToContainersById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addBubblesToContainersById) error : ", err);
                return reject(err);
            });
        });
    }

    updateBubbleContainerNameAndDescriptionById(containerId: string, name: string, description?: string) {
        // PUT /api/rainbow/enduser/v1.0/rooms/containers/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateBubbleContainerNameAndDescriptionById) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = { "name": name };
            if (description) { data.description = description; }
            that.http.put("/api/rainbow/enduser/v1.0/rooms/containers/" + containerId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateBubbleContainersNameAndDescriptionById) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateBubbleContainersNameAndDescriptionById) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateBubbleContainersNameAndDescriptionById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateBubbleContainersNameAndDescriptionById) error : ", err);
                return reject(err);
            });
        });
    }

    createBubbleContainer(name: string, description?: string, bubbleIds?: Array<string>) {
        // POST /api/rainbow/enduser/v1.0/rooms/containers/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createBubbleContainer) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = { "name": name };
            if (description) { data.description = description; }
            if (bubbleIds) { data.rooms = bubbleIds; }

            that.http.post("/api/rainbow/enduser/v1.0/rooms/containers/", that.getRequestHeader("application/json"), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createBubbleContainer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createBubbleContainer) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createBubbleContainer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createBubbleContainer) error : ", err);
                return reject(err);
            });
        });
    }

    deleteBubbleContainer(containerId) {
        // DELETE /api/rainbow/enduser/v1.0/rooms/containers/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteBubbleContainer) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/enduser/v1.0/rooms/containers/" + containerId, that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteBubbleContainer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteBubbleContainer) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(deleteBubbleContainer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteBubbleContainer) error : ", err);
                return reject(err);
            });
        });
    }

    removeBubblesFromContainer(containerId: string, bubbleIds: Array<string>) {
        // PUT /api/rainbow/enduser/v1.0/rooms/containers/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(removeBubblesFromContainer) entry`);
        return new Promise(function (resolve, reject) {
            let data = { "rooms": bubbleIds };
            that.http.put("/api/rainbow/enduser/v1.0/rooms/containers/" + containerId + "/remove", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(removeBubblesFromContainer) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(removeBubblesFromContainer) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(removeBubblesFromContainer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(removeBubblesFromContainer) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion CONTAINERS

    //endregion Bubbles

}

module.exports = {'RESTBubbles': RESTBubbles};
export {RESTBubbles as RESTBubbles};
