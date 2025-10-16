"use strict";

import {runInNewContext} from "vm";
import {RESTTelephony} from "../connection/RestServices/RESTTelephony";

//const uuid4 = require("uuid4");
import { v4 as uuid4 } from 'uuid';

const Element = require('ltx').Element;

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
        return ((fullJid.indexOf("tel_") === 0 || fullJid.indexOf("pcloud_msteamspresence_") === 0) && this.getResourceFromFullJID(fullJid) == "presence");
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

    offendXml(element: any) { // const Element = require('ltx').Element;
        if (!element || !element.children) return element;
        // Vérifie si l'élément a des enfants
        if (element.children.length > 0) {
            // Parcourt tous les enfants de l'élément
            //for (let child of element.children) {
            for (let i = 0; i < element.children.length ; i++) {
                //if (element.children[i] instanceof Constant) {
                if ( typeof (element.children[i]) === "string" || typeof (element.children[i]) === "number" || typeof (element.children[i]) === "boolean" ) {
                    //child.text="replaced";
                    if (element.children[i] ) {
                        let sizeOfChild = element.children[i].length;
                        if (sizeOfChild > 0 && sizeOfChild <= 2) {
                            /* let firstChar = element.children[i].charAt(0);
                            let lastChar = element.children[i].charAt(sizeOfChild - 1);
                            //console.log("Premier caractère : " + firstChar);
                            //console.log("Dernier caractère : " + lastChar);
                            element.children[i] = firstChar + "AAA" + lastChar;
                            // */
                            element.children[i] = "...";
                        }
                        if (sizeOfChild > 2 && sizeOfChild <= 6) {
                            let firstChar = element.children[i].charAt(0);
                            let lastChar = element.children[i].charAt(sizeOfChild - 1);
                            //console.log("Premier caractère : " + firstChar);
                            //console.log("Dernier caractère : " + lastChar);
                            element.children[i] = firstChar + "..." + lastChar;
                        }
                        if (sizeOfChild > 6 && sizeOfChild <= 8) {
                            let firstChars = element.children[i].substring(0, 2);
                            let lastChars = element.children[i].substring(sizeOfChild - 2, sizeOfChild)
                            //console.log("Premier caractère : " + firstChar);
                            //console.log("Dernier caractère : " + lastChar);
                            element.children[i] = firstChars + "..." + lastChars;
                        }
                        if (sizeOfChild > 8 ) {
                            let firstChars = element.children[i].substring(0, 3);
                            let lastChars = element.children[i].substring(sizeOfChild - 3, sizeOfChild)
                            //console.log("Premier caractère : " + firstChar);
                            //console.log("Dernier caractère : " + lastChar);
                            element.children[i] = firstChars + "..." + lastChars;
                        }
                    }
                } else {
                    // Vérifie si l'enfant est un élément
                    if (element.children[i] instanceof Element) {
                        // Appelle récursivement la fonction pour parcourir les enfants de l'enfant
                        this.offendXml(element.children[i]);
                    } else {
                        console.log("typeof  typeof (element.children[" + i + "]) : ", typeof (element.children[i]));
                    }
                }
            }
        }
        // console.log("element offanded : ", element.toString());
        return element;
    }

    // Estimate Byte size in UTF-8, compatible navigateur/Node
    byteLen(s: string) {
        try {
            // Navigateur / environnement avec TextEncoder
            // @ts-ignore
            if (typeof TextEncoder !== "undefined") {
                // @ts-ignore
                return new TextEncoder().encode(s).length;
            }
        } catch {}
        try {
            // Node.js
            // @ts-ignore
            if (typeof Buffer !== "undefined" && Buffer.byteLength) {
                // @ts-ignore
                return Buffer.byteLength(s, 'utf8');
            }
        } catch {}
        // */
        // Fallback très sûr (compte UTF-8) si ni TextEncoder ni Buffer ne sont dispo
        let bytes = 0;
        for (let i = 0; i < s.length; i++) {
            const codePoint = s.codePointAt(i)!;
            if (codePoint <= 0x7F) bytes += 1;
            else if (codePoint <= 0x7FF) bytes += 2;
            else if (codePoint <= 0xFFFF) bytes += 3;
            else {
                bytes += 4; i++; // surrogate pair consommé
            }
        }
        return bytes;
    }

    // Estime la taille de la strophe XMPP. Si on reçoit une strophe XML complète (string commençant par '<'),
    // on mesure directement sa taille sans ajouter d'overhead arbitraire. Si on reçoit un payload (objet ou string JSON),
    // on applique un overhead configurable pour l'enveloppe.
    willExceedStanzaLimit(contentJson: object|string, headOverhead = 1500, limit = 64 * 1024) {
        let inputStr = "";
        let mode: 'stanza' | 'payload' = 'payload';

        if (typeof contentJson === "string") {
            inputStr = contentJson;
            // Heuristique: s'il s'agit visiblement d'une strophe XML complète, on ne rajoute pas d'overhead
            const trimmed = inputStr.trimStart();
            const looksLikeXmlStanza = trimmed.startsWith('<message') || trimmed.startsWith('<iq') || trimmed.startsWith('<presence');
            if (looksLikeXmlStanza) {
                const estimated = this.byteLen(inputStr);
                return { exceeds: estimated > limit, estimated, limit };
            }
            // sinon, c'est probablement du JSON minifié déjà prêt
            mode = 'payload';
        } else {
            // objet JSON → string minifiée
            inputStr = JSON.stringify(contentJson);
            mode = 'payload';
        }

        const estimated = headOverhead + this.byteLen(inputStr);
        return { exceeds: estimated > limit, estimated, limit };
    }

    private static readonly CDATA_END_SEQUENCE = "]]>";
    private static readonly CDATA_ESCAPE_REPLACEMENT = "]]]]]><![CDATA[>";

    /**
     * Estimates the size (UTF-8 bytes) of an XMPP stanza (ltx.Element).
     * Uses ltx's XML escaping for attributes/text and applies escapeXMLText
     * explicitly to body and content nodes as requested.
     */
    estimateStanzaByteSize(el: any): number {
        // Import tardif pour ne pas casser les environnements qui chargent ce fichier sans bundler
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { escapeXML, escapeXMLText } = require("ltx/lib/escape.js");

        const out: string[] = [];
        const write = (s: string) => out.push(s);
        const byteLen = (s: string) => this.byteLen(s);

        const renderAttrs = (attrs: any) => {
            if (!attrs) return "";
            let str = "";
            for (const k in attrs) {
                const v = attrs[k];
                if (v != null) {
                    str += " " + k + '="' + escapeXML(typeof v === "string" ? v : v.toString(10)) + '"';
                }
            }
            return str;
        };

        const extractCDataInner = (raw: string): string | null => {
            const m = raw && typeof raw === 'string' ? raw.match(/^<!\[CDATA\[(.*)\]\]>$/s) : null;
            return m ? m[1] : null;
        };

        const serialize = (node: any, parentName?: string) => {
            // Element (ltx)
            if (node && typeof node === "object" && node.name && node.attrs !== undefined && node.children !== undefined) {
                const name: string = node.name;
                write("<" + name);
                write(renderAttrs(node.attrs));

                const children = node.children || [];
                if (children.length === 0) {
                    write("/>");
                    return;
                }
                write(">");

                for (const child of children) {
                    // Enfant Element
                    if (child && typeof child === "object" && child.name && child.attrs !== undefined && child.children !== undefined) {
                        // Traitement spécial pour body/content
                        if (typeof child.getName === 'function' && (child.getName() === 'body' || child.getName() === 'content')) {
                            write("<" + child.name);
                            write(renderAttrs(child.attrs));
                            write(">");

                            // Texte direct
                            let text = child.getText ? (child.getText() ?? "") : "";

                            // Si CDATA injectée via write(), en extraire l'intérieur
                            if ((!text || text.length === 0) && Array.isArray(child.children)) {
                                for (const sub of child.children) {
                                    if (sub && typeof sub.write === 'function') {
                                        const tmp: string[] = [];
                                        sub.write((c: string) => tmp.push(c));
                                        const raw = tmp.join("");
                                        const inner = extractCDataInner(raw);
                                        if (inner != null) {
                                            text = inner;
                                            break;
                                        }
                                    } else if (typeof sub === 'string') {
                                        text += sub;
                                    }
                                }
                            }
                            write(escapeXML(text));
                            write("</" + child.name + ">");
                        } else {
                            // Récursif standard
                            serialize(child, name);
                        }
                        continue;
                    }

                    // Enfant texte
                    if (typeof child === "string") {
                        write(escapeXMLText(child));
                        continue;
                    }

                    // Enfant avec write() (ex: CDATA)
                    if (child && typeof child.write === 'function') {
                        const tmp: string[] = [];
                        child.write((c: string) => tmp.push(c));
                        const raw = tmp.join("");
                        if (parentName === 'body' || parentName === 'content') {
                            const inner = extractCDataInner(raw);
                            write(escapeXMLText(inner != null ? inner : raw));
                        } else {
                            write(raw);
                        }
                        continue;
                    }

                    // Fallback
                    if (child && typeof child.toString === 'function') {
                        write(escapeXMLText(child.toString(10)));
                        continue;
                    }
                }

                write("</" + name + ">");
                return;
            }

            if (typeof node === 'string') {
                write(escapeXMLText(node));
                return;
            }

            if (node && typeof node.write === 'function') {
                const tmp: string[] = [];
                node.write((c: string) => tmp.push(c));
                write(tmp.join(""));
                return;
            }

            if (node != null) {
                write(escapeXMLText(String(node)));
            }
        };

        serialize(el);
        return byteLen(out.join(""));
    }

    makeCData(content: string) {
        // Un CDATA ne peut pas contenir "]]>", on segmente si besoin
        const safe = content.indexOf(XMPPUTils.CDATA_END_SEQUENCE) === -1
            ? content
            : content.split(XMPPUTils.CDATA_END_SEQUENCE)
                .join(XMPPUTils.CDATA_ESCAPE_REPLACEMENT);
        return {
            write: (writer: (chunk: string) => void) => {
                writer(`<![CDATA[${safe}]]>`);
            },
            toString: () => {
                return `<![CDATA[${safe}]]>`;
            }
        };
    }
}

export let xu = XMPPUTils.getXMPPUtils();
module.exports.XMPPUTils = XMPPUTils;
