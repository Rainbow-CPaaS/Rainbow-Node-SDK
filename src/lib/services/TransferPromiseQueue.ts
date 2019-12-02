"use strict";
import {Logger} from "../common/Logger";

export {};


import {ErrorManager} from "../common/ErrorManager";

const LOG_ID = "TRFPROMISEQUEUE - ";

class TransferPromiseQueue {
	public fileQueue: any;
	public currentQueue: any;
	public logger: Logger;
	public currentPromise: Promise<any>;
	public promiseCompletion: any;
	public promiseReject: any;
	public initialQueueSize: any;
	public promisesDone: any;
	public chunkErrorCounter: any;

    constructor( _logger) {
        this.fileQueue = [];
        this.currentQueue = [];
        //this.clearContext();
        this.logger =  _logger;
    }

    addPromiseArray(promiseArray, promiseCompletion, promiseReject) {
        let that = this;

        that.logger.log("debug", LOG_ID + "(addPromiseArray) adding promiseArray");

        let promiseInfos = {promiseArray: null, promiseCompletion: null, promiseReject: null};
        promiseInfos.promiseArray = promiseArray;
        promiseInfos.promiseCompletion = promiseCompletion;
        promiseInfos.promiseReject = promiseReject;

        if (that.fileQueue.length === 0 && !that.currentPromise) {
            that.logger.log("internal", LOG_ID + "(addPromiseArray) configuring file to transfert: " + promiseInfos.promiseArray.length);
            that.fileQueue.push(promiseInfos);

            that.popFileQueue();
        } else {
            that.fileQueue.push(promiseInfos);
            that.logger.log("internal", LOG_ID + "(addPromiseArray) adding PromiseArray in FileQueue: " + that.fileQueue.length);
        }

        that.logger.log("internal", LOG_ID + "(addPromiseArray) adding promise on FileQueue: " + that.fileQueue.length);
    }

    popFileQueue() {
        let that = this;

        if (that.fileQueue.length > 0) {
            that.logger.log("internal", LOG_ID + "(popFileQueue) go to next file");
            let promiseInfos = that.fileQueue.shift();
            that.currentQueue = promiseInfos.promiseArray;
            that.promiseCompletion = promiseInfos.promiseCompletion;
            that.promiseReject = promiseInfos.promiseReject;
            that.initialQueueSize = that.currentQueue.length;
            that.promisesDone = 0;
            that.chunkErrorCounter = 0;
            that.currentPromise = that.currentQueue.shift();
            that.execute();
        } else {
            that.logger.log("internal", LOG_ID + "(popFileQueue) no more file to transfer");
            that.clearContext();
        }
    }

    execute() {
        let that = this;
        that.logger.log("internal", LOG_ID + "(execute) execute");
        if (that.currentPromise) {
            that.logger.log("internal", LOG_ID + "(execute) performing promise: " + that.promisesDone);

            that.currentPromise.then(() => {
                    that.logger.log("internal", LOG_ID + "(execute) promise success go to next one");
                    that.promisesDone++;
                    that.chunkErrorCounter = 0;
                    if (that.promisesDone >= that.initialQueueSize) {
                        that.promiseCompletion();

                        that.popFileQueue();
                    } else {
                        that.currentPromise = that.currentQueue.shift();
                        that.execute();
                    }
                })
                .catch((error) => {
                    let errorMessage = (error && error.message) ? error.message : "Unknown error";
                    that.logger.log("internal", LOG_ID + "(execute) failure executing promise -- " + errorMessage);

                    // Manage Retry of chunk
                    that.chunkErrorCounter++;
                    if (error.errorDetailsCode >= 500 && that.chunkErrorCounter <= 3) {
                        that.execute();
                    } else {
                        that.logger.log("error", LOG_ID + "(execute) 3 chunk failed - ABORT File Upload");
                        that.promiseReject(error);

                        that.popFileQueue();
                    }
                });
        } else {
            that.logger.log("internal", LOG_ID + "(execute) no promise to perform");
            that.currentPromise = undefined;
        }
    }

    isTransferInProgress() {
        let that = this;

        that.logger.log("internal", LOG_ID + "(isTransferInProgress) >isTransferInProgress: " + that.fileQueue.length + "/" + that.currentQueue.length);
        return that.fileQueue.length > 0 || that.currentQueue.length > 0 || that.currentPromise;
    }

    cancelAllTransfers() {
        let that = this;

        that.logger.log("internal", LOG_ID + "(cancelAllTransfers) cancelAllTransfers");
        that.fileQueue = [];
        that.currentQueue = [];
    }

    clearContext() {
        let that = this;
        that.cancelAllTransfers();
    }
}

module.exports = TransferPromiseQueue;
