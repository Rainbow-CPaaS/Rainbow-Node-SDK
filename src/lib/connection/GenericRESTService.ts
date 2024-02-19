"use strict";

import * as btoa from "btoa";
import * as CryptoJS from "crypto-js";
import {makeId, stackTrace} from "../common/Utils.js";
import {Logger} from "../common/Logger.js";
import {LevelInterface} from "../common/LevelInterface.js";
let packageVersion = require("../../package.json");

class GenericRESTService implements LevelInterface{
    protected _token: any;
    protected _decodedtokenRest: any;
    protected _credentials: any;
    protected _application: any;
    protected _auth: any;
    protected _logger: Logger;
    protected _logId: string;

    public INFO: any;
    public DEBUG: any;
    public INTERNAL: any;
    public WARN: any;
    public ERROR: any;
    public INTERNALERROR: any;
    public INFOAPI: any;
    public DEBUGAPI: any;
    public INTERNALAPI: any;
    public WARNAPI: any;
    public ERRORAPI: any;
    public INTERNALERRORAPI: any;

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

    constructor( _logger : Logger, logId : string = "UNDF/SVCE - ") {
        let that = this;
        that._logger = _logger;
        if (logId) {
            that._logId = logId;
        }

        that.setLogLevels(this);

        // that._logger.log("debug", that._logId + "(GenericService::constructor) " );
        that.setConstructed();
    }

    setLogLevels (obj) {
        if (obj) {
            obj.INFO = {"callerObj": obj, "level": "info", isApi: false};
            obj.DEBUG = {"callerObj": obj, "level": "debug", isApi: false};
            obj.INTERNAL = {"callerObj": obj, "level": "internal", isApi: false};
            obj.WARN = {"callerObj": obj, "level": "warn", isApi: false};
            obj.ERROR = {"callerObj": obj, "level": "error", isApi: false};
            obj.INTERNALERROR = {"callerObj": obj, "level": "internalerror", isApi: false};
            obj.INFOAPI = {"callerObj": obj, "level": "info", isApi: true};
            obj.DEBUGAPI = {"callerObj": obj, "level": "debug", isApi: true};
            obj.INTERNALAPI = {"callerObj": obj, "level": "internal", isApi: true};
            obj.WARNAPI = {"callerObj": obj, "level": "warn", isApi: true};
            obj.ERRORAPI = {"callerObj": obj, "level": "error", isApi: true};
            obj.INTERNALERRORAPI = {"callerObj": obj, "level": "internalerror", isApi: true}; // */
        } else {
            console.log("Can not set Logs Levels : ", stackTrace());
        }
    }

    setConstructed () {
        let that = this;
        that.startingInfos.constructorDate = new Date();
        that._logger.log(that.INFO, that._logId + `=== CONSTRUCTED at (${that.startingInfos.constructorDate} ===`);
    }

    set p_token(value: any) {
        this._token = value;
    }

    set p_credentials(value: any) {
        this._credentials = value;
    }

    set p_application(value: any) {
        this._application = value;
    }

    set p_auth(value: any) {
        this._auth = value;
    }

    get token(): any {
        return this._token;
    }

    get credentials(): any {
        return this._credentials;
    }

    get application(): any {
        return this._application;
    }

    get auth(): any {
        return this._auth;
    }

    get p_decodedtokenRest(): any {
        return this._decodedtokenRest;
    }

    set p_decodedtokenRest(value: any) {
        this._decodedtokenRest = value;
    }

    getRequestHeader (accept : string = undefined) {
        let that = this;

        let headers = {
            "Authorization": "Bearer " + that._token,
            "Accept": accept || "application/json",
            "Range": undefined,
            "x-rainbow-client": "sdk_node",
            "x-rainbow-client-version": packageVersion.version,
            "x-rainbow-client-id": that.application?that.application.appID:"",
            "x-rainbow-request-node-id" :  makeId(9)
        };

        //let caller = arguments.callee.caller.toString();
        // let caller = arguments.callee.caller.prototype;
        //console.log("caller : ", caller);

        return headers;
    }
    
    getRequestHeaderLowercaseAccept (accept : string = undefined) {
        let that = this;

        let headers = {
            "Authorization": "Bearer " + that._token,
            "accept": accept || "application/json",
            "x-rainbow-client": "sdk_node",
            "x-rainbow-client-version": packageVersion.version,
            "x-rainbow-client-id": that.application?that.application.appID:"",
            "x-rainbow-request-node-id" :  makeId(9)
        };

        return headers;
    }

    getRequestHeaderWithRange (accept: string = undefined, range: string = undefined) {
        let that = this;

        let header = that.getRequestHeader(accept);
        header.Range = range;
        return header;
    }

    getPostHeader (contentType : string = undefined) {
        let that = this;

        let header = that.getRequestHeader(undefined);
        let type = contentType || "application/json";
        header["Content-Type"] = type;
        return header;
    };

    getPostHeaderWithRange (accept: string = undefined, initialSize: string = undefined, minRange: string = undefined, maxRange: string = undefined) {
        let that = this;

        let header = this.getRequestHeader(accept);
        // Content-Range: bytes 0-1048575/2960156
        //header["Content-Range"] = "bytes " + minRange + "-" + maxRange + "/" + initialSize;
        return header;
    };

    getLoginHeader (auth : string = undefined, password : string = undefined) {
        let that = this;

        let headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Basic " + (auth || that._auth),
            "x-rainbow-client": "sdk_node",
            "x-rainbow-client-version": packageVersion.version,
            "x-rainbow-client-id": that.application?that.application.appID:"",
            "x-rainbow-request-node-id" :  makeId(9)
        };

        let toEncrypt = that._application.appSecret + (password || that._credentials.password);
        //that._logger.log(that.DEBUG, LOG_ID + "toEncrypt : " + toEncrypt);
        let encrypted = CryptoJS.SHA256(toEncrypt).toString();
        //that._logger.log(that.DEBUG, LOG_ID + "encrypted : " + encrypted);
        let base64 = btoa(that._application.appID + ':' + encrypted);
        //that._logger.log(that.DEBUG, LOG_ID + "base64 : " + base64);

        if (that._application.appSecret && base64 && base64.length) {
            headers["x-rainbow-app-auth"] = "Basic " + base64 || "";
        }

        return headers;
    };

    getDefaultHeader () {
        let that = this;

        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "x-rainbow-client": "sdk_node",
            "x-rainbow-client-version": packageVersion.version,
            "x-rainbow-client-id": that.application?that.application.appID:"",
            "x-rainbow-request-node-id" :  makeId(9)
        };
    };
    
}

module.exports = {'GenericRESTService' : GenericRESTService};
export {GenericRESTService as GenericRESTService};
