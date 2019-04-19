"use strict";
import {Conversation} from "./Conversation";

export {};

/**
 * @class
 * @public
 * @name Channel
 * @description
 * This class is used to represent a channel
 */
class Channel {
    public name: string;
    public id: string;
    public visibility: string;
    public topic: string;
    public creatorId: string;
    public companyId: string;
    public creationDate: Date;
    public users_count: number;
    public avatar: string;
    public lastAvatarUpdateDate: Date;
    public userRole: string = 'none';
    public messageRetrieved: boolean = false;
    public messages: any[] = [];
    public subscribed: boolean = false;
    public deleted: boolean = false;
    public invited: boolean = false;
    public category: string;
    public type: string = "SIMPLE";
    public pageIndex: number = 0;
    public isLoading: boolean = false;
    public complete: boolean = false;
    public users: any[] = [];
    public publishersRetreived: boolean = false;
    public mode: string;
    public subscribers_count: number;
    public loaded: boolean = false;
    public serverURL: string = "";

    /**
     * @this Channel
     */
    constructor(
        name: string,
        id: string,
        visibility: string,
        topic: string,
        creatorId: string,
        companyId: string,
        creationDate: Date,
        users_count: number,
        lastAvatarUpdateDate: Date,
        subscribed: boolean,
        type: string,
        invited: boolean,
        category: string,
        mode: string,
        subscribers_count: number,
        serverURL: string
    ) {
        /**
         * @public
         * @property {string} name channel name
         *
         */
        this.name = name;
        /**
         * @public
         * @property {string} id channel unique identifier
         *
         */
        this.id = id;
        /**
         * @public
         * @property {string} visibility channel type/visibility<br/>
         * 		"private" : a « Pub » channel, only the owner may publish messages.<br/>
         * 					Managed by owner, the only one who can add or remove users in a private channels.<br/>
         * 					Can't be found by search.<br/>
         * 		"company" : « PubSub » channel (company users may join/leave)
         * 					May be found by search for users in the same company.<br/>
         * 		"public"  : « PubSub » public channel.
         * 					Only allowed users may create a "public" channel.
         * 					May be found by search for all users.<br/>
         *
         */
        this.visibility = visibility;
        /**
         * @public
         * @property {string} topic channel topic
         *
         */
        this.topic = topic;
        /**
         * @public
         * @property {string} creatorId the creator rainbow user id
         *
         */
        this.creatorId = creatorId;
        /**
         * @public
         * @property {string} companyId the channel rainbow company id
         *
         */
        this.companyId = companyId;
        /**
         * @public
         * @property {Date} creationDate creation date of the channel (read only, set automatically during creation)
         *
         */
        this.creationDate = creationDate;

        /**
         * @public
         * @property {string} type type of role of the user : owner / member / publisher
         *
         */
        this.type = type;
        /**
         * @public
         * @property {number} users_count The number of users in the channel
         *
         */
        this.users_count = users_count;

        /**
         * @public
         * @property {number} subscribers_count The number of subscribers in the channel
         *
         */
        this.subscribers_count = subscribers_count;

        /**
         @public
         * @property {string} category the category channel
         *
         */
        this.category = category;

        /**
         @public
         * @property {string} mode the category mode
         *
         */
        this.mode = mode;

        this.serverURL = serverURL;

        this.lastAvatarUpdateDate = lastAvatarUpdateDate;
        let timestamp = this.lastAvatarUpdateDate ? "&ts=" + new Date(this.lastAvatarUpdateDate).getTime() : "";
        this.avatar = this.serverURL + "/api/channel-avatar/" + id + "?size=256" + timestamp;

        if (subscribed !== undefined) { this.subscribed = subscribed; }
        if (type !== undefined) { this.userRole = type; }
        if (invited !== undefined) { this.invited = invited; }

        if (!this.mode) {
            switch (this.visibility) {
                case "company": this.mode = "company_public"; break;
                case "public": this.mode = "all_public"; break;
                case "private": this.mode = "company_private"; break;
                default: break;
            }
        }

    }

    public isNotMember() { return (this.userRole = "none"); }
    public isOwner() { return (this.userRole === "owner"); }
    public isPublisher() { return (this.subscribed && (this.userRole === "owner" || this.userRole === "publisher")); }
    public isMember() { return this.userRole === "member"; }
    public getAvatarSrc() { return (this.lastAvatarUpdateDate) ? this.avatar : "/resources/skins/rainbow/images/channels/default_channel_avatar.png"; }



    /**
     * @function
     * @public
     * @name ChannelFactory
     * @description
     * This class is used to create a channel from data object
     */
    public static ChannelFactory() {
        return (data: any, serverURL : string): Channel => {
            return new Channel(
                data.name,
                data.id,
                data.visibility,
                data.topic,
                data.creatorId,
                data.companyId,
                data.creationDate,
                data.users_count,
                data.lastAvatarUpdateDate,
                data.subscribed,
                data.type,
                data.invited,
                data.category,
                data.mode,
                data.subscribers_count,
                serverURL
            );
        };
    }
}


module.exports.Channel = Channel;
export {Channel};