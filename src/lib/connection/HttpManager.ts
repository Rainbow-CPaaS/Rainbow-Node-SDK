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
// @ ts-ignore
 import RequestRateLimiter, {BackoffError} from "./request-rate-limiter/index";
// const RequestRateLimiter = require("request-rate-limiter").RequestRateLimiter;  
// const BackoffError = require("request-rate-limiter").BackoffError; 
        
        //, { BackoffError } from ;

export{};

const LOG_ID = "HTTP/MNGR - ";

const RECONNECT_INITIAL_DELAY = 15000;
const RECONNECT_MAX_DELAY = 120000;

class RequestForQueue {
    id : string; // id to identify the request in queue
    method : Function; // the pointer to the function with the treatment of the request. Note : do not forget to bind the function to the right object to set the correct this inside it.
    params : IArguments; // The list of arguments of the function of the treatment.
//    resolve : Function; // Internal for the queue engine, Pointer to the function which resolve the promise waited by the caller when the treatment successfully ended.
//    reject : Function; // Internal for the queue engine, Pointer to the function which reject the promise waited by the caller when the treatment failed ended.
    label: string; // A label to give a human readable log about the request.
    constructor(){

    }
}

class MyRequestHandler {
    private httpManager : HttpManager;
    

    constructor (_httpManager: HttpManager) {
        this.httpManager = _httpManager;
    }
    // this method is th eonly required interface to implement
    // it gets passed the request onfig that is passed by the 
    // user to the request method of the limiter. The mehtod msut
    // return an instance of the BackoffError when the limiter 
    // needs to back off
    async request(req : RequestForQueue) {
        let nbRunningReq = await this.httpManager.incNbRunningReq();
        this.httpManager._logger.log("internal", LOG_ID + "(MyRequestHandler::request) The req will run nbRunningReq : ", nbRunningReq, ", nbHttpAdded : ", this.httpManager.nbHttpAdded, ", req.id : ", req.id, ", req.label : ", req.label);
        const response = req.method(...req.params).then((result) => {
            this.httpManager.decNbRunningReq();
            this.httpManager._logger.log("internal", LOG_ID + "(MyRequestHandler::request) The req method call SUCCEED. nbRunningReq : ", nbRunningReq, ", nbHttpAdded : ", this.httpManager.nbHttpAdded, ", req.id : ", req.id, ", req.label : ", req.label);
            return result;
        }).catch((err) => {
            this.httpManager._logger.log("internal", LOG_ID + "(MyRequestHandler::request) The req method call FAILED. nbRunningReq : ", nbRunningReq, ", nbHttpAdded : ", this.httpManager.nbHttpAdded, ", req.id : ", req.id, ", req.label : ", req.label);
            throw err;
        })        
        // */

        if (response.statusCode === 429) throw new BackoffError(`Need to nack off guys!`);
        else return response;
    }
}

// @ logEntryExit(LOG_ID)
/**
 *
 */
class HttpManager {
    public _logger: Logger;
    private _eventEmitter: EventEmitter;
    private _imOptions: any;
    private _options: any;
    private lockEngine: any;
    //private lockKey = "LOCK_HTTP_MANAGER";
    private lockKeyNbHttpAdded = "LOCK_HTTP_MANAGER_NbHttpAdded";
    public nbHttpAdded : number = 0;
    public nbRunningReq = 0;
    started: boolean;

    public limiter: RequestRateLimiter;

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
        
        that.lockEngine = new AsyncLock({timeout: 5000, maxPending: 1000});

        that._logger.log("debug", LOG_ID + "(constructor) HttpManager created successfull.");
        that._logger.log("internal", LOG_ID + "(constructor) HttpManager created successfull nbHttpAdded : ", that.nbHttpAdded);
    }

    init(_options, _core: Core) {
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                that.limiter = new RequestRateLimiter({
                    backoffTime: 10,
                    requestRate: _options.requestsRate.maxReqByIntervalForRequestRate,
                    interval: _options.requestsRate.intervalForRequestRate, // Seconds
                    timeout: _options.requestsRate.timeoutRequestForRequestRate // Seconds
                });


                that.limiter.setRequestHandler(new MyRequestHandler(that));

                that.nbHttpAdded = 0;
                that._options = _options;
                that._logger.log("debug", LOG_ID + "(constructor) HttpManager initialized successfull.");
                //that._logger.log("internal", LOG_ID + "(constructor) HttpManager initialized successfull");
                
                that.started = true;
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        });
    }

    async checkHTTPStatus() : Promise<{
        nbHttpAdded: number,
        httpQueueSize: number,
        nbRunningReq: number,
        maxSimultaneousRequests : number,
        nbReqInQueue: number
    }> {
        let that = this;
        //that.logger.log("debug", LOG_ID + "(checkEveryPortals) ");
        let httpStatus : {
            nbHttpAdded: number,
            httpQueueSize: number,
            nbRunningReq: number,
            maxSimultaneousRequests : number,
            nbReqInQueue: number
        } = {
            nbHttpAdded : 0,
            httpQueueSize : 0,
            nbRunningReq : 0,
            maxSimultaneousRequests : 0,
            nbReqInQueue: 0
        };

        try {
            httpStatus.nbHttpAdded = that.nbHttpAdded;
            httpStatus.httpQueueSize = that.limiter.bucket.length;
            httpStatus.nbRunningReq = that.nbRunningReq;
            httpStatus.maxSimultaneousRequests = that.limiter.bucket.capacity;
            httpStatus.nbReqInQueue = that.limiter.bucket.length;
            that._logger.log("debug", LOG_ID + "(checkHTTPStatus) httpStatus : ", httpStatus);
        } catch (err) {
            that._logger.log("debug", LOG_ID + "(checkHTTPStatus) check Http status failed : ", err);
        }

        return httpStatus;
    }

    //region Lock

   /* lock(fn) {
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
    // */

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
        return that.locknbRunningReq(() => {
            that.nbRunningReq++;
            // that._logger.log("debug", LOG_ID + "(incNbRunningReq) nbRunningReq : ", that.nbRunningReq);
            return that.nbRunningReq;
        });
    }

    decNbRunningReq(){
        let that = this;
        return that.locknbRunningReq(() => {
            that.nbRunningReq--;
            // that._logger.log("debug", LOG_ID + "(decNbRunningReq) nbRunningReq : ", that.nbRunningReq);
            return that.nbRunningReq;
        });
    }

    //endregion nbRunningReq

    /**
     *
     * @param {} req {id, method, params, resolve, reject}
     * @return {Promise<any>}
     */
    async add(req : RequestForQueue): Promise<any> {
        let that = this;
        if (that.nbHttpAdded > (Number.MAX_SAFE_INTEGER - 1)) {
            that.nbHttpAdded = 0;
        } else {
            that.nbHttpAdded++;
        }
        req.id = new Date().getTime() + "_" + that.nbHttpAdded;
        this._logger.log("internal", LOG_ID + "(add) The req will be add to queue. that.nbRunningReq : ", that.nbRunningReq, ", nbHttpAdded : ", that.nbHttpAdded, ", req.id : ", req.id, ", req.label : ", req.label);
        return this.limiter.request(req);
    }

    stop() {
        let that = this;
        that._logger.log("info", LOG_ID + "(stop) stopping.");
        that.started = false;
        that.limiter.bucket.end();
    }
}

module.exports.HttpManager = HttpManager;
module.exports.RequestForQueue = RequestForQueue;
export {RequestForQueue, HttpManager};
