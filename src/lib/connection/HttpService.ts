"use strict";

import {callerName, logEntryExit, pause, stackTrace} from "../common/Utils";
import {TimeOutManager} from "../common/TimeOutManager";
import {HttpManager, RequestForQueue} from "./HttpManager";
import * as util from "util";
import {window} from "rxjs";


require('http').globalAgent.maxSockets = 999;

const packageVersion = require("../../package.json");

//let http = require('http');
function urlParse(urlStr, base = undefined) {
    try {
        const url = new URL(urlStr, base);
        return {
            protocol: url.protocol,
            slashes: urlStr.includes('://') || (base && base.includes('://')),
            auth: url.username ? (url.password ? `${url.username}:${url.password}` : url.username) : null,
            host: url.host,
            port: url.port || null,
            hostname: url.hostname,
            hash: url.hash || null,
            search: url.search || null,
            query: url.search ? url.search.substring(1) : null,
            pathname: url.pathname,
            path: url.pathname + url.search,
            href: url.href
        };
    } catch (e) {
        return {};
    }
}
const EventEmitter = require("events").EventEmitter;
const humanize = require("humanize-number");
import chalk from 'chalk';
import {HTTPoverXMPP} from "../services/HTTPoverXMPPService.js";
import {LevelLogs} from "../common/LevelLogs";
import {constants} from "node:os";

const HttpAgent = require('agentkeepalive');
const HttpsAgent = require('agentkeepalive').HttpsAgent;

let KeepAliveProxyAgent = require('keepalive-proxy-agent');
//let KeepAliveProxyAgent = require('agentkeepalive');
const {HttpProxyAgent} = require("http-proxy-agent");
const {HttpsProxyAgent} = require("https-proxy-agent");
const http = require('http');
const https = require('https');

//import got, {Agents, Got} from "got";
const got = require("got").got;
//import {OptionsInit} from 'got';
const _ = require('highland');
const { pipeline } = require('stream');
const urlLib = require('url');

//const {HttpsProxyAgent} = require("https-proxy-agent");

//import {HttpsProxyAgent} from 'hpagent';


// https://nodejs.org/api/module.html#modulecreaterequirefilename  If needed, a require function can be constructed within an ES module using module.createRequire().

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
class HTTPService extends LevelLogs{
    public serverURL: any;
    public _host: any;
    public _logger: any;
    public proxy: any;
    public eventEmitter: any;
    public httpManager : HttpManager;
    private _options: any;
    private mergedGot: any;
    private reqAgent: any;
    private reqAgentHttp: any;
    private reqAgentHttps: any;
    private _lastRequestTime = 0;
    private _staleThresholdMs = 3000;
    public useRequestRateLimiter: boolean;
    public apiHeadersConfiguration: any[];
    public mockRestUrl : Array<{verb:string, url : string, callback : any }> = [];

    getMockRestUrl() {
        return this.mockRestUrl;
    }

    setMockRestUrl(mockRestUrl: Array<{verb:string, url : string, callback : any }>) {
        this.mockRestUrl = mockRestUrl;
    }

    addMockRestUrl(verb: string, url: string, callback: any) {
        this.mockRestUrl.push({verb, url, callback});
    }

    static getClassName(){ return 'HTTPService'; }
    getClassName(){ return HTTPService.getClassName(); }

    static getAccessorName(){ return 'httpservice'; }
    getAccessorName(){ return HTTPService.getAccessorName(); }

    private timeOutManager: TimeOutManager;
    protected _core: any;

    constructor(_core, _options, _logger, _proxy, _evtEmitter ) {
        super();
        this.setLogLevels(this);

        this._options = _options;
        let _http = _options.httpOptions;
        this.serverURL = _http.protocol + "://" + _http.host + ":" + _http.port;
        this._host = _http.host;
        this._logger = _logger;
        this.proxy = _proxy;
        this.eventEmitter = _evtEmitter;
        this._core = _core;
        this.timeOutManager = _core.timeOutManager;

        this.httpManager = new HttpManager(_evtEmitter, _logger);
        let that = this;
        this.mergedGot = got;
        let extendObjForGot : any = {};
        if (_options.requestsRate.useRequestRateLimiter!==undefined) {
            that.useRequestRateLimiter = _options.requestsRate.useRequestRateLimiter;
        } else {
            that.useRequestRateLimiter = true;
        }

        // ***** Start lib 'keepalive-proxy-agent' *****

        const customLiveOption = _options._getRESTOptions()?.gotOptions;
        this._staleThresholdMs = customLiveOption?.agentOptions?.staleThresholdMs !== undefined
            ? customLiveOption.agentOptions.staleThresholdMs : 3000;
        let liveOption: any = {
            /**
             * Keep sockets around in a pool to be used by other requests in the future. Default = false
             */
            keepAlive: customLiveOption?.agentOptions?.keepAlive!==undefined ? customLiveOption.agentOptions.keepAlive:true, // ?: boolean | undefined;
            /**
             * When using HTTP KeepAlive, how often to send TCP KeepAlive packets over sockets being kept alive. Default = 1000.
             * Only relevant if keepAlive is set to true.
             */
            keepAliveMsecs: customLiveOption?.agentOptions?.keepAliveMsecs!==undefined ? customLiveOption.agentOptions.keepAliveMsecs:4301, // ?: number | undefined;
            /**
             * Maximum number of sockets to allow per host. Default for Node 0.10 is 5, default for Node 0.12 is Infinity
             */
            maxSockets: customLiveOption?.agentOptions?.maxSockets!==undefined ? customLiveOption.agentOptions.maxSockets:25, // ?: number | undefined;
            /**
             * Maximum number of sockets allowed for all hosts in total. Each request will use a new socket until the maximum is reached. Default: Infinity.
             */
            maxTotalSockets: customLiveOption?.agentOptions?.maxTotalSockets!==undefined ? customLiveOption.agentOptions.maxTotalSockets:Infinity, // ?: number | undefined;
            /**
             * Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Default = 256.
             */
            maxFreeSockets: customLiveOption?.agentOptions?.maxFreeSockets!==undefined ? customLiveOption.agentOptions.maxFreeSockets:1000, // ?: number | undefined;
            /**
             * Socket timeout in milliseconds. This will set the timeout after the socket is connected.
             */
            timeout: customLiveOption?.agentOptions?.timeout!==undefined ? customLiveOption.agentOptions.timeout:60000, // ?: number | undefined;
            /**
             * Destroy idle free sockets after this timeout (ms). Prevents reusing sockets closed by the server. Default: 50000.
             */
            freeSocketTimeout: customLiveOption?.agentOptions?.freeSocketTimeout!==undefined ? customLiveOption.agentOptions.freeSocketTimeout:5000, // ?: number | undefined; // VBR CRRAINB must stay below server keep-alive idle timeout
            /**
             * If not false, the server certificate is verified against the list of supplied CAs. Default: true.
             */
            rejectUnauthorized: customLiveOption?.agentOptions?.rejectUnauthorized!==undefined ? customLiveOption.agentOptions.rejectUnauthorized:true
        };

        if (that.proxy.isProxyConfigured) {
            if (that.proxy.secureProtocol) {
                //opt.secureProxy = true;
            }
            // Until web proxy on websocket solved, patch existing configuration to offer the proxy options
            //liveOption.proxy = urlParse(that.proxy.proxyURL);
            liveOption = Object.assign({}, liveOption, urlParse(that.proxy.proxyURL));

            if (that.proxy.secureProtocol) {
                liveOption.secureProxy = true;
            }
            // If credentials are provided in the proxy URL (e.g., http://user:pass@host:port),
            // url.parse places them in opt.auth. Extract them to username/password fields for the agent.
            if (liveOption && liveOption.auth) {
                const authStr = "" + liveOption.auth;
                const sepIndex = authStr.indexOf(":");
                if (sepIndex > -1) {
                    liveOption.username = authStr.substring(0, sepIndex);
                    liveOption.password = authStr.substring(sepIndex + 1);
                } else {
                    liveOption.username = authStr;
                }
            }
            //const proxyUrl = that.proxy.proxyURL; // ex: "http://user:pass@host:3128" ou "https://host:3129"

            //that._logger.log(that.INTERNAL, LOG_ID + "(constructor) build proxy agent. proxyUrl : ", proxyUrl,", liveOption : ", liveOption);
            that._logger.log(that.INTERNAL, LOG_ID + "(constructor) build proxy agent. liveOption : ", liveOption);
            this.reqAgentHttp = new HttpProxyAgent( liveOption);
            this.reqAgentHttps = new HttpsProxyAgent( liveOption);
        } else {
            that._logger.log(that.INTERNAL, LOG_ID + "(constructor) build direct agent. liveOption : ", liveOption);
            this.reqAgentHttp = new HttpAgent(liveOption);
            this.reqAgentHttps = new HttpsAgent(liveOption);
        }

        // ***** End lib 'keepalive-proxy-agent' *****

        // // ***** Start lib 'keepalive-proxy-agent' *****
        //
        // const customLiveOption = _options._getRESTOptions()?.gotOptions;
        // const liveOption: any = {
        //     /**
        //      * Keep sockets around in a pool to be used by other requests in the future. Default = false
        //      */
        //     keepAlive: customLiveOption?.agentOptions?.keepAlive!==undefined ? customLiveOption.agentOptions.keepAlive:true, // ?: boolean | undefined;
        //     /**
        //      * When using HTTP KeepAlive, how often to send TCP KeepAlive packets over sockets being kept alive. Default = 1000.
        //      * Only relevant if keepAlive is set to true.
        //      */
        //     keepAliveMsecs: customLiveOption?.agentOptions?.keepAliveMsecs!==undefined ? customLiveOption.agentOptions.keepAliveMsecs:4301, // ?: number | undefined;
        //     /**
        //      * Maximum number of sockets to allow per host. Default for Node 0.10 is 5, default for Node 0.12 is Infinity
        //      */
        //     maxSockets: customLiveOption?.agentOptions?.maxSockets!==undefined ? customLiveOption.agentOptions.maxSockets:25, // ?: number | undefined;
        //     /**
        //      * Maximum number of sockets allowed for all hosts in total. Each request will use a new socket until the maximum is reached. Default: Infinity.
        //      */
        //     maxTotalSockets: customLiveOption?.agentOptions?.maxTotalSockets!==undefined ? customLiveOption.agentOptions.maxTotalSockets:Infinity, // ?: number | undefined;
        //     /**
        //      * Maximum number of sockets to leave open in a free state. Only relevant if keepAlive is set to true. Default = 256.
        //      */
        //     maxFreeSockets: customLiveOption?.agentOptions?.maxFreeSockets!==undefined ? customLiveOption.agentOptions.maxFreeSockets:1000, // ?: number | undefined;
        //     /**
        //      * Socket timeout in milliseconds. This will set the timeout after the socket is connected.
        //      */
        //     timeout: customLiveOption?.agentOptions?.timeout!==undefined ? customLiveOption.agentOptions.timeout:60000, // ?: number | undefined;
        //     /**
        //      * If not false, the server certificate is verified against the list of supplied CAs. Default: true.
        //      */
        //     rejectUnauthorized: customLiveOption?.agentOptions?.rejectUnauthorized!==undefined ? customLiveOption.agentOptions.rejectUnauthorized:true
        // };
        //
        // if (that.proxy.isProxyConfigured) {
        //     if (that.proxy.secureProtocol) {
        //         //opt.secureProxy = true;
        //     }
        //     // Until web proxy on websocket solved, patch existing configuration to offer the proxy options
        //     liveOption.proxy = urlParse(that.proxy.proxyURL);
        // }
        //
        // this.reqAgentHttp = new KeepAliveProxyAgent(liveOption);
        // this.reqAgentHttps = this.reqAgentHttp;
        //
        // // ***** End lib 'keepalive-proxy-agent' *****
        //

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
            _AGENT_OPTIONS.proxy = urlParse(that.proxy.proxyURL);
        }

        this.reqAgentHttp =  new KeepAliveProxyAgent(_AGENT_OPTIONS);
        this.reqAgentHttps =  new KeepAliveProxyAgent.HttpsAgent(_AGENT_OPTIONS);
        // End lib 'agentkeepalive'
        // */

        //const wrapRequest: NonNullable<OptionsInit['request']> = (url, options, callback) => {
        const wrapRequest: any = (url, options, callback) => {
            that._logger.log(that.HTTP, LOG_ID + "(wrapRequest) url : ", url, ", options : ", options);
            // Sélectionne la bonne fonction native
            const isHttps = (options as any).protocol === 'https:' || (options as any).url?.toString().startsWith('https:') || (url as any).protocol === 'https:' || (url as any).href?.toString().startsWith('https:');
            const nativeRequest = isHttps ? https.request : http.request;

            const req = nativeRequest(url as any, options as any, callback as any);

            // Ici on a accès au ClientRequest → on attache nos écouteurs
            req.on('socket', (socket: any) => {
                // Node remplit req.reusedSocket quand le socket provient du pool Keep-Alive
                const reused = (req as any).reusedSocket === true;
                try {
                    that._logger.log(that.HTTP, `${LOG_ID}(got) req socket event reused=${reused} local=${socket.localPort} remote=${socket.remoteAddress}:${socket.remotePort}`);
                } catch {}
            });
            req.on('abort', (err) => {
                that._logger.log(that.HTTP, LOG_ID + "(got) agent abort event : ", err);
            });
            req.on('close', (info) => {
                that._logger.log(that.HTTP, LOG_ID + "(got) agent close event : ", info);
            });

            req.on('error', (err: any) => {
                try {
                    that._logger.log("error", `${LOG_ID}(got) req error:`, err);
                } catch {}
            });

            return req;
        };

        function debugHandler(request, options?, cb?): any {
            options = typeof options==="string" ? urlParse(options):options;

            let url = options.href || (options.protocol || "http:") + "//" + (options.host || options.hostname) + options.path;
            let method = (options.method || "GET").toUpperCase();
            let signature = method + " " + url;
            let start = new Date();
            let wasHandled = typeof cb==="function";

            //setImmediate(console.log, chalk.gray('      → ' + signature));
            that._logger.log(that.HTTP, LOG_ID + " " + chalk.gray("      → " + signature + " : " + JSON.stringify(options.headers, null, "  ")));

            return request(options, cb).on("response", function (response) {
                        // Workaround for res._dump in Node.JS http client
                        // https://github.com/nodejs/node/blob/20285ad17755187ece16b8a5effeaa87f5407da2/lib/_http_client.js#L421-L427
                        if (!wasHandled && EventEmitter.listenerCount(response?.req, "response")===0) {
                            response?.resume();
                        }

                        let status = response?.statusCode;
                        let s = status / 100 | 0;
                        that._logger.log(that.HTTP, LOG_ID + "  " + chalk[colorCodes[s]](status) + " ← " + signature + " " + chalk.gray(time(start)));
                    })
                    .on("error", function (err) {
                        that._logger.log("error", LOG_ID + "  " + chalk.red("xxx") + " ← " + signature + " " + chalk.red(err.message));
                    });
        }

                if (that._logger.logHttp) {

            try {
                extendObjForGot.handlers = [
                    (options, next) => {
                        //that._logger.log(that.INTERNALERROR, LOG_ID + `Sending ${options.method} to ${options.url}`);
                        that._logger.log(that.HTTP, LOG_ID + chalk.red("DEBUG CONSOLE"), `Sending ${options.method} to ${options.url} \nheaders :`, options.headers, `\nresponseType : ${options.responseType}`, `\nbody : ${options.body}`);
                        return next(options);
                    }
                ];
                // Le wrapper qui nous donne l’accès à req et donc à 'socket'
                extendObjForGot.request = wrapRequest;
            } catch (error) {

            }

            // @ts-ignore
            let fnerror = console.error;
            console.error = function (error, url, line) {
                that._logger.log("error", LOG_ID, chalk.red("DEBUG CONSOLE"), ...arguments);
                //that._logger.log(that.DEBUG, LOG_ID, chalk.red("DEBUG CONSOLE")  , {acc:'error', data:'ERR:'+error+' URL:'+url+' L:'+line});
                // fnerror(...arguments);
            };
        } else {
            try {
                that.mergedGot = got;
            } catch (error) {

            }
        }

        extendObjForGot.timeout = { // This object describes the maximum allowed time for particular events.
                lookup: customLiveOption?.gotRequestOptions?.timeout?.lookup!==undefined ? customLiveOption.gotRequestOptions.timeout.lookup:800, // lookup: 100, Starts when a socket is assigned.  Ends when the hostname has been resolved.
                connect: customLiveOption?.gotRequestOptions?.timeout?.connect!==undefined ? customLiveOption.gotRequestOptions.timeout.connect: 1250, // connect: 50, Starts when lookup completes.  Ends when the socket is fully connected.
                secureConnect: customLiveOption?.gotRequestOptions?.timeout?.secureConnect!==undefined ? customLiveOption.gotRequestOptions.timeout.secureConnect: 1250, // secureConnect: 50, Starts when connect completes. Ends when the handshake process completes.
                socket: customLiveOption?.gotRequestOptions?.timeout?.socket!==undefined ? customLiveOption.gotRequestOptions.timeout.socket: 2000, // socket: 1000, Starts when the socket is connected. Resets when new data is transferred.
                send: customLiveOption?.gotRequestOptions?.timeout?.send!==undefined ? customLiveOption.gotRequestOptions.timeout.send: 90000, // send: 10000, // Starts when the socket is connected. Ends when all data have been written to the socket.
                response: customLiveOption?.gotRequestOptions?.timeout?.response!==undefined ? customLiveOption.gotRequestOptions.timeout.response: 2000 // response: 1000 // Starts when request has been flushed. Ends when the headers are received.
            };

        extendObjForGot.agent = {
                http: this.reqAgentHttp as any,
                https: this.reqAgentHttps as any,
            };
        that.mergedGot = that.mergedGot.extend(extendObjForGot);
        /* that.mergedGot = that.mergedGot.extend({
            timeout: { // This object describes the maximum allowed time for particular events.
                lookup: customLiveOption?.gotRequestOptions?.timeout?.lookup!==undefined ? customLiveOption.gotRequestOptions.timeout.lookup:800, // lookup: 100, Starts when a socket is assigned.  Ends when the hostname has been resolved.
                connect: customLiveOption?.gotRequestOptions?.timeout?.connect!==undefined ? customLiveOption.gotRequestOptions.timeout.connect: 1250, // connect: 50, Starts when lookup completes.  Ends when the socket is fully connected.
                secureConnect: customLiveOption?.gotRequestOptions?.timeout?.secureConnect!==undefined ? customLiveOption.gotRequestOptions.timeout.secureConnect: 1250, // secureConnect: 50, Starts when connect completes. Ends when the handshake process completes.
                socket: customLiveOption?.gotRequestOptions?.timeout?.socket!==undefined ? customLiveOption.gotRequestOptions.timeout.socket: 2000, // socket: 1000, Starts when the socket is connected. Resets when new data is transferred.
                send: customLiveOption?.gotRequestOptions?.timeout?.send!==undefined ? customLiveOption.gotRequestOptions.timeout.send: 90000, // send: 10000, // Starts when the socket is connected. Ends when all data have been written to the socket.
                response: customLiveOption?.gotRequestOptions?.timeout?.response!==undefined ? customLiveOption.gotRequestOptions.timeout.response: 2000 // response: 1000 // Starts when request has been flushed. Ends when the headers are received.
            }
            ,
            // Le wrapper qui nous donne l’accès à req et donc à 'socket'
            request: wrapRequest,
            agent: {
                http: this.reqAgentHttp as any,
                https: this.reqAgentHttps as any,
            }
        }); // */
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

    private findMockRestUrl(verb: string, url: string): any {
        let that = this;
        let mock = that.mockRestUrl.find((m) => m.verb === verb && m.url === url);
        if (mock) {
            return mock.callback;
        }
        return null;
    }

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
        //that._logger.log(that.DEBUG, LOG_ID + "(checkEveryPortals) .");
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
            that._logger.log(that.DEBUG, LOG_ID + "(checkHTTPStatus) httpStatus : ", httpStatus);
        } catch (err) {
            that._logger.log(that.DEBUG, LOG_ID + "(checkHTTPStatus) check Http status failed : ", err);
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
            that._logger.log(that.DEBUG, LOG_ID + "(start) host used : ", that._host);
            that._logger.log(that.INFO, LOG_ID + "(start) REST URL : ", that.serverURL);
            
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
            that.reqAgentHttp?.destroy();
            that.reqAgentHttps?.destroy();
            that._logger.log(that.INFO, LOG_ID + "(stop) Successfully stopped");
            resolve(undefined);
        });
    }

    tokenExpirationControl(bodyjs: { errorCode: number, errorDetails: string }): void {
        let that = this;
        if (bodyjs.errorCode === 401 && bodyjs.errorDetails === "jwt expired") {
            that._logger.log(that.DEBUG, LOG_ID + "(tokenExpirationControl) evt_internal_tokenexpired");
            that.eventEmitter.emit("evt_internal_tokenexpired");
        }
    }

    addAdditionalHeaders (httpConfig : {URL : string, method:string, headers: any}) {
        let that = this;

        try {
            if (httpConfig) {
                if (!httpConfig.method) httpConfig.method = "GET";
            }

            if (this.apiHeadersConfiguration?.length) {
                this.apiHeadersConfiguration.forEach((apiConfig) => {
                    let url = httpConfig?.URL;
                    if (url.indexOf(apiConfig.url)!== -1 && (apiConfig.method==="*" || apiConfig.method===httpConfig.method)) {
                        //add the headers to the request
                        apiConfig.headers.forEach((additionalHeader) => {
                            that._logger.log(that.DEBUG, LOG_ID + "(addAdditionalHeaders) key : ", additionalHeader.key, ", value : ", additionalHeader.value);
                            httpConfig.headers[additionalHeader.key] = additionalHeader.value;
                        });
                    }
                });
            }
        } catch (err) {

        }
    }


    getUrlRaw(url, headers: any = {}, params, nbRetryBeforeFailed : number = 2, timeBetweenRetry = 1000): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.callback = that.findMockRestUrl("GET", url);
        req.method = that._getUrlRaw.bind(this);
        req.params = arguments;
        let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"] ;
        let whoCallMe = callerName();
        req.label = whoCallMe + " method called (getUrlRaw) x-rainbow-correlation-id : " + xRainbowRequestNodeId + ", url : " +  (url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            if (req.callback) {
                return req.callback(...req.params);
            }
            return that._getUrlRaw(url, headers, params, nbRetryBeforeFailed, timeBetweenRetry);
        }
    }

    // VBR CRRAINB returns a fresh one-shot agent after long idle to avoid ECONNRESET on stale keep-alive socket; otherwise reuses the pool agent
    private _pickAgent(): { http: any; https: any } {
        const now = Date.now();
        const idleMs = now - this._lastRequestTime;
        const stale = this._lastRequestTime > 0 && idleMs > this._staleThresholdMs;
        this._lastRequestTime = now;
        if (stale) {
            this._logger.log(this.DEBUG, LOG_ID + `(_pickAgent) idle ${idleMs}ms > threshold ${this._staleThresholdMs}ms — using fresh socket`);
            return { http: new http.Agent(), https: new https.Agent() };
        }
        return { http: this.reqAgentHttp, https: this.reqAgentHttps };
    }

    _getUrlRaw(url, headers: any = {}, params, nbRetryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {

        let that = this;

        return new Promise(async function (resolve, reject) {

            try {
                headers["user-agent"] = USER_AGENT;
                headers["Host"] = urlParse(url).host;
                let urlEncoded = url;

                let httpConfig = {URL: urlEncoded, method: "GET", headers: headers};
                that.addAdditionalHeaders(httpConfig);

                let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"];
                that._logger.log(that.HTTP, LOG_ID + "(_getUrlRaw) url : ", (urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId);
                that._logger.log(that.INTERNAL, LOG_ID + "(_getUrlRaw) url : ", urlEncoded, ", headers : ", headers, ", params : ", params);

                let attemptCount = 0;
                const newAliveAgent: any = () => {
                    let req = {
                        prefixUrl: "",

                        headers,
                        searchParams: params,
                        retry: {
                            limit: nbRetryBeforeFailed,
                            // calculateDelay: ({retryObject}) => {
                            //     /* interface RetryObject {
                            //         attemptCount: number;
                            //         retryOptions: RetryOptions;
                            //         error: RequestError;
                            //         computedValue: number;
                            //         retryAfter?: number;
                            //     } of retryObject */
                            //     that._logger.warn("internal", LOG_ID + "(get) retry HTTP GET, timeBetweenRetry : ", timeBetweenRetry, "ms , retryObject : ", retryObject);
                            //     //return retryObject;
                            //     return timeBetweenRetry;
                            // },
                            //calculateDelay: ({computedValue}) => computedValue,
                            calculateDelay: ({computedValue}) => {
                                let noise = 100;
                                //let computedValueCalculated = ((2 ** (attemptCount - 1)) * 1000) + noise;
                                let shouldBeRun = (nbRetryBeforeFailed - attemptCount) > 0 ? 1:0;
                                let computedValueCalculated = (shouldBeRun * (timeBetweenRetry + noise));
                                attemptCount++;
                                that._logger.warn("warn", LOG_ID + "(get) (calculateDelay) retry HTTP GET, nbRetryBeforeFailed : ", nbRetryBeforeFailed, ",attemptCount : ", attemptCount, ", timeBetweenRetry : ", timeBetweenRetry, "ms , computedValue : ", computedValue, ", computedValueCalculated : ", computedValueCalculated);
                                return computedValueCalculated;
                            },
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
                            // backoffLimit: Number.POSITIVE_INFINITY,
                            noise: 100
                        },
                        hooks: {
                            afterResponse: [
                                (response, retryWithMergedOptions) => {
                                    let body;
                                    let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                                    that._logger.log(that.HTTP, LOG_ID + "(_getUrlRaw) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

                                    if (response) {
                                        if (response?.statusCode) {
                                            // that._logger.log(that.INFO, LOG_ID + "(_getUrlRaw) HTTP statusCode defined : ", response.statusCode);
                                            if (response.statusCode >= 200 && response.statusCode <= 400) {
                                                //if (response) {
                                                //response.body = body;
                                                //}
                                                resolve(response);
                                            } else {
                                                that._logger.warn("warn", LOG_ID + "(_getUrlRaw) HTTP response.code != 200");
                                                that._logger.warn("internal", LOG_ID + "(_getUrlRaw) HTTP response.code != 200 , bodyjs : ", response?.body);
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

                    return req;
                };

                try {

                    const secondInstance = that.mergedGot.extend({mutableDefaults: true, agent: that._pickAgent()});
                    /*secondInstance.defaults.options.hooks = defaults.hooks;
                    secondInstance.defaults.options.retry = defaults.retry;
                    secondInstance.defaults.options.pagination = defaults.pagination; // */

                    let getOptions = newAliveAgent();

                    let response = await secondInstance.get(urlEncoded, getOptions).catch((error) => {
                        that._logger.warn("internal", LOG_ID + "(_getUrlRaw) sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                        return that.treatSystemError("GET Url Raw", error, reject);
                    });
                    that._logger.log(that.DEBUG, LOG_ID + "(_getUrlRaw) done.");

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
                    that._logger.warn("warn", LOG_ID + "(_getUrlRaw) HTTP error.");
                    that._logger.warn("internal", LOG_ID + "(_getUrlRaw) HTTP error statusCode : ", error?.statusCode);
                }

            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(_getUrlRaw) HTTP ErrorManager");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(_getUrlRaw) HTTP ErrorManager : ", err);
                return reject({
                    code: -1,
                    msg: "Unknown error",
                    details: err
                });
            }
        });
    }

    headUrlRaw(url, headers: any = {}, nbRetryBeforeFailed : number = 2, timeBetweenRetry = 1000): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.callback = that.findMockRestUrl("HEAD", url);
        req.method = that._headUrlRaw.bind(this);
        req.params = arguments;
        let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"] ;
        let whoCallMe = callerName();
        req.label = whoCallMe + " method called (head) x-rainbow-correlation-id : " + xRainbowRequestNodeId + ", url : " +  (url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            if (req.callback) {
                return req.callback(...req.params);
            }
            return that._headUrlRaw(url, headers, nbRetryBeforeFailed, timeBetweenRetry);
        }
    }

    _headUrlRaw(url, headers: any = {}, nbRetryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {
        let that = this;

        return new Promise(async function (resolve, reject) {
            try {

                //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
                let urlEncoded = url;
                headers["user-agent"] = USER_AGENT;
                headers["Host"] = urlParse(urlEncoded).host;

                let httpConfig = {URL: urlEncoded, method: "HEAD", headers: headers};
                that.addAdditionalHeaders(httpConfig);

                let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"];
                that._logger.log(that.HTTP, LOG_ID + "(_headUrlRaw) url : ", (urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId);
                that._logger.log(that.INTERNAL, LOG_ID + "(_headUrlRaw) url : ", urlEncoded, ", headers : ", headers);


                let attemptCount = 0;
                const newAliveAgent: any = () => {
                    let req = {
                        prefixUrl: "",

                        headers,
                        //body,
                        //searchParams: params,
                        retry: {
                            limit: nbRetryBeforeFailed,
                            // calculateDelay: ({retryObject}) => {
                            //     /* interface RetryObject {
                            //         attemptCount: number;
                            //         retryOptions: RetryOptions;
                            //         error: RequestError;
                            //         computedValue: number;
                            //         retryAfter?: number;
                            //     } of retryObject */
                            //     that._logger.warn("internal", LOG_ID + "(head) retry HTTP HEAD, retryObject : ", retryObject);
                            //     //return retryObject;
                            //     return 1000;
                            // },
                            //calculateDelay: ({computedValue}) => computedValue,
                            calculateDelay: ({computedValue}) => {
                                let noise = 100;
                                //let computedValueCalculated = ((2 ** (attemptCount - 1)) * 1000) + noise;
                                let shouldBeRun = (nbRetryBeforeFailed - attemptCount) > 0 ? 1:0;
                                let computedValueCalculated = (shouldBeRun * (timeBetweenRetry + noise));
                                attemptCount++;
                                that._logger.warn("warn", LOG_ID + "(get) (calculateDelay) retry HTTP GET, nbRetryBeforeFailed : ", nbRetryBeforeFailed, ",attemptCount : ", attemptCount, ", timeBetweenRetry : ", timeBetweenRetry, "ms , computedValue : ", computedValue, ", computedValueCalculated : ", computedValueCalculated);
                                return computedValueCalculated;
                            },
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
                            // backoffLimit: Number.POSITIVE_INFINITY,
                            noise: 100
                        },
                        hooks: {
                            afterResponse: [
                                (response, retryWithMergedOptions) => {
                                    let body;
                                    let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                                    that._logger.log(that.HTTP, LOG_ID + "(_headUrlRaw) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

                                    if (response) {
                                        if (response?.statusCode) {
                                            // that._logger.log(that.INFO, LOG_ID + "(_headUrlRaw) HTTP statusCode defined : ", response.statusCode);
                                            if (response.statusCode >= 200 && response.statusCode <= 400) {
                                                //if (response) {
                                                //    response.body = body;
                                                //}
                                                resolve(response);
                                            } else {
                                                that._logger.warn("warn", LOG_ID + "(_headUrlRaw) HTTP response.code != 200");
                                                that._logger.warn("internal", LOG_ID + "(_headUrlRaw) HTTP response.code != 200 , bodyjs : ", response?.body);
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

                    return req;
                };

                try {

                    const secondInstance = that.mergedGot.extend({mutableDefaults: true, agent: that._pickAgent()});
                    /*secondInstance.defaults.options.hooks = defaults.hooks;
                    secondInstance.defaults.options.retry = defaults.retry;
                    secondInstance.defaults.options.pagination = defaults.pagination; // */

                    let getOptions = newAliveAgent();

                    let response = await secondInstance.head(urlEncoded, getOptions).catch((error) => {
                        that._logger.warn("internal", LOG_ID + "(head) sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                        return that.treatSystemError("HEAD", error, reject);
                    });
                    that._logger.log(that.DEBUG, LOG_ID + "(head) done.");

                } catch (error) {
                    //
                    //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                    //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                    //
                    that._logger.warn("warn", LOG_ID + "(head) HTTP error.");
                    that._logger.warn("internal", LOG_ID + "(head) HTTP error statusCode : ", error?.statusCode);
                }

            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(_headUrlRaw) HTTP ErrorManager");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(_headUrlRaw) HTTP ErrorManager : ", err);
                return reject({
                    code: -1,
                    msg: "Unknown error",
                    details: err
                });
            }
        });
    }

    postUrlRaw(url, headers: any = {}, data: any = undefined): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.callback = that.findMockRestUrl("POST", url);
        req.method = that._postUrlRaw.bind(this);
        req.params = arguments;
        let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"] ;
        let whoCallMe = callerName();
        req.label = whoCallMe + " method called (postUrlRaw) x-rainbow-correlation-id : " + xRainbowRequestNodeId + ", url : " +  (url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            if (req.callback) {
                return req.callback(...req.params);
            }
            return that._postUrlRaw(url, headers, data);
        }
    }

    _postUrlRaw(url, headers: any = {}, data : any = undefined): Promise<any> {
        let that = this;

        return new Promise(async function (resolve, reject) {
            try {
                //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
                let urlEncoded = url;
                headers["user-agent"] = USER_AGENT;
                headers["Host"] = urlParse(urlEncoded).host;

                let httpConfig = {URL: urlEncoded, method: "POST", headers: headers};
                that.addAdditionalHeaders(httpConfig);

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

                let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"];
                that._logger.log(that.HTTP, LOG_ID + "(_postUrlRaw) url : ", (urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId);
                that._logger.log(that.INTERNAL, LOG_ID + "(_postUrlRaw) url : ", urlEncoded, ", headers : ", headers, ", body : ", body);

                let attemptCount = 0;
                const newAliveAgent: any = () => {
                    let req = {
                        prefixUrl: "",

                        headers,
                        body,
                        //searchParams: params,
                        hooks: {
                            afterResponse: [
                                (response, retryWithMergedOptions) => {
                                    let body;
                                    let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                                    that._logger.log(that.HTTP, LOG_ID + "(_postUrlRaw) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

                                    if (response) {
                                        if (response?.statusCode) {
                                            // that._logger.log(that.INFO, LOG_ID + "(_postUrlRaw) HTTP statusCode defined : ", response.statusCode);
                                            if (response.statusCode >= 200 && response.statusCode <= 400) {
                                                //if (response) {
                                                //  response.body = body;
                                                //}
                                                resolve(response);
                                            } else {
                                                that._logger.warn("warn", LOG_ID + "(_postUrlRaw) HTTP response.code != 200");
                                                that._logger.warn("internal", LOG_ID + "(_postUrlRaw) HTTP response.code != 200 , bodyjs : ", response?.body);
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

                    return req;
                };

                try {

                    const secondInstance = that.mergedGot.extend({mutableDefaults: true, agent: that._pickAgent()});
                    /*secondInstance.defaults.options.hooks = defaults.hooks;
                    secondInstance.defaults.options.retry = defaults.retry;
                    secondInstance.defaults.options.pagination = defaults.pagination; // */

                    let getOptions = newAliveAgent();

                    let response = await secondInstance.post(urlEncoded, getOptions).catch((error) => {
                        that._logger.warn("internal", LOG_ID + "(_postUrlRaw) sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                        return that.treatSystemError("POST Url Raw", error, reject);
                    });
                    that._logger.log(that.DEBUG, LOG_ID + "(_postUrlRaw) done.");

                } catch (error) {
                    //
                    //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                    //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                    //
                    that._logger.warn("warn", LOG_ID + "(_postUrlRaw) HTTP error.");
                    that._logger.warn("internal", LOG_ID + "(_postUrlRaw) HTTP error statusCode : ", error?.statusCode);
                }

            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(_postUrlRaw) HTTP ErrorManager");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(_postUrlRaw) HTTP ErrorManager : ", err);
                return reject({
                    code: -1,
                    msg: "Unknown error",
                    details: err
                });
            }
        });
    }

    putUrlRaw(url, headers: any = {}, data: any = undefined): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.callback = that.findMockRestUrl("PUT", url);
        req.method = that._putUrlRaw.bind(this);
        req.params = arguments;
        let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"] ;
        let whoCallMe = callerName();
        req.label = whoCallMe + " method called (putUrlRaw) x-rainbow-correlation-id : " + xRainbowRequestNodeId + ", url : " +  (url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            if (req.callback) {
                return req.callback(...req.params);
            }
            return that._putUrlRaw(url, headers, data);
        }
    }

    _putUrlRaw(url, headers: any = {}, data : any = undefined): Promise<any> {
        let that = this;

        return new Promise(async function (resolve, reject) {
            try {
                //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
                let urlEncoded = url;

                let httpConfig = {URL: urlEncoded, method: "PUT", headers: headers};
                that.addAdditionalHeaders(httpConfig);

                let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"];
                that._logger.log(that.HTTP, LOG_ID + "(_putUrlRaw) url : ", (urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId);

                headers["user-agent"] = USER_AGENT;
                headers["Host"] = urlParse(urlEncoded).host;
                that._logger.log(that.INTERNAL, LOG_ID + "(_putUrlRaw) url : ", urlEncoded, ", headers : ", headers, ", data : ", data);

                let body = data;
                //that._logger.log(that.INTERNAL, LOG_ID + "(_putUrlRaw) url : ", urlEncoded);
                let attemptCount = 0;
                const newAliveAgent: any = () => {
                    let req = {
                        prefixUrl: "",

                        headers,
                        body,
                        //searchParams: params,
                        hooks: {
                            afterResponse: [
                                (response, retryWithMergedOptions) => {
                                    let body;
                                    let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                                    that._logger.log(that.HTTP, LOG_ID + "(_putUrlRaw) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

                                    if (response) {
                                        if (response?.statusCode) {
                                            // that._logger.log(that.INFO, LOG_ID + "(_putUrlRaw) HTTP statusCode defined : ", response.statusCode);
                                            if (response.statusCode >= 200 && response.statusCode <= 400) {
                                                //if (response) {
                                                //  response.body = body;
                                                //}
                                                resolve(response);
                                            } else {
                                                that._logger.warn("warn", LOG_ID + "(_putUrlRaw) HTTP response.code != 200");
                                                that._logger.warn("internal", LOG_ID + "(_putUrlRaw) HTTP response.code != 200 , bodyjs : ", response?.body);
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

                    return req;
                };

                try {

                    const secondInstance = that.mergedGot.extend({mutableDefaults: true, agent: that._pickAgent()});

                    let getOptions = newAliveAgent();
                    let response = await secondInstance.put(urlEncoded, getOptions).catch((error) => {
                        that._logger.warn("internal", LOG_ID + "(_putUrlRaw) sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                        return that.treatSystemError("PUT Url Raw", error, reject);
                    });
                    that._logger.log(that.DEBUG, LOG_ID + "(_putUrlRaw) done.");

                } catch (error) {
                    //
                    //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                    //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                    //
                    that._logger.warn("warn", LOG_ID + "(_putUrlRaw) HTTP error.");
                    that._logger.warn("internal", LOG_ID + "(_putUrlRaw) HTTP error statusCode : ", error?.statusCode);
                }

            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(_putUrlRaw) HTTP ErrorManager");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(_putUrlRaw) HTTP ErrorManager : ", err);
                return reject({
                    code: -1,
                    msg: "Unknown error",
                    details: err
                });
            }
        });
    }

    deleteUrlRaw(url, headers: any = {}, data : any = undefined, nbRetryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.callback = that.findMockRestUrl("DELETE", url);
        req.method = that._deleteUrlRaw.bind(this);
        req.params = arguments;
        let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"] ;
        let whoCallMe = callerName();
        req.label = whoCallMe + " method called (deleteUrlRaw) x-rainbow-correlation-id : " + xRainbowRequestNodeId + ", url : " +  (url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            if (req.callback) {
                return req.callback(...req.params);
            }
            return that._deleteUrlRaw(url, headers, data, nbRetryBeforeFailed, timeBetweenRetry);
        }

    }

    _deleteUrlRaw(url, headers: any = {}, data : any = undefined, nbRetryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {

        let that = this;

        return new Promise(async function (resolve, reject) {
            try {

                //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
                let urlEncoded = url;

                let httpConfig = {URL: urlEncoded, method: "DELETE", headers: headers};
                that.addAdditionalHeaders(httpConfig);

                let body = data;

                let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"];
                that._logger.log(that.HTTP, LOG_ID + "(_deleteUrlRaw) url : ", (urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId);

                headers["user-agent"] = USER_AGENT;
                headers["Host"] = urlParse(urlEncoded).host;
                that._logger.log(that.INTERNAL, LOG_ID + "(_deleteUrlRaw) url : ", urlEncoded, ", headers : ", headers, ", body : ", body);

                let attemptCount = 0;
                const newAliveAgent: any = () => {
                    let req: any = {
                        prefixUrl: "",

                        headers,
                        // body,
                        //searchParams: params,
                        retry: {
                            limit: nbRetryBeforeFailed,
                            // calculateDelay: ({retryObject}) => {
                            //     /* interface RetryObject {
                            //         attemptCount: number;
                            //         retryOptions: RetryOptions;
                            //         error: RequestError;
                            //         computedValue: number;
                            //         retryAfter?: number;
                            //     } of retryObject */
                            //     that._logger.warn("internal", LOG_ID + "(delete) retry HTTP GET, retryObject : ", retryObject);
                            //     //return retryObject;
                            //     return 1000;
                            // },
                            //calculateDelay: ({computedValue}) => computedValue,
                            calculateDelay: ({computedValue}) => {
                                let noise = 100;
                                //let computedValueCalculated = ((2 ** (attemptCount - 1)) * 1000) + noise;
                                let shouldBeRun = (nbRetryBeforeFailed - attemptCount) > 0 ? 1:0;
                                let computedValueCalculated = (shouldBeRun * (timeBetweenRetry + noise));
                                attemptCount++;
                                that._logger.warn("warn", LOG_ID + "(get) (calculateDelay) retry HTTP GET, nbRetryBeforeFailed : ", nbRetryBeforeFailed, ",attemptCount : ", attemptCount, ", timeBetweenRetry : ", timeBetweenRetry, "ms , computedValue : ", computedValue, ", computedValueCalculated : ", computedValueCalculated);
                                return computedValueCalculated;
                            },
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
                            // backoffLimit: Number.POSITIVE_INFINITY,
                            noise: 100
                        },
                        hooks: {
                            afterResponse: [
                                (response, retryWithMergedOptions) => {
                                    let body;
                                    let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                                    that._logger.log(that.HTTP, LOG_ID + "(_deleteUrlRaw) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

                                    if (response) {
                                        if (response?.statusCode) {
                                            // that._logger.log(that.INFO, LOG_ID + "(_deleteUrlRaw) HTTP code", response.code);
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
                                                that._logger.log(that.ERROR, LOG_ID + "(_deleteUrlRaw) HTTP security issue : ", response.error.reason);
                                                reject({
                                                    code: -1,
                                                    url: urlEncoded,
                                                    msg: response.error.reason,
                                                    details: "",
                                                    headers: response ? response.headers:undefined
                                                });
                                            } else {
                                                that._logger.warn("error", LOG_ID + "(_deleteUrlRaw) HTTP other issue.");
                                                that._logger.warn("internalerror", LOG_ID + "(_deleteUrlRaw) HTTP other issue , response : ", JSON.stringify(response), " response.message : ", response.message);
                                                that._logger.log(that.INTERNAL, LOG_ID + "(_deleteUrlRaw) HTTP other issue", response);
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

                    return req;
                };

                try {

                    const secondInstance = that.mergedGot.extend({mutableDefaults: true, agent: that._pickAgent()});
                    /*secondInstance.defaults.options.hooks = defaults.hooks;
                    secondInstance.defaults.options.retry = defaults.retry;
                    secondInstance.defaults.options.pagination = defaults.pagination; // */


                    let getOptions = newAliveAgent();
                    let response = await secondInstance.delete(urlEncoded, getOptions).catch((error) => {
                        that._logger.warn("internal", LOG_ID + "(_deleteUrlRaw) sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                        return that.treatSystemError("DELETE Url Raw", error, reject);
                    });
                    that._logger.log(that.DEBUG, LOG_ID + "(_deleteUrlRaw) done.");

                } catch (error) {
                    //
                    //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                    //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                    //
                    that._logger.warn("warn", LOG_ID + "(_deleteUrlRaw) HTTP error.");
                    that._logger.warn("internal", LOG_ID + "(_deleteUrlRaw) HTTP error statusCode : ", error?.statusCode);
                }

            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(_deleteUrlRaw) HTTP ErrorManager");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(_deleteUrlRaw) HTTP ErrorManager : ", err);
                return reject({
                    code: -1,
                    msg: "Unknown error",
                    details: err
                });
            }

        });
    }

    getUrlJson(url, headers: any = {}, params, nbRetryBeforeFailed : number = 2, timeBetweenRetry = 1000): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.callback = that.findMockRestUrl("GET", url);
        req.method = that._getUrlJson.bind(this);
        req.params = arguments;
        let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"] ;
        let whoCallMe = callerName();
        req.label = whoCallMe + " method called (getUrl) x-rainbow-correlation-id : " + xRainbowRequestNodeId + ", url : " +  (url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            if (req.callback) {
                return req.callback(...req.params);
            }
            return that._getUrlJson(url, headers, params, nbRetryBeforeFailed, timeBetweenRetry);
        }
    }

    _getUrlJson(url, headers: any = {}, params, nbRetryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {

        let that = this;

        return new Promise(async function (resolve, reject) {

            try {
                headers["user-agent"] = USER_AGENT;
                headers["Host"] = urlParse(url).host;
                let urlEncoded = url;

                let httpConfig = {URL: urlEncoded, method: "GET", headers: headers};
                that.addAdditionalHeaders(httpConfig);

                let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"];
                that._logger.log(that.HTTP, LOG_ID + "(_getUrlJson) url : ", (urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId);

                that._logger.log(that.INTERNAL, LOG_ID + "(_getUrlJson) url : ", urlEncoded, ", headers : ", headers, ", params : ", params);

                let attemptCount = 0;
                const newAliveAgent: any = () => {
                    let req = {
                        prefixUrl: "",
                        /*                            agent: {
                                                        http: undefined,
                                                        https: undefined
                                                        //http: agent,
                                                        //https: agent

                                                        //http: new HttpAgent(liveOption),
                                                        //https: new HttpsAgent(liveOption)
                                                        //
                                                    },
                        // */
                        headers,
                        searchParams: params,
                        retry: {
                            limit: nbRetryBeforeFailed,
                            // calculateDelay: ({retryObject}) => {
                            //     /* interface RetryObject {
                            //         attemptCount: number;
                            //         retryOptions: RetryOptions;
                            //         error: RequestError;
                            //         computedValue: number;
                            //         retryAfter?: number;
                            //     } of retryObject */
                            //     that._logger.warn("internal", LOG_ID + "(get) retry HTTP GET, timeBetweenRetry : ", timeBetweenRetry, "ms , retryObject : ", retryObject);
                            //     //return retryObject;
                            //     return timeBetweenRetry;
                            // },
                            // calculateDelay: ({computedValue}) => computedValue,
                            calculateDelay: ({computedValue}) => {
                                let noise = 100;
                                //let computedValueCalculated = ((2 ** (attemptCount - 1)) * 1000) + noise;
                                let shouldBeRun = (nbRetryBeforeFailed - attemptCount) > 0 ? 1:0;
                                let computedValueCalculated = (shouldBeRun * (timeBetweenRetry + noise));
                                attemptCount++;
                                that._logger.warn("warn", LOG_ID + "(get) (calculateDelay) retry HTTP GET, nbRetryBeforeFailed : ", nbRetryBeforeFailed, ",attemptCount : ", attemptCount, ", timeBetweenRetry : ", timeBetweenRetry, "ms , computedValue : ", computedValue, ", computedValueCalculated : ", computedValueCalculated);
                                return computedValueCalculated;
                            },
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
                            // backoffLimit: Number.POSITIVE_INFINITY,
                            noise: 100
                        },
                        hooks: {
                            afterResponse: [
                                (response, retryWithMergedOptions) => {
                                    let body;
                                    let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                                    that._logger.log(that.HTTP, LOG_ID + "(_getUrlJson) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

                                    if (response) {
                                        if (response?.statusCode) {
                                            // that._logger.log(that.INFO, LOG_ID + "(_getUrlJson) HTTP statusCode defined : ", response.statusCode);
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
                                                that._logger.warn("warn", LOG_ID + "(_getUrlJson) HTTP response.code != 200");
                                                that._logger.warn("internal", LOG_ID + "(_getUrlJson) HTTP response.code != 200 , bodyjs : ", response.body);
                                                let bodyjs: any = {};
                                                if (that.hasJsonStructure(response.body)) {
                                                    bodyjs = JSON.parse(response.body);
                                                } else {
                                                    bodyjs.errorMsg = response.body;
                                                }
                                                let msg = response.statusMessage ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                                let errorMsgDetail = bodyjs ? bodyjs.errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:""):"";
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

                    return req;
                };

                try {

                    const secondInstance = that.mergedGot.extend({mutableDefaults: true, agent: that._pickAgent()});
                    /*secondInstance.defaults.options.hooks = defaults.hooks;
                    secondInstance.defaults.options.retry = defaults.retry;
                    secondInstance.defaults.options.pagination = defaults.pagination; // */

                    let getOptions = newAliveAgent();

                    let response = await secondInstance.get(urlEncoded, getOptions).catch((error) => {
                        that._logger.warn("internal", LOG_ID + "(_getUrlJson) sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                        return that.treatSystemError("GET Url Json", error, reject);
                    });
                    that._logger.log(that.DEBUG, LOG_ID + "(_getUrlJson) done.");

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
                    that._logger.warn("warn", LOG_ID + "(_getUrlJson) HTTP error.");
                    that._logger.warn("internal", LOG_ID + "(_getUrlJson) HTTP error statusCode : ", error?.statusCode);
                }

            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(_getUrlJson) HTTP ErrorManager");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(_getUrlJson) HTTP ErrorManager", err);
                return reject({
                    code: -1,
                    msg: "Unknown error",
                    details: ""
                });
            }
        });
    }
    
    treatSystemError(verb: string, error : any, rejectCallback : any) {
        let that = this;
        const responseParts = [
            error?.response?.status != null ? `response.status : ${error.response.status}` : null,
            error?.response?.statusText != null ? `response.statusText : ${error.response.statusText}` : null,
        ].filter(Boolean).join(", ");
        const responseSummary = responseParts ? `, ${responseParts}` : "";
        const errSummary = (error?.message != null
            ? `error.code : ${error?.code}, error.message : ${error?.message}`
            : `error.code : ${error?.code}, error : ${JSON.stringify(error, (_k, v) => typeof v === "function" ? undefined : v)}`)
            + responseSummary;
        if (error.code) {
            // Network error
            switch (error.code) {
                case "ERR_NON_2XX_3XX_RESPONSE":
                    // ERR_NON_2XX_3XX_RESPONSE: returned error is a non-2XX/3XX HTTP status code.
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", returned error is a no 2XX or 3XX http code error, " + errSummary);
                    break;
                case "ECONNRESET":
                    // ECONNRESET: Connection reset (Connection forcibly closed by the remote host)
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Connection reset (Connection forcibly closed by the remote host), " + errSummary);
                    break;
                case "ETIMEDOUT":
                    // ETIMEDOUT: Timeout exceeded (The request took too long to complete)
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Timeout exceeded (The request took too long to complete), " + errSummary);
                    break;
                case "ECONNREFUSED":
                    // ECONNREFUSED: Connection refused (No server is accepting connections at the target address)
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Connection refused (No server is accepting connections at the target address), " + errSummary);
                    break;
                case "ENOTFOUND":
                    // ENOTFOUND: Host not found (DNS lookup failed for the requested domain)
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Host not found (DNS lookup failed for the requested domain), " + errSummary);
                    break;
                case "EAI_AGAIN":
                    // EAI_AGAIN: Temporary DNS failure (Try again later — DNS server didn’t respond)
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Temporary DNS failure (Try again later — DNS server didn’t respond), " + errSummary);
                    break;
                case "EPROTO":
                    // EPROTO: Protocol error (Usually SSL/TLS negotiation failure)
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Protocol error (Usually SSL/TLS negotiation failure), " + errSummary);
                    break;
                case "ECANCELED":
                    // ECANCELED: Request canceled (Manually aborted or auto-timeout triggered)
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Request canceled (Manually aborted or auto-timeout triggered), " + errSummary);
                    break;
                case "EHOSTUNREACH":
                    // EHOSTUNREACH: Host unreachable (No route to the target host)
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Host unreachable (No route to the target host), " + errSummary);
                    break;
                case "EPIPE":
                    // EPIPE: Broken pipe (Writing to a closed connection/socket)
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Broken pipe (Writing to a closed connection/socket), " + errSummary);
                    break;
                case "ENETUNREACH":
                    // ENETUNREACH: Network unreachable (No network route to the destination)
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Network unreachable (No network route to the destination), " + errSummary);
                    break;
                case "CERT_HAS_EXPIRED":
                    // CERT_HAS_EXPIRED: SSL certificate has expired
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", SSL certificate has expired, " + errSummary);
                    break;
                case "DEPTH_ZERO_SELF_SIGNED_CERT":
                    // DEPTH_ZERO_SELF_SIGNED_CERT: Self-signed certificate not trusted
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Self-signed certificate not trusted, " + errSummary);
                    break;
                case "UNABLE_TO_VERIFY_LEAF_SIGNATURE":
                    // UNABLE_TO_VERIFY_LEAF_SIGNATURE: Unable to verify leaf certificate signature
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Unable to verify leaf certificate signature, " + errSummary);
                    break;
                case "ERR_TLS_CERT_ALTNAME_INVALID":
                    // ERR_TLS_CERT_ALTNAME_INVALID: Certificate’s Subject Alternative Name does not match the hostname
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Certificate’s Subject Alternative Name does not match the hostname, " + errSummary);
                    break;
                default:
                    that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Unhandled error code, " + errSummary);
            }

            /*
             // Common errors of all verbs
             ECONNREFUSED: Connection refused (no server at the address)
             ECONNRESET:   Connection reset (usually server-side)
             ETIMEDOUT:    Request timeout exceeded
             ENOTFOUND:    Host not found (DNS)
             EAI_AGAIN:    Temporary DNS failure
             EPROTO:       Protocol error (usually SSL/TLS)
             CERT_HAS_EXPIRED:              SSL certificate expired
             UNABLE_TO_VERIFY_LEAF_SIGNATURE: Certificate not verified
             // */

            return rejectCallback (error);
        } else {
            // Other errors
            that._logger.warn("warn", LOG_ID + "(treatSystemError) " + verb + ", Unknown error, " + errSummary);
            return rejectCallback (error);
        }
    }

    get(url, headers: any = {}, params, responseType = "", nbRetryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.callback = that.findMockRestUrl("GET", url);
        req.method = that._get.bind(this);
        req.params = arguments;
        let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"] ;
        let whoCallMe = callerName();
        //that._logger.log(that.INFO, LOG_ID + "(get) whoCallMe : ", whoCallMe);
        req.label = whoCallMe + " method called (get) x-rainbow-correlation-id : " + xRainbowRequestNodeId + ", url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            if (req.callback) {
                return req.callback(...req.params);
            }
            return that._get(url, headers, params, responseType, nbRetryBeforeFailed, timeBetweenRetry);
        }
    }

    _get(url,headers: any = {}, params, responseType = "", nbRetryBeforeFailed : number = 2, timeBetweenRetry = 1000): Promise<any> {
        let that = this;

        return new Promise(async function (resolve, reject) {
            try {
                headers["user-agent"] = USER_AGENT;
                headers["Host"] = urlParse(url, that.serverURL).host;

                //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
                let urlEncoded = that.serverURL + url;

                let httpConfig = {URL: urlEncoded, method: "GET", headers: headers};
                that.addAdditionalHeaders(httpConfig);

                let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"];
                that._logger.log(that.HTTP, LOG_ID + "(get) url : ", (urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId);

                that._logger.log(that.INTERNAL, LOG_ID + "(get) url : ", urlEncoded, ", headers : ", headers, ", params : ", params);

                if (headers.Accept && headers?.Accept?.indexOf("json") > -1) {
                    let attemptCount = 0;
                    const newAliveAgent: any = () => {
                        let req = {
                            prefixUrl: "",
                            /*                            agent: {
                                                            http: undefined,
                                                            https: undefined
                                                            //http: agent,
                                                            //https: agent

                                                            //http: new HttpAgent(liveOption),
                                                            //https: new HttpsAgent(liveOption)
                                                            //
                                                        },
                            // */
                            headers,
                            searchParams: params,
                            retry: {
                                limit: nbRetryBeforeFailed,
                                // calculateDelay: ({retryObject}) => {
                                //     /* interface RetryObject {
                                //         attemptCount: number;
                                //         retryOptions: RetryOptions;
                                //         error: RequestError;
                                //         computedValue: number;
                                //         retryAfter?: number;
                                //     } of retryObject */
                                //     that._logger.warn("internal", LOG_ID + "(get) retry HTTP GET, timeBetweenRetry : ", timeBetweenRetry, "ms , retryObject : ", retryObject);
                                //     //return retryObject;
                                //     return timeBetweenRetry;
                                // },
                                //calculateDelay: ({computedValue}) => computedValue,
                                //calculateDelay:  ({computedValue}) => computedValue / 10,
                                calculateDelay: ({computedValue}) => {
                                    let noise = 100;
                                    //let computedValueCalculated = ((2 ** (attemptCount - 1)) * 1000) + noise;
                                    let shouldBeRun = (nbRetryBeforeFailed - attemptCount) > 0 ? 1:0;
                                    let computedValueCalculated = (shouldBeRun * (timeBetweenRetry + noise));
                                    attemptCount++;
                                    that._logger.warn("warn", LOG_ID + "(get) (calculateDelay) retry HTTP GET, nbRetryBeforeFailed : ", nbRetryBeforeFailed, ",attemptCount : ", attemptCount, ", timeBetweenRetry : ", timeBetweenRetry, "ms , computedValue : ", computedValue, ", computedValueCalculated : ", computedValueCalculated);
                                    return computedValueCalculated;
                                },
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
                                // backoffLimit: Number.POSITIVE_INFINITY,
                                noise: 100
                            },
                            hooks: {
                                afterResponse: [
                                    (response, retryWithMergedOptions) => {
                                        let body;
                                        let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                                        that._logger.log(that.HTTP, LOG_ID + "(get) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

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
                                            that._logger.warn("warn", LOG_ID + "(get) afterResponseHTTP response.code != 200");
                                            that._logger.warn("internal", LOG_ID + "(get) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", bodyjs : ", response.body);
                                            that._logger.warn("internal", LOG_ID + "(get) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", response.headers : ", response.headers, ", response.statusMessage : ", response.statusMessage);
                                            let bodyjs: any = {};
                                            if (that.hasJsonStructure(response.body)) {
                                                bodyjs = JSON.parse(response.body);
                                            } else {
                                                bodyjs.errorMsg = response.body;
                                            }
                                            let msg = (response && response.statusMessage) ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                            let errorMsgDetail = bodyjs ? bodyjs.errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:""):"";
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

                        return req;
                    };

                    try {

                        const secondInstance = that.mergedGot.extend({mutableDefaults: true, agent: that._pickAgent()});
                        /*secondInstance.defaults.options.hooks = defaults.hooks;
                        secondInstance.defaults.options.retry = defaults.retry;
                        secondInstance.defaults.options.pagination = defaults.pagination; // */

                        let getOptions = newAliveAgent();

                        let response = await secondInstance.get(urlEncoded, getOptions).catch((error) => {
                            that._logger.warn("internal", LOG_ID + "(get) sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                            return that.treatSystemError("GET", error, reject);
                        });
                        that._logger.log(that.DEBUG, LOG_ID + "(get) done by GOT.");

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
                        that._logger.warn("warn", LOG_ID + "(get) HTTP error.");
                        that._logger.warn("internal", LOG_ID + "(get) HTTP error statusCode : ", error?.statusCode);
                    }

                    that._logger.log(that.DEBUG, LOG_ID + "(get) end by GOT.");
// */
                } else {
                    try {
                        let result = await that._getUrlRaw(url, headers, params, nbRetryBeforeFailed, timeBetweenRetry);
                        resolve(result.body);
                    } catch (err) {
                        reject(err);
                    }
                }
            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(get) HTTP ErrorManager");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(get) HTTP ErrorManager : ", err);
                return reject({
                    code: -1,
                    msg: "Unknown error",
                    details: ""
                });
            }
        });
    }

    post(url, headers: any = {}, data: any = undefined, contentType : string = undefined, nbRetryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.callback = that.findMockRestUrl("POST", url);
        req.method = that._post.bind(this);
        req.params = arguments;
        let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"] ;
        let whoCallMe = callerName();
        req.label = whoCallMe + " method called (post) x-rainbow-correlation-id : " + xRainbowRequestNodeId + ", url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            if (req.callback) {
                return req.callback(...req.params);
            }
            return that._post(url, headers, data, contentType, nbRetryBeforeFailed, timeBetweenRetry);
        }
    }

    _post(url, headers: any = {}, data: any = undefined, contentType : string = undefined, nbRetryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {
        let that = this;

        return new Promise(async function (resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            let httpConfig = {URL: urlEncoded, method: "POST", headers: headers};
            that.addAdditionalHeaders(httpConfig);

            headers["user-agent"] = USER_AGENT;
            headers["Host"] = urlParse(urlEncoded).host;
            let body = data;
            if (contentType) {
                //request.type(type);
                headers["Content-Type"] = contentType;
            } else {
                //request.type("json");
                if (!headers["Content-Type"]) {
                    headers["Content-Type"] = "application/json";
                    //body = JSON.stringify(data);
                }
            } // */

            if (headers["Content-Type"]==="application/json") {
                body = typeof data!=="string" ? JSON.stringify(data):data;
            }

            let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"];
            that._logger.log(that.HTTP, LOG_ID + "(post) url : ", (urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId);

            that._logger.log(that.INTERNAL, LOG_ID + "(post) url : ", urlEncoded, ", headers : ", headers, ", body : ", body);
            let attemptCount = 0;
            const newAliveAgent: any = () => {
                let req = {
                    prefixUrl: "",
                    /*                            agent: {
                                                    http: undefined,
                                                    https: undefined
                                                    //http: agent,
                                                    //https: agent

                                                    //http: new HttpAgent(liveOption),
                                                    //https: new HttpsAgent(liveOption)
                                                    //
                                                },
                    // */
                    headers,
                    body,
                    //searchParams: params,
                    retry: {
                        limit: nbRetryBeforeFailed,
                        // calculateDelay: ({retryObject}) => {
                        //     /* interface RetryObject {
                        //         attemptCount: number;
                        //         retryOptions: RetryOptions;
                        //         error: RequestError;
                        //         computedValue: number;
                        //         retryAfter?: number;
                        //     } of retryObject */
                        //     that._logger.warn("internal", LOG_ID + "(get) retry HTTP PUT, retryObject : ", retryObject);
                        //     //return retryObject;
                        //     return 1000;
                        // },
                        // calculateDelay: ({computedValue}) => computedValue,
                        calculateDelay: ({computedValue}) => {
                            let noise = 100;
                            //let computedValueCalculated = ((2 ** (attemptCount - 1)) * 1000) + noise;
                            let shouldBeRun = (nbRetryBeforeFailed - attemptCount) > 0 ? 1:0;
                            let computedValueCalculated = (shouldBeRun * (timeBetweenRetry + noise));
                            attemptCount++;
                            that._logger.warn("warn", LOG_ID + "(get) (calculateDelay) retry HTTP GET, nbRetryBeforeFailed : ", nbRetryBeforeFailed, ",attemptCount : ", attemptCount, ", timeBetweenRetry : ", timeBetweenRetry, "ms , computedValue : ", computedValue, ", computedValueCalculated : ", computedValueCalculated);
                            return computedValueCalculated;
                        },
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
                        // backoffLimit: Number.POSITIVE_INFINITY,
                        noise: 100
                    },
                    hooks: {
                        beforeRequest: [function (options) {
                            //that._logger.log(that.HTTP, LOG_ID + "(post) beforeRequest url : ", ( urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId,", options : ", options);
                        }],
                        afterResponse: [
                            (response, retryWithMergedOptions) => {
                                let body;
                                let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                                that._logger.log(that.HTTP, LOG_ID + "(post) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

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
                                        that._logger.warn("warn", LOG_ID + "(post) afterResponseHTTP response.code != 200");
                                        that._logger.warn("internal", LOG_ID + "(post) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", bodyjs : ", response.body);
                                        that._logger.warn("internal", LOG_ID + "(post) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", response.headers : ", response.headers, ", response.statusMessage : ", response.statusMessage);
                                        let bodyjs: any = {};
                                        if (that.hasJsonStructure(response.body)) {
                                            bodyjs = JSON.parse(response.body);
                                        } else {
                                            bodyjs.errorMsg = response.body;
                                        }

                                        that._logger.warn("warn", LOG_ID + "(post) HTTP response.code != 200 ");
                                        that._logger.warn("internal", LOG_ID + "(post) HTTP response.code != 200 , body : ", bodyjs);
                                        let msg = response.statusMessage ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                        let errorDetails = bodyjs.errorDetails;
                                        if (errorDetails) {
                                            if (typeof errorDetails==="object") {
                                                // errorDetails = JSON.stringify(errorDetails);
                                                errorDetails = util.inspect(errorDetails, false, 4, true);
                                            }
                                        }
                                        let errorMsgDetail = bodyjs ? errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:""):"";
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
                                        that._logger.log(that.ERROR, LOG_ID + "(post) HTTP security issue", response.error.reason);
                                        reject({
                                            code: -1,
                                            url: urlEncoded,
                                            msg: response.error.reason,
                                            details: "",
                                            headers: response ? response.headers:undefined
                                        });
                                    } else {
                                        that._logger.warn("error", LOG_ID + "(post) HTTP other issue.");
                                        that._logger.warn("internalerror", LOG_ID + "(post) HTTP other issue , response : ", JSON.stringify(response) + " response.message : " + response?.message);
                                        that._logger.log(that.INTERNAL, LOG_ID + "(post) HTTP other issue", response);
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
                        ]
                    },
                };

                return req;
            };

            try {

                const secondInstance = that.mergedGot.extend({mutableDefaults: true, agent: that._pickAgent()});
                /*secondInstance.defaults.options.hooks = defaults.hooks;
                secondInstance.defaults.options.retry = defaults.retry;
                secondInstance.defaults.options.pagination = defaults.pagination; // */


                let getOptions = newAliveAgent();
                let response = await secondInstance.post(urlEncoded, getOptions).catch((error) => {
                    that._logger.warn("internal", LOG_ID + "(post) sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                    return that.treatSystemError("POST", error, reject);
                });
                that._logger.log(that.DEBUG, LOG_ID + "(post) done.");

            } catch (error) {
                //
                //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                //
                that._logger.warn("warn", LOG_ID + "(post) HTTP error.");
                that._logger.warn("internal", LOG_ID + "(post) HTTP error statusCode : ", error?.statusCode);
            }

// */
        });
    }

    head(url, headers: any = {}, nbRetryBeforeFailed : number = 2, timeBetweenRetry = 1000): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.callback = that.findMockRestUrl("HEAD", url);
        req.method = that._head.bind(this);
        req.params = arguments;
        let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"] ;
        let whoCallMe = callerName();
        req.label = whoCallMe + " method called (head) x-rainbow-correlation-id : " + xRainbowRequestNodeId + ", url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            if (req.callback) {
                return req.callback(...req.params);
            }
            return that._head(url, headers, nbRetryBeforeFailed, timeBetweenRetry);
        }
    }

    _head(url, headers: any = {}, nbRetryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {
        let that = this;

        return new Promise(async function (resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            let httpConfig = {URL: urlEncoded, method: "HEAD", headers: headers};
            that.addAdditionalHeaders(httpConfig);

            headers["user-agent"] = USER_AGENT;
            headers["Host"] = urlParse(urlEncoded).host;

            let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"];
            that._logger.log(that.HTTP, LOG_ID + "(head) url : ", (urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId);

            that._logger.log(that.INTERNAL, LOG_ID + "(head) url : ", urlEncoded, ", headers : ", headers);

            let attemptCount = 0;
            const newAliveAgent: any = () => {
                let req = {
                    prefixUrl: "",
                    /*                            agent: {
                                                    http: undefined,
                                                    https: undefined
                                                    //http: agent,
                                                    //https: agent

                                                    //http: new HttpAgent(liveOption),
                                                    //https: new HttpsAgent(liveOption)
                                                    //
                                                },
                    // */
                    headers,
                    //body,
                    //searchParams: params,
                    retry: {
                        limit: nbRetryBeforeFailed,
                        // calculateDelay: ({retryObject}) => {
                        //     /* interface RetryObject {
                        //         attemptCount: number;
                        //         retryOptions: RetryOptions;
                        //         error: RequestError;
                        //         computedValue: number;
                        //         retryAfter?: number;
                        //     } of retryObject */
                        //     that._logger.warn("internal", LOG_ID + "(head) retry HTTP HEAD, retryObject : ", retryObject);
                        //     //return retryObject;
                        //     return 1000;
                        // },
                        //calculateDelay: ({computedValue}) => computedValue,
                        calculateDelay: ({computedValue}) => {
                            let noise = 100;
                            //let computedValueCalculated = ((2 ** (attemptCount - 1)) * 1000) + noise;
                            let shouldBeRun = (nbRetryBeforeFailed - attemptCount) > 0 ? 1:0;
                            let computedValueCalculated = (shouldBeRun * (timeBetweenRetry + noise));
                            attemptCount++;
                            that._logger.warn("warn", LOG_ID + "(get) (calculateDelay) retry HTTP GET, nbRetryBeforeFailed : ", nbRetryBeforeFailed, ",attemptCount : ", attemptCount, ", timeBetweenRetry : ", timeBetweenRetry, "ms , computedValue : ", computedValue, ", computedValueCalculated : ", computedValueCalculated);
                            return computedValueCalculated;
                        },
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
                        // backoffLimit: Number.POSITIVE_INFINITY,
                        noise: 100
                    },
                    hooks: {
                        afterResponse: [
                            (response, retryWithMergedOptions) => {
                                let body;
                                let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                                that._logger.log(that.HTTP, LOG_ID + "(head) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

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
                                        that._logger.warn("warn", LOG_ID + "(head) afterResponseHTTP response.code != 200");
                                        that._logger.warn("internal", LOG_ID + "(head) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", bodyjs : ", response.body);
                                        that._logger.warn("internal", LOG_ID + "(head) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", response.headers : ", response.headers, ", response.statusMessage : ", response.statusMessage);
                                        let bodyjs: any = {};
                                        if (that.hasJsonStructure(response.body)) {
                                            bodyjs = JSON.parse(response.body);
                                        } else {
                                            bodyjs.errorMsg = response.body;
                                        }

                                        that._logger.warn("warn", LOG_ID + "(head) HTTP response.code != 200 ");
                                        that._logger.warn("internal", LOG_ID + "(head) HTTP response.code != 200 , body : ", bodyjs);
                                        let msg = response.statusMessage ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                        let errorDetails = bodyjs.errorDetails;
                                        if (errorDetails) {
                                            if (typeof errorDetails==="object") {
                                                // errorDetails = JSON.stringify(errorDetails);
                                                errorDetails = util.inspect(errorDetails, false, 4, true);
                                            }
                                        }
                                        let errorMsgDetail = bodyjs ? errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:""):"";
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
                                        that._logger.log(that.ERROR, LOG_ID + "(head) HTTP security issue", response.error.reason);
                                        reject({
                                            code: -1,
                                            url: urlEncoded,
                                            msg: response.error.reason,
                                            details: "",
                                            headers: response ? response.headers:undefined
                                        });
                                    } else {
                                        that._logger.warn("error", LOG_ID + "(head) HTTP other issue.");
                                        that._logger.warn("internalerror", LOG_ID + "(head) HTTP other issue , response : ", JSON.stringify(response), " response.message : ", response?.message);
                                        that._logger.log(that.INTERNAL, LOG_ID + "(head) HTTP other issue", response);
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

                return req;
            };

            try {

                const secondInstance = that.mergedGot.extend({mutableDefaults: true, agent: that._pickAgent()});
                /*secondInstance.defaults.options.hooks = defaults.hooks;
                secondInstance.defaults.options.retry = defaults.retry;
                secondInstance.defaults.options.pagination = defaults.pagination; // */

                let getOptions = newAliveAgent();

                let response = await secondInstance.head(urlEncoded, getOptions).catch((error) => {
                    that._logger.warn("internal", LOG_ID + "(head) sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                    return that.treatSystemError("HEAD", error, reject);
                });
                that._logger.log(that.DEBUG, LOG_ID + "(head) done.");
                let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                that._logger.log(that.HTTP, LOG_ID + "(head) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

            } catch (error) {
                //
                //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                //
                that._logger.warn("warn", LOG_ID + "(head) HTTP error.");
                that._logger.warn("internal", LOG_ID + "(head) HTTP error statusCode : ", error?.statusCode);
            }
        });
    }

    patch(url, headers: any = {}, data: any = undefined, contentType : string = undefined, nbRetryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.callback = that.findMockRestUrl("PATCH", url);
        req.method = that._patch.bind(this);
        req.params = arguments;
        let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"] ;
        let whoCallMe = callerName();
        req.label = whoCallMe + " method called (patch) x-rainbow-correlation-id : " + xRainbowRequestNodeId + ", url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            if (req.callback) {
                return req.callback(...req.params);
            }
            return that._patch(url, headers,data, contentType, nbRetryBeforeFailed, timeBetweenRetry);
        }
    }

    _patch(url, headers: any = {}, data: any = undefined, contentType : string = undefined, nbRetryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {
        let that = this;

        return new Promise(async function (resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            let httpConfig = {URL: urlEncoded, method: "PATCH", headers: headers};
            that.addAdditionalHeaders(httpConfig);

            let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"];
            that._logger.log(that.HTTP, LOG_ID + "(patch) url : ", (urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId);

            headers["user-agent"] = USER_AGENT;
            headers["Host"] = urlParse(urlEncoded).host;
            that._logger.log(that.INTERNAL, LOG_ID + "(patch) url : ", urlEncoded, ", headers : ", headers, ", data : ", data);

            let body = data;
            if (contentType) {
                //request.type(type);
                headers["Content-Type"] = contentType;
            } else {
                //request.type("json");
                if (!headers["Content-Type"]) {
                    headers["Content-Type"] = "application/json";
                    // body = JSON.stringify(data);
                }
            } // */

            if (headers["Content-Type"]==="application/json") {
                body = typeof data!=="string" ? JSON.stringify(data):data;
            }
            let attemptCount = 0;
            const newAliveAgent: any = () => {
                let req: any = {
                    prefixUrl: "",
                    /*                            agent: {
                                                    http: undefined,
                                                    https: undefined
                                                    //http: agent,
                                                    //https: agent

                                                    //http: new HttpAgent(liveOption),
                                                    //https: new HttpsAgent(liveOption)
                                                    //
                                                },
                    // */
                    headers,
                    // body,
                    //searchParams: params,
                    retry: {
                        limit: nbRetryBeforeFailed,
                        // calculateDelay: ({retryObject}) => {
                        //     /* interface RetryObject {
                        //         attemptCount: number;
                        //         retryOptions: RetryOptions;
                        //         error: RequestError;
                        //         computedValue: number;
                        //         retryAfter?: number;
                        //     } of retryObject */
                        //     that._logger.warn("internal", LOG_ID + "(delete) retry HTTP GET, retryObject : ", retryObject);
                        //     //return retryObject;
                        //     return 1000;
                        // },
                        //calculateDelay: ({computedValue}) => computedValue,
                        calculateDelay: ({computedValue}) => {
                            let noise = 100;
                            //let computedValueCalculated = ((2 ** (attemptCount - 1)) * 1000) + noise;
                            let shouldBeRun = (nbRetryBeforeFailed - attemptCount) > 0 ? 1:0;
                            let computedValueCalculated = (shouldBeRun * (timeBetweenRetry + noise));
                            attemptCount++;
                            that._logger.warn("warn", LOG_ID + "(get) (calculateDelay) retry HTTP GET, nbRetryBeforeFailed : ", nbRetryBeforeFailed, ",attemptCount : ", attemptCount, ", timeBetweenRetry : ", timeBetweenRetry, "ms , computedValue : ", computedValue, ", computedValueCalculated : ", computedValueCalculated);
                            return computedValueCalculated;
                        },
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
                        // backoffLimit: Number.POSITIVE_INFINITY,
                        noise: 100
                    },
                    hooks: {
                        afterResponse: [
                            (response, retryWithMergedOptions) => {
                                let body;
                                let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                                that._logger.log(that.HTTP, LOG_ID + "(patch) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

                                if (response?.statusCode) {
                                    // that._logger.log(that.INFO, LOG_ID + "(patch) HTTP statusCode", response.statusCode);
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
                                        that._logger.warn("warn", LOG_ID + "(patch) HTTP response.code != 200 ");
                                        that._logger.warn("internalerror", LOG_ID + "(patch) HTTP response.code != 200 , body : ", bodyjs);
                                        let msg = response.statusMessage ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                        let errorMsgDetail = bodyjs ? bodyjs.errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:""):"";
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
                                        that._logger.log(that.ERROR, LOG_ID + "(patch) HTTP security issue", response.error.reason);
                                        reject({
                                            code: -1,
                                            url: urlEncoded,
                                            msg: response.error.reason,
                                            details: "",
                                            headers: response ? response.headers:undefined
                                        });
                                    } else {
                                        that._logger.warn("error", LOG_ID + "(patch) HTTP other issue.");
                                        that._logger.warn("internalerror", LOG_ID + "(patch) HTTP other issue , response : ", JSON.stringify(response), " response.message : ", response?.message);
                                        that._logger.log(that.INTERNAL, LOG_ID + "(patch) HTTP other issue", response);
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

                return req;
            };

            try {

                const secondInstance = that.mergedGot.extend({mutableDefaults: true, agent: that._pickAgent()});
                /*secondInstance.defaults.options.hooks = defaults.hooks;
                secondInstance.defaults.options.retry = defaults.retry;
                secondInstance.defaults.options.pagination = defaults.pagination; // */

                let getOptions = newAliveAgent();

                let response = await secondInstance.patch(urlEncoded, getOptions).catch((error) => {
                    that._logger.warn("internal", LOG_ID + "(patch) sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                    return that.treatSystemError("PATCH", error, reject);
                });
                that._logger.log(that.DEBUG, LOG_ID + "(patch) done.");
                let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                that._logger.log(that.HTTP, LOG_ID + "(patch) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

            } catch (error) {
                //
                //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                //
                that._logger.warn("warn", LOG_ID + "(patch) HTTP error.");
                that._logger.warn("internal", LOG_ID + "(patch) HTTP error statusCode : ", error?.statusCode);
            }
        });
    }

    put(url, headers: any = {}, data: any = undefined, contentType : string = undefined, nbRetryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.callback = that.findMockRestUrl("PUT", url);
        req.method = that._put.bind(this);
        req.params = arguments;
        let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"] ;
        let whoCallMe = callerName();
        req.label = whoCallMe + " method called (put) x-rainbow-correlation-id : " + xRainbowRequestNodeId + ", url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            if (req.callback) {
                return req.callback(...req.params);
            }
            return that._put(url, headers,data, contentType, nbRetryBeforeFailed, timeBetweenRetry);
        }
    }

    _put(url, headers: any = {}, data: any = undefined, contentType : string = undefined, nbRetryBeforeFailed : number = 0, timeBetweenRetry = 1000): Promise<any> {
        let that = this;

        return new Promise(async function (resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            /* if (url === "https://localhost:3000") {
                 urlEncoded = "https://localhost:3000";
             } // */

            let httpConfig = {URL: urlEncoded, method: "PUT", headers: headers};
            that.addAdditionalHeaders(httpConfig);

            headers["user-agent"] = USER_AGENT;
            headers["Host"] = urlParse(urlEncoded).host;
            that._logger.log(that.INTERNAL, LOG_ID + "(put) url : ", urlEncoded, ", headers : ", headers, ", data : ", data);

            let body = data;
            if (contentType) {
                //request.type(type);
                headers["Content-Type"] = contentType;
            } else {
                //request.type("json");
                if (!headers["Content-Type"]) {
                    headers["Content-Type"] = "application/json";
                    //body = JSON.stringify(data);
                }
            } // */

            if (headers["Content-Type"]==="application/json") {
                body = typeof data!=="string" ? JSON.stringify(data):data;
            }
            // */

            let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"];
            that._logger.log(that.HTTP, LOG_ID + "(put) url : ", (urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId);
            let attemptCount = 0;
            const newAliveAgent: any = () => {
                let req = {
                    prefixUrl: "",
                    /*                            agent: {
                                                    http: undefined,
                                                    https: undefined
                                                    //http: agent,
                                                    //https: agent

                                                    //http: new HttpAgent(liveOption),
                                                    //https: new HttpsAgent(liveOption)
                                                    //
                                                },
                    // */
                    headers,
                    body,
                    //searchParams: params,
                    retry: {
                        limit: nbRetryBeforeFailed,
                        // calculateDelay: ({retryObject}) => {
                        //     /* interface RetryObject {
                        //         attemptCount: number;
                        //         retryOptions: RetryOptions;
                        //         error: RequestError;
                        //         computedValue: number;
                        //         retryAfter?: number;
                        //     } of retryObject */
                        //     that._logger.warn("internal", LOG_ID + "(get) retry HTTP PUT, retryObject : ", retryObject);
                        //     //return retryObject;
                        //     return 1000;
                        // },
                        //calculateDelay: ({computedValue}) => computedValue,
                        calculateDelay: ({computedValue}) => {
                            let noise = 100;
                            //let computedValueCalculated = ((2 ** (attemptCount - 1)) * 1000) + noise;
                            let shouldBeRun = (nbRetryBeforeFailed - attemptCount) > 0 ? 1:0;
                            let computedValueCalculated = (shouldBeRun * (timeBetweenRetry + noise));
                            attemptCount++;
                            that._logger.warn("warn", LOG_ID + "(put) (calculateDelay) retry HTTP PUT, nbRetryBeforeFailed : ", nbRetryBeforeFailed, ",attemptCount : ", attemptCount, ", timeBetweenRetry : ", timeBetweenRetry, "ms , computedValue : ", computedValue, ", computedValueCalculated : ", computedValueCalculated);
                            return computedValueCalculated;
                        },
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
                        // backoffLimit: Number.POSITIVE_INFINITY,
                        noise: 100
                    },
                    hooks: {
                        beforeRequest: [function (options) {
                            //that._logger.log(that.HTTP, LOG_ID + "(put) beforeRequest url : ", ( urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId,", options : ", options);
                        }],
                        afterResponse: [
                            (response, retryWithMergedOptions) => {
                                let body;
                                let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                                that._logger.log(that.HTTP, LOG_ID + "(put) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

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
                                        that._logger.warn("warn", LOG_ID + "(put) afterResponseHTTP response.code != 200");
                                        that._logger.warn("internal", LOG_ID + "(put) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", bodyjs : ", response.body);
                                        that._logger.warn("internal", LOG_ID + "(put) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", response.headers : ", response.headers, ", response.statusMessage : ", response.statusMessage);
                                        let bodyjs: any = {};
                                        if (that.hasJsonStructure(response.body)) {
                                            bodyjs = JSON.parse(response.body);
                                        } else {
                                            bodyjs.errorMsg = response.body;
                                        }

                                        that._logger.warn("warn", LOG_ID + "(put) HTTP response.code != 200 ");
                                        that._logger.warn("internal", LOG_ID + "(put) HTTP response.code != 200 , body : ", bodyjs);
                                        let msg = response.statusMessage ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                        let errorDetails = bodyjs.errorDetails;
                                        if (errorDetails) {
                                            if (typeof errorDetails==="object") {
                                                // errorDetails = JSON.stringify(errorDetails);
                                                errorDetails = util.inspect(errorDetails, false, 4, true);
                                            }
                                        }
                                        let errorMsgDetail = bodyjs ? errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:""):"";
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
                                        that._logger.log(that.ERROR, LOG_ID + "(put) HTTP security issue", response.error.reason);
                                        reject({
                                            code: -1,
                                            url: urlEncoded,
                                            msg: response.error.reason,
                                            details: "",
                                            headers: response ? response.headers:undefined
                                        });
                                    } else {
                                        that._logger.warn("error", LOG_ID + "(put) HTTP other issue.");
                                        that._logger.warn("internalerror", LOG_ID + "(put) HTTP other issue , response : ", JSON.stringify(response), " response.message : ", response?.message);
                                        that._logger.log(that.INTERNAL, LOG_ID + "(put) HTTP other issue", response);
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
                        ]/*,
                            beforeRetry: [
                                error => {
                                    // This will be called on `retryWithMergedOptions(...)`
                                }
                            ] // */
                    },
                };

                return req;
            };

            try {

                const secondInstance = that.mergedGot.extend({mutableDefaults: true, agent: that._pickAgent()});
                /*secondInstance.defaults.options.hooks = defaults.hooks;
                secondInstance.defaults.options.retry = defaults.retry;
                secondInstance.defaults.options.pagination = defaults.pagination; // */


                let getOptions = newAliveAgent();

                let response = await secondInstance.put(urlEncoded, getOptions).catch((error) => {
                    that._logger.warn("internal", LOG_ID + "(put) sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                    return that.treatSystemError("PUT", error, reject);
                });
                that._logger.log(that.DEBUG, LOG_ID + "(put) done.");

            } catch (error) {
                //
                //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                //
                that._logger.warn("warn", LOG_ID + "(put) HTTP error.");
                that._logger.warn("internal", LOG_ID + "(put) HTTP error statusCode : ", error?.statusCode);
            }
        });
    }

    putBuffer(url, headers: any = {}, buffer): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.callback = that.findMockRestUrl("PUT", url);
        req.method = that._putBuffer.bind(this);
        req.params = arguments;
        let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"] ;
        let whoCallMe = callerName();
        req.label = whoCallMe + " method called (putBuffer) x-rainbow-correlation-id : " + xRainbowRequestNodeId + ", url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            if (req.callback) {
                return req.callback(...req.params);
            }
            return that._putBuffer(url, headers, buffer);
        }
    }

    _putBuffer(url, headers: any = {}, buffer): Promise<any> {
        let that = this;

        return new Promise(async function (resolve, reject) {

            //that._logger.log(that.INFO, LOG_ID + "(putBuffer) option url", that.serverURL + url);
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            let httpConfig = {URL: urlEncoded, method: "PUT", headers: headers};
            that.addAdditionalHeaders(httpConfig);

            let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"];
            that._logger.log(that.HTTP, LOG_ID + "(_putBuffer) url : ", (urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId);

            headers["user-agent"] = USER_AGENT;
            headers["Host"] = urlParse(urlEncoded).host;

            that._logger.log(that.INTERNAL, LOG_ID + "(_putBuffer) url : ", urlEncoded);
            let attemptCount = 0;
            const newAliveAgent: any = () => {
                let req = {
                    prefixUrl: "",
                    /*                            agent: {
                                                    http: undefined,
                                                    https: undefined
                                                    //http: agent,
                                                    //https: agent

                                                    //http: new HttpAgent(liveOption),
                                                    //https: new HttpsAgent(liveOption)
                                                    //
                                                },
                    // */
                    headers,
                    body: buffer,
                    //searchParams: params,
                    hooks: {
                        afterResponse: [
                            (response, retryWithMergedOptions) => {
                                let body;
                                let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                                that._logger.log(that.HTTP, LOG_ID + "(_putBuffer) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

                                if (response) {
                                    if (response?.statusCode) {
                                        // that._logger.log(that.INFO, LOG_ID + "(_putBuffer) HTTP statusCode defined : ", response.statusCode);
                                        if (response.statusCode >= 200 && response.statusCode <= 400) {
                                            //if (response) {
                                            //  response.body = body;
                                            //}
                                            resolve(response.body);
                                        } else {
                                            that._logger.warn("warn", LOG_ID + "(_putBuffer) HTTP response.code != 200");
                                            that._logger.warn("internal", LOG_ID + "(_putBuffer) HTTP response.code != 200 , bodyjs : ", response?.body);
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

                return req;
            };

            try {

                const secondInstance = that.mergedGot.extend({mutableDefaults: true, agent: that._pickAgent()});

                let getOptions = newAliveAgent();
                let response = await secondInstance.put(urlEncoded, getOptions).catch((error) => {
                    that._logger.warn("internal", LOG_ID + "(_putBuffer) sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                    return that.treatSystemError("PUT Buffer", error, reject);
                });
                that._logger.log(that.DEBUG, LOG_ID + "(_putBuffer) done.");

            } catch (error) {
                //
                //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                //
                that._logger.warn("warn", LOG_ID + "(_putBuffer) HTTP error.");
                that._logger.warn("internal", LOG_ID + "(_putBuffer) HTTP error statusCode : ", error?.statusCode);
            }
        });
    }

    putStream(url, headers: any = {}, stream): Promise<any> {
            let that = this;

            return new Promise(function (resolve, reject) {
                //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
                let urlEncoded = that.serverURL + url;

                let httpConfig = {URL: urlEncoded, method: "PUT", headers: headers};
                that.addAdditionalHeaders(httpConfig);

                let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"];
                that._logger.log(that.HTTP, LOG_ID + "(putStream) url : ", (urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-correlation-id : ", xRainbowRequestNodeId);

                that._logger.log(that.INTERNAL, LOG_ID + "(putStream) url : ", urlEncoded, " stream path : ", stream?.path);

                headers["user-agent"] = USER_AGENT;
                headers["Host"] = urlParse(urlEncoded).host;

                that._logger.log(that.INTERNAL, LOG_ID + "(putStream) url : ", urlEncoded, ", headers : ", headers);
                let attemptCount = 0;
                const newAliveAgent: any = () => {
                    let req = {
                        prefixUrl: "",
                        /*                            agent: {
                                                        http: undefined,
                                                        https: undefined
                                                        //http: agent,
                                                        //https: agent

                                                        //http: new HttpAgent(liveOption),
                                                        //https: new HttpsAgent(liveOption)
                                                        //
                                                    },
                        // */
                        headers,
                        //body : stream,
                        //searchParams: params,
                        retry: {
                            limit: 1,
                            //limit: 1,
                            // calculateDelay: ({retryObject}) => {
                            //     // interface RetryObject {
                            //     //    attemptCount: number;
                            //     //    retryOptions: RetryOptions;
                            //     //    error: RequestError;
                            //     //    computedValue: number;
                            //     //    retryAfter?: number;
                            //     // } of retryObject
                            //     that._logger.warn("internal", LOG_ID + "(get) retry HTTP PUT, retryObject : ", retryObject);
                            //     //return retryObject;
                            //     return 1000;
                            // },
                            calculateDelay: ({computedValue}) => computedValue,
                            /*calculateDelay:  ({computedValue}) => {
                                let noise = 100;
                                //let computedValueCalculated = ((2 ** (attemptCount - 1)) * 1000) + noise;
                                let shouldBeRun = (nbRetryBeforeFailed - attemptCount)> 1 ? 1 : 0;
                                let computedValueCalculated = (shouldBeRun * (timeBetweenRetry + noise));
                                attemptCount++;
                                that._logger.warn("warn", LOG_ID + "(get) (calculateDelay) retry HTTP GET, nbRetryBeforeFailed : ", nbRetryBeforeFailed, ",attemptCount : ", attemptCount, ", timeBetweenRetry : ", timeBetweenRetry, "ms , computedValue : ", computedValue,", computedValueCalculated : ", computedValueCalculated);
                                return computedValueCalculated;
                            }, // */
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
                            // backoffLimit: Number.POSITIVE_INFINITY,
                            noise: 100
                        },
                        hooks: {
                            beforeRequest: [function (options) {
                                that._logger.debug("internal", LOG_ID + "(putStream) beforeRequest.");
                                // that._logger.debug("internal", LOG_ID + "(putStream) options : ", options);
                            }],
                            afterResponse: [
                                (response, retryWithMergedOptions) => {
                                    let body;
                                    let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                                    that._logger.log(that.HTTP, LOG_ID + "(putStream) done statusCode : ", response?.statusCode, " for sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

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
                                            that._logger.warn("warn", LOG_ID + "(putStream) afterResponseHTTP response.code != 200");
                                            that._logger.warn("internal", LOG_ID + "(putStream) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", bodyjs : ", response.body);
                                            that._logger.warn("internal", LOG_ID + "(putStream) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", response.headers : ", response.headers, ", response.statusMessage : ", response.statusMessage);
                                            let bodyjs: any = {};
                                            if (that.hasJsonStructure(response.body)) {
                                                bodyjs = JSON.parse(response.body);
                                            } else {
                                                bodyjs.errorMsg = response.body;
                                            }

                                            that._logger.warn("warn", LOG_ID + "(putStream) HTTP response.code != 200 ");
                                            that._logger.warn("internal", LOG_ID + "(putStream) HTTP response.code != 200 , body : ", bodyjs);
                                            let msg = response.statusMessage ? response.statusMessage:bodyjs ? bodyjs.errorMsg || "":"";
                                            let errorDetails = bodyjs.errorDetails;
                                            if (errorDetails) {
                                                if (typeof errorDetails==="object") {
                                                    // errorDetails = JSON.stringify(errorDetails);
                                                    errorDetails = util.inspect(errorDetails, false, 4, true);
                                                }
                                            }
                                            let errorMsgDetail = bodyjs ? errorDetails + (bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode:""):"";
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
                                            that._logger.log(that.ERROR, LOG_ID + "(putStream) HTTP security issue", response.error.reason);
                                            reject({
                                                code: -1,
                                                url: urlEncoded,
                                                msg: response.error.reason,
                                                details: "",
                                                headers: response ? response.headers:undefined
                                            });
                                        } else {
                                            that._logger.warn("error", LOG_ID + "(putStream) HTTP other issue.");
                                            that._logger.warn("internalerror", LOG_ID + "(putStream) HTTP other issue , response : ", JSON.stringify(response), " response.message : ", response?.message);
                                            that._logger.log(that.INTERNAL, LOG_ID + "(putStream) HTTP other issue", response);
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

                    return req;
                };

                try {

                    const secondInstance = that.mergedGot.extend({mutableDefaults: true, agent: that._pickAgent()});


                    // store error and result
                    let error;
                    let result = null;
                    let verbose = 2;
                    let spinner = undefined;

                    let getOptions = newAliveAgent();

                    /*
                    result = await secondInstance.put(urlEncoded, getOptions).catch((err) => {
                        if (err) {
//                            console.error('Pipeline failed', err);
                            that._logger.warn("internal", LOG_ID + "(put) sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                                return that.treatSystemError("PUT", error, reject);
                        } else {
                            console.log('Pipeline succeeded');
                            resolve(err);
                        }
                    });

                    stream.push(null);
                    stream.resume();
                    return (result);
                    // */


                    let streamRes = _(pipeline(stream, (secondInstance.stream.put(urlEncoded, getOptions)), (err) => {
                        if (err) {
//                            console.error('Pipeline failed', err);
                            that._logger.warn("internal", LOG_ID + "(putStream) sent x-rainbow-correlation-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                            return that.treatSystemError("PUTSTREAM", error, reject);
                        } else {
                            // dev-code-console //
                            console.log('Pipeline succeeded');
                            // end-dev-code-console //
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
                        } catch (e) {
                            error = new Error('Error parsing output!');
                            error.response = {
                                error: s,
                            };
                            verbose && that._logger.log(that.INTERNAL, LOG_ID + "(putStream) : ", chalk.red('[error]'), 'Error parsing line:', s);
                        }
                    });
                    // listen for read stream end
                    streamRes.on('end', () => {
                        // if stream had error - reject
                        if (error) {
                            that._logger.warn("warn", LOG_ID + "(putStream) HTTP error at end.");
                            that._logger.warn("internal", LOG_ID + "(putStream) HTTP error at end. error.message : ", error?.message);
                            reject(error);
                            return;
                        }

                        try {

                            verbose && that._logger.log(that.INTERNAL, LOG_ID + "(putStream) result : ", chalk.blue('[info]'), result);
                            const data = JSON.parse(result);
                            verbose && that._logger.log(that.INTERNAL, LOG_ID + "(putStream) data : ", chalk.blue('[info]'), data);
                            // always log info
                            if (data.level==='info') {
                                verbose && that._logger.log(that.INTERNAL, LOG_ID + "(putStream) : ", chalk.blue('[info]'), data.message);
                                // if data has deployments info - assign it as result
                                if (data.deployments) {
                                    result = data;
                                }
                            }
                            // log verbose if needed
                            data.level==='verbose' && verbose > 1 && that._logger.log(that.INTERNAL, LOG_ID + "(putStream) : ", chalk.grey('[verbose]'), data.message);
                            // if error - store as error and log
                            if (data.level==='error') {
                                verbose && that._logger.log(that.INTERNAL, LOG_ID + "(putStream) : ", chalk.red('[error]'), data.message);
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
                            verbose && that._logger.log(that.INTERNAL, LOG_ID + "(putStream) : ", chalk.red('[error]'), 'Error parsing line:', result);
                            reject(error);
                            return;
                        }

                        // that._logger.log(that.INFO, LOG_ID + "(putStream) successfull");
                        that._logger.log(that.INFO, LOG_ID + "(putStream) put file buffer in Url succesfull");
                        // otherwise resolve
                        resolve("done");
                    });
                    streamRes.on('error', e => (error = e));

                    return (streamRes);
                    // */
                } catch (error) {
                    //
                    //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                    //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                    //
                    that._logger.warn("warn", LOG_ID + "(putStream) HTTP error.");
                    that._logger.warn("internal", LOG_ID + "(putStream) HTTP error.message : ", error?.message);
                    return (error);
                }

            });
        }

    delete(url, headers: any = {}, data : any = undefined): Promise<any> {
        let that = this;
        let req : RequestForQueue = new RequestForQueue();
        req.callback = that.findMockRestUrl("DELETE", url);
        req.method = that._delete.bind(this);
        req.params = arguments;
        let xRainbowRequestNodeId = headers["x-rainbow-correlation-id"] ;
        let whoCallMe = callerName();
        req.label = whoCallMe + " method called (delete) x-rainbow-request-node-id : " + xRainbowRequestNodeId + ", url : " +  (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g);
        if (that.useRequestRateLimiter) {
            return that.httpManager.add(req);
        } else {
            if (req.callback) {
                return req.callback(...req.params);
            }
            return that._delete(url, headers, data);
        }
    }

    _delete(url, headers: any = {}, data : any = undefined): Promise<any> {

        let that = this;

        return new Promise(async function (resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            let httpConfig = {URL: urlEncoded, method: "DELETE", headers: headers};
            that.addAdditionalHeaders(httpConfig);

            let xRainbowRequestNodeId = headers["x-rainbow-request-node-id"];
            that._logger.log(that.HTTP, LOG_ID + "(delete) url : ", (urlEncoded).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g), ", x-rainbow-request-node-id : ", xRainbowRequestNodeId);

            let body = data;
            headers["user-agent"] = USER_AGENT;
            headers["Host"] = urlParse(urlEncoded).host;

            that._logger.log(that.INTERNAL, LOG_ID + "(delete) url : ", urlEncoded, ", headers : ", headers, ", body : ", body);
            let attemptCount = 0;
            const newAliveAgent: any = () => {
                let req: any = {
                    prefixUrl: "",
                    /*                            agent: {
                                                    http: undefined,
                                                    https: undefined
                                                    //http: agent,
                                                    //https: agent

                                                    //http: new HttpAgent(liveOption),
                                                    //https: new HttpsAgent(liveOption)
                                                    //
                                                },
                                            // */
                    headers,
                    // body,
                    //searchParams: params,
                    retry: {
                        limit: 1,
                        //limit: 1,
                        // calculateDelay: ({retryObject}) => {
                        //     /* interface RetryObject {
                        //         attemptCount: number;
                        //         retryOptions: RetryOptions;
                        //         error: RequestError;
                        //         computedValue: number;
                        //         retryAfter?: number;
                        //     } of retryObject */
                        //     that._logger.warn("internal", LOG_ID + "(delete) retry HTTP GET, retryObject : ", retryObject);
                        //     //return retryObject;
                        //     return 1000;
                        // },
                        calculateDelay: ({computedValue}) => computedValue,
                        /* calculateDelay:  ({computedValue}) => {
                            let noise = 100;
                            //let computedValueCalculated = ((2 ** (attemptCount - 1)) * 1000) + noise;
                            let shouldBeRun = (nbRetryBeforeFailed - attemptCount)> 1 ? 1 : 0;
                            let computedValueCalculated = (shouldBeRun * (timeBetweenRetry + noise));
                            attemptCount++;
                            that._logger.warn("warn", LOG_ID + "(get) (calculateDelay) retry HTTP GET, nbRetryBeforeFailed : ", nbRetryBeforeFailed, ",attemptCount : ", attemptCount, ", timeBetweenRetry : ", timeBetweenRetry, "ms , computedValue : ", computedValue,", computedValueCalculated : ", computedValueCalculated);
                            return computedValueCalculated;
                        }, // */
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
                        // backoffLimit: Number.POSITIVE_INFINITY,
                        noise: 100
                    },
                    hooks: {
                        afterResponse: [
                            (response, retryWithMergedOptions) => {
                                let body;
                                let xRainbowRequestId = response?.headers["x-rainbow-request-id"];
                                that._logger.log(that.HTTP, LOG_ID + "(delete) done statusCode : ", response?.statusCode, " for sent x-rainbow-request-node-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

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
                                        that._logger.warn("warn", LOG_ID + "(delete) afterResponseHTTP response.code != 200");
                                        that._logger.warn("internal", LOG_ID + "(delete) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", bodyjs : ", response.body);
                                        that._logger.warn("internal", LOG_ID + "(delete) afterResponse HTTP response.code != 200, url : ", urlEncoded, ", response.headers : ", response.headers, ", response.statusMessage : ", response.statusMessage);
                                        // that._logger.log(that.INFO, LOG_ID + "(delete) HTTP code", response.code);
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
                                        that._logger.log(that.ERROR, LOG_ID + "(delete) HTTP security issue", response.error.reason);
                                        reject({
                                            code: -1,
                                            url: urlEncoded,
                                            msg: response.error.reason,
                                            details: "",
                                            headers: response ? response.headers:undefined
                                        });
                                    } else {
                                        that._logger.warn("error", LOG_ID + "(delete) HTTP other issue.");
                                        that._logger.warn("internalerror", LOG_ID + "(delete) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                        that._logger.log(that.INTERNAL, LOG_ID + "(delete) HTTP other issue", response);
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

                return req;
            };

            try {

                const secondInstance = that.mergedGot.extend({mutableDefaults: true, agent: that._pickAgent()});
                /*secondInstance.defaults.options.hooks = defaults.hooks;
                secondInstance.defaults.options.retry = defaults.retry;
                secondInstance.defaults.options.pagination = defaults.pagination; // */


                let getOptions = newAliveAgent();
                let response = await secondInstance.delete(urlEncoded, getOptions).catch((error) => {
                    that._logger.warn("internal", LOG_ID + "(delete) sent x-rainbow-request-node-id : ", xRainbowRequestNodeId, " error.code : ", error?.code, ", error.message : ", error?.message, ", urlEncoded : ", urlEncoded);
                    return that.treatSystemError("DELETE", error, reject);
                });
                that._logger.log(that.DEBUG, LOG_ID + "(delete) done.");
                let xRainbowRequestId = response?.headers ? response?.headers["x-rainbow-request-id"]:"";
                that._logger.log(that.HTTP, LOG_ID + "(delete) done statusCode : ", response?.statusCode, " for sent x-rainbow-request-node-id : ", xRainbowRequestNodeId, " received x-rainbow-request-id : ", xRainbowRequestId, ", statusCode : ", response?.statusCode);

            } catch (error) {
                //
                //An error to be thrown when the server response code is not 2xx nor 3xx if `options.followRedirect` is `true`, but always except for 304.
                //Includes a `response` property. Contains a `code` property with `ERR_NON_2XX_3XX_RESPONSE` or a more specific failure code.
                //
                that._logger.warn("warn", LOG_ID + "(delete) HTTP error.");
                that._logger.warn("internal", LOG_ID + "(delete) HTTP error statusCode : ", error?.statusCode, ", message : ", error?.message);
            }
        });
    }
}

export {HTTPService};
module.exports.HTTPService = HTTPService;
