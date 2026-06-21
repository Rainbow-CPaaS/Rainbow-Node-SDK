'use strict';

import {logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/GRPS - ";

/**
 * Handles all REST API calls related to user groups management.
 */
@logEntryExit(LOG_ID)
class RESTGroups extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTGroups'; }
    getClassName() { return RESTGroups.getClassName(); }
    static getAccessorName() { return 'restgroups'; }
    getAccessorName() { return RESTGroups.getAccessorName(); }

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

    //region Groups

    getGroups(accountId: string) {
        // GET /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getGroups) entry`);
        let getSetOfGroups = function (page, max, groups) {
            return new Promise((resolve, reject) => {
                that.http.get("/api/rainbow/enduser/v1.0/users/" + accountId + "/groups?format=full&offset=" + page + "&limit=" + max, that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                    groups = groups.concat(json?.data);
                    that._logger.log(that.INTERNAL, LOG_ID + "(getGroups) retrieved " + json.data.length + " groups, total " + groups.length + ", existing " + json.total);
                    resolve({groups: groups, finished: groups.length === json.total});
                }).catch(function (err) {
                    return reject(err);
                });
            });
        };

        let getAllGroups = function (page, limit, groups) {
            return new Promise((resolve, reject) => {
                getSetOfGroups(page, limit, groups).then((json: any) => {
                    if (json.finished) {
                        that._logger.log(that.DEBUG, LOG_ID + "(getGroups) getSetOfGroups no need to loop again. All groups retrieve...");
                        return resolve(json.groups);
                    }
                    page += limit;
                    that._logger.log(that.INTERNAL, LOG_ID + "(getGroups) getSetOfGroups need another loop to get more groups... [" + json.groups.length + "]");
                    getAllGroups(page, limit, json.groups).then((allGroups) => {
                        resolve(allGroups);
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
            getAllGroups(page, limit, []).then((json: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getGroups) getAllGroups successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getGroups) getAllGroups received " + json.length + " groups");
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(getGroups) getAllGroups error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getGroups) getAllGroups error : ", err);
                return reject(err);
            });
        });
    }

    getGroup(accountId: string, groupId: string) {
        // GET /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getGroup) entry`);
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + accountId + "/groups/" + groupId, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getGroup) error : ", err);
                return reject(err);
            });
        });
    }

    updateGroupFavorite(accountId: string, groupId: string, favorite: boolean) {
        // PUT /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateGroupFavorite) entry`);
        let data = { isFavorite: favorite };
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + accountId + "/groups/" + groupId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateGroupFavorite) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateGroupFavorite) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateGroupFavorite) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateGroupFavorite) error : ", err);
                return reject(err);
            });
        });
    }

    createGroup(accountId: string, name: string, comment: string, isFavorite: boolean) {
        // POST /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createGroup) entry`);
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + accountId + "/groups", that.getRequestHeader(), {
                name: name,
                comment: comment,
                isFavorite: isFavorite
            }, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createGroup) error : ", err);
                return reject(err);
            });
        });
    }

    deleteGroup(accountId: string, groupId: string) {
        // DELETE /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteGroup) entry`);
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/users/" + accountId + "/groups/" + groupId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteGroup) error : ", err);
                return reject(err);
            });
        });
    }

    updateGroupName(accountId: string, groupId: string, name: string) {
        // PUT /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateGroupName) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + accountId + "/groups/" + groupId, that.getRequestHeader(), { name: name }, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateGroupName) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateGroupName) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateGroupName) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateGroupName) error : ", err);
                return reject(err);
            });
        });
    }

    updateGroupComment(accountId: string, groupId: string, comment: string) {
        // PUT /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateGroupComment) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + accountId + "/groups/" + groupId, that.getRequestHeader(), { comment: comment }, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateGroupComment) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateGroupComment) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateGroupComment) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateGroupComment) error : ", err);
                return reject(err);
            });
        });
    }

    addUserInGroup(accountId: string, contactId: string, groupId: string) {
        // POST /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(addUserInGroup) entry`);
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + accountId + "/groups/" + groupId + "/users/" + contactId, that.getRequestHeader(), undefined, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addUserInGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addUserInGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addUserInGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addUserInGroup) error : ", err);
                return reject(err);
            });
        });
    }

    removeUserFromGroup(accountId: string, contactId: string, groupId: string) {
        // DELETE /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(removeUserFromGroup) entry`);
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/users/" + accountId + "/groups/" + groupId + "/users/" + contactId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(removeUserFromGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(removeUserFromGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID + "(removeUserFromGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(removeUserFromGroup) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Groups

}

module.exports = {'RESTGroups': RESTGroups};
export {RESTGroups as RESTGroups};
