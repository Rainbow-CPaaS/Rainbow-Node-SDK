'use strict';

var chalk = require("chalk");
var path = require('path');

var ConfigParser = require(path.join(__dirname, 'ConfigParser.js'));

const LOG_ID = '[PORTAL]';

class Loader {

    constructor(configPath) {
        var config = ConfigParser.loadConfig(configPath);
    }

    start()
    {
        try
        {
            console.log(LOG_ID, '--------------------------------------------------------');
            console.log(LOG_ID, '--                 Rainbow SDK NODE.JS                --');
            console.log(LOG_ID, '--------------------------------------------------------');

            this._manageEvent();
        }
        catch(err) {
            console.log("ERROR", err.message);
            console.log('Initialization failed');
            process.exit(-1);
        }
    }

    stop() {
        
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
