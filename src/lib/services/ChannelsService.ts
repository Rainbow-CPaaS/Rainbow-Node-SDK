"use strict";

import EventEmitter = NodeJS.EventEmitter;

export {};

import {ErrorManager} from "../common/ErrorManager";
import {Channel} from "../common/models/Channel";
import {ChannelEventHandler} from "../connection/XMPPServiceHandler/channelEventHandler";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import * as PubSub from "pubsub-js";
import * as fs from "fs";
import * as mimetypes from "mime-types";
import {isStarted, logEntryExit} from "../common/Utils";
import {Logger} from "../common/Logger";
import {S2SService} from "./S2SService";
import {Core} from "../Core";

const LOG_ID = "CHANNELS/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name Channels
 * @version SDKVERSION
 * @public
 * @description
 *      This service manages Channels. This service is in Beta.
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Create a new channel <br>
 *      - Manage a channel: update, delete <br>
 *      - Manage users in a channel <br>
 */
class Channels {
    private _xmpp: XMPPService;
    private _rest: RESTService;
    private _options: any;
    private _s2s: S2SService;
    private _useXMPP: any;
    private _useS2S: any;
    private _channels: any;
    private _channelsList: any;
    private _eventEmitter: EventEmitter;
    private _logger: Logger;
	public MAX_ITEMS: any;
	public MAX_PAYLOAD_SIZE: any;
	public PUBLIC_VISIBILITY: any;
    public PRIVATE_VISIBILITY: any;
    public CLOSED_VISIBILITY: any;
    private channelEventHandler: ChannelEventHandler;
    private channelHandlerToken: any;
    public invitationCounter: number = 0;
    public ready: boolean = false;
    private readonly _startConfig: {
        start_up:boolean,
        optional:boolean
    };
    get startConfig(): { start_up: boolean; optional: boolean } {
        return this._startConfig;
    }

    public LIST_EVENT_TYPE = {
        ADD: {code : 0, label : "ADD"},
        UPDATE: {code : 1, label : "UPDATE"},
        REMOVE: {code : 2, label : "REMOVE"},
        DELETE: {code : 3, label : "DELETE"},
        SUBSCRIBE: {code : 4, label : "SUBSCRIBE"},
        UNSUBSCRIBE: {code : 5, label : "UNSUBSCRIBE"},
        CREATE: {code : 6, label : "CREATE"}
    };

    public USER_ROLE = {
        NONE: "none",
        OWNER: "owner",
        PUBLISHER: "publisher",
        MEMBER: "member"
    };


    constructor(_eventEmitter : EventEmitter, _logger : Logger, _startConfig) {
        this._startConfig = _startConfig;
        this._xmpp = null;
        this._rest = null;
        this._s2s = null;
        this._options = {};
        this._useXMPP = false;
        this._useS2S = false;
        this._channels = null;
        this._channelsList = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
        this.MAX_ITEMS = 100;
        this.MAX_PAYLOAD_SIZE = 60000;
        this.PUBLIC_VISIBILITY = "company";
        this.PRIVATE_VISIBILITY = "private";
        this.CLOSED_VISIBILITY = "closed";
        this.ready = false;

        this._eventEmitter.on("evt_internal_channelitemreceived", this._onChannelMessageReceived.bind(this));
        this._eventEmitter.on("evt_internal_addtochannel", this.onAddToChannel.bind(this));
        this._eventEmitter.on("evt_internal_updatetochannel", this.onUpdateToChannel.bind(this));
        this._eventEmitter.on("evt_internal_removefromchannel", this.onRemovedFromChannel.bind(this));
        this._eventEmitter.on("evt_internal_subscribetochannel", this.onSubscribeToChannel.bind(this));
        this._eventEmitter.on("evt_internal_unsubscribetochannel", this.onUnsubscribeToChannel.bind(this));
        this._eventEmitter.on("evt_internal_deletechannel", this.onDeleteChannel.bind(this));
        this._eventEmitter.on("evt_internal_usersubscribechannel", this.onUserSubscribeEvent.bind(this));
        this._eventEmitter.on("evt_internal_userunsubscribechannel", this.onUserUnsubscribeEvent.bind(this));

    }

    start(_options,_core : Core) { // , _xmpp : XMPPService, _s2s : S2SService, _rest : RESTService
        let that = this;
        return new Promise((resolve, reject) => {
            try {
                that._xmpp = _core._xmpp;
                that._rest = _core._rest;
                that._options = _options;
                that._s2s = _core._s2s;
                that._useXMPP = that._options.useXMPP;
                that._useS2S = that._options.useS2S;
                that._channels = [];
                that._channelsList = [];
                that.attachHandlers();
                this.ready = true;
                resolve();
            }
            catch (err) {
                this._logger.log("error", LOG_ID + "(start) error ");
                this._logger.log("internalerror", LOG_ID + "(start) error : ", err);
                return reject(err);
            }
        });
    }

    stop() {
        let that = this;
        return new Promise((resolve, reject) => {
            try {
                this._xmpp = null;
                this._rest = null;
                this._channels = null;
                this._channelsList = null;
//                this._eventEmitter.removeListener("rainbow_onchannelmessagereceived", this._onChannelMessageReceived);
                if (that.channelHandlerToken) {
                    that.channelHandlerToken.forEach((token) => PubSub.unsubscribe(token));
                }
                that.channelHandlerToken = [];
                this.ready = false;
                resolve();
            } catch (err) {
                this._logger.log("error", LOG_ID + "(stop) error ");
                this._logger.log("internalerror", LOG_ID + "(stop) error : ", err);
                return reject(err);
            }
        });
    }

    attachHandlers() {
        let that = this;
        that.channelEventHandler = new ChannelEventHandler(that._xmpp, that);
        that.channelHandlerToken = [
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_CHAT, that.conversationEventHandler.onChatMessageReceived),
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_GROUPCHAT, that.conversationEventHandler.onChatMessageReceived),
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_WEBRTC, that.conversationEventHandler.onWebRTCMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that.channelEventHandler.MESSAGE_MANAGEMENT, that.channelEventHandler.onManagementMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that.channelEventHandler.MESSAGE_ERROR, that.channelEventHandler.onErrorMessageReceived),
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
     * @description
     *  Create a new public channel with a visibility limited to my company
     */
    createPublicChannel(name, channelTopic, category) : Promise<Channel>{
        return new Promise((resolve, reject) => {

            if (!name) {
                this._logger.log("warn", LOG_ID + "(createPublicChannel) bad or empty 'name' parameter");
                this._logger.log("internalerror", LOG_ID + "(createPublicChannel) bad or empty 'name' parameter : ", name);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            this._rest.createPublicChannel(name, channelTopic, category, this.PUBLIC_VISIBILITY, this.MAX_ITEMS, this.MAX_PAYLOAD_SIZE).then((channel) => {
                this._logger.log("debug", LOG_ID + "(createPublicChannel) creation successfull");
                //let channelObj : Channel = this.addOrUpdateChannelToCache(channel);
                let channelObj : Channel = Channel.ChannelFactory()(channel, this._rest.http.serverURL);
                resolve(channelObj);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(createPublicChannel) error ");
                this._logger.log("internalerror", LOG_ID + "(createPublicChannel) error : ", err);
                return reject(err);
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
     * @description
     *  Create a new closed channel
     */
    createClosedChannel(name, description, category) : Promise<Channel> {

        return new Promise((resolve, reject) => {

            if (!name) {
                this._logger.log("warn", LOG_ID + "(createClosedChannel) bad or empty 'name' parameter");
                this._logger.log("internalerror", LOG_ID + "(createClosedChannel) bad or empty 'name' parameter : ", name);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            this._rest.createPublicChannel(name, description, category, this.PRIVATE_VISIBILITY, this.MAX_ITEMS, this.MAX_PAYLOAD_SIZE).then((channel) => {
                this._logger.log("debug", LOG_ID + "(createClosedChannel) creation successfull");
                //let channelObj : Channel = this.addOrUpdateChannelToCache(channel);
                let channelObj : Channel = Channel.ChannelFactory()(channel, this._rest.http.serverURL);
                resolve(channelObj);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(createClosedChannel) error ");
                this._logger.log("internalerror", LOG_ID + "(createClosedChannel) error : ", err);
                return reject(err);
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
     * @description
     *  Delete a owned channel
     */
    deleteChannel(channel) : Promise<Channel> {

        return new Promise((resolve, reject) => {
            if (!channel || !channel.id) {
                this._logger.log("warn", LOG_ID + "(deleteChannel) bad or empty 'channel' parameter");
                this._logger.log("internalerror", LOG_ID + "(deleteChannel) bad or empty 'channel' parameter : ", channel);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            this._rest.deleteChannel(channel.id).then(async (status) => {
                this._logger.log("debug", LOG_ID + "(deleteChannel) channel deleted status : ", status);
                /*let channelRemoved = this._channels.splice(this._channels.findIndex((el) => {
                    return el.id === channel.id;
                }), 1); // */

                let channelRemoved = await this.removeChannelFromCache(channel.id);
                this._logger.log("internal", LOG_ID + "(deleteChannel) channel deleted : ", channelRemoved);
                if (channelRemoved) {
                    resolve(channelRemoved);
                } else {
                    this._logger.log("warn", LOG_ID + "(deleteChannel) the channel deleted was unknown from SDK cache ");
                    this._logger.log("internalerror", LOG_ID + "(deleteChannel) the channel deleted was unknown from SDK cache : ", channel);
                    resolve(channel);
                }
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(deleteChannel) error ");
                this._logger.log("internalerror", LOG_ID + "(deleteChannel) error : ", err);
                return reject(err);
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
     */
    findChannelsByName(name : string) : Promise<[Channel]> {

        if (!name) {
            this._logger.log("warn", LOG_ID + "(findChannelsByName) bad or empty 'name' parameter ");
            this._logger.log("internalerror", LOG_ID + "(findChannelsByName) bad or empty 'name' parameter : ", name);
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
     */
    findChannelsByTopic(topic : string) : Promise<[Channel]> {

        if (!topic) {
            this._logger.log("warn", LOG_ID + "(findChannelsByTopic) bad or empty 'topic' parameter ");
            this._logger.log("internalerror", LOG_ID + "(findChannelsByTopic) bad or empty 'topic' parameter : ", topic);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return this._findChannels(null, topic);
    }

    /**
     * @private
     * @method findChannels
     */
    private _findChannels(name : string, topic : string) : Promise<[Channel]> {
        //hack
        let getChannel = (id) : Promise<Channel> => {
            return new Promise((resolve) => {
                this.fetchChannel(id).then((channel : Channel) => {
                    resolve(channel);
                }).catch((err) => {
                    this._logger.log("error", LOG_ID + "(_findChannels) error getChannel ");
                    this._logger.log("internalerror", LOG_ID + "(_findChannels) error getChannel : ", err);
                    resolve(null);
                });
            });
        };

        return new Promise((resolve, reject) => {

            this._rest.findChannels(name, topic, null, null, null, null, null).then((channels : []) => {
                this._logger.log("info", LOG_ID + "(_findChannels) findChannels channels found ");
                this._logger.log("internal", LOG_ID + "(_findChannels) findChannels channels found : ", channels);

                let promises = [];

                channels.forEach((channel : any) => {
                    promises.push(getChannel(channel.id));
                });

                Promise.all(promises).then((listOfChannels : [Channel]) => {
                    resolve(listOfChannels);
                });

            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(_findChannels) error ");
                this._logger.log("internalerror", LOG_ID + "(_findChannels) error : ", err);
                return reject(err);
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
     */
    async fetchChannel(id, force?) : Promise<Channel>{
        return new Promise(async (resolve, reject) => {
            if (!id) {
                this._logger.log("warn", LOG_ID + "(fetchChannel) bad or empty 'jid' parameter");
                this._logger.log("internalerror", LOG_ID + "(fetchChannel) bad or empty 'jid' parameter : ", id);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            else {
                let channelFound = this.getChannelFromCache(id);

                if (channelFound && !force) {
                    this._logger.log("info", LOG_ID + "(fetchChannel) channel found locally");
                    this._logger.log("internal", LOG_ID + "(fetchChannel) channel found locally : ", channelFound);
                    resolve(channelFound);
                }
                else {
                    this._logger.log("debug", LOG_ID + "(fetchChannel) channel not found locally. Ask the server...");
                    let channel = await this.getChannel(id);
                    let channelObj : Channel = this.addOrUpdateChannelToCache(channel);
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
     * @return {Promise<Channel[]>} Result of the find with
     *      {Array}   found channels informations with an array of { id, name, topic, creatorId, visibility, users_count }
     */
    fetchChannelsByFilter (filter) : Promise<[Channel]> {
        let getChannel = (id) : Promise<Channel> => {
            return new Promise((resolve) => {
                this.fetchChannel(id).then((channel : Channel) => {
                    resolve(channel);
                }).catch((err) => {
                    this._logger.log("error", LOG_ID + "(fetchChannelsByFilter) error getChannel ");
                    this._logger.log("internalerror", LOG_ID + "(fetchChannelsByFilter) error getChannel : ", err);
                    resolve(null);
                });
            });
        };

        if (!filter) {
            this._logger.log("debug", LOG_ID + "(fetchChannelsByFilter) bad or empty 'channel' parameter ");
            this._logger.log("internal", LOG_ID + "(fetchChannelsByFilter) bad or empty 'channel' parameter : ", filter);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            this._rest.findChannels(filter.name, filter.topic, filter.category, filter.limit, filter.offset, filter.sortField, (filter.sortOrder && (filter.sortOrder === 1) ? "1" : "-1")).then((channels : []) => {
                this._logger.log("info", LOG_ID + "(fetchChannelsByFilter) channels found");
                this._logger.log("internal", LOG_ID + "(fetchChannelsByFilter) channels found : ", channels);

                let promises = [];

                channels.forEach((channel : Channel) => {
                    promises.push(getChannel(channel.id));
                });

                Promise.all(promises).then((listOfChannels : [Channel]) => {
                    resolve(listOfChannels);
                });

            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(fetchChannelsByFilter) error ");
                this._logger.log("internalerror", LOG_ID + "(fetchChannelsByFilter) error : ", err);
                return reject(err);
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
     * @return {Promise<Channel[]>} Return Promise with a list of channels or an empty array if no channel has been found
     */
    fetchMyChannels() : Promise<[Channel]>{
        let getChannel = (id) : Promise<Channel> => {
            return new Promise((resolve) => {
                this.fetchChannel(id).then((channel) => {
                    resolve(channel);
                }).catch((err) => {
                    this._logger.log("error", LOG_ID + "(fetchMyChannels) error fetchChannel ");
                    this._logger.log("internalerror", LOG_ID + "(fetchMyChannels) error fetchChannel : ", err);
                    resolve(null);
                });
            });
        };

        return new Promise((resolve) => {
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
                    this._logger.log("internal", LOG_ID + "(fetchMyChannels) hack done : ", channels);
                    this._channels = [];
                    if (channels) {
                        channels.forEach((channel) => {
                            this.addOrUpdateChannelToCache(channel);
                        })
                    }
                    //this._logger.log("internal", LOG_ID + "(fetchMyChannels) get successfully and updated the channels cache : ", this._channels);
                    resolve(this._channels);
                });
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(fetchMyChannels) error ");
                this._logger.log("internalerror", LOG_ID + "(fetchMyChannels) error : ", err);
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
     * @return {Channel[]} An array of channels (owned, invited, subscribed)
     * @description
     *  Return the list of channels (owned, invited, subscribed)
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
     */
    createItem(channel, message, title, url, imagesIds, type) : Promise <{}> {
        if (!channel || !channel.id) {
            this._logger.log("warn", LOG_ID + "(createItem) bad or empty 'channel' parameter ");
            this._logger.log("internalerror", LOG_ID + "(createItem) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!message) {
            this._logger.log("warn", LOG_ID + "(createItem) bad or empty 'title' parameter ");
            this._logger.log("internalerror", LOG_ID + "(createItem) bad or empty 'title' parameter : ", title);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (imagesIds && typeof imagesIds !== "object" && imagesIds.length < 1) {
            this._logger.log("warn", LOG_ID + "(createItem) bad or empty 'imagesIds' parameter ");
            this._logger.log("internalerror", LOG_ID + "(createItem) bad or empty 'imagesIds' parameter : ", imagesIds);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (type && ["basic", "markdown", "html", "data"].indexOf(type) === -1) {
            this._logger.log("warn", LOG_ID + "(createItem) bad or empty 'type' parameter ", type, " \"Parameter 'type' could be 'basic', 'markdown', 'html' or 'data'\"");
            return Promise.reject(ErrorManager);
        }


        return new Promise((resolve, reject) => {
            type = type ? "urn:xmpp:channels:" + type : "urn:xmpp:channels:basic";

            this._rest.publishMessage(channel.id, message, title, url, imagesIds, type).then((status) => {
                this._logger.log("info", LOG_ID + "(createItem) message published");
                this._logger.log("internal", LOG_ID + "(createItem) message published : ", status);
                resolve(ErrorManager.getErrorManager().OK);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(createItem) error ");
                this._logger.log("internalerror", LOG_ID + "(createItem) error : ", err);
                return reject(err);
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
     */
    subscribeToChannel(channel : Channel) : Promise<Channel> {
        if (!channel || !channel.id) {
            this._logger.log("warn", LOG_ID + "(subscribeToChannel) bad or empty 'channel' parameter ");
            this._logger.log("internalerror", LOG_ID + "(subscribeToChannel) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            this._rest.subscribeToChannel(channel.id).then((status) => {
                this._logger.log("info", LOG_ID + "(subscribeToChannel) channel subscribed : ", status);

                this.fetchChannel(channel.id, true).then((channelUpdated) => {
                    resolve(channelUpdated);
                });
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(subscribeToChannel) error ");
                this._logger.log("internalerror", LOG_ID + "(subscribeToChannel) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method
     * @since 1.47
     * @instance
     * @description
     *    Subscribe to a channel using its id<br/>
     *    Return a promise.
     * @param {String} id The id of the channel
     * @return {Object} Nothing or an error object depending on the result
     */
    subscribeToChannelById (id) {
        let that = this;
        if (!id) {
            this._logger.log("warn", LOG_ID + "(subscribeToChannel) bad or empty 'id' parameter ");
            this._logger.log("internalerror", LOG_ID + "(subscribeToChannel) bad or empty 'id' parameter : ", id);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise( (resolve, reject) => {
            let channel = that.getChannelFromCache(id);
            if (!channel) {
                that.getChannel(id).then(function (channelFound) {
                    if (channelFound) {
                        that.subscribeToChannel(channelFound)
                            .then(function () {
                                that._logger.log("debug", LOG_ID + "(subscribeToChannel) subscribed : ", id);
                                resolve({
                                    code: "OK",
                                    label: "OK"
                                });
                            })
                            .catch(function (err) {
                                return reject(err);
                            });
                    } else {
                        return reject({
                            code: "ERRORBADREQUEST",
                            label: "No channel found with id " + id
                        });
                    }
                });
            } else {
                that.subscribeToChannel(channel)
                    .then(function () {
                        that._logger.log("debug", LOG_ID + "(subscribeToChannel) subscribed : ", id);
                        resolve({
                            code: "OK",
                            label: "OK"
                        });
                    })
                    .catch(function (err) {
                        return reject(err);
                    });
            }
        });

    };

    /**
     * @public
     * @method unsubscribeFromChannel
     * @instance
     * @async
     * @param {Channel} channel The channel to unsubscribe
     * @return {Promise<String>} The status of the unsubscribe.
     * @description
     *  Unsubscribe from a public channel
     */
    unsubscribeFromChannel(channel : Channel) : Promise<String> {
        if (!channel || !channel.id) {
            this._logger.log("warn", LOG_ID + "(unsubscribeFromChannel) bad or empty 'channel' parameter ");
            this._logger.log("internalerror", LOG_ID + "(unsubscribeFromChannel) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            this._rest.unsubscribeToChannel(channel.id).then((status : String) => {
                this._logger.log("info", LOG_ID + "(unsubscribeFromChannel) channel unsubscribed : ", status);
                resolve(status);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(unsubscribeFromChannel) error ");
                this._logger.log("internalerror", LOG_ID + "(unsubscribeFromChannel) error : ", err);
                return reject(err);
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
     */
    updateChannelDescription(channel, description) : Promise <Channel> {
        if (!channel || !channel.id) {
            this._logger.log("warn", LOG_ID + "(updateChannelDescription) bad or empty 'channel' parameter ");
            this._logger.log("internalerror", LOG_ID + "(updateChannelDescription) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!channel.id) {
            this._logger.log("warn", LOG_ID + "(updateChannelDescription) bad or empty 'channel.id' parameter ");
            this._logger.log("internalerror", LOG_ID + "(updateChannelDescription) bad or empty 'channel.id' parameter : ", channel.id);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!description) {
            this._logger.log("warn", LOG_ID + "(updateChannelDescription) bad or empty 'description' parameter ");
            this._logger.log("internalerror", LOG_ID + "(updateChannelDescription) bad or empty 'description' parameter : ", description);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {
            this._rest.updateChannel(channel.id, description, null,  null , null, null, null).then((channelUpdated : any) => {
                this._logger.log("info", LOG_ID + "(updateChannelDescription) channel updated");
                this._logger.log("internal", LOG_ID + "(updateChannelDescription) channel updated : ", channelUpdated);

                let channelObj = this.addOrUpdateChannelToCache(channelUpdated);
                /*let foundIndex = this._channels.findIndex(channelItem => channelItem.id === channelUpdated.id);
                let channelObj : Channel = Channel.ChannelFactory()(channelUpdated, this._rest.http.serverURL);
                this._channels[foundIndex] = channelObj; // */

                resolve(channelObj);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(updateChannelDescription) error ");
                this._logger.log("internalerror", LOG_ID + "(updateChannelDescription) error : ", err);
                return reject(err);
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
        if (!channel || !channel.id) {
            this._logger.log("warn", LOG_ID + "(updateChannelName) bad or empty 'channel' parameter ");
            this._logger.log("internalerror", LOG_ID + "(updateChannelName) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!channel.id) {
            this._logger.log("warn", LOG_ID + "(updateChannelName) bad or empty 'channel.id' parameter ");
            this._logger.log("internalerror", LOG_ID + "(updateChannelName) bad or empty 'channel.id' parameter : ", channel.id);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!channelName) {
            this._logger.log("warn", LOG_ID + "(updateChannelName) bad or empty 'channelName' parameter ");
            this._logger.log("internalerror", LOG_ID + "(updateChannelName) bad or empty 'channelName' parameter : ", channelName);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            this._rest.updateChannel(channel.id, null, null,  null , null, channelName, null).then((channelUpdated : any) => {
                this._logger.log("info", LOG_ID + "(updateChannelName) channel updated ");
                this._logger.log("internalerror", LOG_ID + "(updateChannelName) channel updated : ", channelUpdated);

                let channelObj = this.addOrUpdateChannelToCache(channelUpdated);

                /*let foundIndex = this._channels.findIndex(channelItem => channelItem.id === channelUpdated.id);
                let channelObj : Channel = Channel.ChannelFactory()(channelUpdated, this._rest.http.serverURL);
                this._channels[foundIndex] = channelObj; */

                resolve(channelObj);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(updateChannelName) error ");
                this._logger.log("internalerror", LOG_ID + "(updateChannelName) error : ", err);
                return reject(err);
            });
        });
    };

    /**
     * @public
     * @method
     * @since 1.38
     * @instance
     * @description
     *    Update a channel<br/>
     *      May be updated: name, topic, visibility, max_items and max_payload<br/>
     *      Please put null to not update a property.<br/>
     *    Return a promise.
     * @param {String} id The id of the channel
     * @param {String} [channelTopic=""] The topic of the channel
     * @param {String} [visibility=public] public/company/closed group visibility for search
     * @param {Number} [max_items=30] max # of items to persist in the channel
     * @param {Number} [max_payload_size=60000] max # of items to persist in the channel
     * @param {String} [channelName=""] The name of the channel
     * @param {String} [category=""] The category of the channel
     * @return {Promise<Channel>} Return the channel created or an error
     */
    updateChannel( id, channelTopic, visibility, max_items, max_payload_size, channelName, category) {
        let that = this;

        if (!id) {
            this._logger.log("warn", LOG_ID + "(updateChannel) bad or empty 'id' parameter ");
            this._logger.log("internalerror", LOG_ID + "(updateChannel) bad or empty 'id' parameter : ", id);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        } else {
            let options : any = {};
            if (channelTopic != null) {
                options.topic = channelTopic;
            }
            if (visibility != null) {
                options.mode = visibility === "company" ? "company_public" : "company_closed";
            }
            if (max_items != null) {
                options.max_items = max_items;
            }
            if (max_payload_size != null) {
                options.max_payload_size = max_payload_size;
            }
            if (channelName != null) {
                options.name = channelName;
            }
            if (category != null) {
                options.cateogry = category;
            }

            return  new Promise((resolve, reject) =>
            {
                that._rest.updateChannel(id, options.topic, null, options.max_items, options.max_payload_size, options.name, options.mode)
                    .then((channelUpdated) => {
                        this._logger.log("internal", LOG_ID + "(updateChannel) channel channelUpdated : ", channelUpdated);
                        let channelObj = this.addOrUpdateChannelToCache(channelUpdated);

                        this._logger.log("internal", LOG_ID + "(updateChannel) channel updated, channelObj : ", channelObj);
                        resolve(channelObj);
                    })
                    .catch(function (err) {
                        return reject(err);
                    });
            });
        }

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
     * @return {Promise<Channel>} Return the channel updated or an error
     */
    updateChannelVisibility(channel, visibility) {
        if (!channel || !channel.id) {
            this._logger.log("warn", LOG_ID + "(updateChannelVisibility) bad or empty 'channel' parameter ");
            this._logger.log("internalerror", LOG_ID + "(updateChannelVisibility) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!channel.id) {
            this._logger.log("warn", LOG_ID + "(updateChannelVisibility) bad or empty 'channel.id' parameter ");
            this._logger.log("internalerror", LOG_ID + "(updateChannelVisibility) bad or empty 'channel.id' parameter : ", channel.id);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!visibility) {
            this._logger.log("warn", LOG_ID + "(updateChannelVisibility) bad or empty 'visibility' parameter ");
            this._logger.log("internalerror", LOG_ID + "(updateChannelVisibility) bad or empty 'visibility' parameter : ", visibility);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let mode = visibility === "company" ? "company_public" : "company_closed";
        let name = channel.name;

        return new Promise((resolve, reject) => {

            this._rest.updateChannel(channel.id, null, null,  null , null, name, mode).then((channelUpdated : any) => {
                this._logger.log("internal", LOG_ID + "(updateChannelVisibility) channel updated : ", channelUpdated);

                let channelObj = this.addOrUpdateChannelToCache(channelUpdated);

                /*let foundIndex = this._channels.findIndex(channelItem => channelItem.id === channelUpdated.id);
                let channelObj : Channel = Channel.ChannelFactory()(channelUpdated, this._rest.http.serverURL);
                this._channels[foundIndex] = channelObj;
                */
                this._logger.log("internal", LOG_ID + "(updateChannelVisibility) channel updated : ", channelObj);

                resolve(channelObj);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(updateChannelVisibility) error ");
                this._logger.log("internalerror", LOG_ID + "(updateChannelVisibility) error : ", err);
                return reject(err);
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
     * @method
     * @since 1.43
     * @instance
     * @description
     *    Update a channel avatar<br/>
     *    Return a promise.
     * @param {Channel} channel The Channel to update
     * @param {string} urlAvatar  The avatar Url.  It must be resized to 512 pixels before calling this API.
     * @return {Channel} Return the channel updated or an error
     */
    updateChannelAvatar (channel, urlAvatar) {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(updateChannelAvatar) bad or empty 'channel' parameter ");
            that._logger.log("internalerror", LOG_ID + "(updateChannelAvatar) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        } else if (!urlAvatar) {
            that._logger.log("warn", LOG_ID + "(updateChannelAvatar) bad or empty 'urlAvatar' parameter ");
            that._logger.log("internalerror", LOG_ID + "(updateChannelAvatar) bad or empty 'urlAvatar' parameter : ", urlAvatar);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        } else {
            return new Promise((resolve, reject) => {
                try {
                    that._logger.log("internal", LOG_ID + "(updateChannelAvatar) channel : ", channel);
                    let id = channel.id;
                    let fileStats = fs.statSync(urlAvatar);
                    let fd = fs.openSync(urlAvatar, "r+");
                    let buf = new Buffer(fileStats.size);
                    fs.readSync(fd, buf, 0, fileStats.size, null);
                    let fileType = mimetypes.lookup(urlAvatar);

                    that._rest.uploadChannelAvatar(id, buf, fileStats.size/* should resize the picture to 512*/, fileType).then(function () {
                        that._logger.log("internal", LOG_ID + "(updateChannelAvatar) channel : ", channel);
                        resolve({
                            code: "OK",
                            label: "OK"
                        });
                    }).catch(function (err) {
                        that._logger.log("error", LOG_ID + "(updateChannelAvatar) !!! CATCH Error ");
                        that._logger.log("internalerror", LOG_ID + "(updateChannelAvatar) !!! CATCH Error ", err,  ", for channel : ", channel);
                        return reject(err);
                    });
                } catch (err2) {
                    that._logger.log("error", LOG_ID + "(updateChannelAvatar) !!! CATCH Error ");
                    that._logger.log("internalerror", LOG_ID + "(updateChannelAvatar) !!! CATCH Error ", err2,  ", for channel : ", channel);
                    return reject(err2);
                }
            });
        }
    };

    /**
     * @public
     * @method
     * @since 1.43
     * @instance
     * @description
     *    Delete a channel avatar<br/>
     *    Return a promise.
     * @param {Channel} channel The channel to update
     * @return {Channel} Return the channel updated or an error
     */
    deleteChannelAvatar(channel) {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(updateChannelAvatar) bad or empty 'channel' parameter ");
            that._logger.log("internalerror", LOG_ID + "(updateChannelAvatar) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        } else {
            return new Promise((resolve, reject) => {
                let id = channel.id;
                that._rest.deleteChannelAvatar(id)
                    .then(function () {
                        that._logger.log("internal", LOG_ID + "(updateChannelAvatar) channel : ", channel);
                        resolve({
                            code: "OK",
                            label: "OK"
                        });
                    })
                    .catch(function (err) {
                        return reject(err);
                    });
            });
        }
    };

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
     */
    public fetchChannelUsers(channel, options) : Promise<Array<{}>> {
        if (!channel || !channel.id) {
            this._logger.log("warn", LOG_ID + "(fetchChannelUsers) bad or empty 'channel' parameter");
            this._logger.log("internalerror", LOG_ID + "(fetchChannelUsers) bad or empty 'channel' parameter : ", channel);
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
                this._logger.log("info", LOG_ID + "(fetchChannelUsers) channel has users ");
                this._logger.log("internal", LOG_ID + "(fetchChannelUsers) channel has users : ", users.length);
                resolve(users);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(fetchChannelUsers) error ");
                this._logger.log("internalerror", LOG_ID + "(fetchChannelUsers) error : ", err);
                return reject(err);
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
     */
    public deleteAllUsersFromChannel(channel) : Promise<Channel> {
        if (!channel || !channel.id) {
            this._logger.log("warn", LOG_ID + "(deleteAllUsersFromChannel) bad or empty 'channel' parameter");
            this._logger.log("internalerror", LOG_ID + "(deleteAllUsersFromChannel) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            this._rest.deleteAllUsersFromChannel(channel.id).then((result) => {
                this._logger.log("info", LOG_ID + "(deleteAllUsersFromChannel) channel users deletion");
                this._logger.log("internal", LOG_ID + "(deleteAllUsersFromChannel) channel users deletion : ", result);

                this._rest.getChannel(channel.id).then((updatedChannel : any) => {
                    // Update local channel
                    let channelObj = this.addOrUpdateChannelToCache(updatedChannel);
                    /*let foundIndex = this._channels.findIndex(channelItem => channelItem.id === updatedChannel.id);
                    let channelObj : Channel = Channel.ChannelFactory()(updatedChannel, this._rest.http.serverURL);
                    this._channels[foundIndex] = channelObj;
                     */
                    resolve(channelObj);
                });

            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(deleteAllUsersFromChannel) error ");
                this._logger.log("internalerror", LOG_ID + "(deleteAllUsersFromChannel) error : ", err);
                return reject(err);
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
     */
    public updateChannelUsers(channel, users) : Promise<Channel> {
        if (!channel || !channel.id) {
            this._logger.log("warn", LOG_ID + "(updateChannelUsers) bad or empty 'channel' parameter");
            this._logger.log("internalerror", LOG_ID + "(updateChannelUsers) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let channelId = channel.id;
        return new Promise((resolve, reject) => {
            //this._logger.log("internal", LOG_ID + "(updateChannelUsers) this._channels : ", this._channels);
            this._rest.updateChannelUsers(channelId, users).then((res) => {
                this._logger.log("info", LOG_ID + "(updateChannelUsers) channel users updated");
                this._logger.log("internal", LOG_ID + "(updateChannelUsers) channel users updated : ", res);

                this._rest.getChannel(channelId).then((updatedChannel : any) => {
                    // Update local channel
                    let channelObj = this.addOrUpdateChannelToCache(updatedChannel);

                    /*let foundIndex = this._channels.findIndex(channelItem => channelItem.id === updatedChannel.id);
                    let channelObj : Channel = Channel.ChannelFactory()(updatedChannel, this._rest.http.serverURL);
                    this._channels[foundIndex] = channelObj;
                     */
                    this._logger.log("internal", LOG_ID + "(updateChannelUsers) channel updated : ", channelObj);
                    resolve(channelObj);
                });
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(updateChannelUsers) error ");
                this._logger.log("internalerror", LOG_ID + "(updateChannelUsers) error : ", err);
                return reject(err);
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
     */
    public addOwnersToChannel(channel : Channel, owners) : Promise<Channel>  {
        if (!channel || !channel.id) {
            this._logger.log("warn", LOG_ID + "(addOwnersToChannel) bad or empty 'channel' parameter");
            this._logger.log("internalerror", LOG_ID + "(addOwnersToChannel) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!owners) {
            this._logger.log("warn", LOG_ID + "(addOwnersToChannel) bad or empty 'owners' parameter");
            this._logger.log("internalerror", LOG_ID + "(addOwnersToChannel) bad or empty 'owners' parameter : ", owners);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let usersId = [];

        owners.forEach((user) => {
            usersId.push({"id": user.id, "type": "owner"});
        });

        let updated = this.updateChannelUsers(channel, usersId);
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
     */
    public addPublishersToChannel(channel : Channel, publishers) : Promise<Channel> {
        if (!channel || !channel.id ) {
            this._logger.log("warn", LOG_ID + "(addPublishersToChannel) bad or empty 'channel' parameter");
            this._logger.log("internalerror", LOG_ID + "(addPublishersToChannel) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!publishers || !(publishers.length > 0)) {
            this._logger.log("warn", LOG_ID + "(addPublishersToChannel) bad or empty 'publishers' parameter");
            this._logger.log("internalerror", LOG_ID + "(addPublishersToChannel) bad or empty 'publishers' parameter : ", publishers);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let usersId = [];

        publishers.forEach((user) => {
            usersId.push({"id": user.id, "type": "publisher"});
        });

        let updated = this.updateChannelUsers(channel, usersId);
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
     */
    public async addMembersToChannel(channel, members) : Promise<Channel> {
        //this._logger.log("internal", LOG_ID + "(addMembersToChannel) this._channels : ", this._channels);
        if (!channel || !channel.id) {
            this._logger.log("warn", LOG_ID + "(addMembersToChannel) bad or empty 'channel' parameter");
            this._logger.log("internalerror", LOG_ID + "(addMembersToChannel) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!members) {
            this._logger.log("warn", LOG_ID + "(addMembersToChannel) bad or empty 'members' parameter");
            this._logger.log("internalerror", LOG_ID + "(addMembersToChannel) bad or empty 'members' parameter : ", members);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let usersId: Array<any> = [];

        members.forEach((user) => {
            if (user) {
                usersId.push({"id": user.id, "type": "member"});
            }
        });

        if (!(usersId.length > 0)) {
            this._logger.log("warn", LOG_ID + "(addMembersToChannel) bad or empty 'members' parameter");
            this._logger.log("internalerror", LOG_ID + "(addMembersToChannel) bad or empty 'members' parameter : ", members);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let updated = this.updateChannelUsers(channel, usersId);
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
     */
    public deleteUsersFromChannel(channel : Channel, users) : Promise<Channel> {
        if (!channel || !channel.id) {
            this._logger.log("warn", LOG_ID + "(deleteUsersFromChannel) bad or empty 'channel' parameter");
            this._logger.log("internalerror", LOG_ID + "(deleteUsersFromChannel) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!users) {
            this._logger.log("warn", LOG_ID + "(deleteUsersFromChannel) bad or empty 'publishers' parameter");
            this._logger.log("internalerror", LOG_ID + "(deleteUsersFromChannel) bad or empty 'publishers' parameter : ", users);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let usersId = [];

        users.forEach((user) => {
            usersId.push({"id": user.id, "type": "none"});
        });

        let updated = this.updateChannelUsers(channel, usersId);
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
     */
    public fetchChannelItems (channel : Channel) : Promise<Array<any>>{
        if (!channel || !channel.id) {
            this._logger.log("warn", LOG_ID + "(fetchChannelItems) bad or empty 'channel' parameter");
            this._logger.log("internalerror", LOG_ID + "(fetchChannelItems) bad or empty 'channel' parameter : ", channel);
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
                resolve(listOfMessages);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(fetchChannelItems) error ");
                this._logger.log("internalerror", LOG_ID + "(fetchChannelItems) error : ", err);
                return reject(err);
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
     */
    public deleteItemFromChannel (channelId, itemId) : Promise<Channel> {
        if (!channelId ) {
            this._logger.log("error", LOG_ID + "(deleteItemFromChannel) bad or empty 'channelId' parameter");
            this._logger.log("internalerror", LOG_ID + "(deleteItemFromChannel) bad or empty 'channelId' parameter : ", channelId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!itemId) {
            this._logger.log("error", LOG_ID + "(deleteItemFromChannel) bad or empty 'itemId' parameter");
            this._logger.log("internalerror", LOG_ID + "(deleteItemFromChannel) bad or empty 'itemId' parameter : ", itemId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise( (resolve, reject) => {

            this._rest.deleteChannelMessage(channelId, itemId).then((result) => {
                this._logger.log("info", LOG_ID + "(deleteItemFromChannel) channel message deletion");
                this._logger.log("internal", LOG_ID + "(deleteItemFromChannel) channel message deletion : ", result);

                this._rest.getChannel(channelId).then((updatedChannel : any) => {
                    // Update local channel
                    let channelObj = this.addOrUpdateChannelToCache(updatedChannel);
                    /*let foundIndex = this._channels.findIndex(channelItem => channelItem.id === updatedChannel.id);
                    let channelObj : Channel = Channel.ChannelFactory()(updatedChannel, this._rest.http.serverURL);
                    this._channels[foundIndex] = channelObj;
                     */
                    resolve(channelObj);
                }).catch((err) => {
                    this._logger.log("error", LOG_ID + "(deleteItemFromChannel) error getChannel ");
                    this._logger.log("internalerror", LOG_ID + "(deleteItemFromChannel) error getChannel : ", err);
                    return reject(err);
                });
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(deleteItemFromChannel) error ");
                this._logger.log("internalerror", LOG_ID + "(deleteItemFromChannel) error : ", err);
                return reject(err);
            });
        });

    }

    _onChannelMessageReceived(message) {

        this.fetchChannel(message.channelId).then((channel) => {
            message.channel = channel;
            delete message.channelId;
            this._eventEmitter.emit("evt_internal_channelmessagereceived", message);
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
                this._logger.log("internal", LOG_ID + "(getChannel) channel found on the server : ", channel);
                let channelObj : Channel = Channel.ChannelFactory()(channel, this._rest.http.serverURL);
                resolve(channelObj);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(getChannel) error ");
                this._logger.log("internalerror", LOG_ID + "(getChannel) error : ", err);
                return reject(err);
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
        let channelFound = null;
        this._logger.log("internal", LOG_ID + "(getChannelFromCache) search id : ", channelId);

        if (this._channels) {
            let channelFoundindex = this._channels.findIndex((channel) => {
                return channel.id === channelId;
            });
            if (channelFoundindex != -1) {
                this._logger.log("internal", LOG_ID + "(getChannelFromCache) channel found : ", this._channels[channelFoundindex], " with id : ", channelId);
                return this._channels[channelFoundindex];
            }
        }
        this._logger.log("internal", LOG_ID + "(getChannelFromCache) channel found : ", channelFound, " with id : ", channelId);
        return channelFound ;
    }

    private updateChannelsList(): void {
        //this._logger.log("debug", LOG_ID + "(updateChannelsList) keys : ", Object.keys(this._channels));
        this._channelsList = this._channels.map((chnl) => { return chnl.id; });
        this._logger.log("internal", LOG_ID + "(updateChannelsList) this._channelsList : ", this._channelsList);
    }

    private addOrUpdateChannelToCache(channel: any): Channel {
        let channelObj : Channel = Channel.ChannelFactory()(channel, this._rest.http.serverURL);
        let channelFoundindex = this._channels.findIndex((channelIter) => {
            return channelIter.id === channel.id;
        });
        if (channelFoundindex != -1) {
            this._logger.log("internal", LOG_ID + "(addOrUpdateChannelToCache) update in cache with channel : ", channel, ", at channelFoundindex : ", channelFoundindex);
            //this._channels.splice(channelFoundindex,1,channelObj);
            //channelCached = channelObj;
            this._logger.log("internal", LOG_ID + "(addOrUpdateChannelToCache) in update this._channels : ", this._channels);
            this._channels[channelFoundindex].updateChannel(channel);
            channelObj = this._channels[channelFoundindex];
        } else {
            this._logger.log("internal", LOG_ID + "(addOrUpdateChannelToCache) add in cache channelObj : ", channelObj);
            this._channels.push(channelObj);
        }
        this.updateChannelsList();
        return channelObj;
    }

    private removeChannelFromCache(channelId: string): Promise<Channel> {
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
                let channelId = channelToRemove.id;

                this._logger.log("internal", LOG_ID + "(removeChannelFromCache) remove from cache channelId : ", channelId);
                this._channels = this._channels.filter( function(chnl) {
                    return !(chnl.id === channelId);
                });

                this.updateChannelsList();

                // Update messagesList
                //this.feedChannel.messages = [];
                this.retrieveLatests()
                    .then(() => { resolve(channelToRemove); })
                    .catch((err) => {
                        this._logger.log("error", LOG_ID + "(removeChannelFromCache) error retrieveLatests ");
                        this._logger.log("internalerror", LOG_ID + "(removeChannelFromCache) error retrieveLatests : ", err);
                        return reject(err);
                    });
            } else {
                resolve(null);
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
                    let channelObj : Channel = this.addOrUpdateChannelToCache(newChannel);
                /*if (newChannel.invited) {
                    let channelObj : Channel = this.addOrUpdateChannelToCache(newChannel);
                    that._eventEmitter.emit("rainbow_channelcreated", {'id': newChannel.id});
                    //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.ADD, newChannel.id);
                } else { // */
                    that._eventEmitter.emit("evt_internal_channelupdated", {"id": channelObj.id, "kind" : that.LIST_EVENT_TYPE.ADD.code, "label" : that.LIST_EVENT_TYPE.ADD.label});
                //}
            });
    }

    public  onAddToChannel(channelInfo: {id:string}): void {
        let that = this;
        let channelId = channelInfo.id;
        this._logger.log("debug", LOG_ID + "(onAddToChannel) channelId : ", channelId);
        //this._logger.log("internal", LOG_ID + "(onAddToChannel) this._channels : ", this._channels);

        // Get channel from cache
        let channel = this.getChannelFromCache(channelId);

        // Get channel from server
        this.getChannel(channelId)
            .then((newChannel) => {

                // Handle channel creation
                if (!channel && !newChannel.invited) {
                    let channelObj : Channel = this.addOrUpdateChannelToCache(newChannel);
                    //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.ADD, newChannel.id);
                    //this._logger.log("debug", LOG_ID + "(onAddToChannel) rainbow_channelcreated : ", channelObj.id);
                    that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelObj.id, "kind" : that.LIST_EVENT_TYPE.ADD.code, "label" : that.LIST_EVENT_TYPE.ADD.label});
                }

                // Handle channel invitation
                else if (!channel && newChannel.invited) {
                    let channelObj : Channel = this.addOrUpdateChannelToCache(newChannel);
                    this.incrementInvitationCounter();
                    //this._logger.log("debug", LOG_ID + "(onAddToChannel) evt_internal_channelupdated : ", channelObj.id, "kind : ", that.LIST_EVENT_TYPE.SUBSCRIBE);
                    that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelObj.id, "kind" : that.LIST_EVENT_TYPE.SUBSCRIBE.code, "label" : that.LIST_EVENT_TYPE.SUBSCRIBE.label});
                    //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.SUBSCRIBE, newChannel.id);
                }

                // Handle change role
                else if (channel && newChannel.userRole !== this.USER_ROLE.NONE) {
                    channel.userRole = newChannel.userRole;
                    // TODO : this.feedChannel.messages = [];
                    this.retrieveLatests()
                        .then(() => {
                            //this._logger.log("debug", LOG_ID + "(onAddToChannel) retrieveLatests evt_internal_channelupdated : ", channelId, "kind : ", that.LIST_EVENT_TYPE.SUBSCRIBE);
                            that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelId, "kind" : that.LIST_EVENT_TYPE.SUBSCRIBE.code, "label" : that.LIST_EVENT_TYPE.SUBSCRIBE.label});
                            //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.SUBSCRIBE, channelId);
                        });
                }

            });
    }

    private async onRemovedFromChannel(channelInfo : {id : string}): Promise<any> {
        let that = this;
        let channelId = channelInfo.id;
        this._logger.log("debug", LOG_ID + "(onRemovedFromChannel) channelId : ", channelId);
        let channelDeleted = await that.removeChannelFromCache(channelId);
        let channelIdDeleted = channelDeleted ? channelDeleted.id : channelInfo.id;
        that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelIdDeleted, "kind" : that.LIST_EVENT_TYPE.DELETE.code, "label" : that.LIST_EVENT_TYPE.DELETE.label});
        //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.DELETE, channelId);
    }

    private onSubscribeToChannel(channelInfo: {'id': string, 'subscribers' : string}): void {
        let that = this;
        let channelId: string = channelInfo.id;
        let subscribersInfo: string = channelInfo.subscribers;
        this._logger.log("internal", LOG_ID + "(onSubscribeToChannel) channelId : ", channelId, ", subscribersInfo : ", subscribersInfo);
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
                    that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelId, "kind" : that.LIST_EVENT_TYPE.SUBSCRIBE.code, "label" : that.LIST_EVENT_TYPE.SUBSCRIBE.label});
                    //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.SUBSCRIBE, channelId);
                });
        }

        // Handle self subscription case
        else {
            this.getChannel(channelId)
                .then((newChannel) => {
                let channelObj : Channel = this.addOrUpdateChannelToCache(newChannel);
                    //this.feedChannel.messages = [];
                    return this.retrieveLatests();
                })
                .then(() => {
                    that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelId, "kind" : that.LIST_EVENT_TYPE.SUBSCRIBE.code, "label" : that.LIST_EVENT_TYPE.SUBSCRIBE.label});
                    //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.SUBSCRIBE, channelId);
                });
        }
    }

    private async onUnsubscribeToChannel(channelInfo: {'id': string, 'subscribers' : string}): Promise<void> {
        let that = this;
        let channelId: string = channelInfo.id;
        let subscribersInfo: string = channelInfo.subscribers;
        this._logger.log("internal", LOG_ID + "(onUnsubscribeToChannel) channelId : ", channelId, ", subscribersInfo : ", subscribersInfo);
        let subscribers = Number.parseInt(subscribersInfo);
        let channel  : Channel = await this.fetchChannel(channelId);
        if (channel) {
            channel.subscribers_count = subscribers;
            channel.subscribed = false;
        }

        // Update messagesList
        //this.feedChannel.messages = [];
        this.retrieveLatests().then(() => {
            that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelId, "kind" : that.LIST_EVENT_TYPE.UNSUBSCRIBE.code, "label" : that.LIST_EVENT_TYPE.UNSUBSCRIBE.label});
            //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.UNSUBSCRIBE, channelId);
        });
    }

    private async onDeleteChannel(channelInfo : {id : string}): Promise<any> {
        let that = this;
        let channelId: string = channelInfo.id;
        this._logger.log("debug", LOG_ID + "(onDeleteChannel) channelId : ", channelId);
        let channelDeleted = await that.removeChannelFromCache(channelId);
        let channelIdDeleted = channelDeleted ? channelDeleted.id : channelInfo.id;

        that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelIdDeleted, "kind" : that.LIST_EVENT_TYPE.DELETE.code, "label" : that.LIST_EVENT_TYPE.DELETE.label});
                //this.$rootScope.$broadcast(this.CHANNEL_UPDATE_EVENT, this.LIST_EVENT_TYPE.DELETE, channelId);
    }

    private async onUserSubscribeEvent(info : {id: string, userId: string, 'subscribers': number}) {
        let that = this;
        this._logger.log("internal", LOG_ID + "(onUserSubscribeEvent) channelId : ", info.id, ", subscribersInfo : ", info.subscribers);
        let channel : Channel = await this.fetchChannel(info.id);
        if (channel) {
            channel.subscribers_count = info.subscribers;
        }

        that._eventEmitter.emit("evt_internal_channelusersubscription", {'id': info.id, 'userId': info.userId, "kind" : that.LIST_EVENT_TYPE.SUBSCRIBE.code, "label" : that.LIST_EVENT_TYPE.SUBSCRIBE.label});
        //this.$rootScope.$broadcast(this.CHANNEL_USER_SUBSCRIPTION_EVENT, this.LIST_EVENT_TYPE.SUBSCRIBE, channelId, userId);
    }

    private async onUserUnsubscribeEvent(info : {id: string, userId: string, 'subscribers': number}) {
        let that = this;
        this._logger.log("internal", LOG_ID + "(onUserUnsubscribeEvent) channelId : ", info.id, ", subscribersInfo : ", info.subscribers);
        let channel : Channel = await this.fetchChannel(info.id);
        if (channel) {
            channel.subscribers_count = info.subscribers;
        }

        that._eventEmitter.emit("evt_internal_channelusersubscription", {'id': info.id, 'userId': info.userId, "kind" : that.LIST_EVENT_TYPE.UNSUBSCRIBE.code, "label" : that.LIST_EVENT_TYPE.UNSUBSCRIBE.label});
        //this.$rootScope.$broadcast(this.CHANNEL_USER_SUBSCRIPTION_EVENT, this.LIST_EVENT_TYPE.UNSUBSCRIBE, channelId, userId);
    }

    /****************************************************************/
    /*** END MANAGEMENT EVENT HANDLER                             ***/
    /****************************************************************/

}

module.exports.ChannelsService = Channels;
export {Channels as ChannelsService};
