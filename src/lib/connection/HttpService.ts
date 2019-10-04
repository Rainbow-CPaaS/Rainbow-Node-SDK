"use strict";

//let unirest = require("unirest");
const Request = require("request");
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

class HTTPService {
	public serverURL: any;
	public _host: any;
	public logger: any;
	public proxy: any;
    public eventEmitter: any;

    constructor(_http, _logger, _proxy, _evtEmitter) {
        this.serverURL = _http.protocol + "://" + _http.host + ":" + _http.port;
        this._host = _http.host;
        this.logger = _logger;
        this.proxy = _proxy;
        this.eventEmitter = _evtEmitter;

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
                .on("response", function(response) {
                    // Workaround for res._dump in Node.JS http client
                    // https://github.com/nodejs/node/blob/20285ad17755187ece16b8a5effeaa87f5407da2/lib/_http_client.js#L421-L427
                    if (!wasHandled && EventEmitter.listenerCount(response.req, "response") === 0) {
                        response.resume();
                    }

                    let status = response.statusCode;
                    let s = status / 100 | 0;
                    that.logger.log("internal", LOG_ID + "  " + chalk[colorCodes[s]](status) + " ← " + signature + " " + chalk.gray(time(start)));
                })
                .on("error", function(err) {
                    that.logger.log("internalerror", LOG_ID + "  " + chalk.red("xxx") + " ← " + signature + " " + chalk.red(err.message));
                });
        }

        if (that.logger.logHttp) {
           debugHttp(debugHandler);
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
        this.logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise((resolve) => {
            that.logger.log("debug", LOG_ID + "(start) host used", that._host);
            that.logger.log("info", LOG_ID + "(start) REST URL", that.serverURL);
            that.logger.log("debug", LOG_ID + "(start) _exiting_");
            resolve();
        });
    }

    stop(): Promise<any> {
        let that = this;

        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise((resolve) => {
            that.logger.log("info", LOG_ID + "(stop) Successfully stopped");
            that.logger.log("debug", LOG_ID + "(stop) _exiting_");
            resolve();
        });
    }

    tokenExpirationControl(bodyjs: {errorCode : number, errorDetails: string}) : void{
        let that =this;
        if (bodyjs.errorCode === 401 && bodyjs.errorDetails === "jwt expired") {
            that.logger.log("debug", LOG_ID + "(_renewAuthToken) _exiting_");
            that.eventEmitter.emit("rainbow_tokenexpired");
        }
    }



get(url, headers, params): Promise<any> {

        let that = this;

        return new Promise(function (resolve, reject) {

            try {
                that.logger.log("info", LOG_ID + "(get) url", (that.serverURL + url).match(/[a-z]+:\/\/[^:/]+(?::\d+)?(?:\/[^?]+)?(?:\?)?/g)) ;
                that.logger.log("internal", LOG_ID + "(get) url", that.serverURL + url);

                headers["user-agent"] = USER_AGENT;

                //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
                let urlEncoded = that.serverURL + url;

                if (headers.Accept && headers.Accept.indexOf("json") > -1) {
                    let request = Request({
                        url: urlEncoded,
                        method: "GET",
                        headers: headers,
                        params: params,
                        proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                        agentOptions: {
                            secureProtocol: that.proxy.secureProtocol
                        }
                    }, (error, response, body) => {
                        that.logger.log("info", LOG_ID + "(get) successfull");
                        if (error) {
                            reject({
                                code: -1,
                                msg: "ErrorManager while requesting",
                                details: error
                            });
                            return;
                        } else {
                            if (response) {
                                if (response.statusCode) {
                                    /*response.statusCode = 504;
                                    response.body = "<html><body><h1>504 Gateway Time-out</h1>\n" +
                                        "The server didn't respond in time.\n" +
                                        "</body></html>\n";
                                        // */
                                    that.logger.log("info", LOG_ID + "(get) HTTP statusCode defined : ", response.statusCode);
                                    if (response.statusCode >= 200 && response.statusCode <= 206) {
                                        if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                            let json = {};
                                            if (response.body) {
                                                json = JSON.parse(response.body);
                                            }
                                            resolve(json);
                                        } else {
                                            reject({
                                                code: -1,
                                                msg: "Bad content, please check your host",
                                                details: ""
                                            });
                                        }
                                    } else {
                                        that.logger.warn("warn", LOG_ID + "(get) HTTP response.code != 200");
                                        that.logger.warn("internal", LOG_ID + "(get) HTTP response.code != 200 , bodyjs : ", response.body);
                                        let bodyjs : any = {};
                                        if (response.body) {
                                        	if (that.hasJsonStructure(response.body)) {
                                                	bodyjs = JSON.parse(response.body);
	                                        } else {
        	                                    bodyjs.errorMsg = response.body;
                                 		}
                                        }
                                        let msg = response.statusMessage ? response.statusMessage : bodyjs ? bodyjs.errorMsg || "" : "";
                                        let errorMsgDetail = bodyjs ? bodyjs.errorDetails + ( bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode : ""   || "") : "";
                                        errorMsgDetail = errorMsgDetail ? errorMsgDetail : bodyjs ? bodyjs.errorMsg || "" : "" ;
                                        that.tokenExpirationControl(bodyjs);
                                        reject({
                                            code: response.statusCode,
                                            msg: msg,
                                            details: errorMsgDetail,
                                            error: bodyjs
                                        });

                                    }
                                } else {
                                    if (response.error && response.error.reason) {
                                        that.logger.log("error", LOG_ID + "(get) HTTP security issue", response.error.reason);
                                        reject({
                                            code: -1,
                                            msg: response.error.reason,
                                            details: ""
                                        });
                                    } else {
                                        that.logger.warn("warn", LOG_ID + "(get) HTTP other issue");
                                        that.logger.warn("internal", LOG_ID + "(get) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                        that.logger.log("internal", LOG_ID + "(get) HTTP other issue", response);
                                        reject({
                                            code: -1,
                                            msg: "Unknown error",
                                            details: response
                                        });
                                    }
                                }
                            } else {
                                reject({
                                    code: -1,
                                    msg: "ErrorManager while requesting",
                                    details: "error"
                                });
                            }
                        }
                    });
                } else {
                    let buff = [];
                    let err = {
                        statusCode : null,
                        statusMessage : null,
                        contentType : null
                    };
                    let req = Request.get({
                        url: that.serverURL + url,
                        headers: headers,
                        params: params,
                        proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                        agentOptions: {
                            secureProtocol: that.proxy.secureProtocol
                        }
                    }).on("response", function (response) {
                        that.logger.log("info", LOG_ID + "(get) status code:" + response.statusCode); // 200
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
                        reject({
                            code: -1,
                            msg: error.message,
                            details: ""
                        });
                    }).on("end", () => {
                        that.logger.log("info", LOG_ID + "(get) successfull");
                        that.logger.log("info", LOG_ID + "(get) get file buffer from Url");
                        that.logger.log("debug", LOG_ID + "(get) _exiting_");
                        if (!err.statusCode) {
                            let data = Buffer.concat(buff);
                            resolve(data);
                        } else {
                            reject({
                                code: err.statusCode,
                                msg: err.statusMessage,
                                details: ""
                            });
                        }
                    }); // */
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(get) HTTP ErrorManager");
                that.logger.log("internalerror", LOG_ID + "(get) HTTP ErrorManager", err);
                reject({
                    code: -1,
                    msg: "Unknown error",
                    details: ""
                });
            }
        });
    }

    post(url, headers, data, contentType): Promise<any> {
        let that = this;

        return new Promise(function(resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            that.logger.log("internal", LOG_ID + "(post) url", urlEncoded, data);

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
                body: body
            }, (error, response, body) => {
                if (error) {
                    that.logger.log("internalerror", LOG_ID + "(post) failed:", error);
                    reject("post failed");
                    return;
                }
                else {
                    if (response) {
                        if (response.statusCode) {
                            that.logger.log("info", LOG_ID + "(post) HTTP statusCode", response.statusCode);
                            if (response.statusCode >= 200 && response.statusCode <= 206) {
                                if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                    let json = {};
                                    if (response.body) {
                                        json = JSON.parse(response.body);
                                    }
                                    resolve(json);
                                } else {
                                    reject({
                                        code: -1,
                                        msg: "Bad content, please check your host",
                                        details: ""
                                    });
                                }
                            } else {
                                let bodyjs : any = {};
				if (response.body) {
                                	if (that.hasJsonStructure(response.body)) {
	                                    bodyjs = JSON.parse(response.body);
        	                        } else {
                	                    bodyjs.errorMsg = response.body;
                        	        }
                        	}

                                that.logger.warn("warn", LOG_ID + "(post) HTTP response.code != 200 ");
                                that.logger.warn("internal", LOG_ID + "(post) HTTP response.code != 200 , body : ", bodyjs);
                                let msg = response.statusMessage ? response.statusMessage : bodyjs ? bodyjs.errorMsg || "" : "";
                                let errorMsgDetail = bodyjs ? bodyjs.errorDetails + ( bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode : ""   || "") : "";
                                errorMsgDetail = errorMsgDetail ? errorMsgDetail : bodyjs ? bodyjs.errorMsg || "" : "" ;

                                that.tokenExpirationControl(bodyjs);
                                reject({
                                    code: response.statusCode,
                                    msg: msg,
                                    details: errorMsgDetail,
                                    error: bodyjs
                                });
                            }
                        } else {
                            if (response.error && response.error.reason) {
                                that.logger.log("error", LOG_ID + "(post) HTTP security issue", response.error.reason);
                                reject({
                                    code: -1,
                                    msg: response.error.reason,
                                    details: ""
                                });
                            } else {
                                that.logger.warn("error", LOG_ID + "(post) HTTP other issue.");
                                that.logger.warn("internalerror", LOG_ID + "(post) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                that.logger.log("internal", LOG_ID + "(post) HTTP other issue", response);
                                reject({
                                    code: -1,
                                    msg: "Unknown error",
                                    details: response
                                });
                            }
                        }
                    } else {
                        reject({
                            code: -1,
                            msg: "ErrorManager while requesting",
                            details: "error"
                        });
                    }
                }
            });
        });
    }

    put(url, headers, data, type): Promise<any> {
        let that = this;

        return new Promise(function(resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            that.logger.log("internal", LOG_ID + "(put) url", urlEncoded, data);

            headers["user-agent"] = USER_AGENT;
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
                    body: body
                }, (error, response, body) => {
                    if (error) {
                        that.logger.log("internalerror", LOG_ID + "(put) put failed:", error);
                        reject("put failed");
                        return;
                    }
                    else {
                        if (response) {
                            if (response.statusCode) {
                                that.logger.log("info", LOG_ID + "(put) HTTP statusCode", response.statusCode);
                                if (response.statusCode >= 200 && response.statusCode <= 206) {
                                    if (!response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                        let json = {};
                                        if (response.body) {
                                            json = JSON.parse(response.body);
                                        }
                                        resolve(json);
                                    } else {
                                        reject({
                                            code: -1,
                                            msg: "Bad content, please check your host",
                                            details: ""
                                        });
                                    }
                                } else {
                                    let bodyjs : any = {};
					if (response.body) {
	                                    if (that.hasJsonStructure(response.body)) {
        	                                bodyjs = JSON.parse(response.body);
                	                    } else {
                        	                bodyjs.errorMsg = response.body;
                                	    }                                    
                                	}
                                	that.logger.warn("warn", LOG_ID + "(put) HTTP response.code != 200 ");
                                    that.logger.warn("internalerror", LOG_ID + "(put) HTTP response.code != 200 , body : ", bodyjs);
                                    let msg = response.statusMessage ? response.statusMessage : bodyjs ? bodyjs.errorMsg || "" : "";
                                    let errorMsgDetail = bodyjs ? bodyjs.errorDetails + ( bodyjs.errorDetailsCode ? ". error code : " + bodyjs.errorDetailsCode : ""   || "") : "";
                                    errorMsgDetail = errorMsgDetail ? errorMsgDetail : bodyjs ? bodyjs.errorMsg || "" : "" ;

                                    that.tokenExpirationControl(bodyjs);
                                    reject({
                                        code: response.statusCode,
                                        msg: msg,
                                        details: errorMsgDetail,
                                        error: bodyjs
                                    });
                                }
                            } else {
                                if (response.error && response.error.reason) {
                                    that.logger.log("error", LOG_ID + "(put) HTTP security issue", response.error.reason);
                                    reject({
                                        code: -1,
                                        msg: response.error.reason,
                                        details: ""
                                    });
                                } else {
                                    that.logger.warn("warn", LOG_ID + "(put) HTTP other issue ");
                                    that.logger.warn("internalerror", LOG_ID + "(put) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                    that.logger.log("internal", LOG_ID + "(put) HTTP other issue", response);
                                    reject({
                                        code: -1,
                                        msg: "Unknown error",
                                        details: response
                                    });
                                }
                            }
                        } else {
                            reject({
                                code: -1,
                                msg: "ErrorManager while requesting",
                                details: "error"
                            });
                        }
                    }
                });
        });
    }

    putBuffer(url, headers, buffer): Promise<any> {
        let that = this;

        return new Promise(function(resolve, reject) {

            //that.logger.log("info", LOG_ID + "(putBuffer) option url", that.serverURL + url);
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            headers["user-agent"] = USER_AGENT;

            that.logger.log("internal", LOG_ID + "(putBuffer) url", urlEncoded);

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
                     body: buffer
                 },
                function (error, response, body) {
                    if (error) {
                        that.logger.log("internalerror", LOG_ID + "(putBuffer) upload failed:", error);
                        reject("upload failed");
                        return;
                    }
                    that.logger.log("internal", LOG_ID + "(putBuffer) Upload successful!  Server responded with:", body);
                    resolve(body);
                });
        });
    }

    putStream(url, headers, stream): Promise<any> {
        let that = this;

        return new Promise(function(resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            that.logger.log("internal", LOG_ID + "(put) url", urlEncoded, " stream fileName : ", stream.fileName);

            headers["user-agent"] = USER_AGENT;

            let request = Request.put({
                url: urlEncoded,
                    headers: headers,
                    proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                agentOptions: {
                    secureProtocol: that.proxy.secureProtocol
                }
            }).on("end", () => {
                that.logger.log("info", LOG_ID + "(get) successfull");
                that.logger.log("info", LOG_ID + "(get) get file buffer from Url");
                that.logger.log("debug", LOG_ID + "(get) _exiting_");
                resolve("done");
            });

            stream.pipe(request);
            return request;
        });
    }

    delete(url, headers): Promise<any> {

        let that = this;

        return new Promise(function(resolve, reject) {
            //let urlEncoded = encodeURI(that.serverURL + url); // Can not be used because the data in url are allready encodeURIComponent
            let urlEncoded = that.serverURL + url;

            that.logger.log("internal", LOG_ID + "(delete) url", urlEncoded);

            headers["user-agent"] = USER_AGENT;

            let request = Request.delete({
                url: urlEncoded,
                headers: headers,
                proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null,
                agentOptions: {
                    secureProtocol: that.proxy.secureProtocol
                }
            }, (error, response, body) => {
                if (error) {
                    reject({
                        code: -1,
                        msg: "ErrorManager while requesting",
                        details: error
                    });
                    return;
                } else {
                    if (response) {
                        that.logger.log("info", LOG_ID + "(delete) HTTP code", response.code);
                        if (response.statusCode >= 200 && response.statusCode <= 206) {
                            let bodyjs = {};
                            if (response.body) {
                                bodyjs = JSON.parse(response.body);
                            }
                            resolve (bodyjs);
                        } else {
                            let bodyjs : any = {};
                            if (response.body) {
                            if (that.hasJsonStructure(response.body)) {
                                bodyjs = JSON.parse(response.body);
                            } else {
                                bodyjs.errorMsg = response.body;
                            }
                            }
                            that.tokenExpirationControl(bodyjs);
                            reject({
                                code: response.statusCode,
                                msg: response.body ? response.body.errorMsg || "" : "",
                                details: response.body ? response.body.errorDetails || "" : "",
                                error: bodyjs
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
