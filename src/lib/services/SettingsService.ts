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
 * @private
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

    async init () {
        let that = this;
        that.setInitialized();
    }
    
    /**
     * @private
     * @method getUserSettings
     * @instance
     * @description
     *  Get current User Settings <br>
     * @return {Promise<UserSettings>} A promise containing the result
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
     * @private
     * @method updateUserSettings
     * @instance
     * @description
     *  Update current User Settings <br>
     * @return {Promise<Settings, ErrorManager>} A promise containing the result
     */
    updateUserSettings(settings) {
        let that = this;
        return new Promise( (resolve, reject) => {
            // Check validity
            that._rest.updateUserSettings(settings).then( (newSettings) => {
                    that._logger.log("info", LOG_ID + "(updateUserSettings) get successfully");
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
