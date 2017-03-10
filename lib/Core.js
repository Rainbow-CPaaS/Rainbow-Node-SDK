'use strict';

var Logger = require('./common/Logger');
var RESTService = require('./connection/RESTService');
var HTTPService = require('./connection/HttpService');
var XMPPService = require('./connection/XMPPService');
var IMService = require('./services/IM');
var PresenceService = require('./services/Presence');
var ContactsService = require('./services/Contacts');
var Proxy = require('./Proxy');
var config = require('./config/config');
var getHTTPOptions, getXMPPOptions, getProxyOptions, getIMOptions;

const LOG_ID = 'CORE - ';

class Core {

    constructor(options, _eventEmitter) {

        var loggerModule = new Logger(options, config.logs);
        this.logger = loggerModule.log;
        
        getHTTPOptions = (options) => {
            var httpOptions = config.sandbox.http;
            
            switch (options.rainbow.host) {
                case "official":
                    httpOptions = config.official.http;
                    break;
                case "sandbox":
                    httpOptions = config.sandbox.http;
                    break;
                default:
                    this.logger.log("warn", LOG_ID + "(constructor) 'host' property is not valid (should be 'sandbox' or 'official'). Use 'sandbox'", options.rainbow.host);
                    break;
            }
            return httpOptions;
        }

        getXMPPOptions = (options) => {
            var xmppOptions = config.sandbox.xmpp;
            
            switch (options.rainbow.host) {
                case "official":
                    xmppOptions = config.official.xmpp;
                    break;
                case "sandbox":
                    xmppOptions = config.sandbox.xmpp;
                    break;
                default:
                    this.logger.log("warn", LOG_ID + "(constructor) 'host' property is not valid (should be 'sandbox' or 'official'). Use 'sandbox'", options.rainbow.host);
                    break;
            }
            return xmppOptions;
        }

        getProxyOptions = (options) => {
            
            var proxyOptions = {
                protocol: 'http',
                host: '',
                port: 80
            };
            
            if(!("host" in options.proxy)) {
                this.logger.log("warn", LOG_ID + "(constructor) 'host' property is not defined. No proxy will be used", options.proxy.host);
            }
            else {
                proxyOptions.host = options.proxy.host;
            }
            if(!("port" in options.proxy)) {
                this.logger.log("info", LOG_ID + "(constructor) 'port' property is not defined. Use default 80", options.proxy.port);
            }
            else {
                proxyOptions.port = options.proxy.port;
            }
            if(!("protocol" in options.proxy)) {
                this.logger.log("info", LOG_ID + "(constructor) 'protocol' property not defined. Use default 'http'", options.proxy.protocol);
            }
            else {
                proxyOptions.protocol = options.proxy.protocol;
            }

            return proxyOptions;
        }

        getIMOptions = (options)=> {

            var optionsIM = {
                sendReadReceipt:config.im.sendReadReceipt
            };

            if(!'sendReadReceipt' in options.im) {
                this.logger.log("info", LOG_ID + "(constructor) 'sendReadReceipt' property is not defined. Use default true", options.im.sendReadReceipt);
            }
            else {
                 optionsIM.sendReadReceipt = options.im.sendReadReceipt;
            }

            return optionsIM;
        }

        this.logger.log("debug", LOG_ID + "(constructor) _entering_");
        this.eventEmitter = _eventEmitter;
        
        if(!options) {
            this.logger.log("error", LOG_ID + "(constructor) No 'options' parameter. Can't sign-in. Check the documentation to configure it");
            this.eventEmitter.emit("rainbow_onnocredentials");
        }

        if(!options.rainbow || !options.rainbow.host) {
            this.logger.log("warn", LOG_ID + "(constructor) 'host' property is not defined. Use default: 'sandbox'. Check the documentation to configure it");
            options.rainbow = {host: 'sandbox'};
        }

        if(!options.proxy) {
            this.logger.log("info", LOG_ID + "(constructor) 'proxy' property is not defined. Use default: no proxy. Check the documentation to enable it");
            options.proxy = {host: "", protocol: "http", port: 80};
        }

        if(!options.credentials) {
            this.logger.log("error", LOG_ID + "(constructor) credentials' property is not defined. Can't sign-in. Check the documentation to configure it");
            this.eventEmitter.emit("rainbow_onnocredentials");
        } else if(!options.credentials.login || !options.credentials.password) {
            this.logger.log("error", LOG_ID + "(constructor) 'login' or 'password' is not defined. Can't sign-in. Check the documentation to configure it");
            this.eventEmitter.emit("rainbow_onnocredentials");
        } else {
            this._rest = new RESTService(options.credentials, this.eventEmitter, this.logger);
        }

        if(!options.im) {
            options.options = {sendReadReceipt: config.im.sendReadReceipt};
        }

        this._proxy = new Proxy(getProxyOptions(options), this.logger);
        this._http = new HTTPService(getHTTPOptions(options), this.logger, this._proxy);
        this._xmpp = new XMPPService(getXMPPOptions(options), getIMOptions(options), this.eventEmitter, this.logger, this._proxy);
        
        this._im = new IMService(this.eventEmitter, this.logger);
        this._presence = new PresenceService(this.eventEmitter, this.logger);
        this._contacts = new ContactsService(this.eventEmitter, this.logger);

        
        this.logger.log("debug", LOG_ID + "(constructor) _exiting_");
    }

    start()
    {
        try
        {
            var that = this;

            this.logger.log("debug", LOG_ID +  "(start) _entering_");

            return new Promise(function(resolve, reject) {
                that.logger.log("debug", LOG_ID +  "(start) start all modules");
                Promise.all([
                    that._http.start(),
                    that._rest.start(that._http),
                    that._xmpp.start(),
                    that._im.start(that._xmpp),
                    that._presence.start(that._xmpp),
                    that._contacts.start(that._xmpp, that._rest)
                ]).then(function() {
                    that.logger.log("debug", LOG_ID +  "(start) all modules started successfully");
                    that.logger.log("debug", LOG_ID +  "(start) _exiting_");
                    resolve();
                }).catch(function(err) {
                    that.logger.log("error", LOG_ID + "(start) error", err);
                    that.logger.log("debug", LOG_ID +  "(start) _exiting_");
                    reject(err);
                });
            });
        }
        catch(err) {
            that.logger.log("error", LOG_ID + "(start)", err);
            that.logger.log("debug", LOG_ID +  "(start) _exiting_");
            console.log(typeof err);
            reject(err);
        }
    }

    signin(forceStopXMPP) {
        var that = this;
        this.logger.log("debug", LOG_ID +  "(signin) _entering_");

        if(forceStopXMPP) {
            this.logger.log("debug", LOG_ID +  "(signin) stop the XMPP service");
            this._xmpp.stop();
        }

        return new Promise(function(resolve, reject) {
            that._rest.signin().then(function() {
                return that._xmpp.signin(that._rest.loggedInUser);
            }).then(function() {
                that.logger.log("debug", LOG_ID +  "(signin) signed in successfully");
                that.logger.log("debug", LOG_ID +  "(signin) _exiting_");
                resolve();
            }).catch(function(err) {
                that.logger.log("debug", LOG_ID +  "(signin) can't signed-in", err);
                that.logger.log("debug", LOG_ID +  "(signin) _exiting_");
                reject(err);
            });
        })
    }

    tokenSurvey() {
        var that = this;

        var onTokenRenewed = function onTokenRenewed() {
            that.logger.log("info", LOG_ID +  "(tokenSurvey) token successfully renewed");
            that._rest.startTokenSurvey();
        };

        var onTokenExpired = function onTokenExpired() {
            that.logger.log("info", LOG_ID +  "(tokenSurvey) token expired. Signin required");
            that.eventEmitter.removeListener('rainbow_tokenrenewed', onTokenRenewed);
            that.eventEmitter.removeListener('rainbow_tokenexpired', onTokenExpired);
            that.eventEmitter.emit('rainbow_signinrequired');
        };

        this.eventEmitter.on('rainbow_tokenrenewed', onTokenRenewed);
        this.eventEmitter.on('rainbow_tokenexpired', onTokenExpired);
        this._rest.startTokenSurvey();
    }


    stop() {
        var that = this;
        this.logger.log("debug", LOG_ID +  "(stop) _entering_");
        return Promise.all([
            that._rest.stop(),
            that._http.stop(),
            that._xmpp.stop(),
            that._im.stop(),
            that._presence.stop(),
            that._contacts.stop()
        ]);
        this.logger.log("debug", LOG_ID +  "(stop) _exiting_");
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

}

module.exports = Core;
