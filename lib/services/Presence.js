"use strict";

const LOG_ID = '[Presence] ';

class Presence {

    constructor() {
        this.xmpp = null;
    }

    start(_xmpp) {
        this.xmpp = _xmpp;
    }

    /**
     * @public
     * @method sendInitialPresence
     * @description
     *  Send the initial presence (online)
     */
    sendInitialPresence() {
        this.xmpp.sendInitialPresence();
    }

    stop() {

    }
}

module.exports = Presence;