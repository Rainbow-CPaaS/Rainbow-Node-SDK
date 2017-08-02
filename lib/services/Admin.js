"use strict";

let ErrorCase = require("../common/Error");

const LOG_ID = "ADMIN - ";

/**
 * @class
 * @name Admin
 * @description
 *      This service manage user information. 
 */
class Admin {

    constructor(_eventEmitter, _logger) {
        this._xmpp = null;
        this._rest = null;
        this._bubbles = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
    }

    start(_xmpp, _rest) {
        let that = this;

        this._logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = _xmpp;
                that._rest = _rest;
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();
            }
            catch (err) {
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                reject();
            }
        });
    }

    stop() {
        let that = this;

        this._logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve) {
            try {
                that._xmpp = null;
                that._rest = null;
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve();
            } catch (err) {
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject(err);
            }
        });
    }

    /**
     * @public
     * @method createUserInCompany
     * @description
     *      Create a new user in a company
     * @param {string} strEmail The email of the user to create
     * @param {string} strPassword The associated password
     * @param {string} strFirstname The user firstname
     * @param {string} strLastname  The user lastname
     * @param {string} strCompanyId The Id of the company where to create the user
     * @param {string} [strLanguage="en-US"] The language of the user. Default is `en-US`. Can be fr-FR, de-DE... 
     * @param {boolean} [boolIsCompanyAdmin=false] True to create the user with the right to manage the company (`companyAdmin`). False by default. 
     * @return {Object} A promise containing the user created or an SDK Error
     * @memberof Admin
     */
    createUserInCompany(strEmail, strPassword, strFirstname, strLastname, strCompanyId, strLanguage, boolIsCompanyAdmin) {
        let that = this;

        this._logger.log("debug", LOG_ID + "(createUserInCompany) _entering_");

        return new Promise(function(resolve, reject) {
            try {

                let language = strLanguage || "en-US";

                let isAdmin = boolIsCompanyAdmin || false;

                if (!strEmail) {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) bad or empty 'strEmail' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (!strPassword) {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) bad or empty 'strPassword' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (!strFirstname) {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) bad or empty 'strFirstname' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (!strLastname) {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) bad or empty 'strLastname' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (!strCompanyId) {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) bad or empty 'strCompanyId' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                that._rest.createUser(strEmail, strPassword, strFirstname, strLastname, strCompanyId, language, isAdmin).then( (user) => {
                    that._logger.log("debug", LOG_ID + "(createUserInCompany) Successfully created user for account", strEmail);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) Error when creating user for account", strEmail);
                    reject(err);
                });

                that._logger.log("debug", LOG_ID + "(createUserInCompany) _exiting_");
            } catch (err) {
                that._logger.log("debug", LOG_ID + "(createUserInCompany) _exiting_");
                reject(err);
            }
        });
    }

    /**
     * @public
     * @method createGuestUser
     * @description
     *      Create a new guest user in the same company as the requester admin
     * @param {string} strFirstname The user firstname
     * @param {string} strLastname  The user lastname
     * @param {string} [strLanguage="en-US"] The language of the user. Default is `en-US`. Can be fr-FR, de-DE... 
     * @param {Number} [timeToLive] Allow to provide a duration in second to wait before starting a user deletion from the creation date
     * @return {Object} A promise containing the user created or an SDK Error
     * @memberof Admin
     */
    createGuestUser( strFirstname, strLastname, strLanguage, timeToLive) {
        let that = this;

        this._logger.log("debug", LOG_ID + "(createGuestUser) _entering_");

        return new Promise(function(resolve, reject) {
            try {

                let language = strLanguage || "en-US";

                if (!strFirstname) {
                    that._logger.log("error", LOG_ID + "(createGuestUser) bad or empty 'strFirstname' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (!strLastname) {
                    that._logger.log("error", LOG_ID + "(createGuestUser) bad or empty 'strLastname' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (timeToLive && isNaN(timeToLive) ) {
                    that._logger.log("error", LOG_ID + "(createGuestUser) bad or empty 'timeToLive' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                that._rest.createGuestUser( strFirstname, strLastname, language, timeToLive ).then( (user) => {
                    that._logger.log("debug", LOG_ID + "(createGuestUser) Successfully created guest user for account ", user.loginEmail);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + `(createGuestUser) Error when creating guest user with firstname: ${strFirstname}, lastname: ${strLastname}`);
                    reject(err);
                });

                that._logger.log("debug", LOG_ID + "(createGuestUser) _exiting_");
            } catch (err) {
                that._logger.log("debug", LOG_ID + "(createGuestUser) _exiting_");
                reject(err);
            }
        });
    }

    /**
     * @public
     * @method inviteUserInCompany
     * @description
     *      Invite a new user to join a company in Rainbow
     * @param {string} strEmail The email address of the contact to invite
     * @param {string} strCompanyId     The id of the company where the user will be invited in
     * @param {string} [strLanguage="en-US"]  The language of the message to send. Default is `en-US`
     * @param {string} [strMessage=""] A custom message to send
     * @return [Object} A promise containing the invitation of an SDK Error
     * @memberof Admin
     */
    inviteUserInCompany(strEmail, strCompanyId, strLanguage, strMessage) {
        let that = this;

        this._logger.log("debug", LOG_ID + "(inviteUserInCompany) _entering_");

        return new Promise(function(resolve, reject) {
            try {

                let language = strLanguage || "en-US";

                let message = strMessage || null;

                if (!strEmail) {
                    that._logger.log("error", LOG_ID + "(inviteUserInCompany) bad or empty 'strEmail' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (!strCompanyId) {
                    that._logger.log("error", LOG_ID + "(inviteUserInCompany) bad or empty 'strCompanyId' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                that._rest.inviteUser(strEmail, strCompanyId, language, message).then( (user) => {
                    that._logger.log("debug", LOG_ID + "(inviteUserInCompany) Successfully inviting user for account", strEmail);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(inviteUserInCompany) Error when inviting user for account", strEmail);
                    reject(err);
                });

                that._logger.log("debug", LOG_ID + "(inviteUserInCompany) _exiting_");
            } catch (err) {
                that._logger.log("debug", LOG_ID + "(inviteUserInCompany) _exiting_");
                reject(err);
            }
        });
    }

    /**
     * @public
     * @method changePasswordForUser
     * @description
     *      Change a password for a user 
     * @param {string} strPassword The new password
     * @param {string} strUserId The id of the user
     * @return {Object} A promise containing the user or a SDK error
     * @memberof Admin
     */
    changePasswordForUser(strPassword, strUserId) {

        let that = this;

        this._logger.log("debug", LOG_ID + "(changePasswordToUser) _entering_");

        return new Promise(function(resolve, reject) {
            try {

                if (!strPassword) {
                    that._logger.log("error", LOG_ID + "(changePasswordToUser) bad or empty 'strPassword' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (!strUserId) {
                    that._logger.log("error", LOG_ID + "(changePasswordToUser) bad or empty 'strUserId' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                that._rest.changePassword(strPassword, strUserId).then( (user) => {
                    that._logger.log("debug", LOG_ID + "(changePasswordToUser) Successfully changing password for user account", strUserId);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(changePasswordToUser) Error when changing password for user account", strUserId);
                    reject(err);
                });

                that._logger.log("debug", LOG_ID + "(changePasswordToUser) _exiting_");
            } catch (err) {
                that._logger.log("debug", LOG_ID + "(changePasswordToUser) _exiting_");
                reject(err);
            }
        });
    }

    /**
     * @public
     * @method updateInformationForUser
     * @description
     *      Change information of a user. Fields that can be changed: `firstName`, `lastName`, `nickName`, `title`, `jobTitle`, `country`, `language`, `timezone`, `emails` 
     * @param {Object} objData An object (key: value) containing the data to change with their new value
     * @param {string} strUserId The id of the user
     * @return {Object} A promise containing the user or a SDK error
     * @memberof Admin
     */
    updateInformationForUser(objData, strUserId) {

        let that = this;

        this._logger.log("debug", LOG_ID + "(updateInformationForUser) _entering_");

        return new Promise(function(resolve, reject) {
            try {

                if (!objData) {
                    that._logger.log("error", LOG_ID + "(updateInformationForUser) bad or empty 'objData' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if ("loginEmail" in objData) {
                    that._logger.log("error", LOG_ID + "(updateInformationForUser) can't change the loginEmail with that API");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if ("password" in objData) {
                    that._logger.log("error", LOG_ID + "(updateInformationForUser) can't change the password with that API");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                that._rest.updateInformation(objData, strUserId).then( (user) => {
                    that._logger.log("debug", LOG_ID + "(updateInformationForUser) Successfully changing information for user account", strUserId);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(updateInformationForUser) Error when changing information for user account", strUserId);
                    reject(err);
                });

                that._logger.log("debug", LOG_ID + "(updateInformationForUser) _exiting_");
            } catch (err) {
                that._logger.log("debug", LOG_ID + "(updateInformationForUser) _exiting_");
                reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteUser
     * @description
     *      Delete an existing user 
     * @param {string} strUserId The id of the user
     * @return {Object} A promise containing the user or a SDK error
     * @memberof Admin
     */
    deleteUser(strUserId) {

        let that = this;

        this._logger.log("debug", LOG_ID + "(deleteUser) _entering_");

        return new Promise(function(resolve, reject) {
            try {

                if (!strUserId) {
                    that._logger.log("error", LOG_ID + "(deleteUser) bad or empty 'strUserId' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                that._rest.deleteUser(strUserId).then( (user) => {
                    that._logger.log("debug", LOG_ID + "(deleteUser) Successfully deleting user account", strUserId);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteUser) Error when deleting user account", strUserId);
                    reject(err);
                });

                that._logger.log("debug", LOG_ID + "(deleteUser) _exiting_");
            } catch (err) {
                that._logger.log("debug", LOG_ID + "(deleteUser) _exiting_");
                reject(err);
            }
        });
    }
}

module.exports = Admin;
