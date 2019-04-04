"use strict";

import {runInNewContext} from "vm";
import {RESTTelephony} from "../connection/RestServices/RESTTelephony";

const uuid4 = require("uuid4");

export class XMPPUTils {
	public messageId: any;
	public static xmppUtils: XMPPUTils;

    constructor() {
        this.messageId = 0;
    }

    static getXMPPUtils() {
        XMPPUTils.xmppUtils = XMPPUTils.xmppUtils ? XMPPUTils.xmppUtils : new XMPPUTils();

        return XMPPUTils.xmppUtils;
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

    generateRandomFullJidForNode(jid, generatedRandomId) {
        let fullJid = jid + "/node_" + generatedRandomId;
        return fullJid;
    }

    getBareJIDFromFullJID(fullJid) {
        let index = 0;
        
        if (fullJid.indexOf("tel_") === 0) {
            index = 4;
        }
        
        if (fullJid.includes("/")) {
            fullJid = fullJid.substring(index, fullJid.indexOf("/"));
        }

        return fullJid;
    }

    getRoomJIDFromFullJID(fullJid) {
        let index = 0;
        
        if (fullJid.indexOf("tel_") === 0) {
            index = 4;
        }
        
        if (fullJid.includes("/")) {
            fullJid = fullJid.substring(index, fullJid.lastIndexOf("/"));
        }

        return fullJid;
    }

    getDomainFromFullJID(fullJid) {
        let domain = "";

        let bareJID = this.getBareJIDFromFullJID(fullJid);

        if (bareJID.includes("@")) {
            domain = bareJID.substring(bareJID.lastIndexOf("@") + 1);
        }

        return domain;
    }

    findChild(element, nodeNameToFind) {
        let result = null;


        if (typeof element === "object") {
            let child = element.getChild(nodeNameToFind);
            if (child) {
                result = child;
            } else {
                let children = element.children;
                children.forEach((elemt) => {
                    let child = this.findChild(elemt,nodeNameToFind);
                    if ( child) {
                        result = child;
                        return child;
                    }
                });
            }
        }
        return result;
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

export let xu = new XMPPUTils();
module.exports.XMPPUTils = XMPPUTils;