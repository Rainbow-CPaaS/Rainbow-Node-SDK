"use strict";
import {logEntryExit} from "./common/Utils";

export {};

import {XMPPService} from "./connection/XMPPService";
import {RESTService} from "./connection/RESTService";
import {HTTPService} from "./connection/HttpService";
import {Logger} from "./common/Logger";
import {IMService} from "./services/ImsService";
import {PresenceService} from "./services/PresenceService";
import {ChannelsService} from "./services/ChannelsService";
import {ContactsService} from "./services/ContactsService";
import {ConversationsService} from "./services/ConversationsService";
import {ProfilesService} from "./services/ProfilesService";
import {TelephonyService} from "./services/TelephonyService";
import {BubblesService} from "./services/BubblesService";
import {GroupsService} from "./services/GroupsService";
import {AdminService} from "./services/AdminService";
import {SettingsService} from "./services/SettingsService";
import {FileServerService} from "./services/FileServerService";
import {FileStorageService} from "./services/FileStorageService";
import {StateManager} from "./common/StateManager";
import {CallLogService} from "./services/CallLogService";
import {FavoritesService} from "./services/FavoritesService";
import {InvitationsService} from "./services/InvitationsService";
import {Events} from "./common/Events";
import {setFlagsFromString} from "v8";
import {Options} from "./config/Options";
import {ProxyImpl} from "./ProxyImpl";
import {ErrorManager} from "./common/ErrorManager";

import {lt} from "semver";
import {S2SService} from "./services/S2SService";

const packageVersion = require("../package.json");

let _signin;
let _retrieveInformation;

const LOG_ID = "CORE - ";

@logEntryExit(LOG_ID)
class Core {
	public _signin: any;
	public _retrieveInformation: any;
	public onTokenRenewed: any;
	public logger: any;
	public _rest: RESTService;
	public onTokenExpired: any;
	public _eventEmitter: Events;
	public _tokenSurvey: any;
	public options: any;
	public _proxy: ProxyImpl;
	public _http: HTTPService;
	public _xmpp: XMPPService;
	public _stateManager: StateManager;
	public _im: IMService;
	public _presence: PresenceService;
	public _channels: ChannelsService;
	public _contacts: ContactsService;
	public _conversations: ConversationsService;
	public _profiles: ProfilesService;
	public _telephony: TelephonyService;
	public _bubbles: BubblesService;
	public _groups: GroupsService;
	public _admin: AdminService;
	public _settings: SettingsService;
	public _fileServer: FileServerService;
	public _fileStorage: FileStorageService;
    public _calllog: CallLogService;
    public _favorites: FavoritesService;
    public _invitations: InvitationsService;
	public _botsjid: any;
    public _s2s: S2SService;

    constructor(options) {

        let self = this;

        self._signin = (forceStopXMPP, token) => {
            let that = self;
            that.logger.log("debug", LOG_ID + "(signin) _entering_");

            let json = null;

            return new Promise(function (resolve, reject) {

                if (that.options.useXMPP) {
                    return that._xmpp.stop(forceStopXMPP).then(() => {
                        return that._rest.signin(token);
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
                        that.logger.log("error", LOG_ID + "(signin) can't signed-in.");
                        that.logger.log("internalerror", LOG_ID + "(signin) can't signed-in", err);
                        that.logger.log("debug", LOG_ID + "(signin) _exiting_");
                        reject(err);
                    });
                }
                if (that.options.useS2S) {
                    return that._rest.signin(token).then(async (_json) => {
                        json = _json;
                        let headers = {
                            "headers": {
                                "Authorization": "Bearer " + that._rest.token,
                                "x-rainbow-client": "sdk_node",
                                "x-rainbow-client-version": packageVersion.version
                                // "Accept": accept || "application/json",
                            }
                        };

                        return that._s2s.signin(that._rest.loggedInUser, headers);
                    }).then(function () {
                        that.logger.log("debug", LOG_ID + "(signin) signed in successfully");
                        that.logger.log("debug", LOG_ID + "(signin) _exiting_");
                        resolve(json);
                    }).catch(function (err) {
                        that.logger.log("error", LOG_ID + "(signin) can't signed-in.");
                        that.logger.log("internalerror", LOG_ID + "(signin) can't signed-in", err);
                        that.logger.log("debug", LOG_ID + "(signin) _exiting_");
                        reject(err);
                    });
                } else {
                    that._rest.signin(token).then((_json) => {
                        json = _json;
                        let headers = {
                            "headers": {
                                "Authorization": "Bearer " + that._rest.token,
                                "x-rainbow-client": "sdk_node",
                                "x-rainbow-client-version": packageVersion.version
                                // "Accept": accept || "application/json",
                            }
                        };
                        that.logger.log("debug", LOG_ID + "(signin) signed in successfully");
                        that.logger.log("debug", LOG_ID + "(signin) _exiting_");
                        resolve(json);
                    });
                }
            });
        };

        self._retrieveInformation = () => {
            let that = self;
            that.logger.log("debug", LOG_ID + "(_retrieveInformation).");
            //that.logger.log("internal", LOG_ID + "(_retrieveInformation) options : ", that.options);
            return new Promise(async (resolve, reject) => {

                if (that.options.testOutdatedVersion) {
                    await that._rest.getRainbowNodeSdkPackagePublishedInfos().then((infos: any) => {
                        // self.logger.log("internal", LOG_ID +  "(getRainbowNodeSdkPackagePublishedInfos) infos : ", infos);
                        infos.results.forEach((packagePublished: any) => {
                            if (packagePublished.package.name === packageVersion.name) {
                                //if (packagePublished.package.version !== packageVersion.version) {
                                if (lt(packageVersion.version, packagePublished.package.version)) {
                                    self.logger.log("error", LOG_ID + "(getRainbowNodeSdkPackagePublishedInfos)  \n " +
                                        "*******************************************************\n\n", self.logger.colors.red.underline("WARNING : "), self.logger.colors.italic("\n  curent rainbow-node-sdk version : " + packageVersion.version + " is OLDER than the latest available one on npmjs.com : " + packagePublished.package.version + "\n  please update it (npm install rainbow-node-sdk@latest) and use the CHANGELOG to consider the changes."), "\n\n*******************************************************");
                                    let error = {
                                        "label": "curent rainbow-node-sdk version : " + packageVersion.version + " is OLDER than the latest available one on npmjs.com : " + packagePublished.package.version + " please update it (npm install rainbow-node-sdk@latest) and use the CHANGELOG to consider the changes.",
                                        "currentPackage": packageVersion.version,
                                        "latestPublishedPackage": packagePublished.package.version
                                    };
                                    self._eventEmitter.iee.emit("evt_internal_onrainbowversionwarning", error);

                                    //self.events.publish("rainbowversionwarning", error);
                                }
                            }
                        });
                    }).catch((error) => {
                        self.logger.log("error", LOG_ID + "(getRainbowNodeSdkPackagePublishedInfos) error : ", error);
                        // self.logger.log("internalerror", LOG_ID +  "(getRainbowNodeSdkPackagePublishedInfos) error : ", error);
                    });
                }

                if (that.options.useS2S) {
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
                            //return that.presence.sendInitialPresence();
                            return Promise.resolve();
                        }).then(() => {
                            //return that.im.enableCarbon();
                            return Promise.resolve();
                        }).then(() => {
                            return that._rest.getBots();
                        }).then((bots : any) => {
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
                            return that._invitations.init();
                        }).then(() => {
                            return that._s2s.listConnectionsS2S();
                        }).then(() => {
                            resolve();
                        }).catch((err) => {
                            that.logger.log("error", LOG_ID + "(_retrieveInformation) !!! CATCH  Error while initializing services.");
                            that.logger.log("internalerror", LOG_ID + "(_retrieveInformation) !!! CATCH  Error while initializing services : ", err);
                            reject(err);
                        });
                    //return resolve();
                }
                if (that.options.useCLIMode) {
                    return resolve();
                }
                if (that.options.useXMPP) {
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
                            //return that.presence.sendInitialPresence();
                            return Promise.resolve();
                        }).then(() => {
                            return that.im.enableCarbon();
                        }).then(() => {
                            return that._rest.getBots();
                        }).then((bots : any) => {
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
                            return that._invitations.init();
                        }).then(() => {
                            resolve();
                        }).catch((err) => {
                            that.logger.log("error", LOG_ID + "(_retrieveInformation) !!! CATCH  Error while initializing services.");
                            that.logger.log("internalerror", LOG_ID + "(_retrieveInformation) !!! CATCH  Error while initializing services : ", err);
                            reject(err);
                        });
                }
            });
        };

        self.onTokenRenewed = function onTokenRenewed() {
            self.logger.log("info", LOG_ID +  "(tokenSurvey) token successfully renewed");
            self._rest.startTokenSurvey();
        };

        self.onTokenExpired = function onTokenExpired() {
            self.logger.log("info", LOG_ID +  "(tokenSurvey) token expired. Signin required");
/*
            self._eventEmitter.iee.removeListener("rainbow_tokenrenewed", self.onTokenRenewed.bind(self));
            self._eventEmitter.iee.removeListener("rainbow_tokenexpired", self.onTokenExpired.bind(self));
*/
            self._eventEmitter.iee.emit("evt_internal_signinrequired");
        };

        self._tokenSurvey = () => {
            let that = self;
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
        let loggerModule = new Logger(options);
        self.logger = loggerModule.log;
        self.logger.log("debug", LOG_ID + "(constructor) _entering_");
        self.logger.log("debug", LOG_ID + "(constructor) ------- SDK INFORMATION -------");

        self.logger.log("info", LOG_ID + " (constructor) SDK version: " + packageVersion.version);
        self.logger.log("info", LOG_ID + " (constructor) Node version: " + process.version);
        for (let key in process.versions) {
            self.logger.log("info", LOG_ID + " (constructor) " + key + " version: " + process.versions[key]);
        }
        self.logger.log("debug", LOG_ID + "(constructor) ------- SDK INFORMATION -------");

        // Initialize the options

        self.options = new Options(options, self.logger);
        self.options.parse();

        // Initialize the Events Emitter
        self._eventEmitter = new Events(self.logger, (jid) => {
            return self._botsjid.includes(jid);
        });
        self._eventEmitter.setCore(self);
        self._eventEmitter.iee.on("evt_internal_signinrequired", async() => {
            await self.signin(true, undefined);
        });
        self._eventEmitter.iee.on("rainbow_application_token_updated", function (token) {
            self._rest.applicationToken = token;
        });

        self._eventEmitter.iee.on("evt_internal_xmppfatalerror", async (err) => {
            console.log("Error XMPP, Stop le SDK : ", err);
            await self._stateManager.transitTo(self._stateManager.ERROR, err);
            await self.stop().then(function(result) {
                //let success = ErrorManager.getErrorManager().OK;
            }).catch(function(err) {
                let error = ErrorManager.getErrorManager().ERROR;
                error.msg = err;
                self.events.publish("stopped", error);
            });
        });

        self._eventEmitter.iee.on("rainbow_xmppreconnected", function () {
            let that = self;
            //todo, check that REST part is ok too
            self._rest.reconnect().then((data) => {
                self.logger.log("info", LOG_ID + " (rainbow_xmppreconnected) reconnect succeed : so change state to connected");
                self.logger.log("internal", LOG_ID + " (rainbow_xmppreconnected) reconnect succeed : ", data, " so change state to connected");
                return self._stateManager.transitTo(self._stateManager.CONNECTED).then((data2) => {
                    self.logger.log("info", LOG_ID + " (rainbow_xmppreconnected) transition to connected succeed.");
                    self.logger.log("internal", LOG_ID + " (rainbow_xmppreconnected) transition to connected succeed : ", data2);
                    return self._retrieveInformation();
                });
            }).then((data3) => {
                self.logger.log("info", LOG_ID + " (rainbow_xmppreconnected) _retrieveInformation succeed, change state to ready");
                self.logger.log("internal", LOG_ID + " (rainbow_xmppreconnected) _retrieveInformation succeed : ", data3,  " change state to ready");
                self._stateManager.transitTo(self._stateManager.READY).then((data4) => {
                    self.logger.log("info", LOG_ID + " (rainbow_xmppreconnected) transition to ready succeed.");
                    self.logger.log("internal", LOG_ID + " (rainbow_xmppreconnected) transition to ready succeed : ", data4);
                });
            }).catch(async (err) => {
                // If not already connected, it is an error in xmpp connection, so should failed
                if (!self._stateManager.isCONNECTED()) {
                    self.logger.log("error", LOG_ID + " (rainbow_xmppreconnected) REST connection ", self._stateManager.FAILED);
                    self.logger.log("internalerror", LOG_ID + " (rainbow_xmppreconnected) REST connection ", self._stateManager.FAILED, ", ErrorManager : ", err);
                    await self._stateManager.transitTo(self._stateManager.FAILED);
                } else {
                    self.logger.log("warn", LOG_ID + " (rainbow_xmppreconnected) REST reconnection Error, set state : ", self._stateManager.DISCONNECTED);
                    self.logger.log("internalerror", LOG_ID + " (rainbow_xmppreconnected) REST reconnection ErrorManager : ", err, ", set state : ", self._stateManager.DISCONNECTED);
                    // ErrorManager in REST micro service, so let say it is disconnected
                    await self._stateManager.transitTo(self._stateManager.DISCONNECTED);
                    // relaunch the REST connection.
                    self._eventEmitter.iee.emit("rainbow_xmppreconnected");
                }
            });
        });

        self._eventEmitter.iee.on("rainbow_xmppreconnectingattempt", async function () {
            await self._stateManager.transitTo(self._stateManager.RECONNECTING);
        });

        self._eventEmitter.iee.on("rainbow_xmppdisconnect", async function (xmppDisconnectInfos) {
            if (xmppDisconnectInfos && xmppDisconnectInfos.reconnect) {
                self.logger.log("info", LOG_ID + " (rainbow_xmppdisconnect) set to state : ", self._stateManager.DISCONNECTED);
                await self._stateManager.transitTo(self._stateManager.DISCONNECTED);
            }  else {
                self.logger.log("info", LOG_ID + " (rainbow_xmppdisconnect) set to state : ", self._stateManager.STOPPED);
                await self._stateManager.transitTo(self._stateManager.STOPPED);
            }
        });

        self._eventEmitter.iee.on("rainbow_tokenrenewed", self.onTokenRenewed.bind(self));
        self._eventEmitter.iee.on("rainbow_tokenexpired", self.onTokenExpired.bind(self));

        if (self.options.useXMPP) {
            self.logger.log("info", LOG_ID + "(constructor) used in XMPP mode");
        }
        else {
            if (self.options.useCLIMode) {
                self.logger.log("info", LOG_ID + "(constructor) used in CLI mode");
            }
            else {
                self.logger.log("info", LOG_ID + "(constructor) used in HOOK mode");
            }
        }

        // Instantiate basic service
        self._proxy = new ProxyImpl(self.options.proxyOptions, self.logger);
        self._http = new HTTPService(self.options.httpOptions, self.logger, self._proxy, self._eventEmitter.iee);
        self._rest = new RESTService(self.options.credentials, self.options.applicationOptions, self.options._isOfficialRainbow(), self._eventEmitter.iee, self.logger);
        self._xmpp = new XMPPService(self.options.xmppOptions, self.options.imOptions, self.options.applicationOptions, self._eventEmitter.iee, self.logger, self._proxy);
        self._s2s = new S2SService(self.options.s2sOptions, self.options.imOptions, self.options.applicationOptions, self._eventEmitter.iee, self.logger, self._proxy,self.options.servicesToStart.s2s);

        // Instantiate State Manager
        self._stateManager = new StateManager(self._eventEmitter, self.logger);

        // Instantiate others Services
        self._im = new IMService(self._eventEmitter.iee, self.logger, self.options.imOptions, self.options.servicesToStart.im);
        self._presence = new PresenceService(self._eventEmitter.iee, self.logger, self.options.servicesToStart.presence);
        self._channels = new ChannelsService(self._eventEmitter.iee, self.logger, self.options.servicesToStart.channels);
        self._contacts = new ContactsService(self._eventEmitter.iee, self.options.httpOptions, self.logger, self.options.servicesToStart.contacts);
        self._conversations = new ConversationsService(self._eventEmitter.iee, self.logger, self.options.servicesToStart.conversations, self.options.imOptions.conversationsRetrievedFormat, self.options.imOptions.nbMaxConversations);
        self._profiles = new ProfilesService(self._eventEmitter.iee, self.logger, self.options.servicesToStart.profiles);
        self._telephony = new TelephonyService(self._eventEmitter.iee, self.logger, self.options.servicesToStart.telephony);
        self._bubbles = new BubblesService(self._eventEmitter.iee, self.options.httpOptions,self.logger, self.options.servicesToStart.bubbles);
        self._groups = new GroupsService(self._eventEmitter.iee, self.logger, self.options.servicesToStart.groups);
        self._admin = new AdminService(self._eventEmitter.iee, self.logger, self.options.servicesToStart.admin);
        self._settings = new SettingsService(self._eventEmitter.iee, self.logger, self.options.servicesToStart.settings);
        self._fileServer = new FileServerService(self._eventEmitter.iee, self.logger, self.options.servicesToStart.fileServer);
        self._fileStorage = new FileStorageService(self._eventEmitter.iee, self.logger, self.options.servicesToStart.fileStorage);
        self._calllog = new CallLogService(self._eventEmitter.iee, self.logger, self.options.servicesToStart.calllog);
        self._favorites = new FavoritesService(self._eventEmitter.iee,self.logger, self.options.servicesToStart.favorites);
        self._invitations = new InvitationsService(self._eventEmitter.iee,self.logger, self.options.servicesToStart.invitation);

        self._botsjid = [];

        self.logger.log("debug", LOG_ID + "(constructor) _exiting_");
    }

    start(token) {
        let that = this;

        this.logger.log("debug", LOG_ID + "(start) _entering_");
        this.logger.log("info", LOG_ID + "(start) STARTING the SDK : ", packageVersion.version);

        return new Promise(function (resolve, reject) {

            try {

                if (!that.options.hasCredentials && !token) {
                    that.logger.log("error", LOG_ID + "(start) No credentials. Stop loading...");
                    that.logger.log("debug", LOG_ID + "(start) _exiting_");
                    reject("Credentials are missing. Check your configuration!");
                } else {
                    that.logger.log("debug", LOG_ID + "(start) start all modules");
                    that.logger.log("internal", LOG_ID + "(start) start all modules for user : ", that.options.credentials.login);
                    that.logger.log("internal", LOG_ID + "(start) servicesToStart : ", that.options.servicesToStart);
                    return that._stateManager.start().then(() => {
                        return that._http.start();
                    }).then(() => {
                        return that._rest.start(that._http);
                    }).then(() => {
                        return that._xmpp.start(that.options.useXMPP);
                    }).then(() => {
                        return that._s2s.start(that.options, that);
                    }).then(() => {
                        return that._settings.start(that.options, that);
                    }).then(() => {
                        return that._presence.start(that.options,that) ;
                    }).then(() => {
                        return  that._contacts.start(that.options, that ) ;
                    }).then(() => {
                       return that._bubbles.start(that.options, that) ;
                    }).then(() => {
                        return that._conversations.start(that.options, that) ;
                    }).then(() => {
                        return that._profiles.start(that.options, that, []) ;
                    }).then(() => {
                        return that._telephony.start(that.options, that) ;
                    }).then(() => {
                        return that._im.start(that.options, that) ;
                    }).then(() => {
                        return that._channels.start(that.options, that) ;
                    }).then(() => {
                        return that._groups.start(that.options, that) ;
                    }).then(() => {
                        return that._admin.start(that.options,that) ;
                    }).then(() => {
                        return that._fileServer.start(that.options, that) ;
                    }).then(() => {
                        return that._fileStorage.start(that.options, that) ;
                    }).then(() => {
                        return that._calllog.start(that.options, that) ;
                    }).then(() => {
                        return that._favorites.start(that.options, that) ;
                    }).then(() => {
                        return that._invitations.start(that.options, that, []) ;
                    }).then(() => {
                        that.logger.log("debug", LOG_ID + "(start) all modules started successfully");
                        that._stateManager.transitTo(that._stateManager.STARTED).then(() => {
                            that.logger.log("debug", LOG_ID + "(start) _exiting_");
                            resolve();
                        }).catch((err) => {
                            reject(err);
                        });
                    }).catch((err) => {
                        that.logger.log("error", LOG_ID + "(start) !!! CATCH Error during bulding services instances.");
                        that.logger.log("internalerror", LOG_ID + "(start) !!! CATCH Error during bulding services instances : ", err);
                        that.logger.log("debug", LOG_ID + "(start) _exiting_");
                        reject(err);
                    });
                }

            } catch (err) {
                that.logger.log("error", LOG_ID + "(start)");
                that.logger.log("internalerror", LOG_ID + "(start)", err.message);
                that.logger.log("debug", LOG_ID + "(start) _exiting_");
                reject(err);
            }
        });
    }

    signin(forceStopXMPP, token) {

        let that = this;
        return new Promise(function (resolve, reject) {

            let json = null;

            return that._signin(forceStopXMPP, token).then(function (_json) {
                json = _json;
                that._tokenSurvey();
                return that._stateManager.transitTo(that._stateManager.CONNECTED).then(() => {
                    return that._retrieveInformation();
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
        let that = this;
        this.logger.log("debug", LOG_ID + "(stop) _entering_");

        return new Promise(function (resolve, reject) {

            if (that._stateManager.isSTOPPED()) {
                return resolve ("core already stopped !");
            }

            that.logger.log("debug", LOG_ID + "(stop) stop all modules");

            that._s2s.stop().then(() => {
                return that._rest.stop();
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
                return that._invitations.stop();
            }).then(() => {
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
                resolve("core stopped");
            }).catch((err) => {
                that.logger.log("error", LOG_ID + "(stop) CATCH Error !!! ");
                that.logger.log("internalerror", LOG_ID + "(stop) CATCH Error !!! : ", err);
                that.logger.log("debug", LOG_ID + "(stop) _exiting_");
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

    get profiles() {
        return this._profiles;
    }

    get im() {
        return this._im;
    }

    get invitations() {
        return this._invitations;
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

//module.exports = Core;
module.exports.Core = Core;
export {Core};
