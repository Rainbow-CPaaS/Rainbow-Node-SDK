"use strict";

var unirest = require("unirest");

const LOG_ID = "HTTP - ";

class HTTPService {

    constructor(_http, _logger, _proxy) {
        this.serverURL = _http.protocol + "://" + _http.host + ":" + _http.port;
        this._host = _http.host;
        this.logger = _logger;
        this.proxy = _proxy;
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
            
    get(url, headers) {

        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("info", LOG_ID + "(get) url", url);

            var request = unirest.get(that.serverURL + url);
            request.headers(headers);
            if (that.proxy && that.proxy.isProxyConfigured) {
                request.proxy(that.proxy.proxyURL);
            }
            request.end(function(response) {
                if (response.code) {
                    that.logger.log("info", LOG_ID + "(get) HTTP code", response.code);
                    if (response.code === 200) {
                        if ( response.headers["content-type"].indexOf("json") > -1) {
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
                        reject({
                            code: response.code,
                            msg: response.body ? response.body.errorMsg || "" : "",
                            details: response.body ? response.body.errorDetails || "" : ""
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
                        that.logger.log("info", LOG_ID + "(get) HTTP other issue", response);
                        reject({
                            code: -1,
                            msg: "Unknown error",
                            details: response
                        });
                    }
                }
            });
        });
    }

    post(url, headers, data) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("info", LOG_ID + "(post) url", url, data);

            var request = unirest.post(that.serverURL + url);
            request.headers(headers);
            request.type("json");
            request.send(data);
            if (that.proxy && that.proxy.isProxyConfigured) {
                request.proxy(that.proxy.proxyURL);
            }
            request.end(function(response) {
                that.logger.log("info", LOG_ID + "(post) HTTP code", response.code);
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

    put(url, headers, data) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("info", LOG_ID + "(put) url", url, data);

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

            that.logger.log("info", LOG_ID + "(delete) url", url);

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

    stop() {
        var that = this;

        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise((resolve) => {
            that.logger.log("info", LOG_ID + "(stop) Successfully stopped");
            that.logger.log("debug", LOG_ID + "(stop) _exiting_");
            resolve();
        });
    }
}

module.exports = HTTPService;