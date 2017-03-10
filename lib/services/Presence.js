"use strict";

const LOG_ID = 'PRES - ';

var Error = require('../common/Error');

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
        this.logger.log("debug", LOG_ID + "(start) _entering_");
        this.xmpp = _xmpp;
        this.logger.log("debug", LOG_ID + "(start) _exiting_");
    }

    /**
     * @public
     * @method sendInitialPresence
     * @description
     *  Send the initial presence (online)
     */
    sendInitialPresence() {

        var that = this;

        this.logger.log("debug", LOG_ID + "(sendInitialPresence) _entering_");

        return new Promise(function(resolve, reject) {
            that.eventEmitter.once('rainbow_onpresencechanged', function(presence) {
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
     * @description
     *    Allow to change the presence of the connected user <br/>
     *    Only the following values are authorized: RAINBOW_PRESENCE_ONLINE, RAINBOW_PRESENCE_DONOTDISTURB, RAINBOW_PRESENCE_AWAY or RAINBOW_PRESENCE_INVISIBLE
     * @param {String} strPresenceState The presence value to set i.e: 'online', 'xa', or 'dnd'
     * @return {number|number} Return a promise
     */
    setPresenceTo(strPresence) {

        var that = this;
        var show = "online";
        var status = "";

        this.logger.log("debug", LOG_ID + "(setPresenceTo) _entering_");

        return new Promise(function(resolve, reject) {

            switch (strPresence) {
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
                    that.logger.log("debug", LOG_ID + "(setPresenceTo) Bad 'strPresence' parameter", strPresence);
                    reject(Error.BAD_REQUEST);
                break;
            }

            that.eventEmitter.once('rainbow_onpresencechanged', function(presence) {
                that.logger.log("info", LOG_ID + "(setPresenceTo) received", presence);
                that.logger.log("debug", LOG_ID + "(setPresenceTo) - _exiting_");
                resolve(Error.OK);
            });
            that.xmpp.setPresence(show, status);
        });

    }

    stop() {
        this.logger.log("debug", LOG_ID + "(stop) _entering_");
        this.logger.log("debug", LOG_ID + "(stop) _exiting_");
    }
}

module.exports = Presence;