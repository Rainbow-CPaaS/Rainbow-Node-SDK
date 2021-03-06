"use strict";

import * as util from "util";
import {equalIgnoreCase, isNullOrEmpty, isStarted, logEntryExit, makeId, setTimeoutPromised} from "../common/Utils";
import * as PubSub from "pubsub-js";
import {Conversation} from "../common/models/Conversation";
import {XMPPUTils} from "../common/XMPPUtils";

import {IQEventHandler} from "./XMPPServiceHandler/iqEventHandler";
import {XmppClient} from "../common/XmppQueue/XmppClient";
import { AlertMessage } from "../common/models/AlertMessage";
import {DataStoreType} from "../config/config";
import {GenericService} from "../services/GenericService";

const packageVersion = require("../../package");
const url = require('url');
const prettydata = require("./pretty-data").pd;

// Until web proxy on websocket solved, patch existing configuration to offer the proxy options
let ws_options = null;

// @ts-ignore
let isInTest = typeof global.it === "function";
let WS;
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
// @ts-ignore
global.WebSocket = XmppWebSocket;

const Client = require("../common/XmppQueue/XmppClient").XmppClient;
const xml = require("@xmpp/xml");
let backoff = require("backoff");
//const setTimeout = require("timers").setTimeout;

const HttpsProxyAgent = require("https-proxy-agent");

// import {URL} from "url";

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
const TYPE_HEADLINE = "headline";

const RECONNECT_INITIAL_DELAY = 5000;
const RECONNECT_MAX_DELAY = 60000;
const MAX_IDLE_TIMER = 70000;
const MAX_PING_ANSWER_TIMER = 5000;


const NameSpacesLabels = {
    "ChatstatesNS" : "http://jabber.org/protocol/chatstates",
    "ReceiptNS" : "urn:xmpp:receipts",
    "CallLogNamespace" : "jabber:iq:telephony:call_log",
    "CallLogAckNamespace" : "urn:xmpp:telephony:call_log:receipts",
    "CallLogNotificationsNamespace" : "jabber:iq:notification:telephony:call_log",
    "RsmNameSpace" : "http://jabber.org/protocol/rsm",
    "Carbon2NameSpace" : "urn:xmpp:carbons:2",
    "ApplicationNameSpace" : "jabber:iq:application",
    "RosterNameSpace" : "jabber:iq:roster",
    "ClientNameSpace" : "jabber:client",
    "PingNameSpace" : "urn:xmpp:ping",
    "DataNameSpace" : "jabber:x:data",
    "MucNameSpace" : "http://jabber.org/protocol/muc",
    "ReceiptsNameSpace" : "urn:xmpp:receipts",
    "ChatestatesNameSpace" : "http://jabber.org/protocol/chatstates",
    "ContentNameSpace" : "urn:xmpp:content",
    "MessageCorrectNameSpace" : "urn:xmpp:message-correct:0",
    "HintsNameSpace" : "urn:xmpp:hints",
    "OobNameSpace" : "jabber:x:oob",
    "Monitoring1NameSpace" : "urn:xmpp:pbxagent:monitoring:1",
    "CallService1NameSpace" : "urn:xmpp:pbxagent:callservice:1",
    "MamNameSpace" : "urn:xmpp:mam:1",
    "MamNameSpaceTmp" : "urn:xmpp:mam:tmp",
    "AttentionNS" : "urn:xmpp:attention:0",
    "IncidentCap" : "http://www.incident.com/cap/1.0"
};

@logEntryExit(LOG_ID)
@isStarted(["start", "stop"])
class XMPPService extends GenericService {
	public serverURL: any;
	public host: any;
	public eventEmitter: any;
	public version: any;
	public jid_im: any;
	public jid_tel: any;
	public jid_password: any;
	public fullJid: any;
	public jid: any;
	public userId: any;
	public resourceId: any;
	public initialPresence: any;
	public xmppClient: XmppClient;
	public logger: any;
	public proxy: any;
	public shouldSendReadReceipt: any;
	public useXMPP: any;
	public timeBetweenXmppRequests: any;
	public isReconnecting: any;
	public maxAttempts: any;
	public idleTimer: any;
	public pingTimer: any;
	public forceClose: any;
	public applicationId: any;
	public generatedRandomId: any;
	public hash: any;
	public reconnect: any;
	public fibonacciStrategy: any;
	public IQEventHandlerToken: any;
	public IQEventHandler: any;
	public xmppUtils : XMPPUTils;
    private shouldSendMessageToConnectedUser: any;
    private storeMessages: boolean;
    private copyMessage: boolean;
    private rateLimitPerHour: number;
    private messagesDataStore: DataStoreType;

    static getClassName(){ return 'XMPPService'; }
    getClassName(){ return XMPPService.getClassName(); }


    constructor(_xmpp, _im, _application, _eventEmitter, _logger, _proxy) {
        super(_logger, LOG_ID);
        this.serverURL = _xmpp.protocol + "://" + _xmpp.host + ":" + _xmpp.port + "/websocket";
        this.host = _xmpp.host;
        this.eventEmitter = _eventEmitter;
        this.version = "0.1";
        this.jid_im = "";
        this.jid_tel = "";
        this.jid_password = "";
        this.fullJid = "";
        this.jid = "";
        this.userId = "";
        this.resourceId = "";
        this.initialPresence = true;
        this.xmppClient = null;
        this.logger = _logger;
        this.proxy = _proxy;
        this.shouldSendReadReceipt = _im.sendReadReceipt;
        this.shouldSendMessageToConnectedUser = _im.sendMessageToConnectedUser;
        this.storeMessages = _im.storeMessages;
        this.copyMessage = _im.copyMessage;
        this.rateLimitPerHour = _im.rateLimitPerHour;
        this.messagesDataStore = _im.messagesDataStore;
        this.useXMPP = true;
        this.timeBetweenXmppRequests = _xmpp.timeBetweenXmppRequests;
        this.isReconnecting = false;
        this.maxAttempts = 1;
        this.idleTimer = null;
        this.pingTimer = null;
        this.forceClose = false;
        this.applicationId = _application.appID;

        this._startConfig =  {
            start_up: true,
            optional: false
        };

        this.xmppUtils = XMPPUTils.getXMPPUtils();

        this.generatedRandomId = this.xmppUtils.generateRandomID();

        this.hash = makeId(8);

    }

    start(withXMPP) {
        let that = this;
        this.forceClose = false;

        return new Promise(function (resolve, reject) {
            try {
                if (withXMPP) {
                    that.logger.log("debug", LOG_ID + "(start) host used : ", that.host);
                    that.logger.log("info", LOG_ID + "(start) XMPP URL : ", that.serverURL);
                } else {
                    that.logger.log("info", LOG_ID + "(start) XMPP connection blocked by configuration");
                }
                that.isReconnecting = false;
                that.useXMPP = withXMPP;
                if (that.useXMPP) { // Put not ready state when the XMPP is disabled in SDK config options, then methods become unavailable with @isStarted decorator.
                    that.setStarted();
                }
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        });
    }

    signin(account, headers) {
        let that = this;
        return new Promise(function (resolve) {
            that.IQEventHandlerToken = [];
            that.eventEmitter.once("xmppconnected", function fn_xmppconnected(info) {
                that.logger.log("info", LOG_ID + "(signin) (xmppconnected) received : ", info);
                that.eventEmitter.removeListener("xmppconnected", fn_xmppconnected);
                resolve(undefined);
            });
            if (that.useXMPP) {
                that.jid_im = account.jid_im;
                that.jid_tel = account.jid_tel;
                that.jid_password = account.jid_password;
                that.userId = account.id;
                that.fullJid = that.xmppUtils.generateRandomFullJidForNode(that.jid_im, that.generatedRandomId);
                //that.resourceId =  "/node_" + that.generatedRandomId ;
                that.resourceId =  "node_" + that.generatedRandomId ;
                that.jid = account.jid_im;

                that.logger.log("internal", LOG_ID + "(signin) account used, jid_im : ", that.jid_im, ", fullJid : ", that.fullJid);

                that.IQEventHandler = new IQEventHandler(that);

                that.IQEventHandlerToken = [
                    PubSub.subscribe(that.hash + "." + that.IQEventHandler.IQ_GET, that.IQEventHandler.onIqGetSetReceived.bind(that.IQEventHandler)),
                    PubSub.subscribe(that.hash + "." + that.IQEventHandler.IQ_SET, that.IQEventHandler.onIqGetSetReceived.bind(that.IQEventHandler)),
                    PubSub.subscribe(that.hash + "." + that.IQEventHandler.IQ_RESULT, that.IQEventHandler.onIqResultReceived.bind(that.IQEventHandler))
                ];

                that.handleXMPPConnection(headers);
                that.IQEventHandlerToken.push(PubSub.subscribe(that.hash + "." + that.IQEventHandler.IQ_RESULT, that.xmppClient.onIqResultReceived.bind(that.xmppClient)));
                that.IQEventHandlerToken.push(PubSub.subscribe(that.hash + "." + that.IQEventHandler.IQ_ERROR, that.xmppClient.onIqErrorReceived.bind(that.xmppClient)));

                that.startOrResetIdleTimer();
                //resolve(undefined);
            } else {
                resolve(undefined);
            }
        });
    }

    stop(forceStop) {
        let that = this;
        return new Promise(function (resolve) {
            try {
                that.jid_im = "";
                that.jid_tel = "";
                that.jid_password = "";
                that.fullJid = "";
                that.userId = "";
                that.initialPresence = true;
                if (that.useXMPP && forceStop) {
                    that.stopIdleTimer();

                    delete that.IQEventHandler;
                    that.IQEventHandler = null;

                    if (that.IQEventHandlerToken) {
                        that.IQEventHandlerToken.forEach((token) => PubSub.unsubscribe(token));
                    }
                    that.IQEventHandlerToken = [];

                    that.forceClose = true;

                    // Disconnect the auto-reconnect mode
                    if (that.reconnect) {
                        that.logger.log("debug", LOG_ID + "(stop) stop XMPP auto-reconnect mode");
                        that.reconnect.stop();
                        that.reconnect = null;
                    }

                    // Disconnect the xmpp connection
                    if (that.xmppClient) {
                        let stanza = xml("presence", {
                            //from to : that.jid_im + "/" + that.fullJid,
                            //to: that.jid_im ,
                            type: "unavailable"
                        //}, xml("x", {"xmlns": NameSpacesLabels.MucNameSpace}));
                        }, null);
                         // stanza.append(xml("show", {}, "away"));
                         // stanza.append(xml("status", {}, "away"));

                        that.logger.log("debug", LOG_ID + "(stop) send Unavailable Presence- send - 'message'", stanza.root().toString());
                        //that.logger.log("internal", LOG_ID + "(stop) send Unavailable Presence- send - 'message'", stanza.root().toString());
                        that.xmppClient.send(stanza);

                        that.xmppClient.stop().then(() => {
                            that.logger.log("debug", LOG_ID + "(stop) stop XMPP connection");
                            that.xmppClient = null;
                            that.setStopped();
                            resolve(undefined);
                        }).catch((err) => {
                            that.logger.log("debug", LOG_ID + "(stop) error received");
                            that.logger.log("internalerror", LOG_ID + "(stop) error received : ", err);
                            resolve(undefined);
                        });
                    } else {
                        that.logger.log("debug", LOG_ID + "(stop) nothing to stop that.xmppClient : ", that.xmppClient);
                        resolve(undefined);
                    }
                } else {
                    that.logger.log("debug", LOG_ID + "(stop) nothing to stop, that.useXMPP : ", that.useXMPP, ", forceStop : ", forceStop) ;
                    resolve(undefined);
                }
            } catch (err) {
                that.logger.log("debug", LOG_ID + "(stop) error received");
                that.logger.log("internalerror", LOG_ID + "(stop) error received : ", err);
                resolve(undefined);
            }
        });
    }

    startOrResetIdleTimer(incomingStanza = false) {
        if ((this.pingTimer && !incomingStanza) || (this.reconnect && this.reconnect.isReconnecting)) {
            return;
        }
        this.stopIdleTimer();
        if (!this.forceClose) {
            this.idleTimer = setTimeout(() => {
                this.logger.log("internal", LOG_ID + "(startOrResetIdleTimer) No message received since " + MAX_IDLE_TIMER / 1000 + " seconds.");
                // Start waiting an answer from server else reset the connection
                this.pingTimer = setTimeout(() => {
                    this.pingTimer = null;
                    this.xmppClient.socket && this.xmppClient.socket.end();
                }, MAX_PING_ANSWER_TIMER);
                this.sendPing();
            }, MAX_IDLE_TIMER);
        }
    }

    stopIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
        if (this.pingTimer) {
            clearTimeout(this.pingTimer);
            this.pingTimer = null;
        }
    }

    handleXMPPConnection (headers) {

        let that = this;

        let domain = that.xmppUtils.getDomainFromFullJID(this.fullJid);

        let options = {agent: null};
        Object.assign(options, headers);
        let opt = url.parse(this.proxy.proxyURL);
        if (this.proxy.isProxyConfigured) {
            if (this.proxy.secureProtocol) {
                opt.secureProxy = true;
            }
            // Until web proxy on websocket solved, patch existing configuration to offer the proxy options
            options.agent = new HttpsProxyAgent(opt);
            //options.agent = new HttpsProxyAgent(this.proxy.proxyURL);
            ws_options = options;
        }

        /*
        this.xmppClient = new Client({
            "jid": this.fullJid,
            "password": this.jid_password,
            "host": this.host,
            "websocket": {
                "url": this.serverURL + "?x-rainbow-xmpp-dom=" + domain,
                "options": options
            }
        }); // */

        //"domain": {enter(node) {
        //}, exit(node){}},
        let xmppLinkOptions = {
            "service": that.serverURL + "?x-rainbow-xmpp-dom=" + domain,
            "domain": domain,
            "resource": that.resourceId,
            "username": that.fullJid,
            "password": that.jid_password,
            "options": options,
            "mechanism": "PLAIN"
        };

        that.logger.log("internal", LOG_ID + "(handleXMPPConnection) ", " xmppLinkOptions : ", xmppLinkOptions);

        that.xmppClient = new Client(xmppLinkOptions); //"domain": domain,
// */

        that.xmppClient.init(this.logger, this.timeBetweenXmppRequests, this.storeMessages, this.rateLimitPerHour, this.messagesDataStore);

        //this.reconnect = this.xmppClient.plugin(require("@xmpp/plugins/reconnect"));
        that.reconnect = this.xmppClient.reconnect;

        that.reconnect.delay = RECONNECT_INITIAL_DELAY;

        that.fibonacciStrategy = new backoff.FibonacciStrategy({
            randomisationFactor: 0.4,
            initialDelay: RECONNECT_INITIAL_DELAY,
            maxDelay: RECONNECT_MAX_DELAY
        });

        //const sasl = this.xmppClient.plugins.sasl;
        /*const sasl = this.xmppClient.sasl;
        sasl.getMechanism = mechs => {
            return "PLAIN"; // Force plain sasl
        }; // */
        this.xmppClient.setgetMechanism((mechs) => {
            return "PLAIN"; // Force plain sasl
        });


        /*
        this.xmppClient.handle(AUTHENTICATE_EVENT, authenticate => {
            return authenticate(this.fullJid, this.jid_password);
        });

        this.xmppClient.handle(BIND_EVENT, (bind) => {
            return bind(that.xmppUtils.getResourceFromFullJID(this.fullJid));
        }); // */

        that.xmppClient.on("input", function fn_input (packet) {
            that.logger.log("internal", LOG_ID + "(handleXMPPConnection) ", that.logger.colors.cyan(" raw in - ⮈ stanza : ") + that.logger.colors.cyan(prettydata.xml(packet)));
            that.startOrResetIdleTimer(true);
        });

        that.xmppClient.on("output", function fn_output (packet) {
            that.logger.log("internal", LOG_ID + "(handleXMPPConnection) ", that.logger.colors.yellow(" raw out - ⮊ stanza : ") + that.logger.colors.yellow(prettydata.xml(packet)));
            that.startOrResetIdleTimer(false);
        });

        that.xmppClient.on(ONLINE_EVENT, function fn_ONLINE_EVENT (msg) {
            that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - ONLINE_EVENT : " + ONLINE_EVENT + " | ", msg);
            that.logger.log("internal", LOG_ID + "(handleXMPPConnection) connected as ", msg);

            if (!that.isReconnecting) {
                that.eventEmitter.emit("xmppconnected");
            }
        });

        that.xmppClient.on(STATUS_EVENT, function fn_STATUS_EVENT (msg) {
            that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - STATUS_EVENT : " + STATUS_EVENT + " | ", msg);
            /* if (msg === "closing") {
                 that.xmppClient.restartConnect().then((res) => {
                     that.logger.log("debug", LOG_ID + "(handleXMPPConnection) restartConnect result : ", res);
                 }).catch((err) => {
                     that.logger.log("error", LOG_ID + "(handleXMPPConnection) restartConnect error : ", err);
                 }).then(() => {
                     that.logger.log("debug", LOG_ID + "on STATUS_EVENT ");
                 });
             } // */
        });

        that.xmppClient.on(STANZA_EVENT, function fn_STANZA_EVENT (stanza) {
            that.logger.log("internal", LOG_ID + "(handleXMPPConnection) event - STANZA_EVENT : " + STANZA_EVENT + " | ", stanza.toString());

            let eventId = that.hash + "." + stanza.getNS() + "." + stanza.getName() + (stanza.attrs.type ? "." + stanza.attrs.type : "");
            that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - STANZA_EVENT : eventId ", eventId);
            let delivered = PubSub.publish(eventId, stanza);

            stanza.children.forEach((child) => {
                delivered |= PubSub.publish(that.hash + "." + child.getNS() + "." + child.getName() + (child.attrs.type ? "." + child.attrs.type : ""), stanza);
            });

            if (!delivered) {
                that.logger.log("error", LOG_ID + "(handleXMPPConnection) event - STANZA_EVENT : " + STANZA_EVENT + " not managed | ", stanza.getNS() + "." + stanza.getName() + (stanza.attrs.type ? "." + stanza.attrs.type : ""));
            }

            switch (stanza.getName()) {
                case "iq":
                    break;
                case "message":
                    let content = "";
                    let lang = "";
                    let alternativeContent = [];
                    let subject = "";
                    let event = "";
                    let eventJid = "";
                    let hasATextMessage = false;
                    let oob = null;
                    let messageType = stanza.attrs.type;
                    if (messageType === TYPE_CHAT || messageType === TYPE_GROUPCHAT) {

                    } else if (stanza.attrs.type === "management") {
                    } else if (stanza.attrs.type === "error") {
                        //that.logger.log("error", LOG_ID + "(handleXMPPConnection) something goes wrong...");
                    } else if (stanza.attrs.type === "headline") {

                        // that.logger.log("info", LOG_ID + "(handleXMPPConnection) channel message received");

                    } else {
                        let children = stanza.children;

                        children.forEach(function (node) {
                            switch (node.getName()) {
                                case "received":
                                    let receipt = {
                                        event: node.attrs.event,
                                        entity: node.attrs.entity,
                                        type: null,
                                        id: node.attrs.id
                                    };
                                    //that.logger.log("info", LOG_ID + "(handleXMPPConnection) server receipt received");
                                    that.eventEmitter.emit("evt_internal_onreceipt", receipt);
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                    break;
                case "presence":
                    break;
                case "close":
                    break;
                default:
                    that.logger.log("warn", LOG_ID + "(handleXMPPConnection) not managed - 'stanza'", stanza.getName());
                    break;
            }
        });

        that.xmppClient.on(ERROR_EVENT, async function fn_ERROR_EVENT (err) {
            if (err.code === "HPE_INVALID_CONSTANT") {
                return;
            }
            that.logger.log("warn", LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : " + ERROR_EVENT + " | condition : ", err.condition, " | error : ", err);
            //that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : " + ERROR_EVENT + " | ", util.inspect(err.condition || err));
            that.stopIdleTimer();
            if (that.reconnect && err) {
                // Condition treatments for XEP Errors : https://xmpp.org/rfcs/rfc6120.html#streams-error
                switch (err.condition) {
                    // Conditions which need a reconnection
                    case "remote-connection-failed":
                    case "reset":
                    case "resource-constraint":
                    case "connection-timeout":
                    case "system-shutdown":
                        let waitime = 21 + Math.floor(Math.random() * Math.floor(15));
                        that.logger.log("warn", LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT :  wait ", waitime," seconds before try to reconnect");
                        await setTimeoutPromised(waitime);
                        if (!that.isReconnecting) {
                            that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : try to reconnect...");
                            await that.reconnect.reconnect().catch((err) => {
                                that.logger.log("info", LOG_ID + "(handleXMPPConnection) Error while reconnect : ", err);
                            });
                        } else {
                            that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : Do nothing, already trying to reconnect...");
                        }
                        break;
                    // Conditions which need to only raise an event to inform up layer.
                    case "bad-format":
                    case "bad-namespace-prefix":
                    case "host-gone":
                    case "host-unknown":
                    case "improper-addressing":
                    case "internal-server-error":
                    case "invalid-from":
                    case "invalid-namespace":
                    case "invalid-xml":
                    case "not-authorized":
                    case "not-well-formed":
                    case "policy-violation":
                    case "restricted-xml":
                    case "undefined-condition":
                    case "unsupported-encoding":
                    case "unsupported-feature":
                    case "unsupported-stanza-type":
                        that.logger.log("warn", LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : for condition : ", err.condition, ", error : ", err);
                        that.eventEmitter.emit("evt_internal_xmpperror", err);
                        break;
                    // Conditions which are fatal errors and then need to stop the SDK.
                    case "see-other-host":
                        that.logger.log("warn", LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : FATAL condition : ", err.condition, " is not supported the SDK");
                    case "conflict":
                    case "unsupported-version":
                        that.logger.log("warn", LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : FATAL no reconnection for condition : ", err.condition, ", error : ", err);
                        that.eventEmitter.emit("evt_internal_xmppfatalerror", err);
                        break;
                    // Default condition, we do not know what to do, so to avoir wrong stop of SDK, we ignore it.
                    default:
                        that.logger.log("warn", LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : default condition, IGNORED. for condition : ", err.condition, ", error : ", err);
                        that.eventEmitter.emit("evt_internal_xmpperror", err);
                        break;
                }
            } else {
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : reconnection disabled so no reconnect");
            }
        });

        that.xmppClient.on(OFFLINE_EVENT, function fn_OFFLINE_EVENT (msg) {
            that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - OFFLINE_EVENT : " + OFFLINE_EVENT + " | " + msg);
        });

        that.xmppClient.on(CONNECT_EVENT, function fn_CONNECT_EVENT () {
            that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - CONNECT_EVENT : " + CONNECT_EVENT);
        });

        that.xmppClient.on(RECONNECT_EVENT, function fn_RECONNECT_EVENT (msg) {
            that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - RECONNECT_EVENT : " + RECONNECT_EVENT + " | " + msg);
        });

        that.xmppClient.on(DISCONNECT_EVENT, async function fn_DISCONNECT_EVENT () {
            that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - DISCONNECT_EVENT : " + DISCONNECT_EVENT + " | ", {'reconnect': that.reconnect});
            that.eventEmitter.emit("rainbow_xmppdisconnect", {'reconnect': that.reconnect});
            let waitime = 11 + Math.floor(Math.random() * Math.floor(15));
            that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - DISCONNECT_EVENT : wait " + waitime + " seconds before try to reconnect");
            await setTimeoutPromised(waitime);
            if (that.reconnect) {
                if (!that.isReconnecting) {
                    that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - DISCONNECT_EVENT : It is not already reconnecting, so try to reconnect...");
                    await that.reconnect.reconnect().catch((err) => {
                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) Error while reconnect : ", err);
                    });
                } else {
                    that.logger.log("info", LOG_ID + "(handleXMPPConnection)  event - DISCONNECT_EVENT : Do nothing, already trying to reconnect...");
                }
            } else {
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - DISCONNECT_EVENT : reconnection disabled so no reconnect");
            }
        });

        that.xmppClient.on(CLOSE_EVENT, function fn_CLOSE_EVENT (msg) {
            that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - CLOSE_EVENT : " + CLOSE_EVENT + " | " + msg);
        });

        that.xmppClient.on(END_EVENT, function fn_END_EVENT (msg) {
            that.logger.log("debug", LOG_ID + "(handleXMPPConnection) event - END_EVENT : " + END_EVENT + " | " + msg);
        });

        that.reconnect.on(RECONNECTING_EVENT, function fn_RECONNECTING_EVENT () {
            that.logger.log("info", LOG_ID + "(handleXMPPConnection) plugin event - RECONNECTING_EVENT : " + RECONNECTING_EVENT);
            if (that.reconnect) {
                that.logger.log("info", `${LOG_ID} (handleXMPPConnection) RECONNECTING_EVENT that.reconnect - `, that.reconnect);
                if (!that.isReconnecting) {
                    that.reconnect.delay = that.fibonacciStrategy.next();
                    that.logger.log("info", `${LOG_ID} (handleXMPPConnection) RECONNECTING_EVENT update reconnect delay - ${that.reconnect.delay} ms`);

                    that.eventEmitter.emit("rainbow_xmppreconnectingattempt");
                    that.isReconnecting = true;
                } else {
                    that.logger.log("info", LOG_ID + "(handleXMPPConnection)  event - RECONNECTING_EVENT : Do nothing, already trying to reconnect...");
                }
            } else {
                that.logger.log("info", LOG_ID + "(handleXMPPConnection) event - RECONNECTING_EVENT : reconnection disabled so no reconnect");
                that.isReconnecting = false;
            }
        });

        that.reconnect.on(RECONNECTED_EVENT, function fn_RECONNECTED_EVENT () {
            that.logger.log("info", LOG_ID + "(handleXMPPConnection) plugin event - RECONNECTED_EVENT : " + RECONNECTED_EVENT);
            that.fibonacciStrategy.reset();
            that.reconnect.delay = that.fibonacciStrategy.getInitialDelay();
            that.isReconnecting = false;
            that.initialPresence = true;
            that.eventEmitter.emit("rainbow_xmppreconnected");
        });


        that.xmppClient.start({
            uri: this.serverURL + "?x-rainbow-xmpp-dom=" + domain,
            domain: domain
        }).then((jid) => {
            /* <iq type='get'
                from='romeo@montague.net/orchard'
                to='plays.shakespeare.lit'
                id='info1'>
                    <query xmlns='http://jabber.org/protocol/disco#info'/>
                    </iq> // */


            // Iq to discover the services provided by rainbow xmpp server
            let stanza = xml("iq", {
                //to: that.jid_im + "/" + that.fullJid,
                "type": "get",
                "to": domain,
                "id": that.xmppUtils.getUniqueMessageId()
            }, xml("query", {"xmlns": "http://jabber.org/protocol/disco#info"}));

            that.logger.log("internal", LOG_ID + "(handleXMPPConnection) send IQ discover : ", stanza.root().toString());
            return that.xmppClient.send(stanza);
            // */

//                if (that.messagesDataStore === DataStoreType.NoStoreBotSide) {
            /*<iq type='set' id='juliet2'>
            <prefs xmlns='urn:xmpp:mam:tmp' default='roster'>
                <always>
                    <jid>romeo@montague.lit</jid>
            </always>
            <never>
            <jid>montague@montague.lit</jid>
            </never>
            </prefs>
            </iq> // */
            // Iq to discover the services provided by rainbow xmpp server
//                     let stanzaPrefs = xml("iq", {
//                             //to: that.jid_im + "/" + that.fullJid,
//                             "id": that.xmppUtils.getUniqueMessageId(),
//                             "type": "set"
//                         },
//                         xml("prefs", {"xmlns": NameSpacesLabels.MamNameSpace , "default": 'always' },
//                         //xml("prefs", {"xmlns": NameSpacesLabels.MamNameSpace, "default": 'always'},
//                             /* xml("prefs", {"xmlns": NameSpacesLabels.MamNameSpace, "default": 'always'},
//                               xml("never", {},
//                                xml("jid", {}, that.jid_im)
//                                )
//                                )
//                                //*/
//
//                               xml("auto", {"save" : false}, undefined)
//                             , undefined)
//                             // */
// /*
//                             undefined
//                         )
//                         , undefined
//                         // */
//                     );

//                    that.logger.log("internal", LOG_ID + "(handleXMPPConnection) send IQ prefs : ", stanzaPrefs.root().toString());
//                    return that.xmppClient.send(stanzaPrefs);
//                }
            // */
        }) // */
            /*
            this.xmppClient.start().then((jid) => {
                that.logger.log("info", "started", jid.toString());
            })// */
            .catch(async err => {
                // rejects for any error before online
                if (err.code === "HPE_INVALID_CONSTANT") {
                    that.logger.log("error", LOG_ID + "start reconnect ", err);
                    await that.reconnect.reconnect().catch((err) => {
                        that.logger.log("info", LOG_ID + "(handleXMPPConnection) Error while reconnect : ", err);
                    });
                    return;
                }

                that.logger.log("error", LOG_ID + "start failed", err);
            });
    }

    setPresence(show, status) {
        let that = this;
        if (this.useXMPP) {
            let stanza = xml("presence", {"id": that.xmppUtils.getUniqueMessageId()});

            if (this.initialPresence) {
                this.initialPresence = false;
                stanza.append(xml("application",
                    {xmlns: NameSpacesLabels.ApplicationNameSpace},
                    xml("appid", {}, this.applicationId),
                    xml("userid", {}, this.userId)));
            }

            stanza.append(xml("priority", {}, "5"));

            if (show && show !== "online") {
                stanza.append(xml("show", {}, show));
            }

            if (status && (!show || show === "online")) {
                stanza.append(xml("status", {}, status));
            } else if (status) {
                stanza.append(xml("status", {}, status));
            }
            this.logger.log("info", LOG_ID + "(setPresence) send - 'stanza'");
            this.logger.log("internal", LOG_ID + "(setPresence) send - 'stanza'", stanza.toString());
            return this.xmppClient.send(stanza);
        } else {
            this.logger.log("warn", LOG_ID + "(setPresence) No XMPP connection...");
            return Promise.resolve(undefined);
        }
    }

    //Message Carbon XEP-0280
    enableCarbon() {
        let that = this;
        if (this.useXMPP) {
            let stanza = xml("iq", {
                "type": "set",
                id: "enable_xmpp_carbon"
            }, xml("enable", {xmlns: NameSpacesLabels.Carbon2NameSpace}));
            this.logger.log("internal", LOG_ID + "(enableCarbon) send - 'stanza'", stanza.toString());
            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanza).then(() => {
                    that.logger.log("debug", LOG_ID + "(enableCarbon) sent");
                    resolve(undefined);
                }).catch((err) => {
                    return reject(err);
                });
            });
        }

        that.logger.log("warn", LOG_ID + "(enableCarbon) No XMPP connection...");
        return Promise.resolve(null);
    }

    sendChatMessage(message, jid, lang, content, subject, answeredMsg, urgency: string = null) {
        let that = this;
        if (that.useXMPP) {
            let id = that.xmppUtils.getUniqueMessageId();

            if (!that.shouldSendMessageToConnectedUser && that.jid_im == jid) {
                return Promise.reject("Can not send a message to the connected user : " + that.jid_im);
            }

            // Remove resource if exists
            jid = that.xmppUtils.getBareJIDFromFullJID(jid);

            let stanza = xml("message", {
                //"from": this.fullJid,
                //"from": this.jid_im,
                "to": jid,
                "xmlns": NameSpacesLabels.ClientNameSpace,
                "type": TYPE_CHAT,
                "id": id
            }, xml("body", {
                "xml:lang": lang
            }, message), xml("request", {
                    "xmlns": NameSpacesLabels.ReceiptsNameSpace
                }, xml("active", {
                    "xmlns": NameSpacesLabels.ChatestatesNameSpace
                })
            ));

            let answeredMsgId = null;
            let answeredMsgDate = null;
            if ( answeredMsg ) {
                stanza.append(xml("answeredMsg", { "stamp": answeredMsg.date.getTime() }, answeredMsg.id));
                answeredMsgId = answeredMsg.id;
                answeredMsgDate = answeredMsg.date;
                that.logger.log("internal", LOG_ID + "(sendChatMessage) answeredMsg : ", stanza);
            }


            if (subject) {
                stanza.append(xml("subject", {
                    "xml:lang": lang
                }, subject));
            }

            if (content && content.message) {
                let contentType = content.type || "text/markdown";
                stanza.append(xml("content", {
                    "type": contentType,
                    "xmlns": NameSpacesLabels.ContentNameSpace
                }, content.message));
            }

            // Handle urgency
            if (urgency && urgency !== 'std') {
                stanza.append(xml('headers', { "xmlns": 'http://jabber.org/protocol/shim' }, xml('header', { name: 'Urgency' },urgency)));
            }
            
            that.logger.log("internal", LOG_ID + "(sendChatMessage) send - 'message'", stanza.toString());
            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanza).then(() => {
                    that.logger.log("debug", LOG_ID + "(sendChatMessage) sent");
                    resolve({from: this.jid_im, to: jid, type: "chat", id: id, date: new Date(), content: message});
                }).catch((err) => {
                    return reject(err);
                });
            });
        }

        that.logger.log("warn", LOG_ID + "(sendChatMessage) No XMPP connection...");
        return Promise.resolve(null);
    }

    sendChatMessageToBubble(message, jid, lang, content, subject, answeredMsg, attention, urgency: string = null) {
        let that = this;
        if (that.useXMPP) {

            if (!that.shouldSendMessageToConnectedUser && that.jid_im == jid) {
                return Promise.reject("Can not send a message to the connected user : " + that.jid_im);
            }

            let id = that.xmppUtils.getUniqueMessageId();
// from="room_85a525f559a14b1d88de9c79d866233f@muc.vberder-all-in-one-dev-1.opentouch.cloud/2c1e9ac0f2254b94bb2d977be498423d@vberder-all-in-one-dev-1.opentouch.cloud/web_win_1.56.8_S28ZBemj"
// from="room_17b2b86803b24bcd9ac70973bb311b9b@muc.vberder-all-in-one-dev-1.opentouch.cloud/2c1e9ac0f2254b94bb2d977be498423d@vberder-all-in-one-dev-1.opentouch.cloud/node_NWGWQN6V"
            let stanza = xml("message", {
                'xmlns': 'jabber:client',
                'xml:lang': lang,
                'to': jid, //that.fullJid,
               // 'from': jid + "/" + that.fullJid,
                'type': TYPE_GROUPCHAT,
                'id': id
            }, xml("body", {
                "xml:lang": lang
            }, message), xml("request", {
                    "xmlns": NameSpacesLabels.ReceiptsNameSpace
                }, xml("active", {
                    "xmlns": NameSpacesLabels.ChatestatesNameSpace
                })
            ));

            if (subject) {
                stanza.append(xml("subject", {
                    "xml:lang": lang
                }, subject));
            }

            let answeredMsgId = null;
            let answeredMsgDate = null;
            if ( answeredMsg ) {
                stanza.append(xml("answeredMsg", { "stamp": answeredMsg.date.getTime() }, answeredMsg.id), undefined);
                answeredMsgId = answeredMsg.id;
                answeredMsgDate = answeredMsg.date;
                that.logger.log("internal", LOG_ID + "(sendChatMessageToBubble) answeredMsg : ", stanza);
            }

            if (content && content.message) {
                let contentType = content.type || "text/markdown";
                stanza.append(xml("content", {
                    "type": contentType,
                    "xmlns": NameSpacesLabels.ContentNameSpace
                }, content.message));
            }

            // Handle urgency
            if (urgency && urgency !== 'std') {
                stanza.append(xml('headers', { "xmlns": 'http://jabber.org/protocol/shim' }, xml('header', { name: 'Urgency' },urgency)));
            }
            
            if (attention) {
                if (Array.isArray(attention) && attention.length > 0) {
                    let mentions = xml("mention", {"xmlns": NameSpacesLabels.AttentionNS}, undefined);
                    attention.forEach(function (jidMentioned) {
                        mentions.append(xml("jid", {}, jidMentioned), undefined);
                    });
                    stanza.append(mentions, undefined);
                } else if (typeof attention === 'string' || attention instanceof String) {
                    let mentions = xml("mention", {"xmlns": NameSpacesLabels.AttentionNS}, undefined);
                    mentions.append(xml("jid", {}, attention), undefined);
                    stanza.append(mentions, undefined);
                }
            }

            that.logger.log("internal", LOG_ID + "(sendChatMessageToBubble) send - 'message'", stanza.toString());

            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanza).then(() => {
                    that.logger.log("debug", LOG_ID + "(sendChatMessageToBubble) sent");
                    resolve({
                        from: this.jid_im,
                        to: jid,
                        type: "groupchat",
                        id: id,
                        date: new Date(),
                        message: message,
                        content: content,
                        subject: subject,
                        lang: lang,
                        answeredMsg: answeredMsg
                    });
                }).catch((err) => {
                    return reject(err);
                });
            });
        }

        that.logger.log("warn", LOG_ID + "(sendChatMessageToBubble) No XMPP connection...");
        return Promise.resolve(null);

        //return null;

    }

    async sendCorrectedChatMessage(conversation, originalMessage, data, origMsgId, lang, urgency: string = null) {
        let that = this;
//        $log.info("[Conversation] >sendCorrectedChatMessage: origMsgId=" + origMsgId)

        /* <message to='juliet@capulet.net/balcony' id='good1'>
        <body>But soft, what light through yonder window breaks?</body>
        <replace id='bad1' xmlns='urn:xmpp:message-correct:0'/>
        <store xmlns='urn:xmpp:hints'/>
        </message> */

        // this.sendAckReadMessages();

        let xmppMessage = null;
        // Build the message ID
        let messageToSendID = that.xmppUtils.getUniqueMessageId();
        that.logger.log("debug", LOG_ID + "(sendCorrectedChatMessage) : messageToSendID : " + messageToSendID);

        // Handle One to one conversation message
        if (conversation.type === Conversation.Type.ONE_TO_ONE) {
            let to = conversation.id; //this.contact.jid;
            xmppMessage = xml("message", {to: to, type: "chat", id: messageToSendID, "xml:lang": lang},
                xml("body", {"xml:lang": lang}, data),
                xml("replace", {id: origMsgId, "xmlns": NameSpacesLabels.MessageCorrectNameSpace}),
                xml("store", {"xmlns": NameSpacesLabels.HintsNameSpace}),
                xml("request", {"xmlns": NameSpacesLabels.ReceiptNS}),
                xml("active", {"xmlns": NameSpacesLabels.ChatstatesNS})
            );
        }
        // Handle Room conversation message
        else {
            xmppMessage = xml("message", {to: conversation.bubble.jid, type: "groupchat", id: messageToSendID},
                xml("body", {"xml:lang": lang}, data),
                xml("replace", {id: origMsgId, "xmlns": NameSpacesLabels.MessageCorrectNameSpace}),
                xml("store", {"xmlns": NameSpacesLabels.HintsNameSpace}),
                xml("request", {"xmlns": NameSpacesLabels.ReceiptNS}),
                xml("active", {"xmlns": NameSpacesLabels.ChatstatesNS})
            );
        }

        // Handle urgency
        if (urgency && urgency !== 'std') {
            xmppMessage.append(xml('headers', { "xmlns": 'http://jabber.org/protocol/shim' }, xml('header', { name: 'Urgency' },urgency)));
        }


        // message = this.addChatReplaceMessage(contactService.userContact, new Date(), unicodeData, messageToSendID, true);
        if (!originalMessage) {
            return null;
        }
        /* WEB SDK :
        originalMessage.serverAckTimer = $interval(function() {
            originalMessage.receiptStatus = Message.ReceiptStatus.ERROR;
            that.updateMessage(originalMessage);
        }, 10000);

        // Add message in messages array
        originalMessage.addReplaceMsg(messageToSendID, data);
        //*/

        // Create and send message
        that.xmppClient.send(xmppMessage);

        return messageToSendID;
    }

    markMessageAsRead(message, conversationType: string = "chat", span : number = 0) {
        let that = this;
        if (this.useXMPP) {

            let type = TYPE_CHAT;
            if (equalIgnoreCase(conversationType,"chat") )
                type = TYPE_CHAT;
            else if (equalIgnoreCase(conversationType,"headline"))
                type = TYPE_HEADLINE;
            else
                type = TYPE_GROUPCHAT;

            let stanzaRead = xml("message", {
                "to": message.fromJid,
                //"from": message.toJid + "ERROR",
                "type": type
            }, xml("timestamp", {
                "xmlns": NameSpacesLabels.ReceiptsNameSpace,
                "value": new Date().toJSON(),
            }), xml("received", {
                "xmlns": NameSpacesLabels.ReceiptsNameSpace,
                "event": "read",
                "entity": "client",
                "id": message.id
            }));

            this.logger.log("internal", LOG_ID + "(markMessageAsRead) send - 'message'", stanzaRead.root().toString());
            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanzaRead).then(() => {
                    that.logger.log("debug", LOG_ID + "(markMessageAsRead) sent");
                    resolve(undefined);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID + "(markMessageAsRead) error ");
                    that.logger.log("internalerror", LOG_ID + "(markMessageAsRead) error : ", err);
                    return reject(err);
                });
            });
        }

        that.logger.log("warn", LOG_ID + "(markMessageAsRead) No XMPP connection...");
        return Promise.resolve(null);
    }

    markMessageAsReceived(message, conversationType : string , span : number = 0)
    {
        /*
        Sharp.Xmpp.Im.MessageType type;
        if (conversationType == Conversation.ConversationType.User)
        type = Sharp.Xmpp.Im.MessageType.Chat;
        else if (conversationType == "Headline")
        type = Sharp.Xmpp.Im.MessageType.Headline;
        else
        type = Sharp.Xmpp.Im.MessageType.Groupchat;

        Task task = new Task(() => {
            if (xmppClient != null)
                xmppClient.MarkMessageAsReceive(jid, messageId, type);
        });

        if (span == default)
        task.Start();
        else
        Task.Delay(span).ContinueWith(t => task.Start());
        // */


        /*
        <message
        from='kingrichard@royalty.england.lit/throne'
        id='bi29sg183b4v'
        to='northumberland@shakespeare.lit/westminster'>
      <received xmlns='urn:xmpp:receipts' id='richard2-4.1.247'/>
    </message>
         */
        /* C#
        Message message = new Message(jid);
        message.Type = messageType;

        XmlElement e = message.Data;

        XmlElement timestamp = e.OwnerDocument.CreateElement("timestamp", "urn:xmpp:receipts");
        timestamp.SetAttribute("value", DateTime.UtcNow.ToString("o"));
        e.AppendChild(timestamp);

        XmlElement received = e.OwnerDocument.CreateElement("received", "urn:xmpp:receipts");
        received.SetAttribute("entity", "client");
        received.SetAttribute("event", "received");
        received.SetAttribute("id", messageId);
        e.AppendChild(received);

        im.SendMessage(message);
    // */
        /* otliteclient-sdk
        let msg = $msg({ "to": to, "from": from, "type": "chat" }).c("received", { "xmlns": Conversation.ReceiptNS, "event": "received", "entity": "client", "id": message.id });

        if (this.type !== Conversation.Type.ONE_TO_ONE) {
            msg = $msg({ "to": to, "from": from, "type": "groupchat" }).c("received", { "xmlns": Conversation.ReceiptNS, "event": "received", "entity": "client", "type": "muc", "id": message.id });
        } // */

        let that = this;
        if (this.useXMPP) {

            let type = TYPE_CHAT;
            if (equalIgnoreCase(conversationType,"chat") )
                type = TYPE_CHAT;
            else if (equalIgnoreCase(conversationType,"headline"))
                type = TYPE_HEADLINE;
            else
                type = TYPE_GROUPCHAT;

            let stanzaRead = xml("message", {
                "to": message.fromJid,
                //"from": message.toJid + "ERROR",
                type
            }, xml("timestamp", {
                "xmlns": NameSpacesLabels.ReceiptsNameSpace,
                "value": new Date().toJSON(),
            }), xml("received", {
                "xmlns": NameSpacesLabels.ReceiptsNameSpace,
                "event": "received",
                "entity": "client",
                "id": message.id
            }));

            this.logger.log("internal", LOG_ID + "(markMessageAsReceived) send - 'message'", stanzaRead.root().toString());
            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanzaRead).then(() => {
                    that.logger.log("debug", LOG_ID + "(markMessageAsRead) sent");
                    resolve(undefined);
                }).catch((err) => {
                    that.logger.log("error", LOG_ID + "(markMessageAsRead) error ");
                    that.logger.log("internalerror", LOG_ID + "(markMessageAsRead) error : ", err);
                    return reject(err);
                });
            });
        }

        that.logger.log("warn", LOG_ID + "(markMessageAsReceived) No XMPP connection...");
        return Promise.resolve(null);
    }


    sendChatExistingFSMessage(message, jid, lang, fileDescriptor) {
        let that = this;
        if (that.useXMPP) {
            if (!that.shouldSendMessageToConnectedUser && that.jid_im == jid) {
                return Promise.reject("Can not send a message to the connected user : " + that.jid_im);
            }

            let id = that.xmppUtils.getUniqueMessageId();

            // Remove resource if exists
            jid = that.xmppUtils.getBareJIDFromFullJID(jid);

            //let url = this.host + "/api/rainbow/fileserver/v1.0/files/" + fileDescriptor.id;
            let url = "/api/rainbow/fileserver/v1.0/files/" + fileDescriptor.id;

            let stanza = xml("message", {
                   // "from": this.fullJid,
                    "to": jid,
                    "xmlns": NameSpacesLabels.ClientNameSpace,
                    "type": TYPE_CHAT,
                    "id": id
                }, xml("body", {
                    "xml:lang": lang
                }, message), xml("request", {
                    "xmlns": NameSpacesLabels.ReceiptsNameSpace
                }, xml("active", {
                    "xmlns": NameSpacesLabels.ChatestatesNameSpace
                })
                ), xml("x", {
                    "xmlns": NameSpacesLabels.OobNameSpace
                }, xml("url", {}, url)
                , xml("mime", {}, fileDescriptor.typeMIME)
                , xml("filename", {}, fileDescriptor.fileName)
                , xml("size", {}, fileDescriptor.size)
                )
                , xml("store", {
                    "xmlns": NameSpacesLabels.HintsNameSpace
                })
            );

            that.logger.log("internal", LOG_ID + "(sendChatExistingFSMessage) send - 'message'", stanza.toString());
            return new Promise((resolve, reject) => {
                that
                    .xmppClient
                    .send(stanza).then(() => {
                    that.logger.log("debug", LOG_ID + "(sendChatExistingFSMessage) sent");
                    resolve({from: this.jid_im, to: jid, type: "chat", id: id, date: new Date(), content: message});
                }).catch((err) => {
                    return reject(err);
                });
            });
        }

        that.logger.log("warn", LOG_ID + "(sendChatExistingFSMessage) No XMPP connection...");
        return Promise.resolve(null);
    }

    sendChatExistingFSMessageToBubble(message, jid, lang, fileDescriptor) {
        let that = this;
        if (that.useXMPP) {

            if (!that.shouldSendMessageToConnectedUser && that.jid_im == jid) {
                return Promise.reject("Can not send a message to the connected user : " + that.jid_im);
            }

            let id = that.xmppUtils.getUniqueMessageId();

            // Remove resource if exists
            jid = that.xmppUtils.getBareJIDFromFullJID(jid);

            //let url = this.host  + "/api/rainbow/fileserver/v1.0/files/" + fileDescriptor.id;
            let url = "/api/rainbow/fileserver/v1.0/files/" + fileDescriptor.id;

            let stanza = xml("message", {
                    //"from": this.fullJid,
                    "to": jid,
                    "xmlns": NameSpacesLabels.ClientNameSpace,
                    "type": TYPE_GROUPCHAT,
                    "id": id
                }, xml("body", {
                    "xml:lang": lang
                }, message), xml("request", {
                    "xmlns": NameSpacesLabels.ReceiptsNameSpace
                }, xml("active", {
                    "xmlns": NameSpacesLabels.ChatestatesNameSpace
                })
                ), xml("x", {
                    "xmlns": NameSpacesLabels.OobNameSpace
                }, xml("url", {}, url)
                , xml("mime", {}, fileDescriptor.typeMIME)
                , xml("filename", {}, fileDescriptor.fileName)
                , xml("size", {}, fileDescriptor.size)
                )
                , xml("store", {
                    "xmlns": NameSpacesLabels.HintsNameSpace
                })
            );

            that.logger.log("internal", LOG_ID + "(sendChatExistingFSMessageToBubble) send - 'message'", stanza.toString());
            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanza).then(() => {
                    that.logger.log("debug", LOG_ID + "(sendChatExistingFSMessageToBubble) sent");
                    resolve({from: this.jid_im, to: jid, type: "chat", id: id, date: new Date(), content: message});
                }).catch((err) => {
                    return reject(err);
                });
            });
        }

        that.logger.log("warn", LOG_ID + "(sendChatExistingFSMessageToBubble) No XMPP connection...");
        return Promise.resolve(null);
    }

    sendIsTypingState(conversation, isTypingState) {
        let that = this;
        let state = (isTypingState) ? "composing" : "active";
        if (this.useXMPP) {

            let jid = conversation.id;
            let type = "chat";

            // Handle One to one conversation message
            if (conversation.type === Conversation.Type.ONE_TO_ONE) {
                //jid = this.contact.jid;
                type = "chat";
            }
            // Handle Room conversation message
            else {
                type = "groupchat";
            }

            let stanzaRead = xml("message", {
                "to": jid,
                "type": type,
                "id": that.xmppUtils.getUniqueMessageId()
            }, xml(state, {
                "xmlns": NameSpacesLabels.ChatestatesNameSpace
            }));

            this.logger.log("internal", LOG_ID + "(sendIsTypingState) send - 'message'", stanzaRead.root().toString());
            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanzaRead).then(() => {
                    that.logger.log("debug", LOG_ID + "(sendIsTypingState) sent");
                    resolve(undefined);
                }).catch((err) => {
                    return reject(err);
                });
            });
        }
        that.logger.log("warn", LOG_ID + "(markMessageAsRead) No XMPP connection...");
        return Promise.resolve(null);
    }

    getRosters() {
        let that = this;
        //this.logger.log("debug", LOG_ID + "(start) getRosters");
        if (this.useXMPP) {
            let stanza = xml("iq", {
                "id": that.xmppUtils.getUniqueMessageId(),
                "type": "get"
            }, xml("query", {xmlns: NameSpacesLabels.RosterNameSpace}));

            this.logger.log("internal", LOG_ID + "(getRosters) send - 'iq/rosters'", stanza.toString());
            this.xmppClient.send(stanza);
        } else {
            this.logger.log("warn", LOG_ID + "(getRosters) No XMPP connection...");
        }
    }

    /****************************************************/
    /**            XMPP ROSTER MANAGEMENT              **/
    /****************************************************/
    async sendSubscription (contact) {
        let that = this;
        // Return immediately if already subscribed
        if (contact.subscribe === "to" || contact.subscribe === "both") {
            return ;
        }

        // Send subscriptions for im and telephony presences
        await that.sendSubscribeInvitation(contact.jid);
        await that.sendSubscribeInvitation(contact.jidtel);

        return ;
    };

    async sendSubscribeInvitation (jid) {
        let that = this;
        this.logger.log("debug", LOG_ID + "(sendSubscribeInvitation) Send subscribe invitation to ", jid);
        let stanza = xml("iq", {
            type: "get",
            to: that.jid_tel + "/phone",
            xmlns: NameSpacesLabels.ClientNameSpace,
            "id": that.xmppUtils.getUniqueMessageId()
        }, xml("pbxagentstatus", {"xmlns": NameSpacesLabels.Monitoring1NameSpace}));

        this.logger.log("internal", LOG_ID + "(getAgentStatus) send - 'iq get'", stanza.root().toString());
        return this.xmppClient.sendIq(stanza);
    };

    sendInitialBubblePresence(jid) {
        let that = this;
        let id = that.xmppUtils.getUniqueMessageId();

        if (this.useXMPP) {
            let stanza = xml("presence", {
                "id": id,
                to: jid + "/" + this.fullJid
            }, xml("x", {"xmlns": NameSpacesLabels.MucNameSpace}).append(xml("history", {maxchars: "0"})));

            if (this.initialPresence) {
                this.initialPresence = false;
                stanza.append(xml("application",
                    {xmlns: NameSpacesLabels.ApplicationNameSpace},
                    xml("appid", {}, this.applicationId),
                    xml("userid", {}, this.userId)));
                stanza.append(xml("priority", {}, "5"));
            }

            this.logger.log("internal", LOG_ID + "(sendInitialBubblePresence) send - 'message'", stanza.root().toString());
            return this.xmppClient.send(stanza);
        } else {
            this.logger.log("warn", LOG_ID + "(sendInitialBubblePresence) No XMPP connection...");
            return Promise.resolve(undefined);
        }
    }

    sendUnavailableBubblePresence(jid) {
        let that = this;
        if (this.useXMPP) {
            let id = that.xmppUtils.getUniqueMessageId();

            let stanza = xml("presence", {
                "id": id,
                to: jid + "/" + this.fullJid,
                type: "unavailable"
            }, xml("x", {"xmlns": NameSpacesLabels.MucNameSpace}));

            this.logger.log("internal", LOG_ID + "(sendUnavailableBubblePresence) send - 'message'", stanza.root().toString());
            this.xmppClient.send(stanza);
        } else {
            this.logger.log("warn", LOG_ID + "(sendUnavailableBubblePresence) No XMPP connection...");
        }
    }

    getAgentStatus() {
        let that = this;
        return new Promise((resolve, reject) => {
            if (this.useXMPP) {
                let stanza = xml("iq", {
                    type: "get",
                    to: that.jid_tel + "/phone",
                    xmlns: NameSpacesLabels.ClientNameSpace,
                    "id": that.xmppUtils.getUniqueMessageId()
                }, xml("pbxagentstatus", {"xmlns": NameSpacesLabels.Monitoring1NameSpace}));


                this.logger.log("internal", LOG_ID + "(getAgentStatus) send - 'iq get'", stanza.root().toString());
                this.xmppClient.sendIq(stanza).then((data : any) => {
                    let pbxagentstatus = {
                        "phoneapi": "",
                        "xmppagent": "",
                        "version": ""
                    };
                    let agentStatus = {"phoneApi": "", "xmppAgent": "", "agentVersion": ""};

                    let subchildren = data.children[0].children;
                    subchildren.forEach((item) => {
                        if (typeof item === "object") {
                            let itemName = item.getName();
                            if (itemName) {
                                pbxagentstatus[itemName] = item.text();
                            }
                        }
                    });

                    if (pbxagentstatus.version) {
                        let phoneApi = pbxagentstatus.phoneapi;
                        let xmppAgent = pbxagentstatus.xmppagent;
                        let agentVersion = pbxagentstatus.version;
                        agentStatus = {"phoneApi": phoneApi, "xmppAgent": xmppAgent, "agentVersion": agentVersion};
                    }
                    resolve(agentStatus);
                });
            } else {
                resolve({});
            }
        });
    }

    /**
     *
      * @param useAfter
     * @returns {Promise<void>}
     */
    async sendGetCallLogHistoryPage(useAfter) {
        /*
        <iq from="38db98d2907a4c4095742a237b84557c@vberder-all-in-one-dev-1.opentouch.cloud" id="c08a506f-83d9-48a8-8628-10d69a44c340:sendIQ" type="set" xmlns="jabber:client">
            <query xmlns="jabber:iq:telephony:call_log">
                <set xmlns="http://jabber.org/protocol/rsm">
                    <max>75</max>
                    <before></before>
                </set>
            </query>
        </iq>
         */
        let that = this;
        // Get the user contact
        let useMax = 75;
        let useBefore = ""; //add empty before in order to get the most recent messages
        //let useAfter;

        let stanza =  xml("iq", {
            "from": this.jid_im,
            "type": "set",
            "id": that.xmppUtils.getUniqueMessageId()
        });
        let queryEmt = xml("query", {
            xmlns: NameSpacesLabels.CallLogNamespace
        });

        if (useMax || useBefore || useAfter) {
            let rsmSet = xml("set", {xmlns: NameSpacesLabels.RsmNameSpace});
            if (useMax) {
                rsmSet.append(xml("max", {}, useMax));
            }

            if (useAfter) {
                rsmSet.append(xml("after", {}, useAfter));
            } else {
                rsmSet.append(xml("before", {}, useBefore));
            }
            queryEmt.append(rsmSet);
        }
        stanza.append(queryEmt);

        return await this.xmppClient.sendIq(stanza);
    }

    async deleteOneCallLog(id) {
        let that = this;
        that.logger.log("info", LOG_ID + "[deleteOneCallLog] deleteOneCallLog : " + id);
        // Get the user contact
        //let userContact = contactService.userContact;

        let message = xml("iq", {
            "from": this.jid_im,
            "to": this.jid_im,
            "type": "set",
            "id": that.xmppUtils.getUniqueMessageId()
        });

        let msg = message.append(xml("delete", {xmlns: NameSpacesLabels.CallLogNamespace, call_id: id}));

        return await this.xmppClient.sendIq(msg);
    }

    async deleteCallLogsForContact(jid) {
        let that = this;
        that.logger.log("info", LOG_ID + "[deleteCallLogsForContact] deleteCallLogsForContact : " + jid);
        // Get the user contact
        //let userContact = contactService.userContact;

        let message = xml("iq", {
            "from": that.jid_im,
            "to": that.jid_im,
            "type": "set",
            "id": that.xmppUtils.getUniqueMessageId()
        });

        let msg = message.append(xml("delete", {xmlns: NameSpacesLabels.CallLogNamespace, peer: jid}));
        return await this.xmppClient.sendIq(msg);
        //xmppService.sendIQ(msg);
    }

    async deleteAllCallLogs() {
        let that = this;
        // Get the user contact
        //let userContact = contactService.userContact;
        if (this.useXMPP) {
            let message = xml("iq", {
                "from": that.jid_im,
                "to": that.jid_im,
                "type": "set",
                "id": that.xmppUtils.getUniqueMessageId()
            });

            let msg = message.append(xml("delete", {xmlns: NameSpacesLabels.CallLogNamespace}));
            return await this.xmppClient.sendIq(msg);
            //xmppService.sendIQ(msg);
        } else {
            this.logger.log("warn", LOG_ID + "(deleteAllCallLogs) No XMPP connection...");
            return Promise.resolve(undefined);
        }
    }

    async markCallLogAsRead(id) {
        let that = this;
        that.logger.log("info", LOG_ID + "[markCallLogAsRead] markCallLogAsRead : " + id);
        // Get the user contact
        //let userContact = contactService.userContact;

        let message = xml("message", {
            "from": that.jid_im,
            "to": that.jid_im,
            "id": that.xmppUtils.getUniqueMessageId()
        });

        let msg = message.append(xml("read", {xmlns: NameSpacesLabels.CallLogAckNamespace, call_id: id}));

        return await this.xmppClient.sendIq(msg);
        //xmppService.sendIQ(msg);
    }

    async markAllCallsLogsAsRead(callLogs) {
        let that = this;

        //let userContact = contactService.userContact;
        let promSend = [];

        for (let i = 0; i < callLogs.length; i++) {
            if (!callLogs[i].read) {

                let message = xml("message", {
                    "from": that.jid_im,
                    "to": that.jid_im,
                    "id": that.xmppUtils.getUniqueMessageId()
                });

                let msg = message.append(xml("read", {
                    "xmlns": NameSpacesLabels.CallLogAckNamespace,
                    "call_id": callLogs[i].id
                }));

                promSend.push(that.xmppClient.sendIq(msg));
                //xmppService.sendIQ(msg);
            }
        }
        return await Promise.all(promSend);
    }

    async deleteAllMessageInOneToOneConversation(conversationId) {
        let that = this;
        /*
        <iq id="3b718ea6-5dae-4e29-b54c-b843156df93d" type="set" xmlns="jabber:client">
  <delete queryid="dd008366-ad0f-4197-a61c-0c34fbc0e75a" xmlns="urn:xmpp:mam:1">
    <x type="submit" xmlns="jabber:x:data">
      <field type="hidden" var="FORM_TYPE">
        <value>urn:xmpp:mam:1
        </value>
      </field>
      <field var="with">
        <value>7ebaaacfa0634f46a903bcdd83ae793b@openrainbow.net
        </value>
      </field>
    </x>
    <set xmlns="http://jabber.org/protocol/rsm"/>
  </delete>
</iq>
         */


        // Get the user contact
        //let userContact = contactService.userContact;

        let uniqMessageId=  that.xmppUtils.getUniqueMessageId();
        let uniqId=  that.xmppUtils.getUniqueId(undefined);

        let message = xml("iq", {
            //"from": that.jid_im,
            //"to": that.jid_im,
            "type": "set",
            "id": uniqMessageId
        });

        let rsmDelete = xml("delete", {xmlns: NameSpacesLabels.MamNameSpace, queryid: uniqId});
        let rsmx = xml("x",{xmlns: NameSpacesLabels.DataNameSpace, type: "submit"});
        let rsmField1 = xml("field",{var: "FORM_TYPE", type: "hidden"});
        let rsmvalue1 = xml("value",{}, NameSpacesLabels.MamNameSpace);
        let rsmField2 = xml("field",{var: "with"});
        let rsmvalue2 = xml("value",{}, conversationId);
        let rsmset = xml("set", {xmlns:NameSpacesLabels.RsmNameSpace});
        rsmField1.append(rsmvalue1, undefined);
        rsmField2.append(rsmvalue2, undefined);
        rsmx.append(rsmField1,  undefined);
        rsmx.append(rsmField2,  undefined);
        rsmDelete.append(rsmx,  undefined);
        rsmDelete.append(rsmset,  undefined);
        let msg = message.append(rsmDelete, undefined);
        //return Promise.resolve(message);
        return await this.xmppClient.sendIq(msg);
        //xmppService.sendIQ(msg);
    }

    getErrorMessage (data, actionLabel) {
        let errorMessage = actionLabel + " failure : ";

        if (data.attr("type") === "error") {
            //let errorMsg = stanza.getChild("error")?stanza.getChild("error").getChild("text").getText() ||  "" : "";

            let error = data.getChild("error");
            if (error) {
                let errorType = error.attr("type");
                let errorCode = error.attr("code");
                if (errorType) {
                    errorMessage += (errorType + " : ");

                    if (errorType === "modify") {
                        errorMessage += error.getChild("text").getText() ||  "";
                    }
                }
                if (errorCode) {
                    if (errorCode === "503") {
                        errorMessage += "Agent error : service unavailable";
                    }
                }

                this.logger.log("error", LOG_ID + "[getErrorMessage] " );
                this.logger.log("internalerror", LOG_ID + "[getErrorMessage] : " + errorMessage);

            }
            else {
                errorMessage += "Unknown error";
            }

            return errorMessage;
        }
        return null;
    }

    getTelephonyState (secondary) {
        let that =this;
        return new Promise((resolve, reject) => {
            let stanza;
// <iq type='get' to='tel_38db98d2907a4c4095742a237b84557c@vberder-all-in-one-dev-1.opentouch.cloud/phone' xmlns='jabber:client' id='11b8b163-f317-42fd-9962-f1943d5adb21:sendIQ'>
// <callservice xmlns='urn:xmpp:pbxagent:callservice:1'>
// <connections/>
// </callservice>
// </iq>
            if (!secondary) {
                //iq = $iq({type: "get", to: service.userJidTel + "/phone"})
                    //.c("callservice", {xmlns: CALLSERVICE_NS})
                    //.c("connections");

                stanza = xml("iq", {
                    type: "get",
                    to: that.jid_tel + "/phone",
                    xmlns: NameSpacesLabels.ClientNameSpace,
                    "id": that.xmppUtils.getUniqueMessageId()
                }, xml("callservice", {"xmlns":  NameSpacesLabels.CallService1NameSpace}, xml("connections")));

            } else {
                stanza = xml("iq", {
                    type: "get",
                    to: that.jid_tel + "/phone",
                    //xmlns: NameSpacesLabels.ClientNameSpace,
                    "id": that.xmppUtils.getUniqueMessageId()
                }, xml("callservice", {"xmlns":  NameSpacesLabels.CallService1NameSpace}, xml("connections", {deviceType: "SECONDARY"})));
            }

                this.logger.log("internal", LOG_ID + "(getTelephonyState) send - 'iq get'", stanza.root().toString());
            this.xmppClient.sendIq(stanza).then((data)=> {
                this.logger.log("info", LOG_ID + "(getTelephonyState) received - 'iq result'");
                this.logger.log("internal", LOG_ID + "(getTelephonyState) received - 'iq result'", data);


                // Handle eventual error message
                let errorMessage = that.getErrorMessage(data, "getTelephonyState");
                if (errorMessage) {
                    this.logger.log("error", LOG_ID + "getTelephonyState -- failure -- " );
                    this.logger.log("internalerror", LOG_ID + "getTelephonyState -- failure -- : ", errorMessage);
                    return reject(new Error(errorMessage));
                }

                // Handle existing calls
                let existingCalls = that.xmppUtils.findChild(data, "connections");
                let children = {};
                if (existingCalls.children.length === 0) {
                    this.logger.log("debug", LOG_ID + "getTelephonyState -- success -- no existing call");
                } else {
                    children = existingCalls.children;
                }
                resolve(children);

            });
        });
    }

    sendPing() : Promise<any>{
        let that = this;
        if (this.useXMPP) {
            let id = that.xmppUtils.getUniqueMessageId();
            let stanza = xml("iq", {
                "type": "get",
                "id": id
            }, xml("ping", {xmlns: NameSpacesLabels.PingNameSpace}));

            this.logger.log("internal", LOG_ID + "(sendPing) send - 'message'", stanza.root().toString(), " for Rainbow Node SDK version : ", packageVersion.version );
            return this.xmppClient.send(stanza).catch((error) => {
                this.logger.log("error", LOG_ID + "(sendPing) error ");
                this.logger.log("internalerror", LOG_ID + "(sendPing) error : ", error);
                return error;
            });
        } else {
            this.logger.log("warn", LOG_ID + "(sendPing) No XMPP connection...");
        }
    }
// region Alerts

    async SendAlertMessage(alertMessage : AlertMessage) {

        let that = this;
        let uniqMessageId = that.xmppUtils.getUniqueMessageId();
        let uniqId = that.xmppUtils.getUniqueId(undefined);


        if (this.xmppClient != null) {
            // Create IM Message
            /* Sharp.Xmpp.Im.Message imMessage = new Sharp.Xmpp.Im.Message(alertMessage.ToJid, body, subject, null, Sharp.Xmpp.Im.MessageType.Headline);
             imMessage.Id = alertMessage.Id;
             imMessage.From = new Jid(alertMessage.FromJid + "/" + alertMessage.FromResource);
             // */

            let body = "text of the body";

            // Get 'root' XML node
            let root = xml("message", {
                //"from": this.fullJid,
                //"from": alertMessage.FromJid + "/" + alertMessage.FromResource,
                "to": alertMessage.toJid,
                "xmlns": NameSpacesLabels.ClientNameSpace,
                "type": TYPE_HEADLINE,
                "id": uniqMessageId
            }, xml("body", {}, body), xml("request", {
                    "xmlns": NameSpacesLabels.ReceiptsNameSpace
                }, xml("active", {
                    "xmlns": NameSpacesLabels.ChatestatesNameSpace
                })
            ));

            // let root = imMessage.Data;

            let elm;
            let subElm;

            // Create 'alert' node
            let xmlAlertElement = xml("alert", "http://www.incident.com/cap/1.0");

            if (!isNullOrEmpty(alertMessage.identifier)) {
                elm = xml("identifier").Text(alertMessage.identifier);
                xmlAlertElement.append(elm);
            }

            if (!isNullOrEmpty(alertMessage.sender)) {
                elm = xml("sender").Text(alertMessage.sender);
                xmlAlertElement.append(elm);
            }

//if (!isNullOrEmpty(alertMessage.Sent))
//{
            elm = xml("sent").Text(alertMessage.sent); //.ToUniversalTime().ToString("yyyy-MM-dd'T'HH:mm:ss-00:00"));
            xmlAlertElement.append(elm);
//}

            if (!isNullOrEmpty(alertMessage.status)) {
                elm = xml("status").Text(alertMessage.status);
                xmlAlertElement.append(elm);
            }

            if (!isNullOrEmpty(alertMessage.msgType)) {
                elm = xml("msgType").Text(alertMessage.msgType);
                xmlAlertElement.append(elm);
            }

            if (!isNullOrEmpty(alertMessage.references)) {
                elm = xml("references").Text(alertMessage.references);
                xmlAlertElement.append(elm);
            }

            if (!isNullOrEmpty(alertMessage.scope)) {
                elm = xml("scope").Text(alertMessage.scope);
                xmlAlertElement.append(elm);
            }

// Create 'info' node
            let xmlInfoElement = xml("info");

            if ((alertMessage.info != null) && (alertMessage.msgType != "Cancel")) {
                if (!isNullOrEmpty(alertMessage.info.category)) {
                    elm = xml("category").Text(alertMessage.info.category);
                    xmlInfoElement.append(elm);
                }

                if (!isNullOrEmpty(alertMessage.info.category)) {
                    elm = xml("event").Text(alertMessage.info.event);
                    xmlInfoElement.append(elm);
                }

                if (!isNullOrEmpty(alertMessage.info.category)) {
                    elm = xml("urgency").Text(alertMessage.info.urgency);
                    xmlInfoElement.append(elm);
                }

                if (!isNullOrEmpty(alertMessage.info.category)) {
                    elm = xml("certainty").Text(alertMessage.info.certainty);
                    xmlInfoElement.append(elm);
                }

                if (!isNullOrEmpty(alertMessage.info.category)) {
                    elm = xml("senderName").Text(alertMessage.info.senderName);
                    xmlInfoElement.append(elm);
                }

                if (!isNullOrEmpty(alertMessage.info.category)) {
                    elm = xml("description").Text(alertMessage.info.description);
                    xmlInfoElement.append(elm);
                }

                if (!isNullOrEmpty(alertMessage.info.category)) {
                    elm = xml("instruction").Text(alertMessage.info.instruction);
                    xmlInfoElement.append(elm);
                }

                if (!isNullOrEmpty(alertMessage.info.contact)) {
                    elm = xml("contact").Text(alertMessage.info.contact);
                    xmlInfoElement.append(elm);
                }

                if (!isNullOrEmpty(alertMessage.info.headline)) {
                    elm = xml("headline").Text(alertMessage.info.headline);
                    xmlInfoElement.append(elm);
                }

                elm = xml("expires").Text(alertMessage.info.expires); //.ToUniversalTime().ToString("yyyy-MM-dd'T'HH:mm:ss-00:00"));
                xmlInfoElement.append(elm);

                // Add resource node
                if (isNullOrEmpty(alertMessage.info.descriptionMimeType))
                    alertMessage.info.descriptionMimeType = "text/plain";

                elm = xml("resource");

                subElm = xml("mimeType").Text(alertMessage.info.descriptionMimeType);
                elm.append(subElm);

                subElm = xml("uri").Text("about:blank");
                elm.append(subElm);

                xmlInfoElement.append(elm);

                xmlAlertElement.append(xmlInfoElement);
            }
            root.append(xmlAlertElement);

// Send ImMessage
//xmppClient.SendMessage(imMessage);
            return await this.xmppClient.sendIq(root);
        }
// */
    }

// enregion Alerts

//region Mam
    mamQuery( jid, options) {
        let that = this;

        const MAM = "urn:xmpp:mam:1";
        const _p =  [ "with", "start", "end" ];

        let mamAttr = {xmlns: MAM, queryid: null};
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
            xmlns: NameSpacesLabels.ClientNameSpace
        }, xml("query", mamAttr, xml("x", {
            xmlns: NameSpacesLabels.DataNameSpace,
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
            xml("set", { xmlns:NameSpacesLabels.RsmNameSpace }, Object.keys(options).map((key)=> xml( key, {}, options[key] /*? options[key] : null*/)))
        ));

        that.logger.log("info", LOG_ID + "(handleXMPPConnection) mamQuery - 'stanza'");
        that.logger.log("internal", LOG_ID + "(handleXMPPConnection) mamQuery - 'stanza'", stanza.toString());
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

        let mamAttr = {xmlns: MAM, queryid: null};
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
            xmlns: NameSpacesLabels.ClientNameSpace
        }, xml("query", mamAttr, xml("x", {
            xmlns: NameSpacesLabels.DataNameSpace,
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
            xml("set", { xmlns:NameSpacesLabels.RsmNameSpace }, Object.keys(options).map((key)=> xml( key, {}, options[key] ? options[key] : null)))
        ));

        that.logger.log("info", LOG_ID + "(handleXMPPConnection) mamQueryMuc - 'stanza'");
        that.logger.log("internal", LOG_ID + "(handleXMPPConnection) mamQueryMuc - 'stanza'", stanza.toString());
        that.xmppClient.send(stanza).then(() => {
            if ( typeof onComplete === "function" ) {
                onComplete();
            }
        });
    }

    mamDelete(options) {

        let that = this;
        const MAM = "urn:xmpp:mam:1";
        const _p =  [ "with", "start", "end" ];

        let mamAttr = {xmlns: MAM, deleteid: null};
        if (Boolean(options.deleteid)) {
            mamAttr.deleteid = options.deleteid;
            delete options.deleteid;
        }

        let onMessage = options.onMessage;
        delete options.onMessage;
        let onComplete = options.onComplete;
        delete options.onComplete;

        options.queryid = that.xmppUtils.getUniqueMessageId();

        let id = that.xmppUtils.getUniqueMessageId();

        let stanza = xml("iq", {
            "type": "set",
            id: id,
            xmlns: NameSpacesLabels.ClientNameSpace
        }, xml("delete", mamAttr, xml("x", {
            xmlns: NameSpacesLabels.DataNameSpace,
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
            xml("set", { xmlns:NameSpacesLabels.RsmNameSpace }, Object.keys(options).map((key)=> xml( key, {}, options[key] ? options[key] : null)))
        ));

        that.logger.log("info", LOG_ID + "(handleXMPPConnection) mamDelete - 'stanza'");
        that.logger.log("internal", LOG_ID + "(handleXMPPConnection) mamDelete - 'stanza'", stanza.toString());
        that.xmppClient.send(stanza).then((result) => {
             if ( typeof onComplete === "function" ) {
                 onComplete(result);
             }
        });
    }
//endregion mam
    // Voice Messages
    voiceMessageQuery(jid) {
        let that = this;

        /*
                    // Create the iq request
            let iq = $iq({type: "get", to: that.userJidTel + "/phone"})
                .c("callservice", {xmlns: NameSpacesLabels.CallService1NameSpace})
                .c("messaging");
         */

        let nsAttr = {xmlns: NameSpacesLabels.CallService1NameSpace};

        let stanza = xml("iq", {
            "type": "set",
            "to": jid + "/phone"
        }, xml("callservice", nsAttr,
            xml("messaging"))
        );

        return new Promise((resolve,reject) => {
            that.logger.log("info", LOG_ID + "(handleXMPPConnection) voiceMessageQuery - 'stanza'");
            that.logger.log("internal", LOG_ID + "(handleXMPPConnection) voiceMessageQuery - 'stanza'", stanza.toString());
            that.xmppClient.send(stanza).then((data) => {
                resolve(data);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

}

export { XMPPService, NameSpacesLabels };
module.exports.XMPPService = XMPPService;
module.exports.NameSpacesLabels = NameSpacesLabels;

