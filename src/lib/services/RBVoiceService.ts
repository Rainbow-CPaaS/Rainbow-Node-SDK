"use strict";

import {Dictionary, IDictionary, List} from "ts-generic-collections-linq";
import * as deepEqual from "deep-equal";
import {GuestParams, MEDIATYPE, RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {XMPPService} from "../connection/XMPPService";
import {EventEmitter} from "events";
import {getBinaryData, isStarted, logEntryExit, resizeImage, until} from "../common/Utils";
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

export {};

const LOG_ID = "WEBINAR/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name RBVoiceService
 * @version SDKVERSION
 * @public
 * @description
 *      This service manages .<br>
 */
class RBVoiceService extends GenericService {
    private avatarDomain: string;
    private readonly _protocol: string = null;
    private readonly _host: string = null;
    private readonly _port: string = null;
    //private _rbvoice: Array<RBVoice>;

    //private rbvoiceEventHandler: RBVoiceEventHandler;
    private rbvoiceHandlerToken: any;


    static getClassName(){ return 'RBVoiceService'; }
    getClassName(){ return RBVoiceService.getClassName(); }

    constructor(_eventEmitter: EventEmitter, _http: any, _logger: Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
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

        this.avatarDomain = this._host.split(".").length === 2 ? this._protocol + "://cdn." + this._host + ":" + this._port : this._protocol + "://" + this._host + ":" + this._port;

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
                that.setStarted ();
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
                if (that.rbvoiceHandlerToken) {
                    that.rbvoiceHandlerToken.forEach((token) => PubSub.unsubscribe(token));
                }
                that.rbvoiceHandlerToken = [];
                //that._rbvoice = null;
                that.setStopped ();
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        });
    }
    
    async init() {
        let that = this;
        that.setInitialized();
    }

    attachHandlers() {
        let that = this;
        //that.rbvoiceEventHandler = new RBVoiceEventHandler(that._xmpp, that);
        that.rbvoiceHandlerToken = [
            //PubSub.subscribe( that._xmpp.hash + "." + that.rbvoiceEventHandler.MESSAGE_MANAGEMENT, that.rbvoiceEventHandler.onManagementMessageReceived.bind(that.rbvoiceEventHandler)),
            //PubSub.subscribe( that._xmpp.hash + "." + that.rbvoiceEventHandler.MESSAGE_ERROR, that.rbvoiceEventHandler.onErrorMessageReceived.bind(that.rbvoiceEventHandler))
        ];
    }

    //region RBVoice
    //endregion RBVoice
}

module.exports.RBVoiceService = RBVoiceService;
export {RBVoiceService as RBVoiceService};

