"use strict";

import * as util from "util";
import {isStarted, logEntryExit, makeId, setTimeoutPromised} from "../common/Utils";
import * as PubSub from "pubsub-js";
import {Conversation} from "../common/models/Conversation";
import {XMPPUTils} from "../common/XMPPUtils";
import {NameSpacesLabels, XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {InvitationEventHandler} from "../connection/XMPPServiceHandler/invitationEventHandler";
import {S2SServiceEventHandler} from "../connection/S2S/S2SServiceEventHandler";
import {EventEmitter} from "events";
import {Logger} from "../common/Logger";
import {ProxyImpl} from "../ProxyImpl";
import {GenericService} from "./GenericService";
import {Core} from "../Core.js";
import {RPCoverXMPPService} from "./RPCoverXMPPService.js";
const express = require( "express" );

const LOG_ID = "S2S - ";

@logEntryExit(LOG_ID)
@isStarted([])
    /**
     * @module
     * @name s2s
     * @version SDKVERSION
     * @public
     * @description
     *      This module handles the s2s API's methods to Rainbow. <br>
     *      <br><br>
     *      The main methods proposed in that module allow to: <br>
     *      - Signin in s2s mode <br>
     *      - List the user's connections in s2s mode <br>
     *      - Manage presence <br>
     *      - Send presence in bubble <br>
     *      - Send messages <br>
     *      - ... <br>
     */
class S2SService extends GenericService{
    private serverURL: any;
    private host: any;
    public version: any;
    public jid_im: any;
    public jid_tel: any;
    public jid_password: any;
    public fullJid: any;
    public jid: any;
    public userId: any;
    private proxy: any;
    private xmppUtils: XMPPUTils;
    private generatedRandomId: string;
    private hash: string;
    private hostCallback: any;
    private app: any;
    private locallistenningport: string;
    private s2sEventHandler: S2SServiceEventHandler;
    private _contacts: any;
    private _conversations: any;

    static getClassName(){ return 'S2SService'; }
    getClassName(){ return S2SService.getClassName(); }

    static getAccessorName(){ return 's2s'; }
    getAccessorName(){ return S2SService.getAccessorName(); }

    constructor(_core:Core, _s2s: { hostCallback:string, locallistenningport:string }, _im, _application, _eventEmitter : EventEmitter, _logger: Logger, _proxy: ProxyImpl, _startConfig: { start_up:boolean, optional:boolean }) {
        super(_logger, LOG_ID);
        this.setLogLevels(this);
        let that = this;
        this._startConfig = _startConfig;
        this.serverURL = ""; //_s2s.protocol + "://" + _s2s.host + ":" + _s2s.port + "/websocket";
        this.hostCallback = _s2s.hostCallback;
        this.locallistenningport = _s2s.locallistenningport;
        this._eventEmitter = _eventEmitter;
        this.version = "0.1";
        this.jid_im = "";
        this.jid_tel = "";
        this.jid_password = "";
        this.fullJid = "";
        this.jid = "";
        this.userId = "";
//        this.initialPresence = true;
//        this.xmppClient = null;
        this._logger = _logger;
        this.proxy = _proxy;
        this._useS2S = false;
        /*
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

        this._core = _core;

        this.xmppUtils = XMPPUTils.getXMPPUtils();

        this.generatedRandomId = this.xmppUtils.generateRandomID();

        this.hash = makeId(8);
        this.s2sEventHandler = new S2SServiceEventHandler(_im, _application, _eventEmitter, _logger, _s2s.hostCallback);
        this._eventEmitter.on("evt_internal_ons2sready", this.onS2SReady.bind(this));

        that._logger.log(that.INTERNAL, LOG_ID + "(S2SService) ", this._logger.colors.yellow("S2SService contructor."));
    }

    start(_options) {
        let that = this;
        that.initStartDate();

        return new Promise(async (resolve, reject) => {
            try {
                that._options = _options;
                that._useS2S = that._options.useS2S;
                that._rest = that._core._rest;
                that._contacts = that._core._contacts;
                that._conversations = that._core._conversations;
                that.app = express();

                await that.s2sEventHandler.start(that._core);
                if (that._useS2S) {
                    that._logger.log(that.DEBUG, LOG_ID + "(start) S2S hostCallback used : ", that.hostCallback, ", on locallistenningport : ", that.locallistenningport);
                    //that._logger.log(that.INFO, LOG_ID + "(start) S2S URL : ", that.serverUR);
                } else {
                    that._logger.log(that.INFO, LOG_ID + "(start) S2S connection blocked by configuration");
                    that.setStarted ();
                    return resolve(undefined);
                }
                that.app.use(express.json());
                that.app.listen(that.locallistenningport, function () {
                    that._logger.log(that.DEBUG, LOG_ID + "Server is running on " + that.locallistenningport + " port");
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
                    that._logger.log(that.INTERNAL, LOG_ID + "*************************************************");
                    that._logger.log(that.INTERNAL, LOG_ID + "received an event: ");
                    that._logger.log(that.INTERNAL, LOG_ID + "METHOD : ", req.method );
                    that._logger.log(that.INTERNAL, LOG_ID + "BASELURL : ", req.baseUrl );
                    that._logger.log(that.INTERNAL, LOG_ID + "ORIGINALURL : ", req.originalUrl );
                    that._logger.log(that.INTERNAL, LOG_ID + "BODY : ", req.body );
                    that._logger.log(that.INTERNAL, LOG_ID + "*************************************************");
                    let body = req.body;
                    that.s2sEventHandler.handleS2SEvent(req);
                });

                that.setStarted ();
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @private
     * @name signin
     * @param account
     * @param headers
     */
    signin(account, headers) {
        let that = this;
        return new Promise(async (resolve) => {
            that.jid_im = account.jid_im;
            that.jid_tel = account.jid_tel;
            that.jid_password = account.jid_password;
            that.userId = account.id;
            that.fullJid = that.xmppUtils.generateRandomFullJidForS2SNode(that.jid_im, that.generatedRandomId);
            that.jid = account.jid_im;

            that._logger.log(that.INTERNAL, LOG_ID + "(signin) account used, jid_im : ", that.jid_im, ", fullJid : ", that.fullJid);
            await that.deleteAllConnectionsS2S();

            this.s2sEventHandler.setAccount(account);

            resolve(await that.loginS2S(that.hostCallback));
        });
    }

    /**
     * @private
     * @param forceStop
     */
    stop(forceStop: boolean = false) {
        let that = this;
        return new Promise(function (resolve) {
            that.jid_im = "";
            that.jid_tel = "";
            that.jid_password = "";
            that.fullJid = "";
            that.userId = "";
            that._logger.log(that.DEBUG, LOG_ID + "(stop)" );
            if (that._useS2S || forceStop) {
                resolve(that.deleteAllConnectionsS2S().then(() => {
                    that.setStopped ();
                }));
            } else {
                that.setStopped ();
                resolve(undefined);
            }
        });
    }

    async init (useRestAtStartup : boolean) {
        let that = this;
        that.setInitialized();
    }
    
    // region S2S Management
    
    /**
     * @public
     * @nodered true
     * @method listConnectionsS2S
     * @instance
     * @category S2S Management
     * @description
     *      List all the connected user's connexions. <br>
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - List of connexions or an error object depending on the result
     
     */
    async listConnectionsS2S() {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(listConnectionsS2S) will get all the cnx S2S");
        return that._rest.listConnectionsS2S()
            .then( response => {
                that._logger.log(that.DEBUG, LOG_ID + "(listConnectionsS2S) worked." );
                //console.log( response.data )
                //connectionInfo = response.data.data
                that._logger.log(that.INTERNAL, LOG_ID + "(listConnectionsS2S) connexions S2S : ", response );
                return response;
            } );
    }

    /**
     * @public
     * @nodered true
     * @method checkS2Sconnection
     * @instance
     * @category S2S Management
     * @description
     *      check the S2S connection with a head request. <br>
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - List of connexions or an error object depending on the result
     
     */
    async checkS2Sconnection() {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(checkS2Sconnection) check the cnx S2S");
        return that._rest.checkS2Sconnection()
            .then( response => {
                that._logger.log(that.DEBUG, LOG_ID + "(checkS2Sconnection) worked." );
                //console.log( response.data )
                //connectionInfo = response.data.data
                that._logger.log(that.INTERNAL, LOG_ID + "(checkS2Sconnection) connexions S2S OK : ", response );
                return response;
            } );
    }

    /**
     * @private
     * @nodered true
     * @method deleteConnectionsS2S
     * @instance
     * @category S2S Management
     * @param {Array} connexions a List of connections S2S to delete
     * @description
     *      Delete one by one a list of S2S connections of the connected user. <br>
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - List of connexions or an error object depending on the result
     
     */
    async deleteConnectionsS2S ( connexions ) {
        let that = this;
        that._logger.log(that.DEBUG, LOG_ID + "(deleteConnectionsS2S) will del cnx S2S.");
        that._logger.log(that.INFO, LOG_ID + "(deleteConnectionsS2S) will del cnx S2S : ", connexions);
        if (!connexions && !Array.isArray(connexions)) {
            that._logger.log(that.WARN, LOG_ID + "(deleteConnectionsS2S) bad or empty 'connexions' parameter");
            that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteConnectionsS2S) bad or empty 'connexions' parameter : ", connexions);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        const requests = [];
        return that._rest.deleteConnectionsS2S(connexions)
            .then( response => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteConnectionsS2S) worked" );
                //console.log( response.data )
                //connectionInfo = response.data.data
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteConnectionsS2S) connexions S2S: ", response );
                return response;
            } );
    }

    /**
     * @public
     * @nodered true
     * @method deleteAllConnectionsS2S
     * @instance
     * @category S2S Management
     * @description
     *      Delete all the connected user's S2S connexions. <br>
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - List of connexions or an error object depending on the result
     
     */
    async deleteAllConnectionsS2S(){
        let that = this;

        that._logger.log(that.INTERNAL, LOG_ID + "(deleteAllConnectionsS2S) ");
        return that.listConnectionsS2S().then( response => {
            that._logger.log(that.DEBUG, LOG_ID + "(deleteAllConnectionsS2S) listConnectionsS2S worked." );
            that._logger.log(that.INTERNAL, LOG_ID + "(deleteAllConnectionsS2S) listConnectionsS2S result : ", response );
            return that.deleteConnectionsS2S(response);
        });
    }

    /**
     * @private
     * @method loginS2S
     * @instance
     * @category S2S Management
     * @param {String} callback_url The web site which is the callback where the S2S events are sent by Rainbow server
     * @description
     *      Login to S2S event server the already connected user to REST API server. <br>
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - List of connexions or an error object depending on the result
     
     */
    async loginS2S (callback_url) {
        let that = this;
        let data = {connection: { /*resource: "s2s_machin",*/  callback_url }};
        that._logger.log(that.DEBUG, LOG_ID + "(loginS2S) will login  S2S.");
        that._logger.log(that.INTERNAL, LOG_ID + "(loginS2S) will login S2S : ", data);
        return that._rest.loginS2S(callback_url)
            .then( (response: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(loginS2S)  worked" );
                //console.log( response.data )
                //connectionInfo = response.data.data
                that._logger.log(that.INTERNAL, LOG_ID + "(loginS2S) connexions S2S : ", response );
                return Promise.resolve(response);
            } );
    }

    /**
     * @public
     * @nodered true
     * @method infoS2S
     * @instance
     * @category S2S Management
     * @param {String} s2sConnectionId The id of the S2S conneexion to retrieve informations about.
     * @description
     *      Get informations about a S2S connexions. <br>
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - List of connexions or an error object depending on the result
     
     */
    async infoS2S (s2sConnectionId) {
        let that = this;
        that._logger.log(that.DEBUG, LOG_ID + "(infoS2S)  will get info S2S");
        that._logger.log(that.INTERNAL, LOG_ID + "(infoS2S) will get info S2S");
        return that._rest.infoS2S(s2sConnectionId)
            .then( response => {
                that._logger.log(that.DEBUG, LOG_ID + "(infoS2S) worked." );
                //console.log( response.data )
                //connectionInfo = response.data.data
                that._logger.log(that.INTERNAL, LOG_ID + "(infoS2S) S2S: ", response );
                return response;
            } );
    }

    //endregion S2S Management

    //region Events 

    async onS2SReady(event) {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(onS2SReady) S2S READY ENVENT: ", event );
        await this._rest.setS2SConnection(event.id).catch(err=>{
            that._logger.log(that.WARN, LOG_ID + "(onS2SReady) setS2SConnection error : ", err);
        });
    }

    //endregion Events
    
    //region S2S Methods 

    /**
     * @private
     * @method sendS2SPresence
     * @instance
     * @category S2S Methods
     * @param {Object} obj Object {show, status} describing the presence : <br>
     *  To put presence to cases : <br>
     * "online":     {show = undefined, status = "mode=auto"} <br>
     * "away": {show = "xa", status = "away"} <br>
     * "dnd": {show = "dnd", status = ""} <br>
     * "invisible": {show = "xa", status = ""} <br>
     * @description
     *      set the presence of the connected user with s2s api . <br>
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - List of connexions or an error object depending on the result
     
     */
    sendS2SPresence( obj ) {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(sendS2SPresence) set S2S presence : ", obj);
        return that._rest.sendS2SPresence(obj)
                .then( response => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(sendS2SPresence) worked." );
                    //console.log( response.data )
                    //connectionInfo = response.data.data
                    that._logger.log(that.INTERNAL, LOG_ID + "(sendS2SPresence) connexions S2S : ", response );
                    return response;
                } );
    }

    /**
     * @public
     * @nodered true
     * @method sendMessageInConversation
     * @instance
     * @category S2S Methods
     * @param {String} conversationId
     * @param {String} msg The message object to send. <br>
     * { <br>
     *   "message": { <br>
     *   "subject": "Greeting", <br>
     *   "lang": "en", <br>
     *   "contents": [ <br>
     *     { <br>
     *       "type": "text/markdown", <br>
     *       "data": "## Hello Bob" <br>
     *     } <br>
     *   ], <br>
     *   "body": "Hello world" <br>
     *   } <br>
     * } <br>
     * @description
     *      Send a message in a conversation. Note, corrected message is not yet supported. <br>
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - List of connexions or an error object depending on the result
     
     */
    sendMessageInConversation(conversationId, msg) {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(sendMessageInConversation) will send msg S2S : ", msg, " in conv id : ", conversationId);
        return that._rest.sendS2SMessageInConversation(conversationId, msg).then( response => {
                that._logger.log(that.DEBUG, LOG_ID + "(sendMessageInConversation) worked." );
                //console.log( response.data )
                //connectionInfo = response.data.data
                that._logger.log(that.INTERNAL, LOG_ID + "(sendMessageInConversation) S2S response : ", response );
                return response;
            } );
    }

    /**
     * @private
     * @method joinRoom
     * @param {String} bubbleId The id of the bubble to open the conversation.
     * @param {string} role Enum: "member" "moderator" of your role in this room
     * @category S2S Methods
     * @instance
     * @description
     *      send presence in S2S to join a bubble conversation <br>
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - List of connexions or an error object depending on the result
     
     */
    joinRoom(bubbleId, role : ROOMROLE) {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(joinRoom) will send presence to joinRoom S2S, bubbleId : ", bubbleId);
        return that._rest.joinS2SRoom(bubbleId, role).then( response => {
                that._logger.log(that.DEBUG, LOG_ID + "(joinRoom) worked." );
                //console.log( response.data )
                //connectionInfo = response.data.data
                that._logger.log(that.INTERNAL, LOG_ID + "(joinRoom) S2S response : ", response );
                return response;
            } );
    }
    
    //endregion S2S Methods
}

/**
 * The role of the Contact in the Bubble.
 * @public
 * @enum {string}
 * @readonly
 */
enum ROOMROLE  {
    MODERATOR = "moderator",
    MEMBER = "member"
};

export { S2SService, ROOMROLE};
module.exports.S2SService = S2SService;
module.exports.ROOMROLE = ROOMROLE;
