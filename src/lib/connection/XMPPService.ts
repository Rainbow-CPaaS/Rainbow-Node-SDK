"use strict";

import * as util from "util";
import {
    equalIgnoreCase, getJsonFromXML,
    isNullOrEmpty,
    isNumber,
    isStarted,
    logEntryExit,
    makeId, randomString,
    setTimeoutPromised
} from "../common/Utils";
import * as PubSub from "pubsub-js";
import {Conversation} from "../common/models/Conversation";
import {XMPPUTils} from "../common/XMPPUtils";

import {IQEventHandler} from "./XMPPServiceHandler/iqEventHandler";
import {XmppClient} from "../common/XmppQueue/XmppClient";
import { AlertMessage } from "../common/models/AlertMessage";
import {DataStoreType} from "../config/config";
import {GenericService} from "../services/GenericService";
import {domainToASCII} from "url";
import { HttpoverxmppEventHandler } from "./XMPPServiceHandler/httpoverxmppEventHandler";
import { RpcoverxmppEventHandler } from "./XMPPServiceHandler/rpcoverxmppEventHandler";
import {Core} from "../Core.js";
import {ConversationHistoryHandler} from "./XMPPServiceHandler/conversationHistoryHandler.js";
import {CallLogEventHandler} from "./XMPPServiceHandler/calllogEventHandler.js";

const packageVersion = require("../../package");
const url = require('url');
const prettydata = require("./pretty-data").pd;
const parse = require('ltx').parse;

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

const {HttpsProxyAgent} = require("https-proxy-agent");

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
const MAX_PING_ANSWER_TIMER = 10000;


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
    "IncidentCap" : "http://www.incident.com/cap/1.0",
    "MonitoringNS" : "urn:xmpp:monitoring:0",
    "XmppHttpNS" : "urn:xmpp:http",
    "protocolShimNS" : "http://jabber.org/protocol/shim",
    "XmppFraming": "urn:ietf:params:xml:ns:xmpp-framing",
    "RPC": "jabber:iq:rpc",
    "RainbowCpaaSMessage":"jabber:iq:rainbow:cpaas:message"
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
        public _logger: any;
        public proxy: any;
        public shouldSendReadReceipt: any;
        public useXMPP: any;
        public timeBetweenXmppRequests: any;
        public maxPendingAsyncLockXmppQueue: any;
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
        public httpoverxmppEventHandler: HttpoverxmppEventHandler;
        public rpcoverxmppEventHandler: RpcoverxmppEventHandler;
        public conversationHistoryHandler: ConversationHistoryHandler;
        public calllogEventHandler: CallLogEventHandler;
        public xmppUtils : XMPPUTils;
    private shouldSendMessageToConnectedUser: any;
    private storeMessages: boolean;
    private copyMessage: boolean;
    private enablesendurgentpushmessages: boolean;
    private useMessageEditionAndDeletionV2: boolean;
    private rateLimitPerHour: number;
    private messagesDataStore: DataStoreType;
    private raiseLowLevelXmppInEvent: boolean;
    private raiseLowLevelXmppOutReq: boolean;
    private maxIdleTimer: number;
    private maxPingAnswerTimer: number;
    private company: any;
    private xmppRessourceName: string;
//    private _core: Core;

    static getClassName(){ return 'XMPPService'; }
    getClassName(){ return XMPPService.getClassName(); }

    static getAccessorName(){ return 'xmpp'; }
    getAccessorName(){ return XMPPService.getAccessorName(); }

    constructor(_core, _xmpp, _im, _application, _eventEmitter, _logger, _proxy, _rest, _options) {
        super(_logger, LOG_ID);
        this.setLogLevels(this);
        let that = this;
        that.serverURL = _xmpp.protocol + "://" + _xmpp.host + ":" + _xmpp.port + "/websocket";
        that.host = _xmpp.host;
        that.eventEmitter = _eventEmitter;
        that.version = "0.1";
        that.jid_im = "";
        that.jid_tel = "";
        that.jid_password = "";
        that.fullJid = "";
        that.jid = "";
        that.userId = "";
        that.resourceId = "";
        that.initialPresence = true;
        that.xmppClient = null;
        that._rest = _rest;
        that._logger = _logger;
        that.proxy = _proxy;
        that._core = _core;
        that.shouldSendReadReceipt = _im.sendReadReceipt;
        that.shouldSendMessageToConnectedUser = _im.sendMessageToConnectedUser;
        that.storeMessages = _im.storeMessages;
        that.copyMessage = _im.copyMessage;
        that.enablesendurgentpushmessages = _im.enablesendurgentpushmessages;
        that.useMessageEditionAndDeletionV2 = _im.useMessageEditionAndDeletionV2;
        that.rateLimitPerHour = _im.rateLimitPerHour;
        that.messagesDataStore = _im.messagesDataStore;
        that.useXMPP = true;
        that.timeBetweenXmppRequests = _xmpp.timeBetweenXmppRequests;
        that.maxPendingAsyncLockXmppQueue = _xmpp.maxPendingAsyncLockXmppQueue;
        that.isReconnecting = false;
        that.maxAttempts = 1;
        that.idleTimer = null;
        that.pingTimer = null;
        that.forceClose = false;
        that.applicationId = _application.appID;
        that.raiseLowLevelXmppInEvent = _xmpp.raiseLowLevelXmppInEvent;
        that.raiseLowLevelXmppOutReq = _xmpp.raiseLowLevelXmppOutReq;
        that.maxIdleTimer = ( _xmpp.maxIdleTimer && (_xmpp.maxIdleTimer > 10000) )? _xmpp.maxIdleTimer: MAX_IDLE_TIMER;
        that.maxPingAnswerTimer = ( _xmpp.maxPingAnswerTimer && (_xmpp.maxPingAnswerTimer > 5000) ) ? _xmpp.maxPingAnswerTimer : MAX_PING_ANSWER_TIMER;
        that.xmppRessourceName = _xmpp.xmppRessourceName;

        that._startConfig =  {
            start_up: true,
            optional: false
        };

        that.xmppUtils = XMPPUTils.getXMPPUtils();

        that.generatedRandomId = that.xmppUtils.generateRandomID();

        that.hash = makeId(8);
        that._options = _options;
    }

    start(withXMPP) {
        let that = this;
        that.forceClose = false;
        that.initStartDate();

        return new Promise(function (resolve, reject) {
            try {

                //that._logger.log(that.INFO, LOG_ID + "(start) path to require https-proxy-agent :", require.resolve('https-proxy-agent'), ", HttpsProxyAgent : ", HttpsProxyAgent);
                
                if (withXMPP) {
                    that._logger.log(that.DEBUG, LOG_ID + "(start) XMPP host used : ", that.host);
                    that._logger.log(that.INFO, LOG_ID + "(start) XMPP serverURL : ", that.serverURL);
                } else {
                    that._logger.log(that.INFO, LOG_ID + "(start) XMPP connection blocked by configuration");
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

    async signin(account, headers) {
        let that = this;
        return new Promise(async function (resolve) {
            that.IQEventHandlerToken = [];
            that.eventEmitter.once("xmppconnected", function fn_xmppconnected(info) {
                that._logger.log(that.INFO, LOG_ID + "(signin) (xmppconnected) received : ", info);
                that.eventEmitter.removeListener("xmppconnected", fn_xmppconnected);
                resolve(undefined);
            });
            if (that.useXMPP) {
                that.jid_im = account.jid_im;
                that.jid_tel = account.jid_tel;
                that.jid_password = account.jid_password;
                that.userId = account.id;
                //that.resourceId =  "/node_" + that.generatedRandomId ;
                if (that.xmppRessourceName) {
                    that.fullJid = that.xmppUtils.generateRandomFullJidForNode(that.jid_im, that.xmppRessourceName);
                    that.resourceId = "node_" + that.xmppRessourceName;
                } else {
                    that.fullJid = that.xmppUtils.generateRandomFullJidForNode(that.jid_im, that.generatedRandomId);
                    that.resourceId = "node_" + that.generatedRandomId;
                }
                that.jid = account.jid_im;
                
                that.company = account.company;

                that._logger.log(that.INTERNAL, LOG_ID + "(signin) account used, jid_im : ", that.jid_im, ", fullJid : ", that.fullJid);

                that.IQEventHandler = new IQEventHandler(that);
                that.httpoverxmppEventHandler = new HttpoverxmppEventHandler(that, that._rest, that._options);
                that.rpcoverxmppEventHandler = new RpcoverxmppEventHandler(that, that._rest, that._options, that._core._rpcoverxmpp);
                that.conversationHistoryHandler = that._core.conversations.conversationHistoryHandler;
                that.calllogEventHandler = that._core.calllog.calllogEventHandler;

                that.IQEventHandlerToken = [
                    PubSub.subscribe(that.hash + "." + that.IQEventHandler.IQ_GET, that.IQEventHandler.onIqGetSetReceived.bind(that.IQEventHandler)),
                    PubSub.subscribe(that.hash + "." + that.IQEventHandler.IQ_SET, that.IQEventHandler.onIqGetSetReceived.bind(that.IQEventHandler)),
                    PubSub.subscribe(that.hash + "." + that.IQEventHandler.IQ_RESULT, that.IQEventHandler.onIqResultReceived.bind(that.IQEventHandler))
                ];

                await that.handleXMPPConnection(headers);
                that.IQEventHandlerToken.push(PubSub.subscribe(that.hash + "." + that.IQEventHandler.IQ_RESULT, that.xmppClient.onIqResultReceived.bind(that.xmppClient)));
                that.IQEventHandlerToken.push(PubSub.subscribe(that.hash + "." + that.IQEventHandler.IQ_ERROR, that.xmppClient.onIqErrorReceived.bind(that.xmppClient)));

                that.IQEventHandlerToken.push(PubSub.subscribe(that.hash + "." + that.httpoverxmppEventHandler.IQ_GET, that.httpoverxmppEventHandler.onIqGetSetReceived.bind(that.httpoverxmppEventHandler)));
                that.IQEventHandlerToken.push(PubSub.subscribe(that.hash + "." + that.httpoverxmppEventHandler.IQ_SET, that.httpoverxmppEventHandler.onIqGetSetReceived.bind(that.httpoverxmppEventHandler)));
                that.IQEventHandlerToken.push(PubSub.subscribe(that.hash + "." + that.httpoverxmppEventHandler.IQ_RESULT, that.httpoverxmppEventHandler.onIqResultReceived.bind(that.httpoverxmppEventHandler)));
                

                that.IQEventHandlerToken.push(PubSub.subscribe(that.hash + "." + that.rpcoverxmppEventHandler.IQ_GET, that.rpcoverxmppEventHandler.onIqGetSetReceived.bind(that.rpcoverxmppEventHandler)));
                that.IQEventHandlerToken.push(PubSub.subscribe(that.hash + "." + that.rpcoverxmppEventHandler.IQ_SET, that.rpcoverxmppEventHandler.onIqGetSetReceived.bind(that.rpcoverxmppEventHandler)));
                that.IQEventHandlerToken.push(PubSub.subscribe(that.hash + "." + that.rpcoverxmppEventHandler.IQ_RESULT, that.rpcoverxmppEventHandler.onIqResultReceived.bind(that.rpcoverxmppEventHandler)));

                that.IQEventHandlerToken.push(PubSub.subscribe(that.hash + "." + that.conversationHistoryHandler.IQ_RESULT, that.conversationHistoryHandler.onIqResultReceived.bind(that.conversationHistoryHandler)));
                that.IQEventHandlerToken.push(PubSub.subscribe(that.hash + "." + that.calllogEventHandler.IQ_RESULT, that.calllogEventHandler.onIqResultReceived.bind(that.calllogEventHandler)));

                that.startOrResetIdleTimer();
                //resolve(undefined);
            } else {
                resolve(undefined);
            }
        });
    }

    stop(forceStop) {
        let that = this;
        return new Promise(async function (resolve) {
            try {
                that.jid_im = "";
                that.jid_tel = "";
                that.jid_password = "";
                that.fullJid = "";
                that.userId = "";
                that.initialPresence = true;
                that._logger.log(that.INFO, LOG_ID + "(stop) __ entering __ stop XMPP connection");
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
                        that._logger.log(that.DEBUG, LOG_ID + "(stop) stop XMPP auto-reconnect mode");
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

                        that._logger.log(that.INFO, LOG_ID + "(stop) send Unavailable Presence- send - 'message'", stanza.root().toString());
                        //that._logger.log(that.INTERNAL, LOG_ID + "(stop) send Unavailable Presence- send - 'message'", stanza.root().toString());
                        await that.xmppClient.send(stanza).catch((err) => {
                            that._logger.log(that.WARN, LOG_ID + "(stop) send failed to send Unavailable Presence, error : ", err);
                        });

                        that.xmppClient.stop().then(() => {
                            that._logger.log(that.DEBUG, LOG_ID + "(stop) stopped XMPP connection");
                            that.xmppClient = null;
                            //that.setStopped();
                            resolve(undefined);
                        }).catch((err) => {
                            that._logger.log(that.DEBUG, LOG_ID + "(stop) error received");
                            that._logger.log(that.INTERNALERROR, LOG_ID + "(stop) error received : ", err);
                            resolve(undefined);
                        });
                    } else {
                        that._logger.log(that.DEBUG, LOG_ID + "(stop) nothing to stop that.xmppClient : ", that.xmppClient);
                        resolve(undefined);
                    }
                } else {
                    that._logger.log(that.DEBUG, LOG_ID + "(stop) nothing to stop, that.useXMPP : ", that.useXMPP, ", forceStop : ", forceStop) ;
                    resolve(undefined);
                }
            } catch (err) {
                that._logger.log(that.DEBUG, LOG_ID + "(stop) error received");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(stop) error received : ", err);
                resolve(undefined);
            }
        });
    }

    startOrResetIdleTimer(incomingStanza = false) {
        let that = this;
        if ((that.pingTimer && !incomingStanza) || (that.reconnect && that.reconnect.isReconnecting)) {
            that._logger.log(that.DEBUG, LOG_ID + "(startOrResetIdleTimer) ignored with that.pingTimer.triggerId : ", that.pingTimer ? that.pingTimer.triggerId : "", ", incomingStanza : ", incomingStanza, ", that.reconnect.isReconnecting : ", that.reconnect.isReconnecting );
            return;
        }
        that.stopIdleTimer();
        if (!that.forceClose) {
            that._logger.log(that.DEBUG, LOG_ID + "(startOrResetIdleTimer) forceClose not setted, so start setTimeout of idle Timer for ping.");
            that.idleTimer = setTimeout(() => {
                that._logger.log(that.DEBUG, LOG_ID + "(startOrResetIdleTimer) idleTimer elapsed. No message received since " + that.maxIdleTimer / 1000 + " seconds, so send a ping iq request and start setTimeout of ping Timer for waiting result.");
                // Start waiting an answer from server else reset the connection
                that.pingTimer = setTimeout(() => {
                    that.pingTimer = null;
                    that._logger.log(that.DEBUG, LOG_ID + "(startOrResetIdleTimer) first pingTimer elapsed after that.maxPingAnswerTimer (", that.maxPingAnswerTimer, " seconds). retry a ping iq request before decide it is a fatal error!");
                    that.pingTimer = setTimeout(async () => {
                        /*let err = {
                            "condition": "No data received from server since " + ((that.maxIdleTimer + that.maxPingAnswerTimer * 2) / 1000) + " secondes. The XMPP link is badly broken, so the application needs to destroy and recreate the SDK, with fresh start(...)."
                        };
                        that._logger.log(that.ERROR, LOG_ID + "(startOrResetIdleTimer) second pingTimer elapsed after that.maxPingAnswerTimer (", that.maxPingAnswerTimer, " seconds). forceClose not setted, FATAL no reconnection for condition : ", err.condition, ", error : ", err);
                        // */
                        that._logger.log(that.ERROR, LOG_ID + "(startOrResetIdleTimer) second pingTimer elapsed after that.maxPingAnswerTimer (", that.maxPingAnswerTimer, " seconds). close the socket. : ");
                        if (that.xmppClient.socket != null) {
                            that.xmppClient.socket.end();
                        }
                        if (that.reconnect) {
                            if (that.reconnect.isReconnecting) {
                                that._logger.log(that.DEBUG, LOG_ID + "(startOrResetIdleTimer) the SDK is that.reconnect.isReconnecting : ", that.reconnect.isReconnecting, " so only stop the idle timer");
                                that.stopIdleTimer();
                            } else {
                                that._logger.log(that.INFO, LOG_ID + "(startOrResetIdleTimer) SDK is NOT reconnecting, so try to reconnect...");
                                await that.reconnect.reconnect().catch((err) => {
                                    that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) Error while reconnect : ", err);
                                });                            }
                        } else {
                            that._logger.log(that.ERROR, LOG_ID + "(startOrResetIdleTimer) that.reconnect is undefined, so reconnection is not possible. Raise a FATAL error.");
                            let err = {
                                code : -1,
                                label: "that.reconnect is undefined, so reconnection is not possible. Raise a FATAL error."
                            }
                            that.eventEmitter.emit("evt_internal_xmppfatalerror", err);
                        }

                        /*
                        // Disconnect the auto-reconnect mode
                        if (that.reconnect) {
                            that._logger.log(that.DEBUG, LOG_ID + "(startOrResetIdleTimer) stop XMPP auto-reconnect mode");
                            that.reconnect.stop();
                            that.reconnect = null;
                        }

                        that.eventEmitter.emit("evt_internal_xmppfatalerror", err);
                        // */
                    }, that.maxPingAnswerTimer);
                    that.sendPing();
                }, that.maxPingAnswerTimer);
                that.sendPing();
            }, that.maxIdleTimer);
        } else {
            that._logger.log(that.DEBUG, LOG_ID + "(startOrResetIdleTimer) forceClose setted so do not send ping.");
        }
    }

    stopIdleTimer() {
        let that = this;
        that._logger.log(that.DEBUG, LOG_ID + "(stopIdleTimer).");
        if (that.idleTimer) {
            clearTimeout(that.idleTimer);
            that.idleTimer = null;
        }
        if (that.pingTimer) {
            clearTimeout(that.pingTimer);
            that.pingTimer = null;
        }
    }

    mockStanza(stanza) {
        let that = this;
        that.xmppClient.emit(STANZA_EVENT, stanza);
        that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) mockStanza - STANZA_EVENT : " + STANZA_EVENT + " | ", stanza.toString());
    }


    fn_input (stanzaStr) {
        let that = this;

        //let jsonStanzaIn = getJsonFromXML(stanzaStr);

        // that._logger.log("info", LOG_ID + "(handleXMPPConnection) raw in - Before offendXml");
        let stanzaElmt : any = parse(stanzaStr);
        let stanzaElmtOffended = that.xmppUtils.offendXml(stanzaElmt);
        let xmlOffendedStr = prettydata.xml(stanzaElmtOffended.toString());
        that._logger.log(that.XMPP, LOG_ID + "(handleXMPPConnection) ", that._logger.colors.cyan(" raw in - ⮈ stanza : ") + that._logger.colors.cyan(xmlOffendedStr));
        //that._logger.log(that.XMPP, LOG_ID + "(handleXMPPConnection) raw in - After offendXml");

        let xmlStr="";
        if ( that._logger.enableEncryptedLogs == true || that.raiseLowLevelXmppInEvent) {
            //that._logger.log(that.XMPP, LOG_ID + "(handleXMPPConnection) raw in - Before prettydata");
            let xmlStr = prettydata.xml(stanzaStr);
            //that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) ", that._logger.colors.cyan(" raw in - ⮈ stanza : ") + that._logger.colors.cyan(xmlStr));
            //that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) ", that._logger.colors.cyan(" raw in - ⮈ stanza : ") + that._logger.colors.cyan(xmlStr));
            that._logger.log(that.XMPP, LOG_ID + "(handleXMPPConnection) ", that._logger.colors.cyan(" raw in - ⮈ stanza : ") + that._logger.colors.cyan(xmlStr));
            //that._logger.log(that.XMPP, LOG_ID + "(handleXMPPConnection) raw in - After prettydata");
            // */
        }
        if ( that._logger.enableEncryptedLogs == true ) {
            let encodedXml = that._logger.encrypt(xmlStr);
            that._logger.log(that.XMPP, LOG_ID + "(handleXMPPConnection) ", " raw in - encoded : (" + encodedXml + ")");
            that._logger.log(that.XMPP, LOG_ID + "(handleXMPPConnection) ", that._logger.colors.yellow(" raw in - decoded : <") + that._logger.decrypt(encodedXml) + ">");
        }
        that.startOrResetIdleTimer(true);
        if (that.raiseLowLevelXmppInEvent ) {
            that.eventEmitter.emit("evt_internal_xmmpeventreceived", xmlStr);
        }
        //that._logger.log(that.XMPP, LOG_ID + "(handleXMPPConnection)  raw in - exit__");
    }

    async fn_STANZA_EVENT (stanza) {
        let that =this;
        that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) event - STANZA_EVENT : " + STANZA_EVENT + " | ", stanza.toString());

        let prettyStanza = stanza.root ? prettydata.xml(stanza.root().toString()) : stanza;
        let xmlNodeStr = stanza ? stanza.toString():"<xml></xml>";
        let jsonStanza = await getJsonFromXML(xmlNodeStr);

        let eventId = that.hash + "." + stanza.getNS() + "." + stanza.getName() + (stanza.attrs.type ? "." + stanza.attrs.type : "");
        that._logger.log(that.DEBUG, LOG_ID + "(handleXMPPConnection) event - STANZA_EVENT : eventId ", eventId);
        let delivered = PubSub.publish(eventId, [stanza, prettyStanza, jsonStanza]);

        /*
        stanza.children.forEach((child) => {
            let eventIdForChilds = that.hash + "." + child.getNS() + "." + child.getName() + (child.attrs.type ? "." + child.attrs.type : "");
            that._logger.log(that.DEBUG, LOG_ID + "(handleXMPPConnection) event - STANZA_EVENT : eventIdForChilds : ", eventIdForChilds);
            delivered |= PubSub.publish(eventIdForChilds,  [stanza, prettyStanza, jsonStanza]);
        }); // */

        if (!delivered) {
            that._logger.log(that.ERROR, LOG_ID + "(handleXMPPConnection) event - STANZA_EVENT : " + STANZA_EVENT + " not managed | ", stanza.getNS() + "." + stanza.getName() + (stanza.attrs.type ? "." + stanza.attrs.type : ""));
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
                    //that._logger.log(that.ERROR, LOG_ID + "(handleXMPPConnection) something goes wrong...");
                } else if (stanza.attrs.type === "headline") {

                    // that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) channel message received");

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
                                //that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) server receipt received");
                                that.eventEmitter.emit("evt_internal_onreceipt", receipt);
                                break;
                            default:
                                break;
                        }
                    });
                }
                break;
            case "presence":
                that._logger.log(that.DEBUG, LOG_ID + "(handleXMPPConnection) presence received : ", prettyStanza);
                break;
            case "close":
                that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) close received : ", prettyStanza);
                break;
            default:
                that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) not managed - 'stanza' : ", stanza.getName());
                break;
        }
    }

    async handleXMPPConnection (headers) {

        let that = this;

        let domain = that.xmppUtils.getDomainFromFullJID(that.fullJid);

        let options = {agent: null};
        //Object.assign(options, headers); // headers not supoorted by xmpp/client. Needs to put it with query param in url.
        let opt = url.parse(that.proxy.proxyURL);
        if (that.proxy.isProxyConfigured ) {
            if (that.proxy.secureProtocol) {
                opt.secureProxy = true;
            }
            // Until web proxy on websocket solved, patch existing configuration to offer the proxy options
            options.agent = new HttpsProxyAgent(opt);
            //options.agent = new HttpsProxyAgent(that.proxy.proxyURL);
            ws_options = options;
        }

        /*
        that.xmppClient = new Client({
            "jid": that.fullJid,
            "password": that.jid_password,
            "host": that.host,
            "websocket": {
                "url": that.serverURL + "?x-rainbow-xmpp-dom=" + domain,
                "options": options
            }
        }); // */

        //"domain": {enter(node) {
        //}, exit(node){}},
        // GET /websocket?x-rainbow-client=web_sdk&x-rainbow-client-version=v2.0.1-lts&x-rainbow-xmpp-dom=openrainbow.net
        let urlToConnect = that.serverURL + "?x-rainbow-xmpp-dom=" + domain;
                    
        if (headers.headers["x-rainbow-client"]) {
            urlToConnect += "&x-rainbow-client=" + headers.headers["x-rainbow-client"];
        }
        if (headers.headers["x-rainbow-client-version"]) {
            urlToConnect += "&x-rainbow-client-version=" + headers.headers["x-rainbow-client-version"];
        }
        if (headers.headers["x-rainbow-client-id"]) {
            urlToConnect += "&x-rainbow-client-id=" + headers.headers["x-rainbow-client-id"];
        }
        let xmppLinkOptions = {
            "service": urlToConnect,
            "domain": domain,
            "resource": that.resourceId,
            "username": this.xmppUtils.getRoomJIDWithOutDomainFromFullJID(that.jid),
            "password": that.jid_password,
            "options": options
            //"mechanisms": ["SCRAM-SHA-1"]
        };

        that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) ", " xmppLinkOptions : ", xmppLinkOptions);

        that.xmppClient = new Client(xmppLinkOptions); //"domain": domain,
// */

        await that.xmppClient.init(that._logger, that.eventEmitter, that.timeBetweenXmppRequests, that.storeMessages, that.rateLimitPerHour, that.messagesDataStore, that.copyMessage, that.enablesendurgentpushmessages, that.maxPendingAsyncLockXmppQueue);

        //that.reconnect = that.xmppClient.plugin(require("@xmpp/plugins/reconnect"));
        that.reconnect = that.xmppClient.reconnect;

        that.reconnect.delay = RECONNECT_INITIAL_DELAY;

        that.fibonacciStrategy = new backoff.FibonacciStrategy({
            randomisationFactor: 0.4,
            initialDelay: RECONNECT_INITIAL_DELAY,
            maxDelay: RECONNECT_MAX_DELAY
        });

        //const sasl = that.xmppClient.plugins.sasl;
        /*const sasl = that.xmppClient.sasl;
        sasl.getMechanism = mechs => {
            return "PLAIN"; // Force plain sasl
        }; // */
        that.xmppClient.setgetMechanism((mechs) => {
            return "PLAIN"; // Force plain sasl
        });


        /*
        that.xmppClient.handle(AUTHENTICATE_EVENT, authenticate => {
            return authenticate(that.fullJid, that.jid_password);
        });

        that.xmppClient.handle(BIND_EVENT, (bind) => {
            return bind(that.xmppUtils.getResourceFromFullJID(that.fullJid));
        }); // */

        /*
                "raiseLowLevelXmppInEvent": true,
        "raiseLowLevelXmppOutReq": true
         */
        
        that.xmppClient.on("input", this.fn_input.bind(this));

        that.xmppClient.on("element", function fn_input (elmt) {
          //  that._logger.log(that.DEBUG, LOG_ID + "(handleXMPPConnection) ", that._logger.colors.cyan(" element event stanza : ") + that._logger.colors.cyan(elmt));
        });

        that.xmppClient.on("output", function fn_output (stanzaStr) {
            let stanzaElmt : any = parse(stanzaStr);
            let stanzaElmtOffended = that.xmppUtils.offendXml(stanzaElmt);
            let xmlOffendedStr = prettydata.xml(stanzaElmtOffended.toString());
            that._logger.log(that.XMPP, LOG_ID + "(handleXMPPConnection) ", that._logger.colors.cyan(" raw out - ⮊ stanza : ") + that._logger.colors.cyan(xmlOffendedStr));

            let xmlStr = prettydata.xml(stanzaStr);
            //that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) ", that._logger.colors.yellow(" raw out - ⮊ stanza : ") + that._logger.colors.yellow(xmlStr));
            that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) ", that._logger.colors.yellow(" raw out - ⮊ stanza : ") + that._logger.colors.yellow(xmlStr));
            if ( that._logger.enableEncryptedLogs == true ) {
                let encodedXml = that._logger.encrypt(xmlStr);
                that._logger.log(that.XMPP, LOG_ID + "(handleXMPPConnection) ", " raw out - encoded : (" + encodedXml + ")");
                that._logger.log(that.XMPP, LOG_ID + "(handleXMPPConnection) ", that._logger.colors.yellow(" raw out - decoded : <") + that._logger.decrypt(encodedXml) + ">");
            }
            that.startOrResetIdleTimer(false);
            if (that.raiseLowLevelXmppOutReq ) {
                that.eventEmitter.emit("evt_internal_xmpprequestsent", xmlStr);
            }
        });

        that.xmppClient.on(ONLINE_EVENT, function fn_ONLINE_EVENT (msg) {
            that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) event - ONLINE_EVENT : " + ONLINE_EVENT + " | ", msg);
            that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) connected as ", msg);
            
            if (that.company && (that.company.isMonitorable == true )) {
                // send monitoring iq.
                /* 
                <iq xmlns="jabber:client" from="romeo@montague.example/garden" id="123456" type="set" >
  <enable xmlns="urn:xmpp:monitoring:0" companyId="60ae30f1334f9a0741e4102f"/>
</iq>
                 */
                let companyId = that.company.id;
                that._logger.log(that.DEBUG, LOG_ID + "(handleXMPPConnection) Send subscribe monitoring. companyId : ", companyId);
                let stanza = xml("iq", {
                    type: "set",
                    //"to": domain,
                    xmlns: NameSpacesLabels.ClientNameSpace,
                    "id": that.xmppUtils.getUniqueMessageId()
                }, xml("enable", { "companyid" : companyId, "xmlns": NameSpacesLabels.MonitoringNS}));

                that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) send - 'iq set' : ", stanza.root().toString());
                that.xmppClient.sendIq(stanza);
            }
            
            if (!that.isReconnecting) {
                that.eventEmitter.emit("xmppconnected");
            }
        });

        that.xmppClient.on(STATUS_EVENT, function fn_STATUS_EVENT (status, value) {
            that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) event - STATUS_EVENT : " + STATUS_EVENT + " | ", status,  " | ", value ? value.toString() : "");
            //that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) event - STATUS_EVENT : " + STATUS_EVENT + " | ", status,  " | ", value?.name , value ? util.inspect(value, false, null, true) : "");
            /* if (msg === "closing") {
                 that.xmppClient.restartConnect().then((res) => {
                     that._logger.log(that.DEBUG, LOG_ID + "(handleXMPPConnection) restartConnect result : ", res);
                 }).catch((err) => {
                     that._logger.log(that.ERROR, LOG_ID + "(handleXMPPConnection) restartConnect error : ", err);
                 }).then(() => {
                     that._logger.log(that.DEBUG, LOG_ID + "on STATUS_EVENT ");
                 });
             } // */
        });

        that.xmppClient.on(STANZA_EVENT, that.fn_STANZA_EVENT.bind(that));

        that.xmppClient.on(ERROR_EVENT, async function fn_ERROR_EVENT (err) {
            if (err.code === "HPE_INVALID_CONSTANT") {
                return;
            }
            that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : " + ERROR_EVENT + " | condition : ", err.condition, " | error : ", err);
            //that._logger.log(that.DEBUG, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : " + ERROR_EVENT + " | ", util.inspect(err.condition || err));
            if (that.reconnect && err) {
                try {
                    // Condition treatments for XEP Errors : https://xmpp.org/rfcs/rfc6120.html#streams-error
                    switch (err.condition) {
                            // Conditions which need a reconnection
                        case "remote-connection-failed":
                        case "reset":
                        case "connection-timeout":
                        case "system-shutdown":
                            that.stopIdleTimer();
                            let waitime = 21 + Math.floor(Math.random() * Math.floor(15));
                            that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT :  wait ", waitime, " seconds before try to reconnect");
                            await setTimeoutPromised(waitime);
                            if (!that.isReconnecting) {
                                that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : try to reconnect...");
                                await that.reconnect.reconnect().catch((err) => {
                                    that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) Error while reconnect : ", err);
                                });
                            } else {
                                that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : Do nothing, already trying to reconnect...");
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
                        case "restricted-xml":
                        case "undefined-condition":
                        case "unsupported-encoding":
                        case "unsupported-feature":
                        case "unsupported-stanza-type":
                            that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : for condition : ", err.condition, ", error : ", err);
                            that.eventEmitter.emit("evt_internal_xmpperror", err);
                            break;
                            // Conditions which are fatal errors and then need to stop the SDK.
                        case "see-other-host":
                            that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : FATAL condition : ", err.condition, " is not supported the SDK");
                        case "conflict":
                            if (err.condition === "Replaced by new connection") {
                                that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : FATAL no reconnection this error is generated if another clients starts new session with same resource as existing client (since each client must have unique resource if new clients connects with resource that existing session already used, that old session will be terminated) for condition : ", err.condition, ", error : ", err);
                            }
                        case "policy-violation":
                            if (err.condition == "policy-violation" && err.text!="has been kicked") {
                                that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : Not fatal for condition : ", err.condition, " because text is different than \"Max sessions reached\", error : ", err);
                                that.eventEmitter.emit("evt_internal_xmpperror", err);
                                break;
                            }
                        case "resource-constraint":
                            if (err.condition == "resource-constraint" && err.text!="Max sessions reached") {
                                that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : Not Fatal for condition : ", err.condition, " because text is different than \"Max sessions reached\", error : ", err);
                                that.eventEmitter.emit("evt_internal_xmpperror", err);
                                break;
                            } else {
                                that._logger.log(that.ERROR, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : Fatal for condition : ", err.condition, " text is \"Max sessions reached\", so the maximum of different XMPP ressources connected to server is reached (A user can only be connected simultaneously 5 times to XMPP Server). ", err);
                            }
                        case "unsupported-version":
                            that.stopIdleTimer();
                            // Disconnect the auto-reconnect mode
                            if (that.reconnect) {
                                that._logger.log(that.DEBUG, LOG_ID + "(stop) stop XMPP auto-reconnect mode");
                                that.reconnect.stop();
                                that.reconnect = null;
                            }
                            that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : FATAL no reconnection for condition : ", err.condition, ", error : ", err);
                            that.eventEmitter.emit("evt_internal_xmppfatalerror", err);
                            break;
                            // Default condition, we do not know what to do, so to avoid wrong stop of SDK, we only send an event.
                        default:
                            that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : default condition, IGNORED. for condition : ", err.condition, ", error : ", err);
                            that.eventEmitter.emit("evt_internal_xmpperror", err);
                            break;
                    }
                } catch (err2) {
                    that._logger.log(that.ERROR, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : CATCH Error  error : ", err2, ", err received : ", err);
                } 
            } else {
                that.stopIdleTimer();
                that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) event - ERROR_EVENT : reconnection disabled so no reconnect");
            }
        });

        that.xmppClient.on(OFFLINE_EVENT, function fn_OFFLINE_EVENT (msg) {
            that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) event - OFFLINE_EVENT : " + OFFLINE_EVENT + " | " + msg);
        });

        that.xmppClient.on(CONNECT_EVENT, function fn_CONNECT_EVENT () {
            that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) event - CONNECT_EVENT : " + CONNECT_EVENT);
        });

        that.xmppClient.on(RECONNECT_EVENT, function fn_RECONNECT_EVENT (msg) {
            that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) event - RECONNECT_EVENT : " + RECONNECT_EVENT + " | " + msg);
        });

        that.xmppClient.on(DISCONNECT_EVENT, async function fn_DISCONNECT_EVENT () {
            that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) event - DISCONNECT_EVENT : " + DISCONNECT_EVENT + " | ", {'reconnect': that.reconnect});
            that.eventEmitter.emit("rainbow_xmppdisconnect", {'reconnect': that.reconnect});
            let waitime = 11 + Math.floor(Math.random() * Math.floor(15));
            that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) event - DISCONNECT_EVENT : wait " + waitime + " seconds before try to reconnect");
            await setTimeoutPromised(waitime);
            if (that.reconnect) {
                if (!that.isReconnecting) {
                    that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) event - DISCONNECT_EVENT : It is not already reconnecting, so try to reconnect...");
                    await that.reconnect.reconnect().catch((err) => {
                        that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) Error while reconnect : ", err);
                    });
                } else {
                    that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection)  event - DISCONNECT_EVENT : Do nothing, already trying to reconnect...");
                }
            } else {
                that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) event - DISCONNECT_EVENT : reconnection disabled so no reconnect");
            }
        });

        that.xmppClient.on(CLOSE_EVENT, function fn_CLOSE_EVENT (msg) {
            that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) event - CLOSE_EVENT : " + CLOSE_EVENT + " | " + msg);
            let stanza = xml("close", {
                "xmlns": NameSpacesLabels.XmppFraming
            });

            that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) send close XMPP Layer, to allow reconnect on the same websocket with same resource. : ", stanza.root().toString());
            return that.xmppClient.send(stanza);
        });

        that.xmppClient.on(END_EVENT, function fn_END_EVENT (msg) {
            that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) event - END_EVENT : " + END_EVENT + " | " + msg);
        });

        that.reconnect.on(RECONNECTING_EVENT, function fn_RECONNECTING_EVENT () {
            that._logger.log(that.WARN, LOG_ID + "(handleXMPPConnection) plugin event - RECONNECTING_EVENT : " + RECONNECTING_EVENT);
            if (that.reconnect) {
                that._logger.log(that.INFO, `${LOG_ID} (handleXMPPConnection) RECONNECTING_EVENT that.reconnect - `, that.reconnect);
                if (!that.isReconnecting) {
                    that.reconnect.delay = that.fibonacciStrategy.next();
                    that._logger.log(that.INFO, `${LOG_ID} (handleXMPPConnection) RECONNECTING_EVENT update reconnect delay - ${that.reconnect.delay} ms`);

                    that.eventEmitter.emit("rainbow_xmppreconnectingattempt");
                    that.isReconnecting = true;
                } else {
                    that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection)  event - RECONNECTING_EVENT : Do nothing, already trying to reconnect...");
                }
            } else {
                that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) event - RECONNECTING_EVENT : reconnection disabled so no reconnect");
                that.isReconnecting = false;
            }
        });

        that.reconnect.on(RECONNECTED_EVENT, function fn_RECONNECTED_EVENT () {
            that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) plugin event - RECONNECTED_EVENT : " + RECONNECTED_EVENT);
            that.fibonacciStrategy.reset();
            that.reconnect.delay = that.fibonacciStrategy.getInitialDelay();
            that.isReconnecting = false;
            that.initialPresence = true;
            that.eventEmitter.emit("rainbow_xmppreconnected");
        });


        that.xmppClient.start({
            uri: urlToConnect, //that.serverURL + "?x-rainbow-xmpp-dom=" + domain,
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

            that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) send IQ discover : ", stanza.root().toString());
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

//                    that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) send IQ prefs : ", stanzaPrefs.root().toString());
//                    return that.xmppClient.send(stanzaPrefs);
//                }
            // */
        }) // */
            /*
            that.xmppClient.start().then((jid) => {
                that._logger.log(that.INFO, "started", jid.toString());
            })// */
            .catch(async err => {
                // rejects for any error before online
                if (err.code === "HPE_INVALID_CONSTANT") {
                    that._logger.log(that.ERROR, LOG_ID + "start reconnect ", err);
                    await that.reconnect.reconnect().catch((err) => {
                        that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) Error while reconnect : ", err);
                    });
                    return;
                }

                that._logger.log(that.ERROR, LOG_ID + "start failed", err);
            });
    }

    setPresence(show, status) {
        let that = this;
        if (that.useXMPP) {
            let stanza = xml("presence", {"id": that.xmppUtils.getUniqueMessageId()});

            if (that.initialPresence) {
                that.initialPresence = false;
                let applicationStanza = xml("application",
                        {xmlns: NameSpacesLabels.ApplicationNameSpace},
                        xml("appid", {}, that.applicationId),
                        xml("userid", {}, that.userId));
                if (that.company) {
                    applicationStanza.append(xml("companyid", {}, that.company.id));
                }

                applicationStanza.append(xml("xrbclient", {}, "sdk_node"));

                applicationStanza.append(xml("xrbversion", {}, packageVersion.version));

                stanza.append(applicationStanza);
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
            that._logger.log(that.INFO, LOG_ID + "(setPresence) send - 'stanza'");
            that._logger.log(that.INTERNAL, LOG_ID + "(setPresence) send - 'stanza'", stanza.toString());
            return that.xmppClient.send(stanza);
        } else {
            that._logger.log(that.WARN, LOG_ID + "(setPresence) No XMPP connection...");
            return Promise.resolve(undefined);
        }
    }

    subscribePresence(to) {
        let that = this;
        /*
  <presence to="user@otherhost.com" type="subscribe" />
   */

        if (that.useXMPP) {
            //let stanza = xml("presence", {"id": that.xmppUtils.getUniqueMessageId(), 
            let stanza = xml("presence", {
                to,
            "type":"subscribe"});

            that._logger.log(that.INFO, LOG_ID + "(subscribePresence) send - 'stanza'");
            that._logger.log(that.INTERNAL, LOG_ID + "(subscribePresence) send - 'stanza'", stanza.toString());
            return that.xmppClient.send(stanza);
        } else {
            that._logger.log(that.WARN, LOG_ID + "(subscribePresence) No XMPP connection...");
            return Promise.resolve(undefined);
        }
    }
    
    //region Carbon
    
    //Message Carbon XEP-0280
    enableCarbon() {
        let that = this;
        if (that.useXMPP) {
            let stanza = xml("iq", {
                "type": "set",
                id: "enable_xmpp_carbon"
            }, xml("enable", {xmlns: NameSpacesLabels.Carbon2NameSpace}));
            that._logger.log(that.INTERNAL, LOG_ID + "(enableCarbon) send - 'stanza'", stanza.toString());
            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanza).then(() => {
                    that._logger.log(that.DEBUG, LOG_ID + "(enableCarbon) sent");
                    resolve(undefined);
                }).catch((err) => {
                    return reject(err);
                });
            });
        }

        that._logger.log(that.WARN, LOG_ID + "(enableCarbon) No XMPP connection...");
        return Promise.resolve(null);
    }

    disableCarbon() {
        let that = this;
        if (that.useXMPP) {
            let stanza = xml("iq", {
                "type": "set",
                id: "disable_xmpp_carbon"
            }, xml("disable", {xmlns: NameSpacesLabels.Carbon2NameSpace}));
            that._logger.log(that.INTERNAL, LOG_ID + "(disable) send - 'stanza'", stanza.toString());
            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanza).then(() => {
                    that._logger.log(that.DEBUG, LOG_ID + "(disable) sent");
                    resolve(undefined);
                }).catch((err) => {
                    return reject(err);
                });
            });
        }

        that._logger.log(that.WARN, LOG_ID + "(disableCarbon) No XMPP connection...");
        return Promise.resolve(null);
    }

    //endregion Carbon

    sendStanza (stanza) {
        let that = this;
        return that.xmppClient.send(stanza);
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
                //"from": that.fullJid,
                //"from": that.jid_im,
                "to": jid,
                "xmlns": NameSpacesLabels.ClientNameSpace,
                "type": TYPE_CHAT,
                "id": id
            }, xml("body", {
                "xml:lang": lang
            }, message), xml("request", {
                    "xmlns": NameSpacesLabels.ReceiptsNameSpace
            }), xml("active", {
                    "xmlns": NameSpacesLabels.ChatestatesNameSpace
                }
            ));

            if (that.copyMessage == false) {
                stanza.append(xml("no-copy", {
                    "xmlns": NameSpacesLabels.HintsNameSpace
                }));
            }

            let answeredMsgId = null;
            let answeredMsgDate = null;
            if ( answeredMsg ) {
                stanza.append(xml("answeredMsg", { "stamp": answeredMsg.date.getTime() }, answeredMsg.id));
                answeredMsgId = answeredMsg.id;
                answeredMsgDate = answeredMsg.date;
                that._logger.log(that.INTERNAL, LOG_ID + "(sendChatMessage) answeredMsg : ", stanza);
            }


            if (subject) {
                stanza.append(xml("subject", {
                    "xml:lang": lang
                }, subject));
            }
            
            let alternativeContent = [];
            if (content && content.message) {
                let contentType = content.type || "text/markdown";
                stanza.append(xml("content", {
                    "type": contentType,
                    "xmlns": NameSpacesLabels.ContentNameSpace
                }, content.message));
                alternativeContent.push({
                    "message": content.message,
                    "type": contentType
                });
            }

            // Handle urgency
            if (urgency && urgency !== 'std') {
                stanza.append(xml('headers', { "xmlns": 'http://jabber.org/protocol/shim' }, xml('header', { name: 'Urgency' },urgency)));
            }
            
            that._logger.log(that.INTERNAL, LOG_ID + "(sendChatMessage) send - 'message'", stanza.toString());
            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanza).then(() => {
                    that._logger.log(that.DEBUG, LOG_ID + "(sendChatMessage) sent");
                    resolve({from: that.jid_im, to: jid, lang: lang, type: "chat", id: id, date: new Date(), content: message, alternativeContent, urgency: urgency});
                }).catch((err) => {
                    return reject(err);
                });
            });
        }

        that._logger.log(that.WARN, LOG_ID + "(sendChatMessage) No XMPP connection...");
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

            if (that.copyMessage == false) {
                stanza.append(xml("no-copy", {
                    "xmlns": NameSpacesLabels.HintsNameSpace
                }));
            }

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
                that._logger.log(that.INTERNAL, LOG_ID + "(sendChatMessageToBubble) answeredMsg : ", stanza);
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

            that._logger.log(that.INTERNAL, LOG_ID + "(sendChatMessageToBubble) send - 'message'", stanza.toString());

            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanza).then(() => {
                    that._logger.log(that.DEBUG, LOG_ID + "(sendChatMessageToBubble) sent");
                    resolve({
                        from: that.jid_im,
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

        that._logger.log(that.WARN, LOG_ID + "(sendChatMessageToBubble) No XMPP connection...");
        return Promise.resolve(null);

        //return null;

    }

    async sendCorrectedChatMessage(conversation, originalMessage, data, origMsgId, lang, content = null) {
        let that = this;
//        $log.info("[Conversation] >sendCorrectedChatMessage: origMsgId=" + origMsgId)

        /* <message to='juliet@capulet.net/balcony' id='good1'>
        <body>But soft, what light through yonder window breaks?</body>
        <replace id='bad1' xmlns='urn:xmpp:message-correct:0'/>
        <store xmlns='urn:xmpp:hints'/>
        </message> */

        // that.sendAckReadMessages();

        let xmppMessage = null;
        // Build the message ID
        let messageToSendID = that.xmppUtils.getUniqueMessageId();
        that._logger.log(that.DEBUG, LOG_ID + "(sendCorrectedChatMessage) : messageToSendID : " + messageToSendID);

        // Handle One to one conversation message
        if (conversation.type === Conversation.Type.ONE_TO_ONE) {
            let to = conversation.id; //that.contact.jid;
            if (that.useMessageEditionAndDeletionV2 == false) {
                xmppMessage = xml("message", {to: to, type: "chat", id: messageToSendID, "xml:lang": lang},
                        xml("body", {"xml:lang": lang}, data),
                        xml("replace", {id: origMsgId, "xmlns": NameSpacesLabels.MessageCorrectNameSpace}),
                        xml("store", {"xmlns": NameSpacesLabels.HintsNameSpace}),
                        xml("request", {"xmlns": NameSpacesLabels.ReceiptNS}),
                        xml("active", {"xmlns": NameSpacesLabels.ChatstatesNS})
                );
            } else {
                messageToSendID = origMsgId;
                if (data === "") {
                    xmppMessage = xml("message", {to: to, type: "chat", id: messageToSendID, "xml:lang": lang},
                            xml("body", {"xml:lang": lang}, data),
                            xml("deleted", {"xmlns": NameSpacesLabels.MessageCorrectNameSpace}),
                            xml("store", {"xmlns": NameSpacesLabels.HintsNameSpace}),
                            xml("request", {"xmlns": NameSpacesLabels.ReceiptNS}),
                            xml("active", {"xmlns": NameSpacesLabels.ChatstatesNS})
                    );
                } else {
                    if (data == undefined) {
                        xmppMessage = xml("message", {to: to, type: "chat", id: messageToSendID, "xml:lang": lang},
                                //xml("body", {"xml:lang": lang}, data),
                                xml("modified", {"xmlns": NameSpacesLabels.MessageCorrectNameSpace}),
                                xml("store", {"xmlns": NameSpacesLabels.HintsNameSpace}),
                                xml("request", {"xmlns": NameSpacesLabels.ReceiptNS}),
                                xml("active", {"xmlns": NameSpacesLabels.ChatstatesNS})
                        );
                    } else {
                        xmppMessage = xml("message", {to: to, type: "chat", id: messageToSendID, "xml:lang": lang},
                                xml("body", {"xml:lang": lang}, data),
                                xml("modified", {"xmlns": NameSpacesLabels.MessageCorrectNameSpace}),
                                xml("store", {"xmlns": NameSpacesLabels.HintsNameSpace}),
                                xml("request", {"xmlns": NameSpacesLabels.ReceiptNS}),
                                xml("active", {"xmlns": NameSpacesLabels.ChatstatesNS})
                        );
                    }
                }
            }

            if (that.copyMessage == false) {
                xmppMessage.append(xml("no-copy", {
                    "xmlns": NameSpacesLabels.HintsNameSpace
                }));
            }

            if (content && content.message) {
                let contentType = content.type || "text/markdown";
                xmppMessage.append(xml("content", {
                    "type": contentType,
                    "xmlns": NameSpacesLabels.ContentNameSpace
                }, content.message));
            }

        }
        // Handle Room conversation message
        else {
            if (that.useMessageEditionAndDeletionV2 == false) {
                xmppMessage = xml("message", {to: conversation.bubble.jid, type: "groupchat", id: messageToSendID},
                xml("body", {"xml:lang": lang}, data),
                xml("replace", {id: origMsgId, "xmlns": NameSpacesLabels.MessageCorrectNameSpace}),
                xml("store", {"xmlns": NameSpacesLabels.HintsNameSpace}),
                xml("request", {"xmlns": NameSpacesLabels.ReceiptNS}),
                xml("active", {"xmlns": NameSpacesLabels.ChatstatesNS}));
            } else {
                messageToSendID = origMsgId;
                if (data==="") {
                    xmppMessage = xml("message", {to: conversation.bubble.jid, type: "groupchat", id: messageToSendID},
                            xml("body", {"xml:lang": lang}, data),
                            xml("deleted", {"xmlns": NameSpacesLabels.MessageCorrectNameSpace}),
                            xml("store", {"xmlns": NameSpacesLabels.HintsNameSpace}),
                            xml("request", {"xmlns": NameSpacesLabels.ReceiptNS}),
                            xml("active", {"xmlns": NameSpacesLabels.ChatstatesNS}));
                } else {
                    if (data == undefined) {
                        xmppMessage = xml("message", {
                                    to: conversation.bubble.jid,
                                    type: "groupchat",
                                    id: messageToSendID
                                },
                                //xml("body", {"xml:lang": lang}, data),
                                xml("modified", {"xmlns": NameSpacesLabels.MessageCorrectNameSpace}),
                                xml("store", {"xmlns": NameSpacesLabels.HintsNameSpace}),
                                xml("request", {"xmlns": NameSpacesLabels.ReceiptNS}),
                                xml("active", {"xmlns": NameSpacesLabels.ChatstatesNS}));
                    } else {
                        xmppMessage = xml("message", {
                                    to: conversation.bubble.jid,
                                    type: "groupchat",
                                    id: messageToSendID
                                },
                                xml("body", {"xml:lang": lang}, data),
                                xml("modified", {"xmlns": NameSpacesLabels.MessageCorrectNameSpace}),
                                xml("store", {"xmlns": NameSpacesLabels.HintsNameSpace}),
                                xml("request", {"xmlns": NameSpacesLabels.ReceiptNS}),
                                xml("active", {"xmlns": NameSpacesLabels.ChatstatesNS}));
                    }
                }
            }
            if (that.copyMessage==false) {
                xmppMessage.append(xml("no-copy", {
                    "xmlns": NameSpacesLabels.HintsNameSpace
                }));
            }

            if (content && content.message) {
                let contentType = content.type || "text/markdown";
                xmppMessage.append(xml("content", {
                    "type": contentType,
                    "xmlns": NameSpacesLabels.ContentNameSpace
                }, content.message));
            }
            
        }

        // message = that.addChatReplaceMessage(contactService.userContact, new Date(), unicodeData, messageToSendID, true);
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
        if (that.useXMPP) {

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

            if (that.copyMessage == false) {
                stanzaRead.append(xml("no-copy", {
                    "xmlns": NameSpacesLabels.HintsNameSpace
                }));
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(markMessageAsRead) send - 'message'", stanzaRead.root().toString());
            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanzaRead).then(() => {
                    that._logger.log(that.DEBUG, LOG_ID + "(markMessageAsRead) sent");
                    resolve(undefined);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(markMessageAsRead) error ");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(markMessageAsRead) error : ", err);
                    return reject(err);
                });
            });
        }

        that._logger.log(that.WARN, LOG_ID + "(markMessageAsRead) No XMPP connection...");
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

        if (that.type !== Conversation.Type.ONE_TO_ONE) {
            msg = $msg({ "to": to, "from": from, "type": "groupchat" }).c("received", { "xmlns": Conversation.ReceiptNS, "event": "received", "entity": "client", "type": "muc", "id": message.id });
        } // */

        let that = this;
        if (that.useXMPP) {

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

            if (that.copyMessage == false) {
                stanzaRead.append(xml("no-copy", {
                    "xmlns": NameSpacesLabels.HintsNameSpace
                }));
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(markMessageAsReceived) send - 'message'", stanzaRead.root().toString());
            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanzaRead).then(() => {
                    that._logger.log(that.DEBUG, LOG_ID + "(markMessageAsRead) sent");
                    resolve(undefined);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(markMessageAsRead) error ");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(markMessageAsRead) error : ", err);
                    return reject(err);
                });
            });
        }

        that._logger.log(that.WARN, LOG_ID + "(markMessageAsReceived) No XMPP connection...");
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

            //let url = that.host + "/api/rainbow/fileserver/v1.0/files/" + fileDescriptor.id;
            let url = "/api/rainbow/fileserver/v1.0/files/" + fileDescriptor.id;

            let stanza = xml("message", {
                   // "from": that.fullJid,
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

            if (that.copyMessage == false) {
                stanza.append(xml("no-copy", {
                    "xmlns": NameSpacesLabels.HintsNameSpace
                }));
            }
            
            that._logger.log(that.INTERNAL, LOG_ID + "(sendChatExistingFSMessage) send - 'message'", stanza.toString());
            return new Promise((resolve, reject) => {
                that
                    .xmppClient
                    .send(stanza).then(() => {
                    that._logger.log(that.DEBUG, LOG_ID + "(sendChatExistingFSMessage) sent");
                    resolve({from: that.jid_im, to: jid, type: "chat", id: id, date: new Date(), content: message});
                }).catch((err) => {
                    return reject(err);
                });
            });
        }

        that._logger.log(that.WARN, LOG_ID + "(sendChatExistingFSMessage) No XMPP connection...");
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

            //let url = that.host  + "/api/rainbow/fileserver/v1.0/files/" + fileDescriptor.id;
            let url = "/api/rainbow/fileserver/v1.0/files/" + fileDescriptor.id;

            let stanza = xml("message", {
                    //"from": that.fullJid,
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

            if (that.copyMessage == false) {
                stanza.append(xml("no-copy", {
                    "xmlns": NameSpacesLabels.HintsNameSpace
                }));
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(sendChatExistingFSMessageToBubble) send - 'message'", stanza.toString());
            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanza).then(() => {
                    that._logger.log(that.DEBUG, LOG_ID + "(sendChatExistingFSMessageToBubble) sent");
                    resolve({from: that.jid_im, to: jid, type: "chat", id: id, date: new Date(), content: message});
                }).catch((err) => {
                    return reject(err);
                });
            });
        }

        that._logger.log(that.WARN, LOG_ID + "(sendChatExistingFSMessageToBubble) No XMPP connection...");
        return Promise.resolve(null);
    }

    sendIsTypingState(conversation, isTypingState) {
        let that = this;
        let state = (isTypingState) ? "composing" : "active";
        if (that.useXMPP) {

            let jid = conversation.id;
            let type = "chat";

            // Handle One to one conversation message
            if (conversation.type === Conversation.Type.ONE_TO_ONE) {
                //jid = that.contact.jid;
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

            if (that.copyMessage == false) {
                stanzaRead.append(xml("no-copy", {
                    "xmlns": NameSpacesLabels.HintsNameSpace
                }));
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(sendIsTypingState) send - 'message'", stanzaRead.root().toString());
            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanzaRead).then(() => {
                    that._logger.log(that.DEBUG, LOG_ID + "(sendIsTypingState) sent");
                    resolve(undefined);
                }).catch((err) => {
                    return reject(err);
                });
            });
        }
        that._logger.log(that.WARN, LOG_ID + "(sendIsTypingState) No XMPP connection...");
        return Promise.resolve(null);
    }

    async sendApplicationMessageAsync(jid, type, element :Element) {
        let that = this;
        if (that.useXMPP) {
            let id = that.xmppUtils.getUniqueMessageId();

            if (!that.shouldSendMessageToConnectedUser && that.jid_im == jid) {
                return Promise.reject("Can not send a message to the connected user : " + that.jid_im);
            }

            // Remove resource if exists
            jid = that.xmppUtils.getBareJIDFromFullJID(jid);

            let stanza = xml("message", {
                "from": that.fullJid,
                //"from": that.jid_im,
                "to": jid,
                "xmlns": NameSpacesLabels.ClientNameSpace,
                "type": type, //TYPE_CHAT or TYPE_GROUPCHAT
                "id": id
            }, xml("rainbow-cpaas", {
                "xmlns": NameSpacesLabels.RainbowCpaaSMessage
            }, element));

            stanza.append(xml("request", {
                    "xmlns": NameSpacesLabels.ReceiptsNameSpace
                }));
            if (that.copyMessage == false) {
                stanza.append(xml("no-copy", {
                    "xmlns": NameSpacesLabels.HintsNameSpace
                }));
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(sendApplicationMessageAsync) send - 'message'", stanza.toString());
            return new Promise((resolve, reject) => {
                that.xmppClient.send(stanza).then(() => {
                    that._logger.log(that.DEBUG, LOG_ID + "(sendApplicationMessageAsync) sent");
                    resolve({"from": that.jid_im, "to": jid, "type": type, "id": id, "date": new Date(), element: element});
                }).catch((err) => {
                    return reject(err);
                });
            });
        }

        that._logger.log(that.WARN, LOG_ID + "(sendApplicationMessageAsync) No XMPP connection...");
        return Promise.resolve(null);
    }

    /*
    getRosters() {
        let that = this;
        //that._logger.log(that.DEBUG, LOG_ID + "(start) getRosters");
        if (that.useXMPP) {
            let stanza = xml("iq", {
                "id": that.xmppUtils.getUniqueMessageId(),
                "type": "get"
            }, xml("query", {xmlns: NameSpacesLabels.RosterNameSpace}));

            that._logger.log(that.INTERNAL, LOG_ID + "(getRosters) send - 'iq/rosters'", stanza.toString());
            that.xmppClient.send(stanza);
        } else {
            that._logger.log(that.WARN, LOG_ID + "(getRosters) No XMPP connection...");
        }
    }
    // */

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
        that._logger.log(that.DEBUG, LOG_ID + "(sendSubscribeInvitation) Send subscribe invitation to ", jid);
        let stanza = xml("iq", {
            type: "get",
            to: that.jid_tel + "/phone",
            xmlns: NameSpacesLabels.ClientNameSpace,
            "id": that.xmppUtils.getUniqueMessageId()
        }, xml("pbxagentstatus", {"xmlns": NameSpacesLabels.Monitoring1NameSpace}));

        that._logger.log(that.INTERNAL, LOG_ID + "(getAgentStatus) send - 'iq get'", stanza.root().toString());
        return that.xmppClient.sendIq(stanza);
    };

    sendInitialBubblePresence(jid) {
        let that = this;
        let id = that.xmppUtils.getUniqueMessageId();

        if (that.useXMPP) {
            let stanza = xml("presence", {
                "id": id,
                to: jid + "/" + that.fullJid
            }, xml("x", {"xmlns": NameSpacesLabels.MucNameSpace}).append(xml("history", {maxchars: "0"})));

            if (that.initialPresence) {
                that.initialPresence = false;
                stanza.append(xml("application",
                    {xmlns: NameSpacesLabels.ApplicationNameSpace},
                    xml("appid", {}, that.applicationId),
                    xml("userid", {}, that.userId)));
                stanza.append(xml("priority", {}, "5"));
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(sendInitialBubblePresence) send - 'message'", stanza.root().toString());
            return that.xmppClient.send(stanza);
        } else {
            that._logger.log(that.WARN, LOG_ID + "(sendInitialBubblePresence) No XMPP connection...");
            return Promise.resolve(undefined);
        }
    }

    sendUnavailableBubblePresence(jid) {
        let that = this;
        if (that.useXMPP) {
            let id = that.xmppUtils.getUniqueMessageId();

            let stanza = xml("presence", {
                "id": id,
                to: jid + "/" + that.fullJid,
                type: "unavailable"
            }, xml("x", {"xmlns": NameSpacesLabels.MucNameSpace}));

            that._logger.log(that.INTERNAL, LOG_ID + "(sendUnavailableBubblePresence) send - 'message'", stanza.root().toString());
            that.xmppClient.send(stanza);
        } else {
            that._logger.log(that.WARN, LOG_ID + "(sendUnavailableBubblePresence) No XMPP connection...");
        }
    }

    getAgentStatus() {
        let that = this;
        return new Promise((resolve, reject) => {
            if (that.useXMPP) {
                let stanza = xml("iq", {
                    type: "get",
                    to: that.jid_tel + "/phone",
                    xmlns: NameSpacesLabels.ClientNameSpace,
                    "id": that.xmppUtils.getUniqueMessageId()
                }, xml("pbxagentstatus", {"xmlns": NameSpacesLabels.Monitoring1NameSpace}));


                that._logger.log(that.INTERNAL, LOG_ID + "(getAgentStatus) send - 'iq get'", stanza.root().toString());
                that.xmppClient.sendIq(stanza).then((data : any) => {
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
            "from": that.jid_im,
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

        return await that.xmppClient.sendIq(stanza);
    }

    async deleteOneCallLog(id) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + "[deleteOneCallLog] deleteOneCallLog : " + id);
        // Get the user contact
        //let userContact = contactService.userContact;

        let message = xml("iq", {
            "from": that.jid_im,
            "to": that.jid_im,
            "type": "set",
            "id": that.xmppUtils.getUniqueMessageId()
        });

        let msg = message.append(xml("delete", {xmlns: NameSpacesLabels.CallLogNamespace, call_id: id}));

        return await that.xmppClient.sendIq(msg);
    }

    async deleteCallLogsForContact(jid) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + "[deleteCallLogsForContact] deleteCallLogsForContact : " + jid);
        // Get the user contact
        //let userContact = contactService.userContact;

        let message = xml("iq", {
            "from": that.jid_im,
            "to": that.jid_im,
            "type": "set",
            "id": that.xmppUtils.getUniqueMessageId()
        });

        let msg = message.append(xml("delete", {xmlns: NameSpacesLabels.CallLogNamespace, peer: jid}));
        return await that.xmppClient.sendIq(msg);
        //xmppService.sendIQ(msg);
    }

    async deleteAllCallLogs() {
        let that = this;
        // Get the user contact
        //let userContact = contactService.userContact;
        if (that.useXMPP) {
            let message = xml("iq", {
                "from": that.jid_im,
                "to": that.jid_im,
                "type": "set",
                "id": that.xmppUtils.getUniqueMessageId()
            });

            let msg = message.append(xml("delete", {xmlns: NameSpacesLabels.CallLogNamespace}));
            return await that.xmppClient.sendIq(msg);
            //xmppService.sendIQ(msg);
        } else {
            that._logger.log(that.WARN, LOG_ID + "(deleteAllCallLogs) No XMPP connection...");
            return Promise.resolve(undefined);
        }
    }

    async markCallLogAsRead(id) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + "[markCallLogAsRead] markCallLogAsRead : " + id);
        // Get the user contact
        //let userContact = contactService.userContact;

        let message = xml("message", {
            "from": that.jid_im,
            "to": that.jid_im,
            "id": that.xmppUtils.getUniqueMessageId()
        });

        if (that.copyMessage == false) {
            message.append(xml("no-copy", {
                "xmlns": NameSpacesLabels.HintsNameSpace
            }));
        }

        let msg = message.append(xml("read", {xmlns: NameSpacesLabels.CallLogAckNamespace, call_id: id}));

        return await that.xmppClient.sendIq(msg);
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

                if (that.copyMessage == false) {
                    message.append(xml("no-copy", {
                        "xmlns": NameSpacesLabels.HintsNameSpace
                    }));
                }

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
        message.append(rsmDelete, undefined);
        let msg = message;
        //return Promise.resolve(message);
        return await that.xmppClient.sendIq(msg);
        //xmppService.sendIQ(msg);
    }

    async deleteAllMessagesInRoomConversation(roomJid, forContactJid = null) {
        let that = this;
        /*
 <iq to="room_f8780e1fabd3449788896b73cab8bbbc@muc.openrainbow.net" type="set" id="node_d00f1a17-c17b-4c48-9d18-977709bb82e831" 
  xmlns="jabber:client">
  <delete 
    xmlns="urn:xmpp:mam:1" queryid="43aec78d-5fbe-483e-96c5-93a02a91219b">
    <x 
      xmlns="jabber:x:data" type="submit">
      <field var="FORM_TYPE" type="hidden">
        <value>urn:xmpp:mam:1</value>
      </field>
    </x>
    <set 
      xmlns="http://jabber.org/protocol/rsm"/>
    </delete>
  </iq>
         */


        // Get the user contact
        //let userContact = contactService.userContact;

        let uniqMessageId=  that.xmppUtils.getUniqueMessageId();
        let uniqId=  that.xmppUtils.getUniqueId(undefined);
        let rsmField2 = null;
        let rsmvalue2 = null;

        let message = xml("iq", {
            //"from": that.jid_im,
            "to": roomJid,
            "type": "set",
            "id": uniqMessageId
        });

        let rsmDelete = xml("delete", {xmlns: NameSpacesLabels.MamNameSpace, queryid: uniqId});
        let rsmx = xml("x",{xmlns: NameSpacesLabels.DataNameSpace, type: "submit"});
        let rsmField1 = xml("field",{var: "FORM_TYPE", type: "hidden"});
        let rsmvalue1 = xml("value",{}, NameSpacesLabels.MamNameSpace);
        if (forContactJid) {
            rsmField2 = xml("field",{var: "with"});
            rsmvalue2 = xml("value",{}, forContactJid);
        }
        let rsmset = xml("set", {xmlns:NameSpacesLabels.RsmNameSpace});
        rsmField1.append(rsmvalue1, undefined);
        if (forContactJid && rsmField2) {
            rsmField2.append(rsmvalue2, undefined);
        }
        rsmx.append(rsmField1,  undefined);
        if (forContactJid) {
            rsmx.append(rsmField2, undefined);
        }
        rsmDelete.append(rsmx,  undefined);
        rsmDelete.append(rsmset,  undefined);
        message.append(rsmDelete, undefined);
        let msg = message;
        return await that.xmppClient.sendIq(msg);
    }

    getErrorMessage (data, actionLabel) {
        let that = this;
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

                that._logger.log(that.ERROR, LOG_ID + "[getErrorMessage] " );
                that._logger.log(that.INTERNALERROR, LOG_ID + "[getErrorMessage] : " + errorMessage);

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

                that._logger.log(that.INTERNAL, LOG_ID + "(getTelephonyState) send - 'iq get'", stanza.root().toString());
            that.xmppClient.sendIq(stanza).then((data)=> {
                that._logger.log(that.INFO, LOG_ID + "(getTelephonyState) received - 'iq result'");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTelephonyState) received - 'iq result'", data);


                // Handle eventual error message
                let errorMessage = that.getErrorMessage(data, "getTelephonyState");
                if (errorMessage) {
                    that._logger.log(that.ERROR, LOG_ID + "getTelephonyState -- failure -- " );
                    that._logger.log(that.INTERNALERROR, LOG_ID + "getTelephonyState -- failure -- : ", errorMessage);
                    return reject(new Error(errorMessage));
                }

                // Handle existing calls
                let existingCalls = that.xmppUtils.findChild(data, "connections");
                let children = {};
                if (existingCalls.children.length === 0) {
                    that._logger.log(that.DEBUG, LOG_ID + "getTelephonyState -- success -- no existing call");
                } else {
                    children = existingCalls.children;
                }
                resolve(children);

            });
        });
    }

    async sendPing(to : string = undefined) : Promise<any> {
        let that = this;
        try {
            if (that.useXMPP) {
                let id = that.xmppUtils.getUniqueMessageId();
                let stanza = xml("iq", {
                    "type": "get",
                    "id": id
                }, xml("ping", {xmlns: NameSpacesLabels.PingNameSpace}));

                if (to) {
                    stanza = xml("iq", {
                        "type": "get",
                        "to": to,
                        "id": id
                    }, xml("ping", {xmlns: NameSpacesLabels.PingNameSpace}));
                }

                that._logger.log(that.DEBUG, LOG_ID + "(sendPing) send - 'message'", stanza.root().toString(), " for Rainbow Node SDK version : ", packageVersion.version);
                if (that.xmppClient) {
                    return that.xmppClient.send(stanza).catch((error) => {
                        that._logger.log(that.ERROR, LOG_ID + "(sendPing) error ");
                        that._logger.log(that.INTERNALERROR, LOG_ID + "(sendPing) error : ", error);
                        return error;
                    });

                } else {
                    that._logger.log(that.WARN, LOG_ID + "(sendPing) No XMPP connection, xmppClient undefined. So XMPP link is closed.");
                    return {
                        code: -1,
                        label: "No XMPP connection, xmppClient undefined. So XMPP link is closed."
                    };
                }
            } else {
                that._logger.log(that.WARN, LOG_ID + "(sendPing) No XMPP connection...");
            }
        } catch (e) {
            that._logger.log(that.ERROR, LOG_ID + "(sendPing) CATCH Error !!! error : ", e);
            return {
                code: -1,
                label: "(sendPing) CATCH Error !!! error : " + e.message
            };
        }
    }
    
// region Alerts

    async SendAlertMessage(alertMessage : AlertMessage) {

        let that = this;
        let uniqMessageId = that.xmppUtils.getUniqueMessageId();
        let uniqId = that.xmppUtils.getUniqueId(undefined);


        if (that.xmppClient != null) {
            // Create IM Message
            /* Sharp.Xmpp.Im.Message imMessage = new Sharp.Xmpp.Im.Message(alertMessage.ToJid, body, subject, null, Sharp.Xmpp.Im.MessageType.Headline);
             imMessage.Id = alertMessage.Id;
             imMessage.From = new Jid(alertMessage.FromJid + "/" + alertMessage.FromResource);
             // */

            let body = "text of the body";

            // Get 'root' XML node
            let root = xml("message", {
                //"from": that.fullJid,
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

            if (that.copyMessage == false) {
                root.append(xml("no-copy", {
                    "xmlns": NameSpacesLabels.HintsNameSpace
                }));
            }

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
            return await that.xmppClient.sendIq(root);
        }
// */
    }

// enregion Alerts

//region Mam
    mamQuery( jid, options, useBulk) {
        let that = this;

        let MAM = "urn:xmpp:mam:1" + ( useBulk ? ":bulk" : "" );
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

        that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) mamQuery - 'stanza'");
        that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) mamQuery - 'stanza'", stanza.toString());
        that.xmppClient.send(stanza).then(() => {
            if ( typeof onComplete === "function" ) {
                onComplete();
            }
       });
    }

    mamQueryMuc(jid, to, options, useBulk) {
        let that = this;
        let MAM = "urn:xmpp:mam:1" + (useBulk ? ":bulk" : "");
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
        let uniqId = that.xmppUtils.getUniqueId(undefined);
        
        let stanza = xml("iq", {
            "type": "set",
            id: jid,
            //id: uniqId,
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

        that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) mamQueryMuc - 'stanza'");
        that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) mamQueryMuc - 'stanza'", stanza.toString());
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
        let randomId = randomString(10, "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");

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

        that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) mamDelete - 'stanza'");
        that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) mamDelete - 'stanza'", stanza.toString());
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
            that._logger.log(that.INFO, LOG_ID + "(handleXMPPConnection) voiceMessageQuery - 'stanza'");
            that._logger.log(that.INTERNAL, LOG_ID + "(handleXMPPConnection) voiceMessageQuery - 'stanza'", stanza.toString());
            that.xmppClient.send(stanza).then((data) => {
                resolve(data);
            }).catch((err) => {
                return reject(err);
            });
        });
    }
    
    //region HTTPoverXMPP 
    async discoverHTTPoverXMPP( to, headers = {}) {
        let that = this;
        /*
    <presence from="1120c47bda4444f39a5921b2230fe4f9@david-all-in-one-rd-dev-1.opentouch.cloud/node_tkggU3Oa" to="fbf55de84bcb4476a49d16191cf12a4b@david-all-in-one-rd-dev-1.opentouch.cloud" id="node_3d4bcddc-e6d3-4ddf-becc-0303fdce88cf9" 
  xmlns="jabber:client">
  <discover 
    xmlns="urn:xmpp:http" version="1.1"/>
  </presence>   
   to be replaced by :
   <message
xmlns="jabber:client" xml:lang="en" to="vna_175703aa87b94d8d81f9b0bc45f8691b@david-all-in-one-rd-dev-1.opentouch.cloud" from="pcloud_enduser_1@david-all-in-one-rd-dev-1.opentouch.cloud/1204817012550600026282835" id="7b5a3fb7-03c8-4526-8caf-a682bd4ab44e_0">
<discover
xmlns="urn:xmpp.http" version="1.1"/>
<nac/>
</message>

         */

        let uniqMessageId=  that.xmppUtils.getUniqueMessageId();
        let uniqId=  that.xmppUtils.getUniqueId(undefined);

        that._logger.log(that.INTERNAL, LOG_ID + "(discoverHTTPoverXMPP) to : ", to);

        let msg = xml("message", {
            "xml:lang":"en",
            "from": that.fullJid,
            //"from": to,
            "to": to ? to : that.jid_im,
            "id": uniqMessageId
            //"xmlns" : "jabber:iq:http"
        });

        let stanzaReq = xml("discover", {xmlns: NameSpacesLabels.XmppHttpNS, "version" : "1.1"});
        msg.append(stanzaReq, undefined);

        let stanzaNacReq = xml("nac", {});
        msg.append(stanzaNacReq, undefined);

        that._logger.log(that.INTERNAL, LOG_ID + "(discoverHTTPoverXMPP) msg : ", msg);

        //return Promise.resolve(message);
        return await that.xmppClient.sendIq(msg);
    }
    
/*    async answerDiscoverHTTPoverXMPP( to) {
        let that = this;

        let uniqMessageId=  that.xmppUtils.getUniqueMessageId();
        let uniqId=  that.xmppUtils.getUniqueId(undefined);

        that._logger.log(that.INTERNAL, LOG_ID + "(discoverHTTPoverXMPP) to : ", to);

        let msg = xml("presence", {
            "from": that.fullJid,
            //"from": to,
            "to": to ? to : that.jid_im,
            "id": uniqMessageId
            //"xmlns" : "jabber:iq:http"
        });

        let stanzaReq = xml("resource", {xmlns: NameSpacesLabels.XmppHttpNS, "version" : "1.1"}, that.resourceId);
        msg.append(stanzaReq, undefined);

        that._logger.log(that.INTERNAL, LOG_ID + "(discoverHTTPoverXMPP) msg : ", msg);

        //return Promise.resolve(message);
        return await that.xmppClient.sendIq(msg);
    } // */
    
    async getHTTPoverXMPP(urlToGet, to, headers = {}) {
        let that = this;
        /*
    <iq type='set'
       from='httpclient@example.org/browser'
       to='httpserver@example.org'
       id='2'>
      <req xmlns='urn:xmpp:http' method='GET' resource='/rdf/xep' version='1.1'>
          <headers xmlns='http://jabber.org/protocol/shim'>
              <header name='Host'>example.org</header>
          </headers>
      </req>
   </iq>
   
         */


        // Get the user contact
        //let userContact = contactService.userContact;

        let uniqMessageId=  that.xmppUtils.getUniqueMessageId();
        let uniqId=  that.xmppUtils.getUniqueId(undefined);

        let opt = url.parse(urlToGet);
        that._logger.log(that.INTERNAL, LOG_ID + "(getHTTPoverXMPP) opt : ", opt);
        let method = "GET";
        let host = opt.protocol + "//" + opt.host;
        let resource = opt.path;
        
        

        let msg = xml("iq", {
            "from": that.fullJid,
            //"from": to,
            "to": to ? to : that.fullJid,
            "type": "set",
            "id": uniqMessageId
            //"xmlns" : "jabber:iq:http"
        });

        let stanzaReq = xml("req", {xmlns: NameSpacesLabels.XmppHttpNS, method, resource, "version" : "1.1"});

        let stanzaHeaders = xml("headers",{xmlns: NameSpacesLabels.protocolShimNS});

        for (const headersKey in headers) {
            let stanzaHeaderHost = xml("header",{name: headersKey}, headers[headersKey]);
            stanzaHeaders.append(stanzaHeaderHost, undefined);
        }
        let stanzaHeaderHost = xml("header",{name: "Host"}, host);
        stanzaHeaders.append(stanzaHeaderHost, undefined);

        stanzaReq.append(stanzaHeaders, undefined);
        msg.append(stanzaReq, undefined);
        that._logger.log(that.INTERNAL, LOG_ID + "(getHTTPoverXMPP) msg : ", msg);

        //return Promise.resolve(message);
        return await that.xmppClient.sendIq(msg);
    }
    
    async traceHTTPoverXMPP(urlToGet, to, headers = {}) {
        let that = this;
        /*
    <iq type='set'
       from='httpclient@example.org/browser'
       to='httpserver@example.org'
       id='7'>
      <req xmlns='urn:xmpp:http' method='TRACE' resource='/rdf/ex1.turtle' version='1.1'>
          <headers xmlns='http://jabber.org/protocol/shim'>
              <header name='Host'>example.org</header>
          </headers>
      </req>
   </iq>
   
         */


        // Get the user contact
        //let userContact = contactService.userContact;

        let uniqMessageId=  that.xmppUtils.getUniqueMessageId();
        let uniqId=  that.xmppUtils.getUniqueId(undefined);

        let opt = url.parse(urlToGet);
        that._logger.log(that.INTERNAL, LOG_ID + "(traceHTTPoverXMPP) opt : ", opt, ...arguments);
        let method = "TRACE";
        let host = opt.protocol + "//" + opt.host;
        let resource = opt.path;

        let msg = xml("iq", {
            "from": that.fullJid,
            //"from": to,
            "to":  to? to : that.fullJid,
            "type": "set",
            "id": uniqMessageId
            //"xmlns" : "jabber:iq:http"
        });

        let stanzaReq = xml("req", {xmlns: NameSpacesLabels.XmppHttpNS, method, resource, "version" : "1.1"});

        let stanzaHeaders = xml("headers",{xmlns: NameSpacesLabels.protocolShimNS});

        for (const headersKey in headers) {
            let stanzaHeaderHost = xml("header",{name: headersKey}, headers[headersKey]);
            stanzaHeaders.append(stanzaHeaderHost, undefined);
        }
        let stanzaHeaderHost = xml("header",{name: "Host"}, host);
        stanzaHeaders.append(stanzaHeaderHost, undefined);

        stanzaReq.append(stanzaHeaders, undefined);
        msg.append(stanzaReq, undefined);
        that._logger.log(that.INTERNAL, LOG_ID + "(traceHTTPoverXMPP) msg : ", msg);

        //return Promise.resolve(message);
        return await that.xmppClient.sendIq(msg);
    }
    
    async headHTTPoverXMPP(urlToGet, to, headers = {}) {
        let that = this;
        /*
    <iq type='set'
       from='httpclient@example.org/browser'
       to='httpserver@example.org'
       id='3'>
      <req xmlns='urn:xmpp:http' method='HEAD' resource='/video/video1.m4' version='1.1'>
          <headers xmlns='http://jabber.org/protocol/shim'>
              <header name='Host'>example.org</header>
          </headers>
      </req>
   </iq>
   
         */


        // Get the user contact
        //let userContact = contactService.userContact;

        let uniqMessageId=  that.xmppUtils.getUniqueMessageId();
        let uniqId=  that.xmppUtils.getUniqueId(undefined);

        let opt = url.parse(urlToGet);
        that._logger.log(that.INTERNAL, LOG_ID + "(headHTTPoverXMPP) opt : ", opt);
        let method = "HEAD";
        let host = opt.protocol + "//" + opt.host;
        let resource = opt.path;

        let msg = xml("iq", {
            "from": that.fullJid,
            //"from": to,
            "to":  to? to : that.fullJid,
            "type": "set",
            "id": uniqMessageId
            //"xmlns" : "jabber:iq:http"
        });

        let stanzaReq = xml("req", {xmlns: NameSpacesLabels.XmppHttpNS, method, resource, "version" : "1.1"});

        let stanzaHeaders = xml("headers",{xmlns: NameSpacesLabels.protocolShimNS});

        for (const headersKey in headers) {
            let stanzaHeaderHost = xml("header",{name: headersKey}, headers[headersKey]);
            stanzaHeaders.append(stanzaHeaderHost, undefined);
        }
        let stanzaHeaderHost = xml("header",{name: "Host"}, host);
        stanzaHeaders.append(stanzaHeaderHost, undefined);

        stanzaReq.append(stanzaHeaders, undefined);
        msg.append(stanzaReq, undefined);
        that._logger.log(that.INTERNAL, LOG_ID + "(headHTTPoverXMPP) msg : ", msg);

        //return Promise.resolve(message);
        return await that.xmppClient.sendIq(msg);
    }
    
    async postHTTPoverXMPP(urlToGet, to, headers = {}, data) {
        let that = this;
        /*
     <iq type='set'
       from='httpclient@example.org/browser'
       to='httpserver@example.org'
       id='4'>
      <req xmlns='urn:xmpp:http' method='POST' resource='/sparql/?default-graph-uri=http%3A%2F%2Fexample.org%2Frdf/xep' version='1.1'>
          <headers xmlns='http://jabber.org/protocol/shim'>
              <header name='Host'>example.org</header>
              <header name='User-agent'>Clayster HTTP/XMPP Client</header>
              <header name='Content-Type'>application/sparql-query</header>
              <header name='Content-Length'>...</header>
          </headers>
          <data>
              <text>PREFIX dc: &lt;http://purl.org/dc/elements/1.1/&gt;
BASE &lt;http://example.org/&gt;

SELECT ?title ?creator ?publisher
WHERE  { ?x dc:title ?title .
         OPTIONAL { ?x dc:creator ?creator } .
       }</text>
          </data>
      </req>
   </iq>
   
         */


        // Get the user contact
        //let userContact = contactService.userContact;

        let uniqMessageId=  that.xmppUtils.getUniqueMessageId();
        let uniqId=  that.xmppUtils.getUniqueId(undefined);

        let opt = url.parse(urlToGet);
        that._logger.log(that.INTERNAL, LOG_ID + "(postHTTPoverXMPP) opt : ", opt);
        let method = "POST";
        let host = opt.protocol + "//" + opt.host;
        let resource = opt.path;

        let msg = xml("iq", {
            "from": that.fullJid,
            //"from": to,
            "to": to ? to : that.fullJid,
            "type": "set",
            "id": uniqMessageId
            //"xmlns" : "jabber:iq:http"
        });

        let stanzaReq = xml("req", {xmlns: NameSpacesLabels.XmppHttpNS, method, resource, "version" : "1.1"});

        let stanzaHeaders = xml("headers",{xmlns: NameSpacesLabels.protocolShimNS});

        for (const headersKey in headers) {
            let stanzaHeaderHost = xml("header",{name: headersKey}, headers[headersKey]);
            stanzaHeaders.append(stanzaHeaderHost, undefined);
        }
        let stanzaHeaderHost = xml("header",{name: "Host"}, host);
        stanzaHeaders.append(stanzaHeaderHost, undefined);

        stanzaReq.append(stanzaHeaders, undefined);
        
        let stanzaData = xml("data",{}, undefined);
        let stanzaText = xml("text",{}, encodeURIComponent(data));

        stanzaData.append(stanzaText, undefined);
        stanzaReq.append(stanzaData, undefined);
        msg.append(stanzaReq, undefined);
        that._logger.log(that.INTERNAL, LOG_ID + "(postHTTPoverXMPP) msg : ", msg);

        //return Promise.resolve(message);
        return await that.xmppClient.sendIq(msg);
    }

    async putHTTPoverXMPP(urlToGet, to, headers = {}, data) {
        let that = this;
        /*
     <iq type='set'
       from='httpclient@example.org/browser'
       to='httpserver@example.org'
       id='4'>
      <req xmlns='urn:xmpp:http' method='POST' resource='/sparql/?default-graph-uri=http%3A%2F%2Fexample.org%2Frdf/xep' version='1.1'>
          <headers xmlns='http://jabber.org/protocol/shim'>
              <header name='Host'>example.org</header>
              <header name='User-agent'>Clayster HTTP/XMPP Client</header>
              <header name='Content-Type'>application/sparql-query</header>
              <header name='Content-Length'>...</header>
          </headers>
          <data>
              <text>PREFIX dc: &lt;http://purl.org/dc/elements/1.1/&gt;
BASE &lt;http://example.org/&gt;

SELECT ?title ?creator ?publisher
WHERE  { ?x dc:title ?title .
         OPTIONAL { ?x dc:creator ?creator } .
       }</text>
          </data>
      </req>
   </iq>
   
         */


        // Get the user contact
        //let userContact = contactService.userContact;

        let uniqMessageId=  that.xmppUtils.getUniqueMessageId();
        let uniqId=  that.xmppUtils.getUniqueId(undefined);

        let opt = url.parse(urlToGet);
        that._logger.log(that.INTERNAL, LOG_ID + "(putHTTPoverXMPP) opt : ", opt);
        let method = "PUT";
        let host = opt.protocol + "//" + opt.host;
        let resource = opt.path;

        let msg = xml("iq", {
            "from": that.fullJid,
            //"from": to,
            "to":  to? to : that.fullJid,
            "type": "set",
            "id": uniqMessageId
            //"xmlns" : "jabber:iq:http"
        });

        let stanzaReq = xml("req", {xmlns: NameSpacesLabels.XmppHttpNS, method, resource, "version" : "1.1"});

        let stanzaHeaders = xml("headers",{xmlns: NameSpacesLabels.protocolShimNS});

        for (const headersKey in headers) {
            let stanzaHeaderHost = xml("header",{name: headersKey}, headers[headersKey]);
            stanzaHeaders.append(stanzaHeaderHost, undefined);
        }
        let stanzaHeaderHost = xml("header",{name: "Host"}, host);
        stanzaHeaders.append(stanzaHeaderHost, undefined);

        stanzaReq.append(stanzaHeaders, undefined);
        
        let stanzaData = xml("data",{}, undefined);
        let stanzaText = xml("text",{}, encodeURIComponent(data));

        stanzaData.append(stanzaText, undefined);
        stanzaReq.append(stanzaData, undefined);
        msg.append(stanzaReq, undefined);
        that._logger.log(that.INTERNAL, LOG_ID + "(putHTTPoverXMPP) msg : ", msg);

        //return Promise.resolve(message);
        return await that.xmppClient.sendIq(msg);
    }

    async deleteHTTPoverXMPP(urlToGet, to, headers = {}, data) {
        let that = this;
        /*
     <iq type='set'
       from='httpclient@example.org/browser'
       to='httpserver@example.org'
       id='4'>
      <req xmlns='urn:xmpp:http' method='POST' resource='/sparql/?default-graph-uri=http%3A%2F%2Fexample.org%2Frdf/xep' version='1.1'>
          <headers xmlns='http://jabber.org/protocol/shim'>
              <header name='Host'>example.org</header>
              <header name='User-agent'>Clayster HTTP/XMPP Client</header>
              <header name='Content-Type'>application/sparql-query</header>
              <header name='Content-Length'>...</header>
          </headers>
          <data>
              <text>PREFIX dc: &lt;http://purl.org/dc/elements/1.1/&gt;
BASE &lt;http://example.org/&gt;

SELECT ?title ?creator ?publisher
WHERE  { ?x dc:title ?title .
         OPTIONAL { ?x dc:creator ?creator } .
       }</text>
          </data>
      </req>
   </iq>
   
         */


        // Get the user contact
        //let userContact = contactService.userContact;

        let uniqMessageId=  that.xmppUtils.getUniqueMessageId();
        let uniqId=  that.xmppUtils.getUniqueId(undefined);

        let opt = url.parse(urlToGet);
        that._logger.log(that.INTERNAL, LOG_ID + "(deleteHTTPoverXMPP) opt : ", opt);
        let method = "DELETE";
        let host = opt.protocol + "//" + opt.host;
        let resource = opt.path;

        let msg = xml("iq", {
            "from": that.fullJid,
            //"from": to,
            "to": to? to : that.fullJid,
            "type": "set",
            "id": uniqMessageId
            //"xmlns" : "jabber:iq:http"
        });

        let stanzaReq = xml("req", {xmlns: NameSpacesLabels.XmppHttpNS, method, resource, "version" : "1.1"});

        let stanzaHeaders = xml("headers",{xmlns: NameSpacesLabels.protocolShimNS});

        for (const headersKey in headers) {
            let stanzaHeaderHost = xml("header",{name: headersKey}, headers[headersKey]);
            stanzaHeaders.append(stanzaHeaderHost, undefined);
        }
        let stanzaHeaderHost = xml("header",{name: "Host"}, host);
        stanzaHeaders.append(stanzaHeaderHost, undefined);

        stanzaReq.append(stanzaHeaders, undefined);
        
        let stanzaData = xml("data",{}, undefined);
        let stanzaText = xml("text",{}, encodeURIComponent(data));

        stanzaData.append(stanzaText, undefined);
        stanzaReq.append(stanzaData, undefined);
        msg.append(stanzaReq, undefined);
        that._logger.log(that.INTERNAL, LOG_ID + "(deleteHTTPoverXMPP) msg : ", msg);

        //return Promise.resolve(message);
        return await that.xmppClient.sendIq(msg);
    }

    async discover() {
        let that = this;
        /*
        <iq type='set'
        from='httpclient@example.org/browser'
        to='httpserver@example.org'
        id='disco1'>
        <query xmlns='http://jabber.org/protocol/disco#info'/>
                </iq> 
                // */
        let uniqMessageId = that.xmppUtils.getUniqueMessageId();
        let uniqId = that.xmppUtils.getUniqueId(undefined);

        let to = that.jid_im;
        //let to = that.xmppUtils.getDomainFromFullJID(that.fullJid);;
        that._logger.log(that.INTERNAL, LOG_ID + "(discover) to : ", to);

        let msg = xml("iq", {
            "from": that.jid_im,
            "to": to,
            "type": "get",
            "id": uniqMessageId
            //"xmlns" : "jabber:iq:http"
        });

        let stanzaQuery = xml("query", {xmlns: "http://jabber.org/protocol/disco#info"});
        msg.append(stanzaQuery, undefined);
        that._logger.log(that.INTERNAL, LOG_ID + "(discover) msg : ", msg);

        //return Promise.resolve(message);
        return await that.xmppClient.sendIq(msg);

    }
    
    //endregion HTTPoverXMPP

    //region RPCoverXMPP 
    
    async discoverRPCoverXMPP( to, headers = {}) {
        let that = this;
        /*
<iq type='get'
    from='requester@company-b.com/jrpc-client'
    to='responder@company-a.com/jrpc-server'
    id='disco1'>
  <query xmlns='http://jabber.org/protocol/disco#info'/>
</iq>
         */

        let uniqMessageId=  that.xmppUtils.getUniqueMessageId();
        let uniqId=  that.xmppUtils.getUniqueId(undefined);

        that._logger.log(that.INTERNAL, LOG_ID + "(discoverRPCoverXMPP) to : ", to);

        let msg = xml("iq", {
            "type":"get",
            "from": that.fullJid,
            "to": to ? to : that.jid_im,
            "id": uniqMessageId
        });

        let stanzaQuery = xml("query", {xmlns: "http://jabber.org/protocol/disco#info"});
        msg.append(stanzaQuery, undefined);
        that._logger.log(that.INTERNAL, LOG_ID + "(discover) msg : ", msg);

        //return Promise.resolve(message);
        return await that.xmppClient.sendIq(msg);
    }

    //region RPC encode stanza

    arrayToStanza(arrayOfParams, stanzaData) {
        let that = this;
        for (const param of arrayOfParams) {
            if (typeof (param)==='undefined' || typeof (param)===null) {
                that._logger.log(that.DEBUG, LOG_ID + "(arrayToStanza) a param is undefined/null, so ignore it.");
                continue;
            }
            that.valueTypeToStanza(param,  stanzaData);
        }
    }

    valueTypeToStanza(param, stanzaData) {
        let that = this;
        if (typeof (param)==='undefined' || typeof (param)===null) {
            that._logger.log(that.DEBUG, LOG_ID + "(paramToStanza) a param is undefined/null, so set it to false (boolean type) to be ignored with if on the other side.");
            param = false;
        }

        if (param === true || param === false ) {
            that._logger.log(that.DEBUG, LOG_ID + "(paramToStanza) a param is boolean, so transform it to numbers.");
            let stanzaInt = xml("boolean", {}, param === true ? 1 : 0);
            let stanzaValue = xml("value", {});
            stanzaValue.append(stanzaInt, undefined);
            stanzaData.append(stanzaValue, undefined);
        }

        if (isNumber(param)) {
            /*
      <value><int>6</int></value>
             */
            let stanzaInt = xml("double", {}, param);
            let stanzaValue = xml("value", {});
            stanzaValue.append(stanzaInt, undefined);
            stanzaData.append(stanzaValue, undefined);
        }

        if (typeof (param)==='string') {
            /*
      <value><string>6</string></value>
             */
            let stanzaInt = xml("string", {}, param);
            let stanzaValue = xml("value", {});
            stanzaValue.append(stanzaInt, undefined);
            stanzaData.append(stanzaValue, undefined);
        }

        if (typeof (param)==='object') {
            if (Array.isArray(param)) {
                let stanzaData2 = xml("data", {});
                let stanzaArray = xml("array", {});
                let stanzaValue = xml("value", {});
                stanzaArray.append(stanzaData2, undefined);
                stanzaValue.append(stanzaArray, undefined);
                stanzaData.append(stanzaValue, undefined);
                that.arrayToStanza(param, stanzaData2);
            } else {
                let stanzaStruct = xml("struct", {});
                let stanzaValue = xml("value", {});

                Object.getOwnPropertyNames(param).forEach((val, idx, array) => {
                    let stanzaMember = xml("member", {});
                    let stanzaName = xml("name", {}, val);
                    stanzaMember.append(stanzaName, undefined);
                    that.valueTypeToStanza(param[val], stanzaMember);
                    stanzaStruct.append(stanzaMember, undefined);
                });
                stanzaValue.append(stanzaStruct, undefined);
                stanzaData.append(stanzaValue, undefined);
            }
        }
    }
    
    paramToStanza(params, stanzaParams) {
        let that = this;
        for (const param of params) {
            let paramToEncode = param;
            if (typeof(paramToEncode) === 'undefined' || typeof(paramToEncode) === null) {
                that._logger.log(that.DEBUG, LOG_ID + "(paramToStanza) a param is undefined/null, so set it to false (boolean type) to be ignored with if on the other side.");
                paramToEncode = false;
            }

            if (paramToEncode === true || paramToEncode === false ) {
                that._logger.log(that.DEBUG, LOG_ID + "(paramToStanza) a param is boolean, so transform it to numbers.");
                let stanzaInt = xml("boolean", {}, paramToEncode === true ? 1 : 0);
                let stanzaValue = xml("value", {});
                let stanzaParam = xml("param", {});
                stanzaValue.append(stanzaInt, undefined);
                stanzaParam.append(stanzaValue, undefined);
                stanzaParams.append(stanzaParam, undefined);
            }
            
            if (isNumber(paramToEncode)) {
                /*
                 <param>
          <value><int>6</int></value>
        </param>
                 */
                let stanzaInt = xml("doubles", {}, paramToEncode);
                let stanzaValue = xml("value", {});
                let stanzaParam = xml("param", {});
                stanzaValue.append(stanzaInt, undefined);
                stanzaParam.append(stanzaValue, undefined);
                stanzaParams.append(stanzaParam, undefined);
            }

            if(typeof(paramToEncode) === 'string') {
                /*
                 <param>
          <value><string>6</string></value>
        </param>
                 */
                let stanzaInt = xml("string", {}, paramToEncode);
                let stanzaValue = xml("value", {});
                let stanzaParam = xml("param", {});
                stanzaValue.append(stanzaInt, undefined);
                stanzaParam.append(stanzaValue, undefined);
                stanzaParams.append(stanzaParam, undefined);
            }

            if(typeof(paramToEncode) === 'object') {
                if (Array.isArray(paramToEncode)) {
                    let stanzaData = xml("data", {});
                    let stanzaArray = xml("array", {});
                    let stanzaValue = xml("value", {});
                    let stanzaParam = xml("param", {});
                    stanzaArray.append(stanzaData, undefined);
                    stanzaValue.append(stanzaArray, undefined);
                    stanzaParam.append(stanzaValue, undefined);
                    stanzaParams.append(stanzaParam, undefined);
                    that.arrayToStanza(paramToEncode,stanzaData);
                } else {
                    let stanzaStruct = xml("struct", {});
                    let stanzaValue = xml("value", {});
                    let stanzaParam = xml("param", {});

                    Object.getOwnPropertyNames(paramToEncode).forEach( (val, idx, array) => {
                        let stanzaMember = xml("member", {});
                        let stanzaName = xml("name", {}, val);
                        stanzaMember.append(stanzaName, undefined);
                        that.valueTypeToStanza(paramToEncode[val],stanzaMember);
                        stanzaStruct.append(stanzaMember, undefined);                        
                    });
                    stanzaValue.append(stanzaStruct, undefined);
                    stanzaParam.append(stanzaValue, undefined);
                    stanzaParams.append(stanzaParam, undefined);
                }
            }
        }
    }

    //endregion RPC encode stanza

    //region RPC decode stanza

    valueTypeToValue(param) {
        let that = this;
        // that._logger.log(that.INFO, LOG_ID + "(_onIqGetSetQueryReceived) valueTypeToValuev param.value : ", param);
        let result = undefined;
        if (param) {
            Object.getOwnPropertyNames(param).forEach((val, idx, array) => {
                let child = param[val];
                // that._logger.log(that.INFO, LOG_ID + "(_onIqGetSetQueryReceived) valueTypeToValue data : ", data);

                if (val==="boolean") {
                    // that._logger.log(that.DEBUG, LOG_ID + "(paramToStanza) a param is boolean with number, so transform it to real boolean.");
                    result = ((child==="1" || child===1) ? true:false);
                }

                if (val==="string" || val==="base64" || val==="dateTime.iso8601") {
                    result = "" + child;
                }
                if (val==="int" || val==="double" || val==="i4") {
                    result = Number.parseInt(child);
                }
                if (val==="array") {

                    let arr = [];
                    // console.log("array : ", data);

                    /* if (data.data.value) {
                        
                    } // */
                    if ( child && child.data && child.data.value && Array.isArray(child.data.value)) {
                        for (const valTab of child.data.value) {
                            arr.push(that.valueTypeToValue(valTab));
                        }
                    } else {
                        arr.push(that.valueTypeToValue(child.data.value));
                    }

                    result = arr;
                    //return Number.parseInt(param.value.val);
                }
                if (val==="struct") {
                    let obj = {};
                    // console.log("struct : ", data);
                    if ( child && child.member && Array.isArray(child.member)) {
                        for (const member of child.member) {
                            obj[member.name] = that.valueTypeToValue(member.value);
                        }
                    } else {
                            obj[child.member.name] = that.valueTypeToValue(child.member.value);                        
                    }
                    result = obj;
                    //return Number.parseInt(param.value.val);
                }
            });
        }
        return result;
    }

    decodeRPCParam(param) {
        let that = this;
        //that._logger.log(that.INFO, LOG_ID + "(_onIqGetSetQueryReceived) decodeRPCParam param.value : ", param.value);
        if (param && param.value) {
            return that.valueTypeToValue(param.value);
        } else {
            return undefined;
        }
    }

    //endregion RPC decode stanza
    
    async callRPCMethod( to, methodName ,params : Array<any> = [] ) {
        let that = this;
        /*
<iq type='set'
    from='requester@company-b.com/jrpc-client'
    to='responder@company-a.com/jrpc-server'
    id='rpc1'>
  <query xmlns='jabber:iq:rpc'>
    <methodCall>
      <methodName>examples.getStateName</methodName>
      <params>
        <param>
          <value><int>6</int></value>
        </param>
        <param>
          <value><struct><member><name>phonenumber</name><value><string>55566622</string></value></member></struct></value>
        </param>
      </params>
    </methodCall>
  </query>
</iq>
         */

        let uniqMessageId=  that.xmppUtils.getUniqueMessageId();
        let uniqId=  that.xmppUtils.getUniqueId(undefined);

        that._logger.log(that.INTERNAL, LOG_ID + "(callRPCMethod) to : ", to);

        let msg = xml("iq", {
            "type":"set",
            "from": that.fullJid,
            "to": to ? to : that.jid_im,
            "id": uniqMessageId
        });

        let stanzaQuery = xml("query", {xmlns: NameSpacesLabels.RPC});
        msg.append(stanzaQuery, undefined);

        let stanzaMethodCall = xml("methodCall", {});
        stanzaQuery.append(stanzaMethodCall, undefined);

        let stanzaMethodName = xml("methodName", {}, methodName);
        stanzaMethodCall.append(stanzaMethodName, undefined);
        
        let stanzaParams = xml("params", {});
        stanzaMethodCall.append(stanzaParams, undefined);

        that.paramToStanza(params, stanzaParams);
        
        that._logger.log(that.INTERNAL, LOG_ID + "(callRPCMethod) msg : ", msg);

        //return Promise.resolve(message);
        let result = await that.xmppClient.sendIq(msg);

        that._logger.log(that.DEBUG, "(callRPCMethod) - sent.");
        that._logger.log(that.INTERNAL, "(callRPCMethod) - result : ", result);
        let xmlNodeStr = result ? result.toString():"<xml></xml>";
        let reqObj = await getJsonFromXML(xmlNodeStr);

        let methodResponseParam = ( reqObj && reqObj.iq && reqObj.iq.query && reqObj.iq.query.methodResponse.params && reqObj.iq.query.methodResponse.params.param ) ? reqObj.iq.query.methodResponse.params.param : undefined;
        let res = that.decodeRPCParam(methodResponseParam); 
        return res;
    }
    
    async traceRPCoverXMPP(urlToGet, to, headers = {}) {
        let that = this;
        /*
    <iq type='set'
       from='httpclient@example.org/browser'
       to='httpserver@example.org'
       id='7'>
      <req xmlns='urn:xmpp:http' method='TRACE' resource='/rdf/ex1.turtle' version='1.1'>
          <headers xmlns='http://jabber.org/protocol/shim'>
              <header name='Host'>example.org</header>
          </headers>
      </req>
   </iq>   
         */


        // Get the user contact
        //let userContact = contactService.userContact;

        let uniqMessageId=  that.xmppUtils.getUniqueMessageId();
        let uniqId=  that.xmppUtils.getUniqueId(undefined);

        let opt = url.parse(urlToGet);
        that._logger.log(that.INTERNAL, LOG_ID + "(traceRPCoverXMPP) opt : ", opt);
        let method = "TRACE";
        let host = opt.protocol + "//" + opt.host;
        let resource = opt.path;

        let msg = xml("iq", {
            "from": that.fullJid,
            //"from": to,
            "to":  to? to : that.fullJid,
            "type": "set",
            "id": uniqMessageId
            //"xmlns" : "jabber:iq:http"
        });

        let stanzaReq = xml("req", {xmlns: NameSpacesLabels.XmppHttpNS, method, resource, "version" : "1.1"});

        let stanzaHeaders = xml("headers",{xmlns: NameSpacesLabels.protocolShimNS});

        for (const headersKey in headers) {
            let stanzaHeaderHost = xml("header",{name: headersKey}, headers[headersKey]);
            stanzaHeaders.append(stanzaHeaderHost, undefined);
        }
        let stanzaHeaderHost = xml("header",{name: "Host"}, host);
        stanzaHeaders.append(stanzaHeaderHost, undefined);

        stanzaReq.append(stanzaHeaders, undefined);
        msg.append(stanzaReq, undefined);
        that._logger.log(that.INTERNAL, LOG_ID + "(traceRPCoverXMPP) msg : ", msg);

        //return Promise.resolve(message);
        return await that.xmppClient.sendIq(msg);
    }
    
    //endregion RPCoverXMPP

}

export { XMPPService, NameSpacesLabels };
module.exports.XMPPService = XMPPService;
module.exports.NameSpacesLabels = NameSpacesLabels;

