"use strict";
export {};

import {XMPPService} from "../XMPPService";
const xml2js = require('xml2js');

class GenericHandler {
	public xmppService: XMPPService;

    constructor(xmppService) {
        this.xmppService = xmppService;
    }

    async getJsonFromXML(xml : string) {
        try {
            const result = await xml2js.parseStringPromise(xml, {mergeAttrs: false, explicitArray : false, attrkey : "$attrs", emptyTag  : undefined});

            // convert it to a JSON string
            return result;
            //return JSON.stringify(result, null, 4);
        } catch (err) {
            //console.log(err);
            return {};
        }
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

module.exports.GenericHandler = GenericHandler;
export = {GenericHandler: GenericHandler};
