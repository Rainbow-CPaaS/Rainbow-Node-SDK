'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/BOTS - ";

/**
 * Handles all REST API calls related to bot services.
 */
@logEntryExit(LOG_ID)
class RESTBots extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTBots'; }
    getClassName() { return RESTBots.getClassName(); }
    static getAccessorName() { return 'restbots'; }
    getAccessorName() { return RESTBots.getAccessorName(); }

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

    //region Bots

    getRainbowSupportBotService(): any {
        // GET /api/rainbow/enduser/v1.0/bots/rainbow-support
        // API https://api.openrainbow.org/enduser/#api-bots-getRainbowSupport
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getRainbowSupportBotService) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/bots/rainbow-support";
            that._logger.log(that.INTERNAL, LOG_ID + "(getRainbowSupportBotService) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getRainbowSupportBotService) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getRainbowSupportBotService) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getRainbowSupportBotService) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getRainbowSupportBotService) error : ", err);
                return reject(err);
            });
        });
    }

    getABotServiceData(botId: string): any {
        // GET /api/rainbow/enduser/v1.0/bots/:botId
        // API https://api.openrainbow.org/enduser/#api-bots-getBotById
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getABotServiceData) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/bots/" + botId;
            that._logger.log(that.INTERNAL, LOG_ID + "(getABotServiceData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getABotServiceData) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getABotServiceData) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getABotServiceData) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getABotServiceData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllBotServices(format: string = "small", limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number = 1): any {
        // GET /api/rainbow/enduser/v1.0/bots
        // API https://api.openrainbow.org/enduser/#api-bots-getBots
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllBotServices) entry`);
        return new Promise(function (resolve, reject) {
            let url: string = "/api/rainbow/enduser/v1.0/bots";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllBotServices) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getAllBotServices) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllBotServices) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllBotServices) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllBotServices) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Bots

}

module.exports = {'RESTBots': RESTBots};
export {RESTBots as RESTBots};
