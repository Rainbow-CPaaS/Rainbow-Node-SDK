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
let utils = require("../Utils");

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
        this.options = [...args];
        this.restartConnectEnabled = true;
        this.client = client(...args);
    }

    init(_logger, _timeBetweenXmppRequests) {
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
                    /*
                    if (args && args[0]) {
                        that.logger.log("internal", LOG_ID + "(send) stanza to send ", that.logger.colors.gray(args[0].toString()));
                    } else {
                        that.logger.log("error", LOG_ID + "(send) stanza to send is empty");
                    } // */


                    return this.client.send(...args).then(() => {
                        resolve2();
                    }).catch(async(err) => {
                        that.logger.log("debug", LOG_ID + "(send) _catch error_ at super.send", err);
                        //that.logger.log("debug", LOG_ID + "(send) restart the xmpp client");
                        reject2(err);
                        /*
                        this.client.restart().finally(() => {
                            reject2(err);
                        });
                        // */
                    });
                })
            ).then(() => {
                that.logger.log("debug", LOG_ID + "(send) sent");
            }).catch((errr)=> {
                that.logger.log("error", LOG_ID + "(send) error in send promise");
                throw errr;
            });

            // Wait a few time between requests to avoid burst with lot of it.
            utils.setTimeoutPromised(that.timeBetweenXmppRequests).then(() => {
                //that.logger.log("debug", LOG_ID + "(send) setTimeout resolve");
                resolve(prom);
            });

            /*
            // Wait a few time between requests to avoid burst with lot of it.
            setTimeout(() => {
                //that.logger.log("debug", LOG_ID + "(send) setTimeout resolve");
                resolve(prom);
            }, that.timeBetweenXmppRequests);
            // */
        }).then((promiseToreturn) => {
            that.logger.log("debug", LOG_ID + "(send) _exiting_ return promise");
            return promiseToreturn;
        }).catch(async(err) => {
            that.logger.log("debug", LOG_ID + "(send) catch an error during sending! ", err);

            /*
            that.logger.log("debug", LOG_ID + "(send) restart the xmpp client");

            await that.restartConnect().then((res) => {
                that.logger.log("debug", LOG_ID + "(send) restartConnect result : ", res);
            }).catch((errr) => {
                that.logger.log("debug", LOG_ID + "(send) restartConnect catch : ", errr);
            });
            /*
            .then(() => {
                that.logger.log("debug", LOG_ID + "(send) _exiting_ return promise with a throw error : ", err);
                throw  err;
            });
            // */
            /*
            this.client.restart().finally(() => {
                that.logger.log("debug", LOG_ID + "(send) _exiting_ return promise with a throw error");
                throw  err;
            }); */
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

    /**
     * @description
     *  Do not use this method to reconnect. Use the @xmpp/reconnect pluging else (with the method XmppClient::reconnect).
     *
     * @returns {Promise<any>}
     */
    async restartConnect() {
        let that = this;
        that.logger.log("debug", LOG_ID + "(restartConnect) _entering_");
        if (this.restartConnectEnabled) {
            //let result = await that.client.disconnect(5000);
            //that.logger.log("debug", LOG_ID + "(restartConnect) disconnect result : ", result);
            //return that.client.open(that.options);
            await that.client._reset();
            await that.client.start();
        } else {
            return Promise.resolve("restartReconnect is disabled");
        }
    }

    start(...args) {
        this.restartConnectEnabled = true;
        return this.client.start(...args);
    }

    stop(...args) {
        this.restartConnectEnabled = false;
        return this.client.stop(...args);
    }
}

function getXmppClient(...args) {
    let xmppClient = new XmppClient(...args);

    Object.assign(xmppClient, client());
}

module.exports.getXmppClient = getXmppClient;
module.exports.XmppClient = XmppClient;

