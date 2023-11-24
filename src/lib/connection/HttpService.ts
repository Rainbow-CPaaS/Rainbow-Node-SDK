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

//import HttpAgent, { HttpsAgent } from "agentkeepalive";
//const HttpAgent = require('agentkeepalive');
//const HttpsAgent = require('agentkeepalive').HttpsAgent;

let Agent = require('keepalive-proxy-agent');
//let Agent = require('agentkeepalive');

import got, {Agents, Got} from "got";
const _ = require('highland');
const { pipeline } = require('stream');
const urlLib = require('url');

//const {HttpsProxyAgent} = require("https-proxy-agent");

//import {HttpsProxyAgent} from 'hpagent';

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
    private mergedGot: Got;
    private reqAgent: any;
    private reqAgentHttp: any;
    private reqAgentHttps: any;
    public useRequestRateLimiter: boolean;

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
        this.mergedGot = got;

        if ( _options.requestsRate.useRequestRateLimiter !== undefined ) {
            that.useRequestRateLimiter = _options.requestsRate.useRequestRateLimiter;
        } else {
            that.useRequestRateLimiter = true;
        }

        // ***** Start lib 'keepalive-proxy-agent' *****

        const liveOption : any = {
            /**
             * Keep sockets around in a pool to be used by other requests in the future. Default = false
             */
            keepAlive: true, // ?: boolean | undefined;
            /**
             * When using HTTP KeepAlive, how often to send TCP KeepAlive packets over sockets being kept alive. Default = 1000.
             * Only relevant if keepAlive is set to true.
             */
            keepAliveMsecs: 1000, // ?: number | undefined;
            /**
             * Maximum number of sockets to allow per host. Default for Node 0.10 is 5, default for Node 0.12 is Infinity
             */
            maxSockets : Infinity, // ?: number | undefined;
            /**
             * Maximum number of sockets allowed for all hosts in total. Each request will use a new socket until the maximum is reached. Default: Infinity.
             */
            maxTotalSockets : Infinity, // ?: number | undefined;
            /**
             * Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Default = 256.
             */
            maxFreeSockets : 256, // ?: number | undefined;
            /**
             * Socket timeout in milliseconds. This will set the timeout after the socket is connected.
             */
            timeout : 60000, // ?: number | undefined;
            /**
             * Scheduling strategy to apply when picking the next free socket to use.
             * @default `lifo`
             */
            //scheduling?: "fifo" | "lifo" | undefined;


            /* keepAlive: true,
            //maxSockets: 10,
            maxSockets: Infinity,
            maxKeepAliveRequests: 0, // no limit on max requests per keepalive socket
            maxKeepAliveTime: 30000, // keepalive for 30 seconds
            maxFreeSockets: 30000, // free socket keepalive for 30 seconds
            // */
        };

        if (that.proxy.isProxyConfigured ) {
            if (that.proxy.secureProtocol) {
                //opt.secureProxy = true;
            }
            // Until web proxy on websocket solved, patch existing configuration to offer the proxy options
            liveOption.proxy = urlLib.parse(that.proxy.proxyURL);
        }

        this.reqAgentHttp = new Agent(liveOption);
        this.reqAgentHttps = this.reqAgentHttp;

        // ***** End lib 'keepalive-proxy-agent' *****


        /*
        // Start lib 'agentkeepalive'
        let _ENV = process.env;
        let _MAX_SOCKETS = parseInt(_ENV.NODE_MAX_SOCKETS, 10) || Infinity;
        let _SOCKET_TIMEOUT = parseInt(_ENV.NODE_SOCKET_TIMEOUT, 10) || 15 * 1000;

        let _AGENT_OPTIONS = {
            keepAlive: true,
            maxSockets: _MAX_SOCKETS,
            timeout: _SOCKET_TIMEOUT
        };

        if (that.proxy.isProxyConfigured ) {
            if (that.proxy.secureProtocol) {
                //opt.secureProxy = true;
            }
            // Until web proxy on websocket solved, patch existing configuration to offer the proxy options
            // @ts-ignore
            _AGENT_OPTIONS.proxy = urlLib.parse(that.proxy.proxyURL);
        }

        this.reqAgentHttp =  new Agent(_AGENT_OPTIONS);
        this.reqAgentHttps =  new Agent.HttpsAgent(_AGENT_OPTIONS);
        // End lib 'agentkeepalive'
        // */

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
                    if (!wasHandled && EventEmitter.listenerCount(response?.req, "response") === 0) {
                        response?.resume();
                    }

                    let status = response?.statusCode;
                    let s = status / 100 | 0;
                    that.logger.log("internal", LOG_ID + "  " + chalk[colorCodes[s]](status) + " ← " + signature + " " + chalk.gray(time(start)));
                })
                .on("error", function (err) {
                    that.logger.log("internalerror", LOG_ID + "  " + chalk.red("xxx") + " ← " + signature + " " + chalk.red(err.message));
                });
        }

        if (that.logger.logHttp) {

            const logger = got.extend({
                handlers: [
                    (options, next) => {
                        //that.logger.log("internalerror", LOG_ID + `Sending ${options.method} to ${options.url}`);
                        that.logger.log("internal", LOG_ID + chalk.red("DEBUG CONSOLE"), `Sending ${options.method} to ${options.url} \nheaders :`, options.headers, `\nresponseType : ${options.responseType}`, `\nbody : ${options.body}`);
                        return next(options);
                    }
                ]
            });

            try {
                that.mergedGot = got.extend(
                        logger,
                );
            } catch (error) {

            }

            // @ts-ignore
            let fnerror = console.error;
            console.error = function(error, url, line) {
                that.logger.log("debug", LOG_ID, chalk.red("DEBUG CONSOLE")  , ...arguments);
                //that.logger.log("debug", LOG_ID, chalk.red("DEBUG CONSOLE")  , {acc:'error', data:'ERR:'+error+' URL:'+url+' L:'+line});
                // fnerror(...arguments);
            };
            debugHttp(debugHandler);
            Request.debug = true;
        } else {
            try {
                that.mergedGot = got;
            } catch (error) {

            }
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
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            return that._getUrlRaw(url, headers, params);
        }
    }

    _getUrlRaw(url, headers: any = {}, params): Promise<any> {

        let that = this;

        return new Promise(function (resolve, reject) {

            try {
                headers["user-agent"] = USER_AGENT;
                let urlEncoded = url;

                that.logger.log("debug", LOG_ID + "(_getUrlRaw) url : ", ( url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g));
                that.logger.log("internal", LOG_ID + "(_getUrlRaw) url : ", url, ", headers : ", headers, ", params : ", params);

                if (that._options.restOptions.useGotLibForHttp) {
                    const newAliveAgent: any = () => {
                        let req = {
                            prefixUrl: "",
                            agent: {
                                http: undefined,
                                https: undefined
                                //http: agent,
                                //https: agent

                                //http: new HttpAgent(liveOption),
                                //https: new HttpsAgent(liveOption)
                                //
                            },
                            headers,
                            searchParams: params,
                            retry: {
                                limit: 0,
                                //limit: nbTryBeforeFailed,
                                //limit: 1,
                                // calculateDelay: ({retryObject}) => {
                                //     /* interface RetryObject {
                                //         attemptCount: number;
                                //         retryOptions: RetryOptions;
                                //         error: RequestError;
                                //         computedValue: number;
                                //         retryAfter?: number;
                                //     } of retryObject */
                                //     that.logger.warn("internal", LOG_ID + "(get) retry HTTP GET, timeBetweenRetry : ", timeBetweenRetry, "ms , retryObject : ", retryObject);
                                //     //return retryObject;
                                //     return timeBetweenRetry;
                                // },
                                calculateDelay: ({computedValue}) => computedValue,
                                methods: [
                                    'GET',
                                    'PUT',
                                    'HEAD',
                                    'DELETE',
                                    'OPTIONS',
                                    'TRACE'
                                ],
                                statusCodes: [
                                    408,
                                    413,
                                    429,
                                    500,
                                    502,
                                    503,
                                    504,
                                    521,
                                    522,
                                    524
                                ],
                                errorCodes: [
                                    'ETIMEDOUT',
                                    'ECONNRESET',
                                    'EADDRINUSE',
                                    'ECONNREFUSED',
                                    'EPIPE',
                                    'ENOTFOUND',
                                    'ENETUNREACH',
                                    'EAI_AGAIN'
                                ],
                                maxRetryAfter: undefined,
                                backoffLimit: Number.POSITIVE_INFINITY,
                                noise: 100
                            },
                            hooks: {
                                afterResponse: [
                                    (response, retryWithMergedOptions) => {
                                        let body;

                                        if (response) {
                                            if (response?.statusCode) {
                                                that.logger.log("info", LOG_ID + "(_getUrlRaw) HTTP statusCode defined : ", response.statusCode);
                                                if (response.statusCode >= 200 && response.statusCode <= 400) {
                                                    //if (response) {
                                                        //response.body = body;
                                                    //}
                                                    resolve(response);
                                                } else {
                                                    that.logger.warn("warn", LOG_ID + "(_getUrlRaw) HTTP response.code != 200");
                                                    that.logger.warn("internal", LOG_ID + "(_getUrlRaw) HTTP response.code != 200 , bodyjs : ", response?.body);
                                                    reject({
                                                        code: -1,
                                                        msg: "ErrorManager while requesting",
                                                        details: response,
                                                        headers: response ? response.headers:undefined
                                                    });
                                                }
                                            } else {
                                                reject({
                                                    code: -1,
                                                    msg: "ErrorManager while requesting _getUrlRaw no statusCode returned",
                                                    details: undefined,
                                                    headers: undefined
                                                });
                                            }
                                        } else {
                                            reject({
                                                code: -1,
                                                msg: "ErrorManager while requesting _getUrlRaw no response returned",
                                                details: undefined,
                                                headers: undefined
                                            });
                                        }
                                        return response;
                                    }
                                ],
                                beforeRetry: [
                                    error => {
                                        // This will be called on `retryWithMergedOptions(...)`
                                    }
                                ]
                            },
                        };

                        /*
                        if (responseType != "") {
                            req["responseType"] = responseType; // 'arraybuffer'
                        } // */

                        /*if (that.proxy.isProxyConfigured ) {
                            if (that.proxy.secureProtocol) {
                                //opt.secureProxy = true;
                            }
                            // Until web proxy on websocket solved, patch existing configuration to offer the proxy options
                            //options.agent = new HttpsProxyAgent(opt);

                            //let opt = urlLib.parse(that.proxy.proxyURL);
                            liveOption.proxy = urlLib.parse(that.proxy.proxyURL);

                            req.agent.http =  new Agent(liveOption);
                            req.agent.https = new Agent(liveOption);
                        } else {
                            req.agent.http =  new Agent(liveOption);
                            req.agent.https = new Agent(liveOption);
                        } // */

                        req.agent.http = that.reqAgentHttp;
                        req.agent.https = that.reqAgentHttps;
                        // @ts-ignore
                        // req.agent = false;

                        return req;
                    };

                    try {

                        const secondInstance = that.mergedGot.extend({mutableDefaults: true});
                        /*secondInstance.defaults.options.hooks = defaults.hooks;
                        secondInstance.defaults.options.retry = defaults.retry;
                        secondInstance.defaults.options.pagination = defaults.pagination; // */


                        let response = secondInstance.get(urlEncoded, newAliveAgent()).catch((error) => {
                            that.logger.warn("internal", LOG_ID + "(_getUrlRaw) error.code : ", error?.code, ", urlEncoded : ", urlEncoded);
                        });
                        that.logger.log("info", LOG_ID + "(_getUrlRaw) done.");

                        /*
                        if (response?.headers && (response?.headers["content-type"]).indexOf("application/json") === 0 ) {
                            resolve(JSON.parse(response?.body));
                        } else {
                            resolve(response?.rawBody);
                        } // */
                    } catch (error) {
                        //
                        //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                        //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                        //
                        that.logger.warn("warn", LOG_ID + "(_getUrlRaw) HTTP error.");
                        that.logger.warn("internal", LOG_ID + "(_getUrlRaw) HTTP error statusCode : ", error?.statusCode);
                    }

                    return;
                }




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
                    that.logger.log("info", LOG_ID + "(_getUrlRaw) successfull");
                    if (error) {
                        return reject({
                            code: -1,
                            msg: "ErrorManager while requesting",
                            details: error,
                            headers: response ? response.headers:undefined
                        });
                    } else {
                        //if (response) {
                          //  response.body = body;
                        //}
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
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            return that._headUrlRaw(url, headers);
        }
    }

    _headUrlRaw(url, headers: any = {}): Promise<any> {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
                let urlEncoded = url;
                headers["user-agent"] = USER_AGENT;

                that.logger.log("internal", LOG_ID + "(_headUrlRaw) url : ", urlEncoded, ", headers : ", headers);



                if (that._options.restOptions.useGotLibForHttp) {
                    const newAliveAgent: any = () => {
                        let req = {
                            prefixUrl: "",
                            agent: {
                                http: undefined,
                                https: undefined
                                //http: agent,
                                //https: agent

                                //http: new HttpAgent(liveOption),
                                //https: new HttpsAgent(liveOption)
                                //
                            },
                            headers,
                            //body,
                            //searchParams: params,
                            retry: {
                                limit: 0,
                                //limit: 1,
                                // calculateDelay: ({retryObject}) => {
                                //     /* interface RetryObject {
                                //         attemptCount: number;
                                //         retryOptions: RetryOptions;
                                //         error: RequestError;
                                //         computedValue: number;
                                //         retryAfter?: number;
                                //     } of retryObject */
                                //     that.logger.warn("internal", LOG_ID + "(head) retry HTTP HEAD, retryObject : ", retryObject);
                                //     //return retryObject;
                                //     return 1000;
                                // },
                                calculateDelay: ({computedValue}) => computedValue,
                                methods: [
                                    'GET',
                                    'PUT',
                                    'HEAD',
                                    'DELETE',
                                    'OPTIONS',
                                    'TRACE'
                                ],
                                statusCodes: [
                                    408,
                                    413,
                                    429,
                                    500,
                                    502,
                                    503,
                                    504,
                                    521,
                                    522,
                                    524
                                ],
                                errorCodes: [
                                    'ETIMEDOUT',
                                    'ECONNRESET',
                                    'EADDRINUSE',
                                    'ECONNREFUSED',
                                    'EPIPE',
                                    'ENOTFOUND',
                                    'ENETUNREACH',
                                    'EAI_AGAIN'
                                ],
                                maxRetryAfter: undefined,
                                backoffLimit: Number.POSITIVE_INFINITY,
                                noise: 100
                            },
                            hooks: {
                                afterResponse: [
                                    (response, retryWithMergedOptions) => {
                                        let body;

                                        if (response) {
                                            if (response?.statusCode) {
                                                that.logger.log("info", LOG_ID + "(_headUrlRaw) HTTP statusCode defined : ", response.statusCode);
                                                if (response.statusCode >= 200 && response.statusCode <= 400) {
                                                    //if (response) {
                                                    //    response.body = body;
                                                    //}
                                                    resolve(response);
                                                } else {
                                                    that.logger.warn("warn", LOG_ID + "(_headUrlRaw) HTTP response.code != 200");
                                                    that.logger.warn("internal", LOG_ID + "(_headUrlRaw) HTTP response.code != 200 , bodyjs : ", response?.body);
                                                    reject({
                                                        code: -1,
                                                        msg: "ErrorManager while requesting _headUrlRaw",
                                                        details: response,
                                                        headers: response ? response.headers:undefined
                                                    });
                                                }
                                            } else {
                                                reject({
                                                    code: -1,
                                                    msg: "ErrorManager while requesting _headUrlRaw no statusCode returned",
                                                    details: undefined,
                                                    headers: undefined
                                                });
                                            }
                                        } else {
                                            reject({
                                                code: -1,
                                                msg: "ErrorManager while requesting _headUrlRaw no response returned",
                                                details: undefined,
                                                headers: undefined
                                            });
                                        }
                                        return response;
                                    }
                                ],
                                beforeRetry: [
                                    error => {
                                        // This will be called on `retryWithMergedOptions(...)`
                                    }
                                ]
                            },
                        };

                        req.agent.http = that.reqAgentHttp;
                        req.agent.http = that.reqAgentHttps;
                        // @ts-ignore
                        // req.agent = false;

                        return req;
                    };

                    try {

                        const secondInstance = that.mergedGot.extend({mutableDefaults: true});
                        /*secondInstance.defaults.options.hooks = defaults.hooks;
                        secondInstance.defaults.options.retry = defaults.retry;
                        secondInstance.defaults.options.pagination = defaults.pagination; // */


                        let response = secondInstance.head(urlEncoded, newAliveAgent()).catch((error) => {
                            that.logger.warn("internal", LOG_ID + "(head) error.code : ", error?.code, ", urlEncoded : ", urlEncoded);
                        });
                        that.logger.log("info", LOG_ID + "(head) done.");

                    } catch (error) {
                        //
                        //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                        //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                        //
                        that.logger.warn("warn", LOG_ID + "(head) HTTP error.");
                        that.logger.warn("internal", LOG_ID + "(head) HTTP error statusCode : ", error?.statusCode);
                    }

                    return;
                }
// */



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
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            return that._postUrlRaw(url, headers, data);
        }
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

                if (that._options.restOptions.useGotLibForHttp) {
                    const newAliveAgent: any = () => {
                        let req = {
                            prefixUrl: "",
                            agent: {
                                http: undefined,
                                https: undefined
                                //http: agent,
                                //https: agent

                                //http: new HttpAgent(liveOption),
                                //https: new HttpsAgent(liveOption)
                                //
                            },
                            headers,
                            body,
                            //searchParams: params,
                            hooks: {
                                afterResponse: [
                                    (response, retryWithMergedOptions) => {
                                        let body;

                                        if (response) {
                                            if (response?.statusCode) {
                                                that.logger.log("info", LOG_ID + "(_postUrlRaw) HTTP statusCode defined : ", response.statusCode);
                                                if (response.statusCode >= 200 && response.statusCode <= 400) {
                                                    //if (response) {
                                                      //  response.body = body;
                                                    //}
                                                    resolve(response);
                                                } else {
                                                    that.logger.warn("warn", LOG_ID + "(_postUrlRaw) HTTP response.code != 200");
                                                    that.logger.warn("internal", LOG_ID + "(_postUrlRaw) HTTP response.code != 200 , bodyjs : ", response?.body);
                                                    reject({
                                                        code: -1,
                                                        msg: "ErrorManager while requesting _postUrlRaw",
                                                        details: response,
                                                        headers: response ? response.headers:undefined
                                                    });
                                                }
                                            } else {
                                                reject({
                                                    code: -1,
                                                    msg: "ErrorManager while requesting _postUrlRaw no statusCode returned",
                                                    details: undefined,
                                                    headers: undefined
                                                });
                                            }
                                        } else {
                                            reject({
                                                code: -1,
                                                msg: "ErrorManager while requesting _postUrlRaw no response returned",
                                                details: undefined,
                                                headers: undefined
                                            });
                                        }
                                        return response;
                                    }
                                ],
                            },
                        };

                        req.agent.http = that.reqAgentHttp;
                        req.agent.http = that.reqAgentHttps;
                        // @ts-ignore
                        // req.agent = false;

                        return req;
                    };

                    try {

                        const secondInstance = that.mergedGot.extend({mutableDefaults: true});
                        /*secondInstance.defaults.options.hooks = defaults.hooks;
                        secondInstance.defaults.options.retry = defaults.retry;
                        secondInstance.defaults.options.pagination = defaults.pagination; // */


                        let response = secondInstance.post(urlEncoded, newAliveAgent()).catch((error) => {
                            that.logger.warn("internal", LOG_ID + "(_postUrlRaw) error.code : ", error?.code, ", urlEncoded : ", urlEncoded);
                        });
                        that.logger.log("info", LOG_ID + "(_postUrlRaw) done.");

                    } catch (error) {
                        //
                        //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                        //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                        //
                        that.logger.warn("warn", LOG_ID + "(_postUrlRaw) HTTP error.");
                        that.logger.warn("internal", LOG_ID + "(_postUrlRaw) HTTP error statusCode : ", error?.statusCode);
                    }

                    return;
                }
// */


                Request({
                    method: 'POST',
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
                    that.logger.log("info", LOG_ID + "(_postUrlRaw) successfull");
                    that.logger.log("internal", LOG_ID + "(_postUrlRaw) successfull - error : ", error, ", body : ", body);
                    if (error) {
                        return reject({
                            code: -1,
                            msg: "ErrorManager while posting",
                            details: error,
                            headers: response ? response.headers:undefined
                        });
                    } else {
                        //if (response) {
                          //  response.body = body;
                        //}
                        resolve(response);
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
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            return that._putUrlRaw(url, headers, data);
        }
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
                //that.logger.log("internal", LOG_ID + "(_putUrlRaw) url : ", urlEncoded);
                if (that._options.restOptions.useGotLibForHttp) {
                    const newAliveAgent: any = () => {
                        let req = {
                            prefixUrl: "",
                            agent: {
                                http: undefined,
                                https: undefined
                                //http: agent,
                                //https: agent

                                //http: new HttpAgent(liveOption),
                                //https: new HttpsAgent(liveOption)
                                //
                            },
                            headers,
                            body,
                            //searchParams: params,
                            hooks: {
                                afterResponse: [
                                    (response, retryWithMergedOptions) => {
                                        let body;

                                        if (response) {
                                            if (response?.statusCode) {
                                                that.logger.log("info", LOG_ID + "(_putUrlRaw) HTTP statusCode defined : ", response.statusCode);
                                                if (response.statusCode >= 200 && response.statusCode <= 400) {
                                                    //if (response) {
                                                    //  response.body = body;
                                                    //}
                                                    resolve(response);
                                                } else {
                                                    that.logger.warn("warn", LOG_ID + "(_putUrlRaw) HTTP response.code != 200");
                                                    that.logger.warn("internal", LOG_ID + "(_putUrlRaw) HTTP response.code != 200 , bodyjs : ", response?.body);
                                                    reject({
                                                        code: -1,
                                                        msg: "ErrorManager while requesting _putBuffer",
                                                        details: response,
                                                        headers: response ? response.headers:undefined
                                                    });
                                                }
                                            } else {
                                                reject({
                                                    code: -1,
                                                    msg: "ErrorManager while requesting _putUrlRaw no statusCode returned",
                                                    details: undefined,
                                                    headers: undefined
                                                });
                                            }
                                        } else {
                                            reject({
                                                code: -1,
                                                msg: "ErrorManager while requesting _putUrlRaw no response returned",
                                                details: undefined,
                                                headers: undefined
                                            });
                                        }
                                        return response;
                                    }
                                ],
                            },
                        };

                        req.agent.http = that.reqAgentHttp;
                        req.agent.http = that.reqAgentHttps;
                        // @ts-ignore
                        // req.agent = false;

                        return req;
                    };

                    try {

                        const secondInstance = that.mergedGot.extend({mutableDefaults: true});

                        let response = secondInstance.put(urlEncoded, newAliveAgent()).catch((error) => {
                            that.logger.warn("internal", LOG_ID + "(_putUrlRaw) error.code : ", error?.code, ", urlEncoded : ", urlEncoded);
                        });
                        that.logger.log("info", LOG_ID + "(_putUrlRaw) done.");

                    } catch (error) {
                        //
                        //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                        //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                        //
                        that.logger.warn("warn", LOG_ID + "(_putUrlRaw) HTTP error.");
                        that.logger.warn("internal", LOG_ID + "(_putUrlRaw) HTTP error statusCode : ", error?.statusCode);
                    }

                    return;
                }

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
                        //if (response) {
                        //    response.body = body;
                        //}
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
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            return that._deleteUrlRaw(url, headers, data);
        }

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

                if (that._options.restOptions.useGotLibForHttp) {
                    const newAliveAgent: any = () => {
                        let req: any = {
                            prefixUrl: "",
                            agent: {
                                http: undefined,
                                https: undefined
                                //http: agent,
                                //https: agent

                                //http: new HttpAgent(liveOption),
                                //https: new HttpsAgent(liveOption)
                                //
                            },
                            headers,
                            // body,
                            //searchParams: params,
                            retry: {
                                limit: 0,
                                //limit: 1,
                                // calculateDelay: ({retryObject}) => {
                                //     /* interface RetryObject {
                                //         attemptCount: number;
                                //         retryOptions: RetryOptions;
                                //         error: RequestError;
                                //         computedValue: number;
                                //         retryAfter?: number;
                                //     } of retryObject */
                                //     that.logger.warn("internal", LOG_ID + "(delete) retry HTTP GET, retryObject : ", retryObject);
                                //     //return retryObject;
                                //     return 1000;
                                // },
                                calculateDelay: ({computedValue}) => computedValue,
                                methods: [
                                    'GET',
                                    'PUT',
                                    'HEAD',
                                    'DELETE',
                                    'OPTIONS',
                                    'TRACE'
                                ],
                                statusCodes: [
                                    408,
                                    413,
                                    429,
                                    500,
                                    502,
                                    503,
                                    504,
                                    521,
                                    522,
                                    524
                                ],
                                errorCodes: [
                                    'ETIMEDOUT',
                                    'ECONNRESET',
                                    'EADDRINUSE',
                                    'ECONNREFUSED',
                                    'EPIPE',
                                    'ENOTFOUND',
                                    'ENETUNREACH',
                                    'EAI_AGAIN'
                                ],
                                maxRetryAfter: undefined,
                                backoffLimit: Number.POSITIVE_INFINITY,
                                noise: 100
                            },
                            hooks: {
                                afterResponse: [
                                    (response, retryWithMergedOptions) => {
                                        let body;

                                        if (response) {
                                            if (response?.statusCode) {
                                                that.logger.log("info", LOG_ID + "(_deleteUrlRaw) HTTP code", response.code);
                                                if (response.statusCode >= 200 && response.statusCode <= 400) {
                                                    //if (response) {
                                                      //  response.body = body;
                                                    //}
                                                    resolve(response);
                                                } else {
                                                    reject({
                                                        code: -1,
                                                        msg: "ErrorManager while posting",
                                                        details: response,
                                                        headers: response ? response.headers:undefined
                                                    });
                                                }
                                            } else {
                                                if (response.error && response.error.reason) {
                                                    that.logger.log("error", LOG_ID + "(_deleteUrlRaw) HTTP security issue", response.error.reason);
                                                    reject({
                                                        code: -1,
                                                        url: urlEncoded,
                                                        msg: response.error.reason,
                                                        details: "",
                                                        headers: response ? response.headers:undefined
                                                    });
                                                } else {
                                                    that.logger.warn("error", LOG_ID + "(_deleteUrlRaw) HTTP other issue.");
                                                    that.logger.warn("internalerror", LOG_ID + "(_deleteUrlRaw) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                                    that.logger.log("internal", LOG_ID + "(_deleteUrlRaw) HTTP other issue", response);
                                                    reject({
                                                        code: -1,
                                                        url: urlEncoded,
                                                        msg: "Unknown error",
                                                        details: response,
                                                        headers: response ? response.headers:undefined
                                                    });
                                                }
                                            }
                                        } else {
                                            reject({
                                                code: -1,
                                                msg: "ErrorManager while requesting _deleteUrlRaw no response returned",
                                                details: undefined,
                                                headers: undefined
                                            });
                                        }
                                        // No changes otherwise
                                        return response;
                                    }
                                ],
                                beforeRetry: [
                                    error => {
                                        // This will be called on `retryWithMergedOptions(...)`
                                    }
                                ]
                            },
                        };

                        if (body) {
                            req.body = body;
                        }

                        req.agent.http = that.reqAgentHttp;
                        req.agent.http = that.reqAgentHttps;
                        // @ts-ignore
                        // req.agent = false;

                        return req;
                    };

                    try {

                        const secondInstance = that.mergedGot.extend({mutableDefaults: true});
                        /*secondInstance.defaults.options.hooks = defaults.hooks;
                        secondInstance.defaults.options.retry = defaults.retry;
                        secondInstance.defaults.options.pagination = defaults.pagination; // */


                        let response = secondInstance.delete(urlEncoded, newAliveAgent()).catch((error) => {
                            that.logger.warn("internal", LOG_ID + "(_deleteUrlRaw) error.code : ", error?.code, ", urlEncoded : ", urlEncoded);
                        });
                        that.logger.log("info", LOG_ID + "(_deleteUrlRaw) done.");

                    } catch (error) {
                        //
                        //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                        //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                        //
                        that.logger.warn("warn", LOG_ID + "(_deleteUrlRaw) HTTP error.");
                        that.logger.warn("internal", LOG_ID + "(_deleteUrlRaw) HTTP error statusCode : ", error?.statusCode);
                    }

                    return;
                }
// */



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
                            msg: "ErrorManager while deleting",
                            details: error,
                            headers: response ? response.headers:undefined
                        });
                    } else {
                        //if (response) {
                         //   response.body = body;
                        //}
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
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            return that._getUrlJson(url, headers, params);
        }
    }

    _getUrlJson(url, headers: any = {}, params): Promise<any> {

        let that = this;

        return new Promise(function (resolve, reject) {

            try {
                headers["user-agent"] = USER_AGENT;
                let urlEncoded = url;

                that.logger.log("debug", LOG_ID + "(_getUrlJson) url : ", ( url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g));
                that.logger.log("internal", LOG_ID + "(_getUrlJson) url : ", url, ", headers : ", headers, ", params : ", params);

                if (that._options.restOptions.useGotLibForHttp) {
                    const newAliveAgent: any = () => {
                        let req = {
                            prefixUrl: "",
                            agent: {
                                http: undefined,
                                https: undefined
                                //http: agent,
                                //https: agent

                                //http: new HttpAgent(liveOption),
                                //https: new HttpsAgent(liveOption)
                                //
                            },
                            headers,
                            searchParams: params,
                            retry: {
                                limit: 0,
                                //limit: nbTryBeforeFailed,
                                //limit: 1,
                                // calculateDelay: ({retryObject}) => {
                                //     /* interface RetryObject {
                                //         attemptCount: number;
                                //         retryOptions: RetryOptions;
                                //         error: RequestError;
                                //         computedValue: number;
                                //         retryAfter?: number;
                                //     } of retryObject */
                                //     that.logger.warn("internal", LOG_ID + "(get) retry HTTP GET, timeBetweenRetry : ", timeBetweenRetry, "ms , retryObject : ", retryObject);
                                //     //return retryObject;
                                //     return timeBetweenRetry;
                                // },
                                calculateDelay: ({computedValue}) => computedValue,
                                methods: [
                                    'GET',
                                    'PUT',
                                    'HEAD',
                                    'DELETE',
                                    'OPTIONS',
                                    'TRACE'
                                ],
                                statusCodes: [
                                    408,
                                    413,
                                    429,
                                    500,
                                    502,
                                    503,
                                    504,
                                    521,
                                    522,
                                    524
                                ],
                                errorCodes: [
                                    'ETIMEDOUT',
                                    'ECONNRESET',
                                    'EADDRINUSE',
                                    'ECONNREFUSED',
                                    'EPIPE',
                                    'ENOTFOUND',
                                    'ENETUNREACH',
                                    'EAI_AGAIN'
                                ],
                                maxRetryAfter: undefined,
                                backoffLimit: Number.POSITIVE_INFINITY,
                                noise: 100
                            },
                            hooks: {
                                afterResponse: [
                                    (response, retryWithMergedOptions) => {
                                        let body;

                                        if (response) {
                                            if (response?.statusCode) {
                                                that.logger.log("info", LOG_ID + "(_getUrlJson) HTTP statusCode defined : ", response.statusCode);
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
                                                        reject({
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
                                                    let msg = response.statusMessage ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                                    let errorMsgDetail = bodyjs ? bodyjs.errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:"" || ""):"";
                                                    errorMsgDetail = errorMsgDetail ? errorMsgDetail:bodyjs ? bodyjs.errorMsg || "":"";
                                                    //that.tokenExpirationControl(bodyjs);
                                                    reject({
                                                        code: response.statusCode,
                                                        msg: msg,
                                                        details: errorMsgDetail,
                                                        error: bodyjs,
                                                        headers: response ? response.headers:undefined
                                                    });

                                                }
                                            } else {
                                                reject({
                                                    code: -1,
                                                    msg: "ErrorManager while requesting _getUrlJson no statusCode returned",
                                                    details: undefined,
                                                    headers: undefined
                                                });
                                            }
                                        } else {
                                            reject({
                                                code: -1,
                                                msg: "ErrorManager while requesting _getUrlJson no response returned",
                                                details: undefined,
                                                headers: undefined
                                            });
                                        }
                                        return response;
                                    }
                                ],
                                beforeRetry: [
                                    error => {
                                        // This will be called on `retryWithMergedOptions(...)`
                                    }
                                ]
                            },
                        };

                        /*
                        if (responseType != "") {
                            req["responseType"] = responseType; // 'arraybuffer'
                        } // */

                        /*if (that.proxy.isProxyConfigured ) {
                            if (that.proxy.secureProtocol) {
                                //opt.secureProxy = true;
                            }
                            // Until web proxy on websocket solved, patch existing configuration to offer the proxy options
                            //options.agent = new HttpsProxyAgent(opt);

                            //let opt = urlLib.parse(that.proxy.proxyURL);
                            liveOption.proxy = urlLib.parse(that.proxy.proxyURL);

                            req.agent.http =  new Agent(liveOption);
                            req.agent.https = new Agent(liveOption);
                        } else {
                            req.agent.http =  new Agent(liveOption);
                            req.agent.https = new Agent(liveOption);
                        } // */

                        req.agent.http = that.reqAgentHttp;
                        req.agent.http = that.reqAgentHttps;
                        // @ts-ignore
                        // req.agent = false;

                        return req;
                    };

                    try {

                        const secondInstance = that.mergedGot.extend({mutableDefaults: true});
                        /*secondInstance.defaults.options.hooks = defaults.hooks;
                        secondInstance.defaults.options.retry = defaults.retry;
                        secondInstance.defaults.options.pagination = defaults.pagination; // */


                        let response = secondInstance.get(urlEncoded, newAliveAgent()).catch((error) => {
                            that.logger.warn("internal", LOG_ID + "(get) error.code : ", error?.code, ", urlEncoded : ", urlEncoded);
                        });
                        that.logger.log("info", LOG_ID + "(get) done.");

                        /*
                        if (response?.headers && (response?.headers["content-type"]).indexOf("application/json") === 0 ) {
                            resolve(JSON.parse(response?.body));
                        } else {
                            resolve(response?.rawBody);
                        } // */
                    } catch (error) {
                        //
                        //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                        //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                        //
                        that.logger.warn("warn", LOG_ID + "(get) HTTP error.");
                        that.logger.warn("internal", LOG_ID + "(get) HTTP error statusCode : ", error?.statusCode);
                    }

                    return;
                }


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

    get(url, headers: any = {}, params, responseType = "", nbTryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.method = that._get.bind(this);
        req.params = arguments;
        req.label = "get url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            return that._get(url, headers, params, responseType, nbTryBeforeFailed, timeBetweenRetry);
        }
    }

    _get(url,headers: any = {}, params, responseType = "", nbTryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {
        let that = this;

        return new Promise(async function (resolve, reject) {
            try {
                headers["user-agent"] = USER_AGENT;
                that.logger.log("debug", LOG_ID + "(get) url : ", (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g));
                that.logger.log("internal", LOG_ID + "(get) url : ", that.serverURL + url, ", headers : ", headers, ", params : ", params);

                //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
                let urlEncoded = that.serverURL + url;

                if (headers.Accept && headers?.Accept?.indexOf("json") > -1) {

                    if (that._options.restOptions.useGotLibForHttp) {
                        const newAliveAgent: any = () => {
                            let req = {
                                prefixUrl: "",
                                agent: {
                                    http: undefined,
                                    https: undefined
                                    //http: agent,
                                    //https: agent

                                    //http: new HttpAgent(liveOption),
                                    //https: new HttpsAgent(liveOption)
                                    //
                                },
                                headers,
                                searchParams: params,
                                retry: {
                                    limit: 0,
                                    //limit: nbTryBeforeFailed,
                                    //limit: 1,
                                    // calculateDelay: ({retryObject}) => {
                                    //     /* interface RetryObject {
                                    //         attemptCount: number;
                                    //         retryOptions: RetryOptions;
                                    //         error: RequestError;
                                    //         computedValue: number;
                                    //         retryAfter?: number;
                                    //     } of retryObject */
                                    //     that.logger.warn("internal", LOG_ID + "(get) retry HTTP GET, timeBetweenRetry : ", timeBetweenRetry, "ms , retryObject : ", retryObject);
                                    //     //return retryObject;
                                    //     return timeBetweenRetry;
                                    // },
                                    calculateDelay: ({computedValue}) => computedValue,
                                    methods: [
                                        'GET',
                                        'PUT',
                                        'HEAD',
                                        'DELETE',
                                        'OPTIONS',
                                        'TRACE'
                                    ],
                                    statusCodes: [
                                        408,
                                        413,
                                        429,
                                        500,
                                        502,
                                        503,
                                        504,
                                        521,
                                        522,
                                        524
                                    ],
                                    errorCodes: [
                                        'ETIMEDOUT',
                                        'ECONNRESET',
                                        'EADDRINUSE',
                                        'ECONNREFUSED',
                                        'EPIPE',
                                        'ENOTFOUND',
                                        'ENETUNREACH',
                                        'EAI_AGAIN'
                                    ],
                                    maxRetryAfter: undefined,
                                    backoffLimit: Number.POSITIVE_INFINITY,
                                    noise: 100
                                },
                                hooks: {
                                    afterResponse: [
                                        (response, retryWithMergedOptions) => {
                                            let body;

                                            if (response?.statusCode >= 200 && response?.statusCode <= 206) {
                                                if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                                    if (response?.headers && (response?.headers["content-type"]).indexOf("application/json")===0) {
                                                        resolve(JSON.parse(response?.body));
                                                    } else {
                                                        resolve(response.body);
                                                    }
                                                } else {
                                                    let responseRequest = {
                                                        code: -1,
                                                        url: urlEncoded,
                                                        msg: "Bad content, please check your host",
                                                        details: "",
                                                        headers: response ? response.headers:undefined
                                                    };
                                                    reject(responseRequest);
                                                }
                                            } else {
                                                that.logger.warn("warn", LOG_ID + "(get) afterResponseHTTP response.code != 200");
                                                that.logger.warn("internal", LOG_ID + "(get) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", bodyjs : ", response.body);
                                                that.logger.warn("internal", LOG_ID + "(get) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", response.headers : ", response.headers, ", response.statusMessage : ", response.statusMessage);
                                                let bodyjs: any = {};
                                                if (that.hasJsonStructure(response.body)) {
                                                    bodyjs = JSON.parse(response.body);
                                                } else {
                                                    bodyjs.errorMsg = response.body;
                                                }
                                                let msg = (response && response.statusMessage) ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                                let errorMsgDetail = bodyjs ? bodyjs.errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:"" || ""):"";
                                                errorMsgDetail = errorMsgDetail ? errorMsgDetail:bodyjs ? bodyjs.errorMsg || "":"";
                                                that.tokenExpirationControl(bodyjs);
                                                let responseRequest = {
                                                    code: response?.statusCode,
                                                    url: urlEncoded,
                                                    msg: msg,
                                                    details: errorMsgDetail,
                                                    error: bodyjs,
                                                    headers: response?.headers
                                                };

                                                // error.response.body
                                                reject(responseRequest);

                                                /*
                                                // Unauthorized
                                                if (response.statusCode === 401) {
                                                    // Refresh the access token
                                                    const updatedOptions = {
                                                        headers: {
                                                            token: getNewToken()
                                                        }
                                                    };

                                                    // Update the defaults
                                                    instance.defaults.options.merge(updatedOptions);

                                                    // Make a new retry
                                                    return retryWithMergedOptions(updatedOptions);
                                                }

                                                // */
                                            }
                                            // No changes otherwise
                                            return response;
                                        }
                                    ],
                                    beforeRetry: [
                                        error => {
                                            // This will be called on `retryWithMergedOptions(...)`
                                        }
                                    ]
                                },
                            };

                            if (responseType!="") {
                                req["responseType"] = responseType; // 'arraybuffer'
                            }

                            /*if (that.proxy.isProxyConfigured ) {
                                if (that.proxy.secureProtocol) {
                                    //opt.secureProxy = true;
                                }
                                // Until web proxy on websocket solved, patch existing configuration to offer the proxy options
                                //options.agent = new HttpsProxyAgent(opt);

                                //let opt = urlLib.parse(that.proxy.proxyURL);
                                liveOption.proxy = urlLib.parse(that.proxy.proxyURL);

                                req.agent.http =  new Agent(liveOption);
                                req.agent.https = new Agent(liveOption);
                            } else {
                                req.agent.http =  new Agent(liveOption);
                                req.agent.https = new Agent(liveOption);
                            } // */

                            req.agent.http = that.reqAgentHttp;
                            req.agent.http = that.reqAgentHttps;
                            // @ts-ignore
                            // req.agent = false;
                            return req;
                        };

                        try {

                            const secondInstance = that.mergedGot.extend({mutableDefaults: true});
                            /*secondInstance.defaults.options.hooks = defaults.hooks;
                            secondInstance.defaults.options.retry = defaults.retry;
                            secondInstance.defaults.options.pagination = defaults.pagination; // */


                            let response = secondInstance.get(urlEncoded, newAliveAgent()).catch((error) => {
                                that.logger.warn("internal", LOG_ID + "(get) error.code : ", error?.code, ", urlEncoded : ", urlEncoded);
                            });
                            that.logger.log("info", LOG_ID + "(get) done.");

                            /*
                            if (response?.headers && (response?.headers["content-type"]).indexOf("application/json") === 0 ) {
                                resolve(JSON.parse(response?.body));
                            } else {
                                resolve(response?.rawBody);
                            } // */
                        } catch (error) {
                            //
                            //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                            //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                            //
                            that.logger.warn("warn", LOG_ID + "(get) HTTP error.");
                            that.logger.warn("internal", LOG_ID + "(get) HTTP error statusCode : ", error?.statusCode);
                        }

                        return;
                    }
// */

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

                    for (let i = 0; i < nbTryBeforeFailed + 1 ; i++) {
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
                            if ( (i ) < nbTryBeforeFailed) {
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
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            return that._post(url, headers, data, contentType);
        }
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


            if (that._options.restOptions.useGotLibForHttp) {
                const newAliveAgent: any = () => {
                    let req = {
                        prefixUrl: "",
                        agent: {
                            http: undefined,
                            https: undefined
                            //http: agent,
                            //https: agent

                            //http: new HttpAgent(liveOption),
                            //https: new HttpsAgent(liveOption)
                            //
                        },
                        headers,
                        body,
                        //searchParams: params,
                        hooks: {
                            afterResponse: [
                                (response, retryWithMergedOptions) => {
                                    let body;

                                    if (response?.statusCode) {
                                        if (response?.statusCode >= 200 && response?.statusCode <= 206) {
                                            if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                                if (response?.headers && (response?.headers["content-type"]).indexOf("application/json")===0) {
                                                    resolve(JSON.parse(response?.body));
                                                } else {
                                                    resolve(response.body);
                                                }
                                            } else {
                                                let responseRequest = {
                                                    code: -1,
                                                    url: urlEncoded,
                                                    msg: "Bad content, please check your host",
                                                    details: "",
                                                    headers: response ? response.headers:undefined
                                                };
                                                reject(responseRequest);
                                            }
                                        } else {
                                            that.logger.warn("warn", LOG_ID + "(post) afterResponseHTTP response.code != 200");
                                            that.logger.warn("internal", LOG_ID + "(post) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", bodyjs : ", response.body);
                                            that.logger.warn("internal", LOG_ID + "(post) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", response.headers : ", response.headers, ", response.statusMessage : ", response.statusMessage);
                                            let bodyjs: any = {};
                                            if (that.hasJsonStructure(response.body)) {
                                                bodyjs = JSON.parse(response.body);
                                            } else {
                                                bodyjs.errorMsg = response.body;
                                            }

                                            that.logger.warn("warn", LOG_ID + "(post) HTTP response.code != 200 ");
                                            that.logger.warn("internal", LOG_ID + "(post) HTTP response.code != 200 , body : ", bodyjs);
                                            let msg = response.statusMessage ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                            let errorDetails = bodyjs.errorDetails;
                                            if (errorDetails) {
                                                if (typeof errorDetails==="object") {
                                                    // errorDetails = JSON.stringify(errorDetails);
                                                    errorDetails = util.inspect(errorDetails, false, 4, true);
                                                }
                                            }
                                            let errorMsgDetail = bodyjs ? errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:"" || ""):"";
                                            errorMsgDetail = errorMsgDetail ? errorMsgDetail:bodyjs ? bodyjs.errorMsg || "":"";

                                            that.tokenExpirationControl(bodyjs);
                                            let responseRequest = {
                                                code: response?.statusCode,
                                                url: urlEncoded,
                                                msg: msg,
                                                details: errorMsgDetail,
                                                error: bodyjs,
                                                headers: response?.headers
                                            };

                                            // error.response.body
                                            reject(responseRequest);
                                        }
                                    } else {
                                        if (response.error && response.error.reason) {
                                            that.logger.log("error", LOG_ID + "(post) HTTP security issue", response.error.reason);
                                            reject({
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
                                            reject({
                                                code: -1,
                                                url: urlEncoded,
                                                msg: "Unknown error",
                                                details: response,
                                                headers: response ? response.headers:undefined
                                            });
                                        }
                                    }
                                    // No changes otherwise
                                    return response;
                                }
                            ],
                        },
                    };

                    req.agent.http = that.reqAgentHttp;
                    req.agent.http = that.reqAgentHttps;
                    // @ts-ignore
                    // req.agent = false;

                    return req;
                };

                try {

                    const secondInstance = that.mergedGot.extend({mutableDefaults: true});
                    /*secondInstance.defaults.options.hooks = defaults.hooks;
                    secondInstance.defaults.options.retry = defaults.retry;
                    secondInstance.defaults.options.pagination = defaults.pagination; // */


                    let response = secondInstance.post(urlEncoded, newAliveAgent()).catch((error) => {
                        that.logger.warn("internal", LOG_ID + "(post) error.code : ", error?.code, ", urlEncoded : ", urlEncoded);
                    });
                    that.logger.log("info", LOG_ID + "(post) done.");

                } catch (error) {
                    //
                    //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                    //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                    //
                    that.logger.warn("warn", LOG_ID + "(post) HTTP error.");
                    that.logger.warn("internal", LOG_ID + "(post) HTTP error statusCode : ", error?.statusCode);
                }

                return;
            }
// */







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
                    that.logger.log("internalerror", LOG_ID + "(post) failed:", error, ", url:", urlEncoded, ", response : ", response);
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
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            return that._head(url, headers);
        }
    }

    _head(url, headers: any = {}): Promise<any> {
        let that = this;

        return new Promise(function (resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;
            headers["user-agent"] = USER_AGENT;

            that.logger.log("internal", LOG_ID + "(head) url : ", urlEncoded, ", headers : ", headers);


            if (that._options.restOptions.useGotLibForHttp) {
                const newAliveAgent: any = () => {
                    let req = {
                        prefixUrl: "",
                        agent: {
                            http: undefined,
                            https: undefined
                            //http: agent,
                            //https: agent

                            //http: new HttpAgent(liveOption),
                            //https: new HttpsAgent(liveOption)
                            //
                        },
                        headers,
                        //body,
                        //searchParams: params,
                        retry: {
                            limit: 0,
                            //limit: 1,
                            // calculateDelay: ({retryObject}) => {
                            //     /* interface RetryObject {
                            //         attemptCount: number;
                            //         retryOptions: RetryOptions;
                            //         error: RequestError;
                            //         computedValue: number;
                            //         retryAfter?: number;
                            //     } of retryObject */
                            //     that.logger.warn("internal", LOG_ID + "(head) retry HTTP HEAD, retryObject : ", retryObject);
                            //     //return retryObject;
                            //     return 1000;
                            // },
                            calculateDelay: ({computedValue}) => computedValue,
                            methods: [
                                'GET',
                                'PUT',
                                'HEAD',
                                'DELETE',
                                'OPTIONS',
                                'TRACE'
                            ],
                            statusCodes: [
                                408,
                                413,
                                429,
                                500,
                                502,
                                503,
                                504,
                                521,
                                522,
                                524
                            ],
                            errorCodes: [
                                'ETIMEDOUT',
                                'ECONNRESET',
                                'EADDRINUSE',
                                'ECONNREFUSED',
                                'EPIPE',
                                'ENOTFOUND',
                                'ENETUNREACH',
                                'EAI_AGAIN'
                            ],
                            maxRetryAfter: undefined,
                            backoffLimit: Number.POSITIVE_INFINITY,
                            noise: 100
                        },
                        hooks: {
                            afterResponse: [
                                (response, retryWithMergedOptions) => {
                                    let body;

                                    if (response?.statusCode) {
                                        if (response?.statusCode >= 200 && response?.statusCode <= 206) {
                                            if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                                if (response.body && response?.headers && (response?.headers["content-type"]).indexOf("application/json")===0) {
                                                    resolve(JSON.parse(response?.body));
                                                } else {
                                                    resolve(response.body);
                                                }
                                            } else {
                                                let responseRequest = {
                                                    code: -1,
                                                    url: urlEncoded,
                                                    msg: "Bad content, please check your host",
                                                    details: "",
                                                    headers: response ? response.headers:undefined
                                                };
                                                reject(responseRequest);
                                            }
                                        } else {
                                            that.logger.warn("warn", LOG_ID + "(head) afterResponseHTTP response.code != 200");
                                            that.logger.warn("internal", LOG_ID + "(head) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", bodyjs : ", response.body);
                                            that.logger.warn("internal", LOG_ID + "(head) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", response.headers : ", response.headers, ", response.statusMessage : ", response.statusMessage);
                                            let bodyjs: any = {};
                                            if (that.hasJsonStructure(response.body)) {
                                                bodyjs = JSON.parse(response.body);
                                            } else {
                                                bodyjs.errorMsg = response.body;
                                            }

                                            that.logger.warn("warn", LOG_ID + "(head) HTTP response.code != 200 ");
                                            that.logger.warn("internal", LOG_ID + "(head) HTTP response.code != 200 , body : ", bodyjs);
                                            let msg = response.statusMessage ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                            let errorDetails = bodyjs.errorDetails;
                                            if (errorDetails) {
                                                if (typeof errorDetails==="object") {
                                                    // errorDetails = JSON.stringify(errorDetails);
                                                    errorDetails = util.inspect(errorDetails, false, 4, true);
                                                }
                                            }
                                            let errorMsgDetail = bodyjs ? errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:"" || ""):"";
                                            errorMsgDetail = errorMsgDetail ? errorMsgDetail:bodyjs ? bodyjs.errorMsg || "":"";

                                            that.tokenExpirationControl(bodyjs);
                                            let responseRequest = {
                                                code: response?.statusCode,
                                                url: urlEncoded,
                                                msg: msg,
                                                details: errorMsgDetail,
                                                error: bodyjs,
                                                headers: response?.headers
                                            };

                                            // error.response.body
                                            reject(responseRequest);
                                        }
                                    } else {
                                        if (response.error && response.error.reason) {
                                            that.logger.log("error", LOG_ID + "(head) HTTP security issue", response.error.reason);
                                            reject({
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
                                            reject({
                                                code: -1,
                                                url: urlEncoded,
                                                msg: "Unknown error",
                                                details: response,
                                                headers: response ? response.headers:undefined
                                            });
                                        }
                                    }
                                    // No changes otherwise
                                    return response;
                                }
                            ],
                            beforeRetry: [
                                error => {
                                    // This will be called on `retryWithMergedOptions(...)`
                                }
                            ]
                        },
                    };

                    req.agent.http = that.reqAgentHttp;
                    req.agent.http = that.reqAgentHttps;
                    // @ts-ignore
                    // req.agent = false;

                    return req;
                };

                try {

                    const secondInstance = that.mergedGot.extend({mutableDefaults: true});
                    /*secondInstance.defaults.options.hooks = defaults.hooks;
                    secondInstance.defaults.options.retry = defaults.retry;
                    secondInstance.defaults.options.pagination = defaults.pagination; // */


                    let response = secondInstance.head(urlEncoded, newAliveAgent()).catch((error) => {
                        that.logger.warn("internal", LOG_ID + "(head) error.code : ", error?.code, ", urlEncoded : ", urlEncoded);
                    });
                    that.logger.log("info", LOG_ID + "(head) done.");

                } catch (error) {
                    //
                    //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                    //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                    //
                    that.logger.warn("warn", LOG_ID + "(head) HTTP error.");
                    that.logger.warn("internal", LOG_ID + "(head) HTTP error statusCode : ", error?.statusCode);
                }

                return;
            }
// */







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
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            return that._patch(url, headers,data, type);
        }
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


            if (that._options.restOptions.useGotLibForHttp) {
                const newAliveAgent: any = () => {
                    let req: any = {
                        prefixUrl: "",
                        agent: {
                            http: undefined,
                            https: undefined
                            //http: agent,
                            //https: agent

                            //http: new HttpAgent(liveOption),
                            //https: new HttpsAgent(liveOption)
                            //
                        },
                        headers,
                        // body,
                        //searchParams: params,
                        retry: {
                            limit: 0,
                            //limit: 1,
                            // calculateDelay: ({retryObject}) => {
                            //     /* interface RetryObject {
                            //         attemptCount: number;
                            //         retryOptions: RetryOptions;
                            //         error: RequestError;
                            //         computedValue: number;
                            //         retryAfter?: number;
                            //     } of retryObject */
                            //     that.logger.warn("internal", LOG_ID + "(delete) retry HTTP GET, retryObject : ", retryObject);
                            //     //return retryObject;
                            //     return 1000;
                            // },
                            calculateDelay: ({computedValue}) => computedValue,
                            methods: [
                                'GET',
                                'PUT',
                                'HEAD',
                                'DELETE',
                                'OPTIONS',
                                'TRACE'
                            ],
                            statusCodes: [
                                408,
                                413,
                                429,
                                500,
                                502,
                                503,
                                504,
                                521,
                                522,
                                524
                            ],
                            errorCodes: [
                                'ETIMEDOUT',
                                'ECONNRESET',
                                'EADDRINUSE',
                                'ECONNREFUSED',
                                'EPIPE',
                                'ENOTFOUND',
                                'ENETUNREACH',
                                'EAI_AGAIN'
                            ],
                            maxRetryAfter: undefined,
                            backoffLimit: Number.POSITIVE_INFINITY,
                            noise: 100
                        },
                        hooks: {
                            afterResponse: [
                                (response, retryWithMergedOptions) => {
                                    let body;

                                    if (response?.statusCode) {
                                        that.logger.log("info", LOG_ID + "(patch) HTTP statusCode", response.statusCode);
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
                                                reject({
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
                                            let msg = response.statusMessage ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                            let errorMsgDetail = bodyjs ? bodyjs.errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:"" || ""):"";
                                            errorMsgDetail = errorMsgDetail ? errorMsgDetail:bodyjs ? bodyjs.errorMsg || "":"";

                                            that.tokenExpirationControl(bodyjs);
                                            reject({
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
                                            that.logger.log("error", LOG_ID + "(delete) HTTP security issue", response.error.reason);
                                            reject({
                                                code: -1,
                                                url: urlEncoded,
                                                msg: response.error.reason,
                                                details: "",
                                                headers: response ? response.headers:undefined
                                            });
                                        } else {
                                            that.logger.warn("error", LOG_ID + "(delete) HTTP other issue.");
                                            that.logger.warn("internalerror", LOG_ID + "(delete) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                            that.logger.log("internal", LOG_ID + "(delete) HTTP other issue", response);
                                            reject({
                                                code: -1,
                                                url: urlEncoded,
                                                msg: "Unknown error",
                                                details: response,
                                                headers: response ? response.headers:undefined
                                            });
                                        }
                                    }
                                    // No changes otherwise
                                    return response;
                                }
                            ],
                            beforeRetry: [
                                error => {
                                    // This will be called on `retryWithMergedOptions(...)`
                                }
                            ]
                        },
                    };

                    if (body) {
                        req.body = body;
                    }

                    req.agent.http = that.reqAgentHttp;
                    req.agent.http = that.reqAgentHttps;
                    // @ts-ignore
                    // req.agent = false;

                    return req;
                };

                try {

                    const secondInstance = that.mergedGot.extend({mutableDefaults: true});
                    /*secondInstance.defaults.options.hooks = defaults.hooks;
                    secondInstance.defaults.options.retry = defaults.retry;
                    secondInstance.defaults.options.pagination = defaults.pagination; // */


                    let response = secondInstance.patch(urlEncoded, newAliveAgent()).catch((error) => {
                        that.logger.warn("internal", LOG_ID + "(delete) error.code : ", error?.code, ", urlEncoded : ", urlEncoded);
                    });
                    that.logger.log("info", LOG_ID + "(delete) done.");

                } catch (error) {
                    //
                    //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                    //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                    //
                    that.logger.warn("warn", LOG_ID + "(delete) HTTP error.");
                    that.logger.warn("internal", LOG_ID + "(delete) HTTP error statusCode : ", error?.statusCode);
                }

                return;
            }
// */




            // let body = data;
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
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            return that._put(url, headers,data, type);
        }
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


            if (that._options.restOptions.useGotLibForHttp) {
                const newAliveAgent: any = () => {
                    let req = {
                        prefixUrl: "",
                        agent: {
                            http: undefined,
                            https: undefined
                            //http: agent,
                            //https: agent

                            //http: new HttpAgent(liveOption),
                            //https: new HttpsAgent(liveOption)
                            //
                        },
                        headers,
                        body,
                        //searchParams: params,
                        retry: {
                            limit: 0,
                            //limit: 1,
                            // calculateDelay: ({retryObject}) => {
                            //     /* interface RetryObject {
                            //         attemptCount: number;
                            //         retryOptions: RetryOptions;
                            //         error: RequestError;
                            //         computedValue: number;
                            //         retryAfter?: number;
                            //     } of retryObject */
                            //     that.logger.warn("internal", LOG_ID + "(get) retry HTTP PUT, retryObject : ", retryObject);
                            //     //return retryObject;
                            //     return 1000;
                            // },
                            calculateDelay: ({computedValue}) => computedValue,
                            methods: [
                                'GET',
                                'PUT',
                                'HEAD',
                                'DELETE',
                                'OPTIONS',
                                'TRACE'
                            ],
                            statusCodes: [
                                408,
                                413,
                                429,
                                500,
                                502,
                                503,
                                504,
                                521,
                                522,
                                524
                            ],
                            errorCodes: [
                                'ETIMEDOUT',
                                'ECONNRESET',
                                'EADDRINUSE',
                                'ECONNREFUSED',
                                'EPIPE',
                                'ENOTFOUND',
                                'ENETUNREACH',
                                'EAI_AGAIN'
                            ],
                            maxRetryAfter: undefined,
                            backoffLimit: Number.POSITIVE_INFINITY,
                            noise: 100
                        },
                        hooks: {
                            afterResponse: [
                                (response, retryWithMergedOptions) => {
                                    let body;

                                    if (response?.statusCode) {
                                        if (response?.statusCode >= 200 && response?.statusCode <= 206) {
                                            if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                                if (response.body && response?.headers && (response?.headers["content-type"]).indexOf("application/json")===0) {
                                                    resolve(JSON.parse(response?.body));
                                                } else {
                                                    resolve(response.body);
                                                }
                                            } else {
                                                let responseRequest = {
                                                    code: -1,
                                                    url: urlEncoded,
                                                    msg: "Bad content, please check your host",
                                                    details: "",
                                                    headers: response ? response.headers:undefined
                                                };
                                                reject(responseRequest);
                                            }
                                        } else {
                                            that.logger.warn("warn", LOG_ID + "(put) afterResponseHTTP response.code != 200");
                                            that.logger.warn("internal", LOG_ID + "(put) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", bodyjs : ", response.body);
                                            that.logger.warn("internal", LOG_ID + "(put) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", response.headers : ", response.headers, ", response.statusMessage : ", response.statusMessage);
                                            let bodyjs: any = {};
                                            if (that.hasJsonStructure(response.body)) {
                                                bodyjs = JSON.parse(response.body);
                                            } else {
                                                bodyjs.errorMsg = response.body;
                                            }

                                            that.logger.warn("warn", LOG_ID + "(put) HTTP response.code != 200 ");
                                            that.logger.warn("internal", LOG_ID + "(put) HTTP response.code != 200 , body : ", bodyjs);
                                            let msg = response.statusMessage ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                            let errorDetails = bodyjs.errorDetails;
                                            if (errorDetails) {
                                                if (typeof errorDetails==="object") {
                                                    // errorDetails = JSON.stringify(errorDetails);
                                                    errorDetails = util.inspect(errorDetails, false, 4, true);
                                                }
                                            }
                                            let errorMsgDetail = bodyjs ? errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:"" || ""):"";
                                            errorMsgDetail = errorMsgDetail ? errorMsgDetail:bodyjs ? bodyjs.errorMsg || "":"";

                                            that.tokenExpirationControl(bodyjs);
                                            let responseRequest = {
                                                code: response?.statusCode,
                                                url: urlEncoded,
                                                msg: msg,
                                                details: errorMsgDetail,
                                                error: bodyjs,
                                                headers: response?.headers
                                            };

                                            // error.response.body
                                            reject(responseRequest);
                                        }
                                    } else {
                                        if (response.error && response.error.reason) {
                                            that.logger.log("error", LOG_ID + "(put) HTTP security issue", response.error.reason);
                                            reject({
                                                code: -1,
                                                url: urlEncoded,
                                                msg: response.error.reason,
                                                details: "",
                                                headers: response ? response.headers:undefined
                                            });
                                        } else {
                                            that.logger.warn("error", LOG_ID + "(put) HTTP other issue.");
                                            that.logger.warn("internalerror", LOG_ID + "(put) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                            that.logger.log("internal", LOG_ID + "(put) HTTP other issue", response);
                                            reject({
                                                code: -1,
                                                url: urlEncoded,
                                                msg: "Unknown error",
                                                details: response,
                                                headers: response ? response.headers:undefined
                                            });
                                        }
                                    }
                                    // No changes otherwise
                                    return response;
                                }
                            ],
                            beforeRetry: [
                                error => {
                                    // This will be called on `retryWithMergedOptions(...)`
                                }
                            ]
                        },
                    };

                    req.agent.http = that.reqAgentHttp;
                    req.agent.http = that.reqAgentHttps;
                    // @ts-ignore
                    // req.agent = false;

                    return req;
                };

                try {

                    const secondInstance = that.mergedGot.extend({mutableDefaults: true});
                    /*secondInstance.defaults.options.hooks = defaults.hooks;
                    secondInstance.defaults.options.retry = defaults.retry;
                    secondInstance.defaults.options.pagination = defaults.pagination; // */


                    let response = secondInstance.put(urlEncoded, newAliveAgent()).catch((error) => {
                        that.logger.warn("internal", LOG_ID + "(put) error.code : ", error?.code, ", urlEncoded : ", urlEncoded);
                    });
                    that.logger.log("info", LOG_ID + "(put) done.");

                } catch (error) {
                    //
                    //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                    //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                    //
                    that.logger.warn("warn", LOG_ID + "(put) HTTP error.");
                    that.logger.warn("internal", LOG_ID + "(put) HTTP error statusCode : ", error?.statusCode);
                }

                return;
            }
// */





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
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            return that._putBuffer(url, headers, buffer);
        }
    }

    _putBuffer(url, headers: any = {}, buffer): Promise<any> {
        let that = this;

        return new Promise(function (resolve, reject) {

            //that.logger.log("debug", LOG_ID + "(putBuffer) option url", that.serverURL + url);
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            headers["user-agent"] = USER_AGENT;

            that.logger.log("internal", LOG_ID + "(_putBuffer) url : ", urlEncoded);
            if (that._options.restOptions.useGotLibForHttp) {
                const newAliveAgent: any = () => {
                    let req = {
                        prefixUrl: "",
                        agent: {
                            http: undefined,
                            https: undefined
                            //http: agent,
                            //https: agent

                            //http: new HttpAgent(liveOption),
                            //https: new HttpsAgent(liveOption)
                            //
                        },
                        headers,
                        body:buffer,
                        //searchParams: params,
                        hooks: {
                            afterResponse: [
                                (response, retryWithMergedOptions) => {
                                    let body;

                                    if (response) {
                                        if (response?.statusCode) {
                                            that.logger.log("info", LOG_ID + "(_putBuffer) HTTP statusCode defined : ", response.statusCode);
                                            if (response.statusCode >= 200 && response.statusCode <= 400) {
                                                //if (response) {
                                                  //  response.body = body;
                                                //}
                                                resolve(response.body);
                                            } else {
                                                that.logger.warn("warn", LOG_ID + "(_putBuffer) HTTP response.code != 200");
                                                that.logger.warn("internal", LOG_ID + "(_putBuffer) HTTP response.code != 200 , bodyjs : ", response?.body);
                                                reject({
                                                    code: -1,
                                                    msg: "ErrorManager while requesting _putBuffer",
                                                    details: response,
                                                    headers: response ? response.headers:undefined
                                                });
                                            }
                                        } else {
                                            reject({
                                                code: -1,
                                                msg: "ErrorManager while requesting _putBuffer no statusCode returned",
                                                details: undefined,
                                                headers: undefined
                                            });
                                        }
                                    } else {
                                        reject({
                                            code: -1,
                                            msg: "ErrorManager while requesting _putBuffer no response returned",
                                            details: undefined,
                                            headers: undefined
                                        });
                                    }
                                    return response;
                                }
                            ],
                        },
                    };

                    req.agent.http = that.reqAgentHttp;
                    req.agent.http = that.reqAgentHttps;
                    // @ts-ignore
                    // req.agent = false;

                    return req;
                };

                try {

                    const secondInstance = that.mergedGot.extend({mutableDefaults: true});

                    let response = secondInstance.put(urlEncoded, newAliveAgent()).catch((error) => {
                        that.logger.warn("internal", LOG_ID + "(_putBuffer) error.code : ", error?.code, ", urlEncoded : ", urlEncoded);
                    });
                    that.logger.log("info", LOG_ID + "(_putBuffer) done.");

                } catch (error) {
                    //
                    //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                    //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                    //
                    that.logger.warn("warn", LOG_ID + "(_putBuffer) HTTP error.");
                    that.logger.warn("internal", LOG_ID + "(_putBuffer) HTTP error statusCode : ", error?.statusCode);
                }

                return;
            }
// */

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

            that.logger.log("internal", LOG_ID + "(putStream) url : ", urlEncoded, " stream fileName : ", stream?.fileName);

            headers["user-agent"] = USER_AGENT;

            if (that._options.restOptions.useGotLibForHttp) {
                const newAliveAgent: any = () => {
                    let req = {
                        prefixUrl: "",
                        agent: {
                            http: undefined,
                            https: undefined
                            //http: agent,
                            //https: agent

                            //http: new HttpAgent(liveOption),
                            //https: new HttpsAgent(liveOption)
                            //
                        },
                        headers,
                        //body,
                        //searchParams: params,
                        retry: {
                            limit: 0,
                            //limit: 1,
                            // calculateDelay: ({retryObject}) => {
                            //     // interface RetryObject {
                            //     //    attemptCount: number;
                            //     //    retryOptions: RetryOptions;
                            //     //    error: RequestError;
                            //     //    computedValue: number;
                            //     //    retryAfter?: number;
                            //     // } of retryObject
                            //     that.logger.warn("internal", LOG_ID + "(get) retry HTTP PUT, retryObject : ", retryObject);
                            //     //return retryObject;
                            //     return 1000;
                            // },
                            calculateDelay: ({computedValue}) => computedValue,
                            methods: [
                                'GET',
                                'PUT',
                                'HEAD',
                                'DELETE',
                                'OPTIONS',
                                'TRACE'
                            ],
                            statusCodes: [
                                408,
                                413,
                                429,
                                500,
                                502,
                                503,
                                504,
                                521,
                                522,
                                524
                            ],
                            errorCodes: [
                                'ETIMEDOUT',
                                'ECONNRESET',
                                'EADDRINUSE',
                                'ECONNREFUSED',
                                'EPIPE',
                                'ENOTFOUND',
                                'ENETUNREACH',
                                'EAI_AGAIN'
                            ],
                            maxRetryAfter: undefined,
                            backoffLimit: Number.POSITIVE_INFINITY,
                            noise: 100
                        },
                        hooks: {
                            afterResponse: [
                                (response, retryWithMergedOptions) => {
                                    let body;

                                    if (response?.statusCode) {
                                        if (response?.statusCode >= 200 && response?.statusCode <= 206) {
                                            if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                                if (response.body && response?.headers && (response?.headers["content-type"]).indexOf("application/json")===0) {
                                                    resolve(JSON.parse(response?.body));
                                                } else {
                                                    resolve(response.body);
                                                }
                                            } else {
                                                let responseRequest = {
                                                    code: -1,
                                                    url: urlEncoded,
                                                    msg: "Bad content, please check your host",
                                                    details: "",
                                                    headers: response ? response.headers:undefined
                                                };
                                                reject(responseRequest);
                                            }
                                        } else {
                                            that.logger.warn("warn", LOG_ID + "(putStream) afterResponseHTTP response.code != 200");
                                            that.logger.warn("internal", LOG_ID + "(putStream) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", bodyjs : ", response.body);
                                            that.logger.warn("internal", LOG_ID + "(putStream) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", response.headers : ", response.headers, ", response.statusMessage : ", response.statusMessage);
                                            let bodyjs: any = {};
                                            if (that.hasJsonStructure(response.body)) {
                                                bodyjs = JSON.parse(response.body);
                                            } else {
                                                bodyjs.errorMsg = response.body;
                                            }

                                            that.logger.warn("warn", LOG_ID + "(putStream) HTTP response.code != 200 ");
                                            that.logger.warn("internal", LOG_ID + "(putStream) HTTP response.code != 200 , body : ", bodyjs);
                                            let msg = response.statusMessage ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                            let errorDetails = bodyjs.errorDetails;
                                            if (errorDetails) {
                                                if (typeof errorDetails==="object") {
                                                    // errorDetails = JSON.stringify(errorDetails);
                                                    errorDetails = util.inspect(errorDetails, false, 4, true);
                                                }
                                            }
                                            let errorMsgDetail = bodyjs ? errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:"" || ""):"";
                                            errorMsgDetail = errorMsgDetail ? errorMsgDetail:bodyjs ? bodyjs.errorMsg || "":"";

                                            that.tokenExpirationControl(bodyjs);
                                            let responseRequest = {
                                                code: response?.statusCode,
                                                url: urlEncoded,
                                                msg: msg,
                                                details: errorMsgDetail,
                                                error: bodyjs,
                                                headers: response?.headers
                                            };

                                            // error.response.body
                                            reject(responseRequest);
                                        }
                                    } else {
                                        if (response.error && response.error.reason) {
                                            that.logger.log("error", LOG_ID + "(putStream) HTTP security issue", response.error.reason);
                                            reject({
                                                code: -1,
                                                url: urlEncoded,
                                                msg: response.error.reason,
                                                details: "",
                                                headers: response ? response.headers:undefined
                                            });
                                        } else {
                                            that.logger.warn("error", LOG_ID + "(putStream) HTTP other issue.");
                                            that.logger.warn("internalerror", LOG_ID + "(putStream) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                            that.logger.log("internal", LOG_ID + "(putStream) HTTP other issue", response);
                                            reject({
                                                code: -1,
                                                url: urlEncoded,
                                                msg: "Unknown error",
                                                details: response,
                                                headers: response ? response.headers:undefined
                                            });
                                        }
                                    }
                                    // No changes otherwise
                                    return response;
                                }
                            ],
                            beforeRetry: [
                                error => {
                                    // This will be called on `retryWithMergedOptions(...)`
                                }
                            ]
                        },
                    };

                    req.agent.http = that.reqAgentHttp;
                    req.agent.http = that.reqAgentHttps;
                    // @ts-ignore
                    // req.agent = false;

                    return req;
                };

                try {

                    const secondInstance = that.mergedGot.extend({mutableDefaults: true});


                    // store error and result
                    let error;
                    let result = null;
                    let verbose = 2;
                    let spinner = undefined;

                    let streamRes = _(pipeline(stream, (secondInstance.stream.put(urlEncoded, newAliveAgent())), (err) => {
                        if (err) {
//                            console.error('Pipeline failed', err);
                            that.logger.warn("internal", LOG_ID + "(putStream) error.code : ", error?.code, ", urlEncoded : ", urlEncoded);

                            reject(err);
                        } else {
                            console.log('Pipeline succeeded');
                            resolve(err);
                        }
                    }));

//return;

                    // let streamRes = _(stream.pipe(secondInstance.stream.put(urlEncoded, newAliveAgent())))
//                        .split()
//                        .filter(l => l && l.length);
                    // store output
                    streamRes.on('data', str => {
                        if (spinner) {
                            spinner.text = 'Project uploaded! Waiting for deployment..';
                        }
                        const s = str.toString();
                        try {

                            result = result ? result + s:s;
                            /*  const data = JSON.parse(s);
                             // always log info
                             if (data.level === 'info') {
                                 verbose && that.logger.log("internal", LOG_ID + "(putStream) : ", chalk.blue('[info]'), data.message);
                                 // if data has deployments info - assign it as result
                                 if (data.deployments) {
                                     result = data;
                                 }
                             }
                             // log verbose if needed
                             data.level === 'verbose' && verbose > 1 && that.logger.log("internal", LOG_ID + "(putStream) : ", chalk.grey('[verbose]'), data.message);
                             // if error - store as error and log
                             if (data.level === 'error') {
                                 verbose && that.logger.log("internal", LOG_ID + "(putStream) : ", chalk.red('[error]'), data.message);
                                 verbose > 1 && console.log(JSON.stringify(data, null, 2));
                                 error = new Error(data.message);
                                 error.response = data;
                             }
                             // */
                        } catch (e) {
                            error = new Error('Error parsing output!');
                            error.response = {
                                error: s,
                            };
                            verbose && that.logger.log("internal", LOG_ID + "(putStream) : ", chalk.red('[error]'), 'Error parsing line:', s);
                        }
                    });
                    // listen for read stream end
                    streamRes.on('end', () => {
                        // if stream had error - reject
                        if (error) {
                            that.logger.warn("warn", LOG_ID + "(putStream) HTTP error at end.");
                            that.logger.warn("internal", LOG_ID + "(putStream) HTTP error at end. error : ", error);
                            reject(error);
                            return;
                        }

                        try {

                            verbose && that.logger.log("internal", LOG_ID + "(putStream) result : ", chalk.blue('[info]'), result);
                            const data = JSON.parse(result);
                            verbose && that.logger.log("internal", LOG_ID + "(putStream) data : ", chalk.blue('[info]'), data);
                            // always log info
                            if (data.level==='info') {
                                verbose && that.logger.log("internal", LOG_ID + "(putStream) : ", chalk.blue('[info]'), data.message);
                                // if data has deployments info - assign it as result
                                if (data.deployments) {
                                    result = data;
                                }
                            }
                            // log verbose if needed
                            data.level==='verbose' && verbose > 1 && that.logger.log("internal", LOG_ID + "(putStream) : ", chalk.grey('[verbose]'), data.message);
                            // if error - store as error and log
                            if (data.level==='error') {
                                verbose && that.logger.log("internal", LOG_ID + "(putStream) : ", chalk.red('[error]'), data.message);
                                verbose > 1 && console.log(JSON.stringify(data, null, 2));
                                error = new Error(data.message);
                                error.response = data;
                                reject(error);
                                return;
                            }
                        } catch (e) {
                            error = new Error('Error parsing output!');
                            error.response = {
                                error: e,
                            };
                            verbose && that.logger.log("internal", LOG_ID + "(putStream) : ", chalk.red('[error]'), 'Error parsing line:', result);
                            reject(error);
                            return;
                        }

                        that.logger.log("info", LOG_ID + "(putStream) successfull");
                        that.logger.log("info", LOG_ID + "(putStream) put file buffer in Url");
                        // otherwise resolve
                        resolve("done");
                    });
                    streamRes.on('error', e => (error = e));

                    return (streamRes);
                } catch (error) {
                    //
                    //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                    //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                    //
                    that.logger.warn("warn", LOG_ID + "(putStream) HTTP error.");
                    that.logger.warn("internal", LOG_ID + "(putStream) HTTP error : ", error);
                    return (error);
                }

                return;
            }
            // */




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
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            return that._delete(url, headers, data);
        }
    }

    _delete(url, headers: any = {}, data : Object = undefined): Promise<any> {

        let that = this;

        return new Promise(function (resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            let body = data;
            headers["user-agent"] = USER_AGENT;

            that.logger.log("internal", LOG_ID + "(delete) url : ", urlEncoded, ", headers : ", headers, ", body : ", body);

            if (that._options.restOptions.useGotLibForHttp) {
                const newAliveAgent: any = () => {
                    let req: any = {
                        prefixUrl: "",
                        agent: {
                            http: undefined,
                            https: undefined
                            //http: agent,
                            //https: agent

                            //http: new HttpAgent(liveOption),
                            //https: new HttpsAgent(liveOption)
                            //
                        },
                        headers,
                        // body,
                        //searchParams: params,
                        retry: {
                            limit: 0,
                            //limit: 1,
                            // calculateDelay: ({retryObject}) => {
                            //     /* interface RetryObject {
                            //         attemptCount: number;
                            //         retryOptions: RetryOptions;
                            //         error: RequestError;
                            //         computedValue: number;
                            //         retryAfter?: number;
                            //     } of retryObject */
                            //     that.logger.warn("internal", LOG_ID + "(delete) retry HTTP GET, retryObject : ", retryObject);
                            //     //return retryObject;
                            //     return 1000;
                            // },
                            calculateDelay: ({computedValue}) => computedValue,
                            methods: [
                                'GET',
                                'PUT',
                                'HEAD',
                                'DELETE',
                                'OPTIONS',
                                'TRACE'
                            ],
                            statusCodes: [
                                408,
                                413,
                                429,
                                500,
                                502,
                                503,
                                504,
                                521,
                                522,
                                524
                            ],
                            errorCodes: [
                                'ETIMEDOUT',
                                'ECONNRESET',
                                'EADDRINUSE',
                                'ECONNREFUSED',
                                'EPIPE',
                                'ENOTFOUND',
                                'ENETUNREACH',
                                'EAI_AGAIN'
                            ],
                            maxRetryAfter: undefined,
                            backoffLimit: Number.POSITIVE_INFINITY,
                            noise: 100
                        },
                        hooks: {
                            afterResponse: [
                                (response, retryWithMergedOptions) => {
                                    let body;

                                    if (response?.statusCode) {
                                        if (response?.statusCode >= 200 && response?.statusCode <= 206) {
                                            if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                                if (response?.body && response?.headers && (response?.headers["content-type"]).indexOf("application/json")===0) {
                                                    resolve(JSON.parse(response?.body));
                                                } else {
                                                    resolve(response.body);
                                                }
                                            } else {
                                                let responseRequest = {
                                                    code: -1,
                                                    url: urlEncoded,
                                                    msg: "Bad content, please check your host",
                                                    details: "",
                                                    headers: response ? response.headers:undefined
                                                };
                                                reject(responseRequest);
                                            }
                                        } else {
                                            that.logger.warn("warn", LOG_ID + "(delete) afterResponseHTTP response.code != 200");
                                            that.logger.warn("internal", LOG_ID + "(delete) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", bodyjs : ", response.body);
                                            that.logger.warn("internal", LOG_ID + "(delete) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", response.headers : ", response.headers, ", response.statusMessage : ", response.statusMessage);
                                            that.logger.log("info", LOG_ID + "(delete) HTTP code", response.code);
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
                                                reject({
                                                    code: response.statusCode,
                                                    url: urlEncoded,
                                                    msg: response.body ? response.body.errorMsg || "":"",
                                                    details: response.body ? response.body.errorDetails || "":"",
                                                    error: bodyjs,
                                                    headers: response ? response.headers:undefined
                                                });
                                            }
                                        }
                                    } else {
                                        if (response.error && response.error.reason) {
                                            that.logger.log("error", LOG_ID + "(delete) HTTP security issue", response.error.reason);
                                            reject({
                                                code: -1,
                                                url: urlEncoded,
                                                msg: response.error.reason,
                                                details: "",
                                                headers: response ? response.headers:undefined
                                            });
                                        } else {
                                            that.logger.warn("error", LOG_ID + "(delete) HTTP other issue.");
                                            that.logger.warn("internalerror", LOG_ID + "(delete) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                            that.logger.log("internal", LOG_ID + "(delete) HTTP other issue", response);
                                            reject({
                                                code: -1,
                                                url: urlEncoded,
                                                msg: "Unknown error",
                                                details: response,
                                                headers: response ? response.headers:undefined
                                            });
                                        }
                                    }
                                    // No changes otherwise
                                    return response;
                                }
                            ],
                            beforeRetry: [
                                error => {
                                    // This will be called on `retryWithMergedOptions(...)`
                                }
                            ]
                        },
                    };

                    if (body) {
                        req.body = body;
                    }

                    req.agent.http = that.reqAgentHttp;
                    req.agent.http = that.reqAgentHttps;
                    // @ts-ignore
                    // req.agent = false;

                    return req;
                };

                try {

                    const secondInstance = that.mergedGot.extend({mutableDefaults: true});
                    /*secondInstance.defaults.options.hooks = defaults.hooks;
                    secondInstance.defaults.options.retry = defaults.retry;
                    secondInstance.defaults.options.pagination = defaults.pagination; // */


                    let response = secondInstance.delete(urlEncoded, newAliveAgent()).catch((error) => {
                        that.logger.warn("internal", LOG_ID + "(delete) error.code : ", error?.code, ", urlEncoded : ", urlEncoded);
                    });
                    that.logger.log("info", LOG_ID + "(delete) done.");

                } catch (error) {
                    //
                    //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                    //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                    //
                    that.logger.warn("warn", LOG_ID + "(delete) HTTP error.");
                    that.logger.warn("internal", LOG_ID + "(delete) HTTP error statusCode : ", error?.statusCode);
                }

                return;
            }
// */




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
