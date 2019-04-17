"use strict";
import {XMPPService} from "../connection/XMPPService";
import {RESTService} from "../connection/RESTService";

export {};


import {ErrorManager} from "../common/ErrorManager";

const LOG_ID = "CHANNELS - ";

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
	public _eventEmitter: any;
	public _logger: any;
	public MAX_ITEMS: any;
	public MAX_PAYLOAD_SIZE: any;
	public PUBLIC_VISIBILITY: any;
	public PRIVATE_VISIBILITY: any;

    constructor(_eventEmitter, _logger) {
        this._xmpp = null;
        this._rest = null;
        this._channels = null;
        this._eventEmitter = _eventEmitter;
        this._logger = _logger;
        this.MAX_ITEMS = 100;
        this.MAX_PAYLOAD_SIZE = 60000;
        this.PUBLIC_VISIBILITY = "company";
        this.PRIVATE_VISIBILITY = "private";

        this._eventEmitter.on("rainbow_onchannelmessagereceived", this._onChannelMessageReceived.bind(this));
    }

    start(_xmpp : XMPPService, _rest : RESTService) {
        this._logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise((resolve, reject) => {
            try {
                this._xmpp = _xmpp;
                this._rest = _rest;
                this._channels = [];
//                this._eventEmitter.on("rainbow_onchannelmessagereceived", this._onChannelMessageReceived.bind(this));
                this._logger.log("debug", LOG_ID + "(start) _exiting_");
                resolve();
            }
            catch (err) {
                this._logger.log("debug", LOG_ID + "(start) _exiting_");
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
//                this._eventEmitter.removeListener("rainbow_onchannelmessagereceived", this._onChannelMessageReceived);
                this._logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve();
            } catch (err) {
                this._logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject(err);
            }
        });
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
    createPublicChannel(name, channelTopic, category) {
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
                this._channels.push(channel);
                resolve(channel);
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
     *  Create a new private channel
     */
    createClosedChannel(name, description, category) {
        
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
                this._channels.push(channel);
                resolve(channel);
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
    deleteChannel(channel) {

        return new Promise((resolve, reject) => {
            this._logger.log("debug", LOG_ID + "(deleteChannel) _entering_");

            if (!channel) {
                this._logger.log("warn", LOG_ID + "(deleteChannel) bad or empty 'channel' parameter", channel);
                this._logger.log("debug", LOG_ID + "(deleteChannel) _exiting_");
                reject(ErrorManager.getErrorManager().BAD_REQUEST);
                return;
            } 
            
            this._rest.deleteChannel(channel.id).then((status) => {
                this._logger.log("debug", LOG_ID + "(deleteChannel) channel deleted " + status);
                let channelRemoved = this._channels.splice(this._channels.findIndex((el) => {
                    return el.id === channel.id;
                }), 1);
                resolve(channelRemoved);
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
    findChannelsByName(name) {

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
    findChannelsByTopic(topic) {

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
    private _findChannels(name, topic) {
        //hack
        let getChannel = (id) => {
            
            return new Promise((resolve) => {
                this.fetchChannel(id).then((channel) => {
                    resolve(channel);
                }).catch(() => {
                    resolve(null);
                });
            });
        };
        
        this._logger.log("debug", LOG_ID + "(findChannel) _entering_");
        
        return new Promise((resolve, reject) => {

            this._rest.findChannels(name, topic, null, null, null, null, null).then((channels : []) => {
                this._logger.log("info", LOG_ID + "(findChannel) channels found", channels);

                let promises = [];

                channels.forEach((channel : any) => {
                    promises.push(getChannel(channel.id));
                });

                Promise.all(promises).then((listOfChannels) => {
                    resolve(listOfChannels);
                });

            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(findChannel) error", err);
                this._logger.log("debug", LOG_ID + "(findChannel) _exiting_");
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
    getChannelById(id, force?) {
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
    fetchChannel(id, force?) {
        return new Promise((resolve, reject) => {
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
                    this._rest.getChannel(id).then((channel) => {
                        this._logger.log("info", LOG_ID + "(fetchChannel) channel found on the server");
                        this._logger.log("internal", LOG_ID + "(fetchChannel) channel found on the server", channel);
                        this._channels.push(channel);
                        resolve(channel);
                    }).catch((err) => {
                        reject(err);
                    });
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
    fetchChannelsByFilter (filter) {
        this._logger.log("debug", LOG_ID + "(fetchChannelsByFilter) _entering_");

        let getChannel = (id) => {

            return new Promise((resolve) => {
                this.fetchChannel(id).then((channel) => {
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

                channels.forEach((channel : any) => {
                    promises.push(getChannel(channel.id));
                });

                Promise.all(promises).then((listOfChannels) => {
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
    fetchMyChannels() {
        let getChannel = (id) => {

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
                Promise.all(promises).then((channels) => {
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
    getAllChannels() {
        return this._channels;
    }

    /**
     * @public
     * @method getAllOwnedChannel
     * @instance
     * @return {Channel[]} An array of channels (owned only)
     * @memberof Channels
     * @description
     *  Return the list of owned channels only
     */
    getAllOwnedChannel() {
        return this._channels.filter((channel) => {
            return channel.creatorId === this._rest.userId;
        });
    }

    /**
     * @public
     * @method getAllSubscribedChannel
     * @instance
     * @return {Channel[]} An array of channels (subscribed only)
     * @memberof Channels
     * @description
     *  Return the list of subscribed channels only
     */
    getAllSubscribedChannel() {
        return this._channels.filter((channel) => {
            return channel.creatorId !== this._rest.userId;
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
    publishMessageToChannel(channel, message, title, url, imagesIds, type) {
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
    createItem(channel, message, title, url, imagesIds, type) {
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
    subscribeToChannel(channel) {
        
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
     * @return {Promise<Channel>} The channel updated
     * @description
     *  Unsubscribe from a public channel
     * @memberof Channels
     */
    unsubscribeFromChannel(channel) {
        
        this._logger.log("debug", LOG_ID + "(unsubscribeFromChannel) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(unsubscribeFromChannel) bad or empty 'channel' parameter ", channel);
            this._logger.log("debug", LOG_ID + "(unsubscribeFromChannel) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            this._rest.unsubscribeToChannel(channel.id).then((status) => {
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
    updateChannelDescription(channel, description) {
        
        this._logger.log("debug", LOG_ID + "(updateChannelDescription) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(updateChannelDescription) bad or empty 'channel' parameter ", channel);
            this._logger.log("debug", LOG_ID + "(updateChannelDescription) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        if (!description) {
            this._logger.log("debug", LOG_ID + "(updateChannelDescription) bad or empty 'description' parameter ", description);
            this._logger.log("debug", LOG_ID + "(updateChannelDescription) _exiting_");
            return Promise.reject(ErrorManager.getErrorManager().BAD_REQUEST);
        }

        return new Promise((resolve, reject) => {

            this._rest.updateChannel(channel.id, description, null,  null , null).then((channelUpdated : any) => {
                this._logger.log("info", LOG_ID + "(updateChannelDescription) channel updated", channel);

                var foundIndex = this._channels.findIndex(channelItem => channelItem.id === channelUpdated.id);
                this._channels[foundIndex] = channelUpdated;

                this._logger.log("debug", LOG_ID + "(updateChannelDescription) _exiting_");
                resolve(channelUpdated);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(updateChannelDescription) error", err);
                this._logger.log("debug", LOG_ID + "(updateChannelDescription) _exiting_");
                reject(err);
            });
        });
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
    fetchChannelUsers(channel, options) {
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
    deleteAllUsersFromChannel(channel) {
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
                    var foundIndex = this._channels.findIndex(channelItem => channelItem.id === updatedChannel.id);
                    this._channels[foundIndex] = updatedChannel;

                    this._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) _exiting_");
                    resolve(updatedChannel);
                });

            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(deleteAllUsersFromChannel) error", err);
                this._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) _exiting_");
                reject(err);
            });
        });
    }    

    /**
     * @private
     * @method updateChannelUsers
     * @instance
     * @async
     * @param {String} channelId The Id of the channel
     * @param {ChannelUser[]} users The users of the channel
     * @return {Promise<UpdateChannelUsersResult>} Update Channel Users status
     * @description
     *  TODO
     * @memberof Channels
     */
    updateChannelUsers(channelId, users) {
        this._logger.log("debug", LOG_ID + "(updateChannelUsers) _entering_");

        return new Promise((resolve, reject) => {
            this._rest.updateChannelUsers(channelId, users).then((res) => {
                this._logger.log("info", LOG_ID + "(updateChannelUsers) channel users updated", res);

                this._rest.getChannel(channelId).then((updatedChannel) => {
                    // Update local channel
                    this._logger.log("debug", LOG_ID + "(updateChannelUsers) _exiting_");
                    resolve(updatedChannel);
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
     * @param {User[]} users An array of users to add
     * @return {Promise<Channel>} The updated channel
     * @description
     *  Add a list of owners to the channel
     * @memberof Channels
     */
    addOwnersToChannel(channel, owners) {
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
    addPublishersToChannel(channel, publishers) {
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
    addMembersToChannel(channel, members) {
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
    deleteUsersFromChannel(channel, users) {
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
    fetchChannelItems (channel) {

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
    deleteItemFromChannel (channelId, itemId) {

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
                    var foundIndex = this._channels.findIndex(channelItem => channelItem.id === updatedChannel.id);
                    this._channels[foundIndex] = updatedChannel;

                    this._logger.log("debug", LOG_ID + "(deleteItemFromChannel) _exiting_");
                    resolve(updatedChannel);
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
}

module.exports = Channels;
