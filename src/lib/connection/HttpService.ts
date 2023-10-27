"use strict";

//let unirest = require("unirest");
import {logEntryExit, pause} from "../common/Utils";
import {HttpManager, RequestForQueue} from "./HttpManager";
import * as util from "util";
import {window} from "rxjs";


require('http').globalAgent.maxSockets = 999;

const Request = require("request");
//const Request = require("http").request;
const packageVersion = require("../../package.json");

//let http = require('http');
const urlParse = require("url").parse;
const EventEmitter = require("events").EventEmitter;
const humanize = require("humanize-number");
const chalk = require("chalk");

const debugHttp = require("debug-http");

const LOG_ID = "HTTP - ";

let colorCodes = {
    5: "red",
    4: "yellow",
    3: "cyan",
    2: "green",
    1: "green"
};

function time(start): any {
    let delta: any;
    // @ts-ignore
    delta = new Date() - start;
    delta = delta < 10000 ? delta + "ms" : Math.round(delta / 1000) + "s";
    return humanize(delta);
}

const USER_AGENT = "node/" + process.version + " (" + process.platform + "; " + process.arch + ") " + "Rainbow Sdk/" + packageVersion.version;

@logEntryExit(LOG_ID)
class HTTPService {
    public serverURL: any;
    public _host: any;
    public logger: any;
    public proxy: any;
    public eventEmitter: any;
    public httpManager : HttpManager;
    private _options: any;
    private _core: any;

    static getClassName(){ return 'HTTPService'; }
    getClassName(){ return HTTPService.getClassName(); }

    constructor(_core, _options, _logger, _proxy, _evtEmitter ) {
        this._options= _options;
        let _http  = _options.httpOptions;
        this.serverURL = _http.protocol + "://" + _http.host + ":" + _http.port;
        this._host = _http.host;
        this.logger = _logger;
        this.proxy = _proxy;
        this.eventEmitter = _evtEmitter;
        this._core = _core;
        this.httpManager = new HttpManager(_evtEmitter,_logger);
        let that = this;

        function debugHandler(request, options?, cb?): any {
            options = typeof options === "string" ? urlParse(options) : options;

            let url = options.href || (options.protocol || "http:") + "//" + (options.host || options.hostname) + options.path;
            let method = (options.method || "GET").toUpperCase();
            let signature = method + " " + url;
            let start = new Date();
            let wasHandled = typeof cb === "function";

            //setImmediate(console.log, chalk.gray('      → ' + signature));
            that.logger.log("internal", LOG_ID + " " + chalk.gray("      → " + signature + " : " + JSON.stringify(options.headers, null, "  ")));

            return request(options, cb)
                .on("response", function (response) {
                    // Workaround for res._dump in Node.JS http client
                    // https://github.com/nodejs/node/blob/20285ad17755187ece16b8a5effeaa87f5407da2/lib/_http_client.js#L421-L427
                    if (!wasHandled && EventEmitter.listenerCount(response.req, "response") === 0) {
                        response.resume();
                    }

                    let status = response.statusCode;
                    let s = status / 100 | 0;
                    that.logger.log("internal", LOG_ID + "  " + chalk[colorCodes[s]](status) + " ← " + signature + " " + chalk.gray(time(start)));
                })
                .on("error", function (err) {
                    that.logger.log("internalerror", LOG_ID + "  " + chalk.red("xxx") + " ← " + signature + " " + chalk.red(err.message));
                });
        }

        if (that.logger.logHttp) {
            // @ts-ignore
            let fnerror = console.error;
            console.error = function(error, url, line) {
                that.logger.log("debug", LOG_ID, chalk.red("DEBUG CONSOLE")  , ...arguments);
                //that.logger.log("debug", LOG_ID, chalk.red("DEBUG CONSOLE")  , {acc:'error', data:'ERR:'+error+' URL:'+url+' L:'+line});
                // fnerror(...arguments);
            };
            debugHttp(debugHandler);
            Request.debug = true;
        }

    }

    /*
// usage
// const [err, result] = safeJsonParse('[Invalid JSON}');
// if (err) {
//  console.log('Failed to parse JSON: ' + err.message);
//  } else {
//  console.log(result);
//}

safeJsonParse(str) {
   try {
       return [null, JSON.parse(str)];
   } catch (err) {
       return [err];
   }
} // */

    async checkHTTPStatus() : Promise<{
        nbHttpAdded: number,
        httpQueueSize: number,
        nbRunningReq: number,
        maxSimultaneousRequests : number,
        nbReqInQueue : number,
        retryAfterTime : number,
        retryAfterEndTime :number,
        retryAfterStartTime : number
    }> {
        let that = this;
        //that.logger.log("debug", LOG_ID + "(checkEveryPortals) ");
        let httpStatus : {
            nbHttpAdded: number,
            httpQueueSize: number,
            nbRunningReq: number,
            maxSimultaneousRequests : number,
            nbReqInQueue : number,
            retryAfterTime : number,
            retryAfterEndTime :number,
            retryAfterStartTime : number
        } = {
            nbHttpAdded : 0,
            httpQueueSize : 0,
            nbRunningReq : 0,
            maxSimultaneousRequests : 0,
            nbReqInQueue : 0,
            retryAfterTime : 0,
            retryAfterEndTime : 0,
            retryAfterStartTime : 0
        };

        try {
            httpStatus = await that.httpManager.checkHTTPStatus();
            that.logger.log("debug", LOG_ID + "(checkHTTPStatus) httpStatus : ", httpStatus);
        } catch (err) {
            that.logger.log("debug", LOG_ID + "(checkHTTPStatus) check Http status failed : ", err);
        }

        return httpStatus;
    }

    /**
     *
     */
    hasJsonStructure(str) {
        if (typeof str !== 'string') return false;
        try {
            const result = JSON.parse(str);
            const type = Object.prototype.toString.call(result);
            return type === '[object Object]'
                || type === '[object Array]';
        } catch (err) {
            return false;
        }
    }

    get host(): any {
        return this._host;
    }

    start(): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.logger.log("debug", LOG_ID + "(start) host used", that._host);
            that.logger.log("info", LOG_ID + "(start) REST URL", that.serverURL);
            
            that.httpManager.init(that._options,that._core).then(() => {            
            }).catch((err)=>{
            });

            resolve(undefined);
        });
    }

    stop(): Promise<any> {
        let that = this;
        return new Promise((resolve) => {
            that.httpManager.stop();
            that.logger.log("info", LOG_ID + "(stop) Successfully stopped");
            resolve(undefined);
        });
    }

    tokenExpirationControl(bodyjs: { errorCode: number, errorDetails: string }): void {
        let that = this;
        if (bodyjs.errorCode === 401 && bodyjs.errorDetails === "jwt expired") {
            that.logger.log("debug", LOG_ID + "(tokenExpirationControl) evt_internal_tokenexpired");
            that.eventEmitter.emit("evt_internal_tokenexpired");
        }
    }

    getUrlRaw(url, headers: any = {}, params): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.method = that._getUrlRaw.bind(this);
        req.params = arguments;
        req.label = "getUrlRaw url : " +  (url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        return that.httpManager.add(req);
    }

    _getUrlRaw(url, headers: any = {}, params): Promise<any> {

        let that = this;

        return new Promise(function (resolve, reject) {

            try {
                headers["user-agent"] = USER_AGENT;
                let urlEncoded = url;

                that.logger.log("debug", LOG_ID + "(_getUrlRaw) url : ", ( url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g));
                that.logger.log("internal", LOG_ID + "(_getUrlRaw) url : ", url, ", headers : ", headers, ", params : ", params);

                let request = Request({
                    url: urlEncoded,
                    method: "GET",
                    headers: headers,
                    //params: params,
                    proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                    agentOptions: {
                        secureProtocol: that.proxy.secureProtocol
                    },
                    forever: true
                }, (error, response, body) => {
                    that.logger.log("debug", LOG_ID + "(get) successfull");
                    if (error) {
                        return reject({
                            code: -1,
                            msg: "ErrorManager while requesting",
                            details: error,
                            headers: response ? response.headers:undefined
                        });
                    } else {
                        if (response) {
                            response.body = body;
                        }
                        resolve (response);
                    }
                });
            } catch (err) {
                that.logger.log("error", LOG_ID + "(_getUrlRaw) HTTP ErrorManager");
                that.logger.log("internalerror", LOG_ID + "(_getUrlRaw) HTTP ErrorManager : ", err);
                return reject({
                    code: -1,
                    msg: "Unknown error",
                    details: err
                });
            }
        });
    }

    headUrlRaw(url, headers: any = {}): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.method = that._headUrlRaw.bind(this);
        req.params = arguments;
        req.label = "head url : " +  (url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        return that.httpManager.add(req);
    }

    _headUrlRaw(url, headers: any = {}): Promise<any> {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
                let urlEncoded = url;
                headers["user-agent"] = USER_AGENT;

                that.logger.log("internal", LOG_ID + "(_headUrlRaw) url : ", urlEncoded, ", headers : ", headers);

                Request({
                    method: 'HEAD',
                    preambleCRLF: true,
                    postambleCRLF: true,
                    url: urlEncoded,
                    headers: headers,
                    proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL:null,
                    agentOptions: {
                        secureProtocol: that.proxy.secureProtocol
                    },
                    forever: true,
                    body: undefined
                }, (error, response, body) => {
                    that.logger.log("debug", LOG_ID + "(_headUrlRaw) successfull");
                    if (error) {
                        return reject({
                            code: -1,
                            msg: "ErrorManager while requesting",
                            details: error,
                            headers: response ? response.headers:undefined
                        });
                    } else {
                        if (response) {
                            response.body = body;
                        }
                        resolve(response);
                    }
                });
            } catch (err) {
                that.logger.log("error", LOG_ID + "(_headUrlRaw) HTTP ErrorManager");
                that.logger.log("internalerror", LOG_ID + "(_headUrlRaw) HTTP ErrorManager : ", err);
                return reject({
                    code: -1,
                    msg: "Unknown error",
                    details: err
                });
            }
        });
    }
    
    postUrlRaw(url, headers: any = {}, data): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.method = that._postUrlRaw.bind(this);
        req.params = arguments;
        req.label = "postUrlRaw url : " +  (url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        return that.httpManager.add(req);
    }

    _postUrlRaw(url, headers: any = {}, data): Promise<any> {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = url;
            headers["user-agent"] = USER_AGENT;
            let body = data;
            /*
            if (contentType) {
                //request.type(type);
                headers["Content-Type"] = contentType;
            } else {
                //request.type("json");
                if (!headers["Content-Type"]) {
                    headers["Content-Type"] = "application/json";
                    body = JSON.stringify(data);
                }
            } // */

            that.logger.log("internal", LOG_ID + "(_postUrlRaw) url : ", urlEncoded, ", headers : ", headers, ", body : ", body);

            Request({
                method: 'POST',
                preambleCRLF: true,
                postambleCRLF: true,
                url: urlEncoded,
                headers: headers,
                proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                agentOptions: {
                    secureProtocol: that.proxy.secureProtocol
                },
                forever: true,
                body: body
            }, (error, response, body) => {
                that.logger.log("debug", LOG_ID + "(_postUrlRaw) successfull");
                that.logger.log("internal", LOG_ID + "(_postUrlRaw) successfull - error : ", error, ", body : ", body);
                if (error) {
                    return reject({
                        code: -1,
                        msg: "ErrorManager while posting",
                        details: error,
                        headers: response ? response.headers:undefined
                    });
                } else {
                    if (response) {
                        response.body = body;
                    }
                    resolve (response);
                }
            });
            } catch (err) {
                that.logger.log("error", LOG_ID + "(_postUrlRaw) HTTP ErrorManager");
                that.logger.log("internalerror", LOG_ID + "(_postUrlRaw) HTTP ErrorManager : ", err);
                return reject({
                    code: -1,
                    msg: "Unknown error",
                    details: err
                });
            }
        });
    }

    putUrlRaw(url, headers: any = {}, data): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.method = that._putUrlRaw.bind(this);
        req.params = arguments;
        req.label = "putUrlRaw url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        return that.httpManager.add(req);
    }

    _putUrlRaw(url, headers: any = {}, data): Promise<any> {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
                let urlEncoded = url;

                headers["user-agent"] = USER_AGENT;
                that.logger.log("internal", LOG_ID + "(_putUrlRaw) url : ", urlEncoded, ", headers : ", headers, ", data : ", data);

                let body = data;
                /*if (type) {
                    //request.type(type);
                    headers["Content-Type"] = type;
                } else {
                    //request.type("json");
                    if (!headers["Content-Type"]) {
                        headers["Content-Type"] = "application/json";
                        body = JSON.stringify(data);
                    }
                } // */
                Request({
                    method: 'PUT',
                    preambleCRLF: true,
                    postambleCRLF: true,
                    url: urlEncoded,
                    headers: headers,
                    proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL:null,
                    agentOptions: {
                        secureProtocol: that.proxy.secureProtocol
                    },
                    forever: true,
                    body: body
                }, (error, response, body) => {
                    that.logger.log("debug", LOG_ID + "(_putUrlRaw) successfull");
                    if (error) {
                        return reject({
                            code: -1,
                            msg: "ErrorManager while posting",
                            details: error,
                            headers: response ? response.headers:undefined
                        });
                    } else {
                        if (response) {
                            response.body = body;
                        }
                        resolve(response);
                    }
                });
            } catch (err) {
                that.logger.log("error", LOG_ID + "(_putUrlRaw) HTTP ErrorManager");
                that.logger.log("internalerror", LOG_ID + "(_putUrlRaw) HTTP ErrorManager : ", err);
                return reject({
                    code: -1,
                    msg: "Unknown error",
                    details: err
                });
            }
        });
    }

    deleteUrlRaw(url, headers: any = {}, data : Object = undefined): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.method = that._deleteUrlRaw.bind(this);
        req.params = arguments;
        req.label = "deleteUrlRaw url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        return that.httpManager.add(req);
    }

    _deleteUrlRaw(url, headers: any = {}, data : Object = undefined): Promise<any> {

        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
                let urlEncoded = url;

                let body = data;
                headers["user-agent"] = USER_AGENT;

                that.logger.log("internal", LOG_ID + "(_deleteUrlRaw) url : ", urlEncoded, ", headers : ", headers, ", body : ", body);


                let deleteOptions = {
                    url: urlEncoded,
                    headers: headers,
                    proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL:null,
                    agentOptions: {
                        secureProtocol: that.proxy.secureProtocol
                    },
                    body: undefined
                };

                if (body) {
                    deleteOptions.body = body;
                }

                let request = Request.delete(deleteOptions, (error, response, body) => {
                    that.logger.log("debug", LOG_ID + "(_deleteUrlRaw) successfull");
                    if (error) {
                        return reject({
                            code: -1,
                            msg: "ErrorManager while posting",
                            details: error,
                            headers: response ? response.headers:undefined
                        });
                    } else {
                        if (response) {
                            response.body = body;
                        }
                        resolve(response);
                    }
                });
            } catch (err) {
                that.logger.log("error", LOG_ID + "(_deleteUrlRaw) HTTP ErrorManager");
                that.logger.log("internalerror", LOG_ID + "(_deleteUrlRaw) HTTP ErrorManager : ", err);
                return reject({
                    code: -1,
                    msg: "Unknown error",
                    details: err
                });
            }

        });
    }

    getUrlJson(url, headers: any = {}, params): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.method = that._getUrlJson.bind(this);
        req.params = arguments;
        req.label = "getUrl url : " +  (url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        return that.httpManager.add(req);
    }

    _getUrlJson(url, headers: any = {}, params): Promise<any> {

        let that = this;

        return new Promise(function (resolve, reject) {

            try {
                headers["user-agent"] = USER_AGENT;
                let urlEncoded = url;

                that.logger.log("debug", LOG_ID + "(_getUrlJson) url : ", ( url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g));
                that.logger.log("internal", LOG_ID + "(_getUrlJson) url : ", url, ", headers : ", headers, ", params : ", params);

                let request = Request({
                    url: urlEncoded,
                    method: "GET",
                    headers: headers,
                    //params: params,
                    proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                    agentOptions: {
                        secureProtocol: that.proxy.secureProtocol
                    },
                    forever: true
                }, (error, response, body) => {
                    that.logger.log("debug", LOG_ID + "(_getUrlJson) successfull");
                    if (error) {
                        return reject({
                            code: -1,
                            msg: "ErrorManager while requesting",
                            details: error,
                            headers: response ? response.headers:undefined
                        });
                    } else {
                        if (response) {
                            if (response.statusCode) {
                                that.logger.log("debug", LOG_ID + "(_getUrlJson) HTTP statusCode defined : ", response.statusCode);
                                if (response.statusCode >= 200 && response.statusCode <= 206) {
                                    if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                        let json = {};
                                        if (response.body && (response.headers["content-type"].indexOf("json") > -1)) {
                                            json = JSON.parse(response.body);
                                            resolve(json);
                                        } else {
                                            resolve(response.body);
                                        }
                                    } else {
                                        return reject({
                                            code: -1,
                                            msg: "Bad content, please check your host",
                                            details: "",
                                            headers: response ? response.headers:undefined
                                        });
                                    }
                                } else {
                                    that.logger.warn("warn", LOG_ID + "(_getUrlJson) HTTP response.code != 200");
                                    that.logger.warn("internal", LOG_ID + "(_getUrlJson) HTTP response.code != 200 , bodyjs : ", response.body);
                                    let bodyjs: any = {};
                                    if (that.hasJsonStructure(response.body)) {
                                        bodyjs = JSON.parse(response.body);
                                    } else {
                                        bodyjs.errorMsg = response.body;
                                    }
                                    let msg = response.statusMessage ? response.statusMessage : bodyjs ? bodyjs.errorMsg || "" : "";
                                    let errorMsgDetail = bodyjs ? bodyjs.errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode : "" || "") : "";
                                    errorMsgDetail = errorMsgDetail ? errorMsgDetail : bodyjs ? bodyjs.errorMsg || "" : "";
                                    that.tokenExpirationControl(bodyjs);
                                    return reject({
                                        code: response.statusCode,
                                        msg: msg,
                                        details: errorMsgDetail,
                                        error: bodyjs,
                                        headers: response ? response.headers:undefined
                                    });

                                }
                            } else {
                            }
                        } else {
                        }
                    }
                });
            } catch (err) {
                that.logger.log("error", LOG_ID + "(_getUrlJson) HTTP ErrorManager");
                that.logger.log("internalerror", LOG_ID + "(_getUrlJson) HTTP ErrorManager", err);
                return reject({
                    code: -1,
                    msg: "Unknown error",
                    details: ""
                });
            }
        });
    }

    get(url, headers: any = {}, params, responseType = "", nbTryBeforeFailed : number = 1, timeBetweenRetry = 1000): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.method = that._get.bind(this);
        req.params = arguments;
        req.label = "get url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        return that.httpManager.add(req);
    }

    _get(url,headers: any = {}, params, responseType = "", nbTryBeforeFailed : number = 1, timeBetweenRetry = 1000): Promise<any> {

        let that = this;

        return new Promise(async function (resolve, reject) {

            try {
                headers["user-agent"] = USER_AGENT;
                that.logger.log("debug", LOG_ID + "(get) url : ", (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g));
                that.logger.log("internal", LOG_ID + "(get) url : ", that.serverURL + url, ", headers : ", headers, ", params : ", params);

                //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
                let urlEncoded = that.serverURL + url;

                if (headers.Accept && headers.Accept.indexOf("json") > -1) {
                    let req = {
                        url: urlEncoded,
                        method: "GET",
                        headers: headers,
                        params: params,
                        proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                        agentOptions: {
                            secureProtocol: that.proxy.secureProtocol
                        },
                        forever: true
                    };
                    if (responseType != "") {
                        req["responseType"] = responseType; // 'arraybuffer'
                    }

                    let responseRequest :any =  null; //Promise.reject({statusCode: -100, id:1});

                    for (let i = 0; i < nbTryBeforeFailed ; i++) {
                        let responsePromRequest : any = new Promise(function(resolve2, reject2) {
                            let request = Request(req, (error, response, body) => {
                                that.logger.log("debug", LOG_ID + "(get) done.");
                                if (error) {
                                    responseRequest = {
                                        code: -1,
                                        url: urlEncoded,
                                        msg: "ErrorManager while requesting",
                                        details: error,
                                        headers: response ? response.headers:undefined
                                    };
                                    resolve2({statusCode: -100, id:2});
                                } else {
                                    if (response) {
                                        if (response.statusCode) {
                                            /*response.statusCode = 504;
                                            response.body = "<html><body><h1>504 Gateway Time-out</h1>\n" +
                                                "The server didn't respond in time.\n" +
                                                "</body></html>\n";
                                                // */
                                            that.logger.log("debug", LOG_ID + "(get) HTTP statusCode defined : ", response.statusCode);
                                            if (response.statusCode >= 200 && response.statusCode <= 206) {
                                                if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                                    let json = {};
                                                    if (response.body && (response.headers["content-type"].indexOf("json") > -1)) {
                                                        json = JSON.parse(response.body);
                                                        responseRequest = json;
                                                        resolve2({statusCode: response.statusCode, id:3});
                                                    } else {
                                                        responseRequest = response.body;
                                                        resolve2({statusCode: response.statusCode, id:3});
                                                    }
                                                } else {
                                                    responseRequest = {
                                                        code: -1,
                                                        url: urlEncoded,
                                                        msg: "Bad content, please check your host",
                                                        details: "",
                                                        headers: response ? response.headers:undefined
                                                    };
                                                    resolve2({statusCode: response.statusCode, id:4});
                                                }
                                            } else {
                                                that.logger.warn("warn", LOG_ID + "(get) HTTP response.code != 200");
                                                that.logger.warn("internal", LOG_ID + "(get) HTTP response.code != 200 , bodyjs : ", response.body);
                                                that.logger.warn("internal", LOG_ID + "(get) HTTP response.code != 200 , response.headers : ", response.headers, ", error : ", error, ", body : ", body);
                                                let bodyjs: any = {};
                                                if (that.hasJsonStructure(response.body)) {
                                                    bodyjs = JSON.parse(response.body);
                                                } else {
                                                    bodyjs.errorMsg = response.body;
                                                }
                                                let msg = response.statusMessage ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                                let errorMsgDetail = bodyjs ? bodyjs.errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:"" || ""):"";
                                                errorMsgDetail = errorMsgDetail ? errorMsgDetail:bodyjs ? bodyjs.errorMsg || "":"";
                                                that.tokenExpirationControl(bodyjs);
                                                responseRequest = {
                                                    code: response.statusCode,
                                                    url: urlEncoded,
                                                    msg: msg,
                                                    details: errorMsgDetail,
                                                    error: bodyjs,
                                                    headers: response ? response.headers:undefined
                                                };
                                                resolve2({statusCode: response.statusCode, id:5});
                                            }
                                        } else {
                                            if (response.error && response.error.reason) {
                                                that.logger.log("error", LOG_ID + "(get) HTTP security issue", response.error.reason);
                                                responseRequest = {
                                                    code: -1,
                                                    url: urlEncoded,
                                                    msg: response.error.reason,
                                                    details: "",
                                                    headers: response ? response.headers:undefined
                                                };
                                                resolve2({statusCode: -100, id:6});
                                            } else {
                                                that.logger.warn("warn", LOG_ID + "(get) HTTP other issue");
                                                that.logger.warn("internal", LOG_ID + "(get) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                                that.logger.log("internal", LOG_ID + "(get) HTTP other issue", response);
                                                responseRequest = {
                                                    code: -1,
                                                    url: urlEncoded,
                                                    msg: "Unknown error",
                                                    details: response,
                                                    headers: response ? response.headers:undefined
                                                };
                                                resolve2({statusCode: -100, id:7});
                                            }
                                        }
                                    } else {
                                        responseRequest = {
                                            code: -1,
                                            url: urlEncoded,
                                            msg: "ErrorManager while requesting",
                                            details: "error",
                                            headers: response ? response.headers:undefined
                                        };
                                        resolve2({statusCode: -100, id:8});
                                    }
                                }
                            });
                        });
                        
                        let statusCodeHttpType = Math.floor((await responsePromRequest.catch((err) => {
                            that.logger.warn("warn", LOG_ID + "(get) catch issue during request : ", err);
                            return -100;
                        })).statusCode/100);

                        if (statusCodeHttpType > 0 && statusCodeHttpType < 4) {
                            return resolve (responseRequest);
                        } else {
                            that.httpManager._logger.log("warn", LOG_ID + "(MyRequestHandler::request) The req method call ERROR. req.url : ", req.url, ", Iter ", i + 1,"/", nbTryBeforeFailed, ", responseRequest : ", responseRequest);
                            if ( (i + 1) < nbTryBeforeFailed) {
                                that.httpManager._logger.log("debug", LOG_ID + "(_get) The req method call ERROR. req.url : ", req.url, ", Iter ", i + 1,"/", nbTryBeforeFailed, " nbTryBeforeFailed, Will retry the request process in ", timeBetweenRetry, " milliseconds. statusCodeHttpType : ", statusCodeHttpType);
                                await pause(timeBetweenRetry).catch((res) => {return res; });
                            } else {
                                that.httpManager._logger.log("debug", LOG_ID + "(_get) The req method call ERROR. req.url : ", req.url, ", Iter ", i + 1,"/", nbTryBeforeFailed, " nbTryBeforeFailed, Stop retry the request process and return the error. statusCodeHttpType : ", statusCodeHttpType);
                                let res = responseRequest;
                                return reject (res);                                
                            }
                        }
                    } 
                } else {
                    let buff = [];
                    let err = {
                        statusCode: null,
                        statusMessage: null,
                        contentType: null
                    };

                    let req = Request.get({
                        url: urlEncoded,
                        headers: headers,
                        params: params,
                        proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                        agentOptions: {
                            secureProtocol: that.proxy.secureProtocol
                        }
                    }).on("response", function (response) {
                        that.logger.log("debug", LOG_ID + "(get) status code:" + response.statusCode); // 200
                        that.logger.log("debug", LOG_ID + "(get) response headers: " + response.headers["content-type"]); // 'image/png'
                        if (response.statusCode === 400) {
                            req.abort();
                            err.statusCode = response.statusCode;
                            err.statusMessage = response.statusMessage;
                            err.contentType = response.headers["content-type"];
                        }
                    }).on("data", (chunk) => {
                        buff.push(chunk);
                    }).on("error", (error) => {
                        that.logger.log("error", LOG_ID, "(get) error");
                        that.logger.log("internalerror", LOG_ID, "(get) error : ", error);
                        that.logger.log("debug", LOG_ID + "(get) _exiting_");
                        return reject({
                            code: -1,
                            url: urlEncoded,
                            msg: error.message,
                            details: ""
                        });
                    }).on("end", () => {
                        that.logger.log("debug", LOG_ID + "(get) successfull");
                        that.logger.log("debug", LOG_ID + "(get) get file buffer from Url");
                        that.logger.log("debug", LOG_ID + "(get) _exiting_");
                        if (!err.statusCode) {
                            let data = Buffer.concat(buff);
                            resolve(data);
                        } else {
                            return reject({
                                code: err.statusCode,
                                url: urlEncoded,
                                msg: err.statusMessage,
                                details: ""
                            });
                        }
                    }); // */
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(get) HTTP ErrorManager");
                that.logger.log("internalerror", LOG_ID + "(get) HTTP ErrorManager : ", err);
                return reject({
                    code: -1,
                    msg: "Unknown error",
                    details: ""
                });
            }
        });
    }

    post(url, headers: any = {}, data, contentType): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.method = that._post.bind(this);
        req.params = arguments;
        req.label = "post url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        return that.httpManager.add(req);
    }

    _post(url, headers: any = {}, data, contentType): Promise<any> {
        let that = this;

        return new Promise(function (resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;
            headers["user-agent"] = USER_AGENT;
            let body = data;
            if (contentType) {
                //request.type(type);
                headers["Content-Type"] = contentType;
            } else {
                //request.type("json");
                if (!headers["Content-Type"]) {
                    headers["Content-Type"] = "application/json";
                    body = JSON.stringify(data);
                }
            } // */

            that.logger.log("internal", LOG_ID + "(post) url : ", urlEncoded, ", headers : ", headers, ", body : ", body);

            Request({
                method: 'POST',
                preambleCRLF: true,
                postambleCRLF: true,
                url: urlEncoded,
                headers: headers,
                proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                agentOptions: {
                    secureProtocol: that.proxy.secureProtocol
                },
                forever: true,
                body: body
            }, (error, response, body) => {
                if (error) {
                    that.logger.log("internalerror", LOG_ID + "(post) failed:", error, ", url:", urlEncoded);
                    return reject("post failed");
                } else {
                    if (response) {
                        if (response.statusCode) {
                            that.logger.log("debug", LOG_ID + "(post) HTTP statusCode", response.statusCode);
                            if (response.statusCode >= 200 && response.statusCode <= 206) {
                                if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                    let json = {};
                                    if (response.body && (response.headers["content-type"].indexOf("json") > -1)) {
                                        json = JSON.parse(response.body);
                                        resolve(json);
                                    } else {
                                        resolve(response.body);
                                    }
                                } else {
                                    return reject({
                                        code: -1,
                                        url: urlEncoded,
                                        msg: "Bad content, please check your host",
                                        details: "",
                                        headers: response ? response.headers:undefined
                                    });
                                }
                            } else {
                                let bodyjs: any = {};
                                if (that.hasJsonStructure(response.body)) {
                                    bodyjs = JSON.parse(response.body);
                                } else {
                                    bodyjs.errorMsg = response.body;
                                }

                                that.logger.warn("warn", LOG_ID + "(post) HTTP response.code != 200 ");
                                that.logger.warn("internal", LOG_ID + "(post) HTTP response.code != 200 , body : ", bodyjs);
                                let msg = response.statusMessage ? response.statusMessage : bodyjs ? bodyjs.errorMsg || "" : "";
                                let errorDetails = bodyjs.errorDetails;
                                if (errorDetails) {
                                    if (typeof errorDetails === "object"){
                                        // errorDetails = JSON.stringify(errorDetails);
                                        errorDetails = util.inspect(errorDetails, false, 4, true);
                                    }
                                }
                                let errorMsgDetail = bodyjs ? errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode : "" || "") : "";
                                errorMsgDetail = errorMsgDetail ? errorMsgDetail : bodyjs ? bodyjs.errorMsg || "" : "";

                                that.tokenExpirationControl(bodyjs);
                                return reject({
                                    code: response.statusCode,
                                    url: urlEncoded,
                                    msg: msg,
                                    details: errorMsgDetail,
                                    error: bodyjs,
                                    headers: response ? response.headers:undefined
                                });
                            }
                        } else {
                            if (response.error && response.error.reason) {
                                that.logger.log("error", LOG_ID + "(post) HTTP security issue", response.error.reason);
                                return reject({
                                    code: -1,
                                    url: urlEncoded,
                                    msg: response.error.reason,
                                    details: "",
                                    headers: response ? response.headers:undefined
                                });
                            } else {
                                that.logger.warn("error", LOG_ID + "(post) HTTP other issue.");
                                that.logger.warn("internalerror", LOG_ID + "(post) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                that.logger.log("internal", LOG_ID + "(post) HTTP other issue", response);
                                return reject({
                                    code: -1,
                                    url: urlEncoded,
                                    msg: "Unknown error",
                                    details: response,
                                    headers: response ? response.headers:undefined
                                });
                            }
                        }
                    } else {
                        return reject({
                            code: -1,
                            url: urlEncoded,
                            msg: "ErrorManager while requesting",
                            details: "error"
                        });
                    }
                }
            });
        });
    }

    head(url, headers: any = {}): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.method = that._head.bind(this);
        req.params = arguments;
        req.label = "head url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        return that.httpManager.add(req);
    }

    _head(url, headers: any = {}): Promise<any> {
        let that = this;

        return new Promise(function (resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;
            headers["user-agent"] = USER_AGENT;

            that.logger.log("internal", LOG_ID + "(head) url : ", urlEncoded, ", headers : ", headers);

            Request({
                method: 'HEAD',
                preambleCRLF: true,
                postambleCRLF: true,
                url: urlEncoded,
                headers: headers,
                proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                agentOptions: {
                    secureProtocol: that.proxy.secureProtocol
                },
                forever: true,
                body: undefined
            }, (error, response, body) => {
                if (error) {
                    that.logger.log("internalerror", LOG_ID + "(head) failed:", error, ", url:", urlEncoded);
                    return reject("post failed");
                } else {
                    if (response) {
                        if (response.statusCode) {
                            that.logger.log("debug", LOG_ID + "(head) HTTP statusCode", response.statusCode);
                            if (response.statusCode >= 200 && response.statusCode <= 206) {
                                if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                    let json = {};
                                    if (response.body && (response.headers["content-type"].indexOf("json") > -1)) {
                                        json = JSON.parse(response.body);
                                        resolve(json);
                                    } else {
                                        resolve(response.body);
                                    }
                                } else {
                                    return reject({
                                        code: -1,
                                        url: urlEncoded,
                                        msg: "Bad content, please check your host",
                                        details: "",
                                        headers: response ? response.headers:undefined
                                    });
                                }
                            } else {
                                let bodyjs: any = {};
                                if (that.hasJsonStructure(response.body)) {
                                    bodyjs = JSON.parse(response.body);
                                } else {
                                    bodyjs.errorMsg = response.body;
                                }

                                that.logger.warn("warn", LOG_ID + "(head) HTTP response.code != 200 ");
                                that.logger.warn("internal", LOG_ID + "(head) HTTP response.code != 200 , body : ", bodyjs);
                                let msg = response.statusMessage ? response.statusMessage : bodyjs ? bodyjs.errorMsg || "" : "";
                                let errorMsgDetail = bodyjs ? bodyjs.errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode : "" || "") : "";
                                errorMsgDetail = errorMsgDetail ? errorMsgDetail : bodyjs ? bodyjs.errorMsg || "" : "";

                                that.tokenExpirationControl(bodyjs);
                                return reject({
                                    code: response.statusCode,
                                    url: urlEncoded,
                                    msg: msg,
                                    details: errorMsgDetail,
                                    error: bodyjs,
                                    headers: response ? response.headers:undefined
                                });
                            }
                        } else {
                            if (response.error && response.error.reason) {
                                that.logger.log("error", LOG_ID + "(head) HTTP security issue", response.error.reason);
                                return reject({
                                    code: -1,
                                    url: urlEncoded,
                                    msg: response.error.reason,
                                    details: "",
                                    headers: response ? response.headers:undefined
                                });
                            } else {
                                that.logger.warn("error", LOG_ID + "(head) HTTP other issue.");
                                that.logger.warn("internalerror", LOG_ID + "(head) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                that.logger.log("internal", LOG_ID + "(head) HTTP other issue", response);
                                return reject({
                                    code: -1,
                                    url: urlEncoded,
                                    msg: "Unknown error",
                                    details: response,
                                    headers: response ? response.headers:undefined
                                });
                            }
                        }
                    } else {
                        return reject({
                            code: -1,
                            url: urlEncoded,
                            msg: "ErrorManager while requesting",
                            details: "error"
                        });
                    }
                }
            });
        });
    }

    patch(url, headers: any = {}, data, type): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.method = that._patch.bind(this);
        req.params = arguments;
        req.label = "patch url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        return that.httpManager.add(req);
    }

    _patch(url, headers: any = {}, data, type): Promise<any> {
        let that = this;

        return new Promise(function (resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            headers["user-agent"] = USER_AGENT;
            that.logger.log("internal", LOG_ID + "(patch) url : ", urlEncoded, ", headers : ", headers, ", data : ", data);

            let body = data;
            if (type) {
                //request.type(type);
                headers["Content-Type"] = type;
            } else {
                //request.type("json");
                if (!headers["Content-Type"]) {
                    headers["Content-Type"] = "application/json";
                    body = JSON.stringify(data);
                }
            } // */
            Request({
                method: 'PATCH',
                preambleCRLF: true,
                postambleCRLF: true,
                url: urlEncoded,
                headers: headers,
                proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                agentOptions: {
                    secureProtocol: that.proxy.secureProtocol
                },
                forever: true,
                body: body
            }, (error, response, body) => {
                if (error) {
                    that.logger.log("internalerror", LOG_ID + "(patch) patch failed:", error, ', url : ', urlEncoded);
                    return reject("patch failed");
                } else {
                    if (response) {
                        if (response.statusCode) {
                            that.logger.log("debug", LOG_ID + "(patch) HTTP statusCode", response.statusCode);
                            if (response.statusCode >= 200 && response.statusCode <= 206) {
                                if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                    let json = {};
                                    if (response.body && (response.headers["content-type"].indexOf("json") > -1)) {
                                        json = JSON.parse(response.body);
                                        resolve(json);
                                    } else {
                                        resolve(response.body);
                                    }
                                } else {
                                    return reject({
                                        code: -1,
                                        url: urlEncoded,
                                        msg: "Bad content, please check your host",
                                        details: "",
                                        headers: response ? response.headers:undefined
                                    });
                                }
                            } else {
                                let bodyjs: any = {};
                                if (that.hasJsonStructure(response.body)) {
                                    bodyjs = JSON.parse(response.body);
                                } else {
                                    bodyjs.errorMsg = response.body;
                                }
                                that.logger.warn("warn", LOG_ID + "(patch) HTTP response.code != 200 ");
                                that.logger.warn("internalerror", LOG_ID + "(patch) HTTP response.code != 200 , body : ", bodyjs);
                                let msg = response.statusMessage ? response.statusMessage : bodyjs ? bodyjs.errorMsg || "" : "";
                                let errorMsgDetail = bodyjs ? bodyjs.errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode : "" || "") : "";
                                errorMsgDetail = errorMsgDetail ? errorMsgDetail : bodyjs ? bodyjs.errorMsg || "" : "";

                                that.tokenExpirationControl(bodyjs);
                                return reject({
                                    code: response.statusCode,
                                    url: urlEncoded,
                                    msg: msg,
                                    details: errorMsgDetail,
                                    error: bodyjs,
                                    headers: response ? response.headers:undefined
                                });
                            }
                        } else {
                            if (response.error && response.error.reason) {
                                that.logger.log("error", LOG_ID + "(patch) HTTP security issue", response.error.reason);
                                return reject({
                                    code: -1,
                                    url: urlEncoded,
                                    msg: response.error.reason,
                                    details: "",
                                    headers: response ? response.headers:undefined
                                });
                            } else {
                                that.logger.warn("warn", LOG_ID + "(patch) HTTP other issue ");
                                that.logger.warn("internalerror", LOG_ID + "(patch) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                that.logger.log("internal", LOG_ID + "(patch) HTTP other issue", response);
                                return reject({
                                    code: -1,
                                    url: urlEncoded,
                                    msg: "Unknown error",
                                    details: response,
                                    headers: response ? response.headers:undefined
                                });
                            }
                        }
                    } else {
                        return reject({
                            code: -1,
                            url: urlEncoded,
                            msg: "ErrorManager while requesting",
                            details: "error"
                        });
                    }
                }
            });
        });
    }

    put(url, headers: any = {}, data, type): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.method = that._put.bind(this);
        req.params = arguments;
        req.label = "put url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        return that.httpManager.add(req);
    }

    _put(url, headers: any = {}, data, type): Promise<any> {
        let that = this;

        return new Promise(function (resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            headers["user-agent"] = USER_AGENT;
            that.logger.log("internal", LOG_ID + "(put) url : ", urlEncoded, ", headers : ", headers, ", data : ", data);

            let body = data;
            if (type) {
                //request.type(type);
                headers["Content-Type"] = type;
            } else {
                //request.type("json");
                if (!headers["Content-Type"]) {
                    headers["Content-Type"] = "application/json";
                    body = JSON.stringify(data);
                }
            } // */
            Request({
                method: 'PUT',
                preambleCRLF: true,
                postambleCRLF: true,
                url: urlEncoded,
                headers: headers,
                proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                agentOptions: {
                    secureProtocol: that.proxy.secureProtocol
                },
                forever: true,
                body: body
            }, (error, response, body) => {
                if (error) {
                    that.logger.log("internalerror", LOG_ID + "(put) put failed:", error, ', url : ', urlEncoded);
                    return reject("put failed");
                } else {
                    if (response) {
                        if (response.statusCode) {
                            that.logger.log("debug", LOG_ID + "(put) HTTP statusCode", response.statusCode);
                            if (response.statusCode >= 200 && response.statusCode <= 206) {
                                if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                    let json = {};
                                    if (response.body && (response.headers["content-type"].indexOf("json") > -1)) {
                                        json = JSON.parse(response.body);
                                        resolve(json);
                                    } else {
                                        resolve(response.body);
                                    }
                                } else {
                                    return reject({
                                        code: -1,
                                        url: urlEncoded,
                                        msg: "Bad content, please check your host",
                                        details: "",
                                        headers: response ? response.headers:undefined
                                    });
                                }
                            } else {
                                let bodyjs: any = {};
                                if (that.hasJsonStructure(response.body)) {
                                    bodyjs = JSON.parse(response.body);
                                } else {
                                    bodyjs.errorMsg = response.body;
                                }
                                that.logger.warn("warn", LOG_ID + "(put) HTTP response.code != 200 ");
                                that.logger.warn("internalerror", LOG_ID + "(put) HTTP response.code != 200 , body : ", bodyjs);
                                let msg = response.statusMessage ? response.statusMessage : bodyjs ? bodyjs.errorMsg || "" : "";
                                let errorMsgDetail = bodyjs ? bodyjs.errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode : "" || "") : "";
                                errorMsgDetail = errorMsgDetail ? errorMsgDetail : bodyjs ? bodyjs.errorMsg || "" : "";

                                that.tokenExpirationControl(bodyjs);
                                return reject({
                                    code: response.statusCode,
                                    url: urlEncoded,
                                    msg: msg,
                                    details: errorMsgDetail,
                                    error: bodyjs,
                                    headers: response ? response.headers:undefined
                                });
                            }
                        } else {
                            if (response.error && response.error.reason) {
                                that.logger.log("error", LOG_ID + "(put) HTTP security issue", response.error.reason);
                                return reject({
                                    code: -1,
                                    url: urlEncoded,
                                    msg: response.error.reason,
                                    details: "",
                                    headers: response ? response.headers:undefined
                                });
                            } else {
                                that.logger.warn("warn", LOG_ID + "(put) HTTP other issue ");
                                that.logger.warn("internalerror", LOG_ID + "(put) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                that.logger.log("internal", LOG_ID + "(put) HTTP other issue", response);
                                return reject({
                                    code: -1,
                                    url: urlEncoded,
                                    msg: "Unknown error",
                                    details: response,
                                    headers: response ? response.headers:undefined
                                });
                            }
                        }
                    } else {
                        return reject({
                            code: -1,
                            url: urlEncoded,
                            msg: "ErrorManager while requesting",
                            details: "error"
                        });
                    }
                }
            });
        });
    }

    putBuffer(url, headers: any = {}, buffer): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.method = that._putBuffer.bind(this);
        req.params = arguments;
        req.label = "putBuffer url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        return that.httpManager.add(req);
    }

    _putBuffer(url, headers: any = {}, buffer): Promise<any> {
        let that = this;

        return new Promise(function (resolve, reject) {

            //that.logger.log("debug", LOG_ID + "(putBuffer) option url", that.serverURL + url);
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            headers["user-agent"] = USER_AGENT;

            that.logger.log("internal", LOG_ID + "(putBuffer) url : ", urlEncoded);

            Request({
                    method: 'PUT',
                    preambleCRLF: true,
                    postambleCRLF: true,
                    url: urlEncoded,
                    headers: headers,
                    proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                    agentOptions: {
                        secureProtocol: that.proxy.secureProtocol
                    },
                        forever: true,
                    body: buffer
                },
                function (error, response, body) {
                    if (error) {
                        that.logger.log("internalerror", LOG_ID + "(putBuffer) upload failed:", error);
                        return reject("upload failed");
                    }
                    that.logger.log("internal", LOG_ID + "(putBuffer) Upload successful!  Server responded with:", body);
                    resolve(body);
                });
        });
    }

    putStream(url, headers: any = {}, stream): Promise<any> {
        let that = this;

        return new Promise(function (resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            that.logger.log("internal", LOG_ID + "(put) url : ", urlEncoded, " stream fileName : ", stream.fileName);

            headers["user-agent"] = USER_AGENT;

            let request = Request.put({
                url: urlEncoded,
                headers: headers,
                proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                agentOptions: {
                    secureProtocol: that.proxy.secureProtocol
                }
            }).on("end", () => {
                that.logger.log("debug", LOG_ID + "(get) successfull");
                that.logger.log("debug", LOG_ID + "(get) get file buffer from Url");
                resolve("done");
            });

            stream.pipe(request);
            return request;
        });
    }

    delete(url, headers: any = {}, data : Object = undefined): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.method = that._delete.bind(this);
        req.params = arguments;
        req.label = "delete url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        return that.httpManager.add(req);
    }

    _delete(url, headers: any = {}, data : Object = undefined): Promise<any> {

        let that = this;

        return new Promise(function (resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            let body = data;
            headers["user-agent"] = USER_AGENT;

            that.logger.log("internal", LOG_ID + "(delete) url : ", urlEncoded, ", headers : ", headers, ", body : ", body);


            let deleteOptions = {
                url: urlEncoded,
                headers: headers,
                proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                agentOptions: {
                    secureProtocol: that.proxy.secureProtocol
                },
                body: undefined
            };

            if (body) {
                deleteOptions.body = body;
            }

            let request = Request.delete(deleteOptions, (error, response, body) => {
                if (error) {
                    return reject({
                        code: -1,
                        url: urlEncoded,
                        msg: "ErrorManager while requesting",
                        details: error,
                        headers: response ? response.headers:undefined
                    });
                } else {
                    if (response) {
                        that.logger.log("debug", LOG_ID + "(delete) HTTP code", response.code);
                        if (response.statusCode >= 200 && response.statusCode <= 206) {
                            let bodyjs = {};
                            if (response.body) {
                                bodyjs = JSON.parse(response.body);
                            }
                            resolve(bodyjs);
                        } else {
                            let bodyjs: any = {};
                            if (that.hasJsonStructure(response.body)) {
                                bodyjs = JSON.parse(response.body);
                            } else {
                                bodyjs.errorMsg = response.body;
                            }
                            that.tokenExpirationControl(bodyjs);
                            return reject({
                                code: response.statusCode,
                                url: urlEncoded,
                                msg: response.body ? response.body.errorMsg || "" : "",
                                details: response.body ? response.body.errorDetails || "" : "",
                                error: bodyjs,
                                headers: response ? response.headers:undefined
                            });
                        }
                    }
                }
            });

        });
    }
}

export {HTTPService};
module.exports.HTTPService = HTTPService;
