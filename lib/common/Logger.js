"use strict";

const winston = require("winston");
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require("fs");
const colors = require("colors/safe");
const util = require("util");
const stripAnsi = require('strip-ansi');

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

const myFormatNoColors = winston.format.printf(info => {
    return `${tsFormat()}` + ' - ' + stripAnsi(info.level) + ':' + stripAnsi(info.message);
}) ;

const argumentsToString = (v)=>{
    // convert arguments object to real array
    var args = Array.prototype.slice.call(v, 1);
    for(var k in args){
        if (typeof args[k] === "object"){
            // args[k] = JSON.stringify(args[k]);
            args[k] = util.inspect(args[k], false, null, true);
        }
    }
    var str = args.join(" ");
    return str;
}


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
        var logLevel = logs.level;
        var logColor = logs.color;
        var logFormat = myFormat;
        var zippedArchive = logs.zippedArchive;
        let maxSize = logs.maxSize;
        let maxFiles = logs.maxFiles;

        var enableConsoleLog = true;
        var enableFileLog = false;

        // No configuration for file --> Don't store logs in file
        if (!("logs" in config)) {
            enableFileLog = false;
        }

        if (("logs" in config) && ("color" in config.logs))  {
            logColor = config.logs.color;
        }

        if (!logColor) {
            logFormat=myFormatNoColors;
        } else {
            logFormat=myFormat;
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
                logLevel = config.logs.file.level;
            }
            //Set the zippedArchive for log file
            if (("logs" in config) && ("file" in config.logs) && ("zippedArchive" in config.logs.file)) {
                zippedArchive = config.logs.file.zippedArchive;
            }
            //Set the zippedArchive for log file
            if (("logs" in config) && ("file" in config.logs) && ("maxSize" in config.logs.file)) {
                maxSize = config.logs.file.maxSize;
            }
            //Set the zippedArchive for log file
            if (("logs" in config) && ("file" in config.logs) && ("maxFiles" in config.logs.file)) {
                maxFiles = config.logs.file.maxFiles;
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

        let that = this;
        this._winston = {};
        this._logger = {};
        this._logger.info = function () {
            that._winston.log.apply(that._winston, ["info", argumentsToString(arguments)]);
        };

        this._logger.error = function () {
            that._winston.log.apply(that._winston, ["error", argumentsToString(arguments)]);
        };

        this._logger.warn = function () {
            that._winston.log.apply(that._winston, ["warn", argumentsToString(arguments)]);
        };

        this._logger.log = function (level) {
            that._winston.log.apply(that._winston, [level, argumentsToString(arguments)]);
        };


        if (enableConsoleLog && enableFileLog) {


            this._winston = winston.createLogger({

                format: winston.format.combine(
                    winston.format.colorize({ all: logColor }),
                    //winston.format.label({ label: 'right meow!' }),
                    //winston.format.colorize({ all: false }),
                    winston.format.simple(),
                    winston.format.timestamp(),
                    logFormat
                    //winston.format.prettyPrint()
                ),

                transports: [
                    new (winston.transports.Console)({
                        level: logLevel
                    }),
                    new (DailyRotateFile)({
                        name: 'logs',
                        filename: `${logDir}/%DATE%-rainbowsdk.log`,
                        maxSize: maxSize,
                        zippedArchive: zippedArchive,
                        timestamp: tsFormat,
                        datePattern: "YYYY-MM-DD",
                        maxFiles: maxFiles,
                        prepend: true,
                        level: logLevel
                    })
                ]
            });

            welcome();

            this._logger.log("info", LOG_ID + "(constructor) console and file logs enabled");

            this._logger.log("info", LOG_ID + "(constructor) logs store in directory", logDir);
        }
        else if (enableConsoleLog) {

            this._winston = winston.createLogger({
                format: winston.format.combine(
                    winston.format.colorize({ all: logColor }),
                    winston.format.simple(),
                    //winston.format.label({ label: 'right meow!' }),
                    winston.format.timestamp(),
                    logFormat
                    //winston.format.prettyPrint()
                ),
                transports: [
                    new (winston.transports.Console)({
                        level: logLevel
                    })
                ]
            });

            welcome();

            this._logger.log("info", LOG_ID + "(constructor) No file logs enabled");
        }
        else if (enableFileLog) {
            this._winston = winston.createLogger({

                format: winston.format.combine(
                    winston.format.colorize({ all: logColor }),
                    //winston.format.label({ label: 'right meow!' }),
                    winston.format.timestamp(),
                    logFormat
                    //winston.format.prettyPrint()
                ),

                transports: [
                    new (DailyRotateFile)({
                        name: 'logs',
                        filename: `${logDir}/%DATE%-rainbowsdk.log`,
                        maxSize: maxSize,
                        zippedArchive: zippedArchive,
                        timestamp: tsFormat,
                        datePattern: "YYYY-MM-DD",
                        maxFiles: maxFiles,
                        prepend: true,
                        level: logLevel
                    })
        ]
            });

            welcome();

            this._logger.log("info", LOG_ID + "(constructor) No console logs enabled");

            this._logger.log("info", LOG_ID + "(constructor) logs store in directory", logDir);
        }
        else {
            this._winston = winston.createLogger({
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