"use strict";
import {XMPPService} from "../connection/XMPPService";

export {};


import {ErrorManager} from "../common/ErrorManager";
const RainbowPresence = require("../common/models/Settings").RainbowPresence;

const PubSub = require("pubsub-js");
const PresenceEventHandler = require("../connection/XMPPServiceHandler/presenceEventHandler");

const LOG_ID = "PRES/SVCE - ";

/**
 * @class
 * @name Presence
 * @description
 *      This module manages the presence of the connected user.
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Change the connected user presence
 */
class Presence {
	public _logger: any;
	public _xmpp: XMPPService;
	public _settings: any;
	public presenceEventHandler: any;
	public presenceHandlerToken: any;
	public _eventEmitter: any;
	public manualState: any;
	public _currentPresence: any;
    RAINBOW_PRESENCE_ONLINE: any;
    RAINBOW_PRESENCE_DONOTDISTURB: any;
    RAINBOW_PRESENCE_AWAY: any;
    RAINBOW_PRESENCE_INVISIBLE: any;
    private readonly _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    constructor(_eventEmitter, _logger, _startConfig) {
        let that = this;
        this._startConfig = _startConfig;

        that._xmpp = null;
        that._eventEmitter = _eventEmitter;
        that._logger = _logger;

        that.manualState = false;
        that._currentPresence = { status: "online", show: ""};

        that.RAINBOW_PRESENCE_ONLINE = RainbowPresence.ONLINE;
        that.RAINBOW_PRESENCE_DONOTDISTURB = RainbowPresence.DND;
        that.RAINBOW_PRESENCE_AWAY = RainbowPresence.AWAY;
        that.RAINBOW_PRESENCE_INVISIBLE = RainbowPresence.INVISIBLE;

        that._eventEmitter.on("evt_internal_usersettingschanged", that._onUserSettingsChanged.bind(that));
        that._eventEmitter.on("evt_internal_presencechanged", that._onPresenceChanged.bind(that));
    }

    start(_xmpp, _settings) {
        let that = this;

        that._logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = _xmpp;
                that._settings = _settings;

                that.presenceEventHandler = new PresenceEventHandler(that._xmpp);
                that.presenceHandlerToken = PubSub.subscribe( that._xmpp.hash + "." + that.presenceEventHandler.PRESENCE, that.presenceEventHandler.onPresenceReceived);

/*
                that._eventEmitter.removeListener("evt_internal_usersettingschanged", that._onUserSettingsChanged.bind(that));
                that._eventEmitter.removeListener("evt_internal_presencechanged", that._onPresenceChanged.bind(that));

                that._eventEmitter.on("evt_internal_usersettingschanged", that._onUserSettingsChanged.bind(that));
                that._eventEmitter.on("evt_internal_presencechanged", that._onPresenceChanged.bind(that));
*/
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();

            } catch (err) {
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                reject();
            }
        });
    }

    stop() {
        let that = this;

        that._logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                delete that.presenceEventHandler;
                that.presenceEventHandler = null;
                PubSub.unsubscribe(that.presenceHandlerToken);

                that._xmpp = null;
/*
                that._eventEmitter.removeListener("evt_internal_usersettingschanged", that._onUserSettingsChanged.bind(that));
                that._eventEmitter.removeListener("evt_internal_presencechanged", that._onPresenceChanged.bind(that));
*/
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve();

            } catch (err) {
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject();
            }
        });
    }

    /**
     * @private
     * @method sendInitialPresence
     * @instance
     * @description
     *  Send the initial presence (online)
     * @return {ErrorManager.Ok} A promise containing the result
     * @memberof Presence
     */
    sendInitialPresence() {

        let that = this;

        that._logger.log("debug", LOG_ID + "(sendInitialPresence) _entering_");

        return new Promise((resolve) => {
            that._eventEmitter.once("evt_internal_presencechanged", function fn_onpresencechanged(presence) {
                that._logger.log("info", LOG_ID + "(sendInitialPresence) received.");
                that._logger.log("internal", LOG_ID + "(sendInitialPresence) received : ", presence);
                that._logger.log("debug", LOG_ID + "(sendInitialPresence) - _exiting_");
                that._eventEmitter.removeListener("evt_internal_presencechanged", fn_onpresencechanged);
                resolve(ErrorManager.getErrorManager().OK);
            });
            that._xmpp.setPresence("online", "");
        });
    }

    /**
     * @public
     * @method setPresenceTo
     * @instance
     * @description
     *    Allow to change the presence of the connected user <br/>
     *    Only the following values are authorized: 'dnd', 'away', 'xa' (invisible) or 'online'
     * @param {String} presence The presence value to set i.e: 'dnd', 'away', 'xa' (invisible) or 'online'
     * @memberof Presence
     * @async
     * @return {Promise<ErrorManager>}
     * @fulfil {ErrorManager} - ErrorManager object depending on the result (ErrorManager.getErrorManager().OK in case of success)
     * @category async
     */
    setPresenceTo(presence) {

        let that = this;
        let show = "online";
        let status = "";

        that._logger.log("debug", LOG_ID + "(setPresenceTo) _entering_");

        return new Promise((resolve, reject) => {

            switch (presence) {
                case "online":
                    show = "online";
                    status = "";
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
                    reject(ErrorManager.getErrorManager().BAD_REQUEST);
                break;
            }

            that._eventEmitter.once("evt_internal_presencechanged", function fn_onpresencechanged (_presence) {
                that._logger.log("info", LOG_ID + "(setPresenceTo) received.");
                that._logger.log("internal", LOG_ID + "(setPresenceTo) received : ", _presence);
                that._logger.log("debug", LOG_ID + "(setPresenceTo) - _exiting_");
                that._eventEmitter.removeListener("evt_internal_presencechanged", fn_onpresencechanged);
                resolve(ErrorManager.getErrorManager().OK);
            });
            that._xmpp.setPresence(show, status);

            that._settings.updateUserSettings({ presence: presence});
        });
    }

     /**
     * @private
     * @method _setUserPresenceStatus
     * @instance
     * @memberof Presence
     * @description
     *      Send user presence status and message to xmpp.
     */
    _setUserPresenceStatus( status, message?) {
         let that = this;

         that._logger.log("debug", LOG_ID + "(setUserPresenceStatus) _entering_");
         return new Promise((resolve, reject) => {

             if (status === "online") {
                 that.manualState = false;
                 that._eventEmitter.once("evt_internal_presencechanged", function fn_onpresencechanged(presence) {
                     that._logger.log("info", LOG_ID + "(_setUserPresenceStatus) received.");
                     that._logger.log("internal", LOG_ID + "(_setUserPresenceStatus) received : ", presence);
                     that._logger.log("debug", LOG_ID + "(_setUserPresenceStatus) - _exiting_");
                     that._eventEmitter.removeListener("evt_internal_presencechanged", fn_onpresencechanged);
                     resolve();
                 });
                 that._xmpp.setPresence(null, status);
             } else {
                 that.manualState = true;
                 if (status === "away") {
                     that._eventEmitter.once("evt_internal_presencechanged", function fn_onpresencechanged(presence) {
                         that._logger.log("info", LOG_ID + "(_setUserPresenceStatus) received.");
                         that._logger.log("internal", LOG_ID + "(_setUserPresenceStatus) received : ", presence);
                         that._logger.log("debug", LOG_ID + "(_setUserPresenceStatus) - _exiting_");
                         that._eventEmitter.removeListener("evt_internal_presencechanged", fn_onpresencechanged);
                         resolve(ErrorManager.getErrorManager().OK);
                     });
                     that._xmpp.setPresence("away", message);
                 } else if (status === "dnd") {
                     that._eventEmitter.once("evt_internal_presencechanged", function fn_onpresencechanged(presence) {
                         that._logger.log("info", LOG_ID + "(_setUserPresenceStatus) received.");
                         that._logger.log("internal", LOG_ID + "(_setUserPresenceStatus) received : ", presence);
                         that._logger.log("debug", LOG_ID + "(_setUserPresenceStatus) - _exiting_");
                         that._eventEmitter.removeListener("evt_internal_presencechanged", fn_onpresencechanged);
                         resolve(ErrorManager.getErrorManager().OK);
                     });
                     that._xmpp.setPresence("dnd", message);
                 } else if (status === "xa") {
                     that._eventEmitter.once("evt_internal_presencechanged", function fn_onpresencechanged(presence) {
                         that._logger.log("info", LOG_ID + "(_setUserPresenceStatus) received.");
                         that._logger.log("internal", LOG_ID + "(_setUserPresenceStatus) received : ", presence);
                         that._logger.log("debug", LOG_ID + "(_setUserPresenceStatus) - _exiting_");
                         that._eventEmitter.removeListener("evt_internal_presencechanged", fn_onpresencechanged);
                         resolve(ErrorManager.getErrorManager().OK);
                     });
                     that._xmpp.setPresence("xa", message);
                 } else {
                     let error = ErrorManager.getErrorManager().BAD_REQUEST;
                     reject(error);
                 }
             }

             that._logger.log("debug", LOG_ID + "(setUserPresenceStatus) - _exiting_");
         });
     }

    /**
     * @private
     * @method _sendPresenceFromConfiguration
     * @instance
     * @memberof Presence
     * @description
     *      Send user presence according to user settings presence.
     */
    _sendPresenceFromConfiguration() {
        let that = this;

        that._logger.log("debug", LOG_ID + "(_sendPresenceFromConfiguration) _entering_");

        return new Promise( (resolve) => {

            that._settings.getUserSettings()
                .then(function(settings) {
                    let message = "";
                    let presence = settings.presence;
                    if (presence === "invisible") {
                        presence = "xa";
                    } else if (presence === "away") {
                        presence = "xa";
                        message = "away";
                    }

                    that._logger.log("internal", LOG_ID + "(_sendPresenceFromConfiguration) -> getUserSettings are " + presence + " || message : " + message);
                    if (that._currentPresence && (that._currentPresence.show !== presence || (that._currentPresence.show === "xa" && that._currentPresence.status !== message))) {
                        that._logger.log("internal", LOG_ID + "(_sendPresenceFromConfiguration) should update my status from " + that._currentPresence.show + " to " + presence + " (" + message + ")");
                        that._setUserPresenceStatus(presence, message).then(() => { resolve(); });
                    } else {
                        resolve();
                    }
                })
                .catch(function() {
                    that._logger.log("debug", LOG_ID + "(_sendPresenceFromConfiguration) failure, send online");
                    that._setUserPresenceStatus("online").then(() => { resolve(); }).catch(() => { resolve(); });
                });

        });
    }

    /**
     * @private
     * @method _onUserSettingsChanged
     * @instance
     * @memberof Presence
     * @description
     *      Method called when receiving an update on user settings
     */
    _onUserSettingsChanged() {
        let that = this;
        
        that._logger.log("debug", LOG_ID + "(_onUserSettingsChanged) _entering_");

        that._sendPresenceFromConfiguration();

        that._logger.log("debug", LOG_ID + "(_onUserSettingsChanged) - _exiting_");
    }

    /**
     * @private
     * @method _onPresenceChanged
     * @instance
     * @memberof Presence
     * @description
     *      Method called when receiving an update on user presence
     */
    _onPresenceChanged(presence) {
        let that = this;
        
        that._logger.log("debug", LOG_ID + "(_onPresenceChanged) _entering_");

        if ( presence.fulljid === that._xmpp.fullJid ) {
            that._currentPresence = presence;
        }

        that._logger.log("debug", LOG_ID + "(_onPresenceChanged) - _exiting_");
    }
}

module.exports = Presence;
