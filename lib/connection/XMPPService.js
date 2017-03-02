"use strict";

var Client = require('node-xmpp-client');
var HttpsProxyAgent = require('https-proxy-agent');
var uuid4 = require('uuid4');

var generateRandomID, 
    generateRandomFullJidForNode, 
    handleXMPPConnection,
    getUniqueMessageId,
    getBareJIDFromFullJID,
    getResourceFromFullJID;

const LOG_ID = 'XMPP - ';

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

        generateRandomID = () => { 
            var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for (var i = 0; i < 8; i++) {
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			}
			return text;
        };

		getUniqueMessageId = () => {
			var messageToSendID = "node_" + randomBase + messageId;
			messageId++;
			return messageToSendID;
		};

        generateRandomFullJidForNode = (jid) => { 
			var fullJid = jid + "/node_" + this.version + "_" + generateRandomID();
			return fullJid;
		};

        getBareJIDFromFullJID = (fullJid) => {
            return fullJid.substring(0, fullJid.indexOf('/'))
        };

        getResourceFromFullJID = (fullJid) => {
            return fullJid.substring(fullJid.indexOf('/') + 1);
        };

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

            this.xmppClient.on('online', function(msg) {
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - online");
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) received", msg);
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) connected as " + msg.jid);
                that.eventEmitter.emit("rainbow_xmppconnected");
            });

            this.xmppClient.on('stanza', function(stanza) {
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - stanza");
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
                        if (stanza.attrs.from === that.fullJid || getBareJIDFromFullJID(stanza.attrs.from) === getBareJIDFromFullJID(that.fullJid)) {
                            // My presence changed (coming from me or another resource)
                            that.eventEmitter.emit("rainbow_onpresencechanged", {
                                fulljid: from,
                                jid : getBareJIDFromFullJID(stanza.attrs.from),
                                resource: getResourceFromFullJID(stanza.attrs.from),
                                show: 'online'
                            });
                        }
                        else {
                            var priority = null;
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
                                priority: priority,
                                show: show,
                                delay: delay,
                                status: status,
                                fulljid: from,
                                jid : getBareJIDFromFullJID(from),
                                resource: getResourceFromFullJID(from)
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

            this.xmppClient.on('error', function (err) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - error");
                that.logger.log("error", LOG_ID + "(handleXMPPConnection) received", err);
                that.xmppClient.end();
                that.eventEmitter.emit('rainbow_onxmpperror', err);
            });

            this.xmppClient.on('offline', function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - offline");
                that.logger.log("warn", LOG_ID + "(handleXMPPConnection) received", msg);
            });

            this.xmppClient.on('connect', function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - connect");
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) received", msg);
            });

            this.xmppClient.on('reconnect', function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - reconnect");
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) received", msg);
            })

            this.xmppClient.on('disconnect', function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - disconnect");
                that.logger.log("warn", LOG_ID + "(handleXMPPConnection) received", msg);
            });

            this.xmppClient.on('register', function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - register");
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) received", msg);
            });

            this.xmppClient.on('authenticate', function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - authenticate");
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) received", msg);
            });

            this.xmppClient.on('connection', function (msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - connection");
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) received", msg);
            });
        }
    }

    start() {
        var that = this;
        this.logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.logger.log("debug", LOG_ID + "(start) host", that.host);
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
            that.fullJid = generateRandomFullJidForNode(that.jid_im);

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

        var id = getUniqueMessageId();

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