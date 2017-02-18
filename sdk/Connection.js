"use strict";

var winston = require("winston");
var jwt = require("jwt-decode");

const LOG_ID = '[CONNECTION] ';

class Connection {

    constructor() {
        this.http = null;
        this.account = null;
        this.token = null;
    }

    start(http) {
        var that = this;
        this.http = http;

        winston.log("info", LOG_ID + "start - begin");
        return new Promise(function(resolve, reject) {
            winston.log("info", LOG_ID + "start - end");
            resolve();
        });
    }

    login() {

        var that = this;

        winston.log("info", LOG_ID + "login - begin");

        return new Promise(function(resolve, reject) {
            that.http.get('/api/rainbow/authentication/v1.0/login').then(function(JSON) {
                that.account = JSON.loggedInUser;
                that.token = JSON.token
                winston.log("debug", LOG_ID + "login - Welcome " + that.account.displayName + '!');
                var decoded = jwt(that.token);
                winston.log("debug", LOG_ID + "login", decoded);
                winston.log("info", LOG_ID + "login - end");
                resolve();
            }).catch(function(err) {
                winston.log("error", LOG_ID, err);
                winston.log("info", LOG_ID + "login - end");
                reject(err);
            });
        });
        
    }

};

module.exports.create = function(config) {
    return new Connection(config);
}