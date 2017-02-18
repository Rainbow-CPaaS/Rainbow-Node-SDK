"use strict";

var unirest = require('unirest');
var btoa = require('btoa');
var winston = require("winston");


const LOG_ID = '[HTTP] ';

class HTTPService {

    constructor(_http, _credentials) {
        console.log("HTTP", _http, _credentials);
        this.serverURL = _http.protocol + "://" + _http.host + ":" + _http.port;
        this.auth = btoa(_credentials.login + ":" + _credentials.password);
        this.login = _credentials.login;
    }

    start() {
        var that = this;
        winston.log("info", LOG_ID + "start - begin");

        return new Promise(function(resolve, reject) {
            winston.log("debug", LOG_ID + "start", {"serverURL": that.serverURL});
            winston.log("debug", LOG_ID + "start", {"loginEmail": that.login});
            winston.log("info", LOG_ID + "start - end");
            resolve();
        });
    }
            
    get(url) {

        var that = this;

        return new Promise(function (resolve, reject) {

            unirest.get(that.serverURL + url)
            .headers({
                'Accept': 'application/json', 
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + that.auth
            })
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

module.exports.create = function(config, credentials) {
    return new HTTPService(config, credentials);
}