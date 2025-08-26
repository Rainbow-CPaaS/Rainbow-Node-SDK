"use strict";
import {Deferred, doWithinInterval, pause, setTimeoutPromised} from "./Utils";
import {Dictionary, KeyValuePair, List} from "ts-generic-collections-linq";
import {XMPPUTils} from "./XMPPUtils";
import {type} from "os";
import {clearTimeout} from "node:timers";

export {};

let AsyncLock = require('async-lock');

let LOG_ID = 'TIMEOUTQUEUE';

let xmppUtils = XMPPUTils.getXMPPUtils();

class ItemForTimeOutQueue {
    private defered : Deferred;
    private itemFunction : any;
    public id : string;
    private _label: string;
    public typePromised: boolean;
    public timeoutId: NodeJS.Timeout;
    public timetoutInProgress: boolean;

    constructor(itemFunction : any, label: string, typePromised: boolean) {
        let that = this;
        that.typePromised= typePromised;
        that.defered = new Deferred();
        that.itemFunction = itemFunction;
        that.id = xmppUtils.getUniqueId("TimeOutQueue");
        that.timeoutId = null;
        that.timetoutInProgress = false;
        that._label = label;
        
        if (typeof (itemFunction) !== 'function') {
            throw new Error('You must pass a function to execute');
        }
    }

    getLabel(): string {
        return this._label;
    }

    getId() {
        return this.id;
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
            that.timetoutInProgress = true;
            that.timeoutId = that.itemFunction(that.getId());
            return that.timeoutId;
        } catch (err) {
        }
    }
    
    async stop () {
        let that = this;
        try {
            that.timetoutInProgress = false;
            clearTimeout(that.timeoutId );
            if (that.typePromised) {
                that.reject("stop the ItemForTimeOutQueue : " + that.getId() + " for : " + that._label);
            } 
            return that.timeoutId;
        } catch (err) {
        }
    }
    
    async startPromised() {
        let that = this;
        try {
            that.timetoutInProgress = true;
            that.timeoutId = that.itemFunction(that.defered.resolve, that.defered.reject, that.getId());
            /* doWithinInterval({promise:that.defered.promise, timeout : 5000, error : "Timeout raised for doWithInterval of : " + that.getId()}).catch((err) => {
                that.defered.reject(err);
            }); // */
            return that.defered.promise;
        } catch (err) {
            //return that.reject(err);
        }
    }
}


class TimeOutManager {
    private timeoutFnTab : Dictionary<string, any>;
    private logger: any;
    private lockEngine: any;
    private lockKey = "LOCK_TIMEOUT_QUEUE";
    
    constructor (_logger) {
        let that = this;
        that.logger = _logger;
        that.timeoutFnTab = new Dictionary<string, any>();
        that.lockEngine = new AsyncLock({timeout: 3 * 60 * 1000, maxPending: 1000, maxOccupationTime : 5 * 60 * 1000});
    }
    
    start(){
        
    }
    
    stop () {
        
    }

    //region Lock

    async lock(fn, id) {
        let that = this;
        let resultLock = "Lock failed.";
        try {
            that.logger.log("internal", LOG_ID + "(lock) - id : ", id, " - will acquire lock the ", that.lockKey);
            await that.lockEngine.acquire(that.lockKey, async () => {
                // that._logger.log("debug", LOG_ID + "(lock) lock the ", that.lockKey);
                that.logger.log("internal", LOG_ID + "(lock) - id : ", id, " - lock the ", that.lockKey);
                let result = undefined;
                try {
                    result = await fn(); // async work
                    return result;
                } catch (err3) {
                    that.logger.log("error", LOG_ID + "(lock) - id : ", id, " - CATCH Error !!! error at run : ", that.lockKey, ", error : ", err3);
                }
            }).then((result) => {
                // that._logger.log("debug", LOG_ID + "(lock) release the ", that.lockKey);
                that.logger.log("internal", LOG_ID + "(lock) - id : ", id, " - release the ", that.lockKey, ", result : ", result);
                resultLock = result;
            }).catch((err2) => {
                        that.logger.log("warn", LOG_ID + "(lock) - id : ", id, " - catch at acquire : ", that.lockKey, ", error : ", err2);
                        throw resultLock = err2;
                    }
            );
        } catch (err) {
            that.logger.log("error", LOG_ID + "(lock) - id : ", id, " - CATCH Error !!! error at acquire : ", that.lockKey, ", error : ", err);
            throw resultLock = err;
        }
        that.logger.log("internal", LOG_ID + "(lock) - id : ", id, " - __ exiting __ ", that.lockKey, ", resultLock : ", resultLock);
        return resultLock;
    }

    //endregion Lock

    // region Timeoout
    
    /**
     * @public
     * @method setTimeout
     * @instance
     * @category Timeout
     * @description
     *    To se a setTimeout function which is stored in a queue, and then can be manage.<br>
     * @param fn
     * @param timer
     * @param {string} label
     * @return {string} the return of the system setTimeout call method.
     */
    setTimeout(fn, timer, label? : string) {
        let that = this;

        //let that = this;
        let timestamp = (new Date()).toUTCString();
        let timeoutId = null;

        try {
            let timeoutItem = new ItemForTimeOutQueue(fnInternal, label, false);
            that.logger.log("debug", LOG_ID + "(setTimeout) - timestamp : ", timestamp, " - id : ", timeoutItem.getId(), " - ItemForTimeOutQueue storing");
            function fnInternal() {
                return setTimeout(async () => { fn() ; timeoutItem.timetoutInProgress = false ; await that.cleanAtimeOut(timeoutItem) ;} , timer);
            }

            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(setTimeout) - id : ", timeoutItem.getId(), " - ItemForTimeOutQueue will start.");
                    timeoutId = await timeoutItem.start();
                    that.logger.log("debug", LOG_ID + "(setTimeout) - id : ", timeoutItem.getId(), " - timeoutId : ", timeoutId);
                    that.timeoutFnTab.add(timeoutItem.getId(), timeoutItem);
                    //await until(() => { deferedResult.state != "pending"}, "Waiting the promises to complete.");
                    that.logger.log("debug", LOG_ID + "(setTimeout) - id : ", timeoutItem.getId(), " - ItemForTimeOutQueue started and finished. Will pause before leave lock. timeoutId : ", timeoutId);
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(setTimeout) - id : ", timeoutItem.getId(), " - CATCH Error !!! in lock, error : ", err);
                }
                //await pause(300);
            }, timeoutItem.getId()).then(() => {
                that.logger.log("debug", LOG_ID + "(setTimeout) - id : ", timeoutItem.getId(), " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(setTimeout) - id : ", timeoutItem.getId(), " - Catch Error, error : ", error);
                //timeoutItem.reject(error);
            }); // */
            return timeoutId;
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(setTimeout) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
    }

    setTimeoutPromised(fn, timer, label: string) {
        let that = this;

        //let that = this;
        let timestamp = (new Date()).toUTCString();
        let timeoutId = null;
        let timeoutPromise ;//= Promise.reject();


        try {
            let timeoutItem = new ItemForTimeOutQueue(fnInternal, label, true);
            that.logger.log("debug", LOG_ID + "(setTimeoutPromised) - timestamp : ", timestamp, " - id : ", timeoutItem.getId(), " - ItemForTimeOutQueue storing");
            function fnInternal(resolve, reject, id) {
                return setTimeout(async () => { 
                        if (fn && typeof fn === 'function') {
                            try {
                                fn() ;
                            } catch (err) {
                                
                            }
                        } 
                        resolve() ; 
                        timeoutItem.timetoutInProgress = false ; 
                        await that.cleanAtimeOut(timeoutItem) ; 
                    } , timer);
            }

            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(setTimeoutPromised) - id : ", timeoutItem.getId(), " - ItemForTimeOutQueue will start.");
                    timeoutPromise = timeoutItem.startPromised();
                    that.logger.log("debug", LOG_ID + "(setTimeoutPromised) - id : ", timeoutItem.getId(), " - timeoutId : ", timeoutItem.timeoutId);
                    that.timeoutFnTab.add(timeoutItem.getId(), timeoutItem);
                    //await until(() => { deferedResult.state != "pending"}, "Waiting the promises to complete.");
                    that.logger.log("debug", LOG_ID + "(setTimeoutPromised) - id : ", timeoutItem.getId(), " - ItemForTimeOutQueue started and finished. Will pause before leave lock. timeoutId : ", timeoutId);
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(setTimeoutPromised) - id : ", timeoutItem.getId(), " - CATCH Error !!! in lock, error : ", err);
                }
                //await pause(300);
            }, timeoutItem.getId()).then(() => {
                that.logger.log("debug", LOG_ID + "(setTimeoutPromised) - id : ", timeoutItem.getId(), " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(setTimeoutPromised) - id : ", timeoutItem.getId(), " - Catch Error, error : ", error);
                //timeoutItem.reject(error);
            }); // */
            return timeoutPromise;
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(setTimeoutPromised) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
       /* let that = this;

        function fnInternal() {
            return setTimeout(fn, timer);
        }

        //let that = this;
        let timestamp = (new Date()).toUTCString();
        try {
            let deferedItem = new ItemForTimeOutQueue(fnInternal);
            that.logger.log("debug", LOG_ID + "(add) - timestamp : ", timestamp, " - id : ", deferedItem.getId(), " - ItemForTimeOutQueue storing");
            //that.items.add(deferedItem);
            //setTimeoutPromised(1000).then(() => {
            that.lock(async () => {
                try {
                    //deferedItem.start.bind(deferedItem)();
                    //await pause(that.timeBetweenXmppRequests);
                    that.logger.log("debug", LOG_ID + "(add) - id : ", deferedItem.getId(), " - ItemForTimeOutQueue will start.");
                    let deferedResult : Promise<any> = await deferedItem.start();
                    //await until(() => { deferedResult.state != "pending"}, "Waiting the promises to complete.");
                    that.logger.log("debug", LOG_ID + "(add) - id : ", deferedItem.getId(), " - ItemForTimeOutQueue started and finished. Will pause before leave lock. deferedResult : ", deferedResult);
                } catch (err) {
                    that.logger.log("error", LOG_ID + "(add) - id : ", deferedItem.getId(), " - CATCH Error !!! in lock, error : ", err);
                }
                await pause(300);
            }, deferedItem.getId()).then(() => {
                that.logger.log("debug", LOG_ID + "(add) - id : ", deferedItem.getId(), " -  lock succeed.");
            }).catch((error) => {
                that.logger.log("error", LOG_ID + "(add) - id : ", deferedItem.getId(), " - Catch Error, error : ", error);
                deferedItem.reject(error);
            }); 
            return deferedItem.getPromise();
        } catch (err) {
            let error = {err : err};
            that.logger.log("error", LOG_ID + "(add) - timestamp : ", timestamp, " - CATCH Error !!! error : ", error);
            throw error;
        }
        // */
    }
    
    async cleanAtimeOut(timeoutItemQueue : ItemForTimeOutQueue) {
        let that = this;
        if (timeoutItemQueue && timeoutItemQueue.timetoutInProgress === true) {
            await timeoutItemQueue.stop();
        }
        let id = timeoutItemQueue.getId();
        that.lock(async () => {
            try {
                that.logger.log("debug", LOG_ID + "(setTimeout) - id : ", id, " - ItemForTimeOutQueue will stop. label : ", timeoutItemQueue.getLabel());
                that.timeoutFnTab.remove( (item : KeyValuePair<string, ItemForTimeOutQueue>) => {
                    return timeoutItemQueue.getId()=== timeoutItemQueue.getId();
                });
                that.logger.log("debug", LOG_ID + "(setTimeout) - id : ", id, " - ItemForTimeOutQueue started and finished.");
            } catch (err) {
                that.logger.log("error", LOG_ID + "(setTimeout) - id : ", id, " - CATCH Error !!! in lock, error : ", err);
            }
            //await pause(300);
        }, id).then(() => {
            that.logger.log("debug", LOG_ID + "(setTimeout) - id : ", id, " -  lock succeed.");
        }).catch((error) => {
            that.logger.log("error", LOG_ID + "(setTimeout) - id : ", id, " - Catch Error, error : ", error);
        }); // */
        // return timeoutId;
    }
    
    async clearEveryTimeout() {
        let that = this;
        that.logger.log("debug", LOG_ID + "(clearEveryTimeout) - __ entering __ ");
        return that.lock(async () => {
            try {
                that.logger.log("debug", LOG_ID + "(clearEveryTimeout) - clear all timeout.");
                if (that.timeoutFnTab) {
                    for (let i = 0; i < that.timeoutFnTab.length ; i++) {
                        let item = that.timeoutFnTab.elementAt(i);
                        that.logger.log("info", LOG_ID + "(clearEveryTimeout) - that.timeoutFnTab[", item.key, "] id : ", item.value?.getId(), ", label : ", item.value?.getLabel());
                        if (item.value && item.value.timetoutInProgress===true) {
                            item.value.stop();
                        }
                    }
                    /*
                    that.timeoutFnTab.forEach((item) => {
                        that.logger.log("debug", LOG_ID + "(clearEveryTimeout) - that.timeoutFnTab[", item.key,  "] : ", item.value);
                        if (item.value && item.value.timetoutInProgress === true) {
                            item.value.stop();
                        }
                    });
                    // */
                }
                that.timeoutFnTab.clear();
                return "cleared";
            } catch (err) {
                that.logger.log("error", LOG_ID + "(clearEveryTimeout) - clear all timeout - CATCH Error !!! in lock, error : ", err);
            }
            await pause(300);
        },"clearEveryTimeout").then(() => {
            that.logger.log("debug", LOG_ID + "(clearEveryTimeout) - clear all timeout -  lock succeed.");
        }).catch((error) => {
            that.logger.log("error", LOG_ID + "(clearEveryTimeout) - clear all timeout - Catch Error, error : ", error);
            //timeoutItem.reject(error);
        });
    }

    cleanNotInProgressTimeoutCache(){
        let that = this;
        that.logger.log("debug", LOG_ID + "(cleanNotInProgressTimeoutCache) - __ entering __ ");
        that.lock(async () => {
            try {
                that.logger.log("debug", LOG_ID + "(cleanNotInProgressTimeoutCache) - clear all timeout.");
                if (that.timeoutFnTab) {
                    that.timeoutFnTab.remove((item) => {
                        if (item.value && item.value.timetoutInProgress === true) {
                            return false;
                        } else {
                            that.logger.log("debug", LOG_ID + "(cleanNotInProgressTimeoutCache) - remove that.timeoutFnTab[", item.key,  "] : ", item.value);
                            return true;
                        }         
                    });
                }
                // that.timeoutFnTab.clear();
                return "cleaned";
            } catch (err) {
                that.logger.log("error", LOG_ID + "(cleanNotInProgressTimeoutCache) - clear all timeout - CATCH Error !!! in lock, error : ", err);
            }
            await pause(300);
        },"cleanNotInProgressTimeoutCache").then(() => {
            that.logger.log("debug", LOG_ID + "(cleanNotInProgressTimeoutCache) - clear all timeout -  lock succeed.");
        }).catch((error) => {
            that.logger.log("error", LOG_ID + "(cleanNotInProgressTimeoutCache) - clear all timeout - Catch Error, error : ", error);
            //timeoutItem.reject(error);
        });
    }    
    
    /*
    clearTimeout() {
        let that = this;
        return;
        that.logger.log("debug", LOG_ID + "(clearTimeout) We clear the Timeout.");
        that.lock(async () => {
            try {
                //deferedItem.start.bind(deferedItem)();
                //await pause(that.timeBetweenXmppRequests);
                that.logger.log("debug", LOG_ID + "(clearTimeout) - clear all timeout.");
                that.timeoutFnTab.clear();
                return "reseted";
            } catch (err) {
                that.logger.log("error", LOG_ID + "(clearTimeout) - clear all timeout - CATCH Error !!! in lock, error : ", err);
            }
            await pause(300);
        },"clearTimeout").then(() => {
            that.logger.log("debug", LOG_ID + "(clearTimeout) - clear all timeout -  lock succeed.");
        }).catch((error) => {
            that.logger.log("error", LOG_ID + "(clearTimeout) - clear all timeout - Catch Error, error : ", error);
            //timeoutItem.reject(error);
        });
        
    }
// */
    listEveryTimeout() {
        let that = this;
        that.logger.log("debug", LOG_ID + "(listEveryTimeout) - __ entering __ ");
        that.lock(async () => {
            try {
                that.logger.log("debug", LOG_ID + "(listEveryTimeout) - list all timeout.");
                if (that.timeoutFnTab) {
                    that.timeoutFnTab.forEach((item) => {
                        that.logger.log("debug", LOG_ID + "(listEveryTimeout) - that.timeoutFnTab[", item.key,  "] : ", item.value);
                    });
                }
                // that.timeoutFnTab.clear();
                return "listed";
            } catch (err) {
                that.logger.log("error", LOG_ID + "(listEveryTimeout) - list all timeout - CATCH Error !!! in lock, error : ", err);
            }
            await pause(300);
        },"listEveryTimeout").then(() => {
            that.logger.log("debug", LOG_ID + "(listEveryTimeout) - list all timeout -  lock succeed.");
        }).catch((error) => {
            that.logger.log("error", LOG_ID + "(listEveryTimeout) - list all timeout - Catch Error, error : ", error);
            //timeoutItem.reject(error);
        });
    }
}

module.exports.TimeOutManager = TimeOutManager;

export {TimeOutManager};
