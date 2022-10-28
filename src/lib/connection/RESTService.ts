"use strict";

import jwtDecode from "jwt-decode";
import * as btoa from "btoa";
import * as CryptoJS from "crypto-js";

import * as backoff from "backoff";

import {addParamToUrl, logEntryExit, makeId} from "../common/Utils.js";
import {createPassword} from "../common/Utils.js";

import  {RESTTelephony} from "./RestServices/RESTTelephony";
import {HTTPService} from "./HttpService";
import {Invitation} from "../common/models/Invitation";
import {Contact} from "../common/models/Contact";
import EventEmitter = NodeJS.EventEmitter;
import {Logger} from "../common/Logger";
import {error} from "winston";
import {ROOMROLE} from "../services/S2SService";
import {urlencoded} from "body-parser";
import {Core} from "../Core";
import {Channel} from "../common/models/Channel";
import {ErrorManager} from "../common/ErrorManager";
import {RESTConferenceV2} from "./RestServices/RESTConferenceV2";
import {RESTWebinar} from "./RestServices/RESTWebinar";
import {GenericService} from "../services/GenericService";
import {GenericRESTService} from "./GenericRESTService";

const jwt : any = jwtDecode;

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
class RESTService extends GenericRESTService {
    public http: HTTPService;
    public account: any;
    public app: any;
    //public token: any;
    public renewTokenInterval: any;
    //public auth: any;
    //public _credentials: any;
    //public _application: any;
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
    public restConferenceV2: RESTConferenceV2;
    public restWebinar: RESTWebinar;
    public applicationToken: string;
    public connectionS2SInfo: any;
    private reconnectInProgress: boolean;
    private _options: any;

    static getClassName(){ return 'RESTService'; }
    getClassName(){ return RESTService.getClassName(); }

    constructor(_options, evtEmitter: EventEmitter, _logger: Logger, core : Core) {
        super();
        let that = this;
        let self = this;
        this.eventEmitter = evtEmitter;
        this.logger = _logger;
        this.restTelephony = new RESTTelephony(evtEmitter, _logger);
        this.restConferenceV2 = new RESTConferenceV2(evtEmitter, _logger);
        this.restWebinar = new RESTWebinar(evtEmitter, _logger);

        this.http = null;
        this.account = null;
        this.app = null;
        this.tokenRest = null;
        this.renewTokenInterval = null;
        this._options =  _options;
        this.credentialsRest = _options.credentials;
        this.applicationRest = _options.applicationOptions;
        this.loginEmail = _options.credentials.login
        this.authRest = btoa(this.credentials.login + ":" + this.credentials.password);

        this.currentAttempt = 0;
        this.attempt_succeeded_callback = undefined;
        this.attempt_failed_callback = undefined;
        this.attempt_promise_resolver = {resolve: undefined, reject: undefined};
        this.reconnectInProgress = false;

        this._isOfficialRainbow = _options._isOfficialRainbow();

        this.maxAttemptToReconnect = 50;

        this.fibonacciStrategy = new backoff.FibonacciStrategy({
            randomisationFactor: 0.4,
            initialDelay: RECONNECT_INITIAL_DELAY,
            maxDelay: RECONNECT_MAX_DELAY
        });
        this.reconnectDelay = this.fibonacciStrategy.getInitialDelay();


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
        let prom : Array<Promise<any>> = [];
         prom.push(that.restTelephony.start(that.http).then(() => {
            that.logger.log("internal", LOG_ID + "(start) restTelephony email used", that.loginEmail);
        }));
         prom.push(that.restConferenceV2.start(that.http).then(() => {
            that.logger.log("internal", LOG_ID + "(start) restConferenceV2 email used", that.loginEmail);
        }));
         prom.push(that.restWebinar.start(that.http).then(() => {
            that.logger.log("internal", LOG_ID + "(start) restWebinar email used", that.loginEmail);
        }));
        return Promise.all(prom);
    }

    stop() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.restTelephony.stop().then(() => {
                that.logger.log("internal", LOG_ID + "(stop) restTelephony.");
            });
            
            that.restConferenceV2.stop().then(() => {
                that.logger.log("internal", LOG_ID + "(stop) restConferenceV2.");
            });
            
            that.restWebinar.stop().then(() => {
                that.logger.log("internal", LOG_ID + "(stop) restWebinar.");
            });
            
            that.signout().then(() => {
                that.logger.log("debug", LOG_ID + "(stop) Successfully stopped");
                resolve(undefined);
            }).catch((err) => {
                return reject(err);
            });
        });
    }

    async signin(token: string = undefined) {
        let that = this;

        // Login by the token provided in parameter.
        if (token) {
            return await this.getContactByToken(token);
            /*
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
                that.tokenRest = JSON.token;
                that.decodedtokenRest = decodedtoken;

                //let loggedInUser = await that.getContactInformationByLoginEmail(decodedtoken.user.loginEmail).then(async (contactsFromServeur: [any]) => {
                let loggedInUser = await that.getContactInformationByID(decodedtoken.user.id).then(async (contactsFromServeur: any) => {
                    if (contactsFromServeur ) {
                        let contact: Contact = null;
                        that.logger.log("info", LOG_ID + "(signin) contact found on server, get full infos.");
                        let _contactFromServer = contactsFromServeur;
                        if (_contactFromServer) {
                            // The contact is not found by email in the that.contacts tab, so it need to be find on server to get or update it.
                            return await that.getContactInformationByID(_contactFromServer.id).then((_contactInformation: any) => {
                                that.logger.log("internal", LOG_ID + "(signin) contact full infos : ", _contactInformation);
                                return _contactInformation;
                            });
                        }
                    } else {
                        that.logger.log("debug", LOG_ID + "(signin) getContactInformationByID no contacts found : ", contactsFromServeur);
                        return Promise.reject(contactsFromServeur);
                    }
                }).catch((errr) => {
                    that.logger.log("debug", LOG_ID + "(signin) getContactInformationByLoginEmail Error !!! error : ", errr);
                    return Promise.reject(errr);
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
            // */
        }
        // If no token is provided, then signin with user/pwd credentials.
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/authentication/v1.0/login", that.getLoginHeader(), undefined).then(async function (JSON) {
                that.account = JSON.loggedInUser;
                that.account.jid = that.account.jid ? that.account.jid : that.account.jid_im;
                that.app = JSON.loggedInApplication;
                that.tokenRest = JSON.token;

                let companyInfo = await that.getCompanyInfos(that.account.companyId, "full",false,undefined,undefined,undefined,undefined,undefined, undefined,undefined).catch((err) => {
                            that.logger.log("warn", LOG_ID + "(signin) failed to get company information : ", err);
                        }
                );
                that.account.company = companyInfo;
                
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

    set tokenRest(value: any) {
        this._token = value;
        this.restConferenceV2.p_token = value;
        this.restWebinar.p_token = value;
    }

    set decodedtokenRest(value: any) {
        this._decodedtokenRest = value;
        this.restConferenceV2.p_decodedtokenRest = value;
        this.restWebinar.p_decodedtokenRest = value;
    }

    set credentialsRest(value: any) {
        this._credentials = value;
        this.restConferenceV2.p_credentials = value;
        this.restWebinar.p_credentials = value;
    }

    set applicationRest(value: any) {
        this._application = value;
        this.restConferenceV2.p_application = value;
        this.restWebinar.p_application = value;
    }

    set authRest(value: any) {
        this._auth = value;
        this.restConferenceV2.p_auth = value;
        this.restWebinar.p_auth = value;
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
                    that.tokenRest = null;
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

   async startTokenSurvey() {

       let that = this;

       let decodedToken = jwt(that.token);
       //that.logger.log("debug", LOG_ID + "(startTokenSurvey) - token.");
       that.logger.log("info", LOG_ID + "(startTokenSurvey) - token, exp : ", decodedToken.exp, ", iat : ", decodedToken.iat);
       that.logger.log("internal", LOG_ID + "(startTokenSurvey) - token oauth, decodedToken : ", decodedToken);
       if (decodedToken.exp && decodedToken.iat) {
           that.logger.log("info", LOG_ID + "(startTokenSurvey) token decoded : start Date : ", new Date(decodedToken.iat * 1000), ", end Date: ", new Date(decodedToken.exp * 1000));
       }
       let halfExpirationDate = (decodedToken.exp - decodedToken.iat) / 2 + decodedToken.iat;
       let tokenExpirationTimestamp = halfExpirationDate * 1000;
       let expirationDate = new Date(tokenExpirationTimestamp);
       let currentDate = new Date();
       let currentTimestamp = currentDate.valueOf();
       let halftokenExpirationDuration = tokenExpirationTimestamp - currentTimestamp;
       let fulltokenExpirationDuration = (decodedToken.exp * 1000) - currentTimestamp;

       let usedExpirationDuration = halftokenExpirationDuration - 3600000; // Refresh 1 hour before the token expiration - negative values are well treated by settimeout
       that.logger.log("info", LOG_ID + "(startTokenSurvey) token decoded : expirationDate: " + expirationDate + " currentDate:" + currentDate + " halftokenExpirationDuration: " + halftokenExpirationDuration + "ms usedExpirationDuration: " + usedExpirationDuration + "ms fulltokenExpirationDuration: ", fulltokenExpirationDuration, ")");

       if (decodedToken && !decodedToken.oauth) {
           if (halftokenExpirationDuration < 0) {
               that.logger.log("warn", LOG_ID + "(startTokenSurvey) auth token has already expired, re-new it immediately");
               that._renewAuthToken();
           } else if (halftokenExpirationDuration < 300000) {
               that.logger.log("warn", LOG_ID + "(startTokenSurvey) auth token will expire in less 5 minutes, re-new it immediately : ", halftokenExpirationDuration);
               that._renewAuthToken();
           } else {
               let timeToRemoveTousedExpirationDurationBeforeRenew = 3600000 // 1 hour 
               // let timeToRemoveTousedExpirationDurationBeforeRenew = 0 //  
               let usedExpirationDuration = halftokenExpirationDuration - timeToRemoveTousedExpirationDurationBeforeRenew; // Refresh timeToRemoveTousedExpirationDurationBeforeRenew before the token expiration - negative values are well treated by settimeout
               that.logger.log("info", LOG_ID + "(startTokenSurvey) start token survey (expirationDate: " + expirationDate + " currentDate:" + currentDate + " halftokenExpirationDuration: " + halftokenExpirationDuration + "ms usedExpirationDuration: " + usedExpirationDuration + "ms fulltokenExpirationDuration: ", fulltokenExpirationDuration, ")");
               if (that.renewTokenInterval) {
                   that.logger.log("info", LOG_ID + "(startTokenSurvey) remove timer");
                   clearTimeout(that.renewTokenInterval);
               }
               that.logger.log("info", LOG_ID + "(startTokenSurvey) start a new timer for renewing token in ", usedExpirationDuration, " ms");
               that.renewTokenInterval = setTimeout(function () {
                   that.logger.log("info", LOG_ID + "(startTokenSurvey) renewing token timer elapsed.");
                   that._renewAuthToken();
               }, usedExpirationDuration);
           }
       } else if (decodedToken) { // token is from oauth external login, so we can not refresh it by ourself.
           usedExpirationDuration = halftokenExpirationDuration ;
           that.logger.log("info", LOG_ID + "(startTokenSurvey) start token oauth survey (expirationDate: " + expirationDate + " currentDate:" + currentDate + " halftokenExpirationDuration: " + halftokenExpirationDuration + "ms usedExpirationDuration: " + usedExpirationDuration + "ms fulltokenExpirationDuration: ", fulltokenExpirationDuration, ")");
           if (fulltokenExpirationDuration < 0) {
               that.logger.log("warn", LOG_ID + "(startTokenSurvey) oauth token has already expired, needs to be re-newed it immediately");
               //this.logger.log("internal", LOG_ID + "(startTokenSurvey) oauth evt_internal_onusertokenrenewfailed.");
               this.eventEmitter.emit("evt_internal_onusertokenrenewfailed", that.token);
           } else if (halftokenExpirationDuration < 0) {
               that.logger.log("warn", LOG_ID + "(startTokenSurvey) oauth token will expire in half duration of the token in : ", tokenExpirationTimestamp, " minutes, needs to be re-newed it immediately");
               //this.logger.log("internal", LOG_ID + "(startTokenSurvey) oauth evt_internal_onusertokenwillexpire.");
               this.eventEmitter.emit("evt_internal_onusertokenwillexpire", that.token);
           } else {
               if (that.renewTokenInterval) {
                   that.logger.log("info", LOG_ID + "(startTokenSurvey) remove timer");
                   clearTimeout(that.renewTokenInterval);
               }
               that.logger.log("info", LOG_ID + "(startTokenSurvey) start a new timer for renewing token in ", usedExpirationDuration, " ms");
               that.renewTokenInterval = setTimeout(function () {
                   //this.logger.log("internal", LOG_ID + "(startTokenSurvey) oauth evt_internal_onusertokenwillexpire.");
                   that.eventEmitter.emit("evt_internal_onusertokenwillexpire", that.token);
                   //that.startTokenSurvey()
               }, usedExpirationDuration);
           }
       } else {
           that.logger.log("info", LOG_ID + "(startTokenSurvey) decodedToken undefined.");
       }
   }

    _renewAuthToken() {
        let that = this;
        that.http.get("/api/rainbow/authentication/v1.0/renew", that.getRequestHeader(), undefined).then(function (JSON) {
            that.logger.log("info", LOG_ID + "(_renewAuthToken) renew authentication token success");
            that.tokenRest = JSON.token;
            that.logger.log("internal", LOG_ID + "(_renewAuthToken) new token received", that.token);
            that.eventEmitter.emit("evt_internal_tokenrenewed");
        }).catch(function (err) {
            that.logger.log("error", LOG_ID, "(_renewAuthToken) renew authentication token failure");
            that.logger.log("internalerror", LOG_ID, "(_renewAuthToken) renew authentication token failure : ", err);
            clearTimeout(that.renewTokenInterval);
            that.renewTokenInterval = null;
            that.eventEmitter.emit("evt_internal_tokenexpired");
        });
    }

    //region Contacts API
    
    //region Contacts API - Search portal

    // phonebook
    searchInAlldirectories (pbxId? : string, systemId? : string, numberE164? : string, shortnumber? : string, format : string = "small", limit : number = 100, offset? : number, sortField : string = "reverseDisplayName", sortOrder : number = 1) {
        // API https://api.openrainbow.org/search/#api-phonebook-search_alldirectories_by_GET
        // GET /api/rainbow/search/v1.0/alldirectories


        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(searchInAlldirectories) REST numberE164 : ", numberE164);

            let url: string = "/api/rainbow/search/v1.0/alldirectories";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "pbxId", pbxId);
            addParamToUrl(urlParamsTab, "systemId", systemId);
            addParamToUrl(urlParamsTab, "numberE164", numberE164);
            addParamToUrl(urlParamsTab, "shortnumber", shortnumber);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(searchInAlldirectories) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(searchInAlldirectories) successfull");
                that.logger.log("internal", LOG_ID + "(searchInAlldirectories) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(searchInAlldirectories) error");
                that.logger.log("internalerror", LOG_ID, "(searchInAlldirectories) error : ", err);
                return reject(err);
            });
        });
    }
    
    searchInPhonebook (pbxId : string, name : string, number : string, format : string, limit : number, offset : number, sortField : string, sortOrder : number ) {
        // API https://api.openrainbow.org/search/#api-phonebook-search_phonebooks_by_GET
        // GET /api/rainbow/search/v1.0/phonebooks

        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(searchInPhonebook) REST number : ", number);

            let url: string = "/api/rainbow/search/v1.0/phonebooks";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "pbxId", pbxId);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "number", number);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset );
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder );            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(searchInPhonebook) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(searchInPhonebook) successfull");
                that.logger.log("internal", LOG_ID + "(searchInPhonebook) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(searchInPhonebook) error");
                that.logger.log("internalerror", LOG_ID, "(searchInPhonebook) error : ", err);
                return reject(err);
            });
        });
    }
    
    // users
    searchUserByPhonenumber(number) {
        // API https://api.openrainbow.org/search/#api-users-search_phone-numbers_users
        // GET /api/rainbow/search/v1.0/phone-numbers/:number/users

        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(searchUserByPhonenumber) REST number : ", number);

            let url: string = "/api/rainbow/search/v1.0/phone-numbers/" + number + "/users";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
//            addParamToUrl(urlParamsTab, "limit", limit);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(searchUserByPhonenumber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(searchUserByPhonenumber) successfull");
                that.logger.log("internal", LOG_ID + "(searchUserByPhonenumber) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(searchUserByPhonenumber) error");
                that.logger.log("internalerror", LOG_ID, "(searchUserByPhonenumber) error : ", err);
                return reject(err);
            });
        });    
    }
    
    searchUsers(limit : number = 20, displayName? : string, search? : string, companyId? : string, excludeCompanyId? : string, offset? : number, sortField? : string, sortOrder : number = 1){
        // API https://api.openrainbow.org/search/#api-users-SearchUsers
        // GET /api/rainbow/search/v1.0/users

        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(searchUsers) REST companyId : ", companyId);

            let url: string = "/api/rainbow/search/v1.0/users";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "displayName", displayName);
            addParamToUrl(urlParamsTab, "search", search);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "excludeCompanyId", excludeCompanyId);
            addParamToUrl(urlParamsTab, "offset", offset );
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder );
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(searchUsers) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(searchUsers) successfull");
                that.logger.log("internal", LOG_ID + "(searchUsers) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(searchUsers) error");
                that.logger.log("internalerror", LOG_ID, "(searchUsers) error : ", err);
                return reject(err);
            });
        });
    }
    
    //endregion Contacts API - Search portal

    async getAllUsers(format = "small", offset = 0, limit = 100, sortField = "loginEmail", companyId? : string, searchEmail? : string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(getAllUsers) that.account.roles : ", that.account.roles);
            if (!companyId) {
                companyId = that.account.companyId;
            }
            let url = "/api/rainbow/admin/v1.0/users?format=" + encodeURIComponent(format) + "&limit=" + limit + "&offset=" + offset + "&sortField=" + encodeURIComponent(sortField) + "&sortOrder=-1" + "&companyId=" + encodeURIComponent(companyId);
            if (searchEmail) {
                url += "&searchEmail=" + encodeURIComponent(searchEmail);
            }
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getAllUsers) successfull");
                that.logger.log("internal", LOG_ID + "(getAllUsers) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllUsers) error");
                that.logger.log("internalerror", LOG_ID, "(getAllUsers) error : ", err);
                return reject(err);
            });
            that.logger.log("info", LOG_ID + "(getAllUsers) after sending the request");
        });
    }

    //async getAllUsersByFilter(format = "small", offset = 0, limit = 100, sortField = "loginEmail", companyId? : string, searchEmail? : string) {
    async getAllUsersByFilter(searchEmail :string, companyId : string , roles : string ="user", excludeRoles : string, tags : string, departments : string, isTerminated  : string = "false", isActivated : string, fileSharingCustomisation : string, userTitleNameCustomisation : string, softphoneOnlyCustomisation : string, 
                              useRoomCustomisation : string,  phoneMeetingCustomisation : string,
                              useChannelCustomisation : string, useScreenSharingCustomisation : string, useWebRTCVideoCustomisation : string, useWebRTCAudioCustomisation : string, instantMessagesCustomisation : string, userProfileCustomisation : string, fileStorageCustomisation : string, 
                              overridePresenceCustomisation : string, alert : string, changeTelephonyCustomisation : string, changeSettingsCustomisation : string, recordingConversationCustomisation : string,
                              useGifCustomisation : string, useDialOutCustomisation : string, fileCopyCustomisation : string, fileTransferCustomisation : string, forbidFileOwnerChangeCustomisation : string, readReceiptsCustomisation : string, useSpeakingTimeStatistics : string, 
                              selectedAppCustomisationTemplate : string, format : string, limit : string,
                              offset : string, sortField : string, sortOrder : string, displayName : string, useEmails : boolean, companyName : string, loginEmail : string, email : string, visibility : string, organisationId : string, siteId : string, jid_im : string, jid_tel : string ) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(getAllUsersByFilter) that.account.roles : ", that.account.roles);
            let url = "/api/rainbow/admin/v1.0/users"; // ?format=" + encodeURIComponent(format) + "&limit=" + limit + "&offset=" + offset + "&sortField=" + encodeURIComponent(sortField) + "&sortOrder=-1" + "&companyId=" + encodeURIComponent(companyId);
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            /*if (!companyId) {
                companyId = that.account.companyId;
            } // */           

            addParamToUrl(urlParamsTab, "searchEmail", searchEmail);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "roles", roles);
            addParamToUrl(urlParamsTab, "excludeRoles", excludeRoles);
            addParamToUrl(urlParamsTab, "tags", tags );
            addParamToUrl(urlParamsTab, "departments", departments );
            addParamToUrl(urlParamsTab, "isTerminated", isTerminated );
            addParamToUrl(urlParamsTab, "isActivated", isActivated );
            addParamToUrl(urlParamsTab, "fileSharingCustomisation", fileSharingCustomisation );
            addParamToUrl(urlParamsTab, "userTitleNameCustomisation", userTitleNameCustomisation );
            addParamToUrl(urlParamsTab, "softphoneOnlyCustomisation", softphoneOnlyCustomisation );
            addParamToUrl(urlParamsTab, "useRoomCustomisation", useRoomCustomisation );
            addParamToUrl(urlParamsTab, "phoneMeetingCustomisation", phoneMeetingCustomisation );
            addParamToUrl(urlParamsTab, "useChannelCustomisation", useChannelCustomisation );
            addParamToUrl(urlParamsTab, "useScreenSharingCustomisation", useScreenSharingCustomisation );
            addParamToUrl(urlParamsTab, "useWebRTCVideoCustomisation", useWebRTCVideoCustomisation );
            addParamToUrl(urlParamsTab, "useWebRTCAudioCustomisation", useWebRTCAudioCustomisation );
            addParamToUrl(urlParamsTab, "instantMessagesCustomisation", instantMessagesCustomisation );
            addParamToUrl(urlParamsTab, "userProfileCustomisation", userProfileCustomisation );
            addParamToUrl(urlParamsTab, "fileStorageCustomisation", fileStorageCustomisation );
            addParamToUrl(urlParamsTab, "overridePresenceCustomisation", overridePresenceCustomisation );
            addParamToUrl(urlParamsTab, "alert", alert );
            addParamToUrl(urlParamsTab, "changeTelephonyCustomisation", changeTelephonyCustomisation );
            addParamToUrl(urlParamsTab, "changeSettingsCustomisation", changeSettingsCustomisation );
            addParamToUrl(urlParamsTab, "recordingConversationCustomisation", recordingConversationCustomisation );
            addParamToUrl(urlParamsTab, "useGifCustomisation", useGifCustomisation );
            addParamToUrl(urlParamsTab, "useDialOutCustomisation", useDialOutCustomisation );
            addParamToUrl(urlParamsTab, "fileCopyCustomisation", fileCopyCustomisation );
            addParamToUrl(urlParamsTab, "fileTransferCustomisation", fileTransferCustomisation );
            addParamToUrl(urlParamsTab, "forbidFileOwnerChangeCustomisation", forbidFileOwnerChangeCustomisation );
            addParamToUrl(urlParamsTab, "readReceiptsCustomisation", readReceiptsCustomisation );
            addParamToUrl(urlParamsTab, "useSpeakingTimeStatistics", useSpeakingTimeStatistics );
            addParamToUrl(urlParamsTab, "selectedAppCustomisationTemplate", selectedAppCustomisationTemplate );
            addParamToUrl(urlParamsTab, "format", format );
            addParamToUrl(urlParamsTab, "limit", limit );
            addParamToUrl(urlParamsTab, "offset", offset );
            addParamToUrl(urlParamsTab, "sortField", sortField );
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder );
            addParamToUrl(urlParamsTab, "displayName", displayName );
            addParamToUrl(urlParamsTab, "useEmails", useEmails );
            addParamToUrl(urlParamsTab, "companyName", companyName );
            addParamToUrl(urlParamsTab, "loginEmail", loginEmail );
            addParamToUrl(urlParamsTab, "email", email );
            addParamToUrl(urlParamsTab, "visibility", visibility );
            addParamToUrl(urlParamsTab, "organisationId", organisationId );
            addParamToUrl(urlParamsTab, "siteId", siteId );
            addParamToUrl(urlParamsTab, "jid_im", jid_im );
            addParamToUrl(urlParamsTab, "jid_tel", jid_tel );
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getAllUsersByFilter) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that.logger.log("info", LOG_ID + "(getAllUsersByFilter) successfull");
                that.logger.log("internal", LOG_ID + "(getAllUsersByFilter) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllUsersByFilter) error");
                that.logger.log("internalerror", LOG_ID, "(getAllUsersByFilter) error : ", err);
                return reject(err);
            });
            that.logger.log("info", LOG_ID + "(getAllUsersByFilter) after sending the request");
        });
    }

    async getContactInfos(userId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(getContactInfos) that.account.roles : ", that.account.roles);
            that.http.get("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getContactInfos) successfull");
                that.logger.log("internal", LOG_ID + "(getContactInfos) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getContactInfos) error");
                that.logger.log("internalerror", LOG_ID, "(getContactInfos) error : ", err);
                return reject(err);
            });
            that.logger.log("info", LOG_ID + "(getContactInfos) after sending the request");
        });
    }

    async putContactInfos(userId, infos) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(getContactInfos) that.account.roles : ", that.account.roles);
            that.http.put("/api/rainbow/admin/v1.0/users/" + userId, that.getRequestHeader(), infos, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getContactInfos) successfull");
                that.logger.log("internal", LOG_ID + "(getContactInfos) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getContactInfos) error");
                that.logger.log("internalerror", LOG_ID, "(getContactInfos) error : ", err);
                return reject(err);
            });
            that.logger.log("info", LOG_ID + "(getContactInfos) after sending the request");
        });
    }

    async getContacts() {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/enduser/v1.0/users/networks?format=full", that.getRequestHeader(), undefined,"", 5, 10000).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getContacts) successfull");
                that.logger.log("internal", LOG_ID + "(getContacts) REST result : " + json.total + " contacts");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getContacts) error");
                that.logger.log("internalerror", LOG_ID, "(getContacts) error : ", err);
                return reject(err);
            });
        });
    }

    async removeContactFromRoster(dbId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!dbId) {
                that.logger.log("debug", LOG_ID + "(removeContactFromRoster) failed");
                that.logger.log("info", LOG_ID + "(removeContactFromRoster) No dbId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/enduser/v1.0/users/networks/" + dbId, that.getRequestHeader()).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(removeContactFromRoster) successfull");
                    that.logger.log("internal", LOG_ID + "(removeContactFromRoster) REST result : " + json.total + " contacts");
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(removeContactFromRoster) error");
                    that.logger.log("internalerror", LOG_ID, "(removeContactFromRoster) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    async getContactInformationByJID(jid) {
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
                    that.logger.log("internal", LOG_ID + "(getContactInformationByJID) REST result : ", json.data);
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

    async getContactInformationByID(id) {
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!id) {
                that.logger.log("debug", LOG_ID + "(getContactInformationByID) failed");
                that.logger.log("info", LOG_ID + "(getContactInformationByID) No id provided");
                resolve(null);
            } else {
                that.http.get("/api/rainbow/enduser/v1.0/users/" + encodeURIComponent(id) + "?format=full", that.getRequestHeader(), undefined).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(getContactInformationByID) successfull");
                    that.logger.log("internal", LOG_ID + "(getContactInformationByID) REST result : ", json.data);
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

    async getMyInformations() {
        let that = this;
        return new Promise(function (resolve, reject) {
                that.http.get("/api/rainbow/enduser/v1.0/users/me", that.getRequestHeader(), undefined).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(getMyInformations) successfull");
                    that.logger.log("internal", LOG_ID + "(getMyInformations) REST result : ", json.data);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(getMyInformations) error");
                    that.logger.log("internalerror", LOG_ID, "(getMyInformations) error : ", err);
                    if (err && err.code === 404) {
                        resolve(null);
                    } else {
                        return reject(err);
                    }
                });
        });
    }

    async getContactInformationByLoginEmail(email): Promise<[any]> {
        let that = this;
        return new Promise(async function (resolve, reject) {
            if (!email) {
                that.logger.log("debug", LOG_ID + "(getContactInformationByLoginEmail) failed");
                that.logger.log("info", LOG_ID + "(getContactInformationByLoginEmail) No email provided");
                resolve(null);
            } else {
                //that.logger.log("internal", LOG_ID + "(getContactInformationByLoginEmail) with params : ", { "loginEmail": email });
                await that.http.post("/api/rainbow/enduser/v1.0/users/loginEmails", that.getRequestHeader(), {"loginEmail": email}, undefined).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(getContactInformationByLoginEmail) successfull");
                    that.logger.log("internal", LOG_ID + "(getContactInformationByLoginEmail) REST result : ", json.data);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(getContactInformationByLoginEmail) error");
                    that.logger.log("internalerror", LOG_ID, "(getContactInformationByLoginEmail) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    async getContactByToken(token : string){
        let that = this;
        try {
            that.logger.log("internal", LOG_ID + "(getContactByToken) with token : ", token, " : ", that.getLoginHeader());
            let decodedtoken = jwt(token);
            let JSON = {
                "loggedInUser": decodedtoken.user,
                "loggedInApplication": decodedtoken.app,
                "token": token
            };
            if (!that._token || (that._token && that._token != JSON.token)) {
                that.tokenRest = JSON.token;
            }
            if (!that.app || (that.app && that.app.id != JSON.loggedInApplication.id)) {
                that.app = JSON.loggedInApplication;
            }
            if (!that.account || (that.account && that.account.id != JSON.loggedInUser.id)) {
                that.account = JSON.loggedInUser;
                that.account.jid = that.account.jid ? that.account.jid : that.account.jid_im;
                that.decodedtokenRest = decodedtoken;

                //let loggedInUser = await that.getContactInformationByLoginEmail(decodedtoken.user.loginEmail).then(async (contactsFromServeur: [any]) => {
                let loggedInUser = await that.getContactInformationByID(decodedtoken.user.id).then(async (contactsFromServeur: any) => {
                    if (contactsFromServeur) {
                        let contact: Contact = null;
                        that.logger.log("info", LOG_ID + "(getContactByToken) contact found on server, get full infos.");
                        let _contactFromServer = contactsFromServeur;
                        if (_contactFromServer) {
                            // The contact is not found by email in the that.contacts tab, so it need to be find on server to get or update it.
                            return await that.getContactInformationByID(_contactFromServer.id).then((_contactInformation: any) => {
                                that.logger.log("internal", LOG_ID + "(getContactByToken) contact full infos : ", _contactInformation);
                                return _contactInformation;
                            });
                        }
                    } else {
                        that.logger.log("debug", LOG_ID + "(getContactByToken) getContactInformationByID no contacts found : ", contactsFromServeur);
                        return Promise.reject(contactsFromServeur);
                    }
                }).catch((errr) => {
                    that.logger.log("debug", LOG_ID + "(getContactByToken) getContactInformationByLoginEmail Error !!! error : ", errr);
                    return Promise.reject(errr);
                });
                that.account = JSON.loggedInUser = loggedInUser;
                that.account.jid = that.account.jid ? that.account.jid : that.account.jid_im;
            } else {
                that.logger.log("info", LOG_ID + "(getContactByToken) token else of if (!that.account || (that.account && that.account.id != JSON.loggedInUser.id)) " + that.account.id + "!");
            }
            that.logger.log("debug", LOG_ID + "(getContactByToken) token signin, welcome " + that.account.id + "!");
            that.logger.log("internal", LOG_ID + "(getContactByToken) user information ", that.account);
            that.logger.log("internal", LOG_ID + "(getContactByToken) application information : ", that.app);
            return Promise.resolve(JSON);
        } catch (err) {
            that.logger.log("debug", LOG_ID + "(getContactByToken) CATCH Error !!! error : ", err);
            return Promise.reject(err);
        }
    }

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
                that.logger.log("internal", LOG_ID + "(createUser) REST result : ", json.data);
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
            let appId = that.application.appID;
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
                that.logger.log("internal", LOG_ID + "(createGuestUser) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(changePassword) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(updateInformation) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(deleteUser) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteUser) error");
                that.logger.log("internalerror", LOG_ID, "(deleteUser) error : ", err);
                return reject(err);
            });
        });
    }

    updateEndUserInformations(userId, objData) {
        // API : https://api.openrainbow.org/enduser/#api-users-updateUser
        // URL PUT /api/rainbow/enduser/v1.0/users/:userId
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/users/" + userId, that.getRequestHeader(), objData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateEndUserInformations) successfull");
                that.logger.log("internal", LOG_ID + "(updateEndUserInformations) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateEndUserInformations) error");
                that.logger.log("internalerror", LOG_ID, "(updateEndUserInformations) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Contacts API
    
    //region Favorites

    getServerFavorites() {
        let that = this;
        return new Promise(function (resolve, reject) {
            //that.logger.log("internal", LOG_ID + "(getContactInformationByLoginEmail) with params : ", { "loginEmail": email });
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.userId + "/favorites", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
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

    //endregion Favorites

    //region Invitations

    getAllSentInvitations() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/sent?format=full&status=pending&limit=500", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getAllSentInvitations) successfull");
                that.logger.log("internal", LOG_ID + "(getAllSentInvitations) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllSentInvitations) error");
                that.logger.log("internalerror", LOG_ID, "(getAllSentInvitations) error : ", err);
                return reject(err);
            });
        });
    };

    getInvitationsSent(sortField : string = "lastNotificationDate", status : string = "pending", format : string="small", limit : number = 500, offset : number, sortOrder : number = 1) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.logger.log("internal", LOG_ID + "(getInvitationsReceived) REST sortField : ", sortField);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/sent";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset );
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder );
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getInvitationsSent) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getInvitationsSent) successfull");
                that.logger.log("internal", LOG_ID + "(getInvitationsSent) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getInvitationsSent) error");
                that.logger.log("internalerror", LOG_ID, "(getInvitationsSent) error : ", err);
                return reject(err);
            });
        });
    };

    getAllReceivedInvitations() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/received?format=full&status=pending&status=accepted&status=auto-accepted&limit=500", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getAllReceivedInvitations) successfull");
                that.logger.log("internal", LOG_ID + "(getAllReceivedInvitations) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllReceivedInvitations) error");
                that.logger.log("internalerror", LOG_ID, "(getAllReceivedInvitations) error : ", err);
                return reject(err);
            });
        });
    };
    
    getInvitationsReceived(sortField : string = "lastNotificationDate", status : string = "pending", format : string="small", limit : number = 500, offset : number, sortOrder : number = 1) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.logger.log("internal", LOG_ID + "(getInvitationsReceived) REST sortField : ", sortField);

            let url: string = "/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/received";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset );
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder );
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getInvitationsReceived) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getInvitationsReceived) successfull");
                that.logger.log("internal", LOG_ID + "(getInvitationsReceived) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getInvitationsReceived) error");
                that.logger.log("internalerror", LOG_ID, "(getInvitationsReceived) error : ", err);
                return reject(err);
            });
        });
    };

    getServerInvitation(invitationId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations/" + invitationId, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getServerInvitation) successfull");
                that.logger.log("internal", LOG_ID + "(getServerInvitation) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getServerInvitation) error");
                that.logger.log("internalerror", LOG_ID, "(getServerInvitation) error : ", err);
                return reject(err);
            });
        });
    };

    sendInvitationByCriteria(email : string, lang : string, customMessage : string, invitedPhoneNumber : string, invitedUserId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            let params : any = {};
            if (email) {
                params.email = email;
            } 
            if (lang) {
                params.lang = lang;
            } 
            if (customMessage) {
                params.customMessage = customMessage;
            } 
            if (invitedPhoneNumber) {
                params.invitedPhoneNumber = invitedPhoneNumber;
            } 
            if (invitedUserId) {
                params.invitedUserId = invitedUserId;
            } 

            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(sendInvitationByEmail) successfull");
                that.logger.log("internal", LOG_ID + "(sendInvitationByEmail) REST result : ", json);
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
                that.logger.log("internal", LOG_ID + "(cancelOneSendInvitation) REST result : ", json);
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
                that.logger.log("internal", LOG_ID + "(reSendInvitation) REST result : ", json);
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
                that.logger.log("internal", LOG_ID + "(sendInvitationsParBulk) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(sendInvitationsParBulk) error");
                that.logger.log("internalerror", LOG_ID, "(sendInvitationsParBulk) error : ", err);
                return reject(err);
            });
        });
    };

    /**
     * ACCEPT INVITATION
     */
    acceptInvitation(invitation) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(acceptInvitation) invitation : ", invitation);
            that.http.post("/api/rainbow/enduser/v1.0/users/" + invitation.invitedUserId + "/invitations/" + invitation.id + "/accept", that.getRequestHeader(), {}, undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(acceptInvitation) successfull");
                that.logger.log("internal", LOG_ID + "(acceptInvitation) REST result : ", json.data);
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
     */
    declineInvitation(invitation) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(declineInvitation) invitation : ", invitation);
            that.http.post("/api/rainbow/enduser/v1.0/users/" + invitation.invitedUserId + "/invitations/" + invitation.id + "/decline", that.getRequestHeader(), {}, undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(declineInvitation) successfull");
                resolve(undefined);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(declineInvitation) error");
                that.logger.log("internalerror", LOG_ID, "(declineInvitation) error : ", err);
                return reject(err);
            });
        });
    };

    /**
     * SEND INVITATION
     */
    joinContactInvitation(contact) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(joinContactInvitation) contact : ", contact);
            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/invitations", that.getRequestHeader(), {"invitedUserId": contact.id}, undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(joinContactInvitation) successfull");
                that.logger.log("internal", LOG_ID + "(joinContactInvitation) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(joinContacts) REST result : ", json.data);
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
                    that.logger.log("internal", LOG_ID + "(getInvitationById) REST result : ", json.data);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(getInvitationById) error");
                    that.logger.log("internalerror", LOG_ID, "(getInvitationById) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    //endregion Invitations

    //region Groups
    
    getGroups() {
        let that = this;
        let getSetOfGroups = function (page, max, groups) {
            return new Promise((resolve, reject) => {
                that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/groups?format=full&offset=" + page + "&limit=" + max, that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
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
                that.logger.log("internal", LOG_ID + "(getGroup) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(setFavoriteGroup) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(createGroup) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(deleteGroup) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(updateGroupName) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(addUserInGroup) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(removeUserFromGroup) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID + "(removeUserFromGroup) error");
                that.logger.log("internalerror", LOG_ID + "(removeUserFromGroup) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Groups

    getBots() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/bots", that.getRequestHeader(), undefined, "", 5, 10000).then((json) => {
                that.logger.log("info", LOG_ID + "(getBots) successfull");
                that.logger.log("internal", LOG_ID + "(getBots) REST result : " + json.total + " bots");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getBots) error");
                that.logger.log("internalerror", LOG_ID, "(getBots) error : ", err);
                return reject(err);
            });
        });
    }

    //region Presence
    
    /**
     * @description
     *      https://api.openrainbow.org/admin/#api-users_presence-admin_users_GetUserPresence
     * @param {any} userId
     * @return {Promise<unknown>}
     */
    getUserPresenceInformation(userId : string = undefined){
        let that = this;

        if (!userId) {
            userId = that.userId;
        }

        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/admin/v1.0/users/" + userId + "/presences", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getUserPresenceInformation) successfull");
                that.logger.log("internal", LOG_ID + "(getUserPresenceInformation) REST result : ", json, " user presence.");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getUserPresenceInformation) error");
                that.logger.log("internalerror", LOG_ID, "(getUserPresenceInformation) error : ", err);
                return reject(err);
            });
        });
    }

    getMyPresenceInformation(){
        let that = this;

        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/me/presences", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getMyPresenceInformation) successfull");
                that.logger.log("internal", LOG_ID + "(getMyPresenceInformation) REST result : ", json, " user presence.");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getMyPresenceInformation) error");
                that.logger.log("internalerror", LOG_ID, "(getMyPresenceInformation) error : ", err);
                return reject(err);
            });
        });
    }


    //endregion Presence
    
    /**
     * @description
     *      https://api.openrainbow.org/mediapillar/#api-mediapillars-GetMediaPillarsData
     * @return {Promise<unknown>}
     */
    getMediaPillarInfo(){
        let that = this;

        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/mediapillar/v1.0/mediapillars/data", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getMediaPillarInfo) successfull");
                that.logger.log("internal", LOG_ID + "(getMediaPillarInfo) REST result : ", json, " MediaPillar Info");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getMediaPillarInfo) error");
                that.logger.log("internalerror", LOG_ID, "(getMediaPillarInfo) error : ", err);
                return reject(err);
            });
        });
    }

    //region Bubbles

    createBubble(name, description, withHistory) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let history = "none";
            if (withHistory) {
                history = "all";
            }

            that.logger.log("debug", LOG_ID + "(createBubble) will call POST request.");

            that.http.post("/api/rainbow/enduser/v1.0/rooms", that.getRequestHeader(), {
                    name: name,
                    topic: description,
                    history: history
                }
                , undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createBubble) successfull");
                that.logger.log("internal", LOG_ID + "(createBubble) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createBubble) error");
                that.logger.log("internalerror", LOG_ID, "(createBubble) error : ", err);
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
                that.logger.log("internal", LOG_ID + "(setBubbleVisibility) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(setBubbleVisibility) error");
                that.logger.log("internalerror", LOG_ID, "(setBubbleVisibility) error : ", err);
                return reject(err);
            });
        });
    }

    setBubbleAutoRegister(bubbleId: string, autoRegister : string = "unlock") {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + bubbleId, that.getRequestHeader(), {
                        autoRegister: autoRegister
                    }
                    , undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(setBubbleAutoRegister) successfull");
                that.logger.log("internal", LOG_ID + "(setBubbleAutoRegister) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(setBubbleAutoRegister) error");
                that.logger.log("internalerror", LOG_ID, "(setBubbleAutoRegister) error : ", err);
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
                that.logger.log("internal", LOG_ID + "(setBubbleTopic) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(setBubbleName) REST result : ", json.data);
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
                that.http.get("/api/rainbow/enduser/v1.0/rooms?format=full&unsubscribed=true&offset=" + page + "&limit=" + max + "&userId=" + that.account.id, that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                //that.http.get("/api/rainbow/enduser/v1.0/rooms?format=full&offset=" + page + "&limit=" + max + "&userId=" + that.account.id, that.getRequestHeader(), undefined).then(function (json) {
                    bubbles = bubbles.concat(json.data);
                    that.logger.log("info", LOG_ID + "(getBubbles) getSetOfBubbles successfull");
                    that.logger.log("internal", LOG_ID + "(getBubbles) REST result : getSetOfBubbles retrieved " + json.data.length + " bubbles, total " + bubbles.length + ", existing " + json.total);
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
                that.logger.log("internal", LOG_ID + "(getBubbles) getAllBubbles REST result : " + json.length + " bubbles");
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
            if (bubbleId === undefined) {
                that.logger.log("info", LOG_ID + "(getBubble) bad request paramater bubbleId undefined.");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            that.http.get("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "?format=full&unsubscribed=true", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getBubble) successfull");
                that.logger.log("internal", LOG_ID + "(getBubble) REST result : ", json.data);
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
            if (bubbleJid === undefined) {
                that.logger.log("info", LOG_ID + "(getBubble) bad request paramater bubbleJid undefined.");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            that.http.get("/api/rainbow/enduser/v1.0/rooms/jids/" + bubbleJid + "?format=full&unsubscribed=true", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getBubbleByJid) successfull");
                that.logger.log("internal", LOG_ID + "(getBubbleByJid) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(setBubbleCustomData) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(inviteContactToBubble) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(inviteContactToBubble) REST result : ", json.data);
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
                that.logger.log("debug", LOG_ID + "(getRoomUsers) successfull");
                that.logger.log("internal", LOG_ID + "(getRoomUsers) REST result : ", json.total, " users in bubble");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getRoomUsers) error");
                that.logger.log("internalerror", LOG_ID, "(getRoomUsers) error : ", err);
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
                that.logger.log("internal", LOG_ID + "(promoteContactInBubble) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(changeBubbleOwner) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(archiveBubble) REST result : ", json.data);
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
                        that.logger.log("internal", LOG_ID + "(leaveBubble) REST result : ", json.data);
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
                        that.logger.log("internal", LOG_ID + "(leaveBubble) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(deleteBubble) REST result : ", json);
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
                that.logger.log("internal", LOG_ID + "(removeInvitationOfContactToBubble) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(unsubscribeContactFromBubble) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(acceptInvitationToJoinBubble) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(declineInvitationToJoinBubble) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(declineInvitationToJoinBubble) error");
                that.logger.log("internalerror", LOG_ID, "(declineInvitationToJoinBubble) error : ", err);
                return reject(err);
            });
        });
    }

    deleteUserFromBubble(bubbleId) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.delete("/api/rainbow/enduser/v1.0/rooms/" + bubbleId + "/users/" + that.account.id, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(deleteUserFromBubble) successfull");
                that.logger.log("internal", LOG_ID + "(deleteUserFromBubble) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteUserFromBubble) error");
                that.logger.log("internalerror", LOG_ID, "(deleteUserFromBubble) error : ", err);
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
                that.logger.log("internal", LOG_ID + "(inviteUser) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(setAvatarRoom) REST result : ", json);
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
                that.logger.log("internal", LOG_ID + "(deleteAvatarRoom) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(deleteAvatarRoom) error");
                that.logger.log("internalerror", LOG_ID, "(deleteAvatarRoom) error : ", err);
                return reject(err);
            });
        });
    };

    getBubblesConsumption () {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/rooms/consumption", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getBubblesConsumption) successfull");
                that.logger.log("internal", LOG_ID + "(getBubblesConsumption) REST result : ", json );
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getBubblesConsumption) error");
                that.logger.log("internalerror", LOG_ID, "(getBubblesConsumption) error : ", err);
                return reject(err);
            });
        });
    }

    //region CONTAINERS (Bubble Folder)

    // Get all rooms containers
    getAllBubblesContainers (name: string = null) {
        let that = this;
        return new Promise((resolve, reject) => {
            
            let url = "/api/rainbow/enduser/v1.0/rooms/containers";
            if (name) {
                url += "?name=" + name;
            }
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAllBubblesContainers) successfull");
                that.logger.log("internal", LOG_ID + "(getAllBubblesContainers) REST result : ", json );
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllBubblesContainers) error");
                that.logger.log("internalerror", LOG_ID, "(getAllBubblesContainers) error : ", err);
                return reject(err);
            });
        });
    }

    // Get one rooms container
    getABubblesContainersById (id: string = null) {
        let that = this;
        return new Promise((resolve, reject) => {

            let url = "/api/rainbow/enduser/v1.0/rooms/containers";
            if (id) {
                url += "/" + id;
            }
            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getABubblesContainersById) successfull");
                that.logger.log("internal", LOG_ID + "(getABubblesContainersById) REST result : ", json );
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getABubblesContainersById) error");
                that.logger.log("internalerror", LOG_ID, "(getABubblesContainersById) error : ", err);
                return reject(err);
            });
        });
    }

    // Add some rooms to the container
    addBubblesToContainerById(containerId: string , bubbleIds : Array<string> ) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {
                "rooms": bubbleIds
            };
            
            that.http.put("/api/rainbow/enduser/v1.0/rooms/containers/" + containerId + "/add", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(addBubblesToContainersById) successfull");
                that.logger.log("internal", LOG_ID + "(addBubblesToContainersById) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(addBubblesToContainersById) error");
                that.logger.log("internalerror", LOG_ID, "(addBubblesToContainersById) error : ", err);
                return reject(err);
            });
        });
    }
    
    // Change one rooms container name or description
    updateBubbleContainerNameAndDescriptionById(containerId: string , name : string, description? : string ) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {
                "name": name
            };

            if (description) {
                data.description = description;
            }

            that.http.put("/api/rainbow/enduser/v1.0/rooms/containers/" + containerId , that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateBubbleContainersNameAndDescriptionById) successfull");
                that.logger.log("internal", LOG_ID + "(updateBubbleContainersNameAndDescriptionById) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateBubbleContainersNameAndDescriptionById) error");
                that.logger.log("internalerror", LOG_ID, "(updateBubbleContainersNameAndDescriptionById) error : ", err);
                return reject(err);
            });
        });
    }

    // Create a rooms container
    createBubbleContainer(name : string, description? : string, bubbleIds? : Array<string> ) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {
                "name": name
            };

            if (description) {
                data.description = description;
            }

            if (bubbleIds) {
                data.rooms = bubbleIds;
            }

            that.http.post("/api/rainbow/enduser/v1.0/rooms/containers/", that.getRequestHeader("application/json"), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createBubbleContainer) successfull");
                that.logger.log("internal", LOG_ID + "(createBubbleContainer) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createBubbleContainer) error");
                that.logger.log("internalerror", LOG_ID, "(createBubbleContainer) error : ", err);
                return reject(err);
            });
        });
    }

    // Delete one rooms container
    deleteBubbleContainer(containerId) {
        return new Promise((resolve, reject) => {
            let that = this;

            that.http.delete("/api/rainbow/enduser/v1.0/rooms/containers/" + containerId, that.getRequestHeader()).then((json) => {
                that.logger.log("info", LOG_ID + "(deleteBubbleContainer) successfull");
                that.logger.log("internal", LOG_ID + "(deleteBubbleContainer) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(deleteBubbleContainer) error");
                that.logger.log("internalerror", LOG_ID, "(deleteBubbleContainer) error : ", err);
                return reject(err);
            });
        });
    };
    
    // Remove some rooms from the container
    removeBubblesFromContainer(containerId: string , bubbleIds : Array<string> ) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {
                "rooms": bubbleIds
            };

            that.http.put("/api/rainbow/enduser/v1.0/rooms/containers/" + containerId + "/remove", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(removeBubblesFromContainer) successfull");
                that.logger.log("internal", LOG_ID + "(removeBubblesFromContainer) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(removeBubblesFromContainer) error");
                that.logger.log("internalerror", LOG_ID, "(removeBubblesFromContainer) error : ", err);
                return reject(err);
            });
        });
    }
    
    //endregion CONTAINERS
    
    //endregion Bubbles

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

    //region FileStorage
    
    createFileDescriptor(name, extension, size, viewers, voicemessage : boolean, duration : number, encoding : boolean, ccarelogs : boolean, ccareclientlogs : boolean) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {
                fileName: name,
                extension: extension,
                size: size,
                viewers: viewers, 
                voicemessage, 
                duration, 
                encoding, 
                ccarelogs, 
                ccareclientlogs 
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
                that.logger.log("internal", LOG_ID + "(deleteFileDescriptor) REST result : ", json);
                resolve(json);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(deleteFileDescriptor) error");
                that.logger.log("internalerror", LOG_ID, "(deleteFileDescriptor) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveFileDescriptors( fileName : string , extension : string, typeMIME : string, purpose : string, isUploaded : boolean, viewerId : string, path : string, limit : number = 1000, offset : number, sortField : string, sortOrder : number, format : string = "full") {
    //retrieveFileDescriptors(format, limit, offset, viewerId) {
        // API https://api.openrainbow.org/filestorage/#api-files-files_getAll
        // URL GET /api/rainbow/filestorage/v1.0/files
        let that = this;
        return new Promise(function (resolve, reject) {
            /*let queries = [];
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
            // */
            that.logger.log("internal", LOG_ID + "(retrieveFileDescriptors) REST fileName : ", fileName);

            let url: string = "/api/rainbow/filestorage/v1.0/files";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (fileName!=undefined) {
                addParamToUrl(urlParamsTab, "fileName", fileName );
            }
            if (extension!=undefined) {
                addParamToUrl(urlParamsTab, "extension", extension);
            }
            if (typeMIME!=undefined) {
                addParamToUrl(urlParamsTab, "typeMIME", typeMIME);
            }
            if (purpose!=undefined) {
                addParamToUrl(urlParamsTab, "purpose", purpose);
            }
            if (isUploaded!=undefined) {
                addParamToUrl(urlParamsTab, "isUploaded", isUploaded ? "true":"false");
            }
            if (viewerId!=undefined) {
                addParamToUrl(urlParamsTab, "viewerId", viewerId);
            }
            if (path!=undefined) {
                addParamToUrl(urlParamsTab, "path", path);
            }
            addParamToUrl(urlParamsTab, "limit", limit );
            addParamToUrl(urlParamsTab, "offset", offset );
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveFileDescriptors) REST url : ", url);
            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(retrieveFileDescriptors) successfull");
                that.logger.log("info", LOG_ID + "(retrieveFileDescriptors) REST get file descriptors");
                that.logger.log("internal", LOG_ID + "(retrieveFileDescriptors) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveFileDescriptors) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveFileDescriptors) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveFilesReceivedFromPeer(userId, peerId) {
        // API https://api.openrainbow.org/filestorage/#api-files-files_getAllViewerId
        // URL GET /api/rainbow/filestorage/v1.0/files/viewers/:viewerId
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/filestorage/v1.0/files/viewers/" + userId + "?ownerId=" + peerId + "&format=full", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(retrieveFilesReceivedFromPeer) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveFilesReceivedFromPeer) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveFilesReceivedFromPeer) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveFilesReceivedFromPeer) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveReceivedFilesForRoomOrViewer(viewerId, ownerId : string, fileName : boolean, extension : string, typeMIME : string, isUploaded : boolean, purpose : string, roomName : string, overall : boolean, format : string = "full", limit : number = 100, offset : number, sortField : string, sortOrder : number ) {
        // API https://api.openrainbow.org/filestorage/#api-files-files_getAllViewerId
        // URL GET /api/rainbow/filestorage/v1.0/files/viewers/:viewerId
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(retrieveReceivedFilesForRoomOrViewer) REST fileName : ", fileName);

            let url: string = "/api/rainbow/filestorage/v1.0/files/viewers/" + viewerId;
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (ownerId!=undefined) {
                addParamToUrl(urlParamsTab, "ownerId", ownerId);
            }
            if (fileName!=undefined) {
                addParamToUrl(urlParamsTab, "fileName", fileName ? "true":"false");
            }
            if (extension!=undefined) {
                addParamToUrl(urlParamsTab, "extension", extension);
            }
            if (typeMIME!=undefined) {
                addParamToUrl(urlParamsTab, "typeMIME", typeMIME);
            }
            if (purpose!=undefined) {
                addParamToUrl(urlParamsTab, "purpose", purpose);
            }
            if (isUploaded!=undefined) {
                addParamToUrl(urlParamsTab, "isUploaded", isUploaded ? "true":"false");
            }
            if (roomName!=undefined) {
                addParamToUrl(urlParamsTab, "roomName", roomName);
            }
            if (overall!=undefined) {
                addParamToUrl(urlParamsTab, "overall", overall);
            }
            addParamToUrl(urlParamsTab, "limit", limit );
            addParamToUrl(urlParamsTab, "offset", offset );
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveReceivedFilesForRoomOrViewer) REST url : ", url);
            
            that.http.get("/api/rainbow/filestorage/v1.0/files/viewers/" + viewerId + "?format=full", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(retrieveReceivedFilesForRoomOrViewer) successfull");
                that.logger.log("info", LOG_ID + "(retrieveReceivedFilesForRoomOrViewer) REST get file descriptors");
                that.logger.log("internal", LOG_ID + "(retrieveReceivedFilesForRoomOrViewer) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveReceivedFilesForRoomOrViewer) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveReceivedFilesForRoomOrViewer) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveOneFileDescriptor(fileId) {
        // API https://api.openrainbow.org/filestorage/#api-files-files_getOne
        // URL GET /api/rainbow/filestorage/v1.0/files/:fileId
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get("/api/rainbow/filestorage/v1.0/files/" + fileId + "?format=full", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(retrieveOneFileDescriptor) successfull");
                that.logger.log("info", LOG_ID + "(retrieveOneFileDescriptor) REST get file descriptors");
                that.logger.log("internal", LOG_ID + "(retrieveOneFileDescriptor) REST result : ", json);
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
                that.logger.log("internal", LOG_ID + "(retrieveUserConsumption) REST result : ", json);
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
                that.logger.log("internal", LOG_ID + "(deleteFileViewer) RREST result : ", json);
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
                that.logger.log("info", LOG_ID + "(addFileViewer) successfull");
                that.logger.log("internal", LOG_ID + "(addFileViewer) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(addFileViewer) error");
                that.logger.log("internalerror", LOG_ID, "(addFileViewer) error : ", err);
                return reject(err);
            });
        });
    }

    getFileDescriptorsByCompanyId(companyId, fileName : boolean, extension : string, typeMIME : string, purpose : string, isUploaded :boolean, format : string = "small", limit : number = 100, offset : number = 0, sortField : string = "fileName", sortOrder : number = 1) {
        // URL : GET /api/rainbow/filestorage/v1.0/companies/:companyId/files
        // API : https://api.openrainbow.org/filestorage/#api-files-files_getAllByCompanyId
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(getFileDescriptorsByCompanyId) REST companyId : ", companyId);

            let url: string = "/api/rainbow/filestorage/v1.0/companies/" + companyId + "/files";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            if (fileName!=undefined) {
                addParamToUrl(urlParamsTab, "fileName", fileName ? "true":"false");
            }
            if (extension!=undefined) {
                addParamToUrl(urlParamsTab, "extension", extension);
            }
            if (typeMIME!=undefined) {
                addParamToUrl(urlParamsTab, "typeMIME", typeMIME);
            }
            if (purpose!=undefined) {
                addParamToUrl(urlParamsTab, "purpose", purpose);
            }
            if (isUploaded!=undefined) {
                addParamToUrl(urlParamsTab, "isUploaded", isUploaded ? "true":"false");
            }
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit );
            addParamToUrl(urlParamsTab, "offset", offset );
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder );
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getFileDescriptorsByCompanyId) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getFileDescriptorsByCompanyId) successfull");
                that.logger.log("internal", LOG_ID + "(getFileDescriptorsByCompanyId) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getFileDescriptorsByCompanyId) error");
                that.logger.log("internalerror", LOG_ID, "(getFileDescriptorsByCompanyId) error : ", err);
                return reject(err);
            });
        });
    }

    copyFileInPersonalCloudSpace (fileId : string) {
        // API https://api.openrainbow.org/filestorage/#api-files-files_copyOne
        // URL POST /api/rainbow/filestorage/v1.0/files/:fileId/copy
        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/filestorage/v1.0/files/" + fileId + "/copy", that.getRequestHeader(), undefined, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(copyFileInPersonalCloudSpace) successfull");
                that.logger.log("internal", LOG_ID + "(copyFileInPersonalCloudSpace) REST result : ", json);
                if (json && json.data) {
                    resolve(json.data);
                } else {
                    resolve(json);
                }
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(copyFileInPersonalCloudSpace) error");
                that.logger.log("internalerror", LOG_ID, "(copyFileInPersonalCloudSpace) error : ", err);
                return reject(err);
            });
        });
    }
    
    fileOwnershipChange(fileId : string, userId : string) {
        // API https://api.openrainbow.org/filestorage/#api-files-files_dropOne
        // URL PUT /api/rainbow/filestorage/v1.0/files/:fileId/drop
        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {
                userId
            };

            that.http.put("/api/rainbow/filestorage/v1.0/files/" + fileId + "/drop", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(fileOwnershipChange) successfull");
                that.logger.log("internal", LOG_ID + "(fileOwnershipChange) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(fileOwnershipChange) error");
                that.logger.log("internalerror", LOG_ID, "(fileOwnershipChange) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion FileStorage

    //region FileServer
    
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

    getPartialBufferFromServer(url, minRange, maxRange, index) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let header = that.getRequestHeaderWithRange("responseType: 'arraybuffer'", "bytes=" + minRange + "-" + maxRange);
            //header["responseType"] = 'arraybuffer';
            that.http.get(url, header, undefined, 'arraybuffer').then(function (data) {
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
                that.logger.log("internal", LOG_ID + "(uploadAFile) REST result : ", response);
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
                that.logger.log("internal", LOG_ID + "(uploadAStream) REST result : ", response);
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
                that.logger.log("internal", LOG_ID + "(sendPartialDataToServer) REST result : ", response);
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
                that.logger.log("internal", LOG_ID + "(sendPartialFileCompletion) REST result : ", response);
                resolve(response);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(sendPartialFileCompletion) error");
                that.logger.log("internalerror", LOG_ID, "(sendPartialFileCompletion) error : ", err);
                return reject(err);
            });
        });
    }
    
    //endregion FileServer

    //region Settings
    
    getUserSettings() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/settings", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getUserSettings) successfull");
                that.logger.log("internal", LOG_ID + "(getUserSettings) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(updateUserSettings) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateUserSettings) error");
                that.logger.log("internalerror", LOG_ID, "(updateUserSettings) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Settings

    getServerCapabilities() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/fileserver/v1.0/capabilities", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getServerCapabilities) successfull");
                that.logger.log("internal", LOG_ID + "(getServerCapabilities) REST result : ", json.data);
                resolve(json.data);
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(getServerCapabilities) error");
                that.logger.log("internalerror", LOG_ID, "(getServerCapabilities) error : ", err);
                return reject(err);
            });
        });
    }

    //region Company
    
    getAllCompanies(format  : string = "small", sortField : string = "name" , bpId : string = undefined, catalogId : string = undefined, offerId : string = undefined, offerCanBeSold : boolean = undefined, externalReference : string = undefined, externalReference2 : string = undefined, salesforceAccountId : string = undefined, selectedAppCustomisationTemplate : string = undefined, selectedThemeObj: boolean = undefined, offerGroupName : string = undefined, limit : number = 100, offset : number = 0, sortOrder : number = 1, name : string = undefined, status : string = undefined, visibility : string = undefined, organisationId : string = undefined, isBP : boolean = undefined, hasBP : boolean = undefined, bpType : string = undefined ) {
        // API https://api.openrainbow.org/admin/#api-companies-GetCompanies
        // URL get /api/rainbow/admin/v1.0/companies

        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(getAllCompanies) that.account.roles : ", that.account.roles);

            let url : string = "/api/rainbow/admin/v1.0/companies";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "bpId", bpId);
            addParamToUrl(urlParamsTab, "catalogId", catalogId);
            addParamToUrl(urlParamsTab, "offerId", offerId);
            addParamToUrl(urlParamsTab, "offerCanBeSold", offerCanBeSold);
            addParamToUrl(urlParamsTab, "externalReference", externalReference);
            addParamToUrl(urlParamsTab, "externalReference2", externalReference2);
            addParamToUrl(urlParamsTab, "salesforceAccountId", salesforceAccountId);
            addParamToUrl(urlParamsTab, "selectedAppCustomisationTemplate", selectedAppCustomisationTemplate);
            addParamToUrl(urlParamsTab, "selectedThemeObj", selectedThemeObj);
            addParamToUrl(urlParamsTab, "offerGroupName", offerGroupName);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "visibility", visibility);
            addParamToUrl(urlParamsTab, "organisationId", organisationId);
            addParamToUrl(urlParamsTab, "isBP", isBP);
            addParamToUrl(urlParamsTab, "hasBP", hasBP);
            addParamToUrl(urlParamsTab, "bpType", bpType);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveRainbowUserList) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getAllCompanies) successfull");
                that.logger.log("internal", LOG_ID + "(getAllCompanies) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllCompanies) error");
                that.logger.log("internalerror", LOG_ID, "(getAllCompanies) error : ", err);
                return reject(err);
            });
            that.logger.log("info", LOG_ID + "(getAllCompanies) after sending the request");
        });
    }

    createCompany(name, country, state, offerType) {
        // API https://api.openrainbow.org/admin/#api-companies-PostCompanies
        // URL post /api/rainbow/admin/v1.0/companies
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
                that.logger.log("internal", LOG_ID + "(createCompany) REST result : ", json);
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
        // API https://api.openrainbow.org/admin/#api-companies-GetCompaniesId
        // URL get /api/rainbow/admin/v1.0/companies/:companyId
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.get('/api/rainbow/admin/v1.0/companies/' + companyId, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getCompany) successfull");
                that.logger.log("internal", LOG_ID + "(getCompany) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCompany) error");
                that.logger.log("internalerror", LOG_ID, "(getCompany) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCompany(companyId) {
        // API https://api.openrainbow.org/admin/#api-companies-DeleteCompanies
        // URL delete /api/rainbow/admin/v1.0/companies/:companyId
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(deleteCompany) companyId", companyId);
            that.http.delete('/api/rainbow/admin/v1.0/companies/' + companyId, that.getRequestHeader()).then(function (json) {
                that.logger.log("info", LOG_ID + "(deleteCompany) successfull");
                that.logger.log("internal", LOG_ID + "(deleteCompany) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteCompany) error");
                that.logger.log("internalerror", LOG_ID, "(deleteCompany) error : ", err);
                return reject(err);
            });
        });
    }

    getCompanyInfos(companyId, format : string = "full", selectedThemeObj : boolean = false, name : string, status : string, visibility : string, organisationId : string, isBP : boolean, hasBP : boolean, bpType : string) {
        // API https://api.openrainbow.org/enduser/#api-companies-getCompanyById
        // URL get /api/rainbow/enduser/v1.0/companies/:companyId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = '/api/rainbow/enduser/v1.0/companies/' + companyId;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "selectedThemeObj", selectedThemeObj);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "visibility", visibility);
            addParamToUrl(urlParamsTab, "organisationId", organisationId);
            addParamToUrl(urlParamsTab, "isBP", isBP);
            addParamToUrl(urlParamsTab, "hasBP", hasBP);
            addParamToUrl(urlParamsTab, "bpType", bpType);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getCompanyInfos) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getCompanyInfos) successfull");
                that.logger.log("internal", LOG_ID + "(getCompanyInfos) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCompanyInfos) error");
                that.logger.log("internalerror", LOG_ID, "(getCompanyInfos) error : ", err);
                return reject(err);
            });
        });
    }
    
    //region Company visibility
    
    setVisibilityForCompany(companyId, visibleByCompanyId) {
        // API https://api.openrainbow.org/admin/#api-companies_visibility-PostCompaniesVisibility
        // URL post /api/rainbow/admin/v1.0/companies/:companyId/visible-by/:otherCompanyId
        let that = this;
        return new Promise(function (resolve, reject) {
            that.http.post('/api/rainbow/admin/v1.0/companies/' + companyId + "/visible-by/" + visibleByCompanyId, that.getRequestHeader(), undefined, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(setVisibilityForCompany) successfull");
                that.logger.log("internal", LOG_ID + "(setVisibilityForCompany) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(setVisibilityForCompany) error");
                that.logger.log("internalerror", LOG_ID, "(setVisibilityForCompany) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Company visibility
    
    //endregion Company
    
    //region Customisation Template 

    applyCustomisationTemplates(name : string, companyId : string, userId : string) {
        // API https://api.openrainbow.org/admin/#api-customisation_template-ApplyCompanyTemplate
        // URL POST /api/rainbow/admin/v1.0/customisations/templates/apply
        let that = this;        
        return new Promise(function (resolve, reject) {
            let data = {
                name,
                companyId,
                userId
            };            
            
            that.http.post("/api/rainbow/admin/v1.0/customisations/templates/apply", that.getRequestHeader(), data,undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(applyTemplates) successfull.");
                that.logger.log("internal", LOG_ID + "(applyTemplates) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(applyTemplates) error");
                that.logger.log("internalerror", LOG_ID, "(applyTemplates) error : ", err);
                return reject(err);
            });
        });
    }

    createCustomisationTemplate (name : string, ownedByCompany : string, visibleBy : Array<string>, instantMessagesCustomisation : string, useGifCustomisation : string,
         fileSharingCustomisation : string, fileStorageCustomisation : string, phoneMeetingCustomisation : string, useDialOutCustomisation : string, useChannelCustomisation : string, useRoomCustomisation : string,
         useScreenSharingCustomisation : string, useWebRTCAudioCustomisation : string, useWebRTCVideoCustomisation : string, recordingConversationCustomisation : string, overridePresenceCustomisation : string,
         userProfileCustomisation : string, userTitleNameCustomisation : string, changeTelephonyCustomisation : string, changeSettingsCustomisation : string, fileCopyCustomisation : string,
         fileTransferCustomisation : string, forbidFileOwnerChangeCustomisation : string, readReceiptsCustomisation : string, useSpeakingTimeStatistics : string ) {
        // API https://api.openrainbow.org/admin/#api-customisation_template-CreateCompanyTemplate
        // URL POST /api/rainbow/admin/v1.0/customisations/templates
        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {
                ownedByCompany,
                visibleBy,
                //type,
                instantMessagesCustomisation,
                useGifCustomisation,
                fileSharingCustomisation,
                fileStorageCustomisation,
                phoneMeetingCustomisation,
                useDialOutCustomisation,
                useChannelCustomisation,
                useRoomCustomisation,
                useWebRTCAudioCustomisation,
                useWebRTCVideoCustomisation,
                recordingConversationCustomisation,
                overridePresenceCustomisation,
                userProfileCustomisation,
                userTitleNameCustomisation,
                changeTelephonyCustomisation,
                changeSettingsCustomisation,
                name,
                //createdBy,
                //creationDate,// : '2020-08-24T15:00:45.343Z',
                fileCopyCustomisation,
                fileTransferCustomisation,
                forbidFileOwnerChangeCustomisation,
                useScreenSharingCustomisation,
                readReceiptsCustomisation,
                useSpeakingTimeStatistics,
                //id: '5f43d61db7b6d40988a73e7c'
            };

            that.http.post("/api/rainbow/admin/v1.0/customisations/templates", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(applyTemplates) successfull.");
                that.logger.log("internal", LOG_ID + "(applyTemplates) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(applyTemplates) error");
                that.logger.log("internalerror", LOG_ID, "(applyTemplates) error : ", err);
                return reject(err);
            });
        });
    }
    
    deleteCustomisationTemplate(templateId) {
        // API https://api.openrainbow.org/admin/#api-customisation_template-DeleteCompanyTemplate
        // URL delete /api/rainbow/admin/v1.0/customisations/templates/:templateId
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("debug", LOG_ID + "(deleteCustomisationTemplate) templateId", templateId);
            that.http.delete('/api/rainbow/admin/v1.0/customisations/templates/' + templateId, that.getRequestHeader()).then(function (json) {
                that.logger.log("info", LOG_ID + "(deleteCustomisationTemplate) successfull");
                that.logger.log("internal", LOG_ID + "(deleteCustomisationTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteCustomisationTemplate) error");
                that.logger.log("internalerror", LOG_ID, "(deleteCustomisationTemplate) error : ", err);
                return reject(err);
            });
        });
    }
    
    getAllAvailableCustomisationTemplates (companyId : string = undefined, format : string = "small", limit : number = 100, offset : number = 0, sortField : string = "name", sortOrder : number = 1) {
        // API https://api.openrainbow.org/admin/#api-customisation_template-GetCustomisationTemplateAll
        // URL get /api/rainbow/admin/v1.0/customisations/templates
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/customisations/templates";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getAllAvailableCustomisationTemplates) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {
                
                that.logger.log("info", LOG_ID + "(getAllAvailableCustomisationTemplates) successfull");
                that.logger.log("internal", LOG_ID + "(getAllAvailableCustomisationTemplates) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllAvailableCustomisationTemplates) error");
                that.logger.log("internalerror", LOG_ID, "(getAllAvailableCustomisationTemplates) error : ", err);
                return reject(err);
            });
        });
    }
    
    getRequestedCustomisationTemplate (templateId : string = undefined) {
        // API https://api.openrainbow.org/admin/#api-customisation_template-GetCompanyTemplate
        // URL get /api/rainbow/admin/v1.0/customisations/templates/:templateId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/customisations/templates/"+templateId;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            //addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getRequestedCustomisationTemplate) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then(function (json) {

                that.logger.log("info", LOG_ID + "(getRequestedCustomisationTemplate) successfull");
                that.logger.log("internal", LOG_ID + "(getRequestedCustomisationTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getRequestedCustomisationTemplate) error");
                that.logger.log("internalerror", LOG_ID, "(getRequestedCustomisationTemplate) error : ", err);
                return reject(err);
            });
        });
    }
    
    updateCustomisationTemplate (templateId : string, name : string, visibleBy : string[],
    instantMessagesCustomisation : string = "enabled", useGifCustomisation : string = "enabled", fileSharingCustomisation : string = "enabled", fileStorageCustomisation : string = "enabled", phoneMeetingCustomisation : string = "enabled",
    useDialOutCustomisation : string = "enabled", useChannelCustomisation : string = "enabled", useRoomCustomisation : string = "enabled", useScreenSharingCustomisation : string = "enabled", useWebRTCAudioCustomisation : string = "enabled",
    useWebRTCVideoCustomisation : string = "enabled", recordingConversationCustomisation : string = "enabled", overridePresenceCustomisation : string = "enabled", userProfileCustomisation : string = "enabled",
    userTitleNameCustomisation : string = "enabled", changeTelephonyCustomisation : string = "enabled", changeSettingsCustomisation : string = "enabled", fileCopyCustomisation : string = "enabled",
    fileTransferCustomisation : string = "enabled", forbidFileOwnerChangeCustomisation : string = "enabled", readReceiptsCustomisation : string = "enabled", useSpeakingTimeStatistics : string  = "enabled") {
        // API https://api.openrainbow.org/admin/#api-customisation_template-UpdateCompanyTemplate
        // URL PUT /api/rainbow/admin/v1.0/customisations/templates/:templateId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data = {
                name, visibleBy ,
                instantMessagesCustomisation , useGifCustomisation , fileSharingCustomisation , fileStorageCustomisation , phoneMeetingCustomisation ,
                useDialOutCustomisation , useChannelCustomisation , useRoomCustomisation , useScreenSharingCustomisation , useWebRTCAudioCustomisation ,
                useWebRTCVideoCustomisation , recordingConversationCustomisation , overridePresenceCustomisation , userProfileCustomisation ,
                userTitleNameCustomisation , changeTelephonyCustomisation , changeSettingsCustomisation , fileCopyCustomisation ,
                fileTransferCustomisation , forbidFileOwnerChangeCustomisation , readReceiptsCustomisation , useSpeakingTimeStatistics 
            };
            
            that.http.put("/api/rainbow/admin/v1.0/customisations/templates/" + templateId , that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateCustomisationTemplate) successfull");
                that.logger.log("internal", LOG_ID + "(updateCustomisationTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateCustomisationTemplate) error");
                that.logger.log("internalerror", LOG_ID, "(updateCustomisationTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Customisation Template

    //region Channels
    
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
                that.logger.log("internal", LOG_ID + "(createPublicChannel) REST result : ", json.data);
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
                 that.logger.log("error", LOG_ID, "(getChannel) error : ", err);
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
                that.logger.log("internal", LOG_ID + "(deleteChannel) REST result : ", json);
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
                that.logger.log("internal", LOG_ID + "(findChannels) REST result : ", json.total);
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
            that.http.get("/api/rainbow/channels/v1.0/channels", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that.logger.log("debug", LOG_ID + "(fetchMyChannels) successfull");
                that.logger.log("internal", LOG_ID + "(fetchMyChannels) REST result : ", json);
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
                that.logger.log("internal", LOG_ID + "(getChannel) REST result : ", json);
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
                that.logger.log("internal", LOG_ID + "(publishMessage) REST result : ", json);
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
                that.logger.log("internal", LOG_ID + "(getLatestMessages) REST result : " + JSON.stringify(json) + " latestMessages");
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
                that.logger.log("internal", LOG_ID + "(subscribeToChannel) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(unsubscribeToChannel) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(updateChannel) REST result : ", json.data);
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
                that.logger.log("info", LOG_ID + "(uploadChannelAvatar) successfull channelId : ", channelId);
                that.logger.log("internal", LOG_ID + "(uploadChannelAvatar) REST result : ", response);
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
                    that.logger.log("internal", LOG_ID + "(deleteChannelAvatar) REST result : ", response);
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
                that.logger.log("debug", LOG_ID + "(getChannelUsers) successfull");
                that.logger.log("internal", LOG_ID + "(getChannelUsers) REST result : ", json.total, " users in channel");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getChannelUsers) error");
                that.logger.log("internalerror", LOG_ID, "(getChannelUsers) error : ", err);
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
                that.logger.log("internal", LOG_ID + "(deleteAllUsersFromChannel) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(updateChannelUsers) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateChannelUsers) error");
                that.logger.log("internalerror", LOG_ID, "(updateChannelUsers) error : ", err);
                return reject(err);
            });
        });
    }

    // Update a collection of channel users
    getChannelMessages(channelId, maxMessages: number = 100, beforeDate?: Date, afterDate?: Date) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = { max: maxMessages}
            if (beforeDate) {
                params.before = beforeDate;
            }
            if (afterDate) {
                params.after = afterDate; 
            }
            that.http.post("/api/rainbow/channels/v1.0/channels/" + channelId + "/items", that.getRequestHeader(), params, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getChannelMessages) successfull");
                that.logger.log("internal", LOG_ID + "(getChannelMessages) REST result : ", json.data.items.length);
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
                that.logger.log("internal", LOG_ID + "(likeItem) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(getDetailedAppreciations) REST result : ", json.data);
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
                    that.logger.log("info", LOG_ID + "(deleteChannelMessage) (" + channelId + ", " + itemId + ") -- success");
                    resolve(itemId);
                })
                .catch((err) => {
                    that.logger.log("error", LOG_ID, "(deleteChannelMessage) (" + channelId + ", " + itemId + ") -- failure -- ");
                    that.logger.log("internalerror", LOG_ID, "(deleteChannelMessage) (" + channelId + ", " + itemId + ") -- failure -- ", err.message);
                    return reject(err);
                });
        });
    };

    //endregion Channels

    //region Profiles
    
    // Get Server Profiles
    async getServerProfiles() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/profiles", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getServerProfiles) successfull");
                that.logger.log("internal", LOG_ID + "(getServerProfiles) REST result : ", json, " profiles");
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
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/profiles/features", that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getServerProfilesFeatures) successfull");
                that.logger.log("internal", LOG_ID + "(getServerProfilesFeatures) REST result : " + JSON.stringify(json) + " profiles features");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getServerProfilesFeatures) error");
                that.logger.log("internalerror", LOG_ID, "(getServerProfilesFeatures) error : ", err);
                return reject(err);
            });
        });
    }

    public async getThirdPartyApps() {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/authentication/v1.0/oauth/tokens?format=medium", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getThirdPartyApps) successfull");
                that.logger.log("internal", LOG_ID + "(getThirdPartyApps) REST result : ", json,  " ThirdPartyApps.");
                resolve((json && json.data) ? json.data:[]);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getThirdPartyApps) error");
                that.logger.log("internalerror", LOG_ID, "(getThirdPartyApps) error : ", err);
                return reject(err);
            });
        });
    }

    async revokeThirdPartyAccess(tokenId) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/authentication/v1.0/oauth/tokens/" + tokenId, that.getRequestHeader()).then((json) => {
                that.logger.log("info", LOG_ID + "(revokeThirdPartyAccess) (" + tokenId + ") -- success");
                resolve((json && json.data) ? json.data:[]) ;
            }).catch((err) => {
                that.logger.log("error", LOG_ID, "(revokeThirdPartyAccess) (" + tokenId + ") -- failure -- ");
                that.logger.log("internalerror", LOG_ID, "(revokeThirdPartyAccess) (" + tokenId + ") -- failure -- ", err.message);
                return reject(err);
            });
        });
    };
    
    //endregion Profiles

    ////////
    //region Telephony
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
        return that.getNpmPackagePublishedInfos();
    }

    getNpmPackagePublishedInfos(packageName: string = "rainbow-node-sdk") {
        let that = this;
        return new Promise((resolve, reject) => {
            let headers = {
                "Accept": "application/json"
            };

            that.http.getUrlJson("https://api.npms.io/v2/search?q=" + packageName, headers, undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getRainbowNodeSdkPackagePublishedInfos) successfull");
                that.logger.log("internal", LOG_ID + "(getRainbowNodeSdkPackagePublishedInfos) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getRainbowNodeSdkPackagePublishedInfos) error");
                that.logger.log("internalerror", LOG_ID, "(getRainbowNodeSdkPackagePublishedInfos) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Telephony
    
    ////////
    //region Conversations
    getServerConversations(format: string = "small") {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + that.account.id + "/conversations?format=" + format, that.getRequestHeader(), undefined, "", 5, 10000).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getServerConversations) successfull");
                that.logger.log("internal", LOG_ID + "(getServerConversations) REST result : " + JSON.stringify(json) + " conversations");
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
                that.logger.log("info", LOG_ID + "(createServerConversation) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(deleteServerConversation) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(updateServerConversation) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(sendConversationByEmail) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(ackAllMessages) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(ackAllMessages) error");
                that.logger.log("internalerror", LOG_ID, "(ackAllMessages) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Conversations

    //region Generic HTTP VERB
    get(url, token) {
        let that = this;
        that.tokenRest = token;
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
        that.tokenRest = token;
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
        that.tokenRest = token;
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
        that.tokenRest = token;
        return new Promise(function (resolve, reject) {
            that.http.delete(url, that.getRequestHeader()).then(function (JSON) {
                resolve(JSON);
            }).catch(function (err) {
                that.logger.log("internalerror", LOG_ID + "(delete) CATCH Error !!! : ", err);
                return reject(err);
            });
        });
    }

    //endregion http verbs
    
    //region Check Connection

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
            that.logger.log("info", LOG_ID + "(checkEveryPortals)", that.http._host, " NOT IN RAINBOW PRODUCTION so do not test every application's about status ");
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

            that.http.get("/api/rainbow/ping", that.getRequestHeader(), undefined).then(function (JSON) {
                that.logger.log("info", LOG_ID + "(checkPortalHealth) Wait a few time (10 seconds ) before check every portals, because somes of it respond before being xmpp ready for currentAttempt : ", currentAttempt);
                setTimeout(() => {
                    that.checkEveryPortals().then(() => {
                        that.logger.log("info", LOG_ID + "(checkPortalHealth) Connection succeeded for currentAttempt : ", currentAttempt);
                        resolve(JSON);
                    }).catch((err) => {
                        that.logger.log("info", LOG_ID + "(checkPortalHealth) Connection failed! for currentAttempt : ", currentAttempt);
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

    async checkRESTAuthentication() : Promise<boolean> {
        let that = this;
        //that.logger.log("debug", LOG_ID + "(checkEveryPortals) ");
        let authStatus = false;

        try {
            let authenticationValidator = await that.http.get("/api/rainbow/authentication/v1.0/validator", that.getRequestHeader(), undefined);
            that.logger.log("debug", LOG_ID + "(checkRESTAuthentication) REST authentication authenticationValidator : ", authenticationValidator);
            if (authenticationValidator.status === "OK" ) {
                authStatus = true;
            }
        } catch (err) {
            that.logger.log("debug", LOG_ID + "(checkRESTAuthentication) REST authentication check authenticationValidator failed : ", err);
            authStatus = false;
        }

        return authStatus;
    }

    attemptToReconnect(reconnectDelay, currentAttempt) {
        let that = this;
        if (!that.reconnectInProgress) {
            that.logger.log("info", LOG_ID + "(attemptToReconnect) set reconnectInProgress for the currentAttempt : ", currentAttempt);
            that.reconnectInProgress = true;
            that.logger.log("info", LOG_ID + "(attemptToReconnect) Next attempt in " + that.reconnectDelay + " ms, this.currentAttempt : ", currentAttempt);
            setTimeout(() => {
                that.checkPortalHealth(currentAttempt).then(() => {
                    //that.logger.log("debug", LOG_ID + "(attemptToReconnect) Attempt succeeded!");
                    that.logger.log("info", LOG_ID + "(attemptToReconnect) reset reconnectInProgress after succeeded for the currentAttempt : ", currentAttempt);
                    that.reconnectInProgress = false;
                    that.eventEmitter.emit("attempt_succeeded");
                }).catch((err) => {
                    that.logger.log("info", LOG_ID + "(attemptToReconnect) Attempt failed! send attempt_failed for the currentAttempt : ", currentAttempt);
                    that.logger.log("info", LOG_ID + "(attemptToReconnect) reset reconnectInProgress after failed for the currentAttempt : ", currentAttempt);
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
                that.logger.log("info", LOG_ID + "(reconnect) attempt_succeeded_callback reconnection attempt successfull!");
                that.fibonacciStrategy.reset();
                //that.reconnect.delay = that.fibonacciStrategy.getInitialDelay();
                if (that.attempt_promise_resolver.resolve) {
                    that.attempt_promise_resolver.resolve(undefined);
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
                that.logger.log("info", LOG_ID + "(reconnect) fn_attempt_failed_callback attempt #" + that.currentAttempt + " has failed!");
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

    //endregion Check Connection

    //region S2S
    // ************* S2S **************************

    async listConnectionsS2S() : Promise<any>{
        let that = this;
        //that.logger.log("internal", LOG_ID + "(listConnectionsS2S) S2S");
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/ucs/v1.0/connections", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(listConnectionsS2S) successfull");
                that.logger.log("internal", LOG_ID + "(listConnectionsS2S) REST result : ", json);
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
                that.logger.log("internal", LOG_ID + "(sendS2SPresence) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(loginS2S) REST result : ", json);
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
                that.logger.log("internal", LOG_ID + "(infoS2S) REST result : ", json);
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
                    that.logger.log("internal", LOG_ID + "(sendS2SMessageInConversation) REST result : ", json.data);
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
                that.logger.log("debug", LOG_ID + "(getS2SServerConversation) successfull");
                that.logger.log("internal", LOG_ID + "(getS2SServerConversation) REST result : " + JSON.stringify(json) + " conversations");
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getS2SServerConversation) error");
                that.logger.log("internalerror", LOG_ID, "(getS2SServerConversation) error : ", err);
                return reject(err);
            });
        });
    }

    async checkS2Sconnection() : Promise<any> {
        let that = this;
        // https://openrainbow.com:443/api/rainbow/ucs/v1.0/connections/{cnxId}/conversations/{id}
        return new Promise((resolve, reject) => {
            if (!that.connectionS2SInfo) {
                return reject ({message:"connectionS2SInfo is not defined"});
            }
            that.http.head("/api/rainbow/ucs/v1.0/connections/" + that.connectionS2SInfo.id , that.getRequestHeader()).then(function (json) {
                that.logger.log("debug", LOG_ID + "(checkS2Sconnection) successfull");
                that.logger.log("internal", LOG_ID + "(checkS2Sconnection) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(checkS2Sconnection) error");
                that.logger.log("internalerror", LOG_ID, "(checkS2Sconnection) error : ", err);
                return reject(err);
            });
        });
    }

    async checkS2SAuthentication() : Promise<boolean> {
        let that = this;
        //that.logger.log("debug", LOG_ID + "(checkEveryPortals) ");
        let authStatus = false;

        try {
            let authenticationValidator = await that.checkS2Sconnection();
            that.logger.log("debug", LOG_ID + "(checkS2SAuthentication) S2S authentication authenticationValidator : ", authenticationValidator);
            if (authenticationValidator.id) {
                authStatus = true;
            }
        } catch (err) {
            that.logger.log("debug", LOG_ID + "(checkS2SAuthentication) S2S authentication check authenticationValidator failed : ", err);
            authStatus = false;
        }

        return authStatus;
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
                that.logger.log("debug", LOG_ID + "(joinS2SRoom) failed");
                that.logger.log("info", LOG_ID + "(joinS2SRoom) No roomid provided");
                reject({code: -1, label: "roomid is not defined!!!"});
            } else {
                let data = undefined; /*{
                    "role": role
                }; // */
                that.http.post("/api/rainbow/ucs/v1.0/connections/" + that.connectionS2SInfo.id + "/rooms/" + roomid + "/join", that.getRequestHeader(), data, undefined).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(joinS2SRoom) successfull");
                    that.logger.log("internal", LOG_ID + "(joinS2SRoom) REST result : ", json.data);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(joinS2SRoom) error");
                    that.logger.log("internalerror", LOG_ID, "(joinS2SRoom) error : ", err);
                    return reject(err);
                });
            }
        });
    }
    //endregion

    //region Messages
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
                    that.logger.log("internal", LOG_ID + "(markMessageAsRead) REST result : ", json.data);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(markMessageAsRead) error");
                    that.logger.log("internalerror", LOG_ID, "(markMessageAsRead) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    //endregion Messages

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
                that.logger.log("internal", LOG_ID + "(generateNewPublicUrl) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(removePublicUrl) REST result : ", json.data);
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
            that.logger.log("internal", LOG_ID + "(createPublicUrl) REST bubbleId : ", bubbleId, " param : ", param);

            that.http.post("/api/rainbow/enduser/v1.0/users/" + that.userId + "/public-links/bind", that.getRequestHeader(), param, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(createPublicUrl) successfull");
                that.logger.log("internal", LOG_ID + "(createPublicUrl) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(registerGuest) REST result : ", json.data);
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
                that.logger.log("internal", LOG_ID + "(joinConference) REST result : ", json.data);
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

    askConferenceSnapshot(conferenceId : string, type : MEDIATYPE, limit : number = 100, offset : number = 0) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params = {};
            that.logger.log("internal", LOG_ID + "(askConferenceSnapshot) REST params : ", params);
            that.http.get("/api/rainbow/conference/v1.0/conferences/" + conferenceId + "/snapshot?mediaType=" + type + "&limit=" + limit + "&offset=" + offset, that.getRequestHeader(), params).then((json) => {
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

    /**
     * Method retrieveWebConferences
     * @public
     * @param {string} mediaType mediaType of conference to retrieve. Default: this.MEDIATYPE.WEBRTC
     * @returns {Promise<any>} a promise that resolves when conference are reterived
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
                                that.logger.log("info", LOG_ID + "(retrieveWebConferences) successfully");
                                that.logger.log("internal", LOG_ID + "(retrieveWebConferences) REST result : ", conferencesProvisionData);
                                resolve(conferencesProvisionData.data);
                            },
                            (response) => {
                                let msg = response.data ? response.data.errorDetails : response.data;
                                let errorMessage = "(retrieveWebConferences) failure: " + msg;
                                that.logger.log("error", LOG_ID + "(retrieveWebConferences) error : " + errorMessage);
                                reject(new Error(errorMessage));
                            });
        });
    };

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

    retrieveAllCompanySubscriptions(companyId: string, format : string = "small") {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(retrieveAllCompanySubscriptions) REST companyId : ", companyId);

            let url : string = "/api/rainbow/subscription/v1.0/companies/" + companyId + "/subscriptions";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveRainbowUserList) REST url : ", url);

            that.http.get(url , that.getRequestHeader(), undefined).then((json) => {
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
                // maxNumberUsers : 	integer, // optionnel Number of users (licences) bought for this offer. Possible values : 1..
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

    getAUserProfiles( userId: string) {
        // API https://api.openrainbow.org/admin/#api-users_profiles-admin_users_GetUserProfiles 
        // GET /api/rainbow/admin/v1.0/users/:userId/profiles
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(getAUserProfiles) REST userId : ", userId);

            let url: string = "/api/rainbow/admin/v1.0/users/" + userId + "/profiles";
            let urlParamsTab: string[] = [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getAUserProfiles) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAUserProfiles) successfull");
                that.logger.log("internal", LOG_ID + "(getAUserProfiles) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAUserProfiles) error");
                that.logger.log("internalerror", LOG_ID, "(getAUserProfiles) error : ", err);
                return reject(err);
            });
        });
    }

    getAUserProfilesFeaturesByUserId(userId : string) {
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.get("/api/rainbow/enduser/v1.0/users/" + userId + "/profiles/features", that.getRequestHeader(), undefined).then(function (json) {
                that.logger.log("debug", LOG_ID + "(getAUserProfilesFeaturesByUserId) successfull");
                that.logger.log("internal", LOG_ID + "(getAUserProfilesFeaturesByUserId) REST result : " + JSON.stringify(json) + " profiles features");
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAUserProfilesFeaturesByUserId) error");
                that.logger.log("internalerror", LOG_ID, "(getAUserProfilesFeaturesByUserId) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Offers and subscriptions

    //region Bubbles Tags
    retrieveAllBubblesByTags(tags: Array<string>, format : string = "small", nbUsersToKeep : number = 100) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(retrieveAllBubblesByTags) REST companyId : ", tags);
            let nbTags = tags.length;
            let tagParams = "";
            if (nbTags == 0) {
                let err = {
                    "label" : "retrieveAllBubblesByTags : No tags provided for filter the bubbles."
                };
                that.logger.log("error", LOG_ID, "(retrieveAllBubblesByTags) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveAllBubblesByTags) error : ", err);
                return reject(err);
            }
            if (nbTags == 1) {
                tagParams = "tag="+ encodeURI(tags[0]) + "&";
            }
            if (nbTags > 1) {
                for (let id = 0; id <nbTags ; id++ ) {
                    tagParams += "tag" + "=" + encodeURI(tags[id]) + "&";
                }
            }

            if (format) {
                tagParams += "format" + "=" + encodeURI(format) + "&";
            }
            
            if (format) {
                tagParams += "nbUsersToKeep" + "=" + nbUsersToKeep + "&";
            }
            
            that.http.get("/api/rainbow/enduser/v1.0/rooms/tags?" + tagParams, that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveAllBubblesByTags) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveAllBubblesByTags) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveAllBubblesByTags) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveAllBubblesByTags) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     *
     * @param {string} roomId
     * @param {Array<any>} tags : tags 	Object[]
     List of objects. Empty to reset the list
     tag 	String Tag name
     color optionnel String Tag color - Hex Color in "0x" or "#" prefixed or "non-prefixed"
     emoji optionnel String Tag emoji - an unicode sequence
     * @return {Promise<unknown>}
     */
    setTagsOnABubble(roomId : string, tags: Array<string>) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params = {"tags":tags};
            that.logger.log("internal", LOG_ID + "(setTagsOnABubble) REST params : ", params);

            that.http.put("/api/rainbow/enduser/v1.0/rooms/" + roomId + "/tags", that.getRequestHeader(), params, undefined).then((json) => {
                //that.http.post("/api/rainbow/conference/v1.0/conferences/" + webPontConferenceId + "/join", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(setTagsOnABubble) successfull");
                that.logger.log("internal", LOG_ID + "(setTagsOnABubble) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(setTagsOnABubble) error");
                that.logger.log("internalerror", LOG_ID, "(setTagsOnABubble) error : ", err);
                return reject(err);
            });
        });
    }

    deleteTagOnABubble(roomIds : Array<string>, tag: string) {
        let that = this;

        return new Promise(function (resolve, reject) {
            let params : any = {
                "tag": tag,
                "rooms": roomIds
            };

            that.logger.log("internal", LOG_ID + "(deleteTagOnABubble) REST params : ", params);

            that.http.delete("/api/rainbow/enduser/v1.0/rooms/tags" , that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that.logger.log("info", LOG_ID + "(deleteTagOnABubble) successfull");
                that.logger.log("internal", LOG_ID + "(deleteTagOnABubble) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteTagOnABubble) error");
                that.logger.log("internalerror", LOG_ID, "(deleteTagOnABubble) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Bubbles Tags

    //region Alerts - Notifications

    createDevice(data : Object) {
        // /api/rainbow/notificationsadmin/v1.0/devices

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/notificationsadmin/v1.0/devices", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createDevice) successfull");
                that.logger.log("internal", LOG_ID + "(createDevice) REST bubble created : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createDevice) error");
                that.logger.log("internalerror", LOG_ID, "(createDevice) error : ", err);
                return reject(err);
            });
        });
    }

    updateDevice(deviceId, params : Object) {
        // /api/rainbow/notificationsadmin/v1.0/devices

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.put("/api/rainbow/notificationsadmin/v1.0/devices/" + deviceId , that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(updateDevice) successfull");
                that.logger.log("internal", LOG_ID + "(updateDevice) REST bubble created : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateDevice) error");
                that.logger.log("internalerror", LOG_ID, "(updateDevice) error : ", err);
                return reject(err);
            });
        });
    }

    deleteDevice(deviceId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(deleteDevice) REST deviceId : ", deviceId);

            that.http.delete("/api/rainbow/notificationsadmin/v1.0/devices/" + deviceId  , that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that.logger.log("info", LOG_ID + "(deleteDevice) successfull");
                that.logger.log("internal", LOG_ID + "(deleteDevice) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteDevice) error");
                that.logger.log("internalerror", LOG_ID, "(deleteDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getDevice(deviceId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(getDevice) REST params : ", params);

            that.http.get("/api/rainbow/notificationsadmin/v1.0/devices/" + deviceId , that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getDevice) successfull");
                that.logger.log("internal", LOG_ID + "(getDevice) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getDevice) error");
                that.logger.log("internalerror", LOG_ID, "(getDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getDevices(companyId : string, userId : string, deviceName : string, type : string, tag : string, offset : number, limit : number) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            let getParams = "";
            if (companyId) {
                getParams += getParams ? "&" : "?";
                getParams += "companyId=" + companyId;
            }

            if (userId) {
                getParams += getParams ? "&" : "?";
                getParams += "userId=" + userId;
            }

            if (deviceName) {
                getParams += getParams ? "&" : "?";
                getParams += "name=" + deviceName;
            }

            if (type) {
                getParams += getParams ? "&" : "?";
                getParams += "type=" + type;
            }

            if (tag) {
                getParams += getParams ? "&" : "?";
                getParams += "tags=" + tag;
            }

            getParams += getParams ? "&" : "?";
            getParams += "limit=" + limit;
            getParams += getParams ? "&" : "?";
            getParams += "offset=" + offset;
            getParams += getParams ? "&" : "?";
            getParams += "format=" + "full";

            that.logger.log("internal", LOG_ID + "(getDevices) REST getParams : ", getParams);

            that.http.get("/api/rainbow/notificationsadmin/v1.0/devices" + getParams , that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getDevices) successfull");
                that.logger.log("internal", LOG_ID + "(getDevices) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getDevices) error");
                that.logger.log("internalerror", LOG_ID, "(getDevices) error : ", err);
                return reject(err);
            });
        });
    }

    getDevicesTags(companyId : string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            let getParams = "";
            if (companyId) {
                getParams += getParams ? "&" : "?";
                getParams += "companyId=" + companyId;
            }

            that.logger.log("internal", LOG_ID + "(getDevicesTags) REST getParams : ", getParams);

            that.http.get("/api/rainbow/notificationsadmin/v1.0/devices/tags" + getParams , that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getDevicesTags) successfull");
                that.logger.log("internal", LOG_ID + "(getDevicesTags) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getDevicesTags) error");
                that.logger.log("internalerror", LOG_ID, "(getDevicesTags) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @method renameDevicesTags
     * @param {string} tag 	tag to rename.
     * @param {string} companyId Allows to rename a tag for the devices being in the companyIds provided in this option. <br>
     * If companyId is not provided, the tag is renamed for all the devices linked to all the companies that the administrator manage.
     * @param {string} newTagName New tag name. (Body Parameters) 
     * @description
     * This API can be used to rename a tag being assigned to some devices of the companies managed by the administrator.
     */
    renameDevicesTags(newTagName : string, tag: string, companyId: string) {
        // - Rename a tag for all assigned devices PUT /api/rainbow/notificationsadmin/v1.0/devices/tags
        // Example: PUT https://openrainbow.com/api/rainbow/notificationsadmin/v1.0/devices/tags?tag=1rst%20floor&companyId=5703d0d49ccf39843c7ef897

        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/notificationsadmin/v1.0/devices/tags";

            let getParams = "";
            if (companyId) {
                getParams += getParams ? "&" : "?";
                getParams += "companyId=" + companyId ; //? companyId : that.account.companyId;
            }
            
            if (tag) {
                getParams += getParams ? "&" : "?";
                getParams += "tag=" + tag ;
            }
            
            let params = {newTagName};

            that.http.put(url + getParams , that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(renameDevicesTags) successfull");
                that.logger.log("internal", LOG_ID + "(renameDevicesTags) REST bubble created : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(renameDevicesTags) error");
                that.logger.log("internalerror", LOG_ID, "(renameDevicesTags) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @method deleteDevicesTags
     * @param {string} tag 	tag to rename.
     * @param {string} companyId Allows to remove a tag from the devices being in the companyIds provided in this option.. <br>
     * If companyId is not provided, the tag is deleted from all the devices linked to all the companies that the administrator manage.
     * @description
     * This API can be used to remove a tag being assigned to some devices of the companies managed by the administrator.
     */
    deleteDevicesTags(tag: string, companyId: string) {
        // Remove a given tag from all the devices DELETE /api/rainbow/notificationsadmin/v1.0/devices/tags
        // Example: DELETE https://openrainbow.com/api/rainbow/notificationsadmin/v1.0/devices/tags?tag=a_tag?companyId=5703d0d49ccf39843c7ef897
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(deleteDevicesTags) REST tag : ", tag);
            let url = "/api/rainbow/notificationsadmin/v1.0/devices/tags";

            let getParams = "";
            if (companyId) {
                getParams += getParams ? "&" : "?";
                getParams += "companyId=" + companyId ;//? companyId : that.account.companyId;
            }

            if (tag) {
                getParams += getParams ? "&" : "?";
                getParams += "tag=" + tag ;
            }

            that.http.delete(url + getParams , that.getPostHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(deleteDevicesTags) successfull");
                that.logger.log("internal", LOG_ID + "(deleteDevicesTags) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteDevicesTags) error");
                that.logger.log("internalerror", LOG_ID, "(deleteDevicesTags) error : ", err);
                return reject(err);
            });
        });
    }

    /**
     * @method getstatsTags
     * @param {string} companyId Allows to compute the tags statistics for the devices associated to the companyIds provided in this option.  <br>
     * if companyId is not provided, the tags statistics are computed for all the devices being in all the companies managed by the logged in administrator.
     * @description
     * This API can be used to list all the tags being assigned to the devices of the companies managed by the administrator, with the number of devices for each tags.
     */
    getstatsTags(companyId: string) {
        // - Return stats regarding device tags GET /api/rainbow/notificationsadmin/v1.0/devices/tags/stats
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/notificationsadmin/v1.0/devices/tags/stats";

            let getParams = "";
            if (companyId) {
                getParams += getParams ? "&" : "?";
                getParams += "companyId=" + companyId ;//? companyId : that.account.companyId;
            }

            that.logger.log("internal", LOG_ID + "(getstatsTags) REST companyId : ", companyId);

            that.http.get(url + getParams, that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getstatsTags) successfull");
                that.logger.log("internal", LOG_ID + "(getstatsTags) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getstatsTags) error");
                that.logger.log("internalerror", LOG_ID, "(getstatsTags) error : ", err);
                return reject(err);
            });
        });
    }
    
    createTemplate(data : Object) {
        // /api/rainbow/notificationsadmin/v1.0/devices

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/notificationsadmin/v1.0/templates", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createTemplate) successfull");
                that.logger.log("internal", LOG_ID + "(createTemplate) REST bubble created : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createTemplate) error");
                that.logger.log("internalerror", LOG_ID, "(createTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    updateTemplate(templateId, params : Object) {
        // /api/rainbow/notificationsadmin/v1.0/devices

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.put("/api/rainbow/notificationsadmin/v1.0/templates/" + templateId , that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(updateTemplate) successfull");
                that.logger.log("internal", LOG_ID + "(updateTemplate) REST bubble created : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateTemplate) error");
                that.logger.log("internalerror", LOG_ID, "(updateTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    deleteTemplate(templateId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(deleteTemplate) REST templateId : ", templateId);

            that.http.delete("/api/rainbow/notificationsadmin/v1.0/templates/" + templateId  , that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that.logger.log("info", LOG_ID + "(deleteTemplate) successfull");
                that.logger.log("internal", LOG_ID + "(deleteTemplate) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteTemplate) error");
                that.logger.log("internalerror", LOG_ID, "(deleteTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    getTemplate(templateId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(getTemplate) REST params : ", params);

            that.http.get("/api/rainbow/notificationsadmin/v1.0/templates/" + templateId , that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getTemplate) successfull");
                that.logger.log("internal", LOG_ID + "(getTemplate) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getTemplate) error");
                that.logger.log("internalerror", LOG_ID, "(getTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    getTemplates(companyId : string, offset : number, limit : number) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            let getParams = "";
            if (companyId) {
                getParams += getParams ? "&" : "?";
                getParams += "companyId=" + companyId;
            }

            getParams += getParams ? "&" : "?";
            getParams += "limit=" + limit;
            getParams += getParams ? "&" : "?";
            getParams += "offset=" + offset;
            getParams += getParams ? "&" : "?";
            getParams += "format=" + "full";

            that.logger.log("internal", LOG_ID + "(getTemplates) REST getParams : ", getParams);

            that.http.get("/api/rainbow/notificationsadmin/v1.0/templates" + getParams , that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getTemplates) successfull");
                that.logger.log("internal", LOG_ID + "(getTemplates) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getTemplates) error");
                that.logger.log("internalerror", LOG_ID, "(getTemplates) error : ", err);
                return reject(err);
            });
        });
    }

    createFilter(data : Object) {
        // /api/rainbow/notificationsadmin/v1.0/filters

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/notificationsadmin/v1.0/filters", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createFilter) successfull");
                that.logger.log("internal", LOG_ID + "(createFilter) REST created : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createFilter) error");
                that.logger.log("internalerror", LOG_ID, "(createFilter) error : ", err);
                return reject(err);
            });
        });
    }

    updateFilter(FilterId, params : Object) {
        // /api/rainbow/notificationsadmin/v1.0/filters

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.put("/api/rainbow/notificationsadmin/v1.0/filters/" + FilterId , that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(updateFilter) successfull");
                that.logger.log("internal", LOG_ID + "(updateFilter) REST created : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateFilter) error");
                that.logger.log("internalerror", LOG_ID, "(updateFilter) error : ", err);
                return reject(err);
            });
        });
    }

    deleteFilter(FilterId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(deleteFilter) REST FilterId : ", FilterId);

            that.http.delete("/api/rainbow/notificationsadmin/v1.0/filters/" + FilterId  , that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that.logger.log("info", LOG_ID + "(deleteFilter) successfull");
                that.logger.log("internal", LOG_ID + "(deleteFilter) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteFilter) error");
                that.logger.log("internalerror", LOG_ID, "(deleteFilter) error : ", err);
                return reject(err);
            });
        });
    }

    getFilter(templateId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(getFilter) REST params : ", params);

            that.http.get("/api/rainbow/notificationsadmin/v1.0/filters/" + templateId , that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getFilter) successfull");
                that.logger.log("internal", LOG_ID + "(getFilter) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getFilter) error");
                that.logger.log("internalerror", LOG_ID, "(getFilter) error : ", err);
                return reject(err);
            });
        });
    }

    getFilters( offset : number, limit : number) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            let getParams = "";

            getParams += getParams ? "&" : "?";
            getParams += "limit=" + limit;
            getParams += getParams ? "&" : "?";
            getParams += "offset=" + offset;
            getParams += getParams ? "&" : "?";
            getParams += "format=" + "full";

            that.logger.log("internal", LOG_ID + "(getFilters) REST getParams : ", getParams);

            that.http.get("/api/rainbow/notificationsadmin/v1.0/filters" + getParams , that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getFilters) successfull");
                that.logger.log("internal", LOG_ID + "(getFilters) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getFilters) error");
                that.logger.log("internalerror", LOG_ID, "(getFilters) error : ", err);
                return reject(err);
            });
        });
    }

    createAlert(data : Object) {
        // /api/rainbow/notifications/v1.0/notifications

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/notifications/v1.0/notifications", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createAlert) successfull");
                that.logger.log("internal", LOG_ID + "(createAlert) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createAlert) error");
                that.logger.log("internalerror", LOG_ID, "(createAlert) error : ", err);
                return reject(err);
            });
        });
    }

    updateAlert(AlertId, params : Object) {
        // /api/rainbow/notifications/v1.0/notifications

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.put("/api/rainbow/notifications/v1.0/notifications/" + AlertId , that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(updateAlert) successfull");
                that.logger.log("internal", LOG_ID + "(updateAlert) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateAlert) error");
                that.logger.log("internalerror", LOG_ID, "(updateAlert) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAlert(AlertId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(deleteAlert) REST AlertId : ", AlertId);

            that.http.delete("/api/rainbow/notifications/v1.0/notifications/" + AlertId  , that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that.logger.log("info", LOG_ID + "(deleteAlert) successfull");
                that.logger.log("internal", LOG_ID + "(deleteAlert) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteAlert) error");
                that.logger.log("internalerror", LOG_ID, "(deleteAlert) error : ", err);
                return reject(err);
            });
        });
    }

    getAlert(alertId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(getAlert) REST params : ", params);

            that.http.get("/api/rainbow/notifications/v1.0/notifications/" + alertId , that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAlert) successfull");
                that.logger.log("internal", LOG_ID + "(getAlert) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAlert) error");
                that.logger.log("internalerror", LOG_ID, "(getAlert) error : ", err);
                return reject(err);
            });
        });
    }

    getAlerts( offset : number, limit : number) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            let getParams = "";

            getParams += getParams ? "&" : "?";
            getParams += "limit=" + limit;
            getParams += getParams ? "&" : "?";
            getParams += "offset=" + offset;
            getParams += getParams ? "&" : "?";
            getParams += "format=" + "full";

            that.logger.log("internal", LOG_ID + "(getAlerts) REST getParams : ", getParams);

            that.http.get("/api/rainbow/notifications/v1.0/notifications" + getParams , that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAlerts) successfull");
                that.logger.log("internal", LOG_ID + "(getAlerts) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAlerts) error");
                that.logger.log("internalerror", LOG_ID, "(getAlerts) error : ", err);
                return reject(err);
            });
        });
    }

    sendAlertFeedback(alertId : string, data : Object) {
        // /api/rainbow/notifications/v1.0/feedback

        let that = this;
        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/notifications/v1.0/notifications/" + alertId + "/feedback", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(sendAlertFeedback) successfull");
                that.logger.log("internal", LOG_ID + "(sendAlertFeedback) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(sendAlertFeedback) error");
                that.logger.log("internalerror", LOG_ID, "(sendAlertFeedback) error : ", err);
                return reject(err);
            });
        });
    }

    getAlertFeedbackSentForANotificationMessage(notificationHistoryId: string) {
        // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationHistoryId/feedback
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(getAlertFeedbackSentForANotificationMessage) REST params : ", params);

            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + notificationHistoryId + "/feedback", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAlertFeedbackSentForANotificationMessage) successfull");
                that.logger.log("internal", LOG_ID + "(getAlertFeedbackSentForANotificationMessage) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAlertFeedbackSentForANotificationMessage) error");
                that.logger.log("internalerror", LOG_ID, "(getAlertFeedbackSentForANotificationMessage) error : ", err);
                return reject(err);
            });
        });
    }

    getAlertFeedbackSentForAnAlert(alertId: string) {
        // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationId/feedback
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(getAlertFeedbackSentForAnAlert) REST params : ", params);

            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + alertId + "/feedback", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAlertFeedbackSentForAnAlert) successfull");
                that.logger.log("internal", LOG_ID + "(getAlertFeedbackSentForAnAlert) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAlertFeedbackSentForAnAlert) error");
                that.logger.log("internalerror", LOG_ID, "(getAlertFeedbackSentForAnAlert) error : ", err);
                return reject(err);
            });
        });
    }

    getAlertStatsFeedbackSentForANotificationMessage(notificationHistoryId: string) {
        // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationHistoryId/feedback/stats
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(getAlertStatsFeedbackSentForANotificationMessage) REST params : ", params);

            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + notificationHistoryId + "/feedback/stats", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAlertStatsFeedbackSentForANotificationMessage) successfull");
                that.logger.log("internal", LOG_ID + "(getAlertStatsFeedbackSentForANotificationMessage) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAlertStatsFeedbackSentForANotificationMessage) error");
                that.logger.log("internalerror", LOG_ID, "(getAlertStatsFeedbackSentForANotificationMessage) error : ", err);
                return reject(err);
            });
        });
    }

    getReportSummary(alertId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(getReportSummary) REST params : ", params);

            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + alertId + "/reports/summary", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getReportSummary) successfull");
                that.logger.log("internal", LOG_ID + "(getReportSummary) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getReportSummary) error");
                that.logger.log("internalerror", LOG_ID, "(getReportSummary) error : ", err);
                return reject(err);
            });
        });
    }

    getReportDetails(alertId: string) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(getReportDetails) REST params : ", params);

            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + alertId + "/reports/details", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getReportDetails) successfull");
                that.logger.log("internal", LOG_ID + "(getReportDetails) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getReportDetails) error");
                that.logger.log("internalerror", LOG_ID, "(getReportDetails) error : ", err);
                return reject(err);
            });
        });
    }

    getReportComplete(alertId: string) {
        // GET /api/rainbow/notificationsreport/v1.0/notifications/:notificationId/reports/complete
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(getReportComplete) REST params : ", params);

            that.http.get("/api/rainbow/notificationsreport/v1.0/notifications/" + alertId + "/reports/complete", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getReportComplete) successfull");
                that.logger.log("internal", LOG_ID + "(getReportComplete) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getReportComplete) error");
                that.logger.log("internalerror", LOG_ID, "(getReportComplete) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion
    
    //region calendar

    getCalendarState() {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(getReportDetails) REST params : ", params);

            that.http.get("/api/rainbow/calendar/v1.0", that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCalendarState) successfull");
                that.logger.log("internal", LOG_ID + "(getCalendarState) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCalendarState) error");
                that.logger.log("internalerror", LOG_ID, "(getCalendarState) error : ", err);
                return reject(err);
            });
        });
    }

    getCalendarStates(users : Array<string> = [undefined]) {
        // /api/rainbow/calendar/v1.0/states
        let that = this;
        
        let params = {
            users
        };
        
        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/calendar/v1.0/states", that.getRequestHeader(), params, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getCalendarStates) successfull");
                that.logger.log("internal", LOG_ID + "(getCalendarStates) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCalendarStates) error");
                that.logger.log("internalerror", LOG_ID, "(getCalendarStates) error : ", err);
                return reject(err);
            });
        });
    }
    
    setCalendarRegister(type? : string, redirect? : boolean, callbackUrl? : string) {
        // /api/rainbow/calendar/v1.0/register
        let that = this;
        
        let params = {
            type,
            redirect,
            callback : callbackUrl
        };
        
        return new Promise(function (resolve, reject) {

            that.http.post("/api/rainbow/calendar/v1.0/register", that.getRequestHeader(), params, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(setCalendarRegister) successfull");
                that.logger.log("internal", LOG_ID + "(setCalendarRegister) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(setCalendarRegister) error");
                that.logger.log("internalerror", LOG_ID, "(setCalendarRegister) error : ", err);
                return reject(err);
            });
        });
    }

    getCalendarAutomaticReplyStatus(userid?: string) {
        // /api/rainbow/calendar/v1.0/automatic_reply
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/calendar/v1.0/automatic_reply";
            if (userid ) {
                url += "?userid =" + userid;
            } 
            
            that.logger.log("internal", LOG_ID + "(getReportDetails) REST url : ", url);

            that.http.get(url, that.getRequestHeader(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCalendarAutomaticReplyStatus) successfull");
                that.logger.log("internal", LOG_ID + "(getCalendarAutomaticReplyStatus) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCalendarAutomaticReplyStatus) error");
                that.logger.log("internalerror", LOG_ID, "(getCalendarAutomaticReplyStatus) error : ", err);
                return reject(err);
            });
        });
    }

    enableOrNotCalendar(disable : boolean) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {
                disable 
            };

            that.logger.log("internal", LOG_ID + "(enableOrNotCalendar) REST params : ", params);

            that.http.patch("/api/rainbow/calendar/v1.0", that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(enableOrNotCalendar) successfull");
                that.logger.log("internal", LOG_ID + "(enableOrNotCalendar) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(enableOrNotCalendar) error");
                that.logger.log("internalerror", LOG_ID, "(enableOrNotCalendar) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion
    
    //region AD/LDAP
    //region AD/LDAP Massprovisioning

    checkCSVdata(data? : any, companyId? : string, delimiter? : string, comment : string = "%") {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports/check
        // API : https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-CheckCSV
        let that = this;
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports/check";
        let urlParamsTab : string[]= [];
        urlParamsTab.push(urlParams);
        addParamToUrl(urlParamsTab, "companyId", companyId);
        addParamToUrl(urlParamsTab, "delimiter", delimiter);
        addParamToUrl(urlParamsTab, "comment", comment);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), data, 'text/csv; charset=utf-8').then(function (json) {
                that.logger.log("info", LOG_ID + "(checkCSVdata) successfull");
                that.logger.log("internal", LOG_ID + "(checkCSVdata) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(checkCSVdata) error");
                that.logger.log("internalerror", LOG_ID, "(checkCSVdata) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAnImportStatusReport(reqId: string) {
        // DELETE /api/rainbow/massprovisioning/v1.0/users/imports/:reqId/details
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-DeleteReport
        let that = this;
        return new Promise(function (resolve, reject) {
            let params : any = {};

            that.logger.log("internal", LOG_ID + "(deleteAnImportStatusReport) REST reqId : ", reqId);

            that.http.delete("/api/rainbow/massprovisioning/v1.0/users/imports/" + reqId + "/details"  , that.getPostHeader(), JSON.stringify(params)).then((json) => {
                that.logger.log("info", LOG_ID + "(deleteAnImportStatusReport) successfull");
                that.logger.log("internal", LOG_ID + "(deleteAnImportStatusReport) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deleteAnImportStatusReport) error");
                that.logger.log("internalerror", LOG_ID, "(deleteAnImportStatusReport) error : ", err);
                return reject(err);
            });
        });
    }

    getAnImportStatusReport(reqId? : string, format : string = "full") : any {
        // GET /api/rainbow/massprovisioning/v1.0/users/imports/:reqId/details
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-GetReport
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/massprovisioning/v1.0/users/imports/" + reqId + "/details";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getAnImportStatusReport) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAnImportStatusReport) successfull");
                that.logger.log("internal", LOG_ID + "(getAnImportStatusReport) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAnImportStatusReport) error");
                that.logger.log("internalerror", LOG_ID, "(getAnImportStatusReport) error : ", err);
                return reject(err);
            });
        });
    }

    getInformationOnImports(companyId? : string) : any {
        // GET /api/rainbow/massprovisioning/v1.0/users/imports
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-GetImports
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/massprovisioning/v1.0/users/imports";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getInformationOnImports) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getInformationOnImports) successfull");
                that.logger.log("internal", LOG_ID + "(getInformationOnImports) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getInformationOnImports) error");
                that.logger.log("internalerror", LOG_ID, "(getInformationOnImports) error : ", err);
                return reject(err);
            });
        });
    }

    getResultOfStartedOffice365TenantSynchronizationTask(tenant? : string, format : string = "json") : any {
        // GET /api/rainbow/massprovisioning/v1.0/users/synchronizeTask/:tenant
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-SynchronizeTenantTaskGet
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/massprovisioning/v1.0/users/synchronizeTask/" + tenant;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getResultOfStartedOffice365TenantSynchronizationTask) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getResultOfStartedOffice365TenantSynchronizationTask) successfull");
                that.logger.log("internal", LOG_ID + "(getResultOfStartedOffice365TenantSynchronizationTask) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getResultOfStartedOffice365TenantSynchronizationTask) error");
                that.logger.log("internalerror", LOG_ID, "(getResultOfStartedOffice365TenantSynchronizationTask) error : ", err);
                return reject(err);
            });
        });
    }

    importCSVData(data? : any, companyId? : string, label : string = "none", noemails : boolean = true, nostrict : boolean = false, delimiter? : string, comment : string = "%") {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports
        // API : https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-ImportCSV
        let that = this;
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports";
        let urlParamsTab : string[]= [];
        urlParamsTab.push(urlParams);
        addParamToUrl(urlParamsTab, "companyId", companyId);
        addParamToUrl(urlParamsTab, "label", label);
        addParamToUrl(urlParamsTab, "noemails", noemails);
        addParamToUrl(urlParamsTab, "nostrict", nostrict);
        addParamToUrl(urlParamsTab, "delimiter", delimiter);
        addParamToUrl(urlParamsTab, "comment", comment);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), data, 'text/csv; charset=utf-8').then(function (json) {
                that.logger.log("info", LOG_ID + "(importCSVData) successfull");
                that.logger.log("internal", LOG_ID + "(importCSVData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(importCSVData) error");
                that.logger.log("internalerror", LOG_ID, "(importCSVData) error : ", err);
                return reject(err);
            });
        });
    }

    startsAsynchronousGenerationOfOffice365TenantUserListSynchronization(tenant? : string) {
        // POST /api/rainbow/massprovisioning/v1.0/users/synchronizeTask/:tenant
        // API : https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-SynchronizeTenantTaskStart
        let that = this;
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/synchronizeTask/" + tenant;
        let urlParamsTab : string[]= [];
        urlParamsTab.push(urlParams);
        // addParamToUrl(urlParamsTab, "comment", comment);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), {}, 'text/csv; charset=utf-8').then(function (json) {
                that.logger.log("info", LOG_ID + "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) successfull");
                that.logger.log("internal", LOG_ID + "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) error");
                that.logger.log("internalerror", LOG_ID, "(startsAsynchronousGenerationOfOffice365TenantUserListSynchronization) error : ", err);
                return reject(err);
            });
        });
    }

    synchronizeOffice365TenantUserList(tenant? : string, format : string = "json") : any {
        // GET /api/rainbow/massprovisioning/v1.0/users/synchronize/:tenant
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-SynchronizeTenant
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/massprovisioning/v1.0/users/synchronize/" + tenant;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(synchronizeOffice365TenantUserList) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(synchronizeOffice365TenantUserList) successfull");
                that.logger.log("internal", LOG_ID + "(synchronizeOffice365TenantUserList) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(synchronizeOffice365TenantUserList) error");
                that.logger.log("internalerror", LOG_ID, "(synchronizeOffice365TenantUserList) error : ", err);
                return reject(err);
            });
        });
    }

    checkCSVDataOfSynchronizationUsingRainbowvoiceMode(data? : any, companyId? : string, delimiter? : string, comment : string = "%") {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports/rainbowvoice/check
        // API : https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-CheckRainbowVoiceCSV
        let that = this;
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports/rainbowvoice/check";
        let urlParamsTab : string[]= [];
        urlParamsTab.push(urlParams);
        addParamToUrl(urlParamsTab, "companyId", companyId);
        addParamToUrl(urlParamsTab, "delimiter", delimiter);
        addParamToUrl(urlParamsTab, "comment", comment);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), data, 'text/csv; charset=utf-8').then(function (json) {
                that.logger.log("info", LOG_ID + "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) successfull");
                that.logger.log("internal", LOG_ID + "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) error");
                that.logger.log("internalerror", LOG_ID, "(checkCSVDataOfSynchronizationUsingRainbowvoiceMode) error : ", err);
                return reject(err);
            });
        });
    }

    updateCommandIdStatus(data? : any, commandId? : string) {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/:commandId/report
        // API : 
        let that = this;
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports/synchronize/" + commandId + "/report";
        let urlParamsTab : string[]= [];
        urlParamsTab.push(urlParams);
        // addParamToUrl(urlParamsTab, "companyId", companyId);
        urlParams = urlParamsTab[0];

        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateCommandIdStatus) successfull");
                that.logger.log("internal", LOG_ID + "(updateCommandIdStatus) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateCommandIdStatus) error");
                that.logger.log("internalerror", LOG_ID, "(updateCommandIdStatus) error : ", err);
                return reject(err);
            });
        });
    }

    /*
    POST /api/rainbow/massprovisioning/v1.0/users/imports/synchronize?noemails=true with a file containing users and devices
    Remark: "sync" (and/or "delete") action(s) should be used and all the relevant fields from AD should be systematically provided
    A hidden field "ldap_id" corresponding to the AD objectGUID should be filled
    Mandatory field is loginEmail, isInitialized=true
    // */
    synchronizeUsersAndDeviceswithCSV(CSVTxt? : string, companyId? : string, label : string = undefined, noemails: boolean = true, nostrict : boolean = false, delimiter? : string, comment : string = "%", commandId? : string) : Promise<{
        reqId : string,
        mode : string,
        status : string,
        userId : string,
        displayName : string,
        label : string,
        startTime : string
    }>{
        let that = this;
        let urlParams = "/api/rainbow/massprovisioning/v1.0/users/imports/synchronize";
        let urlParamsTab : string[]= [];
        urlParamsTab.push(urlParams);
        addParamToUrl(urlParamsTab, "commandId", commandId);
        addParamToUrl(urlParamsTab, "companyId", companyId);
        addParamToUrl(urlParamsTab, "label", label);
        addParamToUrl(urlParamsTab, "noemails", String(noemails));
        addParamToUrl(urlParamsTab, "nostrict", String(nostrict));
        addParamToUrl(urlParamsTab, "delimiter", delimiter);
        addParamToUrl(urlParamsTab, "comment", comment);
        urlParams = urlParamsTab[0];
        
        return new Promise(function (resolve, reject) {

            that.http.post(urlParams, that.getRequestHeader(""), CSVTxt, 'text/csv; charset=utf-8').then(function (json) {
                that.logger.log("info", LOG_ID + "(synchronizeUsersAndDeviceswithCSV) successfull");
                that.logger.log("internal", LOG_ID + "(synchronizeUsersAndDeviceswithCSV) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(synchronizeUsersAndDeviceswithCSV) error");
                that.logger.log("internalerror", LOG_ID, "(synchronizeUsersAndDeviceswithCSV) error : ", err);
                return reject(err);
            });
        });
    }

    // A template can be retrieved from GET /api/rainbow/massprovisioning/v1.0/users/template?mode=useranddevice
    getCSVTemplate(companyId? : string, mode : string = "useranddevice", comment? : string) : any {
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/massprovisioning/v1.0/users/template";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "mode", mode);
            addParamToUrl(urlParamsTab, "comment", comment);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getCSVTemplate) REST url : ", url);
            
            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCSVTemplate) successfull");
                that.logger.log("internal", LOG_ID + "(getCSVTemplate) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCSVTemplate) error");
                that.logger.log("internalerror", LOG_ID, "(getCSVTemplate) error : ", err);
                return reject(err);
            });
        });
    }
    
    // A file can be checked with POST /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check
    checkCSVforSynchronization(CSVTxt, companyId? : string, delimiter?  : string, comment : string = "%", commandId? : string) : any {
        // POST /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-CheckSynchronizeCSV
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "delimiter", delimiter);
            addParamToUrl(urlParamsTab, "comment", comment);
            addParamToUrl(urlParamsTab, "commandId", commandId);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(checkCSVforSynchronization) REST url : ", url);

            that.http.post(url, that.getRequestHeader(""), CSVTxt, 'text/csv; charset=utf-8').then(function (json) {
                that.logger.log("info", LOG_ID + "(checkCSVforSynchronization) successfull");
                that.logger.log("internal", LOG_ID + "(checkCSVforSynchronization) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(checkCSVforSynchronization) error");
                that.logger.log("internalerror", LOG_ID, "(checkCSVforSynchronization) error : ", err);
                return reject(err);
            });
        });
    }

    getCheckCSVReport(commandId : string) {
        // GET /api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check/:commandId/report
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-GetCheckSynchronizeCSV
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/massprovisioning/v1.0/users/imports/synchronize/check/" + commandId + "/report";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            //addParamToUrl(urlParamsTab, "commandId", commandId);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getCheckCSVReport) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCheckCSVReport) successfull");
                that.logger.log("internal", LOG_ID + "(getCheckCSVReport) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCheckCSVReport) error");
                that.logger.log("internalerror", LOG_ID, "(getCheckCSVReport) error : ", err);
                return reject(err);
            });
        });
    }
    
    importRainbowVoiceUsersWithCSVdata(companyId : string, label : string = null, noemails: boolean = true, nostrict : boolean = false, delimiter : string = null, comment : string = "%", csvData : string) {
        // POST  https://openrainbow.com/api/rainbow/massprovisioning/v1.0/users/imports/rainbowvoice     
        // API https://api.openrainbow.org/mass-provisiong/#api-Users_And_Devices-RainbowVoiceCSV
        let that = this;
        return new Promise(function (resolve, reject) {
            // content-type : text/csv; charset=utf-8
            that.logger.log("internal", LOG_ID + "(importRainbowVoiceUsersWithCSVdata) companyId : ", companyId, ", label : ", label, ", noemails : ", noemails, ", nostrict : ", nostrict, ", delimiter : ", delimiter, ", comment : ", comment);
            let url = "/api/rainbow/massprovisioning/v1.0/users/imports/rainbowvoice";

            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "label", label);
            addParamToUrl(urlParamsTab, "noemails", noemails?"true":"false");
            addParamToUrl(urlParamsTab, "nostrict", nostrict?"true":"false");
            addParamToUrl(urlParamsTab, "delimiter", delimiter);
            addParamToUrl(urlParamsTab, "comment", comment);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(importRainbowVoiceUsersWithCSVdata) REST url : ", url);
            
            /*let data = {
            }; */
            that.http.post(url, that.getRequestHeader(""), csvData, 'text/csv; charset=utf-8').then(function (json) {
            //that.http.post(url, that.getRequestHeader(), csvData, undefined).then(function (json) {
            //that.http.post(url, that.getRequestHeader(), csvData, "text/csv; charset=utf-8").then(function (json) {
                that.logger.log("info", LOG_ID + "(importRainbowVoiceUsersWithCSVdata) successfull");
                that.logger.log("internal", LOG_ID + "(importRainbowVoiceUsersWithCSVdata) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(importRainbowVoiceUsersWithCSVdata) error.");
                that.logger.log("internalerror", LOG_ID, "(importRainbowVoiceUsersWithCSVdata) error : ", err);
                return reject(err);
            });
        });
    }    

    /* The users already synchronized can be retrieved in csv format with the following API:
            GET /api/rainbow/massprovisioning/v1.0/users/synchronize?ldap_id=true&&format=csv
    the ldap_id field will allow to compare rainbow users and ldap users
    // */
    retrieveRainbowUserList(companyId? : string, format : string = "csv", ldap_id : boolean = true) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/massprovisioning/v1.0/users/synchronize";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "ldap_id", String(ldap_id));
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveRainbowUserList) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveRainbowUserList) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveRainbowUserList) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveRainbowUserList) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveRainbowUserList) error : ", err);
                return reject(err);
            });
        });
    }

    checkCSVdataForSynchronizeDirectory(delimiter : string, comment : string, commandId : string, csvData: string) {
        // POST  /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/check     
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-CheckSynchronizeCSV
        let that = this;
        return new Promise(function (resolve, reject) {
            // content-type : text/csv; charset=utf-8
            that.logger.log("internal", LOG_ID + "(checkCSVdataForSynchronizeDirectory) delimiter : ", delimiter, ", comment : ", comment, ", commandId : ", commandId);
            let url = "/api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/check";

            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "delimiter", delimiter);
            addParamToUrl(urlParamsTab, "comment", comment);
            addParamToUrl(urlParamsTab, "commandId", commandId);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(checkCSVdataForSynchronizeDirectory) REST url : ", url);

            /*let data = {
            }; */
            that.http.post(url, that.getRequestHeader(""), csvData, 'text/csv; charset=utf-8').then(function (json) {
                //that.http.post(url, that.getRequestHeader(), csvData, undefined).then(function (json) {
                //that.http.post(url, that.getRequestHeader(), csvData, "text/csv; charset=utf-8").then(function (json) {
                that.logger.log("info", LOG_ID + "(checkCSVdataForSynchronizeDirectory) successfull");
                that.logger.log("internal", LOG_ID + "(checkCSVdataForSynchronizeDirectory) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(checkCSVdataForSynchronizeDirectory) error.");
                that.logger.log("internalerror", LOG_ID, "(checkCSVdataForSynchronizeDirectory) error : ", err);
                return reject(err);
            });
        });
    }

    importCSVdataForSynchronizeDirectory(delimiter : string, comment : string, commandId : string, label : string, csvData: string) {
        // POST  /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize     
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-PostSynchronizeData
        let that = this;
        return new Promise(function (resolve, reject) {
            // content-type : text/csv; charset=utf-8
            that.logger.log("internal", LOG_ID + "(importCSVdataForSynchronizeDirectory) delimiter : ", delimiter, ", comment : ", comment, ", commandId : ", commandId, ", label : ", label);
            let url = "/api/rainbow/massprovisioning/v1.0/directories/imports/synchronize";

            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "delimiter", delimiter);
            addParamToUrl(urlParamsTab, "comment", comment);
            addParamToUrl(urlParamsTab, "commandId", commandId);
            addParamToUrl(urlParamsTab, "label", label);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(importCSVdataForSynchronizeDirectory) REST url : ", url);

            /*let data = {
            }; */
            that.http.post(url, that.getRequestHeader(""), csvData, 'text/csv; charset=utf-8').then(function (json) {
                //that.http.post(url, that.getRequestHeader(), csvData, undefined).then(function (json) {
                //that.http.post(url, that.getRequestHeader(), csvData, "text/csv; charset=utf-8").then(function (json) {
                that.logger.log("info", LOG_ID + "(importCSVdataForSynchronizeDirectory) successfull");
                that.logger.log("internal", LOG_ID + "(importCSVdataForSynchronizeDirectory) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(importCSVdataForSynchronizeDirectory) error.");
                that.logger.log("internalerror", LOG_ID, "(importCSVdataForSynchronizeDirectory) error : ", err);
                return reject(err);
            });
        });
    }

    getCSVReportByCommandId(commandId : string) : any {
        // GET /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/:commandId/report
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-PostSynchronizeCSVCommandReport
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/" + commandId + "/report";
            /*let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "commandId", commandId);
            url = urlParamsTab[0];
            // */

            that.logger.log("internal", LOG_ID + "(getCSVReportByCommandId) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCSVReportByCommandId) successfull");
                that.logger.log("internal", LOG_ID + "(getCSVReportByCommandId) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCSVReportByCommandId) error");
                that.logger.log("internalerror", LOG_ID, "(getCSVReportByCommandId) error : ", err);
                return reject(err);
            });
        });
    }

    createCSVReportByCommandId(commandId : string, data : any) {
        // POST  /api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/:commandId/report     
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-PostSynchronizeCSVCommandReport
        let that = this;
        return new Promise(function (resolve, reject) {
            // content-type : text/csv; charset=utf-8
            that.logger.log("internal", LOG_ID + "(createCSVReportByCommandId) commandId : ", commandId);
            let url = "/api/rainbow/massprovisioning/v1.0/directories/imports/synchronize/" + commandId + "/report";

            /*
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "delimiter", delimiter);
            url = urlParamsTab[0];
            // */

            that.logger.log("internal", LOG_ID + "(createCSVReportByCommandId) REST url : ", url);

            /*let data = {
            }; */
            that.http.post(url, that.getRequestHeader(""), data, undefined).then(function (json) {
                //that.http.post(url, that.getRequestHeader(), csvData, undefined).then(function (json) {
                //that.http.post(url, that.getRequestHeader(), csvData, "text/csv; charset=utf-8").then(function (json) {
                that.logger.log("info", LOG_ID + "(createCSVReportByCommandId) successfull");
                that.logger.log("internal", LOG_ID + "(createCSVReportByCommandId) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createCSVReportByCommandId) error.");
                that.logger.log("internalerror", LOG_ID, "(createCSVReportByCommandId) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveRainbowEntriesList(companyId : string, format : string, ldap_id : boolean) : any {
        // GET /api/rainbow/massprovisioning/v1.0/directories/synchronize/
        // API https://api.openrainbow.org/mass-provisiong/#api-Directories-SynchronizeDirectories
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/massprovisioning/v1.0/directories/synchronize/";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "ldap_id", ldap_id);
            url = urlParamsTab[0];
            // */

            that.logger.log("internal", LOG_ID + "(retrieveRainbowEntriesList) REST url : ", url);

            that.http.get(url, that.getRequestHeaderLowercaseAccept(), undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveRainbowEntriesList) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveRainbowEntriesList) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveRainbowEntriesList) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveRainbowEntriesList) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Massprovisioning

    //region LDAP APIs to use:

    ActivateALdapConnectorUser() : Promise<{ id : string, companyId : string, loginEmail : string, password : string  }> {
        // API https://api.openrainbow.org/admin/#api-connectors-PostLdapActivate
        // POST /api/rainbow/admin/v1.0/connectors/ldaps/activate
        
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/connectors/ldaps/activate";
            that.logger.log("internal", LOG_ID + "(ActivateALdapConnectorUser) REST url : ", url);
            let CSVTxt = undefined;

            that.http.post(url, that.getRequestHeader(), CSVTxt, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(ActivateALdapConnectorUser) successfull");
                that.logger.log("internal", LOG_ID + "(ActivateALdapConnectorUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(ActivateALdapConnectorUser) error");
                that.logger.log("internalerror", LOG_ID, "(ActivateALdapConnectorUser) error : ", err);
                return reject(err);
            });
        });
    }
    
    deleteLdapConnector (ldapId : string) : Promise<{ status : string }> {
        // API https://api.openrainbow.org/admin/#api-connectors-DeleteLdap
        // DELETE /api/rainbow/admin/v1.0/connectors/ldaps/:ldapId
        
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!ldapId) {
                that.logger.log("debug", LOG_ID + "(deleteLdapConnector) failed");
                that.logger.log("info", LOG_ID + "(deleteLdapConnector) No ldapId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/admin/v1.0/connectors/ldaps/" + ldapId, that.getRequestHeader()).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(deleteLdapConnector) successfull");
                    that.logger.log("internal", LOG_ID + "(deleteLdapConnector) REST result : " + json );
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(deleteLdapConnector) error");
                    that.logger.log("internalerror", LOG_ID, "(deleteLdapConnector) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    retrieveAllLdapConnectorUsersData (companyId? : string, format : string = "small", limit : number = 100, offset : number = undefined, sortField : string = "displayName", sortOrder : number = 1) {
        // API https://api.openrainbow.org/admin/#api-connectors-GetLdap
        // GET /api/rainbow/admin/v1.0/connectors/ldaps

        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/connectors/ldaps";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", String(limit));
            addParamToUrl(urlParamsTab, "offset", String(offset));
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", String(sortOrder));
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveAllLdapConnectorUsersData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveAllLdapConnectorUsersData) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveAllLdapConnectorUsersData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveAllLdapConnectorUsersData) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveAllLdapConnectorUsersData) error : ", err);
                return reject(err);
            });
        });
    }

    sendCommandToLdapConnectorUser(ldapId : string, command : string) : Promise<any> {
        // API https://api.openrainbow.org/admin/#api-connectors-CommandLdap
        // POST /api/rainbow/admin/v1.0/connectors/ldaps/:ldapId/command

        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/connectors/ldaps/" + ldapId + "/command";
            that.logger.log("internal", LOG_ID + "(sendCommandToLdapConnectorUser) REST url : ", url);
            let data = {command};

            that.http.post(url, that.getRequestHeader(), data, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(sendCommandToLdapConnectorUser) successfull");
                that.logger.log("internal", LOG_ID + "(sendCommandToLdapConnectorUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(sendCommandToLdapConnectorUser) error");
                that.logger.log("internalerror", LOG_ID, "(sendCommandToLdapConnectorUser) error : ", err);
                return reject(err);
            });
        });
    }

    createConfigurationForLdapConnector (companyId : string, settings : any, name : string, type : string = "ldap_config") {
        // API https://api.openrainbow.org/admin/#api-connectors-PostLdapConfig
        // POST /api/rainbow/admin/v1.0/connectors/ldaps/config
        
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/connectors/ldaps/config";
            that.logger.log("internal", LOG_ID + "(createConfigurationForLdapConnector) REST url : ", url);
            let data : any = {companyId, settings, type};
            
            if (name) {
                data.name = name;
            }

            that.http.post(url, that.getRequestHeader(), data, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(createConfigurationForLdapConnector) successfull");
                that.logger.log("internal", LOG_ID + "(createConfigurationForLdapConnector) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createConfigurationForLdapConnector) error");
                that.logger.log("internalerror", LOG_ID, "(createConfigurationForLdapConnector) error : ", err);
                return reject(err);
            });
        });
    }

    deleteLdapConnectorConfig (ldapConfigId : string) : Promise<{ status : string }> {
        // API https://api.openrainbow.org/admin/#api-connectors-DeleteLdapConfig
        // DELETE /api/rainbow/admin/v1.0/connectors/ldaps/config/:ldapConfigId

        let that = this;
        return new Promise(function (resolve, reject) {
            if (!ldapConfigId) {
                that.logger.log("debug", LOG_ID + "(deleteLdapConnectorConfig) failed");
                that.logger.log("info", LOG_ID + "(deleteLdapConnectorConfig) No ldapId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/admin/v1.0/connectors/ldaps/config/" + ldapConfigId, that.getRequestHeader()).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(deleteLdapConnectorConfig) successfull");
                    that.logger.log("internal", LOG_ID + "(deleteLdapConnectorConfig) REST result : " + json );
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(deleteLdapConnectorConfig) error");
                    that.logger.log("internalerror", LOG_ID, "(deleteLdapConnectorConfig) error : ", err);
                    return reject(err);
                });
            }
        });
    }

    retrieveLdapConnectorConfig (companyId : string) {
        // API https://api.openrainbow.org/admin/#api-connectors-GetLdapConfig
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/config 
        
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/connectors/ldaps/config";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveLdapConnectorConfig) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveLdapConnectorConfig) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveLdapConnectorConfig) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveLdapConnectorConfig) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveLdapConnectorConfig) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveLdapConnectorConfigTemplate (type : string = "ldap_template") {
        // API https://api.openrainbow.org/admin/#api-connectors-GetLdapTemplate
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/config/template
        
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/connectors/ldaps/config/template";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "type", type);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveLdapConnectorConfigTemplate) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveLdapConnectorConfigTemplate) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveLdapConnectorConfigTemplate) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveLdapConnectorConfigTemplate) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveLdapConnectorConfigTemplate) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveLdapConnectorAllConfigTemplates () {
        // API https://api.openrainbow.org/admin/#api-connectors-GetAllLdapTemplate
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/config/templates
        
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/connectors/ldaps/config/templates";
            /*let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "type", type);
            url = urlParamsTab[0];
            // */

            that.logger.log("internal", LOG_ID + "(retrieveLdapConnectorAllConfigTemplates) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveLdapConnectorAllConfigTemplates) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveLdapConnectorAllConfigTemplates) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveLdapConnectorAllConfigTemplates) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveLdapConnectorAllConfigTemplates) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveLdapConnectorAllConfigs (companyId : string) {
        // API https://api.openrainbow.org/admin/#api-connectors-GetAllLdapConfigs
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/configs 

        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/connectors/ldaps/configs";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveLdapConnectorAllConfigs) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveLdapConnectorAllConfigs) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveLdapConnectorAllConfigs) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveLdapConnectorAllConfigs) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveLdapConnectorAllConfigs) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveLDAPConnectorConfigByLdapConfigId (ldapConfigId : string) {
        // API https://api.openrainbow.org/admin/#api-connectors-GetLdapConfigById
        // GET /api/rainbow/admin/v1.0/connectors/ldaps/config/:ldapConfigId 

        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/connectors/ldaps/config/" + ldapConfigId;
            /*
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];
            // */

            that.logger.log("internal", LOG_ID + "(retrieveLDAPConnectorConfigByLdapConfigId) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveLDAPConnectorConfigByLdapConfigId) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveLDAPConnectorConfigByLdapConfigId) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveLDAPConnectorConfigByLdapConfigId) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveLDAPConnectorConfigByLdapConfigId) error : ", err);
                return reject(err);
            });
        });
    }



    updateConfigurationForLdapConnector (ldapConfigId : string, settings : any, strict  : boolean, name : string) {
        // API https://api.openrainbow.org/admin/#api-connectors-PutLdapConfig
        // PUT /api/rainbow/admin/v1.0/connectors/ldaps/config/:ldapConfigId
        
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/connectors/ldaps/config/" + ldapConfigId;
            that.logger.log("internal", LOG_ID + "(updateConfigurationForLdapConnector) REST url : ", url);
            let params : any = {strict, settings};
            if (name) {
                params.name = name;
            }

            that.http.put(url, that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(updateConfigurationForLdapConnector) successfull");
                that.logger.log("internal", LOG_ID + "(updateConfigurationForLdapConnector) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateConfigurationForLdapConnector) error");
                that.logger.log("internalerror", LOG_ID, "(updateConfigurationForLdapConnector) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion LDAP APIs to use:

    //endregion AD/LDAP

    //region Rainbow Voice Communication Platform Provisioning
    // Server doc : https://hub.openrainbow.com/api/ngcpprovisioning/index.html#tag/Cloudpbx

    //region CloudPBX

    getCloudPbxById (systemId) {
        // https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/569d0ef3ef7816921f7e94fa
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId;
            //addParamToUrl(url, "systemId", systemId);

            that.logger.log("internal", LOG_ID + "(getCloudPbxById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPbxById) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPbxById) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPbxById) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPbxById) error : ", err);
                return reject(err);
            });
        });
    }

    updateCloudPBX (systemId, barringOptions_permissions : string, barringOptions_restrictions : string, callForwardOptions_externalCallForward : string, customSipHeader_1 : string, customSipHeader_2 : string, emergencyOptions_callAuthorizationWithSoftPhone : boolean, emergencyOptions_emergencyGroupActivated : boolean, externalTrunkId : string, language : string, name : string, numberingDigits : number, numberingPrefix : number, outgoingPrefix : number,routeInternalCallsToPeer  : boolean) {
        // PUT https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}
        let that = this;

       
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId;
            that.logger.log("internal", LOG_ID + "(updateCloudPBX) REST url : ", url);
            let params = {
                "barringOptions":
                        {

                            "permissions": barringOptions_permissions,
                            "restrictions": barringOptions_restrictions
                        },
                "callForwardOptions":

                        {

                            "externalCallForward": callForwardOptions_externalCallForward

                        },
                "customSipHeader_1": customSipHeader_1,
                "customSipHeader_2": customSipHeader_2,
                "emergencyOptions":
                        {
                            "callAuthorizationWithSoftPhone": emergencyOptions_callAuthorizationWithSoftPhone,
                            "emergencyGroupActivated": emergencyOptions_emergencyGroupActivated
                        },
                "externalTrunkId": externalTrunkId,
                "language": language,
                "name": name,
                "numberingDigits": numberingDigits,
                "numberingPrefix": numberingPrefix,
                "outgoingPrefix": outgoingPrefix,
                "routeInternalCallsToPeer": routeInternalCallsToPeer
            };

            that.http.put(url, that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(updateCloudPBX) successfull");
                that.logger.log("internal", LOG_ID + "(updateCloudPBX) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateCloudPBX) error");
                that.logger.log("internalerror", LOG_ID, "(updateCloudPBX) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCloudPBX  (systemId : string) : Promise<{ status : string }> {
        // DELETE https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/569d0ef3ef7816921f7e94fa
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!systemId) {
                that.logger.log("debug", LOG_ID + "(deleteCloudPBX) failed");
                that.logger.log("info", LOG_ID + "(deleteCloudPBX) No ldapId provided");
                resolve(null);
            } else {
                that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId, that.getRequestHeader()).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(deleteCloudPBX) successfull");
                    that.logger.log("internal", LOG_ID + "(deleteCloudPBX) REST result : " + json );
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(deleteCloudPBX) error");
                    that.logger.log("internalerror", LOG_ID, "(deleteCloudPBX) error : ", err);
                    return reject(err);
                });
            }
        });
    }
    
    getCloudPbxs( limit : number, offset : number, sortField : string, sortOrder : number, companyId : string, bpId : string) {
        // https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", "" + limit);
            addParamToUrl(urlParamsTab, "offset", "" + offset);
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", "" + sortOrder);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "bpId", bpId);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getCloudPbxById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPbxById) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPbxById) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPbxById) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPbxById) error : ", err);
                return reject(err);
            });
        });
    }

    createACloudPBX(bpId : string, companyId : string, customSipHeader_1 : string, customSipHeader_2 : string, externalTrunkId : string, language : string, name : string, noReplyDelay : number, numberingDigits : number, numberingPrefix : number, outgoingPrefix : number, routeInternalCallsToPeer : boolean, siteId : string) {
        // POST https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs

        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs";
            that.logger.log("internal", LOG_ID + "(createACloudPBX) REST url : ", url);
            let param = {bpId, companyId, customSipHeader_1, customSipHeader_2, externalTrunkId, language, name, noReplyDelay, numberingDigits, numberingPrefix, outgoingPrefix, routeInternalCallsToPeer, siteId};

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(createACloudPBX) successfull");
                that.logger.log("internal", LOG_ID + "(createACloudPBX) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createACloudPBX) error");
                that.logger.log("internalerror", LOG_ID, "(createACloudPBX) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXCLIPolicyForOutboundCalls (systemId : string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/cli-options
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/cli-options";
            //addParamToUrl(url, "systemId", systemId);

            that.logger.log("internal", LOG_ID + "(getCloudPBXCLIPolicyForOutboundCalls) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPBXCLIPolicyForOutboundCalls) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPBXCLIPolicyForOutboundCalls) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPBXCLIPolicyForOutboundCalls) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPBXCLIPolicyForOutboundCalls) error : ", err);
                return reject(err);
            });
        });
    }

    updateCloudPBXCLIOptionsConfiguration (systemId : string, policy: string) {
        // PUT https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/cli-options
        let that = this;


        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/cli-options";
            that.logger.log("internal", LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) REST url : ", url);
            let params = {
               policy
            };

            that.http.put(url, that.getRequestHeader(), params, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) successfull");
                that.logger.log("internal", LOG_ID + "(updateCloudPBXCLIOptionsConfiguration) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateCloudPBXCLIOptionsConfiguration) error");
                that.logger.log("internalerror", LOG_ID, "(updateCloudPBXCLIOptionsConfiguration) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXlanguages(systemId : string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/languages
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/languages";
            //addParamToUrl(url, "systemId", systemId);

            that.logger.log("internal", LOG_ID + "(getCloudPBXlanguages) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPBXlanguages) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPBXlanguages) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPBXlanguages) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPBXlanguages) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXDeviceModels(systemId : string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/devicemodels
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devicemodels";
            //addParamToUrl(url, "systemId", systemId);

            that.logger.log("internal", LOG_ID + "(getCloudPBXDeviceModels) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPBXDeviceModels) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPBXDeviceModels) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPBXDeviceModels) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPBXDeviceModels) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXTrafficBarringOptions(systemId : string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/barring-options
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/barring-options";
            //addParamToUrl(url, "systemId", systemId);

            that.logger.log("internal", LOG_ID + "(getCloudPBXTrafficBarringOptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPBXTrafficBarringOptions) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPBXTrafficBarringOptions) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPBXTrafficBarringOptions) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPBXTrafficBarringOptions) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXEmergencyNumbersAndEmergencyOptions(systemId : string) {
        // GET https://sandbox.openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/5cd1a4f426fa4a77f8c04150/emergency-numbers
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/barring-options";
            //addParamToUrl(url, "systemId", systemId);

            that.logger.log("internal", LOG_ID + "(getCloudPBXEmergencyNumbersAndEmergencyOptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPBXEmergencyNumbersAndEmergencyOptions) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPBXEmergencyNumbersAndEmergencyOptions) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPBXEmergencyNumbersAndEmergencyOptions) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPBXEmergencyNumbersAndEmergencyOptions) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion CloudPBX
    //region Cloudpbx Devices

    CreateCloudPBXSIPDevice (systemId : string,   description : string,  deviceTypeId  : string,  macAddress  : string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices 

        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices";
            that.logger.log("internal", LOG_ID + "(CreateCloudPBXSIPDevice) REST url : ", url);
            let param = {description, deviceTypeId, macAddress};

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(CreateCloudPBXSIPDevice) successfull");
                that.logger.log("internal", LOG_ID + "(CreateCloudPBXSIPDevice) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(CreateCloudPBXSIPDevice) error");
                that.logger.log("internalerror", LOG_ID, "(CreateCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    factoryResetCloudPBXSIPDevice (systemId : string,   deviceId : string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/reset  

        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId+ "/reset";
            that.logger.log("internal", LOG_ID + "(factoryResetCloudPBXSIPDevice) REST url : ", url);
            let param = {};

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(factoryResetCloudPBXSIPDevice) successfull");
                that.logger.log("internal", LOG_ID + "(factoryResetCloudPBXSIPDevice) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(factoryResetCloudPBXSIPDevice) error");
                that.logger.log("internalerror", LOG_ID, "(factoryResetCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXSIPDeviceById (systemId : string, deviceId : string) {
        // GET  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId} 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId;
            //addParamToUrl(url, "systemId", systemId);

            that.logger.log("internal", LOG_ID + "(getCloudPBXSIPDeviceById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPBXSIPDeviceById) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPBXSIPDeviceById) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPBXSIPDeviceById) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPBXSIPDeviceById) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCloudPBXSIPDevice (systemId : string, deviceId : string) {
        // DELETE  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId} 
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId , that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(deleteCloudPBXSIPDevice) (" + systemId + ", " + deviceId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(deleteCloudPBXSIPDevice) (" + systemId + ", " + deviceId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(deleteCloudPBXSIPDevice) (" + systemId + ", " + deviceId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    updateCloudPBXSIPDevice (systemId : string,   description : string,  deviceId  : string,  macAddress  : string) {
        // PUT  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId} 
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(updateCloudPBXSIPDevice) systemId : ", systemId + ", deviceTypeId : ", deviceId);
            let data = {
                description,
                macAddress
            };
            that.http.put("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateCloudPBXSIPDevice) successfull");
                that.logger.log("internal", LOG_ID + "(updateCloudPBXSIPDevice) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateCloudPBXSIPDevice) error.");
                that.logger.log("internalerror", LOG_ID, "(updateCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getAllCloudPBXSIPDevice ( systemId : string, limit : number = 100, offset : number, sortField : string, sortOrder : number = 1, assigned : boolean, phoneNumberId : string) {
        // GET  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/  
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "assigned", assigned + "");
            addParamToUrl(urlParamsTab, "phoneNumberId", phoneNumberId);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getAllCloudPBXSIPDevice) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAllCloudPBXSIPDevice) successfull");
                that.logger.log("internal", LOG_ID + "(getAllCloudPBXSIPDevice) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllCloudPBXSIPDevice) error");
                that.logger.log("internalerror", LOG_ID, "(getAllCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    getCloudPBXSIPRegistrationsInformationDevice (systemId : string, deviceId : string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/registrations/ 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId + "/registrations/";
            //addParamToUrl(url, "systemId", systemId);

            that.logger.log("internal", LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPBXSIPRegistrationsInformationDevice) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPBXSIPRegistrationsInformationDevice) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPBXSIPRegistrationsInformationDevice) error : ", err);
                return reject(err);
            });
        });
    }

    grantCloudPBXAccessToDebugSession (systemId : string, deviceId : string,  duration : string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/debug   

        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId+ "/debug";
            that.logger.log("internal", LOG_ID + "(grantCloudPBXAccessToDebugSession) REST url : ", url);
            let param = {duration};

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(grantCloudPBXAccessToDebugSession) successfull");
                that.logger.log("internal", LOG_ID + "(grantCloudPBXAccessToDebugSession) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(grantCloudPBXAccessToDebugSession) error");
                that.logger.log("internalerror", LOG_ID, "(grantCloudPBXAccessToDebugSession) error : ", err);
                return reject(err);
            });
        });
    }

    revokeCloudPBXAccessFromDebugSession (systemId : string, deviceId : string) {
        // DELETE  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/debug  
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId + "/debug", that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(revokeCloudPBXAccessFromDebugSession) (" + systemId + ", " + deviceId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(revokeCloudPBXAccessFromDebugSession) (" + systemId + ", " + deviceId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(revokeCloudPBXAccessFromDebugSession) (" + systemId + ", " + deviceId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    rebootCloudPBXSIPDevice (systemId : string, deviceId : string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/devices/{deviceId}/reboot    

        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/devices/" + deviceId+ "/reboot";
            that.logger.log("internal", LOG_ID + "(rebootCloudPBXSIPDevice) REST url : ", url);
            let param = {};

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(rebootCloudPBXSIPDevice) successfull");
                that.logger.log("internal", LOG_ID + "(rebootCloudPBXSIPDevice) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(rebootCloudPBXSIPDevice) error");
                that.logger.log("internalerror", LOG_ID, "(rebootCloudPBXSIPDevice) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Cloudpbx Devices
    //region Cloudpbx Subscribers
    
    getCloudPBXSubscriber (systemId : string, phoneNumberId : string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}  
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId ;
            //addParamToUrl(url, "systemId", systemId);

            that.logger.log("internal", LOG_ID + "(getCloudPBXSubscriber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPBXSubscriber) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPBXSubscriber) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPBXSubscriber) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPBXSubscriber) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCloudPBXSubscriber (systemId : string, phoneNumberId : string) {
        // DELETE  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}   
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(deleteCloudPBXSubscriber) (" + systemId + ", " + phoneNumberId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(deleteCloudPBXSubscriber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(deleteCloudPBXSubscriber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }
    
    createCloudPBXSubscriberRainbowUser (systemId : string, login : string, password : string, shortNumber : string, userId : string) {
        // POST https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers   

        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers";
            that.logger.log("internal", LOG_ID + "(createCloudPBXSubscriberRainbowUser) REST url : ", url);
            let param = {
                login, 
                password, 
                shortNumber, 
                userId
            };

            that.http.post(url, that.getRequestHeader(), param, undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(createCloudPBXSubscriberRainbowUser) successfull");
                that.logger.log("internal", LOG_ID + "(createCloudPBXSubscriberRainbowUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createCloudPBXSubscriberRainbowUser) error");
                that.logger.log("internalerror", LOG_ID, "(createCloudPBXSubscriberRainbowUser) error : ", err);
                return reject(err);
            });
        });
    }
    
    getCloudPBXSIPdeviceAssignedSubscriber (systemId : string, phoneNumberId : string, deviceId : string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/devices/{deviceId}   
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/devices/" + deviceId;
            //addParamToUrl(url, "systemId", systemId);

            that.logger.log("internal", LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPBXSIPdeviceAssignedSubscriber) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPBXSIPdeviceAssignedSubscriber) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPBXSIPdeviceAssignedSubscriber) error : ", err);
                return reject(err);
            });
        });
    }
    
    removeCloudPBXAssociationSubscriberAndSIPdevice (systemId : string, phoneNumberId : string, deviceId : string) {
        // DELETE https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/devices/{deviceId}    
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete(" /api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/devices/" + deviceId  , that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(removeCloudPBXAssociationSubscriberAndSIPdevice) (" + systemId + ", " + phoneNumberId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(removeCloudPBXAssociationSubscriberAndSIPdevice) (" + systemId + ", " + phoneNumberId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(removeCloudPBXAssociationSubscriberAndSIPdevice) (" + systemId + ", " + phoneNumberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }
    
    getCloudPBXAllSIPdevicesAssignedSubscriber( systemId : string, limit : number = 100, offset : number, sortField : string, sortOrder : number = 1, phoneNumberId : string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/devices/   
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/devices" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getCloudPBXAllSIPdevicesAssignedSubscriber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPBXAllSIPdevicesAssignedSubscriber) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPBXAllSIPdevicesAssignedSubscriber) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPBXAllSIPdevicesAssignedSubscriber) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPBXAllSIPdevicesAssignedSubscriber) error : ", err);
                return reject(err);
            });
        });
    } 
    
    getCloudPBXInfoAllRegisteredSIPdevicesSubscriber (systemId : string, phoneNumberId : string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/registrations/    
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/registrations/";
            //addParamToUrl(url, "systemId", systemId);

            that.logger.log("internal", LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPBXInfoAllRegisteredSIPdevicesSubscriber) error : ", err);
                return reject(err);
            });
        });
    }
    
    assignCloudPBXSIPDeviceToSubscriber (systemId : string,   phoneNumberId : string,  deviceId  : string,  macAddress  : string) {
        // POST https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/devices  
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) systemId : ", systemId + ", deviceTypeId : ", deviceId);
            let data = {
                deviceId,
                macAddress
            };
            that.http.post("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/devices", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) successfull");
                that.logger.log("internal", LOG_ID + "(assignCloudPBXSIPDeviceToSubscriber) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(assignCloudPBXSIPDeviceToSubscriber) error.");
                that.logger.log("internalerror", LOG_ID, "(assignCloudPBXSIPDeviceToSubscriber) error : ", err);
                return reject(err);
            });
        });
    }
    
    getCloudPBXSubscriberCLIOptions (systemId : string, phoneNumberId : string) {
        // GET  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/subscribers/{phoneNumberId}/cli-options     
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/subscribers/" + phoneNumberId + "/cli-options";
            //addParamToUrl(url, "systemId", systemId);

            that.logger.log("internal", LOG_ID + "(getCloudPBXSubscriberCLIOptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPBXSubscriberCLIOptions) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPBXSubscriberCLIOptions) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPBXSubscriberCLIOptions) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPBXSubscriberCLIOptions) error : ", err);
                return reject(err);
            });
        });
    }
    

    //endregion Cloudpbx Subscribers
    //region Cloudpbx Phone Numbers

    getCloudPBXUnassignedInternalPhonenumbers(systemId : string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/free      
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/free";
            //addParamToUrl(url, "systemId", systemId);

            that.logger.log("internal", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) successfull");
                that.logger.log("internal", LOG_ID + "(getCloudPBXUnassignedInternalPhonenumbers) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getCloudPBXUnassignedInternalPhonenumbers) error");
                that.logger.log("internalerror", LOG_ID, "(getCloudPBXUnassignedInternalPhonenumbers) error : ", err);
                return reject(err);
            });
        });
    }
    
    listCloudPBXDDINumbersAssociated (systemId : string, limit : number = 100, offset : number, sortField : string = "number", sortOrder : number = 1, isAssignedToUser : boolean, isAssignedToGroup : boolean, isAssignedToIVR : boolean, isAssignedToAutoAttendant : boolean, isAssigned : boolean ) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi       
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "" ) ;
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "isAssignedToUser", isAssignedToUser + "");
            addParamToUrl(urlParamsTab, "isAssignedToGroup", isAssignedToGroup + "");
            addParamToUrl(urlParamsTab, "isAssignedToIVR", isAssignedToIVR + "");
            addParamToUrl(urlParamsTab, "isAssignedToAutoAttendant", isAssignedToAutoAttendant + "");
            addParamToUrl(urlParamsTab, "limit", isAssigned + "");
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(listCloudPBXDDINumbersAssociated) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(listCloudPBXDDINumbersAssociated) successfull");
                that.logger.log("internal", LOG_ID + "(listCloudPBXDDINumbersAssociated) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(listCloudPBXDDINumbersAssociated) error");
                that.logger.log("internalerror", LOG_ID, "(listCloudPBXDDINumbersAssociated) error : ", err);
                return reject(err);
            });
        });
    }
    
    createCloudPBXDDINumber (systemId : string, number  : string) {
        // POST https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi   
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(createCloudPBXDDINumber) systemId : ", systemId + ", number : ", number);
            let data = {
                number
            };
            that.http.post("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createCloudPBXDDINumber) successfull");
                that.logger.log("internal", LOG_ID + "(createCloudPBXDDINumber) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createCloudPBXDDINumber) error.");
                that.logger.log("internalerror", LOG_ID, "(createCloudPBXDDINumber) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCloudPBXDDINumber (systemId : string, phoneNumberId : string) {
        // DELETE https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi/{phoneNumberId}     
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi/" + phoneNumberId, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(deleteCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(deleteCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(deleteCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }
    
    associateCloudPBXDDINumber (systemId : string, phoneNumberId  : string, userId : string) {
        // POST https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi/{phoneNumberId}/users/{userId}    
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(associateCloudPBXDDINumber) systemId : ", systemId + ", phoneNumberId : ", phoneNumberId, ", userId : ", userId);
            let data = {                
            };
            that.http.post("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi/" + phoneNumberId + "/users/" + userId, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(associateCloudPBXDDINumber) successfull");
                that.logger.log("internal", LOG_ID + "(associateCloudPBXDDINumber) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(associateCloudPBXDDINumber) error.");
                that.logger.log("internalerror", LOG_ID, "(associateCloudPBXDDINumber) error : ", err);
                return reject(err);
            });
        });
    }
    
    disassociateCloudPBXDDINumber (systemId : string, phoneNumberId : string, userId : string) {
        // DELETE https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi/{phoneNumberId}/users/{userId}      
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi/" + phoneNumberId + "/users/" + userId, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(disassociateCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ", " + userId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(disassociateCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ", " + userId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(disassociateCloudPBXDDINumber) (" + systemId + ", " + phoneNumberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    setCloudPBXDDIAsdefault (systemId : string, phoneNumberId  : string) {
        // POST  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/{systemId}/phone-numbers/ddi/{phoneNumberId}/default     
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(setCloudPBXDDIAsdefault) systemId : ", systemId + ", phoneNumberId : ", phoneNumberId);
            let data = {
            };
            that.http.post("/api/rainbow/rvcpprovisioning/v1.0/cloudpbxs/" + systemId + "/phone-numbers/ddi/" + phoneNumberId + "/default", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(setCloudPBXDDIAsdefault) successfull");
                that.logger.log("internal", LOG_ID + "(setCloudPBXDDIAsdefault) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(setCloudPBXDDIAsdefault) error.");
                that.logger.log("internalerror", LOG_ID, "(setCloudPBXDDIAsdefault) error : ", err);
                return reject(err);
            });
        });
    }


    //endregion Cloudpbx Phone Numbers

    //region Cloudpbx SIP Trunk

    retrieveExternalSIPTrunkById (externalTrunkId : string) {
        // GET https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/external-trunks/{externalTrunkId} 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/external-trunks/" + externalTrunkId ;
            //addParamToUrl(url, "systemId", systemId);

            that.logger.log("internal", LOG_ID + "(retrieveExternalSIPTrunkById) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveExternalSIPTrunkById) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveExternalSIPTrunkById) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveExternalSIPTrunkById) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveExternalSIPTrunkById) error : ", err);
                return reject(err);
            });
        });
    }

    retrievelistExternalSIPTrunks (rvcpInstanceId : string, status : string, trunkType : string) {
        // GET  https://openrainbow.com/api/rainbow/rvcpprovisioning/v1.0/external-trunks/ 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/rvcpprovisioning/v1.0/external-trunks" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "rvcpInstanceId", rvcpInstanceId);
            addParamToUrl(urlParamsTab, "status", status);
            addParamToUrl(urlParamsTab, "trunkType", trunkType);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrievelistExternalSIPTrunks) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrievelistExternalSIPTrunks) successfull");
                that.logger.log("internal", LOG_ID + "(retrievelistExternalSIPTrunks) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrievelistExternalSIPTrunks) error");
                that.logger.log("internalerror", LOG_ID, "(retrievelistExternalSIPTrunks) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Cloudpbx SIP Trunk

    //endregion Rainbow Voice Communication Platform Provisioning 

    //region Rainbow Voice
    
    //region Rainbow Voice CLI Options

    retrieveAllAvailableCallLineIdentifications () {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/cli-options 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/cli-options" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "rvcpInstanceId", rvcpInstanceId);
            // addParamToUrl(urlParamsTab, "status", status);
            // addParamToUrl(urlParamsTab, "trunkType", trunkType);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveAllAvailableCallLineIdentifications) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveAllAvailableCallLineIdentifications) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveAllAvailableCallLineIdentifications) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveAllAvailableCallLineIdentifications) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveAllAvailableCallLineIdentifications) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveCurrentCallLineIdentification () {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/cli-options/current 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/cli-options/current" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            // addParamToUrl(urlParamsTab, "rvcpInstanceId", rvcpInstanceId);
            // addParamToUrl(urlParamsTab, "status", status);
            // addParamToUrl(urlParamsTab, "trunkType", trunkType);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveCurrentCallLineIdentification) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveCurrentCallLineIdentification) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveCurrentCallLineIdentification) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveCurrentCallLineIdentification) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveCurrentCallLineIdentification) error : ", err);
                return reject(err);
            });
        });
    }

    setCurrentActiveCallLineIdentification (policy : string,   phoneNumberId?  : string) {
        // API https://api.openrainbow.org/voice/#api-CLI_Options-Set_CLI
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/cli-options 
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(setCurrentActiveCallLineIdentification) policy : ", policy + ", phoneNumberId : ", phoneNumberId);
            let data = {
                policy,
                phoneNumberId
            };

            that.http.put("/api/rainbow/voice/v1.0/cli-options", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(setCurrentActiveCallLineIdentification) successfull");
                that.logger.log("internal", LOG_ID + "(setCurrentActiveCallLineIdentification) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(setCurrentActiveCallLineIdentification) error.");
                that.logger.log("internalerror", LOG_ID, "(setCurrentActiveCallLineIdentification) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice CLI Options
    
    //region Rainbow Voice Cloud PBX group

    addMemberToGroup (groupId : string, memberId : string, position : number, roles : [], status : string ) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/members
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-add_user_to_group
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(addMemberToGroup) groupId : ", groupId + ", memberId : ", memberId + ", position : ", position + ", roles : ", roles + ", status : ", status);
            let data = {
                memberId,
                position, 
                roles, 
                status
            };
            that.http.post("/api/rainbow/voice/v1.0/groups/" + groupId + "/members", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(addMemberToGroup) successfull");
                that.logger.log("internal", LOG_ID + "(addMemberToGroup) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(addMemberToGroup) error.");
                that.logger.log("internalerror", LOG_ID, "(addMemberToGroup) error : ", err);
                return reject(err);
            });
        });
    }
    
    deleteVoiceMessageAssociatedToAGroup (groupId : string, messageId : string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/messages/:messageId      
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-DeleteGroupVoiceMessage
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/voice/v1.0/groups/" + groupId + "/messages/" + messageId, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(deleteVoiceMessageAssociatedToAGroup) (" + groupId + ", " + messageId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(deleteVoiceMessageAssociatedToAGroup) (" + groupId + ", " + messageId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(deleteVoiceMessageAssociatedToAGroup) (" + groupId + ", " + messageId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getVoiceMessagesAssociatedToGroup (groupId : string, limit : number = 100, offset: number = 0, sortField:string ="name", sortOrder : number, fromDate : string, toDate : string, callerName : string, callerNumber : string ) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/messages 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-GetGroupVoiceMessages
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/groups/" + groupId + "/messages" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getVoiceMessagesAssociatedToGroup) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getVoiceMessagesAssociatedToGroup) successfull");
                that.logger.log("internal", LOG_ID + "(getVoiceMessagesAssociatedToGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getVoiceMessagesAssociatedToGroup) error");
                that.logger.log("internalerror", LOG_ID, "(getVoiceMessagesAssociatedToGroup) error : ", err);
                return reject(err);
            });
        });
    }
    
    getGroupForwards (groupId : string) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/forwards 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-GetCloudPbxGroupForwards
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/groups/" + groupId + "/forwards" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            /*addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
             // */ 
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getGroupForwards) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getGroupForwards) successfull");
                that.logger.log("internal", LOG_ID + "(getGroupForwards) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getGroupForwards) error");
                that.logger.log("internalerror", LOG_ID, "(getGroupForwards) error : ", err);
                return reject(err);
            });
        });
    }

    getTheUserGroup (type : string) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/groups 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-Get_User_groups
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/groups" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "type", type + "");
            /*
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
             // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getTheUserGroup) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getTheUserGroup) successfull");
                that.logger.log("internal", LOG_ID + "(getTheUserGroup) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getTheUserGroup) error");
                that.logger.log("internalerror", LOG_ID, "(getTheUserGroup) error : ", err);
                return reject(err);
            });
        });
    }
    
    joinAGroup (groupId : string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/join     
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-Join_group
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(joinAGroup) groupId : ", groupId );
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/groups/" + groupId + "/join", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(joinAGroup) successfull");
                that.logger.log("internal", LOG_ID + "(joinAGroup) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(joinAGroup) error.");
                that.logger.log("internalerror", LOG_ID, "(joinAGroup) error : ", err);
                return reject(err);
            });
        });
    }
    
    joinAllGroups () {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/join     
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-Join_all_groups
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(joinAllGroups) ");
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/groups/join", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(joinAllGroups) successfull");
                that.logger.log("internal", LOG_ID + "(joinAllGroups) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(joinAllGroups) error.");
                that.logger.log("internalerror", LOG_ID, "(joinAllGroups) error : ", err);
                return reject(err);
            });
        });
    }

    leaveAGroup (groupId : string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/leave     
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-leave_group
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(leaveAGroup) groupId : ", groupId );
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/groups/" + groupId + "/leave", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(leaveAGroup) successfull");
                that.logger.log("internal", LOG_ID + "(leaveAGroup) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(leaveAGroup) error.");
                that.logger.log("internalerror", LOG_ID, "(leaveAGroup) error : ", err);
                return reject(err);
            });
        });
    }

    leaveAllGroups () {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/groups/leave     
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-leave_all_groups
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(leaveAllGroups) ");
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/groups/leave", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(leaveAllGroups) successfull");
                that.logger.log("internal", LOG_ID + "(leaveAllGroups) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(leaveAllGroups) error.");
                that.logger.log("internalerror", LOG_ID, "(leaveAllGroups) error : ", err);
                return reject(err);
            });
        });
    }

    removeMemberFromGroup (groupId : string, memberId : string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/members/:memberId      
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-remove_user_from_group
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/voice/v1.0/groups/" + groupId + "/members/" + memberId, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(removeMemberFromGroup) (" + groupId + ", " + memberId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(removeMemberFromGroup) (" + groupId + ", " + memberId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(removeMemberFromGroup) (" + groupId + ", " + memberId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/groups/messages-summary 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-GetGroupsMessagesSummary
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/groups/messages-summary" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            /*addParamToUrl(urlParamsTab, "limit", limit + "");
             // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveNumberReadUnreadMessagesForHuntingGroupsOfLoggedUser) error : ", err);
                return reject(err);
            });
        });
    }

    updateAGroup (groupId : string, externalNumberId : string, isEmptyAllowed : boolean) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-PutCloudPbxGroup
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) groupId : ", groupId, ", externalNumberId : ", externalNumberId, ", isEmptyAllowed : ", isEmptyAllowed );
            let data = {
                externalNumberId,
                isEmptyAllowed
            };
            that.http.put("/api/rainbow/voice/v1.0/groups/" + groupId, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateAGroup) successfull");
                that.logger.log("internal", LOG_ID + "(updateAGroup) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateAGroup) error.");
                that.logger.log("internalerror", LOG_ID, "(updateAGroup) error : ", err);
                return reject(err);
            });
        });
    }

    updateAVoiceMessageAssociatedToAGroup (groupId : string,   messageId  : string, read : boolean) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/messages/:messageId 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-UpdateGroupVoiceMessage
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) groupId : ", groupId + ", messageId : ", messageId );
            let data = {
                read
            };
            that.http.put("/api/rainbow/voice/v1.0/groups/" + groupId + "/messages/" + messageId, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) successfull");
                that.logger.log("internal", LOG_ID + "(updateAVoiceMessageAssociatedToAGroup) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateAVoiceMessageAssociatedToAGroup) error.");
                that.logger.log("internalerror", LOG_ID, "(updateAVoiceMessageAssociatedToAGroup) error : ", err);
                return reject(err);
            });
        });
    }

    updateGroupForward (groupId : string,   callForwardType  : string, destinationType : string, numberToForward : number, activate : boolean, noReplyDelay : number, managerIds : Array<string>, rvcpAutoAttendantId : string ) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/forwards/:callForwardType 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-PutCloudPbxGroupForwards
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(updateGroupForward) groupId : ", groupId + ", callForwardType : ", callForwardType );
            let data = {
                destinationType, 
                "number" : numberToForward, 
                activate, 
                noReplyDelay,
                managerIds, 
                rvcpAutoAttendantId 
            };
            that.http.put("/api/rainbow/voice/v1.0/groups/" + groupId + "/forwards/" + callForwardType, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateGroupForward) successfull");
                that.logger.log("internal", LOG_ID + "(updateGroupForward) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateGroupForward) error.");
                that.logger.log("internalerror", LOG_ID, "(updateGroupForward) error : ", err);
                return reject(err);
            });
        });
    }

    updateGroupMember (groupId : string,   memberId  : string, position  : number, roles : Array<string>, status : string ) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/groups/:groupId/members/:memberId 
        // API https://api.openrainbow.org/voice/#api-Cloud_PBX_group-update_member_inside_group
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(updateGroupMember) groupId : ", groupId + ", memberId : ", memberId );
            let data = {
                position,
                roles,
                status
            };
            that.http.put("/api/rainbow/voice/v1.0/groups/" + groupId + "/members/" + memberId, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateGroupMember) successfull");
                that.logger.log("internal", LOG_ID + "(updateGroupMember) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateGroupMember) error.");
                that.logger.log("internalerror", LOG_ID, "(updateGroupMember) error : ", err);
                return reject(err);
            });
        });
    }
    
    //endregion Rainbow Voice Cloud PBX group    
    
    //region Rainbow Voice Deskphones
    
    activateDeactivateDND(activate: boolean){
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/dnd
        // API https://api.openrainbow.org/voice/#api-Deskphones-Put_Dnd_state
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(activateDeactivateDND) activate : ", activate );
            let data = undefined;
            that.http.put("/api/rainbow/voice/v1.0/deskphones/dnd?activate=" + activate, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(activateDeactivateDND) successfull");
                that.logger.log("internal", LOG_ID + "(activateDeactivateDND) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(activateDeactivateDND) error.");
                that.logger.log("internalerror", LOG_ID, "(activateDeactivateDND) error : ", err);
                return reject(err);
            });
        });

    }
    
    configureAndActivateDeactivateForward(callForwardType: string, type : string, number : string, timeout : number , activated : boolean  ){
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/forwards/:callForwardType
        // API https://api.openrainbow.org/voice/#api-Deskphones-Put_Forward_state
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(configureAndActivateDeactivateForward) callForwardType : ", callForwardType );
            let data = {
                type,
                number,
                timeout,
                activated
            };
            that.http.put("/api/rainbow/voice/v1.0/deskphones/forwards/" + callForwardType, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(configureAndActivateDeactivateForward) successfull");
                that.logger.log("internal", LOG_ID + "(configureAndActivateDeactivateForward) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(configureAndActivateDeactivateForward) error.");
                that.logger.log("internalerror", LOG_ID, "(configureAndActivateDeactivateForward) error : ", err);
                return reject(err);
            });
        });
    }
    
    retrieveActiveForwards(){
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/forwards     
        // API https://api.openrainbow.org/voice/#api-Deskphones-Get_active_forwards
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/deskphones/forwards" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            /*
            addParamToUrl(urlParamsTab, "type", type + "");
             // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveActiveForwards) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveActiveForwards) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveActiveForwards) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveActiveForwards) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveActiveForwards) error : ", err);
                return reject(err);
            });
        });
    }
    
    retrieveDNDState(){
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/dnd     
        // API https://api.openrainbow.org/voice/#api-Deskphones-Get_Dnd_state
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/deskphones/dnd";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            /*
            addParamToUrl(urlParamsTab, "type", type + "");
             // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveDNDState) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveDNDState) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveDNDState) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveDNDState) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveDNDState) error : ", err);
                return reject(err);
            });
        });
    }
    
    searchUsersGroupsContactsByName(displayName : string, limit : number ){
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/deskphones/searchbyname     
        // API https://api.openrainbow.org/voice/#api-Deskphones-Search_by_name
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/deskphones/searchbyname" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            
            addParamToUrl(urlParamsTab, "displayName", displayName);
            addParamToUrl(urlParamsTab, "limit", limit);
             // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(searchUsersGroupsContactsByName) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(searchUsersGroupsContactsByName) successfull");
                that.logger.log("internal", LOG_ID + "(searchUsersGroupsContactsByName) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(searchUsersGroupsContactsByName) error");
                that.logger.log("internalerror", LOG_ID, "(searchUsersGroupsContactsByName) error : ", err);
                return reject(err);
            });
        });
    }
    
    //endregion Rainbow Voice Deskphones
    
    //region Rainbow Voice Personal Routines    

    activatePersonalRoutine (routineId : string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId/activate     
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Activate_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(activatePersonalRoutine) routineId : ", routineId);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/personalroutines/" + routineId + "/activate", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(activatePersonalRoutine) successfull");
                that.logger.log("internal", LOG_ID + "(activatePersonalRoutine) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(activatePersonalRoutine) error.");
                that.logger.log("internalerror", LOG_ID, "(activatePersonalRoutine) error : ", err);
                return reject(err);
            });
        });
    }

    createCustomPersonalRoutine (name : string) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines     
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Create_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(createCustomPersonalRoutine) name : ", name);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/personalroutines", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createCustomPersonalRoutine) successfull");
                that.logger.log("internal", LOG_ID + "(createCustomPersonalRoutine) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createCustomPersonalRoutine) error.");
                that.logger.log("internalerror", LOG_ID, "(createCustomPersonalRoutine) error : ", err);
                return reject(err);
            });
        });
    }

    deleteCustomPersonalRoutine(routineId : string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId      
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Delete_PersonalRoutine
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/personalroutines/" + routineId;
            that.http.delete( url, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(deleteCustomPersonalRoutine) (" + routineId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(deleteCustomPersonalRoutine) (" + routineId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(deleteCustomPersonalRoutine) (" + routineId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getPersonalRoutineData (routineId : string) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId 
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Get_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/personalroutines/" + routineId ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            /*
            addParamToUrl(urlParamsTab, "type", type + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
             // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getPersonalRoutineData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getPersonalRoutineData) successfull");
                that.logger.log("internal", LOG_ID + "(getPersonalRoutineData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getPersonalRoutineData) error");
                that.logger.log("internalerror", LOG_ID, "(getPersonalRoutineData) error : ", err);
                return reject(err);
            });
        });
    }

    getAllPersonalRoutines (userId ) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines 
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Get_PersonalRoutines
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/personalroutines?userId=" + userId  ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            /*
            addParamToUrl(urlParamsTab, "type", type + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
             // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getAllPersonalRoutines) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAllPersonalRoutines) successfull");
                that.logger.log("internal", LOG_ID + "(getAllPersonalRoutines) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllPersonalRoutines) error");
                that.logger.log("internalerror", LOG_ID, "(getAllPersonalRoutines) error : ", err);
                return reject(err);
            });
        });
    }

    updatePersonalRoutineData (routineId : string, dndPresence : boolean, name : string, presence  : { manage : boolean, value: string }, deviceMode : {manage : boolean, mode : string}, immediateCallForward : {manage : boolean, activate : boolean, number  : string, destinationType : string}, busyCallForward : { manage : boolean, activate : boolean, number : string, destinationType : string}, noreplyCallForward : { manage : boolean, activate : boolean, number : string, destinationType : string, noReplyDelay : number}, huntingGroups : { withdrawAll : boolean} ) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/personalroutines/:routineId 
        // API https://api.openrainbow.org/voice/#api-Personal_Routines-Update_PersonalRoutine
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(updatePersonalRoutineData) routineId : ", routineId + ", name : ", name );
            let data = {
                dndPresence,
                name,
                presence,
                deviceMode, 
                immediateCallForward,
                busyCallForward,
                noreplyCallForward, 
                huntingGroups 
            };
            that.http.put("/api/rainbow/voice/v1.0/personalroutines/" + routineId, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updatePersonalRoutineData) successfull");
                that.logger.log("internal", LOG_ID + "(updatePersonalRoutineData) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updatePersonalRoutineData) error.");
                that.logger.log("internalerror", LOG_ID, "(updatePersonalRoutineData) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Voice Personal Routines    
    
    //region Rainbow Voice Routing

    manageUserRoutingData (destinations  : Array<string>, currentDeviceId : string ) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/routing 
        // API https://api.openrainbow.org/voice/#api-Routing-Set_Routing
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(manageUserRoutingData) destinations : ", destinations + ", currentDeviceId : ", currentDeviceId );
            let data = {
                destinations ,
                currentDeviceId
            };
            that.http.put("/api/rainbow/voice/v1.0/routing", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(manageUserRoutingData) successfull");
                that.logger.log("internal", LOG_ID + "(manageUserRoutingData) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(manageUserRoutingData) error.");
                that.logger.log("internalerror", LOG_ID, "(manageUserRoutingData) error : ", err);
                return reject(err);
            });
        });
    }

    retrievetransferRoutingData (calleeId : string, addresseeId ? : string, addresseePhoneNumber ? : string) {
        // GET    https://openrainbow.com/api/rainbow/voice/v1.0/transfer-routing
        // API https://api.openrainbow.org/voice/#api-Routing-Get_Transfer_Routing
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/transfer-routing" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            
            addParamToUrl(urlParamsTab, "calleeId", calleeId );
            addParamToUrl(urlParamsTab, "addresseeId", addresseeId );
            addParamToUrl(urlParamsTab, "addresseePhoneNumber", addresseePhoneNumber );
            /*addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
             // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrievetransferRoutingData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrievetransferRoutingData) successfull");
                that.logger.log("internal", LOG_ID + "(retrievetransferRoutingData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrievetransferRoutingData) error");
                that.logger.log("internalerror", LOG_ID, "(retrievetransferRoutingData) error : ", err);
                return reject(err);
            });
        });
    }

    retrieveUserRoutingData () {
        // GET  https://api.openrainbow.org/api/rainbow/voice/v1.0/routing
        // API https://api.openrainbow.org/voice/#api-Routing-Get_Routing
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/routing" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            /*addParamToUrl(urlParamsTab, "calleeId", calleeId );
            addParamToUrl(urlParamsTab, "addresseeId", addresseeId );
            addParamToUrl(urlParamsTab, "addresseePhoneNumber", addresseePhoneNumber );
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
             // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveUserRoutingData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveUserRoutingData) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveUserRoutingData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveUserRoutingData) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveUserRoutingData) error : ", err);
                return reject(err);
            });
        });
    }
    
    //endregion Rainbow Voice Routing    

    //region Rainbow Voice Settings 

    retrieveVoiceUserSettings () {
        // GET  https://api.openrainbow.org/api/rainbow/voice/v1.0/settings
        // API https://api.openrainbow.org/voice/#api-Settings-Get_settings
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/settings" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            /*addParamToUrl(urlParamsTab, "calleeId", calleeId );
            addParamToUrl(urlParamsTab, "addresseeId", addresseeId );
            addParamToUrl(urlParamsTab, "addresseePhoneNumber", addresseePhoneNumber );
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
             // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(retrieveVoiceUserSettings) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(retrieveVoiceUserSettings) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveVoiceUserSettings) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveVoiceUserSettings) error");
                that.logger.log("internalerror", LOG_ID, "(retrieveVoiceUserSettings) error : ", err);
                return reject(err);
            });
        });
    }
    
    //endregion Rainbow Voice Settings  
    
    //region Rainbow Voice Voice
    
    addParticipant3PCC(callId : string, callData : { callee : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/participants     
        // API https://api.openrainbow.org/voice/#api-Voice-Add_participant
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(addParticipant3PCC) callId : ", callId, ", callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/participants", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(addParticipant3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(addParticipant3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(addParticipant3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(addParticipant3PCC) error : ", err);
                return reject(err);
            });
        });
    }
    
    answerCall3PCC(callId : string, callData : { legId : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/answer     
        // API https://api.openrainbow.org/voice/#api-Voice-Answer_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(answerCall3PCC) callId : ", callId, ", callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/participants", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(answerCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(answerCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(answerCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(answerCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }
    
    blindTransferCall3PCC(callId : string, callData : {destination : { userId : string , resource : string}}) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/blind-transfer     
        // API https://api.openrainbow.org/voice/#api-Voice-Blind_Transfer_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(blindTransferCall3PCC) callId : ", callId, ", callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/participants", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(blindTransferCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(blindTransferCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(blindTransferCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(blindTransferCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    deflectCall3PCC(callId : string, callData : { destination : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/deflect     
        // API https://api.openrainbow.org/voice/#api-Voice-Deflect_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(deflectCall3PCC) callId : ", callId, ", callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/deflect", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(deflectCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(deflectCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(deflectCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(deflectCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    holdCall3PCC(callId : string, callData : { legId : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/hold     
        // API https://api.openrainbow.org/voice/#api-Voice-Hold_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(holdCall3PCC) callId : ", callId, ", callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/hold", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(holdCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(holdCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(holdCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(holdCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }
    
    makeCall3PCC(callData : {deviceId : string,
                     callerAutoAnswer : boolean,
                     anonymous : boolean,
                     calleeExtNumber : string,
                     calleePbxId : string,
                     calleeShortNumber : string,
                     calleeCountry : string,
                     dialPadCalleeNumber : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls     
        // API https://api.openrainbow.org/voice/#api-Voice-Make_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(makeCall3PCC) callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(makeCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(makeCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(makeCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(makeCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    mergeCall3PCC(activeCallId : string, callData : { heldCallId : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:activeCallId/merge     
        // API https://api.openrainbow.org/voice/#api-Voice-Merge_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(mergeCall3PCC) activeCallId : ", activeCallId);
            let data = {};
            that.http.post("/api/rainbow/voice/v1.0/calls/" + activeCallId + "/merge", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(mergeCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(mergeCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(mergeCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(mergeCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    pickupCall3PCC(callData : {deviceId : string,
        callerAutoAnswer : boolean,
        calleeShortNumber  : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/pickup
        // API https://api.openrainbow.org/voice/#api-Voice-Pickup_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(pickupCall3PCC) callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/pickup", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(pickupCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(pickupCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(pickupCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(pickupCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    releaseCall3PCC(callId : string, legId : string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId      
        // API https://api.openrainbow.org/voice/#api-Voice-Release_call
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/calls/" + callId;
            url += legId? "?legId=" + legId : "";
            that.http.delete( url, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(releaseCall3PCC) (" + callId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(releaseCall3PCC) (" + callId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(releaseCall3PCC) (" + callId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }
    
    retrieveCall3PCC(callId : string, callData : {legId : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/retrieve
        // API https://api.openrainbow.org/voice/#api-Voice-Retrieve_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(retrieveCall3PCC) callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/retrieve", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(retrieveCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(retrieveCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(retrieveCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(retrieveCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    sendDTMF3PCC(callId : string, callData : {legId : string, digits : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:callId/senddtmf
        // API https://api.openrainbow.org/voice/#api-Voice-Send_DTMF
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(sendDTMF3PCC) callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + callId + "/senddtmf", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(sendDTMF3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(sendDTMF3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(sendDTMF3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(sendDTMF3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    snapshot3PCC(callId  : string, deviceId : string, seqNum : number ) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/snapshot 
        // API https://api.openrainbow.org/voice/#api-Voice-SnapshotCall
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/snapshot" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            
            addParamToUrl(urlParamsTab, "callId", callId + "");
            addParamToUrl(urlParamsTab, "deviceId", deviceId + "");
            addParamToUrl(urlParamsTab, "seqNum", seqNum + "");
            /*
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
             // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(snapshot3PCC) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(snapshot3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(snapshot3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(snapshot3PCC) error");
                that.logger.log("internalerror", LOG_ID, "(snapshot3PCC) error : ", err);
                return reject(err);
            });
        });
    }
    
    transferCall3PCC(activeCallId : string, callData : {heldCallId : string }) {
        // POST  https://openrainbow.com/api/rainbow/voice/v1.0/calls/:activeCallId/transfer
        // API https://api.openrainbow.org/voice/#api-Voice-Transfer_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(transferCall3PCC) callData : ", callData);
            let data = {
            };
            that.http.post("/api/rainbow/voice/v1.0/calls/" + activeCallId + "/transfer", that.getRequestHeader(), callData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(transferCall3PCC) successfull");
                that.logger.log("internal", LOG_ID + "(transferCall3PCC) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(transferCall3PCC) error.");
                that.logger.log("internalerror", LOG_ID, "(transferCall3PCC) error : ", err);
                return reject(err);
            });
        });
    }

    deleteAVoiceMessage(messageId : string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/messages/:messageId
        // API https://api.openrainbow.org/voice/#api-Voice-DeleteVoiceMailMessage
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/messages/" + messageId;
            that.http.delete( url, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(deleteAVoiceMessage) (" + messageId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(deleteAVoiceMessage) (" + messageId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(deleteAVoiceMessage) (" + messageId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    deleteAllVoiceMessages(messageId : string) {
        // DELETE https://openrainbow.com/api/rainbow/voice/v1.0/messages
        // API https://api.openrainbow.org/voice/#api-Voice-DeleteVoiceMailMessages
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/voice/v1.0/messages";
            that.http.delete( url, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(deleteAllVoiceMessages) (" + messageId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(deleteAllVoiceMessages) (" + messageId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(deleteAllVoiceMessages) (" + messageId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getEmergencyNumbersAndEmergencyOptions() {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/emergency-numbers 
        // API https://api.openrainbow.org/voice/#api-Voice-EmergencyNumbers
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/emergency-numbers" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            /*
            addParamToUrl(urlParamsTab, "callId", callId + "");
            addParamToUrl(urlParamsTab, "deviceId", deviceId + "");
            addParamToUrl(urlParamsTab, "seqNum", seqNum + "");
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
             // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getEmergencyNumbersAndEmergencyOptions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getEmergencyNumbersAndEmergencyOptions) successfull");
                that.logger.log("internal", LOG_ID + "(getEmergencyNumbersAndEmergencyOptions) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getEmergencyNumbersAndEmergencyOptions) error");
                that.logger.log("internalerror", LOG_ID, "(getEmergencyNumbersAndEmergencyOptions) error : ", err);
                return reject(err);
            });
        });
    }

    getVoiceMessages(limit : number,
    offset : number,
    sortField : string,
    sortOrder : number,
    fromDate : string,
    toDate : string,
    callerName : string,
    callerNumber : string ) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/messages
        // API https://api.openrainbow.org/voice/#api-Voice-GetVoiceMessages
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/messages" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField + "");
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
             // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getVoiceMessages) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getVoiceMessages) successfull");
                that.logger.log("internal", LOG_ID + "(getVoiceMessages) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getVoiceMessages) error");
                that.logger.log("internalerror", LOG_ID, "(getVoiceMessages) error : ", err);
                return reject(err);
            });
        });
    }

    getUserDevices( ) {
        // GET  https://openrainbow.com/api/rainbow/voice/v1.0/devices
        // API https://api.openrainbow.org/voice/#api-Voice-Devices
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/voice/v1.0/devices" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            /*
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField + "");
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
            // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getUserDevices) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getUserDevices) successfull");
                that.logger.log("internal", LOG_ID + "(getUserDevices) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getUserDevices) error");
                that.logger.log("internalerror", LOG_ID, "(getUserDevices) error : ", err);
                return reject(err);
            });
        });
    }

    updateVoiceMessage(messageId : string,   urlData : { read   : boolean }) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/messages/:messageId 
        // API https://api.openrainbow.org/voice/#api-Voice-UpdateVoiceMessage
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(updateVoiceMessage) messageId : ", messageId + ", urlData : ", urlData );
            let data = {
            };
            that.http.put("/api/rainbow/voice/v1.0/messages/" + messageId, that.getRequestHeader(), urlData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateVoiceMessage) successfull");
                that.logger.log("internal", LOG_ID + "(updateVoiceMessage) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateVoiceMessage) error.");
                that.logger.log("internalerror", LOG_ID, "(updateVoiceMessage) error : ", err);
                return reject(err);
            });
        });
    }
    
    //endregion Rainbow Voice Voice    

    //region Rainbow Voice Voice Forward
    
    forwardCall(callForwardType : string, userId :string,  urlData : { destinationType :string, number : string, activate : boolean, noReplyDelay : number }) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/forwards/:callForwardType 
        // API https://api.openrainbow.org/voice/#api-Voice_Forward-Forward_call
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(forwardCall) callForwardType : ", callForwardType + ", urlData : ", urlData );
            let url : string = "/api/rainbow/voice/v1.0/forwards/" + callForwardType ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);

            
            addParamToUrl(urlParamsTab, "userId ", userId  + "");
            /*
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField + "");
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
            // */
            url = urlParamsTab[0];
            let data = {
            };
            that.http.put(url, that.getRequestHeader(), urlData, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(forwardCall) successfull");
                that.logger.log("internal", LOG_ID + "(forwardCall) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(forwardCall) error.");
                that.logger.log("internalerror", LOG_ID, "(forwardCall) error : ", err);
                return reject(err);
            });
        });
    }
    
    getASubscriberForwards( userId :string) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/forwards 
        // API https://api.openrainbow.org/voice/#api-Voice_Forward-Get_Subscriber_call_forwards
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(getASubscriberForwards) userId : ", userId );
            let url : string = "/api/rainbow/voice/v1.0/forwards" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);


            addParamToUrl(urlParamsTab, "userId ", userId  + "");
            /*
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField + "");
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
            // */
            url = urlParamsTab[0];
            let data = {
            };
            that.http.put(url, that.getRequestHeader(), {}, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(getASubscriberForwards) successfull");
                that.logger.log("internal", LOG_ID + "(getASubscriberForwards) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getASubscriberForwards) error.");
                that.logger.log("internalerror", LOG_ID, "(getASubscriberForwards) error : ", err);
                return reject(err);
            });
        });
    }

    // */

    //endregion Rainbow Voice Voice Forward

    //region Rainbow Voice Voice Search Hunting Groups
    
    searchCloudPBXhuntingGroups( name :string) {
        // PUT  https://openrainbow.com/api/rainbow/voice/v1.0/search/huntinggroups 
        // API https://api.openrainbow.org/voice/#api-Voice_Search_Hunting_Groups-Get_Cloud_PBX_Hunting_Groups
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(searchCloudPBXhuntingGroups) name : ", name );
            let url : string = "/api/rainbow/voice/v1.0/search/huntinggroups" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);


            addParamToUrl(urlParamsTab, "name", name + "");
            /*
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField + "");
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
            // */
            url = urlParamsTab[0];
            let data = {
            };
            that.http.put(url, that.getRequestHeader(), {}, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(searchCloudPBXhuntingGroups) successfull");
                that.logger.log("internal", LOG_ID + "(searchCloudPBXhuntingGroups) REST result : ", json.data);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(searchCloudPBXhuntingGroups) error.");
                that.logger.log("internalerror", LOG_ID, "(searchCloudPBXhuntingGroups) error : ", err);
                return reject(err);
            });
        });
    }

    // */

    //endregion Rainbow Voice Voice Search Hunting Groups
    
    //endregion Rainbow Voice
    
    //region Clients Versions


    createAClientVersion (id : string, version: string) {
        // POST  https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions     
        // API https://api.openrainbow.org/admin/#api-clients_versions-PostClientsVersions
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(createAClientVersion) id : ", id, ", version : ", version );
            let data = {
                id, 
                version
            };
            that.http.post("/api/rainbow/admin/v1.0/clientsversions", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createAClientVersion) successfull");
                that.logger.log("internal", LOG_ID + "(createAClientVersion) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createAClientVersion) error.");
                that.logger.log("internalerror", LOG_ID, "(createAClientVersion) error : ", err);
                return reject(err);
            });
        });
    }
    
    deleteAClientVersion (clientId : string) {
        // DELETE https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions/:clientId      
        // API https://api.openrainbow.org/admin/#api-clients_versions-DeleteClientsVersions
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/admin/v1.0/clientsversions/" + clientId, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(deleteAClientVersion) (" + clientId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(deleteAClientVersion) (" + clientId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(deleteAClientVersion) (" + clientId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    getAClientVersionData (clientId : string) {
        // GET  https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions/:clientId 
        // API https://api.openrainbow.org/admin/#api-clients_versions-GetClientsVersionsId
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/clientsversions/" + clientId ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            /*
            addParamToUrl(urlParamsTab, "type", type + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "fromDate", fromDate);
            addParamToUrl(urlParamsTab, "toDate", toDate );
            addParamToUrl(urlParamsTab, "callerName", callerName );
            addParamToUrl(urlParamsTab, "callerNumber", callerNumber );
             // */
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getAClientVersionData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAClientVersionData) successfull");
                that.logger.log("internal", LOG_ID + "(getAClientVersionData) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAClientVersionData) error");
                that.logger.log("internalerror", LOG_ID, "(getAClientVersionData) error : ", err);
                return reject(err);
            });
        });
    }
    
    getAllClientsVersions (name? : string, typeClient? : string, limit :number = 100, offset? : number, sortField : string = "name", sortOrder : number = 1) {
        // GET  https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions 
        // API https://api.openrainbow.org/admin/#api-clients_versions-GetClientsversions
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/clientsversions" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            if (name) addParamToUrl(urlParamsTab, "name", name + "");
            if (typeClient) addParamToUrl(urlParamsTab, "type", typeClient  + "");
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getAllClientsVersions) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAllClientsVersions) successfull");
                that.logger.log("internal", LOG_ID + "(getAllClientsVersions) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllClientsVersions) error");
                that.logger.log("internalerror", LOG_ID, "(getAllClientsVersions) error : ", err);
                return reject(err);
            });
        });
    }

    updateAClientVersion (clientId : string,   version   : string) {
        // PUT  https://openrainbow.com/api/rainbow/admin/v1.0/clientsversions/:clientId 
        // API https://api.openrainbow.org/admin/#api-clients_versions-PutClientsVersions
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(updateAClientVersion) clientId : ", clientId + ", version : ", version );
            let data = {
                version
            };
            that.http.put("/api/rainbow/admin/v1.0/clientsversions/" + clientId, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateAClientVersion) successfull");
                that.logger.log("internal", LOG_ID + "(updateAClientVersion) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateAClientVersion) error.");
                that.logger.log("internalerror", LOG_ID, "(updateAClientVersion) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Clients Versions
    
    //region sites
    
    createASite(name : string, status : string, companyId : string) {
        // POST  https://openrainbow.com/api/rainbow/admin/v1.0/sites     
        let that = this;
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(createASite) name : ", name + ", status : ", status, ", companyId : " + companyId);
            let data = {
                name, 
                status, 
                companyId
            } ;
            that.http.post("/api/rainbow/admin/v1.0/sites", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createASite) successfull");
                that.logger.log("internal", LOG_ID + "(createASite) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createASite) error.");
                that.logger.log("internalerror", LOG_ID, "(createASite) error : ", err);
                return reject(err);
            });
        });
    }
    
    deleteSite (siteId : string) {
        // DELETE https://openrainbow.com/api/rainbow/admin/v1.0/sites/{siteId}      
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/admin/v1.0/sites/" + siteId, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(deleteSite) (" + siteId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(deleteSite) (" + siteId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(deleteSite) (" + siteId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }
    
    getSiteData (siteId : string) {
        // GET  https://openrainbow.com/api/rainbow/admin/v1.0/sites/{siteId} 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/sites/" + siteId ;
            //addParamToUrl(url, "rvcpInstanceId", rvcpInstanceId);

            that.logger.log("internal", LOG_ID + "(getSiteData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getSiteData) successfull");
                that.logger.log("internal", LOG_ID + "(getSiteData) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getSiteData) error");
                that.logger.log("internalerror", LOG_ID, "(getSiteData) error : ", err);
                return reject(err);
            });
        });
    }
    
    getAllSites (format = "small", limit = 100, offset = 0, sortField="name", sortOrder : number, name : string, companyId : string) {
        // GET  https://openrainbow.com/api/rainbow/admin/v1.0/sites 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/admin/v1.0/sites" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getAllSites) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAllSites) successfull");
                that.logger.log("internal", LOG_ID + "(getAllSites) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllSites) error");
                that.logger.log("internalerror", LOG_ID, "(getAllSites) error : ", err);
                return reject(err);
            });
        });
    }
    
    updateSite (siteId : string, name : string, status : string, companyId : string) {
        // PUT https://openrainbow.com/api/rainbow/admin/v1.0/sites/:siteId
        let that = this;
        let data = {
            name, 
            status, 
            companyId
        };

        return new Promise(function (resolve, reject) {
            that.http.put("/api/rainbow/admin/v1.0/sites/" + siteId, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateSite) successfull");
                that.logger.log("internal", LOG_ID + "(updateSite) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateSite) error");
                that.logger.log("internalerror", LOG_ID, "(updateSite) error : ", err);
                return reject(err);
            });
        });
    }
    
    //endregion sites

    //region Rainbow Company Directory portal 
    // https://api.openrainbow.org/directory/
    //region directory
    // Create a directory entry
    createDirectoryEntry ( companyId : string, 
                           firstName : string, 
                           lastName : string, 
                           companyName : string, 
                           department : string,
                            street : string,
                            city : string,
                            state : string,
                            postalCode : string,
                            country : string,
                            workPhoneNumbers : string[],
                            mobilePhoneNumbers : string[],
                            otherPhoneNumbers : string[],
                            jobTitle : string,
                            eMail : string,
                            tags : string[],
                            custom1 : string,
                            custom2 : string
    ){
        // POST  https://openrainbow.com/api/rainbow/directory/v1.0/entries     
        let that = this;
        return new Promise(function (resolve, reject) {
            let data : any = {};

            if (companyId) {
                data.companyId = companyId;
            }
            if (firstName) {
                data.firstName = firstName;
            }
            if (lastName) {
                data.lastName = lastName;
            }
            if (companyName) {
                data.companyName = companyName;
            }
            if (department) {
                data.department = department;
            }
            if (street) {
                data.street = street;
            }
            if (city) {
                data.city = city;
            }
            if (state) {
                data.state = state;
            }
            if (postalCode) {
                data.postalCode = postalCode;
            }
            if (country) {
                data.country = country;
            }
            if (workPhoneNumbers) {
                data.workPhoneNumbers = workPhoneNumbers;
            }
            if (mobilePhoneNumbers) {
                data.mobilePhoneNumbers = mobilePhoneNumbers;
            }
            if (otherPhoneNumbers) {
                data.otherPhoneNumbers = otherPhoneNumbers;
            }
            if (jobTitle) {
                data.jobTitle = jobTitle;
            }
            if (eMail) {
                data.eMail = eMail;
            }
            if (tags) {
                data.tags = tags;
            }
            if (custom1) {
                data.custom1 = custom1;
            }
            if (custom2) {
                data.custom2 = custom2;
            }
            that.logger.log("internal", LOG_ID + "(createDirectoryEntry) args : ", data );
            that.http.post("/api/rainbow/directory/v1.0/entries", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createDirectoryEntry) successfull");
                that.logger.log("internal", LOG_ID + "(createDirectoryEntry) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createDirectoryEntry) error.");
                that.logger.log("internalerror", LOG_ID, "(createDirectoryEntry) error : ", err);
                return reject(err);
            });
        });
    }
    
    // delete all the entries in the directory of a company
    deleteCompanyDirectoryAllEntry (companyId : string) {
        // DELETE https://openrainbow.com/api/rainbow/directory/v1.0/companies/:companyId      
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/directory/v1.0/companies/" + companyId, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(deleteCompanyDirectoryAllEntry) (" + companyId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(deleteCompanyDirectoryAllEntry) (" + companyId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(deleteCompanyDirectoryAllEntry) (" + companyId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    // delete a directory entry
    deleteDirectoryEntry (entryId : string) {
        // DELETE https://openrainbow.com/api/rainbow/directory/v1.0/entries/:entryId      
        let that = this;
        return new Promise((resolve, reject) => {
            that.http.delete("/api/rainbow/directory/v1.0/entries/" + entryId, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(deleteDirectoryEntry) (" + entryId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(deleteDirectoryEntry) (" + entryId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(deleteDirectoryEntry) (" + entryId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    // Get a directory entry data
    getDirectoryEntryData (entryId : string, format : string) {
        // GET  https://openrainbow.com/api/rainbow/directory/v1.0/entries/:entryId 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/directory/v1.0/entries/" + entryId ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getDirectoryEntryData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getDirectoryEntryData) successfull");
                that.logger.log("internal", LOG_ID + "(getDirectoryEntryData) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getDirectoryEntryData) error");
                that.logger.log("internalerror", LOG_ID, "(getDirectoryEntryData) error : ", err);
                return reject(err);
            });
        });
    }

    // Get a list of directory entries data
    getListDirectoryEntriesData (companyId : string, 
                                 organisationIds : string, 
                                 name : string, 
                                 search : string, 
                                 type : string, 
                                 companyName : string, 
                                 phoneNumbers : string, 
                                 fromUpdateDate : Date, 
                                 toUpdateDate : Date, 
                                 tags  : string, 
                                 format : string, 
                                 limit : number, 
                                 offset : number, 
                                 sortField : string,
                                 sortOrder : number,
                                 view : string) {
        // API https://api.openrainbow.org/directory/#api-directory-GetDirectoryList
        // GET  https://openrainbow.com/api/rainbow/directory/v1.0/entries 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/directory/v1.0/entries" ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "organisationIds", organisationIds);
            addParamToUrl(urlParamsTab, "name", name);
            addParamToUrl(urlParamsTab, "search", search);
            addParamToUrl(urlParamsTab, "type", type);
            addParamToUrl(urlParamsTab, "companyName", companyName);
            addParamToUrl(urlParamsTab, "phoneNumbers", phoneNumbers);
            addParamToUrl(urlParamsTab, "fromUpdateDate", fromUpdateDate ? fromUpdateDate.toJSON() : "");
            addParamToUrl(urlParamsTab, "toUpdateDate", toUpdateDate ? toUpdateDate.toJSON() : "");
            addParamToUrl(urlParamsTab, "tags", tags);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit + "");
            addParamToUrl(urlParamsTab, "offset", offset + "");
            addParamToUrl(urlParamsTab, "sortField", sortField);
            addParamToUrl(urlParamsTab, "sortOrder", sortOrder + "");
            addParamToUrl(urlParamsTab, "view", view );
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getListDirectoryEntriesData) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getListDirectoryEntriesData) successfull");
                that.logger.log("internal", LOG_ID + "(getListDirectoryEntriesData) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getListDirectoryEntriesData) error");
                that.logger.log("internalerror", LOG_ID, "(getListDirectoryEntriesData) error : ", err);
                return reject(err);
            });
        });
    }

    // Update a directory entry
    updateDirectoryEntry(entryId: string,
                         firstName: string,
                         lastName: string,
                         companyName: string,
                         department: string,
                         street: string,
                         city: string,
                         state: string,
                         postalCode: string,
                         country: string,
                         workPhoneNumbers: string[],
                         mobilePhoneNumbers: string[],
                         otherPhoneNumbers: string[],
                         jobTitle: string,
                         eMail: string,
                         tags: string[],
                         custom1: string,
                         custom2: string) {
        // PUT https://openrainbow.com/api/rainbow/directory/v1.0/entries/:entryId
        let that = this;
        let data : any = {};
        
        if (firstName) {
            data.firstName = firstName;
        }
        if (lastName) {
            data.lastName = lastName;
        }
        if (companyName) {
            data.companyName = companyName;
        }
        if (department) {
            data.department = department;
        }
        if (street) {
            data.street = street;
        }
        if (city) {
            data.city = city;
        }
        if (state) {
            data.state = state;
        }
        if (postalCode) {
            data.postalCode = postalCode;
        }
        if (country) {
            data.country = country;
        }
        if (workPhoneNumbers) {
            data.workPhoneNumbers = workPhoneNumbers;
        }
        if (mobilePhoneNumbers) {
            data.mobilePhoneNumbers = mobilePhoneNumbers;
        }
        if (otherPhoneNumbers) {
            data.otherPhoneNumbers = otherPhoneNumbers;
        }
        if (jobTitle) {
            data.jobTitle = jobTitle;
        }
        if (eMail) {
            data.eMail = eMail;
        }
        if (tags) {
            data.tags = tags;
        }
        if (custom1) {
            data.custom1 = custom1;
        }
        if (custom2) {
            data.custom2 = custom2;
        }
        
        return new Promise(function (resolve, reject) {
            that.logger.log("internal", LOG_ID + "(updateDirectoryEntry) REST data params : ", data);

            that.http.put("/api/rainbow/directory/v1.0/entries/" + entryId, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateDirectoryEntry) successfull");
                that.logger.log("internal", LOG_ID + "(updateDirectoryEntry) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateDirectoryEntry) error");
                that.logger.log("internalerror", LOG_ID, "(updateDirectoryEntry) error : ", err);
                return reject(err);
            });
        });
    }

    ImportDirectoryCsvFile = function(companyId, csvContent, label) {
        // POST  https://openrainbow.com/api/rainbow/directories/imports?companyId=:companyId  
        let that = this;
        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/massprovisioning/v1.0/directories/imports"
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "label", label);
            url = urlParamsTab[0];

            let data = csvContent;
            that.logger.log("internal", LOG_ID + "(ImportDirectoryCsvFile) args : ", data );
            that.http.post(url, that.getPostHeader("text/csv"), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(ImportDirectoryCsvFile) successfull");
                that.logger.log("internal", LOG_ID + "(ImportDirectoryCsvFile) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(ImportDirectoryCsvFile) error.");
                that.logger.log("internalerror", LOG_ID, "(ImportDirectoryCsvFile) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion directory
    
    //region directory tags
    // List all tags assigned to directory entries
    getAllTagsAssignedToDirectoryEntries (companyId : string) {
        // GET  https://openrainbow.com/api/rainbow/directory/v1.0/entries/tags 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/directory/v1.0/entries/tags" + companyId ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getAllTagsAssignedToDirectoryEntries) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getAllTagsAssignedToDirectoryEntries) successfull");
                that.logger.log("internal", LOG_ID + "(getAllTagsAssignedToDirectoryEntries) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getAllTagsAssignedToDirectoryEntries) error");
                that.logger.log("internalerror", LOG_ID, "(getAllTagsAssignedToDirectoryEntries) error : ", err);
                return reject(err);
            });
        });
    }

    // Remove a given tag from all the directory entries
    removeTagFromAllDirectoryEntries (companyId : string, tag  : string) {
        // DELETE https://openrainbow.com/api/rainbow/directory/v1.0/entries/tags      
        let that = this;
        return new Promise((resolve, reject) => {
            let url = "/api/rainbow/directory/v1.0/entries/tags";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "tag", tag);
            url = urlParamsTab[0];

            that.http.delete(url, that.getRequestHeader())
                    .then((response) => {
                        that.logger.log("info", LOG_ID + "(removeTagFromAllDirectoryEntries) (" + companyId + ") -- success");
                        resolve(response);
                    })
                    .catch((err) => {
                        that.logger.log("error", LOG_ID, "(removeTagFromAllDirectoryEntries) (" + companyId + ") -- failure -- ");
                        that.logger.log("internalerror", LOG_ID, "(removeTagFromAllDirectoryEntries) (" + companyId + ") -- failure -- ", err.message);
                        return reject(err);
                    });
        });
    }

    // Rename a tag for all assigned directory entries
    renameTagForAllAssignedDirectoryEntries (tag  : string, companyId : string, newTagName : string) {
        // PUT https://openrainbow.com/api/rainbow/directory/v1.0/entries/tags
        let that = this;

        return new Promise(function (resolve, reject) {
            let url = "/api/rainbow/directory/v1.0/entries/tags";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "companyId", companyId);
            addParamToUrl(urlParamsTab, "tag", tag);
            url = urlParamsTab[0];

            let data = {
                newTagName
            };

            that.http.put("/api/rainbow/directory/v1.0/entries/tags", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(renameTagForAllAssignedDirectoryEntries) successfull");
                that.logger.log("internal", LOG_ID + "(renameTagForAllAssignedDirectoryEntries) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(renameTagForAllAssignedDirectoryEntries) error");
                that.logger.log("internalerror", LOG_ID, "(renameTagForAllAssignedDirectoryEntries) error : ", err);
                return reject(err);
            });
        });
    }

    // Return stats regarding tags of directory entries
    getStatsRegardingTagsOfDirectoryEntries (companyId : string) {
        // GET  https://openrainbow.com/api/rainbow/directory/v1.0/entries/tags/stats
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/directory/v1.0/entries/tags/stats" ;
            addParamToUrl([url], "companyId", companyId);
            url = url[0];

            that.logger.log("internal", LOG_ID + "(getStatsRegardingTagsOfDirectoryEntries) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getStatsRegardingTagsOfDirectoryEntries) successfull");
                that.logger.log("internal", LOG_ID + "(getStatsRegardingTagsOfDirectoryEntries) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getStatsRegardingTagsOfDirectoryEntries) error");
                that.logger.log("internalerror", LOG_ID, "(getStatsRegardingTagsOfDirectoryEntries) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion directory tags

    //endregion Rainbow Company Directory portal
    
    //region Rainbow Bubbles Polls

    createBubblePoll(roomId 	: string, title : string, questions 	: Array <{ text: string, multipleChoice: boolean, answers: Array<{ text : string }> }>, anonymous : boolean = false, duration : number = 0) {
        // API https://api.openrainbow.org/enduser/#api-polls-Create_poll
        // POST /api/rainbow/enduser/v1.0/polls
        
        let that = this;
        return new Promise(function (resolve, reject) {
            let data : any = {};

            if (roomId) {
                data.roomId = roomId;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            
            if (title) {
                data.title = title;
            }

            if (questions) {
                data.questions = questions;
            }

            if (anonymous != undefined) {
                data.anonymous = anonymous;
            }

            if (duration != undefined) {
                data.duration = duration;
            }

            that.logger.log("internal", LOG_ID + "(createBubblePoll) args : ", data );
            that.http.post("/api/rainbow/enduser/v1.0/polls", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(createBubblePoll) successfull");
                that.logger.log("internal", LOG_ID + "(createBubblePoll) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(createBubblePoll) error.");
                that.logger.log("internalerror", LOG_ID, "(createBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    deleteBubblePoll(pollId) {
        // API https://api.openrainbow.org/enduser/#api-polls-Delete_poll
        // DELETE /api/rainbow/enduser/v1.0/polls/:pollId
        
        let that = this;
        return new Promise(function (resolve, reject) {
            if (!pollId) {
                that.logger.log("debug", LOG_ID + "(deleteBubblePoll) failed");
                that.logger.log("info", LOG_ID + "(deleteBubblePoll) No pollId provided");
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            } else {
                that.http.delete("/api/rainbow/enduser/v1.0/polls/" + pollId, that.getRequestHeader()).then(function (json) {
                    that.logger.log("debug", LOG_ID + "(deleteBubblePoll) successfull");
                    that.logger.log("internal", LOG_ID + "(deleteBubblePoll) REST result : ", json);
                    resolve(json.data);
                }).catch(function (err) {
                    that.logger.log("error", LOG_ID, "(deleteBubblePoll) error");
                    that.logger.log("internalerror", LOG_ID, "(deleteBubblePoll) error : ", err);
                    return reject(err);
                });
            }
        });
    }
    
    getBubblePoll(pollId : string, format : string = "small") {
        // API https://api.openrainbow.org/enduser/#api-polls-Get_a_poll
        // GET /api/rainbow/enduser/v1.0/polls/:pollId 
        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/enduser/v1.0/polls/" + pollId ;
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "format", format);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getBubblePoll) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getBubblePoll) successfull");
                that.logger.log("internal", LOG_ID + "(getBubblePoll) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getBubblePoll) error");
                that.logger.log("internalerror", LOG_ID, "(getBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }
    
    getBubblePollsByBubble (roomId : string, format : string = "small", limit : number = 100, offset : number) {
        // API https://api.openrainbow.org/enduser/#api-polls-Get_polls
        // GET /api/rainbow/enduser/v1.0/polls

        let that = this;
        return new Promise(function (resolve, reject) {
            let url : string = "/api/rainbow/enduser/v1.0/polls";
            let urlParamsTab : string[]= [];
            urlParamsTab.push(url);
            addParamToUrl(urlParamsTab, "roomId", roomId);
            addParamToUrl(urlParamsTab, "format", format);
            addParamToUrl(urlParamsTab, "limit", limit);
            addParamToUrl(urlParamsTab, "offset", offset);
            url = urlParamsTab[0];

            that.logger.log("internal", LOG_ID + "(getBubblePollsByBubble) REST url : ", url);

            that.http.get(url, that.getRequestHeader(),undefined).then((json) => {
                that.logger.log("info", LOG_ID + "(getBubblePollsByBubble) successfull");
                that.logger.log("internal", LOG_ID + "(getBubblePollsByBubble) REST result : ", json);
                resolve(json);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(getBubblePollsByBubble) error");
                that.logger.log("internalerror", LOG_ID, "(getBubblePollsByBubble) error : ", err);
                return reject(err);
            });
        });
    }
    
    publishBubblePoll (pollId: string ) {
        // API https://api.openrainbow.org/enduser/#api-polls-Publish_poll
        // PUT /api/rainbow/enduser/v1.0/polls/:pollId/publish

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {
            };

            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId + "/publish", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(publishBubblePoll) successfull.");
                that.logger.log("internal", LOG_ID + "(publishBubblePoll) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(publishBubblePoll) error.");
                that.logger.log("internalerror", LOG_ID, "(publishBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }
    
    terminateBubblePoll (pollId: string ) {
        // API https://api.openrainbow.org/enduser/#api-polls-Terminate_poll
        // PUT /api/rainbow/enduser/v1.0/polls/:pollId/terminate

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {
            };

            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId + "/terminate", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(terminateBubblePoll) successfull.");
                that.logger.log("internal", LOG_ID + "(terminateBubblePoll) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(terminateBubblePoll) error.");
                that.logger.log("internalerror", LOG_ID, "(terminateBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }
    
    unpublishBubblePoll (pollId: string ) {
        // API https://api.openrainbow.org/enduser/#api-polls-Unpublish_poll
        // PUT /api/rainbow/enduser/v1.0/polls/:pollId/unpublish

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {
            };

            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId + "/unpublish", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(unpublishBubblePoll) successfull.");
                that.logger.log("internal", LOG_ID + "(unpublishBubblePoll) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(unpublishBubblePoll) error.");
                that.logger.log("internalerror", LOG_ID, "(unpublishBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }
    
    updateBubblePoll(pollId : string, roomId 	: string, title : string, questions 	: Array <{ text: string, multipleChoice: boolean, answers: Array<{ text : string }> }>, anonymous : boolean, duration : number) {
        // API https://api.openrainbow.org/enduser/#api-polls-Update_poll
        // PUT /api/rainbow/enduser/v1.0/polls/:pollId

        let that = this;
        return new Promise(function (resolve, reject) {
            let data : any = {};

            if (pollId) {
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }
            
            if (roomId) {
                data.roomId = roomId;
            } else {
                return reject(ErrorManager.getErrorManager().BAD_REQUEST);
            }

            if (title) {
                data.title = title;
            }

            if (questions) {
                data.questions = questions;
            }

            if (anonymous != undefined) {
                data.anonymous = anonymous;
            }

            if (duration) {
                data.duration = duration;
            }
            
            that.logger.log("internal", LOG_ID + "(updateBubblePoll) args : ", data );
            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId, that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(updateBubblePoll) successfull");
                that.logger.log("internal", LOG_ID + "(updateBubblePoll) REST result : ", json.data);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(updateBubblePoll) error.");
                that.logger.log("internalerror", LOG_ID, "(updateBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }
    
    votesForBubblePoll (pollId: string , votes : Array<{ question : number, answers : Array <number> }>) {
        // API https://api.openrainbow.org/enduser/#api-polls-Votes_for_a_poll
        // PUT /api/rainbow/enduser/v1.0/polls/:pollId/vote

        let that = this;
        return new Promise(function (resolve, reject) {
            let data: any = {
                votes
            };

            that.http.put("/api/rainbow/enduser/v1.0/polls/" + pollId + "/vote", that.getRequestHeader(), data, undefined).then(function (json) {
                that.logger.log("info", LOG_ID + "(votesForBubblePoll) successfull.");
                that.logger.log("internal", LOG_ID + "(votesForBubblePoll) REST result : ", json);
                resolve(json.data);
            }).catch(function (err) {
                that.logger.log("error", LOG_ID, "(votesForBubblePoll) error.");
                that.logger.log("internalerror", LOG_ID, "(votesForBubblePoll) error : ", err);
                return reject(err);
            });
        });
    }

    //endregion Rainbow Bubbles Polls
    
    //region Conference v2
    addPSTNParticipantToConference(roomId : string, participantPhoneNumber : string, country : string) {
        let that = this;
        return that.restConferenceV2.addPSTNParticipantToConference(roomId, participantPhoneNumber, country);
    }

    askConferenceSnapshotV2(roomId : string, limit : number = 100,  offset : number = 0) {
        let that = this;
        return that.snapshotConference(roomId, limit, offset);
    }

    snapshotConference(roomId : string, limit : number = 100,  offset : number = 0) {
        let that = this;
        return that.restConferenceV2.snapshotConference(roomId, limit, offset);
    }

    delegateConference(roomId : string, userId : string) {
        let that = this;
        return that.restConferenceV2.delegateConference(roomId, userId);
    }

    disconnectPSTNParticipantFromConference(roomId : string) {
        let that = this;
        return that.restConferenceV2.disconnectPSTNParticipantFromConference(roomId);
    }

    disconnectParticipantFromConference(roomId : string, userId : string) {
        let that = this;
        return that.restConferenceV2.disconnectParticipantFromConference(roomId, userId );
    }

    getTalkingTimeForAllPparticipantsInConference(roomId : string, limit : number = 100,  offset : number = 0) {
        let that = this;
        return that.restConferenceV2.getTalkingTimeForAllPparticipantsInConference(roomId, limit,  offset );
    }

    joinConferenceV2(roomId: string, participantPhoneNumber: string = undefined, country: string = undefined, deskphone : boolean = false, dc: Array<string> = undefined, mute: boolean = false, microphone: boolean = false, media : Array<string> = undefined) {
        let that = this;
        return that.restConferenceV2.joinConference(roomId, participantPhoneNumber, country, deskphone, dc, mute, microphone, media);
    }

    pauseRecording(roomId : string) {
        let that = this;
        return that.restConferenceV2.pauseRecording(roomId);
    }

    resumeRecording(roomId : string) {
        let that = this;
        return that.restConferenceV2.resumeRecording(roomId);
    }

    startRecording(roomId : string) {
        let that = this;
        return that.restConferenceV2.startRecording(roomId);
    }

    stopRecording(roomId : string) {
        let that = this;
        return that.restConferenceV2.stopRecording(roomId);
    }

    rejectAVideoConference(roomId : string) {
        let that = this;
        return that.restConferenceV2.rejectAVideoConference(roomId);
    }

//Start a PSTN, WebRTC conference or a webinar in a room  () {
    startConferenceOrWebinarInARoom(roomId : string) {
        let that = this;
        return that.restConferenceV2.startConferenceOrWebinarInARoom(roomId);
    }

    stopConferenceOrWebinar(roomId : string) {
        let that = this;
        return that.restConferenceV2.stopConferenceOrWebinar(roomId);
    }

    subscribeForParticipantVideoStream(roomId : string, userId : string, media : string = "video", subStreamLevel : number = 0, dynamicFeed : boolean = false ) {
        let that = this;
        return that.restConferenceV2.subscribeForParticipantVideoStream(roomId, userId, media, subStreamLevel, dynamicFeed);
    }

    updatePSTNParticipantParameters(roomId : string, phoneNumber : string, option : string = " unmute") {
        let that = this;
        return that.restConferenceV2.updatePSTNParticipantParameters(roomId, phoneNumber, option);
    }

    updateConferenceParameters(roomId : string, option : string = "unmute") {
        let that = this;
        return that.restConferenceV2.updateConferenceParameters(roomId, option);
    }

    updateParticipantParameters(roomId : string, userId : string, option : string, media : string, bitRate : number, subStreamLevel : number, publisherId : string ) {
        let that = this;
        return that.restConferenceV2.updateParticipantParameters(roomId, userId, option, media, bitRate, subStreamLevel, publisherId );
    }

    allowTalkWebinar(roomId : string, userId : string) {
        let that = this;
        return that.restConferenceV2.allowTalkWebinar(roomId, userId);
    }

    disableTalkWebinar(roomId : string, userId : string) {
        let that = this;
        return that.restConferenceV2.disableTalkWebinar(roomId, userId);
    }

    lowerHandWebinar(roomId : string) {
        let that = this;
        return that.restConferenceV2.lowerHandWebinar(roomId);
    }

    raiseHandWebinar(roomId : string) {
        let that = this;
        return that.restConferenceV2.raiseHandWebinar(roomId);
    }

    stageDescriptionWebinar(roomId : string, userId : string, type : string, properties : Array<string>) {
        let that = this;
        return that.restConferenceV2.stageDescriptionWebinar(roomId, userId, type, properties);
    }

    //endregion Conference v2
    
    //region Webinar

    createWebinar(name : string,
                  subject : string,
                  waitingRoomStartDate: Date,
                  webinarStartDate : Date,
                  webinarEndDate : Date,
                  reminderDates : Array<Date>,
                  timeZone : string,
                  register : boolean,
                  approvalRegistrationMethod : string,
                  passwordNeeded : boolean,
                  isOrganizer : boolean,
                  waitingRoomMultimediaURL : Array<string>,
                  stageBackground : string,
                  chatOption : string ) {
        let that = this;
        return that.restWebinar.createWebinar(name,
                subject,
                waitingRoomStartDate,
                webinarStartDate,
                webinarEndDate,
                reminderDates,
                timeZone,
                register,
                approvalRegistrationMethod,
                passwordNeeded,
                isOrganizer,
                waitingRoomMultimediaURL,
                stageBackground,
                chatOption);
    }

    updateWebinar(webinarId : string,
                  name : string,
                  subject : string,
                  waitingRoomStartDate: Date,
                  webinarStartDate : Date,
                  webinarEndDate : Date,
                  reminderDates : Array<Date>,
                  timeZone : string,
                  register : boolean,
                  approvalRegistrationMethod : string,
                  passwordNeeded : boolean,
                  isOrganizer : boolean,
                  waitingRoomMultimediaURL : Array<string>,
                  stageBackground : string,
                  chatOption : string) {
        let that = this;
        return that.restWebinar.updateWebinar(webinarId,
                name,
                subject,
                waitingRoomStartDate,
                webinarStartDate,
                webinarEndDate,
                reminderDates,
                timeZone,
                register,
                approvalRegistrationMethod,
                passwordNeeded,
                isOrganizer,
                waitingRoomMultimediaURL,
                stageBackground,
                chatOption);
    }

    getWebinarData(webinarId : string ) {
        let that = this;
        return that.restWebinar.getWebinarData(webinarId );
    }

    getWebinarsData(role  : string) {
        let that = this;
        return that.restWebinar.getWebinarsData(role );
    }

    warnWebinarModerators(webinarId : string) {
        let that = this;
        return that.restWebinar.warnWebinarModerators(webinarId );
    }

    publishAWebinarEvent(webinarId : string) {
        let that = this;
        return that.restWebinar.publishAWebinarEvent(webinarId );
    }

    deleteWebinar(webinarId : string) {
        let that = this;
        return that.restWebinar.deleteWebinar(webinarId );
    }

    //endregion Webinar
}

export {RESTService, MEDIATYPE, GuestParams};
module.exports.RESTService = RESTService;
module.exports.MEDIATYPE = MEDIATYPE;
module.exports.GuestParams = GuestParams;
