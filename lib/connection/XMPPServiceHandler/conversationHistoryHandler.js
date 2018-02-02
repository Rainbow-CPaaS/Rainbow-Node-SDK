"use strict";

const XMPPUtils = require("../../common/XMPPUtils");
const GenericHandler = require("./genericHandler");
const xml = require("@xmpp/xml");

const LOG_ID = "XMPP/HNDL - ";

class ConversationHistoryHandler  extends GenericHandler {

    constructor(xmppService) {
        super( xmppService);

        let that = this;

        this.onHistoryMessageReceived = (msg, stanza) => {};

        this.onWebrtcHistoryMessageReceived = (msg, stanza) => {};
    }
}

module.exports = ConversationHistoryHandler;
