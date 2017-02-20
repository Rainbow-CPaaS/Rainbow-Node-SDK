"use strict";

var winston = require("winston");
const WebSocket = require('ws');
var Client = require('node-xmpp-client');

var generateRandomID, generateRandomFullJidForNode;

const LOG_ID = '[WS] ';

class HTTPService {

    constructor(_xmpp) {
        this.serverURL = _xmpp.protocol + "://" + _xmpp.host + ":" + _xmpp.port + "/websocket";
        this.host = _xmpp.host
        this.jid_im = "";
        this.jid_tel = "";
        this.jid_password = "";
        this.version = "0.1";

        generateRandomID = () => { 
            var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for (var i = 0; i < 8; i++) {
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			}

			return text;
        };

        generateRandomFullJidForNode = (jid) => { 
			var fullJid = jid + "/node_" + this.version + "_" + generateRandomID();
			return fullJid;
		};
    }

    start() {
        var that = this;
        winston.log("info", LOG_ID + "start - begin");

        return new Promise(function(resolve, reject) {
            winston.log("debug", LOG_ID + "start", {"serverURL": that.serverURL});
            winston.log("info", LOG_ID + "start - end");
            resolve();
        });
    }

    signin(account) {
        winston.log("info", LOG_ID + "signin - begin");

        this.jid_im = account.jid_im;
        this.jid_tel = account.jid_tel;
        this.jid_password = account.jid_password

        winston.log("debug", LOG_ID + "signin - account used", account);
        var client = new Client({
            'jid': generateRandomFullJidForNode(this.jid_im),
            'password': this.jid_password,
            'host': this.host,
            'websocket': {
                'url': this.serverURL
            }
        });

        client.on('online', function(msg) {
            winston.log("info", LOG_ID + "Received - 'online'");
            winston.log("debug", LOG_ID + "Connected as " + msg.jid);
        });

        client.on('stanza', function(stanza) {
            winston.log("debug", LOG_ID + "Received - 'stanza'", stanza.toString());
            
            switch(stanza.getName()) {
                case "iq":
                    var children = stanza.children;
                    children.forEach(function(node) {
                        switch(node.getName()) {
                            case "ping":
                                var stanzaResponse = new Client.Stanza('iq', {'to': stanza.attrs.from, 'id': stanza.attrs.id, 'xmlns':stanza.getNS(), 'type': 'result' });
                                winston.log("debug", LOG_ID + "Answered - 'stanza'", stanzaResponse.toString());
                                client.send(stanzaResponse);
                                break;
                            case "default":
                                winston.log("debug", LOG_ID + "Not managed - 'stanza'", node.getName());
                                break;
                        }
                    });
                    break;
                case "message":
                    break;
                case "close":
                    break;
                default:
                    break;
            }

            
            
        });

        client.on('error', function (e) {
            winston.log("error", LOG_ID + "start - websocket on 'error'", e);
            client.end();
        });

        client.on('offline', function () {
            winston.log("warning", LOG_ID + "start - websocket on 'offline'");
        });

        client.on('connect', function (msg) {
            winston.log("debug", LOG_ID + "start - websocket on 'connect'", msg);
        });

        client.on('reconnect', function () {
            winston.log("info", LOG_ID + "start - websocket on 'reconnect'");
        })

        client.on('disconnect', function (e) {
            winston.log("warning", LOG_ID + "start - websocket on 'disconnect'", e);
        });
    }
            
    stop() {

    }
};

module.exports.create = function(config) {
    return new HTTPService(config);
}