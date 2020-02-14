"use strict";
export {};

//const config = require("./config");
import {config, DataStoreType} from "./config";

const LOG_ID = "OPTIONS - ";

class Options {
	public _logger: any;
	public _options: any;
	public _hasCredentials: any;
	public _hasApplication: any;
	public _httpOptions: any;
	public _xmppOptions: any;
	public _s2sOptions: any;
	public _proxyoptions: any;
	public _imOptions: any;
	public _applicationOptions: any;
	public _withXMPP: any;
	public _withS2S: any;
	public _CLIMode: any;
	public _servicesToStart: any;
	private _testOutdatedVersion: boolean;

    constructor(_options, _logger) {
        this._logger = _logger;
        this._options = _options;
        this._hasCredentials = true;
        this._hasApplication = true;
        this._withXMPP = true;
        this._withS2S = false;
        this._CLIMode = true;
        this._testOutdatedVersion = true;
    }

    parse() {
        if (!this._options) {
            this._logger.log("error", LOG_ID + "(constructor) No 'options' parameter. Can't sign-in. Check the documentation to configure it");
            this._hasCredentials = false;
        }

        if (!this._options.rainbow || !this._options.rainbow.host) {
            this._logger.log("warn", LOG_ID + "(constructor) 'host' property is not defined. Use default: 'sandbox'. Check the documentation to configure it");
            this._options.rainbow = {host: "sandbox"};
        }

        if (!this._options.proxy) {
            this._logger.log("info", LOG_ID + "(constructor) 'proxy' property is not defined. Use default: no proxy. Check the documentation to enable it");
            this._options.proxy = {host: "", protocol: "http", port: 80};
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
        this._proxyoptions = this._getProxyOptions();
        this._imOptions = this._getIMOptions();
        this._applicationOptions = this._getApplicationsOptions();

        let mode = this._getModeOption();
        this._withXMPP = mode === "xmpp";
        this._withS2S = mode === "s2s";
        this._CLIMode = mode === "cli";
        this._servicesToStart = this._getservicesToStart();
        this._testOutdatedVersion = this._gettestOutdatedVersion();
    }

    get testOutdatedVersion(): boolean {
        return this._testOutdatedVersion;
    }

    set testOutdatedVersion(value: boolean) {
        this._testOutdatedVersion = value;
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

    _gettestOutdatedVersion() {
        if ( this._options["testOutdatedVersion"] !== undefined ) {
            return this._options.testOutdatedVersion;
        } else {
            return config.testOutdatedVersion;
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
        return (this._options.rainbow.host === "official");
    }

    _getHTTPOptions() {
        let httpOptions = config.sandbox.http;

        switch (this._options.rainbow.host) {
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
                this._logger.warn("Be careful, an unofficial Rainbow core is used : " + JSON.stringify(xmppOptions));
                this._logger.log("debug", LOG_ID + "(constructor) Use XMPP services on Rainbow " + this._options.rainbow.host + " platform");
                break;
        }
        return xmppOptions;
    }

    _getS2SOptions() {
        let s2sOptions = config.sandbox.s2s;

        switch (this._options.rainbow.host) {
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
                this._logger.warn("Be careful, an unofficial Rainbow core is used : " + JSON.stringify(s2sOptions));
                this._logger.log("debug", LOG_ID + "(constructor) Use S2S services on Rainbow " + this._options.rainbow.host + " platform");
                break;
        }
        return s2sOptions;
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
            copyMessage: false,
            nbMaxConversations: 15,
            rateLimitPerHour: 1000,
            messagesDataStore: DataStoreType.UsestoreMessagesField
        };

        if (!("sendReadReceipt" in this._options.im)) {
            this._logger.log("info", LOG_ID + "(constructor) 'sendReadReceipt' property is not defined. Use default true");
        }
        else {
                optionsIM.sendReadReceipt = this._options.im.sendReadReceipt;
        }

        optionsIM.messageMaxLength = this._options.im.messageMaxLength ? this._options.im.messageMaxLength : config.im.messageMaxLength;
        optionsIM.sendMessageToConnectedUser = this._options.im.sendMessageToConnectedUser ? this._options.im.sendMessageToConnectedUser : config.im.sendMessageToConnectedUser;
        optionsIM.conversationsRetrievedFormat = this._options.im.conversationsRetrievedFormat ? this._options.im.conversationsRetrievedFormat : config.im.conversationsRetrievedFormat;
        optionsIM.storeMessages = this._options.im.storeMessages ? this._options.im.storeMessages : config.im.storeMessages;
        optionsIM.copyMessage = this._options.im.copyMessage ? this._options.im.copyMessage : config.im.copyMessage;
        optionsIM.nbMaxConversations = this._options.im.nbMaxConversations ? this._options.im.nbMaxConversations : config.im.nbMaxConversations;
        optionsIM.rateLimitPerHour = this._options.im.rateLimitPerHour ? this._options.im.rateLimitPerHour : config.im.rateLimitPerHour;
        optionsIM.messagesDataStore = this._options.im.messagesDataStore ? this._options.im.messagesDataStore : config.im.messagesDataStore;

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
