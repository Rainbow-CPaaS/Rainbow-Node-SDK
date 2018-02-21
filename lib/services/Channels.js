"use strict";

var ErrorCase = require("../common/Error");

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
    }

    start(_xmpp, _rest) {
        this._logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise((resolve, reject) => {
            try {
                this._xmpp = _xmpp;
                this._rest = _rest;
                this._channels = [];
                this._eventEmitter.on("rainbow_onchannelmessagereceived", this._onChannelMessageReceived.bind(this));
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

        return new Promise((resolve) => {
            try {
                this._xmpp = null;
                this._rest = null;
                this._channels = null;
                this._eventEmitter.removeListener("rainbow_onchannelmessagereceived", this._onChannelMessageReceived);
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
     * @param {string} [description]  The description of the channel to create (max-length=255)
     * @return {Promise<Channel>} New Channel
     * @memberof Channels
     * @description
     *  Create a new public channel with a visibility limited to my company
     */
    createChannel(name, description) {

        return new Promise((resolve, reject) => {

            this._logger.log("debug", LOG_ID + "(createChannel) _entering_");
        
            if (!name) {
                this._logger.log("warn", LOG_ID + "(createChannel) bad or empty 'name' parameter", name);
                this._logger.log("debug", LOG_ID + "(createChannel) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else {

                this._rest.createChannel(name, description, this.PUBLIC_VISIBILITY, this.MAX_ITEMS, this.MAX_PAYLOAD_SIZE).then((channel) => {
                    this._logger.log("debug", LOG_ID + "(createChannel) creation successfull");
                    this._channels.push(channel);
                    resolve(channel);
                }).catch((err) => {
                    this._logger.log("error", LOG_ID + "(createChannel) error");
                    this._logger.log("debug", LOG_ID + "(createChannel) _exiting_");
                    reject(err);
                });    
            }
        });
    }

    /**
     * @public
     * @method createPrivateChannel
     * @instance
     * @async
     * @param {string} name  The name of the channel to create (max-length=255)
     * @param {string} [description]  The description of the channel to create (max-length=255)
     * @return {Promise<Channel>} New Channel
     * @memberof Channels
     * @description
     *  Create a new private channel
     */
    createPrivateChannel(name, description) {
        
        return new Promise((resolve, reject) => {

            this._logger.log("debug", LOG_ID + "(createPrivateChannel) _entering_");
        
            if (!name) {
                this._logger.log("warn", LOG_ID + "(createPrivateChannel) bad or empty 'name' parameter", name);
                this._logger.log("debug", LOG_ID + "(createPrivateChannel) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else {
                this._rest.createChannel(name, description, this.PRIVATE_VISIBILITY, this.MAX_ITEMS, this.MAX_PAYLOAD_SIZE).then((channel) => {
                    this._logger.log("debug", LOG_ID + "(createPrivateChannel) creation successfull");
                    this._channels.push(channel);
                    resolve(channel);
                }).catch((err) => {
                    this._logger.log("error", LOG_ID + "(createPrivateChannel) error");
                    this._logger.log("debug", LOG_ID + "(createPrivateChannel) _exiting_");
                    reject(err);
                });    
            }
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
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else {
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
            }
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
            throw new Error(ErrorCase.BAD_REQUEST.msg);
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
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return this._findChannels(null, topic);
    }

    /**
     * @private
     * @method findChannels
     * @memberof Channels
     */
    _findChannels(name, topic) {
        //hack
        let getChannel = (id) => {
            
            return new Promise((resolve) => {
                this.getChannelById(id).then((channel) => {
                    resolve(channel);
                }).catch(() => {
                    resolve(null);
                });
            });
        };
        
        this._logger.log("debug", LOG_ID + "(findChannel) _entering_");
        
        return new Promise((resolve, reject) => {

            this._rest.findChannels(name, topic).then((channels) => {
                this._logger.log("info", LOG_ID + "(findChannel) channels found", channels);

                let promises = [];

                channels.forEach((channel) => {
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
     * @param {String} id The id of the channel)
     * @param {boolean} [force=false] True to force a request to the server
     * @return {Promise<Channel>} The channel found
     * @description
     * Find a channel by its id (locally if exists or by sending a request to Rainbow)
     * @memberof Channels
     */
    getChannelById(id, force) {
        
        return new Promise((resolve, reject) => {
            if (!id) {
                this._logger.log("warn", LOG_ID + "(getChannelById) bad or empty 'jid' parameter", id);
                reject(Error.BAD_REQUEST);
            }
            else {
                let channelFound = null;

                if (this._channels) {
                    channelFound = this._channels.find((channel) => {
                        return channel.id === id;
                    });
                }

                if (channelFound && !force) {
                    this._logger.log("info", LOG_ID + "(getChannelById) channel found locally", channelFound);
                    resolve(channelFound);
                }
                else {
                    this._logger.log("debug", LOG_ID + "(getChannelById) channel not found locally. Ask the server...");
                    this._rest.getChannel(id).then((channel) => {
                        this._logger.log("info", LOG_ID + "(getChannelById) channel found on the server", channel);
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
     * @private
     * @description
     *      Internal method
     */
    getChannels() {

        let getChannel = (id) => {

            return new Promise((resolve) => {
                this.getChannelById(id).then((channel) => {
                    resolve(channel);
                }).catch(() => {
                    resolve(null);
                });
            });
        };
        
        return new Promise((resolve) => {

            this._logger.log("debug", LOG_ID + "(getChannels) _entering_");

            this._rest.getChannels().then((listOfChannels) => {

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

                this._logger.log("info", LOG_ID + "(getChannels) hack start get channel data individually from server...");
                Promise.all(promises).then((channels) => {
                    this._logger.log("info", LOG_ID + "(getChannels) hack done", channels);
                    this._channels = channels;
                    this._logger.log("info", LOG_ID + "(getChannels) get successfully");
                    this._logger.log("debug", LOG_ID + "(getChannels) _exiting_");
                    resolve(this._channels);
                });
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(getChannels) error", err);
                this._logger.log("debug", LOG_ID + "(getChannels) _exiting_");
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
     * @param {String} channel The channel where to publish the message
     * @param {String} message Message content
     * @param {String} [title = "", limit=256] Message title
     * @param {String} [url = ""] An URL
     * @return {Promise<ErrorCase.OK>} OK if successfull
     * @description
     *  TODO
     * @memberof Channels
     */
    publishMessageToChannel(channel, message, title, url) {
        
        this._logger.log("debug", LOG_ID + "(publishMessageToChannel) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(publishMessageToChannel) bad or empty 'channel' parameter ", channel);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }
        if (!message) {
            this._logger.log("debug", LOG_ID + "(publishMessageToChannel) bad or empty 'title' parameter ", title);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            this._rest.publishMessage(channel.id, message, title, url).then((status) => {
                this._logger.log("info", LOG_ID + "(publishMessageToChannel) message published", status);
                resolve(ErrorCase.OK);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(publishMessageToChannel) error", err);
                this._logger.log("debug", LOG_ID + "(publishMessageToChannel) _exiting_");
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
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            this._rest.subscribeToChannel(channel.id).then((status) => {
                this._logger.log("info", LOG_ID + "(subscribeToChannel) channel subscribed", status);

                this.getChannelById(channel.id, true).then((channelUpdated) => {
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
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            this._rest.unsubscribeToChannel(channel.id).then((status) => {
                this._logger.log("info", LOG_ID + "(unsubscribeFromChannel) channel unsubscribed", status);
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
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        if (!description) {
            this._logger.log("debug", LOG_ID + "(updateChannelDescription) bad or empty 'description' parameter ", description);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            this._rest.updateChannel(channel.id, description).then((channelUpdated) => {
                this._logger.log("info", LOG_ID + "(updateChannelDescription) channel updated", channel);

                var foundIndex = this._channels.findIndex(channelItem => channelItem.id === channelUpdated.id);
                this._channels[foundIndex] = channelUpdated;

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
     * @method getUsersFromChannel
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
    getUsersFromChannel(channel, options) {
        
        this._logger.log("debug", LOG_ID + "(getChannelUsers) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(getChannelUsers) bad or empty 'channel' parameter", channel);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
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

            this._rest.getChannelUsers(channel.id, json).then((users) => {
                this._logger.log("info", LOG_ID + "(getChannelUsers) channel has users ", users.length);
                resolve(users);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(getChannelUsers) error", err);
                this._logger.log("debug", LOG_ID + "(getChannelUsers) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method removeAllUsersFromChannel
     * @instance
     * @async
     * @param {String} channel The channel
     * @return {Promise<Channel>} The channel updated
     * @description
     *  Remove all users from a channel
     * @memberof Channels
     */
    removeAllUsersFromChannel(channel) {
        
        this._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) bad or empty 'channel' parameter", channel);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            this._rest.deleteAllUsersFromChannel(channel.id).then((result) => {
                this._logger.log("info", LOG_ID + "(deleteAllUsersFromChannel) channel users deletion", result);

                this._rest.getChannel(channel.id).then((updatedChannel) => {
                    // Update local channel
                    var foundIndex = this._channels.findIndex(channelItem => channelItem.id === updatedChannel.id);
                    this._channels[foundIndex] = updatedChannel;

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
        
        return new Promise((resolve, reject) => {
            this._rest.updateChannelUsers(channelId, users).then((res) => {
                this._logger.log("info", LOG_ID + "(updateChannelUsers) channel users updated", res);

                this._rest.getChannel(channelId).then((updatedChannel) => {
                    // Update local channel
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
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        if (!owners) {
            this._logger.log("debug", LOG_ID + "(addOwnersToChannel) bad or empty 'owners' parameter", owners);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        let usersId = [];

        owners.forEach((user) => {
            usersId.push({"id": user.id, "type": "owner"});
        });

        return this.updateChannelUsers(channel.id, usersId);
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
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        if (!publishers) {
            this._logger.log("debug", LOG_ID + "(addPublishersToChannel) bad or empty 'publishers' parameter", publishers);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        let usersId = [];

        publishers.forEach((user) => {
            usersId.push({"id": user.id, "type": "publisher"});
        });

        return this.updateChannelUsers(channel.id, usersId);
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
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        if (!members) {
            this._logger.log("warn", LOG_ID + "(addMembersToChannel) bad or empty 'members' parameter", members);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        let usersId = [];

        members.forEach((user) => {
            if (user) {
                usersId.push({"id": user.id, "type": "member"});
            }
        });

        if (!usersId.length > 0) {
            this._logger.log("warn", LOG_ID + "(addMembersToChannel) bad or empty 'members' parameter", members);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return this.updateChannelUsers(channel.id, usersId);
    }

    /**
     * @public
     * @method removeUsersFromChannel
     * @instance
     * @async
     * @param {Channel} channel The channel
     * @param {User[]} users An array of users to remove
     * @return {Promise<Channel>} The updated channel
     * @description
     *  Remove a list of users from a channel
     * @memberof Channels
     */
    removeUsersFromChannel(channel, users) {
        this._logger.log("debug", LOG_ID + "(removeUsersFromChannel) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(removeUsersFromChannel) bad or empty 'channel' parameter", channel);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        if (!users) {
            this._logger.log("debug", LOG_ID + "(removeUsersFromChannel) bad or empty 'publishers' parameter", users);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        let usersId = [];

        users.forEach((user) => {
            usersId.push({"id": user.id, "type": "none"});
        });

        return this.updateChannelUsers(channel.id, usersId);
    }

    /**
     * @public
     * @method getMessagesFromChannel
     * @instance
     * @async
     * @param {Channel} channel The channel
     * @return {Promise<Object[]>} The list of messages received
     * @description
     *  Retrieve the last messages from a channel
     * @memberof Channels
     */
    getMessagesFromChannel(channel) {

        this._logger.log("debug", LOG_ID + "(getMessagesFromChannel) _entering_");
        
        if (!channel) {
            this._logger.log("debug", LOG_ID + "(getMessagesFromChannel) bad or empty 'channel' parameter", channel);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }
        
        return new Promise( (resolve, reject) => {

            this._rest.getChannelMessages(channel.id).then((res) => {
                this._logger.log("info", LOG_ID + "(getMessagesFromChannel) messages retrieved", res);

                let messages = res.items;

                let listOfMessages = [];
                messages.forEach((item) => {
                    let message = {
                        title: item.item.entry[0].title ? item.item.entry[0].title[0] : "",
                        message: item.item.entry[0].message ? item.item.entry[0].message[0] : "",
                        url: item.item.entry[0].url ? item.item.entry[0].url[0] : ""
                    };
                    listOfMessages.push(message);
                });
                resolve(listOfMessages);
            }).catch((err) => {
                this._logger.log("error", LOG_ID + "(getMessagesFromChannel) error", err);
                this._logger.log("debug", LOG_ID + "(getMessagesFromChannel) _exiting_");
                reject(err);
            });
        });

    }

    _onChannelMessageReceived(message) {

        this.getChannelById(message.channelId).then((channel) => {
            message.channel = channel;
            delete message.channelId;
            this._eventEmitter.emit("rainbow_channelmessagereceived", message);
        });
    }
}

module.exports = Channels;
