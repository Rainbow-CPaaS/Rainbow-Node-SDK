"use strict";

import {Dictionary, IDictionary, List} from "ts-generic-collections-linq";
import * as deepEqual from "deep-equal";
import {GuestParams, MEDIATYPE, RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {XMPPService} from "../connection/XMPPService";
import {EventEmitter} from "events";
import {getBinaryData, getJsonFromXML, isStarted, logEntryExit, resizeImage, until} from "../common/Utils";
import {Logger} from "../common/Logger";
import {ContactsService} from "./ContactsService";
import {ProfilesService} from "./ProfilesService";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import * as PubSub from "pubsub-js";
import {GenericService} from "./GenericService";
//import {RBVoice} from "../common/models/rbvoice";
//import {RBVoiceEventHandler} from "../connection/XMPPServiceHandler/rbvoiceEventHandler";
import {Channel} from "../common/models/Channel";
import {HttpoverxmppEventHandler} from "../connection/XMPPServiceHandler/httpoverxmppEventHandler";

export {};

const LOG_ID = "HTTPoverXMPP/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
    /**
     * @module
     * @name HTTPoverXMPP
     * @version SDKVERSION
     * @public
     * @description
     *      This service manages an HTTP over XMPP requests system.<br>
     */
class HTTPoverXMPP extends GenericService {
    private avatarDomain: string;
    private readonly _protocol: string = null;
    private readonly _host: string = null;
    private readonly _port: string = null;
    //private _rbvoice: Array<RBVoice>;

    //private rbvoiceEventHandler: RBVoiceEventHandler;
    //private httpoverxmppEventHandler : HttpoverxmppEventHandler;
    private hTTPoverXMPPHandlerToken: any;


    static getClassName() {
        return 'HTTPoverXMPP';
    }

    getClassName() {
        return HTTPoverXMPP.getClassName();
    }

    constructor(_eventEmitter: EventEmitter, _http: any, _logger: Logger, _startConfig: {
        start_up: boolean,
        optional: boolean
    }) {
        super(_logger, LOG_ID);
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
        this._startConfig = _startConfig;
        this._protocol = _http.protocol;
        this._host = _http.host;
        this._port = _http.port;

        this.avatarDomain = this._host.split(".").length===2 ? this._protocol + "://cdn." + this._host + ":" + this._port:this._protocol + "://" + this._host + ":" + this._port;

        // this._eventEmitter.on("evt_internal_createrbvoice", this.onCreateRBVoice.bind(this));
        // this._eventEmitter.on("evt_internal_deleterbvoice", this.onDeleteRBVoice.bind(this));

    }

    start(_options, _core: Core) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService, _contacts : ContactsService, _profileService : ProfilesService
        let that = this;

        return new Promise(async function (resolve, reject) {
            try {
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;
                that._options = _options;
                that._s2s = _core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                //that._rbvoice = [];
                that.attachHandlers();
                that.setStarted();
                resolve(undefined);
            } catch (err) {
                return reject();
            }
        });
    }

    stop() {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._xmpp = null;
                that._rest = null;
                if (that.hTTPoverXMPPHandlerToken) {
                    that.hTTPoverXMPPHandlerToken.forEach((token) => PubSub.unsubscribe(token));
                }
                that.hTTPoverXMPPHandlerToken = [];
                //that._rbvoice = null;
                that.setStopped();
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        });
    }

    async init(useRestAtStartup : boolean) {
        let that = this;
        that.setInitialized();
    }

    attachHandlers() {
        let that = this;
        //that.httpoverxmppEventHandler = that._xmpp.httpoverxmppEventHandler;
        that.hTTPoverXMPPHandlerToken = [
            //PubSub.subscribe( that._xmpp.hash + "." + that.rbvoiceEventHandler.MESSAGE_MANAGEMENT, that.rbvoiceEventHandler.onManagementMessageReceived.bind(that.rbvoiceEventHandler)),
            //PubSub.subscribe( that._xmpp.hash + "." + that.rbvoiceEventHandler.MESSAGE_ERROR, that.rbvoiceEventHandler.onErrorMessageReceived.bind(that.rbvoiceEventHandler))
        ];
    }

    //region Rainbow HTTPoverXMPP

    /**
     * @public
     * @nodered true
     * @method get
     * @since 2.10.0
     * @instance
     * @async
     * @category Rainbow HTTPoverXMPP
     * @description
     *    This API allows to send a GET http request to an XMPP server supporting Xep0332. <br>
     * @param {string} urlToGet The url to request
     * @param {Object} headers The Http Headers used to web request.
     * @param {string} httpoverxmppserver_jid the jid of the http over xmpp server used to retrieve the HTTP web request. default value is the jid of the account running the SDK.
     * @return {Promise<any>} An object of the result
     */
    get(urlToGet : string, headers: any = {}, httpoverxmppserver_jid? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            if (!urlToGet) {
                that._logger.log("error", LOG_ID + "(get) Parameter 'urlToGet' is missing or null");
                throw ErrorManager.getErrorManager().BAD_REQUEST();
            }

            if (!httpoverxmppserver_jid) {
                httpoverxmppserver_jid = that._xmpp.fullJid;
            }

            try {
                
                let node = await that._xmpp.getHTTPoverXMPP(urlToGet, httpoverxmppserver_jid, headers);
                that._logger.log("debug", "(get) - sent.");
                that._logger.log("internal", "(get) - result : ", node);
                let xmlNodeStr = node ? node.toString():"<xml></xml>";
                let reqObj = await getJsonFromXML(xmlNodeStr);

                resolve(reqObj);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(get) Error.");
                that._logger.log("internalerror", LOG_ID + "(get) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method discoverHTTPoverXMPP
     * @since 2.10.0
     * @instance
     * @async
     * @category Rainbow HTTPoverXMPP
     * @description
     *    This API allows to send a discover presence to a bare jid to find the resources availables. <br>
     * @param {Object} headers The Http Headers used to web request.
     * @param {string} httpoverxmppserver_jid the jid of the http over xmpp server used to retrieve the HTTP web request. default value is the jid of the account running the SDK.
     * @return {Promise<any>} An object of the result
     */
    discoverHTTPoverXMPP(headers: any = {}, httpoverxmppserver_jid? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            if (!httpoverxmppserver_jid) {
                httpoverxmppserver_jid = that._rest.account.jid;
            }

            try {
                
                let node = await that._xmpp.discoverHTTPoverXMPP(httpoverxmppserver_jid, headers);
                that._logger.log("debug", "(discoverHTTPoverXMPP) - sent.");
                that._logger.log("internal", "(discoverHTTPoverXMPP) - result : ", node);
                let xmlNodeStr = node ? node.toString():"<xml></xml>";
                let reqObj = await getJsonFromXML(xmlNodeStr);

                resolve(reqObj);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(discoverHTTPoverXMPP) Error.");
                that._logger.log("internalerror", LOG_ID + "(discoverHTTPoverXMPP) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method trace
     * @since 2.10.0
     * @instance
     * @async
     * @category Rainbow HTTPoverXMPP
     * @description
     *    This API allows to send a TRACE http request to an XMPP server supporting Xep0332. TRACE is only used for debugging <br>
     * @param {string} urlToTrace The url to request
     * @param {Object} headers The Http Headers used to web request.
     * @param {string} httpoverxmppserver_jid the jid of the http over xmpp server used to retrieve the HTTP web request. default value is the jid of the account running the SDK.
     * @return {Promise<any>} An object of the result
     */
    trace(urlToTrace : string, headers: any = {}, httpoverxmppserver_jid? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            if (!urlToTrace) {
                that._logger.log("error", LOG_ID + "(trace) Parameter 'urlToTrace' is missing or null");
                throw ErrorManager.getErrorManager().BAD_REQUEST();
            }

            if (!httpoverxmppserver_jid) {
                httpoverxmppserver_jid = that._xmpp.fullJid;
            }

            try {
                that._logger.log("internal", LOG_ID + "(trace) Parameter urlToTrace : ", urlToTrace, ", headers : ", headers, ", httpoverxmppserver_jid : ", httpoverxmppserver_jid);

                let node = await that._xmpp.traceHTTPoverXMPP(urlToTrace, httpoverxmppserver_jid, headers);
                that._logger.log("debug", "(trace) - sent.");
                that._logger.log("internal", "(trace) - result : ", node);
                let xmlNodeStr = node ? node.toString():"<xml></xml>";
                let reqObj = await getJsonFromXML(xmlNodeStr);

                resolve(reqObj);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(trace) Error.");
                that._logger.log("internalerror", LOG_ID + "(trace) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method head
     * @since 2.10.0
     * @instance
     * @async
     * @category Rainbow HTTPoverXMPP
     * @description
     *    This API allows to send a HEAD http request to an XMPP server supporting Xep0332. <br>
     * @param {string} urlToHead The url to request
     * @param {Object} headers The Http Headers used to web request.
     * @param {string} httpoverxmppserver_jid the jid of the http over xmpp server used to retrieve the HTTP web request. default value is the jid of the account running the SDK.
     * @return {Promise<any>} An object of the result
     */
    head(urlToHead : string, headers: any = {}, httpoverxmppserver_jid? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            if (!urlToHead) {
                that._logger.log("error", LOG_ID + "(head) Parameter 'urlToGet' is missing or null");
                throw ErrorManager.getErrorManager().BAD_REQUEST();
            }

            if (!httpoverxmppserver_jid) {
                httpoverxmppserver_jid = that._xmpp.fullJid;
            }

            try {
                
                let node = await that._xmpp.headHTTPoverXMPP(urlToHead, httpoverxmppserver_jid, headers);
                that._logger.log("debug", "(head) - sent.");
                that._logger.log("internal", "(head) - result : ", node);
                let xmlNodeStr = node ? node.toString():"<xml></xml>";
                let reqObj = await getJsonFromXML(xmlNodeStr);

                resolve(reqObj);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(head) Error.");
                that._logger.log("internalerror", LOG_ID + "(head) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method post
     * @since 2.10.0
     * @instance
     * @async
     * @category Rainbow HTTPoverXMPP
     * @description
     *    This API allows to send a POST http request to an XMPP server supporting Xep0332. <br>
     * @param {string} urlToPost The url to request
     * @param {Object} headers The Http Headers used to web request.
     * @param {string} data The body data of the http request.
     * @param {string} httpoverxmppserver_jid the jid of the http over xmpp server used to retrieve the HTTP web request. default value is the jid of the account running the SDK.
     * @return {Promise<any>} An object of the result
     */    
    post(urlToPost : string, headers: any = {}, data : any, httpoverxmppserver_jid? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            if (!urlToPost) {
                that._logger.log("error", LOG_ID + "(post) Parameter 'urlToPost' is missing or null");
                throw ErrorManager.getErrorManager().BAD_REQUEST();
            }

            if (!httpoverxmppserver_jid) {
                httpoverxmppserver_jid = that._xmpp.fullJid;
            }

            try {
                
                let node = await that._xmpp.postHTTPoverXMPP(urlToPost, httpoverxmppserver_jid, headers, data);
                that._logger.log("debug", "(post) - sent.");
                that._logger.log("internal", "(post) - result : ", node);
                let xmlNodeStr = node ? node.toString():"<xml></xml>";
                let reqObj = await getJsonFromXML(xmlNodeStr);

                resolve(reqObj);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(post) Error.");
                that._logger.log("internalerror", LOG_ID + "(post) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method put
     * @since 2.10.0
     * @instance
     * @async
     * @category Rainbow HTTPoverXMPP
     * @description
     *    This API allows to send a PUT http request to an XMPP server supporting Xep0332. <br>
     * @param {string} urlToPost The url to request
     * @param {Object} headers The Http Headers used to web request.
     * @param {string} data The body data of the http request.
     * @param {string} httpoverxmppserver_jid the jid of the http over xmpp server used to retrieve the HTTP web request. default value is the jid of the account running the SDK.
     * @return {Promise<any>} An object of the result
     */
    put(urlToPost : string, headers: any = {}, data : any, httpoverxmppserver_jid? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            if (!urlToPost) {
                that._logger.log("error", LOG_ID + "(put) Parameter 'urlToPost' is missing or null");
                throw ErrorManager.getErrorManager().BAD_REQUEST();
            }

            if (!httpoverxmppserver_jid) {
                httpoverxmppserver_jid = that._xmpp.fullJid;
            }

            try {
                
                let node = await that._xmpp.putHTTPoverXMPP(urlToPost, httpoverxmppserver_jid, headers, data);
                that._logger.log("debug", "(put) - sent.");
                that._logger.log("internal", "(put) - result : ", node);
                let xmlNodeStr = node ? node.toString():"<xml></xml>";
                let reqObj = await getJsonFromXML(xmlNodeStr);

                resolve(reqObj);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(put) Error.");
                that._logger.log("internalerror", LOG_ID + "(put) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method delete
     * @since 2.10.0
     * @instance
     * @async
     * @category Rainbow HTTPoverXMPP
     * @description
     *    This API allows to send a DELETE http request to an XMPP server supporting Xep0332. <br>
     * @param {string} urlToPost The url to request
     * @param {Object} headers The Http Headers used to web request.
     * @param {string} data The body data of the http request.
     * @param {string} httpoverxmppserver_jid the jid of the http over xmpp server used to retrieve the HTTP web request. default value is the jid of the account running the SDK.
     * @return {Promise<any>} An object of the result
     */
    delete(urlToPost : string, headers: any = {}, data : any, httpoverxmppserver_jid? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            if (!urlToPost) {
                that._logger.log("error", LOG_ID + "(delete) Parameter 'urlToPost' is missing or null");
                throw ErrorManager.getErrorManager().BAD_REQUEST();
            }

            if (!httpoverxmppserver_jid) {
                httpoverxmppserver_jid = that._xmpp.fullJid;
            }

            try {
                
                let node = await that._xmpp.deleteHTTPoverXMPP(urlToPost, httpoverxmppserver_jid, headers, data);
                that._logger.log("debug", "(delete) - sent.");
                that._logger.log("internal", "(delete) - result : ", node);
                let xmlNodeStr = node ? node.toString():"<xml></xml>";
                let reqObj = await getJsonFromXML(xmlNodeStr);

                resolve(reqObj);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(delete) Error.");
                that._logger.log("internalerror", LOG_ID + "(delete) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @private
     * @nodered true
     * @method discover
     * @since 2.10.0
     * @instance
     * @async
     * @category Rainbow HTTPoverXMPP
     * @description
     *    This API allows to get the supported XMPP services. <br>
     * @return {Promise<any>} An object of the result
     */
    discover() {
        let that = this;

        return new Promise(async (resolve, reject) => {

            try {
                
                let result = await that._xmpp.discover();
                that._logger.log("debug", "(discover) - sent.");
                that._logger.log("internal", "(discover) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(discover) Error.");
                that._logger.log("internalerror", LOG_ID + "(discover) Error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Rainbow HTTPoverXMPP

}

module.exports.HTTPoverXMPP = HTTPoverXMPP;
export {HTTPoverXMPP as HTTPoverXMPP};

