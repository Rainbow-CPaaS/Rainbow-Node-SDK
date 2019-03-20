"use strict";
export{};


    /**
 * @class
 * @name Bubble
 * @description
 *      This class represents a Bubble. <br>
 *		A bubble is an interaction between several participants based on IM media. A bubble is described by a name and a description.<br>
 *		Like for one-to-one conversation, A conversation within a bubble never ends and all interactions done can be retrieved. <br>
 */
class Bubble {
	public id: any;
	public name: any;
	public topic: any;
	public jid: any;
	public creator: any;
	public history: any;
	public users: any;
	public creationDate: any;
	public visibility: any;
	public customData: any;
	public isActive: any;
	public conference: any;

    constructor() {
        
        /**
         * @public
         * @readonly
         * @property {string} id The ID of the Bubble
         * @instance
         */
        this.id = "";
        
        /**
         * @public
         * @readonly
         * @property {string} name The name of the Bubble
         * @instance
         */
        this.name = "";

        /**
         * @public
         * @readonly
         * @property {string} topic The topic of the Bubble
         * @instance
         */
        this.topic = "";

        /**
         * @public
         * @readonly
         * @property {string} jid The JID of the Bubble
         * @instance
         */
        this.jid = "";

        /**
         * @public
         * @readonly
         * @property {string} creator The ID of the creator of the Bubble
         * @instance
         */
        this.creator = "";

        /**
         * @public
         * @readonly
         * @property {string} history The type of history the bubble supports. Can be 'none' (no history) or 'full' (Full bubble history is accessible for newcomers)
         * @instance
         */
        this.history = "none";

        /**
         * @public
         * @readonly
         * @property {Object[]} users The list of users of that Bubble with their status and privilege
         * @instance
         */
        this.users = [];

        /**
         * @public
         * @readonly
         * @property {string} creationDate The creation date of the Bubble
         * @instance
         */
        this.creationDate = "";

        /**
         * @public
         * @readonly
         * @property {string} visibility The visibility of the Bubble. Can be private (only visible for members) or public
         * @instance
         */
        this.visibility = "private";

        /**
         * @public
         * @readonly
         * @property {Object} customData The custom data attached to that Bubble. List of pairs (key/value).
         * @instance
         */
        this.customData = {};

        /**
         *
         * @type {boolean}
         */
        this.isActive = false;
    }

    /**
     * Method helper to know if room is a meeting
     * @private
     */
    isMeetingBubble() {
        if (this.conference && this.conference.mediaType === "pstnAudio") {
            return true;
        }
        return false;
    }
}


export {Bubble};
module.exports.Bubble = Bubble;
