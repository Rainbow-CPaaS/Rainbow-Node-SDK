'use strict'

/* module.exports = function () {
    return 'Hello, world! it is queue!';
}; // */

//var intanceofXmppQueue = undefined;
let LOG_ID = 'XMPPQUEUE';

class XmppQueue {
    constructor(_logger) {
        this.logger = _logger; // Temp to be changed
        this.requestsToSend = Promise.resolve();
    }

    addPromise(promiseFactory) {
        let that = this;
        that.logger.log("debug", LOG_ID + "(addPromise) _entering_");
        this.requestsToSend = this.requestsToSend.then(() => {
            that.logger.log("debug", LOG_ID + "(addPromise) promise storing");
            return promiseFactory;
        });
        return this.requestsToSend;
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

}

function getXmppQueue(_logger) {
    return new XmppQueue(_logger);
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