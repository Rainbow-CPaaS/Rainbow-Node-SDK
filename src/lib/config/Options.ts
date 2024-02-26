"use strict";
import {Logger} from "../common/Logger";

export {};

//const config = require("./config");
import {config, DataStoreType} from "./config";

const LOG_ID = "OPTIONS - ";

class Options {
	public _logger: Logger;
	public _options: any; //OptionsType;
	public _hasCredentials: any;
	public _hasApplication: any;
	public _httpOptions: any;
	public _xmppOptions: any;
	public _s2sOptions: any;
	public _restOptions: any;
	public _proxyoptions: any;
	public _imOptions: any;
	public _applicationOptions: any;
	public _withXMPP: any;
	public _withS2S: any;
	public _CLIMode: any;
	public _servicesToStart: any;
	private _testOutdatedVersion: boolean;
	private _testDNSentry: boolean;
	private _autoReconnectIgnoreErrors: boolean;
	private _httpoverxmppserver: boolean;
    private _concurrentRequests: number;
    private _intervalBetweenCleanMemoryCache: number;
    private _requestsRate: any;
    
    constructor(_options: any, _logger: Logger) {
        this._logger = _logger;
        this._options = _options;
        this._hasCredentials = true;
        this._hasApplication = true;
        this._withXMPP = true;
        this._withS2S = false;
        this._CLIMode = true;
        this._testOutdatedVersion = true;
        this._testDNSentry = true;
        this._autoReconnectIgnoreErrors = false;
        this._httpoverxmppserver = false;
        this._intervalBetweenCleanMemoryCache = 1000 * 60 * 60 * 6; // Every 6 hours
    }

    parse() {
        if (!this._options) {
            this._logger.log("error", LOG_ID + "(constructor) No 'options' parameter. Can't sign-in. Check the documentation to configure it");
            this._hasCredentials = false;
        }

        if (!this._options.rainbow || !this._options.rainbow.host) {
            this._logger.log("warn", LOG_ID + "(constructor) 'host' property is not defined. Use default: 'sandbox'. Check the documentation to configure it");
            this._options.rainbow = {host: "sandbox", mode: "xmpp"};
        }

        if (!this._options.proxy) {
            this._logger.log("info", LOG_ID + "(constructor) 'proxy' property is not defined. Use default: no proxy. Check the documentation to enable it");
            this._options.proxy = {host: "", protocol: "http", port: 80, user : undefined, password : undefined, secureProtocol: undefined};
        }

        if (!this._options.credentials) {
            this._logger.log("error", LOG_ID + "(constructor) 'credentials' property is not defined. Can't sign-in. Check the documentation to configure it");
            this._hasCredentials = false;
        } else if (!this._options.credentials.login || !this._options.credentials.password) {
            this._logger.log("error", LOG_ID + "(constructor) 'login' or 'password' is not defined. Can't sign-in. Check the documentation to configure it");
            this._hasCredentials = false;
        }

        if (!this._options.application) {
            this._logger.log("error", LOG_ID + "(constructor) 'application' property is not defined. Can't sign-in. Check the documentation to configure it");
            this._hasApplication = false;
        } else if (!this._options.application.appID || !this._options.application.appSecret) {
            this._logger.log("error", LOG_ID + "(constructor) 'appId' or 'appSecret' is not defined. Can't sign-in. Check the documentation to configure it");
            this._hasApplication = false;
        }

        this._httpOptions = this._getHTTPOptions();
        this._xmppOptions = this._getXMPPOptions();
        this._s2sOptions = this._getS2SOptions();
        this._restOptions = this._getRESTOptions();
        this._proxyoptions = this._getProxyOptions();
        this._imOptions = this._getIMOptions();
        this._applicationOptions = this._getApplicationsOptions();

        let mode = this._getModeOption();
        this._withXMPP = mode === "xmpp";
        this._withS2S = mode === "s2s";
        this._CLIMode = mode === "cli";
        this._servicesToStart = this._getservicesToStart();
        this._testOutdatedVersion = this._gettestOutdatedVersion();
        this._testDNSentry = this._gettestDNSentry();
        this._autoReconnectIgnoreErrors = this._getautoReconnectIgnoreErrors();
        this._httpoverxmppserver = this._gethttpoverxmppserver();
        this._intervalBetweenCleanMemoryCache = this._getintervalBetweenCleanMemoryCache();
        //this._concurrentRequests = this._getConcurrentRequestsOption();
        this._requestsRate = this._getRequestsRateOption();
    }

    get testOutdatedVersion(): boolean {
        return this._testOutdatedVersion;
    }

    set testOutdatedVersion(value: boolean) {
        this._testOutdatedVersion = value;
    }

    get testDNSentry(): boolean {
        return this._testDNSentry;
    }

    set testDNSentry(value: boolean) {
        this._testDNSentry = value;
    }

    get autoReconnectIgnoreErrors(): boolean {
        return this._autoReconnectIgnoreErrors;
    }

    set autoReconnectIgnoreErrors(value: boolean) {
        this._autoReconnectIgnoreErrors = value;
    }

    get testhttpoverxmppserver(): boolean {
        return this._httpoverxmppserver;
    }

    set testhttpoverxmppserver(value: boolean) {
        this._httpoverxmppserver = value;
    }

    get intervalBetweenCleanMemoryCache(): number {
        return this._intervalBetweenCleanMemoryCache;
    }

    set intervalBetweenCleanMemoryCache(value: number) {
        this._intervalBetweenCleanMemoryCache = value;
    }

    get servicesToStart () {
        return this._servicesToStart;
    }

    get httpOptions() {
        return this._httpOptions;
    }

    get xmppOptions() {
        return this._xmppOptions;
    }

    get s2sOptions() {
        return this._s2sOptions;
    }

    get restOptions() {
        return this._restOptions;
    }

    get proxyOptions() {
        return this._proxyoptions;
    }

    get imOptions() {
        return this._imOptions;
    }

    get applicationOptions() {
        return this._applicationOptions;
    }

    get hasCredentials() {
        return this._hasCredentials;
    }

    get hasApplication() {
        return this._hasApplication;
    }

    get useXMPP() {
        return this._withXMPP;
    }

    get useS2S() {
        return this._withS2S;
    }

    get useCLIMode() {
        return this._CLIMode;
    }

    get credentials() {
        return this._options.credentials;
    }

    get concurrentRequests(): number {
        return this._concurrentRequests;
    }

    get requestsRate(): { 
        "maxReqByIntervalForRequestRate": number, 
        "intervalForRequestRate": number, 
        "timeoutRequestForRequestRate": number } {
        return this._requestsRate;
    }

    _gettestOutdatedVersion() {
        if ( this._options["testOutdatedVersion"] !== undefined ) {
            return this._options.testOutdatedVersion;
        } else {
            return config.testOutdatedVersion;
        }
    }

    _gettestDNSentry() {
        if ( this._options["testDNSentry"] !== undefined ) {
            return this._options.testDNSentry;
        } else {
            return config.testDNSentry;
        }
    }

    _getautoReconnectIgnoreErrors() {
        if ( this._options["autoReconnectIgnoreErrors"] !== undefined ) {
            return this._options.autoReconnectIgnoreErrors;
        } else {
            return config.autoReconnectIgnoreErrors;
        }
    }

    _gethttpoverxmppserver() {
        if ( this._options["httpoverxmppserver"] !== undefined ) {
            return this._options.httpoverxmppserver;
        } else {
            return config.httpoverxmppserver;
        }
    }

    _getintervalBetweenCleanMemoryCache() {
        if ( this._options["intervalBetweenCleanMemoryCache"] !== undefined ) {
            return this._options.intervalBetweenCleanMemoryCache;
        } else {
            return config.intervalBetweenCleanMemoryCache;
        }
    }

    _getservicesToStart() {
        let svceToStart = {};
        if (!this._options.servicesToStart) {
            svceToStart = Object.assign({},config.servicesToStart);
        } else {
            svceToStart = Object.assign({},config.servicesToStart);
            // Read each property one by one in the option parameter. To avoid missed service config.
            if ( typeof(this._options.servicesToStart) === 'object') {
                Object.keys(this._options.servicesToStart).forEach((key) => {
                    if (!svceToStart[key]) {
                        this._logger.log("warn", LOG_ID + "(_getservicesToStart) the service ", key, " is requested have start up to be configured, but it is not defined in default config.");
                        svceToStart[key] = {};
                    }
                    svceToStart[key].start_up = "start_up" in this._options.servicesToStart[key] ? this._options.servicesToStart[key].start_up : config.servicesToStart[key].start_up;
                    svceToStart[key].optional = "optional" in this._options.servicesToStart[key] ? this._options.servicesToStart[key].optional : config.servicesToStart[key].optional;
                });
            } // Else the options parameter is not well completed, so keep default values to start services.
        }

        return svceToStart;
    }

    _isOfficialRainbow () {
        return (this._options.rainbow.host === "official" || this._options.rainbow.host === "openrainbow.com");
        //return (this._options.rainbow.host === "official" );
    }

    _getHTTPOptions() {
        let httpOptions = config.sandbox.http;

        switch (this._options.rainbow.host) {
            case "openrainbow.com":
            case "official":
                httpOptions = config.official.http;
                this._logger.log("debug", LOG_ID + "(constructor) Use REST services on Rainbow Official platform");
                break;
            case "sandbox":
                httpOptions = config.sandbox.http;
                this._logger.log("debug", LOG_ID + "(constructor) Use REST services on Rainbow Sandbox platform");
                break;
            default:
                httpOptions = config.any.http;
                httpOptions.host = this._options.rainbow.host;
                this._logger.log("debug", LOG_ID + "(constructor) Use REST services on Rainbow " + this._options.rainbow.host + " platform");
                break;
        }
        return httpOptions;
    }

    _getXMPPOptions() {
        let xmppOptions = config.sandbox.xmpp;

        switch (this._options.rainbow.host) {
            case "openrainbow.com":
            case "official":
                xmppOptions = config.official.xmpp;
                this._logger.log("debug", LOG_ID + "(constructor) Use XMPP services on Rainbow Official platform");
                break;
            case "sandbox":
                xmppOptions = config.sandbox.xmpp;
                this._logger.log("debug", LOG_ID + "(constructor) Use XMPP services on Rainbow Sandbox platform");
                break;
            default:
                xmppOptions = config.any.xmpp;
                xmppOptions.host = this._options.rainbow.host;
                if ( this._options.xmpp && this._options.xmpp.protocol ) {  xmppOptions.protocol = this._options.xmpp.protocol; }
                if ( this._options.xmpp && this._options.xmpp.port) { xmppOptions.port = this._options.xmpp.port; }
                this._logger.log("warn", LOG_ID + "(constructor) Be careful, an unofficial Rainbow core is used : " + JSON.stringify(xmppOptions));
                this._logger.log("debug", LOG_ID + "(constructor) Use XMPP services on Rainbow " + this._options.rainbow.host + " platform");
                break;
        }
        if ( this._options.xmpp ) {
            if (this._options.xmpp.raiseLowLevelXmppInEvent) {
                xmppOptions.raiseLowLevelXmppInEvent = this._options.xmpp.raiseLowLevelXmppInEvent;
            }
            if (this._options.xmpp.xmppRessourceName) {
                xmppOptions.xmppRessourceName = this._options.xmpp.xmppRessourceName;
            }
            if (this._options.xmpp.xmppRessourceName) {
                xmppOptions.xmppRessourceName = this._options.xmpp.xmppRessourceName;
            }
            if (this._options.xmpp.raiseLowLevelXmppOutReq) {
                xmppOptions.raiseLowLevelXmppOutReq = this._options.xmpp.raiseLowLevelXmppOutReq;
            }
            if (this._options.xmpp.maxIdleTimer) {
                xmppOptions.maxIdleTimer = this._options.xmpp.maxIdleTimer;
            }
            if (this._options.xmpp.timeBetweenXmppRequests) {
                xmppOptions.timeBetweenXmppRequests = this._options.xmpp.timeBetweenXmppRequests;
            }
            if (this._options.xmpp.maxPendingAsyncLockXmppQueue) {
                xmppOptions.maxPendingAsyncLockXmppQueue = this._options.xmpp.maxPendingAsyncLockXmppQueue;
            }
            if (this._options.xmpp.maxPingAnswerTimer) {
                xmppOptions.maxPingAnswerTimer = this._options.xmpp.maxPingAnswerTimer;
            }
        }
        return xmppOptions;
    }

    _getS2SOptions() {
        let s2sOptions = config.sandbox.s2s;

        switch (this._options.rainbow.host) {
            case "openrainbow.com":
            case "official":
                s2sOptions = config.official.s2s;
                if ( this._options.s2s && this._options.s2s.hostCallback ) {  s2sOptions.hostCallback = this._options.s2s.hostCallback; }
                if ( this._options.s2s && this._options.s2s.locallistenningport ) {  s2sOptions.locallistenningport = this._options.s2s.locallistenningport; }
                this._logger.log("debug", LOG_ID + "(constructor) Use S2S services on Rainbow Official platform");
                break;
            case "sandbox":
                s2sOptions = config.sandbox.s2s;
                if ( this._options.s2s && this._options.s2s.hostCallback ) {  s2sOptions.hostCallback = this._options.s2s.hostCallback; }
                if ( this._options.s2s && this._options.s2s.locallistenningport ) {  s2sOptions.locallistenningport = this._options.s2s.locallistenningport; }
                this._logger.log("debug", LOG_ID + "(constructor) Use S2S services on Rainbow Sandbox platform");
                break;
            default:
                s2sOptions = config.any.s2s;
                if ( this._options.s2s && this._options.s2s.hostCallback ) {  s2sOptions.hostCallback = this._options.s2s.hostCallback; }
                if ( this._options.s2s && this._options.s2s.locallistenningport ) {  s2sOptions.locallistenningport = this._options.s2s.locallistenningport; }
                this._logger.log("warn", LOG_ID + "(constructor) Be careful, an unofficial Rainbow core is used : " + JSON.stringify(s2sOptions));
                this._logger.log("debug", LOG_ID + "(constructor) Use S2S services on Rainbow " + this._options.rainbow.host + " platform");
                break;
        }
        return s2sOptions;
    }

    _getRESTOptions() {
        let restOptions = config.any.rest;

        if ("rest" in this._options) {
            restOptions = this._options.rest;
        }
        return restOptions;
    }

    _getModeOption() {

        let mode = config.mode;

        if ("rainbow" in this._options && "mode" in this._options.rainbow) {
            switch (this._options.rainbow.mode) {
                case "xmpp":
                case "s2s":
                case "hook":
                case "cli":
                    mode = this._options.rainbow.mode;
                    break;
                default:
                    mode = config.mode;
                    break;
            }
        }
        return mode;
    }

/*
    _getConcurrentRequestsOption() {

        let concurrentRequests = config.concurrentRequests;

        if ("rainbow" in this._options && "concurrentRequests" in this._options.rainbow) {
            concurrentRequests = this._options.rainbow.concurrentRequests;
        }
        return concurrentRequests;
    }
// */
    
    _getRequestsRateOption() {
        let requestsRate = config.requestsRate;

        if ("rainbow" in this._options && "requestsRate" in this._options) {
            requestsRate = this._options.requestsRate;
        }
        return requestsRate;
    }

    _getProxyOptions() {

        let proxyOptions = {
            protocol: "http",
            host: "",
            port: 80,
            user: undefined,
            password: undefined,
            secureProtocol: undefined
        };

        if (!("host" in this._options.proxy)) {
            this._logger.log("warn", LOG_ID + "(constructor) 'host' property is not defined. No proxy will be used");
        }
        else {
            proxyOptions.host = this._options.proxy.host;
        }
        if (!("port" in this._options.proxy)) {
            this._logger.log("info", LOG_ID + "(constructor) 'port' property is not defined. Use default 80");
        }
        else {
            proxyOptions.port = this._options.proxy.port;
        }
        if (!("protocol" in this._options.proxy)) {
            this._logger.log("info", LOG_ID + "(constructor) 'protocol' property not defined. Use default 'http'");
        }
        else {
            proxyOptions.protocol = this._options.proxy.protocol;
        }
        if (!("user" in this._options.proxy)) {
            this._logger.log("info", LOG_ID + "(constructor) 'user' property not defined. No authentication. ");
        }
        else {
            proxyOptions.user = this._options.proxy.user;
        }
        if (!("password" in this._options.proxy)) {
            this._logger.log("info", LOG_ID + "(constructor) 'password' property not defined. No authentication.");
        }
        else {
            proxyOptions.password = this._options.proxy.password;
        }
        if (!("secureProtocol" in this._options.proxy)) {
            this._logger.log("info", LOG_ID + "(constructor) 'secureProtocol' property not defined. No SSL3.");
        }
        else {
            proxyOptions.secureProtocol = this._options.proxy.secureProtocol;
        }

        return proxyOptions;
    }

    _getIMOptions() {

        let optionsIM = {
            sendReadReceipt:config.im.sendReadReceipt,
            messageMaxLength : 1024,
            sendMessageToConnectedUser: false,
            conversationsRetrievedFormat: "small",
            storeMessages: false,
            copyMessage: true,
            nbMaxConversations: 15,
            rateLimitPerHour: 1000,
            messagesDataStore: DataStoreType.UsestoreMessagesField,
            autoInitialGetBubbles: true,
            autoInitialBubblePresence: true,
            "autoInitialBubbleFormat": "small",
            "autoInitialBubbleUnsubscribed": false,
            autoLoadConversations: true,
            autoLoadConversationHistory: false,
            autoLoadContacts: true,
            enableCarbon: true,
            enablesendurgentpushmessages: false,
            useMessageEditionAndDeletionV2: true
        };

        if (!("sendReadReceipt" in this._options.im)) {
            this._logger.log("info", LOG_ID + "(constructor) 'sendReadReceipt' property is not defined. Use default true");
        }
        else {
                optionsIM.sendReadReceipt = this._options.im.sendReadReceipt;
        }

        optionsIM.messageMaxLength = this._options.im.messageMaxLength ? this._options.im.messageMaxLength : config.im.messageMaxLength;
        optionsIM.sendMessageToConnectedUser = (this._options.im.sendMessageToConnectedUser == false) ? this._options.im.sendMessageToConnectedUser : config.im.sendMessageToConnectedUser;
        optionsIM.conversationsRetrievedFormat = this._options.im.conversationsRetrievedFormat ? this._options.im.conversationsRetrievedFormat : config.im.conversationsRetrievedFormat;
        optionsIM.storeMessages = this._options.im.storeMessages ? this._options.im.storeMessages : config.im.storeMessages;
        optionsIM.copyMessage = (this._options.im.copyMessage == false) ? this._options.im.copyMessage : config.im.copyMessage;
        optionsIM.nbMaxConversations = this._options.im.nbMaxConversations ? this._options.im.nbMaxConversations : config.im.nbMaxConversations;
        optionsIM.rateLimitPerHour = this._options.im.rateLimitPerHour ? this._options.im.rateLimitPerHour : config.im.rateLimitPerHour;
        optionsIM.messagesDataStore = this._options.im.messagesDataStore ? this._options.im.messagesDataStore : config.im.messagesDataStore;
        optionsIM.autoInitialGetBubbles = (this._options.im.autoInitialGetBubbles == false) ? this._options.im.autoInitialGetBubbles : config.im.autoInitialGetBubbles;
        optionsIM.autoInitialBubblePresence = (this._options.im.autoInitialBubblePresence == false) ? this._options.im.autoInitialBubblePresence : config.im.autoInitialBubblePresence;
        optionsIM.autoInitialBubbleFormat = this._options.im.autoInitialBubbleFormat ? this._options.im.autoInitialBubbleFormat : config.im.autoInitialBubbleFormat;
        optionsIM.autoInitialBubbleUnsubscribed = (this._options.im.autoInitialBubbleUnsubscribed == false) ? this._options.im.autoInitialBubbleUnsubscribed : config.im.autoInitialBubbleUnsubscribed;
        optionsIM.autoLoadConversations = (this._options.im.autoLoadConversations == true) ? this._options.im.autoLoadConversations : config.im.autoLoadConversations;
        optionsIM.autoLoadConversationHistory = (this._options.im.autoLoadConversationHistory == true) ? this._options.im.autoLoadConversationHistory : config.im.autoLoadConversationHistory;
        optionsIM.autoLoadContacts = (this._options.im.autoLoadContacts == false) ? this._options.im.autoLoadContacts : config.im.autoLoadContacts;
        optionsIM.enableCarbon = (this._options.im.enableCarbon == false) ? this._options.im.enableCarbon : config.im.enableCarbon;
        optionsIM.enablesendurgentpushmessages = (this._options.im.enablesendurgentpushmessages == true) ? this._options.im.enablesendurgentpushmessages : config.im.enablesendurgentpushmessages;
        optionsIM.useMessageEditionAndDeletionV2 = (this._options.im.useMessageEditionAndDeletionV2 == false) ? this._options.im.useMessageEditionAndDeletionV2 : config.im.useMessageEditionAndDeletionV2;

        return optionsIM;
    }

    _getApplicationsOptions() {
        let applicationOptions = {
            appID: "",
            appSecret: ""
        };

        if ("application" in this._options) {
            if (!("appID" in this._options.application)) {
                this._logger.log("warn", LOG_ID + "(constructor) 'appID' property is not defined. No application ID will be used");
            }
            else {
                applicationOptions.appID = this._options.application.appID;
            }

            if (!("appSecret" in this._options.application)) {
                this._logger.log("warn", LOG_ID + "(constructor) 'appSecret' property is not defined. No application Secret will be used");
            }
            else {
                applicationOptions.appSecret = this._options.application.appSecret;
            }

        }
        else {
            this._logger.log("warn", LOG_ID + "(constructor) 'appID' property is not defined. No application ID will be used");
            this._logger.log("warn", LOG_ID + "(constructor) 'appSecret' property is not defined. No application Secret will be used");
        }

        return applicationOptions;
    }

    /*
    get messageMaxLength () {
        let messageMaxLength = 1024;

        messageMaxLength = this._options.im.messageMaxLength ? this._options.im.messageMaxLength : config.im.messageMaxLength;

        return messageMaxLength
    }

     */

}
module.exports.Options = Options;
export {Options};
