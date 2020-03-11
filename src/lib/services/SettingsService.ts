"use strict";
import EventEmitter = NodeJS.EventEmitter;

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
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
 *      This module manages the settings of the connected user.
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Get user settings
 *      - Update user settings
 */
class Settings {
    private _xmpp: XMPPService;
    private _rest: RESTService;
    private _options: any;
    private _s2s: S2SService;
    private _useXMPP: any;
    private _useS2S: any;
    private _eventEmitter: EventEmitter;
    private _logger: Logger;
    public ready: boolean = false;
    private readonly _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    constructor(_eventEmitter : EventEmitter, _logger : Logger, _startConfig) {
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
        this.ready = false;
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
                that.ready = true;
                resolve();
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
                that.ready = false;
                resolve();

            } catch (err) {
                return reject();
            }
        });
    }

    /**
     * @private
     * @method getUserSettings
     * @instance
     * @description
     *  Get current User Settings
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
     *  Update current User Settings
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
