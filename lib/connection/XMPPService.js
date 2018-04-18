"use strict";

const util = require("util");
const utils = require("../common/Utils");
const PubSub = require("pubsub-js");

// Until web proxy on websocket solved, patch existing configuration to offer the proxy options
let ws_options = null;

var isInTest = typeof global.it === "function";
var WS;
if ( isInTest ) {
    WS = require("mock-socket").WebSocket; 
} else {
    WS = require("ws");
}

class XmppWebSocket extends WS {
    constructor( address, protocols ) {
        super(address, protocols, ws_options);
    }
} 
global.WebSocket = XmppWebSocket;

var Client = require("@xmpp/client").Client;
const xml = require("@xmpp/xml");
let backoff = require("backoff");
var setTimeout = require("timers").setTimeout;

var HttpsProxyAgent = require("https-proxy-agent");

var XMPPUtils = require("../common/XMPPUtils");

const IQEventHandler = require("./XMPPServiceHandler/iqEventHandler");

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
const TYPE_CHAT = "chat";
const TYPE_GROUPCHAT = "groupchat";

const RECONNECT_INITIAL_DELAY = 5000;
const RECONNECT_MAX_DELAY = 60000;
const MAX_IDLE_TIMER = 70000;
const MAX_PING_ANSWER_TIMER = 5000;

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
        this.maxAttempts = 1;
        this.idleTimer = null;
        this.pingTimer = null;
        this.forceClose = false;

        this.hash = utils.makeId(8);

        this.handleXMPPConnection = (headers) => {

            var that = this;

            var options = {};
            Object.assign(options, headers);
            if (this.proxy.isProxyConfigured) {
                // Until web proxy on websocket solved, patch existing configuration to offer the proxy options
                options.agent = new HttpsProxyAgent(this.proxy.proxyURL);
                ws_options = options;
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

            const sasl = this.xmppClient.plugins.sasl;
            sasl.getMechanism = mechs => {
                return "PLAIN"; // Force plain sasl
            };

            this.xmppClient.handle(AUTHENTICATE_EVENT, authenticate => {
                return authenticate(this.fullJid, this.jid_password);
            });

            this.xmppClient.handle(BIND_EVENT, (bind) => {
                return bind(XMPPUtils.getResourceFromFullJID(this.fullJid));
            });

            this.xmppClient.on("input", (packet) => {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) raw in - << " + packet );
                that.startOrResetIdleTimer(true);
            });

            this.xmppClient.on("output", (packet) => {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) raw out - >> " + packet );
                that.startOrResetIdleTimer(false);
            });

            this.xmppClient.on(ONLINE_EVENT, (msg) => {
                
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - " + ONLINE_EVENT + " |", msg);
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) connected as " + msg);
                
                if (!that.isReconnecting) {
                    that.eventEmitter.emit("xmppconnected");
                }
            });

            this.xmppClient.on(STATUS_EVENT, msg => {
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - " + STATUS_EVENT + " |", msg);
            });

            this.xmppClient.on(STANZA_EVENT, (stanza) => {
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - " + STANZA_EVENT + " |", stanza.toString());

                let delivered = PubSub.publish( that.hash + "." + stanza.getNS() + "." + stanza.getName() + (stanza.attrs.type ? "." +  stanza.attrs.type: ""), stanza);

                stanza.children.forEach( ( child ) => {
                    delivered |= PubSub.publish(  that.hash + "." + child.getNS() + "." + child.getName() + (child.attrs.type ? "." +  child.attrs.type: ""), stanza);
                });

                if ( !delivered ) {
                    that.logger.log("error", LOG_ID + "(handleXMPPConnection) event - " + STANZA_EVENT + " not managed |", stanza.getNS() + "." + stanza.getName() + (stanza.attrs.type ? "." +  stanza.attrs.type: ""));
                }

                switch (stanza.getName()) {
                    case "iq":
                        // var children = stanza.children;
                        // children.forEach((node) => {
                        //     switch (node.getName()) {
                        //         case "ping":
                        //             let stanzaResponse = xml("iq", {
                        //                 "to": stanza.attrs.from,
                        //                 "id": stanza.attrs.id,
                        //                 "xmlns": stanza.getNS(),
                        //                 "type": "result"
                        //             });
                        //             that.logger.log("info", LOG_ID + "(handleXMPPConnection) answered - 'stanza'", stanzaResponse.toString());
                        //             that.xmppClient.send(stanzaResponse);
                        //             break;
                        //         case "query":
                        //             if (stanza.attrs.type === "result" || stanza.attrs.type === "set") {
                        //                 if (node.attrs.xmlns === "jabber:iq:roster") {
                        //                     var contacts = [];
                        //                     var subchildren = node.children;
                        //                     subchildren.forEach(function(item) {
                        //                         if (item.attrs.jid.substr(0, 3) !== "tel") {
                        //                             contacts.push({
                        //                                 jid: item.attrs.jid,
                        //                                 subscription: item.attrs.subscription,
                        //                                 ask: item.attrs.ask || ""
                        //                             });
                        //                         }
                        //                     });
                        //                     that.logger.log("info", LOG_ID + "(handleXMPPConnection) XMPP Rosters received", contacts.length);
                        //                     that.eventEmitter.emit("rainbow_onrosters", contacts);
                        //                 }
                        //             }
                        //             break;
                        //         case "default":
                        //             that.logger.log("warn", LOG_ID + "(handleXMPPConnection) not managed - 'stanza'", node.getName());
                        //             break;
                        //         default:
                        //             that.logger.log("warn", LOG_ID + "(handleXMPPConnection) child not managed for iq - 'stanza'", node.getName());
                        //             break;
                        //     }
                        // });
                        // if (stanza.attrs.type && stanza.attrs.type === "result") {
                        //     if (stanza.attrs.id === "enable_xmpp_carbon") {
                        //         that.eventEmitter.emit("rainbow_oncarbonactivated");
                        //     }
                        // }
                        break;
                    case "message":
                        var content = "";
                        var lang = "";
                        var alternativeContent = [];
                        var subject = "";
                        var event = "";
                        var eventJid = "";
                        var hasATextMessage = false;
                        var oob = null;
                        var messageType = stanza.attrs.type;
                        if (messageType === TYPE_CHAT || messageType === TYPE_GROUPCHAT) {

                            // var fromJid = XMPPUtils.getBareJIDFromFullJID(stanza.attrs.from);
                            // var resource = XMPPUtils.getResourceFromFullJID(stanza.attrs.from);
                            // var toJid = stanza.attrs.to;
                            // var id = stanza.attrs.id;
                            // var children = stanza.children;
                            // children.forEach((node) => {
                            //     switch (node.getName()) {
                            //         case "sent":
                            //             if (node.attrs.xmlns === "urn:xmpp:carbons:2") {
                            //                 that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - CC message 'sent' received");
                            //                 var forwarded = node.children[0];
                            //                 if (forwarded && forwarded.getName() === "forwarded") {
                            //                     var message = forwarded.children[0];
                            //                     if (message && message.getName() === "message") {
                            //                         fromJid = XMPPUtils.getBareJIDFromFullJID(message.attrs.from);
                            //                         resource = XMPPUtils.getResourceFromFullJID(message.attrs.from);
                            //                         toJid = message.attrs.to;
                            //                         id = message.attrs.id;
                            //                         var childs = message.children;
                            //                         if (childs) {
                            //                             childs.forEach((nodeChild) => {
                            //                                 if (nodeChild.getName() === "body") {
                            //                                     that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - CC message 'sent' of type chat received ");

                            //                                     var data = {
                            //                                         "fromJid": fromJid,
                            //                                         "resource": resource,
                            //                                         "toJid": toJid,
                            //                                         "type": messageType,
                            //                                         "content": nodeChild.getText(),
                            //                                         "id": id,
                            //                                         "lang": nodeChild.attrs["xml:lang"],
                            //                                         "cc": true,
                            //                                         "cctype": "sent",
                            //                                         "isEvent": false
                            //                                     };

                            //                                     that.eventEmitter.emit("rainbow_onmessagereceived", data);

                            //                                 }
                            //                             });
                            //                         }
                            //                     }
                            //                 }
                            //             }
                            //             break;
                            //         case "received":
                            //             if (node.attrs.xmlns === "urn:xmpp:carbons:2") {
                            //                 that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - CC message 'sent' received");
                            //                 var forwarded = node.children[0];
                            //                 if (forwarded && forwarded.getName() === "forwarded") {
                            //                     var message = forwarded.children[0];
                            //                     if (message && message.getName() === "message") {
                            //                         fromJid = XMPPUtils.getBareJIDFromFullJID(message.attrs.from);
                            //                         resource = XMPPUtils.getResourceFromFullJID(message.attrs.from);
                            //                         toJid = message.attrs.to;
                            //                         id = message.attrs.id;
                            //                         var childs = message.children;
                            //                         if (childs) {
                            //                             childs.forEach(function (nodeChild) {
                            //                                 if (nodeChild.getName() === "body") {
                            //                                     that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - CC message 'sent' of type chat received ");

                            //                                     var data = {
                            //                                         "fromJid": fromJid,
                            //                                         "resource": resource,
                            //                                         "toJid": toJid,
                            //                                         "type": messageType,
                            //                                         "content": nodeChild.getText(),
                            //                                         "id": id,
                            //                                         "lang": nodeChild.attrs["xml:lang"],
                            //                                         "cc": true,
                            //                                         "cctype": "sent",
                            //                                         "isEvent": false
                            //                                     };

                            //                                     that.eventEmitter.emit("rainbow_onmessagereceived", data);

                            //                                 }
                            //                             });
                            //                         }
                            //                     }
                            //                 }
                            //             }
                            //             else {
                            //                 var receipt = {
                            //                     event: node.attrs.event,
                            //                     entity: node.attrs.entity,
                            //                     type: messageType,
                            //                     id: node.attrs.id,
                            //                     fromJid: fromJid,
                            //                     resource: resource
                            //                 };
                            //                 that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - receipt received");
                            //                 that.eventEmitter.emit("rainbow_onreceipt", receipt);
                            //             }
                            //             break;
                            //         case "active":
                            //             that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - someone is active");
                            //             break;
                            //         case "inactive":
                            //             that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - someone is inactive");
                            //             break;
                            //         case "composing":
                            //             that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - someone is writing");
                            //             break;
                            //         case "archived":
                            //             break;
                            //         case "stanza-id":
                            //             break;
                            //         case "subject":
                            //             subject = node.getText();
                            //             break;
                            //         case "event":
                            //             event = node.attrs.name;
                            //             eventJid = node.attrs.jid;
                            //             break;
                            //         case "body":
                            //             content = node.getText();
                            //             that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - content", "***");
                            //             if (node.attrs["xml:lang"]) { // in <body>
                            //                 lang = node.attrs["xml:lang"];
                            //             } else if (node.parent.attrs["xml:lang"]) { // in <message>
                            //                 lang = node.parent.attrs["xml:lang"];
                            //             } else {
                            //                 lang = "en";
                            //             }
                            //             that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - lang", lang);
                            //             hasATextMessage = true;
                            //             break;
                            //         case "content":
                            //             alternativeContent.push( {
                            //                 "message": node.getText(),
                            //                 "type": node.getAttr("type")
                            //             });
                            //             break;
                            //         case "request":
                            //             that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - asked for receipt");
                            //             // Acknowledge 'received'
                            //             let stanzaReceived = xml("message", {
                            //                 "to": fromJid,
                            //                 "from": toJid,
                            //                 "type": messageType
                            //             }, xml("received", {
                            //                 "xmlns": "urn:xmpp:receipts",
                            //                 "event": "received",
                            //                 "entity": "client",
                            //                 "id": stanza.attrs.id
                            //                 })
                            //             );
                                            
                            //             that.logger.log("info", LOG_ID + "(handleXMPPConnection) answered - send receipt 'received'", stanzaReceived.root().toString());
                            //             that.xmppClient.send(stanzaReceived);
                                        
                            //             //Acknowledge 'read'
                            //             if (that.shouldSendReadReceipt || (messageType === TYPE_GROUPCHAT && XMPPUtils.getResourceFromFullJID(stanza.attrs.from) === that.fullJid)) {
                                        
                            //                 let stanzaRead = xml("message", {
                            //                     "to": fromJid,
                            //                     "from": toJid,
                            //                     "type": messageType
                            //                 }, xml("received", {
                            //                         "xmlns": "urn:xmpp:receipts",
                            //                         "event": "read",
                            //                         "entity": "client",
                            //                         "id": stanza.attrs.id
                            //                     })
                            //                 );
                            //                 that.logger.log("info", LOG_ID + "(handleXMPPConnection) answered - send receipt 'read'", stanzaRead.root().toString());
                            //                 that.xmppClient.send(stanzaRead);
                            //             }
                            //             break;
                            //         case "x":
                            //             {
                            //                 let xmlns = node.attrs.xmlns;
                            //                 switch ( xmlns) {
                            //                    case "jabber:x:conference": {
                            //                         let invitation = {
                            //                             event: "invitation",
                            //                             bubbleId: node.attrs.thread,
                            //                             bubbleJid: node.attrs.jid,
                            //                             fromJid: fromJid,
                            //                             resource: resource
                            //                         };
                            //                         that.logger.log("info", LOG_ID + "(handleXMPPConnection) invitation received");
                            //                         that.eventEmitter.emit("rainbow_invitationreceived", invitation);
                            //                     }
                            //                     break;
                            //                     case "jabber:x:oob" : {
                            //                         oob = {
                            //                             url: node.getChild("url").getText(),
                            //                             mime: node.getChild("mime").getText(),
                            //                             filename: node.getChild("filename").getText(),
                            //                             filesize: node.getChild("size").getText()
                            //                         };
                            //                         that.logger.log("info", LOG_ID + "(handleXMPPConnection) oob received");
                            //                         break;
                            //                     }
                            //                     default:
                            //                         break;
                            //                 }
                            //                 break;
                            //             }
                            //         default:
                            //             break;
                            //     }
                            // });

                            // var fromBubbleJid = "";
                            // var fromBubbleUserJid = "";
                            // if (stanza.attrs.type === TYPE_GROUPCHAT) {
                            //     fromBubbleJid = XMPPUtils.getBareJIDFromFullJID(stanza.attrs.from);
                            //     fromBubbleUserJid = XMPPUtils.getResourceFromFullJID(stanza.attrs.from);
                            //     resource = XMPPUtils.getResourceFromFullJID(fromBubbleUserJid);
                            // }

                            // if (hasATextMessage && ((messageType === TYPE_GROUPCHAT && fromBubbleUserJid !== that.fullJid) || (messageType === TYPE_CHAT && fromJid !== that.fullJid))) {
                            //     that.logger.log("info", LOG_ID + "(handleXMPPConnection) message - chat message received");

                            //     var data = {
                            //         "fromJid": fromJid,
                            //         "resource": resource,
                            //         "toJid": toJid,
                            //         "type": messageType,
                            //         "content": content,
                            //         "alternativeContent": alternativeContent,
                            //         "id": stanza.attrs.id,
                            //         "lang": lang,
                            //         "cc": false,
                            //         "cctype": "",
                            //         "isEvent": false,
                            //         "oob": oob
                            //     };

                            //     if (stanza.attrs.type === TYPE_GROUPCHAT) {
                            //         data.fromBubbleJid = fromBubbleJid;
                            //         data.fromBubbleUserJid = fromBubbleUserJid;
                            //         data.fromJid = XMPPUtils.getRoomJIDFromFullJID(stanza.attrs.from);

                            //         if(event) {
                            //             data.event = event;
                            //             data.eventJid = eventJid;
                            //             data.isEvent = true;
                            //         }
                            //     }

                            //     that.eventEmitter.emit("rainbow_onmessagereceived", data);
                            // }
                        } else if (stanza.attrs.type === "management") {
                            // var children = stanza.children;
                            // children.forEach(function (node) {
                            //     switch (node.getName()) {
                            //         case "room":
                            //             if (node.attrs.xmlns === "jabber:iq:configuration") {

                            //                 // Affiliation changed (my own or for a member)
                            //                 if (node.attrs.status) {
                            //                     if (node.attrs.userjid === XMPPUtils.getBareJIDFromFullJID(that.fullJid)) {
                            //                         that.logger.log("debug", LOG_ID + "(handleXMPPConnection) bubble management received for own.");
                            //                         that.eventEmitter.emit("rainbow_ownaffiliationchanged", {
                            //                             "bubbleId": node.attrs.roomid,
                            //                             "bubbleJid": node.attrs.roomjid,
                            //                             "userJid": node.attrs.userjid,
                            //                             "status": node.attrs.status,
                            //                         });
                            //                     } else {
                            //                         that.logger.log("debug", LOG_ID + "(handleXMPPConnection) bubble affiliation received");
                            //                         that.eventEmitter.emit("rainbow_affiliationchanged", {
                            //                             "bubbleId": node.attrs.roomid,
                            //                             "bubbleJid": node.attrs.roomjid,
                            //                             "userJid": node.attrs.userjid,
                            //                             "status": node.attrs.status,
                            //                         });
                            //                     }
                            //                 }
                            //                 // Custom data changed
                            //                 else if (node.attrs.customData) {
                            //                     that.logger.log("debug", LOG_ID + "(handleXMPPConnection) bubble custom-data changed");
                            //                     that.eventEmitter.emit("rainbow_customdatachanged", {
                            //                         "bubbleId": node.attrs.roomid,
                            //                         "bubbleJid": node.attrs.roomjid,
                            //                         "customData": node.attrs.customData
                            //                     });
                            //                 }
                            //                 // Topic changed
                            //                 else if (node.attrs.topic) {
                            //                     that.logger.log("debug", LOG_ID + "(handleXMPPConnection) bubble topic changed");
                            //                     that.eventEmitter.emit("rainbow_topicchanged", {
                            //                         "bubbleId": node.attrs.roomid,
                            //                         "bubbleJid": node.attrs.roomjid,
                            //                         "topic": node.attrs.topic
                            //                     });
                            //                 }
                            //                 // Name changed
                            //                 else if (node.attrs.name) {
                            //                     that.logger.log("debug", LOG_ID + "(handleXMPPConnection) bubble name changed");
                            //                     that.eventEmitter.emit("rainbow_namechanged", {
                            //                         "bubbleId": node.attrs.roomid,
                            //                         "bubbleJid": node.attrs.roomjid,
                            //                         "name": node.attrs.name
                            //                     });
                            //                 }
                            //             }
                            //             break;
                            //         case "usersettings":
                            //             if (node.attrs.xmlns === "jabber:iq:configuration") {
                            //                 switch (node.attrs.action) {
                            //                     case "update":
                            //                         that.logger.log("debug", LOG_ID + "(handleXMPPConnection) usersettings updated");
                            //                         that.eventEmitter.emit("rainbow_usersettingschanged");
                            //                         break;
                            //                     default:
                            //                         break;
                            //                 }
                            //             }
                            //             break;
                            //         case "userinvite":
                            //             if (node.attrs.xmlns === "jabber:iq:configuration") {
                            //                 switch (node.attrs.action) {
                            //                     case "create":
                            //                         if (node.attrs.type === "received" && node.attrs.status === "pending") {
                            //                             that.logger.log("debug", LOG_ID + "(handleXMPPConnection) user invite received");
                            //                             that.eventEmitter.emit("rainbow_userinvitereceived", {
                            //                                 invitationId: node.attrs.id
                            //                             });
                            //                         }
                            //                     case "update":
                            //                         if( node.attrs.type === "sent" && node.attrs.status === "canceled" ) {
                            //                             that.logger.log("debug", LOG_ID + "(handleXMPPConnection) user invite canceled");
                            //                             that.eventEmitter.emit("rainbow_userinvitecanceled", {
                            //                                 invitationId: node.attrs.id
                            //                             });
                            //                         } else if( node.attrs.type === "sent" && node.attrs.status === "accepted" ) {
                            //                             that.logger.log("debug", LOG_ID + "(handleXMPPConnection) user invite accepted");
                            //                             that.eventEmitter.emit("rainbow_userinviteaccepted", {
                            //                                 invitationId: node.attrs.id
                            //                             });
                            //                         }
                            //                         break;
                            //                     default:
                            //                         break;
                            //                 }
                            //             }
                            //         case "group":
                            //             if (node.attrs.xmlns === "jabber:iq:configuration") {
                            //                 var action = node.attrs.action;
                            //                 var scope = node.attrs.scope;

                            //                 if (action === "create" && scope === "group") {
                            //                     that.logger.log("debug", LOG_ID + "(handleXMPPConnection) group created");
                            //                     that.eventEmitter.emit("rainbow_groupcreated", {
                            //                         "groupId": node.attrs.id
                            //                     });
                            //                 } else if (action === "create" && scope === "user" && node.attrs.userId) {
                            //                     that.logger.log("debug", LOG_ID + "(handleXMPPConnection) user added in group");
                            //                     that.eventEmitter.emit("rainbow_useraddedingroup", {
                            //                         "groupId": node.attrs.id,
                            //                         "userId": node.attrs.userId
                            //                     });
                            //                 } else if (action === "delete" && scope === "group") {
                            //                     that.logger.log("debug", LOG_ID + "(handleXMPPConnection) group deleted");
                            //                     that.eventEmitter.emit("rainbow_groupdeleted", {
                            //                         "groupId": node.attrs.id
                            //                     });
                            //                 } else if (action === "delete" && scope === "user" && node.attrs.userId) {
                            //                     that.logger.log("debug", LOG_ID + "(handleXMPPConnection) user removed from group");
                            //                     that.eventEmitter.emit("rainbow_userremovedfromgroup", {
                            //                         "groupId": node.attrs.id,
                            //                         "userId": node.attrs.userId
                            //                     });
                            //                 } else if (action === "update" && scope === "group") {
                            //                     if (node.attrs.name || node.attrs.comment || node.attrs.isFavorite) {
                            //                         that.logger.log("debug", LOG_ID + "(handleXMPPConnection) group updated");
                            //                         that.eventEmitter.emit("rainbow_groupupdated", {
                            //                             "groupId": node.attrs.id
                            //                         });
                            //                     }
                            //                 }
                            //             }
                            //             break;
                            //         default:
                            //             break;
                            //     }
                            // });
                        } else if (stanza.attrs.type === "error") {
                            //that.logger.log("error", LOG_ID + "(handleXMPPConnection) something goes wrong...");
                        } else if (stanza.attrs.type === "headline") {

                            // that.logger.log("info", LOG_ID + "(handleXMPPConnection) channel message received");

                            // let eventNode = stanza.children[0];
                            // let items = eventNode.children[0];
                            // let item = items.children[0];
                            // let entry = item.children[0];
                            
                            // let message = {
                            //     "messageId": item.attrs.id,
                            //     "channelId": entry.attrs.channelId,
                            //     "fromJid": entry.attrs.from,
                            //     "message": entry.getChild("message").getText() || "",
                            //     "title": entry.getChild("title").getText() ||  "",
                            //     "url": entry.getChild("url").getText() ||  "",
                            //     "date": new Date(entry.attrs.timestamp)
                            // };

                            // that.eventEmitter.emit("rainbow_onchannelmessagereceived", message);

                        } else {
                            var children = stanza.children;

                            children.forEach(function(node) {
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
                        // var from = stanza.attrs.from;
                        // if (from === that.fullJid || XMPPUtils.getBareJIDFromFullJID(from) === XMPPUtils.getBareJIDFromFullJID(that.fullJid)) {
                        //     // My presence changes (coming from me or another resource)
                        //     that
                        //         .eventEmitter
                        //         .emit("rainbow_onpresencechanged", {
                        //             fulljid: from,
                        //             jid: XMPPUtils.getBareJIDFromFullJID(from),
                        //             resource: XMPPUtils.getResourceFromFullJID(from),
                        //             show: stanza.attrs.show || "online",
                        //             status: stanza.attrs.status || "",
                        //             type: XMPPUtils.isFromTelJid(from)
                        //                 ? "phone"
                        //                 : XMPPUtils.isFromMobile(from)
                        //                     ? "mobile"
                        //                     : XMPPUtils.isFromNode(from)
                        //                         ? "node"
                        //                         : "desktopOrWeb"
                        //         });
                        // } else if (from.includes("room_")) {

                        //     var children = stanza.children;
                        //     children.forEach(function (node) {
                        //         switch (node.getName()) {
                        //             case "x":
                        //                 var items = node.children;
                        //                 items.forEach(function (item) {
                        //                     switch (item.getName()) {
                        //                         case "item":
                        //                             break;
                        //                         case "status":
                        //                             break;
                        //                         default:
                        //                             break;
                        //                     }
                        //                 });
                        //                 break;
                        //             default:
                        //                 break;
                        //         }
                        //     });

                        //     // A presence in a room changes
                        //     var fullJid = XMPPUtils.getResourceFromFullJID(from);
                        //     if (XMPPUtils.getBareJIDFromFullJID(fullJid) === XMPPUtils.getBareJIDFromFullJID(that.fullJid)) {
                        //         // My presence (node or other resources) in the room changes
                        //         that
                        //             .eventEmitter
                        //             .emit("rainbow_onbubblepresencechanged", {
                        //                 fulljid: from,
                        //                 jid: XMPPUtils.getBareJIDFromFullJID(from),
                        //                 resource: XMPPUtils.getResourceFromFullJID(from)
                        //             });
                        //     } else {
                        //         // Presence of a participants of the room changes
                        //         that
                        //             .eventEmitter
                        //             .emit("rainbow_onbubblerosterpresencechanged", {
                        //                 fulljid: from,
                        //                 jid: XMPPUtils.getBareJIDFromFullJID(from),
                        //                 resource: XMPPUtils.getResourceFromFullJID(from)
                        //             });
                        //     }

                        // } else {
                        //     // Presence of a contact changes
                        //     var priority = 5;
                        //     var show = "";
                        //     var delay = "";
                        //     var status = "";
                        //     if (stanza.attrs.type === "unavailable") {
                        //         show = "unavailable";
                        //     } else {
                        //         var children = stanza.children;
                        //         children.forEach(function (node) {
                        //             if (node && typeof node !== "string") {
                        //                 switch (node.getName()) {
                        //                     case "priority":
                        //                         priority = node.getText() || 5;
                        //                         break;
                        //                     case "show":
                        //                         show = node.getText() || "online";
                        //                         break;
                        //                     case "delay":
                        //                         delay = node.attrs.stamp || "";
                        //                         break;
                        //                     case "status":
                        //                         status = node.getText() || "";
                        //                         break;
                        //                     default:
                        //                         break;
                        //                 }
                        //             }
                        //         });
                        //     }

                        //     that.eventEmitter.emit("rainbow_onrosterpresence", {
                        //         fulljid: from,
                        //         jid: XMPPUtils.getBareJIDFromFullJID(from),
                        //         resource: XMPPUtils.getResourceFromFullJID(from),
                        //         value: {
                        //             priority: priority,
                        //             show: show || "",
                        //             delay: delay,
                        //             status: status || "",
                        //             type: XMPPUtils.isFromTelJid(from) ? "phone" : XMPPUtils.isFromMobile(from) ? "mobile" : XMPPUtils.isFromNode(from) ? "node" : "desktopOrWeb"
                        //         }
                        //     });
                        // }
                        break;
                    case "close":
                        break;
                    default:
                        that.logger.log("warn", LOG_ID + "(handleXMPPConnection) not managed - 'stanza'", stanza.getName());
                        break;
                }
            });

            this.xmppClient.on(ERROR_EVENT, function(err) {
                if (err.code === "HPE_INVALID_CONSTANT") {
                    return;
                }
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + ERROR_EVENT + " |", util.inspect(err.condition || err));
                that.stopIdleTimer();
                if (that.reconnect) {
                    if( !that.isReconnecting ) {
                        that.logger.log("debug", LOG_ID + "(handleXMPPConnection) try to reconnect...");
                        that.reconnect.reconnect();
                    }
                } else {
                    that.eventEmitter.emit("rainbow_onxmpperror", err);
                }
            });

            this.xmppClient.on(OFFLINE_EVENT, (msg) => {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + OFFLINE_EVENT + " |" + msg);
            });

            this.xmppClient.on(CONNECT_EVENT, function() {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + CONNECT_EVENT);
            });

            this.xmppClient.on(RECONNECT_EVENT, function(msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + RECONNECT_EVENT + " |" + msg);
            });

            this.xmppClient.on(DISCONNECT_EVENT, function() {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + DISCONNECT_EVENT + " |");
                that.eventEmitter.emit("rainbow_xmppdisconnect");
            });

            this.xmppClient.on(CLOSE_EVENT, function(msg) {
                that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - " + CLOSE_EVENT + " |" + msg);
            });

            this.xmppClient.on(END_EVENT, function(msg) {
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
                    that.logger.log("error", LOG_ID + "start reconnect ", err.code);
                    that.reconnect.reconnect();
                    return;
                }

                that.logger.log("error", LOG_ID + "start failed", err);
            });
        };
    }

    start(withXMPP) {
        var that = this;
        this.forceClose = false;
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

    signin(account, headers) {
        var that = this;

        return new Promise(function(resolve) {
            that.IQEventHandlerToken = [];

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

                that.IQEventHandler = new IQEventHandler(that);

                that.IQEventHandlerToken = [
                    PubSub.subscribe( that.hash + "." + that.IQEventHandler.IQ_GET, that.IQEventHandler.onIqGetReceived),
                    PubSub.subscribe( that.hash + "." + that.IQEventHandler.IQ_SET, that.IQEventHandler.onIqGetReceived),
                    PubSub.subscribe( that.hash + "." + that.IQEventHandler.IQ_RESULT, that.IQEventHandler.onIqResultReceived)
                ];

                that.handleXMPPConnection(headers);
                that.startOrResetIdleTimer();
                that.logger.log("debug", LOG_ID + "(signin) _exiting_");
                //resolve();
            } else {
                resolve();
            }
        });
    }

    stop(forceStop) {
        var that = this;
        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve) {

            try {
                that.stopIdleTimer();

                that.jid_im = "";
                that.jid_tel = "";
                that.jid_password = "";
                that.fullJid = "";

                if (that.useXMPP && forceStop) {

                    delete that.IQEventHandler;
                    that.IQEventHandler = null;

                    that.IQEventHandlerToken.forEach( (token) => PubSub.unsubscribe(token) );
                    that.IQEventHandlerToken = [];

                    that.forceClose = true;

                    // Disconnect the auto-reconnect mode
                    if (that.reconnect) {
                        that.logger.log("debug", LOG_ID + "(stop) stop XMPP auto-reconnect mode");
                        that.reconnect.stop();
                    }

                    // Disconnect the xmpp connection
                    if (that.xmppClient) {
                        that.xmppClient.stop().then(() => {
                            that.logger.log("debug", LOG_ID + "(stop) stop XMPP connection");
                            that.xmppClient = null;
                            that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                            resolve();
                        }).catch((err) => {
                            that.logger.log("error", LOG_ID + "(stop) error received", err);
                            that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                            resolve();
                        });
                    }
                    else {
                        that.logger.log("debug", LOG_ID + "(stop) nothing to stop");
                        that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                        resolve();
                    }
                }
                else {
                    that.logger.log("debug", LOG_ID + "(stop) nothing to stop");
                    that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                    resolve();
                }
            }
            catch (err) {
                that.logger.log("error", LOG_ID + "(stop) error received", err);
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve();
            }
        });
    }

    startOrResetIdleTimer(incomingStanza = false) {
        if ( (this.pingTimer && !incomingStanza) || this.reconnect.isReconnecting) {
            return;
        }
        this.stopIdleTimer();
        if (!this.forceClose) {
            this.idleTimer = setTimeout( () => {
                this.logger.log("warn", LOG_ID + "(startOrResetIdleTimer) No message received since " + MAX_IDLE_TIMER / 1000 + " seconds." );
                // Start waiting an answer from server else reset the connection
                this.pingTimer = setTimeout( () => {
                    this.pingTimer = null;
                    this.xmppClient.socket.end();
                }, MAX_PING_ANSWER_TIMER);
                this.sendPing();
            }, MAX_IDLE_TIMER);
        }
    }

    stopIdleTimer() {
        if ( this.idleTimer ) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
        if ( this.pingTimer ) {
            clearTimeout(this.pingTimer);
            this.pingTimer = null;
        }
    }

    setPresence(show, status) {
        this
            .logger
            .log("debug", LOG_ID + "(setPresence) _entering_");
        if (this.useXMPP) {
            let stanza = xml("presence");
            stanza.append(xml("priority", {}, "5"));

            if (show && show !== "online") {
                stanza.append(xml("show", {}, show));
            }

            if (status && (!show || show === "online")) {
                stanza.append(xml("status", {}, status));
            } else if (status) {
                stanza.append(xml("status", {}, status));
            }
            this.logger.log("info", LOG_ID + "(setPresence) send - 'stanza'", stanza.toString());
            this.xmppClient.send(stanza);
        } else {
            this.logger.log("warn", LOG_ID + "(setPresence) No XMPP connection...");
        }
        this.logger.log("debug", LOG_ID + "(setPresence) _exiting_");
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

    sendChatMessage(message, jid, lang, content, subject) {
        this
            .logger
            .log("debug", LOG_ID + "(sendChatMessage) _entering_");
        if (this.useXMPP) {
            var id = XMPPUtils.getUniqueMessageId();

            // Remove resource if exists
            jid = XMPPUtils.getBareJIDFromFullJID(jid);

            let stanza = xml("message", {
                "from": this.fullJid,
                "to": jid,
                "xmlns": "jabber:client",
                "type": TYPE_CHAT,
                "id": id
            }, xml("body", {
                "xml:lang": lang
            }, message), xml("request", {"xmlns": "urn:xmpp:receipts"}));

            if (subject) {
                stanza.append(xml("subject", {
                    "xml:lang": lang
                }, subject));
            }

            if ( content && content.message ) {
                var contentType = content.type || "text/markdown";
                stanza.append(xml("content", {
                    "type": contentType,
                    "xmlns": "urn:xmpp:content"
                }, content.message));
            }

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

    sendChatMessageToBubble(message, jid, lang, content, subject) {
        this
            .logger
            .log("debug", LOG_ID + "(sendChatMessageToBubble) _entering_");
        if (this.useXMPP) {
            var id = XMPPUtils.getUniqueMessageId();

            var stanza = xml("message", {
                "to": jid,
                "type": TYPE_GROUPCHAT,
                "id": id
            }, xml("body", {
                "xml:lang": lang
            }, message), xml("request", {"xmlns": "urn:xmpp:receipts"}));

            if (subject) {
                stanza.append(xml("subject", {
                    "xml:lang": lang
                }, subject));
            }

            if ( content && content.message ) {
                var contentType = content.type || "text/markdown";
                stanza.append(xml("content", {
                    "type": contentType,
                    "xmlns": "urn:xmpp:content"
                }, content.message));
            }

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
                "type": TYPE_CHAT
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

    sendPing() {
        this
        .logger
        .log("debug", LOG_ID + "(sendPing) _entering_");
        if (this.useXMPP) {
            let stanza = xml("iq", {
                "type": "get"
            }, xml("ping", {xmlns: "urn:xmpp:ping"}));

            this
                .logger
                .log("info", LOG_ID + "(sendPing) send - 'message'", stanza.root().toString());
            this
                .xmppClient
                .send(stanza);
        } else {
            this
                .logger
                .log("warn", LOG_ID + "(sendPing) No XMPP connection...");
        }
        this
            .logger
            .log("debug", LOG_ID + "(sendPing) _exiting_");
    }

    // Mam
    mamQuery( jid, options) {
        let that = this;

        const MAM = "urn:xmpp:mam:1";
        const _p =  [ "with", "start", "end" ];

        let mamAttr = {xmlns: MAM};
        if (!!options.queryid) {
            mamAttr.queryid = options.queryid;
            delete options.queryid;
        }

        let onMessage = options.onMessage;
        delete options.onMessage;
        let onComplete = options.onComplete;
        delete options.onComplete;

        let stanza = xml("iq", {
            "type": "set",
            id: jid,
            xmlns: "jabber:client"
        }, xml("query", mamAttr, xml("x", {
            xmlns: "jabber:x:data",
            type: "submit"
        }, xml("field", {
                "var": "FORM_TYPE",
                "type": "hidden"
            }, xml("value", {}, MAM)), _p.filter( (key) => options[key]).map((key) => {
                    let value = xml("field", {
                        "var": key
                    }, xml("value", {}, options[key]));
                    delete options[key];
                    return value;
            })),
            xml("set", { xmlns:"http://jabber.org/protocol/rsm" }, Object.keys(options).map((key)=> xml( key, {}, options[key] /*? options[key] : null*/)))
        ));

        that.logger.log("debug", LOG_ID + "(handleXMPPConnection) mamQuery - 'stanza'", stanza.toString());
        that.xmppClient.send(stanza).then(() => {
            if ( typeof onComplete === "function" ) {
                onComplete();
            }
       });
    }

    mamQueryMuc(jid, to, options) {
        let that = this;
        const MAM = "urn:xmpp:mam:1";
        const _p =  [ "with", "start", "end" ];

        let mamAttr = {xmlns: MAM};
        if (Boolean(options.queryid)) {
            mamAttr.queryid = options.queryid;
            delete options.queryid;
        }

        let onMessage = options.onMessage;
        delete options.onMessage;
        let onComplete = options.onComplete;
        delete options.onComplete;

        let stanza = xml("iq", {
            "type": "set",
            id: jid,
            to: to,
            xmlns: "jabber:client"
        }, xml("query", mamAttr, xml("x", {
            xmlns: "jabber:x:data",
            type: "submit"
        }, xml("field", {
                "var": "FORM_TYPE",
                "type": "hidden"
            }, xml("value", {}, MAM)), _p.filter( (key) => options[key]).map((key) => {
                    let value = xml("field", {
                        "var": key
                    }, xml("value", {}, options[key]));
                    delete options[key];
                    return value;
            })),
            xml("set", { xmlns:"http://jabber.org/protocol/rsm" }, Object.keys(options).map((key)=> xml( key, {}, options[key] ? options[key] : null)))
        ));

        that.logger.log("debug", LOG_ID + "(handleXMPPConnection) mamQueryMuc - 'stanza'", stanza.toString());
        that.xmppClient.send(stanza).then(() => {
            if ( typeof onComplete === "function" ) {
                onComplete();
            }
        });
    }

    mamDelete(jid, options) {

        let that = this;
        const MAM = "urn:xmpp:mam:1";
        const _p =  [ "with", "start", "end" ];

        let mamAttr = {xmlns: MAM};
        if (Boolean(options.deleteid)) {
            mamAttr.deleteid = options.deleteid;
            delete options.deleteid;
        }

        let onMessage = options.onMessage;
        delete options.onMessage;
        let onComplete = options.onComplete;
        delete options.onComplete;

        let stanza = xml("iq", {
            "type": "set",
            id: jid,
            xmlns: "jabber:client"
        }, xml("delete", mamAttr, xml("x", {
            xmlns: "jabber:x:data",
            type: "submit"
        }, xml("field", {
            "var": "FORM_TYPE",
            "type": "hidden"
        }, xml("value", {}, MAM)), _p.filter( (key) => options[key]).map((key) => {
            let value = xml("field", {
                "var": key
            }, xml("value", {}, options[key]));
            delete options[key];
            return value;
            })),
            xml("set", { xmlns:"http://jabber.org/protocol/rsm" }, Object.keys(options).map((key)=> xml( key, {}, options[key] ? options[key] : null)))
        ));

        that.logger.log("info", LOG_ID + "(handleXMPPConnection) mamDelete - 'stanza'", stanza.toString());
        that.xmppClient.send(stanza).then(() => {
             if ( typeof onComplete === "function" ) {
                 onComplete();
             }
        });
    }
}

module.exports = XMPPService;