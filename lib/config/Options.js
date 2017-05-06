"use strict";

var config = require("./config");

const LOG_ID = "OPTIONS - ";

class Options {

    constructor(_options, _logger) {
        this._logger = _logger;
        this._options = _options;
        this._hasCredentials = true; 
        this.withXMPP = true;
        this.CLIMode = true;
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
            this._logger.log("error", LOG_ID + "(constructor) credentials' property is not defined. Can't sign-in. Check the documentation to configure it");
            this._hasCredentials = false;
        } else if (!this._options.credentials.login || !this._options.credentials.password) {
            this._logger.log("error", LOG_ID + "(constructor) 'login' or 'password' is not defined. Can't sign-in. Check the documentation to configure it");
            this._hasCredentials = false;
        }

        this._httpOptions = this._getHTTPOptions();
        this._xmppOptions = this._getXMPPOptions();
        this._proxyoptions = this._getProxyOptions();
        this._imOptions = this._getIMOptions();
        var mode = this._getModeOption();
        this._withXMPP = mode === "xmpp";
        this._CLIMode = mode === "cli";
    }

    get httpOptions() {
        return this._httpOptions;
    }

    get xmppOptions() {
        return this._xmppOptions;
    }

    get proxyOptions() {
        return this._proxyoptions;
    }

    get imOptions() {
        return this._imOptions;
    }

    get hasCredentials() {
        return this._hasCredentials;
    }

    get useXMPP() {
        return this._withXMPP;
    }

    get useCLIMode() {
        return this._CLIMode;
    }

    get credentials() {
        return this._options.credentials;
    }

    _getHTTPOptions() {
        var httpOptions = config.sandbox.http;
        
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
        var xmppOptions = config.sandbox.xmpp;
        
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
                this._logger.log("debug", LOG_ID + "(constructor) Use XMPP services on Rainbow " + this._options.rainbow.host + " platform");
                break;
        }
        return xmppOptions;
    }

    _getModeOption() {

        var mode = config.mode;

        if ("rainbow" in this._options && "mode" in this._options.rainbow) {
            switch (this._options.rainbow.mode) {
                case "xmpp":
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
        
        var proxyOptions = {
            protocol: "http",
            host: "",
            port: 80
        };
        
        if (!("host" in this._options.proxy)) {
            this._logger.log("warn", LOG_ID + "(constructor) 'host' property is not defined. No proxy will be used", this._options.proxy.host);
        }
        else {
            proxyOptions.host = this._options.proxy.host;
        }
        if (!("port" in this._options.proxy)) {
            this._logger.log("info", LOG_ID + "(constructor) 'port' property is not defined. Use default 80", this._options.proxy.port);
        }
        else {
            proxyOptions.port = this._options.proxy.port;
        }
        if (!("protocol" in this._options.proxy)) {
            this._logger.log("info", LOG_ID + "(constructor) 'protocol' property not defined. Use default 'http'", this._options.proxy.protocol);
        }
        else {
            proxyOptions.protocol = this._options.proxy.protocol;
        }

        return proxyOptions;
    }

    _getIMOptions() {

        var optionsIM = {
            sendReadReceipt:config.im.sendReadReceipt
        };

        if (!("sendReadReceipt" in this._options.im)) {
            this._logger.log("info", LOG_ID + "(constructor) 'sendReadReceipt' property is not defined. Use default true", this._options.im.sendReadReceipt);
        }
        else {
                optionsIM.sendReadReceipt = this._options.im.sendReadReceipt;
        }
        return optionsIM;
    }

}
module.exports = Options;