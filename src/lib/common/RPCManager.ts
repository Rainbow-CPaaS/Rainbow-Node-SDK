"use strict";
import {Deferred, doWithinInterval, functionSignature, pause, setTimeoutPromised} from "./Utils.js";
import {Dictionary, IDictionary, KeyValuePair, List} from "ts-generic-collections-linq";
import {XMPPUTils} from "./XMPPUtils.js";
import {type} from "os";
import {isFunction} from "util";
import {Logger} from "./Logger.js";
import {TimeOutManager} from "./TimeOutManager.js";
import {Bubble} from "./models/Bubble.js";

export {};

let AsyncLock = require('async-lock');

let LOG_ID = 'RPC/MGR - ';

let xmppUtils = XMPPUTils.getXMPPUtils();

class RPCmethod{
    methodName = undefined;
    //methodParams = [];
    methodCallback : any;
    methodDescription = "";
    methodHelp = "";

    constructor(methodName : string = undefined, methodCallback : any = undefined, methodDescription : string = undefined, methodHelp : string = undefined ) {
        let that = this;
        that.methodName = methodName ? methodName : "emptymethod_" + new Date().toJSON().replace(/-/g, "_");
        that.methodCallback = methodCallback ? methodCallback : () => {};
        that.methodDescription = methodDescription ? methodDescription : that.methodName;
        that.methodHelp = methodHelp ? methodHelp : that.methodName;
    }
}

class RPCManager{
    private logger : Logger;
    private rpcMethods: IDictionary<string, RPCmethod> = new Dictionary();


    constructor(_logger : Logger) {
        let that = this;
        that.logger = _logger;

        // timeout: 5000, Specify timeout - max amount of time an item can remain in the queue before acquiring the lock 
        // maxPending: 1000, Set max pending tasks - max number of tasks allowed in the queue at a time
        // maxOccupationTime : 3000 Specify max occupation time - max amount of time allowed between entering the queue and completing execution
        that.lockEngine = new AsyncLock({timeout: 3 * 60 * 1000, maxPending: 1000, maxOccupationTime : 5 * 60 * 1000});

        that.reset();
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
            }, id).then((result) => {
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

    add( rpcMethod : RPCmethod){
        let that = this;
        let id = (new Date()).getTime();
        let resultOfAdd =  rpcMethod.methodName + " not added.";

        that.logger.log("internal", LOG_ID + "(add) - id : ", id, " - will lock.");
        that.lock(() => {
            that.logger.log("internal", LOG_ID + "(add) - id : ", id, " - rpcMethod.methodName : ", rpcMethod.methodName);
            if (!that.rpcMethods.containsKey(rpcMethod.methodName))  {
                that.logger.log("debug", LOG_ID + "(add) We add the RPCMethod in the Dictionary : ", rpcMethod.methodName);
                that.rpcMethods.add(rpcMethod.methodName, rpcMethod);
                resultOfAdd = rpcMethod.methodName + " added." ;
            } else {
                that.logger.log("debug", LOG_ID + "(add) The rpcMethod is Already stored : ", rpcMethod.methodName);
                resultOfAdd = rpcMethod.methodName + " is already present, so you need to remove it before add." ;
            }
        }, id).then(() => {
            that.logger.log("debug", LOG_ID + "(add) - id : ", id, " -  lock succeed.");
        }).catch((error) => {
            that.logger.log("error", LOG_ID + "(add) - id : ", id, " - Catch Error, error : ", error);
        });
        return resultOfAdd;
    }

    treatRPCMethod(methodName, params) {
        let that = this;
        let id = (new Date()).getTime();
        let result = undefined;

        that.logger.log("internal", LOG_ID + "(treatRPCMethod) - id : ", id, " - will lock.");
        that.lock(() => {
            that.rpcMethods.toArray().filter(item => item.key === methodName).forEach( (item : KeyValuePair<string, RPCmethod>)  => {
                that.logger.log("internal", LOG_ID + "(treatRPCMethod) - id : ", id, " - will call treat rpcMethod : ", methodName);
                result = item.value.methodCallback(...params);
            });
        }, id).then(() => {
            that.logger.log("debug", LOG_ID + "(treatRPCMethod) - id : ", id, " -  lock succeed.");
        }).catch((error) => {
            that.logger.log("error", LOG_ID + "(treatRPCMethod) - id : ", id, " - Catch Error, error : ", error);
        });
        return result;
    }

    remove(methodName) {
        let that = this;
        let id = (new Date()).getTime();
        let resultOfRemove =  methodName + " not removed.";

        that.lock(() => {
            let currentDate = Date.now();
            if ( (that.rpcMethods.containsKey(methodName)) )
            {
                that.logger.log("debug", LOG_ID + "(removeBubbleToJoin) We remove the RPCmethod - methodName : ", methodName);
                that.rpcMethods.remove((item: KeyValuePair<string, RPCmethod>) => {
                    return methodName === item.key;
                });
                resultOfRemove =  methodName + " removed.";
            } else {
                resultOfRemove =  methodName + " is not present, so it is not removed.";
            }
        }, id).then(() => {
            that.logger.log("debug", LOG_ID + "(remove) - id : ", id, " -  lock succeed.");
        }).catch((error) => {
            that.logger.log("error", LOG_ID + "(remove) - id : ", id, " - Catch Error, error : ", error);
        });
        return resultOfRemove;
    }

    async reset(): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.logger.log("debug", LOG_ID + "(reset) We clear the Bubbles from poolBubbleAlreadyJoined, poolBubbleJoinInProgress, poolBubbleToJoin.");
            that.lock(() => {
                // Treatment in the lock
                that.rpcMethods.clear();
                return "reseted";
            }, "").then((result) => {
                that.logger.log("internal", LOG_ID + "(reset) Succeed - result : ", result);
                resolve(result);
            }).catch((result) => {
                that.logger.log("internal", LOG_ID + "(reset) Failed - result : ", result);
                resolve(undefined);
            });
        });
    }

    listMethods () {
        let that = this;
        let result = this.rpcMethods.toArray().map((rpcMethodIter)=>{
            return rpcMethodIter.value.methodName;
        });
        that.logger.log("internal", LOG_ID + "(listMethods) - result : ", result);
        return result;
    }

    methodSignature (methodName) {
        let that = this;
        //let result = that.rpcMethods[methodName]?that.rpcMethods[methodName].callback?that.rpcMethods[methodName].callback.toString():"":"";
        let rpcMethod = that.rpcMethods.tryGetValue(methodName);
        let methodCallback = rpcMethod?rpcMethod.methodCallback.toString():undefined;                //
        let result = functionSignature(methodCallback) ;
        that.logger.log("internal", LOG_ID + "(methodSignature) - result : ", result);
        return result;
    }

    methodHelp (methodName) {
        let that = this;
        let rpcMethod = that.rpcMethods.tryGetValue(methodName);
        let result = rpcMethod?rpcMethod.methodHelp?rpcMethod.methodHelp:"":"";
        that.logger.log("internal", LOG_ID + "(methodHelp) - result : ", result);
        return result;
    }

    multicall (param1) {
        let that = this;
        let result = "multicall not implemented. " + param1 + " ignored!" ;
        that.logger.log("internal", LOG_ID + "(multicall) - result : ", result);
        return result;
    }

    shutdown () {
        let that = this;
        let result = "shutdown not implemented";
        that.logger.log("internal", LOG_ID + "(shutdown) - result : ", result);
        return result;
    }
    
    private lockEngine: any;
    private lockKey = "LOCK_RPC_LIST";
}

module.exports.RPCManager = RPCManager;
module.exports.RPCmethod = RPCmethod;

export {RPCManager, RPCmethod};
