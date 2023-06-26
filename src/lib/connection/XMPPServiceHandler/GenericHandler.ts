"use strict";
export {};

import {XMPPService} from "../XMPPService.js";
//const xml2js = require('xml2js');
import {default as xml2js} from 'xml2js';

class GenericHandler {
	public xmppService: XMPPService;

    constructor(xmppService) {
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
    get logger() {
        return this.xmppService.logger;
    }
}

// module.exports = {'GenericHandler' : GenericHandler};
export {GenericHandler as GenericHandler};
