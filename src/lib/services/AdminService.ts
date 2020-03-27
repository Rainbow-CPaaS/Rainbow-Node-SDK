"use strict";

import {XMPPService} from "../connection/XMPPService";

export {};

import {ErrorManager} from "../common/ErrorManager";
import  {RESTService} from "../connection/RESTService";
import {isStarted, logEntryExit} from "../common/Utils";
import EventEmitter = NodeJS.EventEmitter;
import {Logger} from "../common/Logger";
import {S2SService} from "./S2SService";

const LOG_ID = "ADMIN/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name Admin
 * @version SDKVERSION
 * @public
 * @description
 *      This module handles the management of users. Using it, You will be able to create new users, to modify information of users and to delete them.<br>
 *      This module can be use too to create Guest users who are specific temporaly users that can be used in Rainbow.
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Create a new user in a specified company <br>
 *      - Modify information of an existing user <br>
 *      - Delete an existing user <br>
 *      - Invite a user in Rainbow <br>
 *      - Change the password of a user <br>
 *      - Create a guest user
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
                resolve();
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
                resolve();
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
     *      Create a company
     * @param {string} strName The name of the new company
     * @param {string} country Company country (ISO 3166-1 alpha3 format, size 3 car)
     * @param {string} state (optionnal if not USA)  define a state when country is 'USA' (["ALASKA", "....", "NEW_YORK", "....", "WYOMING"] ), else it is not managed by server. Default value on server side: ALABAMA
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - Created Company or an error object depending on the result
     * @category async
     */
    createCompany(strName, country, state) {
        let that = this;

        that._logger.log("internal", LOG_ID + "(createCompany) parameters : strName : ", strName,", country : ", country);

        return new Promise(function (resolve, reject) {
            try {
                if (!strName) {
                    that._logger.log("error", LOG_ID + "(createCompany) bad or empty 'strName' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.createCompany(strName, country, state).then((company) => {
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
     *      Create a new user in a given company
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
     *      Create a new guest user in the same company as the requester admin
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
     *      Create a new anonymous guest user in the same company as the requester admin
     *      Anonymous guest user is user without name and firstname
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
     *      Invite a new user to join a company in Rainbow
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
     *      Change a password for a user
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
     *      Change information of a user. Fields that can be changed: `firstName`, `lastName`, `nickName`, `title`, `jobTitle`, `country`, `language`, `timezone`, `emails`
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
     *      Delete an existing user
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
     *      Get all companies for a given admin
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

        this._logger.log("internal", LOG_ID + "(deleteCompany) parameters : company : ", company);

        return new Promise(function (resolve, reject) {
            try {

                that._rest.deleteCompany(company.id).then((companies : any) => {
                    that._logger.log("debug", LOG_ID + "(deleteCompany) Successfully remove company");
                    that._logger.log("internal", LOG_ID + "(deleteCompany) : companies values : ", companies.data);
                    resolve(companies);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(deleteCompany) ErrorManager when removing company");
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
     *      Ask Rainbow for a token on behalf a user
     *      This allow to not use the secret key on client side
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
                that._rest.askTokenOnBehalf(loginEmail, password).then(json => {
                    that._logger.log("debug", LOG_ID + "(getGuestOrUserToken) Successfully logged-in a user");
                    that._logger.log("internal", LOG_ID + "(getGuestOrUserToken) : user data : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(getGuestOrUserToken) Error when getting a token");
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getGuestOrUserToken) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllUsers
     * @instance
     * @description
     *      Get all users for a given admin
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
     * @method getContactInfos
     * @instance
     * @description
     *      Get informations about a user
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
     *      Set informations about a user
     * @param {string} userId The id of the user
     * @param {Object} infos The infos of the user :
     * {String{3..255}}  [infos.loginEmail]      User email address (used for login).
     * <br/> Must be unique (409 error is returned if a user already exists with the same email address).
     *  {String{8..64}}   [infos.password]        User password.
     * <br/> Rules: more than 8 characters, at least 1 capital letter, 1 number, 1 special character.
     * {String{1..255}}  [infos.firstName]     User first name
     * {String{1..255}}  [infos.lastName]      User last name
     * {String{1..255}}  [infos.nickName]      User nickName
     * {String{1..40}}   [infos.title]         User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...)
     * {String{1..255}}  [infos.jobTitle]      User job title
     * {String[]{1..64}} [infos.tags]          An Array of free tags associated to the user.
     * <br/> A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters.
     * <br/> `tags` can only be set by users who have administrator rights on the user. The user can't modify the tags.
     * <br/> The tags are visible by the user and all users belonging to his organisation/company, and can be used with
     * the search API to search the user based on his tags.
     * {Object[]}           [infos.emails]        Array of user emails addresses objects
     * {String{3..255}}          [infos.emails.email]    User email address
     * {String=home,work,other}  [infos.emails.type]     User email type
     * {Object[]}           [infos.phoneNumbers]  Array of user phone numbers objects
     * <br/>
     * <br/><u><i>Note:</i></u> For each provided number, the server tries to compute the associated E.164 number (<code>numberE164</code> field) using provided PhoneNumber country if available, user country otherwise.
     * If <code>numberE164</code> can't be computed, an error 400 is returned (ex: wrong phone number, phone number not matching country code, ...)
     * {String{1..32}}   [infos.phoneNumbers.number]    User phone number (as entered by user)
     * {String{3}}       [infos.phoneNumbers.country]   Phone number country (ISO 3166-1 alpha3 format). Used to compute numberE164 field from number field.
     * <br/>
     * <br/>If not provided, user country is used by default.
     * {String=home,work,other}              phoneNumbers.type           Phone number type
     * {String=landline,mobile,fax,other}    phoneNumbers.deviceType     Phone number device type
     * {String{3}}       [infos.country]       User country (ISO 3166-1 alpha3 format)
     * {String=null,"AA","AE","AP","AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","PR","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY","AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"} [infos.state] When country is 'USA' or 'CAN', a state can be defined. Else it is not managed.
     * <br/> USA states code list:
     * <li> <code>AA</code>:"Armed Forces America",
     * <li> <code>AE</code>:"Armed Forces",
     * <li> <code>AP</code>:"Armed Forces Pacific",
     * <li> <code>AK</code>:"Alaska",
     * <li> <code>AL</code>:"Alabama",
     * <li> <code>AR</code>:"Arkansas",
     * <li> <code>AZ</code>:"Arizona",
     * <li> <code>CA</code>:"California",
     * <li> <code>CO</code>:"Colorado",
     * <li> <code>CT</code>:"Connecticut",
     * <li> <code>DC</code>:"Washington DC",
     * <li> <code>DE</code>:"Delaware",
     * <li> <code>FL</code>:"Florida",
     * <li> <code>GA</code>:"Georgia",
     * <li> <code>GU</code>:"Guam",
     * <li> <code>HI</code>:"Hawaii",
     * <li> <code>IA</code>:"Iowa",
     * <li> <code>ID</code>:"Idaho",
     * <li> <code>IL</code>:"Illinois",
     * <li> <code>IN</code>:"Indiana",
     * <li> <code>KS</code>:"Kansas",
     * <li> <code>KY</code>:"Kentucky",
     * <li> <code>LA</code>:"Louisiana",
     * <li> <code>MA</code>:"Massachusetts",
     * <li> <code>MD</code>:"Maryland",
     * <li> <code>ME</code>:"Maine",
     * <li> <code>MI</code>:"Michigan",
     * <li> <code>MN</code>:"Minnesota",
     * <li> <code>MO</code>:"Missouri",
     * <li> <code>MS</code>:"Mississippi",
     * <li> <code>MT</code>:"Montana",
     * <li> <code>NC</code>:"North Carolina",
     * <li> <code>ND</code>:"Northmo Dakota",
     * <li> <code>NE</code>:"Nebraska",
     * <li> <code>NH</code>:"New Hampshire",
     * <li> <code>NJ</code>:"New Jersey",
     * <li> <code>NM</code>:"New Mexico",
     * <li> <code>NV</code>:"Nevada",
     * <li> <code>NY</code>:"New York",
     * <li> <code>OH</code>:"Ohio",
     * <li> <code>OK</code>:"Oklahoma",
     * <li> <code>OR</code>:"Oregon",
     * <li> <code>PA</code>:"Pennsylvania",
     * <li> <code>PR</code>:"Puerto Rico",
     * <li> <code>RI</code>:"Rhode Island",
     * <li> <code>SC</code>:"South Carolina",
     * <li> <code>SD</code>:"South Dakota",
     * <li> <code>TN</code>:"Tennessee",
     * <li> <code>TX</code>:"Texas",
     * <li> <code>UT</code>:"Utah",
     * <li> <code>VA</code>:"Virginia",
     * <li> <code>VI</code>:"Virgin Islands",
     * <li> <code>VT</code>:"Vermont",
     * <li> <code>WA</code>:"Washington",
     * <li> <code>WI</code>:"Wisconsin",
     * <li> <code>WV</code>:"West Virginia",
     * <li> <code>WY</code>:"Wyoming"
     * <br/> Canada states code list:
     * <li> <code>AB</code>: "Alberta",
     * <li> <code>BC</code>: "British Columbia",
     * <li> <code>MB</code>: "Manitoba",
     * <li> <code>NB</code>:	"New Brunswick",
     * <li> <code>NL</code>: "Newfoundland and Labrador",
     * <li> <code>NS</code>: "Nova Scotia",
     * <li> <code>NT</code>: "Northwest Territories",
     * <li> <code>NU</code>: "Nunavut",
     * <li> <code>ON</code>: "Ontario",
     * <li> <code>PE</code>: "Prince Edward Island",
     * <li> <code>QC</code>: "Quebec",
     * <li> <code>SK</code>: "Saskatchewan",
     * <li> <code>YT</code>: "Yukon"
     * {String="/^([a-z]{2})(?:(?:(-)[A-Z]{2}))?$/"}     [infos.language]      User language
     * <br/>
     * <br/> Language format is composed of locale using format <code>ISO 639-1</code>, with optionally the regional variation using <code>ISO 3166‑1 alpha-2</code> (separated by hyphen).
     * <br/> Locale part is in lowercase, regional part is in uppercase. Examples: en, en-US, fr, fr-FR, fr-CA, es-ES, es-MX, ...
     * <br/> More information about the format can be found on this <a href="https://en.wikipedia.org/wiki/Language_localisation#Language_tags_and_codes">link</a>.
     * {String}          [infos.timezone]      User timezone name
     * <br/> Allowed values: one of the timezone names defined in <a href="https://www.iana.org/time-zones">IANA tz database</a>
     * <br/> Timezone name are composed as follow: <code>Area/Location</code> (ex: Europe/Paris, America/New_York,...)
     * {String=free,basic,advanced} [infos.accountType=free]  User subscription type
     * {String[]=guest,user,admin,bp_admin,bp_finance,company_support,all_company_channels_admin,public_channels_admin,closed_channels_admin,app_admin,app_support,app_superadmin,directory_admin,support,superadmin} [infos.roles='["user"]']   List of user roles
     * <br/>
     * <br/>The general rule is that a user must have the roles that the wants to assign to someone else.
     * <br/>Examples:
     * <ul>
     *     <li>an <code>admin</code> can add or remove the role <code>admin</code> to another user of the company(ies) he manages,</li>
     *     <li>an <code>bp_admin</code> can add or remove the role <code>bp_admin</code> to another user of the company(ies) he manages,</li>
     *     <li>an <code>app_superadmin</code> can add or remove the role <code>app_superadmin</code> to another user...</li>
     * </ul>
     * Here are some explanations regarding the roles available in Rainbow:
     * <ul>
     * <li><code>admin</code>, <code>bp_admin</code> and <code>bp_finance</code> roles are related to company management (and resources linked to companies, such as users, systems, subscriptions, ...).</li>
     * <li><code>bp_admin</code> and <code>bp_finance</code> roles can only be set to users of a BP company (company with isBP=true).</li>
     * <li><code>app_admin</code>, <code>app_support</code> and <code>app_superadmin</code> roles are related to application management.</li>
     * <li><code>all_company_channels_admin</code>, <code>public_channels_admin</code> and <code>closed_channels_admin</code> roles are related to channels management.</li>
     * <li>Only <code>superadmin</code> can set <code>superadmin</code> and <code>support</code> roles to a user.</li>
     * <li>A user with admin rights (admin, bp_admin, superadmin) can't change his own roles, except for roles related to channels (<code>all_company_channels_admin</code>, <code>public_channels_admin</code> and <code>closed_channels_admin</code>).</li>
     * </ul>
     * {String=organization_admin,company_admin,site_admin} [infos.adminType]  Mandatory if roles array contains <code>admin</code> role: specifies at which entity level the administrator has admin rights in the hierarchy ORGANIZATIONS/COMPANIES/SITES/SYSTEMS
     * {String}  [infos.companyId]             User company unique identifier (like 569ce8c8f9336c471b98eda1)
     * <br/> companyName field is automatically filled on server side based on companyId.
     * {Boolean} [infos.isActive=true]         Is user active
     * {Boolean} [infos.isInitialized=false]   Is user initialized
     * {String=private,public,closed,isolated,none} [infos.visibility]  User visibility
     * </br> Define if the user can be searched by users being in other company and if the user can search users being in other companies.
     * - `public`: User can be searched by external users / can search external users. User can invite external users / can be invited by external users
     * - `private`: User **can't** be searched by external users / can search external users. User can invite external users / can be invited by external users
     * - `closed`: User **can't** be searched by external users / **can't** search external users. User can invite external users / can be invited by external users
     * - `isolated`: User **can't** be searched by external users / **can't** search external users. User **can't** invite external users / **can't** be invited by external users
     * - `none`:  Default value reserved for guest. User **can't** be searched by **any users** (even within the same company) / can search external users. User can invite external users / can be invited by external users
     * <br/>External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company.
     * {Number} [infos.timeToLive] Duration in second to wait before automatically starting a user deletion from the creation date.
     * <br/> Once the timeToLive has been reached, the user won't be usable to use APIs anymore (error 401523). His account may then be deleted from the database at any moment.
     * <br/> Value -1 means timeToLive is disable (i.e. user account will not expire).
     * <br/> If created user has role <code>guest</code> and no timeToLive is provided, a default value of 172800 seconds is set (48 hours).
     * <br/> If created user does not have role <code>guest</code> and no timeToLive is provided, a default value of -1 is set (no expiration).
     * {String=DEFAULT,RAINBOW,SAML} [infos.authenticationType] User authentication type (if not set company default authentication will be used)
     * {String{0..64}}  [infos.userInfo1]      Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file)
     * {String{0..64}}  [infos.userInfo2]      2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file)
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
                    "accountType", "roles", "adminType", "companyId", "isActive", "isInitialized", "visibility", "timeToLive", "authenticationType", "userInfo1", "userInfo2"
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



}

module.exports.AdminService = Admin;
export {Admin as AdminService};
