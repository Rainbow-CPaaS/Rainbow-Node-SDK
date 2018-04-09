"use strict";

let ErrorCase = require("../common/Error");

const LOG_ID = "ADMIN - ";

/**
 * @class
 * @name Admin
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

    constructor(_eventEmitter, _logger) {
        this._xmpp = null;
        this._rest = null;
        this._bubbles = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
    }

    start(_xmpp, _rest) {
        let that = this;

        that._logger.log("debug", LOG_ID + "(start) _entering_");

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

        that._logger.log("debug", LOG_ID + "(stop) _entering_");

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
     * @method createCompany
     * @instance
     * @description
     *      Create a company
     * @param {string} strName The name of the new company
     * @return {Object} A promise containing the company or a SDK error
     * @memberof Admin
     */
    createCompany(strName) {
        let that = this;

         that._logger.log("debug", LOG_ID + "(createCompany) _entering_", strName);

        return new Promise(function (resolve, reject) {
            try {
                if (!strName) {
                    that._logger.log("error", LOG_ID + "(createCompany) bad or empty 'strName' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                that._rest.createCompany(strName).then((user) => {
                    that._logger.log("debug", LOG_ID + "(createCompany) Successfully created company", strName);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createCompany) Error when creating", strName);
                    reject(err);
                });

                that._logger.log("debug", LOG_ID + "(createCompany) _exiting_");

            } catch (err) {
                that._logger.log("debug", LOG_ID + "(createCompany) _exiting_");
                reject(err);
            }
        });
    }

    /**
     * Remove a user from a company
     * @private
     */
    removeUserFromCompany(user) {
        let that = this;

        that.deleteUser(user.id);
    };

    /**
     * Set the visibility for a company
     * @private
     */
    setVisibilityForCompany(company, visibleByCompany) {

        let that = this;

        that._logger.log("debug", LOG_ID + "(setVisibilityForCompany) _entering_", company);

        return new Promise(function (resolve, reject) {
            try {
                if (!company) {
                    that._logger.log("error", LOG_ID + "(setVisibilityForCompany) bad or empty 'company' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }
                if (!visibleByCompany) {
                    that._logger.log("error", LOG_ID + "(setVisibilityForCompany) bad or empty 'visibleByCompany' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                that._rest.setVisibilityForCompany(company.id, visibleByCompany.id).then((user) => {
                    that._logger.log("debug", LOG_ID + "(setVisibilityForCompany) Successfully set visibility for company", company);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(setVisibilityForCompany) Error when set visibility for company", company);
                    reject(err);
                });

                that._logger.log("debug", LOG_ID + "(setVisibilityForCompany) _exiting_");

            } catch (err) {
                that._logger.log("debug", LOG_ID + "(setVisibilityForCompany) _exiting_", err);
                reject(err);
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
     * @return {Contact} A promise containing the contact created or an SDK Error
     * @memberof Admin
     */
    createUserInCompany(email, password, firstname, lastname, companyId, language, isCompanyAdmin) {
        let that = this;

        that._logger.log("debug", LOG_ID + "(createUserInCompany) _entering_");

        return new Promise(function(resolve, reject) {
            try {

                language = language || "en-US";

                let isAdmin = isCompanyAdmin || false;

                if (!email) {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) bad or empty 'email' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (!password) {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) bad or empty 'password' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (!firstname) {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) bad or empty 'firstname' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (!lastname) {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) bad or empty 'lastname' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                that._rest.createUser(email, password, firstname, lastname, companyId, language, isAdmin).then( (user) => {
                    that._logger.log("debug", LOG_ID + "(createUserInCompany) Successfully created user for account", email);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createUserInCompany) Error when creating user for account", email);
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
     * @instance
     * @description
     *      Create a new guest user in the same company as the requester admin
     * @param {string} firstname The user firstname
     * @param {string} lastname  The user lastname
     * @param {string} [language="en-US"] The language of the user. Default is `en-US`. Can be fr-FR, de-DE... 
     * @param {Number} [timeToLive] Allow to provide a duration in second to wait before starting a user deletion from the creation date
     * @return {Object} A promise containing the user created or an SDK Error
     * @memberof Admin
     */
    createGuestUser( firstname, lastname, language, timeToLive) {
        let that = this;

        this._logger.log("debug", LOG_ID + "(createGuestUser) _entering_");

        return new Promise(function(resolve, reject) {
            try {

                language = language || "en-US";

                if (!firstname) {
                    that._logger.log("error", LOG_ID + "(createGuestUser) bad or empty 'firstname' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (!lastname) {
                    that._logger.log("error", LOG_ID + "(createGuestUser) bad or empty 'lastname' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (timeToLive && isNaN(timeToLive) ) {
                    that._logger.log("error", LOG_ID + "(createGuestUser) bad or empty 'timeToLive' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                that._rest.createGuestUser( firstname, lastname, language, timeToLive ).then( (user) => {
                    that._logger.log("debug", LOG_ID + "(createGuestUser) Successfully created guest user for account ", user.loginEmail);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + `(createGuestUser) Error when creating guest user with firstname: ${firstname}, lastname: ${lastname}`);
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
     * @method createAnonymousGuestUser
     * @since 1.31
     * @instance
     * @description
     *      Create a new anonymous guest user in the same company as the requester admin
     *      Anonymous guest user is user without name and firstname
     * @param {Number} [timeToLive] Allow to provide a duration in second to wait before starting a user deletion from the creation date
     * @return {Object} A promise containing the user created or an SDK Error
     * @memberof Admin
     */
    createAnonymousGuestUser(timeToLive) {
        let that = this;

        this._logger.log("debug", LOG_ID + "(createAnonymousGuestUser) _entering_");

        return new Promise(function(resolve, reject) {
            try {

                if (timeToLive && isNaN(timeToLive) ) {
                    that._logger.log("error", LOG_ID + "(createAnonymousGuestUser) bad or empty 'timeToLive' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                that._rest.createGuestUser( null, null, null, timeToLive ).then( (user) => {
                    that._logger.log("debug", LOG_ID + "(createAnonymousGuestUser) Successfully created guest user for account ", user.loginEmail);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createAnonymousGuestUser) Error when creating anonymous guest user");
                    reject(err);
                });

                that._logger.log("debug", LOG_ID + "(createAnonymousGuestUser) _exiting_");
            } catch (err) {
                that._logger.log("debug", LOG_ID + "(createAnonymousGuestUser) _exiting_");
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
     * @return [Object} A promise containing the invitation of an SDK Error
     * @memberof Admin
     */
    inviteUserInCompany(email, companyId, language, message) {
        let that = this;

        this._logger.log("debug", LOG_ID + "(inviteUserInCompany) _entering_");

        return new Promise(function(resolve, reject) {
            try {

                language = language || "en-US";

                message = message || null;

                if (!email) {
                    that._logger.log("error", LOG_ID + "(inviteUserInCompany) bad or empty 'email' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (!companyId) {
                    that._logger.log("error", LOG_ID + "(inviteUserInCompany) bad or empty 'companyId' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                that._rest.inviteUser(email, companyId, language, message).then( (user) => {
                    that._logger.log("debug", LOG_ID + "(inviteUserInCompany) Successfully inviting user for account", email);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(inviteUserInCompany) Error when inviting user for account", email);
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
     * @instance
     * @description
     *      Change a password for a user 
     * @param {string} password The new password
     * @param {string} userId The id of the user
     * @return {Object} A promise containing the user or a SDK error
     * @memberof Admin
     */
    changePasswordForUser(password, userId) {

        let that = this;

        this._logger.log("debug", LOG_ID + "(changePasswordToUser) _entering_");

        return new Promise(function(resolve, reject) {
            try {

                if (!password) {
                    that._logger.log("error", LOG_ID + "(changePasswordToUser) bad or empty 'password' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                if (!userId) {
                    that._logger.log("error", LOG_ID + "(changePasswordToUser) bad or empty 'userId' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                that._rest.changePassword(password, userId).then( (user) => {
                    that._logger.log("debug", LOG_ID + "(changePasswordToUser) Successfully changing password for user account", userId);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(changePasswordToUser) Error when changing password for user account", userId);
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
     * @instance
     * @description
     *      Change information of a user. Fields that can be changed: `firstName`, `lastName`, `nickName`, `title`, `jobTitle`, `country`, `language`, `timezone`, `emails` 
     * @param {Object} objData An object (key: value) containing the data to change with their new value
     * @param {string} userId The id of the user
     * @return {Object} A promise containing the user or a SDK error
     * @memberof Admin
     */
    updateInformationForUser(objData, userId) {

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

                that._rest.updateInformation(objData, userId).then( (user) => {
                    that._logger.log("debug", LOG_ID + "(updateInformationForUser) Successfully changing information for user account", userId);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(updateInformationForUser) Error when changing information for user account", userId);
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
     * @instance
     * @description
     *      Delete an existing user 
     * @param {string} userId The id of the user
     * @return {Object} A promise containing the user or a SDK error
     * @memberof Admin
     */
    deleteUser(userId) {

        let that = this;

        this._logger.log("debug", LOG_ID + "(deleteUser) _entering_");

        return new Promise(function(resolve, reject) {
            try {

                if (!userId) {
                    that._logger.log("error", LOG_ID + "(deleteUser) bad or empty 'userId' parameter");
                    let err = new Error(ErrorCase.BAD_REQUEST.msg);
                    throw err;
                }

                that._rest.deleteUser(userId).then( (user) => {
                    that._logger.log("debug", LOG_ID + "(deleteUser) Successfully deleting user account", userId);
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteUser) Error when deleting user account", userId);
                    reject(err);
                });

                that._logger.log("debug", LOG_ID + "(deleteUser) _exiting_");
            } catch (err) {
                that._logger.log("debug", LOG_ID + "(deleteUser) _exiting_");
                reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllCompanies
     * @instance
     * @description
     *      Get all companies for a given admin 
     * @param {string} userId The id of the user
     * @return {Object} A promise containing a json object with all companies (companyId and companyName) or a SDK error
     * @memberof Admin
     */
    getAllCompanies() {
        let that = this;

        this._logger.log("debug", LOG_ID + "(getAllCompanies) _entering_");

        return new Promise(function(resolve, reject) {
            try  {

                that._rest.getAllCompanies().then( (companies) => {
                    that._logger.log("debug", LOG_ID + "(getAllCompanies) Successfully get all companies");
                    that._logger.log("debug", LOG_ID + "(getAllCompanies) : companies values : ", companies.data);
                    resolve(companies);
                }).catch(function(err) {
                    that._logger.log("error", LOG_ID + "(getAllCompanies) Error when get All companies");
                    reject(err);
                });

                that._logger.log("debug", LOG_ID + "(getAllCompanies) _exiting_");

            } catch (err) {
                that._logger.log("debug", LOG_ID + "(getAllCompanies) _exiting_");
                reject(err);
            }
        });
    }

    /**
     * Remove a company
     * @private
     */
    removeCompany (company) {
        let that = this;

        this._logger.log("debug", LOG_ID + "(deleteCompany) _entering_");

        return new Promise(function (resolve, reject) {
            try {

                that._rest.deleteCompany(company.id).then((companies) => {
                    that._logger.log("debug", LOG_ID + "(deleteCompany) Successfully get all companies");
                    that._logger.log("debug", LOG_ID + "(deleteCompany) : companies values : ", companies.data);
                    resolve(companies);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(deleteCompany) Error when get All companies");
                    reject(err);
                });

                that._logger.log("debug", LOG_ID + "(deleteCompany) _exiting_");

            } catch (err) {
                that._logger.log("debug", LOG_ID + "(deleteCompany) _exiting_");
                reject(err);
            }
        });
        /*
        var defered = $q.defer();

        adminCompanyService.deleteCompany(company.id).then(function () {
            defered.resolve(company);
        }).catch(function (err) {
            defered.reject(err);
        });

        return defered.promise;
        // */
    }; //*/

}

module.exports = Admin;
