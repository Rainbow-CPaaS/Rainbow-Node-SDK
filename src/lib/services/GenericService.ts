"use strict";
import {XMPPService} from "../connection/XMPPService";

export {};

import {Core} from "../Core";
import {Logger} from "../common/Logger";
import {S2SService} from "./S2SService";
import {Contact} from "../common/models/Contact";
import {EventEmitter} from "events";
import {RESTService} from "../connection/RESTService";
import {ContactsService} from "./ContactsService";
import {stackTrace} from "../common/Utils.js";
import {LevelLogs} from "../common/LevelLogs.js";

const API_ID = "API_CALL - ";

class GenericService extends LevelLogs{
    protected _logger : Logger;
    protected _logId : string;
    protected _xmpp: XMPPService;
    protected _options: any;
    protected _s2s: S2SService;
    protected _useXMPP: boolean;
    protected _useS2S: boolean;
    protected _eventEmitter: EventEmitter;
    protected _rest: RESTService;
    public _started: boolean;
    protected _initialized: boolean;
    protected _core: Core;

    protected _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }
    protected ready: boolean = false;
    protected startingInfos : {
        constructorDate: Date,
        startDate: Date,
        startedDate: Date,
        initilizedDate: Date
        readyDate: Date
    } = {
        constructorDate: new Date(),
        startDate: new Date(),
        startedDate: new Date(),
        initilizedDate: new Date(),
        readyDate: new Date()
    };

    protected getAccessorName(){ return "GenericService"; }

    constructor( _logger : Logger, logId : string = "UNDF/SVCE - ", _eventEmitter) {
        super();
        this._eventEmitter = _eventEmitter;
        this.setLogLevels(this);
        let that = this;
        that._started = false;
        that._logger = _logger;
        if (logId) {
            that._logId = logId;
        }

        // that._logger.log("debug", that._logId + "(GenericService::constructor) " );
        that.setConstructed();
    }

    initStartDate(){
        this.startingInfos.startDate = this._core?.startDate;
    }

    cleanMemoryCache() {
        let that = this;
        // that._logger.log("debug", that._logId + "(GenericService::cleanMemoryCache) Not defined for this module." );
    }

    get startedDuration () {
        return Math.round(this.startingInfos.startedDate.getTime() - this.startingInfos.startDate.getTime());
    }

    get initializedDuration () {
        return Math.round(this.startingInfos.initilizedDate.getTime() - this.startingInfos.startDate.getTime());
    }

    setConstructed () {
        let that = this;
        that.startingInfos.constructorDate = new Date();
        that._logger.log("info", that._logId + `=== CONSTRUCTED at (${that.startingInfos.constructorDate} ===`);
    }

    setStarted () {
        let that = this;
        that.startingInfos.startedDate = new Date();
        that._logger.log("info", that._logId + `=== STARTED (${that.startedDuration} ms) ===`);
        that._started = true;
    }

    setInitialized () {
        let that = this;
        that.startingInfos.initilizedDate = new Date();
        that._logger.log("info", that._logId + `=== INITIALIZED (${that.initializedDuration} ms) ===`);
        that._initialized = true;
        that._eventEmitter.emit("evt_internal_serviceinitialized", {"name": that.getAccessorName(), "infos":{"msSinceStart": that.initializedDuration}});
    }

    setStopped () {
        let that = this;
        that._started = false;
        that._initialized = false;
        that._logger.log("info", that._logId + `=== STOPPED () ===`);
    }

    callRestMethod (methodName : string = "methodNameUnknown", lesarguments) : Promise<any> {
        let that = this;
        that._logger.log(that.INFOAPI, that._logId + API_ID + "(" + methodName + ") "); //, that._logger.stripStringForLogs(companyId));

        return new Promise(function (resolve, reject) {
            try {
                that._core._rest[methodName]( ...lesarguments ).then((result) => {
                    that._logger.log(that.DEBUG, that._logId  + "(" + methodName + ") Successfully created.");
                    resolve(result);
                }).catch((err) => {
                    that._logger.log(that.ERROR, that._logId  + "(" + methodName + ") ErrorManager .");
                    that._logger.log(that.INTERNALERROR, that._logId  + "(" + methodName + ") ErrorManager  : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log(that.INTERNALERROR, that._logId  + "(" + methodName + ") error : ", err);
                return reject(err);
            }
        });
    }
}

module.exports = {'GenericService' : GenericService};
export {GenericService as GenericService};
