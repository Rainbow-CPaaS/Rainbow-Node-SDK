"use strict";

import * as util from "util";
import {logEntryExit, makeId, setTimeoutPromised} from "../../common/Utils";
import * as PubSub from "pubsub-js";
import {Conversation} from "../../common/models/Conversation";
import {DataStoreType} from "../../config/config";
import {XMPPUTils} from "../../common/XMPPUtils";
import {NameSpacesLabels, XMPPService} from "../XMPPService";
import {RESTService} from "../RESTService";
import {ErrorManager} from "../../common/ErrorManager";
import {InvitationEventHandler} from "../XMPPServiceHandler/invitationEventHandler";
import {S2SServiceEventHandler} from "./S2SServiceEventHandler";
const express = require( "express" );

const LOG_ID = "S2S - ";

@logEntryExit(LOG_ID)
class S2SService {
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
    private logger: any;
    private proxy: any;
    private xmppUtils: XMPPUTils;
    private generatedRandomId: string;
    private hash: string;
    useS2S: any;
    _rest: RESTService;
    hostCallback: any;
    private app: any;
    private locallistenningport: string;
    private s2sEventHandler: S2SServiceEventHandler;
    _contacts: any;
    options: any;

    constructor(_s2s, _im, _application, _eventEmitter, _logger, _proxy) {
        this.serverURL = ""; //_s2s.protocol + "://" + _s2s.host + ":" + _s2s.port + "/websocket";
        this.hostCallback = _s2s.hostCallback;
        this.locallistenningport = _s2s.locallistenningport;
        this.eventEmitter = _eventEmitter;
        this.version = "0.1";
        this.jid_im = "";
        this.jid_tel = "";
        this.jid_password = "";
        this.fullJid = "";
        this.jid = "";
        this.userId = "";
//        this.initialPresence = true;
//        this.xmppClient = null;
        this.logger = _logger;
        this.proxy = _proxy;
        this.useS2S = false;
        /*
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
// */
        this.xmppUtils = XMPPUTils.getXMPPUtils();

        this.generatedRandomId = this.xmppUtils.generateRandomID();

        this.hash = makeId(8);
        this.s2sEventHandler = new S2SServiceEventHandler(this._rest,  _im, _application, _eventEmitter, _logger, _s2s.hostCallback);
        this.eventEmitter.on("evt_internal_ons2sready", this.onS2SReady.bind(this));

        this.app = express();
        this.logger.log("internal", LOG_ID + "(S2SService) ", this.logger.colors.yellow("S2SService contructor."));
    }

    start(_options, rest, _contacts) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                that.options = _options;
                that.useS2S = that.options.useS2S;
                that._rest = rest;
                that._contacts = _contacts;

                await that.s2sEventHandler.start(that._contacts);
                if (that.useS2S) {
                    that.logger.log("debug", LOG_ID + "(start) S2S hostCallback used : ", that.hostCallback, ", on locallistenningport : ", that.locallistenningport);
                    //that.logger.log("info", LOG_ID + "(start) S2S URL : ", that.serverUR);
                } else {
                    that.logger.log("info", LOG_ID + "(start) S2S connection blocked by configuration");
                    return resolve();
                }
                that.app.use(express.json());
                that.app.listen(that.locallistenningport, function () {
                    that.logger.log("debug", LOG_ID + "Server is running on " + that.locallistenningport + " port");
                });

               /* that.app.post( "/message", (req, res ) => {
                        // console.log( "received a message")
                        // console.log( req.body )
                        // console.log( req.body.message.conversation_id )
                        sendMessageToConv(req.body.message.conversation_id, "J'ai bien recu ton message :" + req.body.message.body )
                        res.send("<html></html>");
                    }
                ) // */

                that.app.all('*', async (req, res) => {
                    res.send('<h1>Hello World!</h1>');
                    that.logger.log("internal", LOG_ID + "*************************************************");
                    that.logger.log("internal", LOG_ID + "received an event: ");
                    that.logger.log("internal", LOG_ID + "METHOD : ", req.method );
                    that.logger.log("internal", LOG_ID + "BASELURL : ", req.baseUrl );
                    that.logger.log("internal", LOG_ID + "ORIGINALURL : ", req.originalUrl );
                    that.logger.log("internal", LOG_ID + "BODY : ", req.body );
                    that.logger.log("internal", LOG_ID + "*************************************************");
                    let body = req.body;
                    that.s2sEventHandler.handleS2SEvent(req);
                });


                resolve();
            } catch (err) {
                return reject(err);
            }
        });
    }

    signin(account, headers) {
        let that = this;
        return new Promise(async (resolve) => {
            that.jid_im = account.jid_im;
            that.jid_tel = account.jid_tel;
            that.jid_password = account.jid_password;
            that.userId = account.id;
            that.fullJid = that.xmppUtils.generateRandomFullJidForNode(that.jid_im, that.generatedRandomId);
            that.jid = account.jid_im;

            that.logger.log("internal", LOG_ID + "(signin) account used, jid_im : ", that.jid_im, ", fullJid : ", that.fullJid);
            await that.deleteAllConnectionsS2S();

            this.s2sEventHandler.setAccount(account);

            resolve(await that.loginS2S(that.hostCallback));
        });
    }

    stop(forceStop: boolean = false) {
        let that = this;
        return new Promise(function (resolve) {
            that.jid_im = "";
            that.jid_tel = "";
            that.jid_password = "";
            that.fullJid = "";
            that.userId = "";
            if (that.useS2S || forceStop) {
                resolve(that.deleteAllConnectionsS2S());
            } else {
                resolve();
            }
        });
    }

    listConnectionsS2S() {
        let that = this;
        that.logger.log("internal", LOG_ID + "(listConnectionsS2S) will get all the cnx S2S");
        return that._rest.listConnectionsS2S()
            .then( response => {
                that.logger.log("debug", LOG_ID + "(listConnectionsS2S) worked." );
                //console.log( response.data )
                //connectionInfo = response.data.data
                that.logger.log("internal", LOG_ID + "(listConnectionsS2S) connexions S2S : ", response );
                return response;
            } );
    }

    sendS2SPresence( obj ) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(sendS2SPresence) set S2S presence : ", obj);
        return that._rest.sendS2SPresence(obj)
            .then( response => {
                that.logger.log("internal", LOG_ID + "(sendS2SPresence) worked." );
                //console.log( response.data )
                //connectionInfo = response.data.data
                that.logger.log("internal", LOG_ID + "(sendS2SPresence) connexions S2S : ", response );
                return response;
            } );
    }

    deleteConnectionsS2S ( connexions ) {
        let that = this;
        that.logger.log("debug", LOG_ID + "(deleteConnectionsS2S) will del cnx S2S.");
        that.logger.log("info", LOG_ID + "(deleteConnectionsS2S) will del cnx S2S : ", connexions);
        if (!connexions && !Array.isArray(connexions)) {
            that.logger.log("warn", LOG_ID + "(deleteConnectionsS2S) bad or empty 'connexions' parameter");
            that.logger.log("internalerror", LOG_ID + "(deleteConnectionsS2S) bad or empty 'connexions' parameter : ", connexions);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        const requests = [];
        return that._rest.deleteConnectionsS2S(connexions)
            .then( response => {
                that.logger.log("debug", LOG_ID + "(deleteConnectionsS2S) worked" );
                //console.log( response.data )
                //connectionInfo = response.data.data
                that.logger.log("internal", LOG_ID + "(deleteConnectionsS2S) connexions S2S: ", response );
                return response;
            } );
    }

    deleteAllConnectionsS2S(){
        let that = this;

        that.logger.log("internal", LOG_ID + "(deleteAllConnectionsS2S) ");
        return that.listConnectionsS2S().then( response => {
            that.logger.log("debug", LOG_ID + "(deleteAllConnectionsS2S) listConnectionsS2S worked." );
            that.logger.log("internal", LOG_ID + "(deleteAllConnectionsS2S) listConnectionsS2S result : ", response );
            return that.deleteConnectionsS2S(response);
        });
    }

    loginS2S (callback_url) {
        let that = this;
        let data = {connection: { /*resource: "s2s_machin",*/  callback_url }};
        that.logger.log("debug", LOG_ID + "(loginS2S) will login  S2S.");
        that.logger.log("internal", LOG_ID + "(loginS2S) will login S2S : ", data);
        return that._rest.loginS2S(callback_url)
            .then( (response: any) => {
                that.logger.log("debug", LOG_ID + "(loginS2S)  worked" );
                //console.log( response.data )
                //connectionInfo = response.data.data
                that.logger.log("internal", LOG_ID + "(loginS2S) connexions S2S : ", response );
                return Promise.resolve(response.data);
            } );
    }

    infoS2S (s2sConnectionId) {
        let that = this;
        that.logger.log("debug", LOG_ID + "(infoS2S)  will get info S2S");
        that.logger.log("internal", LOG_ID + "(infoS2S) will get info S2S");
        return that._rest.infoS2S(s2sConnectionId)
            .then( response => {
                that.logger.log("debug", LOG_ID + "(infoS2S) worked." );
                //console.log( response.data )
                //connectionInfo = response.data.data
                that.logger.log("internal", LOG_ID + "(infoS2S) S2S: ", response );
                return response;
            } );
    }

    // */

    /** S2S EVENTS */

    async onS2SReady(event) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(onS2SReady) S2S READY ENVENT: ", event );
        await this._rest.setS2SConnection(event.id);
    }
}


export { S2SService};
module.exports.S2SService = S2SService;
