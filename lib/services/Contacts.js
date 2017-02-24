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
        var that = this;

        winston.log("info", LOG_ID + "start - begin");
        this.xmpp = _xmpp;
        this.rest = _rest;

        this.eventEmitter.on('rainbow_onrosterpresence', function(presence) {
            var contact = that.contacts.find(function(contact) {
                return contact.jid_im = presence.jid;
            });

            if(contact) {
                //contact.show = presence.show;
                contact.priority = presence.priority;
                contact.showstamp = presence.delay;
                //contact.status = presence.status;

                if(presence.show === "" && (presence.status === "mode=auto" || presence.status === "" )) {
                    contact.presence = "online";
                    contact.status = "";
                }
                else if(presence.show === "online-mobile") {
                    contact.presence = "online";
                    contact.status = "mobile";
                }
                else if(presence.show === "unavailable") {
                    contact.presence = "offline";
                    contact.status = "";
                }
                else if((presence.show === "away" && presence.status === "") || (presence.show === "xa" && presence.status === "away")) {
                    contact.presence = "away";
                    contact.status = "";
                }
                else if(presence.show === "xa" && presence.status === "") {
                    contact.presence = "offline";
                    contact.status = "";
                }
                else if(presence.show === "dnd" && (presence.status === "" || presence.status === "audio" || presence.status === "video" || presence.status === "presentation")) {
                    contact.presence = "busy";
                    contact.status = presence.status;
                }

                that.eventEmitter.emit('rainbow.onrosterpresencechanged', contact);
            }
            else {
            }
        });

        winston.log("info", LOG_ID + "start - end");
    }

    
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

    /**
     * @public
     * @method getAll
     * @return {Object[]} the list of contacts
     * @description
     *  Return the list of contacts
     */
    getAll() {
        return this.contacts; 
    }

    stop() {

    }
}

module.exports = Contacts;