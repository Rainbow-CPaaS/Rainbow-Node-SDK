"use strict";

import {XMPPService} from "../connection/XMPPService";

export {};

import {ErrorManager} from "../common/ErrorManager";
import  {RESTService} from "../connection/RESTService";
import {addParamToUrl, Deferred, isStarted, logEntryExit} from "../common/Utils";
import {EventEmitter} from "events";
import {Logger} from "../common/Logger";
import {S2SService} from "./S2SService";
import {Contact} from "../common/models/Contact";
import {ContactsService} from "./ContactsService";
import {GenericService} from "./GenericService";

let dateFormat = require('dateformat');
let fs = require('fs');

const LOG_ID = "ADMIN/SVCE - ";

/**
 * Offer type provided by Rainbow
 * @public
 * @enum {string}
 * @readonly
 */
enum OFFERTYPES {
    /** freemium licence offer */
    "FREEMIUM" = "freemium",
    /** premium licence offer */
    "PREMIUM" = "premium"
}

/**
 * The CloudPBX CLI policy value to apply.
 * @public
 * @readonly
 * @enum {String}
 */
enum CLOUDPBXCLIOPTIONPOLICY {
    /** installation_ddi_number */
    "INSTALLATION_DDI_NUMBER" = "installation_ddi_number",
    /** user_ddi_number */
    "USER_DDI_NUMBER" = "user_ddi_number"
};

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name AdminService
 * @version SDKVERSION
 * @public
 * @description
 *      This module handles the management of users. Using it, You will be able to create new users, to modify information of users and to delete them.<br>
 *      This module can be use too to create Guest users who are specific temporaly users that can be used in Rainbow. <br>
 *      <br>
 *      The main methods proposed in that module allow to: <br>
 *      - Create a new user in a specified company <br>
 *      - Modify information of an existing user <br>
 *      - Delete an existing user <br>
 *      - Invite a user in Rainbow <br>
 *      - Change the password of a user <br>
 *      - Create a guest user <br>
 */
class AdminService extends GenericService {
    private _contacts: ContactsService;

    static getClassName(){ return 'AdminService'; }
    getClassName(){ return AdminService.getClassName(); }

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

    async init (useRestAtStartup : boolean) {
        let that = this;
        that.setInitialized();
    }

    // region Companies and users management

    /**
     * @public
     * @method createCompany
     * @instance
     * @description
     *      Create a company <br>
     * @param {string} strName The name of the new company
     * @param {string} country Company country (ISO 3166-1 alpha3 format, size 3 car)
     * @param {string} state (optionnal if not USA)  define a state when country is 'USA' (["ALASKA", "....", "NEW_YORK", "....", "WYOMING"] ), else it is not managed by server. Default value on server side: ALABAMA
     * @param {OFFERTYPES} offerType Company offer type. Companies with offerType=freemium are not able to subscribe to paid offers, they must be premium to do so. Companies created with privateDC="HDS" are automatically created with offerType=premium (as a paid subscription to HDS Company offer is automatically done during the company creation. Values can be : freemium, premium
     * @async
     * @category Companies and users management
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
     *      Create a new user in a given company <br>
     * @param {string} email The email of the user to create
     * @param {string} password The associated password
     * @param {string} firstname The user firstname
     * @param {string} lastname  The user lastname
     * @param {string} [companyId="user company"] The Id of the company where to create the user or the connected user company if null
     * @param {string} [language="en-US"] The language of the user. Default is `en-US`. Can be fr-FR, de-DE...
     * @param {boolean} [isCompanyAdmin=false] True to create the user with the right to manage the company (`companyAdmin`). False by default.
     * @param {Array<string>} [roles] The roles the created user.
     * @async
     * @category Companies and users management
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
     *      Create a new guest user in the same company as the requester admin <br>
     * @param {string} firstname The user firstname
     * @param {string} lastname  The user lastname
     * @param {string} [language="en-US"] The language of the user. Default is `en-US`. Can be fr-FR, de-DE...
     * @param {Number} [timeToLive] Allow to provide a duration in second to wait before starting a user deletion from the creation date
     * @async
     * @category Companies and users management
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
     *      Create a new anonymous guest user in the same company as the requester admin   <br>
     *      Anonymous guest user is user without name and firstname   <br>
     * @param {Number} [timeToLive] Allow to provide a duration in second to wait before starting a user deletion from the creation date
     * @async
     * @category Companies and users management
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
     *      Invite a new user to join a company in Rainbow <br>
     * @param {string} email The email address of the contact to invite
     * @param {string} companyId     The id of the company where the user will be invited in
     * @param {string} [language="en-US"]  The language of the message to send. Default is `en-US`
     * @param {string} [message=""] A custom message to send
     * @async
     * @category Companies and users management
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
     *      Change a password for a user <br>
     * @param {string} password The new password
     * @param {string} userId The id of the user
     * @async
     * @category Companies and users management
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
     *      Change information of a user. Fields that can be changed: `firstName`, `lastName`, `nickName`, `title`, `jobTitle`, `country`, `language`, `timezone`, `emails` <br>
     * @param {Object} objData An object (key: value) containing the data to change with their new value
     * @param {string} userId The id of the user
     * @async
     * @category Companies and users management
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
     *      Delete an existing user <br>
     * @param {string} userId The id of the user
     * @async
     * @category Companies and users management
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
     * @param {string} format Allows to retrieve more or less company details in response. <br>
     * - small: _id, name <br>
     * - medium: id, name, status, adminEmail, companyContactId, country, website, slogan, description, size, economicActivityClassification, lastAvatarUpdateDate, lastBannerUpdateDate, avatarShape, visibility <br>
     * - full for superadmin, support, business_admin, bp_admin and bp_finance: All fields <br>
     * - full for admin: All fields except BP fields (bpType, bpBusinessModel, bpApplicantNumber, bpCRDid, bpHasRightToSell, bpHasRightToConnect, bpIsContractAccepted, bpContractAcceptationInfo) <br>
     *  <br>
     * Default value : small <br>
     * Possible values : small, medium, full <br>
     * @param {string} sortField Sort items list based on the given field. Default value : name
     * @param {string} bpId Allows to filter companies list on bpId field. <br>
     * This filter allow to get all the End Customer companies associated to a given Business Partner company. <br>
     * <br>
     *  Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter. <br>
     *  Users with role bp_admin or bp_finance can use this filter on their own company. 
     * @param {string} catalogId Allows to filter companies list on catalogId field. <br>
     *     This filter allow to get all the companies linked to a given catalogId. <br>
     *         <br>
     *             Only users with role superadmin, support or business_admin can use this filter. 
     * @param {string} offerId Allows to filter companies list on companies having subscribed to the provided offerId.
     * @param {boolean} offerCanBeSold Allows to filter companies list on companies having subscribed to offers with canBeSold=true. <br>
     *     This filter can only be used with the value true (false is not relevant, as all companies have a subscription to Essential which has canBeSold=false, so all companies would match offerCanBeSold=false).
     * @param {string} externalReference Allows to filter companies list on externalReference field. <br>
     *     The search is done on externalReference starting with the input characters, case sensitive (ex: ABC will match companies with externalReference ABC, ABCD, ABC12... ; but externalReference abc, AABC, 1ABC, ... will not match). <br>
     *          <br>
     *     Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter.
     * @param {string} externalReference2 Allows to filter companies list on externalReference2 field. <br>
     *     The search is done on externalReference2 starting with the input characters, case sensitive (ex: ABC will match companies with externalReference2 ABC, ABCD, ABC12... ; but externalReference2 abc, AABC, 1ABC, ... will not match). <br>
     *         <br>
     *     Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter.
     * @param {string} salesforceAccountId Allows to filter companies list on salesforceAccountId field. <br>
     * The search is done on the whole salesforceAccountId, case sensitive (no partial search). <br>
     *  <br>
     * Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter. 
     * @param {string} selectedAppCustomisationTemplate Allows to filter companies list on application customisation template applied for the company. <br>
     *     This filter allows to get a list of companies for which we have applied the same application customisation template. <br>
     *         <br>
     *     Only users with role superadmin, support, bp_admin, admin can use this filter.
     * @param {boolean} selectedThemeObj Allows to return selectedTheme attribute as an object: <br>
     * - true returns selectedTheme as an object (e.g. { "light": "60104754c8fada2ad4be3e48", "dark": "5ea304e4359c0e6815fc8b57" }), <br>
     * - false return selectedTheme as a string. 
     * @param {string} offerGroupName Allows to filter companies list on companies having subscribed to offers with provided groupName(s). <br>
     *    Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter. <br>
     *    groupName can be retrieved from API GET /api/rainbow/subscription/v1.0/companies/:companyId/offers <br>
     *    The search is done on the whole groupName(s), case sensitive (no partial search). <br>
     *    Several groupName can be provided, seperated by a space.
     * @param {number} limit Allow to specify the number of items to retrieve. <br>
     *     Default value : 100
     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). <br>
     *     Warning: if offset > total, no results are returned.
     * @param {number} sortOrder Specify order when sorting items list. <br>
     *     Default value : 1 <br> 
     *     Possible values : -1, 1
     * @param {string} name Allows to filter companies list on the given keyword(s) on field name. <br>
     *      <br>
     *     The filtering is case insensitive and on partial name match: all companies containing the provided name value will be returned (whatever the position of the match). <br>
     *     Ex: if filtering is done on comp, companies with the following names are match the filter 'My company', 'Company', 'A comp 1', 'Comp of comps', ...
     * @param {string} status Allows to filter companies list on the provided status(es) <br>
     *      <br>
     *      Possible values : initializing, active, alerting, hold, terminated
     * @param {string} visibility Allows to filter companies list on the provided visibility(ies) <br>
     *      <br>
     *      Possible values : public, private, organization, closed, isolated
     * @param {string} organisationId Allows to filter companies list on the organisationIds provided in this option. <br>
     *      <br>
     *      This filter can only be used if user has role(s) superadmin, support, bp_admin or admin
     * @param {boolean} isBP Allows to filter companies list on isBP field: <br>
     *      <br>
     *      true returns only Business Partner companies, <br>
     *      false return only companies which are not Business Partner. <br>
     *      <br>
     *      This filter can only be used if user has role(s) superadmin, business_admin, support, bp_admin or admin.
     * @param {boolean} hasBP Allows to filter companies list on companies being linked or not to a BP: <br>
     *      <br>
     *      true returns only companies linked to a BP (BP IR companies are also returned), <br>
     *      false return only companies which are not linked to a BP.
     *      <br>
     *      This filter can only be used if user has role(s) superadmin, business_admin, support or bp_admin. <br>
     *      <br>
     *      Users with role bp_admin can only use this filter with value false.
     * @param {string} bpType Allows to filter companies list on bpType field. <br>
     *      <br>
     *      This filter allow to get all the Business Partner companies from a given bpType. <br>
     *      <br>
     *      Only users with role superadmin, business_admin, support or bp_admin can use this filter.
     * @instance
     * @description
     *      Get all companies for a given admin following request filters.<br>
     * @async
     * @category Companies and users management
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - Json object containing with all companies (companyId and companyName) or an error object depending on the result
     * @category async
     */
    getAllCompanies(format  : string = "small", sortField : string = "name" , bpId : string = undefined, catalogId : string = undefined, offerId : string = undefined, offerCanBeSold : boolean = undefined, externalReference : string = undefined, externalReference2 : string = undefined, salesforceAccountId : string = undefined, selectedAppCustomisationTemplate : string = undefined, selectedThemeObj: boolean = undefined, offerGroupName : string = undefined, limit : number = 100, offset : number = 0, sortOrder : number = 1, name : string = undefined, status : string = undefined, visibility : string = undefined, organisationId : string = undefined, isBP : boolean = undefined, hasBP : boolean = undefined, bpType : string = undefined ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getAllCompanies(format, sortField, bpId, catalogId, offerId, offerCanBeSold, externalReference, externalReference2, salesforceAccountId, selectedAppCustomisationTemplate, selectedThemeObj, offerGroupName, limit, offset, sortOrder, name, status, visibility, organisationId, isBP, hasBP, bpType).then((companies : any) => {
                    that._logger.log("debug", LOG_ID + "(getAllCompanies) Successfully get all companies");
                    that._logger.log("internal", LOG_ID + "(getAllCompanies) : companies values : ", companies);
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
     * @method getAllUsers
     * @instance
     * @description
     *      Get all users for a given admin <br>
     * @async
     * @category Companies and users management
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
     * @method getAllUsersByFilter
     * @instance
     * @category Companies and users management
     * @description
     *  Get a list of users by filters <br>
     * @async
     * @return {Promise<any, ErrorManager>}
     * @fulfil {any} - Found users or null or an error object depending on the result
     * @param {string} searchEmail Allows to filter users list on the loginEmail field using the word provided in this option.
     * @param {string} companyId Allows to filter users list on the companyIds provided in this option.
     * @param {string} roles Allows to filter users list on the role(s) provided in this option. Default value is "user".
     * @param {string} excludeRoles Allows to exclude users having the role(s) provided in this option.
     * @param {string} tags Allows to filter users list on the tag(s) provided in this option.
     * @param {string} departments Allows to filter users list on the department(s) provided in this option.
     * @param {string} isTerminated Allows to filter users list on the status 'isTerminated'. Default value is "false"
     * @param {string} isActivated Allows to filter users list for users which have logged in at least once ("true") or never ("false").
     * @param {string} fileSharingCustomisation Allows to filter users list on fileSharing feature restriction (enabled, disabled, same_than_company)
     * @param {string} userTitleNameCustomisation Allows to filter users list on user's profile update restriction (enabled, disabled, same_than_company)
     * @param {string} softphoneOnlyCustomisation Allows to filter users list on use softphone part of the UCaas application restriction (enabled, disabled, same_than_company)
     * @param {string} useRoomCustomisation Allows to filter users list on use room (bubble) restriction (enabled, disabled, same_than_company)
     * @param {string} phoneMeetingCustomisation Allows to filter users list on can join a PSTN conference restriction (enabled, disabled, same_than_company)
     * @param {string} useChannelCustomisation Allows to filter users list on use channels restriction (enabled, disabled, same_than_company)
     * @param {string} useScreenSharingCustomisation Allows to filter users list on sharing screen restriction (enabled, disabled, same_than_company)
     * @param {string} useWebRTCVideoCustomisation Allows to filter users list on use screen sharing restriction (enabled, disabled, same_than_company)
     * @param {string} useWebRTCAudioCustomisation Allows to filter users list on use Web RTC audio restriction (enabled, disabled, same_than_company)
     * @param {string} instantMessagesCustomisation Allows to filter users list on use Instant Messages restriction (enabled, disabled, same_than_company)
     * @param {string} userProfileCustomisation Allows to filter users list on modify a profile restriction (enabled, disabled, same_than_company)
     * @param {string} fileStorageCustomisation Allows to filter users list on use Rainbow file storage restriction (enabled, disabled, same_than_company)
     * @param {string} overridePresenceCustomisation Allows to filter users by the ability to modify manually presence state (enabled, disabled, same_than_company)
     * @param {string} alert notification] Allows to filter users by the ability to receive alert notification(enabled, disabled, same_than_company)
     * @param {string} changeTelephonyCustomisation Allows to filter users by the ability to modify telephony settings (enabled, disabled, same_than_company)
     * @param {string} changeSettingsCustomisation Allows to filter users by the ability to change client general setting (enabled, disabled, same_than_company)
     * @param {string} recordingConversationCustomisation Allows to filter users by the ability to record conversation (enabled, disabled, same_than_company)
     * @param {string} useGifCustomisation Allows to filter users by the ability to use GIFs in conversations (enabled, disabled, same_than_company)
     * @param {string} useDialOutCustomisation Allows to filter users by the ability to be called by the Rainbow conference bridge. (enabled, disabled, same_than_company)
     * @param {string} fileCopyCustomisation Allows to filter users by the ability to copy any file he receives in his personal cloud space.
     * @param {string} fileTransferCustomisation Allows to filter users by the ability to copy a file from a conversation then share it inside another conversation.
     * @param {string} forbidFileOwnerChangeCustomisation Allows to filter users by the ability to loose the ownership on one file.
     * @param {string} readReceiptsCustomisation Allows to filter users by the ability to authorize a sender to check if a chat message is read.
     * @param {string} useSpeakingTimeStatistics Allows to filter users by the ability to see speaking time statistics about a WebRTC meeting.
     * @param {string} selectedAppCustomisationTemplate Allows to filter users by the last application customisation template applied.
     * @param {string} format Allows to retrieve more or less user details in response. </br>
     * small: id, loginEmail, firstName, lastName, displayName, companyId, companyName, isTerminated
     * medium: id, loginEmail, firstName, lastName, displayName, jid_im, jid_tel, companyId, companyName, lastUpdateDate, lastAvatarUpdateDate, isTerminated, guestMode </br>
     * full: all user fields </br>
     * Default value : small
     * Possible values : small, medium, full
     * @param {string} limit Allow to specify the number of users to retrieve. Default value 100.
     * @param {string} offset Allow to specify the position of first user to retrieve (first user if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort user list based on the given field. Default value : displayName
     * @param {string} sortOrder Specify order when sorting user list. Default value : 1. Possible values : -1, 1
     * @param {string} displayName Allows to filter users list on the given keyword(s) on field displayName.
     * @param {boolean} useEmails used with displayName, allows to filter users list on the given keyword(s) on field displayName for loginEmails too.
     * @param {string} companyName Allows to filter users list on the given keyword(s) on field companyName.
     * @param {string} loginEmail Allows to filter users list on the loginEmails provided in this option.
     * @param {string} email Allows to filter users list on the emails provided in this option.
     * @param {string} visibility Allows to filter users list on the visibility(ies) provided in this option. Possible values : same_than_company, public, private, closed, isolated, none
     * @param {string} organisationId Allows to filter users list on the organisationIds provided in this option. Option is reserved for superAdmin or admin allowed to manage the given organisationId.
     * @param {string} siteId Allows to filter users list on the siteIds provided in this option. Option is reserved for superAdmin or admin allowed to manage the given siteIds.
     * @param {string} jid_im Allows to filter users list on the jid_ims provided in this option.
     * @param {string} jid_tel Allows to filter users list on the jid_tels provided in this option.
     */
    getAllUsersByFilter(searchEmail :string, companyId : string , roles : string ="user", excludeRoles : string, tags : string, departments : string, isTerminated  : string = "false", isActivated : string, fileSharingCustomisation : string, userTitleNameCustomisation : string, softphoneOnlyCustomisation : string,
                        useRoomCustomisation : string,  phoneMeetingCustomisation : string,
                        useChannelCustomisation : string, useScreenSharingCustomisation : string, useWebRTCVideoCustomisation : string, useWebRTCAudioCustomisation : string, instantMessagesCustomisation : string, userProfileCustomisation : string, fileStorageCustomisation : string,
                        overridePresenceCustomisation : string, alert : string, changeTelephonyCustomisation : string, changeSettingsCustomisation : string, recordingConversationCustomisation : string,
                        useGifCustomisation : string, useDialOutCustomisation : string, fileCopyCustomisation : string, fileTransferCustomisation : string, forbidFileOwnerChangeCustomisation : string, readReceiptsCustomisation : string, useSpeakingTimeStatistics : string,
                        selectedAppCustomisationTemplate : string, format : string = "small", limit : string = "100",
                        offset : string, sortField : string = "displayName", sortOrder : string, displayName : string, useEmails : boolean, companyName : string, loginEmail : string, email : string, visibility : string, organisationId : string, siteId : string, jid_im : string, jid_tel : string ): Promise<any> {

        let that = this;

        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(getAllUsersByFilter) contact, Ask the server...");
            that._rest.getAllUsersByFilter(searchEmail , companyId , roles , excludeRoles , tags , departments , isTerminated  , isActivated , fileSharingCustomisation , userTitleNameCustomisation , softphoneOnlyCustomisation ,
                    useRoomCustomisation ,  phoneMeetingCustomisation ,
                    useChannelCustomisation , useScreenSharingCustomisation , useWebRTCVideoCustomisation , useWebRTCAudioCustomisation , instantMessagesCustomisation , userProfileCustomisation , fileStorageCustomisation ,
                    overridePresenceCustomisation , alert , changeTelephonyCustomisation , changeSettingsCustomisation , recordingConversationCustomisation ,
                    useGifCustomisation , useDialOutCustomisation , fileCopyCustomisation , fileTransferCustomisation , forbidFileOwnerChangeCustomisation , readReceiptsCustomisation , useSpeakingTimeStatistics ,
                    selectedAppCustomisationTemplate , format , limit ,
                    offset , sortField , sortOrder , displayName , useEmails , companyName , loginEmail , email , visibility , organisationId , siteId , jid_im , jid_tel ).then((result: any) => {
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });

        });
    }

    /**
     * @public
     * @method getAllUsersByCompanyId
     * @instance
     * @description
     *      Get all users for a given admin in a company <br>
     * @async
     * @category Companies and users management
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
     *      Get all users for a given admin in a company by a search of string in email<br>
     * @async
     * @category Companies and users management
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
     *      Get informations about a user <br>
     * @param {string} userId The id of the user
     * @async
     * @category Companies and users management
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
     *      Set informations about a user <br>
     * @param {string} userId The id of the user
     * @param {Object} infos The infos of the user : <br>
     * {string{3..255}}  [infos.loginEmail]      User email address (used for login). <br>
     * <br> Must be unique (409 error is returned if a user already exists with the same email address). <br>
     *  {string{8..64}}   [infos.password]        User password. <br>
     * <br> Rules: more than 8 characters, at least 1 capital letter, 1 number, 1 special character. <br>
     * {string{1..255}}  [infos.firstName]     User first name <br>
     * {string{1..255}}  [infos.lastName]      User last name <br>
     * {string{1..255}}  [infos.nickName]      User nickName <br>
     * {string{1..40}}   [infos.title]         User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...) <br>
     * {string{1..255}}  [infos.jobTitle]      User job title <br>
     * {string[]{1..64}} [infos.tags]          An Array of free tags associated to the user. <br>
     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. <br>
     * `tags` can only be set by users who have administrator rights on the user. The user can't modify the tags. <br>
     * The tags are visible by the user and all users belonging to his organisation/company, and can be used with <br>
     * the search API to search the user based on his tags. <br>
     * {Object[]}           [infos.emails]        Array of user emails addresses objects <br>
     * {string{3..255}}          [infos.emails.email]    User email address <br>
     * {string=home,work,other}  [infos.emails.type]     User email type <br>
     * {Object[]}           [infos.phoneNumbers]  Array of user phone numbers objects <br>
     * <br>
     * <br><u><i>Note:</i></u> For each provided number, the server tries to compute the associated E.164 number (<code>numberE164</code> field) using provided PhoneNumber country if available, user country otherwise. <br>
     * If <code>numberE164</code> can't be computed, an error 400 is returned (ex: wrong phone number, phone number not matching country code, ...) <br>
     * {string{1..32}}   [infos.phoneNumbers.number]    User phone number (as entered by user) <br>
     * {string{3}}       [infos.phoneNumbers.country]   Phone number country (ISO 3166-1 alpha3 format). Used to compute numberE164 field from number field. <br>
     * <br>
     * <br>If not provided, user country is used by default. <br>
     * {string=home,work,other}              phoneNumbers.type           Phone number type <br>
     * {string=landline,mobile,fax,other}    phoneNumbers.deviceType     Phone number device type <br>
     * {string{3}}       [infos.country]       User country (ISO 3166-1 alpha3 format) <br>
     * {string=null,"AA","AE","AP","AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","PR","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY","AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"} [infos.state] When country is 'USA' or 'CAN', a state can be defined. Else it is not managed. <br>
     * <br> USA states code list: <br>
     * <li> <code>AA</code>:"Armed Forces America", <br>
     * <li> <code>AE</code>:"Armed Forces", <br>
     * <li> <code>AP</code>:"Armed Forces Pacific", <br>
     * <li> <code>AK</code>:"Alaska", <br>
     * <li> <code>AL</code>:"Alabama", <br>
     * <li> <code>AR</code>:"Arkansas", <br>
     * <li> <code>AZ</code>:"Arizona", <br>
     * <li> <code>CA</code>:"California", <br>
     * <li> <code>CO</code>:"Colorado", <br>
     * <li> <code>CT</code>:"Connecticut", <br>
     * <li> <code>DC</code>:"Washington DC", <br>
     * <li> <code>DE</code>:"Delaware", <br>
     * <li> <code>FL</code>:"Florida", <br>
     * <li> <code>GA</code>:"Georgia", <br>
     * <li> <code>GU</code>:"Guam", <br>
     * <li> <code>HI</code>:"Hawaii", <br>
     * <li> <code>IA</code>:"Iowa", <br>
     * <li> <code>ID</code>:"Idaho", <br>
     * <li> <code>IL</code>:"Illinois", <br>
     * <li> <code>IN</code>:"Indiana", <br>
     * <li> <code>KS</code>:"Kansas", <br>
     * <li> <code>KY</code>:"Kentucky", <br>
     * <li> <code>LA</code>:"Louisiana", <br>
     * <li> <code>MA</code>:"Massachusetts", <br>
     * <li> <code>MD</code>:"Maryland", <br>
     * <li> <code>ME</code>:"Maine", <br>
     * <li> <code>MI</code>:"Michigan", <br>
     * <li> <code>MN</code>:"Minnesota", <br>
     * <li> <code>MO</code>:"Missouri", <br>
     * <li> <code>MS</code>:"Mississippi", <br>
     * <li> <code>MT</code>:"Montana", <br>
     * <li> <code>NC</code>:"North Carolina", <br>
     * <li> <code>ND</code>:"Northmo Dakota", <br>
     * <li> <code>NE</code>:"Nebraska", <br>
     * <li> <code>NH</code>:"New Hampshire", <br>
     * <li> <code>NJ</code>:"New Jersey", <br>
     * <li> <code>NM</code>:"New Mexico", <br>
     * <li> <code>NV</code>:"Nevada", <br>
     * <li> <code>NY</code>:"New York", <br>
     * <li> <code>OH</code>:"Ohio", <br>
     * <li> <code>OK</code>:"Oklahoma", <br>
     * <li> <code>OR</code>:"Oregon", <br>
     * <li> <code>PA</code>:"Pennsylvania", <br>
     * <li> <code>PR</code>:"Puerto Rico", <br>
     * <li> <code>RI</code>:"Rhode Island", <br>
     * <li> <code>SC</code>:"South Carolina", <br>
     * <li> <code>SD</code>:"South Dakota", <br>
     * <li> <code>TN</code>:"Tennessee", <br>
     * <li> <code>TX</code>:"Texas", <br>
     * <li> <code>UT</code>:"Utah", <br>
     * <li> <code>VA</code>:"Virginia", <br>
     * <li> <code>VI</code>:"Virgin Islands", <br>
     * <li> <code>VT</code>:"Vermont", <br>
     * <li> <code>WA</code>:"Washington", <br>
     * <li> <code>WI</code>:"Wisconsin", <br>
     * <li> <code>WV</code>:"West Virginia", <br>
     * <li> <code>WY</code>:"Wyoming" <br>
     * <br> Canada states code list: <br>
     * <li> <code>AB</code>: "Alberta", <br>
     * <li> <code>BC</code>: "British Columbia", <br>
     * <li> <code>MB</code>: "Manitoba", <br>
     * <li> <code>NB</code>:	"New Brunswick", <br>
     * <li> <code>NL</code>: "Newfoundland and Labrador", <br>
     * <li> <code>NS</code>: "Nova Scotia", <br>
     * <li> <code>NT</code>: "Northwest Territories", <br>
     * <li> <code>NU</code>: "Nunavut", <br>
     * <li> <code>ON</code>: "Ontario", <br>
     * <li> <code>PE</code>: "Prince Edward Island", <br>
     * <li> <code>QC</code>: "Quebec", <br>
     * <li> <code>SK</code>: "Saskatchewan", <br>
     * <li> <code>YT</code>: "Yukon" <br>
     * {string="/^([a-z]{2})(?:(?:(-)[A-Z]{2}))?$/"}     [infos.language]      User language <br>
     * <br> 
     * <br> Language format is composed of locale using format <code>ISO 639-1</code>, with optionally the regional variation using <code>ISO 3166‑1 alpha-2</code> (separated by hyphen). <br>
     * <br> Locale part is in lowercase, regional part is in uppercase. Examples: en, en-US, fr, fr-FR, fr-CA, es-ES, es-MX, ... <br>
     * <br> More information about the format can be found on this <a href="https://en.wikipedia.org/wiki/Language_localisation#Language_tags_and_codes">link</a>. <br>
     * {string}          [infos.timezone]      User timezone name <br>
     * <br> Allowed values: one of the timezone names defined in <a href="https://www.iana.org/time-zones">IANA tz database</a> <br>
     * <br> Timezone name are composed as follow: <code>Area/Location</code> (ex: Europe/Paris, America/New_York,...) <br>
     * {string=free,basic,advanced} [infos.accountType=free]  User subscription type <br>
     * {string[]=guest,user,admin,bp_admin,bp_finance,company_support,all_company_channels_admin,public_channels_admin,closed_channels_admin,app_admin,app_support,app_superadmin,directory_admin,support,superadmin} [infos.roles='["user"]']   List of user roles <br>
     * <br>
     * <br>The general rule is that a user must have the roles that the wants to assign to someone else. <br>
     * <br>Examples: <br>
     * <ul>
     *     <li>an <code>admin</code> can add or remove the role <code>admin</code> to another user of the company(ies) he manages,</li>
     *     <li>an <code>bp_admin</code> can add or remove the role <code>bp_admin</code> to another user of the company(ies) he manages,</li>
     *     <li>an <code>app_superadmin</code> can add or remove the role <code>app_superadmin</code> to another user...</li>
     * </ul>
     * Here are some explanations regarding the roles available in Rainbow: <br>
     * <ul>
     * <li><code>admin</code>, <code>bp_admin</code> and <code>bp_finance</code> roles are related to company management (and resources linked to companies, such as users, systems, subscriptions, ...).</li>
     * <li><code>bp_admin</code> and <code>bp_finance</code> roles can only be set to users of a BP company (company with isBP=true).</li>
     * <li><code>app_admin</code>, <code>app_support</code> and <code>app_superadmin</code> roles are related to application management.</li>
     * <li><code>all_company_channels_admin</code>, <code>public_channels_admin</code> and <code>closed_channels_admin</code> roles are related to channels management.</li>
     * <li>Only <code>superadmin</code> can set <code>superadmin</code> and <code>support</code> roles to a user.</li>
     * <li>A user with admin rights (admin, bp_admin, superadmin) can't change his own roles, except for roles related to channels (<code>all_company_channels_admin</code>, <code>public_channels_admin</code> and <code>closed_channels_admin</code>).</li>
     * </ul>
     * {string=organization_admin,company_admin,site_admin} [infos.adminType]  Mandatory if roles array contains <code>admin</code> role: specifies at which entity level the administrator has admin rights in the hierarchy ORGANIZATIONS/COMPANIES/SITES/SYSTEMS <br>
     * {string}  [infos.companyId]             User company unique identifier (like 569ce8c8f9336c471b98eda1) <br>
     * <br> companyName field is automatically filled on server side based on companyId. <br>
     * {boolean} [infos.isActive=true]         Is user active <br>
     * {boolean} [infos.isInitialized=false]   Is user initialized <br>
     * {string=private,public,closed,isolated,none} [infos.visibility]  User visibility <br>
     * <br> Define if the user can be searched by users being in other company and if the user can search users being in other companies. <br>
     * - `public`: User can be searched by external users / can search external users. User can invite external users / can be invited by external users <br>
     * - `private`: User **can't** be searched by external users / can search external users. User can invite external users / can be invited by external users <br>
     * - `closed`: User **can't** be searched by external users / **can't** search external users. User can invite external users / can be invited by external users <br>
     * - `isolated`: User **can't** be searched by external users / **can't** search external users. User **can't** invite external users / **can't** be invited by external users <br>
     * - `none`:  Default value reserved for guest. User **can't** be searched by **any users** (even within the same company) / can search external users. User can invite external users / can be invited by external users <br>
     * <br>External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company. <br>
     * {Number} [infos.timeToLive] Duration in second to wait before automatically starting a user deletion from the creation date. <br>
     * Once the timeToLive has been reached, the user won't be usable to use APIs anymore (error 401523). His account may then be deleted from the database at any moment. <br>
     * Value -1 means timeToLive is disable (i.e. user account will not expire). <br>
     * If created user has role <code>guest</code> and no timeToLive is provided, a default value of 172800 seconds is set (48 hours). <br>
     * If created user does not have role <code>guest</code> and no timeToLive is provided, a default value of -1 is set (no expiration). <br>
     * {string=DEFAULT,RAINBOW,SAML} [infos.authenticationType] User authentication type (if not set company default authentication will be used) <br>
     * {string{0..64}}  [infos.userInfo1]      Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br>
     * {string{0..64}}  [infos.userInfo2]      2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br>
     * {string} selectedTheme Set the selected theme for the user. <br>
     * {Object} customData  User's custom data. <br>
     *    key1 	string User's custom data key1. <br>
     *    key2 	string Company's custom data key2. <br>
     *  customData can only be created/updated by: <br>
     *   the user himself, company_admin or organization_admin of his company, bp_admin and bp_finance of his company, superadmin. <br> 
     *   Restrictions on customData Object: <br>
     *   max 20 keys, <br>
     *   max key length: 64 characters, max value length: 512 characters. It is up to the client to manage the user's customData (new customData provided overwrite the existing one). <br>   
     *
     * @async
     * @return {Promise<Object, ErrorManager>}
     * @fulfil {Object} - Json object containing informations or an error object depending on the result
     * @category Companies and users management
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

    //endregion Companies and users management

    //region Customisation Template

    /**
     * @public
     * @method applyCustomisationTemplates
     * @instance
     * @description
     *      This API allows an administrator to apply an application customisation template to a company or a user
     *
     *  **Why is an application template?**
     *
     *  - An application template is a set of key feature controlled by permission.
     *  - A template can be applied to a company, to a user.
     *  - A template to a user can be applied by an administrator action or by bulk using mass provisioning mechanism.
     *  - Custom templates may be created
     *
     *  **Who can apply a template?**
     *
     *  - superadmin, bp_admin and company_admin can apply templates available for any company (public or private template)
     *
     *  **Restrictions about template types.**
     *
     *  - Each template has a type:
     *
     *    - default_company
     *    - default_user
     *    - private_default_company
     *    - other
     *
     *  - It may have only one template of default_company and default_user type.
     *
     *  - A default_company or default_user template is always public.
     *
     *  - default_company is created by Rainbow team under name Full.
     *
     *  - default_user is a template used to reset user with default values. It is created by Rainbow team under name Same as company. It is public too.
     *
     *  - An 'other' template is public or private. If private, it belongs to a company.
     *
     *  - A private_default_company is private and belongs to a standalone company. It may have only one private_default_company per company.
     *
     *  To apply a template, a template name plus a companyId or a userId must be set. When both companyId or userId are set, an error occurs (400000).
     *
     *  You can find on which companies the template has been applied by using the API getAllCompanies with parameter selectedAppCustomisationTemplate=:templateId
     *  The company field selectedAppCustomisationTemplate is the last template applyed for this company.
     * @async
     * @category Customisation Template
     * @return {Promise<Object, Error>}
     * @fulfil {Object} - Json object containing the result of the method.
     * @category async
     * @param {string} name Template name.
     * @param {string} companyId Company unique identifier
     * @param {string} userId User unique identifier
     */
    applyCustomisationTemplates(name : string, companyId : string, userId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._logger.log("internal", LOG_ID + "(applyTemplates) : name : ", name, " companyId : ", companyId, " userId : ", userId);
                that._logger.log("info", LOG_ID + "(applyTemplates) enter.");
                that._rest.applyCustomisationTemplates(name, companyId, userId).then(json => {
                    that._logger.log("debug", LOG_ID + "(applyTemplates) Successfully done.");
                    that._logger.log("internal", LOG_ID + "(applyTemplates) : result : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(applyTemplates) Error when getting a token");
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(applyTemplates) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method createCustomisationTemplate
     * @instance
     * @description
     *      This API allows an administrator to create an application customisation template for the given company.
     *      
     *      - The name of the template must be unique among all of its belonging to the company.
     *      - The template is always private. So it has automatically private visibility.
     *      - It can includes following items. When some of them are missing, the default value enabled is used. So the body can include only items to set with the statedisabled.
     * @async
     * @category Customisation Template
     * @return {Promise<Object, Error>}
     * @fulfil {Object} - Json object containing the result of the method
     * @category async
     * @param {string} name Template name.
     * @param {string} ownedByCompany Identifier of the company owning the template.
     * @param {string} visibleBy When visibility is private, list of companyIds that can access the template (other than the 'ownedByCompany' one).
     * @param {string} instantMessagesCustomisation Activate/Deactivate the capability for a user to use instant messages.<br>
     * Define if one or all users of a company has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications.<br>
     * <br>
     * instantMessagesCustomisation can be:<br>
     * 
     * - enabled: Each user of the company can use instant messages.<br>
     * - disabled: No user of the company can use instant messages.<br>
     * <br>
     * Default value : enabled
     * @param {string} useGifCustomisation Activate/Deactivate the ability for a user to Use GIFs in conversations.<br>
     * Define if one or all users of a company has the is allowed to send animated GIFs in conversations<br>
     * <br>
     * useGifCustomisation can be:<br>
     * 
     * - enabled: The user can send animated GIFs in conversations.<br>
     * - disabled: The user can't send animated GIFs in conversations.<br>
     * <br>
     * Default value : enabled
     * @param {string} fileSharingCustomisation Activate/Deactivate file sharing capability per company<br>
     * Define if one or all users of a company can use the file sharing service then, allowed to download and share file.<br>
     * <br>
     * fileSharingCustomisation can be:<br>
     * 
     * - enabled: Each user of the company can use the file sharing service, except when his own capability is set to 'disabled'.<br>
     * - disabled: Each user of the company can't use the file sharing service, except when his own capability is set to 'enabled'.<br>
     * <br>
     * Default value : enabled<br>
     * @param {string} fileStorageCustomisation Activate/Deactivate the capability for a user to access to Rainbow file storage.<br>
     * Define if one or all users of a company has the right to upload/download/copy or share documents.<br>
     * <br>
     * fileStorageCustomisation can be:<br>
     * 
     * - enabled: Each user of the company can manage and share files.<br>
     * - disabled: No user of the company can manage and share files.<br>
     * <br>
     * Default value : enabled
     * @param {string} phoneMeetingCustomisation Activate/Deactivate the capability for a user to use phone meetings (PSTN conference).<br>
     * Define if one or all users of a company has the right to join phone meetings.<br>
     * <br>
     * phoneMeetingCustomisation can be:<br>
     *
     * -  enabled: Each user of the company can join phone meetings.<br>
     * - disabled: No user of the company can join phone meetings.<br>
     *<br>
     *  Default value : enabled
     * @param {string} useDialOutCustomisation Activate/Deactivate the capability for a user to use dial out in phone meetings.<br>
     * Define if one or all users of a company is allowed to be called by the Rainbow conference bridge.<br>
     * <br>
     * useDialOutCustomisation can be:<br>
     * 
     * - enabled: The user can be called by the Rainbow conference bridge.<br>
     * - disabled: The user can't be called by the Rainbow conference bridge.<br>
     *<br>
     *  Default value : enabled
     * @param {string} useChannelCustomisation Activate/Deactivate the capability for a user to use a channel.<br>
     * Define if one or all users of a company has the right to create channels or be a member of channels.<br>
     * <br>
     * useChannelCustomisation can be:<br>
     * 
     * - enabled: Each user of the company can use some channels.<br>
     * - disabled: No user of the company can use some channel.<br>
     * <br>
     * Default value : enabled
     * @param {string} useRoomCustomisation Activate/Deactivate the capability for a user to use bubbles.<br>
     * Define if one or all users of a company can create bubbles or participate in bubbles (chat and web conference).<br>
     * <br>
     * useRoomCustomisation can be:<br>
     * 
     * - enabled: Each user of the company can use bubbles.<br>
     * - disabled: No user of the company can use bubbles.<br>
     *<br>
     *  Default value : enabled
     * @param {string} useScreenSharingCustomisation Activate/Deactivate the capability for a user to share a screen.<br>
     * Define if a user has the right to share his screen.<br>
     * <br>
     * useScreenSharingCustomisation can be:<br>
     * 
     * - enabled: Each user of the company can share his screen.<br>
     * - disabled: No user of the company can share his screen.<br>
     * <br>
     * @param {string} useWebRTCAudioCustomisation Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation.<br>
     * Define if one or all users of a company has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call).<br>
     * <br>
     * useWebRTCVideoCustomisation can be:<br>
     * 
     * - enabled: Each user of the company can switch to a Web RTC audio conversation.<br>
     * - disabled: No user of the company can switch to a Web RTC audio conversation.<br>
     *<br>
     * Default value : enabled
     * @param {string} useWebRTCVideoCustomisation Activate/Deactivate the capability for a user to switch to a Web RTC video conversation.<br>
     * Define if one or all users of a company has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call).<br>
     * <br>
     * useWebRTCVideoCustomisation can be:<br>
     * 
     * - enabled: Each user of the company can switch to a Web RTC video conversation.<br>
     * - disabled: No user of the company can switch to a Web RTC video conversation.<br>
     * <br>
     * Default value : enabled
     * @param {string} recordingConversationCustomisation Activate/Deactivate the capability for a user to record a conversation.<br>
     * Define if one or all users of a company has the right to record a conversation (for P2P and multi-party calls).<br>
     * <br>
     * recordingConversationCustomisation can be:<br>
     * 
     * - enabled: The user can record a peer to peer or a multi-party call.<br>
     * - disabled: The user can't record a peer to peer or a multi-party call.<br>
     * <br>
     * Default value : enabled
     * @param {string} overridePresenceCustomisation Activate/Deactivate the capability for a user to change manually his presence.<br>
     * Define if one or all users of a company has the right to change his presence manually or only use automatic states.<br>
     * <br>
     * overridePresenceCustomisation can be:<br>
     * 
     * - enabled: Each user of the company can change his presence.<br>
     * - disabled: No user of the company can change his presence.<br>
     * <br>
     * Default value : enabled
     * @param {string} userProfileCustomisation Activate/Deactivate the capability for a user to modify his profile.<br>
     * Define if one or all users of a company has the right to modify the globality of his profile and not only (title, firstName, lastName).<br>
     * <br>
     * userProfileCustomisation can be:<br>
     * 
     * - enabled: Each user of the company can modify his profile.<br>
     * - disabled: No user of the company can modify his profile.<br>
     *<br>
     * Default value : enabled
     * @param {string} userTitleNameCustomisation Activate/Deactivate the capability for a user to modify his profile (title, firstName, lastName) per company<br>
     * Define if one or all users of a company is allowed to change some profile data.<br>
     * <br>
     * userTitleNameCustomisation can be:<br>
     * 
     * - enabled: Each user of the company can change some profile data, except when his own capability is set to 'disabled'.<br>
     * - disabled: Each user of the company can't change some profile data, except when his own capability is set to 'enabled'.<br>
     *<br>
     * Default value : enabled
     * @param {string} changeTelephonyCustomisation Activate/Deactivate the ability for a user to modify telephony settings.<br>
     * Define if one or all users of a company has the right to modify telephony settings like forward activation ....<br>
     * <br>
     * changeTelephonyCustomisation can be:<br>
     * 
     * - enabled: The user can modify telephony settings.<br>
     * - disabled: The user can't modify telephony settings.<br>
     * <br>
     * Default value : enabled
     * @param {string} changeSettingsCustomisation Activate/Deactivate the ability for a user to change all client general settings.<br>
     * Define if one or all users of a company has the right to change his client general settings.<br>
     * <br>
     * changeSettingsCustomisation can be:<br>
     * 
     * - enabled: The user can change all client general settings.<br>
     * - disabled: The user can't change any client general setting.<br>
     * <br>
     * Default value : enabled<br>
     * @param {string} fileCopyCustomisation Activate/Deactivate the capability for a user to copy files<br>
     * Define if one or all users of a company is allowed to copy any file he receives in his personal cloud space.<br>
     * <br>
     * fileCopyCustomisation can be:<br>
     * 
     * - enabled: The user can make a copy of a file to his personal cloud space.<br>
     * - disabled: The user can't make a copy of a file to his personal cloud space.<br>
     * <br>
     * default value : enabled
     * @param {string} fileTransferCustomisation Activate/Deactivate the ability for a user to transfer files.<br>
     * Define if one or all users of a company has the right to copy a file from a conversation then share it inside another conversation.<br>
     * <br>
     * fileTransferCustomisation can be:<br>
     * 
     * - enabled: The user can transfer a file doesn't belong to him.<br>
     * - disabled: The user can't transfer a file doesn't belong to him.<br>
     * <br>
     * Default value : enabled<br>
     * @param {string} forbidFileOwnerChangeCustomisation Activate/Deactivate the ability for a user to loose the ownership on one file.<br>
     * Define if one or all users can drop the ownership of a file to another Rainbow user of the same company<br>
     * <br>
     * forbidFileOwnerChangeCustomisation can be:<br>
     * 
     * - enabled: The user can't give the ownership of his file.<br>
     * - disabled: The user can give the ownership of his file.<br>
     * <br>
     * Default value : enabled
     * @param {string} readReceiptsCustomisation Activate/Deactivate the ability for a user to allow a sender to check if a chat message is read.<br>
     * Defines whether a peer user in a conversation allows the sender of a chat message to see if this IM is acknowledged by the peer.<br>
     * <br>
     * readReceiptsCustomisation can be:<br>
     * 
     * - enabled: The user allow the sender to check if an IM is read.<br>
     * - disabled: The user doesn't allow the sender to check if an IM is read.<br>
     * <br>
     * Default value : enabled
     * @param {string} useSpeakingTimeStatistics Activate/Deactivate the ability for a user to see speaking time statistics.<br>
     * Defines whether a user has the right to see for a given meeting the speaking time for each attendee of this meeting.<br>
     * <br>
     * useSpeakingTimeStatistics can be:<br>
     * 
     * - enabled: The user can use meeting speaking time statistics.<br>
     * - disabled: The user can't can use meeting speaking time statistics.<br>
     * <br>
     * Default value : enabled
     */
    createCustomisationTemplate (name : string, ownedByCompany : string, visibleBy : Array<string>, instantMessagesCustomisation : string, useGifCustomisation : string,
                                 fileSharingCustomisation : string, fileStorageCustomisation : string, phoneMeetingCustomisation : string, useDialOutCustomisation : string, useChannelCustomisation : string, useRoomCustomisation : string,
                                 useScreenSharingCustomisation : string, useWebRTCAudioCustomisation : string, useWebRTCVideoCustomisation : string, recordingConversationCustomisation : string, overridePresenceCustomisation : string,
                                 userProfileCustomisation : string, userTitleNameCustomisation : string, changeTelephonyCustomisation : string, changeSettingsCustomisation : string, fileCopyCustomisation : string,
                                 fileTransferCustomisation : string, forbidFileOwnerChangeCustomisation : string, readReceiptsCustomisation : string, useSpeakingTimeStatistics : string ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._logger.log("internal", LOG_ID + "(createCustomisationTemplate) : name : ", name);
                that._logger.log("info", LOG_ID + "(createCustomisationTemplate) enter.");
                that._rest.createCustomisationTemplate(name , ownedByCompany , visibleBy , instantMessagesCustomisation , useGifCustomisation ,
                        fileSharingCustomisation , fileStorageCustomisation , phoneMeetingCustomisation , useDialOutCustomisation , useChannelCustomisation , useRoomCustomisation ,
                        useScreenSharingCustomisation , useWebRTCAudioCustomisation , useWebRTCVideoCustomisation , recordingConversationCustomisation , overridePresenceCustomisation ,
                        userProfileCustomisation , userTitleNameCustomisation , changeTelephonyCustomisation , changeSettingsCustomisation , fileCopyCustomisation ,
                        fileTransferCustomisation , forbidFileOwnerChangeCustomisation , readReceiptsCustomisation , useSpeakingTimeStatistics ).then(json => {
                    that._logger.log("debug", LOG_ID + "(createCustomisationTemplate) Successfully done.");
                    that._logger.log("internal", LOG_ID + "(createCustomisationTemplate) : result : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(createCustomisationTemplate) Error when getting a token");
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createCustomisationTemplate) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteCustomisationTemplate
     * @instance
     * @description
     *      This API allows an administrator to delete an application customisation template.
     *      
     *      Users with superadmin role can delete any private template.
     *      
     *      Users with bp_admin or admin role can only delete template they owned.
     *      The template to delete may have been applied to one or several companies. So, before the template deletion, we have to go back to the application of this template. A default template is applyed instead (Full)
     *      This is done automitically and it could be necessary to advice the administrator before deleting the template.
     *      You can find on which companies the template has been applied by using the API getAllCompanies using the parameter selectedAppCustomisationTemplate=:templateId       
     * @async
     * @category Customisation Template
     * @return {Promise<Object, Error>}
     * @fulfil {Object} - Json object containing the result of the method
     * @category async
     * @param {string} templateId Template id.
     */
     deleteCustomisationTemplate(templateId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._logger.log("internal", LOG_ID + "(deleteCustomisationTemplate) : templateId : ", templateId);
                that._logger.log("info", LOG_ID + "(deleteCustomisationTemplate) enter.");
                that._rest.deleteCustomisationTemplate(templateId).then(json => {
                    that._logger.log("debug", LOG_ID + "(deleteCustomisationTemplate) Successfully done.");
                    that._logger.log("internal", LOG_ID + "(deleteCustomisationTemplate) : result : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(deleteCustomisationTemplate) Error when getting a token");
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(deleteCustomisationTemplate) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllAvailableCustomisationTemplates
     * @instance
     * @description
     *      This API allows administrator to retrieve application customisation templates supported by a given company.
     *      
     *      superadmin and support can get templates available for any company (the requested company has to be specified in companyId query parameter. bp_admin and company_admin get templates for its own company (no need to specify companyId parameter).
     * @async
     * @category Customisation Template
     * @return {Promise<Object, Error>}
     * @fulfil {Object} - Json object containing the result of the method
     * @category async
     * @param {string} companyId Select a company other than the one the user belongs to (must be an admin of the company)
     * @param {string} format Allows to retrieve more or less templates details in response.<br>  
     * - small: id, name, visibility<br>
     * - medium: id, name, visibility, visibleBy, type, createdBy, creationDate, ownedByCompany<br>
     * - full: all fields<br>
     * <br>
     * Default value : small<br>
     * Possible values : small, medium, full
     * @param {number} limit Allow to specify the number of templates to retrieve. Default value : 100
     * @param {number} offset Allow to specify the position of first templates to retrieve (first template if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort templates list based on the given field. Default value : name
     * @param {number} sortOrder Specify order when sorting templates list. Default value : 1. Possible values : -1, 1
     */
    getAllAvailableCustomisationTemplates (companyId : string = undefined, format : string = "small", limit : number = 100, offset : number = 0, sortField : string = "name", sortOrder : number = 1) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._logger.log("internal", LOG_ID + "(getAllAvailableCustomisationTemplates) : companyId : ", companyId, " format : ", format, " limit : ", limit);
                that._logger.log("info", LOG_ID + "(getAllAvailableCustomisationTemplates) enter.");
                that._rest.getAllAvailableCustomisationTemplates(companyId , format , limit , offset , sortField , sortOrder).then(json => {
                    that._logger.log("debug", LOG_ID + "(getAllAvailableCustomisationTemplates) Successfully done.");
                    that._logger.log("internal", LOG_ID + "(getAllAvailableCustomisationTemplates) : result : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(getAllAvailableCustomisationTemplates) Error when getting a token");
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllAvailableCustomisationTemplates) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllAvailableCustomisationTemplates
     * @instance
     * @description
     *      This API allows administrator to retrieve the requested application customisation template
     *      
     * @async
     * @category Customisation Template
     * @return {Promise<Object, Error>}
     * @fulfil {Object} - Json object containing the result of the method
     * @category async
     * @param {string} templateId Template id.
     */
    getRequestedCustomisationTemplate (templateId : string = undefined) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._logger.log("internal", LOG_ID + "(getRequestedCustomisationTemplate) : templateId : ", templateId);
                that._logger.log("info", LOG_ID + "(getRequestedCustomisationTemplate) enter.");
                that._rest.getRequestedCustomisationTemplate(templateId).then(json => {
                    that._logger.log("debug", LOG_ID + "(getRequestedCustomisationTemplate) Successfully done.");
                    that._logger.log("internal", LOG_ID + "(getRequestedCustomisationTemplate) : result : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(getRequestedCustomisationTemplate) Error when getting a token");
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getRequestedCustomisationTemplate) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method updateCustomisationTemplate
     * @instance
     * @description
     *     This API allows an administrator to update an application customisation template.
     *     
     *     A public template can't be updated using this API. Update is only allowed via a database migration.     
     * @async
     * @category Customisation Template
     * @return {Promise<Object, Error>}
     * @fulfil {Object} - Json object containing the result of the method
     * @category async
     * @param {string} templateId id of the template to update.
     * @param {string} name Template name.
     * @param {string} visibleBy When visibility is private, list of companyIds that can access the template (other than the 'ownedByCompany' one).
     * @param {string} instantMessagesCustomisation Activate/Deactivate the capability for a user to use instant messages.<br>
     * Define if one or all users of a company has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications.<br>
     * <br>
     * instantMessagesCustomisation can be:<br>
     *
     * - enabled: Each user of the company can use instant messages.<br>
     * - disabled: No user of the company can use instant messages.<br>
     * <br>
     * Default value : enabled
     * @param {string} useGifCustomisation Activate/Deactivate the ability for a user to Use GIFs in conversations.<br>
     * Define if one or all users of a company has the is allowed to send animated GIFs in conversations<br>
     * <br>
     * useGifCustomisation can be:<br>
     *
     * - enabled: The user can send animated GIFs in conversations.<br>
     * - disabled: The user can't send animated GIFs in conversations.<br>
     * <br>
     * Default value : enabled
     * @param {string} fileSharingCustomisation Activate/Deactivate file sharing capability per company<br>
     * Define if one or all users of a company can use the file sharing service then, allowed to download and share file.<br>
     * <br>
     * fileSharingCustomisation can be:<br>
     *
     * - enabled: Each user of the company can use the file sharing service, except when his own capability is set to 'disabled'.<br>
     * - disabled: Each user of the company can't use the file sharing service, except when his own capability is set to 'enabled'.<br>
     * <br>
     * Default value : enabled<br>
     * @param {string} fileStorageCustomisation Activate/Deactivate the capability for a user to access to Rainbow file storage.<br>
     * Define if one or all users of a company has the right to upload/download/copy or share documents.<br>
     * <br>
     * fileStorageCustomisation can be:<br>
     *
     * - enabled: Each user of the company can manage and share files.<br>
     * - disabled: No user of the company can manage and share files.<br>
     * <br>
     * Default value : enabled
     * @param {string} phoneMeetingCustomisation Activate/Deactivate the capability for a user to use phone meetings (PSTN conference).<br>
     * Define if one or all users of a company has the right to join phone meetings.<br>
     * <br>
     * phoneMeetingCustomisation can be:<br>
     *
     * -  enabled: Each user of the company can join phone meetings.<br>
     * - disabled: No user of the company can join phone meetings.<br>
     *<br>
     *  Default value : enabled
     * @param {string} useDialOutCustomisation Activate/Deactivate the capability for a user to use dial out in phone meetings.<br>
     * Define if one or all users of a company is allowed to be called by the Rainbow conference bridge.<br>
     * <br>
     * useDialOutCustomisation can be:<br>
     *
     * - enabled: The user can be called by the Rainbow conference bridge.<br>
     * - disabled: The user can't be called by the Rainbow conference bridge.<br>
     *<br>
     *  Default value : enabled
     * @param {string} useChannelCustomisation Activate/Deactivate the capability for a user to use a channel.<br>
     * Define if one or all users of a company has the right to create channels or be a member of channels.<br>
     * <br>
     * useChannelCustomisation can be:<br>
     *
     * - enabled: Each user of the company can use some channels.<br>
     * - disabled: No user of the company can use some channel.<br>
     * <br>
     * Default value : enabled
     * @param {string} useRoomCustomisation Activate/Deactivate the capability for a user to use bubbles.<br>
     * Define if one or all users of a company can create bubbles or participate in bubbles (chat and web conference).<br>
     * <br>
     * useRoomCustomisation can be:<br>
     *
     * - enabled: Each user of the company can use bubbles.<br>
     * - disabled: No user of the company can use bubbles.<br>
     *<br>
     *  Default value : enabled
     * @param {string} useScreenSharingCustomisation Activate/Deactivate the capability for a user to share a screen.<br>
     * Define if a user has the right to share his screen.<br>
     * <br>
     * useScreenSharingCustomisation can be:<br>
     *
     * - enabled: Each user of the company can share his screen.<br>
     * - disabled: No user of the company can share his screen.<br>
     * <br>
     * @param {string} useWebRTCAudioCustomisation Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation.<br>
     * Define if one or all users of a company has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call).<br>
     * <br>
     * useWebRTCVideoCustomisation can be:<br>
     *
     * - enabled: Each user of the company can switch to a Web RTC audio conversation.<br>
     * - disabled: No user of the company can switch to a Web RTC audio conversation.<br>
     *<br>
     * Default value : enabled
     * @param {string} useWebRTCVideoCustomisation Activate/Deactivate the capability for a user to switch to a Web RTC video conversation.<br>
     * Define if one or all users of a company has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call).<br>
     * <br>
     * useWebRTCVideoCustomisation can be:<br>
     *
     * - enabled: Each user of the company can switch to a Web RTC video conversation.<br>
     * - disabled: No user of the company can switch to a Web RTC video conversation.<br>
     * <br>
     * Default value : enabled
     * @param {string} recordingConversationCustomisation Activate/Deactivate the capability for a user to record a conversation.<br>
     * Define if one or all users of a company has the right to record a conversation (for P2P and multi-party calls).<br>
     * <br>
     * recordingConversationCustomisation can be:<br>
     *
     * - enabled: The user can record a peer to peer or a multi-party call.<br>
     * - disabled: The user can't record a peer to peer or a multi-party call.<br>
     * <br>
     * Default value : enabled
     * @param {string} overridePresenceCustomisation Activate/Deactivate the capability for a user to change manually his presence.<br>
     * Define if one or all users of a company has the right to change his presence manually or only use automatic states.<br>
     * <br>
     * overridePresenceCustomisation can be:<br>
     *
     * - enabled: Each user of the company can change his presence.<br>
     * - disabled: No user of the company can change his presence.<br>
     * <br>
     * Default value : enabled
     * @param {string} userProfileCustomisation Activate/Deactivate the capability for a user to modify his profile.<br>
     * Define if one or all users of a company has the right to modify the globality of his profile and not only (title, firstName, lastName).<br>
     * <br>
     * userProfileCustomisation can be:<br>
     *
     * - enabled: Each user of the company can modify his profile.<br>
     * - disabled: No user of the company can modify his profile.<br>
     *<br>
     * Default value : enabled
     * @param {string} userTitleNameCustomisation Activate/Deactivate the capability for a user to modify his profile (title, firstName, lastName) per company<br>
     * Define if one or all users of a company is allowed to change some profile data.<br>
     * <br>
     * userTitleNameCustomisation can be:<br>
     *
     * - enabled: Each user of the company can change some profile data, except when his own capability is set to 'disabled'.<br>
     * - disabled: Each user of the company can't change some profile data, except when his own capability is set to 'enabled'.<br>
     *<br>
     * Default value : enabled
     * @param {string} changeTelephonyCustomisation Activate/Deactivate the ability for a user to modify telephony settings.<br>
     * Define if one or all users of a company has the right to modify telephony settings like forward activation ....<br>
     * <br>
     * changeTelephonyCustomisation can be:<br>
     *
     * - enabled: The user can modify telephony settings.<br>
     * - disabled: The user can't modify telephony settings.<br>
     * <br>
     * Default value : enabled
     * @param {string} changeSettingsCustomisation Activate/Deactivate the ability for a user to change all client general settings.<br>
     * Define if one or all users of a company has the right to change his client general settings.<br>
     * <br>
     * changeSettingsCustomisation can be:<br>
     *
     * - enabled: The user can change all client general settings.<br>
     * - disabled: The user can't change any client general setting.<br>
     * <br>
     * Default value : enabled<br>
     * @param {string} fileCopyCustomisation Activate/Deactivate the capability for a user to copy files<br>
     * Define if one or all users of a company is allowed to copy any file he receives in his personal cloud space.<br>
     * <br>
     * fileCopyCustomisation can be:<br>
     *
     * - enabled: The user can make a copy of a file to his personal cloud space.<br>
     * - disabled: The user can't make a copy of a file to his personal cloud space.<br>
     * <br>
     * default value : enabled
     * @param {string} fileTransferCustomisation Activate/Deactivate the ability for a user to transfer files.<br>
     * Define if one or all users of a company has the right to copy a file from a conversation then share it inside another conversation.<br>
     * <br>
     * fileTransferCustomisation can be:<br>
     *
     * - enabled: The user can transfer a file doesn't belong to him.<br>
     * - disabled: The user can't transfer a file doesn't belong to him.<br>
     * <br>
     * Default value : enabled<br>
     * @param {string} forbidFileOwnerChangeCustomisation Activate/Deactivate the ability for a user to loose the ownership on one file.<br>
     * Define if one or all users can drop the ownership of a file to another Rainbow user of the same company<br>
     * <br>
     * forbidFileOwnerChangeCustomisation can be:<br>
     *
     * - enabled: The user can't give the ownership of his file.<br>
     * - disabled: The user can give the ownership of his file.<br>
     * <br>
     * Default value : enabled
     * @param {string} readReceiptsCustomisation Activate/Deactivate the ability for a user to allow a sender to check if a chat message is read.<br>
     * Defines whether a peer user in a conversation allows the sender of a chat message to see if this IM is acknowledged by the peer.<br>
     * <br>
     * readReceiptsCustomisation can be:<br>
     *
     * - enabled: The user allow the sender to check if an IM is read.<br>
     * - disabled: The user doesn't allow the sender to check if an IM is read.<br>
     * <br>
     * Default value : enabled
     * @param {string} useSpeakingTimeStatistics Activate/Deactivate the ability for a user to see speaking time statistics.<br>
     * Defines whether a user has the right to see for a given meeting the speaking time for each attendee of this meeting.<br>
     * <br>
     * useSpeakingTimeStatistics can be:<br>
     *
     * - enabled: The user can use meeting speaking time statistics.<br>
     * - disabled: The user can't can use meeting speaking time statistics.<br>
     * <br>
     * Default value : enabled
     */
    updateCustomisationTemplate (templateId : string, name : string, visibleBy : string[],
                                 instantMessagesCustomisation : string = "enabled", useGifCustomisation : string = "enabled", fileSharingCustomisation : string = "enabled", fileStorageCustomisation : string = "enabled", phoneMeetingCustomisation : string = "enabled",
                                 useDialOutCustomisation : string = "enabled", useChannelCustomisation : string = "enabled", useRoomCustomisation : string = "enabled", useScreenSharingCustomisation : string = "enabled", useWebRTCAudioCustomisation : string = "enabled",
                                 useWebRTCVideoCustomisation : string = "enabled", recordingConversationCustomisation : string = "enabled", overridePresenceCustomisation : string = "enabled", userProfileCustomisation : string = "enabled",
                                 userTitleNameCustomisation : string = "enabled", changeTelephonyCustomisation : string = "enabled", changeSettingsCustomisation : string = "enabled", fileCopyCustomisation : string = "enabled",
                                 fileTransferCustomisation : string = "enabled", forbidFileOwnerChangeCustomisation : string = "enabled", readReceiptsCustomisation : string = "enabled", useSpeakingTimeStatistics : string  = "enabled") {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._logger.log("internal", LOG_ID + "(updateCustomisationTemplate) : templateId : ", templateId);
                that._logger.log("info", LOG_ID + "(updateCustomisationTemplate) enter.");
                that._rest.updateCustomisationTemplate(templateId, name, visibleBy ,
                        instantMessagesCustomisation , useGifCustomisation , fileSharingCustomisation , fileStorageCustomisation , phoneMeetingCustomisation ,
                        useDialOutCustomisation , useChannelCustomisation , useRoomCustomisation , useScreenSharingCustomisation , useWebRTCAudioCustomisation ,
                        useWebRTCVideoCustomisation , recordingConversationCustomisation , overridePresenceCustomisation , userProfileCustomisation ,
                        userTitleNameCustomisation , changeTelephonyCustomisation , changeSettingsCustomisation , fileCopyCustomisation ,
                        fileTransferCustomisation , forbidFileOwnerChangeCustomisation , readReceiptsCustomisation , useSpeakingTimeStatistics).then(json => {
                    that._logger.log("debug", LOG_ID + "(updateCustomisationTemplate) Successfully done.");
                    that._logger.log("internal", LOG_ID + "(updateCustomisationTemplate) : result : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(updateCustomisationTemplate) Error when getting a token");
                    return reject(err);
                });
            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(updateCustomisationTemplate) error : ", err);
                return reject(err);
            }
        });   
    }
    
    //endregion Customisation Template
    
    //region Users at running 

    /**
     * @public
     * @method askTokenOnBehalf
     * @instance
     * @description
     *      Ask Rainbow for a token on behalf a user <br>
     *      This allow to not use the secret key on client side <br>
     * @param {string} loginEmail The user login email
     * @param {string} password The user password
     * @async
     * @category Users at running
     * @return {Promise<Object, Error>}
     * @fulfil {Object} - Json object containing the user data, application data and token
     * @category async
     */
    askTokenOnBehalf(loginEmail, password) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._logger.log("internal", LOG_ID + "(askTokenOnBehalf) : loginEmail", loginEmail, " password : ", password);
                that._logger.log("info", LOG_ID + "(askTokenOnBehalf) enter.");
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
     *
     * @public
     * @method getUserPresenceInformation
     * @instance
     * @description
     *      Get presence informations about a user <br>
     * <br>
     *      Company admin shall be able to check if a user can be reached or not, by checking the presence information (available, busy, away, etc). <br>
     *      Admin will have to select a user to get a presence snapshot when opening the user configuration profile. <br>
     *      A brute force defense is activated when too much request have been requested by the same administrator, to not overload the backend. As a result, an error 429 "Too Many Requests" will be returned . <br>
     * @param {string} userId The id of the user. If the userId is not provided, then it use the current loggedin user id.
     * @async
     * @category Users at running
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
    
    //endregion Users at running 
    
    //region Offers and Subscriptions.
    
    /**
     * @public
     * @method retrieveAllOffersOfCompanyById
     * @since 1.73
     * @instance
     * @async
     * @category Offers and Subscriptions.
     * @param {string} companyId Id of the company to be retrieve the offers.
     * @description
     *      Method to retrieve all the offers of one company on server. <br>
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
     * @method retrieveAllSubscriptionsOfCompanyById
     * @since 1.73
     * @instance
     * @async
     * @category Offers and Subscriptions.
     * @param {string} companyId Id of the company to be retrieve the subscriptions.
     * @param {string} format Allows to retrieve more or less subscription details in response. (default value: "small") <br>
     * - small: id offerId profileId isDefault<br>
     * - medium: id offerId profileId isDefault maxNumberUsers status<br>
     * - full: all offer fields, including computed user assignment fields (numberAssignedUsers, nbAssignedBPUsers, nbLicencesAssignedToECs, ...)<br>
     * @description
     *      Method to retrieve all the subscriptions of one company on server. <br>
     * @return {Promise<Array<any>>}
     */
    retrieveAllSubscriptionsOfCompanyById(companyId?: string, format : string = "small") : Promise<Array<any>> {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                companyId = companyId? companyId : that._rest.account.companyId;
                that._rest.retrieveAllCompanySubscriptions(companyId, format ).then((result: any) => {
                    that._logger.log("debug", LOG_ID + "(retrieveAllSubscriptionsOfCompanyById) Successfully get all infos");
                    that._logger.log("internal", LOG_ID + "(retrieveAllSubscriptionsOfCompanyById) : result : ", result);
                    resolve(result);
                }).catch(function (err) {
                    that._logger.log("internalerror", LOG_ID + "(retrieveAllSubscriptionsOfCompanyById) ErrorManager when put infos", err);
                    that._logger.log("error", LOG_ID + "(retrieveAllSubscriptionsOfCompanyById) ErrorManager when put infos");
                    return reject(err);
                });
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getSubscriptionsOfCompanyByOfferId
     * @since 1.73
     * @instance
     * @async
     * @category Offers and Subscriptions.
     * @param {string} offerId Id of the offer to filter subscriptions.
     * @param {string} companyId Id of the company to get the subscription of the offer.
     * @description
     *      Method to get the subscription of one company for one offer. <br>
     * @return {Promise<any>}
     */
    async getSubscriptionsOfCompanyByOfferId(offerId, companyId) : Promise<any>{
        let that = this;
        return new Promise(async function (resolve, reject) {
            try {        //let Offers =  await that.retrieveAllOffersOfCompanyById(companyId);
                let subscriptions : Array<any> = await that.retrieveAllSubscriptionsOfCompanyById(companyId);
                for (let subscription of subscriptions) {
                    //that._logger.log("debug", "(getSubscriptionsOfCompanyByOfferId) subscription : ", subscription);
                    if (subscription.offerId === offerId) {
                        that._logger.log("debug", "(getSubscriptionsOfCompanyByOfferId) subscription found : ", subscription);
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
     * @category Offers and Subscriptions.
     * @param {string} offerId Id of the offer to filter subscriptions.
     * @param {string} companyId Id of the company to get the subscription of the offer.
     * @param {number} maxNumberUsers
     * @param {boolean} autoRenew
     * @description
     *      Method to subscribe one company to one offer. <br>
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
     * @category Offers and Subscriptions.
     * @param {string} companyId Id of the company to get the subscription of the offer.
     * @description
     *      Method to subscribe one company to offer demo. <br>
     *      Private offer on .Net platform. <br>
     * @return {Promise<any>}
     */
    subscribeCompanyToDemoOffer(companyId? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                companyId = companyId? companyId : that._rest.account.companyId;
                let Offers = await that.retrieveAllOffersOfCompanyById(companyId);
                that._logger.log("debug", "(subscribeCompanyToDemoOffer) - Offers : ", Offers);
                let found = false;
                for (let offer of Offers) {
                    that._logger.log("debug", "(subscribeCompanyToDemoOffer) offer : ", offer);
                    if (offer.name === "Enterprise Demo" || offer.name === "Enterprise Custom" ) {
                        found = true;
                        that._logger.log("debug", "(subscribeCompanyToDemoOffer) offer Enterprise Demo found : ", offer);
                        return resolve (await that.subscribeCompanyToOfferById(offer.id, companyId, 10, true));
                    }
                }
                if (!found) {
                    return reject ({code : -1, label : "Subscription not found."})
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
     * @category Offers and Subscriptions.
     * @param {string} companyId Id of the company to get the subscription of the offer.
     * @description
     *      Method to unsubscribe one company to offer demo. <br>
     *      Private offer on .Net platform. <br>
     * @return {Promise<any>}
     */
    unSubscribeCompanyToDemoOffer(companyId? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                companyId = companyId? companyId : that._rest.account.companyId;
                let Offers = await that.retrieveAllOffersOfCompanyById(companyId);
                let found = false
                that._logger.log("debug", "(unSubscribeCompanyToDemoOffer) - Offers : ", Offers);
                for (let offer of Offers) {
                    that._logger.log("debug", "(unSubscribeCompanyToDemoOffer) offer : ", offer);
                    if (offer.name === "Enterprise Demo" || offer.name === "Enterprise Custom") {
                        that._logger.log("debug", "(unSubscribeCompanyToDemoOffer) offer Enterprise Demo found : ", offer);
                        found = true;
                        return resolve (await that.unSubscribeCompanyToOfferById(offer.id, companyId));
                    }
                }
                if (!found) {
                    return reject ({code : -1, label : "un Subscription not found."})
                }
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method subscribeCompanyToAlertOffer
     * @since 1.73
     * @instance
     * @async
     * @category Offers and Subscriptions.
     * @param {string} companyId Id of the company to the subscription of the offer.
     * @description
     *      Method to subscribe one company to offer Alert. <br>
     *      Private offer on .Net platform. <br>
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
                        that._logger.log("debug", "(subscribeCompanyToAlertOffer) offer Alert Custom found : ", offer);
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
     * @method unSubscribeCompanyToAlertOffer
     * @since 1.73
     * @instance
     * @async
     * @category Offers and Subscriptions.
     * @param {string} companyId Id of the company to the unsubscription of the offer.
     * @description
     *      Method to unsubscribe one company to offer Alert. <br>
     *      Private offer on .Net platform. <br>
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
                        that._logger.log("debug", "(unSubscribeCompanyToAlertOffer) offer Alert Custom found : ", offer);
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
     * @method subscribeCompanyToVoiceEnterpriseOffer
     * @since 1.73
     * @instance
     * @async
     * @category Offers and Subscriptions.
     * @param {string} companyId Id of the company the subscription of the offer.
     * @description
     *      Method to subscribe one company to offer Voice Enterprise. <br>
     *      Private offer on .Net platform. <br>
     * @return {Promise<any>}
     */
    subscribeCompanyToVoiceEnterpriseOffer(companyId? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                companyId = companyId? companyId : that._rest.account.companyId;
                let Offers = await that.retrieveAllOffersOfCompanyById(companyId);
                that._logger.log("debug", "(subscribeCompanyToVoiceEnterpriseOffer) - Offers : ", Offers);
                for (let offer of Offers) {
                    that._logger.log("debug", "(subscribeCompanyToVoiceEnterpriseOffer) offer : ", offer);
                    if ( offer.name === "Voice Enterprise Custom") { //
                        that._logger.log("debug", "(subscribeCompanyToVoiceEnterpriseOffer) offer Voice Enterprise Custom found : ", offer);
                        return resolve (await that.subscribeCompanyToOfferById(offer.id, companyId, 10, true));
                    }
                }
                return reject ({"code" : -1, "label" : "Failed to subscribeCompanyToVoiceEnterpriseOffer"}) ;
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method unSubscribeCompanyToVoiceEnterpriseOffer
     * @since 1.73
     * @instance
     * @async
     * @category Offers and Subscriptions.
     * @param {string} companyId Id of the company to the unsubscription of the offer.
     * @description
     *      Method to unsubscribe one company to offer Voice Enterprise. <br>
     *      Private offer on .Net platform. <br>
     * @return {Promise<any>}
     */
    unSubscribeCompanyToVoiceEnterpriseOffer(companyId? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                companyId = companyId? companyId : that._rest.account.companyId;
                let Offers = await that.retrieveAllOffersOfCompanyById(companyId);
                that._logger.log("debug", "(unSubscribeCompanyToVoiceEnterpriseOffer) - Offers : ", Offers);
                for (let offer of Offers) {
                    that._logger.log("debug", "(unSubscribeCompanyToVoiceEnterpriseOffer) offer : ", offer);
                    if (offer.name === "Voice Enterprise Custom") {
                        that._logger.log("debug", "(unSubscribeCompanyToVoiceEnterpriseOffer) offer Voice Enterprise Custom found : ", offer);
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
     * @category Offers and Subscriptions.
     * @param {string} offerId Id of the offer to filter subscriptions.
     * @param {string} companyId Id of the company to get the subscription of the offer.
     * @description
     *      Method to unsubscribe one company to one offer . <br>
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
                let subscription = await that.getSubscriptionsOfCompanyByOfferId(offerId, companyId) ;
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
     * @category Offers and Subscriptions.
     * @param {string} userId the id of the user which will subscribe. If not provided, the connected user is used.
     * @param {string} subscriptionId the id of the subscription to attach to user.
     * @description
     *      Method to subscribe one user to a subscription of the company. <br>
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
     * @category Offers and Subscriptions.
     * @param {string} userId the id of the user which will unsubscribe. If not provided, the connected user is used.
     * @param {string} subscriptionId the id of the subscription to unsubscribe the user.
     * @description
     *      Method to unsubscribe one user to a subscription. <br>
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

    /**
     * @public
     * @method getAUserProfilesByUserId
     * @since 2.11.0
     * @instance
     * @async
     * @category Offers and Subscriptions.
     * @param {string} userId the id of the user. If not provided, the connected user is used.
     * @description
     *      Method to retrieve the profiles of a user by his id. <br>
     * @return {Promise<any>} result.
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | subscriptionId | string | Id of company subscription to which user profile is assigned (one of the subscriptions available to user's company) |
     * | offerId | string | Id of the offer to which company subscription is attached |
     * | offerName | string | Name of the offer to which company subscription is attached |
     * | offerDescription | string | Description of the offer to which company subscription is attached |
     * | offerTechnicalDescription | string | Technical description of the subscribed offer |
     * | offerReference | string | Key used for referencing the subscribed offer. Well know offer References are: RB-Essential, RB-Business, RB-Enterprise, RB-Conference. |
     * | profileId | string | Id of the profile to which company subscription is attached |
     * | profileName | string | Name of the profile to which company subscription is attached |
     * | status | string | Status of the company subscription to which user profile is assigned  <br>  <br>Possible values: `active`, `alerting`, `hold`, `terminated` |
     * | isDefault | boolean | Indicates if this profile is linked to user's company's subscription to default offer (i.e. Essential) |
     * | canBeSold | boolean | Indicates if this profile is linked a subscription for a paid offer.  <br>Some offers are not be sold (Essential, Beta, Demo, ...).  <br>If canBeSold is true, the subscription is billed. |
     * | businessModel | string | Indicates the business model associated to the subscribed offer (number of users, usage, ...)<br><br>* `nb_users`: Licencing business model. Offers having this business model are billed according to the number of users bought for it. This should be the business model for Business and Enterprise offers.<br>* `usage`: Offers having this business model are billed based on service consumption (whatever the number of users assigned to the subscription of this offer). This should be the business model for Conference offer.<br>* `none`: no business model. Used for offers which are not sold (like Essential, Beta, ...).<br><br>Possible values : `nb_users`, `usage`, `none` |
     * | isExclusive | boolean | Indicates if this profile is relative to a subscription for an exclusive offer (if the user has already an exclusive offer assigned, it won't be possible to assign a second exclusive offer).  <br>Used on GUI side to know if the subscription to assign to a user profile has to be displayed as a radio button or as a check box. |
     * | isPrepaid | boolean | Indicates if this profile is relative to a subscription for a prepaid offer |
     * | expirationDate | Date-Time | Expiration date of the subscription to the prepaid offer (creationDate + prepaidDuration) |
     * | provisioningNeeded | Object\[\] | Indicates if provisioning is needed on other component when assigning the user profile to this subscription (depends of thus subscribed offer) |
     * | providerType | string | If provisioningNeeded is set, each element of the array must contain providerType. providerType defines the component on which the provisioning is needed when subscribing to this offer (provisioning is launched asynchronously when Business Store confirms through the callback that the subscription is created).<br><br>Possible values : `PGI`, `JANUS` |
     * | mediaType optionnel | string | Only set if provisioningNeeded is set and the element of the array has providerType `JANUS`. Corresponds to the media type to use when provisioning the company account on JANUS component.<br><br>Possible values : `webrtc` |
     * | provisioningOngoing | boolean | boolean indicating if the account is being provisioned on the other component. If set to false, the account has been successfully created on the component. |
     * | provisioningStartDate | string | Provisioning starting date |
     * | assignationDate | string | Date when the subscription was attached to user profile |
     * 
     */
    getAUserProfilesByUserId(userId? : string){
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                
                if (!userId) {
                    userId = that._rest.account.id;
                }
                
                let result = await that._rest.getAUserProfiles(userId);
                that._logger.log("debug", "(getAUserProfilesByUserId) - request sent.");
                that._logger.log("internal", "(getAUserProfilesByUserId) - request result : ", result);
                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getAUserProfilesByUserId) Error.");
                that._logger.log("internalerror", LOG_ID + "(getAUserProfilesByUserId) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @public
     * @method getAUserProfilesByUserEmail
     * @since 2.11.0
     * @instance
     * @async
     * @category Offers and Subscriptions.
     * @param {string} email the email of the user. If not provided, the connected user is used.
     * @description
     *      Method to retrieve the profiles of a user by his email. <br>
     * @return {Promise<any>} result.
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | subscriptionId | string | Id of company subscription to which user profile is assigned (one of the subscriptions available to user's company) |
     * | offerId | string | Id of the offer to which company subscription is attached |
     * | offerName | string | Name of the offer to which company subscription is attached |
     * | offerDescription | string | Description of the offer to which company subscription is attached |
     * | offerTechnicalDescription | string | Technical description of the subscribed offer |
     * | offerReference | string | Key used for referencing the subscribed offer. Well know offer References are: RB-Essential, RB-Business, RB-Enterprise, RB-Conference. |
     * | profileId | string | Id of the profile to which company subscription is attached |
     * | profileName | string | Name of the profile to which company subscription is attached |
     * | status | string | Status of the company subscription to which user profile is assigned  <br>  <br>Possible values: `active`, `alerting`, `hold`, `terminated` |
     * | isDefault | boolean | Indicates if this profile is linked to user's company's subscription to default offer (i.e. Essential) |
     * | canBeSold | boolean | Indicates if this profile is linked a subscription for a paid offer.  <br>Some offers are not be sold (Essential, Beta, Demo, ...).  <br>If canBeSold is true, the subscription is billed. |
     * | businessModel | string | Indicates the business model associated to the subscribed offer (number of users, usage, ...)<br><br>* `nb_users`: Licencing business model. Offers having this business model are billed according to the number of users bought for it. This should be the business model for Business and Enterprise offers.<br>* `usage`: Offers having this business model are billed based on service consumption (whatever the number of users assigned to the subscription of this offer). This should be the business model for Conference offer.<br>* `none`: no business model. Used for offers which are not sold (like Essential, Beta, ...).<br><br>Possible values : `nb_users`, `usage`, `none` |
     * | isExclusive | boolean | Indicates if this profile is relative to a subscription for an exclusive offer (if the user has already an exclusive offer assigned, it won't be possible to assign a second exclusive offer).  <br>Used on GUI side to know if the subscription to assign to a user profile has to be displayed as a radio button or as a check box. |
     * | isPrepaid | boolean | Indicates if this profile is relative to a subscription for a prepaid offer |
     * | expirationDate | Date-Time | Expiration date of the subscription to the prepaid offer (creationDate + prepaidDuration) |
     * | provisioningNeeded | Object\[\] | Indicates if provisioning is needed on other component when assigning the user profile to this subscription (depends of thus subscribed offer) |
     * | providerType | string | If provisioningNeeded is set, each element of the array must contain providerType. providerType defines the component on which the provisioning is needed when subscribing to this offer (provisioning is launched asynchronously when Business Store confirms through the callback that the subscription is created).<br><br>Possible values : `PGI`, `JANUS` |
     * | mediaType optionnel | string | Only set if provisioningNeeded is set and the element of the array has providerType `JANUS`. Corresponds to the media type to use when provisioning the company account on JANUS component.<br><br>Possible values : `webrtc` |
     * | provisioningOngoing | boolean | boolean indicating if the account is being provisioned on the other component. If set to false, the account has been successfully created on the component. |
     * | provisioningStartDate | string | Provisioning starting date |
     * | assignationDate | string | Date when the subscription was attached to user profile |
     * 
     */
    getAUserProfilesByUserEmail(email? : string){
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let userId = that._rest.account.id;
                
                if (email) {
                    userId = (await that._contacts.getContactByLoginEmail(email, false)).id;
                }
                
                let result = await that._rest.getAUserProfiles(userId);
                that._logger.log("debug", "(getAUserProfilesByUserEmail) - request sent.");
                that._logger.log("internal", "(getAUserProfilesByUserEmail) - request result : ", result);
                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getAUserProfilesByUserEmail) Error.");
                that._logger.log("internalerror", LOG_ID + "(getAUserProfilesByUserEmail) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAUserProfilesFeaturesByUserId
     * @since 2.11.0
     * @instance
     * @async
     * @category Offers and Subscriptions.
     * @param {string} userId the id of the user. If not provided, the connected user is used.
     * @description
     *      Method to retrieve the features profiles of a user by his id. <br>
     * @return {Promise<any>} result.
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object\[\] | List of feature Objects. |
     * | featureId | string | Feature unique identifier |
     * | featureUniqueRef | string | Feature unique reference (to be used for controls on limitations linked to this feature in server/client code) |
     * | featureName | string | Feature name |
     * | featureType | string | Feature limitation type (`boolean`, `number`, `string`, `undefined`) |
     * | isEnabled | boolean | In case feature has type boolean (on/off), is the feature enabled |
     * | limitMin | Number | In case feature has type number, limit min of the feature (if applicable) |
     * | limitMax | string | In case feature has type number, limit max of the feature (if applicable) |
     * | addedDate | Date-Time | Date when the feature was updated for the profile |
     * | lastUpdateDate | Date-Time | Date when the feature was updated for the profile |
     *
     */
     getAUserProfilesFeaturesByUserId(userId? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {

                if (!userId) {
                    userId = that._rest.account.id;
                }

                let result = await that._rest.getAUserProfilesFeaturesByUserId(userId);
                that._logger.log("debug", "(getAUserProfilesFeaturesByUserId) - request sent.");
                that._logger.log("internal", "(getAUserProfilesFeaturesByUserId) - request result : ", result);
                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getAUserProfilesFeaturesByUserId) Error.");
                that._logger.log("internalerror", LOG_ID + "(getAUserProfilesFeaturesByUserId) Error : ", err);
                return reject(err);
            }
        });
    }
    

    /**
     * @public
     * @method getAUserProfilesFeaturesByUserEmail
     * @since 2.11.0
     * @instance
     * @async
     * @category Offers and Subscriptions.
     * @param {string} email the email of the user. If not provided, the connected user is used.
     * @description
     *      Method to retrieve the features profiles of a user by his email. <br>
     * @return {Promise<any>} result.
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object\[\] | List of feature Objects. |
     * | featureId | string | Feature unique identifier |
     * | featureUniqueRef | string | Feature unique reference (to be used for controls on limitations linked to this feature in server/client code) |
     * | featureName | string | Feature name |
     * | featureType | string | Feature limitation type (`boolean`, `number`, `string`, `undefined`) |
     * | isEnabled | boolean | In case feature has type boolean (on/off), is the feature enabled |
     * | limitMin | Number | In case feature has type number, limit min of the feature (if applicable) |
     * | limitMax | string | In case feature has type number, limit max of the feature (if applicable) |
     * | addedDate | Date-Time | Date when the feature was updated for the profile |
     * | lastUpdateDate | Date-Time | Date when the feature was updated for the profile |
     *
     */
     getAUserProfilesFeaturesByUserEmail(email? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let userId = that._rest.account.id;

                if (email) {
                    userId = (await that._contacts.getContactByLoginEmail(email, false)).id;
                }
                
                let result = await that._rest.getAUserProfilesFeaturesByUserId(userId);
                that._logger.log("debug", "(getAUserProfilesFeaturesByUserEmail) - request sent.");
                that._logger.log("internal", "(getAUserProfilesFeaturesByUserEmail) - request result : ", result);
                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getAUserProfilesFeaturesByUserEmail) Error.");
                that._logger.log("internalerror", LOG_ID + "(getAUserProfilesFeaturesByUserEmail) Error : ", err);
                return reject(err);
            }
        });
    }
    
    //endregion Offers and Subscriptions.

    //region AD/LDAP
    //region AD/LDAP Massprovisioning

    /**
     * @public
     * @method checkCSVdata
     * @since 2.12.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId
     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided)
     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character
     * @param {any} data body of the POST.
     * @description
     *     This API checks a CSV UTF-8 content for mass-provisioning. Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. <br>
     * <br>
     * @return {Promise<any>} result.
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | * check results summary |
     * | reqId | String | * check request identifier |
     * | mode | String | * request csv mode<br><br>Possible values : `user`, `device` |
     * | actions | Object | * actions information |
     * | add optionnel | Number | * number of user add actions |
     * | update optionnel | Number | * number of user update actions |
     * | remove optionnel | Number | * number of user remove actions |
     * | attach optionnel | Number | * number of device pairing actions |
     * | force_attach optionnel | Number | * number of device forced pairing actions |
     * | columns | Number | * number of columns in the CSV |
     * | detach optionnel | Number | * number of device unpairing actions |
     * | delimiter | String | * the CSV delimiter |
     * | profiles | Object | * the managed profiles |
     * | name | String | * the managed profiles name |
     * | valid | Boolean | * the managed profiles validity |
     * | assignedBefore | Number | * the assigned number of managed profiles before this import |
     * | assignedAfter | Number | * the assigned number of managed profiles after this import has been fulfilled |
     * | max | Number | * the maximum number of managed profiles available |
     * 
     */
    checkCSVdata( data?: any, companyId? : string, delimiter? : string, comment : string = "%") {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let checkCSVRestResult = await that._rest.checkCSVdata(data, companyId , delimiter, comment);
                that._logger.log("debug", "(checkCSVdata) - sent.");
                that._logger.log("internal", "(checkCSVdata) - checkCSVRestResult : ", checkCSVRestResult);               
                resolve (checkCSVRestResult);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(checkCSVdata) Error.");
                that._logger.log("internalerror", LOG_ID + "(checkCSVdata) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @public
     * @method deleteAnImportStatusReport
     * @since 2.12.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} reqId the import request id
     * @description
     *     This API allows to delete the report of an import identified by its reqId. <br>
     * <br>
     * @return {Promise<any>} result.
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | * delete status |
     * | reqId | String | * deleted reqId |
     * | status | String | * delete status |
     * 
     */
    deleteAnImportStatusReport(reqId? : string, delimiter? : string, comment : string = "%") {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.deleteAnImportStatusReport(reqId);
                that._logger.log("debug", "(deleteAnImportStatusReport) - sent.");
                that._logger.log("internal", "(deleteAnImportStatusReport) - result : ", result);               
                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(deleteAnImportStatusReport) Error.");
                that._logger.log("internalerror", LOG_ID + "(deleteAnImportStatusReport) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAnImportStatusReport
     * @since 2.12.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} reqId the import request id
     * @param {string} format Allows to retrieve more or less report details.
     * - small: reporting without operation details
     * - full: reporting with operation details
     * Default value : full
     * Possible values : small, full
     * @description
     *     This API allows to access the report of an import identified by its reqId. <br>
     * <br>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | * import report |
     * | reqId | String | * import request identifier |
     * | mode | String | * provisioning mode<br><br>Possible values : `user`, `device`, `rainbowvoice` |
     * | status | String | * request status |
     * | report | Object | * request report |
     * | status | String | * action status |
     * | action | String | * the fulfilled action |
     * | userId | String | * Rainbow user Id |
     * | failingLines | String\[\] | * CSV lines that failed |
     * | line optionnel | String | * associated CSV line in an error case |
     * | counters | Object | * request counters |
     * | succeeded | Integer | * '#' of succeeded action |
     * | failed | Integer | * '#' of failed action |
     * | label | String | * description of the import |
     * | total | Integer | * total '#' of actions |
     * | userId | String | * id of the requesting user |
     * | displayName | String | * the requesting user displayname |
     * | companyId | String | * the default company Id |
     * | startTime | String | * the import processing start time |
     * | profiles | Object | * provides info about licences used |
     * | subscriberReport optionnel | Object | * provides details about subscriber action (attach, update or detach action) - only in case of rainbowvoice mode |
     * | sipDeviceReport optionnel | Object | * provides details about sip Device action (attach or detach action) - only in case of rainbowvoice mode |
     * | ddiReport optionnel | Object | * provides details about ddi action (attach or detach action) - only in case of rainbowvoice mode |
     * | endTime | String | * the import processing end time |
     *
     */
    getAnImportStatusReport(reqId? : string, format : string= "full") {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.deleteAnImportStatusReport(reqId);
                that._logger.log("debug", "(deleteAnImportStatusReport) - sent.");
                that._logger.log("internal", "(deleteAnImportStatusReport) - result : ", result);
                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(deleteAnImportStatusReport) Error.");
                that._logger.log("internalerror", LOG_ID + "(deleteAnImportStatusReport) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getInformationOnImports
     * @since 2.12.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} companyId the companyId to list imports of
     * @description
     *     This API provides information on all imports of the administrator's company. <br>
     * <br>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | reqId | String | * import request identifier |
     * | status | String | * import status |
     * | userId | String | * id of the requesting user |
     * | displayName | String | * display name of the requesting user |
     * | mode | String | * provisioning mode<br><br>Possible values : `user`, `device`, `rainbowvoice` |
     * | label | String | * description of the import |
     * | startTime | String | * the import processing start time |
     * | endTime | String | * the import processing end time |
     * | counters | Object | * the import processing operation status counters |
     * | data | Object\[\] | * list of company imports |
     * | succeeded | Integer | * '#' of succeeded actions |
     * | failed | Integer | * '#' of failed actions |
     * | warnings | Integer | * '#' actions with warnings |
     * | total | Integer | * total '#' of actions |
     *
     */
    getInformationOnImports(companyId? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getInformationOnImports(companyId);
                that._logger.log("debug", "(getInformationOnImports) - sent.");
                that._logger.log("internal", "(getInformationOnImports) - result : ", result);
                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getInformationOnImports) Error.");
                that._logger.log("internalerror", LOG_ID + "(getInformationOnImports) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getResultOfStartedOffice365TenantSynchronizationTask
     * @since 2.12.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} tenant Office365 tenant
     * @param {string} format Allows to retrieve more or less phone numbers details in response.
     * - json: answer follows the pattern { "data" : { ... JSON ... }}
     * - csv: answer follows the pattern { "data" : [ ... CSV ... ]}
     * - all: answer follows the pattern { "data" : { jsonContent: {...........}, csvContent: [ , , ; , , ] }}
     * Default value : json
     * Possible values : csv, json, all
     * @description
     *     This API retrieves data describing all operations required to synchronize an Office365 tenant (csv or json format). 
     *     This API returns the result of a prior SynchronizeTenantTaskStart that triggers an asynchronous processing for a given tenant. <br>
     * <br>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | status optionnel | String | Asynchronous operation status<br><br>Possible values : `pending` |
     * | data optionnel | Object | synchronization data |
     *
     */
    getResultOfStartedOffice365TenantSynchronizationTask(tenant? : string, format : string = "json") : any {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getResultOfStartedOffice365TenantSynchronizationTask(tenant, format);
                that._logger.log("debug", "(getResultOfStartedOffice365TenantSynchronizationTask) - sent.");
                that._logger.log("internal", "(getResultOfStartedOffice365TenantSynchronizationTask) - result : ", result);
                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getResultOfStartedOffice365TenantSynchronizationTask) Error.");
                that._logger.log("internalerror", LOG_ID + "(getResultOfStartedOffice365TenantSynchronizationTask) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method importCSVData
     * @since 2.12.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId
     * @param {string} label a text description of this import. Default value : none
     * @param {string} noemails disable email sending. Default value : true
     * @param {string} nostrict create of an existing user and delete of an unexisting user are not errors. Default value : false
     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided)
     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character
     * @param {any} data The body of the POST.
     * @description
     *     This API allows to manage Rainbow users or devices through a CSV UTF-8 encoded file. </br>
     *     The first line of the CSV data describes the content format. Most of the field names are the field names of the admin createUser API. </br>
     *     Caution: To avoid multiple imports of same CSV data, the reqId returned to access the import status is a hash of the CSV data. </br>
     *     If you really need to apply same CSV data again, you will have to delete its associated import report first. </br>
     * <br>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | * import summary |
     * | reqId | String | * import request identifier |
     * | mode | String | * provisioning mode<br><br>Possible values : `user`, `device` |
     * | status | String | * Current import state, should be 'Pending' |
     * | userId | String | * id of the requesting user |
     * | displayName | String | * display name of the requesting user |
     * | label | String | * description of the import |
     * | startTime | String | * the import processing start time |
     *
     */
    importCSVData(data?: any, companyId? : string, label : string = "none", noemails : boolean = true, nostrict : boolean = false, delimiter? : string, comment : string = "%") {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.importCSVData(data, companyId, label, noemails, nostrict, delimiter, comment );
                that._logger.log("debug", "(importCSVData) - sent.");
                that._logger.log("internal", "(importCSVData) - result : ", result);
                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(importCSVData) Error.");
                that._logger.log("internalerror", LOG_ID + "(importCSVData) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method startsAsynchronousGenerationOfOffice365TenantUserListSynchronization
     * @since 2.12.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} tenant Office365 tenant
     * @description
     *     This API generates data describing all operations required to synchronize an Office365 tenant (csv or json format). </br>
     * <br>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | status | String | Asynchronous operation status<br><br>Possible values : `pending` |
     *
     */
    startsAsynchronousGenerationOfOffice365TenantUserListSynchronization(tenant? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.startsAsynchronousGenerationOfOffice365TenantUserListSynchronization(tenant);
                that._logger.log("debug", "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) - sent.");
                that._logger.log("internal", "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) - result : ", result);
                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) Error.");
                that._logger.log("internalerror", LOG_ID + "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method synchronizeOffice365TenantUserList
     * @since 2.12.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} tenant Office365 tenant
     * @param {string} format Allows to retrieve more or less phone numbers details in response.
     * - json: answer follows the pattern { "data" : { ... JSON ... }}
     * - csv: answer follows the pattern { "data" : [ ... CSV ... ]}
     * - all: answer follows the pattern { "data" : { jsonContent: {...........}, csvContent: [ , , ; , , ] }}
     * Default value : json
     * Possible values : csv, json, all
     * @description
     *     This API generates a file describing all operations required to synchronize an Office365 tenant (csv or json format). </br>
     * <br>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | String | synchronization data. |
     *
     */
    synchronizeOffice365TenantUserList(tenant? : string, format  : string = "json") : any {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.synchronizeOffice365TenantUserList(tenant, format );
                that._logger.log("debug", "(synchronizeOffice365TenantUserList) - sent.");
                that._logger.log("internal", "(synchronizeOffice365TenantUserList) - result : ", result);
                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(synchronizeOffice365TenantUserList) Error.");
                that._logger.log("internalerror", LOG_ID + "(synchronizeOffice365TenantUserList) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method checkCSVDataOfSynchronizationUsingRainbowvoiceMode
     * @since 2.12.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} companyId companyId of the users in the CSV file, default to admin's companyId
     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided)
     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character. Default value : %
     * @param {any} data The body of the POST.
     * @description
     *    This API checks a CSV UTF-8 content for mass-provisioning for rainbowvoice mode. Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. </br>
     * <br>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | * check results summary |
     * | reqId | String | * check request identifier |
     * | mode | String | * request csv mode<br><br>Possible values : `rainbowvoide` |
     * | actions | Object | * actions information |
     * | upsert optionnel | Number | * number of user create/update actions |
     * | delete optionnel | Number | * number of user remove actions |
     * | columns | Number | * number of columns in the CSV |
     * | detach optionnel | Number | * number of device unpairing actions |
     * | delimiter | String | * the CSV delimiter |
     * | profiles | Object | * the managed profiles |
     * | name | String | * the managed profiles name |
     * | valid | Boolean | * the managed profiles validity |
     * | assignedBefore | Number | * the assigned number of managed profiles before this import |
     * | assignedAfter | Number | * the assigned number of managed profiles after this import has been fulfilled |
     * | max | Number | * the maximum number of managed profiles available |
     *
     */
    checkCSVDataOfSynchronizationUsingRainbowvoiceMode(data?: any, companyId? : string, delimiter? : string, comment : string = "%") {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.checkCSVDataOfSynchronizationUsingRainbowvoiceMode(data, companyId , delimiter, comment);
                that._logger.log("debug", "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) - sent.");
                that._logger.log("internal", "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) - result : ", result);
                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) Error.");
                that._logger.log("internalerror", LOG_ID + "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method updateCommandIdStatus
     * @since 2.14.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} data body of the POST. Body : {
     * status : `success` or `failure`, // status for the execution of the command
     * details : string // details that can be provided about the command execution
     * } 
     * 
     * @param {string} commandId commandId which came from connector on behalf of admin command
     * @description
     *    This API is used to update the status of the commandId. </br>
     * <br>
     * @return {Promise<any>} result.
     *
     */
    updateCommandIdStatus(data? : any, commandId? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.updateCommandIdStatus(data, commandId);
                that._logger.log("debug", "(updateCommandIdStatus) - sent.");
                that._logger.log("internal", "(updateCommandIdStatus) - result : ", result);
                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateCommandIdStatus) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateCommandIdStatus) Error : ", err);
                return reject(err);
            }
        });
    }

        /**
     * @public
     * @method synchronizeUsersAndDeviceswithCSV
     * @since 1.86.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} csvTxt the csv of the user and device to synchronize.
     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId
     * @param {string} label a text description of this import
     * @param {boolean} noemails disable email sending 
     * @param {boolean} nostrict create of an existing user and delete of an unexisting user are not errors
     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided)
     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character
     * @param {string} commandId Command identifier. When runing the manual synchro, the commandId must be added as query parameter.
     * @description
     *     This API allows to synchronize Rainbow users or devices through a CSV UTF-8 encoded file. it is a merge from user mode and device mode <br>
     *     The first line of the CSV data describes the content format. Most of the field names are the field names of the admin createUser API. <br>
     * <br>
     * Supported fields for "user" management are: <br>
     * __action__  delete, upsert, sync or detach <br>
     * loginEmail  (mandatory) <br>
     * password  (mandatory) <br>
     * title <br>
     * firstName <br>
     * lastName <br>
     * nickName <br>
     * businessPhone{n}  (n is a number starting from 0 or 1) <br>
     * mobilePhone{n}  (n is a number starting from 0 or 1) <br>
     * email{n}  (n is a number starting from 0 or 1) <br>
     * tags{n}  (n is a number starting from 0 to 4) <br>
     * jobTitle <br>
     * department <br>
     * userInfo1 <br>
     * userInfo2 <br>
     * country <br>
     * language <br>
     * timezone <br>
     * visibility <br>
     * isInitialized <br>
     * authenticationType <br>
     * service{n} <br>
     * accountType <br>
     * photoUrl <br>
     * <br>
     * Supported fields for "device" management are: <br>
     * loginEmail (mandatory) <br>
     * pbxId <br>
     * pbxShortNumber <br>
     * pbxInternalNumber <br>
     * number <br>
     * <br>
     * detach: allows to detach an PBX extension from a user. delete: allows to delete a user. upsert: allows to modify user (update or create if doesn't exists) and device (force attach if filled) with filled fields. Remark: empty fields are not taken into account. sync: allows to modify user (update or create if doesn't exists) and device (force attach if filled, detach if empty) with filled fields. <br>
     * Remark: empty fields are taken into account (if a field is empty we will try to update it with empty value). <br>
     * <br>
     * Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. Caution: for sync action: <br>
     * As empty fields are taken into account, all fields must be filled to avoid a reset of these values <br>
     * As empty fields are taken into account, it is better to avoid mixing sync __action__ with others actions <br>
     * <br>
     * @return {Promise<any>} import summary result.
     */
    synchronizeUsersAndDeviceswithCSV(csvTxt? : string, companyId? : string, label : string = undefined, noemails: boolean = true, nostrict : boolean = false, delimiter? : string, comment : string = "%", commandId? : string) : Promise<{
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
                let synchronizeRestResult = await that._rest.synchronizeUsersAndDeviceswithCSV(csvTxt, companyId , label, noemails, nostrict, delimiter, comment, commandId);                
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
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string}  companyId ompanyId of the users in the CSV file, default to admin's companyId.
     * @param {string} mode Select template to return.
     * - user: provider the user management template
     * - device: provider the device management template
     * - useranddevice: provider the user and device management template (both user and device)
     * - rainbowvoice : provider the user and subscriber/DDI/device association management template.
     * @param {string} comment Only the template comment..
     * @description
     *      This API provides a CSV template. <br>
     *      result : <br>
     *      CSV {Object[]} lines with all supported headers and some samples : <br> 
     *      __action__ {string} Action to perform values : create, update, delete, upsert, detach <br>
     *      loginEmail {string} email address - Main or professional email used as login <br>
     *      password optionnel {string} (>= 8 chars with 1 capital+1 number+1 special char) (e.g. This1Pwd!) <br>
     *      title optionnel {string} (e.g. Mr, Mrs, Dr, ...) <br>
     *      firstName optionnel {string} <br>
     *      lastName optionnel {string} <br>
     *      nickName optionnel {string} <br>
     *      businessPhone0 optionnel {string} E.164 number - DDI phone number (e.g. +33123456789) <br>
     *      mobilePhone0 optionnel {string} E.164 number - Mobile phone number (e.g. +33601234567) <br>
     *      email0 optionnel {string} email address - Personal email <br>
     *      jobTitle optionnel {string} <br>
     *      department optionnel {string} <br>
     *      country optionnel {string} ISO 3166-1 alpha-3 - (e.g. FRA) <br>
     *      language optionnel {string} ISO 639-1 (en) / with ISO 31661 alpha-2 (en-US) <br>
     *      timezone optionnel {string} IANA tz database (Europe/Paris) <br>
     *      pbxShortNumber optionnel {number} PBX extension number <br>
     *      pbxInternalNumber optionnel {string} E.164 number - Private number when different from extension number <br>
     *      selectedAppCustomisationTemplateName optionnel {string} Allow to specify an application customisation template for this user. The application customisation template has to be specified using its name (ex: "Chat and Audio", "Custom profile")     Values( Full, Phone, calls, only, Audio, only, Chat, and, Audio, Same, as, company, , profile) <br>
     *      shortNumber optionnel string subscriber {number} (only for rainbowvoice mode) <br>
     *      macAddress optionnel {string} macAddress of the associated SIP device of the subscriber (only for rainbowvoice mode) <br>
     *      ddiE164Number optionnel string E.164 {number} - E164 number of the associted DDI of the subscriber (only for rainbowvoice mode) <br>
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
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} CSVTxt CSV File content to be checked.
     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId.
     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided).
     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character.
     * @param {string} commandId if the check csv request comes from connector on behalf of admin command, it will generates a report.
     * @description
     *      This API checks a CSV UTF-8 content for mass-provisioning for useranddevice mode.<br>
     *      Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. <br>
     *      { <br>
     *           actions {Object} actions information <br>
     *               sync optionnel {number} number of user synchronization actions <br>
     *               upsert optionnel {number} number of user create/update actions <br>
     *               delete optionnel {number} number of user remove actions <br>
     *               detach optionnel {number} number of device unpairing actions <br>
     *           reqId {string} check request identifier <br>
     *           mode {string} request csv mode Possible values : user, device <br>
     *           columns {number} number of columns in the CSV <br>
     *           delimiter {string} the CSV delimiter <br>
     *           profiles {Object} the managed profiles <br>
     *              name {string} the managed profiles name <br>
     *              valid {boolean} the managed profiles validity <br>
     *              assignedBefore {number} the assigned number of managed profiles before this import <br>
     *              assignedAfter {number} the assigned number of managed profiles after this import has been fulfilled <br>
     *              max number the {maximum} number of managed profiles available <br>
     *      } <br>
     * @return {Promise<any>}
     */
    checkCSVforSynchronization(CSVTxt, companyId? : string, delimiter?  : string, comment : string  = "%", commandId? : string) : any {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let CSVResult = await that._rest.checkCSVforSynchronization(CSVTxt, companyId, delimiter, comment, commandId);
                that._logger.log("debug", "(checkCSVforSynchronization) - sent.");
                that._logger.log("internal", "(checkCSVforSynchronization) - result : ", CSVResult);

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
     * @method getCheckCSVReport
     * @since 2.5.1
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} commandId used in the check csv request whicj came from connector on behalf of admin command
     * @description
     *      This API retrieves the last checks CSV UTF-8 content for mass-provisioning for useranddevice mode, performed by an admin (using a commandId). <br>
     * @return {Promise<any>}
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | report | Object | * check results summary |
     * | status | String | * status of the check csv<br><br>Possible values : `success`, `failure`, `pending` |
     * | reqId | String | * check request identifier |
     * | mode | String | * request csv mode<br><br>Possible values : `user`, `device` |
     * | actions | Object | * actions information |
     * | sync optionnel | Number | * number of user synchronization actions |
     * | upsert optionnel | Number | * number of user create/update actions |
     * | delete optionnel | Number | * number of user remove actions |
     * | columns | Number | * number of columns in the CSV |
     * | detach optionnel | Number | * number of device unpairing actions |
     * | delimiter | String | * the CSV delimiter |
     * | profiles | Object | * the managed profiles |
     * | name | String | * the managed profiles name |
     * | valid | Boolean | * the managed profiles validity |
     * | assignedBefore | Number | * the assigned number of managed profiles before this import |
     * | assignedAfter | Number | * the assigned number of managed profiles after this import has been fulfilled |
     * | max | Number | * the maximum number of managed profiles available |
     * 
     */          
    getCheckCSVReport(commandId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let CSVResult = await that._rest.getCheckCSVReport(commandId);
                that._logger.log("debug", "(getCheckCSVReport) - sent.");
                that._logger.log("internal", "(getCheckCSVReport) - result : ", CSVResult);

                resolve (CSVResult);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getCheckCSVReport) Error.");
                that._logger.log("internalerror", LOG_ID + "(getCheckCSVReport) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @public
     * @method importRainbowVoiceUsersWithCSVdata
     * @since 2.5.1
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId
     * @param {string} label a text description of this import. default undefined.
     * @param {boolean} noemails disable email sending. default true.
     * @param {boolean} nostrict create of an existing user and delete of an unexisting user are not errors. default false.
     * @param {string} delimiter the CSV delimiter character (will be determined by analyzing the CSV file if not provided).
     * @param {string} comment the CSV comment start character, use double quotes in field values to escape this character. default "%"
     * @param {string} csvData the csv of the user and device to synchronize.
     * @description
     *      This API allows to perform provisioning for Rainbow Voice (Rainbow Users and Subscribers management + DDIs and Sip devices attachment) through a CSV UTF-8 encoded file. <br>
     *      The first line of the CSV data describes the content format. <br>
     *      Most of the field names are the field names of the admin createUser API. <br>
     *      Additional field used for Subscriber management is: shortNumber <br>
     *      Additional field used for DDI attachment is: ddiE164Number  <br>
     *      Additional field used for Sip device attachment is: macAddress <br>
     *  <br>
     *      Supported fields for "user" management are: <br>
     *      __action__    upsert, delete or detach <br>
     *      loginEmail    (mandatory) <br>
     *      password    (mandatory) <br> 
     *      title <br>
     *      firstName <br>
     *      lastName <br>
     *      nickName <br>
     *      businessPhone{n}    (n is a number starting from 0 or 1) <br>
     *      mobilePhone{n}    (n is a number starting from 0 or 1) <br>
     *      email{n}    (n is a number starting from 0 or 1) <br>
     *      tags{n}    (n is a number starting from 0 to 4) <br>
     *      jobTitle <br>
     *      department <br>
     *      userInfo1 <br>
     *      userInfo2 <br>
     *      country <br>
     *      language <br>
     *      timezone <br>
     *      visibility <br>
     *      isInitialized <br>
     *      authenticationType <br>
     *      service{n} <br>
     *      accountType <br>
     *      photoUrl <br>
     *       <br>
     *      Supported fields for "subscriber" management are: <br>
     * <br>
     *      loginEmail    (mandatory) <br>
     *      shortNumber <br>
     * <br>
     *      Supported fields for "SIP Device" management are: <br>
     * <br>
     *      loginEmail    (mandatory) <br>
     *      macAddress <br>
     * <br>
     *      Supported fields for "DDI" management are: <br>
     * <br>
     *      loginEmail    (mandatory) <br>
     *      ddiE164Number <br>
     * <br>
     *      __action__ description : <br>
     *      upsert: allows to modify user (update or create if doesn't exist). It attaches also a subscriber (if field shortNumber is filled) , attaches a Sip Device (if field macAddress is filled) and attaches a DDI (if field ddiE164Number is filled) <br>
     *      Remark: empty fields are not taken into account. <br>
     * <br>
     *      detach: allows to detach subscriber (if field shortNumber is filled) ; to detach Sip Device (if field macAddress is filled) and to detach DDI (if field ddiE164Number is filled) <br>
     *      If field shortNumber is filled; detach action is done not only on subscriber but also on Sip Device and DDI automatically (even if fields macAddress and ddiE164Number are not filled) <br>
     *    <br>
     *      delete: allows to delete a user (if user is attached to a subscriber ; this subscriber + DDI + Sip device are automatically detached) <br>
     *       <br>
     *      Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. <br>
     *   <br>
     *      Caution: To avoid multiple imports of same CSV data, the reqId returned to access the import status is a hash of the CSV data. If you really need to apply same CSV data again, you will have to delete its associated import report first. <br>
     * <br>
     *      Error codes: <br>
     *      2001 'company {companyId} has no Cloud Pbx' <br>
     *      2002 'ShortNumber {shortNumber} not in line with Cloud PBX Numbering Plan for company {companyId}' <br>
     *      2003 'ShortNumber {shortNumber} is already assigned to someone else inside this company {companyId}' <br>
     *      2004 'user {userId} is already assigned into another PBX of the company {companyId}' <br>
     *      2005 'failed to create subscriber for user {userId} with shortNumber {shortNumber} into system {systemId}' <br>
     *      2006 'failed to update subscriber number for user {userId} with this new shortNumber {shortNumber} into system {systemId}' <br>
     *      2007 'there is no existing Sip Device with this macAddress {macAddress}' <br>
     *      2008 'the existing Sip Device with this macAddress {macAddress} is not belonging to the requested company {companyId}' <br>
     *      2009 'the existing Sip Device with this macAddress {macAddress} is attached to someone else: userId={userId}' <br>
     *      2010 'another Sip Device with macAddress {macAddress} is attached to user={userId}' <br>
     *      2011 'cannot assign/unassign a Sip device to this user {userId} ; he is not yet a subscriber' <br>
     *      2012 'failed to attach this Sip Device {macAddress} with this user {userId} %s' <br>
     *      2013 'cannot assign a DDI to this user {userId} ; he is not yet a subscriber' <br>
     *      2014 'there is no existing DDI with this number {ddiE164Number}' <br>
     *      2015 'the existing DDI with this number {ddiE164Number} is attached to someone else: userId={userId}' <br>
     *      2016 'another DDI with number {ddiE164Number} is attached to user={userId}' <br>
     *      2017 'failed to attach this DDI {ddiE164Number} with this user {userId}' <br>
     *      2018 'failed to detach subscriber for user {userId}, no shortNumber is provided' <br>
     *      2019 'failed to detach this subscriber {shortNumber into the request} from this user {userId}, user is attached to another subscriber {real subscriber shortNumber}' <br>
     *      2020 'cannot detach a DDI to this user {userId} ; he is no more a subscriber' <br>
     *      2021 'failed to detach this DDI {ddiE164Number} with this user {userId}' <br>
     *      2022 'failed to detach this Sip Device {macAddress} with this user {userId}' <br>
     *      <br>
     *      
     *      Sample :
     *      <code class="  language-csv">
     *          __action__;loginEmail                   ;shortNumber;   macAddress        ; ddiE164Number    ;password     ;title;firstName  ;lastName;language;service0         ;service1
     *          upsert    ;lupin00@ejo.company.com      ;           ;                     ;                  ;Password_123 ;Mr   ;Arsene00   ;Lupin   ;fr      ;"Enterprise Demo";"Voice Enterprise 3-Year prepaid"
     *          upsert    ;lupin01@ejo.company.com      ; 81011     ;                     ;                  ;Password_123 ;Mr   ;Arsene01   ;Lupin   ;fr      ;"Enterprise Demo";"Voice Enterprise 3-Year prepaid"
     *          upsert    ;lupin02@ejo.company.com      ; 81012     ;   aa:bb:cc:dd:ee:02 ;                  ;Password_123 ;Mr   ;Arsene02   ;Lupin   ;fr      ;"Enterprise Demo";"Voice Enterprise 3-Year prepaid"
     *          delete    ;lupin13@ejo.company.com      ; 81023     ;   aa:bb:cc:dd:ee:13 ; 33298300513      ;Password_123 ;Mr   ;Arsene13   ;Lupin   ;fr      ;"Enterprise Demo";"Voice Enterprise 3-Year prepaid"
     *          delete    ;lupin14@ejo.company.com      ;           ;                     ;                  ;             ;     ;           ;        ;        ;                 ;</code>
     *          
     *      return an {Object}  . <br>
     * @return {Promise<any>}
     */
    importRainbowVoiceUsersWithCSVdata(companyId : string, label : string = null, noemails: boolean = true, nostrict : boolean = false, delimiter : string = null, comment : string = "%", csvData : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.importRainbowVoiceUsersWithCSVdata(companyId, label, noemails, nostrict, delimiter, comment, csvData);
                that._logger.log("debug", "(importRainbowVoiceUsersWithCSVdata) - sent.");
                that._logger.log("internal", "(importRainbowVoiceUsersWithCSVdata) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(importRainbowVoiceUsersWithCSVdata) Error.");
                that._logger.log("internalerror", LOG_ID + "(importRainbowVoiceUsersWithCSVdata) Error : ", err);
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
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} companyId ompanyId of the users in the CSV file, default to admin's companyId.
     * @param {string} format the CSV delimiter character (will be determined by analyzing the CSV file if not provided).
     * @param {boolean} ldap_id the CSV comment start character, use double quotes in field values to escape this character.
     * @description
     *      This API generates a file describing all users (csv or json format). <br>
     *      return an {Object}  of synchronization data. <br>
     * @return {Promise<any>}
     */
    retrieveRainbowUserList(companyId? : string, format : string = "csv", ldap_id : boolean = true) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveRainbowUserList(companyId, format, ldap_id);
                that._logger.log("debug", "(retrieveRainbowUserList) - sent.");
                that._logger.log("internal", "(retrieveRainbowUserList) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveRainbowUserList) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveRainbowUserList) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method checkCSVdataForSynchronizeDirectory
     * @since 2.15.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @description
     *      This API checks a CSV UTF-8 content for mass-provisioning for directory mode.</br>
     *      All the entries defined in the CSV data are relative to the same company directory. <br>
     *      In case a query parameter commandId is added, the following event is sent to the initiator of the command: "rainbow_onconnectorcommandended"<br>
     *          <br>
     *      The first line of the CSV file describes the content format. Most of the field names are the same than the field names of the company directory API - Create a directory entry.<br>
     *      Supported fields are:<br>
     *      __action__ : delete, upsert or sync<br>
     *      ldap_id : (mandatory)<br>
     *      *<br>
     *      firstName<br>
     *      lastName<br>
     *      companyName<br>
     *      workPhoneNumber{n} : (n is a number starting from 0 or 9)<br>
     *      mobilePhoneNumber{n} : (n is a number starting from 0 or 9)<br>
     *      otherPhoneNumber{n} : (n is a number starting from 0 or 9)<br>
     *      tag{n} : (n is a number starting from 0 to 4)<br>
     *      department<br>
     *      street<br>
     *      city<br>
     *      postalCode<br>
     *      state<br>
     *      country<br>
     *      jobTitle<br>
     *      eMail<br>
     *      custom1<br>
     *      custom2<br>
     *      <br>
     *      delete: allows to delete an entry. upsert: allows to modify an entry (update or create if doesn't exists) with filled fields.<br> 
     *      Remark: empty fields are not taken into account. sync: allows to modify an entry (update or create if doesn't exists) with filled fields.<br> 
     *      Remark: empty fields are taken into account (if a field is empty we will try to update it with empty value).<br>
     *      <br>
     *      return an {Object}  of synchronization data. <br>
     * @return {Promise<any>}
     * @param {string} delimiter CSV delimiter character (will be determined by analyzing the CSV file if not provided)
     * @param {string} comment CSV comment start character. Default value : %
     * @param {string} commandId commandId if the check csv request comes from connector on behalf of admin command, ity will generates a report
     * @param {string} csvData string with the body of the CSV data.
     */
    checkCSVdataForSynchronizeDirectory (delimiter : string = "%", comment : string, commandId : string, csvData: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!csvData) {
                    that._logger.log("warn", LOG_ID + "(checkCSVdataForSynchronizeDirectory) bad or empty 'csvData' parameter");
                    that._logger.log("internalerror", LOG_ID + "(checkCSVdataForSynchronizeDirectory) bad or empty 'csvData' parameter : ", csvData);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                let result = await that._rest.checkCSVdataForSynchronizeDirectory(delimiter, comment, commandId, csvData);
                that._logger.log("debug", "(checkCSVdataForSynchronizeDirectory) - sent.");
                that._logger.log("internal", "(checkCSVdataForSynchronizeDirectory) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(checkCSVdataForSynchronizeDirectory) Error.");
                that._logger.log("internalerror", LOG_ID + "(checkCSVdataForSynchronizeDirectory) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @public
     * @method importCSVdataForSynchronizeDirectory
     * @since 2.15.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @description
     *      This API allows to import the entries of a company directory with CSV UTF-8 encoded data. <br>
     *      All the entries defined in the CSV data are relative to the same company directory. <br>
     *      In case a query parameter commandId is added, the following event is sent to the initiator of the command: "rainbow_onconnectorcommandended"<br>
     *          <br>
     *      The first line of the CSV file describes the content format. Most of the field names are the same than the field names of the company directory API - Create a directory entry.<br>
     *      Supported fields are:<br>
     *      __action__ : delete, upsert or sync<br>
     *      ldap_id : (mandatory)<br>
     *      *<br>
     *      firstName<br>
     *      lastName<br>
     *      companyName<br>
     *      workPhoneNumber{n} : (n is a number starting from 0 or 9)<br>
     *      mobilePhoneNumber{n} : (n is a number starting from 0 or 9)<br>
     *      otherPhoneNumber{n} : (n is a number starting from 0 or 9)<br>
     *      tag{n} : (n is a number starting from 0 to 4)<br>
     *      department<br>
     *      street<br>
     *      city<br>
     *      postalCode<br>
     *      state<br>
     *      country<br>
     *      jobTitle<br>
     *      eMail<br>
     *      custom1<br>
     *      custom2<br>
     *      <br>
     *      delete: allows to delete an entry. upsert: allows to modify an entry (update or create if doesn't exists) with filled fields.<br>
     *      Remark: empty fields are not taken into account. sync: allows to modify an entry (update or create if doesn't exists) with filled fields.<br>
     *      Remark: empty fields are taken into account (if a field is empty we will try to update it with empty value).<br>
     *      <br>
     *      return an {Object}  of synchronization data. <br>
     * @return {Promise<any>}
     * @param {string} delimiter CSV delimiter character (will be determined by analyzing the CSV file if not provided)
     * @param {string} comment CSV comment start character. Default value : %
     * @param {string} commandId commandId if the check csv request comes from connector on behalf of admin command, ity will generates a report
     * @param {string} label A text description of this import. Default value : none
     * @param {string} csvData string with the body of the CSV data.
     */
    importCSVdataForSynchronizeDirectory(delimiter : string = "%", comment : string, commandId : string, label : string = "none", csvData: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!csvData) {
                    that._logger.log("warn", LOG_ID + "(importCSVdataForSynchronizeDirectory) bad or empty 'csvData' parameter");
                    that._logger.log("internalerror", LOG_ID + "(importCSVdataForSynchronizeDirectory) bad or empty 'csvData' parameter : ", csvData);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                let result = await that._rest.importCSVdataForSynchronizeDirectory(delimiter, comment, commandId, label, csvData);
                that._logger.log("debug", "(importCSVdataForSynchronizeDirectory) - sent.");
                that._logger.log("internal", "(importCSVdataForSynchronizeDirectory) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(importCSVdataForSynchronizeDirectory) Error.");
                that._logger.log("internalerror", LOG_ID + "(importCSVdataForSynchronizeDirectory) Error : ", err);
                return reject(err);
            }
        });
    }
       
    /**
     * @public
     * @method getCSVReportByCommandId
     * @since 2.15.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @description
     *      This API retrieves the last import CSV UTF-8 content for mass-provisioning for directory mode, performed by an admin (using a commandId). <br>
     *           <br>
     *      return { <br> 
     *           status : string, // status of the check csv. Possible values : success, failure, pending  <br>
     *          report : Object,  // check results summary <br>
     *              companyId : string, // Id of the company of the directory <br>
     *              userId : string, Id of the requesting user <br>
     *              displayName : string Display name of the requesting user <br>
     *              label : string Description of the import <br>
     *              csvHeaders : string CSV header line (Fields names) <br>
     *              startTime : string Import processing start time <br>
     *              created : number Count of created entries <br>
     *              updated : number Count of updated entries <br>
     *              deleted : number Count of deleted entries <br>
     *              failed : 	Integer Count of failed entries <br>
     *        } <br>
     *                          
     *      return an {Object}  of synchronization data. <br>
     * @return {Promise<any>}
     * @param {string} commandId commandId used in the import csv request which came from connector on behalf of admin command.
     */
    getCSVReportByCommandId(commandId : string ) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!commandId) {
                    that._logger.log("warn", LOG_ID + "(getCSVReportByCommandId) bad or empty 'commandId' parameter");
                    that._logger.log("internalerror", LOG_ID + "(getCSVReportByCommandId) bad or empty 'commandId' parameter : ", commandId);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                let result = await that._rest.getCSVReportByCommandId(commandId);
                that._logger.log("debug", "(getCSVReportByCommandId) - sent.");
                that._logger.log("internal", "(getCSVReportByCommandId) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getCSVReportByCommandId) Error.");
                that._logger.log("internalerror", LOG_ID + "(getCSVReportByCommandId) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @public
     * @method createCSVReportByCommandId
     * @since 2.15.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @description
     *      This API allows to create a report for a commandId in case no other API is called (no action to be performed, error, ...). <br>
     *           <br>
     *      return { <br> 
     *           status : string, // status of the check csv. Possible values : success, failure, pending  <br>
     *          report : Object,  // check results summary <br>
     *              details : string details for for report <br>
     *        } <br>
     *
     *      return an {Object}  of synchronization data. <br>
     * @return {Promise<any>}
     * @param {string} commandId commandId used in the import csv request which came from connector on behalf of admin command.
     * @param {Object} data The body of the request : {
     *     status : string, // status for the execution of the command Possible values : success, failure
     *     details : string, // details that can be provided about the command execution
     * }
     */
    createCSVReportByCommandId(commandId : string, data : any) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!commandId) {
                    that._logger.log("warn", LOG_ID + "(createCSVReportByCommandId) bad or empty 'commandId' parameter");
                    that._logger.log("internalerror", LOG_ID + "(createCSVReportByCommandId) bad or empty 'commandId' parameter : ", commandId);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                let result = await that._rest.createCSVReportByCommandId(commandId, data);
                that._logger.log("debug", "(createCSVReportByCommandId) - sent.");
                that._logger.log("internal", "(createCSVReportByCommandId) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(createCSVReportByCommandId) Error.");
                that._logger.log("internalerror", LOG_ID + "(createCSVReportByCommandId) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @public
     * @method retrieveRainbowEntriesList
     * @since 2.15.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @description
     *      This API generates a file describing all companies entries (csv or json format). <br>
     *           <br>
     *
     *      return an {Object}  of result data. <br>
     * @return {Promise<any>}
     * @param {string} companyId companyId from which to retrieve entries, default to admin's companyId
     * @param {string} format Allows to retrieve more or less phone numbers details in response. Default value : json. Possible values : csv, json, all
     * @param {boolean} ldap_id Allows to filter entries containing a ldap_id. </br>
     * - json: answer follows the pattern { "data" : { ... JSON ... }} </br>
     * - csv: answer follows the pattern { "data" : [ ... CSV ... ]} </br>
     * - all: answer follows the pattern { "data" : { jsonContent: {...........}, csvContent: [ , , ; , , ] }} </br>
     * </br>
     *  Default value : true </br>
     */
    retrieveRainbowEntriesList(companyId? : string, format : string = "json", ldap_id : boolean = true) : any {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveRainbowEntriesList(companyId, format, ldap_id);
                that._logger.log("debug", "(retrieveRainbowEntriesList) - sent.");
                that._logger.log("internal", "(retrieveRainbowEntriesList) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveRainbowEntriesList) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveRainbowEntriesList) Error : ", err);
                return reject(err);
            }
        });
    }
    
    //endregion AD/LDAP Massprovisioning
    
    //region LDAP APIs to use

    /**
     * @public
     * @method ActivateALdapConnectorUser
     * @since 1.86.0
     * @instance
     * @async
     * @category AD/LDAP - LDAP APIs to use
     * @description
     *      This API allows to activate a Ldap connector. <br>
     *      A "Ldap user" is created and registered to the XMPP services. The Ldap user credentials (loginEmail and password) are generated randomly and returned in the response. <br>
     * <br>
     *      Note 1 A brute force defense is activated when too much activation have been requested. As a result, an error 429 "Too Many Requests" will be returned during an increasing period to dissuade a slow brute force attack. <br>
     *      Note 2 Ldap's company should have an active subscription to to activate Ldap. If subscription linked to Ldap is not active or it has no more remaining licenses, error 403 is thrown <br>
     *      Note 3 Ldap's company should have an SSO authentication Type, and it must be the default authentication Type for users. If company doesn't have an SSO or have one but not a default one, error 403 is thrown <br>
     *       <br>
     * @return {Promise<{ id : string, companyId : string, loginEmail : string, password : string}>} - 
     * <br>
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | string | Ldap connector unique identifier. |
     * | companyId | string | Company linked to the Ldap connector. |
     * | loginEmail | string | Generated Ldap connector user login ("throwaway" email address, never used by rainbow to send email). |
     * | password | string | Generated Ldap connector user password. |
     * 
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
     * @method deleteLdapConnector
     * @since 1.86.0
     * @instance
     * @async
     * @category AD/LDAP - LDAP APIs to use
     * @param {string} ldapId the Id of the ldap connector to delete.
     * @description
     *      This API is to delete the connector <br>
     *     **BP Admin** and **BP Finance** users can only delete users being in a company linked to their BP company.<br>
     *     **Admin** users can only delete users being in their own company. (superadmin, organization\_admin, company\_admin)
     *      return { <br>
     *          status {string} Delete operation status message. <br>
     *          } <br>
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
     * @method retrieveAllLdapConnectorUsersData
     * @since 1.86.0
     * @instance
     * @async
     * @category AD/LDAP - LDAP APIs to use
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
     *     This API allows administrators to retrieve all the ldap connectors. <br>
     *     Users with superadmin, support role can retrieve the connectors from any company. <br>
     *     Users with bp_admin or bp_finance role can only retrieve the connectors in companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br>
     *     Users with admin role can only retrieve the connectors in companies they can manage. That is to say: <br>
     *     an organization_admin can retrieve the connectors only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br>
     *     a company_admin can only retrieve the connectors in his company. <br>
     *     This API can return more or less connector information using format option in query string arguments (default is small). <br>
     * <br>
     *      return { // List of connector Objects. <br>
     *          id string TV unique identifier. <br>
     *          name string TV name. <br>
     *          location optionnel string Location of the TV. <br>
     *          locationDetail optionnel string More detail on the location of the TV. <br>
     *          room optionnel string Name of the room where the TV is located. <br>
     *          companyId string company linked to the TV. <br>
     *          activationCode string Activation code (6 digits). The activationCode may be null in the case its generation in multi-environment database failed. In that case, a security mechanism takes place to generate this activation code asynchronously (try every minutes until the code creation is successful). As soon as the activation code is successfully generated in multi-environment database, the TV is updated accordingly (activationCode set to the generated code value) and with activationCodeGenerationStatus updated to done. <br>
     *          codeUpdateDate date Date of last activation code update. <br>
     *          status string TV status:    unassociated (no TV user).    associated with a TV user (the TV has been activated). <br>
     *          statusUpdatedDate Date-Time Date of last tv status update. <br>
     *          subscriptionId string Subscription to use when activating TV. <br>
     *          loginEmail string User email address (used for login) <br>
     *          firstName string User first name <br>
     *          lastName string User last name <br>
     *          displayName string User display name (firstName + lastName concatenated on server side) <br>
     *          nickName optionnel string User nickName <br>
     *          title optionnel string User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...) <br>
     *          jobTitle optionnel string User job title <br>
     *          department optionnel string User department <br>
     *          tags optionnel string[] An Array of free tags associated to the user. A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. tags can only be set by users who have administrator rights on the user. The user can't modify the tags. The tags are visible by the user and all users belonging to his organisation/company, and can be used with the search API to search the user based on his tags. <br>
     *          emails Object[] Array of user emails addresses objects <br>
     *             email string User email address <br>
     *             type string Email type, one of home, work, other <br>
     *          phoneNumbers Object[] Array of user phone numbers objects. Phone number objects can:   be created by user (information filled by user), come from association with a system (pbx) device (association is done by admin). <br>
     *              phoneNumberId string Phone number unique id in phone-numbers directory collection. <br>
     *              number optionnel string User phone number (as entered by user) <br>
     *              numberE164 optionnel string User E.164 phone number, computed by server from number and country fields <br>
     *              country 	string Phone number country (ISO 3166-1 alpha3 format) country field is automatically computed using the following algorithm when creating/updating a phoneNumber entry: If number is provided and is in E164 format, country is computed from E164 number Else if country field is provided in the phoneNumber entry, this one is used Else user country field is used   isFromSystem boolean boolean indicating if phone is linked to a system (pbx). <br>
     *              shortNumber optionnel 	string [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), short phone number (corresponds to the number monitored by PCG). Only usable within the same PBX. Only PCG can set this field. <br>
     *              internalNumber optionnel 	string [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), internal phone number. Usable within a PBX group. Admins and users can modify this internalNumber field. <br>
     *              systemId optionnel 	string [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), unique identifier of that system in Rainbow database. <br>
     *              pbxId optionnel 	string [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), unique identifier of that pbx. <br>
     *              type 	string Phone number type, one of home, work, other. <br>
     *              deviceType 	string Phone number device type, one of landline, mobile, fax, other. <br>
     *              isVisibleByOthers 	boolean Allow user to choose if the phone number is visible by other users or not. Note that administrators can see all the phone numbers, even if isVisibleByOthers is set to false. Note that phone numbers linked to a system (isFromSystem=true) are always visible, isVisibleByOthers can't be set to false for these numbers. <br>
     *         country 	string User country (ISO 3166-1 alpha3 format) <br>
     *         state optionnel 	string When country is 'USA' or 'CAN', a state can be defined. Else it is not managed (null). <br>
     *         language optionnel 	string User language (ISO 639-1 code format, with possibility of regional variation. Ex: both 'en' and 'en-US' are supported) <br>
     *         timezone optionnel 	string User timezone name <br>
     *         jid_im 	string User Jabber IM identifier <br>
     *         jid_tel 	string User Jabber TEL identifier <br>
     *         jid_password 	string User Jabber IM and TEL password <br>
     *         roles 	string[] List of user roles (Array of string) Note: company_support role is only used for support redirection. If a user writes a #support ticket and have the role company_support, the ticket will be sent to ALE's support (otherwise the ticket is sent to user's company's supportEmail address is set, ALE otherwise). <br>
     *         adminType 	string In case of user's is 'admin', define the subtype (organisation_admin, company_admin, site_admin (default undefined) <br>
     *         organisationId 	string In addition to User companyId, optional identifier to indicate the user belongs also to an organization <br>
     *         siteId 	string In addition to User companyId, optional identifier to indicate the user belongs also to a site <br>
     *         companyName 	string User company name <br>
     *         visibility 	string User visibility Define if the user can be searched by users being in other company and if the user can search users being in other companies. Visibility can be: <br>
     *         same_than_company: The same visibility than the user's company's is applied to the user. When this user visibility is used, if the visibility of the company is changed the user's visibility will use this company new visibility. <br>
     *         public: User can be searched by external users / can search external users. User can invite external users / can be invited by external users <br>
     *         private: User can't be searched by external users / can search external users. User can invite external users / can be invited by external users <br>
     *         closed: User can't be searched by external users / can't search external users. User can invite external users / can be invited by external users <br>
     *         isolated: User can't be searched by external users / can't search external users. User can't invite external users / can't be invited by external users <br>
     *         none: Default value reserved for guest. User can't be searched by any users (even within the same company) / can search external users. User can invite external users / can be invited by external users <br>
     *         External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company. Values(same_than_company, public, private, closed, isolated, none) <br>
     *         isActive 	boolean Is user active  <br>
     *         isInitialized 	boolean Is user initialized <br>
     *         initializationDate 	Date-Time User initialization date <br>
     *         activationDate 	Date-Time User activation date <br>
     *         creationDate 	Date-Time User creation date <br>
     *         lastUpdateDate 	Date-Time Date of last user update (whatever the field updated) <br>
     *         lastAvatarUpdateDate 	Date-Time Date of last user avatar create/update, null if no avatar <br>
     *         createdBySelfRegister 	boolean true if user has been created using self register <br>
     *         createdByAdmin optionnel 	Object If user has been created by an admin or superadmin, contain userId and loginEmail of the admin who created this user <br>
     *         userId 	string userId of the admin who created this user <br>
     *         loginEmail 	string loginEmail of the admin who created this user <br>
     *         invitedBy optionnel 	Object If user has been created from an email invitation sent by another rainbow user, contain the date the invitation was sent and userId and loginEmail of the user who invited this user <br>
     *         userId 	string userId of the user who invited this user <br>
     *         loginEmail 	string loginEmail of the user who invited this user <br>
     *         authenticationType optionnel 	string User authentication type (if not set company default authentication will be used) Values (DEFAULT, RAINBOW, SAML, OIDC) <br>
     *         authenticationExternalUid optionnel 	string User external authentication ID (return by identity provider in case of SAML or OIDC authenticationType) <br>
     *         firstLoginDate 	Date-Time Date of first user login (only set the first time user logs in, null if user never logged in) <br>
     *         lastLoginDate 	Date-Time Date of last user login (defined even if user is logged out) <br>
     *         loggedSince 	Date-Time Date of last user login (null if user is logged out) <br>
     *         isTerminated 	boolean Indicates if the Rainbow account of this user has been deleted <br>
     *         guestMode 	boolean Indicated a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration. <br>
     *         timeToLive optionnel 	Number Duration in second to wait before automatically starting a user deletion from the creation date. Once the timeToLive has been reached, the user won't be usable to use APIs anymore (error 401523). His account may then be deleted from the database at any moment. Value -1 means timeToLive is disable (i.e. user account will not expire). <br>
     *         userInfo1 optionnel 	string Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br>
     *         userInfo2 optionnel 	string 2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) <br>
     *         useScreenSharingCustomisation 	string Activate/Deactivate the capability for a user to share a screen. Define if a user has the right to share his screen. <br>
     *         useScreenSharingCustomisation can be: <br>
     *            same_than_company: The same useScreenSharingCustomisation setting than the user's company's is applied to the user. if the useScreenSharingCustomisation of the company is changed the user's useScreenSharingCustomisation will use this company new setting. <br>
     *            enabled: Each user of the company can share his screen. <br>
     *            disabled: No user of the company can share his screen. <br>
     *         customData optionnel 	Object User's custom data. Object with free keys/values. It is up to the client to manage the user's customData (new customData provided overwrite the existing one). Restrictions on customData Object: max 20 keys, max key length: 64 characters, max value length: 4096 characters. <br>
     *         activationCodeGenerationStatus 	string Status the activation code generation done if the activation code generation is successful <br>
     *         in_progress if the activation code generation failed and the security mechanism is ongoing to try to generate it again every minute Possible values : done, in_progress <br>
     *         fileSharingCustomisation 	string Activate/Deactivate file sharing capability per user Define if the user can use the file sharing service then, allowed to download and share file. <br>
     *         FileSharingCustomisation can be: <br>
     *            same_than_company: The same fileSharingCustomisation setting than the user's company's is applied to the user. if the fileSharingCustomisation of the company is changed the user's fileSharingCustomisation will use this company new setting. <br>
     *            enabled: Whatever the fileSharingCustomisation of the company setting, the user can use the file sharing service. <br>
     *            disabled: Whatever the fileSharingCustomisation of the company setting, the user can't use the file sharing service. <br>
     *         userTitleNameCustomisation 	string Activate/Deactivate the capability for a user to modify his profile (title, firstName, lastName) Define if the user can change some profile data. <br>
     *         userTitleNameCustomisation can be: <br>
     *            same_than_company: The same userTitleNameCustomisation setting than the user's company's is applied to the user. if the userTitleNameCustomisation of the company is changed the user's userTitleNameCustomisation will use this company new setting. <br>
     *            enabled: Whatever the userTitleNameCustomisation of the company setting, the user can change some profile data. <br>
     *            disabled: Whatever the userTitleNameCustomisation of the company setting, the user can't change some profile data. <br>
     *         softphoneOnlyCustomisation 	string Activate/Deactivate the capability for an UCaas application not to offer all Rainbow services but to focus to telephony services Define if UCaas apps used by a user of this company must provide Softphone functions, i.e. no chat, no bubbles, no meetings, no channels, and so on. <br>
     *         softphoneOnlyCustomisation can be: <br>
     *            same_than_company: The same softphoneOnlyCustomisation setting than the user's company's is applied to the user. if the softphoneOnlyCustomisation of the company is changed the user's softphoneOnlyCustomisation will use this company new setting. <br>
     *            enabled: The user switch to a softphone mode only. <br>
     *            disabled: The user can use telephony services, chat, bubbles, channels meeting services and so on. <br>
     *         useRoomCustomisation 	string Activate/Deactivate the capability for a user to use bubbles. Define if a user can create bubbles or participate in bubbles (chat and web conference). <br>
     *         useRoomCustomisation can be: <br>
     *            same_than_company: The same useRoomCustomisation setting than the user's company's is applied to the user. if the useRoomCustomisation of the company is changed the user's useRoomCustomisation will use this company new setting. <br>
     *            enabled: The user can use bubbles. <br>
     *            disabled: The user can't use bubbles. <br>
     *         phoneMeetingCustomisation 	string Activate/Deactivate the capability for a user to use phone meetings (PSTN conference). Define if a user has the right to join phone meetings. <br>
     *         phoneMeetingCustomisation can be: <br>
     *            same_than_company: The same phoneMeetingCustomisation setting than the user's company's is applied to the user. if the phoneMeetingCustomisation of the company is changed the user's phoneMeetingCustomisation will use this company new setting. <br>
     *            enabled: The user can join phone meetings. <br>
     *            disabled: The user can't join phone meetings. <br>
     *         useChannelCustomisation 	string Activate/Deactivate the capability for a user to use a channel. Define if a user has the right to create channels or be a member of channels. <br>
     *         useChannelCustomisation can be: <br>
     *            same_than_company: The same useChannelCustomisation setting than the user's company's is applied to the user. if the useChannelCustomisation of the company is changed the user's useChannelCustomisation will use this company new setting. <br>
     *            enabled: The user can use some channels. <br>
     *            disabled: The user can't use some channel. <br>
     *         useWebRTCVideoCustomisation 	string Activate/Deactivate the capability for a user to switch to a Web RTC video conversation. Define if a user has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call). <br>
     *         useWebRTCVideoCustomisation can be: <br>
     *            same_than_company: The same useWebRTCVideoCustomisation setting than the user's company's is applied to the user. if the useWebRTCVideoCustomisation of the company is changed the user's useWebRTCVideoCustomisation will use this company new setting. <br>
     *            enabled: The user can switch to a Web RTC video conversation. <br>
     *            disabled: The user can't switch to a Web RTC video conversation. <br>
     *         useWebRTCAudioCustomisation 	string Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation. Define if a user has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call). <br>
     *         useWebRTCAudioCustomisation can be: <br>
     *            same_than_company: The same useWebRTCAudioCustomisation setting than the user's company's is applied to the user. if the useWebRTCAudioCustomisation of the company is changed the user's useWebRTCAudioCustomisation will use this company new setting. <br>
     *            enabled: The user can switch to a Web RTC audio conversation. <br>
     *            disabled: The user can't switch to a Web RTC audio conversation. <br>
     *         instantMessagesCustomisation 	string Activate/Deactivate the capability for a user to use instant messages. Define if a user has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications. <br>
     *         instantMessagesCustomisation can be: <br>
     *            same_than_company: The same instantMessagesCustomisation setting than the user's company's is applied to the user. if the instantMessagesCustomisation of the company is changed the user's instantMessagesCustomisation will use this company new setting. <br>
     *            enabled: The user can use instant messages. <br>
     *            disabled: The user can't use instant messages. <br>
     *         userProfileCustomisation 	string Activate/Deactivate the capability for a user to modify his profile. Define if a user has the right to modify the globality of his profile and not only (title, firstName, lastName). <br>
     *         userProfileCustomisation can be: <br>
     *            same_than_company: The same userProfileCustomisation setting than the user's company's is applied to the user. if the userProfileCustomisation of the company is changed the user's userProfileCustomisation will use this company new setting. <br>
     *            enabled: The user can modify his profile. <br>
     *            disabled: The user can't modify his profile. <br>
     *         fileStorageCustomisation 	string Activate/Deactivate the capability for a user to access to Rainbow file storage.. Define if a user has the right to upload/download/copy or share documents. <br>
     *         fileStorageCustomisation can be: <br>
     *            same_than_company: The same fileStorageCustomisation setting than the user's company's is applied to the user. if the fileStorageCustomisation of the company is changed the user's fileStorageCustomisation will use this company new setting. <br>
     *            enabled: The user can manage and share files. <br>
     *            disabled: The user can't manage and share files. <br>
     *         overridePresenceCustomisation 	string Activate/Deactivate the capability for a user to use instant messages. Define if a user has the right to change his presence manually or only use automatic states. <br>
     *         overridePresenceCustomisation can be: <br>
     *            same_than_company: The same overridePresenceCustomisation setting than the user's company's is applied to the user. if the overridePresenceCustomisation of the company is changed the user's overridePresenceCustomisation will use this company new setting. <br>
     *            enabled: The user can change his presence. <br>
     *            disabled: The user can't change his presence. <br>
     *         changeTelephonyCustomisation 	string Activate/Deactivate the ability for a user to modify telephony settings. Define if a user has the right to modify some telephony settigs like forward activation... <br>
     *         changeTelephonyCustomisation can be: <br>
     *            same_than_company: The same changeTelephonyCustomisation setting than the user's company's is applied to the user. if the changeTelephonyCustomisation of the company is changed the user's changeTelephonyCustomisation will use this company new setting. <br>
     *            enabled: The user can modify telephony settings. <br>
     *            disabled: The user can't modify telephony settings. <br>
     *         changeSettingsCustomisation 	string Activate/Deactivate the ability for a user to change all client general settings. <br>
     *         changeSettingsCustomisation can be: <br>
     *            same_than_company: The same changeSettingsCustomisation setting than the user's company's is applied to the user. if the changeSettingsCustomisation of the company is changed the user's changeSettingsCustomisation will use this company new setting. <br>
     *            enabled: The user can change all client general settings. <br>
     *            disabled: The user can't change any client general setting. <br>
     *         recordingConversationCustomisation 	string Activate/Deactivate the capability for a user to record a conversation. Define if a user has the right to record a conversation (for P2P and multi-party calls). <br>
     *         recordingConversationCustomisation can be: <br>
     *            same_than_company: The same recordingConversationCustomisation setting than the user's company's is applied to the user. if the recordingConversationCustomisation of the company is changed the user's recordingConversationCustomisation will use this company new setting. <br>
     *            enabled: The user can record a peer to peer or a multi-party call. <br>
     *            disabled: The user can't record a peer to peer or a multi-party call. <br>
     *         useGifCustomisation 	string Activate/Deactivate the ability for a user to Use GIFs in conversations. Define if a user has the is allowed to send animated GIFs in conversations <br>
     *         useGifCustomisation can be: <br>
     *            same_than_company: The same useGifCustomisation setting than the user's company's is applied to the user. if the useGifCustomisation of the company is changed the user's useGifCustomisation will use this company new setting. <br>
     *            enabled: The user can send animated GIFs in conversations. <br>
     *            disabled: The user can't send animated GIFs in conversations. <br>
     *         fileCopyCustomisation 	string Activate/Deactivate the capability for one user to copy any file he receives in his personal cloud space <br>
     *         fileCopyCustomisation can be: <br>
     *            same_than_company: The same fileCopyCustomisation setting than the user's company's is applied to the user. if the fileCopyCustomisation of the company is changed the user's fileCopyCustomisation will use this company new setting. <br>
     *            enabled: The user can make a copy of a file to his personal cloud space. <br>
     *            disabled: The user can't make a copy of a file to his personal cloud space. <br>
     *         fileTransferCustomisation 	string Activate/Deactivate the capability for a user to copy a file from a conversation then share it inside another conversation. The file cannot be re-shared. <br>
     *         fileTransferCustomisation can be: <br>
     *            same_than_company: The same fileTransferCustomisation setting than the user's company's is applied to the user. if the fileTransferCustomisation of the company is changed the user's fileTransferCustomisation will use this company new setting. <br>
     *            enabled: The user can transfer a file doesn't belong to him. <br>
     *            disabled: The user can't transfer a file doesn't belong to him. <br>
     *         forbidFileOwnerChangeCustomisation 	string Activate/Deactivate the capability for a user to loose the ownership on one file.. One user can drop the ownership to another Rainbow user of the same company. <br>
     *         forbidFileOwnerChangeCustomisation can be: <br>
     *            same_than_company: The same forbidFileOwnerChangeCustomisation setting than the user's company's is applied to the user. if the forbidFileOwnerChangeCustomisation of the company is changed the user's forbidFileOwnerChangeCustomisation will use this company new setting. <br>
     *            enabled: The user can't give the ownership of his file. <br>
     *            disabled: The user can give the ownership of his file. <br>
     *         useDialOutCustomisation 	string Activate/Deactivate the capability for a user to use dial out in phone meetings. Define if a user is allowed to be called by the Rainbow conference bridge. <br>
     *         useDialOutCustomisation can be: <br>
     *            same_than_company: The same useDialOutCustomisation setting than the user's company's is applied to the user. if the useDialOutCustomisation of the company is changed the user's useDialOutCustomisation will use this company new setting. <br>
     *            enabled: The user can be called by the Rainbow conference bridge. <br>
     *            disabled: The user can't be called by the Rainbow conference bridge. <br>
     *         selectedAppCustomisationTemplate 	string To log the last template applied to the user. <br>
     *      } <br>
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
     * @method sendCommandToLdapConnectorUser
     * @since 2.11.0
     * @instance
     * @async
     * @category AD/LDAP - LDAP APIs to use
     * @param {string} ldapId ldap connector unique identifier.
     * @param {string} command Allows to specify a command to be performed by the ldap connector. Allowed commands are: "manual_synchro", "manual_dry_run", "manual_synchro_directories", "manual_dry_run_directories".
     * @description
     *      This API can be used to send a command to a ldap connector user. <br>
     *      BP Admin and BP Finance users can only control users being in a company linked to their BP company. <br>
     *      Admin users can only control users being in their own company. (superadmin, organization_admin, company_admin). <br>
     *
     * @return {Promise<{Object}>} return -
     * <br>
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | response Object. |
     * | status | String | Command operation status message. |
     * | commandId optionnel | String | Command identifier to retrieve the report (only for "manual\_dry\_run" command). |
     *
     */
    sendCommandToLdapConnectorUser(ldapId : string, command : string) : Promise<any> {
        let that = this;

        return new Promise(async (resolve, reject) => {
            if (!ldapId) {
                this._logger.log("warn", LOG_ID + "(sendCommandToLdapConnectorUser) bad or empty 'ldapId' parameter");
                this._logger.log("internalerror", LOG_ID + "(sendCommandToLdapConnectorUser) bad or empty 'ldapId' parameter : ", ldapId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (!command) {
                this._logger.log("warn", LOG_ID + "(sendCommandToLdapConnectorUser) bad or empty 'command' parameter");
                this._logger.log("internalerror", LOG_ID + "(sendCommandToLdapConnectorUser) bad or empty 'command' parameter : ", command);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            try {
                let result = await that._rest.sendCommandToLdapConnectorUser (ldapId, command);
                that._logger.log("debug", "(sendCommandToLdapConnectorUser) - sent.");
                that._logger.log("internal", "(sendCommandToLdapConnectorUser) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(sendCommandToLdapConnectorUser) Error.");
                that._logger.log("internalerror", LOG_ID + "(sendCommandToLdapConnectorUser) Error : ", err);
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
     * @category AD/LDAP - LDAP APIs to use
     * @param {string} companyId the id of the company.
     * @param {string} name name of this configuration.
     * @param {Object} settings config settings.
     * @param {string} type specify for which type of synchronisation this config is . Allowed types are: "ldap_config", "ldap_config_directories". Default value : ldap_config
     * @param {Object} settings.massproFromLdap list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal.
     * @param {string} settings.massproFromLdap.headerName headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap (only when a ldap field exists for this headerName, should never be empty).
     * @param {Object} settings.company specific settings for the company. Each key represent a setting.
     * @param {string} settings.company.login login for the ldap server.
     * @param {string} settings.company.password password for the ldap server.
     * @param {number} settings.company.synchronizationTimeInterval time interval between synchronization in hours.
     * @param {string} settings.company.url url of the ldap server.
     * @param {string} settings.company.domain domain of the ldap server.
     * @param {string} settings.company.baseDN base DN for the ldap server.
     * @param {boolean} settings.company.activeFlag defines if the synchronization is active, or not.
     * @param {string} settings.company.nextSynchronization date (ISO 8601 format) which defines when the next synchronization will be performed.
     * @param {string} settings.company.search_rule filters to use when requesting the ldap server.
     * @description
     *      This API allows create configuration for the connector. <br>
     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br>
     *      Users with superadmin, support role can create the connectors configuration from any company. <br>
     *      Users with bp_admin or bp_finance role can only create the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br>
     *      Users with admin role can only create the connectors configuration in companies they can manage. That is to say: <br>
     *      * an organization_admin can create the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId)
     *      * a company_admin can only create the connectors configuration in his company.
     *
     * @return {Promise<{Object}>} return -
     * <br>
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Config Object. |
     * | id  | String | Config unique identifier. |
     * | type | String | Config type |
     * | companyId | String | Allows to specify for which company the connectors configuration is done.. |
     * | settings | Object | config settings |
     * | massproFromLdap | Object | list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. |
     * | headerName | String | headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. |
     * | company | Object | specific settings for the company. Each key represent a setting. |
     * | login | String | login for the ldap server. |
     * | password | String | password for the ldap server. |
     * | synchronizationTimeInterval | Number | time interval between synchronization in hours. |
     * | url | String | url of the ldap server. |
     * | baseDN | String | base DN for the ldap server. |
     * | activeFlag | Boolean | defines if the synchronization is active, or not. |
     * | nextSynchronization | Date-Time | date (ISO 8601 format) which defines when the next synchronization will be performed. |
     * | enrollmentEmailEnable | Boolean | defines if an enrollment email is sent to new users |
     * | synchronisationDiffMode | Boolean | defines if synching only users changed since last sync date |
     * | search_rule | String | filters to use when requesting the ldap server. |
     * | lastSynchronization | Date-Time | date (ISO 8601 format) when the last synchronization was performed by the ldap connector (filled by the ldap connector). |
     * | softwareVersion | String | software Version of the ldap connector (filled by the ldap connector). |
     *
     */
    createConfigurationForLdapConnector (companyId, settings, name : string, type : string = "ldap_config") {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                companyId = companyId ? companyId : that._rest.account.companyId;
                
                if (!settings) {
                    this._logger.log("warn", LOG_ID + "(setBubbleAutoRegister) bad or empty 'settings' parameter");
                    this._logger.log("internalerror", LOG_ID + "(setBubbleAutoRegister) bad or empty 'settings' parameter : ", settings);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
                
                let result = await that._rest.createConfigurationForLdapConnector(companyId, settings, name, type);
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
     * @method deleteLdapConnectorConfig
     * @since 2.9.0
     * @instance
     * @async
     * @category AD/LDAP - LDAP APIs to use
     * @param {string} ldapConfigId the Id of the ldap connector to delete.
     * @description
     *      This API can be used to delete a ldap connector config. <br>
     *      <br>
     *      **BP Admin** and **BP Finance** users can only delete a ldap config being in a company linked to their BP company. <br>
     *      **Admin** users can only delete ldap config being in their own company. (superadmin, organization_admin, company_admin)  <br>
     * @return {Promise<{ status : string}>}
     */
    deleteLdapConnectorConfig(ldapConfigId : string) : Promise<{ status : string }> {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.deleteLdapConnectorConfig(ldapConfigId);
                that._logger.log("debug", "(deleteLdapConnectorConfig) - sent.");
                that._logger.log("internal", "(deleteLdapConnectorConfig) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(deleteLdapConnectorConfig) Error.");
                that._logger.log("internalerror", LOG_ID + "(deleteLdapConnectorConfig) Error : ", err);
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
     * @category AD/LDAP - LDAP APIs to use
     * @param {string} companyId Allows to filter connectors list on the companyId provided in this option. In the case of admin (except superadmin and support roles), provided companyId should correspond to a company visible by logged in user's company (if some of the provided companyId are not visible by logged in user's company, connectors from these companies will not be returned). if not provided, default is admin's company.
     * @description
     *      This API allows to retrieve the configuration for the connector. <br>
     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br>
     *      Users with superadmin, support role can retrieve the connectors configuration from any company. <br>
     *      Users with bp_admin or bp_finance role can only retrieve the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br>
     *      Users with admin role can only retrieve the connectors configuration in companies they can manage. That is to say: <br>
     *      an organization_admin can retrieve the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br>
     *      a company_admin can only retrieve the connectors configuration in his company. <br>
     *      return { <br>
     *         id 	string Config unique identifier. <br>
     *         type 	string Config type  <br>
     *         companyId 	string Allows to specify for which company the connectors configuration is done.. <br>
     *         settings 	Object config settings <br>
     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br>
     *                 headerName 	string headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br>
     *             company 	Object specific settings for the company. Each key represent a setting. <br>
     *                 login 	string login for the ldap server. <br>
     *                 password 	string password for the ldap server. <br>
     *                 synchronizationTimeInterval 	string time interval between synchronization in hours. <br>
     *                 url 	string url of the ldap server. <br>
     *          } <br>
     * @return {Promise<{Object}>}
     */
    retrieveLdapConnectorConfig (companyId : string) {
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

    /**
     * @public
     * @method retrieveLdapConnectorConfigTemplate
     * @since 1.86.0
     * @instance
     * @async
     * @param {string} type Allows to filter connectors config list on the type provided in this option. Allowed types are: "ldap_template", "ldap_template_directories". Default value : ldap_template
     * @category AD/LDAP - LDAP APIs to use
     * @description
     *      This API allows to retrieve the configuration template for the connector. <br>
     *      return { <br>
     *         id 	string Config unique identifier. <br>
     *         type 	string Config type  <br>
     *         companyId 	string Allows to specify for which company the connectors configuration is done.. <br>
     *         settings 	Object config settings <br>
     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br>
     *                 headerName 	string headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br>
     *             company 	Object specific settings for the company. Each key represent a setting. <br>
     *                 login 	string login for the ldap server. <br>
     *                 password 	string password for the ldap server. <br>
     *                 synchronizationTimeInterval 	string time interval between synchronization in hours. <br>
     *                 url 	string url of the ldap server. <br>
     *          } <br>
     * @return {Promise<{Object}>}
     */
    retrieveLdapConnectorConfigTemplate(type="ldap_template") {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveLdapConnectorConfigTemplate(type);
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
     * @method retrieveLdapConnectorAllConfigTemplate
     * @since 1.86.0
     * @instance
     * @async
     * @category AD/LDAP - LDAP APIs to use
     * @description
     *      This API allows to retrieve all the configuration templates for the connector. <br>
     *      return { <br>
     *         id 	string Config unique identifier. <br>
     *         type 	string Config type  <br>
     *         companyId 	string Allows to specify for which company the connectors configuration is done.. <br>
     *         settings 	Object config settings <br>
     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br>
     *                 default 	String default field name in ldap. <br>
     *                 mandatory optionnel 	Boolean specify if field is mandatory. <br>
     *             company 	Object specific settings for the company. Each key represent a setting. <br>
     *                  headerName 	Object headerName as specified in the csv templates for the massprovisioning portal. <br>
     *                  settingName Object name of the setting. Each key represent a setting. As of now list of setting is "login", "password", "synchronizationTimeInterval", "url". This list can evolve. <br>
     *                  default optionnel 	String 	 <br>
     *                  default value of the setting.  <br>
     *                  mandatory optionnel 	String specify if field is mandatory. <br>
     *          } <br>
     * @return {Promise<{Object}>}
     */
    retrieveLdapConnectorAllConfigTemplates() {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveLdapConnectorAllConfigTemplates();
                that._logger.log("debug", "(retrieveLdapConnectorAllConfigTemplates) - sent.");
                that._logger.log("internal", "(retrieveLdapConnectorAllConfigTemplates) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveLdapConnectorAllConfigTemplates) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveLdapConnectorAllConfigTemplates) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method retrieveLdapConnectorAllConfigs
     * @since 2.15.0
     * @instance
     * @async
     * @category AD/LDAP - LDAP APIs to use
     * @param {string} companyId Allows to filter connectors config list on the companyId provided in this option. In the case of admin (except superadmin and support roles), provided companyId should correspond to a company visible by logged in user's company (if some of the provided companyId are not visible by logged in user's company, connectors from these companies will not be returned). if not provided, default is admin's company.
     * @description
     *      This API allows to retrieve the configurations list for the connector. <br>
     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br>
     *      Users with superadmin, support role can retrieve the connectors configuration from any company. <br>
     *      Users with bp_admin or bp_finance role can only retrieve the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br>
     *      Users with admin role can only retrieve the connectors configuration in companies they can manage. That is to say: <br>
     *      an organization_admin can retrieve the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br>
     *      a company_admin can only retrieve the connectors configuration in his company. <br>
     *      return { <br>
     *         id 	string Config unique identifier. <br>
     *         type 	string Config type  <br>
     *         companyId 	string Allows to specify for which company the connectors configuration is done.. <br>
     *         settings 	Object config settings <br>
     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br>
     *                 headerName 	string headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br>
     *             company 	Object specific settings for the company. Each key represent a setting. <br>
     *                 login 	string login for the ldap server. <br>
     *                 password 	string password for the ldap server. <br>
     *                 synchronizationTimeInterval 	string time interval between synchronization in hours. <br>
     *                 url 	string url of the ldap server. <br>
     *                 connectorStatus 	string status of the connector (set by the connector itself). <br>
     *                 nextSynchronization 	Date-Time date (ISO 8601 format) which defines when the next synchronization will be performed. <br>
     *                 enrollmentEmailEnable 	boolean defines if an enrollment email is sent to new users <br>
     *                 synchronisationDiffMode 	boolean defines if synching only users changed since last sync date <br>
     *                 search_rule 	string filters to use when requesting the ldap server. <br>
     *                 lastSynchronization 	Date-Time date (ISO 8601 format) when the last synchronization was performed by the ldap connector (filled by the ldap connector). <br>
     *                 softwareVersion 	string software Version of the ldap connector (filled by the ldap connector). <br>
     *          } <br>
     * @return {Promise<{Object}>}
     */
    retrieveLdapConnectorAllConfigs (companyId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                companyId = companyId ? companyId : that._rest.account.companyId;

                if (!companyId) {
                    this._logger.log("warn", LOG_ID + "(retrieveLdapConnectorAllConfigs) bad or empty 'companyId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(retrieveLdapConnectorAllConfigs) bad or empty 'companyId' parameter : ", companyId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.retrieveLdapConnectorAllConfigs(companyId);
                that._logger.log("debug", "(retrieveLdapConnectorAllConfigs) - sent.");
                that._logger.log("internal", "(retrieveLdapConnectorAllConfigs) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveLdapConnectorAllConfigs) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveLdapConnectorAllConfigs) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method retrieveLDAPConnectorConfigByLdapConfigId
     * @since 2.15.0
     * @instance
     * @async
     * @category AD/LDAP - LDAP APIs to use
     * @param {string} ldapConfigId Ldap connector unique identifier
     * @description
     *      This API allows to retrieve the configuration for the connector with the ldapConfigId. <br>
     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br>
     *      Users with superadmin, support role can retrieve the connectors configuration from any company. <br>
     *      Users with bp_admin or bp_finance role can only retrieve the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br>
     *      Users with admin role can only retrieve the connectors configuration in companies they can manage. That is to say: <br>
     *      an organization_admin can retrieve the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br>
     *      a company_admin can only retrieve the connectors configuration in his company. <br>
     *      return { <br>
     *         id 	string Config unique identifier. <br>
     *         type 	string Config type  <br>
     *         companyId 	string Allows to specify for which company the connectors configuration is done.. <br>
     *         settings 	Object config settings <br>
     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. <br>
     *                 headerName 	string headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. <br>
     *             company 	Object specific settings for the company. Each key represent a setting. <br>
     *                 login 	string login for the ldap server. <br>
     *                 password 	string password for the ldap server. <br>
     *                 synchronizationTimeInterval 	string time interval between synchronization in hours. <br>
     *                 url 	string url of the ldap server. <br>
     *                 connectorStatus 	string status of the connector (set by the connector itself). <br>
     *                 nextSynchronization 	Date-Time date (ISO 8601 format) which defines when the next synchronization will be performed. <br>
     *                 enrollmentEmailEnable 	boolean defines if an enrollment email is sent to new users <br>
     *                 synchronisationDiffMode 	boolean defines if synching only users changed since last sync date <br>
     *                 search_rule 	string filters to use when requesting the ldap server. <br>
     *                 lastSynchronization 	Date-Time date (ISO 8601 format) when the last synchronization was performed by the ldap connector (filled by the ldap connector). <br>
     *                 softwareVersion 	string software Version of the ldap connector (filled by the ldap connector). <br>
     *          } <br>
     * @return {Promise<{Object}>}
     */
    retrieveLDAPConnectorConfigByLdapConfigId (ldapConfigId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!ldapConfigId) {
                    this._logger.log("warn", LOG_ID + "(retrieveLdapConnectorAllConfigs) bad or empty 'ldapConfigId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(retrieveLdapConnectorAllConfigs) bad or empty 'ldapConfigId' parameter : ", ldapConfigId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.retrieveLDAPConnectorConfigByLdapConfigId(ldapConfigId);
                that._logger.log("debug", "(retrieveLDAPConnectorConfigByLdapConfigId) - sent.");
                that._logger.log("internal", "(retrieveLDAPConnectorConfigByLdapConfigId) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveLDAPConnectorConfigByLdapConfigId) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveLDAPConnectorConfigByLdapConfigId) Error : ", err);
                return reject(err);
            }
        });
    }

    /*
    
     * @param {Object} settings config settings
     * @param {Object} settings.massproFromLdap list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal.
     * @param {string} settings.massproFromLdap.headerName headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap (only when a ldap field exists for this headerName, should never be empty).
     * @param {Object} settings.company specific settings for the company. Each key represent a setting.
     * @param {string} settings.company.login login for the ldap server.
     * @param {string} settings.company.password password for the ldap server.
     * @param {number} settings.company.synchronizationTimeInterval time interval between synchronization in hours.
     * @param {string} settings.company.url url of the ldap server.
     * @param {boolean} strict Allows to specify if all the previous fields must be erased or just update/push new fields.

     */
    

    /**
     * @public
     * @method updateConfigurationForLdapConnector
     * @since 1.86.0
     * @instance
     * @async
     * @category AD/LDAP - LDAP APIs to use
     * @param {string} ldapConfigId ldap connector unique identifier
     * @param {boolean}   [strict=false]      Allows to specify if all the previous fields must be erased or just update/push new fields.
     * @param {string}    name name of this configuration
     * @param {Object}    settings      config settings
     * @param {Object}    settings.massproFromLdap      list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal.
     * @param {string}    settings.massproFromLdap.headerName      headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap (only when a ldap field exists for this headerName, should never be empty).
     * @param {Object}    settings.company      specific settings for the company. Each key represent a setting.
     * @param {string}    settings.company.login      login for the ldap server.
     * @param {string}    settings.company.password      password for the ldap server.
     * @param {Number}     settings.company.synchronizationTimeInterval      time interval between synchronization in hours.
     * @param {string}    settings.company.url      url of the ldap server.
     * @param {string}    settings.company.baseDN      base DN for the ldap server.
     * @param {boolean}     settings.company.activeFlag      defines if the synchronization is active, or not.
     * @param {boolean}      settings.company.enrollmentEmailEnable   defines if an enrollment email is sent to new users
     * @param {boolean}      settings.company.synchronisationDiffMode     defines if  synching only users changed since last sync date
     * @param {string}    settings.company.nextSynchronization      date (ISO 8601 format) which defines when the next synchronization will be performed.
     * @param {string}    settings.company.search_rule      filters to use when requesting the ldap server.
     * @param {string}    settings.company.lastSynchronization      date (ISO 8601 format) of the last performed synchronization, usually set by the AD connector .
     * @param {string}    settings.company.softwareVersion     Software Version of the AD connector, provisioned by the AD connector
     * @description
     *      This API allows update configuration for the connector. <br>
     *      A template is available : use retrieveLdapConnectorConfigTemplate API. <br>
     *      Users with superadmin, support role can update the connectors configuration from any company. <br>
     *      Users with bp_admin or bp_finance role can only update the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). <br>
     *      Users with admin role can only update the connectors configuration in companies they can manage. That is to say: <br>
     *      an organization_admin can update the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) <br>
     *      a company_admin can only update the connectors configuration in his company. <br>
     *          
     *      a 'rainbow_onconnectorconfig' event is raised when updated. The parameter configId can be used to retrieve the updated configuration.
     *     
     * @return {Promise<{Object}>} -
     * <br>
     *     
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Config Object. |
     * | id  | string | Config unique identifier. |
     * | type | string | Config type |
     * | companyId | string | Allows to specify for which company the connectors configuration is done.. |
     * | settings | Object | config settings |
     * | massproFromLdap | Object | list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. |
     * | headerName | string | headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. |
     * | company | Object | specific settings for the company. Each key represent a setting. |
     * | login | string | login for the ldap server. |
     * | password | string | password for the ldap server. |
     * | synchronizationTimeInterval | Number | time interval between synchronization in hours. |
     * | url | string | url of the ldap server. |
     * | baseDN | string | base DN for the ldap server. |
     * | activeFlag | boolean | defines if the synchronization is active, or not. |
     * | nextSynchronization | string | date (ISO 8601 format) which defines when the next synchronization will be performed. |
     * | enrollmentEmailEnable | boolean | defines if an enrollment email is sent to new users |
     * | synchronisationDiffMode | boolean | defines if synching only users changed since last sync date |
     * | search_rule | string | filters to use when requesting the ldap server. |
     * | lastSynchronization | string | date (ISO 8601 format) when the last synchronization was performed by the ldap connector (filled by the ldap connector). |
     * | softwareVersion | string | software Version of the ldap connector (filled by the ldap connector). |
     * 
     */
    updateConfigurationForLdapConnector (ldapConfigId : string, settings : any, strict  : boolean = false, name : string) {
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

                let result = await that._rest.updateConfigurationForLdapConnector(ldapConfigId, settings, strict, name);
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
    
    //endregion LDAP APIs to use
    
    //endregion AD/LDAP
    
    //region Rainbow Voice Communication Platform Provisioning
    // Server doc : https://hub.openrainbow.com/api/ngcpprovisioning/index.html#tag/Cloudpbx

    //region CloudPBX
    
    /**
     * @public
     * @method getCloudPbxById
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
     * @param {string} systemId CloudPBX unique identifier.
     * @description
     *      This API allows administrator to retrieve a CloudPBX using its identifier. <br>
     * @return {Promise<any>}
     */
    getCloudPbxById (systemId : string) {
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
     * @method updateCloudPBX
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} barringOptions_permissions Identifier of the traffic barring permission to apply
     * @param {string} barringOptions_restrictions Identifier of the traffic barring restriction to apply
     * @param {string} callForwardOptions_externalCallForward Indicates if an external call forward is authorized
     * @param {string} customSipHeader_1 Value to put as Custom SIP Header 1 into SIP data for an external outgoing call
     * @param {string} customSipHeader_2 Value to put as Custom SIP Header 2 into SIP data for an external outgoing call
     * @param {boolean} emergencyOptions_callAuthorizationWithSoftPhone Indicates if SoftPhone can perform an emergency call over voip
     * @param {boolean} emergencyOptions_emergencyGroupActivated Indicates if emergency Group is active
     * @param {string} externalTrunkId External trunk that should be linked to this CloudPBX 
     * @param {string} language New language for this CloudPBX. Values : "ro" "es" "it" "de" "ru" "fr" "en" "ar" "he" "nl"
     * @param {string} name New CloudPBX name
     * @param {number} numberingDigits Number of digits for CloudPBX numbering plan. If a numberingPrefix is provided, this parameter is mandatory.
     * For example, if numberingPrefix is 8 and numberingDigits is 4, allowed numbers for this CloudPBX will be from 8000 to 8999.
     * @param {number} numberingPrefix Prefix for CloudPBX numbering plan
     * @param {number} outgoingPrefix Company outgoing prefix
     * @param {boolean} routeInternalCallsToPeer Indicates if internal calls must be routed to peer (Only available if 'routeInternalCallsToPeerAllowed' is set to 'true' on external trunk)
     * @description
     *      This API allows to update a CloudPBX using its identifier. <br>
     * @return {Promise<any>}
     */
    updateCloudPBX (systemId, barringOptions_permissions : string, barringOptions_restrictions : string, callForwardOptions_externalCallForward : string, customSipHeader_1 : string, customSipHeader_2 : string, emergencyOptions_callAuthorizationWithSoftPhone : boolean, emergencyOptions_emergencyGroupActivated : boolean, externalTrunkId : string, language : string, name : string, numberingDigits : number, numberingPrefix : number, outgoingPrefix : number,routeInternalCallsToPeer  : boolean) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                //companyId = companyId ? companyId : that._rest.account.companyId;

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(updateCloudPBX) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(updateCloudPBX) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.updateCloudPBX(systemId, barringOptions_permissions , barringOptions_restrictions , callForwardOptions_externalCallForward , customSipHeader_1 , customSipHeader_2 , emergencyOptions_callAuthorizationWithSoftPhone , emergencyOptions_emergencyGroupActivated , externalTrunkId , language , name , numberingDigits , numberingPrefix , outgoingPrefix ,routeInternalCallsToPeer);
                that._logger.log("debug", "(updateCloudPBX) - sent.");
                that._logger.log("internal", "(updateCloudPBX) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateCloudPBX) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateCloudPBX) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteCloudPBX
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
     * @param {string} systemId CloudPBX unique identifier.
     * @description
     *      This API allows to delete a CloudPBX using its identifier. <br>
     * @return {Promise<any>}
     */
    deleteCloudPBX (systemId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(deleteCloudPBX) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(deleteCloudPBX) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.deleteCloudPBX(systemId);
                that._logger.log("debug", "(deleteCloudPBX) - sent.");
                that._logger.log("internal", "(deleteCloudPBX) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(deleteCloudPBX) Error.");
                that._logger.log("internalerror", LOG_ID + "(deleteCloudPBX) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @public
     * @method getCloudPbxs
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
     * @description
     *      This API allows administrator to retrieve a list of CloudPBXs. <br>
     * @return {Promise<any>}
     * @param {number} limit Allow to specify the number of CloudPBXs to retrieve. Default value : 100
     * @param {number} offset llow to specify the position of first cloudPBX to retrieve (first site if not specified) Warning: if offset > total, no results are returned
     * @param {string} sortField Sort CloudPBXs list based on the given field. Default value : companyId
     * @param {number} sortOrder Specify order when sorting CloudPBXs list. Default value : 1. Possible values : -1, 1
     * @param {string} companyId Allows to filter CloudPBXs list on the siteIds linked to companyIds provided in this option
     * @param {string} bpId Allows to filter CloudPBXs list on the bpIds provided in this option
     */
    getCloudPbxs ( limit : number = 100, offset : number = 0, sortField : string = "companyId", sortOrder : number = 1, companyId : string, bpId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getCloudPbxs( limit, offset, sortField, sortOrder, companyId, bpId );
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

    /**
     * @public
     * @method createACloudPBX
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
     * @param {string} bpId Identifier of the BP to which CloudPBX should be linked with.
     * @param {string} companyId Required Identifier of the company for which CloudPBX should be created.
     * @param {string} customSipHeader_1 Value to put as CustomSipHeader_1 into SIP data for an external outgoing call.
     * @param {string} customSipHeader_2 Value to put as CustomSipHeader_2 into SIP data for an external outgoing call.
     * @param {string} externalTrunkId External trunk identifier that should be linked to this CloudPBX.
     * @param {string} language Associated language for this CloudPBX. Values : "ro" "es" "it" "de" "ru" "fr" "en" "ar" "he" "nl".  default : "en".
     * @param {string} name CloudPBX name. If not provided, will be something like 'cloud_pbx_companyName'.
     * @param {number} noReplyDelay In case of overflow no reply forward on subscribers, timeout in seconds after which the call will be forwarded. Default 20.
     * @param {number} numberingDigits Number of digits for CloudPBX numbering plan. If a numberingPrefix is provided, this parameter is mandatory. <br>
     * For example, if numberingPrefix is 8 and numberingDigits is 4, allowed numbers for this CloudPBX will be from 8000 to 8999.
     * @param {number} numberingPrefix Prefix for CloudPBX numbering plan.
     * @param {number} outgoingPrefix Company outgoing prefix.
     * @param {boolean} routeInternalCallsToPeer Indicates if internal calls must be routed to peer (Only available if 'routeInternalCallsToPeerAllowed' is set to 'true' on external trunk).
     * @param {string} siteId Identifier of the site on which CloudPBX should be created.
     * @description
     *      This API allows to creates a CloudPBX for a given company. <br>
     * @return {Promise<any>}
     */
    async createACloudPBX (bpId : string, companyId : string, customSipHeader_1 : string, customSipHeader_2 : string, externalTrunkId : string, language : string, name : string, noReplyDelay : number, numberingDigits : number, numberingPrefix : number, outgoingPrefix : number, routeInternalCallsToPeer : boolean, siteId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                companyId = companyId ? companyId : that._rest.account.companyId;

                let result = await that._rest.createACloudPBX(bpId, companyId, customSipHeader_1, customSipHeader_2, externalTrunkId, language, name, noReplyDelay, numberingDigits, numberingPrefix, outgoingPrefix, routeInternalCallsToPeer, siteId );
                that._logger.log("debug", "(createACloudPBX) - sent.");
                that._logger.log("internal", "(createACloudPBX) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(createACloudPBX) Error.");
                that._logger.log("internalerror", LOG_ID + "(createACloudPBX) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getCloudPBXCLIPolicyForOutboundCalls
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
     * @param {string} systemId CloudPBX unique identifier.
     * @description
     *      This API allows to retrieve the CloudPBX CLI options for outbound calls using its identifier. <br>
     * @return {Promise<any>}
     */
    getCloudPBXCLIPolicyForOutboundCalls (systemId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXCLIPolicyForOutboundCalls) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXCLIPolicyForOutboundCalls) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.getCloudPBXCLIPolicyForOutboundCalls(systemId);
                that._logger.log("debug", "(getCloudPBXCLIPolicyForOutboundCalls) - sent.");
                that._logger.log("internal", "(getCloudPBXCLIPolicyForOutboundCalls) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getCloudPBXCLIPolicyForOutboundCalls) Error.");
                that._logger.log("internalerror", LOG_ID + "(getCloudPBXCLIPolicyForOutboundCalls) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @public
     * @method updateCloudPBXCLIOptionsConfiguration
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
     * @param {string} systemId CloudPBX unique identifier.
     * @param {CLOUDPBXCLIOPTIONPOLICY} policy CLI policy to apply. Values : "installation_ddi_number" or "user_ddi_number". 
     * @description
     *      This API allows to update a CloudPBX using its identifier. <br>
     * @return {Promise<any>}
     */
    updateCloudPBXCLIOptionsConfiguration (systemId : string, policy: CLOUDPBXCLIOPTIONPOLICY) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!policy) {
                    this._logger.log("warn", LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) bad or empty 'policy' parameter");
                    this._logger.log("internalerror", LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) bad or empty 'policy' parameter : ", policy);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.updateCloudPBXCLIOptionsConfiguration(systemId, policy);
                that._logger.log("debug", "(updateCloudPBXCLIOptionsConfiguration) - sent.");
                that._logger.log("internal", "(updateCloudPBXCLIOptionsConfiguration) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getCloudPBXlanguages
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
     * @param {string} systemId CloudPBX unique identifier.
     * @description
     *      This API allows to retrieve a list of languages supported by a CloudPBX using its identifier. <br>
     * @return {Promise<any>}
     */
    getCloudPBXlanguages(systemId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXlanguages) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXlanguages) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.getCloudPBXlanguages(systemId);
                that._logger.log("debug", "(getCloudPBXlanguages) - sent.");
                that._logger.log("internal", "(getCloudPBXlanguages) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getCloudPBXlanguages) Error.");
                that._logger.log("internalerror", LOG_ID + "(getCloudPBXlanguages) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getCloudPBXDeviceModels
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
     * @param {string} systemId CloudPBX unique identifier.
     * @description
     *      This API allows to retrieve a list of device models supported by a CloudPBX using its identifier. <br>
     * @return {Promise<any>}
     */
    getCloudPBXDeviceModels(systemId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXlanguages) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXlanguages) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.getCloudPBXDeviceModels(systemId);
                that._logger.log("debug", "(getCloudPBXlanguages) - sent.");
                that._logger.log("internal", "(getCloudPBXlanguages) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getCloudPBXlanguages) Error.");
                that._logger.log("internalerror", LOG_ID + "(getCloudPBXlanguages) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getCloudPBXTrafficBarringOptions
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
     * @param {string} systemId CloudPBX unique identifier.
     * @description
     *      This API allows to retrieve a list of traffic barring options supported by a CloudPBX using its identifier. <br>
     * @return {Promise<any>}
     */
    getCloudPBXTrafficBarringOptions(systemId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXTrafficBarringOptions) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXTrafficBarringOptions) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.getCloudPBXTrafficBarringOptions(systemId);
                that._logger.log("debug", "(getCloudPBXTrafficBarringOptions) - sent.");
                that._logger.log("internal", "(getCloudPBXTrafficBarringOptions) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getCloudPBXTrafficBarringOptions) Error.");
                that._logger.log("internalerror", LOG_ID + "(getCloudPBXTrafficBarringOptions) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @public
     * @method getCloudPBXEmergencyNumbersAndEmergencyOptions
     * @since 2.1.0
     * @instance
     * @category Rainbow Voice Communication Platform Provisioning - CloudPBX
     * @async
     * @param {string} systemId CloudPBX unique identifier.
     * @description
     *      This API allows to retrieve Emergency Numbers and Emergency Options supported by a CloudPBX using its identifier. <br>
     * @return {Promise<any>}
     */
    getCloudPBXEmergencyNumbersAndEmergencyOptions(systemId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXEmergencyNumbersAndEmergencyOptions) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXEmergencyNumbersAndEmergencyOptions) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.getCloudPBXEmergencyNumbersAndEmergencyOptions(systemId);
                that._logger.log("debug", "(getCloudPBXEmergencyNumbersAndEmergencyOptions) - sent.");
                that._logger.log("internal", "(getCloudPBXEmergencyNumbersAndEmergencyOptions) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getCloudPBXEmergencyNumbersAndEmergencyOptions) Error.");
                that._logger.log("internalerror", LOG_ID + "(getCloudPBXEmergencyNumbersAndEmergencyOptions) Error : ", err);
                return reject(err);
            }
        });
    }
    
    //endregion CloudPBX
    //region Cloudpbx Devices

    /**
     * @public
     * @method CreateCloudPBXSIPDevice
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} description Description for identifying the device
     * @param {number} deviceTypeId Device type Identifier - see API GET /cloudpbxs/:id/devicemodels to get the list of supported models for the CloudPBX.
     * @param {string} macAddress Device mac address - mandatory for SIP deskphone device
     * @description
     *      This API allows allows to create a new SIP device into a CloudPBX. This SIP device can then be assigned to an existing subscriber. <br>
     * @return {Promise<any>}
     */
    CreateCloudPBXSIPDevice (systemId : string,   description : string,  deviceTypeId  : string,  macAddress  : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(CreateCloudPBXSIPDevice) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(CreateCloudPBXSIPDevice) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!description) {
                    this._logger.log("warn", LOG_ID + "(CreateCloudPBXSIPDevice) bad or empty 'description' parameter");
                    this._logger.log("internalerror", LOG_ID + "(CreateCloudPBXSIPDevice) bad or empty 'description' parameter : ", description);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (! deviceTypeId ) {
                    this._logger.log("warn", LOG_ID + "(CreateCloudPBXSIPDevice) bad or empty 'deviceTypeId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(CreateCloudPBXSIPDevice) bad or empty 'deviceTypeId' parameter : ", description);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.CreateCloudPBXSIPDevice(systemId, description, deviceTypeId,  macAddress);
                that._logger.log("debug", "(CreateCloudPBXSIPDevice) - sent.");
                that._logger.log("internal", "(CreateCloudPBXSIPDevice) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(CreateCloudPBXSIPDevice) Error.");
                that._logger.log("internalerror", LOG_ID + "(CreateCloudPBXSIPDevice) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method factoryResetCloudPBXSIPDevice
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} deviceId Unique identifier of the SIP device to be reset
     * @description
     *      This API allows to reset a SIP deskphone device to its factory settings.<br>
     *      Be aware that the device will no longer be operational, and should, after the factory reset, need to be manually configured (e.g. at least auto provisioning Url will need to be set). <br>
     * @return {Promise<any>}
     */
    factoryResetCloudPBXSIPDevice (systemId : string, deviceId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(factoryResetCloudPBXSIPDevice) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(factoryResetCloudPBXSIPDevice) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!deviceId) {
                    this._logger.log("warn", LOG_ID + "(factoryResetCloudPBXSIPDevice) bad or empty 'deviceId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(factoryResetCloudPBXSIPDevice) bad or empty 'deviceId' parameter : ", deviceId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.factoryResetCloudPBXSIPDevice(systemId, deviceId);
                that._logger.log("debug", "(factoryResetCloudPBXSIPDevice) - sent.");
                that._logger.log("internal", "(factoryResetCloudPBXSIPDevice) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(factoryResetCloudPBXSIPDevice) Error.");
                that._logger.log("internalerror", LOG_ID + "(factoryResetCloudPBXSIPDevice) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getCloudPBXSIPDeviceById
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} deviceId Unique identifier of the SIP device to get
     * @description
     *      This API allows to retrieve a SIP device using the given deviceId.<br>
     * @return {Promise<any>}
     */
    getCloudPBXSIPDeviceById (systemId : string, deviceId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXSIPDeviceById) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXSIPDeviceById) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!deviceId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXSIPDeviceById) bad or empty 'deviceId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXSIPDeviceById) bad or empty 'deviceId' parameter : ", deviceId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.getCloudPBXSIPDeviceById(systemId, deviceId);
                that._logger.log("debug", "(getCloudPBXSIPDeviceById) - sent.");
                that._logger.log("internal", "(getCloudPBXSIPDeviceById) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getCloudPBXSIPDeviceById) Error.");
                that._logger.log("internalerror", LOG_ID + "(getCloudPBXSIPDeviceById) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteCloudPBXSIPDevice
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} deviceId Unique identifier of the SIP device to delete
     * @description
     *      This API allows to remove a SIP Device from a CloudPBX. To do so, the SIP device must no longer be associated to a subscriber.<br>
     * @return {Promise<any>}
     */
    deleteCloudPBXSIPDevice (systemId : string, deviceId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(deleteCloudPBXSIPDevice) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(deleteCloudPBXSIPDevice) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!deviceId) {
                    this._logger.log("warn", LOG_ID + "(deleteCloudPBXSIPDevice) bad or empty 'deviceId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(deleteCloudPBXSIPDevice) bad or empty 'deviceId' parameter : ", deviceId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.deleteCloudPBXSIPDevice(systemId, deviceId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(deleteCloudPBXSIPDevice) Successfully deleting CloudPBX SIP Device. ");
                    that._logger.log("internal", LOG_ID + "(deleteCloudPBXSIPDevice) Successfully deleting CloudPBX SIP Device : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteCloudPBXSIPDevice) ErrorManager when deleting CloudPBX SIP Device : ", systemId, " : ", deviceId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(deleteCloudPBXSIPDevice) error : ", err);
                return reject(err);
            }
        });

    }

    /**
     * @public
     * @method updateCloudPBXSIPDevice
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} description new description
     * @param {string} deviceId Unique identifier of the SIP device to delete
     * @param {string} macAddress new device mac address
     * @description
     *      This API allows to update a SIP device.<br>
     * @return {Promise<any>}
     */
    updateCloudPBXSIPDevice (systemId : string,   description : string,  deviceId  : string,  macAddress  : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(updateCloudPBXSIPDevice) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(updateCloudPBXSIPDevice) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (! deviceId ) {
                    this._logger.log("warn", LOG_ID + "(updateCloudPBXSIPDevice) bad or empty 'deviceId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(updateCloudPBXSIPDevice) bad or empty 'deviceId' parameter : ", deviceId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.updateCloudPBXSIPDevice(systemId, description, deviceId,  macAddress);
                that._logger.log("debug", "(updateCloudPBXSIPDevice) - sent.");
                that._logger.log("internal", "(updateCloudPBXSIPDevice) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateCloudPBXSIPDevice) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateCloudPBXSIPDevice) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllCloudPBXSIPDevice
     * @since 2.1.0
     * @instance
     * @param {string} systemId CloudPBX unique identifier.
     * @param {number} limit Allow to specify the number of SIP Devices to retrieve.
     * @param {number} offset Allow to specify the position of first SIP Device to retrieve (first one if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort SIP Devices list based on the given field.
     * @param {number} sortOrder Specify order when sorting SIP Devices list. Valid values are -1, 1.
     * @param {boolean} assigned Allows to filter devices according their assignment to a subscriber
     *      false, allows to obtain all devices not yet assigned to a subscriber.
     *      true, allows to obtain all devices already assigned to a subscriber.
     *      if undefined ; all devices whatever their assignment status are returned
     * @param {string} phoneNumberId Allows to filter devices according their phoneNumberId (i.e. subscriber id)
     *      This parameter can be a list of phoneNumberId separated by a space (space has to be encoded)
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
     * @description
     *      This API allows  to retrieve all SIP devices assigned into a CloudPBX.<br>
     * @return {Promise<any>}
     */
    getAllCloudPBXSIPDevice (systemId : string, limit : number = 100, offset : number, sortField : string, sortOrder : number = 1, assigned : boolean, phoneNumberId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getAllCloudPBXSIPDevice) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getAllCloudPBXSIPDevice) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.getAllCloudPBXSIPDevice(systemId,  limit, offset, sortField, sortOrder, assigned, phoneNumberId );
                that._logger.log("debug", "(getAllCloudPBXSIPDevice) - sent.");
                that._logger.log("internal", "(getAllCloudPBXSIPDevice) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getAllCloudPBXSIPDevice) Error.");
                that._logger.log("internalerror", LOG_ID + "(getAllCloudPBXSIPDevice) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getCloudPBXSIPRegistrationsInformationDevice
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} deviceId Unique identifier of the SIP device for which SIP registrations information should be retrieved.
     * @description
     *      This API allows to retrieve SIP registrations information relative to a device.<br>
     * @return {Promise<any>}
     */
    getCloudPBXSIPRegistrationsInformationDevice (systemId : string, deviceId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!deviceId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) bad or empty 'deviceId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) bad or empty 'deviceId' parameter : ", deviceId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.getCloudPBXSIPRegistrationsInformationDevice(systemId, deviceId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) Successfully deleting CloudPBX SIP Device. ");
                    that._logger.log("internal", LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) Successfully deleting CloudPBX SIP Device : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) ErrorManager when deleting CloudPBX SIP Device : ", systemId, " : ", deviceId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method grantCloudPBXAccessToDebugSession
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} deviceId Unique identifier of the SIP device for which the debug session access will be granted.
     * @param {string} duration Duration, in seconds, of the debug session - Only superadmin can set a debug duration different from the default one (configuration parameter: e.g. 30 minutes)
     * @description
     *      This API allows  to grant access to debug session on the given device.<br>
     *      When debug session is granted on the device, admins can retrieve the admin password of the device, url to access the device admin page and also initiate ssh session with the device. <br>
     *      A debug session can be terminated by: <br>
     *      Calling the device revoke API <br>
     *      After debug session has timed out, a periodic check is performed by the portal to revoke expired debug sessions (periodicity defined by configuration parameter). <br>
     *
     *      During debug session, adminUrl and adminPassword of the device can be retrieved by getting device information.  <br>
     *      Please note that adminUrl could be unreachable depending on network configuration. <br>
     *      When a debug session is closed, ssh access to the device is deactivated, and the admin password of the device is modified.<br>
     * @return {Promise<any>}
     */
    grantCloudPBXAccessToDebugSession (systemId : string, deviceId : string,  duration : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(grantCloudPBXAccessToDebugSession) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(grantCloudPBXAccessToDebugSession) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!deviceId) {
                    this._logger.log("warn", LOG_ID + "(grantCloudPBXAccessToDebugSession) bad or empty 'deviceId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(grantCloudPBXAccessToDebugSession) bad or empty 'deviceId' parameter : ", deviceId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.grantCloudPBXAccessToDebugSession(systemId, deviceId, duration).then((result) => {
                    that._logger.log("debug", LOG_ID + "(grantCloudPBXAccessToDebugSession) Successfully deleting CloudPBX SIP Device. ");
                    that._logger.log("internal", LOG_ID + "(grantCloudPBXAccessToDebugSession) Successfully deleting CloudPBX SIP Device : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(grantCloudPBXAccessToDebugSession) ErrorManager when deleting CloudPBX SIP Device : ", systemId, " : ", deviceId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(grantCloudPBXAccessToDebugSession) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method revokeCloudPBXAccessFromDebugSession
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} deviceId Unique identifier of the SIP device access will be revoked
     * @description
     *      This API allows  to revoke access to debug session on the given device. <br>
     *      When revoked, the debug session can no longer be used. <br>
     *      The admin password is no longer visible (changed). <br>
     * @return {Promise<any>}
     */
    revokeCloudPBXAccessFromDebugSession (systemId : string, deviceId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(revokeCloudPBXAccessFromDebugSession) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(revokeCloudPBXAccessFromDebugSession) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!deviceId) {
                    this._logger.log("warn", LOG_ID + "(revokeCloudPBXAccessFromDebugSession) bad or empty 'deviceId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(revokeCloudPBXAccessFromDebugSession) bad or empty 'deviceId' parameter : ", deviceId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.revokeCloudPBXAccessFromDebugSession(systemId, deviceId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(revokeCloudPBXAccessFromDebugSession) Successfully deleting CloudPBX SIP Device. ");
                    that._logger.log("internal", LOG_ID + "(revokeCloudPBXAccessFromDebugSession) Successfully deleting CloudPBX SIP Device : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(revokeCloudPBXAccessFromDebugSession) ErrorManager when deleting CloudPBX SIP Device : ", systemId, " : ", deviceId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(revokeCloudPBXAccessFromDebugSession) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method rebootCloudPBXSIPDevice
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Devices
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} deviceId Unique identifier of the SIP device access will be revoked
     * @description
     *      This API allows  to reboot a SIP deskphone device. <br>
     * @return {Promise<any>}
     */
    rebootCloudPBXSIPDevice  (systemId : string, deviceId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(rebootCloudPBXSIPDevice) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(rebootCloudPBXSIPDevice) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!deviceId) {
                    this._logger.log("warn", LOG_ID + "(rebootCloudPBXSIPDevice) bad or empty 'deviceId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(rebootCloudPBXSIPDevice) bad or empty 'deviceId' parameter : ", deviceId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.rebootCloudPBXSIPDevice(systemId, deviceId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(rebootCloudPBXSIPDevice) Successfully deleting CloudPBX SIP Device. ");
                    that._logger.log("internal", LOG_ID + "(rebootCloudPBXSIPDevice) Successfully deleting CloudPBX SIP Device : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(rebootCloudPBXSIPDevice) ErrorManager when deleting CloudPBX SIP Device : ", systemId, " : ", deviceId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(rebootCloudPBXSIPDevice) error : ", err);
                return reject(err);
            }
        });

    }


    //endregion Cloudpbx Devices

    //region Cloudpbx Subscribers

    /**
     * @public
     * @method getCloudPBXSubscriber
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber to get (it is also its subscriber Id).
     * @description
     *      This API allows to get data of a CloudPBX Subscriber.<br>
     * @return {Promise<any>}
     */
    getCloudPBXSubscriber (systemId : string, phoneNumberId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXSubscriber) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXSubscriber) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!phoneNumberId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXSubscriber) bad or empty 'phoneNumberId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXSubscriber) bad or empty 'phoneNumberId' parameter : ", phoneNumberId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.getCloudPBXSubscriber(systemId, phoneNumberId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getCloudPBXSubscriber) Successfully deleting CloudPBX SIP Device. ");
                    that._logger.log("internal", LOG_ID + "(getCloudPBXSubscriber) Successfully deleting CloudPBX SIP Device : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getCloudPBXSubscriber) ErrorManager when deleting CloudPBX SIP Device : ", systemId, " : ", phoneNumberId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getCloudPBXSubscriber) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteCloudPBXSubscriber
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber to get (it is also its subscriber Id).
     * @description
     *      This API allows to delete a CloudPBX Subscriber. All its associated SIP devices become free for other subscribers.<br>
     * @return {Promise<any>}
     */
    deleteCloudPBXSubscriber (systemId : string, phoneNumberId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(deleteCloudPBXSubscriber) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(deleteCloudPBXSubscriber) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!phoneNumberId) {
                    this._logger.log("warn", LOG_ID + "(deleteCloudPBXSubscriber) bad or empty 'phoneNumberId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(deleteCloudPBXSubscriber) bad or empty 'phoneNumberId' parameter : ", phoneNumberId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.deleteCloudPBXSubscriber(systemId, phoneNumberId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(deleteCloudPBXSubscriber) Successfully deleting CloudPBX SIP Device. ");
                    that._logger.log("internal", LOG_ID + "(deleteCloudPBXSubscriber) Successfully deleting CloudPBX SIP Device : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteCloudPBXSubscriber) ErrorManager when deleting CloudPBX SIP Device : ", systemId, " : ", phoneNumberId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(deleteCloudPBXSubscriber) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method createCloudPBXSubscriberRainbowUser
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} login SIP username (if not provided ; shortNumber is used as SIP username)
     * @param {string} password SIP password for all associated SIP devices (if not provided ; it will be automatically generated).
     * Only lowercases, digits, * and # are authorized characters. Minimum length is 8, maximum is 12
     * @param {string} shortNumber Internal Number of the new CloudPBX Subscriber
     * @param {string} userId Unique identifier of the associated Rainbow User
     * @description
     *      This API allows to create a new CloudPBX Subscriber for a Rainbow User.<br>
     *      This new subscriber will appear as a new entry into "phoneNumbers" list of the targeted Rainbow User.<br>
     * @return {Promise<any>}
     */
    createCloudPBXSubscriberRainbowUser (systemId : string, login : string, password : string, shortNumber : string, userId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(createCloudPBXSubscriberRainbowUser) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(createCloudPBXSubscriberRainbowUser) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!shortNumber) {
                    this._logger.log("warn", LOG_ID + "(createCloudPBXSubscriberRainbowUser) bad or empty 'shortNumber' parameter");
                    this._logger.log("internalerror", LOG_ID + "(createCloudPBXSubscriberRainbowUser) bad or empty 'shortNumber' parameter : ", shortNumber);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!userId) {
                    this._logger.log("warn", LOG_ID + "(createCloudPBXSubscriberRainbowUser) bad or empty 'userId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(createCloudPBXSubscriberRainbowUser) bad or empty 'userId' parameter : ", userId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.createCloudPBXSubscriberRainbowUser(systemId, login, password, shortNumber, userId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(createCloudPBXSubscriberRainbowUser) Successfully deleting CloudPBX SIP Device. ");
                    that._logger.log("internal", LOG_ID + "(createCloudPBXSubscriberRainbowUser) Successfully deleting CloudPBX SIP Device : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createCloudPBXSubscriberRainbowUser) ErrorManager when deleting CloudPBX SIP Device : ", systemId, " : ", userId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createCloudPBXSubscriberRainbowUser) error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @public
     * @method getCloudPBXSIPdeviceAssignedSubscriber
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber associated to the SIP device to retrieve.
     * @param {string} deviceId Unique identifier of the SIP device to retrieve
     * @description
     *      This API allows to retrieve a given SIP device assigned to a subscriber.<br>
     * @return {Promise<any>}
     */
    getCloudPBXSIPdeviceAssignedSubscriber (systemId : string, phoneNumberId : string, deviceId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!phoneNumberId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) bad or empty 'phoneNumberId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) bad or empty 'phoneNumberId' parameter : ", phoneNumberId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!deviceId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) bad or empty 'deviceId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) bad or empty 'deviceId' parameter : ", deviceId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.getCloudPBXSIPdeviceAssignedSubscriber(systemId, phoneNumberId, deviceId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) Successfully deleting CloudPBX SIP Device. ");
                    that._logger.log("internal", LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) Successfully deleting CloudPBX SIP Device : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) ErrorManager when deleting CloudPBX SIP Device : ", systemId, " : ", phoneNumberId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) error : ", err);
                return reject(err);
            }
        });
    }
    
    
    /**
     * @public
     * @method removeCloudPBXAssociationSubscriberAndSIPdevice
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber on which the Sip device association must be deleted.
     * @param {string} deviceId Unique identifier of the SIP device to free
     * @description
     *      This API allows to remove association between subscriber and the Sip Device (SIP device becomes available for another subscriber).<br>
     * @return {Promise<any>}
     */
    removeCloudPBXAssociationSubscriberAndSIPdevice (systemId : string, phoneNumberId : string, deviceId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(removeCloudPBXAssociationSubscriberAndSIPdevice) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(removeCloudPBXAssociationSubscriberAndSIPdevice) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!phoneNumberId) {
                    this._logger.log("warn", LOG_ID + "(removeCloudPBXAssociationSubscriberAndSIPdevice) bad or empty 'phoneNumberId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(removeCloudPBXAssociationSubscriberAndSIPdevice) bad or empty 'phoneNumberId' parameter : ", phoneNumberId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!deviceId) {
                    this._logger.log("warn", LOG_ID + "(removeCloudPBXAssociationSubscriberAndSIPdevice) bad or empty 'deviceId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(removeCloudPBXAssociationSubscriberAndSIPdevice) bad or empty 'deviceId' parameter : ", deviceId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.removeCloudPBXAssociationSubscriberAndSIPdevice(systemId, phoneNumberId, deviceId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(removeCloudPBXAssociationSubscriberAndSIPdevice) Successfully deleting CloudPBX SIP Device. ");
                    that._logger.log("internal", LOG_ID + "(removeCloudPBXAssociationSubscriberAndSIPdevice) Successfully deleting CloudPBX SIP Device : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(removeCloudPBXAssociationSubscriberAndSIPdevice) ErrorManager when deleting CloudPBX SIP Device : ", systemId, " : ", phoneNumberId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(removeCloudPBXAssociationSubscriberAndSIPdevice) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getCloudPBXAllSIPdevicesAssignedSubscriber
     * @since 2.1.0
     * @instance
     * @param {string} systemId CloudPBX unique identifier.
     * @param {number} limit Allow to specify the number of SIP Devices to retrieve.
     * @param {number} offset Allow to specify the position of first SIP Device to retrieve (first one if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort SIP Devices list based on the given field.
     * @param {number} sortOrder Specify order when sorting SIP Devices list. Valid values are -1, 1.
     * @param {string} phoneNumberId Allows to filter devices according their phoneNumberId (i.e. subscriber id)      
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
     * @description
     *      This API allows  to retrieve all SIP devices assigned to a subscriber.<br>
     * @return {Promise<any>}
     */
    getCloudPBXAllSIPdevicesAssignedSubscriber ( systemId : string, limit : number = 100, offset : number, sortField : string, sortOrder : number = 1, phoneNumberId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXAllSIPdevicesAssignedSubscriber) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXAllSIPdevicesAssignedSubscriber) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.getCloudPBXAllSIPdevicesAssignedSubscriber(systemId,  limit, offset, sortField, sortOrder, phoneNumberId );
                that._logger.log("debug", "(getCloudPBXAllSIPdevicesAssignedSubscriber) - sent.");
                that._logger.log("internal", "(getCloudPBXAllSIPdevicesAssignedSubscriber) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getCloudPBXAllSIPdevicesAssignedSubscriber) Error.");
                that._logger.log("internalerror", LOG_ID + "(getCloudPBXAllSIPdevicesAssignedSubscriber) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getCloudPBXInfoAllRegisteredSIPdevicesSubscriber
     * @since 2.1.0
     * @instance
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber for which all SIP registrations must be retrieved
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
     * @description
     *      This API allows to retrieve registrations info on all devices registered for a subscriber.<br>
     * @return {Promise<any>}
     */
    getCloudPBXInfoAllRegisteredSIPdevicesSubscriber (systemId : string, phoneNumberId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!phoneNumberId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) bad or empty 'phoneNumberId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) bad or empty 'phoneNumberId' parameter : ", phoneNumberId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.getCloudPBXInfoAllRegisteredSIPdevicesSubscriber(systemId, phoneNumberId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) ErrorManager error : ", err, ' : ', systemId, " : ", phoneNumberId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) error : ", err);
                return reject(err);
            }
        });
    }
     
    /**
     * @public
     * @method assignCloudPBXSIPDeviceToSubscriber
     * @since 2.1.0
     * @instance
     * @async
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber on which the SIP device must be assigned
     * @param {string} deviceId Unique identifier of the device to assign
     * @param {string} macAddress device mac address
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
     * @description
     *      This API allows to assign a SIP device to a CloudPBX Subscriber.<br>
     *      The device must have been previously created.<br>
     *      Assigning a device to a subscriber can de done by specifying the device Id (preferred) in the request, or the device mac address.<br>
     *      Assigning a device to a subscriber can de done by specifying the device Id in the request, or the device mac address and deviceType Id.<br>
     * @return {Promise<any>}
     */
    assignCloudPBXSIPDeviceToSubscriber (systemId : string,   phoneNumberId : string,  deviceId  : string,  macAddress  : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (! phoneNumberId ) {
                    this._logger.log("warn", LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) bad or empty 'phoneNumberId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) bad or empty 'phoneNumberId' parameter : ", phoneNumberId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.assignCloudPBXSIPDeviceToSubscriber(systemId, phoneNumberId, deviceId,  macAddress);
                that._logger.log("debug", "(assignCloudPBXSIPDeviceToSubscriber) - sent.");
                that._logger.log("internal", "(assignCloudPBXSIPDeviceToSubscriber) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) Error.");
                that._logger.log("internalerror", LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getCloudPBXSubscriberCLIOptions
     * @since 2.1.0
     * @instance
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} phoneNumberId PhoneNumber unique identifier of the CloudPBX Subscriber to get (it is also its subscriber Id)
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Subscribers
     * @description
     *      This API allows to get CLI policy of a CloudPBX Subscriber.<br>
     * @return {Promise<any>}
     */
    getCloudPBXSubscriberCLIOptions (systemId : string, phoneNumberId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXSubscriberCLIOptions) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXSubscriberCLIOptions) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!phoneNumberId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXSubscriberCLIOptions) bad or empty 'phoneNumberId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXSubscriberCLIOptions) bad or empty 'phoneNumberId' parameter : ", phoneNumberId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.getCloudPBXSubscriberCLIOptions(systemId, phoneNumberId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getCloudPBXSubscriberCLIOptions) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getCloudPBXSubscriberCLIOptions) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getCloudPBXSubscriberCLIOptions) ErrorManager error : ", err, ' : ', systemId, " : ", phoneNumberId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getCloudPBXSubscriberCLIOptions) error : ", err);
                return reject(err);
            }
        });
    }


    //endregion Cloudpbx Subscribers
    //region Cloudpbx Phone Numbers

    /**
     * @public
     * @method getCloudPBXUnassignedInternalPhonenumbers
     * @since 2.1.0
     * @instance
     * @param {string} systemId CloudPBX unique identifier.
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Phone Numbers
     * @description
     *      This API allows to list all unassigned internal phone numbers for a given CloudPBX system.<br>
     * @return {Promise<any>}
     */
    getCloudPBXUnassignedInternalPhonenumbers(systemId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.getCloudPBXUnassignedInternalPhonenumbers(systemId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) ErrorManager error : ", err, ' : ', systemId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method listCloudPBXDDINumbersAssociated
     * @since 2.1.0
     * @instance
     * @param {string} systemId CloudPBX unique identifier.
     * @param {number} limit Allow to specify the number of DDI numbers to retrieve. Default : 100.
     * @param {number} offset Allow to specify the position of first DDI number to retrieve (first site if not specified) 
     * Warning: if offset > total, no results are returned
     * @param {string} sortField Sort DDI numbers list based on the given field. Default : "number"
     * @param {number} sortOrder Specify order when sorting DDI numbers list. Default : 1. Valid values : -1, 1.
     * @param {boolean} isAssignedToUser Allows to filter DDI numbers list if they are assigned to a user or not
     * @param {boolean} isAssignedToGroup Allows to filter DDI numbers list if they are assigned to a group or not (e.g. hunting group)
     * @param {boolean} isAssignedToIVR Allows to filter DDI numbers list if they are assigned to a IVR or not
     * @param {boolean} isAssignedToAutoAttendant Allows to filter DDI numbers list if they are assigned to a Auto attendant or not
     * @param {boolean} isAssigned Allows to filter DDI numbers list if they are assigned (to a user or to a group or to a IVR) or not assigned
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Phone Numbers
     * @description
     *      This API allows to get the list of DDI numbers associated to a CloudPBX.<br>
     * @return {Promise<any>}
     */
    listCloudPBXDDINumbersAssociated (systemId : string, limit : number = 100, offset : number, sortField : string = "number", sortOrder : number = 1, isAssignedToUser : boolean, isAssignedToGroup : boolean, isAssignedToIVR : boolean, isAssignedToAutoAttendant : boolean, isAssigned : boolean ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.listCloudPBXDDINumbersAssociated(systemId, limit, offset, sortField, sortOrder, isAssignedToUser, isAssignedToGroup, isAssignedToIVR, isAssignedToAutoAttendant, isAssigned).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) ErrorManager error : ", err, ' : ', systemId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method createCloudPBXDDINumber
     * @since 2.1.0
     * @instance
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} number DDI number
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Phone Numbers
     * @description
     *      This API allows to create a DDI number for a CloudPBX.<br>
     * @return {Promise<any>}
     */
    createCloudPBXDDINumber (systemId : string, number : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(createCloudPBXDDINumber) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(createCloudPBXDDINumber) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!number) {
                    this._logger.log("warn", LOG_ID + "(createCloudPBXDDINumber) bad or empty 'number' parameter");
                    this._logger.log("internalerror", LOG_ID + "(createCloudPBXDDINumber) bad or empty 'number' parameter : ", number);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.createCloudPBXDDINumber(systemId, number).then((result) => {
                    that._logger.log("debug", LOG_ID + "(createCloudPBXDDINumber) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(createCloudPBXDDINumber) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createCloudPBXDDINumber) ErrorManager error : ", err, ' : ', systemId, " : ", number);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createCloudPBXDDINumber) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteCloudPBXDDINumber
     * @since 2.1.0
     * @instance
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} phoneNumberId PhoneNumber unique identifier 
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Phone Numbers
     * @description
     *      This API allows to delete a DDI number for a CloudPBX. <br>
     *      Note : Default DDI can be deleted only if it is the last DDI of the CloudPBX. <br>
     * @return {Promise<any>}
     */
    deleteCloudPBXDDINumber (systemId : string, phoneNumberId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(deleteCloudPBXDDINumber) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(deleteCloudPBXDDINumber) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!phoneNumberId) {
                    this._logger.log("warn", LOG_ID + "(deleteCloudPBXDDINumber) bad or empty 'phoneNumberId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(deleteCloudPBXDDINumber) bad or empty 'phoneNumberId' parameter : ", phoneNumberId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.deleteCloudPBXDDINumber(systemId, phoneNumberId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(deleteCloudPBXDDINumber) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(deleteCloudPBXDDINumber) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteCloudPBXDDINumber) ErrorManager error : ", err, ' : ', systemId, " : ", phoneNumberId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(deleteCloudPBXDDINumber) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method associateCloudPBXDDINumber
     * @since 2.1.0
     * @instance
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} phoneNumberId PhoneNumber unique identifier
     * @param {string} userId Rainbow user unique identifier
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Phone Numbers
     * @description
     *      This API allows to associate a DDI number to a Rainbow user. <br>
     * @return {Promise<any>}
     */
    associateCloudPBXDDINumber (systemId : string, phoneNumberId : string, userId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(associateCloudPBXDDINumber) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(associateCloudPBXDDINumber) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!phoneNumberId) {
                    this._logger.log("warn", LOG_ID + "(associateCloudPBXDDINumber) bad or empty 'phoneNumberId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(associateCloudPBXDDINumber) bad or empty 'phoneNumberId' parameter : ", phoneNumberId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!userId) {
                    this._logger.log("warn", LOG_ID + "(associateCloudPBXDDINumber) bad or empty 'userId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(associateCloudPBXDDINumber) bad or empty 'userId' parameter : ", userId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.associateCloudPBXDDINumber(systemId, phoneNumberId, userId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(associateCloudPBXDDINumber) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(associateCloudPBXDDINumber) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(associateCloudPBXDDINumber) ErrorManager error : ", err, ' : ', systemId, " : ", phoneNumberId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(associateCloudPBXDDINumber) error : ", err);
                return reject(err);
            }
        });
    }
    
    
    /**
     * @public
     * @method disassociateCloudPBXDDINumber
     * @since 2.1.0
     * @instance
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} phoneNumberId PhoneNumber unique identifier.
     * @param {string} userId Rainbow user unique identifier.
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Phone Numbers
     * @description
     *      This API allows to disassociate a DDI number from a Rainbow user. <br>
     * @return {Promise<any>}
     */
    disassociateCloudPBXDDINumber (systemId : string, phoneNumberId : string, userId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(disassociateCloudPBXDDINumber) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(disassociateCloudPBXDDINumber) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!phoneNumberId) {
                    this._logger.log("warn", LOG_ID + "(disassociateCloudPBXDDINumber) bad or empty 'phoneNumberId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(disassociateCloudPBXDDINumber) bad or empty 'phoneNumberId' parameter : ", phoneNumberId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!userId) {
                    this._logger.log("warn", LOG_ID + "(disassociateCloudPBXDDINumber) bad or empty 'userId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(disassociateCloudPBXDDINumber) bad or empty 'userId' parameter : ", userId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.disassociateCloudPBXDDINumber(systemId, phoneNumberId, userId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(disassociateCloudPBXDDINumber) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(disassociateCloudPBXDDINumber) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(disassociateCloudPBXDDINumber) ErrorManager error : ", err, ' : ', systemId, " : ", phoneNumberId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(disassociateCloudPBXDDINumber) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method setCloudPBXDDIAsdefault
     * @since 2.1.0
     * @instance
     * @param {string} systemId CloudPBX unique identifier.
     * @param {string} phoneNumberId PhoneNumber unique identifier.
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx Phone Numbers
     * @description
     *      This API allows to set a DDI number as default DDI for a CloudPBX. <br>
     * @return {Promise<any>}
     */
    setCloudPBXDDIAsdefault (systemId : string, phoneNumberId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(setCloudPBXDDIAsdefault) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(setCloudPBXDDIAsdefault) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!phoneNumberId) {
                    this._logger.log("warn", LOG_ID + "(setCloudPBXDDIAsdefault) bad or empty 'phoneNumberId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(setCloudPBXDDIAsdefault) bad or empty 'phoneNumberId' parameter : ", phoneNumberId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.setCloudPBXDDIAsdefault(systemId, phoneNumberId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(setCloudPBXDDIAsdefault) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(setCloudPBXDDIAsdefault) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(setCloudPBXDDIAsdefault) ErrorManager error : ", err, ' : ', systemId, " : ", phoneNumberId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(setCloudPBXDDIAsdefault) error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Cloudpbx Phone Numbers
    
    //region Cloudpbx SIP Trunk

    /**
     * @public
     * @method retrieveExternalSIPTrunkById
     * @since 2.1.0
     * @instance
     * @async
     * @param {string} externalTrunkId External trunk unique identifier
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx SIP Trunk
     * @description
     *      This API allows to retrieve an external SIP trunk using its identifier. <br>
     * @return {Promise<any>}
     */
    retrieveExternalSIPTrunkById (externalTrunkId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!externalTrunkId) {
                    this._logger.log("warn", LOG_ID + "(retrieveExternalSIPTrunkById) bad or empty 'externalTrunkId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(retrieveExternalSIPTrunkById) bad or empty 'externalTrunkId' parameter : ", externalTrunkId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.retrieveExternalSIPTrunkById(externalTrunkId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(retrieveExternalSIPTrunkById) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(retrieveExternalSIPTrunkById) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(retrieveExternalSIPTrunkById) ErrorManager error : ", err, ' : ', externalTrunkId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(retrieveExternalSIPTrunkById) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method retrievelistExternalSIPTrunks
     * @since 2.1.0
     * @instance
     * @async
     * @category Rainbow Voice Communication Platform Provisioning - Cloudpbx SIP Trunk
     * @param {string} rvcpInstanceId Allows to filter external SIP trunks by RVCP instance identifier. <br>
     *          This filter allows to load all external SIP trunks in relation with an RVCP Instance. <br>
     * @param {string} status Allows to filter external SIP trunks by status. <br>
     *          This filter allows to load all external SIP trunks according to their status. <br>
     *          Valid values : "new" "active". <br>
     * @param {string} trunkType Allows to filter external SIP trunks by their type. <br>
     * @description
     *      This API allows superadmin or bp_admin to retrieve a list of external SIP trunks. <br>
     *      bp_admin can list only external SIP trunks he is allowed to use. <br>
     * @return {Promise<any>}
     */
    retrievelistExternalSIPTrunks (rvcpInstanceId : string, status : string, trunkType : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.retrievelistExternalSIPTrunks (rvcpInstanceId, status, trunkType).then((result) => {
                    that._logger.log("debug", LOG_ID + "(retrievelistExternalSIPTrunks) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(retrievelistExternalSIPTrunks) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(retrievelistExternalSIPTrunks) ErrorManager error : ", err, ' : ', rvcpInstanceId, " : ", status, " : ", trunkType);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(retrievelistExternalSIPTrunks) error : ", err);
                return reject(err);
            }
        });
    }
    
    //endregion Cloudpbx SIP Trunk
    
    //endregion Rainbow Voice Communication Platform Provisioning 

    //region Sites

    /**
     * @public
     * @method createASite
     * @since 2.1.1
     * @instance
     * @async
     * @category sites
     * @param {string} name Site name. <br>
     *              Valid values : 1..255
     * @param {string} status Site status. <br>
     *          Valid values : "active", "alerting", "hold", "terminated". <br>
     * @param {string} companyId Id of the company from which the site is linked.
     * @description
     *      This API allows administrators to create a site for a company they administrate.  <br>
     * @return {Promise<any>}
     */
    createASite(name : string, status : string, companyId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (!name) {
                    this._logger.log("warn", LOG_ID + "(createASite) bad or empty 'name' parameter");
                    this._logger.log("internalerror", LOG_ID + "(createASite) bad or empty 'name' parameter : ", name);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!companyId) {
                    this._logger.log("warn", LOG_ID + "(createASite) bad or empty 'companyId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(createASite) bad or empty 'companyId' parameter : ", companyId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.createASite (name, status, companyId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(createASite) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(createASite) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createASite) ErrorManager error : ", err, ' : ', name, " : ", status, " : ", companyId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createASite) error : ", err);
                return reject(err);
            }
        }); 
    }

    /**
     * @public
     * @method deleteSite
     * @since 2.1.1
     * @instance
     * @async
     * @category sites
     * @param {string} siteId Site id. <br>
     * @description
     *      This API allows administrators to delete a site by id they administrate.  <br>
     * @return {Promise<any>}
     */
    deleteSite (siteId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!siteId) {
                    this._logger.log("warn", LOG_ID + "(deleteSite) bad or empty 'siteId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(deleteSite) bad or empty 'siteId' parameter : ", siteId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
                
                that._rest.deleteSite (siteId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(deleteSite) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(deleteSite) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteSite) ErrorManager error : ", err, ' : ', siteId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(deleteSite) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getSiteData
     * @since 2.1.1
     * @instance
     * @async
     * @category sites
     * @param {string} siteId Site id. <br>
     * @description
     *      This API allows administrators to get a site data by id they administrate.  <br>
     * @return {Promise<any>}
     */
    getSiteData (siteId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!siteId) {
                    this._logger.log("warn", LOG_ID + "(getSiteData) bad or empty 'siteId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getSiteData) bad or empty 'siteId' parameter : ", siteId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.getSiteData (siteId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getSiteData) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getSiteData) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getSiteData) ErrorManager error : ", err, ' : ', siteId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getSiteData) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllSites
     * @since 2.1.1
     * @instance
     * @async
     * @category sites
     * @param {string} format Allows to retrieve more or less site details in response. <br>
     * - small: _id, name <br>
     * - medium: _id, name, status, companyId <br>
     * - full: all site fields <br>
     * default : small <br>
     * Valid values : small, medium, full <br>
     * @param {number} limit Allow to specify the number of companies to retrieve. (default=100).
     * @param {number} offset Allow to specify the position of first site to retrieve (first site if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort site list based on the given field. (default="name").
     * @param {number} sortOrder Specify order when sorting site list. Default values : 1. Valid values : -1, 1.
     * @param {string} name Allows to filter sites list on field name. <br>
     * The filtering is case insensitive and on partial name match: all sites containing the provided name value will be returned (whatever the position of the match). <br>
     * Ex: if filtering is done on sit, sites with the following names are match the filter 'My site', 'Site', 'A site 1', 'Site of company', 'Sit1', 'Sit2', ... <br>
     * @param {string} companyId
     * @description
     *      This API allows administrators to get all sites they administrate.  <br>
     * @return {Promise<any>}
     */
    getAllSites (format = "small", limit = 100, offset = 0, sortField="name", sortOrder : number, name : string, companyId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getAllSites (format, limit, offset, sortField, sortOrder, name, companyId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getAllSites) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getAllSites) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getAllSites) ErrorManager error : ", err, ' : ', companyId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllSites) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method updateSite
     * @since 2.1.1
     * @instance
     * @category sites
     * @async
     * @param {string} siteId Site id. <br>
     * @param {string} name Site name
     * @param {string} status Site status. Valid values : "active", "alerting", "hold", "terminated"
     * @param {string} companyId Id of the company from which the site is linked.
     * @description
     *      This API allows administrators to update a given site by id they administrate.  <br>
     * @return {Promise<any>}
     */
    updateSite (siteId : string, name : string, status : string, companyId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!siteId) {
                    this._logger.log("warn", LOG_ID + "(updateSite) bad or empty 'siteId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(updateSite) bad or empty 'siteId' parameter : ", siteId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
                
                that._rest.updateSite (siteId, name, status, companyId ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(updateSite) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(updateSite) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(updateSite) ErrorManager error : ", err, ' : ', siteId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(updateSite) error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Sites

    //region systems

    /**
     * @public
     * @method getASystemPhoneNumber
     * @since 2.20.0
     * @instance
     * @category systems
     * @async
     * @param {string} systemId System unique identifier
     * @param {string} phoneNumberId PhoneNumber unique identifier
     * @description
     *      This API allows to retrieve a specific phoneNumber associated to a given system (pbx).<br>
     *      Users with superadmin or support role can retrieve phoneNumbers from any system.<br>
     *      bp_admin can only retrieve phoneNumbers linked to systems of End Customer companies for which their bp_admin's company is the BP company.<br>
     *      Users with admin role (and not having superadmin nor support role) can only retrieve phoneNumbers of systems that they manage.<br>
     *      In a Multi-Layer organization that describes a hierarchy including ORGANIZATIONS/COMPANIES/SITES/SYSTEMS, an admin role of a upper layer is allowed to see systems within their's reach. <br>
     *   
     * @return {Promise<any>} An object of the result
     * 
     *
     *    | Champ | Type | Description |
     *    | --- | --- | --- |
     *    | id  | String | Phone number unique identifier |
     *    | shortNumber | String | Short phone number (corresponds to the number monitored by PCG).  <br>Only usable within the same PBX.  <br>shortNumber can contain alpha-numeric characters and some special characters. The regular expression validating the shortNumber data is the following: `/^[0-9A-Za-z #\-\+\*\(\)\./]{1,32}$/` |
     *    | internalNumber | String | Internal phone number.  <br>Usable within a PBX group.  <br>internalNumber can contain alpha-numeric characters and some special characters. The regular expression validating the internalNumber data is the following: `/^[0-9A-Za-z #\-\+\*\(\)\./]{1,32}$/` |
     *    | voiceMailNumber optionnel | String | Voice mail phone number  <br>voiceMailNumber can contain alpha-numeric characters and some special characters. The regular expression validating the voiceMailNumber data is the following: `/^[0-9A-Za-z #\-\+\*\(\)\./]{1,32}$/` |
     *    | number optionnel | String | DDI phone number |
     *    | numberE164 optionnel | String | E.164 phone number (computed by server if number is set) |
     *    | pbxUserId | String | Pbx's user Id |
     *    | userId optionnel | String | Rainbow userId to which the phone number is linked |
     *    | jid_im | String | jid_im of the Rainbow user to which the phone number is linked |
     *    | jid_tel | String | jid_tel of the Rainbow user to which the phone number is linked |
     *    | jid_password | String | jid_password of the Rainbow user to which the phone number is linked |
     *    | rainbowNumber optionnel | String | Rainbow number of the Rainbow user to which the phone number is linked |
     *    | country optionnel | String | Phone number country (ISO 3166-1 alpha3 format)  <br>Country field is automatically computed using the following algorithm:<br><br>* If `number` is provided and is in E164 format, `country` is computed from this E164 number<br>* Else if phoneNumber is assigned to a user, user's `country` is used<br>* Else, system's `country` is used |
     *    | type optionnel | String | Phone number type, one of `home`, `work`, `other` |
     *    | deviceType optionnel | String | Phone number device type, one of `landline`, `mobile`, `fax`, `other` |
     *    | isFromSystem optionnel | String | Boolean indicating if the phoneNumber is linked to a system (pbx) |
     *    | pbxId | String | pbx unique identifier |
     *    | firstName | String | firstname |
     *    | lastName | String | lastname |
     *    | deviceName | String | devicename |
     *    | systemId optionnel | String | System unique identifier |
     *    | isMonitored | Boolean | Specifies if the PhoneNumber is monitored by agent (i.e. telephony events are notified to Rainbow user through XMPP) |
     *    | isNomadic optionnel | Boolean | Specifies if Nomadic set is selected. |
     *    | isVoipNomadic optionnel | Boolean | Specifies if Nomadic destination is VoIP. |
     *    | isNomadicModeInitialized optionnel | Boolean | Nomadic feature: when true, at least one login or logout has been done. PCG reserved. |
     *    | userType optionnel | String | The userType is ACD data from the OXE. PCG reserved. |
     *
     * 
     */
    getASystemPhoneNumber (systemId : string, phoneNumberId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getASystemPhoneNumber) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getASystemPhoneNumber) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
                if (!phoneNumberId) {
                    this._logger.log("warn", LOG_ID + "(getASystemPhoneNumber) bad or empty 'phoneNumberId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getASystemPhoneNumber) bad or empty 'phoneNumberId' parameter : ", phoneNumberId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.getASystemPhoneNumber ( systemId, phoneNumberId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getASystemPhoneNumber) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getASystemPhoneNumber) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getASystemPhoneNumber) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getASystemPhoneNumber) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllSystemPhoneNumbers
     * @since 2.20.0
     * @instance
     * @category systems
     * @async
     * @param {string} systemId System unique identifier
     * @param {string} shortNumber Allow to filter phoneNumbers list on phoneNumbers having shortNumber field starting with the provided value.
     * @param {string} internalNumber Allow to filter phoneNumbers list on phoneNumbers having internalNumber field starting with the provided value.
     * @param {string} pbxUserId Allow to filter phoneNumbers list on phoneNumbers having pbxUserId field equal to provided value.
     * @param {string} companyPrefix When the system is a centrex server (multi-tenant OXE or third_party), allow to filter phoneNumbers list on companyPrefix. </BR>
     * The companyPrefix value to set is named 'tenantCallNumber' in companies data model. </BR>
     * Example: companyPrefix=8210: return all phoneNumbers having the prefix 8210, then allocated to the company having the 'tenantCallNumber' 8210 (exact match) </BR>
     * @param {boolean} isMonitored Allow to filter phoneNumbers list on phoneNumbers having isMonitored field equal to provided value. Possible values : true, false
     * @param {string} name Allow to filter phoneNumbers list on phoneNumbers having firstName or lastName starting with the provided value.
     * @param {string} deviceName Allow to filter phoneNumbers list on phoneNumbers having deviceName field equal to provided value.
     * @param {boolean} isAssignedToUser Allow to filter phoneNumbers list on phoneNumbers being assigned or not to a Rainbow user, according to provided value. true: return all phoneNumbers having userId !== null. false: return all phoneNumbers having userId === null. Possible values : true, false
     * @param {string} format Allows to retrieve more or less phone numbers details in response. </br>
     *   - small: id shortNumber internalNumber numberE164 </br>
     *   - medium: id shortNumber internalNumber voiceMailNumber number numberE164 isFromSystem pbxId systemId </br>
     *   - full: all phone numbers fields </br>
     *   </br>
     *   Default value : small. Possible values : small, medium, full </br>
     * @param {number} limit Allow to specify the number of phone numbers to retrieve. Default value : 100
     * @param {number} offset Allow to specify the position of first phone number to retrieve (first phone number if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort phone numbers list based on the given field. Default value : shortNumber
     * @param {number} sortOrder Specify order when sorting phone numbers list. Default value : 1 . Possible values : -1, 1 .
     * @description
     *  This API allows to list all phoneNumbers associated to a given system (pbx).<br>
     *    
     *  Users with superadmin or support role can retrieve phoneNumbers from any system.<br>
     *  bp_admin can only retrieve phoneNumbers linked to systems of End Customer companies for which their bp_admin's company is the BP company.<br>
     *  Users with admin role (and not having superadmin nor support role) can only retrieve phoneNumbers of systems that they manage.<br>
     *  In a Multi-Layer organization that describes a hierarchy including ORGANIZATIONS/COMPANIES/SITES/SYSTEMS, an admin role of a upper layer is allowed to see systems within their's reach.<br>
     *  :<br>
     *  Notes:<br>
     *  systemId field returned in response corresponds to portal's internal mongoDB id, while pbxId is the id handled by PCG.<br>
     *  This API is paginated.<br>
     *  phoneNumbers list can be filtered on the following fields:<br>
     *  shortNumber: allow to retrieve only phoneNumbers starting by the provided value.<br>
     *  Example: shortNumber=123<br>
     *  internalNumber: allow to retrieve only phoneNumbers starting by the provided value.<br>
     *  Example: internalNumber=123<br>
     *  pbxUserId: allow to retrieve only phoneNumbers having the provided pbxUserId value.<br>
     *  Example: pbxUserId=123<br>
     *  isMonitored: allow to retrieve only phoneNumbers for which monitoring in Rainbow application is activated (true) or deactivated (false).<br>
     *  Example: isMonitored=true<br>
     *  isAssignedToUser: allow to retrieve only phoneNumbers being associated (true) or not (false) to a Rainbow user.<br>
     *  Example: isAssignedToUser=true<br>
     *  userId: allow to retrieve only phoneNumbers being associated to the requested Rainbow user id.<br>
     *  Example: userId=57960e4fa1ab69c4243415b1<br>
     *  companyPrefix: allow to retrieve only phoneNumbers having the provided companyPrefix value. See below 'Sharing a system between several companies'<br>
     *  Example: companyPrefix=8210 This filter is not taken in account for role admin.<br>
     *  Filters can be combined. <br>
     *
     * @return {Promise<any>} An object of the result
     *
     */
    getAllSystemPhoneNumbers (systemId: string, shortNumber? : string, internalNumber ? :string, pbxUserId ? :string, companyPrefix? :string, isMonitored ? :boolean, name ? : string, deviceName ? : string, isAssignedToUser ? :boolean, format : string = "small", limit : number = 100, offset ? : number, sortField : string ="shortNumber", sortOrder : number = 1) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getASystemPhoneNumber) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getASystemPhoneNumber) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.getAllSystemPhoneNumbers ( systemId, shortNumber , internalNumber , pbxUserId , companyPrefix, isMonitored , name , deviceName , isAssignedToUser , format , limit , offset , sortField , sortOrder ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getAllSystemPhoneNumbers) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getAllSystemPhoneNumbers) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getAllSystemPhoneNumbers) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllSystemPhoneNumbers) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method updateASystemPhoneNumber
     * @since 2.20.0
     * @instance
     * @category systems
     * @async
     * @param {string} systemId System unique identifier
     * @param {string} phoneNumberId PhoneNumber unique identifier
     * @param {boolean} isMonitored Specifies if the PhoneNumber is monitored by agent (i.e. telephony events are notified to Rainbow user through XMPP)
     * @param {string} userId Rainbow userId to which is linked the phoneNumber
     * @param {string} internalNumber Internal phone number. Usable within a PBX group. By default, it is equal to shortNumber. </BR>
     * internalNumber must be unique in the whole system group to which the related PhoneNumber belong (an error 409 is raised if someone tries to update internalNumber to a number already used by another PhoneNumber in the same system group).
     * @param {string} number Raw phone number (DDI) Note: If numberE164 can't be computed from number and computed country fields, an error 400 is returned (ex: wrong phone number, phone number not matching country code, ...)
     * @param {string} type Phone number type. Default value : work. Possible values : home, work, other
     * @param {string} deviceType Phone number device type. Default value : landline. Possible values : landline, mobile, fax, other
     * @param {string} firstName first name
     * @param {string} lastName last name
     * @param {string} deviceName device name
     * @param {boolean} isVisibleByOthers Allow user to choose if the phone number is visible by other users or not. </BR>
     * Note that administrators can see all the phone numbers, even if isVisibleByOthers is set to false. </BR>
     * Note that phone numbers linked to a system (isFromSystem=true) are always visible, isVisibleByOthers can't be set to false for these numbers. </BR>
     * @description
     *   This API allows to update a phone number for a given system (pbx). <br>
     *   It can be used to link a system phoneNumber to a Rainbow user by setting userId parameter. If userId parameter is provided, jid_im, jid_tel, jid_password and rainbowNumber of the corresponding user are automatically set in phoneNumber. <br>
     *   It can also be used to enable monitoring of this phoneNumber by PCG (set isMonitored parameter to true). <br>
     *   Note that pbxId, systemId, shortNumber and pbxUserId can't be modified. <br>
     *
     * @return {Promise<any>} An object of the result
     *
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Phone number unique identifier |
     * | shortNumber | String | Short phone number (corresponds to the number monitored by PCG).  <br>Only usable within the same PBX.  <br>shortNumber can contain alpha-numeric characters and some special characters. The regular expression validating the shortNumber data is the following: `/^[0-9A-Za-z #\-\+\*\(\)\./]{1,32}$/` |
     * | internalNumber | String | Internal phone number.  <br>Usable within a PBX group.  <br>internalNumber can contain alpha-numeric characters and some special characters. The regular expression validating the internalNumber data is the following: `/^[0-9A-Za-z #\-\+\*\(\)\./]{1,32}$/` |
     * | voiceMailNumber optionnel | String | Voice mail phone number  <br>voiceMailNumber can contain alpha-numeric characters and some special characters. The regular expression validating the voiceMailNumber data is the following: `/^[0-9A-Za-z #\-\+\*\(\)\./]{1,32}$/` |
     * | number optionnel | String | DDI phone number |
     * | numberE164 optionnel | String | E.164 phone number (computed by server if number is set) |
     * | pbxUserId | String | Pbx's user Id |
     * | userId optionnel | String | Rainbow userId to which the phone number is linked |
     * | jid_im | String | jid_im of the Rainbow user to which the phone number is linked |
     * | jid_tel | String | jid_tel of the Rainbow user to which the phone number is linked |
     * | jid_password | String | jid_password of the Rainbow user to which the phone number is linked |
     * | rainbowNumber optionnel | String | Rainbow number of the Rainbow user to which the phone number is linked |
     * | country optionnel | String | Phone number country (ISO 3166-1 alpha3 format)  <br>Country field is automatically computed using the following algorithm:<br><br>* If `number` is provided and is in E164 format, `country` is computed from this E164 number<br>* Else if phoneNumber is assigned to a user, user's `country` is used<br>* Else, system's `country` is used |
     * | type optionnel | String | Phone number type, one of `home`, `work`, `other` |
     * | deviceType optionnel | String | Phone number device type, one of `landline`, `mobile`, `fax`, `other` |
     * | isFromSystem optionnel | String | Boolean indicating if the phoneNumber is linked to a system (pbx) |
     * | pbxId | String | pbx unique identifier |
     * | firstName | String | firstname |
     * | lastName | String | lastname |
     * | deviceName | String | devicename |
     * | systemId optionnel | String | System unique identifier |
     * | isMonitored | Boolean | Specifies if the PhoneNumber is monitored by agent (i.e. telephony events are notified to Rainbow user through XMPP) |
     * | isNomadic optionnel | Boolean | Specifies if Nomadic set is selected. |
     * | isVoipNomadic optionnel | Boolean | Specifies if Nomadic destination is VoIP. |
     * | isNomadicModeInitialized optionnel | Boolean | Nomadic feature: when true, at least one login or logout has been done. PCG reserved. |
     * | userType optionnel | String | The userType is ACD data from the OXE. PCG reserved. |
     * 
     * 
     */
    updateASystemPhoneNumber(systemId : string, phoneNumberId : string, isMonitored ? : boolean, userId ? : string, internalNumber ? : string,
                             number ? : string, type ? : string, deviceType ? : string, firstName ? : string, lastName ? : string, deviceName ? : string, isVisibleByOthers ? : boolean ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(updateASystemPhoneNumber) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(updateASystemPhoneNumber) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                if (!phoneNumberId) {
                    this._logger.log("warn", LOG_ID + "(updateASystemPhoneNumber) bad or empty 'phoneNumberId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(updateASystemPhoneNumber) bad or empty 'phoneNumberId' parameter : ", phoneNumberId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.updateASystemPhoneNumber ( systemId,  phoneNumberId , isMonitored , userId , internalNumber ,
                        number , type , deviceType , firstName , lastName , deviceName , isVisibleByOthers  ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(updateASystemPhoneNumber) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(updateASystemPhoneNumber) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(updateASystemPhoneNumber) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(updateASystemPhoneNumber) error : ", err);
                return reject(err);
            }
        });
    }


    //endregion systems
    
    //region Rainbow Company Directory Portal 
    // https://api.openrainbow.org/directory/
    //region directory
    /**
     * @public
     * @method createDirectoryEntry
     * @since 2.2.0
     * @instance
     * @async
     * @category Rainbow Company Directory portal - directory
     * @param {string} companyId Id of the company the directory is linked to.
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
     *      This API allows administrators to Create a directory entry.  <br>
     */
    createDirectoryEntry ( companyId : string,
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
                if (!companyId) {
                    this._logger.log("warn", LOG_ID + "(createDirectoryEntry) bad or empty 'companyId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(createDirectoryEntry) bad or empty 'companyId' parameter : ", companyId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.createDirectoryEntry ( companyId,
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
                    that._logger.log("debug", LOG_ID + "(createDirectoryEntry) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(createDirectoryEntry) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createDirectoryEntry) ErrorManager error : ", err, ' : ', companyId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createDirectoryEntry) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteCompanyDirectoryAllEntry
     * @since 2.2.0
     * @instance
     * @async
     * @category Rainbow Company Directory portal - directory
     * @param {string} companyId Id of the company.
     * @description
     *      This API allows administrators  to delete all the entries in the directory of a company they administrate.<br>
     * @return {Promise<any>}
     */
    deleteCompanyDirectoryAllEntry (companyId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!companyId) {
                    this._logger.log("warn", LOG_ID + "(deleteCompanyDirectoryAllEntry) bad or empty 'companyId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(deleteCompanyDirectoryAllEntry) bad or empty 'companyId' parameter : ", companyId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.deleteCompanyDirectoryAllEntry (companyId ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(deleteCompanyDirectoryAllEntry) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(deleteCompanyDirectoryAllEntry) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteCompanyDirectoryAllEntry) ErrorManager error : ", err, ' : ', companyId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(deleteCompanyDirectoryAllEntry) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteDirectoryEntry
     * @since 2.2.0
     * @instance
     * @async
     * @category Rainbow Company Directory portal - directory
     * @param {string} entryId Id of the entry.
     * @description
     *      This API allows administrators  to delete an entry from the directory of a company they administrate.<br>
     * @return {Promise<any>}
     */
    deleteDirectoryEntry (entryId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!entryId) {
                    this._logger.log("warn", LOG_ID + "(deleteDirectoryEntry) bad or empty 'entryId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(deleteDirectoryEntry) bad or empty 'entryId' parameter : ", entryId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.deleteDirectoryEntry (entryId ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(deleteDirectoryEntry) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(deleteDirectoryEntry) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteDirectoryEntry) ErrorManager error : ", err, ' : ', entryId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(deleteDirectoryEntry) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getDirectoryEntryData
     * @since 2.2.0
     * @instance
     * @async
     * @category Rainbow Company Directory portal - directory
     * @param {string} entryId Id of the entry.
     * @param {string} format Allows to retrieve more or less entry details in response. <br>
     * - small: id, firstName, lastName  <br>
     * - medium: id, companyId, firstName, lastName, workPhoneNumbers  <br>
     * - full: all fields. <br>
     * default : small <br>
     * Valid values : small, medium, full <br>
     * @description
     *      This API allows administrators to get an entry of the directory of a company they administrate.<br>
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
     * @method getListDirectoryEntriesData
     * @since 2.2.0
     * @instance
     * @async
     * @category Rainbow Company Directory portal - directory
     * @param {string} companyId Allows to filter the list of directory entries on the companyIds provided in this option
     * @param {string} organisationIds Allows to filter the list of directory entries on the organisationIds provided in this option
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
     *   This API allows users to get an entry of the directory of a company they administrate.<br>
     *   superadmin and support can get a directory entry of all companies.<br>
     *   bp_admin can only get a directory entry of their own companies or their End Customer companies.<br>
     *   organization_admin can only get a directory entry of the companies under their organization.<br>
     *   other users can only get a directory entry of their onw companies (and companies visible in their organisation if any). users can get the entries of their own directory too.<br>
     *   <br>
     *   name, phoneNumbers, search and tags parameters are exclusives.
     * @return {Promise<any>}
     * <br>
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object\[\] | Data objects |
     * | id  | string | Directory entry identifier |
     * | companyId optionnel | string | Id of the company |
     * | userId optionnel | string | Id of the user |
     * | type | string | Type of the directory entry<br>* `user` if firstName and/or lastName are filled,<br>* `company` if only companyName is filled (firstName and lastName empty)<br>Possible values : `user`, `company` |
     * | firstName optionnel | string | Contact First name<br>Ordre de grandeur : `0..255` |
     * | lastName optionnel | string | Contact Last name<br>Ordre de grandeur : `0..255` |
     * | companyName optionnel | string | Company Name of the contact<br>Ordre de grandeur : `0..255` |
     * | department optionnel | string | Contact address: Department<br>Ordre de grandeur : `0..255` |
     * | street optionnel | string | Contact address: Street<br>Ordre de grandeur : `0..255` |
     * | city optionnel | string | Contact address: City<br>Ordre de grandeur : `0..255` |
     * | state optionnel | string | When country is 'USA' or 'CAN', a state should be defined. Else it is not managed. Allowed values: "AK", "AL", "....", "NY", "WY" |
     * | postalCode optionnel | string | Contact address: postal code / ZIP<br>Ordre de grandeur : `0..64` |
     * | country optionnel | string | Contact address: country (ISO 3166-1 alpha3 format) |
     * | workPhoneNumbers optionnel | string\[\] | Work phone numbers (E164 format)<br>Ordre de grandeur : `0..32` |
     * | mobilePhoneNumbers optionnel | string\[\] | Mobile phone numbers (E164 format)<br>Ordre de grandeur : `0..32` |
     * | otherPhoneNumbers optionnel | string\[\] | other phone numbers (E164 format)<br>Ordre de grandeur : `0..32` |
     * | jobTitle optionnel | string | Contact Job title<br>Ordre de grandeur : `0..255` |
     * | eMail optionnel | string | Contact Email address<br>Ordre de grandeur : `0..255` |
     * | tags optionnel | string\[\] | An Array of free tags<br>Ordre de grandeur : `1..64` |
     * | custom1 optionnel | string | Custom field 1<br>Ordre de grandeur : `0..255` |
     * | custom2 optionnel | string | Custom field 2<br>Ordre de grandeur : `0..255` |
     * 
     * 
     */
    getListDirectoryEntriesData (companyId : string,
                                 organisationIds : string,
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

                that._rest.getListDirectoryEntriesData (companyId, organisationIds, name, search, type, companyName, phoneNumbers, fromUpdateDate, toUpdateDate, tags, format, limit, offset, sortField, sortOrder, view ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getListDirectoryEntriesData) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getListDirectoryEntriesData) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getListDirectoryEntriesData) ErrorManager error : ", err, ' : ', companyId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getListDirectoryEntriesData) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method updateDirectoryEntry
     * @since 2.2.0
     * @instance
     * @async
     * @category Rainbow Company Directory portal - directory
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
     *      This API allows administrators to update an entry of the directory of a company they administrate.<br>
     * @return {Promise<any>}
     */
    updateDirectoryEntry  (entryId : string, 
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
                           custom2 : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!entryId) {
                    this._logger.log("warn", LOG_ID + "(updateDirectoryEntry) bad or empty 'entryId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(updateDirectoryEntry) bad or empty 'entryId' parameter : ", entryId);
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
                    that._logger.log("debug", LOG_ID + "(updateDirectoryEntry) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(updateDirectoryEntry) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(updateDirectoryEntry) ErrorManager error : ", err, ' : ', entryId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(updateDirectoryEntry) error : ", err);
                return reject(err);
            }
        });
    }

    /********************************************************/
    /** EXPORT CSV                                         **/
    /********************************************************/
    // Private
    getAllDirectoryContacts(companyId) {
        let that = this;
        const limit = 1000; // maximum of entries that can be requested to the server
        return new Promise(function (resolve, reject) {
            let result;
            // Get first page of entries and the total number of entries to retrieve
            that.getListDirectoryEntriesData(companyId, null, null, null, null, null, null, null, null, null, null, limit, 0, "firstname", 1)
                    .then(function (response: any) {
                        result = response;
                        result.contacts = response.data;
                        if (response.total > response.limit) {
                            const totalPages = Math.ceil(response.total / limit);

                            // List of page numbers to get (remove first page that was already gotten)
                            let pages = Array.apply(null, Array(totalPages - 1));
                            pages = pages.map(function (__unused, index) {
                                return index + 2;
                            }); // fill array with page numbers to request

                            // Serialize promises by chunks (avoids more requests than the server can handle)
                            const chunks = [];
                            while (pages.length > 0) {
                                chunks.push(pages.splice(0, 5));
                            } // chunk size must be less than 10 to avoid internal system error

                            return chunks.reduce(function (promiseChain, requests) {
                                // Parallelize chunks
                                return promiseChain.then(function () {
                                    const promisesArray = requests.map(function (page) {
                                        let offset = (limit * (page - 1));
                                        return that.getListDirectoryEntriesData(companyId, null, null, null, null, null, null, null, null, null, null, limit, offset, null, null).then(function (data: any) {
                                            result.contacts = result.contacts.concat(data.data);
                                            result.limit += data.limit;
                                        });
                                    });
                                    // return chain
                                    return Promise.all(promisesArray);
                                });
                            }, Promise.resolve());
                        }
                    })
                    .then(function () {
                        resolve(result);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
        });
    }

    // Private
    buildDirectoryCsvBlob(companyId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log("internal", LOG_ID + "[companyDirectoryService] === buildDirectoryCsvBlob ===");

            that.getAllDirectoryContacts(companyId)
                    .then(function (result: any) {
                        // Find number of csv's "workPhoneNumber" columns "mobilePhoneNumber" and "otherPhoneNumber" columns (at least workPhoneNumber0, mobilePhoneNumber0 and otherPhoneNumber0)
                        const maxWorkPhoneNumbers = Math.max(1, result.contacts.reduce(function (max, contact) {
                            return Math.max(max, contact.workPhoneNumbers ? contact.workPhoneNumbers.length:0);
                        }, 0));
                        const maxMobilePhoneNumbers = Math.max(1, result.contacts.reduce(function (max, contact) {
                            return Math.max(max, contact.mobilePhoneNumbers ? contact.mobilePhoneNumbers.length:0);
                        }, 0));
                        const maxOtherPhoneNumbers = Math.max(1, result.contacts.reduce(function (max, contact) {
                            return Math.max(max, contact.otherPhoneNumbers ? contact.otherPhoneNumbers.length:0);
                        }, 0));
                        const csvWorkPhonesColumns = Array.apply(null, new Array(maxWorkPhoneNumbers)).map(function (val, i) {
                            return "workPhoneNumber" + i;
                        });
                        const csvWorkPhonesExtraSeparators = Array.apply(null, new Array(maxWorkPhoneNumbers)).map(function () {
                            return ";";
                        });
                        const csvMobilePhonesColumns = Array.apply(null, new Array(maxMobilePhoneNumbers)).map(function (val, i) {
                            return "mobilePhoneNumber" + i;
                        });
                        const csvMobilePhonesExtraSeparators = Array.apply(null, new Array(maxMobilePhoneNumbers)).map(function () {
                            return ";";
                        });
                        const csvOtherPhonesColumns = Array.apply(null, new Array(maxOtherPhoneNumbers)).map(function (val, i) {
                            return "otherPhoneNumber" + i;
                        });
                        const csvOtherPhonesExtraSeparators = Array.apply(null, new Array(maxOtherPhoneNumbers)).map(function () {
                            return ";";
                        });

                        // directory csv file header line
                        const csvDirectoryLines = [];
                        csvDirectoryLines.push("firstName;lastName;companyName;department;street;city;postalCode;state;country;" + csvWorkPhonesColumns.join(";") + ";" + csvMobilePhonesColumns.join(";") + ";" + csvOtherPhonesColumns.join(";") + ";jobTitle;eMail;custom1;custom2");

                        result.contacts.forEach(function (contact) {
                            let contactLine = "";
                            contactLine += contact.firstName ? contact.firstName:"";

                            contactLine += ";";
                            contactLine += contact.lastName ? contact.lastName:"";

                            contactLine += ";";
                            contactLine += contact.companyName ? contact.companyName:"";

                            contactLine += ";";
                            contactLine += contact.department ? contact.department:"";

                            contactLine += ";";
                            contactLine += contact.street ? contact.street:"";

                            contactLine += ";";
                            contactLine += contact.city ? contact.city:"";

                            contactLine += ";";
                            contactLine += contact.postalCode ? contact.postalCode:"";

                            contactLine += ";";
                            contactLine += contact.state ? contact.state:"";

                            contactLine += ";";
                            contactLine += contact.country ? contact.country:"";

                            // Add contact's phone numbers
                            let phoneNumbers;
                            let extraSeparators;
                            // Add contact's work phone numbers
                            phoneNumbers = contact.workPhoneNumbers && contact.workPhoneNumbers.length > 0 ? contact.workPhoneNumbers:[""]; // there is at least workPhone0 and mobilePhone0 (empty by default)
                            contactLine += ";";
                            contactLine += phoneNumbers.map(function (number) {
                                return number;
                            }).join(";");
                            extraSeparators = csvWorkPhonesExtraSeparators.slice(phoneNumbers.length);
                            contactLine += extraSeparators.join("");
                            // Add contact's mobile phone numbers
                            phoneNumbers = contact.mobilePhoneNumbers && contact.mobilePhoneNumbers.length > 0 ? contact.mobilePhoneNumbers:[""]; // there is at least workPhone0 and mobilePhone0 (empty by default)
                            contactLine += ";";
                            contactLine += phoneNumbers.map(function (number) {
                                return number;
                            }).join(";");
                            extraSeparators = csvMobilePhonesExtraSeparators.slice(phoneNumbers.length);
                            contactLine += extraSeparators.join("");
                            // Add contact's other phone numbers
                            phoneNumbers = contact.otherPhoneNumbers && contact.otherPhoneNumbers.length > 0 ? contact.otherPhoneNumbers:[""]; // there is at least workPhone0 and mobilePhone0 (empty by default)
                            contactLine += ";";
                            contactLine += phoneNumbers.map(function (number) {
                                return number;
                            }).join(";");
                            extraSeparators = csvOtherPhonesExtraSeparators.slice(phoneNumbers.length);
                            contactLine += extraSeparators.join("");

                            // Add other fields
                            contactLine += ";";
                            contactLine += contact.jobTitle ? contact.jobTitle:"";
                            contactLine += ";";
                            contactLine += contact.eMail ? contact.eMail:"";
                            contactLine += ";";
                            contactLine += contact.custom1 ? contact.custom1:"";
                            contactLine += ";";
                            contactLine += contact.custom2 ? contact.custom2:"";

                            csvDirectoryLines.push(contactLine);
                        });

                        // create blob
                        const directoryBlob = {blob: csvDirectoryLines.join("\r\n"), type: "text/csv; charset=utf-8"};

                        resolve(directoryBlob);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
        });
    }

    /**
     * @public
     * @method exportDirectoryCsvFile
     * @since 2.2.0
     * @instance
     * @async
     * @category Rainbow Company Directory portal - directory
     * @param {string} companyId The company id of the directory to export.<br>
     * @param {string} filePath The folder where the directory will be exported.
     * @description
     *      This API allows administrators to export the directory in a CSV file.<br>
     * @return {Promise<any>} If it succeed then it returns the file full path of the exported data. If it failed then it return the error.
     */
    exportDirectoryCsvFile(companyId : string, filePath : string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._logger.log("info", LOG_ID + "(exportDirectoryCsvFile) ===");

            const mDate = new Date().getTime(); // now
            const csvFilename = filePath + "directory_" + dateFormat(mDate, "YYYY-MM-DD_HH-mm") + ".csv"; // dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");

            let fileBlob;
            that.buildDirectoryCsvBlob(companyId).then(function (blobData: any) {
                fs.writeFile(csvFilename, blobData.blob, 'utf8', function (err) {
                    if (err) {
                        that._logger.log("error", LOG_ID + "(exportDirectoryCsvFile) Some error occured - file either not saved or corrupted file saved.");
                    } else {
                        that._logger.log("debug", LOG_ID + "(exportDirectoryCsvFile) " + csvFilename + " is saved!");
                    }
                });
                resolve(csvFilename);
            }).catch(function (error) {
                reject(error);
            });
        });
    }

    /**
     * @public
     * @method ImportDirectoryCsvFile
     * @since 2.2.0
     * @instance
     * @async
     * @category Rainbow Company Directory portal - directory
     * @param {string} companyId The company id of the directory to export.<br>
     * @param {string} fileFullPath The full file path to import.
     * @param {string} label The label used for the import.
     * @description
     *      This API allows administrators to import the directory from a CSV file.<br>
     * @return {Promise<any>} .
     */
    ImportDirectoryCsvFile(companyId : string, fileFullPath : string, label : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                let fileStats = fs.statSync(fileFullPath);

                //let range = ONE_MEGABYTE;
                let sizeToRead = fileStats.size ;
                // let fd = fs.openSync(fileFullPath, "r+");
                //let buf = new Buffer(sizeToRead);

                that._logger.log("debug", LOG_ID + "(ImportDirectoryCsvFile) sizeToRead=", sizeToRead, ", fileFullPath : ", fileFullPath);

                // fs.readSync(fd, buf, 0, sizeToRead, null);
                // const data = fs.readFileSync(fileFullPath, {encoding:'utf8', flag:'r'});

                let cvsContent = fs.readFileSync(fileFullPath, {encoding:'utf8', flag:'r'});

                that._rest.ImportDirectoryCsvFile (companyId, cvsContent, encodeURIComponent(label)).then((result) => {
                    that._logger.log("debug", LOG_ID + "(ImportDirectoryCsvFile) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(ImportDirectoryCsvFile) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(ImportDirectoryCsvFile) ErrorManager error : ", err, ' : ', companyId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(ImportDirectoryCsvFile) error : ", err);
                return reject(err);
            }
        });
    }

    //endregion directory

    //region directory tags
    /**
     * @public
     * @method getAllTagsAssignedToDirectoryEntries
     * @since 2.2.0
     * @instance
     * @async
     * @category Rainbow Company Directory portal - directory tags
     * @param {string} companyId Allows to list the tags for the directory entries of the companyIds provided in this option. <br>
     * If companyId is not provided, the tags are listed for all the directory entries of the companies managed by the logged in administrator.
     * @description
     *      This API allows administrators to list all the tags being assigned to the directory entries of the companies managed by the administrator.<br>
     * @return {Promise<any>}
     */
    getAllTagsAssignedToDirectoryEntries (companyId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getAllTagsAssignedToDirectoryEntries (companyId ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getAllTagsAssignedToDirectoryEntries) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getAllTagsAssignedToDirectoryEntries) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getAllTagsAssignedToDirectoryEntries) ErrorManager error : ", err, ' : ', companyId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllTagsAssignedToDirectoryEntries) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method removeTagFromAllDirectoryEntries
     * @since 2.2.0
     * @instance
     * @async
     * @category Rainbow Company Directory portal - directory tags
     * @param {string} companyId Allows to list the tags for the directory entries of the companyIds provided in this option. <br>
     * If companyId is not provided, the tags are listed for all the directory entries of the companies managed by the logged in administrator.<br>
     * @param {string} tag tag to remove. 
     * @description
     *      This API allows administrators to remove a tag being assigned to some directory entries of the companies managed by the administrator.<br>
     *      The parameter companyId can be used to limit the removal of the tag on the directory entries of the specified company(ies).<br>
     * @return {Promise<any>}
     */
    removeTagFromAllDirectoryEntries (companyId : string, tag  : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {                

                that._rest.removeTagFromAllDirectoryEntries (companyId, tag ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(removeTagFromAllDirectoryEntries) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(removeTagFromAllDirectoryEntries) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(removeTagFromAllDirectoryEntries) ErrorManager error : ", err, ' : ', companyId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(removeTagFromAllDirectoryEntries) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method renameTagForAllAssignedDirectoryEntries
     * @since 2.2.0
     * @instance
     * @async
     * @category Rainbow Company Directory portal - directory tags
     * @param {string} companyId Allows to rename a tag for the directory entries of the companyIds provided in this option.<br>
     * If companyId is not provided, the tag is renamed from all the directory entries of all the companies managed by the logged in administrator.<br>
     * @param {string} tag tag to rename.
     * @param {string} newTagName New tag name.
     * @description
     *      This API allows administrators to rename a tag being assigned to some directory entries of the companies managed by the administrator.<br>
     *      The parameter companyId can be used to limit the renaming of the tag on the directory entries of the specified company(ies).<br>
     * @return {Promise<any>}
     */
    renameTagForAllAssignedDirectoryEntries ( tag  : string, companyId : string, newTagName : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!tag) {
                    this._logger.log("warn", LOG_ID + "(updateDirectoryEntry) bad or empty 'tag' parameter");
                    this._logger.log("internalerror", LOG_ID + "(updateDirectoryEntry) bad or empty 'tag' parameter : ", tag);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }
                
                that._rest.renameTagForAllAssignedDirectoryEntries (tag, companyId, newTagName).then((result) => {
                    that._logger.log("debug", LOG_ID + "(renameTagForAllAssignedDirectoryEntries) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(renameTagForAllAssignedDirectoryEntries) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(renameTagForAllAssignedDirectoryEntries) ErrorManager error : ", err, ' : ', companyId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(renameTagForAllAssignedDirectoryEntries) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getStatsRegardingTagsOfDirectoryEntries
     * @since 2.2.0
     * @instance
     * @async
     * @category Rainbow Company Directory portal - directory tags
     * @param {string} companyId Allows to compute the tags statistics for the directory entries of the companyIds provided in this option.<br>
     * @description
     *      This API can be used to list all the tags being assigned to the directory entries of the companies managed by the administrator, with the number of directory entries for each tags.<br>
     * @return {Promise<any>}
     */
    getStatsRegardingTagsOfDirectoryEntries ( companyId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getStatsRegardingTagsOfDirectoryEntries (companyId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getStatsRegardingTagsOfDirectoryEntries) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getStatsRegardingTagsOfDirectoryEntries) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getStatsRegardingTagsOfDirectoryEntries) ErrorManager error : ", err, ' : ', companyId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getStatsRegardingTagsOfDirectoryEntries) error : ", err);
                return reject(err);
            }
        });
    }
    
    //endregion directory tags
    
    //endregion Rainbow Company Directory Portal

    //region Clients Versions

    /**
     * @public
     * @method createAClientVersion
     * @since 2.5.0
     * @instance
     * @param {string} id Unique identifier of the application to which the client version refer. Default value is the AppId provided to login the SDK.
     * @param {string} version App version
     * @async
     * @category Clients Versions
     * @description
     *      This API can be used to define the minimal required version for a given client application.<br>
     *      When a minimal required version is defined for a client application, if a user using an older version of this application tries to login to Rainbow, the login is forbidden with a specific error code (403020). <br>
     *      In that case, the client application can show an error message to the user requesting him to update his application.<br>
     *      To be noted that the application must provide the header x-rainbow-client-version with its current version so that this check can be performed.<br>
     *      Users with superadmin role can define the minimal required version for any client applications.<br>
     * @return {Promise<any>}
     */
    createAClientVersion (id : string, version: string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                if (version == null) {
                    that._logger.log("warn", LOG_ID + "(createAClientVersion) bad or empty 'version' parameter");
                    that._logger.log("internalerror", LOG_ID + "(createAClientVersion) bad or empty 'version' parameter : ", version);
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }
                
                if (!id) {
                    id = that._options._applicationOptions.appID;
                }

                that._rest.createAClientVersion(id, version).then((result) => {
                    that._logger.log("debug", LOG_ID + "(createAClientVersion) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(createAClientVersion) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createAClientVersion) ErrorManager error : ", err, ', id : ', id);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(createAClientVersion) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(createAClientVersion) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteAClientVersion
     * @since 2.5.0
     * @instance
     * @param {string} clientId Application unique identifier to which the client version refer
     * @async
     * @category Clients Versions
     * @description
     *      This API can be used to delete the minimal required version defined for a given client application.<br>
     *      When no minimal required version is defined for a client application, this application will allow to log users in Rainbow whatever their version.<br>
     *      Users with superadmin role can delete the minimal required version for any client applications.<br>
     * @return {Promise<any>}
     */
    deleteAClientVersion (clientId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.deleteAClientVersion(clientId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(deleteAClientVersion) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(deleteAClientVersion) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteAClientVersion) ErrorManager error : ", err, ', clientId : ', clientId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(deleteAClientVersion) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(deleteAClientVersion) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAClientVersionData
     * @since 2.5.0
     * @instance
     * @param {string} clientId Application unique identifier to which the client version refer
     * @async
     * @category Clients Versions
     * @description
     *     This API can be used to get the minimal required version defined for a given client application (if any, otherwise a 404 http error is returned).<br>
     *     Users with superadmin role can retrieve the minimal required version for all client applications.<br>
     * @return {Promise<any>}
     */
    getAClientVersionData (clientId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getAClientVersionData(clientId ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getAClientVersionData) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getAClientVersionData) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getAClientVersionData) ErrorManager error : ", err, ', clientId : ', clientId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(getAClientVersionData) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(getAClientVersionData) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllClientsVersions
     * @since 2.5.0
     * @instance
     * @async
     * @category Clients Versions
     * @param {string} name Allows to filter clients versions list on field name.
     * @param {string} typeClient Allows to filter clients versions list on field type.
     * @param {number} limit Allow to specify the number of clients versions to retrieve. Default value : 100.
     * @param {number} offset Allow to specify the position of first client version to retrieve (first client version if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort clients versions list based on the given field. Default value : "name"
     * @param {number} sortOrder Specify order when sorting clients versions list. Default value : 1. Authorized values : -1, 1.
     * @description
     *      This API can be used to get the minimal required versions defined for the client applications.<br>
     *      Users with superadmin role can retrieve the minimal required version for all client applications.<br>
     * @return {Promise<any>}
     */
    getAllClientsVersions (name? : string, typeClient? : string, limit :number = 100, offset : number = 0, sortField : string = "name", sortOrder : number = 1) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getAllClientsVersions(name, typeClient, limit, offset, sortField, sortOrder ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getAllClientsVersions) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getAllClientsVersions) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getAllClientsVersions) ErrorManager error : ", err, ', name : ', name);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(getAllClientsVersions) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(getAllClientsVersions) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method updateAClientVersion
     * @since 2.5.0
     * @instance
     * @param {string} clientId Application unique identifier to which the client version refer
     * @param {string} version App version
     * @async
     * @category Clients Versions
     * @description
     *     This API can be used to get the minimal required version defined for a given client application (if any, otherwise a 404 http error is returned).<br>
     *     Users with superadmin role can retrieve the minimal required version for all client applications.<br>
     * @return {Promise<any>}
     */
    updateAClientVersion (clientId : string, version   : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.updateAClientVersion(clientId, version).then((result) => {
                    that._logger.log("debug", LOG_ID + "(updateAClientVersion) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(updateAClientVersion) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(updateAClientVersion) ErrorManager error : ", err, ', clientId : ', clientId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateAClientVersion) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(updateAClientVersion) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }


    //endregion Clients Versions
    
}

module.exports.AdminService = AdminService;
module.exports.OFFERTYPES = OFFERTYPES;
module.exports.CLOUDPBXCLIOPTIONPOLICY = CLOUDPBXCLIOPTIONPOLICY;
export {AdminService as AdminService, OFFERTYPES, CLOUDPBXCLIOPTIONPOLICY};
