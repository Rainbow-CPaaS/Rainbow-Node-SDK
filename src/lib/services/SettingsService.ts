"use strict";
import EventEmitter = NodeJS.EventEmitter;

export {};

import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {ErrorManager} from "../common/ErrorManager";
import {isStarted, logEntryExit} from "../common/Utils";
import {Logger} from "../common/Logger";

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
	public _xmpp: XMPPService;
	public _rest: RESTService;
	public _eventEmitter: EventEmitter;
	public _logger: Logger;
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
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;

        // this.RAINBOW_PRESENCE_ONLINE = "online";
        // this.RAINBOW_PRESENCE_DONOTDISTURB = "dnd";
        // this.RAINBOW_PRESENCE_AWAY = "away";
        // this.RAINBOW_PRESENCE_INVISIBLE = "invisible";
        this.ready = false;
    }

    start(_xmpp : XMPPService, _rest : RESTService) {
        let that = this;
        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = _xmpp;
                that._rest = _rest;
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
