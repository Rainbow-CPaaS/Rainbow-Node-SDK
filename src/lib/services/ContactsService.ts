"use strict";
import {InvitationsService} from "./InvitationsService";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {XMPPUTils} from "../common/XMPPUtils";
import {ErrorManager} from "../common/ErrorManager";
import {Contact, NameUpdatePrio} from "../common/models/Contact";
import * as util from 'util';
import * as md5 from 'md5';
import * as path from 'path';
import {isStarted, logEntryExit} from "../common/Utils";
import {PresenceService} from "./PresenceService";
import {EventEmitter} from "events";
import {Logger} from "../common/Logger";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import {PresenceLevel, PresenceRainbow, PresenceShow, PresenceStatus} from "../common/models/PresenceRainbow";
import {Invitation} from "../common/models/Invitation";
import {GenericService} from "./GenericService";

export {};

const LOG_ID = "CONTACTS/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name ContactsService
 * @version SDKVERSION
 * @public
 * @description
 *       This module manages _contacts. A contact is defined by a set of public information (name, firstname, avatar...) and a set of private information.<br>
 *       Using this module, you can get access to your network _contacts or search for Rainbow _contacts. <br>
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Get the network _contacts (roster) <br>
 *      - Get and search _contacts by Id, JID or loginEmail <br>
 */
class ContactsService extends GenericService {
    private avatarDomain: any;
    private _contacts: Array<Contact>;
    private _rosterPresenceQueue: any;
    public userContact: Contact;
    private _invitationsService: InvitationsService;
    private _presenceService: PresenceService;
    //private _logger: Logger;

    static getClassName() {
        return 'ContactsService';
    }

    getClassName() {
        return ContactsService.getClassName();
    }

    constructor(_eventEmitter: EventEmitter, _http: any, _logger: Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(_logger, LOG_ID);
        this._startConfig = _startConfig;
        this.avatarDomain = _http.host.split(".").length===2 ? _http.protocol + "://cdn." + _http.host + ":" + _http.port:_http.protocol + "://" + _http.host + ":" + _http.port;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._contacts = [];
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
        this._rosterPresenceQueue = [];
        this.userContact = new Contact();

        this._eventEmitter.on("evt_internal_presencechanged", this._onPresenceChanged.bind(this));
        this._eventEmitter.on("evt_internal_onrosterpresence", this._onRosterPresenceChanged.bind(this));
        this._eventEmitter.on("evt_internal_onrostercontactinformationchanged", this._onRosterContactInfoChanged.bind(this));
        this._eventEmitter.on("evt_internal_oncontactinformationchanged", this._onContactInfoChanged.bind(this));
        // this._eventEmitter.on("evt_internal_userinvitemngtreceived", this._onUserInviteReceived.bind(this));
        // this._eventEmitter.on("evt_internal_userinviteaccepted", this._onUserInviteAccepted.bind(this));
        // this._eventEmitter.on("evt_internal_userinvitecanceled", this._onUserInviteCanceled.bind(this));
        this._eventEmitter.on("evt_internal_onrosters", this._onRostersUpdate.bind(this));

    }

    start(_options, _core: Core) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService, _invitationsService : InvitationsService, _presenceService : PresenceService

        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;
                that._options = _options;
                that._s2s = _core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                that._invitationsService = _core.invitations;
                that._presenceService = _core.presence;
                that._contacts = [];

                // Create the user contact
                that._logger.log("debug", LOG_ID + "(start) Create userContact (" + that._xmpp.jid + ")");
                that.userContact = new Contact();
                that.userContact.ask = null;
                that.userContact.subscription = null;

                // Attach _xmpp information (check)
                that.userContact._id = that._xmpp.jid;
                that.userContact.jid = that._xmpp.jid;
                that.userContact.jidtel = "tel_" + that._xmpp.jid;
                that.userContact.jid_im = that._xmpp.jid;
                that.userContact.jid_tel = "tel_" + that._xmpp.jid;
                //that.userContact.fullJid = that._xmpp.fullJid;

                that.setStarted ();
                resolve(undefined);

            } catch (err) {
                that._logger.log("error", LOG_ID + "(start) Catch ErrorManager !!!");
                that._logger.log("internalerror", LOG_ID + "(start) Catch ErrorManager !!! : ", err.message);
                return reject(err);
            }
        });
    }

    stop() {
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                that._xmpp = null;
                that._rest = null;
                that._contacts = [];

                that.setStopped ();
                resolve(undefined);
            } catch (err) {
                return reject();
            }
        });
    }

    init() {
        return new Promise((resolve, reject) => {
            let that = this;
            let userInfo = that.getContactById(that._rest.account.id, true).then((contact: Contact) => {
                //that._logger.log("internal", LOG_ID + "(init) before updateFromUserData ", contact);
                that.userContact.updateFromUserData(contact);
            });
            Promise.all([userInfo]).then(() => {
                that.setInitialized();
                resolve(undefined);
            }).catch(() => {
                resolve(undefined);
                //return reject();
            });
        });
    }

    cleanMemoryCache() {
        let that = this;
        super.cleanMemoryCache();
        for (let i = 0; i < that._contacts.length ; i++) {
            if (that._contacts[i]) {
                if ( that._contacts[i].isObsoleteCache()) {
                    that._logger.log("info", LOG_ID + "(cleanMemoryCache) contact obsolete. Will remove it from cache.");
                    that._logger.log("internal", LOG_ID + "(cleanMemoryCache) contact obsolete. Will remove it from cache : ", that._contacts[i]);
                    that._contacts.splice(i,1);
                    i--;
                } else {
                    that._logger.log("info", LOG_ID + "(cleanMemoryCache) contact not obsolete.");
                    that._logger.log("internal", LOG_ID + "(cleanMemoryCache) contact not obsolete : ", that._contacts[i]);
                }
            } else {
                that._logger.log("info", LOG_ID + "(cleanMemoryCache) contact empty, so it is obsolete. Will remove it from cache.");
                that._contacts.splice(i,1);
                i--;
            }
        }
    }

    //region Contacts MANAGEMENT
    
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
        let contact: any;
        contact = null;
        let contactId = jid ? jid:phoneNumber;
        if (that.isUserContactJid(contactId)) {
            // Create the contact object
            contact = new Contact();
            // that._logger.log("internal", LOG_ID + "(getContact) before updateFromUserData ", contact);
            contact.updateFromUserData(that._rest.account);
            contact.status = that._presenceService.getUserConnectedPresence().presenceDetails;
            contact.presence = that._presenceService.getUserConnectedPresence().presenceLevel;
        } else {
            contact = that._contacts.find((_contact) => _contact.jid_im===contactId);
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
        if (!this._contacts) {
            this._contacts = [];
        }

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
        return that._rest.getContactInformationByJID(jid).then((_contactFromServer: any) => {

            let contactIndex = that._contacts.findIndex((value) => {
                return value.jid_im===_contactFromServer.jid_im;
            });

            if (contactIndex!== -1) {
                contact = that._contacts[contactIndex];
            }

            //that._logger.log("internal", LOG_ID + "(getOrCreateContact) before updateFromUserData ", contact);
            contact.updateFromUserData(_contactFromServer);
            contact.avatar = that.getAvatarByContactId(_contactFromServer.id, _contactFromServer.lastAvatarUpdateDate);
            //that._contacts.push(contact);
            return Promise.resolve(contact);
        });
    }

    createBasicContact(jid, phoneNumber?) {
        let that = this;
        that._logger.log("debug", LOG_ID + "[contactService] CreateContact " + jid + " " /* TODO + anonymizePhoneNumber(phoneNumber) */);

        // Create the contact object
        let contact = new Contact();

        // Handle case where we have no jid
        if (!jid) {
            contact.id = phoneNumber;
            contact._id = phoneNumber;
            contact.initials = "?";
            contact.displayName = phoneNumber ? phoneNumber:"Unknown contact";
            contact.lastName = phoneNumber ? phoneNumber:"Unknown contact";
            contact.firstName = "";
            contact.phoneProCan = phoneNumber ? phoneNumber:"";
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
        if (!contactId) {
            contactId = "anonymous";
        }

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
        // that._contacts[contact.id] = contact;
        that._contacts.push(contact);

        return contact;
    }

    //endregion Contacts MANAGEMENT

    //region Contacts INFORMATIONS

    /**
     * @public
     * @method getAll
     * @category Contacts INFORMATIONS
     * @instance
     * @return {Contact[]} the list of _contacts
     * @description
     *  Return the list of _contacts that are in the network of the connected users (aka rosters) <br>
     */
    getAll() : Array<Contact>{
        return this._contacts;
    }

    /**
     * @public
     * @method getContactByJid
     * @instance
     * @category Contacts INFORMATIONS
     * @param {string} jid The contact jid
     * @param {boolean} forceServerSearch Boolean to force the search of the _contacts informations on the server.
     * @description
     *  Get a contact by his JID by searching in the connected user _contacts list (full information) and if not found by searching on the server too (limited set of information) <br>
     * @async
     * @return {Promise<Contact, ErrorManager>}
     * @fulfil {Contact} - Found contact or null or an error object depending on the result

     */
    getContactByJid(jid : string, forceServerSearch : boolean = false): Promise<Contact> {

        let that = this;

        return new Promise((resolve, reject) => {
            if (!jid) {
                that._logger.log("warn", LOG_ID + "(getContactByJid) bad or empty 'jid' parameter", jid);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else {
                let contactFound = null;
                let connectedUser = that.getConnectedUser() ? that.getConnectedUser():new Contact();

                if (that._contacts && !forceServerSearch) {
                    contactFound = that._contacts.find((contact) => {
                        return contact.jid_im===jid;
                    });
                }

                if (contactFound) {
                    that._logger.log("info", LOG_ID + "(getContactByJid) contact found locally with jid ", jid);
                    if (contactFound.jid_im===connectedUser.jid_im) {
                        resolve(connectedUser);
                    } else {
                        resolve(contactFound);
                    }
                } else {
                    that._logger.log("debug", LOG_ID + "(getContactByJid) contact not found locally. Ask the server...");
                    that._rest.getContactInformationByJID(jid).then((_contactFromServer: any) => {
                        let contact = null;
                        if (_contactFromServer) {
                            that._logger.log("internal", LOG_ID + "(getContactByJid) contact found on the server", _contactFromServer);
                            let contactIndex = that._contacts.findIndex((value) => {
                                return value.jid_im===_contactFromServer.jid_im;
                            });

                            if (contactIndex!== -1) {
                                contact = that._contacts[contactIndex];
                                that._logger.log("internal", LOG_ID + "(getContactByJid) contact found on local _contacts", contact);
                            } else {
                                contact = that.createBasicContact(_contactFromServer.jid_im, undefined);
                            }

                            //that._logger.log("internal", LOG_ID + "(getContactByJid) before updateFromUserData ", contact);
                            contact.updateFromUserData(_contactFromServer);
                            contact.avatar = that.getAvatarByContactId(_contactFromServer.id, _contactFromServer.lastAvatarUpdateDate);
                            if (contact.jid_im===connectedUser.jid_im) {
                                contact.status = that._presenceService.getUserConnectedPresence().presenceDetails;
                                contact.presence = that._presenceService.getUserConnectedPresence().presenceLevel;
                            }
                        } else {
                            that._logger.log("info", LOG_ID + "(getContactByJid) no contact found on the server with Jid", jid);
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
     * @category Contacts INFORMATIONS
     * @param {string} id The contact id
     * @param {boolean} forceServerSearch Boolean to force the search of the _contacts informations on the server.
     * @description
     *  Get a contact by his id <br>
     * @async
     * @return {Promise<Contact, ErrorManager>}
     * @fulfil {Contact} - Found contact or null or an error object depending on the result

     */
    getContactById(id : string, forceServerSearch: boolean = false): Promise<Contact> {
        let that = this;
        return new Promise((resolve, reject) => {
            if (!id) {
                that._logger.log("warn", LOG_ID + "(getContactById) bad or empty 'id' parameter", id);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else {

                let contactFound = null;
                let connectedUser = that.getConnectedUser() ? that.getConnectedUser():new Contact();

                if (that._contacts && !forceServerSearch) {
                    contactFound = that._contacts.find((contact) => {
                        return contact.id===id;
                    });
                }

                if (contactFound) {
                    that._logger.log("internal", LOG_ID + "(getContactById) contact found locally", contactFound);

                    if (contactFound.id===connectedUser.id) {
                        return resolve(connectedUser);
                    } else {
                        return resolve(contactFound);
                    }
                } else {
                    that._logger.log("debug", LOG_ID + "(getContactById) contact not found locally. Ask the server...");
                    that._rest.getContactInformationByID(id).then((_contactFromServer: any) => {
                        let contact: Contact = null;
                        if (_contactFromServer) {
                            that._logger.log("internal", LOG_ID + "(getContactById) contact found on the server : ", _contactFromServer);
                            that._logger.log("info", LOG_ID + "(getContactById) contact found on the server");
                            let contactIndex = that._contacts.findIndex((value) => {
                                return value.jid_im===_contactFromServer.jid_im;
                            });

                            if (contactIndex!== -1) {
                                //that._logger.log("info", LOG_ID + "(getContactById) contact found on local _contacts", contact);
                                that._logger.log("info", LOG_ID + "(getContactById) contact found on local _contacts");
                                contact = that._contacts[contactIndex];
                            } else {
                                contact = that.createBasicContact(_contactFromServer.jid_im, undefined);
                            }

                            //that._logger.log("internal", LOG_ID + "(getContactById) before updateFromUserData ", contact);
                            contact.updateFromUserData(_contactFromServer);
                            contact.avatar = that.getAvatarByContactId(_contactFromServer.id, _contactFromServer.lastAvatarUpdateDate);

                            if (contact.id===connectedUser.id) {
                                contact.status = that._presenceService.getUserConnectedPresence().presenceStatus;
                                contact.presence = that._presenceService.getUserConnectedPresence().presenceLevel;
                            }
                        } else {
                            that._logger.log("info", LOG_ID + "(getContactById) no contact found on server with id", id);
                        }
                        return resolve(contact);
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
     * @category Contacts INFORMATIONS
     * @param {string} loginEmail The contact loginEmail
     * @param {boolean} forceServerSearch Boolean to force the search of the _contacts informations on the server.
     * @description
     *  Get a contact by his loginEmail <br>
     * @async
     * @return {Promise<Contact, ErrorManager>}
     * @fulfil {Contact} - Found contact or null or an error object depending on the result

     */
    async getContactByLoginEmail(loginEmail : string, forceServerSearch: boolean = false): Promise<Contact> {

        let that = this;

        return new Promise((resolve, reject) => {
            if (!loginEmail) {
                this._logger.log("warn", LOG_ID + "(getContactByLoginEmail) bad or empty 'loginEmail' parameter");
                this._logger.log("internalerror", LOG_ID + "(getContactByLoginEmail) bad or empty 'loginEmail' parameter : ", loginEmail);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else {

                let contactFound: Contact = null;
                let connectedUser = that.getConnectedUser() ? that.getConnectedUser():new Contact();

                if (that._contacts && !forceServerSearch) {
                    contactFound = that._contacts.find((contact) => {
                        return contact.loginEmail===loginEmail;
                    });
                }

                if (contactFound) {
                    that._logger.log("internal", LOG_ID + "(getContactByLoginEmail) contact found locally : ", contactFound);
                    if (contactFound.id===connectedUser.id) {
                        resolve(connectedUser);
                    } else {
                        resolve(contactFound);
                    }
                } else {
                    that._logger.log("debug", LOG_ID + "(getContactByLoginEmail) contact not found locally. Ask server...");
                    that._rest.getContactInformationByLoginEmail(loginEmail).then(async (contactsFromServeur: [any]) => {
                        if (contactsFromServeur && contactsFromServeur.length > 0) {
                            let contact: Contact = null;
                            that._logger.log("info", LOG_ID + "(getContactByLoginEmail) contact found on server");
                            let _contactFromServer = contactsFromServeur[0];
                            if (_contactFromServer) {
                                // The contact is not found by email in the that._contacts tab, so it need to be find on server to get or update it.
                                await that.getContactById(_contactFromServer.id, true).then((contactInformation: Contact) => {
                                    contact = contactInformation;
                                    // Workaround because server does not return the email when not in same company, even if it has been found by email on server.
                                    if (!contact.loginEmail) {
                                        contact.loginEmail = loginEmail;
                                    }
                                    that._logger.log("internal", LOG_ID + "(getContactByLoginEmail) full data contact : ", contact, ", found on server with loginEmail : ", loginEmail);
                                    /*let contactIndex = that._contacts.findIndex((value) => {
                                        return value.jid_im === contactInformation.jid_im;
                                    });

                                    if (contactIndex !== -1) {
                                        contact = that._contacts[contactIndex];
                                    } else {
                                        contact = that.createBasicContact(contactInformation.jid_im, undefined);
                                    }
                                    //that._logger.log("internal", LOG_ID + "(getContactByLoginEmail) before updateFromUserData ", contact);
                                    contact.updateFromUserData(contactInformation);
                                    contact.avatar = that.getAvatarByContactId(contactInformation.id, contactInformation.lastAvatarUpdateDate);

                                     */
                                    if (contact.loginEmail===connectedUser.loginEmail) {
                                        contact.status = that._presenceService.getUserConnectedPresence().presenceStatus;
                                        contact.presence = that._presenceService.getUserConnectedPresence().presenceLevel;
                                    }
                                });
                            } else {
                                that._logger.log("internal", LOG_ID + "(getContactByLoginEmail) no contact found on server with loginEmail : ", loginEmail);
                            }
                            resolve(contact);
                        } else {
                            that._logger.log("internal", LOG_ID + "(getContactByLoginEmail) contact not found on server with loginEmail : ", loginEmail);
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
     * @method getMyInformations
     * @instance
     * @category Contacts INFORMATIONS
     * @description
     *  Get informations about the connected user <br>
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - Found informations or null or an error object depending on the result

     */
    getMyInformations(): Promise<Contact> {
        let that = this;
        return new Promise((resolve, reject) => {
                    that._logger.log("debug", LOG_ID + "(getMyInformations) Ask the server...");
                    that._rest.getMyInformations().then((_contactFromServer: any) => {
                        that._logger.log("internal", LOG_ID + "(getMyInformations) contact informations found on server : ", _contactFromServer);
                        resolve(_contactFromServer);
                    }).catch((err) => {
                        return reject(err);
                    });
        });
    }

    /**
     * @public
     * @method getCompanyInfos
     * @instance
     * @category Contacts INFORMATIONS
     * @param {string} companyId The company id
     * @param {string} format
     * @param {boolean} selectedThemeObj
     * @param {string} name
     * @param {string} status
     * @param {string} visibility
     * @param {string} organisationId
     * @param {boolean} isBP
     * @param {boolean} hasBP
     * @param {string} bpType
     * @description
     *  This API allows user to get a company data.<br> 
     *     **Users can only retrieve their own company and companies they can see** (companies with `visibility`=`public`, companies having user's companyId in `visibleBy` field, companies being in user's company organization and having `visibility`=`organization`, BP company of user's company).<br> 
     *     If user request his own company, `numberUsers` field is returned with the number of Rainbow users being in this company. <br>
     * @return {string} Contact avatar URL or file
     */
    getCompanyInfos(companyId? : string, format : string = "small", selectedThemeObj : boolean = false, name? : string, status? : string, visibility? : string, organisationId? : string, isBP? : boolean, hasBP? : boolean, bpType? : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            if (!companyId) {
                let connectedUser = that.getConnectedUser() ? that.getConnectedUser():new Contact();
                companyId = connectedUser.companyId;
            }

            that._logger.log("debug", LOG_ID + "(getCompanyInfos) companyId : ", companyId);
            
            that._rest.getCompanyInfos(companyId, format, selectedThemeObj, name, status, visibility, organisationId, isBP, hasBP, bpType ).then((result: any) => {
                that._logger.log("info", LOG_ID + "(getCompanyInfos) company informations found on server.");
                that._logger.log("internal", LOG_ID + "(getCompanyInfos) company informations found on server : ", result);
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method getAvatarByContactId
     * @instance
     * @category Contacts INFORMATIONS
     * @param {string} id The contact id
     * @param {string} lastAvatarUpdateDate use this field to give the stored date ( could be retrieved with contact.lastAvatarUpdateDate )
     *      if missing or null in case where no avatar available a local module file is provided instead of URL
     * @description
     *  Get a contact avatar by his contact id <br>
     * @return {string} Contact avatar URL or file
     */
    getAvatarByContactId(id : string, lastAvatarUpdateDate : string) : string {
        if (lastAvatarUpdateDate) {
            return this.avatarDomain + "/api/avatar/" + id + "?update=" + md5(lastAvatarUpdateDate);
        }
        return path.resolve(__dirname, "../resources/unknownContact.png");
    }

    /**
     * @public
     * @method getConnectedUser
     * @category Contacts INFORMATIONS
     * @instance
     * @description
     *    Get the connected user information <br>
     * @return {Contact} Return a Contact object representing the connected user information or null if not connected
     */
    getConnectedUser(): Contact {
        let that = this;
        if (!that._rest.account) {
            return null;
        }
        /*// Create the contact object
        let contact = new Contact();

        //that._logger.log("internal", LOG_ID + "(getContactById) before updateFromUserData ", contact);
        contact.updateFromUserData(that._rest.account);
        contact.avatar = that.getAvatarByContactId(that._rest.account.id, that._rest.account.lastAvatarUpdateDate);
        contact.status = that._presenceService.getUserConnectedPresence().presenceStatus;
        contact.presence = that._presenceService.getUserConnectedPresence().presenceLevel;
        // */

        // Create the contact object
        that.userContact.updateFromUserData(that._rest.account);
        that.userContact.avatar = that.getAvatarByContactId(that._rest.account.id, that._rest.account.lastAvatarUpdateDate);
        //that.userContact.status = that._presenceService.getUserConnectedPresence().presenceStatus;
        //that.userContact.presence = that._presenceService.getUserConnectedPresence().presenceLevel;

        return that.userContact;
    }

    /**
     * @public
     * @method getDisplayName
     * @instance
     * @category Contacts INFORMATIONS
     * @param {Contact} contact  The contact to get display name
     * @return {string} The contact first name and last name
     * @description
     *      Get the display name of a contact <br>
     */
    getDisplayName(contact : Contact) : string {
        return contact.firstName + " " + contact.lastName;
    }

    /**
     * @public
     * @method updateMyInformations
     * @instance
     * @category Contacts INFORMATIONS
     * @param {Object} dataToUpdate : 
     * { 
     * {string} number User phone number (as entered by user). Not mandatory if the PhoneNumber to update is a PhoneNumber linked to a system (pbx) Ordre de grandeur : 1..32 
     * {string} type 	String Phone number type Possible values : home, work, other
     * {string} deviceType 	String Phone number device type Possible values : landline, mobile, fax, other
     * {boolean} isVisibleByOthers optionnel 	Boolean Allow user to choose if the phone number is visible by other users or not. Note that administrators can see all the phone numbers, even if isVisibleByOthers is set to false. Note that phone numbers linked to a system (isFromSystem=true) are always visible, isVisibleByOthers can't be set to false for these numbers.
     * {string} shortNumber optionnel 	String [Only for update of PhoneNumbers linked to a system (pbx)] Short phone number (corresponds to the number monitored by PCG). Read only field, only used by server to find the related system PhoneNumber to update (couple shortNumber/systemId). Ordre de grandeur : 1..32
     * {string} systemId optionnel 	String [Only for update of PhoneNumbers linked to a system (pbx)] Unique identifier of the system in Rainbow database to which the system PhoneNumbers belong. Read only field, only used by server to find the related system PhoneNumber to update (couple shortNumber/systemId). Ordre de grandeur : 1..32
     * {string} internalNumber optionnel 	String [Only for update of PhoneNumbers linked to a system (pbx)] Internal phone number. Usable within a PBX group. By default, it is equal to shortNumber. Admins and users can modify this internalNumber field. internalNumber must be unique in the whole system group to which the related PhoneNumber belong (an error 409 is raised if someone tries to update internalNumber to a number already used by another PhoneNumber in the same system group). Ordre de grandeur : 1..32 
     * {Array<string>} emails optionnel 	Object Array of user emails addresses objects
     * {Array<string>} phoneNumbers optionnel 	Object[] Array of user PhoneNumbers objects Notes: Provided PhoneNumbers data overwrite previous values: PhoneNumbers which are not known on server side are added, PhoneNumbers which are changed are updated, PhoneNumbers which are not provided but existed on server side are deleted. This does not applies to PhoneNumbers linked to a system(pbx), which can only be updated (addition and deletion of system PhoneNumbers are ignored). When number is present, the server tries to compute the associated E.164 number (numberE164 field) using provided PhoneNumber country if available, user country otherwise. If numberE164 can't be computed, an error 400 is returned (ex: wrong phone number, phone number not matching country code, ...) PhoneNumber linked to a system (pbx) can also be updated. In that case, shortNumber and systemId of the existing system PhoneNumber must be provided with the fields to update (see example bellow).     * System phoneNumbers can't be created nor deleted using this API, only PCG can create/delete system PhoneNumbers.
     * {string} selectedTheme optionnel 	String Theme to be used by the user If the user is allowed to (company has 'allowUserSelectTheme' set to true), he can choose his preferred theme among the list of supported themes (see https://openrainbow.com/api/rainbow/enduser/v1.0/themes).
     * {string} firstName optionnel 	String User first name Ordre de grandeur : 1..255
     * {string} lastName optionnel 	String User last name Ordre de grandeur : 1..255
     * {string} nickName optionnel 	String User nickName Ordre de grandeur : 1..255
     * {string} title optionnel 	String User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...) Ordre de grandeur : 1..40
     * {string} jobTitle optionnel 	String User job title Ordre de grandeur : 1..255
     * {string} visibility optionnel 	String User visibility Define if the user can be searched by users being in other company and if the user can search users being in other companies. Visibility can be: same_than_company: The same visibility than the user's company's is applied to the user. When this user visibility is used, if the visibility of the company is changed the user's visibility will use this company new visibility. public: User can be searched by external users / can search external users. User can invite external users / can be invited by external users private: User can't be searched by external users / can search external users. User can invite external users / can be invited by external users closed: User can't be searched by external users / can't search external users. User can invite external users / can be invited by external users isolated: User can't be searched by external users / can't search external users. User can't invite external users / can't be invited by external users none: Default value reserved for guest. User can't be searched by any users (even within the same company) / can search external users. User can invite external users / can be invited by external users External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company. Default value : same_than_company Possible values : same_than_company, public, private, closed, isolated, none
     * {boolean} isInitialized optionnel 	Boolean Is user initialized
     * {string} timezone optionnel 	String User timezone name Allowed values: one of the timezone names defined in IANA tz database Timezone name are composed as follow: Area/Location (ex: Europe/Paris, America/New_York,...)
     * {string} language optionnel 	String User language Language format is composed of locale using format ISO 639-1, with optionally the regional variation using ISO 3166‑1 alpha-2 (separated by hyphen). Locale part is in lowercase, regional part is in uppercase. Examples: en, en-US, fr, fr-FR, fr-CA, es-ES, es-MX, ... More information about the format can be found on this link. Ordre de grandeur : 2|5
     * {string} state optionnel 	String When country is 'USA' or 'CAN', a state can be defined. Else it is not managed (null).
     * {string} country optionnel 	String User country (ISO 3166-1 alpha3 format) Ordre de grandeur : 3
     * {string} department optionnel 	String User department Ordre de grandeur : 1..255
     * {string} email 	String User email address Ordre de grandeur : 3..255
     * {string} country optionnel 	String Phone number country (ISO 3166-1 alpha3 format). country field is automatically computed using the following algorithm when creating/updating a phoneNumber entry: If number is provided and is in E164 format, country is computed from E164 number Else if country field is provided in the phoneNumber entry, this one is used Else user country field is used Note that in the case number field is set (but not in E164 format), associated numberE164 field is computed using phoneNumber'country field. So, number and country field must match so that numberE164 can be computed. Ordre de grandeur : 3
     * {string} type 	String User email type Possible values : home, work, other
     * {string} customData optionnel 	Object User's custom data. Object with free keys/values. It is up to the client to manage the user's customData (new customData provided overwrite the existing one). Restrictions on customData Object: max 20 keys, max key length: 64 characters, max value length: 4096 characters. User customData can only be created/updated by: the user himself `company_admin` or `organization_admin` of his company, `bp_admin` and `bp_finance` of his company, `superadmin`.
     * }
     * 
     * @return {string} The contact first name and last name
     * @description
     *          This API can be used to update data of logged in user. This API can only be used by user himself (i.e. userId of logged in user = value of userId parameter in URL)
     */
    updateMyInformations(dataToUpdate) : Promise<any> {
        let that = this;

        that._logger.log("internal", LOG_ID + "(updateMyInformations) parameters : dataToUpdate : ", dataToUpdate);

        return new Promise(function (resolve, reject) {
            try {
                if (!dataToUpdate) {
                    that._logger.log("error", LOG_ID + "(updateMyInformations) bad or empty 'dataToUpdate' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                let meId = that._rest.account.id; 
                
                that._rest.updateEndUserInformations(meId, dataToUpdate).then((result) => {
                    that._logger.log("internal", LOG_ID + "(updateMyInformations) Successfully result : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(updateMyInformations) Error when updating informations.");
                    that._logger.log("internalerror", LOG_ID + "(updateMyInformations) Error : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(updateMyInformations) error : ", err);
                return reject(err);
            }
        });
    }
    
    //endregion Contacts INFORMATIONS

    // ************************************************** //
    // **  jid utilities                               ** //
    // ************************************************** //
    isTelJid(jid) {
        return (jid.indexOf("tel_")===0);
    }

    getImJid(jid) {
        let that = this;
        let bareJid = XMPPUTils.getXMPPUtils().getBareJIDFromFullJID(jid);
        return that.isTelJid(bareJid) ? bareJid.substring(4):bareJid;
    }

    getRessourceFromJid(jid) {
        let result = "";
        if (jid) {
            let index: number = jid.indexOf("/");
            if (-1!==index) {
                result = jid.substr(index + 1);
            }
        }
        return result;
    }

    isUserContactJid(jid) {
        let that = this;
        if (!that._rest.account) {
            return false;
        }
        return (that._rest.account.jid_im===jid);
    }

    isUserContact(contact: Contact) {
        let that = this;
        if (!contact || !contact.jid) {
            return false;
        }
        if (!that._rest.account) {
            return (contact.jid===that._xmpp.jid);
        }
        return (that._rest.account.jid===contact.jid);
    }

    //region Contacts NETWORK

    /**
     * @public
     * @method getRosters
     * @instance
     * @category Contacts NETWORK
     * @description
     *      Get the list of _contacts that are in the user's network (aka rosters) <br>
     * @async
     * @return {Promise<Array<Contact>,ErrorManager>}
     * @fulfil {ErrorManager} - ErrorManager object depending on the result (ErrorManager.getErrorManager().OK in case of success)

     */
    getRosters() : Promise<Array<Contact>> {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.getContacts().then((listOfContacts: any) => {
                if (! that._contacts) {
                    that._contacts = [];
                }

                listOfContacts.forEach((contactData: any) => {
                    let contactIndex = that._contacts.findIndex((_contact: any) => {
                        return _contact.jid_im===contactData.jid_im;
                    });
                    if (contactIndex === -1) {
                        if (that._contacts[contactIndex]) {
                            that._contacts[contactIndex].roster = false;
                        }
                    }
                });

                listOfContacts.forEach((contactData: any) => {
                    that._rest.getContactInformationByJID(contactData.jid_im).then((_contactFromServer: any) => {
                        that._logger.log("info", LOG_ID + "(_onRosterContactInfoChanged) contact found on the server");
                        that._logger.log("internal", LOG_ID + "(_onRosterContactInfoChanged) contact found on the server : ", util.inspect(_contactFromServer));
                        // Update or Add contact
                        let contactIndex = that._contacts.findIndex((_contact: any) => {
                            return _contact.jid_im===_contactFromServer.jid_im;
                        });

                        let contact = null;
                        //that._logger.log("internal", LOG_ID + "(_onRosterContactInfoChanged) contact found on the server : ", contact);

                        if (contactIndex!== -1) {
                            contact = that._contacts[contactIndex];
                            //that._logger.log("internal", LOG_ID + "(_onRosterContactInfoChanged) local contact before updateFromUserData ", contact);
                            contact.updateFromUserData(_contactFromServer);
                            contact.avatar = that.getAvatarByContactId(_contactFromServer.id, _contactFromServer.lastAvatarUpdateDate);

                            // this._eventEmitter.emit("evt_internal_contactinformationchanged", that._contacts[contactIndex]);
                        } else {
                            contact = that.createBasicContact(_contactFromServer.jid_im, undefined);
                            //that._logger.log("internal", LOG_ID + "(_onRosterContactInfoChanged) from server contact before updateFromUserData ", contact);
                            contact.updateFromUserData(_contactFromServer);
                            contact.roster = true;
                            contact.avatar = that.getAvatarByContactId(_contactFromServer.id, _contactFromServer.lastAvatarUpdateDate);

                            // this._eventEmitter.emit("evt_internal_contactinformationchanged", contact);
                        }


                    }).catch((err) => {
                        this._logger.log("info", LOG_ID + "(getRosters) no contact found with contactData.jid_im " + contactData.jid_im);
                    });
                });

                resolve(that._contacts.filter((contact) => { return contact.roster === true; }));
                /*
                
                that._contacts = [];
                listOfContacts.forEach((contactData: any) => {
                    // Create the contact object
                    let contact = new Contact();
                    Object.assign(contact, contactData);
                    // that._logger.log("internal", LOG_ID + "(getRosters) before updateFromUserData ", contact);
                    contact.updateFromUserData(contactData);
                    contact.roster = true;
                    contact.avatar = that.getAvatarByContactId(contact.id, contact.lastAvatarUpdateDate);
                    // Append in contact list
                    // that._contacts[contact.id] = contact;
                    that._contacts.push(contact);
                });
                that._logger.log("internal", LOG_ID + "(getRosters) get rosters successfully : ", that._contacts);

                that._logger.log("info", LOG_ID + "(getRosters) get rosters successfully");
                resolve(that.getAll());
                // */
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(getRosters) error");
                that._logger.log("internalerror", LOG_ID + "(getRosters) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @since 1.17
     * @method addToNetwork
     * @instance
     * @category Contacts NETWORK
     * @description
     *    Send an invitation to a Rainbow user for joining his network. <br>
     *    The user will receive an invitation that can be accepted or declined <br>
     *    In return, when accepted, he will be part of your network <br>
     *    When in the same company, invitation is automatically accepted (ie: can't be declined) <br>
     * @param {Contact} contact The contact object to subscribe
     * @return {Promise<Contact>} A promise that contains the contact added or an object describing an error
     */
    addToNetwork(contact: Contact) : Promise<Contact>{
        return this.addToContactsList(contact);
    }

    /**
     * @public
     * @since 1.17
     * @method addToContactsList
     * @instance
     * @category Contacts NETWORK
     * @description
     *    Send an invitation to a Rainbow user for joining his network. <br>
     *    The user will receive an invitation that can be accepted or declined <br>
     *    In return, when accepted, he will be part of your network <br>
     *    When in the same company, invitation is automatically accepted (ie: can't be declined) <br>
     * @param {Contact} contact The contact object to subscribe
     * @return {Promise<Contact>} A promise that contains the contact added or an object describing an error

     */
    addToContactsList(contact: Contact) : Promise<Contact>{
        let that = this;

        return new Promise((resolve, reject) => {
            if (!contact) {
                this._logger.log("warn", LOG_ID + "(addToContactsList) bad or empty 'contact' parameter");
                this._logger.log("internalerror", LOG_ID + "(addToContactsList) bad or empty 'contact' parameter : ", contact);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else {

                that._logger.log("internal", LOG_ID + "(addToContactsList) contact invitation to server... : ", contact);
                that._rest.joinContactInvitation(contact).then((_contact: any) => {
                    if (_contact && _contact.status!==undefined) {
                        that._logger.log("info", LOG_ID + "(addToContactsList) contact invited : ", _contact.invitedUserId);
                        that.getContactById(_contact.invitedUserId, false).then((invitedUser) => {
                            resolve(invitedUser);
                        }).catch((err) => {
                            return reject(err);
                        });
                    } else {
                        that._logger.log("internalerror", LOG_ID + "(addToContactsList) contact cannot be added : ", util.inspect(contact));
                        resolve(null);
                    }
                }).catch((err) => {
                    that._logger.log("internalerror", LOG_ID + "(addToContactsList) contact cannot be added : ", util.inspect(contact));
                    return reject(err);
                });
            }
        });
    }

    /**
     * @public
     * @method removeFromNetwork
     * @since 1.69
     * @instance
     * @category Contacts NETWORK
     * @description
     *    Remove a contact from the list of contacts and unsubscribe to the contact's presence <br>
     * @param {Contact} contact The contact object to unsubscribe
     * @returns {Promise} A promise that contains success code if removed or an object describing an error
     */
    removeFromNetwork(contact) {
        let that = this;

        return new Promise((resolve, reject) => {
            if (!contact) {
                this._logger.log("warn", LOG_ID + "(removeFromNetwork) bad or empty 'contact' parameter");
                this._logger.log("internalerror", LOG_ID + "(removeFromNetwork) bad or empty 'contact' parameter : ", contact);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.removeContactFromRoster(contact.id).then(function () {
                that._logger.log("info", LOG_ID + "(removeFromNetwork) contact removed from network.");
                that._logger.log("internal", LOG_ID + "(removeFromNetwork) contact removed from network : ", contact);
                return resolve({
                    code: 1,
                    label: "OK"
                });
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(removeFromNetwork) contact cannot be removed.");
                that._logger.log("internalerror", LOG_ID + "(removeFromNetwork) contact cannot be removed : ", util.inspect(contact));
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @since 1.64.0
     * @method getInvitationById
     * @instance
     * @category Contacts NETWORK
     * @description
     *    Get an invite by its id <br>
     * @param {string} strInvitationId the id of the invite to retrieve
     * @return {Invitation} The invite if found
     */
    async getInvitationById(strInvitationId : string) {
        if (!strInvitationId) {
            this._logger.log("warn", LOG_ID + "(getInvitationById) bad or empty 'strInvitationId' parameter");
            this._logger.log("internalerror", LOG_ID + "(getInvitationById) bad or empty 'strInvitationId' parameter : ", strInvitationId);
            let error = ErrorManager.getErrorManager().BAD_REQUEST;
            error.msg += ", invitation not defined, can not getInvitationById";
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return this._invitationsService.getInvitation(strInvitationId);
    };

    /**
     * @public
     * @since 1.17
     * @method acceptInvitation
     * @instance
     * @category Contacts NETWORK
     * @description
     *    Accept an invitation from an other Rainbow user to mutually join the network <br>
     *    Once accepted, the user will be part of your network. <br>
     *    Return a promise <br>
     * @param {Invitation} invitation The invitation to accept
     * @return {Object} A promise that contains SDK.OK if success or an object that describes the error
     */
    async acceptInvitation(invitation : Invitation) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(acceptInvitation) invitation : ", invitation);
        if (!invitation) {
            let error = ErrorManager.getErrorManager().BAD_REQUEST;
            error.msg += ", invitation not defined, can not acceptInvitation";
            throw error;
        } else {
            return that._invitationsService.acceptInvitation(invitation);
            //return that._rest.acceptInvitation(invitation);
        }
    };

    /**
     * @public
     * @since 1.17
     * @method declineInvitation
     * @instance
     * @category Contacts NETWORK
     * @description
     *    Decline an invitation from an other Rainbow user to mutually join the network <br>
     *    Once declined, the user will not be part of your network. <br>
     *    Return a promise <br>
     * @param {Invitation} invitation The invitation to decline
     * @return {Object} A promise that contains SDK.OK in case of success or an object that describes the error
     */
    declineInvitation(invitation : Invitation) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(declineInvitation) intivation : ", invitation);
        if (!invitation) {
            let error = ErrorManager.getErrorManager().BAD_REQUEST;
            error.msg += ", invitation not defined, can not declineInvitation";
            throw error;
        } else {
            return that._invitationsService.declineInvitation(invitation);
            //return that._rest.declineInvitation(invitation);
        }

    };


    /**
     * @public
     * @since 1.41
     * @beta
     * @method joinContacts
     * @instance
     * @category Contacts NETWORK
     * @description
     *    As admin, add _contacts to a user roster <br>
     * @param {Contact} contact The contact object to subscribe
     * @param {Array<string>} contactIds List of contactId to add to the user roster
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {any} - Join result or an error object depending on the result
     */
    joinContacts(contact: Contact, contactIds : Array<string>) {
        let that = this;

        return new Promise((resolve, reject) => {
            if (!contact) {
                this._logger.log("warn", LOG_ID + "(joinContacts) bad or empty 'contact' parameter");
                this._logger.log("internalerror", LOG_ID + "(joinContacts) bad or empty 'contact' parameter : ", contact);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else {
                that._logger.log("debug", LOG_ID + "(joinContacts) contact join to server...");
                let promises = [];
                contactIds.forEach((contactId) => {
                    promises.push(that._rest.joinContacts(contact, [contactId], false).then((result) => {
                        return Promise.resolve({"success": [contactId]});
                    }).catch((err: any) => {
                        if (err.code===409) {
                            resolve({"success": [contactId]});
                        }
                        resolve({"failed": [contactId]});
                    }));
                });

                Promise.all(promises).then((values) => {
                    let mergeResult = values.reduce((prev, current) => {
                        // noinspection JSDeepBugsSwappedArgs
                        return Object.assign(prev, current);
                    }, {"success": [], "failed": []});

                    that._logger.log("internal", LOG_ID + "(joinContacts) " + mergeResult.success.length + " contact(s) joined, " + mergeResult.failed.length + " contact(s) failed ");
                    resolve(mergeResult);
                }).catch((err) => {
                    return reject(err);
                });
            }
        });
    }

    //endregion Contacts NETWORK

    //region Contacts Search

    /**
     * @public
     * @method searchInAlldirectories
     * @since 2.8.9
     * @instance
     * @category Contacts Search
     * @description
     * This API allows to search for resources matching given keywords. <br>
     * Depending on the provided query parameters, search can be done: <br>
     *   * on shortNumber
     *   * on numberE164
     * <br>
     * <br>
     * For both cases, systemId or pbxId must be provided, corresponding to the identifier of the system for which the search is requested. <br>
     * <br>
     * This API tries to find a resource in the directories: 
     *   * PBX devices of the system for which the search is requested, if associated to a Rainbow user (PBX devices of all systems belonging to the system's group if applicable),
     *   * phonebook of the system for which the search is requested (phonebooks of all systems belonging to the system's group if applicable),
     *   * Office365 database associated to the company(ies) to which is(are) linked the system for which the search is requested,
     *   * Business directory database associated to the company(ies) to which is(are) linked the system for which the search is requested.
     *    <br>   
     * If several entries match in several directories, the order defined in searchResultOrder setting of the system is applied. <br>
     *    <br>
     * @return {Promise<any>} An object of the result
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | firstName | String | First name as it is present in one directory (either phonebbok,user or ActiveDirectory) |
     * | lastName | String | Last name as it is present in one directory (either phonebbok,user or ActiveDirectory) |
     * | id  | String | id of the user (if a user is found) |
     * | jid_im | String | jid_im of the user (if a user is found) |
     *
     * @param {string} pbxId pbxId of the system for which the search is requested. One of systemId or pbxId is mandatory.
     * @param {string} systemId identifier of the system for which the search is requested. One of systemId or pbxId is mandatory.
     * @param {string} numberE164 Allows to filter users list on the numberE164 provided in this option.
     * @param {string} shortnumber Allows to filter users list on the phone short number provided in this option.
     * @param {string} format Allows to retrieve more or less phone book details in response. small: id, firstName, lastName, number. medium: id, firstName, lastName, number. full: id, firstName, lastName, number. Default value : small Possible values : small, medium, full.
     * @param {number} limit Allow to specify the number of phone book entries to retrieve. Default value : 100
     * @param {number} offset Allow to specify the position of first phone book entry to retrieve (first entry if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort phone book list based on the given field. Default value : reverseDisplayName
     * @param {number} sortOrder Specify order when sorting phone book list. Default value : 1. Possible values : -1, 1.
     */
    searchInAlldirectories (pbxId? : string, systemId? : string, numberE164? : string, shortnumber? : string, format : string = "small", limit : number = 100, offset? : number, sortField : string = "reverseDisplayName", sortOrder : number = 1) {
        let that = this;

        return new Promise((resolve, reject) => {

            that._rest.searchInAlldirectories (pbxId, systemId, numberE164, shortnumber, format, limit, offset, sortField, sortOrder) .then(function (result) {
                that._logger.log("info", LOG_ID + "(searchInAlldirectories) contact searched from server.");
                that._logger.log("internal", LOG_ID + "(searchInAlldirectories) REST result : ", result);
                return resolve(result);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(searchInAlldirectories) failed.");
                that._logger.log("internalerror", LOG_ID + "(searchInAlldirectories) failed : ", err);
                return reject(err);
            });
        });
    }
    
    /**
     * @public
     * @method searchInPhonebook
     * @since 2.8.9
     * @instance
     * @category Contacts Search
     * @description
     * This API allows to search for resources matching given keywords.The search is done on name and phone number. <br>
     * Search can be: <br>
     *   - on name: <br>
     *      * keywords exact match (ex: 'John Doe' find 'John Doe')
     *      * keywords partial match (ex: 'Jo Do' find 'John Doe')
     *      * case insensitive (ex: 'john doe' find 'John Doe')
     *      * accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
     *      * on only firstname or lastname (ex: 'john' find 'John Doe')
     *      * order firstname / lastname does not matter (ex: 'doe john' find 'John Doe')
     *   - on number: <br>
     *      * keywords exact match (ex: '0630594224' finds '0630594224' but NOT '+33630594224')
     * <br>
     * In case of user requesting the API, the search is done on user's system phonebook. <br>
     * In case of PCG requesting the API, pbxId parameter is mandatory and the search is done on related system phonebook. <br>
     *  <br>
     * **Specific feature:** Sharing a system between several companies <br>
     * Since 1.47.0 release, configuring companies sharing a multi-tenant system is possible. <br>
     * An OXE can be multi-company. <br>
     * A multi-tenant system, so called CENTREX, allows sharing a call-server between several entities. <br>
     * Each company in this multi-tenant system has his own range of phone number. Each company has a company prefix named 'tenantCallNumber' in the companies data model <br>
     *    <br>
     *   - Company A - 8210xxxx (82103000 Alice, 82103001 Bob)
     *   - Company B - 8211xxxx (82113001 Carol)
     *    <br>
     *   Carol can't search Alice by name because her phone number begins by a wrong company prefix.
     *   Carol can't search Bob by number because her phone number begins by a wrong company prefix.".
     *   In case of inconsistent configuration, an HTTP error 409210 is thrown.
     *    <br>
     * @return {Promise<any>} An object of the result
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | phone book id |
     * | firstName | String | First name as it is present in the phone book |
     * | lastName | String | Last name as it is present in the phone book |
     * | number | String | Phone number as it is present in the phone book |
     *
     * @param {string} pbxId Mandatory if role is pcg.
     * @param {string} name Allows to filter users list on the given keyword(s) provided in this option.
     * @param {string} number Allows to filter users list on the phone number provided in this option.
     * @param {string} format Allows to retrieve more or less phone book details in response. small: id, firstName, lastName, number. medium: id, firstName, lastName, number. full: id, firstName, lastName, number. Default value : small Possible values : small, medium, full.
     * @param {number} limit Allow to specify the number of phone book entries to retrieve. Default value : 100
     * @param {number} offset Allow to specify the position of first phone book entry to retrieve (first entry if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort phone book list based on the given field. Default value : reverseDisplayName
     * @param {number} sortOrder Specify order when sorting phone book list. Default value : 1. Possible values : -1, 1.
     */
    searchInPhonebook (pbxId : string, name : string, number : string, format : string, limit : number = 100, offset : number, sortField : string, sortOrder : number = 1) {
        let that = this;

        return new Promise((resolve, reject) => {

            that._rest.searchInPhonebook (pbxId, name, number, format, limit, offset, sortField, sortOrder ).then(function (result) {
                that._logger.log("info", LOG_ID + "(searchInPhonebook) contact searched from server.");
                that._logger.log("internal", LOG_ID + "(searchInPhonebook) REST result : ", result);
                return resolve(result);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(searchInPhonebook) failed.");
                that._logger.log("internalerror", LOG_ID + "(searchInPhonebook) failed : ", err);
                return reject(err);
            });
        });
    }
     
    /**
     * @public
     * @method searchUserByPhonenumber
     * @since 2.8.9
     * @instance
     * @category Contacts Search
     * @description
     * This API allows to search user being associated to the requested number. <br>
     * The algorithm of this API is the following: <br>
     *   * The API first search if the provided number matches one belonging to the pbx group of logged in user's pbx and being affected to a Rainbow user.
     *   * Otherwise, the API search for users having the provided E164 number filled in their profile (only if setting isVisibleByOthers related to this number is not set to false). The API returns the result only if found user is in the same company or organisation than the logged in user's.
     * If several numbers match, the first one found is returned. <br>
     *    <br>
     * @return {Promise<any>} An object of the result
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | User unique identifier |
     * | firstName | String | User first name |
     * | lastName | String | User last name |
     * | jid_im | String | User Jabber IM identifier |
     * | companyId | String | User company unique identifier |
     * | companyName | String | User company name |
     * | organisationId | String | User organisation unique identifier |
     * | lastAvatarUpdate | Date-Time | Date Date of last user avatar create/update, null if no avatar |
     * | lastUpdateDate | Date-Time | Date of last user create/update |
     * | guestMode | Boolean | Indicates a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration. |
     * | fileSharingCustomisation | String | Activate/Deactivate file sharing capability per user  <br>Define if the user can use the file sharing service.  <br>FileSharingCustomisation can be:<br><br>* `enabled`: The user can use the file sharing service.<br>* `disabled`: The user can't use the file sharing service. |
     * | fileStorageCustomisation | String | Activate/Deactivate the capability for a user to access to Rainbow file storage.  <br>Define if a user has the right to upload/download/copy or share documents.  <br>fileStorageCustomisation can be:<br><br>* `enabled`: The user can manage and share files.<br>* `disabled`: The user can't manage and share files. |
     * | useRoomCustomisation | String | Activate/Deactivate the capability for a user to use bubbles.  <br>Define if a user can create bubbles or participate in bubbles (chat and web conference).  <br>useRoomCustomisation can be:<br><br>* `enabled`: The user can use bubbles.<br>* `disabled`: The user can't use bubbles. |
     * | phoneMeetingCustomisation | String | Activate/Deactivate the capability for a user to use phone meetings (PSTN conference).  <br>Define if a user has the right to join phone meetings.  <br>phoneMeetingCustomisation can be:<br><br>* `enabled`: The user can join phone meetings.<br>* `disabled`: The user can't join phone meetings. |
     * | useChannelCustomisation | String | Activate/Deactivate the capability for a user to use a channel.  <br>Define if a user has the right to create channels or be a member of channels.  <br>useChannelCustomisation can be:<br><br>* `enabled`: The user can use some channels.<br>* `disabled`: The user can't use some channel. |
     * | useScreenSharingCustomisation | String | Activate/Deactivate the capability for a user to share a screen.  <br>Define if a user has the right to share his screen.  <br>useScreenSharingCustomisation can be:<br><br>* `enabled`: Each user of the company can share his screen.<br>* `disabled`: No user of the company can share his screen. |
     * | useWebRTCVideoCustomisation | String | Activate/Deactivate the capability for a user to switch to a Web RTC video conversation.  <br>Define if a user has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call).  <br>useWebRTCVideoCustomisation can be:<br><br>* `enabled`: The user can switch to a Web RTC video conversation.<br>* `disabled`: The user can't switch to a Web RTC video conversation. |
     * | useWebRTCAudioCustomisation | String | Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation.  <br>Define if a user has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call).  <br>useWebRTCAudioCustomisation can be:<br><br>* `enabled`: The user can switch to a Web RTC audio conversation.<br>* `disabled`: The user can't switch to a Web RTC audio conversation. |
     * | instantMessagesCustomisation | String | Activate/Deactivate the capability for a user to use instant messages.  <br>Define if a user has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications.  <br>instantMessagesCustomisation can be:<br><br>* `enabled`: The user can use instant messages.<br>* `disabled`: The user can't use instant messages. |
     * | isTerminated | Boolean | Indicates if the user account has been deleted. |
     *
     * @param {number} number number to search. The number can be: <br>
     *      - a system phone number being in the pbx group of logged in user's pbx <br>
     *      - a phone number entered manually by a user in his profile and being in the same organisation than logged in user's (in that case, provided number must be in E164 format) <br>
     *      
     */
    searchUserByPhonenumber(number : number ){
        let that = this;

        return new Promise((resolve, reject) => {
            
            that._rest.searchUserByPhonenumber(number).then(function (result) {
                that._logger.log("info", LOG_ID + "(searchUserByPhonenumber) contact searched from server.");
                that._logger.log("internal", LOG_ID + "(searchUserByPhonenumber) REST result : ", result);
                return resolve(result);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(searchUserByPhonenumber) failed.");
                that._logger.log("internalerror", LOG_ID + "(searchUserByPhonenumber) failed : ", err);
                return reject(err);
            });
        });
    }
    
    /**
     * @public
     * @method searchUsers
     * @since 2.8.9
     * @instance
     * @category Contacts Search
     * @description
     *
     * This API allows to search users.
     * Two type of searches are available:
     * * Search on displayName (query parameter `displayName`):
     *      - The search is done on users' `firstName` and `lastName`, and search is done in all Rainbow public users and users being in companies visible by logged in user's company.
     *      - If logged in user's has visibility `closed` or `isolated`, or `same_than_company` and logged in user's company has visibility `closed` or `isolated`, search is done only on users being in companies visible by logged in user's company.
     *      - Search on display name can be:
     *          * firstName and lastName exact match (ex: 'John Doe' find 'John Doe')
     *          * partial match (ex: 'Jo Do' find 'John Doe')
     *          * case insensitive (ex: 'john doe' find 'John Doe')
     *          * accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
     *          * on only firstname or lastname (ex: 'john' find 'John Doe')
     *          * order firstname / lastname does not matter (ex: 'doe john' find 'John Doe')
     *      - It is possible to specify on which company(ies) users are searched (using `companyId` query parameter)
     *      - It is possible to exclude users from some company(ies) in the search (using `excludeCompanyId` query parameter)
     * * Multi-criterion search (query parameter `search`):
     *      - Multi criterion search is only available to users having feature `SEARCH_BY_TAGS` in their profiles,
     *      - Multi criterion allows to search users based on their fields `firstName`, `lastName`, `jobTitle`, `department`, `companyName` and `tags`.
     *          * Multi criterion search is limited to users belonging to logged in user's company or users being in a company that belongs to the same organization.
     *          * For other users which does not belong to the same company or organisation (Rainbow public users and users being in companies visible by logged in user's company outside the organisation), the search is only done on users' `firstName` and `lastName`. If logged in user's has visibility `closed` or `isolated` (or `same_than_company` and logged in user's company has visibility `closed` or `isolated`), search on `firstName`/`lastName` is done only on users being in companies visible by logged in user's company (similar behavior than search with query parameter displayName).
     *      - Provided search tags can be a single word or composed of several words separated by spaces.
     *      - Only users matching all provided search tags in their fields `firstName`, `lastName`, `jobTitle`,`department`, `companyName` and/or `tags` (or `firstName` and/or `lastName` for users outside the logged in user company/organisation) will be returned in the results.
     *      - Matching of the search tags is done from the start of the word, case is insensitive and special characters are ignored.
     *      - Example, consider a user as follow:
     *    <br>
     *  { <br>
     * firstName: 'John', <br>
     * lastName: 'Doe', <br>
     * companyName: 'Alcatel-Lucent International', <br>
     * jobTitle: 'Sales Representative', <br>
     * department: 'Sales', <br>
     * tags: \['Healthcare', 'Hospitality'\] <br>
     * } <br>
     *    <br>
     *  - This user can be found with the following search tags:
     *      * exact match (ex: 'John Doe', 'John Sales Representative', 'John Healthcare', ...)
     *      * partial match (ex: 'Jo Do', 'Jo Sales', 'Jo Health', 'Do Alcatel', ...)
     *      * case insensitive (ex: 'john doe', 'john sales', 'john hospitality', 'doe alcatel', ...)
     *      * on only one field (ex: 'doe', 'sales', 'healthcare')
     *      * order does not matter (ex: 'doe john', 'sales alcatel', 'healthcare sales john', ...)
     *  - It is possible to specify on which company(ies) users are searched (using companyId query parameter)
     *  - It is possible to exclude users from some company(ies) in the search (using excludeCompanyId query parameter)
     *    <br>
     * One of `displayName` or `search` parameters must be provided to execute the search request.
     *    <br>
     * @return {Promise<any>} An object of the result
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | limit | Number | Number of requested items |
     * | offset | Number | Requested position of the first item to retrieve |
     * | total | Number | Total number of items |
     * | data | Object\[\] | List of user Objects. |
     * | id  | String | User unique identifier |
     * | loginEmail | String | User email address (used for login)  <br>`loginEmail` field is only returned for users being in the same company than logged in user and not being in the default Rainbow company. |
     * | firstName | String | User first name |
     * | lastName | String | User last name |
     * | jid_im | String | User Jabber IM identifier |
     * | companyId | String | User company unique identifier |
     * | companyName | String | User company name |
     * | jobTitle optionnel | String | User job title.  <br>Only returned if search is requested using `search` parameter and found user is in the same company or organisation than logged in user. |
     * | tags optionnel | String\[\] | Tags associated to the user by an administrator.  <br>Only returned if search is requested using `search` parameter and found user is in the same company or organisation than logged in user. |
     * | lastAvatarUpdate | Date-Time | Date Date of last user avatar create/update, null if no avatar |
     * | lastUpdateDate | Date-Time | Date of last user create/update |
     * | guestMode | Boolean | Indicated a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration. |
     * | fileSharingCustomisation | String | Activate/Deactivate file sharing capability per user  <br>Define if the user can use the file sharing service.  <br>FileSharingCustomisation can be:<br><br>* `enabled`: The user can use the file sharing service.<br>* `disabled`: The user can't use the file sharing service. |
     * | fileStorageCustomisation | String | Activate/Deactivate the capability for a user to access to Rainbow file storage.  <br>Define if a user has the right to upload/download/copy or share documents.  <br>fileStorageCustomisation can be:<br><br>* `enabled`: The user can manage and share files.<br>* `disabled`: The user can't manage and share files. |
     * | useRoomCustomisation | String | Activate/Deactivate the capability for a user to use bubbles.  <br>Define if a user can create bubbles or participate in bubbles (chat and web conference).  <br>useRoomCustomisation can be:<br><br>* `enabled`: The user can use bubbles.<br>* `disabled`: The user can't use bubbles. |
     * | phoneMeetingCustomisation | String | Activate/Deactivate the capability for a user to use phone meetings (PSTN conference).  <br>Define if a user has the right to join phone meetings.  <br>phoneMeetingCustomisation can be:<br><br>* `enabled`: The user can join phone meetings.<br>* `disabled`: The user can't join phone meetings. |
     * | useChannelCustomisation | String | Activate/Deactivate the capability for a user to use a channel.  <br>Define if a user has the right to create channels or be a member of channels.  <br>useChannelCustomisation can be:<br><br>* `enabled`: The user can use some channels.<br>* `disabled`: The user can't use some channel. |
     * | useScreenSharingCustomisation | String | Activate/Deactivate the capability for a user to share a screen.  <br>Define if a user has the right to share his screen.  <br>useScreenSharingCustomisation can be:<br><br>* `enabled`: Each user of the company can share his screen.<br>* `disabled`: No user of the company can share his screen. |
     * | useWebRTCVideoCustomisation | String | Activate/Deactivate the capability for a user to switch to a Web RTC video conversation.  <br>Define if a user has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call).  <br>useWebRTCVideoCustomisation can be:<br><br>* `enabled`: The user can switch to a Web RTC video conversation.<br>* `disabled`: The user can't switch to a Web RTC video conversation. |
     * | useWebRTCAudioCustomisation | String | Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation.  <br>Define if a user has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call).  <br>useWebRTCAudioCustomisation can be:<br><br>* `enabled`: The user can switch to a Web RTC audio conversation.<br>* `disabled`: The user can't switch to a Web RTC audio conversation. |
     * | instantMessagesCustomisation | String | Activate/Deactivate the capability for a user to use instant messages.  <br>Define if a user has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications.  <br>instantMessagesCustomisation can be:<br><br>* `enabled`: The user can use instant messages.<br>* `disabled`: The user can't use instant messages. |
     * | isTv | Boolean | True if it is a TV user |
     * | isAlertNotificationEnabled | Boolean | True if user is to subscribed to Alert Offer |
     * | phoneNumbers | Object\[\] | Array of user phone numbers objects.  <br>Phone number objects can:<br><br>* be created by user (information filled by user),<br>* come from association with a system (pbx) device (association is done by admin). |
     * | phoneNumberId | String | Phone number unique id in phone-numbers directory collection. |
     * | number optionnel | String | User phone number (as entered by user) |
     * | numberE164 optionnel | String | User E.164 phone number, computed by server from `number` and `country` fields |
     * | country | String | Phone number country (ISO 3166-1 alpha3 format)  <br>`country` field is automatically computed using the following algorithm when creating/updating a phoneNumber entry:<br><br>* If `number` is provided and is in E164 format, `country` is computed from E164 number<br>* Else if `country` field is provided in the phoneNumber entry, this one is used<br>* Else user `country` field is used |
     * | isFromSystem optionnel | Boolean | Boolean indicating if phone is linked to a system (pbx). |
     * | shortNumber optionnel | String | **\[Only for phone numbers linked to a system (pbx)\]**  <br>If phone is linked to a system (pbx), short phone number (corresponds to the number monitored by PCG).  <br>Only usable within the same PBX.  <br>Only PCG can set this field. |
     * | internalNumber optionnel | String | **\[Only for phone numbers linked to a system (pbx)\]**  <br>If phone is linked to a system (pbx), internal phone number.  <br>Usable within a PBX group.  <br>Admins and users can modify this internalNumber field. |
     * | systemId optionnel | String | **\[Only for phone numbers linked to a system (pbx)\]**  <br>If phone is linked to a system (pbx), unique identifier of that system in Rainbow database. |
     * | pbxId optionnel | String | **\[Only for phone numbers linked to a system (pbx)\]**  <br>If phone is linked to a system (pbx), unique identifier of that pbx. |
     * | type | String | Phone number type, one of `home`, `work`, `other`. |
     * | deviceType | String | Phone number device type, one of `landline`, `mobile`, `fax`, `other`. |
     * | isVisibleByOthers | Boolean | Allow user to choose if the phone number is visible by other users or not.  <br>Note that administrators can see all the phone numbers, even if `isVisibleByOthers` is set to false.  <br>Note that phone numbers linked to a system (`isFromSystem`=true) are always visible, `isVisibleByOthers` can't be set to false for these numbers. |
     *
     * @param {number} limit Allow to specify the number of users to retrieve. Default value : 20
     * @param {string} displayName earch users on the given displayName. displayName and search parameters are exclusives, displayName parameter can only be set if search parameter is not provided.
     * @param {string} search Search users belonging to the same company/organisation than logged in user on the given search tags on fields firstName, lastName, companyName, jobTitle, department,tags. Other public users/users in companies visible by logged in user's company are searched only on fields firstName and lastName (except if logged in user has visibility closed or isolated). displayName and search parameters are exclusives, search parameter can only be set if displayName parameter is not provided.
     * @param {string} companyId Search users being in the requested company(ies). companyId and excludeCompanyId parameters are exclusives, companyId parameter can only be set if excludeCompanyId parameter is not provided.
     * @param {string} excludeCompanyId Exclude users being in the requested company(ies) from the search results. companyId and excludeCompanyId parameters are exclusives, excludeCompanyId parameter can only be set if companyId parameter is not provided.
     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort items list based on the given field.
     * @param {number} sortOrder Specify order when sorting items list. Default value : 1. Possible values : -1, 1
     */    
    searchUsers(limit : number = 20, displayName? : string, search? : string, companyId? : string, excludeCompanyId? : string, offset? : number, sortField? : string, sortOrder : number = 1){
        let that = this;

        return new Promise((resolve, reject) => {
            
            that._rest.searchUsers(limit, displayName, search, companyId, excludeCompanyId, offset, sortField, sortOrder).then(function (result) {
                that._logger.log("info", LOG_ID + "(searchUsers) contact searched from server.");
                that._logger.log("internal", LOG_ID + "(searchUsers) REST result : ", result);
                return resolve(result);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(searchUsers) failed.");
                that._logger.log("internalerror", LOG_ID + "(searchUsers) failed : ", err);
                return reject(err);
            });
        });
    }
    
    //endregion Contacts Search
    
    //region Contacts Personnal Directory 

    /**
     * @public
     * @method createPersonalDirectoryEntry
     * @since 2.9.0
     * @instance
     * @async
     * @category Contacts Personal Directory
     * @param {string} firstName Contact first Name
     * @param {string} lastName Contact last Name
     * @param {string} companyName Company Name of the contact
     * @param {string} department Contact address: Department
     * @param {string} street Contact address: Street
     * @param {string} city Contact address: City
     * @param {string} state When country is 'USA' or 'CAN', a state should be defined. Else it is not managed. Allowed values: "AK", "AL", "....", "NY", "WY"
     * @param {string} postalCode Contact address: postal code / ZIP
     * @param {string} country Contact address: country (ISO 3166-1 alpha3 format)
     * @param {Array<string>} workPhoneNumbers Work phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
     * @param {Array<string>} mobilePhoneNumbers Mobile phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
     * @param {Array<string>} otherPhoneNumbers Other phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
     * @param {string} jobTitle Contact Job title
     * @param {string} eMail Contact Email address
     * @param {Array<string>} tags An Array of free tags <br>
     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. <br>
     * The tags can be used to search the directory entries of type user or company using multi-criterion search (search query parameter of the API GET /api/rainbow/directory/v1.0/entries). The multi-criterion search using the tags can only be done on directories belonging to the company of the logged in user (and to the companies belonging to the organisation of the logged in user if that is the case). <br>
     * @param {string} custom1 Custom field 1
     * @param {string} custom2 Custom field 2
     * @description
     *      This API allows connected user to Create a personal directory entry.  <br>
     */
    createPersonalDirectoryEntry (
                           firstName : string,
                           lastName : string,
                           companyName : string,
                           department : string,
                           street : string,
                           city : string,
                           state : string,
                           postalCode : string,
                           country : string,
                           workPhoneNumbers : string[],
                           mobilePhoneNumbers : string[],
                           otherPhoneNumbers : string[],
                           jobTitle : string,
                           eMail : string,
                           tags : string[],
                           custom1 : string,
                           custom2 : string
    ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._logger.log("info", LOG_ID + "(createPersonalDirectoryEntry) __ entering __ firstName :  ", firstName , ", lastName : ", lastName, ", companyName : ", companyName, ", department : ", department , ", street : ", street, " city : ", city, 
                        ",  state : ", state, " postalCode : ", postalCode, ", country : ", country, ", workPhoneNumbers : ", workPhoneNumbers, ", mobilePhoneNumbers : ", mobilePhoneNumbers, ", otherPhoneNumbers : ", otherPhoneNumbers, ", jobTitle : ", jobTitle, ", eMail : ", eMail,
                        ", tags : ", tags, ", custom1 : ", custom1, " custom2 : ", custom2);

                that._rest.createDirectoryEntry ( undefined,
                        firstName,
                        lastName,
                        companyName,
                        department,
                        street,
                        city,
                        state,
                        postalCode,
                        country,
                        workPhoneNumbers,
                        mobilePhoneNumbers,
                        otherPhoneNumbers,
                        jobTitle,
                        eMail,
                        tags,
                        custom1,
                        custom2).then((result) => {
                    that._logger.log("debug", LOG_ID + "(createPersonalDirectoryEntry) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(createPersonalDirectoryEntry) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createPersonalDirectoryEntry) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createPersonalDirectoryEntry) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getDirectoryEntryData
     * @since 2.10.0
     * @instance
     * @async
     * @category  Contacts Personnal Directory
     * @param {string} entryId Id of the entry.
     * @param {string} format Allows to retrieve more or less entry details in response. <br>
     * - small: id, firstName, lastName  <br>
     * - medium: id, companyId, firstName, lastName, workPhoneNumbers  <br>
     * - full: all fields. <br>
     * default : small <br>
     * Valid values : small, medium, full <br>
     * @description
     *      This API allows user to get data about an entry of his personnal directory.<br>
     * @return {Promise<any>}
     */
    getDirectoryEntryData (entryId : string, format : string = "small") {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!entryId) {
                    this._logger.log("warn", LOG_ID + "(getDirectoryEntryData) bad or empty 'entryId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getDirectoryEntryData) bad or empty 'entryId' parameter : ", entryId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.getDirectoryEntryData (entryId, format ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getDirectoryEntryData) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getDirectoryEntryData) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getDirectoryEntryData) ErrorManager error : ", err, ' : ', entryId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getDirectoryEntryData) error : ", err);
                return reject(err);
            }
        });
    }
   
    /**
     * @public
     * @method getListPersonalDirectoryEntriesData
     * @since 2.9.0
     * @instance
     * @async
     * @category Contacts Personnal Directory
     * @param {string} name Allows to filter the list of directory entries of user type on the name provided in this option. <br>
     * - keywords exact match (ex: 'John Doe' find 'John Doe')
     * - keywords partial match (ex: 'Jo Do' find 'John Doe')
     * - case insensitive (ex: 'john doe' find 'John Doe')
     * - accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
     * - on only firstname or lastname (ex: 'john' find 'John Doe')
     * - order firstname / lastname does not matter (eg: 'doe john' find 'John Doe')
     * @param {string} search Allows to filter the list of directory entries by the words provided in this option. <br>
     * - The query parameter type allows to specify on which type of directory entries the search is performed ('user' (default), 'company', or all entries) - Multi criterion search is only available to users having feature SEARCH_BY_TAGS in their profiles - keywords exact match (ex: 'John Doe' find 'John Doe')
     * - keywords partial match (ex: 'Jo Do' find 'John Doe')
     * - case insensitive (ex: 'john doe' find 'John Doe')
     * - accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
     * - multi criterion: fields firstName, lastName, jobTitle,companyName, department and tags.
     * - order firstname / lastname does not matter (eg: 'doe john' find 'John Doe')
     * @param {string} type Allows to specify on which type of directory entries the multi-criterion search is performed ('user' (default), 'company', or all entries)<br>
     * This parameter is only used if the query parameter search is also specified, otherwise it is ignored. Default value : user. Possible values : user, company
     * @param {string} companyName Allows to filter the list of directory entries of company type on the name provided in this option. <br>
     * - keywords exact match (ex: 'John Doe' find 'John Doe')
     * - keywords partial match (ex: 'Jo Do' find 'John Doe')
     * - case insensitive (ex: 'john doe' find 'John Doe')
     * - accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
     * - on only companyName (ex: 'john' find 'John Doe')
     * @param {string} phoneNumbers Allows to filter the list of directory entries on the number provided in this option. (users and companies type) <br>
     *     Note the numbers must be in E164 format separated by a space and the character "+" replaced by "%2B". ex. "phoneNumbers=%2B33390676790 %2B33611223344"
     * @param {Date} fromUpdateDate Allows to filter the list of directory entries from provided date (ISO 8601 format eg: '2019-04-11 16:06:47').
     * @param {Date} toUpdateDate Allows to filter the list of directory entries until provided date (ISO 8601 format).
     * @param {string} tags Allows to filter the list of directory entries on the tag(s) provided in this option. <br>
     *     Only usable by users with admin rights, so that he can list the directory entries to which a given tag is assigned (useful for tag administration). <br>
     *     Using this parameter, the tags are matched with strict equality (i.e. it is case sensitive and the whole tag must be provided).
     * @param {string} format Allows to retrieve more or less entry details in response. <br>
     * - small: id, firstName, lastName  <br>
     * - medium: id, companyId, firstName, lastName, workPhoneNumbers  <br>
     * - full: all fields. <br>
     * default : small <br>
     * Valid values : small, medium, full <br>
     * @param {number} limit Allow to specify the number of phone book entries to retrieve. Default value : 100
     * @param {number} offset Allow to specify the position of first phone book entry to retrieve (first one if not specified) Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort directory list based on the given field. Default value : lastName
     * @param {number} sortOrder Specify order when sorting phone book list. Default value : 1. Possible values : -1, 1
     * @param {string} view Precises ios the user would like to consult either his personal directory, his company directory or the both. Default value : all. Possible values : personal, company, all
     * @description
     *   This API allows connected users to get an entry of his personal directory.<br>
     *   <br>
     *   name, phoneNumbers, search and tags parameters are exclusives.
     * @return {Promise<any>}
     * <br>
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object\[\] | Data objects |
     * | id  | String | Directory entry identifier |
     * | companyId optionnel | String | Id of the company |
     * | userId optionnel | String | Id of the user |
     * | type | String | Type of the directory entry<br>* `user` if firstName and/or lastName are filled,<br>* `company` if only companyName is filled (firstName and lastName empty)<br>Possible values : `user`, `company` |
     * | firstName optionnel | String | Contact First name<br>Ordre de grandeur : `0..255` |
     * | lastName optionnel | String | Contact Last name<br>Ordre de grandeur : `0..255` |
     * | companyName optionnel | String | Company Name of the contact<br>Ordre de grandeur : `0..255` |
     * | department optionnel | String | Contact address: Department<br>Ordre de grandeur : `0..255` |
     * | street optionnel | String | Contact address: Street<br>Ordre de grandeur : `0..255` |
     * | city optionnel | String | Contact address: City<br>Ordre de grandeur : `0..255` |
     * | state optionnel | String | When country is 'USA' or 'CAN', a state should be defined. Else it is not managed. Allowed values: "AK", "AL", "....", "NY", "WY" |
     * | postalCode optionnel | String | Contact address: postal code / ZIP<br>Ordre de grandeur : `0..64` |
     * | country optionnel | String | Contact address: country (ISO 3166-1 alpha3 format) |
     * | workPhoneNumbers optionnel | String\[\] | Work phone numbers (E164 format)<br>Ordre de grandeur : `0..32` |
     * | mobilePhoneNumbers optionnel | String\[\] | Mobile phone numbers (E164 format)<br>Ordre de grandeur : `0..32` |
     * | otherPhoneNumbers optionnel | String\[\] | other phone numbers (E164 format)<br>Ordre de grandeur : `0..32` |
     * | jobTitle optionnel | String | Contact Job title<br>Ordre de grandeur : `0..255` |
     * | eMail optionnel | String | Contact Email address<br>Ordre de grandeur : `0..255` |
     * | tags optionnel | String\[\] | An Array of free tags<br>Ordre de grandeur : `1..64` |
     * | custom1 optionnel | String | Custom field 1<br>Ordre de grandeur : `0..255` |
     * | custom2 optionnel | String | Custom field 2<br>Ordre de grandeur : `0..255` |
     *
     *
     */
    getListPersonalDirectoryEntriesData (
                                 name : string,
                                 search : string,
                                 type : string,
                                 companyName : string,
                                 phoneNumbers : string,
                                 fromUpdateDate : Date,
                                 toUpdateDate : Date,
                                 tags  : string,
                                 format : string = "small",
                                 limit : number = 100,
                                 offset : number = 0,
                                 sortField : string = "lastName",
                                 sortOrder : number = 1,
                                 view  : string = "all") {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getListDirectoryEntriesData (undefined, undefined, name, search, type, companyName, phoneNumbers, fromUpdateDate, toUpdateDate, tags, format, limit, offset, sortField, sortOrder, view ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getListPersonalDirectoryEntriesData) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getListPersonalDirectoryEntriesData) Successfully - result : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getListPersonalDirectoryEntriesData) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getListPersonalDirectoryEntriesData) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method updatePersonalDirectoryEntry
     * @since 2.2.0
     * @instance
     * @async
     * @category Contacts Personnal Directory
     * @param {string} entryId Id of the entry.
     * @param {string} firstName Contact first Name
     * @param {string} lastName Contact last Name
     * @param {string} companyName Company Name of the contact
     * @param {string} department Contact address: Department
     * @param {string} street Contact address: Street
     * @param {string} city Contact address: City
     * @param {string} state When country is 'USA' or 'CAN', a state should be defined. Else it is not managed. Allowed values: "AK", "AL", "....", "NY", "WY"
     * @param {string} postalCode Contact address: postal code / ZIP
     * @param {string} country Contact address: country (ISO 3166-1 alpha3 format)
     * @param {Array<string>} workPhoneNumbers Work phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
     * @param {Array<string>} mobilePhoneNumbers Mobile phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
     * @param {Array<string>} otherPhoneNumbers Other phone numbers. Allowed format are E164 or national with a country code. e.g: ["+33390671234"] or ["+33390671234, 0690676790"] with "country": "FRA") If a number is not in E164 format, it is converted to E164 format using provided country (or company country if contact's country is not set)
     * @param {string} jobTitle Contact Job title
     * @param {string} eMail Contact Email address
     * @param {Array<string>} tags An Array of free tags <br>
     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. <br>
     * The tags can be used to search the directory entries of type user or company using multi-criterion search (search query parameter of the API GET /api/rainbow/directory/v1.0/entries). The multi-criterion search using the tags can only be done on directories belonging to the company of the logged in user (and to the companies belonging to the organisation of the logged in user if that is the case).
     * @param {string} custom1 Custom field 1
     * @param {string} custom2 Custom field 2
     * @description
     *      This API allows the connected user to update an entry of his personnal directory.<br>
     * @return {Promise<any>}
     */
    updatePersonalDirectoryEntry  (entryId : string,
                           firstName : string = undefined,
                           lastName : string = undefined,
                           companyName : string = undefined,
                           department : string = undefined,
                           street : string = undefined,
                           city : string = undefined,
                           state : string = undefined,
                           postalCode : string = undefined,
                           country : string = undefined,
                           workPhoneNumbers : string[] = undefined,
                           mobilePhoneNumbers : string[] = undefined,
                           otherPhoneNumbers : string[] = undefined,
                           jobTitle : string = undefined,
                           eMail : string = undefined,
                           tags : string[] = undefined,
                           custom1 : string = undefined,
                           custom2 : string = undefined) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!entryId) {
                    that._logger.log("warn", LOG_ID + "(updatePersonalDirectoryEntry) bad or empty 'entryId' parameter");
                    that._logger.log("internalerror", LOG_ID + "(updatePersonalDirectoryEntry) bad or empty 'entryId' parameter : ", entryId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.updateDirectoryEntry(entryId,
                        firstName,
                        lastName,
                        companyName,
                        department,
                        street,
                        city,
                        state,
                        postalCode,
                        country,
                        workPhoneNumbers,
                        mobilePhoneNumbers,
                        otherPhoneNumbers,
                        jobTitle,
                        eMail,
                        tags,
                        custom1,
                        custom2).then((result) => {
                    that._logger.log("debug", LOG_ID + "(updatePersonalDirectoryEntry) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(updatePersonalDirectoryEntry) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(updatePersonalDirectoryEntry) ErrorManager error : ", err, ' : ', entryId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(updatePersonalDirectoryEntry) error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @public
     * @method deletePersonalDirectoryEntry
     * @since 2.9.0
     * @instance
     * @async
     * @category Contacts Personnal Directory
     * @param {string} entryId Id of the entry.
     * @description
     *      This API allows connected user to delete an entry from his personal directory.<br>
     * @return {Promise<any>}
     */
    deletePersonalDirectoryEntry (entryId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!entryId) {
                    that._logger.log("warn", LOG_ID + "(deletePersonalDirectoryEntry) bad or empty 'entryId' parameter");
                    that._logger.log("internalerror", LOG_ID + "(deletePersonalDirectoryEntry) bad or empty 'entryId' parameter : ", entryId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.deleteDirectoryEntry (entryId ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(deletePersonalDirectoryEntry) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(deletePersonalDirectoryEntry) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deletePersonalDirectoryEntry) ErrorManager error : ", err, ' : ', entryId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(deletePersonalDirectoryEntry) error : ", err);
                return reject(err);
            }
        });
    }
    
    //endregion Contacts Personnal Directory
    
    //region Events
     
    /**
     * @private
     * @method _onPresenceChanged
     * @instance
     * @param {Object} presence contains informations about contact changes
     * @description
     *      Method called when the presence of a contact changed <br>
     */
    _onPresenceChanged(presence : any) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(_onPresenceChanged) presence : ", presence);

        try {
            if (that.userContact) {
                that._logger.log("internal", LOG_ID + "(_onPresenceChanged) current contact found : ", that.userContact);
                if (!that.userContact.resources) {
                    that.userContact.resources = {};
                }

                let contactFound = that._contacts.find((contact) => {
                    return contact.jid_im===that.userContact.jid;
                });
                
                // Store the presence of the resource
                that.userContact.resources[presence.resource] = presence.value;
                if (contactFound) {
                    contactFound.resources = that.userContact.resources; 
                }

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
                for (let resourceId in that.userContact.resources) {

                    let resource = that.userContact.resources[resourceId];

                    that._logger.log("internal", LOG_ID + "(_onPresenceChanged) resource : ", resource, ", for resourceId : ", resourceId);

                    if (resource.type!=="phone") {
                        if (resource.show===PresenceShow.Xa && resource.status===PresenceStatus.EmptyString) {
                            manual_invisible = true;
                        } else if (resource.show===PresenceShow.Dnd && resource.status===PresenceStatus.EmptyString) {
                            manual_dnd = true;
                        } else if (resource.show===PresenceShow.Xa && resource.status===PresenceStatus.Away) {
                            manual_away = true;
                        } else if (resource.show===PresenceShow.Dnd && resource.status===PresenceStatus.Presentation) {
                            in_presentation_mode = true;
                        } else if (resource.show===PresenceShow.Dnd && resource.status && resource.status.length > 0) {
                            in_webrtc_mode = true;
                            webrtc_reason = resource.status;
                        } else if ((resource.show===PresenceShow.EmptyString || resource.show===PresenceShow.Online) && (resource.status===PresenceStatus.EmptyString || resource.status===PresenceStatus.ModeAuto)) {
                            if (resource.type==="mobile") {
                                is_online_mobile = true;
                            } else {
                                is_online = true;
                            }
                        } else if (resource.show===PresenceShow.Away && resource.status===PresenceStatus.EmptyString) {
                            auto_away = true;
                        } else if (resource.show==="unavailable" || resource.show===PresenceShow.Offline) {
                            is_offline = true;
                        }
                    } else {
                        that._logger.log("internal", LOG_ID + "(_onPresenceChanged) resource.type === \"phone\" : ", resource.type);
                        if ((resource.status==="EVT_SERVICE_INITIATED" || resource.status==="EVT_ESTABLISHED") && resource.show===PresenceShow.Chat) {
                            on_the_phone = true;
                        }
                        if (resource.status==="EVT_CONNECTION_CLEARED" && resource.show===PresenceShow.Chat) {
                            on_the_phone = false;
                        }
                    }
                }

                that._logger.log("internal", LOG_ID + "(_onPresenceChanged) result booleans of decoded presence : ", {
                    manual_invisible,
                    manual_dnd,
                    manual_away,
                    in_presentation_mode,
                    in_webrtc_mode,
                    is_online_mobile,
                    is_online,
                    auto_away,
                    is_offline,
                    on_the_phone
                });

                // Store previous presence state
                let oldPresence = that.userContact.presence;
                let oldStatus = that.userContact.status;

                let newPresenceRainbow = new PresenceRainbow();

                if (on_the_phone) {
                    // contact.presence = "busy";
                    //contact.status = "phone";
                    newPresenceRainbow.presenceLevel = PresenceLevel.Busy;
                    newPresenceRainbow.presenceStatus = PresenceStatus.Phone;
                } else if (manual_invisible) {
                    /*contact.presence = "offline";
                    contact.status = "";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Invisible;
                    newPresenceRainbow.presenceStatus = PresenceStatus.EmptyString;
                } else if (manual_dnd) {
                    /*contact.presence = "busy";
                    contact.status = "";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Busy;
                    newPresenceRainbow.presenceStatus = PresenceStatus.EmptyString;
                } else if (manual_away) {
                    /* contact.presence = "away";
                    contact.status = "";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Away;
                    newPresenceRainbow.presenceStatus = PresenceStatus.EmptyString;
                } else if (in_presentation_mode) {
                    /*contact.presence = "busy";
                    contact.status = "presentation";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Busy;
                    newPresenceRainbow.presenceStatus = PresenceStatus.Presentation;
                } else if (in_webrtc_mode) {
                    /* contact.presence = "busy";
                     contact.status = webrtc_reason;
                     // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Busy;
                    newPresenceRainbow.presenceStatus = webrtc_reason;
                } else if (is_online) {
                    /* contact.presence = "online";
                    contact.status = "";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Online;
                    newPresenceRainbow.presenceStatus = PresenceStatus.EmptyString;
                } else if (is_online_mobile) {
                    /*contact.presence = "online";
                    contact.status = "mobile";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.OnlineMobile;
                    newPresenceRainbow.presenceStatus = PresenceStatus.Mobile;
                } else if (auto_away) {
                    /*contact.presence = "away";
                    contact.status = "";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Away;
                    newPresenceRainbow.presenceStatus = PresenceStatus.EmptyString;
                } else if (is_offline && that.userContact.presence!=="unknown") {
                    /*contact.presence = "offline";
                    contact.status = "";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Offline;
                    newPresenceRainbow.presenceStatus = PresenceStatus.EmptyString;
                } else {
                    /*contact.presence = "unknown";
                    contact.status = "";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Unknown
                    newPresenceRainbow.presenceStatus = PresenceStatus.EmptyString
                }

                that._logger.log("internal", LOG_ID + "(_onPresenceChanged) newPresenceRainbow : ", newPresenceRainbow);

                that.userContact.presence = newPresenceRainbow.presenceLevel;
                that.userContact.status = newPresenceRainbow.presenceStatus;

                //if (contact.resources[presence.resource].show === "unavailable") {
                if (that.userContact.resources[presence.resource].show===PresenceLevel.Offline) {
                    that._logger.log("debug", LOG_ID + "(_onPresenceChanged) delete resource : ", presence.resource, ", contact.resources[presence.resource].show :", that.userContact.resources[presence.resource].show, " the contact.presence (" + that.userContact.presence + ")");
                    delete that.userContact.resources[presence.resource];
                } else {
                    that._logger.log("debug", LOG_ID + "(_onPresenceChanged) DO NOT delete resource : ", presence.resource, ", contact.resources[presence.resource].show :", that.userContact.resources[presence.resource].show, " the contact.presence (" + that.userContact.presence + ")");
                }

                if (oldPresence!=="unknown" && that.userContact.presence===oldPresence && that.userContact.status===oldStatus) {
                    that._logger.log("debug", LOG_ID + "(_onPresenceChanged) presence contact.presence (" + that.userContact.presence + ") === oldPresence && contact.status (" + that.userContact.status + ") === oldStatus, so ignore presence.");
                    //return;
                }

                let presenceDisplayed = that.userContact.status.length > 0 ? that.userContact.presence + "|" + that.userContact.status:that.userContact.presence;
                that._logger.log("internal", LOG_ID + "(_onPresenceChanged) presence changed to " + presenceDisplayed + " for " + that.getDisplayName(that.userContact));
                //this._eventEmitter.emit("evt_internal_onrosterpresencechanged", that.userContact);
                that._eventEmitter.emit("evt_internal_mypresencechanged", that.userContact);


                /*
                if (!that.userContact.resources) {
                    that.userContact.resources = {};
                }

                // Store the presence of the resource
                that.userContact.resources[presence.resource] = {
                    //priority: priority,
                    //show: show || "",
                    //delay: delay,
                    //status: status || "",
                    "show": presence.show,
                        "status": presence.status,
                        "type": presence.type

                } ;

                // Store previous presence state
                let oldPresence = that.userContact.presence;
                let oldStatus = that.userContact.status;

                let presenceRainbow = new PresenceRainbow();

                presenceRainbow.presenceLevel = PresenceLevel.Unknown;
                if (show === PresenceShow.Xa && status === PresenceStatus.EmptyString) {
                    presenceRainbow.presenceLevel = PresenceLevel.Invisible;
                }
                else if (show === PresenceShow.Dnd && status === PresenceStatus.EmptyString) {
                    presenceRainbow.presenceLevel = PresenceLevel.Dnd;
                } else if (show === PresenceShow.Xa && status === PresenceStatus.Away) {
                    presenceRainbow.presenceLevel = PresenceLevel.Away;
                } else if (show === PresenceShow.Dnd && status === PresenceStatus.Presentation) {
                    presenceRainbow.presenceLevel = PresenceLevel.Dnd;
                } else if (show === PresenceShow.Dnd && status && status.length > 0) {
                    presenceRainbow.presenceLevel = PresenceLevel.Dnd;
                } else if ((show === PresenceShow.EmptyString || show === PresenceShow.Online) && (status === PresenceStatus.EmptyString || status === PresenceStatus.ModeAuto)) {
                    presenceRainbow.presenceLevel = PresenceLevel.Online;
                } else if (show === PresenceShow.Away && status === PresenceStatus.EmptyString) {
                    presenceRainbow.presenceLevel = PresenceLevel.Away;
                } else { // @ts-ignore
                    if (show && show.toString() === "unavailable" || show === PresenceShow.Offline) {
                        presenceRainbow.presenceLevel = PresenceLevel.Offline;
                    }
                }

                this._logger.log("internal", LOG_ID + "(_onPresenceChanged) new presence : ", presence, ", old presence oldPresence : ", oldPresence, ", oldStatus", oldStatus);

                if (oldPresence !== "unknown" && presence.presence === oldPresence && presence.status === oldStatus) {
                    that._logger.log("debug", LOG_ID + "(_onPresenceChanged) presence presence.presence (" + presence.presence + ") === oldPresence && presence.status (" + presence.status + ") === oldStatus, so ignore presence.");
                    return;
                } else {
                    that._logger.log("debug", LOG_ID + "(_onPresenceChanged) presence changed to " + presence.presence );
                }

                that.userContact.presence = presence.presence;
                that.userContact.status = presence.status;

                if (that.userContact.resources[presence.resource].show === PresenceLevel.Offline ) {
                    this._logger.log("debug", LOG_ID + "(onRosterPresenceChanged) delete resource : " , presence.resource, ", contact.resources[presence.resource].show :", that.userContact.resources[presence.resource].show, " the contact.presence (" + that.userContact.presence + ")");
                    delete that.userContact.resources[presence.resource];
                } else {
                    this._logger.log("debug", LOG_ID + "(onRosterPresenceChanged) DO NOT delete resource : " , presence.resource, ", contact.resources[presence.resource].show :", that.userContact.resources[presence.resource].show, " the contact.presence (" + that.userContact.presence + ")");
                }

                that._logger.log("internal", LOG_ID + "(_onPresenceChanged) presence changed to " + presence.presence + " for " + that.getDisplayName(that.userContact));
                that._eventEmitter.emit("evt_internal_mypresencechanged", presence);
                // */
            } else {
                that._logger.log("warn", LOG_ID + "(_onPresenceChanged) no contact found for current user.");
            }
        } catch (err) {
            that._logger.log("warn", LOG_ID + "(_onPresenceChanged) CATCH Error !!! error : ", err);
        }
    }

    /**
     * @private
     * @method _onRosterPresenceChanged
     * @instance
     * @param {Object} presence contains informations about contact changes
     * @description
     *      Method called when the presence of a contact changed <br>
     */
    _onRosterPresenceChanged(presence : any) {
        this._logger.log("internal", LOG_ID + "(onRosterPresenceChanged) presence : ", presence);

        try {
            let contact = undefined;
            if (this._contacts) {
                contact = this._contacts.find((contactItem) => {
                    return contactItem.jid_im===presence.jid;
                });
            } else {
                this._logger.log("warn", LOG_ID + "(onRosterPresenceChanged) the contacts tab contains an undefined contact !");
            }

            if (contact) {
                this._logger.log("internal", LOG_ID + "(onRosterPresenceChanged) contact found : ", contact);

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

                    this._logger.log("internal", LOG_ID + "(onRosterPresenceChanged) resource : ", resource, ", for resourceId : ", resourceId);

                    if (resource.type!=="phone") {
                        if (resource.show===PresenceShow.Xa && resource.status===PresenceStatus.EmptyString) {
                            manual_invisible = true;
                        } else if (resource.show===PresenceShow.Dnd && resource.status===PresenceStatus.EmptyString) {
                            manual_dnd = true;
                        } else if (resource.show===PresenceShow.Xa && resource.status===PresenceStatus.Away) {
                            manual_away = true;
                        } else if (resource.show===PresenceShow.Dnd && resource.status===PresenceStatus.Presentation) {
                            in_presentation_mode = true;
                        } else if (resource.show===PresenceShow.Dnd && resource.status && resource.status.length > 0) {
                            in_webrtc_mode = true;
                            webrtc_reason = resource.status;
                        } else if ((resource.show===PresenceShow.EmptyString || resource.show===PresenceShow.Online) && (resource.status===PresenceStatus.EmptyString || resource.status===PresenceStatus.ModeAuto)) {
                            if (resource.type==="mobile") {
                                is_online_mobile = true;
                            } else {
                                is_online = true;
                            }
                        } else if (resource.show===PresenceShow.Away && resource.status===PresenceStatus.EmptyString) {
                            auto_away = true;
                        } else if (resource.show==="unavailable" || resource.show===PresenceShow.Offline) {
                            is_offline = true;
                        } /*else if (resource.type!=="calendar") {
                            if (resource.show = "chat") { 
                                
                            } 
                        } // */
                    } else {
                        this._logger.log("internal", LOG_ID + "(onRosterPresenceChanged) resource.type === \"phone\" : ", resource.type);
                        if ((resource.status==="EVT_SERVICE_INITIATED" || resource.status==="EVT_ESTABLISHED") && resource.show===PresenceShow.Chat) {
                            on_the_phone = true;
                        }
                        if (resource.status==="EVT_CONNECTION_CLEARED" && resource.show===PresenceShow.Chat) {
                            on_the_phone = false;
                        }
                    }
                }

                this._logger.log("internal", LOG_ID + "(onRosterPresenceChanged) result booleans of decoded presence : ", {
                    manual_invisible,
                    manual_dnd,
                    manual_away,
                    in_presentation_mode,
                    in_webrtc_mode,
                    is_online_mobile,
                    is_online,
                    auto_away,
                    is_offline,
                    on_the_phone
                });

                // Store previous presence state
                let oldPresence = contact.presence;
                let oldStatus = contact.status;

                let newPresenceRainbow = new PresenceRainbow();

                if (on_the_phone) {
                    // contact.presence = "busy";
                    //contact.status = "phone";
                    newPresenceRainbow.presenceLevel = PresenceLevel.Busy;
                    newPresenceRainbow.presenceStatus = PresenceStatus.Phone;
                } else if (manual_invisible) {
                    /*contact.presence = "offline";
                    contact.status = "";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Invisible;
                    newPresenceRainbow.presenceStatus = PresenceStatus.EmptyString;
                } else if (manual_dnd) {
                    /*contact.presence = "busy";
                    contact.status = "";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Busy;
                    newPresenceRainbow.presenceStatus = PresenceStatus.EmptyString;
                } else if (manual_away) {
                    /* contact.presence = "away";
                    contact.status = "";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Away;
                    newPresenceRainbow.presenceStatus = PresenceStatus.EmptyString;
                } else if (in_presentation_mode) {
                    /*contact.presence = "busy";
                    contact.status = "presentation";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Busy;
                    newPresenceRainbow.presenceStatus = PresenceStatus.Presentation;
                } else if (in_webrtc_mode) {
                    /* contact.presence = "busy";
                     contact.status = webrtc_reason;
                     // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Busy;
                    newPresenceRainbow.presenceStatus = webrtc_reason;
                } else if (is_online) {
                    /* contact.presence = "online";
                    contact.status = "";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Online;
                    newPresenceRainbow.presenceStatus = PresenceStatus.EmptyString;
                } else if (is_online_mobile) {
                    /*contact.presence = "online";
                    contact.status = "mobile";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.OnlineMobile;
                    newPresenceRainbow.presenceStatus = PresenceStatus.Mobile;
                } else if (auto_away) {
                    /*contact.presence = "away";
                    contact.status = "";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Away;
                    newPresenceRainbow.presenceStatus = PresenceStatus.EmptyString;
                } else if (is_offline && contact.presence!=="unknown") {
                    /*contact.presence = "offline";
                    contact.status = "";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Offline;
                    newPresenceRainbow.presenceStatus = PresenceStatus.EmptyString;
                } else {
                    /*contact.presence = "unknown";
                    contact.status = "";
                    // */
                    newPresenceRainbow.presenceLevel = PresenceLevel.Offline
                    newPresenceRainbow.presenceStatus = PresenceStatus.EmptyString
                }

                this._logger.log("internal", LOG_ID + "(onRosterPresenceChanged) newPresenceRainbow : ", newPresenceRainbow);

                contact.presence = newPresenceRainbow.presenceLevel;
                contact.status = newPresenceRainbow.presenceStatus;

                //if (contact.resources[presence.resource].show === "unavailable") {
                if (contact.resources[presence.resource].show===PresenceLevel.Offline) {
                    this._logger.log("debug", LOG_ID + "(onRosterPresenceChanged) delete resource : ", presence.resource, ", contact.resources[presence.resource].show :", contact.resources[presence.resource].show, " the contact.presence (" + contact.presence + ")");
                    delete contact.resources[presence.resource];
                } else {
                    this._logger.log("debug", LOG_ID + "(onRosterPresenceChanged) DO NOT delete resource : ", presence.resource, ", contact.resources[presence.resource].show :", contact.resources[presence.resource].show, " the contact.presence (" + contact.presence + ")");
                }

                if (oldPresence!=="unknown" && contact.presence===oldPresence && contact.status===oldStatus) {
                    this._logger.log("debug", LOG_ID + "(onRosterPresenceChanged) presence contact.presence (" + contact.presence + ") === oldPresence && contact.status (" + contact.status + ") === oldStatus, so ignore presence.");
                    //return;
                }

                let presenceDisplayed = contact.status.length > 0 ? contact.presence + "|" + contact.status:contact.presence;
                this._logger.log("internal", LOG_ID + "(onRosterPresenceChanged) presence changed to " + presenceDisplayed + " for " + this.getDisplayName(contact));
                this._eventEmitter.emit("evt_internal_onrosterpresencechanged", contact);
            } else {
                this._logger.log("warn", LOG_ID + "(onRosterPresenceChanged) no contact found for " + presence.jid);
                // Seems to be a pending presence update in roster associated contact not yet available
                if (presence.value.show!=="unavailable") {
                    // To a pending presence queue
                    this._rosterPresenceQueue.push({presence, date: Date.now()});
                }
            }
        } catch (err) {
            this._logger.log("warn", LOG_ID + "(onRosterPresenceChanged) CATCH Error !!! error : ", err);
        }
    }

    /**
     * @private
     * @method _onContactInfoChanged
     * @instance
     * @param {string} jid modified roster contact Jid
     * @description
     *     Method called when an roster user information are updated <br>
     */
    _onContactInfoChanged(jid : string) {
        let that = this;

        that._rest.getContactInformationByJID(jid).then((_contactFromServer: any) => {
            that._logger.log("info", LOG_ID + "(getContactByJid) contact found on the server");
            that._logger.log("internal", LOG_ID + "(getContactByJid) contact found on the server : ", util.inspect(_contactFromServer));
            let connectedUser = that.getConnectedUser() ? that.getConnectedUser():new Contact();

            if (jid === connectedUser.jid) {
                connectedUser.updateFromUserData(_contactFromServer);
                connectedUser.avatar = that.getAvatarByContactId(_contactFromServer.id, _contactFromServer.lastAvatarUpdateDate);
                connectedUser.status = that._presenceService.getUserConnectedPresence().presenceStatus;
                connectedUser.presence = that._presenceService.getUserConnectedPresence().presenceLevel;
                this._eventEmitter.emit("evt_internal_informationchanged", connectedUser);
            }

        }).catch((err) => {
            this._logger.log("info", LOG_ID + "(_onContactInfoChanged) no contact found with jid " + jid);
        });
    }
    /**
     * @private
     * @method _onRosterContactInfoChanged
     * @instance
     * @param {string} jid modified roster contact Jid
     * @description
     *     Method called when an roster user information are updated <br>
     */
    _onRosterContactInfoChanged(jid : string) {
        let that = this;

        that._rest.getContactInformationByJID(jid).then((_contactFromServer: any) => {
            that._logger.log("info", LOG_ID + "(_onRosterContactInfoChanged) contact found on the server");
            that._logger.log("internal", LOG_ID + "(_onRosterContactInfoChanged) contact found on the server : ", util.inspect(_contactFromServer));
            let contactIndex = -1;
            // Update or Add contact
            if (that._contacts) {
                contactIndex = that._contacts.findIndex((_contact: any) => {
                    return _contact.jid_im===_contactFromServer.jid_im;
                });

                let contact = null;
                that._logger.log("internal", LOG_ID + "(_onRosterContactInfoChanged) contact found on the server : ", contact);

                if (contactIndex!== -1) {
                    contact = that._contacts[contactIndex];
                    //that._logger.log("internal", LOG_ID + "(_onRosterContactInfoChanged) local contact before updateFromUserData ", contact);
                    contact.updateFromUserData(_contactFromServer);
                    contact.avatar = that.getAvatarByContactId(_contactFromServer.id, _contactFromServer.lastAvatarUpdateDate);

                    this._eventEmitter.emit("evt_internal_contactinformationchanged", that._contacts[contactIndex]);
                } else {
                    contact = that.createBasicContact(_contactFromServer.jid_im, undefined);
                    //that._logger.log("internal", LOG_ID + "(_onRosterContactInfoChanged) from server contact before updateFromUserData ", contact);
                    contact.updateFromUserData(_contactFromServer);
                    contact.avatar = that.getAvatarByContactId(_contactFromServer.id, _contactFromServer.lastAvatarUpdateDate);

                    this._eventEmitter.emit("evt_internal_contactinformationchanged", contact);
                }
            }

        }).catch((err) => {
            this._logger.log("info", LOG_ID + "(_onRosterContactInfoChanged) no contact found with jid " + jid);
        });
    }

    /**
     * @private
     * @method _onUserInviteReceived
     * @instance
     * @param {Object} data contains the invitationId
     * @description
     *      Method called when an user invite is received <br>
     */
    /* _onUserInviteReceived(data) {
        let that = this;

        that._logger.log("debug", LOG_ID + "(_onUserInviteReceived) enter");
        that._logger.log("internal", LOG_ID + "(_onUserInviteReceived) enter : ", data);

        that._rest.getInvitationById(data.invitationId).then( (invitation : any) => {
            that._logger.log("debug", LOG_ID + "(_onUserInviteReceived) invitation received id", invitation.id);

            that._eventEmitter.emit("evt_internal_userinvitereceived", invitation);
        }, err => {
            that._logger.log("warn", LOG_ID + "(_onUserInviteReceived) no invitation found for " + data.invitationId);
        });
    } // */

    /**
     * @private
     * @method _onUserInviteAccepted
     * @instance
     * @param {Object} data contains the invitationId
     * @description
     *      Method called when an user invite is accepted <br>
     */
    /* _onUserInviteAccepted(data) {
        let that = this;

        that._logger.log("debug", LOG_ID + "(_onUserInviteAccepted) enter");

        that._rest.getInvitationById(data.invitationId).then((invitation : any) => {
            that._logger.log("debug", LOG_ID + "(_onUserInviteAccepted) invitation accepted id", invitation.id);

            that._eventEmitter.emit("evt_internal_userinviteaccepted", invitation);
        }, err => {
            that._logger.log("warn", LOG_ID + "(_onUserInviteAccepted) no invitation found for " + data.invitationId);
        });
    } // */

    /**
     * @private
     * @method _onUserInviteCanceled
     * @instance
     * @param {Object} data contains the invitationId
     * @description
     *      Method called when an user invite is canceled <br>
     */

    /* _onUserInviteCanceled(data) {
        let that = this;

        that._logger.log("debug", LOG_ID + "(_onUserInviteCanceled) enter");

        that._rest.getInvitationById(data.invitationId).then((invitation: any) => {
            that._logger.log("debug", LOG_ID + "(_onUserInviteCanceled) invitation canceled id", invitation.id);
            that._eventEmitter.emit("evt_internal_userinvitecanceled", invitation);
        }, err => {
            that._logger.log("warn", LOG_ID + "(_onUserInviteCanceled) no invitation found for " + data.invitationId);
        });
    } // */

    /**
     * @private
     * @method _onRostersUpdate
     * @instance
     * @param {Object} contacts contains a contact list with updated elements
     * @description
     *      Method called when the roster _contacts is updated <br>
     */
    _onRostersUpdate(contacts) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(_onRostersUpdate) enter : ", contacts);

        contacts.forEach(contact => {
            if (contact.jid.substr(0, 3)!=="tel") { // Ignore telephonny events
                if (contact.subscription==="remove") {
                    let foundContact = that._contacts.find(item => item.jid_im===contact.jid);
                    if (foundContact) {
                        foundContact.presence = "unknown";
                        foundContact.roster = false;
                        that._eventEmitter.emit("evt_internal_contactremovedfromnetwork", contact);
                        /*
                        // replace following remove of the Contact by setting its roster property to false :                         
                        // Add suppression delay
                        setTimeout(() => {
                            that._contacts = that._contacts.filter(_contact => _contact.jid_im!==contact.jid);
                        }, 3000);
                        // */
                    }
                    return;
                }

                if (contact.subscription==="both") {
                    if (!that._contacts.find(item => {
                        return item.jid_im===contact.jid;
                    })) {
                        that.getContactByJid(contact.jid, true).then((_contact) => {
                            that._contacts.push(Object.assign(_contact, {
                                resources: {},
                                presence: "offline",
                                status: ""
                            }));
                            that._rosterPresenceQueue.filter(presenceItem => presenceItem.presence.jid===contact.jid).forEach(item =>
                                    that._onRosterPresenceChanged(item.presence)
                            );
                            let currentDate = Date.now();
                            that._rosterPresenceQueue = that._rosterPresenceQueue.filter(presenceItem => presenceItem.presence.jid!==contact.jid || (presenceItem.date + 10000) < currentDate);
                        });
                    }
                }
            } else {
                that._logger.log("debug", LOG_ID + "(_onRostersUpdate) Ignore telephonny events.");
            }
        });
    }

    //endregion Events
}

module.exports.Contacts = ContactsService;
export {ContactsService as ContactsService};
