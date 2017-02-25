"use strict";

var Client = require('node-xmpp-client');
var uuid4 = require('uuid4');

var generateRandomID, 
    generateRandomFullJidForNode, 
    handleXMPPConnection,
    getUniqueMessageId;

const LOG_ID = '[WS] ';

class XMPPService {

    constructor(_xmpp, _eventEmitter, _logger) {
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

        handleXMPPConnection = () => {

            var that = this;

            this.xmppClient = new Client({
                'jid': this.fullJid,
                'password': this.jid_password,
                'host': this.host,
                'websocket': {
                    'url': this.serverURL
                }
            });

            this.xmppClient.on('online', function(msg) {
                that.logger.log("info", LOG_ID + "Received - 'online'");
                that.logger.log("info", LOG_ID + "Connected as " + msg.jid);
                that.eventEmitter.emit("rainbow_xmppconnected");
            });

            this.xmppClient.on('stanza', function(stanza) {
                that.logger.log("info", LOG_ID + "Received - 'stanza'", stanza.toString());
                
                switch(stanza.getName()) {
                    case "iq":
                        var children = stanza.children;
                        children.forEach(function(node) {
                            switch(node.getName()) {
                                case "ping":
                                    var stanzaResponse = new Client.Stanza('iq', {'to': stanza.attrs.from, 'id': stanza.attrs.id, 'xmlns':stanza.getNS(), 'type': 'result' });
                                    that.logger.log("info", LOG_ID + "Answered - 'stanza'", stanzaResponse.toString());
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
                                            that.logger.log("info", LOG_ID + "XMPP Rosters received", contacts.length);
                                            that.eventEmitter.emit('rainbow_onrosters', contacts);
                                        }
                                    }
                                    break;
                                case "default":
                                    that.logger.log("warn", LOG_ID + "Not managed - 'stanza'", node.getName());
                                    break;
                            }
                        });
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
                                        that.logger.log("info", LOG_ID + "message - content", "***");
                                        break;
                                    case "request":
                                        // Acknowledge 'received'
                                        var stanzaReceived = new Client.Stanza('message', { "to": stanza.attrs.from, "from": stanza.attrs.to, "type": "chat" }).c("received", {"xmlns": "urn:xmpp:receipts", "event": "received", "entity": "client", "id": stanza.attrs.id});
                                        that.logger.log("info", LOG_ID + "Answered - 'stanza'", stanzaReceived.root().toString());
                                        that.xmppClient.send(stanzaReceived);
                                        //Acknowledge 'read'
                                        var stanzaRead = new Client.Stanza('message', { "to": stanza.attrs.from, "from": stanza.attrs.to, "type": "chat" }).c("received", {"xmlns": "urn:xmpp:receipts", "event": "read", "entity": "client", "id": stanza.attrs.id});
                                        that.logger.log("info", LOG_ID + "Answered - 'stanza'", stanzaRead.root().toString());
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
                                        that.logger.log("info", LOG_ID + "receipt received");
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
                        if(stanza.attrs.from === that.fullJid) {
                            // My presence changed
                            that.eventEmitter.emit("rainbow_onpresencechanged", {
                                fulljid: from,
                                jid : from.substring(0, from.indexOf('/')),
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
                                });
                            }
                            
                            that.eventEmitter.emit("rainbow_onrosterpresence", {
                                priority: priority,
                                show: show,
                                delay: delay,
                                status: status,
                                fulljid: from,
                                jid : from.substring(0, from.indexOf('/'))
                            });
                        }
                        break;
                    case "close":
                        break;
                    default:
                        break;
                }
            });

            this.xmppClient.on('error', function (e) {
                that.logger.log("error", LOG_ID + "start - websocket on 'error'", e);
                that.xmppClient.end();
                that.eventEmitter.emit('rainbow_onxmpperror', e);
            });

            this.xmppClient.on('offline', function () {
                that.logger.log("warn", LOG_ID + "start - websocket on 'offline'");
            });

            this.xmppClient.on('connect', function (msg) {
                that.logger.log("info", LOG_ID + "start - websocket on 'connect'", msg);
            });

            this.xmppClient.on('reconnect', function () {
                that.logger.log("info", LOG_ID + "start - websocket on 'reconnect'");
            })

            this.xmppClient.on('disconnect', function (e) {
                that.logger.log("warn", LOG_ID + "start - websocket on 'disconnect'", e);
            });

            this.xmppClient.on('register', function (e) {
                that.logger.log("info", LOG_ID + "start - websocket on 'register'", e);
            });

            this.xmppClient.on('authenticate', function (e) {
                that.logger.log("info", LOG_ID + "start - websocket on 'authenticate'", e);
            });

            this.xmppClient.on('connection', function (e) {
                that.logger.log("info", LOG_ID + "start - websocket on 'connection'", e);
            });
        }
    }

    start() {
        var that = this;
        this.logger.log("debug", LOG_ID + "start - begin");

        return new Promise(function(resolve, reject) {
            that.logger.log("info", LOG_ID + "start", {"serverURL": that.serverURL});
            that.logger.log("debug", LOG_ID + "start - end");
            resolve();
        });
    }

    signin(account) {
        var that = this;
        this.logger.log("debug", LOG_ID + "signin - begin");

        return new Promise(function(resolve, reject) {
            that.jid_im = account.jid_im;
            that.jid_tel = account.jid_tel;
            that.jid_password = account.jid_password
            that.fullJid = generateRandomFullJidForNode(that.jid_im);

            that.logger.log("info", LOG_ID + "signin - account used", that.jid_im);
            
            handleXMPPConnection();
            that.logger.log("debug", LOG_ID + "signin - end");
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
        var stanza = new Client.Stanza('presence', { });
        this.logger.log("info", LOG_ID + "send - 'stanza'", stanza.toString());
        this.xmppClient.send(stanza);
    }

    sendChatMessage(message, jid) {

        var id = getUniqueMessageId();

        var stanza = new Client.Stanza('message', {"from": this.fullJid, 'to': jid, 'xmlns': "jabber:client", 'type': 'chat', 'id':id}).c('body').t(message).up().c("request", { "xmlns": "urn:xmpp:receipts" }).up();
        this.logger.log("info", LOG_ID + "send - 'message'", stanza.toString());
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
        this.logger.log("info", LOG_ID + "send - 'iq/rosters'", stanza.toString());
        this.xmppClient.send(stanza);
    }
};

module.exports = XMPPService;