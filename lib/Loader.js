'use strict';

var winston = require("winston");
var path = require('path');

var Connection = require('./connection/Connection');
var HTTPService = require('./connection/HttpService');
var WSService = require('./connection/WSService');
var config = require('./config/config');

var getHTTPOptions, getXMPPOptions;

const LOG_ID = '[LOADER] ';

class Loader {

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
        this.http = new HTTPService(getHTTPOptions(options));
        this.ws = new WSService(getXMPPOptions(options), this.eventEmitter);

        if(!options.credentials || !options.credentials.login || !options.credentials.password) {
            winston.log("error", LOG_ID + "constructor - 'login' or 'password' parameters are missing from the configuration file. Check the documentation!");
        }
        this.connection = new Connection(options.credentials, this.eventEmitter);
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
                    that.http.start(),
                    that.connection.start(that.http),
                    that.ws.start()
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
            that.connection.signin().then(function() {
                return that.ws.signin(that.connection.loggedInUser);
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
            that.connection.startTokenSurvey();
        };

        var onTokenExpired = function onTokenExpired() {
            winston.log("info", LOG_ID +  "tokenSurvey - token expired. Signin required");
            that.eventEmitter.removeListener('rainbow_tokenrenewed', onTokenRenewed);
            that.eventEmitter.removeListener('rainbow_tokenexpired', onTokenExpired);
            that.eventEmitter.emit('rainbow_signinrequired');
        };

        this.eventEmitter.on('rainbow_tokenrenewed', onTokenRenewed);
        this.eventEmitter.on('rainbow_tokenexpired', onTokenExpired);
        this.connection.startTokenSurvey();
    }


    stop() {
        return Promise.all([
            that.connection.stop(),
            that.http.stop(),
            that.ws.stop()
        ]);
    }

    exit(code) {
    }

    sendInitialPresence() {
        this.ws.sendInitialPresence();
    }

    get xmpp() {
        return this.ws;
    }
}

module.exports = Loader;
