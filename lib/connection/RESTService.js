"use strict";

var jwt = require("jwt-decode");
var btoa = require("btoa");
var CryptoJS = require("crypto-js");

let backoff = require("backoff");

const Utils = require("../common/Utils.js");
let ErrorCase = require("../common/Error");

const RECONNECT_INITIAL_DELAY = 2000;
const RECONNECT_MAX_DELAY = 60000;

var getRequestHeader; 
var getRequestHeaderWithRange;
var getLoginHeader;
var getDefaultHeader;

const LOG_ID = "REST - ";

class RESTService {

    constructor(_credentials, _application, evtEmitter, _logger) {
        let that = this;
        this.http = null;
        this.cpaas = null;
        this.account = null;
        this.app = null;
        this.token = null;
        this.renewTokenInterval = null;
        this.auth = btoa(_credentials.login + ":" + _credentials.password);
        this._credentials = _credentials;
        this._application = _application;
        this._applicationToken = _application;
        this._applicationauth = null;
        this.loginEmail = _credentials.login;
        this.eventEmitter = evtEmitter;
        this.logger = _logger;

        this.maxAttemptToReconnect = 50;

        this.fibonacciStrategy = new backoff.FibonacciStrategy({randomisationFactor: 0.4, initialDelay: RECONNECT_INITIAL_DELAY, maxDelay: RECONNECT_MAX_DELAY});
        this.reconnectDelay = this.fibonacciStrategy.getInitialDelay();

        getRequestHeader = (accept) => { 

            let headers = { 
                "Authorization": "Bearer " + that.token, 
                "Accept": accept || "application/json",
            };

            if (that._applicationToken && that._applicationToken.length) {
                headers["x-rainbow-app-token"] = "Bearer " + that._applicationToken || "";
            }

            return headers;
        };

        getRequestHeaderWithRange = (accept, range) => {
            var header = getRequestHeader(accept);
			header.Range = range;
			return header;
        };

        getLoginHeader = () => { 
            let headers = { 
                "Accept": "application/json", 
                "Content-Type": "application/json",
                "Authorization": "Basic " + that.auth
            };

            let toEncrypt = that._application.appSecret + that._credentials.password;
            //that.logger.log("debug", LOG_ID + "toEncrypt : " + toEncrypt);
            let encrypted = CryptoJS.SHA256(toEncrypt).toString();
            //that.logger.log("debug", LOG_ID + "encrypted : " + encrypted);
            let base64 = btoa(that._application.appID + ':' + encrypted);
            //that.logger.log("debug", LOG_ID + "base64 : " + base64);

            if (that._applicationToken && that._applicationToken.length) {
                headers["x-rainbow-app-token"] = "Bearer " + that._applicationToken || "";
            }

            if (that._application.appSecret && base64 && base64.length) {
                headers["x-rainbow-app-auth"] = "Basic " + base64 || "";
            }

            return headers;
        };

        getDefaultHeader = () => {
            return { 
                "Accept": "application/json", 
                "Content-Type": "application/json"
            };
        };
    }

    get applicationToken() {
        return this._applicationToken;
    }

    set applicationToken( value) {
        this._applicationToken = value;
    }

    get userId() {
        return this.account ? this.account.id : "";
    }

    get loggedInUser() {
        return this.account;
    }

    start(http, cpaas, _applicationToken) {
        var that = this;
        this.http = http;
        this.cpaas = cpaas;
        this._applicationToken = _applicationToken;

        this.logger.log("debug", LOG_ID + "(start) _entering_");
        return new Promise((resolve) => {
            that.logger.log("info", LOG_ID + "(start) email used", that.loginEmail);
            that.logger.log("debug", LOG_ID + "(start) _exiting_");
            resolve();
        });
    }

    stop() {
        var that = this;
        
        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise((resolve, reject) => {
            that.signout().then(() => {
                that.logger.log("debug", LOG_ID + "(stop) Successfully stopped");
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve();
            }).catch((err) => {
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                reject(err);
            });
        });
    }

    signin() {

        var that = this;

        this.logger.log("debug", LOG_ID + "(signin) _entering_");

        return new Promise(function(resolve, reject) {
            that.http.get("/api/rainbow/authentication/v1.0/login", getLoginHeader()).then(function(JSON) {
                that.account = JSON.loggedInUser;
                that.app = JSON.loggedInApplication;
                that.token = JSON.token;
                that.logger.log("info", LOG_ID + "(signin) welcome " + that.account.displayName + "!");
                that.logger.log("debug", LOG_ID + "(signin) user informationi ", that.account);
                that.logger.log("debug", LOG_ID + "(signin) application information ", that.app);
                that.logger.log("debug", LOG_ID + "(signin) _exiting_");
                resolve(JSON);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, err);
                that.logger.log("debug", LOG_ID + "(signin) _exiting_");
                reject(err);
            });
        });
    }

    signout() {

        var that = this;

        this.logger.log("debug", LOG_ID + "(signout) _entering_");

        return new Promise(function(resolve, reject) {
            if (that.http) {
                that.http.get("/api/rainbow/authentication/v1.0/logout", getRequestHeader()).then(function(JSON) {
                    that.account = null;
                    that.token = null;
                    that.renewTokenInterval = null;
                    that.logger.log("info", LOG_ID + "(signout) Successfully signed-out!");
                    that.logger.log("debug", LOG_ID + "(signout) _exiting_");
                    resolve(JSON);
                }).catch(function(err) {
                    that.logger.log("error", LOG_ID, err);
                    that.logger.log("debug", LOG_ID + "(signout) _exiting_");
                    reject(err);
                });
            }
            else {
                that.logger.log("warn", LOG_ID + "(signout) seems to be already signed-out!");
                resolve(null);
            }
        });
    }

    startTokenSurvey() {

        var that = this;

        var decodedToken = jwt(that.token);
        this.logger.log("debug", LOG_ID + "(startTokenSurvey) - token", decodedToken);
        var halfExpirationDate = ( decodedToken.exp - decodedToken.iat ) / 2 + decodedToken.iat;
        var tokenExpirationTimestamp = halfExpirationDate * 1000;
        var expirationDate = new Date(tokenExpirationTimestamp);
        var currentDate = new Date();
        var currentTimestamp = currentDate.valueOf();
        var tokenExpirationDuration = tokenExpirationTimestamp - currentTimestamp;

        if (tokenExpirationDuration < 0) {
            this.logger.log("warn", LOG_ID + "(startTokenSurvey) auth token has already expired, re-new it immediately");
            this._renewAuthToken();
        }
        else if (tokenExpirationDuration < 300000) {
            this.logger.log("warn", LOG_ID + "(startTokenSurvey) auth token will expire in less 5 minutes, re-new it immediately");
            this._renewAuthToken();
        }
        else {
            var usedExpirationDuration = tokenExpirationDuration - 3600000; // Refresh 1 hour before the token expiration - negative values are well treated by settimeout
            this.logger.log("info", LOG_ID + "(startTokenSurvey) start token survey (expirationDate: " + expirationDate + " currentDate:" + currentDate + " tokenExpirationDuration: " + tokenExpirationDuration + "ms usedExpirationDuration: " + usedExpirationDuration + "ms)");
            if (this.renewTokenInterval) {
                this.logger.log("info", LOG_ID + "(startTokenSurvey) remove timer"); 
                clearTimeout(that.renewTokenInterval); 
            }
            this.logger.log("info", LOG_ID + "(startTokenSurvey) start a new timer for renewing token in " + usedExpirationDuration + "ms");
            this.renewTokenInterval = setTimeout(function() { 
                that._renewAuthToken();
            }, usedExpirationDuration);
        }
    }

    _renewAuthToken() {
        var that = this;

        this.logger.log("debug", LOG_ID + "(_renewAuthToken) _entering_");

        that.http.get("/api/rainbow/authentication/v1.0/renew", getRequestHeader()).then(function(JSON) {
            that.logger.log("info", LOG_ID + "(_renewAuthToken) renew authentication token success");
            that.token = JSON.token;
            that.logger.log("info", LOG_ID + "(_renewAuthToken) new token received", that.token);
            that.logger.log("debug", LOG_ID + "(_renewAuthToken) _exiting_");
            that.eventEmitter.emit("rainbow_tokenrenewed");
        }).catch(function(err) {
            that.logger.log("error", LOG_ID, "(_renewAuthToken) renew authentication token failure", err);
            clearTimeout(that.renewTokenInterval);
            that.renewTokenInterval = null;
            that.logger.log("debug", LOG_ID + "(_renewAuthToken) _exiting_");
            that.eventEmitter.emit("rainbow_tokenexpired");
        });
    }

    // Contacts API

    getContacts() {

        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getContacts) _entering_");

            that.http.get("/api/rainbow/enduser/v1.0/users/networks?format=full", getRequestHeader()).then(function(json) {
                that.logger.log("debug", LOG_ID + "(getContacts) successfull");
                that.logger.log("info", LOG_ID + "(getContacts) received " + json.total + " contacts");
                that.logger.log("debug", LOG_ID + "(getContacts) _exiting_");
                resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(getContacts) error", err);
                that.logger.log("debug", LOG_ID + "(getContacts) _exiting_");
                reject(err);
            });
        });
    }

    getContactInformationByJID(jid) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getContactInformationByJID) _entering_");

            if (!jid) {
                that.logger.log("debug", LOG_ID + "(getContactInformationByJID) successfull");
                that.logger.log("info", LOG_ID + "(getContactInformationByJID) No jid provided");
                that.logger.log("debug", LOG_ID + "(getContactInformationByJID) _exiting_");
                resolve(null);
            }
            else {

                // Remove resource from jid
                let jidBare = jid;
                if (jid.includes("/")) {
                    jidBare = jid.substr(0, jid.lastIndexOf("/"));
                }

                that.http.get("/api/rainbow/enduser/v1.0/users/jids/" + encodeURIComponent(jidBare), getRequestHeader() ).then(function(json) {
                    that.logger.log("debug", LOG_ID + "(getContactInformationByJID) successfull");
                    that.logger.log("info", LOG_ID + "(getContactInformationByJID) REST contact received ", json.data);
                    that.logger.log("debug", LOG_ID + "(getContactInformationByJID) _exiting_");
                    resolve(json.data);
                }).catch(function(err) {
                    that.logger.log("error", LOG_ID, "(getContactInformationByJID) error", err);
                    that.logger.log("debug", LOG_ID + "(getContactInformationByJID) _exiting_");
                    if (err && err.code === 404) {
                        resolve(null);
                    }
                    else {
                        reject(err);
                    }
                });
            }
        });
    }

    getContactInformationByID(id) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getContactInformationByID) _entering_");

            if (!id) {
                that.logger.log("debug", LOG_ID + "(getContactInformationByID) successfull");
                that.logger.log("info", LOG_ID + "(getContactInformationByID) No id provided");
                that.logger.log("debug", LOG_ID + "(getContactInformationByID) _exiting_");
                resolve(null);
            }
            else {
                that.http.get("/api/rainbow/enduser/v1.0/users/" + encodeURIComponent(id), getRequestHeader() ).then(function(json) {
                    that.logger.log("debug", LOG_ID + "(getContactInformationByID) successfull");
                    that.logger.log("info", LOG_ID + "(getContactInformationByID) REST contact received ", json.data);
                    that.logger.log("debug", LOG_ID + "(getContactInformationByID) _exiting_");
                    resolve(json.data);
                }).catch(function(err) {
                    that.logger.log("error", LOG_ID, "(getContactInformationByID) error", err);
                    that.logger.log("debug", LOG_ID + "(getContactInformationByID) _exiting_");
                    if (err && err.code === 404) {
                        resolve(null);
                    }
                    else {
                        reject(err);
                    }
                });
            }
        });
    }

    getContactInformationByLoginEmail(email) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getContactInformationByLoginEmail) _entering_");

            if (!email) {
                that.logger.log("debug", LOG_ID + "(getContactInformationByLoginEmail) successfull");
                that.logger.log("info", LOG_ID + "(getContactInformationByLoginEmail) No email provided");
                that.logger.log("debug", LOG_ID + "(getContactInformationByLoginEmail) _exiting_");
                resolve(null);
            }
            else {
                that.http.post("/api/rainbow/enduser/v1.0/users/loginEmails", getRequestHeader(), { "loginEmail": email}).then(function(json) {
                    that.logger.log("debug", LOG_ID + "(getContactInformationByLoginEmail) successfull");
                    that.logger.log("info", LOG_ID + "(getContactInformationByLoginEmail) REST contact received ", json.data);
                    that.logger.log("debug", LOG_ID + "(getContactInformationByLoginEmail) _exiting_");
                    resolve(json.data);
                }).catch(function(err) {
                    that.logger.log("error", LOG_ID, "(getContactInformationByLoginEmail) error", err);
                    that.logger.log("debug", LOG_ID + "(getContactInformationByLoginEmail) _exiting_");
                    reject(err);
                });
            }
        });
    }

    getInvitationById(invitationId) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getInvitationById) _entering_");

            if (!invitationId) {
                that.logger.log("debug", LOG_ID + "(getInvitationById) successfull");
                that.logger.log("info", LOG_ID + "(getInvitationById) No id provided");
                that.logger.log("debug", LOG_ID + "(getInvitationById) _exiting_");
                resolve(null);
            } else {
                that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/" + invitationId, getRequestHeader() ).then(function(json) {
                    that.logger.log("debug", LOG_ID + "(getInvitationById) successfull");
                    that.logger.log("info", LOG_ID + "(getInvitationById) REST invitation received ", json.data);
                    that.logger.log("debug", LOG_ID + "(getInvitationById) _exiting_");
                    resolve(json.data);
                }).catch(function(err) {
                    that.logger.log("error", LOG_ID, "(getInvitationById) error", err);
                    that.logger.log("debug", LOG_ID + "(getInvitationById) _exiting_");
                    reject(err);
                });
            }
        });
    }

    getGroups() {
        var that = this;

        let getSetOfGroups = function(page, max, groups) {
            return new Promise((resolve, reject) => {
                that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups?format=full&offset=" + page  + "&limit=" + max, getRequestHeader()).then(function(json) {
                    groups = groups.concat(json.data);
                    that.logger.log("info", LOG_ID + "(getGroups) retrieved " + json.data.length + " groups, total " + groups.length + ", existing " + json.total);
                    resolve({groups: groups, finished: groups.length === json.total});
                }).catch(function(err) {
                    reject(err);
                });
            });
        };

        let getAllGroups = function(page, limit, groups) {

            return new Promise((resolve, reject) => {
                
                getSetOfGroups(page, limit, groups).then((json) => {
                    if (json.finished) {
                        that.logger.log("info", LOG_ID + "(getGroups) no need to loop again. All groups retrieve...");
                        return resolve(json.groups);
                    } 
                        page += limit;
                        that.logger.log("info", LOG_ID + "(getGroups) need another loop to get more groups... [" + json.groups.length + "]");
                        getAllGroups(page, limit, json.groups).then((allGroups) => {
                            resolve(allGroups);
                        }).catch((err) => {
                            reject(err);
                        });
                    
                }).catch((err) => {
                    reject(err);
                });
            });
        };

        return new Promise(function(resolve, reject) {
            that.logger.log("debug", LOG_ID + "(getGroups) _entering_");

            let page = 0;
            let limit = 100;

            getAllGroups(page, limit, []).then((json) => {
                that.logger.log("info", LOG_ID + "(getGroups) successfull");
                that.logger.log("info", LOG_ID + "(getGroups) received " + json.length + " groups");
                that.logger.log("debug", LOG_ID + "(getGroups) _exiting_");
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(getGroups) error", err);
                that.logger.log("debug", LOG_ID + "(getGroups) _exiting_");
                reject(err);
            });
        });
    }

    getGroup(groupId) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getGroup) _entering_");

            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId, getRequestHeader()).then(function(json) {
                 that.logger.log("info", LOG_ID + "(getGroup) successfull");
                 that.logger.log("info", LOG_ID + "(getGroup) REST get group information", json.data);
                 that.logger.log("debug", LOG_ID + "(getGroup) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(getGroup) error", err);
                that.logger.log("debug", LOG_ID + "(getGroup) _exiting_");
                reject(err);
            });
        });
    }

    createGroup(name, comment, isFavorite) {
        var that = this;

        return new Promise(function(resolve, reject) {
            that.logger.log("debug", LOG_ID + "(createGroup) _entering_");

            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups", getRequestHeader(), {
                name: name, 
                comment: comment,
                isFavorite: isFavorite
            }).then(function(json) {
                 that.logger.log("info", LOG_ID + "(createGroup) successfull");
                 that.logger.log("info", LOG_ID + "(createGroup) REST group created", json.data);
                 that.logger.log("debug", LOG_ID + "(createGroup) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(createGroup) error", err);
                that.logger.log("debug", LOG_ID + "(createGroup) _exiting_");
                reject(err);
            });
        });
    }

    deleteGroup(groupId) {
        var that = this;

        return new Promise(function(resolve, reject) {
            that.logger.log("debug", LOG_ID + "(deleteGroup) _entering_");

            that.http.delete("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId, getRequestHeader()).then(function(json) {
                 that.logger.log("info", LOG_ID + "(deleteGroup) successfull");
                 that.logger.log("info", LOG_ID + "(deleteGroup) REST delete group", json.data);
                 that.logger.log("debug", LOG_ID + "(deleteGroup) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(deleteGroup) error", err);
                that.logger.log("debug", LOG_ID + "(deleteGroup) _exiting_");
                reject(err);
            });
        });
    }
	
	updateGroupName(groupId, name) {
        var that = this;

        return new Promise(function(resolve, reject) {
            that.logger.log("debug", LOG_ID + "(updateGroupName) _entering_");

            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId, getRequestHeader(), {
                name: name
            }).then(function(json) {
                 that.logger.log("info", LOG_ID + "(updateGroupName) successfull");
                 that.logger.log("info", LOG_ID + "(updateGroupName) REST delete group", json.data);
                 that.logger.log("debug", LOG_ID + "(updateGroupName) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(updateGroupName) error", err);
                that.logger.log("debug", LOG_ID + "(updateGroupName) _exiting_");
                reject(err);
            });
        });
    }

    addUserInGroup(contactId, groupId) {
        var that = this;

        return new Promise(function(resolve, reject) {
            that.logger.log("debug", LOG_ID + "(addUserInGroup) _entering_");

            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId + "/users/" + contactId, getRequestHeader()).then(function(json) {
                 that.logger.log("info", LOG_ID + "(addUserInGroup) successfull");
                 that.logger.log("info", LOG_ID + "(addUserInGroup) REST add user in group", json.data);
                 that.logger.log("debug", LOG_ID + "(addUserInGroup) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(addUserInGroup) error", err);
                that.logger.log("debug", LOG_ID + "(addUserInGroup) _exiting_");
                reject(err);
            });
        });
    }

    removeUserFromGroup(contactId, groupId) {
        var that = this;

        return new Promise(function(resolve, reject) {
            that.logger.log("debug", LOG_ID + "(removeUserFromGroup) _entering_");

            that.http.delete("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId + "/users/" + contactId, getRequestHeader()).then(function(json) {
                that.logger.log("info", LOG_ID + "(removeUserFromGroup) successfull");
                that.logger.log("info", LOG_ID + "(removeUserFromGroup) REST remove user from group", json.data);
                that.logger.log("debug", LOG_ID + "(removeUserFromGroup) _exiting_");
                resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID + "(removeUserFromGroup) error", err);
                that.logger.log("debug", LOG_ID + "(removeUserFromGroup) _exiting_");
                reject(err);
            });
        });
    }

    getBots() {
        var that = this;
        return new Promise( (resolve, reject) => {
            that.logger.log("debug", LOG_ID + "(getBots) _entering_");

            that.http.get("/api/rainbow/enduser/v1.0/bots", getRequestHeader()).then( (json) => {
                 that.logger.log("info", LOG_ID + "(getBots) successfull");
                 that.logger.log("info", LOG_ID + "(getBots) received " + json.total + " bots");
                 that.logger.log("debug", LOG_ID + "(getBots) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(getBots) error", err);
                that.logger.log("debug", LOG_ID + "(getBots) _exiting_");
                reject(err);
            });
        });
    }

    // Bubble API

    createBubble(name, description, withHistory) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(createBubble) _entering_");

            let history = "none";
            if (withHistory) {
                history = "all";
            }

            that.http.post("/api/rainbow/enduser/v1.0/rooms", getRequestHeader(), { 
                name: name, 
                topic: description,
                history: history } 
            ).then(function(json) {
                 that.logger.log("info", LOG_ID + "(createBubble) successfull");
                 that.logger.log("info", LOG_ID + "(createBubble) REST bubble created", json.data);
                 that.logger.log("debug", LOG_ID + "(createBubble) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(createBubble) error", err);
                that.logger.log("debug", LOG_ID + "(createBubble) _exiting_");
                reject(err);
            });
        });
    }

    setBubbleVisibility(bubbleId, visibility) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(setBubbleVisibility) _entering_");

            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, getRequestHeader(), { 
                visibility: visibility } 
            ).then(function(json) {
                 that.logger.log("info", LOG_ID + "(setBubbleVisibility) successfull");
                 that.logger.log("info", LOG_ID + "(setBubbleVisibility) REST bubble set visibility", json.data);
                 that.logger.log("debug", LOG_ID + "(setBubbleVisibility) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(setBubbleVisibility) error", err);
                that.logger.log("debug", LOG_ID + "(setBubbleVisibility) _exiting_");
                reject(err);
            });
        });
    }

    setBubbleTopic(bubbleId, topic) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(setBubbleTopic) _entering_");

            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, getRequestHeader(), { 
                topic: topic } 
            ).then(function(json) {
                 that.logger.log("info", LOG_ID + "(setBubbleTopic) successfull");
                 that.logger.log("info", LOG_ID + "(setBubbleTopic) REST bubble updated topic", json.data);
                 that.logger.log("debug", LOG_ID + "(setBubbleTopic) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(setBubbleTopic) error", err);
                that.logger.log("debug", LOG_ID + "(setBubbleTopic) _exiting_");
                reject(err);
            });
        });
    }

    setBubbleName(bubbleId, name) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(setBubbleName) _entering_");

            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, getRequestHeader(), { 
                name: name } 
            ).then(function(json) {
                 that.logger.log("info", LOG_ID + "(setBubbleName) successfull");
                 that.logger.log("info", LOG_ID + "(setBubbleName) REST bubble updated name", json.data);
                 that.logger.log("debug", LOG_ID + "(setBubbleName) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(setBubbleName) error", err);
                that.logger.log("debug", LOG_ID + "(setBubbleName) _exiting_");
                reject(err);
            });
        });
    }

    getBubbles() {
        var that = this;

        let getSetOfBubbles = (page, max, bubbles) => {

            return new Promise((resolve, reject) => {
                that.http.get("/api/rainbow/enduser/v1.0/rooms?format=full&offset=" + page + "&limit=" + max + "&userId=" + that.account.id, getRequestHeader()).then(function(json) {
                    bubbles = bubbles.concat(json.data);
                    that.logger.log("info", LOG_ID + "(getBubbles) retrieved " + json.data.length + " bubbles, total " + bubbles.length + ", existing " + json.total);
                    resolve({bubbles: bubbles, finished: bubbles.length === json.total});
               }).catch(function(err) {
                   reject(err);
               });
            });
        };

        let getAllBubbles = function(page, limit, bubbles) {
            
            return new Promise((resolve, reject) => {
                getSetOfBubbles(page, limit, bubbles).then((json) => {
                    if (json.finished) {
                        that.logger.log("info", LOG_ID + "(getBubbles) no need to loop again. All bubbles retrieved...");
                        return resolve(json.bubbles);
                    }
                    
                        page += limit;
                        that.logger.log("info", LOG_ID + "(getBubbles) need another loop to get more bubbles... [" + json.bubbles.length + "]");
                        getAllBubbles(page, limit, json.bubbles).then((bubbles) => {
                            resolve(bubbles);
                        }).catch((err) => {
                            reject(err);
                        });
                    
                    
                }).catch((err) => {
                    reject(err);
                });
            });
        };

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getBubbles) _entering_");

            let page = 0;
            let limit = 100;

            getAllBubbles(page, limit, []).then((json) => {
                that.logger.log("info", LOG_ID + "(getBubbles) successfull");
                that.logger.log("info", LOG_ID + "(getBubbles) received " + json.length + " bubbles");
                that.logger.log("debug", LOG_ID + "(getBubbles) _exiting_");
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(getBubbles) error", err);
                that.logger.log("debug", LOG_ID + "(getBubbles) _exiting_");
                reject(err);
            });
        });
    }

    getBubble(bubbleId) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getBubble) _entering_");

            that.http.get("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "?format=full", getRequestHeader()).then(function(json) {
                 that.logger.log("info", LOG_ID + "(getBubble) successfull");
                 that.logger.log("info", LOG_ID + "(getBubble) REST get bubble information", json.data);
                 that.logger.log("debug", LOG_ID + "(getBubble) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(getBubble) error", err);
                that.logger.log("debug", LOG_ID + "(getBubble) _exiting_");
                reject(err);
            });
        });
    }

    setBubbleCustomData(bubbleId, customData) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(setBubbleCustomData) _entering_");

            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/custom-data", getRequestHeader(), customData).then(function(json) {
                 that.logger.log("info", LOG_ID + "(setBubbleCustomData) successfull");
                 that.logger.log("info", LOG_ID + "(setBubbleCustomData) REST PUT customData to bubble", json.data);
                 that.logger.log("debug", LOG_ID + "(setBubbleCustomData) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(setBubbleCustomData) error", err);
                that.logger.log("debug", LOG_ID + "(setBubbleCustomData) _exiting_");
                reject(err);
            });
        });
    }

    inviteContactToBubble(contactId, bubbleId, asModerator, withInvitation, reason) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(inviteContactToBubble) _entering_");

            var privilege = asModerator ? "moderator" : "user";
            var status = withInvitation ? "invited" : "accepted";
            reason = reason || "from moderator";

            that.http.post("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users", getRequestHeader(), { userId: contactId, reason: reason, privilege: privilege, status: status } ).then(function(json) {
                 that.logger.log("info", LOG_ID + "(inviteContactToBubble) successfull");
                 that.logger.log("info", LOG_ID + "(inviteContactToBubble) REST bubble invitation", json.data);
                 that.logger.log("debug", LOG_ID + "(inviteContactToBubble) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(inviteContactToBubble) error", err);
                that.logger.log("debug", LOG_ID + "(inviteContactToBubble) _exiting_");
                reject(err);
            });
        });
    }

    leaveBubble(bubbleId) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(leaveBubble) _entering_");

            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + that.account.id, getRequestHeader()).then(function(json) {
                 that.logger.log("info", LOG_ID + "(leaveBubble) successfull");
                 that.logger.log("info", LOG_ID + "(leaveBubble) REST leave bubble", json.data);
                 that.logger.log("debug", LOG_ID + "(leaveBubble) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(leaveBubble) error", err);
                that.logger.log("debug", LOG_ID + "(leaveBubble) _exiting_");
                reject(err);
            });
        });
    }

    deleteBubble(bubbleId) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(deleteBubble) _entering_");

            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, getRequestHeader()).then(function(json) {
                 that.logger.log("info", LOG_ID + "(deleteBubble) successfull");
                 that.logger.log("info", LOG_ID + "(deleteBubble) REST leave bubble", json.data);
                 that.logger.log("debug", LOG_ID + "(deleteBubble) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(deleteBubble) error", err);
                that.logger.log("debug", LOG_ID + "(deleteBubble) _exiting_");
                reject(err);
            });
        });
    }

    removeInvitationOfContactToBubble(contactId, bubbleId) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(removeInvitationOfContactToBubble) _entering_");

            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + contactId, getRequestHeader()).then(function(json) {
                 that.logger.log("info", LOG_ID + "(removeInvitationOfContactToBubble) successfull");
                 that.logger.log("info", LOG_ID + "(removeInvitationOfContactToBubble) REST remove contact from bubble", json.data);
                 that.logger.log("debug", LOG_ID + "(removeInvitationOfContactToBubble) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(removeInvitationOfContactToBubble) error", err);
                that.logger.log("debug", LOG_ID + "(removeInvitationOfContactToBubble) _exiting_");
                reject(err);
            });
        });
    }

    unsubscribeContactFromBubble(contactId, bubbleId) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(unsubscribeContactFromBubble) _entering_");

            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + contactId, getRequestHeader(), { status: "unsubscribed" }).then(function(json) {
                 that.logger.log("info", LOG_ID + "(unsubscribeContactFromBubble) successfull");
                 that.logger.log("info", LOG_ID + "(unsubscribeContactFromBubble) REST remove contact from bubble", json.data);
                 that.logger.log("debug", LOG_ID + "(unsubscribeContactFromBubble) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(unsubscribeContactFromBubble) error", err);
                that.logger.log("debug", LOG_ID + "(unsubscribeContactFromBubble) _exiting_");
                reject(err);
            });
        });
    }

    acceptInvitationToJoinBubble(bubbleId) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(acceptInvitationToJoinBubble) _entering_");

            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + that.account.id, getRequestHeader(), { status: "accepted" }).then(function(json) {
                 that.logger.log("info", LOG_ID + "(acceptInvitationToJoinBubble) successfull");
                 that.logger.log("info", LOG_ID + "(acceptInvitationToJoinBubble) REST invitation accepted", json.data);
                 that.logger.log("debug", LOG_ID + "(acceptInvitationToJoinBubble) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(acceptInvitationToJoinBubble) error", err);
                that.logger.log("debug", LOG_ID + "(acceptInvitationToJoinBubble) _exiting_");
                reject(err);
            });
        });
    }

    declineInvitationToJoinBubble(bubbleId) {
        let that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(declineInvitationToJoinBubble) _entering_");

            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + that.account.id, getRequestHeader(), { status: "rejected" }).then(function(json) {
                 that.logger.log("info", LOG_ID + "(declineInvitationToJoinBubble) successfull");
                 that.logger.log("info", LOG_ID + "(declineInvitationToJoinBubble) REST invitation declined", json.data);
                 that.logger.log("debug", LOG_ID + "(declineInvitationToJoinBubble) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(declineInvitationToJoinBubble) error", err);
                that.logger.log("debug", LOG_ID + "(declineInvitationToJoinBubble) _exiting_");
                reject(err);
            });
        });
    }

    inviteUser(email, companyId, language, message) {

        let that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(inviteUser) _entering_");

            // Check if requester is admin
            if ( !Utils.isAdmin(that.account.roles)) {
                that.logger.log("error", LOG_ID + "(inviteUser) Admin API requested has no Admin roles");
                let err = new Error(ErrorCase.FORBIDDEN.msg + " Administrator role is requested");
                throw err;
            }

            let user = {
                email: email,
                lang: language
            };

            if (message) {
                user.customMessage = message;
            }

            that.http.post("/api/rainbow/admin/v1.0/companies/" + companyId + "/join-companies/invitations", getRequestHeader(), user).then(function(json) {
                 that.logger.log("info", LOG_ID + "(inviteUser) successfull");
                 that.logger.log("info", LOG_ID + "(inviteUser) REST admin user invitation sent", json.data);
                 that.logger.log("debug", LOG_ID + "(inviteUser) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(inviteUser) error", err);
                that.logger.log("debug", LOG_ID + "(inviteUser) _exiting_");
                reject(err);
            });
        });
    }

    createUser(email, password, firstname, lastname, companyId, language, isAdmin) {

        let that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(createUser) _entering_");

            // Check if requester is admin
            if ( !Utils.isAdmin(that.account.roles)) {
                that.logger.log("error", LOG_ID + "(createUser) Admin API requested has no Admin roles");
                let err = new Error(ErrorCase.FORBIDDEN.msg + " Administrator role is requested");
                throw err;
            }

            let user = {
                loginEmail: email,
                password: password,
                firstName: firstname,
                lastName: lastname,
                isActive: true,
                isInitialized: false,
                language: language,
                adminType: "undefined",
                roles: ["user"],
                accountType: "free",
            };

            if (companyId) {
                user.companyId = companyId;
            }
            else {
                user.companyId = that.account.companyId
            }

            if (isAdmin) {
                user.roles.push("admin");
                user.adminType = ["company_admin"];
            }

            that.http.post("/api/rainbow/admin/v1.0/users", getRequestHeader(), user).then(function(json) {
                 that.logger.log("info", LOG_ID + "(createUser) successfull");
                 that.logger.log("info", LOG_ID + "(createUser) REST admin creation user", json.data);
                 that.logger.log("debug", LOG_ID + "(createUser) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(createUser) error", err);
                that.logger.log("debug", LOG_ID + "(createUser) _exiting_");
                reject(err);
            });
        });
    }

    createGuestUser( firstname, lastname, language, timeToLive) {

        let that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(createGuestUser) _entering_");

            // Check if requester is admin
            if ( !Utils.isAdmin(that.account.roles)) {
                that.logger.log("error", LOG_ID + "(createGuestUser) Admin API requested has no Admin roles");
                let err = new Error(ErrorCase.FORBIDDEN.msg + " Administrator role is requested");
                throw err;
            }

            // Generate user Email based on appId
            let uid = Utils.makeId(40);
            let appId = that.cpaas.appID;
            let domain = that.http.host;
            let email = `${uid}@${appId}.${domain}`;

            // Generate a rainbow compatible password
            let password = Utils.createPassword(40);

            let user = {
                loginEmail: email,
                password: password,
                isActive: true,
                isInitialized: false,
                adminType: "undefined",
                roles: ["guest"],
                accountType: "free",
                companyId: that.account.companyId // Current requester company
            };

            if (firstname) {
                user.firstName = firstname;
            }

            if (lastname) {
                user.lastName = lastname;
            }

            if (language) {
                user.language = language;
            }

            if (timeToLive) {
                user.timeToLive = timeToLive;
            }

            that.http.post("/api/rainbow/admin/v1.0/users", getRequestHeader(), user).then(function(json) {
                 that.logger.log("info", LOG_ID + "(createGuestUser) successfull");
                 // Add generated password into the answer
                 json.data.password = password;
                 that.logger.log("info", LOG_ID + "(createGuestUser) REST admin creation user", json.data);
                 that.logger.log("debug", LOG_ID + "(createGuestUser) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(createGuestUser) error", err);
                that.logger.log("debug", LOG_ID + "(createGuestUser) _exiting_");
                reject(err);
            });
        });
    }

    changePassword(password, userId) {

        let that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(changePassword) _entering_");

            // Check if requester is admin
            if ( !Utils.isAdmin(that.account.roles)) {
                that.logger.log("error", LOG_ID + "(createGuestUser) Admin API requested has no Admin roles");
                let err = new Error(ErrorCase.FORBIDDEN.msg + " Administrator role is requested");
                throw err;
            }

            let data = {
                password: password
            };

            that.http.put("/api/rainbow/admin/v1.0/users/" + userId, getRequestHeader(), data).then(function(json) {
                 that.logger.log("info", LOG_ID + "(changePassword) successfull");
                 that.logger.log("info", LOG_ID + "(changePassword) REST admin change password", json.data);
                 that.logger.log("debug", LOG_ID + "(changePassword) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(changePassword) error", err);
                that.logger.log("debug", LOG_ID + "(changePassword) _exiting_");
                reject(err);
            });
        });
    }

    updateInformation(objData, userId) {
        let that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(updateInformation) _entering_");

            // Check if requester is admin
            if ( !Utils.isAdmin(that.account.roles)) {
                that.logger.log("error", LOG_ID + "(createGuestUser) Admin API requested has no Admin roles");
                let err = new Error(ErrorCase.FORBIDDEN.msg + " Administrator role is requested");
                throw err;
            }

            that.http.put("/api/rainbow/admin/v1.0/users/" + userId, getRequestHeader(), objData).then(function(json) {
                 that.logger.log("info", LOG_ID + "(updateInformation) successfull");
                 that.logger.log("info", LOG_ID + "(updateInformation) REST admin change data", json.data);
                 that.logger.log("debug", LOG_ID + "(updateInformation) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(updateInformation) error", err);
                that.logger.log("debug", LOG_ID + "(updateInformation) _exiting_");
                reject(err);
            });
        });
    }

    deleteUser(userId) {
        let that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(deleteUser) _entering_");

            // Check if requester is admin
            if ( !Utils.isAdmin(that.account.roles)) {
                that.logger.log("error", LOG_ID + "(createGuestUser) Admin API requested has no Admin roles");
                let err = new Error(ErrorCase.FORBIDDEN.msg + " Administrator role is requested");
                throw err;
            }

            that.http.delete("/api/rainbow/admin/v1.0/users/" + userId, getRequestHeader()).then(function(json) {
                 that.logger.log("info", LOG_ID + "(deleteUser) successfull");
                 that.logger.log("info", LOG_ID + "(deleteUser) REST admin delete user", json.data);
                 that.logger.log("debug", LOG_ID + "(deleteUser) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(deleteUser) error", err);
                that.logger.log("debug", LOG_ID + "(deleteUser) _exiting_");
                reject(err);
            });
        });
    }
    
    // FileServer
    getPartialDataFromServer(url, minRange, maxRange, index) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that
                .logger
                .log("debug", LOG_ID + "(getPartialDataFromServer) _entering_");

            that.http.get( url, getRequestHeaderWithRange("application/octet-stream", "bytes=" + minRange + "-" + maxRange)).then(function(data) {
                that.logger.log("info", LOG_ID + "(getPartialDataFromServer) successfull");
                that.logger.log("info", LOG_ID + "(getPartialDataFromServer) REST get Blob from Url");
                that.logger.log("debug", LOG_ID + "(getPartialDataFromServer) _exiting_");
                resolve( {"data": data, "index": index});
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(getPartialDataFromServer) error", err);
                that.logger.log("debug", LOG_ID + "(getPartialDataFromServer) _exiting_");
                reject(err);
            }); 
        });
    }

    getFileFromUrl(url) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that
                .logger
                .log("debug", LOG_ID + "(getFileFromUrl) _entering_");

            that.http.get( url, getRequestHeader("application/octet-stream")).then(function(response) {
                that.logger.log("info", LOG_ID + "(getFileFromUrl) successfull");
                that.logger.log("info", LOG_ID + "(getFileFromUrl) REST get Blob from Url");
                that.logger.log("debug", LOG_ID + "(getFileFromUrl) _exiting_");
                resolve( response);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(getFileFromUrl) error", err);
                that.logger.log("debug", LOG_ID + "(getFileFromUrl) _exiting_");
                reject(err);
            }); 
        });
    }

    getServerCapabilities() {
        var that = this;

        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(getServerCapabilities) _entering_");

            that.http.get("/api/rainbow/fileserver/v1.0/capabilities", getRequestHeader()).then( (json) => {
                 that.logger.log("info", LOG_ID + "(getServerCapabilities) successfull");
                 that.logger.log("info", LOG_ID + "(getServerCapabilities) REST get Server capabilities", json.data);
                 that.logger.log("debug", LOG_ID + "(getServerCapabilities) _exiting_");
                 resolve(json.data);
            }).catch( (err) => {
                that.logger.log("error", LOG_ID, "(getServerCapabilities) error", err);
                that.logger.log("debug", LOG_ID + "(getServerCapabilities) _exiting_");
                reject(err);
            });
        }); 
    }

    // Settings
    getUserSettings() {
        var that = this;

        return new Promise((resolve, reject) => {

            that.logger.log("debug", LOG_ID + "(getUserSettings) _entering_");

            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/settings", getRequestHeader()).then( (json) => {
                 that.logger.log("info", LOG_ID + "(getUserSettings) successfull");
                 that.logger.log("info", LOG_ID + "(getUserSettings) REST get User Settings", json.data);
                 that.logger.log("debug", LOG_ID + "(getUserSettings) _exiting_");
                 resolve(json.data);
            }).catch( (err) => {
                that.logger.log("error", LOG_ID, "(getUserSettings) error", err);
                that.logger.log("debug", LOG_ID + "(getUserSettings) _exiting_");
                reject(err);
            });
        }); 
    }

    updateUserSettings(settings) {
        let that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(updateUserSettings) _entering_");

            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/settings", getRequestHeader(), settings).then(function(json) {
                 that.logger.log("info", LOG_ID + "(updateUserSettings) successfull");
                 that.logger.log("info", LOG_ID + "(updateUserSettings) REST user change data", json.data);
                 that.logger.log("debug", LOG_ID + "(updateUserSettings) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(updateUserSettings) error", err);
                that.logger.log("debug", LOG_ID + "(updateUserSettings) _exiting_");
                reject(err);
            });
        });
    }
    
    getAllCompanies() {
        let that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getAllCompanies) _entering_");

            // Check if requester is admin
            if ( !Utils.isAdmin(that.account.roles)) {
                that.logger.log("error", LOG_ID + "(getAllCompanies) Admin API requested has no Admin roles");
                let err = new Error(ErrorCase.FORBIDDEN.msg + " Administrator role is requested");
                throw err;
            }

            that.http.get("/api/rainbow/admin/v1.0/companies", getRequestHeader()).then(function(json) {
                    that.logger.log("info", LOG_ID + "(getAllCompanies) successfull");
                    that.logger.log("info", LOG_ID + "(getAllCompanies) REST get all companies :", json.data);
                    that.logger.log("debug", LOG_ID + "(getAllCompanies) _exiting_");
                    resolve(json);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(getAllCompanies) error", err);
                that.logger.log("debug", LOG_ID + "(getAllCompanies) _exiting_");
                reject(err);
            });
        });
    }

    // Channel
    // Create a channel
    createChannel(name, topic, visibility, max_items, max_payload_size) {
        
        let that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(createChannel) _entering_");

            let channel = {
                name: name
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

            that.http.post("/api/rainbow/channels/v1.0/channels", getRequestHeader(), channel).then(function(json) {
                    that.logger.log("info", LOG_ID + "(createChannel) successfull");
                    that.logger.log("info", LOG_ID + "(createChannel) REST creation channel", json.data);
                    that.logger.log("debug", LOG_ID + "(createChannel) _exiting_");
                    resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(createChannel) error", err);
                that.logger.log("debug", LOG_ID + "(createChannel) _exiting_");
                reject(err);
            });
        });
    }

    // get a channel
    getChannel(channelId) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getChannel) _entering_");

            that.http.get("/api/rainbow/channels/v1.0/channels/" + channelId, getRequestHeader()).then(function(json) {
                that.logger.log("info", LOG_ID + "(getChannel) successfull");
                that.logger.log("info", LOG_ID + "(getChannel) REST read channelId", json.data);
                that.logger.log("debug", LOG_ID + "(getChannel) _exiting_");
                resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(getChannel) error", err);
                that.logger.log("debug", LOG_ID + "(getChannel) _exiting_");
                reject(err);
            });
        });
    }

    // Delete a channel
    deleteChannel(channelId) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(deleteChannel) _entering_");

            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId, getRequestHeader()).then(function(json) {
                 that.logger.log("info", LOG_ID + "(deleteChannel) successfull");
                 that.logger.log("info", LOG_ID + "(deleteChannel) REST remove channelId", json);
                 that.logger.log("debug", LOG_ID + "(deleteChannel) _exiting_");
                 resolve(json);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(deleteChannel) error", err);
                that.logger.log("debug", LOG_ID + "(deleteChannel) _exiting_");
                reject(err);
            });
        });
    }

    // Find Channels
    findChannels(name, topic, limit, offset, sortField, sortOrder) {
        var that = this;

        let query = "?limit=";
        if (limit) {
            query += limit;
        }
        else {
            query += "100";
        }

        if (name) {
            query += "&name=" + name;
        }

        if (topic) {
            query += "&topic=" + topic;
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

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(findChannels) _entering_");

            that.http.get("/api/rainbow/channels/v1.0/channels/search" + query, getRequestHeader()).then(function(json) {
                    that.logger.log("info", LOG_ID + "(findChannels) successfull");
                    that.logger.log("info", LOG_ID + "(findChannels) REST found channels", json.total);
                    that.logger.log("debug", LOG_ID + "(findChannels) _exiting_");
                    resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(findChannels) error", err);
                that.logger.log("debug", LOG_ID + "(findChannels) _exiting_");
                reject(err);
            });
        });
    }

    // Get my channels
    getChannels() {

    var that = this;
    
        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getChannels) _entering_");

            that.http.get("/api/rainbow/channels/v1.0/channels", getRequestHeader()).then(function(json) {
                that.logger.log("debug", LOG_ID + "(getChannels) successfull");
                that.logger.log("info", LOG_ID + "(getChannels) received channels");
                that.logger.log("debug", LOG_ID + "(getChannels) _exiting_");
                resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(getChannels) error", err);
                that.logger.log("debug", LOG_ID + "(getChannels) _exiting_");
                reject(err);
            });
        });
    }

    getChannel(id) {
        
        var that = this;
    
        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getChannel) _entering_");

            that.http.get("/api/rainbow/channels/v1.0/channels/" + id, getRequestHeader()).then(function(json) {
                that.logger.log("debug", LOG_ID + "(getChannel) successfull");
                that.logger.log("info", LOG_ID + "(getChannel) received " + JSON.stringify(json) + " channels");
                that.logger.log("debug", LOG_ID + "(getChannel) _exiting_");
                resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(getChannel) error", err);
                that.logger.log("debug", LOG_ID + "(getChannel) _exiting_");
                reject(err);
            });
        });
    }

    // Publish a message to a channel
    publishMessage( channelId, message, title, url) {
        
        return new Promise((resolve, reject) => {

            this.logger.log("debug", LOG_ID + "(publishMessage) _entering_");

            let payload = {
                message: message,
                title: title || "",
                url: url || ""
            };

            this.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/publish", getRequestHeader(), payload).then((json) => {
                this.logger.log("info", LOG_ID + "(publishMessage) successfull");
                this.logger.log("info", LOG_ID + "(publishMessage) REST message published", json.data);
                this.logger.log("debug", LOG_ID + "(publishMessage) _exiting_");
                resolve(json.data);
            }).catch(function(err) {
                this.logger.log("error", LOG_ID, "(publishMessage) error", err);
                this.logger.log("debug", LOG_ID + "(publishMessage) _exiting_");
                reject(err);
            });
        });
    }

    // Subscribe to a channel
    subscribeToChannel( channelId) {
        
        return new Promise((resolve, reject) => {

            this.logger.log("debug", LOG_ID + "(subscribeToChannel) _entering_");

            this.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/subscribe", getRequestHeader()).then((json) => {
                this.logger.log("info", LOG_ID + "(subscribeToChannel) successfull");
                this.logger.log("info", LOG_ID + "(subscribeToChannel) REST channel subscribed", json.data);
                this.logger.log("debug", LOG_ID + "(subscribeToChannel) _exiting_");
                resolve(json.data);
            }).catch((err) => {
                this.logger.log("error", LOG_ID, "(subscribeToChannel) error", err);
                this.logger.log("debug", LOG_ID + "(subscribeToChannel) _exiting_");
                reject(err);
            });
        });
    }

    // Unsubscribe to a channel
    unsubscribeToChannel( channelId) {
        let that = this;
        
        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(unsubscribeToChannel) _entering_");

            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId + "/unsubscribe", getRequestHeader(), null).then(function(json) {
                    that.logger.log("info", LOG_ID + "(unsubscribeToChannel) successfull");
                    that.logger.log("info", LOG_ID + "(unsubscribeToChannel) REST channel unsubscribed", json.data);
                    that.logger.log("debug", LOG_ID + "(unsubscribeToChannel) _exiting_");
                    resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(unsubscribeToChannel) error", err);
                that.logger.log("debug", LOG_ID + "(unsubscribeToChannel) _exiting_");
                reject(err);
            });
        });
    }

    // Update channels
    updateChannel(channelId, title, visibility, max_items, max_payload_size) {
        var that = this;

        var channel = {};
        if ( title ) {channel.title = title;}
        if ( visibility ) {channel.visibility = visibility;}
        if ( max_items ) {channel.max_items = max_items;}
        if ( max_payload_size ) {channel.max_payload_size = max_payload_size;}

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(setBubbleTopic) _entering_");

            that.http.put("/api/rainbow/channels/v1.0/channels/" + channelId, getRequestHeader(), channel).then(function(json) {
                 that.logger.log("info", LOG_ID + "(setBubbleTopic) successfull");
                 that.logger.log("info", LOG_ID + "(setBubbleTopic) REST channel updated", json.data);
                 that.logger.log("debug", LOG_ID + "(setBubbleTopic) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(setBubbleTopic) error", err);
                that.logger.log("debug", LOG_ID + "(setBubbleTopic) _exiting_");
                reject(err);
            });
        });
    }

    // Get all users from channel
    getChannelUsers(channelId, options) {
        
    var that = this;
    
        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getUsersChannel) _entering_");

            var filterToApply = "format=full";
            
            if (options.format) {
                filterToApply = "format=" + options.format;
            }
            
            if (options.page > 0) {
                filterToApply += "&offset=";
                if (options.page > 1) {
                    filterToApply += (options.limit * (options.page - 1));
                }
                else {
                    filterToApply += 0;
                }
            }

            filterToApply += "&limit=" + Math.min(options.limit, 1000);

            if (options.type) {
                filterToApply += "&types=" + options.type;
            }

            that.http.get("/api/rainbow/channels/v1.0/channels/" + channelId + "/users?" + filterToApply, getRequestHeader()).then(function(json) {
                that.logger.log("debug", LOG_ID + "(getUsersChannel) successfull");
                that.logger.log("info", LOG_ID + "(getUsersChannel) received " + json.total + " users in channel");
                that.logger.log("debug", LOG_ID + "(getUsersChannel) _exiting_");
                resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(getUsersChannel) error", err);
                that.logger.log("debug", LOG_ID + "(getUsersChannel) _exiting_");
                reject(err);
            });
        });
    }

    // Delete all users in channel
    deleteAllUsersFromChannel(channelId) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) _entering_");

            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId + "/users", getRequestHeader()).then(function(json) {
                 that.logger.log("info", LOG_ID + "(deleteAllUsersFromChannel) successfull");
                 that.logger.log("info", LOG_ID + "(deleteAllUsersFromChannel) REST remove all users in channel with channelId", json.data);
                 that.logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(deleteAllUsersFromChannel) error", err);
                that.logger.log("debug", LOG_ID + "(deleteAllUsersFromChannel) _exiting_");
                reject(err);
            });
        });
    }
    
    // Update a collection of channel users
    updateChannelUsers(channelId, users) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(updateChannelUsers) _entering_");

            that.http.put("/api/rainbow/channels/v1.0/channels/" + channelId + "/users", getRequestHeader(), {"data": users}).then(function(json) {
                 that.logger.log("info", LOG_ID + "(updateChannelUsers) successfull");
                 that.logger.log("info", LOG_ID + "(updateChannelUsers) REST channels updated", json.data);
                 that.logger.log("debug", LOG_ID + "(updateChannelUsers) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(updateChannelUsers) error", err);
                that.logger.log("debug", LOG_ID + "(updateChannelUsers) _exiting_");
                reject(err);
            });
        });
    }

    // Update a collection of channel users
    getChannelMessages(channelId) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getChannelMessages) _entering_");

            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/items", getRequestHeader(), { "max": "100"}).then(function(json) {
                 that.logger.log("info", LOG_ID + "(getChannelMessages) successfull");
                 that.logger.log("info", LOG_ID + "(getChannelMessages) REST channels messages received", json.data.items.length);
                 that.logger.log("debug", LOG_ID + "(getChannelMessages) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(getChannelMessages) error", err);
                that.logger.log("debug", LOG_ID + "(getChannelMessages) _exiting_");
                reject(err);
            });
        });
    }

    //////
    // Generic HTTP VERB
    get(url, token) {
        var that = this;

        this.logger.log("debug", LOG_ID + "(get) _entering_");

        this.token = token;
        return new Promise(function(resolve, reject) {
            that.http.get(url, getRequestHeader()).then(function(JSON) {
                that.logger.log("debug", LOG_ID + "(get) _exiting_");
                resolve(JSON);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID + "(get) _exiting_", err);
                that.logger.log("debug", LOG_ID + "(get) _exiting_");
                reject(err);
            });
        });
    }

    post(url, token, data, contentType) {
        var that = this;

        this.logger.log("debug", LOG_ID + "(post) _entering_");

        this.token = token;
        return new Promise(function(resolve, reject) {
            that.http.post(url, getRequestHeader(), data, contentType).then(function(JSON) {
                that.logger.log("debug", LOG_ID + "(post) _exiting_");
                resolve(JSON);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID + "(post) _exiting_", err);
                that.logger.log("debug", LOG_ID + "(post) _exiting_");
                reject(err);
            });
        });
    }

    put(url, token, data) {
        var that = this;

        this.logger.log("debug", LOG_ID + "(put) _entering_");

        this.token = token;
        return new Promise(function(resolve, reject) {
            that.http.put(url, getRequestHeader(), data).then(function(JSON) {
                that.logger.log("debug", LOG_ID + "(put) _exiting_");
                resolve(JSON);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID + "(put) _exiting_", err);
                that.logger.log("debug", LOG_ID + "(put) _exiting_");
                reject(err);
            });
        });
    }

    delete(url, token) {
        var that = this;

        this.logger.log("debug", LOG_ID + "(delete) _entering_");

        this.token = token;
        return new Promise(function(resolve, reject) {
            that.http.delete(url, getRequestHeader()).then(function(JSON) {
                that.logger.log("debug", LOG_ID + "(delete) _exiting_");
                resolve(JSON);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID + "(delete) _exiting_", err);
                that.logger.log("debug", LOG_ID + "(delete) _exiting_");
                reject(err);
            });
        });
    }

    checkPortalHealth() {

        var that = this;

        this.logger.log("debug", LOG_ID + "(checkPortalHealth) _entering_");

        return new Promise(function(resolve, reject) {
            that.http.get("/api/rainbow/ping", getDefaultHeader()).then(function(JSON) {
                that.logger.log("debug", LOG_ID + "(checkPortalHealth) Connection succeeded!");
                that.logger.log("debug", LOG_ID + "(checkPortalHealth) _exiting_");
                resolve(JSON);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID + "(checkPortalHealth) Error ", err);
                that.logger.log("debug", LOG_ID + "(checkPortalHealth) _exiting_");
                reject(err);
            });
        });
    }

    attemptToReconnect(reconnectDelay) {

        let that = this;

        that.logger.log("debug", LOG_ID + "(attemptToReconnect) Next attempt in " + that.reconnectDelay + "ms");

        setTimeout(() => {
            that.checkPortalHealth().then(() => {
                that.logger.log("debug", LOG_ID + "(attemptToReconnect) Attempt succeeded!");
                that.eventEmitter.emit("attempt_succeeded");
            }).catch((err) => {
                that.logger.log("debug", LOG_ID + "(attemptToReconnect) Attempt failed!");
                that.eventEmitter.emit("attempt_failed");
            });
        }, reconnectDelay);
    }

    reconnect() {

        let that = this;

        let currentAttempt = 0;

        return new Promise((resolve, reject) => {

            that.eventEmitter.on("attempt_succeeded", () => {
                that.logger.log("debug", LOG_ID + "(reconnect) reconnection attempt successfull!");
                that.fibonacciStrategy.reset();
                that.reconnect.delay = that.fibonacciStrategy.getInitialDelay();
                resolve();
            });

            that.eventEmitter.on("attempt_failed", () => {
                that.logger.log("debug", LOG_ID + "(reconnect) attempt #" + currentAttempt + " has failed!");
                currentAttempt++;
                if (currentAttempt < that.maxAttemptToReconnect) {
                    that.reconnectDelay = that.fibonacciStrategy.next();
                    that.attemptToReconnect(that.reconnectDelay);
                }
                else {
                    reject();
                }
            });

            that.attemptToReconnect(that.reconnectDelay);
        });
    }
    
}

module.exports = RESTService;