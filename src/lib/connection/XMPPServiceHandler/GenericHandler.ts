"use strict";
import {LevelInterface} from "../../common/LevelInterface.js";

export {};

import {XMPPService} from "../XMPPService";
import {stackTrace} from "../../common/Utils.js";
const xml2js = require('xml2js');

class GenericHandler implements LevelInterface{
	public xmppService: XMPPService;

    constructor(xmppService: XMPPService) {
        let that = this;
        let obj = that;
        if (obj) {
            obj.INFO = {"callerObj": obj, "level": "info", isApi: false};
            obj.DEBUG = {"callerObj": obj, "level": "debug", isApi: false};
            obj.INTERNAL = {"callerObj": obj, "level": "internal", isApi: false};
            obj.WARN = {"callerObj": obj, "level": "warn", isApi: false};
            obj.ERROR = {"callerObj": obj, "level": "error", isApi: false};
            obj.INTERNALERROR = {"callerObj": obj, "level": "internalerror", isApi: false};
            obj.INFOAPI = {"callerObj": obj, "level": "info", isApi: true};
            obj.DEBUGAPI = {"callerObj": obj, "level": "debug", isApi: true};
            obj.INTERNALAPI = {"callerObj": obj, "level": "internal", isApi: true};
            obj.WARNAPI = {"callerObj": obj, "level": "warn", isApi: true};
            obj.ERRORAPI = {"callerObj": obj, "level": "error", isApi: true};
            obj.INTERNALERRORAPI = {"callerObj": obj, "level": "internalerror", isApi: true}; // */
        } else {
            console.log("Can not set Logs Levels : ", stackTrace());
        }

        this.xmppService = xmppService;
    }

    INFO: any;
    DEBUG: any;
    INTERNAL: any;
    WARN: any;
    ERROR: any;
    INTERNALERROR: any;
    INFOAPI: any;
    DEBUGAPI: any;
    INTERNALAPI: any;
    WARNAPI: any;
    ERRORAPI: any;
    INTERNALERRORAPI: any;

    get jid_im() {
        return this.xmppService.jid_im;
    }
    get jid_tel() {
        return this.xmppService.jid_tel;
    }
    get jid_password() {
        return this.xmppService.jid_password;
    }
    get fullJid() {
        return this.xmppService.fullJid;
    }
    get jid() {
        return this.xmppService.jid;
    }
    get userId() {
        return this.xmppService.userId;
    }
    get applicationId() {
        return this.xmppService.applicationId;
    }
    get resourceId() {
        return this.xmppService.resourceId;
    }

    get xmppClient() {
        return this.xmppService.xmppClient;
    }
    get eventEmitter() {
        return this.xmppService.eventEmitter;
    }
    get _logger() {
        return this.xmppService._logger;
    }
}

module.exports = {'GenericHandler' : GenericHandler};
export {GenericHandler as GenericHandler};
