"use strict";

var unirest = require('unirest');

const LOG_ID = '[HTTP] ';

class HTTPService {

    constructor(_http, _logger) {
        this.serverURL = _http.protocol + "://" + _http.host + ":" + _http.port;
        this.logger = _logger;
    }

    start() {
        var that = this;
        this.logger.log("info", LOG_ID + "start - begin");

        return new Promise(function(resolve, reject) {
            that.logger.log("debug", LOG_ID + "start", {"serverURL": that.serverURL});
            that.logger.log("info", LOG_ID + "start - end");
            resolve();
        });
    }
            
    get(url, headers) {

        var that = this;

        return new Promise(function (resolve, reject) {

            that.logger.log("debug", LOG_ID + "GET", url);

            unirest.get(that.serverURL + url)
            .headers(headers)
            .end(function (response) {
                that.logger.log("debug", LOG_ID + "GET", response.code);
                if(response.code === 200) {
                    resolve(response.body);
                }
                else {
                    reject(response.body);
                }
            });
        });
    }

    post(url, headers, data) {
        var that = this;

        return new Promise(function (resolve, reject) {

            that.logger.log("debug", LOG_ID + "POST", url, data);

            unirest.post(that.serverURL + url)
            .headers(headers)
            .query(data)
            .end(function (response) {
                that.logger.log("debug", LOG_ID + "POST", response.code);
                if(response.code === 200) {
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