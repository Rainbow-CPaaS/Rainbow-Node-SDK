"use strict";

var Client = require('node-xmpp-client');
var HttpsProxyAgent = require('https-proxy-agent');
var uuid4 = require('uuid4');

var XMPPUtils = require('../common/XMPPUtils');

const LOG_ID = 'XMPP - ';

const ONLINE_EVENT = 'online';
const OFFLINE_EVENT = 'offline';
const CONNECT_EVENT = 'connect';
const RECONNECT_EVENT = 'reconnect';
const DISCONNECT_EVENT = 'disconnect';
const CLOSE_EVENT = 'close';
const END_EVENT = 'end';
const ERROR_EVENT = 'error';
const STANZA_EVENT = 'stanza';

var handleXMPPConnection;

class XMPPService {

    constructor(_xmpp, _eventEmitter, _logger, _proxy) {
        this.serverURL = _xmpp.protocol + "://" + _xmpp.host + ":" + _xmpp.port + "/websocket";
        this.host = _xmpp.host
        this.eventEmitter = _eventEmitter;
        this.version = "0.1";
        this.jid_im = "";
        this.jid_tel = "";
        this.jid_password = "";
        this.fullJid = "";
        this.xmppClient = null;
        this.logger = _logger;
        this.proxy = _proxy;
        var randomBase = uuid4();
        var messageId = 0;

        handleXMPPConnection = () => {

            var that = this;

            var options = {};
            if(this.proxy.isProxyConfigured) {
                options.agent = new HttpsProxyAgent(this.proxy.proxyURL);
            }

            this.xmppClient = new Client({
                'jid': this.fullJid,
                'password': this.jid_password,
                'host': this.host,
                'websocket': {
                    'url': this.serverURL,
                    'options': options
                }
            });

            this.xmppClient.on(ONLINE_EVENT, function(msg) {
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - " + ONLINE_EVENT);
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) received", msg);
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) connected as " + msg.jid);
                that.eventEmitter.emit("rainbow_xmppconnected");
            });

            this.xmppClient.on(STANZA_EVENT, function(stanza) {
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - " + STANZA_EVENT);
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) received", stanza.toString());
                
                switch(stanza.getName()) {
                    case "iq":
                        var children = stanza.children;
                        children.forEach(function(node) {
                            switch(node.getName()) {
                                case "ping":
                                    var stanzaResponse = new Client.Stanza('iq', {'to': stanza.attrs.from, 'id': stanza.attrs.id, 'xmlns':stanza.getNS(), 'type': 'result' });
                                    that.logger.log("info", LOG_ID + "(handleXMPPConnection) answered - 'stanza'", stanzaResponse.toString());
                                    that.xmppClient.send(stanzaResponse);
                                    break;
                                case "query":
                                    if(stanza.attrs.type === "result") {
                                        if(node.attrs.xmlns === "jabber:iq:roster") {
                                            var contacts = [];
                                            var subchildren = node.children;
                                            subchildren.forEach(function(item) {
                                                if(item.attrs.jid.substr(0, 3) !==  "tel") {
                                                    contacts.push({
                                                        jid: item.attrs.jid,
                                                        subscription: item.attrs.subscription,
                                                        ask: item.attrs.ask || ""
                                                    });
                                                }
                                            });
                                            that.logger.log("info", LOG_ID + "(handleXMPPConnection) XMPP Rosters received", contacts.length);
                                            that.eventEmitter.emit('rainbow_onrosters', contacts);
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
                        if(stanza.attrs.type && stanza.attrs.type === "result") {
                            if(stanza.attrs.id === "enable_xmpp_carbon") {
                                that.eventEmitter.emit('rainbow_oncarbonactivated');
                            }
                        }
                        break;
                    case "message":
                        var content = "";
                        if(stanza.attrs.type === "chat") {
                            var children =stanza.children;
                            children.forEach(function(node) {
                                switch (node.getName()) {
                                    case "active":
                                        break;
                                    case "composing":
                                        break;
                                    case "received":
                                        var receipt = {
                                            event: node.attrs.event,
                                            entity :node.attrs.entity,
                                            id: node.attrs.id
                                        };
                                        that.eventEmitter.emit('rainbow_onreceipt', receipt);
                                        break;
                                    case "archived":
                                        break;
                                    case "stanza-id":
                                        break;
                                    case "body":
                                        content = node.getText();
                                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - content", "***");
                                        break;
                                    case "request":
                                        // Acknowledge 'received'
                                        var stanzaReceived = new Client.Stanza('message', { "to": stanza.attrs.from, "from": stanza.attrs.to, "type": "chat" }).c("received", {"xmlns": "urn:xmpp:receipts", "event": "received", "entity": "client", "id": stanza.attrs.id});
                                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) answered - 'stanza'", stanzaReceived.root().toString());
                                        that.xmppClient.send(stanzaReceived);
                                        //Acknowledge 'read'
                                        var stanzaRead = new Client.Stanza('message', { "to": stanza.attrs.from, "from": stanza.attrs.to, "type": "chat" }).c("received", {"xmlns": "urn:xmpp:receipts", "event": "read", "entity": "client", "id": stanza.attrs.id});
                                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) answered - 'stanza'", stanzaRead.root().toString());
                                        that.xmppClient.send(stanzaRead);
                                        that.eventEmitter.emit('rainbow_onmessagereceived', {
                                            'fromJid': stanza.attrs.from,
                                            'message': 'chat',
                                            'type': 'p2p',
                                            'content': content
                                        });
                                        break;
                                    default:
                                        break;
                                }
                            });
                        }
                        else {
                            var children =stanza.children;
                            children.forEach(function(node) {
                                switch (node.getName()) {
                                    case "received":
                                        var receipt = {
                                            event: node.attrs.event,
                                            entity :node.attrs.entity,
                                            id: node.attrs.id
                                        };
                                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) receipt received");
                                        that.eventEmitter.emit('rainbow_onreceipt', receipt);
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
                            // My presence changed (coming from me or another resource)
                            that.eventEmitter.emit("rainbow_onpresencechanged", {
                                fulljid: from,
                                jid : XMPPUtils.getBareJIDFromFullJID(from),
                                resource: XMPPUtils.getResourceFromFullJID(from),
                                show: 'online',
                                type: XMPPUtils.isFromTelJid(from) ? "phone" : XMPPUtils.isFromMobile(from) ? "mobile" : XMPPUtils.isFromNode(from) ? "node" : "desktopOrWeb"
                            });
                        }
                        else {
                            var priority = 5;
                            var show = "";
                            var delay = "";
                            var status = "";
                            if(stanza.attrs.type === "unavailable") {
                                show = "unavailable";
                            }
                            else {
                                var children = stanza.children;
                                children.forEach(function(node) {
                                    if(node && typeof node !== "string") {
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
                                            default:
                                                break;
                                        }
                                    }
                                });
                            }
                            
                            that.eventEmitter.emit("rainbow_onrosterpresence", {
                                fulljid: from,
                                jid : XMPPUtils.getBareJIDFromFullJID(from),
                                resource: XMPPUtils.getResourceFromFullJID(from),
                                value: {
                                    priority: priority,
                                    show: show,
                                    delay: delay,
                                    status: status,
                                    type: XMPPUtils.isFromTelJid(from) ? "phone" : XMPPUtils.isFromMobile(from) ? "mobile" : XMPPUtils.isFromNode(from) ? "node" : "desktopOrWeb",
                                }
                            });
                        }
                        break;
                    case "close":
                        break;
                    default:
                        that.logger.log("warn", LOG_ID + "(handleXMPPConnection) not managed - 'stanza'", node.getName());
                        break;
                }
            });

            this.xmppClient.on(ERROR_EVENT, function (err) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + ERROR_EVENT);
                that.logger.log("error", LOG_ID + "(handleXMPPConnection) received", err);
                that.xmppClient.end();
                that.eventEmitter.emit('rainbow_onxmpperror', err);
            });

            this.xmppClient.on(OFFLINE_EVENT, function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + OFFLINE_EVENT);
                that.logger.log("warn", LOG_ID + "(handleXMPPConnection) received", msg);
            });

            this.xmppClient.on(CONNECT_EVENT, function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + CONNECT_EVENT);
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) received", msg);
            });

            this.xmppClient.on(RECONNECT_EVENT, function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + RECONNECT_EVENT);
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) received", msg);
            })

            this.xmppClient.on(DISCONNECT_EVENT, function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + DISCONNECT_EVENT);
                that.logger.log("warn", LOG_ID + "(handleXMPPConnection) received", msg);
            });

            this.xmppClient.on(CLOSE_EVENT, function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + CLOSE_EVENT);
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) received", msg);
            });

            this.xmppClient.on(END_EVENT, function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + END_EVENT);
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) received", msg);
            });
        }
    }

    start() {
        var that = this;
        this.logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.logger.log("debug", LOG_ID + "(start) host used", that.host);
                that.logger.log("info", LOG_ID + "(start) XMPP URL", that.serverUR);
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();
            }
            catch(err) {
                reject(err);
            }
        });
    }

    signin(account) {
        var that = this;
        this.logger.log("debug", LOG_ID + "(signin) _entering_");

        return new Promise(function(resolve, reject) {
            that.jid_im = account.jid_im;
            that.jid_tel = account.jid_tel;
            that.jid_password = account.jid_password
            that.fullJid = XMPPUtils.generateRandomFullJidForNode(that.jid_im);

            that.logger.log("info", LOG_ID + "(signin) account used", that.jid_im);
            
            handleXMPPConnection();
            that.logger.log("debug", LOG_ID + "(signin) _exiting_");
            resolve();
        });
    }
            
    stop() {
        if(this.xmppClient) {
            this.xmppClient.end();
        }
        this.jid_im = "";
        this.jid_tel = "";
        this.jid_password = "";
        this.fullJid = "";
        this.xmppClient = null;
    }

    sendInitialPresence() {
        var stanza = new Client.Stanza('presence', { 'priority': 5});
        this.logger.log("info", LOG_ID + "(sendInitialPresence) send - 'stanza'", stanza.toString());
        this.xmppClient.send(stanza);
    }

    //Message Carbon XEP-0280 
    enableCarbon() {
        var stanza = new Client.Stanza('iq', { 'type': 'set', id: 'enable_xmpp_carbon'}).c("enable", { xmlns: "urn:xmpp:carbons:2" }).up();
        this.logger.log("info", LOG_ID + "(enableCarbon) send - 'stanza'", stanza.toString());
        this.xmppClient.send(stanza);
	};

    sendChatMessage(message, jid) {

        var id = XMPPUtils.getUniqueMessageId();

        var stanza = new Client.Stanza('message', {"from": this.fullJid, 'to': jid, 'xmlns': "jabber:client", 'type': 'chat', 'id':id}).c('body').t(message).up().c("request", { "xmlns": "urn:xmpp:receipts" }).up();
        this.logger.log("info", LOG_ID + "(sendChatMessage) send - 'message'", stanza.toString());
        this.xmppClient.send(stanza);
        return {
            to: jid,
            message: 'chat',
            type: 'p2p',
            id: id,
            content: message
        };
    }

    getRosters() {
        var stanza = new Client.Stanza('iq', {"type": "get"}).c('query', { xmlns: "jabber:iq:roster"}).up();
        this.logger.log("info", LOG_ID + "(getRosters) send - 'iq/rosters'", stanza.toString());
        this.xmppClient.send(stanza);
    }
};

module.exports = XMPPService;