"use strict";
import EventEmitter = NodeJS.EventEmitter;

export {};


const winston = require("winston");

const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require("fs");
const colors = require("colors/safe");
const util = require("util");
import {default as stripAnsi} from 'strip-ansi';
const Cryptr = require('cryptr');
//import stripAnsi from 'strip-ansi';
/* let stripAnsi;
(async () => {
    //import {stripAnsi} from 'strip-ansi';
    stripAnsi = await import('strip-ansi');
})();
// */

//let defaultConfig = require("../config/config");
import {config as defaultConfig} from "../config/config";
import {from} from "rxjs";
import {isDefined, stackTrace} from "./Utils.js";
import {LEVELS, LEVELSCOLORS, LEVELSNAMES, LogLevelAreas} from './LevelLogs.js';

const LOG_ID = "LOGS - ";

const tsFormat = () => {

    let date = new Date();

    return date.toLocaleDateString() + " " + date.toLocaleTimeString() + ":" + date.getMilliseconds() + " [" + date.valueOf() + "]";
};

const myFormat = winston.format.printf(info => {
    //return `${info.timestamp} [${info._processInfo.pid}] ${info.level}: ${info.message}`;
    return `${tsFormat()} - ${info.level}: ${info.message}`;
});

const myFormatNoColors = winston.format.printf(info => {
    return `${tsFormat()} - ${info.level}: ${info.message}`;
    // The following code is necessary when the colors lib disabled.
    //return `${tsFormat()}` + ' - ' + stripAnsi(info.level) + ':' + stripAnsi(info.message);
}) ;


class Logger {
    get areasLogs(): LogLevelAreas {
        return this._areasLogs;
    }

    set areasLogs(value: LogLevelAreas) {
        this._areasLogs = value;
    }
    private enableEncryptedLogs: boolean = false;
    public logLevel: LEVELSNAMES;
    private _areasLogs : LogLevelAreas;

    // public levels: { debug: number; warning: number; error: number;   "http": number, "xmpp": number; info: number , "warn": number, "trace": number, "internal": number, "internalerror": number};
    get logEventEmitter(): NodeJS.EventEmitter {
        return this._logEventEmitter;
    }

    set logEventEmitter(value: NodeJS.EventEmitter) {
        this._logEventEmitter = value;
    }
	public colors: any;
	public _logger: any;
	public _winston: any;
	public hideId: any;
	public hideUuid: any;
	private _logEventEmitter: EventEmitter;
    private emit: (event, info) => void;
    private cryptr : any;

    constructor(config) {

        let self = this;
        const cryptr = new Cryptr('rainbow-node-sdk-1654341354345486797943542318461318730123013');

        winston.addColors(LEVELSCOLORS);

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
            xmpp: "cyan",
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
            this._logger.log("info", LOG_ID + this.colors[LEVELSCOLORS.error]("error level color : " + LEVELSCOLORS.error));
            this._logger.log("info", LOG_ID + this.colors[LEVELSCOLORS.warn]("warn level color : " + LEVELSCOLORS.warn));
            this._logger.log("info", LOG_ID + this.colors[LEVELSCOLORS.info]("info level color : " + LEVELSCOLORS.info));
            this._logger.log("info", LOG_ID + this.colors[LEVELSCOLORS.trace]("trace level color : " + LEVELSCOLORS.trace));
            this._logger.log("info", LOG_ID + this.colors[LEVELSCOLORS.http]("http level color : " + LEVELSCOLORS.http));
            this._logger.log("info", LOG_ID + this.colors[LEVELSCOLORS.xmpp]("xmpp level color : " + LEVELSCOLORS.xmpp));
            this._logger.log("info", LOG_ID + this.colors[LEVELSCOLORS.debug]("debug level color : " + LEVELSCOLORS.debug));
            this._logger.log("info", LOG_ID + this.colors[LEVELSCOLORS.internalerror]("internalerror level color : " + LEVELSCOLORS.internalerror));
            this._logger.log("info", LOG_ID + this.colors[LEVELSCOLORS.internal]("internal level color : " + LEVELSCOLORS.internal));
        };

        let logs = defaultConfig.logs;

        let logDir = logs.path;
        self.logLevel = logs.level;
        let logColor = logs.color;
        let logHttp = logs["system-dev"].http;
        let logInternals = logs["system-dev"].internals;
        let logFormat = myFormat;
        let zippedArchive = logs.zippedArchive;
        let maxSize = logs.maxSize;
        let maxFiles = logs.maxFiles;

        let enableConsoleLog = true;
        let enableFileLog = false;
        let enableEventsLogs = false;
        let enableEncryptedLogs = false;
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
            this.colors?.disable();
            logFormat=myFormatNoColors;
        } else {
            this.colors?.enable();
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

        // Check for events log
        if (("logs" in config) && ("enableEventsLogs" in config.logs) && config.logs.enableEventsLogs) {
            enableEventsLogs = true;
        } else {
            enableEventsLogs = false;
        }

        // Check for Encryption of stanza in log
        if (("logs" in config) && ("enableEncryptedLogs" in config.logs)) {
            if (config.logs.enableEncryptedLogs==false) {
                enableEncryptedLogs = false;
            } else {
                enableEncryptedLogs = true;
            }
            this.enableEncryptedLogs = enableEncryptedLogs;
        }

        // Set Path for log file
        if (enableFileLog) {
            if (("logs" in config) && ("file" in config.logs) && ("path" in config.logs.file)) {
                logDir = config.logs.file.path;
            }
        }

        if (("logs" in config) && ("level" in config.logs)) {
            self.logLevel = config.logs.level;
        }

        if (("logs" in config) && ("internals" in config.logs)) {
            logInternals = config.logs.internals;
        }

        if (enableFileLog) {
            //Set the Level for log file
            if (("logs" in config) && ("file" in config.logs) && ("level" in config.logs.file)) {
                self.logLevel = config.logs.file.level;
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

        if (config && config.logs && config.logs.areas) {
            self._areasLogs = config.logs.areas;
        } else {
            self._areasLogs = new LogLevelAreas(self.logLevel,false,false,false);
            if (self.logLevel === LEVELSNAMES.DEBUG) {
                self._areasLogs.showServicesApiLogs();
            }
            if (self.logLevel === LEVELSNAMES.INTERNAL) {
                self._areasLogs.showServicesApiLogs(true);
                self._areasLogs.showRESTLogs(self.logLevel);
                self._areasLogs.showEventsLogs(self.logLevel);
            }
        }

        let that : any = this;
        this._winston = {};
        this._logger = {};
        this._logger.customLabel = "";
        this._logger.logHttp = logHttp;
        this._logger.argumentsToString = that.argumentsToString;
        this._logger.enableEncryptedLogs = that.enableEncryptedLogs;

        if (("logs" in config) && ("customLabel" in config.logs))  {
            this._logger.customLabel = config.logs.customLabel + " - " ;
        }

        if (enableFileLog) {
            if (("logs" in config) && ("file" in config.logs) && ("customFileName" in config.logs.file)) {
                customFileName = config.logs.file.customFileName? "-" + config.logs.file.customFileName: "" ;
            }
        }

        this._logger.info = function () {
            that._logger.log.apply(this._logger, [LEVELSNAMES.INFO, ...arguments]);
        };

        this._logger.error = function () {
            that._logger.log.apply(this._logger, [LEVELSNAMES.ERROR, ...arguments]);
        };

        this._logger.debug = function () {
            that._logger.log.apply(that._logger, [LEVELSNAMES.DEBUG, ...arguments]);
        };

        this._logger.warn = function () {
            that._logger.log.apply(that._logger, [LEVELSNAMES.WARN, ...arguments]);
        };
        
        this._logger.encrypt = function (str) {
            if (enableEncryptedLogs == true) {
                return cryptr.encrypt(str);
            } else {
                return ("");
            }
        };

        this._logger.decrypt = function (str) {
            return cryptr.decrypt(str);            
        };

        this._logger.stripStringForLogs = function (value : string) {
            let result = "";
            if (self.logLevel !== LEVELSNAMES.INFO ) {
                result = value;
            } else {
                if (!value ) {
                    result = value;
                } else {
                    value += "";
                    result = value.charAt(0) + value.replace(/[^\s](?=.{1,}$)/g, "*")?.substr(1);
                }
            }
            return result;
        }

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

        this.emit = function(level, info) {
            let event = LEVELSNAMES.DEBUG;

            if (this.logEventEmitter && enableEventsLogs) {
                let msg = new Date().toISOString() + " - " + level + ": " + (info ? info.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '') : "");
                this._logEventEmitter.emit(event, msg);
            }
        }

        this._logger.stop = function () {
            return that._winston.end();
        }

        this._logger.log = function (options : {"callerObj" : any, "level" : LEVELSNAMES, isApi : boolean} | LEVELSNAMES) {
            try {
                let levelOfLog: LEVELSNAMES ;
                // Level of the SDK logs.
                let levelOfSdk = self.logLevel;
                let levelOfSdkValue = LEVELS[self.logLevel];
                let levelLimit = LEVELS.error;
                let isApi : boolean = false;
                let showAreaApi : boolean = false;
                if (typeof options==="object") {
                    let callerObj = options?.callerObj;
                    let callerAreaName = "unknown";
                    if (callerObj && (typeof callerObj.getAccessorName) === "function") {
                        callerAreaName = callerObj.getAccessorName();
                    }
                    // Current log's config.
                    let paramsOfAreaLogs = self._areasLogs ? self._areasLogs[callerAreaName] : {level:levelOfSdk};
                    levelOfLog=options?.level?options.level:LEVELSNAMES.INFO;
                    isApi=options?.isApi;
                    //showAreaApi = paramsOfAreaLogs.api;
                    showAreaApi = isDefined(paramsOfAreaLogs.api) ? paramsOfAreaLogs.api : true;
                    // Level of the current log.
                    //let levelOfLog = options?.level;
                    // let levelOfLogNumber = winston.config.syslog.levels[levelOfLog];
                    // let levelOfLogNumber = self.levels[levelOfLog];
                    // Level of the aera in the SDK config options.
                    let levelOfArea = ""+paramsOfAreaLogs?.level;
                    levelLimit = LEVELS[levelOfArea];
                    //levelLimit = levelOfArea?LEVELS[levelOfArea]:levelOfSdkValue;
                    // console.log("paramOfClassLogs", paramsOfClassLogs);
                    //let levelOfAreaNumber = self.levels[paramsOfClassLogs?.level];
                    //let levelOfSdkNumber = self.levels[levelOfLog];
                    //console.log("callerName : ", callerName, ", level : ", level, ", levelOfLogNumber : ", levelOfLogNumber, ", levelOfAreaNumber : ", levelOfAreaNumber, ", levelOfSdkNumber : ", levelOfSdkNumber);
                    /*
                    if (levelOfAreaNumber > levelOfSdkNumber ) {
                        if (levelOfLogNumber > levelOfSdkNumber && levelOfLogNumber < levelOfSdkNumber) {
                            level=levelOfSdkNumber;
                        }
                    } // */
                    // Force to not log the entry if the sdk and the entry are configured to log at "debug" and the aera override at "info".
                    /*
                    if ((levelOfLog === "debug" || levelOfLog === "internal") && levelOfArea === "info" && levelOfSdk === "debug") {
                        return;
                    }
                    // Force to log the entry if the sdk is configured to "info" and the entry and area are configured to log at "debug". Override entry to "info".
                    if ((levelOfLog === "debug" || levelOfLog === "internal") && levelOfArea === "debug" && levelOfSdk === "info") {
                        level = "info";
                    }
                    // */
                    //console.log("callerName : ", callerName, ", levelOfLog : ", levelOfLog, ", levelOfArea : ", levelOfArea, ", levelOfSdk : ", levelOfSdk);
                } else {
                    levelOfLog = options;
                    levelLimit = levelOfSdkValue;
                }
                if (!levelOfLog) {
                    console.log("!!! undefined levelOfLog : ", levelOfLog, ", arguments : ", ...arguments);
                }

                let levelOfLogValue = LEVELS[levelOfLog];
                //console.log("levelOfLog : ", levelOfLog, ", levelOfLogValue : ", levelOfLogValue, ", levelLimit : ", levelLimit);
                if (levelOfLogValue > levelLimit || (isApi && !showAreaApi)) {
                    //console.log("levelOfLogValue : ", levelOfLogValue, "is supperior to levelLimit : ", levelLimit, " so ignore log.");
                    return;
                }

                if (levelOfLog==="internal" || levelOfLog==="internalerror") {
                    if (logInternals===true) {
                        //level = (level === "internal") ? "debug" : "error";
                        let datatolog = that.colors.italic(that.colors.red("FORBIDDEN TO LOG THIS DATA IN PROD ENV !!! Sorry."));

                        // dev-code-internal //
                        if (levelOfLog==="internal") {
                            levelOfLog = LEVELSNAMES.DEBUG;
                            datatolog = that.colors.italic(that.colors.red("PROD HIDDEN : ")) + that.argumentsToString(arguments);
                            that._winston.log.apply(that._winston, [levelOfLog, that._logger.customLabel + datatolog]);
                            that.emit(levelOfLog, that._logger.customLabel + datatolog);
                        } else if (levelOfLog==="internalerror") {
                            levelOfLog = LEVELSNAMES.ERROR;
                            datatolog = that.colors.italic(that.colors.red("PROD HIDDEN : ")) + that.argumentsToStringFull(arguments);
                            that._winston.log.apply(that._winston, [levelOfLog, that._logger.customLabel + datatolog]);
                            that.emit(levelOfLog, that._logger.customLabel + datatolog);
                        }
                        /* */
                        // end-dev-code-internal //
                        /*
                        if ( level === "internal") {
                            level = "debug";
                            that._winston.log.apply(that._winston, [level, that._logger.customLabel + that.hideId(that.hideUuid(that.argumentsToString(arguments)))]);
                            that.emit(level, that._logger.customLabel + that.hideId(that.hideUuid(that.argumentsToString(arguments))));
                        }
                        else
                            if (level === "internalerror") {
                                level = "error";
                                that._winston.log.apply(that._winston, [level, that._logger.customLabel + that.hideId(that.hideUuid(that.argumentsToString(arguments)))]);
                                that.emit(level, that._logger.customLabel + that.hideId(that.hideUuid(that.argumentsToString(arguments))));
                            }
                        // */
                    }
                } else {
                    if (logInternals) {
                        that._winston.log.apply(that._winston, [levelOfLog, that._logger.customLabel + that.argumentsToString(arguments)]);
                        that.emit(levelOfLog, that._logger.customLabel + that.argumentsToString(arguments));
                    } else {
                        that._winston.log.apply(that._winston, [levelOfLog, that._logger.customLabel + that.hideId(that.hideUuid(that.argumentsToString(arguments)))]);
                        that.emit(levelOfLog, that._logger.customLabel + that.hideId(that.hideUuid(that.argumentsToString(arguments))));
                    }
                }
            } catch (err) {
                console.error("CATCH Error !!! while logging : " + err);
            }
        };

        if (enableConsoleLog && enableFileLog) {


            this._winston = winston.createLogger({
                levels: LEVELS,
                format: winston.format.combine(
                        winston.format.errors({ stack: true }), // <-- use errors format
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
                        level: LEVELSNAMES.INTERNAL,
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
                        level: LEVELSNAMES.INTERNAL
                        //level: self.logLevel
                    })
                ]
            });

            welcome();

            this._logger.log("info", LOG_ID + "(constructor) console and file logs enabled");

            this._logger.log("info", LOG_ID + "(constructor) logs store in directory", logDir);
        }
        else if (enableConsoleLog) {

            this._winston = winston.createLogger({
                levels: LEVELS,
                format: winston.format.combine(
                        winston.format.errors({ stack: true }), // <-- use errors format
                    winston.format.colorize({ all: logColor }),
                    winston.format.simple(),
                    //winston.format.label({ label: 'right meow!' }),
                    winston.format.timestamp(),
                    logFormat
                    //winston.format.prettyPrint()
                ),
                transports: [
                    new (winston.transports.Console)({
                        level: LEVELSNAMES.INTERNAL
                    })
                ]
            });

          //  this._winston.addColors(this._winston.config.syslog.colors, { "trace": this._winston.config.syslog.colors.debug, "xmpp": this._winston.config.syslog.colors.debug, "internal": this._winston.config.syslog.colors.debug, "internalerror": this._winston.config.syslog.colors.error})

            welcome();

            this._logger.log("info", LOG_ID + "(constructor) No file logs enabled");
        }
        else if (enableFileLog) {
            this._winston = winston.createLogger({
                levels: LEVELS,
                format: winston.format.combine(
                        winston.format.errors({ stack: true }), // <-- use errors format
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
                        level: LEVELSNAMES.INTERNAL
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

        /*
        let loggers = winston.loggers;

        for (const logguersKey in loggers) {
            console.log("logguer : ", logguersKey, " : ", loggers[logguersKey]);
        }
        // */
        
        if (that._winston.writable) {
            that._winston.on('error', () => {})
                    .on('close', () => {})
                    // flush isn't guaranteed to fire. Since files aren't flushed before 'finish' is fired,
                    // wait 50ms before closing the logger.
                    .on('finish', () => {
                                setTimeout(() => {
                                    that._winston.close();
                                    //console.log("finish winston.");
                                }, 50);
                            }
                    );
                    //.end();
        } else {
        }

        if (self._logger) {
            self._logger.colors = self.colors ;
            self._logger.logLevel = self.logLevel ;
        }

    }
    
    get log() {
        return this._logger;
    }

    stripStringForLogs = function (value : string) {
        return this._logger?.stripStringForLogs(value);
    }

    argumentsToStringReduced (v, delemiter : string = " "){
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
        let str = args.join(delemiter);
        return str;
    }

    argumentsToStringFull (v, delemiter : string = " ") {
        // convert arguments object to real array
        let args = Array.prototype.slice.call(v, 1);
        for(let k in args){
            if (typeof args[k] === "object"){
                // args[k] = JSON.stringify(args[k]);
                args[k] = util.inspect(args[k], false, null, true);
            }
        } // */
        let str = args.join(delemiter);
        return str;
    }

    argumentsToString = this.argumentsToStringFull;
}

module.exports.Logger = Logger;
export {Logger};
