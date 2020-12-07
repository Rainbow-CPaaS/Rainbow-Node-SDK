"use strict";
import {Logger} from "../common/Logger";

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {isNullOrEmpty, logEntryExit, setTimeoutPromised} from "../common/Utils";
import * as PubSub from "pubsub-js";
import {AlertEventHandler} from '../connection/XMPPServiceHandler/alertEventHandler';
import {Alert} from '../common/models/Alert';
import {ErrorManager} from "../common/ErrorManager";
import {isStarted} from "../common/Utils";
import {EventEmitter} from "events";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import {Dictionary} from "ts-generic-collections-linq";
import {AlertDevice} from "../common/models/AlertDevice";
import {AlertTemplate} from "../common/models/AlertTemplate";
import {AlertFilter} from "../common/models/AlertFilter";

const LOG_ID = "ALERTS/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
    /**
     * @module
     * @name AlertsService
     * @version SDKVERSION
     * @public
     * @description
     *      This module is the basic module for handling Alerts in Rainbow.
     *
     *      Note: the Rainbow subscriptions "Alerts" is need to use the Alert notification system.
     */
class AlertsService {
    private _eventEmitter: EventEmitter;
    private _logger: Logger;
    private started: boolean;
    private _initialized: boolean;
    private _xmpp: XMPPService;
    private _rest: RESTService;
    private _options: any;
    private _s2s: S2SService;
    private _useXMPP: any;
    private _useS2S: any;
    private _alertEventHandler: AlertEventHandler;
    private _alertHandlerToken: any;
    //public static $inject: string[] = ['$http', '$log', 'contactService', 'authService', 'roomService', 'conversationService', 'xmppService'];
    private alerts: Alert[] = [];

    private readonly timerFactor = 1; // Used in debug mode to ensure to avoid timeout
    private currentContactId: string = "";
    private currentContactJid: string = "";

    //private readonly Object lockAlertMessagesReceivedPool = new Object();
    private readonly alertsMessagePoolReceived: Dictionary<string, [Date, String]>;      // Store Alert Messages using "AlertMessage.Identifier" as key - Tuple:<AlertMessage.Sent, AlertMessage.MsgType>

    //private readonly Object lockAlertMessagesSentPool = new Object();
    private readonly alertsMessagePoolSent: Dictionary<string, [String, String, Date]>;          // Store Alert Messages using "AlertMessage.Identifier" as key - Tuple:<AlertMessage.Identifier, AlertMessage.Sender, AlertMessage.Sent>

    private readonly delayToSendReceiptReceived: number; // TimeSpan;
    private readonly delayToSendReceiptRead: number; // TimeSpan;
    private delayInfoLoggued: boolean = false;


    private _xmppManagementHandler: any;
    public ready: boolean = false;
    private readonly _startConfig: {
        start_up: boolean,
        optional: boolean
    };
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    static getClassName() {
        return 'AlertsService';
    }

    getClassName() {
        return AlertsService.getClassName();
    }

    constructor(_eventEmitter: EventEmitter, logger: Logger, _startConfig) {

        /*********************************************************/
        /**                 LIFECYCLE STUFF                     **/
        /*********************************************************/
        this._startConfig = _startConfig;
        //let that = this;
        this._eventEmitter = _eventEmitter;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._logger = logger;

        this.started = false;
        this._initialized = false;

        //this._eventEmitter.on("evt_internal_alertcreated_handle", this.onAlertCreated.bind(this));
        //this._eventEmitter.on("evt_internal_alertdeleted_handle", this.onAlertDeleted.bind(this));
        this.ready = false;
    }


    public async start(_options, _core: Core) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService
        let that = this;
        that._xmpp = _core._xmpp;
        that._rest = _core._rest;
        that._options = _options;
        that._s2s = _core._s2s;
        that._useXMPP = that._options.useXMPP;
        that._useS2S = that._options.useS2S;
        this._alertHandlerToken = [];

        that._logger.log("info", LOG_ID + " ");
        that._logger.log("info", LOG_ID + "[start] === STARTING ===");
        let startDate = new Date().getTime();
        this.attachHandlers();

        //this.conversationService.alertService = this;
        //this.attachHandlers();

        let startDuration = Math.round(new Date().getTime() - startDate);
        //stats.push({ service: 'alertService', startDuration: startDuration });
        that._logger.log("info", LOG_ID + `=== STARTED (${startDuration} ms) ===`);
        this.ready = true;

    }

    public async stop() {
        let that = this;

        that._logger.log("info", LOG_ID + "[stop] Stopping");

        //remove all saved call logs
        this.started = false;
        this._initialized = false;

        that._xmpp = null;
        that._rest = null;

        delete that._alertEventHandler;
        that._alertEventHandler = null;
        if (that._alertHandlerToken) {
            that._alertHandlerToken.forEach((token) => PubSub.unsubscribe(token));
        }
        that._alertHandlerToken = [];

        /*this.$log.info('Stopping');
        if (this._xmppManagementHandler) {
            this.xmppService.deleteHandler(this._xmppManagementHandler);
            this._xmppManagementHandler = null;
        }
        this.$log.info('Stopped');

         */


        this.ready = false;
        that._logger.log("info", LOG_ID + "[stop] Stopped");
    }

    public async init() {
        let that = this;
        //await this.getServerAlerts();

    }

    private attachHandlers() {
        let that = this;

        that._logger.log("info", LOG_ID + "[attachHandlers] attachHandlers");

        that._alertEventHandler = new AlertEventHandler(that._xmpp, that);
        that._alertHandlerToken = [
            //PubSub.subscribe(that._xmpp.hash + "." + that._alertEventHandler.MESSAGE_MANAGEMENT, that._alertEventHandler.onManagementMessageReceived.bind(that._alertEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that._alertEventHandler.MESSAGE_HEADLINE, that._alertEventHandler.onHeadlineMessageReceived.bind(that._alertEventHandler)),
            PubSub.subscribe(that._xmpp.hash + "." + that._alertEventHandler.MESSAGE_ERROR, that._alertEventHandler.onErrorMessageReceived.bind(that._alertEventHandler))
        ];

        /*
        if (this._xmppManagementHandler) { this.xmppService.deleteHandler(this._xmppManagementHandler); }
        this._xmppManagementHandler = this.xmppService.addHandler((stanza) => { this.onXmppEvent(stanza); return true; }, null, "message", "management");

         */

        /*
        //if reconnection, update the call-logs
        if (that.started && that.lastTimestamp) {
            $interval(function () {
                that.getCallLogHistoryPage(that.lastTimestamp);
            }, 1000, 1, true);
        }
        // */
    }


    public async reconnect() {
        // await this.getServerAlerts();
        //this.conversationService.alertService = this;
        this.attachHandlers();
    }

    //region PUBLIC API

    //region Mark as Received / Read

    /**
     * @private
     * @method markAlertMessageAsReceived
     * @instance
     * @async
     * @param {string} jid The Jid of the sender</param>
     * @param {string} messageXmppId the Xmpp Id of the alert message</param>
     * @description
     *    Mark as Received the specified alert message
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    markAlertMessageAsReceived(jid: string, messageXmppId: string): Promise<any> {
        let that = this;
        /*
        if (!application.Restrictions.AlertMessage)
        {
            callback?.Invoke(new SdkResult<Boolean>("AlertMessage has not been allowed in Application.Restrictions object"));
            return;
        }
        // */

        if (!that.delayInfoLoggued) {
            that.delayInfoLoggued = true;
            that._logger.log("info", LOG_ID + "(markAlertMessageAsReceived) DelayToSendReceipt (in ms) - Received:", that.delayToSendReceiptReceived, " - Read: ", that.delayToSendReceiptRead - that.delayToSendReceiptReceived);
        }

        return that._xmpp.markMessageAsReceived({
            "fromJid": jid,
            "id": messageXmppId
        }, "Headline", that.delayToSendReceiptReceived);
    }

    /**
     * @public
     * @method MarkAlertMessageAsRead
     * @instance
     * @async
     * @param {string} jid The Jid of the sender
     * @param {string} messageXmppId the Xmpp Id of the alert message
     * @description
     *    Mark as Read the specified alert message
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    MarkAlertMessageAsRead(jid: string, messageXmppId: string): Promise<any> {
        let that = this;
        /*if (!application.Restrictions.AlertMessage)
        {
            callback?.Invoke(new SdkResult<Boolean>("AlertMessage has not been allowed in Application.Restrictions object"));
            return;
        } // */

        return that._xmpp.markMessageAsRead({
            "fromJid": jid,
            "id": messageXmppId
        }, "Headline", that.delayToSendReceiptReceived);
        //callback?.Invoke(new SdkResult<Boolean>(true));
    }

//endregion Mark as Received / Read

//region DEVICE

    /**
     * @public
     * @method createDevice
     * @instance
     * @async
     * @param {AlertDevice} device Device to create.
     * @description
     *    Create a device which can receive Alerts(notifications) from the server
     *    AlertDevice.jid_im cannot be specified, it's always the Jid of the current user.
     *    if AlertDevice.jid_resource cannot be specified, it's always the Jid_resource of the current user.
     *    if AlertDevice.type is not specified, automatically it's set to "desktop"
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    createDevice(device: AlertDevice): Promise<any> {
        return this.createOrUpdateDevice(true, device);
    }

    /**
     * @public
     * @method updateDevice
     * @instance
     * @async
     * @param {AlertDevice} device Device to Update.
     * @description
     *    Update a device which can receive Alerts(notifications) from the server
     *    AlertDevice.CompanyId cannot be specified, it's always the Compnay of the current user
     *    AlertDevice.Jid_im cannot be specified, it's always the Jid of the current user: Contacts.GetCurrentContactJid()
     *    AlertDevice.Jid_resource cannot be specified, it's always the Jid_resource of the current user: Application.GetResourceId()
     *    if AlertDevice.Type is not specified, automatically it's set to "desktop"
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    updateDevice(device: AlertDevice): Promise<any> {
        return this.createOrUpdateDevice(false, device);
    }

    private createOrUpdateDevice(create: boolean, device: AlertDevice): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            /*
            if (!application.Restrictions.AlertMessage)
            {
                callback?.Invoke(new SdkResult<AlertDevice>("AlertMessage has not been allowed in Application.Restrictions object"));
                return;
            }
            // */


            if (device == null) {
                that._logger.log("warn", LOG_ID + "(createOrUpdateDevice) bad or empty 'device' parameter");
                that._logger.log("internalerror", LOG_ID + "(createOrUpdateDevice) bad or empty 'device' parameter : ", device);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            let body = {
                "name": device.name,
                "tags": device.tags,
                "ipAddresses": device.ipAddresses,
                "macAddresses": device.macAddresses,
                "geolocation ": device.geolocation,
                "type": (!device.type || device.type === "") ? "desktop" : device.type,
                "jid_resource": that._xmpp.resourceId
            };

            if (create) {
                that._rest.createDevice(body).then(function (json) {
                    that._logger.log("info", LOG_ID + "(createOrUpdateDevice) create successfull");
                    resolve(json);
// TODO : make the AlertDevice with the result. And maybe the AlertDeviceData.
                    /*
                     String body = Util.GetJsonStringFromDictionary(bodyDico);
            restRequest.AddParameter("body", body, ParameterType.RequestBody);

            restClient.ExecuteAsync<AlertDeviceData>(restRequest).ContinueWith(task => {
                //Do we have a correct answer
                if (task.Result.IsSuccessful)
                    callback?.Invoke(new SdkResult<AlertDevice>(task.Result.Data.Data));
                else {
                    String
                    str = Sdk.ErrorFromResponse(task.Result).ToString();
                    callback?.Invoke(new SdkResult<AlertDevice>(str));
                    log.Warn("[createOrUpdateDevice] - error:[{0}]", str);
                }
            });
                     */

                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(createOrUpdateDevice) error.");
                    that._logger.log("internalerror", LOG_ID + "(createOrUpdateDevice) error : ", err);
                    return reject(err);
                });
            } else {
                // resource = rest.GetResource("notificationsadmin", $"devices/{device.Id}");
                // restRequest = rest.GetRestRequest(resource, Method.PUT);
                that._rest.updateDevice(device.id, body).then(function (json) {
                    that._logger.log("info", LOG_ID + "(createOrUpdateDevice) create successfull");
                    resolve(json);
// TODO : make the AlertDevice with the result. And maybe the AlertDeviceData.
                    /*
                     String body = Util.GetJsonStringFromDictionary(bodyDico);
            restRequest.AddParameter("body", body, ParameterType.RequestBody);

            restClient.ExecuteAsync<AlertDeviceData>(restRequest).ContinueWith(task => {
                //Do we have a correct answer
                if (task.Result.IsSuccessful)
                    callback?.Invoke(new SdkResult<AlertDevice>(task.Result.Data.Data));
                else {
                    String
                    str = Sdk.ErrorFromResponse(task.Result).ToString();
                    callback?.Invoke(new SdkResult<AlertDevice>(str));
                    log.Warn("[createOrUpdateDevice] - error:[{0}]", str);
                }
            });
                     */

                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(createOrUpdateDevice) error.");
                    that._logger.log("internalerror", LOG_ID + "(createOrUpdateDevice) error : ", err);
                    return reject(err);
                });
            }

        });
    }

    /**
     * @public
     * @method deleteDevice
     * @instance
     * @async
     * @param {AlertDevice} device Device to delete.
     * @description
     *    Delete a device (using its id)
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    deleteDevice(device: AlertDevice): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            /*
            if (!application.Restrictions.AlertMessage)
            {
                callback?.Invoke(new SdkResult<AlertDevice>("AlertMessage has not been allowed in Application.Restrictions object"));
                return;
            }
            // */


            if (device == null) {
                that._logger.log("warn", LOG_ID + "(deleteDevice) bad or empty 'device' parameter");
                that._logger.log("internalerror", LOG_ID + "(deleteDevice) bad or empty 'device' parameter : ", device);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.deleteDevice(device.id).then(function (json) {
                that._logger.log("info", LOG_ID + "(deleteDevice) delete successfull");
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(deleteDevice) error.");
                that._logger.log("internalerror", LOG_ID + "(deleteDevice) error : ", err);
                return reject(err);
            });

        });
        /*    if (!application.Restrictions.AlertMessage)
        {
            callback?.Invoke(new SdkResult<Boolean>("AlertMessage has not been allowed in Application.Restrictions object"));
            return;
        }

        RestClient restClient = rest.GetClient();
        string resource = rest.GetResource("notificationsadmin", $"devices/{deviceId}");

        RestRequest restRequest = rest.GetRestRequest(resource, Method.DELETE);

        restClient.ExecuteAsync(restRequest).ContinueWith(task =>
        {
            //Do we have a correct answer
            if (task.Result.IsSuccessful)
            {
                callback?.Invoke(new SdkResult<Boolean>(true));
            }
            else
                callback?.Invoke(new SdkResult<Boolean>(Sdk.ErrorFromResponse(task.Result)));

        });
        // */
    }

    /**
     * @public
     * @method getDevice
     * @instance
     * @async
     * @param {string} deviceId Id of the device.
     * @description
     *    Get a device using its Id
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    getDevice(deviceId: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            /*
            if (!application.Restrictions.AlertMessage)
            {
                callback?.Invoke(new SdkResult<AlertDevice>("AlertMessage has not been allowed in Application.Restrictions object"));
                return;
            }
            // */


            if (deviceId == null) {
                that._logger.log("warn", LOG_ID + "(getDevice) bad or empty 'deviceId' parameter");
                that._logger.log("internalerror", LOG_ID + "(getDevice) bad or empty 'deviceId' parameter : ", deviceId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.getDevice(deviceId).then(function (json) {
                that._logger.log("info", LOG_ID + "(getDevice) get successfull");
// TODO : make the AlertDevice with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getDevice) error.");
                that._logger.log("internalerror", LOG_ID + "(getDevice) error : ", err);
                return reject(err);
            });

        });

        /* if (!application.Restrictions.AlertMessage)
            {
                callback?.Invoke(new SdkResult<AlertDevice>("AlertMessage has not been allowed in Application.Restrictions object"));
                return;
            }

            RestClient restClient = rest.GetClient();
            string resource = rest.GetResource("notificationsadmin", $"devices/{deviceId}");

            RestRequest restRequest = rest.GetRestRequest(resource, Method.GET);

            restClient.ExecuteAsync<AlertDeviceData>(restRequest).ContinueWith(task =>
            {
                //Do we have a correct answer
                if (task.Result.IsSuccessful)
                {
                    callback?.Invoke(new SdkResult<AlertDevice>(task.Result.Data.Data));
                }
                else
                    callback?.Invoke(new SdkResult<AlertDevice>(Sdk.ErrorFromResponse(task.Result)));

            });

         // */
    }

    /**
     * @public
     * @method getDevices
     * @instance
     * @async
     * @param {string} companyId Allows to filter device list on the companyId provided in this option. (optional) If companyId is not provided, the devices linked to all the companies that the administrator manage are returned.
     * @param {string} userId Allows to filter device list on the userId provided in this option. (optional) If the user has no admin rights, this filter is forced to the logged in user's id (i.e. the user can only list is own devices).
     * @param {string} deviceName Allows to filter device list on the name provided in this option. (optional) The filtering is case insensitive and on partial name match: all devices containing the provided name value will be returned(whatever the position of the match). Ex: if filtering is done on My, devices with the following names are match the filter 'My device', 'My phone', 'This is my device', ...
     * @param {string} type Allows to filter device list on the type provided in this option. (optional, exact match, case sensitive).
     * @param {string} tag Allows to filter device list on the tag provided in this option. (optional, exact match, case sensitive).
     * @param {number} offset Allow to specify the position of first device to retrieve (default value is 0 for the first device). Warning: if offset > total, no results are returned.
     * @param {number} limit Allow to specify the number of devices to retrieve.
     * @description
     *    Get list of devices
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    getDevices(companyId: string, userId: string, deviceName: string, type: string, tag: string, offset: number = 0, limit: number = 100): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {

            that._rest.getDevices(companyId, userId, deviceName, type, tag, offset, limit).then(function (json) {
                that._logger.log("info", LOG_ID + "(getDevices) get successfull");
// TODO : make a Data typed with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getDevices) error.");
                that._logger.log("internalerror", LOG_ID + "(getDevices) error : ", err);
                return reject(err);
            });

        });

        /*   if (!application.Restrictions.AlertMessage)
        {
            callback?.Invoke(new SdkResult<AlertDevicesData>("AlertMessage has not been allowed in Application.Restrictions object"));
            return;
        }

        RestClient restClient = rest.GetClient();
        string resource = rest.GetResource("notificationsadmin", "devices");

        RestRequest restRequest = rest.GetRestRequest(resource, Method.GET);

        if (!String.IsNullOrEmpty(companyId))
            restRequest.AddQueryParameter("companyId", companyId);

        if (!String.IsNullOrEmpty(userId))
            restRequest.AddQueryParameter("userId", userId);

        if (!String.IsNullOrEmpty(deviceName))
            restRequest.AddQueryParameter("name", deviceName);

        if (!String.IsNullOrEmpty(type))
            restRequest.AddQueryParameter("type", type);

        if (!String.IsNullOrEmpty(tag))
            restRequest.AddQueryParameter("tags", tag);

        restRequest.AddQueryParameter("limit", limit.ToString());
        restRequest.AddQueryParameter("offset", offset.ToString());
        restRequest.AddQueryParameter("format", "full");

        restClient.ExecuteAsync<AlertDevicesData>(restRequest).ContinueWith(task =>
        {
            //Do we have a correct answer
            if (task.Result.IsSuccessful)
            {
                callback?.Invoke(new SdkResult<AlertDevicesData>(task.Result.Data));
            }
            else
                callback?.Invoke(new SdkResult<AlertDevicesData>(Sdk.ErrorFromResponse(task.Result)));
        });

        // */
    }

    /**
     * @public
     * @method getDevicesTags
     * @instance
     * @async
     * @param {string} companyId Allows to list the tags set for devices associated to the companyIds provided in this option. (optional) If companyId is not provided, the tags being set for devices linked to all the companies that the administrator manage are returned.
     * @description
     *    Get list of all tags being assigned to devices of the compagnies managed by the administrator
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    getDevicesTags(companyId: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {

            that._rest.getDevicesTags(companyId).then(function (json) {
                that._logger.log("info", LOG_ID + "(getDevices) get successfull");
// TODO : make a Data typed with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getDevices) error.");
                that._logger.log("internalerror", LOG_ID + "(getDevices) error : ", err);
                return reject(err);
            });

        });


        /*  if (!application.Restrictions.AlertMessage)
      {
          callback?.Invoke(new SdkResult<List<String>>("AlertMessage has not been allowed in Application.Restrictions object"));
          return;
      }

      RestClient restClient = rest.GetClient();
      string resource = rest.GetResource("notificationsadmin", "devices/tags");

      RestRequest restRequest = rest.GetRestRequest(resource, Method.GET);

      if (!String.IsNullOrEmpty(companyId))
          restRequest.AddQueryParameter("companyId", companyId);

      restClient.ExecuteAsync(restRequest).ContinueWith(task =>
      {
          //Do we have a correct answer
          if (task.Result.IsSuccessful)
          {
              List<String> tags = new List<string>();
              var json = JsonConvert.DeserializeObject<dynamic>(task.Result.Content);
              JObject jObject = json["data"];
              if (jObject != null)
              {
                  if (jObject["tags"] != null)
                  {
                      JArray jArray = (JArray)jObject.GetValue("tags");
                      if (jArray != null)
                          tags = jArray.ToObject<List<String>>();
                  }
              }
              callback?.Invoke(new SdkResult<List<String>>(tags));
          }
          else
              callback?.Invoke(new SdkResult<List<String>>(Sdk.ErrorFromResponse(task.Result)));
      });
      // */
    }

//endregion DEVICE

//region TEMPLATE

    /**
     * @public
     * @method createTemplate
     * @instance
     * @async
     * @param {AlertTemplate} template Template to create.
     * @description
     *    Create a template
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    createTemplate(template: AlertTemplate): Promise<any> {
        return this.createOrUpdateTemplate(true, template);
    }

    /**
     * @public
     * @method updateTemplate
     * @instance
     * @async
     * @param {AlertTemplate} template Template to Update.
     * @description
     *    Update a template
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    updateTemplate(template: AlertTemplate): Promise<any> {
        return this.createOrUpdateTemplate(false, template);
    }

    private createOrUpdateTemplate(create: boolean, template: AlertTemplate): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {

            if (template == null) {
                that._logger.log("warn", LOG_ID + "(createOrUpdateDevice) bad or empty 'template' parameter");
                that._logger.log("internalerror", LOG_ID + "(createOrUpdateDevice) bad or empty 'template' parameter : ", template);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            let body = {
                "event": template.event,
                "companyId": template.companyId,

                "name": template.name,
                "senderName": template.senderName,
                "contact": template.contact,
                "description": template.description,
                "mimeType": isNullOrEmpty(template.mimeType) ? "text/plain" : template.mimeType,

                "headline": template.headline,
                "instruction ": template.instruction,

                "type": isNullOrEmpty(template.type) ? "cap" : template.type,
                "status": isNullOrEmpty(template.status) ? "Actual" : template.status,
                "scope": isNullOrEmpty(template.scope) ? "Public" : template.scope,
                "category": isNullOrEmpty(template.category) ? "Safety" : template.category,
                "urgency": isNullOrEmpty(template.urgency) ? "Immediate" : template.urgency,
                "severity": isNullOrEmpty(template.severity) ? "Severe" : template.severity,
                "certainty": isNullOrEmpty(template.certainty) ? "Observed" : template.certainty
            };

            if (create) {
                that._rest.createTemplate(body).then(function (json) {
                    that._logger.log("info", LOG_ID + "(createOrUpdateDevice) create successfull");
                    resolve(json);
// TODO : make the AlertDevice with the result. And maybe the AlertDeviceData.

                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(createOrUpdateDevice) error.");
                    that._logger.log("internalerror", LOG_ID + "(createOrUpdateDevice) error : ", err);
                    return reject(err);
                });
            } else {
                that._rest.updateTemplate(template.id, body).then(function (json) {
                    that._logger.log("info", LOG_ID + "(createOrUpdateDevice) create successfull");
                    resolve(json);
// TODO : make the AlertDevice with the result. And maybe the AlertDeviceData.

                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(createOrUpdateDevice) error.");
                    that._logger.log("internalerror", LOG_ID + "(createOrUpdateDevice) error : ", err);
                    return reject(err);
                });
            }

        });


        /*
            if (!application.Restrictions.AlertMessage)
        {
            callback?.Invoke(new SdkResult<AlertTemplate>("AlertMessage has not been allowed in Application.Restrictions object"));
            return;
        }

        if (template == null)
        {
            callback?.Invoke(new SdkResult<AlertTemplate>("AlertTemplate object is null"));
            return;
        }

        RestClient restClient = rest.GetClient();
        string resource;
        RestRequest restRequest;

        if (create)
        {
            resource = rest.GetResource("notificationsadmin", "templates");
            restRequest = rest.GetRestRequest(resource, Method.POST);
        }
        else
        {
            resource = rest.GetResource("notificationsadmin", $"templates/{template.Id}");
            restRequest = rest.GetRestRequest(resource, Method.PUT);
        }

        Dictionary<string, object> bodyDico = new Dictionary<string, object>
        {
        { "event", template.Event},
        { "companyId", template.CompanyId},

        { "name", template.Name},
        { "senderName", template.SenderName},
        { "contact", template.Contact},

        { "description", template.Description},
        { "mimeType", String.IsNullOrEmpty(template.MimeType) ? "text/plain" : template.MimeType},

        { "headline", template.Headline},
        { "instruction ", template.Instruction},

        { "type", String.IsNullOrEmpty(template.Type) ? "cap" : template.Type},
        { "status", String.IsNullOrEmpty(template.Status) ? "Actual" : template.Status},
        { "scope", String.IsNullOrEmpty(template.Scope) ? "Public" : template.Scope},
        { "category", String.IsNullOrEmpty(template.Category) ? "Safety" : template.Category},
        { "urgency", String.IsNullOrEmpty(template.Urgency) ? "Immediate" : template.Urgency},
        { "severity", String.IsNullOrEmpty(template.Severity) ? "Severe" : template.Severity},
        { "certainty", String.IsNullOrEmpty(template.Certainty) ? "Observed" : template.Certainty}
        };

        String body = Util.GetJsonStringFromDictionary(bodyDico);
        restRequest.AddParameter("body", body, ParameterType.RequestBody);

        restClient.ExecuteAsync<AlertTemplateData>(restRequest).ContinueWith(task =>
        {
            //Do we have a correct answer
            if (task.Result.IsSuccessful)
                callback?.Invoke(new SdkResult<AlertTemplate>(task.Result.Data.Data));
            else
            {
                String str = Sdk.ErrorFromResponse(task.Result).ToString();
                callback?.Invoke(new SdkResult<AlertTemplate>(str));
                log.Warn("[CreateOrUpdateTemplate] - error:[{0}]", str);
            }
        });

        // */
    }

    /**
     * @public
     * @method deleteTemplate
     * @instance
     * @async
     * @param {AlertTemplate} template Template to Delete.
     * @description
     *    Delete a template
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    deleteTemplate(template: AlertTemplate): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            /*
            if (!application.Restrictions.AlertMessage)
            {
                callback?.Invoke(new SdkResult<AlertDevice>("AlertMessage has not been allowed in Application.Restrictions object"));
                return;
            }
            // */


            if (template == null) {
                that._logger.log("warn", LOG_ID + "(deleteTemplate) bad or empty 'template' parameter");
                that._logger.log("internalerror", LOG_ID + "(deleteTemplate) bad or empty 'template' parameter : ", template);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.deleteTemplate(template.id).then(function (json) {
                that._logger.log("info", LOG_ID + "(deleteTemplate) delete successfull");
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(deleteTemplate) error.");
                that._logger.log("internalerror", LOG_ID + "(deleteTemplate) error : ", err);
                return reject(err);
            });

        });
        /* if (!application.Restrictions.AlertMessage)
    {
        callback?.Invoke(new SdkResult<Boolean>("AlertMessage has not been allowed in Application.Restrictions object"));
        return;
    }

    RestClient restClient = rest.GetClient();
    string resource = rest.GetResource("notificationsadmin", $"templates/{templateId}");

    RestRequest restRequest = rest.GetRestRequest(resource, Method.DELETE);

    restClient.ExecuteAsync(restRequest).ContinueWith(task =>
    {
        //Do we have a correct answer
        if (task.Result.IsSuccessful)
        {
            callback?.Invoke(new SdkResult<Boolean>(true));
        }
        else
            callback?.Invoke(new SdkResult<Boolean>(Sdk.ErrorFromResponse(task.Result)));

    });
    // */
    }

    /**
     * @public
     * @method getTemplate
     * @instance
     * @async
     * @param {string} templateId Id of the template.
     * @description
     *    Get an template by id
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    getTemplate(templateId: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            /*
            if (!application.Restrictions.AlertMessage)
            {
                callback?.Invoke(new SdkResult<AlertDevice>("AlertMessage has not been allowed in Application.Restrictions object"));
                return;
            }
            // */


            if (templateId == null) {
                that._logger.log("warn", LOG_ID + "(getTemplate) bad or empty 'templateId' parameter");
                that._logger.log("internalerror", LOG_ID + "(getTemplate) bad or empty 'templateId' parameter : ", templateId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.getTemplate(templateId).then(function (json) {
                that._logger.log("info", LOG_ID + "(getTemplate) get successfull");
// TODO : make the AlertTemplate with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getTemplate) error.");
                that._logger.log("internalerror", LOG_ID + "(getTemplate) error : ", err);
                return reject(err);
            });

        });
        /*
    if (!application.Restrictions.AlertMessage)
    {
        callback?.Invoke(new SdkResult<AlertTemplate>("AlertMessage has not been allowed in Application.Restrictions object"));
        return;
    }

    RestClient restClient = rest.GetClient();
    string resource = rest.GetResource("notificationsadmin", $"templates/{templateId}");

    RestRequest restRequest = rest.GetRestRequest(resource, Method.GET);

    restClient.ExecuteAsync<AlertTemplateData>(restRequest).ContinueWith(task =>
    {
        //Do we have a correct answer
        if (task.Result.IsSuccessful)
        {
            callback?.Invoke(new SdkResult<AlertTemplate>(task.Result.Data.Data));
        }
        else
            callback?.Invoke(new SdkResult<AlertTemplate>(Sdk.ErrorFromResponse(task.Result)));

    });
    // */
    }

    /**
     * @public
     * @method getTemplates
     * @instance
     * @async
     * @param {string} companyId Id of the company (optional).
     * @param {number} offset Offset to use to retrieve templates - if offset > total, no result is returned.
     * @param {number} limit Limit of templates to retrieve (100 by default).
     * @description
     *    Get templates
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    getTemplates(companyId: string, offset: number = 0, limit: number = 100): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {

            that._rest.getTemplates(companyId, offset, limit).then(function (json) {
                that._logger.log("info", LOG_ID + "(getTemplates) get successfull");
// TODO : make a Data typed with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getTemplates) error.");
                that._logger.log("internalerror", LOG_ID + "(getTemplates) error : ", err);
                return reject(err);
            });

        });
        /*
    if (!application.Restrictions.AlertMessage)
    {
        callback?.Invoke(new SdkResult<AlertTemplatesData>("AlertMessage has not been allowed in Application.Restrictions object"));
        return;
    }

    RestClient restClient = rest.GetClient();
    string resource = rest.GetResource("notificationsadmin", "templates");

    RestRequest restRequest = rest.GetRestRequest(resource, Method.GET);

    if (!String.IsNullOrEmpty(companyId))
        restRequest.AddQueryParameter("companyId", companyId);

    restRequest.AddQueryParameter("limit", limit.ToString());
    restRequest.AddQueryParameter("offset", offset.ToString());
    restRequest.AddQueryParameter("format", "full");

    restClient.ExecuteAsync<AlertTemplatesData>(restRequest).ContinueWith(task =>
    {
        //Do we have a correct answer
        if (task.Result.IsSuccessful)
        {
            callback?.Invoke(new SdkResult<AlertTemplatesData>(task.Result.Data));
        }
        else
            callback?.Invoke(new SdkResult<AlertTemplatesData>(Sdk.ErrorFromResponse(task.Result)));
    });
    // */
    }

//endregion TEMPLATE

//region FILTERS

    /**
     * @public
     * @method createFilter
     * @instance
     * @async
     * @param {AlertFilter} filter Filter to create.
     * @description
     *    Create a filter
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    createFilter(filter: AlertFilter): Promise<any> {
        return this.createOrUpdateFilter(true, filter);
    }

    /**
     * @public
     * @method updateFilter
     * @instance
     * @async
     * @param {AlertFilter} filter Filter to Update.
     * @description
     *    Update a filter
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    updateFilter(filter: AlertFilter) {
        return this.createOrUpdateFilter(false, filter);
    }

    createOrUpdateFilter(create: boolean, filter: AlertFilter): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {

            if (filter == null) {
                that._logger.log("warn", LOG_ID + "(createOrUpdateFilter) bad or empty 'filter' parameter");
                that._logger.log("internalerror", LOG_ID + "(createOrUpdateFilter) bad or empty 'filter' parameter : ", filter);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            let body = {
                "name": filter.name,
                "companyId": filter.companyId,
                "tags": filter.tags
            };

            if (create) {
                that._rest.createFilter(body).then(function (json) {
                    that._logger.log("info", LOG_ID + "(createOrUpdateFilter) create successfull");
                    resolve(json);
// TODO : make the AlertFilter with the result. And maybe the AlertDeviceData.

                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(createOrUpdateFilter) error.");
                    that._logger.log("internalerror", LOG_ID + "(createOrUpdateFilter) error : ", err);
                    return reject(err);
                });
            } else {
                that._rest.updateFilter(filter.id, body).then(function (json) {
                    that._logger.log("info", LOG_ID + "(createOrUpdateFilter) create successfull");
                    resolve(json);
// TODO : make the AlertFilter with the result. And maybe the AlertDeviceData.

                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(createOrUpdateFilter) error.");
                    that._logger.log("internalerror", LOG_ID + "(createOrUpdateFilter) error : ", err);
                    return reject(err);
                });
            }

        });


        /*
    if (filter == null)
    {
        callback?.Invoke(new SdkResult<AlertFilter>("Filter object is null"));
        return;
    }

    if (!application.Restrictions.AlertMessage)
    {
        callback?.Invoke(new SdkResult<AlertFilter>("AlertMessage has not been allowed in Application.Restrictions object"));
        return;
    }

    RestClient restClient = rest.GetClient();
    string resource;
    RestRequest restRequest;

    if (create)
    {
        resource = rest.GetResource("notificationsadmin", "filters");
        restRequest = rest.GetRestRequest(resource, Method.POST);
    }
    else
    {
        resource = rest.GetResource("notificationsadmin", $"filters/{filter.Id}");
        restRequest = rest.GetRestRequest(resource, Method.PUT);
    }

    Dictionary<string, object> bodyDico = new Dictionary<string, object>
    {
    { "name", filter.Name},
    { "companyId", filter.CompanyId},
    { "tags", filter.Tags}
    };

    String body = Util.GetJsonStringFromDictionary(bodyDico);
    restRequest.AddParameter("body", body, ParameterType.RequestBody);

    restClient.ExecuteAsync<AlertFilterData>(restRequest).ContinueWith(task =>
    {
        //Do we have a correct answer
        if (task.Result.IsSuccessful)
        {
            callback?.Invoke(new SdkResult<AlertFilter>(task.Result.Data.Data));
        }
        else
        {
            String str = Sdk.ErrorFromResponse(task.Result).ToString();
            callback?.Invoke(new SdkResult<AlertFilter>(str));
            log.Warn("[CreateOrUpdateAlert] - error:[{0}]", str);
        }
    });
    // */
    }

    /**
     * @public
     * @method deleteFilter
     * @instance
     * @async
     * @param {AlertFilter} filter Filter to Delete.
     * @description
     *    Delete a filter
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    deleteFilter(filter: AlertFilter): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            /*
            if (!application.Restrictions.AlertMessage)
            {
                callback?.Invoke(new SdkResult<AlertDevice>("AlertMessage has not been allowed in Application.Restrictions object"));
                return;
            }
            // */


            if (filter == null) {
                that._logger.log("warn", LOG_ID + "(deleteFilter) bad or empty 'filter' parameter");
                that._logger.log("internalerror", LOG_ID + "(deleteFilter) bad or empty 'filter' parameter : ", filter);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.deleteFilter(filter.id).then(function (json) {
                that._logger.log("info", LOG_ID + "(deleteFilter) delete successfull");
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(deleteFilter) error.");
                that._logger.log("internalerror", LOG_ID + "(deleteFilter) error : ", err);
                return reject(err);
            });

        });

        /*
if (!application.Restrictions.AlertMessage)
{
    callback?.Invoke(new SdkResult<Boolean>("AlertMessage has not been allowed in Application.Restrictions object"));
    return;
}

RestClient restClient = rest.GetClient();
String resource = rest.GetResource("notificationsadmin", $"filters/{filterId}");

RestRequest restRequest = rest.GetRestRequest(resource, Method.DELETE);

restClient.ExecuteAsync(restRequest).ContinueWith(task =>
{
    //Do we have a correct answer
    if (task.Result.IsSuccessful)
    {
        callback?.Invoke(new SdkResult<Boolean>(true));
    }
    else
        callback?.Invoke(new SdkResult<Boolean>(Sdk.ErrorFromResponse(task.Result)));

});
// */
    }

    /**
     * @public
     * @method getFilter
     * @instance
     * @async
     * @param {string} filterId Id of the Filter.
     * @description
     *    Get an filter by id
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    getFilter(filterId: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            /*
            if (!application.Restrictions.AlertMessage)
            {
                callback?.Invoke(new SdkResult<AlertDevice>("AlertMessage has not been allowed in Application.Restrictions object"));
                return;
            }
            // */


            if (filterId == null) {
                that._logger.log("warn", LOG_ID + "(getFilter) bad or empty 'filterId' parameter");
                that._logger.log("internalerror", LOG_ID + "(getFilter) bad or empty 'filterId' parameter : ", filterId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.getFilter(filterId).then(function (json) {
                that._logger.log("info", LOG_ID + "(getFilter) get successfull");
// TODO : make the AlertTemplate with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getFilter) error.");
                that._logger.log("internalerror", LOG_ID + "(getFilter) error : ", err);
                return reject(err);
            });

        });
        /*
        if (!application.Restrictions.AlertMessage)
        {
            callback?.Invoke(new SdkResult<AlertFilter>("AlertMessage has not been allowed in Application.Restrictions object"));
            return;
        }

        RestClient restClient = rest.GetClient();
        String resource = rest.GetResource("notificationsadmin", $"filters/{filterId}");

        RestRequest restRequest = rest.GetRestRequest(resource, Method.GET);

        restClient.ExecuteAsync<AlertFilterData>(restRequest).ContinueWith(task =>
        {
            //Do we have a correct answer
            if (task.Result.IsSuccessful)
            {
                callback?.Invoke(new SdkResult<AlertFilter>(task.Result.Data.Data));
            }
            else
            {
                String str = Sdk.ErrorFromResponse(task.Result).ToString();
                callback?.Invoke(new SdkResult<AlertFilter>(str));
                log.Warn("[CreateOrUpdateAlert] - error:[{0}]", str);
            }
        });
        // */
    }

    /**
     * @public
     * @method getFilters
     * @instance
     * @async
     * @param {number} offset Offset to use to retrieve filters - if offset > total, no result is returned.
     * @param {number} limit Limit of filters to retrieve (100 by default).
     * @description
     *    Get filters : have required role(s) superadmin, admin
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    getFilters(offset: number = 0, limit: number = 100): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {

            that._rest.getFilters(offset, limit).then(function (json) {
                that._logger.log("info", LOG_ID + "(getFilters) get successfull");
// TODO : make a Data typed with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getFilters) error.");
                that._logger.log("internalerror", LOG_ID + "(getFilters) error : ", err);
                return reject(err);
            });

        });

        /*
                if (!application.Restrictions.AlertMessage)
        {
            callback?.Invoke(new SdkResult<AlertFiltersData>("AlertMessage has not been allowed in Application.Restrictions object"));
            return;
        }

        RestClient restClient = rest.GetClient();
        String resource = rest.GetResource("notificationsadmin", $"filters");

        RestRequest restRequest = rest.GetRestRequest(resource, Method.GET);

        restRequest.AddQueryParameter("limit", limit.ToString());
        restRequest.AddQueryParameter("offset", offset.ToString());
        restRequest.AddQueryParameter("format", "full");

        restClient.ExecuteAsync<AlertFiltersData>(restRequest).ContinueWith(task =>
        {
            //Do we have a correct answer
            if (task.Result.IsSuccessful)
            {
                callback?.Invoke(new SdkResult<AlertFiltersData>(task.Result.Data));
            }
            else
                callback?.Invoke(new SdkResult<AlertFiltersData>(Sdk.ErrorFromResponse(task.Result)));
        });
        // */
    }

//endregion FILTERS

//region CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS

    /**
     * @public
     * @method createAlert
     * @instance
     * @async
     * @param {Alert} alert Alert to send.
     * @description
     *    To create an alert. The alert will be sent using the StartDate of the Alert object (so it's possible to set it in future).
     *    The alert will be received by devices according the filter id and the company id used.
     *    The content of the alert is based on the template id.
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    createAlert(alert: Alert): Promise<any> {
        return this.createOrUpdateAlert(true, alert);
    }

    /**
     * @public
     * @method updateAlert
     * @instance
     * @async
     * @param {Alert} alert Alert to update.
     * @description
     *    To update an existing alert. The alert will be sent using the StartDate of the Alert object (so it's possible to set it in future).
     *    The alert will be received by devices according the filter id and the company id used.
     *    The content of the alert is based on the template id.
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    updateAlert(alert: Alert): Promise<any> {
        return this.createOrUpdateAlert(false, alert);
    }

    createOrUpdateAlert(create: boolean, alert: Alert): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {

            if (alert == null) {
                that._logger.log("warn", LOG_ID + "(createOrUpdateAlert) bad or empty 'alert' parameter");
                that._logger.log("internalerror", LOG_ID + "(createOrUpdateAlert) bad or empty 'alert' parameter : ", alert);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            let date: Date = alert.startDate ? new Date(alert.startDate) : new Date();
            let expirationDate = alert.expirationDate ? new Date(alert.expirationDate) : new Date();

            expirationDate.setDate(expirationDate.getDate() + 1);
            let body = {
                "companyId": alert.companyId,

                "notificationTemplateId": alert.templateId,
                "notificationFilterId": alert.filterId,

                "startDate": date.toISOString(),
                "expirationDate": expirationDate.toISOString()
            };

            that._logger.log("info", LOG_ID + "(createOrUpdateAlert) body : ", body);

            if (create) {
                that._rest.createAlert(body).then(function (json) {
                    that._logger.log("info", LOG_ID + "(createOrUpdateAlert) create successfull");
                    resolve(json);
// TODO : make the AlertFilter with the result. And maybe the AlertDeviceData.

                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(createOrUpdateAlert) error.");
                    that._logger.log("internalerror", LOG_ID + "(createOrUpdateAlert) error : ", err);
                    return reject(err);
                });
            } else {
                that._rest.updateAlert(alert.id, body).then(function (json) {
                    that._logger.log("info", LOG_ID + "(createOrUpdateAlert) create successfull");
                    resolve(json);
// TODO : make the AlertFilter with the result. And maybe the AlertDeviceData.

                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(createOrUpdateAlert) error.");
                    that._logger.log("internalerror", LOG_ID + "(createOrUpdateAlert) error : ", err);
                    return reject(err);
                });
            }

        });

        /*
                if (!application.Restrictions.AlertMessage)
        {
            callback?.Invoke(new SdkResult<Alert>("AlertMessage has not been allowed in Application.Restrictions object"));
            return;
        }

        if (alert == null)
        {
            callback?.Invoke(new SdkResult<Alert>("Alert object is null"));
            return;
        }

        RestClient restClient = rest.GetClient();
        string resource;
        RestRequest restRequest;

        if (create)
        {
            resource = rest.GetResource("notifications", "notifications");
            restRequest = rest.GetRestRequest(resource, Method.POST);
        }
        else
        {
            resource = rest.GetResource("notifications", $"notifications/{alert.Id}");
            restRequest = rest.GetRestRequest(resource, Method.PUT);
        }

        Dictionary<string, object> bodyDico = new Dictionary<string, object>
        {
        { "companyId", alert.CompanyId },

        { "notificationTemplateId", alert.TemplateId },
        { "notificationFilterId", alert.FilterId },

        { "startDate", alert.StartDate.ToString("o") },
        { "expirationDate", alert.ExpirationDate.ToString("o") }
        };

        String body = Util.GetJsonStringFromDictionary(bodyDico);
        restRequest.AddParameter("body", body, ParameterType.RequestBody);

        restClient.ExecuteAsync(restRequest).ContinueWith(task =>
        {
            //Do we have a correct answer
            if (task.Result.IsSuccessful)
            {
                var json = JsonConvert.DeserializeObject<dynamic>(task.Result.Content);
                JObject jObject = json["data"];

                Alert newAlert = GetAlertFromJObject(jObject);
                callback?.Invoke(new SdkResult<Alert>(newAlert));
            }
            else
            {
                String str = Sdk.ErrorFromResponse(task.Result).ToString();
                callback?.Invoke(new SdkResult<Alert>(str));
                log.Warn("[CreateOrUpdateAlert] - error:[{0}]", str);
            }
        });
        // */
    }

    /*
    private Alert GetAlertFromJObject(JObject jObject)
    {
    Alert newAlert = new Alert();
    if (jObject != null)
    {
        newAlert.Id = jObject.GetValue("id").ToString();
        newAlert.CompanyId = jObject.GetValue("companyId")?.ToString();
        newAlert.Status = jObject.GetValue("status")?.ToString();
        newAlert.FilterId = jObject.GetValue("notificationFilterId")?.ToString();

        JArray jArray = (JArray)jObject["history"];
        if(jArray != null)
        {
            // Get always the last entry
            JObject jHistory = (JObject)jArray[jArray.Count - 1];
            if (jHistory != null)
            {
                newAlert.TemplateId = jHistory.GetValue("notificationTemplateId")?.ToString();

                DateTime date = DateTime.MinValue;
                if (jHistory["sentDate"] != null)
                    DateTime.TryParse(jHistory.GetValue("sentDate").ToString(), out date);
                newAlert.StartDate = date;

                date = DateTime.MinValue;
                if (jHistory["expirationDate"] != null)
                    DateTime.TryParse(jHistory.GetValue("expirationDate").ToString(), out date);
                newAlert.ExpirationDate = date;
            }
        }
    }
    return newAlert;
    }
    // */

    /**
     * @public
     * @method deleteAlert
     * @instance
     * @async
     * @param {Alert} alert Alert to Delete.
     * @description
     *    Delete an alert
     *    All the data related to this notification are deleted, including the reports
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    deleteAlert(alert: Alert): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            /*
            if (!application.Restrictions.AlertMessage)
            {
                callback?.Invoke(new SdkResult<AlertDevice>("AlertMessage has not been allowed in Application.Restrictions object"));
                return;
            }
            // */


            if (alert == null) {
                that._logger.log("warn", LOG_ID + "(deleteAlert) bad or empty 'alert' parameter");
                that._logger.log("internalerror", LOG_ID + "(deleteAlert) bad or empty 'alert' parameter : ", alert);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.deleteAlert(alert.id).then(function (json) {
                that._logger.log("info", LOG_ID + "(deleteAlert) delete successfull");
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(deleteAlert) error.");
                that._logger.log("internalerror", LOG_ID + "(deleteAlert) error : ", err);
                return reject(err);
            });

        });

        /*
            if (!application.Restrictions.AlertMessage)
        {
            callback?.Invoke(new SdkResult<Boolean>("AlertMessage has not been allowed in Application.Restrictions object"));
            return;
        }

        RestClient restClient = rest.GetClient();
        String resource = rest.GetResource("notifications", $"notifications/{alertId}");

        RestRequest restRequest = rest.GetRestRequest(resource, Method.DELETE);

        restClient.ExecuteAsync(restRequest).ContinueWith(task =>
        {
            //Do we have a correct answer
            if (task.Result.IsSuccessful)
            {
                callback?.Invoke(new SdkResult<Boolean>(true));
            }
            else
                callback?.Invoke(new SdkResult<Boolean>(Sdk.ErrorFromResponse(task.Result)));

        });
        // */
    }

    /**
     * @public
     * @method getAlert
     * @instance
     * @async
     * @param {string} alertId Id of the alert.
     * @description
     *    Get an alert by id
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    getAlert(alertId: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            /*
            if (!application.Restrictions.AlertMessage)
            {
                callback?.Invoke(new SdkResult<AlertDevice>("AlertMessage has not been allowed in Application.Restrictions object"));
                return;
            }
            // */

            if (alertId == null) {
                that._logger.log("warn", LOG_ID + "(getAlert) bad or empty 'alertId' parameter");
                that._logger.log("internalerror", LOG_ID + "(getAlert) bad or empty 'alertId' parameter : ", alertId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.getAlert(alertId).then(function (json) {
                that._logger.log("info", LOG_ID + "(getAlert) get successfull");
// TODO : make the Alert with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getAlert) error.");
                that._logger.log("internalerror", LOG_ID + "(getAlert) error : ", err);
                return reject(err);
            });

        });
        /*
    if (!application.Restrictions.AlertMessage)
    {
        callback?.Invoke(new SdkResult<Alert>("AlertMessage has not been allowed in Application.Restrictions object"));
        return;
    }

    RestClient restClient = rest.GetClient();
    String resource = rest.GetResource("notifications", $"notifications/{alertId}");

    RestRequest restRequest = rest.GetRestRequest(resource, Method.GET);

    restClient.ExecuteAsync(restRequest).ContinueWith(task =>
    {
        //Do we have a correct answer
        if (task.Result.IsSuccessful)
        {
            var json = JsonConvert.DeserializeObject<dynamic>(task.Result.Content);
            JObject jObject = json["data"];

            Alert newAlert = GetAlertFromJObject(jObject);
            callback?.Invoke(new SdkResult<Alert>(newAlert));
        }
        else
            callback?.Invoke(new SdkResult<Alert>(Sdk.ErrorFromResponse(task.Result)));

    });
    // */
    }

    /**
     * @public
     * @method getAlerts
     * @instance
     * @async
     * @param {number} offset Offset to use to retrieve Alerts - if offset > total, no result is returned.
     * @param {number} limit Limit of Alerts to retrieve (100 by default).
     * @description
     *    Get alerts : required role(s) superadmin,support,admin
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    getAlerts(offset: number = 0, limit: number = 100): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {

            that._rest.getAlerts(offset, limit).then(function (json) {
                that._logger.log("info", LOG_ID + "(getAlerts) get successfull");
// TODO : make a Data typed with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getAlerts) error.");
                that._logger.log("internalerror", LOG_ID + "(getAlerts) error : ", err);
                return reject(err);
            });

        });
        /*
    if (!application.Restrictions.AlertMessage)
    {
        callback?.Invoke(new SdkResult<AlertsData>("AlertMessage has not been allowed in Application.Restrictions object"));
        return;
    }

    RestClient restClient = rest.GetClient();
    String resource = rest.GetResource("notifications", $"notifications");

    RestRequest restRequest = rest.GetRestRequest(resource, Method.GET);

    restRequest.AddQueryParameter("limit", limit.ToString());
    restRequest.AddQueryParameter("offset", offset.ToString());
    restRequest.AddQueryParameter("format", "full");

    restClient.ExecuteAsync(restRequest).ContinueWith(task =>
    {
        //Do we have a correct answer
        if (task.Result.IsSuccessful)
        {
            AlertsData alertsData = new AlertsData();
            var json = JsonConvert.DeserializeObject<dynamic>(task.Result.Content);

            alertsData.Total = json.GetValue("total").ToObject<int>();
            alertsData.Limit = json.GetValue("limit").ToObject<int>();
            alertsData.Offset = json.GetValue("offset").ToObject<int>();

            alertsData.Data = new List<Alert>();
            if (json["data"] != null)
            {
                Alert newAlert;
                JArray jArray = (JArray)json["data"];
                foreach(JToken jToken in jArray)
                {
                    newAlert = GetAlertFromJObject((JObject)jToken);
                    alertsData.Data.Add(newAlert);
                }
            }
            callback?.Invoke(new SdkResult<AlertsData>(alertsData));
        }
        else
            callback?.Invoke(new SdkResult<AlertsData>(Sdk.ErrorFromResponse(task.Result)));
    });
    // */
    }

    /**
     * @public
     * @method sendAlertFeedback
     * @instance
     * @async
     * @param {string} deviceId Id of the device.
     * @param {string} alertId Id of the alert.
     * @param {string} answerId Id of the answer.
     * @description
     *    To send a feedback from an alert.
     *    To be used by end-user who has received the alert
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    sendAlertFeedback(deviceId: string, alertId: string, answerId: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {

            if (deviceId == null) {
                that._logger.log("warn", LOG_ID + "(createOrUpdateAlert) bad or empty 'deviceId' parameter");
                that._logger.log("internalerror", LOG_ID + "(createOrUpdateAlert) bad or empty 'deviceId' parameter : ", deviceId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            if (alertId == null) {
                that._logger.log("warn", LOG_ID + "(createOrUpdateAlert) bad or empty 'alertId' parameter");
                that._logger.log("internalerror", LOG_ID + "(createOrUpdateAlert) bad or empty 'alertId' parameter : ", alertId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            if (answerId == null) {
                that._logger.log("warn", LOG_ID + "(createOrUpdateAlert) bad or empty 'answerId' parameter");
                that._logger.log("internalerror", LOG_ID + "(createOrUpdateAlert) bad or empty 'answerId' parameter : ", answerId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            let body = {
                "deviceId": deviceId,
                "data": {"answerId": answerId}
            };


            that._rest.sendAlertFeedback(alertId, body).then(function (json) {
                that._logger.log("info", LOG_ID + "(createOrUpdateAlert) create successfull");
                resolve(json);
// TODO : make the Alert with the result. And maybe the AlertDeviceData.

            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(createOrUpdateAlert) error.");
                that._logger.log("internalerror", LOG_ID + "(createOrUpdateAlert) error : ", err);
                return reject(err);
            });
        });

        /*
    if (!application.Restrictions.AlertMessage)
    {
        callback?.Invoke(new SdkResult<Boolean>("AlertMessage has not been allowed in Application.Restrictions object"));
        return;
    }

    RestClient restClient = rest.GetClient();
    string resource;
    RestRequest restRequest;

    resource = rest.GetResource("notifications", $"notifications/{alertId}/feedback");
    restRequest = rest.GetRestRequest(resource, Method.POST);

    string body = string.Format(@"{{ ""deviceId"": ""{0}"", ""data"": {{ ""answerId"": ""{1}"" }} }}", deviceId, answerId);
    restRequest.AddParameter("body", body, ParameterType.RequestBody);

    restClient.ExecuteAsync(restRequest).ContinueWith(task =>
    {
        //Do we have a correct answer
        if (task.Result.IsSuccessful)
            callback?.Invoke(new SdkResult<Boolean>(true));
        else
            callback?.Invoke(new SdkResult<Boolean>(Sdk.ErrorFromResponse(task.Result)));
    });
    // */
    }

//endregion CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS

//region REPORTS

    /**
     * @public
     * @method getReportSummary
     * @instance
     * @async
     * @param {string} alertId Id of the alert.
     * @description
     *    Allow to retrieve the list of summary reports of an alert (initial alert plus alerts update if any).
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    getReportSummary(alertId: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            if (alertId == null) {
                that._logger.log("warn", LOG_ID + "(getReportSummary) bad or empty 'alertId' parameter");
                that._logger.log("internalerror", LOG_ID + "(getReportSummary) bad or empty 'alertId' parameter : ", alertId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.getReportSummary(alertId).then(function (json) {
                that._logger.log("info", LOG_ID + "(getReportSummary) get successfull");
// TODO : make a Data typed with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getReportSummary) error.");
                that._logger.log("internalerror", LOG_ID + "(getReportSummary) error : ", err);
                return reject(err);
            });

        });

        /*
    if (!application.Restrictions.AlertMessage)
    {
        callback?.Invoke(new SdkResult<List<AlertReportSummary>>("AlertMessage has not been allowed in Application.Restrictions object"));
        return;
    }

    RestClient restClient = rest.GetClient();
    string resource = rest.GetResource("notificationsreport", $"/notifications/{alertId}/reports/summary");

    RestRequest restRequest = rest.GetRestRequest(resource, Method.GET);

    restClient.ExecuteAsync<AlertReportSummaryData>(restRequest).ContinueWith(task =>
    {
        //Do we have a correct answer
        if (task.Result.IsSuccessful)
        {
            callback?.Invoke(new SdkResult<List<AlertReportSummary>>(task.Result.Data.Data));
        }
        else
            callback?.Invoke(new SdkResult<List<AlertReportSummary>>(Sdk.ErrorFromResponse(task.Result)));

    });
    // */
    }

    /**
     * @public
     * @method getReportDetails
     * @instance
     * @async
     * @param {string} alertId Id of the alert.
     * @description
     *    Allow to retrieve detail the list of detail reports of a alert (initial alert plus alerts update if any).
     * @return {Promise<any>} the result of the operation.
     * @category async
     */
    getReportDetails(alertId: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            if (alertId == null) {
                that._logger.log("warn", LOG_ID + "(getReportDetails) bad or empty 'alertId' parameter");
                that._logger.log("internalerror", LOG_ID + "(getReportDetails) bad or empty 'alertId' parameter : ", alertId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.getReportDetails(alertId).then(function (json) {
                that._logger.log("info", LOG_ID + "(getReportDetails) get successfull");
// TODO : make a Data typed with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getReportDetails) error.");
                that._logger.log("internalerror", LOG_ID + "(getReportDetails) error : ", err);
                return reject(err);
            });

        });

        /*
    if(!application.Restrictions.AlertMessage)
    {
        callback?.Invoke(new SdkResult<List<AlertReportDetails>>("AlertMessage has not been allowed in Application.Restrictions object"));
        return;
    }

    RestClient restClient = rest.GetClient();
    string resource = rest.GetResource("notificationsreport", $"/notifications/{alertId}/reports/details");

    RestRequest restRequest = rest.GetRestRequest(resource, Method.GET);

    restClient.ExecuteAsync<AlertReportDetailsData>(restRequest).ContinueWith(task =>
    {
        //Do we have a correct answer
        if (task.Result.IsSuccessful)
        {
            callback?.Invoke(new SdkResult<List<AlertReportDetails>>(task.Result.Data.Data));
        }
        else
            callback?.Invoke(new SdkResult<List<AlertReportDetails>>(Sdk.ErrorFromResponse(task.Result)));

    });
    // */
    }

//endregion REPORTS

//endregion PUBLIC API


}

module.exports.AlertsService = AlertsService;
export {AlertsService};
