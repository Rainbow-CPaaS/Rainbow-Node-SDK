'use strict';

import {logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/CONN - ";

/**
 * Handles all REST API calls related to connectors (LDAP event posting).
 */
@logEntryExit(LOG_ID)
class RESTConnectors extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTConnectors'; }
    getClassName() { return RESTConnectors.getClassName(); }
    static getAccessorName() { return 'restconnectors'; }
    getAccessorName() { return RESTConnectors.getAccessorName(); }

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

    //region Connectors

    createListOfEventsForConnector(events: Array<{ eventId: string, level: string, category: string, operation: string, description: string, date: string }>) {
        // API https://api.openrainbow.org/admin/#api-connectors-PostLdapActivate
        // POST /api/rainbow/admin/v1.0/connectors/events
        // API https://api.openrainbow.org/admin/#api-connectors-PostLdapActivate
        // POST /api/rainbow/admin/v1.0/connectors/events
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createListOfEventsForConnector) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/admin/v1.0/connectors/events";
            that._logger.log(that.INTERNAL, LOG_ID + "(createListOfEventsForConnector) REST url : ", url);
            let data: any = { events };

            that.http.post(url, that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(createListOfEventsForConnector) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createListOfEventsForConnector) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createListOfEventsForConnector) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createListOfEventsForConnector) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Connectors

}

module.exports = {'RESTConnectors': RESTConnectors};
export {RESTConnectors as RESTConnectors};
