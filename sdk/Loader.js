'use strict';

var chalk = require("chalk");
var path = require('path');

var ConfigParser = require(path.join(__dirname, 'ConfigParser.js'));
var Connection = require(path.join(__dirname, 'Connection.js'));
var HTTPService = require(path.join(__dirname, 'httpService.js'));

const LOG_ID = '[SDK       ]';

class Loader {

    constructor(configPath) {
        this.config = ConfigParser.loadConfig(configPath);
        this.connection = Connection.create(this.config.credentials);
        this.http = HTTPService.create(this.config.http);
    }

    start()
    {
        try
        {
            console.log(LOG_ID, '--------------------------------------------------------');
            console.log(LOG_ID, '--                 Rainbow SDK NODE.JS                --');
            console.log(LOG_ID, '--------------------------------------------------------');

            this.load().then(function() {
                this._manageEvent();
            });
            
        }
        catch(err) {
            console.log("ERROR", err.message);
            console.log('Initialization failed');
            process.exit(-1);
        }
    }

    load() {
        var that = this;
        return new Promise(function(resolve, reject) {
            console.log(LOG_ID, 'Start all modules');
            Promise.all([
                that.http.start(),
                that.connection.start(that.http)
            ]).then(function() {
                that.connection.login().then(function() {
                    console.log(LOG_ID, "Logged!!!");
                });
            }).catch(function() {

            });
        });
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

        process.on('SIGINT', () => {
            console.log('%s Cautch a SIGINT signal', LOG_ID);
            this.exit();
        });

        process.on('SIGTERM', () => {
            console.log('%s Cautch a SIGTERM signal', LOG_ID);
            this.exit();
        });

        process.on('exit', () => {
            console.log(LOG_ID, 'BYE BYE');
        });

        process.on('uncaughtException', (err) => {
            console.log('%s Unexpected exception %s', LOG_ID, err.toString());
            console.log(err.stack);
        });
    }
}

module.exports.create = function(config) {
    return new Loader(config);
}
