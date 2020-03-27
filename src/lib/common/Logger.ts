"use strict";
export {};


const winston = require("winston");
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require("fs");
const colors = require("colors/safe");
const util = require("util");
const stripAnsi = require('strip-ansi');

//let defaultConfig = require("../config/config");
import {config as defaultConfig} from "../config/config";

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


class Logger {
	public colors: any;
	public _logger: any;
	public _winston: any;
	public hideId: any;
	public hideUuid: any;

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
            events: [ 'magenta', 'underline', 'italic'],
            eventsEmitter: [ 'cyan', 'underline', 'italic']
        });

        let welcome = () => {
            this._logger.log("info", LOG_ID + "------------------------------------------------");

            this._logger.log("info", LOG_ID + "Welcome to the " + this.colors.magenta("ALE Rainbow SDK for Node.JS") + "");
            this._logger.log("info", LOG_ID + "Where Everything connects");
            this._logger.log("info", LOG_ID + "Support: Send message to Emily using #support #api");
            this._logger.log("info", LOG_ID + "------------------------------------------------");
            this._logger.log("internal", LOG_ID + "(constructor) : ", this.colors.italic(this.colors.red(" \n\
     * \"system-dev\" section in logs is activated!!! \n\
    Note that it is for DEVELOPPEMENT ONLY, no production system should use it : \n\
     * \"internals\" config property is for logs level of debug + unsensored data. \n\
    Warning password and so on can be logs. \n    " +
    that.colors.red.underline("***    IT SHOULD ONLY BE USED IN DEVELOPPEMENT ENVIRONEMENT !!!    ***"))));
        };

        let logs = defaultConfig.logs;

        let logDir = logs.path;
        let logLevel = logs.level;
        let logColor = logs.color;
        let logHttp = logs["system-dev"].http;
        let logInternals = logs["system-dev"].internals;
        let logFormat = myFormat;
        let zippedArchive = logs.zippedArchive;
        let maxSize = logs.maxSize;
        let maxFiles = logs.maxFiles;

        let enableConsoleLog = true;
        let enableFileLog = false;
        let customFileName = "";

        // dev-code //
        this.argumentsToString = this.argumentsToStringReduced;
        // end-dev-code //


        // No configuration for file --> Don't store logs in file
        if (!("logs" in config)) {
            enableFileLog = false;
        }

        if (("logs" in config) && ("color" in config.logs))  {
            logColor = config.logs.color;
        }

        if (("logs" in config) && ("system-dev" in config.logs) &&("http" in config.logs["system-dev"]))  {
            logHttp = config.logs["system-dev"].http;
        }

        if (("logs" in config) && ("system-dev" in config.logs) && ("internals" in config.logs["system-dev"]))  {
            logInternals = config.logs["system-dev"].internals;
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

        if (("logs" in config) && ("level" in config.logs)) {
            logLevel = config.logs.level;
        }

        if (("logs" in config) && ("internals" in config.logs)) {
            logInternals = config.logs.internals;
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
        this._logger.customLabel = "";
        this._logger.logHttp = logHttp;
        this._logger.argumentsToString = that.argumentsToString;

        if (("logs" in config) && ("customLabel" in config.logs))  {
            this._logger.customLabel = config.logs.customLabel + " - " ;
        }

        if (enableFileLog) {
            if (("logs" in config) && ("file" in config.logs) && ("customFileName" in config.logs.file)) {
                customFileName = config.logs.file.customFileName? "-" + config.logs.file.customFileName: "" ;
            }
        }

        this._logger.info = function () {
            that._logger.log.apply(this._logger, ["info", ...arguments]);
        };

        this._logger.error = function () {
            that._logger.log.apply(this._logger, ["error", ...arguments]);
        };

        this._logger.debug = function () {
            that._logger.log.apply(that._logger, ["debug", ...arguments]);
        };

        this._logger.warn = function () {
            that._logger.log.apply(that._logger, ["warn", ...arguments]);
        };

        this.hideId = function (url) {
            return url.replace(/[\/="'][a-f\d]{24}[\/\?&"']?/ig, (x) => {
                let ret = x.toUpperCase();
                if (ret.length > 8) {
                    ret = ret.substring(0, 4) + "..." + ret.substring(ret.length - 4, ret.length);
                }
                return ret;
            });
        };

        this.hideUuid =function (url) {
            return url.replace(/[a-f0-9]{8}[a-f0-9]{4}4[a-f0-9]{3}[89aAbB][a-f0-9]{3}[a-f0-9]{12}[(@|c%40|\'|\")]/ig, (x) => {
                let ret = x.toUpperCase();
                if (ret.length > 8) {
                    ret = ret.substring(0, 4) + "..." + ret.substring(ret.length - 4, ret.length);
                }
                return ret;
            });
        };

        this._logger.log = function (level) {
            try {
                if (level === "internal" || level === "internalerror") {
                    if (logInternals === true) {
                        //level = (level === "internal") ? "debug" : "error";
                        let datatolog = that.colors.italic(that.colors.red("FORBIDDEN TO LOG THIS DATA IN PROD ENV !!! Sorry."));

                        // dev-code //
                        if ( level === "internal") {
                            level = "debug";
                            datatolog = that.colors.italic(that.colors.red("PROD HIDDEN : ")) + that.argumentsToString(arguments);
                            that._winston.log.apply(that._winston, [level, that._logger.customLabel + datatolog]);
                        }
                        else
                            if (level === "internalerror") {
                                level = "error";
                                datatolog = that.colors.italic(that.colors.red("PROD HIDDEN : ")) + that.argumentsToStringFull(arguments);
                                that._winston.log.apply(that._winston, [level, that._logger.customLabel + datatolog]);
                            }
                        // end-dev-code //
                    }
                } else {
                    if (logInternals) {
                        that._winston.log.apply(that._winston, [level, that._logger.customLabel + that.argumentsToString(arguments)]);
                    } else {
                        that._winston.log.apply(that._winston, [level, that._logger.customLabel + that.hideId(that.hideUuid(that.argumentsToString(arguments)))]);
                    }
                }
            } catch (err) {
                console.error("CATCH Error !!! while logging : " + err);
            }
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
                        filename: `${logDir}/%DATE%-rainbowsdk${customFileName}.log`,
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
                        filename: `${logDir}/%DATE%-rainbowsdk${customFileName}.log`,
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

    argumentsToStringReduced (v){
        // convert arguments object to real array
        let args = Array.prototype.slice.call(v, 1);
        for(let k in args){
            if (typeof args[k] === "object"){
                // args[k] = JSON.stringify(args[k]);
                let options = {
                    showHidden  : false,
                    depth : 3,
                    colors : true,
                    maxArrayLength : 3
                };
                args[k] = util.inspect(args[k], options);
            }
        }
        let str = args.join(" ");
        return str;
    }

    argumentsToStringFull (v) {
        // convert arguments object to real array
        let args = Array.prototype.slice.call(v, 1);
        for(let k in args){
            if (typeof args[k] === "object"){
                // args[k] = JSON.stringify(args[k]);
                args[k] = util.inspect(args[k], false, null, true);
            }
        } // */
        let str = args.join(" ");
        return str;
    }

    argumentsToString = this.argumentsToStringFull;
}

module.exports.Logger = Logger;
export {Logger};
