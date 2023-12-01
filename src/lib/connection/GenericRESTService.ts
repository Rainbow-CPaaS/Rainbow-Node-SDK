"use strict";

import * as btoa from "btoa";
import * as CryptoJS from "crypto-js";
import {makeId} from "../common/Utils.js";
let packageVersion = require("../../package.json");

class GenericRESTService {
    protected _token: any;
    protected _decodedtokenRest: any;
    protected _credentials: any;
    protected _application: any;
    protected _auth: any;

    constructor() {
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
            "x-rainbow-request-id" :  makeId(9)
        };

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
            "x-rainbow-request-id" :  makeId(9)
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
            "x-rainbow-request-id" :  makeId(9)
        };

        let toEncrypt = that._application.appSecret + (password || that._credentials.password);
        //that.logger.log("debug", LOG_ID + "toEncrypt : " + toEncrypt);
        let encrypted = CryptoJS.SHA256(toEncrypt).toString();
        //that.logger.log("debug", LOG_ID + "encrypted : " + encrypted);
        let base64 = btoa(that._application.appID + ':' + encrypted);
        //that.logger.log("debug", LOG_ID + "base64 : " + base64);

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
            "x-rainbow-request-id" :  makeId(9)
        };
    };
    
}

module.exports = {'GenericRESTService' : GenericRESTService};
export {GenericRESTService as GenericRESTService};
