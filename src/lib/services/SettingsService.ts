"use strict";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";

export {};


import {ErrorManager} from "../common/ErrorManager";
const RainbowPresence = require("../common/models/Settings").RainbowPresence;
const Presence = require("./PresenceService");
import {isStarted} from "../common/Utils";

const LOG_ID = "SETT/SVCE - ";

@isStarted()
/**
 * @class
 * @private
 * @name Settings
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
	public _eventEmitter: any;
	public _logger: any;
    public ready: boolean = false;
    private readonly _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    constructor(_eventEmitter, _logger, _startConfig) {
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

        this._logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = _xmpp;
                that._rest = _rest;
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                that.ready = true;
                resolve();

            } catch (err) {
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                reject();
            }
        });
    }

    stop() {
        let that = this;

        this._logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = null;
                that._rest = null;
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
                that.ready = false;
                resolve();

            } catch (err) {
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject();
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
     * @memberof Settings
     */
    getUserSettings() {

        let that = this;

        this._logger.log("debug", LOG_ID + "(getUserSettings) _entering_");

        return new Promise((resolve, reject) => {

            that._rest.getUserSettings().then((settings) => {

                that._logger.log("info", LOG_ID + "(getUserSettings) get successfully");

                that._logger.log("debug", LOG_ID + "(getUserSettings) _exiting_");
                resolve(settings);
            }).catch(function(err) {
                that._logger.log("error", LOG_ID + "(getUserSettings) error.");
                that._logger.log("internalerror", LOG_ID + "(getUserSettings) error : ", err);
                that._logger.log("debug", LOG_ID + "(getUserSettings) _exiting_");
                reject(err);
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
     * @memberof Settings
     */
    updateUserSettings(settings) {
        let that = this;

        this._logger.log("debug", LOG_ID + "(updateUserSettings) _entering_");
        return new Promise( (resolve, reject) => {

            // Check validity

            that._rest.updateUserSettings(settings).then( (newSettings) => {

                    that._logger.log("info", LOG_ID + "(updateUserSettings) get successfully");
                    that._logger.log("debug", LOG_ID + "(updateUserSettings) _exiting_");
                    resolve(newSettings);
                })
                .catch( (err) => {
                    that._logger.log("error", LOG_ID + "(updateUserSettings) error.");
                    that._logger.log("internalerror", LOG_ID + "(updateUserSettings) error : ", err);
                    that._logger.log("debug", LOG_ID + "(updateUserSettings) _exiting_");
                    reject(err);
                });
        });
    }
}

module.exports.SettingsService = Settings;
export {Settings as SettingsService};