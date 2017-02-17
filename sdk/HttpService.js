"use strict";

var unirest = require('unirest');
var btoa = require('btoa');

const LOG_ID = '[HTTPSrv   ]';

class HTTPService {

    constructor(_http) {
        this.http = _http;
        this.serverURL = this.http.protocol + "://" + this.http.host + ":" + this.http.port;
        this.auth = "";
        this.token = "";
    }

    start() {
        var that = this;

        return new Promise(function(resolve, reject) {
            console.log(LOG_ID, "Module started");
            console.log(LOG_ID, "REST Server = " + that.serverURL);
            resolve();
        });
    }

    login(url, login, password) {
        var that = this;

        console.log(LOG_ID, "Trying for " + login);

        return new Promise(function(resolve, reject) {
            that.auth = btoa(login + ":" + password);
            that.get(url).then(function(body) {
                console.log(LOG_ID, "Logged!");
                that.token = body.token;
                resolve();
            }).catch(function(err) {
                console.log(LOG_ID, err);
                reject(err);
            })
        });
    }

    get(url) {

        var that = this;

        return new Promise(function (resolve, reject) {

            console.log(LOG_ID, "AUTH = " +that.auth);

            unirest.get(that.serverURL + url)
            .headers({
                'Accept': 'application/json', 
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + that.auth
            })
            .end(function (response) {
                console.log(response);
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