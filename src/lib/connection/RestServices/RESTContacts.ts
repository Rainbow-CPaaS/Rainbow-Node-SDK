'use strict';

import {addParamToUrl, addPropertyToObj, isDefined, logEntryExit, makeId} from "../../common/Utils";
import {createPassword} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";
import {ErrorManager} from "../../common/ErrorManager";

const LOG_ID = "REST/CONT - ";

/**
 * Handles all REST API calls related to Rainbow Contacts, Users, Sources, and Themes.
 */
@logEntryExit(LOG_ID)
class RESTContacts extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTContacts'; }
    getClassName() { return RESTContacts.getClassName(); }
    static getAccessorName() { return 'restcontacts'; }
    getAccessorName() { return RESTContacts.getAccessorName(); }

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

    //region Contacts API

    //region Contacts API - Search portal

    // phonebook
    searchInAlldirectories(pbxId?: string, systemId?: string, numberE164?: string, shortnumber?: string, format: string = "small", limit: number = 100, offset?: number, sortField: string = "reverseDisplayName", sortOrder: number = 1) {
        // API https://api.openrainbow.org/search/#api-phonebook-search_alldirectories_by_GET
        // GET /api/rainbow/search/v1.0/alldirectories

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(searchInAlldirectories) REST numberE164 : ", numberE164);

            let url: string = "/api/rainbow/search/v1.0/alldirectories";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "pbxId", pbxId);
            addParamToUrl(urlParamsTab, "systemId", systemId);
            addParamToUrl(urlParamsTab, "numberE164", numberE164);
            addParamToUrl(urlParamsTab, "shortnumber", shortnumber);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(searchInAlldirectories) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(searchInAlldirectories) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(searchInAlldirectories) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(searchInAlldirectories) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(searchInAlldirectories) error : ", err);
                return reject(err);
            });
        });
    }

    searchInPhonebook(pbxId: string, name: string, number: string, format: string, limit: number, offset: number, sortField: string, sortOrder: number) {
        // API https://api.openrainbow.org/search/#api-phonebook-search_phonebooks_by_GET
        // GET /api/rainbow/search/v1.0/phonebooks

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(searchInPhonebook) REST number : ", number);

            let url: string = "/api/rainbow/search/v1.0/phonebooks";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "pbxId", pbxId);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "number", number);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(searchInPhonebook) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(searchInPhonebook) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(searchInPhonebook) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(searchInPhonebook) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(searchInPhonebook) error : ", err);
                return reject(err);
            });
        });
    }

    // users
    searchUserByPhonenumber(number: string) {
        // API https://api.openrainbow.org/search/#api-users-search_phone-numbers_users
        // GET /api/rainbow/search/v1.0/phone-numbers/:number/users

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(searchUserByPhonenumber) REST number : ", number);

            let url: string = "/api/rainbow/search/v1.0/phone-numbers/" + number + "/users";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
//            addParamToUrl(urlParamsTab, "limit", limit);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(searchUserByPhonenumber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(searchUserByPhonenumber) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(searchUserByPhonenumber) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(searchUserByPhonenumber) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(searchUserByPhonenumber) error : ", err);
                return reject(err);
            });
        });
    }

    searchUsers(limit: number = 20, displayName?: string, search?: string, companyId?: string, excludeCompanyId?: string, offset?: number, sortField?: string, sortOrder: number = 1) {
        // API https://api.openrainbow.org/search/#api-users-SearchUsers
        // GET /api/rainbow/search/v1.0/users

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(searchUsers) REST companyId : ", companyId);

            let url: string = "/api/rainbow/search/v1.0/users";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "displayName", displayName);
            addParamToUrl(urlParamsTab, "search", search);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "excludeCompanyId", excludeCompanyId);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(searchUsers) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(searchUsers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(searchUsers) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(searchUsers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(searchUsers) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Contacts API - Search portal

    //region Sources

    /**
     * Creates a source for a user.
     * @param accountId - fallback userId when userId is not provided
     * @param userId - target user id (uses accountId if falsy)
     * @param sourceId - source identifier
     * @param os - operating system
     */
    async createSource(accountId: string, userId: string, sourceId: string, os: string) {
        // API https://api.openrainbow.org/enduser/#api-sources-createSource
        // POST /api/rainbow/enduser/v1.0/users/:userId/sources

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            userId = userId || accountId;

            if (sourceId) {
                data.sourceId = sourceId;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'sourceId' parameter";
                error.label += "bad or empty 'sourceId' parameter";
                error.cause = sourceId;
                that._logger.log(that.WARN, LOG_ID + `(createSource) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createSource) bad or empty 'sourceId' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (os) {
                data.os = os;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'os' parameter";
                error.label += "bad or empty 'os' parameter";
                error.cause = os;
                that._logger.log(that.WARN, LOG_ID + `(createSource) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createSource) bad or empty 'os' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources";
            that._logger.log(that.INTERNAL, LOG_ID + "(createSource) args : ", data);
            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createSource) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createSource) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createSource) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createSource) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Deletes a source for a user.
     * @param accountId - fallback userId when userId is not provided
     * @param userId - target user id (uses accountId if falsy)
     * @param sourceId - source identifier to delete
     */
    deleteSource(accountId: string, userId: string, sourceId: string) {
        // API https://api.openrainbow.org/enduser/#api-sources-deleteSource
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            userId = userId || accountId;

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId;
            that._logger.log(that.INTERNAL, LOG_ID + "(createSource) args : ", data);
            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createSource) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createSource) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createSource) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createSource) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Retrieves data for a specific source of a user.
     * @param accountId - fallback userId when userId is not provided
     * @param userId - target user id (uses accountId if falsy)
     * @param sourceId - source identifier
     */
    getSourceData(accountId: string, userId: string, sourceId: string) {
        // API https://api.openrainbow.org/enduser/#api-sources-getSourceData
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            userId = userId || accountId;

            if (sourceId) {
                data.sourceId = sourceId;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'sourceId' parameter";
                error.label += "bad or empty 'sourceId' parameter";
                error.cause = sourceId;
                that._logger.log(that.WARN, LOG_ID + `(getSourceData) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(getSourceData) bad or empty 'sourceId' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId;
            that._logger.log(that.INTERNAL, LOG_ID + "(getSourceData) args : ", data);
            that.http.get(url, that.getRequestHeader(), data).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getSourceData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getSourceData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getSourceData) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getSourceData) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Retrieves all sources for a user.
     * @param accountId - fallback userId when userId is not provided
     * @param userId - target user id (uses accountId if falsy)
     * @param format - response format
     * @param sortField - field to sort by
     * @param limit - max results
     * @param offset - pagination offset
     * @param sortOrder - sort direction
     */
    getAllSourcesByUserId(accountId: string, userId: string, format: string = "small", sortField: string = "name", limit: number = 100, offset: number = 0, sortOrder: number = 1) {
        // API https://api.openrainbow.org/enduser/#api-sources-getAllSourcesByUserId
        // GET /api/rainbow/enduser/v1.0/users/:userId/sources

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllSourcesByUserId) REST userId : ", userId);

            userId = userId || accountId;

            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllSourcesByUserId) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllSourcesByUserId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllSourcesByUserId) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllSourcesByUserId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllSourcesByUserId) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Updates data for a specific source of a user.
     * @param accountId - fallback userId when userId is not provided
     * @param userId - target user id (uses accountId if falsy)
     * @param sourceId - source identifier
     * @param os - operating system
     */
    async updateSourceData(accountId: string, userId: string, sourceId: string, os: string) {
        // API https://api.openrainbow.org/enduser/#api-sources-updateSourceData
        // POST /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            userId = userId || accountId;

            if (os) {
                data.os = os;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'os' parameter";
                error.label += "bad or empty 'os' parameter";
                error.cause = os;
                that._logger.log(that.WARN, LOG_ID + `(updateSourceData) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(updateSourceData) bad or empty 'os' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId;
            that._logger.log(that.INTERNAL, LOG_ID + "(updateSourceData) args : ", data);
            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateSourceData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateSourceData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateSourceData) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateSourceData) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Sources

    //region Contacts API - Enduser portal

    /**
     * Updates contact data in a user's source.
     * @param accountId - fallback userId when userId is not provided
     * @param userId - target user id (uses accountId if falsy)
     * @param sourceId - source identifier
     * @param contactIddb - contact database id
     * @param contactId - contact id
     * @param firstName - first name
     * @param lastName - last name
     * @param displayName - display name
     * @param company - company name
     * @param jobTitle - job title
     * @param phoneNumbers - list of phone numbers
     * @param emails - list of emails
     * @param addresses - list of addresses
     * @param groups - list of groups
     * @param otherData - additional data
     */
    async updateContactData(accountId: string, userId: string, sourceId: string, contactIddb: string, contactId: string = undefined, firstName: string = undefined, lastName: string = undefined, displayName: string = undefined, company: string = undefined, jobTitle: string = undefined, phoneNumbers: Array<any>, emails: Array<any>, addresses: Array<any>, groups: Array<string>, otherData: Array<any>) {
        // API https://api.openrainbow.org/enduser/#api-contacts-updateContact
        // PUT /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts/:contactId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            userId = userId || accountId;

            if (!sourceId) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'sourceId' parameter";
                error.label += "bad or empty 'sourceId' parameter";
                error.cause = sourceId;
                that._logger.log(that.WARN, LOG_ID + `(updateContactData) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(updateContactData) bad or empty 'sourceId' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (!contactIddb) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'contactIddb' parameter";
                error.label += "bad or empty 'contactIddb' parameter";
                error.cause = contactIddb;
                that._logger.log(that.WARN, LOG_ID + `(updateContactData) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(updateContactData) bad or empty 'contactIddb' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (contactId) {
                data.contactId = contactId;
            }

            if (firstName) {
                data.firstName = firstName;
            }

            if (lastName) {
                data.lastName = lastName;
            }

            if (displayName) {
                data.displayName = displayName;
            }

            if (company) {
                data.company = company;
            }

            if (jobTitle) {
                data.jobTitle = jobTitle;
            }

            if (phoneNumbers) {
                data.phoneNumbers = phoneNumbers;
            }

            if (emails) {
                data.emails = emails;
            }

            if (addresses) {
                data.addresses = addresses;
            }

            if (groups) {
                data.groups = groups;
            }

            if (otherData) {
                data.otherData = otherData;
            }

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId + "/contacts/" + contactIddb;
            that._logger.log(that.INTERNAL, LOG_ID + "(updateContactData) args : ", data);
            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateContactData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateContactData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateContactData) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateContactData) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Creates a contact in a user's source.
     * @param accountId - fallback userId when userId is not provided
     * @param userId - target user id (uses accountId if falsy)
     * @param sourceId - source identifier
     * @param contactId - contact id
     * @param firstName - first name
     * @param lastName - last name
     * @param displayName - display name
     * @param company - company name
     * @param jobTitle - job title
     * @param phoneNumbers - list of phone numbers
     * @param emails - list of emails
     * @param addresses - list of addresses
     * @param groups - list of groups
     * @param otherData - additional data
     */
    async createContact(accountId: string, userId: string, sourceId: string, contactId: string, firstName: string, lastName: string, displayName: string, company: string, jobTitle: string, phoneNumbers: Array<any>, emails: Array<any>, addresses: Array<any>, groups: Array<string>, otherData: Array<any>) {
        // API https://api.openrainbow.org/enduser/#api-contacts-createContact
        // POST /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            userId = userId || accountId;

            if (sourceId) {
                data.sourceId = sourceId;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'sourceId' parameter";
                error.label += "bad or empty 'sourceId' parameter";
                error.cause = sourceId;
                that._logger.log(that.WARN, LOG_ID + `(createContact) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createContact) bad or empty 'sourceId' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (contactId) {
                data.contactId = contactId;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'contactId' parameter";
                error.label += "bad or empty 'contactId' parameter";
                error.cause = contactId;
                that._logger.log(that.WARN, LOG_ID + `(createContact) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createContact) bad or empty 'contactId' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (firstName) {
                data.firstName = firstName;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'firstName' parameter";
                error.label += "bad or empty 'firstName' parameter";
                error.cause = firstName;
                that._logger.log(that.WARN, LOG_ID + `(createContact) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createContact) bad or empty 'firstName' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (lastName) {
                data.lastName = lastName;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'lastName' parameter";
                error.label += "bad or empty 'lastName' parameter";
                error.cause = lastName;
                that._logger.log(that.WARN, LOG_ID + `(createContact) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createContact) bad or empty 'lastName' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (displayName) {
                data.displayName = displayName;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'displayName' parameter";
                error.label += "bad or empty 'displayName' parameter";
                error.cause = displayName;
                that._logger.log(that.WARN, LOG_ID + `(createContact) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createContact) bad or empty 'displayName' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (company) {
                data.company = company;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'company' parameter";
                error.label += "bad or empty 'company' parameter";
                error.cause = company;
                that._logger.log(that.WARN, LOG_ID + `(createContact) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createContact) bad or empty 'company' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (jobTitle) {
                data.jobTitle = jobTitle;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'jobTitle' parameter";
                error.label += "bad or empty 'jobTitle' parameter";
                error.cause = jobTitle;
                that._logger.log(that.WARN, LOG_ID + `(createContact) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createContact) bad or empty 'jobTitle' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (phoneNumbers) {
                data.phoneNumbers = phoneNumbers;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'phoneNumbers' parameter";
                error.label += "bad or empty 'phoneNumbers' parameter";
                error.cause = phoneNumbers;
                that._logger.log(that.WARN, LOG_ID + `(createContact) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createContact) bad or empty 'phoneNumbers' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (emails) {
                data.emails = emails;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'emails' parameter";
                error.label += "bad or empty 'emails' parameter";
                error.cause = emails;
                that._logger.log(that.WARN, LOG_ID + `(createContact) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createContact) bad or empty 'emails' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (addresses) {
                data.addresses = addresses;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'addresses' parameter";
                error.label += "bad or empty 'addresses' parameter";
                error.cause = addresses;
                that._logger.log(that.WARN, LOG_ID + `(createContact) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createContact) bad or empty 'addresses' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (groups) {
                data.groups = groups;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'groups' parameter";
                error.label += "bad or empty 'groups' parameter";
                error.cause = groups;
                that._logger.log(that.WARN, LOG_ID + `(createContact) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createContact) bad or empty 'groups' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            if (otherData) {
                data.otherData = otherData;
            } else {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'otherData' parameter";
                error.label += "bad or empty 'otherData' parameter";
                error.cause = otherData;
                that._logger.log(that.WARN, LOG_ID + `(createContact) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(createContact) bad or empty 'otherData' parameter : `, error.cause, ", error : ", error);
                return reject(error);
            }

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId + "/contacts";
            that._logger.log(that.INTERNAL, LOG_ID + "(createContact) args : ", data);
            that.http.post(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createContact) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createContact) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createContact) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createContact) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Retrieves data for a specific contact.
     * @param userId - target user id
     * @param sourceId - source identifier
     * @param contactId - contact identifier
     */
    async getContactData(userId: string, sourceId: string, contactId: string) {
        // API https://api.openrainbow.org/enduser/#api-contacts-getContact
        // GET /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts/:contactId

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getContactsList) REST userId : ", userId);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId + "/contacts/" + contactId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getContactData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getContactData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getContactData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactData) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Retrieves the list of contacts for a user's source.
     * @param userId - target user id
     * @param sourceId - source identifier
     * @param format - response format
     */
    async getContactsList(userId: string, sourceId: string, format: string = "small") {
        // API https://api.openrainbow.org/enduser/#api-contacts-getContacts
        // GET /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts

        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getContactsList) REST userId : ", userId);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId + "/contacts";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getContactsList) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactsList) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getContactsList) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getContactsList) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactsList) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Deletes a contact from a user's source.
     * @param accountId - fallback userId when userId is not provided
     * @param userId - target user id (uses accountId if falsy)
     * @param sourceId - source identifier
     * @param contactId - contact identifier to delete
     */
    deleteContact(accountId: string, userId: string, sourceId: string, contactId: string) {
        // API https://api.openrainbow.org/enduser/#api-contacts_deleteContact-DeleteApiRainbowEnduserV10UsersUseridSourcesSourceidContactsContactid
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/sources/:sourceId/contacts/:contactId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {};

            userId = userId || accountId;

            if (!sourceId) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'sourceId' parameter";
                error.label += "bad or empty 'sourceId' parameter";
                error.cause = sourceId;
                that._logger.log(that.WARN, LOG_ID + `(deleteContact) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(deleteContact) bad or empty 'sourceId' parameter : `, error.cause, ", error : ", error);
                reject(error);
                return;
            }

            if (!contactId) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad or empty 'contactId' parameter";
                error.label += "bad or empty 'contactId' parameter";
                error.cause = contactId;
                that._logger.log(that.WARN, LOG_ID + `(deleteContact) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(deleteContact) bad or empty 'contactId' parameter : `, error.cause, ", error : ", error);
                reject(error);
                return;
            }

            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/sources/" + sourceId + "/contacts/" + contactId;
            that._logger.log(that.INTERNAL, LOG_ID + "(createSource) args : ", data);
            that.http.delete(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createSource) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createSource) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createSource) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createSource) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Contacts API - Enduser portal

    /**
     * Retrieves all users for a company.
     * @param format - response format
     * @param offset - pagination offset
     * @param limit - max results
     * @param sortField - field to sort by
     * @param companyId - optional company id filter
     * @param searchEmail - optional email search filter
     * @param accountCompanyId - fallback companyId from account when companyId is not provided
     */
    async getAllUsers(format = "small", offset = 0, limit = 100, sortField = "loginEmail", companyId?: string, searchEmail?: string, accountCompanyId?: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.DEBUG, LOG_ID + "(getAllUsers) entry");
            if (!companyId) {
                companyId = accountCompanyId;
            }
            let url = "/api/rainbow/admin/v1.0/users?format=" + encodeURIComponent(format) + "&limit=" + limit + "&offset=" + offset + "&sortField=" + encodeURIComponent(sortField) + "&sortOrder=-1" + "&companyId=" + encodeURIComponent(companyId);
            if (searchEmail) {
                url += "&searchEmail=" + encodeURIComponent(searchEmail);
            }
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllUsers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllUsers) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllUsers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllUsers) error : ", err);
                return reject(err);
            });
            that._logger.log(that.DEBUG, LOG_ID + "(getAllUsers) after sending the request");
        });
    }

    /**
     * Retrieves users filtered by multiple criteria.
     * @param phoneNumbers - filter by phone numbers count
     * @param phoneNumber - filter by phone number
     * @param searchEmail - filter by email search
     * @param companyId - filter by company id
     * @param roles - filter by roles
     * @param excludeRoles - exclude specific roles
     * @param tags - filter by tags
     * @param departments - filter by departments
     * @param isTerminated - filter terminated accounts
     * @param isActivated - filter activated accounts
     * @param fileSharingCustomisation - file sharing customisation filter
     * @param userTitleNameCustomisation - user title name customisation filter
     * @param softphoneOnlyCustomisation - softphone only customisation filter
     * @param useRoomCustomisation - use room customisation filter
     * @param phoneMeetingCustomisation - phone meeting customisation filter
     * @param useChannelCustomisation - use channel customisation filter
     * @param useScreenSharingCustomisation - use screen sharing customisation filter
     * @param useWebRTCVideoCustomisation - use WebRTC video customisation filter
     * @param useWebRTCAudioCustomisation - use WebRTC audio customisation filter
     * @param instantMessagesCustomisation - instant messages customisation filter
     * @param userProfileCustomisation - user profile customisation filter
     * @param fileStorageCustomisation - file storage customisation filter
     * @param overridePresenceCustomisation - override presence customisation filter
     * @param alert - alert filter
     * @param changeTelephonyCustomisation - change telephony customisation filter
     * @param changeSettingsCustomisation - change settings customisation filter
     * @param recordingConversationCustomisation - recording conversation customisation filter
     * @param useGifCustomisation - use gif customisation filter
     * @param useDialOutCustomisation - use dial out customisation filter
     * @param fileCopyCustomisation - file copy customisation filter
     * @param fileTransferCustomisation - file transfer customisation filter
     * @param forbidFileOwnerChangeCustomisation - forbid file owner change customisation filter
     * @param readReceiptsCustomisation - read receipts customisation filter
     * @param useSpeakingTimeStatistics - use speaking time statistics filter
     * @param selectedAppCustomisationTemplate - selected app customisation template filter
     * @param format - response format
     * @param limit - max results
     * @param offset - pagination offset
     * @param sortField - field to sort by
     * @param sortOrder - sort direction
     * @param displayName - filter by display name
     * @param useEmails - filter by email usage
     * @param companyName - filter by company name
     * @param loginEmail - filter by login email
     * @param email - filter by email
     * @param visibility - filter by visibility
     * @param organisationId - filter by organisation id
     * @param siteId - filter by site id
     * @param jid_im - filter by IM jid
     * @param jid_tel - filter by tel jid
     */
    //async getAllUsersByFilter(format = "small", offset = 0, limit = 100, sortField = "loginEmail", companyId? : string, searchEmail? : string) {
    async getAllUsersByFilter(phoneNumbers: number, phoneNumber: number = undefined, searchEmail: string, companyId: string, roles: string = "user", excludeRoles: string, tags: string, departments: string, isTerminated: string = "false", isActivated: string, fileSharingCustomisation: string, userTitleNameCustomisation: string, softphoneOnlyCustomisation: string,
                              useRoomCustomisation: string, phoneMeetingCustomisation: string,
                              useChannelCustomisation: string, useScreenSharingCustomisation: string, useWebRTCVideoCustomisation: string, useWebRTCAudioCustomisation: string, instantMessagesCustomisation: string, userProfileCustomisation: string, fileStorageCustomisation: string,
                              overridePresenceCustomisation: string, alert: string, changeTelephonyCustomisation: string, changeSettingsCustomisation: string, recordingConversationCustomisation: string,
                              useGifCustomisation: string, useDialOutCustomisation: string, fileCopyCustomisation: string, fileTransferCustomisation: string, forbidFileOwnerChangeCustomisation: string, readReceiptsCustomisation: string, useSpeakingTimeStatistics: string,
                              selectedAppCustomisationTemplate: string, format: string, limit: string,
                              offset: string, sortField: string, sortOrder: string, displayName: string, useEmails: boolean, companyName: string, loginEmail: string, email: string, visibility: string, organisationId: string, siteId: string, jid_im: string, jid_tel: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.DEBUG, LOG_ID + "(getAllUsersByFilter) entry");
            let url = "/api/rainbow/admin/v1.0/users"; // ?format=" + encodeURIComponent(format) + "&limit=" + limit + "&offset=" + offset + "&sortField=" + encodeURIComponent(sortField) + "&sortOrder=-1" + "&companyId=" + encodeURIComponent(companyId);
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            /*if (!companyId) {
                companyId = that.account.companyId;
            } // */

            addParamToUrl(urlParamsTab, "phoneNumbers", phoneNumbers);
            addParamToUrl(urlParamsTab, "phoneNumber", phoneNumber);
            addParamToUrl(urlParamsTab, "searchEmail", searchEmail);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "roles", roles);
            addParamToUrl(urlParamsTab, "excludeRoles", excludeRoles);
            addParamToUrl(urlParamsTab, "tags", tags);
            addParamToUrl(urlParamsTab, "departments", departments);
            addParamToUrl(urlParamsTab, "isTerminated", isTerminated);
            addParamToUrl(urlParamsTab, "isActivated", isActivated);
            addParamToUrl(urlParamsTab, "fileSharingCustomisation", fileSharingCustomisation);
            addParamToUrl(urlParamsTab, "userTitleNameCustomisation", userTitleNameCustomisation);
            addParamToUrl(urlParamsTab, "softphoneOnlyCustomisation", softphoneOnlyCustomisation);
            addParamToUrl(urlParamsTab, "useRoomCustomisation", useRoomCustomisation);
            addParamToUrl(urlParamsTab, "phoneMeetingCustomisation", phoneMeetingCustomisation);
            addParamToUrl(urlParamsTab, "useChannelCustomisation", useChannelCustomisation);
            addParamToUrl(urlParamsTab, "useScreenSharingCustomisation", useScreenSharingCustomisation);
            addParamToUrl(urlParamsTab, "useWebRTCVideoCustomisation", useWebRTCVideoCustomisation);
            addParamToUrl(urlParamsTab, "useWebRTCAudioCustomisation", useWebRTCAudioCustomisation);
            addParamToUrl(urlParamsTab, "instantMessagesCustomisation", instantMessagesCustomisation);
            addParamToUrl(urlParamsTab, "userProfileCustomisation", userProfileCustomisation);
            addParamToUrl(urlParamsTab, "fileStorageCustomisation", fileStorageCustomisation);
            addParamToUrl(urlParamsTab, "overridePresenceCustomisation", overridePresenceCustomisation);
            addParamToUrl(urlParamsTab, "alert", alert);
            addParamToUrl(urlParamsTab, "changeTelephonyCustomisation", changeTelephonyCustomisation);
            addParamToUrl(urlParamsTab, "changeSettingsCustomisation", changeSettingsCustomisation);
            addParamToUrl(urlParamsTab, "recordingConversationCustomisation", recordingConversationCustomisation);
            addParamToUrl(urlParamsTab, "useGifCustomisation", useGifCustomisation);
            addParamToUrl(urlParamsTab, "useDialOutCustomisation", useDialOutCustomisation);
            addParamToUrl(urlParamsTab, "fileCopyCustomisation", fileCopyCustomisation);
            addParamToUrl(urlParamsTab, "fileTransferCustomisation", fileTransferCustomisation);
            addParamToUrl(urlParamsTab, "forbidFileOwnerChangeCustomisation", forbidFileOwnerChangeCustomisation);
            addParamToUrl(urlParamsTab, "readReceiptsCustomisation", readReceiptsCustomisation);
            addParamToUrl(urlParamsTab, "useSpeakingTimeStatistics", useSpeakingTimeStatistics);
            addParamToUrl(urlParamsTab, "selectedAppCustomisationTemplate", selectedAppCustomisationTemplate);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "displayName", displayName);
            addParamToUrl(urlParamsTab, "useEmails", useEmails);
            addParamToUrl(urlParamsTab, "companyName", companyName);
            addParamToUrl(urlParamsTab, "loginEmail", loginEmail);
            addParamToUrl(urlParamsTab, "email", email);
            addParamToUrl(urlParamsTab, "visibility", visibility);
            addParamToUrl(urlParamsTab, "organisationId", organisationId);
            addParamToUrl(urlParamsTab, "siteId", siteId);
            addParamToUrl(urlParamsTab, "jid_im", jid_im);
            addParamToUrl(urlParamsTab, "jid_tel", jid_tel);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllUsersByFilter) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllUsersByFilter) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllUsersByFilter) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllUsersByFilter) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllUsersByFilter) error : ", err);
                return reject(err);
            });
            that._logger.log(that.DEBUG, LOG_ID + "(getAllUsersByFilter) after sending the request");
        });
    }

    /**
     * Retrieves full contact info from admin API by user id.
     * @param userId - target user id
     */
    async getContactInfos(userId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.DEBUG, LOG_ID + "(getContactInfos) entry");
            that.http.get("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInfos) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getContactInfos) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getContactInfos) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactInfos) error : ", err);
                return reject(err);
            });
            that._logger.log(that.DEBUG, LOG_ID + "(getContactInfos) after sending the request");
        });
    }

    /**
     * Updates contact info via admin API.
     * @param userId - target user id
     * @param infos - data to update
     */
    async putContactInfos(userId, infos) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.DEBUG, LOG_ID + "(putContactInfos) entry");
            that.http.put("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader(), infos, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInfos) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getContactInfos) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getContactInfos) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactInfos) error : ", err);
                return reject(err);
            });
            that._logger.log(that.DEBUG, LOG_ID + "(getContactInfos) after sending the request");
        });
    }

    /**
     * Retrieves the logged-in user's network contacts.
     * @returns list of contacts
     */
    async getContacts() {
        // API https://api.openrainbow.org/enduser/#api-users-getUserNetwork
        // GET "/api/rainbow/enduser/v1.0/users/networks"
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/enduser/v1.0/users/networks?format=full", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getContacts) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getContacts) REST result : " + json.total + " contacts");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getContacts) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getContacts) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Removes a contact from the logged-in user's roster.
     * @param dbId - contact database id to remove
     */
    async removeContactFromRoster(dbId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!dbId) {
                that._logger.log(that.DEBUG, LOG_ID + "(removeContactFromRoster) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(removeContactFromRoster) No dbId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/enduser/v1.0/users/networks/" + dbId, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(removeContactFromRoster) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(removeContactFromRoster) REST result : " + json.total + " contacts");
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(removeContactFromRoster) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(removeContactFromRoster) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    /**
     * Retrieves contact information by JID.
     * @param jid - JID of the contact (resource part is stripped)
     */
    async getContactInformationByJID(jid) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!jid) {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByJID)  failed");
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByJID) No jid provided");
                resolve(null);
            } else {

                // Remove resource from jid
                let jidBare = jid;
                if (jid.includes("/")) {
                    jidBare = jid.substr(0, jid.lastIndexOf("/"));
                }

                //that.http.get("/api/rainbow/enduser/v1.0/users/jids/" + encodeURIComponent(jidBare), that.getRequestHeader(), undefined).then(function (json) {
                that.http.get("/api/rainbow/enduser/v1.0/users/jids/" + jidBare, that.getRequestHeader(), undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByJID) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getContactInformationByJID) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getContactInformationByJID) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactInformationByJID) error : ", err);
                    if (err && err.code===404) {
                        resolve(null);
                    } else {
                        return reject(err);
                    }
                });
            }
        });
    }

    /**
     * Retrieves contact information by user id.
     * @param id - user id
     */
    async getContactInformationByID(id) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!id) {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByID) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByID) No id provided");
                resolve(null);
            } else {
                that.http.get("/api/rainbow/enduser/v1.0/users/" + encodeURIComponent(id) + "?format=full", that.getRequestHeader(), undefined, undefined, 1).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByID) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getContactInformationByID) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getContactInformationByID) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactInformationByID) error : ", err);
                    if (err && err.code===404) {
                        resolve(null);
                    } else {
                        return reject(err);
                    }
                });
            }
        });
    }

    /**
     * Retrieves the logged-in user's own information.
     */
    async getMyInformations() {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/enduser/v1.0/users/me", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getMyInformations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getMyInformations) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getMyInformations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getMyInformations) error : ", err);
                if (err && err.code===404) {
                    resolve(null);
                } else {
                    return reject(err);
                }
            });
        });
    }

    /**
     * Retrieves contact information for a list of JIDs.
     * @param jid_im - array of IM JIDs
     * @param sortOrder - sort direction
     */
    async getContactsInformationByJIDs(jid_im : Array<string>, sortOrder: number = 1): Promise<[any]> {
        // API https://api.openrainbow.org/enduser/#api-users-searchUsersByJids
        // POST "/api/rainbow/enduser/v1.0/users/jids"

        let that = this;
        return new Promise(async function (resolve, reject) {
            if (!jid_im) {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactsInformationByJIDs) failed : No jid_im provided");
                resolve(null);
            } else {
                let url = "/api/rainbow/enduser/v1.0/users/jids";
                let urlParamsTab: string[] = [];
                urlParamsTab.push(url);
                addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
                url = urlParamsTab[0];

                let filter: any = {};
                addPropertyToObj(filter, "jid_im", jid_im, false);

                that._logger.log(that.INTERNAL, LOG_ID + "(getContactsInformationByJIDs) with params body : ", filter);
                await that.http.post(url, that.getRequestHeader(), filter, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getContactsInformationByJIDs) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getContactsInformationByJIDs) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getContactsInformationByJIDs) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactsInformationByJIDs) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    /**
     * Retrieves contact information for a list of user ids.
     * @param ids - array of user ids
     * @param sortOrder - sort direction
     */
    async getContactsInformationByIds(ids : Array<string>, sortOrder: number = 1): Promise<[any]> {
        // API https://api.openrainbow.org/enduser/#api-users-searchUsersByIds
        // POST "/api/rainbow/enduser/v1.0/users/ids"

        let that = this;
        return new Promise(async function (resolve, reject) {
            if (!ids) {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactsInformationByIds) failed : No ids provided");
                resolve(null);
            } else {
                let url = "/api/rainbow/enduser/v1.0/users/ids";
                let urlParamsTab: string[] = [];
                urlParamsTab.push(url);
                addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
                url = urlParamsTab[0];

                let filter: any = {};
                addPropertyToObj(filter, "id", ids, false);

                await that.http.post(url, that.getRequestHeader(), filter, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getContactsInformationByIds) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getContactsInformationByIds) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getContactsInformationByIds) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactsInformationByIds) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    /**
     * Retrieves contact information by login email.
     * @param email - login email(s) to search
     * @param sortOrder - sort direction
     * @param limit - max results
     * @param offset - pagination offset
     */
    async getContactInformationByLoginEmail(email, sortOrder: number = 1, limit: number = 100, offset: number = 0): Promise<[any]> {
        // API https://api.openrainbow.org/enduser/#api-users-getUsersByloginEmails
        // POST "/api/rainbow/enduser/v1.0/users/loginEmails"

        let that = this;
        return new Promise(async function (resolve, reject) {
            if (!email) {
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByLoginEmail) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByLoginEmail) No email provided");
                resolve(null);
            } else {
                let url = "/api/rainbow/enduser/v1.0/users/loginEmails";
                let urlParamsTab: string[] = [];
                urlParamsTab.push(url);
                /*if (!companyId) {
                    companyId = that.account.companyId;
                } // */

                addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
                addParamToUrl(urlParamsTab, "limit", limit);
                addParamToUrl(urlParamsTab, "offset", offset);
                url = urlParamsTab[0];

                let filter: any = {};
                addPropertyToObj(filter, "loginEmail", email, false);

                //that._logger.log(that.INTERNAL, LOG_ID + "(getContactInformationByLoginEmail) with params : ", { "loginEmail": email });
                await that.http.post(url, that.getRequestHeader(), filter, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getContactInformationByLoginEmail) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getContactInformationByLoginEmail) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getContactInformationByLoginEmail) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getContactInformationByLoginEmail) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    /*
    createUser(email, password, firstname, lastname, companyId, language, isAdmin, roles) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let user = {
                loginEmail: email,
                password: password,
                firstName: firstname,
                lastName: lastname,
                isActive: true,
                isInitialized: false,
                language: language,
                adminType: "undefined",
                roles: ["user"],
                accountType: "free",
                companyId: null,
            };

            if (companyId) {
                user.companyId = companyId;
            } else {
                user.companyId = that.account.companyId
            }

            if (roles != null) {
                user.roles = roles;
            }

            if (isAdmin) {
                user.roles.push("admin");
                //user.adminType = ["company_admin"];
                user.adminType = "company_admin";
            }

            that.http.post("/api/rainbow/admin/v1.0/users", that.getRequestHeader(), user, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createUser) error : ", err);
                return reject(err);
            });
        });
    }
    // */

    /**
     * Creates a new user via admin API.
     * @param sendInvitationEmail - whether to send an invitation email
     * @param doNotAssignPaidLicense - whether to skip paid license assignment
     * @param mandatoryDefaultSubscription - whether to apply mandatory default subscription
     * @param companyId - company id for the new user
     * @param loginEmail - login email
     * @param customData - custom data object
     * @param password - user password
     * @param firstName - first name
     * @param lastName - last name
     * @param nickName - nickname
     * @param title - title
     * @param jobTitle - job title
     * @param department - department
     * @param tags - tags array
     * @param emails - emails array
     * @param phoneNumbers - phone numbers array
     * @param country - country
     * @param state - state
     * @param language - language
     * @param timezone - timezone
     * @param accountType - account type
     * @param roles - roles array
     * @param adminType - admin type
     * @param isActive - whether user is active
     * @param isInitialized - whether user is initialized
     * @param visibility - visibility
     * @param timeToLive - time to live in seconds
     * @param authenticationType - authentication type
     * @param authenticationExternalUid - external authentication uid
     * @param userInfo1 - custom user info 1
     * @param selectedTheme - selected theme
     * @param userInfo2 - custom user info 2
     * @param isAdmin - whether to grant admin role
     */
    //createUser(email, password, firstname, lastname, companyId, language, isAdmin, roles) {
    createUser(sendInvitationEmail: boolean = false, doNotAssignPaidLicense: boolean = false, mandatoryDefaultSubscription: boolean = false, companyId: string = undefined, loginEmail: string = undefined, customData: any = undefined, password: string = undefined, firstName: string = undefined, lastName: string = undefined,
               nickName: string = undefined, title: string = undefined, jobTitle: string = undefined, department: string = undefined, tags: Array<string> = undefined, emails: Array<any> = undefined, phoneNumbers: Array<any> = undefined, country: string = undefined, state: string = undefined, language: string = undefined,
               timezone: string = undefined, accountType: string = "free", roles: Array<string> = ["user"], adminType: string = undefined, isActive: boolean = true, isInitialized: boolean = false, visibility: string = undefined, timeToLive: number = -1, authenticationType: string = undefined,
               authenticationExternalUid: string = undefined, userInfo1: string = undefined, selectedTheme: string = undefined, userInfo2: string = undefined, isAdmin: boolean = false) {
        // POST /api/rainbow/admin/v1.0/users
        // API https://api.openrainbow.org/admin/#api-users-PostUsers
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/admin/v1.0/users"
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            /*if (!companyId) {
                companyId = that.account.companyId;
            } // */

            addParamToUrl(urlParamsTab, "sendInvitationEmail", sendInvitationEmail);
            addParamToUrl(urlParamsTab, "doNotAssignPaidLicense", doNotAssignPaidLicense);
            addParamToUrl(urlParamsTab, "mandatoryDefaultSubscription", mandatoryDefaultSubscription);
            url = urlParamsTab[0];

            let user: any = {};
            addPropertyToObj(user, "companyId", companyId, false);
            addPropertyToObj(user, "loginEmail", loginEmail, false);
            addPropertyToObj(user, "customData", customData, false);
            addPropertyToObj(user, "password", password, false);
            addPropertyToObj(user, "firstName", firstName, false);
            addPropertyToObj(user, "lastName", lastName, false);
            addPropertyToObj(user, "nickName", nickName, false);
            addPropertyToObj(user, "title", title, false);
            addPropertyToObj(user, "jobTitle", jobTitle, false);
            addPropertyToObj(user, "department", department, false);
            addPropertyToObj(user, "tags", tags, false);
            addPropertyToObj(user, "emails", emails, false);
            addPropertyToObj(user, "phoneNumbers", phoneNumbers, false);
            addPropertyToObj(user, "country", country, false);
            addPropertyToObj(user, "state", state, false);
            addPropertyToObj(user, "language", language, false);
            addPropertyToObj(user, "timezone", timezone, false);
            addPropertyToObj(user, "accountType", accountType, false);
            addPropertyToObj(user, "roles", roles, false);
            addPropertyToObj(user, "adminType", adminType, false);
            addPropertyToObj(user, "isActive", isActive, false);
            addPropertyToObj(user, "isInitialized", isInitialized, false);
            addPropertyToObj(user, "visibility", visibility, false);
            addPropertyToObj(user, "timeToLive", timeToLive, false);
            addPropertyToObj(user, "authenticationType", authenticationType, false);
            addPropertyToObj(user, "authenticationExternalUid", authenticationExternalUid, false);
            addPropertyToObj(user, "userInfo1", userInfo1, false);
            addPropertyToObj(user, "userInfo2", userInfo2, false);
            addPropertyToObj(user, "selectedTheme", selectedTheme, false);


            /*
                loginEmail: loginEmail,
                password: password,
                firstName: firstname,
                lastName: lastname,
                isActive: true,
                isInitialized: false,
                language: language,
                adminType: "undefined",
                roles: ["user"],
                accountType: "free",
                companyId: null,
            };

            if (companyId) {
                user.companyId = companyId;
            } else {
                user.companyId = that.account.companyId
            }

            if (roles != null) {
                user.roles = roles;
            }

            if (isAdmin) {
                user.roles.push("admin");
                //user.adminType = ["company_admin"];
                user.adminType = "company_admin";
            }
            // */

            if (isAdmin) {
                if (user.roles && !user.roles.some((element) => element==="admin")) {
                    that._logger.log(that.INTERNAL, LOG_ID + "(createUser) add \"admin\" role.");
                    user.roles.push("admin");
                }
                //user.adminType = ["company_admin"];
                user.adminType = user.adminType ? user.adminType:"company_admin";
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(createUser) REST url : ", url, ", user : ", user);

            that.http.post(url, that.getRequestHeader(), user, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createUser) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Creates a guest user with a generated email and password.
     * @param firstname - guest first name
     * @param lastname - guest last name
     * @param language - guest language
     * @param timeToLive - account time to live in seconds
     * @param appID - application id used to generate the guest email
     * @param accountCompanyId - company id to assign the guest to
     */
    createGuestUser(firstname, lastname, language, timeToLive, appID: string, accountCompanyId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            // Generate user Email based on appId
            let uid = makeId(40);
            let appId = appID;
            let domain = that.http.host;
            let email = `${uid}@${appId}.${domain}`;

            // Generate a rainbow compatible password
            let password = createPassword(40);

            let user = {
                loginEmail: email,
                password: password,
                isActive: true,
                isInitialized: false,
                adminType: "undefined",
                roles: ["guest"],
                accountType: "free",
                companyId: accountCompanyId, // Current requester company
                firstName: undefined,
                lastName: undefined,
                language: undefined,
                timeToLive: undefined
            };

            if (firstname) {
                user.firstName = firstname;
            }

            if (lastname) {
                user.lastName = lastname;
            }

            if (language) {
                user.language = language;
            }

            if (timeToLive) {
                user.timeToLive = timeToLive;
            }

            that.http.post("/api/rainbow/admin/v1.0/users", that.getRequestHeader(), user, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createGuestUser) successfull");
                // Add generated password into the answer
                json.data.password = password;
                that._logger.log(that.INTERNAL, LOG_ID + "(createGuestUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createGuestUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createGuestUser) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Retrieve the OAuth/OpenID Connect authentication URLs (login, logout, authorize, token, etc.).
     *
     * **GET /api/rainbow/authentication/v1.0/urls**
     * Official documentation: [https://api.openrainbow.org/authentication/#api-Authentication_Urls-GetLoginUrl](https://api.openrainbow.org/authentication/#api-Authentication_Urls-GetLoginUrl)
     *
     * @param params - query parameters including uid, country, uiLocales, useBackchannelPolling
     */
    getAuthenticationUrls(params: {uid:string, country : string, uiLocales : string, useBackchannelPolling : boolean}) {
            let that = this;
            return new Promise(function (resolve, reject) {
                try {
                    let url = "/api/rainbow/authentication/v1.0/urls";
                    let urlParamsTab: string[] = [url];

                    if (params && typeof params === "object") {
                        Object.keys(params).forEach((key) => {
                            if (isDefined(params[key])) {
                                addParamToUrl(urlParamsTab, key, params[key]);
                            }
                        });
                    }

                    url = urlParamsTab[0];

                    that._logger.log(that.INTERNAL, LOG_ID + "(getAuthenticationUrls) REST url : ", url, ", params : ", params);

                    that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                        that._logger.log(that.DEBUG, LOG_ID + "(getAuthenticationUrls) successful");
                        that._logger.log(that.INTERNAL, LOG_ID + "(getAuthenticationUrls) REST result : ", json);
                        if (Array.isArray (json?.data) && json?.data.length > 0) {
                            let urls = {
                                "type": "RAINBOW",
                                "loginUrl": '/api/rainbow/authentication/v1.0/login',
                                "logoutUrl": '/api/rainbow/authentication/v1.0/logout'
                            };
                            //json?.data[0];
                            for (let i = 0; i <json?.data.length; i++) {
                                if (json.data[i].type === "RAINBOW") {
                                    urls = json.data[i];
                                    break;
                                }
                            }
                            resolve(urls);
                        } else {
                            resolve({
                                "type": "RAINBOW",
                                "loginUrl": '/api/rainbow/authentication/v1.0/login',
                                "logoutUrl": '/api/rainbow/authentication/v1.0/logout'
                            })
                        }
                    }).catch(function (err) {
                        that._logger.log(that.ERROR, LOG_ID, "(getAuthenticationUrls) error");
                        that._logger.log(that.INTERNALERROR, LOG_ID, "(getAuthenticationUrls) error : ", err);
                        return reject(err);
                    });
                } catch (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getAuthenticationUrls) exception");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getAuthenticationUrls) exception : ", err);
                    return reject(err);
                }
            });
        }

    /**
     * Initiates the first step of user self-registration by sending an email.
     * @param userInfo - object containing email and lang
     */
    registerUserByEmailFirstStep(userInfo: {"email":string,"lang":string}) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(registerUserByEmailFirstStep) REST.");

           /* let url, headers, params;
            url = "/api/rainbow/enduser/v1.0/notifications/emails/self-register";
            let urlEncoded = that._core._http.serverURL + url;
            headers = that.getPostHeader();
            //delete headers.Authorization;
            if (headers["Content-Type"] === "application/json" ) {
                params = typeof userInfo !== "string" ? JSON.stringify(userInfo) : userInfo;
            }
            that._core._http._postUrlRaw(urlEncoded, headers, params).then((result) => {
                that._logger.log(that.DEBUG, LOG_ID + "(registerUserByEmailFirstStep) Successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(registerUserByEmailFirstStep) Successfull : ", result);
                resolve(result);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID + "(registerUserByEmailFirstStep) ErrorManager : ", userInfo);
                return reject(err);
            });
// */

            that._core._http._post("/api/rainbow/enduser/v1.0/notifications/emails/self-register", that.getPostHeader(), userInfo, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(registerUserByEmailFirstStep) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(registerUserByEmailFirstStep) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(registerUserByEmailFirstStep) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(registerUserByEmailFirstStep) error : ", err);
                return reject(err);
            });
            // */
        });
    }

    /**
     * Completes user self-registration with the temporary token received by email.
     * @param userLoginInfo - object containing loginEmail, password, and temporaryToken
     */
    registerUserByEmailSecondStepWithToken(userLoginInfo: {"loginEmail":string,"password":string,"temporaryToken":string}) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(registerUserByEmailSecondStepWithToken) REST.");

            that._core._http._post("/api/rainbow/enduser/v1.0/users/self-register", that.getPostHeader(), userLoginInfo, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(registerUserByEmailSecondStepWithToken) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(registerUserByEmailSecondStepWithToken) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(registerUserByEmailSecondStepWithToken) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(registerUserByEmailSecondStepWithToken) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Send a message notification (IM) via REST
     * POST /api/rainbow/enduser/v1.0/notifications/message
     * See https://api.openrainbow.org/enduser/#api-notifications_IM-sendMessageNotification
     * @param data object body as required by server (to, type, message, etc.)
     */
    sendMessageNotification(data: any) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(sendMessageNotification) REST.");
            that._core._http._post("/api/rainbow/enduser/v1.0/notifications/message", that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(sendMessageNotification) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendMessageNotification) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(sendMessageNotification) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendMessageNotification) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Changes a user's password via admin API.
     * @param password - new password
     * @param userId - target user id
     */
    changePassword(password, userId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {
                password: password
            };

            that.http.put("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(changePassword) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(changePassword) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(changePassword) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(changePassword) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Updates user information via admin API.
     * @param objData - data object with fields to update
     * @param userId - target user id
     */
    updateInformation(objData, userId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader(), objData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateInformation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateInformation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateInformation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateInformation) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Deletes a user via admin API.
     * @param userId - target user id to delete
     */
    deleteUser(userId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteUser) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteUser) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteUser) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteUser) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Retrieves the external presence of a user.
     * @param userId - target user id
     */
    getUserExternalPresence(userId) {
        // API : https://api.openrainbow.org/admin/#api-users_external_presence-GetUsersExternalPresence
        // GET /api/rainbow/admin/v1.0/users/{userId}/external-presence
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/admin/v1.0/users/" + userId + "/external-presence";
            that._logger.log(that.INTERNAL, LOG_ID + "(getUserExternalPresence) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getUserExternalPresence) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getUserExternalPresence) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getUserExternalPresence) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getUserExternalPresence) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Updates the external presence of a user.
     * @param userId - target user id
     * @param externalPresence - external presence data
     */
    updateUserExternalPresence(userId, externalPresence) {
        // API : https://api.openrainbow.org/admin/#api-users_external_presence-PutUsersExternalPresence
        // PUT /api/rainbow/admin/v1.0/users/{userId}/external-presence
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/admin/v1.0/users/" + userId + "/external-presence";
            let body: any = {};
            addPropertyToObj(body, "externalPresence", externalPresence, false);

            that._logger.log(that.INTERNAL, LOG_ID + "(updateUserExternalPresence) REST url : ", url, ", body : ", body);

            that.http.put(url, that.getRequestHeader(), body, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateUserExternalPresence) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateUserExternalPresence) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateUserExternalPresence) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateUserExternalPresence) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Deletes the external presence of a user.
     * @param userId - target user id
     */
    deleteUserExternalPresence(userId) {
        // API : https://api.openrainbow.org/admin/#api-users_external_presence-DeleteUsersExternalPresence
        // DELETE /api/rainbow/admin/v1.0/users/{userId}/external-presence
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/admin/v1.0/users/" + userId + "/external-presence";
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteUserExternalPresence) REST url : ", url);

            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteUserExternalPresence) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteUserExternalPresence) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteUserExternalPresence) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteUserExternalPresence) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Retrieves the custom status of a user.
     * @param userId - target user id
     */
    getCustomStatus(userId) {
        // API : https://api.openrainbow.org/enduser/#api-custom_status-GetCustomStatus
        // GET /api/rainbow/enduser/v1.0/users/{userId}/custom-status
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/custom-status";
            that._logger.log(that.INTERNAL, LOG_ID + "(getCustomStatus) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getCustomStatus) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getCustomStatus) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getCustomStatus) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getCustomStatus) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Sets or changes the custom status of a user.
     * @param userId - target user id
     * @param customStatus - status text
     * @param emoji - emoji for the status
     * @param expirationDate - status expiration date
     */
    setCustomStatus(userId : string, customStatus: string, emoji: string, expirationDate : string) {
        // API : https://api.openrainbow.org/enduser/#api-custom-status-setOrChangeUserCustomStatus
        // POST /api/rainbow/enduser/v1.0/users/{userId}/custom-status
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/custom-status";
            let body: any = {};
            addPropertyToObj(body, "status", customStatus, false);
            addPropertyToObj(body, "emoji", emoji, false);
            addPropertyToObj(body, "expirationDate", expirationDate, false);

            that._logger.log(that.INTERNAL, LOG_ID + "(setCustomStatus) REST url : ", url, ", body : ", body);

            that.http.post(url, that.getRequestHeader(), body, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(setCustomStatus) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(setCustomStatus) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(setCustomStatus) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(setCustomStatus) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Deletes the custom status of a user.
     * @param userId - target user id
     */
    deleteCustomStatus(userId) {
        // API : https://api.openrainbow.org/enduser/#api-custom_status-DeleteCustomStatus
        // DELETE /api/rainbow/enduser/v1.0/users/{userId}/custom-status
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/custom-status";
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteCustomStatus) REST url : ", url);

            that.http.delete(url, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteCustomStatus) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteCustomStatus) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteCustomStatus) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCustomStatus) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Updates end-user information via enduser API.
     * @param userId - target user id
     * @param objData - data object with fields to update
     */
    updateEndUserInformations(userId, objData) {
        // API : https://api.openrainbow.org/enduser/#api-users-updateUser
        // URL PUT /api/rainbow/enduser/v1.0/users/:userId
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + userId, that.getRequestHeader(), objData, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateEndUserInformations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateEndUserInformations) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateEndUserInformations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateEndUserInformations) error : ", err);
                return reject(err);
            });
        });
    }

    //region Enduser Themes API

    /**
     * Retrieves available themes via enduser API.
     * @param format - response format
     * @param variant - theme variant
     * @param limit - max results
     * @param offset - pagination offset
     * @param sortField - field to sort by
     * @param sortOrder - sort direction
     * @param name - filter by theme name
     */
    getThemes(format = "small", variant = undefined, limit = 100, offset = 0, sortField = "name", sortOrder = 1, name = undefined) {
        // API: https://api.openrainbow.org/enduser/#api-themes
        // GET /api/rainbow/enduser/v1.0/themes
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                let url = "/api/rainbow/enduser/v1.0/themes";
                let urlParamsTab: string[] = [];
                urlParamsTab.push(url);
                addParamToUrl(urlParamsTab, "format", format);
                addParamToUrl(urlParamsTab, "variant", variant);
                addParamToUrl(urlParamsTab, "limit", limit);
                addParamToUrl(urlParamsTab, "offset", offset);
                addParamToUrl(urlParamsTab, "sortField", sortField);
                addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
                addParamToUrl(urlParamsTab, "name", name);
                url = urlParamsTab[0];

                that._logger.log(that.INTERNAL, LOG_ID + "(getThemes) REST url : ", url);

                that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getThemes) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getThemes) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getThemes) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getThemes) error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(getThemes) exception : ", err);
                return reject(err);
            }
        });
    }

    /**
     * Retrieves themes assigned to a user.
     * @param userId - target user id
     * @param selectedThemeObj - whether to include the selected theme object
     * @param variant - theme variant
     */
    getUserThemes(userId, selectedThemeObj = false, variant = undefined) {
        // API: https://api.openrainbow.org/enduser/#api-themes
        // GET /api/rainbow/enduser/v1.0/users/:userId/themes
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/themes";
                let urlParamsTab: string[] = [];
                urlParamsTab.push(url);
                addParamToUrl(urlParamsTab, "selectedThemeObj", selectedThemeObj);
                addParamToUrl(urlParamsTab, "variant", variant);
                url = urlParamsTab[0];

                that._logger.log(that.INTERNAL, LOG_ID + "(getUserThemes) REST url : ", url);

                that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getUserThemes) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getUserThemes) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getUserThemes) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getUserThemes) error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(getUserThemes) exception : ", err);
                return reject(err);
            }
        });
    }

    /**
     * Sets a theme for a user.
     * @param userId - target user id
     * @param themeId - theme id to set
     * @param variant - theme variant
     */
    setUserTheme(userId, themeId, variant = undefined) {
        // API: https://api.openrainbow.org/enduser/#api-themes
        // PUT /api/rainbow/enduser/v1.0/users/:userId/themes/:themeId
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/themes/" + themeId;
                let body: any = {};
                addPropertyToObj(body, "variant", variant, false);

                that._logger.log(that.INTERNAL, LOG_ID + "(setUserTheme) REST url : ", url, ", body : ", body);

                that.http.put(url, that.getRequestHeader(), body, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(setUserTheme) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(setUserTheme) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(setUserTheme) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(setUserTheme) error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(setUserTheme) exception : ", err);
                return reject(err);
            }
        });
    }

    /**
     * Deletes themes for a user.
     * @param userId - target user id
     * @param variant - theme variant to delete
     */
    deleteUserThemes(userId, variant = undefined) {
        // API: https://api.openrainbow.org/enduser/#api-themes
        // DELETE /api/rainbow/enduser/v1.0/users/:userId/themes
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/themes";
                let urlParamsTab: string[] = [];
                urlParamsTab.push(url);
                addParamToUrl(urlParamsTab, "variant", variant);
                url = urlParamsTab[0];

                that._logger.log(that.INTERNAL, LOG_ID + "(deleteUserThemes) REST url : ", url);

                that.http.delete(url, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteUserThemes) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteUserThemes) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteUserThemes) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteUserThemes) error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteUserThemes) exception : ", err);
                return reject(err);
            }
        });
    }

    //endregion Enduser Themes API

    //region Admin Themes API

    /**
     * Retrieves available themes via admin API.
     * @param format - response format
     * @param variant - theme variant
     * @param limit - max results
     * @param offset - pagination offset
     * @param sortField - field to sort by
     * @param sortOrder - sort direction
     * @param name - filter by theme name
     */
    getAdminThemes(format = "small", variant = undefined, limit = 100, offset = 0, sortField = "name", sortOrder = 1, name = undefined) {
        // API: https://api.openrainbow.org/admin/#api-themes
        // GET /api/rainbow/admin/v1.0/themes
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                let url = "/api/rainbow/admin/v1.0/themes";
                let urlParamsTab: string[] = [];
                urlParamsTab.push(url);
                addParamToUrl(urlParamsTab, "format", format);
                addParamToUrl(urlParamsTab, "variant", variant);
                addParamToUrl(urlParamsTab, "limit", limit);
                addParamToUrl(urlParamsTab, "offset", offset);
                addParamToUrl(urlParamsTab, "sortField", sortField);
                addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
                addParamToUrl(urlParamsTab, "name", name);
                url = urlParamsTab[0];

                that._logger.log(that.INTERNAL, LOG_ID + "(getAdminThemes) REST url : ", url);

                that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getAdminThemes) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getAdminThemes) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getAdminThemes) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getAdminThemes) error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(getAdminThemes) exception : ", err);
                return reject(err);
            }
        });
    }

    /**
     * Retrieves themes for a company via admin API.
     * @param companyId - target company id
     * @param selectedThemeObj - whether to include the selected theme object
     * @param variant - theme variant
     */
    getCompanyThemes(companyId, selectedThemeObj = false, variant = undefined) {
        // API: https://api.openrainbow.org/admin/#api-themes
        // GET /api/rainbow/admin/v1.0/companies/:companyId/themes
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/themes";
                let urlParamsTab: string[] = [];
                urlParamsTab.push(url);
                addParamToUrl(urlParamsTab, "selectedThemeObj", selectedThemeObj);
                addParamToUrl(urlParamsTab, "variant", variant);
                url = urlParamsTab[0];

                that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyThemes) REST url : ", url);

                that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(getCompanyThemes) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(getCompanyThemes) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(getCompanyThemes) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(getCompanyThemes) error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(getCompanyThemes) exception : ", err);
                return reject(err);
            }
        });
    }

    /**
     * Creates a theme for a company via admin API.
     * @param companyId - target company id
     * @param name - theme name
     * @param variant - theme variant
     * @param description - theme description
     * @param isPublic - whether the theme is public
     * @param visibleBy - list of company ids that can see this theme
     * @param data - theme data object
     */
    createCompanyTheme(companyId, name, variant = undefined, description = undefined, isPublic = undefined, visibleBy: Array<string> = undefined, data: any = undefined) {
        // API: https://api.openrainbow.org/admin/#api-themes
        // POST /api/rainbow/admin/v1.0/companies/:companyId/themes
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/themes";
                let body: any = {};
                addPropertyToObj(body, "name", name, false);
                addPropertyToObj(body, "variant", variant, false);
                addPropertyToObj(body, "description", description, false);
                addPropertyToObj(body, "isPublic", isPublic, false);
                addPropertyToObj(body, "visibleBy", visibleBy, false);
                addPropertyToObj(body, "data", data, false);

                that._logger.log(that.INTERNAL, LOG_ID + "(createCompanyTheme) REST url : ", url, ", body : ", body);

                that.http.post(url, that.getRequestHeader(), body, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(createCompanyTheme) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(createCompanyTheme) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(createCompanyTheme) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(createCompanyTheme) error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(createCompanyTheme) exception : ", err);
                return reject(err);
            }
        });
    }

    /**
     * Updates a theme for a company via admin API.
     * @param companyId - target company id
     * @param themeId - theme id to update
     * @param name - theme name
     * @param variant - theme variant
     * @param description - theme description
     * @param isPublic - whether the theme is public
     * @param visibleBy - list of company ids that can see this theme
     * @param data - theme data object
     */
    updateCompanyTheme(companyId, themeId, name = undefined, variant = undefined, description = undefined, isPublic = undefined, visibleBy: Array<string> = undefined, data: any = undefined) {
        // API: https://api.openrainbow.org/admin/#api-themes
        // PUT /api/rainbow/admin/v1.0/companies/:companyId/themes/:themeId
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/themes/" + themeId;
                let body: any = {};
                addPropertyToObj(body, "name", name, false);
                addPropertyToObj(body, "variant", variant, false);
                addPropertyToObj(body, "description", description, false);
                addPropertyToObj(body, "isPublic", isPublic, false);
                addPropertyToObj(body, "visibleBy", visibleBy, false);
                addPropertyToObj(body, "data", data, false);

                that._logger.log(that.INTERNAL, LOG_ID + "(updateCompanyTheme) REST url : ", url, ", body : ", body);

                that.http.put(url, that.getRequestHeader(), body, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(updateCompanyTheme) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(updateCompanyTheme) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(updateCompanyTheme) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(updateCompanyTheme) error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(updateCompanyTheme) exception : ", err);
                return reject(err);
            }
        });
    }

    /**
     * Deletes a theme from a company via admin API.
     * @param companyId - target company id
     * @param themeId - theme id to delete
     */
    deleteCompanyTheme(companyId, themeId) {
        // API: https://api.openrainbow.org/admin/#api-themes
        // DELETE /api/rainbow/admin/v1.0/companies/:companyId/themes/:themeId
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                let url = "/api/rainbow/admin/v1.0/companies/" + companyId + "/themes/" + themeId;

                that._logger.log(that.INTERNAL, LOG_ID + "(deleteCompanyTheme) REST url : ", url);

                that.http.delete(url, that.getRequestHeader()).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteCompanyTheme) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteCompanyTheme) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteCompanyTheme) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCompanyTheme) error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteCompanyTheme) exception : ", err);
                return reject(err);
            }
        });
    }

    //endregion Admin Themes API

    //endregion Contacts API
}

module.exports = {'RESTContacts': RESTContacts};
export {RESTContacts as RESTContacts};
