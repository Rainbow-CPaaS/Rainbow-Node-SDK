"use strict";

import {runInNewContext} from "vm";
import {RESTTelephony} from "../connection/RestServices/RESTTelephony";

//const uuid4 = require("uuid4");
import { v4 as uuid4 } from 'uuid';

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
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 8; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    getUniqueMessageId() {

        let randomBase = uuid4();

        let messageToSendID = "node_" + randomBase + this.messageId;
        this.messageId++;
        return messageToSendID;
    }

    getUniqueId(suffix) {
        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0,
                v = c === 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });

        if (typeof suffix === "string" || typeof suffix === "number") {
            return uuid + ":" + suffix;
        } else {
            return uuid + "";
        }
    }

    generateRandomFullJidForNode(jid, generatedRandomId) {
        let fullJid = jid + "/node_" + generatedRandomId;
        return fullJid;
    }

    generateRandomFullJidForS2SNode(jid, generatedRandomId) {
        let fullJid = jid + "/s2s_sdk_node_" + generatedRandomId;
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

    getRoomJIDWithOutDomainFromFullJID(fullJid) {
        let index = 0;

        if (fullJid.indexOf("tel_") === 0) {
            index = 4;
        }

        if (fullJid.includes("@")) {
            fullJid = fullJid.substring(index, fullJid.lastIndexOf("@"));
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
        return (this.getResourceFromFullJID(fullJid).indexOf("mobile")  === 0);
    }

    isFromNode(fullJid) {
        return (this.getResourceFromFullJID(fullJid).indexOf("node") === 0);
    }

    isFromS2S(fullJid) {
        return (this.getResourceFromFullJID(fullJid).indexOf("s2s")  === 0);
    }

    isFromTelJid(fullJid) {
        return (fullJid.indexOf("tel_") === 0);
    }

    isFromCalendarJid(fullJid) {
        return ((fullJid.indexOf("tel_") === 0) && this.getResourceFromFullJID(fullJid) == "calendar");
    }

    // Presence resource is provided by MS-Teams.
    isFromPresenceJid(fullJid) { 
        return ((fullJid.indexOf("tel_") === 0) && this.getResourceFromFullJID(fullJid) == "presence");
    }

    getResourceFromFullJID(fullJid) {
        if (fullJid.includes("/")) {
            return fullJid.substring(fullJid.indexOf("/") + 1);
        }
        return "";
    }

    /** Function: getBareJidFromJid
     *  Get the bare JID from a JID String.
     *
     *  Parameters:
     *    (String) jid - A JID.
     *
     *  Returns:
     *    A String containing the bare JID.
     */
    getBareJidFromJid (jid)
    {
        return jid ? jid.split("/")[0] : null;
    }
}

export let xu = XMPPUTils.getXMPPUtils();
module.exports.XMPPUTils = XMPPUTils;
