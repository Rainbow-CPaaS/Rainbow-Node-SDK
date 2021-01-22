"use strict";

import {XMPPService} from "../connection/XMPPService";

export {};

import {ErrorManager} from "../common/ErrorManager";
import  {RESTService} from "../connection/RESTService";
import {isStarted, logEntryExit} from "../common/Utils";
import {EventEmitter} from "events";
import {Logger} from "../common/Logger";
import {S2SService} from "./S2SService";
import {resolve} from "dns";

const LOG_ID = "ADMIN/SVCE - ";

enum  OFFERTYPES {
    FREEMIUM= "freemium",
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
class Admin {
    private _xmpp: XMPPService;
    private _rest: RESTService;
    private _eventEmitter: EventEmitter;
    private _logger: Logger;
    public ready: boolean = false;
    private readonly _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    private _options: any;
    private _useXMPP: any;
    private _useS2S: any;
    private _s2s: S2SService;

    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    static getClassName(){ return 'Admin'; }
    getClassName(){ return Admin.getClassName(); }

    constructor(_eventEmitter : EventEmitter, _logger : Logger, _startConfig) {
        this._startConfig = _startConfig;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
        this.ready = false;
    }

    start(_options, _core) { //  _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService
        let that = this;


        return new Promise(function (resolve, reject) {
            try {
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;

                that._options = _options;
                that._s2s = _core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;

                that.ready = true;
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
                that.ready = false;
                resolve(undefined);
            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(stop) error : ", err);
                return reject(err);
            }
        });
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
    createCompany(strName :string, country : string, state : string, offerType? : OFFERTYPES) {
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
    removeUserFromCompany(user) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(removeUserFromCompany) requested to delete user : ", user);

        return that.deleteUser(user.id);
    }

    /**
     * Set the visibility for a company
     * @private
     */
    setVisibilityForCompany(company, visibleByCompany) {

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
    createUserInCompany(email, password, firstname, lastname, companyId, language, isCompanyAdmin, roles) {
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

                that._rest.createUser(email, password, firstname, lastname, companyId, language, isAdmin, roles).then((user) => {
                    that._logger.log("debug", LOG_ID + "(createUserInCompany) Successfully created user for account : ", email);
                    resolve(user);
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
    createGuestUser(firstname, lastname, language, timeToLive) {
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
     * {String{3..255}}  [infos.loginEmail]      User email address (used for login). <br/>
     * <br/> Must be unique (409 error is returned if a user already exists with the same email address). <br/>
     *  {String{8..64}}   [infos.password]        User password. <br/>
     * <br/> Rules: more than 8 characters, at least 1 capital letter, 1 number, 1 special character. <br/>
     * {String{1..255}}  [infos.firstName]     User first name <br/>
     * {String{1..255}}  [infos.lastName]      User last name <br/>
     * {String{1..255}}  [infos.nickName]      User nickName <br/>
     * {String{1..40}}   [infos.title]         User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...) <br/>
     * {String{1..255}}  [infos.jobTitle]      User job title <br/>
     * {String[]{1..64}} [infos.tags]          An Array of free tags associated to the user. <br/>
     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. <br/>
     * `tags` can only be set by users who have administrator rights on the user. The user can't modify the tags. <br/>
     * The tags are visible by the user and all users belonging to his organisation/company, and can be used with <br/>
     * the search API to search the user based on his tags. <br/>
     * {Object[]}           [infos.emails]        Array of user emails addresses objects <br/>
     * {String{3..255}}          [infos.emails.email]    User email address <br/>
     * {String=home,work,other}  [infos.emails.type]     User email type <br/>
     * {Object[]}           [infos.phoneNumbers]  Array of user phone numbers objects <br/>
     * <br/>
     * <br/><u><i>Note:</i></u> For each provided number, the server tries to compute the associated E.164 number (<code>numberE164</code> field) using provided PhoneNumber country if available, user country otherwise. <br/>
     * If <code>numberE164</code> can't be computed, an error 400 is returned (ex: wrong phone number, phone number not matching country code, ...) <br/>
     * {String{1..32}}   [infos.phoneNumbers.number]    User phone number (as entered by user) <br/>
     * {String{3}}       [infos.phoneNumbers.country]   Phone number country (ISO 3166-1 alpha3 format). Used to compute numberE164 field from number field. <br/>
     * <br/>
     * <br/>If not provided, user country is used by default. <br/>
     * {String=home,work,other}              phoneNumbers.type           Phone number type <br/>
     * {String=landline,mobile,fax,other}    phoneNumbers.deviceType     Phone number device type <br/>
     * {String{3}}       [infos.country]       User country (ISO 3166-1 alpha3 format) <br/>
     * {String=null,"AA","AE","AP","AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","PR","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY","AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"} [infos.state] When country is 'USA' or 'CAN', a state can be defined. Else it is not managed. <br/>
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
     * {String="/^([a-z]{2})(?:(?:(-)[A-Z]{2}))?$/"}     [infos.language]      User language <br/>
     * <br/> 
     * <br/> Language format is composed of locale using format <code>ISO 639-1</code>, with optionally the regional variation using <code>ISO 3166‑1 alpha-2</code> (separated by hyphen). <br/>
     * <br/> Locale part is in lowercase, regional part is in uppercase. Examples: en, en-US, fr, fr-FR, fr-CA, es-ES, es-MX, ... <br/>
     * <br/> More information about the format can be found on this <a href="https://en.wikipedia.org/wiki/Language_localisation#Language_tags_and_codes">link</a>. <br/>
     * {String}          [infos.timezone]      User timezone name <br/>
     * <br/> Allowed values: one of the timezone names defined in <a href="https://www.iana.org/time-zones">IANA tz database</a> <br/>
     * <br/> Timezone name are composed as follow: <code>Area/Location</code> (ex: Europe/Paris, America/New_York,...) <br/>
     * {String=free,basic,advanced} [infos.accountType=free]  User subscription type <br/>
     * {String[]=guest,user,admin,bp_admin,bp_finance,company_support,all_company_channels_admin,public_channels_admin,closed_channels_admin,app_admin,app_support,app_superadmin,directory_admin,support,superadmin} [infos.roles='["user"]']   List of user roles <br/>
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
     * {String=organization_admin,company_admin,site_admin} [infos.adminType]  Mandatory if roles array contains <code>admin</code> role: specifies at which entity level the administrator has admin rights in the hierarchy ORGANIZATIONS/COMPANIES/SITES/SYSTEMS <br/>
     * {String}  [infos.companyId]             User company unique identifier (like 569ce8c8f9336c471b98eda1) <br/>
     * <br/> companyName field is automatically filled on server side based on companyId. <br/>
     * {Boolean} [infos.isActive=true]         Is user active <br/>
     * {Boolean} [infos.isInitialized=false]   Is user initialized <br/>
     * {String=private,public,closed,isolated,none} [infos.visibility]  User visibility <br/>
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
     * {String=DEFAULT,RAINBOW,SAML} [infos.authenticationType] User authentication type (if not set company default authentication will be used) <br/>
     * {String{0..64}}  [infos.userInfo1]      Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br/>
     * {String{0..64}}  [infos.userInfo2]      2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br/>
     * {String} selectedTheme Set the selected theme for the user. <br/>
     * {Object} customData  User's custom data. <br/>
     *    key1 	String User's custom data key1. <br/>
     *    key2 	String Company's custom data key2. <br/>
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
                that._logger.log("debug", "(subscribeUserToSubscription) - subscription result : ", subscriptionResult);
                resolve (subscriptionResult);
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @private
     * @private
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
                that._logger.log("debug", "(unSubscribeUserToSubscription) - unsubscription result : ", subscriptionResult);
                resolve (subscriptionResult);
            } catch (err) {
                return reject(err);
            }
        });
    }
    //endregion
}

module.exports.AdminService = Admin;
module.exports.OFFERTYPES = OFFERTYPES;
export {Admin as AdminService, OFFERTYPES};
