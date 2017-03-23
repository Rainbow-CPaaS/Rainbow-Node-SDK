'use strict';

var Logger = require('./common/Logger');
var RESTService = require('./connection/RESTService');
var HTTPService = require('./connection/HttpService');
var XMPPService = require('./connection/XMPPService');
var IMService = require('./services/IM');
var PresenceService = require('./services/Presence');
var ContactsService = require('./services/Contacts');
var BubblesService = require('./services/Bubbles');

var Events = require('./common/Events');

var Options = require('./config/Options');
var Proxy = require('./Proxy');

var _signin, _tokenSurvey;

const LOG_ID = 'CORE - ';

class Core {

    constructor(options) {

        _signin = (forceStopXMPP) => {
            var that = this;
            this.logger.log("debug", LOG_ID +  "(signin) _entering_");

            if(forceStopXMPP) {
                this.logger.log("debug", LOG_ID +  "(signin) stop the XMPP service");
                this._xmpp.stop();
            }

            return new Promise(function(resolve, reject) {

                var json = "";

                that._rest.signin().then(function(_json) {
                    json = _json 
                    return that._xmpp.signin(that._rest.loggedInUser);
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
        }

        _tokenSurvey = () => {

            var that = this;

            if(this.options.useCLIMode) {
                that.logger.log("info", LOG_ID +  "(tokenSurvey) No token survey in CLI mode");
                return;
            }

            var onTokenRenewed = function onTokenRenewed() {
                that.logger.log("info", LOG_ID +  "(tokenSurvey) token successfully renewed");
                that._rest.startTokenSurvey();
            };

            var onTokenExpired = function onTokenExpired() {
                that.logger.log("info", LOG_ID +  "(tokenSurvey) token expired. Signin required");
                that._eventEmitter.iee.removeListener('rainbow_tokenrenewed', onTokenRenewed);
                that._eventEmitter.iee.removeListener('rainbow_tokenexpired', onTokenExpired);
                that._eventEmitter.iee.emit('rainbow_signinrequired');
            };

            this._eventEmitter.iee.on('rainbow_tokenrenewed', onTokenRenewed);
            this._eventEmitter.iee.on('rainbow_tokenexpired', onTokenExpired);
            this._rest.startTokenSurvey();
        }

        var that = this;

        // Initialize the logger
        var loggerModule = new Logger(options);
        this.logger = loggerModule.log;
        this.logger.log("debug", LOG_ID + "(constructor) _entering_");

        // Initialize the options
        
        this.options = new Options(options, this.logger);
        this.options.parse();

        // Initialize the Events Emitter
        this._eventEmitter = new Events();
        this._eventEmitter.iee.on('rainbow_signinrequired', function() {
            that.signin(true);
        });

        this._eventEmitter.iee.on('rainbow_xmppconnected', function() {
            return(that._contacts.getRosters())
            .then(function() {
                return that._bubbles.getBubbles();  
            }).then(function() {
                return that.presence.sendInitialPresence();  
            }).then(function() {
                return that.im.enableCarbon();
            }).then(function() {
                that._eventEmitter.iee.emit('rainbow_connectionok');
            }).catch(function(err) {
                 this.logger.log("error", LOG_ID + "(constructor) Initialization failed!", err);
            }); 
        });

        this._eventEmitter.iee.on('rainbow_xmppfakeconnected', function() {
            that._eventEmitter.iee.emit('rainbow_connectionok');
        });

        this._eventEmitter.iee.on('rainbow_invitationchanged', function(invitation) {

            var contact = that._contacts.getContactByJid(invitation.userJid) || invitation.userJid;
            var bubble = that._bubbles.getBubbleById(invitation.bubbleId) || invitation.bubbleId;

            var data = {
                contact: contact,
                bubble: bubble,
                status: invitation.status
            };

            that._eventEmitter.iee.emit('rainbow_oninvitationchanged', data);
        });
        
        if(this.options.useXMPP) {
            this.logger.log("info", LOG_ID + "(constructor) used in XMPP mode");
        }
        else {
            if(this.useCLIMode) {
                this.logger.log("info", LOG_ID + "(constructor) used in CLI mode");
            }
            else {
                this.logger.log("info", LOG_ID + "(constructor) used in HOOK mode");
            }
        }

        this._rest = new RESTService(this.options.credentials, this._eventEmitter.iee, this.logger);
        this._proxy = new Proxy(this.options.proxyOptions, this.logger);
        this._http = new HTTPService(this.options.httpOptions, this.logger, this._proxy);
        this._xmpp = new XMPPService(this.options.xmppOptions, this.options.imOptions, this._eventEmitter.iee, this.logger, this._proxy);
        this._im = new IMService(this._eventEmitter.iee, this.logger);
        this._presence = new PresenceService(this._eventEmitter.iee, this.logger);
        this._contacts = new ContactsService(this._eventEmitter.iee, this.logger);
        this._bubbles = new BubblesService(this._eventEmitter.iee, this.logger);
        
        this.logger.log("debug", LOG_ID + "(constructor) _exiting_");
    }

    start()
    {
        try
        {
            var that = this;

            this.logger.log("debug", LOG_ID +  "(start) _entering_");

            return new Promise(function(resolve, reject) {
                if(!that.options.hasCredentials) {
                    that.logger.log("error", LOG_ID +  "(start) No credentials. Stop loading...");
                    that.logger.log("debug", LOG_ID +  "(start) _exiting_");
                    reject("Credentials are missing. Check your configuration!");
                }
                else {
                    that.logger.log("debug", LOG_ID +  "(start) start all modules");
                    Promise.all([
                        that._http.start(),
                        that._rest.start(that._http),
                        that._xmpp.start(that.options.useXMPP),
                        that._im.start(that._xmpp),
                        that._presence.start(that._xmpp),
                        that._contacts.start(that._xmpp, that._rest),
                        that._bubbles.start(that._xmpp, that._rest)
                    ]).then(function() {
                        that.logger.log("debug", LOG_ID +  "(start) all modules started successfully");
                        that.logger.log("debug", LOG_ID +  "(start) _exiting_");
                        resolve();
                    }).catch(function(err) {
                        that.logger.log("error", LOG_ID + "(start) error", err);
                        that.logger.log("debug", LOG_ID +  "(start) _exiting_");
                        reject(err);
                    });
                }
            });
        }
        catch(err) {
            that.logger.log("error", LOG_ID + "(start)", err);
            that.logger.log("debug", LOG_ID +  "(start) _exiting_");
            reject(err);
        }
    }

    signin(forceStopXMPP) {

        var that = this;
        return new Promise(function(resolve, reject) {
            _signin(forceStopXMPP).then(function(json) {
                _tokenSurvey();
                that._eventEmitter.iee.emit('rainbow_ready');
                resolve(json);
            }).catch(function(err) {
                reject(err);
            });
        });
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
            that._contacts.stop(),
            that._bubbles.stop()
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

    get bubbles() {
        return this._bubbles;
    }

    get events() {
        return this._eventEmitter.eee;
    }

    get rest() {
        return this._rest;
    }
}

module.exports = Core;
