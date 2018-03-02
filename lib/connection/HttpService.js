"use strict";

var unirest = require("unirest");
var Request = require("request");
var packageVersion = require("../../package.json");

const LOG_ID = "HTTP - ";

const USER_AGENT = "node/" + process.version + " (" + process.platform + "; " + process.arch + ") " + "Rainbow Sdk/" + packageVersion.version;

class HTTPService {

    constructor(_http, _logger, _proxy) {
        this.serverURL = _http.protocol + "://" + _http.host + ":" + _http.port;
        this._host = _http.host;
        this.logger = _logger;
        this.proxy = _proxy;
    }

    get host() {
        return this._host;
    }

    start() {
        var that = this;
        this.logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise((resolve) => {
            that.logger.log("debug", LOG_ID + "(start) host used", that._host);
            that.logger.log("info", LOG_ID + "(start) REST URL", that.serverURL);
            that.logger.log("debug", LOG_ID + "(start) _exiting_");
            resolve();
        });
    }

    stop() {
        var that = this;

        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise((resolve) => {
            that.logger.log("info", LOG_ID + "(stop) Successfully stopped");
            that.logger.log("debug", LOG_ID + "(stop) _exiting_");
            resolve();
        });
    }
            
    get(url, headers) {

        var that = this;

        return new Promise(function(resolve, reject) {

            try {
                that.logger.log("info", LOG_ID + "(get) url", that.serverURL + url);

                headers["user-agent"] = USER_AGENT;

                if ( headers.Accept && headers.Accept.indexOf("json") > -1) {

                    var request = unirest.get(that.serverURL + url);
                    request.headers(headers);
                    if (that.proxy && that.proxy.isProxyConfigured) {
                        request.proxy(that.proxy.proxyURL);
                    }
                    request.end(function(response) {
                        if (response.code) {
                            that.logger.log("info", LOG_ID + "(get) HTTP code", response.code);
                            if (response.code === 200) {
                                if ( !response.headers["content-type"] || (response.headers["content-type"] && (response.headers["content-type"].indexOf("json") > -1 || response.headers["content-type"].indexOf("csv") > -1))) {
                                    resolve(response.body);
                                } else {
                                    reject({
                                        code: -1,
                                        msg: "Bad content, please check your host",
                                        details: ""
                                    });
                                }
                            }
                            else {
                                that.logger.warn("warn", LOG_ID + "(get) HTTP response.code != 200 , response : ", JSON.stringify(response));
                                reject({
                                    code: response.code,
                                    msg: response.body ? response.body.errorMsg || "" : "",
                                    details: response.body ? JSON.stringify(response.body.errorDetails) || "" : ""
                                });
                            }
                        }
                        else {
                            if (response.error && response.error.reason) {
                                that.logger.log("error", LOG_ID + "(get) HTTP security issue", response.error.reason);
                                reject({
                                    code: -1,
                                    msg: response.error.reason,
                                    details: ""
                                });
                            }
                            else {
                                that.logger.warn("warn", LOG_ID + "(get) HTTP other issue , response : ", JSON.stringify(response) + " error : " + response.message);
                                that.logger.log("info", LOG_ID + "(get) HTTP other issue", response);
                                reject({
                                    code: -1,
                                    msg: "Unknown error",
                                    details: response
                                });
                            }
                        }
                    });
                } else {
                    let buff = [];
                    let err = {};
                    let req = Request.get({
                        url: that.serverURL + url,
                        headers: headers,
                        proxy: (that.proxy && that.proxy.isProxyConfigured) ? that.proxy.proxyURL : null
                    }).on("response", function(response) {
                        that.logger.log("info", LOG_ID + "(get) status code:" + response.statusCode); // 200
                        that.logger.log("info", LOG_ID + "(get) response headers: " + response.headers["content-type"]); // 'image/png'
                        if ( response.statusCode === 400) {
                            req.abort();
                            err.statusCode = response.statusCode;
                            err.statusMessage = response.statusMessage;
                            err.contentType = response.headers["content-type"];
                        }
                    }).on("data", (chunk) => {
                        buff.push(chunk);
                    }).on("error", (error) => {
                        that.logger.log("error", LOG_ID, "(get) error", error);
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
                        if ( !err.statusCode ) {
                            let data = Buffer.concat(buff);
                            resolve(data);
                        } else {
                           reject({
                                    code: err.statusCode,
                                    msg: err.statusMessage,
                                    details: ""
                            }); 
                        }
                    });
                }
            } catch (err) {
                that.logger.log("error", LOG_ID + "(get) HTTP Error", err);
                reject({
                    code: -1,
                    msg: "Unknown error",
                    details: ""
                });
            }
        });
    }

    post(url, headers, data, contentType) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("info", LOG_ID + "(post) url", that.serverURL + url, data);

            headers["user-agent"] = USER_AGENT;

            var request = unirest.post(that.serverURL + url);
            request.headers(headers);

            contentType = contentType || "json";
            request.type(contentType);

            request.send(data);
            
            if (that.proxy && that.proxy.isProxyConfigured) {
                request.proxy(that.proxy.proxyURL);
            }
            request.end(function(response) {
                that.logger.log("info", LOG_ID + "(post) HTTP code", response.code + ", message : " + response.error ? response.error.message || "" : "");
                if (response.code === 200 || response.code === 201) {
                    resolve(response.body);
                }
                else {
                    reject({
                        code: response.code,
                        msg: response.body ? response.body.errorMsg || "" : "" ,
                        details: response.body ? response.body.errorDetails || "" : ""
                    });
                }
            });
        });
    }

    put(url, headers, data) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("info", LOG_ID + "(put) url", that.serverURL + url, data);

            headers["user-agent"] = USER_AGENT;

            var request = unirest.put(that.serverURL + url);
            request.headers(headers);
            request.type("json");
            request.send(data);
            if (that.proxy.isProxyConfigured) {
                request.proxy(that.proxy.proxyURL);
            }
            request.end(function(response) {
                that.logger.log("info", LOG_ID + "(put) HTTP code", response.code);
                if (response.code === 200 || response.code === 201) {
                    resolve(response.body);
                }
                else {
                    reject({
                        code: response.code,
                        msg: response.body ? response.body.errorMsg || "" : "",
                        details: response.body ? response.body.errorDetails || "" : ""
                    });
                }
            });
        });
    }

    delete(url, headers) {

        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("info", LOG_ID + "(delete) url", that.serverURL + url);

            headers["user-agent"] = USER_AGENT;

            var request = unirest.delete(that.serverURL + url);
            request.headers(headers);
            if (that.proxy.isProxyConfigured) {
                request.proxy(that.proxy.proxyURL);
            }
            request.end(function(response) {
                that.logger.log("info", LOG_ID + "(delete) HTTP code", response.code);
                if (response.code === 200) {
                    resolve(response.body);
                }
                else {
                    reject({
                        code: response.code,
                        msg: response.body ? response.body.errorMsg || "" : "",
                        details: response.body ? response.body.errorDetails || "" : ""
                    });
                }
            });
        });
    }
}

module.exports = HTTPService;