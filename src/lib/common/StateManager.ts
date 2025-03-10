"use strict";
import {TimeOutManager} from "./TimeOutManager";

export {};


import {ErrorManager} from "./ErrorManager";
import {stackTrace} from "./Utils.js";
const utils= require("./Utils");

enum SDKSTATUSENUM {
    "STARTED" = "started",
    "STARTING" = "starting",
    "CONNECTED" = "connected",
    "READY" = "ready",
    "STOPPED" = "stopped",
    "DISCONNECTED" = "disconnected",
    "RECONNECTING" = "reconnecting",
    "FAILED" = "failed",
    "ERROR" = "error",
}

const LOG_ID = "STATEMGR - ";

class StateManager {
	public eventEmitter: any;
	public logger: any;
	public state: any;
    private timeOutManager: TimeOutManager;

    constructor(_eventEmitter, logger, timeOutManager : TimeOutManager) {
        this.eventEmitter = _eventEmitter;
        this.logger = logger;
        this.timeOutManager = timeOutManager;

        // Initial state
        this.state = SDKSTATUSENUM.STOPPED;
    }

    start() {
        let that = this;

        this.logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                if (that.isSTOPPED()) {
                    that.state = SDKSTATUSENUM.STARTING;
                    that.logger.log("info", LOG_ID + "(start) current state", that.state);
                    that.logger.log("debug", LOG_ID + "(start) _exiting_");
                    resolve(undefined);
                } else {
                    that.logger.log("error", LOG_ID + "(start) The Rainbow Node Sdk can not start because state \"" + that.state + "\" is not \"" + SDKSTATUSENUM.STOPPED + "\"  state. Please, call the stop method before start, or create a new rainbow-node-sdk instance");
                    that.logger.log("debug", LOG_ID + "(start) _exiting_");
                    let err = ErrorManager.getErrorManager().CUSTOMERROR(-1, "The Rainbow Node Sdk can not start when it is not in an idle state.", "The Rainbow Node Sdk can not start. Current state \"" + that.state + "\" is not \"" + SDKSTATUSENUM.STOPPED + "\" state. Please, call the stop method before start, or create a new rainbow-node-sdk instance", undefined);
                    return reject(err);
                }
            } catch (err) {
                that.state = SDKSTATUSENUM.STOPPED;
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                return reject(err);
            }
        });
    }

    stop() {
        let that = this;

        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.transitTo(true, SDKSTATUSENUM.STOPPED).then(() => {
                    that.logger.log("info", LOG_ID + "(stop) current state", that.state);
                    that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                    resolve(undefined);
                }).catch((err)=> { return reject(err); });
            } catch (err) {
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                return reject(err);
            }
        });
    }

    async transitTo(publishEvent : boolean = true, state : SDKSTATUSENUM, data?) {
        let that = this;
        return new Promise(async (resolve, reject) => {
            that.logger.log("info", LOG_ID + "(transitTo) __entering__ will try to transit from state : ", this.state, " to ", state);
            if (that.state===state) {
                that.logger.log("info", LOG_ID + "(transitTo) the state is yet ", that.state, ", so ignore it.");
                resolve(undefined);
            } else {
                that.state = state;
                if (that.isREADY()) {
                    //if (that.isSTOPPED() || that.isREADY()) {
                    try {
                        await that.timeOutManager.setTimeoutPromised(() => {
                            // await this.timeOutManager.setTimeoutPromised(undefined,1500, "transitTo : " + state).then(() => {
                            that.logger.log("info", LOG_ID + "(transitTo) setTimeoutPromised set state : ", that.state);
                            if (publishEvent) {
                                that.eventEmitter.publish(state, data);
                            }
                            resolve(undefined);
                        }, 1500, "(transitTo) setTimeoutPromised set state : " + that.state);
                    } catch (err) {
                        that.logger.log("warn", LOG_ID + "(transitTo) CATCH Error !!! error : ", err);
                    }
                } else if (that.isSTOPPED()) {
                    try {
                        setTimeout(() => {
                            // await this.timeOutManager.setTimeoutPromised(undefined,1500, "transitTo : " + state).then(() => {
                            that.logger.log("info", LOG_ID + "(transitTo) setTimeoutPromised set state : ", that.state);
                            if (publishEvent) {
                                that.eventEmitter.publish(state, data);
                            }
                            resolve(undefined);
                        }, 100/* , "(transitTo) setTimeout set state : " + that.state */);
                    } catch (err) {
                        that.logger.log("warn", LOG_ID + "(transitTo) CATCH Error !!! error : ", err);
                    }
                } else {
                    that.logger.log("info", LOG_ID + "(transitTo) set state : ", that.state);
                    if (that.isERROR() || that.isFAILED()) {
                        that.logger.log("warn", LOG_ID + "(transitTo) stackTrace : ", stackTrace());
                    }
                    if (publishEvent) {
                        that.eventEmitter.publish(state, data);
                    }
                    resolve(undefined);
                }
            }
        });
    }

    get STOPPED() {
        return SDKSTATUSENUM.STOPPED;
    }

    get CONNECTED() {
        return SDKSTATUSENUM.CONNECTED;
    }

    get STARTED() {
        return SDKSTATUSENUM.STARTED;
    }

    get STARTING() {
        return SDKSTATUSENUM.STARTING;
    }

    get DISCONNECTED() {
        return SDKSTATUSENUM.DISCONNECTED;
    }

    get RECONNECTING() {
        return SDKSTATUSENUM.RECONNECTING;
    }

    get READY() {
        return SDKSTATUSENUM.READY;
    }

    get FAILED() {
        return SDKSTATUSENUM.FAILED;
    }

    get ERROR() {
        return SDKSTATUSENUM.ERROR;
    }

    isSTOPPED() {
        return (this.state === SDKSTATUSENUM.STOPPED);
    }

    isCONNECTED() {
        return (this.state === SDKSTATUSENUM.CONNECTED);
    }

    isSTARTED() {
        return (this.state === SDKSTATUSENUM.STARTED);
    }

    isSTARTING() {
        return (this.state === SDKSTATUSENUM.STARTED);
    }

    isDISCONNECTED() {
        return (this.state === SDKSTATUSENUM.DISCONNECTED);
    }

    isRECONNECTING() {
        return (this.state === SDKSTATUSENUM.RECONNECTING);
    }

    isREADY() {
        return (this.state === SDKSTATUSENUM.READY);
    }

    isFAILED() {
        return (this.state === SDKSTATUSENUM.FAILED);
    }

    isERROR() {
        return (this.state === SDKSTATUSENUM.ERROR);
    }

}

module.exports.StateManager = StateManager;
module.exports.SDKSTATUSTYPES = SDKSTATUSENUM;
export{StateManager, SDKSTATUSENUM};
