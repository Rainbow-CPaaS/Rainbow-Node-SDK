"use strict";

var ErrorCase = require("../common/Error");

const LOG_ID = "CHANNELS - ";

/**
 * @class
 * @name Channels
 * @description
 *      This service manages TODO.
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
    }

    start(_xmpp, _rest) {
        var that = this;

        this._logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function(resolve, reject) {
            try {
                that._xmpp = _xmpp;
                that._rest = _rest;
                that._bubbles = [];
               // that._eventEmitter.on("rainbow_invitationreceived", that._onInvitationReceived.bind(that));
               // that._eventEmitter.on("rainbow_affiliationchanged", that._onAffiliationChanged.bind(that));
               // that._eventEmitter.on("rainbow_ownaffiliationchanged", that._onOwnAffiliationChanged.bind(that));
               // that._eventEmitter.on("rainbow_customdatachanged", that._onCustomDataChanged.bind(that));
               // that._eventEmitter.on("rainbow_topicchanged", that._onTopicChanged.bind(that));
               // that._eventEmitter.on("rainbow_namechanged", that._onNameChanged.bind(that));
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
        var that = this;

        this._logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function(resolve) {
            try {
                that._xmpp = null;
                that._rest = null;
                that._bubbles = null;
                // that._eventEmitter.removeListener("rainbow_invitationreceived", that._onInvitationReceived);
                // that._eventEmitter.removeListener("rainbow_affiliationchanged", that._onAffiliationChanged);
                // that._eventEmitter.removeListener("rainbow_ownaffiliationchanged", that._onOwnAffiliationChanged);
                // that._eventEmitter.removeListener("rainbow_customdatachanged", that._onCustomDataChanged);
                // that._eventEmitter.removeListener("rainbow_topicchanged", that._onTopicChanged);
                // that._eventEmitter.removeListener("rainbow_namechanged", that._onNameChanged);
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve();
            } catch (err) {
                that._logger.log("debug", LOG_ID + "(stop) _exiting_");
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
     * @param {string} [title]  The title of the channel to create (max-length=255)
     * @param {string} [visibility=public] Public/company/private channel visibility for search
     * @param {number} [max_items=30] Max number of items to persist ( default value: 30 )
     * @param {number} [max_payload_size=60000] Max payload size in bytes ( default value: 60000 )
     * @return {Promise<Channel>} New Channel
     * @memberOf Channel
     * @description
     *  Create a new channel
     */
    createChannel(name, title, visibility, max_items, max_payload_size) {

        var that = this;

        return new Promise((resolve, reject) => {

            that._logger.log("debug", LOG_ID + "(createChannel) _entering_");
        
            if (!name) {
                that._logger.log("warn", LOG_ID + "(createChannel) bad or empty 'name' parameter", name);
                that._logger.log("debug", LOG_ID + "(createChannel) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else {
                that._rest.createChannel(name, title, visibility, max_items, max_payload_size).then((channel) => {
                    that._logger.log("debug", LOG_ID + "(createChannel) creation successfull");

                    resolve(channel);
                    
                }).catch((err) => {
                    that._logger.log("error", LOG_ID + "(createChannel) error");
                    that._logger.log("debug", LOG_ID + "(createChannel) _exiting_");
                    reject(err);
                });    
            }
        });
    }

    /**
     * @public
     * @method getChannel
     * @instance
     * @async
     * @param {String} channelId  The channel to read
     * @return {Promise<Channel>} Channel to get
     * @memberOf Channel
     * @description
     *  read a channel
     */
    getChannel(channelId) {
        
        var that = this;

        return new Promise((resolve, reject) => {

            that._logger.log("debug", LOG_ID + "(getChannel) _entering_");
        
            if (!channelId) {
                that._logger.log("warn", LOG_ID + "(getChannel) bad or empty 'channelId' parameter", channelId);
                that._logger.log("debug", LOG_ID + "(getChannel) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else {
                that._rest.getChannel(channelId).then(function(status) {
                    that._logger.log("debug", LOG_ID + "(getChannel) channel read");
                    
                    resolve(status);
                }).catch(function(err) {
                    that._logger.log("error", LOG_ID + "(getChannel) error");
                    that._logger.log("debug", LOG_ID + "(getChannel) _exiting_");
                    reject(err);
                });
            }
        });
    }

    /**
     * @typedef {Object} deleteChannelResult
     * @property {String} status Deletion status
     * @property {Object[]} data empty collection
     */


    /**
     * @public
     * @method deleteChannel
     * @instance
     * @async
     * @param {String} channelId  The channel to delete
     * @return {Promise<deleteChannelResult>} Promise object represents The channel removed status
     * @memberof Channels
     * @description
     *  Delete a owned channel. TODO.
     */
    deleteChannel(channelId) {
        var that = this;

        return new Promise(function(resolve, reject) {
            that._logger.log("debug", LOG_ID + "(deleteChannel) _entering_");

            if (!channelId) {
                that._logger.log("warn", LOG_ID + "(deleteChannel) bad or empty 'channelId' parameter", channelId);
                that._logger.log("debug", LOG_ID + "(deleteChannel) _exiting_");
                reject(ErrorCase.BAD_REQUEST);
                throw new Error(ErrorCase.BAD_REQUEST.msg);
            } else {
                that._rest.deleteChannel(channelId).then(function(status) {
                    that._logger.log("debug", LOG_ID + "(deleteChannel) channel deleted");
                    
                    resolve(status);
                }).catch(function(err) {
                    that._logger.log("error", LOG_ID + "(deleteChannel) error");
                    that._logger.log("debug", LOG_ID + "(deleteChannel) _exiting_");
                    reject(err);
                });
            }
        });
    }

    /**
     * @public
     * @method findChannels
     * @instance
     * @async
     * @param {String} title_substring Search this provided substring in the channel titles (case insensitive).
     * @param {number} [limit=100] Allow to specify the number of channels to retrieve.
     * @param {number} [offset] Allow to specify the position of first channel to retrieve (first channel if not specified). Warning: if offset > total, no results are returned.
     * @param {String} [sortField=name] Sort channel list based on the given field. (authorized values: _id, name)
     * @param {number} [sortOrder=1] Specify order ascending/descending. (authorized values: -1, 1)
     * @return {Promise<Channel[]>} Channels found
     * @description
     *  TODO
     * @memberof Channels
     */
    findChannels(title_substring, limit, offset, sortField, sortOrder) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(findChannels) _entering_");
        
        if (!title_substring) {
            this._logger.log("debug", LOG_ID + "(findChannels) bad or empty 'title_substring' parameter ", title_substring);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            that._rest.findChannels(title_substring, limit, offset, sortField, sortOrder).then((channels) => {
                that._logger.log("info", LOG_ID + "(findChannels) " + JSON.stringify(channels) + "channel(s) found");
                
                that._logger.log("info", LOG_ID + "(findChannels) " + channels.total + "channel(s) found");
                resolve(channels);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(findChannels) error", err);
                that._logger.log("debug", LOG_ID + "(findChannels) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @private
     * @description
     *      Internal method
     */
    getChannels() {
        var that = this;
        
        return new Promise(function(resolve, reject) {

            that._logger.log("debug", LOG_ID + "(getChannels) _entering_");

            that._rest.getChannels().then(function(listOfChannels) {
                that._channels = listOfChannels;
                that._logger.log("info", LOG_ID + "(getChannels) get successfully");

                that._logger.log("debug", LOG_ID + "(getChannels) _exiting_");
                resolve(that._channels);
            }).catch(function(err) {
                that._logger.log("error", LOG_ID + "(getChannels) error", err);
                that._logger.log("debug", LOG_ID + "(getChannels) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @typedef {Object} getAllChannelsResult
     * @property {ShortChannel[]} member The list of channels where user is a member
     * @property {ShortChannel[]} publisher The list of channels where user is a publisher
     * @property {ShortChannel[]} owner The list of channels where user is owner
     */
    
    /**
     * @public
     * @method getAllChannels
     * @instance
     * @return {getAllChannelsResult} The list of existing channels
     * @memberof Channels
     * @description
     *  Return the list of existing channels
     */
    getAllChannels() {
        return this._channels;
    }

    /**
     * @typedef {Object} publishMessageResult
     * @property {String} status Publish status
     * @property {Object[]} data empty collection
     */

    /**
     * @public
     * @method publishMessage
     * @instance
     * @async
     * @param {String} channelId The Id of the channel
     * @param {String} title Message title
     * @param {String} body Message body
     * @return {Promise<publishMessageResult>} Publish status
     * @description
     *  TODO
     * @memberof Channels
     */
    publishMessage(channelId, title, body) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(publishMessage) _entering_");
        
        if (!channelId) {
            this._logger.log("debug", LOG_ID + "(publishMessage) bad or empty 'channelId' parameter ", channelId);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }
        if (!title) {
            this._logger.log("debug", LOG_ID + "(publishMessage) bad or empty 'title' parameter ", title);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }
        if (!body) {
            this._logger.log("debug", LOG_ID + "(publishMessage) bad or empty 'body' parameter ", body);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            that._rest.publishMessage(channelId, title, body).then((status) => {
                that._logger.log("info", LOG_ID + "(publishMessage) message published", status);
                resolve(status);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(publishMessage) error", err);
                that._logger.log("debug", LOG_ID + "(publishMessage) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @typedef {Object} subscribeToChannelResult
     * @property {String} status Subscribe status
     * @property {Object[]} data empty collection
     */

    /**
     * @public
     * @method subscribeToChannel
     * @instance
     * @async
     * @param {String} channelId The Id of the channel
     * @return {Promise<subscribeToChannelResult>} Subscribed status
     * @description
     *  TODO
     * @memberof Channels
     */
    subscribeToChannel(channelId) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(subscribeToChannel) _entering_");
        
        if (!channelId) {
            this._logger.log("debug", LOG_ID + "(subscribeToChannel) bad or empty 'channelId' parameter ", channelId);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            that._rest.subscribeToChannel(channelId).then((status) => {
                that._logger.log("info", LOG_ID + "(subscribeToChannel) channel subscribed", status);
                resolve(status);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(subscribeToChannel) error", err);
                that._logger.log("debug", LOG_ID + "(subscribeToChannel) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @typedef {Object} unsubscribeToChannelResult
     * @property {String} status Unsubscribe status
     * @property {Object[]} data empty collection
     */

    /**
     * @public
     * @method unsubscribeToChannel
     * @instance
     * @async
     * @param {String} channelId The Id of the channel
     * @return {Promise<unsubscribeToChannelResult>} Unsubscribed status
     * @description
     *  TODO
     * @memberof Channels
     */
    unsubscribeToChannel(channelId) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(unsubscribeToChannel) _entering_");
        
        if (!channelId) {
            this._logger.log("debug", LOG_ID + "(unsubscribeToChannel) bad or empty 'channelId' parameter ", channelId);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            that._rest.unsubscribeToChannel(channelId).then((status) => {
                that._logger.log("info", LOG_ID + "(unsubscribeToChannel) channel unsubscribed", status);
                resolve(status);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(unsubscribeToChannel) error", err);
                that._logger.log("debug", LOG_ID + "(unsubscribeToChannel) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method updateChannel
     * @instance
     * @async
     * @param {String} channelId The Id of the channel
     * @param {string} [title]  The title of the channel to create (max-length=255)
     * @param {string} [visibility=public] Public/company/private channel visibility for search
     * @param {number} [max_items=30] Max number of items to persist ( default value: 30 )
     * @param {number} [max_payload_size=60000] Max payload size in bytes ( default value: 60000 )
     * @return {Promise<Channel>} Unsubscribed status
     * @description
     *  TODO
     * @memberof Channels
     */
    updateChannel(channelId, title, visibility, max_items, max_payload_size) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(updateChannel) _entering_");
        
        if (!channelId) {
            this._logger.log("debug", LOG_ID + "(updateChannel) bad or empty 'channelId' parameter ", channelId);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            that._rest.updateChannel(channelId, title, visibility, max_items, max_payload_size).then((channel) => {
                that._logger.log("info", LOG_ID + "(updateChannel) channel updated", channel);
                resolve(channel);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(updateChannel) error", err);
                that._logger.log("debug", LOG_ID + "(updateChannel) _exiting_");
                reject(err);
            });
        });
    }
    
    /**
     * @public
     * @method getChannelUsers
     * @instance
     * @async
     * @param {String} channelId The Id of the channel
     * @return {Promise<ChannelUser[]>} The channel users
     * @description
     *  TODO
     * @memberof Channels
     */
    getChannelUsers(channelId) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(getChannelUsers) _entering_");
        
        if (!channelId) {
            this._logger.log("debug", LOG_ID + "(getChannelUsers) bad or empty 'channelId' parameter", channelId);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            that._rest.getChannelUsers(channelId).then((channel) => {
                that._logger.log("info", LOG_ID + "(getChannelUsers) channel set", channel.name);
                resolve(channel);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(getChannelUsers) error", err);
                that._logger.log("debug", LOG_ID + "(getChannelUsers) _exiting_");
                reject(err);
            });
        });
    }

    /**
     * @public
     * @method deleteAllUsersFromChannel
     * @instance
     * @async
     * @param {String} channelId The Id of the channel
     * @return {Promise<Result>} Deletion status
     * @description
     *  TODO
     * @memberof Channels
     */
    deleteAllUsersFromChannel(channelId) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) _entering_");
        
        if (!channelId) {
            this._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) bad or empty 'channelId' parameter", channelId);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            that._rest.deleteAllUsersFromChannel(channelId).then((channel) => {
                that._logger.log("info", LOG_ID + "(deleteAllUsersFromChannel) channel users deletion", channelId);
                resolve(channel);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(deleteAllUsersFromChannel) error", err);
                that._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) _exiting_");
                reject(err);
            });
        });
    }    

    /**
     * @typedef {Object} UpdateChannelUsersResult
     * @property {String[]} removed The list of removed user id's
     * @property {String[]} updated The list of updated user id's
     * @property {String[]} added The list of added user id's
     */

    /**
     * @public
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
    updateChannelUsers(channelId) {
        
        let that = this;

        this._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) _entering_");
        
        if (!channelId) {
            this._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) bad or empty 'channelId' parameter", channelId);
            throw new Error(ErrorCase.BAD_REQUEST.msg);
        }

        return new Promise((resolve, reject) => {

            that._rest.deleteAllUsersFromChannel(channelId).then((channel) => {
                that._logger.log("info", LOG_ID + "(deleteAllUsersFromChannel) channel users deletion", channelId);
                resolve(channel);
            }).catch((err) => {
                that._logger.log("error", LOG_ID + "(deleteAllUsersFromChannel) error", err);
                that._logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) _exiting_");
                reject(err);
            });
        });
    }    
}

module.exports = Channels;
