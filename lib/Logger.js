
const winston = require("winston");
const fs = require('fs');

const LOG_ID = 'LOGS - ';

const tsFormat = () => (new Date()).toLocaleTimeString();

class Logger {

    constructor(config, logs) {

        var logDir = logs.path; 

        if(!config.logs) {

            this._logger = new (winston.Logger)({
                transports: [
                    new (winston.transports.Console)({ 
                        colorize: true, 
                        timestamp: tsFormat, 
                        level: "debug" 
                    })
                ]
            });

            this._logger.log("info", LOG_ID + "logger - Don't log dev information in file");
        }
        else {

            if(!config.logs.file) {
                config.logs.path = logs.path;
            }

            if(!config.logs.level) {
                config.logs.level = logs.level;
            }

            if (!fs.existsSync(config.logs.path)) {
                fs.mkdirSync(config.logs.path);
            }

            var logDir = config.logs.path;

            this._logger = new (winston.Logger)({
                transports: [
                    new (winston.transports.Console)({ 
                        colorize: true, 
                        timestamp: tsFormat, 
                        level: "debug" 
                    }),
                    new (require('winston-daily-rotate-file'))({
                        filename: `${logDir}/-rainbowsdk.log`,
                        timestamp: tsFormat,
                        datePattern: 'yyyy-MM-dd',
                        prepend: true,
                        level: config.logs.level
                    })
                ]
            });

            this._logger.log("info", LOG_ID + "logger - Log dev information in file", config.logs);
        }
    }

    get log() {
        return this._logger;
    }

}

module.exports = Logger;