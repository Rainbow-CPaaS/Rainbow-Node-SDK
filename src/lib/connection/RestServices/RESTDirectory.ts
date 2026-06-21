'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/DIR - ";

/**
 * Handles all REST API calls related to the Rainbow Company Directory.
 */
@logEntryExit(LOG_ID)
class RESTDirectory extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTDirectory'; }
    getClassName() { return RESTDirectory.getClassName(); }
    static getAccessorName() { return 'restdirectory'; }
    getAccessorName() { return RESTDirectory.getAccessorName(); }

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

    //region Rainbow Company Directory portal

    createDirectoryEntry(companyId: string, firstName: string, lastName: string, companyName: string,
                         department: string, street: string, city: string, state: string, postalCode: string,
                         country: string, workPhoneNumbers: string[], mobilePhoneNumbers: string[],
                         otherPhoneNumbers: string[], jobTitle: string, eMail: string, tags: string[],
                         custom1: string, custom2: string) {
        // POST /api/rainbow/directory/v1.0/entries
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createDirectoryEntry) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = {};
            if (companyId) data.companyId = companyId;
            if (firstName) data.firstName = firstName;
            if (lastName) data.lastName = lastName;
            if (companyName) data.companyName = companyName;
            if (department) data.department = department;
            if (street) data.street = street;
            if (city) data.city = city;
            if (state) data.state = state;
            if (postalCode) data.postalCode = postalCode;
            if (country) data.country = country;
            if (workPhoneNumbers) data.workPhoneNumbers = workPhoneNumbers;
            if (mobilePhoneNumbers) data.mobilePhoneNumbers = mobilePhoneNumbers;
            if (otherPhoneNumbers) data.otherPhoneNumbers = otherPhoneNumbers;
            if (jobTitle) data.jobTitle = jobTitle;
            if (eMail) data.eMail = eMail;
            if (tags) data.tags = tags;
            if (custom1) data.custom1 = custom1;
            if (custom2) data.custom2 = custom2;
            that._logger.log(that.INTERNAL, LOG_ID + "(createDirectoryEntry) args : ", data);
            that.http.post("/api/rainbow/directory/v1.0/entries", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createDirectoryEntry) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createDirectoryEntry) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createDirectoryEntry) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createDirectoryEntry) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCompanyDirectoryAllEntry(companyId: string) {
        // DELETE /api/rainbow/directory/v1.0/companies/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteCompanyDirectoryAllEntry) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/directory/v1.0/companies/" + companyId, that.getRequestHeader())
                .then((response) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteCompanyDirectoryAllEntry) (" + companyId + ") -- success");
                    resolve(response);
                })
                .catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteCompanyDirectoryAllEntry) (" + companyId + ") -- failure -- ");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteCompanyDirectoryAllEntry) (" + companyId + ") -- failure -- ", err.message);
                    return reject(err);
                });
        });
    }

    deleteDirectoryEntry(entryId: string) {
        // API https://api.openrainbow.org/directory/#api-directory-DeleteDirectory
        // DELETE /api/rainbow/directory/v1.0/entries/:entryId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteDirectoryEntry) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/directory/v1.0/entries/" + entryId, that.getRequestHeader())
                .then((response) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteDirectoryEntry) (" + entryId + ") -- success");
                    resolve(response);
                })
                .catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteDirectoryEntry) (" + entryId + ") -- failure -- ");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteDirectoryEntry) (" + entryId + ") -- failure -- ", err.message);
                    return reject(err);
                });
        });
    }

    getDirectoryEntryData(entryId: string, format: string) {
        // GET /api/rainbow/directory/v1.0/entries/:entryId
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getDirectoryEntryData) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/directory/v1.0/entries/" + entryId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getDirectoryEntryData) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getDirectoryEntryData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDirectoryEntryData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDirectoryEntryData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDirectoryEntryData) error : ", err);
                return reject(err);
            });
        });
    }

    getListDirectoryEntriesData(companyId: string, organisationIds: string, name: string, search: string,
                                type: string, companyName: string, phoneNumbers: string, fromUpdateDate: Date,
                                toUpdateDate: Date, tags: string, format: string, limit: number, offset: number,
                                sortField: string, sortOrder: number, view: string) {
        // API https://api.openrainbow.org/directory/#api-directory-GetDirectoryList
        // GET /api/rainbow/directory/v1.0/entries
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getListDirectoryEntriesData) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/directory/v1.0/entries";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "organisationIds", organisationIds);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "search", search);
            addParamToUrl(urlParamsTab, "type", type);
            addParamToUrl(urlParamsTab, "companyName", companyName);
            addParamToUrl(urlParamsTab, "phoneNumbers", phoneNumbers);
            addParamToUrl(urlParamsTab, "fromUpdateDate", fromUpdateDate ? fromUpdateDate.toJSON() : "");
            addParamToUrl(urlParamsTab, "toUpdateDate", toUpdateDate ? toUpdateDate.toJSON() : "");
            addParamToUrl(urlParamsTab, "tags", tags);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "view", view);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getListDirectoryEntriesData) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getListDirectoryEntriesData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getListDirectoryEntriesData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getListDirectoryEntriesData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getListDirectoryEntriesData) error : ", err);
                return reject(err);
            });
        });
    }

    updateDirectoryEntry(entryId: string, firstName: string, lastName: string, companyName: string,
                         department: string, street: string, city: string, state: string, postalCode: string,
                         country: string, workPhoneNumbers: string[], mobilePhoneNumbers: string[],
                         otherPhoneNumbers: string[], jobTitle: string, eMail: string, tags: string[],
                         custom1: string, custom2: string) {
        // PUT /api/rainbow/directory/v1.0/entries/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateDirectoryEntry) entry`);
        let data: any = {};
        if (firstName) data.firstName = firstName;
        if (lastName) data.lastName = lastName;
        if (companyName) data.companyName = companyName;
        if (department) data.department = department;
        if (street) data.street = street;
        if (city) data.city = city;
        if (state) data.state = state;
        if (postalCode) data.postalCode = postalCode;
        if (country) data.country = country;
        if (workPhoneNumbers) data.workPhoneNumbers = workPhoneNumbers;
        if (mobilePhoneNumbers) data.mobilePhoneNumbers = mobilePhoneNumbers;
        if (otherPhoneNumbers) data.otherPhoneNumbers = otherPhoneNumbers;
        if (jobTitle) data.jobTitle = jobTitle;
        if (eMail) data.eMail = eMail;
        if (tags) data.tags = tags;
        if (custom1) data.custom1 = custom1;
        if (custom2) data.custom2 = custom2;
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updateDirectoryEntry) REST data params : ", data);
            that.http.put("/api/rainbow/directory/v1.0/entries/" + entryId, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateDirectoryEntry) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateDirectoryEntry) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateDirectoryEntry) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateDirectoryEntry) error : ", err);
                return reject(err);
            });
        });
    }

    ImportDirectoryCsvFile(companyId, csvContent, label) {
        // POST /api/rainbow/massprovisioning/v1.0/directories/imports
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(ImportDirectoryCsvFile) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/massprovisioning/v1.0/directories/imports";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "label", label);
            url = urlParamsTab[0];
            let data = csvContent;
            that._logger.log(that.INTERNAL, LOG_ID + "(ImportDirectoryCsvFile) args : ", data);
            that.http.post(url, that.getPostHeader("text/csv"), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(ImportDirectoryCsvFile) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(ImportDirectoryCsvFile) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(ImportDirectoryCsvFile) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(ImportDirectoryCsvFile) error : ", err);
                return reject(err);
            });
        });
    }

    getAllTagsAssignedToDirectoryEntries(companyId: string) {
        // GET /api/rainbow/directory/v1.0/entries/tags
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllTagsAssignedToDirectoryEntries) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/directory/v1.0/entries/tags";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllTagsAssignedToDirectoryEntries) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllTagsAssignedToDirectoryEntries) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllTagsAssignedToDirectoryEntries) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllTagsAssignedToDirectoryEntries) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllTagsAssignedToDirectoryEntries) error : ", err);
                return reject(err);
            });
        });
    }

    removeTagFromAllDirectoryEntries(companyId: string, tag: string) {
        // DELETE /api/rainbow/directory/v1.0/entries/tags
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(removeTagFromAllDirectoryEntries) entry`);
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/directory/v1.0/entries/tags";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "tag", tag);
            url = urlParamsTab[0];
            that.http.delete(url, that.getRequestHeader())
                .then((response) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(removeTagFromAllDirectoryEntries) (" + companyId + ") -- success");
                    resolve(response);
                })
                .catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(removeTagFromAllDirectoryEntries) (" + companyId + ") -- failure -- ");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(removeTagFromAllDirectoryEntries) (" + companyId + ") -- failure -- ", err.message);
                    return reject(err);
                });
        });
    }

    renameTagForAllAssignedDirectoryEntries(tag: string, companyId: string, newTagName: string) {
        // PUT /api/rainbow/directory/v1.0/entries/tags
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(renameTagForAllAssignedDirectoryEntries) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/directory/v1.0/entries/tags";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "tag", tag);
            url = urlParamsTab[0];
            let data = {newTagName};
            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(renameTagForAllAssignedDirectoryEntries) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(renameTagForAllAssignedDirectoryEntries) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(renameTagForAllAssignedDirectoryEntries) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(renameTagForAllAssignedDirectoryEntries) error : ", err);
                return reject(err);
            });
        });
    }

    getStatsRegardingTagsOfDirectoryEntries(companyId: string) {
        // GET /api/rainbow/directory/v1.0/entries/tags/stats
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getStatsRegardingTagsOfDirectoryEntries) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/directory/v1.0/entries/tags/stats";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getStatsRegardingTagsOfDirectoryEntries) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getStatsRegardingTagsOfDirectoryEntries) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getStatsRegardingTagsOfDirectoryEntries) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getStatsRegardingTagsOfDirectoryEntries) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getStatsRegardingTagsOfDirectoryEntries) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Company Directory portal

}

module.exports = {'RESTDirectory': RESTDirectory};
export {RESTDirectory as RESTDirectory};
