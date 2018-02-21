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
        this.id = "597067cc2ce73eac85da42bc";
        
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
        this.visibility = "public";

        /**
         * @public
         * @readonly
         * @property {string} title The title of the Channel
         * @instance
         */
        this.title = "Own Channel";

        /**
         * @public
         * @readonly
         * @property {string} creator The ID of the creator of the channel
         * @instance
         */
        this.creator = "581b3fee383b2852d37aa096";

        /**
         * @public
         * @readonly
         * @property {string} creationDate The creation date of the channel, (read only, set automatically during creation)
         * @instance
         */
        this.creationDate = "2017-07-20T08:20:28.675Z";

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