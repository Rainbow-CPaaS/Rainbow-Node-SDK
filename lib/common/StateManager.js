"use strict";

let Error = require("./Error");

const types = {
    "STARTED": "started",
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
                    that.state = types.STOPPED;
                    that.logger.log("info", LOG_ID + "(start) current state", that.state);
                    that.logger.log("debug", LOG_ID + "(start) _exiting_");
                    resolve();
                } else {
                    that.logger.log("error", LOG_ID + "(start) The Rainbow Node Sdk can not start because state \"" + that.state + "\" is not \"" + types.STOPPED + "\"  state. Please, call the stop method before start, or create a new rainbow-node-sdk instance");
                    that.logger.log("debug", LOG_ID + "(start) _exiting_");
                    let err = Error.CUSTOMERROR(-1, "The Rainbow Node Sdk can not start when it is not in an idle state.", "The Rainbow Node Sdk can not start. Current state \"" + that.state + "\" is not \"" + types.STOPPED + "\" state. Please, call the stop method before start, or create a new rainbow-node-sdk instance");
                    reject(err);
                }
            } catch (err) {
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                reject(err);
            }
        });
    }

    stop() {
        let that = this;

        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.transitTo(types.STOPPED);
                that.logger.log("info", LOG_ID + "(stop) current state", that.state);
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve();
            } catch (err) {
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject();
            }
        });
    }

    transitTo(state, data) {
        if (this.state === state) {
            this.logger.log("info", LOG_ID + "(transitTo) the state is yet ", this.state, ", so ignore it.");
        } else {
            this.state = state;
            this.logger.log("info", LOG_ID + "(transitTo) set state", this.state);
            this.eventEmitter.publish(state, data);
        }
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

module.exports = StateManager;
