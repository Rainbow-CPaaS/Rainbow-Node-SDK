'use strict';

import {logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/ALERTS - ";

/**
 * Handles all REST API calls related to Alerts and Notifications.
 */
@logEntryExit(LOG_ID)
class RESTAlerts extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTAlerts'; }
    getClassName() { return RESTAlerts.getClassName(); }
    static getAccessorName() { return 'restalerts'; }
    getAccessorName() { return RESTAlerts.getAccessorName(); }

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

    //region Alerts - Notifications

    createDevice(data: Object) {
        // POST /api/rainbow/notificationsadmin/v1.0/devices
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createDevice) entry`);
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/notificationsadmin/v1.0/devices", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createDevice) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createDevice) error : ", err);
                return reject(err);
            });
        });
    }

    updateDevice(deviceId, params: Object) {
        // PUT /api/rainbow/notificationsadmin/v1.0/devices/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateDevice) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/notificationsadmin/v1.0/devices/" + deviceId, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateDevice) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateDevice) error : ", err);
                return reject(err);
            });
        });
    }

    deleteDevice(deviceId: string) {
        // DELETE /api/rainbow/notificationsadmin/v1.0/devices/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteDevice) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = {};
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteDevice) REST deviceId : ", deviceId);
            that.http.delete("/api/rainbow/notificationsadmin/v1.0/devices/" + deviceId, that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteDevice) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getDevice(deviceId: string) {
        // GET /api/rainbow/notificationsadmin/v1.0/devices/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getDevice) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getDevice) REST deviceId : ", deviceId);
            that.http.get("/api/rainbow/notificationsadmin/v1.0/devices/" + deviceId, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getDevice) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDevice) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDevice) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getDevices(companyId: string, userId: string, deviceName: string, type: string, tag: string, offset: number, limit: number) {
        // GET /api/rainbow/notificationsadmin/v1.0/devices
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getDevices) entry`);
        return new Promise(function (resolve, reject) {
            let getParams = "";
            if (companyId) { getParams += getParams ? "&" : "?"; getParams += "companyId=" + companyId; }
            if (userId) { getParams += getParams ? "&" : "?"; getParams += "userId=" + userId; }
            if (deviceName) { getParams += getParams ? "&" : "?"; getParams += "name=" + deviceName; }
            if (type) { getParams += getParams ? "&" : "?"; getParams += "type=" + type; }
            if (tag) { getParams += getParams ? "&" : "?"; getParams += "tags=" + tag; }
            getParams += getParams ? "&" : "?"; getParams += "limit=" + limit;
            getParams += getParams ? "&" : "?"; getParams += "offset=" + offset;
            getParams += getParams ? "&" : "?"; getParams += "format=full";
            that._logger.log(that.INTERNAL, LOG_ID + "(getDevices) REST getParams : ", getParams);
            that.http.get("/api/rainbow/notificationsadmin/v1.0/devices" + getParams, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getDevices) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDevices) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDevices) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDevices) error : ", err);
                return reject(err);
            });
        });
    }

    getDevicesTags(companyId: string) {
        // GET /api/rainbow/notificationsadmin/v1.0/devices/tags
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getDevicesTags) entry`);
        return new Promise(function (resolve, reject) {
            let getParams = "";
            if (companyId) { getParams += getParams ? "&" : "?"; getParams += "companyId=" + companyId; }
            that._logger.log(that.INTERNAL, LOG_ID + "(getDevicesTags) REST getParams : ", getParams);
            that.http.get("/api/rainbow/notificationsadmin/v1.0/devices/tags" + getParams, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getDevicesTags) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDevicesTags) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDevicesTags) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDevicesTags) error : ", err);
                return reject(err);
            });
        });
    }

    renameDevicesTags(newTagName: string, tag: string, companyId: string) {
        // PUT /api/rainbow/notificationsadmin/v1.0/templates
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(renameDevicesTags) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/notificationsadmin/v1.0/devices/tags";
            let getParams = "";
            if (companyId) { getParams += getParams ? "&" : "?"; getParams += "companyId=" + companyId; }
            if (tag) { getParams += getParams ? "&" : "?"; getParams += "tag=" + tag; }
            let params = {newTagName};
            that.http.put(url + getParams, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(renameDevicesTags) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(renameDevicesTags) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(renameDevicesTags) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(renameDevicesTags) error : ", err);
                return reject(err);
            });
        });
    }

    deleteDevicesTags(tag: string, companyId: string) {
        // DELETE /api/rainbow/notificationsadmin/v1.0/templates
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteDevicesTags) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteDevicesTags) REST tag : ", tag);
            let url = "/api/rainbow/notificationsadmin/v1.0/devices/tags";
            let getParams = "";
            if (companyId) { getParams += getParams ? "&" : "?"; getParams += "companyId=" + companyId; }
            if (tag) { getParams += getParams ? "&" : "?"; getParams += "tag=" + tag; }
            that.http.delete(url + getParams, that.getPostHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteDevicesTags) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteDevicesTags) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteDevicesTags) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteDevicesTags) error : ", err);
                return reject(err);
            });
        });
    }

    getstatsTags(companyId: string) {
        // GET /api/rainbow/notificationsadmin/v1.0/templates
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getstatsTags) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/notificationsadmin/v1.0/devices/tags/stats";
            let getParams = "";
            if (companyId) { getParams += getParams ? "&" : "?"; getParams += "companyId=" + companyId; }
            that._logger.log(that.INTERNAL, LOG_ID + "(getstatsTags) REST companyId : ", companyId);
            that.http.get(url + getParams, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getstatsTags) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getstatsTags) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getstatsTags) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getstatsTags) error : ", err);
                return reject(err);
            });
        });
    }

    createTemplate(data: Object) {
        // POST /api/rainbow/notificationsadmin/v1.0/templates
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createTemplate) entry`);
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/notificationsadmin/v1.0/templates", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    updateTemplate(templateId, params: Object) {
        // PUT /api/rainbow/notificationsadmin/v1.0/templates/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateTemplate) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/notificationsadmin/v1.0/templates/" + templateId, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    deleteTemplate(templateId: string) {
        // DELETE /api/rainbow/notificationsadmin/v1.0/templates/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteTemplate) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = {};
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteTemplate) REST templateId : ", templateId);
            that.http.delete("/api/rainbow/notificationsadmin/v1.0/templates/" + templateId, that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    getTemplate(templateId: string) {
        // GET /api/rainbow/notificationsadmin/v1.0/templates/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getTemplate) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getTemplate) REST templateId : ", templateId);
            that.http.get("/api/rainbow/notificationsadmin/v1.0/templates/" + templateId, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTemplate) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTemplate) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getTemplate) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    getTemplates(companyId: string, offset: number, limit: number) {
        // GET /api/rainbow/notificationsadmin/v1.0/templates
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getTemplates) entry`);
        return new Promise(function (resolve, reject) {
            let getParams = "";
            if (companyId) { getParams += getParams ? "&" : "?"; getParams += "companyId=" + companyId; }
            getParams += getParams ? "&" : "?"; getParams += "limit=" + limit;
            getParams += getParams ? "&" : "?"; getParams += "offset=" + offset;
            getParams += getParams ? "&" : "?"; getParams += "format=full";
            that._logger.log(that.INTERNAL, LOG_ID + "(getTemplates) REST getParams : ", getParams);
            that.http.get("/api/rainbow/notificationsadmin/v1.0/templates" + getParams, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTemplates) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTemplates) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getTemplates) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getTemplates) error : ", err);
                return reject(err);
            });
        });
    }

    createFilter(data: Object) {
        // POST /api/rainbow/notificationsadmin/v1.0/filters
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createFilter) entry`);
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/notificationsadmin/v1.0/filters", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createFilter) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createFilter) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createFilter) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createFilter) error : ", err);
                return reject(err);
            });
        });
    }

    updateFilter(FilterId, params: Object) {
        // PUT /api/rainbow/notificationsadmin/v1.0/filters/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateFilter) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/notificationsadmin/v1.0/filters/" + FilterId, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateFilter) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateFilter) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateFilter) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateFilter) error : ", err);
                return reject(err);
            });
        });
    }

    deleteFilter(FilterId: string) {
        // DELETE /api/rainbow/notificationsadmin/v1.0/filters/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteFilter) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = {};
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteFilter) REST FilterId : ", FilterId);
            that.http.delete("/api/rainbow/notificationsadmin/v1.0/filters/" + FilterId, that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteFilter) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteFilter) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteFilter) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteFilter) error : ", err);
                return reject(err);
            });
        });
    }

    getFilter(templateId: string) {
        // GET /api/rainbow/notificationsadmin/v1.0/filters/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getFilter) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getFilter) REST templateId : ", templateId);
            that.http.get("/api/rainbow/notificationsadmin/v1.0/filters/" + templateId, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getFilter) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getFilter) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getFilter) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getFilter) error : ", err);
                return reject(err);
            });
        });
    }

    getFilters(offset: number, limit: number) {
        // GET /api/rainbow/notificationsadmin/v1.0/filters
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getFilters) entry`);
        return new Promise(function (resolve, reject) {
            let getParams = "";
            getParams += getParams ? "&" : "?"; getParams += "limit=" + limit;
            getParams += getParams ? "&" : "?"; getParams += "offset=" + offset;
            getParams += getParams ? "&" : "?"; getParams += "format=full";
            that._logger.log(that.INTERNAL, LOG_ID + "(getFilters) REST getParams : ", getParams);
            that.http.get("/api/rainbow/notificationsadmin/v1.0/filters" + getParams, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getFilters) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getFilters) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getFilters) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getFilters) error : ", err);
                return reject(err);
            });
        });
    }

    createAlert(data: Object) {
        // POST /api/rainbow/notifications/v1.0/notifications
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createAlert) entry`);
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/notifications/v1.0/notifications", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createAlert) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createAlert) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createAlert) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createAlert) error : ", err);
                return reject(err);
            });
        });
    }

    updateAlert(AlertId, params: Object) {
        // PUT /api/rainbow/notifications/v1.0/notifications/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateAlert) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/notifications/v1.0/notifications/" + AlertId, that.getRequestHeader(), params, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateAlert) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateAlert) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateAlert) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateAlert) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAlert(AlertId: string) {
        // DELETE /api/rainbow/notifications/v1.0/notifications/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteAlert) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = {};
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteAlert) REST AlertId : ", AlertId);
            that.http.delete("/api/rainbow/notifications/v1.0/notifications/" + AlertId, that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAlert) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAlert) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAlert) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAlert) error : ", err);
                return reject(err);
            });
        });
    }

    getAlert(alertId: string) {
        // GET /api/rainbow/notifications/v1.0/notifications/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAlert) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAlert) REST alertId : ", alertId);
            that.http.get("/api/rainbow/notifications/v1.0/notifications/" + alertId, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAlert) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAlert) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAlert) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAlert) error : ", err);
                return reject(err);
            });
        });
    }

    getAlerts(offset: number, limit: number) {
        // GET /api/rainbow/notifications/v1.0/notifications
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAlerts) entry`);
        return new Promise(function (resolve, reject) {
            let getParams = "";
            getParams += getParams ? "&" : "?"; getParams += "limit=" + limit;
            getParams += getParams ? "&" : "?"; getParams += "offset=" + offset;
            getParams += getParams ? "&" : "?"; getParams += "format=full";
            that._logger.log(that.INTERNAL, LOG_ID + "(getAlerts) REST getParams : ", getParams);
            that.http.get("/api/rainbow/notifications/v1.0/notifications" + getParams, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAlerts) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAlerts) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAlerts) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAlerts) error : ", err);
                return reject(err);
            });
        });
    }

    sendAlertFeedback(alertId: string, data: Object) {
        // POST /api/rainbow/notifications/v1.0/notifications/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(sendAlertFeedback) entry`);
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/notifications/v1.0/notifications/" + alertId + "/feedback", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(sendAlertFeedback) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendAlertFeedback) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(sendAlertFeedback) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendAlertFeedback) error : ", err);
                return reject(err);
            });
        });
    }

    getAlertFeedbackSentForANotificationMessage(notificationHistoryId: string) {
        // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationHistoryId/feedback
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAlertFeedbackSentForANotificationMessage) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAlertFeedbackSentForANotificationMessage) REST notificationHistoryId : ", notificationHistoryId);
            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + notificationHistoryId + "/feedback", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAlertFeedbackSentForANotificationMessage) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAlertFeedbackSentForANotificationMessage) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAlertFeedbackSentForANotificationMessage) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAlertFeedbackSentForANotificationMessage) error : ", err);
                return reject(err);
            });
        });
    }

    getAlertFeedbackSentForAnAlert(alertId: string) {
        // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationId/feedback
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAlertFeedbackSentForAnAlert) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAlertFeedbackSentForAnAlert) REST alertId : ", alertId);
            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + alertId + "/feedback", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAlertFeedbackSentForAnAlert) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAlertFeedbackSentForAnAlert) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAlertFeedbackSentForAnAlert) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAlertFeedbackSentForAnAlert) error : ", err);
                return reject(err);
            });
        });
    }

    getAlertStatsFeedbackSentForANotificationMessage(notificationHistoryId: string) {
        // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationHistoryId/feedback/stats
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAlertStatsFeedbackSentForANotificationMessage) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAlertStatsFeedbackSentForANotificationMessage) REST notificationHistoryId : ", notificationHistoryId);
            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + notificationHistoryId + "/feedback/stats", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAlertStatsFeedbackSentForANotificationMessage) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAlertStatsFeedbackSentForANotificationMessage) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAlertStatsFeedbackSentForANotificationMessage) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAlertStatsFeedbackSentForANotificationMessage) error : ", err);
                return reject(err);
            });
        });
    }

    getReportSummary(alertId: string) {
        // GET /api/rainbow/notificationsreport/v1.0/notifications/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getReportSummary) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getReportSummary) REST alertId : ", alertId);
            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + alertId + "/reports/summary", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getReportSummary) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getReportSummary) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getReportSummary) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getReportSummary) error : ", err);
                return reject(err);
            });
        });
    }

    getReportDetails(alertId: string) {
        // GET /api/rainbow/notificationsreport/v1.0/notifications/
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getReportDetails) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getReportDetails) REST alertId : ", alertId);
            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + alertId + "/reports/details", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getReportDetails) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getReportDetails) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getReportDetails) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getReportDetails) error : ", err);
                return reject(err);
            });
        });
    }

    getReportComplete(alertId: string) {
        // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationId/reports/complete
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getReportComplete) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getReportComplete) REST alertId : ", alertId);
            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + alertId + "/reports/complete", that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getReportComplete) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getReportComplete) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getReportComplete) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getReportComplete) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Alerts - Notifications

}

module.exports = {'RESTAlerts': RESTAlerts};
export {RESTAlerts as RESTAlerts};
