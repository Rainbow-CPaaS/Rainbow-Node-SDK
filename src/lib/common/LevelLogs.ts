"use strict";
import {stackTrace} from "./Utils.js";

export {};


interface LevelLogs {
 "ERROR": any,
 "WARN": any,
 "INFO": any,
 "TRACE": any,
 "HTTP": any,
 "XMPP": any,
 "DEBUG": any,
 "INTERNAL": any,
 "INTERNALERROR": any,
 "ERRORAPI": any,
 "WARNAPI": any,
 "INFOAPI": any,
 "TRACEAPI": any,
 "HTTPAPI": any,
 "XMPPAPI": any,
 "DEBUGAPI": any,
 "INTERNALAPI": any,
 "INTERNALERRORAPI": any
}

class LevelLogs implements LevelLogs{
 public "ERROR": any;
 public "WARN": any;
 public "INFO": any;
 public "TRACE": any;
 public "HTTP": any;
 public "XMPP": any;
 public "DEBUG": any;
 public "INTERNAL": any;
 public "INTERNALERROR": any;
 public "ERRORAPI": any;
 public "WARNAPI": any;
 public "INFOAPI": any;
 public "TRACEAPI": any;
 public "HTTPAPI": any;
 public "XMPPAPI": any;
 public "DEBUGAPI": any;
 public "INTERNALAPI": any;
 public "INTERNALERRORAPI": any;

 constructor() {
 }

 //  "error", "warn", "info", "trace", "http", "xmpp", "debug", "internal", "internalerror"
 protected setLogLevels (obj : any) {
  if (obj && typeof (obj) === "object") {
   obj.ERROR = {"callerObj": obj, "level": "error", isApi: false};
   obj.WARN = {"callerObj": obj, "level": "warn", isApi: false};
   obj.INFO = {"callerObj": obj, "level": "info", isApi: false};
   obj.TRACE = {"callerObj": obj, "level": "trace", isApi: false};
   obj.HTTP = {"callerObj": obj, "level": "http", isApi: false};
   obj.XMPP = {"callerObj": obj, "level": "xmpp", isApi: false};
   obj.DEBUG = {"callerObj": obj, "level": "debug", isApi: false};
   obj.INTERNAL = {"callerObj": obj, "level": "internal", isApi: false};
   obj.INTERNALERROR = {"callerObj": obj, "level": "internalerror", isApi: false};

   obj.ERRORAPI = {"callerObj": obj, "level": "error", isApi: true};
   obj.WARNAPI = {"callerObj": obj, "level": "warn", isApi: true};
   obj.INFOAPI = {"callerObj": obj, "level": "info", isApi: true};
   obj.TRACEAPI = {"callerObj": obj, "level": "trace", isApi: true};
   obj.HTTPAPI = {"callerObj": obj, "level": "http", isApi: true};
   obj.XMPPAPI = {"callerObj": obj, "level": "xmpp", isApi: true};
   obj.DEBUGAPI = {"callerObj": obj, "level": "debug", isApi: true};
   obj.INTERNALAPI = {"callerObj": obj, "level": "internal", isApi: true};
   obj.INTERNALERRORAPI = {"callerObj": obj, "level": "internalerror", isApi: true}; // */
  } else {
   console.log("Can not set Logs Levels : ", stackTrace());
  }
 }

}
//module.exports = {'LevelInterface' : LevelInterface};
// export type {LevelInterface as LevelInterface};
export {LevelLogs as LevelLogs};
module.exports.LevelLogs = LevelLogs;

