"use strict";
import {GenericService} from "./GenericService";

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {EventEmitter} from "events";
import {isStarted, logEntryExit} from "../common/Utils";
import {Logger} from "../common/Logger";
import {S2SService} from "./S2SService";
import {Core} from "../Core";

const LOG_ID = "SETT/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @public
 * @name Settings
 * @version SDKVERSION
 * @description
 *      This module manages the settings of the connected user. <br>
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Get user settings <br>
 *      - Update user settings <br>
 */
class Settings extends GenericService {

    static getClassName(){ return 'Settings'; }
    getClassName(){ return Settings.getClassName(); }

    constructor(_eventEmitter : EventEmitter, _logger : Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(_logger, LOG_ID);
        this._startConfig = _startConfig;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;

        // this.RAINBOW_PRESENCE_ONLINE = "online";
        // this.RAINBOW_PRESENCE_DONOTDISTURB = "dnd";
        // this.RAINBOW_PRESENCE_AWAY = "away";
        // this.RAINBOW_PRESENCE_INVISIBLE = "invisible";
    }

    start(_options, _core : Core) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService
        let that = this;
        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;
                that._options = _options;
                that._s2s = _core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                that.setStarted ();
                resolve(undefined);
            } catch (err) {
                return reject();
            }
        });
    }

    stop() {
        let that = this;
        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = null;
                that._rest = null;
                that.setStopped ();
                resolve(undefined);
            } catch (err) {
                return reject();
            }
        });
    }

    async init (useRestAtStartup : boolean) {
        let that = this;
        that.setInitialized();
    }
    
    /**
     * @public
     * @since 2.20.0
     * @method getUserSettings
     * @category Settings - Users
     * @async
     * @instance
     * @description
     *  Get current User Settings <br>
     *  This API can only be used by user himself </br>
     * @return {Promise<UserSettings>} A promise containing the result
     * 
     * 
     * | Champ | Type | Description |
     * | --- | --- | --- |
     * | presence | String | Setting for manual user presence (used to go back to this presence when user logs in, instead of default (online))  <br>  <br>Possible values: `online`, `away`, `invisible`, `dnd` |
     * | displayNameOrderFirstNameFirst | Boolean | Setting for user display name order<br><br>* true: firstname first<br>* false: lastname first |
     * | activeAlarm | String | Setting for active user alarm sound |
     * | activeNotif | String | Setting for active user notification sound |
     * | ringingOnDnd | Boolean | Setting for allowing the user's devices to ring when receiving incoming call while being on DND. |
     * | promptForCalendarPresence | Boolean | Setting to bypass calendar presence popup |
     * | applyCalendarPresence optionnel | Boolean | Calendar presence should be applied as user preference settings (DND) |
     * | promptForMsTeamsPresence | Boolean | Setting to bypass Microsoft Teams presence popup |
     * | applyMsTeamsPresence optionnel | Boolean | Microsoft Teams presence should be applied as user preference settings (Busy/DND) |
     * | protectionAgainstMailTypeOffline | boolean | Never receive unsolicited emails of type 'offLine' |
     * | rainbowReadOnly | Object | Some rainbow public settings |
     * | nbDaysBeforeWarningByMail | Integer | Notifying offline user by mail, allowed after n days after last login |
     * | autoAnswer | Boolean | Setting to allow one rainbow client to answer incoming call initiated by external |
     * | delayBetweenTwoWarningByMailInDays | Integer | Retry notifying offline user by mail, allowed after n days after last attempt |
     * | autoAnswerByDeviceType | String | Setting to define the default rainbow client used for the autoAnswer feature: IOS or Androïd or Desktop (default = Desktop) |
     * 
     */
    getUserSettings() {
        let that = this;
        return new Promise((resolve, reject) => {

            that._rest.getUserSettings().then((settings) => {
                that._logger.log("info", LOG_ID + "(getUserSettings) get successfully");
                resolve(settings);
            }).catch(function(err) {
                that._logger.log("error", LOG_ID + "(getUserSettings) error.");
                that._logger.log("internalerror", LOG_ID + "(getUserSettings) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @since 2.20.0
     * @method updateUserSettings
     * @category Settings - Users
     * @async
     * @param {Object} settings : user settings to update </br> 
     * { </br>
     *   **presence** optionnel : string : Setting for manual user presence (used to go back to this presence when user logs in, instead of default (online)). Default value : `online`. Possible values : `"online"`, `"away"`, `"invisible"`, `"dnd"` </br>
     *   **displayNameOrderFirstNameFirst** optionnel : boolean : Setting for user display name order. * true: firstname first. * false: lastname first. Default value : `true` </br>
     *   **activeAlarm** optionnel : String : Setting for active user alarm sound. Default value : `relax1`. </br>
     *   **activeNotif** optionnel : String : Setting for active user notification sound. Default value : `notif1`. </br>
     *   **ringingOnDnd** optionnel : boolean : Setting for allowing devices to ring on incoming call while being on DND. Default value : `false` </br>
     *   **protectionAgainstMailTypeOffline** optionnel : boolean : Allow never receiving unsolicited emails of type 'offLine'. Default value : `false` </br>
     *  }   </br>
     * @instance
     * @description
     *  Update current User Settings <br>
     *  This API can only be used by user himself </br>
     * @return {Promise<Settings, ErrorManager>} A promise containing the result
     */
    updateUserSettings(settings) {
        let that = this;
        return new Promise( (resolve, reject) => {
            // Check validity
            that._rest.updateUserSettings(settings).then( (newSettings) => {
                    that._logger.log("info", LOG_ID + "(updateUserSettings) update successfully");
                    resolve(newSettings);
                })
                .catch( (err) => {
                    that._logger.log("error", LOG_ID + "(updateUserSettings) error.");
                    that._logger.log("internalerror", LOG_ID + "(updateUserSettings) error : ", err);
                    return reject(err);
                });
        });
    }
}

module.exports.SettingsService = Settings;
export {Settings as SettingsService};
