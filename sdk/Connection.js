"use strict";

var winston = require("winston");
var jwt = require("jwt-decode");
var btoa = require('btoa');

var getRequestHeader, getLoginHeader;

const LOG_ID = '[CONNECTION] ';

class Connection {

    constructor(_credentials, _eventEmitter) {
        this.http = null;
        this.account = null;
        this.token = null;
        this.renewTokenInterval = null;
        this.auth = btoa(_credentials.login + ":" + _credentials.password);
        this.loginEmail = _credentials.login;
        this.eventEmitter = _eventEmitter;

        getRequestHeader = () => { 
            return { 
                "Authorization": "Bearer " + this.token, 
                "Accept": "application/json" 
            };
        };

        getLoginHeader = () => { 
            return { 
                'Accept': 'application/json', 
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + this.auth 
            };
        }
    }

    start(http) {
        var that = this;
        this.http = http;

        winston.log("info", LOG_ID + "start - begin");
        return new Promise(function(resolve, reject) {
            winston.log("info", LOG_ID + "start - email", that.loginEmail);
            winston.log("info", LOG_ID + "start - end");
            resolve();
        });
    }

    get loggedInUser () {
        return this.account;
    }

    signin() {

        var that = this;

        winston.log("info", LOG_ID + "signin - begin");

        return new Promise(function(resolve, reject) {
            that.http.get('/api/rainbow/authentication/v1.0/login', getLoginHeader()).then(function(JSON) {
                that.account = JSON.loggedInUser;
                that.token = JSON.token
                winston.log("debug", LOG_ID + "signin - Welcome " + that.account.displayName + '!');
                resolve();
            }).catch(function(err) {
                winston.log("error", LOG_ID, err);
                winston.log("info", LOG_ID + "signin - end");
                reject(err);
            });
        });
    }

    startTokenSurvey() {

        var that = this;

        var decodedToken = jwt(that.token);
        winston.log("debug", LOG_ID + "_startTokenSurvey", decodedToken);
        var tokenExpirationTimestamp = decodedToken.exp * 1000;
        var expirationDate = new Date(tokenExpirationTimestamp);
        var currentDate = new Date();
        var currentTimestamp = currentDate.valueOf();
        var tokenExpirationDuration = tokenExpirationTimestamp - currentTimestamp;

        if (tokenExpirationDuration < 0) {
            winston.log("info", "_startTokenSurvey - Auth token has already expired, re-new it immediately");
            that._renewAuthToken();
        }
        else if (tokenExpirationDuration < 300000) {
            winston.log("warn", "_startTokenSurvey - Auth token will expire in less 5 minutes, re-new it immediately");
            that._renewAuthToken();
        }
        else {
            var usedExpirationDuration = tokenExpirationDuration - 3600000; // Refresh 1 hour before the token expiration
            winston.log("info", "_startTokenSurvey - Start token survey (expirationDate: " + expirationDate + " tokenExpirationDuration: " + tokenExpirationDuration + "ms usedExpirationDuration: " + usedExpirationDuration + "ms)");
            if (that.renewTokenInterval) { 
                clearTimeout(that.renewTokenInterval); 
            }
            that.renewTokenInterval = setTimeout(function() { 
                that._renewAuthToken();
            }, usedExpirationDuration);
        }
    }

    _renewAuthToken() {
        var that = this;

        winston.log("info", LOG_ID + "_renewAuthToken - begin");

        that.http.get('/api/rainbow/authentication/v1.0/renew', getRequestHeader()).then(function(JSON) {
            winston.log("info", LOG_ID + "_renewAuthToken - renew authentication token success");
            that.token = JSON.token;
            winston.log("debug", LOG_ID + "_renewAuthToken - new token received", that.token);
            that.eventEmitter.emit("rainbow_tokenrenewed");
        }).catch(function(err) {
            winston.log("error", LOG_ID, "_renewAuthToken - renew authentication token failure", err);
            clearTimeout(that.renewTokenInterval);
            that.renewTokenInterval = null;
            that.eventEmitter.emit("rainbow_tokenexpired");
        });
    }
};

module.exports.create = function(credentials, eventEmitter) {
    return new Connection(credentials, eventEmitter);
}