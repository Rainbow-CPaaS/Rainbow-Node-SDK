"use strict";

import {EventEmitter} from "events";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {PresenceService} from "../services/PresenceService";
import {S2SService} from "../services/S2SService";
import {Core} from "../Core";
import {getRandomInt, logEntryExit, pause, until} from "../common/Utils";
import {IEnumerable, IList, List} from "ts-generic-collections-linq";
import {Dictionary, IDictionary} from "ts-generic-collections-linq";
import {KeyValuePair} from "ts-generic-collections-linq/lib/dictionary";
import {BubblesService} from "../services/BubblesService";
let AsyncLock = require('async-lock');
import {FibonacciStrategy} from "backoff";
import {Logger} from "../common/Logger";
//let backoff = require("backoff");

export{};

const LOG_ID = "HTTP/MNGR - ";

const RECONNECT_INITIAL_DELAY = 15000;
const RECONNECT_MAX_DELAY = 120000;

class RequestForQueue {
    id : string; // id to identify the request in queue
    method : Function; // the pointer to the function with the treatment of the request. Note : do not forget to bind the function to the right object to set the correct this inside it.
    params : IArguments; // The list of arguments of the function of the treatment.
    resolve : Function; // Internal for the queue engine, Pointer to the function which resolve the promise waited by the caller when the treatment successfully ended.
    reject : Function; // Internal for the queue engine, Pointer to the function which reject the promise waited by the caller when the treatment failed ended.
    label: string; // A label to give a human readable log about the request.
    constructor(){

    }
}

// @ logEntryExit(LOG_ID)
/**
 *
 */
class HttpManager {
    private _logger: Logger;
    private _eventEmitter: EventEmitter;
    private _imOptions: any;
    private _options: any;
    private fibonacciStrategy: FibonacciStrategy = new FibonacciStrategy({
        randomisationFactor: 0.4,
        initialDelay: RECONNECT_INITIAL_DELAY,
        maxDelay: RECONNECT_MAX_DELAY
    }); // */
    //private poolBubbleToJoin: IDictionary<string, any> = new Dictionary();
    private httpList: List<any> = new List();
    private lockEngine: any;
    private lockKey = "LOCK_HTTP_MANAGER";
    private lockKeyNbHttpAdded = "LOCK_HTTP_MANAGER_NbHttpAdded";
    private nbHttpAdded : number = 0;
    private delay: number = 15000;
    private nbRunningReq = 0;
    started: boolean;

    private MaxSimultaneousRequests = 5;

    static getClassName() {
        return 'HttpManager';
    }

    getClassName() {
        return HttpManager.getClassName();
    }

    constructor(_eventEmitter: EventEmitter, _logger: Logger) {
        let that = this;
        that._options = {};
        that._logger = _logger;
        that._eventEmitter = _eventEmitter;
        //this._imOptions = _imOptions;
        that.lockEngine = new AsyncLock({timeout: 5000, maxPending: 1000});


        //this._eventEmitter.on("evt_internal_affiliationdetailschanged", this._onAffiliationDetailsChanged.bind(this));
//        this._eventEmitter.on("evt_internal_onbubblepresencechanged", this._onbubblepresencechanged.bind(this));

        that._logger.log("debug", LOG_ID + "(constructor) HttpManager created successfull");
        that._logger.log("internal", LOG_ID + "(constructor) HttpManager created successfull nbHttpAdded : ", that.nbHttpAdded);
    }

    init(_options, _core: Core) {
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                that._options = _options;
                that.MaxSimultaneousRequests = _options.concurrentRequests;
                that._logger.log("debug", LOG_ID + "(constructor) HttpManager initialized successfull");
                that._logger.log("internal", LOG_ID + "(constructor) HttpManager initialized successfull");

                resolve();
            } catch (err) {
                return reject(err);
            }
        });
    }

    async checkHTTPStatus() : Promise<{
        nbHttpAdded: number,
        httpQueueSize: number,
        nbRunningReq: number,
        maxSimultaneousRequests : number
    }> {
        let that = this;
        //that.logger.log("debug", LOG_ID + "(checkEveryPortals) ");
        let httpStatus : {
            nbHttpAdded: number,
            httpQueueSize: number,
            nbRunningReq: number,
            maxSimultaneousRequests : number
        } = {
            nbHttpAdded : 0,
            httpQueueSize : 0,
            nbRunningReq : 0,
            maxSimultaneousRequests : 0
        };

        try {
            httpStatus.nbHttpAdded = that.nbHttpAdded;
            httpStatus.httpQueueSize = that.httpList.length;
            httpStatus.nbRunningReq = that.nbRunningReq;
            httpStatus.maxSimultaneousRequests = that.MaxSimultaneousRequests;
            that._logger.log("debug", LOG_ID + "(checkHTTPStatus) httpStatus : ", httpStatus);
        } catch (err) {
            that._logger.log("debug", LOG_ID + "(checkHTTPStatus) check Http status failed : ", err);
        }

        return httpStatus;
    }

    //region Lock

    lock(fn) {
        let that = this;
        let opts = undefined;
        return that.lockEngine.acquire(that.lockKey,
            async function () {
                // that._logger.log("debug", LOG_ID + "(lock) lock the ", that.lockKey);
                // that._logger.log("internal", LOG_ID + "(lock) lock the ", that.lockKey);
                return await fn(); // async work
            }, opts).then((result) => {
            // that._logger.log("debug", LOG_ID + "(lock) release the ", that.lockKey);
            // that._logger.log("internal", LOG_ID + "(lock) release the ", that.lockKey, ", result : ", result);
            return result;
        });
    }

    locknbRunningReq(fn) {
        let that = this;
        let opts = undefined;
        return that.lockEngine.acquire(that.lockKeyNbHttpAdded,
            async function () {
                // that._logger.log("debug", LOG_ID + "(lock) lock the ", that.lockKey);
                // that._logger.log("internal", LOG_ID + "(lock) lock the ", that.lockKeyNbHttpAdded);
                return await fn(); // async work
            }, opts).then((result) => {
            // that._logger.log("debug", LOG_ID + "(lock) release the ", that.lockKey);
            // that._logger.log("internal", LOG_ID + "(lock) release the ", that.lockKeyNbHttpAdded, ", result : ", result);
            return result;
        });
    }

    //endregion

    //region nbRunningReq

    incNbRunningReq(){
        let that = this;
        that.locknbRunningReq(() => {
            that.nbRunningReq++;
            // that._logger.log("debug", LOG_ID + "(incNbRunningReq) nbRunningReq : ", that.nbRunningReq);
        });
    }

    decNbRunningReq(){
        let that = this;
        that.locknbRunningReq(() => {
            that.nbRunningReq--;
            // that._logger.log("debug", LOG_ID + "(decNbRunningReq) nbRunningReq : ", that.nbRunningReq);
        });
    }

    isNbRunningReqAuthorized(){
        let res = false;
        let that = this;
        that.locknbRunningReq(() => {
            // that._logger.log("debug", LOG_ID + "(decNbRunningReq) nbRunningReq : ", that.nbRunningReq, ", MaxSimultaneousRequests : ", MaxSimultaneousRequests);
            res = that.nbRunningReq < that.MaxSimultaneousRequests;
        });
        return res;
    }

    //endregion nbRunningReq

    //region Queue Management

    /**
     *
     * @param {} req {id, method, params, resolve, reject}
     * @return {Promise<any>}
     */
    async add(req : any): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                /*if ( (!that.poolBubbleToJoin.containsKey(roomJid)) && (!that.poolBubbleAlreadyJoined.containsKey(roomJid)) ){ */
                    if (that.nbHttpAdded > (Number.MAX_SAFE_INTEGER - 1)) {
                        that.nbHttpAdded = 0;
                    } else {
                        that.nbHttpAdded++;
                    }
                    req.id = new Date().getTime() + "_" + that.nbHttpAdded;
                    that._logger.log("debug", LOG_ID + "(add) We add the req.id : ", req.id, ", req.label : ", req.label, ", nbHttpAdded : ", that.nbHttpAdded, ", nbRunningReq : ", that.nbRunningReq, ", that.httpList.length : ", that.httpList.length);
                    req.resolve = resolve;
                    req.reject = reject;
                    that.httpList.add(req);
                    //needToAsk = true;
                    return {label:"OK" , "id" : req.id};
                //}
                //return ;
            }).then((result) => {
                that._logger.log("internal", LOG_ID + "(add) Succeed - Wait for treatment to resolve it : ", result);
               // return resolve(result);
            }).catch((result) => {
                that._logger.log("internal", LOG_ID + "(add) Failed - failed to add the request : ", result);
                resolve();
            });
        });
    }

    async remove(req): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.lock(() => {
                // Treatment in the lock
                    that._logger.log("debug", LOG_ID + "(remove) We remove the req from pool.");
                    that.httpList.remove((item: any) => {
                        return item ? req.id == item.id : false;
                    });
            }).then((result) => {
                that._logger.log("internal", LOG_ID + "(remove) Succeed : ", result);
                resolve(result);
            }).catch((result) => {
                that._logger.log("internal", LOG_ID + "(remove) Failed : ", result);
                resolve();
            });
        });
    }

    async treatHttp() {
        let that = this;
        if (that.started) {
            that._logger.log("debug", LOG_ID + "(treatHttp) Already running, so do not start the treatment.");
            return Promise.resolve();
        }
        if (!that.MaxSimultaneousRequests) {
            that._logger.log("debug", LOG_ID + "(treatHttp) that.MaxSimultaneousRequests not define so force set it to 10.");
            that.MaxSimultaneousRequests = 10;
        }
        that.started = true;

        return new Promise(async (resolve, reject) => {
            that._logger.log("internal", LOG_ID + "(treatHttp) start with nbHttpAdded : ", that.nbHttpAdded, ", that.httpList.length : ", that.httpList.length, ", MaxSimultaneousRequests : ", that.MaxSimultaneousRequests);
            while (that.started == true) {
                let req : RequestForQueue = undefined;

                that.lock(() => {
                    // Treatment in the lock
                    // that._logger.log("debug", LOG_ID + "(treatHttp) We will get the req to treat from pool.");
                    req = that.httpList.elementAt(0);
                    if (req) {
                        that.incNbRunningReq();
                        that._logger.log("debug", LOG_ID + "(treatHttp) We getted the req to treat from pool : ", req.id, ", label : ", req.label,", that.httpList.length : ", that.httpList.length, ", that.nbRunningReq : ", that.nbRunningReq);
                        //that._logger.log("internal", LOG_ID + "(treatHttp) We getted the req to treat from pool : ", req);
                        that._logger.log("debug", LOG_ID + "(treatHttp) Remove the element treated id : ", req.id);
                        that.httpList.remove((item: any) => {
                            return item ? req.id == item.id : false;
                        });
                    } else {
                        // that._logger.log("warn", LOG_ID + "(treatHttp) We did not found the req to treat from pool.");
                    }
                }).then((result) => {
                    //that._logger.log("internal", LOG_ID + "(treatHttp) pop req Succeed : ", result);
                    if (req) {
                        that._logger.log("debug", LOG_ID + "(treatHttp) Treat the req : ", req.id);
                        //that._logger.log("internal", LOG_ID + "(treatHttp) We getted the req to treat from pool : ", req);
                        // {id, method, params, resolve, reject}
                        req.method(...req.params).then((result) => {
                            that._logger.log("debug", LOG_ID + "(treatHttp) The req method call SUCCEED. req.id : ", req.id, ", req.label : ", req.label);
                            that.decNbRunningReq();
                            req.resolve(result);
                        }).catch((err) => {
                            that._logger.log("error", LOG_ID + "(treatHttp) The req method call failed : ", err, ", req.id : ", req.id, ", req.label : ", req.label);
                            that.decNbRunningReq();
                            req.reject(err);
                        })
                    } else {
                      //  that._logger.log("warn", LOG_ID + "(treatHttp) We did not found the req to treat from pool.");
                    }
                }).catch((result) => {
                    that._logger.log("internalerror", LOG_ID + "(treatHttp) Failed : ", result, ", req.id : ", req.id, ", req.label : ", req.label);
                    //that._logger.log("debug", LOG_ID + "(treatHttp) nbRunningReq-- : ", nbRunningReq--);
                });


                await until(() => { return  (this.isNbRunningReqAuthorized() || that.httpList.length == 0) ;}, "wait the " + that.MaxSimultaneousRequests + " simultaneous request to be reached! that.nbRunningReq : " + that.nbRunningReq + ", that.httpList.length : " + that.httpList.length,150000).catch((err) => {
                    that._logger.log("internalerror", LOG_ID + "(treatHttp) until Failed : ", err);
                });
                if (that.httpList.length == 0) {
                    //that._logger.log("internal", LOG_ID + "(treatHttp) pause.");
                    await pause(50);
                }
                /*
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
                                    that._logger.log("internal", LOG_ID + "(treatAllBubblesToJoin) bubble found at ", iterBubbleToJoin, ", send the initial presence to bubble : ", bubble.jid);
                                    await that._presence.sendInitialBubblePresence(bubble);
                                } else {
                                    that._logger.log("internal", LOG_ID + "(treatAllBubblesToJoin) bubble found at ", iterBubbleToJoin, ", because of random test do not send the initial presence to bubble : ", bubble.jid);
                                }
                            } else {
                                that._logger.log("internal", LOG_ID + "(treatAllBubblesToJoin) bubble undefined at ", iterBubbleToJoin, ", so do not send the initial presence to bubble : ", bubble);
                            }
                        }
                        await until(() => {
                            return (that.poolBubbleJoinInProgress.length == 0 );
                        }, "Wait treat group of 10 bubbles to join from poolBubbleJoinInProgress.", 30000).then(() => {
                            that._logger.log("internal", LOG_ID + "(treatAllBubblesToJoin) SUCCEED to send the poolBubbleJoinInProgress pool.");
                            that.fibonacciStrategy.reset();
                            that.delay = that.fibonacciStrategy.getInitialDelay();
                        }).catch(async (err) => {
                            that._logger.log("internal", LOG_ID + "(treatAllBubblesToJoin) FAILED wait treat group of 10 bubbles to join from poolBubbleJoinInProgress, before pause : ", that.delay, ", it left that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length, ", error : ", err);
                            await pause(that.delay);
                            that._logger.log("internal", LOG_ID + "(treatAllBubblesToJoin) FAILED wait treat group of 10 bubbles to join from poolBubbleJoinInProgress, after pause : ", that.delay, ", it left that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);
                            await that.resetBubbleFromJoinInProgressToBubbleToJoin();
                            that.delay = that.fibonacciStrategy.next();
                        });
                        that._logger.log("internal", LOG_ID + "(treatAllBubblesToJoin) END treat group of 10 bubbles to join from poolBubbleJoinInProgress, that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);
                    }
                    await until(() => {
                        return (that.poolBubbleJoinInProgress.length == 0 && that.poolBubbleToJoin.length == 0);
                    }, "Wait for the Bubbles from that.poolBubbleToJoin to be joined.", 120000).catch((err) => {
                        that._logger.log("internal", LOG_ID + "(treatAllBubblesToJoin) FAILED wait for the bubbles to be joined, it left that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length, ", it left that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", error : ", err);
                    });
                    that._logger.log("internal", LOG_ID + "(treatAllBubblesToJoin) End of treatment of bubbles to join, that.poolBubbleToJoin.length : ", that.poolBubbleToJoin.length, ", that.poolBubbleJoinInProgress.length : ", that.poolBubbleJoinInProgress.length);
                } else {
                    that._logger.log("internal", LOG_ID + "(treatAllBubblesToJoin) FAILED join already in progress.");
                }
                // */
                //resolve("done");
            }
            resolve();
        });
    }

    //endregion
    stop() {
        let that = this;
        that._logger.log("info", LOG_ID + "(stop) stopping.");
        that.started = false;
    }
}

module.exports.HttpManager = HttpManager;
module.exports.RequestForQueue = RequestForQueue;
export {RequestForQueue, HttpManager};
