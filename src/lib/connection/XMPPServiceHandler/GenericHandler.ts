"use strict";
import {LevelLogs} from "../../common/LevelLogs.js";

export {};

import {XMPPService} from "../XMPPService";
import {stackTrace} from "../../common/Utils.js";
const xml2js = require('xml2js');

class GenericHandler extends LevelLogs{
	public xmppService: XMPPService;

    constructor(xmppService: XMPPService) {
        super()
        this.setLogLevels(this);
        let that = this;
        this.xmppService = xmppService;
    }

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
