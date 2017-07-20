"use strict";

var uuid4 = require("uuid4");


class XMPPUTils {

    constructor() {
        this.messageId = 0;
    }

    generateRandomID() { 
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 8; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    getUniqueMessageId() {

        var randomBase = uuid4();

        var messageToSendID = "node_" + randomBase + this.messageId;
        this.messageId++;
        return messageToSendID;
    }

    generateRandomFullJidForNode(jid) { 
        var fullJid = jid + "/node_" + this.generateRandomID();
        return fullJid;
    }

    getBareJIDFromFullJID(fullJid) {
        var index = 0;
        
        if (fullJid.indexOf("tel_") === 0) {
            index = 4;
        }
        
        if (fullJid.includes("/")) {
            fullJid = fullJid.substring(index, fullJid.indexOf("/"));
        }

        return fullJid;
    }

    getRoomJIDFromFullJID(fullJid) {
        var index = 0;
        
        if (fullJid.indexOf("tel_") === 0) {
            index = 4;
        }
        
        if (fullJid.includes("/")) {
            fullJid = fullJid.substring(index, fullJid.lastIndexOf("/"));
        }

        return fullJid;
    }

    isFromMobile(fullJid) {
        return (fullJid.indexOf("mobile") > -1);
    }

    isFromNode(fullJid) {
        return (fullJid.indexOf("node") > -1);
    }

    isFromTelJid(fullJid) {
        return (fullJid.indexOf("tel_") === 0);
    }

    getResourceFromFullJID(fullJid) {
        if (fullJid.includes("/")) {
            return fullJid.substring(fullJid.indexOf("/") + 1);
        }
        return "";
    }
}

module.exports = new XMPPUTils();
