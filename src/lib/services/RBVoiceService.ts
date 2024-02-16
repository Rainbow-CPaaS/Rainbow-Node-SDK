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
import {RBVoiceEventHandler} from "../connection/XMPPServiceHandler/RBVoiceEventHandler.js";

export {};

const LOG_ID = "RBVOICE/SVCE - ";

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

    private rbvoiceEventHandler: RBVoiceEventHandler;
    private rbvoiceHandlerToken: any;


    static getClassName() { return 'RBVoiceService'; }
    getClassName() { return RBVoiceService.getClassName(); }

    static getAccessorName(){ return 'rbvoice'; }
    getAccessorName(){ return RBVoiceService.getAccessorName(); }

    constructor(_core:Core, _eventEmitter: EventEmitter, _http: any, _logger: Logger, _startConfig: {
        start_up: boolean,
        optional: boolean
    }) {
        super(_logger, LOG_ID);
        this.setLogLevels(this);
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

        this._core = _core;

        this.avatarDomain = this._host.split(".").length===2 ? this._protocol + "://cdn." + this._host + ":" + this._port:this._protocol + "://" + this._host + ":" + this._port;

        this._eventEmitter.on("evt_internal_rbvoiceevent", this._onEventRBVoice.bind(this));
        // this._eventEmitter.on("evt_internal_deleterbvoice", this.onDeleteRBVoice.bind(this));

    }

    start(_options) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService, _contacts : ContactsService, _profileService : ProfilesService
        let that = this;
        that.initStartDate();

        return new Promise(async function (resolve, reject) {
            try {
                that._xmpp = that._core._xmpp;
                that._rest = that._core._rest;
                that._options = _options;
                that._s2s = that._core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                //that._rbvoice = [];
                that.attachHandlers();
                that.setStarted();
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
                that.setStopped();
                resolve(undefined);
            } catch (err) {
                return reject(err);
            }
        });
    }

    async init(useRestAtStartup : boolean) {
        let that = this;
        that.setInitialized();
    }

    attachHandlers() {
        let that = this;
        that.rbvoiceEventHandler = new RBVoiceEventHandler(that._xmpp, that._core);
        that.rbvoiceHandlerToken = [
            PubSub.subscribe( that._xmpp.hash + "." + that.rbvoiceEventHandler.MESSAGE, that.rbvoiceEventHandler.onMessageReceived.bind(that.rbvoiceEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that.rbvoiceEventHandler.MESSAGE_MANAGEMENT, that.rbvoiceEventHandler.onManagementMessageReceived.bind(that.rbvoiceEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that.rbvoiceEventHandler.MESSAGE_HEADLINE, that.rbvoiceEventHandler.onHeadlineMessageReceived.bind(that.rbvoiceEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that.rbvoiceEventHandler.MESSAGE_ERROR, that.rbvoiceEventHandler.onErrorMessageReceived.bind(that.rbvoiceEventHandler))
        ];
    }

    //region Rainbow Voice

    //region Rainbow Events

    _onEventRBVoice (data) {
        let that = this;
        that._logger.log("internal", "(_onEventRBVoice) - data : ", data);
        that._eventEmitter.emit("evt_internal_onrbvoiceevent", data);
    }
    
    //endregion Rainbow Events

    //region Rainbow Voice CLI Options

    /**
     * @public
     * @nodered true
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
    retrieveAllAvailableCallLineIdentifications() {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveAllAvailableCallLineIdentifications();
                that._logger.log("debug", "(retrieveAllAvailableCallLineIdentifications) - sent.");
                that._logger.log("internal", "(retrieveAllAvailableCallLineIdentifications) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveAllAvailableCallLineIdentifications) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveAllAvailableCallLineIdentifications) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method retrieveCurrentCallLineIdentification
     * @async
     * @category Rainbow Voice CLI Options
     * @instance
     * @description
     * This api returns current Call line identification. <br>
     * @return {Promise<any>}
     */
    retrieveCurrentCallLineIdentification() {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveCurrentCallLineIdentification();
                that._logger.log("debug", "(retrieveCurrentCallLineIdentification) - sent.");
                that._logger.log("internal", "(retrieveCurrentCallLineIdentification) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveCurrentCallLineIdentification) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveCurrentCallLineIdentification) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
    setCurrentActiveCallLineIdentification(policy: string, phoneNumberId?: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.setCurrentActiveCallLineIdentification(policy, phoneNumberId);
                that._logger.log("debug", "(setCurrentActiveCallLineIdentification) - sent.");
                that._logger.log("internal", "(setCurrentActiveCallLineIdentification) - result : ", result);

                resolve(result);
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
     * @public
     * @nodered true
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
    addMemberToGroup(groupId: string, memberId: string, position: number, roles: [], status: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.addMemberToGroup(groupId, memberId, position, roles, status);
                that._logger.log("debug", "(addMemberToGroup) - sent.");
                that._logger.log("internal", "(addMemberToGroup) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(addMemberToGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(addMemberToGroup) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
    deleteVoiceMessageAssociatedToAGroup(groupId: string, messageId: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.deleteVoiceMessageAssociatedToAGroup(groupId, messageId);
                that._logger.log("debug", "(deleteVoiceMessageAssociatedToAGroup) - sent.");
                that._logger.log("internal", "(deleteVoiceMessageAssociatedToAGroup) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(deleteVoiceMessageAssociatedToAGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(deleteVoiceMessageAssociatedToAGroup) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
    getVoiceMessagesAssociatedToGroup(groupId: string, limit: number = 100, offset: number = 0, sortField: string = "name", sortOrder: number, fromDate: string, toDate: string, callerName: string, callerNumber: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getVoiceMessagesAssociatedToGroup(groupId, limit, offset, sortField, sortOrder, fromDate, toDate, callerName, callerNumber);
                that._logger.log("debug", "(getVoiceMessagesAssociatedToGroup) - sent.");
                that._logger.log("internal", "(getVoiceMessagesAssociatedToGroup) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getVoiceMessagesAssociatedToGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(getVoiceMessagesAssociatedToGroup) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
    getGroupForwards(groupId: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getGroupForwards(groupId);
                that._logger.log("debug", "(getGroupForwards) - sent.");
                that._logger.log("internal", "(getGroupForwards) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getGroupForwards) Error.");
                that._logger.log("internalerror", LOG_ID + "(getGroupForwards) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
    getTheUserGroup(type: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getTheUserGroup(type);
                that._logger.log("debug", "(getTheUserGroup) - sent.");
                that._logger.log("internal", "(getTheUserGroup) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getTheUserGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(getTheUserGroup) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
     * | displayName | String | Member display name |
     * | roles optionnel | String\[\] | Member role inside the group<br>Default value : `[agent`<br>Possible values : `manager`, `agent`, `assistant` |
     * | status optionnel | String | Member status inside the group<br>Default value : `active`<br>Possible values : `active`, `idle` |
     *
     */
    joinAGroup(groupId: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.joinAGroup(groupId);
                that._logger.log("debug", "(joinAGroup) - sent.");
                that._logger.log("internal", "(joinAGroup) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(joinAGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(joinAGroup) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
    joinAllGroups() {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.joinAllGroups();
                that._logger.log("debug", "(joinAllGroups) - sent.");
                that._logger.log("internal", "(joinAllGroups) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(joinAllGroups) Error.");
                that._logger.log("internalerror", LOG_ID + "(joinAllGroups) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
    leaveAGroup(groupId: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.leaveAGroup(groupId);
                that._logger.log("debug", "(leaveAGroup) - sent.");
                that._logger.log("internal", "(leaveAGroup) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(leaveAGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(leaveAGroup) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
    leaveAllGroups() {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.leaveAllGroups();
                that._logger.log("debug", "(leaveAllGroups) - sent.");
                that._logger.log("internal", "(leaveAllGroups) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(leaveAllGroups) Error.");
                that._logger.log("internalerror", LOG_ID + "(leaveAllGroups) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
    removeMemberFromGroup(groupId: string, memberId: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.removeMemberFromGroup(groupId, memberId);
                that._logger.log("debug", "(leaveAllGroups) - sent.");
                that._logger.log("internal", "(leaveAllGroups) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(leaveAllGroups) Error.");
                that._logger.log("internalerror", LOG_ID + "(leaveAllGroups) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
    retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser() {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser();
                that._logger.log("debug", "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) - sent.");
                that._logger.log("internal", "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
    updateAVoiceMessageAssociatedToAGroup(groupId: string, messageId: string, read: boolean) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.updateAVoiceMessageAssociatedToAGroup(groupId, messageId, read);
                that._logger.log("debug", "(updateAVoiceMessageAssociatedToAGroup) - sent.");
                that._logger.log("internal", "(updateAVoiceMessageAssociatedToAGroup) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
    updateAGroup(groupId: string, externalNumberId: string, isEmptyAllowed: boolean) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.updateAGroup(groupId, externalNumberId, isEmptyAllowed);
                that._logger.log("debug", "(updateAGroup) - sent.");
                that._logger.log("internal", "(updateAGroup) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateAGroup) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateAGroup) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
    updateGroupForward(groupId: string, callForwardType: string, destinationType: string, numberToForward: number, activate: boolean, noReplyDelay: number, managerIds: Array<string>, rvcpAutoAttendantId: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.updateGroupForward(groupId, callForwardType, destinationType, numberToForward, activate, noReplyDelay, managerIds, rvcpAutoAttendantId);
                that._logger.log("debug", "(updateGroupForward) - sent.");
                that._logger.log("internal", "(updateGroupForward) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateGroupForward) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateGroupForward) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
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
    updateGroupMember(groupId: string, memberId: string, position: number, roles: Array<string>, status: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.updateGroupMember(groupId, memberId, position, roles, status);
                that._logger.log("debug", "(updateGroupMember) - sent.");
                that._logger.log("internal", "(updateGroupMember) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateGroupMember) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateGroupMember) Error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Rainbow Voice Cloud PBX group

    //region Rainbow Voice Deskphones

    /**
     * @public
     * @nodered true
     * @method activateDeactivateDND
     * @async
     * @category Rainbow Voice Deskphones
     * @instance
     * @param {string} activate Set to "true" to activate or "false' to deactivate user DND.
     * @description
     *  This API allows logged in user to activate or deactivate his DND state. <br>
     * @return {Promise<any>} the result.
     */
    activateDeactivateDND(activate: boolean) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.activateDeactivateDND(activate);
                that._logger.log("debug", "(activateDeactivateDND) - sent.");
                that._logger.log("internal", "(activateDeactivateDND) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(activateDeactivateDND) Error.");
                that._logger.log("internalerror", LOG_ID + "(activateDeactivateDND) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method configureAndActivateDeactivateForward
     * @async
     * @category Rainbow Voice Deskphones
     * @instance
     * @param {string} callForwardType The forward type to update. Possible values : immediate, busy, noreply .
     * @param {string} type The destination type (Optional in case of deactivation)). Possible values : number, voicemail .
     * @param {string} number Forward destination number (Optional if forward destination type is voicemail).
     * @param {number} timeout In case of noreply forward type, timeout in seconds after which the call will be forwarded. Default value : 20 . Possible values : {10-60} .
     * @param {boolean} activated Activate or deactivate current forward.
     * @description
     *  This API allows logged in user to activate or deactivate a forward. <br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | type optionnel | String | The destination type (Optional in case of deactivation)).<br>Possible values : `number`, `voicemail` |
     * | number optionnel | String | Forward destination number (Optional if forward destination type is `voicemail`). |
     * | timeout optionnel | Number | In case of `noreply` forward type, timeout in seconds after which the call will be forwarded.<br>Default value : `20`<br>Possible values : `{10-60}` |
     * | activated | Boolean | Activate or deactivate current forward. |
     *
     */
    configureAndActivateDeactivateForward(callForwardType: string, type: string, number: string, timeout: number = 20, activated: boolean) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.configureAndActivateDeactivateForward(callForwardType, type, number, timeout, activated);
                that._logger.log("debug", "(configureAndActivateDeactivateForward) - sent.");
                that._logger.log("internal", "(configureAndActivateDeactivateForward) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(configureAndActivateDeactivateForward) Error.");
                that._logger.log("internalerror", LOG_ID + "(configureAndActivateDeactivateForward) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method retrieveActiveForwards
     * @async
     * @category Rainbow Voice Deskphones
     * @instance
     * @description
     *  This API allows logged in user to retrieve his active forwards. <br>
     * @return {Promise<any>} the result.
     *
     */
    retrieveActiveForwards() {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveActiveForwards();
                that._logger.log("debug", "(retrieveActiveForwards) - sent.");
                that._logger.log("internal", "(retrieveActiveForwards) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveActiveForwards) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveActiveForwards) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method retrieveDNDState
     * @async
     * @category Rainbow Voice Deskphones
     * @instance
     * @description
     *  This API allows logged in user to retrieve his DND state. <br>
     * @return {Promise<any>} the result.
     *
     */
    retrieveDNDState() {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveDNDState();
                that._logger.log("debug", "(retrieveDNDState) - sent.");
                that._logger.log("internal", "(retrieveDNDState) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveDNDState) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveDNDState) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method searchUsersGroupsContactsByName
     * @async
     * @category Rainbow Voice Deskphones
     * @param {string} displayName Search users, groups, contacts on the given name.
     * @param {number} limit Allow to specify the number of users, groups or contacts to retrieve (Max: 50). Default value : 20
     * @instance
     * @description
     * This API allows to retrieve phone numbers associated to Rainbow users, groups, Office365 contacts and external directories contacts. <br>
     * <br>
     * Search by displayName (query parameter `displayName`):<br>
     *  * The search is done on users/contacts' \`firstName\` and \`lastName\`, and search is done in
     *    * all Rainbow public users and users being in companies visible by logged in user's company,
     *    * external directories (like Office365) linked to logged in user's company.
     *  <br>
     *  * If logged in user's has visibility \`closed\` or \`isolated\`, or \`same\_than\_company\` and logged in user's company has visibility \`closed\` or \`isolated\`, search is done only on users being in companies visible by logged in user's company.<br>
     *  * Search on display name can be:<br>
     *    * firstName and lastName exact match (ex: 'John Doe' find 'John Doe')
     *    * partial match (ex: 'Jo Do' find 'John Doe')
     *    * case insensitive (ex: 'john doe' find 'John Doe')
     *    * accents insensitive (ex: 'herve mothe' find 'Hervé Mothé')
     *    * on only firstname or lastname (ex: 'john' find 'John Doe')
     *    * order firstname / lastname does not matter (ex: 'doe john' find 'John Doe').
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object\[\] | List of user, group, contact Objects. |
     * | firstName optionnel | String | User, contact first name |
     * | lastName optionnel | String | User, contact last name |
     * | companyName optionnel | String | User company name if known and different of logged in user company |
     * | displayName | String | User, group, contact display name |
     * | category | String | Specify where user, group or contact has been found<br>Possible values : `my_company`, `other_company`, `other_directory` |
     * | phonenumbers | Object\[\] | List of phone numbers linked to user, group or contact |
     * | number | String | User, group or contact phone number |
     * | type | String | Phone number type<br>Possible values : `home`, `work`, `other` |
     * | deviceType optionnel | String | Device type<br>Possible values : `landline`, `mobile`, `fax`, `other` |
     *
     */
    searchUsersGroupsContactsByName(displayName: string, limit: number) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.searchUsersGroupsContactsByName(displayName, limit);
                that._logger.log("debug", "(searchUsersGroupsContactsByName) - sent.");
                that._logger.log("internal", "(searchUsersGroupsContactsByName) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(searchUsersGroupsContactsByName) Error.");
                that._logger.log("internalerror", LOG_ID + "(searchUsersGroupsContactsByName) Error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Rainbow Voice Deskphones

    //region Rainbow Voice Personal Routines    

    /**
     * @public
     * @nodered true
     * @method activatePersonalRoutine
     * @async
     * @category Rainbow Voice Personal Routines
     * @instance
     * @param {string} routineId A user routine unique identifier.
     * @description
     *  This api activate a user's personal routine. <br>
     *  A supervisor can request to activate the personal routine of a user by providing its identifier as a parameter. <br>
     *  The requesting user must be supervisor of the given supervised user.
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Detailed information about Rvcp Personal Routines |
     * | routines | Object\[\] | Routines data array of routine objects |
     * | id  | String | Routine unique identifier |
     * | name | String | Name of the routine |
     * | type optionnel | String | Type of routine<br>Possible values : `At`, `work`, `Out`, `of`, `office`, `On`, `break`, `Custom` |
     * | active | Boolean | Is the routine activated<br>Default value : `false` |
     * | inSync | Boolean | Boolean to know if last activation or active routine update is done |
     * | issuesLastSync | Object | Indications about issues last activation or active routine update |
     * | dndPresence | Boolean |     |
     * | presence | Boolean |     |
     * | cliOptions | Boolean |     |
     * | deviceMode | Boolean |     |
     * | immediateCallForward | Boolean |     |
     * | busyCallForward | Boolean |     |
     * | noreplyCallForward | Boolean |     |
     * | huntingGroups | Boolean |     |
     *
     */
    activatePersonalRoutine(routineId: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.activatePersonalRoutine(routineId);
                that._logger.log("debug", "(activatePersonalRoutine) - sent.");
                that._logger.log("internal", "(activatePersonalRoutine) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(activatePersonalRoutine) Error.");
                that._logger.log("internalerror", LOG_ID + "(activatePersonalRoutine) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method createCustomPersonalRoutine
     * @async
     * @category Rainbow Voice Personal Routines
     * @instance
     * @param {string} name Name of the new routine between 1 and 255 characters.
     * @description
     *  This api create a user's custom personal routine. <br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Detailed information about Rvcp Personal Routines |
     * | type optionnel | String | Type of routine<br>Possible values : `At`, `work`, `Out`, `of`, `office`, `On`, `break`, `Custom` |
     * | id  | String | Routine unique identifier |
     * | active | Boolean | Is the routine activated<br>Default value : `false` |
     * | name | String | Name of the routine |
     * | dndPresence | Boolean | If set to true, on routine activation the presence will be set to "dnd", if false "online", soon deprecated with presence object<br>Default value : `true` |
     * | deviceMode | Object | Device mode data |
     * | manage | Boolean | Is device mode managed on routine activation<br>Default value : `false` |
     * | mode | String | Device mode value, same choice(s) as in Rainbow GUI<br>Default value : `computer`<br>Possible values : `computer`, `office_phone` |
     * | immediateCallForward | Object | Immediate call forward data |
     * | manage | Boolean | Is immediate call forward managed on routine activation<br>Default value : `false` |
     * | callForwardType | String | Default value : `immediate` |
     * | activate | Boolean | Default value : `false` |
     * | number | String | Default value : `null` |
     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber` |
     * | busyCallForward | Object | Busy call forward data |
     * | manage | Boolean | Is busy call forward managed on routine activation<br>Default value : `false` |
     * | callForwardType | String | Default value : `busy` |
     * | activate | Boolean | Default value : `false` |
     * | number | String | Default value : `null` |
     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber`, `overflowvoicemail` |
     * | noreplyCallForward | Object | No reply call forward data |
     * | manage | Boolean | Is noreply call forward managed on routine activation<br>Default value : `false` |
     * | callForwardType | String | Default value : `noreply` |
     * | activate | Boolean | Default value : `false` |
     * | number | String | Default value : `null` |
     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber`, `overflowvoicemail` |
     * | noReplyDelay | Number |     |
     * | huntingGroups | Object |     |
     * | manage | Boolean | Default value : `false` |
     * | withdrawAll optionnel | Boolean | Not for work routine<br>Default value : `true` |
     * | huntingGroupsWithdraw optionnel | Object\[\] | Array of objects on user status in each hunting groups, only for work routine |
     * | rvcpGroupId | String | Hunting group unique identifier |
     * | presence | Object | Presence configuration, value can be overwritten by user |
     * | status | String | User's status in the hunting group<br>Possible values : `active`, `idle` |
     * | manage | Boolean | Manage presence on routine activation |
     * | value | String | Same choices as in Rainbow GUI<br>Possible values : `dnd`, `online`, `invisible`, `away` |
     * | cliOptions | Object | Cli options configuration |
     * | manage | Boolean | Manage cli options on routine activation |
     * | policy | String | Cli options policy<br>Possible values : `company_policy`, `installation_number`, `user_ddi_number`, `other_ddi_number` |
     * | phoneNumberId | String | Phone number id in "other\_ddi\_number" policy |
     *
     */
    createCustomPersonalRoutine(name: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.createCustomPersonalRoutine(name);
                that._logger.log("debug", "(createCustomPersonalRoutine) - sent.");
                that._logger.log("internal", "(createCustomPersonalRoutine) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(createCustomPersonalRoutine) Error.");
                that._logger.log("internalerror", LOG_ID + "(createCustomPersonalRoutine) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method deleteCustomPersonalRoutine
     * @async
     * @category Rainbow Voice Personal Routines
     * @instance
     * @param {string} routineId A user routine unique identifier.
     * @description
     *  This api delete a user's custom personal routine. <br>
     * @return {Promise<any>} the result.
     *
     */
    deleteCustomPersonalRoutine(routineId: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.deleteCustomPersonalRoutine(routineId);
                that._logger.log("debug", "(deleteCustomPersonalRoutine) - sent.");
                that._logger.log("internal", "(deleteCustomPersonalRoutine) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(deleteCustomPersonalRoutine) Error.");
                that._logger.log("internalerror", LOG_ID + "(deleteCustomPersonalRoutine) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method getPersonalRoutineData
     * @async
     * @category Rainbow Voice Personal Routines
     * @instance
     * @param {string} routineId A user routine unique identifier.
     * @description
     *  This api returns a user's personal routine data. <br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Detailed information about Rvcp Personal Routines |
     * | type optionnel | String | Type of routine<br>Possible values : `At`, `work`, `Out`, `of`, `office`, `On`, `break`, `Custom` |
     * | id  | String | Routine unique identifier |
     * | active | Boolean | Is the routine activated<br>Default value : `false` |
     * | name | String | Name of the routine |
     * | dndPresence | Boolean | If set to true, on routine activation the presence will be set to "dnd", if false "online", soon deprecated with presence object<br>Default value : `true` |
     * | deviceMode | Object | Device mode data |
     * | manage | Boolean | Is device mode managed on routine activation<br>Default value : `false` |
     * | mode | String | Device mode value, same choice(s) as in Rainbow GUI<br>Default value : `computer`<br>Possible values : `computer`, `office_phone` |
     * | immediateCallForward | Object | Immediate call forward data |
     * | manage | Boolean | Is immediate call forward managed on routine activation<br>Default value : `false` |
     * | callForwardType | String | Default value : `immediate` |
     * | activate | Boolean | Default value : `false` |
     * | number | String | Default value : `null` |
     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber` |
     * | busyCallForward | Object | Busy call forward data |
     * | manage | Boolean | Is busy call forward managed on routine activation<br>Default value : `false` |
     * | callForwardType | String | Default value : `busy` |
     * | activate | Boolean | Default value : `false` |
     * | number | String | Default value : `null` |
     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber`, `overflowvoicemail` |
     * | noreplyCallForward | Object | No reply call forward data |
     * | manage | Boolean | Is noreply call forward managed on routine activation<br>Default value : `false` |
     * | callForwardType | String | Default value : `noreply` |
     * | activate | Boolean | Default value : `false` |
     * | number | String | Default value : `null` |
     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber`, `overflowvoicemail` |
     * | noReplyDelay | Number |     |
     * | huntingGroups | Object |     |
     * | manage | Boolean | Default value : `false` |
     * | withdrawAll optionnel | Boolean | Not for work routine<br>Default value : `true` |
     * | huntingGroupsWithdraw optionnel | Object\[\] | Array of objects on user status in each hunting groups, only for work routine |
     * | rvcpGroupId | String | Hunting group unique identifier |
     * | presence | Object | Presence configuration, value can be overwritten by user |
     * | status | String | User's status in the hunting group<br>Possible values : `active`, `idle` |
     * | manage | Boolean | Manage presence on routine activation |
     * | value | String | Same choices as in Rainbow GUI<br>Possible values : `dnd`, `online`, `invisible`, `away` |
     * | cliOptions | Object | Cli options configuration |
     * | manage | Boolean | Manage cli options on routine activation |
     * | policy | String | Cli options policy<br>Possible values : `company_policy`, `installation_number`, `user_ddi_number`, `other_ddi_number` |
     * | phoneNumberId | String | Phone number id in "other\_ddi\_number" policy |
     *
     */
    getPersonalRoutineData(routineId: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getPersonalRoutineData(routineId);
                that._logger.log("debug", "(getPersonalRoutineData) - sent.");
                that._logger.log("internal", "(getPersonalRoutineData) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getPersonalRoutineData) Error.");
                that._logger.log("internalerror", LOG_ID + "(getPersonalRoutineData) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method getAllPersonalRoutines
     * @async
     * @category Rainbow Voice Personal Routines
     * @instance
     * @param {string} userId Identifier of the user for which we want to get the personal routines. Requesting user must be a supervisor.
     * @description
     *  This api returns all user's personal routines data <br>
     *  <br>
     *  A supervisor can request the personal routines of a user by providing its identifier as a parameter. <br>
     *  The requesting user must be supervisor of the given supervised user. <br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Detailed information about Rvcp Personal Routines |
     * | routines | Object\[\] | Routines data array of routine objects |
     * | id  | String | Routine unique identifier |
     * | name | String | Name of the routine |
     * | type optionnel | String | Type of routine<br>Possible values : `At`, `work`, `Out`, `of`, `office`, `On`, `break`, `Custom` |
     * | active | Boolean | Is the routine activated<br>Default value : `false` |
     * | inSync | Boolean | Boolean to know if last activation or active routine update is done |
     * | issuesLastSync | Object | Indications about issues last activation or active routine update |
     * | dndPresence | Boolean |     |
     * | presence | Boolean |     |
     * | cliOptions | Boolean |     |
     * | deviceMode | Boolean |     |
     * | immediateCallForward | Boolean |     |
     * | busyCallForward | Boolean |     |
     * | noreplyCallForward | Boolean |     |
     * | huntingGroups | Boolean |     |
     *
     */
    getAllPersonalRoutines(userId) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getAllPersonalRoutines(userId);
                that._logger.log("debug", "(getAllPersonalRoutines) - sent.");
                that._logger.log("internal", "(getAllPersonalRoutines) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getAllPersonalRoutines) Error.");
                that._logger.log("internalerror", LOG_ID + "(getAllPersonalRoutines) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method updatePersonalRoutineData
     * @async
     * @category Rainbow Voice Personal Routines
     * @instance
     * @description
     *  This api updates a user's personal routine data, it's not possible to update the work routine, it contains memorized data before the activation of another routine. <br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | cliOptions optionnel | Object | Cli options configuration |
     * | manage | Boolean | Manage cli options on routine activation |
     * | policy | String | Cli options policy<br>Possible values : `company_policy`, `installation_number`, `user_ddi_number`, `other_ddi_number` |
     * | phoneNumberId | String | Phone number id in "other\_ddi\_number" policy |
     * | data | Object | Detailed information about Rvcp Personal Routines |
     * | name | String | name of the routine |
     * | dndPresence | Boolean | If set to true, on routine activation the presence will be set to "dnd", if false "online", soon deprecated with presence object<br>Default value : `true` |
     * | deviceMode | Object | Device mode data |
     * | manage | Boolean | Is device mode managed on routine activation<br>Default value : `false` |
     * | mode | String | Device mode value, same choice(s) as in Rainbow GUI<br>Default value : `computer`<br>Possible values : `computer`, `office_phone` |
     * | immediateCallForward | Object | Immediate call forward data |
     * | manage | Boolean | Is immediate call forward managed on routine activation<br>Default value : `false` |
     * | callForwardType | String | Default value : `immediate` |
     * | activate | Boolean | Default value : `false` |
     * | number | String | Default value : `null` |
     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber` |
     * | busyCallForward | Object | Busy call forward data |
     * | manage | Boolean | Is busy call forward managed on routine activation<br>Default value : `false` |
     * | callForwardType | String | Default value : `busy` |
     * | activate | Boolean | Default value : `false` |
     * | number | String | Default value : `null` |
     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber`, `overflowvoicemail` |
     * | noreplyCallForward | Object | No reply call forward data |
     * | manage | Boolean | Is noreply call forward managed on routine activation<br>Default value : `false` |
     * | callForwardType | String | Default value : `noreply` |
     * | activate | Boolean | Default value : `false` |
     * | number | String | Default value : `null` |
     * | destinationType | String | Default value : `null`<br>Possible values : `voicemail`, `internalnumber`, `externalnumber`, `overflowvoicemail` |
     * | noReplyDelay | Number |     |
     * | huntingGroups | Object |     |
     * | manage | Boolean | Default value : `false` |
     * | type optionnel | String | Type of routine<br>Possible values : `At`, `work`, `Out`, `of`, `office`, `On`, `break`, `Custom` |
     * | withdrawAll optionnel | Boolean | Default value : `true` |
     * | active | Boolean | Is the routine activated<br>Default value : `false` |
     * | issuesLastSync optionnel | Object | Indications about issues if the routine was active |
     * | dndPresence | Boolean |     |
     * | presence | Boolean |     |
     * | cliOptions | Boolean |     |
     * | deviceMode | Boolean |     |
     * | immediateCallForward | Boolean |     |
     * | busyCallForward | Boolean |     |
     * | noreplyCallForward | Boolean |     |
     * | presence | Object | Presence configuration, value can be overwritten by user |
     * | huntingGroups | Boolean |     |
     * | manage | Boolean | Manage presence on routine activation |
     * | value | String | Same choices as in Rainbow GUI<br>Possible values : `dnd`, `online`, `invisible`, `away` |
     *
     * @param {string} routineId A user routine unique identifier.
     * @param {boolean} dndPresence Configure dndPresence on routine activation, or online on fallback to work routine, soon deprecated with presence object
     * @param {string} name New routine name, not for default routine.
     * @param {Object} deviceMode Device mode configuration <BR>
     *     - deviceMode.manage : boolean Manage device mode on routine activation <BR>
     *     - deviceMode.mode : string Same choices as in Rainbow GUI. Possible values : computer, office_phone <BR>
     * @param {Object} presence Presence configuration, value can be overwritten by user<BR>
     *     - presence.manage : boolean Manage presence on routine activation<BR>
     *     - presence.value : string Same choices as in Rainbow GUI. Possible values : dnd, online, invisible, away<BR>
     * @param {Object} immediateCallForward immediate call forward configuration <BR>
     *     - immediateCallForward.manage : boolean Manage immediate call forward <BR>
     *     - immediateCallForward.activate : boolean <BR>
     *     - immediateCallForward.number optionnel : string Mandatory on destinationType internalnumber or externalnumber <BR>
     *     - immediateCallForward.destinationType optionnel : string Possible values : voicemail, internalnumber, externalnumber <BR>
     * @param {Object} busyCallForward Busy call forward configuration <BR>
     *     - busyCallForward.manage : boolean Manage busy call forward <BR>
     *     - busyCallForward.activate : boolean <BR>
     *     - busyCallForward.number optionnel : string Mandatory on destinationType internalnumber or externalnumber <BR>
     *     - busyCallForward.destinationType optionnel : string Possible values : voicemail, internalnumber, externalnumber <BR>
     * @param {Object} noreplyCallForward Noreply call forward configuration <BR>
     *     - noreplyCallForward.manage : boolean Manage noreply call forward <BR>
     *     - noreplyCallForward.activate : boolean <BR>
     *     - noreplyCallForward.number optionnel : string Mandatory on destinationType internalnumber or externalnumber <BR>
     *     - noreplyCallForward.destinationType optionnel : string Possible values : voicemail, internalnumber, externalnumber <BR>
     *     - noreplyCallForward.noReplyDelay : number timeout in seconds after which the call will be forwarded Default value : 20 Ordre de grandeur : 10-60 <BR>
     * @param {Object} huntingGroups Hunting groups configuration <BR>
     *     - huntingGroups.withdrawAll    Boolean Withdraw from all hunting groups or keep the work data <BR>
     *     - huntingGroups.manage    Boolean Manage hunting groups configuration <BR>
     *
     */
    updatePersonalRoutineData(routineId: string, dndPresence: boolean, name: string, presence: { manage: boolean, value: string }, deviceMode: { manage: boolean, mode: string }, immediateCallForward: { manage: boolean, activate: boolean, number: string, destinationType: string }, busyCallForward: { manage: boolean, activate: boolean, number: string, destinationType: string }, noreplyCallForward: { manage: boolean, activate: boolean, number: string, destinationType: string, noReplyDelay: number }, huntingGroups: { withdrawAll: boolean }) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.updatePersonalRoutineData(routineId, dndPresence, name, presence, deviceMode, immediateCallForward, busyCallForward, noreplyCallForward, huntingGroups);
                that._logger.log("debug", "(updatePersonalRoutineData) - sent.");
                that._logger.log("internal", "(updatePersonalRoutineData) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updatePersonalRoutineData) Error.");
                that._logger.log("internalerror", LOG_ID + "(updatePersonalRoutineData) Error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Rainbow Voice Personal Routines    

    //region Rainbow Voice Routing

    /**
     * @public
     * @nodered true
     * @method manageUserRoutingData
     * @async
     * @category Rainbow Voice Routing
     * @instance
     * @param {string} destinations List of device's identifiers indicating which devices will receive incoming calls.
     * @param {string} currentDeviceId Device's identifier to use for 3Pcc initial requests like "Make Call".
     * @description
     *  This api allows user routing management <br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | destinations | Object\[\] | Which devices will be ringing when an incoming call is received |
     * | deviceId | String | Destination identifier |
     * | type | String | Destination type (`webrtc` : destination is a softphone ; `sip` : destination is a SIP deskphone)<br>Possible values : `sip`, `webrtc` |
     * | currentDeviceId | String | Which device is used for handling 3PCC initial requests (like "Make Call") |
     * | current | String | (Deprecated) Which device is used for handling 3PCC initial requests (like "Make Call") |
     *
     */
    manageUserRoutingData(destinations: Array<string>, currentDeviceId: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.manageUserRoutingData(destinations, currentDeviceId);
                that._logger.log("debug", "(manageUserRoutingData) - sent.");
                that._logger.log("internal", "(manageUserRoutingData) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(manageUserRoutingData) Error.");
                that._logger.log("internalerror", LOG_ID + "(manageUserRoutingData) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method retrievetransferRoutingData
     * @async
     * @category Rainbow Voice Routing
     * @instance
     * @param {string} calleeId Callee user identifier.
     * @param {string} addresseeId Addressee user identifier (in case of Rainbow user).
     * @param {string} addresseePhoneNumber Addressee phone number (short or external number).
     * @description
     *  For transfer, get addressee routing data. <br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | jid_im | String | Addressee Jabber identifier (WebRTC). |
     * | phoneNumber | String | Addressee phone number (deskphone or external number). |
     *
     */
    retrievetransferRoutingData(calleeId: string, addresseeId ?: string, addresseePhoneNumber ?: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrievetransferRoutingData(calleeId, addresseeId, addresseePhoneNumber);
                that._logger.log("debug", "(retrievetransferRoutingData) - sent.");
                that._logger.log("internal", "(retrievetransferRoutingData) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrievetransferRoutingData) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrievetransferRoutingData) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method retrieveUserRoutingData
     * @async
     * @category Rainbow Voice Routing
     * @instance
     * @description
     *  This api returns user routing information. <br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | destinations | Object\[\] | Which devices will be ringing when an incoming call is received |
     * | deviceId | String | Destination identifier |
     * | type | String | Destination type (`webrtc` : destination is a softphone ; `sip` : destination is a SIP deskphone)<br>Possible values : `sip`, `webrtc` |
     * | currentDeviceId | String | Which device is used for handling 3PCC initial requests (like "Make Call") |
     * | current | String | (Deprecated) Which device is used for handling 3PCC initial requests (like "Make Call") |
     *
     */
    retrieveUserRoutingData() {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveUserRoutingData();
                that._logger.log("debug", "(retrieveUserRoutingData) - sent.");
                that._logger.log("internal", "(retrieveUserRoutingData) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveUserRoutingData) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveUserRoutingData) Error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Rainbow Voice Routing    

    //region Rainbow Voice Settings 

    /**
     * @public
     * @nodered true
     * @method retrieveVoiceUserSettings
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @description
     *  Allows logged in user to retrieve his voice settings. <br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | data | Object | Response data |
     * | emulatedRingBackTone | Boolean | Indicate that emulated ringback tone is active |
     *
     */
    retrieveVoiceUserSettings() {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveVoiceUserSettings();
                that._logger.log("debug", "(retrieveVoiceUserSettings) - sent.");
                that._logger.log("internal", "(retrieveVoiceUserSettings) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveVoiceUserSettings) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveVoiceUserSettings) Error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Rainbow Voice Settings  

    //region Rainbow Voice Voice

    /**
     * @public
     * @nodered true
     * @method addParticipant3PCC
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {string} callId Call identifier.
     * @param {Object} callData : <br>
     *     callData.callee : string Contains the callee number. <br>
     * @description
     *  Adds a participant in a call, as a one step conference. <br>
     * @return {Promise<any>} the result.
     *
     */
    addParticipant3PCC(callId: string, callData: { callee: string }) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.addParticipant3PCC(callId, callData);
                that._logger.log("debug", "(retrieveUserRoutingData) - sent.");
                that._logger.log("internal", "(retrieveUserRoutingData) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveUserRoutingData) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveUserRoutingData) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method answerCall3PCC
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {string} callId Call identifier.
     * @param {Object} callData : <br>
     *     callData.legId : string Leg identifier, on which the call will be answered.<br>
     * @description
     *  This is a 3PCC answer call. <br>
     * @return {Promise<any>} the result.
     *
     */
    answerCall3PCC(callId: string, callData: { legId: string }) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.answerCall3PCC(callId, callData);
                that._logger.log("debug", "(answerCall3PCC) - sent.");
                that._logger.log("internal", "(answerCall3PCC) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(answerCall3PCC) Error.");
                that._logger.log("internalerror", LOG_ID + "(answerCall3PCC) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method blindTransferCall3PCC
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {string} callId Call identifier.
     * @param {Object} callData : <br>
     *     callData.destination : Object if destination type is a `String`, its content is treated as the phone number to call, if destination type is an `Object` with following attributes is expected:<br>
     *     callData.destination.userId : string Identifier of the user to call.<br>
     *     callData.destination.resource : string Specific user resource to call.<br>
     * @description
     *  This is a 3PCC blind transfer call. Immediate transfer of an active call to a new destination. <br>
     * @return {Promise<any>} the result.
     *
     */
    blindTransferCall3PCC(callId: string, callData: { destination: { userId: string, resource: string } }) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.blindTransferCall3PCC(callId, callData);
                that._logger.log("debug", "(blindTransferCall3PCC) - sent.");
                that._logger.log("internal", "(blindTransferCall3PCC) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(blindTransferCall3PCC) Error.");
                that._logger.log("internalerror", LOG_ID + "(blindTransferCall3PCC) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method deflectCall3PCC
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {string} callId Call identifier.
     * @param {Object} callData : <br>
     *     callData.destination : string The number to deflect to.<br>
     * @description
     *  This is a 3PCC deflect call. During ringing state, user transfer the call to another destination. <br>
     * @return {Promise<any>} the result.
     *
     */
    deflectCall3PCC(callId: string, callData: { destination: string }) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.deflectCall3PCC(callId, callData);
                that._logger.log("debug", "(deflectCall3PCC) - sent.");
                that._logger.log("internal", "(deflectCall3PCC) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(deflectCall3PCC) Error.");
                that._logger.log("internalerror", LOG_ID + "(deflectCall3PCC) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method holdCall3PCC
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {string} callId Call identifier.
     * @param {Object} callData : <br>
     *     callData.legId : string Leg identifier, from which the call will be held.<br>
     * @description
     *  This is a 3PCC hold call. <br>
     * @return {Promise<any>} the result.
     *
     */
    holdCall3PCC(callId: string, callData: { legId: string }) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.holdCall3PCC(callId, callData);
                that._logger.log("debug", "(holdCall3PCC) - sent.");
                that._logger.log("internal", "(holdCall3PCC) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(holdCall3PCC) Error.");
                that._logger.log("internalerror", LOG_ID + "(holdCall3PCC) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method makeCall3PCC
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {Object} callData Object with : <br>
     * callData.deviceId : string Identifier of the device from which the call should be initiated.<br>
     * callData.callerAutoAnswer : boolean Indicates if the call should be automatically answered by the caller (if true). Default value : false.<br>
     * callData.anonymous : boolean If true, the caller identity will not be presented to the other call parties. Default value : false.<br>
     * callData.calleeExtNumber : string The format could be anything the user can type, it will be transformed in E164 format.<br>
     * callData.calleePbxId : string PBX identifier on which the callee is attached.<br>
     * callData.calleeShortNumber : string Callee short number. CalleePbxId must be provided with calleeShortNumber, as it is used to check that caller and callee are on the same pbx.<br>
     * callData.calleeCountry : string Callee country code. If not specified, the logged user country code will be used.<br>
     * callData.dialPadCalleeNumber : string Callee number ; with the same format as if number was dialed By EndUser using a deskphone :<br>
     * That means that inside this parameter, we can have internal number ; or external number (for national and international calls) but in that case the outgoing prefix must be present.<br>
     * This parameter support also the E.164 format.<br>
     * Examples of accepted number into this parameter:<br>
     *  - +33299151617 : national or international call to France<br>
     *  - 0 00 XXXXXXXXX : for international calls where 0 is PBX outbound prefix and 00 the international prefix (spaces are not mandatory, it is for better understanding)<br>
     *  - 0 0 XXXXXXXXX : for national calls where 0 is PBX outbound prefix and 0 the national prefix (spaces are not mandatory, it is for better understanding)<br>
     *  - 0 XXXX : for services where 0 is PBX outbound prefix (space is not mandatory, it is for better understanding)<br>
     *  - XXXXX : for internal calls<br>
     *  <br>
     *  This parameter is used only if other "callee" parameters are not set.<br>
     * @description
     *  This api makes a 3PCC call between 2 users.<br>
     * @return {Promise<any>} the result.
     *
     */
    makeCall3PCC(callData: { deviceId: string, callerAutoAnswer: boolean, anonymous: boolean, calleeExtNumber: string, calleePbxId: string, calleeShortNumber: string, calleeCountry: string, dialPadCalleeNumber: string }) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.makeCall3PCC(callData);
                that._logger.log("debug", "(holdCall3PCC) - sent.");
                that._logger.log("internal", "(holdCall3PCC) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(holdCall3PCC) Error.");
                that._logger.log("internalerror", LOG_ID + "(holdCall3PCC) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method mergeCall3PCC
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {string} activeCallId Active call identifier. <br>
     * @param {Object} callData Object with : <br>
     * callData.heldCallId : string Held call identifier.<br>
     * @description
     *  This is a 3PCC merge call. Merge an held call into the active call (single call or conference call).<br>
     * @return {Promise<any>} the result.
     *
     */
    mergeCall3PCC(activeCallId: string, callData: { heldCallId: string }) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.mergeCall3PCC(activeCallId, callData);
                that._logger.log("debug", "(mergeCall3PCC) - sent.");
                that._logger.log("internal", "(mergeCall3PCC) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(mergeCall3PCC) Error.");
                that._logger.log("internalerror", LOG_ID + "(mergeCall3PCC) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method pickupCall3PCC
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {Object} callData Object with : <br>
     * callData.deviceId : string Identifier of the device from which the call should be initiated.<br>
     * callData.callerAutoAnswer : string Indicates if the call should be automatically answered by the caller (if true). Default value : false.<br>
     * callData.calleeShortNumber : string Callee short number.<br>
     * @description
     *  3PCC pickup call can be used in case of manager/assistant context, when an assistant wants to pickup a call on a manager.
     *  To allow such pickup, the following checks must be fulfilled:
     *  * The user initiating the pickup must be an active assistant in the same group as the manager .<br>
     * @return {Promise<any>} the result.
     *
     */
    pickupCall3PCC(callData: { deviceId: string, callerAutoAnswer: boolean, calleeShortNumber: string }) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.pickupCall3PCC(callData);
                that._logger.log("debug", "(pickupCall3PCC) - sent.");
                that._logger.log("internal", "(pickupCall3PCC) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(pickupCall3PCC) Error.");
                that._logger.log("internalerror", LOG_ID + "(pickupCall3PCC) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method releaseCall3PCC
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {string} callId Call identifier.
     * @param {string} legId Leg identifier, from which the call will be released.<br>
     * @description
     *  This is a 3PCC release call.<br>
     *  If the legId is not specified, the resulting operation will be considered as a 'clearCall'.<br>
     *  If specified, a 'clearConnection' will be invoked.<br>
     * @return {Promise<any>} the result.
     *
     */
    releaseCall3PCC(callId: string, legId: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.releaseCall3PCC(callId, legId);
                that._logger.log("debug", "(releaseCall3PCC) - sent.");
                that._logger.log("internal", "(releaseCall3PCC) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(releaseCall3PCC) Error.");
                that._logger.log("internalerror", LOG_ID + "(releaseCall3PCC) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method retrieveCall3PCC
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {string} callId Call identifier.
     * @param {Object} callData : <br>
     *     callData.legId : string Leg identifier, from which the call will be retrieved.<br>
     * @description
     *  This is a 3PCC retrieve call.<br>
     * @return {Promise<any>} the result.
     *
     */
    retrieveCall3PCC(callId: string, callData: { legId: string }) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.retrieveCall3PCC(callId, callData);
                that._logger.log("debug", "(retrieveCall3PCC) - sent.");
                that._logger.log("internal", "(retrieveCall3PCC) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(retrieveCall3PCC) Error.");
                that._logger.log("internalerror", LOG_ID + "(retrieveCall3PCC) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method sendDTMF3PCC
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {string} callId Call identifier.
     * @param {Object} callData : <br>
     *     callData.legId : string Leg identifier, on which the DTMF will be sent.<br>
     *     callData.digits : string Digits to send.<br>
     * @description
     *  This is a 3PCC send DTMF.<br>
     * @return {Promise<any>} the result.
     *
     */
    sendDTMF3PCC(callId: string, callData: { legId: string, digits: string }) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.sendDTMF3PCC(callId, callData);
                that._logger.log("debug", "(sendDTMF3PCC) - sent.");
                that._logger.log("internal", "(sendDTMF3PCC) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(sendDTMF3PCC) Error.");
                that._logger.log("internalerror", LOG_ID + "(sendDTMF3PCC) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method snapshot3PCC
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {string} callId Snapshot will be filtered with the given callId.
     * @param {string} deviceId Snapshot will be filtered with the given deviceId.
     * @param {string} seqNum If provided and different from the server's sequence number, full snapshot will be returned. If provided seqNum is the same as the one on the server, no snapshot returned (client and server are sync).
     * @description
     *  This is a 3PCC Snapshot of the user's calls and devices.<br>
     *  Providing a callId will restrict the snapshot to the given call. The same principle applies to the deviceId for the user's devices states.<br>
     *  A synchronisation check can also be used by the client to see if any changes have been correctly notified by the server.<br>
     *  To use this mechanism, the client will send the last sequence number received, either from events, or when requesting the last snapshot.<br>
     *  The main advantage of using this sequence number is to minimize the data flow between the client and the server.<br>
     *  Returning the complete snapshot result is only necessary when sequence numbers are different between the server and the client.<br>
     * @return {Promise<any>} the result.
     *
     *  data : Object snapshot Calls and/or devices snapshot
     *
     */
    snapshot3PCC(callId: string, deviceId: string, seqNum: number) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.snapshot3PCC(callId, deviceId, seqNum);
                that._logger.log("debug", "(snapshot3PCC) - sent.");
                that._logger.log("internal", "(snapshot3PCC) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(snapshot3PCC) Error.");
                that._logger.log("internalerror", LOG_ID + "(snapshot3PCC) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method transferCall3PCC
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {string} activeCallId Active call identifier.
     * @param {Object} callData : <br>
     *     callData.heldCallId : string Held call identifier.<br>
     * @description
     *  This is a 3PCC transfer call. Transfer the active call to the given held call.<br>
     * @return {Promise<any>} the result.
     *
     */
    transferCall3PCC(activeCallId: string, callData: { heldCallId: string }) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.transferCall3PCC(activeCallId, callData);
                that._logger.log("debug", "(transferCall3PCC) - sent.");
                that._logger.log("internal", "(transferCall3PCC) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(transferCall3PCC) Error.");
                that._logger.log("internalerror", LOG_ID + "(transferCall3PCC) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method deleteAVoiceMessage
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {string} messageId Message identifier.
     * @description
     *  Deletion of the given voice message.<br>
     *  When deleted, the user will receive a MWI XMPP notification.<br>
     * @return {Promise<any>} the result.
     *
     */
    deleteAVoiceMessage(messageId: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.deleteAVoiceMessage(messageId);
                that._logger.log("debug", "(deleteAVoiceMessage) - sent.");
                that._logger.log("internal", "(deleteAVoiceMessage) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(deleteAVoiceMessage) Error.");
                that._logger.log("internalerror", LOG_ID + "(deleteAVoiceMessage) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method deleteAllVoiceMessages
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {string} messageId Message identifier.
     * @description
     *  Deletion of all user's voice messages.<br>
     *  When updated, the user will receive a MWI XMPP notification.<br>
     * @return {Promise<any>} the result.
     *
     */
    deleteAllVoiceMessages(messageId: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.deleteAllVoiceMessages(messageId);
                that._logger.log("debug", "(deleteAllVoiceMessages) - sent.");
                that._logger.log("internal", "(deleteAllVoiceMessages) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(deleteAllVoiceMessages) Error.");
                that._logger.log("internalerror", LOG_ID + "(deleteAllVoiceMessages) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method getEmergencyNumbersAndEmergencyOptions
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @description
     *  This api returns emergency numbers the user can use (+ emergency options).<br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | emergencyNumbers | Object\[\] | Array of emergency numbers |
     * | outgoingPrefix | String | Reminder of what is the outgoing prefix for the Cloud PBX |
     * | emergencyOptions | Object | Emergency options |
     * | callAuthorizationWithSoftPhone | Boolean | Indicates if SoftPhone can perform an emergency call over voip |
     * | number | String | emergency number |
     * | description | String | description of the emergency number |
     *
     */
    getEmergencyNumbersAndEmergencyOptions() {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getEmergencyNumbersAndEmergencyOptions();
                that._logger.log("debug", "(getEmergencyNumbersAndEmergencyOptions) - sent.");
                that._logger.log("internal", "(getEmergencyNumbersAndEmergencyOptions) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getEmergencyNumbersAndEmergencyOptions) Error.");
                that._logger.log("internalerror", LOG_ID + "(getEmergencyNumbersAndEmergencyOptions) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method getVoiceMessages
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @param {number} limit Allow to specify the number of voice messages to retrieve. Default value : 100.
     * @param {number} offset Allow to specify the position of first voice messages to retrieve. Default value : 0.
     * @param {string} sortField Sort voice messages list based on the given field. Default value : date.
     * @param {number} sortOrder Specify order when sorting voice messages. Default is descending. Default value : -1. Possible values : -1, 1 .
     * @param {string} fromDate List voice messages created after the given date.
     * @param {string} toDate List voice messages created before the given date.
     * @param {string} callerName List voice messages with caller party name containing the given value.
     * @param {string} callerNumber List voice messages with caller party number containing the given value.
     * @description
     *  Returns the list of voice messages.<br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | voice message identifier |
     * | fileName | String | File name of the voice message - composed of the voice message date |
     * | mime | String | MIME type of the voice message file<br>Possible values : `audio/mpeg` |
     * | size | Number | Size of the voice message file (in bytes). |
     * | duration | Number | Duration of the voice message (in seconds) |
     * | date | Date | Date of the voice message |
     * | callerInfo | Object | Caller party info |
     * | data | Object\[\] | Voice messages |
     * | number | String | Caller number |
     * | name optionnel | String | Caller name, if available |
     * | firstName optionnel | String | Caller firstName, if available |
     * | lastName optionnel | String | Caller lastName, if available |
     * | userId optionnel | String | Caller user identifier if it can be resolved. |
     * | jid optionnel | String | Caller Jid if it can be resolved. |
     *
     */
    getVoiceMessages(limit: number = 100,
                     offset: number = 0,
                     sortField: string = "date",
                     sortOrder: number = -1,
                     fromDate: string,
                     toDate: string,
                     callerName: string,
                     callerNumber: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getVoiceMessages(limit, offset, sortField, sortOrder, fromDate, toDate, callerName, callerNumber);
                that._logger.log("debug", "(getVoiceMessages) - sent.");
                that._logger.log("internal", "(getVoiceMessages) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getVoiceMessages) Error.");
                that._logger.log("internalerror", LOG_ID + "(getVoiceMessages) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method getUserDevices
     * @async
     * @category Rainbow Voice Voice
     * @instance
     * @description
     *  This api returns user devices information.<br>
     * @return {Promise<any>} the result.
     *
     * Array of
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | id  | String | Device Unique Identifier |
     * | deviceId | String | Device identifier to use for 3PCC requests (like MakeCall) |
     * | type | String | Device type (enumeration ; values are : "sip" ; "webrtc") |
     * | jid_wrg | String | Jabber identifier of the associated Web Rtc Gateway (only set when type is "webrtc") |
     *
     */
    getUserDevices() {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getUserDevices();
                that._logger.log("debug", "(getUserDevices) - sent.");
                that._logger.log("internal", "(getUserDevices) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getUserDevices) Error.");
                that._logger.log("internalerror", LOG_ID + "(getUserDevices) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method updateVoiceMessage
     * @async
     * @category Rainbow Voice Voice
     * @param {string} messageId Message Identifier.
     * @param {Object} urlData : <br>
     *     urlData.read : boolean Mark the message as read or unread.<br>
     * @instance
     * @description
     *  Update the given voice message - mark it as read or unread.<br>
     *  When a message is 'unread', it is considered as a new message. On the opposite, a 'read' message is considered as an old message.<br>
     * @return {Promise<any>} the result.
     *
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | messageUpdateResult | Object | message Updated message |
     *
     */
    updateVoiceMessage(messageId: string, urlData: { read: boolean }) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.updateVoiceMessage(messageId, urlData);
                that._logger.log("debug", "(updateVoiceMessage) - sent.");
                that._logger.log("internal", "(updateVoiceMessage) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateVoiceMessage) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateVoiceMessage) Error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Rainbow Voice Voice

    //region Rainbow Voice Voice Forward

    /**
     * @public
     * @nodered true
     * @method forwardCall
     * @async
     * @category Rainbow Voice Voice Forward
     * @param {string} callForwardType The forward type to update. Possible values : immediate, busy, noreply
     * @param {string} userId Identifier of the user for which we want to set the forwards. Requesting user must be a supervisor.
     * @param {Object} urlData : <br>
     *     urlData.destinationType : string The destination type. Possible values : internalNumber, externalNumber, voicemail .<br>
     *     urlData.number : string The number to forward.<br>
     *     urlData.activate : boolean Activate or cancel a forward.<br>
     *     urlData.noReplyDelay : number in case of 'noreply' forward type, timeout in seconds after which the call will be forwarded. Default value : 20. Possible values : {10-60} .<br>
     * @instance
     * @description
     *  This api activates/deactivates a forward.<br>
     *  Group forward (immediate/managersecretary) is not supported here. There is a dedicated API for group forward management (Cloud PBX group forwards)<br>
     *  If the destinationType is "voicemail" and overflow is enabled on the Cloud PBX or/and forced on the subscriber, the overflow configuration (noReplyDelay) will be use.<br>
     *  <br>
     *  A supervisor can also set the forward of a user by providing its identifier as a parameter, as well as the supervision group identifier.<br>
     *  In such case, the requesting user must be supervisor of the given supervision group, and the requested user must 'supervised' in the given group.<br>
     * @return {Promise<any>} the result.
     *
     */
    forwardCall(callForwardType: string, userId: string, urlData: { destinationType: string, number: string, activate: boolean, noReplyDelay: number }) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.forwardCall(callForwardType, userId, urlData);
                that._logger.log("debug", "(updateVoiceMessage) - sent.");
                that._logger.log("internal", "(updateVoiceMessage) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(updateVoiceMessage) Error.");
                that._logger.log("internalerror", LOG_ID + "(updateVoiceMessage) Error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @nodered true
     * @method getASubscriberForwards
     * @async
     * @category Rainbow Voice Voice Forward
     * @param {string} userId Identifier of the user for which we want to get the forwards. Requesting user must be a supervisor.
     * @instance
     * @description
     *  This api gets the user forwards.<br>
     *  For internalnumber forward, on return data you will see the userId/rvcpGroupId/rvcpAutoAttendantId with the associated name.<br>
     *  If name equals "null" or the id equals "null", the concerned user/rvcpGroup/rvcpAutoAttendantId is deleted, please remove the associated forward.<br>
     *  <br>
     *  A supervisor can request the forwards of a user by providing its identifier as a parameter.<br>
     *  The requesting user must be supervisor of the given supervised user.<br>
     * @return {Promise<any>} the result.
     *
     */
    getASubscriberForwards(userId: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.getASubscriberForwards(userId);
                that._logger.log("debug", "(getASubscriberForwards) - sent.");
                that._logger.log("internal", "(getASubscriberForwards) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(getASubscriberForwards) Error.");
                that._logger.log("internalerror", LOG_ID + "(getASubscriberForwards) Error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Rainbow Voice Voice Forward


    //region Rainbow Voice Voice Search Hunting Groups

    /**
     * @public
     * @nodered true
     * @method searchCloudPBXhuntingGroups
     * @async
     * @category Rainbow Voice Voice Search Hunting Groups
     * @param {string} name Search hunting groups on the given name
     * @instance
     * @description
     *  This API allows to retrieve Cloud PBX Hunting Groups.<br>
     * @return {Promise<any>} the result.
     *
     */
    searchCloudPBXhuntingGroups(name: string) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let result = await that._rest.searchCloudPBXhuntingGroups(name);
                that._logger.log("debug", "(searchCloudPBXhuntingGroups) - sent.");
                that._logger.log("internal", "(searchCloudPBXhuntingGroups) - result : ", result);

                resolve(result);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(searchCloudPBXhuntingGroups) Error.");
                that._logger.log("internalerror", LOG_ID + "(searchCloudPBXhuntingGroups) Error : ", err);
                return reject(err);
            }
        });
    }

    //endregion Rainbow Voice Voice Search Hunting Groups

    //endregion Rainbow Voice

}

module.exports.RBVoiceService = RBVoiceService;
export {RBVoiceService as RBVoiceService};

