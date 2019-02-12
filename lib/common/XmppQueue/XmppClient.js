'use strict'
/*

const Client = require('./lib/Client')
const {xml, jid} = require('@xmpp/client-core')

module.exports.Client = Client
module.exports.xml = xml
module.exports.jid = jid

 */

//let client = require("@xmpp/client").client;
let client = require("./XmppClientWrapper").client;
let XmppQueue = require("./XmppQueue");

const _sasl = require('@xmpp/sasl');
const _middleware = require('@xmpp/middleware');
const _streamFeatures = require('@xmpp/stream-features');
const plain = require('@xmpp/sasl-plain');

let LOG_ID='XMPPCLIENT';

class XmppClient  {
    constructor(...args) {
        //super(...args);
        const {username, password} = args[0];
        let that = this;
        this.client = client(...args);

        let sasl = this.client.sasl;
        const mechanisms = Object.entries({plain}).map(
            ([k, v]) => ({[k]: v(sasl)})
        );

        this.client = Object.assign(this.client, {
            mechanisms
        });

       /* const middleware = _middleware({"entity" : this.client});
        const streamFeatures = _streamFeatures({middleware});
        const sasl = _sasl({streamFeatures}, {username, password});
        this.client.sasl = sasl;
        this.client.mechanisms =  Object.entries({plain}).map(
            ([k, v]) => ({[k]: v(that.client.sasl)})
        ); // */
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


                    return this.client.send(...args).then(()=> {
                        resolve2();
                    }).catch((err) => {
                        that.logger.log("debug", LOG_ID + "(send) _catch error_ at super.send", err);
                        that.logger.log("debug", LOG_ID + "(send) restart the xmpp client");
                        this.client.restart().finally(() => {
                            reject2(err);
                        });
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
            this.client.restart().finally(() => {
                that.logger.log("debug", LOG_ID + "(send) _exiting_ return promise with a throw error");
                throw  err;
            });
        });
    }

    /*handle(evt, cb) {
        this.client.entity.handle(evt,  cb);
    } // */

    on(evt, cb) {
        this.client.entity.on(evt,  cb);
    }

    get sasl(){
        return this.client.sasl;
    }

    setgetMechanism(cb) {
        //this.client.sasl.findMechanism = cb;
        //this.client.mechanisms = ["PLAIN"];
    }

    get reconnect(){
        return this.client.reconnect;
    }

    start(...args) {
        return this.client.start(...args);
    }

    stop(...args) {
        return this.client.stop(...args);
    }
}

function getXmppClient(...args) {
    let xmppClient = new XmppClient(...args);

    Object.assign(xmppClient, client());
}

module.exports.getXmppClient = getXmppClient;
module.exports.XmppClient = XmppClient;

