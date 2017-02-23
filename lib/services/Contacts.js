"use strict";

var winston = require("winston");

const LOG_ID = '[Contacts] ';

class Contacts {

    constructor(_eventEmitter) {
        this.contacts = [];
        this.xmpp = null;
        this.eventEmitter = _eventEmitter;
    }

    start(_xmpp, _rest) {
        winston.log("info", LOG_ID + "start - begin");
        this.xmpp = _xmpp;
        this.rest = _rest;
        winston.log("info", LOG_ID + "start - end");
    }

    /**
     * @public
     * @method sendInitialPresence
     * @description
     *  Send the initial presence (online)
     */
    getRosters() {

        var that = this;
        winston.log("info", LOG_ID + "getRosters - begin");
        return new Promise(function(resolve, reject) {
            
            that.eventEmitter.once('rainbow_onrosters', function(jids) {
                that.rest.getContacts(jids).then(function(listOfContacts) {
                    that.contacts = listOfContacts.users;
                    winston.log("info", LOG_ID + "getRosters - successfully");
                    winston.log("info", LOG_ID + "getRosters - end");
                    resolve();
                }).catch(function(err) {
                    winston.log("info", LOG_ID + "getRosters - error", err);
                    winston.log("info", LOG_ID + "getRosters - end");
                    reject(err);
                });
            });
        
            that.xmpp.getRosters();
        });
    }

    stop() {

    }
}

module.exports = Contacts;