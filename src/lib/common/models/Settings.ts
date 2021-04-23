"use strict";
export {};
import {PresenceLevel, PresenceRainbow} from "./PresenceRainbow";


/**
 * @class
 * @name Settings
 * @public
 * @description
 *      This class represents a Settings. <br>
 *		Settings contains several informations stored and shared by application clients.<br>
 */
class Settings {
	public presence: PresenceRainbow;
    public status : string ;
	public displayNameOrderFirstNameFirst: any;
	public activeAlarm: any;
	public activeNotif: any;

    constructor() {

        /**
         * @public
         * @readonly
         * @property {PresenceRainbow} presence Setting for manual user presence (used to go back to this presence when user logs in, instead of default (online))
         * @instance
         */
        this.presence = new PresenceRainbow(PresenceLevel.Online);

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
    Settings: Settings
};
export {Settings};
