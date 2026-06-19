'use strict';

import {logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";

const LOG_ID = "REST/CHAN - ";

/**
 * Handles all REST API calls related to Channels.
 */
@logEntryExit(LOG_ID)
class RESTChannels extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTChannels'; }
    getClassName() { return RESTChannels.getClassName(); }
    static getAccessorName() { return 'restchannels'; }
    getAccessorName() { return RESTChannels.getAccessorName(); }

    constructor(_core, evtEmitter, _logger) {
        super(_core, _logger, LOG_ID);
        this.setLogLevels(this);
        let that = this;
        that.evtEmitter = evtEmitter;
        that._logger = _logger;
    }

    start(http) {
        return new Promise((resolve) => {
            let that = this;
            that.http = http;
            resolve(undefined);
        });
    }

    stop() {
        return new Promise((resolve) => {
            resolve(undefined);
        });
    }

    //region Channels

    createPublicChannel(name, topic, category: string = "globalnews", visibility, max_items, max_payload_size) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createPublicChannel) entry`);
        return new Promise(function (resolve, reject) {
            let channel: any = {
                name: name,
                topic: null,
                visibility: null,
                max_items: null,
                max_payload_size: null,
                category: category
            };

            if (topic) {
                channel.topic = topic;
            }
            if (visibility) {
                channel.visibility = visibility;
            }
            if (max_items) {
                channel.max_items = max_items;
            }
            if (max_payload_size) {
                channel.max_payload_size = max_payload_size;
            }

            that.http.post("/api/rainbow/channels/v1.0/channels", that.getRequestHeader(), channel, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(createPublicChannel) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(createPublicChannel) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(createPublicChannel) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createPublicChannel) error : ", err);
                return reject(err);
            });
        });
    }

    deleteChannel(channelId) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteChannel) entry`);
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteChannel) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteChannel) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteChannel) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteChannel) error : ", err);
                return reject(err);
            });
        });
    }

    findChannels(name, topic, category, limit, offset, sortField, sortOrder) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(findChannels) entry`);

        let query = "?limit=";
        if (limit) {
            query += limit;
        } else {
            query += "100";
        }
        if (name) {
            query += "&name=" + name;
        }
        if (topic) {
            query += "&topic=" + topic;
        }
        if (category) {
            query += "&category=" + category;
        }
        if (offset) {
            query += "&offset=" + offset;
        }
        if (sortField) {
            query += "&sortField=" + sortField;
        }
        if (sortOrder) {
            query += "&sortOrder=" + sortOrder;
        }
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/channels/v1.0/channels/search" + query, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(findChannels) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(findChannels) REST result : ", json.total);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(findChannels) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(findChannels) error : ", err);
                return reject(err);
            });
        });
    }

    getChannels() {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getChannels) entry`);
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/channels/v1.0/channels", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getChannels) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getChannels) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getChannels) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getChannels) error : ", err);
                return reject(err);
            });
        });
    }

    getChannel(id) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getChannel) entry`);
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/channels/v1.0/channels/" + id, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getChannel) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getChannel) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getChannel) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getChannel) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Publish a message to a channel.
     * @param {string} channelId - The channel id.
     * @param {string} message - Message content.
     * @param {string} title - Message title.
     * @param {string} url - Optional URL.
     * @param {Array<{id: string}>} imagesIds - Array of image file ids stored in Rainbow.
     * @param {string} type - Message type (urn:xmpp:channels:*).
     * @param {any} customDatas - Extra fields merged into payload.
     * @param {Array<{id: string}>} attachments - File attachments by Rainbow file id.
     * @returns {Promise<any>}
     */
    publishMessage(channelId: string, message: string, title: string, url: string, imagesIds: Array<{id: string}> = undefined, type: string, customDatas: any = {}, attachments: Array<{id: string}> = undefined) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(publishMessage) channelId : ${channelId}`);
        return new Promise((resolve, reject) => {
            let payload = Object.assign({
                type,
                message: message,
                title: title || "",
                url: url || "",
                images: null,
                attachments: null
            }, customDatas);

            if (imagesIds) {
                payload.images = imagesIds || null;
            }

            if (attachments && attachments.length > 0) {
                payload.attachments = attachments;
            }

            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/publish", that.getRequestHeader(), payload, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(publishMessage) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(publishMessage) REST result : ", json);
                that._logger.log(that.INFO, LOG_ID + `(publishMessage) done, channelId : ${channelId}`);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(publishMessage) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(publishMessage) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Get latest messages from channel.
     * @param {number} maxMessages - Max number of messages to retrieve.
     * @param {Date} beforeDate - Only return messages before this date.
     * @param {Date} afterDate - Only return messages after this date.
     * @returns {Promise<any>}
     */
    public getLatestMessages(maxMessages: number, beforeDate: Date = null, afterDate: Date = null) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getLatestMessages) entry`);
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/channels/v1.0/channels/latest-items", that.getRequestHeader(), {
                max: maxMessages,
                before: beforeDate,
                after: afterDate
            }).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getLatestMessages) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getLatestMessages) REST result : " + JSON.stringify(json) + " latestMessages");
                that._chewReceivedItems(json.data.items);
                resolve(json.data.items);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getLatestMessages) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getLatestMessages) error : ", err);
                return reject(err);
            });
        });
    }

    subscribeToChannel(channelId) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(subscribeToChannel) entry`);
        return new Promise((resolve, reject) => {
            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/subscribe", that.getRequestHeader(), undefined, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(subscribeToChannel) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(subscribeToChannel) REST result : ", json);
                resolve(json?.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(subscribeToChannel) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(subscribeToChannel) error : ", err);
                return reject(err);
            });
        });
    }

    unsubscribeToChannel(channelId) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(unsubscribeToChannel) entry`);
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId + "/subscribe", that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(unsubscribeToChannel) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(unsubscribeToChannel) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(unsubscribeToChannel) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(unsubscribeToChannel) error : ", err);
                return reject(err);
            });
        });
    }

    updateChannel(channelId, title, visibility, max_items, max_payload_size, channelName, mode) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateChannel) entry`);
        let channel: any = {
            name: null,
            topic: null,
            visibility: null,
            max_items: null,
            max_payload_size: null,
            mode: null
        };
        if (title === null) {
            delete channel.topic;
        } else {
            channel.topic = title;
        }
        if (visibility === null) {
            delete channel.visibility;
        } else {
            channel.visibility = visibility;
        }
        if (mode === null) {
            delete channel.mode;
        } else {
            channel.mode = mode;
        }
        if (max_items === null) {
            delete channel.max_items;
        } else {
            channel.max_items = max_items;
        }
        if (max_payload_size === null) {
            delete channel.max_payload_size;
        } else {
            channel.max_payload_size = max_payload_size;
        }
        if (channelName === null) {
            delete channel.name;
        } else {
            channel.name = channelName;
        }
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/channels/v1.0/channels/" + channelId, that.getRequestHeader(), channel, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateChannel) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateChannel) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateChannel) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateChannel) error : ", err);
                return reject(err);
            });
        });
    }

    public uploadChannelAvatar(channelId: string, avatar: any, avatarSize: number, fileType: string): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(uploadChannelAvatar) entry`);
        return new Promise((resolve, reject) => {
            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/avatar", that.getRequestHeader(), avatar, fileType).then((response: any) => {
                that._logger.log(that.DEBUG, LOG_ID + "(uploadChannelAvatar) successfull channelId : ", channelId);
                that._logger.log(that.INTERNAL, LOG_ID + "(uploadChannelAvatar) REST result : ", response);
                resolve(response);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    public deleteChannelAvatar(channelId: string): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteChannelAvatar) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId + "/avatar", that.getRequestHeader("image/jpeg"))
                .then((response: any) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteChannelAvatar) successfull channelId : ", channelId);
                    that._logger.log(that.INTERNAL, LOG_ID + "(deleteChannelAvatar) REST result : ", response);
                    resolve(response);
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }

    getChannelUsers(channelId, options) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getChannelUsers) entry`);
        return new Promise(function (resolve, reject) {
            let filterToApply = "format=full";
            if (options.format) {
                filterToApply = "format=" + options.format;
            }

            if (options.page > 0) {
                filterToApply += "&offset=";
                if (options.page > 1) {
                    filterToApply += (options.limit * (options.page - 1));
                } else {
                    filterToApply += 0;
                }
            }

            filterToApply += "&limit=" + Math.min(options.limit, 1000);

            if (options.type) {
                filterToApply += "&types=" + options.type;
            }

            that.http.get("/api/rainbow/channels/v1.0/channels/" + channelId + "/users?" + filterToApply, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getChannelUsers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getChannelUsers) REST result : ", json.total, " users in channel");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getChannelUsers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getChannelUsers) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAllUsersFromChannel(channelId) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteAllUsersFromChannel) entry`);
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId + "/users", that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteAllUsersFromChannel) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteAllUsersFromChannel) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteAllUsersFromChannel) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteAllUsersFromChannel) error : ", err);
                return reject(err);
            });
        });
    }

    updateChannelUsers(channelId, users) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateChannelUsers) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/channels/v1.0/channels/" + channelId + "/users", that.getRequestHeader(), {"data": users}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateChannelUsers) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateChannelUsers) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateChannelUsers) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateChannelUsers) error : ", err);
                return reject(err);
            });
        });
    }

    getChannelMessages(channelId, maxMessages: number = 100, beforeDate?: Date, afterDate?: Date) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getChannelMessages) entry`);
        return new Promise(function (resolve, reject) {
            let params: any = {max: maxMessages};
            if (beforeDate) {
                params.before = beforeDate;
            }
            if (afterDate) {
                params.after = afterDate;
            }
            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/items", that.getRequestHeader(), params, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getChannelMessages) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getChannelMessages) REST result : ", json.data.items.length);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getChannelMessages) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getChannelMessages) error : ", err);
                return reject(err);
            });
        });
    }

    likeItem(channelId, itemId, appreciation) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(likeItem) entry`);
        let data = {"appreciation": appreciation};
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/items/" + itemId + "/like", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(likeItem) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(likeItem) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(likeItem) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(likeItem) error : ", err);
                return reject(err);
            });
        });
    }

    getDetailedAppreciations(channelId, itemId) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getDetailedAppreciations) entry`);
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/channels/v1.0/channels/" + channelId + "/items/" + itemId + "/likes", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getDetailedAppreciations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getDetailedAppreciations) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getDetailedAppreciations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getDetailedAppreciations) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Delete item from a channel.
     * @param {string} channelId - The channel id.
     * @param {string} itemId - The item id to delete.
     * @returns {Promise<any>}
     */
    deleteChannelMessage(channelId, itemId) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteChannelMessage) entry`);
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId + "/items/" + itemId, that.getRequestHeader())
                .then((response) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(deleteChannelMessage) (" + channelId + ", " + itemId + ") -- success");
                    resolve(itemId);
                })
                .catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID, "(deleteChannelMessage) (" + channelId + ", " + itemId + ") -- failure -- ");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteChannelMessage) (" + channelId + ", " + itemId + ") -- failure -- ", err.message);
                    return reject(err);
                });
        });
    }

    //endregion Channels

    // Private helper to normalize channel items format
    private _chewReceivedItems(items: any[]): void {
        items.forEach((item) => {
            if (item.type === "urn:xmpp:channels:simple") {
                item["entry"] = {message: item.message};
                delete item.message;
            }
            item.displayId = item.id + "-" + item.timestamp;
            item.modified = item.creation !== undefined;
        });
    }

}

module.exports = {'RESTChannels': RESTChannels};
export {RESTChannels as RESTChannels};
