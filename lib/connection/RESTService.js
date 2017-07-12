"use strict";

var jwt = require("jwt-decode");
var btoa = require("btoa");

let backoff = require("backoff");

const RECONNECT_INITIAL_DELAY = 2000;
const RECONNECT_MAX_DELAY = 30000;

var getRequestHeader; 
var getLoginHeader;
var getDefaultHeader;

const LOG_ID = "REST - ";

class RESTService {

    constructor(_credentials, evtEmitter, _logger) {
        this.http = null;
        this.account = null;
        this.token = null;
        this.renewTokenInterval = null;
        this.auth = btoa(_credentials.login + ":" + _credentials.password);
        this._applicationToken = null;
        this.loginEmail = _credentials.login;
        this.eventEmitter = evtEmitter;
        this.logger = _logger;

        this.fibonacciStrategy = new backoff.FibonacciStrategy({randomisationFactor: 0.4, initialDelay: RECONNECT_INITIAL_DELAY, maxDelay: RECONNECT_MAX_DELAY});
        this.reconnectDelay = this.fibonacciStrategy.getInitialDelay();

        getRequestHeader = () => { 
            return { 
                "Authorization": "Bearer " + this.token, 
                "Accept": "application/json",
                "x-rainbow-app-token": this._applicationToken || ""
            };
        };

        getLoginHeader = () => { 
            return { 
                "Accept": "application/json", 
                "Content-Type": "application/json",
                "Authorization": "Basic " + this.auth,
                "x-rainbow-app-token": this._applicationToken || ""
            };
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

    start(http, _applicationToken) {
        var that = this;
        this.http = http;
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

        return new Promise((resolve) => {
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
                that.token = JSON.token;
                that.logger.log("info", LOG_ID + "(signin) welcome " + that.account.displayName + "!");
                that.logger.log("debug", LOG_ID + "(signin) information", that.account);
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
        });
    }

    startTokenSurvey() {

        var that = this;

        var decodedToken = jwt(that.token);
        this.logger.log("debug", LOG_ID + "(startTokenSurvey) - token", decodedToken);
        var tokenExpirationTimestamp = decodedToken.exp * 1000;
        var expirationDate = new Date(tokenExpirationTimestamp);
        var currentDate = new Date();
        var currentTimestamp = currentDate.valueOf();
        var tokenExpirationDuration = tokenExpirationTimestamp - currentTimestamp;

        if (tokenExpirationDuration < 0) {
            this.logger.log("warn", LOG_ID + "(startTokenSurvey) auth token has already expired, re-new it immediately");
            that._renewAuthToken();
        }
        else if (tokenExpirationDuration < 300000) {
            this.logger.log("warn", LOG_ID + "(startTokenSurvey) auth token will expire in less 5 minutes, re-new it immediately");
            that._renewAuthToken();
        }
        else {
            var usedExpirationDuration = tokenExpirationDuration - 3600000; // Refresh 1 hour before the token expiration
            this.logger.log("info", LOG_ID + "(startTokenSurvey) start token survey (expirationDate: " + expirationDate + " tokenExpirationDuration: " + tokenExpirationDuration + "ms usedExpirationDuration: " + usedExpirationDuration + "ms)");
            if (that.renewTokenInterval) { 
                clearTimeout(that.renewTokenInterval); 
            }
            that.renewTokenInterval = setTimeout(function() { 
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

            that.http.get("/api/rainbow/enduser/v1.0/users/networks?format=full", getRequestHeader()).then(function(list) {
                that.logger.log("debug", LOG_ID + "(getContacts) successfull");
                that.logger.log("info", LOG_ID + "(getContacts) REST contacts received ", list.total);
                that.logger.log("debug", LOG_ID + "(getContacts) _exiting_");
                resolve(list.data);
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
                    reject(err);
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
                    reject(err);
                });
            }
        });
    }

    getBots() {
        var that = this;
        return new Promise( (resolve, reject) => {
            that.logger.log("debug", LOG_ID + "(getBots) _entering_");

            that.http.get("/api/rainbow/enduser/v1.0/bots", getRequestHeader()).then( (json) => {
                 that.logger.log("info", LOG_ID + "(getBots) successfull");
                 that.logger.log("info", LOG_ID + "(getBots) REST get bubbles list", json.data);
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

    getBubbles() {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getBubbles) _entering_");

            that.http.get("/api/rainbow/enduser/v1.0/rooms?format=full&userId=" + that.account.id, getRequestHeader()).then(function(json) {
                 that.logger.log("info", LOG_ID + "(getBubbles) successfull");
                 that.logger.log("info", LOG_ID + "(getBubbles) REST get bubbles list", json.data);
                 that.logger.log("debug", LOG_ID + "(getBubbles) _exiting_");
                 resolve(json.data);
            }).catch(function(err) {
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
        var that = this;

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

    post(url, token, data) {
        var that = this;

        this.logger.log("debug", LOG_ID + "(post) _entering_");

        this.token = token;
        return new Promise(function(resolve, reject) {
            that.http.post(url, getRequestHeader(), data).then(function(JSON) {
                that.logger.log("debug", LOG_ID + "(post) _exiting_");
                resolve(JSON);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID + "(post) _exiting_", err);
                that.logger.log("debug", LOG_ID + "(post) _exiting_");
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

        return new Promise((resolve) => {

            that.eventEmitter.on("attempt_succeeded", () => {
                that.logger.log("debug", LOG_ID + "(reconnect) reconnection attempt successfull!");
                that.fibonacciStrategy.reset();
                that.reconnect.delay = that.fibonacciStrategy.getInitialDelay();
                resolve();
            });

            that.eventEmitter.on("attempt_failed", () => {
                that.reconnectDelay = that.fibonacciStrategy.next();
                that.attemptToReconnect(that.reconnectDelay);
            });

            that.attemptToReconnect(that.reconnectDelay);
        });
    }
    
}

module.exports = RESTService;