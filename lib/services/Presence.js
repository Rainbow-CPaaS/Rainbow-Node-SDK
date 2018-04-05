"use strict";

var Error = require("../common/Error");
let RainbowPresence = require("../common/models/Settings").RainbowPresence;

const PubSub = require("pubsub-js");
const PresenceEventHandler = require("../connection/XMPPServiceHandler/presenceEventHandler");

const LOG_ID = "PRES - ";

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

    constructor(_eventEmitter, _logger) {
        let that = this;

        that._xmpp = null;
        that._eventEmitter = _eventEmitter;
        that._logger = _logger;

        that.manualState = false;
        that._currentPresence = { status: "online", show: ""};

        that.RAINBOW_PRESENCE_ONLINE = RainbowPresence.ONLINE;
        that.RAINBOW_PRESENCE_DONOTDISTURB = RainbowPresence.DND;
        that.RAINBOW_PRESENCE_AWAY = RainbowPresence.AWAY;
        that.RAINBOW_PRESENCE_INVISIBLE = RainbowPresence.INVISIBLE;
    }

    start(_xmpp, _settings) {
        var that = this;

        that._logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = _xmpp;
                that._settings = _settings;

                that.presenceEventHandler = new PresenceEventHandler(that._xmpp);
                that.presenceHandlerToken = PubSub.subscribe( that._xmpp.hash + "." + that.presenceEventHandler.PRESENCE, that.presenceEventHandler.onPresenceReceived);

                that._eventEmitter.on("rainbow_usersettingschanged", that._onUserSettingsChanged.bind(that));
                that._eventEmitter.on("rainbow_onpresencechanged", that._onPresenceChanged.bind(that));
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();

            } catch (err) {
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                reject();
            }
        });
    }

    stop() {
        var that = this;

        that._logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                delete that.presenceEventHandler;
                that.presenceEventHandler = null;
                PubSub.unsubscribe(that.presenceHandlerToken);

                that._xmpp = null;
                that._eventEmitter.removeListener("rainbow_usersettingschanged", that._onUserSettingsChanged);
                that._eventEmitter.removeListener("rainbow_onpresencechanged", that._onPresenceChanged);
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
     * @return {Error.Ok} A promise containing the result
     * @memberof Presence
     */
    sendInitialPresence() {

        var that = this;

        that._logger.log("debug", LOG_ID + "(sendInitialPresence) _entering_");

        return new Promise((resolve) => {
            that._eventEmitter.once("rainbow_onpresencechanged", function(presence) {
                that._logger.log("info", LOG_ID + "(sendInitialPresence) received", presence);
                that._logger.log("debug", LOG_ID + "(sendInitialPresence) - _exiting_");
                resolve(Error.OK);
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
     *    Only the following values are authorized: `online`,`away`, `dnd` or `invisible`
     * @param {String} presence The presence value to set i.e: 'online', 'xa', or 'dnd'
     * @memberof Presence
     * @return {number|number} A promise containing the result
     */
    setPresenceTo(presence) {

        var that = this;
        var show = "online";
        var status = "";

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
                    that._logger.log("warn", LOG_ID + "(setPresenceTo) Bad or empty 'presence' parameter", presence);
                    reject(Error.BAD_REQUEST);
                break;
            }

            that._eventEmitter.once("rainbow_onpresencechanged", (_presence) => {
                that._logger.log("info", LOG_ID + "(setPresenceTo) received", _presence);
                that._logger.log("debug", LOG_ID + "(setPresenceTo) - _exiting_");
                resolve(Error.OK);
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
    _setUserPresenceStatus( status, message) {
        let that = this;

        that._logger.log("debug", LOG_ID + "(setUserPresenceStatus) _entering_");

        if ( status === "online") {
            that.manualState = false;
            that._xmpp.setPresence(null, status);
        } else {
            that.manualState = true;
            if (status === "away") { that._xmpp.setPresence("away", message); }
            else if (status === "dnd") { that._xmpp.setPresence("dnd", message); }
            else if (status === "xa") { that._xmpp.setPresence("xa", message); }
        }

        that._logger.log("debug", LOG_ID + "(setUserPresenceStatus) - _exiting_");
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
                    var message = "";
                    var presence = settings.presence;
                    if (presence === "invisible") {
                        presence = "xa";
                    } else if (presence === "away") {
                        presence = "xa";
                        message = "away";
                    }

                    that._logger.log("debug", LOG_ID + "(_sendPresenceFromConfiguration) -> getUserSettings are " + presence + " || message : " + message);
                    if (that._currentPresence && (that._currentPresence.show !== presence || (that._currentPresence.show === "xa" && that._currentPresence.status !== message))) {
                        that._logger.log("debug", LOG_ID + "(_sendPresenceFromConfiguration) should update my status from " + that._currentPresence.show + " to " + presence + " (" + message + ")");
                        that._setUserPresenceStatus(presence, message);
                    }

                    resolve();
                })
                .catch(function() {
                    that._logger.log("debug", LOG_ID + "(_sendPresenceFromConfiguration) failure, send online");
                    that._setUserPresenceStatus("online");
                    resolve();
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
