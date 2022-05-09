"use strict";

import {Contact} from "../common/models/Contact";
import {ErrorManager} from "../common/ErrorManager";
import {Appreciation, Channel} from "../common/models/Channel";
import {ChannelEventHandler} from "../connection/XMPPServiceHandler/channelEventHandler";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";
import {EventEmitter} from "events";
import * as PubSub from "pubsub-js";
import * as fs from "fs";
import * as mimetypes from "mime-types";
import {isStarted, logEntryExit} from "../common/Utils";
import {Logger} from "../common/Logger";
import {S2SService} from "./S2SService";
import {Core} from "../Core";
import {GenericService} from "./GenericService";

export {};

const LOG_ID = "CHANNELS/SVCE - ";

@logEntryExit(LOG_ID)
@isStarted([])
/**
 * @module
 * @name ChannelsService
 * @version SDKVERSION
 * @public
 * @description
 *      This service manages ChannelsService. This service is in Beta. <br>
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Create a new channel <br>
 *      - Manage a channel: update, delete <br>
 *      - Manage users in a channel <br>
 */
class ChannelsService extends GenericService {
    private _channels: any;
    private _channelsList: any;
	public MAX_ITEMS: any;
	public MAX_PAYLOAD_SIZE: any;
	public PUBLIC_VISIBILITY: any;
    public PRIVATE_VISIBILITY: any;
    public CLOSED_VISIBILITY: any;
    private channelEventHandler: ChannelEventHandler;
    private channelHandlerToken: any;
    public invitationCounter: number = 0;

    static getClassName(){ return 'ChannelsService'; }
    getClassName(){ return ChannelsService.getClassName(); }

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


    constructor(_eventEmitter : EventEmitter, _logger : Logger, _startConfig: {
        start_up:boolean,
        optional:boolean
    }) {
        super(_logger, LOG_ID);
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

        this._eventEmitter.on("evt_internal_channelitemreceived", this._onChannelMessageReceived.bind(this));
        this._eventEmitter.on("evt_internal_channelbyidmyappreciationreceived", this._onChannelMyAppreciationReceived.bind(this));
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
                that.setStarted ();
                resolve(undefined);
            }
            catch (err) {
                that._logger.log("error", LOG_ID + "(start) error ");
                that._logger.log("internalerror", LOG_ID + "(start) error : ", err);
                return reject(err);
            }
        });
    }

    stop() {
        let that = this;
        return new Promise((resolve, reject) => {
            try {
                that._xmpp = null;
                that._rest = null;
                that._channels = null;
                that._channelsList = null;
//                that._eventEmitter.removeListener("rainbow_onchannelmessagereceived", that._onChannelMessageReceived);
                if (that.channelHandlerToken) {
                    that.channelHandlerToken.forEach((token) => PubSub.unsubscribe(token));
                }
                that.channelHandlerToken = [];
                that.setStopped ();
                resolve(undefined);
            } catch (err) {
                that._logger.log("error", LOG_ID + "(stop) error ");
                that._logger.log("internalerror", LOG_ID + "(stop) error : ", err);
                return reject(err);
            }
        });
    }
    
    async init (useRestAtStartup : boolean) {
        let that = this;
        if (useRestAtStartup) {
            await that._channels.fetchMyChannels();
        }
        that.setInitialized();
    }

    attachHandlers() {
        let that = this;
        that.channelEventHandler = new ChannelEventHandler(that._xmpp, that);
        that.channelHandlerToken = [
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_CHAT, that.conversationEventHandler.onChatMessageReceived),
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_GROUPCHAT, that.conversationEventHandler.onChatMessageReceived),
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_WEBRTC, that.conversationEventHandler.onWebRTCMessageReceived),
            PubSub.subscribe( that._xmpp.hash + "." + that.channelEventHandler.MESSAGE_MANAGEMENT, that.channelEventHandler.onManagementMessageReceived.bind(that.channelEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that.channelEventHandler.MESSAGE_ERROR, that.channelEventHandler.onErrorMessageReceived.bind(that.channelEventHandler)),
            PubSub.subscribe( that._xmpp.hash + "." + that.channelEventHandler.MESSAGE_HEADLINE, that.channelEventHandler.onHeadlineMessageReceived.bind(that.channelEventHandler)),
//            PubSub.subscribe( that._xmpp.hash + "." + that.conversationEventHandler.MESSAGE_CLOSE, that.conversationEventHandler.onCloseMessageReceived)
        ];

    }

    //region Channels MANAGEMENT
    
    /**
     * @public
     * @method createChannel
     * @instance
     * @async
     * @category Channels MANAGEMENT
     * @param {string} name  The name of the channel to create (max-length=255)
     * @param {string} [channelTopic]  The description of the channel to create (max-length=255)
     * @return {Promise<Channel>} New Channel
     * @description
     *  Create a new public channel with a visibility limited to my company <br>
     */
    createChannel(name: string, channelTopic: string) {
        let that = this;
        
        return that.createPublicChannel(name, channelTopic, "globalnews");
    }

    /**
     * @public
     * @method createPublicChannel
     * @instance
     * @async
     * @category Channels MANAGEMENT
     * @param {string} name  The name of the channel to create (max-length=255)
     * @param {string} [channelTopic]  The description of the channel to create (max-length=255)
     * @param {string} [category=""] The category of the channel
     * @return {Promise<Channel>} New Channel
     * @description
     *  Create a new public channel with a visibility limited to my company <br>
     */
    createPublicChannel(name: string, channelTopic: string, category : string) : Promise<Channel>{
        let that = this;
        
        return new Promise((resolve, reject) => {

            if (!name) {
                that._logger.log("warn", LOG_ID + "(createPublicChannel) bad or empty 'name' parameter");
                that._logger.log("internalerror", LOG_ID + "(createPublicChannel) bad or empty 'name' parameter : ", name);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            that._rest.createPublicChannel(name, channelTopic, category, that.PUBLIC_VISIBILITY, that.MAX_ITEMS, that.MAX_PAYLOAD_SIZE).then((channel) => {
                that._logger.log("debug", LOG_ID + "(createPublicChannel) creation successfull");
                //let channelObj : Channel = that.addOrUpdateChannelToCache(channel);
                let channelObj : Channel = Channel.ChannelFactory()(channel, that._rest.http.serverURL);
                resolve(channelObj);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(createPublicChannel) error ");
                that._logger.log("internalerror", LOG_ID + "(createPublicChannel) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method createClosedChannel (ex: createPrivateChannel)
     * @instance
     * @async
     * @category Channels MANAGEMENT
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the createClosedChannel method instead,
     * @param {string} name  The name of the channel to create (max-length=255)
     * @param {string} [description]  The description of the channel to create (max-length=255)
     * @return {Promise<Channel>} New Channel
     * @description
     *  Create a new private channel <br>
     */
    createPrivateChannel(name : string, description : string) {
        let that = this;
        
        return that.createClosedChannel(name, description, "globalnews");
    }

    /**
     * @public
     * @method createClosedChannel (ex: createPrivateChannel)
     * @instance
     * @async
     * @category Channels MANAGEMENT
     * @param {string} name  The name of the channel to create (max-length=255)
     * @param {string} [description]  The description of the channel to create (max-length=255)
     * @param {string} [category=""] The category of the channel
     * @return {Promise<Channel>} New Channel
     * @description
     *  Create a new closed channel <br>
     */
    createClosedChannel(name: string, description : string, category : string) : Promise<Channel> {
        let that = this;

        return new Promise((resolve, reject) => {

            if (!name) {
                that._logger.log("warn", LOG_ID + "(createClosedChannel) bad or empty 'name' parameter");
                that._logger.log("internalerror", LOG_ID + "(createClosedChannel) bad or empty 'name' parameter : ", name);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }
            that._rest.createPublicChannel(name, description, category, that.PRIVATE_VISIBILITY, that.MAX_ITEMS, that.MAX_PAYLOAD_SIZE).then((channel) => {
                that._logger.log("debug", LOG_ID + "(createClosedChannel) creation successfull");
                //let channelObj : Channel = that.addOrUpdateChannelToCache(channel);
                let channelObj : Channel = Channel.ChannelFactory()(channel, that._rest.http.serverURL);
                resolve(channelObj);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(createClosedChannel) error ");
                that._logger.log("internalerror", LOG_ID + "(createClosedChannel) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method deleteChannel
     * @instance
     * @async
     * @category Channels MANAGEMENT
     * @param {Channel} channel  The channel to delete
     * @return {Promise<Channel>} Promise object represents The channel deleted
     * @description
     *  Delete a owned channel <br>
     */
    deleteChannel(channel: Channel) : Promise<Channel> {
        let that = this;

        return new Promise((resolve, reject) => {
            if (!channel || !channel.id) {
                that._logger.log("warn", LOG_ID + "(deleteChannel) bad or empty 'channel' parameter");
                that._logger.log("internalerror", LOG_ID + "(deleteChannel) bad or empty 'channel' parameter : ", channel);
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            }

            that._rest.deleteChannel(channel.id).then(async (status) => {
                that._logger.log("debug", LOG_ID + "(deleteChannel) channel deleted status : ", status);
                /*let channelRemoved = that._channels.splice(that._channels.findIndex((el) => {
                    return el.id === channel.id;
                }), 1); // */

                let channelRemoved = await that.removeChannelFromCache(channel.id);
                that._logger.log("internal", LOG_ID + "(deleteChannel) channel deleted : ", channelRemoved);
                if (channelRemoved) {
                    resolve(channelRemoved);
                } else {
                    that._logger.log("warn", LOG_ID + "(deleteChannel) the channel deleted was unknown from SDK cache ");
                    that._logger.log("internalerror", LOG_ID + "(deleteChannel) the channel deleted was unknown from SDK cache : ", channel);
                    resolve(channel);
                }
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(deleteChannel) error ");
                that._logger.log("internalerror", LOG_ID + "(deleteChannel) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method findChannelsByName
     * @instance
     * @async
     * @category Channels MANAGEMENT
     * @param {string} name Search this provided substring in the channel name (case insensitive).
     * @return {Promise<Array<Channel>>} ChannelsService found
     * @description
     *  Find channels by name. Only channels with visibility equals to 'company' can be found. First 100 results are returned. <br>
     */
    findChannelsByName(name : string) : Promise<[Channel]> {
        let that = this;

        if (!name) {
            that._logger.log("warn", LOG_ID + "(findChannelsByName) bad or empty 'name' parameter ");
            that._logger.log("internalerror", LOG_ID + "(findChannelsByName) bad or empty 'name' parameter : ", name);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return that._findChannels(name, null);
    }

    /**
     * @public
     * @method findChannelsByTopic
     * @instance
     * @async
     * @category Channels MANAGEMENT
     * @param {string} topic Search this provided substring in the channel topic (case insensitive).
     * @return {Promise<Array<Channel>>} ChannelsService found
     * @description
     *  Find channels by topic. Only channels with visibility equals to 'company' can be found. First 100 results are returned. <br>
     */
    findChannelsByTopic(topic : string) : Promise<[Channel]> {
        let that = this;

        if (!topic) {
            that._logger.log("warn", LOG_ID + "(findChannelsByTopic) bad or empty 'topic' parameter ");
            that._logger.log("internalerror", LOG_ID + "(findChannelsByTopic) bad or empty 'topic' parameter : ", topic);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return that._findChannels(null, topic);
    }

    /**
     * @private
     * @method findChannels
     * @category Channels MANAGEMENT
     */
    private _findChannels(name : string, topic : string) : Promise<[Channel]> {
        let that = this;
        //hack
        let getChannel = (id) : Promise<Channel> => {
            return new Promise((resolve) => {
                that.fetchChannel(id).then((channel : Channel) => {
                    resolve(channel);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(_findChannels) error getChannel ");
                    that._logger.log("internalerror", LOG_ID + "(_findChannels) error getChannel : ", err);
                    resolve(null);
                });
            });
        };

        return new Promise((resolve, reject) => {

            that._rest.findChannels(name, topic, null, null, null, null, null).then((channels : []) => {
                that._logger.log("info", LOG_ID + "(_findChannels) findChannels channels found ");
                that._logger.log("internal", LOG_ID + "(_findChannels) findChannels channels found : ", channels);

                let promises = [];

                channels.forEach((channel : any) => {
                    promises.push(getChannel(channel.id));
                });

                Promise.all(promises).then((listOfChannels : [Channel]) => {
                    resolve(listOfChannels);
                });

            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(_findChannels) error ");
                that._logger.log("internalerror", LOG_ID + "(_findChannels) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method getChannelById
     * @instance
     * @async
     * @category Channels MANAGEMENT
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the fetchChannel method instead,
     * @param {string} id The id of the channel)
     * @param {boolean} [force=false] True to force a request to the server
     * @return {Promise<Channel>} The channel found
     * @description
     * Find a channel by its id (locally if exists or by sending a request to Rainbow) <br>
     */
    getChannelById(id : string, force? : boolean) : Promise <Channel> {
        let that = this;
        
        return that.fetchChannel(id,  force);
    }

    /**
     * @public
     * @method fetchChannel
     * @instance
     * @async
     * @category Channels MANAGEMENT
     * @param {string} id The id of the channel)
     * @param {boolean} [force=false] True to force a request to the server
     * @return {Promise<Channel>} The channel found
     * @description
     * Find a channel by its id (locally if exists or by sending a request to Rainbow) <br>
     */
    async fetchChannel(id : string, force? : boolean) : Promise<Channel>{
        let that = this;
        
        return new Promise(async (resolve, reject) => {
            if (!id) {
                that._logger.log("warn", LOG_ID + "(fetchChannel) bad or empty 'jid' parameter");
                that._logger.log("internalerror", LOG_ID + "(fetchChannel) bad or empty 'jid' parameter : ", id);
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            else {
                let channelFound = that.getChannelFromCache(id);

                if (channelFound && !force) {
                    that._logger.log("info", LOG_ID + "(fetchChannel) channel found locally");
                    that._logger.log("internal", LOG_ID + "(fetchChannel) channel found locally : ", channelFound);
                    resolve(channelFound);
                }
                else {
                    that._logger.log("debug", LOG_ID + "(fetchChannel) channel not found locally. Ask the server...");
                    let channel = await that.getChannel(id);
                    let channelObj : Channel = that.addOrUpdateChannelToCache(channel);
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
     * @category Channels MANAGEMENT
     * @description
     *    Find channels using a filter (on name, topic)<br>
     *    Result may be filtered with result limit, offet and sortField or SortOrder <br>
     *    Return a promise. <br>
     * @param {Object} filter The filter with at least [filter.name] or [filter.topic] defined <br>
     *      {string} [filter.name] search by channel names (case insensitive substring). <br>
     *      {string} [filter.topic] search by channel topics (case insensitive substring). <br>
     *      {Number} [filter.limit=100] allow to specify the number of channels to retrieve. <br>
     *      {Number} [filter.offset] allow to specify the position of first channel to retrieve (first channel if not specified). Warning: if offset > total, no results are returned. <br>
     *      {string} [filter.sortField="name"] sort channel list based on the given field. <br>
     *      {Number} [filter.sortOrder="1"] specify order ascending/descending. 1 for ascending, -1 for descending. <br>
     * @return {Promise<Channel[]>} Result of the find with <br>
     *      {Array}   found channels informations with an array of { id, name, topic, creatorId, visibility, users_count } <br>
     */
    fetchChannelsByFilter (filter:any) : Promise<[Channel]> {
        let that = this;
        
        let getChannel = (id) : Promise<Channel> => {
            return new Promise((resolve) => {
                that.fetchChannel(id).then((channel : Channel) => {
                    resolve(channel);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(fetchChannelsByFilter) error getChannel ");
                    that._logger.log("internalerror", LOG_ID + "(fetchChannelsByFilter) error getChannel : ", err);
                    resolve(null);
                });
            });
        };

        if (!filter) {
            that._logger.log("debug", LOG_ID + "(fetchChannelsByFilter) bad or empty 'channel' parameter ");
            that._logger.log("internal", LOG_ID + "(fetchChannelsByFilter) bad or empty 'channel' parameter : ", filter);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.findChannels(filter.name, filter.topic, filter.category, filter.limit, filter.offset, filter.sortField, (filter.sortOrder && (filter.sortOrder === 1) ? "1" : "-1")).then((channels : []) => {
                that._logger.log("info", LOG_ID + "(fetchChannelsByFilter) channels found");
                that._logger.log("internal", LOG_ID + "(fetchChannelsByFilter) channels found : ", channels);

                let promises = [];

                channels.forEach((channel : Channel) => {
                    promises.push(getChannel(channel.id));
                });

                Promise.all(promises).then((listOfChannels : [Channel]) => {
                    resolve(listOfChannels);
                });

            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(fetchChannelsByFilter) error ");
                that._logger.log("internalerror", LOG_ID + "(fetchChannelsByFilter) error : ", err);
                return reject(err);
            });
        });
    };

    /**
     * @public
     * @method getChannels
     * @since 1.38
     * @category Channels MANAGEMENT
     * @instance
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the fetchMyChannels method instead,
     * @description
     *    Get the channels you own, are subscribed to, are publisher<br>
     *    Return a promise. <br>
     * @return {{Promise<Channel[]>} } Return Promise with a list of channels or an empty array if no channel has been found
     */
    getChannels() {
        let that = this;
        
        return that.fetchMyChannels();
    }

    /**
     * @public
     * @method fetchMyChannels
     * @since 1.38
     * @instance
     * @category Channels MANAGEMENT
     * @param {boolean} force Boolean to force the get of channels's informations from server. 
     * @description
     *    Get the channels you own, are subscribed to, are publisher<br>
     *    Return a promise. <br>
     * @return {Promise<Channel[]>} Return Promise with a list of channels or an empty array if no channel has been found
     */
    fetchMyChannels(force? : boolean) : Promise<[Channel]>{
        let that = this;
        
        let getChannel = (id) : Promise<Channel> => {
            return new Promise((resolve) => {
                that.fetchChannel(id, force).then((channel) => {
                    resolve(channel);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(fetchMyChannels) error fetchChannel ");
                    that._logger.log("internalerror", LOG_ID + "(fetchMyChannels) error fetchChannel : ", err);
                    resolve(null);
                });
            });
        };

        return new Promise((resolve) => {
            that._rest.getChannels().then((listOfChannels : any) => {

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

                that._logger.log("info", LOG_ID + "(fetchMyChannels) hack start get channel data individually from server...");
                Promise.all(promises).then((channels : [Channel]) => {
                    that._logger.log("internal", LOG_ID + "(fetchMyChannels) hack done : ", channels);
                    that._channels = [];
                    if (channels) {
                        channels.forEach((channel) => {
                            that.addOrUpdateChannelToCache(channel);
                        })
                    }
                    //that._logger.log("internal", LOG_ID + "(fetchMyChannels) get successfully and updated the channels cache : ", that._channels);
                    resolve(that._channels);
                });
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(fetchMyChannels) error ");
                that._logger.log("internalerror", LOG_ID + "(fetchMyChannels) error : ", err);
                // Do not block the startup on VM without channels API
                that._channels = [];
                resolve(that._channels);
            });
        });
    }

    /**
     * @public
     * @method getAllChannels
     * @category Channels MANAGEMENT
     * @instance
     * @return {Channel[]} An array of channels (owned, invited, subscribed)
     * @description
     *  Return the list of channels (owned, invited, subscribed) <br>
     */
    getAllChannels() : [Channel] {
        let that = this;
        return that._channels;
    }

    /**
     * @public
     * @method getAllOwnedChannel
     * @instance
     * @category Channels MANAGEMENT
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the getAllOwnedChannels method instead,
     * @return {Channel[]} An array of channels (owned only)
     * @description
     *  Return the list of owned channels only <br>
     */
    getAllOwnedChannel(){
        let that = this;
        return that.getAllOwnedChannels();
    }

    /**
     * @public
     * @method getAllOwnedChannels
     * @category Channels MANAGEMENT
     * @instance
     * @return {Channel[]} An array of channels (owned only)
     * @description
     *  Return the list of owned channels only <br>
     */
    getAllOwnedChannels() : [Channel] {
        let that = this;
        return that._channels.filter((channel) => {
            return channel.creatorId === that._rest.userId;
        });
    }

    /**
     * @public
     * @method getAllPendingChannels
     * @category Channels MANAGEMENT
     * @instance
     * @return {Channel[]} An array of channels (invited only)
     * @description
     *  Return the list of invited channels only <br>
     */
    getAllPendingChannels() : [Channel] {
        let that = this;
        return that._channels.filter((channel) => {
            return channel.invited;
        });
    }

    /**
     * @public
     * @method updateChannelTopic
     * @instance
     * @async
     * @category Channels MANAGEMENT
     * @param {Channel} channel The channel to update
     * @param {string} description  The description of the channel to update (max-length=255)
     * @return {Promise<Channel>} Updated channel
     * @description
     *  TODO
     */
    updateChannelTopic (channel : Channel, description : string) : Promise <Channel> {
        let that = this;
        return that.updateChannelDescription(channel, description);
    }

    /**
     * @public
     * @method updateChannelDescription
     * @instance
     * @async
     * @category Channels MANAGEMENT
     * @param {Channel} channel The channel to update
     * @param {string} description  The description of the channel to update (max-length=255)
     * @return {Promise<Channel>} Updated channel
     * @description
     *  TODO
     */
    updateChannelDescription(channel: Channel, description : string) : Promise <Channel> {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(updateChannelDescription) bad or empty 'channel' parameter ");
            that._logger.log("internalerror", LOG_ID + "(updateChannelDescription) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!channel.id) {
            that._logger.log("warn", LOG_ID + "(updateChannelDescription) bad or empty 'channel.id' parameter ");
            that._logger.log("internalerror", LOG_ID + "(updateChannelDescription) bad or empty 'channel.id' parameter : ", channel.id);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!description) {
            that._logger.log("warn", LOG_ID + "(updateChannelDescription) bad or empty 'description' parameter ");
            that._logger.log("internalerror", LOG_ID + "(updateChannelDescription) bad or empty 'description' parameter : ", description);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {
            that._rest.updateChannel(channel.id, description, null,  null , null, null, null).then((channelUpdated : any) => {
                that._logger.log("info", LOG_ID + "(updateChannelDescription) channel updated");
                that._logger.log("internal", LOG_ID + "(updateChannelDescription) channel updated : ", channelUpdated);

                let channelObj = that.addOrUpdateChannelToCache(channelUpdated);
                /*let foundIndex = that._channels.findIndex(channelItem => channelItem.id === channelUpdated.id);
                let channelObj : Channel = Channel.ChannelFactory()(channelUpdated, that._rest.http.serverURL);
                that._channels[foundIndex] = channelObj; // */

                resolve(channelObj);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(updateChannelDescription) error ");
                that._logger.log("internalerror", LOG_ID + "(updateChannelDescription) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method
     * @since 1.46
     * @instance
     * @category Channels MANAGEMENT
     * @description
     *    Update a channel name<br>
     *    Return a promise. <br>
     * @param {Channel} channel The channel to update
     * @param {string} channelName The name of the channel
     * @return {Channel} Return the channel updated or an error
     */
    updateChannelName(channel : Channel, channelName : string) {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(updateChannelName) bad or empty 'channel' parameter ");
            that._logger.log("internalerror", LOG_ID + "(updateChannelName) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!channel.id) {
            that._logger.log("warn", LOG_ID + "(updateChannelName) bad or empty 'channel.id' parameter ");
            that._logger.log("internalerror", LOG_ID + "(updateChannelName) bad or empty 'channel.id' parameter : ", channel.id);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!channelName) {
            that._logger.log("warn", LOG_ID + "(updateChannelName) bad or empty 'channelName' parameter ");
            that._logger.log("internalerror", LOG_ID + "(updateChannelName) bad or empty 'channelName' parameter : ", channelName);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.updateChannel(channel.id, null, null,  null , null, channelName, null).then((channelUpdated : any) => {
                that._logger.log("info", LOG_ID + "(updateChannelName) channel updated ");
                that._logger.log("internalerror", LOG_ID + "(updateChannelName) channel updated : ", channelUpdated);

                let channelObj = that.addOrUpdateChannelToCache(channelUpdated);

                /*let foundIndex = that._channels.findIndex(channelItem => channelItem.id === channelUpdated.id);
                let channelObj : Channel = Channel.ChannelFactory()(channelUpdated, that._rest.http.serverURL);
                that._channels[foundIndex] = channelObj; */

                resolve(channelObj);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(updateChannelName) error ");
                that._logger.log("internalerror", LOG_ID + "(updateChannelName) error : ", err);
                return reject(err);
            });
        });
    };

    /**
     * @public
     * @method
     * @since 1.38
     * @category Channels MANAGEMENT
     * @instance
     * @description
     *    Update a channel<br>
     *      May be updated: name, topic, visibility, max_items and max_payload<br>
     *      Please put null to not update a property.<br>
     *    Return a promise. <br>
     * @param {string} id The id of the channel
     * @param {string} [channelTopic=""] The topic of the channel
     * @param {string} [visibility=public] public/company/closed group visibility for search
     * @param {Number} [max_items=30] max # of items to persist in the channel
     * @param {Number} [max_payload_size=60000] max # of items to persist in the channel
     * @param {string} [channelName=""] The name of the channel
     * @param {string} [category=""] The category of the channel
     * @return {Promise<Channel>} Return the channel created or an error
     */
    updateChannel( id : string, channelTopic : string, visibility : string, max_items : Number, max_payload_size : Number, channelName : string, category : string) {
        let that = this;

        if (!id) {
            that._logger.log("warn", LOG_ID + "(updateChannel) bad or empty 'id' parameter ");
            that._logger.log("internalerror", LOG_ID + "(updateChannel) bad or empty 'id' parameter : ", id);
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
                            that._logger.log("internal", LOG_ID + "(updateChannel) channel channelUpdated : ", channelUpdated);
                            let channelObj = that.addOrUpdateChannelToCache(channelUpdated);

                            that._logger.log("internal", LOG_ID + "(updateChannel) channel updated, channelObj : ", channelObj);
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
     * @category Channels MANAGEMENT
     * @instance
     * @description
     *    Update a channel visibility<br>
     *    Return a promise. <br>
     * @param {Channel} channel The channel to update
     * @param {string} visibility  The new channel visibility (closed or company)
     * @return {Promise<Channel>} Return the channel updated or an error
     */
    updateChannelVisibility(channel : Channel, visibility : string) {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(updateChannelVisibility) bad or empty 'channel' parameter ");
            that._logger.log("internalerror", LOG_ID + "(updateChannelVisibility) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!channel.id) {
            that._logger.log("warn", LOG_ID + "(updateChannelVisibility) bad or empty 'channel.id' parameter ");
            that._logger.log("internalerror", LOG_ID + "(updateChannelVisibility) bad or empty 'channel.id' parameter : ", channel.id);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!visibility) {
            that._logger.log("warn", LOG_ID + "(updateChannelVisibility) bad or empty 'visibility' parameter ");
            that._logger.log("internalerror", LOG_ID + "(updateChannelVisibility) bad or empty 'visibility' parameter : ", visibility);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let mode = visibility === "company" ? "company_public" : "company_closed";
        let name = channel.name;

        return new Promise((resolve, reject) => {

            that._rest.updateChannel(channel.id, null, null,  null , null, name, mode).then((channelUpdated : any) => {
                that._logger.log("internal", LOG_ID + "(updateChannelVisibility) channel updated : ", channelUpdated);

                let channelObj = that.addOrUpdateChannelToCache(channelUpdated);

                /*let foundIndex = that._channels.findIndex(channelItem => channelItem.id === channelUpdated.id);
                let channelObj : Channel = Channel.ChannelFactory()(channelUpdated, that._rest.http.serverURL);
                that._channels[foundIndex] = channelObj;
                */
                that._logger.log("internal", LOG_ID + "(updateChannelVisibility) channel updated : ", channelObj);

                resolve(channelObj);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(updateChannelVisibility) error ");
                that._logger.log("internalerror", LOG_ID + "(updateChannelVisibility) error : ", err);
                return reject(err);
            });
        });
    };

    /**
     * @public
     * @method updateChannelVisibilityToPublic
     * @since 1.55
     * @category Channels MANAGEMENT
     * @instance
     * @description
     *    Set the channel visibility to company (visible for users in that company)<br>
     *    Return a promise. <br>
     * @param {Channel} channel The channel to update
     * @return {Channel} Return the channel updated or an error
     */
    public updateChannelVisibilityToPublic(channel: Channel) {
        let that = this;
        return that.updateChannelVisibility(channel, "company");
    }

    /**
     * @public
     * @method updateChannelVisibilityToClosed
     * @since 1.55
     * @instance
     * @category Channels MANAGEMENT
     * @description
     *    Set the channel visibility to closed (not visible by users)<br>
     *    Return a promise. <br>
     * @param {Channel} channel The channel to update
     * @return {Channel} Return the channel updated or an error
     */
    public updateChannelVisibilityToClosed(channel: Channel) {
        let that = this;
        //channel.name = channel.name + "_updateToClosed";
        return that.updateChannelVisibility(channel, "closed");
    }

    /**
     * @public
     * @method
     * @since 1.43
     * @instance
     * @category Channels MANAGEMENT
     * @description
     *    Update a channel avatar<br>
     *    Return a promise. <br>
     * @param {Channel} channel The Channel to update
     * @param {string} urlAvatar  The avatar Url.  It must be resized to 512 pixels before calling this API.
     * @return {Channel} Return the channel updated or an error
     */
    updateChannelAvatar (channel : Channel, urlAvatar : string) {
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
                    let fileType = mimetypes.lookup(urlAvatar) + "";

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
     * @category Channels MANAGEMENT
     * @description
     *    Delete a channel avatar<br>
     *    Return a promise. <br>
     * @param {Channel} channel The channel to update
     * @return {Channel} Return the channel updated or an error
     */
    deleteChannelAvatar(channel : Channel) {
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
     * @private
     * @param channelId
     * @category Channels MANAGEMENT
     * @description
     *      GET A CHANNEL <br>
     */
    public getChannel(channelId: string): Promise<Channel> {
        let that = this;
        return new Promise((resolve, reject) => {
            that._rest.getChannel(channelId).then((channel) => {
                that._logger.log("info", LOG_ID + "(getChannel) channel found on the server");
                that._logger.log("internal", LOG_ID + "(getChannel) channel found on the server : ", channel);
                let channelObj : Channel = Channel.ChannelFactory()(channel, that._rest.http.serverURL);
                resolve(channelObj);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(getChannel) error ");
                that._logger.log("internalerror", LOG_ID + "(getChannel) error : ", err);
                return reject(err);
            });
        });
    };

    /**
     * @private
     * @param channelId
     * @category Channels MANAGEMENT
     * @description
     *      GET A CHANNEL FROM CACHE <br>
     */
    private getChannelFromCache(channelId: string): Channel {
        let channelFound = null;
        let that = this;
        that._logger.log("internal", LOG_ID + "(getChannelFromCache) search id : ", channelId);

        if (that._channels) {
            let channelFoundindex = that._channels.findIndex((channel) => {
                return channel.id === channelId;
            });
            if (channelFoundindex != -1) {
                that._logger.log("internal", LOG_ID + "(getChannelFromCache) channel found : ", that._channels[channelFoundindex], " with id : ", channelId);
                return that._channels[channelFoundindex];
            }
        }
        that._logger.log("internal", LOG_ID + "(getChannelFromCache) channel found : ", channelFound, " with id : ", channelId);
        return channelFound ;
    }

    private updateChannelsList(): void {
        let that = this;
        //that._logger.log("debug", LOG_ID + "(updateChannelsList) keys : ", Object.keys(that._channels));
        that._channelsList = that._channels.map((chnl) => { return chnl.id; });
        that._logger.log("internal", LOG_ID + "(updateChannelsList) that._channelsList : ", that._channelsList);
    }

    private addOrUpdateChannelToCache(channel: any): Channel {
        let that = this;
        let channelObj : Channel = Channel.ChannelFactory()(channel, that._rest.http.serverURL);
        let channelFoundindex = that._channels.findIndex((channelIter) => {
            return channelIter.id === channel.id;
        });
        if (channelFoundindex != -1) {
            that._logger.log("internal", LOG_ID + "(addOrUpdateChannelToCache) update in cache with channel : ", channel, ", at channelFoundindex : ", channelFoundindex);
            //that._channels.splice(channelFoundindex,1,channelObj);
            //channelCached = channelObj;
            that._logger.log("internal", LOG_ID + "(addOrUpdateChannelToCache) in update that._channels : ", that._channels);
            that._channels[channelFoundindex].updateChannel(channel);
            channelObj = that._channels[channelFoundindex];
        } else {
            that._logger.log("internal", LOG_ID + "(addOrUpdateChannelToCache) add in cache channelObj : ", channelObj);
            that._channels.push(channelObj);
        }
        that.updateChannelsList();
        return channelObj;
    }

    private removeChannelFromCache(channelId: string): Promise<Channel> {
        let that = this;
        return new Promise((resolve, reject) => {
            // Get the channel to remove
            let channelToRemove = that.getChannelFromCache(channelId);
            if (channelToRemove) {
                // Store channel name
                //let channelName = channelToRemove.name;

                // Handle invitation channel
                if (channelToRemove.invited) { that.decrementInvitationCounter(); }

                // Remove from channels
                let channelId = channelToRemove.id;

                that._logger.log("internal", LOG_ID + "(removeChannelFromCache) remove from cache channelId : ", channelId);
                that._channels = that._channels.filter( function(chnl) {
                    return !(chnl.id === channelId);
                });

                that.updateChannelsList();

                // Update messagesList
                //that.feedChannel.messages = [];
                that.retrieveLatests()
                        .then(() => { resolve(channelToRemove); })
                        .catch((err) => {
                            that._logger.log("error", LOG_ID + "(removeChannelFromCache) error retrieveLatests ");
                            that._logger.log("internalerror", LOG_ID + "(removeChannelFromCache) error retrieveLatests : ", err);
                            return reject(err);
                        });
            } else {
                resolve(null);
            }
        });
    }

    //endregion Channels MANAGEMENT

    //region Channels MESSAGES/ITEMS

    /**
     * @public
     * @method publishMessageToChannel
     * @instance
     * @async
     * @category Channels MESSAGES/ITEMS
     * @param {Channel} channel The channel where to publish the message
     * @param {string} message Message content
     * @param {string} [title = "", limit=256] Message title
     * @param {string} [url = ""] An URL
     * @param {any} [imagesIds = null] An Array of ids of the files stored in Rainbow
     * @param {string} [type="basic"] An optional message content type (could be basic, markdown, html or data)
     * @return {Promise<ErrorManager.getErrorManager().OK>} OK if successfull
     * @description
     *  Publish to a channel <br>
     */
    publishMessageToChannel(channel : Channel, message : string, title : string, url : string, imagesIds : any, type : string) : Promise<{}> {
        let that = this;
        return that.createItem(channel, message, title, url, imagesIds, type);
    }

    /**
     * @public
     * @method createItem
     * @instance
     * @async
     * @category Channels MESSAGES/ITEMS
     * @param {Channel} channel The channel where to publish the message
     * @param {string} message Message content
     * @param {string} [title = "", limit=256] Message title
     * @param {string} [url = ""] An URL
     * @param {any} imagesIds An Array of ids of the files stored in Rainbow
     * @param {string} [type="basic"] An optional message content type (could be basic, markdown, html or data)
     * @return {Promise<ErrorManager.getErrorManager().OK>} OK if successfull
     * @description
     *  Publish to a channel <br>
     */
    createItem(channel : Channel, message : string, title : string, url : string, imagesIds : any, type : string) : Promise <{}> {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(createItem) bad or empty 'channel' parameter ");
            that._logger.log("internalerror", LOG_ID + "(createItem) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }
        if (!message) {
            that._logger.log("warn", LOG_ID + "(createItem) bad or empty 'title' parameter ");
            that._logger.log("internalerror", LOG_ID + "(createItem) bad or empty 'title' parameter : ", title);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (imagesIds && typeof imagesIds !== "object" && imagesIds.length < 1) {
            that._logger.log("warn", LOG_ID + "(createItem) bad or empty 'imagesIds' parameter ");
            that._logger.log("internalerror", LOG_ID + "(createItem) bad or empty 'imagesIds' parameter : ", imagesIds);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (type && ["basic", "markdown", "html", "data"].indexOf(type) === -1) {
            that._logger.log("warn", LOG_ID + "(createItem) bad or empty 'type' parameter ", type, " \"Parameter 'type' could be 'basic', 'markdown', 'html' or 'data'\"");
            return Promise.reject(ErrorManager);
        }


        return new Promise((resolve, reject) => {
            type = type ? "urn:xmpp:channels:" + type : "urn:xmpp:channels:basic";

            that._rest.publishMessage(channel.id, message, title, url, imagesIds, type).then((status) => {
                that._logger.log("info", LOG_ID + "(createItem) message published");
                that._logger.log("internal", LOG_ID + "(createItem) message published : ", status);
                resolve(Object.assign({"publishResult" : status}, ErrorManager.getErrorManager().OK));
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(createItem) error ");
                that._logger.log("internalerror", LOG_ID + "(createItem) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method getMessagesFromChannel
     * @instance
     * @async
     * @category Channels MESSAGES/ITEMS
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the fetchChannelItems method instead,
     * @param {Channel} channel The channel
     * @return {Promise<Object[]>} The list of messages received
     * @description
     *  Retrieve the last messages from a channel <br>
     */
    getMessagesFromChannel (channel : Channel) {
        let that = this;
        return that.fetchChannelItems(channel);
    }

    /**
     * @public
     * @method fetchChannelItems
     * @instance
     * @async
     * @category Channels MESSAGES/ITEMS
     * @param {Channel} channel The channel
     * @param {number} maxMessages=100 [optional] number of messages to get, 100 by default
     * @param {Date} beforeDate [optional] - show items before a specific timestamp (ISO 8601 format)
     * @param {Date} afterDate [optional] - show items after a specific timestamp (ISO 8601 format)
     * @return {Promise<Object[]>} The list of messages received
     * @description
     *  Retrieve the last maxMessages messages from a channel <br>
     */
    public fetchChannelItems (channel : Channel, maxMessages: number = 100, beforeDate?: Date, afterDate?: Date) : Promise<Array<any>>{
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(fetchChannelItems) bad or empty 'channel' parameter");
            that._logger.log("internalerror", LOG_ID + "(fetchChannelItems) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise( (resolve, reject) => {
            if (!beforeDate) {
                beforeDate = new Date();
            }

            that._rest.getChannelMessages(channel.id, maxMessages, beforeDate, afterDate).then((res : any) => {
                that._logger.log("info", LOG_ID + "(fetchChannelItems) messages retrieved", res);

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
                that._logger.log("error", LOG_ID + "(fetchChannelItems) error ");
                that._logger.log("internalerror", LOG_ID + "(fetchChannelItems) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method deleteMessageFromChannel
     * @instance
     * @async
     * @category Channels MESSAGES/ITEMS
     * @deprecated [#1] since version 1.55 [#2]. <br>
     * [#3] Will be deleted in future version <br>
     * [#4] In case you need similar behavior use the deleteItemFromChannel method instead, <br>
     * @param  {string} channelId The Id of the channel
     * @param  {string} messageId The Id of the message
     * @return {Promise<Channel>} The channel updated
     * @description
     *  Delete a message from a channel <br>
     */
    deleteMessageFromChannel(channelId : string, messageId : string) {
        let that = this;
        return that.deleteItemFromChannel(channelId, messageId);
    }

    /**
     * @public
     * @method deleteItemFromChannel
     * @instance
     * @async
     * @category Channels MESSAGES/ITEMS
     * @param  {string} channelId The Id of the channel
     * @param  {string} itemId The Id of the item
     * @return {Promise<Channel>} The channel updated
     * @description
     *  Delete a message from a channel <br>
     */
    public deleteItemFromChannel (channelId : string, itemId : string) : Promise<Channel> {
        let that = this;
        if (!channelId ) {
            that._logger.log("error", LOG_ID + "(deleteItemFromChannel) bad or empty 'channelId' parameter");
            that._logger.log("internalerror", LOG_ID + "(deleteItemFromChannel) bad or empty 'channelId' parameter : ", channelId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!itemId) {
            that._logger.log("error", LOG_ID + "(deleteItemFromChannel) bad or empty 'itemId' parameter");
            that._logger.log("internalerror", LOG_ID + "(deleteItemFromChannel) bad or empty 'itemId' parameter : ", itemId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise( (resolve, reject) => {

            that._rest.deleteChannelMessage(channelId, itemId).then((result) => {
                that._logger.log("info", LOG_ID + "(deleteItemFromChannel) channel message deletion");
                that._logger.log("internal", LOG_ID + "(deleteItemFromChannel) channel message deletion : ", result);

                that._rest.getChannel(channelId).then((updatedChannel : any) => {
                    // Update local channel
                    let channelObj = that.addOrUpdateChannelToCache(updatedChannel);
                    /*let foundIndex = that._channels.findIndex(channelItem => channelItem.id === updatedChannel.id);
                    let channelObj : Channel = Channel.ChannelFactory()(updatedChannel, that._rest.http.serverURL);
                    that._channels[foundIndex] = channelObj;
                     */
                    resolve(channelObj);
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(deleteItemFromChannel) error getChannel ");
                    that._logger.log("internalerror", LOG_ID + "(deleteItemFromChannel) error getChannel : ", err);
                    return reject(err);
                });
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(deleteItemFromChannel) error ");
                that._logger.log("internalerror", LOG_ID + "(deleteItemFromChannel) error : ", err);
                return reject(err);
            });
        });

    }

    /**
     * @public
     * @method likeItem
     * @instance
     * @async
     * @category Channels MESSAGES/ITEMS
     * @param  {Channel} channel The channel where the item must be liked.
     * @param  {string} itemId The Id of the item
     * @param {Appreciation} appreciation Appreciation value - must be one of the value specified in Appreciation object.
     * @return {Promise<any>}
     * @description
     *  To like an Channel Item with the specified appreciation <br>
     */
    public likeItem( channel : Channel, itemId : string, appreciation : Appreciation): Promise<any> {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(likeItem) bad or empty 'channel' parameter ");
            that._logger.log("internalerror", LOG_ID + "(likeItem) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!itemId) {
            that._logger.log("error", LOG_ID + "(likeItem) bad or empty 'itemId' parameter");
            that._logger.log("internalerror", LOG_ID + "(likeItem) bad or empty 'itemId' parameter : ", itemId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!appreciation) {
            that._logger.log("error", LOG_ID + "(likeItem) bad or empty 'appreciation' parameter");
            that._logger.log("internalerror", LOG_ID + "(likeItem) bad or empty 'appreciation' parameter : ", appreciation);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {
            that._rest.likeItem(channel.id, itemId, appreciation).then((result) => {
                that._logger.log("info", LOG_ID + "(likeItem) done on the server");
                that._logger.log("internal", LOG_ID + "(likeItem) done on the server : ", result);
                //let channelObj : Channel = Channel.ChannelFactory()(channel, that._rest.http.serverURL);
                //resolve(channelObj);
                resolve(result);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(likeItem) error ");
                that._logger.log("internalerror", LOG_ID + "(likeItem) error : ", err);
                return reject(err);
            });
        });
    };

    /**
     * @public
     * @method getDetailedAppreciations
     * @instance
     * @async
     * @category Channels MESSAGES/ITEMS
     * @param  {Channel} channel The channel where the item appreciations must be retrieved.
     * @param  {string} itemId The Id of the item
     * @return {Promise<any>}
     * @description
     *  To know in details apprecations given on a channel item (by userId the apprecation given) <br>
     */
    public getDetailedAppreciations( channel : Channel, itemId : string): Promise<any> {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(getDetailedAppreciations) bad or empty 'channel' parameter ");
            that._logger.log("internalerror", LOG_ID + "(getDetailedAppreciations) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!itemId) {
            that._logger.log("error", LOG_ID + "(getDetailedAppreciations) bad or empty 'itemId' parameter");
            that._logger.log("internalerror", LOG_ID + "(getDetailedAppreciations) bad or empty 'itemId' parameter : ", itemId);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {
            that._rest.getDetailedAppreciations(channel.id, itemId).then((result) => {
                that._logger.log("info", LOG_ID + "(getDetailedAppreciations) done on the server");
                that._logger.log("internal", LOG_ID + "(getDetailedAppreciations) done on the server : ", result);
                //let channelObj : Channel = Channel.ChannelFactory()(channel, that._rest.http.serverURL);
                //resolve(channelObj);
                resolve(result);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(getDetailedAppreciations) error ");
                that._logger.log("internalerror", LOG_ID + "(getDetailedAppreciations) error : ", err);
                return reject(err);
            });
        });
    };

    public retrieveLatests(beforeDate: Date = null): Promise<any> {
        let that = this;
        return that._rest.getLatestMessages(10, beforeDate, null).then((messages: any) => {
            // TODO : that.feedChannel.messages.push.apply(that.feedChannel.messages, messages);
            return messages.length;
        });
    }

    //endregion Channels MESSAGES/ITEMS

    //region Channels SUBSCRIPTION

    /**
     * @public
     * @method getAllSubscribedChannel
     * @instance
     * @category Channels SUBSCRIPTION
     * @deprecated [#1] since version 1.55 [#2].
     * [#3] Will be deleted in future version
     * [#4] In case you need similar behavior use the getAllSubscribedChannels method instead,
     * @return {Channel[]} An array of channels (subscribed only)
     * @description
     *  Return the list of subscribed channels only <br>
     */
    getAllSubscribedChannel() {
        let that = this;
        return that.getAllSubscribedChannels();
    }

    /**
     * @public
     * @method getAllSubscribedChannels
     * @instance
     * @category Channels SUBSCRIPTION
     * @return {Channel[]} An array of channels (subscribed only)
     * @description
     *  Return the list of subscribed channels only <br>
     */
    getAllSubscribedChannels() : [Channel] {
        let that = this;
        return that._channels.filter((channel) => {
            return channel.creatorId !== that._rest.userId;
        });
    }

    /**
     * @public
     * @method subscribeToChannel
     * @instance
     * @async
     * @category Channels SUBSCRIPTION
     * @param {Channel} channel The channel to subscribe
     * @return {Promise<Channel>} The channel updated with the new subscription
     * @description
     *  Subscribe to a public channel <br>
     */
    subscribeToChannel(channel : Channel) : Promise<Channel> {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(subscribeToChannel) bad or empty 'channel' parameter ");
            that._logger.log("internalerror", LOG_ID + "(subscribeToChannel) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.subscribeToChannel(channel.id).then((status) => {
                that._logger.log("info", LOG_ID + "(subscribeToChannel) channel subscribed : ", status);

                that.fetchChannel(channel.id, true).then((channelUpdated) => {
                    resolve(channelUpdated);
                });
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(subscribeToChannel) error ");
                that._logger.log("internalerror", LOG_ID + "(subscribeToChannel) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method
     * @since 1.47
     * @instance
     * @category Channels SUBSCRIPTION
     * @description
     *    Subscribe to a channel using its id<br>
     *    Return a promise. <br>
     * @param {string} id The id of the channel
     * @return {Object} Nothing or an error object depending on the result
     */
    subscribeToChannelById (id : string) {
        let that = this;
        if (!id) {
            that._logger.log("warn", LOG_ID + "(subscribeToChannel) bad or empty 'id' parameter ");
            that._logger.log("internalerror", LOG_ID + "(subscribeToChannel) bad or empty 'id' parameter : ", id);
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
     * @category Channels SUBSCRIPTION
     * @param {Channel} channel The channel to unsubscribe
     * @return {Promise<string>} The status of the unsubscribe.
     * @description
     *  Unsubscribe from a public channel <br>
     */
    unsubscribeFromChannel(channel : Channel) : Promise<string> {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(unsubscribeFromChannel) bad or empty 'channel' parameter ");
            that._logger.log("internalerror", LOG_ID + "(unsubscribeFromChannel) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.unsubscribeToChannel(channel.id).then((status : string) => {
                that._logger.log("info", LOG_ID + "(unsubscribeFromChannel) channel unsubscribed : ", status);
                resolve(status);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(unsubscribeFromChannel) error ");
                that._logger.log("internalerror", LOG_ID + "(unsubscribeFromChannel) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Channels SUBSCRIPTION

    //region Channels USERS

    /**
     * @public
     * @method fetchChannelUsers
     * @instance
     * @async
     * @category Channels USERS
     * @deprecated [#1] since version 1.55 [#2]. <br>
     * [#3] Will be deleted in future version <br>
     * [#4] In case you need similar behavior use the fetchChannelUsers method instead, <br>
     * @param {Channel} channel The channel
     * @param {Object} [options] A filter parameter
     * @param {Number} [options.page = 0] Display a specific page of results
     * @param {Number} [options.limit=100] Number of results per page (max 1000)
     * @param {Boolean} [options.onlyPublishers=false] Filter to publishers only
     * @param {Boolean} [options.onlyOwners=false] Filter to owners only
     * @return {Promise<Array<any>>} An array of users who belong to this channel
     * @description
     *  Get a pagined list of users who belongs to a channel <br>
     */
    getUsersFromChannel(channel: Channel, options: any) {
        let that = this;
        return that.fetchChannelUsers(channel, options);
    }

    /**
     * @public
     * @method fetchChannelUsers
     * @instance
     * @async
     * @category Channels USERS
     * @param {Channel} channel The channel
     * @param {Object} [options] A filter parameter
     * @param {Number} [options.page = 0] Display a specific page of results
     * @param {Number} [options.limit=100] Number of results per page (max 1000)
     * @param {Boolean} [options.onlyPublishers=false] Filter to publishers only
     * @param {Boolean} [options.onlyOwners=false] Filter to owners only
     * @return {Promise<Array<any>>} An array of users who belong to this channel
     * @description
     *  Get a pagined list of users who belongs to a channel <br>
     */
    public fetchChannelUsers(channel : Channel, options : any) : Promise<Array<{}>> {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(fetchChannelUsers) bad or empty 'channel' parameter");
            that._logger.log("internalerror", LOG_ID + "(fetchChannelUsers) bad or empty 'channel' parameter : ", channel);
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

            that._rest.getChannelUsers(channel.id, json).then((users : []) => {
                that._logger.log("info", LOG_ID + "(fetchChannelUsers) channel has users ");
                that._logger.log("internal", LOG_ID + "(fetchChannelUsers) channel has users : ", users.length);
                resolve(users);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(fetchChannelUsers) error ");
                that._logger.log("internalerror", LOG_ID + "(fetchChannelUsers) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method removeAllUsersFromChannel
     * @instance
     * @async
     * @category Channels USERS
     * @deprecated [#1] since version 1.55 [#2]. <br>
     * [#3] Will be deleted in future version <br>
     * [#4] In case you need similar behavior use the deleteAllUsersFromChannel method instead, <br>
     * @param {Channel} channel The channel
     * @return {Promise<Channel>} The channel updated
     * @description
     *  Remove all users from a channel <br>
     */
    removeAllUsersFromChannel(channel : Channel) {
        let that = this;
        return that.deleteAllUsersFromChannel(channel);
    }
    /**
     * @public
     * @method deleteAllUsersFromChannel
     * @instance
     * @async
     * @category Channels USERS
     * @param {Channel} channel The channel
     * @return {Promise<Channel>} The channel updated
     * @description
     *  Remove all users from a channel <br>
     */
    public deleteAllUsersFromChannel(channel : Channel) : Promise<Channel> {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(deleteAllUsersFromChannel) bad or empty 'channel' parameter");
            that._logger.log("internalerror", LOG_ID + "(deleteAllUsersFromChannel) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            that._rest.deleteAllUsersFromChannel(channel.id).then((result) => {
                that._logger.log("info", LOG_ID + "(deleteAllUsersFromChannel) channel users deletion");
                that._logger.log("internal", LOG_ID + "(deleteAllUsersFromChannel) channel users deletion : ", result);

                that._rest.getChannel(channel.id).then((updatedChannel : any) => {
                    // Update local channel
                    let channelObj = that.addOrUpdateChannelToCache(updatedChannel);
                    /*let foundIndex = that._channels.findIndex(channelItem => channelItem.id === updatedChannel.id);
                    let channelObj : Channel = Channel.ChannelFactory()(updatedChannel, that._rest.http.serverURL);
                    that._channels[foundIndex] = channelObj;
                     */
                    resolve(channelObj);
                });

            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(deleteAllUsersFromChannel) error ");
                that._logger.log("internalerror", LOG_ID + "(deleteAllUsersFromChannel) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @public
     * @method updateChannelUsers
     * @instance
     * @async
     * @category Channels USERS
     * @param {Channel} channel The channel 
     * @param {Array<any>} users The users of the channel
     * @return {Promise<Channel>} Update Channel Users status
     * @description
     *  Update a collection of channel users
     */
    public updateChannelUsers(channel : Channel, users: Array<any>) : Promise<Channel> {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(updateChannelUsers) bad or empty 'channel' parameter");
            that._logger.log("internalerror", LOG_ID + "(updateChannelUsers) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let channelId = channel.id;
        return new Promise((resolve, reject) => {
            //that._logger.log("internal", LOG_ID + "(updateChannelUsers) that._channels : ", that._channels);
            that._rest.updateChannelUsers(channelId, users).then((res) => {
                that._logger.log("info", LOG_ID + "(updateChannelUsers) channel users updated");
                that._logger.log("internal", LOG_ID + "(updateChannelUsers) channel users updated : ", res);

                that._rest.getChannel(channelId).then((updatedChannel : any) => {
                    // Update local channel
                    let channelObj = that.addOrUpdateChannelToCache(updatedChannel);

                    /*let foundIndex = that._channels.findIndex(channelItem => channelItem.id === updatedChannel.id);
                    let channelObj : Channel = Channel.ChannelFactory()(updatedChannel, that._rest.http.serverURL);
                    that._channels[foundIndex] = channelObj;
                     */
                    that._logger.log("internal", LOG_ID + "(updateChannelUsers) channel updated : ", channelObj);
                    resolve(channelObj);
                });
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(updateChannelUsers) error ");
                that._logger.log("internalerror", LOG_ID + "(updateChannelUsers) error : ", err);
                return reject(err);
            });
        });
    }
    
    /**
     * @public
     * @method addOwnersToChannel
     * @instance
     * @async
     * @category Channels USERS
     * @param {Channel} channel The channel
     * @param {Array<any>}owners
     * @return {Promise<Channel>} The updated channel
     * @description
     *  Add a list of owners to the channel <br>
     */
    public addOwnersToChannel(channel : Channel, owners: any[]) : Promise<Channel>  {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(addOwnersToChannel) bad or empty 'channel' parameter");
            that._logger.log("internalerror", LOG_ID + "(addOwnersToChannel) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!owners) {
            that._logger.log("warn", LOG_ID + "(addOwnersToChannel) bad or empty 'owners' parameter");
            that._logger.log("internalerror", LOG_ID + "(addOwnersToChannel) bad or empty 'owners' parameter : ", owners);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let usersId = [];

        owners.forEach((user) => {
            usersId.push({"id": user.id, "type": "owner"});
        });

        return that.updateChannelUsers(channel, usersId);
    }

    /**
     * @public
     * @method addPublishersToChannel
     * @instance
     * @async
     * @category Channels USERS
     * @param {Channel} channel The channel
     * @param {Array<Contact>} publishers The list of Contacts to add as publisher to channel.
     * @return {Promise<Channel>} The updated channel
     * @description
     *  Add a list of publishers to the channel <br>
     */
    public addPublishersToChannel(channel : Channel, publishers : Array<Contact>) : Promise<Channel> {
        let that = this;
        if (!channel || !channel.id ) {
            that._logger.log("warn", LOG_ID + "(addPublishersToChannel) bad or empty 'channel' parameter");
            that._logger.log("internalerror", LOG_ID + "(addPublishersToChannel) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!publishers || !(publishers.length > 0)) {
            that._logger.log("warn", LOG_ID + "(addPublishersToChannel) bad or empty 'publishers' parameter");
            that._logger.log("internalerror", LOG_ID + "(addPublishersToChannel) bad or empty 'publishers' parameter : ", publishers);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let usersId = [];

        publishers.forEach((user) => {
            usersId.push({"id": user.id, "type": "publisher"});
        });

        return that.updateChannelUsers(channel, usersId);
    }

    /**
     * @public
     * @method addMembersToChannel
     * @instance
     * @async
     * @category Channels USERS
     * @param {Channel} channel The channel
     * @param {Array<Contact>} members array of users to add
     * @return {Promise<Channel>} The updated channel
     * @description
     *  Add a list of members to the channel <br>
     */
    public async addMembersToChannel(channel : Channel, members : Array<Contact>) : Promise<Channel> {
        let that = this;
        //that._logger.log("internal", LOG_ID + "(addMembersToChannel) that._channels : ", that._channels);
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(addMembersToChannel) bad or empty 'channel' parameter");
            that._logger.log("internalerror", LOG_ID + "(addMembersToChannel) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!members) {
            that._logger.log("warn", LOG_ID + "(addMembersToChannel) bad or empty 'members' parameter");
            that._logger.log("internalerror", LOG_ID + "(addMembersToChannel) bad or empty 'members' parameter : ", members);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let usersId: Array<any> = [];

        members.forEach((user) => {
            if (user) {
                usersId.push({"id": user.id, "type": "member"});
            }
        });

        if (!(usersId.length > 0)) {
            that._logger.log("warn", LOG_ID + "(addMembersToChannel) bad or empty 'members' parameter");
            that._logger.log("internalerror", LOG_ID + "(addMembersToChannel) bad or empty 'members' parameter : ", members);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return that.updateChannelUsers(channel, usersId);
    }

    /**
     * @public
     * @method removeUsersFromChannel1
     * @instance
     * @async
     * @category Channels USERS
     * @deprecated [#1] since version 1.55 [#2]. <br>
     * [#3] Will be deleted in future version <br>
     * [#4] In case you need similar behavior use the deleteUsersFromChannel method instead, <br>
     * @param {Channel} channel The channel
     * @param {Array<Contact>} users An array of users to remove
     * @return {Promise<Channel>} The updated channel
     * @description
     *  Remove a list of users from a channel <br>
     */
    removeUsersFromChannel1(channel : Channel, users: Array<Contact>) {
        let that = this;
        return that.deleteUsersFromChannel(channel, users);
    }
    /**
     * @public
     * @method deleteUsersFromChannel
     * @instance
     * @async
     * @category Channels USERS
     * @param {Channel} channel The channel
     * @param {Array<Contact>} users An array of users to remove
     * @return {Promise<Channel>} The updated channel
     * @description
     *  Remove a list of users from a channel <br>
     */
    public deleteUsersFromChannel(channel : Channel, users : Array<Contact>) : Promise<Channel> {
        let that = this;
        if (!channel || !channel.id) {
            that._logger.log("warn", LOG_ID + "(deleteUsersFromChannel) bad or empty 'channel' parameter");
            that._logger.log("internalerror", LOG_ID + "(deleteUsersFromChannel) bad or empty 'channel' parameter : ", channel);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!users) {
            that._logger.log("warn", LOG_ID + "(deleteUsersFromChannel) bad or empty 'publishers' parameter");
            that._logger.log("internalerror", LOG_ID + "(deleteUsersFromChannel) bad or empty 'publishers' parameter : ", users);
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        let usersId = [];

        users.forEach((user) => {
            usersId.push({"id": user.id, "type": "none"});
        });

        return that.updateChannelUsers(channel, usersId);
    }

    //endregion Channels USERS

    //region Events
    
    _onChannelMessageReceived(message: any) {
        let that = this;
        that.fetchChannel(message.channelId).then((channel) => {
            message.channel = channel;
            delete message.channelId;
            that._eventEmitter.emit("evt_internal_channelmessagereceived", message);
        });
    }

    _onChannelMyAppreciationReceived(my_appreciation : any) {
        let that = this;
        that.fetchChannel(my_appreciation.channelId).then((channel) => {
            let appreciationObj = {
                "appreciation": Appreciation.None,
                "channel":channel,
                "messageId":my_appreciation.messageId,
                "appreciations":my_appreciation.appreciations
            };

            switch (my_appreciation.appreciation) {
                case "applause":
                    appreciationObj.appreciation = Appreciation.Applause;
                break;
                case "doubt":
                    appreciationObj.appreciation = Appreciation.Doubt;
                break;
                case "fantastic":
                    appreciationObj.appreciation = Appreciation.Fantastic;
                break;
                case "happy":
                    appreciationObj.appreciation = Appreciation.Happy;
                break;
                case "like":
                    appreciationObj.appreciation = Appreciation.Like;
                break;
                case "none":
                    appreciationObj.appreciation = Appreciation.None;
                break;
            }

            that._eventEmitter.emit("evt_internal_channelmyappreciationreceived", appreciationObj);
        });
    }

    /****************************************************************/
    /*** MANAGEMENT EVENT HANDLER                                 ***/
    /****************************************************************/
    private onAvatarChange(channelId: string, avatar: any): void {
        /*
        let action = avatar.attr("action");
        let updateDate: Date = avatar.attr("lastAvatarUpdateDate") ? new Date(avatar.attr("lastAvatarUpdateDate")) : null;
        that.$log.info("[channelService] onChannelManagementReceived -- " + action + " avatar for " + channelId);
        if (action === "delete" || action === "update") {
            let channel: Channel = that.getChannelFromCache(channelId);
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

        that._logger.log("debug", LOG_ID + "(onUpdateToChannel) channelId : ", channelId);
        // Get channel from cache
        //let channel = that.getChannelFromCache(channelId);

        // Get channel from server
        that.getChannel(channelId)
                .then((newChannel) => {
                    let channelObj : Channel = that.addOrUpdateChannelToCache(newChannel);
                    /*if (newChannel.invited) {
                        let channelObj : Channel = that.addOrUpdateChannelToCache(newChannel);
                        that._eventEmitter.emit("rainbow_channelcreated", {'id': newChannel.id});
                        //that.$rootScope.$broadcast(that.CHANNEL_UPDATE_EVENT, that.LIST_EVENT_TYPE.ADD, newChannel.id);
                    } else { // */
                    that._eventEmitter.emit("evt_internal_channelupdated", {"id": channelObj.id, "kind" : that.LIST_EVENT_TYPE.ADD.code, "label" : that.LIST_EVENT_TYPE.ADD.label});
                    //}
                });
    }

    public  onAddToChannel(channelInfo: {id:string}): void {
        let that = this;
        let channelId = channelInfo.id;
        that._logger.log("debug", LOG_ID + "(onAddToChannel) channelId : ", channelId);
        //that._logger.log("internal", LOG_ID + "(onAddToChannel) that._channels : ", that._channels);

        // Get channel from cache
        let channel = that.getChannelFromCache(channelId);

        // Get channel from server
        that.getChannel(channelId)
                .then((newChannel) => {

                    // Handle channel creation
                    if (!channel && !newChannel.invited) {
                        let channelObj : Channel = that.addOrUpdateChannelToCache(newChannel);
                        //that.$rootScope.$broadcast(that.CHANNEL_UPDATE_EVENT, that.LIST_EVENT_TYPE.ADD, newChannel.id);
                        //that._logger.log("debug", LOG_ID + "(onAddToChannel) rainbow_channelcreated : ", channelObj.id);
                        that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelObj.id, "kind" : that.LIST_EVENT_TYPE.ADD.code, "label" : that.LIST_EVENT_TYPE.ADD.label});
                    }

                    // Handle channel invitation
                    else if (!channel && newChannel.invited) {
                        let channelObj : Channel = that.addOrUpdateChannelToCache(newChannel);
                        that.incrementInvitationCounter();
                        //that._logger.log("debug", LOG_ID + "(onAddToChannel) evt_internal_channelupdated : ", channelObj.id, "kind : ", that.LIST_EVENT_TYPE.SUBSCRIBE);
                        that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelObj.id, "kind" : that.LIST_EVENT_TYPE.SUBSCRIBE.code, "label" : that.LIST_EVENT_TYPE.SUBSCRIBE.label});
                        //that.$rootScope.$broadcast(that.CHANNEL_UPDATE_EVENT, that.LIST_EVENT_TYPE.SUBSCRIBE, newChannel.id);
                    }

                    // Handle change role
                    else if (channel && newChannel.userRole !== that.USER_ROLE.NONE) {
                        channel.userRole = newChannel.userRole;
                        // TODO : that.feedChannel.messages = [];
                        that.retrieveLatests()
                                .then(() => {
                                    //that._logger.log("debug", LOG_ID + "(onAddToChannel) retrieveLatests evt_internal_channelupdated : ", channelId, "kind : ", that.LIST_EVENT_TYPE.SUBSCRIBE);
                                    that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelId, "kind" : that.LIST_EVENT_TYPE.SUBSCRIBE.code, "label" : that.LIST_EVENT_TYPE.SUBSCRIBE.label});
                                    //that.$rootScope.$broadcast(that.CHANNEL_UPDATE_EVENT, that.LIST_EVENT_TYPE.SUBSCRIBE, channelId);
                                });
                    }

                });
    }

    private async onRemovedFromChannel(channelInfo : {id : string}): Promise<any> {
        let that = this;
        let channelId = channelInfo.id;
        that._logger.log("debug", LOG_ID + "(onRemovedFromChannel) channelId : ", channelId);
        let channelDeleted = await that.removeChannelFromCache(channelId);
        let channelIdDeleted = channelDeleted ? channelDeleted.id : channelInfo.id;
        that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelIdDeleted, "kind" : that.LIST_EVENT_TYPE.DELETE.code, "label" : that.LIST_EVENT_TYPE.DELETE.label});
        //that.$rootScope.$broadcast(that.CHANNEL_UPDATE_EVENT, that.LIST_EVENT_TYPE.DELETE, channelId);
    }

    private onSubscribeToChannel(channelInfo: {'id': string, 'subscribers' : string}): void {
        let that = this;
        let channelId: string = channelInfo.id;
        let subscribersInfo: string = channelInfo.subscribers;
        that._logger.log("internal", LOG_ID + "(onSubscribeToChannel) channelId : ", channelId, ", subscribersInfo : ", subscribersInfo);
        // Handle invitation case
        let channel = that.getChannelFromCache(channelId);
        let subscribers = Number.parseInt(subscribersInfo);
        if (channel) {
            channel.invited = false;
            channel.subscribed = true;
            channel.subscribers_count = subscribers;
            that.retrieveLatests()
                    .then(() => {
                        that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelId, "kind" : that.LIST_EVENT_TYPE.SUBSCRIBE.code, "label" : that.LIST_EVENT_TYPE.SUBSCRIBE.label});
                        //that.$rootScope.$broadcast(that.CHANNEL_UPDATE_EVENT, that.LIST_EVENT_TYPE.SUBSCRIBE, channelId);
                    });
        }

        // Handle self subscription case
        else {
            that.getChannel(channelId)
                    .then((newChannel) => {
                        that.addOrUpdateChannelToCache(newChannel);
                        return that.retrieveLatests();
                    })
                    .then(() => {
                        that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelId, "kind" : that.LIST_EVENT_TYPE.SUBSCRIBE.code, "label" : that.LIST_EVENT_TYPE.SUBSCRIBE.label});
                        //that.$rootScope.$broadcast(that.CHANNEL_UPDATE_EVENT, that.LIST_EVENT_TYPE.SUBSCRIBE, channelId);
                    });
        }
    }

    private async onUnsubscribeToChannel(channelInfo: {'id': string, 'subscribers' : string}): Promise<void> {
        let that = this;
        let channelId: string = channelInfo.id;
        let subscribersInfo: string = channelInfo.subscribers;
        that._logger.log("internal", LOG_ID + "(onUnsubscribeToChannel) channelId : ", channelId, ", subscribersInfo : ", subscribersInfo);
        let subscribers = Number.parseInt(subscribersInfo);
        let channel  : Channel = await that.fetchChannel(channelId);
        if (channel) {
            channel.subscribers_count = subscribers;
            channel.subscribed = false;
        }

        // Update messagesList
        //that.feedChannel.messages = [];
        that.retrieveLatests().then(() => {
            that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelId, "kind" : that.LIST_EVENT_TYPE.UNSUBSCRIBE.code, "label" : that.LIST_EVENT_TYPE.UNSUBSCRIBE.label});
            //that.$rootScope.$broadcast(that.CHANNEL_UPDATE_EVENT, that.LIST_EVENT_TYPE.UNSUBSCRIBE, channelId);
        });
    }

    private async onDeleteChannel(channelInfo : {id : string}): Promise<any> {
        let that = this;
        let channelId: string = channelInfo.id;
        that._logger.log("debug", LOG_ID + "(onDeleteChannel) channelId : ", channelId);
        let channelDeleted = await that.removeChannelFromCache(channelId);
        let channelIdDeleted = channelDeleted ? channelDeleted.id : channelInfo.id;

        that._eventEmitter.emit("evt_internal_channelupdated", {'id': channelIdDeleted, "kind" : that.LIST_EVENT_TYPE.DELETE.code, "label" : that.LIST_EVENT_TYPE.DELETE.label});
        //that.$rootScope.$broadcast(that.CHANNEL_UPDATE_EVENT, that.LIST_EVENT_TYPE.DELETE, channelId);
    }

    private async onUserSubscribeEvent(info : {id: string, userId: string, 'subscribers': number}) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(onUserSubscribeEvent) channelId : ", info.id, ", subscribersInfo : ", info.subscribers);
        let channel : Channel = await that.fetchChannel(info.id);
        if (channel) {
            channel.subscribers_count = info.subscribers;
        }

        that._eventEmitter.emit("evt_internal_channelusersubscription", {'id': info.id, 'userId': info.userId, "kind" : that.LIST_EVENT_TYPE.SUBSCRIBE.code, "label" : that.LIST_EVENT_TYPE.SUBSCRIBE.label});
        //that.$rootScope.$broadcast(that.CHANNEL_USER_SUBSCRIPTION_EVENT, that.LIST_EVENT_TYPE.SUBSCRIBE, channelId, userId);
    }

    private async onUserUnsubscribeEvent(info : {id: string, userId: string, 'subscribers': number}) {
        let that = this;
        that._logger.log("internal", LOG_ID + "(onUserUnsubscribeEvent) channelId : ", info.id, ", subscribersInfo : ", info.subscribers);
        let channel : Channel = await that.fetchChannel(info.id);
        if (channel) {
            channel.subscribers_count = info.subscribers;
        }

        that._eventEmitter.emit("evt_internal_channelusersubscription", {'id': info.id, 'userId': info.userId, "kind" : that.LIST_EVENT_TYPE.UNSUBSCRIBE.code, "label" : that.LIST_EVENT_TYPE.UNSUBSCRIBE.label});
        //that.$rootScope.$broadcast(that.CHANNEL_USER_SUBSCRIPTION_EVENT, that.LIST_EVENT_TYPE.UNSUBSCRIBE, channelId, userId);
    }

    /****************************************************************/
    /*** END MANAGEMENT EVENT HANDLER                             ***/
    /****************************************************************/

    //endregion Events
    
    public incrementInvitationCounter() { let that = this; that.invitationCounter += 1; }
    public decrementInvitationCounter() { let that = this; that.invitationCounter -= 1; }


}

module.exports.ChannelsService = ChannelsService;
export {ChannelsService as ChannelsService};
