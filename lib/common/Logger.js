"use strict";

const winston = require("winston");
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require("fs");
const colors = require("colors/safe");

var defaultConfig = require("../config/config");

const LOG_ID = "LOGS - ";

const tsFormat = () => {

    let date = new Date();

    return date.toLocaleDateString() + " " + date.toLocaleTimeString() + " [" + date.valueOf() + "]";
};

const myFormat = winston.format.printf(info => {
    //return `${info.timestamp} [${info._processInfo.pid}] ${info.level}: ${info.message}`;
    return `${tsFormat()} - ${info.level}: ${info.message}`;
});

class Logger {

    constructor(config) {

        this.colors = colors;

        this.colors.setTheme({
            silly: 'rainbow',
            input: 'grey',
            verbose: 'cyan',
            prompt: 'grey',
            info: 'green',
            data: 'grey',
            help: 'cyan',
            warn: 'yellow',
            debug: 'blue',
            error: 'red',
            events: [ 'magenta', 'underline', 'italic']
        });

        var welcome = () => {
            this._logger.log("info", LOG_ID + "------------------------------------------------");

            this._logger.log("info", LOG_ID + "Welcome to the " + this.colors.magenta("ALE Rainbow SDK for Node.JS") + "");
            this._logger.log("info", LOG_ID + "Where Everything connects");
            this._logger.log("info", LOG_ID + "Support: Send message to Emily using #support #api");
            this._logger.log("info", LOG_ID + "------------------------------------------------");
        };

        var logs = defaultConfig.logs;

        var logDir = logs.path;
        //var logLevel = logs.level;

        var enableConsoleLog = true;
        var enableFileLog = false;

        // No configuration for file --> Don't store logs in file
        if (!("logs" in config)) {
            enableFileLog = false;
        }

        // Check for console log
        if (("logs" in config) && ("enableConsoleLogs" in config.logs) && config.logs.enableConsoleLogs) {
            enableConsoleLog = true;
        } else {
            enableConsoleLog = false;
        }

        // Check for file log
        if (("logs" in config) && ("enableFileLogs" in config.logs) && config.logs.enableFileLogs) {
            enableFileLog = true;
        } else {
            enableFileLog = false;
        }

        // Set Path for log file
        if (enableFileLog) {
            if (("logs" in config) && ("file" in config.logs) && ("path" in config.logs.file)) {
                logDir = config.logs.file.path;
            }
        }


        if (enableFileLog) {
            //Set the Level for log file
            if (("logs" in config) && ("file" in config.logs) && ("level" in config.logs.file)) {
                //logLevel = config.logs.file.level;
            }

            // Check and create the directory for logging
            if (!fs.existsSync(logDir)) {
                try {
                    fs.mkdirSync(config.logs.file.path);
                }
                catch (err) {
                    console.log("Can't create the directoy for logging... File logs will be disabled");
                    console.log("Error", err);
                    enableFileLog = false;
                }
            }
        }

        if (enableConsoleLog && enableFileLog) {


            this._logger = winston.createLogger({

                format: winston.format.combine(
                    //winston.format.colorize(),
                    //winston.format.label({ label: 'right meow!' }),
                    winston.format.timestamp(),
                    myFormat,
                    //winston.format.prettyPrint()
                ),

                transports: [
                    new (winston.transports.Console)({
                        level: "debug"
                    }),
                    new DailyRotateFile({
                        filename: `${logDir}/%DATE%-rainbowsdk.log`,
                        timestamp: tsFormat,
                        datePattern: "YYYY-MM-DD",
                        maxFiles: 10,
                        prepend: true,
                        level: config.logs.file.level
                    })
                ]
            });

            welcome();

            this._logger.log("info", LOG_ID + "(constructor) console and file logs enabled");

            this._logger.log("info", LOG_ID + "(constructor) logs store in directory", logDir);
        }
        else if (enableConsoleLog) {

            this._logger = winston.createLogger({
                format: winston.format.combine(
                    winston.format.colorize(),
                    //winston.format.label({ label: 'right meow!' }),
                    winston.format.timestamp(),
                    myFormat,
                    //winston.format.prettyPrint()
                ),
                transports: [
                    new (winston.transports.Console)({
                        level: "debug"
                    })
                ]
            });

            welcome();

            this._logger.log("info", LOG_ID + "(constructor) No file logs enabled");
        }
        else if (enableFileLog) {
            this._logger = winston.createLogger({

                format: winston.format.combine(
                    //winston.format.colorize(),
                    //winston.format.label({ label: 'right meow!' }),
                    winston.format.timestamp(),
                    myFormat,
                    //winston.format.prettyPrint()
                ),

                transports: [
                    new DailyRotateFile({
                        filename: `${logDir}/%DATE%-rainbowsdk.log`,
                        timestamp: tsFormat,
                        datePattern: "YYYY-MM-DD",
                        maxFiles: 10,
                        prepend: true,
                        level: config.logs.level
                    })
                ]
            });

            welcome();

            this._logger.log("info", LOG_ID + "(constructor) No console logs enabled");

            this._logger.log("info", LOG_ID + "(constructor) logs store in directory", logDir);
        }
        else {
            this._logger = winston.createLogger({
                transports: [],
                silent: true
            });
            // No logs :-)
        }

        if (this._logger) {
            this._logger.colors = this.colors ;
        }

    }

    get log() {
        return this._logger;
    }

}

module.exports = Logger;