'use strict';
export {};

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

const Element = require('ltx').Element;
//import Element from "ltx";

let LOG_ID='XMPPCLIENT';

class XmppClient  {
	public options: any;
	public restartConnectEnabled: any;
	public client: any;
	public iqGetEventWaiting: any;
	public onIqErrorReceived: any;
	public onIqResultReceived: any;
	public logger: any;
	public xmppQueue: any;
	public timeBetweenXmppRequests: any;
	public username: any;
	public password: any;

    constructor(...args) {
        //super(...args);
        const {username, password} = args[0];
        let that = this;
        this.options = [...args];
        this.restartConnectEnabled = true;
        this.client = client(...args);
        this.iqGetEventWaiting = {};

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
                that.logger.log("error", LOG_ID + "(send) error in send promise : ", errr);
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

    sendIq(...args){
        let that = this;
        that.logger.log("debug", LOG_ID + "(send) _entering_");
        return new Promise((resolve) => {
            if (args.length > 0) {
                let prom = this.xmppQueue.addPromise(this.client.send(...args).catch((err) => {
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

// *************************************
// Increase Element Behaviour
// *************************************

// Find elements of child by name
// If none is found then an empty Element is return (to allow call of methods like text...)
// If only one is found then return it, but with a length value to 1
// If severals are found then return an Array with them
Element.prototype.find = function (name) { // Warning do not put an Array function because the "this" will be lost
    let result = new Element();
    result.length = 0;

    if ( this instanceof Element && (this.getName ? this.getName () : this.name) == name) {
        result = this;
        result.length = 1;
        return result;
    }

    let children = this.getChildrenByFilter((element) => {
        let isInstanceOfElement = element instanceof Element;
        let elmtName = element.getName ? element.getName () : element.name;
        let isTheNameSearched = name === elmtName;
        return isInstanceOfElement && isTheNameSearched;
        }, true);
    if (children.length === 1) {
        result = children[0];
        result.length = 1;
    } else if (children.length > 1) {
        result = children;
    }
    return result;
};

// Shortcut to getText
Element.prototype.text = function () {
    return this.getText();
};

module.exports.getXmppClient = getXmppClient;
module.exports.XmppClient = XmppClient;

