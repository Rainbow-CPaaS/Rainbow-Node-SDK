"use strict";
export {};


const promiseFinaly = require('promise.prototype.finally');

promiseFinaly.shim();

let LOG_ID = "UTILS/PROMQ - ";

// Constructor
class PromiseQueue{
	public logger: any;
	public queue: any;
	public started: any;

    constructor (_logger) {
        //var that = this;

        this.logger = _logger;
        this.queue = [];
        this.started = false;
    }
    add (promise) {
        let that = this;
        that.logger.log("debug", LOG_ID + "[PromiseQueue] (add) _entering_");
        this.queue.push(promise);
        if (!this.started) {
            this.started = true;
            this.execute();
        }
    }

    execute () {
        let that = this;
        that.logger.log("debug", LOG_ID + "[PromiseQueue] (execute) _entering_");
        let promise = this.queue.shift();
        if (promise) {
            let pr = promise();
            if (pr) {
                pr.catch(function (error) {
                    let errorMessage = (error && error.message) ? error.message : "Unknown error";
                    //$log.error("[PromiseQueue] execute failure -- " + errorMessage);
                    that.logger.log("error", LOG_ID + "[PromiseQueue] (execute) failure ");
                    that.logger.log("internalerror", LOG_ID + "[PromiseQueue] (execute) failure -- " + errorMessage);
                })
                    .finally(function () {
                        that.execute();
                    });
            } else {
                that.logger.log("error", LOG_ID + "[PromiseQueue] (execute) pr is undefined. Start next promise " );
                that.execute();
            }
        }
        else {
            this.started = false;
        }
    }
}

// Static factories
let createPromiseQueue = function (_logger) {
    return new PromiseQueue(_logger);
};

//module.exports.PromiseQueue = PromiseQueue;
module.exports.createPromiseQueue = createPromiseQueue;
export {createPromiseQueue};