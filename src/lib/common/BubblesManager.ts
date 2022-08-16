"use strict";

import {Bubble} from "./models/Bubble";
import {Logger} from "./Logger";
import {EventEmitter} from "events";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {PresenceService} from "../services/PresenceService";
import {S2SService} from "../services/S2SService";
import {Core} from "../Core";
import {getRandomInt, logEntryExit, pause, until} from "./Utils";
import { List } from "ts-generic-collections-linq";
import {Dictionary, IDictionary} from "ts-generic-collections-linq";
import {KeyValuePair} from "ts-generic-collections-linq/lib/dictionary";
import {ConferenceSession} from "./models/ConferenceSession";
import {BubblesService} from "../services/BubblesService";
let AsyncLock = require('async-lock');
import {FibonacciStrategy} from "backoff";
//let backoff = require("backoff");

export{};

const LOG_ID = "BUBBLES/MNGR - ";

const RECONNECT_INITIAL_DELAY = 15000;
const RECONNECT_MAX_DELAY = 120000;

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

    static getClassName() {
        return 'BubblesManager';
    }

    getClassName() {
        return BubblesManager.getClassName();
    }

    constructor(_eventEmitter: EventEmitter, _logger: Logger) {
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
        that.lockEngine = new AsyncLock({timeout: 5000, maxPending: 1000});


        //this._eventEmitter.on("evt_internal_affiliationdetailschanged", this._onAffiliationDetailsChanged.bind(this));
        this._eventEmitter.on("evt_internal_onbubblepresencechanged", this._onbubblepresencechanged.bind(this));

        that._logger.log("debug", LOG_ID + "(constructor) BubblesManager created successfull");
        that._logger.log("internal", LOG_ID + "(constructor) BubblesManager created successfull nbBubbleAdded : ", that.nbBubbleAdded);
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

                that._logger.log("debug", LOG_ID + "(constructor) BubblesManager initialized successfull");
                that._logger.log("internal", LOG_ID + "(constructor) BubblesManager initialized successfull");
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        });
    }

    async reset(): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(reset) We clear the Bubbles from poolBubbleAlreadyJoined, poolBubbleJoinInProgress, poolBubbleToJoin.");
            that.lock(() => {
                // Treatment in the lock
                that.poolBubbleAlreadyJoined.clear();
                that.poolBubbleJoinInProgress.clear();
                that.poolBubbleToJoin.clear();
                that.nbBubbleAdded = 0;
                return "reseted";
            }).then((result) => {
                that._logger.log("internal", LOG_ID + "(reset) Succeed - result : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log("internal", LOG_ID + "(reset) Failed - result : ", result);
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
                // that._logger.log("debug", LOG_ID + "(lock) lock the ", that.lockKey);
                that._logger.log("internal", LOG_ID + "(lock) lock the ", that.lockKey);
                return await fn(); // async work
            }, opts).then((result) => {
            // that._logger.log("debug", LOG_ID + "(lock) release the ", that.lockKey);
            that._logger.log("internal", LOG_ID + "(lock) release the ", that.lockKey, ", result : ", result);
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
                let roomJid = bubble.jid;
                if ( (!that.poolBubbleToJoin.containsKey(roomJid)) && (!that.poolBubbleAlreadyJoined.containsKey(roomJid)) )
                {
                    that.nbBubbleAdded++;
                    that._logger.log("debug", LOG_ID + "(addBubbleToJoin) We add the Bubble in the pool poolBubbleToJoin to join it as soon as possible - Jid : ", roomJid,", nbBubbleAdded : ", that.nbBubbleAdded);
                    that.poolBubbleToJoin.add(roomJid, bubble);
                    //needToAsk = true;
                    return bubble
                }
                return ;
            }).then((result) => {
                that._logger.log("internal", LOG_ID + "(addBubbleToJoin) Succeed - Jid : ", result);
                return resolve(result);
            }).catch((result) => {
                that._logger.log("internal", LOG_ID + "(addBubbleToJoin) Failed - Jid : ", result);
                resolve(undefined);
            });
        });
    }

    async removeBubbleToJoin(bubble): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let roomJid = bubble.jid;
                if ( (that.poolBubbleToJoin.containsKey(roomJid)) )
                {
                    that._logger.log("debug", LOG_ID + "(removeBubbleToJoin) We remove the Bubble from poolBubbleToJoin - Jid : ", roomJid);
                    that.poolBubbleToJoin.remove((item: KeyValuePair<string, Bubble>) => {
                        return roomJid === item.key;
                    });
                    //needToAsk = true;
                }
            }).then((result) => {
                that._logger.log("internal", LOG_ID + "(removeBubbleToJoin) Succeed - Jid : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log("internal", LOG_ID + "(removeBubbleToJoin) Failed - Jid : ", result);
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
                that._logger.log("debug", LOG_ID + "(getBubbleToJoin) We retrieved the Bubble from poolBubbleToJoin - Jid : ", roomJid);

                that._logger.log("debug", LOG_ID + "(getBubbleToJoin) We remove the Bubble from poolBubbleToJoin - Jid : ", roomJid);
                that.poolBubbleToJoin.remove((item: KeyValuePair<string, Bubble>) => {
                    return roomJid === item.key;
                });
                return bubble;
            }).then((result) => {
                that._logger.log("internal", LOG_ID + "(getBubbleToJoin) Succeed - bubble : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log("internal", LOG_ID + "(getBubbleToJoin) Failed - bubble : ", result);
                resolve(undefined);
            });
        });
    }

    async treatAllBubblesToJoin() {
        let that = this;
        return new Promise(async (resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(treatAllBubblesToJoin) start with nbBubbleAdded : ", that.nbBubbleAdded, ", that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);

            if (that.poolBubbleToJoin.length > 0 && that.poolBubbleJoinInProgress.length == 0) {
                let start = true;
                that.fibonacciStrategy.reset();
                that.delay = that.fibonacciStrategy.getInitialDelay();

                while ((that.poolBubbleToJoin.length > 0 || that.poolBubbleJoinInProgress.length > 0 ) || start == true) {
                    that._logger.log("internal", LOG_ID + "(treatAllBubblesToJoin) START with pause value : ", that.delay, "  treat a group of 10 bubbles to join, that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);
                    start = false;
                    for (let iterBubbleToJoin = 0; that.poolBubbleJoinInProgress.length < 11 && iterBubbleToJoin < 10; iterBubbleToJoin++) {
                        let bubble = await that.getBubbleToJoin();
                        if ( bubble ) {
                            that._logger.log("internal", LOG_ID + "(treatAllBubblesToJoin) bubble found at ", iterBubbleToJoin, ", for the initial presence to bubble : ", bubble);
                            await that.addBubbleToJoinInProgress(bubble); // poolBubbleJoinInProgress.add(bubble.jid, bubble);
                            let test = false;
                            if (getRandomInt(2) == 1 || !test) {
                                that._logger.log("debug", LOG_ID + "(treatAllBubblesToJoin) bubble found at ", iterBubbleToJoin, ", send the initial presence to bubble : ", bubble.jid);
                                await that._presence.sendInitialBubblePresenceSync(bubble);
                            } else {
                                that._logger.log("debug", LOG_ID + "(treatAllBubblesToJoin) bubble found at ", iterBubbleToJoin, ", because of random test do not send the initial presence to bubble : ", bubble.jid);
                            }
                        } else {
                            that._logger.log("debug", LOG_ID + "(treatAllBubblesToJoin) bubble undefined at ", iterBubbleToJoin, ", so do not send the initial presence to bubble : ", bubble);
                        }
                    }
                    await until(() => {
                        return (that.poolBubbleJoinInProgress.length == 0 );
                    }, "Wait treat group of 10 bubbles to join from poolBubbleJoinInProgress.", 30000).then(() => {
                        that._logger.log("internal", LOG_ID + "(treatAllBubblesToJoin) SUCCEED to send the poolBubbleJoinInProgress pool.");
                        that.fibonacciStrategy.reset();
                        that.delay = that.fibonacciStrategy.getInitialDelay();
                    }).catch(async (err) => {
                        that._logger.log("error", LOG_ID + "(treatAllBubblesToJoin) FAILED wait treat group of 10 bubbles to join from poolBubbleJoinInProgress, before pause : ", that.delay, ", it left that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length, ", error : ", err);
                        await pause(that.delay);
                        that._logger.log("error", LOG_ID + "(treatAllBubblesToJoin) FAILED wait treat group of 10 bubbles to join from poolBubbleJoinInProgress, after pause : ", that.delay, ", it left that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);
                        await that.resetBubbleFromJoinInProgressToBubbleToJoin();
                        that.delay = that.fibonacciStrategy.next();
                    });
                    that._logger.log("debug", LOG_ID + "(treatAllBubblesToJoin) END treat group of 10 bubbles to join from poolBubbleJoinInProgress, that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);
                }
                await until(() => {
                    return (that.poolBubbleJoinInProgress.length == 0 && that.poolBubbleToJoin.length == 0);
                }, "Wait for the Bubbles from that.poolBubbleToJoin to be joined.", 120000).catch((err) => {
                    that._logger.log("internal", LOG_ID + "(treatAllBubblesToJoin) FAILED wait for the bubbles to be joined, it left that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length, ", it left that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", error : ", err);
                });
                that._logger.log("debug", LOG_ID + "(treatAllBubblesToJoin) End of treatment of bubbles to join, that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);
            } else {
                that._logger.log("error", LOG_ID + "(treatAllBubblesToJoin) FAILED join already in progress.");
            }
            resolve("done");
        });
    }

    /**
     * @private
     * @method _onAffiliationDetailsChanged
     * @instance
     * @param {Object} affiliation contains information about bubble and user's jid
     * @description
     *      Method called when affilitation (presence) to a bubble changed
     */
    async _onAffiliationDetailsChanged(bubble) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(_onAffiliationDetailsChanged) bubble : ", bubble);
        await that.removeBubbleToJoinInProgress(bubble);
        await that.addBubbleAlreadyJoined(bubble);
    }

    /**
     * @private
     * @method _onbubblepresencechanged
     * @instance
     * @param {Object} affiliation contains information about bubble and user's jid
     * @description
     *      Method called when affilitation (presence) to a bubble changed
     */
    async _onbubblepresencechanged(bubblepresenceinfo) {
        let that = this;
        let bubble = await that._bubblesservice.getBubbleByJid(bubblepresenceinfo.jid);
        that._logger.log("internal", LOG_ID + "(_onbubblepresencechanged) bubble bubblepresenceinfo : ", bubblepresenceinfo, ", bubble : ", bubble);
        await that.removeBubbleToJoinInProgress(bubble);
        await that.addBubbleAlreadyJoined(bubble);
    }

    async addBubbleToJoinInProgress(bubble): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let roomJid = bubble.jid;
                if ( (!that.poolBubbleJoinInProgress.containsKey(roomJid)) && (!that.poolBubbleAlreadyJoined.containsKey(roomJid)) )
                {
                    that._logger.log("debug", LOG_ID + "(addBubbleToJoinInProgress) We add the Bubble in the poolBubbleJoinInProgress - Jid : ", roomJid);
                    that.poolBubbleJoinInProgress.add(roomJid, bubble);
                    //needToAsk = true;
                }
            }).then((result) => {
                that._logger.log("internal", LOG_ID + "(addBubbleToJoinInProgress) Succeed - Jid : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log("internal", LOG_ID + "(addBubbleToJoinInProgress) Failed - Jid : ", result);
                resolve(undefined);
            });
        });
    }

    async removeBubbleToJoinInProgress(bubble): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let roomJid = bubble.jid;
                if ( that.poolBubbleJoinInProgress.containsKey(roomJid) )
                {
                    that._logger.log("debug", LOG_ID + "(removeBubbleToJoinInProgress) We remove the Bubble from poolBubbleJoinInProgress - Jid : ", roomJid);
                    that.poolBubbleJoinInProgress.remove((item: KeyValuePair<string, Bubble>) => {
                        return roomJid === item.key;
                    });
                    //needToAsk = true;
                    return bubble;
                } else {
                    that._logger.log("debug", LOG_ID + "(removeBubbleToJoinInProgress) bubble not in the poolBubbleJoinInProgress - Jid : ", roomJid);
                    return;
                }
            }).then((result) => {
                that._logger.log("internal", LOG_ID + "(removeBubbleToJoinInProgress) Succeed - Jid : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log("internal", LOG_ID + "(removeBubbleToJoinInProgress) Failed - Jid : ", result);
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
                        that._logger.log("debug", LOG_ID + "(resetBubbleFromJoinInProgressToBubbleToJoin) WARN We retrieved an empty Bubble from poolBubbleJoinInProgress.");
                        continue;
                    }
                    let roomJid = item.key;
                    let bubble = item.value;
                    that._logger.log("debug", LOG_ID + "(resetBubbleFromJoinInProgressToBubbleToJoin) We retrieved the Bubble from poolBubbleJoinInProgress - Jid : ", roomJid);

                    that._logger.log("debug", LOG_ID + "(resetBubbleFromJoinInProgressToBubbleToJoin) We add the Bubble to poolBubbleToJoin - Jid : ", roomJid);
                    that.poolBubbleToJoin.add(roomJid, bubble);
                    that._logger.log("debug", LOG_ID + "(resetBubbleFromJoinInProgressToBubbleToJoin) We remove the Bubble from poolBubbleJoinInProgress - Jid : ", roomJid);
                    that.poolBubbleJoinInProgress.remove((itemIter: KeyValuePair<string, Bubble>) => {
                        return roomJid === itemIter.key;
                    });
                }
            }).then((result) => {
                that._logger.log("internal", LOG_ID + "(resetBubbleFromJoinInProgressToBubbleToJoin) Succeed - Jid : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log("internal", LOG_ID + "(removeBubbleToJoinInProgress) Failed - Jid : ", result);
                resolve(undefined);
            });
        });
    }

    async addBubbleAlreadyJoined(bubble): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let roomJid = bubble.jid;
                if ( (!that.poolBubbleAlreadyJoined.containsKey(roomJid)) )
                {
                    that._logger.log("debug", LOG_ID + "(addBubbleAlreadyJoined) We add the Bubble in poolBubbleAlreadyJoined - Jid : ", roomJid);
                    that.poolBubbleAlreadyJoined.add(roomJid, bubble);
                    //needToAsk = true;
                }
            }).then((result) => {
                that._logger.log("internal", LOG_ID + "(addBubbleAlreadyJoined) Succeed - Jid : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log("internal", LOG_ID + "(addBubbleAlreadyJoined) Failed - Jid : ", result);
                resolve(undefined);
            });
        });
    }

    async removeBubbleAlreadyJoined(bubble): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                let roomJid = bubble.jid;
                if ( (that.poolBubbleAlreadyJoined.containsKey(roomJid)) )
                {
                    that._logger.log("debug", LOG_ID + "(removeBubbleAlreadyJoined) We remove the Bubble from poolBubbleAlreadyJoined - Jid : ", roomJid);
                    that.poolBubbleAlreadyJoined.remove((item: KeyValuePair<string, Bubble>) => {
                        return roomJid === item.key;
                    });
                    //needToAsk = true;
                }
            }).then((result) => {
                that._logger.log("internal", LOG_ID + "(removeBubbleAlreadyJoined) Succeed - Jid : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log("internal", LOG_ID + "(removeBubbleAlreadyJoined) Failed - Jid : ", result);
                resolve(undefined);
            });        });
    }

    //endregion
}

module.exports.BubblesManager = BubblesManager;
export {BubblesManager};
