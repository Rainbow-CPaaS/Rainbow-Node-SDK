'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/INVT - ";

/**
 * Handles all REST API calls related to user invitations.
 */
@logEntryExit(LOG_ID)
class RESTInvitations extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTInvitations'; }
    getClassName() { return RESTInvitations.getClassName(); }
    static getAccessorName() { return 'restinvitations'; }
    getAccessorName() { return RESTInvitations.getAccessorName(); }

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

    //region Invitations

    getAllSentInvitations(accountId: string) {
        // API https://api.openrainbow.org/enduser/#api-invitations-getAllSentInvition
        // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/sent
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllSentInvitations) entry`);
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + accountId + "/invitations/sent?format=full&status=pending&limit=500", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllSentInvitations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllSentInvitations) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllSentInvitations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllSentInvitations) error : ", err);
                return reject(err);
            });
        });
    }

    getInvitationsSent(accountId: string, sortField: string = "lastNotificationDate", status: string = "pending", format: string = "small", limit: number = 500, offset: number = undefined, sortOrder: number = 1) {
        // API https://api.openrainbow.org/enduser/#api-invitations-getAllSentInvition
        // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/sent
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getInvitationsSent) entry`);
        return new Promise((resolve, reject) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(getInvitationsSent) REST sortField : ", sortField);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + accountId + "/invitations/sent";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getInvitationsSent) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getInvitationsSent) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getInvitationsSent) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getInvitationsSent) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getInvitationsSent) error : ", err);
                return reject(err);
            });
        });
    }

    getAllReceivedInvitations(accountId: string) {
        // API https://api.openrainbow.org/enduser/#api-invitations-getAllReceivedInvitation
        // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/received
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllReceivedInvitations) entry`);
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + accountId + "/invitations/received?format=full&status=pending&status=accepted&status=auto-accepted&limit=500", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllReceivedInvitations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllReceivedInvitations) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllReceivedInvitations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllReceivedInvitations) error : ", err);
                return reject(err);
            });
        });
    }

    getInvitationsReceived(accountId: string, sortField: string = "lastNotificationDate", status: string = "pending", format: string = "small", limit: number = 500, offset: number = 0, sortOrder: number = 1) {
        // API https://api.openrainbow.org/enduser/#api-invitations-getAllReceivedInvitation
        // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/received
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getInvitationsReceived) entry`);
        return new Promise((resolve, reject) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(getInvitationsReceived) REST sortField : ", sortField);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + accountId + "/invitations/received";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getInvitationsReceived) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getInvitationsReceived) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getInvitationsReceived) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getInvitationsReceived) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getInvitationsReceived) error : ", err);
                return reject(err);
            });
        });
    }

    getServerInvitation(accountId: string, invitationId) {
        // API https://api.openrainbow.org/enduser/#api-invitations-getUserInvitation
        // GET /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getServerInvitation) entry`);
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + accountId + "/invitations/" + invitationId, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getServerInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getServerInvitation) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getServerInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getServerInvitation) error : ", err);
                return reject(err);
            });
        });
    }

    sendInvitationByCriteria(accountId: string, email: string, lang: string, customMessage: string, invitedPhoneNumber: string, invitedUserId: string) {
        // API https://api.openrainbow.org/enduser/#api-invitations-createUserInvitation
        // POST /api/rainbow/enduser/v1.0/users/:userId/invitations
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(sendInvitationByCriteria) entry`);
        return new Promise((resolve, reject) => {
            let params: any = {};
            if (email) { params.email = email; }
            if (lang) { params.lang = lang; }
            if (customMessage) { params.customMessage = customMessage; }
            if (invitedPhoneNumber) { params.invitedPhoneNumber = invitedPhoneNumber; }
            if (invitedUserId) { params.invitedUserId = invitedUserId; }

            that.http.post("/api/rainbow/enduser/v1.0/users/" + accountId + "/invitations", that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(sendInvitationByCriteria) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendInvitationByCriteria) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(sendInvitationByCriteria) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendInvitationByCriteria) error : ", err);
                return reject(err);
            });
        });
    }

    cancelOneSendInvitation(accountId: string, invitation) {
        // API https://api.openrainbow.org/enduser/#api-invitations-cancelUserInvitation
        // POST /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId/cancel
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(cancelOneSendInvitation) entry`);
        return new Promise((resolve, reject) => {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + accountId + "/invitations/" + invitation.id + "/cancel", that.getRequestHeader(), undefined, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(cancelOneSendInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(cancelOneSendInvitation) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(cancelOneSendInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(cancelOneSendInvitation) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAUserInvitation(accountId: string, invitation) {
        // API https://api.openrainbow.org/enduser/#api-invitations-deleteUserInvitation
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteAUserInvitation) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/enduser/v1.0/users/" + accountId + "/invitations/" + invitation.id, that.getRequestHeader()).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAUserInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAUserInvitation) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAUserInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAUserInvitation) error : ", err);
                return reject(err);
            });
        });
    }

    reSendInvitation(accountId: string, invitationId: string, customMessage: string) {
        // API https://api.openrainbow.org/enduser/#api-invitations-resendUserInvitation
        // POST /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId/re-send
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(reSendInvitation) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = {};
            if (customMessage) { data.customMessage = customMessage; }
            that.http.post("/api/rainbow/enduser/v1.0/users/" + accountId + "/invitations/" + invitationId + "/re-send", that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(reSendInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(reSendInvitation) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(reSendInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(reSendInvitation) error : ", err);
                return reject(err);
            });
        });
    }

    sendInvitationsByBulk(userId: string, listOfMails, lang: string = undefined, customMessage: string = undefined) {
        // API https://api.openrainbow.org/enduser/#api-invitations-createUserBulkInvitations
        // POST /api/rainbow/enduser/v1.0/users/:userId/invitations/bulk
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(sendInvitationsByBulk) entry`);
        let data: any = { emails: listOfMails };
        if (lang) { data.lang = lang; }
        if (customMessage) { data.customMessage = customMessage; }

        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + userId + "/invitations/bulk", that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(sendInvitationsByBulk) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendInvitationsByBulk) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(sendInvitationsByBulk) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendInvitationsByBulk) error : ", err);
                return reject(err);
            });
        });
    }

    acceptInvitation(invitation) {
        // API https://api.openrainbow.org/enduser/#api-invitations-acceptUserInvitation
        // POST /api/rainbow/enduser/v1.0/users/:userId/invitations/:invitationId/accept
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(acceptInvitation) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(acceptInvitation) invitation : ", invitation);
            that.http.post("/api/rainbow/enduser/v1.0/users/" + invitation.invitedUserId + "/invitations/" + invitation.id + "/accept", that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(acceptInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(acceptInvitation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(acceptInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(acceptInvitation) error : ", err);
                return reject(err);
            });
        });
    }

    declineInvitation(invitation) {
        // POST /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(declineInvitation) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(declineInvitation) invitation : ", invitation);
            that.http.post("/api/rainbow/enduser/v1.0/users/" + invitation.invitedUserId + "/invitations/" + invitation.id + "/decline", that.getRequestHeader(), {}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(declineInvitation) successfull");
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(declineInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(declineInvitation) error : ", err);
                return reject(err);
            });
        });
    }

    joinContactInvitation(accountId: string, contact) {
        // API https://api.openrainbow.org/enduser/#api-invitations-createUserInvitation
        // POST /api/rainbow/enduser/v1.0/users/:userId/invitations
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(joinContactInvitation) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(joinContactInvitation) contact : ", contact);
            that.http.post("/api/rainbow/enduser/v1.0/users/" + accountId + "/invitations", that.getRequestHeader(), {"invitedUserId": contact.id}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(joinContactInvitation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(joinContactInvitation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(joinContactInvitation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(joinContactInvitation) error : ", err);
                return reject(err);
            });
        });
    }

    joinContacts(contact, contactIds, presence) {
        // POST /api/rainbow/admin/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(joinContacts) entry`);
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/admin/v1.0/users/" + contact.id + "/networks", that.getRequestHeader(),
                {
                    "users": contactIds,
                    "presence": Boolean(presence)
                }
                , undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(joinContacts) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(joinContacts) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(joinContacts) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(joinContacts) error : ", err);
                return reject(err);
            });
        });
    }

    getInvitationById(accountId: string, invitationId) {
        // GET /api/rainbow/enduser/v1.0/users/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getInvitationById) entry`);
        return new Promise(function (resolve, reject) {
            if (!invitationId) {
                that._logger.log(that.DEBUG, LOG_ID + "(getInvitationById) No id provided");
                resolve(null);
            } else {
                that.http.get("/api/rainbow/enduser/v1.0/users/" + accountId + "/invitations/" + invitationId, that.getRequestHeader(), undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getInvitationById) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getInvitationById) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getInvitationById) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getInvitationById) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    //endregion Invitations

}

module.exports = {'RESTInvitations': RESTInvitations};
export {RESTInvitations as RESTInvitations};
