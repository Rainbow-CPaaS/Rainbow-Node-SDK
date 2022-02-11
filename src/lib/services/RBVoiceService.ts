"use strict";

import {Dictionary, IDictionary, List} from "ts-generic-collections-linq";
import * as deepEqual from "deep-equal";
import {GuestParams, MEDIATYPE, RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {XMPPService} from "../connection/XMPPService";
import {EventEmitter} from "events";
import {getBinaryData, isStarted, logEntryExit, resizeImage, until} from "../common/Utils";
import {Logger} from "../common/Logger";
import {ContactsService} from "./ContactsService";
import {ProfilesService} from "./ProfilesService";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import * as PubSub from "pubsub-js";
import {GenericService} from "./GenericService";
//import {RBVoice} from "../common/models/rbvoice";
//import {RBVoiceEventHandler} from "../connection/XMPPServiceHandler/rbvoiceEventHandler";
import {Channel} from "../common/models/Channel";

export {};

const LOG_ID = "WEBINAR/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name RBVoiceService
 * @version SDKVERSION
 * @public
 * @description
 *      This service manages the rainbow voice Systems.<br>
 */
class RBVoiceService extends GenericService {
    private avatarDomain: string;
    private readonly _protocol: string = null;
    private readonly _host: string = null;
    private readonly _port: string = null;
    //private _rbvoice: Array<RBVoice>;

    //private rbvoiceEventHandler: RBVoiceEventHandler;
    private rbvoiceHandlerToken: any;


    static getClassName(){ return 'RBVoiceService'; }
    getClassName(){ return RBVoiceService.getClassName(); }

    constructor(_eventEmitter: EventEmitter, _http: any, _logger: Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(_logger, LOG_ID);
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
        this._startConfig = _startConfig;
        this._protocol = _http.protocol;
        this._host = _http.host;
        this._port = _http.port;

        this.avatarDomain = this._host.split(".").length === 2 ? this._protocol + "://cdn." + this._host + ":" + this._port : this._protocol + "://" + this._host + ":" + this._port;

        // this._eventEmitter.on("evt_internal_createrbvoice", this.onCreateRBVoice.bind(this));
        // this._eventEmitter.on("evt_internal_deleterbvoice", this.onDeleteRBVoice.bind(this));

    }

    start(_options, _core: Core) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService, _contacts : ContactsService, _profileService : ProfilesService
        let that = this;

        return new Promise(async function (resolve, reject) {
            try {
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;
                that._options = _options;
                that._s2s = _core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                //that._rbvoice = [];
                that.attachHandlers();
                that.setStarted ();
                resolve(undefined);
            } catch (err) {
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
                if (that.rbvoiceHandlerToken) {
                    that.rbvoiceHandlerToken.forEach((token) => PubSub.unsubscribe(token));
                }
                that.rbvoiceHandlerToken = [];
                //that._rbvoice = null;
                that.setStopped ();
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        });
    }
    
    async init() {
        let that = this;
        that.setInitialized();
    }

    attachHandlers() {
        let that = this;
        //that.rbvoiceEventHandler = new RBVoiceEventHandler(that._xmpp, that);
        that.rbvoiceHandlerToken = [
            //PubSub.subscribe( that._xmpp.hash + "." + that.rbvoiceEventHandler.MESSAGE_MANAGEMENT, that.rbvoiceEventHandler.onManagementMessageReceived.bind(that.rbvoiceEventHandler)),
            //PubSub.subscribe( that._xmpp.hash + "." + that.rbvoiceEventHandler.MESSAGE_ERROR, that.rbvoiceEventHandler.onErrorMessageReceived.bind(that.rbvoiceEventHandler))
        ];
    }

    //region Rainbow Voice

    //region Rainbow Voice CLI Options

    /**
     * @method retrieveAllAvailableCallLineIdentifications
     * @async
     * @category Rainbow Voice CLI Options
     * @instance   
     * @description
     * This api returns all CLI options available. 
     * @fulfil {Promise<any>} return result.
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Detailed information about Calling Line Identification (CLI) |
     * | policy | String | CLI **policy** applied.  <br>It indicates which kind of number is used as CLI  <br>Detailed description of **policy** meanings:<br>* **company_policy** : CLI will be the **Default identifier** as defined at company level (as a result it can be either the Company Number or the Work phone of the user ; according the chosen CLI company policy)<br>* **user\_ddi\_number** : CLI will be the **Work phone** of the user<br>* **installation\_ddi\_number** : CLI will be the **Company number**<br>* **other\_ddi\_number** : CLI will be a **Hunting Group number** the user belongs to. Can be also **another number authorized** by Admin<br>Possible values : `company_policy`, `user_ddi_number`, `installation_ddi_number`, `other_ddi_number` |
     * | companyPolicy optionnel | String | Only when policy is "company_policy" ; it indicates what is the CLI policy defined at company level<br>Possible values : `user_ddi_number`, `installation_ddi_number` |
     * | phoneNumberId | String | phoneNumber Unique identifier that is used for identifying selected CLI |
     * | number | String | phoneNumber value that is used as CLI |
     * | type optionnel | String | Only when CLI policy is "other\_ddi\_number" ; allows to differentiate Hunting Groups with another number<br>Possible values : `Group`, `Other` |
     * | name optionnel | String | Only when CLI policy is "other\_ddi\_number" and type is "Group". It is then the Group name |
     *   
     */
    retrieveAllAvailableCallLineIdentifications () {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveAllAvailableCallLineIdentifications( );
                that._logger.log("debug", "(retrieveAllAvailableCallLineIdentifications) - sent.");
                that._logger.log("internal", "(retrieveAllAvailableCallLineIdentifications) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveAllAvailableCallLineIdentifications) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveAllAvailableCallLineIdentifications) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @method retrieveCurrentCallLineIdentification
     * @async
     * @category Rainbow Voice CLI Options
     * @instance
     * @description
     * This api returns current Call line identification. <br>
     * @return {Promise<any>}
     */
    retrieveCurrentCallLineIdentification () {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveCurrentCallLineIdentification( );
                that._logger.log("debug", "(retrieveCurrentCallLineIdentification) - sent.");
                that._logger.log("internal", "(retrieveCurrentCallLineIdentification) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveCurrentCallLineIdentification) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveCurrentCallLineIdentification) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @method setCurrentActiveCallLineIdentification
     * @async
     * @category Rainbow Voice CLI Options
     * @param {string} policy CLI policy to apply.Possible values : "company_policy", "user_ddi_number", "installation_ddi_number", "other_ddi_number"
     * @param {string} phoneNumberId  phoneNumber Unique Identifier of the ddi we want to apply (parameter only mandatory when selected CLI policy is "other_ddi_number"
     * @instance
     * @description
     *  This api allows user to set the current CLI. <br>
     * @return {Promise<any>} the result.
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Detailed information about Calling Line Identification (CLI) |
     * | policy | String | CLI **policy** applied.  <br>It indicates which kind of number is used as CLI  <br>Detailed description of **policy** meanings:<br>* **company_policy** : CLI will be the **Default identifier** as defined at company level (as a result it can be either the Company Number or the Work phone of the user ; according the chosen CLI company policy)<br>* **user\_ddi\_number** : CLI will be the **Work phone** of the user<br>* **installation\_ddi\_number** : CLI will be the **Company number**<br>* **other\_ddi\_number** : CLI will be a **Hunting Group number** the user belongs to. Can be also **another number authorized** by Admin<br>Posible values : `company_policy`, `user_ddi_number`, `installation_ddi_number`, `other_ddi_number` |
     * | companyPolicy optionnel | String | Only when policy is "company_policy" ; it indicates what is the CLI policy defined at company level<br>Possible values : `user_ddi_number`, `installation_ddi_number` |
     * | phoneNumberId | String | phoneNumber Unique identifier that is used for identifying selected CLI |
     * | number | String | phoneNumber value that is used as CLI |
     * | type optionnel | String | Only when CLI policy is "other\_ddi\_number" ; allows to differentiate Hunting Groups with another number<br>Possible values : `Group`, `Other` |
     * | name optionnel | String | Only when CLI policy is "other\_ddi\_number" and type is "Group". It is then the Group name |
     * 
     */
    setCurrentActiveCallLineIdentification (policy : string,   phoneNumberId?  : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.setCurrentActiveCallLineIdentification( policy,   phoneNumberId);
                that._logger.log("debug", "(setCurrentActiveCallLineIdentification) - sent.");
                that._logger.log("internal", "(setCurrentActiveCallLineIdentification) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(setCurrentActiveCallLineIdentification) Error.");
                that._logger.log("internalerror", LOG_ID + "(setCurrentActiveCallLineIdentification) Error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Rainbow Voice CLI Options

    
    //region Rainbow Voice Cloud PBX group

    /**
     * @method addMemberToGroup
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @param {string} groupId Unique identifier of the Cloud PBX group to update
     * @param {string} memberId Unique identifier (userId) of the user to add
     * @param {number} position Position of the user inside the group, from 1 to last.
     * @param {Array<string>} roles Member roles inside the group. Default value : agent.Possible value : agent, manager, assistant
     * @param {string} status Member status inside the group. Default : active. Possible value : active, idle
     * @instance
     * @description
     *  This part of the API allows a user having manager role on a group to add another user. <br>
     *  The added user can be any user belonging to the same company. <br>
     *  The position of the inserted member is important in case of a hunting group with serial or circular policy, and also in case of a manager_assistant group with several assistants. <br>
     *  The position is meaningless in case of parallel hunting group. <br>
     *  Manager can choose to set the default status of the added user to 'idle' or 'active' (default value, user will be involved in call distribution for hunting group). <br>
     *  In case of a manager_assistant group the status can be: <br>
     *  <br>
     *   - 'idle': the newly inserted member is just 'declared', and not provisioned on cloud PBX side <br>
     *   - 'active': the newly inserted manager or assistant is configured and ready <br>
     *  <br>
     *  Manager can also set the added user role, defining if this user is an agent and/or manager in a hunting group (assistant or manager in case of manager_assistant group). <br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Group Object |
     * | id  | String | Group unique identifier |
     * | type optionnel | String | Group type<br>Default value : `hunting_group`<br>Possible values : `hunting_group`, `manager_assistant` |
     * | name | String | Group name - displayed on the caller phone set for hunting group type |
     * | policy optionnel | String | Group policy - applicable to hunting group type only<br>Default value : `parallel`<br>Possible values : `serial`, `parallel`, `circular` |
     * | members | Object\[\] | List of group members. |
     * | memberId | String | Member (user) unique identifier |
     * | displayName | String | Member display name |
     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
     *
     */
    addMemberToGroup (groupId : string, memberId : string, position : number, roles : [], status : string ) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.addMemberToGroup (groupId, memberId, position, roles, status ) ;
                that._logger.log("debug", "(addMemberToGroup) - sent.");
                that._logger.log("internal", "(addMemberToGroup) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(addMemberToGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(addMemberToGroup) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @method deleteVoiceMessageAssociatedToAGroup
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @param {string} groupId Unique identifier of the Cloud PBX group to update
     * @param {string} messageId Message identifier (userId) of the user to add
     * @instance
     * @description
     *  Deletion of the given voice message. <br>
     * @return {Promise<any>} the result.
     *
     */
    deleteVoiceMessageAssociatedToAGroup (groupId : string, messageId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.deleteVoiceMessageAssociatedToAGroup (groupId , messageId ) ;
                that._logger.log("debug", "(deleteVoiceMessageAssociatedToAGroup) - sent.");
                that._logger.log("internal", "(deleteVoiceMessageAssociatedToAGroup) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(deleteVoiceMessageAssociatedToAGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(deleteVoiceMessageAssociatedToAGroup) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @method getVoiceMessagesAssociatedToGroup
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @param {string} groupId Unique identifier of the Cloud PBX group to update
     * @param {number} limit Allow to specify the number of voice messages to retrieve. Default value : 100
     * @param {number} offset Allow to specify the position of first voice messages to retrieve. Default value : 0
     * @param {string} sortField Sort voice messages list based on the given field. Default value : date
     * @param {number} sortOrder Specify order when sorting voice messages. Default is descending. Default value : -1. Possible values : -1, 1
     * @param {string} fromDate List voice messages created after the given date.
     * @param {string} toDate List voice messages created before the given date.
     * @param {string} callerName List voice messages with caller party name containing the given value.
     * @param {string} callerNumber List voice messages with caller party number containing the given value.
     * @instance
     * @description
     *      Returns the list of voice messages associated to a group. <br>
     * @return {Promise<any>} the result.
     * 
     *
     *  | Champ | Type | Description |
     *  | --- | --- | --- |
     *  | id  | String | voice message identifier |
     *  | fileName | String | File name of the voice message - composed of the voice message date |
     *  | mime | String | MIME type of the voice message file<br>Possible values : `audio/mpeg` |
     *  | size | Number | Size of the voice message file (in bytes). |
     *  | duration | Number | Duration of the voice message (in seconds) |
     *  | date | Date | Date of the voice message |
     *  | callerInfo | Object | Caller party info |
     *  | data | Object\[\] | Voice messages |
     *  | number | String | Caller number |
     *  | name optionnel | String | Caller name, if available |
     *  | firstName optionnel | String | Caller firstName, if available |
     *  | lastName optionnel | String | Caller lastName, if available |
     *  | userId optionnel | String | Caller user identifier if it can be resolved. |
     *  | jid optionnel | String | Caller Jid if it can be resolved. |
     *  
     */
    getVoiceMessagesAssociatedToGroup (groupId : string, limit : number = 100, offset: number = 0, sortField:string ="name", sortOrder : number, fromDate : string, toDate : string, callerName : string, callerNumber : string ) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getVoiceMessagesAssociatedToGroup (groupId, limit, offset, sortField, sortOrder, fromDate, toDate, callerName, callerNumber ) ;
                that._logger.log("debug", "(getVoiceMessagesAssociatedToGroup) - sent.");
                that._logger.log("internal", "(getVoiceMessagesAssociatedToGroup) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getVoiceMessagesAssociatedToGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(getVoiceMessagesAssociatedToGroup) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @method getGroupForwards
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @param {string} groupId Unique identifier of the Cloud PBX group to update
     * @instance
     * @description
     *  This API allows to get all cloud PBX group forwards. <br>
     *  The cloud PBX group forwards can be of two different types: <br>
     *   - groupForwards: applies to hunting group - supported forward types for this kind of group are all listed in the response (immediate, overflow (reprensents busy/unavailable for non parallel and busy/unavailable/noReply for parallel))
     *   - members: applies to manager_assistant group - list the individual forwards of every managers of the group. These individual forwards are filtered to the only immediate forward, with a destinationType of 'managersecretary' (a.k.a. 'Do Not Disturb forward to assistants')
     *  <br>
     *  Inside a manager_assistant group, both manager and assistant can retrieve the group forwards. Inside a hunting group, only the manager can see it (i.e. users with role only set to 'agent' are not allowed to consult the group forwards). <br>
     *  <br>
     *  For hunting_group on return data "name" or concerned "id" with value "null" if the user/rvcpGroup/rvcpAutoAttendant is deleted, please remove the forward. <br>
     * @return {Promise<any>} the result.
     *
     */
    getGroupForwards (groupId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getGroupForwards (groupId ) ;
                that._logger.log("debug", "(getGroupForwards) - sent.");
                that._logger.log("internal", "(getGroupForwards) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getGroupForwards) Error.");
                that._logger.log("internalerror", LOG_ID + "(getGroupForwards) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @method getTheUserGroup
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @instance
     * @param {string} type Filter only groups of the given type. Possible values : hunting_group, manager_assistant
     * @description
     *  This API allows to retrieve the groups where the logged user is member. <br>
     *  For a hunting group, a user can have two roles inside the group: manager and/or agent. <br>
     *  For a manager_assistant group, a user can be manager OR assistant, not both. <br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object\[\] | Group Object |
     * | id  | String | Group unique identifier |
     * | type optionnel | String | Group type<br>Default value : `hunting_group`<br>Possible values : `hunting_group`, `manager_assistant` |
     * | name | String | Group name - displayed on the caller phone set for hunting group type |
     * | policy optionnel | String | Group policy - applicable to hunting group type only<br>Default value : `parallel`<br>Possible values : `serial`, `parallel`, `circular` |
     * | skippedGroups optionnel | String\[\] | List of group Identifier from which user has not been able to leave due to restrictions |
     * | members | Object\[\] | List of group members. |
     * | memberId | String | Member (user) unique identifier |
     * | displayName | String | Member display name |
     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
     * 
     */
    getTheUserGroup (type : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getTheUserGroup (type ) ;
                that._logger.log("debug", "(getTheUserGroup) - sent.");
                that._logger.log("internal", "(getTheUserGroup) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getTheUserGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(getTheUserGroup) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @method joinAGroup
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @instance
     * @param {string} groupId The group identifier to join.
     * @description
     *  This part of the API allows a user to join a group. <br>
     *  To be able to join in a group, the member must have been already declared inside the group, by a manager or an administrator. <br>
     *  Only the status of the member will be altered (idle to active). His roles will remain untouched (assistant, agent and/or manager). <br>
     *  Only users with role 'agent' or 'assistant' can join or leave a group. <br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Group Object |
     * | id  | String | Group unique identifier |
     * | type optionnel | String | Group type<br>Default value : `hunting_group`<br>Possible values : `hunting_group`, `manager_assistant` |
     * | name | String | Group name - displayed on the caller phone set for hunting group type |
     * | policy optionnel | String | Group policy - applicable to hunting group type only<br>Default value : `parallel`<br>Possible values : `serial`, `parallel`, `circular` |
     * | members | Object\[\] | List of group members. |
     * | memberId | String | Member (user) unique identifier |
     * | displayName | String | Member display name |*
     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
     * 
     */
    joinAGroup (groupId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.joinAGroup (groupId ) ;
                that._logger.log("debug", "(joinAGroup) - sent.");
                that._logger.log("internal", "(joinAGroup) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(joinAGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(joinAGroup) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @method joinAllGroups
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @instance
     * @description
     *  Allow a user to join all the groups he belongs to. <br>
     *  Only users of hunting groups with role 'agent' can leave all their groups in one go. <br>
     *  If user if already logged out of a given group, logout action for this group will be skipped. <br>
     * @return {Promise<any>} the result.
     *
     */
    joinAllGroups () {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.joinAllGroups ( ) ;
                that._logger.log("debug", "(joinAllGroups) - sent.");
                that._logger.log("internal", "(joinAllGroups) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(joinAllGroups) Error.");
                that._logger.log("internalerror", LOG_ID + "(joinAllGroups) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @method leaveAGroup
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @param {string} groupId The group identifier to leave.
     * @instance
     * @description
     *  This part of the API allows a user to leave a group. <br>
     *  To be able to leave in a group, a member must have been already declared inside the group, by a manager or an administrator. <br>
     *  Only the status of the member will be altered (active to idle). His roles will remain untouched (assistant, agent and/or manager). <br>
     *  Only users with role 'agent' or 'assistant' can join or leave a group. <br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Group Object |
     * | id  | String | Group unique identifier |
     * | type optionnel | String | Group type<br>Default value : `hunting_group`<br>Possible values : `hunting_group`, `manager_assistant` |
     * | name | String | Group name - displayed on the caller phone set for hunting group type |
     * | policy optionnel | String | Group policy - applicable to hunting group type only<br>Default value : `parallel`<br>Possible values : `serial`, `parallel`, `circular` |
     * | members | Object\[\] | List of group members. |
     * | memberId | String | Member (user) unique identifier |
     * | displayName | String | Member display name |
     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
     * 
     */
    leaveAGroup (groupId : string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.leaveAGroup (groupId ) ;
                that._logger.log("debug", "(leaveAGroup) - sent.");
                that._logger.log("internal", "(leaveAGroup) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(leaveAGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(leaveAGroup) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @method leaveAllGroups
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @instance
     * @description
     *  Allow a user to leave all the groups he belongs to. <br>
     *  Only users of hunting groups with role 'agent' can leave all their groups in one go. <br>
     *  If user if already logged out of a given group, logout action for this group will be skipped. <br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Group Object |
     * | id  | String | Group unique identifier |
     * | type optionnel | String | Group type<br>Default value : `hunting_group`<br>Possible values : `hunting_group`, `manager_assistant` |
     * | name | String | Group name - displayed on the caller phone set for hunting group type |
     * | policy optionnel | String | Group policy - applicable to hunting group type only<br>Default value : `parallel`<br>Possible values : `serial`, `parallel`, `circular` |
     * | members | Object\[\] | List of group members. |
     * | memberId | String | Member (user) unique identifier |
     * | displayName | String | Member display name |
     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
     * 
     */
    leaveAllGroups () {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.leaveAllGroups ( ) ;
                that._logger.log("debug", "(leaveAllGroups) - sent.");
                that._logger.log("internal", "(leaveAllGroups) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(leaveAllGroups) Error.");
                that._logger.log("internalerror", LOG_ID + "(leaveAllGroups) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @method removeMemberFromGroup
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @instance
     * @param {string} groupId Unique identifier of the Cloud PBX group to update
     * @param {string} memberId Unique identifier of the member to remove
     * @description
     *  This part of the API allows a manager to remove a member from a group. <br>
     * @return {Promise<any>} the result.
     *
     */
    removeMemberFromGroup (groupId : string, memberId : string) {
        let that = this;
        
        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.removeMemberFromGroup (groupId, memberId ) ;
                that._logger.log("debug", "(leaveAllGroups) - sent.");
                that._logger.log("internal", "(leaveAllGroups) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(leaveAllGroups) Error.");
                that._logger.log("internalerror", LOG_ID + "(leaveAllGroups) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @method retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @instance
     * @description
     *  Returns the number of read/unread messages for each hunting group where logged in user is a member. <br>
     * @return {Promise<any>} the result.
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object\[\] | Messages summary for each hunting group where logged in user is a member |
     * | groupId | String | Group identifier |
     * | groupName | String | Group name |
     * | messages | Object\[\] | List of read/unread messages per type |
     * | type | String | Messages type<br>Possible values : `voicemail`, `email`, `fax`, `video` |
     * | new | Number | Number of unread voice messages |
     * | old | Number | Number of read voice messages |
     * | totalByType | Object\[\] | Total of messages grouped by their type |
     * | type | String | Messages type<br>Possible values : `voicemail`, `email`, `fax`, `video` |
     * | new | Number | Unread messages sum for all group messages where logged in user is a member. |
     * | old | Number | Read messages sum for all group messages where logged in user is a member. |
     * 
     */
    retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser () {
        let that = this;
        
        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser () ;
                that._logger.log("debug", "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) - sent.");
                that._logger.log("internal", "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @method updateAVoiceMessageAssociatedToAGroup
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @instance
     * @param {string} groupId Unique identifier of the Cloud PBX group to update
     * @param {string} messageId Message Identifier
     * @param {string} read Mark the message as read or unread
     * @description
     *  Update the given voice message - mark it as read or unread When a message is 'unread', it is considered as a new message. On the opposite, a 'read' message is considered as an old message. <br>
     * @return {Promise<any>} the result.
     *
     */
    updateAVoiceMessageAssociatedToAGroup (groupId : string,   messageId  : string, read : boolean) {
        let that = this;
        
        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.updateAVoiceMessageAssociatedToAGroup (groupId,   messageId, read) ;
                that._logger.log("debug", "(updateAVoiceMessageAssociatedToAGroup) - sent.");
                that._logger.log("internal", "(updateAVoiceMessageAssociatedToAGroup) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @method updateAGroup
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @instance
     * @param {string} groupId Unique identifier of the Cloud PBX group to update
     * @param {string} externalNumberId Identifier of the public phone number assigned to the group - applicable to hunting group type only
     * @param {boolean} isEmptyAllowed Indicates if the last active member can leave the group or not - applicable to hunting group only.
     * @description
     *  This API allows a manager of to group to modify some settings of a Cloud PBX hunting group. <br>
     *  Modification can be done on the following settings of a group: <br>
     *  * Assign a public phone number to the group
     *  * Allow or not empty group
     *  <br>
     *  To assign a public number, the following steps should be performed: <br>
     *  * Retrieve the list of available phone numbers: (list DDI numbers from RVCP Provisioning portal)
     *  * Provide the externalNumberId of the selected phone number in the body of this update request
     * 
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Group Object |
     * | id  | String | Group unique identifier |
     * | type optionnel | String | Group type<br>Default value : `hunting_group`<br>Possible values : `hunting_group`, `manager_assistant` |
     * | name | String | Group name - displayed on the caller phone set for hunting group type |
     * | policy optionnel | String | Group policy - applicable to hunting group type only<br>Default value : `parallel`<br>Possible values : `serial`, `parallel`, `circular` |
     * | members | Object\[\] | List of group members. |
     * | memberId | String | Member (user) unique identifier |
     * | displayName | String | Member display name |
     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
     * 
     */
    updateAGroup (groupId : string, externalNumberId : string, isEmptyAllowed : boolean) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.updateAGroup (groupId , externalNumberId , isEmptyAllowed ) ;
                that._logger.log("debug", "(updateAGroup) - sent.");
                that._logger.log("internal", "(updateAGroup) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateAGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateAGroup) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @method updateGroupForward
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @instance
     * @param {string} groupId Unique identifier of the Cloud PBX group to update
     * @param {string} callForwardType The forward type to update. Only 'immediate' supported in case of manager_assistant group. Possible values : immediate, overflow
     * @param {string} destinationType The destination type. Mandatory for activation. 'managersecretary' only for manager_assistant. 'internalNumber', 'externalNumber', 'autoAttendant' only for hunting group. Possible values : internalnumber, externalnumber, autoattendant, managersecretary
     * @param {number} numberToForward The number to forward. Mandatory for destinationType = internalnumber or externalnumber.
     * @param {boolean} activate Activate or cancel a forward.
     * @param {number} noReplyDelay in case of 'overflow' forward type on parallel hunting group, timeout in seconds after which the call will be forwarded. Default value : 20. Possible values : {10-60}.
     * @param {Array<string>} managerIds List of manager ids to set forward on (Manager_assistant group type with destination type 'managersecretary' only. <br>
     *     For assistant(s) only).<br>
     *     If not provided, all active managers of the group will be concerned by this forward.
     * @param {string} rvcpAutoAttendantId Unique identifier of the auto attendant, only for hunting_group for autoAttendant destinationType
     * @description
     *  This API allows to update the forwards of a cloud PBX group. <br>
     *  Setting a forward on a group has different implications depending on the type of group. <br>
     *  For a **_hunting group_**, it implies setting a forward on the dedicated subscriber of the cloud PBX associated with the group. The supported forward types in this case are: 'immediate', 'overflow'. Overflow is: <br>
     *  <br>
     *  * for parallel: 'busy', 'noreply' and 'unavailable'
     *  * for others: 'busy', unavailable'
     *    Only user with manager role inside the hunting group can set up a forward for the group. <br>
     *  Forward destinations are limited to externalNumber, autoAttendant and internalNumber for hunting group. <br>
     *  <br>
     *  For a **_manager_assistant group_**, only 'immediate' forward type to 'managersecretary' destination is allowed in this API. <br>
     *  When requested by an assistant, update of the forward will be sent to every active managers of the group, unless filtered by the 'managerIds' parameter. <br>
     *  When requested by a manager, only its own forward is concerned ('managerIds' parameter is not used). <br>
     *  <br>
     *  Additional remarks on group forward: <br>
     *  <br>
     *  * Users can access their forwards from the dedicated forward API ([Voice Forward](#api-Voice_Forward))
     *  * ...but only this API allows to deal with the 'managersecretary' for destination type (as an assistant to set or cancel the DND of its manager(s), or as the manager itself)
     *  * Setting DND on a manager will then override its previous immediate forward (if set). After cancelling the DND, the previous forward will NOT be restored.
     *  * When setting a noreply forward, providing a noReplyDelay timeout, pay attention that this timeout can be later changed if hunting group changes (add / remove member).
     *  * In manager_assistant groups, if forward is activated and the group is then modified, the forward will be cancelled if there are no longer any active assistants after the modification.
     *  * A forward can be indirectly cancelled after a group modification (case of manager_assistant group, with assistant(s) no longer active).
     *
     * @return {Promise<any>} the result.
     *
     */
    updateGroupForward (groupId : string,   callForwardType  : string, destinationType : string, numberToForward : number, activate : boolean, noReplyDelay : number, managerIds : Array<string>, rvcpAutoAttendantId : string ) {
        let that = this;
        
        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.updateGroupForward (groupId, callForwardType, destinationType, numberToForward, activate, noReplyDelay, managerIds, rvcpAutoAttendantId ) ;
                that._logger.log("debug", "(updateGroupForward) - sent.");
                that._logger.log("internal", "(updateGroupForward) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateGroupForward) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateGroupForward) Error : ", err);
                return reject(err);
            }
        });
    }
    
    /**
     * @method updateGroupMember
     * @async
     * @category Rainbow Voice Cloud PBX group
     * @instance
     * @param {string} groupId Unique identifier of the Cloud PBX group to update
     * @param {string} memberId Unique identifier of the group member
     * @param {number} position Position of the user inside a serial group, from 1 to last. Meaningless in case of parallel hunting group
     * @param {Array<string>} roles Member roles inside the group. Default value : agent. Possible values : agent, manager, assistant
     * @param {string} status Member status inside the group. Default value : active. Possible values : active, idle
     * @description
     *  This part of the API allows a manager to update a member inside a group. <br>
     *  Update consists in changing the status of the member, or its roles, or its position inside the group. <br>
     *  Some updates are specific to the type of group: <br>
     *  * Hunting group only can support several roles for a member (e.g. manager and agent)
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Group Object |
     * | id  | String | Group unique identifier |
     * | type optionnel | String | Group type<br>Default value : `hunting_group`<br>Possible values : `hunting_group`, `manager_assistant` |
     * | name | String | Group name - displayed on the caller phone set for hunting group type |
     * | policy optionnel | String | Group policy - applicable to hunting group type only<br>Default value : `parallel`<br>Possible values : `serial`, `parallel`, `circular` |
     * | members | Object\[\] | List of group members. |
     * | memberId | String | Member (user) unique identifier |
     * | displayName | String | Member display name |
     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
     * 
     */
    updateGroupMember (groupId : string,   memberId  : string, position  : number, roles : Array<string>, status : string ) {
        let that = this;
        
        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.updateGroupMember (groupId,   memberId, position, roles, status ) ;
                that._logger.log("debug", "(updateGroupMember) - sent.");
                that._logger.log("internal", "(updateGroupMember) - result : ", result);

                resolve (result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateGroupMember) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateGroupMember) Error : ", err);
                return reject(err);
            }
        });
    }
    
    //endregion Rainbow Voice Cloud PBX group

    /*
    //region Rainbow Voice Personal Routines    

    activatePersonalRoutine (routineId : string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId/activate     
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Activate_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(activatePersonalRoutine) routineId : ", routineId);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/personalroutines/" + routineId + "/activate", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(activatePersonalRoutine) successfull");
                that.logger.log("internal", LOG_ID + "(activatePersonalRoutine) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(activatePersonalRoutine) error.");
                that.logger.log("internalerror", LOG_ID, "(activatePersonalRoutine) error : ", err);
                return reject(err);
            });
        });
    }

    getPersonalRoutineData (routineId : string) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId 
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Get_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/personalroutines/" + routineId ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getPersonalRoutineData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getPersonalRoutineData) successfull");
                that.logger.log("internal", LOG_ID + "(getPersonalRoutineData) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getPersonalRoutineData) error");
                that.logger.log("internalerror", LOG_ID, "(getPersonalRoutineData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllPersonalRoutines () {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines 
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Get_PersonalRoutines
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/personalroutines/" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getAllPersonalRoutines) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAllPersonalRoutines) successfull");
                that.logger.log("internal", LOG_ID + "(getAllPersonalRoutines) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllPersonalRoutines) error");
                that.logger.log("internalerror", LOG_ID, "(getAllPersonalRoutines) error : ", err);
                return reject(err);
            });
        });
    }

    updatePersonalRoutineData (routineId : string, dndPresence : boolean, name : string, deviceMode : {manage : boolean, mode : string}, immediateCallForward : {manage : boolean, activate : boolean, number  : string, destinationType : string}, noreplyCallForward : { manage : boolean, activate : boolean, number : string, destinationType : string, noReplyDelay : number}, huntingGroups : { withdrawAll : boolean} ) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId 
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Update_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(updatePersonalRoutineData) routineId : ", routineId + ", name : ", name );
            let data = {
                dndPresence,
                name,
                deviceMode,
                immediateCallForward,
                noreplyCallForward,
                huntingGroups
            };
            that.http.put("/api/rainbow/voice/v1.0/personalroutines/" + routineId, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updatePersonalRoutineData) successfull");
                that.logger.log("internal", LOG_ID + "(updatePersonalRoutineData) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updatePersonalRoutineData) error.");
                that.logger.log("internalerror", LOG_ID, "(updatePersonalRoutineData) error : ", err);
                return reject(err);
            });
        });
    }
    // */

    //endregion Rainbow Voice Personal Routines    
/*
    //region Rainbow Voice Routing

    manageUserRoutingData (destinations  : Array<string>, currentDeviceId : string ) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/routing 
        // API https://api.openrainbow.org/voice/#api-Routing-Set_Routing
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(manageUserRoutingData) destinations : ", destinations + ", currentDeviceId : ", currentDeviceId );
            let data = {
                destinations ,
                currentDeviceId
            };
            that.http.put("/api/rainbow/voice/v1.0/routing", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(manageUserRoutingData) successfull");
                that.logger.log("internal", LOG_ID + "(manageUserRoutingData) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(manageUserRoutingData) error.");
                that.logger.log("internalerror", LOG_ID, "(manageUserRoutingData) error : ", err);
                return reject(err);
            });
        });
    }

    retrievetransferRoutingData (calleeId : string, addresseeId ? : string, addresseePhoneNumber ? : string) {
        // GET    https://openrainbow.com/api/rainbow/voice/v1.0/transfer-routing
        // API https://api.openrainbow.org/voice/#api-Routing-Get_Transfer_Routing
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/transfer-routing" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "calleeId", calleeId );
            addParamToUrl(urlParamsTab, "addresseeId", addresseeId );
            addParamToUrl(urlParamsTab, "addresseePhoneNumber", addresseePhoneNumber );
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrievetransferRoutingData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrievetransferRoutingData) successfull");
                that.logger.log("internal", LOG_ID + "(retrievetransferRoutingData) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrievetransferRoutingData) error");
                that.logger.log("internalerror", LOG_ID, "(retrievetransferRoutingData) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveUserRoutingData () {
        // GET  https://api.openrainbow.org/api/rainbow/voice/v1.0/routing
        // API https://api.openrainbow.org/voice/#api-Routing-Get_Routing
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/routing" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveUserRoutingData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveUserRoutingData) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveUserRoutingData) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveUserRoutingData) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveUserRoutingData) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Routing    

    //region Rainbow Voice Voice


    addParticipant3PCC(callId : string, callData : { callee : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/participants     
        // API https://api.openrainbow.org/voice/#api-Voice-Add_participant
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(addParticipant3PCC) callId : ", callId, ", callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/participants", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(addParticipant3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(addParticipant3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(addParticipant3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(addParticipant3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    answerCall3PCC(callId : string, callData : { legId : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/answer     
        // API https://api.openrainbow.org/voice/#api-Voice-Answer_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(answerCall3PCC) callId : ", callId, ", callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/participants", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(answerCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(answerCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(answerCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(answerCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    blindTransferCall3PCC(callId : string, callData : {destination : { userId : string , resource : string}}) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/blind-transfer     
        // API https://api.openrainbow.org/voice/#api-Voice-Blind_Transfer_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(blindTransferCall3PCC) callId : ", callId, ", callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/participants", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(blindTransferCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(blindTransferCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(blindTransferCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(blindTransferCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    deflectCall3PCC(callId : string, callData : { destination : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/deflect     
        // API https://api.openrainbow.org/voice/#api-Voice-Deflect_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(deflectCall3PCC) callId : ", callId, ", callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/deflect", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(deflectCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(deflectCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deflectCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(deflectCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    holdCall3PCC(callId : string, callData : { legId : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/hold     
        // API https://api.openrainbow.org/voice/#api-Voice-Hold_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(holdCall3PCC) callId : ", callId, ", callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/hold", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(holdCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(holdCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(holdCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(holdCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    makeCall3PCC(callData : {deviceId : string,
        callerAutoAnswer : boolean,
        anonymous : boolean,
        calleeExtNumber : string,
        calleePbxId : string,
        calleeShortNumber : string,
        calleeCountry : string,
        dialPadCalleeNumber : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls     
        // API https://api.openrainbow.org/voice/#api-Voice-Make_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(makeCall3PCC) callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(makeCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(makeCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(makeCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(makeCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    mergeCall3PCC(activeCallId : string, callData : { heldCallId : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:activeCallId/merge     
        // API https://api.openrainbow.org/voice/#api-Voice-Merge_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(mergeCall3PCC) activeCallId : ", activeCallId);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/calls/" + activeCallId + "/merge", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(mergeCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(mergeCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(mergeCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(mergeCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    pickupCall3PCC(callData : {deviceId : string,
        callerAutoAnswer : boolean,
        calleeShortNumber  : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/pickup
        // API https://api.openrainbow.org/voice/#api-Voice-Pickup_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(pickupCall3PCC) callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/pickup", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(pickupCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(pickupCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(pickupCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(pickupCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    releaseCall3PCC(callId : string, legId : string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId      
        // API https://api.openrainbow.org/voice/#api-Voice-Release_call
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/calls/" + callId;
            url += legId? "?legId=" + legId : "";
            that.http.delete( url, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(releaseCall3PCC) (" + callId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(releaseCall3PCC) (" + callId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(releaseCall3PCC) (" + callId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    retrieveCall3PCC(callId : string, callData : {legId : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/retrieve
        // API https://api.openrainbow.org/voice/#api-Voice-Retrieve_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(retrieveCall3PCC) callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/retrieve", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(retrieveCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(retrieveCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    sendDTMF3PCC(callId : string, callData : {legId : string, digits : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/senddtmf
        // API https://api.openrainbow.org/voice/#api-Voice-Send_DTMF
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(sendDTMF3PCC) callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/senddtmf", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(sendDTMF3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(sendDTMF3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(sendDTMF3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(sendDTMF3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    snapshot3PCC(callId  : string, deviceId : string, seqNum : number ) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/snapshot 
        // API https://api.openrainbow.org/voice/#api-Voice-SnapshotCall
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/snapshot" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "callId", callId + "");
            addParamToUrl(urlParamsTab, "deviceId", deviceId + "");
            addParamToUrl(urlParamsTab, "seqNum", seqNum + "");
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(snapshot3PCC) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(snapshot3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(snapshot3PCC) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(snapshot3PCC) error");
                that.logger.log("internalerror", LOG_ID, "(snapshot3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    transferCall3PCC(activeCallId : string, callData : {heldCallId : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:activeCallId/transfer
        // API https://api.openrainbow.org/voice/#api-Voice-Transfer_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(transferCall3PCC) callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + activeCallId + "/transfer", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(transferCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(transferCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(transferCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(transferCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAVoiceMessage(messageId : string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/messages/:messageId
        // API https://api.openrainbow.org/voice/#api-Voice-DeleteVoiceMailMessage
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/messages/" + messageId;
            that.http.delete( url, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(deleteAVoiceMessage) (" + messageId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(deleteAVoiceMessage) (" + messageId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(deleteAVoiceMessage) (" + messageId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    deleteAllVoiceMessages(messageId : string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/messages
        // API https://api.openrainbow.org/voice/#api-Voice-DeleteVoiceMailMessages
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/messages";
            that.http.delete( url, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(deleteAllVoiceMessages) (" + messageId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(deleteAllVoiceMessages) (" + messageId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(deleteAllVoiceMessages) (" + messageId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getEmergencyNumbersAndEmergencyOptions() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/emergency-numbers 
        // API https://api.openrainbow.org/voice/#api-Voice-EmergencyNumbers
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/emergency-numbers" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getEmergencyNumbersAndEmergencyOptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getEmergencyNumbersAndEmergencyOptions) successfull");
                that.logger.log("internal", LOG_ID + "(getEmergencyNumbersAndEmergencyOptions) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getEmergencyNumbersAndEmergencyOptions) error");
                that.logger.log("internalerror", LOG_ID, "(getEmergencyNumbersAndEmergencyOptions) error : ", err);
                return reject(err);
            });
        });
    }

    getVoiceMessages(limit : number,
                     offset : number,
                     sortField : string,
                     sortOrder : number,
                     fromDate : string,
                     toDate : string,
                     callerName : string,
                     callerNumber : string ) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/messages
        // API https://api.openrainbow.org/voice/#api-Voice-GetVoiceMessages
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/messages" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField + "");
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getVoiceMessages) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getVoiceMessages) successfull");
                that.logger.log("internal", LOG_ID + "(getVoiceMessages) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getVoiceMessages) error");
                that.logger.log("internalerror", LOG_ID, "(getVoiceMessages) error : ", err);
                return reject(err);
            });
        });
    }

    getUserDevices( ) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/devices
        // API https://api.openrainbow.org/voice/#api-Voice-Devices
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/devices" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getUserDevices) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getUserDevices) successfull");
                that.logger.log("internal", LOG_ID + "(getUserDevices) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getUserDevices) error");
                that.logger.log("internalerror", LOG_ID, "(getUserDevices) error : ", err);
                return reject(err);
            });
        });
    }

    updateVoiceMessage(messageId : string,   urlData : { read   : boolean }) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/messages/:messageId 
        // API https://api.openrainbow.org/voice/#api-Voice-UpdateVoiceMessage
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(updateVoiceMessage) messageId : ", messageId + ", urlData : ", urlData );
            let data = {
            };
            that.http.put("/api/rainbow/voice/v1.0/messages/" + messageId, that.getRequestHeader(), urlData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateVoiceMessage) successfull");
                that.logger.log("internal", LOG_ID + "(updateVoiceMessage) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateVoiceMessage) error.");
                that.logger.log("internalerror", LOG_ID, "(updateVoiceMessage) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Voice    

    //region Rainbow Voice Voice Forward

    forwardCall(callForwardType : string, userId :string,  urlData : { destinationType :string, number : string, activate : boolean, noReplyDelay : number }) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/forwards/:callForwardType 
        // API https://api.openrainbow.org/voice/#api-Voice_Forward-Forward_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(forwardCall) callForwardType : ", callForwardType + ", urlData : ", urlData );
            let url : string = "/api/rainbow/voice/v1.0/forwards/" + callForwardType ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);


            addParamToUrl(urlParamsTab, "userId ", userId  + "");
            url = urlParamsTab[0];
            let data = {
            };
            that.http.put(url, that.getRequestHeader(), urlData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(forwardCall) successfull");
                that.logger.log("internal", LOG_ID + "(forwardCall) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(forwardCall) error.");
                that.logger.log("internalerror", LOG_ID, "(forwardCall) error : ", err);
                return reject(err);
            });
        });
    }

    getASubscriberForwards( userId :string) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/forwards 
        // API https://api.openrainbow.org/voice/#api-Voice_Forward-Get_Subscriber_call_forwards
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(getASubscriberForwards) userId : ", userId );
            let url : string = "/api/rainbow/voice/v1.0/forwards" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);


            addParamToUrl(urlParamsTab, "userId ", userId  + "");
            url = urlParamsTab[0];
            let data = {
            };
            that.http.put(url, that.getRequestHeader(), {}, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getASubscriberForwards) successfull");
                that.logger.log("internal", LOG_ID + "(getASubscriberForwards) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getASubscriberForwards) error.");
                that.logger.log("internalerror", LOG_ID, "(getASubscriberForwards) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Voice Forward

    //region Rainbow Voice Voice Search Hunting Groups

    searchCloudPBXhuntingGroups( name :string) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/search/huntinggroups 
        // API https://api.openrainbow.org/voice/#api-Voice_Search_Hunting_Groups-Get_Cloud_PBX_Hunting_Groups
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(searchCloudPBXhuntingGroups) name : ", name );
            let url : string = "/api/rainbow/voice/v1.0/search/huntinggroups" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);


            addParamToUrl(urlParamsTab, "name", name + "");
            url = urlParamsTab[0];
            let data = {
            };
            that.http.put(url, that.getRequestHeader(), {}, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(searchCloudPBXhuntingGroups) successfull");
                that.logger.log("internal", LOG_ID + "(searchCloudPBXhuntingGroups) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(searchCloudPBXhuntingGroups) error.");
                that.logger.log("internalerror", LOG_ID, "(searchCloudPBXhuntingGroups) error : ", err);
                return reject(err);
            });
        });
    }

    // */

    //endregion Rainbow Voice Voice Search Hunting Groups

    //endregion Rainbow Voice

}

module.exports.RBVoiceService = RBVoiceService;
export {RBVoiceService as RBVoiceService};

