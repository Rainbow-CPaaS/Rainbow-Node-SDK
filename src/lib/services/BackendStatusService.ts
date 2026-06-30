'use strict';

import {GenericService} from "./GenericService";
import {Core} from "../Core.js";
import {logEntryExit, isStarted} from "../common/Utils";
import {EventEmitter} from "events";
import {LevelLogs} from "../common/LevelLogs.js";
import {RESTService} from "../connection/RESTService";
import {Logger} from "../common/Logger";

const LOG_ID = "BACKENDSTATUS/SVCE - ";

/** Health and infrastructure endpoints for the Room portal. */
class RoomStatus extends LevelLogs {
    private _rest: RESTService;
    private _logger: Logger;
    private _backendStatusService : BackendStatusService;

    static getClassName() { return 'BackendStatusService'; }
    getClassName() { return BackendStatusService.getClassName(); }
    static getAccessorName() { return 'backendStatus'; }
    getAccessorName() { return BackendStatusService.getAccessorName(); }

    constructor(rest: RESTService, logger: Logger, backendStatusService: BackendStatusService) {
        super();
        this._backendStatusService = backendStatusService;
        this.setLogLevels(this);
        this._rest = rest;
        this._logger = logger;
    }

    /**
     * Checks that the Room portal server is reachable and healthy.
     * @returns {Promise<any>} Ping result
     */
    async ping(): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + "(ping) entry");
        try {
            const result = await that._rest.getApiRainbowPing();
            that._logger.log(that.DEBUG, LOG_ID + "(ping) successfull");
            that._logger.log(that.INTERNAL, LOG_ID + "(ping) REST result : ", result);
            return result;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID + "(ping) error : ", err);
            throw err;
        }
    }

    /**
     * Retrieves the version and description of the Room portal server.
     * @returns {Promise<any>} About data
     */
    async about(): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + "(about) entry");
        try {
            const result = await that._rest.getApiRainbowRoomV10About();
            that._logger.log(that.DEBUG, LOG_ID + "(about) successfull");
            that._logger.log(that.INTERNAL, LOG_ID + "(about) REST result : ", result);
            return result;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID + "(about) error : ", err);
            throw err;
        }
    }

    /**
     * Retrieves all available performance metrics from the Room portal.
     * @returns {Promise<any>} Metrics data
     */
    async getMetrics(): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + "(getMetrics) entry");
        try {
            const result = await that._rest.getMetricsRoom();
            that._logger.log(that.DEBUG, LOG_ID + "(getMetrics) successfull");
            that._logger.log(that.INTERNAL, LOG_ID + "(getMetrics) REST result : ", result);
            return result;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID + "(getMetrics) error : ", err);
            throw err;
        }
    }

    /**
     * Clears all performance metrics on the Room portal.
     * @returns {Promise<any>} Deletion result
     */
    async deleteMetrics(): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + "(deleteMetrics) entry");
        try {
            const result = await that._rest.deleteMetricsRoom();
            that._logger.log(that.DEBUG, LOG_ID + "(deleteMetrics) successfull");
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteMetrics) REST result : ", result);
            return result;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID + "(deleteMetrics) error : ", err);
            throw err;
        }
    }

    /**
     * Changes the server-side log levels (console/file/syslog).
     * @param {object} body - Log levels payload
     * @param {string} [body.console] - console log level
     * @param {string} [body.file] - file log level
     * @param {string} [body.syslog] - syslog log level
     * @returns {Promise<any>} Update result
     */
    async setLogLevel(body: { console?: string; file?: string; syslog?: string }): Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, LOG_ID + "(setLogLevel) entry");
        try {
            const result = await that._rest.putApiRainbowLogsLevels(body);
            that._logger.log(that.DEBUG, LOG_ID + "(setLogLevel) successfull");
            that._logger.log(that.INTERNAL, LOG_ID + "(setLogLevel) REST result : ", result);
            return result;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID + "(setLogLevel) error : ", err);
            throw err;
        }
    }
}

@logEntryExit(LOG_ID, true)
@isStarted([])
/**
 * @module
 * @name BackendStatusService
 * @version SDKVERSION
 * @public
 * @description
 *      Exposes health and infrastructure endpoints for each Rainbow portal.
 *      Currently supports the Room portal via the `room` property.
 */
class BackendStatusService extends GenericService {
    /** Infrastructure endpoints for the Room portal. */
    public room: RoomStatus;

    static getClassName() { return 'BackendStatusService'; }
    getClassName() { return BackendStatusService.getClassName(); }
    static getAccessorName() { return 'backendStatus'; }
    getAccessorName() { return BackendStatusService.getAccessorName(); }

    constructor(_core: Core, _eventEmitter: EventEmitter, _logger: Logger, _startConfig: {
        start_up: boolean,
        optional: boolean
    }) {
        super(_core, _logger, LOG_ID, _eventEmitter);
        this.setLogLevels(this);
        this._startConfig = _startConfig;
    }

    /**
     * Starts the BackendStatusService and initializes the Room health sub-service.
     * @param {any} _options - SDK options
     * @returns {Promise<void>}
     */
    start(_options: any): Promise<void> {
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                that._rest = that._core._rest;
                that.room = new RoomStatus(that._rest, that._logger, this);
                that.setStarted();
                resolve(undefined);
            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(start) error : ", err);
                return reject();
            }
        });
    }

    /**
     * Stops the BackendStatusService.
     * @returns {Promise<void>}
     */
    stop(): Promise<void> {
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                that._rest = null;
                that.room = null;
                that.setStopped();
                resolve(undefined);
            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(stop) error : ", err);
                return reject(err);
            }
        });
    }
}

export {BackendStatusService};
module.exports.BackendStatusService = BackendStatusService;
