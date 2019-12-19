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
    public lastAvatarUpdateDate: Date;
    public subscribed: boolean = false;
    public type: string = "SIMPLE";
    public invited: boolean = false;
    public category: string;
    public mode: string;
    public subscribers_count: number;
    public serverURL: string = "";
    public max_items: number;
    public max_payload_size: number;
    public pageIndex: number = 0;
    public isLoading: boolean = false;
    public complete: boolean = false;
    public users: any[] = [];
    public publishersRetreived: boolean = false;
    public loaded: boolean = false;
    public avatar: string;
    public userRole: string = 'none';
    public messageRetrieved: boolean = false;
    public messages: any[] = [];
    public deleted: boolean = false;

    /**
     * @this Channel
     */
    constructor(
        _name: string,
        _id: string,
        _visibility: string,
        _topic: string,
        _creatorId: string,
        _companyId: string,
        _creationDate: Date,
        _users_count: number,
        _lastAvatarUpdateDate: Date,
        _subscribed: boolean,
        _type: string,
        _invited: boolean,
        _category: string,
        _mode: string,
        _subscribers_count: number,
        _serverURL: string,
        _max_items: number = 0,
        _max_payload_size: number = 0,
        _pageIndex: number = 0,
        _isLoading: boolean = false,
        _complete: boolean = false,
        _users: any[] = [],
        _publishersRetreived: boolean = false,
        _loaded: boolean = false,
        _avatar: string,
        _userRole: string = 'none',
        _messageRetrieved: boolean = false,
        _messages: any[] = [],
        _deleted: boolean = false
    ) {
        /**
         * @public
         * @property {string} name channel name
         *
         */
        this.name = _name;
        /**
         * @public
         * @property {string} id channel unique identifier
         *
         */
        this.id = _id;
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
        this.visibility = _visibility;
        /**
         * @public
         * @property {string} topic channel topic
         *
         */
        this.topic = _topic;
        /**
         * @public
         * @property {string} creatorId the creator rainbow user id
         *
         */
        this.creatorId = _creatorId;
        /**
         * @public
         * @property {string} companyId the channel rainbow company id
         *
         */
        this.companyId = _companyId;
        /**
         * @public
         * @property {Date} creationDate creation date of the channel (read only, set automatically during creation)
         *
         */
        this.creationDate = _creationDate;

        /**
         * @public
         * @property {string} type type of role of the user : owner / member / publisher
         *
         */
        this.type = _type;
        /**
         * @public
         * @property {number} users_count The number of users in the channel
         *
         */
        this.users_count = _users_count;

        /**
         * @public
         * @property {number} subscribers_count The number of subscribers in the channel
         *
         */
        this.subscribers_count = _subscribers_count;

        /**
         @public
         * @property {string} category the category channel
         *
         */
        this.category = _category;

        /**
         @public
         * @property {string} mode the category mode
         *
         */
        this.mode = _mode;

        this.max_items = _max_items;
        this.max_payload_size = _max_payload_size;

        this.serverURL = _serverURL;

        this.lastAvatarUpdateDate = _lastAvatarUpdateDate;
        let timestamp = this.lastAvatarUpdateDate ? "&ts=" + new Date(this.lastAvatarUpdateDate).getTime() : "";
        this.avatar = this.serverURL + "/api/channel-avatar/" + _id + "?size=256" + timestamp;

        if (_subscribed !== undefined) { this.subscribed = _subscribed; }
        if (_type !== undefined) { this.userRole = _type; }
        if (_invited !== undefined) { this.invited = _invited; }

        if (!this.mode) {
            switch (this.visibility) {
                case "company": this.mode = "company_public"; break;
                case "public": this.mode = "all_public"; break;
                case "private": this.mode = "company_private"; break;
                default: break;
            }
        }

        this.deleted = _deleted;
    }

    public isNotMember() { return (this.userRole = "none"); }
    public isOwner() { return (this.userRole === "owner"); }
    public isPublisher() { return (this.subscribed && (this.userRole === "owner" || this.userRole === "publisher")); }
    public isMember() { return this.userRole === "member"; }
    public getAvatarSrc() { return (this.lastAvatarUpdateDate) ? this.avatar : "/resources/skins/rainbow/images/channels/default_channel_avatar.png"; }

    /**
     * @function
     * @public
     * @name updateChannel
     * @description
     * This method is used to update a channel from data object
     */
    updateChannel (data) {
        let that = this;
        if (data) {

            let channelproperties = Object.getOwnPropertyNames(that);
            //console.log("updateChannel update Channel with : ", data["id"]);
            Object.getOwnPropertyNames(data).forEach(
                (val, idx, array) => {
                    //console.log(val + " -> " + data[val]);
                    if (channelproperties.find((el) => { return val == el ;})) {
                        //console.log("WARNING : One property of the parameter of updateChannel method is not present in the Bubble class : ", val, " -> ", data[val]);
                        that[val] = data[val];
                    } else {
                        //console.log("WARNING : One property of the parameter of updateChannel method is not present in the Channel class can not update Channel with : ", val, " -> ", data[val]);
                        console.log("WARNING : One property of the parameter of updateChannel method is not present in the Channel class can not update Channel with : ");
                    }
                });
        }

        return this;
    }


    /**
     * @function
     * @public
     * @name ChannelFactory
     * @description
     * This method is used to create a channel from data object
     */
    public static ChannelFactory() {
        return (data: any, serverURL : string): Channel => {
            let channel = new Channel(
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
                serverURL,
                data.max_items,
                data.max_payload_size,
                data.pageIndex,
                data.isLoading,
                data.complete,
                data.users,
                data.publishersRetreived,
                data.loaded,
                data.avatar,
                data.userRole,
                data.messageRetrieved,
                data.messages,
                data.deleted
        );

            if (data) {
                let channelproperties = Object.getOwnPropertyNames(channel);
                Object.getOwnPropertyNames(data).forEach(
                    (val, idx, array) => {
                        //console.log(val + " -> " + data[val]);
                        if (!channelproperties.find((el) => { return val == el ;})) {
                            //console.log("WARNING : One property of the parameter of ChannelFactory method is not present in the Channel class : ", val, " -> ", data[val]);
                            console.log("WARNING : One property of the parameter of ChannelFactory method is not present in the Channel class : ", val);
                        }
                    });
            }

            return channel;
        };
    }
}


module.exports.Channel = Channel;
export {Channel};
