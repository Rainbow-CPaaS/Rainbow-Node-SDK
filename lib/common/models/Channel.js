"use strict";

/**
 * @class
 * @name Channel
 * @description
 *      This class represents a channel. <br>
 *		A Channel is communication medium for sending notifications to a large number of users.<br>
 */
class Channel {
    
    constructor() {
        
        /**
         * @public
         * @readonly
         * @property {string} id The ID of the channel
         * @instance
         */
        this.id = "";
        
        /**
         * @public
         * @readonly
         * @property {string} name The name of the channel
         * @instance
         */
        this.name = "";

        /**
         * @public
         * @readonly
         * @property {ChannelVisibility} visibility The visibility of the channel. Can be private (only visible for members), company or public
         * @instance
         */
        this.visibility = "private";

        /**
         * @public
         * @readonly
         * @property {string} title The title of the Channel
         * @instance
         */
        this.title = "";

        /**
         * @public
         * @readonly
         * @property {string} creator The ID of the creator of the channel
         * @instance
         */
        this.creator = "";

        /**
         * @public
         * @readonly
         * @property {string} creationDate The creation date of the channel, (read only, set automatically during creation)
         * @instance
         */
        this.creationDate = "";

        /**
         * @public
         * @readonly
         * @property {number} users_count The number of users of that channel (including the connected user)
         * @instance
         */
        this.users_count = 0;
    }
}

module.exports = Channel;