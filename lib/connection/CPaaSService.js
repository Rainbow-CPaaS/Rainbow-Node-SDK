"use strict";

let Buffer = require("buffer").Buffer;

const LOG_ID = "CPAAS - ";

class CPaaSService {
    constructor(_application, _http, _eventEmitter, _logger) {

        this.http = null;
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;

        this.token = "";
        this.appID = "";
        this.sessionID = "";
        this.application = _application;
        this.serverURL = _http.protocol + "://" + _http.host + ":" + _http.port;

        this.eventHandler = null;
        this.isAuthenticated = false;
    }

    start(_http) {
        let that = this;
        this.logger.log("debug", LOG_ID + "(start) _entering_");
        this.http = _http;
        
        return new Promise((resolve) => {

            that.authenticate(that.application.appID, that.application.appSecret).then((token) => {
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
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
                    that.logger.log("debug", LOG_ID + "(authenticate) Authentication is successfull for application " + strKey);
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
                that.appID = "__no_app_id__";
                resolve(that.token);
            }
        });
    }

    appToken() {
        return this.token;
    }
}

module.exports = CPaaSService;