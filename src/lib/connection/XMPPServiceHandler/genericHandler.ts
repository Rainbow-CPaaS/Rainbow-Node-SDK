"use strict";
export {};


class GenericHandler {
	public xmppService: any;

    constructor(xmppService) {
        this.xmppService = xmppService;
    }
    get fullJid() {
        return this.xmppService.fullJid;
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

module.exports = GenericHandler;