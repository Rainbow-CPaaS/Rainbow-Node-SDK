"use strict";

var Logger = require("./common/Logger");
var CPaaSService = require("./connection/CPaaSService");
var RESTService = require("./connection/RESTService");
var HTTPService = require("./connection/HttpService");
var XMPPService = require("./connection/XMPPService");
var IMService = require("./services/IM");
var PresenceService = require("./services/Presence");
var ChannelsService = require("./services/Channels");
var ContactsService = require("./services/Contacts");
var ConversationsService = require("./services/Conversations");
var BubblesService = require("./services/Bubbles");
var GroupsService = require("./services/Groups");
var AdminService = require("./services/Admin");
var SettingsService = require("./services/Settings");
var FileServerService = require("./services/FileServerService");
var StateManager = require("./common/StateManager");

var Events = require("./common/Events");

var Options = require("./config/Options");
var Proxy = require("./Proxy");

var packageVersion = require("../package.json");

var _signin;
var _tokenSurvey;
var _retrieveInformation;

const LOG_ID = "CORE - ";

class Core {

    constructor(options) {

        var self = this;

        this._signin = (forceStopXMPP) => {
            var that = this;
            that.logger.log("debug", LOG_ID +  "(signin) _entering_");

            let json = null;

            return new Promise(function(resolve, reject) {

                return that._xmpp.stop(forceStopXMPP).then(() => {
                    return that._rest.signin();
                }).then((_json) => {
                    json = _json;
                    let headers = {
                        "headers": {
                            "Authorization": "Bearer " + that._rest.token
                            // "Accept": accept || "application/json",
                        }
                    };
                    return that._xmpp.signin(that._rest.loggedInUser, headers);
                }).then(function() {
                    that.logger.log("debug", LOG_ID +  "(signin) signed in successfully");
                    that.logger.log("debug", LOG_ID +  "(signin) _exiting_");
                    resolve(json);
                }).catch(function(err) {
                    that.logger.log("debug", LOG_ID +  "(signin) can't signed-in", err);
                    that.logger.log("debug", LOG_ID +  "(signin) _exiting_");
                    reject(err);
                });
            });
        };

        this._retrieveInformation = (useCLIMode) => {
            var that = this;
            return new Promise((resolve, reject) => {

                if ( useCLIMode) {
                    resolve();
                } else {
                    return that._contacts.getRosters()
                    .then(() => {
                        return that._bubbles.getBubbles();
                    }).then(() => {
                        return that.presence._sendPresenceFromConfiguration();
                    }).then(() => {
                        return that._channels.getChannels();
                    }).then(() => {
                        return that._groups.getGroups();
                    }).then(function() {
                        return that.presence.sendInitialPresence();
                    }).then(function() {
                        return that.im.enableCarbon();
                    }).then(function() {
                        return that._rest.getBots();
                    }).then((bots) => {
                        that._botsjid = bots ? bots.map( (bot) => { return bot.jid;}) : [];
                        return Promise.resolve();
                    }).then(() => {
                        return that.conversations.getServerConversations();
                    }).then(function() {
                        resolve();
                    }).catch((err) => {
                        reject(err);
                    });
                }
            });
        };

        this._tokenSurvey = () => {
            var that = this;
            that.logger.log("debug", LOG_ID +  "(tokenSurvey) _enter_");

            if (that.options.useCLIMode) {
                that.logger.log("info", LOG_ID +  "(tokenSurvey) No token survey in CLI mode");
                return;
            }

            var onTokenRenewed = function onTokenRenewed() {
                that.logger.log("info", LOG_ID +  "(tokenSurvey) token successfully renewed");
                that._rest.startTokenSurvey();
            };

            var onTokenExpired = function onTokenExpired() {
                that.logger.log("info", LOG_ID +  "(tokenSurvey) token expired. Signin required");
                that._eventEmitter.iee.removeListener("rainbow_tokenrenewed", onTokenRenewed);
                that._eventEmitter.iee.removeListener("rainbow_tokenexpired", onTokenExpired);
                that._eventEmitter.iee.emit("rainbow_signinrequired");
            };

            that._eventEmitter.iee.on("rainbow_tokenrenewed", onTokenRenewed);
            that._eventEmitter.iee.on("rainbow_tokenexpired", onTokenExpired);
            that._rest.startTokenSurvey();
        };

        // Initialize the logger
        var loggerModule = new Logger(options);
        this.logger = loggerModule.log;
        this.logger.log("debug", LOG_ID + "(constructor) _entering_");
        this.logger.log("debug", LOG_ID + "(constructor) ------- SDK INFORMATION -------");

        this.logger.log("info", LOG_ID + " (constructor) SDK version: " + packageVersion.version);
        this.logger.log("info", LOG_ID + " (constructor) Node version: " + process.version);
        for (var key in process.versions) {
            this.logger.log("info", LOG_ID + " (constructor) " + key + " version: " + process.versions[key]);
        }
        this.logger.log("debug", LOG_ID + "(constructor) ------- SDK INFORMATION -------");

        // Initialize the options

        this.options = new Options(options, this.logger);
        this.options.parse();

        // Initialize the Events Emitter
        this._eventEmitter = new Events(self.logger, (jid) => {
             return self._botsjid.includes(jid);
            });
        this._eventEmitter.iee.on("rainbow_signinrequired", function() {
            self.signin(true);
        });
        this._eventEmitter.iee.on("rainbow_application_token_updated", function(token) {
            self._rest.applicationToken = token;
        });

        this._eventEmitter.iee.on("rainbow_onxmpperror", function() {
            self._stateManager.transitTo(self._stateManager.ERROR);
        });

        this._eventEmitter.iee.on("rainbow_xmppreconnected", function() {
            //todo, check that REST part is ok too
            self._rest.reconnect().then(() => {
                self._stateManager.transitTo(self._stateManager.CONNECTED);
                return self._retrieveInformation();
            }).then(()=> {
                self._stateManager.transitTo(self._stateManager.READY);
            }).catch(() => {
                self._stateManager.transitTo(self._stateManager.FAILED);
            });
        });

        this._eventEmitter.iee.on("rainbow_xmppreconnectingattempt", function() {
            self._stateManager.transitTo(self._stateManager.RECONNECTING);
        });

        this._eventEmitter.iee.on("rainbow_xmppdisconnect", function() {
            self._stateManager.transitTo(self._stateManager.DISCONNECTED);
        });

        if (this.options.useXMPP) {
            this.logger.log("info", LOG_ID + "(constructor) used in XMPP mode");
        }
        else {
            if (this.options.useCLIMode) {
                this.logger.log("info", LOG_ID + "(constructor) used in CLI mode");
            }
            else {
                this.logger.log("info", LOG_ID + "(constructor) used in HOOK mode");
            }
        }

        // Instantiate basic service
        this._proxy = new Proxy(this.options.proxyOptions, this.logger);
        this._http = new HTTPService(this.options.httpOptions, this.logger, this._proxy);
        this._rest = new RESTService(this.options.credentials, this.options.applicationOptions, this._eventEmitter.iee, this.logger);
        this._xmpp = new XMPPService(this.options.xmppOptions, this.options.imOptions, this._eventEmitter.iee, this.logger, this._proxy);

        // Instantiate State Manager
        this._stateManager = new StateManager(this._eventEmitter, this.logger);

        // Instantiate others Services
        this._cpaas = new CPaaSService(this.options.applicationOptions, this.options.httpOptions, this._eventEmitter.iee, this.logger);
        this._im = new IMService(this._eventEmitter.iee, this.logger);
        this._presence = new PresenceService(this._eventEmitter.iee, this.logger);
        this._channels = new ChannelsService(this._eventEmitter.iee, this.logger);
        this._contacts = new ContactsService(this._eventEmitter.iee, this.logger);
        this._conversations = new ConversationsService(this._eventEmitter.iee, this.logger);
        this._bubbles = new BubblesService(this._eventEmitter.iee, this.logger);
        this._groups = new GroupsService(this._eventEmitter.iee, this.logger);
        this._admin = new AdminService(this._eventEmitter.iee, this.logger);
        this._settings = new SettingsService(this._eventEmitter.iee, this.logger);
        this._fileServer = new FileServerService(this._eventEmitter.iee, this.logger);

        this._botsjid = [];

        this.logger.log("debug", LOG_ID + "(constructor) _exiting_");
    }

    start(useCLIMode)
    {
        var that = this;

        this.logger.log("debug", LOG_ID +  "(start) _entering_");

        return new Promise(function(resolve, reject) {

            try {

                if (!that.options.hasCredentials) {
                    that.logger.log("error", LOG_ID +  "(start) No credentials. Stop loading...");
                    that.logger.log("debug", LOG_ID +  "(start) _exiting_");
                    reject("Credentials are missing. Check your configuration!");
                }
                else {
                    that.logger.log("debug", LOG_ID +  "(start) start all modules");

                    return that._stateManager.start().then(() => {
                        return that._http.start();
                    }).then(() => {
                        return that._cpaas.start(that._http, useCLIMode);
                    }).then((token) => {
                        return that._rest.start(that._http, that._cpaas, token);
                    }).then(() => {
                        return that._xmpp.start(that.options.useXMPP);
                    }).then(() => {
                        return that._settings.start(that._xmpp, that._rest);
                    }).then(() => {
                        return that._presence.start(that._xmpp, that._settings);
                    }).then(() => {
                        return that._contacts.start(that._xmpp, that._rest);
                    }).then(() => {
                        return that._bubbles.start(that._xmpp, that._rest);
                    }).then(() => {
                        return that._conversations.start(that._xmpp, that._rest, that._contacts, that._bubbles);
                    }).then(() => {
                        return that._im.start(that._xmpp, that._conversations);
                    }).then(() => {
                        return that._channels.start(that._xmpp, that._rest);
                    }).then(() => {
                        return that._groups.start(that._xmpp, that._rest);
                    }).then(() => {
                        return that._admin.start(that._xmpp, that._rest);
                    }).then(() => {
                        return that._fileServer.start(that._xmpp, that._rest);
                    }).then(() => {
                        that.logger.log("debug", LOG_ID +  "(start) all modules started successfully");
                        that._stateManager.transitTo(that._stateManager.STARTED);
                        that.logger.log("debug", LOG_ID +  "(start) _exiting_");
                        resolve();
                    }).catch((err) => {
                        that.logger.log("error", LOG_ID + "(start) error", err);
                        that.logger.log("debug", LOG_ID +  "(start) _exiting_");
                        reject(err);
                    });
                }

            } catch (err) {
                that.logger.log("error", LOG_ID + "(start)", err.message);
                that.logger.log("debug", LOG_ID +  "(start) _exiting_");
                reject(err);
            }
        });
    }

    signin(forceStopXMPP) {

        var that = this;
        return new Promise(function(resolve, reject) {

            var json = null;

            return that._signin(forceStopXMPP).then(function(_json) {
                json = _json;
                that._tokenSurvey();
                that._stateManager.transitTo(that._stateManager.CONNECTED);
                return that._retrieveInformation(that.options.useCLIMode);
            }).then(()=> {
                that._stateManager.transitTo(that._stateManager.READY);
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    stop() {
        var that = this;
        this.logger.log("debug", LOG_ID +  "(stop) _entering_");

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID +  "(stop) stop all modules");

            that._rest.stop().then(() => {
                return that._cpaas.stop();
            }).then(() => {
                return that._http.stop();
            }).then(() => {
                return that._xmpp.stop(that.options.useXMPP);
            }).then(() => {
                return that._im.stop();
            }).then(() => {
                return that._settings.stop();
            }).then(() => {
                return that._presence.stop();
            }).then(() => {
                return that._conversations.stop();
            }).then(() => {
                return that._contacts.stop();
            }).then(() => {
                return that._bubbles.stop();
            }).then(() => {
                return that._channels.stop();
            }).then(() => {
                return that._groups.stop();
            }).then(() => {
                return that._admin.stop();
            }).then(() => {
                return that._fileServer.stop();
            }).then(() => {
                return that._stateManager.stop();
            }).then(() => {
                that.logger.log("debug", LOG_ID +  "(stop) _exiting_");
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }

    get settings() {
        return this._settings;
    }

    get presence() {
        return this._presence;
    }

    get im() {
        return this._im;
    }

    get contacts() {
        return this._contacts;
    }

    get conversations() {
        return this._conversations;
    }

    get channels() {
        return this._channels;
    }

    get bubbles() {
        return this._bubbles;
    }

    get groups() {
        return this._groups;
    }

    get admin() {
        return this._admin;
    }

    get fileServer() {
        return this._fileServer;
    }

    get events() {
        return this._eventEmitter;
    }

    get rest() {
        return this._rest;
    }

    get state() {
        return this._stateManager.state;
    }

    get version() {
        return packageVersion.version;
    }
}

module.exports = Core;
