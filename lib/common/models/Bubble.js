"use strict";

/**
 * @class
 * @name Bubble
 * @description
 *      This class represents a Bubble. <br>
 *		A bubble is an interaction between several participants based on IM media. A bubble is described by a name and a description.<br>
 *		Like for one-to-one conversation, A conversation within a bubble never ends and all interactions done can be retrieved. <br>
 */
class Bubble {
    
    constructor() {
        
        /**
         * @public
         * @readonly
         * @property {string} id The ID of the Bubble
         * @instance
         */
        this.id = "597067cc2ce73eac85da42bc";
        
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
        this.jid = "room_53fa126b3dd04a2b95c44c9937eddf19@muc.sandbox-all-in-one-prod-1.opentouch.cloud";

        /**
         * @public
         * @readonly
         * @property {string} creator The ID of the creator of the Bubble
         * @instance
         */
        this.creator = "581b3fee383b2852d37aa096";

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
        this.creationDate = "2017-07-20T08:20:28.675Z";

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

module.exports = Bubble;