"use strict";

import {Bubble} from "./models/Bubble";
import {Logger} from "./Logger";
import {EventEmitter} from "events";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {PresenceService} from "../services/PresenceService";
import {S2SService} from "../services/S2SService";
import {Core} from "../Core";
import {logEntryExit} from "./Utils";
import { List } from "ts-generic-collections-linq";
//import {Dictionary, IDictionary} from "ts-generic-collections-linq";
let AsyncLock = require('async-lock');

export{};

const LOG_ID = "BUBBLES/MNGR - ";

@logEntryExit(LOG_ID)
/**
 *
 */
class BubblesManager {
    private _xmpp: XMPPService;
    private _logger: Logger;
    private _eventEmitter: EventEmitter;
    private _imOptions: any;
    private _rest: RESTService;
    private _presence: PresenceService;
    private _options: any;
    private _s2s: S2SService;
    private _useXMPP: any;
    private _useS2S: any;
//    private bubblesToJoin: IDictionary<string, Bubble> = new Dictionary();
    private poolBubbleToJoin : List<string>; // room Jid;
    private poolBubbleJoinInProgress : List<string>; // room Jid;
    private poolBubbleAlreadyJoined : List<string>;  // room Jid;
    private lock : any;
    private lockKey = "LOCK_BUBBLE_MANAGER";

    static getClassName(){ return 'BubblesManager'; }
    getClassName(){ return BubblesManager.getClassName(); }

    constructor (_eventEmitter : EventEmitter, _logger : Logger) {
        let that = this;
        that._xmpp = null;
        that._rest = null;
        that._s2s = null;
        that._options = {};
        that._useXMPP = false;
        that._useS2S = false;
        that._logger = _logger;
        that._eventEmitter = _eventEmitter;
        //this._imOptions = _imOptions;
        that.lock = new AsyncLock({timeout: 5000, maxPending: 1000});

        that._logger.log("debug", LOG_ID + "(constructor) BubblesManager created successfull");
        that._logger.log("internal", LOG_ID + "(constructor) BubblesManager created successfull");
    }

    init(_options, _core : Core) {
        let that = this;
        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;
                that._options = _options;
                that._s2s = _core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                that._presence = _core.presence;

                that._logger.log("debug", LOG_ID + "(constructor) BubblesManager initialized successfull");
                that._logger.log("internal", LOG_ID + "(constructor) BubblesManager initialized successfull");
                resolve();
            } catch (err) {
                return reject(err);
            }
        });
    }
}

module.exports.BubblesManager = BubblesManager;
export {BubblesManager};
