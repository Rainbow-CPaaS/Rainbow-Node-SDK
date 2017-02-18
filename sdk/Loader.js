'use strict';

var chalk = require("chalk");
var winston = require("winston");
var path = require('path');

var ConfigParser = require(path.join(__dirname, 'ConfigParser.js'));
var Connection = require(path.join(__dirname, 'Connection.js'));
var HTTPService = require(path.join(__dirname, 'httpService.js'));

const LOG_ID = '[SDK] ';

class Loader {

    constructor(configPath) {
        winston.level = "debug";
        if(process.env.LOG_LEVEL) {
            winston.level = process.env.LOG_LEVEL;
        }
        winston.log("info", LOG_ID + "constructor - begin");
        this.config = ConfigParser.loadConfig(configPath);
        this.connection = Connection.create(this.config.credentials);
        this.http = HTTPService.create(this.config.http, this.config.credentials);
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
                    that.connection.start(that.http)
                ]).then(function() {
                    that._manageEvent();
                    winston.log("info", LOG_ID +  "start - all modules started successfully");
                    that.connection.login().then(function() {
                        winston.log("info", LOG_ID +  "start - signed in successfully");
                        winston.log("info", LOG_ID +  "start - end");
                    });
                }).catch(function(err) {
                    winston.log("error", LOG_ID + "start", err);
                });
            });
        }
        catch(err) {
            winston.log("error", LOG_ID + "start", err);
            process.exit(-1);
        }
    }

    stop() {
        return Promise.all([
            that.connection.stop(),
            that.http.stop()
        ]);
    }

    exit() {
        // Kill the process whatever happens when closing
        const KILL = () => {
            process.exit(0);
        };
    }

    _manageEvent() {

        process.on('SIGINT', (err) => {
            winston.log("error", LOG_ID + "SIGING", err);
            this.exit();
        });

        process.on('SIGTERM', (err) => {
            winston.log("error", LOG_ID + "SIGTERM", err);
            this.exit();
        });

        process.on('exit', () => {
            winston.log("warn", LOG_ID + "exit");
        });

        process.on('uncaughtException', (err) => {
            winston.log("error", LOG_ID + "uncaughtException", err);
        });
    }
}

module.exports.create = function(config) {
    return new Loader(config);
}
