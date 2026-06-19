'use strict';

import {addParamToUrl, addPropertyToObj, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";
import {ErrorManager} from "../../common/ErrorManager";

const LOG_ID = "REST/CCARE - ";

/**
 * Handles all REST API calls related to Customer Care.
 */
@logEntryExit(LOG_ID)
class RESTCustomerCare extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTCustomerCare'; }
    getClassName() { return RESTCustomerCare.getClassName(); }
    static getAccessorName() { return 'restcustomercare'; }
    getAccessorName() { return RESTCustomerCare.getAccessorName(); }

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

    //region Customer Care

    getCustomerCareAdministratorsGroup() {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getCustomerCareAdministratorsGroup) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/customercare/v1.0/administrators";
            that._logger.log(that.INTERNAL, LOG_ID + "(getCustomerCareAdministratorsGroup) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getCustomerCareAdministratorsGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCustomerCareAdministratorsGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCustomerCareAdministratorsGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCustomerCareAdministratorsGroup) error : ", err);
                return reject(err);
            });
        });
    }

    addAdministratorToGroup(userId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(addAdministratorToGroup) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/customercare/v1.0/administrators/" + userId;
            let data: any = {};
            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(addAdministratorToGroup) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(addAdministratorToGroup) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addAdministratorToGroup) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addAdministratorToGroup) error : ", err);
                return reject(err);
            });
        });
    }

    removeAdministratorFromGroup(userId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(removeAdministratorFromGroup) entry`);
        return new Promise(function (resolve, reject) {
            if (!userId) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "No userId provided";
                error.label += "No userId provided";
                error.cause = userId;
                that._logger.log(that.WARN, LOG_ID + `(removeAdministratorFromGroup) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(removeAdministratorFromGroup) No userId provided : `, error.cause, ", error : ", error);
                return reject(error);
            } else {
                that.http.delete("/api/rainbow/customercare/v1.0/administrators/" + userId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(removeAdministratorFromGroup) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(removeAdministratorFromGroup) REST result : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(removeAdministratorFromGroup) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(removeAdministratorFromGroup) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    getIssue(logId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getIssue) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/customercare/v1.0/logs/" + logId;
            that._logger.log(that.INTERNAL, LOG_ID + "(getIssue) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getIssue) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getIssue) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getIssue) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getIssue) error : ", err);
                return reject(err);
            });
        });
    }

    getListOfIssues(limit: number = 100, offset: number = 0, sortField: string = "creationDate",
                    sortOrder: number = -1, companyId: string, bpId: string, customerCategory: string = "all",
                    name: string, version: string, device: string, fromCreationDate: string, toCreationDate: string,
                    fromOccurrenceDate: string, toOccurrenceDate: string, format: string = "small") {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getListOfIssues) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/customercare/v1.0/logs";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "bpId", bpId);
            addParamToUrl(urlParamsTab, "customerCategory", customerCategory);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "version", version);
            addParamToUrl(urlParamsTab, "device", device);
            addParamToUrl(urlParamsTab, "fromCreationDate", fromCreationDate);
            addParamToUrl(urlParamsTab, "toCreationDate", toCreationDate);
            addParamToUrl(urlParamsTab, "fromOccurrenceDate", fromOccurrenceDate);
            addParamToUrl(urlParamsTab, "toOccurrenceDate", toOccurrenceDate);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getListOfIssues) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getListOfIssues) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getListOfIssues) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getListOfIssues) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getListOfIssues) error : ", err);
                return reject(err);
            });
        });
    }

    getListOfIssuesForUser(userId: string, format: string = "small") {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getListOfIssuesForUser) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/customercare/v1.0/users/" + userId + "/logs";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getListOfIssuesForUser) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getListOfIssuesForUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getListOfIssuesForUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getListOfIssuesForUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getListOfIssuesForUser) error : ", err);
                return reject(err);
            });
        });
    }

    getIssueForUser(userId: string, logId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getIssueForUser) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/customercare/v1.0/users/" + userId + "/logs/" + logId;
            that._logger.log(that.INTERNAL, LOG_ID + "(getIssueForUser) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getIssueForUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getIssueForUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getIssueForUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getIssueForUser) error : ", err);
                return reject(err);
            });
        });
    }

    initiateLogsContext(userId: string, occurrenceDate: string, occurrenceDateTimezone: string, type: string,
                        description: string, resourceId: string, externalRef: string, device: string,
                        attachments: Array<string>, version: string, deviceDetails: any) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(initiateLogsContext) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/customercare/v1.0/users/" + userId + "/logs";
            let data: any = {};
            addPropertyToObj(data, "occurrenceDate", occurrenceDate, false);
            addPropertyToObj(data, "occurrenceDateTimezone", occurrenceDateTimezone, false);
            addPropertyToObj(data, "type", type, false);
            addPropertyToObj(data, "description", description, false);
            addPropertyToObj(data, "resourceId", resourceId, false);
            addPropertyToObj(data, "externalRef", externalRef, false);
            addPropertyToObj(data, "device", device, false);
            addPropertyToObj(data, "attachments", attachments, false);
            addPropertyToObj(data, "version", version, false);
            addPropertyToObj(data, "deviceDetails", deviceDetails, false);
            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(initiateLogsContext) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(initiateLogsContext) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(initiateLogsContext) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(initiateLogsContext) error : ", err);
                return reject(err);
            });
        });
    }

    completeLogsContext(userId: string, logId: string, occurrenceDate: string, occurrenceDateTimezone: string,
                        description: string, externalRef: string, device: string, attachments: Array<string>,
                        version: string, deviceDetails: any) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(completeLogsContext) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/customercare/v1.0/users/" + userId + "/logs/" + logId;
            let data: any = {};
            addPropertyToObj(data, "occurrenceDate", occurrenceDate, false);
            addPropertyToObj(data, "occurrenceDateTimezone", occurrenceDateTimezone, false);
            addPropertyToObj(data, "description", description, false);
            addPropertyToObj(data, "externalRef", externalRef, false);
            addPropertyToObj(data, "device", device, false);
            addPropertyToObj(data, "attachments", attachments, false);
            addPropertyToObj(data, "version", version, false);
            addPropertyToObj(data, "deviceDetails", deviceDetails, false);
            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(completeLogsContext) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(completeLogsContext) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(completeLogsContext) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(completeLogsContext) error : ", err);
                return reject(err);
            });
        });
    }

    cancelOrCloseLogsSubmission(userId: string, logId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(cancelOrCloseLogsSubmission) entry`);
        return new Promise(function (resolve, reject) {
            if (!userId) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "No userId provided";
                error.label += "No userId provided";
                error.cause = userId;
                that._logger.log(that.WARN, LOG_ID + `(cancelOrCloseLogsSubmission) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(cancelOrCloseLogsSubmission) No userId provided : `, error.cause, ", error : ", error);
                return reject(error);
            } else {
                that.http.delete("/api/rainbow/customercare/v1.0/users/" + userId + "/logs/" + logId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(cancelOrCloseLogsSubmission) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(cancelOrCloseLogsSubmission) REST result : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(cancelOrCloseLogsSubmission) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(cancelOrCloseLogsSubmission) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    acknowledgeLogsRequest(userId: string, logId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(acknowledgeLogsRequest) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/customercare/v1.0/users/" + userId + "/logs/" + logId + "/ack";
            let data: any = {};
            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(acknowledgeLogsRequest) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(acknowledgeLogsRequest) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(acknowledgeLogsRequest) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(acknowledgeLogsRequest) error : ", err);
                return reject(err);
            });
        });
    }

    rejectLogsRequest(userId: string, logId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(rejectLogsRequest) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/customercare/v1.0/users/" + userId + "/logs/" + logId + "/reject";
            let data: any = {};
            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(rejectLogsRequest) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(rejectLogsRequest) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(rejectLogsRequest) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(rejectLogsRequest) error : ", err);
                return reject(err);
            });
        });
    }

    adminOrBotAddAdditionalFiles(userId: string, logId: string, attachments: Array<string>, conversationId: string, fileName: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(adminOrBotAddAdditionalFiles) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/customercare/v1.0/users/" + userId + "/logs/" + logId + "/attachments";
            let data: any = {};
            addPropertyToObj(data, "conversationId", conversationId, false);
            addPropertyToObj(data, "fileName", fileName, false);
            addPropertyToObj(data, "attachments", attachments, false);
            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(adminOrBotAddAdditionalFiles) successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(adminOrBotAddAdditionalFiles) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(adminOrBotAddAdditionalFiles) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(adminOrBotAddAdditionalFiles) error : ", err);
                return reject(err);
            });
        });
    }

    getListOfResourcesForUser(userId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getListOfResourcesForUser) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/customercare/v1.0/users/" + userId + "/resources";
            that._logger.log(that.INTERNAL, LOG_ID + "(getListOfResourcesForUser) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getListOfResourcesForUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getListOfResourcesForUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getListOfResourcesForUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getListOfResourcesForUser) error : ", err);
                return reject(err);
            });
        });
    }

    createAnAtriumTicket(userId: string, subject: string, description: string, additionalDescription: string,
                         resource: string, externalRef: string, logs: Array<string>) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createAnAtriumTicket) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/customercare/v1.0/users/" + userId + "/ticket";
            let data: any = {};
            addPropertyToObj(data, "subject", subject, false);
            addPropertyToObj(data, "description", description, false);
            addPropertyToObj(data, "additionalDescription", additionalDescription, false);
            addPropertyToObj(data, "resource", resource, false);
            addPropertyToObj(data, "externalRef", externalRef, false);
            addPropertyToObj(data, "logs", logs, false);
            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createAnAtriumTicket) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createAnAtriumTicket) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createAnAtriumTicket) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createAnAtriumTicket) error : ", err);
                return reject(err);
            });
        });
    }

    updateAnAtriumTicket(userId: string, ticketId: string, subject: string, description: string,
                         additionalDescription: string, resource: string, externalRef: string, logs: Array<string>) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateAnAtriumTicket) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/customercare/v1.0/users/" + userId + "/ticket/" + ticketId;
            let data: any = {};
            addPropertyToObj(data, "subject", subject, false);
            addPropertyToObj(data, "description", description, false);
            addPropertyToObj(data, "additionalDescription", additionalDescription, false);
            addPropertyToObj(data, "resource", resource, false);
            addPropertyToObj(data, "externalRef", externalRef, false);
            addPropertyToObj(data, "logs", logs, false);
            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateAnAtriumTicket) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateAnAtriumTicket) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateAnAtriumTicket) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateAnAtriumTicket) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAnAtriumTicketInformation(userId: string, ticketId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteAnAtriumTicketInformation) entry`);
        return new Promise(function (resolve, reject) {
            if (!userId) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "No userId provided";
                error.label += "No userId provided";
                error.cause = userId;
                that._logger.log(that.WARN, LOG_ID + `(deleteAnAtriumTicketInformation) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(deleteAnAtriumTicketInformation) No userId provided : `, error.cause, ", error : ", error);
                return reject(error);
            } else {
                that.http.delete("/api/rainbow/customercare/v1.0/users/" + userId + "/ticket/" + ticketId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteAnAtriumTicketInformation) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteAnAtriumTicketInformation) REST result : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteAnAtriumTicketInformation) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAnAtriumTicketInformation) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    readAnAtriumTicketInformation(userId: string, ticketId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(readAnAtriumTicketInformation) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/customercare/v1.0/users/" + userId + "/ticket/" + ticketId;
            that._logger.log(that.INTERNAL, LOG_ID + "(readAnAtriumTicketInformation) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(readAnAtriumTicketInformation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(readAnAtriumTicketInformation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(readAnAtriumTicketInformation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(readAnAtriumTicketInformation) error : ", err);
                return reject(err);
            });
        });
    }

    readAllTicketsOnASameCompany(userId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(readAllTicketsOnASameCompany) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/customercare/v1.0/users/" + userId + "/ticket";
            that._logger.log(that.INTERNAL, LOG_ID + "(readAllTicketsOnASameCompany) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(readAllTicketsOnASameCompany) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(readAllTicketsOnASameCompany) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(readAllTicketsOnASameCompany) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(readAllTicketsOnASameCompany) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Customer Care

}

module.exports = {'RESTCustomerCare': RESTCustomerCare};
export {RESTCustomerCare as RESTCustomerCare};
