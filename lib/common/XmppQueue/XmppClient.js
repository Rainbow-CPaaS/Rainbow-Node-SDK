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
        this.options = [...args];
        this.restartConnectEnabled = true;
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
                        that.logger.log("debug", LOG_ID + "(send) restart the xmpp client");
 /*                       super.restart().then((res) => {
                            that.logger.log("debug", LOG_ID + "(send) restart result : ", res);
                        }).catch(()=>{
                        }).then(()=>{
                            that.logger.log("debug", LOG_ID + "(send) _exiting_ return promise with a rejecting : ", err);
                            // */
                            reject2(err);
   //                     });
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
            that.logger.log("debug", LOG_ID + "(send) restart the xmpp client");
            //super.restart()
            that.restartConnect().then((res) => {
                that.logger.log("debug", LOG_ID + "(send) restartConnect result : ", res);
            }).catch(()=>{
            }).then(()=>{
                that.logger.log("debug", LOG_ID + "(send) _exiting_ return promise with a throw error : ", err);
                throw  err;
            });
            // */
        });
    }

    restartConnect() {
        let that = this;
        if (this.restartConnectEnabled) {
            return super.disconnect(5000).then((result) => {
                that.logger.log("debug", LOG_ID + "(restartConnect) disconnect result : ", result);
                return that.open(that.options);
            });
        } else {
            return Promise.resolve("restartReconnect is disabled");
        }
    }

    start(...args) {
        this.restartConnectEnabled = true;
        let superresult = super.start(...args);
        return superresult;
    }

    stop(...args) {
        this.restartConnectEnabled = false;
        let superresult = super.stop(...args);
        return superresult;
    }
}

module.exports.XmppClient = XmppClient
