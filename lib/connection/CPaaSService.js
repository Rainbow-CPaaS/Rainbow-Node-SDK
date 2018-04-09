"use strict";

let Buffer = require("buffer").Buffer;
const jwt = require("jwt-decode");

const LOG_ID = "CPAAS - ";

class CPaaSService {
    constructor(_application, _http, _eventEmitter, _logger) {

        this.http = null;
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;

        this.token = "";
        this.renewTokenInterval = null;
        this.appID = "";
        this.sessionID = "";
        this.application = _application;
        this.serverURL = _http.protocol + "://" + _http.host + ":" + _http.port;

        this.eventHandler = null;
        this.isAuthenticated = false;

        var that = this;

        this.eventEmitter.on("rainbow_application_authenticate_required", () => {
            that.authenticate(that.application.appID, that.application.appSecret).then((token) => {
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                that.eventEmitter.emit("rainbow_application_token_updated", token);
                that._tokenSurvey();
            }).catch((err) => {
                that.logger.log("debug", LOG_ID + "(start) Can't authenticate application", err);
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
            });
        });
    }

    start(_http, useCLIMode) {
        let that = this;
        this.logger.log("debug", LOG_ID + "(start) _entering_");
        this.http = _http;
        
        return new Promise((resolve) => {

            that.authenticate(that.application.appID, that.application.appSecret).then((token) => {
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                if(!useCLIMode) {
                    that._tokenSurvey();
                }
                resolve(token);
            }).catch((err) => {
                that.logger.log("debug", LOG_ID + "(start) Can't authenticate", err);
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve("");
            });
        });
    }

    stop() {
        var that = this;

        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise((resolve) => {
            that.token = "";
            that.appID = "";
            that.sessionID = "";
            that.logger.log("info", LOG_ID + "(stop) Successfully stopped");
            that.logger.log("debug", LOG_ID + "(stop) _exiting_");
            resolve();
        });
    }

    /**
         * @private
         * @method
         * @instance
         * @description
         *    Authenticate to the CPaaS server <br/>
         * @param {string} strKey The application key
         * @param {string} strSecret The application secret
         * @param {string} strHost The application secret
         * @return {Object} A promise containing the result
         */
    authenticate(strKey, strSecret) {
        let that = this;
        return new Promise((resolve) => {

            that.logger.log("debug", LOG_ID + "(authenticate) _entering_");
            that.logger.log("debug", LOG_ID + "(authenticate) Try to authenticate application " + strKey);

            if (strKey.length > 0) {

                var auth = Buffer.from(strKey + ":" + strSecret).toString("base64");

                that.http.get(
                    "/api/rainbow/applications/v1.0/authentication/login",
                    {
                        "Accept": "application/json",
                        "Authorization": "Basic " + auth
                    }
                ).then((json) => {
                    that.logger.log("debug", LOG_ID + "(authenticate) Authentication is successful for application " + strKey);
                    that.token = json.token;
                    that.appID = json.loggedInApplication.id;
                    that.isAuthenticated = true;
                    that.logger.log("debug", LOG_ID + "(authenticate) _exiting_");
                    resolve(that.token);
                }).catch( (err) => {
                    that.logger.log("error", LOG_ID + "(authenticate) Authentication fails: " + JSON.stringify(err.details));
                    that.logger.log("debug", LOG_ID + "(authenticate) _exiting_");
                    that.appID = strKey;
                    resolve(that.token);
                });
            } else {
                that.logger.log("error", LOG_ID + "(authenticate) Authentication fails: No app ID");
                that.logger.log("debug", LOG_ID + "(authenticate) _exiting_");
                that.appID = "no-app-id";
                resolve(that.token);
            }
        });
    }

    _tokenSurvey() {
        var that = this;
        
        that.logger.log("debug", LOG_ID +  "(tokenSurvey) _enter_");

        var onTokenRenewed = function onTokenRenewed() {
            that.logger.log("info", LOG_ID +  "(tokenSurvey) application token successfully renewed");
            that.startTokenSurvey();
        };

        var onTokenExpired = function onTokenExpired() {
            that.logger.log("info", LOG_ID +  "(tokenSurvey) application token expired. Signin required");
            that.eventEmitter.removeListener("rainbow_application_tokenrenewed", onTokenRenewed);
            that.eventEmitter.removeListener("rainbow_application_tokenexpired", onTokenExpired);
            that.eventEmitter.emit("rainbow_application_authenticate_required");
        };

        that.eventEmitter.on("rainbow_application_tokenrenewed", onTokenRenewed);
        that.eventEmitter.on("rainbow_application_tokenexpired", onTokenExpired);
        that.startTokenSurvey();
    }

    startTokenSurvey() {
        
        var that = this;

        var decodedToken = jwt(that.token);
        this.logger.log("debug", LOG_ID + "(startTokenSurvey) - token", decodedToken);
        var halfExpirationDate = ( decodedToken.exp - decodedToken.iat ) / 2 + decodedToken.iat;
        var tokenExpirationTimestamp = halfExpirationDate * 1000;
        var expirationDate = new Date(tokenExpirationTimestamp);
        var currentDate = new Date();
        var currentTimestamp = currentDate.valueOf();
        var tokenExpirationDuration = tokenExpirationTimestamp - currentTimestamp;

        if (tokenExpirationDuration < 0) {
            this.logger.log("warn", LOG_ID + "(startTokenSurvey) application token has already expired, re-new it immediately");
            this._renewApplicationToken();
        }
        else if (tokenExpirationDuration < 300000) {
            this.logger.log("warn", LOG_ID + "(startTokenSurvey) application token will expire in less 5 minutes, re-new it immediately");
            this._renewApplicationToken();
        }
        else {
            var usedExpirationDuration = tokenExpirationDuration - 3600000; // Refresh 1 hour before the token expiration
            this.logger.log("info", LOG_ID + "(startTokenSurvey) start application token survey (expirationDate: " + expirationDate + " currentDate:" + currentDate + " tokenExpirationDuration: " + tokenExpirationDuration + "ms usedExpirationDuration: " + usedExpirationDuration + "ms)");
            if (this.renewTokenInterval) {
                this.logger.log("info", LOG_ID + "(startTokenSurvey) remove timer"); 
                clearTimeout(that.renewTokenInterval); 
            }
            this.logger.log("info", LOG_ID + "(startTokenSurvey) start a new timer for renewing application token in " + usedExpirationDuration + "ms");
            this.renewTokenInterval = setTimeout(function() { 
                that._renewApplicationToken();
            }, usedExpirationDuration );
        }
    }

    _renewApplicationToken() {
        var that = this;

        this.logger.log("debug", LOG_ID + "(_renewApplicationToken) _entering_");

        that.http.get("/api/rainbow/applications/v1.0/authentication/renew", 
        {
            "Accept": "application/json",
            "x-rainbow-app-token": "Bearer " + that.token || ""
        }).then(function(JSON) {
            that.logger.log("info", LOG_ID + "(_renewApplicationToken) renew authentication token success");
            that.token = JSON.token;
            that.logger.log("info", LOG_ID + "(_renewApplicationToken) new token received", that.token);
            that.logger.log("debug", LOG_ID + "(_renewApplicationToken) _exiting_");
            that.eventEmitter.emit("rainbow_application_tokenrenewed");
            that.eventEmitter.emit("rainbow_application_token_updated", that.token);
        }).catch(function(err) {
            that.logger.log("error", LOG_ID, "(_renewApplicationToken) renew authentication token failure", err);
            clearTimeout(that.renewTokenInterval);
            that.renewTokenInterval = null;
            that.logger.log("debug", LOG_ID + "(_renewApplicationToken) _exiting_");
            that.eventEmitter.emit("rainbow_application_tokenexpired");
            that.eventEmitter.emit("rainbow_application_token_updated", "");
        });
    }

    appToken() {
        return this.token;
    }
}

module.exports = CPaaSService;