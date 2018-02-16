"use strict";

/**
 * Enum for Presence values.
 * @readonly
 * @enum {string}
 */
var RainbowPresence = {
    ONLINE: "online",
    AWAY: "away",
    INVISIBLE: "invisible",
    DND: "dnd"
};

/**
 * @class
 * @name Settings
 * @description
 *      This class represents a Settings. <br>
 *		Settings contains several informations stored and shared by application clients.<br>
 */
class Settings {
    
    constructor() {
        
        /**
         * @public
         * @readonly
         * @property {RainbowPresence} presence Setting for manual user presence (used to go back to this presence when user logs in, instead of default (online))
         * @instance
         */
        this.presence = RainbowPresence.ONLINE;
        
        /**
         * @public
         * @readonly
         * @property {boolean} displayNameOrderFirstNameFirst Setting for user display name order
         *  true: firstname first
         *  false: lastname first
         * @instance
         */
        this.displayNameOrderFirstNameFirst = true;

        /**
         * @public
         * @readonly
         * @property {string} activeAlarm Setting for active user alarm sound
         * @instance
         */
        this.activeAlarm = "";

        /**
         * @public
         * @readonly
         * @property {string} activeNotif Setting for active user notification sound
         * @instance
         */
        this.activeNotif = "";
    }
}

module.exports = {
    Settings: Settings,
    RainbowPresence: RainbowPresence
};