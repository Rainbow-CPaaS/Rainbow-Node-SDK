"use strict";

var Error = require("../common/Error");
const Contact = require("../common/models/Contact");

const util = require('util');
const md5 = require('md5');
const path = require('path');

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

    constructor(_eventEmitter, _http, _logger) {
        this.avatarDomain = _http.host.split(".").length === 2 ? _http.protocol + "://cdn." + _http.host + ":" + _http.port : _http.protocol + "://" + _http.host + ":" + _http.port;
        this.xmpp = null;
        this.contacts = [];
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;
        this.rosterPresenceQueue = [];
    }

    start(_xmpp, _rest) {

        var that = this;

        that.logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.xmpp = _xmpp;
                that.rest = _rest;
                that.contacts = [];

                // Create the user contact
                that.logger.log("debug", LOG_ID + "(start) Create userContact (" + that.xmpp.jid + ")");
                that.userContact = new Contact.Contact();
                that.userContact.ask = null;
                that.userContact.subscription = null;

                // Attach xmpp information (check)
                that.userContact._id = that.xmpp.jid;
                that.userContact.jid = that.xmpp.jid;
                that.userContact.jidtel = "tel_" + that.xmpp.jid;
                that.userContact.fullJid = that.xmpp.fullJid;

                /*
                // Update contact with user data auth information
                that.userContact.language = that.currentLanguage;
                that.userContact.updateFromUserData(authService.userData);
                that.userContact.getAvatar();
                that.userContact.updateRichStatus();
                // */

                that.eventEmitter.on("rainbow_onrosterpresence", that._onRosterPresenceChanged.bind(that));
                that.eventEmitter.on("rainbow_onrostercontactinformationchanged", that._onContactInfoChanged.bind(that));
                that.eventEmitter.on("rainbow_userinvitereceived", that._onUserInviteReceived.bind(that));
                that.eventEmitter.on("rainbow_userinviteaccepted", that._onUserInviteAccepted.bind(that));
                that.eventEmitter.on("rainbow_userinvitecanceled", that._onUserInviteCanceled.bind(that));
                that.eventEmitter.on("rainbow_onrosters", that._onRostersUpdate.bind(that));
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();

            } catch (err) {
                that.logger.log("error", LOG_ID + "(start) Catch Error !!!", err.message);
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
                that.eventEmitter.removeListener("rainbow_onrostercontactinformationchanged", that._onContactInfoChanged);
                that.eventEmitter.removeListener("rainbow_userinvitereceived", that._onUserInviteReceived);
                that.eventEmitter.removeListener("rainbow_userinviteaccepted", that._onUserInviteAccepted);
                that.eventEmitter.removeListener("rainbow_userinvitecanceled", that._onUserInviteCanceled);
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve();

            } catch (err) {
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject();
            }
        });
    }

    init () {
        let that = this;
        let userInfo = that.getContactById(that.rest.account.id).then((contact) => {
            that.userContact.updateFromUserData(contact);
        });
        return Promise.all([userInfo]);
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
     * @public
     * @method getRosters
     * @instance
     * @memberof Contacts
     * @description
     *      Get the list of contacts that are in the user's network (aka rosters)
     * @async
     * @return {Promise<Error>}
     * @fulfil {Error} - Error object depending on the result (Error.OK in case of success)
     * @category async
     */
    getRosters() {

        var that = this;
        this.logger.log("debug", LOG_ID + "(getRosters) _entering_");

        return new Promise((resolve, reject) => {
            that.rest.getContacts().then((listOfContacts) => {

                listOfContacts.forEach( (contactData) => {
                    // Create the contact object
                    let contact = new Contact.Contact();
                    Object.assign(contact, contactData);
                    contact.updateFromUserData(contactData);
                    contact.roster = true;
                    contact.presence = "offline";
                    contact.status = "";
                    contact.avatar = that.getAvatarByContactId(contact.id, contact.lastAvatarUpdateDate);
                    // Append in contact list
                    // that.contacts[contact.id] = contact;
                    that.contacts.push(contact);
                });

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
     * @return {Contact[]} the list of contacts
     * @memberof Contacts
     * @description
     *  Return the list of contacts that are in the network of the connected users (aka rosters)
     */
    getAll() {
        return this.contacts; 
    }

    createEmptyContactContact(jid) {
        let that = this;
        var contact = that.createBasicContact(jid);
        contact.initials = "?";
        contact.displayName = "Unknown contact";
        contact.lastname = "Unknown contact";
        contact.firstname = "";
        contact.temp = true;
        contact.avatar = new Image();
        contact.avatar.src = "/resources/skins/rainbow/images/conversations/unknownContact.png";
        return contact;
    }

    getContact(jid, phoneNumber) {
        let that = this;
        let contact = null;
        let contactId = jid ? jid : phoneNumber;
        if (that.isUserContactJid(contactId)) { contact = that.rest.account; }
        else { contact = that.contacts.find( (_contact) => _contact.jid_im === contactId); }
        return contact;
    }

    getOrCreateContact(jid, phoneNumber) {
        let that = this;

        // Reject stupid request
        if (!jid && !phoneNumber) {
            let error = Error.BAD_REQUEST;
            error.msg += " No jid or no phoneNumber";
            return Promise.reject(error);
        }

        // Initialize contactsArray if necessary
        if (!this.contacts) { this.contacts = []; }

        // Try to find an existing contact
        let contact = this.getContact(jid, phoneNumber);

        // If contact found, return resolved promise with contact
        if (contact) {
            return Promise.resolve(contact);
        }

        // Else create the contact
        contact = that.createBasicContact(jid, phoneNumber);

        // Handle case where we have no jid
        if (!jid) {
            return Promise.resolve(contact);
        }

        // Fill contact with vCard informations
        return that.rest.getContactInformationByJID(jid).then( (_contact) => {
            _contact.avatar = that.getAvatarByContactId(_contact.id, _contact.lastAvatarUpdateDate);
            let contactIndex = that.contacts.findIndex((value) => {
                return value.jid_im === jid;
            });
            if ( contactIndex !== -1 ) {
                that.contacts[contactIndex] = Object.assign( that.contacts[contactIndex], _contact);
                return Promise.resolve(that.contacts[contactIndex]);
            }

            that.contacts.push(_contact);
            return Promise.resolve(_contact);
        });
    }

    createBasicContact(jid, phoneNumber) {
        let that = this;
        that.logger.log("debug", LOG_ID + "[contactService] CreateContact " + jid + " " /* TODO + anonymizePhoneNumber(phoneNumber) */);

        // Create the contact object
        let contact = new Contact.Contact();

        // Handle case where we have no jid
        if (!jid) {
            contact._id = phoneNumber;
            contact.initials = "?";
            contact.displayName = phoneNumber ? phoneNumber : "Unknown contact";
            contact.lastname = phoneNumber ? phoneNumber : "Unknown contact";
            contact.firstname = "";
            contact.phoneProCan = phoneNumber ? phoneNumber : "";
            contact.temp = true;
            contact.loginEmail = "noEmail";
            contact.avatar = {}; // new Image();
            contact.avatar.src = "/resources/skins/rainbow/images/conversations/unknownContact.png";
            contact.setNameUpdatePrio(Contact.NameUpdatePrio.NO_UPDATE_PRIO);//not yet updated
            return contact;
        }

        // Compute the contact id
        let contactId = jid;
        if (!contactId) {
            contactId = phoneNumber;
            contact.phoneProCan = phoneNumber;
        }
        if (!contactId) { contactId = "anonymous"; }

        // Configure contact
        contact.jid = jid;
        contact.jidtel = "tel_" + jid;
        contact._id = contactId;
        contact.ask = "none";
        contact.subscription = "none";
        // TODO ? contact.updateRichStatus();

        // Append in contact list
       // that.contacts[contact.id] = contact;
        that.contacts.push(contact);

        return contact;
    }

    /**
     * @public
     * @method getContactByJid
     * @instance
     * @param {string} jid The contact jid
     * @memberof Contacts
     * @description
     *  Get a contact by his JID by searching in the connected user contacts list (full information) and if not found by searching on the server too (limited set of information)
     * @async
     * @return {Promise<Contact, Error>}
     * @fulfil {Contact} - Found contact or null or an error object depending on the result
     * @category async
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
                    that.logger.log("info", LOG_ID + "(getContactByJid) contact found locally with jid ", jid );
                    resolve(contactFound);
                }
                else {
                    that.logger.log("debug", LOG_ID + "(getContactByJid) contact not found locally. Ask the server...");
                    that.rest.getContactInformationByJID(jid).then((contact) => {
                        if( contact ) {
                            that.logger.log("info", LOG_ID + "(getContactByJid) contact found on the server", contact);
                            contact.avatar = that.getAvatarByContactId(contact.id, contact.lastAvatarUpdateDate);
                        } else {
                            that.logger.log("info", LOG_ID + "(getContactByJid) no contact found on the server with Jid", jid);
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
     * @method getContactById
     * @instance
     * @param {string} id The contact id
     * @memberof Contacts
     * @description
     *  Get a contact by his id
     * @async
     * @return {Promise<Contact, Error>}
     * @fulfil {Contact} - Found contact or null or an error object depending on the result
     * @category async
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
     * @memberof Contacts
     * @description
     *  Get a contact by his loginEmail
     * @async
     * @return {Promise<Contact, Error>}
     * @fulfil {Contact} - Found contact or null or an error object depending on the result
     * @category async
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
     * @public
     * @method getAvatarByContactId
     * @instance
     * @param {string} id The contact id
     * @param {string} lastAvatarUpdateDate use this field to give the stored date ( could be retrieved with contact.lastAvatarUpdateDate )
     *      if missing or null in case where no avatar available a local module file is provided instead of URL
     * @memberof Contacts
     * @description
     *  Get a contact avatar by his contact id
     * @return {String} Contact avatar URL or file
     */
    getAvatarByContactId(id, lastUpdate) {
        if ( lastUpdate ) {
            return this.avatarDomain + "/api/avatar/" + id + "?update=" + md5(lastUpdate);
        }
        return path.resolve( __dirname,  "../resources/unknownContact.png");
    }

    // ************************************************** //
    // **  jid utilities                               ** //
    // ************************************************** //
    isTelJid(jid) {
        return (jid.indexOf("tel_") === 0);
    }

    getImJid(jid) {
        let that = this;
        let bareJid = that._xmpp.getBareJidFromJid(jid);
        return this.isTelJid(bareJid) ? bareJid.substring(4) : bareJid;
    }

    getRessourceFromJid(jid) {
        let result = "";
        if (jid) {
            let index = jid.indexOf("/");
            if (index !== -1) {
                result = jid.substr(index + 1);
            }
        }
        return result;
    }

    isUserContactJid(jid) {
        let that = this;
        if (!that.rest.account) { return false; }
        return (that.rest.account.jid_im === jid);
    }

    isUserContact(contact) {
        let that = this;
        if (!contact || !contact.jid) { return false; }
        if (!that.rest.account) { return (contact.jid === that._xmpp.jid); }
        return (that.rest.account.jid === contact.jid);
    }

    /**
     * @public
     * @since 1.17
     * @method addToContactsList
     * @instance
     * @memberof Contacts
     * @description
     *    Add a contact to the list of contacts and send a subscription for listening the presence of this contact
     * @param {Contact} contact The contact object to subscribe
     * @async
     * @return {Promise<Contact, Error>}
     * @fulfil {Contact} - Added contact or an error object depending on the result
     * @category async
     */
    addToContactsList(contact) {
        let that = this;

        return new Promise((resolve, reject) => {
            if (!contact) {
                this.logger.log("warn", LOG_ID + "(addToContactsList) bad or empty 'contact' parameter", contact);
                reject(Error.BAD_REQUEST);
            }
            else {

                    that.logger.log("debug", LOG_ID + "(addToContactsList) contact invitaion to server...");
                    that.rest.joinContactInvitation(contact).then((_contact) => {
                        if (_contact && _contact.status !== undefined) {
                            that.logger.log("info", LOG_ID + "(addToContactsList) contact invited : ", _contact.invitedUserId);
                            that.getContactById(_contact.invitedUserId).then((invitedUser) => {
                                resolve(invitedUser);
                            }).catch((err) => {
                                reject(err);
                            });
                        } else {
                            that.logger.log("info", LOG_ID + "(addToContactsList) contact cannot be added: ", util.inspect(contact));
                            resolve(null);
                        }
                    }).catch((err) => {
                        reject(err);
                    });
            }
        });
    }

    /**
     * @typedef {Object} joinContactsResult
     * @property {String[]} success List of succeed joined users
     * @property {String[]} failed List of failed to joined users
     */
  
    /**
     * @public
     * @since 1.41
     * @beta
     * @method joinContacts
     * @instance
     * @memberof Contacts
     * @description
     *    As admin, add contacts to a user roster
     * @param {Contact} contact The contact object to subscribe
     * @param {String[]} contactIds List of contactId to add to the user roster
     * @async
     * @return {Promise<joinContactsResult, Error>}
     * @fulfil {joinContactsResult} - Join result or an error object depending on the result
     * @category async
     */
    joinContacts( contact, contactIds ) {
        let that = this;

        return new Promise((resolve, reject) => {
            if (!contact) {
                this.logger.log("warn", LOG_ID + "(joinContacts) bad or empty 'contact' parameter", contact);
                reject(Error.BAD_REQUEST);
            }
            else {
                    that.logger.log("debug", LOG_ID + "(joinContacts) contact join to server...");
                    let promises = [];
                    contactIds.forEach( ( contactId) => {
                        promises.push(that.rest.joinContacts(contact, [contactId], false).then( (result) => {
                            return Promise.resolve( { "success" : [contactId]});
                        }).catch( (err) => {
                            if ( err.code === 409 ) {
                                return Promise.resolve( { "success" : [contactId]});
                            }
                            return Promise.resolve( { "failed" : [contactId]});
                        }));
                    });

                    Promise.all(promises).then( (values) => {
                        let mergeResult = values.reduce( (prev, current) => {
                            return Object.assign( prev, current);
                        }, { "success": [], "failed": []});

                        that.logger.log("info", LOG_ID + "(joinContacts) " + mergeResult.success.length + "contact(s) joined, " + mergeResult.failed.length + " contact(s) failed ");
                        resolve(mergeResult);
                    }).catch((err) => {
                        reject(err);
                    });
            }
        });
    }

    /**
     * @private
     * @method _onRosterPresenceChanged
     * @instance
     * @memberof Contacts
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

            // Store previous presence state
            let oldPresence = contact.presence;
            let oldStatus = contact.status;

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
            } else if (is_offline && contact.presence !== "unknown") {
                contact.presence = "offline";
                contact.status = "";
            } else {
                contact.presence = "unknown";
                contact.status = "";
            }

            if ( contact.resources[presence.resource].show === "unavailable" ) {
                delete contact.resources[presence.resource];
            }

            if( contact.presence === oldPresence && contact.status === oldStatus) {
                return;
            }
            
            let presenceDisplayed = contact.status.length > 0 ? contact.presence + "|" + contact.status : contact.presence;
            
            this.logger.log("debug", LOG_ID + "(onRosterPresenceChanged) presence changed to " + presenceDisplayed + " for " + this.getDisplayName(contact));
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
     * @method _onContactInfoChanged
     * @instance
     * @param {string} jid modified roster contact Jid
     * @memberof Contacts
     * @description
     *     Method called when an roster user information are updated
     */
    _onContactInfoChanged(jid) {
        let that = this;

        that.rest.getContactInformationByJID(jid).then((contact) => {
            that.logger.log("info", LOG_ID + "(getContactByJid) contact found on the server", util.inspect(contact));
            let contactIndex = -1;
            // Update or Add contact
            if (that.contacts) {
                contactIndex = that.contacts.findIndex((_contact) => {
                    return _contact.jid_im === jid;
                });
                if ( contactIndex !== -1 ) {
                    contact.avatar = that.getAvatarByContactId(contact.id, contact.lastAvatarUpdateDate);
                    that.contacts[contactIndex] = Object.assign( that.contacts[contactIndex], contact );
                    this.eventEmitter.emit("rainbow_oncontactinformationchanged", that.contacts[contactIndex]);
                } else {
                    contact.avatar = that.getAvatarByContactId(contact.id, contact.lastAvatarUpdateDate);
                    that.contacts.push(contact);
                    this.eventEmitter.emit("rainbow_oncontactinformationchanged", contact);
                }
            }

        }).catch((err) => {
            this.logger.log("info", LOG_ID + "(_onContactInfoChanged) no contact found with jid " + jid);
        });
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
                    let foundContact = that.contacts.find(item => item.jid_im === contact.jid );
                    if (foundContact) {
                        foundContact.presence = "unknown";
                        // Add suppression delay
                        setTimeout( () => {
                            that.contacts = that.contacts.filter( _contact => _contact.jid_im !== contact.jid);
                        }, 3000);
                    }
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