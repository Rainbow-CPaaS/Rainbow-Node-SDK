"use strict";

var unirest = require('unirest');
var winston = require("winston");


const LOG_ID = '[HTTP] ';

class HTTPService {

    constructor(_http, _credentials) {
        this.serverURL = _http.protocol + "://" + _http.host + ":" + _http.port;
    }

    start() {
        var that = this;
        winston.log("info", LOG_ID + "start - begin");

        return new Promise(function(resolve, reject) {
            winston.log("debug", LOG_ID + "start", {"serverURL": that.serverURL});
            winston.log("info", LOG_ID + "start - end");
            resolve();
        });
    }
            
    get(url, headers) {

        var that = this;

        return new Promise(function (resolve, reject) {

            unirest.get(that.serverURL + url)
            .headers(headers)
            .end(function (response) {
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

module.exports.create = function(config) {
    return new HTTPService(config);
}