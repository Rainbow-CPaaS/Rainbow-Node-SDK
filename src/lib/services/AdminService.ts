"use strict";

import {XMPPService} from "../connection/XMPPService";

export {};

import {ErrorManager} from "../common/ErrorManager";
import  {RESTService} from "../connection/RESTService";
import {isStarted, logEntryExit} from "../common/Utils";
import {EventEmitter} from "events";
import {Logger} from "../common/Logger";
import {S2SService} from "./S2SService";
import {Contact} from "../common/models/Contact";
import {ContactsService} from "./ContactsService";
import {GenericService} from "./GenericService";

const LOG_ID = "ADMIN/SVCE - ";

/**
 * Offer type provided by Rainbow
 * @public
 * @enum {string}
 * @readonly
 */
enum  OFFERTYPES {
    /** freemium licence offer */
    FREEMIUM= "freemium",
    /** premium licence offer */
    PREMIUM= "premium"
}

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name Admin
 * @version SDKVERSION
 * @public
 * @description
 *      This module handles the management of users. Using it, You will be able to create new users, to modify information of users and to delete them.<br>
 *      This module can be use too to create Guest users who are specific temporaly users that can be used in Rainbow. <br/>
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Create a new user in a specified company <br>
 *      - Modify information of an existing user <br>
 *      - Delete an existing user <br>
 *      - Invite a user in Rainbow <br>
 *      - Change the password of a user <br>
 *      - Create a guest user <br/>
 */
class Admin extends GenericService {
    private _contacts: ContactsService;

    static getClassName(){ return 'Admin'; }
    getClassName(){ return Admin.getClassName(); }

    constructor(_eventEmitter : EventEmitter, _logger : Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(_logger, LOG_ID);
        this._startConfig = _startConfig;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._contacts = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._logger = _logger;
    }

    start(_options, _core) { //  _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService
        let that = this;


        return new Promise(function (resolve, reject) {
            try {
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;

                that._options = _options;
                that._s2s = _core._s2s;
                that._contacts = _core._contacts;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;

                that.setStarted ();
                resolve(undefined);
            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(start) error : ", err);
                return reject();
            }
        });
    }

    stop() {
        let that = this;


        return new Promise(function (resolve, reject) {
            try {
                that._xmpp = null;
                that._rest = null;
                that.setStopped ();
                resolve(undefined);
            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(stop) error : ", err);
                return reject(err);
            }
        });
    }

    async init () {
        let that = this;
        that.setInitialized();
    }
    
    /**
     * @public
     * @method createCompany
     * @instance
     * @description
     *      Create a company <br/>
     * @param {string} strName The name of the new company
     * @param {string} country Company country (ISO 3166-1 alpha3 format, size 3 car)
     * @param {string} state (optionnal if not USA)  define a state when country is 'USA' (["ALASKA", "....", "NEW_YORK", "....", "WYOMING"] ), else it is not managed by server. Default value on server side: ALABAMA
     * @param {OFFERTYPES} offerType Company offer type. Companies with offerType=freemium are not able to subscribe to paid offers, they must be premium to do so. Companies created with privateDC="HDS" are automatically created with offerType=premium (as a paid subscription to HDS Company offer is automatically done during the company creation. Values can be : freemium, premium
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - Created Company or an error object depending on the result
     * @category async
     */
    createCompany(strName :string, country : string, state : string, offerType? : OFFERTYPES) : Promise<any> {
        let that = this;

        that._logger.log("internal", LOG_ID + "(createCompany) parameters : strName : ", strName,", country : ", country);

        return new Promise(function (resolve, reject) {
            try {
                if (!strName) {
                    that._logger.log("error", LOG_ID + "(createCompany) bad or empty 'strName' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.createCompany(strName, country, state, offerType).then((company) => {
                    that._logger.log("internal", LOG_ID + "(createCompany) Successfully created company : ", strName);
                    resolve(company);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createCompany) ErrorManager when creating");
                    that._logger.log("internalerror", LOG_ID + "(createCompany) ErrorManager when creating : ", strName);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createCompany) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * Remove a user from a company
     * @private
     */
    removeUserFromCompany(user) : Promise<any> {
        let that = this;
        that._logger.log("internal", LOG_ID + "(removeUserFromCompany) requested to delete user : ", user);

        return that.deleteUser(user.id);
    }

    /**
     * Set the visibility for a company
     * @private
     */
    setVisibilityForCompany(company, visibleByCompany) : Promise<any> {

        let that = this;

        that._logger.log("internal", LOG_ID + "(setVisibilityForCompany) parameters : company : ", company);

        return new Promise(function (resolve, reject) {
            try {
                if (!company) {
                    that._logger.log("error", LOG_ID + "(setVisibilityForCompany) bad or empty 'company' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }
                if (!visibleByCompany) {
                    that._logger.log("error", LOG_ID + "(setVisibilityForCompany) bad or empty 'visibleByCompany' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.setVisibilityForCompany(company.id, visibleByCompany.id).then((user) => {
                    that._logger.log("internal", LOG_ID + "(setVisibilityForCompany) Successfully set visibility for company : ", company);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(setVisibilityForCompany) ErrorManager when set visibility for company");
                    that._logger.log("internalerror", LOG_ID + "(setVisibilityForCompany) ErrorManager when set visibility for company : ", company);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("error", LOG_ID + "(setVisibilityForCompany) _exiting_");
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method createUserInCompany
     * @instance
     * @description
     *      Create a new user in a given company <br/>
     * @param {string} email The email of the user to create
     * @param {string} password The associated password
     * @param {string} firstname The user firstname
     * @param {string} lastname  The user lastname
     * @param {string} [companyId="user company"] The Id of the company where to create the user or the connected user company if null
     * @param {string} [language="en-US"] The language of the user. Default is `en-US`. Can be fr-FR, de-DE...
     * @param {boolean} [isCompanyAdmin=false] True to create the user with the right to manage the company (`companyAdmin`). False by default.
     * @param {Array<string>} [roles] The roles the created user.
     * @async
     * @return {Promise<Contact, ErrorManager>}
     * @fulfil {Contact} - Created contact in company or an error object depending on the result
     * @category async
     */
    createUserInCompany(email, password, firstname, lastname, companyId, language, isCompanyAdmin, roles)  : Promise<Contact> {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                language = language || "en-US";

                let isAdmin = isCompanyAdmin || false;

                if (!email) {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) bad or empty 'email' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                if (!password) {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) bad or empty 'password' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                if (!firstname) {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) bad or empty 'firstname' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                if (!lastname) {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) bad or empty 'lastname' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.createUser(email, password, firstname, lastname, companyId, language, isAdmin, roles).then((user : any) => {
                    that._logger.log("debug", LOG_ID + "(createUserInCompany) Successfully created user for account : ", email);
                    let contact = that._contacts.createBasicContact(user.jid_im, undefined);
                    //that._logger.log("internal", LOG_ID + "(_onRosterContactInfoChanged) from server contact before updateFromUserData ", contact);
                    contact.updateFromUserData(user);
                    contact.avatar = that._contacts.getAvatarByContactId(user.id, user.lastAvatarUpdateDate);
                    resolve(contact);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) ErrorManager when creating user for account ");
                    that._logger.log("internalerror", LOG_ID + "(createUserInCompany) ErrorManager when creating user for account : ", email);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createUserInCompany) error : ", err);
                reject(err);
            }
        });
    }

    /**
     * @public
     * @method createGuestUser
     * @instance
     * @description
     *      Create a new guest user in the same company as the requester admin <br/>
     * @param {string} firstname The user firstname
     * @param {string} lastname  The user lastname
     * @param {string} [language="en-US"] The language of the user. Default is `en-US`. Can be fr-FR, de-DE...
     * @param {Number} [timeToLive] Allow to provide a duration in second to wait before starting a user deletion from the creation date
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - Created guest user in company or an error object depending on the result
     * @category async
     */
    createGuestUser(firstname, lastname, language, timeToLive) : Promise<any> {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                language = language || "en-US";

                if (!firstname) {
                    that._logger.log("error", LOG_ID + "(createGuestUser) bad or empty 'firstname' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                if (!lastname) {
                    that._logger.log("error", LOG_ID + "(createGuestUser) bad or empty 'lastname' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                if (timeToLive && isNaN(timeToLive)) {
                    that._logger.log("error", LOG_ID + "(createGuestUser) bad or empty 'timeToLive' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.createGuestUser(firstname, lastname, language, timeToLive).then((user : any) => {
                    that._logger.log("debug", LOG_ID + "(createGuestUser) Successfully created guest user for account : ", user.loginEmail);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + `(createGuestUser) Error when creating guest user`);
                    that._logger.log("internalerror", LOG_ID + `(createGuestUser) Error when creating guest user with firstname: ${firstname}, lastname: ${lastname}`);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createGuestUser) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method createAnonymousGuestUser
     * @since 1.31
     * @instance
     * @description
     *      Create a new anonymous guest user in the same company as the requester admin   <br/>
     *      Anonymous guest user is user without name and firstname   <br/>
     * @param {Number} [timeToLive] Allow to provide a duration in second to wait before starting a user deletion from the creation date
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - Created anonymous guest user in company or an error object depending on the result
     * @category async
     */
    createAnonymousGuestUser(timeToLive) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (timeToLive && isNaN(timeToLive)) {
                    that._logger.log("error", LOG_ID + "(createAnonymousGuestUser) bad or empty 'timeToLive' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.createGuestUser(null, null, null, timeToLive).then((user : any) => {
                    that._logger.log("internal", LOG_ID + "(createAnonymousGuestUser) Successfully created guest user for account : ", user.loginEmail);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createAnonymousGuestUser) ErrorManager when creating anonymous guest user");
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createAnonymousGuestUser) error : ", err);
                reject(err);
            }
        });
    }

    /**
     * @public
     * @method inviteUserInCompany
     * @instance
     * @description
     *      Invite a new user to join a company in Rainbow <br/>
     * @param {string} email The email address of the contact to invite
     * @param {string} companyId     The id of the company where the user will be invited in
     * @param {string} [language="en-US"]  The language of the message to send. Default is `en-US`
     * @param {string} [message=""] A custom message to send
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - Created invitation or an error object depending on the result
     * @category async
     */
    inviteUserInCompany(email, companyId, language, message) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                language = language || "en-US";

                message = message || null;

                if (!email) {
                    that._logger.log("error", LOG_ID + "(inviteUserInCompany) bad or empty 'email' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                if (!companyId) {
                    that._logger.log("error", LOG_ID + "(inviteUserInCompany) bad or empty 'companyId' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.inviteUser(email, companyId, language, message).then((user) => {
                    that._logger.log("internal", LOG_ID + "(inviteUserInCompany) Successfully inviting user for account : ", email);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(inviteUserInCompany) ErrorManager when inviting user for account");
                    that._logger.log("internalerror", LOG_ID + "(inviteUserInCompany) ErrorManager when inviting user for account : ", email, ", error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(inviteUserInCompany) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method changePasswordForUser
     * @instance
     * @description
     *      Change a password for a user <br/>
     * @param {string} password The new password
     * @param {string} userId The id of the user
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - Updated user or an error object depending on the result
     * @category async
     */
    changePasswordForUser(password, userId) {

        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!password) {
                    that._logger.log("error", LOG_ID + "(changePasswordToUser) bad or empty 'password' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                if (!userId) {
                    that._logger.log("error", LOG_ID + "(changePasswordToUser) bad or empty 'userId' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.changePassword(password, userId).then((user) => {
                    that._logger.log("internal", LOG_ID + "(changePasswordToUser) Successfully changing password for user account : ", userId);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(changePasswordToUser) ErrorManager when changing password for user account");
                    that._logger.log("internalerror", LOG_ID + "(changePasswordToUser) ErrorManager when changing password for user account : ", userId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(changePasswordToUser) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method updateInformationForUser
     * @instance
     * @description
     *      Change information of a user. Fields that can be changed: `firstName`, `lastName`, `nickName`, `title`, `jobTitle`, `country`, `language`, `timezone`, `emails` <br/>
     * @param {Object} objData An object (key: value) containing the data to change with their new value
     * @param {string} userId The id of the user
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - Updated user or an error object depending on the result
     * @category async
     */
    updateInformationForUser(objData, userId) {

        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!objData) {
                    that._logger.log("error", LOG_ID + "(updateInformationForUser) bad or empty 'objData' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                if ("loginEmail" in objData) {
                    that._logger.log("error", LOG_ID + "(updateInformationForUser) can't change the loginEmail with that API");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                if ("password" in objData) {
                    that._logger.log("error", LOG_ID + "(updateInformationForUser) can't change the password with that API");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.updateInformation(objData, userId).then((user) => {
                    that._logger.log("internal", LOG_ID + "(updateInformationForUser) Successfully changing information for user account : ", userId);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(updateInformationForUser) ErrorManager when changing information for user account");
                    that._logger.log("internalerror", LOG_ID + "(updateInformationForUser) ErrorManager when changing information for user account : ", userId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(updateInformationForUser) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteUser
     * @instance
     * @description
     *      Delete an existing user <br/>
     * @param {string} userId The id of the user
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - Deleted user or an error object depending on the result
     * @category async
     */
    deleteUser(userId) {

        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!userId) {
                    that._logger.log("error", LOG_ID + "(deleteUser) bad or empty 'userId' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.deleteUser(userId).then((user) => {
                    that._logger.log("debug", LOG_ID + "(deleteUser) Successfully deleting user account ");
                    that._logger.log("internal", LOG_ID + "(deleteUser) Successfully deleting user : ", user);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteUser) ErrorManager when deleting user account : ", userId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(deleteUser) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllCompanies
     * @instance
     * @description
     *      Get all companies for a given admin <br/>
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - Json object containing with all companies (companyId and companyName) or an error object depending on the result
     * @category async
     */
    getAllCompanies() {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getAllCompanies().then((companies : any) => {
                    that._logger.log("debug", LOG_ID + "(getAllCompanies) Successfully get all companies");
                    that._logger.log("internal", LOG_ID + "(getAllCompanies) : companies values : ", companies.data);
                    resolve(companies);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(getAllCompanies) ErrorManager when get All companies");
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllCompanies) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * get a company
     * @private
     */
    getCompanyById(companyId) {
        let that = this;

        return new Promise((resolve, reject) => {
            try {

                that._rest.getCompany(companyId).then((company : any) => {
                    that._logger.log("debug", LOG_ID + "(getCompanyById) Successfully get a company");
                    that._logger.log("internal", LOG_ID + "(getCompanyById) : companies values : ", company.data);
                    resolve(company.data);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getCompanyById) ErrorManager when get a company");
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getCompanyById) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * Remove a company
     * @private
     */
    removeCompany(company) {
        let that = this;

        this._logger.log("internal", LOG_ID + "(removeCompany) parameters : company : ", company);

        return new Promise(function (resolve, reject) {
            try {

                that._rest.deleteCompany(company.id).then((companies : any) => {
                    that._logger.log("debug", LOG_ID + "(removeCompany) Successfully remove company");
                    that._logger.log("internal", LOG_ID + "(removeCompany) : companies values : ", companies.data);
                    resolve(companies);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(removeCompany) ErrorManager when removing company");
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(deleteCompany) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method askTokenOnBehalf
     * @instance
     * @description
     *      Ask Rainbow for a token on behalf a user <br/>
     *      This allow to not use the secret key on client side <br/>
     * @param {string} loginEmail The user login email
     * @param {string} password The user password
     * @async
     * @return {Promise<Object, Error>}
     * @fulfil {Object} - Json object containing the user data, application data and token
     * @category async
     */
    askTokenOnBehalf(loginEmail, password) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._logger.log("internal", LOG_ID + "(askTokenOnBehalf) : loginEmail", loginEmail, " password : ", password);
                that._rest.askTokenOnBehalf(loginEmail, password).then(json => {
                    that._logger.log("debug", LOG_ID + "(askTokenOnBehalf) Successfully logged-in a user");
                    that._logger.log("internal", LOG_ID + "(askTokenOnBehalf) : user data : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(askTokenOnBehalf) Error when getting a token");
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(askTokenOnBehalf) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllUsers
     * @instance
     * @description
     *      Get all users for a given admin <br/>
     * @async
     * @param {string} format Allows to retrieve more or less user details in response.
     *   small: id, loginEmail, firstName, lastName, displayName, companyId, companyName, isTerminated
     *   medium: id, loginEmail, firstName, lastName, displayName, jid_im, jid_tel, companyId, companyName, lastUpdateDate, lastAvatarUpdateDate, isTerminated, guestMode
     *   full: all user fields
     * @param {number} offset Allow to specify the position of first user to retrieve (first user if not specified). Warning: if offset > total, no results are returned.
     * @param {number} limit Allow to specify the number of users to retrieve (default=100).
     * @param {string} sortField Sort user list based on the given field (default="loginEmail").
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Array} - Array of Json object containing users or an error object depending on the result
     * @category async
     */
    getAllUsers(format = "small", offset = 0, limit = 100, sortField="loginEmail") {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getAllUsers(format, offset, limit, sortField).then((users : any) => {
                    that._logger.log("debug", LOG_ID + "(getAllUsers) Successfully get all companies");
                    that._logger.log("internal", LOG_ID + "(getAllUsers) : companies values : ", users.data);
                    resolve(users.data);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(getAllUsers) ErrorManager when get All companies");
                    that._logger.log("internalerror", LOG_ID + "(getAllUsers) ErrorManager when get All companies : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllUsers) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllUsersByCompanyId
     * @instance
     * @description
     *      Get all users for a given admin in a company <br/>
     * @async
     * @param {string} format Allows to retrieve more or less user details in response.
     *   small: id, loginEmail, firstName, lastName, displayName, companyId, companyName, isTerminated
     *   medium: id, loginEmail, firstName, lastName, displayName, jid_im, jid_tel, companyId, companyName, lastUpdateDate, lastAvatarUpdateDate, isTerminated, guestMode
     *   full: all user fields
     * @param {number} offset Allow to specify the position of first user to retrieve (first user if not specified). Warning: if offset > total, no results are returned.
     * @param {number} limit Allow to specify the number of users to retrieve (default=100).
     * @param {string} sortField Sort user list based on the given field (default="loginEmail").
     * @param {string} companyId the id company the users are in. If not provided, then the companyId of the connected user is used.
     });
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Array} - Array of Json object containing users or an error object depending on the result
     * @category async
     */
    getAllUsersByCompanyId(format = "small", offset = 0, limit = 100, sortField="loginEmail", companyId: string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getAllUsers(format, offset, limit, sortField, companyId).then((users : any) => {
                    that._logger.log("debug", LOG_ID + "(getAllUsersByCompanyId) Successfully get all companies");
                    that._logger.log("internal", LOG_ID + "(getAllUsersByCompanyId) : companies values : ", users.data);
                    resolve(users.data);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(getAllUsersByCompanyId) ErrorManager when get All companies");
                    that._logger.log("internalerror", LOG_ID + "(getAllUsersByCompanyId) ErrorManager when get All companies : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllUsersByCompanyId) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllUsersBySearchEmailByCompanyId
     * @instance
     * @description
     *      Get all users for a given admin in a company by a search of string in email<br/>
     * @async
     * @param {string} format Allows to retrieve more or less user details in response.
     *   small: id, loginEmail, firstName, lastName, displayName, companyId, companyName, isTerminated
     *   medium: id, loginEmail, firstName, lastName, displayName, jid_im, jid_tel, companyId, companyName, lastUpdateDate, lastAvatarUpdateDate, isTerminated, guestMode
     *   full: all user fields
     * @param {number} offset Allow to specify the position of first user to retrieve (first user if not specified). Warning: if offset > total, no results are returned.
     * @param {number} limit Allow to specify the number of users to retrieve (default=100).
     * @param {string} sortField Sort user list based on the given field (default="loginEmail").
     * @param {string} companyId the id company the users are in.
     * @param {string} searchEmail the string to to filter users list on the loginEmail field using the word provided in this option..
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Array} - Array of Json object containing users or an error object depending on the result
     * @category async
     */
    getAllUsersBySearchEmailByCompanyId(format = "small", offset = 0, limit = 100, sortField="loginEmail", companyId: string, searchEmail: string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getAllUsers(format, offset, limit, sortField, companyId, searchEmail).then((users : any) => {
                    that._logger.log("debug", LOG_ID + "(getAllUsersBySearchEmailByCompanyId) Successfully get all companies");
                    that._logger.log("internal", LOG_ID + "(getAllUsersBySearchEmailByCompanyId) : companies values : ", users.data);
                    resolve(users.data);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(getAllUsersBySearchEmailByCompanyId) ErrorManager when get All companies");
                    that._logger.log("internalerror", LOG_ID + "(getAllUsersBySearchEmailByCompanyId) ErrorManager when get All companies : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllUsersBySearchEmailByCompanyId) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getContactInfos
     * @instance
     * @description
     *      Get informations about a user <br/>
     * @param {string} userId The id of the user
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - Json object containing informations or an error object depending on the result
     * @category async
     */
    getContactInfos(userId) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getContactInfos(userId).then((result : any) => {
                    that._logger.log("debug", LOG_ID + "(getContactInfos) Successfully get Contact Infos");
                    that._logger.log("internal", LOG_ID + "(getContactInfos) : result : ", result);
                    resolve(result);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(getContactInfos) ErrorManager when get contact infos ");
                    that._logger.log("internalerror", LOG_ID + "(getContactInfos) ErrorManager when get contact infos : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("error", LOG_ID + "(getContactInfos) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method updateContactInfos
     * @instance
     * @description
     *      Set informations about a user <br/>
     * @param {string} userId The id of the user
     * @param {Object} infos The infos of the user : <br/>
     * {string{3..255}}  [infos.loginEmail]      User email address (used for login). <br/>
     * <br/> Must be unique (409 error is returned if a user already exists with the same email address). <br/>
     *  {string{8..64}}   [infos.password]        User password. <br/>
     * <br/> Rules: more than 8 characters, at least 1 capital letter, 1 number, 1 special character. <br/>
     * {string{1..255}}  [infos.firstName]     User first name <br/>
     * {string{1..255}}  [infos.lastName]      User last name <br/>
     * {string{1..255}}  [infos.nickName]      User nickName <br/>
     * {string{1..40}}   [infos.title]         User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...) <br/>
     * {string{1..255}}  [infos.jobTitle]      User job title <br/>
     * {string[]{1..64}} [infos.tags]          An Array of free tags associated to the user. <br/>
     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. <br/>
     * `tags` can only be set by users who have administrator rights on the user. The user can't modify the tags. <br/>
     * The tags are visible by the user and all users belonging to his organisation/company, and can be used with <br/>
     * the search API to search the user based on his tags. <br/>
     * {Object[]}           [infos.emails]        Array of user emails addresses objects <br/>
     * {string{3..255}}          [infos.emails.email]    User email address <br/>
     * {string=home,work,other}  [infos.emails.type]     User email type <br/>
     * {Object[]}           [infos.phoneNumbers]  Array of user phone numbers objects <br/>
     * <br/>
     * <br/><u><i>Note:</i></u> For each provided number, the server tries to compute the associated E.164 number (<code>numberE164</code> field) using provided PhoneNumber country if available, user country otherwise. <br/>
     * If <code>numberE164</code> can't be computed, an error 400 is returned (ex: wrong phone number, phone number not matching country code, ...) <br/>
     * {string{1..32}}   [infos.phoneNumbers.number]    User phone number (as entered by user) <br/>
     * {string{3}}       [infos.phoneNumbers.country]   Phone number country (ISO 3166-1 alpha3 format). Used to compute numberE164 field from number field. <br/>
     * <br/>
     * <br/>If not provided, user country is used by default. <br/>
     * {string=home,work,other}              phoneNumbers.type           Phone number type <br/>
     * {string=landline,mobile,fax,other}    phoneNumbers.deviceType     Phone number device type <br/>
     * {string{3}}       [infos.country]       User country (ISO 3166-1 alpha3 format) <br/>
     * {string=null,"AA","AE","AP","AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","PR","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY","AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"} [infos.state] When country is 'USA' or 'CAN', a state can be defined. Else it is not managed. <br/>
     * <br/> USA states code list: <br/>
     * <li> <code>AA</code>:"Armed Forces America", <br/>
     * <li> <code>AE</code>:"Armed Forces", <br/>
     * <li> <code>AP</code>:"Armed Forces Pacific", <br/>
     * <li> <code>AK</code>:"Alaska", <br/>
     * <li> <code>AL</code>:"Alabama", <br/>
     * <li> <code>AR</code>:"Arkansas", <br/>
     * <li> <code>AZ</code>:"Arizona", <br/>
     * <li> <code>CA</code>:"California", <br/>
     * <li> <code>CO</code>:"Colorado", <br/>
     * <li> <code>CT</code>:"Connecticut", <br/>
     * <li> <code>DC</code>:"Washington DC", <br/>
     * <li> <code>DE</code>:"Delaware", <br/>
     * <li> <code>FL</code>:"Florida", <br/>
     * <li> <code>GA</code>:"Georgia", <br/>
     * <li> <code>GU</code>:"Guam", <br/>
     * <li> <code>HI</code>:"Hawaii", <br/>
     * <li> <code>IA</code>:"Iowa", <br/>
     * <li> <code>ID</code>:"Idaho", <br/>
     * <li> <code>IL</code>:"Illinois", <br/>
     * <li> <code>IN</code>:"Indiana", <br/>
     * <li> <code>KS</code>:"Kansas", <br/>
     * <li> <code>KY</code>:"Kentucky", <br/>
     * <li> <code>LA</code>:"Louisiana", <br/>
     * <li> <code>MA</code>:"Massachusetts", <br/>
     * <li> <code>MD</code>:"Maryland", <br/>
     * <li> <code>ME</code>:"Maine", <br/>
     * <li> <code>MI</code>:"Michigan", <br/>
     * <li> <code>MN</code>:"Minnesota", <br/>
     * <li> <code>MO</code>:"Missouri", <br/>
     * <li> <code>MS</code>:"Mississippi", <br/>
     * <li> <code>MT</code>:"Montana", <br/>
     * <li> <code>NC</code>:"North Carolina", <br/>
     * <li> <code>ND</code>:"Northmo Dakota", <br/>
     * <li> <code>NE</code>:"Nebraska", <br/>
     * <li> <code>NH</code>:"New Hampshire", <br/>
     * <li> <code>NJ</code>:"New Jersey", <br/>
     * <li> <code>NM</code>:"New Mexico", <br/>
     * <li> <code>NV</code>:"Nevada", <br/>
     * <li> <code>NY</code>:"New York", <br/>
     * <li> <code>OH</code>:"Ohio", <br/>
     * <li> <code>OK</code>:"Oklahoma", <br/>
     * <li> <code>OR</code>:"Oregon", <br/>
     * <li> <code>PA</code>:"Pennsylvania", <br/>
     * <li> <code>PR</code>:"Puerto Rico", <br/>
     * <li> <code>RI</code>:"Rhode Island", <br/>
     * <li> <code>SC</code>:"South Carolina", <br/>
     * <li> <code>SD</code>:"South Dakota", <br/>
     * <li> <code>TN</code>:"Tennessee", <br/>
     * <li> <code>TX</code>:"Texas", <br/>
     * <li> <code>UT</code>:"Utah", <br/>
     * <li> <code>VA</code>:"Virginia", <br/>
     * <li> <code>VI</code>:"Virgin Islands", <br/>
     * <li> <code>VT</code>:"Vermont", <br/>
     * <li> <code>WA</code>:"Washington", <br/>
     * <li> <code>WI</code>:"Wisconsin", <br/>
     * <li> <code>WV</code>:"West Virginia", <br/>
     * <li> <code>WY</code>:"Wyoming" <br/>
     * <br/> Canada states code list: <br/>
     * <li> <code>AB</code>: "Alberta", <br/>
     * <li> <code>BC</code>: "British Columbia", <br/>
     * <li> <code>MB</code>: "Manitoba", <br/>
     * <li> <code>NB</code>:	"New Brunswick", <br/>
     * <li> <code>NL</code>: "Newfoundland and Labrador", <br/>
     * <li> <code>NS</code>: "Nova Scotia", <br/>
     * <li> <code>NT</code>: "Northwest Territories", <br/>
     * <li> <code>NU</code>: "Nunavut", <br/>
     * <li> <code>ON</code>: "Ontario", <br/>
     * <li> <code>PE</code>: "Prince Edward Island", <br/>
     * <li> <code>QC</code>: "Quebec", <br/>
     * <li> <code>SK</code>: "Saskatchewan", <br/>
     * <li> <code>YT</code>: "Yukon" <br/>
     * {string="/^([a-z]{2})(?:(?:(-)[A-Z]{2}))?$/"}     [infos.language]      User language <br/>
     * <br/> 
     * <br/> Language format is composed of locale using format <code>ISO 639-1</code>, with optionally the regional variation using <code>ISO 3166‑1 alpha-2</code> (separated by hyphen). <br/>
     * <br/> Locale part is in lowercase, regional part is in uppercase. Examples: en, en-US, fr, fr-FR, fr-CA, es-ES, es-MX, ... <br/>
     * <br/> More information about the format can be found on this <a href="https://en.wikipedia.org/wiki/Language_localisation#Language_tags_and_codes">link</a>. <br/>
     * {string}          [infos.timezone]      User timezone name <br/>
     * <br/> Allowed values: one of the timezone names defined in <a href="https://www.iana.org/time-zones">IANA tz database</a> <br/>
     * <br/> Timezone name are composed as follow: <code>Area/Location</code> (ex: Europe/Paris, America/New_York,...) <br/>
     * {string=free,basic,advanced} [infos.accountType=free]  User subscription type <br/>
     * {string[]=guest,user,admin,bp_admin,bp_finance,company_support,all_company_channels_admin,public_channels_admin,closed_channels_admin,app_admin,app_support,app_superadmin,directory_admin,support,superadmin} [infos.roles='["user"]']   List of user roles <br/>
     * <br/>
     * <br/>The general rule is that a user must have the roles that the wants to assign to someone else. <br/>
     * <br/>Examples: <br/>
     * <ul>
     *     <li>an <code>admin</code> can add or remove the role <code>admin</code> to another user of the company(ies) he manages,</li>
     *     <li>an <code>bp_admin</code> can add or remove the role <code>bp_admin</code> to another user of the company(ies) he manages,</li>
     *     <li>an <code>app_superadmin</code> can add or remove the role <code>app_superadmin</code> to another user...</li>
     * </ul>
     * Here are some explanations regarding the roles available in Rainbow: <br/>
     * <ul>
     * <li><code>admin</code>, <code>bp_admin</code> and <code>bp_finance</code> roles are related to company management (and resources linked to companies, such as users, systems, subscriptions, ...).</li>
     * <li><code>bp_admin</code> and <code>bp_finance</code> roles can only be set to users of a BP company (company with isBP=true).</li>
     * <li><code>app_admin</code>, <code>app_support</code> and <code>app_superadmin</code> roles are related to application management.</li>
     * <li><code>all_company_channels_admin</code>, <code>public_channels_admin</code> and <code>closed_channels_admin</code> roles are related to channels management.</li>
     * <li>Only <code>superadmin</code> can set <code>superadmin</code> and <code>support</code> roles to a user.</li>
     * <li>A user with admin rights (admin, bp_admin, superadmin) can't change his own roles, except for roles related to channels (<code>all_company_channels_admin</code>, <code>public_channels_admin</code> and <code>closed_channels_admin</code>).</li>
     * </ul>
     * {string=organization_admin,company_admin,site_admin} [infos.adminType]  Mandatory if roles array contains <code>admin</code> role: specifies at which entity level the administrator has admin rights in the hierarchy ORGANIZATIONS/COMPANIES/SITES/SYSTEMS <br/>
     * {string}  [infos.companyId]             User company unique identifier (like 569ce8c8f9336c471b98eda1) <br/>
     * <br/> companyName field is automatically filled on server side based on companyId. <br/>
     * {Boolean} [infos.isActive=true]         Is user active <br/>
     * {Boolean} [infos.isInitialized=false]   Is user initialized <br/>
     * {string=private,public,closed,isolated,none} [infos.visibility]  User visibility <br/>
     * </br> Define if the user can be searched by users being in other company and if the user can search users being in other companies. <br/>
     * - `public`: User can be searched by external users / can search external users. User can invite external users / can be invited by external users <br/>
     * - `private`: User **can't** be searched by external users / can search external users. User can invite external users / can be invited by external users <br/>
     * - `closed`: User **can't** be searched by external users / **can't** search external users. User can invite external users / can be invited by external users <br/>
     * - `isolated`: User **can't** be searched by external users / **can't** search external users. User **can't** invite external users / **can't** be invited by external users <br/>
     * - `none`:  Default value reserved for guest. User **can't** be searched by **any users** (even within the same company) / can search external users. User can invite external users / can be invited by external users <br/>
     * <br/>External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company. <br/>
     * {Number} [infos.timeToLive] Duration in second to wait before automatically starting a user deletion from the creation date. <br/>
     * Once the timeToLive has been reached, the user won't be usable to use APIs anymore (error 401523). His account may then be deleted from the database at any moment. <br/>
     * Value -1 means timeToLive is disable (i.e. user account will not expire). <br/>
     * If created user has role <code>guest</code> and no timeToLive is provided, a default value of 172800 seconds is set (48 hours). <br/>
     * If created user does not have role <code>guest</code> and no timeToLive is provided, a default value of -1 is set (no expiration). <br/>
     * {string=DEFAULT,RAINBOW,SAML} [infos.authenticationType] User authentication type (if not set company default authentication will be used) <br/>
     * {string{0..64}}  [infos.userInfo1]      Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br/>
     * {string{0..64}}  [infos.userInfo2]      2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br/>
     * {string} selectedTheme Set the selected theme for the user. <br/>
     * {Object} customData  User's custom data. <br/>
     *    key1 	string User's custom data key1. <br/>
     *    key2 	string Company's custom data key2. <br/>
     *  customData can only be created/updated by: <br/>
     *   the user himself, company_admin or organization_admin of his company, bp_admin and bp_finance of his company, superadmin. <br/> 
     *   Restrictions on customData Object: <br/>
     *   max 10 keys, <br/>
     *   max key length: 64 characters, max value length: 512 characters. It is up to the client to manage the user's customData (new customData provided overwrite the existing one). <br/>   
     *
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - Json object containing informations or an error object depending on the result
     * @category async
     */
    updateContactInfos(userId, infos) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                const propertiesToSave = ["loginEmail", "password", "phoneNumbers", "country", "number", "type", "deviceType", "shortNumber", "systemId", "internalNumber",
                    "firstName", "lastName", "nickName", "title", "jobTitle", "tags", "emails", "country", "state", "language", "timezone",
                    "accountType", "roles", "adminType", "companyId", "isActive", "isInitialized", "visibility", "timeToLive", "authenticationType", "userInfo1", "userInfo2",
                        "selectedTheme","customData"
                ];

                let data = {};

                let infosProperties = Object.keys(infos);

                propertiesToSave.forEach((propname) => {
                   if (infosProperties.find((iter) => {
                       return iter === propname;
                   })) {
                       data[propname] = infos[propname];
                   }
                });

                /*
                if (infosProperties["loginEmail"] != undefined) data["loginEmail"] = infos["loginEmail"];
                if (infosProperties["password"] != undefined) data["password"] = infos["password"];
                if (infosProperties["password"] != undefined) data["phoneNumbers"] = infos["phoneNumbers"];
                if (infosProperties["password"] != undefined) data["country"] = infos["country"];
                if (infosProperties["password"] != undefined) data["number"] = infos["number"];
                if (infosProperties["password"] != undefined) data["type"] = infos["type"];
                if (infosProperties["password"] != undefined) data["deviceType"] = infos["deviceType"];
                if (infosProperties["password"] != undefined) data["shortNumber"] = infos["shortNumber"];
                if (infosProperties["password"] != undefined) data["systemId"] = infos["systemId"];
                if (infosProperties["password"] != undefined) data["internalNumber"] = infos["internalNumber"];
                if (infosProperties["password"] != undefined) data["firstName"] = infos["firstName"];
                if (infosProperties["password"] != undefined) data["lastName"] = infos["lastName"];
                if (infosProperties["password"] != undefined) data["nickName"] = infos["nickName"];
                if (infosProperties["password"] != undefined) data["title"] = infos["title"];
                if (infosProperties["password"] != undefined) data["jobTitle"] = infos["jobTitle"];
                if (infosProperties["password"] != undefined) data["tags"] = infos["tags"];
                if (infosProperties["password"] != undefined) data["emails"] = infos["emails"];
                if (infosProperties["password"] != undefined) data["country"] = infos["country"];
                if (infosProperties["password"] != undefined) data["state"] = infos["state"];
                if (infosProperties["password"] != undefined) data["language"] = infos["language"];
                if (infosProperties["password"] != undefined) data["timezone"] = infos["timezone"];
                if (infosProperties["password"] != undefined) data["accountType"] = infos["accountType"];
                if (infosProperties["password"] != undefined) data["roles"] = infos["roles"];
                if (infosProperties["password"] != undefined) data["adminType"] = infos["adminType"];
                if (infosProperties["password"] != undefined) data["companyId"] = infos["companyId"];
                if (infosProperties["password"] != undefined) data["isActive"] = infos["isActive"];
                if (infosProperties["password"] != undefined) data["isInitialized "] = infos["isInitialized"];
                if (infosProperties["password"] != undefined) data["visibility"] = infos["visibility"];
                if (infosProperties["password"] != undefined) data["timeToLive"] = infos["timeToLive"];
                if (infosProperties["password"] != undefined) data["authenticationType"] = infos["authenticationType"];
                if (infosProperties["password"] != undefined) data["userInfo1"] = infos["userInfo1"];
                if (infosProperties["password"] != undefined) data["userInfo2"] = infos["userInfo2"];
                 */

                that._rest.putContactInfos(userId, data).then((result : any) => {
                    that._logger.log("debug", LOG_ID + "(updateContactInfos) Successfully put all infos");
                    that._logger.log("internal", LOG_ID + "(updateContactInfos) : result : ", result);
                    resolve(result);
                }).catch(function (err) {
                    that._logger.log("internalerror", LOG_ID + "(updateContactInfos) ErrorManager when put infos", err);
                    that._logger.log("error", LOG_ID + "(updateContactInfos) ErrorManager when put infos");
                    return reject(err);
                });


            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     *
     * @public
     * @method getUserPresenceInformation
     * @instance
     * @description
     *      Get presence informations about a user <br/>
     * <br/>
     *      Company admin shall be able to check if a user can be reached or not, by checking the presence information (available, busy, away, etc). <br/>
     *      Admin will have to select a user to get a presence snapshot when opening the user configuration profile. <br/>
     *      A brute force defense is activated when too much request have been requested by the same administrator, to not overload the backend. As a result, an error 429 "Too Many Requests" will be returned . <br/>
     * @param {string} userId The id of the user. If the userId is not provided, then it use the current loggedin user id. 
     * @async
     * @return {Promise<any>}
     * @category async
     */
    getUserPresenceInformation(userId?:undefined) : Promise <any> {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getUserPresenceInformation(userId).then((result : any) => {
                    that._logger.log("debug", LOG_ID + "(getUserPresenceInformation) Successfully get Contact Infos");
                    that._logger.log("internal", LOG_ID + "(getUserPresenceInformation) : result : ", result);
                    resolve(result);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(getUserPresenceInformation) ErrorManager when get contact infos ");
                    that._logger.log("internalerror", LOG_ID + "(getUserPresenceInformation) ErrorManager when get contact infos : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getUserPresenceInformation) error : ", err);
                return reject(err);
            }
        });
    }

    //region Offers and Subscriptions.
    /**
     * @public
     * @method retrieveAllOffersOfCompanyById
     * @since 1.73
     * @instance
     * @async
     * @param {string} companyId Id of the company to be retrieve the offers.
     * @description
     *      Method to retrieve all the offers of one company on server. <br/>
     * @return {Promise<Array<any>>}
     */
    retrieveAllOffersOfCompanyById(companyId?: string) : Promise<Array<any>> {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                companyId = companyId? companyId : that._rest.account.companyId;
                that._rest.retrieveAllCompanyOffers(companyId).then((result: any) => {
                    that._logger.log("debug", LOG_ID + "(retrieveAllOffersOfCompanyById) Successfully get all infos");
                    that._logger.log("internal", LOG_ID + "(retrieveAllOffersOfCompanyById) : result : ", result);
                    resolve(result);
                }).catch(function (err) {
                    that._logger.log("internalerror", LOG_ID + "(retrieveAllOffersOfCompanyById) ErrorManager when put infos", err);
                    that._logger.log("error", LOG_ID + "(retrieveAllOffersOfCompanyById) ErrorManager when put infos");
                    return reject(err);
                });
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method retrieveAllSubscribtionsOfCompanyById
     * @since 1.73
     * @instance
     * @async
     * @param {string} companyId Id of the company to be retrieve the subscriptions.
     * @description
     *      Method to retrieve all the subscriptions of one company on server. <br/>
     * @return {Promise<Array<any>>}
     */
    retrieveAllSubscribtionsOfCompanyById(companyId?: string) : Promise<Array<any>> {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                companyId = companyId? companyId : that._rest.account.companyId;
                that._rest.retrieveAllCompanySubscriptions(companyId).then((result: any) => {
                    that._logger.log("debug", LOG_ID + "(retrieveAllOffersOfCompanyById) Successfully get all infos");
                    that._logger.log("internal", LOG_ID + "(retrieveAllOffersOfCompanyById) : result : ", result);
                    resolve(result);
                }).catch(function (err) {
                    that._logger.log("internalerror", LOG_ID + "(retrieveAllOffersOfCompanyById) ErrorManager when put infos", err);
                    that._logger.log("error", LOG_ID + "(retrieveAllOffersOfCompanyById) ErrorManager when put infos");
                    return reject(err);
                });
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getSubscribtionsOfCompanyByOfferId
     * @since 1.73
     * @instance
     * @async
     * @param {string} offerId Id of the offer to filter subscriptions.
     * @param {string} companyId Id of the company to get the subscription of the offer.
     * @description
     *      Method to get the subscription of one company for one offer. <br/>
     * @return {Promise<any>}
     */
    async getSubscribtionsOfCompanyByOfferId(offerId, companyId) : Promise<any>{
        let that = this;
        return new Promise(async function (resolve, reject) {
            try {        //let Offers =  await that.retrieveAllOffersOfCompanyById(companyId);
                let subscriptions : Array<any> = await that.retrieveAllSubscribtionsOfCompanyById(companyId);
                for (let subscription of subscriptions) {
                    //that._logger.log("debug", "(getSubscribtionsOfCompanyByOfferId) subscription : ", subscription);
                    if (subscription.offerId === offerId) {
                        that._logger.log("debug", "(getSubscribtionsOfCompanyByOfferId) subscription found : ", subscription);
                        return resolve(subscription);
                    }
                }
            } catch (err) {
                return reject(err);
            }
            resolve (undefined);
        });
    }

    /**
     * @public
     * @method subscribeCompanyToOfferById
     * @since 1.73
     * @instance
     * @async
     * @param {string} offerId Id of the offer to filter subscriptions.
     * @param {string} companyId Id of the company to get the subscription of the offer.
     * @param {number} maxNumberUsers
     * @param {boolean} autoRenew
     * @description
     *      Method to subscribe one company to one offer. <br/>
     * @return {Promise<any>}
     */
    subscribeCompanyToOfferById(offerId: string, companyId? : string, maxNumberUsers? : number, autoRenew? : boolean ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!offerId) {
                    that._logger.log("warn", LOG_ID + "(subscribeCompanyToOfferById) bad or empty 'offerId' parameter");
                    that._logger.log("internalerror", LOG_ID + "(subscribeCompanyToOfferById) bad or empty 'offerId' parameter : ", offerId);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                companyId = companyId? companyId : that._rest.account.companyId;
                that._rest.subscribeCompanyToOffer(companyId, offerId, maxNumberUsers, autoRenew ).then((result: any) => {
                    that._logger.log("debug", LOG_ID + "(subscribeCompanyToOfferById) Successfully subscribe.");
                    that._logger.log("internal", LOG_ID + "(subscribeCompanyToOfferById) : result : ", result);
                    resolve(result);
                }).catch(function (err) {
                    that._logger.log("internalerror", LOG_ID + "(subscribeCompanyToOfferById) ErrorManager when put infos", err);
                    that._logger.log("error", LOG_ID + "(subscribeCompanyToOfferById) ErrorManager when put infos");
                    return reject(err);
                });
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @private
     * @method subscribeCompanyToDemoOffer
     * @since 1.73
     * @instance
     * @async
     * @param {string} companyId Id of the company to get the subscription of the offer.
     * @description
     *      Method to subscribe one company to offer demo. <br/>
     *      Private offer on .Net platform. <br/>
     * @return {Promise<any>}
     */
    subscribeCompanyToDemoOffer(companyId? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                companyId = companyId? companyId : that._rest.account.companyId;
                let Offers = await that.retrieveAllOffersOfCompanyById(companyId);
                that._logger.log("debug", "(subscribeCompanyToDemoOffer) - Offers : ", Offers);
                for (let offer of Offers) {
                    that._logger.log("debug", "(subscribeCompanyToDemoOffer) offer : ", offer);
                    if (offer.name === "Enterprise Demo") {
                        that._logger.log("debug", "(subscribeCompanyToDemoOffer) offer Enterprise Demo found : ", offer);
                        resolve (await that.subscribeCompanyToOfferById(offer.id, companyId, 10, true));
                    }
                }
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @private
     * @method unSubscribeCompanyToDemoOffer
     * @since 1.73
     * @instance
     * @async
     * @param {string} companyId Id of the company to get the subscription of the offer.
     * @description
     *      Method to unsubscribe one company to offer demo. <br/>
     *      Private offer on .Net platform. <br/>
     * @return {Promise<any>}
     */
    unSubscribeCompanyToDemoOffer(companyId? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                companyId = companyId? companyId : that._rest.account.companyId;
                let Offers = await that.retrieveAllOffersOfCompanyById(companyId);
                that._logger.log("debug", "(unSubscribeCompanyToDemoOffer) - Offers : ", Offers);
                for (let offer of Offers) {
                    that._logger.log("debug", "(unSubscribeCompanyToDemoOffer) offer : ", offer);
                    if (offer.name === "Enterprise Demo") {
                        that._logger.log("debug", "(unSubscribeCompanyToDemoOffer) offer Enterprise Demo found : ", offer);
                        resolve (await that.unSubscribeCompanyToOfferById(offer.id, companyId));
                    }
                }
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method subscribeCompanyToDemoOffer
     * @since 1.73
     * @instance
     * @async
     * @param {string} companyId Id of the company to get the subscription of the offer.
     * @description
     *      Method to subscribe one company to offer demo. <br/>
     *      Private offer on .Net platform. <br/>
     * @return {Promise<any>}
     */
    subscribeCompanyToAlertOffer(companyId? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                companyId = companyId? companyId : that._rest.account.companyId;
                let Offers = await that.retrieveAllOffersOfCompanyById(companyId);
                that._logger.log("debug", "(subscribeCompanyToAlertOffer) - Offers : ", Offers);
                for (let offer of Offers) {
                    that._logger.log("debug", "(subscribeCompanyToAlertOffer) offer : ", offer);
                    if (offer.name === "Alert Demo" || offer.name === "Alert Custom") { //
                        that._logger.log("debug", "(subscribeCompanyToAlertOffer) offer Enterprise Demo found : ", offer);
                        return resolve (await that.subscribeCompanyToOfferById(offer.id, companyId, 10, true));
                    }
                }
                return reject ({"code" : -1, "label" : "Failed to subscribeCompanyToAlertOffer"}) ;
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method unSubscribeCompanyToDemoOffer
     * @since 1.73
     * @instance
     * @async
     * @param {string} companyId Id of the company to get the subscription of the offer.
     * @description
     *      Method to unsubscribe one company to offer demo. <br/>
     *      Private offer on .Net platform. <br/>
     * @return {Promise<any>}
     */
    unSubscribeCompanyToAlertOffer(companyId? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                companyId = companyId? companyId : that._rest.account.companyId;
                let Offers = await that.retrieveAllOffersOfCompanyById(companyId);
                that._logger.log("debug", "(unSubscribeCompanyToAlertOffer) - Offers : ", Offers);
                for (let offer of Offers) {
                    that._logger.log("debug", "(unSubscribeCompanyToAlertOffer) offer : ", offer);
                    if (offer.name === "Alert Demo" || offer.name === "Alert Custom") {
                        that._logger.log("debug", "(unSubscribeCompanyToAlertOffer) offer Enterprise Demo found : ", offer);
                        resolve (await that.unSubscribeCompanyToOfferById(offer.id, companyId));
                    }
                }
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method unSubscribeCompanyToOfferById
     * @since 1.73
     * @instance
     * @async
     * @param {string} offerId Id of the offer to filter subscriptions.
     * @param {string} companyId Id of the company to get the subscription of the offer.
     * @description
     *      Method to unsubscribe one company to one offer . <br/>
     * @return {Promise<any>}
     */
    unSubscribeCompanyToOfferById(offerId: string, companyId? : string ) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!offerId) {
                    that._logger.log("warn", LOG_ID + "(unSubscribeCompanyToOfferById) bad or empty 'offerId' parameter");
                    that._logger.log("internalerror", LOG_ID + "(unSubscribeCompanyToOfferById) bad or empty 'offerId' parameter : ", offerId);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                companyId = companyId? companyId : that._rest.account.companyId;
                let subscription = await that.getSubscribtionsOfCompanyByOfferId(offerId, companyId) ;
                if (!subscription) {
                    return resolve(undefined);
                }

                that._rest.unSubscribeCompanyToSubscription(companyId, subscription.id ).then((result: any) => {
                    that._logger.log("debug", LOG_ID + "(unSubscribeCompanyToOfferById) Successfully unsubscribe.");
                    that._logger.log("internal", LOG_ID + "(unSubscribeCompanyToOfferById) : result : ", result);
                    resolve(result);
                }).catch(function (err) {
                    that._logger.log("internalerror", LOG_ID + "(unSubscribeCompanyToOfferById) ErrorManager when put infos", err);
                    that._logger.log("error", LOG_ID + "(unSubscribeCompanyToOfferById) ErrorManager when put infos");
                    return reject(err);
                });
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method subscribeUserToSubscription
     * @since 1.73
     * @instance
     * @async
     * @param {string} userId the id of the user which will subscribe. If not provided, the connected user is used.
     * @param {string} subscriptionId the id of the subscription to attach to user.
     * @description
     *      Method to subscribe one user to a subscription of the company. <br/>
     * @return {Promise<any>}
     */
    subscribeUserToSubscription(userId? : string, subscriptionId? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let subscriptionResult = await that._rest.subscribeUserToSubscription(userId,  subscriptionId);
                that._logger.log("debug", "(subscribeUserToSubscription) - subscription sent.");
                that._logger.log("internal", "(subscribeUserToSubscription) - subscription result : ", subscriptionResult);
                resolve (subscriptionResult);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(subscribeUserToSubscription) Error.");
                that._logger.log("internalerror", LOG_ID + "(subscribeUserToSubscription) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method unSubscribeUserToSubscription
     * @since 1.73
     * @instance
     * @async
     * @param {string} userId the id of the user which will unsubscribe. If not provided, the connected user is used.
     * @param {string} subscriptionId the id of the subscription to unsubscribe the user.
     * @description
     *      Method to unsubscribe one user to a subscription. <br/>
     * @return {Promise<any>}
     */
    unSubscribeUserToSubscription(userId? : string, subscriptionId? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let subscriptionResult = await that._rest.unSubscribeUserToSubscription(userId,  subscriptionId);
                that._logger.log("debug", "(unSubscribeUserToSubscription) - unsubscription sent.");
                that._logger.log("internal", "(unSubscribeUserToSubscription) - unsubscription result : ", subscriptionResult);
                resolve (subscriptionResult);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(unSubscribeUserToSubscription) Error.");
                that._logger.log("internalerror", LOG_ID + "(unSubscribeUserToSubscription) Error : ", err);
                return reject(err);
            }
        });
    }
    //endregion

    //region AD/LDAP
    //region AD/LDAP masspro

    /**
     * @public
     * @method synchronizeUsersAndDeviceswithCSV
     * @since 1.86.0
     * @instance
     * @async
     * @param {string} csvTxt the csv of the user and device to synchronize.
     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId
     * @param {string} label a text description of this import
     * @param {boolean} noemails disable email sending 
     * @param {boolean} nostrict create of an existing user and delete of an unexisting user are not errors
     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided)
     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character
     * @description
     *     This API allows to synchronize Rainbow users or devices through a CSV UTF-8 encoded file. it is a merge from user mode and device mode <br/>
     *     The first line of the CSV data describes the content format. Most of the field names are the field names of the admin createUser API. <br/>
     * <br/>
     * Supported fields for "user" management are: <br/>
     * __action__  delete, upsert, sync or detach <br/>
     * loginEmail  (mandatory) <br/>
     * password  (mandatory) <br/>
     * title <br/>
     * firstName <br/>
     * lastName <br/>
     * nickName <br/>
     * businessPhone{n}  (n is a number starting from 0 or 1) <br/>
     * mobilePhone{n}  (n is a number starting from 0 or 1) <br/>
     * email{n}  (n is a number starting from 0 or 1) <br/>
     * tags{n}  (n is a number starting from 0 to 4) <br/>
     * jobTitle <br/>
     * department <br/>
     * userInfo1 <br/>
     * userInfo2 <br/>
     * country <br/>
     * language <br/>
     * timezone <br/>
     * visibility <br/>
     * isInitialized <br/>
     * authenticationType <br/>
     * service{n} <br/>
     * accountType <br/>
     * photoUrl <br/>
     * <br/>
     * Supported fields for "device" management are: <br/>
     * loginEmail (mandatory) <br/>
     * pbxId <br/>
     * pbxShortNumber <br/>
     * pbxInternalNumber <br/>
     * number <br/>
     * <br/>
     * detach: allows to detach an PBX extension from a user. delete: allows to delete a user. upsert: allows to modify user (update or create if doesn't exists) and device (force attach if filled) with filled fields. Remark: empty fields are not taken into account. sync: allows to modify user (update or create if doesn't exists) and device (force attach if filled, detach if empty) with filled fields. <br/>
     * Remark: empty fields are taken into account (if a field is empty we will try to update it with empty value). <br/>
     * <br/>
     * Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. Caution: for sync action: <br/>
     * As empty fields are taken into account, all fields must be filled to avoid a reset of these values <br/>
     * As empty fields are taken into account, it is better to avoid mixing sync __action__ with others actions <br/>
     * <br/>
     * @return {Promise<any>} import summary result.
     */
    synchronizeUsersAndDeviceswithCSV(csvTxt? : string, companyId? : string, label : string = undefined, noemails: boolean = true, nostrict : boolean = false, delimiter? : string, comment : string = "%") : Promise<{
        reqId : string,
        mode : string,
        status : string,
        userId : string,
        displayName : string,
        label : string,
        startTime : string
    }>{
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let synchronizeRestResult = await that._rest.synchronizeUsersAndDeviceswithCSV(csvTxt, companyId , label, noemails, nostrict, delimiter, comment);                
                that._logger.log("debug", "(synchronizeUsersAndDeviceswithCSV) - sent.");
                that._logger.log("internal", "(synchronizeUsersAndDeviceswithCSV) - synchronizeRestResult : ", synchronizeRestResult);
                let synchronizeResult : {
                    reqId : string,
                    mode : string,
                    status : string,
                    userId : string,
                    displayName : string,
                    label : string,
                    startTime : string
                } = synchronizeRestResult;
                // synchronizeRestResult;
                resolve (synchronizeResult);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(synchronizeUsersAndDeviceswithCSV) Error.");
                that._logger.log("internalerror", LOG_ID + "(synchronizeUsersAndDeviceswithCSV) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getCSVTemplate
     * @since 1.86.0
     * @instance
     * @async
     * @param {string}  companyId ompanyId of the users in the CSV file, default to admin's companyId.
     * @param {string} mode Select template to return.
     * - user: provider the user management template
     * - device: provider the device management template
     * - useranddevice: provider the user and device management template (both user and device)
     * - rainbowvoice : provider the user and subscriber/DDI/device association management template.
     * @param {string} comment Only the template comment..
     * @description
     *      This API provides a CSV template. <br/>
     *      result : <br/>
     *      CSV {Object[]} lines with all supported headers and some samples : <br/> 
     *      __action__ {string} Action to perform values : create, update, delete, upsert, detach <br/>
     *      loginEmail {string} email address - Main or professional email used as login <br/>
     *      password optionnel {string} (>= 8 chars with 1 capital+1 number+1 special char) (e.g. This1Pwd!) <br/>
     *      title optionnel {string} (e.g. Mr, Mrs, Dr, ...) <br/>
     *      firstName optionnel {string} <br/>
     *      lastName optionnel {string} <br/>
     *      nickName optionnel {string} <br/>
     *      businessPhone0 optionnel {string} E.164 number - DDI phone number (e.g. +33123456789) <br/>
     *      mobilePhone0 optionnel {string} E.164 number - Mobile phone number (e.g. +33601234567) <br/>
     *      email0 optionnel {string} email address - Personal email <br/>
     *      jobTitle optionnel {string} <br/>
     *      department optionnel {string} <br/>
     *      country optionnel {string} ISO 3166-1 alpha-3 - (e.g. FRA) <br/>
     *      language optionnel {string} ISO 639-1 (en) / with ISO 31661 alpha-2 (en-US) <br/>
     *      timezone optionnel {string} IANA tz database (Europe/Paris) <br/>
     *      pbxShortNumber optionnel {number} PBX extension number <br/>
     *      pbxInternalNumber optionnel {string} E.164 number - Private number when different from extension number <br/>
     *      selectedAppCustomisationTemplateName optionnel {string} Allow to specify an application customisation template for this user. The application customisation template has to be specified using its name (ex: "Chat and Audio", "Custom profile")     Values( Full, Phone, calls, only, Audio, only, Chat, and, Audio, Same, as, company, , profile) <br/>
     *      shortNumber optionnel string subscriber {number} (only for rainbowvoice mode) <br/>
     *      macAddress optionnel {string} macAddress of the associated SIP device of the subscriber (only for rainbowvoice mode) <br/>
     *      ddiE164Number optionnel string E.164 {number} - E164 number of the associted DDI of the subscriber (only for rainbowvoice mode) <br/>
     * @return {Promise<any>}
     */
    getCSVTemplate(companyId? : string, mode : string = "useranddevice", comment? : string ) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let CSVResult = await that._rest.getCSVTemplate(companyId, mode, comment);
                that._logger.log("debug", "(getCSVTemplate) - sent.");
                that._logger.log("internal", "(getCSVTemplate) - result : ", CSVResult);
               
                resolve (CSVResult);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getCSVTemplate) Error.");
                that._logger.log("internalerror", LOG_ID + "(getCSVTemplate) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method checkCSVforSynchronization
     * @since 1.86.0
     * @instance
     * @async
     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId.
     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided).
     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character.
     * @description
     *      This API checks a CSV UTF-8 content for mass-provisioning for useranddevice mode.<br/>
     *      Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. <br/>
     *      { <br/>
     *           actions {Object} actions information <br/>
     *               sync optionnel {number} number of user synchronization actions <br/>
     *               upsert optionnel {number} number of user create/update actions <br/>
     *               delete optionnel {number} number of user remove actions <br/>
     *               detach optionnel {number} number of device unpairing actions <br/>
     *           reqId {string} check request identifier <br/>
     *           mode {string} request csv mode Valeurs autorisées : user, device <br/>
     *           columns {number} number of columns in the CSV <br/>
     *           delimiter {string} the CSV delimiter <br/>
     *           profiles {Object} the managed profiles <br/>
     *              name {string} the managed profiles name <br/>
     *              valid {boolean} the managed profiles validity <br/>
     *              assignedBefore {number} the assigned number of managed profiles before this import <br/>
     *              assignedAfter {number} the assigned number of managed profiles after this import has been fulfilled <br/>
     *              max number the {maximum} number of managed profiles available <br/>
     *      } <br/>
     * @return {Promise<any>}
     */
    checkCSVforSynchronization(CSVTxt, companyId? : string, delimiter?  : string, comment : string  = "%") : any {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let CSVResult = await that._rest.checkCSVforSynchronization(CSVTxt, companyId, delimiter, comment);
                that._logger.log("debug", "(getCSVTemplate) - sent.");
                that._logger.log("internal", "(getCSVTemplate) - result : ", CSVResult);

                resolve (CSVResult);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(checkCSVforSynchronization) Error.");
                that._logger.log("internalerror", LOG_ID + "(checkCSVforSynchronization) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method retrieveRainbowUserList
     * @since 1.86.0
     * @instance
     * @async
     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId.
     * @param {string} format the CSV delimiter character (will be determined by analyzing the CSV file if not provided).
     * @param {boolean} ldap_id the CSV comment start character, use double quotes in field values to escape this character.
     * @description
     *      This API generates a file describing all users (csv or json format). <br/>
     *      return an {Object}  of synchronization data. <br/>
     * @return {Promise<any>}
     */
    retrieveRainbowUserList(companyId? : string, format : string = "csv", ldap_id : boolean = true) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveRainbowUserList(companyId, format, ldap_id);
                that._logger.log("debug", "(getCSVTemplate) - sent.");
                that._logger.log("internal", "(getCSVTemplate) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveRainbowUserList) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveRainbowUserList) Error : ", err);
                return reject(err);
            }
        });
    }
    
    //endregion AD/LDAP masspro
    
    //region LDAP APIs to use:

    /**
     * @public
     * @method ActivateALdapConnectorUser
     * @since 1.86.0
     * @instance
     * @async
     * @description
     *      This API allows to activate a Ldap connector. <br/>
     *      A "Ldap user" is created and registered to the XMPP services. The Ldap user credentials (loginEmail and password) are generated randomly and returned in the response. <br/>
     * <br/>
     *      Note 1 A brute force defense is activated when too much activation have been requested. As a result, an error 429 "Too Many Requests" will be returned during an increasing period to dissuade a slow brute force attack. <br/>
     *      Note 2 Ldap's company should have an active subscription to to activate Ldap. If subscription linked to Ldap is not active or it has no more remaining licenses, error 403 is thrown <br/>
     *      Note 3 Ldap's company should have an SSO authentication Type, and it must be the default authentication Type for users. If company doesn't have an SSO or have one but not a default one, error 403 is thrown <br/>
     *       <br/>
     *      return { <br/>
     *          id {string} ldap connector unique identifier. <br/>
     *          companyId {string} Company linked to the Ldap connector. <br/>
     *          loginEmail {string} Generated Ldap connector user login ("throwaway" email address, never used by rainbow to send email). <br/>
     *          password {string} Generated Ldap connector user password. <br/>
     *          } <br/>
     * @return {Promise<{ id : string, companyId : string, loginEmail : string, password : string}>}
     */
    ActivateALdapConnectorUser() : Promise<{ id : string, companyId : string, loginEmail : string, password : string  }> {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.ActivateALdapConnectorUser();
                that._logger.log("debug", "(ActivateALdapConnectorUser) - sent.");
                that._logger.log("internal", "(ActivateALdapConnectorUser) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(ActivateALdapConnectorUser) Error.");
                that._logger.log("internalerror", LOG_ID + "(ActivateALdapConnectorUser) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method retrieveAllLdapConnectorUsersData
     * @since 1.86.0
     * @instance
     * @async
     * @param {string} companyId the id of the company that allows to filter connectors list on the companyIds provided in this option.
     * @param {string} format Allows to retrieve more or less user details in response.
     * small: id, loginEmail, firstName, lastName, displayName, companyId, companyName, isTerminated
     * medium: id, loginEmail, firstName, lastName, displayName, jid_im, jid_tel, companyId, companyName, lastUpdateDate, lastAvatarUpdateDate, isTerminated, guestMode
     * full: all user fields
     * default : small
     * Values : small, medium, full
     * @param {number} limit Allow to specify the number of users to retrieve. Default value : 100
     * @param {number} offset Allow to specify the position of first user to retrieve (first user if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort user list based on the given field. Default : displayName
     * @param {number} sortOrder Specify order when sorting user list. Default : 1. Values : -1, 1
     * @description
     *     This API allows administrators to retrieve all the ldap connectors. <br/>
     *     Users with superadmin, support role can retrieve the connectors from any company. <br/>
     *     Users with bp_admin or bp_finance role can only retrieve the connectors in companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br/>
     *     Users with admin role can only retrieve the connectors in companies they can manage. That is to say: <br/>
     *     an organization_admin can retrieve the connectors only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br/>
     *     a company_admin can only retrieve the connectors in his company. <br/>
     *     This API can return more or less connector information using format option in query string arguments (default is small). <br/>
     * <br/>
     *      return { // List of connector Objects. <br/>
     *          id string TV unique identifier. <br/>
     *          name string TV name. <br/>
     *          location optionnel string Location of the TV. <br/>
     *          locationDetail optionnel string More detail on the location of the TV. <br/>
     *          room optionnel string Name of the room where the TV is located. <br/>
     *          companyId string company linked to the TV. <br/>
     *          activationCode string Activation code (6 digits). The activationCode may be null in the case its generation in multi-environment database failed. In that case, a security mechanism takes place to generate this activation code asynchronously (try every minutes until the code creation is successful). As soon as the activation code is successfully generated in multi-environment database, the TV is updated accordingly (activationCode set to the generated code value) and with activationCodeGenerationStatus updated to done. <br/>
     *          codeUpdateDate date Date of last activation code update. <br/>
     *          status string TV status:    unassociated (no TV user).    associated with a TV user (the TV has been activated). <br/>
     *          statusUpdatedDate Date-Time Date of last tv status update. <br/>
     *          subscriptionId string Subscription to use when activating TV. <br/>
     *          loginEmail string User email address (used for login) <br/>
     *          firstName string User first name <br/>
     *          lastName string User last name <br/>
     *          displayName string User display name (firstName + lastName concatenated on server side) <br/>
     *          nickName optionnel string User nickName <br/>
     *          title optionnel string User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...) <br/>
     *          jobTitle optionnel string User job title <br/>
     *          department optionnel string User department <br/>
     *          tags optionnel string[] An Array of free tags associated to the user. A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. tags can only be set by users who have administrator rights on the user. The user can't modify the tags. The tags are visible by the user and all users belonging to his organisation/company, and can be used with the search API to search the user based on his tags. <br/>
     *          emails Object[] Array of user emails addresses objects <br/>
     *             email string User email address <br/>
     *             type string Email type, one of home, work, other <br/>
     *          phoneNumbers Object[] Array of user phone numbers objects. Phone number objects can:   be created by user (information filled by user), come from association with a system (pbx) device (association is done by admin). <br/>
     *              phoneNumberId string Phone number unique id in phone-numbers directory collection. <br/>
     *              number optionnel string User phone number (as entered by user) <br/>
     *              numberE164 optionnel string User E.164 phone number, computed by server from number and country fields <br/>
     *              country 	String Phone number country (ISO 3166-1 alpha3 format) country field is automatically computed using the following algorithm when creating/updating a phoneNumber entry: If number is provided and is in E164 format, country is computed from E164 number Else if country field is provided in the phoneNumber entry, this one is used Else user country field is used   isFromSystem Boolean Boolean indicating if phone is linked to a system (pbx). <br/>
     *              shortNumber optionnel 	String [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), short phone number (corresponds to the number monitored by PCG). Only usable within the same PBX. Only PCG can set this field. <br/>
     *              internalNumber optionnel 	String [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), internal phone number. Usable within a PBX group. Admins and users can modify this internalNumber field. <br/>
     *              systemId optionnel 	String [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), unique identifier of that system in Rainbow database. <br/>
     *              pbxId optionnel 	String [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), unique identifier of that pbx. <br/>
     *              type 	String Phone number type, one of home, work, other. <br/>
     *              deviceType 	String Phone number device type, one of landline, mobile, fax, other. <br/>
     *              isVisibleByOthers 	Boolean Allow user to choose if the phone number is visible by other users or not. Note that administrators can see all the phone numbers, even if isVisibleByOthers is set to false. Note that phone numbers linked to a system (isFromSystem=true) are always visible, isVisibleByOthers can't be set to false for these numbers. <br/>
     *         country 	String User country (ISO 3166-1 alpha3 format) <br/>
     *         state optionnel 	String When country is 'USA' or 'CAN', a state can be defined. Else it is not managed (null). <br/>
     *         language optionnel 	String User language (ISO 639-1 code format, with possibility of regional variation. Ex: both 'en' and 'en-US' are supported) <br/>
     *         timezone optionnel 	String User timezone name <br/>
     *         jid_im 	String User Jabber IM identifier <br/>
     *         jid_tel 	String User Jabber TEL identifier <br/>
     *         jid_password 	String User Jabber IM and TEL password <br/>
     *         roles 	String[] List of user roles (Array of String) Note: company_support role is only used for support redirection. If a user writes a #support ticket and have the role company_support, the ticket will be sent to ALE's support (otherwise the ticket is sent to user's company's supportEmail address is set, ALE otherwise). <br/>
     *         adminType 	String In case of user's is 'admin', define the subtype (organisation_admin, company_admin, site_admin (default undefined) <br/>
     *         organisationId 	String In addition to User companyId, optional identifier to indicate the user belongs also to an organization <br/>
     *         siteId 	String In addition to User companyId, optional identifier to indicate the user belongs also to a site <br/>
     *         companyName 	String User company name <br/>
     *         visibility 	String User visibility Define if the user can be searched by users being in other company and if the user can search users being in other companies. Visibility can be: <br/>
     *         same_than_company: The same visibility than the user's company's is applied to the user. When this user visibility is used, if the visibility of the company is changed the user's visibility will use this company new visibility. <br/>
     *         public: User can be searched by external users / can search external users. User can invite external users / can be invited by external users <br/>
     *         private: User can't be searched by external users / can search external users. User can invite external users / can be invited by external users <br/>
     *         closed: User can't be searched by external users / can't search external users. User can invite external users / can be invited by external users <br/>
     *         isolated: User can't be searched by external users / can't search external users. User can't invite external users / can't be invited by external users <br/>
     *         none: Default value reserved for guest. User can't be searched by any users (even within the same company) / can search external users. User can invite external users / can be invited by external users <br/>
     *         External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company. Values(same_than_company, public, private, closed, isolated, none) <br/>
     *         isActive 	Boolean Is user active  <br/>
     *         isInitialized 	Boolean Is user initialized <br/>
     *         initializationDate 	Date-Time User initialization date <br/>
     *         activationDate 	Date-Time User activation date <br/>
     *         creationDate 	Date-Time User creation date <br/>
     *         lastUpdateDate 	Date-Time Date of last user update (whatever the field updated) <br/>
     *         lastAvatarUpdateDate 	Date-Time Date of last user avatar create/update, null if no avatar <br/>
     *         createdBySelfRegister 	Boolean true if user has been created using self register <br/>
     *         createdByAdmin optionnel 	Object If user has been created by an admin or superadmin, contain userId and loginEmail of the admin who created this user <br/>
     *         userId 	String userId of the admin who created this user <br/>
     *         loginEmail 	String loginEmail of the admin who created this user <br/>
     *         invitedBy optionnel 	Object If user has been created from an email invitation sent by another rainbow user, contain the date the invitation was sent and userId and loginEmail of the user who invited this user <br/>
     *         userId 	String userId of the user who invited this user <br/>
     *         loginEmail 	String loginEmail of the user who invited this user <br/>
     *         authenticationType optionnel 	String User authentication type (if not set company default authentication will be used) Values (DEFAULT, RAINBOW, SAML, OIDC) <br/>
     *         authenticationExternalUid optionnel 	String User external authentication ID (return by identity provider in case of SAML or OIDC authenticationType) <br/>
     *         firstLoginDate 	Date-Time Date of first user login (only set the first time user logs in, null if user never logged in) <br/>
     *         lastLoginDate 	Date-Time Date of last user login (defined even if user is logged out) <br/>
     *         loggedSince 	Date-Time Date of last user login (null if user is logged out) <br/>
     *         isTerminated 	Boolean Indicates if the Rainbow account of this user has been deleted <br/>
     *         guestMode 	Boolean Indicated a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration. <br/>
     *         timeToLive optionnel 	Number Duration in second to wait before automatically starting a user deletion from the creation date. Once the timeToLive has been reached, the user won't be usable to use APIs anymore (error 401523). His account may then be deleted from the database at any moment. Value -1 means timeToLive is disable (i.e. user account will not expire). <br/>
     *         userInfo1 optionnel 	String Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br/>
     *         userInfo2 optionnel 	String 2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br/>
     *         useScreenSharingCustomisation 	String Activate/Deactivate the capability for a user to share a screen. Define if a user has the right to share his screen. <br/>
     *         useScreenSharingCustomisation can be: <br/>
     *            same_than_company: The same useScreenSharingCustomisation setting than the user's company's is applied to the user. if the useScreenSharingCustomisation of the company is changed the user's useScreenSharingCustomisation will use this company new setting. <br/>
     *            enabled: Each user of the company can share his screen. <br/>
     *            disabled: No user of the company can share his screen. <br/>
     *         customData optionnel 	Object User's custom data. Object with free keys/values. It is up to the client to manage the user's customData (new customData provided overwrite the existing one). Restrictions on customData Object: max 20 keys, max key length: 64 characters, max value length: 4096 characters. <br/>
     *         activationCodeGenerationStatus 	String Status the activation code generation done if the activation code generation is successful <br/>
     *         in_progress if the activation code generation failed and the security mechanism is ongoing to try to generate it again every minute Valeurs autorisées : done, in_progress <br/>
     *         fileSharingCustomisation 	String Activate/Deactivate file sharing capability per user Define if the user can use the file sharing service then, allowed to download and share file. <br/>
     *         FileSharingCustomisation can be: <br/>
     *            same_than_company: The same fileSharingCustomisation setting than the user's company's is applied to the user. if the fileSharingCustomisation of the company is changed the user's fileSharingCustomisation will use this company new setting. <br/>
     *            enabled: Whatever the fileSharingCustomisation of the company setting, the user can use the file sharing service. <br/>
     *            disabled: Whatever the fileSharingCustomisation of the company setting, the user can't use the file sharing service. <br/>
     *         userTitleNameCustomisation 	String Activate/Deactivate the capability for a user to modify his profile (title, firstName, lastName) Define if the user can change some profile data. <br/>
     *         userTitleNameCustomisation can be: <br/>
     *            same_than_company: The same userTitleNameCustomisation setting than the user's company's is applied to the user. if the userTitleNameCustomisation of the company is changed the user's userTitleNameCustomisation will use this company new setting. <br/>
     *            enabled: Whatever the userTitleNameCustomisation of the company setting, the user can change some profile data. <br/>
     *            disabled: Whatever the userTitleNameCustomisation of the company setting, the user can't change some profile data. <br/>
     *         softphoneOnlyCustomisation 	String Activate/Deactivate the capability for an UCaas application not to offer all Rainbow services but to focus to telephony services Define if UCaas apps used by a user of this company must provide Softphone functions, i.e. no chat, no bubbles, no meetings, no channels, and so on. <br/>
     *         softphoneOnlyCustomisation can be: <br/>
     *            same_than_company: The same softphoneOnlyCustomisation setting than the user's company's is applied to the user. if the softphoneOnlyCustomisation of the company is changed the user's softphoneOnlyCustomisation will use this company new setting. <br/>
     *            enabled: The user switch to a softphone mode only. <br/>
     *            disabled: The user can use telephony services, chat, bubbles, channels meeting services and so on. <br/>
     *         useRoomCustomisation 	String Activate/Deactivate the capability for a user to use bubbles. Define if a user can create bubbles or participate in bubbles (chat and web conference). <br/>
     *         useRoomCustomisation can be: <br/>
     *            same_than_company: The same useRoomCustomisation setting than the user's company's is applied to the user. if the useRoomCustomisation of the company is changed the user's useRoomCustomisation will use this company new setting. <br/>
     *            enabled: The user can use bubbles. <br/>
     *            disabled: The user can't use bubbles. <br/>
     *         phoneMeetingCustomisation 	String Activate/Deactivate the capability for a user to use phone meetings (PSTN conference). Define if a user has the right to join phone meetings. <br/>
     *         phoneMeetingCustomisation can be: <br/>
     *            same_than_company: The same phoneMeetingCustomisation setting than the user's company's is applied to the user. if the phoneMeetingCustomisation of the company is changed the user's phoneMeetingCustomisation will use this company new setting. <br/>
     *            enabled: The user can join phone meetings. <br/>
     *            disabled: The user can't join phone meetings. <br/>
     *         useChannelCustomisation 	String Activate/Deactivate the capability for a user to use a channel. Define if a user has the right to create channels or be a member of channels. <br/>
     *         useChannelCustomisation can be: <br/>
     *            same_than_company: The same useChannelCustomisation setting than the user's company's is applied to the user. if the useChannelCustomisation of the company is changed the user's useChannelCustomisation will use this company new setting. <br/>
     *            enabled: The user can use some channels. <br/>
     *            disabled: The user can't use some channel. <br/>
     *         useWebRTCVideoCustomisation 	String Activate/Deactivate the capability for a user to switch to a Web RTC video conversation. Define if a user has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call). <br/>
     *         useWebRTCVideoCustomisation can be: <br/>
     *            same_than_company: The same useWebRTCVideoCustomisation setting than the user's company's is applied to the user. if the useWebRTCVideoCustomisation of the company is changed the user's useWebRTCVideoCustomisation will use this company new setting. <br/>
     *            enabled: The user can switch to a Web RTC video conversation. <br/>
     *            disabled: The user can't switch to a Web RTC video conversation. <br/>
     *         useWebRTCAudioCustomisation 	String Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation. Define if a user has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call). <br/>
     *         useWebRTCAudioCustomisation can be: <br/>
     *            same_than_company: The same useWebRTCAudioCustomisation setting than the user's company's is applied to the user. if the useWebRTCAudioCustomisation of the company is changed the user's useWebRTCAudioCustomisation will use this company new setting. <br/>
     *            enabled: The user can switch to a Web RTC audio conversation. <br/>
     *            disabled: The user can't switch to a Web RTC audio conversation. <br/>
     *         instantMessagesCustomisation 	String Activate/Deactivate the capability for a user to use instant messages. Define if a user has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications. <br/>
     *         instantMessagesCustomisation can be: <br/>
     *            same_than_company: The same instantMessagesCustomisation setting than the user's company's is applied to the user. if the instantMessagesCustomisation of the company is changed the user's instantMessagesCustomisation will use this company new setting. <br/>
     *            enabled: The user can use instant messages. <br/>
     *            disabled: The user can't use instant messages. <br/>
     *         userProfileCustomisation 	String Activate/Deactivate the capability for a user to modify his profile. Define if a user has the right to modify the globality of his profile and not only (title, firstName, lastName). <br/>
     *         userProfileCustomisation can be: <br/>
     *            same_than_company: The same userProfileCustomisation setting than the user's company's is applied to the user. if the userProfileCustomisation of the company is changed the user's userProfileCustomisation will use this company new setting. <br/>
     *            enabled: The user can modify his profile. <br/>
     *            disabled: The user can't modify his profile. <br/>
     *         fileStorageCustomisation 	String Activate/Deactivate the capability for a user to access to Rainbow file storage.. Define if a user has the right to upload/download/copy or share documents. <br/>
     *         fileStorageCustomisation can be: <br/>
     *            same_than_company: The same fileStorageCustomisation setting than the user's company's is applied to the user. if the fileStorageCustomisation of the company is changed the user's fileStorageCustomisation will use this company new setting. <br/>
     *            enabled: The user can manage and share files. <br/>
     *            disabled: The user can't manage and share files. <br/>
     *         overridePresenceCustomisation 	String Activate/Deactivate the capability for a user to use instant messages. Define if a user has the right to change his presence manually or only use automatic states. <br/>
     *         overridePresenceCustomisation can be: <br/>
     *            same_than_company: The same overridePresenceCustomisation setting than the user's company's is applied to the user. if the overridePresenceCustomisation of the company is changed the user's overridePresenceCustomisation will use this company new setting. <br/>
     *            enabled: The user can change his presence. <br/>
     *            disabled: The user can't change his presence. <br/>
     *         changeTelephonyCustomisation 	String Activate/Deactivate the ability for a user to modify telephony settings. Define if a user has the right to modify some telephony settigs like forward activation... <br/>
     *         changeTelephonyCustomisation can be: <br/>
     *            same_than_company: The same changeTelephonyCustomisation setting than the user's company's is applied to the user. if the changeTelephonyCustomisation of the company is changed the user's changeTelephonyCustomisation will use this company new setting. <br/>
     *            enabled: The user can modify telephony settings. <br/>
     *            disabled: The user can't modify telephony settings. <br/>
     *         changeSettingsCustomisation 	String Activate/Deactivate the ability for a user to change all client general settings. <br/>
     *         changeSettingsCustomisation can be: <br/>
     *            same_than_company: The same changeSettingsCustomisation setting than the user's company's is applied to the user. if the changeSettingsCustomisation of the company is changed the user's changeSettingsCustomisation will use this company new setting. <br/>
     *            enabled: The user can change all client general settings. <br/>
     *            disabled: The user can't change any client general setting. <br/>
     *         recordingConversationCustomisation 	String Activate/Deactivate the capability for a user to record a conversation. Define if a user has the right to record a conversation (for P2P and multi-party calls). <br/>
     *         recordingConversationCustomisation can be: <br/>
     *            same_than_company: The same recordingConversationCustomisation setting than the user's company's is applied to the user. if the recordingConversationCustomisation of the company is changed the user's recordingConversationCustomisation will use this company new setting. <br/>
     *            enabled: The user can record a peer to peer or a multi-party call. <br/>
     *            disabled: The user can't record a peer to peer or a multi-party call. <br/>
     *         useGifCustomisation 	String Activate/Deactivate the ability for a user to Use GIFs in conversations. Define if a user has the is allowed to send animated GIFs in conversations <br/>
     *         useGifCustomisation can be: <br/>
     *            same_than_company: The same useGifCustomisation setting than the user's company's is applied to the user. if the useGifCustomisation of the company is changed the user's useGifCustomisation will use this company new setting. <br/>
     *            enabled: The user can send animated GIFs in conversations. <br/>
     *            disabled: The user can't send animated GIFs in conversations. <br/>
     *         fileCopyCustomisation 	String Activate/Deactivate the capability for one user to copy any file he receives in his personal cloud space <br/>
     *         fileCopyCustomisation can be: <br/>
     *            same_than_company: The same fileCopyCustomisation setting than the user's company's is applied to the user. if the fileCopyCustomisation of the company is changed the user's fileCopyCustomisation will use this company new setting. <br/>
     *            enabled: The user can make a copy of a file to his personal cloud space. <br/>
     *            disabled: The user can't make a copy of a file to his personal cloud space. <br/>
     *         fileTransferCustomisation 	String Activate/Deactivate the capability for a user to copy a file from a conversation then share it inside another conversation. The file cannot be re-shared. <br/>
     *         fileTransferCustomisation can be: <br/>
     *            same_than_company: The same fileTransferCustomisation setting than the user's company's is applied to the user. if the fileTransferCustomisation of the company is changed the user's fileTransferCustomisation will use this company new setting. <br/>
     *            enabled: The user can transfer a file doesn't belong to him. <br/>
     *            disabled: The user can't transfer a file doesn't belong to him. <br/>
     *         forbidFileOwnerChangeCustomisation 	String Activate/Deactivate the capability for a user to loose the ownership on one file.. One user can drop the ownership to another Rainbow user of the same company. <br/>
     *         forbidFileOwnerChangeCustomisation can be: <br/>
     *            same_than_company: The same forbidFileOwnerChangeCustomisation setting than the user's company's is applied to the user. if the forbidFileOwnerChangeCustomisation of the company is changed the user's forbidFileOwnerChangeCustomisation will use this company new setting. <br/>
     *            enabled: The user can't give the ownership of his file. <br/>
     *            disabled: The user can give the ownership of his file. <br/>
     *         useDialOutCustomisation 	String Activate/Deactivate the capability for a user to use dial out in phone meetings. Define if a user is allowed to be called by the Rainbow conference bridge. <br/>
     *         useDialOutCustomisation can be: <br/>
     *            same_than_company: The same useDialOutCustomisation setting than the user's company's is applied to the user. if the useDialOutCustomisation of the company is changed the user's useDialOutCustomisation will use this company new setting. <br/>
     *            enabled: The user can be called by the Rainbow conference bridge. <br/>
     *            disabled: The user can't be called by the Rainbow conference bridge. <br/>
     *         selectedAppCustomisationTemplate 	String To log the last template applied to the user. <br/>
     *      } <br/>
     * @return {Promise<any>}
     */
    retrieveAllLdapConnectorUsersData (companyId? : string, format : string = "small", limit : number = 100, offset : number = undefined, sortField : string = "displayName", sortOrder : number = 1) : Promise<any> {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveAllLdapConnectorUsersData (companyId, format, limit, offset, sortField, sortOrder );
                that._logger.log("debug", "(retrieveAllLdapConnectorUsersData) - sent.");
                that._logger.log("internal", "(retrieveAllLdapConnectorUsersData) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveAllLdapConnectorUsersData) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveAllLdapConnectorUsersData) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteLdapConnector
     * @since 1.86.0
     * @instance
     * @async
     * @param {string} ldapId the Id of the ldap connector to delete.
     * @description
     *      This API is to delete the connector (the connector cannot be modified by the others admin APIs) <br/>
     *      return { <br/>
     *          status {string} Delete operation status message. <br/>
     *          } <br/>
     * @return {Promise<{ status : string}>}
     */
    deleteLdapConnector(ldapId : string) : Promise<{ status : string }> {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.deleteLdapConnector(ldapId);
                that._logger.log("debug", "(deleteLdapConnector) - sent.");
                that._logger.log("internal", "(deleteLdapConnector) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(deleteLdapConnector) Error.");
                that._logger.log("internalerror", LOG_ID + "(deleteLdapConnector) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method retrieveLdapConnectorConfigTemplate
     * @since 1.86.0
     * @instance
     * @async
     * @description
     *      This API allows to retrieve the configuration template for the connector. <br/>
     *      return { <br/>
     *         id 	String Config unique identifier. <br/>
     *         type 	String Config type  <br/>
     *         companyId 	String Allows to specify for which company the connectors configuration is done.. <br/>
     *         settings 	Object config settings <br/>
     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br/>
     *                 headerName 	String headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br/>
     *             company 	Object specific settings for the company. Each key represent a setting. <br/>
     *                 login 	String login for the ldap server. <br/>
     *                 password 	String password for the ldap server. <br/>
     *                 synchronizationTimeInterval 	String time interval between synchronization in hours. <br/>
     *                 url 	String url of the ldap server. <br/>
     *          } <br/>
     * @return {Promise<{Object}>}
     */
    retrieveLdapConnectorConfigTemplate() {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveLdapConnectorConfigTemplate();
                that._logger.log("debug", "(retrieveLdapConnectorConfigTemplate) - sent.");
                that._logger.log("internal", "(retrieveLdapConnectorConfigTemplate) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveLdapConnectorConfigTemplate) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveLdapConnectorConfigTemplate) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method createConfigurationForLdapConnector
     * @since 1.86.0
     * @instance
     * @async
     * @param {string} companyId the id of the company.
     * @param {Object} settings config settings.
     * @param {Object} settings.massproFromLdap list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal.
     * @param {string} settings.massproFromLdap.headerName headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap (only when a ldap field exists for this headerName, should never be empty).
     * @param {Object} settings.company specific settings for the company. Each key represent a setting. 
     * @param {string} settings.company.login login for the ldap server. 
     * @param {string} settings.company.password password for the ldap server. 
     * @param {number} settings.company.synchronizationTimeInterval time interval between synchronization in hours. 
     * @param {string} settings.company.url url of the ldap server. 
     * @description
     *      This API allows create configuration for the connector. <br/>
     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br/>
     *      Users with superadmin, support role can create the connectors configuration from any company. <br/>
     *      Users with bp_admin or bp_finance role can only create the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br/>
     *      Users with admin role can only create the connectors configuration in companies they can manage. That is to say: <br/>
     *      an organization_admin can create the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br/>
     *      a company_admin can only create the connectors configuration in his company. <br/>
     *      return { <br/>
     *         id 	String Config unique identifier. <br/>
     *         type 	String Config type  <br/>
     *         companyId 	String Allows to specify for which company the connectors configuration is done.. <br/>
     *         settings 	Object config settings <br/>
     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br/>
     *                 headerName 	String headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br/>
     *             company 	Object specific settings for the company. Each key represent a setting. <br/>
     *                 login 	String login for the ldap server. <br/>
     *                 password 	String password for the ldap server. <br/>
     *                 synchronizationTimeInterval 	String time interval between synchronization in hours. <br/>
     *                 url 	String url of the ldap server. <br/>
     *          } <br/>
     * @return {Promise<{Object}>}
     */
    createConfigurationForLdapConnector (companyId, settings) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                companyId = companyId ? companyId : that._rest.account.companyId;
                
                if (!settings) {
                    this._logger.log("warn", LOG_ID + "(setBubbleAutoRegister) bad or empty 'settings' parameter");
                    this._logger.log("internalerror", LOG_ID + "(setBubbleAutoRegister) bad or empty 'settings' parameter : ", settings);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
                
                let result = await that._rest.createConfigurationForLdapConnector(companyId, settings);
                that._logger.log("debug", "(createConfigurationForLdapConnector) - sent.");
                that._logger.log("internal", "(createConfigurationForLdapConnector) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(createConfigurationForLdapConnector) Error.");
                that._logger.log("internalerror", LOG_ID + "(createConfigurationForLdapConnector) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @public
     * @method updateConfigurationForLdapConnector
     * @since 1.86.0
     * @instance
     * @async
     * @param {string} ldapConfigId ldap connector unique identifier
     * @param {Object} settings config settings
     * @param {Object} settings.massproFromLdap list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal.
     * @param {string} settings.massproFromLdap.headerName headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap (only when a ldap field exists for this headerName, should never be empty).
     * @param {Object} settings.company specific settings for the company. Each key represent a setting.
     * @param {string} settings.company.login login for the ldap server.
     * @param {string} settings.company.password password for the ldap server.
     * @param {number} settings.company.synchronizationTimeInterval time interval between synchronization in hours.
     * @param {string} settings.company.url url of the ldap server.
     * @param {boolean} strict Allows to specify if all the previous fields must be erased or just update/push new fields.
     * @description
     *      This API allows update configuration for the connector. <br/>
     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br/>
     *      Users with superadmin, support role can update the connectors configuration from any company. <br/>
     *      Users with bp_admin or bp_finance role can only update the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br/>
     *      Users with admin role can only update the connectors configuration in companies they can manage. That is to say: <br/>
     *      an organization_admin can update the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br/>
     *      a company_admin can only update the connectors configuration in his company. <br/>
     *      return { <br/>
     *         id 	String Config unique identifier. <br/>
     *         type 	String Config type  <br/>
     *         companyId 	String Allows to specify for which company the connectors configuration is done.. <br/>
     *         settings 	Object config settings <br/>
     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br/>
     *                 headerName 	String headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br/>
     *             company 	Object specific settings for the company. Each key represent a setting. <br/>
     *                 login 	String login for the ldap server. <br/>
     *                 password 	String password for the ldap server. <br/>
     *                 synchronizationTimeInterval 	String time interval between synchronization in hours. <br/>
     *                 url 	String url of the ldap server. <br/>
     *          } <br/>
     * @return {Promise<{Object}>}
     */
    updateConfigurationForLdapConnector (ldapConfigId : string, settings : any, strict  : boolean = false) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!ldapConfigId) {
                    this._logger.log("warn", LOG_ID + "(updateConfigurationForLdapConnector) bad or empty 'ldapConfigId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(updateConfigurationForLdapConnector) bad or empty 'ldapConfigId' parameter : ", settings);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
                
                if (!settings) {
                    this._logger.log("warn", LOG_ID + "(updateConfigurationForLdapConnector) bad or empty 'settings' parameter");
                    this._logger.log("internalerror", LOG_ID + "(updateConfigurationForLdapConnector) bad or empty 'settings' parameter : ", settings);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
                
                let result = await that._rest.updateConfigurationForLdapConnector(ldapConfigId, settings, strict);
                that._logger.log("debug", "(updateConfigurationForLdapConnector) - sent.");
                that._logger.log("internal", "(updateConfigurationForLdapConnector) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateConfigurationForLdapConnector) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateConfigurationForLdapConnector) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method retrieveLdapConnectorConfig
     * @since 1.86.0
     * @instance
     * @async
     * @param {string} companyId Allows to filter connectors list on the companyId provided in this option. In the case of admin (except superadmin and support roles), provided companyId should correspond to a company visible by logged in user's company (if some of the provided companyId are not visible by logged in user's company, connectors from these companies will not be returned). if not provided, default is admin's company.
     * @description
     *      This API allows to retrieve the configuration for the connector. <br/>
     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br/>
     *      Users with superadmin, support role can retrieve the connectors configuration from any company. <br/>
     *      Users with bp_admin or bp_finance role can only retrieve the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br/>
     *      Users with admin role can only retrieve the connectors configuration in companies they can manage. That is to say: <br/>
     *      an organization_admin can retrieve the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br/>
     *      a company_admin can only retrieve the connectors configuration in his company. <br/>
     *      return { <br/>
     *         id 	String Config unique identifier. <br/>
     *         type 	String Config type  <br/>
     *         companyId 	String Allows to specify for which company the connectors configuration is done.. <br/>
     *         settings 	Object config settings <br/>
     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br/>
     *                 headerName 	String headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br/>
     *             company 	Object specific settings for the company. Each key represent a setting. <br/>
     *                 login 	String login for the ldap server. <br/>
     *                 password 	String password for the ldap server. <br/>
     *                 synchronizationTimeInterval 	String time interval between synchronization in hours. <br/>
     *                 url 	String url of the ldap server. <br/>
     *          } <br/>
     * @return {Promise<{Object}>}
     */
    retrieveLdapConnectorConfig (companyId) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                companyId = companyId ? companyId : that._rest.account.companyId;

                if (!companyId) {
                    this._logger.log("warn", LOG_ID + "(retrieveLdapConnectorConfig) bad or empty 'companyId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(retrieveLdapConnectorConfig) bad or empty 'companyId' parameter : ", companyId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.retrieveLdapConnectorConfig(companyId);
                that._logger.log("debug", "(retrieveLdapConnectorConfig) - sent.");
                that._logger.log("internal", "(retrieveLdapConnectorConfig) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveLdapConnectorConfig) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveLdapConnectorConfig) Error : ", err);
                return reject(err);
            }
        });
    }


    //endregion LDAP APIs to use
    
    //endregion AD/LDAP
    
    //region Rainbow Voice Communication Platform Provisioning
    // Server doc : https://hub.openrainbow.com/api/ngcpprovisioning/index.html#tag/Cloudpbx

    /**
     * @public
     * @method getCloudPbxById
     * @since 2.0.2
     * @instance
     * @async
     * @param {string} systemId CloudPBX unique identifier.
     * @description
     *      This API allows administrator to retrieve a CloudPBX using its identifier. <br/>
     * @return {Promise<any>}
     */
    getCloudPbxById (systemId) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                //companyId = companyId ? companyId : that._rest.account.companyId;

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPbxById) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPbxById) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.getCloudPbxById(systemId);
                that._logger.log("debug", "(getCloudPbxById) - sent.");
                that._logger.log("internal", "(getCloudPbxById) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getCloudPbxById) Error.");
                that._logger.log("internalerror", LOG_ID + "(getCloudPbxById) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getCloudPbxs
     * @since 2.0.2
     * @instance
     * @async
     * @description
     *      This API allows administrator to retrieve a list of CloudPBXs. <br/>
     * @return {Promise<any>}
     */
    getCloudPbxs () {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                //companyId = companyId ? companyId : that._rest.account.companyId;

                /*
                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPbxs) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPbxs) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                } // */

                let result = await that._rest.getCloudPbxs();
                that._logger.log("debug", "(getCloudPbxs) - sent.");
                that._logger.log("internal", "(getCloudPbxs) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getCloudPbxs) Error.");
                that._logger.log("internalerror", LOG_ID + "(getCloudPbxs) Error : ", err);
                return reject(err);
            }
        });
    }
    
    //endregion Rainbow Voice Communication Platform Provisioning 
    
}

module.exports.AdminService = Admin;
module.exports.OFFERTYPES = OFFERTYPES;
export {Admin as AdminService, OFFERTYPES};
