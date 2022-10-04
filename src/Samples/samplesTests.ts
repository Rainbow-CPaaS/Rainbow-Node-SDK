"use strict";
/*
 * @name index.ts
 *
 * @description :
 * The index.ts file is not a "best practice", but it is a file used by developper to test/validate the SDK, so you can find in it some help.
 *
 */
import {
    pause,
    setTimeoutPromised,
    until,
    getRandomInt,
    Deferred,
    doWithinInterval,
    stackTrace
} from "../lib/common/Utils";
import {List} from "ts-generic-collections-linq";
import {inspect} from "util";
import {sample, timeout} from "rxjs";
import {KeyValuePair} from "ts-generic-collections-linq/lib/dictionary";
import {Bubble} from "../lib/common/models/Bubble";
import {setInterval} from "timers";
import {error} from "winston";

const inquirer = require("inquirer");
var AsyncLock = require('async-lock');

let LOG_ID = "SAMPLESTESTS";

process.on('unhandledRejection', e => {
    //that.logger.log("error", LOG_ID + "(unhandledRejection) !!! CATCH Error e : ", e, ", stack : ", stackTrace());
    console.log("(unhandledRejection) !!! CATCH Error e : ", e, ", stack : ", stackTrace()); 
});

async function fn() {
    logger.log("debug", "MAIN - fn.");

    return;
}

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

    async start() : Promise<any>{
        let that = this;
        try {
            /*
            // Wait a few time between requests to avoid burst with lot of it.
            utils.setTimeoutPromised(that.timeBetweenXmppRequests).then(() => {
                //that.logger.log("debug", LOG_ID + "(send) setTimeout resolve");
                resolve(prom);
            });
            // */
            //return that.resolve(await that.itemFunction(that.defered.resolve, that.defered.reject));
            that.itemFunction(that.defered.resolve, that.defered.reject);
             doWithinInterval({promise:that.defered.promise, timeout : 5000, error : "Timeout raised."}).catch((err) => {
                 that.defered.reject(err);
             });
            return that.defered.promise;
        }
        catch (err) {
        }
    }
}

class SamplesTests {
    private lockKey: string;
    private logger: any;
    private lockEngine: any;
    timeBetweenXmppRequests: any;
    private listRequests : List<any>;
    
    constructor(logger) {
        let that = this;
        that.lockKey = "LOCKKEYNAME";
        that.logger = logger;
        that.timeBetweenXmppRequests = 10000;
        that.lockEngine = new AsyncLock({timeout: 8000, maxOccupationTime: 10000, maxPending: 1000});
        that.listRequests = new List<any>();
        //setInterval(that.treat, that.timeBetweenXmppRequests);    
    }

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
    
    async treat() {
        let that = this;
        while (that.listRequests.length > 0) {
            try {

                let item: ItemForQueue = that.listRequests.elementAt(0);
                if (!item) return;
                that.logger.log("debug", LOG_ID + "(getBubbleToJoin) We retrieved the ItemForQueue item from listRequests - item : ", item);
                await item.start();
                that.logger.log("debug", LOG_ID + "(getBubbleToJoin) We remove the ItemForQueue item from listRequests - item : ", item);
                that.listRequests.removeAt(0);/*((item: ItemForQueue) => {
                return roomJid === item.key;
            }); // */
            } catch (err){
                that.logger.log("error", LOG_ID + "(treat) - CATCH Error !!! error : ", err);
            }
        }

    }
    
}

async function testAsyncLockEngine() {
    let that = this;

    async function fnToRunKO(resolve, reject) {
        logger.log("debug", "MAIN - fn KO.");

        return;
    }

    async function fnToRunOK(resolve, reject) {
        logger.log("debug", "MAIN - fn OK.");

        return resolve("The request SUCCEED.");
    }

    let samplesTests = new SamplesTests(logger);
    samplesTests.add(fnToRunKO).then((result)=>{
        logger.log("debug", "MAIN - fn KO DONE : ", result);
    }).catch((err)=>{
        logger.log("error", "MAIN - fn KO FAILED : ", err);
    });
    //await pause(4000);
    samplesTests.add(fnToRunOK).then((result)=>{
        logger.log("debug", "MAIN - fn OK DONE : ", result);
    }).catch((err)=>{
        logger.log("error", "MAIN - fn OK FAILED : ", err);
    }); //*/
}

function testAsyncLock() {
    let LOCK_KEY = "myKeyName";
    let lock = new AsyncLock({timeout: 5000, maxOccupationTime: 3000, maxPending: 1000});
    lock.acquire(LOCK_KEY, fn);
}

let logger = {log : console.log};
function commandLineInteraction() {
    let questions = [
        {
            type: "input",
            name: "cmd",
            message: "Command> "
        }
    ];
    logger.log("debug", "MAIN - commandLineInteraction, enter a command to eval : "); //logger.colors.green(JSON.stringify(result)));
    inquirer.prompt(questions).then(answers => {
        //console.log(`Hi ${answers.cmd}!`);
        logger.log("debug", "MAIN - cmd entered : ", answers.cmd); //logger.colors.green(JSON.stringify(result)));
        try {
            if (answers.cmd==="by") {
                logger.log("debug", "MAIN - exit."); //logger.colors.green(JSON.stringify(result)));
                    process.exit(0);
            } else {
                logger.log("debug", "MAIN - run cmd : ", answers.cmd); //logger.colors.green(JSON.stringify(result)));
                eval(answers.cmd);
                commandLineInteraction();
            }
        } catch (e) {
            logger.log("debug", "MAIN - CATCH Error : ", e); //logger.colors.green(JSON.stringify(result)));
            commandLineInteraction();
        }
    });
}

commandLineInteraction();
