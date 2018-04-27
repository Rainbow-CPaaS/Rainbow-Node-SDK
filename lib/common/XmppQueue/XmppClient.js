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

    send (...args){
        let that = this;
        that.logger.log("debug", LOG_ID + "(send) _entering_");
        return new Promise((resolve) => {
            let prom = this.xmppQueue.addPromise(super.send(...args).catch((err) => {
                that.logger.log("debug", LOG_ID + "(send) _catch error_ at super.send", err);
            })).then(() => {
                that.logger.log("debug", LOG_ID + "(send) sent");
            });

            // Wait a few time between requests to avoid burst with lot of it.
            setTimeout(()=> {
                //that.logger.log("debug", LOG_ID + "(send) setTimeout resolve");
                resolve(prom);
            }, that.timeBetweenXmppRequests);
        }).then((promiseToreturn) => {
            that.logger.log("debug", LOG_ID + "(send) _exiting_ return promise");
            return promiseToreturn;
        });
    }
}

module.exports.XmppClient = XmppClient
