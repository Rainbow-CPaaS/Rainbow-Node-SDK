"use strict";

/**
 * Enum channel visibility.
 * @readonly
 * @enum {string}
 */
var ChannelVisibility = {
    PRIVATE: "private",
    COMPANY: "company",
    PUBLIC: "public"
};

/**
 * Enum for Channel user type.
 * @readonly
 * @enum {string}
 */
var ChannelUserType = {
    MEMBER: "member",
    PUBLISHER: "publisher",
    OWNER: "owner"
};

/**
 * @class
 * @name ChannelUser
 * @description
 *  This class represents a Channel User. </br>
 *  TODO
 */
class ChannelUser {

    constructor() {
        /**
         * @public
         * @readonly
         * @property {string} id The ID of the User
         * @instance
         */
        this.id = "597067cc2ce73eac85da42bc";

        /**
         * @public
         * @readonly
         * @property {ChannelUserType} type The type of the User
         * @instance
         */
        this.type = "public";
    }
}

/**
 * @class
 * @name Channel
 * @description
 *      This class represents a Channel. <br>
 *		TODO. <br>
 */
class Channel {
    
    constructor() {
        
        /**
         * @public
         * @readonly
         * @property {string} id The ID of the Channel
         * @instance
         */
        this.id = "597067cc2ce73eac85da42bc";
        
        /**
         * @public
         * @readonly
         * @property {string} name The name of the Channel
         * @instance
         */
        this.name = "";

        /**
         * @public
         * @readonly
         * @property {ChannelVisibility} visibility The visibility of the Channel. Can be private (only visible for members), company or public
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
         * @property {string} creator The ID of the creator of the Channel
         * @instance
         */
        this.creator = "581b3fee383b2852d37aa096";

        /**
         * @public
         * @readonly
         * @property {string} creationDate The creation date of the Channel, (read only, set automatically during creation)
         * @instance
         */
        this.creationDate = "2017-07-20T08:20:28.675Z";

        /**
         * @public
         * @readonly
         * @property {ChannelUser[]} users The list of users of that Channel with their status and privilege
         * @instance
         */
        this.users = [];
    }
}

/**
 * @class
 * @name ShortChannel
 * @description
 *      This class represents a Channel. <br>
 *		TODO. <br>
 */
class ShortChannel {
    constructor() {
        
        /**
         * @public
         * @readonly
         * @property {string} id The ID of the Channel
         * @instance
         */
        this.channelId = "597067cc2ce73eac85da42bc";
        
        /**
         * @public
         * @readonly
         * @property {string} name The name of the Channel
         * @instance
         */
        this.name = "";

        /**
         * @public
         * @readonly
         * @property {string} title The title of the Channel
         * @instance
         */
        this.title = "Own Channel";
    }
}

module.exports = {
    Channel: Channel,
    ShortChannel: ShortChannel,
    ChannelUser: ChannelUser,
    ChannelUserType: ChannelUserType,
    ChannelVisibility: ChannelVisibility
};