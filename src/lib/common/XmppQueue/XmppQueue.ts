'use strict'
import {Deferred, doWithinInterval, pause, setTimeoutPromised} from "../Utils";
import {List} from "ts-generic-collections-linq";

export {};

let AsyncLock = require('async-lock');

/* module.exports = function () {
    return 'Hello, world! it is queue!';
}; // */

//var intanceofXmppQueue = undefined;
let LOG_ID = 'XMPPQUEUE';

class ItemForQueue {
    private defered : Deferred;
    private itemFunction : any;    
    
    constructor(itemFunction : any) {
        let that = this;        
        that.defered = new Deferred();
        that.itemFunction = itemFunction;
        if (typeof (itemFunction) !== 'function') {
            throw new Error('You must pass a function to execute');
        }
    }

    getPromise() {
        let that = this;
        return that.defered.promise;
    }
    
    resolve(...args) {
        let that = this;
        return that.defered.resolve(...args);
    }
    
    reject(...args) {
        let that = this;
        return that.defered.reject(...args);
    }
    // */
    
    async start() {
        let that = this;
        try {
            /*
            // Wait a few time between requests to avoid burst with lot of it.
            utils.setTimeoutPromised(that.timeBetweenXmppRequests).then(() => {
                //that.logger.log("debug", LOG_ID + "(send) setTimeout resolve");
                resolve(prom);
            });
            // */
            /* //return that.resolve(await that.itemFunction(that.defered.resolve, that.defered.reject));
            that.itemFunction(that.defered.resolve, that.defered.reject);
            await that.defered.promise;
            // */
            that.itemFunction(that.defered.resolve, that.defered.reject);
            doWithinInterval({promise:that.defered.promise, timeout : 5000, error : "Timeout raised."}).catch((err) => {
                that.defered.reject(err);
            });
            return that.defered.promise;
        } catch (err) {
            //return that.reject(err);
        }
    }
}

class XmppQueue {
	public logger: any;
	private timeBetweenXmppRequests: number;
	public requestsToSend: any;
	//private items : List<ItemForQueue>;
    private lockEngine: any;
    private lockKey = "LOCK_XMMP_QUEUE";

    constructor(_logger, timeBetweenXmppRequests) {
        let that = this;
        that.logger = _logger; // Temp to be changed
        that.timeBetweenXmppRequests = timeBetweenXmppRequests;
        that.requestsToSend = Promise.resolve(undefined);
        //that.items = new List<ItemForQueue>();
        that.lockEngine = new AsyncLock({timeout: 5000, maxPending: 1000, maxOccupationTime : 3000});
    }

    addPromise(promiseFactory) {
        let that = this;
        that.logger.log("debug", LOG_ID + "(addPromise) _entering_");
        that.requestsToSend = that.requestsToSend.then(() => {
            that.logger.log("debug", LOG_ID + "(addPromise) promise storing");
            return promiseFactory;
        }).catch((error) => {
            that.logger.log("error", LOG_ID + "(addPromise) Catch Error, but promise storing. promiseFactory : ", promiseFactory, ", error : ", error);
            return promiseFactory;
        });
        return that.requestsToSend;
    }



    addCallback(callback) {
        let that = this;
        that.logger.log("debug", LOG_ID + "(addCallback) _entering_");
        return this.addPromise(new Promise((resolve, reject) => {
            that.logger.log("debug", LOG_ID + "(addCallback) inside promise");

            callback(resolve, reject);
            //resolve(json.data);
            //reject(err);
        }));
    }
    
   /* add(callback) {
        let that = this;
        let timestamp = (new Date()).toUTCString();
        that.logger.log("debug", LOG_ID + "(add) - ", timestamp, " - ItemForQueue storing");
        try {
            let deferedItem = new ItemForQueue(callback);
            //that.items.add(deferedItem);
            //setTimeoutPromised(1000).then(() => {
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - ", timestamp, " - ItemForQueue will start.");
                    await deferedItem.start();
                    that.logger.log("debug", LOG_ID + "(add) - ", timestamp, " - ItemForQueue started and finished. Will pause before leave lock.");
                    await pause(that.timeBetweenXmppRequests);
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - ", timestamp, " - CATCH Error !!! in lock, error : ", err);
                }
            });
            that.logger.log("debug", LOG_ID + "(add) - ", timestamp, " - ItemForQueue stored.");
            return deferedItem.getPromise();
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - ", timestamp, " - CATCH Error !!! error : ", error);
            return Promise.reject(error);
        }
    } // */

    add(callback) {
        let that = this;
        let timestamp = (new Date()).toUTCString();
        that.logger.log("debug", LOG_ID + "(add) - ", timestamp, " - ItemForQueue storing");
        try {
            let deferedItem = new ItemForQueue(callback);
            //that.items.add(deferedItem);
            //setTimeoutPromised(1000).then(() => {
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - ", timestamp, " - ItemForQueue will start.");
                    let deferedResult : Promise<any> = await deferedItem.start();
                    //await until(() => { deferedResult.state != "pending"}, "Waiting the promises to complete.");
                    that.logger.log("debug", LOG_ID + "(add) - ", timestamp, " - ItemForQueue started and finished. Will pause before leave lock. deferedResult : ", deferedResult);
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - ", timestamp, " - CATCH Error !!! in lock, error : ", err);
                }
                await pause(that.timeBetweenXmppRequests);
            }).then(() => {
                that.logger.log("debug", LOG_ID + "(add) lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(add) Catch Error, error : ", error);
                deferedItem.reject(error);
            }); // */
            /*
            that.listRequests.add(deferedItem);
            that.logger.log("debug", LOG_ID + "(add) - ", timestamp, " - ItemForQueue stored.");
            that.treat().then(()=>{}).catch(()=>{}); // */
            return deferedItem.getPromise();
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
    }

    //region Lock

    /* async lock(fn) {
        let that = this;
        let resultLock = "Lock failed.";
        let timestampId = new Date().getMilliseconds();
        try {
            that.logger.log("internal", LOG_ID + "(lock) - ", timestampId, " - will acquire lock the ", that.lockKey);
            await that.lockEngine.acquire(that.lockKey, () => {
                        // that._logger.log("debug", LOG_ID + "(lock) lock the ", that.lockKey);
                        that.logger.log("internal", LOG_ID + "(lock) - ", timestampId, " - lock the ", that.lockKey);
                        //try {
                            return fn(); // async work
                        //} catch (err3) {
                          //  that.logger.log("error", LOG_ID + "(lock) - ", timestampId, " - CATCH Error !!! error at run : ", that.lockKey, ", error : ", err3);
                        //}
                    }).then((result) => {
                // that._logger.log("debug", LOG_ID + "(lock) release the ", that.lockKey);
                that.logger.log("internal", LOG_ID + "(lock) - ", timestampId, " - release the ", that.lockKey, ", result : ", result);
                resultLock = result;
            }).catch((err2) => {
                        that.logger.log("warn", LOG_ID + "(lock) - ", timestampId, " - catch at acquire : ", that.lockKey, ", error : ", err2);
                        resultLock = err2;
                    }
            );
        } catch (err) {
            that.logger.log("error", LOG_ID + "(lock) - ", timestampId, " - CATCH Error !!! error at acquire : ", that.lockKey, ", error : ", err);
            resultLock = err;
        }
        that.logger.log("internal", LOG_ID + "(lock) - ", timestampId, " - __ exiting __ ", that.lockKey, ", resultLock : ", resultLock);
        return resultLock;
    } // */


    async lock(fn) {
        let that = this;
        let resultLock = "Lock failed.";
        let timestampId = new Date().getMilliseconds();
        try {
            that.logger.log("internal", LOG_ID + "(lock) - ", timestampId, " - will acquire lock the ", that.lockKey);
            await that.lockEngine.acquire(that.lockKey, async () => {
                // that._logger.log("debug", LOG_ID + "(lock) lock the ", that.lockKey);
                that.logger.log("internal", LOG_ID + "(lock) - ", timestampId, " - lock the ", that.lockKey);
                let result = undefined;
                try {
                    result = await fn(); // async work
                    return result;
                } catch (err3) {
                    that.logger.log("error", LOG_ID + "(lock) - ", timestampId, " - CATCH Error !!! error at run : ", that.lockKey, ", error : ", err3);
                }
            }).then((result) => {
                // that._logger.log("debug", LOG_ID + "(lock) release the ", that.lockKey);
                that.logger.log("internal", LOG_ID + "(lock) - ", timestampId, " - release the ", that.lockKey, ", result : ", result);
                resultLock = result;
            }).catch((err2) => {
                        that.logger.log("warn", LOG_ID + "(lock) - ", timestampId, " - catch at acquire : ", that.lockKey, ", error : ", err2);
                        throw resultLock = err2;
                    }
            );
        } catch (err) {
            that.logger.log("error", LOG_ID + "(lock) - ", timestampId, " - CATCH Error !!! error at acquire : ", that.lockKey, ", error : ", err);
            throw resultLock = err;
        }
        that.logger.log("internal", LOG_ID + "(lock) - ", timestampId, " - __ exiting __ ", that.lockKey, ", resultLock : ", resultLock);
        return resultLock;
    }

    //endregion Lock
    
}

function getXmppQueue(_logger, timeBetweenXmppRequests) {
    return new XmppQueue(_logger, timeBetweenXmppRequests);
/*
    if (intanceofXmppQueue == undefined) {
        // Instantiate the SDK
        intanceofXmppQueue = new XmppQueue();
    } else {

    }
    return intanceofXmppQueue;
*/
}

module.exports.getXmppQueue = getXmppQueue;
