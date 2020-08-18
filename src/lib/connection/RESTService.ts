"use strict";

import * as jwt from "jwt-decode";
import * as btoa from "btoa";
import * as CryptoJS from "crypto-js";

import * as backoff from "backoff";

import {logEntryExit, makeId} from "../common/Utils.js";
import {createPassword} from "../common/Utils.js";

import  {RESTTelephony} from "./RestServices/RESTTelephony";
import {HTTPService} from "./HttpService";
import {Invitation} from "../common/models/Invitation";
import {Contact} from "../common/models/Contact";
import EventEmitter = NodeJS.EventEmitter;
import {Logger} from "../common/Logger";
import {error} from "winston";
import {ROOMROLE} from "../services/S2SService";


let packageVersion = require("../../package.json");

const RECONNECT_INITIAL_DELAY = 2000;
const RECONNECT_MAX_DELAY = 60000;

/*
var getRequestHeader;
var getRequestHeaderWithRange;
var getLoginHeader;
var getDefaultHeader;
// */

const LOG_ID = "REST - ";


enum MEDIATYPE {
    WEBRTC= "webrtc",
    PstnAudio= "pstnAudio",
    WEBRTCSHARINGONLY= "webrtcSharingOnly"
}

class GuestParams {
    public loginEmail: string; //    User email address (used for login). Must be unique (409 error is returned if a user already exists with the same email address).
    public password: string; // User password.  Rules: more than 8 characters, at least 1 capital letter, 1 number, 1 special character.
    public temporaryToken: string;   // User temporary token (obtained from POST /api/rainbow/enduser/v1.0/notifications/emails/self-register API) (do not use if invitationId, joinCompanyInvitationId, joinCompanyLinkId or openInviteId is specified).

    public invitationId: string; //User invitation unique identifier (like 569ce8c8f9336c471b98eda4) (obtained from POST /api/rainbow/enduser/v1.0/users/:userId/invitations API) (do not use if temporaryToken, joinCompanyInvitationId, joinCompanyLinkId or openInviteId is specified).
    public joinCompanyInvitationId: string; // Join company invitation unique identifier (like 5819ed7c9547b313509237d6) (obtained from POST /api/rainbow/admin/v1.0/companies/:companyId/join-companies/invitations API) (do not use if temporaryToken, invitationId, joinCompanyLinkId or openInviteId is specified).
    public joinCompanyLinkId: string; // Join company link unique identifier (like 12d9413a316649019459cd4ae68bb75f) (obtained from POST /api/rainbow/admin/v1.0/companies/:companyId/join-companies/links API) (do not use if temporaryToken, invitationId, joinCompanyInvitationId or openInviteId is specified).
    /*
        Some explanations about this use case:

            joinCompanyLinkId used must correspond to an existing joinCompanyLink.
        The corresponding joinCompanyLink must be enabled (isEnabled=true),
        If expirationDate is set for the corresponding joinCompanyLink, it must not be expired (expirationDate > current date),
        If maxNumberUsers is set for the corresponding joinCompanyLink, it must not have been used by as many users to register their account in the related company (maxNumberUsers > nbUsersRegistered).
    // */
    public openInviteId: string; // A Rainbow user is sharing with co-workers an unique URL to join a meeting. This URL is used by somebody not yet a Rainbow user (doesn't have a Rainbow account).
    /*
        Some explanations about this use case:

            Each user has a personal UUID.
        In the api documentation, this UUID is called openInviteId. It can be generated on demand.
        The public URL is based on this openInviteId (ex: https://web.openrainbow.com/#/invite?invitationId=0fc06e0ce4a849fcbe214ae5e1107417&scenario=public-url)
            Refer to /api/rainbow/enduser/v1.0/users/:userId/open-invites/xxxx API(s) to manage the openInviteId
    // */
    public isInitialized: boolean; // Is user initialized. default value : false
    public firstName: string; // User first name
    public lastName: string; // User last name
    public nickName: string; // User nickName
    public title: string; // User title (honorifics title, like Mr, Mrs, Sir, Lord, Lady, Dr, Prof,...)
    public jobTitle: string; // User job title
    public department: string; // User department
    public emails: {
        email: string, // User email address
        type: string  // User email type. Authorized values : home, work, other
    }; //  Array of user emails addresses objects
    public phoneNumbers: Array<{
        number: string, // User phone number (as entered by user)
        country: string,  /* Phone number country (ISO 3166-1 alpha3 format).  country field is automatically computed using the following algorithm when creating/updating a phoneNumber entry:
        If number is provided and is in E164 format, country is computed from E164 number
    Else if country field is provided in the phoneNumber entry, this one is used
    Else user country field is used Note that in the case number field is set (but not in E164 format), associated numberE164 field is computed using phoneNumber'country field. So, number and country field must match so that numberE164 can be computed.
// */
        type: string, // Phone number type. Authorized values : home, work, other
        deviceType: string, // Phone number device type. Authorized values : landline, mobile, fax, other
        isVisibleByOthers: boolean  /*

    Allow user to choose if the phone number is visible by other users or not.
    Note that administrators can see all the phone numbers, even if isVisibleByOthers is set to false.
    Note that phone numbers linked to a system (isFromSystem=true) are always visible, isVisibleByOthers can't be set to false for these numbers.

    default value : true
    // */
    }>; // Array of user phone numbers objects
    /*
        Note: For each provided phoneNumber Object containing number field, the server tries to compute the associated E.164 number (numberE164 field) if number is not in E164 format using provided PhoneNumber country if available, user country otherwise. If numberE164 can't be computed, an error 400 is returned (ex: wrong phone number, phone number not matching country code, ...)

     // */
    public country: string; // User country (ISO 3166-1 alpha3 format)
    public state: string; // When country is 'USA' or 'CAN', a state can be defined. Else it is not managed (null).
    /*
    List of allowed states for USA:
        AA: "Armed Forces America", AE: "Armed Forces", AP: "Armed Forces Pacific", AK: "Alaska", AL: "Alabama", AR: "Arkansas", AZ: "Arizona", CA: "California", CO: "Colorado", CT: "Connecticut", DC: Washington DC", DE: "Delaware", FL: "Florida", GA: "Georgia", GU: "Guam", HI: "Hawaii", IA: "Iowa", ID: "Idaho", IL: "Illinois", IN: "Indiana", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", MA: "Massachusetts", MD: "Maryland", ME: "Maine", MI: "Michigan", MN: "Minnesota", MO: "Missouri", MS: "Mississippi", MT: "Montana", NC: "North Carolina",
    ND: "North Dakota", NE: "Nebraska", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NV: "Nevada", NY: "New York", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", PR: "Puerto Rico", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VA: "Virginia", VI: "Virgin Islands", VT: "Vermont", WA: "Washington", WI: "Wisconsin", WV: "West Virginia", WY: "Wyoming" List of allowed states for CAN: AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick",
    NL: "Newfoundland and Labrador", NS: "Nova Scotia", NT: "Northwest Territories", NU: "Nunavut", ON: "Ontario", PE: "Prince Edward Island", QC: "Quebec", SK: "Saskatchewan", YT: "Yukon"
    // */
    public language: string; // User language
    /*
        Language format is composed of locale using format ISO 639-1, with optionally the regional variation using ISO 3166‑1 alpha-2 (separated by hyphen).
        Locale part is in lowercase, regional part is in uppercase. Examples: en, en-US, fr, fr-FR, fr-CA, es-ES, es-MX, ...
        More information about the format can be found on this link.
        // */
    public timezone: string; // User timezone name
    /*
        Allowed values: one of the timezone names defined in IANA tz database
        Timezone name are composed as follow: Area/Location (ex: Europe/Paris, America/New_York,...)
        // */
    public visibility: string; // User visibility.  Define if the user can be searched by users being in other company and if the user can search users being in other companies.
    /* // Visibility can be:

        same_than_company: The same visibility than the user's company's is applied to the user. When this user visibility is used, if the visibility of the company is changed the user's visibility will use this company new visibility.
    public: User can be searched by external users / can search external users. User can invite external users / can be invited by external users
    private: User can't be searched by external users / can search external users. User can invite external users / can be invited by external users
    closed: User can't be searched by external users / can't search external users. User can invite external users / can be invited by external users
    isolated: User can't be searched by external users / can't search external users. User can't invite external users / can't be invited by external users
    none: Default value reserved for guest. User can't be searched by any users (even within the same company) / can search external users. User can invite external users / can be invited by external users External users mean 'public user not being in user's company nor user's organisation nor a company visible by user's company.

    default value : same_than_company
    authorized value : same_than_company, public, private, closed, isolated, none
    // */

    public customData: {
        key1: string, // User's custom data key1.
        key2: string, /* Company's custom data key2.
    customData can only be created/updated by:

        the user himself,
    company_admin or organization_admin of his company,
    bp_admin and bp_finance of his company,
    superadmin. Restrictions on customData Object:
        max 10 keys,
    max key length: 64 characters,
    max value length: 512 characters. It is up to the client to manage the user's customData (new customData provided overwrite the existing one).
    // */
    } //     User's custom data.

    constructor(
        _loginEmail: string = null,
        _password: string= null,
        _temporaryToken: string= null,
        _invitationId: string= null,
        _joinCompanyInvitationId: string= null,
        _joinCompanyLinkId: string= null,
        _openInviteId: string= null,
        _isInitialized: boolean= null,
        _firstName: string= null,
        _lastName: string= null,
        _nickName: string= null,
        _title: string= null,
        _jobTitle: string= null,
        _department: string= null,
        _emails: {
            email: string,
            type: string
        }= null,
        _phoneNumbers: Array<any>= null,
        _country: string= null,
        _state: string= null,
        _language: string= null,
        _timezone: string= null,
        _visibility: string= null,
        _customData: any= null
    ) {
    let that = this;
        that.loginEmail = _loginEmail;
        that.password = _password;
        that.temporaryToken = _temporaryToken;
        that.invitationId = _invitationId;
        that.joinCompanyInvitationId = _joinCompanyInvitationId;
        that.joinCompanyLinkId = _joinCompanyLinkId;
        that.openInviteId = _openInviteId;
        that.isInitialized = _isInitialized;
        that.firstName = _firstName;
        that.lastName = _lastName;
        that.nickName = _nickName;
        that.title = _title;
        that.jobTitle = _jobTitle;
        that.department = _department;
        that.emails = _emails;
        that.phoneNumbers = _phoneNumbers;
        that.country = _country;
        that.state = _state;
        that.language = _language;
        that.timezone = _timezone;
        that.visibility = _visibility;
        that.customData = _customData;
    }

    getUrlParam () {
        let that = this;
        let param: any = {};
        if (that.loginEmail) {
            param.loginEmail = that.loginEmail;
        }
        if (that.password) {
            param.password = that.password;
        }
        if (that.temporaryToken) {
            param.temporaryToken = that.temporaryToken;
        }
        if (that.invitationId) {
            param.invitationId = that.invitationId;
        }
        if (that.joinCompanyInvitationId) {
            param.joinCompanyInvitationId = that.joinCompanyInvitationId;
        }
        if (that.joinCompanyLinkId) {
            param.joinCompanyLinkId = that.joinCompanyLinkId;
        }
        if (that.openInviteId) {
            param.openInviteId = that.openInviteId;
        }
        if (that.isInitialized) {
            param.isInitialized = that.isInitialized;
        }
        if (that.firstName) {
            param.firstName = that.firstName;
        }
        if (that.lastName) {
            param.lastName = that.lastName;
        }
        if (that.nickName) {
            param.nickName = that.nickName;
        }
        if (that.title) {
            param.title = that.title;
        }
        if (that.jobTitle) {
            param.jobTitle = that.jobTitle;
        }
        if (that.department) {
            param.department = that.department;
        }
        if (that.emails) {
            param.emails = that.emails;
        }
        if (that.phoneNumbers) {
            param.phoneNumbers = that.phoneNumbers;
        }
        if (that.country) {
            param.country = that.country;
        }
        if (that.state) {
            param.state = that.state;
        }
        if (that.language) {
            param.language = that.language;
        }
        if (that.timezone) {
            param.timezone = that.timezone;
        }
        if (that.visibility) {
            param.visibility = that.visibility;
        }
        if (that.customData) {
            param.customData = that.customData;
        }

        return param
    }

}

@logEntryExit(LOG_ID)
class RESTService {
    public http: HTTPService;
    public account: any;
    public app: any;
    public token: any;
    public renewTokenInterval: any;
    public auth: any;
    public _credentials: any;
    public _application: any;
    public loginEmail: any;
    public eventEmitter: EventEmitter;
    public logger: Logger;
    public currentAttempt: any;
    public attempt_succeeded_callback: any;
    public attempt_failed_callback: any;
    public attempt_promise_resolver: any;
    public _isOfficialRainbow: any;
    public maxAttemptToReconnect: any;
    public fibonacciStrategy: any;
    public reconnectDelay: any;
    public restTelephony: RESTTelephony;
    public getRequestHeader: any;
    public getRequestHeaderWithRange: any;
    public getPostHeaderWithRange: any;
    public getLoginHeader: any;
    public getDefaultHeader: any;
    public applicationToken: string;
    public getPostHeader: any;
    public connectionS2SInfo: any;
    private reconnectInProgress: boolean;

    constructor(_credentials, _application, _isOfficialRainbow, evtEmitter: EventEmitter, _logger: Logger) {
        let that = this;
        let self = this;
        this.http = null;
        this.account = null;
        this.app = null;
        this.token = null;
        this.renewTokenInterval = null;
        this.auth = btoa(_credentials.login + ":" + _credentials.password);
        this._credentials = _credentials;
        this._application = _application;
        this.loginEmail = _credentials.login;
        this.eventEmitter = evtEmitter;
        this.logger = _logger;

        this.currentAttempt = 0;
        this.attempt_succeeded_callback = undefined;
        this.attempt_failed_callback = undefined;
        this.attempt_promise_resolver = {resolve: undefined, reject: undefined};
        this.reconnectInProgress = false;

        this._isOfficialRainbow = _isOfficialRainbow;

        this.maxAttemptToReconnect = 50;

        this.fibonacciStrategy = new backoff.FibonacciStrategy({
            randomisationFactor: 0.4,
            initialDelay: RECONNECT_INITIAL_DELAY,
            maxDelay: RECONNECT_MAX_DELAY
        });
        this.reconnectDelay = this.fibonacciStrategy.getInitialDelay();

        this.restTelephony = new RESTTelephony(evtEmitter, _logger);

        this.getRequestHeader = (accept) => {
            let headers = {
                "Authorization": "Bearer " + that.token,
                "Accept": accept || "application/json",
            };

            return headers;
        };

        this.getRequestHeaderWithRange = (accept, range) => {
            let header = this.getRequestHeader(accept);
            header.Range = range;
            return header;
        };

        this.getPostHeader = (contentType) => {
            let header = this.getRequestHeader();
            let type = contentType || "application/json";
            header["Content-Type"] = type;
            return header;
        };

        this.getPostHeaderWithRange = (accept, initialSize, minRange, maxRange) => {
            let header = this.getRequestHeader(accept);
            // Content-Range: bytes 0-1048575/2960156
            //header["Content-Range"] = "bytes " + minRange + "-" + maxRange + "/" + initialSize;
            return header;
        };

        this.getLoginHeader = (auth, password) => {
            let headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Basic " + (auth || that.auth),
                "x-rainbow-client": "sdk_node",
                "x-rainbow-client-version": packageVersion.version
            };

            let toEncrypt = that._application.appSecret + (password || that._credentials.password);
            //that.logger.log("debug", LOG_ID + "toEncrypt : " + toEncrypt);
            let encrypted = CryptoJS.SHA256(toEncrypt).toString();
            //that.logger.log("debug", LOG_ID + "encrypted : " + encrypted);
            let base64 = btoa(that._application.appID + ':' + encrypted);
            //that.logger.log("debug", LOG_ID + "base64 : " + base64);

            if (that._application.appSecret && base64 && base64.length) {
                headers["x-rainbow-app-auth"] = "Basic " + base64 || "";
            }

            return headers;
        };

        this.getDefaultHeader = () => {
            return {
                "Accept": "application/json",
                "Content-Type": "application/json"
            };
        };
    }

    get userId() {
        return this.account ? this.account.id : "";
    }

    get loggedInUser() {
        return this.account;
    }

    start(http) {
        let that = this;
        that.http = http;
        return that.restTelephony.start(that.http).then(() => {
            that.logger.log("internal", LOG_ID + "(start) email used", that.loginEmail);
        });
    }

    stop() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.signout().then(() => {
                that.logger.log("debug", LOG_ID + "(stop) Successfully stopped");
                resolve();
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    async signin(token) {
        let that = this;

        // Login by the token provided in parameter.
        if (token) {
            try {
                that.logger.log("internal", LOG_ID + "(signin) with token : ", token, " : ", that.getLoginHeader());
                let decodedtoken = jwt(token);
                let JSON = {
                    "loggedInUser": decodedtoken.user,
                    "loggedInApplication": decodedtoken.app,
                    "token": token
                };
                that.account = JSON.loggedInUser;
                that.app = JSON.loggedInApplication;
                that.token = JSON.token;

                let loggedInUser = await that.getContactInformationByLoginEmail(decodedtoken.user.loginEmail).then(async (contactsFromServeur: [any]) => {
                    if (contactsFromServeur && contactsFromServeur.length > 0) {
                        let contact: Contact = null;
                        that.logger.log("info", LOG_ID + "(signin) contact found on server, get full infos.");
                        let _contactFromServer = contactsFromServeur[0];
                        if (_contactFromServer) {
                            // The contact is not found by email in the that.contacts tab, so it need to be find on server to get or update it.
                            return await that.getContactInformationByID(_contactFromServer.id).then((_contactInformation: any) => {
                                that.logger.log("internal", LOG_ID + "(signin) contact full infos : ", _contactInformation);
                                return _contactInformation;
                            });
                        }
                    }
                });
                that.account = JSON.loggedInUser = loggedInUser;
                that.logger.log("debug", LOG_ID + "(signin) token signin, welcome " + that.account.id + "!");
                that.logger.log("internal", LOG_ID + "(signin) user information ", that.account);
                that.logger.log("internal", LOG_ID + "(signin) application information : ", that.app);
                return Promise.resolve(JSON);
            } catch (err) {
                that.logger.log("debug", LOG_ID + "(signin) CATCH Error !!! error : ", err);
                return Promise.reject(err);
            }
        }
        // If no token is provided, then signin with user/pwd credentials.
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/authentication/v1.0/login", that.getLoginHeader(), undefined).then(function (JSON) {
                that.account = JSON.loggedInUser;
                that.app = JSON.loggedInApplication;
                that.token = JSON.token;
                that.logger.log("internal", LOG_ID + "(signin) welcome " + that.account.displayName + "!");
                //that.logger.log("debug", LOG_ID + "(signin) user information ", that.account);
                that.logger.log("internal", LOG_ID + "(signin) application information : ", that.app);
                resolve(JSON);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(signin) ErrorManager during REST signin");
                that.logger.log("internalerror", LOG_ID, "(signin) ErrorManager during REST signin : ", err);
                return reject(err);
            });
        });
    }

    setconnectionS2SInfo(_connectionS2SInfo) {
        this.connectionS2SInfo = _connectionS2SInfo;
    }

    askTokenOnBehalf(loginEmail, password) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let auth = btoa(loginEmail + ":" + password);

            that.http.get("/api/rainbow/authentication/v1.0/login", that.getLoginHeader(auth, password), undefined).then(function (JSON) {
                that.logger.log("internal", LOG_ID + "(askTokenOnBehalf) successfully received token for ", JSON.loggedInUser.id, " !");
                resolve(JSON);
            })
                .catch(function (err) {
                    that.logger.log("error", LOG_ID, "(askTokenOnBehalf) Error requesting a token");
                    that.logger.log("internalerror", LOG_ID, "(askTokenOnBehalf) Error requesting a token : ", err);
                    return reject(err);
                });
        });
    }

    signout() {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (that.http) {
                that.http.get("/api/rainbow/authentication/v1.0/logout", that.getRequestHeader(), undefined).then(function (JSON) {
                    that.account = null;
                    that.token = null;
                    that.renewTokenInterval = null;
                    that.logger.log("info", LOG_ID + "(signout) Successfully signed-out!");
                    resolve(JSON);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "error at signout");
                    that.logger.log("internalerror", LOG_ID, "error at signout : ", err);
                    return reject(err);
                });
            } else {
                that.logger.log("warn", LOG_ID + "(signout) seems to be already signed-out!");
                resolve(null);
            }
        });
    }

    startTokenSurvey() {

        let that = this;

        let decodedToken = jwt(that.token);
        that.logger.log("debug", LOG_ID + "(startTokenSurvey) - token");
        that.logger.log("info", LOG_ID + "(startTokenSurvey) - token, exp : ", decodedToken.exp, ", iat : ", decodedToken.iat);
        that.logger.log("internal", LOG_ID + "(startTokenSurvey) - token, decodedToken : ", decodedToken);
        let halfExpirationDate = (decodedToken.exp - decodedToken.iat) / 2 + decodedToken.iat;
        let tokenExpirationTimestamp = halfExpirationDate * 1000;
        let expirationDate = new Date(tokenExpirationTimestamp);
        let currentDate = new Date();
        let currentTimestamp = currentDate.valueOf();
        let tokenExpirationDuration = tokenExpirationTimestamp - currentTimestamp;

        if (tokenExpirationDuration < 0) {
            that.logger.log("warn", LOG_ID + "(startTokenSurvey) auth token has already expired, re-new it immediately");
            that._renewAuthToken();
        } else if (tokenExpirationDuration < 300000) {
            that.logger.log("warn", LOG_ID + "(startTokenSurvey) auth token will expire in less 5 minutes, re-new it immediately");
            that._renewAuthToken();
        } else {
            let usedExpirationDuration = tokenExpirationDuration - 3600000; // Refresh 1 hour before the token expiration - negative values are well treated by settimeout
            that.logger.log("info", LOG_ID + "(startTokenSurvey) start token survey (expirationDate: " + expirationDate + " currentDate:" + currentDate + " tokenExpirationDuration: " + tokenExpirationDuration + "ms usedExpirationDuration: " + usedExpirationDuration + "ms)");
            if (that.renewTokenInterval) {
                that.logger.log("info", LOG_ID + "(startTokenSurvey) remove timer");
                clearTimeout(that.renewTokenInterval);
            }
            that.logger.log("info", LOG_ID + "(startTokenSurvey) start a new timer for renewing token in ", usedExpirationDuration, " ms");
            that.renewTokenInterval = setTimeout(function () {
                that._renewAuthToken();
            }, usedExpirationDuration);
        }
    }

    _renewAuthToken() {
        let that = this;
        that.http.get("/api/rainbow/authentication/v1.0/renew", that.getRequestHeader(), undefined).then(function (JSON) {
            that.logger.log("info", LOG_ID + "(_renewAuthToken) renew authentication token success");
            that.token = JSON.token;
            that.logger.log("internal", LOG_ID + "(_renewAuthToken) new token received", that.token);
            that.eventEmitter.emit("rainbow_tokenrenewed");
        }).catch(function (err) {
            that.logger.log("error", LOG_ID, "(_renewAuthToken) renew authentication token failure");
            that.logger.log("internalerror", LOG_ID, "(_renewAuthToken) renew authentication token failure : ", err);
            clearTimeout(that.renewTokenInterval);
            that.renewTokenInterval = null;
            that.eventEmitter.emit("rainbow_tokenexpired");
        });
    }

    // Contacts API

    getContacts() {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/enduser/v1.0/users/networks?format=full", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getContacts) successfull");
                that.logger.log("internal", LOG_ID + "(getContacts) received " + json.total + " contacts");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getContacts) error");
                that.logger.log("internalerror", LOG_ID, "(getContacts) error : ", err);
                return reject(err);
            });
        });
    }

    removeContactFromRoster(dbId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!dbId) {
                that.logger.log("debug", LOG_ID + "(removeContactFromRoster) failed");
                that.logger.log("info", LOG_ID + "(removeContactFromRoster) No dbId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/enduser/v1.0/users/networks/" + dbId, that.getRequestHeader()).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(removeContactFromRoster) successfull");
                    that.logger.log("internal", LOG_ID + "(removeContactFromRoster) received " + json.total + " contacts");
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(removeContactFromRoster) error");
                    that.logger.log("internalerror", LOG_ID, "(removeContactFromRoster) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    getContactInformationByJID(jid) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!jid) {
                that.logger.log("debug", LOG_ID + "(getContactInformationByJID)  failed");
                that.logger.log("info", LOG_ID + "(getContactInformationByJID) No jid provided");
                resolve(null);
            } else {

                // Remove resource from jid
                let jidBare = jid;
                if (jid.includes("/")) {
                    jidBare = jid.substr(0, jid.lastIndexOf("/"));
                }

                that.http.get("/api/rainbow/enduser/v1.0/users/jids/" + encodeURIComponent(jidBare), that.getRequestHeader(), undefined).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(getContactInformationByJID) successfull");
                    that.logger.log("internal", LOG_ID + "(getContactInformationByJID) REST contact received  : ", json.data);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(getContactInformationByJID) error");
                    that.logger.log("internalerror", LOG_ID, "(getContactInformationByJID) error : ", err);
                    if (err && err.code === 404) {
                        resolve(null);
                    } else {
                        return reject(err);
                    }
                });
            }
        });
    }

    getContactInformationByID(id) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!id) {
                that.logger.log("debug", LOG_ID + "(getContactInformationByID) failed");
                that.logger.log("info", LOG_ID + "(getContactInformationByID) No id provided");
                resolve(null);
            } else {
                that.http.get("/api/rainbow/enduser/v1.0/users/" + encodeURIComponent(id) + "?format=full", that.getRequestHeader(), undefined).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(getContactInformationByID) successfull");
                    that.logger.log("internal", LOG_ID + "(getContactInformationByID) REST contact received  : ", json.data);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(getContactInformationByID) error");
                    that.logger.log("internalerror", LOG_ID, "(getContactInformationByID) error : ", err);
                    if (err && err.code === 404) {
                        resolve(null);
                    } else {
                        return reject(err);
                    }
                });
            }
        });
    }

    getContactInformationByLoginEmail(email): Promise<[any]> {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!email) {
                that.logger.log("debug", LOG_ID + "(getContactInformationByLoginEmail) failed");
                that.logger.log("info", LOG_ID + "(getContactInformationByLoginEmail) No email provided");
                resolve(null);
            } else {
                //that.logger.log("internal", LOG_ID + "(getContactInformationByLoginEmail) with params : ", { "loginEmail": email });
                that.http.post("/api/rainbow/enduser/v1.0/users/loginEmails", that.getRequestHeader(), {"loginEmail": email}, undefined).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(getContactInformationByLoginEmail) successfull");
                    that.logger.log("internal", LOG_ID + "(getContactInformationByLoginEmail) REST contact received  : ", json.data);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(getContactInformationByLoginEmail) error");
                    that.logger.log("internalerror", LOG_ID, "(getContactInformationByLoginEmail) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    getServerFavorites() {
        let that = this;
        return new Promise(function (resolve, reject) {
            //that.logger.log("internal", LOG_ID + "(getContactInformationByLoginEmail) with params : ", { "loginEmail": email });
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.userId + "/favorites", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getServerFavorites) successfull");
                that.logger.log("internal", LOG_ID + "(getServerFavorites) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getServerFavorites) error");
                that.logger.log("internalerror", LOG_ID, "(getServerFavorites) error : ", err);
                return reject(err);
            });
        });
    }

    public async addServerFavorite(peerId: string, type: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!peerId) {
                that.logger.log("debug", LOG_ID + "(addServerFavorite) failed");
                that.logger.log("info", LOG_ID + "(addServerFavorite) No peerId provided");
                resolve(null);
            } else {
                let data = {peerId, type};
                that.http.post("/api/rainbow/enduser/v1.0/users/" + that.userId + "/favorites", that.getRequestHeader(), data, undefined).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(addServerFavorite) successfull");
                    that.logger.log("internal", LOG_ID + "(addServerFavorite) REST result : ", json.data);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(addServerFavorite) error");
                    that.logger.log("internalerror", LOG_ID, "(addServerFavorite) error : ", err);
                    return reject(err);
                });
            }
        });

        /*
        let that = this;
        try {
            let url = `${config.restServerUrl}/api/rainbow/enduser/v1.0/users/${this.contactService.userContact.dbId}/favorites`;
            let data = { peerId, type };
            await this.$http({ method: "POST", url, headers: this.authService.getRequestHeader(), data });

            that._logger.log("debug", LOG_ID +`[favoriteService] addServerFavorite(${peerId}, ${type}) -- SUCCESS`);
        }
        catch (error) {
            let errorMessage = `addServerFavorite(${peerId}, ${type}) -- FAILURE -- ${error.message}`;
            that._logger.log("error", LOG_ID + `[favoriteService] ${errorMessage}`);
            throw new Error(errorMessage);
        }

         */
    }

    public async removeServerFavorite(favoriteId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!favoriteId) {
                that.logger.log("debug", LOG_ID + "(removeServerFavorite) failed");
                that.logger.log("info", LOG_ID + "(removeServerFavorite) No favoriteId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/enduser/v1.0/users/" + that.userId + "/favorites/" + favoriteId, that.getRequestHeader()).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(removeServerFavorite) successfull");
                    that.logger.log("internal", LOG_ID + "(removeServerFavorite) REST result : ", json.data);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(removeServerFavorite) error");
                    that.logger.log("internalerror", LOG_ID, "(removeServerFavorite) error : ", err);
                    return reject(err);
                });
            }
        });

        /*
                   let url = `${config.restServerUrl}/api/rainbow/enduser/v1.0/users/${this.contactService.userContact.dbId}/favorites/${favoriteId}`;
                   await this.$http({ method: "DELETE", url: url, headers: this.authService.getRequestHeader() });
                    */
    }

    /**
     * ACCEPT INVITATION
     * Used by SDK (public)
     * Warning when modifying this method
     */
    acceptInvitation(invitation) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(acceptInvitation) invitation : ", invitation);
            that.http.post("/api/rainbow/enduser/v1.0/users/" + invitation.invitedUserId + "/invitations/" + invitation.id + "/accept", that.getRequestHeader(), {}, undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(acceptInvitation) successfull");
                that.logger.log("internal", LOG_ID + "(acceptInvitation) REST invitation received  : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(acceptInvitation) error");
                that.logger.log("internalerror", LOG_ID, "(acceptInvitation) error : ", err);
                return reject(err);
            });
        });
    };

    /**
     * DECLINE INVITATION
     * Used by SDK (public)
     * Warning when modifying this method
     */
    declineInvitation(invitation) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(declineInvitation) invitation : ", invitation);
            that.http.post("/api/rainbow/enduser/v1.0/users/" + invitation.invitedUserId + "/invitations/" + invitation.id + "/decline", that.getRequestHeader(), {}, undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(declineInvitation) successfull");
                resolve();
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(declineInvitation) error");
                that.logger.log("internalerror", LOG_ID, "(declineInvitation) error : ", err);
                return reject(err);
            });
        });
    };

    /**
     * SEND INVITATION
     * Used by SDK (public)
     * Warning when modifying this method
     */
    joinContactInvitation(contact) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(joinContactInvitation) contact : ", contact);
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations", that.getRequestHeader(), {"invitedUserId": contact.id}, undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(joinContactInvitation) successfull");
                that.logger.log("internal", LOG_ID + "(joinContactInvitation) REST invitation received  : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(joinContactInvitation) error");
                that.logger.log("internalerror", LOG_ID, "(joinContactInvitation) error : ", err);
                return reject(err);
            });
        });
    }

    joinContacts(contact, contactIds, presence) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/admin/v1.0/users/" + contact.id + "/networks", that.getRequestHeader(),
                {
                    "users": contactIds,
                    "presence": Boolean(presence)
                }
                , undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(joinContacts) successfull");
                that.logger.log("internal", LOG_ID + "(joinContacts) REST invitation received  : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(joinContacts) error");
                that.logger.log("internalerror", LOG_ID, "(joinContacts) error : ", err);
                return reject(err);
            });
        });
    }

    getInvitationById(invitationId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!invitationId) {
                that.logger.log("debug", LOG_ID + "(getInvitationById) successfull");
                that.logger.log("info", LOG_ID + "(getInvitationById) No id provided");
                resolve(null);
            } else {
                that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/" + invitationId, that.getRequestHeader(), undefined).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(getInvitationById) successfull");
                    that.logger.log("internal", LOG_ID + "(getInvitationById) REST invitation received  : ", json.data);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(getInvitationById) error");
                    that.logger.log("internalerror", LOG_ID, "(getInvitationById) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    getGroups() {
        let that = this;
        let getSetOfGroups = function (page, max, groups) {
            return new Promise((resolve, reject) => {
                that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups?format=full&offset=" + page + "&limit=" + max, that.getRequestHeader(), undefined).then(function (json) {
                    groups = groups.concat(json.data);
                    that.logger.log("internal", LOG_ID + "(getGroups) retrieved " + json.data.length + " groups, total " + groups.length + ", existing " + json.total);
                    resolve({groups: groups, finished: groups.length === json.total});
                }).catch(function (err) {
                    return reject(err);
                });
            });
        };

        let getAllGroups = function (page, limit, groups) {

            return new Promise((resolve, reject) => {

                getSetOfGroups(page, limit, groups).then((json: any) => {
                    if (json.finished) {
                        that.logger.log("info", LOG_ID + "(getGroups) getSetOfGroups no need to loop again. All groups retrieve...");
                        return resolve(json.groups);
                    }
                    page += limit;
                    that.logger.log("internal", LOG_ID + "(getGroups) getSetOfGroups need another loop to get more groups... [" + json.groups.length + "]");
                    getAllGroups(page, limit, json.groups).then((allGroups) => {
                        resolve(allGroups);
                    }).catch((err) => {
                        return reject(err);
                    });

                }).catch((err) => {
                    return reject(err);
                });
            });
        };

        return new Promise(function (resolve, reject) {
            let page = 0;
            let limit = 100;
            getAllGroups(page, limit, []).then((json: any) => {
                that.logger.log("info", LOG_ID + "(getGroups) getAllGroups successfull");
                that.logger.log("internal", LOG_ID + "(getGroups) getAllGroups received " + json.length + " groups");
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(getGroups) getAllGroups error");
                that.logger.log("internalerror", LOG_ID, "(getGroups) getAllGroups error : ", err);
                return reject(err);
            });
        });
    }

    getGroup(groupId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getGroup) successfull");
                that.logger.log("internal", LOG_ID + "(getGroup) REST get group information : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getGroup) error");
                that.logger.log("internalerror", LOG_ID, "(getGroup) error : ", err);
                return reject(err);
            });
        });
    }

    setFavoriteGroup(group, favorite) {
        /*
        Request URL: https://vberder.openrainbow.org/api/rainbow/enduser/v1.0/users/5bbdc3ae2cf496c07dd8912f/groups/5e3d39e1cbc6187d74aee06c
Request Method: PUT
{name: "GroupTest", comment: "descgroup", isFavorite: true}
         */
        let that = this;
        //  let data = { "name": group.name, "comment": group.comment, "isFavorite": group.isFavorite }
        let data = {
            isFavorite: favorite
        };
        let groupId = group.id;

        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(setFavoriteGroup) successfull");
                that.logger.log("internal", LOG_ID + "(setFavoriteGroup) REST set group favorite information : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(setFavoriteGroup) error");
                that.logger.log("internalerror", LOG_ID, "(setFavoriteGroup) error : ", err);
                return reject(err);
            });
        });
    }

    createGroup(name, comment, isFavorite) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups", that.getRequestHeader(), {
                name: name,
                comment: comment,
                isFavorite: isFavorite
            }, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createGroup) successfull");
                that.logger.log("internal", LOG_ID + "(createGroup) REST group created : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createGroup) error");
                that.logger.log("internalerror", LOG_ID, "(createGroup) error : ", err);
                return reject(err);
            });
        });
    }

    deleteGroup(groupId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId, that.getRequestHeader()).then(function (json) {
                that.logger.log("info", LOG_ID + "(deleteGroup) successfull");
                that.logger.log("internal", LOG_ID + "(deleteGroup) REST delete group : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteGroup) error");
                that.logger.log("internalerror", LOG_ID, "(deleteGroup) error : ", err);
                return reject(err);
            });
        });
    }

    updateGroupName(groupId, name) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId, that.getRequestHeader(), {
                name: name
            }, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateGroupName) successfull");
                that.logger.log("internal", LOG_ID + "(updateGroupName) REST delete group : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateGroupName) error");
                that.logger.log("internalerror", LOG_ID, "(updateGroupName) error : ", err);
                return reject(err);
            });
        });
    }

    addUserInGroup(contactId, groupId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId + "/users/" + contactId, that.getRequestHeader(), undefined, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(addUserInGroup) successfull");
                that.logger.log("internal", LOG_ID + "(addUserInGroup) REST add user in group : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(addUserInGroup) error");
                that.logger.log("internalerror", LOG_ID, "(addUserInGroup) error : ", err);
                return reject(err);
            });
        });
    }

    removeUserFromGroup(contactId, groupId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups/" + groupId + "/users/" + contactId, that.getRequestHeader()).then(function (json) {
                that.logger.log("info", LOG_ID + "(removeUserFromGroup) successfull");
                that.logger.log("internal", LOG_ID + "(removeUserFromGroup) REST remove user from group : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID + "(removeUserFromGroup) error");
                that.logger.log("internalerror", LOG_ID + "(removeUserFromGroup) error : ", err);
                return reject(err);
            });
        });
    }

    getBots() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/bots", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getBots) successfull");
                that.logger.log("internal", LOG_ID + "(getBots) received " + json.total + " bots");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getBots) error");
                that.logger.log("internalerror", LOG_ID, "(getBots) error : ", err);
                return reject(err);
            });
        });
    }

    // Bubble API

    createBubble(name, description, withHistory) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let history = "none";
            if (withHistory) {
                history = "all";
            }

            that.http.post("/api/rainbow/enduser/v1.0/rooms", that.getRequestHeader(), {
                    name: name,
                    topic: description,
                    history: history
                }
                , undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createBubble) successfull");
                that.logger.log("internal", LOG_ID + "(createBubble) REST bubble created : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createBubble) error");
                that.logger.log("internalerror", LOG_ID, "(createBubble) error", err);
                return reject(err);
            });
        });
    }

    setBubbleVisibility(bubbleId, visibility) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader(), {
                    visibility: visibility
                }
                , undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(setBubbleVisibility) successfull");
                that.logger.log("internal", LOG_ID + "(setBubbleVisibility) REST bubble set visibility : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(setBubbleVisibility) error");
                that.logger.log("internalerror", LOG_ID, "(setBubbleVisibility) error : ", err);
                return reject(err);
            });
        });
    }

    setBubbleTopic(bubbleId, topic) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader(), {
                    topic: topic
                }
                , undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(setBubbleTopic) successfull");
                that.logger.log("internal", LOG_ID + "(setBubbleTopic) REST bubble updated topic : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(setBubbleTopic) error");
                that.logger.log("internalerror", LOG_ID, "(setBubbleTopic) error : ", err);
                return reject(err);
            });
        });
    }

    setBubbleName(bubbleId, name) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader(), {
                    name: name
                }
                , undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(setBubbleName) successfull");
                that.logger.log("internal", LOG_ID + "(setBubbleName) REST bubble updated name : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(setBubbleName) error");
                that.logger.log("internalerror", LOG_ID, "(setBubbleName) error : ", err);
                return reject(err);
            });
        });
    }

    getBubbles() {
        let that = this;
        let getSetOfBubbles = (page, max, bubbles) => {
            return new Promise((resolve, reject) => {
                that.http.get("/api/rainbow/enduser/v1.0/rooms?format=full&offset=" + page + "&limit=" + max + "&userId=" + that.account.id, that.getRequestHeader(), undefined).then(function (json) {
                    bubbles = bubbles.concat(json.data);
                    that.logger.log("info", LOG_ID + "(getBubbles) getSetOfBubbles successfull");
                    that.logger.log("internal", LOG_ID + "(getBubbles) getSetOfBubbles retrieved " + json.data.length + " bubbles, total " + bubbles.length + ", existing " + json.total);
                    resolve({bubbles: bubbles, finished: bubbles.length === json.total});
                }).catch(function (err) {
                    return reject(err);
                });
            });
        };

        let getAllBubbles = function (page, limit, bubbles) {

            return new Promise((resolve, reject) => {
                getSetOfBubbles(page, limit, bubbles).then((json: any) => {
                    if (json.finished) {
                        that.logger.log("info", LOG_ID + "(getAllBubbles) no need to loop again. All bubbles retrieved...");
                        return resolve(json.bubbles);
                    }

                    page += limit;
                    that.logger.log("info", LOG_ID + "(getAllBubbles) need another loop to get more bubbles... [" + json.bubbles.length + "]");
                    getAllBubbles(page, limit, json.bubbles).then((bubbles) => {
                        resolve(bubbles);
                    }).catch((err) => {
                        return reject(err);
                    });


                }).catch((err) => {
                    return reject(err);
                });
            });
        };

        return new Promise(function (resolve, reject) {
            let page = 0;
            let limit = 100;

            getAllBubbles(page, limit, []).then((json: any) => {
                that.logger.log("info", LOG_ID + "(getBubbles) getAllBubbles successfull");
                that.logger.log("internal", LOG_ID + "(getBubbles) getAllBubbles received " + json.length + " bubbles");
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(getBubbles) getAllBubbles error");
                that.logger.log("internalerror", LOG_ID, "(getBubbles) getAllBubbles error : ", err);
                return reject(err);
            });
        });
    }

    getBubble(bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "?format=full", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getBubble) successfull");
                that.logger.log("internal", LOG_ID + "(getBubble) REST get bubble information : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getBubble) error");
                that.logger.log("internalerror", LOG_ID, "(getBubble) error : ", err);
                return reject(err);
            });
        });
    }

    getBubbleByJid(bubbleJid) {
        let that = this;
        return new Promise(function (resolve, reject) {
            //http://vberder.openrainbow.org/api/rainbow/enduser/v1.0/rooms/jids/{jid}
            that.http.get("/api/rainbow/enduser/v1.0/rooms/jids/" + bubbleJid + "?format=full", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getBubbleByJid) successfull");
                that.logger.log("internal", LOG_ID + "(getBubbleByJid) REST get bubble information : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getBubbleByJid) error");
                that.logger.log("internalerror", LOG_ID, "(getBubbleByJid) error : ", err);
                return reject(err);
            });
        });
    }

    setBubbleCustomData(bubbleId, customData) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/custom-data", that.getRequestHeader(), customData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(setBubbleCustomData) successfull");
                that.logger.log("internal", LOG_ID + "(setBubbleCustomData) REST PUT customData to bubble : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(setBubbleCustomData) error");
                that.logger.log("internalerror", LOG_ID, "(setBubbleCustomData) error : ", err);
                return reject(err);
            });
        });
    }

    inviteContactToBubble(contactId, bubbleId, asModerator, withInvitation, reason) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let privilege = asModerator ? "moderator" : "user";
            let status = withInvitation ? "invited" : "accepted";
            reason = reason || "from moderator";

            that.http.post("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users", that.getRequestHeader(), {
                userId: contactId,
                reason: reason,
                privilege: privilege,
                status: status
            }, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(inviteContactToBubble) successfull");
                that.logger.log("internal", LOG_ID + "(inviteContactToBubble) REST bubble invitation : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(inviteContactToBubble) error");
                that.logger.log("internalerror", LOG_ID, "(inviteContactToBubble) error : ", err);
                return reject(err);
            });
        });
    }

    inviteContactsByEmailsToBubble(contactsEmails, bubbleId) {
        let that = this;
        const data = {
            scenario: "chat",
            emails: contactsEmails // ["philippe.torrelli@gmail.com"]
        };

        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/invitations", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(inviteContactToBubble) successfull");
                that.logger.log("internal", LOG_ID + "(inviteContactToBubble) REST bubble invitation : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(inviteContactToBubble) error");
                that.logger.log("internalerror", LOG_ID, "(inviteContactToBubble) error : ", err);
                return reject(err);
            });
        });
    }

    // Get all users from bubble
    getRoomUsers(bubbleId, options: any = {}) {
        let that = this;
        return new Promise(function (resolve, reject) {

            let filterToApply = "format=medium";
            if (options.format) {
                filterToApply = "format=" + options.format;
            }

            if (!options.limit) options.limit = 100;

            if (options.page > 0) {
                filterToApply += "&offset=";
                if (options.page > 1) {
                    filterToApply += (options.limit * (options.page - 1));
                } else {
                    filterToApply += 0;
                }
            }

            filterToApply += "&limit=" + Math.min(options.limit, 1000);

            if (options.type) {
                filterToApply += "&types=" + options.type;
            }

            that.http.get("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users?" + filterToApply, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getUsersChannel) successfull");
                that.logger.log("internal", LOG_ID + "(getUsersChannel) received ", json.total, " users in bubble");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getUsersChannel) error");
                that.logger.log("internalerror", LOG_ID, "(getUsersChannel) error : ", err);
                return reject(err);
            });
        });
    }

    promoteContactInBubble(contactId, bubbleId, asModerator) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let privilege = asModerator ? "moderator" : "user";
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + contactId, that.getRequestHeader(), {privilege: privilege}, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(promoteContactInBubble) successfull");
                that.logger.log("internal", LOG_ID + "(promoteContactInBubble) REST invitation accepted : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(promoteContactInBubble) error");
                that.logger.log("internalerror", LOG_ID, "(promoteContactInBubble) error : ", err);
                return reject(err);
            });
        });
    }

    changeBubbleOwner(bubbleId, contactId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader(), {"owner": contactId}, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(changeBubbleOwner) successfull");
                that.logger.log("internal", LOG_ID + "(changeBubbleOwner) REST invitation accepted : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(changeBubbleOwner) error");
                that.logger.log("internalerror", LOG_ID, "(changeBubbleOwner) error : ", err);
                return reject(err);
            });
        });
    }

    archiveBubble(bubbleId) {
        // /api/rainbow/enduser/v1.0/rooms/:roomId/archive
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(archiveBubble) bubbleId : ", bubbleId);
            let data = {};
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/archive", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(archiveBubble) successfull");
                that.logger.log("internal", LOG_ID + "(archiveBubble) REST leave bubble : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(archiveBubble) error.");
                that.logger.log("internalerror", LOG_ID, "(archiveBubble) error : ", err);
                return reject(err);
            });
        });
    }

    leaveBubble(bubbleId, bubbleStatus) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(leaveBubble) bubbleId : ", bubbleId, ", bubbleStatus : ", bubbleStatus);
            switch (bubbleStatus) {
                case "unsubscribed":
                    that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + that.account.id, that.getRequestHeader()).then(function (json) {
                        that.logger.log("info", LOG_ID + "(leaveBubble) delete successfull");
                        that.logger.log("internal", LOG_ID + "(leaveBubble) REST leave bubble : ", json.data);
                        resolve(json.data);
                    }).catch(function (err) {
                        that.logger.log("error", LOG_ID, "(leaveBubble) error");
                        that.logger.log("internalerror", LOG_ID, "(leaveBubble) error : ", err);
                        return reject(err);
                    });
                    break;
                default:
                    that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + that.account.id, that.getRequestHeader(), {"status": "unsubscribed"}, undefined).then(function (json) {
                        that.logger.log("info", LOG_ID + "(leaveBubble) unsubscribed successfull");
                        that.logger.log("internal", LOG_ID + "(leaveBubble) REST invitation accepted : ", json.data);
                        resolve(json.data);
                    }).catch(function (err) {
                        that.logger.log("error", LOG_ID, "(leaveBubble) error");
                        that.logger.log("internalerror", LOG_ID, "(leaveBubble) error : ", err);
                        return reject(err);
                    });
                    break;
            }
        });
    }

    deleteBubble(bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader()).then(function (json) {
                that.logger.log("info", LOG_ID + "(deleteBubble) successfull");
                that.logger.log("internal", LOG_ID + "(deleteBubble) REST leave bubble : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteBubble) error");
                that.logger.log("internalerror", LOG_ID, "(deleteBubble) error : ", err);
                return reject(err);
            });
        });
    }

    removeInvitationOfContactToBubble(contactId, bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + contactId, that.getRequestHeader()).then(function (json) {
                that.logger.log("info", LOG_ID + "(removeInvitationOfContactToBubble) successfull");
                that.logger.log("internal", LOG_ID + "(removeInvitationOfContactToBubble) REST remove contact from bubble : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(removeInvitationOfContactToBubble) error");
                that.logger.log("internalerror", LOG_ID, "(removeInvitationOfContactToBubble) error : ", err);
                return reject(err);
            });
        });
    }

    unsubscribeContactFromBubble(contactId, bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + contactId, that.getRequestHeader(), {status: "unsubscribed"}, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(unsubscribeContactFromBubble) successfull");
                that.logger.log("internal", LOG_ID + "(unsubscribeContactFromBubble) REST remove contact from bubble : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(unsubscribeContactFromBubble) error");
                that.logger.log("internalerror", LOG_ID, "(unsubscribeContactFromBubble) error : ", err);
                return reject(err);
            });
        });
    }

    acceptInvitationToJoinBubble(bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + that.account.id, that.getRequestHeader(), {status: "accepted"}, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(acceptInvitationToJoinBubble) successfull");
                that.logger.log("internal", LOG_ID + "(acceptInvitationToJoinBubble) REST invitation accepted : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(acceptInvitationToJoinBubble) error");
                that.logger.log("internalerror", LOG_ID, "(acceptInvitationToJoinBubble) error : ", err);
                return reject(err);
            });
        });
    }

    declineInvitationToJoinBubble(bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + that.account.id, that.getRequestHeader(), {status: "rejected"}, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(declineInvitationToJoinBubble) successfull");
                that.logger.log("internal", LOG_ID + "(declineInvitationToJoinBubble) REST invitation declined : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(declineInvitationToJoinBubble) error");
                that.logger.log("internalerror", LOG_ID, "(declineInvitationToJoinBubble) error : ", err);
                return reject(err);
            });
        });
    }

    inviteUser(email, companyId, language, message) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let user = {
                email: email,
                lang: language,
                customMessage: null
            };

            if (message) {
                user.customMessage = message;
            }

            that.http.post("/api/rainbow/admin/v1.0/companies/" + companyId + "/join-companies/invitations", that.getRequestHeader(), user, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(inviteUser) successfull");
                that.logger.log("internal", LOG_ID + "(inviteUser) REST admin user invitation sent : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(inviteUser) error");
                that.logger.log("internalerror", LOG_ID, "(inviteUser) error : ", err);
                return reject(err);
            });
        });
    }

    setAvatarRoom(bubbleid, binaryData) {
        let that = this;

        return new Promise(function (resolve, reject) {
            let data = binaryData.data;

            that.http.post("/api/rainbow/enduser/v1.0/rooms/" + bubbleid + "/avatar", that.getRequestHeader("application/json"), data, "image/" + binaryData.type).then(function (json) {
                that.logger.log("info", LOG_ID + "(setAvatarRoom) successfull");
                that.logger.log("internal", LOG_ID + "(setAvatarRoom) REST bubble Avatar sent : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(setAvatarRoom) error");
                that.logger.log("internalerror", LOG_ID, "(setAvatarRoom) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAvatarRoom(roomId) {
        return new Promise((resolve, reject) => {
            let that = this;

            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + roomId + "/avatar", that.getRequestHeader()).then((json) => {
                that.logger.log("info", LOG_ID + "(deleteAvatarRoom) successfull");
                that.logger.log("internal", LOG_ID + "(deleteAvatarRoom) REST deletion file descriptor", json);
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(deleteAvatarRoom) error");
                that.logger.log("internalerror", LOG_ID, "(deleteAvatarRoom) error : ", err);
                return reject(err);
            });
        });
    };

    /**
     * Method retrieveWebConferences
     * @public
     * @param {string} mediaType mediaType of conference to retrieve. Default: this.MEDIATYPE.WEBRTC
     * @returns {ng.IPromise<any>} a promise that resolves when conference are reterived
     * @memberof WebConferenceService
     */
    retrieveWebConferences(mediaType: string = MEDIATYPE.WEBRTC): Promise<any> {
        let that = this;
        that.logger.log("info", LOG_ID + "(retrieveWebConferences) with mediaType=" + mediaType);
        return new Promise((resolve, reject) => {
            let urlQueryParameters = "?format=full&userId=" + that.userId;

            if (mediaType) {
                urlQueryParameters += "&mediaType=" + mediaType;
            }

            that.http.get("/api/rainbow/confprovisioning/v1.0/conferences" + urlQueryParameters, that.getRequestHeader(), undefined)
                /* this.$http({
                    method: "GET",
                    url: this.confProvPortalURL + "conferences" + urlQueryParameters,
                    headers: this.authService.getRequestHeader()
                }) // */
                // Handle success response
                .then((response) => {
                        let conferencesProvisionData = response;
                        that.logger.log("info", LOG_ID + "(WebConferenceService) retrieveWebConferences successfully");
                        that.logger.log("internal", LOG_ID + "(WebConferenceService) retrieveWebConferences successfully : ", conferencesProvisionData);
                        resolve(conferencesProvisionData.data);
                    },
                    (response) => {
                        let msg = response.data ? response.data.errorDetails : response.data;
                        let errorMessage = "retrieveWebConferences failure: " + msg;
                        that.logger.log("error", LOG_ID + "(WebConferenceService) error : " + errorMessage);
                        reject(new Error(errorMessage));
                    });
        });
    };


    /*
    ownerUpdateRoomCustomData (roomData) {
        let that = this;

        return new Promise(function(resolve, reject) {
            let data = { "customData": roomData.customData };
            that.logger.log("internal", LOG_ID + "(ownerUpdateRoomCustomData) roomData : ", roomData);
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + roomData.id + "/custom-data", that.getRequestHeader("application/json"), data, undefined).then(function(json) {
                that.logger.log("info", LOG_ID + "(ownerUpdateRoomCustomData) successfull");
                that.logger.log("internal", LOG_ID + "(ownerUpdateRoomCustomData) REST bubble Avatar sent : ", json);
                resolve(json.data.customData || {});
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(ownerUpdateRoomCustomData) error");
                that.logger.log("internalerror", LOG_ID, "(ownerUpdateRoomCustomData) error : ", err);
                return reject(err);
            });
        });
    };

    ownerUpdateRoom (roomData) {
        let that = this;

        return new Promise(function(resolve, reject) {
            let data = {
                name: roomData.name,
                topic: roomData.desc,
                visibility: roomData.type ? "public" : "private"
            };
            that.logger.log("internal", LOG_ID + "(ownerUpdateRoomCustomData) roomData : ", roomData);
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + roomData.id , that.getRequestHeader("application/json"), data, undefined).then(function(json) {
                that.logger.log("info", LOG_ID + "(ownerUpdateRoomCustomData) successfull");
                that.logger.log("internal", LOG_ID + "(ownerUpdateRoomCustomData) REST bubble Avatar sent : ", json);
                resolve(json.data || {});
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(ownerUpdateRoomCustomData) error");
                that.logger.log("internalerror", LOG_ID, "(ownerUpdateRoomCustomData) error : ", err);
                return reject(err);
            });
        });
    };
    // */

    createUser(email, password, firstname, lastname, companyId, language, isAdmin, roles) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let user = {
                loginEmail: email,
                password: password,
                firstName: firstname,
                lastName: lastname,
                isActive: true,
                isInitialized: false,
                language: language,
                adminType: "undefined",
                roles: ["user"],
                accountType: "free",
                companyId: null,
            };

            if (companyId) {
                user.companyId = companyId;
            } else {
                user.companyId = that.account.companyId
            }

            if (roles != null) {
                user.roles = roles;
            }

            if (isAdmin) {
                user.roles.push("admin");
                //user.adminType = ["company_admin"];
                user.adminType = "company_admin";
            }

            that.http.post("/api/rainbow/admin/v1.0/users", that.getRequestHeader(), user, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createUser) successfull");
                that.logger.log("internal", LOG_ID + "(createUser) REST admin creation user : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createUser) error");
                that.logger.log("internalerror", LOG_ID, "(createUser) error : ", err);
                return reject(err);
            });
        });
    }

    createGuestUser(firstname, lastname, language, timeToLive) {
        let that = this;
        return new Promise(function (resolve, reject) {
            // Generate user Email based on appId
            let uid = makeId(40);
            let appId = that._application.appID;
            let domain = that.http.host;
            let email = `${uid}@${appId}.${domain}`;

            // Generate a rainbow compatible password
            let password = createPassword(40);

            let user = {
                loginEmail: email,
                password: password,
                isActive: true,
                isInitialized: false,
                adminType: "undefined",
                roles: ["guest"],
                accountType: "free",
                companyId: that.account.companyId, // Current requester company
                firstName: undefined,
                lastName: undefined,
                language: undefined,
                timeToLive: undefined
            };

            if (firstname) {
                user.firstName = firstname;
            }

            if (lastname) {
                user.lastName = lastname;
            }

            if (language) {
                user.language = language;
            }

            if (timeToLive) {
                user.timeToLive = timeToLive;
            }

            that.http.post("/api/rainbow/admin/v1.0/users", that.getRequestHeader(), user, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createGuestUser) successfull");
                // Add generated password into the answer
                json.data.password = password;
                that.logger.log("internal", LOG_ID + "(createGuestUser) REST admin creation user : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createGuestUser) error");
                that.logger.log("internalerror", LOG_ID, "(createGuestUser) error : ", err);
                return reject(err);
            });
        });
    }

    changePassword(password, userId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {
                password: password
            };

            that.http.put("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(changePassword) successfull");
                that.logger.log("internal", LOG_ID + "(changePassword) REST admin change password : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(changePassword) error");
                that.logger.log("internalerror", LOG_ID, "(changePassword) error : ", err);
                return reject(err);
            });
        });
    }

    updateInformation(objData, userId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader(), objData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateInformation) successfull");
                that.logger.log("internal", LOG_ID + "(updateInformation) REST admin change data : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateInformation) error");
                that.logger.log("internalerror", LOG_ID, "(updateInformation) error : ", err);
                return reject(err);
            });
        });
    }

    deleteUser(userId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader()).then(function (json) {
                that.logger.log("info", LOG_ID + "(deleteUser) successfull");
                that.logger.log("internal", LOG_ID + "(deleteUser) REST admin delete user", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteUser) error");
                that.logger.log("internalerror", LOG_ID, "(deleteUser) error : ", err);
                return reject(err);
            });
        });
    }

    // FileStorage
    createFileDescriptor(name, extension, size, viewers) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {
                fileName: name,
                extension: extension,
                size: size,
                viewers: viewers
            };

            that.http.post("/api/rainbow/filestorage/v1.0/files", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createFileDescriptor) successfull");
                that.logger.log("info", LOG_ID + "(createFileDescriptor) REST get Blob from Url");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createFileDescriptor) error");
                that.logger.log("internalerror", LOG_ID, "(createFileDescriptor) error : ", err);
                return reject(err);
            });
        });
    }

    deleteFileDescriptor(fileId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/filestorage/v1.0/files/" + fileId, that.getRequestHeader()).then((json) => {
                that.logger.log("info", LOG_ID + "(deleteFileDescriptor) successfull");
                that.logger.log("internal", LOG_ID + "(deleteFileDescriptor) REST deletion file descriptor", json);
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(deleteFileDescriptor) error");
                that.logger.log("internalerror", LOG_ID, "(deleteFileDescriptor) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveFileDescriptors(format, limit, offset, viewerId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let queries = [];
            if (format) {
                queries.push("format=" + format);
            }
            if (limit) {
                queries.push("limit=" + limit);
            }
            if (offset) {
                queries.push("offset=" + offset);
            }
            if (viewerId) {
                queries.push("viewerId=" + viewerId);
            }

            that.http.get("/api/rainbow/filestorage/v1.0/files" + (queries.length ? "?" + queries.join("&") : ""), that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(retrieveFileDescriptors) successfull");
                that.logger.log("info", LOG_ID + "(retrieveFileDescriptors) REST get file descriptors");
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveFileDescriptors) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveFileDescriptors) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveFilesReceivedFromPeer(userId, peerId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/filestorage/v1.0/files/viewers/" + userId + "?ownerId=" + peerId + "&format=full", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(retrieveFilesReceivedFromPeer) successfull");
                that.logger.log("info", LOG_ID + "(retrieveFilesReceivedFromPeer) REST get file descriptors");
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveFilesReceivedFromPeer) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveFilesReceivedFromPeer) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveReceivedFilesForRoomOrViewer(roomId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/filestorage/v1.0/files/viewers/" + roomId + "?format=full", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(retrieveFilesReceivedFromPeer) successfull");
                that.logger.log("info", LOG_ID + "(retrieveFilesReceivedFromPeer) REST get file descriptors");
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveFilesReceivedFromPeer) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveFilesReceivedFromPeer) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveOneFileDescriptor(fileId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/filestorage/v1.0/files/" + fileId + "?format=full", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(retrieveOneFileDescriptor) successfull");
                that.logger.log("info", LOG_ID + "(retrieveOneFileDescriptor) REST get file descriptors");
                let res = json ? json.data : {};
                resolve(res);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveOneFileDescriptor) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveOneFileDescriptor) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveUserConsumption() {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/filestorage/v1.0/users/consumption", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(retrieveUserConsumption) successfull");
                that.logger.log("info", LOG_ID + "(retrieveUserConsumption) REST get file descriptors");
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveUserConsumption) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveUserConsumption) error : ", err);
                return reject(err);
            });
        });
    }

    deleteFileViewer(viewerId, fileId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/filestorage/v1.0/files/" + fileId + "/viewers/" + viewerId, that.getRequestHeader()).then((json) => {
                that.logger.log("info", LOG_ID + "(deleteFileViewer) successfull");
                that.logger.log("internal", LOG_ID + "(deleteFileViewer) REST deletion file viewer", json);
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(deleteFileViewer) error");
                that.logger.log("internalerror", LOG_ID, "(deleteFileViewer) error : ", err);
                return reject(err);
            });
        });
    }

    addFileViewer(fileId, viewerId, viewerType) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/filestorage/v1.0/files/" + fileId + "/viewers", that.getRequestHeader(), {
                viewerId: viewerId,
                type: viewerType
            }, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createCompany) successfull");
                that.logger.log("internal", LOG_ID + "(createCompany) REST creation company", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createCompany) error");
                that.logger.log("internalerror", LOG_ID, "(createCompany) error : ", err);
                return reject(err);
            });
        });
    }

    // FileServer
    getPartialDataFromServer(url, minRange, maxRange, index) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get(url, that.getRequestHeaderWithRange("application/octet-stream", "bytes=" + minRange + "-" + maxRange), undefined).then(function (data) {
                that.logger.log("info", LOG_ID + "(getPartialDataFromServer) successfull");
                that.logger.log("info", LOG_ID + "(getPartialDataFromServer) REST get Blob from Url");
                resolve({"data": data, "index": index});
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getPartialDataFromServer) error");
                that.logger.log("internalerror", LOG_ID, "(getPartialDataFromServer) error : ", err);
                return reject(err);
            });
        });
    }

    getFileFromUrl(url) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get(url, that.getRequestHeader("application/octet-stream"), undefined).then(function (response) {
                that.logger.log("info", LOG_ID + "(getFileFromUrl) successfull");
                that.logger.log("info", LOG_ID + "(getFileFromUrl) REST get Blob from Url");
                resolve(response);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getFileFromUrl) error");
                that.logger.log("internalerror", LOG_ID, "(getFileFromUrl) error : ", err);
                return reject(err);
            });
        });
    }

    getBlobFromUrl(url) {
        let that = this;
        return new Promise(function (resolve, reject) {
            /* responseType: 'arraybuffer'// */
            that.http.get(url, that.getRequestHeader("responseType: 'arraybuffer'"), undefined).then(function (response) {
                that.logger.log("info", LOG_ID + "(getBlobFromUrl) successfull");
                that.logger.log("info", LOG_ID + "(getBlobFromUrl) REST get Blob from Url");
                resolve(response);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getBlobFromUrl) error");
                that.logger.log("internalerror", LOG_ID, "(getBlobFromUrl) error : ", err);
                return reject(err);
            });
        });
    }

    uploadAFile(fileId, buffer) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/fileserver/v1.0/files/" + fileId, that.getRequestHeader("Content-Type: 'application/octet-stream'"), buffer, undefined).then(function (response) {
                that.logger.log("info", LOG_ID + "(uploadAFile) successfull");
                that.logger.log("info", LOG_ID + "(uploadAFile) REST file sent");
                resolve(response);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(uploadAFile) error");
                that.logger.log("internalerror", LOG_ID, "(uploadAFile) error : ", err);
                return reject(err);
            });
        });
    }

    uploadAStream(fileId, stream) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let headers = that.getRequestHeader();
            headers['Content-Type'] = 'application/octet-stream';
            that.http.putStream("/api/rainbow/fileserver/v1.0/files/" + fileId, headers, stream).then(function (response) {
                that.logger.log("info", LOG_ID + "(uploadAStream) successfull");
                that.logger.log("info", LOG_ID + "(uploadAStream) REST file sent");
                resolve(response);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(uploadAStream) error");
                that.logger.log("internalerror", LOG_ID, "(uploadAStream) error : ", err);
                return reject(err);
            });
        });
    }

    sendPartialDataToServer(fileId, file, index) {
        let that = this;
        return new Promise(function (resolve, reject) {
            //let headers = that.getPostHeaderWithRange("application/json", initialSize, minRange, maxRange );
            let headers = that.getRequestHeader();
            headers["Content-Type"] = 'application/octet-stream';
            //headers["Connection"] = 'keep-alive' ;
            //headers['Accept-Encoding'] = 'gzip, deflate, br' ;
            //headers['Accept-Language'] = 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7' ;

            that.logger.log("debug", LOG_ID + " sendPartialDataToServer, fileId : " + fileId + ", index : " + index + " Headers : ", JSON.stringify(headers, null, "  "));

            that.http.putBuffer("/api/rainbow/fileserver/v1.0/files/" + fileId + "/parts/" + index, headers, file).then(function (response) {
                that.logger.log("info", LOG_ID + "(sendPartialDataToServer) successfull");
                resolve(response);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(sendPartialDataToServer) error");
                that.logger.log("internalerror", LOG_ID, "(sendPartialDataToServer) error : ", err);
                return reject(err);
            });
        });
    }

    sendPartialFileCompletion(fileId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let headers = that.getRequestHeader("application/json");
            headers['Content-Type'] = 'application/octet-stream';

            that.http.putBuffer("/api/rainbow/fileserver/v1.0/files/" + fileId + "/parts/end", headers, undefined).then(function (response) {
                that.logger.log("info", LOG_ID + "(sendPartialFileCompletion) successfull");
                resolve(response);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(sendPartialFileCompletion) error");
                that.logger.log("internalerror", LOG_ID, "(sendPartialFileCompletion) error : ", err);
                return reject(err);
            });
        });
    }

    getServerCapabilities() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/fileserver/v1.0/capabilities", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getServerCapabilities) successfull");
                that.logger.log("internal", LOG_ID + "(getServerCapabilities) REST get Server capabilities : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(getServerCapabilities) error");
                that.logger.log("internalerror", LOG_ID, "(getServerCapabilities) error : ", err);
                return reject(err);
            });
        });
    }

    // Settings
    getUserSettings() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/settings", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getUserSettings) successfull");
                that.logger.log("internal", LOG_ID + "(getUserSettings) REST get User Settings : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(getUserSettings) error");
                that.logger.log("internalerror", LOG_ID, "(getUserSettings) error : ", err);
                return reject(err);
            });
        });
    }

    updateUserSettings(settings) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/settings", that.getRequestHeader(), settings, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateUserSettings) successfull");
                that.logger.log("internal", LOG_ID + "(updateUserSettings) REST user change data : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateUserSettings) error");
                that.logger.log("internalerror", LOG_ID, "(updateUserSettings) error : ", err);
                return reject(err);
            });
        });
    }

    getAllCompanies() {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(getAllCompanies) that.account.roles : ", that.account.roles);
            that.http.get("/api/rainbow/admin/v1.0/companies", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getAllCompanies) successfull");
                that.logger.log("internal", LOG_ID + "(getAllCompanies) REST get all companies : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllCompanies) error");
                that.logger.log("internalerror", LOG_ID, "(getAllCompanies) error : ", err);
                return reject(err);
            });
            that.logger.log("info", LOG_ID + "(getAllCompanies) after sending the request");
        });
    }

    getAllUsers(format = "small", offset = 0, limit = 100, sortField = "loginEmail") {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(getAllUsers) that.account.roles : ", that.account.roles);
            that.http.get("/api/rainbow/admin/v1.0/users?format=" + encodeURIComponent(format) + "&limit=" + limit + "&offset=" + offset + "&sortField=" + encodeURIComponent(sortField) + "&sortOrder=-1", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getAllUsers) successfull");
                that.logger.log("internal", LOG_ID + "(getAllUsers) REST get all companies : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllUsers) error");
                that.logger.log("internalerror", LOG_ID, "(getAllUsers) error : ", err);
                return reject(err);
            });
            that.logger.log("info", LOG_ID + "(getAllUsers) after sending the request");
        });
    }

    getContactInfos(userId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(getContactInfos) that.account.roles : ", that.account.roles);
            that.http.get("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getContactInfos) successfull");
                that.logger.log("internal", LOG_ID + "(getContactInfos) REST get infos : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getContactInfos) error");
                that.logger.log("internalerror", LOG_ID, "(getContactInfos) error : ", err);
                return reject(err);
            });
            that.logger.log("info", LOG_ID + "(getContactInfos) after sending the request");
        });
    }

    putContactInfos(userId, infos) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(getContactInfos) that.account.roles : ", that.account.roles);
            that.http.put("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader(), infos, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getContactInfos) successfull");
                that.logger.log("internal", LOG_ID + "(getContactInfos) REST get infos :", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getContactInfos) error");
                that.logger.log("internalerror", LOG_ID, "(getContactInfos) error : ", err);
                return reject(err);
            });
            that.logger.log("info", LOG_ID + "(getContactInfos) after sending the request");
        });
    }

    createCompany(name, country, state, offerType) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let countryObj = {
                name: name,
                country: "Fr",
                state: null,
                offerType: "freemium"
            };

            if (country) {
                countryObj.country = country;
            }
            if (state) {
                countryObj.state = state;
            }
            if (offerType) {
                //offerType: "premium"
                countryObj.offerType = offerType
            }

            that.http.post('/api/rainbow/admin/v1.0/companies', that.getRequestHeader(), countryObj, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createCompany) successfull");
                that.logger.log("internal", LOG_ID + "(createCompany) REST creation company : ", json);
                if (json && json.data) {
                    resolve(json.data);
                } else {
                    resolve(json);
                }
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createCompany) error");
                that.logger.log("internalerror", LOG_ID, "(createCompany) error : ", err);
                return reject(err);
            });
        });
    }

    getCompany(companyId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get('/api/rainbow/admin/v1.0/companies/' + companyId, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getCompany) successfull");
                that.logger.log("internal", LOG_ID + "(getCompany) REST get company : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCompany) error");
                that.logger.log("internalerror", LOG_ID, "(getCompany) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCompany(companyId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(deleteCompany) companyId", companyId);
            that.http.delete('/api/rainbow/admin/v1.0/companies/' + companyId, that.getRequestHeader()).then(function (json) {
                that.logger.log("info", LOG_ID + "(deleteCompany) successfull");
                that.logger.log("internal", LOG_ID + "(deleteCompany) REST deletion company : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteCompany) error");
                that.logger.log("internalerror", LOG_ID, "(deleteCompany) error : ", err);
                return reject(err);
            });
        });
    }


    setVisibilityForCompany(companyId, visibleByCompanyId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.post('/api/rainbow/admin/v1.0/companies/' + companyId + "/visible-by/" + visibleByCompanyId, that.getRequestHeader(), undefined, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(setVisibilityForCompany) successfull");
                that.logger.log("internal", LOG_ID + "(setVisibilityForCompany) REST setVisibilityForCompany company", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(setVisibilityForCompany) error");
                that.logger.log("internalerror", LOG_ID, "(setVisibilityForCompany) error : ", err);
                return reject(err);
            });
        });
    }

    // Channel
    // Create a channel
    createPublicChannel(name, topic, category: string = "globalnews", visibility, max_items, max_payload_size) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let channel = {
                name: name,
                topic: null,
                visibility: null,
                max_items: null,
                max_payload_size: null,
                category: category
            };

            if (topic) {
                channel.topic = topic;
            }
            if (visibility) {
                channel.visibility = visibility;
            }
            if (max_items) {
                channel.max_items = max_items;
            }
            if (max_payload_size) {
                channel.max_payload_size = max_payload_size;
            }

            that.http.post("/api/rainbow/channels/v1.0/channels", that.getRequestHeader(), channel, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createPublicChannel) successfull");
                that.logger.log("internal", LOG_ID + "(createPublicChannel) REST creation channel : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createPublicChannel) error");
                that.logger.log("internalerror", LOG_ID, "(createPublicChannel) error : ", err);
                return reject(err);
            });
        });
    }

    // get a channel
    /* getChannel(channelId) {
         let that = this;

         return new Promise(function(resolve, reject) {

             that.logger.log("debug", LOG_ID + "(getChannel) _entering_");

             that.http.get("/api/rainbow/channels/v1.0/channels/" + channelId, that.getRequestHeader()).then(function(json) {
                 that.logger.log("info", LOG_ID + "(getChannel) successfull");
                 that.logger.log("internal", LOG_ID + "(getChannel) REST read channelId : ", json.data);
                 that.logger.log("debug", LOG_ID + "(getChannel) _exiting_");
                 resolve(json.data);
             }).catch(function(err) {
                 that.logger.log("error", LOG_ID, "(getChannel) error", err);
                 that.logger.log("debug", LOG_ID + "(getChannel) _exiting_");
                 reject(err);
             });
         });
     } // */

    // Delete a channel
    deleteChannel(channelId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId, that.getRequestHeader()).then(function (json) {
                that.logger.log("info", LOG_ID + "(deleteChannel) successfull");
                that.logger.log("internal", LOG_ID + "(deleteChannel) REST remove channelId", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteChannel) error");
                that.logger.log("internalerror", LOG_ID, "(deleteChannel) error : ", err);
                return reject(err);
            });
        });
    }

    // Find Channels
    findChannels(name, topic, category, limit, offset, sortField, sortOrder) {
        let that = this;

        let query = "?limit=";
        if (limit) {
            query += limit;
        } else {
            query += "100";
        }
        if (name) {
            query += "&name=" + name;
        }
        if (topic) {
            query += "&topic=" + topic;
        }
        if (category) {
            query += "&category=" + category;
        }
        if (offset) {
            query += "&offset=" + offset;
        }
        if (sortField) {
            query += "&sortField=" + sortField;
        }
        if (sortOrder) {
            query += "&sortOrder=" + sortOrder;
        }
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/channels/v1.0/channels/search" + query, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(findChannels) successfull");
                that.logger.log("internal", LOG_ID + "(findChannels) REST found channels", json.total);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(findChannels) error");
                that.logger.log("internalerror", LOG_ID, "(findChannels) error : ", err);
                return reject(err);
            });
        });
    }

    // Get my channels
    getChannels() {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/channels/v1.0/channels", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(fetchMyChannels) successfull");
                that.logger.log("internal", LOG_ID + "(fetchMyChannels) received channels");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(fetchMyChannels) error");
                that.logger.log("internalerror", LOG_ID, "(fetchMyChannels) error : ", err);
                return reject(err);
            });
        });
    }

    getChannel(id) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/channels/v1.0/channels/" + id, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getChannel) successfull");
                that.logger.log("internal", LOG_ID + "(getChannel) received channels : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getChannel) error");
                that.logger.log("internalerror", LOG_ID, "(getChannel) error : ", err);
                return reject(err);
            });
        });
    }

    // Publish a message to a channel
    publishMessage(channelId, message, title, url, imagesIds, type) {
        let that = this;
        return new Promise((resolve, reject) => {
            let payload = {
                type,
                message: message,
                title: title || "",
                url: url || "",
                images: null
            };

            if (imagesIds) {
                payload.images = imagesIds || null;
            }

            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/publish", that.getRequestHeader(), payload, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(publishMessage) successfull");
                that.logger.log("internal", LOG_ID + "(publishMessage) REST message published : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(publishMessage) error");
                that.logger.log("internalerror", LOG_ID, "(publishMessage) error : ", err);
                return reject(err);
            });
        });
    }

    private chewReceivedItems(items: any[]): void {
        items.forEach((item) => {
            if (item.type === "urn:xmpp:channels:simple") {
                item["entry"] = {message: item.message};
                delete item.message;
            }
            item.displayId = item.id + "-" + item.timestamp;
            item.modified = item.creation !== undefined;
        });
    }

    /**
     * Get latests message from channel
     */
    public getLatestMessages(maxMessages: number, beforeDate: Date = null, afterDate: Date = null) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/channels/v1.0/channels/latest-items", that.getRequestHeader(), {
                max: maxMessages,
                before: beforeDate,
                after: afterDate
            }).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getLatestMessages) successfull");
                that.logger.log("internal", LOG_ID + "(getLatestMessages) received " + JSON.stringify(json) + " latestMessages");
                that.chewReceivedItems(json.data.items);
                resolve(json.data.items);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getLatestMessages) error");
                that.logger.log("internalerror", LOG_ID, "(getLatestMessages) error : ", err);
                return reject(err);
            });
        });
    };

    // Subscribe to a channel
    subscribeToChannel(channelId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/subscribe", that.getRequestHeader(), undefined, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(subscribeToChannel) successfull");
                that.logger.log("internal", LOG_ID + "(subscribeToChannel) REST channel subscribed : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(subscribeToChannel) error");
                that.logger.log("internalerror", LOG_ID, "(subscribeToChannel) error : ", err);
                return reject(err);
            });
        });
    }

    // Unsubscribe to a channel
    unsubscribeToChannel(channelId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId + "/subscribe", that.getRequestHeader()).then(function (json) {
                that.logger.log("info", LOG_ID + "(unsubscribeToChannel) successfull");
                that.logger.log("internal", LOG_ID + "(unsubscribeToChannel) REST channel unsubscribed : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(unsubscribeToChannel) error");
                that.logger.log("internalerror", LOG_ID, "(unsubscribeToChannel) error : ", err);
                return reject(err);
            });
        });
    }

    // Update channels
    updateChannel(channelId, title, visibility, max_items, max_payload_size, channelName, mode) {
        let that = this;
        let channel = {
            name: null,
            topic: null,
            visibility: null,
            max_items: null,
            max_payload_size: null,
            mode: null
        };
        if (title === null) {
            delete channel.topic;
        } else {
            channel.topic = title;
        }
        if (visibility === null) {
            delete channel.visibility;
        } else {
            channel.visibility = visibility;
        }
        if (mode === null) {
            delete channel.mode;
        } else {
            channel.mode = mode;
        }
        if (max_items === null) {
            delete channel.max_items;
        } else {
            channel.max_items = max_items;
        }
        if (max_payload_size === null) {
            delete channel.max_payload_size;
        } else {
            channel.max_payload_size = max_payload_size;
        }
        if (channelName === null) {
            delete channel.name;
        } else {
            channel.name = channelName;
        }
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/channels/v1.0/channels/" + channelId, that.getRequestHeader(), channel, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(updateChannel) successfull");
                that.logger.log("internal", LOG_ID + "(updateChannel) REST channel updated : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateChannel) error");
                that.logger.log("internalerror", LOG_ID, "(updateChannel) error : ", err);
                return reject(err);
            });
        });
    }

    public uploadChannelAvatar(channelId: string, avatar: any, avatarSize: number, fileType: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            //this.roomService.resizeImage(avatar, avatarSize, avatarSize)
            //  .then((resizedImage) => {
            //var binaryData = this.roomService.getBinaryData(resizedImage);
            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/avatar", that.getRequestHeader(), avatar, fileType).then((response: any) => {
                that.logger.log("info", LOG_ID + "(updateChannel) successfull channelId : ", channelId);
                resolve(response);
            })
                .catch((err) => {
                    return reject(err);
                });
            //});
        });
    }

    public deleteChannelAvatar(channelId: string): Promise<any> {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId + "/avatar", that.getRequestHeader("image/jpeg"))
                .then((response: any) => {
                    that.logger.log("info", LOG_ID + "(deleteChannelAvatar) successfull channelId : ", channelId);
                    resolve(response);
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }

    // Get all users from channel
    getChannelUsers(channelId, options) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let filterToApply = "format=full";
            if (options.format) {
                filterToApply = "format=" + options.format;
            }

            if (options.page > 0) {
                filterToApply += "&offset=";
                if (options.page > 1) {
                    filterToApply += (options.limit * (options.page - 1));
                } else {
                    filterToApply += 0;
                }
            }

            filterToApply += "&limit=" + Math.min(options.limit, 1000);

            if (options.type) {
                filterToApply += "&types=" + options.type;
            }

            that.http.get("/api/rainbow/channels/v1.0/channels/" + channelId + "/users?" + filterToApply, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getUsersChannel) successfull");
                that.logger.log("internal", LOG_ID + "(getUsersChannel) received ", json.total, " users in channel");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getUsersChannel) error");
                that.logger.log("internalerror", LOG_ID, "(getUsersChannel) error : ", err);
                return reject(err);
            });
        });
    }

    // Delete all users in channel
    deleteAllUsersFromChannel(channelId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId + "/users", that.getRequestHeader()).then(function (json) {
                that.logger.log("info", LOG_ID + "(deleteAllUsersFromChannel) successfull");
                that.logger.log("internal", LOG_ID + "(deleteAllUsersFromChannel) REST remove all users in channel with channelId : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteAllUsersFromChannel) error");
                that.logger.log("internalerror", LOG_ID, "(deleteAllUsersFromChannel) error : ", err);
                return reject(err);
            });
        });
    }

    // Update a collection of channel users
    updateChannelUsers(channelId, users) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/channels/v1.0/channels/" + channelId + "/users", that.getRequestHeader(), {"data": users}, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateChannelUsers) successfull");
                that.logger.log("internal", LOG_ID + "(updateChannelUsers) REST channels updated : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateChannelUsers) error");
                that.logger.log("internalerror", LOG_ID, "(updateChannelUsers) error : ", err);
                return reject(err);
            });
        });
    }

    // Update a collection of channel users
    getChannelMessages(channelId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/items", that.getRequestHeader(), {"max": "100"}, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getChannelMessages) successfull");
                that.logger.log("internal", LOG_ID + "(getChannelMessages) REST channels messages received : ", json.data.items.length);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getChannelMessages) error");
                that.logger.log("internalerror", LOG_ID, "(getChannelMessages) error : ", err);
                return reject(err);
            });
        });
    }

    likeItem(channelId, itemId, appreciation) {
        let that = this;
        let data = {"appreciation": appreciation};
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/items/" + itemId + "/like", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(likeItem) successfull");
                that.logger.log("internal", LOG_ID + "(likeItem) REST channels item liked received : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(likeItem) error");
                that.logger.log("internalerror", LOG_ID, "(likeItem) error : ", err);
                return reject(err);
            });
        });
    }

    getDetailedAppreciations(channelId, itemId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/channels/v1.0/channels/" + channelId + "/items/" + itemId + "/likes", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getDetailedAppreciations) successfull");
                that.logger.log("internal", LOG_ID + "(getDetailedAppreciations) REST channels item liked received : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getDetailedAppreciations) error");
                that.logger.log("internalerror", LOG_ID, "(getDetailedAppreciations) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * Delete item from a channel
     */
    deleteChannelMessage(channelId, itemId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/channels/v1.0/channels/" + channelId + "/items/" + itemId, that.getRequestHeader())
                .then((response) => {
                    that.logger.log("info", LOG_ID + "[channelService] deleteChannelItem (" + channelId + ", " + itemId + ") -- success");
                    resolve(itemId);
                })
                .catch((err) => {
                    that.logger.log("error", LOG_ID, "[channelService] deleteChannelItem (" + channelId + ", " + itemId + ") -- failure -- ");
                    that.logger.log("internalerror", LOG_ID, "[channelService] deleteChannelItem (" + channelId + ", " + itemId + ") -- failure -- ", err.message);
                    return reject(err);
                });
        });
    };


    // Get Server Profiles
    getServerProfiles() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/profiles", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getServerProfiles) successfull");
                that.logger.log("internal", LOG_ID + "(getServerProfiles) received ", json, " profiles");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getServerProfiles) error");
                that.logger.log("internalerror", LOG_ID, "(getServerProfiles) error : ", err);
                return reject(err);
            });
        });
    }

    // Get Server Profiles
    getServerProfilesFeatures() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/profiles/features", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getServerProfilesFeatures) successfull");
                that.logger.log("internal", LOG_ID + "(getServerProfilesFeatures) received " + JSON.stringify(json) + " profiles features");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getServerProfilesFeatures) error");
                that.logger.log("internalerror", LOG_ID, "(getServerProfilesFeatures) error : ", err);
                return reject(err);
            });
        });
    }

    ////////
    // Telephony
    makeCall(contact, phoneInfo) {
        let that = this;
        return that.restTelephony.makeCall(that.getRequestHeader(), contact, phoneInfo);
    }

    releaseCall(call) {
        let that = this;
        return that.restTelephony.releaseCall(that.getRequestHeader(), call);
    }

    makeConsultationCall(callId, contact, phoneInfo) {
        let that = this;
        return that.restTelephony.makeConsultationCall(that.getRequestHeader(), callId, contact, phoneInfo);
    }

    answerCall(call) {
        let that = this;
        return that.restTelephony.answerCall(that.getRequestHeader(), call);
    }

    holdCall(call) {
        let that = this;
        return that.restTelephony.holdCall(that.getRequestHeader(), call);
    }

    retrieveCall(call) {
        let that = this;
        return that.restTelephony.retrieveCall(that.getRequestHeader(), call);
    }

    deflectCallToVM(call, VMInfos) {
        let that = this;
        return that.restTelephony.deflectCallToVM(that.getRequestHeader(), call, VMInfos);
    }

    deflectCall(call, calleeInfos) {
        let that = this;
        return that.restTelephony.deflectCall(that.getRequestHeader(), call, calleeInfos);
    }

    transfertCall(activeCall, heldCall) {
        let that = this;
        return that.restTelephony.transfertCall(that.getRequestHeader(), activeCall, heldCall);
    }

    conferenceCall(activeCall, heldCall) {
        let that = this;
        return that.restTelephony.conferenceCall(that.getRequestHeader(), activeCall, heldCall);
    }

    forwardToDevice(contact, phoneInfo) {
        let that = this;
        return that.restTelephony.forwardToDevice(that.getRequestHeader(), contact, phoneInfo);
    }

    getForwardStatus() {
        let that = this;
        return that.restTelephony.getForwardStatus(that.getRequestHeader());
    }

    getNomadicStatus() {
        let that = this;
        return that.restTelephony.getNomadicStatus(that.getRequestHeader());
    }

    nomadicLogin(data) {
        let that = this;
        return that.restTelephony.nomadicLogin(that.getRequestHeader(), data);
    }

    sendDtmf(callId, deviceId, data) {
        let that = this;
        return that.restTelephony.sendDtmf(that.getRequestHeader(), callId, deviceId, data);
    }

    logon(endpointTel, agentId, password, groupId) {
        let that = this;
        return that.restTelephony.logon(that.getRequestHeader(), endpointTel, agentId, password, groupId);
    }

    logoff(endpointTel, agentId, password, groupId) {
        let that = this;
        return that.restTelephony.logoff(that.getRequestHeader(), endpointTel, agentId, password, groupId);
    }

    withdrawal(agentId, groupId, status) {
        let that = this;
        return that.restTelephony.withdrawal(that.getRequestHeader(), agentId, groupId, status);
    }

    wrapup(agentId, groupId, password, status) {
        let that = this;
        return that.restTelephony.wrapup(that.getRequestHeader(), agentId, groupId, password, status);
    }

    getRainbowNodeSdkPackagePublishedInfos() {
        let that = this;
        return new Promise((resolve, reject) => {
            let headers = {
                "Accept": "application/json"
            };

            that.http.getUrl("https://api.npms.io/v2/search?q=rainbow-node-sdk", headers, undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getRainbowNodeSdkPackagePublishedInfos) successfull");
                that.logger.log("internal", LOG_ID + "(getRainbowNodeSdkPackagePublishedInfos) received ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getRainbowNodeSdkPackagePublishedInfos) error");
                that.logger.log("internalerror", LOG_ID, "(getRainbowNodeSdkPackagePublishedInfos) error : ", err);
                return reject(err);
            });
        });
    }

    ////////
    // Conversations
    getServerConversations(format: String = "small") {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/conversations?format=" + format, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getServerConversations) successfull");
                that.logger.log("internal", LOG_ID + "(getServerConversations) received " + JSON.stringify(json) + " conversations");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getServerConversations) error");
                that.logger.log("internalerror", LOG_ID, "(getServerConversations) error : ", err);
                return reject(err);
            });
        });
    }

    createServerConversation(conversation) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/conversations", that.getRequestHeader(), conversation, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(createServerConversation) successfull");
                that.logger.log("info", LOG_ID + "(createServerConversation) REST conversation created : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(createServerConversation) error");
                that.logger.log("internalerror", LOG_ID, "(createServerConversation) error : ", err);
                return reject(err);
            });
        });
    }

    deleteServerConversation(conversationId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/conversations/" + conversationId, that.getRequestHeader()).then(function (json) {
                that.logger.log("info", LOG_ID + "(deleteServerConversation) successfull");
                that.logger.log("internal", LOG_ID + "(deleteServerConversation) REST conversation deleted : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteServerConversation) error");
                that.logger.log("internalerror", LOG_ID, "(deleteServerConversation) error : ", err);
                return reject(err);
            });
        });
    }

    //Update conversation
    updateServerConversation(conversationId, mute) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/conversations/" + conversationId, that.getRequestHeader(), {"mute": mute}, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateServerConversation) successfull");
                that.logger.log("internal", LOG_ID + "(updateServerConversation) REST conversation updated : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateServerConversation) error");
                that.logger.log("internalerror", LOG_ID, "(updateServerConversation) error : ", err);
                return reject(err);
            });
        });
    }

    // Send Conversation By Email
    sendConversationByEmail(conversationId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/conversations/" + conversationId + "/downloads", that.getRequestHeader(), undefined, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(sendConversationByEmail) successfull");
                that.logger.log("internal", LOG_ID + "(sendConversationByEmail) REST conversation sent by email. : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(sendConversationByEmail) error");
                that.logger.log("internalerror", LOG_ID, "(sendConversationByEmail) error : ", err);
                return reject(err);
            });
        });
    }

    ackAllMessages(conversationId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/conversations/" + conversationId + "/markallread", that.getRequestHeader(), undefined, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(ackAllMessages) successfull");
                that.logger.log("internal", LOG_ID + "(ackAllMessages) REST ack all messages updated : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(ackAllMessages) error");
                that.logger.log("internalerror", LOG_ID, "(ackAllMessages) error : ", err);
                return reject(err);
            });
        });
    }

    // ***** INVITATIONS *****
    getAllSentInvitations() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/sent?format=full&status=pending&limit=500", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getAllSentInvitations) successfull");
                that.logger.log("internal", LOG_ID + "(getAllSentInvitations) received : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllSentInvitations) error");
                that.logger.log("internalerror", LOG_ID, "(getAllSentInvitations) error : ", err);
                return reject(err);
            });
        });
    };

    getServerInvitation(invitationId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/" + invitationId, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getServerInvitation) successfull");
                that.logger.log("internal", LOG_ID + "(getServerInvitation) received : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getServerInvitation) error");
                that.logger.log("internalerror", LOG_ID, "(getServerInvitation) error : ", err);
                return reject(err);
            });
        });
    };

    sendInvitationByEmail(email, lang, customMessage) {
        let that = this;
        return new Promise((resolve, reject) => {
            let params = {email: email, lang: lang, customMessage: customMessage};
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(sendInvitationByEmail) successfull");
                that.logger.log("internal", LOG_ID + "(sendInvitationByEmail) REST invitation created : ", json);
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(sendInvitationByEmail) error");
                that.logger.log("internalerror", LOG_ID, "(sendInvitationByEmail) error : ", err);
                return reject(err);
            });
        });
    };

    cancelOneSendInvitation(invitation) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/" + invitation.id + "/cancel", that.getRequestHeader(), undefined, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(cancelOneSendInvitation) successfull");
                that.logger.log("internal", LOG_ID + "(cancelOneSendInvitation) REST cancel one send invitation created : ", json);
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(cancelOneSendInvitation) error");
                that.logger.log("internalerror", LOG_ID, "(cancelOneSendInvitation) error : ", err);
                return reject(err);
            });
        });
    };

    reSendInvitation(invitationId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/" + invitationId + "/re-send", that.getRequestHeader(), undefined, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(reSendInvitation) successfull");
                that.logger.log("internal", LOG_ID + "(reSendInvitation) REST reSend invitation created : ", json);
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(reSendInvitation) error");
                that.logger.log("internalerror", LOG_ID, "(reSendInvitation) error : ", err);
                return reject(err);
            });
        });
    };

    sendInvitationsParBulk(listOfMails) {
        let that = this;
        let data = {
            emails: listOfMails
        };
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/bulk", that.getRequestHeader(), data, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(sendInvitationsParBulk) successfull");
                that.logger.log("internal", LOG_ID + "(sendInvitationsParBulk) REST invitations sent : ", json);
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(sendInvitationsParBulk) error");
                that.logger.log("internalerror", LOG_ID, "(sendInvitationsParBulk) error : ", err);
                return reject(err);
            });
        });
    };

    getAllReceivedInvitations() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/received?format=full&status=pending&status=accepted&status=auto-accepted&limit=500", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getAllReceivedInvitations) successfull");
                that.logger.log("internal", LOG_ID + "(getAllReceivedInvitations) received : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllReceivedInvitations) error");
                that.logger.log("internalerror", LOG_ID, "(getAllReceivedInvitations) error : ", err);
                return reject(err);
            });
        });
    };

    //////
    // Generic HTTP VERB
    get(url, token) {
        let that = this;
        that.token = token;
        return new Promise(function (resolve, reject) {
            that.http.get(url, that.getRequestHeader(), undefined).then(function (JSON) {
                resolve(JSON);
            }).catch(function (err) {
                that.logger.log("internalerror", LOG_ID + "(get) CATCH Error !!! : ", err);
                return reject(err);
            });
        });
    }

    post(url, token, data, contentType) {
        let that = this;
        that.token = token;
        return new Promise(function (resolve, reject) {
            that.http.post(url, that.getRequestHeader(), data, contentType).then(function (JSON) {
                resolve(JSON);
            }).catch(function (err) {
                that.logger.log("internalerror", LOG_ID + "(post) CATCH Error !!! : ", err);
                return reject(err);
            });
        });
    }

    put(url, token, data) {
        let that = this;
        that.token = token;
        return new Promise(function (resolve, reject) {
            that.http.put(url, that.getRequestHeader(), data, undefined).then(function (JSON) {
                resolve(JSON);
            }).catch(function (err) {
                that.logger.log("internalerror", LOG_ID + "(put) CATCH Error !!! : ", err);
                return reject(err);
            });
        });
    }

    delete(url, token) {
        let that = this;
        that.token = token;
        return new Promise(function (resolve, reject) {
            that.http.delete(url, that.getRequestHeader()).then(function (JSON) {
                resolve(JSON);
            }).catch(function (err) {
                that.logger.log("internalerror", LOG_ID + "(delete) CATCH Error !!! : ", err);
                return reject(err);
            });
        });
    }

    async checkEveryPortals() {
        let that = this;
        //that.logger.log("debug", LOG_ID + "(checkEveryPortals) ");

        if (this._isOfficialRainbow) {
            let authenticationAbout = that.http.get("/api/rainbow/authentication/v1.0/about", that.getDefaultHeader(), undefined).then((portalAbout) => {
                that.logger.log("debug", LOG_ID + "(checkEveryPortals) authentication about : ", portalAbout);
            });
            let enduserAbout = that.http.get("/api/rainbow/enduser/v1.0/about", that.getDefaultHeader(), undefined).then((portalAbout) => {
                that.logger.log("debug", LOG_ID + "(checkEveryPortals) enduser about : ", portalAbout);
            });
            let telephonyAbout = that.http.get("/api/rainbow/telephony/v1.0/about", that.getDefaultHeader(), undefined).then((portalAbout) => {
                that.logger.log("debug", LOG_ID + "(checkEveryPortals) telephony about : ", portalAbout);
            });
            let adminAbout = that.http.get("/api/rainbow/admin/v1.0/about", that.getDefaultHeader(), undefined).then((portalAbout) => {
                that.logger.log("debug", LOG_ID + "(checkEveryPortals) admin about : ", portalAbout);
            });
            let channelsAbout = that.http.get("/api/rainbow/channels/v1.0/about", that.getDefaultHeader(), undefined).then((portalAbout) => {
                that.logger.log("debug", LOG_ID + "(checkEveryPortals) channels about : ", portalAbout);
            });
            let applicationsAbout = that.http.get("/api/rainbow/applications/v1.0/about", that.getDefaultHeader(), undefined).then((portalAbout) => {
                that.logger.log("debug", LOG_ID + "(checkEveryPortals) applications about : ", portalAbout);
            });
            return Promise.all([authenticationAbout, enduserAbout, telephonyAbout, adminAbout, channelsAbout, applicationsAbout]);
        } else {
            that.logger.log("debug", LOG_ID + "(checkEveryPortals)", that.http._host, "NOT IN RAINBOW PRODUCTION so do not test every application's about status ");
            return Promise.resolve({'status': "OK"});
        }
    }


    checkPortalHealth(currentAttempt) {
        let that = this;
        that.logger.log("debug", LOG_ID + "(checkPortalHealth) will get the ping to test connection for the currentAttempt : ", currentAttempt);
        return new Promise(function (resolve, reject) {
            // dev-code //
            //return reject({"error" : "force to failed checkPortalHealth for tests, currentAttempt : " + currentAttempt });
            // end-dev-code //

            that.http.get("/api/rainbow/ping", that.getDefaultHeader(), undefined).then(function (JSON) {
                that.logger.log("debug", LOG_ID + "(checkPortalHealth) Wait a few time (10 seconds ) before check every portals, because somes of it respond before being xmpp ready for currentAttempt : ", currentAttempt);
                setTimeout(() => {
                    that.checkEveryPortals().then(() => {
                        that.logger.log("debug", LOG_ID + "(checkPortalHealth) Connection succeeded for currentAttempt : ", currentAttempt);
                        resolve(JSON);
                    }).catch((err) => {
                        that.logger.log("debug", LOG_ID + "(checkPortalHealth) Connection failed! for currentAttempt : ", currentAttempt);
                        return reject(err);
                    });
                }, 1000 * 10);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID + "(checkPortalHealth) ErrorManager for currentAttempt : ", currentAttempt);
                that.logger.log("internalerror", LOG_ID + "(checkPortalHealth) ErrorManager : ", err);
                return reject(err);
            });
        });
    }

    attemptToReconnect(reconnectDelay, currentAttempt) {
        let that = this;
        if (!that.reconnectInProgress) {
            that.logger.log("debug", LOG_ID + "(attemptToReconnect) set reconnectInProgress for the currentAttempt : ", currentAttempt);
            that.reconnectInProgress = true;
            that.logger.log("debug", LOG_ID + "(attemptToReconnect) Next attempt in " + that.reconnectDelay + " ms, this.currentAttempt : ", currentAttempt);
            setTimeout(() => {
                that.checkPortalHealth(currentAttempt).then(() => {
                    //that.logger.log("debug", LOG_ID + "(attemptToReconnect) Attempt succeeded!");
                    that.logger.log("debug", LOG_ID + "(attemptToReconnect) reset reconnectInProgress after succeeded for the currentAttempt : ", currentAttempt);
                    that.reconnectInProgress = false;
                    that.eventEmitter.emit("attempt_succeeded");
                }).catch((err) => {
                    that.logger.log("debug", LOG_ID + "(attemptToReconnect) Attempt failed! send attempt_failed for the currentAttempt : ", currentAttempt);
                    that.logger.log("debug", LOG_ID + "(attemptToReconnect) reset reconnectInProgress after failed for the currentAttempt : ", currentAttempt);
                    that.reconnectInProgress = false;
                    that.eventEmitter.emit("attempt_failed");
                });
            }, reconnectDelay);
        } else {
            that.logger.log("debug", LOG_ID + "(attemptToReconnect) reconnect in progress, so ignore this call for this.currentAttempt : ", currentAttempt);
        }
    }

    get_attempt_succeeded_callback(resolve?) {
        let that = this;
        //that.logger.log("debug", LOG_ID + "(reconnect) get_attempt_succeeded_callback");
        that.attempt_promise_resolver.resolve = resolve;
        if (!that.attempt_succeeded_callback) {
            that.logger.log("debug", LOG_ID + "(reconnect) get_attempt_succeeded_callback create the singleton of attempt_succeeded_callback method");
            that.attempt_succeeded_callback = function fn_attempt_succeeded_callback (){ // attempt_succeeded_callback
                that.logger.log("debug", LOG_ID + "(reconnect) attempt_succeeded_callback reconnection attempt successfull!");
                that.fibonacciStrategy.reset();
                //that.reconnect.delay = that.fibonacciStrategy.getInitialDelay();
                if (that.attempt_promise_resolver.resolve) {
                    that.attempt_promise_resolver.resolve();
                } else {
                    that.logger.log("error", LOG_ID + "(reconnect) attempt_succeeded_callback resolve is not define !");
                }
            };
        }
        return that.attempt_succeeded_callback;
    }

    get_attempt_failed_callback(reject?) {
        let that = this;
        that.attempt_promise_resolver.reject = reject;
        that.logger.log("debug", LOG_ID + "(reconnect) get_attempt_failed_callback called.");
        if (!that.attempt_failed_callback) {
            that.logger.log("debug", LOG_ID + "(reconnect) get_attempt_failed_callback create the singleton of attempt_failed_callback method");
            that.attempt_failed_callback = function fn_attempt_failed_callback() { // attempt_failed_callback
            //that.attempt_failed_callback = async () => { // attempt_failed_callback
                that.logger.log("debug", LOG_ID + "(reconnect) fn_attempt_failed_callback attempt #" + that.currentAttempt + " has failed!");
                that.currentAttempt++;
                if (that.currentAttempt < that.maxAttemptToReconnect) {
                    that.reconnectDelay = that.fibonacciStrategy.next();
                    //await that.attemptToReconnect(that.reconnectDelay);
                    that.logger.log("debug", LOG_ID + "(reconnect) fn_attempt_failed_callback attempt #" + that.currentAttempt + " will call attemptToReconnect.");
                    that.attemptToReconnect(that.reconnectDelay, that.currentAttempt);
                } else {
                    if (that.attempt_promise_resolver.reject) {
                        that.attempt_promise_resolver.reject();
                    } else {
                        that.logger.log("error", LOG_ID + "(reconnect) fn_attempt_failed_callback reject is not define !");
                    }
                }
            };
        } else {
            that.logger.log("debug", LOG_ID + "(reconnect) get_attempt_failed_callback that.attempt_failed_callback method already defined, so return it.");
        }
        return that.attempt_failed_callback;
    }

    reconnect() {
        let that = this;
        if (!that.reconnectInProgress) {
            return new Promise((resolve, reject) => {
                that.currentAttempt = 0;

                that.eventEmitter.removeListener("attempt_succeeded", that.get_attempt_succeeded_callback());
                that.eventEmitter.on("attempt_succeeded", that.get_attempt_succeeded_callback(resolve));

                that.eventEmitter.removeListener("attempt_failed", that.get_attempt_failed_callback());
                that.eventEmitter.on("attempt_failed", that.get_attempt_failed_callback(reject));

                that.attemptToReconnect(that.reconnectDelay, that.currentAttempt);
            });
        } else {
            return Promise.reject({"errorname" : "reconnectingInProgress" , "label" : "reconnect already in progress"});
        }
    }

    //region S2S
    // ************* S2S **************************

    async listConnectionsS2S() : Promise<any>{
        let that = this;
        //that.logger.log("internal", LOG_ID + "(listConnectionsS2S) S2S");
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/ucs/v1.0/connections", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(listConnectionsS2S) successfull");
                that.logger.log("internal", LOG_ID + "(listConnectionsS2S) received : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(listConnectionsS2S) error");
                that.logger.log("internalerror", LOG_ID, "(listConnectionsS2S) error : ", err);
                return reject(err);
            });
        });
    }

    async sendS2SPresence(obj) : Promise<any> {
        let that = this;
        that.logger.log("internal", LOG_ID + "(sendS2SPresence) Set S2S presence : ", obj);
        return new Promise(function (resolve, reject) {

            let data = obj ? {presence: {show: obj.show, status: obj.status}} : {presence: {show: "", status: ""}};
            if (!that.connectionS2SInfo || !that.connectionS2SInfo.id) {
                that.logger.log("error", LOG_ID, "(sendS2SPresence) error");
                that.logger.log("internalerror", LOG_ID, "(sendS2SPresence) error connectionS2SInfo.id is not defined.");
                return reject({code: -1, label: "connectionS2SInfo.id is not defined!!!"});
            }

            that.http.put("/api/rainbow/ucs/v1.0/connections/" + that.connectionS2SInfo.id + "/presences", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(sendS2SPresence) successfull.");
                json = json?json:{};
                that.logger.log("internal", LOG_ID + "(sendS2SPresence) REST presence updated : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(sendS2SPresence) error.");
                that.logger.log("internalerror", LOG_ID, "(sendS2SPresence) error : ", err);
                return reject(err);
            });
        });

        /*return axios.put(`/api/rainbow/ucs/v1.0/connections/${connectionInfo.id}/presences`, { presence: { show:"", status: ""}} ) //, {connection: { /*resource: "s2s_machin",*/ /* callback_url: "https://e894efad.ngrok.io" }})
            .then( response => {
                console.log( "it worked" );
                console.log( response.data )
                console.log( response.config)
                console.log( "STATUS = ", response.status)
                return response.data
            } )
            // */
    }

    async deleteConnectionsS2S (connexions) : Promise<any> {
        let that = this;
        that.logger.log("debug", LOG_ID + "(deleteConnectionsS2S) will del cnx S2S");
        that.logger.log("info", LOG_ID + "(deleteConnectionsS2S) will del cnx S2S : ", connexions);
        const requests = [];
        connexions.forEach(cnx => requests.push(
            that.http.delete("/api/rainbow/ucs/v1.0/connections/" + cnx.id, that.getRequestHeader()).then(function (json) {
                that.logger.log("debug", LOG_ID + "(deleteConnectionsS2S) successfull");
                that.logger.log("internal", LOG_ID + "(deleteConnectionsS2S) REST result : ", json.data);
                return json.data;
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteConnectionsS2S) error");
                that.logger.log("internalerror", LOG_ID, "(deleteConnectionsS2S) error : ", err);
                return err;
            })
            )
        );
        return Promise.all(connexions)
            .then(response => {
                that.logger.log("debug", LOG_ID + "(deleteConnectionsS2S) all successfull");
                //console.log("it worked");
                //console.log( response.data )
                //connectionInfo = response.data.data
                //process.exit()
                return response
            })
    }

    async loginS2S(callback_url) : Promise<any> {
        let that = this;
        let data = {connection: { /*resource: "s2s_machin",*/  callback_url}};
        that.logger.log("debug", LOG_ID + "(loginS2S)  will login  S2S.");
        that.logger.log("internal", LOG_ID + "(loginS2S) will login S2S : ", data);
        return new Promise(function (resolve, reject) {
            that.http.post("/api/rainbow/ucs/v1.0/connections", that.getRequestHeader(), data, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(loginS2S) successfull");
                that.logger.log("internal", LOG_ID + "(loginS2S) REST loginS2S successfull : ", json);
                that.connectionS2SInfo = json.data;
                resolve(that.connectionS2SInfo);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(loginS2S) error");
                that.logger.log("internalerror", LOG_ID, "(loginS2S) error : ", err);
                return reject(err);
            });
        });
        /*
               console.log( "will do login S2S")
               return axios.post(`/api/rainbow/ucs/v1.0/connections`, {connection: { /*resource: "s2s_machin",*/  /* callback_url }})
            .then( response => {
                console.log( "it worked" );
                console.log( response.data )
                connectionInfo = response.data.data
                return response.data
            } )
// */
    }


    async infoS2S(s2sConnectionId) : Promise<any> {
        let that = this;
        that.logger.log("debug", LOG_ID + "(infoS2S)  will get info S2S");
        that.logger.log("internal", LOG_ID + "(infoS2S) will get info S2S");
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/ucs/v1.0/connections/" + s2sConnectionId, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(infoS2S) successfull");
                that.logger.log("internal", LOG_ID + "(infoS2S) REST info S2S received : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(infoS2S) error");
                that.logger.log("internalerror", LOG_ID, "(infoS2S) error : ", err);
                return reject(err);
            });
        });

        /*console.log( "will do infoS2S", obj );

        return axios.get(`/api/rainbow/ucs/v1.0/connections/`+connectionInfo.id ) //, {connection: { /*resource: "s2s_machin",*/ /*  callback_url: "https://e894efad.ngrok.io" }})
            .then( response => {
                console.log( "it worked" );
                //console.log( response.data )
                return response.data
            } )
            // */
    }

    async setS2SConnection(connectionId) : Promise<any> {
        let that = this;
        that.logger.log("debug", LOG_ID + "(setS2SConnection)  will get info S2S and save the session infos.");
        that.logger.log("internal", LOG_ID + "(setS2SConnection) will get info S2S and save the session infos.");
        return that.connectionS2SInfo = await that.infoS2S(connectionId);
    }

    async sendS2SMessageInConversation(conversationId, msg) : Promise<any> {
        // https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{cvId}/messages
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!msg) {
                that.logger.log("debug", LOG_ID + "(sendS2SMessageInConversation) failed");
                that.logger.log("info", LOG_ID + "(sendS2SMessageInConversation) No msg provided");
                resolve(null);
            } else {
                that.http.post("/api/rainbow/ucs/v1.0/connections/" + that.connectionS2SInfo.id + "/conversations/" + conversationId + "/messages", that.getRequestHeader(), msg, undefined).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(sendS2SMessageInConversation) successfull");
                    that.logger.log("internal", LOG_ID + "(sendS2SMessageInConversation) REST contact received  : ", json.data);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(sendS2SMessageInConversation) error");
                    that.logger.log("internalerror", LOG_ID, "(sendS2SMessageInConversation) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    async getS2SServerConversation(conversationId) : Promise<any> {
        let that = this;
        // https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{id}
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/ucs/v1.0/connections/" + that.connectionS2SInfo.id + "/conversations/" + conversationId, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getServerConversation) successfull");
                that.logger.log("internal", LOG_ID + "(getServerConversation) received " + JSON.stringify(json) + " conversations");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getServerConversation) error");
                that.logger.log("internalerror", LOG_ID, "(getServerConversation) error : ", err);
                return reject(err);
            });
        });
    }

    async checkS2Sconnection() : Promise<any> {
        let that = this;
        // https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{id}
        return new Promise((resolve, reject) => {
            that.http.head("/api/rainbow/ucs/v1.0/connections/" + that.connectionS2SInfo.id , that.getRequestHeader()).then(function (json) {
                that.logger.log("debug", LOG_ID + "(checkS2Sconnection) successfull");
                that.logger.log("internal", LOG_ID + "(checkS2Sconnection) received : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(checkS2Sconnection) error");
                that.logger.log("internalerror", LOG_ID, "(checkS2Sconnection) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     *
     * @param roomid
     * @param {string} role Enum: "member" "moderator" of your role in this room

     */
    async joinS2SRoom(roomid, role: ROOMROLE) : Promise<any> {
        // https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/rooms/{roomId}/join
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!roomid) {
                that.logger.log("debug", LOG_ID + "(joinRoom) failed");
                that.logger.log("info", LOG_ID + "(joinRoom) No roomid provided");
                reject({code: -1, label: "roomid is not defined!!!"});
            } else {
                let data = undefined; /*{
                    "role": role
                }; // */
                that.http.post("/api/rainbow/ucs/v1.0/connections/" + that.connectionS2SInfo.id + "/rooms/" + roomid + "/join", that.getRequestHeader(), data, undefined).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(joinRoom) successfull");
                    that.logger.log("internal", LOG_ID + "(joinRoom) REST bubble presence received  : ", json.data);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(joinRoom) error");
                    that.logger.log("internalerror", LOG_ID, "(joinRoom) error : ", err);
                    return reject(err);
                });
            }
        });
    }
    //endregion

    markMessageAsRead(conversationId, messageId) {
        // https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{cvId}/messages/{id}/read
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!conversationId) {
                that.logger.log("debug", LOG_ID + "(markMessageAsRead) failed");
                that.logger.log("info", LOG_ID + "(markMessageAsRead) No conversationId provided");
                reject({code: -1, label: "conversationId is not defined!!!"});
            } else if (!messageId) {
                that.logger.log("debug", LOG_ID + "(markMessageAsRead) failed");
                that.logger.log("info", LOG_ID + "(markMessageAsRead) No messageId provided");
                reject({code: -1, label: "messageId is not defined!!!"});
            } else {
                that.http.put("/api/rainbow/ucs/v1.0/connections/" + that.connectionS2SInfo.id + "/conversations/" + conversationId + "/messages/" + messageId + "/read", that.getRequestHeader(), {}, undefined).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(markMessageAsRead) successfull");
                    that.logger.log("internal", LOG_ID + "(markMessageAsRead) REST bubble presence received  : ", json.data);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(markMessageAsRead) error");
                    that.logger.log("internalerror", LOG_ID, "(markMessageAsRead) error : ", err);
                    return reject(err);
                });
            }
        });
    }

//region Public url

    /**
     *
     * @param {string} userId id of to get all openInviteId belonging to this user. If not setted the connected user is used.
     * @param {string} type type optionnel to get the public link of personal rooms type query parameter used with personal_audio_room or personal_video_room or default.
     * @param {string} roomId id optionnel to get the public link for a given roomId, managed by the userId roomId
     * @return {Promise<any>}
     */
    getAllOpenInviteIdPerRoomOfAUser (userId?: string , type?: string,  roomId?: string) : Promise<Array<any>>{
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(getAllOpenInviteIdPerRoomOfAUser) REST.");
            let userIdFilter = userId ? userId : that.userId;
            /*
            let requestParam : any = {};
            if (type) {
                requestParam.type = type;
            }
            if (roomId) {
                requestParam.roomId = roomId;
            } // */
            let requestParam = "";
            if (type) {
                if (requestParam == "") {
                    requestParam += "?";
                } else {
                    requestParam += "+";
                }
                requestParam += "type=" + type;
            }
            if (roomId) {
                if (requestParam == "") {
                    requestParam += "?";
                } else {
                    requestParam += "+";
                }
                requestParam += "roomId=" + roomId;
            }

// */
          /*  let url = queryString.stringifyUrl({
                url: 'https://foo.bar',
                query: {
                    top: 'foo'
                },
                fragmentIdentifier: 'bar'
            });  // */

            that.http.get("/api/rainbow/enduser/v1.0/users/" + userIdFilter + "/public-links" + requestParam, that.getRequestHeader(), requestParam).then((json) => {
                that.logger.log("info", LOG_ID + "(getAllOpenInviteIdPerRoomOfAUser) successfull");
                that.logger.log("internal", LOG_ID + "(getAllOpenInviteIdPerRoomOfAUser) REST result : ", json.data);
                that.logger.log("info", LOG_ID + "(getAllOpenInviteIdPerRoomOfAUser) -- " + userIdFilter + " -- success");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllOpenInviteIdPerRoomOfAUser) error");
                that.logger.log("internalerror", LOG_ID, "(getAllOpenInviteIdPerRoomOfAUser) error : ", err);
                return reject(err);
            });
        });
    };

    generateNewPublicUrl(  bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let param = {
                "roomId" : bubbleId
            };
            that.logger.log("internal", LOG_ID + "(generateNewPublicUrl) REST.");

            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.userId + "/public-links/reset", that.getRequestHeader(), param, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(generateNewPublicUrl) successfull");
                that.logger.log("internal", LOG_ID + "(generateNewPublicUrl) REST conference updated : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(generateNewPublicUrl) error");
                that.logger.log("internalerror", LOG_ID, "(generateNewPublicUrl) error : ", err);
                return reject(err);
            });
        });
    }

    removePublicUrl(  bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let param = {
                "roomId" : bubbleId
            };
            that.logger.log("internal", LOG_ID + "(removePublicUrl) REST.");

            that.http.put("/api/rainbow/enduser/v1.0/users/" + that.userId + "/public-links/unbind", that.getRequestHeader(), param, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(removePublicUrl) successfull");
                that.logger.log("internal", LOG_ID + "(removePublicUrl) REST conference updated : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(removePublicUrl) error");
                that.logger.log("internalerror", LOG_ID, "(removePublicUrl) error : ", err);
                return reject(err);
            });
        });
    }

    createPublicUrl(  bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let param = {
                "roomId" : bubbleId
            };
            that.logger.log("internal", LOG_ID + "(createPublicUrl) REST.");

            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.userId + "/public-links/bind", that.getRequestHeader(), param, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(createPublicUrl) successfull");
                that.logger.log("internal", LOG_ID + "(createPublicUrl) REST conference updated : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createPublicUrl) error");
                that.logger.log("internalerror", LOG_ID, "(createPublicUrl) error : ", err);
                return reject(err);
            });
        });
    }

    registerGuest(guest : GuestParams ) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(registerGuest) REST.");

            that.http.post("/api/rainbow/enduser/v1.0/users/self-register", that.getRequestHeader(), guest.getUrlParam(), undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(registerGuest) successfull");
                that.logger.log("internal", LOG_ID + "(registerGuest) REST conference updated : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(registerGuest) error");
                that.logger.log("internalerror", LOG_ID, "(registerGuest) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Public url

    //region Conference

    joinConference(webPontConferenceId, role = "moderator") {
        let that = this;
        return new Promise(function (resolve, reject) {
            let muted = "unmuted";
            let params = {participant: {role: role, type: muted}, mediaType: MEDIATYPE.WEBRTC};
            that.logger.log("internal", LOG_ID + "(joinConference) REST params : ", params);

            that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/snapshot?mediaType=webrtc", that.getRequestHeader(), params, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(joinConference) successfull");
                that.logger.log("internal", LOG_ID + "(joinConference) REST conference updated : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(joinConference) error");
                that.logger.log("internalerror", LOG_ID, "(joinConference) error : ", err);
                return reject(err);
            });
        });
    }

    getRoomByConferenceEndpointId (conferenceEndpointId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(getRoomByConferenceEndpointId) REST.");

            that.http.get("/api/rainbow/enduser/v1.0/rooms?userId=" + that.userId + "&confId=" + conferenceEndpointId + "&format=full", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getRoomByConferenceEndpointId) successfull");
                that.logger.log("internal", LOG_ID + "(getRoomByConferenceEndpointId) REST result : ", json.data);
                that.logger.log("info", LOG_ID + "(getRoomFromConferenceEndpointId) -- " + conferenceEndpointId + " -- success");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getRoomByConferenceEndpointId) error");
                that.logger.log("internalerror", LOG_ID, "(getRoomByConferenceEndpointId) error : ", err);
                return reject(err);
            });
        });


        /*$log.info("[roomService] getRoomFromConferenceEndpointId");

        return $q(function(resolve, reject) {
            $http({
                method: "GET",
                url: service.portalURL + "rooms?userId=" + contactService.userContact.dbId + "&confId=" + conferenceEndpointId + "&format=full",
                headers: authService.getRequestHeader()
            }).then(
                function success(response) {
                    $log.info("[roomService] getRoomFromConferenceEndpointId -- " + conferenceEndpointId + " -- success");
                    var roomData = response.data.data;
                    if (roomData.length) {
                        if (service.getRoomById(roomData[0].id)) {
                            resolve(service.getRoomById(roomData[0].id));
                        } else {
                            service.createRoomFromData(roomData[0]);
                            resolve(service.getRoomById(roomData[0].id));
                        }
                    }
                    else {
                        $log.info("[roomService] getRoomFromConferenceEndpointId -- no room with confId " + conferenceEndpointId);
                        reject();
                    }
                },
                function failure(response) {
                    var errorMessage = "getRoomFromConferenceEndpointId -- " + conferenceEndpointId + " -- failure: " + response.data.errorDetails;
                    $log.error("[roomService] " + errorMessage);
                    reject(new Error(errorMessage));
                });
        }); // */
    };

    conferenceStart(roomId: string, conferenceId : string, mediaType : MEDIATYPE) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params = {roomId : roomId,  mediaType : mediaType};
            that.logger.log("internal", LOG_ID + "(conferenceStart) REST params : ", params);

            that.http.put("/api/rainbow/conference/v1.0/conferences/" + conferenceId + "/start", that.getRequestHeader(), params, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(conferenceStart) successfull");
                that.logger.log("internal", LOG_ID + "(conferenceStart) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(conferenceStart) error");
                that.logger.log("internalerror", LOG_ID, "(conferenceStart) error : ", err);
                return reject(err);
            });
        });
    }

    conferenceStop(conferenceId: string, mediaType : MEDIATYPE, roomId : string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {
                mediaType
            };
            if (mediaType === MEDIATYPE.WEBRTC) {
                params.roomId = roomId;
            }
            that.logger.log("internal", LOG_ID + "(conferenceStop) REST params : ", params);

            that.http.put("/api/rainbow/conference/v1.0/conferences/" + conferenceId + "/stop", that.getRequestHeader(), params, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(conferenceStop) successfull");
                that.logger.log("internal", LOG_ID + "(conferenceStop) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(conferenceStop) error");
                that.logger.log("internalerror", LOG_ID, "(conferenceStop) error : ", err);
                return reject(err);
            });
        });
    }

    conferenceJoin(conferenceId, mediaType , asModerator : boolean, muted : boolean, phoneNumber : string, country : string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let phoneNumberToUse : string = phoneNumber;
            if (phoneNumberToUse === null) {
                phoneNumberToUse = "joinWithoutAudio";
            }
            let params : any = {
                "participantPhoneNumber": phoneNumberToUse,
                "participant": {
                    "role":  asModerator ? "moderator" : "member",
                    "type":  muted ? "muted" : "unmuted"
                },
                mediaType,
                "country": country
            };

            that.logger.log("internal", LOG_ID + "(conferenceJoin) REST params : ", params);

            that.http.post("/api/rainbow/conference/v1.0/conferences/" + conferenceId + "/stop", that.getRequestHeader(), params, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(conferenceJoin) successfull");
                that.logger.log("internal", LOG_ID + "(conferenceJoin) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(conferenceJoin) error");
                that.logger.log("internalerror", LOG_ID, "(conferenceJoin) error : ", err);
                return reject(err);
            });
        });
    }

    conferenceDropParticipant(conferenceId, mediaType, participantId ) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(conferenceDropParticipant) REST mediaType : ", mediaType);

            that.http.delete("/api/rainbow/conference/v1.0/conferences/" + conferenceId + "/participants/" + participantId + "?mediaType=" + mediaType, that.getRequestHeader()).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(conferenceDropParticipant) successfull");
                that.logger.log("internal", LOG_ID + "(conferenceDropParticipant) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(conferenceDropParticipant) error");
                that.logger.log("internalerror", LOG_ID, "(conferenceDropParticipant) error : ", err);
                return reject(err);
            });
        });
    }

    personalConferenceGetPhoneNumbers( ) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(personalConferenceGetPhoneNumbers) REST.");

            that.http.get("/api/rainbow/confprovisioning/v1.0/conferences/audio/phonenumbers?shortList=true" , that.getRequestHeader(), undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(personalConferenceGetPhoneNumbers) successfull");
                that.logger.log("internal", LOG_ID + "(personalConferenceGetPhoneNumbers) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(personalConferenceGetPhoneNumbers) error");
                that.logger.log("internalerror", LOG_ID, "(personalConferenceGetPhoneNumbers) error : ", err);
                return reject(err);
            });
        });
    }

    personalConferenceGetPassCodes( personalConferenceConfEndpointId ) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(personalConferenceGetPhoneNumbers) REST personalConferenceConfEndpointId : ", personalConferenceConfEndpointId);

            that.http.get("/api/rainbow/confprovisioning/v1.0/conferences/" + personalConferenceConfEndpointId + "?format=full" , that.getRequestHeader(), undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(personalConferenceGetPassCodes) successfull");
                that.logger.log("internal", LOG_ID + "(personalConferenceGetPassCodes) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(personalConferenceGetPassCodes) error");
                that.logger.log("internalerror", LOG_ID, "(personalConferenceGetPassCodes) error : ", err);
                return reject(err);
            });
        });
    }

    personalConferenceResetPassCodes( personalConferenceConfEndpointId ) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let param = {
                "resetPasswords":true
            };
            that.logger.log("internal", LOG_ID + "(personalConferenceResetPassCodes) REST personalConferenceConfEndpointId : ", personalConferenceConfEndpointId);

            that.http.put("/api/rainbow/confprovisioning/v1.0/conferences/" + personalConferenceConfEndpointId, that.getRequestHeader(), param, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(personalConferenceResetPassCodes) successfull");
                that.logger.log("internal", LOG_ID + "(personalConferenceResetPassCodes) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(personalConferenceResetPassCodes) error");
                that.logger.log("internalerror", LOG_ID, "(personalConferenceResetPassCodes) error : ", err);
                return reject(err);
            });
        });
    }

    personalConferenceRename( personalConferenceConfEndpointId : string, name : string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let param = {
                "name":name
            };
            that.logger.log("internal", LOG_ID + "(personalConferenceRename) REST personalConferenceConfEndpointId : ", personalConferenceConfEndpointId);

            that.http.put("/api/rainbow/confprovisioning/v1.0/conferences/" + personalConferenceConfEndpointId, that.getRequestHeader(), param, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(personalConferenceRename) successfull");
                that.logger.log("internal", LOG_ID + "(personalConferenceRename) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(personalConferenceRename) error");
                that.logger.log("internalerror", LOG_ID, "(personalConferenceRename) error : ", err);
                return reject(err);
            });
        });
    }

    askConferenceSnapshot(conferenceId : string, type : MEDIATYPE) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params = {};
            that.logger.log("internal", LOG_ID + "(askConferenceSnapshot) REST params : ", params);

            that.http.get("/api/rainbow/conference/v1.0/conferences/" + conferenceId + "/snapshot?mediaType=" + type, that.getRequestHeader(), params).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(askConferenceSnapshot) successfull");
                that.logger.log("internal", LOG_ID + "(askConferenceSnapshot) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(askConferenceSnapshot) error");
                that.logger.log("internalerror", LOG_ID, "(askConferenceSnapshot) error : ", err);
                return reject(err);
            });
        });
    }

    conferenceModeratorAction(conferenceId : string, mediaType : MEDIATYPE, action: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params = {"option":action, "mediaType": mediaType};
            that.logger.log("internal", LOG_ID + "(conferenceModeratorAction) REST params : ", params);

            that.http.put("/api/rainbow/conference/v1.0/conferences/" + conferenceId + "/update", that.getRequestHeader(), params, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(conferenceModeratorAction) successfull");
                that.logger.log("internal", LOG_ID + "(conferenceModeratorAction) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(conferenceModeratorAction) error");
                that.logger.log("internalerror", LOG_ID, "(conferenceModeratorAction) error : ", err);
                return reject(err);
            });
        });
    }

    conferenceModeratorActionOnParticipant(conferenceId : string, mediaType : MEDIATYPE, participantId : string, action: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params = {"option":action, "mediaType": mediaType};
            that.logger.log("internal", LOG_ID + "(conferenceModeratorActionOnParticipant) REST params : ", params);

            that.http.put("/api/rainbow/conference/v1.0/conferences/" + conferenceId + "/participants/" + participantId, that.getRequestHeader(), params, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(conferenceModeratorActionOnParticipant) successfull");
                that.logger.log("internal", LOG_ID + "(conferenceModeratorActionOnParticipant) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(conferenceModeratorActionOnParticipant) error");
                that.logger.log("internalerror", LOG_ID, "(conferenceModeratorActionOnParticipant) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveAllConferences(scheduled) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params = {};
            that.logger.log("internal", LOG_ID + "(retrieveAllConferences) REST params : ", params);
            let url = "/api/rainbow/confprovisioning/v1.0/conferences?";
            if (scheduled != undefined) {
                url += "scheduled=" + scheduled ;
            }
            url += "&format=full&userId=" + that.userId;

            that.http.get(url , that.getRequestHeader(), params).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveAllConferences) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveAllConferences) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveAllConferences) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveAllConferences) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion conference

    //region Offers and subscriptions
    retrieveAllCompanyOffers(companyId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(retrieveAllCompanyOffers) REST companyId : ", companyId);

            that.http.get("/api/rainbow/subscription/v1.0/companies/" + companyId + "/offers" , that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveAllCompanyOffers) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveAllCompanyOffers) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveAllCompanyOffers) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveAllCompanyOffers) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveAllCompanySubscriptions(companyId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(retrieveAllCompanySubscriptions) REST companyId : ", companyId);

            that.http.get("/api/rainbow/subscription/v1.0/companies/" + companyId + "/subscriptions" , that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveAllCompanySubscriptions) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveAllCompanySubscriptions) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveAllCompanySubscriptions) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveAllCompanySubscriptions) error : ", err);
                return reject(err);
            });
        });
    }

    subscribeCompanyToOffer(companyId : string, offerId : string, maxNumberUsers? : number, autoRenew? : boolean  ) {
        let that = this;
        // /api/rainbow/subscription/v1.0/companies/:companyId/subscriptions
        return new Promise(function (resolve, reject) {
            let params : any = {
                offerId //, // Id of the offer to subscribe.
                // maxNumberUsers : 	integer, // optionnel Number of users (licences) bought for this offer. Valeurs autorisées : 1..
                // autoRenew : boolean, // optionnel Specifies if subscription should be renewed automatically or not at the end of the prepaid duration. Applies only for a prepaid offer. If not provided, autoRenew will be true by default.
            };

            if (maxNumberUsers != undefined) {
                params.maxNumberUsers = maxNumberUsers;
            }

            if (autoRenew != undefined) {
                params.autoRenew = autoRenew;
            }

            that.logger.log("internal", LOG_ID + "(subscribeCompanyToOffer) REST params : ", params);

            that.http.post("/api/rainbow/subscription/v1.0/companies/" + companyId + "/subscriptions", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(subscribeCompanyToOffer) successfull");
                that.logger.log("internal", LOG_ID + "(subscribeCompanyToOffer) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(subscribeCompanyToOffer) error");
                that.logger.log("internalerror", LOG_ID, "(subscribeCompanyToOffer) error : ", err);
                return reject(err);
            });
        });
    }

   unSubscribeCompanyToSubscription(companyId : string, subscriptionId : string) {
        let that = this;
// /api/rainbow/subscription/v1.0/companies/:companyId/subscriptions/:subscriptionId
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(unSubscribeCompanyToOffer) REST companyId : ", companyId +", subscriptionId : ", subscriptionId);

            that.http.delete("/api/rainbow/subscription/v1.0/companies/" + companyId + "/subscriptions/" + subscriptionId, that.getRequestHeader()).then((json) => {
                that.logger.log("info", LOG_ID + "(unSubscribeCompanyToOffer) successfull");
                that.logger.log("internal", LOG_ID + "(unSubscribeCompanyToOffer) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(unSubscribeCompanyToOffer) error");
                that.logger.log("internalerror", LOG_ID, "(unSubscribeCompanyToOffer) error : ", err);
                return reject(err);
            });
        });
    }

    subscribeUserToSubscription(userId : string, subscriptionId : string) {
        let that = this;
        // POST /api/rainbow/admin/v1.0/users/:userId/profiles/subscriptions/:subscriptionId
        return new Promise(function (resolve, reject) {
            let params : any = {
                // autoRenew : boolean, // optionnel Specifies if subscription should be renewed automatically or not at the end of the prepaid duration. Applies only for a prepaid offer. If not provided, autoRenew will be true by default.
            };

            that.logger.log("internal", LOG_ID + "(subscribeUserToSubscription) REST params : ", params);

            that.http.post("/api/rainbow/admin/v1.0/users/" + userId + "/profiles/subscriptions/" + subscriptionId, that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(subscribeUserToSubscription) successfull");
                that.logger.log("internal", LOG_ID + "(subscribeUserToSubscription) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(subscribeUserToSubscription) error");
                that.logger.log("internalerror", LOG_ID, "(subscribeUserToSubscription) error : ", err);
                return reject(err);
            });
        });
    }

    unSubscribeUserToSubscription(userId : string, subscriptionId : string) {
        let that = this;
        // POST /api/rainbow/admin/v1.0/users/:userId/profiles/subscriptions/:subscriptionId
        return new Promise(function (resolve, reject) {
            let params : any = {
                // autoRenew : boolean, // optionnel Specifies if subscription should be renewed automatically or not at the end of the prepaid duration. Applies only for a prepaid offer. If not provided, autoRenew will be true by default.
            };

            that.logger.log("internal", LOG_ID + "(unSubscribeUserToSubscription) REST params : ", params);

            that.http.delete("/api/rainbow/admin/v1.0/users/" + userId + "/profiles/subscriptions/" + subscriptionId, that.getRequestHeader()).then((json) => {
                that.logger.log("info", LOG_ID + "(unSubscribeUserToSubscription) successfull");
                that.logger.log("internal", LOG_ID + "(unSubscribeUserToSubscription) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(unSubscribeUserToSubscription) error");
                that.logger.log("internalerror", LOG_ID, "(unSubscribeUserToSubscription) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion

}

export {RESTService, MEDIATYPE, GuestParams};
module.exports.RESTService = RESTService;
module.exports.MEDIATYPE = MEDIATYPE;
module.exports.GuestParams = GuestParams;
