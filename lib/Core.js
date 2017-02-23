'use strict';

var winston = require("winston");
var path = require('path');

var RESTService = require('./connection/RESTService');
var HTTPService = require('./connection/HttpService');
var XMPPService = require('./connection/XMPPService');
var IMService = require('./services/IM');
var PresenceService = require('./services/Presence');
var ContactsService = require('./services/Contacts');
var config = require('./config/config');

var getHTTPOptions, getXMPPOptions;

const LOG_ID = '[Core] ';

class Core {

    constructor(options, _eventEmitter) {

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
                    winston.log("error", LOG_ID + "constructor - host value is not valid (should be 'sandbox' or 'official'). Use 'sandbox'", options.rainbow.host);
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
                    winston.log("error", LOG_ID + "constructor - host value is not valid (should be 'sandbox' or 'official'). Use 'sandbox'", options.rainbow.host);
                    break;
            }
            return xmppOptions;
        }

        winston.level = "debug";
        if(process.env.LOG_LEVEL) {
            winston.level = process.env.LOG_LEVEL;
        }
        winston.log("info", LOG_ID + "constructor - begin");
        this.eventEmitter = _eventEmitter;
        
        if(!options || !options.rainbow || !options.rainbow.host) {
            winston.log("error", LOG_ID + "constructor - host is missing from the configuration file. Use 'sandbox'. Check the documentation!");
        }
        this._http = new HTTPService(getHTTPOptions(options));
        this._xmpp = new XMPPService(getXMPPOptions(options), this.eventEmitter);
        this._im = new IMService();
        this._presence = new PresenceService(this.eventEmitter);
        this._contacts = new ContactsService(this.eventEmitter);

        if(!options.credentials || !options.credentials.login || !options.credentials.password) {
            winston.log("error", LOG_ID + "constructor - 'login' or 'password' parameters are missing from the configuration file. Check the documentation!");
            this.eventEmitter.emit("rainbow_nocredentials");
        } else {
            this._rest = new RESTService(options.credentials, this.eventEmitter);
        }
        winston.log("info", LOG_ID + "constructor - end");
    }

    start()
    {
        try
        {
            var that = this;

            winston.log("info", LOG_ID +  "start - begin");

            return new Promise(function(resolve, reject) {
                winston.log("info", LOG_ID +  "start - start all modules");
                Promise.all([
                    that._http.start(),
                    that._rest.start(that._http),
                    that._xmpp.start(),
                    that._im.start(that._xmpp),
                    that._presence.start(that._xmpp),
                    that._contacts.start(that._xmpp, that._rest)
                ]).then(function() {
                    winston.log("info", LOG_ID +  "start - all modules started successfully");
                    resolve();
                }).catch(function(err) {
                    winston.log("error", LOG_ID + "start", err);
                    reject(err);
                });
            });
        }
        catch(err) {
            winston.log("error", LOG_ID + "start", err);
            reject(err);
        }
    }

    signin() {
        var that = this;
        winston.log("info", LOG_ID +  "signin - begin");
        return new Promise(function(resolve, reject) {
            that._rest.signin().then(function() {
                return that._xmpp.signin(that._rest.loggedInUser);
            }).then(function() {
                winston.log("info", LOG_ID +  "signin - signed in successfully");
                winston.log("info", LOG_ID +  "signin - end");
                resolve();
            }).catch(function(err) {
                winston.log("info", LOG_ID +  "signin - can't signed-in", err);
                winston.log("info", LOG_ID +  "signin - end");
                reject(err);
            });
        })
    }

    tokenSurvey() {
        var that = this;

        var onTokenRenewed = function onTokenRenewed() {
            winston.log("info", LOG_ID +  "tokenSurvey - token successfully renewed");
            that._rest.startTokenSurvey();
        };

        var onTokenExpired = function onTokenExpired() {
            winston.log("info", LOG_ID +  "tokenSurvey - token expired. Signin required");
            that.eventEmitter.removeListener('rainbow_tokenrenewed', onTokenRenewed);
            that.eventEmitter.removeListener('rainbow_tokenexpired', onTokenExpired);
            that.eventEmitter.emit('rainbow_signinrequired');
        };

        this.eventEmitter.on('rainbow_tokenrenewed', onTokenRenewed);
        this.eventEmitter.on('rainbow_tokenexpired', onTokenExpired);
        this._rest.startTokenSurvey();
    }


    stop() {
        return Promise.all([
            that._rest.stop(),
            that._http.stop(),
            that._xmpp.stop(),
            that._im.stop(),
            that._presence.stop(),
            that._contacts.stop()
        ]);
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
