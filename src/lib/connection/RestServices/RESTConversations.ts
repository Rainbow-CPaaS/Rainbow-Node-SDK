'use strict';

import {addParamToUrl, addPropertyToObj, isDefined, logEntryExit} from "../../common/Utils";
import {GenericRESTService} from "../GenericRESTService.js";
import {ErrorManager} from "../../common/ErrorManager";
import {PEERTYPE} from "../../common/models/Conversation.js";

const LOG_ID = "REST/CONV - ";

/**
 * Handles all REST API calls related to Conversations, IMS, and Messages (including Pin list).
 */
@logEntryExit(LOG_ID)
class RESTConversations extends GenericRESTService {
    public http: any;
    public _logger: any;
    public evtEmitter: any;

    static getClassName() { return 'RESTConversations'; }
    getClassName() { return RESTConversations.getClassName(); }
    static getAccessorName() { return 'restconversations'; }
    getAccessorName() { return RESTConversations.getAccessorName(); }

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

    //region Conversations

    async getTheNumberOfHitsOfASubstringInAllUsersconversations(userId: string, substring: string, limit: number = 100, webinar: boolean = true) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getTheNumberOfHitsOfASubstringInAllUsersconversations) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) REST userId : ", userId);

            let url: string = "/api/rainbow/admin/v1.0/users/" + userId + "/profiles";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "substring", substring);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "webinar", webinar);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getTheNumberOfHitsOfASubstringInAllUsersconversations) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getTheNumberOfHitsOfASubstringInAllUsersconversations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getTheNumberOfHitsOfASubstringInAllUsersconversations) error : ", err);
                return reject(err);
            });
        });
    }

    getServerConversations(accountId: string, format: string = "small", maxCount: number = undefined, lastUpdateDate: string = undefined, limit: number = 1000, offset: number = 0, before: number = 1) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getServerConversations) entry`);
        return new Promise((resolve, reject) => {
            that._logger.log(that.INTERNAL, LOG_ID + "(getServerConversations) REST format : ", format);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + accountId + "/conversations?format=" + format;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "maxCount", maxCount);
            addParamToUrl(urlParamsTab, "lastUpdateDate", lastUpdateDate);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "before", before);
            url = urlParamsTab[0];

            that._logger.log(that.INTERNAL, LOG_ID + "(getServerConversations) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(getServerConversations) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(getServerConversations) REST result : " + JSON.stringify(json) + " conversations");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getServerConversations) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getServerConversations) error : ", err);
                return reject(err);
            });
        });
    }

    createServerConversation(accountId: string, conversation) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(createServerConversation) entry`);
        return new Promise((resolve, reject) => {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + accountId + "/conversations", that.getRequestHeader(), conversation, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(createServerConversation) successfull");
                that._logger.log(that.DEBUG, LOG_ID + "(createServerConversation) REST result : ", json);
                resolve(json?.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(createServerConversation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(createServerConversation) error : ", err);
                return reject(err);
            });
        });
    }

    deleteServerConversation(accountId: string, conversationId) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteServerConversation) entry`);
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/users/" + accountId + "/conversations/" + conversationId, that.getRequestHeader()).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteServerConversation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteServerConversation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteServerConversation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteServerConversation) error : ", err);
                return reject(err);
            });
        });
    }

    updateServerConversation(accountId: string, conversationId, mute) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateServerConversation) entry`);
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + accountId + "/conversations/" + conversationId, that.getRequestHeader(), {"mute": mute}, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(updateServerConversation) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateServerConversation) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updateServerConversation) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateServerConversation) error : ", err);
                return reject(err);
            });
        });
    }

    sendConversationByEmail(accountId: string, conversationId, emails: Array<string> = undefined, lang: string = undefined) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(sendConversationByEmail) entry`);
        return new Promise((resolve, reject) => {
            let data: any = {};
            if (emails) {
                data.emails = emails;
            }
            if (lang) {
                data.lang = lang;
            }

            that.http.post("/api/rainbow/enduser/v1.0/users/" + accountId + "/conversations/" + conversationId + "/downloads", that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(sendConversationByEmail) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(sendConversationByEmail) REST result : ", json);
                resolve(json?.data);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(sendConversationByEmail) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(sendConversationByEmail) error : ", err);
                return reject(err);
            });
        });
    }

    ackAllMessages(accountId: string, conversationId, maskRead: boolean = false) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(ackAllMessages) entry`);
        return new Promise(function (resolve, reject) {
            let data: any = {};
            data.maskRead = maskRead;

            that.http.put("/api/rainbow/enduser/v1.0/users/" + accountId + "/conversations/" + conversationId + "/markallread", that.getRequestHeader(), data, undefined).then(function (json) {
                that._logger.log(that.DEBUG, LOG_ID + "(ackAllMessages) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(ackAllMessages) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(ackAllMessages) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(ackAllMessages) error : ", err);
                return reject(err);
            });
        });
    }

    updateConversationBookmark(userId: string, conversationId: string, messageId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updateConversationBookmark) entry`);
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/conversations/" + conversationId + "/bookmark";
            let data: any = {};
            if (messageId) {
                data.messageId = messageId;
            }

            that.http.post(url, that.getRequestHeader(), data, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(updateConversationBookmark) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(updateConversationBookmark) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID, "(updateConversationBookmark) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updateConversationBookmark) error : ", err);
                return reject(err);
            });
        });
    }

    deleteConversationBookmark(userId: string, conversationId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(deleteConversationBookmark) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/conversations/" + conversationId + "/bookmark";
            let params: any = {};

            that._logger.log(that.INTERNAL, LOG_ID + "(deleteConversationBookmark) REST ");

            that.http.delete(url, that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(deleteConversationBookmark) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(deleteConversationBookmark) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(deleteConversationBookmark) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(deleteConversationBookmark) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Conversations

    //region IMS

    retrieveXMPPMessagesByListOfMessageIds(userId: string, ims: Array<any>) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(retrieveXMPPMessagesByListOfMessageIds) entry`);
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/enduser/v1.0/users/" + userId + "/ims";
            let param = {"ims": ims};
            that._logger.log(that.INTERNAL, LOG_ID + "(retrieveXMPPMessagesByListOfMessageIds) REST ims : ", ims);

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(retrieveXMPPMessagesByListOfMessageIds) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(retrieveXMPPMessagesByListOfMessageIds) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(retrieveXMPPMessagesByListOfMessageIds) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(retrieveXMPPMessagesByListOfMessageIds) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion IMS

    //region Messages

    showAllMatchingMessagesForAPeer(userId: string, substring: string, peer: string, isRoom: boolean = undefined, limit: number = 20) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(showAllMatchingMessagesForAPeer) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(showAllMatchingMessagesForAPeer) REST.");
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/conversations/search/hits";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "substring", substring);
            addParamToUrl(urlParamsTab, "peer", peer);
            addParamToUrl(urlParamsTab, "isRoom", isRoom);
            addParamToUrl(urlParamsTab, "limit", limit);
            url = urlParamsTab[0];

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(showAllMatchingMessagesForAPeer) REST result : ", json);
                that._logger.log(that.DEBUG, LOG_ID + "(showAllMatchingMessagesForAPeer) REST success.");
                resolve(json);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(showAllMatchingMessagesForAPeer) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(showAllMatchingMessagesForAPeer) error : ", err);
                return reject(err);
            });
        });
    }

    markMessageAsRead(connectionId: string, conversationId, messageId) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(markMessageAsRead) entry`);
        return new Promise(function (resolve, reject) {
            if (!conversationId) {
                that._logger.log(that.DEBUG, LOG_ID + "(markMessageAsRead) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(markMessageAsRead) No conversationId provided");
                reject({code: -1, label: "conversationId is not defined!!!"});
            } else if (!messageId) {
                that._logger.log(that.DEBUG, LOG_ID + "(markMessageAsRead) failed");
                that._logger.log(that.DEBUG, LOG_ID + "(markMessageAsRead) No messageId provided");
                reject({code: -1, label: "messageId is not defined!!!"});
            } else {
                that.http.put("/api/rainbow/ucs/v1.0/connections/" + connectionId + "/conversations/" + conversationId + "/messages/" + messageId + "/read", that.getRequestHeader(), {}, undefined).then(function (json) {
                    that._logger.log(that.DEBUG, LOG_ID + "(markMessageAsRead) successfull");
                    that._logger.log(that.INTERNAL, LOG_ID + "(markMessageAsRead) REST result : ", json);
                    resolve(json?.data);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID, "(markMessageAsRead) error");
                    that._logger.log(that.INTERNALERROR, LOG_ID, "(markMessageAsRead) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    //region Pin list

    addPinWithPeerId(userId: string, peerId: string, types: PEERTYPE, body: any): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(addPinWithPeerId) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(addPinWithPeerId) REST.");
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/pins/" + types + "/" + peerId;
            if (!isDefined(peerId)) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater peerId undefined";
                error.label += "bad request paramater peerId undefined";
                error.cause = peerId;
                that._logger.log(that.WARN, LOG_ID + `(addPinWithPeerId) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(addPinWithPeerId) bad request paramater peerId undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }
            if (!isDefined(types) || types === PEERTYPE.UNKNOWN) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater types undefined";
                error.label += "bad request paramater types undefined";
                error.cause = types;
                that._logger.log(that.WARN, LOG_ID + `(addPinWithPeerId) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(addPinWithPeerId) bad request paramater types undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }

            let param = {};
            addPropertyToObj(param, "peerId", body.peerId, false);
            addPropertyToObj(param, "peerJid", body.peerJid, false);
            addPropertyToObj(param, "conversationJid", body.conversationJid, false);
            addPropertyToObj(param, "messageId", body.messageId, false);
            addPropertyToObj(param, "messageTimestamp", body.messageTimestamp, false);
            addPropertyToObj(param, "text", body.text, false);
            addPropertyToObj(param, "fileInfo", body.fileInfo, false);
            addPropertyToObj(param, "creationDate", body.creationDate, false);

            that._logger.log(that.INTERNAL, LOG_ID + "(addPinWithPeerId) REST peerId : ", peerId, " param : ", param);

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(addPinWithPeerId) REST result : ", json);
                that._logger.log(that.DEBUG, LOG_ID + "(addPinWithPeerId) REST success.");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(addPinWithPeerId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(addPinWithPeerId) error : ", err);
                return reject(err);
            });
        });
    }

    getPinWithPeerIdById(userId: string, types: PEERTYPE, peerId: string, pinId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getPinWithPeerIdById) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getPinWithPeerIdById) REST.");
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/pins/" + types + "/" + peerId + "/" + pinId;
            if (!isDefined(peerId)) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater peerId undefined";
                error.label += "bad request paramater peerId undefined";
                error.cause = peerId;
                that._logger.log(that.WARN, LOG_ID + `(getPinWithPeerIdById) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(getPinWithPeerIdById) bad request paramater peerId undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }
            if (!isDefined(types)) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater types undefined";
                error.label += "bad request paramater types undefined";
                error.cause = types;
                that._logger.log(that.WARN, LOG_ID + `(getPinWithPeerIdById) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(getPinWithPeerIdById) bad request paramater types undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(getPinWithPeerIdById) REST peerId : ", peerId);

            that.http.get(url, that.getRequestHeader(), undefined, undefined).then((json) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(getPinWithPeerIdById) REST result : ", json);
                that._logger.log(that.DEBUG, LOG_ID + "(getPinWithPeerIdById) REST success.");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getPinWithPeerIdById) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getPinWithPeerIdById) error : ", err);
                return reject(err);
            });
        });
    }

    getAllPinsWithPeerId(userId: string, types: PEERTYPE, peerId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(getAllPinsWithPeerId) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(getAllPinsWithPeerId) REST.");
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/pins/" + types + "/" + peerId;
            if (!isDefined(peerId)) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater peerId undefined";
                error.label += "bad request paramater peerId undefined";
                error.cause = peerId;
                that._logger.log(that.WARN, LOG_ID + `(getAllPinsWithPeerId) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(getAllPinsWithPeerId) bad request paramater peerId undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }
            if (!isDefined(types)) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater types undefined";
                error.label += "bad request paramater types undefined";
                error.cause = types;
                that._logger.log(that.WARN, LOG_ID + `(getAllPinsWithPeerId) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(getAllPinsWithPeerId) bad request paramater types undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }

            that._logger.log(that.INTERNAL, LOG_ID + "(getAllPinsWithPeerId) REST peerId : ", peerId);

            that.http.get(url, that.getRequestHeader(), undefined, undefined).then((json) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(getAllPinsWithPeerId) REST result : ", json);
                that._logger.log(that.DEBUG, LOG_ID + "(getAllPinsWithPeerId) REST success.");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(getAllPinsWithPeerId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(getAllPinsWithPeerId) error : ", err);
                return reject(err);
            });
        });
    }

    removefromWithPeerIdAndPinId(userId: string, types: string, peerId: string, pinId: string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(removefromWithPeerIdAndPinId) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(removefromWithPeerIdAndPinId) REST.");
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/pins/" + types + "/" + peerId + "/" + pinId;
            if (!isDefined(peerId)) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater peerId undefined";
                error.label += "bad request paramater peerId undefined";
                error.cause = peerId;
                that._logger.log(that.WARN, LOG_ID + `(removefromWithPeerIdAndPinId) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(removefromWithPeerIdAndPinId) bad request paramater peerId undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }
            if (!isDefined(types)) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater types undefined";
                error.label += "bad request paramater types undefined";
                error.cause = types;
                that._logger.log(that.WARN, LOG_ID + `(removefromWithPeerIdAndPinId) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(removefromWithPeerIdAndPinId) bad request paramater types undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }

            let param = undefined;
            that._logger.log(that.INTERNAL, LOG_ID + "(removefromWithPeerIdAndPinId) REST.");

            that.http.delete(url, that.getRequestHeader(), param).then((json) => {
                that._logger.log(that.DEBUG, LOG_ID + "(removefromWithPeerIdAndPinId) successfull");
                that._logger.log(that.INTERNAL, LOG_ID + "(removefromWithPeerIdAndPinId) REST result : ", json);
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(removefromWithPeerIdAndPinId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(removefromWithPeerIdAndPinId) error : ", err);
                return reject(err);
            });
        });
    }

    updatePinWithPeerId(userId: string, peerId?: string, types?: PEERTYPE, pinId?: string, body?: any): Promise<any> {
        let that = this;
        that._logger.log(that.INFO, LOG_ID + `(updatePinWithPeerId) entry`);
        return new Promise(function (resolve, reject) {
            that._logger.log(that.INTERNAL, LOG_ID + "(updatePinWithPeerId) REST.");
            let url: string = "/api/rainbow/enduser/v1.0/users/" + userId + "/pins/" + types + "/" + peerId + "/" + pinId;
            if (!isDefined(peerId)) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater peerId undefined";
                error.label += "bad request paramater peerId undefined";
                error.cause = peerId;
                that._logger.log(that.WARN, LOG_ID + `(updatePinWithPeerId) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(updatePinWithPeerId) bad request paramater peerId undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }
            if (!isDefined(types)) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater types undefined";
                error.label += "bad request paramater types undefined";
                error.cause = types;
                that._logger.log(that.WARN, LOG_ID + `(updatePinWithPeerId) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(updatePinWithPeerId) bad request paramater types undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }
            if (!isDefined(pinId)) {
                let error = ErrorManager.getErrorManager().BAD_REQUEST;
                error.msg += "bad request paramater pinId undefined";
                error.label += "bad request paramater pinId undefined";
                error.cause = pinId;
                that._logger.log(that.WARN, LOG_ID + `(updatePinWithPeerId) BAD_REQUEST.`);
                that._logger.log(that.INTERNALERROR, LOG_ID + `(updatePinWithPeerId) bad request paramater pinId undefined : `, error.cause, ", error : ", error);
                return reject(error);
            }

            let param = {};
            addPropertyToObj(param, "peerId", body.peerId, false);
            addPropertyToObj(param, "peerJid", body.peerJid, false);
            addPropertyToObj(param, "conversationJid", body.conversationJid, false);
            addPropertyToObj(param, "messageId", body.messageId, false);
            addPropertyToObj(param, "messageTimestamp", body.messageTimestamp, false);
            addPropertyToObj(param, "text", body.text, false);
            addPropertyToObj(param, "fileInfo", body.fileInfo, false);
            addPropertyToObj(param, "creationDate", body.creationDate, false);

            that._logger.log(that.INTERNAL, LOG_ID + "(updatePinWithPeerId) REST peerId : ", peerId, " param : ", param);

            that.http.put(url, that.getRequestHeader(), param, undefined).then((json) => {
                that._logger.log(that.INTERNAL, LOG_ID + "(updatePinWithPeerId) REST result : ", json);
                that._logger.log(that.DEBUG, LOG_ID + "(updatePinWithPeerId) REST success.");
                resolve(json?.data);
            }).catch(function (err) {
                that._logger.log(that.ERROR, LOG_ID, "(updatePinWithPeerId) error");
                that._logger.log(that.INTERNALERROR, LOG_ID, "(updatePinWithPeerId) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Pin list

    //endregion Messages

}

module.exports = {'RESTConversations': RESTConversations};
export {RESTConversations as RESTConversations};
