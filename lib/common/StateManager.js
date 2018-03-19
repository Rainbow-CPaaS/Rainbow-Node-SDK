"use strict";

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
                that.state = types.STOPPED;
                that.logger.log("info", LOG_ID + "(start) current state", that.state);
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();
            } catch (err) {
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                reject();
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

    transitTo(state) {
        this.state = state;
        this.logger.log("info", LOG_ID + "(transitTo) set state", this.state);
        this.eventEmitter.publish(state);
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
}

module.exports = StateManager;
