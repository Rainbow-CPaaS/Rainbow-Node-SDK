"use strict";

var {Client} = require("@xmpp/client");
const xml = require("@xmpp/xml");
let backoff = require("backoff");

var HttpsProxyAgent = require("https-proxy-agent");

var XMPPUtils = require("../common/XMPPUtils");

const LOG_ID = "XMPP - ";

const ONLINE_EVENT = "online";
const OFFLINE_EVENT = "offline";
const CONNECT_EVENT = "connect";
const RECONNECT_EVENT = "reconnect";
const RECONNECTED_EVENT = "reconnected";
const RECONNECTING_EVENT = "reconnecting";
const DISCONNECT_EVENT = "disconnect";
const CLOSE_EVENT = "close";
const END_EVENT = "end";
const ERROR_EVENT = "error";
const STANZA_EVENT = "stanza";
const STATUS_EVENT = "status";
const BIND_EVENT = "bind";
const AUTHENTICATE_EVENT = "authenticate";

const RECONNECT_INITIAL_DELAY = 5000;
const RECONNECT_MAX_DELAY = 60000;

var handleXMPPConnection;

class XMPPService {

    constructor(_xmpp, _im, _eventEmitter, _logger, _proxy) {
        this.serverURL = _xmpp.protocol + "://" + _xmpp.host + ":" + _xmpp.port + "/websocket";
        this.host = _xmpp.host;
        this.eventEmitter = _eventEmitter;
        this.version = "0.1";
        this.jid_im = "";
        this.jid_tel = "";
        this.jid_password = "";
        this.fullJid = "";
        this.xmppClient = null;
        this.logger = _logger;
        this.proxy = _proxy;
        this.shouldSendReadReceipt = _im.sendReadReceipt;
        this.useXMPP = true;
        this.isReconnecting = false;

        handleXMPPConnection = () => {

            var that = this;

            var options = {};
            if (this.proxy.isProxyConfigured) {
                options.agent = new HttpsProxyAgent(this.proxy.proxyURL);
            }

            this.xmppClient = new Client({
                "jid": this.fullJid,
                "password": this.jid_password,
                "host": this.host,
                "websocket": {
                    "url": this.serverURL,
                    "options": options
                }
            });

            this.reconnect = this.xmppClient.plugin(require("@xmpp/plugins/reconnect"));

            this.reconnect.delay = RECONNECT_INITIAL_DELAY;

            this.fibonacciStrategy = new backoff.FibonacciStrategy({randomisationFactor: 0.4, initialDelay: RECONNECT_INITIAL_DELAY, maxDelay: RECONNECT_MAX_DELAY});

            this.xmppClient.plugin(require("./sasl-digest-md5"));

            this.xmppClient.handle(AUTHENTICATE_EVENT, authenticate => {
                return authenticate(this.fullJid, this.jid_password);
            });

            this.xmppClient.handle(BIND_EVENT, (bind) => {
                return bind(this.fullJid);
            });

            this.xmppClient.on(ONLINE_EVENT, function (msg) {
                
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - " + ONLINE_EVENT + " |", msg);
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) connected as " + msg);
                
                if (!that.isReconnecting) {
                    that.eventEmitter.emit("xmppconnected");
                }
            });

            this.xmppClient.on(STATUS_EVENT, msg => {
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - " + STATUS_EVENT + " |", msg);
            });

            this.xmppClient.on(STANZA_EVENT, function (stanza) {
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - " + STANZA_EVENT + " |", stanza.toString());

                switch (stanza.getName()) {
                    case "iq":
                        var children = stanza.children;
                        children.forEach(function (node) {
                            switch (node.getName()) {
                                case "ping":
                                    let stanzaResponse = xml("iq", {
                                        "to": stanza.attrs.from,
                                        "id": stanza.attrs.id,
                                        "xmlns": stanza.getNS(),
                                        "type": "result"
                                    });
                                    that.logger.log("info", LOG_ID + "(handleXMPPConnection) answered - 'stanza'", stanzaResponse.toString());
                                    that.xmppClient.send(stanzaResponse);
                                    break;
                                case "query":
                                    if (stanza.attrs.type === "result") {
                                        if (node.attrs.xmlns === "jabber:iq:roster") {
                                            var contacts = [];
                                            var subchildren = node.children;
                                            subchildren.forEach(function (item) {
                                                if (item.attrs.jid.substr(0, 3) !== "tel") {
                                                    contacts.push({
                                                        jid: item.attrs.jid,
                                                        subscription: item.attrs.subscription,
                                                        ask: item.attrs.ask || ""
                                                    });
                                                }
                                            });
                                            that.logger.log("info", LOG_ID + "(handleXMPPConnection) XMPP Rosters received", contacts.length);
                                            that.eventEmitter.emit("rainbow_onrosters", contacts);
                                        }
                                    }
                                    break;
                                case "default":
                                    that.logger.log("warn", LOG_ID + "(handleXMPPConnection) not managed - 'stanza'", node.getName());
                                    break;
                                default:
                                    that.logger.log("warn", LOG_ID + "(handleXMPPConnection) child not managed for iq - 'stanza'", node.getName());
                                    break;
                            }
                        });
                        if (stanza.attrs.type && stanza.attrs.type === "result") {
                            if (stanza.attrs.id === "enable_xmpp_carbon") {
                                that.eventEmitter.emit("rainbow_oncarbonactivated");
                            }
                        }
                        break;
                    case "message":
                        var content = "";
                        var subject = "";
                        var event = "";
                        var eventJid = "";
                        var hasATextMessage = false;
                        if (stanza.attrs.type === "chat" || stanza.attrs.type === "groupchat") {

                            var fromJid = XMPPUtils.getBareJIDFromFullJID(stanza.attrs.from);
                            var resource = XMPPUtils.getResourceFromFullJID(stanza.attrs.from);
                            var children = stanza.children;
                            children.forEach(function (node) {
                                switch (node.getName()) {
                                    case "active":
                                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - someone is active");
                                        break;
                                    case "inactive":
                                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - someone is inactive");
                                        break;
                                    case "composing":
                                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - someone is writing");
                                        break;
                                    case "received":
                                        var receipt = {
                                            event: node.attrs.event,
                                            entity: node.attrs.entity,
                                            type: stanza.attrs.type,
                                            id: node.attrs.id,
                                            fromJid: fromJid,
                                            resource: resource
                                        };
                                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - receipt received");
                                        that.eventEmitter.emit("rainbow_onreceipt", receipt);
                                        break;
                                    case "archived":
                                        break;
                                    case "stanza-id":
                                        break;
                                    case "subject":
                                        subject = node.getText();
                                        break;
                                    case "event":
                                        event = node.attrs.name;
                                        eventJid = node.attrs.jid;
                                        break;
                                    case "body":
                                        content = node.getText();
                                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - content", "***");
                                        hasATextMessage = true;
                                        break;
                                    case "request":
                                        // Acknowledge 'received'
                                        let stanzaReceived = xml("message", {
                                            "to": stanza.attrs.from,
                                            "from": stanza.attrs.to,
                                            "type": stanza.attrs.type
                                        }, {
                                            "received": {
                                                "xmlns": "urn:xmpp:receipts",
                                                "event": "received",
                                                "entity": "client",
                                                "id": stanza.attrs.id
                                            }
                                        });
                                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) answered - send receipt 'received'", stanzaReceived.root().toString());
                                        that.xmppClient.send(stanzaReceived);
                                        //Acknowledge 'read'
                                        if (that.shouldSendReadReceipt || (stanza.attrs.type === "groupchat" && XMPPUtils.getResourceFromFullJID(stanza.attrs.from) === that.fullJid)) {
                                            let stanzaRead = xml("message", {
                                                "to": stanza.attrs.from,
                                                "from": stanza.attrs.to,
                                                "type": stanza.attrs.type
                                            }, {
                                                "received": {
                                                    "xmlns": "urn:xmpp:receipts",
                                                    "event": "read",
                                                    "entity": "client",
                                                    "id": stanza.attrs.id
                                                }
                                            });
                                            that.logger.log("info", LOG_ID + "(handleXMPPConnection) answered - send receipt 'read'", stanzaRead.root().toString());
                                            that.xmppClient.send(stanzaRead);
                                        }
                                        break;
                                    case "x":
                                        let xmlns = node.attrs.xmlns;
                                        if (xmlns === "jabber:x:conference") {

                                            let invitation = {
                                                event: "invitation",
                                                bubbleId: node.attrs.thread,
                                                bubbleJid: node.attrs.jid,
                                                fromJid: fromJid,
                                                resource: resource
                                            };
                                            that.logger.log("info", LOG_ID + "(handleXMPPConnection) invitation received");
                                            that.eventEmitter.emit("rainbow_invitationreceived", invitation);
                                            break;
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            });

                            var fromBubbleJid = "";
                            var fromBubbleUserJid = "";
                            if (stanza.attrs.type === "groupchat") {
                                fromBubbleJid = XMPPUtils.getBareJIDFromFullJID(stanza.attrs.from);
                                fromBubbleUserJid = XMPPUtils.getResourceFromFullJID(stanza.attrs.from);
                                resource = XMPPUtils.getResourceFromFullJID(fromBubbleUserJid);
                            }

                            if (hasATextMessage && ((stanza.attrs.type === "groupchat" && fromBubbleUserJid !== that.fullJid) || (stanza.attrs.type === "chat" && fromJid !== that.fullJid))) {
                                that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - chat message received");

                                var data = {
                                    "fromJid": fromJid,
                                    "resource": resource,
                                    "toJid": stanza.attrs.to,
                                    "type": stanza.attrs.type,
                                    "content": content,
                                    "id": stanza.attrs.id,
                                    "lang": stanza.attrs["xml:lang"],
                                    "isEvent": false
                                };

                                if (stanza.attrs.type === "groupchat") {
                                    data.fromBubbleJid = fromBubbleJid;
                                    data.fromBubbleUserJid = fromBubbleUserJid;

                                    if (subject.length > 0) {
                                        data.subject = subject;
                                        data.event = event;
                                        data.eventJid = eventJid;
                                        data.isEvent = true;
                                    }
                                }

                                that
                                    .eventEmitter
                                    .emit("rainbow_onmessagereceived", data);
                            }
                        } else if (stanza.attrs.type === "management") {
                            var children = stanza.children;
                            children.forEach(function (node) {
                                switch (node.getName()) {
                                    case "room":
                                        if (node.attrs.userjid === XMPPUtils.getBareJIDFromFullJID(that.fullJid)) {
                                            that
                                                .logger
                                                .log("debug", LOG_ID + "(handleXMPPConnection) bubble management received for own. Do not publish event.");
                                            that
                                                .eventEmitter
                                                .emit("rainbow_ownaffiliationchanged", {
                                                    "bubbleId": node.attrs.roomid,
                                                    "bubbleJid": node.attrs.roomjid,
                                                    "userJid": node.attrs.userjid,
                                                    "status": node.attrs.status
                                                });
                                        } else {
                                            that
                                                .logger
                                                .log("debug", LOG_ID + "(handleXMPPConnection) bubble affiliation received");
                                            that
                                                .eventEmitter
                                                .emit("rainbow_affiliationchanged", {
                                                    "bubbleId": node.attrs.roomid,
                                                    "bubbleJid": node.attrs.roomjid,
                                                    "userJid": node.attrs.userjid,
                                                    "status": node.attrs.status
                                                });
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            });
                        } else {
                            var children = stanza.children;
                            children.forEach(function (node) {
                                switch (node.getName()) {
                                    case "received":
                                        var receipt = {
                                            event: node.attrs.event,
                                            entity: node.attrs.entity,
                                            type: null,
                                            id: node.attrs.id
                                        };
                                        that
                                            .logger
                                            .log("info", LOG_ID + "(handleXMPPConnection) server receipt received");
                                        that
                                            .eventEmitter
                                            .emit("rainbow_onreceipt", receipt);
                                        break;
                                    default:
                                        break;
                                }
                            });
                        }
                        break;
                    case "presence":
                        var from = stanza.attrs.from;
                        if (from === that.fullJid || XMPPUtils.getBareJIDFromFullJID(from) === XMPPUtils.getBareJIDFromFullJID(that.fullJid)) {
                            // My presence changes (coming from me or another resource)
                            that
                                .eventEmitter
                                .emit("rainbow_onpresencechanged", {
                                    fulljid: from,
                                    jid: XMPPUtils.getBareJIDFromFullJID(from),
                                    resource: XMPPUtils.getResourceFromFullJID(from),
                                    show: stanza.attrs.show || "online",
                                    status: stanza.attrs.status || "",
                                    type: XMPPUtils.isFromTelJid(from)
                                        ? "phone"
                                        : XMPPUtils.isFromMobile(from)
                                            ? "mobile"
                                            : XMPPUtils.isFromNode(from)
                                                ? "node"
                                                : "desktopOrWeb"
                                });
                        } else if (from.includes("room_")) {

                            var children = stanza.children;
                            children.forEach(function (node) {
                                switch (node.getName()) {
                                    case "x":
                                        var items = node.children;
                                        items.forEach(function (item) {
                                            switch (item.getName()) {
                                                case "item":
                                                    break;
                                                case "status":
                                                    break;
                                                default:
                                                    break;
                                            }
                                        });
                                        break;
                                    default:
                                        break;
                                }
                            });

                            // A presence in a room changes
                            var fullJid = XMPPUtils.getResourceFromFullJID(from);
                            if (XMPPUtils.getBareJIDFromFullJID(fullJid) === XMPPUtils.getBareJIDFromFullJID(that.fullJid)) {
                                // My presence (node or other resources) in the room changes
                                that
                                    .eventEmitter
                                    .emit("rainbow_onbubblepresencechanged", {
                                        fulljid: from,
                                        jid: XMPPUtils.getBareJIDFromFullJID(from),
                                        resource: XMPPUtils.getResourceFromFullJID(from)
                                    });
                            } else {
                                // Presence of a participants of the room changes
                                that
                                    .eventEmitter
                                    .emit("rainbow_onbubblerosterpresencechanged", {
                                        fulljid: from,
                                        jid: XMPPUtils.getBareJIDFromFullJID(from),
                                        resource: XMPPUtils.getResourceFromFullJID(from)
                                    });
                            }

                        } else {
                            // Presence of a contact changes
                            var priority = 5;
                            var show = "";
                            var delay = "";
                            var status = "";
                            if (stanza.attrs.type === "unavailable") {
                                show = "unavailable";
                            } else {
                                var children = stanza.children;
                                children.forEach(function (node) {
                                    if (node && typeof node !== "string") {
                                        switch (node.getName()) {
                                            case "priority":
                                                priority = node.getText() || 5;
                                                break;
                                            case "show":
                                                show = node.getText() || "online";
                                                break;
                                            case "delay":
                                                delay = node.attrs.stamp || "";
                                                break;
                                            case "status":
                                                status = node.getText() || "";
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                });
                            }

                            that.eventEmitter.emit("rainbow_onrosterpresence", {
                                fulljid: from,
                                jid: XMPPUtils.getBareJIDFromFullJID(from),
                                resource: XMPPUtils.getResourceFromFullJID(from),
                                value: {
                                    priority: priority,
                                    show: show || "",
                                    delay: delay,
                                    status: status || "",
                                    type: XMPPUtils.isFromTelJid(from) ? "phone" : XMPPUtils.isFromMobile(from) ? "mobile" : XMPPUtils.isFromNode(from) ? "node" : "desktopOrWeb"
                                }
                            });
                        }
                        break;
                    case "close":
                        break;
                    default:
                        that.logger.log("warn", LOG_ID + "(handleXMPPConnection) not managed - 'stanza'", stanza.getName());
                        break;
                }
            });

            this.xmppClient.on(ERROR_EVENT, function (err) {
                if (err.code === "HPE_INVALID_CONSTANT") {
                    return;
                }
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + ERROR_EVENT + " |", err.condition || err);
                that.eventEmitter.emit("rainbow_onxmpperror", err);
            });

            this.xmppClient.on(OFFLINE_EVENT, (msg) => {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + OFFLINE_EVENT + " |" + msg);
            });

            this.xmppClient.on(CONNECT_EVENT, function () {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + CONNECT_EVENT);
            });

            this.xmppClient.on(RECONNECT_EVENT, function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + RECONNECT_EVENT + " |" + msg);
            });

            this.xmppClient.on(DISCONNECT_EVENT, function () {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + DISCONNECT_EVENT + " |");
                that.eventEmitter.emit("rainbow_xmppdisconnect");
            });

            this.xmppClient.on(CLOSE_EVENT, function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + CLOSE_EVENT + " |" + msg);
            });

            this.xmppClient.on(END_EVENT, function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + END_EVENT + " |" + msg);
            });

            this.reconnect.on(RECONNECTING_EVENT, () => {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) plugin event - " + RECONNECTING_EVENT);

                that.reconnect.delay = that.fibonacciStrategy.next();
                that.logger.log("debug", `${LOG_ID} (handleXMPPConnection) update reconnect delay - ${that.reconnect.delay} ms`);

                that.eventEmitter.emit("rainbow_xmppreconnectingattempt");
                this.isReconnecting = true;
            });

            this.reconnect.on(RECONNECTED_EVENT, () => {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) plugin event - " + RECONNECTED_EVENT);
                that.fibonacciStrategy.reset();
                that.reconnect.delay = that.fibonacciStrategy.getInitialDelay();
                that.isReconnecting = false;
                that.eventEmitter.emit("rainbow_xmppreconnected");
            });

            this.xmppClient.start({
                uri: this.serverURL,
                domain: that
                    .jid_im
                    .split("@")[1]
            }).then((jid) => {
                that.logger.log("info", "started", jid.toString());
            }).catch(err => {
                // rejects for any error before online
                if (err.code === "HPE_INVALID_CONSTANT") {
                    that.logger.log("error", "start reconnect ", err.code);
                    that.reconnect.reconnect();
                    return;
                }

                that.logger.log("error", "start failed", err);
            });
        };
    }

    start(withXMPP) {
        var that = this;
        this
            .logger
            .log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                if (withXMPP) {
                    that.logger.log("debug", LOG_ID + "(start) host used", that.host);
                    that.logger.log("info", LOG_ID + "(start) XMPP URL", that.serverUR);
                } else {
                    that.logger.log("info", LOG_ID + "(start) XMPP connection blocked by configuration");
                }
                that.isReconnecting = false;
                that.useXMPP = withXMPP;
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();
            } catch (err) {
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                reject(err);
            }
        });
    }

    signin(account) {
        var that = this;

        return new Promise(function(resolve) {

            that.eventEmitter.once("xmppconnected", () => {
                resolve();
            });

            if (that.useXMPP) {
                that.logger.log("debug", LOG_ID + "(signin) _entering_");
                that.jid_im = account.jid_im;
                that.jid_tel = account.jid_tel;
                that.jid_password = account.jid_password;
                that.fullJid = XMPPUtils.generateRandomFullJidForNode(that.jid_im);

                that.logger.log("info", LOG_ID + "(signin) account used", that.jid_im);

                handleXMPPConnection();
                that.logger.log("debug", LOG_ID + "(signin) _exiting_");
            } else {
                resolve();
            }
        });
    }

    stop() {
        var that = this;
        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve) {

            try {

                that.jid_im = "";
                that.jid_tel = "";
                that.jid_password = "";
                that.fullJid = "";

                if (!that.xmppClient) {
                    resolve();
                }

                that.xmppClient.stop().then(() => {
                    that.xmppClient = null;
                    that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                    resolve();
                });
            }
            catch (err) {
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject(err);
            }
        });
    }

    setPresence(show, status) {
        this
            .logger
            .log("debug", LOG_ID + "(setPresence) _entering_");
        if (this.useXMPP) {
            let stanza = xml("presence", xml("priority", "5"));

            if (show && show !== "online") {
                stanza.append("show", show);
            }

            if (status && (!show || show === "online")) {
                stanza.append("status", status);
            } else if (status) {
                stanza.append("status", status);
            }
            this
                .logger
                .log("info", LOG_ID + "(setPresence) send - 'stanza'", stanza.toString());
            this
                .xmppClient
                .send(stanza);
        } else {
            this
                .logger
                .log("warn", LOG_ID + "(setPresence) No XMPP connection...");
        }
        this
            .logger
            .log("debug", LOG_ID + "(setPresence) _exiting_");
    }

    //Message Carbon XEP-0280
    enableCarbon() {
        this
            .logger
            .log("debug", LOG_ID + "(enableCarbon) _entering_");
        if (this.useXMPP) {
            let stanza = xml("iq", {
                "type": "set",
                id: "enable_xmpp_carbon"
            }, xml("enable", {xmlns: "urn:xmpp:carbons:2"}));
            this
                .logger
                .log("info", LOG_ID + "(enableCarbon) send - 'stanza'", stanza.toString());
            this
                .xmppClient
                .send(stanza);
        } else {
            this
                .logger
                .log("warn", LOG_ID + "(enableCarbon) No XMPP connection...");
        }
        this
            .logger
            .log("debug", LOG_ID + "(enableCarbon) _exiting_");
    }

    sendChatMessage(message, jid, lang) {
        this
            .logger
            .log("debug", LOG_ID + "(sendChatMessage) _entering_");
        if (this.useXMPP) {
            var id = XMPPUtils.getUniqueMessageId();

            // Remove resource if exists
            jid = XMPPUtils.getBareJIDFromFullJID(jid);

            let stanza = xml("message", {
                "from": this.jid_im,
                "to": jid,
                "xmlns": "jabber:client",
                "type": "chat",
                "id": id
            }, xml("body", {
                "xml:lang": lang
            }, message), xml("request", {"xmlns": "urn:xmpp:receipts"}));

            this
                .logger
                .log("info", LOG_ID + "(sendChatMessage) send - 'message'", stanza.toString());
            this
                .xmppClient
                .send(stanza);
            this
                .logger
                .log("debug", LOG_ID + "(sendChatMessage) _exiting_");
            return {to: jid, type: "chat", id: id, content: message};
        }

        this
            .logger
            .log("warn", LOG_ID + "(sendChatMessage) No XMPP connection...");
        this
            .logger
            .log("debug", LOG_ID + "(sendChatMessage) _exiting_");
        return null;
    }

    sendChatMessageToBubble(message, jid, lang) {
        this
            .logger
            .log("debug", LOG_ID + "(sendChatMessageToBubble) _entering_");
        if (this.useXMPP) {
            var id = XMPPUtils.getUniqueMessageId();

            let stanza = xml("message", {
                "to": jid,
                "type": "groupchat",
                "id": id
            }, xml("body", {
                "xml:lang": lang
            }, message), xml("request", {"xmlns": "urn:xmpp:receipts"}));

            this
                .logger
                .log("info", LOG_ID + "(sendChatMessageToBubble) send - 'message'", stanza.toString());
            this
                .xmppClient
                .send(stanza);
            this
                .logger
                .log("debug", LOG_ID + "(sendChatMessageToBubble) _exiting_");
            return {to: jid, type: "groupchat", id: id, content: message};
        }

        this
            .logger
            .log("warn", LOG_ID + "(sendChatMessageToBubble) No XMPP connection...");
        this
            .logger
            .log("debug", LOG_ID + "(sendChatMessageToBubble) _exiting_");
        return null;

    }

    markMessageAsRead(message) {
        this
            .logger
            .log("debug", LOG_ID + "(markMessageAsRead) _entering_");
        if (this.useXMPP) {
            let stanzaRead = xml("message", {
                "to": message.fromJid,
                "from": message.toJid,
                "type": "chat"
            }, xml("received", {
                "xmlns": "urn:xmpp:receipts",
                "event": "read",
                "entity": "client",
                "id": message.id
            }));

            this
                .logger
                .log("info", LOG_ID + "(markMessageAsRead) send - 'message'", stanzaRead.root().toString());
            this
                .xmppClient
                .send(stanzaRead);
        } else {
            this
                .logger
                .log("warn", LOG_ID + "(markMessageAsRead) No XMPP connection...");
        }
        this
            .logger
            .log("debug", LOG_ID + "(markMessageAsRead) _exiting_");
    }

    getRosters() {
        this
            .logger
            .log("debug", LOG_ID + "(start) getRosters");
        if (this.useXMPP) {
            let stanza = xml("iq", {
                "type": "get"
            }, xml("query", {xmlns: "jabber:iq:roster"}));

            this
                .logger
                .log("info", LOG_ID + "(getRosters) send - 'iq/rosters'", stanza.toString());
            this
                .xmppClient
                .send(stanza);
        } else {
            this
                .logger
                .log("warn", LOG_ID + "(getRosters) No XMPP connection...");
        }
        this
            .logger
            .log("debug", LOG_ID + "(getRosters) _exiting_");
    }

    sendInitialBubblePresence(jid) {
        this
            .logger
            .log("debug", LOG_ID + "(sendInitialBubblePresence) _entering_");
        if (this.useXMPP) {
            let stanza = xml("presence", {
                to: jid + "/" + this.fullJid
            }, xml("x", {"xmlns": "http://jabber.org/protocol/muc"}), xml("history", {maxchars: "0"}));
            this
                .logger
                .log("info", LOG_ID + "(sendInitialBubblePresence) send - 'message'", stanza.root().toString());
            this
                .xmppClient
                .send(stanza);
        } else {
            this
                .logger
                .log("warn", LOG_ID + "(sendInitialBubblePresence) No XMPP connection...");
        }
        this
            .logger
            .log("debug", LOG_ID + "(sendInitialBubblePresence) _exiting_");
    }

    sendUnavailableBubblePresence(jid) {
        this
            .logger
            .log("debug", LOG_ID + "(sendUnavailableBubblePresence) _entering_");
        if (this.useXMPP) {
            let stanza = xml("presence", {
                to: jid + "/" + this.fullJid,
                type: "unavailable"
            }, xml("x", {"xmlns": "http://jabber.org/protocol/muc"}));

            this
                .logger
                .log("info", LOG_ID + "(sendUnavailableBubblePresence) send - 'message'", stanza.root().toString());
            this
                .xmppClient
                .send(stanza);
        } else {
            this
                .logger
                .log("warn", LOG_ID + "(sendUnavailableBubblePresence) No XMPP connection...");
        }
        this
            .logger
            .log("debug", LOG_ID + "(sendUnavailableBubblePresence) _exiting_");
    }
}

module.exports = XMPPService;