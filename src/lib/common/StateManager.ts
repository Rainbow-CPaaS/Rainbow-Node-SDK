"use strict";
export {};


import {ErrorManager} from "./ErrorManager";
const utils= require("./Utils");

const types = {
    "STARTED": "started",
    "STARTING": "starting",
    "CONNECTED": "connected",
    "READY": "ready",
    "STOPPED": "stopped",
    "DISCONNECTED": "disconnected",
    "RECONNECTING": "reconnecting",
    "FAILED": "failed",
    "ERROR": "error"
};

const LOG_ID = "STATEMGR - ";

class StateManager {
	public eventEmitter: any;
	public logger: any;
	public state: any;

    constructor(_eventEmitter, logger) {
        this.eventEmitter = _eventEmitter;
        this.logger = logger;

        // Initial state
        this.state = types.STOPPED;
    }

    start() {
        let that = this;

        this.logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                if (that.isSTOPPED()) {
                    that.state = types.STARTING;
                    that.logger.log("info", LOG_ID + "(start) current state", that.state);
                    that.logger.log("debug", LOG_ID + "(start) _exiting_");
                    resolve();
                } else {
                    that.logger.log("error", LOG_ID + "(start) The Rainbow Node Sdk can not start because state \"" + that.state + "\" is not \"" + types.STOPPED + "\"  state. Please, call the stop method before start, or create a new rainbow-node-sdk instance");
                    that.logger.log("debug", LOG_ID + "(start) _exiting_");
                    let err = ErrorManager.getErrorManager().CUSTOMERROR(-1, "The Rainbow Node Sdk can not start when it is not in an idle state.", "The Rainbow Node Sdk can not start. Current state \"" + that.state + "\" is not \"" + types.STOPPED + "\" state. Please, call the stop method before start, or create a new rainbow-node-sdk instance");
                    return reject(err);
                }
            } catch (err) {
                that.state = types.STOPPED;
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
                that.transitTo(types.STOPPED).then(() => {
                    that.logger.log("info", LOG_ID + "(stop) current state", that.state);
                    that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                    resolve();
                }).catch((err)=> { return reject(err); });
            } catch (err) {
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                return reject(err);
            }
        });
    }

    async transitTo(state, data?) {
        return new Promise( async (resolve, reject) => {
            if (this.state === state) {
                this.logger.log("info", LOG_ID + "(transitTo) the state is yet ", this.state, ", so ignore it.");
                resolve();
            } else {
                this.state = state;
                if (this.isSTOPPED() || this.isREADY()) {
                    await utils.setTimeoutPromised(1500).then(() => {
                        this.logger.log("info", LOG_ID + "(transitTo) set state", this.state);
                        this.eventEmitter.publish(state, data);
                        resolve();
                    });
                } else {
                    this.logger.log("info", LOG_ID + "(transitTo) set state", this.state);
                    this.eventEmitter.publish(state, data);
                    resolve();
                }
            }
        });
    }

    get STOPPED() {
        return types.STOPPED;
    }

    get CONNECTED() {
        return types.CONNECTED;
    }

    get STARTED() {
        return types.STARTED;
    }

    get STARTING() {
        return types.STARTING;
    }

    get DISCONNECTED() {
        return types.DISCONNECTED;
    }

    get RECONNECTING() {
        return types.RECONNECTING;
    }

    get READY() {
        return types.READY;
    }

    get FAILED() {
        return types.FAILED;
    }

    get ERROR() {
        return types.ERROR;
    }

    isSTOPPED() {
        return (this.state === types.STOPPED);
    }

    isCONNECTED() {
        return (this.state === types.CONNECTED);
    }

    isSTARTED() {
        return (this.state === types.STARTED);
    }

    isSTARTING() {
        return (this.state === types.STARTED);
    }

    isDISCONNECTED() {
        return (this.state === types.DISCONNECTED);
    }

    isRECONNECTING() {
        return (this.state === types.RECONNECTING);
    }

    isREADY() {
        return (this.state === types.READY);
    }

    isFAILED() {
        return (this.state === types.FAILED);
    }

    isERROR() {
        return (this.state === types.ERROR);
    }

}

module.exports.StateManager = StateManager;
export{StateManager};
