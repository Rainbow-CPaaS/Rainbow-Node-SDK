"use strict";

var Error = require('../common/Error');

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

                if(!contact.resources) {
                    contact.resources = {};
                }

                // Store the presence of the resource
                contact.resources[presence.resource] = presence.value; 

                var on_the_phone = false;
                var manual_invisible = false;
                var manual_dnd = false;
                var manual_away = false;
                var in_presentation_mode = false;
                var in_webrtc_mode = false;
                var webrtc_reason = "";
                var is_online = false;
                var is_online_mobile = false;
                var auto_away = false;
                var is_offline = false;
                for(var resourceId in contact.resources) {

                    var resource = contact.resources[resourceId];

                    if( resource !== "phone") {
                        if(resource.show === "xa" && resource.status === "") {
                            manual_invisible = true;
                        }
                        else if (resource.show === "dnd" && resource.status === "") {
                            manual_dnd = true;
                        }
                        else if(resource.show === "xa" && resource.status === "away") {
                            manual_away = true;
                        } 
                        else if (resource.show === "dnd" && resource.status === "presentation") {
                            in_presentation_mode = true;
                        } 
                        else if (resource.show === "dnd" && resource.status.length > 0) {
                            in_webrtc_mode = true;
                            webrtc_reason = resource.status;
                        }
                        else if((resource.show === "" || resource.show === "online") && (resource.status === "" || resource.status === "mode=auto")) {
                            if(resource.type === "mobile") {
                                is_online_mobile = true;
                            }
                            else {
                                is_online = true;
                            }
                        }
                        else if(resource.show === "away" && resource.status === "") {
                            auto_away = true;
                        }
                        else if(resource.show === "unavailable") {
                            is_offline = true;
                        }
                    }
                    else {
                        if(resource.status === "EVT_SERVICE_INITIATED" && resource.show === "chat") {
                            on_the_phone = true;
                        }
                    }
                }

                if(on_the_phone) {
                    contact.presence = "busy";
                    contact.status = "phone";
                } else if(manual_invisible) {
                    contact.presence = "offline";
                    contact.status = "";
                } else if(manual_dnd) {
                    contact.presence = "busy";
                    contact.status = "";
                } else if(manual_away) {
                    contact.presence = "away";
                    contact.status = "";
                } else if(in_presentation_mode) {
                    contact.presence = "busy";
                    contact.status = "presentation";
                } else if(in_webrtc_mode) {
                    contact.presence = "busy";
                    contact.status = webrtc_reason;
                } else if(is_online) {
                    contact.presence = "online";
                    contact.status = "";
                } else if(is_online_mobile) {
                    contact.presence = "online";
                    contact.status = "mobile";
                } else if(auto_away) {
                    contact.presence = "away";
                    contact.status = "";
                } else if(is_offline) {
                    contact.presence = "offline";
                    contact.status = "";
                } else {
                    contact.presence = "unknown";
                    contact.status = "";
                }
                
                //contact.showstamp = presence.value.delay;

                var presenceDisplayed = contact.status.length > 0 ? contact.presence + "|" + contact.status : contact.presence;
                
                that.logger.log("info", LOG_ID + "(onRosterPresenceChanged) presence changed to " + presenceDisplayed + " for " + contact.displayName);
                that.eventEmitter.emit('rainbow_onrosterpresencechanged', contact);
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
                    that.logger.log("info", LOG_ID + "(getRosters) get rosters successfully");
                    that.logger.log("debug", LOG_ID + "(getRosters) _exiting_");
                    resolve();
                }).catch(function(err) {
                    that.logger.log("error", LOG_ID + "(getRosters) error", err);
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

    /**
     * @public
     * @method getContactByJid
     * @param {string} strJid The contact jid
     * @return {Contact} A promise containing the contact found or null
     * @description
     *  Get a contact by his JID by searching in the connected user contacts list (full information) and if not found by searching on the server too (limited set of information)
     */
    getContactByJid(strJid) {

        var that = this;

        return new Promise(function(resolve, reject) {
            if (!strJid) {
                that.logger.log("warn", LOG_ID + "(getContactByJid) bad or empty 'strJid' parameter", strJid);
                reject(Error.BAD_REQUEST);
            }
            else {
                var contactFound = that.contacts.find(function(contact) {
                    return contact.jid_im === strJid;
                });

                if(contactFound) {
                    that.logger.log("info", LOG_ID + "(getContactByJid) contact found locally", contactFound);
                    resolve(contactFound);
                }
                else {
                    that.logger.log("debug", LOG_ID + "(getContactByJid) contact not found locally. Ask the server...");
                    that.rest.getContactInformationByJID(strJid).then((contact) => {
                        that.logger.log("info", LOG_ID + "(getContactByJid) contact found on the server", contact);
                        resolve(contact);
                    }).catch((err) => {
                        reject(err);
                    });
                }
            }
        });
    }

    /**
     * @public
     * @method getContactById
     * @param {string} strId The contact id
     * @return {Contact} A promise containing the contact found or null
     * @description
     *  Get a contact by his id
     */
    getContactById(strId) {

        return new Promise(function(resolve, reject) {
             if (!strId) {
                that.logger.log("warn", LOG_ID + "(getContactById) bad or empty 'strId' parameter", strId);
                reject(Error.BAD_REQUEST);
            } else {
                var contactFound = that.contacts.find(function(contact) {
                    return contact.id === strId;
                });

                resolve(contactFound);
            }
        });
    }

    /**
     * @public
     * @method getContactByLoginEmail
     * @param {string} strLoginEmail The contact loginEmail 
     * @return {Contact} A promise containing the contact found or null
     * @description
     *  Get a contact by his loginEmail
     */
    getContactByLoginEmail(strLoginEmail) {

        return new Promise(function(resolve, reject) {
            if (!strLoginEmail) {
                this.logger.log("warn", LOG_ID + "(getContactByLoginEmail) bad or empty 'strId' parameter", strLoginEmail);
                reject(Error.BAD_REQUEST);
            }
            else {
                var contactFound = this.contacts.find(function(contact) {
                    return contact.loginEmail === strLoginEmail;
                });

                resolve(contactFound);
            }
        });
    }

    stop() {
    }
}

module.exports = Contacts;