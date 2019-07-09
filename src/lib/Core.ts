"use strict";
import {XMPPService} from "./connection/XMPPService";
import {RESTService} from "./connection/RESTService";
import {HTTPService} from "./connection/HttpService";

export {};


const Logger = require("./common/Logger");
const IMService = require("./services/ImsService");
const PresenceService = require("./services/PresenceService");
const ChannelsService = require("./services/ChannelsService");
const ContactsService = require("./services/ContactsService");
const ConversationsService = require("./services/ConversationsService");
const Profiles = require("./services/ProfilesService");
const TelephonyService = require("./services/TelephonyService");
const BubblesService = require("./services/BubblesService");
const GroupsService = require("./services/GroupsService");
const AdminService = require("./services/AdminService");
const SettingsService = require("./services/SettingsService");
const FileServer = require("./services/FileServerService");
const FileStorage = require("./services/FileStorageService");
const StateManager = require("./common/StateManager");
const CallLogService = require( "./services/CallLogService");
const FavoritesService = require( "./services/FavoritesService");

const Events = require("./common/Events");

const Options = require("./config/Options");
const ProxyImpl = require("./ProxyImpl");

const packageVersion = require("../package.json");

var _signin;
var _retrieveInformation;

const LOG_ID = "CORE - ";

class Core {
	public _signin: any;
	public _retrieveInformation: any;
	public onTokenRenewed: any;
	public logger: any;
	public _rest: RESTService;
	public onTokenExpired: any;
	public _eventEmitter: any;
	public _tokenSurvey: any;
	public options: any;
	public _proxy: any;
	public _http: any;
	public _xmpp: XMPPService;
	public _stateManager: any;
	public _im: any;
	public _presence: any;
	public _channels: any;
	public _contacts: any;
	public _conversations: any;
	public _profiles: any;
	public _telephony: any;
	public _bubbles: any;
	public _groups: any;
	public _admin: any;
	public _settings: any;
	public _fileServer: any;
	public _fileStorage: any;
    public _calllog: any;
    public _favorites: any;
	public _botsjid: any;

    constructor(options) {

        var self = this;

        this._signin = (forceStopXMPP) => {
            var that = this;
            that.logger.log("debug", LOG_ID + "(signin) _entering_");

            let json = null;

            return new Promise(function (resolve, reject) {

                return that._xmpp.stop(forceStopXMPP).then(() => {
                    return that._rest.signin();
                }).then((_json) => {
                    json = _json;
                    let headers = {
                        "headers": {
                            "Authorization": "Bearer " + that._rest.token,
                            "x-rainbow-client": "sdk_node",
                            "x-rainbow-client-version": packageVersion.version
                            // "Accept": accept || "application/json",
                        }
                    };
                    return that._xmpp.signin(that._rest.loggedInUser, headers);
                }).then(function () {
                    that.logger.log("debug", LOG_ID + "(signin) signed in successfully");
                    that.logger.log("debug", LOG_ID + "(signin) _exiting_");
                    resolve(json);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID + "(signin) can't signed-in", err);
                    that.logger.log("debug", LOG_ID + "(signin) _exiting_");
                    reject(err);
                });
            });
        };

        this._retrieveInformation = (useCLIMode) => {
            var that = this;
            that.logger.log("debug", LOG_ID + "(_retrieveInformation) useCLIMode : ", useCLIMode);
            return new Promise((resolve, reject) => {

                if (useCLIMode) {
                    resolve();
                } else {
                    return that._contacts.getRosters()
                        .then(() => {
                            return that._profiles.init();
                        }).then(() => {
                            return that._telephony.init();
                        }).then(() => {
                            return that._contacts.init();
                        }).then(() => {
                            return that._fileStorage.init();
                        }).then(() => {
                            return that._fileServer.init();
                        }).then(() => {
                            return that.presence._sendPresenceFromConfiguration();
                        }).then(() => {
                            return that._bubbles.getBubbles();
                        }).then(() => {
                            return that._channels.fetchMyChannels();
                        }).then(() => {
                            return that._groups.getGroups();
                        }).then(() => {
                            return that.presence.sendInitialPresence();
                        }).then(() => {
                            return that.im.enableCarbon();
                        }).then(() => {
                            return that._rest.getBots();
                        }).then((bots) => {
                            that._botsjid = bots ? bots.map((bot) => {
                                return bot.jid;
                            }) : [];
                            return Promise.resolve();
                        }).then(() => {
                            return that._conversations.getServerConversations();
                        }).then(() => {
                            return that._calllog.init();
                        }).then(() => {
                            return that._favorites.init();
                        }).then(() => {
                            resolve();
                        }).catch((err) => {
                            reject(err);
                        });
                }
            });
        };

        this.onTokenRenewed = function onTokenRenewed() {
            this.logger.log("info", LOG_ID +  "(tokenSurvey) token successfully renewed");
            this._rest.startTokenSurvey();
        };

        this.onTokenExpired = function onTokenExpired() {
            this.logger.log("info", LOG_ID +  "(tokenSurvey) token expired. Signin required");
/*
            this._eventEmitter.iee.removeListener("rainbow_tokenrenewed", this.onTokenRenewed.bind(this));
            this._eventEmitter.iee.removeListener("rainbow_tokenexpired", this.onTokenExpired.bind(this));
*/
            this._eventEmitter.iee.emit("evt_internal_signinrequired");
        };

        this._tokenSurvey = () => {
            var that = this;
            that.logger.log("debug", LOG_ID +  "(tokenSurvey) _enter_");

            if (that.options.useCLIMode) {
                that.logger.log("info", LOG_ID +  "(tokenSurvey) No token survey in CLI mode");
                return;
            }

/*
            that._eventEmitter.iee.removeListener("rainbow_tokenrenewed", that.onTokenRenewed.bind(that));
            that._eventEmitter.iee.removeListener("rainbow_tokenexpired", that.onTokenExpired.bind(that));
            that._eventEmitter.iee.on("rainbow_tokenrenewed", that.onTokenRenewed.bind(that));
            that._eventEmitter.iee.on("rainbow_tokenexpired", that.onTokenExpired.bind(that));
*/
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
        this._eventEmitter.setCore(this);
        this._eventEmitter.iee.on("evt_internal_signinrequired", function () {
            self.signin(true);
        });
        this._eventEmitter.iee.on("rainbow_application_token_updated", function (token) {
            self._rest.applicationToken = token;
        });

        this._eventEmitter.iee.on("rainbow_onxmpperror", function (err) {
            self._stateManager.transitTo(self._stateManager.ERROR, err);
        });

        this._eventEmitter.iee.on("rainbow_xmppreconnected", function () {
            var that = this;
            //todo, check that REST part is ok too
            self._rest.reconnect().then((data) => {
                self.logger.log("info", LOG_ID + " (rainbow_xmppreconnected) reconnect succeed : ", data, " so change state to connected");
                return self._stateManager.transitTo(self._stateManager.CONNECTED).then((data2) => {
                    self.logger.log("info", LOG_ID + " (rainbow_xmppreconnected) transition to connected succeed : ", data2);
                    return self._retrieveInformation();
                });
            }).then((data3) => {
                self.logger.log("info", LOG_ID + " (rainbow_xmppreconnected) _retrieveInformation succeed : ", data3,  " change state to ready");
                self._stateManager.transitTo(self._stateManager.READY).then((data4) => {
                    self.logger.log("info", LOG_ID + " (rainbow_xmppreconnected) transition to ready succeed : ", data4);
                });
            }).catch((err) => {
                // If not already connected, it is an error in xmpp connection, so should failed
                if (!self._stateManager.isCONNECTED()) {
                    self.logger.log("error", LOG_ID + " (rainbow_xmppreconnected) REST connection ", self._stateManager.FAILED, ", ErrorManager : ", err);
                    self._stateManager.transitTo(self._stateManager.FAILED);
                } else {
                    self.logger.log("warn", LOG_ID + " (rainbow_xmppreconnected) REST reconnection ErrorManager : ", err, ", set state : ", self._stateManager.DISCONNECTED);
                    // ErrorManager in REST micro service, so let say it is disconnected
                    self._stateManager.transitTo(self._stateManager.DISCONNECTED);
                    // relaunch the REST connection.
                    self._eventEmitter.iee.emit("rainbow_xmppreconnected");
                }
            });
        });

        this._eventEmitter.iee.on("rainbow_xmppreconnectingattempt", function () {
            self._stateManager.transitTo(self._stateManager.RECONNECTING);
        });

        this._eventEmitter.iee.on("rainbow_xmppdisconnect", function (xmppDisconnectInfos) {
            if (xmppDisconnectInfos && xmppDisconnectInfos.reconnect) {
                self.logger.log("info", LOG_ID + " (rainbow_xmppdisconnect) set to state : ", self._stateManager.DISCONNECTED);
                self._stateManager.transitTo(self._stateManager.DISCONNECTED);
            }  else {
                self.logger.log("info", LOG_ID + " (rainbow_xmppdisconnect) set to state : ", self._stateManager.STOPPED);
                self._stateManager.transitTo(self._stateManager.STOPPED);
            }
        });

        this._eventEmitter.iee.on("rainbow_tokenrenewed", this.onTokenRenewed.bind(this));
        this._eventEmitter.iee.on("rainbow_tokenexpired", this.onTokenExpired.bind(this));

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
        this._proxy = new ProxyImpl(this.options.proxyOptions, this.logger);
        this._http = new HTTPService(this.options.httpOptions, this.logger, this._proxy, this._eventEmitter.iee);
        this._rest = new RESTService(this.options.credentials, this.options.applicationOptions, this.options._isOfficialRainbow(), this._eventEmitter.iee, this.logger);
        this._xmpp = new XMPPService(this.options.xmppOptions, this.options.imOptions, this.options.applicationOptions, this._eventEmitter.iee, this.logger, this._proxy);

        // Instantiate State Manager
        this._stateManager = new StateManager(this._eventEmitter, this.logger);

        // Instantiate others Services
        this._im = new IMService(this._eventEmitter.iee, this.logger, this.options.imOptions);
        this._presence = new PresenceService(this._eventEmitter.iee, this.logger);
        this._channels = new ChannelsService(this._eventEmitter.iee, this.logger);
        this._contacts = new ContactsService(this._eventEmitter.iee, this.options.httpOptions, this.logger);
        this._conversations = new ConversationsService(this._eventEmitter.iee, this.logger);
        this._profiles = new Profiles.ProfilesService(this._eventEmitter.iee, this.logger);
        this._telephony = new TelephonyService(this._eventEmitter.iee, this.logger);
        this._bubbles = new BubblesService(this._eventEmitter.iee, this.logger);
        this._groups = new GroupsService(this._eventEmitter.iee, this.logger);
        this._admin = new AdminService(this._eventEmitter.iee, this.logger);
        this._settings = new SettingsService(this._eventEmitter.iee, this.logger);
        this._fileServer = new FileServer(this._eventEmitter.iee, this.logger);
        this._fileStorage = new FileStorage(this._eventEmitter.iee, this.logger);
        this._calllog = new CallLogService(this._eventEmitter.iee, this.logger);
        this._favorites = new FavoritesService(this._eventEmitter.iee,this.logger);

        this._botsjid = [];

        this.logger.log("debug", LOG_ID + "(constructor) _exiting_");
    }

    start(useCLIMode) {
        var that = this;

        this.logger.log("debug", LOG_ID + "(start) _entering_");

        return new Promise(function (resolve, reject) {

            try {

                if (!that.options.hasCredentials) {
                    that.logger.log("error", LOG_ID + "(start) No credentials. Stop loading...");
                    that.logger.log("debug", LOG_ID + "(start) _exiting_");
                    reject("Credentials are missing. Check your configuration!");
                }
                else {
                    that.logger.log("debug", LOG_ID + "(start) start all modules");
                    that.logger.log("internal", LOG_ID + "(start) start all modules for user : ", that.options.credentials.login);

                    return that._stateManager.start().then(() => {
                        return that._http.start();
                    }).then(() => {
                        return that._rest.start(that._http);
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
                        return that._conversations.start(that._xmpp, that._rest, that._contacts, that._bubbles, that._fileStorage, that._fileServer);
                    }).then(() => {
                        return that._profiles.start(that._xmpp, that._rest);
                    }).then(() => {
                        return that._telephony.start(that._xmpp, that._rest, that._contacts, that._bubbles, that._profiles);
                    }).then(() => {
                        return that._im.start(that._xmpp, that._conversations, that._bubbles, that._fileStorage);
                    }).then(() => {
                        return that._channels.start(that._xmpp, that._rest);
                    }).then(() => {
                        return that._groups.start(that._xmpp, that._rest);
                    }).then(() => {
                        return that._admin.start(that._xmpp, that._rest);
                    }).then(() => {
                        return that._fileServer.start(that._xmpp, that._rest, that._fileStorage);
                    }).then(() => {
                        return that._fileStorage.start(that._xmpp, that._rest, that._fileServer, that._conversations);
                    }).then(() => {
                        return that._calllog.start(that._xmpp, that._rest, that._contacts, that._profiles, that._telephony);
                    }).then(() => {
                        return that._favorites.start(that._xmpp, that._rest);
                    }).then(() => {
                        that.logger.log("debug", LOG_ID + "(start) all modules started successfully");
                        that._stateManager.transitTo(that._stateManager.STARTED).then(() => {
                            that.logger.log("debug", LOG_ID + "(start) _exiting_");
                            resolve();
                        }).catch((err) => {
                            reject(err);
                        });
                    }).catch((err) => {
                        that.logger.log("error", LOG_ID + "(start) error", err);
                        that.logger.log("debug", LOG_ID + "(start) _exiting_");
                        reject(err);
                    });
                }

            } catch (err) {
                that.logger.log("error", LOG_ID + "(start)", err.message);
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                reject(err);
            }
        });
    }

    signin(forceStopXMPP) {

        var that = this;
        return new Promise(function (resolve, reject) {

            var json = null;

            return that._signin(forceStopXMPP).then(function (_json) {
                json = _json;
                that._tokenSurvey();
                return that._stateManager.transitTo(that._stateManager.CONNECTED).then(() => {
                    return that._retrieveInformation(that.options.useCLIMode);
                });
            }).then(() => {
                that._stateManager.transitTo(that._stateManager.READY).then(() => {
                    resolve(json);
                }).catch((err)=> { reject(err); });
            }).catch((err) => {
                reject(err);
            });
        });
    }

    stop() {
        var that = this;
        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function (resolve, reject) {

            that.logger.log("debug", LOG_ID + "(stop) stop all modules");

            that._rest.stop().then(() => {
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
                return that._telephony.stop();
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
                return that._fileStorage.stop();
            }).then(() => {
                return that._stateManager.stop();
            }).then(() => {
                return that._calllog.stop();
            }).then(() => {
                return that._favorites.stop();
            }).then(() => {
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
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

    get fileStorage() {
        return this._fileStorage;
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

    get telephony() {
        return this._telephony;
    }

    get calllog() {
        return this._calllog;
    }
}

module.exports = Core;
