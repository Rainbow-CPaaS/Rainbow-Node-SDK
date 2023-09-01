"use strict";

import {XMPPService} from "../connection/XMPPService";

export {};

import {ErrorManager} from "../common/ErrorManager";
import  {RESTService} from "../connection/RESTService";
import {addParamToUrl, addPropertyToObj, Deferred, isStarted, logEntryExit} from "../common/Utils";
import {EventEmitter} from "events";
import {Logger} from "../common/Logger";
import {S2SService} from "./S2SService";
import {Contact} from "../common/models/Contact";
import {ContactsService} from "./ContactsService";
import {GenericService} from "./GenericService";

import {dateFormat} from "dateformat";
import { FileStorageService } from "./FileStorageService";

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
 *      This module handles the management of users. Using it, You will be able to create new users, to modify information of users and to delete them.</BR>
 *      This module can be use too to create Guest users who are specific temporaly users that can be used in Rainbow. </BR>
 *      </BR>
 *      The main methods proposed in that module allow to: </BR>
 *      - Create a new user in a specified company </BR>
 *      - Modify information of an existing user </BR>
 *      - Delete an existing user </BR>
 *      - Invite a user in Rainbow </BR>
 *      - Change the password of a user </BR>
 *      - Create a guest user </BR>
 */
class AdminService extends GenericService {
    private _contacts: ContactsService;
    private _fileStorage: FileStorageService;

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
                that._fileStorage = _core._fileStorage;
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

    // region Bots

    /**
     * @public
     * @method getRainbowSupportBotService
     * @instance
     * @description
     *      This API can be used to get Rainbow support bot service (Emily) </BR>
     * @async
     * @category Bots
     * @return {Promise<Object, ErrorManager>} - result
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Bot service unique identifier. |
     * | name | String | Bot title, like 'Emily'. |
     * | jid | String | Bot service's jid, should be like 'emily.rainbow.com'. |
     * | isRainbowSupportBot | Boolean | Indicates if the bot service corresponds to Rainbow support bot (Emily). |
     * | capabilities | String\[\] | List of capabilities tags |
     * | createdByUserId | String | Unique identifier of the bot service owner. |
     * | avatarId | String | Identifier of the Bot service's avatar.<br> |
     * | lastAvatarUpdateDate | Date-Time | Date of last bot avatar update.<br><br>* `null` value indicates that no avatar is set for this bot.<br>* Bot avatar can be customized by company (users from the company see the custom avatar instead of the default one set for the bot).<br>    * if the bot has an avatar and this one is not customized for the company, `lastAvatarUpdateDate` corresponds to the date when the bot's owner set an avatar to the bot.<br>    * otherwise if the bot has a customized avatar for the company, `lastAvatarUpdateDate` corresponds to the date when the administrator has set the customized avatar for this company. |
     * 
     * @fulfil {Object} - result
     * @category async
     */
    getRainbowSupportBotService() : Promise<any> {
        let that = this;

        that._logger.log("internal", LOG_ID + "(getRainbowSupportBotService) __ entering __");

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getRainbowSupportBotService().then((result) => {
                    that._logger.log("internal", LOG_ID + "(getRainbowSupportBotService) Success result : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getRainbowSupportBotService) Error.");
                    that._logger.log("internalerror", LOG_ID + "(getRainbowSupportBotService) Error error : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getRainbowSupportBotService) error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @public
     * @method getABotServiceData
     * @instance
     * @param {string} botId Bot Service unique identifier
     * @description
     *      This API can be used to get a bot service data. </BR>
     * @async
     * @category Bots
     * @return {Promise<Object, ErrorManager>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Bot service unique identifier. |
     * | name | String | Bot title, like 'Emily'. |
     * | jid | String | Bot service's jid, should be like 'emily.rainbow.com'. |
     * | isRainbowSupportBot | Boolean | Indicates if the bot service corresponds to Rainbow support bot (Emily). |
     * | capabilities | String\[\] | List of capabilities tags |
     * | createdByUserId | String | Unique identifier of the bot service owner. |
     * | avatarId | String | Identifier of the Bot service's avatar.<br> |
     * | lastAvatarUpdateDate | Date-Time | Date of last bot avatar update.<br><br>* `null` value indicates that no avatar is set for this bot.<br>* Bot avatar can be customized by company (users from the company see the custom avatar instead of the default one set for the bot).<br>    * if the bot has an avatar and this one is not customized for the company, `lastAvatarUpdateDate` corresponds to the date when the bot's owner set an avatar to the bot.<br>    * otherwise if the bot has a customized avatar for the company, `lastAvatarUpdateDate` corresponds to the date when the administrator has set the customized avatar for this company. |
     *
     * @fulfil {Object} - result
     * @category async
     */
    getABotServiceData(botId : string) : Promise<any> {
        let that = this;

        that._logger.log("internal", LOG_ID + "(getABotServiceData) __ entering __");

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getABotServiceData(botId).then((result) => {
                    that._logger.log("internal", LOG_ID + "(getABotServiceData) Success result : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getABotServiceData) Error.");
                    that._logger.log("internalerror", LOG_ID + "(getABotServiceData) Error error : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getABotServiceData) error : ", err);
                return reject(err);
            }
        });
    }
    
     /**
      * @public
      * @method getAllBotServices
      * @instance
      * @description
      *      This API can be used to retrieve the list of bot services. </BR>
      * @async
      * @param {string} format Allows to retrieve more or less bot services details in response. </br>
      * - small: id, name, jid, capabilities
      * - medium: id, name, jid, isRainbowSupportBot, capabilities
      * - full: id, name, jid, isRainbowSupportBot, capabilities, createdByUserId, avatarId, lastAvatarUpdateDate
      * Default value : small. Possibles values : small, medium, full
      * @param {number} limit Allow to specify the number of bot services to retrieve. Default value : 100
      * @param {number} offset Allow to specify the position of first bot to retrieve (first bot if not specified). Warning: if offset > total, no results are returned.
      * @param {string} sortField Sort bots list based on the given field. Default value : name
      * @param {number} sortOrder Specify order when sorting bots list. Default value : 1. Possibles values -1, 1
      * @category Bots
      * @return {Promise<Object, ErrorManager>} - result
      *
      *
      * | Champ | Type | Description |
      * | --- | --- | --- |
      * | id  | String | Bot service unique identifier. |
      * | name | String | Bot title, like 'Emily'. |
      * | jid | String | Bot service's jid, should be like 'emily.rainbow.com'. |
      * | isRainbowSupportBot | Boolean | Indicates if the bot service corresponds to Rainbow support bot (Emily). |
      * | capabilities | String\[\] | List of capabilities tags |
      * | createdByUserId | String | Unique identifier of the bot service owner. |
      * | avatarId | String | Identifier of the Bot service's avatar.<br> |
      * | lastAvatarUpdateDate | Date-Time | Date of last bot avatar update.<br><br>* `null` value indicates that no avatar is set for this bot.<br>* Bot avatar can be customized by company (users from the company see the custom avatar instead of the default one set for the bot).<br>    * if the bot has an avatar and this one is not customized for the company, `lastAvatarUpdateDate` corresponds to the date when the bot's owner set an avatar to the bot.<br>    * otherwise if the bot has a customized avatar for the company, `lastAvatarUpdateDate` corresponds to the date when the administrator has set the customized avatar for this company. |
      *
      * @fulfil {Object} - result
      * @category async
      */
     getAllBotServices(format : string = "small", limit : number = 100, offset : number = 0, sortField : string = "name", sortOrder : number = 1) : any {
        let that = this;

        that._logger.log("internal", LOG_ID + "(getAllBotServices) __ entering __");

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getAllBotServices(format, limit, offset, sortField, sortOrder).then((result) => {
                    that._logger.log("internal", LOG_ID + "(getAllBotServices) Success result : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getAllBotServices) Error.");
                    that._logger.log("internalerror", LOG_ID + "(getAllBotServices) Error error : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllBotServices) error : ", err);
                return reject(err);
            }
        });
    }
    
    // endregion Bots    
    
    // region Companies and users management
    //region Company join companies links

    /**
     * @public
     * @method createAJoinCompanyLink
     * @instance
     * @description
     *      This API can be used by company admin users to create a join company link for his company. </BR>
     *      Join company links allow company administrators to generate an id that can be used by users to create their account in this company. </BR>
     * @async
     * @param {string} companyId Company unique identifier. Default value is the current logued in user's company. </br>
     * @param {string} description Join company link description.
     * @param {boolean} isEnabled Boolean allowing to enable or disable the join company link. </BR>
     * * if the link is enabled, users can register using it, </BR>
     * * if the link is disabled, users can't register using it. </BR>
     * Default value : `true`
     * @param {string} expirationDate Date of expiration of the Join company link </BR>
     * If a user tries to register using a link while its `expirationDate` is less than the current date, user registration will be denied. </BR>
     * * `expirationDate` has to be provided in UTC timezone. </BR>
     * * `expirationDate` must be greater than the current date (not possible to set expirationDate to a passed date). </BR>
     * @param {number} maxNumberUsers  Maximum number of users allowed to register in the company using this join company link. </BR> If a user tries to register using a link while its `nbUsersRegistered` is equal to `maxNumberUsers`, user registration will be denied.
     * @category Company join companies links
     * @return {Promise<Object, ErrorManager>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Join company link unique Id |
     * | companyId | String | Company related to the join company link |
     * | creationDate | Date-Time | Creation date of the join company link |
     * | createdByAdminId | String | Unique Id of the admin who created the join company link |
     * | description optionnel | String | Join company link description |
     * | isEnabled | Boolean | Boolean allowing to enable or disable the join company link.<br><br>* if the link is enabled, users can register using it,<br>* if the link is disabled, users can't register using it. |
     * | expirationDate optionnel | Date-Time | Date of expiration of the Join company link  <br>If a user tries to register using a link while its `expirationDate` is less than the current date, user registration will be denied. |
     * | maxNumberUsers optionnel | Number | Maximum number of users allowed to register in the company using this join company link.  <br>If a user tries to register using a link while its `nbUsersRegistered` is equal to `maxNumberUsers`, user registration will be denied. |
     * | nbUsersRegistered | Number | Number of users that used this join company link to register in the company. |
     *
     * @fulfil {Object} - result
     * @category async
     */
    createAJoinCompanyLink(companyId : string = undefined, description : string = undefined, isEnabled : boolean = true,
                           expirationDate : string = undefined, maxNumberUsers : number= undefined ) {
        let that = this;

        that._logger.log("internal", LOG_ID + "(createAJoinCompanyLink) parameters : companyId : ", companyId);

        return new Promise(function (resolve, reject) {
            try {
                companyId = companyId ? companyId : that._rest.account.companyId;
                
                that._rest.createAJoinCompanyLink( companyId, description, isEnabled, expirationDate, maxNumberUsers ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(createAJoinCompanyLink) Successfully created.");
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createAJoinCompanyLink) ErrorManager .");
                    that._logger.log("internalerror", LOG_ID + "(createAJoinCompanyLink) ErrorManager  : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createAJoinCompanyLink) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteAJoinCompanyLink
     * @instance
     * @description
     *      This API can be used by company `admin` users to delete a join company link by id </BR>
     *      Join company links allow company administrators to generate an id that can be used by users to create their account in this company. </BR>
     *      Join company links can't be deleted if they have been used by users to register in the related company (in that case they can only be disabled, by updating `isEnabled` value to false). </BR>
     * @async
     * @param {string} companyId Company unique identifier. Default value is the current logued in user's company.</br>
     * @param {string} joinCompanyLinkId Join company link unique identifier.
     * @category Company join companies links
     * @return {Promise<Object, ErrorManager>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Join company link Object |
     * | status | String | Deletion status |
     * | id  | String | Join company link unique Id |
     * | companyId | String | Company related to the join company link |
     * | creationDate | Date-Time | Creation date of the join company link |
     * | createdByAdminId | String | Unique Id of the admin who created the join company link |
     * | description optionnel | String | Join company link description |
     * | isEnabled | Boolean | Boolean allowing to enable or disable the join company link.<br><br>* if the link is enabled, users can register using it,<br>* if the link is disabled, users can't register using it. |
     * | expirationDate optionnel | Date-Time | Date of expiration of the Join company link  <br>If a user tries to register using a link while its `expirationDate` is less than the current date, user registration will be denied. |
     * | maxNumberUsers optionnel | Number | Maximum number of users allowed to register in the company using this join company link.  <br>If a user tries to register using a link while its `nbUsersRegistered` is equal to `maxNumberUsers`, user registration will be denied. |
     * | nbUsersRegistered | Number | Number of users that used this join company link to register in the company. |
     *
     * @fulfil {Object} - result
     * @category async
     */
    deleteAJoinCompanyLink(companyId : string, joinCompanyLinkId : string ) {
        let that = this;

        that._logger.log("internal", LOG_ID + "(deleteAJoinCompanyLink) parameters : companyId : ", companyId,", joinCompanyLinkId : ", joinCompanyLinkId);

        return new Promise(function (resolve, reject) {
            try {
                companyId = companyId ? companyId : that._rest.account.companyId;
                
                if (!joinCompanyLinkId) {
                    that._logger.log("error", LOG_ID + "(deleteAJoinCompanyLink) bad or empty 'joinCompanyLinkId' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.deleteAJoinCompanyLink(companyId, joinCompanyLinkId).then((company) => {
                    that._logger.log("debug", LOG_ID + "(deleteAJoinCompanyLink) Successfully done.");
                    resolve(company);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteAJoinCompanyLink) ErrorManager.");
                    that._logger.log("internalerror", LOG_ID + "(deleteAJoinCompanyLink) ErrorManager error : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(deleteAJoinCompanyLink) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAJoinCompanyLink
     * @instance
     * @description
     *      This API can be used by company admin users to get a join company link by id. </BR>
     *      Join company links allow company administrators to generate an id that can be used by users to create their account in this company. </BR>
     * @async
     * @param {string} companyId Company unique identifier. Default value is the current logued in user's company.</br>
     * @param {string} joinCompanyLinkId Join company link unique identifier.
     * @category Company join companies links
     * @return {Promise<Object, ErrorManager>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Join company link Object |
     * | id  | String | Join company link unique Id |
     * | companyId | String | Company related to the join company link |
     * | creationDate | Date-Time | Creation date of the join company link |
     * | createdByAdminId | String | Unique Id of the admin who created the join company link |
     * | description optionnel | String | Join company link description |
     * | isEnabled | Boolean | Boolean allowing to enable or disable the join company link.<br><br>* if the link is enabled, users can register using it,<br>* if the link is disabled, users can't register using it. |
     * | expirationDate optionnel | Date-Time | Date of expiration of the Join company link  <br>If a user tries to register using a link while its `expirationDate` is less than the current date, user registration will be denied. |
     * | maxNumberUsers optionnel | Number | Maximum number of users allowed to register in the company using this join company link.  <br>If a user tries to register using a link while its `nbUsersRegistered` is equal to `maxNumberUsers`, user registration will be denied. |
     * | nbUsersRegistered | Number | Number of users that used this join company link to register in the company. |
     *
     * @fulfil {Object} - result
     * @category async
     */
    getAJoinCompanyLink(companyId : string, joinCompanyLinkId : string) {
        let that = this;
        
        return new Promise(function (resolve, reject) {
            try {
                companyId = companyId ? companyId : that._rest.account.companyId;
                that._logger.log("internal", LOG_ID + "(getAJoinCompanyLink) parameters : companyId : ", companyId,", joinCompanyLinkId : ", joinCompanyLinkId);

                if (!joinCompanyLinkId) {
                    that._logger.log("error", LOG_ID + "(getAJoinCompanyLink) bad or empty 'joinCompanyLinkId' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.getAJoinCompanyLink(companyId, joinCompanyLinkId).then((company) => {
                    that._logger.log("internal", LOG_ID + "(getAJoinCompanyLink) Successfully done.");
                    resolve(company);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getAJoinCompanyLink) ErrorManager.");
                    that._logger.log("internalerror", LOG_ID + "(getAJoinCompanyLink) ErrorManager error : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAJoinCompanyLink) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllJoinCompanyLinks
     * @instance
     * @description
     *      This API can be used by company admin users to list existing join company links for his company. </BR>
     *      Join company links allow company administrators to generate an id that can be used by users to create their account in this company. </BR>
     * @async
     * @param {string} companyId Company unique identifier. Default value is the current logued in user's company.</br>
     * @param {string} format Allows to retrieve more or less join company links details in response.
     * > * `small`: id, companyId, isEnabled
     * > * `medium`: id, companyId, isEnabled, expirationDate, maxNumberUsers
     * > * `full`: all join company links fields
     * Default value : `small`. Possibles values : `small`, `medium`, `full`.
     * @param {string} createdByAdminId List join company links created by the specified administrator id(s).
     * @param {boolean} isEnabled List join company links with the specified isEnabled value (true/false).
     * @param {string} fromExpirationDate List join company links expiring after the given date.
     * @param {string} toExpirationDate List join company links expiring before the given date.
     * @param {string} fromNbUsersRegistered List join company links that have been used by at least the given number (nbUsersRegistered greater than or equal to the requested toNbUsersRegistered number).
     * @param {string} toNbUsersRegistered List join company links that have been used by at less than the given number (nbUsersRegistered lower than or equal to the requested toNbUsersRegistered number).
     * @param {number} limit Allow to specify the number of items to retrieve. Default value : 100.
     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned. Default value : 0.
     * @param {string} sortField Sort items list based on the given field.
     * @param {number} sortOrder Specify order when sorting items list. Default value : 1. Possibles values : -1, 1 .
     * @category Company join companies links
     * @return {Promise<Object, ErrorManager>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Join company link Object |
     * | limit | Number | Number of requested items |
     * | offset | Number | Requested position of the first item to retrieve |
     * | total | Number | Total number of items |
     * | id  | String | Join company link unique Id |
     * | companyId | String | Company related to the join company link |
     * | creationDate | Date-Time | Creation date of the join company link |
     * | createdByAdminId | String | Unique Id of the admin who created the join company link |
     * | description optionnel | String | Join company link description |
     * | isEnabled | Boolean | Boolean allowing to enable or disable the join company link.<br><br>* if the link is enabled, users can register using it,<br>* if the link is disabled, users can't register using it. |
     * | expirationDate optionnel | Date-Time | Date of expiration of the Join company link  <br>If a user tries to register using a link while its `expirationDate` is less than the current date, user registration will be denied. |
     * | maxNumberUsers optionnel | Number | Maximum number of users allowed to register in the company using this join company link.  <br>If a user tries to register using a link while its `nbUsersRegistered` is equal to `maxNumberUsers`, user registration will be denied. |
     * | nbUsersRegistered | Number | Number of users that used this join company link to register in the company. |
     *
     * @fulfil {Object} - result
     * @category async
     */   
    getAllJoinCompanyLinks(companyId, format : string = "small", createdByAdminId : string = undefined, isEnabled : boolean = undefined, fromExpirationDate : string = undefined, toExpirationDate : string = undefined,
                           fromNbUsersRegistered : string = undefined, toNbUsersRegistered : string = undefined, limit : number = 100, offset : number = 0, sortField : string = undefined, sortOrder : number = 1 ) {
        let that = this;


        return new Promise(function (resolve, reject) {
            try {
                companyId = companyId ? companyId : that._rest.account.companyId;

                that._logger.log("internal", LOG_ID + "(getAllJoinCompanyLinks) parameters : companyId : ", companyId);
                
                /* if (!name) {
                    that._logger.log("error", LOG_ID + "(createCompanyFromDefault) bad or empty 'name' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                } // */

                that._rest.getAllJoinCompanyLinks(companyId, format, createdByAdminId, isEnabled, fromExpirationDate, toExpirationDate,
                        fromNbUsersRegistered, toNbUsersRegistered, limit, offset, sortField, sortOrder).then((company) => {
                    that._logger.log("internal", LOG_ID + "(getAllJoinCompanyLinks) Successfully.");
                    resolve(company);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getAllJoinCompanyLinks) ErrorManager.");
                    that._logger.log("internalerror", LOG_ID + "(getAllJoinCompanyLinks) ErrorManager : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllJoinCompanyLinks) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method updateAJoinCompanyLink
     * @instance
     * @description
     *      This API can be used by company admin users to update a join company link for his company. </BR>
     *      Join company links allow company administrators to generate an id that can be used by users to create their account in this company. </BR>
     * @async
     * @param {string} companyId Company unique identifier. Default value is the current logued in user's company.</br>
     * @param {string} joinCompanyLinkId Join company link unique identifier.
     * @param {string} description Join company link description.
     * @param {boolean} isEnabled Boolean allowing to enable or disable the join company link. </BR>
     * * if the link is enabled, users can register using it, </BR>
     * * if the link is disabled, users can't register using it. </BR>
     * Default value : `true` </BR>
     * @param {string} expirationDate Date of expiration of the Join company link </BR>
     * If a user tries to register using a link while its `expirationDate` is less than the current date, user registration will be denied. </BR>
     * `expirationDate` has to be provided in UTC timezone. </BR>
     * `expirationDate` must be greater than the current date (not possible to set expirationDate to a passed date). </BR>
     * @param {string} maxNumberUsers Maximum number of users allowed to register in the company using this join company link. </BR>
     * If a user tries to register using a link while its `nbUsersRegistered` is equal to `maxNumberUsers`, user registration will be denied.
     * @category Company join companies links
     * @return {Promise<Object, ErrorManager>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Join company link Object |
     * | id  | String | Join company link unique Id |
     * | companyId | String | Company related to the join company link |
     * | creationDate | Date-Time | Creation date of the join company link |
     * | createdByAdminId | String | Unique Id of the admin who created the join company link |
     * | description optionnel | String | Join company link description |
     * | isEnabled | Boolean | Boolean allowing to enable or disable the join company link.<br><br>* if the link is enabled, users can register using it,<br>* if the link is disabled, users can't register using it. |
     * | expirationDate optionnel | Date-Time | Date of expiration of the Join company link  <br>If a user tries to register using a link while its `expirationDate` is less than the current date, user registration will be denied. |
     * | maxNumberUsers optionnel | Number | Maximum number of users allowed to register in the company using this join company link.  <br>If a user tries to register using a link while its `nbUsersRegistered` is equal to `maxNumberUsers`, user registration will be denied. |
     * | nbUsersRegistered | Number | Number of users that used this join company link to register in the company. |
     *
     * @fulfil {Object} - result
     * @category async
     */   
    updateAJoinCompanyLink(companyId : string, joinCompanyLinkId : string, description : string, isEnabled : boolean = true,
                           expirationDate : string, maxNumberUsers : number ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                companyId = companyId ? companyId : that._rest.account.companyId;

                that._logger.log("internal", LOG_ID + "(updateAJoinCompanyLink) parameters : companyId : ", companyId);

                /*if (!name) {
                    that._logger.log("error", LOG_ID + "(updateAJoinCompanyLink) bad or empty 'name' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                } // */

                that._rest.updateAJoinCompanyLink(companyId, joinCompanyLinkId, description, isEnabled, expirationDate, maxNumberUsers ).then((result) => {
                    that._logger.log("internal", LOG_ID + "(updateAJoinCompanyLink) Successfully.");
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(updateAJoinCompanyLink) ErrorManager when creating");
                    that._logger.log("internalerror", LOG_ID + "(updateAJoinCompanyLink) ErrorManager : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(updateAJoinCompanyLink) error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Company join companies links
    
    /**
     * @public
     * @method createCompanyFromDefault
     * @instance
     * @description
     *      This API API allows to create a company for a user belonging to the 'Default' company is able to create his own company. </BR>
     *      Then he is automatically moved to it and becomes the 'company_admin' of it. </BR>
     *      </BR>
     *      The company's name is checked and must be unique. </BR>
     *      The logged in user musn't have already an admin or superadmin role </BR>
     *      </BR>
     *      The company is created with visibility='public' and userSelfRegisterEnabled=false. The user, promoted to 'company_admin', can then update these values. </BR>
     * @async   
     * @category Companies and users management
     * @return {Promise<Object, ErrorManager>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | meetingRecordingCustomisation | String | Activate/Deactivate the capability for a user to record a meeting.  <br>Defines if a user can record a meeting.  <br>meetingRecordingCustomisation can be:<br><br>* `enabled`: The user can record a meeting.<br>* `disabled`: The user can't record a meeting. |
     * | eLearningGamificationCustomisation | String | Activate/Deactivate the capability for a user to earn badges for Elearning progress.  <br>Defines if a user can earn badges for Elearning progress.  <br>eLearningGamificationCustomisation can be:<br><br>* `enabled`: The user can earn badges for Elearning progress.<br>* `disabled`: The user can't earn badges for Elearning progress. |
     * | eLearningCustomisation | String | Activate/Deactivate the capability for a user to participate on a Elearning training.  <br>Defines if a user can particapate on an Elearning training.  <br>eLearningCustomisation can be:<br><br>* `enabled`: The user can participate on an Elearning training.<br>* `disabled`: The user can't participate on an Elearning training. |
     * | autoAcceptUserInvitations optionnel | Boolean | Allow to enable or disable the auto-acceptation of user invitations between users of this company (default true: enabled)<br><br>Default value : `true` |
     * | data | Object | Company Object. |
     * | id  | String | Company unique identifier |
     * | creationDate | Date-Time | Company creation date (Read only) |
     * | statusUpdatedDate | Date-Time | Date of last company status update (Read only) |
     * | lastAvatarUpdateDate | Date-Time | Date of last company avatar update (Read only) |
     * | name | String | Company name |
     * | country optionnel | String | Company country (ISO 3166-1 alpha3 format)<br><br>The list of allowed countries can be obtained using the API [GET /api/rainbow/enduser/v1.0/countries](/enduser/#api-countries-getCountries) |
     * | street optionnel | String | Company street<br> |
     * | city optionnel | String | Company city<br> |
     * | state optionnel | String | When country is 'USA' or 'CAN', a state must be defined. Else it is not managed.<br><br>The list of allowed states can be obtained using the API [GET /api/rainbow/enduser/v1.0/countries](/enduser/#api-countries-getCountries) for the associated countries.<br><br>* List of allowed states for `USA`:<br>    * `AA`: "Armed Forces America",<br>    * `AE`: "Armed Forces",<br>    * `AP`: "Armed Forces Pacific",<br>    * `AK`: "Alaska",<br>    * `AL`: "Alabama",<br>    * `AR`: "Arkansas",<br>    * `AZ`: "Arizona",<br>    * `CA`: "California",<br>    * `CO`: "Colorado",<br>    * `CT`: "Connecticut",<br>    * `DC`: Washington DC",<br>    * `DE`: "Delaware",<br>    * `FL`: "Florida",<br>    * `GA`: "Georgia",<br>    * `GU`: "Guam",<br>    * `HI`: "Hawaii",<br>    * `IA`: "Iowa",<br>    * `ID`: "Idaho",<br>    * `IL`: "Illinois",<br>    * `IN`: "Indiana",<br>    * `KS`: "Kansas",<br>    * `KY`: "Kentucky",<br>    * `LA`: "Louisiana",<br>    * `MA`: "Massachusetts",<br>    * `MD`: "Maryland",<br>    * `ME`: "Maine",<br>    * `MI`: "Michigan",<br>    * `MN`: "Minnesota",<br>    * `MO`: "Missouri",<br>    * `MS`: "Mississippi",<br>    * `MT`: "Montana",<br>    * `NC`: "North Carolina",<br>    * `ND`: "North Dakota",<br>    * `NE`: "Nebraska",<br>    * `NH`: "New Hampshire",<br>    * `NJ`: "New Jersey",<br>    * `NM`: "New Mexico",<br>    * `NV`: "Nevada",<br>    * `NY`: "New York",<br>    * `OH`: "Ohio",<br>    * `OK`: "Oklahoma",<br>    * `OR`: "Oregon",<br>    * `PA`: "Pennsylvania",<br>    * `PR`: "Puerto Rico",<br>    * `RI`: "Rhode Island",<br>    * `SC`: "South Carolina",<br>    * `SD`: "South Dakota",<br>    * `TN`: "Tennessee",<br>    * `TX`: "Texas",<br>    * `UT`: "Utah",<br>    * `VA`: "Virginia",<br>    * `VI`: "Virgin Islands",<br>    * `VT`: "Vermont",<br>    * `WA`: "Washington",<br>    * `WI`: "Wisconsin",<br>    * `WV`: "West Virginia",<br>    * `WY`: "Wyoming"<br>* List of allowed states for `CAN`:<br>    * `AB`: "Alberta",<br>    * `BC`: "British Columbia",<br>    * `MB`: "Manitoba",<br>    * `NB`: "New Brunswick",<br>    * `NL`: "Newfoundland and Labrador",<br>    * `NS`: "Nova Scotia",<br>    * `NT`: "Northwest Territories",<br>    * `NU`: "Nunavut",<br>    * `ON`: "Ontario",<br>    * `PE`: "Prince Edward Island",<br>    * `QC`: "Quebec",<br>    * `SK`: "Saskatchewan",<br>    * `YT`: "Yukon"<br><br>Possibles values `null`, `"AA"`, `"AE"`, `"AP"`, `"AK"`, `"AL"`, `"AR"`, `"AZ"`, `"CA"`, `"CO"`, `"CT"`, `"DC"`, `"DE"`, `"FL"`, `"GA"`, `"GU"`, `"HI"`, `"IA"`, `"ID"`, `"IL"`, `"IN"`, `"KS"`, `"KY"`, `"LA"`, `"MA"`, `"MD"`, `"ME"`, `"MI"`, `"MN"`, `"MO"`, `"MS"`, `"MT"`, `"NC"`, `"ND"`, `"NE"`, `"NH"`, `"NJ"`, `"NM"`, `"NV"`, `"NY"`, `"OH"`, `"OK"`, `"OR"`, `"PA"`, `"PR"`, `"RI"`, `"SC"`, `"SD"`, `"TN"`, `"TX"`, `"UT"`, `"VA"`, `"VI"`, `"VT"`, `"WA"`, `"WI"`, `"WV"`, `"WY"`, `"AB"`, `"BC"`, `"MB"`, `"NB"`, `"NL"`, `"NS"`, `"NT"`, `"NU"`, `"ON"`, `"PE"`, `"QC"`, `"SK"`, `"YT"` |
     * | postalCode optionnel | String | Company postal code<br> |
     * | currency optionnel | String | Company currency, for payment of premium offers (ISO 4217 format)  <br>For now, only USD, EUR and CNY are supported<br><br>Possibles values `USD`, `EUR`, `CNY` |
     * | status | String | Company status<br><br>Possibles values `initializing`, `active`, `alerting`, `hold`, `terminated` |
     * | visibility optionnel | string | Company visibility (define if users being in this company can be searched by users being in other companies and if the user can search users being in other companies).<br><br>* `public`: User can be searched by external users / can search external users. User can invite external users / can be invited by external users<br>* `private`: User **can't** be searched by external users (even within his organisation) / can search external users. User can invite external users / can be invited by external users<br>* `organisation`: User **can't** be searched by external users / can search external users. User can invite external users / can be invited by external users<br>* `closed`: User **can't** be searched by external users / **can't** search external users. User can invite external users / can be invited by external users<br>* `isolated`: User **can't** be searched by external users / **can't** search external users. User **can't** invite external users / **can't** be invited by external users<br>* `none`: Default value reserved for guest. User **can't** be searched by **any users** (even within the same company) / can search external users. User can invite external users / can be invited by external users<br><br>External users mean public user not being in user's company nor user's organisation nor a company visible by user's company.<br><br>Note related to organisation visibility:<br><br>* Under the same organisation, a company can choose the visibility=organisation. That means users belonging to this company are visible for users of foreign companies inside the same organisation.<br>* The visibility=organisation is same as visibility=private outside the organisation. That is to say users can't be searched outside the organisation's companies.<br><br>Default value : `private`<br><br>Possibles values `public`, `private`, `organisation`, `closed`, `isolated` |
     * | visibleBy | String\[\] | If visibility is private, list of companyIds for which visibility is allowed |
     * | adminEmail optionnel | String | Company contact person email |
     * | supportEmail optionnel | String | Company support email |
     * | supportUrlFAQ optionnel | String | Company support URL |
     * | companyContactId optionnel | String | User Id of a Rainbow user which is the contact for this company |
     * | disableCCareAdminAccess optionnel | Boolean | When True, disables the access to the customer care logs for admins of this company.  <br>Note that if `disableCCareAdminAccessCustomers` is enabled on its BP company or `disableCCareAdminAccessResellers` is enabled on its BP VAD company, this setting is forced to true. |
     * | disableCCareAdminAccessCustomers optionnel | Boolean | When True, disables the access to the customer care logs for admins of all the customers company.  <br>This setting is only applicable for BP companies (`isBP`=true)<br><br>* If the BP company is a DR or an IR, enabling this setting disables the access to the customer care logs for the admins of all its customers companies.<br>* If the BP company is a VAD, enabling this setting disables the access to the customer care logs for all the admins of its customers companies.  <br>    Note that the bp_admins/admins of all the BP IRs companies linked to this VAD still have access to the customer care logs (the setting `disableCCareAdminAccessResellers` on the BP VAD company allows to disable it). |
     * | disableCCareAdminAccessResellers optionnel | Boolean | When True, disables the access to the customer care logs for admins of all the BP IRs companies linked to the BP VAD and their customers company.  <br>This setting is only applicable for BP VAD companies (`isBP`=true and `bpType`=`VAD`)  <br>Enabling this setting disables on the BP VAD company disables the access to the customer care logs for the bp_admins/admins of all the BP IRs linked to this VAD, and to all the admins of their customers.  <br>Note that the admins of all the customer companies directly linked to this VAD still have access to the customer care logs (the setting `disableCCareAdminAccessCustomers` on the BP VAD company allows to disable it). |
     * | userSelfRegisterEnabled | Boolean | Allow users with email domain matching 'userSelfRegisterAllowedDomains' to join the company by self-register process |
     * | userSelfRegisterAllowedDomains | String\[\] | Allow users with email domain matching one of the values of this array to join the company by self-register process (if userSelfRegisterEnabled is true) |
     * | slogan optionnel | String | A free string corresponding to the slogan of the company (255 char length) |
     * | description optionnel | String | A free string that describes the company (2000 char length) |
     * | size | String | An overview of the number of employees<br><br>Possibles values `"self-employed"`, `"1-10 employees"`, `"11-50 employees"`, `"51-200 employees"`, `"201-500 employees"`, `"501-1000 employees"`, `"1001-5000 employees"`, `"5001-10,000 employees"`, `"10,001+ employees"` |
     * | economicActivityClassification optionnel | String | * `A`: AGRICULTURE, FORESTRY AND FISHING<br>* `B`: MINING AND QUARRYING<br>* `C`: MANUFACTURING<br>* `D`: ELECTRICITY, GAS, STEAM AND AIR CONDITIONING SUPPLY<br>* `E`: WATER SUPPLY; SEWERAGE, WASTE MANAGEMENT AND REMEDIATION ACTIVITIES<br>* `F`: CONSTRUCTION<br>* `G`: WHOLESALE AND RETAIL TRADE; REPAIR OF MOTOR VEHICLES AND MOTORCYCLES<br>* `H`: TRANSPORTATION AND STORAGE<br>* `I`: ACCOMMODATION AND FOOD SERVICE ACTIVITIES<br>* `J`: INFORMATION AND COMMUNICATION<br>* `K`: FINANCIAL AND INSURANCE ACTIVITIES<br>* `L`: REAL ESTATE ACTIVITIES<br>* `M`: PROFESSIONAL, SCIENTIFIC AND TECHNICAL ACTIVITIES<br>* `N`: ADMINISTRATIVE AND SUPPORT SERVICE ACTIVITIES<br>* `O`: PUBLIC ADMINISTRATION AND DEFENCE; COMPULSORY SOCIAL SECURITY<br>* `P`: EDUCATION<br>* `Q`: HUMAN HEALTH AND SOCIAL WORK ACTIVITIES<br>* `R`: ARTS, ENTERTAINMENT AND RECREATION<br>* `S`: OTHER SERVICE ACTIVITIES<br>* `T`: ACTIVITIES OF HOUSEHOLDS AS EMPLOYERS; UNDIFFERENTIATED GOODS- AND SERVICES-PRODUCING ACTIVITIES OF HOUSEHOLDS FOR OWN USE<br>* `U`: ACTIVITIES OF EXTRATERRITORIAL ORGANISATIONS AND BODIES<br><br>Possibles values `"NONE"`, `"A"`, `"B"`, `"C"`, `"D"`, `"E"`, `"F"`, `"G"`, `"H"`, `"I"`, `"J"`, `"K"`, `"L"`, `"M"`, `"N"`, `"O"`, `"P"`, `"Q"`, `"R"`, `"S"`, `"T"`, `"U"` |
     * | giphyEnabled optionnel | Boolean | Whether or not giphy feature is enabled for users belonging to this company (possibility to use animated gifs in conversations) |
     * | website optionnel | String | Company website URL |
     * | organisationId | String | Optional identifier to indicate the company belongs to an organisation |
     * | catalogId | String | Id of the catalog of Rainbow offers to which the company is linked. The catalog corresponds to the list of offers the company can subscribe. |
     * | bpId | String | Optional identifier which links the company to the corresponding Business partner company |
     * | adminHasRightToUpdateSubscriptions optionnel | Boolean | In the case the company is linked to a Business Partner company, indicates if the `bp_admin` allows the `company_admin` to update the subscriptions of his company (if enable, allowed operations depend of the value of `adminAllowedUpdateSubscriptionsOps`).  <br>Can only be set by `superadmin` or `bp_admin`/`bp_finance` of the related company. |
     * | adminAllowedUpdateSubscriptionsOps optionnel | String | In the case the company is linked to a Business Partner company and `adminHasRightToUpdateSubscriptions` is enabled, indicates the update operations for which the `bp_admin` allows the `company_admin` to perform on the subscriptions of his company.<br><br>Can only be set by `superadmin` or `bp_admin`/`bp_finance` of the related company.<br><br>Possible values:<br><br>* `all`: company_admin is allowed to perform all update operations on the subscriptions of his company<br>* `increase_only`: company_admin is only allowed to increase `maxNumberUsers` on the subscriptions of his company (decrease is forbidden)<br><br>Possibles values `all`, `increase_only` |
     * | isBP | Boolean | Indicates if the company is a Business partner company<br><br>Default value : `false` |
     * | bpType optionnel | String | Indicates BP Company type<br><br>* `IR`: Indirect Reseller,<br>* `VAD`: Value Added Distributor,<br>* `DR`: Direct Reseller.<br><br>Possibles values `IR`, `VAD`, `DR` |
     * | bpBusinessModel optionnel | String | Indicates BP business model |
     * | bpApplicantNumber optionnel | String | Reference of the Business Partner in ALE Finance tools (SAP) |
     * | bpCRDid optionnel | String | Reference of the Business Partner in CDR |
     * | bpHasRightToSell optionnel | Boolean | Indicates if the Business has the right to sell |
     * | bpHasRightToConnect optionnel | Boolean | When True, the BP can connect CPE equipment of managed companies. So when False, the "equipment" tab should be removed from the admin GUI |
     * | bpIsContractAccepted optionnel | Boolean | Indicates if the Business has accepted the contract and can sell Rainbow offers |
     * | bpContractAcceptationInfo optionnel | Object | If the Business has accepted the contract, indicates who accepted the contract, Only visible by `superadmin` and `support`. |
     * | acceptationDate | Date-Time | Date of contract acceptation by the BP admin |
     * | bpAdminId | String | User Id of the BP admin who accepted the contract |
     * | offerType | String | Allowed company offer types<br><br>Possibles values `freemium`, `premium` |
     * | bpAdminLoginEmail | String | User loginEmail of the BP admin who accepted the contract |
     * | businessSpecific optionnel | String | When the customer has subscribed to specific business offers, this field is set to the associated specific business (ex: HDS for HealthCare business specific)<br><br>Possibles values `HDS` |
     * | externalReference optionnel | String | Free field that BP can use to link their customers to their IS/IT tools  <br>Only applicable by `superadmin` or by `bp_admin`/`bp_finance` on one of his customer companies.<br> |
     * | externalReference2 optionnel | String | Free field that BP can use to link their customers to their IS/IT tools  <br>Only applicable by `superadmin` or by `bp_admin`/`bp_finance` on one of his customer companies.<br> |
     * | avatarShape optionnel | String | Company's avatar customization<br><br>Possibles values `square`, `circle` |
     * | allowUsersSelectTheme | Boolean | Allow users of this company to select a theme among the ones available (owned or visible by the company). |
     * | allowUsersSelectPublicTheme | Boolean | Allow users of this company to select a public theme. |
     * | selectedTheme optionnel | Object | Set the selected theme(s) for users of the company. |
     * | light optionnel | String | Set the selected theme light for users of the company. |
     * | dark optionnel | String | Set the selected theme dark for users of the company. |
     * | adminCanSetCustomData optionnel | Boolean | Whether or not administrators can set `customData` field for their own company. |
     * | isLockedByBp optionnel | Boolean | Whether or not BP company has locked themes so that indicates if company admin can manage themes (create/update/delete). |
     * | superadminComment optionnel | String | Free field that only `superadmin` can see<br> |
     * | bpBusinessType optionnel | String\[\] | Business type that can be sold by a BP.<br><br>Possibles values `voice_by_partner`, `voice_by_ale`, `conference`, `default` |
     * | billingModel optionnel | String | Billing model that can be subscribed for this company.<br><br>Possibles values `monthly`, `prepaid_1y`, `prepaid_3y`, `prepaid_5y` |
     * | office365Tenant optionnel | String | Office365 tenant configured for this company. |
     * | office365ScopesGranted optionnel | String\[\] | Scopes granted to Rainbow for usage of Microsoft Office365 APIs.  <br>If no office365Tenant is set or if admin has not granted access of Office365 APIs to Rainbow for the configured office365Tenant, office365ScopesGranted is set to an empty Array.  <br>Otherwise, office365ScopesGranted lists the scopes requested by Rainbow to use Office365 APIs for the configured office365Tenant. This field can be used to determine if the admin must re-authenticate to Microsoft Office365 in the case new scopes are requested for Rainbow application (scopes requested for the current version of office365-portal are listed in API GET /api/rainbow/office365/v1.0/consent).<br><br>Possibles values `directory`, `calendar` |
     * | mobilePermanentConnectionMode | Boolean | deactivate push mode for mobile devices.  <br>When we can't rely on Internet and Google FCM services to wake-up the app or notify the app, we can fall back to a direct XMPP connection.  <br>For customers using Samsung devices with Google Play services, we must have an option on admin side to set this permanent connection mode, so that mobile apps can rely on this parameter. This option will be applied for the whole company. |
     * | fileSharingCustomisation | String | Activate/Deactivate file sharing capability per company  <br>Define if the company can use the file sharing service then, allowed to download and share file.  <br>FileSharingCustomisation can be:<br><br>* `enabled`: Each user of the company can use the file sharing service, except when his own capability is set to 'disabled'.<br>* `disabled`: No user of the company can use the file sharing service, except when his own capability is set to 'enabled'. When one user of the company has the capability 'fileSharingCustomisation' set to 'same\_than\_company', his capability follow the company setting. |
     * | userTitleNameCustomisation | String | Activate/Deactivate the capability for a user to modify his profile (title, firstName, lastName) per company  <br>Define if the company allows his users to change some profile data.  <br>userTitleNameCustomisation can be:<br><br>* `enabled`: Each user of the company can change some profile data, except when his own capability is set to 'disabled'.<br>* `disabled`: No user of the company can change some profile data, except when his own capability is set to 'enabled'. When one user of the company has the capability 'userTitleNameCustomisation' set to 'same\_than\_company', his capability follow the company setting. |
     * | softphoneOnlyCustomisation | String | Activate/Deactivate the capability for an UCaas application not to offer all Rainbow services and but to focus to telephony services.  <br>Define if UCaas apps used by a user of this company must provide Softphone functions, i.e. no chat, no bubbles, no meetings, no channels, and so on.  <br>softphoneOnlyCustomisation can be:<br><br>* `enabled`: The user switch to a softphone mode only.<br>* `disabled`: The user can use telephony services, chat, bubbles, channels meeting services and so on. |
     * | useRoomCustomisation | String | Activate/Deactivate the capability for a user to use bubbles.  <br>Define if a user can create bubbles or participate in bubbles (chat and web conference).  <br>useRoomCustomisation can be:<br><br>* `enabled`: Each user of the company can use bubbles.<br>* `disabled`: No user of the company can use bubbles. |
     * | phoneMeetingCustomisation | String | Activate/Deactivate the capability for a user to use phone meetings (PSTN conference).  <br>Define if a user has the right to join phone meetings.  <br>phoneMeetingCustomisation can be:<br><br>* `enabled`: Each user of the company can join phone meetings.<br>* `disabled`: No user of the company can join phone meetings. |
     * | useChannelCustomisation | String | Activate/Deactivate the capability for a user to use a channel.  <br>Define if a user has the right to create channels or be a member of channels.  <br>useChannelCustomisation can be:<br><br>* `enabled`: Each user of the company can use some channels.<br>* `disabled`: No user of the company can use some channel. |
     * | useScreenSharingCustomisation | String | Activate/Deactivate the capability for a user to share a screen.  <br>Define if a user has the right to share his screen.  <br>useScreenSharingCustomisation can be:<br><br>* `enabled`: Each user of the company can share his screen.<br>* `disabled`: No user of the company can share his screen. |
     * | useWebRTCVideoCustomisation | String | Activate/Deactivate the capability for a user to switch to a Web RTC video conversation.  <br>Define if a user has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call).  <br>useWebRTCVideoCustomisation can be:<br><br>* `enabled`: Each user of the company can switch to a Web RTC video conversation.<br>* `disabled`: No user of the company can switch to a Web RTC video conversation. |
     * | useWebRTCAudioCustomisation | String | Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation.  <br>Define if a user has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call).  <br>useWebRTCVideoCustomisation can be:<br><br>* `enabled`: Each user of the company can switch to a Web RTC audio conversation.<br>* `disabled`: No user of the company can switch to a Web RTC audio conversation. |
     * | instantMessagesCustomisation | String | Activate/Deactivate the capability for a user to use instant messages.  <br>Define if a user has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications.  <br>instantMessagesCustomisation can be:<br><br>* `enabled`: Each user of the company can use instant messages.<br>* `disabled`: No user of the company can use instant messages. |
     * | userProfileCustomisation | String | Activate/Deactivate the capability for a user to modify his profile.  <br>Define if a user has the right to modify the globality of his profile and not only (title, firstName, lastName).  <br>userProfileCustomisation can be:<br><br>* `enabled`: Each user of the company can modify his profile.<br>* `disabled`: No user of the company can modify his profile. |
     * | fileStorageCustomisation | String | Activate/Deactivate the capability for a user to access to Rainbow file storage.  <br>Define if a user has the right to upload/download/copy or share documents.  <br>fileStorageCustomisation can be:<br><br>* `enabled`: Each user of the company can manage and share files.<br>* `disabled`: No user of the company can manage and share files. |
     * | overridePresenceCustomisation | String | Activate/Deactivate the capability for a user to change manually his presence.  <br>Define if a user has the right to change his presence manually or only use automatic states.  <br>overridePresenceCustomisation can be:<br><br>* `enabled`: Each user of the company can change his presence.<br>* `disabled`: No user of the company can change his presence. |
     * | alertNotificationReception | String | Activate/Deactivate the capability for a user to receive alert notification.  <br>Define if a user has the right to receive alert notification  <br>alertNotificationReception can be:<br><br>* `enabled`: Each user of the company can receive alert notification.<br>* `disabled`: No user of the company can receive alert notification. |
     * | alertNotificationSending | String | Activate/Deactivate the capability for a user to send alert notification.  <br>Define if a user has the right to send alert notification  <br>alertNotificationSending can be:<br><br>* `enabled`: Each user of the company can send alert notification.<br>* `disabled`: No user of the company can send alert notification. |
     * | changeTelephonyCustomisation | String | Activate/Deactivate the ability for a user to modify some telephony settings.  <br>Define if a user has the right to modify telephony settings like forward activation ....  <br>changeTelephonyCustomisation can be:<br><br>* `enabled`: The user can modify telephony settings.<br>* `disabled`: The user can't modify telephony settings. |
     * | changeSettingsCustomisation | String | Activate/Deactivate the ability for a user to change all client general settings.  <br>Define if a user has the right to change his client general settings.  <br>changeSettingsCustomisation can be:<br><br>* `enabled`: The user can change all client general settings.<br>* `disabled`: The user can't change any client general setting. recordingConversationCustomisation Activate/Deactivate the capability for a user to record a conversation.  <br>    Define if a user has the right to record a conversation (for P2P and multi-party calls).  <br>    recordingConversationCustomisation can be:<br>* `enabled`: The user can record a peer to peer or a multi-party call.<br>* `disabled`: The user can't record a peer to peer or a multi-party call. |
     * | useGifCustomisation | String | Activate/Deactivate the ability for a user to Use GIFs in conversations.  <br>Define if a user has the is allowed to send animated GIFs in conversations  <br>useGifCustomisation can be:<br><br>* `enabled`: The user can send animated GIFs in conversations.<br>* `disabled`: The user can't send animated GIFs in conversations. |
     * | useDialOutCustomisation | String | Activate/Deactivate the capability for a user to use dial out in phone meetings.  <br>Define if a user is allowed to be called by the Rainbow conference bridge.  <br>useDialOutCustomisation can be:<br><br>* `enabled`: The user can be called by the Rainbow conference bridge.<br>* `disabled`: The user can't be called by the Rainbow conference bridge. |
     * | fileCopyCustomisation | String | Activate/Deactivate the capability for a user to copy files  <br>Define if one or all users of a company is allowed to copy any file he receives in his personal cloud space.  <br>fileCopyCustomisation can be:<br><br>* `enabled`: The user can make a copy of a file to his personal cloud space.<br>* `disabled`: The user can't make a copy of a file to his personal cloud space. |
     * | fileTransferCustomisation | String | Activate/Deactivate the ability for a user to transfer files.  <br>Define if one or all users of a company has the right to copy a file from a conversation then share it inside another conversation.  <br>fileTransferCustomisation can be:<br><br>* `enabled`: The user can transfer a file doesn't belong to him.<br>* `disabled`: The user can't transfer a file doesn't belong to him. |
     * | forbidFileOwnerChangeCustomisation | String | Activate/Deactivate the ability for a user to loose the ownership on one file.  <br>Define if one or all users can drop the ownership of a file to another Rainbow user of the same company  <br>forbidFileOwnerChangeCustomisation can be:<br><br>* `enabled`: The user can't give the ownership of his file.<br>* `disabled`: The user can give the ownership of his file. |
     * | readReceiptsCustomisation | String | Activate/Deactivate the capability for a user to allow a sender to check if a chat message is read.  <br>Defines whether a peer user in a conversation allows the sender of a chat message to see if this IM is acknowledged by the peer.  <br>This right is used by Ucaas or Cpaas application to show either or not a message is acknowledged. No check is done on backend side.  <br>readReceiptsCustomisation can be:<br><br>* `enabled`: Each user of the company allow the sender to check if an IM is read.<br>* `disabled`: No user of the company allow the sender to check if an IM is read. |
     * | useSpeakingTimeStatistics | String | Activate/Deactivate the ability for a user to see speaking time statistics..  <br>Defines whether a user has the right to see for a given meeting the speaking time for each attendee of this meeting.  <br>useSpeakingTimeStatistics can be:<br><br>* `enabled`: Each user of the company can use meeting speaking time statistics.<br>* `disabled`: No user of the company can use meeting speaking time statistics. |
     * | defaultLicenseGroup | String | Group of license to assign to user when finalizing his account (e.g. Enterprise, Business ...) |
     * | defaultOptionsGroups | String\[\] | List of options to assign to user when finalizing his account (e.g. Alert ...) |
     * | selectedThemeCustomers optionnel | Object | Set the selected theme(s) for customers of this BP company.  <br>This attribute only applies for BP companies. |
     * | light optionnel | String | Set the selected theme light for customers of this BP company. |
     * | dark optionnel | String | Set the selected theme dark for customers of this BP company. |
     * | ddiReadOnly optionnel | Boolean | Indicates if admin of IR company is allowed to create or delete a DDI. Used only on IR companies. |
     * | locked optionnel | Boolean | Allow to lock selected theme for customers. If true, customers won't be able to manage themes (create/update/delete). |
     * | customData optionnel | Object | Company's custom data.  <br>Object with free keys/values.  <br>It is up to the client to manage the company's customData (new customData provided overwrite the existing one).  <br>  <br>Restrictions on customData Object:<br><br>* max 10 keys,<br>* max key length: 64 characters,<br>* max value length: 512 characters. |
     *
     * @fulfil {Object} - result
     * @category async
     * @param {string} name Company name
     * @param {string} visibility Company visibility (define if users being in this company can be searched by users being in other company). </br>
     * Under the same organisation, a company can choose the visibility=organisation. That means users belonging to this company are visible for users of foreign companies having the same visibility inside the same organisation. </br>
     * The visibility=organisation is same as visibility=private outside the organisation. That is to say users can't be searched. </br>
     * Default value : public. Possibles values public, private, organisation
     * @param {string} country Company country
     * @param {string} state When country is 'USA' or 'CAN', a state must be defined. Else it is not managed.
     * @param {string} slogan A free string corresponding to the slogan of the company
     * @param {string} description A free string that describes the company
     * @param {string} size An overview of the number of employees </br> Possibles values "self-employed", "1-10 employees", "11-50 employees", "51-200 employees", "201-500 employees", "501-1000 employees", "1001-5000 employees", "5001-10,000 employees", "10,001+ employees"
     * @param {string} economicActivityClassification Classification of economic Activity
     * @param {string} website Company website URL
     * @param {string} avatarShape Company's avatar customization
     * @param {boolean} giphyEnabled Whether or not giphy feature is enabled for users belonging to this company (possibility to use animated gifs in conversations)
     */
    createCompanyFromDefault(name : string, visibility : string = "public", country? : string, state? : string, slogan? : string, description? : string, size? : string, economicActivityClassification ? : string, website ? : string, avatarShape ? : string, giphyEnabled? : boolean ) {
        let that = this;

        that._logger.log("internal", LOG_ID + "(createCompanyFromDefault) parameters : strName : ", name,", country : ", country);

        return new Promise(function (resolve, reject) {
            try {
                if (!name) {
                    that._logger.log("error", LOG_ID + "(createCompanyFromDefault) bad or empty 'name' parameter");
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    return;
                }

                that._rest.createCompanyFromDefault(name, visibility, country, state, slogan, description, size, economicActivityClassification , website, avatarShape, giphyEnabled).then((company) => {
                    that._logger.log("internal", LOG_ID + "(createCompanyFromDefault) Successfully created company : ", name);
                    resolve(company);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createCompanyFromDefault) ErrorManager when creating");
                    that._logger.log("internalerror", LOG_ID + "(createCompanyFromDefault) ErrorManager when creating : ", name);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createCompanyFromDefault) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllCompaniesVisibleByUser
     * @instance
     * @description
     *   This API allows users to get all companies. </BR>
     *   Users with user role can only retrieve their own company and companies they can see (companies with visibility=public, companies having user's companyId in visibleBy field, companies being in user's company organization and having visibility=organization, BP company of user's company). </BR>
     *   Users with analytics can retrieve all companies, but only the following fields are returned: id, creationDate, status, statusUpdatedDate, visibility, visibleBy, organisationId </BR>
     * @async
     * @category Companies and users management
     * @return {Promise<Object, ErrorManager>} - result
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object\[\] | List of company Objects. |
     * | limit | Number | Number of requested items |
     * | offset | Number | Requested position of the first item to retrieve |
     * | total | Number | Total number of items |
     * 
     * @fulfil {Object} - the result
     * @category async
     * @param {string} format Allows to retrieve more or less company details in response. </BR>
     * * small: id, name </BR>
     * * medium: id, name, status, adminEmail, companyContactId, country, website, slogan, description, size, economicActivityClassification, lastAvatarUpdateDate, lastBannerUpdateDate, avatarShape </BR>
     * * full: id, name, status, adminEmail, companyContactId, country, website, slogan, description, size, economicActivityClassification, lastAvatarUpdateDate, lastBannerUpdateDate, avatarShape </BR>
     * Default value : small. Possibles values : small, medium, full
     * @param {string} sortField Sort items list based on the given field. Default value : name
     * @param {number} limit Allow to specify the number of items to retrieve. Default value : 100. 
     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned. Default value : 0
     * @param {number} sortOrder Specify order when sorting items list. Default value : 1. Possibles values -1, 1
     * @param {string} name Allows to filter companies list on the given keyword(s) on field name. </BR>
     * The filtering is case insensitive and on partial name match: all companies containing the provided name value will be returned (whatever the position of the match).
     * Ex: if filtering is done on comp, companies with the following names are match the filter 'My company', 'Company', 'A comp 1', 'Comp of comps', ...
     * @param {string} status Allows to filter companies list on the provided status(es). Possibles values initializing, active, alerting, hold, terminated
     * @param {string} visibility Allows to filter companies list on the provided visibility(ies). Possibles values public, private, organization, closed, isolated
     * @param {string} organisationId Allows to filter companies list on the organisationIds provided in this option. This filter can only be used if user has role(s) superadmin, support, bp_admin or admin
     * @param {boolean} isBP Allows to filter companies list on isBP field: </BR>
     * * true returns only Business Partner companies, </BR>
     * * false return only companies which are not Business Partner. </BR>
     * This filter can only be used if user has role(s) superadmin, business_admin,customer_success_admin, support, bp_admin or admin. </BR>
     * @param {boolean} hasBP Allows to filter companies list on companies being linked or not to a BP: </BR>
     * * true returns only companies linked to a BP (BP IR companies are also returned), </BR>
     * * false return only companies which are not linked to a BP. </BR>
     * This filter can only be used if user has role(s) superadmin, business_admin,customer_success_admin, support or bp_admin. </BR>
     * Users with role bp_admin can only use this filter with value false.
     * @param {string} bpType Allows to filter companies list on bpType field. </BR>
     * This filter allow to get all the Business Partner companies from a given bpType. </BR>
     * Only users with role superadmin, business_admin,customer_success_admin, support or bp_admin can use this filter.
     */
    getAllCompaniesVisibleByUser ( format : string = "small", sortField : string = "name", limit  : number = 100, offset  : number = 0, sortOrder : number = 1, name ? : string, status ? : string, visibility ? : string, organisationId ? : string, isBP ? : boolean, hasBP ? : boolean, bpType ? : string) {
        let that = this;

        that._logger.log("internal", LOG_ID + "(getAllCompaniesVisibleByUser) parameters : strName : ", name);

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getAllCompaniesVisibleByUser(format, sortField, limit, offset, sortOrder, name, status, visibility, organisationId , isBP, hasBP, bpType).then((result) => {
                    that._logger.log("internal", LOG_ID + "(getAllCompaniesVisibleByUser) Successfully getted : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getAllCompaniesVisibleByUser) ErrorManager.");
                    that._logger.log("internalerror", LOG_ID + "(getAllCompaniesVisibleByUser) ErrorManager : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllCompaniesVisibleByUser) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getCompanyAdministrators
     * @instance
     * @description
     *   This API allows users to list users being administrator of a company. </BR>
     *   Users can only retrieve administrators of their own company and administrators of companies visible by their own company (companies being in user's company organisation and having visibility=organization, and companies having user's companyId in visibleBy). </BR>
     *
     *   This API implement pagination, using limit and offset options in query string arguments (default is limit on 100 users). Result sorting can also be done using sort and order options (default is sort on displayName on ascending order). </BR>
     * @async
     * @category Companies and users management
     * @return {Promise<Object, ErrorManager>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | User Object. |
     * | loginEmail | String | DEPRECATED (will be removed in a future release).  </br>User email address (used for login) |
     * | id  | String | User unique identifier |
     * | firstName | String | User first name |
     * | lastName | String | User last name |
     * | jid_im | String | User Jabber IM identifier |
     * | companyId | String | User company unique identifier |
     * | companyName | String | User company name |
     * | lastUpdateDate | Date-Time | Date of last user update (whatever the field updated) |
     * | lastAvatarUpdateDate | Date-Time | Date of last user avatar create/update, null if no avatar |
     * | isTerminated | Boolean | Indicates if the Rainbow account of this user has been deleted |
     * | guestMode | Boolean | Indicated a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration. |
     *
     * @fulfil {Object} - the result
     * @category async
     * @param {string} companyId Company for which list of administrators is requested.
     * @param {string} format Allows to retrieve more or less user details in response. </BR>
     * - small: id, firstName, lastName, displayName, companyId, companyName, isTerminated </BR>
     * - medium: id, firstName, lastName, displayName, jid_im, jid_tel, companyId, companyName, lastUpdateDate, lastAvatarUpdateDate, isTerminated, guestMode </BR>
     * - full: id, firstName, lastName, displayName, nickName, title, jobTitle, department, emails, phoneNumbers, country, state, language, timezone, jid_im, jid_tel, companyId, companyName, lastUpdateDate, lastAvatarUpdateDate, isTerminated, guestMode, lastOfflineMailReceivedDate </BR>
     * Default value : small. Possibles values : small, medium, full
     * @param {number} limit Allow to specify the number of items to retrieve. Default value : 100. 
     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned. Default value : 0
     */
    getCompanyAdministrators (companyId? : string, format : string = "small", limit : number = 100, offset : number = 0) {
        let that = this;

        that._logger.log("internal", LOG_ID + "(getCompanyAdministrators) parameters : companyId : ", companyId);

        return new Promise(function (resolve, reject) {
            try {
                companyId = companyId? companyId : that._rest.account.companyId;

                that._rest.getCompanyAdministrators (companyId, format, limit, offset).then((result) => {
                    that._logger.log("internal", LOG_ID + "(getCompanyAdministrators) Successfully getted : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getCompanyAdministrators) ErrorManager.");
                    that._logger.log("internalerror", LOG_ID + "(getCompanyAdministrators) ErrorManager : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllCompaniesVisibleByUser) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method createCompany
     * @instance
     * @description
     *      Create a company </BR>
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
     *      Create a new user in a given company </BR>
     * @param {string} email The email of the user to create
     * @param {string} password The associated password
     * @param {string} firstname The user firstname
     * @param {string} lastname  The user lastname
     * @param {string} [companyId="user company"] The Id of the company where to create the user or the connected user company if null
     * @param {string} [language="en-US"] The language of the user. Default is `en-US`. Can be fr-FR, de-DE...
     * @param {boolean} [isCompanyAdmin=false] True to create the user with the right to manage the company (`companyAdmin`). False by default.
     * @param {Array<string>} [roles] The roles the created user. Default value : ["user"].
     * @async
     * @category Companies and users management
     * @return {Promise<Contact, ErrorManager>}
     * @fulfil {Contact} - Created contact in company or an error object depending on the result
     * @category async
     */
    createUserInCompany(email: string, password : string, firstname : string, lastname : string, companyId : string, language : string, isCompanyAdmin: boolean = false, roles: Array<string> = ["user"])  : Promise<Contact> {
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

                //that._rest.createUser(email, password, firstname, lastname, companyId, language, isAdmin, roles).then((user : any) => {
                let p_sendInvitationEmail : boolean = false, p_doNotAssignPaidLicense : boolean = false, p_mandatoryDefaultSubscription : boolean = false,
                        p_companyId : string = companyId, p_loginEmail : string = email, p_customData : any= undefined, p_password : string= password,
                        p_firstName : string= firstname, p_lastName : string= lastname,
                        p_nickName : string= undefined, p_title : string= undefined, p_jobTitle : string= undefined, p_department : string= undefined,
                        p_tags : Array<string>= undefined, p_emails : Array<any>= undefined, p_phoneNumbers : Array<any>= undefined, p_country : string= undefined,
                        p_state : string= undefined, p_language : string= language,
                        p_timezone : string= undefined, p_accountType : string= "free", p_roles : Array<string> = roles,
                        p_adminType : string= undefined, p_isActive : boolean = true, p_isInitialized : boolean = false, p_visibility : string= undefined,
                        p_timeToLive : number= -1, p_authenticationType : string= undefined,
                        p_authenticationExternalUid : string= undefined, p_userInfo1 : string= undefined,
                        p_selectedTheme : string= undefined, p_userInfo2 : string= undefined, p_isAdmin : boolean = isCompanyAdmin;
                if (!p_companyId) {
                    p_companyId = that._rest.account.companyId;
                } // */
                that._rest.createUser(p_sendInvitationEmail , p_doNotAssignPaidLicense , p_mandatoryDefaultSubscription , p_companyId , p_loginEmail , p_customData , p_password , p_firstName , p_lastName ,
                        p_nickName , p_title , p_jobTitle , p_department , p_tags , p_emails , p_phoneNumbers , p_country , p_state , p_language ,
                        p_timezone , p_accountType , p_roles , p_adminType , p_isActive , p_isInitialized , p_visibility, p_timeToLive , p_authenticationType ,
                        p_authenticationExternalUid , p_userInfo1 , p_selectedTheme , p_userInfo2 , p_isAdmin ).then((user : any) => {
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
     * @method createUser
     * @since 2.21.0
     * @instance
     *      Create a new user in providen company, else in Rainbow default companie. </BR>
     * @param {boolean} sendInvitationEmail Indicates if an email will be sent or not to the created user. </br>
     * If enabled, the created user will receive an email to its `loginEmail` address. This email contains a link allowing the user to connect to Rainbow and initialize his account. User will be requested to set his password during this phase - so that the password provided by the administrator is only temporary and changed by the user. </br>
     * To be noted that if no password is provided by the administrator and `sendInvitationEmail` is enabled, a user password is randomly generated. </br>
     * Default value : `false`
     * @param doNotAssignPaidLicense Indicates if a default paid license should be assigned to newly created user. Default value : `false`
     * @param mandatoryDefaultSubscription Indicates if a default paid license must be assigned to newly created user. Default value : `false`
     * @param {string} customData User's custom data. Object with free keys/values. It is up to the client to manage the user's customData (new customData provided overwrite the existing one). </BR>
     * Restrictions on customData Object: </BR>
     * * max 20 keys, </BR>
     * * max key length: 64 characters, </BR>
     * * max value length: 4096 characters. </BR>
     * User customData can only be created/updated by: </BR>
     * * the user himself </BR>
     * * \`company\_admin\` or \`organization\_admin\` of his company, </BR>
     * * \`bp\_admin\` and \`bp\_finance\` of his company, </BR>
     * * \`superadmin\`. </BR>
     * @param {string} password optionnel String User password. Rules: more than 8 characters, </BR>
     * ⚠️ Warning: the minimal password length will soon be increased to 12, planned to be effective mid-june 2023 (8 characters are still accepted until this date) at least 1 capital letter, 1 number, 1 special character. </BR>
     * If password is not set, the user will have to use the reset-password feature to define his password so that he can login to Rainbow (except if the user is configured to use a Single Sign On method (SAML or OIDC)). </BR>
     * @param {string} companyId User company unique identifier (like 569ce8c8f9336c471b98eda1). If not provided, users are attached to a "Default" company. companyName field is automatically filled on server side based on companyId.
     * @param {boolean} isInitialized Is user initialized If isInitialized is set to true and sendInvitationEmail query parameter is set to true, the user receives an email "Your Rainbow account has been activated". Default value : `false`
     * @param {string} loginEmail User email address (used for login). Must be unique (409 error is returned if a user already exists with the same email address).
     * @param {string} firstName User first name
     * @param {string} lastName User last name
     * @param {string} nickName User nickName
     * @param {string} title User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...)
     * @param {string} jobTitle User job title
     * @param {string} department User department
     * @param {Array<string>} tags An Array of free tags associated to the user. </BR>
     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. </BR>
     * `tags` can only be set by users who have administrator rights on the user. The user can't modify the tags. </BR>
     * The tags are visible by the user and all users belonging to his organisation/company, and can be used with the search API to search the user based on his tags. </BR>
     * @param {Array<Object>} emails Array of user emails addresses objects :  </BR>
     * * {string} email User email address </BR>
     * * {string} type User email type. Possibles values : `home`, `work`, `other` </BR>
     * @param {Array<Object>} phoneNumbers Array of user phone numbers objects </BR>
     * * {string} number User phone number (as entered by user). </br>
     * If `number` field is not provided in E164 format, associated `numberE164` field is computed using phoneNumber's `country` field (see below how country field is computed). </br>
     * `number` and `country` fields must match so that `numberE164` can be computed, otherwise an error 400 is returned. </BR>
     * * {string} country Phone number country (ISO 3166-1 alpha3 format). </BR>
     * `country` field is automatically computed using the following algorithm when creating a phoneNumber entry: </BR>
     * * If provided `number` is in E164 format, `country` is computed from E164 number </BR>
     * * Else if `country` field is provided in the phoneNumber entry, this one is used </BR>
     * * Else user `country` field is used (or company `country` if country is not provided for the user creation) </BR>
     * Note that in the case provided `number` is not in E164 format, associated `numberE164` field is computed using phoneNumber's `country` field. `number` and `country` field must match so that `numberE164` can be computed, otherwise an error 400 is returned. </BR>
     * * {string} type Phone number type. Note that the `type` of phoneNumbers linked to a PBX (`isFromSystem`=true) can't be changed (their value must be `work`) Possibles values : `home`, `work`, `other`
     * * {string} deviceType Phone number device type. Note that the `deviceType` of phoneNumbers linked to a PBX (`isFromSystem`=true) can't be changed (their value must be `landline`). Possibles values : `landline`, `mobile`, `fax`, `other`
     * * {string} isVisibleByOthers Allow user to choose if the phone number is visible by other users or not. </BR>
     * Note that administrators can see all the phone numbers, even if `isVisibleByOthers` is set to false. </BR>
     * Note that phone numbers linked to a system (`isFromSystem`=true) are always visible, `isVisibleByOthers` can't be set to false for these numbers. </BR>
     * Default value : `true` </BR>
     *  </BR>
     * For each provided phoneNumber Object, the server tries to compute the associated E.164 number (`numberE164` field): </BR>
     * If `number` is already in E.164 format, the value is simply duplicated as is in `numberE164` field, and `country` field is computed from this E.164 number, </BR>
     * Otherwise `numberE164` is computed using provided `number` and `country` field (if `country` is provided this value is used, otherwise user's `country` is set in `country` field). </BR>
     * If `numberE164` can't be computed from `number` and `country` fields, an error 400 is returned (ex: wrong phone number, phone number not matching country code, ...) </BR>
     * System phoneNumbers can't be created using this API, only PCG can create system PhoneNumbers </BR>
     * @param {string} country User country (ISO 3166-1 alpha3 format) The list of allowed countries can be obtained using the API [GET /api/rainbow/enduser/v1.0/countries](/enduser/#api-countries-getCountries)
     * @param {string} state When country is 'USA' or 'CAN', a state can be defined. Else it is not managed (null). </BR>
     * The list of allowed states can be obtained using the API getListOfCountries() for the associated countries. </BR>
     * Possibles values : `null`, `"AA"`, `"AE"`, `"AP"`, `"AK"`, `"AL"`, `"AR"`, `"AZ"`, `"CA"`, `"CO"`, `"CT"`, `"DC"`, `"DE"`, `"FL"`, `"GA"`, `"GU"`, `"HI"`, `"IA"`, `"ID"`, `"IL"`, `"IN"`, `"KS"`, `"KY"`, `"LA"`, `"MA"`, `"MD"`, `"ME"`, `"MI"`, `"MN"`, `"MO"`, `"MS"`, `"MT"`, `"NC"`, `"ND"`, `"NE"`, `"NH"`, `"NJ"`, `"NM"`, `"NV"`, `"NY"`, `"OH"`, `"OK"`, `"OR"`, `"PA"`, `"PR"`, `"RI"`, `"SC"`, `"SD"`, `"TN"`, `"TX"`, `"UT"`, `"VA"`, `"VI"`, `"VT"`, `"WA"`, `"WI"`, `"WV"`, `"WY"`, `"AB"`, `"BC"`, `"MB"`, `"NB"`, `"NL"`, `"NS"`, `"NT"`, `"NU"`, `"ON"`, `"PE"`, `"QC"`, `"SK"`, `"YT"` </BR>
     * @param {string} language User language Language format is composed of locale using format `ISO 639-1`, with optionally the regional variation using `ISO 3166‑1 alpha-2` (separated by hyphen). </BR>
     * Locale part is in lowercase, regional part is in uppercase. Examples: en, en-US, fr, fr-FR, fr-CA, es-ES, es-MX, ... </BR>
     * More information about the format can be found on this [link](https://en.wikipedia.org/wiki/Language_localisation#Language_tags_and_codes). </BR>
     * Possibles values : `"/^([a-z]{2})(?:(?:(-)[A-Z]{2}))?$/"` </BR>
     * @param {string} timezone User timezone name Allowed values: one of the timezone names defined in [IANA tz database](https://www.iana.org/time-zones) Timezone name are composed as follow: `Area/Location` (ex: Europe/Paris, America/New_York,...)
     * @param {string} accountType User subscription type Default value : `free`. Possibles values : `free`, `basic`, `advanced`
     * @param {Array<string>} roles List of user roles The general rule is that a user must have the roles that the wants to assign to someone else. </BR>
     * Examples: </BR>
     * * an `admin` can add or remove the role `admin` to another user of the company(ies) he manages, </BR>
     * * an `bp_admin` can add or remove the role `bp_admin` to another user of the company(ies) he manages, </BR>
     * * an `app_superadmin` can add or remove the role `app_superadmin` to another user... </BR>
     * Here are some explanations regarding the roles available in Rainbow: </BR>
     * * `admin`, `bp_admin` and `bp_finance` roles are related to company management (and resources linked to companies, such as users, systems, subscriptions, ...). </BR>
     * * `bp_admin` and `bp_finance` roles can only be set to users of a BP company (company with isBP=true). </BR>
     * * `app_admin`, `app_support` and `app_superadmin` roles are related to application management. </BR>
     * * `all_company_channels_admin`, `public_channels_admin` and `closed_channels_admin` roles are related to channels management. </BR>
     * * `supervisor` allows users to supervise (telephony) other users from their company. </BR>
     * * This role can be assigned manually to a user using this API, otherwise it is automatically set when a user is a added to a supervision group as supervisor. </BR>
     * * This role can be removed manually to a user using the updateInformationForUser() API, in that case the user is automatically removed from all the supervision groups in which he was supervisor. </BR>
     * * This role is automatically removed from a user when he is removed from the last supervision group in which he was supervisor. </BR>
     * * A user with `webinar_host` role will be able to create webinars. Note: to be able to give this role, company should first subscribe to a webinar offer. </BR>
     * * A user with `attendant` role will be the attendant of the Cloud PBX of its company. Note : to be able to give this role, feature TELEPHONY\_BASIC\_ATTENDANT_CONSOLE must be available for the user , as so this role cannot be assigned during User creation </BR>
     * * A user with admin rights (`admin`, `bp_admin`, `superadmin`) can't change his own roles, except for roles related to channels (`all_company_channels_admin`, `public_channels_admin` and `closed_channels_admin`). </BR>
     * * Only `superadmin` can set `superadmin` and `support` roles to a user. </BR>
     * Default value : `["user"]` </BR>
     * Possibles values : `guest`, `user`, `admin`, `bp_admin`, `bp_finance`, `company_support`, `all_company_channels_admin`, `public_channels_admin`, `closed_channels_admin`, `all_organization_channels_admin`, `organization_public_channels_admin`, `organization_closed_channels_admin`, `app_admin`, `app_support`, `app_superadmin`, `directory_admin`, `supervisor`, `support`, `superadmin`, `webinar_host`, `attendant` </BR>
     * @param {string} adminType Mandatory if roles array contains `admin` role: specifies at which entity level the administrator has admin rights in the hierarchy ORGANIZATIONS/COMPANIES/SITES/SYSTEMS Possibles values : `organization_admin`, `company_admin`, `site_admin`
     * @param {boolean} isActive Is user active. Default value : `true`.
     * @param {string} visibility User visibility. Define if the user can be searched by users being in other company and if the user can search users being in other companies. </BR>
     * Visibility can be: </BR>
     * * `same_than_company`: The same visibility than the user's company's is applied to the user. When this user visibility is used, if the visibility of the company is changed the user's visibility will use this company new visibility. </BR>
     * * `public`: User can be searched by external users / can search external users. User can invite external users / can be invited by external users </BR>
     * * `private`: User **can't** be searched by external users / can search external users. User can invite external users / can be invited by external users </BR>
     * * `closed`: User **can't** be searched by external users / **can't** search external users. User can invite external users / can be invited by external users </BR>
     * * `isolated`: User **can't** be searched by external users / **can't** search external users. User **can't** invite external users / **can't** be invited by external users </BR>
     * * `hotspot`: User can be searched by hotspot attached company's users (users from any company if the user belong to the default company) / can't search any users (even in their company) | user can't invite external users / can be invited by hotspot attached company's users (users from any company if the user belong to the default company) </BR>
     * * `none`: Default value reserved for guest. User **can't** be searched by **any users** (even within the same company) / can search external users. User can invite external users / can be invited by external users External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company. </BR>
     * Possibles values : `same_than_company`, `public`, `private`, `closed`, `isolated`, `hotspot`, `none` </BR>
     * @param {number} timeToLive Duration in second to wait before automatically starting a user deletion from the creation date. </BR>
     * Once the timeToLive has been reached, the user won't be usable to use APIs anymore (error 401523). His account may then be deleted from the database at any moment. </BR>
     * Value -1 means timeToLive is disable (i.e. user account will not expire). </BR>
     * If created user has role `guest` and no timeToLive is provided, a default value of 172800 seconds is set (48 hours). </BR>
     * If created user does not have role `guest` and no timeToLive is provided, a default value of -1 is set (no expiration). </BR>
     * @param {string} authenticationType User authentication type (if not set company default authentication will be used) Possibles values : `DEFAULT`, `RAINBOW`, `SAML`, `OIDC` </BR>
     * @param {string} authenticationExternalUid User external authentication ID (return by identity provider in case of SAML or OIDC authenticationType)
     * @param {string} userInfo1 Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file)
     * @param {string} selectedTheme Set the selected theme for the user.
     * @param {string} userInfo2 2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file)
     * @async
     * @category Companies and users management
     * @return {Promise<Object, ErrorManager>} The result :
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | selectedAppCustomisationTemplate | String | To log the last template applied to the user. |
     * | useSpeakingTimeStatistics | String | Activate/Deactivate the capability for a user to see speaking time statistics.  <br>Defines whether a user has the right to see for a given meeting the speaking time for each attendee of this meeting.  <br>useSpeakingTimeStatistics can be:<br><br>* `same_than_company`: The same useSpeakingTimeStatistics setting than the user's company's is applied to the user. if the useSpeakingTimeStatistics of the company is changed the user's useSpeakingTimeStatistics will use this company new setting.<br>* `enabled`: The user can use meeting speaking time statistics.<br>* `disabled`: The user can't use meeting speaking time statistics. |
     * | readReceiptsCustomisation | String | Activate/Deactivate the capability for a user to allow a sender to check if a chat message is read.  <br>Defines whether a peer user in a conversation allows the sender of a chat message to see if this IM is acknowledged by the peer.  <br>This right is used by Ucaas or Cpaas application to show either or not a message is acknowledged. No check is done on backend side.  <br>readReceiptsCustomisation can be:<br><br>* `same_than_company`: The same readReceiptsCustomisation setting than the user's company's is applied to the user. if the readReceiptsCustomisation of the company is changed the user's readReceiptsCustomisation will use this company new setting.<br>* `enabled`: The user allows the sender to check if an IM is read.<br>* `disabled`: The user doesn't allow the sender to check if an IM is read. |
     * | useDialOutCustomisation | String | Activate/Deactivate the capability for a user to use dial out in phone meetings.  <br>Define if a user is allowed to be called by the Rainbow conference bridge.  <br>useDialOutCustomisation can be:<br><br>* `same_than_company`: The same useDialOutCustomisation setting than the user's company's is applied to the user. if the useDialOutCustomisation of the company is changed the user's useDialOutCustomisation will use this company new setting.<br>* `enabled`: The user can be called by the Rainbow conference bridge.<br>* `disabled`: The user can't be called by the Rainbow conference bridge. |
     * | forbidFileOwnerChangeCustomisation | String | Activate/Deactivate the capability for a user to loose the ownership on one file..  <br>One user can drop the ownership to another Rainbow user of the same company.  <br>forbidFileOwnerChangeCustomisation can be:<br><br>* `same_than_company`: The same forbidFileOwnerChangeCustomisation setting than the user's company's is applied to the user. if the forbidFileOwnerChangeCustomisation of the company is changed the user's forbidFileOwnerChangeCustomisation will use this company new setting.<br>* `enabled`: The user can't give the ownership of his file.<br>* `disabled`: The user can give the ownership of his file. |
     * | fileTransferCustomisation | String | Activate/Deactivate the capability for a user to copy a file from a conversation then share it inside another conversation.  <br>The file cannot be re-shared.  <br>fileTransferCustomisation can be:<br><br>* `same_than_company`: The same fileTransferCustomisation setting than the user's company's is applied to the user. if the fileTransferCustomisation of the company is changed the user's fileTransferCustomisation will use this company new setting.<br>* `enabled`: The user can transfer a file doesn't belong to him.<br>* `disabled`: The user can't transfer a file doesn't belong to him. |
     * | fileCopyCustomisation | String | Activate/Deactivate the capability for one user to copy any file he receives in his personal cloud space  <br>fileCopyCustomisation can be:<br><br>* `same_than_company`: The same fileCopyCustomisation setting than the user's company's is applied to the user. if the fileCopyCustomisation of the company is changed the user's fileCopyCustomisation will use this company new setting.<br>* `enabled`: The user can make a copy of a file to his personal cloud space.<br>* `disabled`: The user can't make a copy of a file to his personal cloud space. |
     * | useGifCustomisation | String | Activate/Deactivate the ability for a user to Use GIFs in conversations.  <br>Define if a user has the is allowed to send animated GIFs in conversations  <br>useGifCustomisation can be:<br><br>* `same_than_company`: The same useGifCustomisation setting than the user's company's is applied to the user. if the useGifCustomisation of the company is changed the user's useGifCustomisation will use this company new setting.<br>* `enabled`: The user can send animated GIFs in conversations.<br>* `disabled`: The user can't send animated GIFs in conversations. |
     * | recordingConversationCustomisation | String | Activate/Deactivate the capability for a user to record a conversation.  <br>Define if a user has the right to record a conversation (for P2P and multi-party calls).  <br>recordingConversationCustomisation can be:<br><br>* `same_than_company`: The same recordingConversationCustomisation setting than the user's company's is applied to the user. if the recordingConversationCustomisation of the company is changed the user's recordingConversationCustomisation will use this company new setting.<br>* `enabled`: The user can record a peer to peer or a multi-party call.<br>* `disabled`: The user can't record a peer to peer or a multi-party call. |
     * | changeSettingsCustomisation | String | Activate/Deactivate the ability for a user to change all client general settings.  <br>changeSettingsCustomisation can be:<br><br>* `same_than_company`: The same changeSettingsCustomisation setting than the user's company's is applied to the user. if the changeSettingsCustomisation of the company is changed the user's changeSettingsCustomisation will use this company new setting.<br>* `enabled`: The user can change all client general settings.<br>* `disabled`: The user can't change any client general setting. |
     * | changeTelephonyCustomisation | String | Activate/Deactivate the ability for a user to modify telephony settings.  <br>Define if a user has the right to modify some telephony settigs like forward activation...  <br>changeTelephonyCustomisation can be:<br><br>* `same_than_company`: The same changeTelephonyCustomisation setting than the user's company's is applied to the user. if the changeTelephonyCustomisation of the company is changed the user's changeTelephonyCustomisation will use this company new setting.<br>* `enabled`: The user can modify telephony settings.<br>* `disabled`: The user can't modify telephony settings. |
     * | overridePresenceCustomisation | String | Activate/Deactivate the capability for a user to use instant messages.  <br>Define if a user has the right to change his presence manually or only use automatic states.  <br>overridePresenceCustomisation can be:<br><br>* `same_than_company`: The same overridePresenceCustomisation setting than the user's company's is applied to the user. if the overridePresenceCustomisation of the company is changed the user's overridePresenceCustomisation will use this company new setting.<br>* `enabled`: The user can change his presence.<br>* `disabled`: The user can't change his presence. |
     * | fileStorageCustomisation | String | Activate/Deactivate the capability for a user to access to Rainbow file storage..  <br>Define if a user has the right to upload/download/copy or share documents.  <br>fileStorageCustomisation can be:<br><br>* `same_than_company`: The same fileStorageCustomisation setting than the user's company's is applied to the user. if the fileStorageCustomisation of the company is changed the user's fileStorageCustomisation will use this company new setting.<br>* `enabled`: The user can manage and share files.<br>* `disabled`: The user can't manage and share files. |
     * | userProfileCustomisation | String | Activate/Deactivate the capability for a user to modify his profile.  <br>Define if a user has the right to modify the globality of his profile and not only (title, firstName, lastName).  <br>userProfileCustomisation can be:<br><br>* `same_than_company`: The same userProfileCustomisation setting than the user's company's is applied to the user. if the userProfileCustomisation of the company is changed the user's userProfileCustomisation will use this company new setting.<br>* `enabled`: The user can modify his profile.<br>* `disabled`: The user can't modify his profile. |
     * | instantMessagesCustomisation | String | Activate/Deactivate the capability for a user to use instant messages.  <br>Define if a user has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications.  <br>instantMessagesCustomisation can be:<br><br>* `same_than_company`: The same instantMessagesCustomisation setting than the user's company's is applied to the user. if the instantMessagesCustomisation of the company is changed the user's instantMessagesCustomisation will use this company new setting.<br>* `enabled`: The user can use instant messages.<br>* `disabled`: The user can't use instant messages. |
     * | useWebRTCAudioCustomisation | String | Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation.  <br>Define if a user has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call).  <br>useWebRTCAudioCustomisation can be:<br><br>* `same_than_company`: The same useWebRTCAudioCustomisation setting than the user's company's is applied to the user. if the useWebRTCAudioCustomisation of the company is changed the user's useWebRTCAudioCustomisation will use this company new setting.<br>* `enabled`: Each user of the company can switch to a Web RTC audio conversation.<br>* `disabled`: No user of the company can switch to a Web RTC audio conversation. |
     * | useWebRTCVideoCustomisation | String | Activate/Deactivate the capability for a user to switch to a Web RTC video conversation.  <br>Define if a user has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call).  <br>useWebRTCVideoCustomisation can be:<br><br>* `same_than_company`: The same useWebRTCVideoCustomisation setting than the user's company's is applied to the user. if the useWebRTCVideoCustomisation of the company is changed the user's useWebRTCVideoCustomisation will use this company new setting.<br>* `enabled`: Each user of the company can switch to a Web RTC video conversation.<br>* `disabled`: No user of the company can switch to a Web RTC video conversation. |
     * | useScreenSharingCustomisation | String | Activate/Deactivate the capability for a user to share a screen.  <br>Define if a user has the right to share his screen.  <br>useScreenSharingCustomisation can be:<br><br>* `same_than_company`: The same useScreenSharingCustomisation setting than the user's company's is applied to the user. if the useScreenSharingCustomisation of the company is changed the user's useScreenSharingCustomisation will use this company new setting.<br>* `enabled`: Each user of the company can share his screen.<br>* `disabled`: No user of the company can share his screen. |
     * | useChannelCustomisation | String | Activate/Deactivate the capability for a user to use a channel.  <br>Define if a user has the right to create channels or be a member of channels.  <br>useChannelCustomisation can be:<br><br>* `same_than_company`: The same useChannelCustomisation setting than the user's company's is applied to the user. if the useChannelCustomisation of the company is changed the user's useChannelCustomisation will use this company new setting.<br>* `enabled`: Each user of the company can use some channels.<br>* `disabled`: No user of the company can use some channel. |
     * | phoneMeetingCustomisation | String | Activate/Deactivate the capability for a user to use phone meetings (PSTN conference).  <br>Define if a user has the right to join phone meetings.  <br>phoneMeetingCustomisation can be:<br><br>* `same_than_company`: The same phoneMeetingCustomisation setting than the user's company's is applied to the user. if the phoneMeetingCustomisation of the company is changed the user's phoneMeetingCustomisation will use this company new setting.<br>* `enabled`: The user can join phone meetings.<br>* `disabled`: The user can't join phone meetings. |
     * | useRoomCustomisation | String | Activate/Deactivate the capability for a user to use bubbles.  <br>Define if a user can create bubbles or participate in bubbles (chat and web conference).  <br>useRoomCustomisation can be:<br><br>* `same_than_company`: The same useRoomCustomisation setting than the user's company's is applied to the user. if the useRoomCustomisation of the company is changed the user's useRoomCustomisation will use this company new setting.<br>* `enabled`: The user can use bubbles.<br>* `disabled`: The user can't use bubbles. |
     * | softphoneOnlyCustomisation | String | Activate/Deactivate the capability for an UCaas application not to offer all Rainbow services and but to focus to telephony services  <br>Define if UCaas apps used by a user of this company must provide Softphone functions, i.e. no chat, no bubbles, no meetings, no channels, and so on.  <br>softphoneOnlyCustomisation can be:<br><br>* `same_than_company`: The same softphoneOnlyCustomisation setting than the user's company's is applied to the user. if the softphoneOnlyCustomisation of the company is changed the user's softphoneOnlyCustomisation will use this company new setting.<br>* `enabled`: The user switch to a softphone mode only.<br>* `disabled`: The user can use telephony services, chat, bubbles, channels meeting services and so on. |
     * | userTitleNameCustomisation | String | Activate/Deactivate the capability for a user to modify his profile (title, firstName, lastName)  <br>Define if the user can change some profile data.  <br>userTitleNameCustomisation can be:<br><br>* `same_than_company`: The same userTitleNameCustomisation setting than the user's company's is applied to the user. if the userTitleNameCustomisation of the company is changed the user's userTitleNameCustomisation will use this company new setting.<br>* `enabled`: Whatever the userTitleNameCustomisation of the company setting, the user can change some profile data.<br>* `disabled`: Whatever the userTitleNameCustomisation of the company setting, the user can't change some profile data. |
     * | fileSharingCustomisation | String | Activate/Deactivate file sharing capability per user  <br>Define if the user can use the file sharing service then, allowed to download and share file.  <br>FileSharingCustomisation can be:<br><br>* `same_than_company`: The same fileSharingCustomisation setting than the user's company's is applied to the user. if the fileSharingCustomisation of the company is changed the user's fileSharingCustomisation will use this company new setting.<br>* `enabled`: Whatever the fileSharingCustomisation of the company setting, the user can use the file sharing service.<br>* `disabled`: Whatever the fileSharingCustomisation of the company setting, the user can't use the file sharing service. |
     * | data | Object | User Object. |
     * | id  | String | User unique identifier |
     * | loginEmail | String | User email address (used for login) |
     * | firstName | String | User first name |
     * | lastName | String | User last name |
     * | displayName | String | User display name (firstName + lastName concatenated on server side) |
     * | nickName optionnel | String | User nickName |
     * | title optionnel | String | User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...) |
     * | jobTitle optionnel | String | User job title |
     * | department optionnel | String | User department |
     * | tags optionnel | String\[\] | An Array of free tags associated to the user.  <br>A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters.  <br>`tags` can only be set by users who have administrator rights on the user. The user can't modify the tags.  <br>The tags are visible by the user and all users belonging to his organisation/company, and can be used with the search API to search the user based on his tags. |
     * | emails | Object\[\] | Array of user emails addresses objects |
     * | email | String | User email address |
     * | type | String | Email type, one of `home`, `work`, `other` |
     * | phoneNumbers | Object\[\] | Array of user phone numbers objects.  <br>Phone number objects can:<br><br>* be created by user (information filled by user),<br>* come from association with a system (pbx) device (association is done by admin). |
     * | phoneNumberId | String | Phone number unique id in phone-numbers directory collection. |
     * | number optionnel | String | User phone number (as entered by user) |
     * | numberE164 optionnel | String | User E.164 phone number, computed by server from `number` and `country` fields |
     * | country | String | Phone number country (ISO 3166-1 alpha3 format)  <br>`country` field is automatically computed using the following algorithm when creating/updating a phoneNumber entry:<br><br>* If `number` is provided and is in E164 format, `country` is computed from E164 number<br>* Else if `country` field is provided in the phoneNumber entry, this one is used<br>* Else user `country` field is used |
     * | isFromSystem | Boolean | Boolean indicating if phone is linked to a system (pbx). |
     * | shortNumber optionnel | String | **\[Only for phone numbers linked to a system (pbx)\]**  <br>If phone is linked to a system (pbx), short phone number (corresponds to the number monitored by PCG).  <br>Only usable within the same PBX.  <br>Only PCG can set this field. |
     * | internalNumber optionnel | String | **\[Only for phone numbers linked to a system (pbx)\]**  <br>If phone is linked to a system (pbx), internal phone number.  <br>Usable within a PBX group.  <br>Admins and users can modify this internalNumber field. |
     * | systemId optionnel | String | **\[Only for phone numbers linked to a system (pbx)\]**  <br>If phone is linked to a system (pbx), unique identifier of that system in Rainbow database. |
     * | pbxId optionnel | String | **\[Only for phone numbers linked to a system (pbx)\]**  <br>If phone is linked to a system (pbx), unique identifier of that pbx. |
     * | type | String | Phone number type, one of `home`, `work`, `other`. |
     * | deviceType | String | Phone number device type, one of `landline`, `mobile`, `fax`, `other`. |
     * | isVisibleByOthers | Boolean | Allow user to choose if the phone number is visible by other users or not.  <br>Note that administrators can see all the phone numbers, even if `isVisibleByOthers` is set to false.  <br>Note that phone numbers linked to a system (`isFromSystem`=true) are always visible, `isVisibleByOthers` can't be set to false for these numbers. |
     * | country | String | User country (ISO 3166-1 alpha3 format)<br><br>The list of allowed countries can be obtained using the API [GET /api/rainbow/enduser/v1.0/countries](/enduser/#api-countries-getCountries) |
     * | state optionnel | String | When country is 'USA' or 'CAN', a state can be defined. Else it is not managed (null).<br><br>The list of allowed states can be obtained using the API [GET /api/rainbow/enduser/v1.0/countries](/enduser/#api-countries-getCountries) for the associated countries.<br><br>* List of allowed states for `USA`:<br>    * `AA`: "Armed Forces America",<br>    * `AE`: "Armed Forces",<br>    * `AP`: "Armed Forces Pacific",<br>    * `AK`: "Alaska",<br>    * `AL`: "Alabama",<br>    * `AR`: "Arkansas",<br>    * `AZ`: "Arizona",<br>    * `CA`: "California",<br>    * `CO`: "Colorado",<br>    * `CT`: "Connecticut",<br>    * `DC`: Washington DC",<br>    * `DE`: "Delaware",<br>    * `FL`: "Florida",<br>    * `GA`: "Georgia",<br>    * `GU`: "Guam",<br>    * `HI`: "Hawaii",<br>    * `IA`: "Iowa",<br>    * `ID`: "Idaho",<br>    * `IL`: "Illinois",<br>    * `IN`: "Indiana",<br>    * `KS`: "Kansas",<br>    * `KY`: "Kentucky",<br>    * `LA`: "Louisiana",<br>    * `MA`: "Massachusetts",<br>    * `MD`: "Maryland",<br>    * `ME`: "Maine",<br>    * `MI`: "Michigan",<br>    * `MN`: "Minnesota",<br>    * `MO`: "Missouri",<br>    * `MS`: "Mississippi",<br>    * `MT`: "Montana",<br>    * `NC`: "North Carolina",<br>    * `ND`: "North Dakota",<br>    * `NE`: "Nebraska",<br>    * `NH`: "New Hampshire",<br>    * `NJ`: "New Jersey",<br>    * `NM`: "New Mexico",<br>    * `NV`: "Nevada",<br>    * `NY`: "New York",<br>    * `OH`: "Ohio",<br>    * `OK`: "Oklahoma",<br>    * `OR`: "Oregon",<br>    * `PA`: "Pennsylvania",<br>    * `PR`: "Puerto Rico",<br>    * `RI`: "Rhode Island",<br>    * `SC`: "South Carolina",<br>    * `SD`: "South Dakota",<br>    * `TN`: "Tennessee",<br>    * `TX`: "Texas",<br>    * `UT`: "Utah",<br>    * `VA`: "Virginia",<br>    * `VI`: "Virgin Islands",<br>    * `VT`: "Vermont",<br>    * `WA`: "Washington",<br>    * `WI`: "Wisconsin",<br>    * `WV`: "West Virginia",<br>    * `WY`: "Wyoming"<br>* List of allowed states for `CAN`:<br>    * `AB`: "Alberta",<br>    * `BC`: "British Columbia",<br>    * `MB`: "Manitoba",<br>    * `NB`: "New Brunswick",<br>    * `NL`: "Newfoundland and Labrador",<br>    * `NS`: "Nova Scotia",<br>    * `NT`: "Northwest Territories",<br>    * `NU`: "Nunavut",<br>    * `ON`: "Ontario",<br>    * `PE`: "Prince Edward Island",<br>    * `QC`: "Quebec",<br>    * `SK`: "Saskatchewan",<br>    * `YT`: "Yukon"<br><br>Possibles values : `null`, `"AA"`, `"AE"`, `"AP"`, `"AK"`, `"AL"`, `"AR"`, `"AZ"`, `"CA"`, `"CO"`, `"CT"`, `"DC"`, `"DE"`, `"FL"`, `"GA"`, `"GU"`, `"HI"`, `"IA"`, `"ID"`, `"IL"`, `"IN"`, `"KS"`, `"KY"`, `"LA"`, `"MA"`, `"MD"`, `"ME"`, `"MI"`, `"MN"`, `"MO"`, `"MS"`, `"MT"`, `"NC"`, `"ND"`, `"NE"`, `"NH"`, `"NJ"`, `"NM"`, `"NV"`, `"NY"`, `"OH"`, `"OK"`, `"OR"`, `"PA"`, `"PR"`, `"RI"`, `"SC"`, `"SD"`, `"TN"`, `"TX"`, `"UT"`, `"VA"`, `"VI"`, `"VT"`, `"WA"`, `"WI"`, `"WV"`, `"WY"`, `"AB"`, `"BC"`, `"MB"`, `"NB"`, `"NL"`, `"NS"`, `"NT"`, `"NU"`, `"ON"`, `"PE"`, `"QC"`, `"SK"`, `"YT"` |
     * | language | String | User language (ISO 639-1 code format, with possibility of regional variation. Ex: both 'en' and 'en-US' are supported) |
     * | timezone | String | User timezone name |
     * | jid_im | String | User Jabber IM identifier |
     * | jid_tel | String | User Jabber TEL identifier |
     * | jid_password | String | User Jabber IM and TEL password |
     * | roles | String\[\] | List of user roles (Array of String)  <br>Note: `company_support` role is only used for support redirection. If a user writes a #support ticket and have the role `company_support`, the ticket will be sent to ALE's support (otherwise the ticket is sent to user's company's `supportEmail` address is set, ALE otherwise). |
     * | adminType | String | In case of user's is 'admin', define the subtype (organisation\_admin, company\_admin, site_admin (default undefined) |
     * | companyId | String | User company unique identifier |
     * | organisationId | String | In addition to User companyId, optional identifier to indicate the user belongs also to an organization |
     * | siteId | String | In addition to User companyId, optional identifier to indicate the user belongs also to a site |
     * | companyName | String | User company name |
     * | isInDefaultCompany | Boolean | Is user in default company | 
     * | isActive | Boolean | Is user active |
     * | isInitialized | Boolean | Is user initialized |
     * | initializationDate | Date-Time | User initialization date |
     * | activationDate | Date-Time | User activation date |
     * | creationDate | Date-Time | User creation date |
     * | lastUpdateDate | Date-Time | Date of last user update (whatever the field updated) |
     * | lastAvatarUpdateDate | Date-Time | Date of last user avatar create/update, null if no avatar |
     * | createdBySelfRegister | Boolean | true if user has been created using self register |
     * | createdByAdmin | Object | If user has been created by an admin or superadmin, contain userId and loginEmail of the admin who created this user |
     * | userId | String | userId of the admin who created this user |
     * | loginEmail | String | loginEmail of the admin who created this user |
     * | invitedBy | Object | If user has been created from an email invitation sent by another rainbow user, contain the date the invitation was sent and userId and loginEmail of the user who invited this user |
     * | userId | String | userId of the user who invited this user |
     * | firstLoginDate | Date-Time | Date of first user login (only set the first time user logs in, null if user never logged in) |
     * | loginEmail | String | loginEmail of the user who invited this user |
     * | lastLoginDate | Date-Time | Date of last user login (defined even if user is logged out) |
     * | loggedSince | Date-Time | Date of last user login (null if user is logged out) |
     * | lastSeenDate | Date-Time | Approximate date when the user has been seen on Rainbow (null if user never logged in)  <br>This date is updated:<br><br>* When the user logs in (either from login API, SAML/OIDC SSO, OAuth)<br>* When the token of the user is refreshed (using the API GET /api/rainbow/authentication/v1.0/renew, done automatically by the clients before the token expires and not visible by the user)<br>* When the user logs out |
     * | authenticationType optionnel | String | User authentication type (if not set company default authentication will be used)<br><br>Possibles values : `DEFAULT`, `RAINBOW`, `SAML`, `OIDC` |
     * | authenticationExternalUid optionnel | String | User external authentication ID (return by identity provider in case of SAML or OIDC authenticationType) |
     * | isTerminated | Boolean | Indicates if the Rainbow account of this user has been deleted |
     * | timeToLive | Number | Duration in second to wait before automatically starting a user deletion from the creation date.  <br>Once the timeToLive has been reached, the user won't be usable to use APIs anymore (error 401523). His account may then be deleted from the database at any moment.  <br>Value -1 means timeToLive is disable (i.e. user account will not expire). |
     * | guestMode | Boolean | Indicated a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration. |
     * | userInfo1 | String | Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) |
     * | userInfo2 | String | 2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) |
     * | profiles | Object\[\] | User profile Objects. |
     * | subscriptionId | String | Id of company subscription to which user profile is assigned (one of the subscriptions available to user's company) |
     * | offerId | String | Id of the Rainbow offer to which company subscription is attached |
     * | offerName | String | Name of the Rainbow offer to which company subscription is attached |
     * | profileId | String | Id of the Rainbow profile to which company subscription is attached |
     * | profileName | String | Name of the Rainbow profile to which company subscription is attached |
     * | status | String | Status of the company subscription to which user profile is assigned  <br>  <br>Possible values: `active`, `alerting`, `hold`, `terminated` |
     * | isDefault | Boolean | Indicates if this profile is linked to user's company's subscription to default offer (i.e. Essential) |
     * | assignationDate | String | Date when the subscription was attached to user profile |
     * | canBeSold | Boolean | Indicates if the offer is billed.  <br>Some offers will not be billed (Essential, Demo, ...). |
     * | offerTechnicalDescription optionnel | string | Offer technical description.<br> |
     * | businessModel optionnel | string | Indicates the business model associated to this offer (number of users, usage, ...)<br><br>* `nb_users`: Licencing business model. Subscriptions having this business model are billed according to the number of users bought for it.<br>* `usage`: Subscriptions having this business model are billed based on service consumption (whatever the number of users assigned to the subscription of this offer).<br>* `flat_fee`: Subscriptions having this business model are billed based on a flat fee (same price each month for the company which subscribe to this offer).<br>* `none`: no business model. Should be used for offers which are not sold (like Essential...).<br><br>Default value : `none`<br><br>Possibles values : `nb_users`, `usage`, `flat_fee`, `none` |
     * | businessSpecific optionnel | String\[\] | Indicates if the subscription is related to specific(s) business (for verticals like HDS)<br><br>* `NONE`: This subscription is used if the company does not have a businessSpecific field.<br>* `HDS`: This subscription is used if the company have a businessSpecific HDS (HealthCare).<br><br>Default value : `["NONE"]`<br><br>Possibles values : `NONE`, `HDS` |
     * | isExclusive optionnel | Boolean | Indicates if the offer is exclusive for assignation to a user profile (if the user has already an exclusive offer assigned, it won't be possible to assign a second exclusive offer). |
     * | isPrepaid optionnel | Boolean | Indicates if the profile is linked to a prepaid subscription |
     * | prepaidDuration optionnel | Number | Prepaid subscription duration (in month).  <br>Only set if `isPrepaid` is true. |
     * | provisioningNeeded optionnel | Object\[\] | Array of Objects which indicates if account must be provisioned on other internal components when subscribing to this offer. |
     * | providerType | String | If provisioningNeeded is set, each element of the array must contain providerType. providerType defines the internal component on which the provisioning is needed when subscribing to this offer (provisioning is launched asynchronously when the subscription is created).<br><br>Possibles values : `PGI`, `JANUS` |
     * | pgiEnterpriseId optionnel | String | Only set if provisioningNeeded is set and the element of the array has providerType `PGI`. Corresponds to an enterpriseId to use when provisioning the company account on PSTN Conferencing component.<br><br>Possibles values : `testEnterpriseId`, `internalEnterpriseId`, `genericEnterpriseId` |
     * | mediaType optionnel | String | Only set if provisioningNeeded is set and the element of the array has providerType `JANUS`. Corresponds to the media type to use when provisioning the company account on WebRTC Conferencing component.<br><br>Possibles values : `webrtc` |
     * | zuoraOfferId optionnel | string | ID of the related offer in Zuora (if offer can be sold) |
     * | zuoraProductRatePlanId optionnel | string | ID of the ProductRatePlanId to used in Zuora (if offer can be sold) |
     * | zuoraProductRatePlanChargeId optionnel | string | ID of the ProductRatePlanChargeId used in Zuora (if offer can be sold) |
     * | hasConference optionnel | Boolean | Indicates if the profile contains conference services |
     * | isDemo optionnel | Boolean | Indicates if the profile is linked to a demo subscription |
     * | customData optionnel | Object | User's custom data.  <br>Object with free keys/values.  <br>It is up to the client to manage the user's customData (new customData provided overwrite the existing one).  <br>  <br>Restrictions on customData Object:<br><br>* max 20 keys,<br>* max key length: 64 characters,<br>* max value length: 4096 characters. |
     *
     * @category async
     */
    createUser(sendInvitationEmail: boolean = false, doNotAssignPaidLicense: boolean = false, mandatoryDefaultSubscription: boolean = false,
               companyId: string = undefined, loginEmail: string = undefined, customData: any = undefined, password: string = undefined,
               firstName: string = undefined, lastName: string = undefined,
               nickName: string = undefined, title: string = undefined, jobTitle: string = undefined, department: string = undefined,
               tags: Array<string> = undefined, emails: Array<any> = undefined, phoneNumbers: Array<any> = undefined, country: string = undefined,
               state: string = undefined, language: string = "en-US",
               timezone: string = undefined, accountType: string = "free", roles: Array<string> = ["user"],
               adminType: string = undefined, isActive: boolean = true, isInitialized: boolean = false, visibility: string = undefined,
               timeToLive: number = -1, authenticationType: string = undefined,
               authenticationExternalUid: string = undefined, userInfo1: string = undefined,
               selectedTheme: string = undefined, userInfo2: string = undefined, isAdmin: boolean = false): Promise<Contact> {
        
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.createUser(sendInvitationEmail, doNotAssignPaidLicense, mandatoryDefaultSubscription, companyId, loginEmail, customData, password, firstName, lastName,
                        nickName, title, jobTitle, department, tags, emails, phoneNumbers, country, state, language,
                        timezone, accountType, roles, adminType, isActive, isInitialized, visibility, timeToLive, authenticationType,
                        authenticationExternalUid, userInfo1, selectedTheme, userInfo2, isAdmin).then((user: any) => {
                    that._logger.log("debug", LOG_ID + "(createUser) Successfully created user for account : ", loginEmail);
                    /* let contact = that._contacts.createBasicContact(user.jid_im, undefined);
                    //that._logger.log("internal", LOG_ID + "(_onRosterContactInfoChanged) from server contact before updateFromUserData ", contact);
                    contact.updateFromUserData(user);
                    contact.avatar = that._contacts.getAvatarByContactId(user.id, user.lastAvatarUpdateDate);
                    resolve(contact);
                    // */
                    resolve(user);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createUser) ErrorManager when creating user for account ");
                    that._logger.log("internalerror", LOG_ID + "(createUser) ErrorManager when creating user for account : ", loginEmail);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createUser) error : ", err);
                reject(err);
            }
        });
    }

    /**
     * @public
     * @method createGuestUser
     * @instance
     * @description
     *      Create a new guest user in the same company as the requester admin </BR>
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
     *      Create a new anonymous guest user in the same company as the requester admin   </BR>
     *      Anonymous guest user is user without name and firstname   </BR>
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
     *      Invite a new user to join a company in Rainbow </BR>
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
     *      Change a password for a user </BR>
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
     *      Change information of a user. Fields that can be changed: `firstName`, `lastName`, `nickName`, `title`, `jobTitle`, `country`, `language`, `timezone`, `emails` </BR>
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
     *      Delete an existing user </BR>
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
     * @param {string} format Allows to retrieve more or less company details in response. </BR>
     * - small: _id, name </BR>
     * - medium: id, name, status, adminEmail, companyContactId, country, website, slogan, description, size, economicActivityClassification, lastAvatarUpdateDate, lastBannerUpdateDate, avatarShape, visibility </BR>
     * - full for superadmin, support, business_admin, bp_admin and bp_finance: All fields </BR>
     * - full for admin: All fields except BP fields (bpType, bpBusinessModel, bpApplicantNumber, bpCRDid, bpHasRightToSell, bpHasRightToConnect, bpIsContractAccepted, bpContractAcceptationInfo) </BR>
     *  </BR>
     * Default value : small </BR>
     * Possible values : small, medium, full </BR>
     * @param {string} sortField Sort items list based on the given field. Default value : name
     * @param {string} bpId Allows to filter companies list on bpId field. </BR>
     * This filter allow to get all the End Customer companies associated to a given Business Partner company. </BR>
     * </BR>
     *  Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter. </BR>
     *  Users with role bp_admin or bp_finance can use this filter on their own company. 
     * @param {string} catalogId Allows to filter companies list on catalogId field. </BR>
     *     This filter allow to get all the companies linked to a given catalogId. </BR>
     *         </BR>
     *             Only users with role superadmin, support or business_admin can use this filter. 
     * @param {string} offerId Allows to filter companies list on companies having subscribed to the provided offerId.
     * @param {boolean} offerCanBeSold Allows to filter companies list on companies having subscribed to offers with canBeSold=true. </BR>
     *     This filter can only be used with the value true (false is not relevant, as all companies have a subscription to Essential which has canBeSold=false, so all companies would match offerCanBeSold=false).
     * @param {string} externalReference Allows to filter companies list on externalReference field. </BR>
     *     The search is done on externalReference starting with the input characters, case sensitive (ex: ABC will match companies with externalReference ABC, ABCD, ABC12... ; but externalReference abc, AABC, 1ABC, ... will not match). </BR>
     *          </BR>
     *     Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter.
     * @param {string} externalReference2 Allows to filter companies list on externalReference2 field. </BR>
     *     The search is done on externalReference2 starting with the input characters, case sensitive (ex: ABC will match companies with externalReference2 ABC, ABCD, ABC12... ; but externalReference2 abc, AABC, 1ABC, ... will not match). </BR>
     *         </BR>
     *     Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter.
     * @param {string} salesforceAccountId Allows to filter companies list on salesforceAccountId field. </BR>
     * The search is done on the whole salesforceAccountId, case sensitive (no partial search). </BR>
     *  </BR>
     * Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter. 
     * @param {string} selectedAppCustomisationTemplate Allows to filter companies list on application customisation template applied for the company. </BR>
     *     This filter allows to get a list of companies for which we have applied the same application customisation template. </BR>
     *         </BR>
     *     Only users with role superadmin, support, bp_admin, admin can use this filter.
     * @param {boolean} selectedThemeObj Allows to return selectedTheme attribute as an object: </BR>
     * - true returns selectedTheme as an object (e.g. { "light": "60104754c8fada2ad4be3e48", "dark": "5ea304e4359c0e6815fc8b57" }), </BR>
     * - false return selectedTheme as a string. 
     * @param {string} offerGroupName Allows to filter companies list on companies having subscribed to offers with provided groupName(s). </BR>
     *    Only users with role superadmin, support, business_admin, bp_admin or bp_finance can use this filter. </BR>
     *    groupName can be retrieved from API GET /api/rainbow/subscription/v1.0/companies/:companyId/offers </BR>
     *    The search is done on the whole groupName(s), case sensitive (no partial search). </BR>
     *    Several groupName can be provided, seperated by a space.
     * @param {number} limit Allow to specify the number of items to retrieve. </BR>
     *     Default value : 100
     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). </BR>
     *     Warning: if offset > total, no results are returned.
     * @param {number} sortOrder Specify order when sorting items list. </BR>
     *     Default value : 1 </BR> 
     *     Possible values : -1, 1
     * @param {string} name Allows to filter companies list on the given keyword(s) on field name. </BR>
     *      </BR>
     *     The filtering is case insensitive and on partial name match: all companies containing the provided name value will be returned (whatever the position of the match). </BR>
     *     Ex: if filtering is done on comp, companies with the following names are match the filter 'My company', 'Company', 'A comp 1', 'Comp of comps', ...
     * @param {string} status Allows to filter companies list on the provided status(es) </BR>
     *      </BR>
     *      Possible values : initializing, active, alerting, hold, terminated
     * @param {string} visibility Allows to filter companies list on the provided visibility(ies) </BR>
     *      </BR>
     *      Possible values : public, private, organization, closed, isolated
     * @param {string} organisationId Allows to filter companies list on the organisationIds provided in this option. </BR>
     *      </BR>
     *      This filter can only be used if user has role(s) superadmin, support, bp_admin or admin
     * @param {boolean} isBP Allows to filter companies list on isBP field: </BR>
     *      </BR>
     *      true returns only Business Partner companies, </BR>
     *      false return only companies which are not Business Partner. </BR>
     *      </BR>
     *      This filter can only be used if user has role(s) superadmin, business_admin, support, bp_admin or admin.
     * @param {boolean} hasBP Allows to filter companies list on companies being linked or not to a BP: </BR>
     *      </BR>
     *      true returns only companies linked to a BP (BP IR companies are also returned), </BR>
     *      false return only companies which are not linked to a BP.
     *      </BR>
     *      This filter can only be used if user has role(s) superadmin, business_admin, support or bp_admin. </BR>
     *      </BR>
     *      Users with role bp_admin can only use this filter with value false.
     * @param {string} bpType Allows to filter companies list on bpType field. </BR>
     *      </BR>
     *      This filter allow to get all the Business Partner companies from a given bpType. </BR>
     *      </BR>
     *      Only users with role superadmin, business_admin, support or bp_admin can use this filter.
     * @instance
     * @description
     *      Get all companies for a given admin following request filters.</BR>
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
     *      Get all users for a given admin </BR>
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
     *  Get a list of users by filters </BR>
     * @async
     * @return {Promise<any, ErrorManager>}
     * @fulfil {any} - Found users or null or an error object depending on the result
     * @param {number} phoneNumbers Allows to filter users list on the given number(s) on their phoneNumbers on the following fields (exact match): </br>
     * * shortNumber
     * * internalNumber
     * * number
     * * numberE164
     * @param {number} phoneNumber Allows to filter users list on the given number(s) on field phoneNumbers.internalNumber (number starts with requested string).
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
    getAllUsersByFilter(phoneNumbers : number,  phoneNumber : number = undefined, searchEmail :string, companyId : string , roles : string ="user", excludeRoles : string, tags : string, departments : string, isTerminated  : string = "false", isActivated : string, fileSharingCustomisation : string, userTitleNameCustomisation : string, softphoneOnlyCustomisation : string,
                        useRoomCustomisation : string,  phoneMeetingCustomisation : string,
                        useChannelCustomisation : string, useScreenSharingCustomisation : string, useWebRTCVideoCustomisation : string, useWebRTCAudioCustomisation : string, instantMessagesCustomisation : string, userProfileCustomisation : string, fileStorageCustomisation : string,
                        overridePresenceCustomisation : string, alert : string, changeTelephonyCustomisation : string, changeSettingsCustomisation : string, recordingConversationCustomisation : string,
                        useGifCustomisation : string, useDialOutCustomisation : string, fileCopyCustomisation : string, fileTransferCustomisation : string, forbidFileOwnerChangeCustomisation : string, readReceiptsCustomisation : string, useSpeakingTimeStatistics : string,
                        selectedAppCustomisationTemplate : string, format : string = "small", limit : string = "100",
                        offset : string, sortField : string = "displayName", sortOrder : string, displayName : string, useEmails : boolean, companyName : string, loginEmail : string, email : string, visibility : string, organisationId : string, siteId : string, jid_im : string, jid_tel : string ): Promise<any> {

        let that = this;

        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(getAllUsersByFilter) contact, Ask the server...");
            that._rest.getAllUsersByFilter(phoneNumbers,  phoneNumber, searchEmail , companyId , roles , excludeRoles , tags , departments , isTerminated  , isActivated , fileSharingCustomisation , userTitleNameCustomisation , softphoneOnlyCustomisation ,
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
     *      Get all users for a given admin in a company </BR>
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
     *      Get all users for a given admin in a company by a search of string in email</BR>
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
     *      Get informations about a user </BR>
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
     *      Set informations about a user </BR>
     * @param {string} userId The id of the user
     * @param {Object} infos The infos of the user : </BR>
     * {string{3..255}}  [infos.loginEmail]      User email address (used for login). </BR>
     * </BR> Must be unique (409 error is returned if a user already exists with the same email address). </BR>
     *  {string{8..64}}   [infos.password]        User password. </BR>
     * </BR> Rules: more than 8 characters, at least 1 capital letter, 1 number, 1 special character. </BR>
     * {string{1..255}}  [infos.firstName]     User first name </BR>
     * {string{1..255}}  [infos.lastName]      User last name </BR>
     * {string{1..255}}  [infos.nickName]      User nickName </BR>
     * {string{1..40}}   [infos.title]         User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...) </BR>
     * {string{1..255}}  [infos.jobTitle]      User job title </BR>
     * {string[]{1..64}} [infos.tags]          An Array of free tags associated to the user. </BR>
     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. </BR>
     * `tags` can only be set by users who have administrator rights on the user. The user can't modify the tags. </BR>
     * The tags are visible by the user and all users belonging to his organisation/company, and can be used with </BR>
     * the search API to search the user based on his tags. </BR>
     * {Object[]}           [infos.emails]        Array of user emails addresses objects </BR>
     * {string{3..255}}          [infos.emails.email]    User email address </BR>
     * {string=home,work,other}  [infos.emails.type]     User email type </BR>
     * {Object[]}           [infos.phoneNumbers]  Array of user phone numbers objects </BR>
     * </BR>
     * </BR><u><i>Note:</i></u> For each provided number, the server tries to compute the associated E.164 number (<code>numberE164</code> field) using provided PhoneNumber country if available, user country otherwise. </BR>
     * If <code>numberE164</code> can't be computed, an error 400 is returned (ex: wrong phone number, phone number not matching country code, ...) </BR>
     * {string{1..32}}   [infos.phoneNumbers.number]    User phone number (as entered by user) </BR>
     * {string{3}}       [infos.phoneNumbers.country]   Phone number country (ISO 3166-1 alpha3 format). Used to compute numberE164 field from number field. </BR>
     * </BR>
     * </BR>If not provided, user country is used by default. </BR>
     * {string=home,work,other}              phoneNumbers.type           Phone number type </BR>
     * {string=landline,mobile,fax,other}    phoneNumbers.deviceType     Phone number device type </BR>
     * {string{3}}       [infos.country]       User country (ISO 3166-1 alpha3 format) </BR>
     * {string=null,"AA","AE","AP","AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","GU","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","PR","RI","SC","SD","TN","TX","UT","VA","VI","VT","WA","WI","WV","WY","AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"} [infos.state] When country is 'USA' or 'CAN', a state can be defined. Else it is not managed. </BR>
     * </BR> USA states code list: </BR>
     * <li> <code>AA</code>:"Armed Forces America", </BR>
     * <li> <code>AE</code>:"Armed Forces", </BR>
     * <li> <code>AP</code>:"Armed Forces Pacific", </BR>
     * <li> <code>AK</code>:"Alaska", </BR>
     * <li> <code>AL</code>:"Alabama", </BR>
     * <li> <code>AR</code>:"Arkansas", </BR>
     * <li> <code>AZ</code>:"Arizona", </BR>
     * <li> <code>CA</code>:"California", </BR>
     * <li> <code>CO</code>:"Colorado", </BR>
     * <li> <code>CT</code>:"Connecticut", </BR>
     * <li> <code>DC</code>:"Washington DC", </BR>
     * <li> <code>DE</code>:"Delaware", </BR>
     * <li> <code>FL</code>:"Florida", </BR>
     * <li> <code>GA</code>:"Georgia", </BR>
     * <li> <code>GU</code>:"Guam", </BR>
     * <li> <code>HI</code>:"Hawaii", </BR>
     * <li> <code>IA</code>:"Iowa", </BR>
     * <li> <code>ID</code>:"Idaho", </BR>
     * <li> <code>IL</code>:"Illinois", </BR>
     * <li> <code>IN</code>:"Indiana", </BR>
     * <li> <code>KS</code>:"Kansas", </BR>
     * <li> <code>KY</code>:"Kentucky", </BR>
     * <li> <code>LA</code>:"Louisiana", </BR>
     * <li> <code>MA</code>:"Massachusetts", </BR>
     * <li> <code>MD</code>:"Maryland", </BR>
     * <li> <code>ME</code>:"Maine", </BR>
     * <li> <code>MI</code>:"Michigan", </BR>
     * <li> <code>MN</code>:"Minnesota", </BR>
     * <li> <code>MO</code>:"Missouri", </BR>
     * <li> <code>MS</code>:"Mississippi", </BR>
     * <li> <code>MT</code>:"Montana", </BR>
     * <li> <code>NC</code>:"North Carolina", </BR>
     * <li> <code>ND</code>:"Northmo Dakota", </BR>
     * <li> <code>NE</code>:"Nebraska", </BR>
     * <li> <code>NH</code>:"New Hampshire", </BR>
     * <li> <code>NJ</code>:"New Jersey", </BR>
     * <li> <code>NM</code>:"New Mexico", </BR>
     * <li> <code>NV</code>:"Nevada", </BR>
     * <li> <code>NY</code>:"New York", </BR>
     * <li> <code>OH</code>:"Ohio", </BR>
     * <li> <code>OK</code>:"Oklahoma", </BR>
     * <li> <code>OR</code>:"Oregon", </BR>
     * <li> <code>PA</code>:"Pennsylvania", </BR>
     * <li> <code>PR</code>:"Puerto Rico", </BR>
     * <li> <code>RI</code>:"Rhode Island", </BR>
     * <li> <code>SC</code>:"South Carolina", </BR>
     * <li> <code>SD</code>:"South Dakota", </BR>
     * <li> <code>TN</code>:"Tennessee", </BR>
     * <li> <code>TX</code>:"Texas", </BR>
     * <li> <code>UT</code>:"Utah", </BR>
     * <li> <code>VA</code>:"Virginia", </BR>
     * <li> <code>VI</code>:"Virgin Islands", </BR>
     * <li> <code>VT</code>:"Vermont", </BR>
     * <li> <code>WA</code>:"Washington", </BR>
     * <li> <code>WI</code>:"Wisconsin", </BR>
     * <li> <code>WV</code>:"West Virginia", </BR>
     * <li> <code>WY</code>:"Wyoming" </BR>
     * </BR> Canada states code list: </BR>
     * <li> <code>AB</code>: "Alberta", </BR>
     * <li> <code>BC</code>: "British Columbia", </BR>
     * <li> <code>MB</code>: "Manitoba", </BR>
     * <li> <code>NB</code>:	"New Brunswick", </BR>
     * <li> <code>NL</code>: "Newfoundland and Labrador", </BR>
     * <li> <code>NS</code>: "Nova Scotia", </BR>
     * <li> <code>NT</code>: "Northwest Territories", </BR>
     * <li> <code>NU</code>: "Nunavut", </BR>
     * <li> <code>ON</code>: "Ontario", </BR>
     * <li> <code>PE</code>: "Prince Edward Island", </BR>
     * <li> <code>QC</code>: "Quebec", </BR>
     * <li> <code>SK</code>: "Saskatchewan", </BR>
     * <li> <code>YT</code>: "Yukon" </BR>
     * {string="/^([a-z]{2})(?:(?:(-)[A-Z]{2}))?$/"}     [infos.language]      User language </BR>
     * </BR> 
     * </BR> Language format is composed of locale using format <code>ISO 639-1</code>, with optionally the regional variation using <code>ISO 3166‑1 alpha-2</code> (separated by hyphen). </BR>
     * </BR> Locale part is in lowercase, regional part is in uppercase. Examples: en, en-US, fr, fr-FR, fr-CA, es-ES, es-MX, ... </BR>
     * </BR> More information about the format can be found on this <a href="https://en.wikipedia.org/wiki/Language_localisation#Language_tags_and_codes">link</a>. </BR>
     * {string}          [infos.timezone]      User timezone name </BR>
     * </BR> Allowed values: one of the timezone names defined in <a href="https://www.iana.org/time-zones">IANA tz database</a> </BR>
     * </BR> Timezone name are composed as follow: <code>Area/Location</code> (ex: Europe/Paris, America/New_York,...) </BR>
     * {string=free,basic,advanced} [infos.accountType=free]  User subscription type </BR>
     * {string[]=guest,user,admin,bp_admin,bp_finance,company_support,all_company_channels_admin,public_channels_admin,closed_channels_admin,app_admin,app_support,app_superadmin,directory_admin,support,superadmin} [infos.roles='["user"]']   List of user roles </BR>
     * </BR>
     * </BR>The general rule is that a user must have the roles that the wants to assign to someone else. </BR>
     * </BR>Examples: </BR>
     * <ul>
     *     <li>an <code>admin</code> can add or remove the role <code>admin</code> to another user of the company(ies) he manages,</li>
     *     <li>an <code>bp_admin</code> can add or remove the role <code>bp_admin</code> to another user of the company(ies) he manages,</li>
     *     <li>an <code>app_superadmin</code> can add or remove the role <code>app_superadmin</code> to another user...</li>
     * </ul>
     * Here are some explanations regarding the roles available in Rainbow: </BR>
     * <ul>
     * <li><code>admin</code>, <code>bp_admin</code> and <code>bp_finance</code> roles are related to company management (and resources linked to companies, such as users, systems, subscriptions, ...).</li>
     * <li><code>bp_admin</code> and <code>bp_finance</code> roles can only be set to users of a BP company (company with isBP=true).</li>
     * <li><code>app_admin</code>, <code>app_support</code> and <code>app_superadmin</code> roles are related to application management.</li>
     * <li><code>all_company_channels_admin</code>, <code>public_channels_admin</code> and <code>closed_channels_admin</code> roles are related to channels management.</li>
     * <li>Only <code>superadmin</code> can set <code>superadmin</code> and <code>support</code> roles to a user.</li>
     * <li>A user with admin rights (admin, bp_admin, superadmin) can't change his own roles, except for roles related to channels (<code>all_company_channels_admin</code>, <code>public_channels_admin</code> and <code>closed_channels_admin</code>).</li>
     * </ul>
     * {string=organization_admin,company_admin,site_admin} [infos.adminType]  Mandatory if roles array contains <code>admin</code> role: specifies at which entity level the administrator has admin rights in the hierarchy ORGANIZATIONS/COMPANIES/SITES/SYSTEMS </BR>
     * {string}  [infos.companyId]             User company unique identifier (like 569ce8c8f9336c471b98eda1) </BR>
     * </BR> companyName field is automatically filled on server side based on companyId. </BR>
     * {boolean} [infos.isActive=true]         Is user active </BR>
     * {boolean} [infos.isInitialized=false]   Is user initialized </BR>
     * {string=private,public,closed,isolated,none} [infos.visibility]  User visibility </BR>
     * </BR> Define if the user can be searched by users being in other company and if the user can search users being in other companies. </BR>
     * - `public`: User can be searched by external users / can search external users. User can invite external users / can be invited by external users </BR>
     * - `private`: User **can't** be searched by external users / can search external users. User can invite external users / can be invited by external users </BR>
     * - `closed`: User **can't** be searched by external users / **can't** search external users. User can invite external users / can be invited by external users </BR>
     * - `isolated`: User **can't** be searched by external users / **can't** search external users. User **can't** invite external users / **can't** be invited by external users </BR>
     * - `none`:  Default value reserved for guest. User **can't** be searched by **any users** (even within the same company) / can search external users. User can invite external users / can be invited by external users </BR>
     * </BR>External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company. </BR>
     * {Number} [infos.timeToLive] Duration in second to wait before automatically starting a user deletion from the creation date. </BR>
     * Once the timeToLive has been reached, the user won't be usable to use APIs anymore (error 401523). His account may then be deleted from the database at any moment. </BR>
     * Value -1 means timeToLive is disable (i.e. user account will not expire). </BR>
     * If created user has role <code>guest</code> and no timeToLive is provided, a default value of 172800 seconds is set (48 hours). </BR>
     * If created user does not have role <code>guest</code> and no timeToLive is provided, a default value of -1 is set (no expiration). </BR>
     * {string=DEFAULT,RAINBOW,SAML} [infos.authenticationType] User authentication type (if not set company default authentication will be used) </BR>
     * {string{0..64}}  [infos.userInfo1]      Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) </BR>
     * {string{0..64}}  [infos.userInfo2]      2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) </BR>
     * {string} selectedTheme Set the selected theme for the user. </BR>
     * {Object} customData  User's custom data. </BR>
     *    key1 	string User's custom data key1. </BR>
     *    key2 	string Company's custom data key2. </BR>
     *  customData can only be created/updated by: </BR>
     *   the user himself, company_admin or organization_admin of his company, bp_admin and bp_finance of his company, superadmin. </BR> 
     *   Restrictions on customData Object: </BR>
     *   max 20 keys, </BR>
     *   max key length: 64 characters, max value length: 512 characters. It is up to the client to manage the user's customData (new customData provided overwrite the existing one). </BR>   
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

    //region Company join company invitations

    /**
     * @public
     * @method acceptJoinCompanyInvitation
     * @instance
     * @since 2.21.0
     * @category Company - Join company invitations
     * @param {string} invitationId Join company invitation unique identifier.
     * @async
     * @description
     *       This API allows to accept a join company invitation received by the user (invitation sent by admin ). <br>
     *       To accept the join company invitation, the user must be in default company (may evolve in the future) <br>
     * @return {Promise<any>} the result of the operation.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Join company invitation unique Id |
     * | companyId | String | Id of the company for which the join company invitation is |
     * | companyName | String | Name of the company for which the join company invitation is (not updated if company name change after invitation creation) |
     * | invitedUserId | String | Unique Id of the Rainbow user invited to join the company (only if invited user already exists in Rainbow) |
     * | invitedUserLoginEmail | String | Email of the Rainbow user invited to join the company |
     * | invitingAdminId | String | Inviting company admin unique Rainbow Id |
     * | invitingAdminLoginEmail | String | Inviting company admin loginEmail |
     * | invitationDate | Date-Time | Date the join company invitation was created |
     * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
     * | requestedNotificationLanguage | String | Requested notification language (used to re-send email request in that language) |
     * | status | String | Join company invitation status: one of `pending`, `accepted`, `auto-accepted`, `declined`, `canceled`, `failed` |
     * | acceptationDate | Date-Time | Date when the join company invitation has been accepted by the user (if applicable) |
     * | declinationDate | Date-Time | Date when the join company invitation has been declined by the user (if applicable) |
     *
     */
    acceptJoinCompanyInvitation (invitationId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(acceptJoinCompanyInvitation) invitationId : " + invitationId);

            if (!invitationId) {
                that._logger.log("debug", LOG_ID + "(acceptJoinCompanyInvitation) bad or empty 'invitationId' parameter : ", invitationId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.acceptJoinCompanyInvitation(invitationId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(acceptJoinCompanyInvitation) result from server : ", result);
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method declineJoinCompanyInvitation
     * @instance
     * @since 2.21.0
     * @category Company - Join company invitations
     * @param {string} invitationId Join company invitation unique identifier.
     * @async
     * @description
     *       This API allows to decline a join company invitation received by the user (invitation sent by admin ). <br>
     *       Invitation must be pending (otherwise error 409 is returned). <br>
     * @return {Promise<any>} the result of the operation.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Join company invitation unique Id |
     * | companyId | String | Id of the company for which the join company invitation is |
     * | companyName | String | Name of the company for which the join company invitation is (not updated if company name change after invitation creation) |
     * | invitedUserId | String | Unique Id of the Rainbow user invited to join the company (only if invited user already exists in Rainbow) |
     * | invitedUserLoginEmail | String | Email of the Rainbow user invited to join the company |
     * | invitingAdminId | String | Inviting company admin unique Rainbow Id |
     * | invitingAdminLoginEmail | String | Inviting company admin loginEmail |
     * | invitationDate | Date-Time | Date the join company invitation was created |
     * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
     * | requestedNotificationLanguage | String | Requested notification language (used to re-send email request in that language) |
     * | status | String | Join company invitation status: one of `pending`, `accepted`, `auto-accepted`, `declined`, `canceled`, `failed` |
     * | acceptationDate | Date-Time | Date when the join company invitation has been accepted by the user (if applicable) |
     * | declinationDate | Date-Time | Date when the join company invitation has been declined by the user (if applicable) |
     *
     */
    declineJoinCompanyInvitation (invitationId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(declineJoinCompanyInvitation) invitationId : " + invitationId);

            if (!invitationId) {
                that._logger.log("debug", LOG_ID + "(declineJoinCompanyInvitation) bad or empty 'invitationId' parameter : ", invitationId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.declineJoinCompanyInvitation(invitationId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(declineJoinCompanyInvitation) result from server : ", result);
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method getJoinCompanyInvitation
     * @instance
     * @since 2.21.0
     * @category Company - Join company invitations
     * @param {string} invitationId Join company invitation unique identifier.
     * @async
     * @description
     *       This API allows to get a join company invitation received by the user using its invitationId (invitation sent by admin ). <br>
     * @return {Promise<any>} the result of the operation.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Join company invitation unique Id |
     * | companyId | String | Id of the company for which the join company invitation is |
     * | companyName | String | Name of the company for which the join company invitation is (not updated if company name change after invitation creation) |
     * | invitedUserId | String | Unique Id of the Rainbow user invited to join the company (only if invited user already exists in Rainbow) |
     * | invitedUserLoginEmail | String | Email of the Rainbow user invited to join the company |
     * | invitingAdminId | String | Inviting company admin unique Rainbow Id |
     * | invitingAdminLoginEmail | String | Inviting company admin loginEmail |
     * | invitationDate | Date-Time | Date the join company invitation was created |
     * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
     * | requestedNotificationLanguage | String | Requested notification language (used to re-send email request in that language) |
     * | status | String | Join company invitation status: one of `pending`, `accepted`, `auto-accepted`, `declined`, `canceled`, `failed` |
     * | acceptationDate | Date-Time | Date when the join company invitation has been accepted by the user (if applicable) |
     * | declinationDate | Date-Time | Date when the join company invitation has been declined by the user (if applicable) |
     *
     */
    getJoinCompanyInvitation (invitationId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(getJoinCompanyInvitation) invitationId : " + invitationId);

            if (!invitationId) {
                that._logger.log("debug", LOG_ID + "(getJoinCompanyInvitation) bad or empty 'invitationId' parameter : ", invitationId);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            that._rest.getJoinCompanyInvitation(invitationId).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(getJoinCompanyInvitation) result from server : ", result);
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method getAllJoinCompanyInvitations
     * @instance
     * @since 2.21.0
     * @category Company - Join company invitations
     * @async
     * @description
     *       This API allows to list all join company invitations received by the user (invitation sent by admin ). <br>
     * @return {Promise<any>} the result of the operation.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object\[\] | List of join company invitation Objects. |
     * | limit | Number | Number of requested items |
     * | offset | Number | Requested position of the first item to retrieve |
     * | total | Number | Total number of items |
     * | id  | String | Join company invitation unique Id |
     * | companyId | String | Id of the company for which the join company invitation is |
     * | companyName | String | Name of the company for which the join company invitation is (not updated if company name change after invitation creation) |
     * | invitedUserId | String | Unique Id of the Rainbow user invited to join the company (only if invited user already exists in Rainbow) |
     * | invitedUserLoginEmail | String | Email of the Rainbow user invited to join the company |
     * | invitingAdminId | String | Inviting company admin unique Rainbow Id |
     * | invitingAdminLoginEmail | String | Inviting company admin loginEmail |
     * | invitationDate | Date-Time | Date the join company invitation was created |
     * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
     * | requestedNotificationLanguage | String | Requested notification language (used to re-send email request in that language) |
     * | status | String | Join company invitation status: one of `pending`, `accepted`, `auto-accepted`, `declined`, `canceled`, `failed` |
     * | acceptationDate | Date-Time | Date when the join company invitation has been accepted by the user (if applicable) |
     * | declinationDate | Date-Time | Date when the join company invitation has been declined by the user (if applicable) |
     *
     * @param {string} sortField Sort items list based on the given field. Default value : `lastNotificationDate`
     * @param {string} status List all join company invitations having the provided status(es). Possibles values : `=pending`, `accepted`, `auto-accepted`, `declined`, `canceled`, `failed`
     * @param {string} format Allows to retrieve more or less invitation details in response.
     * - `small`: id, companyId, invitedUserId, invitedUserLoginEmail, invitingAdminId, status
     * - `medium`: id, companyId, companyName, invitedUserId, invitedUserLoginEmail, invitingAdminId, invitingAdminLoginEmail, status, lastNotificationDate, invitingDate, acceptationDate, declinationDate
     * - `full`: all join company invitation fields
     * Default value : `small`. Possibles values : `small`, `medium`, `full`
     * @param {number} limit Allow to specify the number of items to retrieve. Default value : `100`
     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned. Default value : `0`
     * @param {number} sortOrder Specify order when sorting items list. Default value : `1`. Possibles values : `-1`, `1`
     */
    getAllJoinCompanyInvitations (sortField : string = "lastNotificationDate", status : string, format : string = "small", limit : number = 100, offset : number = 0, sortOrder : number = 1) {
        let that = this;
        return new Promise((resolve, reject) => {
            that._logger.log("debug", LOG_ID + "(getAllJoinCompanyInvitations) . ");

 
            that._rest.getAllJoinCompanyInvitations(sortField, status, format, limit, offset, sortOrder ).then(async (result) => {
                that._logger.log("internal", LOG_ID + "(getAllJoinCompanyInvitations) result from server : ", result);
                resolve(result);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    //endregion Company join company invitations

    //region Company join company requests

    /**
     * @public
     * @method cancelJoinCompanyRequest
     * @instance
     * @since 2.21.0
     * @category Company - Join company requests
     * @async
     * @description
     *       This API can be used by logged in user to cancel a request to join a company he sent. <br>
     *       Request must be pending or declined (otherwise error 409 is returned). <br>
     *       Once request has been canceled, administrators won't be able to accept or decline it anymore.  <br>
     * @return {Promise<any>} the result of the operation.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Join company request unique Id |
     * | requestingUserId | String | Requesting user unique Rainbow Id |
     * | requestingUserLoginEmail | String | Requesting user email |
     * | requestedCompanyId | String | Unique Id of the company the requesting user wants to join |
     * | requestedCompanyName | String | Name of the company the requesting user wants to join |
     * | status | String | Request status: one of `pending`, `accepted`, `declined`, `canceled` |
     * | requestingDate | Date-Time | Date the request was created |
     * | requestedNotificationLanguage | String | Requested notification language to use if language of company admin is not defined (used to re-send email request in that language) |
     * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
     * | requestedToCompanyAdmin optionnel | Object | If the request was sent to a company administrator this field is present |
     * | companyAdminId | String |     |
     * | requestedCompanyInvitationId | String | If the request was sent using a JoinCompanyInvite id, this field is set with this Id |
     * | companyAdminLoginEmail | String |     |
     *
     * @param {string} joinCompanyRequestId Join company request unique identifier
     */
    cancelJoinCompanyRequest (joinCompanyRequestId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.cancelJoinCompanyRequest(joinCompanyRequestId).then((result : any) => {
                    that._logger.log("debug", LOG_ID + "(cancelJoinCompanyRequest) Successfully.");
                    that._logger.log("internal", LOG_ID + "(cancelJoinCompanyRequest) : result : ", result);
                    resolve(result);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(cancelJoinCompanyRequest) ErrorManager. ");
                    that._logger.log("internalerror", LOG_ID + "(cancelJoinCompanyRequest) ErrorManager error : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("error", LOG_ID + "(cancelJoinCompanyRequest) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getJoinCompanyRequest
     * @instance
     * @since 2.21.0
     * @category Company - Join company requests
     * @async
     * @description
     *       This API allows to get a join company request sent by the user. </br>
     *       This API can only be used by user himself (i.e. userId of logged in user = value of userId parameter in URL). </br>
     *       User must be the one who sent the request (requestingUserId).   </br>
     * @return {Promise<any>} the result of the operation.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Join company request unique Id |
     * | requestingUserId | String | Requesting user unique Rainbow Id |
     * | requestingUserLoginEmail | String | Requesting user email |
     * | requestedCompanyId | String | Unique Id of the company the requesting user wants to join |
     * | requestedCompanyName | String | Name of the company the requesting user wants to join |
     * | status | String | Request status: one of `pending`, `accepted`, `declined`, `canceled` |
     * | requestingDate | Date-Time | Date the request was created |
     * | requestedNotificationLanguage | String | Requested notification language to use if language of company admin is not defined (used to re-send email request in that language) |
     * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
     * | requestedToCompanyAdmin optionnel | Object | If the request was sent to a company administrator this field is present |
     * | companyAdminId | String |     |
     * | requestedCompanyInvitationId | String | If the request was sent using a JoinCompanyInvite id, this field is set with this Id |
     * | companyAdminLoginEmail | String |     |
     *
     * @param {string} joinCompanyRequestId Join company request unique identifier
     */
    getJoinCompanyRequest (joinCompanyRequestId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getJoinCompanyRequest(joinCompanyRequestId).then((result : any) => {
                    that._logger.log("debug", LOG_ID + "(getJoinCompanyRequest) Successfully get Contact Infos");
                    that._logger.log("internal", LOG_ID + "(getJoinCompanyRequest) : result : ", result);
                    resolve(result);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(getJoinCompanyRequest) ErrorManager.");
                    that._logger.log("internalerror", LOG_ID + "(getJoinCompanyRequest) ErrorManager error : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("error", LOG_ID + "(getJoinCompanyRequest) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllJoinCompanyRequests
     * @instance
     * @since 2.21.0
     * @category Company - Join company requests
     * @async
     * @description
     *       This API allows to list all join company requests sent by the user. </br>
     *       This API can only be used by user himself (i.e. userId of logged in user = value of userId parameter in URL). </br>
     * @return {Promise<any>} the result of the operation.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Join company request unique Id |
     * | requestingUserId | String | Requesting user unique Rainbow Id |
     * | requestingUserLoginEmail | String | Requesting user email |
     * | requestedCompanyId | String | Unique Id of the company the requesting user wants to join |
     * | requestedCompanyName | String | Name of the company the requesting user wants to join |
     * | status | String | Request status: one of `pending`, `accepted`, `declined`, `canceled` |
     * | requestingDate | Date-Time | Date the request was created |
     * | requestedNotificationLanguage | String | Requested notification language to use if language of company admin is not defined (used to re-send email request in that language) |
     * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
     * | requestedToCompanyAdmin optionnel | Object | If the request was sent to a company administrator this field is present |
     * | data | Object\[\] | List of join company request Objects. |
     * | limit | Number | Number of requested items |
     * | offset | Number | Requested position of the first item to retrieve |
     * | total | Number | Total number of items |
     * | companyAdminId | String |     |
     * | requestedCompanyInvitationId | String | If the request was sent using a JoinCompanyInvite id, this field is set with this Id |
     * | companyAdminLoginEmail | String |     |
     *
     * @param {string} sortField Sort items list based on the given field<br><br>Default value : `lastNotificationDate`
     * @param {string} status List all join company requests having the provided status(es). Possibles values : `=pending`, `accepted`, `declined`
     * @param {string} format Allows to retrieve more or less requests details in response.<br> * `small`: id, requestingUserId, requestedCompanyId, status<br> * `medium`: id, requestingUserId, requestingUserLoginEmail, requestedCompanyId, status, requestingDate<br> * `full`: all request fields<br>Default value : `small`<br>Possibles values : `small`, `medium`, `full`
     * @param {number} limit Allow to specify the number of items to retrieve.<br>Default value : `100`
     * @param {number} offset Allow to specify the position of first item to retrieve (first item if not specified). Warning: if offset > total, no results are returned.<br>Default value : `0`
     * @param {number} sortOrder Specify order when sorting items list.<br>Default value : `1`. Possibles values : `-1`, `1`
     */
    getAllJoinCompanyRequests (sortField : string = "lastNotificationDate", status : string, format : string = "small", limit : number = 100, offset : number = 0, sortOrder : number = 1) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getAllJoinCompanyRequests(sortField , status, format, limit, offset, sortOrder ).then((result : any) => {
                    that._logger.log("debug", LOG_ID + "(getAllJoinCompanyRequests) Successfully get Contact Infos");
                    that._logger.log("internal", LOG_ID + "(getAllJoinCompanyRequests) : result : ", result);
                    resolve(result);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(getAllJoinCompanyRequests) ErrorManager.");
                    that._logger.log("internalerror", LOG_ID + "(getAllJoinCompanyRequests) ErrorManager error : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("error", LOG_ID + "(getAllJoinCompanyRequests) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method resendJoinCompanyRequest
     * @instance
     * @since 2.21.0
     * @category Company - Join company requests
     * @async
     * @description
     *       This API can be used by logged in user to re-send a request to join a company. </br>
     *       This API can only be used by user himself (i.e. userId of logged in user = value of userId parameter in URL). </br>
     *       User must be in Default company and have only user role. </br>
     *       If request is canceled or declined, it is set back to pending and then re-sent. </br>
     *       If request is accepted or auto-accepted, error 409 is returned.  </br>
     * @return {Promise<any>} the result of the operation.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Join company request unique Id |
     * | requestingUserId | String | Requesting user unique Rainbow Id |
     * | requestingUserLoginEmail | String | Requesting user email |
     * | requestedCompanyId | String | Unique Id of the company the requesting user wants to join |
     * | requestedCompanyName | String | Name of the company the requesting user wants to join |
     * | status | String | Request status: one of `pending`, `accepted`, `declined`, `canceled` |
     * | requestingDate | Date-Time | Date the request was created |
     * | requestedNotificationLanguage | String | Requested notification language to use if language of company admin is not defined (used to re-send email request in that language) |
     * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
     * | requestedToCompanyAdmin optionnel | Object | If the request was sent to a company administrator this field is present |
     * | companyAdminId | String |     |
     * | requestedCompanyInvitationId | String | If the request was sent using a JoinCompanyInvite id, this field is set with this Id |
     * | companyAdminLoginEmail | String |     |
     *
     * @param {string} joinCompanyRequestId Join company request unique identifier
     */
    resendJoinCompanyRequest (joinCompanyRequestId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.resendJoinCompanyRequest(joinCompanyRequestId).then((result : any) => {
                    that._logger.log("debug", LOG_ID + "(resendJoinCompanyRequest) Successfully get Contact Infos");
                    that._logger.log("internal", LOG_ID + "(resendJoinCompanyRequest) : result : ", result);
                    resolve(result);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(resendJoinCompanyRequest) ErrorManager.");
                    that._logger.log("internalerror", LOG_ID + "(resendJoinCompanyRequest) ErrorManager error : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("error", LOG_ID + "(resendJoinCompanyRequest) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method requestToJoinCompany
     * @instance
     * @since 2.21.0
     * @category Company - Join company requests
     * @async
     * @description
     *       This API allows logged in user to send a request to join a company. </br>
     *       This API can only be used by user himself. </br>
     *       User must be in **Default** company and have only `user` role. </br>
     *       This API can be called with one of these three parameters, depending of the use case: </br>
     *       * `requestedCompanyId`: in the case the company can be found by the user (public company), the user can send the join company request directly using the companyId of the requested company. </br>
     *       In that case, all users having role/admin type company_admin for the requested company will be notified (they will receive an email and a XMPP message (see below)). </br>
     *       * `requestedCompanyAdminId`: in the case the company can not be found by the user (private company), the user must know the loginEmail of a company_admin of the company he wants to join. </br>
     *       He will first have to invite this company_admin by email (invite user process. </br>
     *       Once the company\_admin will be in user's contact, he will be able to request to join company\_admin's company using company_admin id. </br>
     *       All users having role/admin type company\_admin for the requested company\_admin's company will be notified (they will receive an email and a XMPP message (see below)). </br>
     *       * `requestedCompanyLinkId`: in the case the user received a joinCompanyLink Id from a company admin, he can use it to send the join company request to the associated company. </br>
     *       All users having role/admin type company_admin for the company associated to the joinCompanyInvite will be notified (they will receive an email and a XMPP message (see below)). </br> </br>
     * @return {Promise<any>} the result of the operation.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Join company request unique Id |
     * | requestingUserId | String | Requesting user unique Rainbow Id |
     * | requestingUserLoginEmail | String | Requesting user email |
     * | requestedCompanyId | String | Unique Id of the company the requesting user wants to join |
     * | requestedCompanyName | String | Name of the company the requesting user wants to join |
     * | status | String | Request status: one of `pending`, `accepted`, `declined`, `canceled` |
     * | requestingDate | Date-Time | Date the request was created |
     * | requestedNotificationLanguage | String | Requested notification language to use if language of company admin is not defined (used to re-send email request in that language) |
     * | lastNotificationDate | Date-Time | Date when the last email notification was sent |
     * | requestedToCompanyAdmin optionnel | Object | If the request was sent to a company administrator this field is present |
     * | companyAdminId | String |     |
     * | requestedCompanyInvitationId | String | If the request was sent using a JoinCompanyInvite id, this field is set with this Id |
     * | companyAdminLoginEmail | String |     |
     *
     * @param {string} requestedCompanyId Id of the company the user wants to join.  <br>  <br>One of `requestedCompanyId`, `requestedCompanyAdminId` or `requestedCompanyLinkId` is mandatory.
     * @param {string} requestedCompanyAdminId Id of the company_admin of the company the user wants to join.  <br>  <br>One of `requestedCompanyId`, `requestedCompanyAdminId` or `requestedCompanyLinkId` is mandatory. 
     * @param {string} requestedCompanyLinkId  Id of the join company invite associated to the company the user wants to join.  <br>  <br>One of `requestedCompanyId`, `requestedCompanyAdminId` or `requestedCompanyLinkId` is mandatory.
     * @param {string} lang Language of the email notification to use if language of company admin is not defined. <br>Language format is composed of locale using format `ISO 639-1`, with optionally the regional variation using `ISO 3166‑1 alpha-2` (separated by hyphen).  <br>Locale part is in lowercase, regional part is in uppercase. Examples: en, en-US, fr, fr-FR, fr-CA, es-ES, es-MX, ...  <br>More information about the format can be found on this [link](https://en.wikipedia.org/wiki/Language_localisation#Language_tags_and_codes).<br>Default value : `en`
     */
    requestToJoinCompany (requestedCompanyId? : string, requestedCompanyAdminId? : string, requestedCompanyLinkId? : string, lang : string = "en" ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.requestToJoinCompany(requestedCompanyId, requestedCompanyAdminId, requestedCompanyLinkId, lang).then((result : any) => {
                    that._logger.log("debug", LOG_ID + "(requestToJoinCompany) Successfully get Contact Infos");
                    that._logger.log("internal", LOG_ID + "(requestToJoinCompany) : result : ", result);
                    resolve(result);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(requestToJoinCompany) ErrorManager.");
                    that._logger.log("internalerror", LOG_ID + "(requestToJoinCompany) ErrorManager : ", err);
                    return reject(err);
                });


            } catch (err) {
                that._logger.log("error", LOG_ID + "(requestToJoinCompany) error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Company join company requests

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
     * @param {string} instantMessagesCustomisation Activate/Deactivate the capability for a user to use instant messages.</BR>
     * Define if one or all users of a company has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications.</BR>
     * </BR>
     * instantMessagesCustomisation can be:</BR>
     * 
     * - enabled: Each user of the company can use instant messages.</BR>
     * - disabled: No user of the company can use instant messages.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} useGifCustomisation Activate/Deactivate the ability for a user to Use GIFs in conversations.</BR>
     * Define if one or all users of a company has the is allowed to send animated GIFs in conversations</BR>
     * </BR>
     * useGifCustomisation can be:</BR>
     * 
     * - enabled: The user can send animated GIFs in conversations.</BR>
     * - disabled: The user can't send animated GIFs in conversations.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} fileSharingCustomisation Activate/Deactivate file sharing capability per company</BR>
     * Define if one or all users of a company can use the file sharing service then, allowed to download and share file.</BR>
     * </BR>
     * fileSharingCustomisation can be:</BR>
     * 
     * - enabled: Each user of the company can use the file sharing service, except when his own capability is set to 'disabled'.</BR>
     * - disabled: Each user of the company can't use the file sharing service, except when his own capability is set to 'enabled'.</BR>
     * </BR>
     * Default value : enabled</BR>
     * @param {string} fileStorageCustomisation Activate/Deactivate the capability for a user to access to Rainbow file storage.</BR>
     * Define if one or all users of a company has the right to upload/download/copy or share documents.</BR>
     * </BR>
     * fileStorageCustomisation can be:</BR>
     * 
     * - enabled: Each user of the company can manage and share files.</BR>
     * - disabled: No user of the company can manage and share files.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} phoneMeetingCustomisation Activate/Deactivate the capability for a user to use phone meetings (PSTN conference).</BR>
     * Define if one or all users of a company has the right to join phone meetings.</BR>
     * </BR>
     * phoneMeetingCustomisation can be:</BR>
     *
     * -  enabled: Each user of the company can join phone meetings.</BR>
     * - disabled: No user of the company can join phone meetings.</BR>
     *</BR>
     *  Default value : enabled
     * @param {string} useDialOutCustomisation Activate/Deactivate the capability for a user to use dial out in phone meetings.</BR>
     * Define if one or all users of a company is allowed to be called by the Rainbow conference bridge.</BR>
     * </BR>
     * useDialOutCustomisation can be:</BR>
     * 
     * - enabled: The user can be called by the Rainbow conference bridge.</BR>
     * - disabled: The user can't be called by the Rainbow conference bridge.</BR>
     *</BR>
     *  Default value : enabled
     * @param {string} useChannelCustomisation Activate/Deactivate the capability for a user to use a channel.</BR>
     * Define if one or all users of a company has the right to create channels or be a member of channels.</BR>
     * </BR>
     * useChannelCustomisation can be:</BR>
     * 
     * - enabled: Each user of the company can use some channels.</BR>
     * - disabled: No user of the company can use some channel.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} useRoomCustomisation Activate/Deactivate the capability for a user to use bubbles.</BR>
     * Define if one or all users of a company can create bubbles or participate in bubbles (chat and web conference).</BR>
     * </BR>
     * useRoomCustomisation can be:</BR>
     * 
     * - enabled: Each user of the company can use bubbles.</BR>
     * - disabled: No user of the company can use bubbles.</BR>
     *</BR>
     *  Default value : enabled
     * @param {string} useScreenSharingCustomisation Activate/Deactivate the capability for a user to share a screen.</BR>
     * Define if a user has the right to share his screen.</BR>
     * </BR>
     * useScreenSharingCustomisation can be:</BR>
     * 
     * - enabled: Each user of the company can share his screen.</BR>
     * - disabled: No user of the company can share his screen.</BR>
     * </BR>
     * @param {string} useWebRTCAudioCustomisation Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation.</BR>
     * Define if one or all users of a company has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call).</BR>
     * </BR>
     * useWebRTCVideoCustomisation can be:</BR>
     * 
     * - enabled: Each user of the company can switch to a Web RTC audio conversation.</BR>
     * - disabled: No user of the company can switch to a Web RTC audio conversation.</BR>
     *</BR>
     * Default value : enabled
     * @param {string} useWebRTCVideoCustomisation Activate/Deactivate the capability for a user to switch to a Web RTC video conversation.</BR>
     * Define if one or all users of a company has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call).</BR>
     * </BR>
     * useWebRTCVideoCustomisation can be:</BR>
     * 
     * - enabled: Each user of the company can switch to a Web RTC video conversation.</BR>
     * - disabled: No user of the company can switch to a Web RTC video conversation.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} recordingConversationCustomisation Activate/Deactivate the capability for a user to record a conversation.</BR>
     * Define if one or all users of a company has the right to record a conversation (for P2P and multi-party calls).</BR>
     * </BR>
     * recordingConversationCustomisation can be:</BR>
     * 
     * - enabled: The user can record a peer to peer or a multi-party call.</BR>
     * - disabled: The user can't record a peer to peer or a multi-party call.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} overridePresenceCustomisation Activate/Deactivate the capability for a user to change manually his presence.</BR>
     * Define if one or all users of a company has the right to change his presence manually or only use automatic states.</BR>
     * </BR>
     * overridePresenceCustomisation can be:</BR>
     * 
     * - enabled: Each user of the company can change his presence.</BR>
     * - disabled: No user of the company can change his presence.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} userProfileCustomisation Activate/Deactivate the capability for a user to modify his profile.</BR>
     * Define if one or all users of a company has the right to modify the globality of his profile and not only (title, firstName, lastName).</BR>
     * </BR>
     * userProfileCustomisation can be:</BR>
     * 
     * - enabled: Each user of the company can modify his profile.</BR>
     * - disabled: No user of the company can modify his profile.</BR>
     *</BR>
     * Default value : enabled
     * @param {string} userTitleNameCustomisation Activate/Deactivate the capability for a user to modify his profile (title, firstName, lastName) per company</BR>
     * Define if one or all users of a company is allowed to change some profile data.</BR>
     * </BR>
     * userTitleNameCustomisation can be:</BR>
     * 
     * - enabled: Each user of the company can change some profile data, except when his own capability is set to 'disabled'.</BR>
     * - disabled: Each user of the company can't change some profile data, except when his own capability is set to 'enabled'.</BR>
     *</BR>
     * Default value : enabled
     * @param {string} changeTelephonyCustomisation Activate/Deactivate the ability for a user to modify telephony settings.</BR>
     * Define if one or all users of a company has the right to modify telephony settings like forward activation ....</BR>
     * </BR>
     * changeTelephonyCustomisation can be:</BR>
     * 
     * - enabled: The user can modify telephony settings.</BR>
     * - disabled: The user can't modify telephony settings.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} changeSettingsCustomisation Activate/Deactivate the ability for a user to change all client general settings.</BR>
     * Define if one or all users of a company has the right to change his client general settings.</BR>
     * </BR>
     * changeSettingsCustomisation can be:</BR>
     * 
     * - enabled: The user can change all client general settings.</BR>
     * - disabled: The user can't change any client general setting.</BR>
     * </BR>
     * Default value : enabled</BR>
     * @param {string} fileCopyCustomisation Activate/Deactivate the capability for a user to copy files</BR>
     * Define if one or all users of a company is allowed to copy any file he receives in his personal cloud space.</BR>
     * </BR>
     * fileCopyCustomisation can be:</BR>
     * 
     * - enabled: The user can make a copy of a file to his personal cloud space.</BR>
     * - disabled: The user can't make a copy of a file to his personal cloud space.</BR>
     * </BR>
     * default value : enabled
     * @param {string} fileTransferCustomisation Activate/Deactivate the ability for a user to transfer files.</BR>
     * Define if one or all users of a company has the right to copy a file from a conversation then share it inside another conversation.</BR>
     * </BR>
     * fileTransferCustomisation can be:</BR>
     * 
     * - enabled: The user can transfer a file doesn't belong to him.</BR>
     * - disabled: The user can't transfer a file doesn't belong to him.</BR>
     * </BR>
     * Default value : enabled</BR>
     * @param {string} forbidFileOwnerChangeCustomisation Activate/Deactivate the ability for a user to loose the ownership on one file.</BR>
     * Define if one or all users can drop the ownership of a file to another Rainbow user of the same company</BR>
     * </BR>
     * forbidFileOwnerChangeCustomisation can be:</BR>
     * 
     * - enabled: The user can't give the ownership of his file.</BR>
     * - disabled: The user can give the ownership of his file.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} readReceiptsCustomisation Activate/Deactivate the ability for a user to allow a sender to check if a chat message is read.</BR>
     * Defines whether a peer user in a conversation allows the sender of a chat message to see if this IM is acknowledged by the peer.</BR>
     * </BR>
     * readReceiptsCustomisation can be:</BR>
     * 
     * - enabled: The user allow the sender to check if an IM is read.</BR>
     * - disabled: The user doesn't allow the sender to check if an IM is read.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} useSpeakingTimeStatistics Activate/Deactivate the ability for a user to see speaking time statistics.</BR>
     * Defines whether a user has the right to see for a given meeting the speaking time for each attendee of this meeting.</BR>
     * </BR>
     * useSpeakingTimeStatistics can be:</BR>
     * 
     * - enabled: The user can use meeting speaking time statistics.</BR>
     * - disabled: The user can't can use meeting speaking time statistics.</BR>
     * </BR>
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
     * @param {string} format Allows to retrieve more or less templates details in response.</BR>  
     * - small: id, name, visibility</BR>
     * - medium: id, name, visibility, visibleBy, type, createdBy, creationDate, ownedByCompany</BR>
     * - full: all fields</BR>
     * </BR>
     * Default value : small</BR>
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
     * @param {string} instantMessagesCustomisation Activate/Deactivate the capability for a user to use instant messages.</BR>
     * Define if one or all users of a company has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications.</BR>
     * </BR>
     * instantMessagesCustomisation can be:</BR>
     *
     * - enabled: Each user of the company can use instant messages.</BR>
     * - disabled: No user of the company can use instant messages.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} useGifCustomisation Activate/Deactivate the ability for a user to Use GIFs in conversations.</BR>
     * Define if one or all users of a company has the is allowed to send animated GIFs in conversations</BR>
     * </BR>
     * useGifCustomisation can be:</BR>
     *
     * - enabled: The user can send animated GIFs in conversations.</BR>
     * - disabled: The user can't send animated GIFs in conversations.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} fileSharingCustomisation Activate/Deactivate file sharing capability per company</BR>
     * Define if one or all users of a company can use the file sharing service then, allowed to download and share file.</BR>
     * </BR>
     * fileSharingCustomisation can be:</BR>
     *
     * - enabled: Each user of the company can use the file sharing service, except when his own capability is set to 'disabled'.</BR>
     * - disabled: Each user of the company can't use the file sharing service, except when his own capability is set to 'enabled'.</BR>
     * </BR>
     * Default value : enabled</BR>
     * @param {string} fileStorageCustomisation Activate/Deactivate the capability for a user to access to Rainbow file storage.</BR>
     * Define if one or all users of a company has the right to upload/download/copy or share documents.</BR>
     * </BR>
     * fileStorageCustomisation can be:</BR>
     *
     * - enabled: Each user of the company can manage and share files.</BR>
     * - disabled: No user of the company can manage and share files.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} phoneMeetingCustomisation Activate/Deactivate the capability for a user to use phone meetings (PSTN conference).</BR>
     * Define if one or all users of a company has the right to join phone meetings.</BR>
     * </BR>
     * phoneMeetingCustomisation can be:</BR>
     *
     * -  enabled: Each user of the company can join phone meetings.</BR>
     * - disabled: No user of the company can join phone meetings.</BR>
     *</BR>
     *  Default value : enabled
     * @param {string} useDialOutCustomisation Activate/Deactivate the capability for a user to use dial out in phone meetings.</BR>
     * Define if one or all users of a company is allowed to be called by the Rainbow conference bridge.</BR>
     * </BR>
     * useDialOutCustomisation can be:</BR>
     *
     * - enabled: The user can be called by the Rainbow conference bridge.</BR>
     * - disabled: The user can't be called by the Rainbow conference bridge.</BR>
     *</BR>
     *  Default value : enabled
     * @param {string} useChannelCustomisation Activate/Deactivate the capability for a user to use a channel.</BR>
     * Define if one or all users of a company has the right to create channels or be a member of channels.</BR>
     * </BR>
     * useChannelCustomisation can be:</BR>
     *
     * - enabled: Each user of the company can use some channels.</BR>
     * - disabled: No user of the company can use some channel.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} useRoomCustomisation Activate/Deactivate the capability for a user to use bubbles.</BR>
     * Define if one or all users of a company can create bubbles or participate in bubbles (chat and web conference).</BR>
     * </BR>
     * useRoomCustomisation can be:</BR>
     *
     * - enabled: Each user of the company can use bubbles.</BR>
     * - disabled: No user of the company can use bubbles.</BR>
     *</BR>
     *  Default value : enabled
     * @param {string} useScreenSharingCustomisation Activate/Deactivate the capability for a user to share a screen.</BR>
     * Define if a user has the right to share his screen.</BR>
     * </BR>
     * useScreenSharingCustomisation can be:</BR>
     *
     * - enabled: Each user of the company can share his screen.</BR>
     * - disabled: No user of the company can share his screen.</BR>
     * </BR>
     * @param {string} useWebRTCAudioCustomisation Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation.</BR>
     * Define if one or all users of a company has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call).</BR>
     * </BR>
     * useWebRTCVideoCustomisation can be:</BR>
     *
     * - enabled: Each user of the company can switch to a Web RTC audio conversation.</BR>
     * - disabled: No user of the company can switch to a Web RTC audio conversation.</BR>
     *</BR>
     * Default value : enabled
     * @param {string} useWebRTCVideoCustomisation Activate/Deactivate the capability for a user to switch to a Web RTC video conversation.</BR>
     * Define if one or all users of a company has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call).</BR>
     * </BR>
     * useWebRTCVideoCustomisation can be:</BR>
     *
     * - enabled: Each user of the company can switch to a Web RTC video conversation.</BR>
     * - disabled: No user of the company can switch to a Web RTC video conversation.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} recordingConversationCustomisation Activate/Deactivate the capability for a user to record a conversation.</BR>
     * Define if one or all users of a company has the right to record a conversation (for P2P and multi-party calls).</BR>
     * </BR>
     * recordingConversationCustomisation can be:</BR>
     *
     * - enabled: The user can record a peer to peer or a multi-party call.</BR>
     * - disabled: The user can't record a peer to peer or a multi-party call.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} overridePresenceCustomisation Activate/Deactivate the capability for a user to change manually his presence.</BR>
     * Define if one or all users of a company has the right to change his presence manually or only use automatic states.</BR>
     * </BR>
     * overridePresenceCustomisation can be:</BR>
     *
     * - enabled: Each user of the company can change his presence.</BR>
     * - disabled: No user of the company can change his presence.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} userProfileCustomisation Activate/Deactivate the capability for a user to modify his profile.</BR>
     * Define if one or all users of a company has the right to modify the globality of his profile and not only (title, firstName, lastName).</BR>
     * </BR>
     * userProfileCustomisation can be:</BR>
     *
     * - enabled: Each user of the company can modify his profile.</BR>
     * - disabled: No user of the company can modify his profile.</BR>
     *</BR>
     * Default value : enabled
     * @param {string} userTitleNameCustomisation Activate/Deactivate the capability for a user to modify his profile (title, firstName, lastName) per company</BR>
     * Define if one or all users of a company is allowed to change some profile data.</BR>
     * </BR>
     * userTitleNameCustomisation can be:</BR>
     *
     * - enabled: Each user of the company can change some profile data, except when his own capability is set to 'disabled'.</BR>
     * - disabled: Each user of the company can't change some profile data, except when his own capability is set to 'enabled'.</BR>
     *</BR>
     * Default value : enabled
     * @param {string} changeTelephonyCustomisation Activate/Deactivate the ability for a user to modify telephony settings.</BR>
     * Define if one or all users of a company has the right to modify telephony settings like forward activation ....</BR>
     * </BR>
     * changeTelephonyCustomisation can be:</BR>
     *
     * - enabled: The user can modify telephony settings.</BR>
     * - disabled: The user can't modify telephony settings.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} changeSettingsCustomisation Activate/Deactivate the ability for a user to change all client general settings.</BR>
     * Define if one or all users of a company has the right to change his client general settings.</BR>
     * </BR>
     * changeSettingsCustomisation can be:</BR>
     *
     * - enabled: The user can change all client general settings.</BR>
     * - disabled: The user can't change any client general setting.</BR>
     * </BR>
     * Default value : enabled</BR>
     * @param {string} fileCopyCustomisation Activate/Deactivate the capability for a user to copy files</BR>
     * Define if one or all users of a company is allowed to copy any file he receives in his personal cloud space.</BR>
     * </BR>
     * fileCopyCustomisation can be:</BR>
     *
     * - enabled: The user can make a copy of a file to his personal cloud space.</BR>
     * - disabled: The user can't make a copy of a file to his personal cloud space.</BR>
     * </BR>
     * default value : enabled
     * @param {string} fileTransferCustomisation Activate/Deactivate the ability for a user to transfer files.</BR>
     * Define if one or all users of a company has the right to copy a file from a conversation then share it inside another conversation.</BR>
     * </BR>
     * fileTransferCustomisation can be:</BR>
     *
     * - enabled: The user can transfer a file doesn't belong to him.</BR>
     * - disabled: The user can't transfer a file doesn't belong to him.</BR>
     * </BR>
     * Default value : enabled</BR>
     * @param {string} forbidFileOwnerChangeCustomisation Activate/Deactivate the ability for a user to loose the ownership on one file.</BR>
     * Define if one or all users can drop the ownership of a file to another Rainbow user of the same company</BR>
     * </BR>
     * forbidFileOwnerChangeCustomisation can be:</BR>
     *
     * - enabled: The user can't give the ownership of his file.</BR>
     * - disabled: The user can give the ownership of his file.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} readReceiptsCustomisation Activate/Deactivate the ability for a user to allow a sender to check if a chat message is read.</BR>
     * Defines whether a peer user in a conversation allows the sender of a chat message to see if this IM is acknowledged by the peer.</BR>
     * </BR>
     * readReceiptsCustomisation can be:</BR>
     *
     * - enabled: The user allow the sender to check if an IM is read.</BR>
     * - disabled: The user doesn't allow the sender to check if an IM is read.</BR>
     * </BR>
     * Default value : enabled
     * @param {string} useSpeakingTimeStatistics Activate/Deactivate the ability for a user to see speaking time statistics.</BR>
     * Defines whether a user has the right to see for a given meeting the speaking time for each attendee of this meeting.</BR>
     * </BR>
     * useSpeakingTimeStatistics can be:</BR>
     *
     * - enabled: The user can use meeting speaking time statistics.</BR>
     * - disabled: The user can't can use meeting speaking time statistics.</BR>
     * </BR>
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
     *      Ask Rainbow for a token on behalf a user </BR>
     *      This allow to not use the secret key on client side </BR>
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
     *      Get presence informations about a user </BR>
     * </BR>
     *      Company admin shall be able to check if a user can be reached or not, by checking the presence information (available, busy, away, etc). </BR>
     *      Admin will have to select a user to get a presence snapshot when opening the user configuration profile. </BR>
     *      A brute force defense is activated when too much request have been requested by the same administrator, to not overload the backend. As a result, an error 429 "Too Many Requests" will be returned . </BR>
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
     *      Method to retrieve all the offers of one company on server. </BR>
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
     * @param {string} format Allows to retrieve more or less subscription details in response. (default value: "small") </BR>
     * - small: id offerId profileId isDefault</BR>
     * - medium: id offerId profileId isDefault maxNumberUsers status</BR>
     * - full: all offer fields, including computed user assignment fields (numberAssignedUsers, nbAssignedBPUsers, nbLicencesAssignedToECs, ...)</BR>
     * @description
     *      Method to retrieve all the subscriptions of one company on server. </BR>
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
     *      Method to get the subscription of one company for one offer. </BR>
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
     *      Method to subscribe one company to one offer. </BR>
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
     *      Method to subscribe one company to offer demo. </BR>
     *      Private offer on .Net platform. </BR>
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
     *      Method to unsubscribe one company to offer demo. </BR>
     *      Private offer on .Net platform. </BR>
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
     *      Method to subscribe one company to offer Alert. </BR>
     *      Private offer on .Net platform. </BR>
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
     *      Method to unsubscribe one company to offer Alert. </BR>
     *      Private offer on .Net platform. </BR>
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
     *      Method to subscribe one company to offer Voice Enterprise. </BR>
     *      Private offer on .Net platform. </BR>
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
     *      Method to unsubscribe one company to offer Voice Enterprise. </BR>
     *      Private offer on .Net platform. </BR>
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
     *      Method to unsubscribe one company to one offer . </BR>
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
     *      Method to subscribe one user to a subscription of the company. </BR>
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
     *      Method to unsubscribe one user to a subscription. </BR>
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
     *      Method to retrieve the profiles of a user by his id. </BR>
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
     * | status | string | Status of the company subscription to which user profile is assigned  </BR>  </BR>Possible values: `active`, `alerting`, `hold`, `terminated` |
     * | isDefault | boolean | Indicates if this profile is linked to user's company's subscription to default offer (i.e. Essential) |
     * | canBeSold | boolean | Indicates if this profile is linked a subscription for a paid offer.  </BR>Some offers are not be sold (Essential, Beta, Demo, ...).  </BR>If canBeSold is true, the subscription is billed. |
     * | businessModel | string | Indicates the business model associated to the subscribed offer (number of users, usage, ...)</BR></BR>* `nb_users`: Licencing business model. Offers having this business model are billed according to the number of users bought for it. This should be the business model for Business and Enterprise offers.</BR>* `usage`: Offers having this business model are billed based on service consumption (whatever the number of users assigned to the subscription of this offer). This should be the business model for Conference offer.</BR>* `none`: no business model. Used for offers which are not sold (like Essential, Beta, ...).</BR></BR>Possible values : `nb_users`, `usage`, `none` |
     * | isExclusive | boolean | Indicates if this profile is relative to a subscription for an exclusive offer (if the user has already an exclusive offer assigned, it won't be possible to assign a second exclusive offer).  </BR>Used on GUI side to know if the subscription to assign to a user profile has to be displayed as a radio button or as a check box. |
     * | isPrepaid | boolean | Indicates if this profile is relative to a subscription for a prepaid offer |
     * | expirationDate | Date-Time | Expiration date of the subscription to the prepaid offer (creationDate + prepaidDuration) |
     * | provisioningNeeded | Object\[\] | Indicates if provisioning is needed on other component when assigning the user profile to this subscription (depends of thus subscribed offer) |
     * | providerType | string | If provisioningNeeded is set, each element of the array must contain providerType. providerType defines the component on which the provisioning is needed when subscribing to this offer (provisioning is launched asynchronously when Business Store confirms through the callback that the subscription is created).</BR></BR>Possible values : `PGI`, `JANUS` |
     * | mediaType optionnel | string | Only set if provisioningNeeded is set and the element of the array has providerType `JANUS`. Corresponds to the media type to use when provisioning the company account on JANUS component.</BR></BR>Possible values : `webrtc` |
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
     *      Method to retrieve the profiles of a user by his email. </BR>
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
     * | status | string | Status of the company subscription to which user profile is assigned  </BR>  </BR>Possible values: `active`, `alerting`, `hold`, `terminated` |
     * | isDefault | boolean | Indicates if this profile is linked to user's company's subscription to default offer (i.e. Essential) |
     * | canBeSold | boolean | Indicates if this profile is linked a subscription for a paid offer.  </BR>Some offers are not be sold (Essential, Beta, Demo, ...).  </BR>If canBeSold is true, the subscription is billed. |
     * | businessModel | string | Indicates the business model associated to the subscribed offer (number of users, usage, ...)</BR></BR>* `nb_users`: Licencing business model. Offers having this business model are billed according to the number of users bought for it. This should be the business model for Business and Enterprise offers.</BR>* `usage`: Offers having this business model are billed based on service consumption (whatever the number of users assigned to the subscription of this offer). This should be the business model for Conference offer.</BR>* `none`: no business model. Used for offers which are not sold (like Essential, Beta, ...).</BR></BR>Possible values : `nb_users`, `usage`, `none` |
     * | isExclusive | boolean | Indicates if this profile is relative to a subscription for an exclusive offer (if the user has already an exclusive offer assigned, it won't be possible to assign a second exclusive offer).  </BR>Used on GUI side to know if the subscription to assign to a user profile has to be displayed as a radio button or as a check box. |
     * | isPrepaid | boolean | Indicates if this profile is relative to a subscription for a prepaid offer |
     * | expirationDate | Date-Time | Expiration date of the subscription to the prepaid offer (creationDate + prepaidDuration) |
     * | provisioningNeeded | Object\[\] | Indicates if provisioning is needed on other component when assigning the user profile to this subscription (depends of thus subscribed offer) |
     * | providerType | string | If provisioningNeeded is set, each element of the array must contain providerType. providerType defines the component on which the provisioning is needed when subscribing to this offer (provisioning is launched asynchronously when Business Store confirms through the callback that the subscription is created).</BR></BR>Possible values : `PGI`, `JANUS` |
     * | mediaType optionnel | string | Only set if provisioningNeeded is set and the element of the array has providerType `JANUS`. Corresponds to the media type to use when provisioning the company account on JANUS component.</BR></BR>Possible values : `webrtc` |
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
     *      Method to retrieve the features profiles of a user by his id. </BR>
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
     *      Method to retrieve the features profiles of a user by his email. </BR>
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
     *     This API checks a CSV UTF-8 content for mass-provisioning. Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. </BR>
     * </BR>
     * @return {Promise<any>} result.
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | * check results summary |
     * | reqId | String | * check request identifier |
     * | mode | String | * request csv mode</BR></BR>Possible values : `user`, `device` |
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
     *     This API allows to delete the report of an import identified by its reqId. </BR>
     * </BR>
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
     *     This API allows to access the report of an import identified by its reqId. </BR>
     * </BR>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | * import report |
     * | reqId | String | * import request identifier |
     * | mode | String | * provisioning mode</BR></BR>Possible values : `user`, `device`, `rainbowvoice` |
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
     * @method getAnImportStatus
     * @since 2.18.0
     * @instance
     * @async
     * @category AD/LDAP - AD/LDAP Massprovisioning
     * @param {string} companyId the company id. Default value is the current company.
     * @description
     *     This API provides a short status of the last import (completed or pending) of a company directory. </BR>
     *          </BR>
     *              superadmin can get the status of the import of the directory of any company. </BR>
     *              bp_admin can only get the status of the import of the directory of their own companies or their End Customer companies. </BR>
     *              organization_admin can only get the status of the import of the directory of the companies under their organization. </BR>
     *              company_admin and directory_admin can only get the status of the import of the directory of their onw companies. </BR>
     * </BR>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object |     |
     * | state | String | Import state</BR></BR>Possible values : `"Initializing"`, `"Creating"`, `"Completed successfully"`, `"Completed with failure"` |
     * | companyId | String | Id of the company of the directory |
     * | userId | String | Id of the requesting user |
     * | displayName | String | Display name of the requesting user |
     * | label | String | Description of the import |
     * | csvHeaders | String | CSV header line (Fields names) |
     * | startTime | String | Import processing start time |
     * | created | Integer | Count of created entries |
     * | failed | Integer | Count of failed entries |
     * 
     */
    getAnImportStatus(companyId? : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                companyId = companyId ? companyId : that._rest.account.companyId;
                
                let result = await that._rest.getAnImportStatus(companyId);
                that._logger.log("debug", "(getAnImportStatus) - sent.");
                that._logger.log("internal", "(getAnImportStatus) - result : ", result);
                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getAnImportStatus) Error.");
                that._logger.log("internalerror", LOG_ID + "(getAnImportStatus) Error : ", err);
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
     *     This API provides information on all imports of the administrator's company. </BR>
     * </BR>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | reqId | String | * import request identifier |
     * | status | String | * import status |
     * | userId | String | * id of the requesting user |
     * | displayName | String | * display name of the requesting user |
     * | mode | String | * provisioning mode</BR></BR>Possible values : `user`, `device`, `rainbowvoice` |
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
     *     This API returns the result of a prior SynchronizeTenantTaskStart that triggers an asynchronous processing for a given tenant. </BR>
     * </BR>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | status optionnel | String | Asynchronous operation status</BR></BR>Possible values : `pending` |
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
     * </BR>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | * import summary |
     * | reqId | String | * import request identifier |
     * | mode | String | * provisioning mode</BR></BR>Possible values : `user`, `device` |
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
     * </BR>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | status | String | Asynchronous operation status</BR></BR>Possible values : `pending` |
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
     * </BR>
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
     * </BR>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | * check results summary |
     * | reqId | String | * check request identifier |
     * | mode | String | * request csv mode</BR></BR>Possible values : `rainbowvoide` |
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
     * </BR>
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
     *     This API allows to synchronize Rainbow users or devices through a CSV UTF-8 encoded file. it is a merge from user mode and device mode </BR>
     *     The first line of the CSV data describes the content format. Most of the field names are the field names of the admin createUser API. </BR>
     * </BR>
     * Supported fields for "user" management are: </BR>
     * __action__  delete, upsert, sync or detach </BR>
     * loginEmail  (mandatory) </BR>
     * password  (mandatory) </BR>
     * title </BR>
     * firstName </BR>
     * lastName </BR>
     * nickName </BR>
     * businessPhone{n}  (n is a number starting from 0 or 1) </BR>
     * mobilePhone{n}  (n is a number starting from 0 or 1) </BR>
     * email{n}  (n is a number starting from 0 or 1) </BR>
     * tags{n}  (n is a number starting from 0 to 4) </BR>
     * jobTitle </BR>
     * department </BR>
     * userInfo1 </BR>
     * userInfo2 </BR>
     * country </BR>
     * language </BR>
     * timezone </BR>
     * visibility </BR>
     * isInitialized </BR>
     * authenticationType </BR>
     * service{n} </BR>
     * accountType </BR>
     * photoUrl </BR>
     * </BR>
     * Supported fields for "device" management are: </BR>
     * loginEmail (mandatory) </BR>
     * pbxId </BR>
     * pbxShortNumber </BR>
     * pbxInternalNumber </BR>
     * number </BR>
     * </BR>
     * detach: allows to detach an PBX extension from a user. delete: allows to delete a user. upsert: allows to modify user (update or create if doesn't exists) and device (force attach if filled) with filled fields. Remark: empty fields are not taken into account. sync: allows to modify user (update or create if doesn't exists) and device (force attach if filled, detach if empty) with filled fields. </BR>
     * Remark: empty fields are taken into account (if a field is empty we will try to update it with empty value). </BR>
     * </BR>
     * Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. Caution: for sync action: </BR>
     * As empty fields are taken into account, all fields must be filled to avoid a reset of these values </BR>
     * As empty fields are taken into account, it is better to avoid mixing sync __action__ with others actions </BR>
     * </BR>
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
     *      This API provides a CSV template. </BR>
     *      result : </BR>
     *      CSV {Object[]} lines with all supported headers and some samples : </BR> 
     *      __action__ {string} Action to perform values : create, update, delete, upsert, detach </BR>
     *      loginEmail {string} email address - Main or professional email used as login </BR>
     *      password optionnel {string} (>= 8 chars with 1 capital+1 number+1 special char) (e.g. This1Pwd!) </BR>
     *      title optionnel {string} (e.g. Mr, Mrs, Dr, ...) </BR>
     *      firstName optionnel {string} </BR>
     *      lastName optionnel {string} </BR>
     *      nickName optionnel {string} </BR>
     *      businessPhone0 optionnel {string} E.164 number - DDI phone number (e.g. +33123456789) </BR>
     *      mobilePhone0 optionnel {string} E.164 number - Mobile phone number (e.g. +33601234567) </BR>
     *      email0 optionnel {string} email address - Personal email </BR>
     *      jobTitle optionnel {string} </BR>
     *      department optionnel {string} </BR>
     *      country optionnel {string} ISO 3166-1 alpha-3 - (e.g. FRA) </BR>
     *      language optionnel {string} ISO 639-1 (en) / with ISO 31661 alpha-2 (en-US) </BR>
     *      timezone optionnel {string} IANA tz database (Europe/Paris) </BR>
     *      pbxShortNumber optionnel {number} PBX extension number </BR>
     *      pbxInternalNumber optionnel {string} E.164 number - Private number when different from extension number </BR>
     *      selectedAppCustomisationTemplateName optionnel {string} Allow to specify an application customisation template for this user. The application customisation template has to be specified using its name (ex: "Chat and Audio", "Custom profile")     Values( Full, Phone, calls, only, Audio, only, Chat, and, Audio, Same, as, company, , profile) </BR>
     *      shortNumber optionnel string subscriber {number} (only for rainbowvoice mode) </BR>
     *      macAddress optionnel {string} macAddress of the associated SIP device of the subscriber (only for rainbowvoice mode) </BR>
     *      ddiE164Number optionnel string E.164 {number} - E164 number of the associted DDI of the subscriber (only for rainbowvoice mode) </BR>
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
     *      This API checks a CSV UTF-8 content for mass-provisioning for useranddevice mode.</BR>
     *      Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. </BR>
     *      { </BR>
     *           actions {Object} actions information </BR>
     *               sync optionnel {number} number of user synchronization actions </BR>
     *               upsert optionnel {number} number of user create/update actions </BR>
     *               delete optionnel {number} number of user remove actions </BR>
     *               detach optionnel {number} number of device unpairing actions </BR>
     *           reqId {string} check request identifier </BR>
     *           mode {string} request csv mode Possible values : user, device </BR>
     *           columns {number} number of columns in the CSV </BR>
     *           delimiter {string} the CSV delimiter </BR>
     *           profiles {Object} the managed profiles </BR>
     *              name {string} the managed profiles name </BR>
     *              valid {boolean} the managed profiles validity </BR>
     *              assignedBefore {number} the assigned number of managed profiles before this import </BR>
     *              assignedAfter {number} the assigned number of managed profiles after this import has been fulfilled </BR>
     *              max number the {maximum} number of managed profiles available </BR>
     *      } </BR>
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
     *      This API retrieves the last checks CSV UTF-8 content for mass-provisioning for useranddevice mode, performed by an admin (using a commandId). </BR>
     * @return {Promise<any>}
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | report | Object | * check results summary |
     * | status | String | * status of the check csv</BR></BR>Possible values : `success`, `failure`, `pending` |
     * | reqId | String | * check request identifier |
     * | mode | String | * request csv mode</BR></BR>Possible values : `user`, `device` |
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
     *      This API allows to perform provisioning for Rainbow Voice (Rainbow Users and Subscribers management + DDIs and Sip devices attachment) through a CSV UTF-8 encoded file. </BR>
     *      The first line of the CSV data describes the content format. </BR>
     *      Most of the field names are the field names of the admin createUser API. </BR>
     *      Additional field used for Subscriber management is: shortNumber </BR>
     *      Additional field used for DDI attachment is: ddiE164Number  </BR>
     *      Additional field used for Sip device attachment is: macAddress </BR>
     *  </BR>
     *      Supported fields for "user" management are: </BR>
     *      __action__    upsert, delete or detach </BR>
     *      loginEmail    (mandatory) </BR>
     *      password    (mandatory) </BR> 
     *      title </BR>
     *      firstName </BR>
     *      lastName </BR>
     *      nickName </BR>
     *      businessPhone{n}    (n is a number starting from 0 or 1) </BR>
     *      mobilePhone{n}    (n is a number starting from 0 or 1) </BR>
     *      email{n}    (n is a number starting from 0 or 1) </BR>
     *      tags{n}    (n is a number starting from 0 to 4) </BR>
     *      jobTitle </BR>
     *      department </BR>
     *      userInfo1 </BR>
     *      userInfo2 </BR>
     *      country </BR>
     *      language </BR>
     *      timezone </BR>
     *      visibility </BR>
     *      isInitialized </BR>
     *      authenticationType </BR>
     *      service{n} </BR>
     *      accountType </BR>
     *      photoUrl </BR>
     *       </BR>
     *      Supported fields for "subscriber" management are: </BR>
     * </BR>
     *      loginEmail    (mandatory) </BR>
     *      shortNumber </BR>
     * </BR>
     *      Supported fields for "SIP Device" management are: </BR>
     * </BR>
     *      loginEmail    (mandatory) </BR>
     *      macAddress </BR>
     * </BR>
     *      Supported fields for "DDI" management are: </BR>
     * </BR>
     *      loginEmail    (mandatory) </BR>
     *      ddiE164Number </BR>
     * </BR>
     *      __action__ description : </BR>
     *      upsert: allows to modify user (update or create if doesn't exist). It attaches also a subscriber (if field shortNumber is filled) , attaches a Sip Device (if field macAddress is filled) and attaches a DDI (if field ddiE164Number is filled) </BR>
     *      Remark: empty fields are not taken into account. </BR>
     * </BR>
     *      detach: allows to detach subscriber (if field shortNumber is filled) ; to detach Sip Device (if field macAddress is filled) and to detach DDI (if field ddiE164Number is filled) </BR>
     *      If field shortNumber is filled; detach action is done not only on subscriber but also on Sip Device and DDI automatically (even if fields macAddress and ddiE164Number are not filled) </BR>
     *    </BR>
     *      delete: allows to delete a user (if user is attached to a subscriber ; this subscriber + DDI + Sip device are automatically detached) </BR>
     *       </BR>
     *      Caution: To use the comment character ('%' by default) in a field value, surround this value with double quotes. </BR>
     *   </BR>
     *      Caution: To avoid multiple imports of same CSV data, the reqId returned to access the import status is a hash of the CSV data. If you really need to apply same CSV data again, you will have to delete its associated import report first. </BR>
     * </BR>
     *      Error codes: </BR>
     *      2001 'company {companyId} has no Cloud Pbx' </BR>
     *      2002 'ShortNumber {shortNumber} not in line with Cloud PBX Numbering Plan for company {companyId}' </BR>
     *      2003 'ShortNumber {shortNumber} is already assigned to someone else inside this company {companyId}' </BR>
     *      2004 'user {userId} is already assigned into another PBX of the company {companyId}' </BR>
     *      2005 'failed to create subscriber for user {userId} with shortNumber {shortNumber} into system {systemId}' </BR>
     *      2006 'failed to update subscriber number for user {userId} with this new shortNumber {shortNumber} into system {systemId}' </BR>
     *      2007 'there is no existing Sip Device with this macAddress {macAddress}' </BR>
     *      2008 'the existing Sip Device with this macAddress {macAddress} is not belonging to the requested company {companyId}' </BR>
     *      2009 'the existing Sip Device with this macAddress {macAddress} is attached to someone else: userId={userId}' </BR>
     *      2010 'another Sip Device with macAddress {macAddress} is attached to user={userId}' </BR>
     *      2011 'cannot assign/unassign a Sip device to this user {userId} ; he is not yet a subscriber' </BR>
     *      2012 'failed to attach this Sip Device {macAddress} with this user {userId} %s' </BR>
     *      2013 'cannot assign a DDI to this user {userId} ; he is not yet a subscriber' </BR>
     *      2014 'there is no existing DDI with this number {ddiE164Number}' </BR>
     *      2015 'the existing DDI with this number {ddiE164Number} is attached to someone else: userId={userId}' </BR>
     *      2016 'another DDI with number {ddiE164Number} is attached to user={userId}' </BR>
     *      2017 'failed to attach this DDI {ddiE164Number} with this user {userId}' </BR>
     *      2018 'failed to detach subscriber for user {userId}, no shortNumber is provided' </BR>
     *      2019 'failed to detach this subscriber {shortNumber into the request} from this user {userId}, user is attached to another subscriber {real subscriber shortNumber}' </BR>
     *      2020 'cannot detach a DDI to this user {userId} ; he is no more a subscriber' </BR>
     *      2021 'failed to detach this DDI {ddiE164Number} with this user {userId}' </BR>
     *      2022 'failed to detach this Sip Device {macAddress} with this user {userId}' </BR>
     *      </BR>
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
     *      return an {Object}  . </BR>
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
     *      This API generates a file describing all users (csv or json format). </BR>
     *      return an {Object}  of synchronization data. </BR>
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
     *      All the entries defined in the CSV data are relative to the same company directory. </BR>
     *      In case a query parameter commandId is added, the following event is sent to the initiator of the command: "rainbow_onconnectorcommandended"</BR>
     *          </BR>
     *      The first line of the CSV file describes the content format. Most of the field names are the same than the field names of the company directory API - Create a directory entry.</BR>
     *      Supported fields are:</BR>
     *      __action__ : delete, upsert or sync</BR>
     *      ldap_id : (mandatory)</BR>
     *      *</BR>
     *      firstName</BR>
     *      lastName</BR>
     *      companyName</BR>
     *      workPhoneNumber{n} : (n is a number starting from 0 or 9)</BR>
     *      mobilePhoneNumber{n} : (n is a number starting from 0 or 9)</BR>
     *      otherPhoneNumber{n} : (n is a number starting from 0 or 9)</BR>
     *      tag{n} : (n is a number starting from 0 to 4)</BR>
     *      department</BR>
     *      street</BR>
     *      city</BR>
     *      postalCode</BR>
     *      state</BR>
     *      country</BR>
     *      jobTitle</BR>
     *      eMail</BR>
     *      custom1</BR>
     *      custom2</BR>
     *      </BR>
     *      delete: allows to delete an entry. upsert: allows to modify an entry (update or create if doesn't exists) with filled fields.</BR> 
     *      Remark: empty fields are not taken into account. sync: allows to modify an entry (update or create if doesn't exists) with filled fields.</BR> 
     *      Remark: empty fields are taken into account (if a field is empty we will try to update it with empty value).</BR>
     *      </BR>
     *      return an {Object}  of synchronization data. </BR>
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
     *      This API allows to import the entries of a company directory with CSV UTF-8 encoded data. </BR>
     *      All the entries defined in the CSV data are relative to the same company directory. </BR>
     *      In case a query parameter commandId is added, the following event is sent to the initiator of the command: "rainbow_onconnectorcommandended"</BR>
     *          </BR>
     *      The first line of the CSV file describes the content format. Most of the field names are the same than the field names of the company directory API - Create a directory entry.</BR>
     *      Supported fields are:</BR>
     *      __action__ : delete, upsert or sync</BR>
     *      ldap_id : (mandatory)</BR>
     *      *</BR>
     *      firstName</BR>
     *      lastName</BR>
     *      companyName</BR>
     *      workPhoneNumber{n} : (n is a number starting from 0 or 9)</BR>
     *      mobilePhoneNumber{n} : (n is a number starting from 0 or 9)</BR>
     *      otherPhoneNumber{n} : (n is a number starting from 0 or 9)</BR>
     *      tag{n} : (n is a number starting from 0 to 4)</BR>
     *      department</BR>
     *      street</BR>
     *      city</BR>
     *      postalCode</BR>
     *      state</BR>
     *      country</BR>
     *      jobTitle</BR>
     *      eMail</BR>
     *      custom1</BR>
     *      custom2</BR>
     *      </BR>
     *      delete: allows to delete an entry. upsert: allows to modify an entry (update or create if doesn't exists) with filled fields.</BR>
     *      Remark: empty fields are not taken into account. sync: allows to modify an entry (update or create if doesn't exists) with filled fields.</BR>
     *      Remark: empty fields are taken into account (if a field is empty we will try to update it with empty value).</BR>
     *      </BR>
     *      return an {Object}  of synchronization data. </BR>
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
     *      This API retrieves the last import CSV UTF-8 content for mass-provisioning for directory mode, performed by an admin (using a commandId). </BR>
     *           </BR>
     *      return { </BR> 
     *           status : string, // status of the check csv. Possible values : success, failure, pending  </BR>
     *          report : Object,  // check results summary </BR>
     *              companyId : string, // Id of the company of the directory </BR>
     *              userId : string, Id of the requesting user </BR>
     *              displayName : string Display name of the requesting user </BR>
     *              label : string Description of the import </BR>
     *              csvHeaders : string CSV header line (Fields names) </BR>
     *              startTime : string Import processing start time </BR>
     *              created : number Count of created entries </BR>
     *              updated : number Count of updated entries </BR>
     *              deleted : number Count of deleted entries </BR>
     *              failed : 	Integer Count of failed entries </BR>
     *        } </BR>
     *                          
     *      return an {Object}  of synchronization data. </BR>
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
     *      This API allows to create a report for a commandId in case no other API is called (no action to be performed, error, ...). </BR>
     *           </BR>
     *      return { </BR> 
     *           status : string, // status of the check csv. Possible values : success, failure, pending  </BR>
     *          report : Object,  // check results summary </BR>
     *              details : string details for for report </BR>
     *        } </BR>
     *
     *      return an {Object}  of synchronization data. </BR>
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
     *      This API generates a file describing all companies entries (csv or json format). </BR>
     *           </BR>
     *
     *      return an {Object}  of result data. </BR>
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
     *      This API allows to activate a Ldap connector. </BR>
     *      A "Ldap user" is created and registered to the XMPP services. The Ldap user credentials (loginEmail and password) are generated randomly and returned in the response. </BR>
     * </BR>
     *      Note 1 A brute force defense is activated when too much activation have been requested. As a result, an error 429 "Too Many Requests" will be returned during an increasing period to dissuade a slow brute force attack. </BR>
     *      Note 2 Ldap's company should have an active subscription to to activate Ldap. If subscription linked to Ldap is not active or it has no more remaining licenses, error 403 is thrown </BR>
     *      Note 3 Ldap's company should have an SSO authentication Type, and it must be the default authentication Type for users. If company doesn't have an SSO or have one but not a default one, error 403 is thrown </BR>
     *       </BR>
     * @return {Promise<{ id : string, companyId : string, loginEmail : string, password : string}>} - 
     * </BR>
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
     *      This API is to delete the connector </BR>
     *     **BP Admin** and **BP Finance** users can only delete users being in a company linked to their BP company.</BR>
     *     **Admin** users can only delete users being in their own company. (superadmin, organization\_admin, company\_admin)
     *      return { </BR>
     *          status {string} Delete operation status message. </BR>
     *          } </BR>
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
     *     This API allows administrators to retrieve all the ldap connectors. </BR>
     *     Users with superadmin, support role can retrieve the connectors from any company. </BR>
     *     Users with bp_admin or bp_finance role can only retrieve the connectors in companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). </BR>
     *     Users with admin role can only retrieve the connectors in companies they can manage. That is to say: </BR>
     *     an organization_admin can retrieve the connectors only in a company he can manage (i.e. companies having organisationId equal to his organisationId) </BR>
     *     a company_admin can only retrieve the connectors in his company. </BR>
     *     This API can return more or less connector information using format option in query string arguments (default is small). </BR>
     * </BR>
     *      return { // List of connector Objects. </BR>
     *          id string TV unique identifier. </BR>
     *          name string TV name. </BR>
     *          location optionnel string Location of the TV. </BR>
     *          locationDetail optionnel string More detail on the location of the TV. </BR>
     *          room optionnel string Name of the room where the TV is located. </BR>
     *          companyId string company linked to the TV. </BR>
     *          activationCode string Activation code (6 digits). The activationCode may be null in the case its generation in multi-environment database failed. In that case, a security mechanism takes place to generate this activation code asynchronously (try every minutes until the code creation is successful). As soon as the activation code is successfully generated in multi-environment database, the TV is updated accordingly (activationCode set to the generated code value) and with activationCodeGenerationStatus updated to done. </BR>
     *          codeUpdateDate date Date of last activation code update. </BR>
     *          status string TV status:    unassociated (no TV user).    associated with a TV user (the TV has been activated). </BR>
     *          statusUpdatedDate Date-Time Date of last tv status update. </BR>
     *          subscriptionId string Subscription to use when activating TV. </BR>
     *          loginEmail string User email address (used for login) </BR>
     *          firstName string User first name </BR>
     *          lastName string User last name </BR>
     *          displayName string User display name (firstName + lastName concatenated on server side) </BR>
     *          nickName optionnel string User nickName </BR>
     *          title optionnel string User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...) </BR>
     *          jobTitle optionnel string User job title </BR>
     *          department optionnel string User department </BR>
     *          tags optionnel string[] An Array of free tags associated to the user. A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. tags can only be set by users who have administrator rights on the user. The user can't modify the tags. The tags are visible by the user and all users belonging to his organisation/company, and can be used with the search API to search the user based on his tags. </BR>
     *          emails Object[] Array of user emails addresses objects </BR>
     *             email string User email address </BR>
     *             type string Email type, one of home, work, other </BR>
     *          phoneNumbers Object[] Array of user phone numbers objects. Phone number objects can:   be created by user (information filled by user), come from association with a system (pbx) device (association is done by admin). </BR>
     *              phoneNumberId string Phone number unique id in phone-numbers directory collection. </BR>
     *              number optionnel string User phone number (as entered by user) </BR>
     *              numberE164 optionnel string User E.164 phone number, computed by server from number and country fields </BR>
     *              country 	string Phone number country (ISO 3166-1 alpha3 format) country field is automatically computed using the following algorithm when creating/updating a phoneNumber entry: If number is provided and is in E164 format, country is computed from E164 number Else if country field is provided in the phoneNumber entry, this one is used Else user country field is used   isFromSystem boolean boolean indicating if phone is linked to a system (pbx). </BR>
     *              shortNumber optionnel 	string [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), short phone number (corresponds to the number monitored by PCG). Only usable within the same PBX. Only PCG can set this field. </BR>
     *              internalNumber optionnel 	string [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), internal phone number. Usable within a PBX group. Admins and users can modify this internalNumber field. </BR>
     *              systemId optionnel 	string [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), unique identifier of that system in Rainbow database. </BR>
     *              pbxId optionnel 	string [Only for phone numbers linked to a system (pbx)] If phone is linked to a system (pbx), unique identifier of that pbx. </BR>
     *              type 	string Phone number type, one of home, work, other. </BR>
     *              deviceType 	string Phone number device type, one of landline, mobile, fax, other. </BR>
     *              isVisibleByOthers 	boolean Allow user to choose if the phone number is visible by other users or not. Note that administrators can see all the phone numbers, even if isVisibleByOthers is set to false. Note that phone numbers linked to a system (isFromSystem=true) are always visible, isVisibleByOthers can't be set to false for these numbers. </BR>
     *         country 	string User country (ISO 3166-1 alpha3 format) </BR>
     *         state optionnel 	string When country is 'USA' or 'CAN', a state can be defined. Else it is not managed (null). </BR>
     *         language optionnel 	string User language (ISO 639-1 code format, with possibility of regional variation. Ex: both 'en' and 'en-US' are supported) </BR>
     *         timezone optionnel 	string User timezone name </BR>
     *         jid_im 	string User Jabber IM identifier </BR>
     *         jid_tel 	string User Jabber TEL identifier </BR>
     *         jid_password 	string User Jabber IM and TEL password </BR>
     *         roles 	string[] List of user roles (Array of string) Note: company_support role is only used for support redirection. If a user writes a #support ticket and have the role company_support, the ticket will be sent to ALE's support (otherwise the ticket is sent to user's company's supportEmail address is set, ALE otherwise). </BR>
     *         adminType 	string In case of user's is 'admin', define the subtype (organisation_admin, company_admin, site_admin (default undefined) </BR>
     *         organisationId 	string In addition to User companyId, optional identifier to indicate the user belongs also to an organization </BR>
     *         siteId 	string In addition to User companyId, optional identifier to indicate the user belongs also to a site </BR>
     *         companyName 	string User company name </BR>
     *         visibility 	string User visibility Define if the user can be searched by users being in other company and if the user can search users being in other companies. Visibility can be: </BR>
     *         same_than_company: The same visibility than the user's company's is applied to the user. When this user visibility is used, if the visibility of the company is changed the user's visibility will use this company new visibility. </BR>
     *         public: User can be searched by external users / can search external users. User can invite external users / can be invited by external users </BR>
     *         private: User can't be searched by external users / can search external users. User can invite external users / can be invited by external users </BR>
     *         closed: User can't be searched by external users / can't search external users. User can invite external users / can be invited by external users </BR>
     *         isolated: User can't be searched by external users / can't search external users. User can't invite external users / can't be invited by external users </BR>
     *         none: Default value reserved for guest. User can't be searched by any users (even within the same company) / can search external users. User can invite external users / can be invited by external users </BR>
     *         External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company. Values(same_than_company, public, private, closed, isolated, none) </BR>
     *         isActive 	boolean Is user active  </BR>
     *         isInitialized 	boolean Is user initialized </BR>
     *         initializationDate 	Date-Time User initialization date </BR>
     *         activationDate 	Date-Time User activation date </BR>
     *         creationDate 	Date-Time User creation date </BR>
     *         lastUpdateDate 	Date-Time Date of last user update (whatever the field updated) </BR>
     *         lastAvatarUpdateDate 	Date-Time Date of last user avatar create/update, null if no avatar </BR>
     *         createdBySelfRegister 	boolean true if user has been created using self register </BR>
     *         createdByAdmin optionnel 	Object If user has been created by an admin or superadmin, contain userId and loginEmail of the admin who created this user </BR>
     *         userId 	string userId of the admin who created this user </BR>
     *         loginEmail 	string loginEmail of the admin who created this user </BR>
     *         invitedBy optionnel 	Object If user has been created from an email invitation sent by another rainbow user, contain the date the invitation was sent and userId and loginEmail of the user who invited this user </BR>
     *         userId 	string userId of the user who invited this user </BR>
     *         loginEmail 	string loginEmail of the user who invited this user </BR>
     *         authenticationType optionnel 	string User authentication type (if not set company default authentication will be used) Values (DEFAULT, RAINBOW, SAML, OIDC) </BR>
     *         authenticationExternalUid optionnel 	string User external authentication ID (return by identity provider in case of SAML or OIDC authenticationType) </BR>
     *         firstLoginDate 	Date-Time Date of first user login (only set the first time user logs in, null if user never logged in) </BR>
     *         lastLoginDate 	Date-Time Date of last user login (defined even if user is logged out) </BR>
     *         loggedSince 	Date-Time Date of last user login (null if user is logged out) </BR>
     *         isTerminated 	boolean Indicates if the Rainbow account of this user has been deleted </BR>
     *         guestMode 	boolean Indicated a user embedded in a chat or conference room, as guest, with limited rights until he finalizes his registration. </BR>
     *         timeToLive optionnel 	Number Duration in second to wait before automatically starting a user deletion from the creation date. Once the timeToLive has been reached, the user won't be usable to use APIs anymore (error 401523). His account may then be deleted from the database at any moment. Value -1 means timeToLive is disable (i.e. user account will not expire). </BR>
     *         userInfo1 optionnel 	string Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) </BR>
     *         userInfo2 optionnel 	string 2nd Free field that admin can use to link their users to their IS/IT tools / to perform analytics (this field is output in the CDR file) </BR>
     *         useScreenSharingCustomisation 	string Activate/Deactivate the capability for a user to share a screen. Define if a user has the right to share his screen. </BR>
     *         useScreenSharingCustomisation can be: </BR>
     *            same_than_company: The same useScreenSharingCustomisation setting than the user's company's is applied to the user. if the useScreenSharingCustomisation of the company is changed the user's useScreenSharingCustomisation will use this company new setting. </BR>
     *            enabled: Each user of the company can share his screen. </BR>
     *            disabled: No user of the company can share his screen. </BR>
     *         customData optionnel 	Object User's custom data. Object with free keys/values. It is up to the client to manage the user's customData (new customData provided overwrite the existing one). Restrictions on customData Object: max 20 keys, max key length: 64 characters, max value length: 4096 characters. </BR>
     *         activationCodeGenerationStatus 	string Status the activation code generation done if the activation code generation is successful </BR>
     *         in_progress if the activation code generation failed and the security mechanism is ongoing to try to generate it again every minute Possible values : done, in_progress </BR>
     *         fileSharingCustomisation 	string Activate/Deactivate file sharing capability per user Define if the user can use the file sharing service then, allowed to download and share file. </BR>
     *         FileSharingCustomisation can be: </BR>
     *            same_than_company: The same fileSharingCustomisation setting than the user's company's is applied to the user. if the fileSharingCustomisation of the company is changed the user's fileSharingCustomisation will use this company new setting. </BR>
     *            enabled: Whatever the fileSharingCustomisation of the company setting, the user can use the file sharing service. </BR>
     *            disabled: Whatever the fileSharingCustomisation of the company setting, the user can't use the file sharing service. </BR>
     *         userTitleNameCustomisation 	string Activate/Deactivate the capability for a user to modify his profile (title, firstName, lastName) Define if the user can change some profile data. </BR>
     *         userTitleNameCustomisation can be: </BR>
     *            same_than_company: The same userTitleNameCustomisation setting than the user's company's is applied to the user. if the userTitleNameCustomisation of the company is changed the user's userTitleNameCustomisation will use this company new setting. </BR>
     *            enabled: Whatever the userTitleNameCustomisation of the company setting, the user can change some profile data. </BR>
     *            disabled: Whatever the userTitleNameCustomisation of the company setting, the user can't change some profile data. </BR>
     *         softphoneOnlyCustomisation 	string Activate/Deactivate the capability for an UCaas application not to offer all Rainbow services but to focus to telephony services Define if UCaas apps used by a user of this company must provide Softphone functions, i.e. no chat, no bubbles, no meetings, no channels, and so on. </BR>
     *         softphoneOnlyCustomisation can be: </BR>
     *            same_than_company: The same softphoneOnlyCustomisation setting than the user's company's is applied to the user. if the softphoneOnlyCustomisation of the company is changed the user's softphoneOnlyCustomisation will use this company new setting. </BR>
     *            enabled: The user switch to a softphone mode only. </BR>
     *            disabled: The user can use telephony services, chat, bubbles, channels meeting services and so on. </BR>
     *         useRoomCustomisation 	string Activate/Deactivate the capability for a user to use bubbles. Define if a user can create bubbles or participate in bubbles (chat and web conference). </BR>
     *         useRoomCustomisation can be: </BR>
     *            same_than_company: The same useRoomCustomisation setting than the user's company's is applied to the user. if the useRoomCustomisation of the company is changed the user's useRoomCustomisation will use this company new setting. </BR>
     *            enabled: The user can use bubbles. </BR>
     *            disabled: The user can't use bubbles. </BR>
     *         phoneMeetingCustomisation 	string Activate/Deactivate the capability for a user to use phone meetings (PSTN conference). Define if a user has the right to join phone meetings. </BR>
     *         phoneMeetingCustomisation can be: </BR>
     *            same_than_company: The same phoneMeetingCustomisation setting than the user's company's is applied to the user. if the phoneMeetingCustomisation of the company is changed the user's phoneMeetingCustomisation will use this company new setting. </BR>
     *            enabled: The user can join phone meetings. </BR>
     *            disabled: The user can't join phone meetings. </BR>
     *         useChannelCustomisation 	string Activate/Deactivate the capability for a user to use a channel. Define if a user has the right to create channels or be a member of channels. </BR>
     *         useChannelCustomisation can be: </BR>
     *            same_than_company: The same useChannelCustomisation setting than the user's company's is applied to the user. if the useChannelCustomisation of the company is changed the user's useChannelCustomisation will use this company new setting. </BR>
     *            enabled: The user can use some channels. </BR>
     *            disabled: The user can't use some channel. </BR>
     *         useWebRTCVideoCustomisation 	string Activate/Deactivate the capability for a user to switch to a Web RTC video conversation. Define if a user has the right to be joined via video and to use video (start a P2P video call, add video in a P2P call, add video in a web conference call). </BR>
     *         useWebRTCVideoCustomisation can be: </BR>
     *            same_than_company: The same useWebRTCVideoCustomisation setting than the user's company's is applied to the user. if the useWebRTCVideoCustomisation of the company is changed the user's useWebRTCVideoCustomisation will use this company new setting. </BR>
     *            enabled: The user can switch to a Web RTC video conversation. </BR>
     *            disabled: The user can't switch to a Web RTC video conversation. </BR>
     *         useWebRTCAudioCustomisation 	string Activate/Deactivate the capability for a user to switch to a Web RTC audio conversation. Define if a user has the right to be joined via audio (WebRTC) and to use Rainbow audio (WebRTC) (start a P2P audio call, start a web conference call). </BR>
     *         useWebRTCAudioCustomisation can be: </BR>
     *            same_than_company: The same useWebRTCAudioCustomisation setting than the user's company's is applied to the user. if the useWebRTCAudioCustomisation of the company is changed the user's useWebRTCAudioCustomisation will use this company new setting. </BR>
     *            enabled: The user can switch to a Web RTC audio conversation. </BR>
     *            disabled: The user can't switch to a Web RTC audio conversation. </BR>
     *         instantMessagesCustomisation 	string Activate/Deactivate the capability for a user to use instant messages. Define if a user has the right to use IM, then to start a chat (P2P ou group chat) or receive chat messages and chat notifications. </BR>
     *         instantMessagesCustomisation can be: </BR>
     *            same_than_company: The same instantMessagesCustomisation setting than the user's company's is applied to the user. if the instantMessagesCustomisation of the company is changed the user's instantMessagesCustomisation will use this company new setting. </BR>
     *            enabled: The user can use instant messages. </BR>
     *            disabled: The user can't use instant messages. </BR>
     *         userProfileCustomisation 	string Activate/Deactivate the capability for a user to modify his profile. Define if a user has the right to modify the globality of his profile and not only (title, firstName, lastName). </BR>
     *         userProfileCustomisation can be: </BR>
     *            same_than_company: The same userProfileCustomisation setting than the user's company's is applied to the user. if the userProfileCustomisation of the company is changed the user's userProfileCustomisation will use this company new setting. </BR>
     *            enabled: The user can modify his profile. </BR>
     *            disabled: The user can't modify his profile. </BR>
     *         fileStorageCustomisation 	string Activate/Deactivate the capability for a user to access to Rainbow file storage.. Define if a user has the right to upload/download/copy or share documents. </BR>
     *         fileStorageCustomisation can be: </BR>
     *            same_than_company: The same fileStorageCustomisation setting than the user's company's is applied to the user. if the fileStorageCustomisation of the company is changed the user's fileStorageCustomisation will use this company new setting. </BR>
     *            enabled: The user can manage and share files. </BR>
     *            disabled: The user can't manage and share files. </BR>
     *         overridePresenceCustomisation 	string Activate/Deactivate the capability for a user to use instant messages. Define if a user has the right to change his presence manually or only use automatic states. </BR>
     *         overridePresenceCustomisation can be: </BR>
     *            same_than_company: The same overridePresenceCustomisation setting than the user's company's is applied to the user. if the overridePresenceCustomisation of the company is changed the user's overridePresenceCustomisation will use this company new setting. </BR>
     *            enabled: The user can change his presence. </BR>
     *            disabled: The user can't change his presence. </BR>
     *         changeTelephonyCustomisation 	string Activate/Deactivate the ability for a user to modify telephony settings. Define if a user has the right to modify some telephony settigs like forward activation... </BR>
     *         changeTelephonyCustomisation can be: </BR>
     *            same_than_company: The same changeTelephonyCustomisation setting than the user's company's is applied to the user. if the changeTelephonyCustomisation of the company is changed the user's changeTelephonyCustomisation will use this company new setting. </BR>
     *            enabled: The user can modify telephony settings. </BR>
     *            disabled: The user can't modify telephony settings. </BR>
     *         changeSettingsCustomisation 	string Activate/Deactivate the ability for a user to change all client general settings. </BR>
     *         changeSettingsCustomisation can be: </BR>
     *            same_than_company: The same changeSettingsCustomisation setting than the user's company's is applied to the user. if the changeSettingsCustomisation of the company is changed the user's changeSettingsCustomisation will use this company new setting. </BR>
     *            enabled: The user can change all client general settings. </BR>
     *            disabled: The user can't change any client general setting. </BR>
     *         recordingConversationCustomisation 	string Activate/Deactivate the capability for a user to record a conversation. Define if a user has the right to record a conversation (for P2P and multi-party calls). </BR>
     *         recordingConversationCustomisation can be: </BR>
     *            same_than_company: The same recordingConversationCustomisation setting than the user's company's is applied to the user. if the recordingConversationCustomisation of the company is changed the user's recordingConversationCustomisation will use this company new setting. </BR>
     *            enabled: The user can record a peer to peer or a multi-party call. </BR>
     *            disabled: The user can't record a peer to peer or a multi-party call. </BR>
     *         useGifCustomisation 	string Activate/Deactivate the ability for a user to Use GIFs in conversations. Define if a user has the is allowed to send animated GIFs in conversations </BR>
     *         useGifCustomisation can be: </BR>
     *            same_than_company: The same useGifCustomisation setting than the user's company's is applied to the user. if the useGifCustomisation of the company is changed the user's useGifCustomisation will use this company new setting. </BR>
     *            enabled: The user can send animated GIFs in conversations. </BR>
     *            disabled: The user can't send animated GIFs in conversations. </BR>
     *         fileCopyCustomisation 	string Activate/Deactivate the capability for one user to copy any file he receives in his personal cloud space </BR>
     *         fileCopyCustomisation can be: </BR>
     *            same_than_company: The same fileCopyCustomisation setting than the user's company's is applied to the user. if the fileCopyCustomisation of the company is changed the user's fileCopyCustomisation will use this company new setting. </BR>
     *            enabled: The user can make a copy of a file to his personal cloud space. </BR>
     *            disabled: The user can't make a copy of a file to his personal cloud space. </BR>
     *         fileTransferCustomisation 	string Activate/Deactivate the capability for a user to copy a file from a conversation then share it inside another conversation. The file cannot be re-shared. </BR>
     *         fileTransferCustomisation can be: </BR>
     *            same_than_company: The same fileTransferCustomisation setting than the user's company's is applied to the user. if the fileTransferCustomisation of the company is changed the user's fileTransferCustomisation will use this company new setting. </BR>
     *            enabled: The user can transfer a file doesn't belong to him. </BR>
     *            disabled: The user can't transfer a file doesn't belong to him. </BR>
     *         forbidFileOwnerChangeCustomisation 	string Activate/Deactivate the capability for a user to loose the ownership on one file.. One user can drop the ownership to another Rainbow user of the same company. </BR>
     *         forbidFileOwnerChangeCustomisation can be: </BR>
     *            same_than_company: The same forbidFileOwnerChangeCustomisation setting than the user's company's is applied to the user. if the forbidFileOwnerChangeCustomisation of the company is changed the user's forbidFileOwnerChangeCustomisation will use this company new setting. </BR>
     *            enabled: The user can't give the ownership of his file. </BR>
     *            disabled: The user can give the ownership of his file. </BR>
     *         useDialOutCustomisation 	string Activate/Deactivate the capability for a user to use dial out in phone meetings. Define if a user is allowed to be called by the Rainbow conference bridge. </BR>
     *         useDialOutCustomisation can be: </BR>
     *            same_than_company: The same useDialOutCustomisation setting than the user's company's is applied to the user. if the useDialOutCustomisation of the company is changed the user's useDialOutCustomisation will use this company new setting. </BR>
     *            enabled: The user can be called by the Rainbow conference bridge. </BR>
     *            disabled: The user can't be called by the Rainbow conference bridge. </BR>
     *         selectedAppCustomisationTemplate 	string To log the last template applied to the user. </BR>
     *      } </BR>
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
     *      This API can be used to send a command to a ldap connector user. </BR>
     *      BP Admin and BP Finance users can only control users being in a company linked to their BP company. </BR>
     *      Admin users can only control users being in their own company. (superadmin, organization_admin, company_admin). </BR>
     *
     * @return {Promise<{Object}>} return -
     * </BR>
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
     *      This API allows create configuration for the connector. </BR>
     *      A template is available : use retrieveLdapConnectorConfigTemplate API. </BR>
     *      Users with superadmin, support role can create the connectors configuration from any company. </BR>
     *      Users with bp_admin or bp_finance role can only create the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). </BR>
     *      Users with admin role can only create the connectors configuration in companies they can manage. That is to say: </BR>
     *      * an organization_admin can create the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId)
     *      * a company_admin can only create the connectors configuration in his company.
     *
     * @return {Promise<{Object}>} return -
     * </BR>
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
     *      This API can be used to delete a ldap connector config. </BR>
     *      </BR>
     *      **BP Admin** and **BP Finance** users can only delete a ldap config being in a company linked to their BP company. </BR>
     *      **Admin** users can only delete ldap config being in their own company. (superadmin, organization_admin, company_admin)  </BR>
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
     *      This API allows to retrieve the configuration for the connector. </BR>
     *      A template is available : use retrieveLdapConnectorConfigTemplate API. </BR>
     *      Users with superadmin, support role can retrieve the connectors configuration from any company. </BR>
     *      Users with bp_admin or bp_finance role can only retrieve the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). </BR>
     *      Users with admin role can only retrieve the connectors configuration in companies they can manage. That is to say: </BR>
     *      an organization_admin can retrieve the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) </BR>
     *      a company_admin can only retrieve the connectors configuration in his company. </BR>
     *      return { </BR>
     *         id 	string Config unique identifier. </BR>
     *         type 	string Config type  </BR>
     *         companyId 	string Allows to specify for which company the connectors configuration is done.. </BR>
     *         settings 	Object config settings </BR>
     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. </BR>
     *                 headerName 	string headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. </BR>
     *             company 	Object specific settings for the company. Each key represent a setting. </BR>
     *                 login 	string login for the ldap server. </BR>
     *                 password 	string password for the ldap server. </BR>
     *                 synchronizationTimeInterval 	string time interval between synchronization in hours. </BR>
     *                 url 	string url of the ldap server. </BR>
     *          } </BR>
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
     *      This API allows to retrieve the configuration template for the connector. </BR>
     *      return { </BR>
     *         id 	string Config unique identifier. </BR>
     *         type 	string Config type  </BR>
     *         companyId 	string Allows to specify for which company the connectors configuration is done.. </BR>
     *         settings 	Object config settings </BR>
     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. </BR>
     *                 headerName 	string headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. </BR>
     *             company 	Object specific settings for the company. Each key represent a setting. </BR>
     *                 login 	string login for the ldap server. </BR>
     *                 password 	string password for the ldap server. </BR>
     *                 synchronizationTimeInterval 	string time interval between synchronization in hours. </BR>
     *                 url 	string url of the ldap server. </BR>
     *          } </BR>
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
     * @method retrieveLdapConnectorAllConfigTemplates
     * @since 1.86.0
     * @instance
     * @async
     * @category AD/LDAP - LDAP APIs to use
     * @description
     *      This API allows to retrieve all the configuration templates for the connector. </BR>
     *      return { </BR>
     *         id 	string Config unique identifier. </BR>
     *         type 	string Config type  </BR>
     *         companyId 	string Allows to specify for which company the connectors configuration is done.. </BR>
     *         settings 	Object config settings </BR>
     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. </BR>
     *                 default 	String default field name in ldap. </BR>
     *                 mandatory optionnel 	Boolean specify if field is mandatory. </BR>
     *             company 	Object specific settings for the company. Each key represent a setting. </BR>
     *                  headerName 	Object headerName as specified in the csv templates for the massprovisioning portal. </BR>
     *                  settingName Object name of the setting. Each key represent a setting. As of now list of setting is "login", "password", "synchronizationTimeInterval", "url". This list can evolve. </BR>
     *                  default optionnel 	String 	 </BR>
     *                  default value of the setting.  </BR>
     *                  mandatory optionnel 	String specify if field is mandatory. </BR>
     *          } </BR>
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
     *      This API allows to retrieve the configurations list for the connector. </BR>
     *      A template is available : use retrieveLdapConnectorConfigTemplate API. </BR>
     *      Users with superadmin, support role can retrieve the connectors configuration from any company. </BR>
     *      Users with bp_admin or bp_finance role can only retrieve the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). </BR>
     *      Users with admin role can only retrieve the connectors configuration in companies they can manage. That is to say: </BR>
     *      an organization_admin can retrieve the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) </BR>
     *      a company_admin can only retrieve the connectors configuration in his company. </BR>
     *      return { </BR>
     *         id 	string Config unique identifier. </BR>
     *         type 	string Config type  </BR>
     *         companyId 	string Allows to specify for which company the connectors configuration is done.. </BR>
     *         settings 	Object config settings </BR>
     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. </BR>
     *                 headerName 	string headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. </BR>
     *             company 	Object specific settings for the company. Each key represent a setting. </BR>
     *                 login 	string login for the ldap server. </BR>
     *                 password 	string password for the ldap server. </BR>
     *                 synchronizationTimeInterval 	string time interval between synchronization in hours. </BR>
     *                 url 	string url of the ldap server. </BR>
     *                 connectorStatus 	string status of the connector (set by the connector itself). </BR>
     *                 nextSynchronization 	Date-Time date (ISO 8601 format) which defines when the next synchronization will be performed. </BR>
     *                 enrollmentEmailEnable 	boolean defines if an enrollment email is sent to new users </BR>
     *                 synchronisationDiffMode 	boolean defines if synching only users changed since last sync date </BR>
     *                 search_rule 	string filters to use when requesting the ldap server. </BR>
     *                 lastSynchronization 	Date-Time date (ISO 8601 format) when the last synchronization was performed by the ldap connector (filled by the ldap connector). </BR>
     *                 softwareVersion 	string software Version of the ldap connector (filled by the ldap connector). </BR>
     *          } </BR>
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
     *      This API allows to retrieve the configuration for the connector with the ldapConfigId. </BR>
     *      A template is available : use retrieveLdapConnectorConfigTemplate API. </BR>
     *      Users with superadmin, support role can retrieve the connectors configuration from any company. </BR>
     *      Users with bp_admin or bp_finance role can only retrieve the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). </BR>
     *      Users with admin role can only retrieve the connectors configuration in companies they can manage. That is to say: </BR>
     *      an organization_admin can retrieve the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) </BR>
     *      a company_admin can only retrieve the connectors configuration in his company. </BR>
     *      return { </BR>
     *         id 	string Config unique identifier. </BR>
     *         type 	string Config type  </BR>
     *         companyId 	string Allows to specify for which company the connectors configuration is done.. </BR>
     *         settings 	Object config settings </BR>
     *             massproFromLdap 	Object list of fields to map between ldap fields and massprovisioning's import csv file headers. You can have as many keys as the csv's headerNames of massprovisioning portal. </BR>
     *                 headerName 	string headerName as specified in the csv templates for the massprovisioning portal, value is the corresponding field name in ldap. </BR>
     *             company 	Object specific settings for the company. Each key represent a setting. </BR>
     *                 login 	string login for the ldap server. </BR>
     *                 password 	string password for the ldap server. </BR>
     *                 synchronizationTimeInterval 	string time interval between synchronization in hours. </BR>
     *                 url 	string url of the ldap server. </BR>
     *                 connectorStatus 	string status of the connector (set by the connector itself). </BR>
     *                 nextSynchronization 	Date-Time date (ISO 8601 format) which defines when the next synchronization will be performed. </BR>
     *                 enrollmentEmailEnable 	boolean defines if an enrollment email is sent to new users </BR>
     *                 synchronisationDiffMode 	boolean defines if synching only users changed since last sync date </BR>
     *                 search_rule 	string filters to use when requesting the ldap server. </BR>
     *                 lastSynchronization 	Date-Time date (ISO 8601 format) when the last synchronization was performed by the ldap connector (filled by the ldap connector). </BR>
     *                 softwareVersion 	string software Version of the ldap connector (filled by the ldap connector). </BR>
     *          } </BR>
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
     *      This API allows update configuration for the connector. </BR>
     *      A template is available : use retrieveLdapConnectorConfigTemplate API. </BR>
     *      Users with superadmin, support role can update the connectors configuration from any company. </BR>
     *      Users with bp_admin or bp_finance role can only update the connectors configurationin companies being End Customers of their BP company (i.e. all the companies having bpId equal to their companyId). </BR>
     *      Users with admin role can only update the connectors configuration in companies they can manage. That is to say: </BR>
     *      an organization_admin can update the connectors configuration only in a company he can manage (i.e. companies having organisationId equal to his organisationId) </BR>
     *      a company_admin can only update the connectors configuration in his company. </BR>
     *          
     *      a 'rainbow_onconnectorconfig' event is raised when updated. The parameter configId can be used to retrieve the updated configuration.
     *     
     * @return {Promise<{Object}>} -
     * </BR>
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

    //region Connectors

    /**
     * @public
     * @method createListOfEventsForConnector
     * @since 2.14.0
     * @instance
     * @async
     * @category Connectors
     * @param {any} events The list of events for a connector : 
     * { </BR> 
     * events : [{ </BR>
     *  eventId : string The identifier of an event  </BR>
     *  level : string The level of an event. Possibles values : `ERROR`, `WARN`, `INFO`  </BR>
     *  category : string The category of an event  </BR>
     *  operation : string The operation of an event  </BR>
     *  description : string The description of an event  </BR>
     *  date : string The date an event  </BR>
     * }]</BR>
     * }</BR>
     * 
     * @description
     *     This API allows the different connectors to store a list of events </BR>
     *      </BR>
     *      Each given events is stored in Rainbow database. If an event, identified by its eventId, already exists for a connector in database, it isn't duplicated. An event is created with a deleted field value as false. </BR>
     *      It's associated eityher with a companyId or a systemId, according to the type of its connector. </BR>
     *      It's stored during 30 days. After that, it's automatically removed from database. </BR>
     * </BR>
     * @return {Promise<any>} result.
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object\[\] | List of connector event stored. |
     * | id  | String | Event unique identifier. |
     * | userId | String | User associated to the connector unique identifier. |
     * | eventId | String | Event identifier in the connector scope |
     * | level | String | Event level<br><br>Possibles values : `ERROR`, `WARN`, `INFO` |
     * | category | String | Event category |
     * | operation | String | Event operation |
     * | description | String | Event description |
     * | deleted | Boolean | Indicate if the event is considered as deleted |
     * | date | Date-Time | Date of event |
     * | companyId optionnel | String | Company linked to the connector. |
     * | systemId optionnel | String | System linked to the connector. |
     *
     */
    createListOfEventsForConnector(events : Array<{ eventId : string, level : string, category : string, operation : string, description : string, date : string}>) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                if (!events) {
                    this._logger.log("warn", LOG_ID + "(createListOfEventsForConnector) bad or empty 'events' parameter");
                    this._logger.log("internalerror", LOG_ID + "(createListOfEventsForConnector) bad or empty 'events' parameter : ", events);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                let result = await that._rest.createListOfEventsForConnector(events);
                that._logger.log("debug", "(createListOfEventsForConnector) - sent.");
                that._logger.log("internal", "(createListOfEventsForConnector) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(createListOfEventsForConnector) Error.");
                that._logger.log("internalerror", LOG_ID + "(createListOfEventsForConnector) Error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Connectors
    
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
     *      This API allows administrator to retrieve a CloudPBX using its identifier. </BR>
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
     *      This API allows to update a CloudPBX using its identifier. </BR>
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
     *      This API allows to delete a CloudPBX using its identifier. </BR>
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
     *      This API allows administrator to retrieve a list of CloudPBXs. </BR>
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
     * @param {number} numberingDigits Number of digits for CloudPBX numbering plan. If a numberingPrefix is provided, this parameter is mandatory. </BR>
     * For example, if numberingPrefix is 8 and numberingDigits is 4, allowed numbers for this CloudPBX will be from 8000 to 8999.
     * @param {number} numberingPrefix Prefix for CloudPBX numbering plan.
     * @param {number} outgoingPrefix Company outgoing prefix.
     * @param {boolean} routeInternalCallsToPeer Indicates if internal calls must be routed to peer (Only available if 'routeInternalCallsToPeerAllowed' is set to 'true' on external trunk).
     * @param {string} siteId Identifier of the site on which CloudPBX should be created.
     * @description
     *      This API allows to creates a CloudPBX for a given company. </BR>
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
     *      This API allows to retrieve the CloudPBX CLI options for outbound calls using its identifier. </BR>
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
     *      This API allows to update a CloudPBX using its identifier. </BR>
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
     *      This API allows to retrieve a list of languages supported by a CloudPBX using its identifier. </BR>
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
     *      This API allows to retrieve a list of device models supported by a CloudPBX using its identifier. </BR>
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
     *      This API allows to retrieve a list of traffic barring options supported by a CloudPBX using its identifier. </BR>
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
     *      This API allows to retrieve Emergency Numbers and Emergency Options supported by a CloudPBX using its identifier. </BR>
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
     *      This API allows allows to create a new SIP device into a CloudPBX. This SIP device can then be assigned to an existing subscriber. </BR>
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
     *      This API allows to reset a SIP deskphone device to its factory settings.</BR>
     *      Be aware that the device will no longer be operational, and should, after the factory reset, need to be manually configured (e.g. at least auto provisioning Url will need to be set). </BR>
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
     *      This API allows to retrieve a SIP device using the given deviceId.</BR>
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
     *      This API allows to remove a SIP Device from a CloudPBX. To do so, the SIP device must no longer be associated to a subscriber.</BR>
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
     *      This API allows to update a SIP device.</BR>
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
     *      This API allows  to retrieve all SIP devices assigned into a CloudPBX.</BR>
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
     *      This API allows to retrieve SIP registrations information relative to a device.</BR>
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
     *      This API allows  to grant access to debug session on the given device.</BR>
     *      When debug session is granted on the device, admins can retrieve the admin password of the device, url to access the device admin page and also initiate ssh session with the device. </BR>
     *      A debug session can be terminated by: </BR>
     *      Calling the device revoke API </BR>
     *      After debug session has timed out, a periodic check is performed by the portal to revoke expired debug sessions (periodicity defined by configuration parameter). </BR>
     *
     *      During debug session, adminUrl and adminPassword of the device can be retrieved by getting device information.  </BR>
     *      Please note that adminUrl could be unreachable depending on network configuration. </BR>
     *      When a debug session is closed, ssh access to the device is deactivated, and the admin password of the device is modified.</BR>
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
     *      This API allows  to revoke access to debug session on the given device. </BR>
     *      When revoked, the debug session can no longer be used. </BR>
     *      The admin password is no longer visible (changed). </BR>
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
     *      This API allows  to reboot a SIP deskphone device. </BR>
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
     *      This API allows to get data of a CloudPBX Subscriber.</BR>
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
     *      This API allows to delete a CloudPBX Subscriber. All its associated SIP devices become free for other subscribers.</BR>
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
     *      This API allows to create a new CloudPBX Subscriber for a Rainbow User.</BR>
     *      This new subscriber will appear as a new entry into "phoneNumbers" list of the targeted Rainbow User.</BR>
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
     *      This API allows to retrieve a given SIP device assigned to a subscriber.</BR>
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
     *      This API allows to remove association between subscriber and the Sip Device (SIP device becomes available for another subscriber).</BR>
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
     *      This API allows  to retrieve all SIP devices assigned to a subscriber.</BR>
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
     *      This API allows to retrieve registrations info on all devices registered for a subscriber.</BR>
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
     *      This API allows to assign a SIP device to a CloudPBX Subscriber.</BR>
     *      The device must have been previously created.</BR>
     *      Assigning a device to a subscriber can de done by specifying the device Id (preferred) in the request, or the device mac address.</BR>
     *      Assigning a device to a subscriber can de done by specifying the device Id in the request, or the device mac address and deviceType Id.</BR>
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
     *      This API allows to get CLI policy of a CloudPBX Subscriber.</BR>
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
     *      This API allows to list all unassigned internal phone numbers for a given CloudPBX system.</BR>
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
     *      This API allows to get the list of DDI numbers associated to a CloudPBX.</BR>
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
     *      This API allows to create a DDI number for a CloudPBX.</BR>
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
     *      This API allows to delete a DDI number for a CloudPBX. </BR>
     *      Note : Default DDI can be deleted only if it is the last DDI of the CloudPBX. </BR>
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
     *      This API allows to associate a DDI number to a Rainbow user. </BR>
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
     *      This API allows to disassociate a DDI number from a Rainbow user. </BR>
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
     *      This API allows to set a DDI number as default DDI for a CloudPBX. </BR>
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
     *      This API allows to retrieve an external SIP trunk using its identifier. </BR>
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
     * @param {string} rvcpInstanceId Allows to filter external SIP trunks by RVCP instance identifier. </BR>
     *          This filter allows to load all external SIP trunks in relation with an RVCP Instance. </BR>
     * @param {string} status Allows to filter external SIP trunks by status. </BR>
     *          This filter allows to load all external SIP trunks according to their status. </BR>
     *          Valid values : "new" "active". </BR>
     * @param {string} trunkType Allows to filter external SIP trunks by their type. </BR>
     * @description
     *      This API allows superadmin or bp_admin to retrieve a list of external SIP trunks. </BR>
     *      bp_admin can list only external SIP trunks he is allowed to use. </BR>
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
     * @param {string} name Site name. </BR>
     *              Valid values : 1..255
     * @param {string} status Site status. </BR>
     *          Valid values : "active", "alerting", "hold", "terminated". </BR>
     * @param {string} companyId Id of the company from which the site is linked.
     * @description
     *      This API allows administrators to create a site for a company they administrate.  </BR>
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
     * @param {string} siteId Site id. </BR>
     * @description
     *      This API allows administrators to delete a site by id they administrate.  </BR>
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
     * @param {string} siteId Site id. </BR>
     * @description
     *      This API allows administrators to get a site data by id they administrate.  </BR>
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
     * @param {string} format Allows to retrieve more or less site details in response. </BR>
     * - small: _id, name </BR>
     * - medium: _id, name, status, companyId </BR>
     * - full: all site fields </BR>
     * default : small </BR>
     * Valid values : small, medium, full </BR>
     * @param {number} limit Allow to specify the number of companies to retrieve. (default=100).
     * @param {number} offset Allow to specify the position of first site to retrieve (first site if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort site list based on the given field. (default="name").
     * @param {number} sortOrder Specify order when sorting site list. Default values : 1. Valid values : -1, 1.
     * @param {string} name Allows to filter sites list on field name. </BR>
     * The filtering is case insensitive and on partial name match: all sites containing the provided name value will be returned (whatever the position of the match). </BR>
     * Ex: if filtering is done on sit, sites with the following names are match the filter 'My site', 'Site', 'A site 1', 'Site of company', 'Sit1', 'Sit2', ... </BR>
     * @param {string} companyId
     * @description
     *      This API allows administrators to get all sites they administrate.  </BR>
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
     * @param {string} siteId Site id. </BR>
     * @param {string} name Site name
     * @param {string} status Site status. Valid values : "active", "alerting", "hold", "terminated"
     * @param {string} companyId Id of the company from which the site is linked.
     * @description
     *      This API allows administrators to update a given site by id they administrate.  </BR>
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

    // region systems
    
    // region systems systems

    /**
     * @public
     * @method createSystem
     * @since 2.20.0
     * @instance
     * @category Systems - systems
     * @async
     * @param {string} name System name/description
     * @param {string} pbxId CCA (Call Control Agent) hosted by a System needs an account to XMPP. This is the login to access to XMPP server. It should be given during system creation or automatically generated.
     * @param {string} pbxLdapId custom "pbxId" declared in an external DB (ldap), used to correlate to Rainbow pbxId. 
     * @param {string} siteId Site from which the system is linked with.
     * @param {string} type CCA type. Possibles values : oxo, oxe, third_party, undefined
     * @param {string} country System country (ISO 3166-1 alpha3 format).
     * @param {string} version CCA software version
     * @param {number} serverPingTimeout CCA config data. Default value : 120
     * @param {Array<string>} pbxMainBundlePrefix CCA config data: array of String
     * @param {boolean} usePbxMainBundlePrefix Whether or not pbxMainBundlePrefix is used by PCG
     * @param {Array<Object>} pbxNumberingTranslator List of several regular expressions used to validate internal or external phone numbers. Up to 100 regular expressions are allowed. (64 max char by regexp). To reset the list, use [] </BR>
     * {String} regexpMatch A valid regular expression used to select a translator action. \d is not supported! Use (0..9) instead. </BR>
     * {String} regexpReplace A valid dialable number. </BR>
     * {String} description A short description of the rule. </BR> 
     * @param {string} pbxNationalPrefix National prefix
     * @param {string} pbxInternationalPrefix International prefix
     * @param {Array<string>} searchResultOrder List of directory types to order search results: </BR>
     * - RAINBOW: phone numbers defined in Rainbow users </BR>
     * - LDAP: phone numbers defined in directories according to the following priority order: </BR>
     * * personal directory of the user </BR>
     * * company directory (of the company(ies) to which the PBX is linked) </BR>
     * * office365 directory (of the company(ies) to which the PBX is linked) </BR>
     * - PBX: phone numbers defined in the phone book of the PBX </BR>
     * </BR>
     * Possibles values : RAINBOW, LDAP, PBX </BR>
     * @param {string} activationCode Currently, the activation code is a random 4 digits value (between 1000 and 9999) generated by the admin portal. With activationCode field, it's possible to set a custom value. In the Http success response the value is available in the 'jid_pbxagent_password' field. activationCode is only taken in account during a system creation.
     * @param {boolean} isCentrex Indicates if the system is one tenant or multi-tenant (OXE - OTEC-S or third_party). isCentrex flag can't be set to true if isShared flag is true (these settings are exclusives). Default value : false
     * @param {boolean} isShared Indicates if the system is multi-company (shared across multiple companies). </BR>
     * </BR>
     * * isShared flag can't be set to true if isCentrex flag is true (these settings are exclusives). </BR>
     * * Shared systems can be linked to several sites from different companies. </BR>
     * * Several shared PBX can be attached to a same Rainbow company, as well as "standard" systems (i.e. systems without isShared flag, and so being linked only to this company). </BR>
     * * Companies being linked to shared PBX can't be attached to centrex systems. </BR>
     * * It is understood that this approach exposes all users of the shared PBX to all companies that have users on this PBX (for association, for dial by name). Anyway it seats on a PBX infra where all PBX users can directly dial (by short num and DBN) any other users of the network from their deskphones. </BR>
     * * In cases the underlying infra is an homogeneous network of PBX, PBX grouping has to be managed. </BR>
     * </BR>
     * Default value : false </BR>
     * @param {string} bpId Link the system to the corresponding Business partner company. bpId must correspond to a valid company having isBP equal to true. Only directly settable by superadmin. If the system is created by a bp_admin, bpId is automatically set to bp_admin's system id.
     * @param {boolean} isOxoManaged Indicates if the system is an OXO managed. Only settable if type is set to oxo. This setting can only be set at system creation, then it can't be modified. Only one OXO Managed PBX is allowed for a company.
     * @description
     *  This API allows administrator to create a system. </BR>
     *  A system hosts the CCA (Call Control Agent) configuration. </BR>
     *  </BR>
     *  superadmin can create systems linked to all sites existing in Rainbow. </BR>
     *  bp_admin can only create systems linked to sites of End Customer companies for which their bp_admin's company is the BP company. </BR>
     *  organization_admin can only create systems linked to sites of companies under their organisation. </BR>
     *  company_admin can only create systems linked to sites of their company. </BR>
     *  site_admin can only create the systems linked to the site they administrate. </BR>
     *  </BR>
     *
     * @return {Promise<any>} An object of the result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | System unique identifier |
     * | name optionnel | String | System name/description |
     * | pbxId | String | Call Control Agent (CCA) login. |
     * | pbxLdapId optionnel | String | custom "pbxId" declared in an external DB (ldap), used to correlate to Rainbow pbxId. |
     * | siteId optionnel | String\[\] | Site from which the system is linked with. |
     * | type optionnel | string | CCA type</BR></BR>Possibles values : `oxo`, `oxe`, `third_party`, `undefined` |
     * | country optionnel | String | System country (ISO 3166-1 alpha3 format) |
     * | version | String | CCA software version |
     * | jid_pbxagent optionnel | String | CCA Jabber Id |
     * | jid\_pbxagent\_password optionnel | String | CCA Jabber Id access code. The value of this field is depending on status field.</BR></BR> * `created, activating`: This is the public access code. The code must be used by the CCA for the first connection.</BR> * `activated`: This is an Hash code of the private access code, reduced to the last eight digits |
     * | jid_pbxpcg optionnel | String | PCG Jabber Id for this system |
     * | jid\_pbxpcg\_password optionnel | String | PCG CCA Jabber Id password for this system |
     * | status optionnel | String | CCA status report. (read only)</BR></BR> * `created`: CCA uses a public access code to join rainbow infrastructure (see jid\_pbxagent\_password field)</BR> * `activating`: Rainbow infrastructure has proposed a private access code to replace the former public access code</BR> * `activated`: CCA has accepted the new access code, that will be used for the next initialization.</BR></BR>Default value : `created`</BR></BR>Possibles values : `"created"`, `"activating"`, `"activated"` |
     * | serverPingTimeout optionnel | Number | CCA config data |
     * | pbxMainBundlePrefix optionnel | String\[\] | CCA config data |
     * | pbxNumberingTranslator optionnel | Object\[\] | List of several regular expressions used to validate internal or external phone numbers. Up to 100 regular expressions are allowed. (64 max char by regexp). To reset the list, use \[\] |
     * | regexpMatch optionnel | String | A valid regular expression used to select a translator action. \\d is not supported! Use (0..9) instead. |
     * | regexpReplace optionnel | String | A valid dialable number. |
     * | description optionnel | String | A short description of the rule * @apiSuccess {Boolean} usePbxMainBundlePrefix Whether or not pbxMainBundlePrefix is used by PCG |
     * | pbxNationalPrefix optionnel | String | National prefix |
     * | pbxInternationalPrefix optionnel | String | International prefix |
     * | creationDate | Date-Time | System creation date (Read only) |
     * | statusUpdatedDate optionnel | Date-Time | Date of last system status update (Read only) |
     * | searchResultOrder optionnel | String\[\] | List of directory types to order search results:</BR></BR>* RAINBOW: phone numbers defined in Rainbow users</BR>* LDAP: phone numbers defined in directories according to the following priority order:</BR>    * personal directory of the user</BR>    * company directory (of the company(ies) to which the PBX is linked)</BR>    * office365 directory (of the company(ies) to which the PBX is linked)</BR></BR>Possibles values : `RAINBOW`, `LDAP`, `PBX` |
     * | hasMediaPillar optionnel | Boolean | Indicates a mediapillar exists or not for this system |
     * | isShared optionnel | Boolean | Indicates if the system is **multi-company** (shared across multiple companies) |
     * | isCentrex optionnel | Boolean | Indicates if the system is one tenant or **multi-tenant (OXE - OTEC-S or third_party)** |
     * | isOxoManaged optionnel | Boolean | Indicates if the system is an OXO managed |
     * | bpId optionnel | String | Identifier which links the system to the corresponding Business partner company. Obligatory when a BP admin creates a isCentrex or isShared system not yet used by a company</BR></BR>Default value : `null` |
     * | connectionHistory | Object\[\] | history of connections. |
     * | eventType | String | Type of connection |
     * | eventDate | Date-Time | Date of connection |
     *
     */
    createSystem (name : string, pbxId : string = undefined, pbxLdapId : string = undefined, siteId : string, type : string, country : string, version ? : string,
                  serverPingTimeout ? : number, pbxMainBundlePrefix ? : Array<string>, usePbxMainBundlePrefix ? : boolean, pbxNumberingTranslator ? : Array<any>,
                  pbxNationalPrefix ? : string, pbxInternationalPrefix ? : string, searchResultOrder ? : Array<string>, activationCode ? : string, isCentrex ? : boolean,
                  isShared ? : boolean, bpId ? : string, isOxoManaged ? : boolean ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!name) {
                    this._logger.log("warn", LOG_ID + "(createSystem) bad or empty 'name' parameter");
                    this._logger.log("internalerror", LOG_ID + "(createSystem) bad or empty 'name' parameter : ", name);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.createSystem (name, pbxId, pbxLdapId, siteId, type, country, version,
                        serverPingTimeout, pbxMainBundlePrefix, usePbxMainBundlePrefix, pbxNumberingTranslator,
                        pbxNationalPrefix, pbxInternationalPrefix, searchResultOrder, activationCode, isCentrex,
                        isShared, bpId, isOxoManaged ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(createSystem) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(createSystem) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createSystem) ErrorManager error : ", err, ' : ', pbxId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createSystem) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteSystem
     * @since 2.20.0
     * @instance
     * @category Systems - systems
     * @async
     * @param {string} systemId System unique identifier
     * @description
     * This API allows administrator to delete a given system. </BR>
     * </BR>
     * superadmin can delete systems linked to all sites existing in Rainbow. </BR>
     * bp_admin can only delete systems linked to sites of End Customer companies for which their bp_admin's company is the BP company. </BR>
     * organization_admin can only delete systems linked to sites of companies under their organisation. </BR>
     * company_admin can only delete systems linked to sites of their company. </BR>
     * site_admin can only delete the systems linked to the site they administrate. </BR>
     * </BR>
     * Warning: all configuration data and phoneNumbers associated to this system will be deleted, and if these phoneNumbers were associated to a Rainbow user, it won't be anymore. </BR>
     * jid_pbxagent and jid_pbxpcg XMPP accounts will also be deleted from XMPP. </BR>
     * </BR>
     *
     * @return {Promise<any>} An object of the result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | status | String | Delete operation status message. |
     *
     */
    deleteSystem (systemId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(deleteSystem) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(deleteSystem) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.deleteSystem(systemId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(deleteSystem) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(deleteSystem) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteSystem) ErrorManager error : ", err, ' : ', systemId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(deleteSystem) error : ", err);
                return reject(err);
            }
        }); 
    }

    /**
     * @public
     * @method getSystemConnectionState
     * @since 2.20.0
     * @instance
     * @category Systems - systems
     * @async
     * @param {string} systemId System unique identifier
     * @param {string} format Allows to retrieve more or less details in response. </BR>
     * - small: timestamp, connection </BR>
     * - medium: timestamp, conf, csta, http </BR>
     * - full: timestamp, xmpp, conf, csta, http </BR>
     * </BR>
     * Possibles values : small, medium, full </BR>
     * @param {boolean} connectionHistory Allows to return connection history
     * @description
     * This API allows administrator to retrieve a given system.state </BR>
     * </BR>
     * superadmin and support can get all systems' state existing in Rainbow. </BR>
     * bp_admin can only get the systems' state linked to sites of End Customer companies for which their bp_admin's company is the BP company. </BR>
     * organization_admin can only get systems' state linked to sites of companies under their organisation. </BR>
     * company_admin can only get systems' state linked to sites of their company. </BR>
     * site_admin can only get the systems' state linked to the site they administrate. </BR>
     * </BR>
     *
     * @return {Promise<any>} An object of the result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | timestamp | String | Moment when the last update information was taken (Unix time format). |
     * | connection | String | Connection established indicator (only shown with the format small). |
     * | conf | string | Configuration channel connection established indicator. |
     * | csta | String | Telephony channel connection established indicator. |
     * | http optionnel | String | Http channel connection established indicator. |
     * | xmpp | String | Authentication channel connection established indicator (only shown with the format full). |
     * | connectionHistory | Object\[\] | history of connections. |
     * | eventType | String | Type of connection |
     * | eventDate | Date-Time | Date of connection |
     *
     */
    getSystemConnectionState (systemId : string, format : string = "small", connectionHistory? : boolean) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getSystemConnectionState) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getSystemConnectionState) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.getSystemConnectionState(systemId, format, connectionHistory).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getSystemConnectionState) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getSystemConnectionState) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getSystemConnectionState) ErrorManager error : ", err, ' : ', systemId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getSystemConnectionState) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getSystemDataByPbxId
     * @since 2.20.0
     * @instance
     * @category Systems - systems
     * @async
     * @param {string} pbxId Pbx unique identifier known by PCG
     * @param {boolean} connectionHistory Allows to return connection history
     * @description
     *  This API allows administrator to retrieve a given system from its pbxId. </BR>
     *      </BR>
     *  superadmin and support can get all systems existing in Rainbow. </BR>
     *  bp_admin can only get systems linked to sites of End Customer companies for which their bp_admin's company is the BP company. </BR>
     *  organization_admin can only get systems linked to sites of companies under their organisation. </BR>
     *  company_admin can only get systems linked to sites of their company. </BR>
     *  site_admin can only get the systems linked to the site they administrate.
     *
     * @return {Promise<any>} An object of the result
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | activatingTransactionId | String | CCA Jabber Id |
     * | jid\_pbxagent\_password_activating | String | CCA Jabber Id access code. The value of this field is depending on status field. The value of this field is depending on 'status' field.  </BR>\- `activating`: This is a proposal of private access code sent to CCA and not yet acknowledged.  </BR>\- `created, activated`: Empty string |
     * | id  | String | System unique identifier |
     * | name optionnel | String | System name/description |
     * | pbxId | String | Call Control Agent (CCA) login. |
     * | pbxLdapId optionnel | String | custom "pbxId" declared in an external DB (ldap), used to correlate to Rainbow pbxId. |
     * | siteId optionnel | String\[\] | Site from which the system is linked with. |
     * | type optionnel | string | CCA type</BR></BR>Possibles values : `oxo`, `oxe`, `third_party`, `undefined` |
     * | country optionnel | String | System country (ISO 3166-1 alpha3 format) |
     * | version | String | CCA software version |
     * | jid_pbxagent optionnel | String | CCA Jabber Id |
     * | jid\_pbxagent\_password optionnel | String | CCA Jabber Id access code. The value of this field is depending on status field.</BR></BR> * `created, activating`: This is the public access code. The code must be used by the CCA for the first connection.</BR> * `activated`: This is an Hash code of the private access code, reduced to the last eight digits |
     * | jid_pbxpcg optionnel | String | PCG Jabber Id for this system |
     * | jid\_pbxpcg\_password optionnel | String | PCG CCA Jabber Id password for this system |
     * | status optionnel | String | CCA status report. (read only)</BR></BR> * `created`: CCA uses a public access code to join rainbow infrastructure (see jid\_pbxagent\_password field)</BR> * `activating`: Rainbow infrastructure has proposed a private access code to replace the former public access code</BR> * `activated`: CCA has accepted the new access code, that will be used for the next initialization.</BR></BR>Default value : `created`</BR></BR>Possibles values : `"created"`, `"activating"`, `"activated"` |
     * | serverPingTimeout optionnel | Number | CCA config data |
     * | pbxMainBundlePrefix optionnel | String\[\] | CCA config data |
     * | pbxNumberingTranslator optionnel | Object\[\] | List of several regular expressions used to validate internal or external phone numbers. Up to 100 regular expressions are allowed. (64 max char by regexp). To reset the list, use \[\] |
     * | regexpMatch optionnel | String | A valid regular expression used to select a translator action. \\d is not supported! Use (0..9) instead. |
     * | regexpReplace optionnel | String | A valid dialable number. |
     * | description optionnel | String | A short description of the rule * @apiSuccess {Boolean} usePbxMainBundlePrefix Whether or not pbxMainBundlePrefix is used by PCG |
     * | pbxNationalPrefix optionnel | String | National prefix |
     * | pbxInternationalPrefix optionnel | String | International prefix |
     * | creationDate | Date-Time | System creation date (Read only) |
     * | statusUpdatedDate optionnel | Date-Time | Date of last system status update (Read only) |
     * | searchResultOrder optionnel | String\[\] | List of directory types to order search results:</BR></BR>* RAINBOW: phone numbers defined in Rainbow users</BR>* LDAP: phone numbers defined in directories according to the following priority order:</BR>    * personal directory of the user</BR>    * company directory (of the company(ies) to which the PBX is linked)</BR>    * office365 directory (of the company(ies) to which the PBX is linked)</BR></BR>Possibles values : `RAINBOW`, `LDAP`, `PBX` |
     * | hasMediaPillar optionnel | Boolean | Indicates a mediapillar exists or not for this system |
     * | isShared optionnel | Boolean | Indicates if the system is **multi-company** (shared across multiple companies) |
     * | isCentrex optionnel | Boolean | Indicates if the system is one tenant or **multi-tenant (OXE - OTEC-S or third_party)** |
     * | isOxoManaged optionnel | Boolean | Indicates if the system is an OXO managed |
     * | bpId optionnel | String | Identifier which links the system to the corresponding Business partner company. Obligatory when a BP admin creates a isCentrex or isShared system not yet used by a company</BR></BR>Default value : `null` |
     * | connectionHistory | Object\[\] | history of connections. |
     * | eventType | String | Type of connection |
     * | eventDate | Date-Time | Date of connection |
     *
     */
    getSystemDataByPbxId (pbxId : string, connectionHistory? :boolean ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!pbxId) {
                    this._logger.log("warn", LOG_ID + "(getSystemDataByPbxId) bad or empty 'pbxId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getSystemDataByPbxId) bad or empty 'pbxId' parameter : ", pbxId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.getSystemDataByPbxId (pbxId, connectionHistory ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getSystemDataByPbxId) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getSystemDataByPbxId) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getSystemDataByPbxId) ErrorManager error : ", err, ' : ', pbxId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getSystemDataByPbxId) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getSystemData
     * @since 2.20.0
     * @instance
     * @category Systems - systems
     * @async
     * @param {string} systemId System unique identifier
     * @param {boolean} connectionHistory Allows to return connection history
     * @description
     *  This API allows administrator to retrieve a given system. </BR>
     *  </BR>
     *  superadmin and support can get all systems existing in Rainbow. </BR>
     *  bp_admin can only get systems linked to sites of End Customer companies for which their bp_admin's company is the BP company. </BR>
     *  organization_admin can only get systems linked to sites of companies under their organisation. </BR>
     *  company_admin can only get systems linked to sites of their company. </BR>
     *  site_admin can only get the systems linked to the site they administrate. </BR>
     *
     * @return {Promise<any>} An object of the result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | activatingTransactionId | String | CCA Jabber Id |
     * | jid\_pbxagent\_password_activating | String | CCA Jabber Id access code. The value of this field is depending on status field. The value of this field is depending on 'status' field.  </BR>\- `activating`: This is a proposal of private access code sent to CCA and not yet acknowledged.  </BR>\- `created, activated`: Empty string |
     * | id  | String | System unique identifier |
     * | name optionnel | String | System name/description |
     * | pbxId | String | Call Control Agent (CCA) login. |
     * | pbxLdapId optionnel | String | custom "pbxId" declared in an external DB (ldap), used to correlate to Rainbow pbxId. |
     * | siteId optionnel | String\[\] | Site from which the system is linked with. |
     * | type optionnel | string | CCA type</BR></BR>Possibles values : `oxo`, `oxe`, `third_party`, `undefined` |
     * | country optionnel | String | System country (ISO 3166-1 alpha3 format) |
     * | version | String | CCA software version |
     * | jid_pbxagent optionnel | String | CCA Jabber Id |
     * | jid\_pbxagent\_password optionnel | String | CCA Jabber Id access code. The value of this field is depending on status field.</BR></BR> * `created, activating`: This is the public access code. The code must be used by the CCA for the first connection.</BR> * `activated`: This is an Hash code of the private access code, reduced to the last eight digits |
     * | jid_pbxpcg optionnel | String | PCG Jabber Id for this system |
     * | jid\_pbxpcg\_password optionnel | String | PCG CCA Jabber Id password for this system |
     * | status optionnel | String | CCA status report. (read only)</BR></BR> * `created`: CCA uses a public access code to join rainbow infrastructure (see jid\_pbxagent\_password field)</BR> * `activating`: Rainbow infrastructure has proposed a private access code to replace the former public access code</BR> * `activated`: CCA has accepted the new access code, that will be used for the next initialization.</BR></BR>Default value : `created`</BR></BR>Possibles values : `"created"`, `"activating"`, `"activated"` |
     * | serverPingTimeout optionnel | Number | CCA config data |
     * | pbxMainBundlePrefix optionnel | String\[\] | CCA config data |
     * | pbxNumberingTranslator optionnel | Object\[\] | List of several regular expressions used to validate internal or external phone numbers. Up to 100 regular expressions are allowed. (64 max char by regexp). To reset the list, use \[\] |
     * | regexpMatch optionnel | String | A valid regular expression used to select a translator action. \\d is not supported! Use (0..9) instead. |
     * | regexpReplace optionnel | String | A valid dialable number. |
     * | description optionnel | String | A short description of the rule * @apiSuccess {Boolean} usePbxMainBundlePrefix Whether or not pbxMainBundlePrefix is used by PCG |
     * | pbxNationalPrefix optionnel | String | National prefix |
     * | pbxInternationalPrefix optionnel | String | International prefix |
     * | creationDate | Date-Time | System creation date (Read only) |
     * | statusUpdatedDate optionnel | Date-Time | Date of last system status update (Read only) |
     * | searchResultOrder optionnel | String\[\] | List of directory types to order search results:</BR></BR>* RAINBOW: phone numbers defined in Rainbow users</BR>* LDAP: phone numbers defined in directories according to the following priority order:</BR>    * personal directory of the user</BR>    * company directory (of the company(ies) to which the PBX is linked)</BR>    * office365 directory (of the company(ies) to which the PBX is linked)</BR></BR>Possibles values : `RAINBOW`, `LDAP`, `PBX` |
     * | hasMediaPillar optionnel | Boolean | Indicates a mediapillar exists or not for this system |
     * | isShared optionnel | Boolean | Indicates if the system is **multi-company** (shared across multiple companies) |
     * | isCentrex optionnel | Boolean | Indicates if the system is one tenant or **multi-tenant (OXE - OTEC-S or third_party)** |
     * | isOxoManaged optionnel | Boolean | Indicates if the system is an OXO managed |
     * | bpId optionnel | String | Identifier which links the system to the corresponding Business partner company. Obligatory when a BP admin creates a isCentrex or isShared system not yet used by a company</BR></BR>Default value : `null` |
     * | connectionHistory | Object\[\] | history of connections. |
     * | eventType | String | Type of connection |
     * | eventDate | Date-Time | Date of connection |
     * 
     */
    getSystemData (systemId : string, connectionHistory? :boolean ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                if (!systemId) {
                    this._logger.log("warn", LOG_ID + "(getSystemData) bad or empty 'systemId' parameter");
                    this._logger.log("internalerror", LOG_ID + "(getSystemData) bad or empty 'systemId' parameter : ", systemId);
                    return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
                }

                that._rest.getSystemData (systemId, connectionHistory ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getSystemData) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getSystemData) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getSystemData) ErrorManager error : ", err, ' : ', systemId);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getSystemData) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getAllSystems
     * @since 2.20.0
     * @instance
     * @category Systems - systems
     * @async
     * @param {boolean} connectionHistory Allows to return connection history
     * @param {string} format Allows to retrieve more or less system details in response. </BR>
     * - small: id pbxId version </BR>
     * - medium: id name pbxId serialNumber version status </BR>
     * - full: all system fields </BR>
     * </BR>
     * Default value : small. Possibles values : small, medium, full
     * @param {number} limit Allow to specify the number of systems to retrieve. Default value : 100
     * @param {number} offset Allow to specify the position of first system to retrieve (first site if not specified). Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort system list based on the given field. Default value : pbxId
     * @param {number} sortOrder Specify order when sorting pbx list. Default value : 1. Possibles values : -1, 1
     * @param {string} name Allows to filter systems list on field name. </BR>
     * The filtering is case insensitive and on partial name match: all systems containing the provided name value will be returned (whatever the position of the match). </BR>
     * Ex: if filtering is done on oxe1, systems with the following names are match the filter 'OXE1', 'Oxe1', 'My oxe1', 'oxe12', 'My OXE12', ... </BR>
     * @param {string} type Allows to filter systems list on the provided type(s). Possibles values : oxo, oxe, third_party, undefined
     * @param {string} status Allows to filter systems list on the provided status(es). Possibles values : created, activating, activated, terminated
     * @param {string} siteId Allows to filter systems list on the siteIds provided in this option.
     * @param {string} companyId Allows to filter systems list on the siteIds linked to companyIds provided in this option.
     * @param {string} bpId Allows to filter systems list on the bpIds provided in this option. Only superadmin, support and bp_admin users can use bpId filter. bp_admin users can only use bpId filter with bpId they manage (their own BP company or companies being in their BP organisation).
     * @param {boolean} isShared Allows to filter systems list by the status isShared.
     * @param {boolean} isCentrex Allows to filter systems list by the status isCentrex.
     * @param {boolean} isSharedOrCentrex Allows to filter systems list having the requested flag isShared or isCentrex. </BR>
     * </BR>
     * If isSharedOrCentrex=true, only systems having isShared=true or isCentrex=true are returned. </BR>
     * If isSharedOrCentrex=false, only systems having isShared=false and isCentrex=false are returned. </BR>
     * </BR>
     * @param {boolean} isOxoManaged Allows to filter systems list by the setting isOxoManaged.
     * @param {string} fromCreationDate Allows to filter systems list from provided date (ISO 8601 format).
     * @param {string} toCreationDate Allows to filter systems list until provided date (ISO 8601 format).
     * @description
     *  This API allows administrator to retrieve systems they can administrate. </BR>
     *  </BR>
     *  superadmin and support get all systems existing in Rainbow. </BR>
     *  bp_admin only get systems linked to sites of End Customer companies for which their bp_admin's company is the BP company. </BR>
     *  organization_admin only get systems linked to sites of companies under their organisation. </BR>
     *  company_admin only get systems linked to sites of their company. </BR>
     *  site_admin only get the systems linked to the site they administrate. </BR>
     *  </BR>
     *
     * @return {Promise<any>} An object of the result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | System unique identifier |
     * | name optionnel | String | System name/description |
     * | pbxId | String | Call Control Agent (CCA) login. |
     * | pbxLdapId optionnel | String | custom "pbxId" declared in an external DB (ldap), used to correlate to Rainbow pbxId. |
     * | siteId optionnel | String\[\] | Site from which the system is linked with. |
     * | type optionnel | string | CCA type</BR></BR>Possibles values : `oxo`, `oxe`, `third_party`, `undefined` |
     * | country optionnel | String | System country (ISO 3166-1 alpha3 format) |
     * | version | String | CCA software version |
     * | jid_pbxagent optionnel | String | CCA Jabber Id |
     * | jid\_pbxagent\_password optionnel | String | CCA Jabber Id access code. The value of this field is depending on status field.</BR></BR> * `created, activating`: This is the public access code. The code must be used by the CCA for the first connection.</BR> * `activated`: This is an Hash code of the private access code, reduced to the last eight digits |
     * | jid_pbxpcg optionnel | String | PCG Jabber Id for this system |
     * | jid\_pbxpcg\_password optionnel | String | PCG CCA Jabber Id password for this system |
     * | status optionnel | String | CCA status report. (read only)</BR></BR> * `created`: CCA uses a public access code to join rainbow infrastructure (see jid\_pbxagent\_password field)</BR> * `activating`: Rainbow infrastructure has proposed a private access code to replace the former public access code</BR> * `activated`: CCA has accepted the new access code, that will be used for the next initialization.</BR></BR>Default value : `created`</BR></BR>Possibles values : `"created"`, `"activating"`, `"activated"` |
     * | serverPingTimeout optionnel | Number | CCA config data |
     * | pbxMainBundlePrefix optionnel | String\[\] | CCA config data |
     * | pbxNumberingTranslator optionnel | Object\[\] | List of several regular expressions used to validate internal or external phone numbers. Up to 100 regular expressions are allowed. (64 max char by regexp). To reset the list, use \[\] |
     * | regexpMatch optionnel | String | A valid regular expression used to select a translator action. \\d is not supported! Use (0..9) instead. |
     * | regexpReplace optionnel | String | A valid dialable number. |
     * | description optionnel | String | A short description of the rule * @apiSuccess {Boolean} usePbxMainBundlePrefix Whether or not pbxMainBundlePrefix is used by PCG |
     * | pbxNationalPrefix optionnel | String | National prefix |
     * | pbxInternationalPrefix optionnel | String | International prefix |
     * | creationDate | Date-Time | System creation date (Read only) |
     * | statusUpdatedDate optionnel | Date-Time | Date of last system status update (Read only) |
     * | searchResultOrder optionnel | String\[\] | List of directory types to order search results:</BR></BR>* RAINBOW: phone numbers defined in Rainbow users</BR>* LDAP: phone numbers defined in directories according to the following priority order:</BR>    * personal directory of the user</BR>    * company directory (of the company(ies) to which the PBX is linked)</BR>    * office365 directory (of the company(ies) to which the PBX is linked)</BR></BR>Possibles values : `RAINBOW`, `LDAP`, `PBX` |
     * | hasMediaPillar optionnel | Boolean | Indicates a mediapillar exists or not for this system |
     * | isShared optionnel | Boolean | Indicates if the system is **multi-company** (shared across multiple companies) |
     * | isCentrex optionnel | Boolean | Indicates if the system is one tenant or **multi-tenant (OXE - OTEC-S or third_party)** |
     * | isOxoManaged optionnel | Boolean | Indicates if the system is an OXO managed |
     * | bpId optionnel | String | Identifier which links the system to the corresponding Business partner company. Obligatory when a BP admin creates a isCentrex or isShared system not yet used by a company</BR></BR>Default value : `null` |
     * | connectionHistory | Object\[\] | history of connections. |
     * | eventType | String | Type of connection |
     * | eventDate | Date-Time | Date of connection |
     * 
     */
    getAllSystems (connectionHistory ? : boolean, format : string = "small", limit : number = 100, offset : number = 0, sortField : string = "pbxId", sortOrder : number=1,
                   name ? : string, type ? : string, status ? : string, siteId ? : string, companyId ? : string, bpId ? : string, isShared ? : boolean, isCentrex ? : boolean,
                   isSharedOrCentrex ? : boolean, isOxoManaged ? : boolean, fromCreationDate ? : string, toCreationDate ? : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getAllSystems (connectionHistory , format , limit , offset , sortField , sortOrder ,
                        name , type , status , siteId , companyId , bpId , isShared , isCentrex ,
                        isSharedOrCentrex , isOxoManaged , fromCreationDate , toCreationDate ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getAllSystems) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getAllSystems) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getAllSystems) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllSystems) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getListOfCountriesAllowedForSystems
     * @since 2.20.0
     * @instance
     * @category Systems - systems
     * @async
     * @description
     *  This API allows to retrieve the list of countries supported by Rainbow Server for systems country field. </BR>
     *
     * @return {Promise<any>} An object of the result
     *
     *
     */
    getListOfCountriesAllowedForSystems () {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.getListOfCountriesAllowedForSystems ( ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getListOfCountriesAllowedForSystems) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getListOfCountriesAllowedForSystems) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => { 
                    that._logger.log("error", LOG_ID + "(getListOfCountriesAllowedForSystems) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getListOfCountriesAllowedForSystems) error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method updateSystem
     * @since 2.20.0
     * @instance
     * @category Systems - systems
     * @async
     * @param {string} systemId System unique identifier
     * @param {string} name System name/description
     * @param {string} siteId Site from which the system is linked with.
     * @param {string} pbxLdapId custom "pbxId" declared in an external DB (ldap), used to correlate to Rainbow pbxId.
     * @param {string} type CCA type. Possibles values : oxo, oxe, third_party, undefined
     * @param {string} country System country (ISO 3166-1 alpha3 format)
     * @param {string} version CCA software version
     * @param {number} serverPingTimeout CCA config data. Default value : 120
     * @param {string} pbxMainBundlePrefix CCA config data
     * @param {boolean} usePbxMainBundlePrefix Whether or not pbxMainBundlePrefix is used by PCG
     * @param {Array<Object>} pbxNumberingTranslator List of several regular expressions used to validate internal or external phone numbers. Up to 100 regular expressions are allowed. (64 max char by regexp). To reset the list, use []
     * Object : {
     *     regexpMatch : string A valid regular expression used to select a translator action. \d is not supported! Use (0..9) instead.
     *     regexpReplace ? : string A valid dialable number.
     *     description ? : string A short description of the rule
     * }
     * @param {string} pbxNationalPrefix  National prefix
     * @param {string} pbxInternationalPrefix International prefix
     * @param {Array<string>} searchResultOrder List of directory types to order search results: </BR>
     * </BR>
     * * RAINBOW: phone numbers defined in Rainbow users </BR>
     * * LDAP: phone numbers defined in directories according to the following priority order: </BR>
     *   - personal directory of the user </BR>
     *   - company directory (of the company(ies) to which the PBX is linked) </BR>
     *   - office365 directory (of the company(ies) to which the PBX is linked) </BR>
     * </BR>
     * Possibles values : RAINBOW, LDAP, PBX </BR>
     * @param {boolean} isShared Indicates if the system is multi-company (shared across multiple companies). </BR>
     * </BR>
     * * isShared flag can't be set to true if isCentrex flag is true (these settings are exclusives). </BR>
     * * Shared systems can be linked to several sites from different companies. </BR>
     * * Several shared PBX can be attached to a same Rainbow company, as well as "standard" systems (i.e. systems without isShared flag, and so being linked only to this company). </BR>
     * * Companies being linked to shared PBX can't be attached to centrex systems. </BR>
     * * It is understood that this approach exposes all users of the shared PBX to all companies that have users on this PBX (for association, for dial by name). </BR> Anyway it seats on a PBX infra where all PBX users can directly dial (by short num and DBN) any other users of the network from their deskphones. </BR>
     * * In cases the underlying infra is an homogeneous network of PBX, PBX grouping has to be managed. </BR>
     * * isShared flag can be updated to true only if the system has isCentrex=false and is linked to at least one site or if a bpId is set. </BR>
     * * isShared flag can be updated to false only if the system is linked to one site (exactly). In that case, bpId field is automatically reset to null. </BR>
     * </BR>
     * 
     * @param {boolean} bpId Link the system to the corresponding Business partner company. bpId must correspond to a valid company having isBP equal to true. Only directly settable by superadmin.
     * @description
     *  This API allows administrator to update a given system. </BR>
     *  </BR>
     *  superadmin can update systems linked to all sites existing in Rainbow. </BR>
     *  bp_admin can only update systems linked to sites of End Customer companies for which their bp_admin's company is the BP company. </BR>
     *  organization_admin can only update systems linked to sites of companies under their organisation. </BR>
     *  company_admin can only update systems linked to sites of their company. </BR>
     *  site_admin can only update the systems linked to the site they administrate. </BR>
     *
     * @return {Promise<any>} An object of the result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | System unique identifier |
     * | name optionnel | String | System name/description |
     * | pbxId | String | Call Control Agent (CCA) login. |
     * | pbxLdapId optionnel | String | custom "pbxId" declared in an external DB (ldap), used to correlate to Rainbow pbxId. |
     * | siteId optionnel | String\[\] | Site from which the system is linked with. |
     * | type optionnel | string | CCA type<br><br>Possibles values : `oxo`, `oxe`, `third_party`, `undefined` |
     * | country optionnel | String | System country (ISO 3166-1 alpha3 format) |
     * | version | String | CCA software version |
     * | jid_pbxagent optionnel | String | CCA Jabber Id |
     * | jid\_pbxagent\_password optionnel | String | CCA Jabber Id access code. The value of this field is depending on status field.<br><br>> * `created, activating`: This is the public access code. The code must be used by the CCA for the first connection.<br>> * `activated`: This is an Hash code of the private access code, reduced to the last eight digits |
     * | jid_pbxpcg optionnel | String | PCG Jabber Id for this system |
     * | jid\_pbxpcg\_password optionnel | String | PCG CCA Jabber Id password for this system |
     * | status optionnel | String | CCA status report. (read only)<br><br>> * `created`: CCA uses a public access code to join rainbow infrastructure (see jid\_pbxagent\_password field)<br>> * `activating`: Rainbow infrastructure has proposed a private access code to replace the former public access code<br>> * `activated`: CCA has accepted the new access code, that will be used for the next initialization.<br><br>Default value : `created`<br><br>Possibles values : `"created"`, `"activating"`, `"activated"` |
     * | serverPingTimeout optionnel | Number | CCA config data |
     * | pbxMainBundlePrefix optionnel | String\[\] | CCA config data |
     * | pbxNumberingTranslator optionnel | Object\[\] | List of several regular expressions used to validate internal or external phone numbers. Up to 100 regular expressions are allowed. (64 max char by regexp). To reset the list, use \[\] |
     * | regexpMatch optionnel | String | A valid regular expression used to select a translator action. \\d is not supported! Use (0..9) instead. |
     * | regexpReplace optionnel | String | A valid dialable number. |
     * | description optionnel | String | A short description of the rule * @apiSuccess {Boolean} usePbxMainBundlePrefix Whether or not pbxMainBundlePrefix is used by PCG |
     * | pbxNationalPrefix optionnel | String | National prefix |
     * | pbxInternationalPrefix optionnel | String | International prefix |
     * | creationDate | Date-Time | System creation date (Read only) |
     * | statusUpdatedDate optionnel | Date-Time | Date of last system status update (Read only) |
     * | searchResultOrder optionnel | String\[\] | List of directory types to order search results:<br><br>* RAINBOW: phone numbers defined in Rainbow users<br>* LDAP: phone numbers defined in directories according to the following priority order:<br>    * personal directory of the user<br>    * company directory (of the company(ies) to which the PBX is linked)<br>    * office365 directory (of the company(ies) to which the PBX is linked)<br><br>Possibles values : `RAINBOW`, `LDAP`, `PBX` |
     * | hasMediaPillar optionnel | Boolean | Indicates a mediapillar exists or not for this system |
     * | isShared optionnel | Boolean | Indicates if the system is **multi-company** (shared across multiple companies) |
     * | isCentrex optionnel | Boolean | Indicates if the system is one tenant or **multi-tenant (OXE - OTEC-S or third_party)** |
     * | isOxoManaged optionnel | Boolean | Indicates if the system is an OXO managed |
     * | bpId optionnel | String | Identifier which links the system to the corresponding Business partner company. Obligatory when a BP admin creates a isCentrex or isShared system not yet used by a company<br><br>Default value : `null` |
     * | connectionHistory | Object\[\] | history of connections. |
     * | eventType | String | Type of connection |
     * | eventDate | Date-Time | Date of connection |
     *  
     */
    updateSystem ( systemId : string, name ? : string, siteId ? : string, pbxLdapId ? : string, type ? : string, country ? : string, version ? : string,
    serverPingTimeout : number = 100, pbxMainBundlePrefix ? : string, usePbxMainBundlePrefix ? : boolean, pbxNumberingTranslator ? : Array<any>, pbxNationalPrefix ? : string, pbxInternationalPrefix ? : string, searchResultOrder ? : Array<string>,
    isShared ? : boolean, bpId ? : string ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {

                that._rest.updateSystem ( systemId , name , siteId , pbxLdapId , type , country , version ,
                        serverPingTimeout , pbxMainBundlePrefix , usePbxMainBundlePrefix , pbxNumberingTranslator , pbxNationalPrefix , pbxInternationalPrefix , searchResultOrder ,
                        isShared , bpId ).then((result) => {
                    that._logger.log("debug", LOG_ID + "(updateSystem) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(updateSystem) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(updateSystem) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(updateSystem) error : ", err);
                return reject(err);
            }
        });
    }
    
    // endregion systems systems

    //region pcg pbxs

    // API Private because the PCG role is need.
    getPbxData(pbxId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {              
                that._rest.getPbxData ( pbxId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getPbxData) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getPbxData) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getPbxData) ErrorManager error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getPbxData) error : ", err);
                return reject(err);
            }
        });
    }
    
    // API Private because the PCG role is need.
    getAllPbxs(format : string = "small", sortField : string = "id", limit : number =  100, offset : number = 0, sortOrder : number = 1, name : string = undefined, type : string = undefined, status: string = undefined, siteId : string = undefined, companyId : string = undefined,
               bpId : string = undefined, isShared : boolean = undefined, isCentrex : boolean = undefined, isSharedOrCentrex : boolean = undefined, isOxoManaged : boolean = undefined, fromCreationDate : string = undefined, toCreationDate : string = undefined) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {              
                that._rest.getAllPbxs ( format, sortField, limit, offset, sortOrder, name, type, status, siteId, companyId, bpId, isShared, isCentrex, isSharedOrCentrex, isOxoManaged, fromCreationDate, toCreationDate).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getAllPbxs) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getAllPbxs) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getAllPbxs) ErrorManager error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllPbxs) error : ", err);
                return reject(err);
            }
        });
    }
    
    //endregion pcg pbxs 


    //region pcg pbxs phone numbers 

    createPbxPhoneNumber( pbxId : string, shortNumber : string, voiceMailNumber : string, pbxUserId : string, companyPrefix : string, internalNumber : string, type : string, deviceType : string, firstName : string, lastName : string, deviceName : string){
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.createPbxPhoneNumber (  pbxId, shortNumber, voiceMailNumber, pbxUserId, companyPrefix, internalNumber, type, deviceType, firstName, lastName, deviceName).then((result) => {
                    that._logger.log("debug", LOG_ID + "(createPbxPhoneNumber) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(createPbxPhoneNumber) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createPbxPhoneNumber) ErrorManager error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(createPbxPhoneNumber) error : ", err);
                return reject(err);
            }
        });
    }

    deletePbxPhoneNumber(pbxId : string, shortNumber : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.deletePbxPhoneNumber (pbxId, shortNumber).then((result) => {
                    that._logger.log("debug", LOG_ID + "(deletePbxPhoneNumber) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(deletePbxPhoneNumber) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deletePbxPhoneNumber) ErrorManager error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(deletePbxPhoneNumber) error : ", err);
                return reject(err);
            }
        });
    }

    getPbxPhoneNumber(pbxId : string, shortNumber : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getPbxPhoneNumber (pbxId, shortNumber).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getPbxPhoneNumber) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getPbxPhoneNumber) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getPbxPhoneNumber) ErrorManager error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getPbxPhoneNumber) error : ", err);
                return reject(err);
            }
        });
    }

    getAllPbxPhoneNumbers(pbxId : string, format : string = "small", shortNumber : string, internalNumber : string, pbxUserId : string,
                          companyPrefix : string, isMonitored : boolean, name : string, nameOrShortNumber : string, deviceName : string,
                          isAssignedToUser : boolean, limit : number = 100, offset : number, sortField : string = "shortNumber", sortOrder : number = 1) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getAllPbxPhoneNumbers ( pbxId, format, shortNumber, internalNumber, pbxUserId,
                        companyPrefix, isMonitored, name, nameOrShortNumber, deviceName,
                        isAssignedToUser, limit, offset, sortField, sortOrder).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getAllPbxPhoneNumbers) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getAllPbxPhoneNumbers) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getAllPbxPhoneNumbers) ErrorManager error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(getAllPbxPhoneNumbers) error : ", err);
                return reject(err);
            }
        });
    }

    updatepbxPhoneNumber(pbxId: string, shortNumber : string, voiceMailNumber : string, pbxUserId : string, companyPrefix : string, companyName : string, internalNumber : string, type : string, deviceType : string, firstName : string, lastName : string, deviceName : string ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.updatepbxPhoneNumber ( pbxId, shortNumber, voiceMailNumber, pbxUserId, companyPrefix, companyName, internalNumber, type, deviceType, firstName, lastName, deviceName).then((result) => {
                    that._logger.log("debug", LOG_ID + "(updatepbxPhoneNumber) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(updatepbxPhoneNumber) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(updatepbxPhoneNumber) ErrorManager error : ", err);
                    return reject(err);
                });
            } catch (err) {
                that._logger.log("internalerror", LOG_ID + "(updatepbxPhoneNumber) error : ", err);
                return reject(err);
            }
        });
    }

    //endregion pcg pbxs phone numbers
    
    // region systems phone numbers    

    /**
     * @public
     * @method getASystemPhoneNumber
     * @since 2.20.0
     * @instance
     * @category Systems -  Phone numbers
     * @async
     * @param {string} systemId System unique identifier
     * @param {string} phoneNumberId PhoneNumber unique identifier
     * @description
     *      This API allows to retrieve a specific phoneNumber associated to a given system (pbx).</BR>
     *      Users with superadmin or support role can retrieve phoneNumbers from any system.</BR>
     *      bp_admin can only retrieve phoneNumbers linked to systems of End Customer companies for which their bp_admin's company is the BP company.</BR>
     *      Users with admin role (and not having superadmin nor support role) can only retrieve phoneNumbers of systems that they manage.</BR>
     *      In a Multi-Layer organization that describes a hierarchy including ORGANIZATIONS/COMPANIES/SITES/SYSTEMS, an admin role of a upper layer is allowed to see systems within their's reach. </BR>
     *   
     * @return {Promise<any>} An object of the result
     * 
     *
     *    | Champ | Type | Description |
     *    | --- | --- | --- |
     *    | id  | String | Phone number unique identifier |
     *    | shortNumber | String | Short phone number (corresponds to the number monitored by PCG).  </BR>Only usable within the same PBX.  </BR>shortNumber can contain alpha-numeric characters and some special characters. The regular expression validating the shortNumber data is the following: `/^[0-9A-Za-z #\-\+\*\(\)\./]{1,32}$/` |
     *    | internalNumber | String | Internal phone number.  </BR>Usable within a PBX group.  </BR>internalNumber can contain alpha-numeric characters and some special characters. The regular expression validating the internalNumber data is the following: `/^[0-9A-Za-z #\-\+\*\(\)\./]{1,32}$/` |
     *    | voiceMailNumber optionnel | String | Voice mail phone number  </BR>voiceMailNumber can contain alpha-numeric characters and some special characters. The regular expression validating the voiceMailNumber data is the following: `/^[0-9A-Za-z #\-\+\*\(\)\./]{1,32}$/` |
     *    | number optionnel | String | DDI phone number |
     *    | numberE164 optionnel | String | E.164 phone number (computed by server if number is set) |
     *    | pbxUserId | String | Pbx's user Id |
     *    | userId optionnel | String | Rainbow userId to which the phone number is linked |
     *    | jid_im | String | jid_im of the Rainbow user to which the phone number is linked |
     *    | jid_tel | String | jid_tel of the Rainbow user to which the phone number is linked |
     *    | jid_password | String | jid_password of the Rainbow user to which the phone number is linked |
     *    | rainbowNumber optionnel | String | Rainbow number of the Rainbow user to which the phone number is linked |
     *    | country optionnel | String | Phone number country (ISO 3166-1 alpha3 format)  </BR>Country field is automatically computed using the following algorithm:</BR></BR>* If `number` is provided and is in E164 format, `country` is computed from this E164 number</BR>* Else if phoneNumber is assigned to a user, user's `country` is used</BR>* Else, system's `country` is used |
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
     * @category Systems -  Phone numbers
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
     *  This API allows to list all phoneNumbers associated to a given system (pbx).</BR>
     *    
     *  Users with superadmin or support role can retrieve phoneNumbers from any system.</BR>
     *  bp_admin can only retrieve phoneNumbers linked to systems of End Customer companies for which their bp_admin's company is the BP company.</BR>
     *  Users with admin role (and not having superadmin nor support role) can only retrieve phoneNumbers of systems that they manage.</BR>
     *  In a Multi-Layer organization that describes a hierarchy including ORGANIZATIONS/COMPANIES/SITES/SYSTEMS, an admin role of a upper layer is allowed to see systems within their's reach.</BR>
     *  :</BR>
     *  Notes:</BR>
     *  systemId field returned in response corresponds to portal's internal mongoDB id, while pbxId is the id handled by PCG.</BR>
     *  This API is paginated.</BR>
     *  phoneNumbers list can be filtered on the following fields:</BR>
     *  shortNumber: allow to retrieve only phoneNumbers starting by the provided value.</BR>
     *  Example: shortNumber=123</BR>
     *  internalNumber: allow to retrieve only phoneNumbers starting by the provided value.</BR>
     *  Example: internalNumber=123</BR>
     *  pbxUserId: allow to retrieve only phoneNumbers having the provided pbxUserId value.</BR>
     *  Example: pbxUserId=123</BR>
     *  isMonitored: allow to retrieve only phoneNumbers for which monitoring in Rainbow application is activated (true) or deactivated (false).</BR>
     *  Example: isMonitored=true</BR>
     *  isAssignedToUser: allow to retrieve only phoneNumbers being associated (true) or not (false) to a Rainbow user.</BR>
     *  Example: isAssignedToUser=true</BR>
     *  userId: allow to retrieve only phoneNumbers being associated to the requested Rainbow user id.</BR>
     *  Example: userId=57960e4fa1ab69c4243415b1</BR>
     *  companyPrefix: allow to retrieve only phoneNumbers having the provided companyPrefix value. See below 'Sharing a system between several companies'</BR>
     *  Example: companyPrefix=8210 This filter is not taken in account for role admin.</BR>
     *  Filters can be combined. </BR>
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
     * @category Systems -  Phone numbers
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
     *   This API allows to update a phone number for a given system (pbx). </BR>
     *   It can be used to link a system phoneNumber to a Rainbow user by setting userId parameter. If userId parameter is provided, jid_im, jid_tel, jid_password and rainbowNumber of the corresponding user are automatically set in phoneNumber. </BR>
     *   It can also be used to enable monitoring of this phoneNumber by PCG (set isMonitored parameter to true). </BR>
     *   Note that pbxId, systemId, shortNumber and pbxUserId can't be modified. </BR>
     *
     * @return {Promise<any>} An object of the result
     *
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Phone number unique identifier |
     * | shortNumber | String | Short phone number (corresponds to the number monitored by PCG).  </BR>Only usable within the same PBX.  </BR>shortNumber can contain alpha-numeric characters and some special characters. The regular expression validating the shortNumber data is the following: `/^[0-9A-Za-z #\-\+\*\(\)\./]{1,32}$/` |
     * | internalNumber | String | Internal phone number.  </BR>Usable within a PBX group.  </BR>internalNumber can contain alpha-numeric characters and some special characters. The regular expression validating the internalNumber data is the following: `/^[0-9A-Za-z #\-\+\*\(\)\./]{1,32}$/` |
     * | voiceMailNumber optionnel | String | Voice mail phone number  </BR>voiceMailNumber can contain alpha-numeric characters and some special characters. The regular expression validating the voiceMailNumber data is the following: `/^[0-9A-Za-z #\-\+\*\(\)\./]{1,32}$/` |
     * | number optionnel | String | DDI phone number |
     * | numberE164 optionnel | String | E.164 phone number (computed by server if number is set) |
     * | pbxUserId | String | Pbx's user Id |
     * | userId optionnel | String | Rainbow userId to which the phone number is linked |
     * | jid_im | String | jid_im of the Rainbow user to which the phone number is linked |
     * | jid_tel | String | jid_tel of the Rainbow user to which the phone number is linked |
     * | jid_password | String | jid_password of the Rainbow user to which the phone number is linked |
     * | rainbowNumber optionnel | String | Rainbow number of the Rainbow user to which the phone number is linked |
     * | country optionnel | String | Phone number country (ISO 3166-1 alpha3 format)  </BR>Country field is automatically computed using the following algorithm:</BR></BR>* If `number` is provided and is in E164 format, `country` is computed from this E164 number</BR>* Else if phoneNumber is assigned to a user, user's `country` is used</BR>* Else, system's `country` is used |
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

    //endregion systems phone numbers    

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
     * @param {Array<string>} tags An Array of free tags </BR>
     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. </BR>
     * The tags can be used to search the directory entries of type user or company using multi-criterion search (search query parameter of the API GET /api/rainbow/directory/v1.0/entries). The multi-criterion search using the tags can only be done on directories belonging to the company of the logged in user (and to the companies belonging to the organisation of the logged in user if that is the case). </BR>
     * @param {string} custom1 Custom field 1
     * @param {string} custom2 Custom field 2
     * @description
     *      This API allows administrators to Create a directory entry.  </BR>
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
     *      This API allows administrators  to delete all the entries in the directory of a company they administrate.</BR>
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
     *      This API allows administrators  to delete an entry from the directory of a company they administrate.</BR>
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
     * @param {string} format Allows to retrieve more or less entry details in response. </BR>
     * - small: id, firstName, lastName  </BR>
     * - medium: id, companyId, firstName, lastName, workPhoneNumbers  </BR>
     * - full: all fields. </BR>
     * default : small </BR>
     * Valid values : small, medium, full </BR>
     * @description
     *      This API allows administrators to get an entry of the directory of a company they administrate.</BR>
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
     * @param {string} name Allows to filter the list of directory entries of user type on the name provided in this option. </BR>
     * - keywords exact match (ex: 'John Doe' find 'John Doe')
     * - keywords partial match (ex: 'Jo Do' find 'John Doe')
     * - case insensitive (ex: 'john doe' find 'John Doe')
     * - accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
     * - on only firstname or lastname (ex: 'john' find 'John Doe')
     * - order firstname / lastname does not matter (eg: 'doe john' find 'John Doe')
     * @param {string} search Allows to filter the list of directory entries by the words provided in this option. </BR>
     * - The query parameter type allows to specify on which type of directory entries the search is performed ('user' (default), 'company', or all entries) - Multi criterion search is only available to users having feature SEARCH_BY_TAGS in their profiles - keywords exact match (ex: 'John Doe' find 'John Doe')
     * - keywords partial match (ex: 'Jo Do' find 'John Doe')
     * - case insensitive (ex: 'john doe' find 'John Doe')
     * - accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
     * - multi criterion: fields firstName, lastName, jobTitle,companyName, department and tags.
     * - order firstname / lastname does not matter (eg: 'doe john' find 'John Doe')
     * @param {string} type Allows to specify on which type of directory entries the multi-criterion search is performed ('user' (default), 'company', or all entries)</BR>
     * This parameter is only used if the query parameter search is also specified, otherwise it is ignored. Default value : user. Possible values : user, company
     * @param {string} companyName Allows to filter the list of directory entries of company type on the name provided in this option. </BR>
     * - keywords exact match (ex: 'John Doe' find 'John Doe')
     * - keywords partial match (ex: 'Jo Do' find 'John Doe')
     * - case insensitive (ex: 'john doe' find 'John Doe')
     * - accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
     * - on only companyName (ex: 'john' find 'John Doe')
     * @param {string} phoneNumbers Allows to filter the list of directory entries on the number provided in this option. (users and companies type) </BR>
     *     Note the numbers must be in E164 format separated by a space and the character "+" replaced by "%2B". ex. "phoneNumbers=%2B33390676790 %2B33611223344"
     * @param {Date} fromUpdateDate Allows to filter the list of directory entries from provided date (ISO 8601 format eg: '2019-04-11 16:06:47').
     * @param {Date} toUpdateDate Allows to filter the list of directory entries until provided date (ISO 8601 format).
     * @param {string} tags Allows to filter the list of directory entries on the tag(s) provided in this option. </BR>
     *     Only usable by users with admin rights, so that he can list the directory entries to which a given tag is assigned (useful for tag administration). </BR>
     *     Using this parameter, the tags are matched with strict equality (i.e. it is case sensitive and the whole tag must be provided).
     * @param {string} format Allows to retrieve more or less entry details in response. </BR>
     * - small: id, firstName, lastName  </BR>
     * - medium: id, companyId, firstName, lastName, workPhoneNumbers  </BR>
     * - full: all fields. </BR>
     * default : small </BR>
     * Valid values : small, medium, full </BR>
     * @param {number} limit Allow to specify the number of phone book entries to retrieve. Default value : 100
     * @param {number} offset Allow to specify the position of first phone book entry to retrieve (first one if not specified) Warning: if offset > total, no results are returned.
     * @param {string} sortField Sort directory list based on the given field. Default value : lastName
     * @param {number} sortOrder Specify order when sorting phone book list. Default value : 1. Possible values : -1, 1
     * @param {string} view Precises ios the user would like to consult either his personal directory, his company directory or the both. Default value : all. Possible values : personal, company, all
     * @description
     *   This API allows users to get an entry of the directory of a company they administrate.</BR>
     *   superadmin and support can get a directory entry of all companies.</BR>
     *   bp_admin can only get a directory entry of their own companies or their End Customer companies.</BR>
     *   organization_admin can only get a directory entry of the companies under their organization.</BR>
     *   other users can only get a directory entry of their onw companies (and companies visible in their organisation if any). users can get the entries of their own directory too.</BR>
     *   </BR>
     *   name, phoneNumbers, search and tags parameters are exclusives.
     * @return {Promise<any>}
     * </BR>
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object\[\] | Data objects |
     * | id  | string | Directory entry identifier |
     * | companyId optionnel | string | Id of the company |
     * | userId optionnel | string | Id of the user |
     * | type | string | Type of the directory entry</BR>* `user` if firstName and/or lastName are filled,</BR>* `company` if only companyName is filled (firstName and lastName empty)</BR>Possible values : `user`, `company` |
     * | firstName optionnel | string | Contact First name |
     * | lastName optionnel | string | Contact Last name |
     * | companyName optionnel | string | Company Name of the contact |
     * | department optionnel | string | Contact address: Department |
     * | street optionnel | string | Contact address: Street |
     * | city optionnel | string | Contact address: City |
     * | state optionnel | string | When country is 'USA' or 'CAN', a state should be defined. Else it is not managed. Allowed values: "AK", "AL", "....", "NY", "WY" |
     * | postalCode optionnel | string | Contact address: postal code / ZIP |
     * | country optionnel | string | Contact address: country (ISO 3166-1 alpha3 format) |
     * | workPhoneNumbers optionnel | string\[\] | Work phone numbers (E164 format) |
     * | mobilePhoneNumbers optionnel | string\[\] | Mobile phone numbers (E164 format) |
     * | otherPhoneNumbers optionnel | string\[\] | other phone numbers (E164 format) |
     * | jobTitle optionnel | string | Contact Job title |
     * | eMail optionnel | string | Contact Email address |
     * | tags optionnel | string\[\] | An Array of free tags |
     * | custom1 optionnel | string | Custom field 1 |
     * | custom2 optionnel | string | Custom field 2 |
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
     * @param {Array<string>} tags An Array of free tags </BR>
     * A maximum of 5 tags is allowed, each tag can have a maximum length of 64 characters. </BR>
     * The tags can be used to search the directory entries of type user or company using multi-criterion search (search query parameter of the API GET /api/rainbow/directory/v1.0/entries). The multi-criterion search using the tags can only be done on directories belonging to the company of the logged in user (and to the companies belonging to the organisation of the logged in user if that is the case).
     * @param {string} custom1 Custom field 1
     * @param {string} custom2 Custom field 2
     * @description
     *      This API allows administrators to update an entry of the directory of a company they administrate.</BR>
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
     * @param {string} companyId The company id of the directory to export.</BR>
     * @param {string} filePath The folder where the directory will be exported.
     * @description
     *      This API allows administrators to export the directory in a CSV file.</BR>
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
     * @param {string} companyId The company id of the directory to export.</BR>
     * @param {string} fileFullPath The full file path to import.
     * @param {string} label The label used for the import.
     * @description
     *      This API allows administrators to import the directory from a CSV file.</BR>
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
     * @param {string} companyId Allows to list the tags for the directory entries of the companyIds provided in this option. </BR>
     * If companyId is not provided, the tags are listed for all the directory entries of the companies managed by the logged in administrator.
     * @description
     *      This API allows administrators to list all the tags being assigned to the directory entries of the companies managed by the administrator.</BR>
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
     * @param {string} companyId Allows to list the tags for the directory entries of the companyIds provided in this option. </BR>
     * If companyId is not provided, the tags are listed for all the directory entries of the companies managed by the logged in administrator.</BR>
     * @param {string} tag tag to remove. 
     * @description
     *      This API allows administrators to remove a tag being assigned to some directory entries of the companies managed by the administrator.</BR>
     *      The parameter companyId can be used to limit the removal of the tag on the directory entries of the specified company(ies).</BR>
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
     * @param {string} companyId Allows to rename a tag for the directory entries of the companyIds provided in this option.</BR>
     * If companyId is not provided, the tag is renamed from all the directory entries of all the companies managed by the logged in administrator.</BR>
     * @param {string} tag tag to rename.
     * @param {string} newTagName New tag name.
     * @description
     *      This API allows administrators to rename a tag being assigned to some directory entries of the companies managed by the administrator.</BR>
     *      The parameter companyId can be used to limit the renaming of the tag on the directory entries of the specified company(ies).</BR>
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
     * @param {string} companyId Allows to compute the tags statistics for the directory entries of the companyIds provided in this option.</BR>
     * @description
     *      This API can be used to list all the tags being assigned to the directory entries of the companies managed by the administrator, with the number of directory entries for each tags.</BR>
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
     *      This API can be used to define the minimal required version for a given client application.</BR>
     *      When a minimal required version is defined for a client application, if a user using an older version of this application tries to login to Rainbow, the login is forbidden with a specific error code (403020). </BR>
     *      In that case, the client application can show an error message to the user requesting him to update his application.</BR>
     *      To be noted that the application must provide the header x-rainbow-client-version with its current version so that this check can be performed.</BR>
     *      Users with superadmin role can define the minimal required version for any client applications.</BR>
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
     *      This API can be used to delete the minimal required version defined for a given client application.</BR>
     *      When no minimal required version is defined for a client application, this application will allow to log users in Rainbow whatever their version.</BR>
     *      Users with superadmin role can delete the minimal required version for any client applications.</BR>
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
     *     This API can be used to get the minimal required version defined for a given client application (if any, otherwise a 404 http error is returned).</BR>
     *     Users with superadmin role can retrieve the minimal required version for all client applications.</BR>
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
     *      This API can be used to get the minimal required versions defined for the client applications.</BR>
     *      Users with superadmin role can retrieve the minimal required version for all client applications.</BR>
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
     *     This API can be used to get the minimal required version defined for a given client application (if any, otherwise a 404 http error is returned).</BR>
     *     Users with superadmin role can retrieve the minimal required version for all client applications.</BR>
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


    //region Country

    /**
     * @public
     * @method getListOfCountries
     * @since 2.21.0
     * @instance
     * @async
     * @category Country
     * @description
     *     This API allows to retrieve the list of countries supported by Rainbow Server.</BR>
     *     For some countries (CAN and USA), a state can be configured. The list of supported states for these countries is returned in the states field.
     * @return {Promise<any>} - result
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | isoAlpha3Code | String | Country ISO 3166-1 alpha-2 code |
     * | isoAlpha2Code | String | Country ISO 3166-1 alpha-3 code |
     * | fullname | String | Country full name |
     * | states optionnel | Object\[\] | List of states handled for this country.<br><br>Only available for countries `CAN`and `USA`. |
     * | isoAlpha2Code | String | State ISO 3166-1 alpha-2 code |
     * | fullname | String | State full name |
     * 
     */
    getListOfCountries() {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getListOfCountries().then((result) => {
                    that._logger.log("debug", LOG_ID + "(getListOfCountries) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getListOfCountries) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getListOfCountries) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(getListOfCountries) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(getListOfCountries) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }
    
    // endregion Country

    //region multifactor rainbow authentication

    /**
     * @public
     * @method deleteTrustedApplication
     * @since 2.22.4
     * @instance
     * @async
     * @category Multifactor Rainbow Authentication
     * @description
     *     This API allows Rainbow users to delete a trusted application. </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | status | String | trusted app delete status message. |
     *
     */
    deleteTrustedApplication (appId : string ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.deleteTrustedApplication(appId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(deleteTrustedApplication) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(deleteTrustedApplication) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteTrustedApplication) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(deleteTrustedApplication) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(deleteTrustedApplication) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteAllTrustedApplications
     * @since 2.22.4
     * @instance
     * @async
     * @category Multifactor Rainbow Authentication
     * @description
     *     This API allows Rainbow users to delete all trusted applications. </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | status | String | Trusted applications delete status message. |
     *
     */
    deleteAllTrustedApplications () {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.deleteAllTrustedApplications().then((result) => {
                    that._logger.log("debug", LOG_ID + "(deleteAllTrustedApplications) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(deleteAllTrustedApplications) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteAllTrustedApplications) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(deleteAllTrustedApplications) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(deleteAllTrustedApplications) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method disableMultifactorAuthentication
     * @since 2.22.4
     * @instance
     * @async
     * @category Multifactor Rainbow Authentication
     * @description
     *     This API allows Rainbow users to disable multifactor authentication. </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | status | String | status message. |
     *
     */
    disableMultifactorAuthentication () {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.disableMultifactorAuthentication().then((result) => {
                    that._logger.log("debug", LOG_ID + "(disableMultifactorAuthentication) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(disableMultifactorAuthentication) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(disableMultifactorAuthentication) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(disableMultifactorAuthentication) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(disableMultifactorAuthentication) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method enableMultifactorAuthentication
     * @since 2.22.4
     * @instance
     * @async
     * @category Multifactor Rainbow Authentication
     * @description
     *     This API allows Rainbow users to enable Multifactor Authentication in order to finalize activation process. </BR>
     * @return {Promise<any>} - result
     *
     */
    enableMultifactorAuthentication () {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.enableMultifactorAuthentication().then((result) => {
                    that._logger.log("debug", LOG_ID + "(enableMultifactorAuthentication) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(enableMultifactorAuthentication) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(enableMultifactorAuthentication) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(enableMultifactorAuthentication) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(enableMultifactorAuthentication) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getMultifactorInformation
     * @since 2.22.4
     * @instance
     * @async
     * @category Multifactor Rainbow Authentication
     * @description
     *     This API allows Rainbow users to retrive multifactor information in order to start activation process. </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | mfaType | String | type of multifactor |
     * | mfaSecret | String | secret of TOTP multifactor |
     * | otpAuthUrl | String | OTP auth url computed from secret (see https://github.com/google/google-authenticator/wiki/Key-Uri-Format) |
     * | qrcode | String | QR code generated from OTP Url |
     *
     */
    getMultifactorInformation () {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getMultifactorInformation().then((result) => {
                    that._logger.log("debug", LOG_ID + "(getMultifactorInformation) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getMultifactorInformation) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getMultifactorInformation) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(getMultifactorInformation) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(getMultifactorInformation) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method verifyMultifactorInformation
     * @since 2.22.4
     * @instance
     * @async
     * @category Multifactor Rainbow Authentication
     * @param {string} token 6-digits TOTP code
     * @description
     *     This API allows Rainbow users to verify that rainbow multifcator authentication is operational. </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | mfaType | String | type of multifactor |
     * | mfaRecoveryCode | String | recovery code used as default multifactor authentication |
     *
     */
    verifyMultifactorInformation (token : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.verifyMultifactorInformation(token).then((result) => {
                    that._logger.log("debug", LOG_ID + "(verifyMultifactorInformation) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(verifyMultifactorInformation) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(verifyMultifactorInformation) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(verifyMultifactorInformation) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(verifyMultifactorInformation) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method resetRecoveryCodeForMultifactorAuthentication
     * @since 2.22.4
     * @instance
     * @async
     * @category Multifactor Rainbow Authentication
     * @description
     *     This API allows Rainbow users to reset recovery code for multifactor authentication. </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | status | String | status message |
     * | mfaRecoveryCode | String | new recovery code |
     *
     */
    resetRecoveryCodeForMultifactorAuthentication () {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.resetRecoveryCodeForMultifactorAuthentication().then((result) => {
                    that._logger.log("debug", LOG_ID + "(resetRecoveryCodeForMultifactorAuthentication) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(resetRecoveryCodeForMultifactorAuthentication) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(resetRecoveryCodeForMultifactorAuthentication) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(resetRecoveryCodeForMultifactorAuthentication) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(resetRecoveryCodeForMultifactorAuthentication) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    //endregion multifactor rainbow authentication

    //region Customer Care

    //region Customer Care - Administrators Group

    /**
     * @public
     * @method getCustomerCareAdministratorsGroup
     * @since 2.24.0
     * @instance
     * @async
     * @category Customer Care - Administrators Group
     * @description
     *     This API allows get the list of administrators allowed to consult the list of issues, create and consolidate tickets. </BR>
     * @return {Promise<any>} - result
     *
     * Result sample : </br> 
     * { </br>
     * [ { </br>
     * "userId": "57347ea14a0327064fcb93fd", </br>
     * "loginEmail": "alice.beneth@al-enterprise.com" </br>
     * }, </br>
     * { </br>
     * "userId": "57347ea14a0327064fcb93fd", </br>
     * "loginEmail": "bob.smith@al-enterprise.com" </br>
     * } ] </br>
     * }  </br>
     */
    getCustomerCareAdministratorsGroup() {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getCustomerCareAdministratorsGroup().then((result) => {
                    that._logger.log("debug", LOG_ID + "(getCustomerCareAdministratorsGroup) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getCustomerCareAdministratorsGroup) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getCustomerCareAdministratorsGroup) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(getCustomerCareAdministratorsGroup) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(getCustomerCareAdministratorsGroup) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method addAdministratorToGroup
     * @since 2.24.0
     * @instance
     * @async
     * @param {string} userId Superadmin or Support unique identifier. Default value is the connected user.
     * @category Customer Care - Administrators Group
     * @description
     *     This API allows Add one administrators allowed to consult the list of issues, create and consolidate tickets. </BR>
     * @return {Promise<any>} - result
     *
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | userId | String | User unique identifier |
     * | loginEmail | String | User email address (used for login) |
     * 
     */
    addAdministratorToGroup(userId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.addAdministratorToGroup(userId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(addAdministratorToGroup) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(addAdministratorToGroup) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(addAdministratorToGroup) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(addAdministratorToGroup) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(addAdministratorToGroup) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method removeAdministratorFromGroup
     * @since 2.24.0
     * @instance
     * @async
     * @param {string} userId Superadmin or Support unique identifier
     * @category Customer Care - Administrators Group
     * @description
     *     This API allows to remove one administrator from the group. </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | status | String | Delete operation status message. |
     *
     */
    removeAdministratorFromGroup(userId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.removeAdministratorFromGroup(userId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(removeAdministratorFromGroup) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(removeAdministratorFromGroup) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(removeAdministratorFromGroup) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(removeAdministratorFromGroup) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(removeAdministratorFromGroup) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    //endregion Customer Care - Administrators Group

    //region Customer Care - Logs

    /**
     * @public
     * @method getIssue
     * @since 2.24.0
     * @instance
     * @async
     * @param {string} logId Logs context unique identifier
     * @category Customer Care - Logs
     * @description
     *     This API allows to retrieve a given issue. </BR>
     *     The logged in user must have administration rights on the company to which belong the user who created the issue. </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Logs context unique identifier. |
     * | type | String | Initial scenario<br><br>* `feedback`: The customer submits an issue<br>* `ask`: A bot or an admin has contacted a customer to complete an issue |
     * | permission | String | User has currently accepted to provide his logs. Default value ('declined' when type is `ask`, `granted` when type is 'feedback'<br><br>* `declined`<br>* `granted`<br><br>Default value: `declined` when type is `ask`, `granted` when type is `feedback` |
     * | userId | String | Unique identifier of the customer (user or Rainbow Tv) |
     * | userDisplayName | String | Display name of the customer (user or Rainbow Tv) |
     * | companyId | String | Unique identifier of the userId 's Company |
     * | companyName | String | Name of the userId 's Company |
     * | originatorId | String | When type is `ask`, an admin or a bot userId. |
     * | problemNumber | Number | Ticket number (integer incremented per company) |
     * | creationDate | Date-Time | Logs context creation date |
     * | occurrenceDate | Date-Time | Date when the issue occurred |
     * | occurrenceDateTimezone | String | Timezone name when the issue occurred.<br><br>Allowed values: one of the timezone names defined in [IANA tz database](https://www.iana.org/time-zones).  <br>Timezone name are composed as follow: `Area/Location` (ex: Europe/Paris, America/New_York,...) |
     * | description | String | Issue description |
     * | resourceId | String | When type is `ask`, this is the resource of the device from which we need to get logs (in case of multi-devices configuration) |
     * | externalRef | String | Free field |
     * | device | String | Device type<br><br>Note: `room` corresponds to Rainbow Room<br><br>Possibles values : `android`, `desktop`, `ios`, `room`, `web` |
     * | version | String | Device version |
     * | deviceDetails optionnel | Object | When relevant, optional details regarding the device on which the issue occurred |
     * | hardware optionnel | Object | When relevant, details regarding the hardware of the device on which the issue occurred |
     * | manufacturer optionnel | String | When relevant, manufacturer of the device on which the issue occurred<br> |
     * | model optionnel | String | When relevant, model of the device on which the issue occurred<br> |
     * | os optionnel | Object | When relevant, details regarding the Operating System on which the issue occurred |
     * | name optionnel | String | When relevant, name of the Operating System on which the issue occurred<br> |
     * | version optionnel | String | When relevant, version of the Operating System on which the issue occurred<br> |
     * | browser optionnel | Object | When relevant, details regarding the browser on which the issue occurred |
     * | attachments | String\[\] | An Array of file descriptor Id<br><br>* To belong as logs context attachment, a file descriptor must contain the field tags.purpose with the value `log` |
     * | name optionnel | String | When relevant, name of the browser on which the issue occurred<br> |
     * | version optionnel | String | When relevant, name of the browser on which the issue occurred<br> |
     *
     */
    getIssue(logId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getIssue(logId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getIssue) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getIssue) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getIssue) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(getIssue) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(getIssue) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getListOfIssues
     * @since 2.24.0
     * @instance
     * @async
     * @category Customer Care - Logs
     * @param {number} limit Allow to specify the number of issues to retrieve. Default value : 100
     * @param {number} offset Allow to specify the position of first issue to retrieve (first issue if not specified). Warning: if offset > total, no results are returned. Default value : 0
     * @param {String} sortField Sort issues list based on the given field. Default value : creationDate. Possibles values : creationDate.
     * @param {number} sortOrder Specify sort order when sorting issues list. Default value : -1. Possibles values : -1, 1.
     * @param {String} companyId Allows to filter issues list on the companyId(s) provided in this option. companyId parameter is optional: if companyId is not provided, all the issues created by users belonging to companies that the administrator manage are returned. If provided, the logged in user must have administration rights on the requested companyId(s).
     * @param {String} bpId Allows to filter issues list on all the companyId(s) being linked to the BP company provided in this option. </br>
     * For the case of BP companies with bpType= VAD, the query parameter customerCategory allows to specify the kind of companies for which the issues are requested (see more details in the doc of customerCategory parameter). </br>
     * The list of returned issues depends on the bpType of the BP company selected by the parameter bpId and on the requested customerCategory: </br>
     * * if bpId corresponds to a BP company with bpType=VAD, the API will return: </br>
     *   * if customerCategory=all: </br>
     *      * issues submitted by users belonging to any of the BP companies with bpType=IR linked to this BP VAD company (BP VAD --> BP IR), </br>
     *      * issues submitted by users belonging to any of the EC companies linked to any of the BP companies with bpType=IR linked to this BP VAD company (BP VAD --> BP IR --> EC), </br>
     *      *issues submitted by users belonging to any of the EC companies directly linked to this BP VAD company (BP VAD --> EC). </br>
     *   * if customerCategory=ecs_only: </br>
     *      * issues submitted by users belonging to any of the EC companies directly linked to this BP VAD company (BP VAD --> EC). </br>
     *   * if customerCategory=irs_only: </br>
     *      * issues submitted by users belonging to any of the BP companies with bpType=IR linked to this BP VAD company (BP VAD --> BP IR). </br>
     *   * if customerCategory=ecs_of_irs_only: </br>
     *      * issues submitted by users belonging to any of the EC companies linked to any of the BP companies with bpType=IR linked to this BP VAD company (BP VAD --> BP IR --> EC). </br>
     *   * if customerCategory=irs_with_ecs_of_irs_only: </br>
     *      * issues submitted by users belonging to any of the BP companies with bpType=IR linked to this BP VAD company (BP VAD --> BP IR), </br>
     *      * issues submitted by users belonging to any of the EC companies linked to any of the BP companies with bpType=IR linked to this BP VAD company (BP VAD --> BP IR --> EC). </br> 
     * * if bpId corresponds to a BP company with type=IR (customerCategory shouldn't be used), the API will return: </br>
     *   * issues submitted by users belonging to any of the EC companies linked to this BP IR company (BP IR --> EC).  </br>
     * * if bpId corresponds to a BP company with type=DR (customerCategory shouldn't be used), the API will return: </br>
     *   * issues submitted by users belonging to any of the EC companies linked to this BP DR company (BP DR --> EC).  </br>
     * * if bpId corresponds to a BP company with bpType=VAD, the API will return: </br>
     *   * issues submitted by users belonging to any of the BP companies with bpType=IR linked to this BP VAD company (BP VAD --> BP IR), </br>
     *   * issues submitted by users belonging to any of the EC companies linked to any of the BP companies with bpType=IR linked to this BP VAD company (BP VAD --> BP IR --> EC), </br>
     *   * issues submitted by users belonging to any of the EC companies directly linked to this BP VAD company (BP VAD --> EC).  </br>
     * * if bpId corresponds to a BP company with bpType=IR, the API will return: </br>
     *   * issues submitted by users belonging to any of the EC companies linked to this BP IR company (BP IR --> EC). </br> 
     * * if bpId corresponds to a BP company with bpType=DR, the API will return: </br>
     *   * issues submitted by users belonging to any of the EC companies linked to this BP IR company (BP DR --> EC). </br>
     *    </br>
     * Only one BP's companyId can be provided in this filter. </br>
     * If the companyIs set in the field bpId does not correspond to a BP company, no issues will match. </br>
     * The filter companyId can be used additionally, for example to request the issues submitted by users belonging to the BP company as well. </br> 
     * The user must have superadmin, support or bp_admin role to use this filter (not taken into account otherwise). </br> 
     * If provided, the logged in user must have administration rights on the requested BP company. </br>
     * @param {string} customerCategory Allows to specify the kind of companies associated to the requested bpId filter for which the list of issues is requested. </br>
     * This query parameter is especially designed for the case of BP with bpType=VAD (to provide the flexibility on the list of issues returned depending on the client's needs). If the BP set in bpId don't have bpType=VAD, some values of customerCategory won't return any results (irs_only, ecs_of_irs_only and irs_with_ecs_of_irs_only should not be used if bpId correspond to a DR or an IR). </br>
     * This query parameter is only taken into account if the bpId query parameter is also provided (not taken into account otherwise). </br>
     * The logs will be returned depending on the bpType of the BP company selected by the parameter bpId and on the requested customerCategory: </br>
     * * if bpId corresponds to a BP company with bpType=VAD, the API will return: </br>
     *   * if customerCategory=all: </br>
     *      * issues submitted by users belonging to any of the BP companies with bpType=IR linked to this BP VAD company (BP VAD --> BP IR), </br>
     *      * issues submitted by users belonging to any of the EC companies linked to any of the BP companies with bpType=IR linked to this BP VAD company (BP VAD --> BP IR --> EC), </br>
     *      * issues submitted by users belonging to any of the EC companies directly linked to this BP VAD company (BP VAD --> EC). </br>
     *   * if customerCategory=ecs_only: </br>
     *      * issues submitted by users belonging to any of the EC companies directly linked to this BP VAD company (BP VAD --> EC). </br>
     *   * if customerCategory=irs_only: </br>
     *      * issues submitted by users belonging to any of the BP companies with bpType=IR linked to this BP VAD company (BP VAD --> BP IR). </br>
     *   * if customerCategory=ecs_of_irs_only: </br>
     *      * issues submitted by users belonging to any of the EC companies linked to any of the BP companies with bpType=IR linked to this BP VAD company (BP VAD --> BP IR --> EC). </br>
     *   * if customerCategory=irs_with_ecs_of_irs_only: </br>
     *      * issues submitted by users belonging to any of the BP companies with bpType=IR linked to this BP VAD company (BP VAD --> BP IR), </br>
     *      * issues submitted by users belonging to any of the EC companies linked to any of the BP companies with bpType=IR linked to this BP VAD company (BP VAD --> BP IR --> EC). </br>
     * * if bpId corresponds to a BP company with type=IR, the API will return: </br>
     *   * if customerCategory=all: </br>
     *      * issues submitted by users belonging to any of the EC companies linked to this BP IR company (BP IR --> EC). </br>
     *   * if customerCategory=ecs_only: </br>
     *      * issues submitted by users belonging to any of the EC companies linked to this BP IR company (BP IR --> EC). </br>
     *   * if customerCategory=irs_only: </br>
     *      * no results (a BP company with type=IR can't be linked to another BP company with type=IR). </br>
     *   * if customerCategory=ecs_of_irs_only: </br>
     *      * no results (a BP company with type=IR can't be linked to another BP company with type=IR). </br>
     *   * if customerCategory=irs_with_ecs_of_irs_only: </br>
     *      * no results (a BP company with type=IR can't be linked to another BP company with type=IR). </br>
     * * if bpId corresponds to a BP company with type=DR, the API will return: </br>
     *   * if customerCategory=all: </br>
     *      * issues submitted by users belonging to any of the EC companies linked to this BP DR company (BP DR --> EC). </br>
     *   * if customerCategory=ecs_only: </br>
     *      * issues submitted by users belonging to any of the EC companies linked to this BP DR company (BP DR --> EC). </br>
     *   * if customerCategory=irs_only: </br>
     *      * no results (a BP company with type=IR can't be linked to a BP company with type=DR). </br>
     *   * if customerCategory=ecs_of_irs_only: </br>
     *      * no results (a BP company with type=IR can't be linked to a BP company with type=DR). </br>
     *   * if customerCategory=irs_with_ecs_of_irs_only: </br>
     *      * no results (a BP company with type=IR can't be linked to a BP company with type=DR). </br>
     * </br>
     * Default value : all. Possibles values : all, ecs_only, irs_only, ecs_of_irs_only, irs_with_ecs_of_irs_only </br>
     * @param {string} name Allows to filter issues on the name provided in this option (filter on associated user's displayName and company's name). </br>
     * The filtering is case insensitive and on partial name match: all issues having the user's displayName or the company's name containing the provided name value will be returned (whatever the position of the match). </br>
     * Ex: if filtering is done on Phil, issues created by users or companies match the filter: 'Philip Smith' (user displayName), 'John Philip' (user displayName), 'Philip Morris' (company name), 'This company name is Philips' (company name), ... </br>
     * @param {string} version Allows to filter issues list on the version(s) provided in this option. </br>
     * The filtering is case insensitive and on partial version match. Ex: if filtering is done on 1.112, all issues with the version starting by 1.112 match the filter: '1.112' (exact match), '1.112.2', '1.112.3', '1.1121', ... </br>
     * @param {string} device Allows to filter issues list on the device(s) provided in this option. </br> 
     * Note: room corresponds to Rainbow Room </br>
     * Default value : android,desktop,ios,room,web
     * @param {string} fromCreationDate List issues which have been created after the given date (uses creationDate field).
     * @param {string} toCreationDate List issues which have been created before the given date (uses creationDate field).
     * @param {string} fromOccurrenceDate List issues which occurred after the given date (uses occurrenceDate field).
     * @param {string} toOccurrenceDate List issues which occurred before the given date (uses occurrenceDate field).
     * @param {string} format Allows to retrieve more or less logs context details in response. </br>
     * * small: id userId companyId device description </br>
     * * medium: id userId companyId device version description creationDate </br>
     * * full: All fields </br>
     * </br>
     * Default value : small. Possibles values : small, medium, full </br>
     * @description
     *     This API allows to retrieve the list of issues. </BR>
     *     The list of issues (logs contexts) that a user can retrieve depends on its roles: </BR>
     *     * Users with `superadmin` or `support` role can retrieve all the issues. </br>
     *     * Users with `bp_admin` role can retrieve all the issues created by users belonging to their EC companies and to their company. </br>
     *     * In the case of BP with type VAD, they can retrieve all the issues created by users belonging to all the EC companies linked directly to the BP VAD and all the EC companies linked to their BP IR companies. </br>
     *     * Users with `admin` role retrieve the issues created by users belonging to the companies they can manage: </br>
     *      * an `organization_admin` gets all the issues created by users belonging to all the companies he manages (i.e. companies having organisationId equal to his organisationId) </br>
     *      * a `company_admin` gets all the issues created by users belonging to his company </br>
     *       </BR>
     *      This API provides some query parameters allowing to filter the list of issues depending on the needs: </BR>
     *      * `companyId` filter allows to retrieve only the issues created by users of a given company </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Logs context unique identifier. |
     * | type | String | Initial scenario<br><br>* `feedback`: The customer submits an issue<br>* `ask`: A bot or an admin has contacted a customer to complete an issue |
     * | permission | String | User has currently accepted to provide his logs. Default value ('declined' when type is `ask`, `granted` when type is 'feedback'<br><br>* `declined`<br>* `granted`<br><br>Default value: `declined` when type is `ask`, `granted` when type is `feedback` |
     * | userId | String | Unique identifier of the customer (user or Rainbow Tv) |
     * | userDisplayName | String | Display name of the customer (user or Rainbow Tv) |
     * | companyId | String | Unique identifier of the userId 's Company |
     * | companyName | String | Name of the userId 's Company |
     * | originatorId | String | When type is `ask`, an admin or a bot userId. |
     * | problemNumber | Number | Ticket number (integer incremented per company) |
     * | creationDate | Date-Time | Logs context creation date |
     * | occurrenceDate | Date-Time | Date when the issue occurred |
     * | occurrenceDateTimezone | String | Timezone name when the issue occurred.<br><br>Allowed values: one of the timezone names defined in [IANA tz database](https://www.iana.org/time-zones).  <br>Timezone name are composed as follow: `Area/Location` (ex: Europe/Paris, America/New_York,...) |
     * | description | String | Issue description |
     * | resourceId | String | When type is `ask`, this is the resource of the device from which we need to get logs (in case of multi-devices configuration) |
     * | externalRef | String | Free field |
     * | device | String | Device type<br><br>Note: `room` corresponds to Rainbow Room<br><br>Possibles values : `android`, `desktop`, `ios`, `room`, `web` |
     * | version | String | Device version |
     * | deviceDetails optionnel | Object | When relevant, optional details regarding the device on which the issue occurred |
     * | hardware optionnel | Object | When relevant, details regarding the hardware of the device on which the issue occurred |
     * | manufacturer optionnel | String | When relevant, manufacturer of the device on which the issue occurred<br> |
     * | model optionnel | String | When relevant, model of the device on which the issue occurred<br> |
     * | os optionnel | Object | When relevant, details regarding the Operating System on which the issue occurred |
     * | name optionnel | String | When relevant, name of the Operating System on which the issue occurred<br> |
     * | version optionnel | String | When relevant, version of the Operating System on which the issue occurred<br> |
     * | browser optionnel | Object | When relevant, details regarding the browser on which the issue occurred |
     * | attachments | String\[\] | An Array of file descriptor Id<br><br>* To belong as logs context attachment, a file descriptor must contain the field tags.purpose with the value `log` |
     * | name optionnel | String | When relevant, name of the browser on which the issue occurred<br> |
     * | version optionnel | String | When relevant, name of the browser on which the issue occurred<br> |
     * 
     */
    getListOfIssues(limit : number = 100, offset : number = 0, sortField : string = "creationDate",
                    sortOrder : number = -1, companyId : string, bpId : string, customerCategory : string = "all", name : string,
                    version : string, device : string, fromCreationDate : string, toCreationDate : string,
                    fromOccurrenceDate : string, toOccurrenceDate : string, format : string = "small") {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getListOfIssues(limit, offset, sortField, sortOrder, companyId, bpId, customerCategory, name,
                        version, device, fromCreationDate, toCreationDate, fromOccurrenceDate, toOccurrenceDate, format).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getListOfIssues) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getListOfIssues) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getListOfIssues) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(getListOfIssues) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(getListOfIssues) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }


    //endregion Customer Care - Logs

    //region Customer Care - Users Logs

    /**
     * @public
     * @method getListOfIssuesForUser
     * @since 2.24.0
     * @instance
     * @async
     * @param {string} userId User or Rainbow room unique identifier. Default value is the connected user.
     * @param {string} format Allows to retrieve more or less logs context details in response. </br>
     * * small: id userId companyId device description </br>
     * * medium: id userId companyId device version description creationDate </br>
     * * full: All fields </br>
     * Default value : small. Possibles values : small, medium, full
     * @category Customer Care - Users Logs
     * @description
     *     This API allows to consult the list of issues associated to a user or a Rainbow Room. </BR>
     *     So that, as administrator (BP, Organisation, Company), support, superadmin, it is then possible to start issue resolution process with Rainbow Customer Care team. </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Logs context unique identifier. |
     * | type | String | Initial scenario<br><br>* `feedback`: The customer submits an issue<br>* `ask`: A bot or an admin has contacted a customer to complete an issue |
     * | permission | String | User has currently accepted to provide his logs. Default value ('declined' when type is `ask`, `granted` when type is 'feedback'<br><br>* `declined`<br>* `granted`<br><br>Default value: `declined` when type is `ask`, `granted` when type is `feedback` |
     * | userId | String | Unique identifier of the customer (user or Rainbow Tv) |
     * | userDisplayName | String | Display name of the customer (user or Rainbow Tv) |
     * | companyId | String | Unique identifier of the userId 's Company |
     * | companyName | String | Name of the userId 's Company |
     * | originatorId | String | When type is `ask`, an admin or a bot userId. |
     * | problemNumber | Number | Ticket number (integer incremented per company) |
     * | creationDate | Date-Time | Logs context creation date |
     * | occurrenceDate | Date-Time | Date when the issue occurred |
     * | occurrenceDateTimezone | String | Timezone name when the issue occurred.<br><br>Allowed values: one of the timezone names defined in [IANA tz database](https://www.iana.org/time-zones).  <br>Timezone name are composed as follow: `Area/Location` (ex: Europe/Paris, America/New_York,...) |
     * | description | String | Issue description |
     * | resourceId | String | When type is `ask`, this is the resource of the device from which we need to get logs (in case of multi-devices configuration) |
     * | externalRef | String | Free field |
     * | device | String | Device type<br><br>Note: `room` corresponds to Rainbow Room<br><br>Possibles values : `android`, `desktop`, `ios`, `room`, `web` |
     * | version | String | Device version |
     * | deviceDetails optionnel | Object | When relevant, optional details regarding the device on which the issue occurred |
     * | hardware optionnel | Object | When relevant, details regarding the hardware of the device on which the issue occurred |
     * | manufacturer optionnel | String | When relevant, manufacturer of the device on which the issue occurred<br> |
     * | model optionnel | String | When relevant, model of the device on which the issue occurred<br> |
     * | os optionnel | Object | When relevant, details regarding the Operating System on which the issue occurred |
     * | name optionnel | String | When relevant, name of the Operating System on which the issue occurred<br> |
     * | version optionnel | String | When relevant, version of the Operating System on which the issue occurred<br> |
     * | browser optionnel | Object | When relevant, details regarding the browser on which the issue occurred |
     * | attachments | String\[\] | An Array of file descriptor Id<br><br>* To belong as logs context attachment, a file descriptor must contain the field tags.purpose with the value `log` |
     * | name optionnel | String | When relevant, name of the browser on which the issue occurred<br> |
     * | version optionnel | String | When relevant, name of the browser on which the issue occurred<br> |
     *
     */
    getListOfIssuesForUser(userId : string, format : string = "small") {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getListOfIssuesForUser(userId, format).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getListOfIssuesForUser) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getListOfIssuesForUser) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getListOfIssuesForUser) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(getListOfIssuesForUser) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(getListOfIssuesForUser) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method getIssueForUser
     * @since 2.24.0
     * @instance
     * @async
     * @param {string} userId User or Rainbow room unique identifier. Default value is the connected user.
     * @param {string} logId Logs context unique identifier
     * @category Customer Care - Users Logs
     * @description
     *     This API allows to consult one issue associated to a user or a Rainbow Room. </BR>
     *     So that, as administrator (BP, Organisation, Company), support, superadmin, it is then possible to start issue resolution process with Rainbow Customer Care team. </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Logs context unique identifier. |
     * | type | String | Initial scenario<br><br>* `feedback`: The customer submits an issue<br>* `ask`: A bot or an admin has contacted a customer to complete an issue |
     * | permission | String | User has currently accepted to provide his logs. Default value ('declined' when type is `ask`, `granted` when type is 'feedback'<br><br>* `declined`<br>* `granted`<br><br>Default value: `declined` when type is `ask`, `granted` when type is `feedback` |
     * | userId | String | Unique identifier of the customer (user or Rainbow Tv) |
     * | userDisplayName | String | Display name of the customer (user or Rainbow Tv) |
     * | companyId | String | Unique identifier of the userId 's Company |
     * | companyName | String | Name of the userId 's Company |
     * | originatorId | String | When type is `ask`, an admin or a bot userId. |
     * | problemNumber | Number | Ticket number (integer incremented per company) |
     * | creationDate | Date-Time | Logs context creation date |
     * | occurrenceDate | Date-Time | Date when the issue occurred |
     * | occurrenceDateTimezone | String | Timezone name when the issue occurred.<br><br>Allowed values: one of the timezone names defined in [IANA tz database](https://www.iana.org/time-zones).  <br>Timezone name are composed as follow: `Area/Location` (ex: Europe/Paris, America/New_York,...) |
     * | description | String | Issue description |
     * | resourceId | String | When type is `ask`, this is the resource of the device from which we need to get logs (in case of multi-devices configuration) |
     * | externalRef | String | Free field |
     * | device | String | Device type<br><br>Note: `room` corresponds to Rainbow Room<br><br>Possibles values : `android`, `desktop`, `ios`, `room`, `web` |
     * | version | String | Device version |
     * | deviceDetails optionnel | Object | When relevant, optional details regarding the device on which the issue occurred |
     * | hardware optionnel | Object | When relevant, details regarding the hardware of the device on which the issue occurred |
     * | manufacturer optionnel | String | When relevant, manufacturer of the device on which the issue occurred<br> |
     * | model optionnel | String | When relevant, model of the device on which the issue occurred<br> |
     * | os optionnel | Object | When relevant, details regarding the Operating System on which the issue occurred |
     * | name optionnel | String | When relevant, name of the Operating System on which the issue occurred<br> |
     * | version optionnel | String | When relevant, version of the Operating System on which the issue occurred<br> |
     * | browser optionnel | Object | When relevant, details regarding the browser on which the issue occurred |
     * | attachments | String\[\] | An Array of file descriptor Id<br><br>* To belong as logs context attachment, a file descriptor must contain the field tags.purpose with the value `log` |
     * | name optionnel | String | When relevant, name of the browser on which the issue occurred<br> |
     * | version optionnel | String | When relevant, name of the browser on which the issue occurred<br> |
     *
     */
    getIssueForUser(userId : string, logId : string ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getIssueForUser(userId, logId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getIssueForUser) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getIssueForUser) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getIssueForUser) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(getIssueForUser) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(getIssueForUser) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method initiateLogsContext
     * @since 2.24.0
     * @instance
     * @async
     * @category Customer Care - Users Logs
     * @param {string} userId User or Rainbow room unique identifier. Default value is the connected user.
     * @param {string}  occurrenceDate  Date when the issue occurred. If not provided, occurrenceDate is set by default to the issue's creation date.
     * @param {string} occurrenceDateTimezone Timezone name when the issue occurred. </BR>
     * Allowed values: one of the timezone names defined in IANA tz database. </BR>
     * Timezone name are composed as follow: Area/Location (ex: Europe/Paris, America/New_York,...) </BR>
     *  </BR>
     * If not provided, occurrenceDateTimezone is set to the user's timezone if available, to "UTC" otherwise. </BR>
     * @param {string} type Initial scenario </BR>
     * * `feedback`: The customer submits an issue. `userId` parameter must be the logged in user Id in this case. </BR>
     * * `ask`: A bot or an admin has contacted a customer to complete an issue </BR>
     * </BR>
     * Possibles values : `feedback`, `ask` </BR>
     * @param {string} description Issue description
     * @param {string} resourceId Mandatory when type is ask, this is the resource of the device from which we need to get logs (in case of multi-devices configuration)
     * @param {string} externalRef Free field
     * @param {string} device Device type </BR>
     * Note: room corresponds to Rainbow Room </BR>
     * Possibles values : android, desktop, ios, room, web </BR>
     * @param {Array<string>} attachments An Array of file descriptor Id. </BR>
     * Forbidden when type is ask </BR>
     * Mandatory with at least one valid fileId when type is feedback When the logs context is created, the logged in user looses his ownership for theses files. </BR>
     * @param {string} version Device version  
     * @param {object} deviceDetails When relevant, optional details regarding the device on which the issue occurred </BR>
     * * hardware optionnel Object When relevant, details regarding the hardware of the device on which the issue occurred </BR>
     * * manufacturer optionnel String When relevant, manufacturer of the device on which the issue occurred </BR>
     * * model optionnel String When relevant, model of the device on which the issue occurred </BR>
     * * os optionnel Object When relevant, details regarding the Operating System on which the issue occurred </BR>
     * * name optionnel String When relevant, name of the Operating System on which the issue occurred </BR>
     * * version optionnel String When relevant, version of the Operating System on which the issue occurred </BR>
     * * browser optionnel Object When relevant, details regarding the browser on which the issue occurred </BR>
     * * name optionnel String When relevant, name of the browser on which the issue occurred </BR>
     * * version optionnel String When relevant, name of the browser on which the issue occurred </BR>
     * @description
     *     This API allows to Initialise a context to submit logs. This logs context may contains all fields necessary to finally build a ticket to submit an issue. </BR>
     * </BR>
     * * userId </BR>
     * * companyId </BR>
     * * device </BR>
     * * version </BR>
     * * occurrenceDate </BR>
     * * occurrenceDateTimezone </BR>
     * * description </BR>
     * * attachments </BR>
     * </BR>
     *  When type is `feedback`, some files **>may**\> be attached but are not mandatory. Inconsistencies may lead to an error (errorDetailsCode: 409003 / Attachments inconsistency) </BR>
     *   </BR>
     * * file doesn't exist </BR>
     * * file not uploaded </BR>
     * * file doesn't belong to the userId </BR>
     * * file is not a log file (the file descriptor must include the field 'tags.purpose' = "logs" or 'tags.purpose' = "client_logs" </BR>
     * </BR>
     *  When type is `ask`, resourceId field is mandatory. So that the customercare portal is able to send a Stanza/Message to the right user's device to get his agreement to receive his logs. </BR>
     *  For the case 'As Admin, ask to manage a user', the administrator must use the `getListOfResourcesForUser` API </BR>
     *  to select the right resource. </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Logs context unique identifier. |
     * | type | String | Initial scenario<br><br>* `feedback`: The customer submits an issue<br>* `ask`: A bot or an admin has contacted a customer to complete an issue |
     * | permission | String | User has currently accepted to provide his logs. Default value ('declined' when type is `ask`, `granted` when type is 'feedback'<br><br>* `declined`<br>* `granted`<br><br>Default value: `declined` when type is `ask`, `granted` when type is `feedback` |
     * | userId | String | Unique identifier of the customer (user or Rainbow Tv) |
     * | userDisplayName | String | Display name of the customer (user or Rainbow Tv) |
     * | companyId | String | Unique identifier of the userId 's Company |
     * | companyName | String | Name of the userId 's Company |
     * | originatorId | String | When type is `ask`, an admin or a bot userId. |
     * | problemNumber | Number | Ticket number (integer incremented per company) |
     * | creationDate | Date-Time | Logs context creation date |
     * | occurrenceDate | Date-Time | Date when the issue occurred |
     * | occurrenceDateTimezone | String | Timezone name when the issue occurred.<br><br>Allowed values: one of the timezone names defined in [IANA tz database](https://www.iana.org/time-zones).  <br>Timezone name are composed as follow: `Area/Location` (ex: Europe/Paris, America/New_York,...) |
     * | description | String | Issue description |
     * | resourceId | String | When type is `ask`, this is the resource of the device from which we need to get logs (in case of multi-devices configuration) |
     * | externalRef | String | Free field |
     * | device | String | Device type<br><br>Note: `room` corresponds to Rainbow Room<br><br>Possibles values : `android`, `desktop`, `ios`, `room`, `web` |
     * | version | String | Device version |
     * | deviceDetails optionnel | Object | When relevant, optional details regarding the device on which the issue occurred |
     * | attachments | String\[\] | An Array of file descriptor Id<br><br>* To belong as logs context attachment, a file descriptor must contain the field tags.purpose with the value `log` |
     *
     */
    initiateLogsContext(userId : string, occurrenceDate : string, occurrenceDateTimezone : string, type : string,
                        description : string, resourceId : string, externalRef : string, device : string, attachments : Array<string>, version : string, deviceDetails : any) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.initiateLogsContext(userId, occurrenceDate, occurrenceDateTimezone, type,
                        description, resourceId, externalRef, device, attachments, version, deviceDetails).then((result) => {
                    that._logger.log("debug", LOG_ID + "(initiateLogsContext) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(initiateLogsContext) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(initiateLogsContext) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(initiateLogsContext) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(initiateLogsContext) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method completeLogsContext
     * @since 2.24.0
     * @instance
     * @async
     * @category Customer Care - Users Logs
     * @param {string} userId User or Rainbow room unique identifier. Default value is the connected user.
     * @param {string} logId Logs context unique identifier
     * @param {string} occurrenceDate Date when the issue occurred (ISO-8601 UTC format).
     * @param {string} occurrenceDateTimezone Timezone name when the issue occurred. </BR>
     * Allowed values: one of the timezone names defined in [IANA tz database](https://www.iana.org/time-zones). </BR>
     * Timezone name are composed as follow: `Area/Location` (ex: Europe/Paris, America/New_York,...) </BR>
     * @param {string} description Issue description
     * @param {string} externalRef Free field
     * @param {string} device Device type </BR>
     * Note: room corresponds to Rainbow Room </BR>
     * Possibles values : android, desktop, ios, room, web </BR>
     * @param {Array<string>} attachments An Array of file descriptor Id.
     * * Forbidden when type is `feedback`. All attachments are awaited during the logs context creation in thi scenario.
     * * Mandatory with at least one valid fileId when type is `feedback` and logged in user is a user or a Rainbow room (TV user) When the logs context is updated with some valid attachments, the logged in user looses his ownership for theses files.
     * @param {string} version Device version
     * @param {object} deviceDetails When relevant, optional details regarding the device on which the issue occurred
     * * hardware optionnel Object When relevant, details regarding the hardware of the device on which the issue occurred
     * * manufacturer optionnel String When relevant, manufacturer of the device on which the issue occurred
     * * model optionnel String When relevant, model of the device on which the issue occurred
     * * os optionnel Object When relevant, details regarding the Operating System on which the issue occurred
     * * name optionnel String When relevant, name of the Operating System on which the issue occurred
     * * version optionnel String When relevant, version of the Operating System on which the issue occurred
     * * browser optionnel Object When relevant, details regarding the browser on which the issue occurred
     * * name optionnel String When relevant, name of the browser on which the issue occurred
     * * version optionnel String When relevant, name of the browser on which the issue occurred
     * @description
     *     This API allows to completethe logs context. </BR>
     *     When an Admin or Emily bot ask to manage a user, this user must complete the logs context with all awaited data. </BR>
     * </BR>
     * * device </BR>
     * * version </BR>
     * * description </BR>
     * * attachments </BR>
     * </BR>
     * We let administrators to update some logs context fields at anytime, like: </BR>
     * </BR>
     * * device </BR>
     * * version </BR>
     * * description </BR>
     * * externalRef </BR>
     * </BR>
     * To discriminate the user and TV role from the administrator role we applies the following rules: </BR>
     * </BR>
     * * TV role is a single role then assimilated to a Rainbow user, we ask to complete an 'ask' log context. </BR>
     * * When userId URL parameter is the logged in user id, then this user he is also assimilated to a Rainbow user we ask to complete an 'ask' log context. </BR>
     * * When userId URL parameter is not the logged in user id, then we consider an administrator or a bot trying to update a logs context. </BR>
     * </BR>
     * Following constraints are applied (errorDetailsCode: 409004) </BR>
     * </BR>
     * * The logs context 'userId' field must match the value given as URL parameter </BR>
     * * A user or a rainbow TV can't updates a logs contexts when 'userId' field is not his userId and when the logs context type is 'feedback' </BR>
     * * Attachments are mandatory when a user or a rainbow TV updates a logs context, and no attachments are linked yet </BR>
     * * Can't override 'attachments' field when logs context has already some attached files </BR>
     * * An administrator updating a logs context can't set 'attachments' field </BR>
     * * A user or a rainbow TV updating a logs context can't change the field externalRef reserved for administrators purpose. </BR>
     * </BR>
     * Obviously when some files need to be attached, some constraints may lead to an error (errorDetailsCode: 409003) </BR>
     * </BR>
     * * file doesn't exist </BR>
     * * file not uploaded </BR>
     * * file doesn't belong to the userId </BR>
     * * file is not a log file (the file descriptor must include the field 'tags.purpose' = "logs" or 'tags.purpose' = "client_logs" </BR>
     * * permission must be granted before attaching files. See `acknowledgeLogsRequest` </BR>
     * @return {Promise<any>} - result
     *
     *
     * exemple of result :
     * { 
     * "id": "5e5f677a513f6721706bddeb", 
     * "type": "feedback", 
     * "permission": "granted", 
     * "userId": "5cca97863cba1119f22f062f", 
     * "userDisplayName": "John Doe", 
     * "companyId": "57e2b30c89a091b21e843924", 
     * "companyName": "My company", 
     * "problemNumber": 2, 
     * "creationDate": "2020-03-04T08:31:54.426Z", 
     * "occurrenceDate": "2020-03-04T08:15:00.000Z", 
     * "occurrenceDateTimezone": "Europe/Paris", 
     * "description": "Hello Houston, we've got a problem.", 
     * "device": "android", 
     * "version": "1.67.5", 
     * "deviceDetails": { 
     *  "hardware": { 
     *      "manufacturer": "Samsung", 
     *      "model": "Galaxy S21" 
     *  }, 
     *  "os": { 
     *      "name": "Android", 
     *      "version": "11" 
     *  } 
     * }, 
     * "attachments": \["5e5fecb299821728abb63e6d"\] 
     * } 
     *
     */
    completeLogsContext(userId : string, logId : string, occurrenceDate : string, occurrenceDateTimezone : string,
                        description : string, externalRef : string, device : string, attachments : Array<string>, version : string, deviceDetails : any) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.completeLogsContext(userId, logId, occurrenceDate, occurrenceDateTimezone,
                        description, externalRef, device, attachments, version, deviceDetails).then((result) => {
                    that._logger.log("debug", LOG_ID + "(completeLogsContext) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(completeLogsContext) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(completeLogsContext) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(completeLogsContext) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(completeLogsContext) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method cancelOrCloseLogsSubmission
     * @since 2.24.0
     * @instance
     * @async
     * @category Customer Care - Users Logs
     * @param {string} userId User or Rainbow room unique identifier. 
     * @param {string} logId Logs context unique identifier
     * @description
     *     This API can be called either as administrator (BP, Organisation, Company), support, superadmin to close a log submission. </BR>
     *     It can be called also by Emily bot after the User or Rainbow room decides to cancel the Ticket submission. </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | status | String | Delete operation status message. |
     *
     */
    cancelOrCloseLogsSubmission(userId : string, logId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.cancelOrCloseLogsSubmission(userId, logId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(cancelOrCloseLogsSubmission) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(cancelOrCloseLogsSubmission) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(cancelOrCloseLogsSubmission) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(cancelOrCloseLogsSubmission) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(cancelOrCloseLogsSubmission) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method acknowledgeLogsRequest
     * @since 2.24.0
     * @instance
     * @async
     * @category Customer Care - Users Logs
     * @param {string} userId User or Rainbow room unique identifier. Default value is the connected user.
     * @param {string} logId Logs context unique identifier
     * @description
     *     When an Admin or Emily bot ask to manage a user, the targeted device receives an event type management. </BR>
     *     </BR>
     *     </BR>
     *      `rainbow_onlogsconfig` with an action equal to "request".
     *     </BR>
     *     Then it will have to: </BR>
     *     acknowledge or reject the request </BR>
     *     </BR>
     *     Without an aknowledgment, it's forbidden to update the given logs context. </BR>
     *     When the request is accepted, it's no more possible to reject the request. </BR>
     *     </BR>
     *     Some errors occurs when: </BR>
     *     Logs context not found (resource not found) </BR>
     *     The logged in user is not involved in this logs context </BR>
     *     </BR>
     *     This API can only be used by user himself (i.e. userId of logged in user). </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Logs context unique identifier. |
     * | type | String | Initial scenario<br><br>* `feedback`: The customer submits an issue<br>* `ask`: A bot or an admin has contacted a customer to complete an issue |
     * | permission | String | User has currently accepted to provide his logs. Default value ('declined' when type is `ask`, `granted` when type is 'feedback'<br><br>* `declined`<br>* `granted`<br><br>Default value: `declined` when type is `ask`, `granted` when type is `feedback` |
     * | userId | String | Unique identifier of the customer (user or Rainbow Tv) |
     * | userDisplayName | String | Display name of the customer (user or Rainbow Tv) |
     * | companyId | String | Unique identifier of the userId 's Company |
     * | companyName | String | Name of the userId 's Company |
     * | originatorId | String | When type is `ask`, an admin or a bot userId. |
     * | problemNumber | Number | Ticket number (integer incremented per company) |
     * | creationDate | Date-Time | Logs context creation date |
     * | occurrenceDate | Date-Time | Date when the issue occurred |
     * | occurrenceDateTimezone | String | Timezone name when the issue occurred.<br><br>Allowed values: one of the timezone names defined in [IANA tz database](https://www.iana.org/time-zones).  <br>Timezone name are composed as follow: `Area/Location` (ex: Europe/Paris, America/New_York,...) |
     * | description | String | Issue description |
     * | resourceId | String | When type is `ask`, this is the resource of the device from which we need to get logs (in case of multi-devices configuration) |
     * | externalRef | String | Free field |
     * | device | String | Device type<br><br>Note: `room` corresponds to Rainbow Room<br><br>Possibles values : `android`, `desktop`, `ios`, `room`, `web` |
     * | version | String | Device version |
     * | deviceDetails optionnel | Object | When relevant, optional details regarding the device on which the issue occurred |
     * | attachments | String\[\] | An Array of file descriptor Id<br><br>* To belong as logs context attachment, a file descriptor must contain the field tags.purpose with the value `log` |
     *
     */
    acknowledgeLogsRequest(userId : string, logId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.acknowledgeLogsRequest(userId, logId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(acknowledgeLogsRequest) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(acknowledgeLogsRequest) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(acknowledgeLogsRequest) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(acknowledgeLogsRequest) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(acknowledgeLogsRequest) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method rejectLogsRequest
     * @since 2.24.0
     * @instance
     * @async
     * @category Customer Care - Users Logs
     * @param {string} userId User or Rainbow room unique identifier. Default value is the connected user.
     * @param {string} logId Logs context unique identifier
     * @description
     *     When an Admin or Emily bot ask to manage a user, the targeted device receives an event type management. </BR>
     *     </BR>
     *     </BR>
     *      `rainbow_onlogsconfig` with an action equal to "request".
     * </BR>
     * Then it will have to: </BR>
     * * acknowledge or reject the request </BR>
     * </BR>
     * This API is to reject de request. An event type management `rainbow_onlogsconfig` with an action equal to "reject" is raised.
     * </BR>
     * Then it's up to the administrator or the bot to delete the logs context and to stop interacting with the user. </BR>
     * Without an aknowledgment, it's forbidden to update the given logs context. </BR>
     * </BR>
     * Some errors occurs when: </BR>
     * * Logs context not found (resource not found) </BR>
     * * The logged in user is not involved in this logs context </BR>
     * * `Permission already granted. It can no longer be revoked` </BR>
     * </BR>
     * This API can only be used by user himself (i.e. userId of logged in user = value of userId parameter in URL) </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Logs context unique identifier. |
     * | type | String | Initial scenario<br><br>* `feedback`: The customer submits an issue<br>* `ask`: A bot or an admin has contacted a customer to complete an issue |
     * | permission | String | User has currently accepted to provide his logs. Default value ('declined' when type is `ask`, `granted` when type is 'feedback'<br><br>* `declined`<br>* `granted`<br><br>Default value: `declined` when type is `ask`, `granted` when type is `feedback` |
     * | userId | String | Unique identifier of the customer (user or Rainbow Tv) |
     * | userDisplayName | String | Display name of the customer (user or Rainbow Tv) |
     * | companyId | String | Unique identifier of the userId 's Company |
     * | companyName | String | Name of the userId 's Company |
     * | originatorId | String | When type is `ask`, an admin or a bot userId. |
     * | problemNumber | Number | Ticket number (integer incremented per company) |
     * | creationDate | Date-Time | Logs context creation date |
     * | occurrenceDate | Date-Time | Date when the issue occurred |
     * | occurrenceDateTimezone | String | Timezone name when the issue occurred.<br><br>Allowed values: one of the timezone names defined in [IANA tz database](https://www.iana.org/time-zones).  <br>Timezone name are composed as follow: `Area/Location` (ex: Europe/Paris, America/New_York,...) |
     * | description | String | Issue description |
     * | resourceId | String | When type is `ask`, this is the resource of the device from which we need to get logs (in case of multi-devices configuration) |
     * | externalRef | String | Free field |
     * | device | String | Device type<br><br>Note: `room` corresponds to Rainbow Room<br><br>Possibles values : `android`, `desktop`, `ios`, `room`, `web` |
     * | version | String | Device version |
     * | deviceDetails optionnel | Object | When relevant, optional details regarding the device on which the issue occurred |
     * | attachments | String\[\] | An Array of file descriptor Id<br><br>* To belong as logs context attachment, a file descriptor must contain the field tags.purpose with the value `log` |
     *
     */
    rejectLogsRequest(userId : string, logId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.rejectLogsRequest(userId, logId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(rejectLogsRequest) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(rejectLogsRequest) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(rejectLogsRequest) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(rejectLogsRequest) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(rejectLogsRequest) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method sendCustomerCareReport
     * @since 2.24.1
     * @instance
     * @async
     * @category Customer Care - Users Logs
     * @param {string} logId Logs context unique identifier (received with an `rainbow_onlogsconfig` event with a "request" `action` parameter).
     * @param {Array<string>} filesPath the path to the files to store in the logs context.
     * @param {string} occurrenceDate Date when the issue occurred (ISO-8601 UTC format).
     * @param {string} occurrenceDateTimezone Timezone name when the issue occurred. </BR>
     * Allowed values: one of the timezone names defined in [IANA tz database](https://www.iana.org/time-zones). </BR>
     * Timezone name are composed as follow: `Area/Location` (ex: Europe/Paris, America/New_York,...) </BR>
     * @param {string} description Issue description
     * @param {string} externalRef Free field
     * @param {string} device Device type </BR>
     * Note: room corresponds to Rainbow Room </BR>
     * Possibles values : android, desktop, ios, room, web </BR>
     * @param {string} version Device version
     * @param {object} deviceDetails When relevant, optional details regarding the device on which the issue occurred
     * * hardware optionnel Object When relevant, details regarding the hardware of the device on which the issue occurred
     * * manufacturer optionnel String When relevant, manufacturer of the device on which the issue occurred
     * * model optionnel String When relevant, model of the device on which the issue occurred
     * * os optionnel Object When relevant, details regarding the Operating System on which the issue occurred
     * * name optionnel String When relevant, name of the Operating System on which the issue occurred
     * * version optionnel String When relevant, version of the Operating System on which the issue occurred
     * * browser optionnel Object When relevant, details regarding the browser on which the issue occurred
     * * name optionnel String When relevant, name of the browser on which the issue occurred
     * * version optionnel String When relevant, name of the browser on which the issue occurred
     * @description
     *     This API allows to store files in rainbow, and then to complete the logs context with it and provided informations. </BR>
     *
     *     **Note:** if a file transfert fails then the complete of logs context is not done, and an object with every transfert status is returned.
     * @return {Promise<any>} - result
     *  The result of the completeLogsContext call.
     *  
     *  **Note:** if a file transfert fails then the complete of logs context is not done, and an object with every transfert status is returned.
     */
    sendCustomerCareReport(logId : string, filesPath : Array<string> = [], occurrenceDate : string, occurrenceDateTimezone : string,
                           description : string, externalRef : string, device : string, version : string, deviceDetails : any) {
        let that = this;
        let proms = [];
        let attachments = [];
        let fileFailed = [];

        return new Promise(function (resolve, reject) {
            try {
                for (let i = 0; i < filesPath.length; i++) {
                    let filePath = filesPath[i];
                    that._logger.log("debug", LOG_ID + "(sendCustomerCareReport) filesPath - to send. ");
                    that._logger.log("internal", LOG_ID + "(sendCustomerCareReport) filesPath - to send : ", filePath);

                    proms.push(that._fileStorage.uploadFileToStorage(filePath,undefined, undefined, undefined, false, true));
                }

                Promise.allSettled(proms).then((resultsOfUpload: Array<any>) => {
                    let success = true;
                    for (let i = 0; i < resultsOfUpload.length; i++) {
                        let resultOfUpload = resultsOfUpload[i];
                        that._logger.log("debug", LOG_ID + "(sendCustomerCareReport) resultOfUpload.");
                        that._logger.log("internal", LOG_ID + "(sendCustomerCareReport) resultOfUpload : ", resultOfUpload);
                        success = (success && (resultOfUpload.status!=="rejected"));
                        if (success) {
                            attachments.push(resultOfUpload.value);
                        } else {
                            fileFailed.push({
                                filePath: filesPath[i],
                                reason: resultOfUpload.reason
                            })
                        }
                    }

                    if (success) {
                        let ressourceId = undefined;
                        that.initiateLogsContext(undefined, occurrenceDate, occurrenceDateTimezone, "feedback",
                        //that.completeLogsContext(undefined, logId, occurrenceDate, occurrenceDateTimezone,
                                description, ressourceId, externalRef, device, attachments, version, deviceDetails).then((result) => {
                            return resolve(result);
                        }).catch((err) => {
                            return reject(ErrorManager.getErrorManager().CUSTOMERROR(-2, "Error in initiateLogsContext", "Error in initiateLogsContext", err));
                        })
                    } else {
                        return reject(ErrorManager.getErrorManager().CUSTOMERROR(-1, "Error in sending files.", "Error in sending files.", fileFailed));
                    }

                    /*switch (success) {
                        "rejected":
                            break;
                        "fulfilled":
                            break;
                        default:
                            break;
                    } // */
                }). catch ((err) => {
                    that._logger.log("error", LOG_ID + "(sendCustomerCareReport) CATCH error.");
                    that._logger.log("internalerror", LOG_ID + "(sendCustomerCareReport) CATCH error !!! : ", err);
                    return reject(ErrorManager.getErrorManager().CUSTOMERROR(-1, "Error in waiting all proms.", "Error in waiting all proms.", err));
                });
            } catch (err) {
                that._logger.log("error", LOG_ID + "(sendCustomerCareReport) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(sendCustomerCareReport) CATCH error !!! : ", err);
                return reject(ErrorManager.getErrorManager().CUSTOMERROR(-1, "Error in sending files.", "Error in sending files.", err));
            }
        });
    }

    //endregion Customer Care - Users Logs

    //region Customer Care - Users Logs Append

    /**
     * @public
     * @method adminOrBotAddAdditionalFiles
     * @since 2.24.0
     * @instance
     * @async
     * @category Customer Care - Users Logs Append
     * @param {string} userId User or Rainbow room unique identifier. Default value is the connected user.
     * @param {string} logId Logs context unique identifier
     * @description
     *     This api can be called either as administrator (BP, Organisation, Company), support, superadmin or Emily bot to append additional elements ( pictures, screenshot, ... or conversation content). </BR>
     *     </BR>
     *     For example in the [Cf Case As Emily Bot, ask to manage a user](/customercare/#api-_) scenario, the Emily bot should be able to add elements shared by a customer via the conversation the bot did with him. </BR>
     *     </BR>
     *     **Pre-checks:** </BR>
     *     the loggedInUser is the creator of the log context or an authorized administrator. </BR>
     *     </BR>
     *     **Case file to add:** two types of files are uploaded : file generated from conversation and file belonging to logged in user. </BR>
     * @return {Promise<any>} - result
     *
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Logs context unique identifier. |
     * | type | String | Initial scenario<br><br>* `feedback`: The customer submits an issue<br>* `ask`: A bot or an admin has contacted a customer to complete an issue |
     * | permission | String | User has currently accepted to provide his logs. Default value ('declined' when type is `ask`, `granted` when type is 'feedback'<br><br>* `declined`<br>* `granted`<br><br>Default value: `declined` when type is `ask`, `granted` when type is `feedback` |
     * | userId | String | Unique identifier of the customer (user or Rainbow Tv) |
     * | userDisplayName | String | Display name of the customer (user or Rainbow Tv) |
     * | companyId | String | Unique identifier of the userId 's Company |
     * | companyName | String | Name of the userId 's Company |
     * | originatorId | String | When type is `ask`, an admin or a bot userId. |
     * | problemNumber | Number | Ticket number (integer incremented per company) |
     * | creationDate | Date-Time | Logs context creation date |
     * | occurrenceDate | Date-Time | Date when the issue occurred |
     * | occurrenceDateTimezone | String | Timezone name when the issue occurred.<br><br>Allowed values: one of the timezone names defined in [IANA tz database](https://www.iana.org/time-zones).  <br>Timezone name are composed as follow: `Area/Location` (ex: Europe/Paris, America/New_York,...) |
     * | description | String | Issue description |
     * | resourceId | String | When type is `ask`, this is the resource of the device from which we need to get logs (in case of multi-devices configuration) |
     * | externalRef | String | Free field |
     * | device | String | Device type<br><br>Note: `room` corresponds to Rainbow Room<br><br>Possibles values : `android`, `desktop`, `ios`, `room`, `web` |
     * | version | String | Device version |
     * | deviceDetails optionnel | Object | When relevant, optional details regarding the device on which the issue occurred |
     * | attachments | String\[\] | An Array of file descriptor Id<br><br>* To belong as logs context attachment, a file descriptor must contain the field tags.purpose with the value `log` |
     *
     */
    adminOrBotAddAdditionalFiles(userId : string, logId : string, attachments : Array<string>, conversationId : string, fileName : string ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.adminOrBotAddAdditionalFiles(userId, logId, attachments, conversationId, fileName).then((result) => {
                    that._logger.log("debug", LOG_ID + "(adminOrBotAddAdditionalFiles) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(adminOrBotAddAdditionalFiles) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(adminOrBotAddAdditionalFiles) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(adminOrBotAddAdditionalFiles) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(adminOrBotAddAdditionalFiles) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    //endregion Customer Care - Users Logs Append

    //region Customer Care - Users resources

    /**
     * @public
     * @method getListOfResourcesForUser
     * @since 2.24.0
     * @instance
     * @async
     * @category Customer Care - Users resources
     * @param {string} userId User or Rainbow room unique identifier. Default value is the connected user.
     * @description
     *     This API allows to have the list of resources a user selected to connect to Rainbow infrastructure. </BR>
     So that, as administrator (Superadmin, Support, BP, Organisation, Company), I can ask a user to upload logs if he agree. </BR>
     * @return {Promise<any>} - result
     *
     *
     * example of result :
     * {
     * "jid_im": \[ 
     * { 
     * "resource": "web\_win\_1.67.2_P0EnyMvN", 
     * "date": "2020-02-11T17:45:18.231395Z" 
     * }, 
     * { 
     * "resource": "web\_win\_1.67.2_ajqyiThi", 
     * "date": "2020-02-11T17:31:31.409537Z", 
     * "show": "xa", "status": "away" 
     * } \]
     * }
     *
     */
    getListOfResourcesForUser( userId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.getListOfResourcesForUser(userId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(getListOfResourcesForUser) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(getListOfResourcesForUser) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(getListOfResourcesForUser) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(getListOfResourcesForUser) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(getListOfResourcesForUser) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    //endregion Customer Care - Users resources

    //region Customer Care - Users ticket

    /**
     * @public
     * @method createAnAtriumTicket
     * @since 2.24.0
     * @instance
     * @async
     * @category Customer Care - Users ticket
     * @param {string} userId User or Rainbow room unique identifier. Default value is the connected user.
     * @param {string} subject Subject of the new ticket
     * @param {string} description Description of the new ticket
     * @param {string} additionalDescription Additional information if necessary
     * @param {string} resource  resource used to generate anomaly
     * @param {string} externalRef external reference used  
     * @param {Array<string>} logs An Array of log Id regarding the anomaly.
     * @description
     *     This API allows to Initialise a context from logs to submit a ticket to Zendesk. </BR> 
     *     This context may contains </BR>
     * * externalRef </BR>
     * * subject </BR>
     * * description </BR>
     * * additional description </BR>
     * * resource </BR>
     * * logs. </BR>
     * @return {Promise<any>} - result
     *
     *
     * example of result :
     * { 
     * "externalRef": "xxxxxxx", 
     * "internalRef": "xxxxxxx", 
     * "subject": "ringing problem", 
     * "description": "Hello Houston, we've got a problem.", 
     * "additionalDescription": "my phone neither", 
     * "resource": "web\_win\_xxxxx", 
     * "logs": \[\]
     * }
     *
     */
    createAnAtriumTicket(userId : string, subject : string, description : string, additionalDescription : string, resource : string, externalRef : string, logs : Array<string> ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.createAnAtriumTicket(userId, subject, description, additionalDescription, resource, externalRef, logs).then((result) => {
                    that._logger.log("debug", LOG_ID + "(createAnAtriumTicket) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(createAnAtriumTicket) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createAnAtriumTicket) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(createAnAtriumTicket) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(createAnAtriumTicket) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method updateAnAtriumTicket
     * @since 2.24.0
     * @instance
     * @async
     * @category Customer Care - Users ticket
     * @param {string} userId User or Rainbow room unique identifier. Default value is the connected user.
     * @param {string} ticketId ticketId Ticket unique identifier
     * @param {string} subject Subject of the new ticket
     * @param {string} description Description of the new ticket
     * @param {string} additionalDescription Additional information if necessary
     * @param {string} resource  resource used to generate anomaly
     * @param {string} externalRef external reference used
     * @param {Array<string>} logs An Array of log Id regarding the anomaly.
     * @description
     *     This API allows to update a context from logs to submit a ticket to Zendesk. </BR>
     *     This context may contains </BR>
     * * externalRef </BR>
     * * subject </BR>
     * * description </BR>
     * * additional description </BR>
     * * resource </BR>
     * * logs. </BR>
     * @return {Promise<any>} - result
     *
     *
     * example of result :
     * { 
     * "externalRef": "xxxxxxx", 
     * "internalRef": "xxxxxxx", 
     * "subject": "ringing problem", 
     * "description": "Hello Houston, we've got a problem.", 
     * "additionalDescription": "my phone neither", 
     * "resource": "web\_win\_xxxxx", 
     * "logs": \[\]
     * }
     * 
     */
    updateAnAtriumTicket(userId : string, ticketId : string, subject : string, description : string, additionalDescription : string, resource : string, externalRef : string, logs : Array<string> ) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.updateAnAtriumTicket(userId, ticketId, subject, description, additionalDescription, resource, externalRef, logs).then((result) => {
                    that._logger.log("debug", LOG_ID + "(updateAnAtriumTicket) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(updateAnAtriumTicket) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(updateAnAtriumTicket) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateAnAtriumTicket) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(updateAnAtriumTicket) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteAnAtriumTicketInformation
     * @since 2.24.0
     * @instance
     * @async
     * @category Customer Care - Users ticket
     * @param {string} userId User or Rainbow room unique identifier.
     * @param {string} ticketId ticketId Ticket unique identifier
     * @description
     *     This API allows to delete an existing context in database from a submitted ticket to Zendesk. </BR>
     * @return {Promise<any>} - result
     *
     *
     * example of result :
     * { 
     * "externalRef": "xxxxxxx", 
     * "internalRef": "xxxxxxx", 
     * "subject": "ringing problem", 
     * "description": "Hello Houston, we've got a problem.", 
     * "additionalDescription": "my phone neither", 
     * "resource": "web\_win\_xxxxx", 
     * "logs": \[\]
     * }
     *
     */
    deleteAnAtriumTicketInformation(userId : string, ticketId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.deleteAnAtriumTicketInformation(userId, ticketId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(deleteAnAtriumTicketInformation) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(deleteAnAtriumTicketInformation) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteAnAtriumTicketInformation) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(deleteAnAtriumTicketInformation) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(deleteAnAtriumTicketInformation) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method readAnAtriumTicketInformation
     * @since 2.24.0
     * @instance
     * @async
     * @category Customer Care - Users ticket
     * @param {string} userId User or Rainbow room unique identifier. Default value is the connected user.
     * @description
     *     This API allows to read a context from a submitted ticket to Zendesk. </BR>
     *     This context may contains </BR>
     * * externalRef </BR>
     * * subject </BR>
     * * description </BR>
     * * additional description </BR>
     * * resource </BR>
     * * logs. </BR>
     * @return {Promise<any>} - result
     *
     *
     * example of result :
     * { 
     * "externalRef": "xxxxxxx", 
     * "internalRef": "xxxxxxx", 
     * "subject": "ringing problem", 
     * "description": "Hello Houston, we've got a problem.", 
     * "additionalDescription": "my phone neither", 
     * "resource": "web\_win\_xxxxx", 
     * "logs": \[\]
     * }
     *
     */
    readAnAtriumTicketInformation( userId : string, ticketId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.readAnAtriumTicketInformation(userId, ticketId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(readAnAtriumTicketInformation) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(readAnAtriumTicketInformation) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(readAnAtriumTicketInformation) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(readAnAtriumTicketInformation) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(readAnAtriumTicketInformation) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method readAllTicketsOnASameCompany
     * @since 2.24.0
     * @instance
     * @async
     * @category Customer Care - Users ticket
     * @param {string} userId User or Rainbow room unique identifier. Default value is the connected user.
     * @description
     *     This API allows to read all context regarding submitted tickets to Zendesk in the same company . The company is calculated with userId information found in DB. </BR>
     * @return {Promise<any>} - result
     *
     *
     * example of result :
     * \[ 
     * { 
     * "externalRef": "xxxxxxx", 
     * "internalRef": "xxxxxxx", 
     * "subject": "ringing problem", 
     * "description": "Where is the volume button of my iphone?", 
     * "additionalDescription": "Where is my rainbow icon on my mac? ", 
     * "resource": "web\_win\_xxxxx", 
     * "logs": \[\] 
     * }, 
     * { 
     * "externalRef": "xxxxxxx", 
     * "internalRef": "xxxxxxx", 
     * "subject": "Screen problem", 
     * "description": "I forgot to turn on my iphone, the screen stay in black, I disappointed to not receive any Rainbow notification.", 
     * "resource": "web\_win\_xxxxx" 
     * }
     * \]
     *
     */
    readAllTicketsOnASameCompany(userId : string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            try {
                that._rest.readAllTicketsOnASameCompany(userId).then((result) => {
                    that._logger.log("debug", LOG_ID + "(readAllTicketsOnASameCompany) Successfully - sent. ");
                    that._logger.log("internal", LOG_ID + "(readAllTicketsOnASameCompany) Successfully - sent : ", result);
                    resolve(result);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(readAllTicketsOnASameCompany) ErrorManager error : ", err);
                    return reject(err);
                });

            } catch (err) {
                that._logger.log("error", LOG_ID + "(readAllTicketsOnASameCompany) CATCH error.");
                that._logger.log("internalerror", LOG_ID + "(readAllTicketsOnASameCompany) CATCH error !!! : ", err);
                return reject(err);
            }
        });
    }

    //endregion Customer Care - Users ticket
    
    //endregion Customer Care
    }

module.exports.AdminService = AdminService;
module.exports.OFFERTYPES = OFFERTYPES;
module.exports.CLOUDPBXCLIOPTIONPOLICY = CLOUDPBXCLIOPTIONPOLICY;
export {AdminService as AdminService, OFFERTYPES, CLOUDPBXCLIOPTIONPOLICY};
