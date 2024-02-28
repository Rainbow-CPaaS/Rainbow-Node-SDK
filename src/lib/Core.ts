"use strict";
import {getRandomInt, logEntryExit, pause, resolveDns, setTimeoutPromised, stackTrace, until} from "./common/Utils";
import {XMPPService} from "./connection/XMPPService";
import {RESTService} from "./connection/RESTService";
import {HTTPService} from "./connection/HttpService";
import {Logger} from "./common/Logger";
import {ImsService} from "./services/ImsService";
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
import {SDKSTATUSENUM, StateManager} from "./common/StateManager";
import {CallLogService} from "./services/CallLogService";
import {FavoritesService} from "./services/FavoritesService";
import {InvitationsService} from "./services/InvitationsService";
import {Events} from "./common/Events";
import {Options} from "./config/Options";
import {ProxyImpl} from "./ProxyImpl";
import {ErrorManager} from "./common/ErrorManager";
import {AlertsService} from "./services/AlertsService";

import {lt} from "semver";
import {S2SService} from "./services/S2SService";
import {WebinarsService} from "./services/WebinarsService";
import {RBVoiceService} from "./services/RBVoiceService";
import {HTTPoverXMPP} from "./services/HTTPoverXMPPService";
import {TimeOutManager} from "./common/TimeOutManager";

export {};

const packageVersion = require("../package.json");
import * as Utils from "./common/Utils"
import {RPCoverXMPPService} from "./services/RPCoverXMPPService.js";
import {LevelLogs} from "./common/LevelLogs.js";
import { TasksService } from "./services/TasksService";

/*let _signin;
let _retrieveInformation;
// */

const LOG_ID = "CORE - ";

enum SIGNINMETHODNAME {
    "SIGNIN" = "signin",
    "SIGNINWSONLY" = "signinWSOnly"
}

@logEntryExit(LOG_ID)
class Core extends LevelLogs{

    get timeOutManager(): TimeOutManager {
        return this._timeOutManager;
    }

    set timeOutManager(value: TimeOutManager) {
        this._timeOutManager = value;
    }
	public _logger: any;
	public _rest: RESTService;
	public _eventEmitter: Events;
	public options: any;
	public _proxy: ProxyImpl;
	public _http: HTTPService;
	public _xmpp: XMPPService;
	public _stateManager: StateManager;
	public _im: ImsService;
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
    public _alerts: AlertsService;
    public _webinars: WebinarsService;
    public _rbvoice: RBVoiceService;
    public _invitations: InvitationsService;
    public _tasks: TasksService;
    public _httpoverxmpp: HTTPoverXMPP;
    public _rpcoverxmpp: RPCoverXMPPService;
	public _botsjid: any;
    public _s2s: S2SService;
    public _Utils: any;
    cleanningClassIntervalID: NodeJS.Timeout;
    private _timeOutManager : TimeOutManager;
    private _signinmethodName : SIGNINMETHODNAME;
    private lastConnectedOptions : {token : string, userInfos : any};
    public startDate : Date;

    static getClassName(){ return 'Core'; }
    getClassName(){ return Core.getClassName(); }

    static getAccessorName(){ return 'core'; }
    getAccessorName(){ return Core.getAccessorName(); }

    constructor(options) {
        super();
        this.setLogLevels(this);
        let self = this;
        
        // Initialize the logger
        let loggerModule = new Logger(options);
        self._logger = loggerModule.log;

        self._Utils = Utils;

        // init property
        self.lastConnectedOptions = {token:undefined, userInfos: {}};

        // Initialize the Events Emitter
        self._eventEmitter = new Events(self._logger, (jid) => {
            return self._botsjid.includes(jid);
        });
        self._eventEmitter.setCore(self);

        loggerModule.logEventEmitter = self._eventEmitter.logEmitter;

        self._timeOutManager = new TimeOutManager(self._logger);
        //{"callerObj" : this, "level" : "debug"};
        self._logger.log(self.INFO, LOG_ID + "(constructor) _entering_");
        self._logger.log(self.INFO, LOG_ID + "(constructor) ------- SDK INFORMATION -------");

        self._logger.log(self.INFO, LOG_ID + " (constructor) SDK version: " + packageVersion.version);
        self._logger.log(self.INFO, LOG_ID + " (constructor) Node version: " + process.version);
        for (let key in process.versions) {
            self._logger.log(self.INFO, LOG_ID + " (constructor) " + key + " version: " + process.versions[key]);
        }
        self._logger.log(self.DEBUG, LOG_ID + "(constructor) ------- SDK INFORMATION -------");

        // Initialize the options

        self.options = new Options(options, self._logger);
        self.options.parse();

        self._logger.log(self.INTERNAL, LOG_ID + "(constructor) options : ", self.options);

        self._eventEmitter.iee.on("evt_internal_signinrequired", async() => {
            let that = this;
            let error = ErrorManager.getErrorManager().ERROR;
            self._logger.log(self.INFO, LOG_ID + " (evt_internal_signinrequired) Stop, start and signin  the SDK. This log is not printed if the SDK is already stopped!");
            await self.stop().then(function(result) {
            }).catch(async function(err) {
                error.msg = err;
                //await self._stateManager.transitTo(true, self._stateManager.STOPPED, error);
                //self.events.publish("stopped", error);
            });
            await self._stateManager.transitTo(true, self._stateManager.STOPPED, error);

            self._logger.log(self.INFO, LOG_ID + " (evt_internal_signinrequired) pause before continue the reconnection !");
            await pause(20000);
            self._logger.log(self.INFO, LOG_ID + " (evt_internal_signinrequired) pause done, so continue the reconnection !");

            if (that._signinmethodName == SIGNINMETHODNAME.SIGNIN ) {
                await self.start(that.lastConnectedOptions.token).then(async function () {
                    return await self.signin(true, that.lastConnectedOptions.token);
                }).catch((err2) => {
                    self._logger.log(self.ERROR, LOG_ID + " (evt_internal_signinrequired) start/signin failed : ", err2);
                    setTimeout(() => {
                        self._eventEmitter.iee.emit("evt_internal_signinrequired");
                    }, 10000 + getRandomInt(40000));
                });
            } 
            if (that._signinmethodName == SIGNINMETHODNAME.SIGNINWSONLY ) {
                await self.start(that.lastConnectedOptions.token).then(async function () {
                    return await self._signinWSOnly(true, that.lastConnectedOptions.token, that.lastConnectedOptions.userInfos);
                }).catch((err2) => {
                    self._logger.log(self.ERROR, LOG_ID + " (evt_internal_signinrequired) start/signin failed : ", err2);
                    setTimeout(() => {
                        self._eventEmitter.iee.emit("evt_internal_signinrequired");
                    }, 10000 + getRandomInt(40000));
                });
            } 
        });

        self._eventEmitter.iee.on("rainbow_application_token_updated", function (token) {
            self._rest.applicationToken = token;
        });

        self._eventEmitter.iee.on("evt_internal_xmppfatalerror", async (err) => {
            console.log("Error XMPP, Stop the SDK : ", err);
            self._logger.log(self.ERROR, LOG_ID + " (evt_internal_xmppfatalerror) Error XMPP, Stop the SDK : ", err);
            await self.stop().then(function(result) {
                //let success = ErrorManager.getErrorManager().OK;
            }).catch(async function(err) {
                let error = ErrorManager.getErrorManager().ERROR;
                error.msg = err;
                await self._stateManager.transitTo(true, self._stateManager.STOPPED, error);
                //self.events.publish("stopped", error);
            });
            if (! self.options.autoReconnectIgnoreErrors) {
                await self._stateManager.transitTo(true, self._stateManager.ERROR, err); // set state to error, and send rainbow_onerror
            } else {
                self._eventEmitter.iee.emit("evt_internal_signinrequired");
            }
        });

        self._eventEmitter.iee.on("rainbow_xmppreconnected", function () {
            let that = self;
            self._logger.log(self.INFO, LOG_ID + " (rainbow_xmppreconnected) received, so start reconnect from RESTService.");
            self._rest.reconnect().then((data) => {
                self._logger.log(self.INFO, LOG_ID + " (rainbow_xmppreconnected) reconnect succeed : so change state to connected");
                self._logger.log(self.INTERNAL, LOG_ID + " (rainbow_xmppreconnected) reconnect succeed : ", data, " so change state to connected");
                return self._stateManager.transitTo(true, self._stateManager.CONNECTED).then(async (data2) => {
                    self._logger.log(self.INFO, LOG_ID + " (rainbow_xmppreconnected) transition to connected succeed.");
                    self._logger.log(self.INTERNAL, LOG_ID + " (rainbow_xmppreconnected) transition to connected succeed : ", data2);
                    await that._bubbles.reset() ;
                    return self._retrieveInformation();
                });
            }).then((data3) => {
                self._logger.log(self.INFO, LOG_ID + " (rainbow_xmppreconnected) _retrieveInformation succeed, change state to ready");
                self._logger.log(self.INTERNAL, LOG_ID + " (rainbow_xmppreconnected) _retrieveInformation succeed : ", data3,  " change state to ready");
                self._stateManager.transitTo(true, self._stateManager.READY).then((data4) => {
                    self._logger.log(self.INFO, LOG_ID + " (rainbow_xmppreconnected) transition to ready succeed.");
                    self._logger.log(self.INTERNAL, LOG_ID + " (rainbow_xmppreconnected) transition to ready succeed : ", data4);
                });
            }).catch(async (err) => {
                // If not already connected, it is an error in xmpp connection, so should failed
                if (!self._stateManager.isCONNECTED() && !self._stateManager.isRECONNECTING()) {
                    self._logger.log(self.ERROR, LOG_ID + " (rainbow_xmppreconnected) REST connection ", self._stateManager.FAILED);
                    self._logger.log(self.INTERNALERROR, LOG_ID + " (rainbow_xmppreconnected) REST connection ", self._stateManager.FAILED, ", ErrorManager : ", err);
                    await self.stop().then(function(result) {
                    }).catch(function(err) {
                    });
                    if (! self.options.autoReconnectIgnoreErrors) {
                        await self._stateManager.transitTo(true, self._stateManager.FAILED);
                    } else {
                        self._eventEmitter.iee.emit("evt_internal_signinrequired");
                    }
                } else {
                    if (err && err.errorname == "reconnectingInProgress") {
                        self._logger.log(self.WARN, LOG_ID + " (rainbow_xmppreconnected) REST reconnection already in progress ignore error : ", err);
                    } else {
                        self._logger.log(self.WARN, LOG_ID + " (rainbow_xmppreconnected) REST reconnection Error, set state : ", self._stateManager.DISCONNECTED);
                        self._logger.log(self.INTERNALERROR, LOG_ID + " (rainbow_xmppreconnected) REST reconnection ErrorManager : ", err, ", set state : ", self._stateManager.DISCONNECTED);
                        // ErrorManager in REST micro service, so let say it is disconnected
                        await self._stateManager.transitTo(true, self._stateManager.DISCONNECTED);
                        // relaunch the REST connection.
                        self._eventEmitter.iee.emit("rainbow_xmppreconnected");
                    }
                }
            });
        });

        self._eventEmitter.iee.on("rainbow_xmppreconnectingattempt", async function () {
            await self._stateManager.transitTo(true, self._stateManager.RECONNECTING);
        });

        self._eventEmitter.iee.on("rainbow_xmppdisconnect", async function (xmppDisconnectInfos) {
            if (xmppDisconnectInfos && xmppDisconnectInfos.reconnect) {
                self._logger.log(self.INFO, LOG_ID + " (rainbow_xmppdisconnect) set to state : ", self._stateManager.DISCONNECTED);
                await self._stateManager.transitTo(true, self._stateManager.DISCONNECTED);
            }  else {
                self._logger.log(self.INFO, LOG_ID + " (rainbow_xmppdisconnect) set to state : ", self._stateManager.STOPPED);
                if (! self.options.autoReconnectIgnoreErrors) {
            //        await self._stateManager.transitTo(true, self._stateManager.STOPPED);
                } else {
                    self._eventEmitter.iee.emit("evt_internal_signinrequired");
                }
            }
        });

        self._eventEmitter.iee.on("evt_internal_tokenrenewed", self.onTokenRenewed.bind(self));
        self._eventEmitter.iee.on("evt_internal_tokenexpired", self.onTokenExpired.bind(self));

        if (self.options.useXMPP) {
            self._logger.log(self.INFO, LOG_ID + "(constructor) used in XMPP mode");
        }
        else {
            if (self.options.useCLIMode) {
                self._logger.log(self.INFO, LOG_ID + "(constructor) used in CLI mode");
            }
            else {
                self._logger.log(self.INFO, LOG_ID + "(constructor) used in HOOK mode");
            }
        }

        // Instantiate basic service
        self._proxy = new ProxyImpl(self.options.proxyOptions, self._logger);
        self._http = new HTTPService(self, self.options, self._logger, self._proxy, self._eventEmitter.iee);
        self._rest = new RESTService(self, self.options, self._eventEmitter.iee, self._logger);
        self._xmpp = new XMPPService(self, self.options.xmppOptions, self.options.imOptions, self.options.applicationOptions, self._eventEmitter.iee, self._logger, self._proxy, self._rest, self.options);
        self._s2s = new S2SService(self, self.options.s2sOptions, self.options.imOptions, self.options.applicationOptions, self._eventEmitter.iee, self._logger, self._proxy,self.options.servicesToStart.s2s);

        // Instantiate State Manager
        self._stateManager = new StateManager(self._eventEmitter, self._logger, this._timeOutManager );

        // Instantiate others Services
        self._im = new ImsService(self, self._eventEmitter.iee, self._logger, self.options.imOptions, self.options.servicesToStart.im);
        self._presence = new PresenceService(self, self._eventEmitter.iee, self._logger, self.options.servicesToStart.presence);
        self._channels = new ChannelsService(self, self._eventEmitter.iee, self._logger, self.options.servicesToStart.channels);
        self._contacts = new ContactsService(self, self._eventEmitter.iee, self.options.httpOptions, self._logger, self.options.servicesToStart.contacts);
        self._conversations = new ConversationsService(self, self._eventEmitter.iee, self._logger, self.options.servicesToStart.conversations, self.options.imOptions.conversationsRetrievedFormat, self.options.imOptions.nbMaxConversations, self.options.imOptions.autoLoadConversations, self.options.imOptions.autoLoadConversationHistory);
        self._profiles = new ProfilesService(self, self._eventEmitter.iee, self._logger, self.options.servicesToStart.profiles);
        self._telephony = new TelephonyService(self, self._eventEmitter.iee, self._logger, self.options.servicesToStart.telephony);
        self._bubbles = new BubblesService(self, self._eventEmitter.iee, self.options.httpOptions,self._logger, self.options.servicesToStart.bubbles);
        self._groups = new GroupsService(self, self._eventEmitter.iee, self._logger, self.options.servicesToStart.groups);
        self._admin = new AdminService(self, self._eventEmitter.iee, self._logger, self.options.servicesToStart.admin);
        self._settings = new SettingsService(self, self._eventEmitter.iee, self._logger, self.options.servicesToStart.settings);
        self._fileServer = new FileServerService(self, self._eventEmitter.iee, self._logger, self.options.servicesToStart.fileServer);
        self._fileStorage = new FileStorageService(self, self._eventEmitter.iee, self._logger, self.options.servicesToStart.fileStorage);
        self._calllog = new CallLogService(self, self._eventEmitter.iee, self._logger, self.options.servicesToStart.calllog);
        self._favorites = new FavoritesService(self, self._eventEmitter.iee,self._logger, self.options.servicesToStart.favorites);
        self._alerts = new AlertsService(self, self._eventEmitter.iee,self._logger, self.options.servicesToStart.alerts);
        self._rbvoice = new RBVoiceService(self, self._eventEmitter.iee, self.options.httpOptions, self._logger, self.options.servicesToStart.rbvoice);
        self._httpoverxmpp = new HTTPoverXMPP(self, self._eventEmitter.iee, self.options.httpOptions, self._logger, self.options.servicesToStart.httpoverxmpp);
        self._rpcoverxmpp = new RPCoverXMPPService(self, self._eventEmitter.iee, self.options.httpOptions, self._logger, self.options.servicesToStart.rpcoverxmpp);
        self._webinars = new WebinarsService(self, self._eventEmitter.iee, self.options.httpOptions, self._logger, self.options.servicesToStart.webinar);
        self._invitations = new InvitationsService(self, self._eventEmitter.iee,self._logger, self.options.servicesToStart.invitation);
        self._tasks = new TasksService(self, self._eventEmitter.iee, self._logger, self.options.servicesToStart.tasks);

        self._botsjid = [];

        self.startCleanningInterval();

        self._logger.log(self.INFO, LOG_ID + `=== CONSTRUCTED at (${new Date()} ===`);
        //self._logger.log(self.DEBUG, LOG_ID + "(constructor) _exiting_");
    }

    getDurationSinceStart(label:string) {
        let that = this;
        let sinceCreateDuration =  Math.round((new Date()).getTime() - that.startDate?.getTime());
        that._logger.log(that.INFO, LOG_ID + `=== ${label} - SINCE CREATION (${sinceCreateDuration} ms) ===`);
        return sinceCreateDuration;
    }

    _signin (forceStopXMPP, token) {
        let that = this;
        that._logger.log(that.DEBUG, LOG_ID + "(signin) _entering_");

        let json = null;

        return new Promise(async function (resolve, reject) {

            if (that.options.useXMPP) {
                let loginSucceed = false;

                while (loginSucceed == false) {
                    let loginResult = undefined;
                    await that._xmpp.stop(forceStopXMPP).then(() => {
                        return that._rest.signin(token);
                    }).then((_json) => {
                        json = _json;
                        let headers = {
                            "headers": {
                                // "Authorization": "Bearer " + that._rest.token,
                                "x-rainbow-client": "sdk_node",
                                "x-rainbow-client-version": packageVersion.version,
                                "x-rainbow-client-id": that._rest.application?that._rest.application.appID:""
                                // "Accept": accept || "application/json",
                            }
                        };
                        return that._xmpp.signin(that._rest.loggedInUser, headers);
                    }).then(function () {
                        that._logger.log(that.DEBUG, LOG_ID + "(signin) signed in successfully");
                        that._logger.log(that.DEBUG, LOG_ID + "(signin) _exiting_");
                        //return resolve(json);
                        loginResult = json;
                        loginSucceed = true;
                    }).catch(function (err) {
                        that._logger.log(that.ERROR, LOG_ID + "(signin) can't signed-in.");
                        that._logger.log(that.INTERNALERROR, LOG_ID + "(signin) can't signed-in", err);
                        that._logger.log(that.DEBUG, LOG_ID + "(signin) _exiting_");
                        //return reject(err);
                        loginSucceed = false;
                        loginResult = err;
                    });
                    if (loginSucceed) {
                        resolve(loginResult);
                    } else {
                        if (loginResult.code > 400) {
                            return reject(loginResult)
                        }  else {
                            await pause(10000);
                        }
                    }
                }
            } else if (that.options.useS2S) {
                return that._rest.signin(token).then(async (_json) => {
                    json = _json;
                    let headers = {
                        "headers": {
                            "Authorization": "Bearer " + that._rest.token,
                            "x-rainbow-client": "sdk_node",
                            "x-rainbow-client-version": packageVersion.version,
                            "x-rainbow-client-id": that._rest.application?that._rest.application.appID:""
                            // "Accept": accept || "application/json",
                        }
                    };

                    return that._s2s.signin(that._rest.loggedInUser, headers);
                }).then(function () {
                    that._logger.log(that.DEBUG, LOG_ID + "(signin) signed in successfully");
                    that._logger.log(that.DEBUG, LOG_ID + "(signin) _exiting_");
                    return resolve(json);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID + "(signin) can't signed-in.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(signin) can't signed-in", err);
                    that._logger.log(that.DEBUG, LOG_ID + "(signin) _exiting_");
                    return reject(err);
                });
            } else {
                that._rest.signin(token).then((_json) => {
                    json = _json;
                    let headers = {
                        "headers": {
                            "Authorization": "Bearer " + that._rest.token,
                            "x-rainbow-client": "sdk_node",
                            "x-rainbow-client-version": packageVersion.version,
                            "x-rainbow-client-id": that._rest.application?that._rest.application.appID:""
                            // "Accept": accept || "application/json",
                        }
                    };
                    that._logger.log(that.DEBUG, LOG_ID + "(signin) signed in successfully");
                    that._logger.log(that.DEBUG, LOG_ID + "(signin) _exiting_");
                    return resolve(json);
                }).catch((err)=> {
                    that._logger.log(that.DEBUG, LOG_ID + "(signin) signed failed : ", err);
                    that._logger.log(that.DEBUG, LOG_ID + "(signin) _exiting_");
                    return reject(err);
                });
            }
        });
    };

    _signinWSOnly (forceStopXMPP, token, userInfos) {
        let that = this;
        that._logger.log(that.DEBUG, LOG_ID + "(_signinWSOnly) _entering_");

        let json = null;

        return new Promise(function (resolve, reject) {

            if (that.options.useXMPP) {
                return that._xmpp.stop(forceStopXMPP).then(() => {
                    that._rest.account = userInfos;
                    if (token) {
                        return that._rest.signin(token);
                    } else {
                        return Promise.resolve();
                    }
                }).then((_json) => {
                    json = _json;
                    let headers = {
                        "headers": {
                            // "Authorization": "Bearer " + that._rest.token,
                            "x-rainbow-client": "sdk_node",
                            "x-rainbow-client-version": packageVersion.version,
                            "x-rainbow-client-id": that._rest.application?that._rest.application.appID:""
                            // "Accept": accept || "application/json",
                        }
                    };
                    return that._xmpp.signin(userInfos, headers);
                }).then(function () {
                    that._logger.log(that.DEBUG, LOG_ID + "(_signinWSOnly) signed in successfully");
                    that._logger.log(that.DEBUG, LOG_ID + "(_signinWSOnly) _exiting_");
                    return resolve(json);
                }).catch(function (err) {
                    that._logger.log(that.ERROR, LOG_ID + "(_signinWSOnly) can't signed-in.");
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(signin) can't signed-in", err);
                    that._logger.log(that.DEBUG, LOG_ID + "(_signinWSOnly) _exiting_");
                    return reject(err);
                });
            } else {
                return reject({"error":"Error, can not login WS Only without useXMPP option setted to true."});
            }
        });
    };

    _retrieveInformation () {
        let that = this;
        that._logger.log(that.DEBUG, LOG_ID + "(_retrieveInformation). " + `(${that.getDurationSinceStart("_retrieveInformation")} ms)`);
        //that._logger.log(that.INTERNAL, LOG_ID + "(_retrieveInformation) options : ", that.options);
        return new Promise(async (resolve, reject) => {

            if (that.options.testOutdatedVersion) {
                await that._rest.getRainbowNodeSdkPackagePublishedInfos().then((infos: any) => {
                    // self._logger.log(self.INTERNAL, LOG_ID +  "(getRainbowNodeSdkPackagePublishedInfos) infos : ", infos);
                    infos.results.forEach((packagePublished: any) => {
                        if (packagePublished.package.name === packageVersion.name) {
                            //if (packagePublished.package.version !== packageVersion.version) {
                            if (lt(packageVersion.version, packagePublished.package.version)) {
                                that._logger.log(that.ERROR, LOG_ID + "(getRainbowNodeSdkPackagePublishedInfos)  \n " +
                                        "*******************************************************\n\n", that._logger.colors.red.underline("WARNING : "), that._logger.colors.italic("\n  curent rainbow-node-sdk version : " + packageVersion.version + " is OLDER than the latest available one on npmjs.com : " + packagePublished.package.version + "\n  please update it (npm install rainbow-node-sdk@latest) and use the CHANGELOG to consider the changes."), "\n\n*******************************************************");
                                let error = {
                                    "label": "curent rainbow-node-sdk version : " + packageVersion.version + " is OLDER than the latest available one on npmjs.com : " + packagePublished.package.version + " please update it (npm install rainbow-node-sdk@latest) and use the CHANGELOG to consider the changes.",
                                    "currentPackage": packageVersion.version,
                                    "latestPublishedPackage": packagePublished.package.version
                                };
                                that._eventEmitter.iee.emit("evt_internal_onrainbowversionwarning", error);

                                //self.events.publish("rainbowversionwarning", error);
                            } else {
                                that._logger.log(that.INFO, LOG_ID + "(_retrieveInformation) using the last published version of the SDK.");
                            }
                        }
                    });
                }).catch((error) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(_retrieveInformation) getRainbowNodeSdkPackagePublishedInfos error : ", error);
                    // self._logger.log(self.INTERNALERROR, LOG_ID +  "(getRainbowNodeSdkPackagePublishedInfos) error : ", error);
                });
            }

            if (that.options.testDNSentry) {
                let findingDns = true;
                let resolvedHostnames: any = [];
                let dnsFound = false;

                async function fn_resolveDns() {
                    while (findingDns) {
                        try {
                            resolvedHostnames = await resolveDns(that._http.host);
                            that._logger.log(that.DEBUG, "(_retrieveInformation), resolveDns result : ", resolvedHostnames);
                            if ((Array.isArray(resolvedHostnames)) && (resolvedHostnames.length > 0)) {
                                findingDns = false;
                                dnsFound = true;
                            } else {
                                that._logger.log(that.DEBUG, "(_retrieveInformation), resolveDns DNS entry not found for HOST : ", that._http.host," continue to search.");
                                //if ((resolvedHostnames == undefined) || (resolvedHostnames.length == 0) ) {
                                await setTimeoutPromised(3000);
                            }
                        } catch (err) {
                            that._logger.log(that.ERROR, "(_retrieveInformation), failed to resolveDns : ", that._http.host, ", error : ", err);
                        }
                    }
                }

                setTimeout(fn_resolveDns, 100);
                await until(() => {
                    // Test if resolvedHostnames is undefined and if the Array is filled (so the dns entry was found)
                    let result = dnsFound;
                    result ?
                            that._logger.log(that.DEBUG, "(_retrieveInformation), resolvedHostnames found, so stop the search."):
                            that._logger.log(that.WARN, "(_retrieveInformation), resolvedHostnames not found, continue search");


                    return result
                }, "Waiting for DNS resolve the hostname : " + that._http.host, 5*60000).catch((err)=> {
                    that._logger.log(that.WARN, "(_retrieveInformation), resolvedHostnames FAILED for , ", that._http.host, " error : ", err, ", so continue initialize the SDK, but it will probably failed.");
                });

                findingDns = false;

                if (dnsFound) {
                    that._logger.log(that.INFO, "(_retrieveInformation), resolvedHostnames found, ", that._http.host, " : ", resolvedHostnames, ", so continue initialize the SDK.");
                } else {
                    that._logger.log(that.WARN, "(_retrieveInformation), " + that._http.host, " DNS entry not found, SDK will not work with full features.");
                }
            }

            that.getDurationSinceStart("_retrieveInformation after DNSEntry search ");

            if (that.options.useS2S) {
                try {
                    if (that.options.imOptions.autoLoadContacts) {
                        let result = await that._contacts.getRosters();
                    } else {
                        that._logger.log(that.INFO, LOG_ID + "(_retrieveInformation) load of getRosters IGNORED by config autoLoadContacts : ", that.options.imOptions.autoLoadContacts);
                    }
                } catch (e) {
                    that._logger.log(that.INFO, LOG_ID + "(_retrieveInformation) load of getRosters Failed : ", e);
                }
                return that._presence._sendPresenceFromConfiguration().then(() => {
                    return Promise.resolve(undefined)
                }).then(() => {
                    return that._s2s.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._profiles.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._contacts.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._telephony.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._fileStorage.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._fileServer.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    //return that.presence._sendPresenceFromConfiguration();                       
                }).then(() => {
                    return that._channels.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._admin.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._bubbles.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._channels.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._conversations.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._groups.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._presence.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._settings.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._tasks.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    //return that.presence.sendInitialPresence();
                    return Promise.resolve(undefined);
                }).then(() => {
                    //return that.im.enableCarbon();
                    return Promise.resolve(undefined);
                }).then(() => {
                    if (that.options._restOptions.useRestAtStartup) {
                        return that._rest.getBots();
                    }
                }).then((bots: any) => {
                    that._botsjid = bots ? bots.map((bot) => {
                        return bot.jid;
                    }):[];
                    return Promise.resolve(undefined);
                }).then(() => {
                    if (that.options.imOptions.autoLoadConversations && that.options._restOptions.useRestAtStartup) {
                        if (that.options.imOptions.autoLoadConversationHistory) {
                            return that._conversations.getServerConversations().then(() => {
                                that._conversations.loadEveryConversationsHistory()
                            });
                        } else {
                            return that._conversations.getServerConversations();
                        }
                    } else {
                        that._logger.log(that.INFO, LOG_ID + "(_retrieveInformation) load of getServerConversations IGNORED by config autoLoadConversations : ", that.options.imOptions.autoLoadConversations);
                        return;
                    }
                }).then(() => {
                    return that._calllog.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._favorites.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._alerts.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._rbvoice.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._webinars.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._httpoverxmpp.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._rpcoverxmpp.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._invitations.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    if (that.options._restOptions.useRestAtStartup) {
                        return that._s2s.listConnectionsS2S();
                    }
                }).then(() => {
                    resolve(undefined);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(_retrieveInformation) !!! CATCH  Error while initializing services. Error : ", err);
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(_retrieveInformation) !!! CATCH  Error while initializing services : ", err);
                    reject(err);
                });
                //return resolve(undefined);
            }

            if (that.options.useCLIMode) {
                return resolve(undefined);
            }

            if (that.options.useXMPP) {
                try {
                    if (that.options._restOptions.useRestAtStartup ) {
                        if (that.options.imOptions.autoLoadContacts) {
                            //let result = await that._contacts.getRosters();
                            await that._contacts.getRosters().then((result)=> {
                                that._logger.log(that.INFO, LOG_ID + "(_retrieveInformation) contacts from roster retrieved.");
                                that.getDurationSinceStart("_retrieveInformation after contacts from roster retrieved ");
                            });
                        } else {
                            that._logger.log(that.INFO, LOG_ID + "(_retrieveInformation) load of getRosters IGNORED by config autoLoadContacts : ", that.options.imOptions.autoLoadContacts);
                        }
                    } else {
                        that._logger.log(that.INFO, LOG_ID + "(_retrieveInformation) load of getRosters IGNORED because of useRestAtStartup : ", that.options._restOptions.useRestAtStartup);
                    }
                } catch (e) {
                    that._logger.log(that.INFO, LOG_ID + "(_retrieveInformation) load of getRosters Failed : ", e);
                }
                //return Utils.traceExecutionTime(that,"_sendPresenceFromConfiguration", that.presence._sendPresenceFromConfiguration).then(() => {
                return that._presence._sendPresenceFromConfiguration().then(() => {
                    return Promise.resolve(undefined)
                }).then(() => {
                    return that._s2s.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._profiles.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    //return Utils.traceExecutionTime(that,"_contacts.init", that._contacts.init, [that.options._restOptions.useRestAtStartup]);
                    return that._contacts.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._telephony.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._fileStorage.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._fileServer.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    //return that.presence._sendPresenceFromConfiguration();
                }).then(() => {
                    // return that._bubbles.getBubbles(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._channels.init(that.options._restOptions.useRestAtStartup);
                    //return that._channels.fetchMyChannels(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._admin.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._bubbles.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._conversations.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._groups.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._presence.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._settings.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._tasks.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    //return that.presence.sendInitialPresence();
                    return Promise.resolve(undefined);
                }).then(() => {
                    return that.im.init(that.options._imOptions.enableCarbon, that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    if (that.options._restOptions.useRestAtStartup) {
                        return that._rest.getBots().then((bots: any) => {
                            that._botsjid = bots ? bots.map((bot) => {
                                return bot.jid;
                            }):[];
                        });
                    }
                }).then(async () => {
                    if (that.options.imOptions.autoLoadConversations && that.options._restOptions.useRestAtStartup) {
                        if (that.options.imOptions.autoLoadConversationHistory) {
                            return await that._conversations.getServerConversations().then(async () => {
                                return await that._conversations.loadEveryConversationsHistory();
                            });
                        } else {
                            return await that._conversations.getServerConversations();
                        }
                        that.getDurationSinceStart("_retrieveInformation after getServerConversations ");
                    } else {
                        that._logger.log(that.INFO, LOG_ID + "(_retrieveInformation) load of getServerConversations IGNORED by config autoLoadConversations : ", that.options.imOptions.autoLoadConversations);
                        return;
                    }
                }).then(() => {
                    return that._calllog.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._favorites.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._alerts.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._rbvoice.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._webinars.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._httpoverxmpp.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._rpcoverxmpp.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    return that._invitations.init(that.options._restOptions.useRestAtStartup);
                }).then(() => {
                    resolve(undefined);
                }).catch((err) => {
                    that._logger.log(that.ERROR, LOG_ID + "(_retrieveInformation) !!! CATCH  Error while initializing services. Error : ", err);
                    that._logger.log(that.INTERNALERROR, LOG_ID + "(_retrieveInformation) !!! CATCH  Error while initializing services : ", err);
                    reject(err);
                });
            }
            that.getDurationSinceStart("_retrieveInformation end ");
        });
    };

    async setRenewedToken (strToken : string) {
        let that = this;
        that._logger.log(that.INFO, LOG_ID +  "(setRenewedToken) strToken : ", strToken);
        return await that._rest.signin(strToken).then(() => {
            that._logger.log(that.INFO, LOG_ID +  "(setRenewedToken) token successfully renewed, send evt_internal_tokenrenewed event");
            that._eventEmitter.iee.emit("evt_internal_tokenrenewed");
        });
        //return await self.signin(false, strToken);
    }

    onTokenRenewed() {
        let that = this;
        that._logger.log(that.INFO, LOG_ID +  "(onTokenRenewed) token successfully renewed");
        that._rest.startTokenSurvey();
    };

    onTokenExpired() {
        let that = this;
        that._logger.log(that.INFO, LOG_ID +  "(onTokenExpired) token expired. Signin required");
        /*
                    self._eventEmitter.iee.removeListener("evt_internal_tokenrenewed", self.onTokenRenewed.bind(self));
                    self._eventEmitter.iee.removeListener("evt_internal_tokenexpired", self.onTokenExpired.bind(self));
        */
        if (!that._rest.p_decodedtokenRest || ( that._rest.p_decodedtokenRest && ! that._rest.p_decodedtokenRest.oauth)) {
            that._eventEmitter.iee.emit("evt_internal_signinrequired");
        } else {
            that._logger.log(that.INFO, LOG_ID +  "(onTokenExpired) oauth token expired. External renew required");
            that._eventEmitter.iee.emit("evt_internal_onusertokenrenewfailed");
        }
    };

    _tokenSurvey () {
        let that = this;
        that._logger.log(that.DEBUG, LOG_ID +  "(tokenSurvey) _enter_");

        if (that.options.useCLIMode) {
            that._logger.log(that.INFO, LOG_ID +  "(tokenSurvey) No token survey in CLI mode");
            return;
        }

        /*
                    that._eventEmitter.iee.removeListener("evt_internal_tokenrenewed", that.onTokenRenewed.bind(that));
                    that._eventEmitter.iee.removeListener("evt_internal_tokenexpired", that.onTokenExpired.bind(that));
                    that._eventEmitter.iee.on("evt_internal_tokenrenewed", that.onTokenRenewed.bind(that));
                    that._eventEmitter.iee.on("evt_internal_tokenexpired", that.onTokenExpired.bind(that));
        */
        that._rest.startTokenSurvey();
    };

    startCleanningInterval() {
        let that = this;
        function cleanningClass() {
            that._logger.log(that.DEBUG, LOG_ID + "(startCleanningInterval) cleanningClass.");


            //public _rest: RESTService;
            //public _http: HTTPService;
            //public _xmpp: XMPPService;
            //public _stateManager: StateManager;
            //public _im: ImsService;

            that._admin.cleanMemoryCache();
            that._alerts.cleanMemoryCache();
            that._rbvoice.cleanMemoryCache();
            that._httpoverxmpp.cleanMemoryCache();
            that._rpcoverxmpp.cleanMemoryCache();
            that._webinars.cleanMemoryCache();
            that._bubbles.cleanMemoryCache();
            that._calllog.cleanMemoryCache();
            that._channels.cleanMemoryCache();
            that._contacts.cleanMemoryCache();
            that._conversations.cleanMemoryCache();
            that._favorites.cleanMemoryCache();
            that._fileServer.cleanMemoryCache();
            that._fileStorage.cleanMemoryCache();
            that._groups.cleanMemoryCache();
            that._invitations.cleanMemoryCache();
            that._presence.cleanMemoryCache();
            that._profiles.cleanMemoryCache();
            that._s2s.cleanMemoryCache();
            that._settings.cleanMemoryCache();
            that._telephony.cleanMemoryCache();
            that._tasks.cleanMemoryCache();
        }
        
        that.cleanningClassIntervalID = setInterval(cleanningClass, that.options.intervalBetweenCleanMemoryCache);
    }
    
    start(token) {
        let that = this;

        that.startDate = new Date();

        // Initialize the logger
        //if (! that._logger) {
            let loggerModule = new Logger(that.options._options);
            that._logger = loggerModule.log;
        //}
        
        that._logger.log(that.DEBUG, LOG_ID + "(start) _entering_");
        that._logger.log(that.INFO, LOG_ID + "(start) STARTING the SDK : ", packageVersion.version);

        return new Promise(async function (resolve, reject) {

            try {

                that.getDurationSinceStart("start begin ");

                if (!that.options.hasCredentials && !token) {
                    that._logger.log(that.ERROR, LOG_ID + "(start) No credentials. Stop loading...");
                    that._logger.log(that.DEBUG, LOG_ID + "(start) _exiting_");
                    reject("Credentials are missing. Check your configuration!");
                } else {
                    if (token) {
                        that._logger.log(that.DEBUG, LOG_ID + "(start) with token.");
                        that._logger.log(that.INTERNAL, LOG_ID + "(start) with token : ", token);
                    }

                    that._logger.log(that.DEBUG, LOG_ID + "(start) start all modules");
                    if (!token) {
                        that._logger.log(that.INTERNAL, LOG_ID + "(start) start all modules for user : ", that.options.credentials.login);
                    }
                    that._logger.log(that.INTERNAL, LOG_ID + "(start) servicesToStart : ", that.options.servicesToStart);
                    
                    try {
                        if (that._stateManager.isCONNECTED()) {
                            that._logger.log(that.INFO, LOG_ID + "(start) !!! SDK status is " + that._stateManager.state + ", so treat the start as a restart, with a stop before the start.");
                            await that.stop();
                        }
                        if (that._stateManager.isDISCONNECTED()) {
                            that._logger.log(that.INFO, LOG_ID + "(start) !!! SDK status is " + that._stateManager.state + ", so treat the start as a restart, with a stop before the start.");
                            await that.stop();
                        }
                        if (that._stateManager.isERROR()) {
                            that._logger.log(that.INFO, LOG_ID + "(start) !!! SDK status is " + that._stateManager.state + ", so treat the start as a restart, with a stop before the start.");
                            await that.stop();
                        }
                        if (that._stateManager.isFAILED()) {
                            that._logger.log(that.INFO, LOG_ID + "(start) !!! SDK status is " + that._stateManager.state + ", so treat the start as a restart, with a stop before the start.");
                            await that.stop();
                        }
                        if (that._stateManager.isREADY()) {
                            that._logger.log(that.INFO, LOG_ID + "(start) SDK status is " + that._stateManager.state + ", so treat the start as a restart, with a stop before the start.");
                            await that.stop();
                        }
                        if (that._stateManager.isRECONNECTING()) {
                            that._logger.log(that.INFO, LOG_ID + "(start) SDK status is " + that._stateManager.state + ". Should not do anything.");
                        }
                        if (that._stateManager.isSTARTED()) {
                            that._logger.log(that.INFO, LOG_ID + "(start) !!! SDK status is " + that._stateManager.state + ", so treat the start as a restart, with a stop before the start.");
                            await that.stop();
                        }
                        if (that._stateManager.isSTARTING()) {
                            that._logger.log(that.INFO, LOG_ID + "(start) SDK status is " + that._stateManager.state + ". SDK should not do anything.");
                        }
                        if (that._stateManager.isSTOPPED()) {
                            that._logger.log(that.INFO, LOG_ID + "(start) SDK status is " + that._stateManager.state + ", will start.");
                        }
                    } catch (err) {
                        that._logger.log(that.ERROR, LOG_ID + "(start) !!! CATCH Error when treatment of SDK status, SDK status is " + that._stateManager.state + ".");
                        that._logger.log(that.INTERNALERROR, LOG_ID + "(start) !!! CATCH Error when treatment of SDK status : ", err);
                    } 
                    
                    return that._stateManager.start().then(() => {
                        return that._http.start();
                    }).then(() => {
                        return that._rest.start(that._http);
                    }).then(() => {
                        return that._xmpp.start(that.options.useXMPP);
                    }).then(() => {
                        return that._s2s.start(that.options);
                    }).then(() => {
                        return that._settings.start(that.options);
                    }).then(() => {
                        return that._presence.start(that.options) ;
                    }).then(() => {
                        return  that._contacts.start(that.options ) ;
                    }).then(() => {
                       return that._bubbles.start(that.options) ;
                    }).then(() => {
                        return that._conversations.start(that.options) ;
                    }).then(() => {
                        return that._profiles.start(that.options, []) ;
                    }).then(() => {
                        return that._telephony.start(that.options) ;
                    }).then(() => {
                        return that._im.start(that.options) ;
                    }).then(() => {
                        return that._channels.start(that.options) ;
                    }).then(() => {
                        return that._groups.start(that.options) ;
                    }).then(() => {
                        return that._admin.start(that.options) ;
                    }).then(() => {
                        return that._fileServer.start(that.options) ;
                    }).then(() => {
                        return that._fileStorage.start(that.options) ;
                    }).then(() => {
                        return that._calllog.start(that.options) ;
                    }).then(() => {
                        return that._favorites.start(that.options) ;
                    }).then(() => {
                        return that._alerts.start(that.options) ;
                    }).then(() => {
                        return that._rbvoice.start(that.options) ;
                    }).then(() => {
                        return that._webinars.start(that.options) ;
                    }).then(() => {
                        return that._httpoverxmpp.start(that.options) ;
                    }).then(() => {
                        return that._rpcoverxmpp.start(that.options) ;
                    }).then(() => {
                        return that._invitations.start(that.options, []) ;
                    }).then(() => {
                        return that._tasks.start(that.options) ;
                    }).then(() => {
                        that._logger.log(that.DEBUG, LOG_ID + "(start) all modules started successfully");
                        that._stateManager.transitTo(true, that._stateManager.STARTED).then(() => {
                            that.getDurationSinceStart("start end ");
                            that._logger.log(that.DEBUG, LOG_ID + "(start) _exiting_");
                            resolve(undefined);
                        }).catch((err) => {
                            reject(err);
                        });
                    }).catch((err) => {
                        that._logger.log(that.ERROR, LOG_ID + "(start) !!! CATCH Error during bulding services instances. Error : ", err);
                        that._logger.log(that.INTERNALERROR, LOG_ID + "(start) !!! CATCH Error during bulding services instances : ", err);
                        that._logger.log(that.DEBUG, LOG_ID + "(start) _exiting_");
                        reject(err);
                    });
                }

            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(start)");
                that._logger.log(that.INTERNALERROR, LOG_ID + "(start)", err.message);
                that._logger.log(that.DEBUG, LOG_ID + "(start) _exiting_");
                reject(err);
            }
        });
    }

    signin(forceStopXMPP, token) {

        let that = this;
        return new Promise(function (resolve, reject) {
            that._signinmethodName = SIGNINMETHODNAME.SIGNIN;

            let json = null;
            that.getDurationSinceStart("signin begin ");

            return that._signin(forceStopXMPP, token).then(function (_json) {
                that.lastConnectedOptions.token = token;
                json = _json;
                that.getDurationSinceStart("_signin done ");

                return that._stateManager.transitTo(true, that._stateManager.CONNECTED).then(() => {
                    that.getDurationSinceStart("_retrieveInformation before ");
                    return that._retrieveInformation();
                });
            }).then(() => {
                that.getDurationSinceStart("_retrieveInformation done ");
                that._tokenSurvey();
                that._stateManager.transitTo(true, that._stateManager.READY).then(() => {
                    resolve(json);
                }).catch((err)=> { 
                    reject(err); 
                });
            }).catch(async (err) => {
                reject(err);
            });
        });
    }

    signinWSOnly(forceStopXMPP, token, userInfos) {

        let that = this;
        return new Promise(function (resolve, reject) {
            that._signinmethodName = SIGNINMETHODNAME.SIGNINWSONLY;

            let json = null;

            return that._signinWSOnly(forceStopXMPP, token, userInfos).then(function (_json) {
                that.lastConnectedOptions.token = token;
                that.lastConnectedOptions.userInfos = userInfos;
                json = _json;
                return that._stateManager.transitTo(true, that._stateManager.CONNECTED).then(() => {
                    
                    return that._retrieveInformation().catch((err) => {
                        that._logger.log(that.INTERNAL, LOG_ID + "(signinWSOnly) error while _retrieveInformation : ", err);
                    });
                });
            }).then(() => {
                //that._tokenSurvey();
                    that._stateManager.transitTo(true, that._stateManager.READY).then(() => {
                    resolve(json);
                }).catch((err)=> { 
                    reject(err); 
                });
            }).catch((err) => {
                reject(err);
            });
        });
    }

    stop() {
        let that = this;
        that._logger.log(that.INTERNAL, LOG_ID + "(stop) _entering_ stack : ", stackTrace());

        return new Promise(async function (resolve, reject) {

            await that.timeOutManager.clearEveryTimeout();

            if (that._stateManager.isSTOPPED()) {
                return resolve("core already stopped !");
            }

            that._logger.log(that.INFO, LOG_ID + "(stop) stop all modules !");

            await that._s2s.stop().then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped s2s.");
                if (that.options._restOptions.useRestAtStartup) {
                    return that._rest.stop();
                }
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped rest");
                return that._http.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped http");
                return that._xmpp.stop(that.options.useXMPP);
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped xmpp");
                return that._im.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped im");
                return that._settings.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped settings");
                return that._presence.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped presence");
                return that._conversations.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped conversations");
                return that._telephony.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped telephony");
                return that._contacts.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped contacts");
                return that._bubbles.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped bubbles");
                return that._channels.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped channels");
                return that._groups.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped groups");
                return that._admin.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped admin");
                return that._fileServer.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped fileServer");
                return that._fileStorage.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped fileStorage");
                return that._calllog.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped calllog");
                return that._favorites.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped favorites");
                return that._alerts.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped alerts");
                return that._rbvoice.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped rbvoice");
                return that._webinars.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped webinar");
                return that._httpoverxmpp.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped httpoverxmpp");
                return that._rpcoverxmpp.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped rpcoverxmpp");
                return that._tasks.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped tasks");
                return that._invitations.stop();
            }).then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped invitations");
                that._logger.log(that.INFO, LOG_ID + "(stop) _exiting_");
                resolve("core stopped");
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID + "(stop) CATCH Error !!! Error : ", err);
                that._logger.log(that.INTERNALERROR, LOG_ID + "(stop) CATCH Error !!! : ", err);
                that._logger.log(that.INFO, LOG_ID + "(stop) _exiting_");
                reject(err);
            });

            await that.timeOutManager.clearEveryTimeout();

            await that._stateManager.stop().then(() => {
                that._logger.log(that.INFO, LOG_ID + "(stop) stopped stateManager");
            }).catch((err) => {
                that._logger.log(that.ERROR, LOG_ID + "(stop) CATCH Error !!! Error : ", err);
                that._logger.log(that.INTERNALERROR, LOG_ID + "(stop) CATCH Error !!! : ", err);
                that._logger.log(that.INFO, LOG_ID + "(stop) _exiting_");
                reject(err);
            });

            // that._logger.log(that.DEBUG, LOG_ID + "(stop) stop after all modules 1 !");
            that._logger.stop();
            //that._logger = null;
        });
        // that._logger.log(that.DEBUG, LOG_ID + "(stop) stop after all modules 2 !");
    }

    async getConnectionStatus():Promise<{
        restStatus:boolean,
        xmppStatus:boolean,
        s2sStatus:boolean,
        state : SDKSTATUSENUM,
        nbHttpAdded : number,
        httpQueueSize : number,
        nbRunningReq : number,
        maxSimultaneousRequests : number
        nbReqInQueue : number
    }> {
        let that = this;
        let restStatus: boolean = false;
        // Test XMPP connection
        let xmppStatus: boolean = false;
        // Test S2S connection
        let s2sStatus: boolean = false;

        return new Promise(async (resolve, reject) => {
            // Test REST connection
            try {
                restStatus = (that._rest && that.options._restOptions.useRestAtStartup) ? await that._rest.checkRESTAuthentication():false;
            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(getConnectionStatus) CATCH Error - testing REST status: ", err);
            }
            // Test XMPP connection
            try {
                xmppStatus = that._xmpp ? await that._xmpp.sendPing().then((result) => {
                    that._logger.log(that.DEBUG, LOG_ID + "(getConnectionStatus) set xmppStatus to true. result : ", result);
                    if (result && result.code===1) {
                        return true;
                    } else {
                        return false;
                    }
                }):false;
            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(getConnectionStatus) CATCH Error - testing XMPP status: ", err);
            }

            // */
            // Test S2S connection
            try {
                s2sStatus = (that._rest && that.options._restOptions.useRestAtStartup) ? await that._rest.checkS2SAuthentication():false;
            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(getConnectionStatus) CATCH Error - testing S2S status : ", err);
            }
            let httpStatus: any = {
                nbHttpAdded: 0,
                httpQueueSize: 0,
                nbRunningReq: 0,
                maxSimultaneousRequests: 0,
                nbReqInQueue: 0,
                retryAfterTime : 0,
                retryAfterEndTime : 0,
                retryAfterStartTime : 0
            };

            try {
                httpStatus = that._http ? await that._http.checkHTTPStatus():{
                    nbHttpAdded: 0,
                    httpQueueSize: 0,
                    nbRunningReq: 0,
                    maxSimultaneousRequests: 0,
                    nbReqInQueue: 0,
                    retryAfterTime : 0,
                    retryAfterEndTime : 0,
                    retryAfterStartTime : 0
                };
            } catch (err) {
                that._logger.log(that.ERROR, LOG_ID + "(getConnectionStatus) CATCH Error - testing http status : ", err);
            }

            return resolve({
                restStatus,
                xmppStatus,
                s2sStatus,
                state: that.state,
                nbHttpAdded: httpStatus.nbHttpAdded,
                httpQueueSize: httpStatus.httpQueueSize,
                nbRunningReq: httpStatus.nbRunningReq,
                maxSimultaneousRequests: httpStatus.maxSimultaneousRequests,
                nbReqInQueue: httpStatus.nbReqInQueue
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

    get tasks() {
        return this._tasks;
    }

    get Utils() {
        return this._Utils;
    }

}

//module.exports = Core;
module.exports.Core = Core;
export {Core};
