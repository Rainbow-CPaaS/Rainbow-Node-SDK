'use strict'
/*

const Client = require('./lib/Client')
const {xml, jid} = require('@xmpp/client-core')

module.exports.Client = Client
module.exports.xml = xml
module.exports.jid = jid

 */

let Client = require("@xmpp/client").Client;
let XmppQueue = require("./XmppQueue");

let LOG_ID='XMPPCLIENT';

class XmppClient extends Client {
    constructor(...args) {
        super(...args);
        this.iqGetEventWaiting = {};
        let that = this;

        this.onIqErrorReceived = (msg, stanza) => {
            //let children = stanza.children;
            let iqId = stanza.attrs.id;
            let errorMsg = stanza.getChild("error")?stanza.getChild("error").getChild("text").getText() ||  "" : "";
            that.logger.log("warn", LOG_ID + "(XmmpClient) onIqErrorReceived received iq result - 'stanza id '", iqId, msg, errorMsg);
            // reject and delete the waiting iq.
            if (typeof that.iqGetEventWaiting[iqId] === "function") {
                that.iqGetEventWaiting[iqId](stanza);
            } else {
                delete that.iqGetEventWaiting[iqId];
            }
        };

        this.onIqResultReceived = (msg, stanza) => {
            //let children = stanza.children;
            let iqId = stanza.attrs.id;
            that.logger.log("warn", LOG_ID + "(XmmpClient) onIqResultReceived received iq result - 'stanza id '", iqId);
            if (that.iqGetEventWaiting[iqId]) {
                // The result iq correspond to a stored promise from our request, so resolve it to allow sendIq to get back a result.
                if (typeof that.iqGetEventWaiting[iqId] === "function") {
                    that.iqGetEventWaiting[iqId](stanza);
                } else {
                    delete that.iqGetEventWaiting[iqId];
                }
            } else {
            }
            /*            children.forEach((node) => {
                            switch (node.getName()) {
                                case "query":
                                    that._onIqGetQueryReceived(stanza, node);
                                    break;
                                case "pbxagentstatus":
                                    // The treatment is in telephonyEventHandler
                                    //that._onIqGetPbxAgentStatusReceived(stanza, node);
                                    break;
                                case "default":
                                    that.logger.log("warn", LOG_ID + "(handleXMPPConnection, onIqResultReceived) not managed - 'stanza'", node.getName());
                                    break;
                                default:
                                    that
                                        .logger
                                        .log("warn", LOG_ID + "(handleXMPPConnection, onIqResultReceived) child not managed for iq - 'stanza'", node.getName());
                            }
                        });
                        if (stanza.attrs.id === "enable_xmpp_carbon") {
                            that.eventEmitter.emit("rainbow_oncarbonactivated");
                        } */
        };

    }

    init(_logger, _timeBetweenXmppRequests){
        this.logger = _logger;
        this.xmppQueue = XmppQueue.getXmppQueue(_logger);
        this.timeBetweenXmppRequests = _timeBetweenXmppRequests ? _timeBetweenXmppRequests : 20 ;
    }

    send(...args) {
        let that = this;
        that.logger.log("debug", LOG_ID + "(send) _entering_");
        return new Promise((resolve) => {
            let prom = this.xmppQueue.addPromise(
                new Promise((resolve2, reject2) => {
                    if (args && args[0]) {
                        that.logger.log("internal", LOG_ID + "(send) stanza to send ", that.logger.colors.gray(args[0].toString()));
                    } else {
                        that.logger.log("error", LOG_ID + "(send) stanza to send is empty");
                    }
                    return super.send(...args).then(()=> {
                        resolve2();
                    }).catch((err) => {
                        that.logger.log("debug", LOG_ID + "(send) _catch error_ at super.send", err);
                        reject2();
                    });
                })
            ).then(() => {
                that.logger.log("debug", LOG_ID + "(send) sent");
            });

            // Wait a few time between requests to avoid burst with lot of it.
            setTimeout(() => {
                //that.logger.log("debug", LOG_ID + "(send) setTimeout resolve");
                resolve(prom);
            }, that.timeBetweenXmppRequests);
        }).then((promiseToreturn) => {
            that.logger.log("debug", LOG_ID + "(send) _exiting_ return promise");
            return promiseToreturn;
        }).catch((err) => {
            that.logger.log("debug", LOG_ID + "(send) catch an error during sending! ", err);
            that.logger.log("debug", LOG_ID + "(send) _exiting_ return promise");
            return err;
        });
    }

    stop(...args) {

        return super.stop(...args);
    }

    sendIq (...args){
        let that = this;
        that.logger.log("debug", LOG_ID + "(send) _entering_");
        return new Promise((resolve) => {
            if (args.length > 0) {
                let prom = this.xmppQueue.addPromise(super.send(...args).catch((err) => {
                    that.logger.log("debug", LOG_ID + "(send) _catch error_ at super.send", err);
                })).then(() => {
                    that.logger.log("debug", LOG_ID + "(send) sent");
                });

                // callback to be called when the IQ Get result event is received from server.
                function cb(result) {
                    // Wait a few time between requests to avoid burst with lot of it.
                    setTimeout(() => {
                        //that.logger.log("debug", LOG_ID + "(send) setTimeout resolve");
                        resolve(prom.then(() => { return result;})) ;
                    }, that.timeBetweenXmppRequests);
                }

                let idId = args[0].attrs.id;

                // Store the promise to be resolved
                this.iqGetEventWaiting[idId] = cb;

                /* // Wait a few time between requests to avoid burst with lot of it.
                setTimeout(()=> {
                    //that.logger.log("debug", LOG_ID + "(send) setTimeout resolve");
                    resolve(prom);
                }, that.timeBetweenXmppRequests); // */
            } else {
                resolve(Promise.resolve());
            }
        }).then((promiseToreturn) => {
            that.logger.log("debug", LOG_ID + "(send) _exiting_ return promise");
            return promiseToreturn;
        });
    }

}

module.exports.XmppClient = XmppClient
