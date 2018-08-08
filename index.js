"use strict";

var Core = require("./lib/Core");
var Error = require("./lib/common/Error");

/** 
 * @enum { String }
 * 
*/
var Type = {
    home: "home",
    work: "work",
    other: "other"
};

/** 
 * @enum { String }
 * 
*/
var DeviceType = {
    landline: "landline",
    mobile: "mobile",
    fax: "fax",
    other: "other"
};

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
 */
class NodeSDK {

    constructor(options) {
        process.on("uncaughtException", (err) => {
            console.error(err);
        });

        process.on("warning", (err) => {
            console.error(err);
        });

        process.on("unhandledRejection", (err, p) => {
            console.error(err);
        });

        this._core = new Core(options);
    }

    /**
     * @public
     * @method start
     * @instance
     * @description
     *    Start the SDK
     * @memberof NodeSDK
     */
    start() {
        var that = this;
        return new Promise(function(resolve, reject) {
            return that._core.start().then(function() {
                return that._core.signin(false);
            }).then(function(result) {
                resolve(result);
            }).catch(function(err) {
                var error = Error.UNAUTHORIZED;
                error.details = err;
                console.log("[index ] : rainbow_onrainbow_onconnectionerror : " , JSON.stringify(error));
                that.events.publish("rainbow_onconnectionerror", error);
                reject(error);
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
        var that = this;
        return new Promise(function(resolve, reject) {
            return that._core.start(true).then(function() {
                resolve();
            }).catch(function(err) {
                var error = Error.UNAUTHORIZED;
                error.details = err;
                that.events.publish("rainbow_onconnectionerror", error);
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
        var that = this;
        return new Promise(function(resolve, reject) {
            return that._core.signin(false).then(function(json) {
                resolve(json);
            }).catch(function(err) {
                var error = Error.UNAUTHORIZED;
                error.details = err;
                that.events.publish("rainbow_onconnectionerror", error);
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
        var that = this;
        return new Promise(function(resolve, reject) {
            return that._core.stop().then(function() {
                var success = Error.OK;
                that.events.publish("rainbow_onstopped", success);
                resolve();
            }).catch(function(err) {
                var error = Error.ERROR;
                error.details = err;
                that.events.publish("rainbow_onstopped", error);
                reject(error);
            });
        });
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
     * @property {Object} admin
     * @instance
     * @description
     *    Get access to the Admin module
     * @memberof NodeSDK
     */
    get telephony() {
        return this._core.telephony;
    }


}

module.exports = NodeSDK;