"use strict";

const DataStoreType = require("./lib/config/config").DataStoreType;

const Core = require("./lib/Core").Core;
const ErrorManager = require("./lib/common/ErrorManager").ErrorManager;
const utils = require( "./lib/common/Utils");

/**
 * @enum { String }
 *
*/
let Type = {
    home: "home",
    work: "work",
    other: "other"
};

/**
 * @enum { String }
 *
*/
let DeviceType = {
    landline: "landline",
    mobile: "mobile",
    fax: "fax",
    other: "other"
};

function uncaughtException(err) {
    console.error('Possibly uncaughtException err : ', err);
}
function warning(err) {
    console.error('Possibly unhandledRejection err : ', err);
}
function unhandledRejection(reason, p) {
    console.error('Possibly Unhandled Rejection at: Promise ', p, " reason: ", reason);
}

/**
 * @typedef {Object} Email
 * @property {String} email User email address
 * @property {Type} type Email type, one of home, work, other
 *

 /*
 * Phone number objects can
 * be created by user (information filled by user),
 * come from association with a system (pbx) device (association is done by admin).
 * @typedef {Object} PhoneNumber
 * @property {String} phoneNumberId Phone number unique id in directory collection.
 * @property {String} number User phone number (as entered by user)
 * @property {String} numberE164 User E.164 phone number, computed by server from number and country fields
 * @property {String} country Phone number country (ISO 3166-1 alpha3 format). Used to compute numberE164 field from number field.
 * @property {Boolean} isFromSystem Boolean indicating if phone is linked to a system (pbx).
 * @property {String} shortNumber [Only for phone numbers linked to a system (pbx)]
 * If phone is linked to a system (pbx), short phone number (corresponds to the number monitored by PCG).
 * Only usable within the same PBX.
 * Only PCG can set this field.
 * @property {String} internalNumber [Only for phone numbers linked to a system (pbx)]
 * If phone is linked to a system (pbx), internal phone number.
 * Usable within a PBX group.
 * Admins and users can modify this internalNumber field.
 * @property {String} systemId [Only for phone numbers linked to a system (pbx)]
 * If phone is linked to a system (pbx), unique identifier of that system in Rainbow database.
 * pbxId String [Only for phone numbers linked to a system (pbx)]
 * If phone is linked to a system (pbx), unique identifier of that pbx.
 * @property {Type} type Phone number type, one of home, work, other.
 * @property {DeviceType} deviceType Phone number device type, one of landline, mobile, fax, other.
 *

/*
 * @typedef {Object} ConnectedUser User corresponding to the logged in user
 * @property {String} id
 * @property {String} id User unique identifier
 * @property {String} loginEmail User email address (used for login)
 * @property {String} firstName User first name
 * @property {String} lastName User last name
 * @property {String} displayName User display name (firstName + lastName concatenated on server side)
 * @property {String} nickName User nickName
 * @property {String} title User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...)
 * @property {String} jobTitle User job title
 * @property {Email[]} emails Array of user emails addresses objects
 * @property {PhoneNumber[]} phoneNumbers Array of user phone numbers objects.
 * Phone number objects can
 * be created by user (information filled by user),
 * come from association with a system (pbx) device (association is done by admin).
 * @property {String} country User country (ISO 3166-1 alpha3 format)
 * @property {String} language User language (ISO 639-1 code format, with possibility of regional variation. Ex: both 'en' and 'en-US' are supported)
 * @property {String} timezone User timezone name
 * @property {String} jid_im User Jabber IM identifier
 * @property {String} jid_tel User Jabber TEL identifier
 * @property {String} jid_password User Jabber TEL identifier
 * @property {String[]} roles List of user roles (Array of String)
 * @property {String} adminType In case of user's is 'admin', define the subtype (organisation_admin, company_admin, site_admin (default undefined)
 * @property {String} companyId User company unique identifier
 * @property {String} organisationId In addition to User companyId, optional identifier to indicate the user belongs also to an organization
 * @property {String} siteId In addition to User companyId, optional identifier to indicate the user belongs also to a site
 * @property {String} companyName User company name
 * @property {Boolean} isInDefaultCompany Is user in default company
 * Only returned if retrieved user data corresponds to logged in user or if logged in user is admin of the retrieved user
 * @property {Boolean} isActive Is user active
 * @property {Boolean} isInitialized Is user initialized
 * @property {DateTime} initializationDate User initialization date
 * @property {DateTime} activationDate User activation date
 * @property {DateTime} creationDate User creation date
 * @property {DateTime} lastUpdateDate Date of last user update (whatever the field updated)
 * @property {DateTime} lastAvatarUpdateDate Date of last user avatar create/update, null if no avatar
 */

/**
 * @class
 * @name NodeSDK
 * @description
 *      This module is the core module of the Rainbow SDK for Node.JS <br>.
 *      It gives access to the other modules and allow to start/stop the SDK
 *      <br><br>
 *      The main methods proposed in that module allow to: <br>
 *      - Access to each module like Bubbles, Contacts...<br>
 *      - Access to Event module <br>
 *      - Start and stop the SDK <br>
 *      - Get the version number <br>
 *      - Get the SDK internal state
 *
 *      Warning: Before deploying in production a bot that can generate heavy traffic, please contact ALE.
 */
class NodeSDK {

    /**
     * @method constructor
     * @public
     * @description
     *      The entry point of the Rainbow Node SDK
     * @param {{rainbow: {host: string}, application: {appID: string, appSecret: string}, im: {sendReadReceipt: boolean, sendMessageToConnectedUser: boolean, conversationsRetrievedFormat: string, copyMessage: boolean, storeMessages: boolean, messageMaxLength: number}, credentials: {password: string, login: string}, logs: {file: {zippedArchive: boolean, path: string, customFileName: string}, color: boolean, level: string, "system-dev": {http: boolean, internals: boolean}, enableFileLogs: boolean, customLabel: string, enableConsoleLogs: boolean}, servicesToStart: {favorites: {start_up: boolean}, fileStorage: {start_up: boolean}, webrtc: {start_up: boolean, optional: boolean}, channels: {start_up: boolean}, calllog: {start_up: boolean}, telephony: {start_up: boolean}, admin: {start_up: boolean}, bubbles: {start_up: boolean}, fileServer: {start_up: boolean}}}} options : The options provided to manage the SDK behavior <br>
     *   "rainbow": {<br>
     *       "host": "official", // Can be "sandbox" (developer platform), "official" or any other hostname when using dedicated AIO<br>
     *       "mode": "xmpp" // The event mode used to receive the events. Can be `xmpp` or `s2s` (default : `xmpp`)
     *    },<br>
     *   "s2s": {
     *      "hostCallback": "http://3d260881.ngrok.io", // S2S Callback URL used to receive events on internet
     *      "locallistenningport": "4000" // Local port where the events must be forwarded from S2S Callback Web server.
    *    },
     *   "credentials": {<br>
     *       "login": "user@xxxx.xxx",  // The Rainbow email account to use<br>
     *       "password": "XXXXX",<br>
     *   },<br>
     *   // Application identifier<br>
     *   "application": {<br>
     *       "appID": "XXXXXXXXXXXXXXXXXXXXXXXXXXXX", // The Rainbow Application Identifier<br>
     *       "appSecret": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // The Rainbow Application Secret<br>
     *   },<br>
     *   // Proxy configuration<br>
     *   "proxy": {<br>
     *       "host": "xxx.xxx.xxx.xxx",<br>
     *       "port": xxxx,<br>
     *       "protocol": "http",<br>
     *       "user": "proxyuser",<br>
     *       "password": "XXXXX",<br>
     *   },<br>
     *   // Logs options<br>
     *   "logs": {<br>
     *       "enableConsoleLogs": false, Activate logs on the console<br>
     *       "enableFileLogs": false, Activate the logs in a file<br>
     *       "color": true, Activate the ansii color in the log (more humain readable, but need a term console or reader compatible (ex : vim + AnsiEsc module)) <br>
     *       "level": "info", The level of logs. The value can be "info", "debug", "warn", "error"<br>
     *       "customLabel": "MyRBProject", A label inserted in every lines of the logs. It is usefull if you use multiple SDK instances at a same time. It allows to separate logs in console.<br>
     *       "file": {<br>
     *           "path": "c:/temp/", Path to the log file<br>
     *           "customFileName": "R-SDK-Node-MyRBProject", A label inserted in the name of the log file<br>
     *           "zippedArchive": false Can activate a zip of file. It needs CPU process, so avoid it.<br>
     *       }<br>
     *   },<br>
     *   "testOutdatedVersion": true, Parameter to verify at startup if the current SDK Version is the lastest published on npmjs.com.<br>
     *   // IM options<br>
     *   "im": {<br>
     *       "sendReadReceipt": true, Allow to automatically send back a 'read' status of the received message. Usefull for Bots.<br>
     *       "messageMaxLength": 1024, Maximum size of messages send by rainbow. Note that this value should not be modified without ALE Agreement.<br>
     *       "sendMessageToConnectedUser": false, Forbid the SDK to send a message to the connected user it self. This is to avoid bot loopback.<br>
     *       "conversationsRetrievedFormat": "small", Set the size of the conversation's content retrieved from server. Can be `small`, `medium`, `full`<br>
     *       @deprecated "storeMessages": false, Tell the server to store the message for delay distribution and also for history. Please avoid to set it to true for a bot which will not read anymore the messages. It is a better way to store it in your own CPaaS application<br>
     *       "nbMaxConversations": 15, Parameter to set the maximum number of conversations to keep (defaut value to 15). Old ones are remove from XMPP server with the new method `ConversationsService::removeOlderConversations`.<br>
     *       "rateLimitPerHour": 1000, Parameter to set the maximum of "message" stanza sent to server by hour. Default value is 1000.<br>
     *       "messagesDataStore": Parameter to override the storeMessages parameter of the SDK to define the behaviour of the storage of the messages (Enum DataStoreType in lib/config/config , default value "DataStoreType.UsestoreMessagesField" so it follows the storeMessages behaviour)<br>
     *                          DataStoreType.NoStore Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.<br>
     *                          DataStoreType.NoPermanentStore Tell the server to NOT store the messages for history of the bot and the contact. But being stored temporarily as a normal part of delivery (e.g. if the recipient is offline at the time of sending).<br>
     *                          DataStoreType.StoreTwinSide The messages are fully stored.<br>
     *                          DataStoreType.UsestoreMessagesField to follow the storeMessages SDK's parameter behaviour.<br>
     *   },<br>
     *   // Services to start. This allows to start the SDK with restricted number of services, so there are less call to API.<br>
     *   // Take care, severals services are linked, so disabling a service can disturb an other one.<br>
     *   // By default all the services are started. Events received from server are not yet filtered.<br>
     *   // So this feature is realy risky, and should be used with much more cautions.<br>
     *   "servicesToStart": {<br>
     *       "bubbles": {<br>
     *           "start_up": true,<br>
     *       },<br>
     *       "telephony": {<br>
     *           "start_up": true,<br>
     *       },<br>
     *       "channels": {<br>
     *           "start_up": true,<br>
     *       },<br>
     *       "admin": {<br>
     *           "start_up": true,<br>
     *       },<br>
     *       "fileServer": {<br>
     *           "start_up": true,<br>
     *       },<br>
     *       "fileStorage": {<br>
     *           start_up: true,<br>
     *       },<br>
     *       "calllog": {<br>
     *           "start_up": true,<br>
     *       },<br>
     *       "favorites": {<br>
     *           "start_up": true,<br>
     *       }<br>
     *   }<br>
     * }<br>
     */
    constructor(options) {
        /*
             *       @ deprecated "storeMessages": false, Tell the server to store the message for delay distribution and also for history. Please avoid to set it to true for a bot which will not read anymore the messages. It is a better way to store it in your own CPaaS application<br>
     *       "nbMaxConversations": 15, Parameter to set the maximum number of conversations to keep (defaut value to 15). Old ones are remove from XMPP server with the new method `ConversationsService::removeOlderConversations`.
     *       "rateLimitPerHour": 1000, Parameter to set the maximum of "message" stanza sent to server by hour. Default value is 1000.
     *       "messagesDataStore": DataStoreType.NoStoreBotSide, Parameter to define the behaviour of the storage of the messages (Enum DataStoreType in lib/config/config , default value "DataStoreType.NoStoreBotSide")
     *                          DataStoreType.NoStore Same behaviour as previously `storeMessages=false` Tell the server to NOT store the messages for delay distribution or for history of the bot and the contact.
     *                          DataStoreType.NoStoreBotSide The messages are not stored on  loggued-in Bot's history, but are stored on the other side. So the contact kept the messages exchanged with bot in his history.
     *                          DataStoreType.StoreTwinSide The messages are fully stored.

         */
        /* process.on("uncaughtException", (err) => {
            console.error(err);
        });

        process.on("warning", (err) => {
            console.error(err);
        });

        process.on("unhandledRejection", (err, p) => {
            console.error(err);
        }); // */
        process.removeListener("unhandledRejection", unhandledRejection);
        process.removeListener("warning", warning);
        process.removeListener("uncaughtException", uncaughtException);

        process.on("unhandledRejection", unhandledRejection);
        process.on("warning", warning);
        process.on("uncaughtException", uncaughtException);

        // Stop the SDK if the node exe receiv a signal to stop, except for sigkill.
        process.removeListener("SIGINT", this.stopProcess());
        process.removeListener("SIGQUIT", this.stopProcess());
        process.removeListener("SIGTERM", this.stopProcess());
        process.on("SIGINT", this.stopProcess());
        process.on("SIGQUIT", this.stopProcess());
        process.on("SIGTERM", this.stopProcess());
        //process.on("SIGUSR2", that.stopProcess());

        this._core = new Core(options);
    }

    /**
     * @public
     * @method start
     * @instance
     * @param {String} token a valid token to login without login/password.
     * @description
     *    Start the SDK
     *    Note :
     *    The token must be empty to signin with credentials.
     *    The SDK is disconnected when the renew of the token had expired (No initial signin possible with out credentials.)
     * @memberof NodeSDK
     */
    start(token) {
        let that = this;
        that.startTime = new Date();
        return new Promise(function(resolve, reject) {
            return that._core.start( token).then(function() {
                return that._core.signin(false, token);
            }).then(function(result) {
                let startDuration = Math.round(new Date() - that.startTime);
                if (!result) {result = {};}
                result.startDuration = startDuration;
                resolve(result);
            }).catch(function(err) {
                if (err) {
                    console.log("[index ] : rainbow_onconnectionerror : ", JSON.stringify(err));
                    that.events.publish("connectionerror", err);
                    reject(err);
                } else {
                    let error = ErrorManager.getErrorManager().UNAUTHORIZED;
                    error.details = err;
                    console.log("[index ] : rainbow_onconnectionerror : ", JSON.stringify(error));
                    that.events.publish("connectionerror", error);
                    reject(error);
                }
            });
        });
    }

    /**
     * @private
     * @method startCLI
     * @instance
     * @description
     *      Start the SDK in CLI mode
     * @memberof NodeSDK
     */
    startCLI() {
        let that = this;
        return new Promise(function(resolve, reject) {
            return that._core.start(true).then(function() {
                resolve();
            }).catch(function(err) {
                let error = ErrorManager.getErrorManager().UNAUTHORIZED;
                error.details = err;
                that.events.publish("connectionerror", error);
                reject(error);
            });
        });
    }

    /**
     * @private
     * @method siginCLI
     * @instance
     * @description
     *      Sign-in in CLI
     * @memberof NodeSDK
     */
    signinCLI() {
        let that = this;
        return new Promise(function(resolve, reject) {
            return that._core.signin(false).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                let error = ErrorManager.getErrorManager().UNAUTHORIZED;
                error.details = err;
                that.events.publish("connectionerror", error);
                reject(error);
            });
        });
    }

    /**
     * @public
     * @method stop
     * @instance
     * @description
     *    Stop the SDK
     * @memberof NodeSDK
     */
    stop() {
        let that = this;
        return new Promise(function(resolve, reject) {
            return that._core.stop().then(function(result) {
                //let success = ErrorManager.getErrorManager().OK;
                utils.setTimeoutPromised(1500).then( () => {
                    //that._core._stateManager.stop();
                    //that.events.publish("stopped", success);
                    resolve(result);
                });
            }).catch(function(err) {
                let error = ErrorManager.getErrorManager().ERROR;
                error.details = err;
                that.events.publish("stopped", error);
                reject(error);
            });
        });
    }

    stopProcess() {
        let self = this;
        return async () => {
            try {
                // console.log("stopProcess");
                await self.stop().catch((ee)=>{
                    console.log("stopProcess, stop failed : ", ee);
                });
                await utils.setTimeoutPromised(1000);
                // eslint-disable-next-line no-process-exit
            }
            catch (e) {
                console.log("stopProcess, CATCH Error !!! stop failed : ", e);
            }
            process.exit(0);
        };
    }

    /**
     * @public
     * @property {Object} im
     * @instance
     * @description
     *    Get access to the IM module
     * @memberof NodeSDK
     */
    get im() {
        return this._core.im;
    }

    /**
     * @public
     * @property {Object} channels
     * @instance
     * @description
     *    Get access to the Channels module
     * @memberof NodeSDK
     */
    get channels() {
        return this._core.channels;
    }

    /**
     * @public
     * @property {Object} contacts
     * @instance
     * @description
     *    Get access to the Contacts module
     * @memberof NodeSDK
     */
    get contacts() {
        return this._core.contacts;
    }

    /**
     * @public
     * @property {Object} conversations
     * @instance
     * @description
     *    Get access to the Conversations module
     * @memberof NodeSDK
     */
    get conversations() {
        return this._core.conversations;
    }

    /**
     * @public
     * @property {Object} presence
     * @instance
     * @description
     *    Get access to the Presence module
     * @memberof NodeSDK
     */
    get presence() {
        return this._core.presence;
    }

    /**
     * @public
     * @property {Object} bubbles
     * @instance
     * @description
     *    Get access to the Bubbles module
     * @memberof NodeSDK
     */
    get bubbles() {
        return this._core.bubbles;
    }

    /**
     * @public
     * @property {Object} groups
     * @instance
     * @description
     *    Get access to the Groups module
     * @memberof NodeSDK
     */
    get groups() {
        return this._core.groups;
    }

    /**
     * @public
     * @property {Object} events
     * @instance
     * @description
     *    Get access to the Events module
     * @memberof NodeSDK
     */
    get events() {
        return this._core.events;
    }

    /**
     * @private
     * @property {Object} fileServer
     * @instance
     * @description
     *    Get access to the File Server module
     * @memberof NodeSDK
     */
    get fileServer() {
        return this._core.fileServer;
    }

    /**
     * @private
     * @property {Object} fileStorage
     * @instance
     * @description
     *    Get access to the File Storage module
     * @memberof NodeSDK
     */
    get fileStorage() {
        return this._core.fileStorage;
    }

    /**
     * @public
     * @property {Object} admin
     * @instance
     * @description
     *    Get access to the Admin module
     * @memberof NodeSDK
     */
    get admin() {
        return this._core.admin;
    }

    /**
     * @private
     * @property {Object} rest
     * @instance
     * @description
     *    Get access to the REST module
     * @memberof NodeSDK
     */
    get rest() {
        return this._core.rest;
    }

    /**
     * @public
     * @property {Object} settings
     * @instance
     * @description
     *    Get access to the Settings module
     * @memberof NodeSDK
     */
    get settings() {
        return this._core.settings;
    }

    /**
     * @public
     * @property {String} state
     * @instance
     * @description
     *    Return the state of the SDK (eg: STOPPED, STARTED, CONNECTED, READY, DISCONNECTED, RECONNECTING, FAILED, ERROR)
     * @memberof NodeSDK
     */
    get state() {
        return this._core.state;
    }

    /**
     * @public
     * @property {String} version
     * @instance
     * @description
     *      Return the version of the SDK
     * @memberof NodeSDK
     */
    get version() {
        return this._core.version;
    }

    /**
     * @public
     * @property {ConnectedUser} connectedUser
     * @instance
     * @description
     *      Return the connected user information
     * @memberof NodeSDK
     */
    get connectedUser() {
        return this._core.rest.account;
    }

    /**
     * @public
     * @property {Object} telephony
     * @instance
     * @description
     *    Get access to the telephony module
     * @memberof NodeSDK
     */
    get telephony() {
        return this._core.telephony;
    }

    /**
     * @public
     * @property {Object} calllog
     * @instance
     * @description
     *    Get access to the calllog module
     * @memberof NodeSDK
     */
    get calllog() {
        return this._core.calllog;
    }

    /**
     * @public
     * @property {Object} favorites
     * @instance
     * @description
     *    Get access to the favorite module
     * @memberof NodeSDK
     */
    get favorites() {
        return this._core._favorites;
    }

    /**
     * @public
     * @property {Object} invitations
     * @instance
     * @description
     *    Get access to the invitation module
     * @memberof NodeSDK
     */
    get invitations() {
        return this._core._invitations;
    }

    /**
     * @public
     * @property {Object} s2s
     * @instance
     * @description
     *    Get access to the s2s module
     * @memberof NodeSDK
     */
    get s2s() {
        return this._core._s2s;
    }

    get DataStoreType() {
        return DataStoreType;
    }

}

module.exports = NodeSDK;
