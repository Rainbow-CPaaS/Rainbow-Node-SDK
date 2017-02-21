'use strict';

var winston = require("winston");
var path = require('path');

var Connection = require('./Connection');
var HTTPService = require('./HttpService');
var WSService = require('./WSService');

const LOG_ID = '[LOADER] ';

class Loader {

    constructor(options, _eventEmitter) {
        winston.level = "debug";
        if(process.env.LOG_LEVEL) {
            winston.level = process.env.LOG_LEVEL;
        }
        winston.log("info", LOG_ID + "constructor - begin");
        this.eventEmitter = _eventEmitter;
        this.connection = new Connection(options.credentials, this.eventEmitter);
        this.http = new HTTPService(options.http);
        this.ws = new WSService(options.xmpp, this.eventEmitter);
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
                    that._manageEvent();
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
        // Kill the process whatever happens when closing
        process.exit(code);
    }

    sendInitialPresence() {
        this.ws.sendInitialPresence();
    }

    _manageEvent() {
        var that = this;

        process.on('SIGINT', (err) => {
            winston.log("error", LOG_ID + "SIGING", err);
            that.exit(-1);
        });

        process.on('SIGTERM', (err) => {
            winston.log("error", LOG_ID + "SIGTERM", err);
            that.exit(-1);
        });

        process.on('exit', () => {
            winston.log("warn", LOG_ID + "exit");
        });

        process.on('uncaughtException', (err) => {
            winston.log("error", LOG_ID + "uncaughtException", err);
        });
    }
}

module.exports = Loader;
