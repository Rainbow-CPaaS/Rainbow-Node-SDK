"use strict";

import {Bubble, getBubbleLogInfos} from "./models/Bubble";
import {Logger} from "./Logger";
import {EventEmitter} from "events";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {PresenceService} from "../services/PresenceService";
import {S2SService} from "../services/S2SService";
import {Core} from "../Core";
import {getRandomInt, logEntryExit, pause, stackTrace, until} from "./Utils";
import { List } from "ts-generic-collections-linq";
import {Dictionary, IDictionary} from "ts-generic-collections-linq";
import {KeyValuePair} from "ts-generic-collections-linq/lib/dictionary";
import {ConferenceSession} from "./models/ConferenceSession";
import {BubblesService} from "../services/BubblesService";
let AsyncLock = require('async-lock');
import {FibonacciStrategy} from "backoff";
import { LevelLogs } from "./LevelLogs.js";

//let backoff = require("backoff");

export{};

const LOG_ID = "BUBBLES/MNGR - ";

const RECONNECT_INITIAL_DELAY = 15000;
const RECONNECT_MAX_DELAY = 120000;

@logEntryExit(LOG_ID)
/**
 *
 */
class BubblesManager extends LevelLogs {
    private _xmpp: XMPPService;
    private _logger: Logger;
    private _eventEmitter: EventEmitter;
    private _imOptions: any;
    private _rest: RESTService;
    private _presence: PresenceService;
    private _bubblesservice: BubblesService;
    private _options: any;
    private _s2s: S2SService;
    private _useXMPP: any;
    private _useS2S: any;
    private fibonacciStrategy: FibonacciStrategy = new FibonacciStrategy({
        randomisationFactor: 0.4,
        initialDelay: RECONNECT_INITIAL_DELAY,
        maxDelay: RECONNECT_MAX_DELAY
    }); // */
    private poolBubbleToJoin: IDictionary<string, Bubble> = new Dictionary();
    private poolBubbleJoinInProgress: IDictionary<string, Bubble> = new Dictionary(); // room Jid;
    private poolBubbleAlreadyJoined: IDictionary<string, Bubble> = new Dictionary(); // room Jid;
//    private poolBubbleToJoin: List<string>; // room Jid;
//    private poolBubbleJoinInProgress: List<string>; // room Jid;
//    private poolBubbleAlreadyJoined: List<string>;  // room Jid;
    private lockEngine: any;
    private lockKey = "LOCK_BUBBLE_MANAGER";
    private nbBubbleAdded : number = 0;
    private delay: number = 15000;
    private MAXBUBBLEJOJNINPROGRESS = 3;
    private maxBubbleJoinInProgress = 3;

    static getClassName() {
        return 'BubblesManager';
    }

    getClassName() {
        return BubblesManager.getClassName();
    }

    static getAccessorName(){ return 'bubblesmanager'; }
    getAccessorName(){ return BubblesManager.getAccessorName(); }

    constructor(_eventEmitter: EventEmitter, _logger: Logger) {
        super();
        let that = this;
        that.setLogLevels(that);
        that._xmpp = null;
        that._rest = null;
        that._s2s = null;
        that._options = {};
        that._useXMPP = false;
        that._useS2S = false;
        that._logger = _logger;
        that._eventEmitter = _eventEmitter;

        //this._imOptions = _imOptions;
        that.lockEngine = new AsyncLock({timeout: 5000, maxPending: 1000});


        //this._eventEmitter.on("evt_internal_bubbleaffiliationchanged", this._onBubbleaffiliationchanged.bind(this));
        this._eventEmitter.on("evt_internal_ownaffiliationchanged", this._onOwnAffiliationChanged.bind(this));
        this._eventEmitter.on("evt_internal_onbubblepresencechanged", this._onbubblepresencechanged.bind(this));

        // that._logger.log(that.DEBUG, LOG_ID + "(constructor) BubblesManager created successfull");
        that._logger.log(that.INFO, LOG_ID + `=== CONSTRUCTED at (${new Date()} ===`);
        that._logger.log(that.INTERNAL, LOG_ID + "(constructor) BubblesManager created successfull nbBubbleAdded : ", that.nbBubbleAdded);
    }

    init(_options, _core: Core) {
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;
                that._options = _options;
                that._s2s = _core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                that._presence = _core.presence;
                that._bubblesservice = _core.bubbles;

                that.maxBubbleJoinInProgress = that._options._imOptions.maxBubbleJoinInProgress ? that._options._imOptions.maxBubbleJoinInProgress : that.MAXBUBBLEJOJNINPROGRESS;

                that._logger.log(that.DEBUG, LOG_ID + "(constructor) BubblesManager initialized successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(constructor) BubblesManager initialized successfull");
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        });
    }

    async reset(): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(reset) We clear the Bubbles from poolBubbleAlreadyJoined, poolBubbleJoinInProgress, poolBubbleToJoin.");
            that.lock(() => {
                // Treatment in the lock
                that.poolBubbleAlreadyJoined.clear();
                that.poolBubbleJoinInProgress.clear();
                that.poolBubbleToJoin.clear();
                that.nbBubbleAdded = 0;
                return "reseted";
            }).then((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(reset) Succeed - result : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(reset) Failed - result : ", result);
                resolve(undefined);
            });
        });
    }
    
    //region Lock

    lock(fn) {
        let that = this;
        let opts = undefined;
        return that.lockEngine.acquire(that.lockKey,
            async function () {
                // that._logger.log(that.DEBUG, LOG_ID + "(lock) lock the ", that.lockKey);
                that._logger.log(that.INTERNAL, LOG_ID + "(lock) lock the ", that.lockKey);
                return await fn(); // async work
            }, opts).then((result) => {
            // that._logger.log(that.DEBUG, LOG_ID + "(lock) release the ", that.lockKey);
            that._logger.log(that.INTERNAL, LOG_ID + "(lock) release the ", that.lockKey, ", result.id : ", result?.id, ", result.jid : ", result?.jid, ", result.name : ", result?.name, ", result.status : ", result?.status);
            return result;
        });
    }

    //endregion

    //region Queue Management

    async addBubbleToJoin(bubble): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let roomJid = bubble.jid ? bubble.jid : bubble.roomJid;
                if ( (!that.poolBubbleToJoin.containsKey(roomJid)) && (!that.poolBubbleAlreadyJoined.containsKey(roomJid)) && (bubble.initialPresence == undefined || ((bubble.initialPresence) && (!bubble.initialPresence.initPresenceAck))) )
                {
                    that.nbBubbleAdded++;
                    that._logger.log(that.DEBUG, LOG_ID + "(addBubbleToJoin) We add the Bubble in the pool poolBubbleToJoin to join it as soon as possible - bubbleLogInfos : ", getBubbleLogInfos(bubble),", nbBubbleAdded : ", that.nbBubbleAdded);
                    that.poolBubbleToJoin.add(roomJid, bubble);
                    //needToAsk = true;
                    return bubble
                } else {
                    that._logger.log(that.DEBUG, LOG_ID + "(addBubbleAlreadyJoined) The Bubble is Already Joined - for " + getBubbleLogInfos(bubble) );
                }
                return ;
            }).then((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(addBubbleToJoin) Succeed - Jid : ", result);
                return resolve(result);
            }).catch((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(addBubbleToJoin) Failed - Jid : ", result);
                resolve(undefined);
            });
        });
    }

    async removeBubbleToJoin(bubble): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let roomJid = bubble?.jid;
                if ( (that.poolBubbleToJoin.containsKey(roomJid)) )
                {
                    that._logger.log(that.DEBUG, LOG_ID + "(removeBubbleToJoin) We remove the Bubble from poolBubbleToJoin - bubbleLogInfos : ", getBubbleLogInfos(bubble));
                    that.poolBubbleToJoin.remove((item: KeyValuePair<string, Bubble>) => {
                        return roomJid === item.key;
                    });
                    //needToAsk = true;
                }
            }).then((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(removeBubbleToJoin) Succeed - Jid : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(removeBubbleToJoin) Failed - Jid : ", result);
                resolve(undefined);
            });
        });
    }

    async getBubbleToJoin() : Promise<Bubble>{
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let item: KeyValuePair<string, Bubble> = that.poolBubbleToJoin.elementAt(0);
                if (!item) return ;
                let roomJid = item.key;
                let bubble = item.value;
                that._logger.log(that.DEBUG, LOG_ID + "(getBubbleToJoin) We retrieved the Bubble from poolBubbleToJoin - bubbleLogInfos : ", getBubbleLogInfos(bubble));

                that._logger.log(that.DEBUG, LOG_ID + "(getBubbleToJoin) We remove the Bubble from poolBubbleToJoin - bubbleLogInfos : ", getBubbleLogInfos(bubble));
                that.poolBubbleToJoin.remove((item: KeyValuePair<string, Bubble>) => {
                    return roomJid === item.key;
                });
                return bubble;
            }).then((bubble) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubbleToJoin) Succeed - bubbleLogInfos : ", getBubbleLogInfos(bubble));
                resolve(bubble);
            }).catch((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(getBubbleToJoin) Failed - result : ", result);
                resolve(undefined);
            });
        });
    }

    async treatAllBubblesToJoin(bulkSendPresence : boolean = true) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            that._logger.log(that.DEBUG, LOG_ID + "(treatAllBubblesToJoin) start with nbBubbleAdded : ", that.nbBubbleAdded, ", that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);

            if (bulkSendPresence) {
                if (that._useXMPP) {
                    //for (let iterBubbleToJoin = 0; that.poolBubbleJoinInProgress.length < (that.maxBubbleJoinInProgress + 1) && iterBubbleToJoin < that.maxBubbleJoinInProgress; iterBubbleToJoin++) {
                    let iterBubbleToJoin = 0;
                    let bubble = await that.getBubbleToJoin();
                    if (bubble) {
                        while (bubble) {
                            that._logger.log(that.DEBUG, LOG_ID + "(treatAllBubblesToJoin) bulkSendPresence bubble found at ", iterBubbleToJoin, ", for the initial presence to bubbleLogInfos : ", getBubbleLogInfos(bubble));
                            await that.addBubbleToJoinInProgress(bubble); // poolBubbleJoinInProgress.add(bubble.jid, bubble);
                            bubble = await that.getBubbleToJoin();
                            iterBubbleToJoin++;
                        }
                        that._logger.log(that.DEBUG, LOG_ID + "(treatAllBubblesToJoin) bulkSendPresence ", iterBubbleToJoin, " bubbles found and setted in poolBubbleJoinInProgress.");
                    } else {
                        that._logger.log(that.DEBUG, LOG_ID + "(treatAllBubblesToJoin) bulkSendPresence bubble undefined at ", iterBubbleToJoin, ", so do not send the initial presence to bubbleLogInfos : ", getBubbleLogInfos(bubble));
                    }
                    //}
                    await that._presence.sendInitialAllBubblePresence().then(() => {
                        that._logger.log(that.DEBUG, LOG_ID + "(treatAllBubblesToJoin) bulkSendPresence sent");
                    }).catch(async (err) => {
                        that._logger.log(that.ERROR, LOG_ID + "(treatAllBubblesToJoin) bulkSendPresence FAILED wait treat group of that.maxBubbleJoinInProgress : " + that.maxBubbleJoinInProgress + " bubbles to join from poolBubbleJoinInProgress, before pause : ", that.delay, ", it left that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length, ", error : ", err);
                        await pause(that.delay);
                        that._logger.log(that.ERROR, LOG_ID + "(treatAllBubblesToJoin) bulkSendPresence FAILED wait treat group of that.maxBubbleJoinInProgress : " + that.maxBubbleJoinInProgress + " bubbles to join from poolBubbleJoinInProgress, after pause : ", that.delay, ", it left that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);
                        await that.resetBubbleFromJoinInProgressToBubbleToJoin();
                        that.delay = that.fibonacciStrategy.next();
                    });
                    await until(() => {
                        return (that.poolBubbleJoinInProgress.length==0 && that.poolBubbleToJoin.length==0);
                    }, "Wait for the Bubbles from that.poolBubbleToJoin to be joined.", 120000).catch((err) => {
                        that._logger.log(that.INTERNAL, LOG_ID + "(treatAllBubblesToJoin) FAILED wait for the bubbles to be joined, it left that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length, ", it left that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", error : ", err);
                    });
                    that._logger.log(that.DEBUG, LOG_ID + "(treatAllBubblesToJoin) End of treatment of bubbles to join, that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length, ", that.poolBubbleAlreadyJoined.length : ", that.poolBubbleAlreadyJoined.length);
                } else if (that._useS2S) {
// en S2S: https://api.openrainbow.org/doc/api/ucs/redoc-index.html#tag/Room/operation/Room.join_all
                }
            } else {
                // Need to keep the bulle by bulle send process for S2S.
                if (that.poolBubbleToJoin.length > 0 && that.poolBubbleJoinInProgress.length==0) {
                    let start = true;
                    that.fibonacciStrategy.reset();
                    that.delay = that.fibonacciStrategy.getInitialDelay();

                    // @ts-ignore
                    if (that.poolBubbleToJoin && Array.isArray(that.poolBubbleToJoin?.list)) {
                        // @ts-ignore
                        that.poolBubbleToJoin.list.sort((a, b) => that._rest.getBubbleLastActivityDate(b?.value) - that._rest.getBubbleLastActivityDate(a?.value));
                        // lastActivityDate
                        //bubbles = orderByFilter( bubbles, that.getBubbleLastActivityDate, true, that.sortByDate);
                    }

                    while ((that.poolBubbleToJoin.length > 0 || that.poolBubbleJoinInProgress.length > 0) || start==true) {
                        that._logger.log(that.DEBUG, LOG_ID + "(treatAllBubblesToJoin) START with pause value : ", that.delay, "  treat a group of " + that.maxBubbleJoinInProgress + " bubbles to join, that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);
                        start = false;
                        let prom = [];
                        for (let iterBubbleToJoin = 0; that.poolBubbleJoinInProgress.length < (that.maxBubbleJoinInProgress + 1) && iterBubbleToJoin < that.maxBubbleJoinInProgress; iterBubbleToJoin++) {
                            let bubble = await that.getBubbleToJoin();
                            if (bubble) {
                                that._logger.log(that.INTERNAL, LOG_ID + "(treatAllBubblesToJoin) bubble found at ", iterBubbleToJoin, ", for the initial presence to bubbleLogInfos : ", getBubbleLogInfos(bubble));
                                await that.addBubbleToJoinInProgress(bubble); // poolBubbleJoinInProgress.add(bubble.jid, bubble);
                                let test = false;
                                if (getRandomInt(2)==1 || !test) {
                                    that._logger.log(that.DEBUG, LOG_ID + "(treatAllBubblesToJoin) bubble found at ", iterBubbleToJoin, ", send the initial presence to bubbleLogInfos : ", getBubbleLogInfos(bubble));
                                    prom.push(that._presence.sendInitialBubblePresenceSync(bubble, 3 * 1000 * 60).catch((errOfSent) => {
                                        that._logger.log(that.WARN, LOG_ID + "(treatAllBubblesToJoin) Error while sendInitialBubblePresenceSync : ", errOfSent);
                                    }));
                                } else {
                                    that._logger.log(that.DEBUG, LOG_ID + "(treatAllBubblesToJoin) bubble found at ", iterBubbleToJoin, ", because of random test do not send the initial presence to bubble?.id : ", bubble?.id, ", bubble?.jid : ", bubble?.jid, ", bubble?.name : ", bubble?.name, ", bubble?.status : ", bubble?.status);
                                }
                            } else {
                                that._logger.log(that.DEBUG, LOG_ID + "(treatAllBubblesToJoin) bubble undefined at ", iterBubbleToJoin, ", so do not send the initial presence to bubble?.id : ", bubble?.id, ", bubble?.jid : ", bubble?.jid, ", bubble?.name : ", bubble?.name, ", bubble?.status : ", bubble?.status);
                            }
                        }

                        await Promise.all(prom).then((result) => {
                            that._logger.log(that.DEBUG, LOG_ID + "(treatAllBubblesToJoin) Promise.all DONE , that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);
                            /*
                            // For testing, force empty join in progress to continue the send
                            that.poolBubbleJoinInProgress.clear();
                            that._logger.log(that.DEBUG, LOG_ID + "(treatAllBubblesToJoin) Promise.all DONE , that.poolBubbleJoinInProgress.length cleared : ", that.poolBubbleJoinInProgress.length);
                            // */
                        }).catch(async (err) => {
                            that._logger.log(that.ERROR, LOG_ID + "(treatAllBubblesToJoin) FAILED wait treat group of that.maxBubbleJoinInProgress : " + that.maxBubbleJoinInProgress + " bubbles to join from poolBubbleJoinInProgress, before pause : ", that.delay, ", it left that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length, ", error : ", err);
                            await pause(that.delay);
                            that._logger.log(that.ERROR, LOG_ID + "(treatAllBubblesToJoin) FAILED wait treat group of that.maxBubbleJoinInProgress : " + that.maxBubbleJoinInProgress + " bubbles to join from poolBubbleJoinInProgress, after pause : ", that.delay, ", it left that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);
                            await that.resetBubbleFromJoinInProgressToBubbleToJoin();
                            that.delay = that.fibonacciStrategy.next();
                        });
                        await until(() => {
                            return (that.poolBubbleJoinInProgress.length===0);
                        }, "Wait treat group of " + that.maxBubbleJoinInProgress + " bubbles to join from poolBubbleJoinInProgress.", 3 * 1000 * 60).then(() => {
                            that._logger.log(that.INTERNAL, LOG_ID + "(treatAllBubblesToJoin) SUCCEED to send the poolBubbleJoinInProgress pool.");
                            that.fibonacciStrategy.reset();
                            that.delay = that.fibonacciStrategy.getInitialDelay();
                        }).catch(async (err) => {
                            that._logger.log(that.ERROR, LOG_ID + "(treatAllBubblesToJoin) FAILED wait treat group of " + that.maxBubbleJoinInProgress + " bubbles to join from poolBubbleJoinInProgress, before pause : ", that.delay, ", it left that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length, ", error : ", err);
                            await pause(that.delay);
                            that._logger.log(that.ERROR, LOG_ID + "(treatAllBubblesToJoin) FAILED wait treat group of " + that.maxBubbleJoinInProgress + " bubbles to join from poolBubbleJoinInProgress, after pause : ", that.delay, ", it left that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);
                            await that.resetBubbleFromJoinInProgressToBubbleToJoin();
                            that.delay = that.fibonacciStrategy.next();
                        }); // */
                        that._logger.log(that.DEBUG, LOG_ID + "(treatAllBubblesToJoin) END treat group of that.maxBubbleJoinInProgress : " + that.maxBubbleJoinInProgress + " bubbles to join from poolBubbleJoinInProgress, that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);
                    }
                    await until(() => {
                        return (that.poolBubbleJoinInProgress.length==0 && that.poolBubbleToJoin.length==0);
                    }, "Wait for the Bubbles from that.poolBubbleToJoin to be joined.", 120000).catch((err) => {
                        that._logger.log(that.INTERNAL, LOG_ID + "(treatAllBubblesToJoin) FAILED wait for the bubbles to be joined, it left that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length, ", it left that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", error : ", err);
                    });
                    that._logger.log(that.DEBUG, LOG_ID + "(treatAllBubblesToJoin) End of treatment of bubbles to join, that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length, ", that.poolBubbleAlreadyJoined.length : ", that.poolBubbleAlreadyJoined.length);
                } else {
                    that._logger.log(that.WARN, LOG_ID + "(treatAllBubblesToJoin) No bubble to join, and no bublle already in progress to join.");
                }
            }
            resolve("done");
        });
    }

    /**
     * @private
     * @method _onBubbleaffiliationchanged
     * @instance
     * @param {Object} bubble contains information about bubble and user's jid
     * @description
     *      Method called when affilitation (presence) to a bubble changed
     */
    async _onBubbleaffiliationchanged(bubble : any) {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(_onBubbleaffiliationchanged) bubbleLogInfos : ", getBubbleLogInfos(bubble));
        if (bubble) {
            await that.removeBubbleToJoinInProgress(bubble);
            await that.addBubbleAlreadyJoined(bubble);
        }
    }

    /**
     * @private
     * @method _onOwnAffiliationChanged
     * @instance
     * @param {Object} bubble contains information about bubble and user's jid
     * @description
     *      Method called when affilitation (presence) to a bubble changed
     */
    async _onOwnAffiliationChanged(bubble : any) {
        let that = this;
        //that._logger.log(that.INTERNAL, LOG_ID + "(_onOwnAffiliationChanged) bubble?.id : ", bubble?.id, ", bubble?.jid : ", bubble?.jid, ", bubble?.name : ", bubble?.name, ", bubble?.status : ", bubble?.status);
        that._logger.log(that.INTERNAL, LOG_ID + "(_onOwnAffiliationChanged) bubbleLogInfos : ", getBubbleLogInfos(bubble));
        if (bubble) {
            if (!bubble.jid) bubble.jid = bubble.bubbleJid;
            if (!bubble.id) bubble.Id = bubble.bubbleId;
            if (!bubble.id) bubble.id = bubble.bubbleId;
            await that.removeBubbleToJoinInProgress(bubble);
            await that.addBubbleAlreadyJoined(bubble);
        }
    }

    /**
     * @private
     * @method _onbubblepresencechanged
     * @instance
     * @param {Object} bubblepresenceinfo contains information about presence in bubble
     * @description
     *      Method called when affilitation (presence) to a bubble changed
     */
    async _onbubblepresencechanged(bubblepresenceinfo : any) {
        let that = this;
        let bubble : any = await that._bubblesservice.getBubbleByJid(bubblepresenceinfo.jid).catch((err) => {
            that._logger.log(that.ERROR, LOG_ID + "(_onbubblepresencechanged) get bubble failed for bubblepresenceinfo : ", bubblepresenceinfo, ", : ", err);
        });
        //that._logger.log(that.INTERNAL, LOG_ID + "(_onbubblepresencechanged) bubble bubblepresenceinfo : ", bubblepresenceinfo, ", bubble : ", bubble);
        that._logger.log(that.INTERNAL, LOG_ID + "(_onbubblepresencechanged) bubble bubblepresenceinfo.id : ", bubblepresenceinfo?.id, ", bubbleLogInfos : ", getBubbleLogInfos(bubble));
        if (bubble) {
            await that.removeBubbleToJoinInProgress(bubble);
            await that.addBubbleAlreadyJoined(bubble);
        }
    }

    async addBubbleToJoinInProgress(bubble): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let roomJid = bubble?.jid;
                let roomId = bubble?.id;
                if ( (!that.poolBubbleJoinInProgress.containsKey(roomJid)) && (!that.poolBubbleAlreadyJoined.containsKey(roomJid)) )
                {
                    that._logger.log(that.DEBUG, LOG_ID + "(addBubbleToJoinInProgress) We add the Bubble in the poolBubbleJoinInProgress - bubbleLogInfos : ", getBubbleLogInfos(bubble));
                    that.poolBubbleJoinInProgress.add(roomJid, bubble);
                    //needToAsk = true;
                }
            }).then((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(addBubbleToJoinInProgress) Succeed - Jid : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(addBubbleToJoinInProgress) Failed - Jid : ", result);
                resolve(undefined);
            });
        });
    }

    async removeBubbleToJoinInProgress(bubble): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                if (!bubble) {
                    that._logger.log(that.WARN, LOG_ID + "(removeBubbleToJoinInProgress) empty bubble, so ignore it.");
                    return;
                }
                let roomJid = bubble?.jid;
                let roomId = bubble?.id;
                if ( that.poolBubbleJoinInProgress.containsKey(roomJid) )
                {
                    that._logger.log(that.DEBUG, LOG_ID + "(removeBubbleToJoinInProgress) We remove the Bubble from poolBubbleJoinInProgress - bubbleLogInfos : ", getBubbleLogInfos(bubble));
                    that.poolBubbleJoinInProgress.remove((item: KeyValuePair<string, Bubble>) => {
                        return roomJid === item.key;
                    });
                    //needToAsk = true;
                    return bubble;
                } else {
                    that._logger.log(that.DEBUG, LOG_ID + "(removeBubbleToJoinInProgress) bubble not in the poolBubbleJoinInProgress - bubbleLogInfos : ", getBubbleLogInfos(bubble));
                    return;
                }
            }).then((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(removeBubbleToJoinInProgress) Succeed - Jid : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(removeBubbleToJoinInProgress) Failed - Jid : ", result);
                resolve(undefined);
            });
        });
    }

    async resetBubbleFromJoinInProgressToBubbleToJoin(): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let roomJid = undefined;
                while ( that.poolBubbleJoinInProgress.length > 0 )
                {
                    let item: KeyValuePair<string, Bubble> = that.poolBubbleJoinInProgress.elementAt(0);
                    if (!item) {
                        that._logger.log(that.DEBUG, LOG_ID + "(resetBubbleFromJoinInProgressToBubbleToJoin) WARN We retrieved an empty Bubble from poolBubbleJoinInProgress.");
                        continue;
                    }
                    let roomJid = item.key;
                    let bubble = item.value;
                    that._logger.log(that.DEBUG, LOG_ID + "(resetBubbleFromJoinInProgressToBubbleToJoin) We retrieved the Bubble from poolBubbleJoinInProgress - bubbleLogInfos : ", getBubbleLogInfos(bubble));

                    that._logger.log(that.DEBUG, LOG_ID + "(resetBubbleFromJoinInProgressToBubbleToJoin) We add the Bubble to poolBubbleToJoin - bubbleLogInfos : ", getBubbleLogInfos(bubble));
                    that.poolBubbleToJoin.add(roomJid, bubble);
                    that._logger.log(that.DEBUG, LOG_ID + "(resetBubbleFromJoinInProgressToBubbleToJoin) We remove the Bubble from poolBubbleJoinInProgress - bubbleLogInfos : ", getBubbleLogInfos(bubble));
                    that.poolBubbleJoinInProgress.remove((itemIter: KeyValuePair<string, Bubble>) => {
                        return roomJid === itemIter.key;
                    });
                }
            }).then((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(resetBubbleFromJoinInProgressToBubbleToJoin) Succeed - Jid : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(resetBubbleFromJoinInProgressToBubbleToJoin) Failed - Jid : ", result);
                resolve(undefined);
            });
        });
    }

    async addBubbleAlreadyJoined(bubble): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let roomJid = bubble?.jid;
                if ( (!that.poolBubbleAlreadyJoined.containsKey(roomJid)) )
                {
                    that._logger.log(that.DEBUG, LOG_ID + "(addBubbleAlreadyJoined) We add the Bubble in poolBubbleAlreadyJoined - for bubbleLogInfos : " + getBubbleLogInfos(bubble));
                    that.poolBubbleAlreadyJoined.add(roomJid, bubble);
                    //needToAsk = true;
                } else {
                    that._logger.log(that.DEBUG, LOG_ID + "(addBubbleAlreadyJoined) The Bubble is Already Joined - for bubbleLogInfos : " + getBubbleLogInfos(bubble));
                }
            }).then((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(addBubbleAlreadyJoined) Succeed - Jid : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(addBubbleAlreadyJoined) Failed - Jid : ", result);
                resolve(undefined);
            });
        });
    }

    async removeBubbleAlreadyJoined(bubble): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let roomJid = bubble?.jid;
                if ( (that.poolBubbleAlreadyJoined.containsKey(roomJid)) )
                {
                    that._logger.log(that.DEBUG, LOG_ID + "(removeBubbleAlreadyJoined) We remove the Bubble from poolBubbleAlreadyJoined - bubbleLogInfos : ", getBubbleLogInfos(bubble));
                    that.poolBubbleAlreadyJoined.remove((item: KeyValuePair<string, Bubble>) => {
                        return roomJid === item.key;
                    });
                    //needToAsk = true;
                }
            }).then((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(removeBubbleAlreadyJoined) Succeed - Jid : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(removeBubbleAlreadyJoined) Failed - Jid : ", result);
                resolve(undefined);
            });        });
    }

    //endregion
}

module.exports.BubblesManager = BubblesManager;
export {BubblesManager};
