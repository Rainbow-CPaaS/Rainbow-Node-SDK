'use strict';

import {addParamToUrl, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService";
import {HTTPService} from "../HttpService.js";

const ErrorCase = require('../../common/ErrorManager');
const LOG_ID = "REST/ROOM - ";

@logEntryExit(LOG_ID)
class RESTRoom extends GenericRESTService {
    public http: HTTPService;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTRoom'; }
    getClassName() { return RESTRoom.getClassName(); }
    static getAccessorName() { return 'restroom'; }
    getAccessorName() { return RESTRoom.getAccessorName(); }

    constructor(_core, evtEmitter, _logger) {
        super(_core, _logger, LOG_ID);
        this.setLogLevels(this);
        let that = this;
        that.evtEmitter = evtEmitter;
        that._logger = _logger;
    }

    start(http: HTTPService) {
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

    // --- Admin room operations ---

    /**
     * Retrieves all rooms managed for the company (admin).
     * @param {object} [params] - Optional query params: format, name, limit, offset, sortField, sortOrder, nbUsersToKeep
     * @returns {Promise<any>} List of rooms
     */
    async getRoomsAsAdmin(params?: {
        format?: string; name?: string; limit?: number; offset?: number;
        sortField?: string; sortOrder?: string; nbUsersToKeep?: number;
    }): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getRoomsAsAdmin) entry`);
        try {
            let url = "/api/rainbow/room/v1.0/admin/rooms";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (params) {
                if (params.format !== undefined) addParamToUrl(urlParamsTab, "format", params.format);
                if (params.name !== undefined) addParamToUrl(urlParamsTab, "name", params.name);
                if (params.limit !== undefined) addParamToUrl(urlParamsTab, "limit", String(params.limit));
                if (params.offset !== undefined) addParamToUrl(urlParamsTab, "offset", String(params.offset));
                if (params.sortField !== undefined) addParamToUrl(urlParamsTab, "sortField", params.sortField);
                if (params.sortOrder !== undefined) addParamToUrl(urlParamsTab, "sortOrder", params.sortOrder);
                if (params.nbUsersToKeep !== undefined) addParamToUrl(urlParamsTab, "nbUsersToKeep", String(params.nbUsersToKeep));
            }
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + `(getRoomsAsAdmin) REST url : `, url);
            const json = await that.http.get(url, that.getRequestHeader(), undefined);
            that._logger.log(that.DEBUG, LOG_ID + `(getRoomsAsAdmin) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(getRoomsAsAdmin) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(getRoomsAsAdmin) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(getRoomsAsAdmin) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(getRoomsAsAdmin) error : `, err);
            throw err;
        }
    }

    /**
     * Creates a new managed room (admin).
     * @param {object} body - Room creation payload
     * @returns {Promise<any>} Created room data
     */
    async createRoomAsAdmin(body: any): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createRoomAsAdmin) entry`);
        try {
            const json = await that.http.post("/api/rainbow/room/v1.0/admin/rooms", that.getPostHeader(), body, undefined);
            that._logger.log(that.DEBUG, LOG_ID + `(createRoomAsAdmin) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(createRoomAsAdmin) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(createRoomAsAdmin) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(createRoomAsAdmin) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(createRoomAsAdmin) error : `, err);
            throw err;
        }
    }

    /**
     * Gets a managed room by its identifier (admin).
     * @param {string} roomId - Room identifier
     * @param {number} [nbUsersToKeep] - Max number of users to include in the response
     * @returns {Promise<any>} Room data
     */
    async getRoomByIdAsAdmin(roomId: string, nbUsersToKeep?: number): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getRoomByIdAsAdmin) entry`);
        try {
            let url = "/api/rainbow/room/v1.0/admin/rooms/" + roomId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (nbUsersToKeep !== undefined) addParamToUrl(urlParamsTab, "nbUsersToKeep", String(nbUsersToKeep));
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + `(getRoomByIdAsAdmin) REST url : `, url);
            const json = await that.http.get(url, that.getRequestHeader(), undefined);
            that._logger.log(that.DEBUG, LOG_ID + `(getRoomByIdAsAdmin) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(getRoomByIdAsAdmin) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(getRoomByIdAsAdmin) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(getRoomByIdAsAdmin) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(getRoomByIdAsAdmin) error : `, err);
            throw err;
        }
    }

    /**
     * Updates settings and/or users of a managed room (admin).
     * @param {string} roomId - Room identifier
     * @param {object} body - Update payload
     * @returns {Promise<any>} Updated room data
     */
    async updateRoomAsAdmin(roomId: string, body: any): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateRoomAsAdmin) entry`);
        try {
            const json = await that.http.put("/api/rainbow/room/v1.0/admin/rooms/" + roomId, that.getPostHeader(), body, undefined);
            that._logger.log(that.DEBUG, LOG_ID + `(updateRoomAsAdmin) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(updateRoomAsAdmin) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(updateRoomAsAdmin) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(updateRoomAsAdmin) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(updateRoomAsAdmin) error : `, err);
            throw err;
        }
    }

    /**
     * Deletes a managed room and cleans up all associated data (admin).
     * @param {string} roomId - Room identifier
     * @returns {Promise<any>} Deletion result
     */
    async deleteRoomAsAdmin(roomId: string): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteRoomAsAdmin) entry`);
        try {
            const json = await that.http.delete("/api/rainbow/room/v1.0/admin/rooms/" + roomId, that.getRequestHeader());
            that._logger.log(that.DEBUG, LOG_ID + `(deleteRoomAsAdmin) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(deleteRoomAsAdmin) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(deleteRoomAsAdmin) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(deleteRoomAsAdmin) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(deleteRoomAsAdmin) error : `, err);
            throw err;
        }
    }

    /**
     * Transfers ownership of a managed room to another user (admin).
     * @param {string} roomId - Room identifier
     * @param {object} body - Rehost payload
     * @returns {Promise<any>} Rehost result
     */
    async rehostRoomAsAdmin(roomId: string, body: any): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(rehostRoomAsAdmin) entry`);
        try {
            const json = await that.http.put("/api/rainbow/room/v1.0/admin/rooms/" + roomId + "/rehost", that.getPostHeader(), body, undefined);
            that._logger.log(that.DEBUG, LOG_ID + `(rehostRoomAsAdmin) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(rehostRoomAsAdmin) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(rehostRoomAsAdmin) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(rehostRoomAsAdmin) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(rehostRoomAsAdmin) error : `, err);
            throw err;
        }
    }

    /**
     * Uploads an avatar image for a managed room (admin).
     * @param {string} roomId - Room identifier
     * @param {{ data: any, type: string }} binaryData - Avatar binary data and image MIME sub-type (e.g. "jpeg")
     * @returns {Promise<any>} Upload result
     */
    async uploadRoomAvatarAsAdmin(roomId: string, binaryData: { data: any; type: string }): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(uploadRoomAvatarAsAdmin) entry`);
        try {
            const json = await that.http.post(
                "/api/rainbow/room/v1.0/admin/rooms/" + roomId + "/avatars",
                that.getRequestHeader("application/json"),
                Buffer.from(binaryData.data),
                "image/" + binaryData.type
            );
            that._logger.log(that.DEBUG, LOG_ID + `(uploadRoomAvatarAsAdmin) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(uploadRoomAvatarAsAdmin) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(uploadRoomAvatarAsAdmin) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(uploadRoomAvatarAsAdmin) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(uploadRoomAvatarAsAdmin) error : `, err);
            throw err;
        }
    }

    /**
     * Deletes the avatar of a managed room (admin).
     * @param {string} roomId - Room identifier
     * @returns {Promise<any>} Deletion result
     */
    async deleteRoomAvatarAsAdmin(roomId: string): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteRoomAvatarAsAdmin) entry`);
        try {
            const json = await that.http.delete("/api/rainbow/room/v1.0/admin/rooms/" + roomId + "/avatars", that.getRequestHeader());
            that._logger.log(that.DEBUG, LOG_ID + `(deleteRoomAvatarAsAdmin) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(deleteRoomAvatarAsAdmin) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(deleteRoomAvatarAsAdmin) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(deleteRoomAvatarAsAdmin) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(deleteRoomAvatarAsAdmin) error : `, err);
            throw err;
        }
    }

    /**
     * Promotes some or all room users to moderator (admin).
     * @param {string} roomId - Room identifier
     * @param {object} body - Promotion payload
     * @returns {Promise<any>} Promotion result
     */
    async promoteSomeOrAllRoomUsersAsAdmin(roomId: string, body: any): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(promoteSomeOrAllRoomUsersAsAdmin) entry`);
        try {
            const json = await that.http.put("/api/rainbow/room/v1.0/admin/rooms/" + roomId + "/users/promote", that.getPostHeader(), body, undefined);
            that._logger.log(that.DEBUG, LOG_ID + `(promoteSomeOrAllRoomUsersAsAdmin) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(promoteSomeOrAllRoomUsersAsAdmin) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(promoteSomeOrAllRoomUsersAsAdmin) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(promoteSomeOrAllRoomUsersAsAdmin) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(promoteSomeOrAllRoomUsersAsAdmin) error : `, err);
            throw err;
        }
    }

    /**
     * Demotes some or all moderators to regular user (admin).
     * @param {string} roomId - Room identifier
     * @param {object} body - Demotion payload
     * @returns {Promise<any>} Demotion result
     */
    async demoteSomeOrAllRoomUsersAsAdmin(roomId: string, body: any): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(demoteSomeOrAllRoomUsersAsAdmin) entry`);
        try {
            const json = await that.http.put("/api/rainbow/room/v1.0/admin/rooms/" + roomId + "/users/demote", that.getPostHeader(), body, undefined);
            that._logger.log(that.DEBUG, LOG_ID + `(demoteSomeOrAllRoomUsersAsAdmin) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(demoteSomeOrAllRoomUsersAsAdmin) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(demoteSomeOrAllRoomUsersAsAdmin) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(demoteSomeOrAllRoomUsersAsAdmin) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(demoteSomeOrAllRoomUsersAsAdmin) error : `, err);
            throw err;
        }
    }

    /**
     * Removes some or all users from a managed room (admin).
     * @param {string} roomId - Room identifier
     * @param {object} body - Deletion payload
     * @returns {Promise<any>} Deletion result
     */
    async deleteSomeOrAllRoomUsersAsAdmin(roomId: string, body: any): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteSomeOrAllRoomUsersAsAdmin) entry`);
        try {
            const json = await that.http.put("/api/rainbow/room/v1.0/admin/rooms/" + roomId + "/users/delete", that.getPostHeader(), body, undefined);
            that._logger.log(that.DEBUG, LOG_ID + `(deleteSomeOrAllRoomUsersAsAdmin) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(deleteSomeOrAllRoomUsersAsAdmin) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(deleteSomeOrAllRoomUsersAsAdmin) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(deleteSomeOrAllRoomUsersAsAdmin) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(deleteSomeOrAllRoomUsersAsAdmin) error : `, err);
            throw err;
        }
    }

    // --- Enduser room operations ---

    /**
     * Retrieves push-to-talk rooms the current user is a member of.
     * @param {object} [params] - Optional query params: format, nbUsersToKeep
     * @returns {Promise<any>} Push-to-talk rooms
     */
    async getMyPushToTalk(params?: { format?: string; nbUsersToKeep?: number }): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getMyPushToTalk) entry`);
        try {
            let url = "/api/rainbow/room/v1.0/enduser/rooms/push-to-talk";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (params) {
                if (params.format !== undefined) addParamToUrl(urlParamsTab, "format", params.format);
                if (params.nbUsersToKeep !== undefined) addParamToUrl(urlParamsTab, "nbUsersToKeep", String(params.nbUsersToKeep));
            }
            url = urlParamsTab[0];
            that._logger.log(that.INTERNAL, LOG_ID + `(getMyPushToTalk) REST url : `, url);
            const json = await that.http.get(url, that.getRequestHeader(), undefined);
            that._logger.log(that.DEBUG, LOG_ID + `(getMyPushToTalk) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(getMyPushToTalk) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(getMyPushToTalk) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(getMyPushToTalk) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(getMyPushToTalk) error : `, err);
            throw err;
        }
    }

    /**
     * Clears the content (messages/files) of a room.
     * @param {string} roomId - Room identifier
     * @param {object} body - Clear content payload
     * @returns {Promise<any>} Clear result
     */
    async clearRoomContent(roomId: string, body: any): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(clearRoomContent) entry`);
        try {
            const json = await that.http.post("/api/rainbow/room/v1.0/enduser/rooms/" + roomId + "/clearcontent", that.getPostHeader(), body, undefined);
            that._logger.log(that.DEBUG, LOG_ID + `(clearRoomContent) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(clearRoomContent) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(clearRoomContent) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(clearRoomContent) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(clearRoomContent) error : `, err);
            throw err;
        }
    }

    // --- Infrastructure / backend operations ---

    /**
     * Checks that the Room portal server is reachable and healthy.
     * @returns {Promise<any>} Ping result
     */
    async getApiRainbowPing(): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getApiRainbowPing) entry`);
        try {
            const json = await that.http.get("/api/rainbow/ping", that.getRequestHeader(), undefined);
            that._logger.log(that.DEBUG, LOG_ID + `(getApiRainbowPing) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(getApiRainbowPing) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(getApiRainbowPing) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(getApiRainbowPing) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(getApiRainbowPing) error : `, err);
            throw err;
        }
    }

    /**
     * Retrieves the version and description of the Room portal server.
     * @returns {Promise<any>} About data
     */
    async getApiRainbowRoomV10About(): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getApiRainbowRoomV10About) entry`);
        try {
            const json = await that.http.get("/api/rainbow/room/v1.0/about", that.getRequestHeader(), undefined);
            that._logger.log(that.DEBUG, LOG_ID + `(getApiRainbowRoomV10About) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(getApiRainbowRoomV10About) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(getApiRainbowRoomV10About) exit`);
            return json;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(getApiRainbowRoomV10About) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(getApiRainbowRoomV10About) error : `, err);
            throw err;
        }
    }

    /**
     * Retrieves all available performance metrics from the Room portal.
     * @returns {Promise<any>} Metrics data
     */
    async getMetrics(): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getMetrics) entry`);
        try {
            const json = await that.http.get("/api/rainbow/metrics", that.getRequestHeader(), undefined);
            that._logger.log(that.DEBUG, LOG_ID + `(getMetrics) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(getMetrics) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(getMetrics) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(getMetrics) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(getMetrics) error : `, err);
            throw err;
        }
    }

    /**
     * Clears all performance metrics on the Room portal.
     * @returns {Promise<any>} Deletion result
     */
    async deleteMetrics(): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteMetrics) entry`);
        try {
            const json = await that.http.delete("/api/rainbow/metrics", that.getRequestHeader());
            that._logger.log(that.DEBUG, LOG_ID + `(deleteMetrics) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(deleteMetrics) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(deleteMetrics) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(deleteMetrics) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(deleteMetrics) error : `, err);
            throw err;
        }
    }

    /**
     * Changes the server-side log levels (console/file/syslog).
     * @param {{ console?: string, file?: string, syslog?: string }} body - Log levels payload
     * @returns {Promise<any>} Update result
     */
    async putApiRainbowLogsLevels(body: { console?: string; file?: string; syslog?: string }): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(putApiRainbowLogsLevels) entry`);
        try {
            const json = await that.http.put("/api/rainbow/logs/levels", that.getPostHeader(), body, undefined);
            that._logger.log(that.DEBUG, LOG_ID + `(putApiRainbowLogsLevels) successfull`);
            that._logger.log(that.INTERNAL, LOG_ID + `(putApiRainbowLogsLevels) REST result : `, json);
            that._logger.log(that.INFO, LOG_ID + `(putApiRainbowLogsLevels) exit`);
            return json?.data;
        } catch (err) {
            that._logger.log(that.ERROR, LOG_ID, `(putApiRainbowLogsLevels) error`);
            that._logger.log(that.INTERNALERROR, LOG_ID, `(putApiRainbowLogsLevels) error : `, err);
            throw err;
        }
    }
}

export {RESTRoom};
module.exports.RESTRoom = RESTRoom;
