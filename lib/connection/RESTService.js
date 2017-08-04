"use strict";

var jwt = require("jwt-decode");
var btoa = require("btoa");

let backoff = require("backoff");

const Utils = require("../common/Utils.js");
let ErrorCase = require("../common/Error");

const RECONNECT_INITIAL_DELAY = 2000;
const RECONNECT_MAX_DELAY = 30000;

var getRequestHeader; 
var getRequestHeaderWithRange;
var getRequestHeaderWithContentType;
var getPostHeader;
var getLoginHeader;
var getDefaultHeader;

const LOG_ID = "REST - ";

class RESTService {

    constructor(_credentials, evtEmitter, _logger) {
        let that = this;
        this.http = null;
        this.cpaas = null;
        this.account = null;
        this.token = null;
        this.renewTokenInterval = null;
        this.auth = btoa(_credentials.login + ":" + _credentials.password);
        this._applicationToken = null;
        this.loginEmail = _credentials.login;
        this.eventEmitter = evtEmitter;
        this.logger = _logger;

        this.maxAttemptToReconnect = 30;

        this.fibonacciStrategy = new backoff.FibonacciStrategy({randomisationFactor: 0.4, initialDelay: RECONNECT_INITIAL_DELAY, maxDelay: RECONNECT_MAX_DELAY});
        this.reconnectDelay = this.fibonacciStrategy.getInitialDelay();

        getRequestHeader = (accept) => { 
            return { 
                "Authorization": "Bearer " + that.token, 
                "Accept": accept || "application/json",
                "x-rainbow-app-token": "Bearer " + that._applicationToken || ""
            };
        };

        getRequestHeaderWithRange = (accept, range) => {
            var header = getRequestHeader(accept);
			header.Range = range;
			return header;
        };

        getRequestHeaderWithContentType = (contentType) => {
            var header = getRequestHeader();
			header["Content-Type"] = contentType;
			return header;
        };

        getPostHeader = (contentType) => {
			var header = getRequestHeader();
			var type = contentType || "application/json";
			header["Content-Type"] = type;
			return header;
		};

        getLoginHeader = () => { 
            return { 
                "Accept": "application/json", 
                "Content-Type": "application/json",
                "Authorization": "Basic " + that.auth,
                "x-rainbow-app-token": that._applicationToken || ""
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

    getBubbles() {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getBubbles) _entering_");

            that.http.get("/api/rainbow/enduser/v1.0/rooms?format=full&userId=" + that.account.id, getRequestHeader()).then(function(json) {
                 that.logger.log("info", LOG_ID + "(getBubbles) successfull");
                 that.logger.log("info", LOG_ID + "(getBubbles) received " + json.total + " bubbles");
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

    getBubbleCustomData(bubbleId) {
        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getBubbleCustomData) _entering_");

            that.http.get("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "?format=full", getRequestHeader()).then(function(json) {
                 that.logger.log("info", LOG_ID + "(getBubbleCustomData) successfull");
                 that.logger.log("info", LOG_ID + "(getBubbleCustomData) REST get bubble information", json.data);
                 that.logger.log("debug", LOG_ID + "(getBubbleCustomData) _exiting_");
                 if (json.data.customData) {
                    resolve(json.data.customData);
                 } else {
                    resolve( {} );
                 }
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(getBubbleCustomData) error", err);
                that.logger.log("debug", LOG_ID + "(getBubbleCustomData) _exiting_");
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
                 that.logger.log("info", LOG_ID + "(setBubbleCustomData) REST post customData to bubble", json.data);
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
                that.logger.log("error", LOG_ID + "(createGuestUser) Admin API requested has no Admin roles");
                let err = new Error(ErrorCase.FORBIDDEN.msg + " Administrator role is requested");
                throw err;
            }

            let user = {
                email: email,
                lang: language
            };

            if(message) {
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
                that.logger.log("error", LOG_ID + "(createGuestUser) Admin API requested has no Admin roles");
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
                firstName: firstname,
                lastName: lastname,
                isActive: true,
                isInitialized: false,
                language: language,
                adminType: "undefined",
                roles: ["user", "guest"],
                accountType: "free",
                companyId: that.account.companyId // Current requester company
            };

            if ( timeToLive ) {
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

        return new Promise(function (resolve, reject) {

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

        return new Promise(function (resolve, reject) {

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