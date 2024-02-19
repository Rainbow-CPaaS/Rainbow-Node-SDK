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
import {Webinar} from "../common/models/webinar";
import {WebinarEventHandler} from "../connection/XMPPServiceHandler/webinarEventHandler";
import {Channel} from "../common/models/Channel";
import {TelephonyService} from "./TelephonyService.js";

export {};

const LOG_ID = "WEBINAR/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name WebinarsService
 * @version SDKVERSION
 * @public
 * @description
 *      This service manages .<br>
 */
class WebinarsService extends GenericService {
    private avatarDomain: string;
    private readonly _protocol: string = null;
    private readonly _host: string = null;
    private readonly _port: string = null;
    private _webinars: Array<Webinar>;

    private webinarEventHandler: WebinarEventHandler;
    private webinarHandlerToken: any;


    static getClassName(){ return 'WebinarsService'; }
    getClassName(){ return WebinarsService.getClassName(); }

    static getAccessorName(){ return 'webinars'; }
    getAccessorName(){ return WebinarsService.getAccessorName(); }

    constructor(_core:Core, _eventEmitter: EventEmitter, _http: any, _logger: Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
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

        this.avatarDomain = this._host.split(".").length === 2 ? this._protocol + "://cdn." + this._host + ":" + this._port : this._protocol + "://" + this._host + ":" + this._port;

        this._eventEmitter.on("evt_internal_createwebinar", this.onCreateWebinar.bind(this));
        this._eventEmitter.on("evt_internal_deletewebinar", this.onDeleteWebinar.bind(this));

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
                that._webinars = [];
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
                if (that.webinarHandlerToken) {
                    that.webinarHandlerToken.forEach((token) => PubSub.unsubscribe(token));
                }
                that.webinarHandlerToken = [];
                that._webinars = null;
                that.setStopped ();
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
        that.webinarEventHandler = new WebinarEventHandler(that._xmpp, that);
        that.webinarHandlerToken = [
            PubSub.subscribe( that._xmpp.hash + "." + that.webinarEventHandler.MESSAGE_MANAGEMENT, that.webinarEventHandler.onManagementMessageReceived.bind(that.webinarEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that.webinarEventHandler.MESSAGE_ERROR, that.webinarEventHandler.onErrorMessageReceived.bind(that.webinarEventHandler))
        ];
    }

    //region Events
    public LIST_EVENT_TYPE = {
        ADD: {code : 0, label : "ADD"},
        UPDATE: {code : 1, label : "UPDATE"},
        REMOVE: {code : 2, label : "REMOVE"},
        DELETE: {code : 3, label : "DELETE"},
        SUBSCRIBE: {code : 4, label : "SUBSCRIBE"},
        UNSUBSCRIBE: {code : 5, label : "UNSUBSCRIBE"},
        CREATE: {code : 6, label : "CREATE"}
    };
    
    public async onCreateWebinar(webinarInfo: { id: string }): Promise<void> {
        let that = this;
        let webinarId = webinarInfo.id;
        that._logger.log(that.DEBUG, LOG_ID + "(onCreateWebinar) webinarId : ", webinarId);
        //that._logger.log(that.INTERNAL, LOG_ID + "(onAddToWebinar) this._webinars : ", this._webinars);

        // Get webinars from cache
        //let webinar = this.getWebinarFromCache(webinarId);

        // Get webinars from server
        await that.getWebinarData(webinarId).then((newWebinar) => {

            // Handle webinars creation
            if (newWebinar) {
                let webinarsObj: Webinar = that.addOrUpdateWebinarToCache(newWebinar);
                //that._logger.log(that.DEBUG, LOG_ID + "(onCreateWebinar) evt_internal_webinarupdated : ", webinarsObj.id);
                that._eventEmitter.emit("evt_internal_webinarupdated", {
                    'id': webinarsObj.id,
                    "kind": that.LIST_EVENT_TYPE.ADD.code,
                    "label": that.LIST_EVENT_TYPE.ADD.label,
                    "webinar" : webinarsObj
                });
            }
        }).catch(err=>{
            that._logger.log(that.WARN, LOG_ID + "(onCreateWebinar) getWebinarData error : ", err);
        });
    }

    private async onDeleteWebinar(webinarsInfo : {id : string}): Promise<any> {
        let that = this;
        let webinarsId: string = webinarsInfo.id;
        that._logger.log(that.DEBUG, LOG_ID + "(onDeleteWebinar) webinarsId : ", webinarsId);
        let webinarsDeleted = await that.removeWebinarFromCache(webinarsId);
        let webinarsIdDeleted = webinarsDeleted ? webinarsDeleted.id : webinarsInfo.id;

        that._eventEmitter.emit("evt_internal_webinarupdated", {'id': webinarsIdDeleted, 
            "kind" : that.LIST_EVENT_TYPE.DELETE.code, 
            "label" : that.LIST_EVENT_TYPE.DELETE.label,
            "webinar" : webinarsDeleted
        });
    }

    //endregion Events
    
    //region Webinars Utils

    /**
     * @name getWebinarFromCache
     * @private
     * @category Webinars Utils
     * @param {string} webinarId
     * @description
     *      GET A CHANNEL FROM CACHE <br>
     */
    private getWebinarFromCache(webinarId: string): Webinar {
        let webinarsFound = null;
        let that =this;
        that._logger.log(that.INTERNAL, LOG_ID + "(getWebinarFromCache) search id : ", webinarId);

        if (this._webinars) {
            let webinarsFoundindex = this._webinars.findIndex((webinars) => {
                return webinars.id === webinarId;
            });
            if (webinarsFoundindex != -1) {
                that._logger.log(that.INTERNAL, LOG_ID + "(getWebinarFromCache) webinars found : ", this._webinars[webinarsFoundindex], " with id : ", webinarId);
                return this._webinars[webinarsFoundindex];
            }
        }
        that._logger.log(that.INTERNAL, LOG_ID + "(getWebinarFromCache) webinars found : ", webinarsFound, " with id : ", webinarId);
        return webinarsFound ;
    }

    private addOrUpdateWebinarToCache(webinar: any): any {
        let that = this;
        let webinarsObj : Webinar = Webinar.createFromData(webinar, that._rest.http.serverURL);
        let webinarsFoundindex = that._webinars.findIndex((webinarsIter) => {
            return webinarsIter.id === webinar.id;
        });
        if (webinarsFoundindex != -1) {
            that._logger.log(that.INTERNAL, LOG_ID + "(addOrUpdateWebinarToCache) update in cache with webinar : ", webinar, ", at webinarsFoundindex : ", webinarsFoundindex);
            that._logger.log(that.INTERNAL, LOG_ID + "(addOrUpdateWebinarToCache) in update this._webinars : ", that._webinars);
            Webinar.updateFromData(that._webinars[webinarsFoundindex], webinar);
            webinarsObj = that._webinars[webinarsFoundindex];
        } else {
            that._logger.log(that.INTERNAL, LOG_ID + "(addOrUpdateWebinarToCache) add in cache webinarsObj : ", webinarsObj);
            that._webinars.push(webinarsObj);
        }
        // this.updateWebinarsList();
        return webinarsObj;
    }

    private removeWebinarFromCache(webinarsId: string): Promise<Webinar> {
        let that = this;
        return new Promise((resolve, reject) => {
            // Get the webinars to remove
            let webinarsToRemove = this.getWebinarFromCache(webinarsId);
            if (webinarsToRemove) {
                // Store webinars name
                //let webinarsName = webinarsToRemove.name;

                // Handle invitation webinars
                //if (webinarsToRemove.invited) { this.decrementInvitationCounter(); }

                // Remove from webinarss
                let webinarsId = webinarsToRemove.id;

                that._logger.log(that.INTERNAL, LOG_ID + "(removeWebinarFromCache) remove from cache webinarsId : ", webinarsId);
                this._webinars = this._webinars.filter( function(chnl) {
                    return !(chnl.id === webinarsId);
                });
                
                resolve(webinarsToRemove);
                // this.updateWebinarsList();

                // Update messagesList
                //this.feedWebinar.messages = [];
                /* this.retrieveLatests()
                        .then(() => { resolve(webinarsToRemove); })
                        .catch((err) => {
                            that._logger.log(that.ERROR, LOG_ID + "(removeWebinarFromCache) error retrieveLatests ");
                            that._logger.log(that.INTERNALERROR, LOG_ID + "(removeWebinarFromCache) error retrieveLatests : ", err);
                            return reject(err);
                        });                        
                 // */
            } else {
                resolve(null);
            }
        });
    }

    //endregion Webinars Utils
    
    //region Webinar
    
    /**
     * @public
     * @nodered true
     * @method createWebinar
     * @since 2.3.0
     * @instance
     * @category Webinars
     * @description
     *  Create a webinar (2 rooms are used for it).<br>
     * @param {string} name The name of the bubble to create.
     * @param {string} subject Webinar subject.
     * @param {Date} waitingRoomStartDate Waiting room start date UTC format.
     * @param {Date} webinarStartDate Webinar start date UTC format.
     * @param {Date} webinarEndDate Webinar end date UTC format.
     * @param {Array<Date>} reminderDates Up to 10 webinar reminder dates UTC format.
     * @param {string} timeZone Webinar time zone. If none, user time zone will be used.
     * @param {boolean} register Is participant registration required for webinar? Default value : true.
     * @param {string} approvalRegistrationMethod Participants approval method. If 'manual` is selected, webinar creator can choose to manually approve or reject participants. default value : automatic. Possible values : manual, automatic.
     * @param {boolean} passwordNeeded If true, a password is needed when joining the webinar. This password is included in the registration confirmation email. Default value : true.
     * @param {boolean} isOrganizer If true, webinar creator is also an organizer. Default value : false.
     * @param {Array<string>} waitingRoomMultimediaURL Up to 5 URL of media to broadcast in the waiting room.
     * @param {string} stageBackground Free field used for customization (for example a file descriptor unique identifier).
     * @param {string} chatOption Define how participants can chat with organizers. Default value : participant. Possible values : participant, visitor, private.
     * @async
     * @return {Promise<any, ErrorManager>}
    
     */
    async createWebinar(name : string, 
                        subject : string, 
                        waitingRoomStartDate: Date, 
                        webinarStartDate : Date, 
                        webinarEndDate : Date, 
                        reminderDates : Array<Date>, 
                        timeZone : string, 
                        register : boolean = true, 
                        approvalRegistrationMethod : string = "automatic", 
                        passwordNeeded : boolean = true, 
                        isOrganizer : boolean = false, 
                        waitingRoomMultimediaURL : Array<string>, 
                        stageBackground : string, 
                        chatOption : string = "participant") {

        let that = this;

        return new Promise((resolve, reject) => {

            if (!name) {
                that._logger.log(that.WARN, LOG_ID + "(createWebinar) bad or empty 'name' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(createWebinar) bad or empty 'name' parameter : ", name);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            //dateFormat(mDate, "YYYY-MM-DD_HH-mm")
            if (! webinarStartDate) {
                webinarStartDate = new Date();
                webinarStartDate.setMinutes(webinarStartDate.getMinutes() + 3);
            }
            if (! webinarEndDate) {
                webinarEndDate = new Date(webinarStartDate);
                webinarEndDate.setHours(webinarEndDate.getHours() + 1);
            }
            
            
            that._rest.createWebinar(name,
                    subject,
                    waitingRoomStartDate,
                    webinarStartDate,
                    webinarEndDate,
                    reminderDates,
                    timeZone,
                    register,
                    approvalRegistrationMethod,
                    passwordNeeded,
                    isOrganizer,
                    waitingRoomMultimediaURL,
                    stageBackground,
                    chatOption).then((webinar: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(createWebinar) creation successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createWebinar) creation successfull, webinar", webinar);

                resolve(webinar);
            }).catch(err => {
                that._logger.log(that.ERROR, LOG_ID + "(createWebinar) failed to create webinar.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(createWebinar) failed to create webinar : ", err);
                reject (ErrorManager.getErrorManager().OTHERERROR("webinar_create_failed", err.message));
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method updateWebinar
     * @since 2.3.0
     * @category Webinars
     * @instance
     * @description
     *  Update a webinar.<br>
     * @param {string} webinarId Webinar identifier.
     * @param {string} name The name of the bubble to create.
     * @param {string} subject Webinar subject.
     * @param {Date} waitingRoomStartDate Waiting room start date UTC format.
     * @param {Date} webinarStartDate Webinar start date UTC format.
     * @param {Date} webinarEndDate Webinar end date UTC format.
     * @param {Array<Date>} reminderDates Up to 10 webinar reminder dates UTC format.
     * @param {string} timeZone Webinar time zone. If none, user time zone will be used.
     * @param {boolean} register Is participant registration required for webinar?
     * @param {string} approvalRegistrationMethod Participants approval method. If 'manual` is selected, webinar creator can choose to manually approve or reject participants. Possible values : manual, automatic.
     * @param {boolean} passwordNeeded If true, a password is needed when joining the webinar. This password is included in the registration confirmation email.
     * @param {boolean} lockRegistration Turn off registration for webinar before it starts.
     * @param {Array<string>} waitingRoomMultimediaURL Up to 5 URL of media to broadcast in the waiting room.
     * @param {string} stageBackground Free field used for customization (for example a file descriptor unique identifier).
     * @param {string} chatOption Define how participants can chat with organizers. Default value : participant. Possible values : participant, visitor, private.
     * @async
     * @return {Promise<any, ErrorManager>}    
     */
    async updateWebinar(webinarId : string, 
                  name : string,
                  subject : string,
                  waitingRoomStartDate: Date,
                  webinarStartDate : Date,
                  webinarEndDate : Date,
                  reminderDates : Array<Date>,
                  timeZone : string,
                  register : boolean,
                  approvalRegistrationMethod : string,
                  passwordNeeded : boolean,
                  lockRegistration  : boolean,
                  waitingRoomMultimediaURL : Array<string>,
                  stageBackground : string,
                  chatOption : string ) {

        let that = this;

        return new Promise((resolve, reject) => {

            if (!webinarId) {
                that._logger.log(that.WARN, LOG_ID + "(updateWebinar) bad or empty 'webinarId' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(updateWebinar) bad or empty 'webinarId' parameter : ", webinarId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.updateWebinar(webinarId,
                    name,
                    subject,
                    waitingRoomStartDate,
                    webinarStartDate,
                    webinarEndDate,
                    reminderDates,
                    timeZone,
                    register,
                    approvalRegistrationMethod,
                    passwordNeeded,
                    lockRegistration,
                    waitingRoomMultimediaURL,
                    stageBackground,
                    chatOption).then((webinar: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateWebinar) update successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateWebinar) update successfull, webinar", webinar);

                resolve(webinar);
            }).catch(err => {
                that._logger.log(that.ERROR, LOG_ID + "(updateWebinar) failed to update webinar.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(updateWebinar) failed to update webinar : ", err);
                reject (ErrorManager.getErrorManager().OTHERERROR("webinar_update_failed", err.message));
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method getWebinarData
     * @since 2.3.0
     * @instance
     * @category Webinars
     * @description
     *  Get data for a given webinar.<br>
     * @param {string} webinarId Webinar identifier.
     * @async
     * @return {Promise<any, ErrorManager>}
    
     */
    async getWebinarData(webinarId : string ) {
        let that = this;

        return new Promise((resolve, reject) => {
            if (!webinarId) {
                that._logger.log(that.WARN, LOG_ID + "(getWebinarsData) bad or empty 'webinarId' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(getWebinarsData) bad or empty 'webinarId' parameter : ", webinarId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.getWebinarData(webinarId).then((webinar: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getWebinarsData) get successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getWebinarsData) get successfull, webinar", webinar);

                resolve(webinar);
            }).catch(err => {
                that._logger.log(that.ERROR, LOG_ID + "(getWebinarsData) failed to get webinar.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(getWebinarsData) failed to get webinar : ", err);
                reject (ErrorManager.getErrorManager().OTHERERROR("webinar_get_failed", err.message));
            });
        });
    }
    
    /**
     * @public
     * @nodered true
     * @method getWebinarsData
     * @instance
     * @category Webinars
     * @since 2.3.0
     * @description
     *  Get data for webinars where requester is creator, organizer, speaker and/or participant.<br>
     * @param {string} role filter. Possible values : creator, organizer, speaker, participant 
     * @async
     * @return {Promise<any, ErrorManager>}
     */
    async getWebinarsData(  role  : string ) {

        let that = this;
        

        return new Promise((resolve, reject) => {
            that._rest.getWebinarsData(role).then((webinarsInfo: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getWebinarsData) get successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(getWebinarsData) get successfull, webinars : ", webinarsInfo);
                webinarsInfo.webinars = []; 
                for (const listeventtypeKey in webinarsInfo.data) {
                    let webinarObj : Webinar = Webinar.createFromData(webinarsInfo.data[listeventtypeKey], that._rest.http.serverURL);
                    webinarsInfo.webinars.push(webinarObj);

                }
                
                resolve(webinarsInfo);
            }).catch(err => {
                that._logger.log(that.ERROR, LOG_ID + "(getWebinarsData) failed to get webinars.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(getWebinarsData) failed to get webinars : ", err);
                reject (ErrorManager.getErrorManager().OTHERERROR("webinars_get_failed", err.message));
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method fetchMyWebinars
     * @since 2.3.0
     * @instance
     * @async
     * @category Webinars
     * @param {boolean} force Boolean to force the get of webinars's informations from server.
     * @description
     *    Get the webinars you own.<br>
     *    Return a promise. <br>
     * @return {Promise<Webinar[]>} Return Promise 
     */
    async fetchMyWebinars(force? : boolean) : Promise<Webinar[]>{
       let that = this;

       return new Promise((resolve) => {
            that.getWebinarsData(undefined).then((webinarsResult : any) => {
                /*
                // Hack waiting server change
                let promises = [];

                if (Array.isArray(webinarsResult.data)) {
                    webinarsResult.data.forEach((webinar) => {
                        promises.push(this.getWebinarData(webinar.id));
                    });
                } else {
                   
                }

                that._logger.log(that.INFO, LOG_ID + "(fetchMyChannels) hack start get channel data individually from server...");
                Promise.all(promises).then((channels : [Channel]) => {
                    that._logger.log(that.INTERNAL, LOG_ID + "(fetchMyChannels) hack done : ", channels);
                    that._webinars = [];
                    if (channels) {
                        channels.forEach((channel) => {
                            that.addOrUpdateChannelToCache(channel);
                        })
                    }
                    //that._logger.log(that.INTERNAL, LOG_ID + "(fetchMyChannels) get successfully and updated the channels cache : ", that._channels);
                    resolve(that._webinars);
                });
                // */
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID + "(fetchMyChannels) error ");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(fetchMyChannels) error : ", err);
                // Do not block the startup on VM without channels API
                that._webinars = [];
                resolve(that._webinars);
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method warnWebinarModerators
     * @since 2.3.0
     * @instance
     * @category Webinars
     * @description
     *  When main speakers and organizers are selected, it's time to warn each of them to join the practice room. when some webinar information change such as:<br>
     *  As a result, moderatorsSelectedAnNotified boolean is set to true.<br>
     * @param {string} webinarId Webinar unique identifier. <br>
     * Notes:<br>
     * API Call Mandatory before publishing the webinar event:<br>
     *  The webinar can't be published if webinar moderators are not warned prior.<br>
     *  see API publishAWebinarEvent<br>
     * @async
     * @return {Promise<any, ErrorManager>}
    
     */
    async warnWebinarModerators(webinarId : string) {
        let that = this;

        return new Promise((resolve, reject) => {
            if (!webinarId) {
                that._logger.log(that.WARN, LOG_ID + "(warnWebinarModerators) bad or empty 'webinarId' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(warnWebinarModerators) bad or empty 'webinarId' parameter : ", webinarId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.warnWebinarModerators(webinarId).then((webinar: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(warnWebinarModerators) get successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(warnWebinarModerators) get successfull, webinars : ", webinar);

                resolve(webinar);
            }).catch(err => {
                that._logger.log(that.ERROR, LOG_ID + "(warnWebinarModerators) failed to get webinars.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(warnWebinarModerators) failed to get webinars : ", err);
                reject (ErrorManager.getErrorManager().OTHERERROR("webinar_warn_failed", err.message));
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method publishAWebinarEvent
     * @since 2.3.0
     * @instance
     * @category Webinars
     * @description
     *  When main information about the webinar event are decided, it's up to open participant registration and allow automatic email sent when some webinar information change such as:<br>
     *  cancellation<br>
     *  date changes<br>
     *  speakers added or removed<br>
     *  As a result, emailNotification boolean is set to true. This boolean is checked when a participant try to submit a registration earlier. See API POST /api/rainbow/webinar/v1.0/webinars/self-register<br>
     * @param {string} webinarId Webinar unique identifier. <br>
     * @async
     * @return {Promise<any, ErrorManager>}
    
     */
    async publishAWebinarEvent(webinarId : string) {
        let that = this;

        return new Promise((resolve, reject) => {
            if (!webinarId) {
                that._logger.log(that.WARN, LOG_ID + "(publishAWebinarEvent) bad or empty 'webinarId' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(publishAWebinarEvent) bad or empty 'webinarId' parameter : ", webinarId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.publishAWebinarEvent(webinarId).then((webinar: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(publishAWebinarEvent) get successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(publishAWebinarEvent) get successfull, webinars : ", webinar);

                resolve(webinar);
            }).catch(err => {
                that._logger.log(that.ERROR, LOG_ID + "(publishAWebinarEvent) failed to get webinars.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(publishAWebinarEvent) failed to get webinars : ", err);
                reject (ErrorManager.getErrorManager().OTHERERROR("webinar_publish_failed", err.message));
            });
        });
    }

    /**
     * @public
     * @nodered true
     * @method deleteWebinar
     * @since 2.3.0
     * @category Webinars
     * @instance
     * @description
     *  Delete a webinar.<br>
     * @param {string} webinarId Webinar unique identifier. <br>
     * @async
     * @return {Promise<any, ErrorManager>}
     */
    async deleteWebinar(webinarId : string) {
        let that = this;

        return new Promise((resolve, reject) => {
            if (!webinarId) {
                that._logger.log(that.WARN, LOG_ID + "(deleteWebinar) bad or empty 'webinarId' parameter.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteWebinar) bad or empty 'webinarId' parameter : ", webinarId);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.deleteWebinar(webinarId).then((webinar: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteWebinar) get successfull.");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteWebinar) get successfull, webinars : ", webinar);

                resolve(webinar);
            }).catch(err => {
                that._logger.log(that.ERROR, LOG_ID + "(deleteWebinar) failed to get webinars.");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(deleteWebinar) failed to get webinars : ", err);
                reject (ErrorManager.getErrorManager().OTHERERROR("webinar_delete_failed", err.message));
            });
        });
    }

    //endregion Webinar
}

module.exports.WebinarsService = WebinarsService;
export {WebinarsService as WebinarsService};

