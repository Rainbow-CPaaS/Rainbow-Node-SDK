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

    init(_logger){
        this.logger = _logger;
        this.xmppQueue = XmppQueue.getXmppQueue(_logger);
    }

    send (...args){
        let that = this;
        that.logger.log("debug", LOG_ID + "(send) _entering_");
        return this.xmppQueue.addPromise(super.send(...args).catch((err) => {
            that.logger.log("debug", LOG_ID + "(send) _catch error_ at super.send", err);
            })).then((res) => {
            that.logger.log("debug", LOG_ID + "(send) sent");
        });
    }
}

module.exports.XmppClient = XmppClient
