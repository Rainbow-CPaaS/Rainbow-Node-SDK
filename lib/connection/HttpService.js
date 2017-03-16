"use strict";

var unirest = require('unirest');

const LOG_ID = 'HTTP - ';

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

        return new Promise(function(resolve, reject) {
            that.logger.log("debug", LOG_ID + "(start) host used", that._host);
            that.logger.log("info", LOG_ID + "(start) REST URL", that.serverURL);
            that.logger.log("debug", LOG_ID + "(start) _exiting_");
            resolve();
        });
    }
            
    get(url, headers) {

        var that = this;

        return new Promise(function (resolve, reject) {

            that.logger.log("info", LOG_ID + "(get) url", url);

            var request = unirest.get(that.serverURL + url);
            request.headers(headers);
            if(that.proxy.isProxyConfigured) {
                request.proxy(that.proxy.proxyURL);
            }
            request.end(function (response) {
                that.logger.log("info", LOG_ID + "(get) HTTP code", response.code);
                if(response.code === 200) {
                    resolve(response.body);
                }
                else {
                    reject({
                        code: response.code,
                        msg: response.body.errorMsg,
                        details: response.body.errorDetails
                    });
                }
            });
        });
    }

    post(url, headers, data) {
        var that = this;

        return new Promise(function (resolve, reject) {

            that.logger.log("info", LOG_ID + "(post) url", url, data);

            var request = unirest.post(that.serverURL + url);

            var request = unirest.post(that.serverURL + url);
            request.headers(headers);
            request.send(data);
            if(that.proxy.isProxyConfigured) {
                request.proxy(that.proxy.proxyURL);
            }
            request.end(function (response) {
                that.logger.log("info", LOG_ID + "(post) HTTP code", response.code);
                if(response.code === 200 || response.code === 201) {
                    resolve(response.body);
                }
                else {
                    reject(response.body);
                }
            });
        });
    }

    stop() {

    }
};

module.exports = HTTPService;