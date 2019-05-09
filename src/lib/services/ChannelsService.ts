"use strict";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";

export {};


import {ErrorManager} from "../common/ErrorManager";
import {Channel} from "../common/models/Channel";
import {ChannelEventHandler} from "../connection/XMPPServiceHandler/channelEventHandler";
import {localeData} from "moment";
import {types} from "util";


const PubSub = require("pubsub-js");

const LOG_ID = "CHANNELS/SVCE - ";

/**
 * @class
 * @name Channels
 * @description
 *      This service manages Channels. This service is in Beta.
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Create a new channel <br>
 *      - Manage a channel: update, delete <br>
 *      - Manage users in a channel <br>
 *  @todo Write the documentation.
 */
class Channels {
	public _xmpp: XMPPService;
	public _rest: RESTService;
	public _channels: any;
	public _channelsList: any;
	public _eventEmitter: any;
	public _logger: any;
	public MAX_ITEMS: any;
	public MAX_PAYLOAD_SIZE: any;
	public PUBLIC_VISIBILITY: any;
    public PRIVATE_VISIBILITY: any;
    public CLOSED_VISIBILITY: any;
    public channelEventHandler: ChannelEventHandler;
    public channelHandlerToken: any;
    public invitationCounter: number = 0;


    public LIST_EVENT_TYPE = {
        ADD: 0,
        UPDATE: 1,
        REMOVE: 2,
        DELETE: 3,
        SUBSCRIBE: 4,
        UNSUBSCRIBE: 5,
        CREATE: 6
    };

    public USER_ROLE = {
        NONE: "none",
        OWNER: "owner",
        PUBLISHER: "publisher",
        MEMBER: "member"
    };


    constructor(_eventEmitter, _logger) {
        this._xmpp = null;
        this._rest = null;
        this._channels = null;
        this._channelsList = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
        this.MAX_ITEMS = 100;
        this.MAX_PAYLOAD_SIZE = 60000;
        this.PUBLIC_VISIBILITY = "company";
        this.PRIVATE_VISIBILITY = "private";
        this.CLOSED_VISIBILITY = "closed";

        this._eventEmitter.on("rainbow_channelitemreceived", this._onChannelMessageReceived.bind(this));

        this._eventEmitter.on("rainbow_addtochannel", this.onAddToChannel.bind(this));
        this._eventEmitter.on("rainbow_updatetochannel", this.onUpdateToChannel.bind(this));
        this._eventEmitter.on("rainbow_removefromchannel", this.onRemovedFromChannel.bind(this));
        this._eventEmitter.on("rainbow_subscribetochannel", this.onSubscribeToChannel.bind(this));
        this._eventEmitter.on("rainbow_unsubscribetochannel", this.onUnsubscribeToChannel.bind(this));
        this._eventEmitter.on("rainbow_deletechannel", this.onDeleteChannel.bind(this));

        this._eventEmitter.on("rainbow_usersubscribechannel", this.onUserSubscribeEvent.bind(this));
        this._eventEmitter.on("rainbow_userunsubscribechannel", this.onUserUnsubscribeEvent.bind(this));


    }

    start(_xmpp : XMPPService, _rest : RESTService) {
        let that = this;
        that._logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise((resolve, reject) => {
            try {
                that._xmpp = _xmpp;
                that._rest = _rest;
                that._channels = [];
                that._channelsList = [];
                that._attachHandlers();
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();
            }
            catch (err) {
                that._logger.log("debug", LOG_ID + "(start) _exiting_");
                reject();
            }
        });
    }

    stop() {
        this._logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise((resolve, reject) => {
            try {
                this._xmpp = null;
                this._rest = null;
                this._channels = null;
                this._channelsList = null;
//                this._eventEmitter.removeListener("rainbow_onchannelmessagereceived", this._onChannelMessageReceived);
                this._logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve();
            } catch (err) {
                this._logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject(err);
            }
        });
    }

    _attachHandlers() {
        let that = this;
        that.channelEventHandler = new ChannelEventHandler(that._xmpp, that);
        that.channelHandlerToken = [
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_CHAT, that.conversationEventHandler.onChatMessageReceived),
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_GROUPCHAT, that.conversationEventHandler.onChatMessageReceived),
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_WEBRTC, that.conversationEventHandler.onWebRTCMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that.channelEventHandler.MESSAGE_MANAGEMENT, that.channelEventHandler.onManagementMessageReceived),
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_ERROR, that.conversationEventHandler.onErrorMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that.channelEventHandler.MESSAGE_HEADLINE, that.channelEventHandler.onHeadlineMessageReceived),
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_CLOSE, that.conversationEventHandler.onCloseMessageReceived)
        ];

    }

    /**
     * @public
     * @method createChannel
     * @instance
     * @async
     * @param {string} name  The name of the channel to create (max-length=255)
     * @param {string} [channelTopic]  The description of the channel to create (max-length=255)
     * @return {Promise<Channel>} New Channel
     * @memberof Channels
     * @description
     *  Create a new public channel with a visibility limited to my company
     */
    createChannel(name, channelTopic) {
        return this.createPublicChannel(name, channelTopic, "globalnews");
    }

    /**
     * @public
     * @method createPublicChannel
     * @instance
     * @async
     * @param {string} name  The name of the channel to create (max-length=255)
     * @param {string} [channelTopic]  The description of the channel to create (max-length=255)
     * @param {String} [category=""] The category of the channel
     * @return {Promise<Channel>} New Channel
     * @memberof Channels
     * @description
     *  Create a new public channel with a visibility limited to my company
     */
    createPublicChannel(name, channelTopic, category) : Promise<Channel>{
        return new Promise((resolve, reject) => {

            this._logger.log("debug", LOG_ID + "(createPublicChannel) _entering_");
        
            if (!name) {
                this._logger.log("warn", LOG_ID + "(createPublicChannel) bad or empty 'name' parameter", name);
                this._logger.log("debug", LOG_ID + "(createPublicChannel) _exiting_");
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } 
            this._rest.createPublicChannel(name, channelTopic, category, this.PUBLIC_VISIBILITY, this.MAX_ITEMS, this.MAX_PAYLOAD_SIZE).then((channel) => {
                this._logger.log("debug", LOG_ID + "(createPublicChannel) creation successfull");
                //let channelObj : Channel = this.addChannelToCache(channel);
                let channelObj : Channel = Channel.ChannelFactory()(channel, this._rest.http.serverURL);
                resolve(channelObj);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(createPublicChannel) error");
                this._logger.log("debug", LOG_ID + "(createPublicChannel) _exiting_");
                reject(err);
            }); 
        });
    }

    /**
     * @public
     * @method createClosedChannel (ex: createPrivateChannel)
     * @instance
     * @async
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the createClosedChannel method instead,
     * @param {string} name  The name of the channel to create (max-length=255)
     * @param {string} [description]  The description of the channel to create (max-length=255)
     * @return {Promise<Channel>} New Channel
     * @memberof Channels
     * @description
     *  Create a new private channel
     */
    createPrivateChannel(name, description) {
        return this.createClosedChannel(name, description, "globalnews");
    }

    /**
     * @public
     * @method createClosedChannel (ex: createPrivateChannel)
     * @instance
     * @async
     * @param {string} name  The name of the channel to create (max-length=255)
     * @param {string} [description]  The description of the channel to create (max-length=255)
     * @param {String} [category=""] The category of the channel
     * @return {Promise<Channel>} New Channel
     * @memberof Channels
     * @description
     *  Create a new closed channel
     */
    createClosedChannel(name, description, category) : Promise<Channel> {
        
        return new Promise((resolve, reject) => {

            this._logger.log("debug", LOG_ID + "(createClosedChannel) _entering_");
        
            if (!name) {
                this._logger.log("warn", LOG_ID + "(createClosedChannel) bad or empty 'name' parameter", name);
                this._logger.log("debug", LOG_ID + "(createClosedChannel) _exiting_");
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } 
            this._rest.createPublicChannel(name, description, category, this.PRIVATE_VISIBILITY, this.MAX_ITEMS, this.MAX_PAYLOAD_SIZE).then((channel) => {
                this._logger.log("debug", LOG_ID + "(createClosedChannel) creation successfull");
                //let channelObj : Channel = this.addChannelToCache(channel);
                let channelObj : Channel = Channel.ChannelFactory()(channel, this._rest.http.serverURL);
                resolve(channelObj);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(createClosedChannel) error");
                this._logger.log("debug", LOG_ID + "(createClosedChannel) _exiting_");
                reject(err);
            }); 
        });
    }

    /**
     * @public
     * @method deleteChannel
     * @instance
     * @async
     * @param {Channel} channel  The channel to delete
     * @return {Promise<CHannel>} Promise object represents The channel deleted
     * @memberof Channels
     * @description
     *  Delete a owned channel
     */
    deleteChannel(channel) : Promise<Channel> {

        return new Promise((resolve, reject) => {
            this._logger.log("debug", LOG_ID + "(deleteChannel) _entering_");

            if (!channel) {
                this._logger.log("warn", LOG_ID + "(deleteChannel) bad or empty 'channel' parameter", channel);
                this._logger.log("debug", LOG_ID + "(deleteChannel) _exiting_");
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } 
            
            this._rest.deleteChannel(channel.id).then((status) => {
                this._logger.log("debug", LOG_ID + "(deleteChannel) channel deleted status : ", status);
                let channelRemoved = this._channels.splice(this._channels.findIndex((el) => {
                    return el.id === channel.id;
                }), 1);
                this._logger.log("debug", LOG_ID + "(deleteChannel) channel deleted : ", channelRemoved);
                if (channelRemoved.length >= 1) {
                    resolve(channelRemoved[0]);
                } else {
                    this._logger.log("warn", LOG_ID + "(deleteChannel) the channel deleted was unknown from SDK cache : ", channel);
                    resolve(channel);
                }
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(deleteChannel) error");
                this._logger.log("debug", LOG_ID + "(deleteChannel) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method findChannelsByName
     * @instance
     * @async
     * @param {String} name Search this provided substring in the channel name (case insensitive).
     * @return {Promise<Channel[]>} Channels found
     * @description
     *  Find channels by name. Only channels with visibility equals to 'company' can be found. First 100 results are returned.
     * @memberof Channels
     */
    findChannelsByName(name : string) : Promise<[Channel]> {

        if (!name) {
            this._logger.log("error", LOG_ID + "(findChannelsByName) bad or empty 'name' parameter ", name);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return this._findChannels(name, null);
    }

    /**
     * @public
     * @method findChannelsByTopic
     * @instance
     * @async
     * @param {String} topic Search this provided substring in the channel topic (case insensitive).
     * @return {Promise<Channel[]>} Channels found
     * @description
     *  Find channels by topic. Only channels with visibility equals to 'company' can be found. First 100 results are returned.
     * @memberof Channels
     */
    findChannelsByTopic(topic : string) : Promise<[Channel]> {

        if (!topic) {
            this._logger.log("error", LOG_ID + "(findChannelsByTopic) bad or empty 'topic' parameter ", topic);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return this._findChannels(null, topic);
    }

    /**
     * @private
     * @method findChannels
     * @memberof Channels
     */
    private _findChannels(name : string, topic : string) : Promise<[Channel]> {
        //hack
        let getChannel = (id) : Promise<Channel> => {
            return new Promise((resolve) => {
                this.fetchChannel(id).then((channel : Channel) => {
                    resolve(channel);
                }).catch(() => {
                    resolve(null);
                });
            });
        };
        
        this._logger.log("debug", LOG_ID + "(_findChannels) _entering_");
        
        return new Promise((resolve, reject) => {

            this._rest.findChannels(name, topic, null, null, null, null, null).then((channels : []) => {
                this._logger.log("info", LOG_ID + "(_findChannels) findChannels channels found", channels);

                let promises = [];

                channels.forEach((channel : any) => {
                    promises.push(getChannel(channel.id));
                });

                Promise.all(promises).then((listOfChannels : [Channel]) => {
                    resolve(listOfChannels);
                });

            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(_findChannels) error", err);
                this._logger.log("debug", LOG_ID + "(_findChannels) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method getChannelById
     * @instance
     * @async
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the fetchChannel method instead,
     * @param {String} id The id of the channel)
     * @param {boolean} [force=false] True to force a request to the server
     * @return {Promise<Channel>} The channel found
     * @description
     * Find a channel by its id (locally if exists or by sending a request to Rainbow)
     * @memberof Channels
     */
    getChannelById(id, force?) : Promise <Channel> {
        return this.fetchChannel(id,  force);
    }

    /**
     * @public
     * @method fetchChannel
     * @instance
     * @async
     * @param {String} id The id of the channel)
     * @param {boolean} [force=false] True to force a request to the server
     * @return {Promise<Channel>} The channel found
     * @description
     * Find a channel by its id (locally if exists or by sending a request to Rainbow)
     * @memberof Channels
     */
    async fetchChannel(id, force?) : Promise<Channel>{
        return new Promise(async (resolve, reject) => {
            if (!id) {
                this._logger.log("warn", LOG_ID + "(fetchChannel) bad or empty 'jid' parameter", id);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            else {
                let channelFound = null;

                if (this._channels) {
                    channelFound = this._channels.find((channel) => {
                        return channel.id === id;
                    });
                }

                if (channelFound && !force) {
                    this._logger.log("info", LOG_ID + "(fetchChannel) channel found locally", channelFound);
                    resolve(channelFound);
                }
                else {
                    this._logger.log("debug", LOG_ID + "(fetchChannel) channel not found locally. Ask the server...");
                    let channel = await this.getChannel(id);
                    let channelObj : Channel = this.addChannelToCache(channel);
                    resolve(channelObj);
                }
            }
        });
    }

    /**
     * @public
     * @method fetchChannelsByFilter
     * @since 1.55
     * @instance
     * @description
     *    Find channels using a filter (on name, topic)<br/>
     *    Result may be filtered with result limit, offet and sortField or SortOrder
     *    Return a promise.
     * @param {Object} filter The filter with at least [filter.name] or [filter.topic] defined
     *      {String} [filter.name] search by channel names (case insensitive substring).
     *      {String} [filter.topic] search by channel topics (case insensitive substring).
     *      {Number} [filter.limit=100] allow to specify the number of channels to retrieve.
     *      {Number} [filter.offset] allow to specify the position of first channel to retrieve (first channel if not specified). Warning: if offset > total, no results are returned.
     *      {String} [filter.sortField="name"] sort channel list based on the given field.
     *      {Number} [filter.sortOrder="1"] specify order ascending/descending. 1 for ascending, -1 for descending.
     * @return {Object} Result of the find with
     *      {Array}   found channels informations with an array of { id, name, topic, creatorId, visibility, users_count }
     */
    fetchChannelsByFilter (filter) : Promise<[Channel]> {
        this._logger.log("debug", LOG_ID + "(fetchChannelsByFilter) _entering_");

        let getChannel = (id) : Promise<Channel> => {
            return new Promise((resolve) => {
                this.fetchChannel(id).then((channel : Channel) => {
                    resolve(channel);
                }).catch(() => {
                    resolve(null);
                });
            });
        };

        if (!filter) {
            this._logger.log("debug", LOG_ID + "(fetchChannelsByFilter) bad or empty 'channel' parameter ", filter);
            this._logger.log("debug", LOG_ID + "(fetchChannelsByFilter) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            this._rest.findChannels(filter.name, filter.topic, filter.category, filter.limit, filter.offset, filter.sortField, (filter.sortOrder && (filter.sortOrder === 1) ? "1" : "-1")).then((channels : []) => {
                this._logger.log("info", LOG_ID + "(fetchChannelsByFilter) channels found", channels);

                let promises = [];

                channels.forEach((channel : Channel) => {
                    promises.push(getChannel(channel.id));
                });

                Promise.all(promises).then((listOfChannels : [Channel]) => {
                    resolve(listOfChannels);
                });

            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(fetchChannelsByFilter) error", err);
                this._logger.log("debug", LOG_ID + "(fetchChannelsByFilter) _exiting_");
                reject(err);
            });
        });
    };

    /**
     * @public
     * @method getChannels
     * @since 1.38
     * @instance
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the fetchMyChannels method instead,
     * @description
     *    Get the channels you own, are subscribed to, are publisher<br/>
     *    Return a promise.
     * @return {{Promise<Channel[]>} } Return Promise with a list of channels or an empty array if no channel has been found
     */
    getChannels() {
        return this.fetchMyChannels();
    }

    /**
     * @public
     * @method fetchMyChannels
     * @since 1.38
     * @instance
     * @description
     *    Get the channels you own, are subscribed to, are publisher<br/>
     *    Return a promise.
     * @return {{Promise<Channel[]>} } Return Promise with a list of channels or an empty array if no channel has been found
     */
    fetchMyChannels() : Promise<[Channel]>{
        let getChannel = (id) : Promise<Channel> => {
            return new Promise((resolve) => {
                this.fetchChannel(id).then((channel) => {
                    resolve(channel);
                }).catch(() => {
                    resolve(null);
                });
            });
        };
        
        return new Promise((resolve) => {

            this._logger.log("debug", LOG_ID + "(fetchMyChannels) _entering_");

            this._rest.getChannels().then((listOfChannels : any) => {

                // Hack waiting server change
                let promises = [];

                if (Array.isArray(listOfChannels)) {
                    listOfChannels.forEach((channel) => {
                        promises.push(getChannel(channel.id));
                    });
                } else {
                    if ( "owner" in listOfChannels) {
                        listOfChannels.owner.forEach((channel) => {
                            promises.push(getChannel(channel.id));
                        });
                    }
                    if ( "publisher" in listOfChannels) {
                        listOfChannels.publisher.forEach((channel) => {
                            promises.push(getChannel(channel.id));
                        });
                    }
                    if ( "member" in listOfChannels) {
                        listOfChannels.member.forEach((channel) => {
                            promises.push(getChannel(channel.id));
                        });
                    }
                }

                this._logger.log("info", LOG_ID + "(fetchMyChannels) hack start get channel data individually from server...");
                Promise.all(promises).then((channels : [Channel]) => {
                    this._logger.log("internal", LOG_ID + "(fetchMyChannels) hack done", channels);
                    this._channels = channels;
                    this._logger.log("info", LOG_ID + "(fetchMyChannels) get successfully");
                    this._logger.log("debug", LOG_ID + "(fetchMyChannels) _exiting_");
                    resolve(this._channels);
                });
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(fetchMyChannels) error", err);
                this._logger.log("debug", LOG_ID + "(fetchMyChannels) _exiting_");
                // Do not block the startup on VM without channels API
                this._channels = [];
                resolve(this._channels);
            });
        });
    }

    /**
     * @public
     * @method getAllChannels
     * @instance
     * @return {Channel[]} An array of channels (owned and subscribed) 
     * @memberof Channels
     * @description
     *  Return the list of channels (owned and subscribed)
     */
    getAllChannels() : [Channel] {
        return this._channels;
    }

    /**
     * @public
     * @method getAllOwnedChannel
     * @instance
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the getAllOwnedChannels method instead,
     * @return {Channel[]} An array of channels (owned only)
     * @memberof Channels
     * @description
     *  Return the list of owned channels only
     */
    getAllOwnedChannel(){
        return this.getAllOwnedChannels();
    }

    /**
     * @public
     * @method getAllOwnedChannels
     * @instance
     * @return {Channel[]} An array of channels (owned only)
     * @memberof Channels
     * @description
     *  Return the list of owned channels only
     */
    getAllOwnedChannels() : [Channel] {
        return this._channels.filter((channel) => {
            return channel.creatorId === this._rest.userId;
        });
    }

    /**
     * @public
     * @method getAllSubscribedChannel
     * @instance
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the getAllSubscribedChannels method instead,
     * @return {Channel[]} An array of channels (subscribed only)
     * @memberof Channels
     * @description
     *  Return the list of subscribed channels only
     */
    getAllSubscribedChannel() {
        return this.getAllSubscribedChannels();
    }

    /**
     * @public
     * @method getAllSubscribedChannels
     * @instance
     * @return {Channel[]} An array of channels (subscribed only)
     * @memberof Channels
     * @description
     *  Return the list of subscribed channels only
     */
    getAllSubscribedChannels() : [Channel] {
        return this._channels.filter((channel) => {
            return channel.creatorId !== this._rest.userId;
        });
    }


    /**
     * @public
     * @method getAllPendingChannels
     * @instance
     * @return {Channel[]} An array of channels (invited only)
     * @memberof Channels
     * @description
     *  Return the list of invited channels only
     */
    getAllPendingChannels() : [Channel] {
        return this._channels.filter((channel) => {
            return channel.invited;
        });
    }

    /**
     * @public
     * @method publishMessageToChannel
     * @instance
     * @async
     * @param {Channel} channel The channel where to publish the message
     * @param {String} message Message content
     * @param {String} [title = "", limit=256] Message title
     * @param {String} [url = ""] An URL
     * @param {id[]} [imagesIds = null] An Array of ids of the files stored in Rainbow
     * @param {String} [type="basic"] An optional message content type (could be basic, markdown, html or data)
     * @return {Promise<ErrorManager.getErrorManager().OK>} OK if successfull
     * @description
     *  Publish to a channel
     * @memberof Channels
     */
    publishMessageToChannel(channel, message, title, url, imagesIds, type) : Promise<{}> {
        return this.createItem(channel, message, title, url, imagesIds, type);
    }

    /**
     * @public
     * @method createItem
     * @instance
     * @async
     * @param {Channel} channel The channel where to publish the message
     * @param {String} message Message content
     * @param {String} [title = "", limit=256] Message title
     * @param {String} [url = ""] An URL
     * @param {id[]} [imagesIds = null] An Array of ids of the files stored in Rainbow
     * @param {String} [type="basic"] An optional message content type (could be basic, markdown, html or data)
     * @return {Promise<ErrorManager.getErrorManager().OK>} OK if successfull
     * @description
     *  Publish to a channel
     * @memberof Channels
     */
    createItem(channel, message, title, url, imagesIds, type) : Promise <{}> {
        this._logger.log("debug", LOG_ID + "(createItem) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(createItem) bad or empty 'channel' parameter ", channel);
            this._logger.log("debug", LOG_ID + "(createItem) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!message) {
            this._logger.log("debug", LOG_ID + "(createItem) bad or empty 'title' parameter ", title);
            this._logger.log("debug", LOG_ID + "(createItem) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (imagesIds && typeof imagesIds !== "object" && imagesIds.length < 1) {
            this._logger.log("debug", LOG_ID + "(createItem) bad or empty 'imagesIds' parameter ", imagesIds);
            this._logger.log("debug", LOG_ID + "(createItem) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (type && ["basic, markdown, html, data"].indexOf(type) === -1) {
            this._logger.log("debug", LOG_ID + "(createItem) bad or empty 'type' parameter ", type, " \"Parameter 'type' could be 'basic', 'markdown', 'html' or 'data'\"");
            this._logger.log("debug", LOG_ID + "(createItem) _exiting_");
            return Promise.reject(ErrorManager);
        }


        return new Promise((resolve, reject) => {
            type = type ? "urn:xmpp:channels:" + type : "urn:xmpp:channels:basic";

            this._rest.publishMessage(channel.id, message, title, url, imagesIds, type).then((status) => {
                this._logger.log("info", LOG_ID + "(createItem) message published");
                this._logger.log("internal", LOG_ID + "(createItem) message published", status);
                this._logger.log("debug", LOG_ID + "(createItem) _exiting_");
                resolve(ErrorManager.getErrorManager().OK);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(createItem) error", err);
                this._logger.log("debug", LOG_ID + "(createItem) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method subscribeToChannel
     * @instance
     * @async
     * @param {Channel} channel The channel to subscribe
     * @return {Promise<Channel>} The channel updated with the new subscription
     * @description
     *  Subscribe to a public channel
     * @memberof Channels
     */
    subscribeToChannel(channel : Channel) : Promise<Channel> {
        
        this._logger.log("debug", LOG_ID + "(subscribeToChannel) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(subscribeToChannel) bad or empty 'channel' parameter ", channel);
            this._logger.log("debug", LOG_ID + "(subscribeToChannel) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            this._rest.subscribeToChannel(channel.id).then((status) => {
                this._logger.log("info", LOG_ID + "(subscribeToChannel) channel subscribed", status);

                this.fetchChannel(channel.id, true).then((channelUpdated) => {
                    this._logger.log("debug", LOG_ID + "(subscribeToChannel) _exiting_");
                    resolve(channelUpdated);
                });
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(subscribeToChannel) error", err);
                this._logger.log("debug", LOG_ID + "(subscribeToChannel) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method unsubscribeFromChannel
     * @instance
     * @async
     * @param {Channel} channel The channel to unsubscribe
     * @return {Promise<String>} The status of the unsubscribe.
     * @description
     *  Unsubscribe from a public channel
     * @memberof Channels
     */
    unsubscribeFromChannel(channel : Channel) : Promise<String> {
        
        this._logger.log("debug", LOG_ID + "(unsubscribeFromChannel) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(unsubscribeFromChannel) bad or empty 'channel' parameter ", channel);
            this._logger.log("debug", LOG_ID + "(unsubscribeFromChannel) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            this._rest.unsubscribeToChannel(channel.id).then((status : String) => {
                this._logger.log("info", LOG_ID + "(unsubscribeFromChannel) channel unsubscribed", status);
                this._logger.log("debug", LOG_ID + "(unsubscribeFromChannel) _exiting_");
                resolve(status);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(unsubscribeFromChannel) error", err);
                this._logger.log("debug", LOG_ID + "(unsubscribeFromChannel) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method updateChannelTopic
     * @instance
     * @async
     * @param {Channel} channel The channel to update
     * @param {string} description  The description of the channel to update (max-length=255)
     * @return {Promise<Channel>} Updated channel
     * @description
     *  TODO
     * @memberof Channels
     */
    updateChannelTopic (channel, description) : Promise <Channel> {
        return this.updateChannelDescription(channel, description);
    }

    /**
     * @public
     * @method updateChannelDescription
     * @instance
     * @async
     * @param {Channel} channel The channel to update
     * @param {string} description  The description of the channel to update (max-length=255)
     * @return {Promise<Channel>} Updated channel
     * @description
     *  TODO
     * @memberof Channels
     */
    updateChannelDescription(channel, description) : Promise <Channel> {
        
        this._logger.log("debug", LOG_ID + "(updateChannelDescription) _entering_");

        if (!channel) {
            this._logger.log("debug", LOG_ID + "(updateChannelDescription) bad or empty 'channel' parameter ", channel);
            this._logger.log("debug", LOG_ID + "(updateChannelDescription) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!channel.id) {
            this._logger.log("debug", LOG_ID + "(updateChannelDescription) bad or empty 'channel.id' parameter ", channel.id);
            this._logger.log("debug", LOG_ID + "(updateChannelDescription) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!description) {
            this._logger.log("debug", LOG_ID + "(updateChannelDescription) bad or empty 'description' parameter ", description);
            this._logger.log("debug", LOG_ID + "(updateChannelDescription) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            this._rest.updateChannel(channel.id, description, null,  null , null, null, null).then((channelUpdated : any) => {
                this._logger.log("info", LOG_ID + "(updateChannelDescription) channel updated", channel);

                let foundIndex = this._channels.findIndex(channelItem => channelItem.id === channelUpdated.id);
                let channelObj : Channel = Channel.ChannelFactory()(channelUpdated, this._rest.http.serverURL);
                this._channels[foundIndex] = channelObj;

                this._logger.log("debug", LOG_ID + "(updateChannelDescription) _exiting_");
                resolve(channelObj);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(updateChannelDescription) error", err);
                this._logger.log("debug", LOG_ID + "(updateChannelDescription) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method
     * @since 1.46
     * @instance
     * @description
     *    Update a channel name<br/>
     *    Return a promise.
     * @param {Channel} channel The channel to update
     * @param {String} channelName The name of the channel
     * @return {Channel} Return the channel updated or an error
     */
    updateChannelName(channel, channelName) {
        this._logger.log("debug", LOG_ID + "(updateChannelName) _entering_");

        if (!channel) {
            this._logger.log("debug", LOG_ID + "(updateChannelName) bad or empty 'channel' parameter ", channel);
            this._logger.log("debug", LOG_ID + "(updateChannelName) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!channel.id) {
            this._logger.log("debug", LOG_ID + "(updateChannelName) bad or empty 'channel.id' parameter ", channel.id);
            this._logger.log("debug", LOG_ID + "(updateChannelName) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!channelName) {
            this._logger.log("debug", LOG_ID + "(updateChannelName) bad or empty 'channelName' parameter ", channelName);
            this._logger.log("debug", LOG_ID + "(updateChannelName) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            this._rest.updateChannel(channel.id, null, null,  null , null, channelName, null).then((channelUpdated : any) => {
                this._logger.log("info", LOG_ID + "(updateChannelName) channel updated", channel);

                let foundIndex = this._channels.findIndex(channelItem => channelItem.id === channelUpdated.id);
                let channelObj : Channel = Channel.ChannelFactory()(channelUpdated, this._rest.http.serverURL);
                this._channels[foundIndex] = channelObj;

                this._logger.log("debug", LOG_ID + "(updateChannelName) _exiting_");
                resolve(channelObj);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(updateChannelName) error", err);
                this._logger.log("debug", LOG_ID + "(updateChannelName) _exiting_");
                reject(err);
            });
        });
    };

    /**
     * @public
     * @method updateChannelVisibility
     * @since 1.55
     * @instance
     * @description
     *    Update a channel visibility<br/>
     *    Return a promise.
     * @param {String} channel The channel to update
     * @param {String} visibility  The new channel visibility (closed or company)
     * @return {Channel} Return the channel updated or an error
     */
    updateChannelVisibility(channel, visibility) {
        this._logger.log("debug", LOG_ID + "(updateChannelVisibility) _entering_");

        if (!channel) {
            this._logger.log("debug", LOG_ID + "(updateChannelVisibility) bad or empty 'channel' parameter ", channel);
            this._logger.log("debug", LOG_ID + "(updateChannelVisibility) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!channel.id) {
            this._logger.log("debug", LOG_ID + "(updateChannelVisibility) bad or empty 'channel.id' parameter ", channel.id);
            this._logger.log("debug", LOG_ID + "(updateChannelVisibility) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!visibility) {
            this._logger.log("debug", LOG_ID + "(updateChannelVisibility) bad or empty 'visibility' parameter ", visibility);
            this._logger.log("debug", LOG_ID + "(updateChannelVisibility) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let mode = visibility === "company" ? "company_public" : "company_closed";
        let name = channel.name;

        return new Promise((resolve, reject) => {

            this._rest.updateChannel(channel.id, null, null,  null , null, name, mode).then((channelUpdated : any) => {
                this._logger.log("info", LOG_ID + "(updateChannelVisibility) channel updated");

                let foundIndex = this._channels.findIndex(channelItem => channelItem.id === channelUpdated.id);
                let channelObj : Channel = Channel.ChannelFactory()(channelUpdated, this._rest.http.serverURL);
                this._channels[foundIndex] = channelObj;
                this._logger.log("internal", LOG_ID + "(updateChannelVisibility) channel updated", channelObj);

                this._logger.log("debug", LOG_ID + "(updateChannelVisibility) _exiting_");
                resolve(channelObj);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(updateChannelVisibility) error", err);
                this._logger.log("debug", LOG_ID + "(updateChannelVisibility) _exiting_");
                reject(err);
            });
        });
    };

    /**
     * @public
     * @method updateChannelVisibilityToPublic
     * @since 1.55
     * @instance
     * @description
     *    Set the channel visibility to company (visible for users in that company)<br/>
     *    Return a promise.
     * @param {String} channel The channel to update
     * @return {Channel} Return the channel updated or an error
     */
    public updateChannelVisibilityToPublic(channel) {
        return this.updateChannelVisibility(channel, "company");
    }

    /**
     * @public
     * @method updateChannelVisibilityToClosed
     * @since 1.55
     * @instance
     * @description
     *    Set the channel visibility to closed (not visible by users)<br/>
     *    Return a promise.
     * @param {String} channel The channel to update
     * @return {Channel} Return the channel updated or an error
     */
    public updateChannelVisibilityToClosed(channel) {
        //channel.name = channel.name + "_updateToClosed";
        return this.updateChannelVisibility(channel, "closed");
    }

    /**
     * @public
     * @method fetchChannelUsers
     * @instance
     * @async
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the fetchChannelUsers method instead,
     * @param {Channel} channel The channel
     * @param {Object} [options] A filter parameter
     * @param {Number} [options.page = 0] Display a specific page of results
     * @param {Number} [options.limit=100] Number of results per page (max 1000)
     * @param {Boolean} [options.onlyPublishers=false] Filter to publishers only
     * @param {Boolean} [options.onlyOwners=false] Filter to owners only
     * @return {Promise<Users[]>} An array of users who belong to this channel
     * @description
     *  Get a pagined list of users who belongs to a channel
     * @memberof Channels
     */
    getUsersFromChannel(channel, options) {
        return this.fetchChannelUsers(channel, options);
    }

    /**
     * @public
     * @method fetchChannelUsers
     * @instance
     * @async
     * @param {Channel} channel The channel
     * @param {Object} [options] A filter parameter
     * @param {Number} [options.page = 0] Display a specific page of results
     * @param {Number} [options.limit=100] Number of results per page (max 1000)
     * @param {Boolean} [options.onlyPublishers=false] Filter to publishers only
     * @param {Boolean} [options.onlyOwners=false] Filter to owners only
     * @return {Promise<Users[]>} An array of users who belong to this channel
     * @description
     *  Get a pagined list of users who belongs to a channel
     * @memberof Channels
     */
    public fetchChannelUsers(channel, options) : Promise<Array<{}>> {
        this._logger.log("debug", LOG_ID + "(fetchChannelUsers) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(fetchChannelUsers) bad or empty 'channel' parameter", channel);
            this._logger.log("debug", LOG_ID + "(fetchChannelUsers) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let json = {
            "limit": 100,
            "page": null,
            "type": null
        };

        if (options) {
            if ("page" in options) {
                json.page = Number(options.page);
            }
    
            if ("limit" in options) {
                json.limit = Number(options.limit);
            }
            
            if ("onlyPublishers" in options && options.onlyPublishers) {
                json.type = "publisher";
            }

            if ("onlyOwners" in options && options.onlyOwners) {
                json.type = "owner";
            }
        }

        return new Promise((resolve, reject) => {

            this._rest.getChannelUsers(channel.id, json).then((users : []) => {
                this._logger.log("info", LOG_ID + "(fetchChannelUsers) channel has users ", users.length);
                this._logger.log("debug", LOG_ID + "(fetchChannelUsers) _exiting_");
                resolve(users);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(fetchChannelUsers) error", err);
                this._logger.log("debug", LOG_ID + "(fetchChannelUsers) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method removeAllUsersFromChannel
     * @instance
     * @async
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the deleteAllUsersFromChannel method instead,
     * @param {String} channel The channel
     * @return {Promise<Channel>} The channel updated
     * @description
     *  Remove all users from a channel
     * @memberof Channels
     */
    removeAllUsersFromChannel(channel) {
        return this.deleteAllUsersFromChannel(channel);
    }
    /**
     * @public
     * @method deleteAllUsersFromChannel
     * @instance
     * @async
     * @param {String} channel The channel
     * @return {Promise<Channel>} The channel updated
     * @description
     *  Remove all users from a channel
     * @memberof Channels
     */
    public deleteAllUsersFromChannel(channel) : Promise<Channel> {
        this._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) bad or empty 'channel' parameter", channel);
            this._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            this._rest.deleteAllUsersFromChannel(channel.id).then((result) => {
                this._logger.log("info", LOG_ID + "(deleteAllUsersFromChannel) channel users deletion", result);

                this._rest.getChannel(channel.id).then((updatedChannel : any) => {
                    // Update local channel
                    let foundIndex = this._channels.findIndex(channelItem => channelItem.id === updatedChannel.id);
                    let channelObj : Channel = Channel.ChannelFactory()(updatedChannel, this._rest.http.serverURL);
                    this._channels[foundIndex] = channelObj;
                    this._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) _exiting_");
                    resolve(channelObj);
                });

            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(deleteAllUsersFromChannel) error", err);
                this._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) _exiting_");
                reject(err);
            });
        });
    }    

    /**
     * @public
     * @method updateChannelUsers
     * @instance
     * @async
     * @param {String} channelId The Id of the channel
     * @param {ChannelUser[]} users The users of the channel
     * @return {Promise<Channel>} Update Channel Users status
     * @description
     *  TODO
     * @memberof Channels
     */
    public updateChannelUsers(channelId, users) : Promise<Channel> {
        this._logger.log("debug", LOG_ID + "(updateChannelUsers) _entering_");

        return new Promise((resolve, reject) => {
            this._rest.updateChannelUsers(channelId, users).then((res) => {
                this._logger.log("info", LOG_ID + "(updateChannelUsers) channel users updated", res);

                this._rest.getChannel(channelId).then((updatedChannel : any) => {
                    // Update local channel
                    let foundIndex = this._channels.findIndex(channelItem => channelItem.id === updatedChannel.id);
                    let channelObj : Channel = Channel.ChannelFactory()(updatedChannel, this._rest.http.serverURL);
                    this._channels[foundIndex] = channelObj;
                    this._logger.log("debug", LOG_ID + "(updateChannelUsers) _exiting_");
                    resolve(channelObj);
                });
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(updateChannelUsers) error", err);
                this._logger.log("debug", LOG_ID + "(updateChannelUsers) _exiting_");
                reject(err);
            });
        });
    }


    /**
     * @public
     * @method addOwnersToChannel
     * @instance
     * @async
     * @param {Channel} channel The channel
     * @param owners
     * @return {Promise<Channel>} The updated channel
     * @description
     *  Add a list of owners to the channel
     * @memberof Channels
     */
    public addOwnersToChannel(channel : Channel, owners) : Promise<Channel>  {
        this._logger.log("debug", LOG_ID + "(addOwnersToChannel) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(addOwnersToChannel) bad or empty 'channel' parameter", channel);
            this._logger.log("debug", LOG_ID + "(addOwnersToChannel) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!owners) {
            this._logger.log("debug", LOG_ID + "(addOwnersToChannel) bad or empty 'owners' parameter", owners);
            this._logger.log("debug", LOG_ID + "(addOwnersToChannel) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let usersId = [];

        owners.forEach((user) => {
            usersId.push({"id": user.id, "type": "owner"});
        });

        let updated = this.updateChannelUsers(channel.id, usersId);
        this._logger.log("debug", LOG_ID + "(addOwnersToChannel) _exiting_");
        return updated;
    }

    /**
     * @public
     * @method addPublishersToChannel
     * @instance
     * @async
     * @param {Channel} channel The channel
     * @param {User[]} users An array of users to add
     * @return {Promise<Channel>} The updated channel
     * @description
     *  Add a list of publishers to the channel
     * @memberof Channels
     */
    public addPublishersToChannel(channel : Channel, publishers) : Promise<Channel> {
        this._logger.log("debug", LOG_ID + "(addPublishersToChannel) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(addPublishersToChannel) bad or empty 'channel' parameter", channel);
            this._logger.log("debug", LOG_ID + "(addPublishersToChannel) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!publishers) {
            this._logger.log("debug", LOG_ID + "(addPublishersToChannel) bad or empty 'publishers' parameter", publishers);
            this._logger.log("debug", LOG_ID + "(addPublishersToChannel) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let usersId = [];

        publishers.forEach((user) => {
            usersId.push({"id": user.id, "type": "publisher"});
        });

        let updated = this.updateChannelUsers(channel.id, usersId);
        this._logger.log("debug", LOG_ID + "(addPublishersToChannel) _exiting_");
        return updated;
    }
    
    /**
     * @public
     * @method addMembersToChannel
     * @instance
     * @async
     * @param {Channel} channel The channel
     * @param {User[]} users An array of users to add
     * @return {Promise<Channel>} The updated channel
     * @description
     *  Add a list of members to the channel
     * @memberof Channels
     */
    public addMembersToChannel(channel, members) : Promise<Channel> {
        this._logger.log("debug", LOG_ID + "(addMembersToChannel) _entering_");
        
        if (!channel) {
            this._logger.log("warn", LOG_ID + "(addMembersToChannel) bad or empty 'channel' parameter", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!members) {
            this._logger.log("warn", LOG_ID + "(addMembersToChannel) bad or empty 'members' parameter", members);
            this._logger.log("debug", LOG_ID + "(addMembersToChannel) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let usersId: Array<any> = [];

        members.forEach((user) => {
            if (user) {
                usersId.push({"id": user.id, "type": "member"});
            }
        });

        if (!(usersId.length > 0)) {
            this._logger.log("warn", LOG_ID + "(addMembersToChannel) bad or empty 'members' parameter", members);
            this._logger.log("debug", LOG_ID + "(addMembersToChannel) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let updated = this.updateChannelUsers(channel.id, usersId);
        this._logger.log("debug", LOG_ID + "(addMembersToChannel) _exiting_");
        return updated;
    }

    /**
     * @public
     * @method removeUsersFromChannel1
     * @instance
     * @async
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the deleteUsersFromChannel method instead,
     * @param {Channel} channel The channel
     * @param {User[]} users An array of users to remove
     * @return {Promise<Channel>} The updated channel
     * @description
     *  Remove a list of users from a channel
     * @memberof Channels
     */
    removeUsersFromChannel1(channel, users) {
        return this.deleteUsersFromChannel(channel, users);
    }
    /**
     * @public
     * @method deleteUsersFromChannel
     * @instance
     * @async
     * @param {Channel} channel The channel
     * @param {User[]} users An array of users to remove
     * @return {Promise<Channel>} The updated channel
     * @description
     *  Remove a list of users from a channel
     * @memberof Channels
     */
    public deleteUsersFromChannel(channel : Channel, users) : Promise<Channel> {
        this._logger.log("debug", LOG_ID + "(deleteUsersFromChannel) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(deleteUsersFromChannel) bad or empty 'channel' parameter", channel);
            this._logger.log("debug", LOG_ID + "(deleteUsersFromChannel) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!users) {
            this._logger.log("debug", LOG_ID + "(deleteUsersFromChannel) bad or empty 'publishers' parameter", users);
            this._logger.log("debug", LOG_ID + "(deleteUsersFromChannel) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let usersId = [];

        users.forEach((user) => {
            usersId.push({"id": user.id, "type": "none"});
        });

        let updated = this.updateChannelUsers(channel.id, usersId);
        this._logger.log("debug", LOG_ID + "(deleteUsersFromChannel) _exiting_");
        return updated;
    }

    /**
     * @public
     * @method getMessagesFromChannel
     * @instance
     * @async
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the fetchChannelItems method instead,
     * @param {Channel} channel The channel
     * @return {Promise<Object[]>} The list of messages received
     * @description
     *  Retrieve the last messages from a channel
     * @memberof Channels
     */
    getMessagesFromChannel (channel) {
        return this.fetchChannelItems(channel);
    }

    /**
     * @public
     * @method fetchChannelItems
     * @instance
     * @async
     * @param {Channel} channel The channel
     * @return {Promise<Object[]>} The list of messages received
     * @description
     *  Retrieve the last messages from a channel
     * @memberof Channels
     */
    public fetchChannelItems (channel : Channel) : Promise<Array<any>>{

        this._logger.log("debug", LOG_ID + "(fetchChannelItems) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(fetchChannelItems) bad or empty 'channel' parameter", channel);
            this._logger.log("debug", LOG_ID + "(fetchChannelItems) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        
        return new Promise( (resolve, reject) => {

            this._rest.getChannelMessages(channel.id).then((res : any) => {
                this._logger.log("info", LOG_ID + "(fetchChannelItems) messages retrieved", res);

                let messages = res.items;

                let listOfMessages = [];
                messages.forEach((item) => {
                    let message = {
                        id: item.item.$.id ? item.item.$.id : "",
                        title: item.item.entry.title ? item.item.entry.title : "",
                        message: item.item.entry.message ? item.item.entry.message : "",
                        url: item.item.entry.url ? item.item.entry.url : "",
                        images: []
                    };

                    if (Array.isArray(item.item.entry.images)) {
                        item.item.entry.images.forEach((image) => {
                            message.images.push(image.id);
                        });
                    } else {
                        // when there is only one image, the server give us a single object and not an Array.
                            if (item.item.entry.images) {
                                message.images.push(item.item.entry.images.id) ;
                            }
                    }
                    listOfMessages.push(message);
                });
                this._logger.log("debug", LOG_ID + "(fetchChannelItems) _exiting_");
                resolve(listOfMessages);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(fetchChannelItems) error", err);
                this._logger.log("debug", LOG_ID + "(fetchChannelItems) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method deleteMessageFromChannel
     * @instance
     * @async
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the deleteItemFromChannel method instead,
     * @param  {String} channelId The Id of the channel
     * @param  {String} messageId The Id of the message
     * @return {Promise<Channel>} The channel updated
     * @description
     *  Delete a message from a channel
     * @memberof Channels
     */
    deleteMessageFromChannel(channelId, messageId) {
        return this.deleteItemFromChannel(channelId, messageId);
    }

    /**
     * @public
     * @method deleteItemFromChannel
     * @instance
     * @async
     * @param  {String} channelId The Id of the channel
     * @param  {String} itemId The Id of the item
     * @return {Promise<Channel>} The channel updated
     * @description
     *  Delete a message from a channel
     * @memberof Channels
     */
    public deleteItemFromChannel (channelId, itemId) : Promise<Channel> {

        this._logger.log("debug", LOG_ID + "(deleteItemFromChannel) _entering_");

        if (!channelId) {
            this._logger.log("debug", LOG_ID + "(deleteItemFromChannel) bad or empty 'channelId' parameter", channelId);
            this._logger.log("debug", LOG_ID + "(deleteItemFromChannel) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!itemId) {
            this._logger.log("debug", LOG_ID + "(deleteItemFromChannel) bad or empty 'itemId' parameter", itemId);
            this._logger.log("debug", LOG_ID + "(deleteItemFromChannel) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise( (resolve, reject) => {

            this._rest.deleteChannelMessage(channelId, itemId).then((result) => {
                this._logger.log("info", LOG_ID + "(deleteItemFromChannel) channel message deletion", result);

                this._rest.getChannel(channelId).then((updatedChannel : any) => {
                    // Update local channel
                    let foundIndex = this._channels.findIndex(channelItem => channelItem.id === updatedChannel.id);
                    let channelObj : Channel = Channel.ChannelFactory()(updatedChannel, this._rest.http.serverURL);
                    this._channels[foundIndex] = channelObj;
                    this._logger.log("debug", LOG_ID + "(deleteItemFromChannel) _exiting_");
                    resolve(channelObj);
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(deleteItemFromChannel) error", err);
                this._logger.log("debug", LOG_ID + "(deleteItemFromChannel) _exiting_");
                reject(err);
            });
        });

    }

    _onChannelMessageReceived(message) {

        this.fetchChannel(message.channelId).then((channel) => {
            message.channel = channel;
            delete message.channelId;
            this._eventEmitter.emit("rainbow_channelmessagereceived", message);
        });
    }

    /**
     * @private
     * @param channelId
     * @description
     *      GET A CHANNEL
     */
    public getChannel(channelId: string): Promise<Channel> {
        return new Promise((resolve, reject) => {
            this._rest.getChannel(channelId).then((channel) => {
                this._logger.log("info", LOG_ID + "(getChannel) channel found on the server");
                this._logger.log("internal", LOG_ID + "(getChannel) channel found on the server", channel);
                let channelObj : Channel = Channel.ChannelFactory()(channel, this._rest.http.serverURL);
                resolve(channelObj);
            }).catch((err) => {
                reject(err);
            });
        });
    };

    /**
     * @private
     * @param channelId
     * @description
     *      GET A CHANNEL FROM CACHE
     */
    private getChannelFromCache(channelId: string): Channel {
        let channel = this._channels[channelId];
        return channel !== undefined ? channel : null;
    }

    private updateChannelsList(): void {
        this._channelsList = Object.keys(this._channels).map((key) => { return this._channels[key]; });
    }

    private addChannelToCache(channel: any): Channel {
        let channelObj : Channel = Channel.ChannelFactory()(channel, this._rest.http.serverURL);
        this._channels[channel.id] = channelObj;
        this.updateChannelsList();
        return channelObj;
    }

    private removeChannelFromCache(channelId: string): Promise<string> {
        let that = this;
        return new Promise((resolve, reject) => {
            // Get the channel to remove
            let channelToRemove = this.getChannelFromCache(channelId);
            if (channelToRemove) {
                // Store channel name
                //let channelName = channelToRemove.name;

                // Handle invitation channel
                if (channelToRemove.invited) { this.decrementInvitationCounter(); }

                // Remove from channels
                delete this._channels[channelId];
                this.updateChannelsList();

                // Update messagesList
                //this.feedChannel.messages = [];
                this.retrieveLatests()
                    .then(() => { resolve(channelId); })
                    .catch((err) => { reject(err); });
            } else {
                resolve();
            }
        });
    }

    public retrieveLatests(beforeDate: Date = null): Promise<any> {
        return this._rest.getLatestMessages(10, beforeDate, null).then((messages: any) => {
            // TODO : this.feedChannel.messages.push.apply(this.feedChannel.messages, messages);
            return messages.length;
        });
    }

    public incrementInvitationCounter() { this.invitationCounter += 1; }
    public decrementInvitationCounter() { this.invitationCounter -= 1; }


    /****************************************************************/
    /*** MANAGEMENT EVENT HANDLER                                 ***/
    /****************************************************************/
    private onAvatarChange(channelId: string, avatar: any): void {
        /*
        let action = avatar.attr("action");
        let updateDate: Date = avatar.attr("lastAvatarUpdateDate") ? new Date(avatar.attr("lastAvatarUpdateDate")) : null;
        this.$log.info("[channelService] onChannelManagementReceived -- " + action + " avatar for " + channelId);
        if (action === "delete" || action === "update") {
            let channel: Channel = this.getChannelFromCache(channelId);
            channel.lastAvatarUpdateDate = updateDate;
            if (updateDate !== null) {
                channel.avatar = config.restServerUrl + "/api/channel-avatar/" + channelId + "?size=256&ts=" + new Date(updateDate).getTime();
            }
        }

         */
    }

    private onUpdateToChannel(channelInfo: {id:string}): void {
        let that = this;
        let channelId = channelInfo.id;

        this._logger.log("debug", LOG_ID + "(onUpdateToChannel) channelId : ", channelId);
        // Get channel from cache
        //let channel = this.getChannelFromCache(channelId);

        // Get channel from server
        this.getChannel(channelId)
            .then((newChannel) => {
                /*if (newChannel.invited) {
                    let channelObj : Channel = this.addChannelToCache(newChannel);
                    that._eventEmitter.emit("rainbow_channelcreated", {'id': newChannel.id});
                    //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.ADD, newChannel.id);
                } else { // */
                    that._eventEmitter.emit("rainbow_channelupdated", {'id': newChannel.id});
                //}
            });
    }

    private onAddToChannel(channelInfo: {id:string}): void {
        let that = this;
        let channelId = channelInfo.id;
        this._logger.log("debug", LOG_ID + "(onAddToChannel) channelId DDD : ", channelId);
        // Get channel from cache
        let channel = this.getChannelFromCache(channelId);

        // Get channel from server
        this.getChannel(channelId)
            .then((newChannel) => {

                // Handle channel creation
                if (!channel && !newChannel.invited) {
                    let channelObj : Channel = this.addChannelToCache(newChannel);
                    //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.ADD, newChannel.id);
                    that._eventEmitter.emit("rainbow_channelcreated", {'id': newChannel.id});
                }

                // Handle channel invitation
                else if (!channel && newChannel.invited) {
                    let channelObj : Channel = this.addChannelToCache(newChannel);
                    this.incrementInvitationCounter();
                    that._eventEmitter.emit("rainbow_channelsubscribe", {'id': newChannel.id});
                    //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.SUBSCRIBE, newChannel.id);
                }

                // Handle change role
                else if (channel && newChannel.userRole !== this.USER_ROLE.NONE) {
                    channel.userRole = newChannel.userRole;
                    // TODO : this.feedChannel.messages = [];
                    this.retrieveLatests()
                        .then(() => {
                            that._eventEmitter.emit("rainbow_channelsubscribe", {'id': channelId});
                            //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.SUBSCRIBE, channelId);
                        });
                }

            });
    }

    private async onRemovedFromChannel(channelInfo : {id : string}): Promise<any> {
        let that = this;
        let channelId = channelInfo.id;
        this._logger.log("debug", LOG_ID + "(onRemovedFromChannel) channelId : ", channelId);
        let channelIdDeleted = await that.removeChannelFromCache(channelId);
        that._eventEmitter.emit("rainbow_channelremovedfrom", {'id': channelIdDeleted});
        //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.DELETE, channelId);
    }

    private onSubscribeToChannel(channelInfo: {'id': string, 'subscribers' : string}): void {
        let that = this;
        let channelId: string = channelInfo.id;
        let subscribersInfo: string = channelInfo.subscribers;
        this._logger.log("debug", LOG_ID + "(onSubscribeToChannel) channelId : ", channelId, ", subscribersInfo : ", subscribersInfo);
        // Handle invitation case
        let channel = this.getChannelFromCache(channelId);
        let subscribers = Number.parseInt(subscribersInfo);
        if (channel) {
            channel.invited = false;
            channel.subscribed = true;
            channel.subscribers_count = subscribers;
            //this.feedChannel.messages = [];
            this.retrieveLatests()
                .then(() => {
                    that._eventEmitter.emit("rainbow_channelsubscribe", {'id': channelId});
                    //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.SUBSCRIBE, channelId);
                });
        }

        // Handle self subscription case
        else {
            this.getChannel(channelId)
                .then((newChannel) => {
                let channelObj : Channel = this.addChannelToCache(newChannel);
                    //this.feedChannel.messages = [];
                    return this.retrieveLatests();
                })
                .then(() => {
                    that._eventEmitter.emit("rainbow_channelsubscribe", {'id': channelId});
                    //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.SUBSCRIBE, channelId);
                });
        }
    }

    private onUnsubscribeToChannel(channelInfo: {'id': string, 'subscribers' : string}): void {
        let that = this;
        let channelId: string = channelInfo.id;
        let subscribersInfo: string = channelInfo.subscribers;
        this._logger.log("debug", LOG_ID + "(onUnsubscribeToChannel) channelId : ", channelId, ", subscribersInfo : ", subscribersInfo);
        let subscribers = Number.parseInt(subscribersInfo);
        let channel = this.getChannelFromCache(channelId);
        channel.subscribers_count = subscribers;
        channel.subscribed = false;

        // Update messagesList
        //this.feedChannel.messages = [];
        this.retrieveLatests().then(() => {
            that._eventEmitter.emit("rainbow_channelunsubscribe", {'id': channelId});
            //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.UNSUBSCRIBE, channelId);
        });
    }

    private async onDeleteChannel(channelInfo : {id : string}): Promise<any> {
        let that = this;
        let channelId: string = channelInfo.id;
        this._logger.log("debug", LOG_ID + "(onDeleteChannel) channelId : ", channelId);
        let channelIdDeleted = await this.removeChannelFromCache(channelId) ;
        that._eventEmitter.emit("rainbow_channeldeleted", {'id': channelId});
                //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.DELETE, channelId);
    }

    private onUserSubscribeEvent(info : {id: string, userId: string, 'subscribers': number}) {
        let that = this;
        this._logger.log("debug", LOG_ID + "(onUserSubscribeEvent) channelId : ", info.id, ", subscribersInfo : ", info.subscribers);
        let channel: Channel = this.getChannelFromCache(info.id);
        channel.subscribers_count = info.subscribers;

        that._eventEmitter.emit("rainbow_channelusersubscription", {'id': info.id, 'userId': info.userId});
        //this.$rootScope.$broadcast(this.CHANNEL_USER_SUBSCRIPTION_EVENT, this.LIST_EVENT_TYPE.SUBSCRIBE, channelId, userId);
    }

    private onUserUnsubscribeEvent(info : {id: string, userId: string, 'subscribers': number}) {
        let that = this;
        this._logger.log("debug", LOG_ID + "(onUserUnsubscribeEvent) channelId : ", info.id, ", subscribersInfo : ", info.subscribers);
        let channel: Channel = this.getChannelFromCache(info.id);
        channel.subscribers_count = info.subscribers;

        that._eventEmitter.emit("rainbow_channeluserunsubscription", {'id': info.id, 'userId': info.userId});
        //this.$rootScope.$broadcast(this.CHANNEL_USER_SUBSCRIPTION_EVENT, this.LIST_EVENT_TYPE.UNSUBSCRIBE, channelId, userId);
    }

    /****************************************************************/
    /*** END MANAGEMENT EVENT HANDLER                             ***/
    /****************************************************************/

}

module.exports = Channels;
