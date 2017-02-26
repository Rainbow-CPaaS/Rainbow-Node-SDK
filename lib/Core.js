'use strict';

var path = require('path');


var RESTService = require('./connection/RESTService');
var HTTPService = require('./connection/HttpService');
var XMPPService = require('./connection/XMPPService');
var IMService = require('./services/IM');
var PresenceService = require('./services/Presence');
var ContactsService = require('./services/Contacts');
var Logger = require('./Logger');
var config = require('./config/config');

var getHTTPOptions, getXMPPOptions;

const LOG_ID = 'CORE - ';

class Core {

    constructor(options, _eventEmitter) {

        //
        var loggerModule = new Logger(options, config.logs);
        this.logger = loggerModule.log;
        
        getHTTPOptions = (options) => {
            var httpOptions = config.sandbox.http;
            
            switch (options.rainbow.host) {
                case "official":
                    httpOptions = config.official.http;
                    break;
                case "sandbox":
                    httpOptions = config.sandbox.http;
                    break;
                default:
                    this.logger.log("warn", LOG_ID + "constructor - host value is not valid (should be 'sandbox' or 'official'). Use 'sandbox'", options.rainbow.host);
                    break;
            }
            return httpOptions;
        }

        getXMPPOptions = (options) => {
            var xmppOptions = config.sandbox.xmpp;
            
            switch (options.rainbow.host) {
                case "official":
                    xmppOptions = config.official.xmpp;
                    break;
                case "sandbox":
                    xmppOptions = config.sandbox.xmpp;
                    break;
                default:
                    this.logger.log("warn", LOG_ID + "constructor - host value is not valid (should be 'sandbox' or 'official'). Use 'sandbox'", options.rainbow.host);
                    break;
            }
            return xmppOptions;
        }

        this.logger.log("debug", LOG_ID + "constructor - begin");
        this.eventEmitter = _eventEmitter;
        
        if(!options || !options.rainbow || !options.rainbow.host) {
            logger.log("warn", LOG_ID + "constructor - host is missing from the configuration file. Use 'sandbox'. Check the documentation!");
            options = {rainbow: {host: 'sandbox'}};
        }
        this._http = new HTTPService(getHTTPOptions(options), this.logger);
        this._xmpp = new XMPPService(getXMPPOptions(options), this.eventEmitter, this.logger);
        this._im = new IMService(this.logger);
        this._presence = new PresenceService(this.eventEmitter, this.logger);
        this._contacts = new ContactsService(this.eventEmitter, this.logger);

        if(!options.credentials || !options.credentials.login || !options.credentials.password) {
            this.logger.log("error", LOG_ID + "constructor - 'login' or 'password' parameters are missing from the configuration file. Check the documentation!");
            this.eventEmitter.emit("rainbow_nocredentials");
        } else {
            this._rest = new RESTService(options.credentials, this.eventEmitter, this.logger);
        }
        this.logger.log("debug", LOG_ID + "constructor - end");
    }

    start()
    {
        try
        {
            var that = this;

            this.logger.log("debug", LOG_ID +  "start - begin");

            return new Promise(function(resolve, reject) {
                that.logger.log("debug", LOG_ID +  "start - start all modules");
                Promise.all([
                    that._http.start(),
                    that._rest.start(that._http),
                    that._xmpp.start(),
                    that._im.start(that._xmpp),
                    that._presence.start(that._xmpp),
                    that._contacts.start(that._xmpp, that._rest)
                ]).then(function() {
                    that.logger.log("debug", LOG_ID +  "start - all modules started successfully");
                    resolve();
                }).catch(function(err) {
                    that.logger.log("error", LOG_ID + "start - error", err);
                    reject(err);
                });
            });
        }
        catch(err) {
            that.logger.log("error", LOG_ID + "start", err);
            console.log(typeof err);
            reject(err);
        }
    }

    signin(forceStopXMPP) {
        var that = this;
        this.logger.log("debug", LOG_ID +  "signin - begin");

        if(forceStopXMPP) {
            this.logger.log("debug", LOG_ID +  "signin - stop the XMPP service");
            this._xmpp.stop();
        }

        return new Promise(function(resolve, reject) {
            that._rest.signin().then(function() {
                return that._xmpp.signin(that._rest.loggedInUser);
            }).then(function() {
                that.logger.log("debug", LOG_ID +  "signin - signed in successfully");
                that.logger.log("debug", LOG_ID +  "signin - end");
                resolve();
            }).catch(function(err) {
                that.logger.log("debug", LOG_ID +  "signin - can't signed-in", err);
                that.logger.log("debug", LOG_ID +  "signin - end");
                reject(err);
            });
        })
    }

    tokenSurvey() {
        var that = this;

        var onTokenRenewed = function onTokenRenewed() {
            that.logger.log("info", LOG_ID +  "tokenSurvey - token successfully renewed");
            that._rest.startTokenSurvey();
        };

        var onTokenExpired = function onTokenExpired() {
            that.logger.log("info", LOG_ID +  "tokenSurvey - token expired. Signin required");
            that.eventEmitter.removeListener('rainbow_tokenrenewed', onTokenRenewed);
            that.eventEmitter.removeListener('rainbow_tokenexpired', onTokenExpired);
            that.eventEmitter.emit('rainbow_signinrequired');
        };

        this.eventEmitter.on('rainbow_tokenrenewed', onTokenRenewed);
        this.eventEmitter.on('rainbow_tokenexpired', onTokenExpired);
        this._rest.startTokenSurvey();
    }


    stop() {
        this.logger.log("debug", LOG_ID +  "stop - begin");
        return Promise.all([
            that._rest.stop(),
            that._http.stop(),
            that._xmpp.stop(),
            that._im.stop(),
            that._presence.stop(),
            that._contacts.stop()
        ]);
        this.logger.log("debug", LOG_ID +  "stop - end");
    }

    get presence() {
        return this._presence;
    }

    get im() {
        return this._im;
    }

    get contacts() {
        return this._contacts;
    }

}

module.exports = Core;
