"use strict";

const LOG_ID = 'USERS - ';

var onRosterPresenceChanged;

class Contacts {

    constructor(_eventEmitter, _logger) {
        var that = this;

        this.contacts = [];
        this.xmpp = null;
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;

        onRosterPresenceChanged = (presence) => {
            var contact = that.contacts.find(function(contact) {
                return contact.jid_im == presence.jid;
            });

            if(contact) {
                
                switch(presence.type) {
                    case "mobile": 
                        contact.mobilePresence = presence.value;
                        break;
                    case "node":
                        contact.nodePresence = presence.value;
                        break;
                    case "desktopOrWeb":
                        contact.desktopPresence = presence.value;
                        break;
                    case "phone":
                        contact.pbxPresence = presence.value;
                }
                
                //contact.show = presence.show;
                contact.priority = presence.value.priority;
                contact.showstamp = presence.value.delay;
                //contact.status = presence.status;

                // user device
                var isMobile = false;
                var isWeb = false;
                var isDesktop = false;
                var isNode = false;
                if(presence.resource.indexOf('mobile') === 0) {
                    isMobile = true;
                }
                else if(presence.resource.indexOf('desk') === 0) {
                    isDesktop = true;
                }
                else if(presence.resource.indexOf('web') === 0) {
                    isWeb = true;
                }
                else if(presence.resource.indexOf('node') === 0) {
                    isNode = true;
                }

                if(presence.value.show === "chat" && presence.value.status === "EVT_SERVICE_INITIATED") {
                    contact.presence = "busy";
                    contact.status = "phone";
                }
                else if((presence.value.show === "" || presence.value.show === "online") && (presence.value.status === "mode=auto" || presence.value.status === "" )) {
                    contact.presence = "online";
                    if(isMobile) {
                        contact.status = "mobile";
                    } else {
                        contact.status = "";
                    }
                }
                else if(presence.value.show === "online-mobile") {
                    contact.presence = "online";
                    contact.status = "mobile";
                }
                else if(presence.value.show === "unavailable") {
                    contact.presence = "offline";
                    contact.status = "";
                }
                else if((presence.value.show === "away" && presence.value.status === "") || (presence.value.show === "xa" && presence.value.status === "away")) {
                    contact.presence = "away";
                    contact.status = "";
                }
                else if(presence.value.show === "xa" && presence.value.status === "") {
                    contact.presence = "offline";
                    contact.status = "";
                }
                else if(presence.value.show === "dnd" && (presence.value.status === "" || presence.value.status === "audio" || presence.value.status === "video" || presence.value.status === "presentation")) {
                    contact.presence = "busy";
                    contact.status = presence.value.status;
                }
                else {
                    contact.presence = "";
                    contact.status = ""
                    that.logger.log("info", LOG_ID + "(onRosterPresenceChanged) presence not managed", presence.value.show, presence.value.status);    
                }

                var status = contact.status.length > 0 ? contact.status : "-";
                that.logger.log("info", LOG_ID + "(onRosterPresenceChanged) presence changed to " + contact.presence + "|" + status + " for " + contact.displayName);
                that.eventEmitter.emit('rainbow.onrosterpresencechanged', contact);
            }
            else {
                that.logger.log("warn", LOG_ID + "(onRosterPresenceChanged) no contact found for " + presence.jid);
            }
        }
    }

    start(_xmpp, _rest) {
        this.logger.log("debug", LOG_ID + "(start) _entering_");
        this.xmpp = _xmpp;
        this.rest = _rest;
        this.eventEmitter.on('rainbow_onrosterpresence', onRosterPresenceChanged);
        this.logger.log("debug", LOG_ID + "(start) _exiting_");
    }

    
    getRosters() {

        var that = this;
        this.logger.log("debug", LOG_ID + "(getRosters) _entering_");
        return new Promise(function(resolve, reject) {
            
            that.eventEmitter.once('rainbow_onrosters', function(jids) {
                that.rest.getContacts(jids).then(function(listOfContacts) {

                    that.contacts = listOfContacts.users;
                    that.logger.log("debug", LOG_ID + "(getRosters) successfully");
                    that.logger.log("debug", LOG_ID + "(getRosters) _exiting_");
                    resolve();
                }).catch(function(err) {
                    that.logger.log("warn", LOG_ID + "(getRosters) error", err);
                    that.logger.log("debug", LOG_ID + "(getRosters) _exiting_");
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