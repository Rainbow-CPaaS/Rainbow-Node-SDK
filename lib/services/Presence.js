"use strict";

var Error = require("../common/Error");

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
        this.xmpp = null;
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;
        this.RAINBOW_PRESENCE_ONLINE = "online";
        this.RAINBOW_PRESENCE_DONOTDISTURB = "dnd";
        this.RAINBOW_PRESENCE_AWAY = "away";
        this.RAINBOW_PRESENCE_INVISIBLE = "invisible";
    }

    start(_xmpp) {
        var that = this;

        this.logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.xmpp = _xmpp;
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();

            } catch (err) {
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                reject();
            }
        });
    }

    stop() {
        var that = this;

        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that.xmpp = null;
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
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

        this.logger.log("debug", LOG_ID + "(sendInitialPresence) _entering_");

        return new Promise((resolve) => {
            that.eventEmitter.once("rainbow_onpresencechanged", function(presence) {
                that.logger.log("info", LOG_ID + "(sendInitialPresence) received", presence);
                that.logger.log("debug", LOG_ID + "(sendInitialPresence) - _exiting_");
                resolve(Error.OK);
            });
            that.xmpp.setPresence("online", "");
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

        this.logger.log("debug", LOG_ID + "(setPresenceTo) _entering_");

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
                    that.logger.log("warn", LOG_ID + "(setPresenceTo) Bad or empty 'presence' parameter", presence);
                    reject(Error.BAD_REQUEST);
                break;
            }

            that.eventEmitter.once("rainbow_onpresencechanged", (presence) => {
                that.logger.log("info", LOG_ID + "(setPresenceTo) received", presence);
                that.logger.log("debug", LOG_ID + "(setPresenceTo) - _exiting_");
                resolve(Error.OK);
            });
            that.xmpp.setPresence(show, status);
        });
    }
}

module.exports = Presence;
