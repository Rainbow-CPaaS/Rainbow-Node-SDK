"use strict";
import {Logger} from "../common/Logger";
import {XMPPService} from "../connection/XMPPService";
import {ErrorManager} from "../common/ErrorManager";
import * as PubSub from "pubsub-js";
import {PresenceEventHandler} from "../connection/XMPPServiceHandler/presenceEventHandler";
import {isStarted, logEntryExit, until} from "../common/Utils";
import {SettingsService} from "./SettingsService";
import {EventEmitter} from "events";
import {RESTService} from "../connection/RESTService";
import {ROOMROLE, S2SService} from "./S2SService";
import {Core} from "../Core";
import {BubblesService} from "./BubblesService";
import {PresenceCalendar, PresenceLevel, PresenceRainbow} from "../common/models/PresenceRainbow";
import {GenericService} from "./GenericService";
import {interval} from "rxjs";
import {Bubble} from "../common/models/Bubble";

export {};

const LOG_ID = "PRES/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name PresenceService
 * @version SDKVERSION
 * @public
 * @description
 *      This module manages the presence of the connected user. <br>
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Change the connected user presence <br>
 */
class PresenceService extends GenericService{
    private _settings: SettingsService;
    private _presenceEventHandler: PresenceEventHandler;
    private _presenceHandlerToken: any;
    private manualState: boolean;
    private _currentPresence: PresenceRainbow;
    public RAINBOW_PRESENCE_ONLINE: PresenceLevel.Online;
    public RAINBOW_PRESENCE_DONOTDISTURB: PresenceLevel.Dnd;
    public RAINBOW_PRESENCE_AWAY: PresenceLevel.Away;
    public RAINBOW_PRESENCE_INVISIBLE: PresenceLevel.Invisible;
    private _bubbles: BubblesService;

    static getClassName(){ return 'PresenceService'; }
    getClassName(){ return PresenceService.getClassName(); }

    constructor(_eventEmitter : EventEmitter, _logger : Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(_logger, LOG_ID);
        let that = this;
        this._startConfig = _startConfig;

        this._xmpp = null;
        this._rest = null;
        that._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        that._eventEmitter = _eventEmitter;
        that._logger = _logger;

        that.manualState = false;
        that._currentPresence = new PresenceRainbow(PresenceLevel.Online);
        that.RAINBOW_PRESENCE_ONLINE = PresenceLevel.Online;
        that.RAINBOW_PRESENCE_DONOTDISTURB = PresenceLevel.Dnd;
        that.RAINBOW_PRESENCE_AWAY = PresenceLevel.Away;
        that.RAINBOW_PRESENCE_INVISIBLE = PresenceLevel.Invisible;


        that._eventEmitter.on("evt_internal_usersettingschanged", that._onUserSettingsChanged.bind(that));
        that._eventEmitter.on("evt_internal_mypresencechanged", that._onMyPresenceChanged.bind(that));
    }

    start(_options, _core : Core ) { // , _xmpp : XMPPService, _s2s: S2SService, _rest : RESTService, _settings : SettingsService
        let that = this;
        return new Promise(function(resolve, reject) {
            try {
                that._options = _options;
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;
                that._s2s = _core._s2s;
                that._settings = _core.settings;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                that._bubbles = _core.bubbles;


                that._presenceEventHandler = new PresenceEventHandler(that._xmpp, _core._contacts);
                that._presenceHandlerToken = PubSub.subscribe( that._xmpp.hash + "." + that._presenceEventHandler.PRESENCE, that._presenceEventHandler.onPresenceReceived.bind(that._presenceEventHandler));

/*
                that._eventEmitter.removeListener("evt_internal_usersettingschanged", that._onUserSettingsChanged.bind(that));
                that._eventEmitter.removeListener("evt_internal_presencechanged", that._onPresenceChanged.bind(that));

                that._eventEmitter.on("evt_internal_usersettingschanged", that._onUserSettingsChanged.bind(that));
                that._eventEmitter.on("evt_internal_presencechanged", that._onPresenceChanged.bind(that));
*/
                that.setStarted();
                resolve(undefined);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(start) Catch Error !!!");
                that._logger.log("internalerror", LOG_ID + "(start) Catch Error !!! : ", err);
                return reject();
            }
        });
    }

    stop() {
        let that = this;
        return new Promise(function(resolve, reject) {
            try {
                delete that._presenceEventHandler;
                that._presenceEventHandler = null;
                PubSub.unsubscribe(that._presenceHandlerToken);

                that._xmpp = null;
/*
                that._eventEmitter.removeListener("evt_internal_usersettingschanged", that._onUserSettingsChanged.bind(that));
                that._eventEmitter.removeListener("evt_internal_presencechanged", that._onPresenceChanged.bind(that));
*/
                that.setStopped ();
                resolve(undefined);
            } catch (err) {
                return reject();
            }
        });
    }

    async init () {
        let that = this;
        that.setInitialized();
    }

    //region Presence CONNECTED USER

    /**
     * @private
     * @method sendInitialPresence
     * @instance
     * @async
     * @category Presence CONNECTED USER
     * @description
     *  Send the initial presence (online) <br>
     * @return {Promise<ErrorManager.Ok>} A promise containing the result
     */
    async sendInitialPresence() {

        let that = this;
        return new Promise((resolve) => {
            that._eventEmitter.once("evt_internal_presencechanged", function fn_onpresencechanged(presence) {
                that._logger.log("info", LOG_ID + "(sendInitialPresence) received.");
                that._logger.log("internal", LOG_ID + "(sendInitialPresence) received : ", presence);
                that._eventEmitter.removeListener("evt_internal_presencechanged", fn_onpresencechanged);
                resolve(ErrorManager.getErrorManager().OK);
            });
            let presenceRainbow = new PresenceRainbow();
            that._logger.log("internal", LOG_ID + "(sendInitialPresence) presenceRainbow : ", presenceRainbow);
            that._xmpp.setPresence(presenceRainbow.presenceShow, presenceRainbow.presenceStatus);
            //that._xmpp.setPresence("online", "");
        });
    }

    /**
     * @public
     * @method setPresenceTo
     * @instance
     * @async
     * @category Presence CONNECTED USER
     * @description
     *    Allow to change the presence of the connected user <br>
     *    Only the following values are authorized: 'dnd', 'away', 'invisible' or 'online' <br>
     * @param {String} presence The presence value to set i.e: 'dnd', 'away', 'invisible' ('xa' on server side) or 'online'
     * @return {Promise<any, ErrorManager>}
     * @fulfil {ErrorManager} - ErrorManager object depending on the result (ErrorManager.getErrorManager().OK in case of success)
     
     */
    async setPresenceTo(presence) {
        let that = this;
        let presenceRainbow = new PresenceRainbow(presence);
       // let show = "online";
        //let status = "";
        return new Promise(async (resolve, reject) => {

            /* switch (presence) {
                case "online":
                    //show = "online";
                    //status = "";
                    show = undefined;
                    status = "mode=auto";
                    break;
                case "away":
                    show = "xa";
                    status = "away";
                    break;
                case "dnd":
                    show = "dnd";
                    status = "";
                    break;
                case "invisible":
                    show = "xa";
                    status = "";
                    break;
                default:
                    that._logger.log("warn", LOG_ID + "(setPresenceTo) Bad or empty 'presence' parameter");
                    that._logger.log("internalerror", LOG_ID + "(setPresenceTo) Bad or empty 'presence' parameter : ", presence);
                    return reject(ErrorManager.getErrorManager().BAD_REQUEST);
                    break;
            } // */

            that._eventEmitter.once("evt_internal_presencechanged", function fn_onpresencechanged(_presence) {
                that._logger.log("info", LOG_ID + "(setPresenceTo) received.");
                that._logger.log("internal", LOG_ID + "(setPresenceTo) received : ", _presence);
                that._eventEmitter.removeListener("evt_internal_presencechanged", fn_onpresencechanged);
                resolve(ErrorManager.getErrorManager().OK);
            });

            that._logger.log("internal", LOG_ID + "(setPresenceTo) that._useXMPP : ", that._useXMPP, ", that._useS2S : ", that._useS2S, ", presenceRainbow : ", presenceRainbow, ", presence : ", presence);

            if (that._useXMPP) {
                that._xmpp.setPresence(presenceRainbow.presenceShow, presenceRainbow.presenceStatus);
            }
            if (that._useS2S) {
                await that._s2s.sendS2SPresence(presenceRainbow.toJsonForServer());
            }
            await that._settings.updateUserSettings({presence: presenceRainbow.presenceLevel});
        });
    }
    
    /**
     * @public
     * @method getUserConnectedPresence
     * @instance
     * @category Presence CONNECTED USER
     * @description
     *      Get user presence status calculated from events. <br>
     */
    getUserConnectedPresence() : PresenceRainbow {
        return this._currentPresence ;
    }
   
     /**
     * @private
     * @method _setUserPresenceStatus
     * @instance
     * @async
     * @category Presence CONNECTED USER
     * @description
     *      Send user presence status and message to xmpp. <br>
     */
    async _setUserPresenceStatus( presenceRainbow : PresenceRainbow) {
         let that = this;
         return new Promise(async (resolve, reject) => {

             if (that._useXMPP) {
                 that._eventEmitter.once("evt_internal_presencechanged", function fn_onpresencechanged(presence) {
                     that._logger.log("info", LOG_ID + "(_setUserPresenceStatus) received.");
                     that._logger.log("internal", LOG_ID + "(_setUserPresenceStatus) received : ", presence);
                     that._eventEmitter.removeListener("evt_internal_presencechanged", fn_onpresencechanged);
                     resolve(undefined);
                 });
                 await that._xmpp.setPresence(presenceRainbow.presenceShow, presenceRainbow.presenceStatus);
             }
             if (that._useS2S) {
                 let presenceChangedReceived = false;
                 that._eventEmitter.once("evt_internal_presencechanged", function fn_onpresencechanged(presence) {
                     that._logger.log("info", LOG_ID + "(_setUserPresenceStatus) received.");
                     that._logger.log("internal", LOG_ID + "(_setUserPresenceStatus) received : ", presence);
                     that._eventEmitter.removeListener("evt_internal_presencechanged", fn_onpresencechanged);
                     presenceChangedReceived = true;
                     //resolve(undefined);
                 });
                 let result = await that._s2s.sendS2SPresence(presenceRainbow.toJsonForServer());
                 that._logger.log("internal", LOG_ID + "(_setUserPresenceStatus) sendS2SPresence result : ", result);
                 until(() => { return (presenceChangedReceived === true); }, "Wait for presencechanged after set presence S2S.", 10000).then((untilResult)=>{
                     that._logger.log("internal", LOG_ID + "(_setUserPresenceStatus) evt_internal_presencechanged received, can continue : ", untilResult);
                     resolve(undefined);
                 }).catch((untilResult)=>{
                     that._logger.log("internal", LOG_ID + "(_setUserPresenceStatus) evt_internal_presencechanged NOT received, force continue : ", untilResult);
                     resolve(undefined);
                 })
             }
         });
     }

    /**
     * @private
     * @method _sendPresenceFromConfiguration
     * @instance
     * @async
     * @category Presence CONNECTED USER
     * @description
     *      Send user presence according to user settings presence. <br>
     */
    async _sendPresenceFromConfiguration() {
        let that = this;
        return new Promise( (resolve, reject) => {
            let presenceRainbow : PresenceRainbow = new PresenceRainbow();
            that._settings.getUserSettings().then(function(settings : any) {
                    //let message = "";
                    presenceRainbow.presenceLevel = settings.presence;
                    /*if (presence === "invisible") {
                        presence = "xa";
                    } else if (presence === "away") {
                        presence = "xa";
                        message = "away";
                    } // */

                    that._logger.log("internal", LOG_ID + "(_sendPresenceFromConfiguration) -> getUserSettings are ", presenceRainbow );
                    //if (that._currentPresence && (that._currentPresence !== presence || (that._currentPresence. === "xa" && message !== that._currentPresence.status))) {
                    //if (that._currentPresence && (that._currentPresence.presenceLevel !== presenceRainbow.presenceLevel )) {
                    if (that._currentPresence ) {
                        that._logger.log("internal", LOG_ID + "(_sendPresenceFromConfiguration) should update my status from ", that._currentPresence,  " to ", presenceRainbow);
                        that._setUserPresenceStatus(presenceRainbow).then(() => { resolve(undefined); }).catch((err) => { reject(err); });
                    } else {
                        resolve(undefined);
                    }
                })
                .catch(function(error) {
                    that._logger.log("debug", LOG_ID + "(_sendPresenceFromConfiguration) failure, send online");
                    that._setUserPresenceStatus(new PresenceRainbow()).then(() => { resolve(undefined); }).catch(() => { reject(error); });
                });

        });
    }

    //endregion Presence CONNECTED USER

    //region Presence Bubbles

    /**
     * @private
     * @method sendInitialBubblePresence
     * @instance
     * @async
     * @category Presence Bubbles
     * @param {Bubble} bubble The Bubble
     * @param {number} intervalDelay The interval between sending presence to a Bubble while it failed. default value is 75000 ms.
     * @description
     *      Method called when receiving an invitation to join a bubble <br>
     */
    async sendInitialBubblePresenceSync(bubble: Bubble, intervalDelay: number = 7500): Promise<any> {
        let that = this;
        return new Promise(async function (resolve, reject) {
            let initialPresenceSent = that.sendInitialBubblePresenceSyncFn(bubble, intervalDelay);
            if (initialPresenceSent) {
                that._logger.log("internal", LOG_ID + "(sendInitialBubblePresenceSync) initialPresenceSent initialized.");
                resolve (initialPresenceSent);
            } else {
                let err = {
                    label : "no initial bubble presence promise."
                };
                that._logger.log("internal", LOG_ID + "(sendInitialBubblePresenceSync) initialPresenceSent is undefined, err : ", err);
                reject(err);
            }
        });
    }
    
    /**
     * @private
     * @method sendInitialBubblePresence
     * @instance
     * @async
     * @category Presence Bubbles
     * @param {Bubble} bubble The Bubble
     * @param {number} attempt To log a number of attempt of sending presence to the Bubble. default value is 0.
     * @description
     *      Method called when receiving an invitation to join a bubble <br>
     */
    async sendInitialBubblePresence(bubble : Bubble,  attempt : number = 0) {
        let that = this;
        return new Promise(async function(resolve, reject) {
            if (!bubble || !bubble.jid) {
                that._logger.log("debug", LOG_ID + "(sendInitialBubblePresence) failed");
                that._logger.log("info", LOG_ID + "(sendInitialBubblePresence) No Bubble id provided");
                reject({code:-1, label:"Bubble id is not defined!!!"});
            } else {
                const attemptInfo = attempt ? " -- attempt " + attempt : "";
                that._logger.log("info", LOG_ID + "(sendInitialBubblePresence) " + attemptInfo + " -- " + bubble.getNameForLogs + " -- " + bubble.id);
                if (that._useXMPP) {
                    let result = that._xmpp.sendInitialBubblePresence(bubble.jid)
                    that._logger.log("internal", LOG_ID + "(sendInitialBubblePresence) begin wait for the bubble to be active : ", bubble);
                    // Wait for the bubble to be active
                    await until(() => {
                        return bubble.isActive === true;
                    }, "Wait for the Bubble " + bubble.jid + " to be active").catch((err)=>{
                        that._logger.log("internal", LOG_ID + "(sendInitialBubblePresence) FAILED wait for the bubble to be active : ", bubble , " : ", err);
                    });
                    that._logger.log("internal", LOG_ID + "(sendInitialBubblePresence) end wait for the bubble to be active : ", bubble);
                    resolve(result);
                }
                if (that._useS2S) {
                    let bubbleInfos = await that._bubbles.getBubbleByJid(bubble.jid);
                        resolve(that._s2s.joinRoom(bubbleInfos.id, ROOMROLE.MEMBER));
                }
            }
        });
    }

    /**
     * @private
     * @method sendInitialBubblePresenceSync
     * @instance
     * @async
     * @category Presence Bubbles
     * @param {Bubble} bubble The Bubble
     * @param {number} intervalDelay The interval between sending presence to a Bubble while it failed. default value is 75000 ms.
     * @description
     *      Method called when receiving an invitation to join a bubble <br>
     */
    public sendInitialBubblePresenceSyncFn(bubble: Bubble, intervalDelay: number = 7500): Promise<any> {
        let that = this;
        if (!bubble) {
            that._logger.log("warn", LOG_ID + "(sendInitialBubblePresenceSync) bad or empty 'bubble' parameter.");
            //that._logger.log("internalerror", LOG_ID + "(sendInitialBubblePresenceSync) bad or empty 'bubble' parameter : ", bubble);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        that._logger.log("info", LOG_ID + "(sendInitialBubblePresenceSync) " + intervalDelay + " -- " + bubble.getNameForLogs + " -- " + bubble.id);
        if (bubble.initialPresence.initPresencePromise) {
            return bubble.initialPresence.initPresencePromise;
        }
        if (bubble.initialPresence.initPresenceAck) {
            that._logger.log("debug", LOG_ID + `(sendInitialBubblePresenceSync) -- ${bubble.getNameForLogs} -- ${bubble.id} -- bubble already activated`);
            return Promise.resolve();
        }
//                    bubble.initialPresence.initPresencePromise()
        bubble.initialPresence.initPresencePromise = new Promise((resolve, reject) => {
            bubble.initialPresence.initPresencePromiseResolve = resolve;
            //that.sendInitialRoomPresence(bubble, 0);
            that.sendInitialBubblePresence(bubble);

            // Retry mechanism
            const maxAttemptNumber = 3;
            let attemptNumber = 0;

            bubble.initialPresence.initPresenceInterval = interval(intervalDelay).subscribe(() => {
                if (attemptNumber < maxAttemptNumber) {
                    // up to <maxAttemptNumber> retries
                    attemptNumber += 1;
                    that.sendInitialBubblePresence(bubble, attemptNumber);
                } else {
                    // if no response after <maxAttemptNumber> retries, we clean the presence promise in the bubble 
                    // (to make it possible for further trials to re-establish presence state and chat history access)
                    that._logger.log("warn", LOG_ID + "(sendInitialBubblePresenceSync) : no response after " + attemptNumber + " retries => clean presence promise and interval for " + bubble.getNameForLogs + " -- " + bubble.jid);
                    reject("(sendInitialBubblePresenceSync) : no response");
                    bubble.initialPresence.initPresencePromise = null;
                    if (bubble.initialPresence.initPresenceInterval) {
                        bubble.initialPresence.initPresenceInterval.unsubscribe();
                        bubble.initialPresence.initPresenceInterval = null;
                    }

                    //refresh the bubble from the local bubble cache
                    //bubble = this.bubbles[bubble.dbId];
                    //should sent an update, so that the conversation is updated and we can sent chat messages inside
                    //that.eventService.publish(this.ROOM_UPDATE_EVENT, bubble);
                    that._eventEmitter.emit("evt_internal_bubblepresencesent", bubble);
                }
            });
        });
        return bubble.initialPresence.initPresencePromise;
    }

    //endregion Presence Bubbles

    //region Events
    
    /**
     * @private
     * @method _onUserSettingsChanged
     * @instance
     * @description
     *      Method called when receiving an update on user settings <br>
     */
    _onUserSettingsChanged() {
        let that = this;
        that._sendPresenceFromConfiguration();
    }

    /**
     * @private
     * @method _onPresenceChanged
     * @instance
     * @description
     *      Method called when receiving an update on user presence <br>
     */
    _onMyPresenceChanged(user) {
        let that = this;
        //that._logger.log("internal", LOG_ID + "(_onPresenceChanged) user : ", user);
       // if ( presence.jid === that._xmpp.jid ) {
            that._logger.log("internal", LOG_ID + "(_onPresenceChanged) set for connected user the presence : ", user);
            that._currentPresence.presenceLevel = user.presence;
            //that._currentPresence.presenceShow = presence.show;
            that._currentPresence.presenceStatus = user.status;

        //}
    }
    
    //endregion Events

    //region Presence CALENDAR

    /**
     * @public
     * @method getCalendarState
     * @instance
     * @category Presence CALENDAR
     * @description
     *    Allow to get the calendar presence of the connected user <br>
     *    return promise with {  <br>
     *    busy: boolean, // Does the connected user is busy ? <br>
     *    status: string, // The status of the connected user (one of "free", "busy" or "out_of_office") <br> 
     *    subject: string, // The meeting subject. <br>
     *    since: string, // The meeting since date. <br>
     *    until: string // Date until the current presence is valid <br> 
     *    }  <br>
     *    <br>
     * @async
     * @return {Promise<{  
     *    busy: boolean, 
     *    status: string,  
     *    subject: string, 
     *    since: string, 
     *    until: string  
     *    }, ErrorManager>}
     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
     
     */
    async getCalendarState() {
        let that = this;

        return new Promise((resolve, reject) => {

            that._rest.getCalendarState().then((calendarInfo : any) => {
                that._logger.log("info", LOG_ID + "(getCalendarState) calendarInfo : ", calendarInfo);
                //let presenceCalendar = new PresenceCalendar();
                resolve(calendarInfo);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(getCalendarState) error");
                that._logger.log("internalerror", LOG_ID + "(getCalendarState) error : ", err);
                let error : any = ErrorManager.getErrorManager().OTHERERROR;
                error.label = "Catch Error while trying to get calendar presence.";
                error.msg = err.message;
                return reject(error);
                //return reject(err);
            });
        });
    }
    
    /**
     * @public
     * @method getCalendarStates
     * @instance
     * @category Presence CALENDAR
     * @param {Array<string>} users The list of user's logins (Contact::loginEmail) to retrieve the calendar presence.
     * @description
     *    Allow to get the calendar presence of severals users <br>
     *    return promise with {  
     *    usersIdentifier : { // List of calendar user states. <br>
     *    busy: boolean, // Does the connected user is busy ? <br>
     *    status: string, // The status of the connected user (one of "free", "busy" or "out_of_office") <br> 
     *    subject: string, // The meeting subject. <br>
     *    since: string, // The meeting since date. <br>
     *    until: string // Date until the current presence is valid <br> 
     *    }  <br>
     *    <br>
     * @async
     * @return {Promise< { 
     *    busy: boolean, 
     *    status: string, 
     *    subject: string,
     *    since: string,
     *    until: string 
     *    }, ErrorManager>}
     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
     
     */
    async getCalendarStates(users : Array<string> = [undefined]) {
        let that = this;

        return new Promise((resolve, reject) => {

            that._rest.getCalendarStates(users).then((calendarInfo : any) => {
                that._logger.log("info", LOG_ID + "(getCalendarStates) calendarInfo : ", calendarInfo);
                resolve(calendarInfo);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(getCalendarStates) error");
                that._logger.log("internalerror", LOG_ID + "(getCalendarStates) error : ", err);
                let error : any = ErrorManager.getErrorManager().OTHERERROR;
                error.label = "Catch Error while trying to get calendar presence.";
                error.msg = err.message;
                return reject(error);
                //return reject(err);
            });
        });
    }

    /**
     * @public
     * @method setCalendarRegister
     * @instance
     * @category Presence CALENDAR
     * @param {string} type Calendar type. Default : office365, Authorized values : office365, google
     * @param {boolean} redirect Immediately redirect to login page (OAuth2) or generate an HTML page. Default : false.
     * @param {string} callback Redirect URL to the requesting client.
     * @description
     *    Register a new calendar.<br>
     *    return promise with {  
     *    "url" : string // Calendar provider's OAuth URL <br>
     *    } <br>
     * @async
     * @return {Promise<{  
     *    "url" : string
     *    }, ErrorManager>}
     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
     
     */
    async setCalendarRegister(type? : string, redirect? : boolean, callbackUrl? : string) {
        let that = this;

        return new Promise((resolve, reject) => {

            that._rest.setCalendarRegister(type,  redirect, callbackUrl).then((calendarInfo : any) => {
                that._logger.log("info", LOG_ID + "(setCalendarRegister) calendarInfo : ", calendarInfo);
                resolve(calendarInfo);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(setCalendarRegister) error");
                that._logger.log("internalerror", LOG_ID + "(setCalendarRegister) error : ", err);
                let error : any = ErrorManager.getErrorManager().OTHERERROR;
                error.label = "Catch Error while trying to set calendar register.";
                error.msg = err.message;
                return reject(error);
                //return reject(err);
            });
        });
    }

    /**
     * @public
     * @method getCalendarAutomaticReplyStatus
     * @instance
     * @category Presence CALENDAR
     * @param {string} userId The id of user to retrieve the calendar automatic reply status.
     * @description
     *    Allow to retrieve the calendar automatic reply status <br>
     *    return promise with { <br>
     *    enabled : string, // 	its status <br>
     *    start : string, // its start date <br>
     *    end : string, // its end date <br>
     *    message_text : string, // its message as plain text <br>
     *    message_thtml : string // its message as html <br> 
     *    }  <br>
     *    <br>
     * @async
     * @return {Promise<{ 
     *    enabled : string,
     *    start : string,
     *    end : string,
     *    message_text : string,
     *    message_thtml : string 
     *    }, ErrorManager>}
     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
     
     */
    async getCalendarAutomaticReplyStatus(userId? : string ) {
        let that = this;

        return new Promise((resolve, reject) => {

            that._rest.getCalendarAutomaticReplyStatus(userId).then((automaticReplyStatus : any) => {
                that._logger.log("info", LOG_ID + "(getCalendarAutomaticReplyStatus) automaticReplyStatus : ", automaticReplyStatus);
                resolve(automaticReplyStatus);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(getCalendarAutomaticReplyStatus) error");
                that._logger.log("internalerror", LOG_ID + "(getCalendarAutomaticReplyStatus) error : ", err);
                let error : any = ErrorManager.getErrorManager().OTHERERROR;
                error.label = "Catch Error while trying to get calendar presence.";
                error.msg = err.message;
                return reject(error);
                //return reject(err);
            });
        });
    }
    
    /**
     * @public
     * @method enableCalendar
     * @instance
     * @category Presence CALENDAR
     * @description
     *    Allow to enable the calendar. <br>
     *    return promise with { <br>
     *       Status : string // Operation status ("enabled" or "disabled") <br>
     *    }  <br>
     *    <br>
     * @async
     * @return {Promise< { 
     *       Status : string 
     *    }, ErrorManager>}
     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
     
     */
    async enableCalendar( ) {
        let that = this;

        return new Promise((resolve, reject) => {

            that._rest.enableOrNotCalendar(false).then((result : any) => {
                that._logger.log("info", LOG_ID + "(enableCalendar) result : ", result);
                resolve(result);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(enableCalendar) error");
                that._logger.log("internalerror", LOG_ID + "(enableCalendar) error : ", err);
                let error : any = ErrorManager.getErrorManager().OTHERERROR;
                error.label = "Catch Error while trying to enable calendar.";
                error.msg = err.message;
                return reject(error);
                //return reject(err);
            });
        });
    }
    
    /**
     * @public
     * @method disableCalendar
     * @instance
     * @category Presence CALENDAR
     * @description
     *    Allow to disable the calendar. <br>
     *    return promise with { <br>
     *       Status : string // Operation status ("enabled" or "disabled") <br>
     *    }  <br>
     *    <br>
     * @async
     * @return {Promise< { 
     *       Status : string 
     *    }, ErrorManager>}
     * @fulfil {ErrorManager} - ErrorManager object depending on the result.
     
     */
    async disableCalendar( ) {
        let that = this;

        return new Promise((resolve, reject) => {

            that._rest.enableOrNotCalendar(true).then((result : any) => {
                that._logger.log("info", LOG_ID + "(disableCalendar) result : ", result);
                resolve(result);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(disableCalendar) error");
                that._logger.log("internalerror", LOG_ID + "(disableCalendar) error : ", err);
                let error : any = ErrorManager.getErrorManager().OTHERERROR;
                error.label = "Catch Error while trying to disable calendar.";
                error.msg = err.message;
                return reject(error);
                //return reject(err);
            });
        });
    }
    
    // endregion Presence CALENDAR
}

module.exports.PresenceService = PresenceService;
export {PresenceService } ;
