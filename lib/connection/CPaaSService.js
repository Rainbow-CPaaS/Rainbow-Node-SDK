"use strict";

let Buffer = require("buffer").Buffer;

var getRequestHeader; 

class CPaaSService {
    constructor(_http, _eventEmitter, _logger) {

        this.http = _http;
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;
        this.logService = "CPaaSSrv   | ";

        this.token = "";
        this.appID = "";
        this.sessionID = "";
        this.cpaas_protocol = "https";
        this.cpaas_port = "443";
        this.cpaas_server = "openrainbow.com";

        this.eventHandler = null;

        this.isAuthenticated = false;
        this.hasSession = false;

        getRequestHeader = () => {
            return {"x-access-sdk-token": this.token, "Accept": "application/json"};
        };

        this.RAINBOW_ONCPAAS_SESSION_CREATED = "rainbowoncpaassessioncreated";
    }

    start(id, secret, host) {
        return this.authenticate(id, secret, host);
    }

    stop() {
        return Promise.resolve();
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
    authenticate(strKey, strSecret, strHost) {
        let that = this;
        return new Promise(function (resolve, reject) {

            that.logger.log(that.logService + "[authent    ] :: Try to authenticate application " + that.strKey);

            if (strKey.length > 0) {

                var auth = Buffer.from(strKey + ":" + strSecret).toString("base64") ;
                // Use alternate host if needed (testing purpose)
                if (strHost) {
                    that.cpaas_server = strHost;
                }

                that
                    .http.get(
                        "/api/rainbow/applications/v1.0/authentication/login",
                        {
                            "Accept": "application/json",
                            "Authorization": "Basic " + auth
                        }
                    )
                    .then(function (json) {
                        that.logger.log(that.logService + "[authent    ] :: Authentication is successfull for application " + json.loggedInApplication.id);
                        that.token = json.token;
                        that.appID = json.loggedInApplication.id;
                        that.isAuthenticated = true;
                        resolve(json);
                    })
                    .catch(function (err) {
                        that.logger.log(that.logService + "[authent    ] :: Authentication fails: " + err.errorDetails);
                        resolve();
                    });
            } else {
                resolve();
            }
        });
    }

    appToken() {
        return this.token;
    }

    onInformationUpdated(__event, contact) {
        if (!this.hasSession && contact.fullJid) {
            if (this.eventHandler) {
                this.eventHandler();
            }

            this
                .createSession(contact.jid, contact.fullJid)
                .then(function () {
                    this.hasSession = true;
                    this
                        .eventEmitter
                        .emit(this.RAINBOW_ONCPAAS_SESSION_CREATED);
                })
                .catch(function () {});
        }
    }
}

module.exports = CPaaSService;