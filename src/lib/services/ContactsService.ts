"use strict";
import {InvitationService} from "./InvitationService";

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {XMPPUTils} from "../common/XMPPUtils";
import {ErrorManager} from "../common/ErrorManager";
import {Contact, AdminType, NameUpdatePrio } from "../common/models/Contact";
import * as util from 'util';
import * as md5 from 'md5';
import * as path from 'path';
import {isStarted, logEntryExit} from "../common/Utils";
import {PresenceService} from "./PresenceService";

const LOG_ID = "CONTACTS/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
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
	public avatarDomain: any;
	public xmpp: any;
	public contacts: any;
	public eventEmitter: any;
	public logger: any;
	public rosterPresenceQueue: any;
	public userContact: any;
	public rest: RESTService;
	public invitationService: InvitationService;
    public presenceService: PresenceService;
	public _logger: any;
	public _xmpp: XMPPService;
    public ready: boolean = false;
    private readonly _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    constructor(_eventEmitter, _http, _logger, _startConfig) {
        this._startConfig = _startConfig;
        this.avatarDomain = _http.host.split(".").length === 2 ? _http.protocol + "://cdn." + _http.host + ":" + _http.port : _http.protocol + "://" + _http.host + ":" + _http.port;
        this.xmpp = null;
        this.contacts = [];
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;
        this.rosterPresenceQueue = [];
        this.userContact = new Contact();
        this.ready = false;

        this.eventEmitter.on("evt_internal_onrosterpresence", this._onRosterPresenceChanged.bind(this));
        this.eventEmitter.on("evt_internal_onrostercontactinformationchanged", this._onContactInfoChanged.bind(this));
        this.eventEmitter.on("evt_internal_userinvitemngtreceived", this._onUserInviteReceived.bind(this));
        this.eventEmitter.on("evt_internal_userinviteaccepted", this._onUserInviteAccepted.bind(this));
        this.eventEmitter.on("evt_internal_userinvitecanceled", this._onUserInviteCanceled.bind(this));
        this.eventEmitter.on("evt_internal_onrosters", this._onRostersUpdate.bind(this));
    }

    start(_xmpp : XMPPService, _rest : RESTService, _invitationService : InvitationService, _presenceService : PresenceService) {

        let that = this;

        return new Promise(function(resolve, reject) {
            try {
                that.xmpp = _xmpp;
                that.rest = _rest;
                that.invitationService = _invitationService;
                that.presenceService = _presenceService;
                that.contacts = [];

                // Create the user contact
                that.logger.log("debug", LOG_ID + "(start) Create userContact (" + that.xmpp.jid + ")");
                that.userContact = new Contact();
                that.userContact.ask = null;
                that.userContact.subscription = null;

                // Attach xmpp information (check)
                that.userContact._id = that.xmpp.jid;
                that.userContact.jid = that.xmpp.jid;
                that.userContact.jidtel = "tel_" + that.xmpp.jid;
                that.userContact.jid_im = that.xmpp.jid;
                that.userContact.jid_tel = "tel_" + that.xmpp.jid;
                that.userContact.fullJid = that.xmpp.fullJid;

                /*
                // Update contact with user data auth information
                that.userContact.language = that.currentLanguage;
                that.logger.log("internal", LOG_ID + "(start) before updateFromUserData ", contact);
                that.userContact.updateFromUserData(authService.userData);
                that.userContact.getAvatar();
                that.userContact.updateRichStatus();
                // */

/*
                that.eventEmitter.on("evt_internal_onrosterpresence", that._onRosterPresenceChanged.bind(that));
                that.eventEmitter.on("evt_internal_onrostercontactinformationchanged", that._onContactInfoChanged.bind(that));
                that.eventEmitter.on("evt_internal_userinvitereceived", that._onUserInviteReceived.bind(that));
                that.eventEmitter.on("evt_internal_userinviteaccepted", that._onUserInviteAccepted.bind(that));
                that.eventEmitter.on("evt_internal_userinvitecanceled", that._onUserInviteCanceled.bind(that));
                that.eventEmitter.on("evt_internal_onrosters", that._onRostersUpdate.bind(that));
*/
                that.ready = true;
                resolve();

            } catch (err) {
                that.logger.log("error", LOG_ID + "(start) Catch ErrorManager !!!");
                that.logger.log("internalerror", LOG_ID + "(start) Catch ErrorManager !!! : ", err.message);
                return reject(err);
            }
        });
    }

    stop() {
        let that = this;
        return new Promise(function(resolve, reject) {
            try {
                that.xmpp = null;
                that.rest = null;
                that.contacts = [];
/*
                that.eventEmitter.removeListener("evt_internal_onrosterpresence", that._onRosterPresenceChanged.bind(that));
                that.eventEmitter.removeListener("evt_internal_onrostercontactinformationchanged", that._onContactInfoChanged.bind(that));
                that.eventEmitter.removeListener("evt_internal_userinvitereceived", that._onUserInviteReceived.bind(that));
                that.eventEmitter.removeListener("evt_internal_userinviteaccepted", that._onUserInviteAccepted.bind(that));
                that.eventEmitter.removeListener("evt_internal_userinvitecanceled", that._onUserInviteCanceled.bind(that));
                that.eventEmitter.removeListener("evt_internal_onrosters", that._onRostersUpdate.bind(that));
*/
                that.ready = false;
                resolve();

            } catch (err) {
                return reject();
            }
        });
    }

    init() {
        return new Promise((resolve, reject) => {
            let that = this;
            let userInfo = that.getContactById(that.rest.account.id, true).then((contact : Contact) => {
                //that.logger.log("internal", LOG_ID + "(init) before updateFromUserData ", contact);
                that.userContact.updateFromUserData(contact);
            });
            Promise.all([userInfo]).then(()=> { resolve(); }).catch(() => { return reject(); });
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
     * @public
     * @method getRosters
     * @instance
     * @memberof Contacts
     * @description
     *      Get the list of contacts that are in the user's network (aka rosters)
     * @async
     * @return {Promise<Array>}
     * @fulfil {ErrorManager} - ErrorManager object depending on the result (ErrorManager.getErrorManager().OK in case of success)
     * @category async
     */
    getRosters() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.rest.getContacts().then((listOfContacts : any) => {

                listOfContacts.forEach( (contactData : any) => {
                    // Create the contact object
                    let contact = new Contact();
                    Object.assign(contact, contactData);
                    // that.logger.log("internal", LOG_ID + "(getRosters) before updateFromUserData ", contact);
                    contact.updateFromUserData(contactData);
                    contact.roster = true;
                    contact.avatar = that.getAvatarByContactId(contact.id, contact.lastAvatarUpdateDate);
                    // Append in contact list
                    // that.contacts[contact.id] = contact;
                    that.contacts.push(contact);
                });
                that.logger.log("internal", LOG_ID + "(getRosters) get rosters successfully : ", that.contacts);

                that.logger.log("info", LOG_ID + "(getRosters) get rosters successfully");
                resolve(that.getAll());
            }).catch((err) => {
                that.logger.log("error", LOG_ID + "(getRosters) error");
                that.logger.log("internalerror", LOG_ID + "(getRosters) error : ", err);
                return reject(err);
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
        let contact = that.createBasicContact(jid);
        contact.initials = "?";
        contact.displayName = "Unknown contact";
        contact.lastName = "Unknown contact";
        contact.firstName = "";
        contact.temp = true;
        contact.avatar = {};//new Image();
        contact.avatar.src = "/resources/skins/rainbow/images/conversations/unknownContact.png";
        return contact;
    }

    getContact(jid, phoneNumber) {
        let that = this;
        let contact = null;
        let contactId = jid ? jid : phoneNumber;
        if (that.isUserContactJid(contactId)) {
            // Create the contact object
            contact = new Contact();
            // that.logger.log("internal", LOG_ID + "(getContact) before updateFromUserData ", contact);
            contact.updateFromUserData(that.rest.account);
        } else {
            contact = that.contacts.find( (_contact) => _contact.jid_im === contactId);
        }

        return contact;
    }

    getOrCreateContact(jid, phoneNumber) {
        let that = this;

        // Reject stupid request
        if (!jid && !phoneNumber) {
            let error = ErrorManager.getErrorManager().BAD_REQUEST;
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
        return that.rest.getContactInformationByJID(jid).then( (_contactFromServer : any) => {

            let contactIndex = that.contacts.findIndex((value) => {
                return value.jid_im === _contactFromServer.jid_im;
            });

            if ( contactIndex !== -1 ) {
                contact = that.contacts[contactIndex];
            }

            //that.logger.log("internal", LOG_ID + "(getOrCreateContact) before updateFromUserData ", contact);
            contact.updateFromUserData(_contactFromServer);
            contact.avatar = that.getAvatarByContactId(_contactFromServer.id, _contactFromServer.lastAvatarUpdateDate);
            //that.contacts.push(contact);
            return Promise.resolve(contact);
        });
    }

    createBasicContact(jid, phoneNumber?) {
        let that = this;
        that.logger.log("debug", LOG_ID + "[contactService] CreateContact " + jid + " " /* TODO + anonymizePhoneNumber(phoneNumber) */);

        // Create the contact object
        let contact = new Contact();

        // Handle case where we have no jid
        if (!jid) {
            contact.id = phoneNumber;
            contact._id = phoneNumber;
            contact.initials = "?";
            contact.displayName = phoneNumber ? phoneNumber : "Unknown contact";
            contact.lastName = phoneNumber ? phoneNumber : "Unknown contact";
            contact.firstName = "";
            contact.phoneProCan = phoneNumber ? phoneNumber : "";
            contact.temp = true;
            contact.loginEmail = "noEmail";
            contact.avatar = {}; // new Image();
            contact.avatar.src = "/resources/skins/rainbow/images/conversations/unknownContact.png";
            contact.setNameUpdatePrio(NameUpdatePrio.NO_UPDATE_PRIO);//not yet updated
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
        contact.jid_im = jid;
        contact.jidtel = "tel_" + jid;
        contact.id = contactId;
        contact._id = jid;
        contact.ask = "none";
        contact.subscription = "none";
        // TODO ? contact.updateRichStatus();

        contact.roster = false;
        contact.presence = "offline";
        contact.status = "";

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
     * @return {Promise<Contact, ErrorManager>}
     * @fulfil {Contact} - Found contact or null or an error object depending on the result
     * @category async
     */
    getContactByJid(jid) {

        let that = this;

        return new Promise((resolve, reject) => {
            if (!jid) {
                that.logger.log("warn", LOG_ID + "(getContactByJid) bad or empty 'jid' parameter", jid);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
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
                    that.rest.getContactInformationByJID(jid).then((_contactFromServer : any) => {
                        let contact = null;
                        if( _contactFromServer ) {
                            that.logger.log("internal", LOG_ID + "(getContactByJid) contact found on the server", _contactFromServer);
                            let contactIndex = that.contacts.findIndex((value) => {
                                return value.jid_im === _contactFromServer.jid_im;
                            });

                            if (contactIndex !== -1) {
                                contact = that.contacts[contactIndex];
                                that.logger.log("internal", LOG_ID + "(getContactByJid) contact found on local contacts", contact);
                            } else {
                                contact = that.createBasicContact(_contactFromServer.jid_im, undefined);
                            }

                            //that.logger.log("internal", LOG_ID + "(getContactByJid) before updateFromUserData ", contact);
                            contact.updateFromUserData(_contactFromServer);
                            contact.avatar = that.getAvatarByContactId(_contactFromServer.id, _contactFromServer.lastAvatarUpdateDate);
                        } else {
                            that.logger.log("info", LOG_ID + "(getContactByJid) no contact found on the server with Jid", jid);
                        }
                        resolve(contact);
                    }).catch((err) => {
                        return reject(err);
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
     * @param {boolean} forceServerSearch Boolean to force the search of the contacts informations on the server.
     * @memberof Contacts
     * @description
     *  Get a contact by his id
     * @async
     * @return {Promise<Contact, ErrorManager>}
     * @fulfil {Contact} - Found contact or null or an error object depending on the result
     * @category async
     */
    getContactById(id, forceServerSearch) : Promise<Contact>{
        let that = this;
        return new Promise((resolve, reject) => {
             if (!id) {
                that.logger.log("warn", LOG_ID + "(getContactById) bad or empty 'id' parameter", id);
                 return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else {

                let contactFound = null;

                if (that.contacts && !forceServerSearch) {
                    contactFound = that.contacts.find((contact) => {
                        return contact.id === id;
                    });
                }

                if (contactFound) {
                    that.logger.log("internal", LOG_ID + "(getContactById) contact found locally", contactFound);
                    resolve(contactFound);
                }
                else {
                    that.logger.log("debug", LOG_ID + "(getContactById) contact not found locally. Ask the server...");
                    that.rest.getContactInformationByID(id).then((_contactFromServer : any) => {
                        let contact : Contact = null;
                        if (_contactFromServer) {
                            that.logger.log("internal", LOG_ID + "(getContactById) contact found on the server", _contactFromServer);
                            that.logger.log("info", LOG_ID + "(getContactById) contact found on the server");
                            let contactIndex = that.contacts.findIndex((value) => {
                                return value.jid_im === _contactFromServer.jid_im;
                            });

                            if (contactIndex !== -1) {
                                //that.logger.log("info", LOG_ID + "(getContactById) contact found on local contacts", contact);
                                that.logger.log("info", LOG_ID + "(getContactById) contact found on local contacts");
                                contact = that.contacts[contactIndex];
                            } else {
                                contact = that.createBasicContact(_contactFromServer.jid_im, undefined);
                            }

                            //that.logger.log("internal", LOG_ID + "(getContactById) before updateFromUserData ", contact);
                            contact.updateFromUserData(_contactFromServer);
                            contact.avatar = that.getAvatarByContactId(_contactFromServer.id, _contactFromServer.lastAvatarUpdateDate);
                        } else {
                            that.logger.log("info", LOG_ID + "(getContactById) no contact found on server with id", id);
                        }
                        resolve(contact);
                    }).catch((err) => {
                        return reject(err);
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
     * @return {Promise<Contact, ErrorManager>}
     * @fulfil {Contact} - Found contact or null or an error object depending on the result
     * @category async
     */
    async getContactByLoginEmail(loginEmail)  : Promise <Contact>{

        let that = this;

        return new Promise((resolve, reject) => {
            if (!loginEmail) {
                this.logger.log("warn", LOG_ID + "(getContactByLoginEmail) bad or empty 'loginEmail' parameter");
                this.logger.log("internalerror", LOG_ID + "(getContactByLoginEmail) bad or empty 'loginEmail' parameter : ", loginEmail);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            else {

                let contactFound : Contact = null;

                if (that.contacts) {
                    contactFound = that.contacts.find((contact) => {
                        return contact.loginEmail === loginEmail;
                    });
                }

                if (contactFound) {
                    that.logger.log("internal", LOG_ID + "(getContactByLoginEmail) contact found locally : ", contactFound);
                    resolve(contactFound);
                } else {
                    that.logger.log("debug", LOG_ID + "(getContactByLoginEmail) contact not found locally. Ask server...");
                    that.rest.getContactInformationByLoginEmail(loginEmail).then(async (contactsFromServeur: [any]) => {
                        if (contactsFromServeur && contactsFromServeur.length > 0) {
                            let contact : Contact = null;
                            that.logger.log("info", LOG_ID + "(getContactByLoginEmail) contact found on server");
                            let _contactFromServer = contactsFromServeur[0];
                            if (_contactFromServer) {
                                // The contact is not found by email in the that.contacts tab, so it need to be find on server to get or update it.
                                await that.getContactById(_contactFromServer.id, true).then((contactInformation : Contact) => {
                                    contact = contactInformation;
                                    // Workaround because server does not return the email when not in same company, even if it has been found by email on server.
                                    if (!contact.loginEmail) {
                                        contact.loginEmail = loginEmail;
                                    }
                                    that.logger.log("internal", LOG_ID + "(getContactByLoginEmail) full data contact : ", contact, ", found on server with loginEmail : ", loginEmail);
                                    /*let contactIndex = that.contacts.findIndex((value) => {
                                        return value.jid_im === contactInformation.jid_im;
                                    });

                                    if (contactIndex !== -1) {
                                        contact = that.contacts[contactIndex];
                                    } else {
                                        contact = that.createBasicContact(contactInformation.jid_im, undefined);
                                    }
                                    //that.logger.log("internal", LOG_ID + "(getContactByLoginEmail) before updateFromUserData ", contact);
                                    contact.updateFromUserData(contactInformation);
                                    contact.avatar = that.getAvatarByContactId(contactInformation.id, contactInformation.lastAvatarUpdateDate);

                                     */
                                });
                            } else {
                                that.logger.log("internal", LOG_ID + "(getContactByLoginEmail) no contact found on server with loginEmail : ", loginEmail);
                            }
                            resolve(contact);
                        } else {
                            that.logger.log("internal", LOG_ID + "(getContactByLoginEmail) contact not found on server with loginEmail : ", loginEmail);
                            resolve(null);
                        }
                    }).catch((err) => {
                        return reject(err);
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
        let bareJid = XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(jid);
        return that.isTelJid(bareJid) ? bareJid.substring(4) : bareJid;
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

    isUserContact(contact: Contact) {
        let that = this;
        if (!contact || !contact.jid) { return false; }
        if (!that.rest.account) { return (contact.jid === that._xmpp.jid); }
        return (that.rest.account.jid === contact.jid);
    }


    /**
     * @public
     * @method getConnectedUser
     * @instance
     * @description
     *    Get the connected user information
     * @return {Contact} Return a Contact object representing the connected user information or null if not connected
     */
    getConnectedUser() : Contact{
        let that = this;
        if (!that.rest.account) {
            return null;
        }
        // Create the contact object
        let contact = new Contact();

        //that.logger.log("internal", LOG_ID + "(getContactById) before updateFromUserData ", contact);
        contact.updateFromUserData(that.rest.account);
        contact.avatar = that.getAvatarByContactId(that.rest.account.id, that.rest.account.lastAvatarUpdateDate);
        contact.status = that.presenceService.getUserConnectedPresence().status;

        return contact;
    }

    /**
     * @public
     * @since 1.17
     * @method
     * @instance
     * @description
     *    Send an invitation to a Rainbow user for joining his network. <br>
     *    The user will receive an invitation that can be accepted or declined <br>
     *    In return, when accepted, he will be part of your network <br>
     *    When in the same company, invitation is automatically accepted (ie: can't be declined)
     * @param {Contact} contact The contact object to subscribe
     * @return {Object} A promise that contains the contact added or an object describing an error
     */
    addToNetwork(contact: Contact) {
        return this.addToContactsList(contact);
    }
    /**
     * @public
     * @since 1.17
     * @method addToContactsList
     * @instance
     * @memberof Contacts
     * @description
     *    Send an invitation to a Rainbow user for joining his network. <br>
     *    The user will receive an invitation that can be accepted or declined <br>
     *    In return, when accepted, he will be part of your network <br>
     *    When in the same company, invitation is automatically accepted (ie: can't be declined)
     * @param {Contact} contact The contact object to subscribe
     * @return {Object} A promise that contains the contact added or an object describing an error
     * @category async
     */
    addToContactsList(contact : Contact) {
        let that = this;

        return new Promise((resolve, reject) => {
            if (!contact) {
                this.logger.log("warn", LOG_ID + "(addToContactsList) bad or empty 'contact' parameter");
                this.logger.log("internalerror", LOG_ID + "(addToContactsList) bad or empty 'contact' parameter : ", contact);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            else {

                    that.logger.log("internal", LOG_ID + "(addToContactsList) contact invitation to server... : ", contact);
                    that.rest.joinContactInvitation(contact).then((_contact : any) => {
                        if (_contact && _contact.status !== undefined) {
                            that.logger.log("info", LOG_ID + "(addToContactsList) contact invited : ", _contact.invitedUserId);
                            that.getContactById(_contact.invitedUserId, false).then((invitedUser) => {
                                resolve(invitedUser);
                            }).catch((err) => {
                                return reject(err);
                            });
                        } else {
                            that.logger.log("internal", LOG_ID + "(addToContactsList) contact cannot be added : ", util.inspect(contact));
                            resolve(null);
                        }
                    }).catch((err) => {
                        return reject(err);
                    });
            }
        });
    }

    /**
     * @public
     * @since 1.64.0
     * @method getInvitationById
     * @instance
     * @description
     *    Get an invite by its id
     * @param {String} strInvitationId the id of the invite to retrieve
     * @return {Invitation} The invite if found
     */
    async getInvitationById(strInvitationId) {
        if (!strInvitationId) {
            this.logger.log("warn", LOG_ID + "(getInvitationById) bad or empty 'strInvitationId' parameter");
            this.logger.log("internalerror", LOG_ID + "(getInvitationById) bad or empty 'strInvitationId' parameter : ", strInvitationId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return this.invitationService.getInvitation(strInvitationId);
    };

    /**
     * @public
     * @since 1.17
     * @method
     * @instance
     * @description
     *    Accept an invitation from an other Rainbow user to mutually join the network <br>
     *    Once accepted, the user will be part of your network. <br>
     *    Return a promise
     * @param {Invitation} invitation The invitation to accept
     * @return {Object} A promise that contains SDK.OK if success or an object that describes the error
     */
    async acceptInvitation(invitation) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(acceptInvitation) invitation : ", invitation);
        if (!invitation) {
            let error = ErrorManager.getErrorManager().BAD_REQUEST;
            error.msg += ", invitation not defined, can not acceptInvitation";
            throw error;
        } else {
            return that.rest.acceptInvitation(invitation);
        }
    };

    /**
     * @public
     * @since 1.17
     * @method
     * @instance
     * @description
     *    Decline an invitation from an other Rainbow user to mutually join the network <br>
     *    Once declined, the user will not be part of your network. <br>
     *    Return a promise
     * @param {Invitation} invitation The invitation to decline
     * @return {Object} A promise that contains SDK.OK in case of success or an object that describes the error
     */
    declineInvitation(invitation) {
        let that = this;
        that.logger.log("internal", LOG_ID + "(declineInvitation) intivation : ", invitation);
        if (!invitation) {
            let error = ErrorManager.getErrorManager().BAD_REQUEST;
            error.msg += ", invitation not defined, can not declineInvitation";
            throw error;
        } else {
            return that.rest.declineInvitation(invitation);
        }

    };


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
     * @return {Promise<joinContactsResult, ErrorManager>}
     * @fulfil {joinContactsResult} - Join result or an error object depending on the result
     * @category async
     */
    joinContacts( contact:Contact , contactIds ) {
        let that = this;

        return new Promise((resolve, reject) => {
            if (!contact) {
                this.logger.log("warn", LOG_ID + "(joinContacts) bad or empty 'contact' parameter");
                this.logger.log("internalerror", LOG_ID + "(joinContacts) bad or empty 'contact' parameter : ", contact);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            else {
                    that.logger.log("debug", LOG_ID + "(joinContacts) contact join to server...");
                    let promises = [];
                    contactIds.forEach( ( contactId) => {
                        promises.push(that.rest.joinContacts(contact, [contactId], false).then( (result) => {
                            return Promise.resolve( { "success" : [contactId]});
                        }).catch( (err : any) => {
                            if ( err.code === 409 ) {
                                resolve( { "success" : [contactId]});
                            }
                            resolve( { "failed" : [contactId]});
                        }));
                    });

                    Promise.all(promises).then( (values) => {
                        let mergeResult = values.reduce( (prev, current) => {
                            return Object.assign( prev, current);
                        }, { "success": [], "failed": []});

                        that.logger.log("internal", LOG_ID + "(joinContacts) " + mergeResult.success.length + " contact(s) joined, " + mergeResult.failed.length + " contact(s) failed ");
                        resolve(mergeResult);
                    }).catch((err) => {
                        return reject(err);
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

        let contact = this.contacts.find((contactItem) => {
            return contactItem.jid_im === presence.jid;
        });

        if (contact) {

            if (!contact.resources) {
                contact.resources = {};
            }

            // Store the presence of the resource
            contact.resources[presence.resource] = presence.value;

            let on_the_phone = false;
            let manual_invisible = false;
            let manual_dnd = false;
            let manual_away = false;
            let in_presentation_mode = false;
            let in_webrtc_mode = false;
            let webrtc_reason = "";
            let is_online = false;
            let is_online_mobile = false;
            let auto_away = false;
            let is_offline = false;
            for (let resourceId in contact.resources) {

                let resource = contact.resources[resourceId];

                if ( resource.type !== "phone" ) {
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
                    if ((resource.status === "EVT_SERVICE_INITIATED" || resource.status === "EVT_ESTABLISHED") && resource.show === "chat") {
                        on_the_phone = true;
                    }
                    if (resource.status === "EVT_CONNECTION_CLEARED" && resource.show === "chat") {
                        on_the_phone = false;
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

            this.logger.log("internal", LOG_ID + "(onRosterPresenceChanged) presence changed to " + presenceDisplayed + " for " + this.getDisplayName(contact));
            this.eventEmitter.emit("evt_internal_onrosterpresencechanged", contact);
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

        that.rest.getContactInformationByJID(jid).then((_contactFromServer : any) => {
            that.logger.log("info", LOG_ID + "(getContactByJid) contact found on the server");
            that.logger.log("internal", LOG_ID + "(getContactByJid) contact found on the server : ", util.inspect(_contactFromServer));
            let contactIndex = -1;
            // Update or Add contact
            if (that.contacts) {
                contactIndex = that.contacts.findIndex((_contact : any) => {
                    return _contact.jid_im === _contactFromServer.jid_im;
                });

                let contact = null;
                that.logger.log("internal", LOG_ID + "(getContactByJid) contact found on the server : ", contact);

                if ( contactIndex !== -1 ) {
                    contact = that.contacts[contactIndex];
                    //that.logger.log("internal", LOG_ID + "(_onContactInfoChanged) local contact before updateFromUserData ", contact);
                    contact.updateFromUserData(_contactFromServer);
                    contact.avatar = that.getAvatarByContactId(_contactFromServer.id, _contactFromServer.lastAvatarUpdateDate);
                    this.eventEmitter.emit("evt_internal_contactinformationchanged", that.contacts[contactIndex]);
                } else {
                    contact = that.createBasicContact(_contactFromServer.jid_im, undefined);
                    //that.logger.log("internal", LOG_ID + "(_onContactInfoChanged) from server contact before updateFromUserData ", contact);
                    contact.updateFromUserData(_contactFromServer);
                    contact.avatar = that.getAvatarByContactId(_contactFromServer.id, _contactFromServer.lastAvatarUpdateDate);
                    this.eventEmitter.emit("evt_internal_contactinformationchanged", contact);
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
        that.logger.log("internal", LOG_ID + "(_onUserInviteReceived) enter : ", data);

        that.rest.getInvitationById(data.invitationId).then( (invitation : any) => {
            that.logger.log("debug", LOG_ID + "(_onUserInviteReceived) invitation received id", invitation.id);

            that.eventEmitter.emit("evt_internal_userinvitereceived", invitation);
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

        that.rest.getInvitationById(data.invitationId).then((invitation : any) => {
            that.logger.log("debug", LOG_ID + "(_onUserInviteAccepted) invitation accepted id", invitation.id);

            that.eventEmitter.emit("evt_internal_userinviteaccepted", invitation);
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
            .then((invitation : any) => {
                that.logger.log("debug", LOG_ID + "(_onUserInviteCanceled) invitation canceled id", invitation.id);

                that.eventEmitter.emit("evt_internal_userinvitecanceled", invitation);
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

module.exports.Contacts = Contacts;
export {Contacts as ContactsService};
