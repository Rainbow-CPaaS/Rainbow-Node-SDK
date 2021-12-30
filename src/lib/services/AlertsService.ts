"use strict";
import {Logger} from "../common/Logger";

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {isNullOrEmpty, logEntryExit} from "../common/Utils";
import * as PubSub from "pubsub-js";
import {AlertEventHandler} from '../connection/XMPPServiceHandler/alertEventHandler';
import {Alert, AlertsData} from '../common/models/Alert';
import {ErrorManager} from "../common/ErrorManager";
import {isStarted} from "../common/Utils";
import {EventEmitter} from "events";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import {List} from "ts-generic-collections-linq";
import {AlertDevice, AlertDevicesData} from "../common/models/AlertDevice";
import {AlertTemplate, AlertTemplatesData} from "../common/models/AlertTemplate";
import {AlertFilter, AlertFiltersData} from "../common/models/AlertFilter";
import {GenericService} from "./GenericService";

const LOG_ID = "ALERTS/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
    /**
     * @module
     * @name AlertsService
     * @version SDKVERSION
     * @public
     * @description
     *      This module is the basic module for handling Alerts in Rainbow.   <br>
     *   <br>
     *      Note: the Rainbow subscriptions "Alerts" is need to use the Alert notification system. <br>  
     */
class AlertsService extends GenericService{
    private _alertEventHandler: AlertEventHandler;
    private _alertHandlerToken: any;
    //public static $inject: string[] = ['$http', '$log', 'contactService', 'authService', 'roomService', 'conversationService', 'xmppService'];
    //private alerts: Alert[] = [];

    private readonly delayToSendReceiptReceived: number; // TimeSpan;
    private readonly delayToSendReceiptRead: number; // TimeSpan;
    private delayInfoLoggued: boolean = false;

    static getClassName() {
        return 'AlertsService';
    }

    getClassName() {
        return AlertsService.getClassName();
    }

    constructor(_eventEmitter: EventEmitter, logger: Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(logger, LOG_ID);

        /*********************************************************/
        /**                 LIFECYCLE STUFF                     **/
        /*********************************************************/
        this._startConfig = _startConfig;
        //let that = this;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._logger = logger;

        //this._eventEmitter.on("evt_internal_alertcreated_handle", this.onAlertCreated.bind(this));
        //this._eventEmitter.on("evt_internal_alertdeleted_handle", this.onAlertDeleted.bind(this));
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
        this.attachHandlers();

        //this.conversationService.alertService = this;
        //this.attachHandlers();

      
        //stats.push({ service: 'alertService', startDuration: startDuration });
        that.setStarted ();
    }

    public async stop() {
        let that = this;

        that._logger.log("info", LOG_ID + "[stop] Stopping");

        //remove all saved call logs
        this._initialized = false;

        that._xmpp = null;
        that._rest = null;

        delete that._alertEventHandler;
        that._alertEventHandler = null;
        if (that._alertHandlerToken) {
            that._alertHandlerToken.forEach((token) => PubSub.unsubscribe(token));
        }
        that._alertHandlerToken = [];

        that.setStopped ();
        that._logger.log("info", LOG_ID + "[stop] Stopped");
    }

    public async init() {
        let that = this;
        //await this.getServerAlerts();
        that.setInitialized();
    }

    private attachHandlers() {
        let that = this;

        that._logger.log("info", LOG_ID + "[attachHandlers] attachHandlers");

        that._alertEventHandler = new AlertEventHandler(that._xmpp, that, that._options);
        that._alertHandlerToken = [
            //PubSub.subscribe(that._xmpp.hash + "." + that._alertEventHandler.MESSAGE_MANAGEMENT, that._alertEventHandler.onManagementMessageReceived.bind(that._alertEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that._alertEventHandler.MESSAGE_HEADLINE, that._alertEventHandler.onHeadlineMessageReceived.bind(that._alertEventHandler)),
            PubSub.subscribe(that._xmpp.hash + "." + that._alertEventHandler.MESSAGE_ERROR, that._alertEventHandler.onErrorMessageReceived.bind(that._alertEventHandler))
        ];
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
     * @category Mark as Received / Read
     * @param {string} jid The Jid of the sender</param>
     * @param {string} messageXmppId the Xmpp Id of the alert message</param>
     * @description
     *    Mark as Received the specified alert message   <br>
     * @return {Promise<any>} the result of the operation.
     
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
     * @method markAlertMessageAsRead
     * @instance
     * @async
     * @category Mark as Received / Read
     * @param {string} jid The Jid of the sender
     * @param {string} messageXmppId the Xmpp Id of the alert message
     * @description
     *    Mark as Read the specified alert message   <br>
     * @return {Promise<any>} the result of the operation.
     
     */
    markAlertMessageAsRead(jid: string, messageXmppId: string): Promise<any> {
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
     * @category DEVICE
     * @param {AlertDevice} device Device to create.
     * @description
     *    Create a device which can receive Alerts(notifications) from the server   <br>
     *    AlertDevice.jid_im cannot be specified, it's always the Jid of the current user. <br>
     *    if AlertDevice.jid_resource cannot be specified, it's always the Jid_resource of the current user. <br>
     *    if AlertDevice.type is not specified, automatically it's set to "desktop" <br>
     * @return {Promise<AlertDevice>} the result of the operation.
     
     */
    createDevice(device: AlertDevice): Promise<AlertDevice> {
        return this.createOrUpdateDevice(true, device);
    }

    /**
     * @public
     * @method updateDevice
     * @instance
     * @async
     * @category DEVICE
     * @param {AlertDevice} device Device to Update.
     * @description
     *    Update a device which can receive Alerts(notifications) from the server <br>    
     *    AlertDevice.CompanyId cannot be specified, it's always the Compnay of the current user <br>    
     *    AlertDevice.Jid_im cannot be specified, it's always the Jid of the current user: Contacts.GetCurrentContactJid() <br>    
     *    AlertDevice.Jid_resource cannot be specified, it's always the Jid_resource of the current user: Application.GetResourceId() <br>    
     *    if AlertDevice.Type is not specified, automatically it's set to "desktop"     <br>
     * @return {Promise<AlertDevice>} the result of the operation.   <br>
     
     */
    updateDevice(device: AlertDevice): Promise<AlertDevice> {
        return this.createOrUpdateDevice(false, device);
    }

    private createOrUpdateDevice(create: boolean, device: AlertDevice): Promise<AlertDevice> {
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
                "tags": [],
                "ipAddresses": [],
                "macAddresses": [],
                "geolocation ": device.geolocation,
                "type": (!device.type || device.type === "") ? "desktop" : device.type,
                "jid_resource": that._xmpp.resourceId,
                "domainUsername": device.domainUsername 
            };
            if (Array.isArray(device.tags)) { 
                body.tags = device.tags;
            } else {
                body.tags = device.tags ? device.tags.toArray():[];
            }
            if (Array.isArray(device.ipAddresses)) 
            { body.ipAddresses = device.ipAddresses;
            } else {
                body.ipAddresses = device.ipAddresses ? device.ipAddresses.toArray():[];
            }
            if (Array.isArray(device.macAddresses)) { 
                body.macAddresses = device.macAddresses;
            } else {
                body.macAddresses = device.macAddresses ? device.macAddresses.toArray():[];
            }

            if (create) {
                that._rest.createDevice(body).then(function (json: any) {
                    that._logger.log("info", LOG_ID + "(createOrUpdateDevice) create successfull");
                    let id: string = json.id;
                    let name: string = json.name;
                    let type: string= json.type
                    let userId: string = json.userId;
                    let companyId: string = json.companyId;
                    let jid_im: string = json.jid_im;
                    let jid_resource: string = json.jid_resource;
                    let creationDate: string = json.creationDate;
                    let ipAddresses: List<string> = new List<string>();
                    if (json.ipAddresses && Array.isArray(json.ipAddresses)) {
                        ipAddresses.addRange(json.ipAddresses);
                    }
                    let macAddresses: List<string> = new List<string>();
                    if (json.macAddresses && Array.isArray(json.macAddresses)) {
                        macAddresses.addRange(json.macAddresses);
                    }
                    let tags: List<string> = new List<string>();
                    if (json.tags && Array.isArray(json.tags)) {
                        tags.addRange(json.tags);
                    }
                    let geolocation: string = json.geolocation;
                    
                    let deviceCreated = new AlertDevice( id, name, type, userId, companyId, jid_im, jid_resource, creationDate, ipAddresses, macAddresses, tags, geolocation);
                    // that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' json received : ", json);
                    that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' AlertDevice created : ", deviceCreated);

                    resolve(deviceCreated);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(createOrUpdateDevice) error.");
                    that._logger.log("internalerror", LOG_ID + "(createOrUpdateDevice) error : ", err);
                    return reject(err);
                });
            } else {
                // resource = rest.GetResource("notificationsadmin", $"devices/{device.Id}");
                // restRequest = rest.GetRestRequest(resource, Method.PUT);
                that._rest.updateDevice(device.id, body).then(function (json : any) {
                    that._logger.log("info", LOG_ID + "(createOrUpdateDevice) create successfull");
                    let id: string = json.id;
                    let name: string = json.name;
                    let type: string= json.type
                    let userId: string = json.userId;
                    let companyId: string = json.companyId;
                    let jid_im: string = json.jid_im;
                    let jid_resource: string = json.jid_resource;
                    let creationDate: string = json.creationDate;
                    let ipAddresses: List<string> = new List<string>();
                    if (json.ipAddresses && Array.isArray(json.ipAddresses)) {
                        ipAddresses.addRange(json.ipAddresses);
                    }
                    let macAddresses: List<string> = new List<string>();
                    if (json.macAddresses && Array.isArray(json.macAddresses)) {
                        macAddresses.addRange(json.macAddresses);
                    }
                    let tags: List<string> = new List<string>();
                    if (json.tags && Array.isArray(json.tags)) {
                        tags.addRange(json.tags);
                    }
                    let geolocation: string = json.geolocation;

                    let deviceCreated = new AlertDevice( id, name, type, userId, companyId, jid_im, jid_resource, creationDate, ipAddresses, macAddresses, tags, geolocation);
                    // that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' json received : ", json);
                    that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' AlertDevice created : ", deviceCreated);

                    resolve(deviceCreated);
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
     * @category DEVICE
     * @param {AlertDevice} device Device to delete.
     * @description
     *    Delete a device (using its id) <br>
     * @return {Promise<AlertDevice>} the result of the operation.
     
     */
    deleteDevice(device: AlertDevice): Promise<AlertDevice> {
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

            that._rest.deleteDevice(device.id).then(function (json: any) {
                that._logger.log("info", LOG_ID + "(deleteDevice) delete successfull");
                let id: string = json.id;
                let name: string = json.name;
                let type: string= json.type
                let userId: string = json.userId;
                let companyId: string = json.companyId;
                let jid_im: string = json.jid_im;
                let jid_resource: string = json.jid_resource;
                let creationDate: string = json.creationDate;
                let ipAddresses: List<string> = new List<string>();
                if (json.ipAddresses && Array.isArray(json.ipAddresses)) {
                    ipAddresses.addRange(json.ipAddresses);
                }
                let macAddresses: List<string> = new List<string>();
                if (json.macAddresses && Array.isArray(json.macAddresses)) {
                    macAddresses.addRange(json.macAddresses);
                }
                let tags: List<string> = new List<string>();
                if (json.tags && Array.isArray(json.tags)) {
                    tags.addRange(json.tags);
                }
                let geolocation: string = json.geolocation;

                let deviceDeleted = new AlertDevice( id, name, type, userId, companyId, jid_im, jid_resource, creationDate, ipAddresses, macAddresses, tags, geolocation);
                //that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' json deleted : ", json);
                that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' AlertDevice deleted : ", deviceDeleted);

                resolve(deviceDeleted);

                //resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(deleteDevice) error.");
                that._logger.log("internalerror", LOG_ID + "(deleteDevice) error : ", err);
                return reject(err);
            });

        });
    }

    /**
     * @public
     * @method getDevice
     * @instance
     * @async
     * @category DEVICE
     * @param {string} deviceId Id of the device.
     * @description
     *    Get a device using its Id <br>
     * @return {Promise<AlertDevice>} the result of the operation.
     
     */
    getDevice(deviceId: string): Promise<AlertDevice> {
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

            that._rest.getDevice(deviceId).then(function (json : any) {
                that._logger.log("info", LOG_ID + "(getDevice) get successfull");
                let id: string = json.id;
                let name: string = json.name;
                let type: string= json.type
                let userId: string = json.userId;
                let companyId: string = json.companyId;
                let jid_im: string = json.jid_im;
                let jid_resource: string = json.jid_resource;
                let creationDate: string = json.creationDate;
                let ipAddresses: List<string> = new List<string>();
                if (json.ipAddresses && Array.isArray(json.ipAddresses)) {
                    ipAddresses.addRange(json.ipAddresses);
                }
                let macAddresses: List<string> = new List<string>();
                if (json.macAddresses && Array.isArray(json.macAddresses)) {
                    macAddresses.addRange(json.macAddresses);
                }
                let tags: List<string> = new List<string>();
                if (json.tags && Array.isArray(json.tags)) {
                    tags.addRange(json.tags);
                }
                let geolocation: string = json.geolocation;

                let deviceDeleted = new AlertDevice( id, name, type, userId, companyId, jid_im, jid_resource, creationDate, ipAddresses, macAddresses, tags, geolocation);
                //that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' json deleted : ", json);
                that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' AlertDevice retrieved : ", deviceDeleted);
                resolve(deviceDeleted);

                // resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getDevice) error.");
                that._logger.log("internalerror", LOG_ID + "(getDevice) error : ", err);
                return reject(err);
            });

        });
    }

    /**
     * @public
     * @method getDevices
     * @instance
     * @async
     * @category DEVICE
     * @param {string} companyId Allows to filter device list on the companyId provided in this option. (optional) If companyId is not provided, the devices linked to all the companies that the administrator manage are returned.
     * @param {string} userId Allows to filter device list on the userId provided in this option. (optional) If the user has no admin rights, this filter is forced to the logged in user's id (i.e. the user can only list is own devices).
     * @param {string} deviceName Allows to filter device list on the name provided in this option. (optional) The filtering is case insensitive and on partial name match: all devices containing the provided name value will be returned(whatever the position of the match). Ex: if filtering is done on My, devices with the following names are match the filter 'My device', 'My phone', 'This is my device', ...
     * @param {string} type Allows to filter device list on the type provided in this option. (optional, exact match, case sensitive).
     * @param {string} tag Allows to filter device list on the tag provided in this option. (optional, exact match, case sensitive).
     * @param {number} offset Allow to specify the position of first device to retrieve (default value is 0 for the first device). Warning: if offset > total, no results are returned.
     * @param {number} limit Allow to specify the number of devices to retrieve.
     * @description
     *    Get list of devices   <br>
     * @return {Promise<AlertDevicesData>} the result of the operation.
     
     */
    getDevices(companyId: string, userId: string, deviceName: string, type: string, tag: string, offset: number = 0, limit: number = 100): Promise<AlertDevicesData> {
        let that = this;
        return new Promise((resolve, reject) => {

            that._rest.getDevices(companyId, userId, deviceName, type, tag, offset, limit).then(async function (json) {
                that._logger.log("info", LOG_ID + "(getDevices) get successfull");
                let alertDevices = new AlertDevicesData(1000);
                if (Array.isArray( json)) {
                    for (const optionsKey in json) {
                        let id: string = json[optionsKey].id;
                        let name: string = json[optionsKey].name;
                        let type: string = json[optionsKey].type
                        let userId: string = json[optionsKey].userId;
                        let companyId: string = json[optionsKey].companyId;
                        let jid_im: string = json[optionsKey].jid_im;
                        let jid_resource: string = json[optionsKey].jid_resource;
                        let creationDate: string = json[optionsKey].creationDate;
                        let ipAddresses: List<string> = new List<string>();
                        if (json[optionsKey].ipAddresses && Array.isArray(json[optionsKey].ipAddresses)) {
                            ipAddresses.addRange(json[optionsKey].ipAddresses);
                        }
                        let macAddresses: List<string> = new List<string>();
                        if (json[optionsKey].macAddresses && Array.isArray(json[optionsKey].macAddresses)) {
                            macAddresses.addRange(json[optionsKey].macAddresses);
                        }
                        let tags: List<string> = new List<string>();
                        if (json[optionsKey].tags && Array.isArray(json[optionsKey].tags)) {
                            tags.addRange(json[optionsKey].tags);
                        }
                        let geolocation: string = json[optionsKey].geolocation;

                        let alertDevice = new AlertDevice(id, name, type, userId, companyId, jid_im, jid_resource, creationDate, ipAddresses, macAddresses, tags, geolocation);
                        //that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' json deleted : ", json);
                        that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' AlertDevice retrieved : ", alertDevice);
                        await alertDevices.addAlertDevice(alertDevice);
                    }
                }
                resolve(alertDevices);                
                //resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getDevices) error.");
                that._logger.log("internalerror", LOG_ID + "(getDevices) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method getDevicesTags
     * @instance
     * @async
     * @category DEVICE
     * @param {string} companyId Allows to list the tags set for devices associated to the companyIds provided in this option. (optional) If companyId is not provided, the tags being set for devices linked to all the companies that the administrator manage are returned.
     * @description
     *    Get list of all tags being assigned to devices of the compagnies managed by the administrator <br>
     * @return {Promise<any>} the result of the operation.
     
     */
    getDevicesTags(companyId: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {

            that._rest.getDevicesTags(companyId).then(function (json) {
                that._logger.log("info", LOG_ID + "(getDevicesTags) get successfull");
// TODO : make a Data typed with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getDevicesTags) error.");
                that._logger.log("internalerror", LOG_ID + "(getDevicesTags) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method renameDevicesTags
     * @instance
     * @async
     * @category DEVICE
     * @param {string} tag 	tag to rename.
     * @param {string} companyId Allows to rename a tag for the devices being in the companyIds provided in this option. <br>
     * If companyId is not provided, the tag is renamed for all the devices linked to all the companies that the administrator manage.
     * @param {string} newTagName New tag name. (Body Parameters)
     * @description
     * This API can be used to rename a tag being assigned to some devices of the companies managed by the administrator.
     * @return {Promise<any>} the result of the operation.
     
     */
    renameDevicesTags(newTagName : string, tag: string, companyId: string) {

        let that = this;
        return new Promise(function (resolve, reject) {
            if (newTagName === null) {
                that._logger.log("warn", LOG_ID + "(renameDevicesTags) bad or empty 'newTagName' parameter");
                that._logger.log("internalerror", LOG_ID + "(renameDevicesTags) bad or empty 'newTagName' parameter : ", newTagName);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            if (tag === null) {
                that._logger.log("warn", LOG_ID + "(renameDevicesTags) bad or empty 'tag' parameter");
                that._logger.log("internalerror", LOG_ID + "(renameDevicesTags) bad or empty 'tag' parameter : ", tag);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            
            that._rest.renameDevicesTags(newTagName, tag, companyId).then(function (json) {
                that._logger.log("info", LOG_ID + "(renameDevicesTags) get successfull");
// TODO : make a Data typed with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(renameDevicesTags) error.");
                that._logger.log("internalerror", LOG_ID + "(renameDevicesTags) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method deleteDevicesTags
     * @instance
     * @async
     * @category DEVICE
     * @param {string} tag 	tag to rename.
     * @param {string} companyId Allows to remove a tag from the devices being in the companyIds provided in this option.. <br>
     * If companyId is not provided, the tag is deleted from all the devices linked to all the companies that the administrator manage.
     * @description
     * This API can be used to remove a tag being assigned to some devices of the companies managed by the administrator.
     * @return {Promise<any>} the result of the operation.
     
     */
    deleteDevicesTags(tag: string, companyId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {

            if (tag == null) {
                that._logger.log("warn", LOG_ID + "(deleteDevicesTags) bad or empty 'tag' parameter");
                that._logger.log("internalerror", LOG_ID + "(deleteDevicesTags) bad or empty 'tag' parameter : ", tag);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.deleteDevicesTags( tag, companyId).then(function (json) {
                that._logger.log("info", LOG_ID + "(deleteDevicesTags) get successfull");
// TODO : make a Data typed with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(deleteDevicesTags) error.");
                that._logger.log("internalerror", LOG_ID + "(deleteDevicesTags) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method getstatsTags
     * @instance
     * @async
     * @category DEVICE
     * @param {string} companyId Allows to compute the tags statistics for the devices associated to the companyIds provided in this option.  <br>
     * if companyId is not provided, the tags statistics are computed for all the devices being in all the companies managed by the logged in administrator.
     * @description
     * This API can be used to list all the tags being assigned to the devices of the companies managed by the administrator, with the number of devices for each tags.
     * @return {Promise<any>} the result of the operation.
     
     */
    getstatsTags(companyId: string) {
        // - Return stats regarding device tags GET /api/rainbow/notificationsadmin/v1.0/devices/tags/stats
        let that = this;
        return new Promise(function (resolve, reject) {

            that._rest.getstatsTags( companyId).then(function (json) {
                that._logger.log("info", LOG_ID + "(getstatsTags) get successfull");
// TODO : make a Data typed with the result.
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getstatsTags) error.");
                that._logger.log("internalerror", LOG_ID + "(getstatsTags) error : ", err);
                return reject(err);
            });
        });
    }

//endregion DEVICE

//region TEMPLATE

    /**
     * @public
     * @method createTemplate
     * @instance
     * @async
     * @category TEMPLATE
     * @param {AlertTemplate} template Template to create.
     * @description
     *    Create a template <br>
     * @return {Promise<AlertTemplate>} the result of the operation.
     
     */
    createTemplate(template: AlertTemplate): Promise<AlertTemplate> {
        return this.createOrUpdateTemplate(true, template);
    }

    /**
     * @public
     * @method updateTemplate
     * @instance
     * @async
     * @category TEMPLATE
     * @param {AlertTemplate} template Template to Update.
     * @description
     *    Update a template  <br>
     * @return {Promise<AlertTemplate>} the result of the operation.
     
     */
    updateTemplate(template: AlertTemplate): Promise<AlertTemplate> {
        return this.createOrUpdateTemplate(false, template);
    }

    private createOrUpdateTemplate(create: boolean, template: AlertTemplate): Promise<AlertTemplate> {
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
                that._rest.createTemplate(body).then(function (json:any) {
                    that._logger.log("info", LOG_ID + "(createOrUpdateDevice) create successfull");
                    //resolve(json);
                    let id: string = json.id;
                    let name: string = json.name;
                    let companyId: string = json.companyId;
                    let event: string = json.event;
                    let description: string = json.description;
                    let mimeType: string = json.mimeType;
                    let senderName: string = json.senderName;
                    let headline: string = json.headline;
                    let instruction: string = json.instruction;
                    let contact: string = json.contact;
                    let type: string = json.type;
                    let status: string = json.status;
                    let scope: string = json.scope;
                    let category: string = json.category;
                    let urgency: string = json.urgency;
                    let severity: string = json.severity;
                    let certainty: string = json.certainty;


                    let templateCreated = new AlertTemplate(id, name, companyId, event, description, mimeType, senderName, headline, instruction, contact, type, status, scope, category, urgency, severity, certainty);
                    // that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' json received : ", json);
                    that._logger.log("internal", LOG_ID + "(createOrUpdateTemplate) 'template' AlertTemplate created : ", templateCreated);

                    resolve(templateCreated);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(createOrUpdateTemplate) error.");
                    that._logger.log("internalerror", LOG_ID + "(createOrUpdateTemplate) error : ", err);
                    return reject(err);
                });
            } else {
                that._rest.updateTemplate(template.id, body).then(function (json : any) {
                    that._logger.log("info", LOG_ID + "(createOrUpdateTemplate) create successfull");
                    // resolve(json);
                    let id: string = json.id;
                    let name: string = json.name;
                    let companyId: string = json.companyId;
                    let event: string = json.event;
                    let description: string = json.description;
                    let mimeType: string = json.mimeType;
                    let senderName: string = json.senderName;
                    let headline: string = json.headline;
                    let instruction: string = json.instruction;
                    let contact: string = json.contact;
                    let type: string = json.type;
                    let status: string = json.status;
                    let scope: string = json.scope;
                    let category: string = json.category;
                    let urgency: string = json.urgency;
                    let severity: string = json.severity;
                    let certainty: string = json.certainty;


                    let templateCreated = new AlertTemplate(id, name, companyId, event, description, mimeType, senderName, headline, instruction, contact, type, status, scope, category, urgency, severity, certainty);
                    // that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' json received : ", json);
                    that._logger.log("internal", LOG_ID + "(createOrUpdateTemplate) 'template' AlertTemplate created : ", templateCreated);

                    resolve(templateCreated);

                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(createOrUpdateTemplate) error.");
                    that._logger.log("internalerror", LOG_ID + "(createOrUpdateTemplate) error : ", err);
                    return reject(err);
                });
            }

        });
    }

    /**
     * @public
     * @method deleteTemplate
     * @instance
     * @async
     * @category TEMPLATE
     * @param {AlertTemplate} template Template to Delete.
     * @description
     *    Delete a template <br>
     * @return {Promise<AlertTemplate>} the result of the operation.
     
     */
    deleteTemplate(template: AlertTemplate): Promise<AlertTemplate> {
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

            that._rest.deleteTemplate(template.id).then(function (json:any) {
                that._logger.log("info", LOG_ID + "(deleteTemplate) delete successfull");
                // resolve(json);
                let id: string = json.id;
                let name: string = json.name;
                let companyId: string = json.companyId;
                let event: string = json.event;
                let description: string = json.description;
                let mimeType: string = json.mimeType;
                let senderName: string = json.senderName;
                let headline: string = json.headline;
                let instruction: string = json.instruction;
                let contact: string = json.contact;
                let type: string = json.type;
                let status: string = json.status;
                let scope: string = json.scope;
                let category: string = json.category;
                let urgency: string = json.urgency;
                let severity: string = json.severity;
                let certainty: string = json.certainty;


                let templateCreated = new AlertTemplate(id, name, companyId, event, description, mimeType, senderName, headline, instruction, contact, type, status, scope, category, urgency, severity, certainty);
                // that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' json received : ", json);
                that._logger.log("internal", LOG_ID + "(createOrUpdateTemplate) 'template' AlertTemplate created : ", templateCreated);

                resolve(templateCreated);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(deleteTemplate) error.");
                that._logger.log("internalerror", LOG_ID + "(deleteTemplate) error : ", err);
                return reject(err);
            });
        });      
    }

    /**
     * @public
     * @method getTemplate
     * @instance
     * @async
     * @category TEMPLATE
     * @param {string} templateId Id of the template.
     * @description
     *    Get an template by id <br>
     * @return {Promise<AlertTemplate>} the result of the operation.
     
     */
    getTemplate(templateId: string): Promise<AlertTemplate> {
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

            that._rest.getTemplate(templateId).then(function (json:any) {
                that._logger.log("info", LOG_ID + "(getTemplate) get successfull");
                // resolve(json);
                let id: string = json.id;
                let name: string = json.name;
                let companyId: string = json.companyId;
                let event: string = json.event;
                let description: string = json.description;
                let mimeType: string = json.mimeType;
                let senderName: string = json.senderName;
                let headline: string = json.headline;
                let instruction: string = json.instruction;
                let contact: string = json.contact;
                let type: string = json.type;
                let status: string = json.status;
                let scope: string = json.scope;
                let category: string = json.category;
                let urgency: string = json.urgency;
                let severity: string = json.severity;
                let certainty: string = json.certainty;


                let templateCreated = new AlertTemplate(id, name, companyId, event, description, mimeType, senderName, headline, instruction, contact, type, status, scope, category, urgency, severity, certainty);
                // that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' json received : ", json);
                that._logger.log("internal", LOG_ID + "(createOrUpdateTemplate) 'template' AlertTemplate created : ", templateCreated);

                resolve(templateCreated);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getTemplate) error.");
                that._logger.log("internalerror", LOG_ID + "(getTemplate) error : ", err);
                return reject(err);
            });

        });
    }

    /**
     * @public
     * @method getTemplates
     * @instance
     * @async
     * @category TEMPLATE
     * @param {string} companyId Id of the company (optional).
     * @param {number} offset Offset to use to retrieve templates - if offset > total, no result is returned.
     * @param {number} limit Limit of templates to retrieve (100 by default).
     * @description
     *    Get templates <br>
     * @return {Promise<AlertTemplatesData>} the result of the operation.
     
     */
    getTemplates(companyId: string, offset: number = 0, limit: number = 100): Promise<AlertTemplatesData> {
        let that = this;
        return new Promise((resolve, reject) => {

            that._rest.getTemplates(companyId, offset, limit).then(async function (json) {
                that._logger.log("info", LOG_ID + "(getTemplates) get successfull");
                // resolve(json);
                let alertTemplatesData = new AlertTemplatesData(1000);
                if (Array.isArray( json)) {
                    for (const optionsKey in json) {
                        let id: string = json[optionsKey].id;
                        let name: string = json[optionsKey].name;
                        let companyId: string = json[optionsKey].companyId;
                        let event: string = json[optionsKey].event;
                        let description: string = json[optionsKey].description;
                        let mimeType: string = json[optionsKey].mimeType;
                        let senderName: string = json[optionsKey].senderName;
                        let headline: string = json[optionsKey].headline;
                        let instruction: string = json[optionsKey].instruction;
                        let contact: string = json[optionsKey].contact;
                        let type: string = json[optionsKey].type;
                        let status: string = json[optionsKey].status;
                        let scope: string = json[optionsKey].scope;
                        let category: string = json[optionsKey].category;
                        let urgency: string = json[optionsKey].urgency;
                        let severity: string = json[optionsKey].severity;
                        let certainty: string = json[optionsKey].certainty;


                        let templateCreated = new AlertTemplate(id, name, companyId, event, description, mimeType, senderName, headline, instruction, contact, type, status, scope, category, urgency, severity, certainty);
                        // that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'device' json received : ", json);
                        that._logger.log("internal", LOG_ID + "(createOrUpdateTemplate) 'template' AlertTemplate created : ", templateCreated);

                        await alertTemplatesData.addAlertTemplate(templateCreated);
                    }
                }
                resolve(alertTemplatesData);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getTemplates) error.");
                that._logger.log("internalerror", LOG_ID + "(getTemplates) error : ", err);
                return reject(err);
            });
        });
    }

//endregion TEMPLATE

//region FILTERS

    /**
     * @public
     * @method createFilter
     * @instance
     * @async
     * @category FILTERS
     * @param {AlertFilter} filter Filter to create.
     * @description
     *    Create a filter <br>
     * @return {Promise<AlertFilter>} the result of the operation.
     
     */
    createFilter(filter: AlertFilter): Promise<AlertFilter> {
        return this.createOrUpdateFilter(true, filter);
    }

    /**
     * @public
     * @method updateFilter
     * @instance
     * @async
     * @category FILTERS
     * @param {AlertFilter} filter Filter to Update.
     * @description
     *    Update a filter <br>
     * @return {Promise<AlertFilter>} the result of the operation.
     
     */
    updateFilter(filter: AlertFilter) : Promise<AlertFilter> {
        return this.createOrUpdateFilter(false, filter);
    }

    createOrUpdateFilter(create: boolean, filter: AlertFilter): Promise<AlertFilter> {
        let that = this;
        return new Promise((resolve, reject) => {

            if (filter == null) {
                that._logger.log("warn", LOG_ID + "(createOrUpdateFilter) bad or empty 'filter' parameter");
                that._logger.log("internalerror", LOG_ID + "(createOrUpdateFilter) bad or empty 'filter' parameter : ", filter);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            let body : any = {};
            if (filter.name) {
                body.name = filter.name;
            }
            if (filter.companyId) {
                body.companyId = filter.companyId;
            }
             if (filter.tags) {
                 body.tags = filter.tags;
             }

            if (create) {
                that._rest.createFilter(body).then(function (json: any) {
                    that._logger.log("info", LOG_ID + "(createOrUpdateFilter) create successfull");
                 //   resolve(json);
                    let id: string = json.id;
                    let name: string = json.name;
                    let companyId: string = json.companyId;
                    let tags: List<string> = json.tags;

                    let alertFilter = new AlertFilter(id, name, companyId, tags);
                    that._logger.log("internal", LOG_ID + "(createOrUpdateDevice) 'filter' AlertFilter retrieved : ", alertFilter);
                    resolve(alertFilter);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(createOrUpdateFilter) error.");
                    that._logger.log("internalerror", LOG_ID + "(createOrUpdateFilter) error : ", err);
                    return reject(err);
                });
            } else {
                that._rest.updateFilter(filter.id, body).then(function (json : any) {
                    that._logger.log("info", LOG_ID + "(createOrUpdateFilter) create successfull");
                    let id: string = json.id;
                    let name: string = json.name;
                    let companyId: string = json.companyId;
                    let tags: List<string> = json.tags;

                    let alertFilter = new AlertFilter(id, name, companyId, tags);
                    that._logger.log("internal", LOG_ID + "(createOrUpdateFilter) 'filter' AlertFilter retrieved : ", alertFilter);
                    resolve(alertFilter);
                    //resolve(json);
                }).catch(function (err) {
                    that._logger.log("error", LOG_ID + "(createOrUpdateFilter) error.");
                    that._logger.log("internalerror", LOG_ID + "(createOrUpdateFilter) error : ", err);
                    return reject(err);
                });
            }

        });
    }

    /**
     * @public
     * @method deleteFilter
     * @instance
     * @async
     * @category FILTERS
     * @param {AlertFilter} filter Filter to Delete.
     * @description
     *    Delete a filter <br>
     * @return {Promise<AlertFilter>} the result of the operation.
     
     */
    deleteFilter(filter: AlertFilter): Promise<AlertFilter> {
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

            that._rest.deleteFilter(filter.id).then(function (json:any) {
                that._logger.log("info", LOG_ID + "(deleteFilter) delete successfull");
                // resolve(json);
                let id: string = json.id;
                let name: string = json.name;
                let companyId: string = json.companyId;
                let tags: List<string> = json.tags;

                let alertFilter = new AlertFilter(id, name, companyId, tags);
                that._logger.log("internal", LOG_ID + "(deleteFilter) 'filter' AlertFilter retrieved : ", alertFilter);
                resolve(alertFilter);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(deleteFilter) error.");
                that._logger.log("internalerror", LOG_ID + "(deleteFilter) error : ", err);
                return reject(err);
            });

        });
    }

    /**
     * @public
     * @method getFilter
     * @instance
     * @async
     * @category FILTERS
     * @param {string} filterId Id of the Filter.
     * @description
     *    Get an filter by id <br>
     * @return {Promise<AlertFilter>} the result of the operation.
     
     */
    getFilter(filterId: string): Promise<AlertFilter> {
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

            that._rest.getFilter(filterId).then(function (json:any) {
                that._logger.log("info", LOG_ID + "(getFilter) get successfull");
                //resolve(json);
                let id: string = json.id;
                let name: string = json.name;
                let companyId: string = json.companyId;
                let tags: List<string> = json.tags;

                let alertFilter = new AlertFilter(id, name, companyId, tags);
                that._logger.log("internal", LOG_ID + "(getFilter) 'filter' AlertFilter retrieved : ", alertFilter);
                resolve(alertFilter);

            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getFilter) error.");
                that._logger.log("internalerror", LOG_ID + "(getFilter) error : ", err);
                return reject(err);
            });

        });      
    }

    /**
     * @public
     * @method getFilters
     * @instance
     * @async
     * @category FILTERS
     * @param {number} offset Offset to use to retrieve filters - if offset > total, no result is returned.
     * @param {number} limit Limit of filters to retrieve (100 by default).
     * @description
     *    Get filters : have required role(s) superadmin, admin <br>
     * @return {Promise<AlertFiltersData>} the result of the operation.
     
     */
    getFilters(offset: number = 0, limit: number = 100): Promise<AlertFiltersData> {
        let that = this;
        return new Promise((resolve, reject) => {

            that._rest.getFilters(offset, limit).then(async function (json:any) {
                that._logger.log("info", LOG_ID + "(getFilters) get successfull");
                that._logger.log("internal", LOG_ID + "(getFilters) get successfull : ", json);
                //resolve(json);

                let alertFilters = new AlertFiltersData(1000);
                if (Array.isArray( json)) {
                    for (const optionsKey in json) {
                        // noinspection JSUnfilteredForInLoop
                        let id: string = json[optionsKey].id;
                        // noinspection JSUnfilteredForInLoop
                        let name: string = json[optionsKey].name;
                        // noinspection JSUnfilteredForInLoop
                        let companyId: string = json[optionsKey].companyId;
                        let tags: List<string> = new List<string>();
                        // noinspection JSUnfilteredForInLoop
                        tags.addRange(json[optionsKey].tags);

                        let alertFilter = new AlertFilter(id, name, companyId, tags);
                        that._logger.log("internal", LOG_ID + "(getFilters) 'filter' AlertFilter retrieved : ", alertFilter);
                        await alertFilters.addAlertFilter(alertFilter);
                    }
                }
                resolve(alertFilters);

            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getFilters) error.");
                that._logger.log("internalerror", LOG_ID + "(getFilters) error : ", err);
                return reject(err);
            });
        });
    }

//endregion FILTERS

//region CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS

    /**
     * @public
     * @method createAlert
     * @instance
     * @async
     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
     * @param {Alert} alert Alert to send.
     * @description
     *    To create an alert. The alert will be sent using the StartDate of the Alert object (so it's possible to set it in future). <br>  
     *    The alert will be received by devices according the filter id and the company id used.   <br>
     *    The content of the alert is based on the template id.   <br>
     * @return {Promise<Alert>} the result of the operation.  
     */
    createAlert(alert: Alert): Promise<Alert> {
        return this.createOrUpdateAlert(true, alert);
    }

    /**
     * @public
     * @method updateAlert
     * @instance
     * @async
     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
     * @param {Alert} alert Alert to update.
     * @description
     *    To update an existing alert. The alert will be sent using the StartDate of the Alert object (so it's possible to set it in future). <br>  
     *    The alert will be received by devices according the filter id and the company id used.   <br>
     *    The content of the alert is based on the template id.   <br>
     *    Note : if no expirationDate is provided, then the validity is one day from the API call. <br>  
     * @return {Promise<Alert>} the result of the operation.
     
     */
    updateAlert(alert: Alert): Promise<Alert> {
        return this.createOrUpdateAlert(false, alert);
    }

    createOrUpdateAlert(create: boolean, alert: Alert): Promise<Alert> {
        let that = this;
        return new Promise((resolve, reject) => {

            if (alert == null) {
                that._logger.log("warn", LOG_ID + "(createOrUpdateAlert) bad or empty 'alert' parameter");
                that._logger.log("internalerror", LOG_ID + "(createOrUpdateAlert) bad or empty 'alert' parameter : ", alert);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            try {
                
                let date: Date = alert.startDate ? new Date(alert.startDate) : new Date();

                let expirationDate: Date = new Date();
                expirationDate.setDate(expirationDate.getDate() + 1);
                if (alert.expirationDate) {
                    expirationDate = new Date(alert.expirationDate);
                }

                let body: any = {};
                
                if (alert.name){
                    body.name = alert.name;
                }

                if (alert.description){
                    body.description = alert.description;
                }
                
                if (alert.companyId) {
                    body.companyId = alert.companyId;
                }

                if (alert.templateId) {
                    body.notificationTemplateId = alert.templateId;
                }

                if (alert.filterId) {
                    body.notificationFilterId = alert.filterId;
                }

                body.startDate = date.toISOString();
                body.expirationDate = expirationDate.toISOString();

                that._logger.log("info", LOG_ID + "(createOrUpdateAlert) body : ", body);

                if (create) {
                    that._rest.createAlert(body).then(function (json : any) {
                        that._logger.log("info", LOG_ID + "(createOrUpdateAlert) create successfull");
                        let  id: string = json.id;
                        let  name: string = json.name;
                        let  description: string = json.description;
                        let  status: string = json.status;
                        let  templateId: string = json.templateId;
                        let  filterId: string = json.filterId;
                        let  companyId: string = json.companyId;
                        let  startDate: string = json.startDate;
                        let  expirationDate: string = json.expirationDate;

                        let alert = new Alert(name, description, status, templateId, filterId, companyId, startDate, expirationDate);
                        alert.id = id;
                        that._logger.log("internal", LOG_ID + "(createOrUpdateAlert) 'Alert' Alert created : ", alert);
                        resolve(alert);                            
                    }).catch(function (err) {
                        that._logger.log("error", LOG_ID + "(createOrUpdateAlert) error.");
                        that._logger.log("internalerror", LOG_ID + "(createOrUpdateAlert) error : ", err);
                        return reject(err);
                    });
                } else {
                    that._rest.updateAlert(alert.id, body).then(function (json : any) {
                        that._logger.log("info", LOG_ID + "(createOrUpdateAlert) create successfull");
                        let  id: string = json.id;
                        let  name: string = json.name;
                        let  description: string = json.description;
                        let  status: string = json.status;
                        let  templateId: string = json.templateId;
                        let  filterId: string = json.filterId;
                        let  companyId: string = json.companyId;
                        let  startDate: string = json.startDate;
                        let  expirationDate: string = json.expirationDate;

                        let alert = new Alert(name, description, status, templateId, filterId, companyId, startDate, expirationDate);
                        alert.id = id;
                        that._logger.log("internal", LOG_ID + "(createOrUpdateAlert) 'Alert' Alert updated : ", alert);
                        resolve(alert);
                    }).catch(function (err) {
                        that._logger.log("error", LOG_ID + "(createOrUpdateAlert) error.");
                        that._logger.log("internalerror", LOG_ID + "(createOrUpdateAlert) error : ", err);
                        return reject(err);
                    });
                }
            } catch (err) {
                that._logger.log("error", LOG_ID + "(createOrUpdateAlert) CATCH Error !!!");
                that._logger.log("internalerror", LOG_ID + "(createOrUpdateAlert) CATCH Error !!! error : ", err);
                return reject(err);
            }
        });
    }

    /**
     * @public
     * @method deleteAlert
     * @instance
     * @async
     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
     * @param {Alert} alert Alert to Delete.
     * @description
     *    Delete an alert   <br>
     *    All the data related to this notification are deleted, including the reports <br>  
     * @return {Promise<Alert>} the result of the operation.
     
     */
    deleteAlert(alert: Alert): Promise<Alert> {
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

            that._rest.deleteAlert(alert.id).then(function (json : any) {
                that._logger.log("info", LOG_ID + "(deleteAlert) delete successfull");
                let  id: string = json.id;
                let  name: string = json.name;
                let  description: string = json.description;
                let  status: string = json.status;
                let  templateId: string = json.templateId;
                let  filterId: string = json.filterId;
                let  companyId: string = json.companyId;
                let  startDate: string = json.startDate;
                let  expirationDate: string = json.expirationDate;

                let alert = new Alert(name, description, status, templateId, filterId, companyId, startDate, expirationDate);
                alert.id = id;
                that._logger.log("internal", LOG_ID + "(createOrUpdateAlert) 'Alert' Alert deleted : ", alert);
                resolve(alert);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(deleteAlert) error.");
                that._logger.log("internalerror", LOG_ID + "(deleteAlert) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method getAlert
     * @instance
     * @async
     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
     * @param {string} alertId Id of the alert.
     * @description
     *    Get an alert by id <br>
     * @return {Promise<Alert>} the result of the operation.
     
     */
    getAlert(alertId: string): Promise<Alert> {
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

            that._rest.getAlert(alertId).then(function (json: any) {
                that._logger.log("info", LOG_ID + "(getAlert) get successfull");
                let  id: string = json.id;
                let  name: string = json.name;
                let  description: string = json.description;
                let  status: string = json.status;
                let  templateId: string = json.templateId;
                let  filterId: string = json.filterId;
                let  companyId: string = json.companyId;
                let  startDate: string = json.startDate;
                let  expirationDate: string = json.expirationDate;

                let alert = new Alert(name, description, status, templateId, filterId, companyId, startDate, expirationDate);
                alert.id = id;
                that._logger.log("internal", LOG_ID + "(createOrUpdateAlert) 'Alert' Alert created : ", alert);
                resolve(alert);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getAlert) error.");
                that._logger.log("internalerror", LOG_ID + "(getAlert) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method getAlerts
     * @instance
     * @async
     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
     * @param {number} offset Offset to use to retrieve Alerts - if offset > total, no result is returned.
     * @param {number} limit Limit of Alerts to retrieve (100 by default).
     * @description
     *    Get alerts : required role(s) superadmin,support,admin <br>
     * @return {Promise<AlertsData>} the result of the operation.
     
     */
    getAlerts(offset: number = 0, limit: number = 100): Promise<AlertsData> {
        let that = this;
        return new Promise((resolve, reject) => {

            that._rest.getAlerts(offset, limit).then(async function (json : any) {
                that._logger.log("info", LOG_ID + "(getAlerts) get successfull");

                let alerts : AlertsData = new AlertsData(json.limit);
                alerts.offset = json.offset;
                alerts.total = json.total;
                if (Array.isArray( json.data)) {
                    for (const optionsKey in json.data) {
                        // noinspection JSUnfilteredForInLoop
                        let  id: string = json.data[optionsKey].id;
                        // noinspection JSUnfilteredForInLoop
                        let  name: string = json.data[optionsKey].name;
                        // noinspection JSUnfilteredForInLoop
                        let  description: string = json.data[optionsKey].description;
                        // noinspection JSUnfilteredForInLoop
                        let  status: string = json.data[optionsKey].status;
                        // noinspection JSUnfilteredForInLoop
                        let  templateId: string = json.data[optionsKey].templateId;
                        // noinspection JSUnfilteredForInLoop
                        let  filterId: string = json.data[optionsKey].filterId;
                        // noinspection JSUnfilteredForInLoop
                        let  companyId: string = json.data[optionsKey].companyId;
                        // noinspection JSUnfilteredForInLoop
                        let  startDate: string = json.data[optionsKey].startDate;
                        // noinspection JSUnfilteredForInLoop
                        let  expirationDate: string = json.data[optionsKey].expirationDate;

                        let alert = new Alert(name, description, status, templateId, filterId, companyId, startDate, expirationDate);
                        alert.id = id;
                        that._logger.log("internal", LOG_ID + "(getAlerts) 'alert' Alert retrieved : ", alert);
                        await alerts.addAlert(alert);
                    }
                }
                resolve(alerts);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getAlerts) error.");
                that._logger.log("internalerror", LOG_ID + "(getAlerts) error : ", err);
                return reject(err);
            });
        });      
    }

    /**
     * @public
     * @method sendAlertFeedback
     * @instance
     * @async
     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
     * @param {string} deviceId Id of the device.
     * @param {string} alertId Id of the alert.
     * @param {string} answerId Id of the answer.
     * @description
     *    To send a feedback from an alert.   <br>
     *    To be used by end-user who has received the alert   <br>
     * @return {Promise<any>} the result of the operation.
     
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
    }

    /**
     * @public
     * @method getAlertFeedbackSentForANotificationMessage
     * @instance
     * @async
     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
     * @param {string} notificationHistoryId notification history unique identifier. notificationHistoryId corresponds to the id in the history Array of the messages sent for the related notification..
     * @description
     *    This API allows to list the feedback sent by the devices for a given notification message (identified by its notification history's id). <br>
     * @return {Promise<any>} the result of the operation.
     * {
     * fromCreationDate optionnel 	Date-Time Allows to filter feedback submitted from provided date (ISO 8601 format). <br>
     * toCreationDate optionnel 	Date-Time Allows to filter feedback submitted until provided date (ISO 8601 format). <br>
     * format optionnel 	String Allows to retrieve more or less feedback details in response. <br>
     * - small: id notificationId notificationHistoryId device.id creationDate <br>
     * - medium: id notificationId notificationHistoryId device.id device.name creationDate data <br>
     * - full: id notificationId companyId notificationHistoryId device.id device.name device.type device.userId device.jid_im device.jid_resource creationDate data (default value : small. Possible values : small, medium, full) <br>
     * limit optionnel 	Number Allow to specify the number of feedback to retrieve. (default value : 100) <br>
     * offset optionnel 	Number Allow to specify the position of first feedback to retrieve (first feedback if not specified). Warning: if offset > total, no results are returned. (default value : 0) <br>
     * sortField optionnel 	String Sort feedback list based on the creationDate field (date when the feedback submitted by the device has been received by Rainbow servers). (default value : creationDate. Possible values : creationDate) <br>
     * sortOrder optionnel 	Number Specify order when sorting feedback list. (default value : 1. Possible values : -1, 1) <br>
     * }
     
     */
    getAlertFeedbackSentForANotificationMessage(notificationHistoryId: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            if (notificationHistoryId == null) {
                that._logger.log("warn", LOG_ID + "(getAlertFeedbackSentForANotificationMessage) bad or empty 'notificationHistoryId' parameter");
                that._logger.log("internalerror", LOG_ID + "(getAlertFeedbackSentForANotificationMessage) bad or empty 'notificationHistoryId' parameter : ", notificationHistoryId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.getAlertFeedbackSentForANotificationMessage(notificationHistoryId).then(function (json) {
                that._logger.log("info", LOG_ID + "(getAlertFeedbackSentForANotificationMessage) get successfull");
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getAlertFeedbackSentForANotificationMessage) error.");
                that._logger.log("internalerror", LOG_ID + "(getAlertFeedbackSentForANotificationMessage) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method getAlertFeedbackSentForAnAlert
     * @instance
     * @async
     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
     * @param {string} alertId Id of the alert.
     * @description
     *    This API allows to list the feedback sent by the devices for a given notification. <br>
     * @return {Promise<any>} the result of the operation.
     * {
     * fromCreationDate optionnel 	Date-Time Allows to filter feedback submitted from provided date (ISO 8601 format). <br>
     * toCreationDate optionnel 	Date-Time Allows to filter feedback submitted until provided date (ISO 8601 format). <br>
     * format optionnel 	String Allows to retrieve more or less feedback details in response. <br>
     * - small: id notificationId notificationHistoryId device.id creationDate <br>
     * - medium: id notificationId notificationHistoryId device.id device.name creationDate data <br>
     * - full: id notificationId companyId notificationHistoryId device.id device.name device.type device.userId device.jid_im device.jid_resource creationDate data (default value : small. Possible values : small, medium, full) <br>
     * limit optionnel 	Number Allow to specify the number of feedback to retrieve. (default value : 100) <br>
     * offset optionnel 	Number Allow to specify the position of first feedback to retrieve (first feedback if not specified). Warning: if offset > total, no results are returned. (default value : 0) <br>
     * sortField optionnel 	String Sort feedback list based on the creationDate field (date when the feedback submitted by the device has been received by Rainbow servers). (default value : creationDate. Possible values : creationDate) <br>
     * sortOrder optionnel 	Number Specify order when sorting feedback list. (default value : 1. Possible values : -1, 1) <br>
     * }
     
     */
    getAlertFeedbackSentForAnAlert(alertId: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            if (alertId == null) {
                that._logger.log("warn", LOG_ID + "(getAlertFeedbackSentForAnAlert) bad or empty 'alertId' parameter");
                that._logger.log("internalerror", LOG_ID + "(getAlertFeedbackSentForAnAlert) bad or empty 'alertId' parameter : ", alertId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.getAlertFeedbackSentForAnAlert(alertId).then(function (json) {
                that._logger.log("info", LOG_ID + "(getAlertFeedbackSentForAnAlert) get successfull");
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getAlertFeedbackSentForAnAlert) error.");
                that._logger.log("internalerror", LOG_ID + "(getAlertFeedbackSentForAnAlert) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method getAlertStatsFeedbackSentForANotificationMessage
     * @instance
     * @async
     * @category CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS
     * @param {string} notificationHistoryId notification history unique identifier. notificationHistoryId corresponds to the id in the history Array of the messages sent for the related notification.
     * @description
     *    This API can be used to list all distinct feedback data submitted by the devices for a given notification message (identified by its notification history's id), with the number of devices for each distinct submitted feedback data. <br>
     * @return {Promise<any>} the result of the operation.
     * {
     *   stats 	Object[] List of feedback data submitted by the devices for this given notification message <br>
     *      data 	String data submitted by the devices <br>
     *      count 	String Number of devices having submitted this given data <br>
     * }
     
     */
    getAlertStatsFeedbackSentForANotificationMessage(notificationHistoryId: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            if (notificationHistoryId == null) {
                that._logger.log("warn", LOG_ID + "(getAlertStatsFeedbackSentForANotificationMessage) bad or empty 'notificationHistoryId' parameter");
                that._logger.log("internalerror", LOG_ID + "(getAlertStatsFeedbackSentForANotificationMessage) bad or empty 'notificationHistoryId' parameter : ", notificationHistoryId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.getAlertStatsFeedbackSentForANotificationMessage(notificationHistoryId).then(function (json) {
                that._logger.log("info", LOG_ID + "(getAlertStatsFeedbackSentForANotificationMessage) get successfull");
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getAlertStatsFeedbackSentForANotificationMessage) error.");
                that._logger.log("internalerror", LOG_ID + "(getAlertStatsFeedbackSentForANotificationMessage) error : ", err);
                return reject(err);
            });
        });
    }
    
//endregion CREATE / UPDATE / DELETE / GET / FEEDBACK ALERTS

//region REPORTS

    /**
     * @public
     * @method getReportSummary
     * @instance
     * @async
     * @category REPORTS
     * @param {string} alertId Id of the alert.
     * @description
     *    Allow to retrieve the list of summary reports of an alert (initial alert plus alerts update if any). <br>
     * @return {Promise<any>} the result of the operation.
     
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
    }

    /**
     * @public
     * @method getReportDetails
     * @instance
     * @async
     * @category REPORTS
     * @param {string} alertId Id of the alert.
     * @description
     *    Allow to retrieve detail the list of detail reports of a alert (initial alert plus alerts update if any). <br>
     * @return {Promise<any>} the result of the operation.
     
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
    }

    /**
     * @public
     * @method getReportComplete
     * @instance
     * @async
     * @category REPORTS
     * @param {string} alertId Id of the alert.
     * @description
     *    Allows to get the fileDescriptor storing the detailed CSV report of the notification. <br>
     * <br>
     *  The detailed CSV report is generated when one of the APIs getReportSummary or GET getReportDetails is called while the state of the notification message process has reached a final state: <br>
     * <br>
     *  completed: all the devices targeted by the notification have been notified and have acknowledged the reception of the message, <br>
     *  expired: some devices targeted by the notification haven't acknowledged the reception of the message but the notification expiration date has been reached, <br>
     *  cancelled: some devices targeted by the notification haven't acknowledged the reception of the message but the notification status has been set to terminated.<br>
     * <br>
     *  The generated detailed CSV report is stored in Rainbow filestorage backend. The fileDescriptor identifier returned by this API can then be used to download it using the Rainbow filestorage API GET /api/rainbow/fileserver/v1.0/files/:fileId <br>
     *  The detailed CSV report contains the following columns: <br>
     *  DeviceName,DeviceID,Domain_Username,IpAddress,MacAddress,sent,received,read,feedback,notificationId. <br>
     * @return {Promise<any>} the result of the operation.
     
     */
    getReportComplete(alertId: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            if (alertId == null) {
                that._logger.log("warn", LOG_ID + "(getReportComplete) bad or empty 'alertId' parameter");
                that._logger.log("internalerror", LOG_ID + "(getReportComplete) bad or empty 'alertId' parameter : ", alertId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.getReportComplete(alertId).then(function (json) {
                that._logger.log("info", LOG_ID + "(getReportComplete) get successfull");
                resolve(json);
            }).catch(function (err) {
                that._logger.log("error", LOG_ID + "(getReportComplete) error.");
                that._logger.log("internalerror", LOG_ID + "(getReportComplete) error : ", err);
                return reject(err);
            });
        });
    }

//endregion REPORTS

//endregion PUBLIC API


}

module.exports.AlertsService = AlertsService;
export {AlertsService};
