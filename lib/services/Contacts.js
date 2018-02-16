"use strict";

var Error = require("../common/Error");

const LOG_ID = "CONTACTS - ";

/**
 * @class
 * @name Contacts
 * @description
 *       This module manages contacts. A contact is defined by a set of public information (name, firstname, avatar...) and a set of private information.<br>
 *       Using this module, you can get access to your network contacts or search for Rainbow contacts.
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Get the network contacts (roster) <br>
 *      - Get and search contacts by Id, JID or loginEmail <br>
 */
class Contacts {

    constructor(_eventEmitter, _logger) {
        this.xmpp = null;
        this.contacts = [];
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;
        this.rosterPresenceQueue = [];
    }

    start(_xmpp, _rest) {

        var that = this;

        this.logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.xmpp = _xmpp;
                that.rest = _rest;
                that.contacts = [];
                that.eventEmitter.on("rainbow_onrosterpresence", that._onRosterPresenceChanged.bind(that));
                that.eventEmitter.on("rainbow_userinvitereceived", that._onUserInviteReceived.bind(that));
                that.eventEmitter.on("rainbow_userinviteaccepted", that._onUserInviteAccepted.bind(that));
                that.eventEmitter.on("rainbow_userinvitecanceled", that._onUserInviteCanceled.bind(that));
                that.eventEmitter.on("rainbow_onrosters", that._onRostersUpdate.bind(that));
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();

            } catch (err) {
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                reject();
            }
        });
    }

    stop() {
        var that = this;

        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.xmpp = null;
                that.rest = null;
                that.contacts = [];
                that.eventEmitter.removeListener("rainbow_onrosterpresence", that._onRosterPresenceChanged);
                that.eventEmitter.removeListener("rainbow_userinvitereceived", that._onUserInviteReceived);
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve();

            } catch (err) {
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject();
            }
        });
    }

    /**
     * @public
     * @method getDisplayName
     * @instance
     * @param {Contact} contact  The contact to get display name
     * @return {String} The contact first name and last name
     * @memberof Contacts
     * @description
     *      Get the display name of a contact
     */
    getDisplayName(contact) {
        return contact.firstName + " " + contact.lastName;
    }

    /**
     * @private
     * @method getRosters
     * @instance
     * @return {Error.OK} An object representing the result (OK or Error)
     * @memberof Contacts
     * @description
     *      Get the list of contacts that are in the user's network (aka rosters)
     */
    getRosters() {

        var that = this;
        this.logger.log("debug", LOG_ID + "(getRosters) _entering_");

        return new Promise((resolve, reject) => {
            that.rest.getContacts().then((listOfContacts) => {

                // Add default presence to offline - presence of rosters is known
                listOfContacts.map((contact) => {
                    contact.resources = {};
                    contact.presence = "offline";
                    contact.status = "";
                });

                that.contacts = listOfContacts;
                that.logger.log("info", LOG_ID + "(getRosters) get rosters successfully");
                that.logger.log("debug", LOG_ID + "(getRosters) _exiting_");
                resolve();
            }).catch((err) => {
                that.logger.log("error", LOG_ID + "(getRosters) error", err);
                that.logger.log("debug", LOG_ID + "(getRosters) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method getAll
     * @instance
     * @return {Object[]} the list of contacts
     * @memberof Contacts
     * @description
     *  Return the list of contacts that are in the network of the connected users (aka rosters)
     */
    getAll() {
        return this.contacts; 
    }

    /**
     * @public
     * @method getContactByJid
     * @instance
     * @param {string} jid The contact jid
     * @return {Contact} A promise containing the contact found or null
     * @memberof Contacts
     * @description
     *  Get a contact by his JID by searching in the connected user contacts list (full information) and if not found by searching on the server too (limited set of information)
     */
    getContactByJid(jid) {

        var that = this;

        return new Promise((resolve, reject) => {
            if (!jid) {
                that.logger.log("warn", LOG_ID + "(getContactByJid) bad or empty 'jid' parameter", jid);
                reject(Error.BAD_REQUEST);
            }
            else {
                let contactFound = null;

                if (that.contacts) {
                    contactFound = that.contacts.find((contact) => {
                        return contact.jid_im === jid;
                    });
                }

                if (contactFound) {
                    that.logger.log("info", LOG_ID + "(getContactByJid) contact found locally", contactFound);
                    resolve(contactFound);
                }
                else {
                    that.logger.log("debug", LOG_ID + "(getContactByJid) contact not found locally. Ask the server...");
                    that.rest.getContactInformationByJID(jid).then((contact) => {
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
     * @instance
     * @param {string} id The contact id
     * @return {Contact} A promise containing the contact found or null if not found
     * @memberof Contacts
     * @description
     *  Get a contact by his id
     */
    getContactById(id) {

        var that = this;

        return new Promise((resolve, reject) => {
             if (!id) {
                that.logger.log("warn", LOG_ID + "(getContactById) bad or empty 'id' parameter", id);
                reject(Error.BAD_REQUEST);
            } else {

                let contactFound = null;

                if (that.contacts) {
                    contactFound = that.contacts.find((contact) => {
                        return contact.id === id;
                    });
                }

                if (contactFound) {
                    that.logger.log("info", LOG_ID + "(getContactById) contact found locally", contactFound);
                    resolve(contactFound);
                }
                else {
                    that.logger.log("debug", LOG_ID + "(getContactById) contact not found locally. Ask the server...");
                    that.rest.getContactInformationByID(id).then((contact) => {
                        if (contact) {
                            that.logger.log("info", LOG_ID + "(getContactById) contact found on server");    
                        }
                        else {
                            that.logger.log("info", LOG_ID + "(getContactById) no contact found on server with id", id);    
                        }
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
     * @method getContactByLoginEmail
     * @instance
     * @param {string} loginEmail The contact loginEmail 
     * @return {Contact} A promise containing the contact found or null if not found
     * @memberof Contacts
     * @description
     *  Get a contact by his loginEmail
     */
    getContactByLoginEmail(loginEmail) {

        let that = this;

        return new Promise((resolve, reject) => {
            if (!loginEmail) {
                this.logger.log("warn", LOG_ID + "(getContactByLoginEmail) bad or empty 'loginEmail' parameter", loginEmail);
                reject(Error.BAD_REQUEST);
            }
            else {

                let contactFound = null;

                if (that.contacts) {
                    contactFound = that.contacts.find((contact) => {
                        return contact.loginEmail === loginEmail;
                    });
                }

                if (contactFound) {
                    that.logger.log("info", LOG_ID + "(getContactByLoginEmail) contact found locally", contactFound);
                    resolve(contactFound);
                }
                else {
                    that.logger.log("debug", LOG_ID + "(getContactByLoginEmail) contact not found locally. Ask server...");
                    that.rest.getContactInformationByLoginEmail(loginEmail).then((contact) => {
                        if (contact && contact.length > 0) {
                            that.logger.log("info", LOG_ID + "(getContactByLoginEmail) contact found on server");
                            resolve(contact[0]);
                        }
                        else {
                            that.logger.log("info", LOG_ID + "(getContactByLoginEmail) contact not found on server with loginEmail", loginEmail);
                            resolve(null);
                        }
                    }).catch((err) => {
                        reject(err);
                    });
                }
            }
        });
    }

    /**
     * @private
     * @method _onRosterPresenceChanged
     * @instance
     * @param {Object} presence contains informations about contact changes
     * @memberof Contacts
     * @description
     *      Method called when the presence of a contact changed
     */
    _onRosterPresenceChanged(presence) {

        var contact = this.contacts.find((contactItem) => {
            return contactItem.jid_im === presence.jid;
        });

        if (contact) {

            if (!contact.resources) {
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
            for (var resourceId in contact.resources) {

                var resource = contact.resources[resourceId];

                if ( resource !== "phone") {
                    if (resource.show === "xa" && resource.status === "") {
                        manual_invisible = true;
                    }
                    else if (resource.show === "dnd" && resource.status === "") {
                        manual_dnd = true;
                    }
                    else if (resource.show === "xa" && resource.status === "away") {
                        manual_away = true;
                    } 
                    else if (resource.show === "dnd" && resource.status === "presentation") {
                        in_presentation_mode = true;
                    } 
                    else if (resource.show === "dnd" && resource.status.length > 0) {
                        in_webrtc_mode = true;
                        webrtc_reason = resource.status;
                    }
                    else if ((resource.show === "" || resource.show === "online") && (resource.status === "" || resource.status === "mode=auto")) {
                        if (resource.type === "mobile") {
                            is_online_mobile = true;
                        }
                        else {
                            is_online = true;
                        }
                    }
                    else if (resource.show === "away" && resource.status === "") {
                        auto_away = true;
                    }
                    else if (resource.show === "unavailable") {
                        is_offline = true;
                    }
                }
                else {
                    if (resource.status === "EVT_SERVICE_INITIATED" && resource.show === "chat") {
                        on_the_phone = true;
                    }
                }
            }

            if (on_the_phone) {
                contact.presence = "busy";
                contact.status = "phone";
            } else if (manual_invisible) {
                contact.presence = "offline";
                contact.status = "";
            } else if (manual_dnd) {
                contact.presence = "busy";
                contact.status = "";
            } else if (manual_away) {
                contact.presence = "away";
                contact.status = "";
            } else if (in_presentation_mode) {
                contact.presence = "busy";
                contact.status = "presentation";
            } else if (in_webrtc_mode) {
                contact.presence = "busy";
                contact.status = webrtc_reason;
            } else if (is_online) {
                contact.presence = "online";
                contact.status = "";
            } else if (is_online_mobile) {
                contact.presence = "online";
                contact.status = "mobile";
            } else if (auto_away) {
                contact.presence = "away";
                contact.status = "";
            } else if (is_offline) {
                contact.presence = "offline";
                contact.status = "";
            } else {
                contact.presence = "unknown";
                contact.status = "";
            }

            if ( contact.resources[presence.resource].show === "unavailable" ) {
                delete contact.resources[presence.resource];
            }
            
            let presenceDisplayed = contact.status.length > 0 ? contact.presence + "|" + contact.status : contact.presence;
            
            this.logger.log("info", LOG_ID + "(onRosterPresenceChanged) presence changed to " + presenceDisplayed + " for " + this.getDisplayName(contact));
            this.eventEmitter.emit("rainbow_onrosterpresencechanged", contact);
        }
        else {
            this.logger.log("warn", LOG_ID + "(onRosterPresenceChanged) no contact found for " + presence.jid);
            // Seems to be a pending presence update in roster associated contact not yet available
            if( presence.value.show !== "unavailable" ) {
                // To a pending presence queue
                this.rosterPresenceQueue.push( { presence, date: Date.now() } );
            }
        }
    }

    /**
     * @private
     * @method _onUserInviteReceived
     * @instance
     * @param {Object} data contains the invitationId
     * @memberof Contacts
     * @description
     *      Method called when an user invite is received
     */
    _onUserInviteReceived(data) {
        let that = this;

        that.logger.log("debug", LOG_ID + "(_onUserInviteReceived) enter");

        that.rest.getInvitationById(data.invitationId).then(invitation => {
            that.logger.log("debug", LOG_ID + "(_onUserInviteReceived) invitation received id", invitation.id);

            that.eventEmitter.emit("rainbow_onuserinvitereceived", invitation);
        }, err => {
            that.logger.log("warn", LOG_ID + "(_onUserInviteReceived) no invitation found for " + data.invitationId);
        });
    }

    /**
     * @private
     * @method _onUserInviteAccepted
     * @instance
     * @param {Object} data contains the invitationId
     * @memberof Contacts
     * @description
     *      Method called when an user invite is accepted
     */
    _onUserInviteAccepted(data) {
        let that = this;

        that.logger.log("debug", LOG_ID + "(_onUserInviteAccepted) enter");

        that.rest.getInvitationById(data.invitationId).then(invitation => {
            that.logger.log("debug", LOG_ID + "(_onUserInviteAccepted) invitation accepted id", invitation.id);

            that.eventEmitter.emit("rainbow_onuserinviteaccepted", invitation);
        }, err => {
            that.logger.log("warn", LOG_ID + "(_onUserInviteAccepted) no invitation found for " + data.invitationId);
        });
    }

    /**
     * @private
     * @method _onUserInviteCanceled
     * @instance
     * @param {Object} data contains the invitationId
     * @memberof Contacts
     * @description
     *      Method called when an user invite is canceled
     */
    _onUserInviteCanceled(data) {
        let that = this;

        that
            .logger
            .log("debug", LOG_ID + "(_onUserInviteCanceled) enter");

        that
            .rest
            .getInvitationById(data.invitationId)
            .then(invitation => {
                that.logger.log("debug", LOG_ID + "(_onUserInviteCanceled) invitation canceled id", invitation.id);

                that.eventEmitter.emit("rainbow_onuserinvitecanceled", invitation);
            }, err => {
                that.logger.log("warn", LOG_ID + "(_onUserInviteCanceled) no invitation found for " + data.invitationId);
            });
}

    /**
     * @private
     * @method _onRostersUpdate
     * @instance
     * @param {Object} contacts contains a contact list with updated elements
     * @memberof Contacts
     * @description
     *      Method called when the roster contacts is updated
     */
    _onRostersUpdate( contacts) {
        let that = this;
        that.logger.log("debug", LOG_ID + "(_onRostersUpdate) enter");

        contacts.forEach( contact => {
            if ( contact.jid.substr(0, 3) !== "tel") { // Ignore telephonny events
                if ( contact.subscription === "remove") {
                    that.contacts = that.contacts.filter( _contact => _contact.jid_im !== contact.jid);
                    return;
                }

                if ( contact.subscription === "both") {
                    if (!that.contacts.find(item => {
                        return item.jid_im === contact.jid;
                    })) {
                        that
                            .getContactByJid(contact.jid)
                            .then((_contact) => {
                                that
                                    .contacts
                                    .push(Object.assign(_contact, {
                                        resources: {},
                                        presence: "offline",
                                        status: ""
                                    }));
                                that.rosterPresenceQueue.filter( presenceItem => presenceItem.presence.jid === contact.jid ).forEach( item =>
                                    that._onRosterPresenceChanged( item.presence )
                                );
                                let currentDate = Date.now();
                                that.rosterPresenceQueue = that.rosterPresenceQueue.filter( presenceItem => presenceItem.presence.jid !== contact.jid || (presenceItem.date + 10000) < currentDate);
                            });
                    }
                }
            }
        });
    }
}

module.exports = Contacts;