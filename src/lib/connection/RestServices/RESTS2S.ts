'use strict';

import {addParamToUrl, isDefined, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";
import {ErrorManager} from "../../common/ErrorManager";
import {ROOMROLE, CHATSTATE} from "../../services/S2SService";

const LOG_ID = "REST/S2S  - ";

/**
 * Handles all REST API calls related to S2S (Server-to-Server) connections and messaging.
 * Methods requiring connectionS2SInfo receive it as an injected parameter from RESTService.
 */
@logEntryExit(LOG_ID)
class RESTS2S extends GenericRESTService {
    public http: any;
    public _logger: any;

    static getClassName() { return 'RESTS2S'; }
    getClassName() { return RESTS2S.getClassName(); }
    static getAccessorName() { return 'rests2s'; }
    getAccessorName() { return RESTS2S.getAccessorName(); }

    constructor(_core, evtEmitter, _logger) {
        super(_core, _logger, LOG_ID);
        this.setLogLevels(this);
        this._logger = _logger;
    }

    start(http) {
        return new Promise((resolve) => {
            this.http = http;
            resolve(undefined);
        });
    }

    stop() {
        return new Promise((resolve) => { resolve(undefined); });
    }

    //region S2S

    async listConnectionsS2S(): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(listConnectionsS2S) entry`);
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/ucs/v1.0/connections", that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(listConnectionsS2S) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(listConnectionsS2S) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(listConnectionsS2S) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(listConnectionsS2S) error : ", err);
                return reject(err);
            });
        });
    }

    /** @param {string} connectionId injected from RESTService (connectionS2SInfo?.id) */
    async sendS2SPresence(obj, connectionId: string): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(sendS2SPresence) entry`);
        that._logger.log(that.INTERNAL, LOG_ID + "(sendS2SPresence) Set S2S presence : ", obj);
        return new Promise(function (resolve, reject) {
            let data = obj ? {presence: {show: obj.show, status: obj.status}} : {presence: {show: "", status: ""}};
            if (!connectionId) {
                that._logger.log(that.ERROR, LOG_ID, "(sendS2SPresence) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendS2SPresence) error connectionId is not defined.");
                return reject({code: -1, label: "connectionId is not defined!!!"});
            }
            that.http.put("/api/rainbow/ucs/v1.0/connections/" + connectionId + "/presences", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(sendS2SPresence) successfull.");
                json = json ? json : {};
                that._logger.log(that.INTERNAL, LOG_ID + "(sendS2SPresence) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(sendS2SPresence) error.");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendS2SPresence) error : ", err);
                return reject(err);
            });
        });
    }

    async deleteConnectionsS2S(connexions): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteConnectionsS2S) entry`);
        that._logger.log(that.DEBUG, LOG_ID + "(deleteConnectionsS2S) will del cnx S2S");
        that._logger.log(that.INFO, LOG_ID + "(deleteConnectionsS2S) will del cnx S2S : ", connexions);
        const requests = [];
        connexions.forEach(cnx => requests.push(
            that.http.delete("/api/rainbow/ucs/v1.0/connections/" + cnx.id, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteConnectionsS2S) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteConnectionsS2S) REST result : ", json);
                return json?.data;
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteConnectionsS2S) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteConnectionsS2S) error : ", err);
                return err;
            })
        ));
        return Promise.all(connexions).then(response => {
            that._logger.log(that.DEBUG, LOG_ID + "(deleteConnectionsS2S) all successfull");
            return response;
        });
    }

    async loginS2S(callback_url): Promise<any> {
        let that = this;
        let data = {connection: {callback_url}};
        that._logger.log(that.INFO, LOG_ID + `(loginS2S) entry`);
        that._logger.log(that.DEBUG, LOG_ID + "(loginS2S)  will login  S2S.");
        that._logger.log(that.INTERNAL, LOG_ID + "(loginS2S) will login S2S : ", data);
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/ucs/v1.0/connections", that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.INFO, LOG_ID + "(loginS2S) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(loginS2S) REST result : ", json);
                resolve(json?.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(loginS2S) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(loginS2S) error : ", err);
                return reject(err);
            });
        });
    }

    async infoS2S(s2sConnectionId): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(infoS2S) entry`);
        that._logger.log(that.DEBUG, LOG_ID + "(infoS2S)  will get info S2S");
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/ucs/v1.0/connections/" + s2sConnectionId, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(infoS2S) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(infoS2S) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(infoS2S) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(infoS2S) error : ", err);
                return reject(err);
            });
        });
    }

    async setS2SConnection(connectionId): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(setS2SConnection) entry`);
        that._logger.log(that.DEBUG, LOG_ID + "(setS2SConnection)  will get info S2S and save the session infos.");
        return that.infoS2S(connectionId);
    }

    /** @param {string} connectionId injected from RESTService (connectionS2SInfo?.id) */
    async sendS2SMessageInConversation(conversationId: string, msg: any, connectionId: string): Promise<any> {
        // POST https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{cvId}/messages
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(sendS2SMessageInConversation) entry`);
        return new Promise(function (resolve, reject) {
            if (!msg) {
                that._logger.log(that.DEBUG, LOG_ID + "(sendS2SMessageInConversation) No msg provided");
                resolve(null);
            } else {
                that.http.post("/api/rainbow/ucs/v1.0/connections/" + connectionId + "/conversations/" + conversationId + "/messages", that.getRequestHeader(), msg, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(sendS2SMessageInConversation) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(sendS2SMessageInConversation) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(sendS2SMessageInConversation) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(sendS2SMessageInConversation) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    /** @param {string} connectionId injected from RESTService (connectionS2SInfo?.id) */
    async sendS2SCorrectedChatMessage(conversationId: string, origMsgId: string, msg: any, connectionId: string): Promise<any> {
        // POST https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{cvId}/messages/{msgId}/reply
        // API https://api.openrainbow.org/doc/api/ucs/redoc-index.html#tag/Message/operation/Message.reply
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(sendS2SCorrectedChatMessage) entry`);
        return new Promise(function (resolve, reject) {
            if (!msg) {
                that._logger.log(that.DEBUG, LOG_ID + "(sendS2SCorrectedChatMessage) No msg provided");
                resolve(null);
            } else {
                let url = "/api/rainbow/ucs/v1.0/connections/" + connectionId + "/conversations/" + conversationId + "/messages/" + origMsgId + "/reply";
                that.http.post(url, that.getRequestHeader(), msg, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(sendS2SCorrectedChatMessage) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(sendS2SCorrectedChatMessage) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(sendS2SCorrectedChatMessage) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(sendS2SCorrectedChatMessage) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    /** @param {string} connectionId injected from RESTService (connectionS2SInfo?.id) */
    async sendS2SForwardChatMessage(conversationId: string, msgId: string, msg, conversationDestId: string, connectionId: string): Promise<any> {
        // POST https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{cvId}/messages/{msgId}/forward/{id}
        // API https://api.openrainbow.org/doc/api/ucs/redoc-index.html#tag/Message/operation/Message.forward
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(sendS2SForwardChatMessage) entry`);
        return new Promise(function (resolve, reject) {
            if (!msg) {
                that._logger.log(that.DEBUG, LOG_ID + "(sendS2SForwardChatMessage) No msg provided");
                resolve(null);
            } else {
                let url = "/api/rainbow/ucs/v1.0/connections/" + connectionId + "/conversations/" + conversationId + "/messages/" + msgId + "/forward" + conversationDestId;
                that.http.post(url, that.getRequestHeader(), msg, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(sendS2SForwardChatMessage) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(sendS2SForwardChatMessage) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(sendS2SForwardChatMessage) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(sendS2SForwardChatMessage) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    /** @param {string} connectionId injected from RESTService (connectionS2SInfo?.id) */
    sendS2SChatState(conversationId: string, state: CHATSTATE, connectionId: string): Promise<any> {
        // PUT /api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{cvId}/chatstate/{state}
        // API https://api.openrainbow.org/doc/api/ucs/redoc-index.html#tag/Conversation/operation/Conversation.chatstate
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(sendS2SChatState) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.HTTP, LOG_ID + "(sendS2SChatState) REST.");
            let url: string = "/api/rainbow/ucs/v1.0/connections/" + connectionId + "/conversations/" + conversationId + "/chatstate/" + state;
            if (!isDefined(conversationId)) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater conversationId undefined";
                error.label += "bad request paramater conversationId undefined";
                error.cause = conversationId;
                that._logger.log(that.WARN, LOG_ID + `(sendS2SChatState) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(sendS2SChatState) bad request paramater conversationId undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }
            if (!isDefined(state)) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater state undefined";
                error.label += "bad request paramater state undefined";
                error.cause = state;
                that._logger.log(that.WARN, LOG_ID + `(sendS2SChatState) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(sendS2SChatState) bad request paramater state undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }
            that._logger.log(that.INTERNAL, LOG_ID + "(sendS2SChatState) REST peerId : ", conversationId, " state : ", state);
            that.http.put(url, that.getRequestHeader(), {}, undefined).then((json) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(sendS2SChatState) REST result : ", json);
                that._logger.log(that.DEBUG, LOG_ID + "(sendS2SChatState) REST success.");
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(sendS2SChatState) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendS2SChatState) error : ", err);
                return reject(err);
            });
        });
    }

    /** @param {string} connectionId injected from RESTService (connectionS2SInfo?.id) */
    async getS2SServerConversation(conversationId, connectionId: string): Promise<any> {
        // GET https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{id}
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getS2SServerConversation) entry`);
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/ucs/v1.0/connections/" + connectionId + "/conversations/" + conversationId, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getS2SServerConversation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getS2SServerConversation) REST result : " + JSON.stringify(json) + " conversations");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getS2SServerConversation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getS2SServerConversation) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @param {string} conversationId Id of conversation
     * @param {number} limit Maximum number of messages to return (0 for counting)
     * @param {number} before Get messages before this Epoch timestamp in microseconds
     * @param {number} after Get messages after this Epoch timestamp in microseconds
     * @param {string} connectionId injected from RESTService (connectionS2SInfo?.id)
     */
    async getS2SMessagesByConversationId(conversationId, limit, before, after, connectionId: string): Promise<any> {
        // GET https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{cvId}/messages
        // API https://api.openrainbow.org/doc/api/ucs/redoc-index.html#tag/Message/operation/Message.index
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getS2SMessagesByConversationId) entry`);
        return new Promise((resolve, reject) => {
            let url: string = "/api/rainbow/ucs/v1.0/connections/" + connectionId + "/conversations/" + conversationId + "/messages";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "before", before);
            addParamToUrl(urlParamsTab, "after", after);
            url = urlParamsTab[0];

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getS2SMessagesByConversationId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getS2SMessagesByConversationId) REST result : " + JSON.stringify(json) + " conversations");
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getS2SMessagesByConversationId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getS2SMessagesByConversationId) error : ", err);
                return reject(err);
            });
        });
    }

    /** @param {any} connectionS2SInfo injected from RESTService (full connectionS2SInfo object) */
    async checkS2Sconnection(connectionS2SInfo: any): Promise<any> {
        // GET https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(checkS2Sconnection) entry`);
        return new Promise((resolve, reject) => {
            if (!connectionS2SInfo) {
                return reject({message: "connectionS2SInfo is not defined"});
            }
            that.http.head("/api/rainbow/ucs/v1.0/connections/" + connectionS2SInfo.id, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(checkS2Sconnection) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(checkS2Sconnection) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(checkS2Sconnection) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(checkS2Sconnection) error : ", err);
                return reject(err);
            });
        });
    }

    /** @param {any} connectionS2SInfo injected from RESTService (full connectionS2SInfo object) */
    async checkS2SAuthentication(connectionS2SInfo: any): Promise<boolean> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(checkS2SAuthentication) entry`);
        let authStatus = false;
        try {
            let authenticationValidator = await that.checkS2Sconnection(connectionS2SInfo);
            that._logger.log(that.DEBUG, LOG_ID + "(checkS2SAuthentication) S2S authentication authenticationValidator : ", authenticationValidator);
            if (authenticationValidator.id) {
                authStatus = true;
            }
        } catch (err) {
            that._logger.log(that.DEBUG, LOG_ID + "(checkS2SAuthentication) S2S authentication check authenticationValidator failed : ", err);
            authStatus = false;
        }
        return authStatus;
    }

    /**
     * @param roomid
     * @param {string} role Enum: "member" "moderator" of your role in this room
     * @param {string} connectionId injected from RESTService (connectionS2SInfo?.id)
     */
    async joinS2SRoom(roomid, role: ROOMROLE, connectionId: string): Promise<any> {
        // POST https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/rooms/{roomId}/join
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(joinS2SRoom) entry`);
        return new Promise(function (resolve, reject) {
            if (!roomid) {
                that._logger.log(that.DEBUG, LOG_ID + "(joinS2SRoom) No roomid provided");
                reject({code: -1, label: "roomid is not defined!!!"});
            } else {
                that.http.post("/api/rainbow/ucs/v1.0/connections/" + connectionId + "/rooms/" + roomid + "/join", that.getRequestHeader(), undefined, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(joinS2SRoom) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(joinS2SRoom) REST result : ", json);
                    resolve(json);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(joinS2SRoom) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(joinS2SRoom) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    //endregion S2S

}

module.exports = {'RESTS2S': RESTS2S};
export {RESTS2S as RESTS2S};
