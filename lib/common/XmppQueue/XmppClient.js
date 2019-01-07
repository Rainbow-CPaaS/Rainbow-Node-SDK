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
}

module.exports.XmppClient = XmppClient
